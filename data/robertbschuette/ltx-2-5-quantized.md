# robertbschuette/LTX-2.5-Quantized

## Resumen

LTX-2.5 Quantized es un repositorio de pesos cuantizados del modelo Lightricks/LTX-2.5, un generador texto-a-video que produce imagen y audio en una sola pasada. El autor, robertbschuette, no entrena nada: parte de los pesos bf16 originales de Lightricks y publica dos familias de ficheros cuantizados para que el modelo quepa en tarjetas de 12, 16 y 24 GB, donde los 42 GB en bf16 del DiT y los 26 GB del encoder de texto no caben de ninguna manera.

El modelo base es un Diffusion Transformer (DiT) de 21.004.025.600 parámetros (el autor lo denomina «22B»), con arquitectura declarada como `ltxv` en los metadatos GGUF y una variante destilada que permite muestrear con un esquema de 9 pasos más 4 pasos. La pieza diferencial del repo es que cubre dos ecosistemas de carga distintos de ComfyUI: la escalera Q clásica en GGUF para el nodo de city96, y cuantizaciones nativas `comfy-*` en safetensors para ComfyUI 0.32 o superior sin nodos personalizados, usando el mismo sistema (`comfy_quant` y los kernels comfy-kitchen) que el build oficial `int8-convrot` de Lightricks.

Es relevante ahora porque resuelve un problema estrictamente práctico de despliegue: el salto de 8 a 4 bits en el DiT con las capas de control intactas, más una receta concreta y medida (no estimada) para 16 GB de VRAM, incluyendo el encoder de texto gemma4-12b cuantizado a w4a8 en 10,6 GB, del que no existe versión GGUF. El repositorio tiene 201,2 GB, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con arquitectura declarada `ltxv`; generacion conjunta de video y audio en una pasada |
| Parametros totales | 21.004.025.600 (~21B; el autor lo denomina «22B») |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion; no se declara ventana de contexto) |
| Tipos de cuantizacion | GGUF K-quants: Q2_K, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0. Comfy-native: w4a4, w4a8, nvfp4, int8 y mix4x8 (4 y 8 bits en el mismo fichero). IQ-quants no soportados |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license |
| Formato de pesos | safetensors (`comfy-w4a4`, `comfy-w4a8`, `comfy-nvfp4`, `comfy-int8`, `comfy-mix4x8`) y GGUF |
| Modelo base | Lightricks/LTX-2.5 |
| Encoder de texto | gemma4-12b; 26,3 GB en bf16, 15,4 GB en int8 oficial; version cuantizada w4a8 de 10,6 GB incluida en el repo |
| VAE | `ltx-2.5-video-vae-bf16` (1,5 GB) y `ltx-2.5-audio-vae-bf16` (0,4 GB), sin cuantizar |
| Pasos de muestreo | Esquema destilado: 9 pasos y despues 4, con `video_cfg` y `audio_cfg` a 1.0 |
| Tamano del repositorio | 201,2 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un diffusion transformer que genera video y audio de forma conjunta: dos proyecciones de entrada independientes (`patchify_proj.weight` y `audio_patchify_proj.weight`) y dos salidas (`proj_out` y `audio_proj_out`), con guiado sin clasificador separado por modalidad (`video_cfg` y `audio_cfg`). La variante publicada es la destilada, de ahi que funcione con 9 más 4 pasos en lugar de un schedule completo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

El trabajo técnico de este repositorio es exclusivamente de cuantización, y está documentado con detalle. Para GGUF se construye un maestro F16 con `general.architecture = "ltxv"` y el prefijo `model.diffusion_model.` eliminado, y se pasa `llama-quantize`. De los 4349 tensores, 4041 tienen la última dimensión divisible por 256 y admiten K-quants; de los 308 restantes, 306 son vectores de bias que se quedan en F16 (304 biases de gate-logit de longitud 32, más `proj_out.bias` y `audio_proj_out.bias` de longitud 128), y solo dos son matrices de pesos reales (`patchify_proj.weight` y `audio_patchify_proj.weight`, eje de 128) que caen a F16. Los IQ-quants no son viables: `llama-quantize` los rechaza con «Invalid quantization type for image model».

Para las versiones comfy-native se replica el conjunto de capas del fichero oficial `comfy-int8-convrot` en lugar de decidirlo por heurística: las mismas 1440 capas Lineal se cuantizan, mientras que adaLN, los embedders de timestep, todas las norms y biases y las tablas scale-shift permanecen en bf16. Esas capas de control son aproximadamente el 6% del fichero y redondearlas es, según el autor, la forma típica de matar un DiT cuantizado. Los builds `mix4x8` llevan dos formatos en un mismo fichero; ComfyUI lee `comfy_quant` por prefijo de capa (`ops.py:1136`) y fija `module.quant_format` desde el blob de cada capa, de modo que no hace falta nada nuevo en el lado de la carga.

## Capacidades

- Generacion de video a partir de texto (pipeline `text-to-video`) con audio sincronizado en la misma pasada de muestreo.
- Generacion de audio conjunta, con proyeccion y salida propias y guiado independiente del video.
- Muestreo destilado de pocos pasos: 9 pasos mas 4 con CFG a 1.0, lo que reduce el coste frente a un schedule completo.
- Decodificacion VAE por teselas: `tile_size` 512 y `temporal_size` 32, necesaria para caber en tarjetas pequenas.
- Integracion con ComfyUI en dos vias: nodo ComfyUI-GGUF (city96) para los `.gguf` y ComfyUI 0.32 o superior en stock para los `comfy-*.safetensors`, sin nodos personalizados.
- Control de cuantizacion por capa gracias al campo `comfy_quant`, con ficheros de formato mixto 4/8 bits.
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades de texto: no aplica, es un modelo generativo de video y audio.
- Capacidades multilingues: no disponible.

## Casos de uso

- **Generacion de clips con audio en una workstation de 16 GB**: cargando `LTX25-distilled-DiT-Q3_K_M.gguf` (10,6 GB) con el encoder `gemma4-12b-ltx25-comfy-w4a8` y decodificacion VAE por teselas, se puede producir video con sonido en una RTX 4080 o 4060 Ti de 16 GB sin salir de ComfyUI.
- **Prototipado rapido en 12 GB**: con `Q2_K.gguf` (7,9 GB) o `comfy-w4a4` (11,2 GB, marcado como «tight» en 12 GB) se puede iterar en tarjetas de gama media antes de mover la produccion a una GPU mayor.
- **Pipeline sin nodos personalizados**: los ficheros `comfy-*.safetensors` funcionan en ComfyUI 0.32+ en stock, lo que simplifica el despliegue en entornos gestionados donde no se permite instalar custom nodes.
- **Render por lotes en 24 GB**: con `Q5_K_M` (15,9 GB), `Q6_K` (17,8 GB) o `Q8_0` (22,7 GB) se obtiene la mayor fidelidad de los K-quants para tiradas largas en una RTX 4090 o A6000.
- **Generacion de video explicativo con locucion**: al producir imagen y audio en la misma pasada, el modelo sirve para piezas cortas donde la sincronizacion audio-video generada conjuntamente aporta valor frente a montar pista de audio y video por separado.
- **Investigacion sobre cuantizacion de DiT**: el repositorio documenta el mapeo tensor a tensor (que capas admiten K-quant, cuales caen a F16 y por que) y sirve como referencia reproducible para estudiar el impacto del redondeo en modelos de difusion.
- **Despliegue en un servidor con una sola GPU de 24 GB y varios modelos**: la familia `mix4x8` permite intercalar capas de 4 y 8 bits en el mismo fichero, ajustando el compromiso tamano/calidad sin cambiar de grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas objetivas (VBench, FVD, CLIP score ni similares) ni comparaciones cuantitativas de calidad frente al modelo bf16 original. La unica informacion de rendimiento es el recuento de pasos del schedule destilado (9 mas 4) y los tamanos de fichero medidos; no se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

Los tamanos son GB decimales (bytes / 10^9) y las capacidades de tarjeta son GiB: un fichero de 15,9 GB ocupa 14,8 GiB de una tarjeta de 16 GiB, y esa diferencia es donde vive el pool de activaciones. «Cabe en 16 GB» asume que el encoder de texto no esta residente al mismo tiempo (ComfyUI lo libera antes del muestreo) y decodificacion VAE por teselas.

| Fichero | GB | 12 GB | 16 GB | 24 GB |
|---|---|:--:|:--:|:--:|
| `LTX25-distilled-DiT-comfy-w4a4.safetensors` | 11,2 | justo | si | si |
| `LTX25-distilled-DiT-comfy-w4a8.safetensors` | 12,5 | no | si | si |
| `LTX25-distilled-DiT-Q2_K.gguf` | 7,9 | si | si | si |
| `LTX25-distilled-DiT-Q3_K_M.gguf` | 10,6 | justo | si | si |
| `LTX25-distilled-DiT-Q4_K_S.gguf` | 12,9 | no | si | si |
| `LTX25-distilled-DiT-Q4_K_M.gguf` | 14,2 | no | justo | si |
| `LTX25-distilled-DiT-Q5_K_M.gguf` | 15,9 | no | no | si |
| `LTX25-distilled-DiT-Q6_K.gguf` | 17,8 | no | no | si |
| `LTX25-distilled-DiT-comfy-nvfp4.safetensors` | 12,5 | no | si | si |
| `LTX25-distilled-DiT-comfy-mix4x8-13.8GB.safetensors` | 13,8 | no | si | si |
| `LTX25-distilled-DiT-comfy-mix4x8-17GB.safetensors` | 17,0 | no | no | si |
| `LTX25-distilled-DiT-Q8_0.gguf` | 22,7 | no | no | justo |
| `LTX25-distilled-DiT-comfy-int8.safetensors` | 21,5 | no | no | justo |
| `gemma4-12b-ltx25-comfy-w4a8.safetensors` (encoder) | 10,6 | justo | si | si |

- **VRAM estimada**: el DiT va de 7,9 GB (Q2_K) a 22,7 GB (Q8_0); hay que sumar el encoder de texto cuando esta residente (10,6 GB en w4a8; 26,3 GB en bf16) y los VAE sin cuantizar (1,5 GB de video y 0,4 GB de audio).
- **GPU consumer**: si en 16 GB con Q3_K_M o `comfy-w4a4`; si en 24 GB con Q5_K_M, Q6_K o `comfy-mix4x8-17GB`. En 12 GB solo entran Q2_K con holgura y Q3_K_M / `comfy-w4a4` de forma muy ajustada.
- **GPU profesional**: A100, H100, L40S y RTX A6000 cubren sin problema los builds de mayor fidelidad (Q8_0, int8) y permiten mantener encoder y DiT cargados a la vez.
- **Despliegue**: ComfyUI 0.32 o superior en stock para los `comfy-*.safetensors`; ComfyUI-GGUF (city96) para los `.gguf`. No se documenta soporte en vLLM, TGI, Ollama ni llama.cpp como runtime de inferencia, aunque `llama-quantize` se usa para producir los GGUF.
- **Receta para 16 GB**: `Q3_K_M` (10,6 GB) o `comfy-w4a4` (11,2 GB), encoder `gemma4-12b-ltx25-comfy-w4a8`, VAE bf16, decodificacion por teselas con `tile_size` 512 y `temporal_size` 32, schedule destilado 9+4 y CFG de video y audio a 1.0.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| robertbschuette/LTX-2.5-Quantized | 21,0B | Video y audio; GGUF y safetensors comfy-native desde 7,9 GB | ltx-2.x-community-license | 0 descargas, 0 likes |
| Lightricks/LTX-2.5 (bf16 original) | 21,0B | Video y audio; 42 GB de pesos bf16 mas 26 GB de encoder | ltx-2.x-community-license | Modelo oficial de referencia |
| Lightricks LTX-2.3 (generacion previa) | no disponible | Video; su encoder gemma3 si dispone de GGUF | no disponible | Referencia del ecosistema |
| MiniMax-H3 | no disponible | No admite K-quants: sus tensores de 2688 de ancho lo impiden en todo el modelo | no disponible | Mencionado por el autor como contraste tecnico |

Las cuantizaciones del encoder de texto son un caso aparte: el autor cita tres publicaciones independientes del mismo dia para gemma4-12b (w4a8-convrot de Winnougan en 10,6 GB, nvfp4 de DmitryDB en 11,2 GB y nvfp4-torchao de vonkaiser en 8,9 GB). La version incluida aqui, w4a8 de 10,60 GB, esta a menos de 2 MB de la de Winnougan y el propio autor la describe como un espejo, no como una primicia.

## Limitaciones y advertencias

- **Sin validacion de la comunidad**: 0 descargas y 0 likes, repositorio creado y actualizado el mismo dia. No hay evidencia externa de que los pesos carguen y funcionen mas alla de la verificacion del autor.
- **Model card truncada**: el texto publicado se corta a mitad de frase en la seccion sobre los ficheros de formato mixto, de modo que falta informacion sobre ese apartado.
- **Licencia restrictiva**: se trata de la ltx-2.x-community-license, marcada como `license: other`. Hay que revisar los terminos exactos antes de cualquier uso comercial; no se detallan en la informacion disponible.
- **Degradacion por cuantizacion**: los builds de 2 y 3 bits (Q2_K, Q3_K_M) son los unicos que caben en 12 GB y son los que mas se alejan del bf16. El autor advierte explicitamente de que redondear las capas de control (adaLN, embedders de timestep, norms, biases, tablas scale-shift) degrada el DiT, y por eso las mantiene en bf16; no cuantifica los VAE porque «no merece la pena lo que cuesta».
- **Sin GGUF del encoder de texto**: ComfyUI-GGUF filtra los encoders de texto por `TXT_ARCH_LIST`, que incluye `gemma3` pero no `gemma4`. La peticion abierta (issue #450, 2026-05-28) sigue sin atender, asi que las opciones para el encoder pasan obligatoriamente por safetensors comfy-native.
- **Sin IQ-quants**: cualquier repositorio que ofrezca una escalera IQ2/IQ3/IQ4 para LTX-2.5 esta haciendo otra cosa; `llama-quantize` los rechaza para este tipo de fichero.
- **Requisito de memoria estricto**: la receta de 16 GB depende de que el encoder de texto se libere antes del muestreo y de usar VAE por teselas; sin esas dos condiciones no cabe.
- **Alucinacion y artefactos**: no hay datos publicados sobre tasas de fallo, coherencia temporal ni fidelidad al prompt. No se dispone de evaluaciones de sesgo.
- **Idiomas**: no declarados. El encoder es gemma4-12b, pero el repositorio no especifica cobertura linguistica para los prompts.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robertbschuette/LTX-2.5-Quantized
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: https://huggingface.co/Lightricks/LTX-2.5/blob/main/LICENSE
- Issue de ComfyUI-GGUF sobre soporte de `gemma4` en encoders de texto: https://github.com/city96/ComfyUI-GGUF/issues/450
- ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
