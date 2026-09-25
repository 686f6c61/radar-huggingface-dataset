# rAVEUK/Krea-2

## Resumen

Krea-2 (repositorio `rAVEUK/Krea-2`) es un reempaquetado en formato single-file para ComfyUI de la familia de modelos de generación de imágenes Krea 2 Open-Source, desarrollada por Krea AI. No es un modelo original: se trata de una conversión de los pesos oficiales de `krea/Krea-2-Raw` y `krea/Krea-2-Turbo` a archivos `.safetensors` que ComfyUI puede cargar directamente como *diffusion models*, junto con el text encoder y el VAE necesarios.

El modelo resuelve la generación de imágenes a partir de texto con un foco explícito en diversidad estética y control de estilo, e incorpora dos variantes: RAW, pensada para ajuste fino, y Turbo, optimizada para inferencia rápida y de alta calidad. El repositorio añade además una colección de LoRA de estilo (darkbrush, dotmatrix, retroanime, etc.) y plantillas de workflow oficiales, lo que lo convierte en una vía práctica para desplegar Krea 2 en local sin depender de la API de pago.

La relevancia de este reempaquetado es de tipo operativo: los pesos originales están publicados en varios repositorios y este paquete los consolida en un único punto de descarga de 146,6 GB con todas las cuantizaciones habituales (bf16, fp8, int8, mxfp8, nvfp4) y los archivos auxiliares. El número de parámetros, la arquitectura interna concreta y los idiomas soportados no se detallan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de imágenes (variantes RAW y Turbo); tipo concreto de backbone no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de imagen; emplea el text encoder Qwen3-VL 4B) |
| Tipos de cuantización | RAW: bf16, fp8_scaled, int8_convrot. Turbo: bf16, fp8_scaled, int8_convrot, mxfp8, nvfp4 |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (etiquetada como `license: other` en HuggingFace); enlace: https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE.pdf |
| Formato de pesos | safetensors single-file para ComfyUI (`diffusion-single-file`) |
| Modelos base | krea/Krea-2-Raw, krea/Krea-2-Turbo |
| Text encoder | Qwen3-VL 4B (bf16 y fp8_scaled) |
| VAE | qwen_image_vae.safetensors |
| Tamaño del repositorio | 146,6 GB |
| Idiomas de los prompts | no disponible |
| Fecha de publicación | 25 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe Krea 2 como un modelo fundacional de imágenes entrenado desde cero por Krea AI, orientado a diversidad estética y control creativo, y distribuido en dos variantes: RAW, destinada a ajuste fino y experimentación, y Turbo, pensada para inferencia rápida con alta calidad. El paquete analizado no incluye la model card técnica del modelo original, por lo que no se especifican el número de parámetros, el tipo de backbone (por ejemplo, si es un transformer de difusión tipo DiT/MMDiT o una variante híbrida), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de alineación como RLHF o DPO.

Sí se documentan los componentes auxiliares del pipeline: el text encoder es Qwen3-VL 4B (una variante multimodal de 4 000 millones de parámetros aproximadamente, ofrecida en bf16 y fp8_scaled) y el VAE es el de la familia Qwen-Image. Esto implica que el texto de los prompts se codifica con un modelo de lenguaje-vision, lo que explica la etiqueta `diffusion-single-file` y la dependencia de estos dos archivos para que el pipeline funcione en ComfyUI. La innovación destacable del reempaquetado es la disponibilidad de múltiples esquemas de cuantización modernos (int8_convrot, mxfp8, nvfp4) que no suelen estar presentes en todos los lanzamientos, y la inclusión de diez LoRA de estilo con *trigger words* documentadas.

## Capacidades

- Generación de imágenes a partir de descripción textual (text-to-image), con dos variantes: RAW y Turbo.
- Referencia de estilo por imagen (*image style reference*), mediante workflow dedicado de ComfyUI.
- Estilización mediante LoRA con palabras de activación documentadas:
  - `monochrome ink wash style` (darkbrush, fuerza 1.0)
  - `monochrome stippling style` (dotmatrix, fuerza 1.0)
  - `naive expressive sketch style` (kidsdrawing, fuerza 1.0)
  - `textured abstract style` (neondrip, fuerza 1.0)
  - `rainy window style` (rainywindow, fuerza 1.0)
  - `purple retro anime style` (retroanime, fuerza 1.0)
  - `art deco watercolor style` (softwatercolor, fuerza 1.0)
  - `ethereal motion blur style` (sunsetblur, fuerza 1.0)
  - `vintage tarot style` (vintagetarot, fuerza 1.0)
- LoRA adicional de referencia de estilo de terceros (`ostris/krea2_turbo_style_reference`).
- Tool calling / function calling: no aplica; es un modelo de difusión, no un modelo de lenguaje con API de herramientas.
- Agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible; el text encoder Qwen3-VL 4B es multilingüe, pero el autor no declara idiomas soportados para los prompts.
- Capacidades especiales: variantes cuantizadas para distintos aceleradores (fp8, int8, mxpf8, nvfp4) orientadas a reducir requisitos de VRAM.

## Casos de uso

- Ilustración editorial y arte conceptual: la variante RAW, al estar pensada para ajuste fino, permite partir de un modelo con amplio rango estético y adaptarlo a un estilo editorial concreto mediante LoRA o fine-tuning adicional.
- Moodboards y exploración creativa: los flujos de referencia de estilo por imagen permiten generar variaciones coherentes a partir de una referencia visual, útil en fases tempranas de dirección de arte donde se comparan varias líneas estéticas.
- Transferencia de estilo reproducible: con las LoRA incluidas y sus *trigger words* fijas, un equipo puede obtener un estilo consistente (por ejemplo `purple retro anime style`) sin reentrenar, lo que simplifica la producción seriada de ilustraciones.
- Prototipado rápido de imágenes: la variante Turbo, junto con las cuantizaciones int8/fp8, está orientada a inferencia rápida y de alta calidad, adecuada para generar grandes volúmenes de borradores antes de refinar con RAW.
- Generación de recursos para marketing y comercio electrónico: producción de imágenes de producto, fondos y materiales promocionales con control de estilo de marca, integrable en un pipeline ComfyUI automatizado.
- Integración en producción mediante API: Krea 2 está disponible como API serverless en fal.ai, lo que permite usarlo sin infraestructura propia cuando el despliegue local no es viable.
- Flujos locales en ComfyUI: el repositorio incluye plantillas oficiales de workflow (text-to-image, text-to-image int8 y style reference int8), de modo que un usuario puede montar el pipeline completo copiando los archivos en las carpetas `diffusion_models`, `loras`, `text_encoders` y `vae`.
- Base para investigación en ajuste fino: la variante RAW está explícitamente orientada a fine-tuning, lo que la hace adecuada para experimentar con LoRA de rango variable (se incluye una LoRA Turbo de rango 64 en bf16 como referencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica cifras de VRAM ni el tamaño individual de cada archivo de pesos.
- Tamaño en disco: el repositorio completo ocupa 146,6 GB, incluyendo todas las variantes de cuantización, LoRA, text encoder y VAE. Para un despliegue real solo hay que descargar los archivos que se vayan a usar.
- Selección de cuantización según acelerador (orientación general de los formatos, no confirmada por el autor para este modelo):
  - `bf16`: máxima fidelidad, mayor consumo de VRAM.
  - `fp8_scaled`: habitual en GPUs Hopper y Ada (H100, RTX 40xx).
  - `int8_convrot`: orientado a reducir huella en GPUs con menos VRAM.
  - `mxfp8` y `nvfp4`: formatos de precisión reducida asociados a la generación Blackwell; requieren hardware compatible.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no disponible; depende del número de parámetros del modelo base, que no se especifica. Las variantes int8 y nvfp4 existen precisamente para acercar el modelo a hardware de consumo, pero no hay cifras publicadas.
- Opciones de despliegue: ComfyUI (soporte nativo, con plantillas de workflow oficiales), código de inferencia oficial en https://github.com/krea-ai/krea-2 y API gestionada en fal.ai. Otros servidores de inferencia (vLLM, TGI, llama.cpp, Ollama) no aplican o no están documentados para este modelo.
- Latencia y throughput: no disponibles. Krea AI comercializa la variante Turbo como opción rápida, pero no se publican métricas en la información disponible.
- Text encoder: requiere cargar además Qwen3-VL 4B (bf16 o fp8_scaled) y `qwen_image_vae.safetensors`, lo que añade consumo de VRAM y disco al del modelo de difusión.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento de Krea 2 en la información proporcionada, por lo que la comparación cuantitativa no es posible. A continuación se recoge únicamente el encaje por categoría y licencia, con "no disponible" en los campos no verificables:

| Modelo | Categoría | Variantes | Licencia | Pesos abiertos | Datos comparables |
|---|---|---|---|---|---|
| Krea-2 (RAW / Turbo) | Generación de imágenes texto-a-imagen | RAW, Turbo + LoRA de estilo | krea-2-community-license | Sí | Referencia de esta ficha |
| Modelos comparables de la misma categoría | Generación de imágenes texto-a-imagen | — | no disponible | — | No se han proporcionado datos de alternativas concretas en la información disponible |

## Limitaciones y advertencias

- Este repositorio es un reempaquetado de terceros (`rAVEUK`), no la publicación oficial de Krea AI. Los pesos originales están en `krea/Krea-2-Raw` y `krea/Krea-2-Turbo`; conviene contrastar integridad y procedencia antes de usarlo en producción.
- Licencia `krea-2-community-license` (etiquetada como `other` en HuggingFace): no es una licencia de código abierto estándar. Antes de cualquier uso comercial hay que revisar el PDF de licencia enlazado, ya que puede imponer restricciones de uso, atribución o redistribución.
- No se especifican parámetros, arquitectura interna, datos de entrenamiento ni idiomas soportados, lo que dificulta evaluar sesgos, cobertura lingüística y comportamiento fuera del dominio esperado.
- No hay benchmarks publicados en la información disponible: no es posible comparar calidad objetiva frente a otras familias de modelos de imagen.
- Riesgo de alucinación visual: como cualquier modelo generativo de imágenes, puede producir anatomías incorrectas, texto ilegible en la imagen, artefactos y elementos incoherentes con el prompt.
- Sesgos: al no documentarse la composición del dataset, no se puede evaluar el sesgo demográfico, cultural o estético del modelo.
- Dependencia de componentes auxiliares: el pipeline necesita el text encoder Qwen3-VL 4B y el VAE de Qwen-Image, lo que aumenta el consumo de recursos y añade puntos de fallo.
- Restricciones de hardware para ciertas cuantizaciones: `mxfp8` y `nvfp4` no funcionan en GPUs antiguas.
- Fecha de publicación inusualmente futura (2026) en los metadatos de HuggingFace; conviene verificar la vigencia real del repositorio.
- El repositorio no registra descargas ni likes, por lo que no hay señal de validación por parte de la comunidad.

## Enlaces

- Repositorio analizado: https://huggingface.co/rAVEUK/Krea-2
- Modelo base RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia: https://huggingface.co/krea/Krea-2-Turbo/blob/main/LICENSE.pdf
- Página oficial de Krea 2: https://www.krea.ai/krea-2
- Página de Krea 2 Open-Source: https://www.krea.ai/krea-2-open-source
- Código de inferencia oficial: https://github.com/krea-ai/krea-2
- API en fal.ai: https://fal.ai/krea-2
- Perfil de Krea en HuggingFace: https://huggingface.co/krea/models
- LoRA de estilo: https://huggingface.co/krea/Krea-2-LoRA-darkbrush, https://huggingface.co/krea/Krea-2-LoRA-dotmatrix, https://huggingface.co/krea/Krea-2-LoRA-kidsdrawing, https://huggingface.co/krea/Krea-2-LoRA-neondrip, https://huggingface.co/krea/Krea-2-LoRA-rainywindow, https://huggingface.co/krea/Krea-2-LoRA-retroanime, https://huggingface.co/krea/Krea-2-LoRA-softwatercolor, https://huggingface.co/krea/Krea-2-LoRA-sunsetblur, https://huggingface.co/krea/Krea-2-LoRA-vintagetarot
- LoRA de referencia de estilo de terceros: https://huggingface.co/ostris/krea2_turbo_style_reference
- Plantillas de workflow de ComfyUI: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_t2i.json, https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_int8_image_style_reference.json, https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_t2i_int8.json
