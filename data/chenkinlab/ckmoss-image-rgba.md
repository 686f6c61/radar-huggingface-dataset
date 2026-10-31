# ChenkinLab/CKMoss-Image-RGBA

## Resumen

CKMoss-Image-RGBA es un proyecto de ChenkinLab (autor: chinoll) que añade soporte de generación de imágenes con canal alfa (transparencia real) al modelo MOSS-Image-SFT de OpenMOSS. No es un modelo de difusión completo, sino un conjunto de dos componentes: un VAE RGBA de 336 MB, ya fusionado y listo para cargar, y un LoRA opcional para el DiT de MOSS-Image de 298 MB. El problema que resuelve es la falta de salidas PNG con transparencia nativa en los modelos de texto a imagen convencionales, algo especialmente útil para material de personajes, collages de ilustración y composición por capas.

El proyecto se distribuye como adaptador (adapter) sobre OpenMOSS-Team/MOSS-Image-SFT y está pensado para integrarse en ComfyUI mediante nodos personalizados. Una característica destacable es su flexibilidad: el VAE RGBA puede usarse solo, sin el LoRA, manteniendo el modelo base MOSS-Image intacto; el LoRA únicamente mejora la adaptación a la generación de imágenes transparentes y el comportamiento de los bordes. El proyecto se basa en MOSS-Image y en el autoencoder de FLUX.2 (FLUX.2 VAE) de Black Forest Labs.

Su relevancia actual radica en la creciente demanda de flujos de trabajo de generación de assets con transparencia para diseño, videojuegos y producción audiovisual, donde el recorte post-generación suele producir bordes defectuosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE RGBA + LoRA para DiT (adaptador sobre MOSS-Image-SFT) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base MOSS-Image-SFT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en (prompts) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (VAE: 336 MB; LoRA: 298 MB) |

## Arquitectura y entrenamiento

El proyecto consta de dos piezas. La primera es un VAE RGBA que sustituye al VAE original de MOSS-Image y permite codificar y decodificar imágenes con canal alfa de 4 canales, de modo que la salida directa del pipeline de texto a imagen es un PNG con transparencia. Según la model card, el VAE está inspirado en el autoencoder de FLUX.2 de Black Forest Labs y se distribuye ya fusionado, sin necesidad de pasos adicionales. La segunda pieza es un LoRA opcional para el DiT de MOSS-Image-SFT, entrenado para adaptar el modelo base a la generación de imágenes con fondo transparente; la model card indica que las combinaciones con y sin LoRA producen resultados distintos en transparencia y calidad de bordes.

No se han publicado detalles sobre el número de tokens, la composición del dataset de entrenamiento ni el uso de técnicas concretas de entrenamiento (RLHF/DPO no aplican a este tipo de modelo). La model card menciona apoyo de datos de niangao2331, pero sin cifras. Tampoco se especifica la resolución de trabajo ni el método exacto de fusión del canal alfa en el espacio latente.

## Capacidades

- Generacion de texto a imagen con canal alfa: produce PNG RGBA con transparencia real, sin recorte posterior.
- Dos modos de uso: solo VAE RGBA (sin modificar el DiT base) o VAE RGBA + LoRA DiT para mejor adaptación a fondos transparentes.
- Composición por capas: las salidas son aptas para collage de ilustraciones, sprites y material de personajes.
- Integración con ComfyUI mediante nodos personalizados y workflows listos para usar (`vae_only.json` y `with_lora.json`, con intensidad de LoRA por defecto de 1.0).
- Soporte de prompts en chino e inglés, con la sugerencia de añadir `transparent background` al final del prompt.
- Control de contenido mediante descripción de sujeto, apariencia, pose y estilo en el prompt.
- No es un modelo de lenguaje: no ofrece generación de texto, razonamiento, código, tool calling ni capacidades de agente.

## Casos de uso

- Creacion de assets para videojuegos: generación de sprites y personajes con transparencia nativa, evitando el recorte manual y los bordes dentados típicos de la segmentación post-generación.
- Ilustracion y collage: composición de ilustraciones en capas donde cada elemento se genera ya recortado, agilizando el flujo de trabajo en editores como Photoshop o Krita.
- Produccion audiovisual y motion graphics: obtención de elementos gráficos (props, personajes, objetos) listos para superponer sobre vídeo o fondos sin chroma key.
- Stickers y material gráfico para mensajería o redes sociales: generación directa de pegatinas con fondo transparente.
- Prototipado rapido de diseño: iteración de personajes y objetos con prompts de pose y estilo, integrado en el workflow de ComfyUI del diseñador.
- Generacion de material para e-commerce o catálogos: creación de imágenes de producto u objetos aislados sobre fondo transparente para maquetación.
- Fine-tuning y experimentacion: el LoRA sirve como referencia para quienes investigan adaptación de DiTs a espacios latentes con alfa, pudiendo combinarse con otros LoRAs de MOSS-Image.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un VAE y un LoRA para generación de imágenes, no aplican benchmarks de lenguaje (MMLU, HumanEval, etc.). Tampoco se publican métricas de calidad de transparencia ni de bordes; la model card ofrece únicamente muestras visuales generadas con el conjunto VAE + LoRA, con prompts y seeds disponibles en `samples/manifest.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explicitamente; los pesos propios del proyecto son ligeros (336 MB el VAE, 298 MB el LoRA), pero el consumo real depende del modelo base MOSS-Image-SFT y de su texto encoder, que deben descargarse aparte.
- GPU recomendadas: no disponible; al ejecutarse en ComfyUI, cualquier GPU compatible con MOSS-Image-SFT debería ser suficiente para cargar el VAE y el LoRA.
- Consumer GPU: no disponible como dato oficial; dado que los componentes añadidos son pequeños, la limitación principal será la del modelo base, no este adaptador.
- Despliegue: ComfyUI (nodos personalizados en `ComfyUI/custom_nodes/`), con pesos en `ComfyUI/models/vae/` y `ComfyUI/models/loras/`. También existe un punto de entrada Python en el repositorio de código del modelo. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un pipeline de difusión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Transparencia nativa | Licencia |
|---|---|---|---|---|
| CKMoss-Image-RGBA | VAE RGBA + LoRA sobre MOSS-Image-SFT | 0,6 GB (VAE 336 MB + LoRA 298 MB) | Si (canal alfa) | GPL-3.0 |
| MOSS-Image-SFT (base) | Modelo de texto a imagen (DiT) | no disponible | No | no disponible |
| FLUX.2 Autoencoder (Black Forest Labs) | VAE de referencia | no disponible | No (RGB) | no disponible |

No hay alternativas directas publicadas con las que comparar números de rendimiento; la comparación se limita a los componentes de los que deriva el proyecto. Otros enfoques habituales para transparencia (matting post-generación con herramientas como SAM o rembg) no se comparan aquí por falta de datos publicados.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar aparte el modelo base MOSS-Image-SFT y su texto encoder, lo que añade complejidad de instalación.
- La calidad de la transparencia y de los bordes varía según se use solo el VAE o VAE + LoRA; la model card no cuantifica las diferencias.
- Licencia GPL-3.0: es una licencia copyleft fuerte. Cualquier obra derivada del código debe distribuirse bajo la misma licencia, lo que puede ser restrictivo para integraciones comerciales cerradas. Los términos de los componentes de terceros (MOSS-Image, FLUX.2 VAE) deben revisarse en el archivo NOTICE.
- Idiomas de prompt limitados a chino e inglés según la model card.
- Proyecto muy reciente (creado en octubre de 2026) con 0 descargas registradas en HuggingFace: escasa evidencia de uso en producción y posible presencia de errores tempranos.
- Riesgos de alucinación o sesgos: no aplicables directamente al no ser un modelo de lenguaje, pero hereda los sesgos del modelo base MOSS-Image-SFT y de sus datos de entrenamiento, sobre los que no hay documentación en este repositorio.
- `inference: false` en la configuración: el modelo no está habilitado para la API de inferencia serverless de HuggingFace; debe ejecutarse localmente.
- No hay datos de resolución máxima, rendimiento de bordes en escenas complejas ni estabilidad del canal alfa fuera de las muestras mostradas.

## Enlaces

- HuggingFace: https://huggingface.co/ChenkinLab/CKMoss-Image-RGBA
- VAE RGBA (safetensors, 336 MB): https://huggingface.co/ChenkinLab/CKMoss-Image-RGBA/blob/main/vae/moss_rgba_vae.safetensors
- LoRA DiT (safetensors, 298 MB): https://huggingface.co/ChenkinLab/CKMoss-Image-RGBA/blob/main/loras/moss_rgba_dit_lora.safetensors
- Workflow solo VAE: https://huggingface.co/ChenkinLab/CKMoss-Image-RGBA/blob/main/workflows/vae_only.json
- Workflow con LoRA: https://huggingface.co/ChenkinLab/CKMoss-Image-RGBA/blob/main/workflows/with_lora.json
- Muestras generadas: https://huggingface.co/ChenkinLab/CKMoss-Image-RGBA/tree/main/samples
- Nodos de ComfyUI (GitHub): https://github.com/Chenkin-x/ComfyUI-CKMoss-Image-RGBA
- Codigo del modelo (GitHub): https://github.com/Chenkin-x/CKMoss-Image-RGBA
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- MOSS-Image (GitHub): https://github.com/OpenMOSS/MOSS-Image
- Instrucciones oficiales de ComfyUI para MOSS-Image: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- FLUX.2 Autoencoder (referencia del VAE): https://github.com/black-forest-labs/flux2
