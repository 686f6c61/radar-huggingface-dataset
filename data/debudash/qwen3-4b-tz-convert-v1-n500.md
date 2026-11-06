# debudash/qwen3-4b-tz-convert-v1-n500

## Resumen

`qwen3-4b-tz-convert-v1-n500` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `debudash`. Forma parte del proyecto `tz-convert`, cuyo objetivo es especializar un modelo de lenguaje pequeño en la conversión y el razonamiento sobre zonas horarias. Este checkpoint concreto representa un punto intermedio en la curva de eficiencia de datos: se ha entrenado únicamente con los primeros 500 ejemplos de la mezcla `v1` del dataset `debudash/tz-convert-sft`, manteniendo los mismos hiperparámetros que el resto de checkpoints de la serie.

El modelo no es un modelo autónomo, sino un adaptador PEFT que debe cargarse junto al modelo base Qwen3-4B-Instruct-2507. Su relevancia es fundamentalmente metodológica: permite estudiar cómo evoluciona la adherencia a especificaciones y la robustez de un modelo fine-tuneado a medida que se incrementa el volumen de datos de entrenamiento. El checkpoint de referencia de la serie es `debudash/qwen3-4b-tz-convert-v3-n12000`, entrenado con 12.000 ejemplos.

La información pública disponible es muy limitada: no se detallan hiperparámetros concretos, composición exacta del dataset ni resultados de benchmarks estándar. La model card reporta únicamente métricas internas del proyecto (spec-adherence y robustness) sobre conjuntos de evaluación propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only (Qwen3-4B-Instruct-2507) |
| Parametros totales | No disponible (adaptador PEFT; el modelo base Qwen3-4B-Instruct-2507 tiene 4.000 millones según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización aplica al modelo base al cargarlo) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de la familia Qwen3 en su variante Instruct de julio de 2025. El adaptador modifica los pesos del modelo base mediante matrices de bajo rango, lo que permite un ajuste eficiente en memoria sin alterar la arquitectura subyacente.

El entrenamiento utiliza los primeros 500 ejemplos de la mezcla `v1` del dataset `debudash/tz-convert-sft`. La model card indica que se emplean los mismos hiperparámetros que en el resto de checkpoints de la serie, pero no se especifican valores concretos (rango LoRA, alpha, learning rate, épocas, etc.). Tampoco se detalla la composición del dataset ni si hubo fases de RLHF o DPO. El commit de entrenamiento reportado es `b5591ba67570d1b1fbd08c3d24a60ef405cf8a4e`.

## Capacidades

- Generación de texto conversacional orientada a la conversión y el razonamiento sobre zonas horarias.
- Especialización en tareas de `tz-convert`: interpretación de especificaciones de conversión horaria y aplicación de las mismas.
- Adherencia a especificaciones (spec-adherence) medida internamente en un 14,0 % en este checkpoint.
- Robustez ante entradas variables medida internamente en un 24,3 %.
- Capacidad de mantener conversaciones multi-turno (métrica de drift reportada como "–" para este checkpoint, es decir, sin datos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de curvas de eficiencia de datos: este checkpoint sirve como punto de referencia para estudiar cómo varía la calidad de un fine-tuning especializado con solo 500 ejemplos frente a checkpoints con 12.000, permitiendo decidir el volumen mínimo viable de datos para una tarea concreta.
- Investigación sobre adherencia a especificaciones: útil para analizar qué porcentaje de respuestas cumple estrictamente el formato y las reglas de conversión horaria solicitadas, y cómo mejora con más datos.
- Prototipado rápido de asistentes de conversión horaria: al ser un adaptador ligero (0,1 GB), puede cargarse junto al modelo base en entornos de desarrollo para validar la viabilidad de un asistente especializado antes de invertir en un entrenamiento mayor.
- Análisis de robustez ante entradas ruidosas o ambiguas: la métrica de robustness (24,3 %) permite comparar la resistencia del adaptador a variaciones en la formulación de la petición frente a otros checkpoints de la serie.
- Estudio de drift conversacional: aunque este checkpoint no reporta datos de drift, forma parte de una serie que sí los mide, por lo que puede usarse en experimentos comparativos sobre degradación en conversaciones largas.
- Base para experimentos de ablation: al compartir hiperparámetros con el resto de la serie, permite aislar el efecto del tamaño del dataset en el rendimiento final, sin confundir con cambios en la configuración de entrenamiento.
- Docencia y divulgación sobre QLoRA: su reducido tamaño y su naturaleza de adaptador lo hacen adecuado para demostrar el flujo completo de carga de un adaptador PEFT sobre un modelo base y su evaluación con métricas personalizadas.

## Benchmarks y rendimiento

La model card reporta métricas internas del proyecto, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este checkpoint (n500) | Modelo base con prompt completo | Mejor checkpoint (v3-n12000) |
|---|---|---|---|
| Spec-adherence | 14,0 % | 12,0 % | No disponible en la informacion proporcionada |
| Robustness | 24,3 % | 23,3 % | No disponible en la informacion proporcionada |
| Drift (conversaciones mantenidas) | – (sin datos) | 0,0 % | No disponible en la informacion proporcionada |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Qwen3-4B-Instruct-2507 y de su cuantización. Un modelo de 4.000 millones de parámetros en FP16 requiere aproximadamente 8 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo base, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100) permitiría inferencia en FP16 con margen; GPUs de 8-12 GB requerirían cuantización del modelo base.
- Compatibilidad con GPU de consumo: probable en GPUs de consumo con cuantización del modelo base (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no se confirma en la información proporcionada.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT; para servir el modelo combinado se podría usar vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertirlo al formato adecuado. No se detalla en la model card.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `debudash/qwen3-4b-tz-convert-v1-n500` (este) | Adaptador sobre 4B | No disponible | Conversión de zonas horarias, 500 ejemplos | Apache 2.0 | Hugging Face |
| `debudash/qwen3-4b-tz-convert-v3-n12000` | Adaptador sobre 4B | No disponible | Conversión de zonas horarias, 12.000 ejemplos | Apache 2.0 | Hugging Face |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | No disponible | Modelo generalista instruct | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables (benchmarks estándar) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado con solo 500 ejemplos: la adherencia a especificaciones (14,0 %) y la robustez (24,3 %) son bajas en términos absolutos, lo que sugiere un rendimiento limitado en producción sin un entrenamiento adicional.
- Especialización estrecha: el adaptador está diseñado para tareas de conversión de zonas horarias; su uso fuera de ese dominio puede degradar el comportamiento del modelo base.
- Idioma: la model card declara únicamente inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: no se reportan evaluaciones específicas de alucinación; en tareas de conversión horaria, una respuesta incorrecta puede tener consecuencias prácticas (por ejemplo, en programación de reuniones o sistemas de scheduling).
- Datos de drift no reportados para este checkpoint: se desconoce su comportamiento en conversaciones multi-turno largas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia que debe verificarse por separado.
- Falta de transparencia: no se detallan hiperparámetros, composición del dataset ni metodología de evaluación, lo que dificulta la reproducibilidad.
- No es un modelo autónomo: requiere cargar el modelo base, lo que añade complejidad de despliegue y requisitos de hardware asociados al modelo de 4B.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/debudash/qwen3-4b-tz-convert-v1-n500
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/debudash/tz-convert-sft
- Checkpoint de referencia (mejor de la serie): https://huggingface.co/debudash/qwen3-4b-tz-convert-v3-n12000
- Repositorio del proyecto (código, eval sets y reports): https://huggingface.co/debudash/slm-training
