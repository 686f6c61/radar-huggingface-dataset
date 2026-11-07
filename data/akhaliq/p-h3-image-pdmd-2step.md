# akhaliq/p-h3-image-pdmd-2step

## Resumen

P-H3-Image pDMD 2-Step LoRA es un adaptador LoRA de destilación para el modelo de generación de imágenes PrunaAI/P-H3-Image (basado en MiniMax-H3). Lo publica el usuario akhaliq en Hugging Face y su función es habilitar un modo de generación de texto a imagen en solo dos pasos de denoising, sin classifier-free guidance (CFG) y con el mismo esquema de prompting que el modelo base. El adaptador incorpora la técnica pDMD 2-NFE (paper arXiv 2609.35768), con rango 128 aplicado sobre las capas de atención y feed-forward de los 50 bloques del transformer de imagen.

El problema que resuelve es el coste computacional de la inferencia en modelos de difusión: el modelo base necesita 8 pasos para producir una imagen coherente, mientras que con este LoRA integrado se obtienen resultados "usables" (nítidos y coherentes) en 2 pasos, y prácticamente indistinguibles del baseline de 8 pasos en 4 pasos. Según la model card, a 2912×2912 píxeles y 2 pasos el tiempo por imagen es de aproximadamente 2,9 segundos en una RTX PRO 6000, lo que supone una reducción drástica del coste por imagen en producción.

El repositorio (6,1 GB) incluye el LoRA en un único archivo safetensors en bf16, byte-idéntico al release upstream de pDMD, junto con una copia con nombres de claves compatibles con ComfyUI. La licencia es Apache 2.0 y el modelo base es PrunaAI/P-H3-Image, con soporte nativo en ComfyUI sin nodos personalizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusión para texto a imagen (P-H3-Image / MiniMax-H3) |
| Parámetros totales | no disponible (el LoRA tiene rango 128 sobre atención + FFN de los 50 bloques del transformer base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a generación de imagen; resolución de hasta 8 MP) |
| Tipos de cuantización | bf16 (archivo publicado); el modelo base admite bf16, int8 y un set w4a8 de 21 GB de VRAM |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el modelo base no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`lora_model_0.safetensors` en bf16 y `minimax_h3_pdmd_2nfe_comfyui.safetensors` con nombres de claves ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 que se fusiona en el transformer de imagen del modelo base P-H3-Image. La técnica subyacente es pDMD (progressive distribution matching distillation, 2-NFE), descrita en el paper arXiv 2609.35768, que destila el comportamiento de un sampler multi-paso en un modelo capaz de generar en dos evaluaciones de la red (2 NFE, number of function evaluations). El LoRA se aplica sobre las capas de atención y feed-forward de los 50 bloques del transformer.

El archivo publicado es byte-idéntico al release upstream de pDMD (pdmd2026/pdmd_2NFE_lora), por lo que no hay un entrenamiento adicional por parte de akhaliq: el valor del repositorio está en el empaquetado listo para usar y en la copia con nombres de claves de ComfyUI. La inferencia se realiza sin CFG y sin prompt negativo, con sampler euler, scheduler simple y flow shift 12. La model card indica que el merge funciona en 2 pasos, y que a 3-4 pasos se aproxima al aspecto del baseline de 8 pasos.

## Capacidades

- Generación de texto a imagen en 2 pasos de denoising sin CFG, con el mismo prompting que el modelo base.
- Generación a resoluciones de hasta 8 MP (los ejemplos se renderizan a 2912×2912).
- Modo de 3-4 pasos para mayor calidad: a 4 pasos el resultado es el más cercano al baseline de 8 pasos, recomendado para texto entrecomillado y gráficos planos.
- Edición de imagen única en el Space de demostración (text-to-image y single-image edits a 2/3/4 pasos).
- Compatibilidad con capas LoRA adicionales: la model card documenta el uso combinado con fal Realism-People LoRA a fuerza 0.5 (por defecto en el Space) o 1.0 para realismo fotográfico de personas.
- Integración nativa en ComfyUI mediante el nodo Load LoRA (Bypass, Model Only) entre Load Diffusion Model y el sampler.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso: es un adaptador exclusivamente de generación de imagen.

## Casos de uso

- Generación de imágenes a gran escala con coste reducido: al pasar de 8 a 2 pasos de denoising, el coste por imagen cae aproximadamente a una cuarta parte en evaluaciones de red, lo que resulta adecuado para pipelines que generan miles de imágenes por lotes.
- Prototipado rápido de conceptos visuales: con ~2,9 s por imagen a 2912×2912 en una RTX PRO 6000, un equipo de diseño puede iterar sobre prompts en tiempo casi interactivo.
- Producción de ilustraciones y gráficos planos: usando el modo de 4 pasos, que la model card identifica como el más fiel al baseline, se obtienen resultados adecuados para texto entrecomillado y composiciones gráficas.
- Retrato y fotografía de personas: combinando el LoRA con Realism-People a 0.5 se mejora piel, rostros e iluminación manteniendo la composición, útil para material promocional con figuras humanas.
- Flujos de trabajo en ComfyUI: el archivo con nombres de claves ComfyUI permite sustituir el nodo ManualSigmas del workflow estándar por un BasicScheduler con 2 pasos, integrándose en grafos existentes sin nodos personalizados.
- Edición de imagen única: el Space de demostración soporta edición de una imagen de entrada a 2/3/4 pasos, lo que sirve para variaciones controladas de una imagen existente.
- Despliegue en hardware de gama alta con cuantización: el modelo base ofrece sets bf16, int8 y w4a8 (21 GB de VRAM), de modo que el LoRA puede acompañar despliegues con requisitos de memoria ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la información disponible. La model card aporta una comparación cualitativa por pasos a 8 MP y shift 12:

| Pasos | Valoración según la model card |
|:---:|---|
| 2 | Usable: nítido y coherente; la composición se desvía del baseline y los prompts gráficos pueden inventar pseudo-texto |
| 3 | Opción intermedia más segura |
| 4 | La más cercana al baseline; recomendada para texto entrecomillado y gráficos planos |

Datos de rendimiento declarados: ~2,9 s por imagen a 2912×2912, 2 pasos, shift 12, seed 3, renderizado con la build slim FP8 + Triton fusionado del Space de demostración en una RTX PRO 6000.

## Requisitos de hardware

- VRAM estimada para el LoRA: no disponible de forma aislada; el repositorio ocupa 6,1 GB y el adaptador se fusiona en el transformer base.
- VRAM del modelo base: el set w4a8 requiere 21 GB de VRAM según la model card; también hay variantes bf16 e int8.
- GPU recomendadas: RTX PRO 6000 (usada en los ejemplos de la model card), A100 y H100 para despliegues de producción; el set w4a8 de 21 GB encaja en GPUs consumer de gama alta con 24 GB (por ejemplo, RTX 4090) siempre que el resto del pipeline quepa en memoria.
- Cabe en GPU consumer: sí, con la variante cuantizada w4a8 de 21 GB; las variantes bf16 requieren más memoria.
- Opciones de despliegue: ComfyUI (soporte nativo, sin nodos personalizados), librería diffusers (pipeline text-to-image) y el Space de demostración con build FP8 + Triton fusionado.
- Latencia y throughput: ~2,9 s por imagen a 2912×2912 y 2 pasos en RTX PRO 6000; no se publican cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | CFG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akhaliq/p-h3-image-pdmd-2step | LoRA de destilación sobre P-H3-Image | 2 (3-4 para calidad) | No | Apache 2.0 | Hugging Face + ComfyUI |
| PrunaAI/P-H3-Image (base) | Modelo de difusión texto a imagen | 8 | No especificado | no disponible en la información | Hugging Face |
| pdmd2026/pdmd_2NFE_lora (upstream) | LoRA pDMD 2-NFE original | 2 | No | no disponible en la información | Hugging Face |
| fal/MiniMax-H3-Realism-People-LoRA | LoRA de realismo para personas (complementario) | no aplica (capa adicional) | no aplica | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar la calidad frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- A 2 pasos la composición se desvía del baseline de 8 pasos y los prompts con gráficos o texto pueden generar pseudo-texto inventado; para esos casos la model card recomienda 4 pasos.
- El modo de 2 pasos no es indistinguible del baseline: la propia model card lo califica como "usable", no como equivalente.
- La combinación con Realism-People a fuerza 1.0 puede provocar deriva en la identidad del sujeto; el Space usa 0.5 por ese motivo.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento multilingüe en los prompts.
- El LoRA requiere el modelo base P-H3-Image y su configuración específica (sampler euler, scheduler simple, flow shift 12, sin CFG ni prompt negativo); usarlo con otros samplers o schedulers puede degradar el resultado.
- El repositorio es un reempaquetado del LoRA upstream; las actualizaciones o correcciones dependen de ese release original.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base P-H3-Image deben verificarse por separado, ya que no se detallan en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/akhaliq/p-h3-image-pdmd-2step
- Variante del repositorio: https://huggingface.co/akhaliq/p-h3-image-pdmd-2step-lora
- Perfil del autor: https://huggingface.co/akhaliq
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image
- Modelo base para ComfyUI: https://huggingface.co/PrunaAI/P-H3-Image-Comfy
- LoRA pDMD 2-NFE upstream: https://huggingface.co/pdmd2026/pdmd_2NFE_lora
- Paper pDMD: https://arxiv.org/abs/2609.35768
- Space de demostración: https://huggingface.co/spaces/akhaliq/p-h3-image-2step
- LoRA Realism-People: https://huggingface.co/fal/MiniMax-H3-Realism-People-LoRA
