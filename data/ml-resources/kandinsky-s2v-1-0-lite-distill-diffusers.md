# ml-resources/Kandinsky-S2V-1.0-Lite-distill-Diffusers

## Resumen

Kandinsky S2V 1.0 Lite-distill es un modelo de generación de vídeo de avatar condicionado por voz (speech-to-video) desarrollado por el equipo de Kandinsky (kandinskylab). A partir de una única imagen de referencia y una pista de audio, genera un vídeo en el que se anima la figura completa de la persona —no solo la cabeza— sincronizada con el habla proporcionada. El audio actúa exclusivamente como condición: el modelo no sintetiza sonido, sino que anima al sujeto para que coincida con la locución recibida.

Esta variante "Lite-distill" es un checkpoint destilado con la técnica pi-Flow que reduce la inferencia a 16 pasos, con la guía (guidance) integrada en los pesos, eliminando la necesidad de guider y de prompt negativo. El repositorio contiene los pesos en formato Diffusers como pipeline modular, con un total de 2.267.077.312 parámetros y un tamaño de repositorio de 23,9 GB.

El modelo es relevante por su enfoque de animación de cuerpo completo (frente a los modelos de solo rostro), su soporte de secuencias largas mediante memoria FramePack y su licencia MIT, que facilita el uso comercial. Está pensado para pipelines de generación de avatares, doblaje visual y producción de vídeo automatizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (transformer 3D, `KandinskyS2VTransformer3DModel`) con VAE `AutoencoderKLHunyuanVideo` y scheduler `PiflowScheduler` |
| Parámetros totales | 2.267.077.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación por chunks de 125 frames con memoria FramePack) |
| Tipos de cuantización | no disponible (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Diffusers, pipeline modular) |

## Arquitectura y entrenamiento

El modelo se compone de varios bloques empaquetados en un pipeline modular de Diffusers: un transformer de difusión 3D (`KandinskyS2VTransformer3DModel`, 4,2 GiB) que constituye el núcleo generativo; un VAE `AutoencoderKLHunyuanVideo` (0,9 GiB) para la codificación y decodificación latente del vídeo; un text encoder principal basado en `Qwen2_5OmniThinkerForConditionalGeneration` (16,6 GiB, exportado sin el Talker del checkpoint Omni completo); un segundo text encoder `CLIPTextModel` (0,5 GiB, sin torre de visión); y el scheduler `PiflowScheduler`. El bundle es autocontenido y omite los componentes no utilizados del checkpoint original.

La innovación técnica principal es la destilación pi-Flow, que permite generar en 16 pasos con la guía destilada en los pesos (sin guider ni prompt negativo). La cabeza de salida está ensanchada 5 veces y el scheduler divide esa rejilla, lo que explica un `out_visual_dim` de 80. La generación se realiza por chunks de 125 frames a 25 fps (5 segundos) en uno de los buckets de 512 píxeles, elegido según la relación de aspecto de la imagen de referencia. Para locuciones más largas, el vídeo se genera chunk a chunk, cada uno condicionado por el anterior mediante memoria FramePack. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de vídeo de avatar a partir de una imagen de referencia y una pista de audio (speech-to-video).
- Animación de la figura completa, no limitada al rostro.
- Sincronización labial y gestual condicionada por la pista de voz de entrada.
- Generación de secuencias largas mediante chunks encadenados con memoria FramePack.
- Selección automática del bucket de resolución (512) según la relación de aspecto de la imagen de referencia.
- Salida de vídeo a 25 fps con audio original incorporado en el archivo final.
- No genera audio: el audio es únicamente condición de entrada.
- Soporte de tool calling / function calling: no aplica (modelo generativo de vídeo).
- Soporte de agentes y razonamiento multi-step: no aplica.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de avatares para vídeo corporativo: a partir de una foto del presentador y una locución grabada, se produce un vídeo de cuerpo completo sincronizado, adecuado para formación interna o comunicación institucional sin necesidad de rodaje.
- Doblaje visual multilingüe: dado que el audio es solo condición, se puede animar al sujeto con una pista de voz en otro idioma para generar versiones dobladas con sincronía gestual, útil en localización de contenidos.
- Producción de contenido para redes sociales: generación de clips de 5 segundos (125 frames a 25 fps) encadenables para piezas más largas, con coste de inferencia reducido gracias a los 16 pasos de la destilación pi-Flow.
- Asistentes virtuales con presencia humana: animación de un avatar fijo con respuestas de voz generadas por TTS, integrable en pipelines de atención al cliente o kioscos interactivos.
- Prototipado rápido en investigación de avatares: el formato Diffusers modular y la licencia MIT permiten experimentar con el pipeline, sustituir componentes o ajustar el scheduler sin restricciones legales.
- Postproducción y previsualización: generación de animáticas de presentadores para validar guiones y encuadres antes de una grabación real, reduciendo costes de producción.
- Educación y formación: creación de vídeos instructivos con un formador sintético a partir de una imagen y un guion locutado, escalable a múltiples lecciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el bundle completo en bfloat16 suma aproximadamente 22,2 GiB de pesos (4,2 + 0,9 + 16,6 + 0,5 GiB), por lo que se requiere una GPU con al menos ~24 GB de VRAM para cargar todos los componentes en bfloat16.
- GPU recomendadas: A100 (40/80 GB) o H100 para mayor holgura; RTX 4090 (24 GB) como mínimo ajustado para el bundle completo en bfloat16.
- ¿Cabe en GPU de consumo? Solo en modelos con 24 GB o más (RTX 4090, RTX 3090); en GPUs con menos VRAM sería necesario descargar componentes a CPU o aplicar cuantización, para la cual no se proporcionan datos.
- Opciones de despliegue: pipeline modular de Diffusers (`ModularPipeline.from_pretrained` con `load_components(dtype=torch.bfloat16)` y `.to("cuda")`). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput estimados: no disponibles; se conoce que la inferencia usa 16 pasos por chunk de 125 frames.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Kandinsky S2V 1.0 Lite-distill | 2.267.077.312 | no disponible | MIT | safetensors (Diffusers) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo anima a una persona real a partir de una fotografía, con una voz que puede no ser la suya; existe riesgo de suplantación de identidad y deepfakes. El autor exige consentimiento del sujeto para animar la imagen de referencia y prohíbe presentar el resultado como una grabación genuina.
- Riesgo de alucinación visual: al ser un modelo generativo de difusión, puede producir artefactos, inconsistencias temporales o gestos no realistas, especialmente en secuencias largas encadenadas por chunks.
- Limitación de duración por chunk: cada bloque genera 5 segundos (125 frames a 25 fps); las secuencias largas dependen de la memoria FramePack y pueden acumular deriva entre chunks.
- Resolución limitada a buckets de 512 píxeles, seleccionados según la relación de aspecto de la imagen de referencia.
- No genera audio; requiere una pista de voz externa (TTS o grabación) como condición.
- Idiomas soportados no documentados; el comportamiento multilingüe de la condición de voz no está especificado.
- Sesgos conocidos: no documentados en la información disponible, pero al entrenarse con datos de personas reales puede heredar sesgos demográficos y de apariencia.
- Licencia MIT: permite uso comercial y modificación, pero no exime del cumplimiento de normativas sobre derechos de imagen y protección de datos.
- El modelo no forma parte todavía de una versión publicada de Diffusers; se distribuye como pipeline modular, lo que puede implicar inestabilidad de API.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/ml-resources/Kandinsky-S2V-1.0-Lite-distill-Diffusers
- Pesos en formato nativo: https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Lite-distill
- Paper (arXiv 2610.19290): https://arxiv.org/pdf/2610.19290
- Página del proyecto: https://kandinskyavatar.github.io
- Repositorio de código: https://github.com/kandinskylab/kandinsky-s2v
- Colección de modelos en Hugging Face: https://huggingface.co/collections/kandinskylab/kandinsky-s2v-10-6ab65ebe8f765b6dd9d706d7
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-S2V-1.0-Demo
