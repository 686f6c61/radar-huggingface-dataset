# biali/texture-diffusion

## Resumen

Texture Diffusion es un modelo de difusión de texto a imagen desarrollado por biali, especializado en la generación de texturas difusas (flat) con muy poca iluminación o sombras visibles. Se trata de un ajuste fino (DreamBooth) sobre el modelo base Stable Diffusion 2, entrenado con 278 texturas CC0 procedentes de PolyHaven. El modelo está pensado para integrarse en Dream Textures, un complemento de Stable Diffusion para Blender, aunque también puede usarse directamente con la librería diffusers de Hugging Face.

La relevancia de este modelo radica en su utilidad para artistas 3D y desarrolladores que necesitan generar texturas PBR (Physically Based Rendering) de forma rápida y coherente, sin la interferencia de iluminación o sombras que suelen aparecer en las salidas de los modelos de difusión genéricos. Al estar basado en Stable Diffusion 2, hereda su arquitectura de U-Net y VAE, con una resolución de generación de 512x512 píxeles. El repositorio tiene un tamaño de 10.3 GB, aunque no se especifican los parámetros totales del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 2 base (U-Net + VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (texto a imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | openrail++ |
| Formato de pesos | no disponible (repo de diffusers) |

## Arquitectura y entrenamiento

El modelo parte de stabilityai/stable-diffusion-2-base y se ha ajustado mediante la técnica DreamBooth. El entrenamiento se realizó con una resolución de 512x512, un peso de pérdida previa de 1.0, un prompt de clase "texture", tamaño de lote de 1, tasa de aprendizaje de 1e-6, precisión fp16 y 4000 pasos, utilizando una GPU Tesla T4. El conjunto de datos consistió en 278 texturas CC0 de PolyHaven, lo que permite al modelo aprender a generar texturas planas, sin iluminación ni sombras, adecuadas para su uso como mapas de textura en materiales PBR.

No se han publicado detalles adicionales sobre la arquitectura interna más allá de la base de Stable Diffusion 2, ni sobre técnicas innovadoras como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texturas difusas (flat) mediante el token `pbr` en el prompt, que invoca el estilo aprendido.
- Producción de imágenes sin iluminación ni sombras visibles, ideal para texturas PBR.
- Compatible con el pipeline `StableDiffusionPipeline` de diffusers.
- Integración nativa con Dream Textures, complemento de Blender.
- Generación de imágenes a resolución 512x512.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe explícito.

## Casos de uso

- Creación de texturas para videojuegos: generar mapas de textura planos para muros, suelos u objetos 3D, que luego se pueden usar en motores como Unity o Unreal sin necesidad de corregir iluminación.
- Modelado y texturizado en Blender: mediante el complemento Dream Textures, el artista puede generar texturas PBR directamente en el flujo de trabajo de Blender, ahorrando tiempo en la búsqueda de materiales.
- Prototipado rápido de materiales: los desarrolladores de aplicaciones de realidad virtual o aumentada pueden generar texturas de prueba para validar el aspecto visual de un material antes de invertir en texturizado profesional.
- Generación de mapas de textura para arquitectura: crear texturas de ladrillo, piedra, madera o suciedad para visualizaciones arquitectónicas, con la ventaja de que la textura es plana y no contiene sombras no deseadas.
- Entrenamiento de otros modelos: las texturas generadas pueden servir como datos de entrada para entrenar modelos de superresolución o de conversión de texturas a mapas normales.
- Automatización de pipelines de assets: integrar el modelo en un script de Python que genere texturas bajo demanda para un catálogo de materiales, usando la API de diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- Al estar basado en Stable Diffusion 2, se puede inferir que la inferencia en fp16 requiere al menos 8 GB de VRAM en una GPU compatible con CUDA, aunque este dato no es oficial.
- El entrenamiento se realizó en una Tesla T4, por lo que la inferencia debería ser posible en GPUs de gama media como la RTX 3060 o superiores.
- Opciones de despliegue: se puede utilizar con la librería diffusers en Python, o mediante el complemento Dream Textures en Blender. No se mencionan otras herramientas como vLLM o llama.cpp, ya que no son aplicables a modelos de difusión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Al ser un ajuste fino de Stable Diffusion 2 base, se podría comparar con el propio modelo base, pero no hay datos de rendimiento publicados.

## Limitaciones y advertencias

- El modelo está especializado en texturas planas; no es adecuado para generar imágenes con iluminación compleja o escenas completas.
- La resolución de salida está limitada a 512x512, lo que puede requerir upscaling para usos profesionales.
- No se han documentado sesgos específicos, pero al entrenarse con un conjunto de datos limitado (278 texturas de PolyHaven), la variedad de materiales puede ser reducida.
- Riesgo de alucinación en texturas: puede generar patrones irreales o repetitivos que no corresponden a materiales reales.
- La licencia openrail++ permite uso comercial, pero impone restricciones como la atribución y la prohibición de usos ilegales o dañinos.
- No se especifica soporte para idiomas distintos del inglés; los prompts deben estar en inglés para obtener mejores resultados.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo es poco probado o reciente; se recomienda validar su calidad antes de usarlo en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/biali/texture-diffusion)
- [Dream Textures (complemento de Blender)](https://github.com/carson-katri/dream-textures)
- [PolyHaven (fuente de texturas)](https://polyhaven.com/)
- [Stable Diffusion 2 base](https://huggingface.co/stabilityai/stable-diffusion-2-base)
- [Librería diffusers](https://github.com/huggingface/diffusers)
