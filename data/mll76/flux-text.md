# MLL76/FLUX-Text

## Resumen

FLUX-Text es un modelo de edición de texto en escenas (scene text editing) desarrollado por Alibaba Group, presentado en el artículo técnico "FLUX-Text: A Simple and Advanced Diffusion Transformer Baseline for Scene Text Editing" (arXiv:2505.03329). El modelo permite modificar o añadir texto en imágenes existentes manteniendo la coherencia visual con el fondo, la tipografía y el estilo original, y soporta tanto inglés como chino en texto multilínea. Está construido sobre la arquitectura de FLUX, el modelo de difusión de Black Forest Labs, y añade módulos ligeros de inyección de condiciones mediante LoRA y una estrategia de entrenamiento en dos fases.

La relevancia de este modelo reside en que aborda una tarea compleja que requiere comprender el contexto visual, la tipografía y la disposición espacial del texto existente para generar texto nuevo que se integre de forma natural. El repositorio incluye código de inferencia, entrenamiento, una demo de Gradio y soporte para ComfyUI, lo que facilita su adopción en flujos de trabajo de diseño y producción. El checkpoint oficial se distribuye bajo licencia MIT y está disponible en Hugging Face, con un tamaño de repositorio de 8.8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (basado en FLUX.1-dev) con módulos de inyección de condiciones mediante LoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés y chino (multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

FLUX-Text se basa en FLUX.1-dev, un modelo de difusión de tipo transformer (DiT) con arquitectura multimodal que combina un codificador de texto y un autoencoder variacional. Sobre esta base, los autores añaden un módulo de inyección de condiciones mediante LoRA (Condition Injection LoRA) que permite introducir condiciones visuales y de texto sin alterar los pesos originales del modelo base, preservando así la capacidad generativa de FLUX.

El entrenamiento se realiza en dos fases: una primera fase de alineación y una segunda fase de refinamiento, utilizando una función de pérdida denominada Regional text perceptual loss, que mejora la fidelidad de los glifos generados y la coherencia con el fondo. El modelo está diseñado para editar texto multilínea en escenas complejas, incluyendo carteles, anuncios y entornos de juego, con capacidad multilingüe para inglés y chino. El código de entrenamiento está disponible en el repositorio de GitHub y soporta entrenamiento multiescala.

## Capacidades

- Edición de texto en escenas: modifica texto existente en imágenes manteniendo la coherencia con el fondo, la perspectiva y la iluminación.
- Generación de texto multilingüe: soporta inglés y chino, incluida la generación de glifos complejos con diferentes tipografías y estilos.
- Edición de texto multilínea: puede manejar bloques de texto con varias líneas y diferentes atributos tipográficos.
- Edición de carteles y material gráfico: permite modificar textos en carteles, anuncios, pósters y otros diseños visuales.
- Integración con flujos de trabajo de diseño: compatible con ComfyUI y ofrece una demo de Gradio para pruebas interactivas.
- Generación de vídeo con efectos de texto: mediante el uso de fotogramas iniciales y finales, permite crear secuencias de vídeo con efectos de texto animados.

## Casos de uso

- Edición de carteles publicitarios: un diseñador puede modificar el texto de un cartel existente (por ejemplo, cambiar "50% OFF" por "70% OFF") manteniendo el estilo visual, la tipografía y la disposición originales, sin necesidad de rediseñar el cartel desde cero.
- Localización de anuncios y material de marketing: permite traducir el texto de anuncios en inglés a chino (o viceversa) manteniendo el diseño y la composición visual, lo que facilita la adaptación de campañas publicitarias a diferentes mercados.
- Automatización de la mejora de imágenes de producto: mediante flujos de trabajo de ComfyUI, se pueden añadir automáticamente textos informativos (precio, características, alcance del servicio) a imágenes de productos de manera consistente y profesional.
- Creación de contenido para redes sociales: permite editar texto en imágenes existentes para generar variantes de publicaciones, manteniendo la identidad visual de la marca.
- Generación de vídeo con efectos de texto: utilizando los fotogramas inicial y final, se pueden crear secuencias de vídeo con texto animado, útil para publicidad dinámica o contenido educativo.
- Diseño de juegos y entornos virtuales: permite editar textos en capturas de pantalla o renderizaciones de juegos para crear variantes de interfaz o contenido localizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. El artículo técnico (arXiv:2505.03329) menciona mejoras significativas en los benchmarks de chino e inglés, pero no se incluyen las cifras concretas en la información proporcionada.

## Requisitos de hardware

- La demo de Gradio de baja VRAM requiere aproximadamente 25 GB de VRAM para ejecutarse.
- La comunidad ha conseguido ejecutar el modelo en tarjetas con 8 GB de VRAM mediante flujo de trabajo de ComfyUI, aunque con resultados potencialmente menos consistentes.
- El modelo se distribuye en formato safetensors y es compatible con la librería diffusers de Hugging Face.
- Para inferencia, se recomienda el uso de GPU con soporte CUDA y suficiente VRAM, como una RTX 4090 (24 GB) o una A100 (40 GB/80 GB) para obtener resultados óptimos.
- El despliegue puede realizarse mediante el código de inferencia oficial del repositorio de GitHub, la demo de Gradio o mediante ComfyUI para flujos de trabajo visuales.
- No se proporcionan datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX-Text | DiT basado en FLUX.1-dev | no disponible | no disponible | MIT | Hugging Face, GitHub |
| FLUX.1-dev | DiT | 12B | 4096 tokens | Licencia no comercial de FLUX.1 | Hugging Face, GitHub |
| AnyText | Diffusion + Text encoder | no disponible | no disponible | no disponible | GitHub |
| TextDiffuser-2 | Diffusion | no disponible | no disponible | no disponible | GitHub |

FLUX-Text se diferencia de FLUX.1-dev en que añade módulos de inyección de condiciones mediante LoRA y una estrategia de entrenamiento específica para la edición de texto en escenas, mientras que FLUX.1-dev es un modelo de generación de texto a imagen general. AnyText y TextDiffuser-2 son alternativas específicas para edición de texto en escenas, pero no se dispone de datos comparativos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para la edición de texto en escenas, por lo que no es adecuado para la generación de imágenes desde texto general.
- La calidad de la edición puede verse degradada en imágenes con escenas muy complejas, con perspectiva pronunciada o con tipografías no incluidas en el conjunto de entrenamiento.
- Aunque la comunidad ha conseguido ejecutar el modelo en 8 GB de VRAM, los resultados pueden no ser consistentes con los obtenidos con mayor VRAM, según se indica en el repositorio.
- El modelo se basa en FLUX.1-dev, que tiene una licencia no comercial. Aunque FLUX-Text se distribuye bajo licencia MIT, el uso comercial del modelo puede estar restringido por la licencia del modelo base, por lo que se recomienda revisar los términos de FLUX.1-dev.
- El idioma principal de la documentación y los ejemplos es el inglés y el chino; el soporte para otros idiomas no está garantizado.
- La generación de texto puede presentar alucinaciones o errores en glifos complejos, especialmente en tipografías poco comunes o en idiomas no entrenados.

## Enlaces

- Página de Hugging Face del modelo: https://huggingface.co/MLL76/FLUX-Text
- Página de Hugging Face del modelo oficial: https://huggingface.co/GD-ML/FLUX-Text
- Repositorio de GitHub: https://github.com/AMAP-ML/FluxText
- Artículo técnico (arXiv): https://arxiv.org/abs/2505.03329
- Página del proyecto: https://amap-ml.github.io/FLUX-text/
- Repositorio de inferencia de FLUX (Black Forest Labs): https://github.com/black-forest-labs/flux
