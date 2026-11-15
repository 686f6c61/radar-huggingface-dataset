# McAntek/building-segmentation-poland-b5

## Resumen

Building Segmentation Poland — SegFormer B5 es un modelo de segmentacion semantica de imagenes aereas especializado en la deteccion de huellas de edificios en el territorio de Polonia. Lo desarrolla el usuario McAntek y parte del modelo base `nvidia/segformer-b5-finetuned-ade-512-512`, un SegFormer B5 ya ajustado por NVIDIA sobre el dataset ADE20K, que aqui se reentrena para la tarea binaria de edificio frente a no edificio sobre ortofotografia aerea polaca.

El modelo se publica en Hugging Face con licencia Apache 2.0 y un repositorio de 1,4 GB que contiene los pesos en formato safetensors, la configuracion del modelo, la configuracion de preprocesamiento y el historial de entrenamiento (`history.json`). La relevancia practica esta en la extraccion de huellas de edificios para analisis geoespacial, actualizacion cartografica y estudios de ocupacion del suelo, un caso de uso clasico de segmentacion densa donde los transformers jerarquicos tipo SegFormer ofrecen buena relacion calidad/coste frente a arquitecturas CNN tradicionales.

No obstante, la model card es muy escueta: no documenta el numero de imagenes de entrenamiento, la resolucion de las teselas, las bandas de entrada esperadas, la normalizacion aplicada ni el mapeo de etiquetas de salida, y remite a confirmar estos extremos en el codigo de entrenamiento e inferencia antes de usar el modelo. Tampoco se han publicado resultados de benchmarks ni metricas de validacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer B5 (transformer jerarquico con decoder MLP ligero) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; ventana de entrada de imagen, valor no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin componente linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SegFormer es un transformer de segmentacion semantica que combina un encoder jerarquico con atencion eficiente (sin positional encoding fijo, con mezcla de caracteristicas multiescala) y un decoder ligero basado en MLP que fusiona las salidas de las distintas etapas del encoder. La variante B5 es la de mayor capacidad de la familia, con un encoder mas profundo y anchos de canal superiores a las variantes B0-B4. El modelo parte de `nvidia/segformer-b5-finetuned-ade-512-512`, ya ajustado sobre ADE20K a resolucion 512x512, y se reentrena para segmentacion de edificios en imagenes aereas de Polonia.

La informacion disponible no detalla el volumen de datos de entrenamiento, el numero de imagenes o teselas, la composicion del dataset, las bandas espectrales de entrada (RGB frente a multiespectral), la resolucion nativa de las ortofotos ni si se aplicaron tecnicas de aumento de datos o ajuste fino congelando partes del encoder. El repositorio incluye `history.json` con el historial de entrenamiento, que es la unica fuente documentada de la evolucion del ajuste. No consta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de vision supervisado.

## Capacidades

- Segmentacion semantica densa de imagenes: genera una mascara por pixel para la clase edificio frente al resto.
- Deteccion de huellas de edificios en ortofotografia aerea de Polonia, incluyendo edificios residenciales, industriales y de otra tipologia presente en el dataset de entrenamiento.
- Procesamiento de imagenes a resolucion de entrada compatible con el preprocesamiento de SegFormer (el modelo base usa 512x512; el valor exacto para este ajuste debe confirmarse en la configuracion de preprocesamiento incluida en el repositorio).
- Inferencia por teselas: al tratarse de segmentacion de imagenes aereas de gran extension, el uso previsto es el troceado en teselas y la reconstruccion posterior del mosaico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente de vision.
- No tiene capacidades multilingues ni de comprension de lenguaje natural.
- No dispone de modo "thinking", vision-language, audio ni ninguna capacidad multimodal mas alla de la imagen de entrada.

## Casos de uso

- Extraccion de huellas de edificios para cartografia: el modelo genera mascaras binarias de edificio sobre ortofotos aereas de Polonia, utiles para actualizar bases de datos de edificaciones y comparar con catastros existentes.
- Analisis de ocupacion del suelo: permite cuantificar la superficie construida por municipio o region a partir de imagenes aereas, alimentando estudios de expansion urbana y planificacion territorial.
- Deteccion de construcciones irregulares: al segmentar edificios sobre imagenes recientes, se pueden contrastar con registros oficiales para localizar edificaciones no declaradas, siempre con validacion humana posterior.
- Investigacion geoespacial y teledeteccion: sirve como modelo de referencia para experimentos de segmentacion semantica en imagenes aereas, comparando arquitecturas transformer frente a CNN en tareas de extraccion de edificios.
- Generacion de capas vectoriales: las mascaras de salida pueden poligonizarse para producir shapefiles o GeoJSON de huellas de edificios que alimenten sistemas de informacion geografica.
- Estimacion de exposicion y riesgo: la delimitacion de edificios permite calcular superficies expuestas en estudios de inundaciones, incendios o riesgos geologicos a escala local.
- Preprocesamiento para modelos posteriores: la mascara de edificios puede usarse para enmascarar regiones de interes antes de tareas de clasificacion de cubiertas, deteccion de paneles solares o analisis de eficiencia energetica.
- Prototipado en pipelines de teledeteccion: al estar en safetensors y con licencia Apache 2.0, se integra en entornos de Hugging Face Transformers para pruebas de concepto sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de validacion (IoU, mIoU, precision, recall o F1) ni comparaciones con otros modelos de segmentacion de edificios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 1,4 GB en safetensors, lo que sugiere que el modelo en precision completa o media puede cargarse en GPUs consumer con 8-16 GB de VRAM, aunque el dato exacto de parametros no se documenta.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del repositorio, una GPU con al menos 8 GB de VRAM deberia ser suficiente para inferencia en precision reducida; para entrenamiento o ajuste fino se recomienda una GPU de mayor capacidad (A100, H100 o RTX 4090), aunque no hay cifras publicadas.
- Compatibilidad con GPU consumer: probable en tarjetas con 8 GB o mas de VRAM, pendiente de confirmar con la configuracion real del modelo.
- Opciones de despliegue: Hugging Face Transformers con `SegformerForSemanticSegmentation` y `SegformerImageProcessor`; tambien es posible exportar a ONNX o TorchScript para despliegue en produccion, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Building Segmentation Poland — SegFormer B5 | SegFormer B5 | no disponible | imagen (resolucion no disponible) | Apache 2.0 | Hugging Face |
| nvidia/segformer-b5-finetuned-ade-512-512 | SegFormer B5 | no disponible | 512x512 | no disponible en la informacion | Hugging Face |
| Otros modelos de segmentacion de edificios | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de segmentacion de edificios, por lo que la comparativa se limita a la arquitectura y la licencia.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el numero de imagenes, la resolucion ni las bandas de entrada, lo que dificulta evaluar su robustez y su aplicabilidad fuera de las condiciones exactas de entrenamiento.
- El modelo esta especializado en imagenes aereas de Polonia; su rendimiento en otros paises, regimenes de iluminacion, estaciones del ano o sensores distintos no esta validado.
- Riesgo de falsos positivos y falsos negativos en zonas con edificios parcialmente ocultos, obras, infraestructuras industriales o cubiertas atipicas; las predicciones deben validarse antes de usarse en cartografia operativa.
- No se han publicado metricas de validacion (IoU, F1) ni benchmarks, por lo que no es posible cuantificar su calidad frente a alternativas.
- El autor advierte explicitamente de que las predicciones deben validarse antes de su uso en aplicaciones consecuentes.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero conviene revisar las condiciones del modelo base de NVIDIA y del dataset ADE20K subyacente.
- El modelo no procesa texto ni lenguaje natural; no es adecuado para tareas de comprension o generacion linguistica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McAntek/building-segmentation-poland-b5
- Modelo base: https://huggingface.co/nvidia/segformer-b5-finetuned-ade-512-512
- Paper de SegFormer (Xie et al., 2021): no disponible en la informacion proporcionada
- Dataset ADE20K: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
