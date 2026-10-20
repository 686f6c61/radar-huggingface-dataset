# elene06/lab6-trained

## Resumen

`elene06/lab6-trained` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `distilbert-base-uncased`, un transformer encoder destilado de BERT-base con 66.958.086 parámetros. Lo publica el usuario `elene06` en HuggingFace y, por los metadatos disponibles (prefijo `lab6`, card autogenerada por el `Trainer`), todo apunta a un ejercicio académico de un laboratorio de asignatura más que a un modelo de producción. No hay descripción del dataset, del esquema de etiquetas ni de los usos previstos.

El modelo resuelve una tarea de clasificación de secuencias (pipeline `text-classification`) sobre un corpus que el autor no documenta. Sobre el conjunto de evaluación declara una pérdida de 0,5283, una accuracy de 0,8783 y un F1 de 0,8779 tras dos épocas de entrenamiento. Es relevante únicamente como referencia de un fine-tuning de DistilBERT: su valor práctico depende por completo de que el esquema de etiquetas coincida con el caso de uso del usuario, algo que no se puede verificar con la información publicada.

Por tamaño y arquitectura es un modelo ligero: cabe en CPU, se puede cuantizar a menos de 100 MB en int8 y su ventana de contexto heredada de DistilBERT es de 512 tokens. La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre datos de entrenamiento, idiomas y etiquetas limita seriamente su adopción fuera de un contexto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base); 6 capas, 768 de dimensión oculta y 12 cabezas de atención según la documentación pública del modelo base, no confirmado en la model card |
| Parametros totales | 66.958.086 (safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredado de `distilbert-base-uncased`; no documentado en la model card) |
| Tipos de cuantizacion | No documentados por el autor; al ser un checkpoint `safetensors` en transformers es viable fp32, fp16/bf16, int8 dinámico (PyTorch) y ONNX Runtime / cuantización de GGUF vía conversión externa |
| Idiomas soportados | No disponible (el modelo base es `uncased` y de vocabulario inglés, pero el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repo de 1,6 GB, probablemente con checkpoints intermedios y estado del optimizador) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, destilado de BERT-base y con un vocabulario WordPiece de aproximadamente 30.000 tokens sin distinción de mayúsculas. Sobre esa base se ha añadido una cabeza de clasificación de secuencias entrenada de forma supervisada. La model card no especifica cuántas etiquetas tiene la cabeza, ni si la tarea es de clasificación binaria o multiclase, ni qué dataset se ha utilizado ("on an unknown dataset", literalmente en la card).

Los hiperparámetros sí están documentados: learning rate 5e-5, batch de entrenamiento y evaluación de 8, dos épocas, scheduler lineal, optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-8) y semilla 42, con 1.094 pasos totales y 547 por época. Eso equivale a unas 4.400 muestras de entrenamiento por época asumiendo acumulación de gradiente 1, es decir, un conjunto de datos pequeño (del orden de 4.400 ejemplos). No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias; el entrenamiento es supervisado clásico con pérdida de entropía cruzada.

El historial de entrenamiento muestra la pérdida de entrenamiento bajando de 0,6395 a 0,2814 mientras la de validación apenas se mueve de 0,5353 a 0,5283, con la accuracy subiendo de 0,8519 a 0,8783. Ese patrón indica sobreajuste a partir de la segunda época: el modelo mejora en train mucho más rápido de lo que generaliza. El stack declarado es Transformers 5.14.1, PyTorch 2.9.1+cu128, Datasets 5.0.0 y Tokenizers 0.22.2.

## Capacidades

- Clasificación de texto de secuencia completa (pipeline `text-classification`), con salida de etiqueta y puntuación de confianza.
- Clasificación multi-etiqueta o multiclase en función del esquema con el que se entrenó la cabeza, que no se especifica.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para párrafos, tickets breves, reseñas o titulares.
- Inferencia muy rápida en CPU y en GPU de gama baja, apta para lotes grandes.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta razonamiento multi-paso, agentes ni cadenas de pensamiento.
- Sin capacidades de visión, audio ni modalidad múltiple.
- Capacidad multilingüe no disponible: el autor no declara idiomas y el vocabulario del modelo base está orientado al inglés.

## Casos de uso

- Filtrado de tickets de soporte: usar el modelo como clasificador de primera etapa para enrutar incidencias a colas distintas (facturación, técnico, cuenta) siempre que el esquema de etiquetas entrenado coincida con esas categorías; su coste de inferencia en CPU lo hace viable para volúmenes altos.
- Moderación de comentarios: clasificar textos cortos de foros o reseñas en categorías de riesgo usando los 512 tokens de contexto, con un umbral de confianza calibrado a partir de la puntuación devuelta.
- Etiquetado semi-automático de datasets: pre-anotar corpus con el modelo y reservar la revisión humana para los casos de baja confianza, aprovechando el throughput alto de un encoder de 67 M de parámetros.
- Enrutamiento en pipelines RAG: clasificar la consulta del usuario antes de decidir qué índice o colección consultar, como componente ligero previo al modelo generativo.
- Clasificación de intención en un chatbot: detectar la intención de mensajes cortos de usuario en un flujo conversacional, con latencia de milisegundos en CPU.
- Análisis de sentimiento o temática en encuestas y formularios abiertos: procesar respuestas breves en lote sin GPU dedicada.
- Componente de evaluación en docencia: servir como referencia reproducible de un fine-tuning de DistilBERT con hiperparámetros e historial completos para prácticas de NLP.

En todos los casos, la condición previa es verificar el esquema de etiquetas real del checkpoint, dato que la model card no aporta.

## Benchmarks y rendimiento

La model card declara únicamente métricas sobre su propio conjunto de evaluación, sin especificar el dataset:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,5283 |
| Accuracy | 0,8783 |
| F1 | 0,8779 |
| Loss (entrenamiento, epoca 1) | 0,6395 |
| Loss (entrenamiento, epoca 2) | 0,2814 |
| Accuracy (validacion, epoca 1) | 0,8519 |
| F1 (validacion, epoca 1) | 0,8444 |

No se han publicado resultados en benchmarks estándar (MMLU, GLUE, SuperGLUE, HumanEval, GSM8K u otros) en la información disponible. El `model-index` del autor está vacío (`results: []`), por lo que no hay comparación oficial con otros modelos.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 268 MB; en fp16/bf16, unos 134 MB; en int8, unos 67 MB. El repo ocupa 1,6 GB por los checkpoints y el estado del optimizador, no por el peso final de inferencia.
- VRAM estimada: menos de 1 GB incluso con batch de 32 y secuencias de 512 tokens en fp32; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: ninguna en particular; funciona en RTX 3060, RTX 4090, T4, L4, A10, A100 y H100, pero el modelo está sobredimensionado para esas GPUs. Es perfectamente ejecutable en CPU.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, y en dispositivos de borde tipo Raspberry Pi 4/5 con cuantización int8.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, exportación a ONNX con Optimum y ONNX Runtime, TorchScript, y Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace). Servir con FastAPI o con un servidor de batching propio es suficiente; vLLM y TGI no aportan ventaja para un encoder de este tamaño.
- Latencia y throughput: no hay mediciones publicadas. Como referencia orientativa, un encoder de 6 capas y 67 M de parámetros suele procesar del orden de centenares a miles de secuencias cortas por segundo en CPU multinúcleo y bastantes más en GPU, pero son estimaciones no verificadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `elene06/lab6-trained` | 66,9 M | 512 tokens | Clasificación de texto (esquema desconocido) | Apache 2.0 | HuggingFace, 0 descargas |
| `distilbert-base-uncased` | 66,4 M aprox. | 512 tokens | Modelo base (MLM, sin cabeza de clasificación) | Apache 2.0 | HuggingFace, ampliamente usado |
| `bert-base-uncased` | 110 M aprox. | 512 tokens | Modelo base (MLM) | Apache 2.0 | HuggingFace, ampliamente usado |
| `roberta-base` | 125 M aprox. | 512 tokens | Modelo base (MLM) | MIT | HuggingFace, ampliamente usado |

El rendimiento no es comparable entre estos modelos: los tres alternativos son modelos base sin fine-tuning para una tarea concreta y este checkpoint está ajustado sobre un dataset no documentado, por lo que las métricas declaradas (accuracy 0,8783, F1 0,8779) no se pueden contrastar con las de ningún benchmark público.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado ("unknown dataset"): imposible evaluar sesgos, cobertura lingüística o dominios, y por tanto imposible saber si generalizará fuera de la distribución de entrenamiento.
- Esquema de etiquetas desconocido: la cabeza de clasificación está entrenada para un número de clases que la card no indica; sin inspeccionar `config.json` no se puede reutilizar el modelo.
- Sobreajuste probable: la pérdida de entrenamiento cae de 0,6395 a 0,2814 en la segunda época mientras la de validación pasa de 0,5353 a 0,5283. El checkpoint de la época 2 no es necesariamente el mejor para generalizar.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos con confianza alta en textos fuera de dominio; conviene calibrar umbrales con datos propios.
- Límite de 512 tokens: textos más largos se truncan y pierden información; no hay mecanismo de atención dispersa ni ventana deslizante documentada.
- Idiomas no declarados: el vocabulario `uncased` del modelo base está orientado al inglés; el comportamiento en castellano no está verificado y probablemente sea deficiente.
- Trazabilidad y mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin paper, sin demo y con la card autogenerada sin revisar. No hay garantía de soporte ni de versionado.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, pero no exime de las obligaciones sobre los datos de entrenamiento, que se desconocen.
- Versiones de framework declaradas (Transformers 5.14.1, PyTorch 2.9.1) pueden requerir un entorno concreto para reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elene06/lab6-trained
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
