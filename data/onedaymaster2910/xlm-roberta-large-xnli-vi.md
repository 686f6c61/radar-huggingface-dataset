# OneDayMaster2910/xlm-roberta-large-xnli-vi

## Resumen

xlm-roberta-large-xnli-vi es un modelo de inferencia de lenguaje natural (NLI) para vietnamita, obtenido mediante fine-tuning completo de FacebookAI/xlm-roberta-large sobre la configuración `vi` del dataset facebook/xnli. Lo publica el usuario OneDayMaster2910 en Hugging Face con licencia Apache 2.0 y un total de 559.893.507 parámetros. Resuelve una tarea concreta de clasificación de pares de frases: determinar si una hipótesis se deduce de una premisa (entailment), la contradice (contradiction) o no guarda relación suficiente (neutral).

El modelo es relevante porque cubre una laguna habitual en NLI multilingüe: los modelos XLM-R base rinden de forma desigual en vietnamita y las alternativas específicas para ese idioma son escasas. Aquí se ofrece un checkpoint afinado con todos los pesos entrenables (sin LoRA ni capas congeladas), entrenado durante 8 épocas sobre 21.000 muestras estratificadas y evaluado sobre el test completo de XNLI-vi (5.010 ejemplos), con una accuracy de 78,58 % y un macro F1 de 78,65 %. El repo pesa 2,3 GB y los pesos están en safetensors.

Se trata de un modelo exclusivamente de clasificación de texto, no generativo: no produce texto libre ni razonamiento multi-paso. Su utilidad está en pipelines de verificación factual, filtrado de datos, evaluación de coherencia y moderación semántica en vietnamita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), clasificación de secuencias con cabeza lineal de 3 etiquetas |
| Parámetros totales | 559.893.507 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens posicionales del backbone; entrenamiento y inferencia recomendada con max_length 256 |
| Tipos de cuantización | no disponible (el repo publica safetensors sin variantes GGUF/ONNX) |
| Idiomas soportados | vietnamita (vi); el backbone XLM-R es multilingüe pero el fine-tuning se limita a vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone es XLM-RoBERTa large, un transformer encoder de tipo RoBERTa con vocabulario SentencePiece multilingüe (250.000 tokens) y 24 capas. Sobre él se añade una cabeza de clasificación de secuencias con tres salidas (entailment, neutral, contradiction). El fine-tuning es de parámetros completos: backbone y cabeza se actualizan, sin PEFT, LoRA ni congelación de capas.

El entrenamiento usa la configuración `vi` de facebook/xnli. El split de train original tiene 392.702 ejemplos; el autor aplica muestreo estratificado para quedarse con 21.000 (7.000 por etiqueta, proporción 1:1:1). Validación y test se mantienen completos: 2.490 y 5.010 ejemplos respectivamente. Hiperparámetros: 8 épocas, learning rate 2e-5, max_length 256, optimizador adamw_torch, seed 42. La validación alcanza su mejor macro F1 (79,57 %) en la época 7, mientras que la pérdida de validación empieza a subir desde la época 4 (1,1986 en la 3 frente a 2,2984 en la 8), lo que indica sobreajuste a partir de la segunda mitad del entrenamiento. El autor menciona también `uitnlp/ViANLI` como dataset relacionado en la sección de datos, aunque el entrenamiento declarado se realiza sobre XNLI-vi.

## Capacidades

- Clasificación NLI de pares (premisa, hipótesis) en vietnamita con tres etiquetas: entailment, neutral y contradiction.
- Detección de contradicciones semánticas entre frases, útil para verificación factual.
- Detección de implicación lógica entre enunciados, útil para deduplicación semántica y enriquecimiento de bases de conocimiento.
- Salida de logits y probabilidades por clase vía `AutoModelForSequenceClassification`, apta para umbralización personalizada.
- Integración con el pipeline `text-classification` de Transformers y con `text_pair` para pares de frases.
- No dispone de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al vietnamita por el fine-tuning, pese al backbone multilingüe.

## Casos de uso

- Verificación factual en vietnamita: dado un fragmento de documento como premisa y una afirmación generada por otro modelo como hipótesis, clasificar como entailment, neutral o contradiction para marcar afirmaciones no respaldadas antes de publicarlas.
- Filtrado de datasets: usar el modelo para eliminar pares redundantes o contradictorios en corpus vietnamitas de instrucciones, preguntas-respuestas o resúmenes, aplicando la etiqueta entailment como criterio de paráfrasis y contradiction como criterio de descarte.
- Moderación semántica de respuestas: en un chatbot en vietnamita, comparar la respuesta candidata con la respuesta de referencia o con la política interna y bloquear las que contradigan hechos establecidos.
- Evaluación automática de resúmenes: comprobar si cada frase del resumen se deduce del documento fuente (entailment) o introduce información no presente (neutral/contradiction), como métrica complementaria a ROUGE.
- Enriquecimiento de bases de conocimiento: detectar relaciones de implicación entre entradas de ontologías o FAQ en vietnamita para fusionar duplicados y construir jerarquías.
- Búsqueda semántica y reranking: puntuar pares consulta-documento mediante la probabilidad de entailment para reordenar resultados de un buscador en vietnamita antes de un reranker neuronal más costoso.
- Anotación asistida: preetiquetar corpus NLI en vietnamita para revisión humana, reduciendo el coste de anotación en proyectos de lingüística computacional.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el test completo de XNLI-vi (5.010 ejemplos):

| Split | Accuracy | Macro F1 | Macro Precision | Macro Recall |
|---|---|---|---|---|
| xnli-vi test | 78,58 % | 78,65 % | 79,07 % | 78,58 % |

Mejor macro F1 en validación: 79,57 % (época 7).

Evolución por época (validación):

| Época | Train loss | Val loss | Val accuracy | Val macro F1 |
|---|---|---|---|---|
| 1 | 5,634 | 1,4285 | 70,44 % | 70,77 % |
| 2 | 4,0224 | 1,198 | 77,55 % | 77,57 % |
| 3 | 2,9917 | 1,1986 | 78,07 % | 77,98 % |
| 4 | 1,8288 | 1,3003 | 79,20 % | 79,16 % |
| 5 | 1,2206 | 1,5221 | 78,47 % | 78,70 % |
| 6 | 0,7197 | 1,6342 | 78,71 % | 78,76 % |
| 7 | 0,5185 | 1,9821 | 79,48 % | 79,57 % |
| 8 | 0,5637 | 2,2984 | 78,88 % | 78,96 % |

No se han publicado comparaciones directas con otros modelos NLI en vietnamita en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 2,3 GB solo de pesos (559,9 M parámetros × 4 bytes) más activaciones; con batch pequeño cabe en GPUs de 6-8 GB.
- VRAM en fp16/bf16: alrededor de 1,2 GB de pesos; viable en GPUs consumer de 4-6 GB con batch moderado.
- GPU recomendadas: RTX 3060/4060 (12/8 GB), RTX 4090, A100 o H100 para throughput alto con batches grandes; cualquier GPU con al menos 8 GB sirve para producción moderada.
- Despliegue: Transformers con `pipeline` o `AutoModelForSequenceClassification`, Hugging Face TGI, vLLM (soporte de modelos encoder para clasificación), ONNX Runtime y Triton. llama.cpp/Ollama no aplican al no haber pesos GGUF publicados.
- Latencia estimada: no disponible; al ser un encoder de 24 capas con max_length 256, la latencia por par es del orden de milisegundos en GPU moderna, pero no hay medición publicada.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento NLI-vi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneDayMaster2910/xlm-roberta-large-xnli-vi | 559,9 M | 512 (entrenado a 256) | 78,58 % accuracy, 78,65 % macro F1 en XNLI-vi test | Apache 2.0 | Hugging Face |
| FacebookAI/xlm-roberta-large (base, sin fine-tuning NLI) | 559,9 M | 512 | no disponible (no es un clasificador NLI) | MIT | Hugging Face |
| Modelos NLI multilingües derivados de XLM-R (p. ej. joeddav/xlm-roberta-large-xnli) | 559,9 M | 512 | no disponible para vi en la información consultada | MIT | Hugging Face |

No se dispone de datos de benchmarks de terceros para establecer una comparación cuantitativa fiable con alternativas específicas en vietnamita.

## Limitaciones y advertencias

- Entrenado con solo 21.000 ejemplos de los 392.702 disponibles en XNLI-vi train; el techo de rendimiento puede ser inferior al de un entrenamiento con el split completo.
- Sobreajuste evidente: la pérdida de validación crece de 1,1986 (época 3) a 2,2984 (época 8); el checkpoint publicado corresponde al final del entrenamiento, no al mejor de validación (época 7).
- Rendimiento limitado a vietnamita; el backbone es multilingüe pero el fine-tuning no transfiere garantías a otros idiomas.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en la clasificación: contradicciones sutiles, negaciones complejas y ambigüedad semántica pueden etiquetarse mal.
- Sesgos heredados de XNLI, que se construye a partir de traducciones de MNLI y puede arrastrar artefactos de traducción y sesgos culturales del corpus original en inglés.
- Longitud efectiva de 256 tokens en entrenamiento; pares más largos se truncan y pierden información.
- Licencia Apache 2.0 permite uso comercial, pero los datos XNLI y ViANLI tienen sus propias condiciones, que deben revisarse por separado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validación independiente por terceros.
- No apto para generación de texto, agentes, tool calling ni tareas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneDayMaster2910/xlm-roberta-large-xnli-vi
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Dataset XNLI: https://huggingface.co/datasets/facebook/xnli
- Dataset ViANLI (referenciado en la model card): https://huggingface.co/datasets/uitnlp/ViANLI
- Paper XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Paper XNLI (XNLI: Evaluating Multilingual Textual Inference): https://arxiv.org/abs/1809.05053
