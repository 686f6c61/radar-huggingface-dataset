# asertvc/LUSTIFY-v2.0

## Resumen

LUSTIFY! v2.0 es un checkpoint de generación de imágenes texto-a-imagen derivado de Stable Diffusion XL (SDXL 1.0), desarrollado originalmente por el usuario coyotte y publicado en Civitai bajo el identificador 573152. El modelo se distribuye en Hugging Face a través del repositorio asertvc/LUSTIFY-v2.0, empaquetado en formato diffusers con la clase StableDiffusionXLPipeline. Su propósito declarado es la generación fotorrealista de escenas para adultos (NSFW) sin necesidad de LoRAs adicionales, aunque el autor indica que también produce imágenes SFW de objetos, animales y criaturas fantásticas.

La arquitectura subyacente es la de SDXL 1.0, un UNet de difusión latente con dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG), lo que sitúa el recuento de parámetros en aproximadamente 2.567 millones según los pesos safetensors del repositorio. El tamaño total del repo es de 27,8 GB, coherente con un checkpoint SDXL completo en precisión fp16 junto con componentes auxiliares (VAE, tokenizers, text encoders). No se dispone de información sobre licencia ni idiomas en los metadatos de Hugging Face.

La relevancia de esta ficha es doble: por un lado, documenta un fine-tune de SDXL orientado a un nicho concreto (fotorrealismo adulto) con receta de mezcla y entrenamiento explícita; por otro, sirve como caso de estudio de los riesgos de gobernanza en modelos de difusión: licencia no disponible, contenido sensible y dependencia de la infraestructura de terceros (Civitai) para la trazabilidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion latente SDXL 1.0 con doble text encoder (CLIP ViT-L + OpenCLIP ViT-bigG) y VAE |
| Parametros totales | 2.567.463.684 (pesos safetensors del repo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el limite practico es la longitud del prompt, ~75 tokens por bloque en CLIP) |
| Tipos de cuantizacion | no disponible en la model card; al ser SDXL es compatible con fp16, fp32 y cuantizaciones de la comunidad (fp8, GGUF) via herramientas de terceros |
| Idiomas soportados | no disponible (prompts en ingles segun los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo diffusers); el original en Civitai se distribuye como checkpoint .safetensors para A1111/ComfyUI |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de SDXL 1.0, no un LoRA ni un adaptador. La receta declarada por el autor para la v1 consistió en una mezcla lineal: 0,55 × (fine-tune SDXL propio no publicado) + 0,45 × (0,5 × bigASP + 0,5 × Pyro's NSFW), seguida de un fine-tune sobre un dataset curado de 1.000 imágenes para ajuste estético. Para la v2, el autor fusionó la v1 con NatVis al 20 % y entrenó sobre un nuevo conjunto de 1.700 imágenes durante aproximadamente 26.535 pasos adicionales.

El entrenamiento emplea prompts en formato mixto: etiquetas estilo Danbooru y lenguaje natural, lo que según el autor mejora la adherencia al prompt y la variedad de estilos en v2, a costa de una menor consistencia en escenas explícitas complejas. No se documentan detalles sobre el optimizador, la tasa de aprendizaje, el hardware de entrenamiento ni el uso de RLHF/DPO (no aplicable en difusión en este contexto). La innovación técnica es limitada: se trata de merging de checkpoints y fine-tuning supervisado clásico sobre SDXL, sin componentes arquitectónicos nuevos.

## Capacidades

- Generación de imágenes texto-a-imagen fotorrealistas a resolución nativa SDXL (1024×1024 y variantes).
- Comprensión de prompts en lenguaje natural y de etiquetas estilo Danbooru (mezcla de ambos formatos en el entrenamiento).
- Generación de contenido NSFW explícito sin LoRAs adicionales, según el autor.
- Generación de contenido SFW (objetos, animales, criaturas fantásticas) con prompting adecuado.
- Control estilístico mediante tags de cámara, película, iluminación y fotógrafos (p. ej. "shot on Polaroid SX-70", "cinematic lighting", "Ilford HP5 Plus").
- Compatibilidad con highres.fix y adetailer para corregir caras y manos en planos lejanos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de modo thinking, visión de entrada ni audio.

## Casos de uso

- Generación de arte conceptual para adultos: el modelo está entrenado específicamente para producir escenas NSFW fotorrealistas sin LoRAs, lo que simplifica pipelines de estudio que antes requerían cadenas de adaptadores.
- Prototipado rápido de estilos fotográficos: los tags de cámara y película permiten explorar estéticas analógicas (Polaroid, Kodak, Ilford) en un solo checkpoint, útil para directores de arte que evalúan referencias.
- Ilustración de ficción y fantasía: el autor documenta capacidad para criaturas fantásticas y animales, aprovechable en juegos de rol, narrativa serializada o contenido editorial de género.
- Banco de imágenes sintéticas para pruebas de pipelines: al ser un SDXL estándar, sirve para validar integraciones con diffusers, ComfyUI o A1111 antes de pasar a modelos con licencia clara.
- Investigación sobre sesgos y seguridad en difusión: su naturaleza NSFW y la ausencia de licencia lo convierten en un caso útil para estudiar filtración de contenido sensible, eficacia de clasificadores de seguridad y comportamiento de merges de checkpoints.
- Restauración estética mediante img2img: con highres.fix y denoising ~0,4 el autor recomienda su uso para refinado de planos lejanos, aplicable a workflows de upscaling con control de detalle.
- Educación técnica sobre merging de checkpoints: la receta publicada (mezclas porcentuales y pasos de fine-tune) es un ejemplo didáctico de cómo se construyen checkpoints comunitarios de SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros checkpoints. El autor solo aporta valoraciones cualitativas: mejor comprensión de lenguaje natural y mayor variedad estilística en v2, con peor consistencia en escenas explícitas complejas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8-10 GB para SDXL a 1024×1024 con atención optimizada; en fp32 se duplica y supera los 16 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para comodidad con highres.fix; A100/H100 para lotes grandes o servicio concurrente.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con fp16 y atención eficiente; en GPUs de 8 GB requiere offloading o cuantización fp8/GGUF.
- Opciones de despliegue: diffusers (StableDiffusionXLPipeline), ComfyUI, Automatic1111, Fooocus (el autor advierte desactivar "Fooocus Enhance"), InvokeAI; para servicio, endpoints compatibles con diffusers y contenedores con TGI no aplica (TGI no soporta difusión de forma nativa).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del sampler (el autor recomienda DPM++ 2M/3M SDE con 30 pasos), la resolución y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUSTIFY! v2.0 | ~2.567 M | 1024×1024 (SDXL) | no disponible (sin benchmarks) | no disponible | Hugging Face (asertvc) y Civitai |
| SDXL 1.0 base | ~2.567 M | 1024×1024 | benchmarks publicados por Stability AI | CreativeML Open RAIL++-M | Hugging Face (stabilityai) |
| bigASP | ~2.567 M (SDXL) | 1024×1024 | no disponible | no disponible | Civitai |
| Pyro's NSFW | ~2.567 M (SDXL) | 1024×1024 | no disponible | no disponible | Civitai |

Los tres comparables son checkpoints SDXL de la comunidad; la diferencia principal es la licencia (solo SDXL base tiene licencia explícita) y la trazabilidad. No se dispone de datos cuantitativos para comparar calidad entre ellos.

## Limitaciones y advertencias

- Contenido NSFW explícito: el modelo está diseñado para generar material para adultos; su uso en productos accesibles a menores requiere filtrado y control de acceso.
- Licencia no disponible: no se puede verificar si el uso comercial está permitido; además, al derivar de SDXL 1.0, arrastra las obligaciones de la CreativeML Open RAIL++-M, que incluyen restricciones de uso.
- Trazabilidad limitada: el modelo original vive en Civitai y el repo de Hugging Face es una réplica de terceros (asertvc), sin verificación de integridad ni del autor original.
- Alucinación visual: el autor reconoce manos y caras defectuosas en planos lejanos, mitigables con inpainting o adetailer.
- Menor consistencia en escenas explícitas complejas en v2 respecto a v1, según el propio autor.
- Sesgos no documentados: no hay análisis de sesgos de género, etnia o cuerpo; los datasets de origen (bigASP, Pyro's NSFW, NatVis) no publican su composición.
- Idioma: los prompts de ejemplo son en inglés; el soporte multilingüe no está verificado.
- Longitud de prompt limitada por CLIP (~75 tokens por bloque); prompts largos requieren técnicas de composición.
- Riesgo de reproducir contenido no consentido si se usa con nombres o descripciones de personas reales; requiere políticas de uso explícitas.
- Dependencia de herramientas de terceros (ComfyUI, A1111) para highres.fix y adetailer; no hay soporte oficial.

## Enlaces

- Hugging Face (réplica): https://huggingface.co/asertvc/LUSTIFY-v2.0
- Réplica alternativa en Hugging Face: https://huggingface.co/TheImposterImposters/LUSTIFY-v2.0
- Árbol de archivos de la réplica alternativa: https://huggingface.co/TheImposterImposters/LUSTIFY-v2.0/tree/main
- Modelo original en Civitai: https://civitai.com/models/573152
- bigASP (Civitai): https://civitai.com/models/502468?modelVersionId=558487
- Pyro's NSFW (Civitai): https://civitai.com/models/133808?modelVersionId=324958
- NatVis (Civitai): https://civitai.com/models/617652?modelVersionId=690475
- Guía de prompting de PromptGeek: https://civitai.com/models/118213/creating-photorealistic-images-with-ai-using-stable-diffusion
- SDXL 1.0 base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
