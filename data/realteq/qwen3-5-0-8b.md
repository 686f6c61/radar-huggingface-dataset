# RealTeq/Qwen3.5-0.8B

## Resumen

RealTeq/Qwen3.5-0.8B es una variante de la familia Qwen3.5, desarrollada a partir del modelo base Qwen/Qwen3.5-0.8B-Base de Alibaba Cloud. Se trata de un modelo causal de lenguaje con codificador de visión, lo que lo convierte en un sistema multimodal capaz de procesar tanto texto como imágenes. Con 873 millones de parámetros (0,8B), es el miembro más pequeño de la serie Qwen3.5, diseñado para despliegue en dispositivos de borde, prototipado rápido y fine-tuning específico de tareas.

El modelo emplea una arquitectura híbrida que combina Gated Delta Networks con atención gated y Mixture-of-Experts dispersa, lo que permite alta eficiencia en inferencia y bajo coste de latencia. Su longitud de contexto nativa de 262.144 tokens lo sitúa entre los modelos de ventana más amplia de su categoría, y su licencia Apache 2.0 facilita su uso comercial sin restricciones significativas. La relevancia actual de este modelo radica en su capacidad para ofrecer razonamiento multimodal, generación de código y soporte de agentes en un formato lo suficientemente compacto para ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; Gated DeltaNet + Gated Attention (híbrido) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE puro; la arquitectura incluye sparse MoE según la documentación, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | no disponible (se esperan versiones GGUF, AWQ, GPTQ, pero no se listan en la información) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 declara soporte para 201 idiomas y dialectos, pero la ficha de HF no lo especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.5-0.8B se basa en un modelo causal de lenguaje con un codificador de visión integrado, resultado de un entrenamiento de fusión temprana sobre tokens multimodales. El bloque principal combina dos tipos de capas: Gated DeltaNet, que implementa atención lineal con 16 cabezas para V y 16 para QK (dimensión de cabeza 128), y Gated Attention, con 8 cabezas para Q y 2 para KV (dimensión de cabeza 256). La disposición de capas es de 6 grupos, cada uno con 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque de Gated Attention seguido de FFN, totalizando 24 capas.

El modelo incorpora Multi-Token Prediction (MTP) entrenado con multi-steps, lo que mejora la eficiencia de decodificación. El embedding de tokens tiene un tamaño de 248.320 (padded) y la salida LM está atada al embedding. El entrenamiento incluye una fase de pre-entrenamiento y post-entrenamiento con refuerzo a escala, donde se utilizaron entornos de millones de agentes para generalizar el comportamiento. Los datos de entrenamiento específicos (número de tokens, composición del dataset) no se detallan en la información disponible, pero la documentación de Qwen3.5 menciona una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto, respondiendo con texto coherente y contextualizado.
- Razonamiento y comprensión de lenguaje natural: obtiene puntuaciones moderadas en benchmarks de conocimiento general (MMLU-Pro, MMLU-Redux, C-Eval).
- Generación de código: soporta tareas de programación, aunque su precisión en código es limitada según evaluaciones independientes; se recomienda usar modelos mayores para tareas complejas.
- Tool calling / function calling: la familia Qwen3.5 incluye soporte para invocación de herramientas, aunque no se confirma explícitamente para esta variante en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: la arquitectura híbrida y el entrenamiento con RL a escala permiten razonamiento encadenado, aunque su pequeño tamaño limita la complejidad de las tareas.
- Multilingüismo: el modelo base declara soporte para 201 idiomas y dialectos, con comprensión cultural y regional; no se especifica si el fine-tune de RealTeq mantiene esta cobertura.
- Modo pensamiento (thinking mode): no se menciona en la información disponible; los benchmarks distinguen entre modo no pensante y modo pensante, pero no se detallan los resultados de este último.

## Casos de uso

- Prototipado de asistentes conversacionales multimodales: por su tamaño reducido, permite iterar rápidamente en entornos de desarrollo, integrando entrada de imágenes para responder preguntas sobre capturas de pantalla, diagramas o fotografías.
- Despliegue en dispositivos de borde: al requerir menos de 2 GB de VRAM en FP16, puede ejecutarse en Jetson, Raspberry Pi con acelerador o portátiles con GPU de consumo, ideal para aplicaciones de visión en tiempo real.
- Fine-tuning específico de tareas: al ser un modelo base, se puede ajustar con datasets propios para dominios concretos como análisis de documentos, clasificación de imágenes con texto o extracción de información.
- Modelo borrador para decodificación especulativa: su velocidad de inferencia lo hace adecuado como draft model junto a checkpoints más grandes de Qwen3.5, acelerando la generación de estos últimos.
- Educación y demostraciones: sirve para enseñar arquitecturas híbridas y multimodalidad en entornos académicos, dado su bajo coste de ejecución y licencia permisiva.
- Automatización de atención al cliente con contexto largo: su ventana de 262K tokens permite mantener conversaciones multi-turno extensas, aunque su capacidad de razonamiento puede ser insuficiente para consultas muy complejas.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación corresponden al modelo base Qwen3.5-0.8B, según la model card de Qwen. Dado que RealTeq/Qwen3.5-0.8B es un fine-tune, los valores pueden variar; no se han publicado benchmarks específicos para esta variante.

| Benchmark (modo no pensante) | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se dispone de resultados para HumanEval, GSM8K u otros benchmarks en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: en FP16, el modelo ocupa aproximadamente 1,75 GB (873M parámetros × 2 bytes). Con cuantización INT8 o INT4, se reduce a ~0,9 GB o ~0,45 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, Jetson Orin Nano, o incluso CPU con suficiente RAM para cuantización INT4.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama baja y media, así como en Apple Silicon con Metal.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers, llama.cpp (mediante GGUF) y Ollama (comando `ollama run qwen3.5:0.8b`).
- Latencia y throughput: no se proporcionan datos específicos, pero por su tamaño se espera una generación de decenas de tokens por segundo en GPU consumer, y menor en CPU.

## Comparativa con modelos similares

La comparativa se realiza con otros modelos pequeños de la misma familia, según los datos disponibles.

| Modelo | Parámetros | Contexto | MMLU-Pro | MMLU-Redux | C-Eval | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0,8B | 262K | 29,7 | 48,5 | 46,4 | Apache-2.0 |
| Qwen3-1.7B | 1,7B | 32K (según versión) | 40,2 | 64,4 | 61,0 | Apache-2.0 |
| Qwen3-4B-2507 | 4B | 262K | 69,6 | 84,2 | 80,2 | Apache-2.0 |
| Qwen3.5-2B | 2B | 262K | 55,3 | 69,2 | 65,2 | Apache-2.0 |

El modelo de 0,8B es el más ligero y muestra el rendimiento más bajo, como es esperable. Su ventaja principal es el coste computacional y la posibilidad de ejecutarse en dispositivos muy limitados.

## Limitaciones y advertencias

- Rendimiento inferior a modelos más grandes: en tareas de razonamiento complejo, matemáticas y código, sus resultados son significativamente peores que los de Qwen3-4B o Qwen3.5-2B.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Sesgos potenciales: no se han publicado evaluaciones de sesgo para esta variante; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Limitaciones de idioma: aunque el modelo base declara soporte para 201 idiomas, la cobertura real en lenguas minoritarias puede ser irregular y no se garantiza para el fine-tune de RealTeq.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin obligación de compartir derivados, pero se debe mantener el aviso de copyright.
- Cuidado con la entrada de imágenes: al ser un modelo multimodal, la calidad de la comprensión visual depende del codificador de visión; no se especifican sus límites de resolución o tipos de imagen.
- Para producción con alta demanda, se recomienda evaluar el fine-tune específico, ya que los benchmarks del modelo base no son directamente aplicables.

## Enlaces

- HuggingFace: https://huggingface.co/RealTeq/Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Artículo de Codersera: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/qwen3-5-0-8b/
- Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-0-8b/
