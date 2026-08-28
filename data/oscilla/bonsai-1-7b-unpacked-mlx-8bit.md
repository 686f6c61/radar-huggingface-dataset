# Oscilla/Bonsai-1.7B-unpacked-mlx-8Bit

## Resumen

Bonsai-1.7B es una familia de modelos de lenguaje de pequeño tamaño desarrollada por PrismML, diseñada específicamente para ejecutarse en dispositivos con recursos muy limitados como gafas inteligentes, wearables y tareas de fondo en sistemas embebidos. La característica más destacada es el uso de pesos de 1 bit, lo que reduce drásticamente el consumo de memoria y energía manteniendo una capacidad de razonamiento aceptable para su tamaño. El modelo base tiene 1.700 millones de parámetros y admite una ventana de contexto de hasta 32.768 tokens.

Este repositorio concreto, `Oscilla/Bonsai-1.7B-unpacked-mlx-8Bit`, es una conversión al formato MLX (Apple Silicon) con cuantización de 8 bits realizada por el usuario Oscilla a partir del checkpoint "unpacked" en FP16 de PrismML. La versión "unpacked" existe porque los kernels de 1 bit aún no están integrados en el ecosistema estándar de HuggingFace, por lo que se publican pesos en FP16 para facilitar la compatibilidad con frameworks convencionales. La conversión a MLX permite ejecutar el modelo en Macs con Apple Silicon mediante la librería `mlx-lm`.

La relevancia de este modelo radica en su extremada eficiencia: con un peso original de solo 0,25 GB en formato 1 bit, puede desplegarse en hardware de muy bajo consumo, abriendo la puerta a aplicaciones de IA generativa en dispositivos que tradicionalmente no podían alojar un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos de 1 bit (binarios/ternarios) |
| Parametros totales | 1.700 millones (según documentación oficial); el checkpoint safetensors de este repo reporta 483.846.976 parámetros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 1 bit (original), 8 bits (esta conversión MLX), FP16 (checkpoint unpacked) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo Bonsai-1.7B emplea una arquitectura Transformer estándar, pero con una innovación clave: todos los pesos de las capas lineales se cuantizan a 1 bit, es decir, cada peso se representa con un único bit (valores binarios o ternarios). Esto reduce el tamaño del modelo en un factor de 32 respecto a FP32 y de 16 respecto a FP16, manteniendo una precisión razonable gracias a técnicas de cuantización agresiva y posiblemente a un entrenamiento específico para compensar la pérdida de precisión.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El modelo base se publica como "unpacked" en FP16 para permitir su uso con herramientas que no soportan pesos de 1 bit nativamente. La conversión a MLX con cuantización de 8 bits realizada por Oscilla es una capa adicional de optimización para Apple Silicon.

## Capacidades

- Generación de texto y completado de lenguaje natural.
- Razonamiento básico y respuesta a preguntas (capacidades propias de un LLM de 1,7B).
- Soporte de chat mediante plantilla de conversación (el tokenizador incluye `chat_template`).
- Capacidades multilingües no especificadas, aunque al estar basado en Qwen3 (según las etiquetas) es probable que soporte varios idiomas.
- No se ha documentado soporte explícito para tool calling, agentes o visión.

## Casos de uso

- Asistentes de voz en gafas inteligentes: el modelo puede procesar comandos de voz y generar respuestas contextuales con una latencia mínima gracias a su tamaño reducido (0,25 GB en 1 bit).
- Wearables de salud y fitness: integración en relojes o pulseras para proporcionar recordatorios, análisis de conversaciones o resúmenes de actividad en tiempo real.
- Tareas de fondo en dispositivos móviles: clasificación de notificaciones, generación de respuestas automáticas o resumen de mensajes sin depender de la nube.
- Dispositivos IoT con microcontroladores: control por voz de electrodomésticos o sistemas de domótica con requisitos de memoria inferiores a 1 GB.
- Edge computing en entornos industriales: procesamiento de lenguaje para mantenimiento predictivo o documentación técnica en equipos con GPUs de baja potencia.
- Prototipado rápido de aplicaciones de IA en Macs: gracias a la conversión MLX, los desarrolladores pueden probar el modelo localmente con `mlx-lm` en equipos Apple Silicon sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la versión MLX de 8 bits ocupa 1,8 GB en disco, por lo que se estima un consumo de VRAM de aproximadamente 2 GB durante la inferencia. La versión original de 1 bit requiere solo 0,25 GB de almacenamiento y menos de 1 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar la versión de 8 bits. Para la versión de 1 bit, basta con hardware integrado o microcontroladores con suficiente memoria.
- Compatibilidad con Apple Silicon: el formato MLX está optimizado para Macs con chips M1, M2, M3 y M4. La versión de 8 bits se ejecuta sin problemas en Macs con 8 GB de RAM unificada.
- Opciones de despliegue: `mlx-lm` para Apple Silicon, `llama.cpp` (con soporte experimental para 1 bit), HuggingFace Transformers con el checkpoint unpacked, y vLLM o TGI para servidores con GPUs convencionales (usando la versión FP16).
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño reducido, se espera una generación de decenas de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de tamaño similar (por ejemplo, TinyLlama-1.1B, Qwen2.5-1.5B o Gemma-2-2B). La principal diferencia es la cuantización extrema de 1 bit, que lo hace significativamente más ligero que cualquier alternativa comparable, aunque probablemente con menor calidad de generación.

## Limitaciones y advertencias

- La cuantización de 1 bit puede degradar la calidad del lenguaje, la coherencia y la precisión en tareas complejas en comparación con modelos de igual tamaño en FP16.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado con datos no especificados, es susceptible de presentar sesgos y alucinaciones similares a otros LLMs.
- La ventana de contexto de 32.768 tokens es amplia, pero el modelo puede perder coherencia en conversaciones muy largas debido a su capacidad limitada.
- El checkpoint "unpacked" en FP16 ocupa aproximadamente 3,4 GB, lo que reduce la ventaja de tamaño si se usa sin cuantización adicional.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la documentación de PrismML para posibles patentes o limitaciones adicionales.
- Los kernels de 1 bit aún no están integrados en el ecosistema estándar, por lo que el uso eficiente del modelo requiere herramientas específicas o la versión unpacked.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/Oscilla/Bonsai-1.7B-unpacked-mlx-8Bit
- Modelo base unpacked: https://huggingface.co/prism-ml/Bonsai-1.7B-unpacked
- Colección de modelos Bonsai: https://huggingface.co/collections/prism-ml/bonsai
- Documentación oficial de Bonsai 1.7B: https://docs.prismml.com/models/bonsai-1-7b
- Anuncio de PrismML sobre modelos 1-bit: https://prismml.com/news/bonsai-8b
- Página de requisitos de hardware (llmrun.dev): https://llmrun.dev/model/prism-ml-bonsai-1-7b-unpacked
