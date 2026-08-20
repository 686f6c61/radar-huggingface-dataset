# RedHatAI/gemma-2-2b-it-quantized.w4a16

## Resumen

RedHatAI/gemma-2-2b-it-quantized.w4a16 es una versión cuantizada del modelo Gemma-2-2b-it de Google, desarrollada por Neural Magic y publicada bajo la organización Red Hat AI. El modelo reduce el peso de cada parámetro de 16 a 4 bits mediante cuantización INT4, lo que disminuye el tamaño en disco y los requisitos de memoria de GPU en aproximadamente un 75%. Está diseñado para uso comercial y de investigación en inglés, y se puede desplegar eficientemente con vLLM o Transformers.

La cuantización se realiza con el algoritmo GPTQ, aplicando una escala lineal por grupos de 128 pesos, y se calibra con 512 secuencias del dataset Open-Platypus. La puntuación media en el benchmark OpenLLM (versión 1) es de 57,75, frente a los 58,8 del modelo sin cuantizar, lo que demuestra una pérdida de rendimiento mínima (alrededor de un punto). Esta optimización hace que el modelo sea adecuado para entornos con recursos limitados, como servidores con GPUs de gama media o incluso inferencia en CPU con librerías como llama.cpp.

El modelo conserva las capacidades del Gemma-2-2b-it original, incluyendo la generación de texto conversacional y la comprensión de instrucciones, aunque está restringido al idioma inglés según la model card. Es una opción práctica para aplicaciones de asistente de chat que requieren un equilibrio entre calidad y eficiencia computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma-2 (decoder-only transformer) |
| Parámetros totales | 3.204.165.888 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (según el modelo base gemma-2-2b-it) |
| Tipos de cuantización | INT4 (W4A16) con GPTQ, grupo de 128 |
| Idiomas soportados | inglés |
| Licencia | Gemma (según la model card; en Hugging Face aparece como llama2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma-2 de Google, un transformer decoder-only con 2.6 mil millones de parámetros activos (3.2 mil millones en total), optimizado para generación de texto. En esta versión, se aplica cuantización de pesos INT4 a los operadores lineales dentro de los bloques del transformer, manteniendo las activaciones en FP16 (esquema W4A16). La cuantización se realiza con el algoritmo GPTQ, que minimiza el error de cuantización mediante una calibración con 512 secuencias del dataset Open-Platypus, con un factor de amortiguamiento del 10% y tamaño de grupo 128. No se aplica cuantización al head de salida (lm_head) para preservar la precisión de la clasificación.

El modelo se entrenó originalmente con técnicas de aprendizaje supervisado y RLHF (según el modelo base gemma-2-2b-it), aunque no se especifican los datos exactos de entrenamiento del modelo base en la información proporcionada. La cuantización posterior no requiere re-entrenamiento, solo una fase de calibración con datos de ejemplo.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para tareas de asistente, respondiendo a instrucciones y preguntas en inglés.
- Comprensión de instrucciones: puede seguir instrucciones complejas y mantener conversaciones multi-turno.
- Razonamiento básico: el modelo base muestra capacidades de razonamiento, aunque limitadas por su tamaño (2B).
- Soporte de tool calling: no se menciona explícitamente en la información proporcionada, por lo que se considera no disponible.
- Capacidades multilingües: solo inglés, según la model card (uso fuera del inglés está fuera de alcance).
- Capacidades especiales: no incluye visión ni audio, solo texto.

## Casos de uso

- Asistentes conversacionales ligeros: el modelo puede gestionar diálogos multi-turno en inglés con un contexto de hasta 8192 tokens, adecuado para chatbots de atención al cliente o asistentes personales en entornos con recursos limitados.
- Generación de contenido en inglés: redacción de correos, resúmenes o textos creativos en inglés, aprovechando su capacidad de seguir instrucciones.
- Despliegue en edge y dispositivos con poca VRAM: gracias a la cuantización INT4, el modelo ocupa alrededor de 3,4 GB en disco y requiere aproximadamente 2-3 GB de VRAM, lo que permite ejecutarlo en GPUs como RTX 3060 o incluso en CPU con llama.cpp.
- Integración en pipelines de vLLM: se puede servir de forma eficiente con vLLM para aplicaciones de baja latencia en producción, utilizando la API compatible con OpenAI.
- Evaluación de modelos cuantizados: sirve como punto de referencia para comparar el impacto de la cuantización INT4 en el rendimiento de Gemma-2-2B.
- Aplicaciones de investigación en eficiencia de modelos: permite estudiar la relación entre la precisión de los pesos y la calidad de la generación.

## Benchmarks y rendimiento

El modelo se evaluó en el benchmark OpenLLM (versión 1) con el harness de evaluación de EleutherAI. La puntuación media es 57,75, frente a los 58,8 del modelo original sin cuantizar, lo que supone una pérdida de aproximadamente 1 punto (1,8%). No se proporcionan resultados desglosados por tarea (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Modelo | Puntuación media OpenLLM (v1) |
|---|---|
| gemma-2-2b-it (original) | 58,8 |
| gemma-2-2b-it-quantized.w4a16 | 57,75 |

## Requisitos de hardware

- VRAM estimada: con cuantización INT4 y 3.2B parámetros, se necesitan aproximadamente 2-3 GB de VRAM para inferencia con activaciones en FP16. Con activaciones en FP16, se requiere alrededor de 3 GB.
- GPU recomendadas: RTX 4090 (24 GB) para mayor margen, o RTX 3060 (12 GB) y GPUs de menor capacidad pueden ejecutar el modelo con suficiente margen.
- En consumer GPU: sí, cabe en GPUs de consumo de 8 GB o más, e incluso en CPUs con llama.cpp.
- Opciones de despliegue: vLLM (recomendado, con soporte OpenAI-compatible), Transformers con `device_map="auto"`, y llama.cpp para cuantización adicional o CPU.
- Latencia y throughput: no se proporcionan datos concretos, pero se espera una mejora de aproximadamente 2 veces en throughput comparado con el modelo de 16 bits, gracias a la reducción de memoria y ancho de banda.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Rendimiento OpenLLM |
|---|---|---|---|---|---|
| gemma-2-2b-it (original) | 3.2B | 8192 | FP16 | Gemma | 58,8 |
| gemma-2-2b-it-quantized.w4a16 | 3.2B | 8192 | INT4 (W4A16) | Gemma | 57,75 |
| gemma-2-2b-it-quantized.w8a8 | 3.2B | 8192 | INT8 (W8A8) | Gemma | no disponible |

La versión w8a8 cuantiza tanto pesos como activaciones a INT8, reduciendo la memoria un 50% y duplicando el throughput de matrices, pero no se han publicado sus resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- Idioma: el modelo está diseñado para uso en inglés; el uso en otros idiomas está fuera de alcance y puede producir respuestas de menor calidad.
- Riesgo de alucinación: como todo LLM de pequeño tamaño, puede generar información falsa o inventada, especialmente en tareas complejas.
- Pérdida de precisión: la cuantización INT4 introduce una pérdida de rendimiento del 1,8% en el benchmark OpenLLM, que puede ser mayor en tareas específicas de razonamiento o matemáticas.
- Licencia: la licencia Gemma de Google permite uso comercial y de investigación, pero tiene restricciones: no se puede utilizar para generar contenido ilegal o dañino, y hay que cumplir las políticas de uso aceptable de Google. La discrepancia con el tag "llama2" en Hugging Face puede generar confusión, pero la model card oficial especifica la licencia Gemma.
- Restricciones de idioma: no se debe usar en idiomas distintos del inglés, según la model card.
- Riesgo de alucinación en contextos largos: aunque soporta 8192 tokens, puede perder coherencia en conversaciones muy extensas.

## Enlaces

- HuggingFace: https://huggingface.co/RedHatAI/gemma-2-2b-it-quantized.w4a16
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Paper GPTQ: https://arxiv.org/abs/2210.17323
- Librería llm-compressor: https://github.com/vllm-project/llm-compressor
- OpenLLM leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- Model card de Gemma 2 (Google): https://ai.google.dev/gemma/docs/core/model_card_2
