# gguf-org/minimax-h3-image-gguf

## Resumen

MiniMax-H3-Image es un modelo de generación y edición de imágenes desarrollado por MiniMaxAI, distribuido en este repositorio por el usuario gguf-org en formato GGUF cuantizado. El modelo base declara 20.113.670.232 parámetros (aproximadamente 20,1 mil millones) según los pesos en safetensors, lo que lo sitúa en la gama alta de los modelos de difusión y generación visual de código abierto. El repositorio ocupa 25,7 GB y está pensado para su uso con el motor `gk` (ggk), que implementa streaming de residencia automática para máquinas con poca VRAM.

La relevancia de esta ficha radica en que se trata de una cuantización GGUF de un modelo multimodal de generación de imágenes que combina un modelo de difusión con un LLM auxiliar (Qwen3-VL de 32B, según los comandos de ejemplo) y un VAE separado. Esta arquitectura híbrida permite tanto text-to-image como edición de imágenes guiada por instrucciones en lenguaje natural, con un número de pasos de muestreo muy bajo (6 pasos) y una escala CFG de 1, lo que sugiere un modelo destilado o entrenado para inferencia rápida.

No obstante, la información pública disponible es extremadamente limitada: la model card no incluye licencia, idiomas soportados, detalles de entrenamiento ni benchmarks. Esta ficha refleja únicamente los datos verificables del repositorio y de la model card, indicando explícitamente "no disponible" en todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion con LLM auxiliar Qwen3-VL 32B y VAE separado, segun los comandos de ejemplo) |
| Parametros totales | 20.113.670.232 (20,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; en los ejemplos aparecen `nvfp4` (diffusion model), `q2_k_m` (LLM) y `f16` (VAE) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |
| Tamano del repositorio | 25,7 GB |
| Modelo base | MiniMaxAI/MiniMax-H3-Image |
| Motor de inferencia | gk (ggk) con soporte de offload a CPU y streaming de residencia |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base. Los comandos de ejemplo revelan una estructura de tres componentes: un modelo de difusión (`minimax_h3_image_pruned-nvfp4.gguf`), un LLM auxiliar basado en Qwen3-VL de 32B (`qwen3vl_32b_minimax_h3-q2_k_m.gguf`) y un VAE (`minimax_h3_image_vae_fp16-f16.gguf`). El término "pruned" en el nombre del archivo de difusión sugiere que se ha aplicado poda al modelo original, y la cuantización `nvfp4` (formato de 4 bits de NVIDIA) indica una compresión agresiva orientada a reducir el uso de VRAM.

El muestreo emplea una lista explícita de sigmas (`1.0, 0.9675..., 0.8875..., 0.75, 0.5327..., 0.2320..., 0.0`) con solo 6 pasos y `cfg-scale 1`, lo que es coherente con un modelo destilado para inferencia rápida o con un sampler de flujo (flow matching) predefinido. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), con prompts en lenguaje natural.
- Edición de imágenes guiada por instrucciones, preservando el resto de la imagen (según el ejemplo de las gafas de sol sobre la oveja).
- Integración con un LLM auxiliar Qwen3-VL de 32B para la comprensión del prompt y de la imagen de entrada.
- Inferencia con muy pocos pasos de muestreo (6 pasos) y CFG 1, lo que reduce el coste computacional por imagen.
- Soporte de offload a CPU y streaming de residencia automática, lo que permite ejecución en GPUs con menos de 6 GB de VRAM según la model card.
- Soporte de atención flash para difusión (`--diffusion-fa`).
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: con 6 pasos y CFG 1, el modelo permite iterar sobre conceptos visuales en segundos, adecuado para equipos de diseño que necesitan bocetos antes de pasar a producción.
- Edición fotográfica asistida por instrucciones: el modo de edición permite modificar elementos concretos (por ejemplo, añadir gafas de sol) manteniendo el resto de la imagen, útil para retoque rápido en flujos de marketing.
- Despliegue en estaciones de trabajo con VRAM limitada: gracias al streaming de residencia y al offload a CPU, puede ejecutarse en GPUs de gama baja (menos de 6 GB), lo que facilita pruebas locales sin infraestructura dedicada.
- Creación de variaciones de producto: a partir de una imagen base, se pueden generar ediciones controladas por texto para catálogos de e-commerce, reduciendo la necesidad de sesiones fotográficas adicionales.
- Integración en pipelines de generación de contenido: el formato GGUF y el motor `gk` permiten scripting por línea de comandos, lo que facilita su incorporación en automatizaciones de generación por lotes.
- Investigación en cuantización de modelos de difusión: al combinar `nvfp4`, `q2_k_m` y `f16` en un mismo pipeline, el repositorio sirve como caso de estudio de cómo afectan distintas precisiones a la calidad de imagen y al consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 25,7 GB, pero la suma de los tres componentes cuantizados (difusión `nvfp4`, LLM `q2_k_m`, VAE `f16`) es menor que ese total; el uso real depende de la configuración de offload.
- La model card afirma que el motor `gk` funciona en GPUs de gama baja con "incluso menos de 6 GB de VRAM" mediante streaming de residencia automática, a costa de velocidad.
- GPU recomendadas: no disponible. Por el tamaño del LLM auxiliar (Qwen3-VL 32B cuantizado a `q2_k_m`), se requiere offload a CPU o a memoria del sistema en la mayoría de configuraciones consumer.
- Opciones de despliegue: motor `gk` (ggk) con parámetros `--offload-to-cpu`, `--diffusion-fa` y `--sigmas`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia no está publicada en el repositorio, por lo que no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base MiniMaxAI/MiniMax-H3-Image antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados; los prompts de ejemplo están en inglés y se desconoce el comportamiento con otros idiomas.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad del modelo.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente o no fiel al prompt, especialmente con instrucciones ambiguas.
- La cuantización agresiva (`nvfp4` en difusión y `q2_k_m` en el LLM auxiliar) puede degradar la calidad de imagen y la fidelidad de la edición respecto al modelo original en precisión completa.
- El repositorio tiene muy poca tracción (2 descargas, 1 like) y fue creado en noviembre de 2026; no hay evidencia de mantenimiento ni de validación comunitaria.
- El motor `gk` es poco conocido y no se documenta su compatibilidad con otros runners; esto limita la portabilidad del modelo.
- No se especifican requisitos de memoria del sistema para el offload a CPU, lo que puede provocar fallos en máquinas con RAM insuficiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gguf-org/minimax-h3-image-gguf
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
