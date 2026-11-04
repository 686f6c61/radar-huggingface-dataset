# keras/smolvlm2_256m_video_instruct

## Resumen

SmolVLM2 es una familia de modelos multimodales ligeros publicada por Hugging Face, con variantes de 256M, 500M y 2.2B parámetros. Cada modelo combina un codificador de imagen SigLIP con un decodificador de texto SmolLM2 siguiendo la arquitectura Idefics3. Esta ficha corresponde al preset `smolvlm2_256m_video_instruct`, la variante más pequeña de la familia, con 256,48M de parámetros, empaquetada y distribuida por el equipo de Keras a través de KerasHub para su uso con el backend de Keras (JAX, TensorFlow o PyTorch).

El modelo acepta como entrada texto intercalado, una o varias imágenes y fotogramas de vídeo, y genera texto. Está ajustado por instrucciones para comprensión de imagen y vídeo, lo que lo orienta a tareas de subtitulado, respuesta visual a preguntas, comprensión de documentos y gráficos, y detección de momentos destacados en vídeo. Su interés actual reside en que ofrece capacidades multimodales en un rango de tamaño que cabe en hardware muy limitado, lo que facilita el despliegue en dispositivos de borde y entornos con pocos recursos.

La relevancia de este preset concreto es doble: por un lado, demuestra la portabilidad del modelo original de Hugging Face al ecosistema KerasHub, con código de modelo publicado bajo Apache 2.0; por otro, al ser la variante más pequeña, sirve como punto de entrada de bajo coste para experimentar con pipelines multimodales texto-imagen-vídeo sin infraestructura dedicada. El modelo no genera imágenes ni vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Idefics3 (codificador de visión SigLIP-B/16 + decodificador de texto SmolLM2) |
| Parámetros totales | 256,48M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos); código Keras bajo Apache 2.0 |
| Formato de pesos | no disponible (distribuido vía preset de KerasHub; el repositorio ocupa 1,0 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Idefics3: un codificador visual SigLIP-B/16 que proyecta las imágenes y los fotogramas de vídeo a un espacio de embeddings que el decodificador de texto SmolLM2 consume junto con los tokens de texto. La variante de 256M emplea el codificador SigLIP-B/16 y un decodificador SmolLM2 de menor tamaño, a diferencia del modelo de 2.2B, que usa SigLIP-SO400M y SmolLM2-1.7B. El modelo está ajustado por instrucciones para tareas de imagen y vídeo, e ingiere entradas intercaladas de texto, imágenes múltiples y fotogramas de vídeo.

No se dispone en la información proporcionada del número de tokens de entrenamiento, de la composición del dataset ni de si se aplicaron técnicas de RLHF o DPO en el ajuste. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card remite al paper de SmolVLM2 (arXiv:2504.05299) y a la model card del modelo original de Hugging Face para benchmarks, fuentes de datos y casos de uso previstos, que no se incluyen en esta ficha.

## Capacidades

- Generación de texto condicionada por imagen: subtitulado, respuesta visual a preguntas y descripción de contenido visual.
- Comprensión de vídeo: procesa fotogramas de vídeo como entrada, lo que permite tareas de resumen y detección de momentos destacados.
- Entrada multi-imagen: acepta varias imágenes intercaladas con texto en una misma petición.
- Comprensión de documentos y gráficos: lectura de contenido visual estructurado y extracción de información.
- Ajuste por instrucciones: responde a indicaciones en formato conversacional (etiquetas tipo `<|im_start|>User:`).
- Generación solo de texto: no produce imágenes ni vídeo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento explícito (thinking mode), audio o visión especializada: no disponible.

## Casos de uso

- Subtitulado automático de imágenes en catálogos de producto: el modelo genera descripciones textuales a partir de una imagen de entrada, adecuado para etiquetar grandes volúmenes de fichas en hardware modesto gracias a sus 256M de parámetros.
- Respuesta visual a preguntas en asistentes de accesibilidad: un usuario sube una imagen y formula una pregunta en lenguaje natural; el modelo responde en texto, lo que permite integrarlo en aplicaciones móviles o de escritorio con recursos limitados.
- Resumen de vídeo y detección de momentos destacados: procesando secuencias de fotogramas, el modelo puede describir el contenido de un clip o señalar fragmentos relevantes, útil en herramientas de edición y archivado de vídeo.
- Comprensión de documentos y gráficos: extracción de información de capturas de pantalla, tablas e infografías para tareas de digitalización y enriquecimiento de datos, con la ventaja de que el modelo cabe en entornos sin GPU dedicada.
- Prototipado rápido de pipelines multimodales: al estar disponible como preset de KerasHub, permite escribir una vez el código y ejecutarlo sobre JAX, TensorFlow o PyTorch, lo que acelera la experimentación y la comparación de backends.
- Despliegue en dispositivos de borde y entornos embebidos: su tamaño reducido (repositorio de 1,0 GB) facilita la inferencia en portátiles, mini-PC y dispositivos con memoria limitada donde modelos multimodales mayores no caben.
- Filtrado y moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios para detectar contenido no deseado antes de su publicación, aprovechando la latencia baja esperable en un modelo de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 256,48M de parámetros, los pesos en precisión completa (fp32) ocuparían aproximadamente 1,0 GB, y en fp16/bf16 alrededor de 0,5 GB, a lo que habría que sumar la memoria del codificador visual y de las activaciones.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPUs de consumo, pero no se detallan modelos concretos.
- ¿Cabe en GPU de consumo? Sí, por su tamaño, aunque no se especifican modelos ni configuraciones validadas.
- Opciones de despliegue: KerasHub con backends JAX, TensorFlow o PyTorch (instalación vía `pip install -U keras-hub keras`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smolvlm2_256m_video_instruct (este modelo) | 256,48M | no disponible | Apache 2.0 | KerasHub (preset) |
| smolvlm2_500m_video_instruct | 507,48M | no disponible | Apache 2.0 | KerasHub (preset) |
| smolvlm2_2.2b_instruct | 2,25B | no disponible | Apache 2.0 | KerasHub (preset) |

Las tres variantes comparten familia, licencia y arquitectura base (Idefics3), diferenciándose en tamaño y en el codificador visual empleado: las variantes de 256M y 500M usan SigLIP-B/16, mientras que la de 2.2B usa SigLIP-SO400M con decodificador SmolLM2-1.7B. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- El editor declara que el modelo no está destinado a decisiones de alto impacto que afecten al bienestar o al sustento de una persona.
- No genera imágenes ni vídeo; su salida es exclusivamente texto.
- Riesgo de alucinación: no se documenta en la información disponible, pero es un riesgo inherente a los modelos generativos de este tipo; conviene validar las salidas en producción.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Licencia: los pesos se publican bajo Apache 2.0 y el código Keras bajo Apache 2.0, lo que permite uso comercial; conviene verificar los términos del modelo original de Hugging Face del que deriva este preset.
- Al ser un modelo de 256M de parámetros, su capacidad de razonamiento y su precisión en tareas complejas serán previsiblemente inferiores a las de variantes mayores de la misma familia; no se han publicado métricas que lo cuantifiquen.
- La model card indica que los checkpoints se estaban subiendo en el momento de su publicación, por lo que la disponibilidad de algunos presets puede haber sido parcial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/keras/smolvlm2_256m_video_instruct
- Model card del modelo original: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Paper de SmolVLM2: https://arxiv.org/abs/2504.05299
- Guía de inicio de KerasHub: https://keras.io/guides/keras_hub/getting_started/
- Guía de publicación de modelos de KerasHub: https://keras.io/guides/keras_hub/upload/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del código Keras: https://github.com/keras-team/keras-hub/blob/master/LICENSE
- Keras: https://keras.io/
- Codificador SigLIP: https://huggingface.co/collections/google/siglip-659d5e62f0ae1a57ae0e83ba
- Decodificador SmolLM2: https://huggingface.co/collections/HuggingFaceTB/smollm2-6723884218bcda64b34d7db9
