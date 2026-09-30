# madebyollin/taeqi2_1

## Resumen

TAEQI2.1 (Tiny AutoEncoder for Qwen Image 2.1) es un autoencoder minúsculo desarrollado por el usuario madebyollin, autor de la familia TAESD de autoencoders destilados para modelos de difusión. No es un modelo de lenguaje ni un generador de imágenes: es el componente de codificación y decodificación latente que se acopla a un pipeline de difusión. Concretamente, expone la misma "API latente" que el VAE de Qwen Image 2.1, de modo que puede sustituir al VAE original dentro del pipeline `QwenImage21Pipeline` de Diffusers.

El modelo replica las características del VAE de Qwen Image 2.1: compresión espacial de 16x, 64 canales latentes e imágenes en formato RGBA (4 canales). El codificador se entrenó para imitar las salidas del codificador del VAE de Qwen-Image-2.1, según indica el propio autor ("Built with Qwen"). A diferencia del VAE completo, TAEQI2.1 es extremadamente pequeño, lo que lo hace apto para previsualización en tiempo real durante el proceso de generación y para codificación/decodificación en entornos con recursos limitados.

Su relevancia actual es práctica: permite ver el resultado aproximado de una generación mientras el sampler todavía está trabajando, y reduce el coste de memoria y de cómputo del decodificado final. El repositorio de HuggingFace contiene únicamente los pesos en formato `.safetensors` bajo licencia MIT, con 12 "likes" y 0 descargas registradas en el momento de redactar esta ficha. La arquitectura aún no está integrada formalmente en Diffusers, por lo que el uso requiere código envoltorio proporcionado por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional destilado, variante "f16" de la familia TAESD (clase `TAESD` con `latent_channels=64`, `arch_variant="f16"`, `image_channels=4`) |
| Parametros totales | no disponible (el autor lo describe como "very tiny"; el repositorio ocupa 0,0 GB redondeados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y el ejemplo oficial carga en `bfloat16` |
| Idiomas soportados | no aplica / no disponible (modelo de visión: compresión latente de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors (`taeqi2_1.safetensors`); existe también `taeqi2_1_decoder.pth` en el repositorio `taesd` de GitHub |
| Compresion espacial | 16x (latentes de dimensión H/16 x W/16) |
| Canales latentes | 64 |
| Canales de imagen | 4 (RGBA) |
| Normalizacion latente | latentes normalizados directamente (`latents_mean` = 0,0 en los 64 canales; `latents_std` = 1,0), por lo que el escalado y desplazamiento del pipeline son no-op |
| Rango de entrada/salida | imágenes en [-1, 1]; latentes (B, 64, 1, H/16, W/16) |
| DTipo soportado | `bfloat16` en el código de ejemplo del autor |

## Arquitectura y entrenamiento

TAEQI2.1 pertenece a la familia TAESD ("Tiny AutoEncoder for Stable Diffusion"), un linaje de autoencoders destilados que ofrecen codificación y decodificación más rápidas a costa de una calidad ligeramente reducida, según la descripción del propio perfil del autor. La variante aquí publicada emplea la arquitectura `f16` de la clase `TAESD` configurada con 64 canales latentes y 4 canales de imagen, de forma que su interfaz coincide exactamente con la del VAE de Qwen Image 2.1: misma compresión espacial de 16x, mismo número de canales latentes y mismo formato RGBA.

El entrenamiento del codificador se realizó por destilación: el codificador de TAEQI2.1 se entrenó para imitar las salidas del codificador del VAE de Qwen-Image-2.1, de ahí la etiqueta "Built with Qwen" de la model card. No se especifican en la información disponible el número de tokens o de imágenes de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO (no aplicables, por otra parte, a un autoencoder).

Una innovación relevante de esta variante es que consume y produce latentes ya normalizados: el envoltorio de Diffusers define `latents_mean = [0.0] * 64` y `latents_std = [1.0] * 64`, de manera que el pipeline no necesita aplicar escalado ni desplazamiento latente. El modelo se ejecuta en `bfloat16` y opera como sustituto directo del VAE (`pipe.vae = taeqi2_1_diffusers`). La arquitectura todavía no está integrada correctamente en la librería Diffusers, según enlaza el propio autor, por lo que es necesario emplear el código envoltorio incluido en la model card y el archivo `taesd.py` del repositorio de GitHub.

## Capacidades

- Codificación de imágenes RGBA a latentes comprimidos 16x con 64 canales.
- Decodificación de latentes de 64 canales a imágenes RGBA en el rango [-1, 1].
- Compatibilidad de API latente con el VAE de Qwen Image 2.1, lo que permite sustituirlo sin modificar el pipeline.
- Previsualización en tiempo real del proceso de generación de Qwen Image 2.1, mostrando aproximaciones de la imagen mientras el sampler avanza.
- Codificación y decodificación en entornos con recursos limitados por el tamaño reducido del modelo.
- Integración como `pipe.vae` en `QwenImage21Pipeline` de Diffusers mediante un envoltorio (`DiffusersTAEQI21Wrapper`).
- Ejecución en `bfloat16` y compatibilidad con `enable_model_cpu_offload()`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No es un modelo de difusión: no genera imágenes por sí mismo, solo codifica y decodifica latentes.

## Casos de uso

- Previsualización en vivo durante la generación: al sustituir el VAE del pipeline por TAEQI2.1, el decodificado de cada paso intermedio es tan barato que permite mostrar una versión aproximada de la imagen mientras el sampler sigue trabajando, algo inviable con el VAE completo.
- Generación de imágenes en GPU de gama baja: el modelo reduce el coste de memoria y de cómputo del decodificado, lo que facilita ejecutar Qwen Image 2.1 en tarjetas con VRAM ajustada, combinado con `enable_model_cpu_offload()`.
- Servicios de inferencia con alta concurrencia: en un servidor que atiende muchas peticiones simultáneas, un decodificador minúsculo libera recursos del acelerador para el modelo de difusión, mejorando el número de peticiones por segundo del servicio.
- Prototipado y barrido de prompts: al reducir el tiempo por imagen, permite iterar rápidamente sobre prompts, semillas y parámetros de muestreo antes de lanzar la generación final con el VAE completo.
- Edición de imagen (img2img) e inpainting: la codificación rápida de la imagen de entrada acelera los pipelines que requieren codificar y volver a decodificar en cada iteración.
- Caché y almacenamiento de latentes: su compresión 16x con 64 canales permite guardar representaciones latentes de un dataset de imágenes para reutilizarlas en experimentos posteriores, siempre asumiendo la pérdida de calidad de la destilación.
- Ejecución en CPU o entornos sin GPU: por su tamaño reducido, es viable codificar y decodificar en CPU para tareas de preprocesado por lotes o validación de pipelines.
- Investigación sobre destilación de autoencoders: sirve como referencia reproducible para estudiar cómo un TAE imita a un VAE de 64 canales, y como base para entrenar variantes para otros modelos de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La model card únicamente remite a comparativas de calidad visual publicadas en dos hilos del repositorio `taesd` de GitHub, sin métricas numéricas (FID, PSNR, SSIM u otras):

| Aspecto | Resultado |
|---|---|
| Benchmarks numéricos (MMLU, FID, PSNR, SSIM, etc.) | no disponible |
| Comparativas de calidad | imágenes de comparación enlazadas en los hilos del repositorio `taesd` (issue 38, comentario 5824669672) |
| Latencia / throughput | no disponible |

## Requisitos de hardware

- No se publican cifras oficiales de VRAM en la información disponible.
- El repositorio ocupa 0,0 GB redondeados y el autor describe el modelo como "very tiny", por lo que los pesos son de tamaño muy reducido en comparación con un VAE completo; el objetivo declarado es la previsualización en tiempo real y la codificación/decodificación con recursos limitados.
- El ejemplo oficial emplea `torch_dtype=bfloat16` y `enable_model_cpu_offload()`, lo que sugiere despliegues con memoria limitada, aunque también admite `pipe.to(device)`.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; el diseño "tiny" apunta a que la carga del autoencoder es marginal frente a la del modelo de difusión.
- Opciones de despliegue: Diffusers con código envoltorio propio (soporte nativo pendiente), sobre `QwenImage21Pipeline`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un autoencoder de difusión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Compresion espacial | Canales latentes | Canales de imagen | Licencia | Integracion en Diffusers |
|---|---|---|---|---|---|---|
| TAEQI2.1 | Autoencoder destilado para Qwen Image 2.1 | 16x | 64 | 4 (RGBA) | MIT | no integrada; requiere envoltorio |
| VAE de Qwen Image 2.1 | VAE original del modelo de difusión | 16x (misma API latente) | 64 | 4 (RGBA) | no disponible en la información proporcionada | integrado en `QwenImage21Pipeline` |
| TAEF2 | Autoencoder destilado para Flux | no disponible | no disponible | no disponible | no disponible | no integrada, segun la model card |
| TAESD genérico | Autoencoder destilado para Stable Diffusion | no disponible | no disponible | no disponible | no disponible en la información proporcionada | sí, mediante `AutoencoderTiny` |

La diferencia funcional principal frente al VAE original es el compromiso entre velocidad y calidad: el linaje TAESD ofrece codificación y decodificación más rápidas con una calidad ligeramente reducida. Frente a TAEF2, la diferencia es el modelo de destino (Flux en lugar de Qwen Image 2.1); en ambos casos la integración en Diffusers está pendiente según la documentación del autor.

## Limitaciones y advertencias

- La calidad de reconstrucción es inferior a la del VAE completo de Qwen Image 2.1: es un modelo destilado pensado para previsualización, no para la salida final de máxima fidelidad.
- La arquitectura no está integrada correctamente en Diffusers todavía; el uso en producción exige mantener el código envoltorio `DiffusersTAEQI21Wrapper` y `taesd.py`, lo que introduce deuda técnica y riesgo de rotura ante cambios en la librería.
- El modelo consume y produce latentes normalizados (media 0, desviación 1), de forma que el escalado y desplazamiento del pipeline deben ser no-op; configurarlo mal degrada la salida.
- Es específico del espacio latente de Qwen Image 2.1 (16x, 64 canales, RGBA) y no es intercambiable con VAEs de otros modelos con distinta compresión o número de canales.
- No es un modelo generativo ni de lenguaje: no admite prompts, tool calling, agentes ni razonamiento multi-paso.
- Sesgos conocidos: no disponible en la información proporcionada; al ser un autoencoder, puede heredar sesgos de reconstrucción del VAE y del dataset con el que se entrenó su destilación, sin que se documenten análisis al respecto.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; en imágenes se traduce en artefactos o pérdida de detalle en la reconstrucción.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright; conviene verificar la licencia del modelo de difusión asociado (Qwen Image 2.1) de forma independiente.
- El repositorio registra 0 descargas y 12 "likes", y un tamaño redondeado de 0,0 GB: se trata de un artefacto reciente y poco adoptado, sin validación externa extensa.
- Las fechas del repositorio (creado el 25 de septiembre de 2026, actualizado el 29 de septiembre de 2026) proceden de los metadatos de HuggingFace y no han podido contrastarse con otra fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/madebyollin/taeqi2_1
- Perfil del autor en HuggingFace: https://huggingface.co/madebyollin
- Repositorio del proyecto TAESD: https://github.com/madebyollin/taesd
- Código auxiliar `taesd.py`: https://raw.githubusercontent.com/madebyollin/taesd/refs/heads/main/taesd.py
- Pesos en formato PyTorch: https://github.com/madebyollin/taesd/blob/main/taeqi2_1_decoder.pth
- Hilo sobre la integración en Diffusers: https://github.com/madebyollin/taesd/issues/35#issuecomment-3765620926
- Hilo con comparativas de calidad: https://github.com/madebyollin/taesd/issues/38#issuecomment-5824669672
- Página del modelo TAESD en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/taesd-madebyollin
- Librería Diffusers: https://www.github.com/huggingface/diffusers
- Modelo base asociado: https://huggingface.co/Qwen/Qwen-Image-2.1 (referenciado en el código de ejemplo de la model card)
- Imagen de ejemplo generada con el pipeline: https://cdn-uploads.huggingface.co/production/uploads/630447d40547362a22a969a2/kdGwyqaeiLLBXfSnAd3xQ.png
- Comparativa de calidad 1: https://cdn-uploads.huggingface.co/production/uploads/630447d40547362a22a969a2/q1iqDSGnCVShnUFvqnJRS.png
- Comparativa de calidad 2: https://cdn-uploads.huggingface.co/production/uploads/630447d40547362a22a969a2/Jzkzvrx3sSFD_IQbR6lOB.png
