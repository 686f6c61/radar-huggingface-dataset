# openbmb/MiniCPM-V-4.6

## Resumen

MiniCPM-V 4.6 es un modelo de lenguaje multimodal (MLLM) desarrollado por OpenBMB, laboratorio conjunto de la Universidad de Tsinghua y ModelBest Inc. Está diseñado para ofrecer comprensión de imagen y vídeo de alta eficiencia en dispositivos móviles, siendo el modelo más orientado a despliegue en el borde de la familia MiniCPM-V. Con solo 1.300 millones de parámetros, combina un codificador visual SigLIP2-400M con un modelo de lenguaje Qwen3.5-0.8B, logrando un equilibrio notable entre rendimiento y coste computacional.

El modelo introduce una compresión mixta de tokens visuales de 4x y 16x, lo que permite ajustar dinámicamente la relación entre precisión y velocidad. Gracias a técnicas derivadas de LLaVA-UHD v4, reduce los FLOPs de codificación visual en más del 50% y alcanza un throughput de tokens aproximadamente 1,5 veces superior al de Qwen3.5-0.8B. Está disponible bajo licencia Apache 2.0 y soporta despliegue en iOS, Android y HarmonyOS, además de frameworks de inferencia como vLLM, SGLang, llama.cpp y Ollama.

Su relevancia actual radica en que democratiza la visión por computadora en dispositivos de bajo consumo, permitiendo aplicaciones de tiempo real sin depender de infraestructura en la nube. Con una puntuación de 13 en el Artificial Analysis Intelligence Index, supera a modelos más grandes como Ministral 3 3B (11) y a Qwen3.5-0.8B (10), consolidándose como una opción competitiva para tareas multimodales en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-400M (vision encoder) + Qwen3.5-0.8B (LLM) |
| Parametros totales | 1.300.428.016 (1,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, BNB, AWQ, GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, AWQ, GPTQ |

## Arquitectura y entrenamiento

MiniCPM-V 4.6 es un modelo multimodal de arquitectura híbrida: un codificador visual SigLIP2-400M extrae características de las imágenes, que luego se proyectan y comprimen mediante un mecanismo de compresión de tokens visuales con tasas mixtas de 4x y 16x. El backbone de lenguaje es Qwen3.5-0.8B, que combina atención lineal y atención completa (hybrid linear/full-attention), optimizando el coste computacional sin sacrificar la capacidad de razonamiento. Esta configuración permite procesar imágenes individuales, múltiples imágenes y vídeo de forma eficiente.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La innovación principal reside en la reducción de FLOPs de codificación visual (más del 50% gracias a LLaVA-UHD v4) y en la compresión adaptativa de tokens, que permite intercambiar precisión por velocidad según las necesidades de la aplicación. El modelo está diseñado para ser desplegado en el borde, con todo el código de adaptación para plataformas móviles abierto al público.

## Capacidades

- Comprensión de imágenes individuales, múltiples imágenes y vídeo, con salida de texto.
- Razonamiento multimodal de alto nivel para su tamaño, superando a Qwen3.5-0.8B en la mayoría de tareas de visión-lenguaje.
- Compresión de tokens visuales configurable (4x o 16x) para ajustar el equilibrio entre precisión y velocidad.
- Eficiencia computacional destacada: ~1,5x de throughput de tokens en comparación con Qwen3.5-0.8B.
- Despliegue en dispositivos móviles (iOS, Android, HarmonyOS) con código de adaptación abierto.
- Compatibilidad con frameworks de inferencia estándar: vLLM, SGLang, llama.cpp, Ollama.
- Soporte de fine-tuning mediante SWIFT y LLaMA-Factory en GPUs de consumo.
- Capacidad conversacional multimodal, adecuada para asistentes interactivos.

## Casos de uso

- Asistente visual en tiempo real para móviles: el modelo puede analizar el entorno a través de la cámara y responder preguntas sobre objetos, texto o escenas, gracias a su bajo consumo y soporte nativo en iOS, Android y HarmonyOS.
- Accesibilidad para personas con discapacidad visual: descripción de imágenes, lectura de carteles o identificación de obstáculos mediante capturas de vídeo, con latencia reducida al ejecutarse localmente en el dispositivo.
- Moderación de contenido visual en plataformas sociales: clasificación de imágenes y vídeos para detectar contenido inapropiado, aprovechando su capacidad de procesamiento multi-imagen y su licencia Apache 2.0 para integración comercial.
- Extracción de información de documentos escaneados: OCR y comprensión de facturas, formularios o tarjetas de visita, combinando la visión del modelo con su capacidad de razonamiento textual.
- Análisis de vídeo en tiempo real para vigilancia o control de calidad: detección de anomalías en secuencias de vídeo, con la posibilidad de ajustar la compresión de tokens para priorizar velocidad o precisión según el caso.
- Asistente educativo interactivo: el modelo puede explicar diagramas, gráficos o problemas matemáticos a partir de imágenes, funcionando como tutor personal en dispositivos de bajo coste.
- Automatización de tareas de diseño y documentación: generación de descripciones alternativas para imágenes en sitios web, o creación de metadatos automáticos para bibliotecas de medios.

## Benchmarks y rendimiento

No se han publicado resultados numéricos detallados de benchmarks en la información disponible. La model card menciona que MiniCPM-V 4.6 obtiene una puntuación de 13 en el Artificial Analysis Intelligence Index, superando a Qwen3.5-0.8B (10), Qwen3.5-0.8B-Thinking (11) y Ministral 3 3B (11). Además, alcanza un rendimiento comparable al de Qwen3.5 2B en tareas como OpenCompass, RefCOCO, HallusionBench, MUIRBench y OCRBench, aunque no se especifican las cifras exactas. Se recomienda consultar las figuras de la model card para una comparación visual detallada.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, aproximadamente 1-2 GB; con 8 bits, 2-3 GB; con 16 bits, 3-4 GB (estimación basada en el tamaño de 1,3B parámetros).
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También compatible con Apple Silicon y hardware móvil.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama baja y en dispositivos móviles (iOS, Android, HarmonyOS).
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, y despliegue nativo en móviles con código abierto.
- Latencia y throughput: no se proporcionan valores exactos, pero se reporta un throughput de tokens ~1,5x superior al de Qwen3.5-0.8B y una reducción de FLOPs de codificación visual superior al 50%.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (AAII) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 | 1,3B | no disponible | 13 | Apache 2.0 | Hugging Face, móvil |
| Qwen3.5-0.8B | 0,8B | no disponible | 10 | no disponible | no disponible |
| Ministral 3 3B | 3B | no disponible | 11 | no disponible | no disponible |
| Gemma4-E2B-it | 2B | no disponible | no disponible | no disponible | no disponible |

Según la información disponible, MiniCPM-V 4.6 supera a Qwen3.5-0.8B y Ministral 3 3B en el índice de inteligencia de Artificial Analysis, y se acerca al rendimiento de Qwen3.5 2B en tareas multimodales específicas, a pesar de tener menos parámetros. No se dispone de datos completos de los modelos comparados para una evaluación exhaustiva.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos del modelo; como todo LLM, puede generar contenido inexacto o inventado, especialmente en contextos ambiguos.
- La longitud de contexto no está documentada, lo que limita la planificación de aplicaciones que requieran ventanas de contexto largas.
- Los idiomas soportados no están especificados; aunque probablemente incluye inglés y chino, no se confirma oficialmente.
- Al ser un modelo de 1,3B, puede tener limitaciones en razonamiento complejo o tareas que requieran conocimiento enciclopédico profundo, en comparación con modelos mucho más grandes.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos de las dependencias (como SigLIP2 y Qwen3.5) para asegurar el cumplimiento.
- Para producción, se recomienda validar el rendimiento en el hardware objetivo, ya que la eficiencia puede variar según la plataforma y la cuantización elegida.

## Enlaces

- [Hugging Face - MiniCPM-V-4.6](https://huggingface.co/openbmb/MiniCPM-V-4.6)
- [GitHub - OpenBMB/MiniCPM-V](https://github.com/OpenBMB/MiniCPM-V)
- [Demo interactiva](https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Demo)
- [Artículo de Artificial Analysis](https://artificialanalysis.ai/articles/openbmb-launches-minicpm-v-4-6-1-3b-instruct)
- [Receta vLLM](https://recipes.vllm.ai/openbmb/MiniCPM-V-4.6)
- [Colección MiniCPM-V 4.6 en Hugging Face](https://huggingface.co/collections/openbmb/minicpm-v-46)
- Papers relacionados: [arxiv:2604.27393](https://arxiv.org/abs/2604.27393), [arxiv:2509.18154](https://arxiv.org/abs/2509.18154), [arxiv:2408.01800](https://arxiv.org/abs/2408.01800), [arxiv:2605.08985](https://arxiv.org/abs/2605.08985)
