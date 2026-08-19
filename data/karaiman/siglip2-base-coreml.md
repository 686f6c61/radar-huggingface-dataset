# karaiman/siglip2-base-coreml

## Resumen

Este repositorio contiene una conversión a Core ML del modelo SigLIP 2 base (google/siglip2-base-patch16-256), dividida en dos encoders independientes: uno de imagen y otro de texto. El objetivo es permitir búsqueda de texto a imagen (text-to-image retrieval) directamente en dispositivos Apple, sin necesidad de servidor. El autor, karaiman, lo desarrolló originalmente para el buscador de metraje de CuttyLA, pero es utilizable por cualquier aplicación que necesite embeddings multimodales en Apple silicon.

SigLIP 2 es la segunda generación de los encoders visión-lenguaje de Google, que combina el entrenamiento contrastivo de SigLIP con técnicas adicionales como preentrenamiento por captioning, autodistilación y predicción enmascarada. El modelo base tiene 86 millones de parámetros, una ventana de contexto de 256 píxeles para imágenes y 64 tokens para texto, y produce embeddings L2-normalizados de 768 dimensiones. La conversión Core ML aplica cuantización de 8 bits por grupos de canales, manteniendo una fidelidad alta (coseno ≥ 0.99 respecto al modelo PyTorch de referencia). La licencia es Apache 2.0, igual que los pesos originales de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) para imagen + Transformer para texto (SigLIP 2 base) |
| Parametros totales | 86 millones (modelo base original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Imagen: 256×256 píxeles; texto: 64 tokens |
| Tipos de cuantizacion | 8-bit palettized (por grupos de canales) |
| Idiomas soportados | Multilingüe (según el modelo base SigLIP 2, aunque no se especifican idiomas concretos en esta conversión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage), tokenizer en formato Gemma SentencePiece (tokenizer.json) |

## Arquitectura y entrenamiento

El modelo original SigLIP 2 base es un encoder dual: una torre de visión basada en ViT (patch size 16, resolución 256) y una torre de texto basada en Transformer. El entrenamiento combina la pérdida contrastiva de SigLIP (sigmoid loss) con preentrenamiento por captioning, autodistilación y predicción enmascarada, según el paper "SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding". Esta conversión Core ML no modifica los pesos, solo los transforma a formato Core ML con cuantización de 8 bits. La conversión está validada por paridad: los embeddings generados coinciden con los de la referencia PyTorch con coseno ≥ 0.99 en un conjunto de prueba. El tokenizador es el de Gemma (SentencePiece), y el texto debe rellenarse a 64 tokens con el token de padding (0), sin máscara de atención, tal como se entrenó el modelo.

## Capacidades

- Generación de embeddings de imagen y texto en un espacio común de 768 dimensiones, L2-normalizados.
- Búsqueda de texto a imagen: dado un texto, se puede calcular la similitud coseno con embeddings de imágenes para recuperar las más relevantes.
- Búsqueda de imagen a texto (simétrica, aunque el caso de uso principal es texto→imagen).
- Multilingüe: el modelo base soporta múltiples idiomas, aunque esta conversión no especifica cuáles.
- Inferencia en dispositivo Apple: los encoders están separados en dos paquetes Core ML, lo que permite cargar solo el necesario.
- Cuantización de 8 bits para reducir el tamaño (0.4 GB en total) y mejorar la eficiencia en hardware Apple.

## Casos de uso

- Búsqueda de metraje en editores de vídeo: el caso original de CuttyLA. Un editor puede escribir "atardecer en la playa" y el sistema recupera clips relevantes comparando embeddings de texto con embeddings de cada fotograma o clip.
- Archivado y organización de bibliotecas de imágenes: indexar miles de imágenes con el encoder de imagen y permitir búsquedas por descripción textual sin etiquetas manuales.
- Aplicaciones de fotos personales: buscar fotos por descripción ("mi perro en el parque") en el dispositivo, sin enviar datos a la nube.
- Asistentes de accesibilidad: describir imágenes a personas con discapacidad visual mediante la generación de texto a partir de la imagen (aunque el modelo no genera texto, se puede combinar con un LLM).
- Moderación de contenido visual: clasificar imágenes por similitud semántica con textos de referencia (p. ej., "contenido violento").
- Sistemas de recomendación visual: recomendar productos o imágenes similares basándose en la similitud de embeddings entre consultas de texto y catálogos visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión Core ML. El modelo base SigLIP 2 (google/siglip2-base-patch16-256) tiene resultados publicados en el paper original (arXiv:2502.14786), que incluyen métricas como zero-shot classification, retrieval y grounding, pero no se dispone de esos números en la información proporcionada. Se recomienda consultar el paper para datos de rendimiento del modelo original.

## Requisitos de hardware

- Destinado a dispositivos Apple con macOS 15 o superior (según la model card).
- Tamaño del repositorio: 0.4 GB, lo que indica que los dos encoders juntos ocupan aproximadamente ese espacio en disco.
- Al ser Core ML, se ejecuta en Apple Neural Engine (ANE) o GPU/CPU de Apple, dependiendo de la disponibilidad.
- No se especifican requisitos de VRAM ni GPU concretas; al ser un modelo de 86M parámetros cuantizado a 8 bits, es viable en dispositivos con al menos 4 GB de RAM unificada (Apple Silicon).
- Opciones de despliegue: integración directa en apps de iOS/macOS mediante Core ML; no se mencionan vLLM, llama.cpp u otros frameworks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| karaiman/siglip2-base-coreml | 86M (base) | Imagen 256×256, texto 64 tokens | Apache 2.0 | Core ML | Conversión 8-bit, para Apple |
| google/siglip2-base-patch16-256 | 86M | Imagen 256×256, texto 64 tokens | Apache 2.0 | PyTorch (safetensors) | Modelo original de referencia |
| palmier-io/siglip2-base-coreml | 86M (base) | Igual | Apache 2.0 | Core ML | Conversión similar, de otro autor |

No se dispone de comparativas con otros modelos de la misma categoría (p. ej., CLIP, OpenCLIP) en la información proporcionada.

## Limitaciones y advertencias

- La conversión está cuantizada a 8 bits, lo que puede introducir una ligera degradación en la calidad de los embeddings, aunque se garantiza coseno ≥ 0.99 respecto al original.
- El texto debe tokenizarse con el tokenizador Gemma incluido y rellenarse exactamente a 64 tokens con el token de padding 0; cualquier desviación puede degradar la calidad de los embeddings.
- El preprocesado de imagen es un "squash-resize" a 256×256 (sin recorte central), lo que puede distorsionar imágenes con proporciones muy diferentes.
- No se especifican los idiomas soportados en esta conversión; aunque el modelo base es multilingüe, la documentación no detalla qué idiomas funcionan mejor.
- El modelo no genera texto ni imágenes; solo produce embeddings. Para tareas de generación se necesita un modelo adicional.
- La licencia Apache 2.0 permite uso comercial, pero los pesos originales son de Google; esta conversión redistribuye una forma transformada sin modificar los valores más allá de la cuantización.
- No hay garantías de soporte o mantenimiento por parte del autor; el repositorio es de un particular.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/karaiman/siglip2-base-coreml
- Modelo base original: https://huggingface.co/google/siglip2-base-patch16-256
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Repositorio CuttyLA (fuente de la conversión): https://github.com/palmier-io/palmier-pro/tree/main/models/siglip2
- Conversión similar de palmier-io: https://huggingface.co/palmier-io/siglip2-base-coreml
