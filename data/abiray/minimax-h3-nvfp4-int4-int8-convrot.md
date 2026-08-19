# Abiray/Minimax-H3-nvfp4-INT4-INT8-Convrot

## Resumen

Este repositorio, publicado por el usuario Abiray, es una colección comunitaria de pesos cuantizados y podados del modelo MiniMax H3 (también conocido como Hailuo 3.0), un modelo omni-modal de generación de vídeo desarrollado por MiniMax. La versión original de MiniMax H3 cuenta con 33.100 millones de parámetros y fue liberada con pesos abiertos el 3 de agosto de 2026, con soporte nativo para ComfyUI. Esta cuantización unifica varios formatos (INT4, INT8, NVFP4 y versiones podadas) en un único repositorio estructurado, con el objetivo de facilitar la ejecución local en GPUs de consumo.

La relevancia de este modelo radica en que permite ejecutar un generador de vídeo de última generación en hardware doméstico, algo que hasta ahora estaba reservado a clústeres profesionales. Al combinar cuantización y poda, se reduce significativamente el uso de VRAM y se acelera la inferencia, manteniendo una calidad visual aceptable. El pipeline principal es image-text-to-video, aunque el modelo base también soporta text-to-video, video-to-video y text-to-audio-video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni-modal (texto, imagen, vídeo, audio) |
| Parametros totales | 33.100 millones (modelo base) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4, INT8, NVFP4, mixto, podado (pruned) |
| Idiomas soportados | No disponible |
| Licencia | other (no especificada en el repositorio) |
| Formato de pesos | Safetensors (presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El modelo base MiniMax H3 es un transformer omni-modal diseñado para procesar y generar múltiples modalidades (texto, imagen, vídeo y audio) de forma unificada. No se han publicado detalles oficiales sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información disponible. La cuantización de Abiray aplica técnicas de reducción de precisión (INT4, INT8, NVFP4) y poda estructural para reducir el tamaño del modelo, manteniendo la mayor parte de su capacidad generativa. No se documentan innovaciones técnicas adicionales en el repositorio, aunque el artículo de ComfyUI Wiki menciona que las cuantizaciones comunitarias llegaron el mismo día del lanzamiento de los pesos abiertos.

## Capacidades

- Generación de vídeo a partir de texto, imagen o combinación de ambos (image-text-to-video).
- Conversión de vídeo a vídeo (video-to-video) y generación de audio asociado al vídeo (text-to-audio-video).
- Integración nativa con ComfyUI mediante flujos de trabajo incluidos en el repositorio.
- Soporte de múltiples formatos de cuantización para adaptarse a diferentes capacidades de hardware.
- Capacidad de ejecución local en GPUs de consumo gracias a la reducción de precisión y poda.
- No se ha confirmado soporte de tool calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Producción de vídeo creativo local: un artista o diseñador puede generar clips cortos a partir de prompts de texto o imágenes de referencia directamente en su estación de trabajo, sin depender de APIs externas, gracias a la cuantización INT4 que cabe en GPUs de 16-24 GB.
- Prototipado rápido en estudios de animación: los equipos pueden iterar sobre ideas de storyboard generando vídeos de baja resolución con el modelo podado, reduciendo costes y tiempos de espera frente a servicios en la nube.
- Integración en pipelines de ComfyUI: los flujos de trabajo incluidos permiten conectar el modelo con otros nodos de procesamiento de imagen y vídeo, facilitando la creación de efectos visuales personalizados.
- Generación de contenido para redes sociales: creadores de contenido pueden producir vídeos cortos de forma automatizada, usando el modelo NVFP4 en GPUs Blackwell para obtener un equilibrio entre calidad y velocidad.
- Educación y demostraciones técnicas: investigadores y estudiantes pueden experimentar con un modelo de vídeo de gran tamaño en hardware asequible, analizando el impacto de la cuantización en la calidad de salida.
- Archivado y preservación de modelos: al unificar varios formatos en un solo repositorio, se facilita la distribución y el despliegue en diferentes entornos, desde servidores con GPUs profesionales hasta equipos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas de calidad de vídeo (como FVD o CLIP score) ni mediciones de rendimiento (latencia, throughput) para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 33.100 millones de parámetros, una cuantización INT4 o NVFP4 podría requerir aproximadamente 16-18 GB de VRAM, mientras que INT8 necesitaría alrededor de 33 GB. Estas cifras son estimaciones orientativas basadas en el tamaño del modelo y no han sido confirmadas por el autor.
- GPUs recomendadas: RTX 4090 (24 GB) para INT4/NVFP4, RTX 5090 o GPUs Blackwell (como B200) para NVFP4 con aceleración de atención, y GPUs de datacenter (A100, H100) para INT8 sin poda.
- En GPUs de consumo con 12-16 GB (como RTX 3080/4070), solo serían viables las versiones podadas o cuantizaciones mixtas más agresivas.
- Opciones de despliegue: ComfyUI es el entorno principal soportado, con flujos de trabajo incluidos. También podría usarse con herramientas como Diffusers si se adaptan los pesos, aunque no está documentado.
- Latencia y throughput: no disponibles. El artículo menciona que SageAttention (kernel de atención int8) puede acelerar la inferencia entre un 30-40% en GPUs Blackwell y un 7% en RTX 5090, y que EasyCache (nodo de salto de pasos) puede reducir el tiempo de denoise en ~25% con una pérdida de calidad.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de generación de vídeo de código abierto (como Stable Video Diffusion, CogVideoX o LTX-Video). El modelo base MiniMax H3 destaca por su tamaño (33.100 millones de parámetros) y su naturaleza omni-modal, pero no se han publicado benchmarks comparativos en las fuentes consultadas. Se recomienda consultar la documentación oficial de MiniMax para obtener datos de rendimiento relativos.

## Limitaciones y advertencias

- La licencia del modelo base se indica como "other" en HuggingFace, lo que implica restricciones de uso no especificadas. Antes de usar el modelo en producción comercial, es imprescindible revisar los términos de la licencia original de MiniMax.
- No se han documentado sesgos específicos, pero al ser un modelo de vídeo entrenado con datos web, es probable que herede sesgos de género, raza y cultura presentes en los datos de entrenamiento.
- Riesgo de alucinación visual: el modelo puede generar vídeos con inconsistencias físicas, objetos deformes o movimientos no realistas, especialmente en escenas complejas o con prompts ambiguos.
- La cuantización y poda pueden degradar la calidad de salida, especialmente en formatos INT4 o mixtos. Se recomienda validar la calidad en el caso de uso concreto antes de desplegarlo.
- La longitud de contexto no está documentada, lo que limita la capacidad de generar vídeos largos o con múltiples escenas sin conocer los límites reales.
- No se ha confirmado el soporte de idiomas; el modelo base probablemente funcione mejor en inglés, pero no hay datos oficiales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abiray/Minimax-H3-nvfp4-INT4-INT8-Convrot
- Árbol de archivos en HuggingFace: https://huggingface.co/Abiray/Minimax-H3-nvfp4-INT4-INT8-Convrot/tree/main
- Artículo de ComfyUI Wiki sobre cuantizaciones comunitarias: https://comfyui-wiki.com/en/news/2026-08-03-minimax-h3-community-quants
- Página en ModelScope: https://www.modelscope.cn/models/Abiray/Minimax-H3-nvfp4-INT4-INT8-Convrot
- Mapa de hardware y recetas de MiniMax H3 (gist): https://gist.github.com/yume-arasaki/e24bf2614ee0419c86250cee6ad7ce01
