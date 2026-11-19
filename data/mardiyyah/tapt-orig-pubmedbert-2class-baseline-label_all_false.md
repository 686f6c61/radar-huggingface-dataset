# Mardiyyah/tapt-orig-pubmedbert-2class-baseline-label_all_false

## Resumen

El modelo `tapt-orig-pubmedbert-2class-baseline-label_all_false` es un ajuste fino (fine-tuning) de tipo token classification desarrollado por el usuario Mardiyyah sobre el checkpoint base `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-baseline`. Se trata de un BERT de dominio biomédico (PubMedBERT) adaptado mediante TAPT (Task-Adaptive Pre-Training) y posteriormente afinado para reconocimiento de entidades nombradas (NER) en textos clínicos en inglés, concretamente sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final` con etiquetado IOB de dos clases.

El modelo resuelve la tarea de extracción de entidades en dominios sanitarios, un paso previo habitual en pipelines de procesamiento de lenguaje natural clínico (estructuración de informes, codificación de diagnósticos, extracción de relaciones). Su relevancia radica en que sirve como línea base (baseline) reproducible para experimentos de NER biomédico, con métricas declaradas de precision 0,7128, recall 0,6995 y micro F1 de 0,7061 sobre el conjunto de evaluación.

Arquitectura BERT estándar con 108.895.493 parámetros, licencia Apache 2.0 y pesos en formato safetensors. No obstante, el nombre del modelo (`label_all_false`) sugiere una configuración de etiquetado particular que conviene verificar antes de reutilizarlo en producción, y la model card está generada automáticamente por el Trainer sin documentación adicional de uso previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), fine-tuning para token classification |
| Parametros totales | 108.895.493 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (valor tipico de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 segun checkpoint) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-baseline`, un checkpoint derivado de PubMedBERT con tokenizador propio y preentrenamiento adaptativo de dominio (TAPT) sobre corpus biomédico. Sobre esa base se aplica un fine-tuning supervisado para etiquetado de tokens con esquema IOB de dos clases, usando la cabeza de clasificación estándar de BERT para token classification.

Los hiperparámetros de entrenamiento declarados son: learning rate 2e-5, batch size de entrenamiento 16 con acumulación de gradiente de 2 pasos (batch efectivo 32), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con warmup del 1 %, 20 épocas, semilla 3407 y precisión mixta nativa (AMP). El entrenamiento se realizó con Transformers 4.48.2, PyTorch 2.4.1+cu121, Datasets 3.0.2 y Tokenizers 0.21.0. No se documenta composición del dataset, número de tokens de entrenamiento ni si hubo etapas de RLHF/DPO (no aplicables a un modelo discriminativo de este tipo).

## Capacidades

- Etiquetado de tokens (token classification) para reconocimiento de entidades nombradas en textos biomédicos en inglés.
- Clasificación con esquema IOB de dos clases sobre el dataset CeLLaTe-ner.
- Extracción de entidades en informes clínicos y literatura biomédica (uso previsto inferido de la tarea y del dominio del checkpoint base).
- Procesamiento de secuencias de entrada compatibles con BERT (típicamente hasta 512 tokens; no confirmado en la información disponible).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés (`en`).

## Casos de uso

- Extracción de entidades clínicas en informes: el modelo puede etiquetar secuencias de texto biomédico para identificar menciones de entidades (fármacos, diagnósticos, procedimientos, según el esquema del dataset CeLLaTe), integrándose como paso de preprocesado en pipelines de estructuración de historiales.
- Línea base para experimentos de NER biomédico: sirve como referencia reproducible (precision 0,7128, recall 0,6995, micro F1 0,7061) contra la que comparar nuevos modelos o estrategias de etiquetado en el mismo dataset.
- Anotación asistida (human-in-the-loop): el modelo puede preetiquetar corpus clínicos para que anotadores humanos revisen y corrijan, reduciendo el coste de construcción de datasets de NER.
- Enriquecimiento de bases de datos de literatura científica: procesamiento por lotes de resúmenes PubMed para extraer menciones de entidades y poblar índices de búsqueda semántica.
- Investigación en adaptación de dominio: al derivar de un checkpoint TAPT con tokenizador específico, es útil para estudiar el efecto del preentrenamiento adaptativo en tareas downstream de token classification.
- Despliegue ligero en CPU o GPU de gama baja: con ~109 M de parámetros y 0,4 GB de repo, puede ejecutarse en entornos con recursos limitados para tareas de inferencia por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluación del dataset `OTAR3088/CeLLaTe-ner-2class-iob_final` (checkpoint final, época 6 según la tabla de entrenamiento):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,0739 |
| Precision | 0,7128 |
| Recall | 0,6995 |
| Micro F1 | 0,7061 |
| Weighted F1 | 0,7060 |
| Macro F1 | 0,7150 |
| Accuracy | 0,9837 |

Evolución durante el entrenamiento (épocas 1 a 11):

| Epoca | Validation loss | Precision | Recall | Micro F1 | Macro F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 0,0608 | 0,5294 | 0,7042 | 0,6044 | 0,6239 | 0,9793 |
| 2 | 0,0529 | 0,6909 | 0,6884 | 0,6897 | 0,7013 | 0,9832 |
| 3 | 0,0595 | 0,6649 | 0,6977 | 0,6809 | 0,6927 | 0,9829 |
| 4 | 0,0606 | 0,6307 | 0,6958 | 0,6617 | 0,6696 | 0,9821 |
| 5 | 0,0633 | 0,7200 | 0,6819 | 0,7004 | 0,7071 | 0,9835 |
| 6 | 0,0737 | 0,7128 | 0,6995 | 0,7061 | 0,7150 | 0,9837 |
| 7 | 0,0700 | 0,6914 | 0,7107 | 0,7009 | 0,7027 | 0,9841 |
| 8 | 0,0819 | 0,7086 | 0,7014 | 0,7050 | 0,7127 | 0,9841 |
| 9 | 0,0849 | 0,7128 | 0,6995 | 0,7061 | 0,7119 | 0,9838 |
| 10 | 0,0928 | 0,7115 | 0,6744 | 0,6925 | 0,7023 | 0,9833 |
| 11 | 0,0881 | 0,6673 | 0,7070 | 0,6865 | 0,6979 | 0,9829 |

No se han publicado comparaciones con otros modelos en la información disponible. El model-index oficial no contiene resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB en fp32 para los ~109 M de parámetros, y menos de 0,5 GB en fp16; cifra orientativa, no declarada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, T4) es suficiente; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna, e incluso en CPU para inferencia por lotes de baja latencia.
- Opciones de despliegue: Transformers (pipeline `token-classification`), TGI, vLLM (soporte de modelos BERT para embeddings/clasificación), ONNX Runtime y llama.cpp no aplica (no es un modelo generativo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un BERT base en GPU moderna se espera un throughput alto en modo batch, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tapt-orig-pubmedbert-2class-baseline-label_all_false | 108,9 M | no disponible | NER biomedico (IOB 2 clases) | apache-2.0 | Hugging Face |
| PubMedBERT base (microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract) | ~110 M | 512 | Preentrenamiento biomedico, base para fine-tuning | MIT | Hugging Face |
| BERT base uncased | ~110 M | 512 | Preentrenamiento general, base para fine-tuning | Apache 2.0 | Hugging Face |

No se dispone de métricas comparativas publicadas entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia. Los datos de contexto de los modelos alternativos son valores típicos de la arquitectura BERT y no se han verificado en esta ficha.

## Limitaciones y advertencias

- El nombre `label_all_false` sugiere una configuración de etiquetado en la que todas las etiquetas podrían haberse mapeado a una clase negativa; conviene inspeccionar el `config.json` y el `id2label` antes de usar el modelo, ya que podría no producir etiquetas de entidad útiles.
- Model card generada automáticamente por el Trainer: no documenta uso previsto, composición del dataset ni limitaciones; falta información esencial para evaluar su robustez.
- Métricas moderadas: micro F1 de 0,7061 y macro F1 de 0,7150 indican un rendimiento limitado para producción en NER clínico, donde se suelen exigir F1 superiores a 0,85.
- Accuracy de 0,9837 engañosa: en tareas de etiquetado de tokens con fuerte desbalance (mayoría de tokens "O"), la accuracy no refleja el rendimiento real; hay que guiarse por F1.
- Solo inglés: no soporta castellano ni otros idiomas.
- Dominio restringido a texto biomédico/clínico; el rendimiento en texto general no está evaluado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en la extracción de entidades.
- Licencia Apache 2.0 permite uso comercial, pero el checkpoint base y el dataset de entrenamiento pueden tener sus propias condiciones que deben verificarse.
- Sin descargas ni likes: modelo sin validación comunitaria; no hay evidencia de uso en producción.
- Fecha de creación futura (2026-11-19) en los metadatos: posible inconsistencia que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/tapt-orig-pubmedbert-2class-baseline-label_all_false
- Checkpoint base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
- Perfil del autor: https://huggingface.co/Mardiyyah
