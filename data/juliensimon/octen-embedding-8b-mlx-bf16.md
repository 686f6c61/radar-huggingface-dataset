# juliensimon/Octen-Embedding-8B-mlx-bf16

## Resumen

Octen-Embedding-8B es un modelo de embeddings de texto de 8 000 millones de parámetros, derivado de Qwen3-Embedding-8B y afinado por el equipo de Octen para tareas de recuperación de información (retrieval). Genera vectores densos de 4096 dimensiones con una ventana de contexto de 32 768 tokens y cubre más de 100 idiomas según su model card, lo que lo sitúa en la gama alta de los modelos de embedding orientados a búsqueda semántica y RAG.

El repositorio que se analiza aquí, `juliensimon/Octen-Embedding-8B-mlx-bf16`, no es una publicación oficial de Octen: es una conversión comunitaria a MLX con pesos en bfloat16 sin cuantizar (15,1 GB en disco), pensada para ejecutarse de forma nativa en Apple Silicon. El autor mantiene además variantes cuantizadas a 8 bits (8,0 GB) y 4 bits (4,3 GB), y conversiones equivalentes de las tallas 0,6B (1024 dimensiones) y 4B (2560 dimensiones) de la misma familia.

Su relevancia práctica es doble: por un lado, permite montar un pipeline de retrieval multilingüe de gama alta en un portátil Mac sin depender de GPU NVIDIA ni de servicios en la nube; por otro, la model card publica una evaluación de recuperación con datos reales de soporte técnico en cuatro idiomas, con una precisión top-1 del 78,2 % para la variante de 8B frente al 72,4 % de la de 4B y el 67,1 % de la de 0,6B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3, adaptado a extracción de embeddings |
| Parámetros totales | 8 000 millones (8B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens (32K) |
| Tipos de cuantización | bf16 sin cuantizar en este repositorio; 8-bit affine con group size 64 (8,0 GB) y 4-bit affine con group size 64 (4,3 GB) en los repositorios hermanos |
| Idiomas soportados | más de 100 idiomas según la model card del autor; etiquetas declaradas: en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx-embeddings`), bfloat16 |
| Dimensión del embedding | 4096 |
| Tamaño del repositorio | 15,1 GB |
| Pipeline | feature-extraction |
| Modelo base | Octen/Octen-Embedding-8B (afinado a su vez desde Qwen/Qwen3-Embedding-8B) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-Embedding-8B: un transformer decoder-only que, en lugar de generar tokens, devuelve como embedding el estado oculto del último token, normalizado. Sobre esa base, Octen realizó un ajuste fino orientado a recuperación (relación `finetune` declarada respecto a `Octen/Octen-Embedding-8B`). La conversión a MLX conserva la semántica del modelo original: no requiere prefijo de instrucción, de modo que consultas y documentos se embeben exactamente igual, y la salida es un vector de 4096 componentes.

No se dispone, en la información proporcionada, del volumen de tokens de entrenamiento, de la composición del dataset, ni de si se aplicaron fases de RLHF o DPO sobre el modelo base. Tampoco se documentan innovaciones adicionales de atención o decodificación (el modelo no decodifica). El detalle técnico más relevante que sí aporta la model card es de implementación: como los cálculos se hacen en bfloat16, se recomienda renormalizar los embeddings en float32 antes de calcular similitudes de coseno, para evitar pérdida de precisión numérica.

## Capacidades

- Generación de embeddings de texto densos de 4096 dimensiones para búsqueda semántica, recuperación (retrieval) y ranking.
- Similitud semántica entre frases y detección de paráfrasis o duplicados.
- Clustering y categorización de documentos a partir de sus vectores.
- Recuperación cross-lingüe: la model card demuestra que una consulta en francés recupera un artículo en inglés y una consulta en neerlandés encuentra el artículo correcto, también en inglés.
- Manejo de documentos largos gracias a la ventana de 32 768 tokens.
- Funcionamiento sin prefijo de instrucción: la misma función de embedding se aplica a consultas y a documentos.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo de extracción de características, no un modelo generativo.
- No procesa imágenes ni audio.

## Casos de uso

- Búsqueda semántica sobre bases de conocimiento de soporte: indexar los artículos de ayuda de la empresa con el modelo y embeber cada ticket entrante para recuperar los candidatos más relevantes antes de pasarlos a un LLM. La evaluación publicada en la model card replica exactamente este escenario con 170 tickets y 140 artículos.
- RAG multilingüe sin traducción previa: un usuario formula la pregunta en francés o neerlandés y el sistema recupera documentos en inglés directamente gracias al alineamiento cross-lingüe del espacio de embeddings.
- Enrutado y triaje de tickets: calcular la similitud entre el ticket y las categorías o colas de soporte definidas por la organización para asignarlo automáticamente al equipo correcto.
- Deduplicación de documentación técnica: comparar los vectores de todos los artículos de un repositorio interno y marcar pares con coseno por encima de un umbral para revisión editorial.
- Agrupación de feedback de clientes: generar embeddings de encuestas, reseñas o correos y aplicar clustering para descubrir temas recurrentes sin etiquetado previo.
- Pipelines de retrieval locales y privados: al ejecutarse en Apple Silicon con MLX, permite procesar documentación sensible en un Mac sin enviar datos a APIs externas, algo relevante en entornos sanitarios, legales o financieros.
- Desarrollo y evaluación offline: prototipar y comparar estrategias de chunking, tamaños de batch o umbrales de similitud en el propio portátil antes de desplegar el sistema definitivo.
- Recomendación de contenido relacionado: dado un artículo leído, recuperar los k artículos más próximos semánticamente para un módulo de "contenido relacionado".

## Benchmarks y rendimiento

La información disponible no incluye resultados en MTEB, MMLU, HumanEval ni GSM8K. El autor publica una evaluación propia de recuperación: dado un conjunto de 170 tickets de soporte en inglés, francés, neerlandés y alemán, cada uno redactado a partir de uno de 140 artículos de ayuda en inglés, se mide si el artículo de origen aparece en el top-k recuperado. Los resultados de top-1 con pesos MLX bf16 son:

| Modelo (MLX bf16) | Dimensiones | Top-1 en el test de recuperación |
|---|---|---|
| Octen-Embedding-0.6B | 1024 | 67,1 % |
| Octen-Embedding-4B | 2560 | 72,4 % |
| Octen-Embedding-8B | 4096 | 78,2 % |

Medición de latencia del mismo autor, sobre un M3 Max con 48 GB de memoria unificada, procesando 318 textos (los 178 tickets y 140 artículos del test) en lotes de 8 y con truncado a 1024 tokens:

| Variante | Tiempo total | Throughput aproximado |
|---|---|---|
| 0,6B (bf16 / 8-bit / 4-bit) | 5 a 6 s | ~53 a 64 textos/s |
| 4B (bf16 / 8-bit / 4-bit) | 35 a 55 s | ~6 a 9 textos/s |
| 8B (bf16 / 8-bit / 4-bit) | 70 a 80 s | ~4 a 4,5 textos/s |

El autor señala que la cuantización redujo disco y memoria pero no aceleró la generación de embeddings en estas pruebas. La model card incluye además una comparación de fidelidad de la conversión frente a la referencia bf16, que aparece truncada en la información disponible.

## Requisitos de hardware

- Pesos bf16: 15,1 GB en disco. Estimación de memoria unificada necesaria para inferencia: en torno a 17-18 GB incluyendo overhead de runtime, tokenizador y activaciones con secuencias largas. Se recomienda un Mac con 32 GB o más; 48 GB (M3 Max) es la configuración medida por el autor.
- Variante 8-bit: 8,0 GB de pesos, aproximadamente 10 GB de memoria en ejecución.
- Variante 4-bit: 4,3 GB de pesos, aproximadamente 6 GB de memoria en ejecución; es la única que se acerca al rango de un Mac de 16 GB, aunque el margen es ajustado.
- GPU: este repositorio es exclusivamente MLX, por lo que el hardware objetivo es Apple Silicon (series M1, M2, M3 y M4). No se puede cargar directamente en CUDA ni en ROCm.
- Para NVIDIA (A100, H100, RTX 4090) o para despliegue en servidor con vLLM, TGI o TEI, hay que usar el modelo original `Octen/Octen-Embedding-8B` o `Qwen/Qwen3-Embedding-8B` con transformers o sentence-transformers, no esta conversión.
- Despliegue en Apple Silicon: `pip install mlx-embeddings` y carga con `mlx_embeddings.load(...)`; la API devuelve `text_embeds` con forma (batch, 4096).
- Throughput medido: 70-80 segundos para 318 textos de hasta 1024 tokens en lotes de 8 sobre M3 Max de 48 GB, es decir, del orden de 4 textos por segundo. Para volúmenes altos de indexación conviene aumentar el batch o considerar la talla 0,6B.
- Nota práctica: la model card trunca las secuencias a 1024 tokens en sus ejemplos, muy por debajo de los 32K de contexto; con documentos completos el coste de atención crece y el throughput baja.

## Comparativa con modelos similares

| Modelo | Parámetros | Dimensiones | Contexto | Top-1 (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Octen-Embedding-8B MLX bf16 (este repo) | 8B | 4096 | 32K | 78,2 % | Apache 2.0 | Conversión comunitaria en MLX, solo Apple Silicon |
| Octen/Octen-Embedding-8B (original) | 8B | 4096 | 32K | 78,2 % (referencia bf16) | Apache 2.0 | Pesos originales, ejecutables en CUDA y CPU |
| Octen-Embedding-4B MLX | 4B | 2560 | no disponible en la información proporcionada | 72,4 % | Apache 2.0 | Conversión comunitaria en MLX, tres variantes |
| Octen-Embedding-0.6B MLX | 0,6B | 1024 | no disponible en la información proporcionada | 67,1 % | Apache 2.0 | Conversión comunitaria en MLX, tres variantes |
| Qwen/Qwen3-Embedding-8B | 8B | 4096 | 32K | no disponible en la información proporcionada | Apache 2.0 | Pesos oficiales, amplio soporte de frameworks |

La comparación con modelos de otros fabricantes (BGE-M3, E5-Mistral, GTE-Qwen2) no está cubierta por la información disponible y requeriría ejecutar MTEB u otra evaluación común.

## Limitaciones y advertencias

- Conversión no oficial: se trata de un trabajo comunitario de `juliensimon`, no de una publicación de Octen. Aunque el autor documenta una prueba de fidelidad frente a la referencia bf16, esa sección aparece truncada en la información disponible y no se puede verificar el grado exacto de equivalencia numérica.
- Modelo no generativo: no produce texto, no admite tool calling ni razonamiento multi-paso. No debe plantearse como sustituto de un LLM, sino como componente de recuperación dentro de un pipeline mayor.
- Riesgo de recuperación irrelevante: un embedding puede situar documentos semánticamente próximos pero factualmente incorrectos en el top-k. En RAG esto se traduce en contexto erróneo para el LLM generativo y, por tanto, en respuestas alucinadas aguas abajo. Conviene calibrar umbrales y añadir reranking.
- Precisión numérica en bf16: los cálculos se realizan en bfloat16; la propia model card recomienda renormalizar los vectores en float32 antes de calcular similitudes de coseno.
- Cobertura idiomática desigual: se declaran más de 100 idiomas, pero las etiquetas solo detallan en y zh, y la evaluación publicada cubre inglés, francés, neerlandés y alemán. No hay datos de calidad para el resto de idiomas, incluido el español.
- Sin benchmarks estándar: no hay resultados de MTEB ni comparaciones con la competencia en la información proporcionada, por lo que la cifra de 78,2 % de top-1 solo es comparable dentro de la propia familia Octen.
- Restricción de plataforma: MLX solo funciona en Apple Silicon. El repositorio no es portable a CUDA, y su uso en servidores con GPU exige recurrir al modelo original.
- Huella de memoria: 15,1 GB de pesos en bf16 impiden su uso en GPUs de consumo de 8-12 GB y en Macs de 16 GB; solo las variantes 8-bit y 4-bit se acercan a ese rango.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero es recomendable mantener la atribución a Octen y al equipo de Qwen, tal como solicita el autor de la conversión.
- Sesgos: no se documentan en la información disponible. Al heredar el modelo base Qwen3 y un ajuste fino sobre datos de soporte técnico en cuatro idiomas, es previsible que reproduzca los sesgos de esos corpus, pero no hay cuantificación pública.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-bf16
- Variante 8-bit: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-8bit
- Variante 4-bit: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-4bit
- Talla 4B (bf16): https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-bf16
- Talla 0,6B (bf16): https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-bf16
- Modelo base de Octen: https://huggingface.co/Octen/Octen-Embedding-8B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Sitio de Octen: https://octen.ai/
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Paper de referencia (arXiv:2506.05176): https://arxiv.org/abs/2506.05176
- Paquete de Python para cargar el modelo: `pip install mlx-embeddings`
