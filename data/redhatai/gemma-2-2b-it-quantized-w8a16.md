# RedHatAI/gemma-2-2b-it-quantized.w8a16

## Resumen

El modelo RedHatAI/gemma-2-2b-it-quantized.w8a16 es una versión cuantizada a INT8 del modelo Gemma 2 2B instructivo de Google, publicada por Neural Magic bajo el perfil de Red Hat AI. Su propósito principal es reducir los requisitos de memoria y disco de la inferencia sin degradar de forma apreciable el rendimiento, manteniendo una calidad equivalente a la del modelo original. La cuantización se ha aplicado únicamente a los pesos de las capas lineales de los bloques transformer, pasando de 16 a 8 bits por parámetro, lo que reduce el tamaño del modelo aproximadamente a la mitad.

Esta variante está pensada para entornos de producción que necesitan un asistente conversacional ligero y eficiente, especialmente con el backend vLLM, que soporta de forma nativa la carga de este formato. El modelo hereda la arquitectura Gemma 2, con 2.6 mil millones de parámetros activos y una ventana de contexto de 8192 tokens, y se distribuye con licencia Gemma, lo que permite uso comercial y de investigación.

La relevancia actual de esta ficha radica en que ofrece una alternativa de bajo coste a modelos de mayor tamaño para tareas de generación de texto y chat, manteniendo una precisión casi idéntica al modelo sin cuantizar. El resultado de la cuantización es un modelo de unos 3.2 GB de peso, que puede ejecutarse en GPUs de consumo con 8 GB de VRAM o menos, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only, 18 capas, atención con deslizamiento local) |
| Parametros totales | 3.204.165.888 (según safetensors; el modelo base declara 2.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | INT8 (W8A16, pesos cuantizados, activaciones en fp16) |
| Idiomas soportados | Inglés (el modelo original es multilingüe, pero el README indica uso previsto solo en inglés) |
| Licencia | Gemma (términos de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del modelo base Gemma 2 2B instructivo de Google, que sigue la arquitectura transformer con atención local deslizante y atención global alternada. La versión cuantizada se obtiene mediante el algoritmo GPTQ (post-training quantization), aplicado con la librería llm-compressor. Se cuantizan los pesos de todas las capas lineales de los bloques transformer a INT8, con cuantización simétrica por canal (una escala lineal por dimensión de salida). Se excluyen el head de salida (lm_head) y los embeddings.

El proceso de cuantización utiliza un dataset de calibración de 256 secuencias procedentes del dataset `neuralmagic/LLM_compression_calibration`, con una longitud máxima de secuencia de 8192 tokens y un factor de amortiguación del 1% (damping factor). El resultado es un modelo que mantiene una precisión media del 100,1% respecto al modelo original en los benchmarks OpenLLM, con una pérdida mínima en tareas como MMLU (99,8% de recuperación) y GSM-8K (100,2% de recuperación). No se aplicó ningún entrenamiento adicional ni fine-tuning; es una transformación puramente de compresión.

## Capacidades

- Generación de texto y chat conversacional con formato de asistente (estilo chat).
- Razonamiento de sentido común y conocimiento general, medido en tareas como ARC Challenge y Hellaswag.
- Resolución de problemas matemáticos básicos (GSM-8K).
- Comprensión lectora y respuesta a preguntas (MMLU, TruthfulQA).
- Capacidades multilingües limitadas: aunque el modelo base de Google es multilingüe, esta variante cuantizada se recomienda únicamente para inglés, y su uso en otros idiomas se considera fuera de alcance.
- No se documenta soporte para tool calling, function calling ni agentes multi-paso en la información proporcionada.
- No se especifica ninguna capacidad especial como visión, audio o modo de razonamiento explícito.

## Casos de uso

- Asistente conversacional en producción: el modelo puede integrarse como chatbot de soporte o asistente virtual en aplicaciones web, gracias a su bajo consumo de VRAM y su compatibilidad con vLLM para servir peticiones de forma eficiente.
- Generación de código en entornos con recursos limitados: aunque no se documenta un benchmark de código, el modelo base Gemma 2 es capaz de generar fragmentos de código; su versión cuantizada puede usarse en entornos de desarrollo sin GPU dedicada de alta gama.
- Análisis de texto y extracción de información: puede procesar documentos y responder preguntas sobre el contenido, con una ventana de contexto de 8192 tokens, suficiente para párrafos largos o artículos.
- Prototipado rápido de aplicaciones de IA: al ser ligero y fácil de desplegar, es adecuado para pruebas de concepto y MVP en startups o equipos con infraestructura limitada.
- Fine-tuning posterior (aunque no se documenta, el formato safetensors permite reentrenamiento): se podría ajustar para tareas específicas de dominio, como clasificación de textos o generación de informes, con menor coste computacional que el modelo original.
- Despliegue en edge o dispositivos con GPU pequeña: por ejemplo, una RTX 3060 de 12 GB o una RTX 4060 de 8 GB puede ejecutar el modelo sin problemas, permitiendo aplicaciones locales de asistencia.

## Benchmarks y rendimiento

Se han publicado resultados en el benchmark OpenLLM (versión 1) comparando el modelo cuantizado con el original. La tabla siguiente muestra las puntuaciones exactas.

| Benchmark | gemma-2-2b-it (original) | gemma-2-2b-it-quantized.w8a16 (este modelo) | Recuperación |
|---|---|---|---|
| MMLU (5-shot) | 56,94 | 56,81 | 99,8% |
| ARC Challenge (25-shot) | 58,87 | 58,70 | 99,7% |
| GSM-8K (5-shot, strict-match) | 44,81 | 44,88 | 100,2% |
| Hellaswag (10-shot) | 71,41 | 71,34 | 99,9% |
| Winogrande (5-shot) | 68,82 | 69,46 | 100,9% |
| TruthfulQA (0-shot) | 53,22 | 53,13 | 99,8% |
| **Promedio** | **59,01** | **59,05** | **100,1%** |

La recuperación media del 100,1% indica que la cuantización no solo no degrada el rendimiento, sino que en alguna tarea (Winogrande, GSM-8K) incluso mejora ligeramente, probablemente debido a la variación aleatoria en la evaluación. No hay datos de rendimiento en tareas de código (HumanEval) ni de razonamiento complejo en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización INT8, el modelo ocupa aproximadamente 3,2 GB de memoria (los pesos son 2.6B × 8 bits = 2.6 GB, más overhead de activaciones y KV cache). Se recomienda al menos 4 GB de VRAM para una ejecución cómoda con secuencias de hasta 2048 tokens.
- **GPU recomendadas**: cualquier GPU con 8 GB de VRAM o más, como RTX 3060, RTX 4060, RTX 4090, A100, H100. En GPUs de 4 GB se puede ejecutar con secuencias cortas.
- **Compatibilidad con GPU de consumo**: sí, cabe en la mayoría de GPUs consumer de 8 GB o más.
- **Opciones de despliegue**: vLLM (recomendado, soporta la cuantización nativamente), también compatible con llama.cpp, Ollama, TGI (Transformers) y cualquier backend que soporte safetensors.
- **Latencia y throughput**: no se proporcionan datos concretos, pero al ser un modelo de 2.6B con cuantización INT8, se espera una velocidad de generación alta (del orden de decenas de tokens por segundo en una GPU moderna).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | MMLU | Promedio OpenLLM | Licencia |
|---|---|---|---|---|---|---|
| gemma-2-2b-it (original) | 2.6B | 8192 | FP16 | 56,94 | 59,01 | Gemma |
| **gemma-2-2b-it-quantized.w8a16 (este)** | 2.6B | 8192 | INT8 (W8A16) | 56,81 | 59,05 | Gemma |
| gemma-2-2b-it-quantized.w8a8 (variante de Red Hat) | 2.6B | 8192 | INT8 (W8A8) | no disponible | no disponible | Gemma |
| gemma-2-2b-quantized.w8a16 (versión no instructiva) | 2.6B | 8192 | INT8 (W8A16) | no disponible | 52,03 (promedio) | Gemma |

La comparativa muestra que la cuantización INT8 prácticamente no afecta al rendimiento. La versión w8a8 (pesos y activaciones en INT8) podría ofrecer mayor throughput, pero no se han publicado sus resultados de benchmark. La versión no instructiva (gemma-2-2b-quantized.w8a16) tiene un rendimiento inferior en el promedio OpenLLM (52,03 vs 59,05) por ser la variante base sin ajuste instructivo.

## Limitaciones y advertencias

- **Idioma**: el modelo está pensado para uso en inglés; su uso en otros idiomas puede degradar la calidad de las respuestas y está explícitamente marcado como fuera de alcance en la model card.
- **Sesgos y alucinaciones**: como modelo basado en LLM, puede generar contenido falso o sesgado. Aunque la cuantización no introduce sesgos adicionales, hereda los del modelo original.
- **Riesgo de alucinación**: no se han evaluado específicamente los efectos de la cuantización en la factualidad, aunque TruthfulQA muestra una recuperación del 99,8%, lo que indica que no se agrava significativamente.
- **Licencia**: la licencia Gemma tiene restricciones de uso comercial y de redistribución. Es necesario revisar los términos completos en [ai.google.dev/gemma/terms](https://ai.google.dev/gemma/terms).
- **Limitación de contexto**: aunque el modelo soporta 8192 tokens, la cuantización no modifica el límite de contexto, pero la memoria de la KV cache puede aumentar proporcionalmente. Para secuencias largas, se debe considerar la VRAM adicional.
- **Soporte de herramientas**: no se documenta soporte para tool calling o function calling, por lo que no es adecuado para agentes que requieran invocar APIs externas.
- **Datos de calibración**: la cuantización se realizó con un dataset de calibración específico; si se usa en dominios muy diferentes, la pérdida de precisión podría ser mayor que la reportada.

## Enlaces

- [Modelo en Hugging Face: RedHatAI/gemma-2-2b-it-quantized.w8a16](https://huggingface.co/RedHatAI/gemma-2-2b-it-quantized.w8a16)
- [Modelo original de Google: google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it)
- [Paper de Gemma 2 (arXiv)](https://arxiv.org/pdf/2408.00118)
- [Repositorio llm-compressor (vLLM)](https://github.com/vllm-project/llm-compressor)
- [Dataset de calibración de Neural Magic](https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration)
- [Documentación de vLLM](https://docs.vllm.ai/en/latest/)
- [Términos de licencia Gemma](https://ai.google.dev/gemma/terms)
