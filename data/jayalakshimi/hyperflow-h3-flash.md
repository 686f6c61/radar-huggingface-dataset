# jayalakshimi/hyperflow-h3-flash

## Resumen

HyperFlow H3 Flash es una versión comprimida y de pocos pasos (few-step) del modelo MiniMax-H3, desarrollada por Video Rebirth. Se trata de un modelo de generación conjunta de vídeo y audio estéreo sincronizado que reduce el transformer original de aproximadamente 31B parámetros a unos 13,9B, menos de la mitad, manteniendo la capacidad de producir clips de 5,2 a 15 segundos a 24 fps en resolución 1344×768 con una pista de audio estéreo a 32 kHz. Funciona con 4, 6 u 8 pasos de muestreo sin classifier-free guidance (CFG), siendo 6 el valor por defecto.

El modelo se distribuye en dos particiones según la tarea: `fl2va` (texto a vídeo+audio y primer/último fotograma a vídeo+audio) con 13,7B parámetros, y `ref2va` (referencia a vídeo+audio, hasta 12 referencias) con 13,9B parámetros. Está pensado para ejecutarse en GPUs de consumo: la cuantización Q4_K_M ocupa 9,1 GB y la Q8_0 14,9 GB, lo que permite inferencia en GPUs RTX de 24 GB y 32 GB con 16 GB de RAM de sistema. En cuanto a velocidad, un clip de 5,2 segundos a 6 pasos tarda 8,7 segundos en 4× B200, 36 segundos en 1× H200 y 92 segundos en una RTX 5090.

La relevancia actual del modelo radica en su enfoque de compresión agresiva combinada con destilación few-step, que acerca la generación de vídeo con audio sincronizado a hardware de consumo, además de ofrecer múltiples formatos de pesos (GGUF, INT8 convrot) y soporte para ComfyUI, stable-diffusion.cpp y Unsloth Studio. La licencia, sin embargo, impone restricciones territoriales importantes que condicionan su uso comercial en la Unión Europea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (derivado de MiniMax-H3), variantes `fl2va` y `ref2va` |
| Parámetros totales | 13.946.322.616 (13,9B en `ref2va`; 13,7B en `fl2va`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF de `Q3_K_M` a `Q8_0` (6 niveles, 7,2–15,2 GB); W8A8 INT8 convrot (~16 GB); `nvfp4_awq`, `int8_convrot` y `bf16` para el text encoder |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license-agreement (restricciones territoriales: no licenciado en UE, Reino Unido, Corea del Sur ni EE. UU. sin autorización previa de MiniMax) |
| Formato de pesos | safetensors (INT8 convrot, dividido en 3–4 shards), GGUF (6 niveles), archivos únicos para ComfyUI |

## Arquitectura y entrenamiento

HyperFlow H3 Flash es una destilación few-step del transformer de difusión de MiniMax-H3. El modelo original ronda los 31B parámetros; esta versión comprimida reduce el transformer a 13,7B (`fl2va`) o 13,9B (`ref2va`). La generación es conjunta de vídeo y audio: el pipeline combina un text encoder basado en Qwen3-VL-32B-Instruct, un VAE de vídeo (`minimax_h3_video_vae_fp16`) y un VAE de audio (`minimax_h3_audio_vae_fp32`), que se cargan desde los repositorios upstream (MiniMaxAI/MiniMax-H3 o Comfy-Org/MiniMax-H3). El repositorio solo contiene los transformers comprimidos (`transformer` para `fl2va`, `transformer_ref` para `ref2va`).

La innovación principal es la destilación a pocos pasos: el modelo funciona con 4, 6 u 8 pasos de muestreo sin CFG, lo que reduce drásticamente el coste computacional frente a la inferencia de difusión estándar. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y si se empleó RLHF o DPO no están disponibles en la información proporcionada. Existe también un LoRA de 8 pasos para el transformer completo de MiniMax-H3 (`VideoRebirthAI/hyperflow`), lo que sugiere que la técnica few-step se aplicó de forma consistente sobre la familia. El proyecto NVIDIA SOL-H3 proporciona aceleración de inferencia en tiempo real sobre 4 GPUs B-series.

## Capacidades

- Generación de vídeo con audio estéreo sincronizado a 32 kHz, en clips de 5,2 a 15 segundos a 24 fps y resolución por defecto de 1344×768.
- Texto a vídeo+audio (`t2va`): generación a partir de un prompt de texto.
- Primer fotograma a vídeo+audio (`fl2va`): condicionado por un keyframe inicial.
- Primer y último fotograma a vídeo+audio (`flf2v`): interpolación entre dos keyframes.
- Referencia a vídeo+audio (`ref2va`): condicionado por hasta 12 referencias; en Python acepta imágenes, vídeos y audio; en GGUF y ComfyUI INT8 solo imágenes.
- Muestreo few-step con 4, 6 u 8 pasos sin CFG (6 por defecto).
- Soporte multilingüe de prompts en inglés y chino.
- Integración con ComfyUI (plantillas `hyperflow_t2v`, `hyperflow_i2v`, `hyperflow_flf2v`, `hyperflow_ref2v`, con variantes `*_int8`), stable-diffusion.cpp y Unsloth Studio.
- No se menciona soporte de tool calling ni de agentes; no aplica a un modelo generativo de vídeo.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo con audio sincronizado en una sola pasada, lo que permite crear anuncios de 5 a 15 segundos a partir de un prompt o un keyframe sin pipeline separado de audio.
- Prototipado rápido de storyboards animados: con 92 segundos por clip de 5,2 segundos en una RTX 5090 y cuantización Q4_K_M de 9,1 GB, un estudio pequeño puede iterar visualmente en hardware de consumo.
- Interpolación de keyframes para animación: la tarea `flf2v` genera el vídeo intermedio entre un primer y un último fotograma, útil para completar transiciones en producción de animación.
- Vídeo con personajes o estilos de referencia: `ref2va` acepta hasta 12 referencias (imágenes, y en Python también vídeos y audio), adecuado para mantener consistencia de personaje o marca entre planos.
- Postproducción con audio generado: la pista estéreo a 32 kHz sincronizada con el vídeo sirve como base para doblaje, ambientes o efectos en flujos de edición.
- Despliegue en ComfyUI para artistas técnicos: las plantillas y los safetensors INT8 para ComfyUI permiten integrar el modelo en flujos nodales existentes en GPUs RTX de 24 GB o más.
- Inferencia en tiempo real en centro de datos: con NVIDIA SOL-H3 sobre 4× GPUs B-series, el modelo puede alimentar aplicaciones interactivas de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento proporcionados son de velocidad de inferencia:

| Escenario | Clip | Pasos | Tiempo |
|---|---|---|---|
| 4× B200 | 5,2 s | 6 | 8,7 s |
| 1× H200 | 5,2 s | 6 | 36 s |
| 1× RTX 5090 | 5,2 s | 6 | 92 s |
| 4× B-series (SOL-H3) | no disponible | no disponible | tiempo real |

## Requisitos de hardware

- VRAM estimada: Q4_K_M ocupa 9,1 GB y Q8_0 14,9 GB; el rango GGUF completo va de 7,2 a 15,2 GB. Los safetensors INT8 convrot ocupan aproximadamente 16 GB (16,0 GB para `fl2va` en ComfyUI, 16,4 GB para `ref2va`).
- GPUs medidas: RTX de 24 GB y 32 GB para GGUF e INT8 en ComfyUI. Las GPUs de 16 GB no se han medido todavía.
- GPUs de centro de datos: H100, H200, B200 y B300 (de 1 a 8 GPUs) para el paquete Python INT8 convrot.
- RAM de sistema: 16 GB o más para GGUF y para INT8 en ComfyUI. El paquete Python INT8 requiere unos 16 GiB sin offload, y 69 GiB o más con offload usando text encoder `fp8`, o 91 GiB o más con `bf16`.
- Opciones de despliegue: CLI `hyperflow-h3-flash` y `diffusers` (Python), ComfyUI, stable-diffusion.cpp y Unsloth Studio. El text encoder y los VAE se descargan de MiniMaxAI/MiniMax-H3, Comfy-Org/MiniMax-H3 o Qwen/Qwen3-VL-32B-Instruct-FP8 según el runtime; nunca se descarga el transformer base de 62 GB.
- Latencia y throughput: ver tabla de la sección de benchmarks (8,7 s en 4× B200, 36 s en 1× H200, 92 s en RTX 5090 para un clip de 5,2 s a 6 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperFlow H3 Flash | 13,7B (`fl2va`) / 13,9B (`ref2va`) | clips de 5,2–15 s, 24 fps, 1344×768 | 4, 6 u 8 sin CFG | minimax-h3-community-license-agreement (restricción territorial) | Hugging Face, ComfyUI, stable-diffusion.cpp, Unsloth |
| MiniMax-H3 (base) | ~31B (transformer) | no disponible | difusión estándar | minimax-h3-community-license-agreement | Hugging Face (MiniMaxAI/MiniMax-H3) |
| HyperFlow (LoRA 8 pasos sobre MiniMax-H3) | ~31B (transformer completo) | no disponible | 8 | no disponible | Hugging Face (VideoRebirthAI/hyperflow) |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo entre estas variantes; la comparación se limita a tamaño, pasos de muestreo y disponibilidad.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License Agreement restringe el territorio: no está licenciado en la Unión Europea, Reino Unido, Corea del Sur ni Estados Unidos sin autorización previa de MiniMax. Esto limita seriamente su uso comercial en España y la UE.
- Incluye una Acceptable Use Policy que condiciona los usos permitidos.
- El repositorio no es un producto oficial de MiniMax; es una versión de terceros (Video Rebirth) sobre el modelo base.
- Solo soporta prompts en inglés y chino; no hay soporte declarado de castellano.
- `ref2va` en GGUF y ComfyUI INT8 solo acepta imágenes como referencia; vídeos y audio requieren el paquete Python.
- Las GPUs de 16 GB no se han medido, por lo que el comportamiento en ese hardware es incierto.
- El paquete Python INT8 con offload exige mucha RAM de sistema (69–91 GiB), lo que puede ser un cuello de botella en estaciones de trabajo.
- No se han publicado datos sobre sesgos, tasa de alucinación visual o fidelidad de audio; no disponible.
- Riesgo inherente de artefactos y desviaciones del prompt en modelos de difusión de vídeo, no cuantificado en la información disponible.
- El repo ocupa 187,8 GB, lo que exige planificación de almacenamiento aunque solo se descarguen las variantes necesarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jayalakshimi/hyperflow-h3-flash
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio de código y flujos ComfyUI: https://github.com/Video-Rebirth/hyperflow-h3-flash
- LoRA HyperFlow de 8 pasos: https://huggingface.co/VideoRebirthAI/hyperflow
- GitHub del LoRA HyperFlow: https://github.com/Video-Rebirth/hyperflow
- Showcase de vídeo y audio: https://www.videorebirth.com/lp/hyperflow-flash
- Web de Video Rebirth: https://www.videorebirth.com/
- NVIDIA SOL-H3: https://github.com/NVlabs/Sana/tree/sol-engine/models/minimax_h3/HyperFlow-Flash
- Text encoder Qwen3-VL-32B-Instruct-FP8: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct-FP8
- Text encoder y VAE para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- GGUF para Unsloth Studio: https://huggingface.co/unsloth/MiniMax-H3-GGUF
