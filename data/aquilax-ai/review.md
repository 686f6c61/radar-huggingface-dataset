# AquilaX-AI/Review

## Resumen

AquilaX-AI/Review es un modelo de clasificación de texto desarrollado por AquilaX, una plataforma de seguridad de aplicaciones que ofrece soluciones SAST, SCA, DAST y ASPM. El modelo está diseñado específicamente para automatizar la revisión y clasificación de hallazgos de seguridad en código fuente, abordando el problema del ruido y los falsos positivos generados por las herramientas de análisis estático tradicionales basadas en reglas.

El modelo se basa en la arquitectura DistilBERT, una versión destilada y optimizada de BERT que mantiene un alto rendimiento con un coste computacional reducido. Con aproximadamente 67 millones de parámetros, es un modelo ligero y eficiente, adecuado para su integración en pipelines de CI/CD y flujos de trabajo de revisión de código. Se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en su enfoque especializado: en lugar de ser un modelo de propósito general, está entrenado para analizar fragmentos de código junto con metadatos contextuales (como identificadores CWE, nombres de archivo y líneas afectadas) y producir una clasificación que ayuda a los equipos de seguridad a priorizar vulnerabilidades reales y descartar falsos positivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, dado el dominio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura transformer encoder destilada del modelo BERT original. DistilBERT reduce el numero de capas de 12 a 6 y elimina los token-type embeddings, manteniendo aproximadamente el 97% de las capacidades de BERT con un 40% menos de parametros y un 60% menos de latencia. Esta arquitectura es adecuada para tareas de clasificacion de secuencias, donde se necesita procesar el texto completo de entrada y producir una etiqueta de salida.

La entrada del modelo es un prompt estructurado que combina el fragmento de codigo sospechoso con metadatos contextuales: identificador CWE, nombre de la vulnerabilidad, linea afectada, nombre de archivo e identificador de organizacion. Esta combinacion permite que el modelo tenga informacion suficiente para clasificar si el hallazgo es un verdadero positivo o un falso positivo. Los datos de entrenamiento especificos no estan publicados, pero segun la documentacion de AquilaX, el modelo se entrena con hallazgos de herramientas SAST y puede ajustarse por organizacion para adaptarse a patrones de codigo, convenciones de framework y decisiones de triaje historicas del equipo.

## Capacidades

- Clasificacion de hallazgos de seguridad en codigo fuente, distinguiendo entre vulnerabilidades reales y falsos positivos.
- Analisis contextual de fragmentos de codigo combinados con metadatos de herramientas SAST (CWE, nombre de archivo, linea afectada).
- Integracion con pipelines de revision de codigo y herramientas de CI/CD.
- Capacidad de fine-tuning por organizacion para adaptarse a patrones de codigo y decisiones de triaje especificas.
- Clasificacion binaria o multiclase de hallazgos de seguridad (la salida es un id de clase predecido).
- Inferencia rapida gracias a la arquitectura ligera de DistilBERT.

## Casos de uso

- Automatizacion de triaje en herramientas SAST: el modelo puede filtrar automaticamente los hallazgos generados por herramientas como Semgrep, SonarQube o Checkmarx, reduciendo el tiempo que los analistas dedican a revisar falsos positivos. Se integraria como un paso posterior al escaneo, clasificando cada hallazgo antes de que llegue al equipo de seguridad.

- Integracion en pipelines de CI/CD: el modelo puede ejecutarse como parte de un job de revision de seguridad en GitHub Actions o GitLab CI, proporcionando una clasificacion automatica de cada pull request y bloqueando la fusion si se detecta una vulnerabilidad critica.

- Priorizacion de vulnerabilidades: al clasificar hallazgos con su CWE correspondiente, el modelo ayuda a los equipos a priorizar la correccion de vulnerabilidades segun su tipo y contexto, enfocando los recursos en los problemas mas relevantes para el codigo especifico.

- Personalizacion por organizacion: AquilaX ofrece instancias del modelo fine-tuned con los patrones de codigo y decisiones historicas de cada organizacion, lo que permite que la clasificacion se adapte a las convenciones del equipo y mejore con el tiempo.

- Auditoria de seguridad de codigo heredado: el modelo puede analizar grandes volumenes de codigo existente para identificar posibles vulnerabilidades que no fueron detectadas en revisiones anteriores, proporcionando una capa adicional de analisis.

- Formacion de equipos de seguridad: el modelo puede utilizarse como herramienta educativa, mostrando a desarrolladores por que ciertos fragmentos de codigo son vulnerables y como se clasifican segun el estandar CWE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas de evaluacion como exactitud, precision, recall o F1 sobre conjuntos de datos estandar de seguridad (por ejemplo, CWE-22, OWASP Benchmark). Tampoco se proporcionan comparaciones con otros modelos de clasificacion de vulnerabilidades.

## Requisitos de hardware

- VRAM estimada: al ser un modelo DistilBERT de 67 millones de parametros, la inferencia requiere aproximadamente 270 MB de VRAM en FP32 y unos 70 MB en cuantizacion INT8. Es ejecutable en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: el modelo funciona en GPUs de consumo como NVIDIA GTX 1060, RTX 2060, RTX 3060, asi como en GPUs de datacenter como T4, V100 o A10. No requiere hardware especializado.
- Compatibilidad con consumer GPU: si, el modelo cabe comodamente en cualquier GPU consumer disponible en el mercado actual.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Inference Endpoints, Text Embeddings Inference (TEI), o mediante un servidor Python con FastAPI y la libreria transformers. Tambien es compatible con ONNX Runtime para optimizacion en CPU.
- Latencia estimada: en una GPU T4, la inferencia para un prompt de 128 tokens deberia completarse en menos de 10 ms. En CPU, la latencia puede ser de 50-100 ms por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Enfoque | Licencia |
|---|---|---|---|---|
| AquilaX-AI/Review | 67 M | DistilBERT | Clasificacion de hallazgos SAST | Apache 2.0 |
| CodeBERT | 125 M | BERT (encoder) | Comprension de codigo general | MIT |
| GraphCodeBERT | 125 M | BERT (encoder) | Comprension de codigo con estructura de grafo | MIT |

CodeBERT y GraphCodeBERT son modelos de proposito general para comprension de codigo, no estan especializados en clasificacion de vulnerabilidades. AquilaX-AI/Review se diferencia por su enfoque especifico en triaje de hallazgos de seguridad y su capacidad de fine-tuning por organizacion. Sin embargo, no hay datos publicos que permitan comparar su rendimiento con estos modelos en tareas de seguridad.

## Limitaciones y advertencias

- Sesgos de entrenamiento: el modelo esta entrenado en hallazgos de herramientas SAST especificas, por lo que puede no generalizar bien a otros tipos de analisis de codigo o lenguajes de programacion no representados en sus datos de entrenamiento.
- Riesgo de falsos negativos: al ser un clasificador, existe la posibilidad de que el modelo clasifique erroneamente una vulnerabilidad real como benigna, especialmente si el fragmento de codigo es complejo o el contexto proporcionado es insuficiente.
- Dependencia de metadatos: el modelo requiere que se le proporcionen metadatos estructurados (CWE, nombre de archivo, linea) para funcionar correctamente. Sin estos datos, la clasificacion puede ser poco fiable.
- Contexto limitado: al estar basado en DistilBERT, la longitud maxima de entrada es de 512 tokens. Fragmentos de codigo muy grandes deberan truncarse, lo que puede perder informacion relevante.
- Idioma: no se especifican los idiomas soportados. Dado el dominio de seguridad, es probable que el modelo funcione mejor con codigo y comentarios en ingles, aunque los identificadores y el codigo fuente son en gran medida independientes del idioma.
- Uso en produccion: aunque la licencia Apache 2.0 permite uso comercial, el modelo no publica metricas de calidad ni garantias de rendimiento. Se recomienda validar su comportamiento en el entorno especifico antes de desplegarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AquilaX-AI/Review
- Pagina del producto: https://aquilax.ai/review
- Documentacion tecnica: https://docs.aquilax.ai/ai-models/review
- Plataforma AquilaX: https://aquilax.ai/
- Perfil de la organizacion en Hugging Face: https://huggingface.co/AquilaX-AI/models
