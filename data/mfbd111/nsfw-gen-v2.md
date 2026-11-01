# Mfbd111/NSFW-gen-v2

## Resumen

NSFW-gen-v2 es un modelo de generación de imágenes texto-a-imagen desarrollado por UnfilteredAI (publicado en HuggingFace por el usuario Mfbd111) y afinado a partir de OEvortex/PixelGen. Su propósito declarado es generar imágenes sin filtrado de contenido, incluyendo material explícito y NSFW, además de estilos 3D. Se distribuye en formato diffusers y está pensado para ejecutarse con la pipeline `StableDiffusionXLPipeline`, lo que lo sitúa en la familia de modelos SDXL.

El modelo cuenta con aproximadamente 3.468.838.944 parámetros (3,47 mil millones) en pesos FP16, con un repositorio de 26,2 GB. La model card declara soporte para inglés, portugués y tailandés, aunque no se especifican detalles sobre el corpus de entrenamiento ni sobre el proceso de afinado más allá de indicar que parte de PixelGen.

Es relevante por su carácter explícitamente sin censura, una categoría de modelos que interesa a investigadores que estudian filtrado, moderación y sesgos en generación de imágenes, así como a desarrolladores que necesitan pipelines de imagen sin restricciones integradas. La licencia es "other" y la model card impone restricciones de edad y uso responsable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (pipeline StableDiffusionXLPipeline, según metadatos de diffusers) |
| Parámetros totales | 3.468.838.944 (3,47 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; sin contexto textual declarado) |
| Tipos de cuantización | FP16 declarado en la model card; no se detallan otras variantes |
| Idiomas soportados | en, pt, th |
| Licencia | other |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

El modelo se distribuye como pipeline de diffusers etiquetada como `StableDiffusionXLPipeline`, lo que implica una arquitectura de difusión latente compatible con el ecosistema SDXL. Los pesos suman 3,47 mil millones de parámetros en FP16 y el repositorio ocupa 26,2 GB, coherente con un checkpoint de difusión de ese tamaño más los componentes auxiliares (VAE, text encoders). No se especifica en la información disponible si emplea un UNet clásico o una variante transformer, ni detalles de los text encoders.

El modelo es un fine-tune de OEvortex/PixelGen, según los metadatos de HuggingFace (base_model: HelpingAI/PixelGen y base_model:finetune:HelpingAI/PixelGen). No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La model card menciona únicamente la capacidad de renderizado en estilo 3D mediante el uso de las etiquetas "3d" o "3d style" en el prompt.

## Capacidades

- Generación de imágenes texto-a-imagen sin filtrado de contenido, incluyendo material explícito y NSFW.
- Renderizado con estética 3D cuando se incluyen las etiquetas "3d" o "3d style" en el prompt.
- Soporte multilingüe declarado para inglés, portugués y tailandés en los prompts.
- Compatible con la pipeline `StableDiffusionXLPipeline` de diffusers, lo que permite integrarlo en flujos de trabajo estándar de SDXL.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de imagen).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre moderación y filtrado: el modelo permite estudiar cómo se comportan los clasificadores de seguridad y los filtros de contenido frente a un generador sin restricciones, comparando tasas de falsos positivos y negativos en pipelines de moderación.
- Generación de arte conceptual para adultos: estudio de pipelines creativos que requieren imágenes sin censura para ilustración, cómics o contenido editorial para audiencias adultas, con control mediante prompts detallados.
- Pruebas de robustez de sistemas de detección de NSFW: uso como generador adversario controlado para evaluar clasificadores de imágenes y medir su precisión en entornos de producción.
- Creación de assets 3D estilizados: gracias a la etiqueta "3d", puede emplearse para generar referencias visuales y texturas con estética tridimensional en flujos de previsualización.
- Localización multilingüe de prompts: al declarar soporte para inglés, portugués y tailandés, permite experimentar con generación de imágenes a partir de descripciones en esos idiomas y evaluar la fidelidad semántica entre lenguas.
- Benchmarking de fine-tunes sobre SDXL: sirve como punto de comparación para medir el impacto del afinado sin censura sobre la calidad visual y la coherencia prompt-imagen frente a PixelGen y otros derivados.
- Docencia y divulgación sobre IA generativa: escenario controlado para explicar el funcionamiento de los modelos de difusión y las implicaciones éticas de los modelos sin filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 7-8 GB solo para los pesos del modelo, más overhead de activaciones y text encoders; en la práctica se recomienda un mínimo de 10-12 GB para resoluciones SDXL estándar (1024x1024).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia cómoda y generación por lotes.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16; en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) requiere técnicas de offloading o cuantización adicional no documentada por el autor.
- Opciones de despliegue: diffusers con `StableDiffusionXLPipeline`, así como servidores compatibles con SDXL como ComfyUI, Automatic1111 (con soporte SDXL) y endpoints de HuggingFace (el tag `endpoints_compatible` está presente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NSFW-gen-v2 | 3,47 mil millones | SDXL (1024x1024 típico) | other | HuggingFace, diffusers | Fine-tune sin censura de PixelGen |
| OEvortex/PixelGen (base) | no disponible | SDXL | no disponible | HuggingFace | Modelo base del que deriva |
| UnfilteredAI/NSFW-GEN-ANIME | no disponible | SDXL | other | HuggingFace | Variante orientada a estilo anime del mismo autor |
| Stable Diffusion XL (referencia) | ~3,5 mil millones (UNet) | 1024x1024 | CreativeML Open RAIL++-M | Amplia | Modelo generalista con filtros y salvaguardas |

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW sin filtrado, lo que conlleva riesgos legales y éticos según la jurisdicción.
- Restricción de edad: la model card limita su uso a personas mayores de edad según la legislación aplicable.
- Sesgos: no se documentan evaluaciones de sesgo; los modelos de difusión afinados sin filtrado tienden a reproducir y amplificar sesgos de representación del corpus de entrenamiento.
- Alucinación visual: como todo modelo generativo de imagen, puede producir anatomías incorrectas, texto ilegible y artefactos, especialmente en composiciones complejas.
- Idiomas: solo se declaran en, pt y th; el rendimiento en otros idiomas no está verificado y podría degradarse.
- Licencia "other": no se especifican los términos completos en la información disponible; es imprescindible revisar el texto de licencia antes de cualquier uso comercial.
- Producción: la ausencia de benchmarks, de documentación sobre el dataset y de garantías de calidad hace desaconsejable su uso en entornos productivos sin una evaluación previa exhaustiva.
- Repositorio con pocas descargas (30) y sin likes: ecosistema de validación muy limitado, lo que reduce la confianza en la reproducibilidad de resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mfbd111/NSFW-gen-v2
- Modelo base declarado: https://huggingface.co/OEvortex/PixelGen
- Variante anime del mismo autor: https://huggingface.co/UnfilteredAI/NSFW-GEN-ANIME
- Página de apoyo del autor (Buy Me a Coffee): https://www.buymeacoffee.com/oevortex
