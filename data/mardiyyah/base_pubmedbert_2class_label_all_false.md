# Mardiyyah/base_pubmedbert_2class_label_all_false

## Resumen

`Mardiyyah/base_pubmedbert_2class_label_all_false` es un modelo de clasificación de tokens (token classification, etiquetado tipo IOB) obtenido por fine-tuning de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` sobre el conjunto de datos `OTAR3088/CeLLaTe-ner-2class-iob_final`. Lo desarrolla el usuario Mardiyyah y se publica bajo licencia Apache 2.0. El problema que aborda es el reconocimiento de entidades nombradas (NER) en texto biomédico en inglés, con un esquema de dos clases.

Arquitectura BERT base (encoder transformer) con 108.895.493 parámetros totales, pesos en safetensors y un repositorio de 0,4 GB. El modelo base BiomedBERT fue preentrenado sobre abstracts y texto completo de PubMed, lo que lo orienta al dominio biomédico. El fine-tuning se realizó con Transformers 4.48.2 y PyTorch 2.4.1, con 20 épocas configuradas y parada efectiva en la época 13.

Es relevante como ejemplo de modelo pequeño y desplegable en CPU para tareas de extracción de entidades en pipelines biomédicos, aunque su model card está generada automáticamente y carece de documentación sobre usos previstos, composición del dataset y limitaciones. El nombre del modelo (`all_false`) sugiere una variante de etiquetado concreto que no se documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer), fine-tuning para token classification |
| Parámetros totales | 108.895.493 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BiomedBERT es de 512 tokens, no confirmado en la información) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer BERT base afinado para clasificación de tokens con esquema IOB de dos clases. Parte de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un BERT base preentrenado en el dominio biomédico (abstracts y texto completo de PubMed). El fine-tuning se realizó sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`, orientado a NER biomédico.

Hiperparámetros de entrenamiento: learning rate 2e-05, batch de entrenamiento 16 con acumulación de gradiente de 2 (batch total 32), optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con warmup ratio 0,01, 20 épocas configuradas, precisión mixta nativa AMP y semilla 3407. El mejor resultado en validación se alcanzó en la época 8 (loss 0,0863; precision 0,7414; recall 0,6986; micro F1 0,7193; weighted F1 0,7188; macro F1 0,7272; accuracy 0,9843). No se documenta composición del dataset, número de tokens de entrenamiento ni uso de RLHF/DPO.

## Capacidades

- Clasificación de tokens (token classification) con esquema IOB de dos clases para NER en texto biomédico en inglés.
- Etiquetado de entidades en abstracts y texto biomédico gracias al preentrenamiento de dominio de BiomedBERT.
- Inferencia rápida en CPU y GPU por su tamaño (108,9 M de parámetros).
- Integración con la librería `transformers` (pipeline `token-classification`).
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-step: es un modelo discriminativo de etiquetado.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción de entidades biomédicas en abstracts de PubMed: el modelo etiqueta tokens con el esquema IOB de dos clases aprendido, adecuado para pipelines de minería de literatura científica.
- Preprocesado para revisiones sistemáticas: etiquetar menciones de entidades en grandes corpus de artículos para facilitar cribado y extracción de información.
- Anotación asistida de datasets NER: usar el modelo como preanotador y corregir manualmente, reduciendo el coste de anotación en dominios biomédicos.
- Indexación semántica de documentación clínica: extraer entidades para enriquecer índices de búsqueda sobre textos biomédicos en inglés.
- Servicio de inferencia ligero en CPU: al tener 108,9 M de parámetros y pesos en safetensors, puede desplegarse en contenedores sin GPU para tareas de etiquetado por lotes.
- Componente en pipelines de NLP biomédico con `transformers`: integrar el pipeline `token-classification` en flujos existentes de procesamiento de texto científico.
- Evaluación comparativa de esquemas de etiquetado: servir como referencia de fine-tuning de BiomedBERT con un esquema concreto de dos clases para experimentos de NER.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (mejor época, época 8):

| Métrica | Valor |
|---|---|
| Loss | 0,0864 |
| Precision | 0,7414 |
| Recall | 0,6986 |
| Micro F1 | 0,7193 |
| Weighted F1 | 0,7188 |
| Macro F1 | 0,7272 |
| Accuracy | 0,9843 |

Evolución por épocas (extracto):

| Época | Validation loss | Precision | Recall | Micro F1 | Macro F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 0,0620 | 0,5550 | 0,7274 | 0,6296 | 0,6512 | 0,9783 |
| 4 | 0,0646 | 0,7228 | 0,6865 | 0,7042 | 0,7112 | 0,9835 |
| 8 | 0,0863 | 0,7414 | 0,6986 | 0,7193 | 0,7272 | 0,9843 |
| 13 | 0,0986 | 0,7026 | 0,7340 | 0,7179 | 0,7267 | 0,9835 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el model-index no contiene resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-1 GB en FP32 (108,9 M de parámetros); menos de 0,5 GB en FP16. Cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), servidores de inferencia compatibles con `transformers`; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mardiyyah/base_pubmedbert_2class_label_all_false | 108,9 M | no disponible | Token classification (NER biomédico, 2 clases) | apache-2.0 | Hugging Face |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext | ~110 M (BERT base) | no disponible | Modelo base de dominio biomédico | no disponible en la información | Hugging Face |
| OTAR3088/CeLLaTe-ner-2class-iob_final (dataset) | no aplica | no aplica | Dataset NER biomédico | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Model card generada automáticamente: las secciones de descripción, usos previstos y datos de entrenamiento indican "More information needed".
- El nombre `all_false` sugiere una variante de etiquetado específica no documentada; verificar el comportamiento real antes de usarlo en producción.
- El esquema de dos clases limita el tipo de entidades que puede reconocer; no cubre esquemas NER más ricos.
- Solo inglés; no apto para texto en castellano u otros idiomas.
- Métricas moderadas (micro F1 0,7193, recall 0,6986) indican falsos negativos y positivos no despreciables.
- Riesgo de sesgo heredado del corpus PubMed y del dataset de fine-tuning, no evaluado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan condiciones adicionales ni procedencia de los datos de entrenamiento.
- Sin benchmarks estándar publicados; la evaluación se limita al conjunto de validación del autor.
- No es un modelo generativo: no debe usarse para generación de texto, razonamiento ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/base_pubmedbert_2class_label_all_false
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Dataset de fine-tuning: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
