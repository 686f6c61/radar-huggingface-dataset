# AAU-NLP/Cal-BERT-SL1000

## Resumen

Cal-BERT-SL1000 es un modelo de etiquetado de secuencias basado en BERT, desarrollado por el grupo AAU-NLP de la Universidad de Aalborg, que se especializa en la extracción de indicadores clave de rendimiento financiero (KPIs) de los informes trimestrales y anuales presentados ante la SEC (formularios 10-K y 10-Q). El modelo se ha ajustado sobre el conjunto de datos HiFi-KPI, un corpus a gran escala de 1,65 millones de párrafos con 198 000 etiquetas únicas organizadas jerárquicamente y vinculadas a las taxonomías iXBRL.

La relevancia de este modelo radica en que aborda un problema concreto del análisis financiero automatizado: la falta de transferibilidad de las etiquetas KPI entre distintas empresas debido a la complejidad y granularidad de la taxonomía iXBRL. Cal-BERT-SL1000 identifica entidades que se encuentran un nivel por encima en la taxonomía de cálculo (n=1), como `revenueAbstract`, `earnings` o ratios financieros, mediante clasificación de tokens. Está basado en `bert-base-uncased`, tiene 109,66 millones de parámetros y una ventana de contexto de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (Transformer encoder, 12 capas, 768 dimensiones ocultas) |
| Parametros totales | 109 661 417 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cal-BERT-SL1000 es un modelo Transformer encoder basado en la arquitectura BERT-base, con 12 capas, 12 cabezales de atencion y 768 dimensiones de embedding. Sobre esta base, se anade una cabeza de clasificacion de tokens (token classification) que asigna a cada token una de las 1000 etiquetas mas frecuentes de la taxonomia de calculo HiFi-KPI, concretamente las de nivel n=1.

El modelo se ajusto (fine-tuning) sobre el conjunto de datos HiFi-KPI, que contiene 1,65 millones de parrafos y 198 000 etiquetas unicas organizadas jerarquicamente, extraidas de los informes iXBRL de la SEC. El ajuste se realizo sobre las 1000 etiquetas mas frecuentes del dataset, lo que reduce la complejidad del espacio de etiquetas manteniendo la cobertura de los conceptos financieros mas comunes. El modelo fue presentado en el articulo "HiFi-KPI: A Dataset for Hierarchical KPI Extraction from Earnings Filings" (LREC 2026), que tambien publica el conjunto de datos y el codigo de entrenamiento.

## Capacidades

- Extraccion de KPIs financieros mediante clasificacion de tokens (token classification) en documentos iXBRL.
- Identificacion de entidades financieras de nivel n=1 en la taxonomia de calculo, como `revenueAbstract`, `earnings` y ratios financieros.
- Reconocimiento de entidades nombradas (NER) especializado en el dominio financiero de informes SEC.
- Parseo de documentos financieros estructurados (10-K y 10-Q) con reconocimiento de conceptos contables.
- Comprension de la taxonomia iXBRL de calculo y su jerarquia, lo que permite extraer conceptos de forma estandarizada.
- Soporte exclusivo del idioma ingles, dado que los informes SEC estan redactados en este idioma.

## Casos de uso

- Extraccion automatizada de KPIs para analisis financiero: el modelo puede procesar informes 10-K y 10-Q de forma automatica, extrayendo conceptos como ingresos, beneficios y ratios, lo que permite construir bases de datos financieras estructuradas sin intervencion manual.
- Normalizacion de datos financieros entre empresas: gracias a la taxonomia jerarquica, el modelo mapea conceptos contables que pueden tener nombres distintos en diferentes empresas hacia etiquetas estandarizadas, facilitando comparativas entre companias.
- Monitorizacion de carteras de inversion: un sistema puede alimentarse con los informes trimestrales de las empresas de una cartera y extraer automaticamente los KPIs relevantes para detectar cambios en la salud financiera.
- Automatizacion de procesos de compliance regulatorio: entidades financieras que necesitan verificar la coherencia de sus informes iXBRL pueden usar el modelo para comprobar que los conceptos declarados coinciden con la taxonomia de calculo esperada.
- Construccion de pipelines de RAG financiero: el modelo puede servir como componente de extraccion de entidades en un sistema de recuperacion aumentada por generacion, indexando documentos financieros por sus KPIs en lugar de solo por texto libre.
- Investigacion academica en NLP financiera: el modelo sirve como punto de partida o baseline para experimentos de extraccion de informacion estructurada en el dominio financiero, especialmente para evaluar tecnicas de clasificacion jerarquica de etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para Cal-BERT-SL1000 en la informacion disponible. El articulo asociado (HiFi-KPI) reporta que los modelos basados en encoder alcanzan mas de 0,906 de macro-F1 en la tarea de clasificacion de KPIs sobre el subconjunto HiFi-KPI-Lite, pero no se desglosa el rendimiento individual de este modelo concreto. Tampoco se proporcionan comparativas con otros sistemas de extraccion de KPIs.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (el modelo pesa 0,4 GB en safetensors), por lo que es viable en practicamente cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs de consumo como GTX 1650, RTX 3060 o superiores. Tambien es ejecutable en CPU sin problemas de latencia significativos para documentos de longitud moderada.
- Inferencia en CPU: viable para procesamiento por lotes o en tiempo real con latencias de decenas de milisegundos por documento.
- Opciones de despliegue: compatible con Hugging Face Transformers, ONNX Runtime, y cualquier framework que soporte modelos BERT estandar. Puede desplegarse en servicios como Hugging Face Inference Endpoints, AWS SageMaker o en local con FastAPI.
- Throughput estimado: no disponible, pero al ser un modelo BERT-base, el throughput es alto incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Cal-BERT-SL1000 | 109,66 M | 512 | Extraccion de KPIs financieros de informes SEC | no disponible |
| bert-base-uncased | 109,48 M | 512 | Modelo generalista de lenguaje | Apache 2.0 |
| FinBERT (ProsusAI) | 109,48 M | 512 | Analisis de sentimiento financiero | Apache 2.0 |
| Cal-FLANG-BERT-SL1000 | ~110 M | 512 | Misma tarea que Cal-BERT pero con base FLANG-BERT | no disponible |

La comparativa directa con modelos generalistas como bert-base-uncased o FinBERT no es significativa, ya que Cal-BERT-SL1000 esta especializado en una tarea muy concreta (extraccion de KPIs con taxonomia jerarquica) y no compite en tareas generales de NLP. La alternativa mas comparable es Cal-FLANG-BERT-SL1000, que utiliza la misma arquitectura de etiquetado pero parte de FLANG-BERT como modelo base, aunque no se dispone de datos comparativos de rendimiento entre ambos.

## Limitaciones y advertencias

- El modelo solo soporta ingles y esta entrenado exclusivamente con informes SEC (10-K y 10-Q), por lo que su rendimiento en otros tipos de documentos financieros (informes de earnings calls, notas de prensa, documentos europeos) es previsiblemente deficiente.
- La licencia no esta especificada, lo que genera incertidumbre sobre las condiciones de uso comercial y redistribucion. Se recomienda contactar con los autores antes de usarlo en produccion.
- El espacio de etiquetas se limita a las 1000 etiquetas mas frecuentes de la taxonomia, por lo que conceptos financieros poco comunes o especificos de ciertos sectores pueden no ser detectados.
- Al ser un modelo de clasificacion de tokens, no genera texto ni es adecuado para tareas generativas o de razonamiento complejo.
- El modelo puede presentar sesgos derivados de los datos de entrenamiento, que provienen exclusivamente de empresas que presentan informes ante la SEC, lo que excluye empresas privadas o de otros mercados.
- La extraccion de fechas es una fuente conocida de errores segun el analisis cualitativo del articulo HiFi-KPI, lo que puede afectar a KPIs que incluyan referencias temporales.
- No hay informacion sobre el numero de tokens de entrenamiento ni sobre el proceso de ajuste (hyperparametros, epocas, estrategia de muestreo), lo que limita la reproducibilidad del modelo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AAU-NLP/Cal-BERT-SL1000)
- [Dataset HiFi-KPI en Hugging Face](https://huggingface.co/datasets/AAU-NLP/HiFi-KPI)
- [Articulo HiFi-KPI en arXiv](https://huggingface.co/papers/2502.15411)
- [Codigo oficial en GitHub](https://github.com/aaunlp/HiFi-KPI)
- [Modelo relacionado Cal-FLANG-BERT-SL1000](https://huggingface.co/AAU-NLP/Cal-FLANG-BERT-SL1000)
