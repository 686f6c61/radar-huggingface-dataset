# RicemanT/MageTrail

## Resumen

MageTrail es un modelo de texto a imagen desarrollado por RicemanT, basado en el modelo Mage-Flow 4B de Microsoft. Se trata de un finetune completo (full finetune) orientado a la generación de imágenes en estilo anime y furry, entrenado sobre el dataset Booru-Essence-2026, compuesto por 41.000 imágenes etiquetadas. El modelo se distribuye bajo licencia MIT y se integra con la librería diffusers de HuggingFace, lo que facilita su uso en entornos como ComfyUI.

La relevancia de MageTrail radica en que ofrece una especialización de nicho sobre un modelo de flujo de 4B, con soporte para etiquetas de Danbooru y e621, así como para descripciones en lenguaje natural. El entrenamiento empleó técnicas avanzadas de diffusion-pipe, incluyendo mezcla de captions, dropout de etiquetas y un sistema de atribución de artistas, lo que lo convierte en una opción interesante para la generación de ilustraciones anime y furry con control fino del estilo.

No se han publicado benchmarks ni métricas de rendimiento en la información disponible, y la documentación del modelo es aún un placeholder, por lo que se recomienda evaluar el modelo de forma empírica antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (finetune del modelo Mage-Flow 4B de Microsoft) |
| Parametros totales | 4B (según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

MageTrail es un finetune completo del modelo Mage-Flow 4B de Microsoft. La arquitectura interna del modelo base no se detalla en la información proporcionada, pero se sabe que es un modelo de flujo (flow matching) de 4.000 millones de parámetros, diseñado para generación de imágenes a partir de texto. El finetune se realizó con el trainer Diffusion-Pipe (fork de RicemanT) sobre un clúster de 8 GPUs H100 HBM3 de 80 GB, con un tiempo total de entrenamiento de 8 horas (~64 horas H100). Se procesaron aproximadamente 326.656 muestras a resolución 1024x1024.

El entrenamiento utilizó precisión BF16 completa, optimizador AdamW8bit con sumación Kahan para compensar el redondeo de precisión, learning rate de 7e-6 con scheduler Warmup -> Constant -> REX hasta 0e-7, weight decay de 0.01 y timestep sampling Logit-Normal con shift 4 y sigmoid scale 1.3. Se aplicaron técnicas de regularización como tag dropout del 10%, caption dropout del 5%, mezcla de captions en proporción 25/25/25/25 (solo etiquetas, solo lenguaje natural, etiquetas más lenguaje natural, lenguaje natural más etiquetas), tag shuffle, caption shuffle y un sistema de atribución de artistas para controlar el estilo.

El dataset Booru-Essence-2026, originalmente creado por Lodestone Rock, fue actualizado al estándar de etiquetas de 2026 y anotado con modelos de captioning de última generación. Las herramientas de procesamiento del dataset se encuentran en el repositorio de entrenamiento del autor.

## Capacidades

- Generación de imágenes a partir de prompts de texto en estilo anime y furry, con resolución de entrenamiento de 1024x1024.
- Soporte de etiquetas de Danbooru y e621 (tags), así como descripciones en lenguaje natural y combinaciones mixtas de ambos formatos.
- Sistema de atribución de artistas (artist trigger attribution) que permite imitar estilos de artistas específicos mediante etiquetas.
- Integración con la librería diffusers de HuggingFace y compatibilidad con ComfyUI, como se indica en la model card.
- No soporta tool calling, function calling ni razonamiento multi-paso, al ser un modelo puramente generativo de imágenes.
- No dispone de capacidades de visión o audio; solo entrada de texto y salida de imagen.
- Las capacidades multilingües no están especificadas; el uso de etiquetas y prompts en inglés es el esperado.

## Casos de uso

- Generación de concept art para juegos indie: el modelo puede producir ilustraciones de personajes anime y furry de forma rápida, permitiendo iterar sobre diseños mediante prompts de etiquetas o lenguaje natural.
- Creación de contenido para comunidades de arte en línea: gracias a su entrenamiento con etiquetas de Danbooru y e621, resulta adecuado para generar imágenes que cumplan las convenciones de etiquetado de estas plataformas.
- Prototipado de personajes para animación: la resolución de entrenamiento de 1024x1024 permite generar imágenes base que pueden servir como referencia para animadores y artistas.
- Generación de avatares y perfiles personalizados: el modelo puede crear imágenes de perfil únicas en estilos anime o furry, aprovechando el control de atributos mediante etiquetas.
- Herramientas de apoyo para artistas: puede utilizarse para generar referencias de poses, composiciones o variaciones de estilo, facilitando el trabajo de ilustradores profesionales.
- Investigación en finetuning de modelos de difusión: el proyecto documenta un pipeline completo de entrenamiento con diffusion-pipe, lo que lo hace útil para estudiar el efecto del finetuning en dominios específicos como anime y furry.
- Generación de fondos y escenas para proyectos multimedia: el modelo puede producir escenas coherentes con el estilo anime/furry, útiles para juegos, cómics o vídeos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento, comparativas con otros modelos ni evaluaciones objetivas de calidad de imagen. Se recomienda realizar pruebas empíricas para valorar el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 4B en BF16, los pesos ocupan aproximadamente 8 GB de VRAM, más el overhead de activaciones y el VAE. Se estima que se necesitan al menos 12 GB de VRAM para una inferencia estable.
- GPU recomendadas: para inferencia se recomienda una GPU consumer con 16 GB o más de VRAM, como RTX 4080 o RTX 4090. Para entrenamiento, el autor utilizó 8x H100 HBM3 de 80 GB.
- Compatibilidad con GPUs consumer: es probable que funcione en RTX 3090 (24 GB) o RTX 4090 (24 GB) sin cuantización. No se dispone de datos sobre cuantizaciones.
- Opciones de despliegue: el modelo se puede cargar con la librería diffusers de HuggingFace, y la model card indica que las imágenes de ejemplo fueron generadas con ComfyUI. No está desplegado por ningún proveedor de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente en la información proporcionada para comparar MageTrail con modelos similares. No se han publicado benchmarks ni comparativas con otros modelos de texto a imagen especializados en anime o furry.

## Limitaciones y advertencias

- Sesgos: el modelo fue entrenado sobre datasets de Danbooru y e621, que pueden contener contenido sexual, violencia o estereotipos. El uso del modelo debe realizarse con responsabilidad y respetando las políticas de cada plataforma.
- Riesgo de alucinación: como en todos los modelos generativos de imagen, pueden aparecer artefactos, incoherencias anatómicas o elementos no deseados en las imágenes generadas.
- Limitaciones de idioma: no se especifican los idiomas soportados. El entrenamiento se basa en etiquetas y captions en inglés, por lo que el rendimiento con prompts en otros idiomas no está garantizado.
- Documentación incompleta: la model card es un placeholder y no incluye una descripción detallada, ejemplos de uso ni advertencias específicas. Esto dificulta la evaluación del modelo antes de su uso.
- Restricciones de licencia: el modelo se distribuye bajo licencia MIT como derivado de MageFlow, por lo que permite uso comercial sin restricciones adicionales. No obstante, se debe verificar la licencia del modelo base y del dataset.
- Producción: al no existir benchmarks ni datos de latencia, no se recomienda su uso en sistemas de producción críticos sin una validación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RicemanT/MageTrail
- Dataset Booru-Essence-2026: https://huggingface.co/datasets/RicemanT/booru-essence-2026
- Modelo base Mage-Flow: https://huggingface.co/mage-flow-community/Mage-Flow
- Fork de diffusion-pipe para entrenamiento: https://github.com/RicemanT/diffusion-pipe-mageflow-ft
- Repositorio de configuraciones de entrenamiento: https://github.com/RicemanT/model-training-configs
- Modelo de etiquetado DeepGHS: https://huggingface.co/animetimm/convnextv2_huge.dbv4-full
- Modelo de etiquetado Hydra: https://huggingface.co/RedRocket/Hydra
- Banodoco (patrocinador): https://www.banodoco.ai/
- Discord de Banodoco: https://discord.gg/yzwcNaSEz
- Motimalu en Civitai: https://civitai.red/user/motimalu
- Diffusion-pipe original de Bluvoll: https://github.com/bluvoll/diffusion-pipe
- Nruaif en HuggingFace: https://huggingface.co/Shio-Koube
- GPU Garden: https://gpu.garden/
- Licencia MIT: https://choosealicense.com/licenses/mit/
