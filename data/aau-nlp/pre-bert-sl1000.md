# AAU-NLP/Pre-BERT-SL1000

## Resumen

Pre-BERT-SL1000 es un modelo de etiquetado de secuencias (token classification) basado en BERT, desarrollado por el grupo AAU-NLP de la Universidad de Aalborg. Se presenta en el paper "HiFi-KPI: A Dataset for Hierarchical KPI Extraction from Earnings Filings" (arXiv:2502.15411) y está diseñado para extraer indicadores clave de rendimiento (KPIs) financieros de los informes trimestrales y anuales presentados a la SEC (formularios 10-K y 10-Q). El modelo identifica entidades que se sitúan un nivel por encima en la taxonomía de presentación de iXBRL, como revenueAbstract, earnings o ratios financieros, mediante clasificación de tokens.

El problema que resuelve es la dificultad de transferir etiquetas KPIs entre empresas debido a la complejidad y granularidad de las taxonomías iXBRL obligatorias en los informes públicos. Al fine-tunear BERT-base sobre el dataset HiFi-KPI, que contiene 1,65 millones de párrafos y 198.000 etiquetas jerárquicas únicas, el modelo permite una extracción más consistente y portable de indicadores financieros. Con 109,6 millones de parámetros y una longitud de contexto de 512 tokens, es un modelo ligero y eficiente para tareas de NER financiero, relevante para el análisis automatizado de documentos financieros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (encoder transformer, 12 capas, 768 hidden size) |
| Parametros totales | 109.661.417 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No especificado (pesos en safetensors, cuantizable con herramientas externas) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (también disponible pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo parte de google-bert/bert-base-uncased y se fine-tunea como un clasificador de tokens (sequence labeling) sobre el dataset HiFi-KPI. La tarea consiste en asignar a cada token una etiqueta de la taxonomía de presentación de iXBRL, limitada a las 1.000 etiquetas más frecuentes y con profundidad jerárquica n=1 (es decir, solo el nivel inmediatamente superior de la taxonomía). El dataset HiFi-KPI se construye a partir de informes SEC (10-K y 10-Q) con etiquetas iXBRL ya presentes, lo que proporciona supervisión automática a gran escala. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado clásico. La innovación principal reside en el uso de una taxonomía jerárquica para estructurar la extracción de KPIs, lo que mejora la transferibilidad entre empresas frente a etiquetas planas.

## Capacidades

- Extracción de KPIs financieros mediante clasificación de tokens (NER financiero).
- Identificación de entidades como revenueAbstract, earnings, financial ratios y otros conceptos de la taxonomía de presentación iXBRL.
- Procesamiento de documentos financieros estructurados (informes 10-K y 10-Q).
- Soporte de etiquetas jerárquicas con profundidad n=1 (nivel superior de la taxonomía).
- Modelo de encoder puro, sin generación de texto ni soporte de tool calling.
- Sin capacidades multimodales (solo texto).
- Multilingüe: solo inglés.

## Casos de uso

- Extracción automatizada de KPIs de informes 10-K/10-Q: el modelo puede procesar párrafos de informes SEC y devolver las entidades financieras etiquetadas, facilitando la construcción de bases de datos de indicadores.
- Análisis financiero comparativo: al extraer KPIs de múltiples empresas, permite comparar métricas como ingresos o beneficios de forma estandarizada, superando las diferencias de taxonomía iXBRL.
- Automatización de pipelines de procesamiento de documentos financieros: integrable en flujos que parsean informes, extraen métricas y alimentan dashboards o modelos de predicción.
- Asistencia en auditoría y cumplimiento: ayuda a verificar que los KPIs reportados en los informes coinciden con las etiquetas taxonómicas, reduciendo errores manuales.
- Construcción de datasets financieros etiquetados: sirve como anotador automático para generar datos de entrenamiento en tareas downstream de NLP financiero.
- Monitorización de tendencias de KPIs: al extraer series temporales de indicadores de informes periódicos, permite analizar la evolución de métricas clave de una empresa o sector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El paper asociado (HiFi-KPI) reporta que los modelos basados en encoder alcanzan una macro-F1 superior a 0,906 en la tarea de clasificación de KPIs sobre el subconjunto HiFi-KPI-Lite, pero no se desglosa el rendimiento de Pre-BERT-SL1000 de forma individual. Tampoco se proporcionan métricas de extracción (precision, recall, F1 por etiqueta) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: con pesos en FP32, ~440 MB para el modelo (109,6 M parámetros × 4 bytes). Con cuantización a int8, ~110 MB. Inferencia en CPU viable para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, o superiores). También funciona en GPUs de datacenter como A100 o H100, aunque no son necesarias.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: transformers (Python), ONNX Runtime, TensorRT, o servidores de inferencia como Hugging Face Inference Endpoints. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, al ser un modelo de encoder.
- Latencia y throughput: no disponible. Dado el tamaño, en una GPU moderna se esperan latencias de milisegundos por secuencia de hasta 512 tokens, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (extracción de KPIs financieros con taxonomía jerárquica). Se podría comparar con otros BERT fine-tuneados para NER financiero (p. ej., FinBERT), pero no hay datos públicos de rendimiento relativo. El modelo es específico para la taxonomía HiFi-KPI, por lo que una comparación directa con modelos genéricos de NER financiero no sería equitativa. No disponible.

## Limitaciones y advertencias

- Solo soporta inglés, limitando su uso a informes en ese idioma.
- Entrenado únicamente con las 1.000 etiquetas más frecuentes de la taxonomía de presentación con n=1; no reconoce etiquetas de niveles más profundos ni conceptos poco frecuentes.
- Longitud de contexto fija de 512 tokens, por lo que párrafos más largos deben truncarse o dividirse, pudiendo perder información relevante.
- Riesgo de alucinación en entidades no vistas o con formulaciones atípicas; el modelo puede etiquetar incorrectamente tokens que no corresponden a KPIs.
- No es un modelo generativo: solo produce etiquetas por token, no explicaciones ni resúmenes.
- La licencia CC-BY-4.0 permite uso comercial y modificación, siempre que se atribuya la autoría. No hay restricciones de uso militar o de alto riesgo, pero se recomienda revisar los términos completos.
- El modelo depende de la calidad del dataset HiFi-KPI, que puede contener ruido en las etiquetas iXBRL originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AAU-NLP/Pre-BERT-SL1000
- Paper (arXiv): https://huggingface.co/papers/2502.15411
- Dataset HiFi-KPI: https://huggingface.co/datasets/AAU-NLP/HiFi-KPI
- Código (GitHub): https://github.com/aaunlp/HiFi-KPI
- Citación (LREC 2026): https://aclanthology.org/2026.lrec-1.30/
