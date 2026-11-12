# mazuj2/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF

## Resumen

Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF es un conjunto de cuantizaciones GGUF publicadas por el usuario mazuj2 sobre un modelo base fusionado con `mergekit` a partir de tres fine-tunes de Qwen/Qwen3.8-27B. El objetivo declarado es combinar razonamiento arquitectonico profundo, generacion de codigo front-end y full-stack, y ejecucion sin bucles repetitivos de autocorreccion. La fusion emplea el metodo `dare_ties` con pesos normalizados que dan prioridad al componente de codigo (Qwopus, 0.60), seguido del componente de ejecucion RL (Swift-1.5, 0.25) y del guardrail de razonamiento (ThinkingCap, 0.15).

El modelo conserva la arquitectura hibrida Mamba2 + atencion del Qwen3.8-27B original, con aproximadamente 27.000 millones de parametros, y preserva las 15 tensores nativos de Multi-Token Prediction (`blk.64.nextn.*`), lo que permite decodificacion especulativa en `llama.cpp` sin modelo borrador separado. Las cuantizaciones se han calibrado con una importance matrix filtrada por dominio de codigo sobre 419 chunks de trazas de razonamiento y tool-use.

Es relevante para desarrolladores que quieran desplegar localmente un modelo de ~27B orientado a codigo y razonamiento con aceleracion MTP integrada, aunque conviene tener en cuenta que se trata de un merge comunitario sin benchmarks publicados, sin pipeline declarado y con cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Mamba2 + atencion (base Qwen3.8-27B), con cabezas MTP (`nextn`) |
| Parametros totales | ~27B (27.000 millones, segun denominacion del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de `llama-server` usa `-c 65536` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (imatrix calibrada en codigo) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base en bfloat16; safetensors no publicados en este repo) |

## Arquitectura y entrenamiento

El modelo base es una fusion `dare_ties` (con `normalize: true` e `int8_mask: true`, en `bfloat16`) anclada en Qwen/Qwen3.8-27B, que aporta la arquitectura hibrida Mamba2 + atencion y las cabezas de Multi-Token Prediction. Sobre esa base se combinan tres fine-tunes: Jackrong/Qwopus3.8-27B-Coder-Flash (densidad 0.75, peso normalizado 0.60), ukisai/Swift-1.5-Qwen3.8-27b (densidad 0.45, peso 0.25) y bottlecapai/ThinkingCap-Qwen3.8-27B (densidad 0.35, peso 0.15). No se especifican en la informacion disponible el volumen de tokens de entrenamiento de los fine-tunes ni la composicion exacta de sus datasets.

La innovacion tecnica destacable es la preservacion de los 15 tensores MTP (`blk.64.nextn.*`) dentro de los GGUF, lo que habilita decodificacion especulativa nativa (`--spec-type draft-mtp`) en `llama.cpp` sin modelo borrador externo. Las cuantizaciones se generaron con una importance matrix filtrada por dominio de codigo, calibrada sobre 419 chunks (`n_ctx=512`) de codigo con formato ChatML, trazas de tool-use y prompts tecnicos, con perplejidad de calibracion en BF16 de 3.4195 ± 0.02407.

## Capacidades

- Generacion de codigo front-end y full-stack: HTML, CSS, JavaScript y generacion multi-archivo, segun los ejemplos de la model card.
- Razonamiento estructurado con bloques `<think>` (chain-of-thought) heredado de la base Qwen3.8 y del componente ThinkingCap.
- Prevencion de bucles de autocorreccion repetitiva, atribuida al componente Swift-1.5 (RL-distilled).
- Tool calling y function calling: la model card menciona trazas de tool-use en la calibracion de la imatrix y formato ChatML, aunque no detalla un esquema formal de herramientas.
- Decodificacion especulativa nativa mediante MTP integrado en el GGUF.
- Capacidades multilingues: limitadas a ingles segun el campo `language` del repositorio.
- Vision y audio: no disponibles.

## Casos de uso

- Generacion de interfaces web: el modelo puede producir dashboards y componentes HTML/CSS/JS de una sola pasada, aprovechando el peso dominante del componente Qwopus orientado a estetica y arquitectura front-end.
- Asistencia de codigo en IDE o CLI: integrable via `llama-server` con contexto de 65.536 tokens para mantener varios archivos en memoria durante una sesion de refactorizacion.
- Pipelines de generacion de codigo multi-archivo: la preservacion de MTP y la decodificacion especulativa aceleran la generacion de codigo estructurado (40-60 tok/s en Q8_0 segun el autor), lo que lo hace viable para tareas por lotes.
- Razonamiento tecnico con planificacion explicita: los bloques `<think>` permiten auditar el proceso de razonamiento en tareas de diseno de arquitectura o depuracion compleja.
- Despliegue local en estaciones de trabajo con GPU de 24 GB: la cuantizacion Q4_K_M esta pensada como opcion por defecto para consumer GPUs con contexto amplio.
- Prototipado de agentes de codigo: el formato ChatML y las trazas de tool-use en la calibracion sugieren uso en bucles de agente, aunque sin garantias formales de esquema de herramientas.
- Experimentacion con decodificacion especulativa: util como banco de pruebas de MTP en `llama.cpp` sin necesidad de un draft model separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta cifras de throughput de referencia para la cuantizacion Q8_0 con `--spec-type draft-mtp --spec-draft-n-max 5`:

| Escenario | Throughput reportado (Q8_0) |
|---|---|
| Generacion de codigo HTML/estructurado | ~40-60 tokens/s |
| Texto general y razonamiento | ~25-40 tokens/s |

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta en la model card (remite a la pestana de archivos para tamanos); para un modelo de ~27B, Q4_K_M suele situarse en torno a 16-18 GB y Q8_0 en torno a 28-30 GB, aunque estas cifras no las confirma el autor.
- GPU recomendadas: el autor menciona GPUs de 24 GB de VRAM como objetivo para Q4_K_M con contexto amplio; Q8_0 se orienta a GPUs de alta VRAM o Apple Silicon con memoria unificada.
- Cabe en consumer GPU: si, segun el autor, en GPUs de 24 GB con Q4_K_M.
- Opciones de despliegue: `llama.cpp` / `llama-server` (documentado), y por compatibilidad GGUF potencialmente Ollama y otros runners, aunque no se documentan explicitamente.
- Parametros de inferencia recomendados por el autor: `-ngl 99`, `-fa on`, `-c 65536`, `-ctk q8_0 -ctv q8_0`, `--spec-type draft-mtp`, `--spec-draft-n-max 5`, `--draft-p-min 0.1`, `--temp 0.6`, `--top-p 0.95`, `--top-k 20`, `--min-p 0.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mazuj2/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF | ~27B | no disponible (ejemplo con 65.536) | apache-2.0 | GGUF | Merge comunitario con MTP integrado; sin benchmarks publicados |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | no disponible en esta ficha | no disponible | Modelo original con arquitectura hibrida Mamba2 + atencion y cabezas MTP |
| Jackrong/Qwopus3.8-27B-Coder-Flash | ~27B | no disponible | no disponible | no disponible | Fine-tune de codigo, componente principal del merge |
| ukisai/Swift-1.5-Qwen3.8-27b | ~27B | no disponible | no disponible | no disponible | Fine-tune RL-distilled orientado a ejecucion sin bucles |
| bottlecapai/ThinkingCap-Qwen3.8-27B | ~27B | no disponible | no disponible | no disponible | Fine-tune de razonamiento, guardrail del merge |

## Limitaciones y advertencias

- Modelo comunitario sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a la base Qwen3.8-27B ni frente a los fine-tunes originales.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los modelos de ~27B, agravado por la ausencia de evaluaciones publicadas del merge.
- Al ser un merge `dare_ties`, pueden aparecer interferencias entre capacidades de los tres fine-tunes; el autor afirma haber reducido los bucles de autocorreccion, pero no aporta metricas.
- La decodificacion especulativa MTP depende de soporte especifico en `llama.cpp`; otros runners pueden no aprovecharla o ignorar los tensores `nextn`.
- No se documenta el pipeline ni la configuracion de chat template mas alla de ChatML con `<think>`; conviene verificar el template antes de desplegar en produccion.
- Licencia apache-2.0 declarada, lo que permite uso comercial, pero las licencias de los modelos constituyentes (Qwen3.8-27B y los tres fine-tunes) no se detallan en la informacion proporcionada y deberian verificarse.
- El repositorio no incluye pesos en safetensors ni el modelo base fusionado; solo las cuantizaciones GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mazuj2/Qwen3.8-27b-merged-Qwopus-Thinkingcap-Swift1.5-GGUF
- Modelo base fusionado: mazuj2/Qwen3.8-27b-merged-qwopus-thinkingcap-swift1.5 (referenciado en la model card; URL no proporcionada)
- Jackrong/Qwopus3.8-27B-Coder-Flash (componente del merge; URL no proporcionada)
- ukisai/Swift-1.5-Qwen3.8-27b (componente del merge; URL no proporcionada)
- bottlecapai/ThinkingCap-Qwen3.8-27B (componente del merge; URL no proporcionada)
- Qwen/Qwen3.8-27B (modelo base ancla; URL no proporcionada)
- Corpus de calibracion: mahdisml/Uncensored-Imatrix-Calibration-Mixed-Data (URL no proporcionada)
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada.
