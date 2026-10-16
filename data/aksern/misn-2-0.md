# aksern/misn-2.0

## Resumen

MISN-2.0 (Moderation Image Safety Network 2.0) es un modelo de clasificacion de imagenes desarrollado por el usuario aksern, disenado para tareas de moderacion de contenido. Clasifica cada imagen en una de tres categorias: `clean`, `nude` y `violence`. Se trata de la segunda version del proyecto, que amplia la tarea original de dos clases incorporando una clase dedicada a la deteccion de violencia.

El modelo parte del backbone Swin Transformer V2 Base preentrenado en ImageNet-22k (`microsoft/swinv2-base-patch4-window12-192-22k`) y ha sido afinado para la tarea especifica de clasificacion en tres clases. Cuenta con aproximadamente 86,9 millones de parametros y se distribuye en formato safetensors a traves de la libreria Transformers, con un peso de repositorio de unos 0,3 GB, lo que lo hace facilmente desplegable en hardware de consumo.

Su relevancia actual radica en la necesidad creciente de herramientas ligeras y de codigo abierto para el filtrado automatico de contenido en plataformas de contenido generado por el usuario. No obstante, conviene subrayar que, segun el propio autor, esta pensado como una ayuda a la moderacion y no como un mecanismo de decision unico en aplicaciones donde los errores de clasificacion tengan consecuencias graves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 Base (swinv2-base-patch4-window12-192-22k) |
| Parametros totales | 86.896.891 (aproximadamente 87 millones) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de imagenes; resolucion de entrada asociada al checkpoint base, 192x192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea puramente visual, sin procesamiento de lenguaje) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MISN-2.0 emplea como extractor de caracteristicas visuales el backbone Swin Transformer V2 en su variante Base, con configuracion de parches de tamano 4, ventana de atencion 12 y resolucion 192, preentrenada sobre ImageNet-22k. La cabeza de clasificacion del checkpoint original se ha sustituido por una cabeza adaptada a tres clases de salida. El modelo totaliza 86.896.891 parametros. No se especifica en la informacion disponible si se aplicaron tecnicas como RLHF o DPO, algo por otra parte poco habitual en tareas de clasificacion de imagenes.

El entrenamiento se realizo sobre el dataset `akaruineko/pinterest-4k`, compuesto por aproximadamente 4.000 imagenes fuente repartidas entre las tres clases objetivo (`clean`, `nude`, `violence`). Durante el entrenamiento se aplico aumento de datos (data augmentation), de modo que las muestras aumentadas no deben interpretarse como imagenes fuente independientes, sino como versiones modificadas destinadas a mejorar la robustez y reducir el sobreajuste. El conjunto de datos de entrenamiento no se redistribuye junto con el modelo, y no se detallan en la informacion disponible el numero total de tokens (no aplicable), la composicion exacta del dataset ni la estrategia de reparto entre clases.

## Capacidades

- Clasificacion de imagenes en tres categorias mutuamente excluyentes: `clean`, `nude` y `violence`.
- Etiquetado de contenido: identificacion de desnudos y de escenas violentas, ademas de contenido limpio.
- Asignacion de una puntuacion de probabilidad por clase, siendo la clase de mayor puntuacion la prediccion por defecto.
- Procesamiento de imagenes locales y de imagenes accesibles por URL a traves del pipeline `image-classification` de Transformers.
- Integracion directa en flujos de moderacion y filtrado de contenido generado por el usuario.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de capacidades multilingues ni de generacion de texto: es un modelo puramente discriminativo de vision.
- No incorpora modos especiales como thinking mode, vision-language, audio ni decodificacion especulativa.

## Casos de uso

- Preprocesado de imagenes subidas por usuarios: el modelo puede ejecutarse como paso previo a la publicacion para etiquetar o descartar contenido no apto, aprovechando su reducido tamano (unos 87 millones de parametros) para operar en tiempo casi real.
- Pipelines de moderacion de contenido: integrado como clasificador previo que marca candidatos a revision humana, reduciendo la carga de los moderadores.
- Filtrado y saneado de datasets: util para eliminar imagenes de desnudos o violencia antes de entrenar otros modelos de vision, evitando contaminar corpus con contenido no deseado.
- Moderacion de comunidades en plataformas de contenido generado por el usuario: clasificacion automatica de imagenes de publicaciones o perfiles para aplicar politicas de comunidad.
- Asistencia a sistemas de recomendacion: exclusion de contenido sensible de los feeds de recomendacion mediante la etiqueta predicha.
- Evaluacion y auditoria de sistemas de moderacion: uso como componente auxiliar en pruebas comparativas junto a otros modelos, siempre sobre conjuntos de validacion independientes.
- Investigacion en clasificacion de imagenes: punto de partida para experimentos de fine-tuning sobre tareas de moderacion, dado su backbone Swin V2 preentrenado en ImageNet-22k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un unico ejemplo de salida con valores ilustrativos (por ejemplo, `clean` 0.9998, `nude` 0.0001, `violence` 0.0001) que el propio autor indica explicitamente que no representa un resultado de benchmark medido. Asimismo, el autor recomienda emplear metricas como exactitud, precision y recall por clase, F1 macro y ponderado, matriz de confusion y ROC-AUC sobre datos independientes del conjunto de entrenamiento, pero no se aportan valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 86,9 millones de parametros en precision FP32 se requieren del orden de 350 MB solo para los pesos; en FP16/FP32 con overhead de activaciones, tipicamente menos de 1 GB.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien puede ejecutarse en CPU para inferencia por lotes pequenos.
- GPU recomendadas para produccion con alta concurrencia: NVIDIA T4, L4, A10, A100 o H100, dependiendo del volumen de peticiones.
- Opciones de despliegue: la libreria Transformers (`pipeline("image-classification")`) es la via soportada oficialmente; al ser un modelo de vision con arquitectura Swin, puede exportarse a otros formatos (ONNX, TensorRT) para optimizacion, aunque no se documenta soporte explicito en la informacion disponible. No se detalla compatibilidad con vLLM, TGI o llama.cpp (este ultimo no aplica por no ser un modelo de lenguaje).
- Latencia y throughput estimados: no disponibles. El tamano reducido del modelo permite inferencia por lotes en GPU de consumo con latencias del orden de milisegundos, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de MISN-2.0, por lo que cualquier comparacion numerica seria especulativa. A continuacion se ofrece una comparacion estructural con alternativas habituales en moderacion de imagenes, indicando los campos que no estan disponibles.

| Modelo | Tipo de tarea | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aksern/misn-2.0 | Clasificacion de imagenes (clean / nude / violence) | 86,9 M | Imagen 192x192 | openmdw-1.1 | Hugging Face |
| Falconsai/nsfw_image_detection | Clasificacion de imagenes (normal / nsfw) | no disponible en esta ficha | no disponible | no disponible | Hugging Face |
| CompVis / Stability AI Safety Checker | Deteccion de contenido NSFW | no disponible en esta ficha | no disponible | no disponible | Hugging Face |
| LAION / CLIP-based NSFW detectors | Deteccion de contenido NSFW | no disponible en esta ficha | no disponible | no disponible | Hugging Face |

Nota: los datos de los modelos alternativos no forman parte de la informacion proporcionada en esta consulta y deben verificarse en sus respectivas fichas antes de usarse en una comparacion rigurosa. No se dispone de resultados de benchmark comunes que permitan afirmar cual rinde mejor.

## Limitaciones y advertencias

- Conjunto de entrenamiento pequeno: aproximadamente 4.000 imagenes fuente, muy por debajo de los conjuntos a gran escala usados en modelos comerciales o de investigacion, lo que puede degradar el rendimiento en distribuciones distintas.
- Cambio de dominio (domain shift): el rendimiento puede variar ante estilos artisticos inusuales, imagenes muy editadas, baja resolucion, capturas de pantalla, recortes extremos, iluminacion inusual, imagenes sinteticas o generadas y contenido visualmente ambiguo.
- Falsos positivos y falsos negativos: el modelo puede confundir cualquiera de las tres clases entre si, afectando a la calidad de la moderacion.
- Sesgos: al tratarse de un modelo entrenado con datos de origen y etiquetado concretos, puede heredar sesgos de la distribucion de origen, del proceso de etiquetado y de la estrategia de aumento de datos. No se documentan analisis de sesgo por subgrupo.
- Uso responsable: la model card indica explicitamente que debe emplearse como ayuda a la moderacion y no como unico mecanismo de decision cuando los errores tengan consecuencias graves.
- Umbrales: las puntuaciones no son garantias de acierto; se recomienda seleccionar umbrales por clase segun los requisitos y la validacion propia.
- Licencia: openmdw-1.1. Conviene revisar los terminos completos de dicha licencia para confirmar las condiciones de uso comercial antes de desplegar el modelo en produccion.
- Idiomas y texto: no aplica; el modelo no procesa lenguaje. No se dispone de informacion sobre idiomas.
- Reproducibilidad de benchmarks: al no publicarse resultados, no es posible validar afirmaciones de rendimiento sin una evaluacion propia.
- Contenido no apto: el modelo esta marcado como `not-for-all-audiences`, dado que su tematica implica tratar material sensible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aksern/misn-2.0
- Modelo base (Swin Transformer V2): https://huggingface.co/microsoft/swinv2-base-patch4-window12-192-22k
- Dataset de entrenamiento: https://huggingface.co/datasets/akaruineko/pinterest-4k
- Paper de Swin Transformer V2: no disponible en la informacion proporcionada
- Repositorio de codigo del proyecto MISN: no disponible en la informacion proporcionada
- Demo o space asociado: no disponible en la informacion proporcionada
- Blog o documentacion adicional del autor: no disponible en la informacion proporcionada
