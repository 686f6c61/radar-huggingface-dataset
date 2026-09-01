# r3lax/MiniMax-H3-Turbo-cmf

## Resumen

MiniMax-H3-Turbo-cmf es un modelo de generación de vídeo con audio estéreo sincronizado, empaquetado en un contenedor CMF (un único archivo mapeado en memoria) que integra el transformer de difusión (DiT), el codificador de prompts Qwen3-VL, el decodificador VAE de vídeo y el vocoder de audio. Está basado en el modelo MiniMax-H3 de Comfy-Org y en la LoRA Turbo de larryvrh, que se fusiona directamente en los pesos, reduciendo el muestreo a 4 pasos. El resultado es un solo archivo de entre 13 y 27 GB según la variante, que se ejecuta con `cortiq`, un binario Rust sin dependencias de Python, PyTorch, CUDA o ffmpeg.

El modelo resuelve el problema de la complejidad de despliegue de los generadores de vídeo multimodales: en lugar de gestionar múltiples archivos de pesos y una instalación de ComfyUI (124.4 GB en referencia), ofrece una distribución autocontenida con verificación de integridad por tensor. Con 47.83 mil millones de parámetros y cuantización de 4 u 8 bits, permite generar clips de 512×288 píxeles y 39 frames con audio sincronizado en tarjetas gráficas de consumo (a partir de 16 GB de VRAM). Su relevancia actual reside en que acerca la generación de vídeo-audio de alta calidad a entornos de producción sin infraestructura especializada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con flujos de programación duales para vídeo y audio; codificador de prompts Qwen3-VL (variante 32B o 4B según archivo), VAE de vídeo y vocoder de audio |
| Parametros totales | 47.83 B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el codificador Qwen3-VL procesa el prompt; no se especifica ventana) |
| Tipos de cuantizacion | 4-bit (q4tp), 8-bit (q8_2f); existe una variante 2-bit (q2tp) no recomendada |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (contenedor propietario de cortiq, con memoria mapeada y hash por tensor) |

## Arquitectura y entrenamiento

El modelo emplea un único transformer que denoisa simultáneamente la secuencia de vídeo y audio en un paquete conjunto, siguiendo dos flujos de programación (flow schedules) independientes. El codificador de prompts Qwen3-VL convierte el texto (y opcionalmente imágenes) en tokens de condicionamiento; en las variantes `fl2va`, la torre de visión procesa la imagen de entrada y genera 144 tokens de visión para un prompt de ejemplo de 168 tokens. El decodificador VAE reconstruye los frames de vídeo y el vocoder sintetiza el audio estéreo. La LoRA Turbo de larryvrh está fusionada en los pesos, por lo que el archivo ya es el modelo de 4 pasos de muestreo, sin necesidad de cargar adaptadores adicionales.

No se proporcionan detalles sobre los datos de entrenamiento, el número de tokens procesados ni métodos de alineación como RLHF o DPO. El modelo base MiniMax-H3 (Comfy-Org) genera vídeo 2K con audio 3D estereofónico, y la LoRA Turbo fue entrenada para acelerar el muestreo manteniendo la calidad. Técnicamente, la cuantización 4-bit (`q4tp`) incluye kernels fusionados para acelerar la inferencia, mientras que la variante 8-bit (`q8_2f`) usa una representación int8 de dos campos sin kernels fusionados, priorizando la fidelidad de los pesos.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo sincronizado en el mismo paso de denoising.
- Generación de vídeo a partir de imagen (image-to-video) mediante keyframes: las variantes `fl2va` aceptan un primer y/o último frame en formato PPM P6, que condicionan la geometría y la composición.
- Condicionamiento dual de imágenes: el frame de entrada se inyecta tanto como latente VAE (fila de condicionamiento a un timestep propio) como a través de la torre de visión del codificador Qwen3-VL.
- Generación de audio sincronizado con el vídeo, incluyendo efectos de sonido y diálogos (vocoder integrado).
- Muestreo en 4 pasos gracias a la LoRA Turbo fusionada, lo que reduce drásticamente el tiempo de inferencia frente a los 20-50 pasos típicos de otros modelos de difusión.
- Ejecución sin dependencias externas: el runtime `cortiq` (binario Rust) no requiere Python, PyTorch, CUDA toolkit ni ffmpeg; los contenedores AVI y WAV se escriben directamente por el binario.
- Verificación de integridad por tensor (`cortiq verify`) y consulta de arquitectura (`cortiq info`).

## Casos de uso

- Prototipado rápido de vídeos para producción: un equipo de marketing puede generar clips de 512×288, 39 frames y 4 pasos con audio sincronizado a partir de un prompt, validando conceptos antes de una producción completa. El modelo se ejecuta desde la línea de comandos, lo que permite integrarlo en scripts de automatización.
- Generación de contenido para redes sociales: con un solo prompt descriptivo, se obtiene un vídeo con audio listo para publicar, sin necesidad de edición posterior. La variante `clipproj4b` (13.16 GB) cabe en una GPU de 16 GB, viable para estudios pequeños.
- Integración en pipelines de CI/CD para pruebas visuales: al ser un binario sin dependencias, se puede añadir como paso de un pipeline que genere vídeos de referencia a partir de prompts de test, comparando resultados entre versiones del prompt o del modelo.
- Control de keyframes para storyboards y animaciones: las variantes `fl2va` permiten especificar el primer y último frame, anclando la composición. Un director de arte puede dibujar dos fotogramas clave y el modelo interpola la acción con audio coherente.
- Evaluación de prompts y experimentación de investigación: la reproducibilidad está garantizada por el hash por tensor y la semilla fija; los investigadores pueden comparar sistemáticamente el efecto de distintas formulaciones de prompt o de las variantes 4-bit vs 8-bit en la calidad del vídeo.
- Despliegue en entornos con recursos limitados: la variante `clipproj4b-fl2va-q4tp` (14.48 GB) se ejecuta en GPUs de 16-24 GB VRAM, permitiendo montar un servicio de generación de vídeo bajo demanda en hardware de consumo sin infraestructura de centro de datos.
- Generación de audio a partir de vídeo: aunque el modelo está diseñado para vídeo+audio, el vocoder integrado puede emplearse para sintetizar efectos sonoros o diálogos sincronizados con una secuencia visual existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de MMLU, HumanEval o GSM8K al ser un generador de vídeo, y no se ofrecen comparativas numéricas con otros modelos de vídeo. La única validación mencionada es la verificación de integridad `cortiq verify`, que confirma que todos los tensores coinciden con sus hashes. Las comparaciones visuales entre variantes (32B vs 4B encoder, 4-bit vs 8-bit) se muestran como GIFs en la página de HuggingFace, pero sin métricas objetivas.

## Requisitos de hardware

- VRAM estimada por variante:
  - `mmh3-turbo-clipproj4b-q4tp.cmf` (13.16 GB): picos de 15.1 GB, requiere 16-20 GB VRAM.
  - `mmh3-turbo-clipproj4b-fl2va-q4tp.cmf` (14.48 GB): requiere 16-24 GB VRAM.
  - `mmh3-turbo-q4tp.cmf` (23.47 GB) y `mmh3-turbo-fl2va-q4tp.cmf` (23.94 GB): requieren 24 GB+ VRAM.
  - `mmh3-turbo-clipproj4b-fl2va-v2-q8_2f.cmf` (26.90 GB): requiere 32 GB+ VRAM.
- GPUs recomendadas: RTX 4090 (24 GB) para las variantes q4tp; RTX 3090/4080 (16-24 GB) para las clipproj4b; A100/H100 (40-80 GB) para la variante q8_2f.
- Sí cabe en GPUs de consumo: las variantes `clipproj4b` (13.16 y 14.48 GB) funcionan en RTX 3080, 3090, 4080 y 4090 con 16-24 GB.
- Opciones de despliegue: únicamente el runtime `cortiq` (binario Rust), disponible para Linux x86-64, macOS (Apple Silicon e Intel) y Windows (x86-64 y ARM64). No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el muestreo en 4 pasos sugiere una generación rápida, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | VRAM mínima | Formato | Licencia |
|---|---|---|---|---|---|
| MiniMax-H3-Turbo-cmf (este) | 47.83 B | 4-bit / 8-bit | 16 GB | CMF (un archivo) | Apache-2.0 |
| MiniMax-H3 (Comfy-Org) | no disponible (referencia 124.4 GB en 4 archivos) | FP32/FP16 | no especificada | safetensors + ComfyUI | Apache-2.0 |
| MiniMax-H3 + LoRA Turbo (Larryvrh) | 47.83 B | FP16 (LoRA separada) | no especificada | safetensors + ComfyUI | Apache-2.0 |

La comparativa se limita a las variantes del propio ecosistema MiniMax-H3, ya que no se dispone de datos de otros modelos de generación de vídeo-audio en la información proporcionada. La principal diferencia es el empaquetado en un solo archivo CMF y la fusión de la LoRA, que elimina la necesidad de instalar ComfyUI y gestionar múltiples pesos.

## Limitaciones y advertencias

- La cuantización 4-bit puede degradar ligeramente la calidad visual y de audio frente al modelo original de 32 bits; la variante 8-bit ofrece mayor fidelidad pero requiere 32 GB de VRAM.
- La variante `clipproj4b` usa un codificador de prompts de 4B en lugar del de 32B, lo que puede reducir la comprensión de prompts complejos o escenas detalladas.
- La proyección ClipProj de la variante compacta se ajustó solo con activaciones de texto; al introducir imágenes en el prompt, la calidad de condicionamiento puede ser inferior a la de los archivos con codificador completo. El propio autor pide reportar resultados en los foros.
- La variante de 2 bits (`q2tp`) se publica como un callejón sin salida y no debe utilizarse para renderizar; su calidad es significativamente inferior.
- No se especifican los idiomas soportados por el codificador Qwen3-VL; aunque probablemente sea multilingüe, no hay confirmación oficial.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos para este modelo.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable verificar los términos del modelo base MiniMax-H3 y de la LoRA Turbo, aunque ambos también están bajo Apache-2.0.
- El formato CMF es propietario de `cortiq`; no es compatible con ecosistemas estándar como safetensors o GGUF, lo que limita su interoperabilidad con otras herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/r3lax/MiniMax-H3-Turbo-cmf
- Modelo base MiniMax-H3: https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA Turbo original: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Repositorio del formato CMF y runtime cortiq: https://github.com/infosave2007/cmf
- Releases de cortiq (binarios precompilados): https://github.com/infosave2007/cmf/releases/latest
- Espacio de demostración interactiva: https://huggingface.co/spaces/infosave/cmf-animate
- Tutorial de ComfyUI para MiniMax-H3 Turbo: https://github.com/Larryvrh/ComfyUI-MiniMax-H3-Turbo
- Hub de recursos de MiniMax-H3: https://github.com/ai-models-lab/minimax-h3
