# kandinskylab/Kandinsky-S2V-1.0-Pro-distill-Diffusers

## Resumen

Kandinsky S2V 1.0 Pro-distill es un modelo de generación de vídeo a partir de voz (speech-to-video) desarrollado por el equipo de Kandinsky Lab. Dada una imagen de referencia y una pista de audio, anima la figura completa de la persona —no solo la cabeza— para que sincronice con el habla. El audio actúa como condición: el modelo no genera sonido, sino que anima al sujeto de la imagen para que coincida con la locución proporcionada.

Esta versión es el checkpoint "pro" destilado, empaquetado en formato Diffusers como pipeline modular. Con 21.360 millones de parámetros totales (un transformer 3D de 39,8 GiB junto a un VAE de tipo HunyuanVideo, un text encoder Qwen2.5-Omni Thinker de 16,6 GiB y un CLIPTextModel), el bundle es autocontenido y pesa 62,1 GB en el repositorio.

Su relevancia radica en la combinación de destilación pi-Flow con 16 pasos de inferencia, orientación (guidance) destilada en los pesos y memoria FramePack para generar vídeos de duración arbitraria por fragmentos de 125 fotogramas a 25 fps. La licencia MIT facilita su uso comercial, aunque el despliegue exige hardware de gama alta o offload explícito de componentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer 3D de difusión (KandinskyS2VTransformer3DModel) con VAE AutoencoderKLHunyuanVideo, text encoders Qwen2_5OmniThinker y CLIPTextModel, scheduler PiflowScheduler |
| Parámetros totales | 21.359.793.984 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors, dtype de referencia bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato Diffusers modular) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusión modular compuesto por un transformer 3D (`KandinskyS2VTransformer3DModel`, 39,8 GiB), un VAE basado en `AutoencoderKLHunyuanVideo` (0,9 GiB), un text encoder principal `Qwen2_5OmniThinkerForConditionalGeneration` exportado sin el Talker (16,6 GiB), un segundo text encoder `CLIPTextModel` sin su torre de visión (0,5 GiB) y el scheduler `PiflowScheduler`. La cabeza de salida está ensanchada cinco veces; el scheduler divide esa rejilla, de ahí que `out_visual_dim` sea 80.

El entrenamiento emplea destilación pi-Flow con 16 pasos, incorporando la orientación (guidance) directamente en los pesos: los bloques destilados no usan guider ni prompt negativo. La generación se realiza por fragmentos de 125 fotogramas a 25 fps (5 segundos) en uno de los buckets de 512, seleccionado según la relación de aspecto de la imagen de referencia. Para locuciones más largas, el modelo genera fragmento a fragmento, cada uno condicionado por el anterior mediante memoria FramePack. No se dispone de información sobre el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de vídeo de avatar a partir de una imagen de referencia y una pista de voz, animando la figura completa y no solo el rostro.
- Sincronización labial y corporal con el audio de entrada (el audio es condición, no se genera sonido).
- Generación de vídeo de duración extensa mediante fragmentación con memoria FramePack.
- Adaptación automática de la resolución de salida a la relación de aspecto de la imagen de referencia mediante buckets de 512.
- Salida a 25 fps con 125 fotogramas por fragmento (5 segundos).
- Condicionamiento textual a través de los text encoders Qwen2.5-Omni Thinker y CLIP.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de audio.

## Casos de uso

- Generación de avatares parlantes para vídeo corporativo: a partir de un retrato del ponente y una locución grabada, el modelo produce un vídeo sincronizado sin necesidad de rodaje adicional, gracias a la animación de la figura completa.
- Doblaje y localización de contenido: se puede animar una imagen fija del presentador con la pista de audio en otro idioma, manteniendo la coherencia visual entre fragmentos mediante FramePack.
- Prototipado de personajes virtuales para videojuegos o experiencias interactivas: la imagen de referencia define la identidad visual y la voz del actor dirige la animación en tiempo de generación.
- Creación de contenido para redes sociales: fragmentos de 5 segundos a 25 fps encajan con formatos cortos, y la selección automática de bucket según la relación de aspecto evita reencuadres manuales.
- Presentaciones y formación e-learning: se puede generar un vídeo de instructor a partir de una fotografía y un guion locutado, reduciendo costes de producción audiovisual.
- Investigación en animación facial y corporal: el pipeline modular de Diffusers permite sustituir o analizar componentes (VAE, text encoders, scheduler) para experimentar con variantes de condicionamiento.
- Demostraciones de producto con portavoces sintéticos: útil para iterar mensajes de marketing sin regrabar al presentador en cada versión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint "pro" no cabe en una GPU de 80 GB con todos los componentes residentes: junto al encoder de voz de 7B, la decodificación VAE de un fragmento no tiene espacio.
- Se recomienda offload mediante `ComponentsManager` con `enable_auto_cpu_offload`, reservando un margen de 40 GiB; el pico de memoria resultante es de aproximadamente 50 GiB.
- GPU recomendadas: A100 80 GB o H100 80 GB con offload de componentes; sin offload, se requiere memoria superior a 80 GB.
- No se documenta que quepa en GPU de consumo (RTX 4090 de 24 GB u otras) sin cuantización adicional, que no está descrita en la información disponible.
- Despliegue mediante Diffusers con `ModularPipeline` (pipeline modular); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de difusión de vídeo.
- Latencia y throughput estimados: no disponibles. La inferencia usa 16 pasos de destilación pi-Flow.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de speech-to-video con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo anima a una persona real a partir de una sola fotografía con una voz que puede no ser la suya; el autor exige consentimiento del sujeto para animar la imagen de referencia y prohíbe presentar el resultado como una grabación genuina.
- Riesgo de uso indebido para suplantación de identidad o deepfakes; no se documentan mecanismos de marca de agua o detección en la información disponible.
- El audio es únicamente condición: el modelo no genera sonido, por lo que la pista original debe añadirse al vídeo de salida en el posprocesado.
- La generación es por fragmentos de 5 segundos; la coherencia entre fragmentos depende de la memoria FramePack y puede degradarse en secuencias muy largas.
- No se dispone de información sobre sesgos demográficos, calidad en distintos tonos de piel o tipos de cuerpo, ni sobre el rendimiento multilingüe.
- Riesgo de alucinación visual: el modelo puede generar movimientos o expresiones no presentes en la imagen de referencia.
- La licencia MIT permite uso comercial, pero el despliegue exige hardware de gama alta o offload, lo que afecta a los costes de producción.
- El pipeline no forma parte de una versión publicada de Diffusers; se distribuye como pipeline modular, lo que puede implicar incompatibilidades con versiones futuras.
- No se documentan tipos de cuantización, lo que limita el despliegue en hardware de menor capacidad.

## Enlaces

- [HuggingFace: kandinskylab/Kandinsky-S2V-1.0-Pro-distill-Diffusers](https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Pro-distill-Diffusers)
- [Pesos en formato nativo: kandinskylab/Kandinsky-S2V-1.0-Pro-distill](https://huggingface.co/kandinskylab/Kandinsky-S2V-1.0-Pro-distill)
- [Paper arXiv:2610.19290](https://arxiv.org/pdf/2610.19290)
- [Página del proyecto](https://kandinskyavatar.github.io)
- [Repositorio GitHub](https://github.com/kandinskylab/kandinsky-s2v)
- [Colección en HuggingFace](https://huggingface.co/collections/kandinskylab/kandinsky-s2v-10-6ab65ebe8f765b6dd9d706d7)
- [Demo en HuggingFace Spaces](https://huggingface.co/spaces/kandinskylab/Kandinsky-S2V-1.0-Demo)
