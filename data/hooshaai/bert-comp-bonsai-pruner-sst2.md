# Hooshaai/bert-comp-bonsai-pruner-sst2

## Resumen

`bert-comp-bonsai-pruner-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` y ajustado sobre GLUE SST-2, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps (Compressor Zoo). El modelo se presenta como el resultado de aplicar el motor de compresión `bonsai_pruner` (`bonsai_factory`, familia de pruning) sobre el BERT base original, con un rank de showcase `k=32` y un ratio de compresión físico declarado de `1.00x`, es decir, sin reducción efectiva de parámetros.

Arquitectónicamente es un transformer encoder BERT-base estándar: 12 capas, dimensión oculta 768 y 109.483.778 parámetros, con una cabeza de clasificación binaria para sentimiento (negativo/positivo). El contexto máximo es el nativo de BERT-base (512 tokens), y el modelo solo está entrenado y evaluado en inglés. Su relevancia es fundamentalmente metodológica: sirve como ejemplo reproducible del pipeline de compresión y "healing" con LoRA de NeuralOps, más que como un modelo de producción competitivo.

El dato clave es que, pese al nombre y a la parafernalia de compresión, el checkpoint empaquetado no reduce parámetros ni mejora la precisión: la accuracy reportada en SST-2 validation es 86,81 %, frente al 91,63 % del modelo profesor, una pérdida de paridad de -4,82 puntos. Es, por tanto, un artefacto de investigación y demostración de tooling, no un sustituto del BERT base ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimension oculta 768) con cabeza de clasificacion binaria |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (nativo de BERT-base; no se especifica otro valor en la informacion) |
| Tipos de cuantizacion | no disponible (el repo empaqueta `pytorch_model.bin` en precision original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en formato BERT (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas, preentrenado con objetivos MLM y NSP. Sobre esa base se realizó un ajuste supervisado para clasificación de sentimiento en GLUE SST-2, y posteriormente se aplicó el compresor `bonsai_pruner` de NeuralOps, descrito como un pruner con sparsity progresiva. El checkpoint serializado incluye, según la model card, los factores de bajo rango, buffers de cuantización y adaptadores LoRA "horneados" en el state dict.

El punto técnico crítico es que el pipeline de NeuralOps evalúa varios ranks (`k=256, 128, 64, 32`) y aplica "LoRA healing" (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) cuando la compresión zero-shot degrada más de 2,0 puntos con una reducción superior a 1,10x. En este caso, los cuatro ranks evaluados arrojan exactamente el mismo recuento de parámetros (109.483.778) y el mismo ratio físico (`1.00x`), lo que indica que el pruning no llegó a materializarse en una reducción real de pesos. La columna "LoRA Recovery Applied" figura como `False` para el rank `k=32`. La evaluación se realizó sobre las 872 muestras del split de validación de SST-2 en una NVIDIA GeForce RTX 3090 (24 GB).

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni detalles sobre RLHF/DPO (no aplicables a una tarea de clasificación).

## Capacidades

- Clasificación binaria de sentimiento en inglés (negativo/positivo) sobre textos de hasta 512 tokens.
- Ajuste específico para GLUE SST-2, con dominio limitado a reseñas y frases de opinión en inglés.
- Inferencia estándar vía `transformers` (`BertForSequenceClassification`) tras reconstruir la topología con `compress_model` de NeuralOps.
- Carga simplificada mediante la API `load_surgeried_model` del Hub de NeuralOps.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica polaridad positiva/negativa en textos cortos en inglés, adecuado para volcados de opiniones de e-commerce donde la latencia importa más que la precisión estado del arte.
- Moderación de comentarios a escala: al ser un BERT-base de 109 M de parámetros, puede desplegarse en CPU o GPU de gama baja para prefiltrar tono negativo en foros y secciones de comentarios.
- Enriquecimiento de pipelines de datos: etiquetado automático de grandes corpus de texto en inglés para entrenar modelos posteriores o construir dashboards de opinión.
- Baseline de investigación en compresión de modelos: sirve como referencia reproducible del pipeline `bonsai_pruner` + LoRA healing de NeuralOps para comparar estrategias de pruning.
- Evaluación de tooling de compresión: útil para validar la integración de NeuralOps con `transformers` y medir el coste real de la reconstrucción topológica en producción.
- Filtrado de feedback en soporte técnico: clasificación rápida de tickets o encuestas de satisfacción en inglés para priorizar casos negativos.
- Docencia y prototipado: ejemplo ligero de fine-tuning y compresión sobre SST-2 para cursos de NLP o pruebas de concepto.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados de forma independiente, `verified: false`):

| Modelo | Dataset / split | Metrica | Valor |
|---|---|---|---|
| `bert-comp-bonsai-pruner-sst2` (k=32) | GLUE SST-2, validation (872 muestras) | Accuracy | 86,81 % |
| Profesor `google-bert/bert-base-uncased` fine-tuned SST-2 | GLUE SST-2, validation | Accuracy | 91,63 % |
| Delta de paridad | GLUE SST-2, validation | Accuracy | -4,82 pp |

Evaluación multi-rank declarada por el autor:

| Rank (k) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Healed Acc | Paridad vs profesor |
|---|---|---|---|---|---|
| 256 | 1,00x | 109.483.778 (-0,0 %) | 86,81 % | 86,81 % | -4,82 pp |
| 128 | 1,00x | 109.483.778 (-0,0 %) | 86,81 % | 86,81 % | -4,82 pp |
| 64 | 1,00x | 109.483.778 (-0,0 %) | 86,81 % | 86,81 % | -4,82 pp |
| 32 (empaquetado) | 1,00x | 109.483.778 (-0,0 %) | 86,81 % | 86,81 % | -4,82 pp |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y no serían aplicables a un modelo de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB de pesos (109,5 M parámetros × 4 bytes), más activaciones y overhead; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En FP16/BF16: alrededor de 0,22 GB de pesos, si se convierte manualmente (no se distribuyen pesos en media precisión).
- GPU recomendadas: cualquier GPU moderna; el autor realizó la evaluación en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware. Funciona en RTX 4090, A100, H100 y también en GPUs de gama de entrada (GTX 1650, T4).
- Cabe en GPU de consumo sin problema; también es viable en CPU para inferencia por lotes con throughput moderado.
- Opciones de despliegue: `transformers` + PyTorch (flujo documentado), y la API `load_surgeried_model` de NeuralOps. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI; al ser un BERT de clasificación, los servidores de inferencia de LLM no son el entorno natural.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 val (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-bonsai-pruner-sst2` | 109,5 M | 512 | 86,81 % | MIT | Hugging Face (45 descargas) |
| `google-bert/bert-base-uncased` fine-tuned SST-2 (profesor) | 109,5 M | 512 | 91,63 % (declarado por el autor) | Apache 2.0 (modelo base) | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta informacion | Apache 2.0 | Hugging Face |
| `roberta-base` fine-tuned SST-2 | 125 M | 512 | no disponible en esta informacion | MIT | Hugging Face |

La comparativa con DistilBERT y RoBERTa se ofrece como referencia de categoría; no se dispone de sus cifras exactas en SST-2 dentro de la información proporcionada, por lo que no se incluyen valores numéricos para evitar datos inventados.

## Limitaciones y advertencias

- El checkpoint no aplica compresión real: el ratio físico es `1.00x` y el recuento de parámetros es idéntico al de BERT-base, por lo que no ofrece ventajas de tamaño ni de velocidad frente al modelo original.
- Pérdida de precisión significativa: 86,81 % frente al 91,63 % del profesor (-4,82 pp), lo que lo hace inferior al BERT base ajustado en la misma tarea.
- El resultado de 86,81 % está marcado como `verified: false` en el model-index; no ha sido validado de forma independiente.
- Solo inglés: no apto para clasificación de sentimiento en castellano u otros idiomas sin reentrenamiento.
- Dominio restringido a SST-2 (reseñas y frases de opinión); el rendimiento puede degradarse en textos técnicos, jerga o dominios especializados.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en casos ambiguos, sarcasmo o negaciones complejas.
- Sesgos heredados de BERT-base y de SST-2: posibles sesgos de género, raza o registro presentes en los datos de preentrenamiento y ajuste.
- Dependencia del ecosistema NeuralOps: la carga requiere reconstruir la topología con `compress_model` antes de aplicar el state dict; sin ese paso, la carga con `transformers` estándar puede fallar o dar resultados incorrectos.
- Licencia MIT permite uso comercial, pero el modelo base BERT tiene su propia licencia Apache 2.0 que conviene revisar.
- El repositorio tiene 45 descargas y 0 likes, lo que sugiere escasa validación por parte de la comunidad; no se recomienda para producción sin evaluación propia.
- El nombre del repo en la model card (`tahamajs/bert-comp-bonsai-pruner-sst2`) difiere del ID real (`Hooshaai/bert-comp-bonsai-pruner-sst2`), lo que puede causar errores en scripts copiados literalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-comp-bonsai-pruner-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del pruner: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/bonsai_pruner.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
