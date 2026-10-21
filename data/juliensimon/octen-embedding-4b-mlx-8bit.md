# juliensimon/Octen-Embedding-4B-mlx-8bit

## Resumen

Octen-Embedding-4B en formato MLX (8 bits) es una conversión comunitaria del modelo de embeddings Octen/Octen-Embedding-4B, un transformer denso de 4.021.774.336 parámetros derivado de Qwen/Qwen3-Embedding-4B y ajustado específicamente para recuperación de información (retrieval). Lo publica Julien Simon bajo licencia Apache 2.0 y su propósito es ejecutar el modelo de forma nativa en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de CUDA. El resultado es un codificador de texto que proyecta frases, párrafos y documentos completos en vectores de 2560 dimensiones, con una ventana de contexto de 32.000 tokens y soporte declarado de más de 100 idiomas.

El interés práctico del artefacto es doble. Por un lado, cuantiza los pesos originales en bfloat16 (8,0 GB) a 8 bits con cuantización afín y tamaño de grupo 64, dejando el repositorio en 4,3 GB, lo que permite mantener el modelo residente en memoria unificada de un Mac de gama alta. Por otro, demuestra recuperación cross-lingüe real: una consulta en francés recupera el artículo de ayuda en inglés, y una en neerlandés encuentra el artículo sobre facturas, sin prefijo de instrucción ni plantilla de prompt.

Frente al resto de la familia, el 4B ocupa el punto medio: el 0,6B (1024 dimensiones) acierta el 67,1 % de los casos en el test del autor, el 4B sube al 72,4 % y el 8B (4096 dimensiones) llega al 78,2 %, a costa de entre 70 y 80 segundos por cada 318 textos en un M3 Max. Es, por tanto, una pieza pensada para RAG local, búsqueda semántica en el dispositivo y enrutado de tickets donde la privacidad o la ausencia de infraestructura GPU son requisitos de primer nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3, adaptado a embeddings (feature-extraction); se usa el estado oculto del último token, normalizado |
| Parametros totales | 4.021.774.336 (4B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | 8 bits afín con tamaño de grupo 64 (este repositorio); disponibles también bf16 sin cuantizar y 4 bits afín con grupo 64 |
| Idiomas soportados | Más de 100 idiomas según la model card; los tags declaran en, zh y multilingüe; los ejemplos verifican francés, neerlandés, alemán e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx-embeddings); no se documenta GGUF ni ONNX |
| Dimensiones del embedding | 2560 |
| Tamano en disco | 4,3 GB (bf16: 8,0 GB; 4 bits: 2,3 GB) |
| Prefijo de instruccion | No requiere: consultas y documentos se codifican de la misma forma |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-Embedding-4B, es decir, un transformer decoder-only denso reutilizado como codificador de frases: la representación se obtiene del estado oculto del último token y se normaliza. Octen parte de esos pesos y los ajusta para recuperación, manteniendo las 2560 dimensiones y la ventana de 32K tokens. No hay mezcla de expertos, ni atención lineal, ni decodificación especulativa: el coste computacional es el de un transformer estándar de 4B parámetros aplicado a la longitud de entrada, lo que explica que el tiempo de codificación crezca con el número de tokens de cada texto.

En cuanto a los datos de entrenamiento, la información disponible no detalla el número de tokens, la composición del corpus ni si hubo etapas de RLHF o DPO; solo se indica que es un fine-tuning para retrieval sobre la base Qwen3-Embedding-4B (Apache 2.0). La innovación destacable de esta publicación no está en el entrenamiento, sino en la conversión: cuantización afín de 8 bits con grupo 64 empaquetada en safetensors MLX. El autor advierte de un detalle de implementación relevante para producción: el modelo calcula en bf16, por lo que conviene renormalizar los vectores a float32 antes de calcular similitudes coseno, para evitar desviaciones numéricas.

## Capacidades

- Generación de embeddings de texto para similitud semántica, búsqueda y recuperación (pipeline feature-extraction); no es un modelo generativo.
- Recuperación monolingüe y cross-lingüe: consulta en francés contra documentos en inglés, consulta en neerlandés contra artículo de facturación, según los ejemplos de la model card.
- Codificación de documentos largos gracias a los 32.000 tokens de contexto (los ejemplos prácticos truncan a 1024 tokens con `max_length`).
- Similitud coseno fiable tras normalización; los textos relacionados puntúan alto y los no relacionados (el ejemplo de la carbonara) puntúan bajo.
- Clustering y deduplicación sobre vectores de 2560 dimensiones.
- Ejecución nativa en Apple Silicon mediante MLX, sin dependencias CUDA.
- No soporta tool calling, agentes, visión, audio ni modo thinking: al ser un modelo de embeddings, esas capacidades no aplican.

## Casos de uso

- RAG multilingüe sobre documentación de producto: indexar 140 artículos de ayuda en inglés y responder consultas en francés, neerlandés o alemán recuperando el pasaje correcto, tal como valida el test del autor con tickets reales de soporte.
- Enrutado de tickets a artículos de ayuda: cada ticket entrante se codifica y se compara contra el índice de artículos; en el conjunto de evaluación del autor, el modelo devuelve el artículo correcto en primera posición el 72,4 % de las veces (referencia bf16).
- Búsqueda semántica local con privacidad: al ejecutarse en MLX sobre un Mac, los documentos no salen del dispositivo, lo que encaja en despachos legales, sanidad o equipos que procesan datos personales sin aprovisionar GPU.
- Deduplicación de catálogos y bases de conocimiento: umbral de similitud coseno sobre 2560 dimensiones para detectar artículos casi idénticos en corpus de decenas de miles de entradas.
- Clasificación zero-shot por prototipos: codificar unas pocas frases representativas por categoría y asignar etiquetas por vecino más cercano, útil para triaje de correo o etiquetado de incidencias sin entrenamiento adicional.
- Filtrado semántico previo a un reranker o a un LLM: reducir de miles a decenas de candidatos con un coste de 5,8 a 9,1 textos por segundo en un M3 Max, antes de pasar un modelo mayor.
- Construcción de conjuntos de evaluación de recuperación en varios idiomas: usar los embeddings para medir cobertura y duplicidad del corpus antes de ajustar el índice.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de recuperación sobre un test propio del autor (tickets en inglés, francés, neerlandés y alemán redactados a partir de 140 artículos de ayuda en inglés, con la métrica de si el artículo de origen aparece en el top k). La model card cita 178 tickets y 140 artículos en la nota de tiempos y 170 tickets en la descripción del test; se reproducen ambos tal cual.

| Metrica | 0.6B (bf16) | 4B (bf16) | 8B (bf16) |
|---|---|---|---|
| Top-1 (articulo correcto en primera posicion) | 67,1 % | 72,4 % | 78,2 % |
| Dimensiones | 1024 | 2560 | 4096 |
| Tiempo para 318 textos (M3 Max 48 GB) | 5-6 s | 35-55 s | 70-80 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. Tampoco se cuantifica la pérdida de calidad de las variantes 8 y 4 bits frente a bf16: el autor solo indica que la cuantización ahorró disco y memoria y que no aceleró la codificación en sus pruebas.

## Requisitos de hardware

- Pesos: 4,3 GB en esta variante de 8 bits; 8,0 GB en bf16; 2,3 GB en 4 bits. Son cifras de repositorio, no de memoria total en ejecución.
- Memoria: estimación de 6-8 GB de memoria unificada para esta variante con entradas de hasta 1024 tokens y batch pequeño; a longitudes cercanas a los 32K tokens el consumo de activaciones crece de forma apreciable (no publicado).
- Plataforma: exclusivamente Apple Silicon mediante MLX (probado en M3 Max con 48 GB). No hay soporte CUDA, ROCm ni aceleración en GPU de escritorio documentado para este repositorio.
- Cabe en equipos de consumo: sí, en cualquier Mac con Apple Silicon y memoria suficiente; 16 GB es un mínimo razonable para la variante 8 bits y 8 GB para la de 4 bits.
- Despliegue: `pip install mlx-embeddings` y carga con `mlx_embeddings.load`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama para este repositorio; tampoco se ofrece GGUF.
- Rendimiento medido: 318 textos de hasta 1024 tokens, batch de 8, entre 35 y 55 segundos en un M3 Max de 48 GB, es decir, del orden de 5,8 a 9,1 textos por segundo. La cuantización no mejora el throughput; para acelerar hay que reducir tamaño de modelo, longitud de entrada o aumentar el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Top-1 en el test del autor | Licencia | Formato y tamano |
|---|---|---|---|---|---|---|
| Octen-Embedding-4B MLX 8 bits (este) | 4B | 2560 | 32K | 72,4 % (referencia bf16) | Apache 2.0 | safetensors MLX, 4,3 GB |
| Octen-Embedding-4B MLX bf16 | 4B | 2560 | 32K | 72,4 % | Apache 2.0 | safetensors MLX, 8,0 GB |
| Octen-Embedding-4B MLX 4 bits | 4B | 2560 | 32K | no disponible | Apache 2.0 | safetensors MLX, 2,3 GB |
| Octen-Embedding-0.6B | 0,6B | 1024 | no disponible | 67,1 % | Apache 2.0 | MLX bf16, 8 y 4 bits |
| Octen-Embedding-8B | 8B | 4096 | no disponible | 78,2 % | Apache 2.0 | MLX bf16, 8 y 4 bits |
| Qwen3-Embedding-4B (modelo padre) | 4B | no disponible | no disponible | no disponible | Apache 2.0 | safetensors (formato original) |

La comparación con alternativas de otros fabricantes (BGE, E5, GTE, EmbeddingGemma y similares) no está disponible en la información proporcionada, por lo que no se incluyen cifras que no puedan verificarse.

## Limitaciones y advertencias

- Conversión comunitaria, no lanzamiento oficial de Octen: el autor lo indica explícitamente; para producción conviene validar contra los pesos originales.
- Solo Apple Silicon: el formato MLX impide desplegarlo en clústeres con GPU NVIDIA o AMD sin una conversión adicional que no está documentada aquí.
- La cuantización a 8 bits reduce disco y memoria, pero no acelera la inferencia y su impacto en la calidad de recuperación no se ha cuantificado; si el top-1 es crítico, conviene comparar contra la variante bf16.
- Precisión numérica: el modelo calcula en bf16 y hay que renormalizar en float32 antes de la similitud coseno; omitir ese paso introduce error en los productos escalares.
- Sin prefijo de instrucción: consultas y documentos se codifican igual. Añadir prefijos no documentados puede degradar los resultados.
- Truncamiento silencioso: los ejemplos usan `max_length=1024`, muy por debajo de los 32K de contexto; si se indexan documentos largos hay que ajustar la longitud o trocearlos, y no se publican métricas por encima de 1024 tokens.
- Riesgo de falso positivo por similitud: textos con solapamiento léxico superficial pueden puntuar alto; el propio autor usa el ejemplo de la carbonara para ilustrar el caso contrario, pero no se documentan umbrales calibrados.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni comportamiento por dominio o idioma; los idiomas verificados en los ejemplos son inglés, francés, neerlandés y alemán, pese a la afirmación de más de 100 idiomas.
- Licencia Apache 2.0 en toda la cadena (Qwen3-Embedding-4B, Octen y esta conversión), lo que permite uso comercial; aun así, conviene conservar los avisos de atribución a los equipos de Octen y Qwen.
- Sin benchmarks estandar (MTEB u otros): la única evidencia de calidad es un test interno de 140 artículos de ayuda, un dominio estrecho que no representa corpus técnicos, jurídicos o científicos.
- Un modelo de 4B es caro para indexación masiva: a 5,8-9,1 textos por segundo en un M3 Max, indexar un millón de fragmentos requiere del orden de 30 a 48 horas de cómputo en ese equipo.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-8bit
- Variante bf16: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-bf16
- Variante 4 bits: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-4bit
- Modelo base (Octen): https://huggingface.co/Octen/Octen-Embedding-4B
- Modelo padre (Qwen3-Embedding-4B): https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Familia 0.6B: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-bf16
- Familia 8B: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-bf16
- MLX (framework): https://github.com/ml-explore/mlx
- Octen (sitio del autor del modelo): https://octen.ai/
- Paper de referencia etiquetado en el repositorio: arXiv:2506.05176
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
