# mlboydaisuke/Qwen3.5-0.8B-MTP-repro-LiteRT

## Resumen

Qwen3.5-0.8B-MTP-repro-LiteRT es un artefacto técnico publicado por el usuario mlboydaisuke a partir del modelo base Qwen/Qwen3.5-0.8B. No se trata de un lanzamiento de modelo, sino de un paquete de reproducción de un fallo del runtime LiteRT-LM: el autor convierte el checkpoint de Qwen en formato `.litertlm` y le añade la cabeza MTP (multi-token prediction) de una capa que incorpora el propio checkpoint, empaquetada como sección drafter para la decodificación especulativa del runtime.

El interés del artefacto es doble. Por un lado, sirve como prueba de mecanismo de la decodificación especulativa con drafter MTP en LiteRT-LM sobre CPU, con ganancias medidas modestas (1,12x en decodificación en un Apple M4 Max). Por otro, documenta el issue #3439 del runtime, por el que con `--speculative-decoding true` el motor no confirma el token de parada al final del turno, lo que corrompe transcripciones multi-turno y degrada visiblemente la calidad en un modelo de 0,8B.

El modelo es adecuado para desarrolladores que trabajen en inferencia on-device con LiteRT-LM y quieran validar el comportamiento del drafter MTP o reproducir el fallo, no como base para producción. Para construir sobre Qwen3.5-0.8B, el propio autor remite a litert-community/Qwen3.5-0.8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (etiqueta `hybrid`, `gated-deltanet`), según tags del repo; detalles completos de capas no disponibles |
| Parametros totales | 0,8B (modelo base Qwen3.5-0.8B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens (longitud de caché del bundle) |
| Tipos de cuantizacion | int8 dynamic-range en capas lineales y tablas de embedding; drafter también int8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); incluye grafo base (prefill ladder, decode, verify), embedder externalizado, tokenizer y drafter MTP de 1 capa |
| Tamano del artefacto | 1,47 GB (`Qwen3.5-0.8B_mtp_drafter_int8.litertlm`); repo total 2,9 GB |
| Drafter | Cabeza MTP de 1 capa del propio checkpoint, empaquetada como `tf_lite_mtp_drafter`; 3 tokens de borrador por ronda |
| Backend | CPU únicamente (el backend GPU no se validó con la sección drafter) |
| Runtime | litert-lm 0.16.0 / 0.16.1 (CLI); nota de compatibilidad con 0.18.0 |
| Herramientas de conversion | litert-torch en commit 115a136 más parche, receta hf-to-litertlm/mtp_work, litert-lm 0.16.0 para empaquetado |

## Arquitectura y entrenamiento

El artefacto no entrena nada: es una conversión y reempaquetado del checkpoint Qwen3.5-0.8B. La conversión produce un grafo LiteRT-LM con firma `verify`, que incluye las etapas de prefill, decode y verificación necesarias para la decodificación especulativa. La innovación técnica del bundle es el uso de la cabeza MTP de una capa que ya viene en el checkpoint como drafter: el runtime la consume para proponer tres tokens por ronda, que el modelo base verifica en una pasada.

La cuantización es int8 dynamic-range tanto en las capas lineales como en las tablas de embedding, con longitud de caché de 4096. La receta de conversión es abierta y reproducible (litert-torch con un parche concreto y la CLI de litert-lm 0.16.0). No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto con plantilla ChatML simple y modo thinking desactivado.
- Decodificación especulativa con drafter MTP integrado (3 tokens de borrador por ronda).
- Single-turn generation y benchmarks funcionales con el flag activado.
- Conversación multi-turno solo con `--speculative-decoding false`; con el flag activo se pierde el token de parada `<|im_end|>` en cada turno (issue #3439).
- Plantilla de chat actualizada (2026-09-21) para aceptar la forma de content-parts de litert-lm 0.18, manteniendo la forma de cadena sin cambios.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Reproducción del issue #3439: el script `stop_token_probe_3439.py` ejecuta una conversación greedy de 5 turnos con el flag off y on, e imprime por turno los tokens de decode confirmados, el tamaño de prefill y el `token_count` de la conversación. Es el uso principal del artefacto.
- Validación de decodificación especulativa en CPU: permite medir la tasa de aceptación del drafter (0,48–0,71 por token borrador, media 2,76 tokens confirmados por ronda) y comparar latencia con y sin el flag.
- Desarrollo de recetas de conversión HF a LiteRT-LM: el bundle sirve como referencia para quien replique el pipeline hf-to-litertlm/mtp_work con litert-torch y la CLI de litert-lm.
- Pruebas de regresión de runtimes on-device: útil en CI de LiteRT-LM para detectar regresiones de contabilidad de tokens (drift de −1 token por turno con el flag activo).
- Benchmarking de latencia en hardware de consumo: el autor publica cifras en Apple M4 Max (611,5 tok/s de prefill y 52,3 tok/s de decode sin flag; 627,1 y 58,4 con flag) que sirven de línea base para comparar portátiles y móviles.
- Estudio de degradación en modelos pequeños: documenta cómo un fallo de runtime (token de parada ausente) degrada visiblemente la calidad de un modelo de 0,8B en turnos posteriores, útil para diseñar evaluaciones multi-turno.

## Benchmarks y rendimiento

Rendimiento medido por el autor en macOS, Apple M4 Max, CPU, litert-lm 0.16.0 CLI, `benchmark -p 128 -d 256 --cache no`, 2026-09-01:

| Configuracion | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|
| `--speculative-decoding false` | 611,5 | 52,3 |
| `--speculative-decoding true` | 627,1 | 58,4 (1,12x) |

Tasa de aceptación del motor en cuatro prompts: 0,48–0,71 por token borrador, equivalente a 2,4–3,1 tokens confirmados por ronda (media 2,76). En un Galaxy S26 (CPU, tramos de 150 tokens, con esperas de refrigeración, mediana de 3) el flag activado fue más lento con texto de documento: 32,4 a 22,9 tok/s. En iPhone también resultó más lento en el arnés del autor.

Registro de corrección: gate a nivel de intérprete contra el modelo HF fp32 con rechazo forzado en cada índice de borrador y prefill de continuación sobre la cola rechazada, 33/33 comprobaciones, max|diff| de logits ≤ 6e-5 y argmax igual en cada posición confirmada. Con el runtime publicado (0.16.0, CPU), gate de chat de 8 preguntas: 7/8; rellenos de una palabra de 1 a 16 con el flag: 16/16. Frente al mismo bundle con el flag desactivado, 1 de 4 prompts fue byte-idéntico; el resto diverge en empates cercanos de int8 (brecha top-2 del referee HF-fp32 de 0,125–0,375 en cada divergencia), no por error de contrato.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el archivo principal pesa 1,47 GB en int8; se recomienda al menos 2–3 GB de memoria libre para el runtime y la caché de 4096 tokens.
- GPU: no se validó el backend GPU con la sección drafter; el artefacto está pensado para CPU.
- Hardware de referencia: Apple M4 Max (CPU) para las cifras publicadas; Galaxy S26 (CPU) e iPhone en pruebas del autor.
- Cabe en hardware de consumo y en móviles de gama alta, dado el tamaño de 0,8B y la cuantización int8.
- Despliegue: CLI de litert-lm (versiones 0.16.0 o 0.16.1) con `litert-lm run` y `litert-lm benchmark`; backend `cpu`.
- Throughput: 52,3 tok/s de decode sin flag y 58,4 con flag en M4 Max; 32,4 tok/s sin flag y 22,9 con flag en Galaxy S26 con texto de documento.
- Limitación operativa: un Engine por conversación; en litert-lm 0.18.0 el runtime reutiliza el estado recurrente de una conversación anterior en el mismo Engine (issue #3165).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mlboydaisuke/Qwen3.5-0.8B-MTP-repro-LiteRT | 0,8B | 4096 | `.litertlm` int8 | Apache 2.0 | Artefacto de reproducción de bug; decodificación especulativa MTP; solo CPU |
| litert-community/Qwen3.5-0.8B | 0,8B | No disponible | LiteRT-LM | No disponible | Conversión recomendada por el autor para construir sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | Safetensors (fp32/fp16 según checkpoint) | No disponible | Modelo base original en formato Hugging Face |

## Limitaciones y advertencias

- Es un artefacto de prueba, no un lanzamiento: el autor lo publica únicamente para reproducir el issue #3439.
- Con `--speculative-decoding true`, el runtime no confirma el token de parada al final del turno: cada turno del asistente pierde `<|im_end|>`, el `token_count` deriva −1 por turno y la calidad del modelo de 0,8B se degrada visiblemente en turnos posteriores.
- Solo CPU: el backend GPU no se validó con la sección drafter.
- Un Engine por conversación: en litert-lm 0.18.0 se reutiliza el estado recurrente entre conversaciones del mismo Engine (issue #3165), lo que puede contaminar respuestas.
- Divergencia frente a fp32 en empates cercanos de int8; no es un error de contrato, pero implica que las salidas no son byte-idénticas al modelo de referencia.
- En móviles, el flag de decodificación especulativa puede ser más lento que sin él (32,4 a 22,9 tok/s en Galaxy S26 con texto de documento).
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos más allá de los del modelo base.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el estado del runtime (bug abierto) desaconseja su uso en producción multi-turno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Qwen3.5-0.8B-MTP-repro-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Conversión recomendada: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Issue #3439 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/issues/3439
- Issue #3165 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Receta de conversión hf-to-litertlm/mtp_work: https://github.com/john-rocky/hf-to-litertlm/tree/main/mtp_work
- Ficha en free2aitools: https://free2aitools.com/model/mlboydaisuke/qwen3.5-0.8b-mtp-repro-litert
