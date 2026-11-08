# Moser9815/comfy-images-models

## Resumen

`Moser9815/comfy-images-models` no es un modelo de IA entrenado, sino un repositorio agregador de 23,2 GB que contiene copias sin modificar de ficheros de modelos públicos de ComfyUI, organizados según la estructura de carpetas nativa de ComfyUI (`models/<carpeta>/<fichero>`). El autor lo mantiene para que un único endpoint serverless de RunPod pueda cachear todos los pesos necesarios para ejecutar varios pipelines de generación de imágenes, evitando descargas repetidas desde distintos repositorios de origen.

El contenido son componentes de inferencia (text encoders y VAEs) extraídos de tres proyectos de la organización Comfy-Org: MOSS-Image, Krea-2 y Qwen-Image-2.1. No incluye pesos de modelos de difusión completos ni código de inferencia, y cada fichero conserva la licencia de su repositorio de origen, que es heterogénea (Apache 2.0, Krea Community License y Qwen Research License).

Su relevancia es práctica y de infraestructura: sirve como bundle de caché reproducible para despliegues serverless de ComfyUI, no como modelo evaluable en benchmarks. No hay información sobre parámetros totales del conjunto, contexto, idiomas ni capacidades de generación más allá de lo que declaran los repositorios de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (agregado de componentes: text encoders basados en Qwen3 y VAEs) |
| Parámetros totales | no disponible como conjunto; componentes individuales: 9B (qwen3.5_9b_w4a8_gptq), 4B (qwen3vl_4b_fp8_scaled), 8B (qwen3vl_8b_int8_convrot) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A8 GPTQ, FP8 scaled, INT8 convrot, BF16 |
| Idiomas soportados | no disponible |
| Licencia | other (agregada); componentes bajo Apache 2.0, Krea Community License y Qwen Research License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena nada: agrega artefactos de inferencia ya publicados. Los text encoders corresponden a la familia Qwen3 (uno de 9B cuantizado a W4A8 GPTQ, uno de 4B en FP8 scaled y uno de 8B en INT8 con rotación de convolución), y los VAEs son los decodificadores de imagen asociados a cada pipeline (flux2-vae, qwen_image_vae y qwen_image_2.1_vae en BF16). La organización en carpetas replica la convención de ComfyUI para que el cargador de nodos los resuelva sin reconfiguración.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) en la model card; esos detalles pertenecen a los repositorios de origen (Comfy-Org/MOSS-Image, Comfy-Org/Krea-2, Comfy-Org/Qwen-Image-2.1) y no se reproducen aquí.

## Capacidades

- Almacenamiento y distribución de pesos de text encoders y VAEs para pipelines de generación de imágenes en ComfyUI.
- Codificación de prompts de texto mediante los text encoders Qwen3 incluidos (9B, 4B y 8B en distintas cuantizaciones).
- Decodificación latente a imagen mediante los VAEs incluidos (flux2-vae y qwen_image_vae / qwen_image_2.1_vae).
- Cacheo local para endpoints serverless (RunPod) con el fin de evitar descargas repetidas.
- No incluye tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking.
- No es un modelo de chat ni de generación de texto autónoma; su función es servir de dependencia binaria.

## Casos de uso

- Despliegue serverless en RunPod: montar el repositorio como volumen persistente para que un endpoint de ComfyUI arranque con los text encoders y VAEs ya presentes, reduciendo el tiempo de arranque en frío asociado a descargar 23,2 GB.
- Reproducibilidad de pipelines: fijar una versión concreta de los pesos (por fecha de actualización del repo) para que los workflows de MOSS-Image, Krea-2 y Qwen-Image-2.1 produzcan resultados consistentes entre entornos.
- CI/CD de workflows ComfyUI: usar el repo como artefacto de test en integración continua para validar que los nodos cargan correctamente los ficheros en la ruta `models/<carpeta>/<fichero>`.
- Entornos air-gapped: predescargar el bundle en una máquina con conectividad y transferirlo a un clúster sin acceso a Hugging Face.
- Comparación de cuantizaciones: al incluir el mismo text encoder en W4A8 GPTQ, FP8 scaled e INT8 convrot, permite medir diferencias de calidad y latencia entre formatos en un mismo hardware.
- Prototipado local con ComfyUI: copiar selectivamente solo los ficheros necesarios (por ejemplo, `qwen3vl_4b_fp8_scaled.safetensors` y `qwen_image_vae.safetensors`) para un pipeline concreto sin descargar el bundle completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del componente cargado. El text encoder de 9B en W4A8 GPTQ requiere del orden de 5-6 GB en pesos, el de 8B en INT8 unos 8 GB y el de 4B en FP8 unos 4 GB (estimaciones orientativas a partir del tamaño de parámetros y del formato, no publicadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; los formatos FP8 e INT8 convrot dependen del soporte de la GPU y del backend.
- Opciones de despliegue: ComfyUI (estructura de carpetas nativa) y endpoints serverless de RunPod. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamaño | Licencia | Uso previsto |
|---|---|---|---|---|
| Moser9815/comfy-images-models | Text encoders y VAEs de tres pipelines ComfyUI | 23,2 GB | other (mixta por componente) | Caché para endpoint serverless |
| Comfy-Org/MOSS-Image | Pipeline completo de origen | no disponible | Apache 2.0 | Generación de imágenes |
| Comfy-Org/Krea-2 | Pipeline completo de origen | no disponible | Krea Community License | Generación de imágenes |
| Comfy-Org/Qwen-Image-2.1 | Pipeline completo de origen | no disponible | Qwen Research License | Generación de imágenes |

No se dispone de datos de rendimiento para establecer una comparativa funcional; la comparación es de propósito y licencia, no de calidad.

## Limitaciones y advertencias

- No es un modelo entrenado ni evaluable: no debe citarse como modelo de IA en comparativas de capacidad.
- Licencia agregada "other" con componentes bajo Krea Community License y Qwen Research License, que imponen restricciones adicionales al uso comercial; es obligatorio revisar cada licencia de origen antes de desplegar.
- El uso comercial del bundle completo queda limitado por el componente más restrictivo, no por la licencia Apache 2.0 de los ficheros de MOSS-Image.
- No hay garantía de integridad ni de versionado: el repositorio puede actualizarse y romper la reproducibilidad si no se fija un commit concreto.
- El tamaño de 23,2 GB implica costes de almacenamiento y transferencia relevantes en entornos serverless.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de idioma porque el repositorio no expone un modelo generativo propio; esos riesgos dependen de los pipelines que lo consumen.
- Creado y actualizado en noviembre de 2026 con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Moser9815/comfy-images-models
- Comfy-Org/MOSS-Image: https://huggingface.co/Comfy-Org/MOSS-Image
- Comfy-Org/Krea-2: https://huggingface.co/Comfy-Org/Krea-2
- Comfy-Org/Qwen-Image-2.1: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Catálogo de modelos de ComfyUI: https://comfy.org/hub/models/
- Guía de ComfyUI 2026: https://think4ai.com/comfyui-complete-guide-2026/
