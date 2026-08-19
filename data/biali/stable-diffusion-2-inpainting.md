# biali/stable-diffusion-2-inpainting

## Resumen

Este repositorio es un espejo del modelo `stabilityai/stable-diffusion-2-inpainting`, publicado por el usuario `biali` en HuggingFace. No está afiliado a Stability AI. Se trata de un modelo de difusión latente especializado en tareas de inpainting (rellenado de regiones enmascaradas de una imagen) a partir de un prompt de texto. Fue desarrollado por Robin Rombach y Patrick Esser, y se basa en el modelo `stable-diffusion-2-base`, sobre el que se entrenaron 200.000 pasos adicionales siguiendo la estrategia de generación de máscaras del método LAMA.

El modelo combina un codificador de texto OpenCLIP-ViT/H, un VAE y un UNet, y genera imágenes de resolución 512x512. Está pensado para investigación y aplicaciones creativas, y se distribuye bajo la licencia CreativeML Open RAIL++-M. Aunque el repositorio original está marcado como deprecado, sigue siendo funcional y ampliamente utilizado en la comunidad de generación de imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + VAE + text encoder OpenCLIP-ViT/H) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (trabaja con imágenes de 512x512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según la model card) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors y checkpoint (`.ckpt`) |

## Arquitectura y entrenamiento

El modelo es un Latent Diffusion Model (LDM) que opera en el espacio latente de un VAE preentrenado. El proceso de inpainting se condiciona tanto con el prompt de texto (codificado mediante OpenCLIP-ViT/H) como con la representación latente de la imagen original y la máscara que indica la región a rellenar. La estrategia de máscara sigue el método LAMA, que combina la máscara con la imagen en el espacio latente.

El entrenamiento se reanudó desde el checkpoint `512-base-ema.ckpt` de `stable-diffusion-2-base` y se prolongó durante 200.000 pasos adicionales. No se han publicado detalles sobre el dataset exacto ni sobre técnicas de alineación como RLHF o DPO; la model card solo indica el proceso de reanudación y la estrategia de máscara.

## Capacidades

- Inpainting de imágenes: rellena regiones enmascaradas con contenido coherente con el prompt y el contexto visual.
- Generación de imágenes a partir de texto (text-to-image) cuando la máscara cubre toda la imagen.
- Edición dirigida de imágenes mediante prompts descriptivos.
- Soporte de operaciones de image-to-image con control parcial mediante máscaras.
- Capacidad multilingüe limitada: el modelo está entrenado principalmente en inglés, aunque puede funcionar con prompts en otros idiomas con menor calidad.
- Integración con la librería `diffusers` mediante `StableDiffusionInpaintPipeline`.

## Casos de uso

- Restauración de fotografías antiguas: rellenar zonas dañadas o borrosas de una imagen usando un prompt que describa el contenido esperado.
- Eliminación de objetos no deseados: enmascarar un elemento (persona, vehículo, etc.) y generar el fondo coherente con el entorno.
- Edición creativa de imágenes: sustituir el fondo de un retrato o cambiar elementos de una escena manteniendo la composición original.
- Generación de variaciones de diseño: a partir de un boceto o imagen base, rellenar áreas específicas con diferentes estilos o texturas según el prompt.
- Prototipado rápido en diseño gráfico: combinar elementos de distintas imágenes mediante máscaras y prompts para generar composiciones preliminares.
- Investigación en generación condicional: estudiar el comportamiento de modelos de difusión en tareas de inpainting, sesgos y limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio es un espejo del modelo original y no incluye métricas numéricas de rendimiento.

## Requisitos de hardware

No se especifican requisitos oficiales de hardware en la documentación. Como referencia general para modelos de difusión de esta escala (UNet de aproximadamente 865 millones de parámetros, aunque el dato exacto no está disponible en la información proporcionada), se recomienda:

- GPU con al menos 8 GB de VRAM para inferencia en `float16`.
- Para mayor velocidad, se sugiere instalar `xformers` para atención eficiente en memoria.
- En GPUs con poca VRAM, se puede activar `enable_attention_slicing()` en el pipeline de `diffusers`, a costa de mayor latencia.
- Opciones de despliegue: biblioteca `diffusers` (Python), o el repositorio oficial `stablediffusion` de Stability AI.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Licencia | Uso principal |
|---|---|---|---|---|
| `stable-diffusion-2-inpainting` (este) | LDM con OpenCLIP-ViT/H | 512x512 | Open RAIL++-M | Inpainting y edición |
| `stable-diffusion-v1-5-inpainting` | LDM con CLIP ViT-L | 512x512 | Open RAIL-M | Inpainting y edición |
| `stable-diffusion-xl-inpainting` | LDM con OpenCLIP-ViT/bigG | 1024x1024 | Open RAIL++-M | Inpainting y edición de alta resolución |

La comparativa se basa en características conocidas de la familia Stable Diffusion; los datos de rendimiento no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo no está entrenado para representar hechos o personas de manera fiel; puede generar contenido inexacto o distorsionado.
- Puede producir sesgos y estereotipos dañinos si se le pide representar grupos humanos o culturas.
- Riesgo de alucinación: en regiones enmascaradas grandes o con prompts ambiguos, el modelo puede inventar detalles incoherentes con el contexto.
- Idioma: el entrenamiento principal es en inglés; prompts en otros idiomas pueden dar resultados de menor calidad.
- Licencia: la licencia Open RAIL++-M permite uso comercial, pero impone restricciones sobre usos malintencionados (generación de contenido dañino, desinformación, etc.).
- El repositorio original está deprecado; se recomienda evaluar modelos más recientes de Stability AI para producción, aunque este sigue siendo funcional.
- El tamaño del repositorio (25.9 GB) incluye múltiples formatos de pesos; para inferencia solo se necesita descargar los archivos relevantes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/biali/stable-diffusion-2-inpainting
- Repositorio original de la comunidad: https://huggingface.co/sd2-community/stable-diffusion-2-inpainting
- Repositorio oficial de Stability AI (deprecado): https://huggingface.co/stabilityai/stable-diffusion-2-inpainting
- Código de Stability AI: https://github.com/Stability-AI/stablediffusion
- Paper de Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Paper de OpenCLIP: https://arxiv.org/abs/2202.00512
- Paper de LAMA (estrategia de máscara): https://arxiv.org/abs/1910.09700
