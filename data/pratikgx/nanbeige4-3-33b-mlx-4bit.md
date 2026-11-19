# pratikgx/Nanbeige4.3-33B-MLX-4bit

## Resumen

Nanbeige4.3-33B-MLX-4bit es una cuantización en 4 bits del modelo Nanbeige/Nanbeige4.3-33B, publicada por el usuario pratikgx para su ejecución en Apple Silicon mediante la librería MLX. El modelo original, desarrollado por el equipo Nanbeige, es un transformer de 33.118.977.024 parámetros (aproximadamente 33,1 mil millones) con licencia Apache 2.0. Esta versión cuantizada reduce el peso en disco a 18,6 GB, lo que permite ejecutarlo en equipos con memoria unificada de 64 GB, como un Mac mini con chip M5 Pro.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 33B en hardware de consumo Apple sin necesidad de GPUs dedicadas. La model card incluye mediciones reales de velocidad, memoria y pruebas de aguja en pajar (needle in a haystack) hasta 128k tokens de contexto, lo que permite evaluar su viabilidad en producción local. No obstante, se trata de una cuantización comunitaria, no oficial, y las pruebas de calidad son verificaciones de sanidad con conjuntos muy reducidos (20, 10 y 10 elementos), no resultados de benchmarks estandarizados.

El modelo emplea un modo de razonamiento (thinking) que abre un bloque `<think>` antes de responder, por lo que requiere asignar suficientes tokens de generación para el razonamiento y la respuesta final. La cuantización afecta a todas las capas lineales, incluidos los embeddings y el `lm_head`, con un tamaño de grupo de 64 y aproximadamente 4,5 bits por peso incluyendo escalas y sesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de la arquitectura original no disponibles en la informacion proporcionada) |
| Parametros totales | 33.118.977.024 (aproximadamente 33,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 128k tokens verificados en pruebas de needle in a haystack (131.008 tokens de prompt); contexto maximo oficial no disponible |
| Tipos de cuantizacion | MLX affine quantization, 4 bits, group size 64, aproximadamente 4,5 bits por peso incluyendo escalas y sesgos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 18.630.506.496 bytes de pesos, 18,6 GB en disco |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo original Nanbeige4.3-33B mas alla de que se trata de un transformer de 33,1B parametros. No se especifica si emplea attention lineal, mezcla de expertos (MoE), state space models ni hibridaciones. Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. La model card de esta cuantizacion se limita a describir el proceso de conversion y las mediciones de rendimiento, remitiendo al repositorio original para los detalles de entrenamiento.

La innovacion tecnica destacable de esta publicacion es el propio proceso de cuantizacion: se convirtieron los pesos bf16 del modelo original mediante `mlx.core.quantize` (equivalente a `mlx_lm.convert -q`) con mlx 0.32.4 y mlx-lm 0.32.2, aplicando cuantizacion a todas las capas lineales, incluidos embeddings y `lm_head`. El autor verifico que la copia convertida en CPU (la subida) y la convertida en Metal (la evaluada) son equivalentes: en una comprobacion de una capa completa, aproximadamente el 0,2% de los codigos de 4 bits difieren en uno o dos pasos por redondeo de coma flotante, con el mismo error frente al original bf16. El modelo incorpora un modo de razonamiento que abre un bloque `<think>` antes de la respuesta final.

## Capacidades

- Generacion de texto conversacional y de proposito general, con pipeline `text-generation`.
- Razonamiento explicito mediante bloque `<think>`: el modelo razona primero y luego responde, lo que exige asignar suficientes tokens de generacion.
- Razonamiento matematico: obtuvo 20/20 en un conjunto de problemas de palabras matematicos (verificacion de sanidad, no benchmark estandar).
- Generacion de codigo: obtuvo 10/10 en tareas de programacion en el conjunto de prueba del autor.
- Seguimiento de instrucciones: obtuvo 10/10 en el conjunto de prueba del autor.
- Manejo de contexto largo: recupero correctamente la aguja en pruebas de needle in a haystack a 32k, 64k y 128k tokens, en distintas profundidades (10%, 25%, 30%, 50%, 70%, 75%, 90%).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; la model card no menciona capacidades multimodales.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar conversaciones multi-turno con razonamiento previo gracias a su bloque `<think>` y a una ventana de contexto verificada de hasta 128k tokens, ejecutandose en un Mac mini M5 Pro de 64 GB con `mlx_lm.chat`. Es adecuado para entornos donde no se quiere enviar datos a la nube.
- Analisis de documentos largos: con recuperacion fiable de informacion a 128k tokens en pruebas de needle in a haystack, puede emplearse para resumir o responder preguntas sobre informes, contratos o articulos extensos, siempre que se asuma un tiempo de procesamiento de prompt elevado (136,4 tok/s a 128k y aproximadamente 16 minutos de extremo a extremo en el equipo medido).
- Generacion de codigo en local: con 10/10 en las tareas de codigo del autor, puede integrarse en flujos de trabajo de desarrollo en Apple Silicon para autocompletar, explicar o refactorizar codigo, aunque sin datos de benchmarks estandar como HumanEval.
- Resolucion de problemas matematicos y razonamiento paso a paso: el modo thinking y el 20/20 en problemas de palabras lo hacen util para tutoria o verificacion de calculos, con la advertencia de que el conjunto de prueba es muy reducido.
- Prototipado de aplicaciones de IA en Apple Silicon: al estar en formato MLX y ocupar 18,6 GB en disco con un pico de memoria de 19,32 GB a contexto de 512 tokens, permite iterar rapidamente en un portatil o mini de Apple sin GPU dedicada.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para estudiar el impacto de la cuantizacion 4-bit MLX en un modelo de 33B, con datos de velocidad, memoria y calidad de sanidad publicados por el autor.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse integramente en local y con licencia Apache 2.0, es apto para procesar datos sensibles sin salida a internet, siempre que se validen sesgos y alucinaciones.

## Benchmarks y rendimiento

Rendimiento medido en un Mac mini M5 Pro 64 GB, macOS 27.0.1, mlx 0.32.4 / mlx-lm 0.32.2, decodificacion greedy (temp 0), 256 tokens generados, mediana de 3 ejecuciones tras 1 calentamiento:

| Contexto (tokens de prompt) | Thinking | Procesamiento de prompt (tok/s) | Generacion (tok/s) | Tiempo al primer token | Memoria pico |
|---|---|---|---|---|---|
| 512 | on | 310,8 | 14,38 | 1,65 s | 19,32 GB |
| 512 | off | 358,2 | 14,51 | 1,43 s | 19,32 GB |
| 4.096 | on | 350,4 | 13,85 | 11,70 s | 20,21 GB |
| 4.096 | off | 355,8 | 13,75 | 11,52 s | 20,21 GB |
| 16.384 | on | 298,2 | 11,69 | 54,97 s | 22,82 GB |
| 32.768 | on | 252,0 | 9,93 | 130,10 s | 26,37 GB |

Calidad (verificaciones de sanidad, thinking on):

| Prueba | Resultado |
|---|---|
| Problemas de palabras matematicos | 20/20 |
| Tareas de codigo | 10/10 |
| Seguimiento de instrucciones | 10/10 |

Needle in a haystack (thinking on):

| Contexto | Profundidad de la aguja | Encontrada | Procesamiento de prompt (tok/s) | Memoria pico |
|---|---|---|---|---|
| 32k | 10% | si | 256,9 | 26,32 GB |
| 32k | 30% | si | 260,5 | 26,35 GB |
| 32k | 50% | si | 261,3 | 26,35 GB |
| 32k | 70% | si | 253,7 | 26,35 GB |
| 32k | 90% | si | 259,0 | 26,35 GB |
| 64k | 25% | si | 195,4 | 33,44 GB |
| 64k | 50% | si | 200,0 | 33,44 GB |
| 64k | 75% | si | 200,6 | 33,44 GB |
| 128k | 50% | si | 136,4 | 47,75 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras de calidad anteriores son conjuntos pequenos escritos por el autor para esta prueba y deben tratarse como verificaciones de sanidad, no como puntuaciones de leaderboard.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,32 GB de pico a contexto de 512 tokens; 20,21 GB a 4k; 22,82 GB a 16k; 26,37 GB a 32k; 33,44 GB a 64k; 47,75 GB a 128k. El repo ocupa 18,6 GB en disco.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente. El autor midio en un Mac mini M5 Pro de 64 GB. No hay datos para GPUs NVIDIA (A100, H100, RTX 4090) porque el formato MLX esta orientado a Apple Silicon.
- Cabe en GPU de consumo: si, en equipos Apple Silicon. Con 64 GB se alcanzan contextos de 128k sin agotar memoria; con 32 GB el margen se reduce y no se cubriria el pico de 33,44 GB a 64k ni el de 47,75 GB a 128k.
- Opciones de despliegue: `mlx-lm` (comandos `mlx_lm.generate` y `mlx_lm.chat`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: generacion de 14,38 tok/s a contexto 512 con thinking y 9,93 tok/s a 32k; procesamiento de prompt entre 136,4 y 358,2 tok/s segun contexto. Tiempo al primer token de 1,65 s a 512 tokens y 130,10 s a 32k. El test de 128k tardo aproximadamente 16 minutos de extremo a extremo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de especificaciones del modelo original mas alla del numero de parametros, por lo que no es posible una comparativa rigurosa con alternativas. La siguiente tabla recoge lo que se conoce de esta publicacion y del modelo base:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-4bit (esta ficha) | 33,1B | hasta 128k verificado | MLX 4-bit, safetensors, 18,6 GB | Apache 2.0 | Hugging Face, requiere Apple Silicon y mlx-lm |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos alternativos de la misma categoria con datos verificables para comparar parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Es una cuantizacion comunitaria no oficial: el autor declara que solo contiene una copia cuantizada y que todo el credito del modelo es del equipo Nanbeige. La calidad puede diferir de la version bf16 original.
- Las pruebas de calidad son verificaciones de sanidad con conjuntos muy pequenos (20, 10 y 10 elementos) escritas por el autor para este benchmark; no son puntuaciones de leaderboard ni evaluaciones estandarizadas.
- Las mediciones de velocidad y memoria provienen de una sola maquina y una sola sesion (Mac mini M5 Pro 64 GB); no se registraron advertencias termicas ni de rendimiento, pero la variabilidad entre equipos no esta cuantificada.
- El modo thinking abre un bloque `<think>` y consume tokens antes de la respuesta; si no se asigna suficiente `--max-tokens`, la respuesta puede quedar truncada.
- El tiempo de procesamiento de prompts largos es elevado: 130,10 s para el primer token a 32k tokens y aproximadamente 16 minutos de extremo a extremo en el test de 128k, lo que limita su uso interactivo con contextos muy grandes.
- Con 32 GB de memoria unificada no se cubririan los picos medidos a 64k (33,44 GB) ni a 128k (47,75 GB).
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0.
- No se dispone de datos sobre tool calling, capacidades de agente ni multimodalidad, por lo que no deben asumirse en produccion sin validacion previa.
- El formato MLX esta orientado a Apple Silicon; no es directamente desplegable en GPUs NVIDIA con las herramientas habituales (vLLM, TGI) sin conversion adicional.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/pratikgx/Nanbeige4.3-33B-MLX-4bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Notas del autor en GitHub: https://github.com/pratikgx/local-ai-field-notes/blob/main/notes/2026-10-25-nanbeige4.3-33b.md
- Repositorio Local AI field notes: https://github.com/pratikgx/local-ai-field-notes
- Perfil del autor en X: https://x.com/pratikg
