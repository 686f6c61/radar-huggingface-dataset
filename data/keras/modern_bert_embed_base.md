# keras/modern_bert_embed_base

## Resumen

`keras/modern_bert_embed_base` es un modelo de embeddings de texto basado en la arquitectura ModernBERT, publicado en HuggingFace por el equipo de Keras dentro del ecosistema KerasHub. Se trata de un modelo orientado a la tarea `TextEmbedder`, es decir, a la generación de representaciones vectoriales densas de texto para tareas de recuperación, similitud semántica, clustering o clasificación downstream. El modelo se distribuye con pesos en formato Keras y es ejecutable indistintamente sobre los backends JAX, TensorFlow y PyTorch gracias a Keras 3.

La relevancia de esta ficha es doble. Por un lado, ModernBERT es una de las arquitecturas encoder más eficientes de la generación post-BERT, con atención local combinada con capas de atención global y RoPE, lo que permite contextos largos con coste cuadrático reducido. Por otro, su empaquetado nativo en KerasHub facilita su integración en pipelines multi-backend sin dependencias de la pila de HuggingFace Transformers.

No obstante, conviene señalar que la model card es automática y está incompleta: no se declaran licencia, idiomas, datos de entrenamiento ni resultados de evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una conversión reciente y aún no validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con atención local + global y RoPE) |
| Parametros totales | no disponible (estimables ~150M por la configuración: 22 capas, hidden 768) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible explícitamente; `local_attention_window` = 128 y `rotary_max_wavelength` = 160000 sugieren soporte de secuencias largas |
| Tipos de cuantizacion | no disponible (pesos en float32; cuantización posible vía conversión externa a GGUF/ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Keras (`.keras`/safetensors según empaquetado KerasHub), no se distribuye GGUF |
| Vocabulario | 50.368 tokens |
| Dimensión oculta | 768 |
| Dimensión intermedia | 1.152 |
| Número de capas | 22 |
| Cabezas de atención | 12 |
| Ventana de atención local | 128 |
| Atención global cada N capas | 3 |
| Rotary max wavelength | 160.000 (global), 10.000 (local) |
| Layer norm epsilon | 1e-5 |
| Tamaño del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ModernBERT, un encoder transformer que sustituye la atención completa por una combinación de atención local deslizante (ventana de 128 tokens) y capas de atención global intercaladas cada 3 capas. Esta hibridación reduce el coste computacional en secuencias largas manteniendo la capacidad de mezclar información a distancia. Incorpora codificación posicional rotatoria (RoPE) con dos longitudes de onda distintas para atención local y global, además de normalización previa (pre-norm) y activaciones GeGLU en la capa feed-forward, siguiendo el diseño original de ModernBERT.

La configuración declara `trainable: True`, lo que indica que el backbone está pensado para fine-tuning sobre tareas de embedding. Sin embargo, la model card no aporta información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, ni si se aplicaron técnicas de contraste (SimCSE, DPO, RLHF) o destilación. Tampoco se especifica si los pesos provienen de un checkpoint oficial de ModernBERT convertido a Keras o de un entrenamiento propio. Esta ausencia de trazabilidad es una limitación importante para evaluar su calidad frente a alternativas.

## Capacidades

- Generación de embeddings densos de texto para similitud semántica y recuperación de información.
- Soporte de contexto potencialmente largo gracias a la ventana de atención global y RoPE con wavelength 160.000, aunque la longitud máxima efectiva no está declarada.
- Compatibilidad multi-backend: ejecución en JAX, TensorFlow y PyTorch a través de Keras 3.
- Fine-tuning sobre tareas downstream de clasificación, ranking o retrieval mediante la cabeza `TextEmbedder`.
- Integración nativa con KerasHub (`keras_hub.models.ModernBertBackbone` y variantes).
- No se declaran capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento explícito; es un encoder de embeddings, no un modelo generativo.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Búsqueda semántica en bases documentales: el modelo puede indexar fragmentos de texto y generar embeddings para un motor de recuperación vectorial (FAISS, Qdrant, pgvector). Su ventana de atención local de 128 tokens con capas globales permite manejar pasajes de varios cientos de tokens sin degradación severa.
- Clasificación de tickets de soporte: fine-tuning de la cabeza de clasificación sobre embeddings del encoder para categorizar incidencias por área, urgencia o sentimiento en pipelines de atención al cliente.
- Deduplicación y clustering de contenidos: agrupación de artículos, reseñas o publicaciones mediante similitud coseno de embeddings, útil en sistemas de moderación o curación editorial.
- Reranking en pipelines RAG: uso como modelo de reranking ligero (bi-encoder) para reordenar los candidatos recuperados por un retriever de primera etapa antes de pasarlos a un LLM generador.
- Detección de similitud y plagio: comparación de pares de textos para sistemas académicos o editoriales, aprovechando la representación densa frente a métodos léxicos tipo TF-IDF.
- Extracción de features para modelos tabulares: generación de embeddings que alimentan clasificadores downstream (XGBoost, regresión logística) en problemas con texto libre y pocos datos etiquetados.
- Integración en stacks Keras existentes: equipos que ya entrenan con Keras 3 pueden incorporar el encoder sin introducir la dependencia de Transformers, manteniendo un único grafo computacional multi-backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es automática y no incluye métricas de MTEB, retrieval, clasificación ni comparaciones con otros encoders. Tampoco se han encontrado evaluaciones independientes en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,6 GB de pesos, más activaciones; en la práctica, menos de 2 GB para batches pequeños.
- VRAM estimada en float16/bfloat16: ~0,3 GB de pesos; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia local; A100/H100 solo justificables para fine-tuning a gran escala o serving de alto throughput.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: KerasHub con backend JAX, TensorFlow o PyTorch; exportación a ONNX o TorchScript para servir con ONNX Runtime o Triton; conversión a GGUF para llama.cpp no está soportada de forma nativa y requeriría herramientas externas.
- Latencia y throughput: no disponibles; al ser un encoder de ~150M de parámetros, se espera un throughput de varios cientos a miles de secuencias por segundo en GPU moderna con batches adecuados, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `keras/modern_bert_embed_base` | ~150M (estimado) | no declarado (ventana local 128, RoPE 160k) | no disponible | Keras | KerasHub, 0 descargas |
| `answerdotai/ModernBERT-base` | 149M | 8.192 tokens | Apache 2.0 | safetensors | HuggingFace, ampliamente usado |
| `BAAI/bge-base-en-v1.5` | 109M | 512 tokens | MIT | safetensors, GGUF | HuggingFace, muy usado en RAG |
| `sentence-transformers/all-MiniLM-L6-v2` | 22M | 256 tokens | Apache 2.0 | safetensors, ONNX | HuggingFace, estándar en embeddings ligeros |

La comparación directa con `answerdotai/ModernBERT-base` es la más pertinente por compartir arquitectura, pero este checkpoint de Keras no declara si deriva de él ni si ha sido fine-tuned para embeddings. Frente a `bge-base-en-v1.5` y `all-MiniLM-L6-v2`, la ventaja potencial de ModernBERT es el contexto largo, pero la falta de benchmarks impide confirmar que este empaquetado concreto lo aproveche.

## Limitaciones y advertencias

- La model card es automática y no documenta licencia, idiomas, datos de entrenamiento ni evaluación; no es apta para producción sin validación previa.
- No hay resultados de benchmarks publicados; se desconoce su calidad en MTEB, retrieval o clasificación frente a alternativas establecidas.
- Al ser un encoder de embeddings, no genera texto ni soporta tool calling, agentes o razonamiento multi-step; no debe confundirse con un LLM.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de embeddings poco discriminativos si el modelo no fue entrenado con objetivos contrastivos adecuados.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; hay que contactar con el autor o asumir el riesgo legal.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria y posible inestabilidad del artefacto.
- La longitud máxima de contexto efectiva no está declarada; la ventana local de 128 tokens puede limitar la calidad en pasajes largos si no se compensa con las capas globales.
- No se distribuyen pesos en GGUF ni ONNX, lo que complica el despliegue en stacks que no usen Keras.
- Idiomas soportados desconocidos; no se recomienda asumir multilingüismo sin evaluación empírica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keras/modern_bert_embed_base
- Documentación de ModernBert en KerasHub: https://keras.io/api/keras_hub/models/modern_bert
- Documentación de Keras: https://keras.io/
- Keras 3 (multi-backend): https://keras.io/keras_3/
- Documentación de model cards de HuggingFace: https://huggingface.co/docs/hub/model-cards
- Keras en Wikipedia (EN): https://en.wikipedia.org/wiki/Keras
- Keras en Wikipedia (FR): https://fr.wikipedia.org/wiki/Keras
