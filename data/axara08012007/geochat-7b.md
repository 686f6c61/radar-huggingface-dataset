# axara08012007/geochat-7B

## Resumen

GeoChat-7B es un modelo de visión y lenguaje (VLM) con anclaje espacial (grounded) diseñado específicamente para teledetección (remote sensing). Desarrollado por la Universidad Mohamed bin Zayed de Inteligencia Artificial (MBZUAI) y publicado en CVPR 2024, es el primer modelo de este tipo orientado a escenarios de observación de la Tierra. A diferencia de los VLM generalistas, GeoChat está optimizado para manejar imágenes de alta resolución capturadas desde satélites o drones, y realiza razonamiento a nivel de región para interpretar escenas completas.

El modelo se basa en la arquitectura LLaVA-1.5, con un codificador de visión (CLIP ViT) y un modelo de lenguaje de 7 mil millones de parámetros, ajustado finamente sobre un dataset multimodal de teledetección creado específicamente para este fin. Esto le permite ejecutar tareas como descripción de imágenes y regiones, respuesta a preguntas visuales, clasificación de escenas, conversaciones visualmente ancladas y detección de objetos referidos, todo ello con rendimiento zero-shot en diversas aplicaciones de observación terrestre.

La relevancia actual de GeoChat radica en la creciente demanda de herramientas de análisis automático de imágenes satelitales para monitoreo ambiental, gestión de desastres, agricultura de precisión y planificación urbana. Al ser un modelo open source con licencia Apache-2.0, facilita la investigación y el despliegue en entornos de producción sin costes de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-1.5 (VLM: vision encoder + LLM de 7B) |
| Parametros totales | 7 mil millones (aproximado, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente ingles, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 28.3 GB, probablemente FP16) |

## Arquitectura y entrenamiento

GeoChat emplea la arquitectura LLaVA-1.5, que combina un codificador de vision CLIP ViT-L/14 con un modelo de lenguaje autoregresivo de 7 mil millones de parametros (probablemente Vicuna o LLaMA-2). La vision encoder procesa imagenes de alta resolucion dividiendolas en parches, y las caracteristicas visuales se proyectan al espacio de embeddings del LLM mediante un adaptador lineal. El entrenamiento se realiza en dos fases: primero un pre-entrenamiento de alineacion vision-lenguaje, y luego un ajuste fino supervisado sobre el dataset multimodal de teledeteccion recien creado.

El dataset de teledeteccion utilizado para el ajuste fino incluye pares de imagen-texto con anotaciones a nivel de region, lo que permite al modelo aprender a referenciar objetos y areas especificas dentro de la imagen. El modelo se entrena con una funcion de perdida de modelado de lenguaje clasico (cross-entropy) sobre los tokens de texto, sin tecnicas adicionales como RLHF o DPO. No se han publicado detalles sobre el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de descripciones de imagenes completas y de regiones especificas dentro de una escena de teledeteccion.
- Respuesta a preguntas visuales (VQA) sobre contenido de imagenes satelitales o aereas.
- Clasificacion de escenas en categorias como urbano, agricola, acuatico, forestal, etc.
- Conversaciones visualmente ancladas: dialogos multi-turno donde el modelo puede referirse a regiones concretas de la imagen.
- Deteccion de objetos referidos: dado un texto que describe un objeto, el modelo puede localizar su bounding box en la imagen.
- Razonamiento a nivel de region: interpreta el contexto geografico y las relaciones espaciales entre elementos.
- Rendimiento zero-shot en multiples tareas de teledeteccion sin necesidad de ajuste adicional.

## Casos de uso

- Monitoreo ambiental: GeoChat puede analizar imagenes satelitales para detectar deforestacion, cambios en la cobertura vegetal o contaminacion de masas de agua, generando informes descriptivos automaticos.
- Gestion de desastres naturales: tras un terremoto o inundacion, el modelo puede describir danos en infraestructuras o identificar areas afectadas a partir de imagenes aereas, facilitando la coordinacion de equipos de rescate.
- Agricultura de precision: analisis de cultivos desde imagenes de drones para evaluar salud de las plantas, detectar plagas o estimar rendimiento, con respuestas en lenguaje natural para agricultores.
- Planificacion urbana: clasificacion de uso del suelo y deteccion de cambios en asentamientos informales, ayudando a urbanistas a tomar decisiones basadas en datos visuales.
- Vigilancia fronteriza y maritima: deteccion de embarcaciones o infraestructuras no autorizadas en imagenes de satelite, con descripcion textual de su ubicacion y caracteristicas.
- Generacion de bases de datos geoetiquetadas: el modelo puede producir captions y anotaciones para grandes volumenes de imagenes satelitales, acelerando la creacion de datasets de entrenamiento para otros sistemas.
- Educacion y divulgacion cientifica: interpretacion de imagenes de satelite para explicar fenomenos geograficos en entornos academicos o periodisticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo original (arXiv:2311.15826) presenta evaluaciones en tareas de teledeteccion como captioning, VQA y deteccion referida, pero los numeros concretos no se incluyen en la informacion proporcionada. No se deben inferir valores sin fuente verificable.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 7B en FP16, se requieren aproximadamente 14 GB de VRAM solo para los pesos. Con la vision encoder y el overhead de atencion, se recomienda al menos 16-24 GB de VRAM para inferencia.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para pruebas locales; A100 (40/80 GB) o H100 para despliegue en produccion con mayor batch.
- Compatibilidad con GPU de consumo: si, una RTX 3090 o 4090 puede ejecutar el modelo en FP16, aunque con limitaciones de longitud de secuencia y batch.
- Opciones de despliegue: al ser un modelo PyTorch, se puede servir con vLLM (si se convierte a formato compatible), TGI (Text Generation Inference) o mediante una API personalizada con FastAPI. Para entornos con menos recursos, se puede cuantizar a 8 bits o 4 bits con bitsandbytes o GPTQ, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no disponible. Depende del hardware y la optimizacion. En una A100, se espera una latencia de unos 100-200 ms por token con batch pequeno.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos en la informacion proporcionada. Los modelos comparables en el dominio de teledeteccion son:

| Modelo | Parametros | Contexto | Tareas principales | Licencia |
|---|---|---|---|---|
| GeoChat-7B | 7B | no disponible | Captioning, VQA, deteccion referida | Apache-2.0 |
| RemoteCLIP | ~400M | no disponible | Clasificacion, retrieval | MIT |
| RSGPT | 7B | no disponible | Captioning, VQA | no disponible |

GeoChat se diferencia de RemoteCLIP y RSGPT por su capacidad de anclaje espacial (grounding) y su entrenamiento especifico en conversaciones visualmente ancladas. Sin embargo, sin datos de benchmarks no es posible establecer una comparativa objetiva de rendimiento.

## Limitaciones y advertencias

- Sesgos geograficos: el dataset de entrenamiento puede estar sesgado hacia ciertas regiones del mundo, limitando la precision en areas poco representadas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar descripciones incorrectas o inventar objetos que no existen en la imagen, especialmente en escenas complejas o de baja resolucion.
- Limitaciones de contexto: no se ha especificado la longitud maxima de contexto; para imagenes de alta resolucion, el numero de tokens visuales puede ser elevado y limitar la cantidad de texto que se puede procesar simultaneamente.
- Idioma: la informacion disponible no especifica los idiomas soportados; probablemente este entrenado principalmente en ingles, lo que limita su uso en otros idiomas.
- Restricciones de licencia: aunque la licencia es Apache-2.0 (permisiva), el modelo se basa en componentes de LLaVA-1.5 y Vicuna/LLaMA, que pueden tener licencias propias (LLaMA tiene restricciones de uso comercial en versiones anteriores). Se debe verificar la licencia de los componentes subyacentes antes de un despliegue comercial.
- Dependencia de la calidad de la imagen: el rendimiento se degrada con imagenes de baja resolucion, nubes o ruido atmosferico, comunes en teledeteccion.

## Enlaces

- HuggingFace (repo del autor): https://huggingface.co/axara08012007/geochat-7B
- HuggingFace (repo original de MBZUAI): https://huggingface.co/MBZUAI/geochat-7B
- Repositorio GitHub: https://github.com/mbzuai-oryx/GeoChat
- Paper (arXiv): https://arxiv.org/abs/2311.15826
- ModelScope: https://www.modelscope.cn/models/MBZUAI/geochat-7B
- Blog de analisis: https://aichina.news/blog/mapping-the-future-discover-geochat-7b-the-conversational-remote-u96zuh/
