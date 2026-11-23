# patrickbdevaney/dspark-mtp-draft-head-s3recap-p25-b0.1

## Resumen

DSpark MTP draft head `s3recap-p25-b0.1` es una cabeza de borrador (draft head) especializada para decodificación especulativa sobre el checkpoint `0xSero/DeepSeek-V4-Flash-0731-REAP`, una versión podada mediante REAP (160 de 256 expertos enrutados) de `deepseek-ai/DeepSeek-V4-Flash-0731`. No es un modelo de lenguaje autónomo: sustituye la cabeza MTP (multi-token prediction) nativa del checkpoint objetivo para acelerar la generación mediante verificación especulativa greedy.

El artefacto principal, `mtp_trained.safetensors`, contiene 517.318.215 parámetros en BF16 correspondientes a los 72 tensores no-expertos de los tres bloques MTP encadenados (`mtp.0/1/2`): atención, router gate y bias, shared expert, parámetros de hyper-connection, `main_proj`, Markov head y confidence head. Los expertos enrutados no se incluyen y se heredan sin cambios del modelo objetivo.

Su relevancia es práctica: en una Jetson AGX Thor con el motor CUDA del autor, la suite congelada de 8 prompts decodifica a 28,38 tok/s con ancho de borrador 5, frente a 14,61 tok/s en decodificación autorregresiva pura en la misma ejecución (1,94x). El repositorio incluye además un archivo de 24 cabezas adicionales del mismo programa de entrenamiento bajo `arms/`, lo que lo convierte en material de referencia para investigación en decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) de 3 bloques encadenados sobre transformer MoE con decodificación especulativa DSpark; modelo base `deepseek_v4` |
| Parametros totales | 517.318.215 (solo la cabeza, BF16); el checkpoint objetivo completo no se especifica en la información disponible |
| Parametros activos | no disponible (el modelo base es MoE con 160 de 256 expertos enrutados tras poda REAP; el número de parámetros activos no se detalla) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (el checkpoint objetivo usa formatos del propio checkpoint, con escalas de bloque E8M0 potencia de dos recalculadas); maestro de entrenamiento en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`mtp_trained.safetensors`, 1.034.643.326 bytes, SHA-256 `42552974a69a…`) |

## Arquitectura y entrenamiento

La cabeza sustituye los tres bloques MTP encadenados del checkpoint objetivo. Cada bloque incluye atención, router gate y bias, shared expert, parámetros de hyper-connection, `main_proj`, una Markov head y una confidence head. El ancho de borrador es 5, coincidente con el `dspark_block_size` propio del checkpoint. Los tensores se integran en los shards 46–48 del checkpoint mediante `tools/build_trained_head.py`, que recalcula escalas de bloque E8M0 potencia de dos y rechaza cualquier tensor cuyo error de ida y vuelta supere 0,10.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. El historial de entrenamiento por paso está en `train_metrics.json`. La innovación técnica central es la decodificación especulativa con verificación greedy: bajo verificación greedy, la salida es idéntica a la decodificación greedy simple por construcción, y cada ejecución comprueba los primeros 8 tokens especulativos contra decodificación autorregresiva (`LOSSLESS GATE ... PASS`).

## Capacidades

- Aceleración de decodificación especulativa sobre el checkpoint `DeepSeek-V4-Flash-0731-REAP`: incrementa el número de tokens comprometidos por forward del modelo objetivo (τ).
- Verificación sin pérdida: la salida bajo verificación greedy coincide con la decodificación greedy autorregresiva.
- Rendimiento diferencial por categoría: τ de 4,83 en multi_turn, 4,53 en long_context, 4,18 en code_edit, 4,16 en agentic_format, 3,87 en short_factual, 3,57 en reasoning, 3,00 en explanation y 2,59 en code_gen.
- No es un modelo generativo autónomo: no soporta por sí mismo tool calling, agentes, visión, audio ni capacidades multilingües; estas dependen del checkpoint objetivo.
- Compatible con el motor CUDA `deepseek-v4-flash-0731-cuda` (revisión `a608d52d7` en el momento de la promoción), orientado a Jetson AGX Thor (`sm_110a`).

## Casos de uso

- Aceleración de inferencia en edge: desplegar el checkpoint completo `DeepSeek-V4-Flash-0731-REAP-DSpark` en una Jetson AGX Thor para obtener 28,38 tok/s frente a 14,61 tok/s autorregresivos, adecuado para asistentes locales con requisitos de latencia estrictos.
- Servicio de chat multi-turno: la categoría multi_turn alcanza τ de 4,83 y 34,05 tok/s (2,33x frente a AR), lo que reduce el coste por turno en conversaciones con historial largo.
- Procesamiento de documentos largos: long_context logra τ de 4,53 y 31,17 tok/s (2,13x), útil para resumen y extracción sobre entradas extensas.
- Edición de código asistida: code_edit registra τ de 4,18 y 29,80 tok/s (2,04x), apropiado para parcheo y refactorización interactiva donde importa el tiempo hasta el primer token útil.
- Generación de formatos agénticos: agentic_format obtiene τ de 4,16 y 29,87 tok/s (2,04x), aplicable a pipelines que producen JSON o llamadas a herramientas estructuradas.
- Investigación en decodificación especulativa: el repositorio incluye 24 cabezas archivadas en `arms/` (unos 1,03 GB cada una) con registros de promoción en `HEAD_REGISTRY.md`, útiles para comparar estrategias de entrenamiento de draft heads.
- Reconstrucción y validación de checkpoints: `tools/build_trained_head.py` y los SHA-256 registrados en `head_card.json` permiten verificar la integridad de los shards 46–48 en despliegues reproducibles.

## Benchmarks y rendimiento

Protocolo: suite congelada de 8 prompts del motor, uno por categoría, con al menos 200 tokens generados, decodificación greedy y ancho de borrador 5. τ es el número de tokens comprometidos por forward del modelo objetivo; el máximo es 6 con ancho 5.

| Cabeza | τ | tok/s | AR en la misma ejecución | Fuente |
|---|---:|---:|---:|---|
| DSpark stock, ancho 5 | 3,2550 | 23,25 | 13,86 | `evidence/run0_tau_blk5.log` |
| `s3`, ancho 5 (incumbente previo) | 3,6888 | no disponible | no disponible | `docs/HEAD_REGISTRY.md` |
| **Esta cabeza, ancho 5** | **3,8413** | **28,38** | **14,61** | `eval.log`, `head_card.json` |

Desglose por prompt de esta cabeza:

| Categoría | τ | tok/s | vs AR |
|---|---:|---:|---:|
| multi_turn | 4,83 | 34,05 | 2,33x |
| long_context | 4,53 | 31,17 | 2,13x |
| code_edit | 4,18 | 29,80 | 2,04x |
| agentic_format | 4,16 | 29,87 | 2,04x |
| short_factual | 3,87 | 28,83 | 1,97x |
| reasoning | 3,57 | 28,12 | 1,92x |
| explanation | 3,00 | 24,14 | 1,65x |
| code_gen | 2,59 | 21,08 | 1,44x |
| **Media de la suite** | **3,8413** | **28,38** | **1,94x** |

Frente a la cabeza stock con ancho 5, τ sube en seis categorías y baja en dos: long_context (5,00 a 4,53) y agentic_format (4,41 a 4,16). Según la regla de publicación del proyecto, la cabeza incumple 3 de 6 umbrales por categoría (long_context, agentic_format, reasoning); fue promovida por la media de la suite y el puntero de release no se movió a ella (`HEAD_REGISTRY.md`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para la cabeza: el maestro BF16 ocupa aproximadamente 1,03 GB; los shards instalados 46–48 se re-cuantizan a los formatos del checkpoint objetivo (FP8), por lo que el peso efectivo en memoria es menor que el maestro.
- VRAM total: dominada por el checkpoint objetivo `DeepSeek-V4-Flash-0731-REAP` (48 shards); la información disponible no detalla su huella exacta.
- GPU validadas: únicamente Jetson AGX Thor (`sm_110a`) con el motor CUDA del autor. No se ha probado ningún otro runtime.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras GPU consumer.
- Opciones de despliegue: exclusivamente el motor `deepseek-v4-flash-0731-cuda` (revisión `a608d52d7` en la promoción) y el script `tools/build_trained_head.py` para instalar la cabeza. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 28,38 tok/s de media en la suite (rango 21,08–34,05 tok/s por categoría) y 14,61 tok/s autorregresivos de referencia en el mismo hardware.

## Comparativa con modelos similares

| Cabeza | τ (ancho 5) | tok/s | Estado | Licencia |
|---|---:|---:|---|---|
| DSpark stock (nativa del checkpoint) | 3,2550 | 23,25 | Integrada en el checkpoint objetivo | MIT (según repo) |
| `s3` (incumbente previo) | 3,6888 | no disponible | Archivada en `arms/s3/`; medida a ancho 6 en su repo propio | MIT |
| `s3recap-p25-b0.1` (esta) | 3,8413 | 28,38 | Promovida por media de suite; puntero de release no movido | MIT |

No se dispone de comparación con cabezas de borrador de otros proyectos ni con modelos completos alternativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: requiere el checkpoint `0xSero/DeepSeek-V4-Flash-0731-REAP` y no genera texto por sí misma.
- Incumple 3 de 6 umbrales por categoría del propio proyecto (long_context, agentic_format, reasoning) y el puntero de release no se movió a esta cabeza; la promoción se basó solo en la media de la suite.
- Solo se ha ejecutado con el motor CUDA del autor sobre Jetson AGX Thor (`sm_110a`); ningún otro runtime ha sido probado, lo que limita la portabilidad.
- La evaluación se apoya en una suite congelada de 8 prompts, uno por categoría, con al menos 200 tokens generados; es una muestra reducida y no sustituye una evaluación de calidad amplia.
- No hay datos publicados de sesgos, tasas de alucinación ni rendimiento multilingüe para esta cabeza; esas propiedades dependen del checkpoint objetivo y no se documentan aquí.
- La licencia MIT se declara en el repositorio, pero el modelo base y el checkpoint objetivo pueden tener condiciones adicionales que deben verificarse antes de uso comercial.
- El repositorio pesa 24,85 GB, mayoritariamente por las 24 cabezas archivadas en `arms/`; la descarga completa no es necesaria si solo se busca la cabeza promovida.
- El proceso de instalación exige recalcular escalas E8M0 y rechaza tensores con error de ida y vuelta superior a 0,10; una integración manual incorrecta puede degradar la fidelidad de la decodificación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/patrickbdevaney/dspark-mtp-draft-head-s3recap-p25-b0.1
- Checkpoint completo recomendado con la cabeza instalada: https://huggingface.co/patrickbdevaney/DeepSeek-V4-Flash-0731-REAP-DSpark
- Cabeza previa `s3`: https://huggingface.co/patrickbdevaney/deepseek-v4-flash-0731-REAP-calibrated-draft-head
- Modelo objetivo (poda REAP): https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-REAP
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor CUDA: https://github.com/patrickbdevaney/deepseek-v4-flash-0731-cuda
