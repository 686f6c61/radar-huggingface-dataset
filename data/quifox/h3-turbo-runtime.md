# quifox/H3-Turbo-Runtime

## Resumen

H3 Turbo Runtime es un motor de inferencia optimizado para la generacion audiovisual nativa con el modelo MiniMax H3, no un modelo entrenado desde cero. Lo desarrolla el usuario quifox y se apoya en pesos de la comunidad alojados en Hugging Face: el backbone DiT FL2VA cuantizado en W4A8 de joeygambino, el adaptador few-step Turbo de lightx2v, los VAE de video y audio de Kijai y Comfy-Org, y el codificador de texto Qwen3-VL 4B en INT8. Su proposito es reducir drasticamente los requisitos de VRAM y el tiempo de generacion para que la generacion de video con audio nativo sea viable en GPUs de consumo.

El runtime implementa dos backends: uno de streaming con paginacion de pesos que opera en torno a 4-4,2 GiB de VRAM, y otro rapido con kernels Triton fusionados (FC1+FC2 y QK-RoPE) orientado a maximo throughput. Segun las mediciones del autor, un clip de 5 segundos a 832x480 con 8 pasos pasa de 2.287,90 s y 14.649 MiB en una Tesla T4 con PyTorch sin modificar a 670,12 s y 4.181 MiB con el backend de streaming, y a 161,54 s y 5.695 MiB en una RTX 4060 Laptop de 8 GB con el backend rapido.

Es relevante ahora porque demuestra que un modelo de video con audio nativo de gran tamano puede ejecutarse en hardware de consumo (6-16 GB de VRAM) mediante cuantizacion W4A8, destilacion few-step y gestion por etapas de la memoria, sin necesidad de GPUs de datacenter. La integracion con ComfyUI y CozyUI amplia su alcance a flujos de trabajo creativos habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con VAE de video y audio separados; frontend de condicionamiento multimodal Qwen3-VL 4B + proyeccion ClipProj |
| Parametros totales | no disponible (el repositorio no distribuye pesos; el backbone DiT cuantizado W4A8 ocupa 12,54 GB en disco) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento de texto via Qwen3-VL 4B con prefijo INT8 de 24 capas) |
| Tipos de cuantizacion | W4A8 en el backbone DiT; INT8 en VAE de video y en el codificador de texto; FP32 en VAE de audio; BF16 en el adaptador Turbo |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license (other) |
| Formato de pesos | safetensors (no se distribuyen en este repositorio; se descargan de los repositorios upstream) |

## Arquitectura y entrenamiento

El modelo subyacente MiniMax H3 es un sistema de generacion audiovisual nativa basado en un backbone DiT (Diffusion Transformer) que muestrea latentes de video y audio de forma conjunta y los decodifica secuencialmente con un VAE de video (INT8, decodificacion por tiles) y un VAE de audio (FP32). El condicionamiento de texto y vision se realiza con Qwen3-VL 4B en INT8 (prefijo de 24 capas) mas una capa de proyeccion ClipProj. Este repositorio no entrena pesos nuevos: combina la cuantizacion W4A8 de la comunidad para el DiT, la destilacion few-step Turbo LoRA de LightX2V (adaptador de 8 pasos, 1,96 GB en BF16) y kernels Triton fusionados propios.

La innovacion tecnica esta en la gestion de memoria y el compute. El backend Stream usa paginacion y transferencia por streaming de pesos para mantener un pico de VRAM de unos 4,0-4,2 GiB, mientras que el backend Fast usa kernels Triton fusionados (FC1+FC2 y QK-RoPE) con presupuesto explicito de registros (148 registros) para maximizar el rendimiento en arquitecturas Ada. La ejecucion es por etapas: el frontend de condicionamiento (Qwen3-VL INT8 y ClipProj) se ejecuta y se descarga por completo antes de cargar el backbone DiT, con un pico de unos 1,6 GiB en PyTorch. La geometria de frames sigue la formula de compresion temporal N = 17k + 5 a 24 fps: 5 s equivalen a 124 frames nativos (120 exportados), 10 s a 243 (240) y 15 s a 362 (360). No se detallan en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset original de MiniMax H3.

## Capacidades

- Generacion de video a partir de texto (text-to-video) e imagen a video (image-to-video) con audio nativo sincronizado.
- Generacion audiovisual conjunta: los latentes de video y audio se muestrean juntos y se decodifican con VAE separados.
- Soporte de multiples resoluciones y relaciones de aspecto verificadas: 832x480 (16:9), 960x544 (16:9), 480x832 (9:16 vertical), 624x624 (1:1) y 720x544 (4:3), con exigencia de que ancho y alto sean multiplos de 16.
- Duraciones alineadas a la formula temporal de H3: 5 s, 10 s y 15 s (y en general N = 17k + 5 frames a 24 fps).
- Generacion en modo few-step (4 u 8 pasos) gracias al adaptador Turbo LoRA destilado.
- Variante Ref2VA (referencia multi-personaje a video) mediante intercambio de backbone y LoRA (Kutches/minmax y el LoRA Ref2V 768p de lightx2v).
- Ejecucion en GPUs de consumo y de datacenter: Turing, Ampere, Ada y hardware de centro de datos.
- Integracion con flujos ComfyUI y CozyUI, ademas de CLI propia.
- No se documentan en la informacion disponible capacidades de tool calling, agentes ni modo thinking; no es un modelo de lenguaje general.

## Casos de uso

- Generacion de clips publicitarios cortos en estaciones de trabajo con GPU de consumo: un clip de 5 s a 832x480 se genera en unos 161 s en una RTX 4060 Laptop de 8 GB con el backend Fast a 4 pasos, lo que permite iterar creativamente sin acceso a GPUs de datacenter.
- Prototipado de video vertical para redes sociales: la resolucion 480x832 (9:16) esta verificada empiricamente, y el backend Stream permite ejecutarlo en GPUs de 6-8 GB.
- Creacion de video con audio nativo para demos de producto: al muestrear video y audio de forma conjunta, se evita el paso separado de doblaje o sonorizacion en piezas de 5-15 s.
- Flujos ComfyUI en estudios pequenos: la integracion con ComfyUI y CozyUI permite incorporar el runtime a grafos existentes de generacion de video sin reescribir el pipeline.
- Investigacion sobre eficiencia de inferencia: el codigo de kernels Triton fusionados y el contrato de backend (`.agents/skills/h3-gpu-backend-porting/`) sirven como base para portar la optimizacion a otras arquitecturas NVIDIA o presupuestos de memoria.
- Generacion de video largo en una sola pasada: el runtime completa 15 s a 832x480 en 694,70 s con 6.995 MiB de pico en una RTX 4060 Laptop, util para secuencias narrativas breves en hardware limitado.
- Evaluacion de modelos de video en entornos con VRAM restringida: el backend Stream (unos 4,1 GiB de pico) permite desplegar el modelo en GPUs de 6 GB o en instancias cloud economicas.

## Benchmarks y rendimiento

Datos de rendimiento medidos por el autor (tiempos de pared reales y picos de VRAM):

| Tarea y configuracion | GPU | Backend | Pasos | Tiempo (s) | VRAM pico (MiB) |
|---|---|---|---:|---:|---:|
| 5 s FL2VA (832x480), linea base upstream | Tesla T4 16 GB | PyTorch sin modificar | 8 | 2.287,90 | 14.649 |
| 5 s FL2VA (832x480) | Tesla T4 16 GB | Stream (paginacion) | 8 | 670,12 (suma de etapas) | 4.181 |
| 5 s FL2VA (832x480) | Tesla T4 16 GB | Stream (paginacion) | 4 | 227,18 (cond. cacheada) | 4.043 |
| 5 s FL2VA (832x480) | RTX 4060 Laptop 8 GB | Ada Fast (fusionado, 148 regs) | 4 | 161,54 (cond. cacheada) | 5.695 |
| 5 s FL2VA (960x544) | RTX 4060 Laptop 8 GB | Ada Fast (fusionado, 148 regs) | 4 | 217,07 | 7.088 |
| 15 s FL2VA (832x480), una pasada | RTX 4060 Laptop 8 GB | Ada Fast (fusionado, 148 regs) | 4 | 694,70 | 6.995 |

No se han publicado resultados de benchmarks de calidad (FVD, CLIP score, metricas de audio, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 4,0-4,2 GiB con el backend Stream; unos 5,7-7,1 GiB con el backend Fast segun resolucion y duracion (medido en RTX 4060 Laptop 8 GB).
- GPUs verificadas: Tesla T4 16 GB (Turing) y RTX 4060 Laptop 8 GB (Ada). El autor indica compatibilidad con GPUs de 6, 8, 12 y 16 GB en arquitecturas Turing, Ampere, Ada y datacenter.
- Cabe en GPU de consumo: si, con el backend Stream en GPUs de 6-8 GB y con el backend Fast en GPUs de 8 GB o mas.
- Opciones de despliegue: CLI propia del repositorio (con `uv sync` y `scripts/fetch_weights.py`), ComfyUI y CozyUI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusion de video.
- Latencia y throughput: 161,54 s para 5 s de video a 832x480 con 4 pasos en RTX 4060 Laptop (backend Fast); 227,18 s con 4 pasos en Tesla T4 (backend Stream); 694,70 s para 15 s de video en RTX 4060 Laptop.
- Almacenamiento: los seis pesos upstream suman aproximadamente 23,7 GB (12,54 + 1,96 + 3,17 + 0,61 + 5,37 + 0,03 GB), con verificacion SHA-256 en la descarga.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| H3 Turbo Runtime (este) | Runtime de inferencia sobre MiniMax H3 | no disponible (DiT W4A8 de 12,54 GB) | clips de 5-15 s, 24 fps | 5 s en 161,54 s (RTX 4060 Laptop, 4 pasos) | minimax-h3-community-license | Repositorio de runtime; pesos en repos upstream |
| MiniMaxAI/MiniMax-H3 (upstream) | Modelo de generacion audiovisual | no disponible | no disponible | 5 s en 2.287,90 s (T4, 8 pasos, PyTorch sin modificar) | minimax-h3-community-license | Hugging Face |
| lightx2v/Minimax-h3-Turbo | Adaptador few-step LoRA sobre H3 | 1,96 GB (BF16) | no disponible | no disponible | no disponible | Hugging Face |
| joeygambino/MiniMax-H3-comfy-native-fl2va | Backbone DiT cuantizado W4A8 para ComfyUI | 12,54 GB en disco | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a componentes del mismo ecosistema porque no se dispone de datos de benchmarks de otros modelos de video con audio nativo en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no distribuye pesos: la inferencia depende de seis checkpoints upstream de terceros; si esos repositorios cambian o desaparecen, el runtime deja de funcionar tal cual.
- La licencia es la minimax-h3-community-license, no una licencia permisiva estandar; es necesario revisar sus terminos antes de cualquier uso comercial.
- Solo se declaran idiomas en y zh; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion visual y artefactos propios de los modelos de difusion: incoherencias temporales, deformaciones y desincronizacion audio-video, especialmente en resoluciones altas o duraciones largas.
- La cuantizacion W4A8 y la destilacion few-step (4-8 pasos) pueden degradar la calidad respecto al modelo completo con mas pasos; no se publican metricas de calidad que lo cuantifiquen.
- Restricciones geometricas estrictas: ancho y alto deben ser multiplos de 16 y la duracion debe seguir N = 17k + 5 frames a 24 fps.
- El backend Fast esta optimizado con presupuesto de registros para arquitecturas Ada (148 registros); el rendimiento en otras arquitecturas requiere portar y validar el backend segun el contrato documentado.
- Los tiempos medidos corresponden a hardware concreto (Tesla T4, RTX 4060 Laptop) y no deben extrapolarse sin verificacion.
- El proyecto es muy reciente (creado el 2026-11-22) y sin descargas ni likes, por lo que la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Hugging Face: https://huggingface.co/quifox/H3-Turbo-Runtime
- Repositorio GitHub: https://github.com/quifox/H3-Turbo-Runtime
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Adaptador Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Backbone DiT W4A8: https://huggingface.co/joeygambino/MiniMax-H3-comfy-native-fl2va
- VAE de video: https://huggingface.co/Kijai/MiniMax-H3-experimental
- VAE de audio: https://huggingface.co/Comfy-Org/MiniMax-H3
- Codificador de texto: https://huggingface.co/Stick9190/qwen3vl_4b_int8_convrot
- Capa de proyeccion: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3
- Backbone alternativo Ref2VA: https://huggingface.co/Kutches/minmax
