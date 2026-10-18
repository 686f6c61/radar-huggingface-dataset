# MOSSImagefok/MOSS-Image-Base

## Resumen

MOSS-Image-Base es el modelo base de generación de imágenes a partir de texto (text-to-image) de la familia MOSS-Image, desarrollada por OpenMOSS. El modelo acepta indicaciones en lenguaje natural, secuencias de etiquetas y layouts en formato JSON, lo que permite controlar explícitamente la colocación del texto y la disposición de los objetos dentro de la imagen generada. Está publicado con licencia Apache-2.0 y pesos en formato diffusers (safetensors), con 5.082.308.624 parámetros totales y un repositorio de 27,2 GB que incluye transformer, text encoder y VAE.

La relevancia del modelo está en su enfoque en la generación de texto legible dentro de la imagen: la propia model card compara el resultado del modelo base con la variante SFT (MOSS-Image-SFT), mostrando en esta última una agrupación de texto más clara y un layout de pizarra más ordenado. El pipeline emplea muestreo flow-matching Euler con 50 pasos, CFG 3 y un mecanismo de *layer skipping* en la rama negativa (índice de capa 22), lo que reduce el coste de la guía al tiempo que mantiene dos pasadas del transformer por paso.

Se trata de un modelo recién publicado (18 de octubre de 2026) con 0 descargas y 1 «like» en el momento de la consulta, por lo que todavía no existe validación independiente de la comunidad. La integración está prevista en diffusers (pipeline personalizado), ComfyUI (plugin nativo vía ComfyUI Manager) y una demo Gradio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image con muestreo flow-matching (Euler); pipeline compuesto por transformer, text encoder y VAE (decoder «small» de FLUX.2) |
| Parametros totales | 5.082.308.624 (≈5,08 mil millones), según safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se documenta la longitud máxima del text encoder ni la resolución nativa máxima; los ejemplos usan 1024×1024) |
| Tipos de cuantizacion | bfloat16 para transformer y text encoder; float32 para VAE y ruido inicial. No se documentan GGUF, FP8 ni INT8 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, formato diffusers (custom pipeline `pipeline_moss_image`) |

Otros datos de la ficha: pipeline declarado `text-to-image`, etiqueta de región `us`, tamaño de repositorio 27,2 GB, 0 descargas y 1 «like» en la fecha de consulta.

## Arquitectura y entrenamiento

La información disponible describe un pipeline de difusión con muestreo flow-matching Euler. El transformer y el text encoder se cargan en bfloat16, mientras que el VAE y el ruido inicial se mantienen en float32; el VAE incluido utiliza el decoder «small» de FLUX.2. El control de la generación se ejerce mediante tres modos de prompt: lenguaje natural, secuencias de etiquetas y layouts JSON que especifican posición de texto y disposición de objetos. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

El aspecto técnico más singular documentado es el *negative-branch skipping*: por defecto, la guía utiliza dos pasadas del transformer por paso y omite la capa 22 (índice base cero) en la rama negativa, lo que abarata el CFG. Pasar `uncond_skip_layers=[]` desactiva este comportamiento. Los ajustes de muestreo por defecto son: sampler flow-matching Euler, 50 pasos, CFG 3, shift 5, prompt negativo vacío. Existe una variante SFT (MOSS-Image-SFT) que, según la comparativa cualitativa de la model card, produce mejor agrupación de texto y layouts más organizados; no se publican métricas cuantitativas de esa comparación.

## Capacidades

- Generación de imágenes a partir de texto en inglés y chino, con resolución de ejemplo 1024×1024.
- Control de la colocación de texto e objetos mediante layouts JSON, además de prompts en lenguaje natural y secuencias de etiquetas.
- Renderizado de texto dentro de la imagen (rótulos, notas manuscritas, pizarras, etiquetas), incluyendo texto en chino en el ejemplo oficial.
- Composición de escenas con múltiples objetos y relaciones espaciales descritas en el prompt.
- Integración con diffusers mediante pipeline personalizado (`trust_remote_code=True`) y compatibilidad con ComfyUI a través de plugin nativo.
- Soporte de CPU offload y compilación (torch.compile) según la guía rápida del proyecto.
- No se documentan capacidades de imagen a imagen, inpainting, edición, vídeo ni audio en la información disponible.

## Casos de uso

- Cartelería y material promocional con texto incrustado: el soporte de layouts JSON permite fijar la posición de titulares y subtítulos, algo útil para generar variantes de un mismo cartel en inglés y chino sin retoque manual del texto.
- Etiquetado de producto en e-commerce: generación de escenas de estudio con envases y etiquetas legibles, usando secuencias de etiquetas para describir el producto y el entorno.
- Prototipado de pizarras y wireframes: el modo JSON posiciona bloques de texto y elementos, adecuado para maquetas rápidas de interfaces o diagramas de proceso antes de pasar a diseño.
- Material educativo e infografías: generación de láminas con listas, notas y rótulos en dos idiomas, apoyándose en el modelo SFT de la misma familia cuando se requiera mayor claridad de agrupación de texto.
- Localización de creatividades: un mismo layout con prompts en `en` y `zh` permite producir pares de imágenes equivalentes para mercados angloparlante y chino.
- Base para ajuste fino vertical: al ser un modelo base con licencia Apache-2.0 y pipeline en diffusers, sirve como punto de partida para SFT o LoRA en dominios concretos (retail, editorial, formación).
- Integración en pipelines de producción creativa en ComfyUI: el plugin nativo permite encadenar el modelo con upscalers y postproceso dentro de un grafo reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente incluye una comparación cualitativa Base frente a SFT sobre un ejemplo de pizarra, sin métricas (FID, CLIP score, precisión de texto ni evaluaciones humanas). No se dispone de latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada: 5,08 mil millones de parámetros en bfloat16 equivalen a unos 10,2 GB solo en pesos; el repositorio completo ocupa 27,2 GB, por lo que el pipeline con text encoder y VAE requiere bastante más. Estimación orientativa: 16-24 GB de VRAM para inferencia a 1024×1024 en bfloat16 sin offload (cálculo propio a partir del recuento de parámetros, no dato del autor).
- GPU recomendadas: A100 (40/80 GB) y H100 (80 GB) para despliegue sin compromisos; RTX 4090 o RTX 3090 (24 GB) como opción de gama alta de consumo.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB; con CPU offload activado podría reducirse el requisito, aunque no se publican cifras oficiales.
- Opciones de despliegue: diffusers ≥0.38 con `custom_pipeline="pipeline_moss_image"` y `trust_remote_code=True`; ComfyUI mediante plugin nativo instalable desde ComfyUI Manager; interfaz Gradio incluida en el proyecto; soporte de CPU offload y compilación.
- Requisitos de software: Python 3.10 o superior, PyTorch 2.9 o superior con CUDA, transformers ≥5.3, accelerate ≥1.10, safetensors ≥0.6, Pillow ≥10.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos comparables son referencias públicas aproximadas y no se han verificado en la información proporcionada; los de MOSS-Image-Base proceden de su ficha.

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS-Image-Base | 5,08 B | 1024×1024 en los ejemplos; contexto del text encoder no disponible | Apache-2.0 | HuggingFace, ModelScope, diffusers, ComfyUI |
| FLUX.1-dev | ~12 B (referencia pública) | no disponible | no comercial (referencia pública) | HuggingFace, diffusers, ComfyUI |
| Qwen-Image | ~20 B (referencia pública) | no disponible | Apache-2.0 (referencia pública) | HuggingFace, diffusers, ComfyUI |
| Stable Diffusion 3.5 Large | ~8 B (referencia pública) | no disponible | Stability Community License (referencia pública) | HuggingFace, diffusers, ComfyUI |

Diferencias cualitativas: MOSS-Image-Base es el de menor número de parámetros del grupo y el único que documenta explícitamente layouts JSON para posicionamiento de texto, junto con una variante SFT publicada por el mismo equipo. No hay datos de rendimiento comparado.

## Limitaciones y advertencias

- Es un modelo base, no ajustado para calidad estética final: la propia model card muestra que la variante SFT produce textos mejor agrupados y layouts más ordenados, por lo que en producción con texto denso conviene evaluar SFT.
- Riesgo de texto mal formado o ilegible en la imagen: no se publican métricas de precisión de texto, y el fallo en el renderizado de glifos es habitual en modelos de difusión; requiere verificación manual.
- Idiomas documentados limitados a inglés y chino; el comportamiento en castellano no está declarado ni evaluado.
- Riesgo de alucinación visual: omisión o fusión de objetos y elementos del layout cuando el prompt es complejo; no hay evaluación publicada al respecto.
- Sesgos: no se documenta ninguna auditoría de sesgos ni composición del dataset de entrenamiento, por lo que se desconocen los sesgos demográficos y culturales del modelo.
- Licencia Apache-2.0 para el modelo, pero el VAE declarado es el decoder «small» de FLUX.2: conviene verificar la procedencia y las condiciones de cada componente antes de un uso comercial.
- El pipeline requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; hay que auditar o fijar la revisión antes de desplegar.
- La ficha consultada corresponde al espacio `MOSSImagefok/MOSS-Image-Base`, mientras que la model card apunta a `OpenMOSS-Team/MOSS-Image-Base` como repositorio oficial; verificar qué copia se está descargando.
- Madurez: 0 descargas y 1 «like» en la fecha de consulta, publicación del 18 de octubre de 2026, sin validación independiente conocida.
- No se documentan requisitos de VRAM ni latencias oficiales; las estimaciones de hardware son cálculos propios.

## Enlaces

- HuggingFace (ficha consultada): https://huggingface.co/MOSSImagefok/MOSS-Image-Base
- HuggingFace MOSS-Image-Base (oficial, según la model card): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- HuggingFace MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- ModelScope MOSS-Image-Base: https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope MOSS-Image-SFT: https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Image
- Guía de usuario (inglés): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guía de usuario (chino): https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Integración ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Workflow de ejemplo ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/example_workflows/moss-image.json
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Página del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe técnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Perfil en X: https://x.com/Open_MOSS
- Comunidad en Discord: https://discord.gg/nXFWEyvbb
