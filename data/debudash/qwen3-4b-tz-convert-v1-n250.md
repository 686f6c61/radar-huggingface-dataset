# debudash/qwen3-4b-tz-convert-v1-n250

## Resumen

`debudash/qwen3-4b-tz-convert-v1-n250` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen3-4B-Instruct-2507, publicado por el usuario debudash dentro del proyecto "tz-convert". El adaptador está especializado en una tarea muy concreta: la conversión y el razonamiento sobre zonas horarias (timezone), y forma parte de una curva de eficiencia de datos en la que se publican distintos checkpoints entrenados con volúmenes crecientes de ejemplos del mismo dataset (`debudash/tz-convert-sft`).

Este checkpoint concreto corresponde al primer punto de esa curva: se entrenó únicamente con los primeros 250 ejemplos de la mezcla `v1`, manteniendo los mismos hiperparámetros que el resto de checkpoints. Su relevancia es fundamentalmente experimental: sirve para estudiar cómo escala el rendimiento de un adaptador de bajo rango con el tamaño del conjunto de entrenamiento en una tarea de especificación estricta, más que como modelo listo para producción.

El modelo hereda la arquitectura y el tamaño del base (Qwen3-4B-Instruct-2507, aproximadamente 4.000 millones de parámetros), pero el adaptador en sí es de pequeño tamaño (el repositorio ocupa 0,1 GB). La model card reporta métricas de adherencia a especificación y robustez, y remite al checkpoint "mejor" (`v3-n12000`) para el rendimiento completo del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) + adaptador LoRA/QLoRA |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB; el base es de ~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones estándar de Qwen3) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de la familia Qwen3 en su variante instruct. El entrenamiento se realizó con QLoRA, es decir, cuantización de bajo bits del modelo base congelado más adaptadores LoRA entrenables, lo que reduce drásticamente los requisitos de memoria frente a un ajuste completo. El repositorio usa la librería `peft` y contiene únicamente los pesos del adaptador, no el modelo base.

El conjunto de entrenamiento es la mezcla `v1` del dataset `debudash/tz-convert-sft`, y este checkpoint usa solo los primeros 250 ejemplos. La model card indica que los hiperparámetros son idénticos a los de todos los demás checkpoints del proyecto, lo que permite aislar el efecto del tamaño de datos. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO adicionales sobre el adaptador. El objetivo declarado del proyecto es medir la adherencia a una especificación estricta (spec-adherence) y la robustez ante entradas variadas en la tarea de conversión de zonas horarias.

## Capacidades

- Generación de texto conversacional sobre el modelo base Qwen3-4B-Instruct-2507.
- Conversión y razonamiento sobre zonas horarias (tz-convert), tarea objetivo del adaptador.
- Adherencia a una especificación de prompt estricta, medida mediante la métrica "spec-adherence".
- Robustez ante variaciones de entrada, medida mediante la métrica "robustness".
- Soporte de conversaciones multi-turno (la model card reporta "Drift: conversations held").
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma (`en`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito más allá de las heredadas del base.

## Casos de uso

- Evaluación de eficiencia de datos en fine-tuning: este checkpoint sirve como punto de referencia (250 ejemplos) para comparar cómo evoluciona la adherencia a especificación frente a checkpoints entrenados con más datos, como el `v3-n12000`.
- Investigación sobre adaptadores LoRA de bajo rango: permite estudiar el comportamiento de un adaptador QLoRA pequeño (0,1 GB) sobre un base de 4B en una tarea de formato estricto.
- Conversión de zonas horarias en asistentes de calendario: el adaptador puede integrarse en un pipeline que normalice horas entre zonas, aunque su baja adherencia reportada (12,0%) lo hace apto solo para experimentación.
- Pruebas de robustez ante entradas ambiguas: útil para construir conjuntos de evaluación que midan la degradación del modelo cuando el prompt no sigue el formato esperado.
- Docencia y reproducción de experimentos: el código, los conjuntos de evaluación y los informes están publicados en el repositorio `debudash/slm-training`, lo que facilita reproducir el entrenamiento.
- Baseline para comparativas internas: sirve como referencia mínima contra la que medir mejoras de futuros adaptadores especializados en la misma tarea.

## Benchmarks y rendimiento

| Metrica | Este checkpoint (v1-n250) | Base con prompt completo |
|---|---|---|
| Spec-adherence | 12,0% | 12,0% |
| Robustness | 12,6% | 23,3% |
| Drift: conversations held | no disponible | 0,0% |

El checkpoint con 250 ejemplos iguala al base en adherencia a especificación (12,0%) pero empeora en robustez (12,6% frente a 23,3%). La model card remite al checkpoint `debudash/qwen3-4b-tz-convert-v3-n12000` como el mejor de la serie. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB y se carga junto al modelo base Qwen3-4B-Instruct-2507.
- VRAM estimada para inferencia del base en FP16: en torno a 8-9 GB; en cuantización de 8 bits, aproximadamente 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones habituales para un modelo de ~4B, no confirmadas en la información disponible).
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para uso individual.
- Cabe en GPU de consumo con al menos 8 GB de VRAM si se usa el base en cuantización de 8 o 4 bits.
- Opciones de despliegue: al ser un adaptador PEFT, puede servirse con vLLM (soporte de LoRA), TGI, transformers + PEFT, o fusionarse con el base y convertirse a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| debudash/qwen3-4b-tz-convert-v1-n250 | ~4B (adaptador LoRA de 0,1 GB) | no disponible | Especialización en timezone con 250 ejemplos | apache-2.0 | Hugging Face |
| debudash/qwen3-4b-tz-convert-v3-n12000 | ~4B (adaptador LoRA) | no disponible | Misma tarea, 12.000 ejemplos; mejor checkpoint del proyecto | apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible | Modelo base generalista instruct | apache-2.0 | Hugging Face |

La comparación relevante es interna al proyecto: el `v1-n250` es el punto de menor datos de la curva, mientras que el `v3-n12000` es el checkpoint recomendado por el autor. Frente al base, el adaptador con 250 ejemplos no mejora la adherencia y empeora la robustez, lo que sugiere que este volumen de datos es insuficiente para la tarea.

## Limitaciones y advertencias

- Rendimiento muy limitado: adherencia a especificación del 12,0% y robustez del 12,6%, por debajo del base en robustez (23,3%). No es adecuado para producción.
- Entrenado solo con 250 ejemplos, lo que probablemente provoca sobreajuste al formato exacto del dataset y escasa generalización.
- Idiomas: únicamente inglés según la etiqueta del modelo; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación en conversiones de zonas horarias no cubiertas por el dataset de entrenamiento.
- El adaptador requiere cargar el modelo base Qwen3-4B-Instruct-2507; no es un modelo autónomo.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del adaptador.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Las métricas reportadas son del propio autor y no han sido verificadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debudash/qwen3-4b-tz-convert-v1-n250
- Checkpoint recomendado del proyecto: https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Código, conjuntos de evaluación e informes: https://huggingface.co/debudash/slm-training
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
