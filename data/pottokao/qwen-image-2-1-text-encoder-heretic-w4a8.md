# pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8

## Resumen

`pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8` es una version cuantizada en precision mixta del text encoder del modelo de generacion de imagenes Qwen-Image-2.1, publicado por el usuario de la comunidad pottokao. No es un modelo generativo autonomo: es el componente que convierte el prompt de texto (y potencialmente entradas visuales) en la representacion latente que consume el difusor de Qwen-Image-2.1. Concretamente, se trata del encoder Qwen3-VL de 8B sobre el que se ha aplicado una ablacion direccional ("Heretic") para reducir el comportamiento de rechazo, y despues una cuantizacion asimetrica W4A8 (pesos de 4 bits, activaciones de 8 bits) con rotacion convolucional y codebook Lloyd-Max.

Su relevancia practica es doble. Por un lado, reduce el peso del encoder de 16,33 GB en bf16 a 5,88 GB, lo que permite ejecutar flujos de Qwen-Image-2.1 en GPUs de gama consumer con menos VRAM. Por otro, reproduce byte a byte la receta de cuantizacion que Comfy-Org distribuye para el encoder oficial, de modo que es un reemplazo directo en ComfyUI (mismo formato, mismas claves, mismos tensores) aplicado sobre pesos abliterados. El autor documenta ademas que el build es "el mismo formato" que el oficial, no una aproximacion.

El modelo esta sujeto a la licencia Qwen Research: uso exclusivamente no comercial (investigacion o evaluacion) sin acuerdo adicional con Qwen. Esta pensado para cualquier GPU CUDA; en Apple Silicon no hay kernels acelerados y se recomienda la build GGUF de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen3-VL (encoder de texto con torre de vision), derivado del text encoder de Qwen-Image-2.1 |
| Parametros totales | Aproximadamente 8.000 millones (segun el nombre de archivo `qwen3vl_8b`; la model card no da cifra explicita) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A8: 4 bits en pesos de proyecciones FFN y atencion (252 capas), INT8 per-channel con convrot en `embed_tokens` y `lm_head`, bf16 en torre de vision (351 tensores) y en normas/sesgos. Distribucion: 79,2 % de parametros a 4 bits, 14,2 % a 8 bits, 6,6 % en bf16 |
| Idiomas soportados | No disponible |
| Licencia | `qwen-research` (licencia "other"); uso no comercial unicamente, uso comercial requiere licencia separada de Qwen |
| Formato de pesos | safetensors (`qwen3vl_8b_w4a8_heretic.safetensors`, 5,88 GB); tensores `int8` con valores de 4 bits empaquetados `[N, K/2]`, escalas `weight_s_rel` en `float8_e4m3fn`, escalas `weight_s_channel` en `float32`, codebook Lloyd-Max y `comfy_quant` en `uint8` |
| Tamano del repositorio | 6,3 GB |
| Modelo base | `pottokao/Qwen-Image-2.1-Text-Encoder-Heretic` (bf16, 17 GB) |
| Entorno de ejecucion previsto | ComfyUI (`CLIPLoader` con tipo `qwen_image`, nodo `TextEncodeQwenImage21`), build con soporte `QwenImage21` posterior al 2026-09-14 |

## Arquitectura y entrenamiento

Arquitectonicamente es el text encoder de Qwen-Image-2.1, un transformer Qwen3-VL de 8B que conserva su torre de vision intacta en bf16 (351 tensores sin cuantizar). El autor no entrena el modelo: parte de un checkpoint abliterado y le aplica una cuantizacion post-entrenamiento. La ablacion direccional se realizo con la herramienta Heretic sobre las proyecciones `o_proj` y `down_proj`, con 200 ensayos y 60 ensayos de arranque, seleccionando el punto de rodilla de la frontera de Pareto. Sobre los pesos resultantes se aplica un esquema W4A8 decodificado y reproducido a partir del archivo oficial `qwen3vl_8b_w4a8.safetensors` de Comfy-Org.

La innovacion tecnica principal es la fidelidad de la receta de cuantizacion. El autor ejecuto el mismo pipeline sobre el encoder original (sin abliterar) y comparo tensor a tensor contra el build de Comfy-Org: el camino principal de 4 bits, `weight_s_rel`, `weight_s_channel`, `weight_codebook` y la torre de vision resultaron byte-identicos; solo las dos capas INT8 difieren en el ultimo bit por una diferencia de version de `comfy_kitchen` (`lm_head` no se usa cuando el modelo actua como text encoder). La model card documenta cinco trampas que producen archivos "validos en apariencia pero silenciosamente incorrectos": cuantizar por error la torre de vision, no activar `convrot=True` en `int8_tensorwise` (la ruta de 4 bits lo aplica internamente pero la de INT8 no por defecto), serializar solo `{"format": ...}` en `comfy_quant` perdiendo `convrot` y `convrot_groupsize`, almacenar las escalas MXFP8 como `float8_e8m0` (que el loader de ComfyUI no parsea, `KeyError: 'F8_E8M0'`) y no eliminar el prefijo `model.language_model.` que el repack de Comfy-Org ya retira.

El autor tambien comprobo que la cuantizacion no interfiere con la ablacion: el error de ida y vuelta medido en NVFP4 es del 9,52 % en las capas abliteradas (`o_proj`, `down_proj`), 9,51 % en las intactas (`q/k/up/gate_proj`) y 9,44 % en el encoder original, ya que la ablacion direccional es una edicion de rango 1 que no genera outliers.

## Capacidades

- Codificacion de prompts de texto a embeddings para el pipeline de generacion de imagenes Qwen-Image-2.1: es su funcion principal y unica documentada.
- Compatibilidad directa con ComfyUI mediante `CLIPLoader` (tipo `qwen_image`) y el nodo `TextEncodeQwenImage21`, sin adaptadores ni conversion de claves.
- Conservacion de la torre de vision en bf16, lo que preserva la capacidad multimodal del encoder original para procesar entradas visuales; la model card no documenta flujos concretos de uso.
- Comportamiento de rechazo reducido por ablacion: 5 rechazos sobre 100 en `mlabonne/harmful_behaviors` frente a 100/100 del encoder original, verificado de forma independiente sobre la fuente bf16 (0/20 rechazos, 4/4 preguntas benignas respondidas correctamente).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni modo "thinking". Al ser un text encoder, la generacion de texto no es su modo de uso previsto.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- No es un modelo entrenable de forma practica en este formato: los pesos estan cuantizados y empaquetados para inferencia.

## Casos de uso

- Generacion de imagenes en ComfyUI: colocar el archivo en `ComfyUI/models/text_encoders/`, cargarlo con `CLIPLoader` tipo `qwen_image` y conectarlo a `TextEncodeQwenImage21`. Es el escenario para el que fue construido y el unico documentado explicitamente por el autor.
- Sustitucion directa del encoder oficial sin tocar el grafo: al reproducir byte a byte la receta de Comfy-Org, se puede cambiar el encoder stock por este sin reescribir workflows ni revalidar formas de tensores.
- Reduccion de huella de VRAM en GPUs de gama consumer: pasar de 16,33 GB en bf16 a 5,88 GB permite montar el pipeline completo en tarjetas de 12 GB o incluso menos, manteniendo el mismo formato que el ecosistema oficial.
- Investigacion sobre ablacion y seguridad en encoders multimodales: usar `mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca` para medir tasas de rechazo y divergencia KL (0,0220 en esta familia) y estudiar como afecta la ablacion direccional al condicionamiento de un modelo de difusion.
- Comparativa de esquemas de cuantizacion sobre la misma imagen: al existir builds bf16, NVFP4, W4A8 y GGUF de la misma familia, se puede generar con cada una y medir deriva visual y de fidelidad al prompt bajo identico seed y prompt.
- Auditoria de recetas de cuantizacion: el repositorio documenta como diferenciar tensor a tensor contra el archivo oficial y detectar errores silenciosos (torre de vision mal cuantizada, `convrot` desactivado, escalas mal tipadas), util para quien publique sus propias builds.
- Procesamiento por lotes en servidor CUDA: el menor peso del encoder libera VRAM para lotes mas grandes o para tener el difusor residente en memoria en pipelines de generacion por API.
- Flujos de edicion o condicionamiento con referencia visual: la torre de vision en bf16 se conserva intacta, por lo que los flujos que dependan de entrada visual en el encoder no se degradan por la cuantizacion, aunque el autor no documenta un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). El autor unicamente reporta metricas de ablacion y de error de cuantizacion:

| Metrica | Modelo original | Esta familia |
|---|---:|---:|
| Rechazos en `mlabonne/harmful_behaviors` | 100/100 | 5/100 |
| Divergencia KL en `mlabonne/harmless_alpaca` | 0 (por definicion) | 0,0220 |
| Preguntas benignas respondidas correctamente (verificacion sobre bf16) | No disponible | 4/4 |
| Rechazos en verificacion independiente sobre bf16 | No disponible | 0/20 |

| Error de ida y vuelta en NVFP4 por grupo de capas | Error relativo |
|---|---:|
| Capas abliteradas (`o_proj`, `down_proj`) | 9,52 % |
| Capas intactas (`q/k/up/gate_proj`) | 9,51 % |
| Encoder original sin abliterar | 9,44 % |

| Verificacion de fidelidad frente al build oficial de Comfy-Org | Resultado |
|---|---|
| Camino principal de 4 bits, `weight_s_rel`, `weight_s_channel`, `weight_codebook` | Byte-identico |
| Torre de vision | Byte-identica |
| Capas INT8 (`embed_tokens`, `lm_head`) | Difieren en el ultimo bit por version de `comfy_kitchen` |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 5,88 GB en disco; el repositorio completo son 6,3 GB. Con activaciones, cache de atencion y lotes moderados, se puede estimar un consumo de unos 8 GB, aunque es una estimacion a partir del tamano de archivo, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU CUDA (el autor indica explicitamente "any CUDA GPU"). Para despliegues con concurrencia alta, tarjetas con 16 GB o mas (A100, H100, L40S, RTX 4090) dan margen para lotes grandes y tener el difusor residente.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos del build. Los 5,88 GB de pesos lo situan en el rango de tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) siempre que el difusor se cargue con la gestion de memoria de ComfyUI.
- Apple Silicon: no acelerado. Los kernels son CUDA; en Mac hay que usar la build GGUF de la misma familia.
- Opciones de despliegue: ComfyUI es el entorno soportado y documentado (`CLIPLoader` + `TextEncodeQwenImage21`, con build posterior al 2026-09-14). El build NVFP4 de la familia esta pensado para las tensor cores FP4 nativas de Blackwell. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato empaquetado de 4 bits con codebook Lloyd-Max no es compatible con esos servidores sin conversion.
- Latencia y throughput: no disponibles. El autor no publica medidas de tiempo de codificacion ni de generaciones por segundo.

## Comparativa con modelos similares

| Modelo | Precision / formato | Tamano | GPU objetivo | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (W4A8) | 4 bits pesos / 8 bits activaciones, safetensors | 5,88 GB | Cualquier CUDA | 5/100 | qwen-research (no comercial) | HuggingFace |
| `Qwen-Image-2.1-Text-Encoder-Heretic` (bf16) | bf16 | 17 GB | CUDA con VRAM amplia | 5/100 | qwen-research (no comercial) | HuggingFace |
| `Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4` | NVFP4 (w4) | 5,87 GB | Blackwell (tensor cores FP4) | 5/100 | qwen-research (no comercial) | HuggingFace |
| `Qwen-Image-2.1-Text-Encoder-Heretic-GGUF` | GGUF | No disponible | Apple Silicon y CPU/GPU mixto | 5/100 | qwen-research (no comercial) | HuggingFace |
| Encoder oficial de Comfy-Org (`qwen3vl_8b_w4a8.safetensors`) | W4A8, safetensors | No disponible en la informacion | Cualquier CUDA | 100/100 | qwen-research (no comercial) | Distribuido con ComfyUI |

No se dispone de datos de benchmarks comparativos de calidad de generacion entre estas variantes; la unica comparacion cuantitativa publicada es el error de cuantizacion y la tasa de rechazos.

## Limitaciones y advertencias

- Licencia restrictiva: licencia Qwen Research, uso exclusivamente no comercial (investigacion o evaluacion). Cualquier uso comercial requiere una licencia separada de Qwen, solicitada en `model-business@notice.qwencloud.com`. Esto afecta tambien a productos que simplemente integren el encoder en un pipeline de generacion de imagenes.
- No es un modelo independiente: necesita el difusor de Qwen-Image-2.1 y una build de ComfyUI con soporte `QwenImage21` posterior al 2026-09-14. Fuera de ese ecosistema no hay soporte documentado.
- La ablacion reduce los rechazos a 5/100 en `mlabonne/harmful_behaviors`, lo que implica que el encoder apenas filtra contenido sensible. En un pipeline de generacion de imagenes esto se traduce en ausencia de barreras de seguridad propias del encoder, con el consiguiente riesgo de generar contenido nocivo o no deseado.
- La divergencia KL de 0,0220 respecto al modelo original indica un desplazamiento medible en la distribucion de salida; puede haber derivas sutiles en la fidelidad al prompt que no se han caracterizado con benchmarks de generacion.
- La cuantizacion W4A8 introduce un error de ida y vuelta de aproximadamente el 9,5 % en NVFP4 por grupo de capas, segun las propias mediciones del autor. No se publica una evaluacion del impacto de ese error sobre la imagen final.
- Riesgo de alucinacion: no evaluado ni documentado para este componente. Como text encoder, su salida es un embedding, no texto, por lo que el modo de fallo relevante es la mala interpretacion o el ignorado de partes del prompt, no la invencion de hechos.
- Las cinco trampas de cuantizacion documentadas por el autor producen archivos que cargan "correctamente" y emiten ruido. Cualquier reempaquetado propio del modelo debe validarse diferenciando contra el archivo oficial, no solo comprobando que carga.
- Sensibilidad al versionado de herramientas: las dos capas INT8 ya difieren en el ultimo bit respecto al build oficial por una diferencia de version de `comfy_kitchen`. Reproducir exactamente el archivo puede requerir fijar versiones.
- Compatibilidad limitada de hardware: sin aceleracion en Apple Silicon y sin soporte documentado en servidores de inferencia habituales (vLLM, TGI, Ollama).
- Longitud de contexto, idiomas soportados y comportamiento multilingue: no disponibles en la informacion proporcionada, por lo que no se puede garantizar el comportamiento con prompts largos o en idiomas distintos del ingles.
- Idioma de la model card: solo en ingles, sin documentacion oficial de Qwen especifica para este derivado.
- No afiliado a Alibaba ni a Qwen: es un derivado de la comunidad, redistribuido bajo la seccion 3.a de la licencia Qwen Research con copia de la licencia incluida en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8
- Fuente bf16 de la misma familia: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Build NVFP4 para Blackwell: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4
- Build GGUF para Apple Silicon: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1
- Texto de la licencia Qwen Research: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Herramienta de ablacion direccional Heretic: https://github.com/p-e-w/heretic
- Dataset de evaluacion de rechazos: `mlabonne/harmful_behaviors` (HuggingFace)
- Dataset de evaluacion de divergencia KL: `mlabonne/harmless_alpaca` (HuggingFace)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados eran documentacion de soporte de Windows y no guardan relacion con el modelo.
