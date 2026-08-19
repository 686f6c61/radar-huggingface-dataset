# ajaxdavis/alpha-yi-qwen35-9b-chat-v67-20260817

## Resumen

Alpha yi — Qwen3.5-9B chat LoRA, V67 es un adaptador QLoRA publicado como artefacto de investigación por el autor ajaxdavis. Se trata de un checkpoint de desarrollo dentro del programa de calidad "Alpha yi F7", que busca mejorar la fiabilidad conversacional del modelo base `techwithsergiu/Qwen3.5-text-9B-bnb-4bit` (una versión cuantizada a 4 bits de Qwen3.5-9B). El adaptador tiene 14,5 millones de parámetros entrenables y está diseñado para diálogo dependiente del contexto: seguir instrucciones explícitas, aceptar correcciones, pedir aclaraciones solo cuando es imprescindible y detener la generación limpiamente. No se busca amplitud de conocimiento del mundo, sino robustez en la interacción conversacional.

Este checkpoint concreto (V67 `step-5`) no supera la puerta de promoción del programa (37/53 PASS estricto frente al umbral de 48/53), por lo que no es una versión estable ni reemplaza al modelo `alpha-yi` existente. Se publica porque la ejecución es interesante desde el punto de vista de investigación: muestra una mejora de +6 casos sobre su padre en un conjunto de validación ciego, con cero respuestas catastróficas. El adaptador se distribuye bajo licencia Apache 2.0 y se puede cargar mediante la librería PEFT sobre el base de 4 bits, o bien consumir a través de un endpoint OpenAI-compatible alojado por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con adaptador LoRA (r=8, alpha=16, sin dropout) |
| Parametros totales | No disponible (modelo base Qwen3.5-9B; adaptador con 14 548 992 parámetros entrenables) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (entrenamiento con secuencias de 640 tokens; generación limitada a 512 tokens nuevos) |
| Tipos de cuantizacion | Base cuantizado a 4 bits (bitsandbytes bnb-4bit); adaptador en precisión completa |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (QLoRA) que se monta sobre `techwithsergiu/Qwen3.5-text-9B-bnb-4bit`, una versión cuantizada a 4 bits del modelo Qwen3.5-9B. El adaptador añade 14 548 992 parámetros entrenables sobre el base congelado. El entrenamiento partió del checkpoint `step-5` de la generación V66, con una tasa de aprendizaje máxima de 1e-7 (un tercio de la de V66) para evitar la degradación observada en checkpoints tardíos. Se realizaron 60 pasos de optimización con un límite de secuencia de 640 tokens. El conjunto de datos de 240 filas incluye 150 correcciones revisadas de forma independiente que cubren los 24 fallos del padre en el holdout, las 20 conversaciones exactas que el padre había visto físicamente y 70 conversaciones de retención amplia, cada una expuesta una sola vez. Se escribieron checkpoints en los pasos 1, 3, 5, 10, 20, 38 y 60, y la selección del mejor (paso 5) fue empírica, no basada en la suposición de que un paso posterior es mejor. El entrenamiento se ejecutó en una sola RTX 3070 con torch 2.8.0+cu128, transformers 5.2.0, peft 0.18.1, unsloth 2026.8.13 y bitsandbytes 0.50.0.

## Capacidades

- Diálogo dependiente del contexto: utiliza el contexto suministrado, respeta restricciones explícitas, acepta correcciones y solicita aclaraciones solo cuando es imposible dar una respuesta útil.
- Detención limpia de la generación: todas las respuestas evaluadas terminan en EOS, sin alcanzar el límite de 512 tokens.
- Estructura determinista: sin fugas de rol, sin artefactos de tokens de control y sin bucles degenerados (53/53 pases estructurales en la evaluación).
- Conversación multi-turno: entrenado con conversaciones reales y correcciones para mantener coherencia en interacciones largas.
- Integración con la plantilla de chat de Qwen3.5 (con `enable_thinking=False`).
- No incluye capacidades de tool calling, visión, audio ni razonamiento extendido (thinking mode) documentadas.

## Casos de uso

- Asistente conversacional de soporte: el modelo puede gestionar diálogos donde el usuario da instrucciones específicas (p. ej., "planifica una cena sencilla para cuatro personas, una vegetariana") y el modelo debe ceñirse a las restricciones sin divagar.
- Corrección de respuestas en producción: gracias a su entrenamiento con correcciones, es adecuado para sistemas donde el usuario puede reformular o matizar una petición y el modelo debe adaptarse sin repetir errores.
- Evaluación de calidad conversacional: como checkpoint de investigación, sirve para comparar estrategias de entrenamiento (curriculum, tasa de aprendizaje, selección de checkpoints) en entornos académicos o de I+D.
- Prototipado de agentes de chat con presupuesto de hardware reducido: al ser un adaptador sobre un base de 4 bits, puede ejecutarse en GPUs de consumo (8-12 GB VRAM) para pruebas locales.
- Endpoint de demostración: el autor ofrece un endpoint OpenAI-compatible que aplica la política del sistema y la configuración de generación exacta, útil para validar respuestas reproducibles antes de desplegar.
- Investigación sobre alineación conversacional: el repositorio incluye evidencia completa del torneo ciego, política de enmascaramiento y esquema de evaluación, lo que permite reproducir y auditar el proceso de selección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una evaluación interna mediante un torneo ciego con 53 casos nuevos, juzgados por Claude Sonnet con enmascaramiento de identidad. Los resultados del checkpoint seleccionado (step-5) y sus hermanos son los siguientes:

| Checkpoint | PASS | BORDERLINE | FAIL | Catástrofes | Tasa de pase estricto |
|---|---|---|---|---|---|
| **step-5 (seleccionado)** | **37** | 4 | 12 | 0 | **0.698** |
| step-38 | 34 | 3 | 16 | 0 | 0.642 |
| step-10 | 33 | 6 | 14 | 0 | 0.623 |
| step-60 | 33 | 3 | 17 | 0 | 0.623 |
| parent V66 step-5 | 31 | 5 | 17 | 0 | 0.585 |
| step-1 | 30 | 6 | 17 | 0 | 0.566 |
| step-20 | 30 | 5 | 18 | 0 | 0.566 |
| step-3 | 28 | 4 | 21 | 0 | 0.528 |

El checkpoint seleccionado gana +6 casos sobre su padre en un holdout que ninguno había visto, con cero respuestas catastróficas en todo el campo. Además, en los 53 casos produjo 53/53 pases estructurales: todas las respuestas terminaron en EOS, ninguna alcanzó el límite de 512 tokens, y no hubo fugas de rol ni bucles degenerados.

## Requisitos de hardware

- VRAM estimada: el modelo base de 9B en 4 bits ocupa aproximadamente 5-6 GB; sumando el adaptador y el contexto de generación, se recomiendan al menos 8 GB de VRAM para inferencia local.
- GPU recomendadas: RTX 3070 (usada en entrenamiento), RTX 3080/3090, RTX 4060/4070/4080/4090, o GPUs de datacenter como A10, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más (p. ej., RTX 3070, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: el autor proporciona un endpoint OpenAI-compatible (`https://donto.org/alpha-yi-v67/v1`) que aplica la política del sistema y la configuración de generación exacta. Para despliegue propio, se puede cargar con `transformers` + `peft` (ver ejemplo en la documentación), o exportar a GGUF para usar con llama.cpp u Ollama, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. La generación se realiza con greedy decoding (sin sampling) y un máximo de 512 tokens nuevos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar que permitan una comparación cuantitativa con otros modelos de la misma categoría (p. ej., Qwen2.5-7B-Instruct, Llama-3.1-8B-Instruct o el propio Qwen3.5-9B-Instruct). La evaluación interna del torneo ciego solo compara checkpoints dentro de la misma línea Alpha yi. Se puede afirmar que el adaptador mejora al modelo base sin adaptador en el holdout específico (37 vs. 31 pases), pero no hay datos públicos sobre MMLU, HumanEval u otros benchmarks. Por tanto, la comparativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no una versión estable: no supera la puerta de promoción (37/53 frente a 48/53) y no debe usarse en producción sin validación adicional.
- Conocimiento del mundo limitado: la amplitud de conocimiento no es un objetivo de esta línea, por lo que puede fallar en preguntas factuales o de dominio general.
- Requiere `SYSTEM-POLICY.txt` como parte del contrato de ejecución: las respuestas evaluadas solo son válidas si se antepone esa política como mensaje de sistema. Sin ella, el comportamiento puede diferir.
- Configuración de generación específica: los resultados reportados se obtuvieron con greedy decoding, `repetition_penalty=1.0`, `no_repeat_ngram_size=6` y `max_new_tokens=512`. Cambiar estos parámetros puede alterar la calidad de las respuestas.
- Base cuantizado a 4 bits: el adaptador está entrenado contra el base `bnb-4bit`; cargarlo sobre una versión no cuantizada puede producir resultados diferentes.
- Sin garantías de seguridad: no se documentan evaluaciones de sesgos, toxicidad o alucinación más allá del torneo ciego. El riesgo de alucinación existe, especialmente en temas fuera del alcance conversacional.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni mantenimiento; es un artefacto de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajaxdavis/alpha-yi-qwen35-9b-chat-v67-20260817
- Modelo base: https://huggingface.co/techwithsergiu/Qwen3.5-text-9B-bnb-4bit
- Colección Qwen3.5 (referencia): https://huggingface.co/collections/Qwen/qwen35
- Repositorio de la serie Yi (referencia, no directamente relacionado): https://github.com/01-ai/Yi
