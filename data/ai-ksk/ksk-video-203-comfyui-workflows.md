# AI-KSK/ksk-video-203-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-203-comfyui-workflows` es un repositorio de flujos de trabajo (workflows) para ComfyUI, no un modelo de pesos en sentido estricto. Lo publica el usuario AI-KSK y contiene las notas y grafos JSON de tres pipelines de generacion de video basados en la familia LTX 2: un grafo multi-imagen con primer y ultimo fotograma (hasta 20 imagenes), un grafo de control con IC-LoRA Union y un grafo de lip-sync destilado para avatares digitales.

El interes practico del repositorio reside en que documenta configuraciones concretas de inferencia (samplers, CFG, latentes, cadenas de sigma, escalados) sobre los modelos LTX 2.3 de 22B y LTX 2 de 19B, lo que permite reproducir resultados sin tener que ajustar manualmente cada nodo. El repo ocupa 0.0 GB y no contiene pesos: solo el README con las especificaciones de los grafos.

Se trata de material de referencia para quien ya trabaja con ComfyUI y dispone de los checkpoints LTX 2.3 y LTX 2 por separado. La licencia declarada es `other`, por lo que las condiciones de uso comercial dependen de las licencias de los modelos LTX subyacentes y de los nodos personalizados empleados, no de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de workflows ComfyUI); los grafos usan modelos de difusion de video LTX 2.3 (22B) y LTX 2 (19B) |
| Parametros totales | No disponible (depende del checkpoint referenciado: 22B para LTX 2.3, 19B para LTX 2) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; los grafos operan sobre latentes de video de 768x512x97, 960x544x121 y 768x512x241) |
| Tipos de cuantizacion | fp8 escalado (`fp8_scaled`), GGUF Q4_K_S, bf16 (VAE y text projection) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` |
| Formato de pesos | No aplica al repo (0.0 GB); los grafos referencian safetensors, GGUF y fp8 |

## Arquitectura y entrenamiento

Este repositorio no entrena ni distribuye modelos. Contiene tres grafos de ComfyUI documentados en el README:

- **Multi-imagen primer/ultimo fotograma (79 nodos):** usa como UNET `ltx-2.3-22b-dev_transformer_only_fp8_scaled` o el GGUF `LTX-2.3-distilled-Q4_K_S.gguf`; doble CLIP con `gemma_3_12B_it_fp8_e4m3fn` y `ltx-2.3_text_projection_bf16`; VAE `LTX23_video_vae_bf16`. Primera pasada con `euler_ancestral_cfg_pp` a CFG 1 y sigmas `0.909375, 0.725, 0.421875, 0.0`; segunda pasada con `euler_cfg_pp` a CFG 1 y sigmas `0.85, 0.7250, 0.4219, 0.0`. Latente de 768x512x97, cuatro `ImageScaleBy` a 0.5 y uno a 0.67, upscaler a 1.0.
- **Control IC-LoRA Union (44 nodos):** aplica `ltx-2.3-22b-ic-lora-union-control-ref0.5.safetensors` con fuerza 1.0, nodo `LTXAddVideoICLoRAGuide` con valores `0, 1, 1, disabled, False, 256, 64`, latente 960x544x121, sampler `res_2s_ode` a CFG 1.3 y cadena de sigma de 10 valores.
- **Lip-sync destilado LTX 2 (106 nodos):** `ltx-2-19b-distilled-fp8_transformer_only`, CLIP `gemma_3_12B_it_fp8_scaled` mas `ltx-2-19b-embeddings_connector_distill_bf16`, VAE `LTX2_video_vae_bf16`, `euler_ancestral` a CFG 1, latente 768x512x241, audio de 121 fotogramas y upscaler `ltx-2-spatial-upscaler-x2-1.0`.

No se documentan datos de entrenamiento, numero de tokens ni tecnicas de alineacion (RLHF/DPO) porque el repositorio no entrena modelos. La innovacion tecnica relevante es la combinacion de dos pasadas con `cfg_pp` y escalados intermedios para el control multi-imagen, y el uso de IC-LoRA Union para transferir control de movimiento desde un video de referencia.

## Capacidades

- Generacion de video a partir de texto e imagenes con los checkpoints LTX 2.3 y LTX 2.
- Control multi-imagen: insercion de hasta 20 imagenes locales (5 en linea) en indices 0/60/120/180 con pesos 1/0.5/0.5/1 sobre 240 fotogramas.
- Especificacion de primer y ultimo fotograma para interpolar movimiento.
- Control de movimiento mediante IC-LoRA Union y el nodo `LTXAddVideoICLoRAGuide`.
- Lip-sync y avatares digitales con el grafo LTX 2 destilado (recomendado por el autor frente a 2.3 para esta tarea).
- Generacion de audio sincronizado en el grafo de lip-sync (121 fotogramas de audio).
- Upscaling espacial x2 integrado en el grafo de lip-sync.
- Soporte de prompts negativos (el autor sugiere "中文字幕" como negativo; el nodo NAG viene desactivado porque falla en linea).

## Casos de uso

- **Interpolacion de primer y ultimo fotograma para animatica:** el grafo de 79 nodos permite fijar el fotograma inicial y final y generar la transicion intermedia con latente 768x512x97, util para previsualizar secuencias antes de produccion.
- **Animacion de personajes con multiples referencias:** con hasta 20 imagenes locales y pesos por indice se puede mantener la identidad del sujeto a lo largo de 240 fotogramas, adecuado para cortometrajes o contenido para redes.
- **Transferencia de movimiento desde video de referencia:** el grafo IC-LoRA Union (44 nodos, latente 960x544x121) permite aplicar el movimiento de un video control a un sujeto generado, con la precaucion de mantener el sujeto cerca del objetivo y huecos de fotograma pequenos.
- **Avatares digitales con lip-sync:** el grafo LTX 2 destilado (106 nodos, audio de 121 fotogramas) esta pensado para presentadores virtuales y videos explicativos con sincronizacion labial.
- **Prototipado rapido en ComfyUI:** al estar los grafos ya parametrizados (samplers, CFG, sigmas, escalados), sirven como plantilla para experimentar con la familia LTX sin partir de cero.
- **Produccion de video a 24 fps con extension a 36 fps:** el autor indica que 36 fps no muestra anomalias evidentes en la linea 2.3, lo que permite generar material a mayor cadencia para postproduccion.
- **Generacion de video con audio integrado:** el pipeline de lip-sync produce video y audio en el mismo grafo, util para contenido formativo o demostraciones de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explicita. Los grafos usan variantes fp8 escaladas y GGUF Q4_K_S, lo que reduce el requisito frente a bf16, pero el tamano de los checkpoints (22B y 19B) implica que la inferencia completa en fp8 requiere GPUs de gama alta.
- **GPU recomendadas:** no disponible en la informacion proporcionada. Por el tamano de los modelos (22B y 19B) y el uso de fp8, se requiere una GPU con suficiente memoria para el UNET, el doble CLIP (Gemma 3 12B) y el VAE; no se confirman modelos concretos.
- **Consumer GPU:** no disponible. La existencia de una variante GGUF Q4_K_S sugiere que el autor contempla GPUs de consumo, pero no se especifica cual.
- **Opciones de despliegue:** ComfyUI (los grafos son JSON para este entorno). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/latente | Licencia | Disponibilidad |
|---|---|---|---|---|
| AI-KSK/ksk-video-203-comfyui-workflows (este repo) | No aplica (workflows) | Latentes 768x512x97, 960x544x121, 768x512x241 | other | Hugging Face, 0 descargas |
| LTX 2.3 (checkpoint referenciado) | 22B | No disponible | No disponible | Referenciado en los grafos |
| LTX 2 destilado (checkpoint referenciado) | 19B | No disponible | No disponible | Referenciado en los grafos |

No se dispone de datos de rendimiento ni de otros repositorios de workflows comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo:** el repositorio no contiene pesos (0.0 GB); solo el README con las notas de los grafos. Sin los checkpoints LTX 2.3 y LTX 2 no es utilizable.
- **Licencia `other`:** las condiciones de uso comercial no estan detalladas y dependen de las licencias de los modelos LTX subyacentes y de los nodos personalizados.
- **Idioma:** solo declarado en ingles; el prompt negativo sugerido esta en chino, lo que sugiere uso mixto no documentado formalmente.
- **Nodo NAG desactivado:** el grafo se distribuye con NAG en bypass porque falla en linea, lo que puede afectar a la calidad si se reactiva sin ajustes.
- **Restricciones del control IC-LoRA:** el autor advierte que el movimiento amplio es aceptable pero el sujeto debe mantenerse cerca del objetivo y con huecos de fotograma pequenos; no es adecuado para movimientos grandes o cambios bruscos de escena.
- **Recomendacion de version:** para avatares digitales el autor indica usar el grafo LTX 2 en lugar de 2.3, lo que implica que 2.3 no es la mejor opcion para lip-sync.
- **Sin benchmarks:** no hay datos objetivos de calidad, latencia ni throughput.
- **Riesgo de alucinacion visual:** al ser generacion de video, puede producir artefactos, inconsistencias temporales o deformaciones, especialmente con muchas imagenes de referencia.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-203-comfyui-workflows
- RunningHub (post 1): https://www.runninghub.ai/post/2032460701406601217/?inviteCode=rh-v1111
- RunningHub (post 2): https://www.runninghub.ai/post/2032312720623669250/?inviteCode=rh-v1111
- RunningHub (post 3): https://www.runninghub.ai/post/2018224320958439425/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=Pb6oDvvj-VQ
- Bilibili: https://www.bilibili.com/video/BV186wEzRENT
