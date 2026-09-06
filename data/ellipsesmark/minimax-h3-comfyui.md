# EllipsesMark/MiniMax-H3-ComfyUI

## MiniMax H3 ComfyUI

## Resumen

MiniMax H3 ComfyUI es un reempaquetado de los pesos del modelo MiniMax-H3 (también conocido como Hailuo 3.0) realizado por EllipsesMark, con el objetivo de integrarlo directamente en ComfyUI. El repositorio no contiene un modelo entrenado desde cero, sino que organiza los archivos del modelo base MiniMaxAI/MiniMax-H3 en las carpetas esperadas por ComfyUI, incluyendo modelos de difusión, text encoder, VAE, LoRAs y embeddings.

Se trata de un modelo de generación de vídeo por difusión que admite tres modalidades: texto a vídeo (T2V), imagen a vídeo (I2V) y referencia a vídeo (R2V). Además, incorpora un VAE de audio que permite generar vídeo con sonido sincronizado. El repositorio tiene un tamaño de 471,0 GB e incluye múltiples variantes de cuantización para adaptarse a distintos hardware, así como LoRAs turbo que reducen el número de pasos de muestreo. Su relevancia actual radica en que facilita el uso de un modelo de vídeo de alta calidad dentro de un ecosistema open source como ComfyUI, sin necesidad de configuraciones manuales complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video (no especificada en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8_convrot, fp8_scaled (modelos de difusion); bf16, int8_convrot, nvfp4_awq (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio es un reempaquetado para ComfyUI, no un entrenamiento nuevo. Los archivos provienen de los repositorios originales MiniMaxAI/MiniMax-H3 y lightx2v/Minimax-h3-Turbo. Se incluyen dos variantes del modelo de difusion, denominadas fl2va y ref2va, cada una con versiones completas y podadas (pruned). Las versiones podadas reducen el numero de parametros manteniendo la funcionalidad principal. Tambien se ofrecen cuantizaciones int8_convrot y fp8_scaled para reducir el consumo de memoria.

El text encoder es Qwen3-VL-32B, disponible en bf16, int8_convrot y nvfp4_awq. La cuantizacion nvfp4_awq se convierte desde cybermotaz/Qwen3-VL-32B-Instruct-NVFP4 y no requiere GPU Blackwell. Para los modelos de difusion, el README recomienda usar int8_convrot si se dispone de PyTorch compilado con cu130; fp8_scaled queda como alternativa para entornos sin ese soporte.

El paquete incluye tres LoRAs turbo: fl2v_turbo_4step_v1.0_768p, fl2v_turbo_8step_v1.0 y ref2v_turbo_4step_v0.1. Estos LoRAs permiten reducir el numero de pasos de muestreo a 4 u 8, acelerando la generacion. Ademas, se proporcionan dos VAE: uno de audio (fp32) y otro de video (fp16), y diez embeddings de estilo preentrenados que se invocan en el nodo CLIPTextEncode de ComfyUI mediante la sintaxis `embedding:nombre`.

## Capacidades

- Generacion de video a partir de texto (T2V), imagen (I2V) y referencia (R2V).
- Audio nativo: el VAE de audio permite generar video con sonido sincronizado.
- Compatibilidad directa con ComfyUI: los archivos estan organizados para colocarse en las carpetas `diffusion_models`, `text_encoders`, `loras`, `vae` y `embeddings`.
- Soporte de embeddings de estilo: diez embeddings preentrenados (por ejemplo, `minimaxh3_bullet_time`, `minimaxh3_dark_magic`, `minimaxh3_four_seasons`) que se aplican mediante el nodo CLIPTextEncode.
- Optimizacion mediante LoRAs turbo: reducen el numero de pasos de muestreo a 4 u 8, lo que disminuye el tiempo de inferencia.
- Cuantizaciones flexibles: bf16, int8_convrot y fp8_scaled para adaptarse a distintos hardware.
- Text encoder Qwen3-VL-32B con cuantizacion nvfp4_awq, que no requiere GPU Blackwell.
- Workflows predefinidos para T2V, I2V y R2V disponibles en el repositorio de Comfy-Org.

## Casos de uso

- Generacion de clips para redes sociales: el modo T2V permite crear videos cortos de alta calidad a partir de descripciones textuales, con audio nativo incluido, ideal para contenido de plataformas como Instagram o TikTok.
- Animacion de fotografias: el modo I2V convierte imagenes fijas en secuencias de video con movimiento natural, util para producciones publicitarias o artisticas.
- Recreacion de movimientos de referencia: el modo R2V transfiere el movimiento de un video de referencia a un nuevo sujeto, permitiendo coreografias o acciones complejas sin necesidad de rodaje adicional.
- Integracion en pipelines de ComfyUI: los workflows predefinidos (T2V, I2V, R2V) facilitan el prototipado rapido y la automatizacion de tareas de generacion de video dentro de un entorno visual.
- Produccion audiovisual con estilos especificos: los embeddings de estilo permiten aplicar efectos como "bullet time", "dark magic" o "spiral ascent" a los videos generados, ampliando las posibilidades creativas.
- Creacion de contenido estereoscopico para VR: mediante la LoRA VR180 del mismo autor, el modelo puede generar video estereoscopico side-by-side para visores como Meta Quest, con resolucion 180x180 y 24 fps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de GitHub ai-models-lab/minimax-h3 menciona una matriz de comparacion entre MiniMax H3, Seedance 2.5, Wan 2.1, Kling AI, Sora y CogVideoX, pero no se proporcionan valores numericos en la informacion de la ficha. Para obtener datos de rendimiento, se recomienda consultar el repositorio original de MiniMaxAI/MiniMax-H3.

## Requisitos de hardware

- El repositorio completo ocupa 471,0 GB, lo que indica que el modelo en bf16 requiere un sistema con multiples GPUs de gama alta (por ejemplo, A100 o H100) o una estacion de trabajo con gran capacidad de almacenamiento.
- Las versiones cuantizadas (int8_convrot, fp8_scaled) reducen el consumo de VRAM, pero int8_convrot requiere PyTorch compilado con cu130.
- El text encoder nvfp4_awq no requiere GPU Blackwell, lo que permite utilizar la cuantizacion en GPUs mas antiguas.
- Para ejecutar el modelo en ComfyUI se necesita una GPU NVIDIA con suficiente VRAM y espacio en disco. No se proporcionan cifras exactas de VRAM en la informacion disponible.
- Opciones de despliegue: ComfyUI. No se mencionan vLLM, llama.cpp ni Ollama porque no son aplicables a modelos de difusion.

## Comparativa con modelos similares

No disponible en la informacion proporcionada. El repositorio de GitHub ai-models-lab/minimax-h3 incluye una comparativa cualitativa con Seedance 2.5, Wan 2.1, Kling AI, Sora y CogVideoX, pero sin datos numericos. Para una comparacion exhaustiva, se recomienda consultar el repositorio original de MiniMax-H3 en HuggingFace.

## Limitaciones y advertencias

- Licencia de comunidad (minimax-h3-community-license-agreement): debe revisarse el texto completo para conocer las restricciones de uso comercial.
- El modelo es un reempaquetado para ComfyUI; no incluye scripts de entrenamiento ni documentacion sobre el proceso de entrenamiento del modelo base.
- No se especifican sesgos ni riesgos de contenido. Como todo modelo de generacion de video, puede producir contenido no deseado o alucinaciones visuales.
- Las versiones cuantizadas pueden degradar ligeramente la calidad de salida en comparacion con bf16.
- El uso de int8_convrot requiere PyTorch compilado con cu130, lo que puede limitar la compatibilidad con entornos existentes.
- El repositorio tiene una fecha de creacion futura (2026-09-05), lo que sugiere que puede ser un artefacto o un error en los metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EllipsesMark/MiniMax-H3-ComfyUI
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Text encoder NVFP4: https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- Workflow T2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Workflow I2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Workflow R2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
- Documentacion de ComfyUI: https://docs.comfy.org/tutorials/video/minimax/minimax-h3
- GitHub de comparativas: https://github.com/ai-models-lab/minimax-h3
- LoRA VR180: https://huggingface.co/EllipsesMark/minimax-h3-vr180-sbs-lora
