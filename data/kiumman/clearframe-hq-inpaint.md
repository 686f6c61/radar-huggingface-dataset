# kiumman/clearframe-hq-inpaint

## Resumen

Clearframe HQ inpaint (browser build) es un modelo de inpainting derivado de Stable Diffusion 1.5, empaquetado en formato ONNX para su ejecución en el navegador mediante onnxruntime-web con aceleración WebGPU. Lo desarrolla el usuario kiumman y su propósito declarado es repintar la zona bajo una marca de agua eliminada, es decir, reconstruir el contenido visual que queda tras borrar un sello de agua en una imagen. El repositorio tiene un tamaño de 0,9 GB y no registra descargas ni interacciones en el momento de la consulta.

El modelo parte de Lykon/dreamshaper-8-inpainting y le fusiona el LoRA de consistencia latente LCM para SD 1.5, lo que permite muestreo en pocos pasos (4 pasos, fuerza 0,55 según la model card). La conversión a ONNX usa fp16 con normalización y softmax en fp32, mientras que los pesos de convolución y capas lineales se cuantizan a int8 por canal y solo pesos. La entrada del UNet es un tensor de 9 canales (4 de latentes ruidosos más 4 de máscara más 1 adicional), con laterales latentes que deben ser múltiplos de 8.

Es relevante ahora porque demuestra un patrón de despliegue de difusión en el cliente: inferencia de inpainting sin servidor, directamente en el navegador, lo que reduce costes de infraestructura y facilita el procesamiento local de imágenes. La licencia CreativeML OpenRAIL-M impone restricciones de uso que se heredan tanto en el modelo como en sus salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión latente (Stable Diffusion 1.5 inpainting) con VAE y CLIP text encoder; empaquetado ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; embedding de texto fijo de 77 tokens (CLIP, [1,77,768]) |
| Tipos de cuantizacion | ONNX fp16 con normalización/softmax en fp32; pesos de conv y linear en int8 por canal (weight-only) |
| Idiomas soportados | no disponible (el condicionamiento textual depende del CLIP de SD 1.5, predominantemente inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | ONNX (`unet.onnx`), más `prompt_emb.f32` y `schedule.json` |

## Arquitectura y entrenamiento

El modelo es un UNet de difusión latente de Stable Diffusion 1.5 especializado en inpainting, con un VAE para codificar y decodificar latentes y un codificador de texto CLIP que produce embeddings de 77 tokens y 768 dimensiones. Sobre esta base se ha fusionado el LoRA LCM (latent-consistency/lcm-lora-sdv1-5), que permite generar con muy pocos pasos de muestreo; la model card fija una programación de 4 pasos con fuerza 0,55 en `schedule.json`. La entrada del UNet es un tensor de 9 canales con lados latentes múltiplos de 8, correspondiente al esquema de inpainting de SD 1.5.

No se documenta el proceso de entrenamiento ni el dataset utilizado: el autor solo describe la conversión y el empaquetado. La conversión a ONNX usa fp16 para las activaciones y mantiene normalización y softmax en fp32 para estabilidad numérica, mientras que los pesos de convolución y capas lineales se cuantizan a int8 por canal en modo weight-only. El embedding de texto se entrega precalculado como `prompt_emb.f32` con forma [1,77,768], lo que implica que el prompt es fijo en esta build y no se recalcula en tiempo de ejecución.

## Capacidades

- Inpainting de imágenes: repinta la región enmascarada a partir del contexto de la imagen y de un embedding de texto fijo.
- Reconstrucción tras eliminación de marcas de agua: caso de uso declarado por el autor, repintar la zona bajo un sello de agua borrado.
- Muestreo en pocos pasos: gracias al LoRA LCM fusionado, con 4 pasos y fuerza 0,55 según la configuración incluida.
- Inferencia en navegador: ejecutable con onnxruntime-web y WebGPU, sin backend servidor.
- Condicionamiento textual limitado: al usar `prompt_emb.f32` fijo, no admite prompts arbitrarios en esta build.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible (modelo de imagen, no de texto).
- Capacidades multilingües: no disponible; el condicionamiento CLIP de SD 1.5 está orientado principalmente al inglés.
- Visión, audio u otras modalidades: solo imagen (entrada y salida visual).

## Casos de uso

- Eliminación de marcas de agua en flujos de restauración de imágenes: el modelo se usa para repintar la zona bajo un sello borrado, aprovechando el contexto circundante y el embedding fijo incluido; es el escenario para el que fue empaquetado.
- Edición de imágenes en el navegador: integrado en una aplicación web con WebGPU, permite al usuario retocar zonas de una imagen sin enviar datos a un servidor, lo que reduce latencia de red y mejora la privacidad.
- Herramientas de retoque fotográfico ligeras: eliminación de objetos pequeños o imperfecciones en zonas enmascaradas, con generación en 4 pasos para una respuesta casi interactiva.
- Procesamiento por lotes en el cliente: al no requerir GPU de servidor, puede ejecutarse en equipos de usuario para tareas de limpieza de imágenes en catálogos o archivos personales.
- Prototipado de pipelines de difusión en ONNX: sirve como referencia para convertir y cuantizar modelos SD 1.5 inpainting a ONNX int8/fp16 y desplegarlos con onnxruntime-web.
- Demostraciones educativas de difusión latente: permite ilustrar el funcionamiento del inpainting y del muestreo LCM en un entorno de navegador sin infraestructura adicional.
- Integración en editores de imágenes basados en canvas: el modelo puede alimentar una capa de repintado sobre una máscara definida por el usuario, siempre que se respeten los múltiplos de 8 en los laterales latentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,9 GB y la cuantización int8 weight-only con activaciones fp16 reduce el peso respecto a un checkpoint SD 1.5 en fp32.
- GPU recomendadas: no disponible; el requisito es un navegador con soporte de WebGPU y una GPU compatible con dicha API.
- Cabe en GPU de consumo: previsiblemente sí en GPUs de consumo con WebGPU, aunque no se documentan modelos concretos ni cifras de memoria en uso.
- Opciones de despliegue: onnxruntime-web con WebGPU (build objetivo); otros runtimes ONNX no se documentan.
- Latencia y throughput: no disponibles; la configuración de 4 pasos con LCM está pensada para reducir el coste de muestreo, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clearframe HQ inpaint (browser build) | no disponible | Embedding CLIP fijo [1,77,768]; latentes múltiplos de 8 | SD 1.5 inpainting + LCM LoRA, ONNX int8/fp16, WebGPU | CreativeML OpenRAIL-M | Hugging Face (kiumman) |
| Lykon/dreamshaper-8-inpainting | no disponible | SD 1.5 (77 tokens CLIP) | SD 1.5 inpainting afinado | CreativeML OpenRAIL-M | Hugging Face (modelo base) |
| latent-consistency/lcm-lora-sdv1-5 | no disponible | SD 1.5 (77 tokens CLIP) | LoRA de consistencia latente para pocos pasos | no disponible en la información | Hugging Face (LoRA fusionado) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El prompt es fijo (`prompt_emb.f32` precalculado): la build no permite condicionar la generación con texto arbitrario, lo que limita su uso a la tarea prevista.
- Los laterales latentes deben ser múltiplos de 8; imágenes con otras dimensiones requieren redimensionado o padding previo.
- Riesgo de alucinación visual: el repintado puede generar contenido plausible pero incorrecto en la zona enmascarada, especialmente en texturas complejas o regiones grandes.
- Sesgos heredados de Stable Diffusion 1.5 y de DreamShaper 8: posibles sesgos de representación y estéticos no documentados por el autor.
- Licencia CreativeML OpenRAIL-M: impone restricciones de uso sobre el modelo y sus salidas; es necesario revisar las cláusulas antes de un uso comercial.
- Sin métricas publicadas de calidad, latencia ni consumo de memoria; no hay evidencia de evaluación cuantitativa en la información disponible.
- Repositorio sin descargas ni interacciones y con fecha de creación posterior a la consulta indicada, lo que sugiere un proyecto muy reciente y sin validación comunitaria.
- Dependencia de WebGPU: la ejecución en navegador requiere compatibilidad del cliente, lo que excluye navegadores o equipos sin soporte.

## Enlaces

- [Hugging Face: kiumman/clearframe-hq-inpaint](https://huggingface.co/kiumman/clearframe-hq-inpaint)
- [Modelo base: Lykon/dreamshaper-8-inpainting](https://huggingface.co/Lykon/dreamshaper-8-inpainting)
- [LoRA fusionado: latent-consistency/lcm-lora-sdv1-5](https://huggingface.co/latent-consistency/lcm-lora-sdv1-5)
