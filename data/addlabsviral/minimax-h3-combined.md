# addlabsviral/minimax-h3-combined

## Resumen

MiniMax-H3 Combined es una build de despliegue del modelo generativo MiniMax-H3, publicado por el usuario addlabsviral bajo el identificador `addlabsviral/minimax-h3-combined`. No es un modelo entrenado desde cero, sino una reempaquetado optimizado del checkpoint base `MiniMaxAI/MiniMax-H3` en formato diffusers modular, pensado para ejecutarse en Spaces de Hugging Face con ZeroGPU. El modelo resuelve la generacion conjunta de video y pista de audio sincronizada en una sola pasada de denoising, cubriendo tareas de text-to-video, image-to-video, video-to-video y sus variantes con audio.

La build integra tres optimizaciones principales: el Turbo LoRA de `larryvrh/MiniMax-H3-Turbo-Lora` fusionado directamente en los pesos bf16 del transformer (permitiendo inferencia en 4 pasos en lugar de 30), el text encoder Qwen3-VL cuantizado a 8 bits con bitsandbytes LLM.int8 (reduciendo el conditioner de 62 GiB bf16 a un unico safetensors de 34,9 GB) y un paquete AoTI (Ahead-of-Time Inductor) de los bloques del transformer compilado para tarjetas sm120 con torch 2.11.

El repositorio ocupa 427,2 GB en total, aunque el checkpoint efectivo de despliegue ronda los 112 GB, lo que lo mantiene por debajo de la cuota de 150 GB por Space de Hugging Face. La relevancia actual radica en que demuestra un patron practicable de servir generacion video-audio multimodal de gran tamano en infraestructura compartida, con una reduccion de latencia de aproximadamente 5,5 minutos a unos 40 segundos por clip de 5 segundos a 960x544 y 124 frames.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de 50 bloques (MiniMax-H3), con VAE de video y VAE de audio separados y conditioner Qwen3-VL |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible (el conditioner Qwen3-VL procesa el prompt; no se especifica ventana) |
| Tipos de cuantizacion | bf16 (transformer), 8-bit bitsandbytes LLM.int8 (text encoder, threshold 6.0), float32 sin cuantizar (VAE de video y audio) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (transformer en 14 shards + index, text encoder en un unico safetensors), AoTI `.pt2` para los bloques compilados |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un transformer de difusion de 50 bloques que genera video y audio sincronizado en una unica pasada de denoising, con decodificacion posterior mediante un VAE de video y un VAE de audio independientes. El conditioner de texto es Qwen3-VL, que en esta build se sirve cuantizado a 8 bits. La inferencia esta destilada con guidance, de modo que no se emplea CFG ni prompt negativo: cada paso es un unico forward pass. La salida de video es a 24 fps y el numero de frames debe seguir la forma `17 * n + 5` (rango de 2 a 15 segundos).

Sobre el entrenamiento original no se proporcionan datos en la informacion disponible (numero de tokens, composicion del dataset, uso de RLHF o DPO). La innovacion tecnica de esta build concreta es de optimizacion de despliegue: el Turbo LoRA `minimax_h3_turbo_4step_ema_ckpt850` (ronda EMA final, nitido a 4 pasos) se fusiona en los pesos bf16 mediante `scale * (lora_B @ lora_A)` sumado en cada proyeccion objetivo (tercios de QKV fusionado, intercambio gate/value de SwiGLU y filas de AdaLN), eliminando la necesidad de cargar un adaptador en tiempo de ejecucion. Ademas, el paquete AoTI exporta un unico `MiniMaxH3TransformerBlock` con dimension de secuencia dinamica, compartido de forma identica por los 50 bloques, lo que elimina aproximadamente 0,5 s por paso de overhead de lanzamiento de kernels y epilogo. Este paquete esta compilado especificamente para tarjetas RTX PRO 6000 (sm120) con torch 2.11; en otras tarjetas el modelo cae a modo eager de forma segura.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de imagen (image-to-video).
- Generacion condicionada por imagen y texto simultaneamente (image-text-to-video).
- Transformacion de video existente (video-to-video).
- Generacion conjunta de video y audio sincronizado desde texto (text-to-audio-video).
- Generacion conjunta desde imagen (image-to-audio-video) y desde imagen mas texto (image-text-to-audio-video).
- Transformacion de video con audio (video-to-audio-video).
- Generacion desde audio de entrada (audio-to-audio-video).
- Referencia a audio-video (reference-to-audio-video).
- Inferencia en 4 pasos por destilacion Turbo (6 pasos como ajuste de confort, 28 pasos como fallback sin turbo).
- Sin CFG ni prompt negativo: una unica pasada por paso.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso agentico; el modelo es generativo audiovisual, no un LLM de proposito general.

## Casos de uso

- Prototipado rapido de clips audiovisuales en Spaces de Hugging Face: gracias a los 112 GB de checkpoint efectivo y al patron de split en dos Spaces (conditioner y denoiser/reconstructor), cabe en la tarjeta ZeroGPU de 95 GiB y produce un clip de 5 segundos en unos 40 segundos, lo que permite iterar sobre prompts en una interfaz publica.
- Generacion de video con locucion o ambiente sincronizado para redes sociales: el modelo produce video y pista de audio en una sola pasada, adecuado para clips cortos de 2 a 15 segundos a 24 fps sin necesidad de alinear audio y video en postproduccion.
- Creacion de material de previsualizacion para produccion audiovisual: a partir de una imagen de referencia (image-to-audio-video) se generan animaticos con sonido para validar planos antes de rodar.
- Reestilizado o doblaje de video existente: las variantes video-to-video y video-to-audio-video permiten transformar metraje ya rodado y regenerar la pista de audio asociada.
- Generacion condicionada por audio para doblaje o musicalizacion: la variante audio-to-audio-video permite partir de una pista de audio y generar el video correspondiente, util para videoclips o contenido sincronizado con una banda sonora dada.
- Demostraciones educativas y de investigacion en generacion multimodal: el formato diffusers modular y el paquete AoTI facilitan estudiar el efecto de la fusion de LoRA, la cuantizacion del conditioner y la compilacion de bloques en latencia y calidad.
- Despliegue en infraestructura compartida con cuotas de almacenamiento: el empaquetado en subcarpetas con `modular_model_index.json` permite cargar solo las particiones necesarias en cada mitad del patron split, util para equipos con presupuesto limitado de GPU.

## Benchmarks y rendimiento

La model card incluye mediciones de latencia realizadas en ZeroGPU (rtx-pro-6000, bf16, todos los componentes residentes):

| Metrica | 30 pasos (base) | 4 pasos (esta build) |
|---|---|---|
| Denoising, 960x544 x 124 frames | ~5,5 min | ~40 s |
| Condicionamiento (Qwen3-VL 8-bit) | ~45 s | ~45 s |
| Arranque en frio (descarga de 112 GB) | no aplica | unos minutos con Xet en caliente |

No se han publicado resultados de benchmarks de calidad (FVD, CLIP score, metricas de sincronizacion audio-video u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint de despliegue ronda los 112 GB; cada mitad del patron split encaja en la tarjeta ZeroGPU de 95 GiB. El transformer es bf16, el conditioner 8-bit (34,9 GB) y los VAE float32.
- GPU recomendadas: RTX PRO 6000 (sm120) para aprovechar el paquete AoTI compilado; en otras GPU el modelo funciona en modo eager, con mayor latencia por paso.
- Cabe en GPU de consumo: no disponible para el checkpoint completo; el modelo completo no cabe en una RTX 4090 (24 GB) ni en tarjetas consumer de gama alta. Solo seria viable mediante el patron split en infraestructura con 95 GiB o superior.
- Opciones de despliegue: diffusers con `MiniMaxH3ModularPipeline` (libreria `minimax-h3`), Spaces de Hugging Face con ZeroGPU, patron split conditioner + denoiser/reconstructor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 40 s de denoising para un clip de 5 s a 960x544 y 124 frames en 4 pasos, mas unos 45 s de condicionamiento; el arranque en frio requiere descargar 112 GB (unos minutos con Xet en caliente).
- Dependencias: `bitsandbytes` y `transformers==5.8.0` para la carga del conditioner cuantizado; torch 2.11 para el paquete AoTI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 Combined (esta build) | no disponible | clips de 2 a 15 s, `17 * n + 5` frames a 24 fps | video + audio sincronizado | MiniMax-H3 Community License | Hugging Face, 112 GB efectivos |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | video + audio sincronizado | MiniMax-H3 Community License | Hugging Face |
| larryvrh/MiniMax-H3-Turbo-Lora | LoRA (adaptador) | no aplica | adaptador sobre base | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos de generacion video-audio en la informacion proporcionada, por lo que no se puede establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia es la MiniMax-H3 Community License Agreement, que no es una licencia open source estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- El paquete AoTI esta compilado especificamente para tarjetas RTX PRO 6000 (sm120) con torch 2.11; en otro hardware se pierde la aceleracion y se ejecuta en modo eager.
- La cuantizacion 8-bit del conditioner puede introducir degradacion en la fidelidad del prompt respecto al bf16 original; el backup bf16 completo esta en el repositorio privado del autor.
- El modelo esta disenado para 4 pasos; 6 es el ajuste de confort y 28 el fallback sin turbo. Usar menos pasos o pasos intermedios puede degradar la calidad.
- El numero de frames debe seguir la forma `17 * n + 5`; otras longitudes no estan soportadas.
- No hay datos publicados sobre sesgos, idiomas soportados ni tasas de alucinacion o artefactos generativos.
- El repositorio ocupa 427,2 GB en total; solo el checkpoint de despliegue de 112 GB es apto para Spaces con cuota de 150 GB.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo no sustituye a un LLM de proposito general.
- El autor del repositorio no es el desarrollador original del modelo; se trata de una build de terceros sobre el checkpoint de MiniMaxAI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/addlabsviral/minimax-h3-combined
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Turbo LoRA: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Backup bf16 completo (privado): https://huggingface.co/addlabsviral/minimax-h3-combined-bkup
