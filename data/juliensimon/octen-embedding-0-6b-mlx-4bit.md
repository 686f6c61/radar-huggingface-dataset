# juliensimon/Octen-Embedding-0.6B-mlx-4bit

## Resumen

Octen-Embedding-0.6B-mlx-4bit es una conversión comunitaria a MLX del modelo de embeddings Octen/Octen-Embedding-0.6B, un transformer Qwen3 de 595.776.512 parámetros afinado para recuperación de información. La conversión, publicada por juliensimon, aplica cuantización afín de 4 bits con tamaño de grupo 64 y deja el repositorio en 0,3 GB, de modo que el modelo se ejecuta de forma nativa en Apple Silicon a través de la librería mlx-embeddings.

El modelo proyecta texto en 1024 dimensiones y admite una ventana de contexto de 32K tokens. Según la model card, cubre más de 100 idiomas y está pensado para búsqueda semántica, recuperación, clustering y similitud entre textos. No requiere prefijo de instrucción: consultas y documentos se codifican con el mismo procedimiento, tomando el estado oculto del último token y normalizándolo.

Su interés práctico es que permite montar pipelines de recuperación y RAG completamente locales en un Mac, sin GPU dedicada ni llamadas a la nube. El precio es la fidelidad: el propio autor advierte de que es la variante menos fiel de las tres que publica (bf16, 8 bits y 4 bits), con una similitud coseno media de 0,95 respecto al original y una caída de 3,5 puntos en top-1 de recuperación en su prueba.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3, adaptado como modelo de embeddings (estado oculto del último token, normalizado) |
| Parametros totales | 595.776.512 (0,6B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | 4 bits afín, tamaño de grupo 64 (esta variante); la familia incluye bf16 sin cuantizar y 8 bits afín con grupo 64 |
| Idiomas soportados | Inglés, chino y multilingüe; la model card declara más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (no hay GGUF en esta conversión) |
| Dimensiones del embedding | 1024 |
| Tamaño del repositorio | 0,3 GB |
| Pipeline | feature-extraction |
| Librería | mlx-embeddings |

## Arquitectura y entrenamiento

La base es Qwen3, un transformer decoder denso de 0,6B parámetros, en la variante Qwen/Qwen3-Embedding-0.6B, que Octen afinó para recuperación. El uso como embedder consiste en pasar el texto por el modelo y quedarse con el estado oculto del último token, que se normaliza para producir un vector de 1024 dimensiones. La model card indica que el modelo original no pide prefijo de instrucción, por lo que consultas y pasajes se procesan de forma simétrica.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos no están publicados en la documentación consultada. La innovación técnica de este repositorio no está en el entrenamiento, sino en la conversión: cuantización afín de 4 bits con grupo 64 sobre los pesos originales y empaquetado en formato MLX para aprovechar la memoria unificada de los chips de Apple. Se trata de una conversión comunitaria, no de un lanzamiento oficial de Octen, y tanto los pesos originales como la conversión son Apache 2.0.

## Capacidades

- Generación de embeddings de texto para similitud semántica, búsqueda y recuperación, con salida de 1024 dimensiones.
- Recuperación multilingüe cruzada: en los ejemplos de la model card, una consulta en francés recupera un artículo en inglés y una consulta en neerlandés recupera el artículo de facturación correcto.
- Cálculo de similitud coseno por producto matricial entre matrices de embeddings normalizados.
- Agrupamiento y deduplicación de textos por proximidad vectorial.
- Extracción de características (pipeline feature-extraction) para alimentar índices vectoriales externos.
- Procesamiento por lotes con padding y truncado mediante el tokenizador asociado (los ejemplos usan max_length de 1024).
- Ejecución local en Apple Silicon con MLX, sin dependencia de servicios externos.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y la información disponible no documenta modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en documentación técnica multilingüe: indexar los artículos en inglés y atender consultas en francés, neerlandés o español con el mismo espacio vectorial de 1024 dimensiones, como demuestra el ejemplo de la model card.
- RAG local en un Mac: generar embeddings de fragmentos de documentación interna y de la pregunta del usuario en el propio portátil, de forma que el contenido sensible no salga del dispositivo; el contexto de 32K permite indexar pasajes largos sin trocear en exceso.
- Enrutado y clasificación de tickets de soporte: comparar cada ticket entrante con un conjunto de artículos de ayuda y asignarlo al equipo o al artículo más próximo; la prueba publicada usa precisamente 178 tickets y 140 artículos.
- Deduplicación de bases de conocimiento: calcular la matriz de similitudes coseno de todos los pares y marcar por encima de un umbral los artículos redundantes antes de consolidar el corpus.
- Filtrado de candidatos en recuperación de dos etapas: usar el 0,6B como primera etapa barata sobre un corpus grande y reservar un modelo mayor (4B u 8B de la misma familia) para el reranking de los mejores candidatos.
- Agrupamiento temático de feedback de usuarios: embeber encuestas o reseñas y aplicar clustering sobre los vectores para descubrir temas recurrentes sin etiquetas previas.
- Prototipado rápido de funciones de similitud en aplicaciones macOS: el repositorio de 0,3 GB se carga en memoria con `mlx_embeddings.load` en pocos segundos, lo que permite iterar sobre umbrales y prompts de recuperación antes de fijar infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible. Los únicos datos cuantitativos son la prueba de recuperación propia del autor y las mediciones de tiempo en un M3 Max con 48 GB.

| Metrica | 0.6B bf16 | 0.6B 4 bits |
|---|---|---|
| Top-1 de recuperación (140 artículos, 178 tickets) | 67,1 % | 3,5 puntos por debajo del original (el repositorio no publica el valor exacto) |
| Similitud coseno media frente al original | referencia | 0,95 |
| Tiempo para embeber 318 textos (lote de 8, hasta 1024 tokens) | 5 a 6 s | 5 a 6 s |

| Tamaño | Dimensiones | Top-1 (MLX bf16) | Tiempo para 318 textos |
|---|---|---|---|
| 0.6B | 1024 | 67,1 % | 5 a 6 s |
| 4B | 2560 | 72,4 % | 35 a 55 s |
| 8B | 4096 | 78,2 % | 70 a 80 s |

Mediciones realizadas el 21 de octubre de 2026 en un M3 Max con 48 GB. La model card señala que la cuantización redujo disco y memoria, pero no aceleró el cálculo de embeddings en esas ejecuciones.

## Requisitos de hardware

- Peso de los pesos: 0,3 GB en esta variante de 4 bits; 0,6 GB en la de 8 bits y 1,2 GB en bf16.
- Hardware compatible: exclusivamente Apple Silicon mediante MLX. El repositorio no publica consumo pico de memoria ni requisitos mínimos de chip; las mediciones se hicieron en un M3 Max con 48 GB de memoria unificada.
- Encaje en hardware de consumo: con 0,3 GB de pesos, el modelo cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon; el consumo real con la ventana completa de 32K tokens no está documentado.
- GPU dedicadas (A100, H100, RTX 4090): no aplican a esta conversión, que depende de MLX. Para CUDA o ROCm habría que usar el modelo base, cuyos requisitos no se detallan en la información proporcionada.
- Opciones de despliegue: `pip install mlx-embeddings` y carga con `mlx_embeddings.load`. No hay pesos GGUF, por lo que llama.cpp y Ollama no son una vía directa para este repositorio; tampoco se documenta soporte de vLLM ni TGI.
- Rendimiento medido: 318 textos de hasta 1024 tokens en 5 a 6 segundos con lotes de 8, lo que equivale aproximadamente a 53-64 incrustaciones por segundo (cálculo derivado de los datos de la model card). La latencia por texto individual no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Top-1 (prueba del autor) | Tamaño en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (0.6B, MLX 4 bits) | 0,6B | 1024 | 32K | 67,1 % menos 3,5 puntos | 0,3 GB | Apache 2.0 | HuggingFace, MLX |
| Octen-Embedding-0.6B MLX bf16 | 0,6B | 1024 | 32K | 67,1 % | 1,2 GB | Apache 2.0 | HuggingFace, MLX |
| Octen-Embedding-0.6B MLX 8 bits | 0,6B | 1024 | 32K | No publicado | 0,6 GB | Apache 2.0 | HuggingFace, MLX |
| Octen-Embedding-4B MLX bf16 | 4B | 2560 | No disponible | 72,4 % | No disponible | Apache 2.0 | HuggingFace, MLX |
| Octen-Embedding-8B MLX bf16 | 8B | 4096 | No disponible | 78,2 % | No disponible | Apache 2.0 | HuggingFace, MLX |
| Qwen/Qwen3-Embedding-0.6B | 0,6B | 1024 | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |

La información proporcionada no incluye modelos de terceros comparables (por ejemplo, alternativas de otros laboratorios en el rango de 0,6B); la comparación se limita a las variantes de la misma familia.

## Limitaciones y advertencias

- Pérdida de fidelidad por cuantización: la similitud coseno media frente al original baja a 0,95 y el top-1 de recuperación cae 3,5 puntos. El autor recomienda usar la variante de 8 bits o bf16 salvo que la memoria sea la restricción.
- El tamaño de 0,6B es el escalón con peor recuperación de la familia en la prueba publicada: 67,1 % frente a 72,4 % del 4B y 78,2 % del 8B.
- Dependencia de plataforma: solo funciona en Apple Silicon con MLX; no hay ruta GGUF ni soporte documentado para CUDA, ROCm o aceleradores de servidor.
- Conversión comunitaria, no oficial: no la publica Octen y no ha pasado por un proceso de validación del autor original. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa.
- Los resultados de recuperación proceden de una única prueba interna con 140 artículos y 178 tickets del dominio de soporte; no hay evaluación en MTEB ni en conjuntos públicos, por lo que la generalización a otros dominios no está verificada.
- El modelo no genera texto, de modo que el riesgo de alucinación se traslada al sistema que consume los embeddings: una recuperación con top-1 del 67 % implica que una parte relevante de las consultas recibirá pasajes incorrectos si solo se usa el primer resultado.
- Sesgos: la información disponible no documenta evaluaciones de sesgo, y la cobertura de 100+ idiomas es una afirmación de la model card sin métricas por idioma publicadas.
- El contexto declarado es de 32K tokens, pero todos los ejemplos y mediciones de la model card truncan a 1024 tokens; el rendimiento más allá de esa longitud no está medido en esta conversión.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar el aviso de licencia y la atribución a los equipos de Octen y Qwen; al ser una conversión derivada, conviene revisar también las condiciones del modelo base.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-4bit
- Modelo base: https://huggingface.co/Octen/Octen-Embedding-0.6B
- Modelo Qwen3 del que parte el ajuste: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Variante bf16 del mismo tamaño: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-bf16
- Variante de 8 bits del mismo tamaño: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-8bit
- Variantes de 4B: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-bf16 · https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-8bit · https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-4bit
- Variantes de 8B: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-bf16 · https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-8bit · https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-4bit
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Sitio de Octen: https://octen.ai/
- Paper referenciado en las etiquetas del repositorio: https://arxiv.org/abs/2506.05176
- Librería de carga: paquete `mlx-embeddings` en PyPI (`pip install mlx-embeddings`); el repositorio no enlaza un repositorio de código propio para la librería.
