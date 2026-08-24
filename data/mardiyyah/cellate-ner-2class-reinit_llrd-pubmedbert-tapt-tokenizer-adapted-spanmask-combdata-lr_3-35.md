# Mardiyyah/CeLLaTe-ner-2class-reinit_llrd-pubmedbert-tapt-tokenizer-adapted-spanmask-combData-lr_3.35

## Resumen

CeLLaTe-ner-2class-reinit_llrd-pubmedbert-tapt-tokenizer-adapted-spanmask-combData-lr_3.35 es un modelo de reconocimiento de entidades nombradas (NER) de dos clases, especializado en el dominio biomédico. Fue desarrollado por Mardiyyah como parte de la familia CeLLaTe, que aborda la extracción de entidades relacionadas con células y tejidos a partir de literatura científica. El modelo parte de un PubMedBERT preentrenado al que se le aplicó un proceso de adaptación de tokenizador y *task-adaptive pre-training* (TAPT) con *span masking* sobre datos combinados, y posteriormente se ajustó con el dataset OTAR3088/CeLLaTe-ner-2class-iob_final.

Con 110 millones de parámetros, se trata de un modelo de tamaño base que ofrece un equilibrio práctico entre rendimiento y coste computacional. Su relevancia actual radica en la necesidad de extraer información estructurada de la creciente literatura biomédica, donde los modelos específicos de dominio superan a los genéricos. Al estar publicado bajo licencia Apache 2.0, puede integrarse en flujos de investigación y producción sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (PubMedBERT) con cabecera de clasificación de tokens |
| Parametros totales | 110.409.221 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (estándar de BERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantización posible con herramientas externas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en PubMedBERT (Biomedical BERT), un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado exclusivamente con texto biomédico. Sobre esta base, el autor aplicó un proceso de adaptación del tokenizador y un entrenamiento previo adaptativo a la tarea (TAPT) utilizando *span masking* sobre un conjunto de datos combinado (modelo base `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-spanmask-combinedData`). Posteriormente, se realizó un ajuste fino (*fine-tuning*) para NER de dos clases sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`, con reinicialización de la capa de clasificación y una tasa de aprendizaje diferencial (*layer-wise learning rate decay*).

El entrenamiento se llevó a cabo durante 20 épocas con un tamaño de lote efectivo de 32 (16 con acumulación de gradientes de 2), optimizador AdamW con tasa de aprendizaje inicial de 3,35e-05, programador lineal con *warmup* del 2% y precisión mixta nativa (AMP). No se emplearon técnicas de RLHF ni DPO; se trata de un ajuste supervisado estándar para etiquetado de secuencias.

## Capacidades

- Reconocimiento de entidades nombradas biomédicas de dos clases (probablemente relacionadas con células y tejidos) en texto en inglés.
- Clasificación token a token con etiquetas IOB (Inside, Outside, Beginning), adecuada para extraer menciones de entidades en oraciones.
- Inferencia eficiente sobre secuencias de hasta 512 tokens, suficiente para la mayoría de abstracts y párrafos científicos.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta *tool calling* ni uso como agente autónomo.
- Capacidad multilingüe limitada al inglés, aunque el tokenizador adaptado puede manejar terminología biomédica especializada.

## Casos de uso

- Extracción de entidades celulares en abstracts de PubMed: el modelo puede procesar automáticamente resúmenes de artículos científicos para identificar menciones de tipos celulares, facilitando la construcción de bases de datos bibliográficas estructuradas.
- Anotación de informes de patología: en entornos clínicos, permite etiquetar términos celulares en informes de anatomía patológica, reduciendo el trabajo manual de codificación.
- Minería de textos en ensayos clínicos: aplicable para extraer entidades de interés en documentos de ensayos clínicos, apoyando la revisión sistemática de evidencia.
- Enriquecimiento de grafos de conocimiento biomédicos: las entidades extraídas pueden integrarse en ontologías y grafos de conocimiento para mejorar la búsqueda semántica y el descubrimiento de relaciones.
- Preprocesamiento para sistemas de pregunta-respuesta: al identificar entidades celulares, se puede alimentar a sistemas de QA biomédicos para acotar las respuestas a contextos relevantes.
- Monitorización de literatura en farmacovigilancia: detección de menciones de células en textos sobre reacciones adversas, contribuyendo a la vigilancia de seguridad de medicamentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que se trata de un modelo de clasificación de tokens y no de generación. La model card reporta las siguientes métricas de evaluación sobre el conjunto de validación del dataset de NER:

| Metrica | Valor |
|---|---|
| Loss | 0,0962 |
| Precision | 0,8066 |
| Recall | 0,7150 |
| Micro F1 | 0,7580 |
| Weighted F1 | 0,7578 |
| Macro F1 | 0,7688 |
| Accuracy | 0,9837 |

Estos valores corresponden al mejor resultado obtenido durante el entrenamiento (época 9) y son declarados por el autor. No se dispone de comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 para una secuencia de 512 tokens (110M parámetros). Con cuantización a int8 o int4, el consumo puede reducirse a 0,2-0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060, o incluso integradas con soporte CUDA. Para entrenamiento se recomienda al menos 8 GB de VRAM (por ejemplo, RTX 3070/4080).
- Es compatible con hardware de consumo (GPUs de gama media) y también puede ejecutarse en CPU con razonable velocidad (inferencia de ~100-200 tokens/segundo en CPUs modernas).
- Opciones de despliegue: puede servirse mediante Hugging Face Inference Endpoints, o usando librerías como `transformers` con PyTorch, o bien optimizarse con ONNX Runtime o TensorRT. También es compatible con `vLLM` (aunque no es óptimo para modelos encoder), y con `llama.cpp` si se convierte a GGUF, aunque no es el flujo habitual para BERT.
- Latencia estimada: en una GPU RTX 3090, la inferencia sobre una secuencia de 512 tokens tarda aproximadamente 10-20 ms; en CPU moderna, alrededor de 100-200 ms.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de la misma categoría (NER biomédico de dos clases). Como referencia cualitativa, se puede situar frente a alternativas genéricas de NER biomédico:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| CeLLaTe-ner-2class (este modelo) | 110M | 512 | PubMedBERT + TAPT + fine-tuning NER | Apache 2.0 |
| BioBERT (base) | 110M | 512 | BERT preentrenado en PubMed + PMC | Apache 2.0 |
| ClinicalBERT | 110M | 512 | BERT preentrenado en notas clínicas | MIT |
| PubMedBERT (base) | 110M | 512 | BERT preentrenado en abstracts PubMed | Apache 2.0 |

La ventaja de CeLLaTe-ner-2class es su adaptación específica a la tarea de entidades celulares, mientras que los otros modelos son generalistas biomédicos. No se dispone de métricas comparativas en el mismo dataset.

## Limitaciones y advertencias

- El modelo solo reconoce dos clases de entidades (definidas en el dataset CeLLaTe-ner-2class), por lo que no es adecuado para tareas NER con más categorías sin reentrenamiento.
- Su rendimiento está limitado al dominio biomédico en inglés; puede degradarse significativamente en textos generales o en otros idiomas.
- No se han documentado sesgos específicos, pero al entrenarse sobre literatura científica puede heredar sesgos de publicación (por ejemplo, infrarrepresentación de ciertos organismos o condiciones).
- Riesgo de alucinación en la clasificación: aunque es un modelo discriminativo, puede etiquetar incorrectamente términos ambiguos o fuera de vocabulario.
- La longitud de contexto está limitada a 512 tokens; documentos más largos requieren truncamiento o estrategias de ventana deslizante.
- La model card no proporciona información sobre el rendimiento en datos fuera de distribución ni sobre robustez ante ruido.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario debe verificar que los datos de entrenamiento originales (OTAR3088/CeLLaTe-ner-2class-iob_final) cumplan con sus propias condiciones de uso.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/Mardiyyah/CeLLaTe-ner-2class-reinit_llrd-pubmedbert-tapt-tokenizer-adapted-spanmask-combData-lr_3.35)
- [Modelo base en HuggingFace](https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-spanmask-combinedData)
- [Dataset de entrenamiento (referencia)](https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final)
- [Space de demostración (app.py)](https://d6108366.hf-mirror.com/spaces/OTAR3088/CeLLaTe/blob/main/app.py)
