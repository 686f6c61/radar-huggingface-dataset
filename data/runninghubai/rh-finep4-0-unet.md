# RunningHubAI/rh-finep4.0-unet

## Resumen
rh-finep4.0-unet es un checkpoint de tipo UNet para modelos de difusión de imágenes, publicado por RunningHubAI (autor RunningHub-@LEUL) en Hugging Face. Está orientado a flujos de edición de imagen con condicionamiento de texto e imagen (image-text-to-image) y se distribuye como un único archivo safetensors de 12.867 MiB dentro de un repositorio de 13,5 GB. La model card indica que es un ajuste fino de krea2, pero no aporta número de parámetros, arquitectura interna, datos de entrenamiento ni licencia.

Su interés es práctico: permite cargar un UNet ajustado en ComfyUI o en la plataforma RunningHub y experimentar con edición de imágenes sin entrenar desde cero. Ahora bien, la documentación es mínima: no hay benchmarks, no se detallan los componentes necesarios (text encoder, VAE, scheduler) y la licencia queda remitida al proyecto upstream. Es, por tanto, un modelo para evaluar en entornos controlados, no una opción lista para producción sin validación previa.

## Especificaciones tecnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de difusión para edición de imagen (image-text-to-image) |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (modelo de difusión); no disponible |
| Tipos de cuantización | FP8/INT8 según el nombre del archivo; configuración exacta no disponible |
| Idiomas soportados | no disponible; depende del text encoder del pipeline, no incluido |
| Licencia | no disponible; la model card remite a la licencia del proyecto original/upstream (krea2) |
| Formato de pesos | safetensors |
| Modelo base | krea2 (según la model card) |
| Pipeline | image-text-to-image |
| Entorno de ejecución | ComfyUI / RunningHub |
| Archivo principal | finep0rnV4TURBOFP8INT8_v4.safetensors (12.867 MiB) |
| Tamaño del repositorio | 13,5 GB |
| Resolución de salida | no disponible |
| Número de pasos de inferencia | no disponible |

## Arquitectura y entrenamiento
El repositorio contiene únicamente pesos UNet para un pipeline de difusión; no se especifica si la UNet sigue un diseño tipo SD, SDXL, Flux u otro, ni el número de bloques, canales o mecanismos de atención. La model card solo declara que el modelo es un ajuste fino de krea2 y que está orientado a edición de imagen. No se documentan datos de entrenamiento, número de tokens, composición del dataset, resolución de entrenamiento ni procesos de RLHF/DPO; en difusión, además, esas técnicas no se aplican igual que en modelos de lenguaje.

El nombre del archivo principal incluye "TURBOFP8INT8", lo que sugiere una variante turbo y cuantización FP8/INT8, pero el autor no lo confirma ni explica el método. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o destilación; cualquier afirmación en ese sentido sería una inferencia no verificada.

## Capacidades
- Generación y edición de imágenes condicionadas por texto e imagen de entrada, de acuerdo con el pipeline image-text-to-image declarado. No se especifica la resolución de salida.
- Integración en ComfyUI: el checkpoint está etiquetado para ComfyUI y puede cargarse en un workflow de edición de imagen.
- Uso en RunningHub: la model card indica que los pesos se pueden cargar en la plataforma y ofrece enlaces a la API.
- Checkpoint UNet aislado: el repositorio solo publica los pesos del UNet; no se documentan text encoder, VAE, scheduler ni el resto del pipeline.
- No se documentan tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de audio, vídeo ni comprensión multimodal más allá de la imagen de entrada del pipeline.
- Soporte multilingüe: no disponible; el idioma de los prompts dependerá del text encoder que se use, que no forma parte del repositorio.
- Empaquetado FP8/INT8 y posible variante turbo: el nombre del archivo lo sugiere, pero no hay confirmación técnica.
- Posible orientación a contenido para adultos: el nombre del archivo contiene "finep0rn"; no está confirmado por el autor.

## Casos de uso
- Edición de imagen en ComfyUI: cargar el UNet en un workflow image-text-to-image, introducir una imagen base y un prompt de edición (por ejemplo, cambiar el fondo o la iluminación) y revisar el resultado. Es adecuado porque el checkpoint está publicado para ComfyUI y ese pipeline, aunque no se documentan la resolución ni los componentes necesarios.
- Prototipado de variaciones creativas: generar varias versiones de una misma escena cambiando el prompt y la intensidad de edición; útil para explorar direcciones visuales antes de invertir en un entrenamiento propio.
- Automatización mediante la API de RunningHub: exponer un workflow como endpoint para generar imágenes bajo demanda; encaja si el equipo ya usa RunningHub, pero hay que verificar la licencia y los límites del servicio.
- Evaluación de ajustes finos: comparar rh-finep4.0-unet con krea2 u otros checkpoints usando las mismas imágenes, prompts y semillas; sirve para medir el efecto del fine-tuning, aunque no hay métricas publicadas.
- Variaciones de producto: mantener la imagen del producto y modificar el entorno o la luz mediante prompt; requiere validar que el modelo preserve la identidad del producto.
- Retoque fotográfico asistido: probar correcciones de color, fondo o detalles; solo si el workflow permite enmascarar o limitar la zona de edición, ya que no se documenta soporte de inpainting.
- Concept art e ilustración: iterar sobre bocetos o referencias para obtener alternativas visuales; la falta de benchmarks obliga a revisión humana.
- Flujos de contenido para adultos: el nombre del archivo sugiere un ajuste orientado a ese dominio; solo debe usarse con licencia compatible, moderación y cumplimiento legal.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Tampoco se aportan métricas de imagen (FID, CLIP score, etc.), comparativas con krea2 ni datos de latencia o throughput.

## Requisitos de hardware
- Peso del UNet: 12.867 MiB (unos 12,6 GiB) para el archivo principal; el repositorio completo ocupa 13,5 GB.
- VRAM estimada: el UNet ocupa 12,6 GiB; con overhead, 16 GB es un mínimo ajustado y 24 GB es la cifra recomendada para el pipeline completo. Son estimaciones a partir del tamaño del archivo, no cifras publicadas.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) son las opciones más seguras; RTX 4080 o RTX 4070 Ti Super (16 GB) pueden quedarse justas y requerir descarga parcial a CPU (offload); 12 GB no se recomienda sin cuantización adicional.
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S 48 GB para lotes, despliegues multiusuario o pruebas de estrés.
- Despliegue: ComfyUI y API de RunningHub. vLLM, llama.cpp, Ollama y TGI no aplican a un UNet de difusión; no se documenta soporte en Diffusers.
- Latencia y throughput: no disponibles; dependen de la GPU, la resolución, el número de pasos y del pipeline completo.

## Comparativa con modelos similares
| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-finep4.0-unet | UNet de edición de imagen, fine-tune de krea2 | no disponible | no aplica | no disponible | no disponible | Hugging Face y RunningHub |
| krea2 | modelo base declarado | no disponible | no aplica | no disponible | no disponible | no disponible en la información |
| rh-4.0-unet | UNet image-text-to-image del mismo autor | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se han identificado alternativas adicionales con parámetros, contexto o benchmarks verificables en la información disponible.

## Limitaciones y advertencias
- Documentación mínima: no se publican parámetros, arquitectura interna, dataset, resolución de entrenamiento ni benchmarks.
- Licencia no disponible: el uso comercial es incierto; la model card remite a la licencia del proyecto original o upstream (krea2). Hay que verificar antes de producción.
- Solo se distribuye el UNet: faltan text encoder, VAE y scheduler; la compatibilidad exacta con pipelines existentes no está documentada.
- Sesgos: no documentados. Como en cualquier modelo de imagen, pueden aparecer sesgos de representación, estética y culturales; no hay evaluación publicada.
- Fidelidad al prompt: no hay métricas; puede producir imágenes incoherentes, artefactos o cambios no deseados. El concepto de alucinación textual no aplica, pero sí la falta de fidelidad visual.
- Contenido para adultos: el nombre del archivo contiene "finep0rn", lo que sugiere posible contenido NSFW. Requiere moderación, consentimiento y cumplimiento legal.
- Idioma: no se documenta soporte multilingüe; el rendimiento dependerá del text encoder no incluido.
- Contexto: no aplica ventana de contexto; no se documentan resolución, relación de aspecto ni número de pasos.
- Validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso o revisión por terceros.
- Metadatos: la fecha de creación indicada (2026-10-17) es posterior a la fecha actual; posible inconsistencia que conviene verificar.

## Enlaces
- [Hugging Face - rh-finep4.0-unet](https://huggingface.co/RunningHubAI/rh-finep4.0-unet)
- [Modelo original en RunningHub](https://www.runninghub.ai/model/public/2083817661172465665)
- [Página del autor en RunningHub](https://www.runninghub.ai/user-center/1945917948739350530)
- [RunningHub (sitio principal)](https://www.runninghub.ai)
- [RunningHub China](https://www.runninghub.cn)
- [Documentación de la API en inglés](https://www.runninghub.cn/runninghub-api-doc-en/)
- [Documentación de la API en chino](https://www.runninghub.cn/runninghub-api-doc-cn/)
- [Entrenamiento en RunningHub](https://www.runninghub.ai/page-model)
- [API de RunningHub](https://www.runninghub.ai/call-api)
- [Modelo hermano rh-4.0-unet](https://huggingface.co/RunningHubAI/rh-4.0-unet)
- [README en chino](https://huggingface.co/RunningHubAI/rh-finep4.0-unet/blob/main/README_cn.md)
- [RunningHub AI (sitio alternativo encontrado en la búsqueda, no verificado como oficial)](https://runninghubai.pro/)
