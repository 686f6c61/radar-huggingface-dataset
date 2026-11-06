# EndOfTheWorld77/learn_hf_food_not_food_text_classifier-distilbert-base-uncased-1

## Resumen

`learn_hf_food_not_food_text_classifier-distilbert-base-uncased-1` es un modelo de clasificación de texto binaria obtenido mediante fine-tuning de DistilBERT base uncased. Lo publica el usuario EndOfTheWorld77 en Hugging Face y, por su nombre, está orientado a distinguir textos relacionados con comida ("food") de los que no lo están, aunque la model card no documenta explícitamente el dataset ni las etiquetas. Se trata de un artefacto de entrenamiento de tipo "generated_from_trainer", con la model card autogenerada y sin secciones de descripción, usos previstos o datos completadas por el autor.

Arquitectónicamente es un transformer encoder de la familia DistilBERT: una versión destilada de BERT-base con 6 capas, 66.955.010 parámetros totales y un cabezal de clasificación sobre la representación del token `[CLS]`. El contexto máximo heredado de DistilBERT es de 512 tokens. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 0,3 GB y licencia Apache 2.0.

Su relevancia práctica es limitada: con 15 descargas, 0 likes y una precisión reportada de 1,0 sobre un conjunto de evaluación no descrito, debe tratarse como una prueba de concepto o un ejemplo didáctico de fine-tuning, no como un clasificador listo para producción. Aun así, resulta útil como referencia de un pipeline mínimo de clasificación de texto con Transformers y como punto de partida para quien quiera reproducir el flujo con su propio dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredado de DistilBERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion dinamica posible via PyTorch/ONNX pero no documentada) |
| Idiomas soportados | no disponible (modelo base uncased entrenado principalmente en ingles; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un encoder transformer de 6 capas y 66 M de parámetros obtenido por destilación de BERT-base. Sobre esa base se ha añadido un cabezal de clasificación (`DistilBertForSequenceClassification`) y se ha realizado fine-tuning supervisado con `Trainer` de Transformers. No hay innovaciones arquitectónicas propias: es un ajuste estándar de clasificación.

Los hiperparámetros documentados son: learning rate 1e-4, batch size de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y 10 épocas. El entrenamiento consta de solo 70 pasos totales (7 pasos por época), lo que implica un conjunto de datos muy pequeño (del orden de decenas de ejemplos). La pérdida de validación baja de 0,0593 en la época 1 a 0,0006 en la época 10, y la accuracy se mantiene en 1,0 desde la primera época. No se documenta el dataset, la composición de las etiquetas, ni si hubo aumentación de datos o validación cruzada. Las versiones de framework declaradas son Transformers 5.12.1, PyTorch 2.12.1+cu132, Datasets 5.0.0 y Tokenizers 0.22.2.

## Capacidades

- Clasificación de texto binaria (o multiclase, no especificado) sobre secuencias de hasta 512 tokens.
- Inferencia rápida en CPU y GPU de gama baja gracias a sus 66 M de parámetros.
- Compatible con `pipeline("text-classification")` de Transformers y con Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni matemáticas.
- No tiene capacidades multimodales (sin visión ni audio).
- Capacidad multilingüe no declarada; el tokenizador uncased de DistilBERT está orientado a inglés.
- No dispone de modo "thinking" ni de salidas estructuradas más allá de las etiquetas del cabezal.

## Casos de uso

- Filtrado temático de contenido: usar el modelo para etiquetar titulares, reseñas o publicaciones como relacionadas con comida o no, integrándolo en un pipeline de preprocesado previo a un motor de búsqueda o recomendador.
- Moderación o enrutado en un foro: clasificar mensajes entrantes para dirigirlos al canal adecuado (gastronomía frente a otros temas) con un coste de inferencia mínimo.
- Etiquetado asistido en anotación de datasets: preetiquetar un corpus grande con este clasificador y revisar manualmente solo los casos de baja confianza, acelerando la creación de un dataset propio.
- Prototipado educativo: servir como ejemplo reproducible de fine-tuning de DistilBERT con `Trainer`, útil en talleres o tutoriales de Hugging Face.
- Baseline en experimentos de clasificación: establecer una referencia rápida antes de entrenar modelos más grandes o específicos de dominio.
- Microservicio de clasificación de baja latencia: desplegado con Text Embeddings Inference o un endpoint de Hugging Face, puede atender peticiones con latencia de milisegundos en CPU para volúmenes moderados.
- Pre-filtro en pipelines de datos: descartar documentos irrelevantes antes de pasarlos a un LLM generativo, reduciendo coste de tokens.

## Benchmarks y rendimiento

El model-index del autor no incluye resultados de benchmarks estándar (MMLU, GLUE, etc.). Los únicos datos disponibles son los de validación durante el entrenamiento, declarados por el autor:

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 1,0 | evaluación (no descrito) |
| Loss de validación | 0,0006 | evaluación (no descrito) |
| Loss de entrenamiento (epoca 1) | 0,3968 | train |
| Loss de entrenamiento (epoca 10) | 0,0007 | train |

No se han publicado resultados de benchmarks estandarizados en la información disponible. La accuracy de 1,0 debe interpretarse con cautela: con solo 70 pasos de entrenamiento y un conjunto de evaluación no documentado, es muy probable que el conjunto sea trivial o esté solapado con el de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 270 MB de pesos (66,9 M de parámetros × 4 bytes) más overhead de activaciones, aproximadamente 0,5-1 GB en total.
- VRAM estimada en fp16/bf16: unos 135 MB de pesos; en la práctica cabe en cualquier GPU con 2 GB o más.
- Cabe holgadamente en GPUs de consumo: GTX 1650, RTX 3050, RTX 4060, RTX 4090, e incluso en CPU.
- GPU de datacenter (A100, H100) innecesarias para este tamaño; útiles solo para procesar lotes masivos en paralelo.
- Opciones de despliegue: `transformers` pipeline, Text Embeddings Inference (tag declarado), Hugging Face Inference Endpoints (compatible), ONNX Runtime y TorchScript. No se declara compatibilidad explícita con vLLM, llama.cpp u Ollama (no aplicables a un encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de pocos milisegundos por secuencia en CPU moderna y throughput de miles de secuencias por segundo en GPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tuned) | 66,9 M | 512 | Clasificación binaria de texto | Apache 2.0 | Hugging Face (15 descargas) |
| distilbert-base-uncased (base) | 66,9 M | 512 | Modelo de lenguaje enmascarado / base para fine-tuning | Apache 2.0 | Hugging Face (ampliamente usado) |
| bert-base-uncased | 110 M | 512 | Modelo base para fine-tuning | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 | Modelo base para fine-tuning | MIT | Hugging Face |

La comparación relevante es con los modelos base: este checkpoint es un fine-tuning de DistilBERT sobre un dataset no documentado, por lo que su rendimiento solo es comparable en la tarea específica para la que fue entrenado. Frente a BERT-base o RoBERTa-base ofrece menor tamaño y latencia, a costa de capacidad representacional. No hay datos de benchmarks que permitan una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la composición, el dominio, el idioma y el equilibrio de clases, lo que impide evaluar su validez fuera del conjunto original.
- Accuracy de 1,0 sospechosa: con 70 pasos de entrenamiento y sin descripción del conjunto de evaluación, es probable que el conjunto sea trivial o esté contaminado; no debe tomarse como indicador de calidad real.
- Riesgo alto de sobreajuste: 10 épocas sobre un dataset muy pequeño con pérdida de entrenamiento cercana a cero.
- Idiomas no declarados: el tokenizador uncased de DistilBERT está orientado a inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: al no documentarse el dataset, no es posible evaluar sesgos de dominio, género, cultura o clase; un dataset pequeño amplifica cualquier sesgo presente.
- Alucinación: no aplica en sentido generativo (es un clasificador), pero sí puede producir etiquetas erróneas con alta confianza en entradas fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación hace recomendable una evaluación propia antes de desplegarlo en producción.
- Model card autogenerada y sin revisar: las secciones de descripción, usos previstos y datos están marcadas como "More information needed".
- No apto para tareas generativas, de razonamiento, tool calling ni agentes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/EndOfTheWorld77/learn_hf_food_not_food_text_classifier-distilbert-base-uncased-1)
- [Modelo base: distilbert-base-uncased](https://huggingface.co/distilbert/distilbert-base-uncased)
- [Documentación de DistilBERT en Transformers](https://huggingface.co/docs/transformers/model_doc/distilbert)
- [Documentación del pipeline de text-classification](https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline)
- [Text Embeddings Inference](https://github.com/huggingface/text-embeddings-inference)
