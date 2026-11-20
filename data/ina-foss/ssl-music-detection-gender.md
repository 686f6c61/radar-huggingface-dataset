# ina-foss/ssl-music-detection-gender

## Resumen

El modelo `ssl-music-detection-gender` es un extractor de características y clasificador de audio desarrollado por INA (Institut national de l'audiovisuel) bajo la organización `ina-foss`. Se construye sobre el modelo base `ina-foss/ssl-audio-1k-gender_m50_f50`, un modelo preentrenado con aprendizaje autosupervisado (SSL, self-supervised learning) sobre audio. La tarea declarada en el pipeline es `audio-classification`, con etiquetas adicionales de `music detection` y `music`, lo que sugiere su uso para detectar presencia de música en señales de audio y, por el nombre del modelo, posiblemente clasificar género musical.

El repositorio es de pequeño tamaño (0,2 GB) y el modelo se distribuye en formato `safetensors` con `custom_code`, lo que implica que requiere cargar código personalizado del repositorio para su uso con la librería `transformers`. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La relevancia de este modelo radica en su aplicación a tareas de análisis y catalogación de archivos audiovisuales, un ámbito típico de INA. No obstante, la información pública disponible es muy limitada: no se documentan parámetros totales, longitud de contexto, idiomas soportados ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo SSL de audio con `custom_code`; el modelo base es `ina-foss/ssl-audio-1k-gender_m50_f50`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es de audio, no de texto; no se especifican idiomas) |
| Licencia | pantagruel-research-license (licencia de investigación; acceso restringido) |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. El modelo se etiqueta como `transformers` con `custom_code`, lo que indica que la implementación de la arquitectura requiere código específico incluido en el repositorio y no es una arquitectura estándar de la librería. El modelo base, `ina-foss/ssl-audio-1k-gender_m50_f50`, sugiere un preentrenamiento autosupervisado sobre audio (SSL), probablemente con un corpus de aproximadamente 1.000 horas (por el sufijo `1k`) y con una composición de datos con proporciones `m50_f50` (posiblemente 50 % masculino / 50 % femenino en el corpus de preentrenamiento, aunque esto es una interpretación del nombre y no un dato confirmado).

No se documentan en la información disponible el número de tokens de audio, la composición exacta del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. Tampoco se detallan innovaciones técnicas como atención lineal o decodificación especulativa.

## Capacidades

- Extracción de características (`feature-extraction`) de señales de audio.
- Clasificación de audio (`audio-classification`) orientada a la detección de música.
- Detección de presencia de música en fragmentos de audio (etiqueta `music detection`).
- Clasificación relacionada con género (por el nombre del modelo y del modelo base, `gender`), aunque no se especifica si se refiere a género musical o a género de voz.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto.
- No se documentan modos especiales como thinking mode, visión o audio generativo.

## Casos de uso

- Catalogación de archivos audiovisuales: el modelo puede procesar fragmentos de audio de un archivo de emisión para etiquetar automáticamente los segmentos que contienen música, facilitando la indexación y la búsqueda en fondos documentales de gran volumen, un caso alineado con la actividad de INA.
- Detección de música en flujos de radio y televisión: integrado en un pipeline de ingesta, permite marcar en tiempo (o casi tiempo) real los tramos musicales para su posterior análisis de derechos o de programación.
- Segmentación previa a tareas de reconocimiento musical: al aislar los fragmentos con música, se puede encadenar con sistemas de identificación de canciones o de clasificación de género musical.
- Análisis de cumplimiento de cuotas de programación: en emisoras con obligaciones de contenido musical, el modelo permite auditar automáticamente la proporción de música emitida.
- Investigación en music information retrieval (MIR): como extractor de características SSL, puede servir como base para experimentos de clasificación de género, estado de ánimo o instrumentación, fine-tuning sobre dominios específicos.
- Filtrado de datasets de audio: para construir corpus de entrenamiento de otros modelos, permite separar automáticamente los segmentos musicales de los de voz o de habla.
- Análisis de archivos personales o de investigación: un investigador puede procesar una colección de grabaciones para localizar los fragmentos musicales sin necesidad de escucharlos manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; dado el tamaño del repositorio (0,2 GB), el modelo es muy pequeño y probablemente se ejecuta en CPU o en GPUs de gama baja, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponibles; por el tamaño del repositorio, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no se documenta.
- Compatibilidad con GPU consumer: probablemente sí, dado el tamaño del repositorio, pero no confirmado.
- Opciones de despliegue: la librería indicada es `transformers`; al requerir `custom_code`, es necesario cargar el código del repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a clasificación de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar que el propio modelo base `ina-foss/ssl-audio-1k-gender_m50_f50` es la referencia directa, pero no se dispone de sus especificaciones ni de resultados comparativos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ina-foss/ssl-music-detection-gender | no disponible | no disponible | pantagruel-research-license | gated |
| ina-foss/ssl-audio-1k-gender_m50_f50 (base) | no disponible | no disponible | no disponible | no disponible |
| Alternativas de detección de música | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan parámetros, contexto, datos de entrenamiento ni métricas, lo que dificulta evaluar su calidad y adecuación.
- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face; no es un modelo de descarga libre.
- Licencia `pantagruel-research-license`: licencia de investigación, lo que probablemente restringe el uso comercial; es imprescindible revisar los términos antes de cualquier despliegue en producción.
- Riesgo de sesgos: el nombre del modelo base (`m50_f50`) sugiere una composición de datos equilibrada por género, pero no se documenta la metodología ni los posibles sesgos en la detección de música o de género.
- Riesgo de alucinación: en un clasificador de audio, el equivalente sería la clasificación errónea de segmentos de voz como música o viceversa; no se documentan tasas de error.
- Limitaciones de idioma: al ser un modelo de audio, la noción de idioma no aplica directamente, pero no se especifica el dominio lingüístico del habla presente en los datos de entrenamiento.
- Requiere `custom_code`: la carga con `transformers` exige confiar en el código del repositorio, lo que añade un riesgo de seguridad y de mantenimiento.
- Sin datos de benchmarks: no es posible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ina-foss/ssl-music-detection-gender
- Modelo base: https://huggingface.co/ina-foss/ssl-audio-1k-gender_m50_f50
- Organización en Hugging Face: https://huggingface.co/ina-foss
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
