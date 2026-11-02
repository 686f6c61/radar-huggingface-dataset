# Rombakr5/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de difusión para generación de vídeo a partir de texto e imagen (text-to-video e image-to-video) desarrollado por el equipo Wan (Wan-AI, ecosistema Alibaba). Esta ficha corresponde a la réplica publicada por el usuario Rombakr5 en HuggingFace, que redistribuye los pesos originales del modelo TI2V-5B de la familia Wan2.2 bajo licencia Apache 2.0. El modelo forma parte de la segunda generación de la familia Wan, presentada en julio de 2025 junto con los modelos T2V-A14B e I2V-A14B basados en arquitectura MoE.

El modelo resuelve la generación de vídeo de alta definición (720P a 24 fps) en una sola GPU de consumo, gracias a un VAE propietario (Wan2.2-VAE) con ratio de compresión 16×16×4 que reduce drásticamente el coste computacional del proceso de difusión. Con 5.000 millones de parámetros, se posiciona como una alternativa eficiente frente a los modelos MoE de 14B de la misma familia, manteniendo soporte conjunto para texto-a-vídeo e imagen-a-vídeo en un único checkpoint.

La relevancia actual radica en que combina resolución 720P, 24 fps y ejecución en hardware consumer (RTX 4090) en un modelo abierto con licencia permisiva, algo poco habitual en el ecosistema de generación de vídeo open source. La información disponible en la model card es limitada en cuanto a benchmarks cuantitativos y detalles de entrenamiento, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión (diffusion transformer) con VAE de alta compresión Wan2.2-VAE (16×16×4) |
| Parámetros totales | 5B (aproximadamente 5.000 millones) |
| Parámetros activos | no disponible (no es MoE; los MoE son las variantes A14B) |
| Longitud de contexto | no disponible (modelo generativo de vídeo, no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | en, zh, id, jv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 34,2 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusión para vídeo con un VAE de alta compresión (Wan2.2-VAE) que logra un ratio de compresión de 16×16×4 en las dimensiones espacial y temporal. Esta compresión permite generar vídeo a 720P y 24 fps con un coste computacional reducido, lo que habilita su ejecución en una única GPU de consumo como la RTX 4090. A diferencia de las variantes A14B de la familia Wan2.2, que introducen una arquitectura Mixture-of-Experts (MoE) separando el proceso de denoising por pasos temporales en expertos especializados, el TI2V-5B es un modelo denso de 5B parámetros.

Según la model card, Wan2.2 se entrenó con un volumen de datos significativamente mayor que Wan2.1: un 65,6 % más de imágenes y un 83,2 % más de vídeos. El entrenamiento incorpora datos estéticos curados con etiquetado detallado de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a 720P y 24 fps.
- Generación de vídeo a partir de imagen (image-to-video) a 720P y 24 fps, en un único checkpoint que unifica ambas tareas (TI2V).
- Generación de movimiento complejo, con mejora de generalización en movimiento, semántica y estética respecto a Wan2.1.
- Control de estética cinematográfica mediante etiquetado de iluminación, composición, contraste y tono de color.
- Soporte multilingüe en las indicaciones textuales para inglés, chino, indonesio y javanés.
- Integración con ComfyUI y Diffusers para flujos de trabajo de generación.
- Inferencia multi-GPU disponible en el código oficial (aunque el modelo está optimizado para GPU única).

No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni visión más allá del uso de imagen como condición de entrada para I2V.

## Casos de uso

- Generación de vídeo publicitario a 720P: el modelo permite crear clips de 24 fps a partir de un prompt de texto o una imagen de referencia, adecuado para prototipado rápido de anuncios y contenido para redes sociales sin necesidad de un render farm.
- Previsualización de storyboards cinematográficos: a partir de una imagen clave (I2V) se puede animar un frame de concepto para validar movimiento, iluminación y composición antes de la producción final, gracias al control estético del modelo.
- Creación de contenido para redes sociales: generación de clips cortos en 720P@24fps en una RTX 4090, lo que permite iterar localmente sin depender de servicios en la nube y con licencia Apache 2.0 para uso comercial.
- Prototipado en investigación académica: el modelo sirve como baseline abierto de difusión de vídeo de 5B parámetros para experimentos de compresión VAE, control estético y generación condicionada, con integración en Diffusers.
- Animación de imágenes fijas para e-commerce: convertir fotos de producto en vídeos breves de presentación (I2V) con movimiento controlado, útil para catálogos y fichas de producto.
- Generación de material para videojuegos y previsualización de assets: creación de clips de referencia para texturas animadas, cinemáticas preliminares o moodboards animados a partir de descripciones textuales.
- Educación y divulgación: generación de visualizaciones animadas de conceptos a partir de texto o diagramas, con soporte multilingüe para prompts en inglés, chino, indonesio y javanés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona de forma cualitativa que Wan2.2 alcanza "TOP performance among all open-sourced and closed-sourced models" en generalización de movimiento, semántica y estética, y que el TI2V-5B es "one of the fastest 720P@24fps models currently available", pero no se proporcionan cifras concretas (FVD, VBench, CLIP score, etc.) en la información suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. El repo de pesos ocupa 34,2 GB en safetensors, lo que orienta sobre el orden de magnitud del checkpoint completo.
- GPU recomendadas: el modelo está diseñado para ejecutarse en una única GPU de consumo como la RTX 4090, según la model card.
- ¿Cabe en GPU de consumo? Sí, según el autor, en tarjetas del nivel de la RTX 4090.
- Opciones de despliegue: código oficial de Wan2.2 (GitHub Wan-Video/Wan2.2), integración con ComfyUI y con Diffusers. No se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a difusión de vídeo).
- Latencia y throughput estimados: no disponibles. La model card solo indica que es "uno de los modelos 720P@24fps más rápidos disponibles" sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Resolución / fps | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wan2.2-TI2V-5B | 5B | Difusión densa + VAE 16×16×4 | 720P / 24 fps | no disponible | Apache 2.0 | HuggingFace, ModelScope, ComfyUI, Diffusers |
| Wan2.2-T2V-A14B | 14B (MoE) | Difusión MoE | 480P y 720P | no disponible | Apache 2.0 | HuggingFace, ModelScope |
| Wan2.2-I2V-A14B | 14B (MoE) | Difusión MoE | 480P y 720P | no disponible | Apache 2.0 | HuggingFace, ModelScope |
| Wan2.1 | no disponible | Difusión | no disponible | no disponible | Apache 2.0 | HuggingFace, GitHub |

La comparativa se limita a la propia familia Wan porque la información proporcionada no incluye datos de otros modelos de vídeo open source (como HunyuanVideo, Mochi o CogVideoX) que permitan una comparación rigurosa con cifras.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado con datos web a gran escala, es previsible que herede sesgos de representación, pero no se aportan análisis específicos.
- Riesgo de alucinación: no cuantificado; en modelos de difusión de vídeo se manifiesta como artefactos, incoherencias temporales o movimiento no fiel al prompt, pero no hay métricas publicadas en la información disponible.
- Limitaciones de contexto o idioma: el soporte multilingüe declarado se limita a en, zh, id y jv; no se garantiza calidad en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero esta réplica concreta (Rombakr5/Wan2.2-TI2V-5B) es una redistribución de terceros con 0 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio oficial Wan-AI/Wan2.2-TI2V-5B antes de usarla en producción.
- Caveat de producción: la información sobre cuantización, latencia y consumo de VRAM es escasa; se recomienda validar el rendimiento real en el hardware objetivo y consultar el repositorio oficial para detalles actualizados.
- El modelo no es un LLM: no soporta tool calling, agentes ni razonamiento textual; su uso está acotado a generación de vídeo condicionada por texto e imagen.

## Enlaces

- HuggingFace (réplica): https://huggingface.co/Rombakr5/Wan2.2-TI2V-5B
- HuggingFace oficial del modelo: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Organización Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- GitHub oficial: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Sitio web del proyecto: https://wan.video
- Blog: https://wan.video/welcome
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Discord: https://discord.gg/AKNgpMK4Yj
- GitHub de Wan2.1: https://github.com/Wan-Video/Wan2.1
