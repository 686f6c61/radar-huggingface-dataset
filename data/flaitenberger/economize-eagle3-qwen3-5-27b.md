# flaitenberger/economize-eagle3-Qwen3.5-27B

## Resumen

EAGLE-3 draft head para Qwen3.5-27B, publicado por Filipe Laitenberger (usuario `flaitenberger`) bajo licencia Apache 2.0. No es un modelo generativo autonomo, sino un cabezal borrador (draft head) disenado para decodificacion especulativa: predice varios tokens por adelantado que luego el modelo base Qwen3.5-27B verifica en una sola pasada. El repositorio contiene unicamente los pesos del borrador (912M parametros), no los del modelo base, que debe descargarse por separado.

La pieza central es una unica capa decoder que lee los estados ocultos del modelo base a tres profundidades, los fusiona en un unico vector y los combina con el embedding del ultimo token para predecir los siguientes tokens mediante su propia LM head restringida a los 32.768 tokens mas frecuentes del corpus de entrenamiento. El MLP del borrador tiene una anchura de 35.840.

Su relevancia practica es directa: acelera la inferencia del modelo base sin alterar su distribucion de salida. Segun las mediciones del autor, ofrece una mejora de throughput de 1,35x en agregado (hasta 1,82x en matematicas) con 2,70 tokens generados por pasada del modelo base. El checkpoint se publico en noviembre de 2026 y esta pensado para integrarse con la libreria `economize` (version 0.4 o superior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 draft head (una capa decoder con fusion de estados ocultos a tres profundidades y LM head propia) |
| Parametros totales | 912M (solo el borrador; el modelo base Qwen3.5-27B se carga aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-27B) |
| Tipos de cuantizacion | no disponible (entrenado y medido en bf16; se recomienda float32 para paridad exacta con greedy) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos del borrador); el modelo base tiene su propia licencia |
| Formato de pesos | safetensors |
| Anchura del MLP del borrador | 35.840 |
| Vocabulario de la LM head del borrador | 32.768 tokens mas frecuentes del corpus de entrenamiento |
| Configuracion de decodificacion por defecto | `cycle_length=9` (hasta 8 borradores por pasada del base), `min_confidence=0.7` |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El borrador sigue el diseno EAGLE-3: una sola capa decoder que recibe los estados ocultos del modelo base en tres profundidades distintas, los fusiona en un vector unico y lo concatena con el embedding del ultimo token. A partir de ahi predice los siguientes tokens con su propia LM head, limitada a los 32.768 tokens mas frecuentes del conjunto de entrenamiento para reducir coste computacional. El MLP interno tiene anchura 35.840. Cada borrador es verificado por el modelo base, de modo que la decodificacion greedy devuelve exactamente la salida greedy del base y el muestreo especulativo (`verifier="rejection"`) respeta su distribucion de muestreo.

El entrenamiento se realizo con la libreria `economize` sobre 26.485 respuestas (31,3M tokens) generadas de forma greedy por Qwen3.5-27B a partir de prompts de UltraChat, ShareGPT y colecciones de codigo y matematicas. Se eliminaron los prompts que compartian un 13-grama con alguno de los conjuntos de evaluacion. El objetivo es una divergencia KL respecto a la distribucion del siguiente token del modelo base sobre 7 pasos de borrador desenrollados, con pesos 0,8^k para el paso k. Se hizo una pasada sobre los datos en 2.333 pasos de optimizador de 16.384 tokens con padding, AdamW (betas 0,9 y 0,95), learning rate 3e-4, 100 pasos de warmup, decaimiento coseno hasta una decima del pico y clipping de gradiente en 1,0. El entrenamiento consumio 8,9 GPU-horas en una sola GPU con el modelo base congelado.

## Capacidades

- Aceleracion de decodificacion del modelo base Qwen3.5-27B mediante decodificacion especulativa (borrador mas verificacion).
- Generacion de texto compatible con el chat template de Qwen (se usa el tokenizer de `Qwen/Qwen3.5-27B`).
- Preservacion exacta de la salida greedy del base en float32; en bf16 puede haber divergencias numericas tras cierto numero de tokens.
- Muestreo especulativo con verificacion por rechazo, que mantiene la distribucion de muestreo del modelo base.
- Configuracion ajustable de ciclo de borrado (`cycle_length`) y umbral de confianza (`min_confidence`).
- No incorpora capacidades propias de vision, audio, tool calling ni agentes; hereda las del modelo base, pero el borrador solo acelera la generacion de texto.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar Qwen3.5-27B con este borrador reduce el coste por token generado (1,35x de media, 1,82x en matematicas) sin cambiar la salida del modelo en float32, lo que permite mantener SLAs de latencia con menos GPU.
- Servicio de chat multi-turno: con 1,25x de mejora en dominios conversacionales (MT-Bench, AlpacaEval, Arena-Hard), es adecuado para asistentes con prompts largos y respuestas de hasta 256 tokens.
- Generacion de codigo asistida: 1,37x de mejora en HumanEval, MBPP y LiveCodeBench, util en IDE plugins o pipelines de CI/CD que autocompletan codigo.
- Razonamiento matematico interactivo: la mejora de 1,82x en GSM8K, MATH-500, AIME y AMC reduce la latencia en tutores o evaluadores automaticos que generan cadenas de razonamiento.
- Resumen de documentos: 1,22x en CNN/DailyMail, apropiado para resumidores por lotes donde el throughput importa.
- Despliegue en una sola H100: el autor midio el rendimiento en una NVIDIA H100 en bf16 con CUDA graphs y batch size 1, lo que encaja en infraestructura de una sola GPU para prototipos y servicios de baja concurrencia.
- Experimentacion con decodificacion especulativa: sirve como referencia para estudiar tecnicas de aceleracion con `economize` sobre modelos de 27B.

## Benchmarks y rendimiento

Throughput relativo a la decodificacion greedy del modelo base en el mismo runtime (economize 0.3.2, una NVIDIA H100, bf16, CUDA graphs, batch size 1, hasta 256 tokens nuevos):

| Dominio | Speedup | Tokens por pasada del base |
|---|---|---|
| Agregado | 1,35x | 2,70 |
| Chat | 1,25x | no disponible |
| Codigo | 1,37x | no disponible |
| Matematicas | 1,82x | no disponible |
| Resumen | 1,22x | no disponible |
| Contexto largo | 1,01x | no disponible |

En la medicion, el 60% de las respuestas fueron identicas al greedy del base en los 256 tokens; en float32 la salida es exactamente igual al greedy.

## Requisitos de hardware

- VRAM estimada: no disponible de forma aislada; el borrador anade 912M parametros (aprox. 1,8 GB en bf16) sobre el modelo base de 27B, que domina el consumo.
- GPU recomendadas: NVIDIA H100 (configuracion medida por el autor); cualquier GPU con suficiente VRAM para el modelo base de 27B en bf16.
- GPU de consumo: no disponible; un modelo de 27B en bf16 no cabe en GPUs de consumo de 24 GB sin cuantizacion, y no se han publicado datos de cuantizacion para el borrador.
- Despliegue: libreria `economize` (>=0.4) sobre `transformers`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,35x de speedup agregado y 2,70 tokens por pasada del base en la medicion del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Speedup medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| economize-eagle3-Qwen3.5-27B | 912M (borrador) | heredado del base | 1,35x agregado | Apache 2.0 | HuggingFace |
| Otros draft heads EAGLE-3 para modelos de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos base sin aceleracion (Qwen3.5-27B greedy) | 27B | no disponible | 1,0x (referencia) | licencia propia del base | HuggingFace |

No se dispone de datos publicados de borradores EAGLE-3 comparables para modelos de este tamano en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar Qwen3.5-27B por separado; el repositorio solo contiene los pesos del borrador.
- En bf16, la verificacion sobre varios tokens redondea de forma distinta a un paso de un solo token, por lo que la salida puede diferir de la decodificacion greedy plana (en la medicion, el 40% de las respuestas divergieron en algun token); en float32 la paridad es exacta.
- La ganancia en contexto largo es marginal (1,01x), por lo que no aporta ventaja en escenarios de ventanas muy extensas.
- La LM head del borrador cubre solo los 32.768 tokens mas frecuentes; los tokens fuera de ese vocabulario no pueden ser borradorados y reducen la efectividad.
- Sesgos y riesgo de alucinacion: no documentados de forma especifica; hereda los del modelo base Qwen3.5-27B.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- La licencia Apache 2.0 cubre solo los pesos del borrador; el uso comercial del modelo base queda sujeto a la licencia de Qwen/Qwen3.5-27B.
- Dependencia de la libreria `economize` (>=0.4); no hay soporte documentado para otros runtimes de inferencia.
- Los resultados de speedup provienen de una unica ejecucion de timing en una H100 con batch size 1; el rendimiento en otros hardwares o con mayor concurrencia no esta medido.

## Enlaces

- HuggingFace: https://huggingface.co/flaitenberger/economize-eagle3-Qwen3.5-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio economize: https://github.com/Thiggel/economize
- Documentacion economize: https://thiggel.github.io/economize/
