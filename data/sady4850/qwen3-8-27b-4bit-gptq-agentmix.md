# sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix

## Resumen

`Qwen3.8-27B-4bit-GPTQ-agentmix` es una cuantizacion de 4 bits del modelo `Qwen/Qwen3.8-27B` publicada por el usuario sady4850 en Hugging Face. El checkpoint conserva exactamente la estructura, formas, dtypes y tamano (15 GB) de la cuantizacion de referencia `mlx-community/Qwen3.8-27B-4bit` (MLX affine 4-bit, group size 64), pero recalibra los tensores de 4 bits mediante GPTQ en lugar de usar redondeo simple (RTN). La diferencia clave respecto a otras cuantizaciones GPTQ del mismo autor es que un tercio del conjunto de calibracion se ha sustituido por trazas reales de agente de codigo generadas por el propio modelo en bf16, lo que desplaza la distribucion calibrada hacia el uso en tareas de agente.

El modelo base es un transformer multimodal de tipo image-text-to-text con 27.356.728.560 parametros totales, orientado a conversacion, razonamiento y uso como agente con tool calling. Esta cuantizacion esta pensada para ejecucion en Apple Silicon mediante MLX (libreria `mlx-vlm` y la aplicacion Splash), no para GPUs NVIDIA. El repo tiene 39 descargas y 0 likes en el momento de la consulta, y se publico el 28 de octubre de 2026.

Su relevancia es metodologica: demuestra que la calibracion dirigida al dominio de destino (trazas de agente) reduce la divergencia respecto al modelo bf16 en tokens de razonamiento y de llamada a herramientas, a costa de un pequeno empeoramiento en texto general. Es un ejemplo practico de cuantizacion consciente del caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen3.8 |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64, calibrado con GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer multimodal que procesa imagen y texto (pipeline `image-text-to-text`), con 27.356 millones de parametros. La model card del checkpoint cuantizado no detalla la arquitectura interna del modelo base (numero de capas, atencion, composicion del dataset de preentrenamiento ni fases de RLHF/DPO), por lo que esos datos no estan disponibles en la informacion proporcionada.

La innovacion de este checkpoint esta en el proceso de cuantizacion. Se recalibraron 497 capas lineales (las 64 capas del modelo, incluida `lm_head`), mientras que el embedding y la torre de vision se heredan del template `mlx-community/Qwen3.8-27B-4bit`. El GPTQ se ajusto al formato affine de MLX: la escala de grupo y el sesgo se derivan de los pesos actualizados por error y se redondean a bf16 antes de codificar. Las matrices Hessianas se obtuvieron del modelo en bf16, una por entrada compartida, con damping de 0.01 y bloques de 128. La calibracion consta de 120 fragmentos de 2048 tokens: 40 de conversaciones de UltraChat train, 40 de texto de `calibration_v5` y 40 de trazas de agente (ventanas de 2048 tokens de trazas Pi en bf16 del propio Qwen3.8-27B, con razonamiento bajo y medio, sobre la mitad de calibracion de las tareas DeepSWE, renderizadas tal como las ve el modelo: system prompt, herramientas, razonamiento, llamadas a herramientas y salida de estas).

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), incluyendo la torre de vision heredada del template.
- Razonamiento explicito en modo thinking (las trazas de calibracion incluyen bloques de razonamiento de nivel bajo, medio y xhigh).
- Tool calling / function calling: el modelo emite llamadas a herramientas estructuradas, y la calibracion se ha orientado especificamente a preservar esta capacidad.
- Uso como agente de codigo en harnesses tipo Pi, con razonamiento multi-paso y ejecucion de herramientas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codigo en local sobre Apple Silicon: el checkpoint esta calibrado con trazas de agente de codigo, por lo que mantiene mejor la distribucion de tokens de razonamiento y de llamada a herramientas que una cuantizacion RTN; se usaria con `mlx-vlm` o Splash en un Mac con memoria unificada suficiente para 15 GB de pesos mas KV cache.
- Automatizacion de tareas de desarrollo en un harness tipo Pi: el modelo puede recibir un system prompt con definiciones de herramientas, razonar y emitir llamadas estructuradas, y procesar la salida de cada herramienta en el siguiente turno.
- Asistente conversacional con contexto largo: al conservar la ventana nativa del modelo base (longitud exacta no disponible), es adecuado para dialogos multi-turno con historial extenso.
- Analisis de imagenes con descripcion textual: la torre de vision se mantiene intacta respecto al template, por lo que puede recibir imagenes junto a instrucciones de texto para tareas de captioning o extraccion de informacion.
- Evaluacion de cuantizaciones en investigacion: sirve como referencia reproducible para estudiar el efecto de la calibracion dirigida al dominio, ya que el autor publica KLD, p99, flips y PPL frente a bf16, RTN y GPTQ estandar.
- Prototipado de pipelines de agente en estaciones de trabajo Mac: permite iterar sobre prompts, herramientas y plantillas de chat sin depender de GPUs dedicadas, con la misma velocidad que el template de 4 bits.

## Benchmarks y rendimiento

Los datos publicados comparan la fidelidad frente al modelo bf16, no el rendimiento en tareas estandar. La evaluacion de agente usa 49 tareas de `kaitchup/DeepSWE1.1-trajectories-Qwen3.8-27B` no incluidas en la calibracion, renderizadas con el system prompt y herramientas de Pi 0.84.2 y la plantilla de chat de Qwen3.8, hasta 24K tokens por tarea: 1,13M tokens y 509 turnos de asistente con llamada a herramienta. KLD se mide sobre la distribucion del siguiente token en tokens de razonamiento (252K filas) y de llamada a herramienta (32K filas).

| Modelo | KLD razonamiento | p99 | KLD tool call | p99 | Misma llamada |
|---|---|---|---|---|---|
| `mlx-community/Qwen3.8-27B-4bit` (RTN) | 0.0387 | 0.315 | 0.0091 | 0.183 | 47,3% |
| `sady4850/Qwen3.8-27B-4bit-GPTQ` (GPTQ) | 0.0260 | 0.216 | 0.0060 | 0.122 | 54,4% |
| Este repo (`-agentmix`) | 0.0176 | 0.147 | 0.0045 | 0.084 | 59,9% |

Frente al GPTQ publicado, con bootstrap pareado sobre las 49 tareas (IC 95%): KLD de razonamiento -32% [-34%, -31%], KLD de tool call -26% [-30%, -21%] y misma llamada +5,5 puntos [+1,4, +9,6]. Como referencia, el bf16 greedy reproduce la llamada registrada en el 30,3% de los turnos (las trazas se muestrearon con temperatura 1.0).

Texto general en torch (A100), 30 fragmentos de 2048 tokens por texto:

| Texto | Modelo | KLD media | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | RTN | 0.0554 | 0.0228 | 0.433 | 9,53% | 6.484 |
| wiki | GPTQ | 0.0367 | 0.0122 | 0.313 | 7,41% | 6.473 |
| wiki | Este repo | 0.0391 | 0.0133 | 0.330 | 7,54% | 6.383 |
| chat | RTN | 0.1817 | 0.0302 | 3.393 | 12,93% | 8.126 |
| chat | GPTQ | 0.0986 | 0.0123 | 1.767 | 8,83% | 8.742 |
| chat | Este repo | 0.1034 | 0.0151 | 1.779 | 9,37% | 8.251 |

Texto general en Splash (`teacher-logits`, KV int8, M1 Pro):

| Texto | Modelo | KLD media | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | RTN | 0.0562 | 0.0221 | 0.469 | 9,58% | 6.479 |
| wiki | GPTQ | 0.0399 | 0.0119 | 0.326 | 7,49% | 6.458 |
| wiki | Este repo | 0.0419 | 0.0131 | 0.359 | 7,74% | 6.371 |
| chat | RTN | 0.1906 | 0.0327 | 2.724 | 13,13% | 8.141 |
| chat | GPTQ | 0.1002 | 0.0128 | 1.576 | 9,05% | 8.706 |
| chat | Este repo | 0.1068 | 0.0156 | 1.453 | 9,54% | 8.195 |

En wiki, este checkpoint esta aproximadamente un 5% mas lejos de bf16 que el GPTQ publicado (el intervalo de confianza de 30 ventanas en Splash incluye 0); en chat ambos son equivalentes dentro del ruido. No se han publicado resultados de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Pesos: 15 GB en formato MLX 4-bit (el repo ocupa 16,1 GB).
- VRAM/memoria unificada estimada: al menos 16-20 GB libres para pesos y overhead, y mas si se usan contextos largos por la KV cache (el autor cita KV cache int8 en sus pruebas).
- Plataforma objetivo: Apple Silicon mediante MLX; el autor ejecuta las pruebas de Splash en un M1 Pro. No esta pensado para GPUs NVIDIA con vLLM, TGI o llama.cpp.
- Cabe en Mac con memoria unificada de 24 GB o superior; en equipos de 16 GB el margen es muy ajustado.
- Despliegue: `mlx-vlm` (`python -m mlx_vlm.generate`) y la aplicacion Splash (sustituyendo el repo id `mlx-community/Qwen3.8-27B-4bit` por este).
- Latencia y throughput: no disponibles; el autor afirma que la velocidad es la misma que la del template de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | KLD razonamiento | Misma llamada | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este repo (`-agentmix`) | 27,36B | MLX 4-bit GPTQ, calibracion mixta | 0.0176 | 59,9% | Apache 2.0 | safetensors MLX |
| `sady4850/Qwen3.8-27B-4bit-GPTQ` | 27,36B | MLX 4-bit GPTQ, calibracion estandar | 0.0260 | 54,4% | Apache 2.0 | safetensors MLX |
| `mlx-community/Qwen3.8-27B-4bit` | 27,36B | MLX 4-bit RTN | 0.0387 | 47,3% | Apache 2.0 | safetensors MLX |
| `Qwen/Qwen3.8-27B` (bf16) | 27,36B | bf16 | referencia | 30,3% (greedy) | Apache 2.0 | safetensors |

El autor publica ademas variantes de calibracion del mismo estudio: `-agentmix-b` (-31% KLD de razonamiento, -29% de tool call, +5,5 puntos de misma llamada, wiki +5%, chat -1%), `-agentmix20` (-24%, -21%, +1,8 puntos, wiki +8%, chat +1%), `-agent` (-41%, -41%, +7,9 puntos, pero wiki y chat +54%) y `-agentw` (-44%, -42%, +7,7 puntos, wiki +48%).

## Limitaciones y advertencias

- Solo funciona con MLX: no es compatible con vLLM, TGI, llama.cpp ni Ollama; el publico objetivo son equipos Apple Silicon.
- La calibracion orientada a agente degrada ligeramente el texto general: en wiki la KLD es un 5-7% peor que el GPTQ estandar, aunque en chat la diferencia esta dentro del ruido.
- Las variantes `-agent` y `-agentw` muestran que priorizar en exceso las trazas de agente dispara la KLD en texto general (+48% a +54%); este checkpoint es un compromiso, no una mejora universal.
- El modelo base puede alucinar y presenta los sesgos de sus datos de entrenamiento; la model card no documenta evaluaciones de sesgo ni de seguridad.
- La longitud de contexto real y los idiomas soportados no se detallan en la informacion disponible; conviene verificar la model card del modelo base antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base `Qwen/Qwen3.8-27B`.
- El checkpoint tiene muy poca adopcion (39 descargas, 0 likes) y una unica fecha de publicacion; no hay validacion independiente de los resultados declarados.
- Las metricas de fidelidad (KLD, flips, misma llamada) no equivalen a rendimiento en tareas; no se han publicado resultados de benchmarks estandar.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ-agentmix
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Template de cuantizacion: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- GPTQ de referencia del mismo autor: https://huggingface.co/sady4850/Qwen3.8-27B-4bit-GPTQ
- Dataset de trazas de agente: https://huggingface.co/datasets/kaitchup/DeepSWE1.1-trajectories-Qwen3.8-27B
- Aplicacion Splash: https://github.com/paperniuk/splash
