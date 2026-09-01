# basically-ai/Pebble-10M

## Resumen

Pebble-10M es un modelo de lenguaje autoregresivo compacto de aproximadamente 10 millones de parámetros, desarrollado por basically AI. Combina una arquitectura híbrida de state-space models (Mamba2) con capas de atención Transformer, siguiendo un patrón de bloques que alterna tres bloques Mamba2 por cada bloque de atención. Está diseñado como un modelo de investigación para explorar la eficiencia de arquitecturas híbridas en el régimen de muy pocos parámetros, con un contexto de 512 tokens y un vocabulario de 2048 tokens mediante un BPE byte-level personalizado.

El modelo se entrenó sobre un corpus de aproximadamente 25 mil millones de tokens procedentes de datasets públicos como FineWeb-Edu, DCLM, Cosmopedia-v2, FineMath-4+ y otros. Su relevancia actual radica en que demuestra que las arquitecturas híbridas Mamba2/Transformer pueden alcanzar rendimientos por encima del azar en tareas de sentido común y aritmética incluso con un tamaño extremadamente reducido, lo que abre la puerta a despliegues en entornos con recursos muy limitados. La licencia Apache 2.0 facilita su uso y modificación tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 / Transformer (3 bloques Mamba2 : 1 bloque de atención) |
| Parametros totales | 11.068.176 (según safetensors; ~10M declarados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No oficiales; disponible GGUF experimental (ver enlaces) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también GGUF experimental) |

## Arquitectura y entrenamiento

Pebble-10M utiliza una arquitectura híbrida que intercala bloques Mamba2 y bloques de atención. Concretamente, repite el patrón de 3 bloques Mamba2 seguidos de 1 bloque de atención, para un total de 8 capas (6 Mamba2 y 2 de atención). La dimensión oculta es de 384 y el vocabulario se reduce a 2048 tokens mediante un tokenizador BPE byte-level personalizado, lo que permite cubrir texto arbitrario con un embedding de tamaño reducido.

El entrenamiento se realizó con una mezcla de optimizadores: Muon para los pesos ocultos de dimensión 2D y AdamW para embeddings, normas y escalares. Se usaron pesos maestros en fp32 con autocast en bf16. El corpus de entrenamiento consta de 25 mil millones de tokens distribuidos en seis datasets: FineWeb-Edu (30%), DCLM (20%), Cosmopedia-v2 (15%), FineMath-4+ (15%), FinePhrase (12%) y NPset (8%). No se menciona el uso de RLHF ni DPO; es un modelo base sin ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva con ventana de contexto de 512 tokens.
- Razonamiento de sentido común básico, con resultados por encima del azar en PIQA y ARC-Easy.
- Capacidades aritméticas elementales, evaluadas en los benchmarks ArithMark-2.0 y ArithMark-3.0.
- Soporte de texto en inglés, con tokenización byte-level que permite manejar cualquier secuencia de bytes.
- No soporta tool calling, agentes ni razonamiento multi-paso estructurado.
- No dispone de capacidades multimodales (visión, audio, etc.).
- Al ser un modelo base, no está entrenado para seguir instrucciones conversacionales; existe una variante `Pebble-10M-Chat` para ese fin.

## Casos de uso

- Investigación en eficiencia de arquitecturas híbridas: permite estudiar cómo se comportan los bloques Mamba2 frente a los de atención en un régimen de parámetros extremadamente bajo, comparando métricas de perplejidad y downstream.
- Prototipado de pipelines de NLP con restricciones de memoria: al ocupar menos de 50 MB en fp32, puede ejecutarse en dispositivos embebidos o GPUs de baja gama, sirviendo como punto de partida para pruebas de concepto.
- Generación de texto experimental en entornos educativos: útil para demostrar los fundamentos de los modelos de lenguaje y las diferencias entre arquitecturas sin necesidad de hardware potente.
- Evaluación de técnicas de cuantización: el soporte GGUF experimental permite probar cuantizaciones de 4 u 8 bits y medir el impacto en la calidad de generación.
- Fine-tuning específico de dominio: al ser un modelo base pequeño, puede ajustarse con datasets reducidos para tareas muy concretas como clasificación de texto corto o generación de plantillas.
- Benchmarking de kernels CUDA/Triton: la implementación de Mamba2 incluida requiere kernels específicos, lo que lo convierte en un caso de prueba para optimizaciones de bajo nivel en GPUs Ampere o superiores.

## Benchmarks y rendimiento

El modelo card reporta los siguientes resultados en evaluación zero-shot de opción múltiple, sin fine-tuning específico:

| Benchmark | Precisión | Línea base aleatoria |
|---|---|---|
| PIQA | 58,43% | 50,00% |
| ARC-Easy | 37,29% | 25,00% |
| ARC-Challenge | 18,60% | 25,00% |
| HellaSwag | 26,81% | 25,00% |
| ArithMark-2.0 | 27,64% | 25,00% |
| ArithMark-3.0 | 32,80% | 25,00% |

Notas: ARC-Challenge y HellaSwag están por debajo o al nivel del azar, lo que refleja las limitaciones propias de un modelo de 10M de parámetros. ArithMark-2.0 y ArithMark-3.0 se evaluaron en el split de entrenamiento por falta de split de test adecuado. No se han publicado comparaciones con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan unos 44 MB, por lo que cualquier GPU con al menos 1 GB de VRAM es suficiente; el script de ejemplo reporta el uso de VRAM en tiempo de ejecución.
- GPU recomendadas: cualquier GPU CUDA con capacidad Ampere (RTX 30xx) o superior, debido a los kernels Triton de Mamba2. También puede ejecutarse en CPU con las dependencias adecuadas, aunque la velocidad será menor.
- Despliegue en consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluso en las integradas de gama baja.
- Opciones de despliegue: transformers con `trust_remote_code=True`, llama.cpp con el soporte experimental GGUF, y potencialmente vLLM si se adapta el código personalizado.
- Latencia y throughput: no se han publicado mediciones oficiales; dado el tamaño, la generación es muy rápida incluso en CPU, pero depende del hardware y de la implementación de los kernels Mamba2.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos de 10M de parámetros. Existen modelos como `TinyStories` (33M) o `GPT-2` (124M), pero no son directamente comparables por tamaño y arquitectura. La falta de benchmarks estandarizados sobre modelos de este rango impide establecer una comparativa rigurosa. Se recomienda consultar el leaderboard de BenchLM (enlace en la sección de enlaces) para ver métricas agregadas, aunque no incluye modelos tan pequeños.

## Limitaciones y advertencias

- Calidad de generación muy limitada: al ser un modelo de 10M de parámetros, el texto generado es de nivel juguete, con frecuentes incoherencias y errores gramaticales.
- Contexto corto de 512 tokens, insuficiente para tareas que requieran dependencias de largo alcance.
- Solo entrenado en inglés; no soporta otros idiomas de manera fiable.
- El rendimiento en benchmarks de razonamiento (ARC-Challenge, HellaSwag) está al nivel del azar, lo que indica una capacidad de razonamiento muy pobre.
- Requiere código personalizado (`trust_remote_code=True`), lo que introduce riesgos de seguridad y mantenimiento; el código debe revisarse antes de usarlo en producción.
- Dependencia de kernels CUDA/Triton para Mamba2; no funciona en hardware sin GPU NVIDIA compatible sin adaptaciones.
- El soporte GGUF es experimental y puede presentar discrepancias numéricas menores (por ejemplo, diferencias en el epsilon de las normas) respecto a la implementación original.
- No se han realizado evaluaciones de sesgos o toxicidad; como modelo base entrenado en datos web, puede reflejar sesgos presentes en el corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/basically-ai/Pebble-10M
- Variante Chat: https://huggingface.co/basically-ai/Pebble-10M-Chat
- Sitio web de basically AI: https://basicallyai.co/
- Repositorio de soporte GGUF (llama.cpp): https://github.com/rootendpoint/basicallyai_llama.cpp_support
- Repositorio de la organización (Shoalstone/pebble): https://github.com/Shoalstone/pebble
- Leaderboard de modelos (BenchLM): https://benchlm.ai/
