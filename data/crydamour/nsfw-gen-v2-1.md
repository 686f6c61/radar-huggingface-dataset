# crydamour/NSFW-gen-v2.1

## Resumen

NSFW-gen-v2.1 es un modelo de texto a imagen basado en OEvortex/PixelGen, un checkpoint finetune de Stable Diffusion XL. Lo desarrolla el usuario crydamour y está publicado a través de la organización UnfilteredAI en Hugging Face. La finalidad principal es generar imágenes sin filtros de contenido, incluido material explícito o NSFW, a partir de descripciones textuales.

El modelo utiliza el pipeline `StableDiffusionXLPipeline` de la librería diffusers y almacena sus pesos en formato safetensors. Según los pesos reales del repositorio, contiene 2.567.463.684 parámetros (2,57 mil millones), un tamaño típico para un UNet de SDXL. No es un modelo de lenguaje, por lo que no tiene ventana de contexto ni capacidades de razonamiento simbólico.

La model card indica que funciona con tensor type FP16 y que incorpora una capacidad de renderizado en estilo 3D activable mediante tokens como `3d` o `3d style` en el prompt. El repositorio no incluye información sobre el proceso de entrenamiento, los datos utilizados ni benchmarks de calidad. Dado su contenido, la ficha debe tratarse con responsabilidad: solo es apta para personas mayores de edad.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente basado en Stable Diffusion XL (pipeline `StableDiffusionXLPipeline`) |
| Parámetros totales | 2.567.463.684 (2,567 mil millones, según safetensors; la model card menciona 3,47 mil millones de forma imprecisa) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo text-to-image; no tiene ventana de contexto de LLM) |
| Tipos de cuantizacion | No disponible; el repositorio almacena pesos FP16 sin cuantización documentada |
| Idiomas soportados | en (inglés), pt (portugués), th (tailandés) |
| Licencia | other (otra); los términos específicos no se han publicado |
| Formato de pesos | safetensors (estructura de pipeline diffusers) |

## Arquitectura y entrenamiento

NSFW-gen-v2.1 es un modelo de difusión latente de texto a imagen. La metadata de Hugging Face lo etiqueta con `diffusers:StableDiffusionXLPipeline`, lo que indica que su arquitectura sigue la de Stable Diffusion XL: un codificador de texto (con CLIP y OpenCLIP), un UNet de difusión y un VAE para decodificar latentes. El modelo tiene 2.567 millones de parámetros, un tamaño coherente con los checkpoints SDXL habituales.

El proceso de entrenamiento no está documentado. La model card solo afirma que es un modelo "uncensored" y que ha sido afinado a partir de OEvortex/PixelGen, un modelo base que a su vez proviene de SDXL. No se especifican tokens de entrenamiento, composición del dataset, técnicas de alineación (RLHF, DPO) ni parámetros de ajuste. La única innovación mencionada es el soporte de estilo 3D, que se activa añadiendo `3d` o `3d style` al prompt. El modelo se distribuye con tensor type FP16 para optimizar memoria y rendimiento.

## Capacidades

- Generación de imágenes a partir de prompts textuales en inglés, portugués o tailandés.
- Producción de contenido sin censura, incluyendo material explícito y NSFW.
- Renderizado con estilo 3D mediante tokens específicos (`3d`, `3d style`).
- Compatibilidad con la librería diffusers y herramientas como ComfyUI o Automatic1111.
- No dispone de tool calling, soporte de agentes, razonamiento multi-paso ni capacidades de lenguaje conversacional, ya que es un modelo de difusión de imágenes.
- No se ha documentado soporte de entrada de imágenes (img2img) ni otras modalidades de entrada; el pipeline declarado es text-to-image.

## Casos de uso

- Ilustración de ficción erótica para autores: el modelo permite generar imágenes detalladas a partir de descripciones textuales, lo que facilita la creación de acompañamientos visuales para novelas o relatos adultos. El token `3d` puede usarse para dar una estética de renderizado tridimensional.
- Diseño de personajes para videojuegos etiquetados como +18: artistas y estudios pueden crear variaciones de vestuario, anatomía o pose sin las restricciones de modelos censurados, usando prompts en inglés o portugués.
- Contenido visual para plataformas de entretenimiento adulto: productoras o creadores de contenido pueden generar material bajo demanda, describiendo escenas y estilos concretos, y ajustando el resultado con la técnica de estilo 3D.
- Investigación de sesgos en generación de imágenes: el modelo puede utilizarse en estudios académicos para analizar cómo un checkpoint SDXL sin filtros responde a prompts en diferentes idiomas y contextos culturales.
- Pruebas de robustez de pipelines de difusión: desarrolladores pueden integrarlo en un entorno controlado para evaluar el comportamiento de StableDiffusionXLPipeline con contenido controvertido y medir tasas de fallo o incoherencias.
- Prototipado de arte digital para comunidades adultas: artistas que necesitan concept art rápido y sin restricciones pueden emplearlo para explorar atmósferas, iluminación o estilos 3D antes de trabajar en un proyecto final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8 y 12 GB en FP16 con optimizaciones como `model_cpu_offload` o `attention_slicing`. El repositorio completo ocupa 26,2 GB, pero los pesos del UNet en FP16 ocupan aproximadamente 5,1 GB.
- GPU recomendadas: RTX 4090 (24 GB) o superior para máxima velocidad; A100 o H100 para despliegue en servidores. 
- En GPU de consumo: es posible ejecutarlo en una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB usando offload de componentes y atención optimizada. También puede ejecutarse en RTX 4070 o equivalente.
- Opciones de despliegue: librería diffusers en Python, ComfyUI y AUTOMATIC1111 Stable Diffusion WebUI. No utiliza vLLM, llama.cpp ni Ollama, al tratarse de un modelo de difusión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El modelo es un finetune de OEvortex/PixelGen, que a su vez se basa en Stable Diffusion XL. Por tanto, arquitectónicamente es comparable a cualquier checkpoint SDXL de aproximadamente 2,6 mil millones de parámetros, como otros finetunes públicos orientados a fotorealismo o arte. Sin embargo, no se han publicado datos de rendimiento comparativos (calidad de imagen, FID, CLIP score) en la información disponible. La diferencia principal es temática y de licencia: mientras que muchos checkpoints SDXL generales tienen licencias permisivas estándar, este modelo usa una licencia "other" no detallada.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW; su uso está restringido a personas mayores de edad según la model card.
- Sesgos: al ser un finetune de SDXL, puede heredar sesgos presentes en el modelo base y en los datos de ajuste. No hay documentación sobre mitigación de sesgos.
- Riesgo de alucinación visual: la generación de anatomía, manos, texto en imagen o elementos complejos puede resultar inconsistente o no realista, un problema habitual en modelos de difusión.
- Licencia: el valor "other" sin términos explícitos implica que deben revisarse las condiciones del repositorio antes de cualquier uso comercial o redistribución.
- Discrepancia de parámetros: la model card indica 3,47 mil millones de parámetros, pero los safetensors reales suman 2.567.463.684. El dato real es 2,57 mil millones.
- Idiomas: los prompts en portugués o tailandés pueden generar resultados de menor calidad que en inglés, ya que los checkpoints SDXL suelen estar entrenados predominantemente con texto en inglés.
- Sin benchmarks oficiales: no hay métricas publicadas sobre seguridad, calidad o sesgo, lo que dificulta evaluar su fiabilidad en entornos productivos.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/crydamour/NSFW-gen-v2.1
- Organización UnfilteredAI: https://huggingface.co/UnfilteredAI
- Modelo base OEvortex/PixelGen: https://huggingface.co/OEvortex/PixelGen
- Variante anime de la misma serie: https://huggingface.co/UnfilteredAI/NSFW-GEN-ANIME
