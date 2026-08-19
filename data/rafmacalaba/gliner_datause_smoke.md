# rafmacalaba/gliner_datause_smoke

## Resumen

El modelo `rafmacalaba/gliner_datause_smoke` es un ajuste fino (fine-tune) del modelo base `urchade/gliner_large-v2.1`, especializado en la extracción de menciones de uso de datos en artículos de investigación económica. Desarrollado por el usuario rafacalaba, este modelo aborda el problema de identificar automáticamente qué fuentes de datos (encuestas, censos, registros, paneles) se citan o describen en textos académicos, una tarea fundamental para la minería de literatura y la construcción de bases de datos de investigación.

El modelo emplea la arquitectura GLiNER (Generalist and Lightweight model for Named Entity Recognition), que permite la extracción de entidades mediante descripciones en lenguaje natural en lugar de etiquetas fijas. En este caso, se definen tres etiquetas específicas: `NAMED_DATA` (nombre propio o acrónimo de una fuente), `DESCRIPTIVE_DATA` (fuente descrita sin nombre) y `VAGUE_DATA` (mención genérica sin fuente identificable). El repositorio tiene un tamaño de 1,8 GB y está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y académico. Su relevancia radica en la automatización de un proceso que tradicionalmente requería revisión manual, con aplicaciones directas en estudios bibliométricos y análisis de reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (basada en transformer, fine-tune de `urchade/gliner_large-v2.1`) |
| Parametros totales | no disponible (el modelo base GLiNER large tiene aproximadamente 1.5B, pero no se confirma) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, típicamente 512-1024 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio no especifica cuantizaciones) |
| Idiomas soportados | no disponibles (el modelo base soporta múltiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según los archivos del repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en GLiNER, una arquitectura de reconocimiento de entidades nombradas que utiliza un codificador transformer preentrenado y un mecanismo de atención cruzada para comparar las representaciones de los tokens con las descripciones de las entidades. En este caso, se parte de `urchade/gliner_large-v2.1`, la versión grande del modelo GLiNER, y se ajusta con un dataset específico llamado `rafmacalaba/data-use-mentions` (configuración gliner), que contiene anotaciones de menciones de uso de datos en papers de economía.

El entrenamiento se realizó durante 1 época, con una tasa de aprendizaje de 5e-06, tamaño de lote de 2 y precisión bf16. No se menciona el uso de RLHF ni DPO; se trata de un ajuste fino supervisado estándar. La innovación principal reside en la especialización del modelo para un dominio concreto (economía) y en la definición de tres categorías de menciones de datos, lo que permite distinguir entre fuentes nombradas, descritas o vagas. No se detallan innovaciones técnicas adicionales en la arquitectura.

## Capacidades

- Extracción de menciones de uso de datos en textos académicos de economía, con tres etiquetas: `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`.
- Reconocimiento de entidades basado en descripciones en lenguaje natural (característica de GLiNER), lo que permite adaptar las etiquetas sin reentrenar.
- Procesamiento de texto en formato token-classification, adecuado para documentos largos si el contexto del modelo base lo permite.
- No se especifican capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes. Es un modelo puramente de extracción de entidades.
- Capacidades multilingües no confirmadas; el modelo base GLiNER large soporta varios idiomas, pero el fine-tune se ha realizado presumiblemente sobre corpus en inglés (papers de economía).

## Casos de uso

- Análisis bibliométrico de literatura económica: el modelo puede procesar miles de artículos para identificar automáticamente qué fuentes de datos se utilizan, permitiendo estudios de tendencias en el uso de encuestas, censos o registros administrativos.
- Construcción de bases de datos de investigación: al extraer menciones de datos, se pueden crear catálogos estructurados de fuentes citadas en un campo de estudio, facilitando la replicación y la revisión sistemática.
- Revisión de literatura asistida: los investigadores pueden usar el modelo para filtrar artículos relevantes según las fuentes de datos que mencionan, ahorrando tiempo en la selección de documentos.
- Detección de lagunas en la disponibilidad de datos: al clasificar menciones como `VAGUE_DATA`, se pueden identificar artículos que no especifican claramente sus fuentes, lo que es útil para evaluar la transparencia metodológica.
- Automatización de metadatos en repositorios académicos: el modelo puede etiquetar automáticamente los artículos con las fuentes de datos utilizadas, mejorando la indexación y búsqueda en plataformas como SSRN o RePEc.
- Análisis de reproducibilidad: al comparar las menciones extraídas con las bases de datos reales, se pueden detectar inconsistencias o errores en la citación de fuentes, contribuyendo a la integridad científica.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en un conjunto de validación (holdout) con 64 ejemplos y 89 spans. Se reportan métricas para diferentes umbrales de confianza:

| Umbral | TP | FP | FN | Precision | Recall | F0.5 | F1 |
|---|---|---|---|---|---|---|---|
| 0.10 | 85 | 412 | 3 | 0.1710 | 0.9659 | 0.2047 | 0.2906 |
| 0.20 | 81 | 187 | 7 | 0.3022 | 0.9205 | 0.3491 | 0.4551 |
| 0.30 | 75 | 102 | 13 | 0.4237 | 0.8523 | 0.4711 | 0.5660 |
| 0.40 | 62 | 45 | 26 | 0.5794 | 0.7045 | 0.6008 | 0.6359 |
| 0.50 | 43 | 23 | 45 | 0.6515 | 0.4886 | 0.6108 | 0.5584 |
| 0.60 | 25 | 10 | 63 | 0.7143 | 0.2841 | 0.5482 | 0.4065 |
| 0.70 | 9 | 1 | 79 | 0.9000 | 0.1023 | 0.3516 | 0.1837 |

El mejor F0.5 es 0.6108 (umbral 0.5) y el mejor F1 es 0.6359 (umbral 0.4). El desglose por subgrupos muestra un rendimiento variable: en el grupo `prwp` (papers de economía general) el F1 es 0.5512, mientras que en `fcv` (probablemente un subconjunto específico) es 0.5926. No se comparan con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- El tamaño del repositorio es de 1,8 GB, lo que sugiere que el modelo completo en precisión fp32 o bf16 podría ocupar alrededor de 1,5-2 GB de memoria. Con cuantización a 8 bits o 4 bits, podría caber en GPUs con 4-6 GB de VRAM, pero no hay datos confirmados.
- Dado que es un modelo GLiNER large, se recomienda al menos una GPU con 8 GB de VRAM para inferencia en fp16, como una RTX 2070 o superior. Para despliegue en CPU, podría funcionar con llama.cpp o similar, pero no se ha probado.
- Opciones de despliegue: al ser un modelo de la librería GLiNER, se puede usar con la biblioteca `gliner` de Python, o exportar a ONNX para inferencia optimizada. No se menciona compatibilidad con vLLM, TGI u Ollama.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. El modelo base `urchade/gliner_large-v2.1` es el punto de partida, pero no se ofrecen métricas comparativas. Existe un modelo hermano `rafmacalaba/gliner2_datause_smoke` (basado en GLiNER2) que aparece en los resultados de búsqueda, pero no se proporcionan detalles de rendimiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy concreto (menciones de datos en economía) y puede no generalizar bien a otros tipos de texto o dominios.
- El rendimiento es moderado: el mejor F1 es 0.64, lo que implica una tasa de errores considerable. En umbrales bajos hay muchos falsos positivos (precision baja), mientras que en umbrales altos el recall cae drásticamente.
- El conjunto de evaluación es pequeño (64 ejemplos), por lo que las métricas pueden no ser estables.
- No se especifican sesgos conocidos, pero al ser un fine-tune sobre un corpus de economía, puede tener sesgos hacia ciertos tipos de fuentes o estilos de escritura.
- Riesgo de alucinación: al ser un modelo de extracción, puede etiquetar como `NAMED_DATA` términos que no son realmente nombres de fuentes, especialmente con umbrales bajos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y del dataset de entrenamiento.
- No se proporciona información sobre la longitud de contexto máxima, lo que limita su uso en documentos muy largos sin truncamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/gliner_datause_smoke
- Modelo base: https://huggingface.co/urchade/gliner_large-v2.1
- Modelo relacionado (GLiNER2): https://huggingface.co/rafmacalaba/gliner2_datause_smoke
- Repositorio de GLiNER2 (referencia): https://github.com/fastino-ai/GLiNER2
