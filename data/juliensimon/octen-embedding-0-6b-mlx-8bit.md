# juliensimon/Octen-Embedding-0.6B-mlx-8bit

## Resumen

Octen-Embedding-0.6B-mlx-8bit es una conversión comunitaria a MLX del modelo de embeddings Octen/Octen-Embedding-0.6B, un Qwen3 de 595.776.512 parámetros afinado para recuperación de información, publicado por Julien Simon. El objetivo es que el modelo se ejecute de forma nativa en Apple Silicon mediante la librería mlx-embeddings, sin necesidad de CUDA ni de servidores externos, con pesos cuantizados a 8 bits afines (grupo de 64) que ocupan 0,6 GB en disco.

El modelo transforma texto en vectores densos de 1024 dimensiones normalizados, usando el estado oculto del último token, tal como hace el modelo original. Declara soporte para más de 100 idiomas y una ventana de contexto de 32.768 tokens, lo que lo sitúa en la categoría de embedders de contexto largo para búsqueda semántica, recuperación aumentada (RAG), clustering y similitud entre textos. No requiere prefijo de instrucción: consultas y documentos se embeden de la misma forma.

Su relevancia práctica está en el coste: al ocupar 0,6 GB y necesitar solo unos segundos para embedir unos 300 textos en un M3 Max, permite montar índices vectoriales y prototipos de búsqueda multilingüe en un portátil. Conviene subrayar que se trata de una conversión no oficial, que las métricas publicadas de recuperación corresponden a la variante bf16 y que la licencia Apache 2.0 se mantiene desde el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 orientado a embeddings (último token oculto, normalizado) |
| Parametros totales | 595.776.512 (aproximadamente 0,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | bf16 sin cuantizar (variante -mlx-bf16); 8 bits afín con grupo de 64 (este repositorio); 4 bits afín con grupo de 64 (variante -mlx-4bit) |
| Idiomas soportados | Más de 100 idiomas según la model card; metadatos: en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx-embeddings) |
| Dimensiones del embedding | 1024 |
| Tamano del repositorio | 0,6 GB (8 bits); 1,2 GB en bf16; 0,3 GB en 4 bits |
| Modelo base | Octen/Octen-Embedding-0.6B (a su vez fine-tune de Qwen/Qwen3-Embedding-0.6B) |
| Pipeline | feature-extraction |
| Normalizacion | Sí, L2; se recomienda renormalizar en float32 porque el cálculo interno es bf16 |
| Prefijo de instruccion | No requerido (consultas y documentos se embeden igual) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3, reutilizado como encoder de frases: la representación se obtiene del estado oculto del último token, que después se normaliza. El modelo original parte de Qwen/Qwen3-Embedding-0.6B y ha sido afinado por Octen para recuperación (retrieval), manteniendo la ventana de 32.768 tokens del modelo de partida. El repositorio aquí descrito no reentrena nada: aplica cuantización afín de 8 bits con tamaño de grupo 64 sobre los pesos de Octen y los serializa en el formato que consume mlx-embeddings.

No se dispone de información detallada sobre la composición del dataset de afinado de Octen, el número de tokens utilizados ni si se emplearon técnicas de preferencia (RLHF/DPO); la model card de esta conversión no los detalla. La referencia bibliográfica asociada en los metadatos es el paper arXiv:2506.05176. La model card del conversor incluye un test propio de fidelidad: 140 artículos de ayuda en inglés y alrededor de 170 tickets de soporte en inglés, francés, neerlandés y alemán, generados a partir de esos artículos, midiendo si el artículo correcto aparece en el top-k recuperado.

## Capacidades

- Generación de embeddings de texto densos de 1024 dimensiones para búsqueda semántica, recuperación, clustering y similitud.
- Recuperación multilingüe cruzada: una consulta en francés o neerlandés recupera artículos escritos en inglés, según el ejemplo de la model card.
- Ventana de contexto de 32.768 tokens, adecuada para documentos largos o pasajes extensos sin trocear en exceso.
- Similitud semántica directa mediante producto escalar de vectores normalizados (coseno).
- Soporte de más de 100 idiomas declarado por el autor.
- No genera texto: es un modelo de embeddings, no un modelo causal de lenguaje.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene modo "thinking", visión ni audio.
- No requiere instrucción o prefijo diferenciado para consultas y documentos.

## Casos de uso

- Búsqueda semántica multilingüe en documentación de producto: se indexan los artículos de ayuda en inglés y se consulta en francés, alemán o neerlandés; el test de la model card demuestra exactamente este flujo con preguntas sobre retención de logs de webhook y facturación.
- RAG local en un Mac: el modelo sirve como recuperador en un pipeline de pregunta-respuesta sobre documentación interna, con índice FAISS o similar, sin enviar datos a la nube y con 0,6 GB de huella en disco.
- Enrutado y clasificación de tickets de soporte: se comparan los embeddings de tickets entrantes con los de categorías o artículos conocidos y se asigna la cola o el artículo más próximo por similitud coseno.
- Deduplicación y clustering de contenido: agrupar preguntas frecuentes, artículos o mensajes duplicados dentro de un corpus multilingüe usando similitud entre vectores de 1024 dimensiones.
- Recomendación por contenido: construir un recomendador de artículos, cursos o productos calculando la similitud entre el embedding del elemento consultado y el resto del catálogo.
- Filtrado previo en pipelines de búsqueda híbrida: reducir de miles de candidatos a unas decenas antes de un reranker más costoso, aprovechando el bajo coste de inferencia en Apple Silicon.
- Evaluación de calidad de traducciones o paráfrasis: medir similitud semántica entre el original y la versión traducida mediante coseno, con la cautela de que no es una métrica de adecuación formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB u otros) en la información disponible. Los únicos datos son el test de recuperación propio del conversor:

| Modelo | Dimensiones | Top-1 recuperación (%) | Tiempo para embedir 318 textos |
|---|---|---|---|
| Octen-Embedding-0.6B (bf16 MLX) | 1024 | 67,1 | 5-6 s |
| Octen-Embedding-4B (bf16 MLX) | 2560 | 72,4 | 35-55 s |
| Octen-Embedding-8B (bf16 MLX) | 4096 | 78,2 | 70-80 s |

Condiciones declaradas: test sobre 140 artículos de ayuda en inglés y tickets en inglés, francés, neerlandés y alemán; lotes de 8 textos, hasta 1024 tokens por texto; medido el 21 de octubre de 2026 en un M3 Max con 48 GB. Los porcentajes de top-1 corresponden a la variante bf16, no a la de 8 bits. La propia model card indica que la cuantización ahorró disco y memoria pero no aceleró el embedding en esas pruebas. Nota de rigor: la model card cita 170 tickets en un pasaje y 178 en otro, una inconsistencia sin resolver en el documento original.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 0,6 GB solo para los pesos en 8 bits; 1,2 GB en bf16 y 0,3 GB en 4 bits. Hay que sumar memoria para activaciones, que crece con la longitud de secuencia hasta los 32K tokens.
- El formato es MLX: requiere Apple Silicon (M1 o posterior). En GPUs NVIDIA o AMD no se puede cargar esta conversión; para esos entornos hay que usar el modelo original Octen/Octen-Embedding-0.6B.
- Cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o más; las pruebas del autor se hicieron en un M3 Max de 48 GB.
- Throughput de referencia: 318 textos en 5-6 segundos (lotes de 8, hasta 1024 tokens) en M3 Max, es decir, del orden de 55-65 textos por segundo, calculado a partir de los datos publicados.
- Despliegue en Apple Silicon: mlx-embeddings (pip install mlx-embeddings).
- Despliegue fuera de Apple Silicon con el modelo base: sentence-transformers, Text Embeddings Inference (TEI), vLLM u ONNX Runtime; no se han publicado cifras de latencia para estas rutas en la información disponible.
- No se han publicado datos de latencia por consulta individual ni de consumo energético.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Top-1 (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Octen-Embedding-0.6B MLX 8 bits) | 0,6B | 1024 | 32K | 67,1% (bf16; no medido en 8 bits) | Apache 2.0 | Conversión comunitaria en HF, solo Apple Silicon |
| Octen-Embedding-4B (MLX) | 4B | 2560 | No disponible | 72,4% | Apache 2.0 (según repositorio del conversor) | bf16, 8 bits y 4 bits en HF |
| Octen-Embedding-8B (MLX) | 8B | 4096 | No disponible | 78,2% | Apache 2.0 (según repositorio del conversor) | bf16, 8 bits y 4 bits en HF |
| Qwen/Qwen3-Embedding-0.6B | 0,6B | No disponible | No disponible | No disponible | Apache 2.0 | Modelo oficial en HF, multiplataforma |

El patrón es claro: en el test del autor, la calidad de recuperación crece con el tamaño (67,1% a 0,6B, 72,4% a 4B, 78,2% a 8B) a costa de entre 6 y 14 veces más tiempo de embedding. La ventaja diferencial de la variante de 0,6B en 8 bits es el tamaño (0,6 GB) y que quepa en cualquier Mac moderno.

## Limitaciones y advertencias

- Conversión comunitaria, no oficial: los pesos son de Octen, pero la conversión a MLX y su cuantización no han sido validadas por el autor del modelo original.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay retroalimentación de terceros sobre la calidad de la cuantización de 8 bits.
- No hay métricas de degradación por cuantización: los porcentajes de recuperación publicados son de la variante bf16; se desconoce la pérdida exacta de calidad en 8 bits y en 4 bits.
- Atado al ecosistema Apple: el formato MLX no se carga en CUDA, ROCm ni en la mayoría de runtimes de servidor; para producción en GPU hay que recurrir al modelo base.
- No es un modelo generativo: no responde preguntas, no razona y no ejecuta herramientas; solo produce vectores.
- Riesgo de falsos positivos en recuperación: una similitud coseno alta no garantiza relevancia; el propio ejemplo de la model card muestra una frase no relacionada ("pasta carbonara") con una similitud de aproximadamente 0,1, pero en corpus homogéneos los márgenes pueden ser estrechos.
- Sesgos: no documentados en la información disponible; al derivar de Qwen3 y de un dataset de afinado no descrito, los sesgos lingüísticos y culturales del corpus original son posibles.
- Idioma: el soporte de más de 100 idiomas es una declaración del autor; la única evaluación publicada cubre inglés, francés, neerlandés y alemán, y el corpus de referencia está en inglés.
- Contexto largo con coste: aunque soporta 32K tokens, los ejemplos de uso truncan a 1024 tokens; la atención sobre secuencias muy largas incrementa el coste de memoria y tiempo.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de copyright y licencia; conviene verificar la cadena de atribución Octen y Qwen en productos derivados.
- Inconsistencia menor en la documentación: el número de tickets del test aparece como 170 y como 178 en distintos pasajes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-8bit
- Variante bf16: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-bf16
- Variante 4 bits: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-4bit
- Variantes 4B: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-bf16 · https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-8bit · https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-4bit
- Variantes 8B: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-bf16 · https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-8bit · https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-4bit
- Modelo base: https://huggingface.co/Octen/Octen-Embedding-0.6B
- Modelo Qwen3 original: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- MLX (framework): https://github.com/ml-explore/mlx
- Paper de referencia (etiqueta arXiv del repositorio): https://arxiv.org/abs/2506.05176
- Sitio del autor del modelo base: https://octen.ai/
