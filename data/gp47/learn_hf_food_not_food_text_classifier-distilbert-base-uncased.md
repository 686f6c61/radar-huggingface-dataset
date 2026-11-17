# gp47/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`gp47/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased` sobre un dataset no documentado por el autor. El modelo resuelve una tarea binaria de clasificación de textos relacionados con alimentación (la nomenclatura sugiere la distinción entre "comida" y "no comida", aunque la model card no lo confirma explícitamente). Lo publica el usuario `gp47` en Hugging Face bajo licencia Apache 2.0, con 83 descargas y sin likes en el momento de la consulta.

Se trata de un modelo pequeño, de 66.955.010 parámetros, derivado de DistilBERT, un transformer encoder de 6 capas destilado de BERT-base. Su relevancia es limitada al ámbito de la experimentación y el aprendizaje: el nombre del repositorio (`learn_hf_...`) y la propia model card, generada automáticamente por el Trainer con múltiples secciones "More information needed", indican que se trata de un artefacto de formación más que de un modelo listo para producción. No obstante, sirve como ejemplo canónico de fine-tuning ligero de un clasificador de texto con `transformers` y como base para tareas de filtrado binario de contenido.

El modelo se distribuye en formato safetensors con un tamaño de repositorio de 2,1 GB, lo que incluye pesos y artefactos del entrenamiento. Su contexto máximo viene determinado por el tokenizador de DistilBERT (512 tokens), aunque este dato no se explicita en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el tokenizador de DistilBERT admite hasta 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion via librerias externas) |
| Idiomas soportados | No disponibles (modelo base `uncased` entrenado originalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder de 6 capas, 12 cabezas de atención y dimensión oculta de 768, con 66 millones de parámetros, destilado de BERT-base mediante knowledge distillation. Sobre esta base se añade una cabeza de clasificación de secuencias (`DistilBertForSequenceClassification`), presumiblemente con dos etiquetas dado el nombre del modelo, aunque el número exacto de etiquetas no se especifica en la información disponible.

El entrenamiento se realizó con el `Trainer` de Hugging Face y los siguientes hiperparámetros: learning rate de 1e-4, batch size de 32 (entrenamiento y evaluación), semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal y 10 épocas. El dataset de entrenamiento no está documentado ("unknown dataset" según la model card). El proceso consta de solo 70 pasos totales (7 pasos por época), lo que indica un conjunto de entrenamiento muy reducido (aproximadamente 224 ejemplos con batch size 32). No se menciona RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto binaria (o multiclase, no confirmado) sobre textos cortos, presumiblemente para distinguir contenido relacionado con alimentación.
- Generación de etiquetas con puntuaciones de confianza mediante la pipeline `text-classification` de `transformers`.
- Inferencia rápida en CPU y GPU de gama baja gracias a su tamaño reducido (66 M de parámetros).
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints de Hugging Face, según los tags del repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües no garantizadas: el modelo base es `uncased` entrenado principalmente en inglés y el dataset de fine-tuning es desconocido.

## Casos de uso

- Filtrado de contenido en un pipeline de ingestión de datos: el modelo puede clasificar textos entrantes y descartar los que no correspondan a la categoría de interés antes de pasarlos a un modelo mayor, reduciendo coste computacional.
- Etiquetado automático de un corpus pequeño de recetas o descripciones de productos alimentarios: dado su tamaño, puede ejecutarse en lote sobre CPU para preetiquetar datos que luego se revisen manualmente.
- Prototipado rápido de clasificadores binarios: sirve como plantilla para experimentar con fine-tuning de DistilBERT usando el `Trainer` de Hugging Face y comparar hiperparámetros.
- Docencia y aprendizaje de Hugging Face: el repositorio (`learn_hf_...`) y la model card autogenerada lo convierten en un ejemplo didáctico de un flujo completo de entrenamiento y publicación.
- Servicio ligero de clasificación en un endpoint de Hugging Face: con 66 M de parámetros y compatibilidad con TEI, puede desplegarse como microservicio de bajo coste para una categoría concreta.
- Componente de un sistema de moderación o enrutado: como primer filtro barato antes de invocar un LLM mayor, clasificando si un texto pertenece al dominio alimentario y derivando el resto a otro flujo.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (evaluación sobre un conjunto no documentado) son los siguientes:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0.0002 |
| Accuracy (evaluacion final) | 1.0 |

El `model-index` del repositorio no contiene resultados adicionales. No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. La accuracy de 1.0 debe interpretarse con cautela: con solo 70 pasos de entrenamiento y un conjunto de evaluación presumiblemente muy pequeño, es probable que exista sobreajuste o fuga de datos entre entrenamiento y evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB (66,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16: aproximadamente 135 MB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU sin GPU dedicada.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM; para lotes grandes se recomienda RTX 3060 o superior, aunque el modelo no aprovecha GPUs de gama alta (A100, H100) por su tamaño.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, ONNX Runtime y `optimum` para exportación. No se documenta soporte nativo de vLLM, llama.cpp u Ollama (son frameworks orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU para lotes pequeños, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gp47/learn_hf_food_not_food_text_classifier-distilbert-base-uncased | 66,9 M | No disponible (tokenizador hasta 512) | Apache 2.0 | Hugging Face, 83 descargas | Fine-tuning no documentado, accuracy 1.0 en eval no verificable |
| distilbert/distilbert-base-uncased | 66,9 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base sin fine-tuning; requiere cabeza de clasificación |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Hugging Face | Mayor tamaño y coste, referencia estándar en clasificación |
| ProsusAI/finbert | 110 M | 512 tokens | Apache 2.0 | Hugging Face | Clasificador financiero con dataset y evaluación documentados |

La comparación relevante es con el modelo base y con clasificadores de dominio público bien documentados: el modelo de `gp47` no aporta información sobre su dataset ni evaluación independiente, por lo que su utilidad práctica queda supeditada a la reproducibilidad del pipeline de entrenamiento.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "unknown dataset", lo que impide evaluar la cobertura, el equilibrio de clases y los posibles sesgos.
- Accuracy de 1.0 sospechosa: con solo 70 pasos y un conjunto de evaluación no descrito, es probable que el resultado refleje sobreajuste o un conjunto de evaluación trivial.
- Model card incompleta: secciones de descripción, usos previstos y datos de entrenamiento marcadas como "More information needed".
- Idiomas no documentados: el modelo base está entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador, no un generador), pero sí riesgo de clasificaciones erróneas con alta confianza fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento traslada al usuario la responsabilidad de verificar el origen de los datos.
- No apto para producción sin una evaluación propia sobre datos representativos del dominio objetivo.
- Sin mantenimiento aparente más allá de la actualización de noviembre de 2026; sin issues ni discusión pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gp47/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Pipeline de clasificación de texto: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
- Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
