# Nanite-Labs/nanites-petroglyph-sdxl-1.0

## Resumen

El modelo `nanites-petroglyph-sdxl-1.0` es un adaptador LoRA para Stable Diffusion XL desarrollado por Nanite-Labs, especializado en la generación de imágenes estilo petroglifo o arte rupestre. A partir de 119 fotografías de referencia de dominio público y licencias abiertas (CC0 / CC-BY / CC-BY-SA), el modelo aprende a reproducir la iconografía de líneas picadas, pátinas de barniz desértico, texturas de piedra meteorizada y figuras de animales, espirales y humanoides. Se publica como una versión alfa y se distribuye como un único adaptador de 0,1 GB compatible con la librería Diffusers.

Su relevancia radica en que ofrece un recurso de nicho para artistas, ilustradores y arqueólogos que necesitan generar imágenes de arte rupestre con cierta fidelidad, sin necesidad de entrenar un modelo completo desde cero. Al usar el token de activación `petroglyph`, el adaptador puede integrarse en los flujos de trabajo habituales de SD XL, como Automatic1111 o ComfyUI, lo que permite producir variaciones de petroglifos a partir de descripciones textuales.

Debido a que es una versión alfa y a que no se han publicado benchmarks, su rendimiento debe evaluarse manualmente en cada caso de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre el modelo UNet de Stable Diffusion XL |
| Parámetros totales | No disponible (repo de 0,1 GB con el adaptador) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de texto a imagen) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles (no se especifica; el prompt de ejemplo está en inglés) |
| Licencia | CreativeML Open RAIL++-M (heredada del modelo base; etiqueta en HuggingFace: other) |
| Formato de pesos | Safetensors (compatible con Diffusers) |

## Arquitectura y entrenamiento

El modelo se presenta como un adaptador LoRA de rango bajo (rank 16, alpha 16) ajustado sobre el modelo base `stabilityai/stable-diffusion-xl-base-1.0`. El entrenamiento se realizó a resolución 768, con precisión mixta bf16, 1500 pasos, y un dataset de 119 imágenes de referencia. La pérdida media de los últimos 50 pasos fue de 0,148. El hardware utilizado fue una RTX 4070 de 8 GB con CPU offload.

No se describen innovaciones técnicas más allá del ajuste fino estándar mediante LoRA. El adaptador modifica selectivamente los pesos del UNet del modelo base para inducir el estilo petroglyph sin alterar la arquitectura original. La procedencia de las imágenes de entrenamiento (con sus licencias individuales) se documenta en el repositorio fuente del proyecto (`experts/petroglyph/data/manifest.csv`).

## Capacidades

- Generación de imágenes en estilo petroglifo mediante el token de activación `petroglyph`.
- Reproducción de iconografía de líneas picadas (pecked-line) y pátina de barniz desértico.
- Representación de texturas de piedra meteorizada y elementos naturales como arenisca roja.
- Generación de figuras de animales (por ejemplo, muflones), espirales y humanoides.
- Compatible con pipelines de difusión basados en Diffusers.
- No soporta tool calling, function calling, razonamiento multi-step ni procesamiento de lenguaje natural más allá de la interpretación de prompts de texto a imagen.

## Casos de uso

- Ilustración arqueológica: el modelo puede generar representaciones de petroglifos a partir de descripciones como `petroglyph, bighorn sheep carved into red sandstone` para ilustrar publicaciones científicas o divulgativas. Su integración con Diffusers permite ajustar el guidance scale y el número de pasos para controlar la fidelidad al texto.
- Diseño de tatuajes: los artistas pueden utilizar el adaptador para crear diseños exclusivos inspirados en arte rupestre, combinando el token `petroglyph` con descripciones de animales o símbolos, y ajustar la composición mediante el modelo base SD XL.
- Ambientación de videojuegos: para level designers de mundos con temática prehistórica o fantástica, el modelo genera texturas murales o la roca con figuras rupestres que pueden integrarse en motores como Unreal o Unity.
- Materiales educativos: generación de imágenes de referencia sobre arte prehistórico para libros de texto o presentaciones en centros educativos, permitiendo obtener visuales de calidad sin derechos de autor.
- Prototipado de arte conceptual: diseñadores de producto o especialistas en decoración pueden producir conceptos de textiles, estampados o elementos decorativos inspirados en petroglifos, usando el LoRA como base para iteraciones rápidas.
- Creación de contenido para redes sociales: creadores de contenido pueden generar imágenes de estética prehistórica para campañas de divulgación o marketing cultural, reduciendo el coste de producción de imágenes originales.
- Recreación virtual de petroglifos dañados: conservadores o investigadores pueden generar imágenes hipotéticas de petroglifos erosionados o fragmentados para apoyar labores de reconstrucción virtual, siempre que la generación se trate como una hipótesis visual y no como una restitución exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de calidad (por ejemplo, FID, CLIP score) ni comparaciones con otros modelos o adaptadores. El rendimiento debe validarse mediante evaluación manual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El entrenamiento se realizó con una RTX 4070 de 8 GB y CPU offload, por lo que se espera que una GPU con al menos 8 GB sea suficiente para ejecutar el modelo base SD XL junto con el adaptador en fp16.
- GPU recomendada: RTX 4070 8 GB (usada para el entrenamiento) o cualquier GPU de 12 GB o superior para disponer de más margen de VRAM y evitar offload.
- ¿Cabe en GPU de consumo? Sí, en GPUs de consumo con 8 GB o más de VRAM, como la RTX 3060 12 GB, la RTX 4060 8 GB o la RTX 4070.
- Opciones de despliegue: Diffusers (pipelines de text-to-image), ComfyUI, Automatic1111 WebUI y cualquier framework que soporte la carga de adaptadores LoRA sobre Stable Diffusion XL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos sobre otros adaptadores LoRA para generación de petroglifos ni benchmarks comparativos que permitan evaluar el rendimiento relativo de este modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Versión alfa: el autor identifica el modelo como una versión alfa y anticipa fallos en la generación de ciertos elementos. Puede producir resultados incompletos o de calidad variable.
- Sesgo del dataset: las 119 imágenes de referencia proceden de Wikimedia Commons, lo que puede reflejar una representación geográfica y cultural limitada del arte rupestre, sesgando los tipos de figuras y estilos generados.
- Riesgo de alucinación visual: al ser un modelo generativo, puede crear formas incoherentes, artefactos o figuras irreales, especialmente con prompts complejos o combinaciones no descritas en el dataset.
- Licencia y atribución: el adaptador hereda la licencia CreativeML Open RAIL++-M del modelo base, pero las imágenes de referencia conservan sus propias licencias (CC0 / CC-BY / CC-BY-SA). Antes de un uso comercial o redistribución, debe revisarse el repositorio fuente para verificar la procedencia y cumplir con los requisitos de atribución.
- Limitaciones de idioma: no se especifica el soporte de idiomas. El prompt de ejemplo y el token de activación están en inglés, y el modelo base SD XL está optimizado para ese idioma, por lo que es probable que los prompts en otros idiomas degraden el rendimiento.
- Restricciones de producción: al ser un adaptador de nicho y en estado alfa, no se recomienda para aplicaciones críticas sin una validación previa de la calidad y la seguridad de las imágenes generadas.

## Enlaces

- HuggingFace: https://huggingface.co/Nanite-Labs/nanites-petroglyph-sdxl-1.0
- Perfil de Nanite-Labs en HuggingFace: https://huggingface.co/Nanite-Labs
- Modelo base Stable Diffusion XL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Repositorio fuente del proyecto (mencionado en la model card): `experts/petroglyph/data/manifest.csv` (no se proporciona una URL directa)
