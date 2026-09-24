# 0Endzz/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8

## Resumen

Qwen-Image-2.1-Text-Encoder-Heretic-W4A8 es una build cuantizada en safetensors del codificador de texto que emplea el pipeline generativo Qwen-Image-2.1. El repositorio lo publica el usuario 0Endzz y deriva de pottokao/Qwen-Image-2.1-Text-Encoder-Heretic, que a su vez es una version "abliterated" (con la conducta de rechazo suprimida) de Qwen/Qwen3-VL-8B-Instruct, el modelo que Qwen usa sin modificar como codificador de texto en Qwen-Image-2.1. Al estar el modelo original bajo Apache-2.0, el derivado se redistribuye con la misma licencia.

El problema que resuelve es de despliegue: el codificador en bf16 ocupa 16,33 GB y este empaquetado lo reduce a un unico archivo de 5,88 GB (repo de 6,3 GB), aplicando una receta W4A8 asimetrica (pesos de 4 bits, activaciones de 8 bits) con rotacion convolucional y codebook de Lloyd-Max, la misma que distribuye Comfy-Org. La torre de vision, las normas y los sesgos se mantienen en bf16, y `embed_tokens` y `lm_head` quedan en INT8 por canal.

Su relevancia es acotada pero concreta: permite ejecutar el text encoder de Qwen-Image-2.1 en GPUs CUDA con poca VRAM y cargarlo en el `CLIPLoader` estandar de ComfyUI, sin depender de pesos GGUF. El repositorio no registra descargas ni likes en el momento de la consulta, y la model card reproduce integramente la documentacion del build de pottokao, con el que comparte nombre de archivo (`qwen3vl_8b_w4a8_heretic.safetensors`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3-VL), empleado como codificador de texto; incluye torre de vision en bf16 |
| Parametros totales | Aproximadamente 8.000 millones (derivado de Qwen/Qwen3-VL-8B-Instruct; la model card no desglosa el total exacto) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A8 asimetrica: 4 bits en 252 proyecciones FFN y de atencion, INT8 por canal mas rotacion convolucional en `embed_tokens` y `lm_head`, bf16 en torre de vision, normas y sesgos; codebook de Lloyd-Max. Reparto: 79,2 % de parametros a 4 bits, 14,2 % a 8 bits, 6,6 % en bf16 |
| Idiomas soportados | No disponible (no se declara en la informacion proporcionada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`qwen3vl_8b_w4a8_heretic.safetensors`, 5,88 GB); tensores `int8` empaquetados `[N, K/2]`, escalas `weight_s_rel` en float8_e4m3fn, escalas por canal `weight_s_channel` en float32, codebook y metadatos `comfy_quant` en uint8 con JSON por capa |

## Arquitectura y entrenamiento

No hay entrenamiento desde cero: es una operacion de ablacion direccional mas cuantizacion sobre pesos ya existentes. La ablacion se aplico con la herramienta Heretic sobre las proyecciones `o_proj` y `down_proj`, con 200 ensayos y 60 ensayos de arranque, seleccionando el punto de rodilla del frente de Pareto. El resultado declarado es de 5 rechazos sobre 100 en `mlabonne/harmful_behaviors` frente a 100/100 del codificador original, con una divergencia KL de 0,0220 medida sobre `mlabonne/harmless_alpaca`. Una verificacion independiente sobre la fuente bf16 reporta 0/20 rechazos y 4/4 preguntas benignas respondidas correctamente.

La parte de cuantizacion reproduce byte a byte la receta de Comfy-Org: al comparar la build stock (no ablacionada) tensor por tensor contra `qwen3vl_8b_w4a8.safetensors` de Comfy-Org, la ruta principal de 4 bits, `weight_s_rel`, `weight_s_channel`, `weight_codebook` y la torre de vision resultan identicas; solo las dos capas INT8 difieren en el ultimo bit por una version distinta de `comfy_kitchen`, diferencia irrelevante porque `lm_head` no se usa cuando el modelo actua como codificador de texto. La model card argumenta que la ablacion direccional es una edicion de rango 1 y no genera valores atipicos, de modo que el error de cuantizacion no se degrada respecto al modelo original: 9,52 % de error relativo en capas ablacionadas, 9,51 % en capas intactas y 9,44 % en el codificador stock, medido como error de ida y vuelta en NVFP4.

## Capacidades

- Codificacion de prompts de texto para el pipeline de generacion de imagen Qwen-Image-2.1, integrada mediante el nodo `TextEncodeQwenImage21`.
- Carga directa en ComfyUI con el nodo `CLIPLoader` y tipo `qwen_image`, en builds que incluyan soporte de `QwenImage21` (fusionado despues del 14 de septiembre de 2026).
- Conservacion de la torre de vision en bf16 (351 tensores), lo que mantiene la estructura multimodal del modelo base aunque el uso previsto sea como codificador de texto.
- Generacion de imagenes de alta calidad mediante el modelo completo no destilado de Qwen-Image-2.1, para el que la model card recomienda entre 20 y 30 pasos.
- Conducta de rechazo suprimida: responde a peticiones que el codificador original rechazaria en la practica totalidad de los casos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no documentados para este build, orientado exclusivamente a codificacion de prompts.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Generacion de imagenes en ComfyUI con VRAM limitada: colocar el archivo en `ComfyUI/models/text_encoders/` y cargarlo con `CLIPLoader` tipo `qwen_image` permite ejecutar Qwen-Image-2.1 con un codificador de 5,88 GB en lugar de 16,33 GB, liberando memoria para el modelo DiT y el VAE.
- Flujos de trabajo en GPUs de gama media: al reducir el peso del codificador a una cuarta parte del bf16, el conjunto del pipeline cabe en tarjetas de 12-16 GB donde la version completa obligaria a offloading continuo.
- Prompts creativos sin censura previa: util para ilustracion editorial, arte conceptual o narrativa que roce temas que el codificador original filtraria, asumiendo las implicaciones eticas y legales descritas mas abajo.
- Integracion en plantillas de ComfyUI de terceros: al emplear el mismo esquema de proteccion por capas que la receta oficial (torre de vision en bf16, INT8 en embeddings), se comporta como un reemplazo del archivo oficial cambiando el nombre del fichero.
- Experimentacion e investigacion sobre ablacion: sirve como caso de estudio reproducible de como la ablacion direccional de rango 1 sobre `o_proj` y `down_proj` interactua con una cuantizacion agresiva de pesos, con tablas de error comparadas frente al modelo stock.
- Despliegue en Mac mediante variantes GGUF: este build concreto no acelera en Apple Silicon por depender de kernels CUDA, por lo que en ese entorno el caso de uso pasa por los GGUF hermanos (Q8_0, Q6_K, Q4_K_M) con ComfyUI-GGUF.
- Archivado del pipeline completo en disco reducido: junto con los GGUF de DiT y PE-T2I enlazados en la model card, permite mantener una instalacion funcional de Qwen-Image-2.1 en un espacio notablemente menor al de los pesos en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de generacion o de comprension (MMLU, HumanEval, GSM8K o equivalentes) en la informacion disponible. Los unicos datos cuantitativos publicados miden el efecto de la ablacion y el error de cuantizacion.

| Metrica | Codificador stock | Esta familia | Notas |
|---|---:|---:|---|
| Rechazos (mlabonne/harmful_behaviors) | 100/100 | 5/100 | Ablacion direccional Heretic (`o_proj` + `down_proj`) |
| Divergencia KL (mlabonne/harmless_alpaca) | 0 (por definicion) | 0,0220 | Punto de rodilla del frente de Pareto |
| Rechazos, verificacion sobre bf16 | — | 0/20 | 4/4 preguntas benignas correctas |
| Error relativo de ida y vuelta NVFP4, capas ablacionadas | — | 9,52 % | `o_proj`, `down_proj` |
| Error relativo de ida y vuelta NVFP4, capas intactas | — | 9,51 % | `q/k/up/gate_proj` |
| Error relativo de ida y vuelta NVFP4, codificador stock | 9,44 % | — | Referencia no ablacionada |

| Verificacion de fidelidad frente a Comfy-Org | Resultado |
|---|---|
| Ruta principal de 4 bits, `weight_s_rel`, `weight_s_channel`, `weight_codebook` | Byte a byte identicos |
| Torre de vision | Byte a byte identica |
| Dos capas INT8 | Difieren en el ultimo bit por version de `comfy_kitchen` (`lm_head` no se usa como codificador) |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 6 GB, coherente con un archivo de 5,88 GB; el total en ejecucion depende del contexto y de las activaciones, no especificados en la model card. Estimacion orientativa: 8-10 GB en total para el codificador en una GPU CUDA.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM, y con holgura en modelos de 12 GB (RTX 3060, RTX 4070) y 16 GB (RTX 4060 Ti 16 GB, RTX 4080). En el extremo alto, RTX 4090, A100 y H100 permiten ademas mantener el DiT y el VAE residentes en memoria.
- Aceleracion: requiere kernels CUDA; la model card indica explicitamente que no esta acelerado en Apple Silicon. En Mac debe usarse la build GGUF.
- Opciones de despliegue: ComfyUI con `CLIPLoader` (tipo `qwen_image`) y el nodo `TextEncodeQwenImage21`, en builds que incorporen `QwenImage21` (posterior al 14 de septiembre de 2026). Para formatos GGUF, ComfyUI-GGUF estandar. No hay soporte documentado para vLLM, TGI, Ollama o llama.cpp con estos pesos safetensors W4A8, cuyo esquema `comfy_quant` es especifico del ecosistema ComfyUI.
- Latencia y throughput: no disponibles.
- Ajuste de calidad: al tratarse de un modelo completo no destilado, la model card recomienda 20-30 pasos de muestreo; configuraciones de pocos pasos o tipo turbo producen resultados mas blandos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Ablacionado | Licencia |
|---|---|---|---|---|---|
| 0Endzz/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8 (este) | ~8B | No disponible | safetensors W4A8, 5,88 GB | Si | Apache-2.0 |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic | ~8B | No disponible | safetensors bf16, 16,33 GB | Si | Apache-2.0 |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-int8-convrot | ~8B | No disponible | safetensors INT8 con rotacion convolucional | Si | Apache-2.0 |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF | ~8B | No disponible | GGUF Q8_0, Q6_K, Q4_K_M | Si | Apache-2.0 |
| Qwen/Qwen3-VL-8B-Instruct (upstream) | ~8B | No disponible | safetensors bf16 | No | Apache-2.0 |

El criterio de eleccion que da la propia model card: el formato int8-convrot es el que cargan por defecto las plantillas oficiales de ComfyUI, mientras que este W4A8 se elige cuando se busca el archivo mas pequeno. La variante GGUF es la unica ruta en macOS.

## Limitaciones y advertencias

- La ablacion suprime la conducta de rechazo (5/100 en el conjunto de comportamientos daninos): el modelo puede generar contenido que los sistemas de moderacion convencionales bloquearian. La responsabilidad legal y etica del uso recae en el desplegador.
- Riesgo de alucinacion y de degradacion semantica por la propia ablacion: la divergencia KL de 0,0220 sobre texto benigno indica un desplazamiento medible de la distribucion de salida, que en un codificador de texto puede traducirse en menor fidelidad del prompt.
- Error de cuantizacion no despreciable: el 9,5 % de error relativo medido en NVFP4 sobre las capas cuantizadas es un valor elevado y puede afectar al detalle fino de la generacion; no se publican comparativas visuales frente al bf16.
- Restriccion de plataforma: el build depende de kernels CUDA y no acelera en Apple Silicon; en Mac hay que recurrir a los GGUF.
- Dependencia de version de ComfyUI: requiere una build con soporte de `QwenImage21` fusionado despues del 14 de septiembre de 2026. En versiones anteriores el nodo no existe.
- Ausencia de validacion comunitaria: el repositorio presenta 0 descargas y 0 likes, y la model card reproduce el texto de la publicacion de pottokao, incluyendo enlaces a repositorios de ese autor. No hay evidencia publica de pruebas independientes sobre este empaquetado concreto.
- Diferencia de ultimo bit en las dos capas INT8 respecto al build oficial, atribuida a la version de `comfy_kitchen`; irrelevante como codificador de texto, pero conviene registrarla en cualquier verificacion de integridad.
- Licencia Apache-2.0, que permite uso comercial, con la obligacion de conservar `LICENSE` y `NOTICE` y de no sugerir respaldo de Alibaba o Qwen: la model card declara explicitamente que no existe afiliacion ni aval.
- Los avisos tecnicos de la model card (excluir la torre de vision de la cuantizacion, forzar `convrot=True` en la ruta INT8, serializar la configuracion completa en `comfy_quant`, almacenar las escalas MXFP8 como uint8) describen fallos que producen archivos aparentemente validos pero silenciosamente incorrectos; son utiles como lista de comprobacion si se replica la receta.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo, el paper o su adopcion: los unicos enlaces utiles son los declarados en la propia model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/0Endzz/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8
- Modelo base directo: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Build INT8 con rotacion convolucional: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-int8-convrot
- Build GGUF del codificador de texto: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
- GGUF del DiT: https://huggingface.co/pottokao/Qwen-Image-2.1-DiT-GGUF
- GGUF PE-T2I: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- Modelo upstream usado como codificador: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Pipeline Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Herramienta de ablacion Heretic: https://github.com/p-e-w/heretic
- Dataset de rechazos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset benigno para divergencia KL: https://huggingface.co/datasets/mlabonne/harmless_alpaca
