# corechan/MiniMax-H3_NF4

## Resumen

MiniMax-H3-NF4 es una versión cuantizada en formato NF4 (NormalFloat 4) del modelo MiniMax-H3, un sistema de generación de vídeo multimodal de última generación desarrollado por MiniMax. Este repositorio concreto, publicado por el usuario corechan, aplica cuantización mediante la biblioteca `bitsandbytes` sobre las capas lineales del modelo original, con el objetivo de reducir la huella de memoria para su inferencia en hardware convencional. El modelo original destaca por ser un generador de vídeo nativo de 2K con audio estéreo 3D sincronizado, y una variante podada del mismo reduce los parámetros totales a aproximadamente 20 mil millones.

La relevancia de esta versión cuantizada reside en que permite ejecutar un modelo de generación de vídeo de gran tamaño en GPUs con memoria limitada, manteniendo una calidad aceptable. Sin embargo, es fundamental tener en cuenta las restricciones de la licencia comunitaria de MiniMax, que limita el uso comercial gratuito a empresas con ingresos anuales inferiores a 20 millones de dólares y excluye explícitamente territorios como Estados Unidos, la Unión Europea, el Reino Unido y Corea del Sur. La arquitectura se basa en un Diffusion Transformer (DiT), adaptado para la síntesis conjunta de vídeo y audio sincronizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) multimodal para texto a vídeo y audio |
| Parametros totales | Aproximadamente 20 mil millones (en la variante pruned; el modelo original puede ser mayor, no especificado) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NF4 (NormalFloat 4) mediante `bitsandbytes`; se mencionan variantes INT8 y NVFP4 en otros repositorios |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (con restricciones comerciales y territoriales) |
| Formato de pesos | Safetensors (pesos cuantizados NF4) |

## Arquitectura y entrenamiento

El modelo original MiniMax-H3 se basa en un Diffusion Transformer (DiT) diseñado para generar vídeo de alta resolución (2K) con audio estéreo sincronizado. La variante pruned, desarrollada por Comfy-Org, sustituye el MLP de embedding de timestep del DiT por una tabla de consulta, reduciendo la dimensión de entrada de la capa `adaln_proj.linear` de 2688 a 8 y llevando los parámetros totales a aproximadamente 20 mil millones. Esta versión cuantizada aplica NF4 sobre las capas lineales del modelo, una técnica de cuantización que conserva la distribución de los pesos y minimiza la pérdida de calidad. No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo de texto con resolución 2K y audio estéreo 3D sincronizado.
- Síntesis de audio sincronizado con el contenido visual generado.
- Capacidades de generación de texto (tag `text-generation` en HuggingFace), aunque su propósito principal es la creación de vídeo.
- Soporte de herramientas y llamadas a funciones: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Creación de contenido para redes sociales: el modelo puede generar clips de vídeo de alta calidad con audio sincronizado, adecuados para plataformas como TikTok, Instagram Reels o YouTube Shorts, sin necesidad de equipos de producción.
- Prototipado de escenas para cine y publicidad: permite a directores y creativos visualizar ideas de forma rápida y económica, generando secuencias de vídeo con audio estéreo 3D para evaluar conceptos antes de una producción completa.
- Generación de vídeo educativo: puede producir material visual explicativo con audio, facilitando la creación de cursos, tutoriales y simulaciones para plataformas de e-learning.
- Doblaje y localización de vídeo: al generar audio sincronizado, puede usarse para crear versiones dobladas de contenido, aunque se debe verificar la calidad del audio en idiomas distintos al original.
- Diseño de anuncios y marketing: las agencias pueden generar múltiples variantes de anuncios en vídeo de forma automatizada, reduciendo costes y tiempo de producción.
- Investigación en generación de vídeo: sirve como base para experimentos en síntesis de vídeo multimodal, gracias a su licencia que permite modificación y redistribución (con restricciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; los archivos DiT cuantizados NF4 tienen un tamaño aproximado de 9,8 GB, por lo que se recomienda al menos 16 GB de VRAM para cargar el modelo completo.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100; el modelo puede caber en GPUs de consumo como la RTX 3080/3090 con 10-24 GB, aunque la inferencia será más lenta.
- Opciones de despliegue: se puede ejecutar mediante ComfyUI y DiffSynth-Studio, como se indica en los repositorios de la comunidad; no se mencionan integraciones con vLLM, llama.cpp o TGI para este modelo de vídeo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos comparativos con otros modelos de generación de vídeo en la información de la búsqueda. Existen alternativas como Sora (OpenAI), Runway Gen-3 o Pika, pero no se dispone de datos de rendimiento específicos para comparar en esta ficha.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial gratuito está limitado a entidades con ingresos anuales inferiores a 20 millones de dólares; las empresas con mayores ingresos deben obtener una licencia escrita de MiniMax.
- Exclusión territorial: el modelo no puede usarse, mostrarse o distribuirse en Estados Unidos, Unión Europea, Reino Unido y Corea del Sur sin autorización adicional.
- Prohibición de mejora cruzada: no se puede utilizar el modelo o sus salidas para entrenar, alinear o mejorar otros modelos de IA distintos de MiniMax-H3 o sus derivados directos.
- Obligación de atribución: cualquier producto o interfaz comercial debe mostrar crédito a MiniMax.
- La cuantización NF4 puede degradar ligeramente la calidad del vídeo y del audio en comparación con la versión en BF16 o FP16.
- No se dispone de información sobre sesgos o alucinaciones específicas; como cualquier modelo de generación de vídeo, puede producir contenido no deseado o incoherente, por lo que se recomienda supervisión humana.
- La versión cuantizada es un trabajo derivado de MiniMax-H3; el autor de este repositorio no está afiliado a MiniMax y no ofrece garantías.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/corechan/MiniMax-H3_NF4
- Modelo original de MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-H3
- GitHub de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Repositorio de la comunidad DiffSynth-Studio con cuantización NF4: https://huggingface.co/DiffSynth-Studio/MiniMax-H3-NF4
- Hub de recursos de MiniMax-H3 (ComfyUI): https://github.com/ai-models-lab/minimax-h3
- Página de descargas de archivos del modelo: https://minimaxh3.run/minimax-h3-model-files-downloads
