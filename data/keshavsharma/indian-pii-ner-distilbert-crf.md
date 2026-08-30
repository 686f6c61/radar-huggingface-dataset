# keshavsharma/indian-pii-ner-distilbert-crf

## Resumen

El modelo `keshavsharma/indian-pii-ner-distilbert-crf` es un clasificador de tokens (token-classification) diseñado para detectar nombres de persona y direcciones en texto libre, con el objetivo de facilitar tareas de redacción o enmascaramiento de información personal identificable (PII). Fue desarrollado por keshavsharma y está publicado bajo licencia MIT. Se basa en el encoder `distilbert-base-multilingual-cased` al que se añade una capa CRF (Conditional Random Field) para mejorar la coherencia en los límites de las entidades.

El modelo resuelve un problema concreto: la identificación automática de dos categorías de PII (nombres y direcciones) en inglés, un paso habitual en pipelines de anonimización de datos. Su relevancia radica en que ofrece una solución ligera y de código abierto, entrenada específicamente con datos sintéticos de origen indio, lo que puede resultar útil en entornos donde se manejan documentos con nombres y direcciones de esa región. La arquitectura combina un transformer destilado con un decodificador probabilístico, y la longitud máxima de contexto es de 512 tokens, lo que limita su uso a fragmentos de texto relativamente cortos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder) + CRF (decodificador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida: un encoder transformer destilado (DistilBERT) que produce representaciones contextuales por token, seguido de una capa de clasificación lineal y un decodificador CRF. La capa CRF modela dependencias entre etiquetas consecutivas, lo que ayuda a generar secuencias de etiquetas más coherentes, especialmente en los límites de entidades como nombres o direcciones.

El entrenamiento se realizó sobre una combinación de dos conjuntos de datos públicos: `ai4privacy/pii-masking-200k` y `somukandula/maskara-indian-pii-200k`, ambos orientados a la detección de PII. Además, se aplicó una aumentación de datos consistente en duplicar el conjunto con un 30% de muestras convertidas a minúsculas, con el fin de hacer el modelo más robusto a variaciones de capitalización. No se especifican el número total de tokens de entrenamiento, el número de épocas ni la configuración de hiperparámetros.

## Capacidades

- Detección de entidades de tipo `NAME` (nombre de persona) y `ADDRESS` (dirección) en texto en inglés.
- Clasificación de tokens con etiquetas BIO (`B-NAME`, `I-NAME`, `B-ADDRESS`, `I-ADDRESS` y `O`).
- Adecuado para tareas de enmascaramiento o redacción de PII en documentos de texto.
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades multimodales.
- No dispone de modo de pensamiento ni generación de texto libre; es exclusivamente un modelo de etiquetado de secuencias.

## Casos de uso

- Redacción automática de PII en documentos legales: el modelo puede procesar contratos o formularios y marcar nombres y direcciones para su posterior enmascaramiento, reduciendo el esfuerzo manual en cumplimiento de normativas como GDPR o similares.
- Anonimización de bases de datos de clientes: aplicar el modelo sobre registros de texto (por ejemplo, comentarios o notas) para eliminar referencias personales antes de compartir datos con terceros.
- Preprocesamiento en pipelines de minería de texto: antes de alimentar un modelo de lenguaje grande, se pueden filtrar nombres y direcciones para evitar sesgos o fugas de información personal.
- Verificación de contenido publicado: detectar si un texto contiene datos personales no deseados antes de su publicación en foros o redes sociales.
- Preparación de conjuntos de datos para entrenamiento: limpiar corpus de texto anotando y eliminando entidades personales para construir datasets anonimizados.
- Integración en sistemas de atención al cliente: identificar automáticamente nombres y direcciones en conversaciones para enmascararlos en registros de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un informe de evaluación (`eval_report.txt`) con métricas de precisión, recall y F1 a nivel de entidad, pero los valores concretos no se han proporcionado en la documentación accesible.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni de GPU en la información disponible.
- Al tratarse de un modelo basado en DistilBERT (un transformer destilado de tamaño reducido), es razonable esperar que pueda ejecutarse en hardware consumer con al menos 4 GB de VRAM, aunque no hay datos confirmados.
- El tamaño del repositorio es de 1.1 GB, lo que sugiere que los pesos del modelo ocupan aproximadamente 250-300 MB (el resto puede corresponder a otros archivos como el tokenizador o el `eval_report.txt`).
- Para despliegue, el código de ejemplo proporcionado utiliza PyTorch y `transformers`; se podría servir con herramientas como Hugging Face Inference Endpoints o un servidor FastAPI, pero no se mencionan opciones específicas como vLLM u Ollama.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada. Existen alternativas conocidas como `dslim/distilbert-NER` (también basado en DistilBERT, pero orientado a entidades genéricas como personas, organizaciones y lugares) o modelos más grandes como `dslim/bert-base-NER`, pero no se han encontrado métricas ni características detalladas de estos en los resultados de búsqueda para realizar una comparación rigurosa. Por tanto, esta sección queda sin completar.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente con datos sintéticos o basados en plantillas, por lo que su rendimiento puede degradarse significativamente ante texto informal, ruidoso o con estructuras gramaticales complejas del mundo real.
- Solo detecta dos tipos de PII: nombres y direcciones. No cubre correos electrónicos, números de teléfono, identificaciones gubernamentales ni otro tipo de información sensible.
- La longitud máxima de secuencia es de 512 tokens; cualquier texto más largo será truncado, lo que puede provocar la pérdida de entidades situadas al final del documento.
- No es un modelo multilingüe a pesar de que el encoder base (`distilbert-base-multilingual-cased`) es multilingüe; el entrenamiento se realizó únicamente con datos en inglés y las etiquetas están pensadas para ese idioma.
- La arquitectura personalizada (DistilBERT + CRF) requiere un código de carga específico; no se puede utilizar directamente con `AutoModelForTokenClassification` de Transformers.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los datos de entrenamiento (los datasets mencionados) tengan licencias compatibles con su caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keshavsharma/indian-pii-ner-distilbert-crf
- Dataset `ai4privacy/pii-masking-200k`: https://huggingface.co/datasets/ai4privacy/pii-masking-200k
- Dataset `somukandula/maskara-indian-pii-200k`: https://huggingface.co/datasets/somukandula/maskara-indian-pii-200k
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Modelo similar `dslim/distilbert-NER`: https://huggingface.co/dslim/distilbert-NER
- Proyecto relacionado de sistema de privacidad PII (referencia de búsqueda): https://github.com/ShaikKarishma13/AI-PII-Privacy-System
