# MicroFlare/microFlare-v1

## Resumen

microFlare v1 es una versión cuantizada asimétricamente del modelo Qwen 3.6 35B-A3B, desarrollada por el usuario MicroFlare. El modelo aplica una cuantización por capas con precisión variable: las partes consideradas más importantes se mantienen en alta precisión, mientras que los pesos menos relevantes se cuantizan con bitrates más bajos. El objetivo principal es permitir la ejecución en hardware modesto, como una GPU de 4 GB con descarga de expertos a RAM del sistema, o incluso solo CPU con 16 GB de RAM.

El modelo base es una arquitectura MoE (Mixture of Experts) con 35.000 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (indicado por el sufijo A3B). La versión cuantizada ocupa 14,9 GB en formato GGUF y está diseñada para funcionar con llama.cpp y herramientas compatibles. Se ha eliminado el predictor MTP (capa 64) por considerarse perjudicial en hardware antiguo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su propuesta de cuantización selectiva que busca un equilibrio entre tamaño reducido y calidad de salida, con resultados de perplejidad comparables a otras cuantizaciones de mayor tamaño. Es una opción interesante para entornos con recursos limitados que necesitan ejecutar un modelo de razonamiento y generación de código de nivel medio sin requerir una GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con cuantizacion asimetrica por capas |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | ~3 B (estimado segun sufijo A3B del modelo base) |
| Longitud de contexto | no especificado (pruebas realizadas hasta 8192 tokens) |
| Tipos de cuantizacion | Cuantizacion asimetrica propia (mezcla de bitrates por capas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

microFlare v1 parte del modelo Qwen 3.6 35B-A3B, una arquitectura transformer con mezcla de expertos (MoE) donde solo se activan unos 3.000 millones de parámetros por token. La contribución principal de microFlare es la cuantización asimétrica: en lugar de aplicar un único bitrate a todos los pesos, se analiza la importancia de cada capa y se asignan mayor precisión a las capas críticas y menor precisión a las menos influyentes. Este enfoque busca maximizar la calidad manteniendo un tamaño reducido.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). El autor solo indica que se trata de una cuantización del modelo original y que se ha eliminado el predictor MTP (capa 64) para mejorar la compatibilidad con hardware antiguo. Los pesos se han optimizado con la herramienta imatrix (importance matrix), lo que sugiere que se ha utilizado calibración con datos representativos para mejorar la calidad de la cuantización.

## Capacidades

- Generación de texto y razonamiento: probado con éxito en una amplia variedad de prompts, produciendo respuestas de alta calidad.
- Razonamiento matemático: resultados en GSM8K (5-shot) con una precisión flexible de 0,5906 y estricta de 0,6058.
- Conocimiento general: resultados parciales en MMLU Pro (solo primeras 20 preguntas de 14 categorías) con una media de 0,7286.
- Generación de código: el autor reporta que el modelo construyó un sitio web de prueba en un solo intento, indicando que las capacidades de programación se mantienen tras la cuantización.
- Conversación: etiquetado como "conversational" en HuggingFace, apto para diálogos multi-turno.
- No se ha probado con tool calling, agentes o entradas de imagen (según el autor).
- Soporte de cuantización imatrix para mejorar la calidad en GGUF.

## Casos de uso

- Inferencia en hardware limitado: el modelo está diseñado para ejecutarse en GPU de 4 GB con descarga de expertos a RAM del sistema (16 GB), o incluso solo CPU con 16 GB de RAM. Adecuado para entornos sin GPU de gama alta.
- Asistente de programación local: gracias a sus capacidades de generación de código y razonamiento, puede usarse como copiloto de código en una máquina de desarrollo modesta, por ejemplo con Ollama o llama.cpp.
- Chatbot de propósito general: al ser un modelo conversacional, puede integrarse en aplicaciones de atención al cliente o asistentes personales que requieran procesamiento local.
- Prototipado rápido de aplicaciones NLP: su tamaño reducido (14,9 GB) permite desplegarlo en servidores con una sola GPU de 16 GB sin necesidad de offloading, facilitando pruebas y desarrollo.
- Educación e investigación: como modelo de código abierto con licencia Apache 2.0, es útil para experimentos de cuantización, análisis de perplejidad y estudio de técnicas de compresión de modelos.
- Generación de contenido y resumen de documentos: puede utilizarse para redactar textos, resumir informes o extraer información, siempre que se acepte la posible pérdida de calidad frente al modelo original sin cuantizar.

## Benchmarks y rendimiento

El autor proporciona resultados de perplejidad (con contexto de 2k) comparando microFlare v1 con otras cuantizaciones del mismo modelo base. También incluye resultados de GSM8K y MMLU Pro (parcial). Se presentan a continuación.

| Modelo | Tamaño | Perplejidad (2k contexto) |
|---|---|---|
| bartowski/Q4_K | 22 GB | 5.9654 ± 0.03726 |
| unsloth/UD-IQ3_S | 13.7 GB | 6.2496 ± 0.03948 |
| **microFlare v1.a** | **14 GB** | **6.2761 ± 0.03961** |
| mudler/APEX-I-Mini | 14.3 GB | 6.3554 ± 0.04057 |
| bartowski/Q2_K_L | 14 GB | 6.4180 ± 0.04066 |

| Prueba | Configuración | Métrica | Resultado |
|---|---|---|---|
| GSM8K (5-shot, 2048 contexto) | flexible | precisión | 0.5906 ± 0.0135 |
| GSM8K (5-shot, 2048 contexto) | estricta | precisión | 0.6058 ± 0.0135 |
| MMLU Pro (parcial, 5-shot, 8196 contexto) | total promedio | exact_match | 0.7286 ± 0.0262 |

Nota: los resultados de MMLU Pro provienen de una ejecución parcial (solo 20 preguntas de cada una de las 14 categorías), por lo que deben interpretarse con cautela. No se han publicado resultados completos de benchmarks estándar como MMLU completo, HumanEval o GPQA.

## Requisitos de hardware

- VRAM mínima: 4 GB de GPU con 16 GB de RAM del sistema (con descarga de expertos a CPU).
- GPU recomendada: 16 GB de VRAM para ejecución sin offloading (no probado por el autor).
- Ejecución solo CPU: posible con 16 GB de RAM, aunque el rendimiento será lento.
- Formato GGUF compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten GGUF.
- No se proporcionan datos de latencia o throughput específicos.
- El tamaño del archivo es de 14,9 GB, lo que requiere al menos 16 GB de almacenamiento libre.

## Comparativa con modelos similares

La comparativa más directa es con otras cuantizaciones del mismo modelo base Qwen 3.6 35B-A3B. La tabla de perplejidad anterior muestra que microFlare v1.a (14 GB) se sitúa entre las opciones de tamaño similar, con una perplejidad ligeramente peor que unsloth/UD-IQ3_S (13.7 GB) pero mejor que mudler/APEX-I-Mini (14.3 GB) y bartowski/Q2_K_L (14 GB). En cuanto a tamaño, es comparable a estas alternativas, aunque bartowski/Q4_K ofrece mejor perplejidad a costa de 22 GB.

No se dispone de comparativas con otros modelos MoE de tamaño similar (por ejemplo, Mixtral 8x7B o Qwen 2.5 32B-A3B) en la información proporcionada.

## Limitaciones y advertencias

- El predictor MTP (capa 64) ha sido eliminado, lo que puede afectar al rendimiento en tareas que aprovechan la predicción multi-token.
- No se ha probado con tool calling, agentes o entradas multimodales (imágenes, audio).
- La cuantización asimétrica puede introducir degradación en tareas sensibles a la precisión, aunque los resultados de perplejidad son razonables.
- Los resultados de MMLU Pro son parciales y no representan una evaluación completa.
- No se especifican los idiomas soportados; aunque el modelo base de Qwen suele ser multilingüe, no está confirmado para esta versión.
- El modelo está pensado para hardware limitado, por lo que en GPU de 16 GB puede haber problemas de memoria si se usan contextos muy largos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original por si hubiera restricciones adicionales.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/MicroFlare/microFlare-v1)
- [Blog post del autor](https://microflare.bearblog.dev/introducing-microflare-v1)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B) (referencia)
