# Hooshaai/bert-nasc-attention-sst2

## Resumen

`Hooshaai/bert-nasc-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `nasc_attention` de la librería NeuralOps, con complejidad efectiva subcuadrática (O(N) u O(N log N)) frente a la O(N²) de la multi-head attention estándar. Lo desarrolla el autor Taha Majlesi (organización NeuralOps / Hooshaai) y se publica como parte del denominado "Subquadratic Attention Zoo", un conjunto de checkpoints que pretenden demostrar que es posible reemplazar la atención de BERT por alternativas eficientes sin degradar la calidad en tareas de comprensión.

El modelo es un fine-tuning sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés) y se ha destilado desde el propio `bert-base-uncased` como teacher mediante el protocolo NeuralOps Cached Representation Distillation, que cachea offline las representaciones del teacher para no asignar VRAM adicional durante el entrenamiento del student. Según la model card, el student destilado alcanza un 91,51 % de accuracy en el split de validación de SST-2, frente al 91,63 % del teacher original y el 90,37 % del student antes de la destilación.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible para investigar mecanismos de atención eficientes sobre arquitecturas BERT estándar, con un coste de descarga muy bajo (unos 55 MB en FP16, solo pesos de atención y cabeza de clasificación) y un entrenamiento que el autor documenta en 48,7 segundos sobre una RTX 3090. No es un modelo de propósito general ni un LLM generativo: es un clasificador de frases en inglés con una única tarea evaluada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `nasc_attention` subcuadrática en las 12 capas (sustituye la MHA softmax estándar) |
| Parametros totales | 110 M (base BERT-base); el repo solo serializa los pesos de atención y la cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), serialización `attention_only_fp16` con código remoto (`modeling_neuralops_bert.py`) |
| Libreria | `neuralops` (compatible con `transformers` vía `trust_remote_code=True`) |
| Tarea / pipeline | `text-classification` (clasificación binaria de sentimiento, SST-2) |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de evaluación | GLUE / SST-2 (split de validación, 872 muestras) |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 24 GB |

## Arquitectura y entrenamiento

La arquitectura es un BERT-base estándar (12 capas, 768 de dimensión oculta, 110 M de parámetros) en el que se reemplaza la atención multi-cabeza softmax por `nasc_attention`, un mecanismo de la librería NeuralOps con complejidad efectiva O(N) u O(N log N). El resto del grafo (embeddings, feed-forward, normalizaciones) se mantiene congelado desde `bert-base-uncased`; el repositorio solo almacena los pesos de atención entrenados y la cabeza de clasificación, y el código remoto reconstruye el modelo completo inicializando la base congelada desde el checkpoint original de BERT. Esta serialización "attention-only" reduce la huella de descarga a unos 55 MB frente a los ~450 MB del BERT-base completo.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol en dos etapas: primero una alineación de subespacio oculto (Stage 1 Subspace Hidden Alignment) y después una combinación de KL sobre logits y entropía cruzada de la tarea (Stage 2 Logit KL + Task CE). El teacher (`bert-base-uncased` afinado en SST-2) se ejecuta offline y sus representaciones se cachean, de modo que durante el entrenamiento del student no se reserva VRAM para el teacher. El autor reporta 108 pasos de optimización, 48,7 s de duración total, un throughput efectivo de 18 182,7 tokens/s y un pico de VRAM de 23 021 MB en una RTX 3090. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de SST-2, ni si se aplicó RLHF/DPO (no procede en un clasificador de este tipo).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre frases y textos cortos, entrenada y evaluada en SST-2.
- Inferencia con atención subcuadrática: el mecanismo `nasc_attention` reduce el coste asintótico respecto a la atención cuadrática, lo que en teoría mejora la escalabilidad a secuencias largas (aunque la longitud de contexto efectiva no se documenta).
- Carga modular: solo se descargan los pesos de atención y la cabeza de clasificación; el resto del modelo se reconstruye desde `bert-base-uncased`.
- Compatibilidad con el ecosistema Hugging Face `transformers` mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- Carga de alto nivel mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` y `neuralops.hub.load_surgeried_model`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking": es un clasificador, no un modelo generativo.
- Capacidades multilingües: no, solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto en inglés: el modelo clasifica cada reseña como positiva o negativa; su tamaño (110 M de parámetros, ~55 MB de pesos extra) permite desplegarlo en CPU o en GPUs modestas con latencia baja para lotes grandes.
- Moderación de comentarios y filtrado de toxicidad indirecta: como clasificador binario rápido, puede prefiltrar comentarios negativos en pipelines de moderación antes de pasarlos a un modelo más caro.
- Monitorización de reputación de marca en redes sociales: procesamiento por lotes de menciones en inglés para agregar sentimiento por día, canal o producto, aprovechando el bajo coste de inferencia del checkpoint.
- Investigación en atención eficiente: sirve como baseline reproducible para comparar `nasc_attention` con atención softmax estándar en GLUE, dado que el autor publica métricas de teacher, student pre-KD y student post-KD.
- Destilación y compresión de modelos: el protocolo de destilación con representaciones cacheadas documentado (sin VRAM de teacher) es reutilizable para destilar otros transformers BERT-like en entornos con una sola GPU de 24 GB.
- Enseñanza y experimentación: ejemplo didáctico de sustitución modular de bloques de atención y de serialización "attention-only" en Hugging Face Hub, con código de carga en una línea.
- Clasificación de encuestas de satisfacción (NPS, CSAT) en inglés: integrable en formularios o backends para etiquetar respuestas abiertas de forma automática.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Metrica | Teacher (`bert-base-uncased`) | Student pre-KD (`nasc_attention`) | Student post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 90,37 % | 91,51 % | +1,15 % (post-KD vs pre-KD) |
| Cross-entropy de validación | 0,2428 | no calibrada | 0,2953 | convergido |

Telemetría de entrenamiento reportada por el autor:

| Metrica | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 3090 24 GB |
| Duración del entrenamiento | 48,7 s |
| Pasos de optimización | 108 |
| Throughput efectivo | 18 182,7 tokens/s |
| Pico de VRAM | 23 021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros mecanismos de atención eficiente.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un BERT-base de 110 M de parámetros, la inferencia en FP32 requiere aproximadamente 0,5-1 GB de VRAM; en FP16, en torno a 0,3-0,5 GB, más el overhead del runtime. Los pesos descargados son solo ~55 MB, pero el modelo completo se reconstruye desde `bert-base-uncased`.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque están sobredimensionadas para esta tarea.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código remoto de NeuralOps); la librería `neuralops` para carga modular; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo no aplican los formatos GGUF.
- Latencia y throughput: no se publican cifras de latencia de inferencia; el throughput de 18 182,7 tokens/s corresponde al entrenamiento, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-nasc-attention-sst2` | 110 M (solo ~55 MB serializados) | no disponible | 91,51 % | MIT | Hugging Face Hub |
| `google-bert/bert-base-uncased` (teacher, afinado SST-2) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face Hub |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | ~91 % (referencia habitual en la literatura, no verificada en esta ficha) | Apache 2.0 | Hugging Face Hub |
| `roberta-base` afinado SST-2 | 125 M | 512 tokens | ~94-95 % (referencia habitual, no verificada en esta ficha) | MIT | Hugging Face Hub |

La comparación con DistilBERT y RoBERTa se incluye como referencia de categoría; los valores de accuracy de esas filas no proceden de la información proporcionada y deben verificarse en sus respectivas model cards. El rasgo diferencial de este checkpoint no es la accuracy (prácticamente idéntica al teacher) sino la sustitución del mecanismo de atención por uno subcuadrático y la serialización modular de solo atención.

## Limitaciones y advertencias

- Solo inglés: el tokenizador y el entrenamiento están limitados a `en`; el rendimiento en otros idiomas no está evaluado y previsiblemente será pobre.
- Tarea única: clasificación binaria de sentimiento (SST-2). No es un modelo generativo ni sirve para preguntas y respuestas, resumen, código o razonamiento.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas en dominios distintos de SST-2 (por ejemplo, sarcasmo, dominios muy técnicos o textos largos), ya que no se documenta evaluación fuera de SST-2.
- Sesgos: no se documenta ningún análisis de sesgos; al heredar el preentrenamiento de `bert-base-uncased`, puede arrastrar sesgos de género, raza o dominio presentes en los corpus originales de BERT.
- Longitud de contexto: no se especifica en la model card; se asume la de BERT-base (512 tokens), pero no está confirmado para el mecanismo `nasc_attention`.
- Dependencia de código remoto: requiere `trust_remote_code=True` y la librería `neuralops`; esto implica ejecutar código de terceros y añade riesgo de mantenimiento si el repositorio o la API cambian.
- Serialización parcial: el repositorio no contiene los pesos completos; si `bert-base-uncased` deja de estar disponible o cambia, la reconstrucción del modelo puede fallar.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y sus condiciones se heredan para los pesos base.
- Madurez: 65 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; es un artefacto de investigación, no un modelo validado en producción.
- El autor cita el repositorio como `tahamajs/bert-nasc-attention-sst2` en los ejemplos de código, mientras que el ID de Hugging Face es `Hooshaai/bert-nasc-attention-sst2`; conviene verificar cuál es el identificador correcto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-nasc-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
- Paper de BERT (referencia del modelo base): https://arxiv.org/abs/1810.04805
- Paper de GLUE (referencia del benchmark): https://arxiv.org/abs/1804.07461
