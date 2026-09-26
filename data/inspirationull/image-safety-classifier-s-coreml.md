# InspiratioNULL/image-safety-classifier-s-CoreML

## Resumen

`InspiratioNULL/image-safety-classifier-s-CoreML` es un clasificador de imagenes de tres clases (NSFW, NSFL y SFW) basado en la arquitectura SwiftFormer, publicado por el usuario InspiratioNULL como variante con artefactos Core ML del modelo original `OwenElliott/image-safety-classifier-s`. Su proposito es filtrar contenido no apto: pornografia o contenido altamente sugestivo (NSFW), gore o violencia explicita (NSFL) y contenido apto (SFW). El modelo pesa 5.652.374 parametros (la model card original declara 6,1 M para la variante "s", una discrepancia habitual entre el recuento del autor y el tensor real de safetensors) y esta disenado para despliegue en el borde o en aplicaciones con latencia critica.

La relevancia de esta publicacion concreta esta en los formatos: ademas de los pesos en safetensors, el repositorio incluye variantes ONNX en fp32 y fp16 con el preprocesado (normalizacion ImageNet y softmax) embebido en el grafo, y un script de conversion a Core ML que genera un paquete `mlpackage` para iOS y macOS con entrada de imagen RGB y salida `classLabel` y `classLabel_probs`. Esto permite integrarlo en pipelines de vision por computador y en aplicaciones nativas de Apple sin reimplementar el preprocesado.

El modelo pertenece a una familia de cuatro tamanos (xs, s, m, l) con precisiones declaradas de 97,76 %, 97,99 %, 98,06 % y 98,20 % respectivamente sobre el conjunto de evaluacion del autor. Se entrena sobre un dataset propietario de aproximadamente 320.000 imagenes extraidas de la web, con clases verificadas mediante `Marqo/nsfw-image-detection-384` y revision manual de los casos dudosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwiftFormer (family de clasificacion de imagenes, implementada en timm) |
| Parametros totales | 5.652.374 (safetensors); la model card declara 6,1 M para la variante "s" |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: entrada de imagen de 224x224 px, sin contexto textual |
| Tipos de cuantizacion | fp32 y fp16 en ONNX; fp16 opcional en la conversion Core ML; no se documenta int8 ni GGUF |
| Idiomas soportados | no disponible (clasificacion de imagenes; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (fp32 y fp16), Core ML `mlpackage` |
| Clases de salida | NSFL, NSFW, SFW |
| Resolucion de entrada | 224x224 px (resize bilineal) |
| Tamano del repositorio | ~0,1 GB |
| Libreria | timm (tambien ONNX Runtime y coremltools) |

## Arquitectura y entrenamiento

El modelo es un finetune de un backbone SwiftFormer, una familia de redes convolucionales/transformer hibridas eficientes disenada para clasificacion de imagenes con coste computacional bajo. La entrada se estandariza a 224x224 px con normalizacion tipo ImageNet; en las variantes ONNX esa normalizacion y el softmax forman parte del grafo, de modo que basta con redimensionar la imagen y pasar valores de pixel en rango 0-255. La salida es una distribucion de probabilidad sobre las tres clases NSFL, NSFW y SFW.

El entrenamiento se realizo sobre un dataset propietario de aproximadamente 320.000 imagenes extraidas de la web, con contenido heterogeneo: fotografias reales, dibujos, contenido tipo Rule 34, capturas de pantalla, imagenes generadas por IA y memes. Las clases NSFW y SFW se validaron con `Marqo/nsfw-image-detection-384`, y aquellas imagenes predichas con alta confianza en la clase incorrecta se revisaron manualmente. No se documentan en la informacion disponible el numero de tokens (no aplica, es vision), la composicion exacta del dataset, ni si hubo fases de RLHF o DPO (no aplicables a un clasificador de este tipo). La model card no detalla hiperparametros de entrenamiento, aumentos de datos ni estrategia de validacion mas alla de las cifras de precision por tamano de modelo.

## Capacidades

- Clasificacion de imagenes en tres categorias mutuamente excluyentes: NSFL (gore), NSFW (pornografia o contenido altamente sugestivo) y SFW (todo lo demas).
- Devuelve probabilidades por clase (softmax), lo que permite aplicar umbrales de confianza personalizados en produccion.
- Inferencia en CPU con coste muy bajo gracias a los ~5,65 M de parametros y a la arquitectura SwiftFormer.
- Ejecucion en GPU mediante ONNX Runtime GPU o PyTorch, y en hardware Apple (Neural Engine/GPU) mediante el paquete Core ML generado.
- Preprocesado integrado en los grafos ONNX y Core ML (resize responsabilidad del llamante, normalizacion y softmax embebidos).
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no dispone de modo "thinking", vision adicional, audio ni generacion de texto. Es exclusivamente un clasificador de imagen.

## Casos de uso

- Moderacion de contenido en plataformas UGC: ejecutar el modelo sobre cada imagen subida antes de publicarla y rechazar o marcar automaticamente las predicciones NSFW y NSFL, usando el umbral de probabilidad como parametro de politica.
- Filtrado en el pipeline de ingesta de datasets: descartar imagenes NSFW/NSFL antes de que entren en un dataset de entrenamiento de vision, reduciendo el riesgo de que un modelo posterior herede contenido inapropiado.
- Moderacion en el dispositivo (on-device): gracias al paquete Core ML y a su tamano (~11 MB en fp16), puede integrarse en apps iOS/macOS para bloquear contenido localmente sin enviar la imagen a un servidor, lo que ayuda a cumplir requisitos de privacidad.
- Pre-filtro en sistemas de generacion de imagenes: comprobar la salida de un modelo text-to-image antes de mostrarla al usuario, con latencia muy baja al ser un clasificador de 5,65 M de parametros.
- Escaneo retroactivo de bibliotecas de imagenes: procesar grandes volumenes de archivos ya almacenados por lotes sobre CPU, dado que el modelo cabe holgadamente en memoria y no requiere GPU.
- Control parental y filtrado en clientes de mensajeria: inspeccion local de adjuntos de imagen en el dispositivo antes de renderizarlos, con inferencia en CPU o Neural Engine.
- Etiquetado previo para revision humana: usar la probabilidad de cada clase para priorizar la cola de moderacion, enviando a revision manual solo las imagenes con confianza baja o cercana al umbral.
- Analisis forense o de cumplimiento: clasificar lotes de imagenes incautadas o auditadas para separar material sensible, siempre con supervision humana y teniendo en cuenta las limitaciones de sesgo descritas mas abajo.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son las precisiones de la familia de modelos sobre el conjunto de evaluacion del autor, junto con una comparacion grafica (imagenes, sin cifras textuales) frente a `Marqo/nsfw-image-detection-384` y `Falconsai/nsfw_image_detection`.

| Modelo | Parametros | Precision declarada |
|---|---|---|
| `OwenElliott/image-safety-classifier-xs` | 3,5 M | 97,76 % |
| `OwenElliott/image-safety-classifier-s` (base de esta variante) | 6,1 M | 97,99 % |
| `OwenElliott/image-safety-classifier-m` | 12,1 M | 98,06 % |
| `OwenElliott/image-safety-classifier-l` | 28,5 M | 98,20 % |

Comparacion cualitativa declarada por el autor: el modelo supera a `Marqo/nsfw-image-detection-384` y a `Falconsai/nsfw_image_detection` en su dataset. Nota importante de la model card: esos dos modelos comparados no tienen clase NSFL explicita, por lo que en la evaluacion su prediccion NSFW se contabilizo como acierto para una imagen NSFL. No se publican cifras numericas desglosadas por clase en formato texto, ni resultados de MMLU, HumanEval o GSM8K (no aplicables a un clasificador de imagenes). Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Con 5,65 M de parametros, los pesos ocupan aproximadamente 22,6 MB en fp32 y 11,3 MB en fp16, mas el espacio de activaciones de una imagen 224x224 (unos pocos MB). Cualquier GPU con 1 GB o menos es suficiente.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) ejecutara la inferencia sobradamente; las GPU de gama alta quedan infrautilizadas en un modelo de este tamano.
- Compatibilidad con GPU de consumo: si, en todas. Tambien funciona en CPU, en GPU integradas y en aceleradores de borde.
- Hardware Apple: el paquete Core ML permite ejecucion en Neural Engine y GPU de iPhone, iPad y Mac (se puede fijar el objetivo de despliegue con `--deployment-target ios17` o `macos14`).
- Opciones de despliegue: PyTorch + timm, ONNX Runtime (CPU y `onnxruntime-gpu`), Core ML / Vision en plataformas Apple. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. El repositorio no incluye artefactos TensorRT, OpenVINO ni TFLite; no se documenta su conversion.
- Latencia y throughput estimados: no disponibles. La model card solo indica que el tamano y la arquitectura SwiftFormer lo hacen apto para despliegue en el borde y aplicaciones con latencia critica, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Resolucion de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `InspiratioNULL/image-safety-classifier-s-CoreML` | 5,65 M (safetensors) | NSFL, NSFW, SFW | 224x224 | MIT | HuggingFace; safetensors, ONNX fp32/fp16, Core ML |
| `OwenElliott/image-safety-classifier-s` | 6,1 M declarados | NSFL, NSFW, SFW | 224x224 | MIT (segun etiqueta del repo original) | HuggingFace; timm |
| `Marqo/nsfw-image-detection-384` | no disponible | NSFW, SFW (sin NSFL) | 384x384 (por el nombre) | no disponible | HuggingFace |
| `Falconsai/nsfw_image_detection` | no disponible | NSFW, SFW (sin NSFL) | no disponible | no disponible | HuggingFace |

Diferencias clave: los dos modelos de referencia no disponen de clase NSFL explicita, de modo que no cubren la deteccion de gore por separado. La variante aqui descrita anade artefactos ONNX y Core ML que los modelos comparados no ofrecen en la informacion disponible, y su tamano es entre uno y dos ordenes de magnitud menor que el de los detectores basados en ViT, lo que se traduce en menor coste de inferencia a costa de la precision que se pueda ganar con backbones mayores. No se dispone de cifras comparativas numericas (F1, precision, recall por clase) mas alla de las graficas de la model card original.

## Limitaciones y advertencias

- La propia model card advierte de que el modelo puede cometer errores y de que el contenido NSFW es subjetivo y contextual; el uso es responsabilidad del integrador.
- Riesgo de falsos positivos en contenido legitimo: obras de arte, ilustracion anatomica, imagenes medicas o fotografias de playa pueden activar la clase NSFW.
- Riesgo de falsos negativos: contenido sugestivo no explicito, dibujos estilizados o imagenes generadas por IA pueden escapar al filtro.
- Sesgos potenciales: el dataset de entrenamiento es propietario y se extrajo de la web, por lo que hereda los sesgos de representacion de esa fuente (idiomas, culturas y tipos de cuerpo sobrerrepresentados o infrarrepresentados).
- La verificacion de clases dependio en parte de `Marqo/nsfw-image-detection-384`, lo que puede propagar los sesgos de ese modelo al etiquetado.
- Solo clasifica imagenes: no detecta texto, audio, video ni contenido inapropiado en otros modales.
- No se documentan idiomas, ni comportamiento especifico por region o cultura.
- La licencia MIT permite uso comercial y modificacion, pero no exime de cumplir la normativa aplicable de moderacion de contenido, proteccion de menores o tratamiento de datos personales (por ejemplo, RGPD si se procesan imagenes de personas).
- No hay garantia de mantenimiento, soporte ni actualizaciones: el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- No se publican datos de calibracion de probabilidades, matrices de confusion detalladas en texto, ni evaluacion sobre conjuntos externos independientes; la precision declarada corresponde al dataset del propio autor.
- La fecha de creacion indicada en el repositorio (2026-09-25) es posterior a la fecha de consulta habitual, dato a verificar por el integrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/InspiratioNULL/image-safety-classifier-s-CoreML
- Modelo base original: https://huggingface.co/OwenElliott/image-safety-classifier-s
- Variante xs: https://huggingface.co/OwenElliott/image-safety-classifier-xs
- Variante m: https://huggingface.co/OwenElliott/image-safety-classifier-m
- Variante l: https://huggingface.co/OwenElliott/image-safety-classifier-l
- Modelo de verificacion de etiquetas: https://huggingface.co/Marqo/nsfw-image-detection-384
- Modelo comparado: https://huggingface.co/Falconsai/nsfw_image_detection
- Imagen de ejemplo usada en los fragmentos de codigo: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png
- Nota: los resultados de la busqueda web realizada no contienen informacion tecnica relevante sobre el modelo (devuelven listados de sitios para adultos), por lo que no se incluyen como referencias.
