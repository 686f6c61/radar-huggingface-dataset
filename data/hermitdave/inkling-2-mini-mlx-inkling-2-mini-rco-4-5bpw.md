# hermitdave/Inkling-2-Mini-MLX-Inkling-2-Mini-RCO-4.5bpw

## Resumen

Inkling-2-Mini es un modelo de lenguaje y vision (VLM) de tipo Mixture-of-Experts (MoE) con arquitectura de transformer con bucles ("looped transformer"), desarrollado por Thinking Machines Lab y publicado bajo licencia Apache 2.0. El checkpoint original contiene 26.4 mil millones de parametros fisicos distribuidos en 24 capas de decodificador, de las cuales las 12 centrales se ejecutan tres veces por token (48 visitas de capa en total), con 128 expertos enrutados y enrutamiento top-8. Incorpora ademas una torre de vision de 23 capas y un borrador MTP DSpark en el checkpoint publicado.

La ficha que nos ocupa no es el modelo original, sino una cuantizacion mixta de precision realizada por hermitdave mediante el pipeline `rco-mlx` (rate-constrained optimisation) sobre Apple Silicon, orientada a la libreria `mlx-lm`. El artefacto resultante ocupa 16.57 GB (4.46 bits por peso en los tensores cuantizados) frente a los 19.53 GB del checkpoint publicado, y mantiene una recuperacion zero-shot media de 0.9906 sobre cinco tareas, con una perplexity en WikiText-2 de 10.6018 frente a 10.5150 del checkpoint nativo NVFP4.

Su relevancia actual es doble: por un lado, demuestra que es posible comprimir un VLM MoE con bucle de 26.4B a poco mas de 16 GB sin perdida practica de calidad; por otro, resuelve el problema de cargar una arquitectura que ninguna version publicada de `mlx-lm` registra, mediante un fichero `inkling2_loop.py` autocontenido y `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y Mixture-of-Experts; 24 capas fisicas, las 12 centrales repetidas 3 veces (48 visitas de capa por token) |
| Parametros totales | 26.4 mil millones (modelo base) |
| Parametros activos | 128 expertos enrutados con enrutamiento top-8 (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin mixta 3/4/6/8 bits; 4.46 bits por peso en los tensores cuantizados; 224 tensores cuantizados (8-bit x 118, 6-bit x 58, 4-bit x 44, 3-bit x 4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con fichero `inkling2_loop.py` para carga via `mlx-lm` |
| Tamano del artefacto | 16.57 GB (checkpoint publicado: 19.53 GB) |
| Vision tower | 23 capas, mantenida en BF16 |
| Borrador MTP | DSpark, 636 MB, no incluido en este repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucles: 24 capas fisicas de decodificador en las que las 12 centrales se ejecutan tres veces por token, lo que da 48 visitas de capa por token. La componente MoE consta de 128 expertos enrutados con enrutamiento top-8. El checkpoint publicado incluye ademas una torre de vision de 23 capas (lo que lo convierte en un VLM) y un borrador MTP DSpark que lee estados ocultos en las visitas de bucle 5, 23, 41 y 48. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas por Thinking Machines Lab.

La cuantizacion RCO parte de un problema estructural: no existe una release BF16 de Inkling-2-Mini. El checkpoint publicado almacena los expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), de modo que el pipeline de hermitdave primero desconvierte a BF16 con las formulas de reconstruccion exacta respecto al checkpoint distribuido (aunque con el redondeo NVFP4 ya incorporado) y despues aplica cuantizacion afin mixta. La asignacion resultante es: expertos enrutados en 4 bits (44 tensores) y 3 bits (4 tensores); proyecciones de atencion y `weight_proj` de atencion completa en 6 bits (58 tensores) y 8 bits (118 tensores); y en BF16 sin tocar `embed_tokens`, `lm_head`, todas las RMSNorm, el router MoE, las consultas de residuo de atencion y mensajes de bucle, los kernels `conv1d` depthwise, la tabla de logits relativos, las puertas de mensaje de rango 64 y la torre de vision completa. La innovacion practica del artefacto es el fichero `inkling2_loop.py`, una implementacion monofichero de la arquitectura con los cuatro internals de `mlx-lm` que necesita (`layers.common.splice`, `layers.distributed`, `layers.moe.SwitchLinear`, `muse_spark.model.shard_experts_inplace`) inlinados, que se activa mediante `"model_file"` en `config.json`.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Inkling-2-Mini.
- Procesamiento de vision: el checkpoint incluye una torre de vision de 23 capas, mantenida intacta en BF16 en esta cuantizacion.
- Razonamiento multi-paso mediante las 48 visitas de capa por token del bucle, que incrementan la profundidad efectiva del calculo.
- Capacidad de borrador especulativo MTP (DSpark) en el modelo base, aunque no utilizable en este artefacto por falta de cabeza MTP en el runtime.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito ("thinking mode"): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el artefacto esta disenado para `mlx-lm` sobre chips M-series; con 16.87 GB de RAM pico cabe en un M3 Max de 64 GB y permite ejecutar un VLM MoE de 26.4B en un portatil sin GPU dedicada.
- Prototipado de aplicaciones multimodales en local: al conservar la torre de vision en BF16, se puede usar para tareas de descripcion de imagenes, respuesta a preguntas visuales y extraccion de informacion de documentos sin enviar datos a la nube.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia reproducible para medir el impacto de la cuantizacion mixta RCO frente al checkpoint NVFP4 nativo, con metricas de perplexity, KL, top-1 y recuperacion zero-shot ya publicadas.
- Razonamiento de contexto medio en estaciones de trabajo: con 30.9 tok/s de decodificacion y 309 tok/s de prompt en un M3 Max, es viable para asistentes interactivos y generacion de texto en lote de tamano moderado.
- Desarrollo y pruebas de arquitecturas con bucle: el fichero `inkling2_loop.py` autocontenido permite estudiar y modificar la implementacion del transformer con bucles sin depender de una release oficial de `mlx-lm`.
- Despliegue de bajo consumo en entornos con restricciones de memoria: los 16.57 GB del artefacto, frente a los 19.53 GB del original, reducen el requisito de RAM en aproximadamente 3 GB, lo que facilita su ejecucion en equipos con 32 GB o 24 GB de memoria unificada.
- Investigacion sobre cuantizacion de MoE con expertos pre-cuantizados: el caso de Inkling-2-Mini (expertos en NVFP4/MXFP8 sin release BF16) es un ejemplo documentado de las limitaciones de reconstruir pesos float a partir de checkpoints ya cuantizados.

## Benchmarks y rendimiento

Metricas medidas en un M3 Max de 64 GB. La perplexity, KL y top-1 usan 8 filas de WikiText-2 de 256 tokens, con el checkpoint nativo NVFP4 como referencia (PPL 10.5150). El zero-shot son 5 tareas con 400 muestras cada una; la recuperacion es `quant_acc / reference_acc`.

| Metrica | Valor |
|---|---|
| Perplexity (WikiText-2, 8x256) | 10.6018 (nativo NVFP4: 10.5150; delta +0.09) |
| KL respecto al checkpoint NVFP4 nativo | 0.0249 |
| Acuerdo top-1 respecto al nativo | 92.99 % |
| Recuperacion zero-shot media (5 tareas, n=400) | 0.9906 (TASK-LOSSLESS) |
| arc_challenge | 0.996 |
| arc_easy | 1.000 |
| hellaswag | 0.995 |
| winogrande | 0.966 |
| mmlu | 0.996 |
| Decodificacion (tok/s, `mlx_lm`, 128 tok) | 30.9 (nativo NVFP4: 28.6) |
| Prompt (tok/s) | 309 (nativo: 264) |
| RAM pico | 16.87 GB (nativo: 19.82 GB) |

No se han publicado resultados de benchmarks estandar (MMLU absoluto, HumanEval, GSM8K) en la informacion disponible; las cifras de mmlu y el resto de tareas son de recuperacion relativa, no absolutas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 16.87 GB de pico medidos en un M3 Max de 64 GB; el artefacto en disco ocupa 16.57 GB.
- GPU recomendadas: Apple Silicon (M-series) con `mlx-lm`; las medidas se tomaron en un M3 Max de 64 GB. No se dispone de datos para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con al menos 24-32 GB de memoria unificada, segun la estimacion de RAM pico; no hay datos verificados para GPUs de consumo NVIDIA.
- Opciones de despliegue: `mlx-lm` 0.32.2 (probado con exito) y el `mlx-lm` incluido en oMLX (`0.32.3.dev8`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MLX y la arquitectura requiere `trust_remote_code=True`.
- Latencia y throughput: 30.9 tok/s de decodificacion y 309 tok/s de prompt en M3 Max de 64 GB; el artefacto supera ligeramente al checkpoint NVFP4 nativo en ambas metricas (28.6 y 264 tok/s respectivamente).
- Carga: requiere `trust_remote_code=True`; el fichero `inkling2_loop.py` es bit-identico al build del paquete en el mismo runtime (diferencia maxima de logits 0.0) y el argmax coincide en el 100 % de posiciones entre runtimes (delta medio de logits 0.09).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini MLX RCO 4.5bpw (este) | 26.4B (MoE, top-8) | no disponible | Afin mixta 3/4/6/8 bits | 16.57 GB | Apache 2.0 | Hugging Face, `mlx-lm` con `trust_remote_code` |
| Inkling-2-Mini (checkpoint publicado) | 26.4B (MoE, top-8) | no disponible | NVFP4 (capas 0-19) + MXFP8 (capas 20-23) | 19.53 GB | Apache 2.0 | Hugging Face |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La reconstruccion a BF16 de los expertos no recupera los pesos originales: el redondeo NVFP4 ya esta incorporado en el checkpoint publicado, por lo que en las 20 capas NVFP4 el resultado puede igualar pero no superar al nativo.
- No existe una release BF16 oficial de Inkling-2-Mini, lo que limita cualquier comparacion contra los pesos de entrenamiento originales.
- El borrador MTP DSpark (636 MB, BF16) no esta incluido; el runtime de este artefacto no implementa la cabeza MTP, por lo que no se puede usar decodificacion especulativa.
- La carga exige `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio; conviene auditar `inkling2_loop.py` antes de usarlo en produccion.
- La implementacion depende de PRs de `mlx-lm` aun no fusionados (#2086 y #2061); hasta que una release los incluya, el artefacto solo es cargable mediante el `model_file` incluido.
- El artefacto esta orientado exclusivamente a `mlx-lm` y Apple Silicon; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- El fichero `inkling2_loop.py` se genera con `rco-mlx/scripts/build_standalone_inkling2.py` y no debe editarse a mano.
- No hay informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de datos sobre el entrenamiento y la alineacion del modelo base dificulta evaluar riesgos en produccion.
- Las metricas de recuperacion zero-shot son relativas al checkpoint NVFP4 nativo, no absolutas; no deben interpretarse como rendimiento bruto del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/Inkling-2-Mini-MLX-Inkling-2-Mini-RCO-4.5bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pipeline de cuantizacion: https://github.com/hermitdave/rco-mlx
- Thinking Machines Lab: https://thinkingmachines.ai
- PR de `mlx-lm` para el Mini con bucle: https://github.com/ml-explore/mlx-lm/pull/2086
- PR de `mlx-lm` relacionado: https://github.com/ml-explore/mlx-lm/pull/2061
