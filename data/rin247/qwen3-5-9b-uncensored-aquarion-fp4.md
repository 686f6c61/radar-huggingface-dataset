# Rin247/Qwen3.5-9B-Uncensored-Aquarion-FP4

## Resumen

El modelo `Rin247/Qwen3.5-9B-Uncensored-Aquarion-FP4` es una cuantización FP4 (weight-only) del modelo base `Qwen3.5-9B`, desarrollada por el usuario Rin247. Se trata de una variante "abliterada" (uncensored) que elimina la dirección de rechazo del modelo original mediante proyección ortogonal, antes de aplicar la cuantización. El objetivo es ofrecer un modelo sin filtros de seguridad para uso local, manteniendo las capacidades del modelo base en un formato reducido.

La cuantización FP4 reduce significativamente el tamaño de los pesos (aproximadamente 5,49 mil millones de parámetros almacenados en safetensors, frente a los 9 mil millones nominales del modelo base), lo que permite su ejecución en hardware con recursos limitados. Sin embargo, el modelo requiere un proceso de de-cuantización personalizado con los buffers de escala y forma incluidos, y no es compatible directamente con motores de inferencia estándar sin adaptación. La relevancia actual radica en la creciente demanda de modelos locales sin restricciones de contenido, aunque su uso conlleva riesgos importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B base) |
| Parametros totales | 5.494.551.040 (según safetensors; el nombre indica 9B nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (según el modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | FP4 (weight-only, con escalas y formas almacenadas) |
| Idiomas soportados | no disponible (el modelo base soporta inglés, chino y otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.5-9B` es un transformer denso con atención de ventana completa, entrenado por Alibaba Cloud con un contexto de 131.072 tokens y capacidades multilingües. La variante "Aquarion" aplica una técnica de abliteración: se identifica la dirección de rechazo (refusal direction) en el espacio de activaciones y se proyecta ortogonalmente para eliminarla, resultando en un modelo que no rechaza peticiones consideradas inapropiadas. Este proceso se realiza antes de la cuantización FP4, que comprime los pesos a 4 bits usando RTN (round-to-nearest) sobre CPU, almacenando escalas y formas por tensor para permitir la de-cuantización posterior.

No se dispone de información sobre el dataset de entrenamiento específico de esta variante, ni sobre si se aplicaron técnicas adicionales como RLHF o DPO. La cuantización FP4 es agresiva y puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original, aunque no se han publicado métricas comparativas.

## Capacidades

- Generación de texto libre sin filtros de contenido (debido a la abliteración).
- Razonamiento y comprensión de lenguaje natural, heredados del modelo base Qwen3.5-9B.
- Soporte de contexto largo (hasta 131.072 tokens) para conversaciones extensas o documentos largos.
- Capacidades multilingües del modelo base (inglés, chino y otros), aunque no se especifican en esta variante.
- No se indica soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.
- La cuantización FP4 permite inferencia con menor uso de VRAM, pero requiere un pipeline de de-cuantización personalizado.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, poesía o guiones sin censura, útil para escritores que necesitan explorar temas sensibles.
- Investigación en seguridad de IA: permite estudiar el comportamiento de modelos sin alineación y comparar con versiones alineadas para entender los efectos de la abliteración.
- Desarrollo de asistentes locales de chat: al ser uncensored, puede integrarse en aplicaciones de chat privadas donde el usuario controla el contenido, siempre que se asuman los riesgos.
- Análisis de documentos largos: con 131.072 tokens de contexto, puede resumir o extraer información de libros técnicos o informes extensos sin truncamiento.
- Prototipado rápido de aplicaciones de NLP: al ser un modelo pequeño (9B) cuantizado, cabe en GPUs de consumo y permite iterar rápidamente en tareas de generación de texto.
- Educación y experimentación: estudiantes e investigadores pueden usarlo para entender cómo la cuantización FP4 afecta la calidad del modelo y cómo funciona la abliteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para esta variante cuantizada. Se recomienda evaluar el modelo en las tareas específicas de interés antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: el archivo safetensors ocupa 8.0 GB, pero tras la de-cuantización a FP16 el modelo requeriría aproximadamente 18 GB (9B parámetros × 2 bytes). Con FP4, la inferencia puede realizarse con menos VRAM si el motor soporta la cuantización directamente, aunque no se especifica.
- GPUs recomendadas: para ejecutar el modelo de-cuantizado en FP16, se necesitan GPUs con al menos 20 GB de VRAM (A100 40GB, RTX 4090 24GB, etc.). Con FP4 nativo, podría caber en GPUs de 8-12 GB, pero no hay garantía.
- No se indica compatibilidad con GPUs de consumo específicas; el modelo requiere un pipeline de de-cuantización personalizado, por lo que no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 131.072 | FP16 | Apache 2.0 (presumible) | Hugging Face |
| Qwen3.5-9B-Uncensored (LEONW24) | 9B | 131.072 | GGUF Q4_K_M | no disponible | Hugging Face, Ollama |
| Rin247/Qwen3.5-9B-Uncensored-Aquarion-FP4 | 9B (nominal) | 131.072 | FP4 weight-only | no disponible | Hugging Face |

La comparativa se basa en el modelo base y otras variantes uncensored. No se dispone de datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- El modelo es uncensored: puede generar contenido ofensivo, ilegal o peligroso. Su uso conlleva responsabilidad legal y ética.
- La cuantización FP4 puede degradar la calidad de las respuestas y aumentar la tasa de alucinaciones en comparación con el modelo original.
- No se especifica licencia, lo que genera incertidumbre sobre su uso comercial y redistribución.
- El formato de pesos es propietario (custom weight-only recipes) y requiere de-cuantización manual; no es compatible con motores de inferencia estándar sin desarrollo adicional.
- No se han publicado evaluaciones de sesgos ni de seguridad; el proceso de abliteración puede eliminar también mecanismos de seguridad importantes.
- El contexto de 131.072 tokens es del modelo base, pero la cuantización FP4 puede afectar la capacidad de manejar contextos largos en la práctica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rin247/Qwen3.5-9B-Uncensored-Aquarion-FP4
- Modelo base Qwen3.5-9B (referencia): no disponible en la información proporcionada
- Variante GGUF uncensored de LEONW24: https://huggingface.co/LEONW24/Qwen3.5-9B-Uncensored
- Guía de despliegue de Qwen3.5-9B en 8GB GPU: https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
- Variante uncensored en Ollama: https://ollama.com/jaahas/qwen3.5-uncensored
