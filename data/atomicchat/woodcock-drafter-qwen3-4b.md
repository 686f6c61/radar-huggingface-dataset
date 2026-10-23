# AtomicChat/woodcock-drafter-qwen3-4b

## Resumen

Woodcock drafter para Qwen3-4B es un modelo borrador (*draft model*) de decodificación especulativa creado por AtomicChat para acelerar la inferencia de Qwen/Qwen3-4B en Apple Silicon mediante el runtime Woodcock y MLX. No es un modelo de lenguaje autónomo: es un componente auxiliar de una sola capa que lee los estados ocultos internos de Qwen3-4B, propone los siguientes tokens y deja que el modelo objetivo verifique todas las propuestas en un único forward pass. El resultado es exactamente el de Qwen3-4B —decodificación greedy idéntica token a token y muestreo con la misma distribución—, de modo que el borrador solo altera la velocidad, no la calidad.

Técnicamente sigue el enfoque EAGLE-3: fusiona tres capas del modelo objetivo (2, 18 y 33) con RMSNorm por capa, añade una capa decoder con la forma de Qwen3-4B y realimentación post-norm (EAGLE-3.1), y se entrena con 4 pasos desenrollados y entropía cruzada con etiquetas suaves sobre la distribución del propio Qwen3-4B. Los pesos ocupan 914.245.376 parámetros en bf16, de los cuales 389 M corresponden al embedding congelado de Qwen3, y el repositorio pesa 1,8 GB.

Su relevancia es práctica: en un M4 Max con 48 GB y MLX 0.32 pasa de 55,6 tok/s (mlx-lm `stream_generate`) a 124,2 tok/s de media, un 2,23× con cadenas de borrador de 3,02 tokens por ronda, con picos de 2,88× en matemáticas. Está publicado con licencia Apache-2.0 y es relevante para quien quiera servir Qwen3-4B en local en Mac con latencia reducida sin tocar la salida del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificación especulativa estilo EAGLE-3 sobre Qwen3-4B: fusión de las capas 2, 18 y 33 con RMSNorm por capa, una capa decoder con la forma de Qwen3-4B, realimentación post-norm (EAGLE-3.1) y LM head sobre el vocabulario completo |
| Parametros totales | 914.245.376 (914 M), de los cuales 389 M son el embedding congelado de Qwen3 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (el borrador no declara ventana propia; opera sobre el contexto de Qwen3-4B). El valor 16.384 de la model card corresponde al vocabulario truncado del draft head, no al contexto |
| Tipos de cuantizacion | No disponible. Pesos publicados en bf16; no se distribuyen variantes cuantizadas (GGUF, 4-bit, etc.) |
| Idiomas soportados | No disponible (la model card no los declara; el entrenamiento incluye 12.000 prompts multilingües sin especificar idiomas) |
| Licencia | Apache-2.0 (los pesos derivan de Qwen3-4B, también Apache-2.0; el código de Woodcock es MIT) |
| Formato de pesos | `model.safetensors` en bf16, más `config.json` (DrafterConfig), `woodcock.json` (manifiesto de exportación), `vocab_counts.npz` y `.json`; librería `mlx` |
| Modelo base / objetivo | Qwen/Qwen3-4B |
| Runtime requerido | Woodcock (Apple Silicon, MLX); no carga en `transformers` |
| Tamano del repositorio | 1,8 GB |
| Vocabulario del draft head | 16.384 tokens más frecuentes de Qwen3-4B (FR-Spec, VocabTrim); la verificación usa el vocabulario completo |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-10-22 |

## Arquitectura y entrenamiento

El borrador es un modelo EAGLE-3 adaptado a Qwen3-4B. Toma los estados ocultos de tres capas del objetivo (2, 18 y 33), los normaliza con RMSNorm independiente por capa y los fusiona; sobre esa representación aplica una única capa decoder con la misma forma que las de Qwen3-4B y realimentación post-norm propia de EAGLE-3.1. La LM head cubre el vocabulario completo en entrenamiento, pero en inferencia puede restringirse a los 16.384 tokens que Qwen3-4B genera con más frecuencia (`vocab_counts.npz`), lo que abarata cada paso de borrador sin alterar la salida porque la verificación sigue usando el vocabulario completo.

El entrenamiento usa el denominado *training-time test* con 4 pasos desenrollados, entropía cruzada con etiquetas suaves contra la distribución de Qwen3-4B, pesos por paso de 0,8^k y pérdida calculada solo sobre los tokens de respuesta. Los datos son 80.000 prompts (36k de chat, 18k de código, 14k de matemáticas y 12k multilingües) respondidos por el propio Qwen3-4B con T=0,7, top-p 0,8, top-k 20, un máximo de 512 tokens y plantilla de chat sin *thinking*, lo que produce 31,2 M de tokens de respuesta en una sola pasada. La optimización empleó AdamW (β 0,9/0,95), lr 1e-4, 200 pasos de calentamiento, decaimiento coseno, clip 0,5, unos 8.000 tokens por paso y 6.400 pasos, con cómputo bf16 y pesos maestros en fp32: una sola H100 con backend MLX CUDA durante 1 h 55 min y un pico de 55 GB.

La innovación clave es la combinación de tres elementos: la fusión multi-capa de estados ocultos, la truncación de vocabulario en el draft head y una política de longitud de cadena automática que en producción eligió 4,6 tokens de media. La concordancia con el siguiente token de Qwen3-4B en datos reservados es del 68,4%, 62,4%, 59,2% y 57,1% para los pasos 1 a 4.

## Capacidades

- Aceleración de la decodificación de Qwen3-4B con salida idéntica: en greedy, token a token; en muestreo, con la misma distribución.
- Predicción de los siguientes tokens a partir de los estados ocultos del modelo objetivo, con concordancia del 68,4% en el primer paso.
- Adaptación automática de la longitud de cadena según la latencia medida en la máquina (`--policy auto:latency.json`).
- Truncación opcional del draft head a 16.384 tokens para reducir el coste por paso de borrador.
- Funcionamiento con el vocabulario completo en la fase de verificación, lo que preserva exactamente la salida del modelo objetivo.
- Cobertura de cuatro dominios gracias a los datos de entrenamiento: chat, código, matemáticas y multilingüe.
- No soporta *tool calling*, agentes, visión, audio ni modo *thinking*: no es un modelo generativo independiente.

## Casos de uso

- Asistente conversacional local en Mac: servir Qwen3-4B con Woodcock y este borrador reduce la latencia percibida en un 1,85× en dominio de chat (102,3 frente a 55,2 tok/s), suficiente para respuestas fluidas en un portátil o sobremesa Apple Silicon sin enviar datos a la nube.
- Autocompletado y generación de código en el IDE: el dominio de código alcanza 2,33× (129,7 frente a 55,6 tok/s) con 3,17 tokens por ronda, lo que hace viables sugerencias multi-línea en tiempo real sobre un modelo de 4B en local.
- Tutoría y resolución de problemas matemáticos paso a paso: es el dominio con mayor ganancia (2,88×, 160,5 tok/s, 4,03 tokens por ronda), porque las cadenas de razonamiento aritmético son muy predecibles para el borrador.
- Atención al cliente o soporte multilingüe autohospedado: 1,86× en dominio multilingüe (104,3 tok/s) permite atender conversaciones multi-turno con la garantía de que el texto generado es exactamente el de Qwen3-4B.
- Investigación en decodificación especulativa: el repositorio incluye `woodcock.json` con la tabla de tensores, los puntos de extracción de estados y los sha256, además de `scripts/time_draft_step.py`, lo que permite reproducir las mediciones de latencia y estudiar la concordancia por paso.
- Evaluación comparativa de borradores: al existir un hermano menor (`woodcock-drafter-qwen3-1.7b`) y política de longitud de cadena automática, se pueden comparar configuraciones de borrador sobre el mismo objetivo sin cambiar el modelo verificado.
- Generación por lotes donde la reproducibilidad es obligatoria: como la salida greedy es idéntica a la de Qwen3-4B, se puede acelerar la inferencia sin revalidar los resultados aguas abajo (salvo empates en bf16, ver limitaciones).
- Prototipado low-cost en estaciones de trabajo Apple: el borrador ocupa 1,8 GB y se ejecuta sobre el objetivo de 4B, sin necesidad de GPUs dedicadas para desarrollo.

## Benchmarks y rendimiento

Medición del autor en M4 Max (48 GB), MLX 0.32, bf16, batch 1, greedy, 256 tokens nuevos por prompt, 10 prompts por dominio (MT-Bench, HumanEval, GSM8K test, Aya), comparando Woodcock con este borrador (draft head de 16k tokens y longitud de cadena automática, 4,6 tokens de media) frente a `stream_generate` de mlx-lm:

| Dominio | mlx-lm (tok/s) | Woodcock + drafter (tok/s) | Aceleracion | Tokens por ronda |
|---|---|---|---|---|
| Matematicas | 55,8 | 160,5 | 2,88× | 4,03 |
| Codigo | 55,6 | 129,7 | 2,33× | 3,17 |
| Chat | 55,2 | 102,3 | 1,85× | 2,45 |
| Multilingue | 56,0 | 104,3 | 1,86× | 2,41 |
| Global | 55,6 | 124,2 | 2,23× | 3,02 |

Concordancia con el siguiente token de Qwen3-4B en datos reservados, por paso de borrador:

| Paso de borrador | Concordancia |
|---|---|
| 1 | 68,4% |
| 2 | 62,4% |
| 3 | 59,2% |
| 4 | 57,1% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, y no procede: la salida del sistema es la de Qwen3-4B. Las cifras de velocidad corresponden a una única configuración de hardware y a batch 1; no hay datos para otros equipos, para fp32 ni para modo *thinking*.

## Requisitos de hardware

- VRAM/espacio para el borrador: 1,8 GB en bf16 (914 M de parámetros, de ellos 389 M de embedding congelado). El repositorio completo ocupa 1,8 GB.
- Memoria para el modelo objetivo: Qwen3-4B en bf16 requiere del orden de 8 GB (estimación a partir de los 4.000 M de parámetros); el borrador añade su propio peso y el estado del runtime.
- Hardware validado: Apple Silicon, concretamente un M4 Max con 48 GB de memoria unificada. No hay mediciones publicadas para otros chips de la familia M.
- GPU dedicadas: no disponible. El entrenamiento se hizo en una H100 con backend MLX CUDA (1 h 55 min, pico de 55 GB), pero la model card no documenta inferencia en CUDA.
- GPU de consumo: no hay datos publicados para RTX 4090 ni similares; el runtime objetivo es Apple Silicon.
- Opciones de despliegue: exclusivamente el runtime Woodcock (repositorio MIT `AtomicBot-ai/woodcock`, instalable con `pip install -e .`) sobre MLX. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Throughput medido: 124,2 tok/s de media y hasta 160,5 tok/s en matemáticas en M4 Max; la latencia del paso de borrador debe medirse una vez por máquina con `scripts/time_draft_step.py` para alimentar la política de longitud de cadena automática.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtomicChat/woodcock-drafter-qwen3-4b | 914 M (389 M congelados) | No disponible | 2,23× global en M4 Max (124,2 tok/s) | Apache-2.0 | HuggingFace, requiere runtime Woodcock |
| AtomicChat/woodcock-drafter-qwen3-1.7b | No disponible | No disponible | No disponible | No disponible | HuggingFace (hermano menor citado en la model card) |
| Borradores EAGLE-3 / Medusa / n-gram lookup genéricos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados que permitan una comparación cuantitativa con otros borradores o frameworks de decodificación especulativa (vLLM con n-gram, Medusa, EAGLE-3 de referencia). La comparación relevante es interna: este borrador frente al de 1,7B y frente a la decodificación estándar de mlx-lm, que es la que figura en la tabla de benchmarks.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: no genera texto por sí solo y no carga en `transformers`. Solo funciona con el runtime Woodcock.
- El modo *thinking* de Qwen3 (`<think>`) no estaba en los datos de entrenamiento; no se han medido aceleraciones en ese régimen y la concordancia del borrador será previsiblemente peor.
- En bf16, una pasada de verificación por lotes puede resolver un empate casi exacto entre dos tokens de forma distinta a una pasada de un solo token, por lo que salidas greedy largas pueden divergir de la decodificación bf16 simple en esos empates. En fp32 son idénticas.
- Las cifras de 2,23× y 124,2 tok/s proceden de un único equipo (M4 Max, 48 GB), batch 1, 256 tokens nuevos y 10 prompts por dominio; no son extrapolables a otros chips, a batch mayor ni a longitudes distintas.
- Los datos de entrenamiento fueron generados por el propio Qwen3-4B, de modo que el borrador hereda los sesgos y errores de distribución del modelo base, aunque la verificación los corrige en la salida final.
- Sesgos conocidos del sistema: los de Qwen3-4B; la model card no documenta evaluaciones de sesgo ni de seguridad.
- Idiomas soportados no declarados: hay 12.000 prompts multilingües en el entrenamiento, pero sin lista de idiomas ni métricas por lengua.
- Riesgo de alucinación: equivalente al de Qwen3-4B, ya que la salida es idéntica; el borrador no lo incrementa ni lo mitiga.
- Licencia Apache-2.0, permite uso comercial; deben respetarse `LICENSE` y `NOTICE` del repositorio, incluida la atribución a Qwen3-4B. El código de Woodcock es MIT.
- Madurez: 0 descargas y 0 likes, public ado y actualizado el mismo día (2026-10-22); no hay validación independiente de las cifras.
- No se publican datos de cuantización, por lo que no se puede reducir el borrador por debajo de bf16 sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AtomicChat/woodcock-drafter-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Hermano menor (1.7B): https://huggingface.co/AtomicChat/woodcock-drafter-qwen3-1.7b
- Dataset de entrenamiento, logs y benchmarks: https://huggingface.co/datasets/AtomicChat/woodcock-training
- Runtime Woodcock (MIT): https://github.com/AtomicBot-ai/woodcock
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a subreddits de deportes y no guardan relación con esta ficha.
