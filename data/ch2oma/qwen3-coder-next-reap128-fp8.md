# ch2oma/qwen3-coder-next-reap128-fp8

## Resumen

Qwen3-Coder-Next REAP-128 es un checkpoint derivado del modelo Qwen3-Coder-Next (80B-A3B) de Alibaba Qwen, podado mediante la tecnica REAP (Router-weighted Expert Activation Pruning) desarrollada por Cerebras Research. El autor, ch2oma, ha reducido los 512 expertos enrutados por capa del modelo original a solo 128, eliminando el 75% de los expertos y dejando el modelo en aproximadamente 21.650 millones de parametros totales con unos 3.000 millones activos por token (top-10 routing). Se trata de un modelo MoE especializado en generacion de codigo.

La relevancia de esta ficha radica en que ejemplifica una linea de trabajo practica: comprimir modelos MoE de gran tamano para que quepan en hardware de consumo. El objetivo declarado del autor es producir un GGUF de clase 6 GB (IQ2_XXS) ejecutable en una iGPU Intel Iris Xe o en un portatil con 16 GB de RAM. El checkpoint publicado es el resultado crudo de la poda, sin la fase de healing (destilacion de logits desde el profesor de 80B) todavia aplicada, por lo que el autor advierte explicitamente de que la calidad es inferior a la del modelo padre.

El modelo conserva la arquitectura Qwen3-Next con capas de atencion, DeltaNet y expertos compartidos intactos; solo se han podado los expertos enrutados y recortado las filas del router. Los pesos permanecen en formato block-FP8 (128x128) con escalas `weight_scale_inv`, y el `config.json` solo modifica `num_experts` a 128. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion, DeltaNet y expertos compartidos (Qwen3-Next), podado con REAP |
| Parametros totales | 21.654.584.064 (~21,65B) |
| Parametros activos | ~3B (top-10 routing) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | block-FP8 (128x128) nativo; GGUF (incluye IQ2_XXS con imatrix); conversion a bf16 por dequantizacion |
| Idiomas soportados | no disponible (modelo orientado a codigo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8 block-wise) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Coder-Next, un MoE de 80B parametros totales con 3B activos y 512 expertos por capa. La poda REAP calcula una saliencia por experto definida como la media, sobre los tokens enrutados a ese experto, del producto entre el peso de router renormalizado top-k y la norma L2 de la salida del experto. Con esa metrica se conservan los 128 expertos mas salientes por capa, se remapean los indices y se recortan las filas correspondientes de `mlp.gate`. Las capas de atencion, DeltaNet, expertos compartidos, embeddings y `lm_head` no se tocan.

La calibracion se realizo sobre 1.024 ventanas de 2.048 tokens (2,1 millones de tokens en total) de codigo escrito por el profesor, procedente del dataset companion `ch2oma/qwen3-coder-next-kd-top20`, construido a partir de prompts de Magicoder-OSS y evol-codealpaca y decontaminado frente a HumanEval y MBPP. No se ha aplicado todavia destilacion de logits ni abliteration; ambas figuran en la hoja de ruta del autor. Los indices de expertos conservados se publican en `reap_keep.json`.

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada del modelo base Qwen3-Coder-Next, aunque degradada por la poda y la ausencia de healing.
- Razonamiento sobre problemas de programacion y generacion de scripts autocontenidos (formato evaluado en EvalPlus).
- Capacidad de conversacion multi-turno (tag `conversational`).
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible para este checkpoint podado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles; el modelo esta orientado a codigo.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en portatiles de gama media: con la cuantizacion IQ2_XXS (~6 GB) el modelo puede ejecutarse en una iGPU Intel Iris Xe o en un equipo con 16 GB de RAM, permitiendo autocompletado y generacion de funciones sin conexion a la nube.
- Generacion de scripts de automatizacion: el modelo produce scripts Python autocontenidos, como demuestra la evaluacion con el prompt de EvalPlus, adecuado para tareas de scripting y utilidades.
- Prototipado rapido en entornos con recursos limitados: al ocupar poco espacio en disco y memoria, sirve para experimentar con un MoE de codigo en maquinas sin GPU dedicada de gran VRAM.
- Educacion y aprendizaje de programacion: puede explicar y generar soluciones a problemas de nivel basico-intermedio (HumanEval, MBPP), util en entornos docentes con hardware modesto.
- Base para experimentos de compresion de MoE: el checkpoint y su `reap_keep.json` sirven como punto de partida para investigar tecnicas de poda, destilacion y cuantizacion sobre modelos Qwen3-Next.
- Evaluacion comparativa de metodos de poda: permite medir el impacto de REAP frente a otras tecnicas sobre un modelo de codigo de referencia, dado que el autor publica resultados antes y despues del healing.
- Despliegue en pipelines de CI/CD para generacion de tests o parches: viable solo tras validar la calidad en el dominio concreto, dado que el checkpoint crudo rinde por debajo del padre.

## Benchmarks y rendimiento

Resultados publicados por el autor con EvalPlus (greedy, maximo 1.536 tokens nuevos, prompt estandar de script Python autocontenido):

| Modelo | HumanEval | HumanEval+ | MBPP | MBPP+ |
|---|---|---|---|---|
| Qwen3-Coder-Next 80B FP8 (padre) | 92,7 | 87,2 | 91,8 | 76,7 |
| Este modelo, IQ2_XXS (imatrix), ~6 GB, antes de healing | 82,3 | 78,0 | 78,8 | 63,2 |

Los GGUF se cuantizaron con una importance matrix calculada sobre 300 x 512 tokens de codigo del profesor (`gguf/imatrix128.dat`) y se evaluaron con llama.cpp en GPU.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 completo ocupa unos 28,6 GB en el repositorio; la version IQ2_XXS ronda los 6 GB. Para cargar el FP8 en transformers se necesita una GPU con soporte FP8 (Hopper o Ada).
- GPU recomendadas: el autor realizo la saliencia en una H200; para inferencia FP8 se requieren GPUs Hopper (H100/H200) o Ada. La version GGUF IQ2_XXS esta pensada para iGPU Intel Iris Xe o equipos con 16 GB de RAM.
- Consumer GPU: si, en formato GGUF cuantizado (IQ2_XXS) cabe en equipos de 16 GB; el FP8 completo no cabe en GPUs de consumo tipicas.
- Opciones de despliegue: transformers (requiere soporte FP8), vLLM y llama.cpp. La conversion a bf16 se hace dequantizando por bloques: `W_bf16 = W_fp8.float() * repeat(weight_scale_inv, 128, 128)`, o directamente a GGUF con llama.cpp reciente (`--outtype bf16`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | HumanEval | Licencia |
|---|---|---|---|---|---|
| Qwen3-Coder-Next 80B FP8 (padre) | 80B | ~3B | no disponible | 92,7 | Apache-2.0 |
| Este modelo (REAP-128, IQ2_XXS) | ~21,65B | ~3B | no disponible | 82,3 | Apache-2.0 |
| Qwen2.5-Coder | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con Qwen2.5-Coder figura en la hoja de ruta del autor pero aun no se ha publicado. No se dispone de datos de contexto ni de benchmarks adicionales de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint crudo sin healing: el autor advierte de que la calidad es inferior a la del modelo padre hasta completar la destilacion de logits; los benchmarks reflejan una caida de unos 10 puntos en HumanEval y mas de 13 en MBPP+.
- Perdida de expertos: la poda elimina el 75% de los expertos enrutados, lo que puede degradar el rendimiento en dominios poco representados en los datos de calibracion (codigo).
- Calibracion limitada: la saliencia se calculo sobre 2,1 millones de tokens de codigo, por lo que el sesgo hacia ese dominio es notable.
- Riesgo de alucinacion: no evaluado en la informacion disponible; previsible en generacion de codigo fuera de distribucion.
- Idiomas: no se documentan capacidades multilingues; el modelo esta orientado a codigo.
- Contexto: la longitud de contexto soportada no se especifica en la informacion disponible.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la calidad degradada del checkpoint crudo desaconseja su uso en produccion sin validacion previa.
- Cuantizacion agresiva: IQ2_XXS introduce perdida adicional de precision frente al FP8 original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ch2oma/qwen3-coder-next-reap128-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Dataset de destilacion: https://huggingface.co/datasets/ch2oma/qwen3-coder-next-kd-top20
- Paper REAP (Cerebras Research): no disponible como enlace directo en la informacion proporcionada.
