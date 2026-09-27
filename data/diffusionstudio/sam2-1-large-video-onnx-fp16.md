# diffusionstudio/sam2.1-large-video-onnx-fp16

## Resumen

Este repositorio contiene una exportación a ONNX en fp16 del modelo de segmentación y seguimiento de vídeo SAM 2.1 en su variante Hiera-Large, publicada por diffusionstudio. No es un modelo nuevo ni un reentrenamiento: es una conversión del modelo base facebook/sam2.1-hiera-large, portado desde transformers 5.17 (`Sam2VideoModel`), que descompone el tracker completo de vídeo en cinco grafos ONNX de forma fija, pensados para ejecutarse con ONNX Runtime Web sobre WebGPU directamente en el navegador. El paquete incluye el codificador de visión, el decodificador de máscaras, el codificador de memoria, la atención sobre memoria y la tabla de posiciones de los object pointers.

El problema que resuelve es de despliegue: SAM 2.1 original se distribuye como checkpoint PyTorch y requiere infraestructura de servidor, mientras que esta versión permite segmentar y rastrear objetos en vídeo de forma local, sin enviar el material a un servidor, lo cual es relevante para herramientas de edición de vídeo en cliente. Diffusion Studio lo usa internamente como motor de su herramienta de máscaras de objeto. La entrada es de 1024×1024 píxeles (la resolución de entrenamiento de SAM 2), las características de imagen resultantes son de 64×64 y el banco de memoria conserva el fotograma con prompt, los 6 fotogramas rastreados más recientes y 16 object pointers.

La relevancia actual es doble: por un lado demuestra que un tracker de vídeo con memoria se puede empaquetar en grafos ONNX estáticos y ejecutar en WebGPU; por otro, el coste es alto (4,5 segundos por fotograma en una GPU Apple M1 de 8 núcleos), de modo que su uso realista es procesado por lotes o preview interactivo, no tiempo real. El repositorio ocupa 0,5 GB y tiene licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1: codificador de imagen Hiera + memoria (memory encoder y memory attention) + decodificador de mascaras con object pointers; exportado como 5 grafos ONNX de forma fija |
| Parametros totales | no disponible en la model card; el repositorio ocupa 0,5 GB en fp16 (estimacion no oficial: del orden de 250 M de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; ventana de memoria temporal de 7 fotogramas (el fotograma con prompt mas los 6 mas recientes) y 16 object pointers, lo que da R = 7·64² + 64 = 28.736 tokens de memoria |
| Tipos de cuantizacion | fp16 (pesos y computo); entradas y salidas en float32 con una conversion en cada frontera de grafo; los position encodings independientes de la entrada se calculan en float32 en tiempo de exportacion |
| Idiomas soportados | no disponible / no aplica (modelo de vision, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (5 grafos: `vision_encoder.onnx`, `mask_decoder.onnx`, `memory_encoder.onnx`, `memory_attention.onnx`, `pointer_tpos.onnx`) mas `constants.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SAM 2.1: un codificador de imagen jerarquico Hiera que produce caracteristicas multiescala (`feats0 [1,32,256,256]`, `feats1 [1,64,128,128]`, `feats2 [1,256,64,64]`), un decodificador de mascaras que acepta puntos y etiquetas (`input_points [1,1,N,2]` en pixeles de la entrada de 1024, `input_labels [1,1,N]` en int32) y devuelve una mascara de baja resolucion de 256×256, otra de alta resolucion de 1024×1024, una prediccion de IoU, un logit de score de objeto y un object pointer de 256 dimensiones. El seguimiento temporal se apoya en un banco de memoria: el codificador de memoria transforma las caracteristicas y la mascara en tokens de memoria (`[F²,1,64]`, con F = 64), la atencion sobre memoria condiciona las caracteristicas del fotograma actual con esa memoria y `pointer_tpos.onnx` genera las posiciones temporales de los object pointers a partir de diferencias normalizadas entre fotogramas. La tabla de posiciones temporales de 7×64 codifica el fotograma con prompt en la fila 6 y la memoria k fotogramas atras en la fila k − 1.

El decodificador replica el comportamiento del predictor de vídeo: considera varias mascaras candidatas cuando hay como maximo un punto real (todos los fotogramas rastreados y el caso de un solo clic) y, en caso contrario, usa una unica mascara con el mecanismo de respaldo por estabilidad. Las mascaras y los object pointers se suprimen dentro del grafo cuando `object_score_logits ≤ 0`, lo que implementa el manejo de oclusiones de SAM 2. Esta ficha no documenta el entrenamiento: el repositorio describe unicamente el proceso de exportacion (`packages/sam2/scripts/export.py`, invocado como `export.py large 1024 7 <out-dir>`), siguiendo la disposicion de grafos de square-zero-labs/sam2.1-tiny-video-onnx. Los datos de entrenamiento, el numero de tokens y el uso de RLHF o DPO corresponden al modelo base y no se detallan aqui.

## Capacidades

- Segmentacion de objetos en imagen y en vídeo a partir de prompts: clics puntuales (positivos y negativos) y otras formas de indicacion admitidas por el decodificador de SAM 2.1.
- Seguimiento temporal de objetos a lo largo de un vídeo mediante banco de memoria, propagando la mascara fotograma a fotograma.
- Manejo de oclusiones: supresion de mascara y de object pointer cuando el score de objeto es menor o igual que cero.
- Estimacion de calidad de la mascara mediante el logit de IoU (`iou [1,1]`), util para filtrar resultados poco fiables.
- Salida en dos resoluciones: mascara de baja resolucion (256×256, logits del decodificador) y mascara de alta resolucion (1024×1024).
- Ejecucion en navegador con ONNX Runtime Web sobre WebGPU, en fp16, sin backend de servidor.
- Inferencia local, lo que evita subir el material de vídeo a un servicio externo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades de audio o de vision general (clasificacion, VQA).
- No dispone de tool calling ni de soporte de agentes en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Rotoscopia en editor de vídeo en el navegador: el usuario hace clic sobre un objeto y el modelo propaga la mascara por el clip; es el caso de uso real declarado, ya que Diffusion Studio lo integra como motor de su herramienta de mascaras de objeto y todo el computo ocurre en el cliente.
- Segmentacion de material sensible sin salida de datos: al ejecutarse en WebGPU local, permite procesar vídeo medico, de vigilancia o con derechos de imagen sin enviarlo a un servidor externo.
- Generacion de mascaras para composicion y efectos: la salida de alta resolucion (1024×1024) sirve para recortar sujetos y aplicar fondos, correccion de color o desenfoques selectivos por capas.
- Anotacion de datasets de vídeo: el tracker genera mascaras iniciales que un anotador corrige despues, reduciendo el coste de etiquetado en tareas de segmentacion de vídeo.
- Analisis deportivo: seguimiento de jugadores o del balon fotograma a fotograma en grabaciones, con la prediccion de IoU como filtro para descartar fotogramas donde el seguimiento se degrada.
- Edicion asistida en aplicaciones web sin backend de GPU: al distribuirse como cinco grafos ONNX de forma fija, se puede empaquetar en una aplicacion Electron o web y ejecutar en el equipo del usuario.
- Procesado por lotes de clips cortos: dado el coste de 4,5 s por fotograma en una GPU M1 de 8 nucleos, encaja en flujos offline donde la precision prima sobre la latencia, por ejemplo preparacion nocturna de mascaras para un proyecto de montaje.
- Previsualizacion interactiva con la variante Hiera-Tiny: combinando ambos repositorios del mismo autor se puede usar la version rapida (512 de entrada, 0,3 s por fotograma) para ajustar el prompt y la version Large para el render final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (J&F, IoU, MMLU u otros) en la informacion disponible. La model card solo incluye una medicion de velocidad del bucle completo de seguimiento, realizada con ONNX Runtime Web 1.30 sobre WebGPU en un Apple M1 con GPU de 8 nucleos y el equipo enchufado a la corriente:

| Configuracion | Tiempo por fotograma rastreado |
|---|---|
| Hiera-Large, entrada 1024, fp16 | 4,5 s |
| Hiera-Tiny, entrada 512, fp16 | 0,3 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Los pesos en fp16 ocupan aproximadamente 0,5 GB (tamano del repositorio); sumando activaciones y buffers de memoria (caracteristicas de imagen, tokens de memoria de 28.736 elementos y las mascaras de 1024×1024) se estima un consumo total por debajo de 2 GB, aunque es una estimacion y no un dato publicado.
- GPU recomendadas: el autor ha validado el modelo en una GPU Apple M1 de 8 nucleos mediante WebGPU. No se publican mediciones en A100, H100, RTX 4090 ni en otras GPU de escritorio.
- Cabe en GPU de consumo: si, el caso medido es una GPU integrada de Apple de gama de entrada. Al desconocerse el consumo exacto de memoria, no se puede confirmar el encaje en tarjetas con menos de 4 GB de VRAM.
- Opciones de despliegue: ONNX Runtime Web 1.30 con WebGPU (navegador, caso documentado); los grafos ONNX tambien son ejecutables con otros proveedores de ONNX Runtime (CPU, CUDA, TensorRT, DirectML), aunque el autor no documenta ni mide esas rutas. No es compatible con llama.cpp, Ollama, vLLM ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: 4,5 s por fotograma en el caso medido (Hiera-Large, 1024 de entrada, fp16), lo que equivale a menos de 0,25 fotogramas por segundo. No hay datos de throughput en lote ni de latencia en GPU de servidor.

## Comparativa con modelos similares

| Modelo | Entrada | Parametros | Formato | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| diffusionstudio/sam2.1-large-video-onnx-fp16 | 1024×1024 | no disponible (repo de 0,5 GB en fp16) | ONNX fp16, 5 grafos | 4,5 s por fotograma en Apple M1 (8 nucleos, WebGPU) | apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| diffusionstudio/sam2.1-tiny-video-onnx-fp16 | 512×512 | no disponible | ONNX fp16 | 0,3 s por fotograma en Apple M1 (8 nucleos, WebGPU) | no disponible en la informacion | HuggingFace (referenciado por el autor) |
| facebook/sam2.1-hiera-large | 1024×1024 | no disponible en la informacion | PyTorch (checkpoint original) | no disponible | apache-2.0 | HuggingFace, modelo base |
| square-zero-labs/sam2.1-tiny-video-onnx | no disponible | no disponible | ONNX | no disponible | no disponible en la informacion | HuggingFace; solo se referencia como origen de la disposicion de grafos |

Los datos de parametros y rendimiento de las alternativas no estan incluidos en la informacion proporcionada, por lo que la comparacion se limita al formato, la resolucion de entrada, la licencia y la velocidad medida para las dos variantes de diffusionstudio.

## Limitaciones y advertencias

- Formas fijas: los cinco grafos estan exportados para una entrada de 1024×1024, un lote de 1 y un numero concreto de memorias (7 fotogramas). Cambiar la resolucion, el tamano de lote o el numero de fotogramas de memoria exige volver a exportar con `export.py`.
- Precision fp16: los pesos y el computo se realizan en media precision, con conversion a float32 en cada frontera de grafo; puede haber perdida de precision numerica en mascaras finas o en objetos de bajo contraste respecto al checkpoint original.
- Velocidad: 4,5 s por fotograma en el unico hardware medido hace inviable el uso en tiempo real o en vídeo de alta duracion sin procesado por lotes.
- Memoria limitada: el banco conserva el fotograma con prompt y los 6 mas recientes, por lo que tras una oclusion larga el modelo puede perder la identidad del objeto.
- Riesgo de error de seguimiento: como cualquier tracker, puede derivar hacia objetos con apariencia similar; la prediccion de IoU y el score de objeto ayudan a detectarlo, pero no lo eliminan.
- Sin datos publicados de evaluacion de calidad: no hay resultados de J&F ni de IoU en la informacion disponible, y el repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- Sesgos: no disponibles. Al ser un modelo de segmentacion, los sesgos relevantes serian los del dataset de entrenamiento del modelo base (facebook/sam2.1-hiera-large) y no se documentan aqui.
- Idioma: no aplica; el modelo no procesa texto, por lo que no hay soporte multilingue que evaluar.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base facebook/sam2.1-hiera-large antes de desplegarlo en produccion.
- Dependencia de WebGPU: el caso documentado depende de ONNX Runtime Web 1.30 con WebGPU, de modo que en navegadores o equipos sin ese soporte habria que recurrir a otros proveedores de ejecucion no validados por el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/diffusionstudio/sam2.1-large-video-onnx-fp16
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-large
- Variante Hiera-Tiny de 512 de entrada del mismo autor: https://huggingface.co/diffusionstudio/sam2.1-tiny-video-onnx-fp16
- Modelo de referencia para la disposicion de grafos: https://huggingface.co/square-zero-labs/sam2.1-tiny-video-onnx
- Organizacion Diffusion Studio en GitHub: https://github.com/diffusionstudio
- Script de exportacion: `packages/sam2/scripts/export.py` en el repositorio de Diffusion Studio (invocacion: `export.py large 1024 7 <out-dir>`)
