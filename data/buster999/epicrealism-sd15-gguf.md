# Buster999/epiCRealism-SD15-GGUF

## Resumen

epiCRealism-SD15-GGUF es una conversión a formato GGUF del modelo de difusión Stable Diffusion 1.5, publicada por el usuario Buster999 en HuggingFace. El modelo base es epiCRealism, una variante de SD 1.5 orientada a la generación de imágenes fotorrealistas. Esta versión GGUF está pensada para su uso con herramientas de inferencia que admiten dicho formato, como ComfyUI o stable-diffusion.cpp, en lugar del formato original de pesos de PyTorch.

El repositorio cuenta con 1.066.235.307 parámetros, cifra coherente con la arquitectura UNet de SD 1.5, y un tamaño de 8,6 GB, lo que sugiere que incluye varias cuantizaciones del modelo (habitualmente Q4, Q8 y fp16/fp32) junto con los componentes auxiliares (VAE y codificador de texto CLIP). La licencia es CreativeML OpenRAIL-M, la misma que emplea Stable Diffusion 1.5.

La relevancia de esta ficha es limitada: se trata de una republicación de un modelo derivado, sin model card descriptiva (el README solo contiene la declaración de licencia), sin métricas de rendimiento publicadas y sin descargas ni valoraciones en el momento de la consulta. Resulta útil únicamente como artefacto de despliegue para quien ya conozca epiCRealism y quiera ejecutarlo en un runtime GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente (UNet + VAE + codificador de texto CLIP), base Stable Diffusion 1.5 |
| Parámetros totales | 1.066.235.307 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el prompt de texto de SD 1.5 se limita a 77 tokens por segmento; no confirmado en esta conversión) |
| Tipos de cuantización | no disponible en la información proporcionada (el tamaño de 8,6 GB sugiere múltiples variantes) |
| Idiomas soportados | no disponible |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un modelo de difusión latente de tipo Stable Diffusion 1.5: una UNet que opera sobre representaciones latentes comprimidas por un VAE, condicionada por embeddings de texto de un codificador CLIP. La variante epiCRealism es un fine-tune de SD 1.5 especializado en estética fotorrealista, habitualmente entrenado mediante ajuste fino adicional sobre el checkpoint base con datasets de imágenes reales y, en muchos derivados de la comunidad, con técnicas como DreamBooth o LoRA fusionados.

No se dispone de información sobre el dataset de entrenamiento de epiCRealism, el número de pasos de ajuste fino, el uso de RLHF/DPO (no aplicable en la práctica a este tipo de modelos) ni innovaciones técnicas específicas. La conversión a GGUF la realiza el publicador del repositorio (Buster999) y no el autor original del modelo; no se documenta el método de cuantización empleado ni las herramientas utilizadas.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) en estilos fotorrealistas.
- Generación condicionada por imagen (image-to-image) en los runtimes que lo soportan.
- Uso de prompts negativos para control de estilo y calidad.
- Compatibilidad con herramientas de muestreo habituales (Euler, DPM++ y similares) según el runtime.
- Soporte de LoRA y ControlNet en la medida en que el runtime GGUF lo permita (no confirmado para esta conversión).
- Inpainting y outpainting: no disponible de forma nativa; requeriría un modelo específico o pipeline adicional.
- Tool calling / function calling: no aplicable (modelo generativo de imágenes).
- Capacidades multilingües: no documentadas; el condicionamiento de texto depende del tokenizador CLIP de SD 1.5, predominantemente inglés.

## Casos de uso

- Generación de ilustraciones fotorrealistas para prototipado de producto: el modelo permite iterar sobre conceptos visuales con prompts de texto en entornos con recursos limitados, usando la cuantización GGUF que mejor equilibre calidad y VRAM.
- Despliegue en equipos sin GPU de gama alta: al estar en GGUF, puede ejecutarse en CPU o en GPUs consumer mediante stable-diffusion.cpp o ComfyUI con nodos GGUF, algo inviable con pesos fp16 completos en algunos entornos.
- Creación de material gráfico para blogs y documentación técnica: generación de imágenes de cabecera o ilustraciones conceptuales a partir de descripciones textuales, con control mediante prompts negativos.
- Integración en pipelines de automatización de contenido: scripts que invocan el runtime GGUF para producir lotes de imágenes a partir de plantillas de prompt, útil en flujos de marketing o publicación.
- Experimentación e investigación sobre cuantización: el repositorio permite comparar la degradación de calidad entre variantes GGUF y el modelo original, como caso de estudio de compresión de modelos de difusión.
- Base para ajuste fino o fusión de LoRA: al derivar de SD 1.5, es compatible con el ecosistema de LoRA y adaptadores de la comunidad, aunque el ajuste sobre pesos GGUF requiere conversión previa a safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión para esta conversión. Como referencia, SD 1.5 en fp16 requiere aproximadamente 4-6 GB de VRAM para inferencia a 512x512; las cuantizaciones GGUF de 4 bits pueden reducir el requisito a 2-3 GB, aunque el dato no está confirmado para este repositorio.
- GPU recomendadas: no documentadas por el autor. Por el tamaño del modelo base, cabría esperar funcionamiento en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100, así como en GPUs con 4-8 GB mediante cuantización.
- GPU consumer: sí, previsiblemente en la mayoría de GPUs con 6 GB o más, y en algunas de 4 GB con cuantización agresiva; sin confirmación oficial.
- Opciones de despliegue: ComfyUI (con nodos GGUF), stable-diffusion.cpp, y otros runtimes que admitan GGUF para modelos de difusión. No es compatible con vLLM, TGI ni Ollama, que no soportan modelos de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| epiCRealism-SD15-GGUF (este) | 1.066.235.307 | no disponible | GGUF | CreativeML OpenRAIL-M | HuggingFace, 0 descargas |
| Stable Diffusion 1.5 (original) | ~983 M (UNet) | 77 tokens de prompt | safetensors, ckpt | CreativeML OpenRAIL-M | Amplia, referencia de la comunidad |
| epiCRealism (original, RunDiffusion) | ~983 M (UNet) | 77 tokens de prompt | safetensors, ckpt | CreativeML OpenRAIL-M | Amplia, usado en Civitai y ComfyUI |
| SDXL | ~2.600 M (UNet) | 77 tokens por segmento | safetensors | CreativeML OpenRAIL++-M | Amplia, mayor calidad y requisitos |

La comparación con el original epiCRealism es la más directa: esta conversión GGUF ofrece el mismo modelo con un formato pensado para runtimes ligeros, a costa de una posible pérdida de calidad según la cuantización y de una menor compatibilidad con el ecosistema estándar (LoRA, extensiones de la WebUI). Frente a SDXL, este modelo es más pequeño y ligero, pero con menor resolución nativa y calidad fotorrealista inferior en términos generales.

## Limitaciones y advertencias

- La model card no contiene descripción técnica: solo la declaración de licencia. No hay información sobre el proceso de conversión, las cuantizaciones incluidas ni los componentes empaquetados.
- Sin descargas ni valoraciones: no hay evidencia de uso ni validación por parte de la comunidad.
- Riesgo de sesgos: al derivar de SD 1.5 y de un fine-tune fotorrealista, es probable que herede sesgos demográficos y estilísticos del dataset original; no se documenta mitigación alguna.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y artefactos, especialmente en resoluciones distintas de la nativa (512x512).
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos, obligación de incluir la licencia y sus restricciones en redistribuciones). No es una licencia de código abierto permisiva al uso.
- Compatibilidad limitada: los LoRA y extensiones diseñados para safetensors no se aplican directamente sobre GGUF sin conversión.
- Idiomas: el condicionamiento de texto de CLIP está entrenado predominantemente en inglés; prompts en castellano pueden degradar la calidad.
- Fecha de creación del repositorio (2026-11-03) posterior a la consulta: conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Buster999/epiCRealism-SD15-GGUF
- Modelo original epiCRealism (RunDiffusion): no disponible en la información proporcionada
- Stable Diffusion 1.5 (base): https://huggingface.co/runwayml/stable-diffusion-v1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- stable-diffusion.cpp (runtime GGUF): https://github.com/leejet/stable-diffusion.cpp
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
