# SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch1

## Resumen

Este modelo es un fine-tuning experimental del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por el usuario SaFD-00. Forma parte de una serie de experimentos de ablación sobre *world modeling* (modelado del mundo) en el contexto de agentes de interfaz gráfica. Concretamente, esta variante se entrena únicamente con datos de acción (10K muestras) y sin supervisión de predicción de estado, sirviendo como grupo de control para medir el efecto neto del modelado del mundo frente al entrenamiento principal que combina estado y acción.

El modelo se presenta como un checkpoint de una sola época (epoch 1) con fine-tuning completo (*full fine-tuning*) sobre el modelo base, utilizando el framework Llama-Factory. Está orientado a tareas de interacción con interfaces gráficas mediante coordenadas absolutas de píxeles y un esquema XML específico (Cerebra). Aunque no se proporcionan métricas de rendimiento ni licencia, su interés radica en la investigación sobre agentes visuales y la influencia del modelado del mundo en la capacidad de acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL) con encoder de vision |
| Parametros totales | 3.754.622.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-VL-3B-Instruct soporta 32K tokens, pero no se confirma en esta variante) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica para este fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer multimodal con un encoder de vision (ViT) y un decoder de lenguaje. El fine-tuning se realiza de forma completa (todos los parametros) sobre un conjunto de datos llamado `IWM-AC_EXP08_stage1_train_action_only`, que contiene 10.000 muestras de acciones de interfaz. El entrenamiento se ejecuta durante una epoca (checkpoint-157) y no incluye supervisión de predicción de estado, a diferencia del modelo principal `SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch1` que combina 40K muestras de estado y 10K de acción. El objetivo es aislar el efecto del modelado del mundo en la capacidad de ejecutar acciones correctamente.

El sistema de coordenadas utilizado es de píxeles absolutos (840×1876, con un presupuesto de imagen de 1.605.632 tokens) y el esquema de anotación es XML Cerebra, que emplea atributos `data-bbox` y `aria-label`. Para la evaluación se requiere el parámetro `--xml-schema cerebra`. No se detallan hiperparámetros adicionales ni el proceso de alineación (RLHF/DPO), que no se menciona.

## Capacidades

- Generación de texto y razonamiento multimodal (imagen + texto), heredadas del modelo base Qwen2.5-VL-3B-Instruct.
- Interacción con interfaces gráficas mediante predicción de coordenadas de píxeles y anotaciones XML (esquema Cerebra).
- Soporte de *tool calling* y *function calling*: el modelo base lo soporta, pero no se confirma si este fine-tuning lo mantiene.
- Capacidades multilingües: el modelo base es multilingüe, pero no se especifica para esta variante.
- No se documentan capacidades especiales adicionales (modo *thinking*, audio, etc.) en la información disponible.

## Casos de uso

- Automatización de tareas en interfaces gráficas: el modelo puede recibir una captura de pantalla y generar acciones (clics, escritura, navegación) en formato de coordenadas absolutas, útil para agentes de UI.
- Investigación en *world modeling*: sirve como grupo de control en experimentos que comparan el efecto de predecir el estado del mundo frente a solo predecir acciones, permitiendo aislar variables en estudios de agentes.
- Desarrollo de asistentes de accesibilidad: podría usarse para controlar aplicaciones mediante comandos visuales, aunque no hay evidencia de robustez en entornos reales.
- Pruebas de concepto en entornos simulados: ideal para validar pipelines de entrenamiento con Llama-Factory y fine-tuning completo en modelos multimodales pequeños.
- Benchmarking de agentes visuales: permite comparar el rendimiento de un modelo entrenado solo con acciones frente a uno con modelado del mundo, en tareas de navegación o manipulación de UI.
- Despliegue en entornos con recursos limitados: al ser un modelo de 3.8B parámetros, puede ejecutarse en GPUs de consumo con cuantización, aunque no se proporcionan configuraciones oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de tareas de UI. El autor no incluye comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 3.754M parámetros en FP16, se requieren aproximadamente 7,5 GB de VRAM (sin contar la memoria del encoder de visión). Con cuantización de 4 bits, la VRAM necesaria se reduce a unos 2-3 GB, aunque no se confirma compatibilidad con formatos GGUF o AWQ.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, o superior) es suficiente para FP16. Para cuantización 4-bit, una GPU con 4 GB podría bastar, pero no se garantiza.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de gama media y alta para consumo.
- Opciones de despliegue: al ser un modelo de la familia Qwen2.5-VL, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión). No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles. Dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un fine-tuning experimental sin métricas publicadas. Se puede comparar con su modelo base y con el modelo principal de la misma serie, pero no hay datos cuantitativos. Se recomienda consultar el modelo base Qwen2.5-VL-3B-Instruct para referencias de rendimiento general.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch1 | 3.75B | no disponible | no disponible | Fine-tuning solo acciones, sin world model |
| SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch1 | 3.75B | no disponible | no disponible | Fine-tuning con estado + acciones |
| Qwen/Qwen2.5-VL-3B-Instruct | 3.75B | 32K (oficial) | Apache 2.0 (oficial) | Modelo base, referencia de capacidades |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones específicas de este fine-tuning.
- El modelo se entrena únicamente con datos de acción, por lo que su capacidad de razonamiento sobre el estado del mundo puede ser limitada en comparación con el modelo principal.
- La licencia no está especificada, lo que impide conocer restricciones de uso comercial o redistribución.
- El esquema de anotación Cerebra y el sistema de coordenadas absolutas pueden no ser compatibles con otros entornos de agentes sin adaptación.
- No se proporcionan resultados de evaluación, por lo que su rendimiento en tareas reales es desconocido.
- El checkpoint es de una sola época y con un conjunto de datos reducido (10K muestras), lo que puede limitar su generalización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch1
- Modelo principal (world-model-stage1): https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch1
- Despliegue en FriendliAI (modelo principal): https://friendli.ai/models/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch1
- Despliegue en FriendliAI (variante .25): https://friendli.ai/models/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch1.25
- Repositorio de Qwen2.5 (referencia del modelo base): https://github.com/mx4ai/qwen2.5
