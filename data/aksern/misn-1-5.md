# aksern/misn-1.5

## Resumen

MISN-1.5 (Moderate Images SWIN Network 1.5) es un modelo de clasificacion binaria de imagenes desarrollado por el usuario aksern, disenado para etiquetar contenido como `clean` o `nsfw`. Se trata de la segunda version principal del proyecto: sustituye el backbone Swin Transformer original por Swin Transformer V2 en su variante Base, con configuracion `patch4-window12-192` y un checkpoint preentrenado en ImageNet-22k.

El modelo cuenta con 86.895.866 parametros (segun los pesos en safetensors) y un repositorio de 0,7 GB, lo que lo situa en el rango compacto y apto para inferencia local, incluso en CPU. No es un modelo generativo ni multimodal: resuelve exclusivamente una tarea de vision por computador, la clasificacion de imagenes en dos clases, con salida de probabilidad por clase.

Su relevancia actual es practica: el filtrado de contenido no apto es un requisito habitual en plataformas con contenido generado por usuarios, y un clasificador de menos de 90 millones de parametros permite desplegar moderacion de primera linea sin depender de APIs externas. La contrapartida es el tamano del conjunto de entrenamiento, de aproximadamente 4.000 imagenes de origen, muy reducido frente a los estandares habituales de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 Base (patch 4, window 12, resolucion de preentrenamiento 192x192) |
| Parametros totales | 86.895.866 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes; la entrada es una imagen a 192x192) |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de salida son `clean` y `nsfw`) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (repositorio de 0,7 GB) |

## Arquitectura y entrenamiento

MISN-1.5 es un fine-tuning de `microsoft/swinv2-base-patch4-window12-192-22k`. Swin Transformer V2 es una arquitectura de vision jerarquica basada en atencion por ventanas desplazadas, con parches de 4x4 y ventanas de atencion de 12x12; la variante Base actua como extractor de caracteristicas visuales al que se anade una cabeza de clasificacion adaptada a dos clases. El checkpoint de partida fue preentrenado en ImageNet-22k, lo que aporta representaciones visuales genericas antes del ajuste especifico de moderacion.

El ajuste se realizo sobre aproximadamente 4.000 imagenes de origen repartidas entre las clases `clean` y `nsfw`, frente a las aproximadamente 2.500 de MISN-1.0. El dataset asociado al modelo es `akaruineko/pinterest-4k`, que no se redistribuye con los pesos. El autor indica que se anadieron ejemplos especificos para cubrir casos visuales concretos y que se aplico aumento de datos durante el entrenamiento, sin que esos ejemplos aumentados deban interpretarse como imagenes de origen independientes. No se documenta en la informacion disponible el uso de RLHF, DPO ni ningun otro ajuste por preferencias, ni el numero de tokens o de pasos de entrenamiento, ni la composicion detallada del dataset mas alla del recuento de imagenes de origen.

## Capacidades

- Clasificacion binaria de imagenes en las clases `clean` (indice 0) y `nsfw` (indice 1), con una probabilidad asociada a cada clase mediante `pipeline("image-classification")`.
- Procesamiento de imagenes locales y de imagenes accesibles por URL a traves del pipeline de Transformers.
- Extraccion de caracteristicas visuales heredada del preentrenamiento en ImageNet-22k, reutilizable como backbone si se descarta la cabeza de clasificacion.
- Inferencia en GPU o CPU, con un coste de memoria muy bajo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling, capacidades de agente ni soporte multilingue: es un clasificador de imagen puro.
- No hay modo de pensamiento, entrada de audio ni salida estructurada mas alla de la lista de etiquetas con puntuacion.

## Casos de uso

- Moderacion de contenido generado por usuarios: integrado como primer filtro en el momento de la subida, el modelo asigna una probabilidad `nsfw` a cada imagen y permite rechazar o retener automaticamente el contenido por encima de un umbral definido por el operador.
- Prefiltrado de colas de revision humana: en lugar de revisar manualmente el 100 % de las imagenes, el clasificador ordena por probabilidad y solo se escala a revision humana la franja ambigua, lo que reduce la carga del equipo de moderacion.
- Saneado de datasets de entrenamiento: antes de entrenar un modelo de vision propio, se pasa el corpus por MISN-1.5 para eliminar imagenes no aptas y evitar que contaminen el conjunto de entrenamiento.
- Filtrado en entornos con recursos limitados: con 86,9 millones de parametros y menos de 1 GB de memoria en FP32, puede ejecutarse en CPU o en GPUs de gama baja dentro de infraestructura propia, sin llamadas a servicios externos de moderacion.
- Aplicaciones de control parental o filtrado local: al ser un modelo compacto y ejecutable en local, encaja en herramientas de escritorio que necesitan clasificar archivos de imagen sin enviar el contenido a un tercero.
- Auditoria retrospectiva de catalogos: clasificacion por lotes de bibliotecas de imagenes ya almacenadas para detectar contenido no conforme a politica y generar informes de cumplimiento.
- Enrutado previo en pipelines de vision por computador: usar la etiqueta `nsfw` como condicion para derivar o descartar imagenes antes de etapas mas costosas como deteccion de objetos, OCR o generacion de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, precision, recall, F1, AUC ni matrices de confusion sobre un conjunto de validacion o test independiente, ni comparaciones numericas con MISN-1.0 o con otros clasificadores de moderacion.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB. Los pesos en FP32 ocupan aproximadamente 347 MB (86.895.866 parametros) y en FP16 alrededor de 174 MB, a lo que se suman las activaciones de una entrada de 192x192, de coste reducido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El modelo no necesita A100, H100 ni RTX 4090; una GTX 1650, una T4 o incluso una GPU integrada moderna son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU. El repositorio completo ocupa 0,7 GB en disco.
- Opciones de despliegue: la documentada oficialmente es `transformers.pipeline("image-classification")` sobre PyTorch, con seleccion de dispositivo CUDA o CPU. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama, TGI, ONNX Runtime ni TensorRT.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia por imagen ni de imagenes por segundo en ningun hardware concreto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MISN-1.5 | Swin Transformer V2 Base (patch 4, window 12, 192) | 86.895.866 | Clasificacion binaria clean/nsfw | ~4.000 imagenes de origen | OpenMDW 1.1 | HuggingFace, transformers |
| MISN-1.0 | Swin Transformer (v1) | no disponible | Clasificacion binaria clean/nsfw | ~2.500 imagenes de origen | no disponible | no disponible |
| microsoft/swinv2-base-patch4-window12-192-22k | Swin Transformer V2 Base | no disponible en la informacion proporcionada | Clasificacion de imagenes en 1000 clases (ImageNet) | ImageNet-22k | no disponible | HuggingFace |

No se dispone de datos de benchmarks ni de licencias de los modelos comparados mas alla de lo indicado, por lo que la comparacion se limita a arquitectura, tarea y origen de los datos. No se han identificado en la informacion proporcionada otros clasificadores de moderacion directamente comparables.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: aproximadamente 4.000 imagenes de origen para una tarea de clasificacion visual, lo que limita la generalizacion frente a dominios visuales alejados de la distribucion de origen (el dataset asociado es `akaruineko/pinterest-4k`).
- Riesgo elevado de falsos positivos y falsos negativos en casos limite: el propio autor indica que el modelo debe usarse como ayuda a la moderacion y no como mecanismo unico de decision cuando un error de clasificacion tenga consecuencias significativas.
- Ausencia total de evaluacion publicada: no hay metricas de validacion, analisis de errores ni evaluacion de sesgos, por lo que no es posible cuantificar su fiabilidad antes de desplegarlo.
- Sesgos no documentados: no se ha publicado ningun analisis de sesgo por demografia, tipo de cuerpo, contexto cultural o estilo artistico. Un dataset pequeno y de origen unico tiende a sobrerrepresentar ciertos estilos, y el modelo puede penalizar de forma desproporcionada imagenes legitimas (arte, contenido medico, educacion sexual).
- Clasificacion binaria sin matices: la salida es `clean` o `nsfw`, sin categorias intermedias ni niveles de gravedad, lo que dificulta definir politicas graduadas de moderacion.
- Ambito de entrada limitado: el preentrenamiento usa resolucion 192x192, y la model card insiste en usar el procesador de imagen incluido con el modelo en lugar de reproducir el preprocesado manualmente.
- Sin soporte de texto ni de otros idiomas: no puede combinarse con senales textuales (titulos, descripciones, etiquetas) dentro del propio modelo.
- Licencia OpenMDW 1.1: las condiciones exactas de uso comercial, redistribucion y atribucion no se detallan en la informacion proporcionada; conviene revisar el texto completo de la licencia antes de un despliegue en produccion.
- Trazabilidad escasa del proyecto: el modelo registra 0 descargas y 0 likes en el momento de la consulta, y no se documentan versiones adicionales, informes de error ni mantenimiento.
- No se documenta el preprocesado exacto, la estrategia de aumento de datos ni la particion train/validacion/test, lo que impide reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aksern/misn-1.5
- Modelo base: https://huggingface.co/microsoft/swinv2-base-patch4-window12-192-22k
- Dataset asociado: https://huggingface.co/datasets/akaruineko/pinterest-4k
- Paper de Swin Transformer V2, repositorio oficial y demos: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio ningun enlace relevante al modelo, a su autor ni a benchmarks de moderacion de imagenes.
