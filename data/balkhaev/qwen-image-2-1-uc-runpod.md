# Balkhaev/Qwen-Image-2.1-UC-RunPod

## Resumen

Qwen-Image-2.1-UC-RunPod es un mirror de pesos cuantizados para generación de imágenes, publicado por el usuario Balkhaev en Hugging Face. No es un modelo original: se trata de copias byte-idénticas de tres ficheros del repositorio `abenzerps/Qwen-Image-2.1-Uncensored-Quantized` (a su vez una cuantización del modelo base `Qwen/Qwen-Image-2.1` de Alibaba/Qwen), reorganizados en la estructura de carpetas de ComfyUI y pensados para su despliegue en RunPod mediante el worker de imágenes de MediaPipes.

El paquete incluye el modelo de difusión cuantizado a int8 (con rotación de convoluciones, "convrot"), el codificador de texto Qwen3-VL de 8B también en int8, y el VAE en bf16. El sufijo "UC" (uncensored) indica que se trata de una variante sin las restricciones de seguridad del modelo original, lo cual es relevante tanto para su utilidad como para los riesgos de su uso.

Su relevancia práctica reside en la comodidad del despliegue: los pesos ya están dispuestos en las rutas que ComfyUI espera (`diffusion_models`, `text_encoders`, `vae`) y pre-cachedos para RunPod, lo que evita descargar y reorganizar manualmente unos 17,3 GB. Cabe señalar que la versión oficial de referencia es `Qwen/Qwen-Image-2.1`, y que esta ficha describe un artefacto derivado y no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de imágenes (MMDiT según la familia Qwen-Image; no confirmado en la model card) con codificador de texto Qwen3-VL 8B y VAE |
| Parametros totales | No disponible (base Qwen-Image-2.1; el tamaño de los ficheros sugiere ~7-8 GB para el diffusion model en int8) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 con convrot (diffusion model y text encoder), bf16 (VAE) |
| Idiomas soportados | No disponible |
| Licencia | Qwen RESEARCH LICENSE AGREEMENT (solo uso no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El paquete se compone de tres componentes estándar de un sistema de difusión de texto a imagen. El primero es el modelo de difusión propiamente dicho (`qwen-image-2.1-UC-int8_convrot.safetensors`, ~7,26 GB), cuantizado a int8 con la técnica "convrot" (rotación aplicada a las capas de convolución para reducir el error de cuantización). El segundo es el codificador de texto basado en Qwen3-VL de 8B (`qwen3vl_8b_int8_convrot.safetensors`, ~9,35 GB), un modelo multimodal de visión-lenguaje que actúa como extractor de representaciones del prompt. El tercero es el VAE en bf16 (~676 MB), encargado de codificar y decodificar imágenes en el espacio latente.

Sobre el entrenamiento del modelo base `Qwen/Qwen-Image-2.1` (número de tokens o imágenes, composición del dataset, uso de RLHF/DPO) no hay datos en la información disponible. Tampoco se documenta el proceso exacto de "uncensoring" aplicado en la cuantización de `abenzerps/Qwen-Image-2.1-Uncensored-Quantized`; el nombre sugiere la eliminación de filtros de seguridad o de alineación del modelo oficial, pero el método concreto no está descrito en la model card.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), heredada del modelo base Qwen-Image-2.1.
- Codificación de prompts mediante Qwen3-VL 8B, que al ser un modelo vision-language puede ofrecer mejor comprensión de prompts complejos que un codificador de texto puro (capacidad multimodal del encoder; el pipeline completo es text-to-image según la información disponible).
- Compatibilidad con ComfyUI: los pesos están organizados en las carpetas estándar (`diffusion_models/`, `text_encoders/`, `vae/`).
- Compatibilidad con el worker de imágenes de MediaPipes en RunPod (`workers/runpod-images`, variable `IMAGES_CACHE_MODEL_ID`).
- Ausencia de filtros de seguridad del modelo original (variante "uncensored"), lo que permite generar contenido que el modelo oficial bloquearía, con los riesgos éticos y legales asociados.

No hay información sobre tool calling, agentes ni soporte de idiomas específicos del prompt.

## Casos de uso

- Generación de imágenes en la nube sin GPU local: desplegando el worker de MediaPipes en RunPod, un desarrollador puede servir imágenes vía API sin instalar nada en local, aprovechando que los pesos ya están cacheados.
- Pipelines de ComfyUI autoalojados: los ficheros se copian directamente a las carpetas de ComfyUI, ideal para flujos de trabajo con nodos personalizados (inpainting, ControlNet, upscaling) sobre este modelo.
- Generación de contenido creativo sin restricciones: artistas que necesiten producir imágenes que el modelo oficial filtra (contenido maduro artístico, por ejemplo) pueden usar esta variante, asumiendo su responsabilidad legal.
- Prototipado rápido de aplicaciones text-to-image: la cuantización int8 reduce los requisitos de VRAM respecto a los pesos originales, facilitando pruebas en GPUs de gama alta de consumo.
- Integración en workers serverless de imágenes: el formato preempaquetado con `IMAGES_CACHE_MODEL_ID` está pensado para despliegues reproducibles en infraestructura RunPod.
- Investigación sobre cuantización de modelos de difusión: los ficheros int8 con convrot sirven como ejemplo real de cuantización agresiva de un diffusion transformer y su text encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, benchmarks tipo GenEval o DPG-Bench) ni comparativas con el modelo original sin cuantizar.

## Requisitos de hardware

- VRAM estimada: los tres componentes suman ~17,3 GB en disco. En inferencia, con el diffusion model en int8 (~7,3 GB), el text encoder en int8 (~9,4 GB) y el VAE en bf16 (~0,7 GB), se estima que se necesita al menos 20-24 GB de VRAM si se cargan todos los componentes simultáneamente; con offloading secuencial (descargar el text encoder tras codificar el prompt) podría funcionar en menos. No hay cifras oficiales.
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090, A100 40 GB, H100, o cualquier GPU de RunPod con ≥24 GB de VRAM.
- En consumer GPU: plausible en una RTX 3090/4090 de 24 GB, probablemente con offloading; no confirmado por el autor.
- Despliegue: ComfyUI (formato nativo de los pesos), RunPod con el worker de MediaPipes (`workers/runpod-images`). No se menciona soporte directo para diffusers, vLLM u Ollama (estos últimos no aplican a modelos de difusión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| Qwen-Image-2.1-UC-RunPod (este) | Difusion text-to-image (variante uncensored) | int8 convrot + bf16 VAE | Qwen Research (no comercial) | Empaquetado para ComfyUI/RunPod, mirror no oficial |
| Qwen/Qwen-Image-2.1 (base oficial) | Difusion text-to-image | Pesos originales | Qwen Research (no comercial) | Version oficial de Alibaba, con alineacion y filtros |
| abenzerps/Qwen-Image-2.1-Uncensored-Quantized | Difusion text-to-image (variante uncensored) | int8 convrot + bf16 VAE | Qwen Research (no comercial) | Repositorio origen del que este mirror copia los ficheros |

Para alternativas con licencia comercial (FLUX, Stable Diffusion 3.5, etc.) no hay datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- Licencia restrictiva: la Qwen RESEARCH LICENSE AGREEMENT permite únicamente uso y distribución no comerciales. Cualquier uso en producto o servicio comercial infringe la licencia, y esto aplica también a los pesos cuantizados y al mirror.
- Variante "uncensored": se han eliminado o degradado las salvaguardas del modelo oficial. Esto implica riesgo elevado de generación de contenido dañino, ilegal o no consentido (deepfakes, NSFW, violencia). La responsabilidad legal recae íntegramente en el usuario.
- Riesgo de degradación por cuantización: la cuantización int8 con convrot puede introducir artefactos visuales o pérdida de fidelidad respecto a los pesos originales; no hay evaluaciones publicadas que cuantifiquen esta pérdida.
- Procedencia no oficial: el mirror es de un tercero (Balkhaev), con 0 descargas en el momento de la ficha. Aunque se publican hashes SHA-256 para verificación, se recomienda comprobarlos antes de usar los ficheros y, en entornos sensibles, preferir el repositorio origen o el modelo oficial.
- Sesgos: heredados del modelo base Qwen-Image-2.1; no hay documentación específica sobre sesgos en la información disponible.
- Alucinación/fidelidad: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible en imágenes y fallos de adherencia al prompt; sin datos cuantitativos disponibles.
- Tamaño considerable (~17,3 GB) que exige ancho de banda y almacenamiento adecuados para el despliegue.

## Enlaces

- Ficha del modelo (mirror): https://huggingface.co/Balkhaev/Qwen-Image-2.1-UC-RunPod
- Repositorio origen de la cuantización: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
- Modelo base oficial: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia (en el mirror): https://huggingface.co/Balkhaev/Qwen-Image-2.1-UC-RunPod/blob/main/LICENSE
- Paper, blog oficial y demos: no disponibles en la informacion proporcionada.
