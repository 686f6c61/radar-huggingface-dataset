# RunningHubAI/rh-z-imagebase-fp16-4step-unet

## Resumen

rh-z-imagebase-fp16-4step-unet es un checkpoint de la red UNET para generación de imágenes a partir de texto (text-to-image), publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino (finetune) derivado de Z-image-base, según indica la propia model card, empaquetado en un único archivo de pesos de 11 740 MiB en precisión fp16 y diseñado para un muestreo de 4 pasos. Su formato y etiquetado (`comfyui`, `unet`) lo orientan al ecosistema ComfyUI y a la plataforma propietaria RunningHub.

El modelo no es un modelo de lenguaje ni un transformer de texto: es el componente UNET de un pipeline de difusión para síntesis de imágenes. Por tanto, su función es transformar ruido latente en imágenes condicionadas por un prompt textual, dentro de un flujo que requiere además un codificador de texto y un VAE que no se incluyen en este repositorio.

La relevancia de esta ficha es limitada por la escasez de información publicada: no hay datos sobre arquitectura interna, número de parámetros, composición del dataset de entrenamiento, licencia explícita ni benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 5 de noviembre de 2026, lo que sugiere una publicación muy reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión para text-to-image (detalle interno no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolución nativa no disponible) |
| Tipos de cuantización | fp16 (única variante publicada en este repo) |
| Idiomas soportados | no disponible (condicionamiento textual dependiente del codificador de texto del pipeline) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Z-Image(Base)_fp16_4step.safetensors`, 11 740 MiB) |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de una UNET de difusión para text-to-image, afinada a partir de Z-image-base y optimizada para un muestreo de 4 pasos. No se especifican el número de bloques, la dimensionalidad de los embeddings, el tipo de atención (self-attention, cross-attention), la resolución de entrenamiento ni el esquema de predicción (epsilon, v-prediction o flow matching). Tampoco se detalla si emplea arquitecturas derivadas de SDXL, SD3 o algún diseño propio de Z-image-base.

Respecto al entrenamiento, la model card no aporta número de tokens, número de imágenes, composición del dataset, resolución, técnicas de regularización ni si se empleó RLHF, DPO o preferencias humanas (poco habitual en modelos de difusión, pero posible vía fine-tuning por recompensa). El único dato técnico explícito es la configuración de 4 pasos, que implica destilación o un schedule de muestreo agresivo para reducir el coste de inferencia. No hay información sobre decodificación especulativa, atención lineal ni otras innovaciones.

## Capacidades

- Generación de imágenes a partir de prompts textuales (text-to-image) en un pipeline de difusión.
- Muestreo en 4 pasos, lo que reduce el número de evaluaciones de la UNET frente a schedulers de 20-50 pasos.
- Integración con ComfyUI mediante carga de la UNET como nodo del grafo.
- Integración con la plataforma RunningHub, que ofrece ejecución online y API.
- Pesos en fp16, compatibles con GPUs de consumo medio-alto sin necesidad de cuantización adicional.
- No se documentan capacidades de edición de imagen, inpainting, controlnet, visión, audio, tool calling ni agentes; al ser una UNET, estas funciones dependerían de componentes externos del pipeline.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: la UNET de 4 pasos permite iterar sobre prompts en ComfyUI con un coste de cómputo bajo por imagen, adecuado para explorar direcciones visuales antes de un render final de mayor calidad.
- Creación de assets para videojuegos y UI: generación de iconos, texturas o fondos en lotes mediante la API de RunningHub, integrable en un pipeline de build.
- Automatización de contenido para marketing: producción de variaciones de una imagen base a partir de plantillas de prompt, con la UNET como componente de un flujo mayor que incluya codificador de texto y VAE.
- Pruebas de concepto de modelos de difusión: servir como UNET de referencia para comparar schedulers, codificadores de texto o VAEs en un mismo pipeline ComfyUI.
- Investigación en destilación de difusión: al estar optimizada a 4 pasos, es un punto de partida para estudiar el equilibrio entre calidad y número de pasos.
- Despliegue en entornos con GPU limitada: el peso fp16 de ~11.7 GiB es manejable en GPUs de 16-24 GB, lo que permite ejecutar el pipeline completo en una estación de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 11 740 MiB (~11.5 GiB) en fp16; se necesita margen adicional para activaciones, codificador de texto y VAE, por lo que se recomienda un mínimo de 16 GB de VRAM y, para mayor holgura, 24 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) y H100 para despliegues de mayor throughput.
- GPU de consumo: cabe en RTX 4090 y RTX 3090; en GPUs de 12-16 GB requeriría cuantización adicional o descarga parcial a CPU, no documentada en este repo.
- Opciones de despliegue: ComfyUI (nativo, según los tags), RunningHub (online y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles; dependerán del scheduler de 4 pasos, la GPU y la resolución de salida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-z-imagebase-fp16-4step-unet | UNET de difusión (finetune de Z-image-base) | no disponible | no disponible | no disponible | Hugging Face, RunningHub |
| Z-image-base (upstream) | UNET de difusión base | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otras UNET para ComfyUI (p. ej. SDXL, SD3) | UNET de difusión | no disponible | no disponible | varía por modelo | Hugging Face, ComfyUI |

No se dispone de datos de rendimiento, parámetros ni licencia de los modelos comparables en la información proporcionada; la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Información muy escasa: no hay datos de arquitectura, parámetros, dataset ni evaluación, lo que impide validar su calidad frente a alternativas.
- Licencia no explicitada: la model card remite a la licencia del proyecto original o upstream; antes de un uso comercial es imprescindible verificar la licencia de Z-image-base y del pipeline completo.
- Riesgo de sesgos y alucinaciones visuales: al no documentarse la composición del dataset, no puede evaluarse el sesgo demográfico, cultural o estilístico; los modelos de difusión pueden generar contenido inexacto o estereotipado.
- Dependencia de componentes externos: el repositorio solo contiene la UNET; requiere codificador de texto, VAE y scheduler compatibles, cuya disponibilidad y licencia no se detallan.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Repositorio de gran tamaño: 12.3 GB, lo que complica su descarga y almacenamiento en entornos con cuotas ajustadas.
- Fecha de creación futura (2026-11-05): conviene verificar la integridad y procedencia del artefacto antes de desplegarlo.
- No apto para tareas de texto, código, razonamiento, tool calling ni agentes: es exclusivamente un componente de generación de imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-z-imagebase-fp16-4step-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2071732017724747777
- Workflow y aplicación asociados: https://www.runninghub.ai/zh-cn/post/2071819138141605889
- Página del autor: https://www.runninghub.ai/user-center/2065407779816169474
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
