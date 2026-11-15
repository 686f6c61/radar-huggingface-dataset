# infosave/FastH3-4-step-Preview-v1-VSA-cmf

## Resumen

FastH3-4-step-Preview-v1-VSA-cmf es un paquete de inferencia para generación de vídeo con audio (text-to-audio-video) derivado de FastH3, la destilación de MiniMax-H3 realizada por FastVideo hasta cuatro pasadas del transformer. El modelo original parte de MiniMax-H3 y se entrena con atención dispersa sobre tokens de vídeo: cada bloque de 4×4×4 tokens atiende únicamente al 10 % de bloques de vídeo con mayor puntuación, además de todo el texto y el audio. Este repositorio, publicado por infosave, empaqueta el DiT cuantizado a 4 bits, el encoder de prompt Qwen3-VL y ambos decodificadores (vídeo y audio estéreo) en un único archivo CMF para el motor en Rust `cortiq`, sin Python ni frameworks de ML.

La relevancia del paquete es de despliegue: el release upstream de FastVideo está pensado para cuatro GPU B200, mientras que esta versión ejecuta la inferencia en una sola RTX A5000 de 24 GB con CUDA (o sobre Vulkan y Metal). Genera un clip de 5 segundos a 1344×768 con sonido en 194 s en CUDA y un preview de 512×288 y 39 fotogramas en 22 s. El repositorio ocupa 41,1 GB y ofrece dos archivos: uno de 26,05 GB con Qwen3-VL-32B como encoder y otro de 14,98 GB con Qwen3-VL-4B más ClipProj.

No se dispone de información sobre el número de parámetros del DiT, la longitud de contexto ni los idiomas soportados en la documentación proporcionada. La licencia es la MiniMax H3 Community License, con restricciones territoriales y política de uso aceptable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con atención dispersa sobre vídeo (VSA), destilado a 4 pasos; encoder de prompt Qwen3-VL; decodificadores de vídeo y audio estéreo |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (DiT re-cuantizado a 4 bits; encoder de prompt Qwen3-VL en 4 bits); modulación de timestep almacenada como curva de rango 9 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License (`license: other`, `license_name: minimax-h3-community`) |
| Formato de pesos | CMF (archivo único para el motor `cortiq`) |

## Arquitectura y entrenamiento

El modelo subyacente es FastH3, una destilación de MiniMax-H3 hasta cuatro pasadas del transformer, entrenada con atención dispersa sobre tokens de vídeo. En cada bloque de 4×4×4 tokens de vídeo, la atención se restringe al 10 % de los bloques de vídeo con mayor puntuación, además de atender a todo el texto y el audio. El estudiante se entrenó con esta atención dispersa, de modo que desactivarla (`CMF_VSA=0`) no solo ralentiza la decodificación (204 s frente a 115,6 s en el clip de 5 segundos) sino que degrada la imagen hacia el final del clip según los ejemplos del autor. El paquete incorpora las puertas de atención dispersa entrenadas.

Este repositorio concreto no entrena el modelo: re-cuantiza el DiT a 4 bits, almacena la modulación de timestep como curva de rango 9 y empaqueta el encoder de prompt Qwen3-VL (Apache-2.0) junto con los decodificadores de vídeo y audio en un único archivo CMF. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable en múltiplos de 32 y reproducción a 24 fps.
- Generación conjunta de vídeo y audio estéreo (text-to-audio-video): el clip incluye banda sonora sincronizada, con salida en MJPEG AVI más un archivo WAV separado.
- Destilación few-step: cuatro pasos de denoising por defecto con el schedule propio del estudiante.
- Atención dispersa sobre vídeo (VSA) entrenada, configurable entre 10 % y 20 % de bloques de vídeo retenidos mediante `CMF_VSA_SPARSITY`.
- Ejecución sin Python ni framework de ML sobre CUDA, Vulkan y Metal mediante el motor `cortiq`.
- Dos variantes de encoder de prompt: Qwen3-VL-32B (4 bits) o Qwen3-VL-4B más ClipProj (4 bits).
- No se dispone de información sobre tool calling, uso como agente, capacidades multilingües ni modos de razonamiento.

## Casos de uso

- Previsualización rápida de ideas de vídeo: con el archivo `fasth3-clipproj4b-q4tp.cmf` se genera un clip de 512×288 y 39 fotogramas en 22 s en una RTX A5000, lo que permite iterar sobre prompts y semillas antes de lanzar renders a resolución completa.
- Producción de clips cortos con sonido para redes sociales: la generación conjunta de vídeo y audio estéreo en una sola pasada evita el paso separado de sonorización para piezas de hasta 5 segundos a 1344×768.
- Render en estación de trabajo de gama alta de consumo: con 17,3 GB de VRAM pico en CUDA a 1344×768, el paquete cabe en GPU de 24 GB como la RTX A5000, lo que permite generar vídeo con audio sin acceso a clústeres multi-GPU.
- Despliegue multiplataforma: gracias a los backends Vulkan y Metal, el mismo archivo CMF se ejecuta en Linux con Vulkan y en un Apple M4 de 24 GB (179 s para 512×288 y 39 fotogramas en Metal), útil para equipos heterogéneos.
- Integración en pipelines automatizados sin Python: el motor `cortiq` y el formato CMF permiten invocar la generación desde la CLI (`cortiq animate`) en scripts de CI o servicios en Rust, evitando dependencias de frameworks de ML.
- Generación de material de storyboard con audio de referencia: los clips de 5 segundos con diálogo o efectos sonoros descritos en el prompt (por ejemplo, un perro que ladra dos veces) sirven como referencia para equipos de animación y doblaje.
- Pruebas comparativas de atención dispersa: las variables `CMF_VSA` y `CMF_VSA_SPARSITY` permiten evaluar el impacto de la atención dispersa frente a la completa en calidad y latencia sobre el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor proporciona mediciones de latencia y VRAM pico, que se recogen a continuación.

Rendimiento en RTX A5000 (24 GB), CUDA, cuatro pasos, `fasth3-q4tp.cmf`:

| Clip | Encoder de prompt | Denoising | Decodificador de vídeo | Decodificador de audio | Total |
|---|---:|---:|---:|---:|---:|
| 512×288, 39 fotogramas | 2,7 s | 10,1 s | 3,7 s | 4,2 s | 22 s |
| 1344×768, 124 fotogramas (5 s) | 2,7 s | 115,6 s | 52,6 s | 11,8 s | 194 s |

Rendimiento en RTX A5000, Vulkan, `fasth3-q4tp.cmf`:

| Clip | Encoder de prompt | Denoising | Decodificador de vídeo | Decodificador de audio | Total | VRAM pico |
|---|---:|---:|---:|---:|---:|---:|
| 512×288, 39 fotogramas | 3,5 s | 10,4 s | 5,6 s | 4,3 s | 26 s | 12,6 GB |
| 1344×768, 124 fotogramas | 5,8 s | 182,8 s | 78,7 s | 14,1 s | 294 s | 20,6 GB |

Rendimiento en Apple M4 (24 GB), Metal, `fasth3-clipproj4b-q4tp.cmf`, 512×288, 39 fotogramas: encoder de prompt 0,6 s, denoising 128,5 s, decodificador de vídeo 47,2 s, decodificador de audio 2,2 s; total 179 s.

## Requisitos de hardware

- VRAM pico en CUDA: 13,7 GB para 512×288 y 17,3 GB para 1344×768, igual para ambos archivos CMF, ya que comparten DiT y decodificadores y las etapas se ejecutan de forma secuencial.
- VRAM pico en Vulkan (RTX A5000): 12,6 GB para 512×288 y 20,6 GB para 1344×768.
- GPU probada por el autor: RTX A5000 de 24 GB (CUDA y Vulkan) y Apple M4 de 24 GB (Metal).
- Cabe en GPU de consumo con 24 GB de VRAM; por debajo de esa cifra no se documentan resultados en la información disponible.
- Despliegue mediante el motor `cortiq`: `cargo install cortiq-cli --features cuda` para NVIDIA con driver y bibliotecas CUDA 12.x; sin `--features cuda` funciona sobre Vulkan con `CMF_GPU=1`; en Mac se ejecuta sobre Metal.
- Latencia y throughput: 22 s para 39 fotogramas a 512×288 y 194 s para 124 fotogramas a 1344×768 en CUDA; 26 s y 294 s respectivamente en Vulkan.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastH3-4-step-Preview-v1-VSA-cmf (este) | no disponible | no disponible | 5 s a 1344×768 con audio en 194 s en una RTX A5000 | MiniMax H3 Community | Hugging Face, formato CMF |
| FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree (upstream) | no disponible | no disponible | Requiere cuatro GPU B200 según el autor del paquete | MiniMax H3 Community | Hugging Face |
| MiniMaxAI/MiniMax-H3 (modelo base) | no disponible | no disponible | no disponible | MiniMax H3 Community | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de parámetros que permitan una comparación cuantitativa adicional con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia MiniMax H3 Community: incluye restricciones territoriales y política de uso aceptable; conviene revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- Los pesos son modificados respecto al original: DiT re-cuantizado a 4 bits y modulación de timestep como curva de rango 9, lo que puede introducir diferencias de calidad frente al modelo de referencia.
- El repositorio no está hecho ni respaldado por FastVideo ni por MiniMax.
- Desactivar la atención dispersa (`CMF_VSA=0`) ralentiza la decodificación y degrada la imagen hacia el final del clip, según los ejemplos del autor.
- La cuantización a 4 bits y el paquete CMF limitan el ecosistema de herramientas: la inferencia depende del motor `cortiq` y no de frameworks estándar como PyTorch, Diffusers o ComfyUI.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto.
- El autor solo documenta ejecución en GPU de 24 GB o superiores (RTX A5000, Apple M4); no hay datos de funcionamiento en hardware más modesto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/infosave/FastH3-4-step-Preview-v1-VSA-cmf
- Modelo base (FastVideo FastH3, DataFree): https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- Modelo original (MiniMax-H3): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Motor `cortiq` y formato CMF: https://github.com/infosave2007/cmf
- Ejemplo con audio (1344×768, 124 fotogramas): https://huggingface.co/infosave/FastH3-4-step-Preview-v1-VSA-cmf/resolve/main/samples/beach_full.mp4
- Comparativa de ambos archivos CMF con el mismo prompt: https://huggingface.co/infosave/FastH3-4-step-Preview-v1-VSA-cmf/resolve/main/samples/ab_full.mp4
- Comparativa con el archivo pequeño: https://huggingface.co/infosave/FastH3-4-step-Preview-v1-VSA-cmf/resolve/main/samples/ab_clip.mp4
- Atención dispersa frente a atención completa: https://huggingface.co/infosave/FastH3-4-step-Preview-v1-VSA-cmf/resolve/main/samples/vsa_vs_full_attention.png
