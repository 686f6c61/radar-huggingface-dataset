# mlx-community/LongCat-Video-Avatar-1.6-bf16

## Resumen

LongCat-Video-Avatar-1.6-bf16 es la conversión a Apple MLX del modelo LongCat-Video-Avatar-1.6, desarrollado originalmente por meituan-longcat. Se trata de un modelo de generación de vídeo condicionado por audio que produce vídeos de avatar parlante (talking-avatar) a partir de una imagen de referencia, una pista de audio con voz y un prompt textual. El repositorio de mlx-community empaqueta los pesos en bf16 y adapta el pipeline para su ejecución nativa en Apple Silicon mediante la librería MLX.

La arquitectura se basa en un Diffusion Transformer (DiT) que actúa como backbone de difusión, complementado por un codificador de texto umT5, un codificador de audio Whisper y un VAE para la decodificación de vídeo. La inferencia emplea un esquema de destilación en dos fases: los pasos 1 a 4 del muestreo usan el LoRA DMD y los pasos 5 a 8 el LoRA OPSD, con un total de 8 pasos de denoising. Esta configuración reduce el coste computacional frente a un muestreo de difusión completo.

El modelo resulta relevante para desarrolladores que trabajan en generación de vídeo con avatares sobre hardware Apple, ya que permite ejecutar un pipeline de image-to-video condicionado por audio sin depender de GPUs NVIDIA. El repositorio ocupa 49,0 GB y se distribuye bajo licencia MIT, lo que facilita su uso comercial. Los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con codificador de texto umT5, codificador de audio Whisper y VAE de vídeo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (única variante publicada en este repositorio) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, bf16) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión latente para vídeo: un DiT procesa los latentes del VAE condicionado por embeddings de texto (umT5) y de audio (Whisper), y el VAE decodifica el resultado en fotogramas. La conversión MLX mantiene el DiT en bf16 sin fusionar ningún LoRA en los pesos base, ya que el modelo original alterna entre dos adaptadores durante el proceso de denoising. Ambos LoRA (`dmd_lora.safetensors` y `opsd_lora.safetensors`, correspondientes a `loraA` y `loraB` del modelo upstream) se ejecutan como rutas laterales con la forma `base(x) + up(down(x)) * scale`, y `pipeline_config.json` define qué adaptador está activo en cada paso.

El muestreo consta de 8 pasos: los pasos 1 a 4 ejecutan el LoRA DMD y los pasos 5 a 8 el LoRA OPSD, replicando la configuración upstream `--mix_steps=4 --mix_alpha=1.0`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La destilación en dos fases es la innovación técnica principal documentada, orientada a reducir el número de pasos de muestreo necesarios.

## Capacidades

- Generación de vídeo de avatar parlante a partir de una imagen de referencia, una pista de audio y un prompt de texto.
- Sincronización labial audio-vídeo mediante el codificador Whisper como condicionamiento de audio.
- Generación image-to-video con control textual del resultado.
- Muestreo destilado en 8 pasos con conmutación de LoRA a mitad del denoising.
- Soporte de prompts en inglés y chino.
- Ejecución nativa en Apple Silicon mediante MLX, con API en Python y en Swift.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general ni audio de salida.

## Casos de uso

- Creación de avatares virtuales para vídeo corporativo: a partir de una fotografía del ponente y una locución grabada, el modelo genera un vídeo con sincronización labial para formación interna o comunicación institucional, ejecutándose en un Mac con Apple Silicon.
- Prototipado de asistentes conversacionales con cara visible: integración del pipeline image-to-video en una aplicación de chat para producir respuestas en vídeo de un personaje concreto, usando el codificador Whisper para alinear el habla generada.
- Localización de contenido audiovisual: regeneración de la parte visual de un presentador con una pista de audio doblada al inglés o al chino, aprovechando el soporte de ambos idiomas en los prompts.
- Producción de contenido para redes sociales: generación de clips cortos de un avatar a partir de guiones de texto y voces sintetizadas, con un coste de muestreo reducido gracias a los 8 pasos destilados.
- Pruebas de concepto en investigación sobre avatares: uso del repositorio MLX para experimentar con la conmutación DMD/OPSD por paso y analizar su efecto en la calidad del vídeo sin necesidad de GPUs NVIDIA.
- Desarrollo de aplicaciones macOS/iOS: integración mediante la librería Swift `longcat-avatar-mlx-swift` para ofrecer generación de avatares en local dentro del ecosistema Apple.
- Docencia y demostraciones técnicas: ejecución del pipeline completo en un portátil Apple Silicon para ilustrar difusión latente condicionada por audio en entornos sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de pesos ocupa 49,0 GB en bf16, por lo que se requiere memoria unificada suficiente para cargar DiT, LoRA, umT5, Whisper y VAE.
- GPU recomendadas: el modelo está pensado para Apple Silicon (MLX); no se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en consumer GPU: no disponible para GPUs de consumo; en Apple Silicon depende de la memoria unificada del equipo, que debe acomodar los 49,0 GB de pesos más los estados intermedios.
- Opciones de despliegue: MLX con Python (`xocialize/longcat-avatar-mlx`) y MLX con Swift (`xocialize/longcat-avatar-mlx-swift`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongCat-Video-Avatar-1.6-bf16 (MLX) | no disponible | no disponible | Image-to-video con audio | MIT | Hugging Face, MLX |
| meituan-longcat/LongCat-Video-Avatar-1.6 | no disponible | no disponible | Image-to-video con audio | no disponible en la informacion | Hugging Face (modelo base) |
| Otras conversiones MLX de la familia LongCat (1.5) | no disponible | no disponible | Image-to-video con audio | no disponible en la informacion | Hugging Face, MLX |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se publica la variante bf16; no hay cuantizaciones de menor precisión en este repositorio, lo que limita el despliegue en equipos con memoria unificada reducida.
- El modelo está orientado exclusivamente a Apple Silicon mediante MLX; no es directamente utilizable en GPUs NVIDIA sin reconversión.
- Idiomas soportados limitados a inglés y chino, tanto en prompts como en el condicionamiento de audio.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de calidad del vídeo generado.
- Riesgo de artefactos visuales y desincronización labial en audios con ruido, voces superpuestas o idiomas distintos de los soportados.
- Uso comercial permitido por la licencia MIT, pero conviene verificar las condiciones del modelo base upstream antes de producción.
- La alternancia de LoRA por paso exige respetar la programación de `pipeline_config.json`; modificarla puede degradar la calidad del resultado.
- No se dispone de información sobre el dataset de entrenamiento, lo que dificulta evaluar riesgos de contenido y sesgos demográficos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/LongCat-Video-Avatar-1.6-bf16
- Modelo base upstream: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Implementación Python: https://github.com/xocialize/longcat-avatar-mlx
- Implementación Swift: https://github.com/xocialize/longcat-avatar-mlx-swift
- Script de conversión: https://github.com/xocialize/longcat-avatar-mlx/blob/main/recipes/convert_longcat_avatar.py
