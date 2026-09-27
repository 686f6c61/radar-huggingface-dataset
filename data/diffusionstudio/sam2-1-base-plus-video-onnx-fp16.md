# diffusionstudio/sam2.1-base-plus-video-onnx-fp16

## Resumen

SAM 2.1 Hiera-Base+ video ONNX fp16 es una conversión a ONNX del modelo de segmentación y seguimiento de objetos en vídeo `facebook/sam2.1-hiera-base-plus`, publicada por Diffusion Studio. El repositorio no contiene pesos en formato PyTorch, sino cinco grafos ONNX de forma fija (vision encoder, mask decoder, memory encoder, memory attention y pointer temporal position encoding) pensados para ejecutarse con ONNX Runtime sobre WebGPU directamente en el navegador. El modelo se usa internamente en la herramienta de máscaras de objeto de Diffusion Studio.

La conversión parte del port a `transformers` (`Sam2VideoModel`, transformers 5.17) y sigue el diseño de grafos de `square-zero-labs/sam2.1-tiny-video-onnx`. Mantiene la resolución de entrada nativa de SAM 2 (1024×1024, con características de imagen de 64×64) y aplica cuantización fp16 tanto a pesos como a cómputo, con entradas y salidas en float32 y un cast en cada frontera de grafo. El banco de memoria reproduce el de SAM 2: el fotograma con prompt, los 6 fotogramas rastreados más recientes y 16 punteros de objeto.

La relevancia de esta ficha es doble: por un lado, permite ejecutar seguimiento de vídeo con memoria temporal sin GPU dedicada ni backend de servidor, ya que el destino declarado es WebGPU (medido en un Apple M1 de 8 núcleos de GPU); por otro, el repositorio ocupa solo 0,2 GB y la licencia Apache-2.0 facilita su integración en productos comerciales. No es un modelo de lenguaje: no genera texto, no soporta tool calling y no tiene ventana de contexto en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerárquico Hiera (vision encoder) + memory encoder, memory attention y mask decoder propios de SAM 2; exportado como 5 grafos ONNX de forma fija |
| Parametros totales | no disponible en la información proporcionada (variante base+ de la familia SAM 2.1) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; el banco de memoria abarca el fotograma con prompt, los 6 fotogramas rastreados más recientes y 16 punteros de objeto (R = 7·F² + 64, con F = 64) |
| Tipos de cuantizacion | fp16 (pesos y cómputo); entradas y salidas en float32 con cast en cada frontera de grafo; no se publican variantes int8, GGUF ni AWQ |
| Idiomas soportados | no disponible / no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (5 grafos: `vision_encoder.onnx`, `mask_decoder.onnx`, `memory_encoder.onnx`, `memory_attention.onnx`, `pointer_tpos.onnx`) más `constants.json` |
| Resolucion de entrada | 1024×1024 (características de imagen 64×64) |
| Tamaño del repositorio | 0,2 GB |
| Modelo base | facebook/sam2.1-hiera-base-plus |
| Libreria declarada | sam2 (exportado desde el port `Sam2VideoModel` de transformers 5.17) |

## Arquitectura y entrenamiento

Esta publicación no entrena un modelo nuevo: es un reempaquetado de inferencia de `facebook/sam2.1-hiera-base-plus`. La arquitectura subyacente es la de SAM 2, que combina un codificador de imagen jerárquico tipo Hiera con un mecanismo de memoria para vídeo. El codificador de visión produce tres escalas de características (`feats0` a 256×256 con 32 canales, `feats1` a 128×128 con 64 canales y `feats2` a 64×64 con 256 canales), más una variante `feats2_no_mem` para el fotograma con prompt y los embeddings posicionales de visión.

El decodificador de máscaras recibe puntos y etiquetas (`input_points` en píxeles de la entrada de 1024 y `input_labels` int32 del mismo tamaño) y devuelve la máscara de baja resolución (256×256), la máscara de alta resolución (1024×1024), el IoU predicho, el logit de puntuación de objeto y un puntero de objeto de 256 dimensiones. El banco de memoria se gestiona con `memory_encoder.onnx` (que transforma características, máscara de alta resolución y logit de objeto en tokens de memoria de 64 dimensiones) y `memory_attention.onnx` (que condiciona las características de visión actuales con la memoria almacenada). `pointer_tpos.onnx` genera las posiciones temporales de los punteros a partir de diferencias normalizadas.

Detalles técnicos destacables: las codificaciones posicionales independientes de la entrada se calculan en float32 durante la exportación; el decodificador replica la lógica del predictor de vídeo (evalúa varias máscaras candidatas cuando hay como máximo un punto real, y recurre al fallback de estabilidad en caso contrario); las máscaras y los punteros de objeto se suprimen dentro del grafo cuando `object_score_logits ≤ 0`. La tabla de codificación posicional temporal es de 7×64 filas, donde el fotograma con prompt usa la fila 6 y la memoria de `k` fotogramas atrás usa la fila `k − 1`. No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF o DPO, ya que corresponden al modelo base de Meta.

## Capacidades

- Segmentación de objetos guiada por prompt en imágenes y vídeo: acepta puntos (con etiqueta positiva o negativa) sobre la entrada de 1024×1024 y devuelve máscaras de alta resolución (1024×1024) y de baja resolución (256×256).
- Seguimiento temporal de máscaras en vídeo: propaga la máscara a lo largo de los fotogramas usando el banco de memoria (fotograma con prompt más 6 fotogramas recientes).
- Manejo de oclusiones y reapariciones mediante los 16 punteros de objeto, que codifican la identidad del objeto a lo largo del tiempo.
- Puntuación de calidad implícita: el grafo devuelve un valor de IoU predicho y un logit de puntuación de objeto, que permite descartar máscaras poco fiables sin post-proceso externo.
- Supresión integrada de resultados inválidos: cuando el logit de puntuación de objeto es menor o igual que 0, las máscaras y los punteros se anulan dentro del propio grafo.
- Ejecución en navegador sobre WebGPU a través de ONNX Runtime Web, sin necesidad de servidor de inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y no genera texto.

## Casos de uso

- Rotoscoping y recorte de sujetos en herramientas de edición de vídeo en el navegador: es el uso real declarado por Diffusion Studio, ya que el modelo se integra en su herramienta de máscaras de objeto y se ejecuta en WebGPU sin backend.
- Generación de máscaras de seguimiento para composición y efectos visuales: se marca un punto sobre el sujeto en el fotograma inicial y el modelo propaga la máscara a los fotogramas siguientes, lo que evita rotoscopiar fotograma a fotograma.
- Anotación semiautomática de datasets de vídeo para entrenamiento de modelos de detección o segmentación: el seguimiento con memoria reduce el coste humano de etiquetado, y el IoU predicho permite filtrar automáticamente anotaciones dudosas.
- Análisis deportivo: seguimiento de jugadores o del balón a lo largo de una jugada usando el prompt en un fotograma y la memoria temporal para mantener la identidad del objeto pese a cruces y oclusiones.
- Vídeo vigilancia y conteo de objetos en el navegador: al ejecutarse sobre WebGPU, permite desplegar seguimiento en un cliente sin enviar el vídeo a un servidor, lo que ayuda con requisitos de privacidad.
- Edición asistida de vídeo vertical para redes sociales: recorte automático del sujeto principal sobre el que se reencuadra el vídeo, con la máscara de 1024×1024 como entrada a la etapa de composición.
- Investigación en segmentación de vídeo: sirve como referencia de conversión a ONNX de SAM 2.1 con memoria completa, útil para reproducir resultados con el script de exportación `packages/sam2/scripts/export.py`.

Es importante señalar que el rendimiento medido es de 2,6 s por fotograma rastreado en un Apple M1, por lo que los casos de uso en tiempo real interactivo exigen la variante Hiera-Tiny de 512 o hardware superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta mediciones de latencia del bucle de seguimiento completo, realizadas con ONNX Runtime Web 1.30 sobre WebGPU en un Apple M1 (GPU de 8 núcleos) conectado a la corriente:

| Configuracion | Resolucion de entrada | Precision | Tiempo por fotograma rastreado |
|---|---|---|---|
| Hiera-Base+ (este repositorio) | 1024 | fp16 | 2,6 s |
| Hiera-Tiny | 512 | fp16 | 0,3 s |

No hay datos publicados de J&F, J, F, IoU ni comparaciones con otros modelos de segmentación de vídeo en la información proporcionada.

## Requisitos de hardware

- Destino de ejecución declarado: ONNX Runtime Web con WebGPU. La medición de referencia se hizo en un Apple M1 (GPU de 8 núcleos), con 2,6 s por fotograma a 1024 de entrada y fp16.
- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 0,2 GB, lo que es coherente con pesos fp16 de un modelo de este tamaño; una estimación conservadora sitúa la inferencia en el rango de 1 a 2 GB de memoria de GPU contando activaciones intermedias (máscara de alta resolución de 1024×1024 y características de 256 canales a 64×64).
- GPU recomendadas: cualquier GPU con soporte WebGPU (Apple Silicon M1 o superior, GPUs integradas recientes, NVIDIA y AMD con drivers actualizados). No se publican requisitos para A100, H100 o RTX 4090 porque el objetivo del paquete es el cliente web.
- Cabe en GPU de consumo: sí, siempre que el navegador exponga WebGPU. No se documenta un umbral mínimo de VRAM.
- Opciones de despliegue: ONNX Runtime Web sobre WebGPU; alternativamente ONNX Runtime nativo con proveedores CUDA, DirectML o CoreML, aunque no están documentados por el autor. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 2,6 s por fotograma en Apple M1 a 1024 y fp16 (aproximadamente 0,38 fotogramas por segundo). Para vídeo a 24 o 30 fps haría falta hardware muy superior o la variante Tiny de 512 (0,3 s por fotograma, unos 3,3 fotogramas por segundo en el mismo equipo).

## Comparativa con modelos similares

| Modelo | Entrada | Formato | Tiempo por fotograma | Licencia | Notas |
|---|---|---|---|---|---|
| diffusionstudio/sam2.1-base-plus-video-onnx-fp16 | 1024×1024 | ONNX fp16 (5 grafos, WebGPU) | 2,6 s (Apple M1) | apache-2.0 | Seguimiento completo con memoria y punteros de objeto; máxima resolución de la familia |
| diffusionstudio/sam2.1-tiny-video-onnx-fp16 | 512×512 | ONNX fp16 (WebGPU) | 0,3 s (Apple M1) | no disponible | Misma canalización, prioriza velocidad sobre detalle |
| square-zero-labs/sam2.1-tiny-video-onnx | no disponible | ONNX | no disponible | no disponible | Referencia de diseño de grafos seguida por este repositorio |
| facebook/sam2.1-hiera-base-plus | 1024×1024 | safetensors (PyTorch, vía transformers `Sam2VideoModel`) | no disponible | apache-2.0 | Modelo base original; el repositorio de Diffusion Studio es una exportación suya |

Este repositorio no compite con modelos de lenguaje ni con detectores de objetos de texto: su categoría es la segmentación y el seguimiento de vídeo con prompts visuales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no admite instrucciones en lenguaje natural, no soporta tool calling ni razonamiento multi-paso. Cualquier expectativa en ese sentido es un error de categoría.
- Riesgo de deriva y falsos positivos: como todo modelo de segmentación, puede producir máscaras incorrectas o "alucinadas" en objetos poco definidos, fondos con texturas similares o cambios bruscos de iluminación. El logit de puntuación de objeto y el IoU predicho ayudan a filtrarlas, pero no las eliminan.
- Ventana de memoria acotada: el banco de memoria solo conserva 6 fotogramas recientes más 16 punteros de objeto. En oclusiones largas o cambios de apariencia fuertes, la identidad del objeto puede perderse y requerir una nueva interacción con prompt.
- Resolución fija de 1024×1024: los grafos son de forma fija, por lo que cualquier entrada debe redimensionarse. Esto limita el detalle en objetos pequeños dentro de planos amplios.
- Precisión numérica: los pesos y el cómputo en fp16 pueden introducir diferencias numéricas frente a la ejecución en float32 del modelo base, no cuantificadas en la información disponible.
- Dependencia de plataforma: el objetivo declarado es ONNX Runtime Web con WebGPU, cuya disponibilidad depende del navegador y del sistema operativo. No se documentan rutas de despliegue alternativas ni pruebas en CUDA.
- Licencia: apache-2.0, que permite uso comercial y modificación, siempre que se conserve el aviso de licencia. Conviene verificar la licencia del modelo base `facebook/sam2.1-hiera-base-plus` y de `square-zero-labs/sam2.1-tiny-video-onnx` antes de redistribuir.
- Madurez del repositorio: sin descargas ni valoraciones en el momento de la consulta y sin benchmarks publicados, por lo que la validación en producción corre por cuenta del integrador.
- Sesgos: no se documenta ningún análisis de sesgos. En modelos de visión, los sesgos de los datos de entrenamiento pueden traducirse en peor segmentación de determinados tonos de piel, tipos de cuerpo o contextos culturales, pero no hay datos publicados al respecto en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/diffusionstudio/sam2.1-base-plus-video-onnx-fp16
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-base-plus
- Variante rápida del mismo autor: https://huggingface.co/diffusionstudio/sam2.1-tiny-video-onnx-fp16
- Referencia de diseño de grafos: https://huggingface.co/square-zero-labs/sam2.1-tiny-video-onnx
- Organización en GitHub: https://github.com/diffusionstudio
- Script de exportación: `packages/sam2/scripts/export.py` del repositorio de Diffusion Studio, invocado como `export.py base-plus 1024 7 <out-dir>`
- Paper de SAM 2 (modelo base): https://arxiv.org/abs/2408.00714
- Repositorio oficial de SAM 2 de Meta: https://github.com/facebookresearch/sam2
