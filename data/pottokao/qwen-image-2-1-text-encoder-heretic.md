# pottokao/Qwen-Image-2.1-Text-Encoder-Heretic

## Resumen

Qwen-Image-2.1 Text Encoder — Heretic es una derivada comunitaria del codificador de texto que utiliza Qwen-Image-2.1, es decir, de `Qwen/Qwen3-VL-8B-Instruct`. Lo publica el usuario pottokao y su unica modificacion consiste en eliminar el comportamiento de rechazo (refusal) mediante ablacion direccional con la herramienta Heretic, orientada a las proyecciones `o_proj` y `down_proj`. El resultado es un reemplazo directo (drop-in) del codificador original: mismos tensores, mismas formas, mismo recuento de parametros (8.767.123.696) y mismos pesos en bf16, sin ningun otro cambio en la arquitectura.

El modelo resuelve un problema muy concreto en flujos de generacion y edicion de imagen: cuando el codificador de texto de un pipeline de difusion rechaza una peticion, la generacion se degrada o falla sin que el DiT ni el VAE tengan nada que ver. Al reducir la tasa de rechazo de 100/100 a 5/100 con una divergencia KL de 0,0220 sobre entradas benignas, el modelo permite que el condicionamiento textual llegue intacto al generador. Es relevante ahora porque Qwen-Image-2.1 y su decodificador especulativo de texto exigen un checkpoint cargable en `transformers`, `diffusers` o vLLM, y porque el autor documenta de forma reproducible el presupuesto de busqueda necesario para abliterar un modelo de este tamano.

Tecnicamente es un transformer multimodal de tipo Qwen3-VL con torre de vision y modelo de lenguaje denso de 8B, distribuido en 4 shards safetensors (17,5 GB de repositorio) bajo licencia Apache-2.0. No esta afiliado ni respaldado por Alibaba ni por Qwen; es una derivada de comunidad que conserva la torre de vision, requisito imprescindible para las funciones de edicion de imagen de Qwen-Image-2.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (torre de vision + modelo de lenguaje denso); se carga con `Qwen3VLForConditionalGeneration` |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en este repositorio; el autor publica derivadas separadas en NVFP4, W4A8 y GGUF (Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (redistribucion permitida al derivar de un modelo Apache-2.0) |
| Formato de pesos | safetensors, bf16, 4 shards; repositorio de 17,5 GB |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo: el modelo parte de los pesos de `Qwen/Qwen3-VL-8B-Instruct` y aplica ablacion direccional (directional ablation) con Heretic sobre las proyecciones `o_proj` y `down_proj`, que son las que la herramienta usa por defecto para esta arquitectura. La ablacion no reentrena el modelo; modifica direcciones del espacio de activaciones para suprimir la direccion asociada al rechazo. Solo se modifica el codificador de texto: el DiT y el VAE de Qwen-Image-2.1 permanecen intactos.

El autor documenta un resultado metodologico relevante: el presupuesto de busqueda importa. Con los valores por defecto de Heretic (`n_trials = 200`, `n_startup_trials = 60`) se obtuvo 5/100 rechazos con KL 0,0220, mientras que una primera ejecucion con 100/20 se quedo en 9/100 con KL 0,0338. Duplicar el presupuesto casi redujo a la mitad la tasa de rechazo y recorto un tercio la divergencia KL. La version publicada corresponde al punto de rodilla (knee point) del frente de Pareto, no al extremo: el indice 0 del frente baja a 4/100 rechazos pero dispara la KL a 0,0859 (3,9 veces mas), y el indice 2 baja la KL a 0,0165 a costa de 28/100 rechazos (23 puntos porcentuales mas).

La reproduccion se realizo sobre 2x RTX 5070 Ti (16 GB cada una) con `--max-memory '{"0":"14GiB","1":"14GiB"}'`, `--offload-outputs-to-cpu`, `--max-batch-size 32` y una duracion de aproximadamente 48 minutos para 200 trials (~14,5 s por trial), fijando el commit `3521f8648a0dccf6e12a92666862632235fac7e6` de Heretic (que reporta `v2.0.0.dev0`; el paquete de PyPI `heretic-llm==1.4.0` es anterior y no acepta `--trial-index`, `--model-action` ni `--save-directory`).

## Capacidades

- Codificacion de texto para generacion y edicion de imagen: es el componente que transforma el prompt en condicionamiento para el DiT de Qwen-Image-2.1, manteniendo la torre de vision que la version 2.1 necesita para tareas de edicion.
- Comprension multimodal de imagen: al conservar la torre de vision, el checkpoint mantiene la capacidad de procesar entradas visuales ademas de texto.
- Generacion de texto e instrucciones: hereda el comportamiento de `Qwen3-VL-8B-Instruct` en tareas de seguimiento de instrucciones y respuesta a preguntas; el autor verifico 4/4 respuestas correctas y coherentes en preguntas benignas (por ejemplo, "What is the capital of France?").
- Supresion del rechazo: 5/100 rechazos medidos con Heretic sobre `mlabonne/harmful_behaviors` (test split) y 0/20 en una verificacion independiente con otro script y otro conjunto de palabras clave, sobre prompts daninos reservados.
- Compatibilidad con el ecosistema de difusion: pensado para `transformers`, `diffusers`, vLLM y como base para cuantizaciones propias.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no documentadas en la informacion disponible.

## Casos de uso

- Condicionamiento de texto en pipelines de Qwen-Image-2.1: sustituye al codificador original en `transformers` o `diffusers` sin cambiar formas ni recuento de parametros, de modo que los scripts existentes siguen funcionando y solo se evita que el codificador bloquee el prompt antes de llegar al DiT.
- Investigacion en alineacion y seguridad: sirve como caso de estudio reproducible de ablacion direccional, con frente de Pareto, tasa de rechazo, divergencia KL y presupuesto de busqueda documentados, para comparar metodologias de abliteracion sobre modelos de 8B.
- Red-teaming de sistemas de generacion de imagen: permite evaluar como se comporta un pipeline completo cuando se retira el filtro del codificador de texto, aislando el comportamiento del DiT y del VAE del comportamiento del encoder.
- Punto de partida para cuantizacion propia: el autor lo publica explicitamente como base para generar nuevas cuantizaciones; el round-trip NVFP4 se comporta igual que al cuantizar el modelo original.
- Fine-tuning posterior: al distribuirse en bf16 con las mismas formas que el modelo base, es utilizable como inicializacion para ajustes especificos de dominio sobre el codificador de texto.
- Uso en ComfyUI mediante las derivadas cuantizadas: para flujos de generacion y edicion de imagen en ComfyUI se deben usar `qwen3vl_8b_nvfp4_heretic.safetensors`, `qwen3vl_8b_w4a8_heretic.safetensors` o `qwen3vl_8b_heretic-Q4_K_M.gguf` segun el loader, no los shards de este repositorio.
- Analisis de imagen con un VLM sin rechazo: en tareas de descripcion, extraccion de informacion o etiquetado sobre imagenes donde el modelo Instruct original declinaria responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos publicados son las metricas de ablacion del propio autor:

| Metrica | Modelo original | Este modelo | Conjunto de evaluacion |
|---|---|---|---|
| Rechazos (Heretic) | 100/100 | 5/100 | `mlabonne/harmful_behaviors` (test split) |
| Divergencia KL | 0 (por definicion) | 0,0220 | `mlabonne/harmless_alpaca` |
| Rechazos (verificacion independiente) | no disponible | 0/20 | prompts daninos reservados, script y palabras clave distintos |
| Preguntas benignas | no disponible | 4/4 correctas y coherentes | verificacion manual |

Presupuesto de busqueda y frente de Pareto, segun los datos del autor:

| Configuracion | Trials / startup | Mejor resultado equilibrado |
|---|---|---|
| v1 | 100 / 20 | 9/100 rechazos con KL 0,0338 |
| v2 (publicada) | 200 / 60 | 5/100 rechazos con KL 0,0220 |

| Indice del frente | Rechazos | KL | Nota |
|---|---:|---:|---|
| 0 | 4/100 | 0,0859 | un rechazo menos cuesta 3,9 veces mas KL |
| 1 (publicado) | 5/100 | 0,0220 | punto de rodilla |
| 2 | 28/100 | 0,0165 | 0,0055 menos de KL cuesta 23 puntos porcentuales mas de rechazos |

## Requisitos de hardware

- Inferencia en bf16: el repositorio ocupa 17,5 GB, por lo que se necesita un poco mas de esa cifra solo para los pesos; con cache KV y activaciones conviene disponer de 24 GB de VRAM o repartir el modelo entre varias GPU.
- Configuracion validada por el autor: 2x RTX 5070 Ti de 16 GB, con `--max-memory '{"0":"14GiB","1":"14GiB"}'` y descarga de salidas a CPU, suficientes para ejecutar la ablacion sobre el modelo completo.
- Cabe en GPU de consumo: si, en una GPU de 24 GB (RTX 3090, 4090) en bf16, o en GPU de 16 GB usando las derivadas cuantizadas NVFP4, W4A8 o GGUF Q4_K_M.
- GPU de datacenter: A100 40/80 GB, H100 o L40S para despliegues de mayor concurrencia o para mantener bf16 sin repartir el modelo.
- Opciones de despliegue: `transformers` (`Qwen3VLForConditionalGeneration.from_pretrained`), `diffusers` y vLLM para este repositorio; en ComfyUI hay que usar las derivadas cuantizadas, con `CLIPLoader` (tipo `qwen_image`) para NVFP4 y W4A8, o `CLIPLoaderGGUF` del nodo ComfyUI-GGUF para el GGUF mas el `mmproj` en f16. No se debe apuntar ComfyUI a los shards de este repositorio.
- Version minima de ComfyUI: se necesita una version que conozca `QwenImage21`; la 0.34.2 no lo soporta y la 0.36.0 si. Si `TextEncodeQwenImage21` no aparece en la lista de nodos, es por este motivo.
- Latencia y throughput de inferencia: no disponibles. El unico dato de coste computacional publicado es el de la ablacion: aproximadamente 48 minutos para 200 trials (~14,5 s por trial) en 2x RTX 5070 Ti, que no es una medida de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic | 8.767.123.696 | no disponible | 5/100 (KL 0,0220) | Apache-2.0 | safetensors bf16, 4 shards, 17,5 GB |
| Qwen/Qwen3-VL-8B-Instruct (base y codificador original) | 8B | no disponible | 100/100 (medido por el autor) | Apache-2.0 | safetensors en HuggingFace |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4 | no disponible | no disponible | mismo checkpoint, cuantizado | Apache-2.0 | `qwen3vl_8b_nvfp4_heretic.safetensors` |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8 | no disponible | no disponible | mismo checkpoint, cuantizado | Apache-2.0 | `qwen3vl_8b_w4a8_heretic.safetensors` |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF | no disponible | no disponible | mismo checkpoint, cuantizado | Apache-2.0 | `qwen3vl_8b_heretic-Q4_K_M.gguf` + `mmproj-…-f16.gguf` |

Todas las alternativas comparten el mismo recuento de parametros y las mismas formas, ya que son cuantizaciones o el propio modelo base. Otros modelos comparables de la misma categoria (codificadores de texto de 8B para pipelines de difusion, o derivadas abliteradas de Qwen3-VL) no estan documentados en la informacion disponible.

## Limitaciones y advertencias

- La eliminacion del rechazo es deliberada y completa por diseno: el modelo responde a peticiones que el original declinaba. No debe desplegarse en produccion orientada al publico sin salvaguardas externas (filtros de entrada o de salida, moderacion, listas de bloqueo).
- La ablacion solo se aplica a `o_proj` y `down_proj`, pero afecta a la distribucion global de salidas (KL 0,0220 sobre entradas benignas). Es un desplazamiento pequeno, aunque no nulo, y la verificacion de capacidades generales se limita a 4/4 preguntas benignas, una muestra demasiado pequena para garantizar ausencia de regresiones.
- Las metricas de rechazo se miden con conjuntos de evaluacion concretos (`mlabonne/harmful_behaviors` para rechazos, `mlabonne/harmless_alpaca` para KL). Una tasa de 0/20 en la verificacion independiente no es extrapolable a una ausencia total de rechazo en dominios no evaluados.
- Los shards de este repositorio no cargan en ComfyUI: el repack de Comfy-Org elimina el prefijo `model.language_model.` (`model.language_model.layers.N.…` pasa a `model.layers.N.…`). Los pesos cuantizados directamente desde este layout de HuggingFace no cargaran hasta que se reasignen las claves.
- Se requiere una version de ComfyUI igual o superior a la 0.36.0 para disponer de los nodos de QwenImage21.
- El round-trip de cuantizacion (por ejemplo NVFP4) se comporta igual que con el modelo original: la cuantizacion introduce su propio error, que se suma al de la ablacion.
- Este modelo no esta afiliado a Alibaba ni a Qwen, ni cuenta con su respaldo; es una derivada de comunidad. La licencia Apache-2.0 permite uso comercial, siempre que se respeten las obligaciones de atribucion del `LICENSE` y el `NOTICE` del repositorio.
- La longitud de contexto, los idiomas soportados y el soporte de tool calling o agentes no estan documentados en la informacion disponible, por lo que no pueden darse por garantizados en produccion.
- Al tratarse de una ablacion sobre el codificador de texto de un pipeline de imagen, cualquier cambio de comportamiento se propaga a todo el pipeline: el DiT y el VAE no se han tocado y no compensan el efecto de la ablacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Derivada NVFP4: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4
- Derivada W4A8: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8
- Derivada GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Commit fijado de Heretic usado en la reproduccion: https://github.com/p-e-w/heretic/commit/3521f8648a0dccf6e12a92666862632235fac7e6
- Conjunto de evaluacion de comportamientos daninos: `mlabonne/harmful_behaviors` (test split)
- Conjunto de evaluacion de entradas benignas: `mlabonne/harmless_alpaca`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados corresponden al servicio de pasaportes de Irlanda y no guardan relacion con el contenido de esta ficha.
