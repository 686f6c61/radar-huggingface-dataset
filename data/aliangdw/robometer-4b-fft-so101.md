# aliangdw/robometer-4b-fft-so101

## Resumen

Robometer-4B FFT so101 es un fine-tuning completo (sin LoRA) del modelo Robometer-4B, un reward model basado en Qwen3-VL-4B-Instruct. El autor, aliangdw, lo ha entrenado sobre dos conjuntos de datos de evaluación de acciones robóticas en el espacio SO(101): Armnet benchmark so101 y MolmoACT2 so101. El objetivo es mejorar la generalización del reward model frente a entrenamientos con un solo dataset, y los resultados publicados muestran una mejora significativa en la alineación de recompensas para el conjunto MolmoACT2 (Pearson de 0.751 a 0.902) manteniendo un rendimiento similar en Armnet.

El modelo tiene 4.447.004.940 parámetros, se distribuye en formato safetensors y se publica bajo licencia Apache 2.0. Al estar basado en Qwen3-VL, hereda capacidades multimodales (visión y lenguaje), aunque su uso principal es como reward model para evaluar trayectorias o políticas robóticas. El entrenamiento se realizó durante 1500 pasos en 4 GPUs H200, seleccionando el checkpoint del paso 750 como el mejor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B-Instruct (backbone) + cabezal de recompensa |
| Parametros totales | 4.447.004.940 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal con componentes de visión y lenguaje. Sobre esta base se realiza un fine-tuning completo (FFT) para convertirlo en un reward model (RBM). El entrenamiento se lleva a cabo sobre dos datasets de evaluación de acciones robóticas en el espacio SO(101): Armnet benchmark so101 y MolmoACT2 so101. Se emplean 1500 pasos de entrenamiento en 4 GPUs H200, y se selecciona el checkpoint del paso 750 como el de mejor rendimiento. No se menciona el uso de RLHF o DPO; el modelo se entrena directamente como reward model, probablemente con una pérdida de regresión o ranking sobre las recompensas humanas.

## Capacidades

- Reward model para evaluar trayectorias y políticas robóticas en el espacio SO(101).
- Capacidades multimodales heredadas de Qwen3-VL: comprensión de imágenes y texto, generación de texto.
- Razonamiento y generación de texto en general, aunque su uso principal es la puntuación de recompensas.
- No se documenta soporte explícito para tool calling, agentes o multi-step reasoning en esta variante.
- Capacidades multilingües no especificadas; se asume herencia de Qwen3-VL, pero no confirmado.

## Casos de uso

- Evaluación de políticas robóticas: el modelo puntúa trayectorias o acciones generadas por un agente, proporcionando una señal de recompensa para entrenamiento por refuerzo.
- Benchmarking de agentes robóticos: permite comparar el rendimiento de diferentes políticas en tareas del espacio SO(101) usando una métrica de alineación con recompensas humanas.
- Selección de modelos: como reward model, puede usarse para filtrar o clasificar candidatos generados por otros modelos en tareas de manipulación robótica.
- Fine-tuning posterior: al ser un modelo abierto (Apache 2.0), puede servir como punto de partida para adaptaciones a dominios específicos.
- Investigación en reward modeling: útil para estudiar la generalización entre datasets de recompensa y la transferencia entre tareas robóticas.
- Integración en pipelines de aprendizaje por refuerzo: puede conectarse a frameworks como RLlib o Stable-Baselines3 para proporcionar recompensas densas.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados comparando el fine-tuning solo con Armnet y el fine-tuning con ambos datasets (este modelo):

| Metrica | Armnet-only finetune | Este modelo (both so101) |
|---|---|---|
| Armnet so101 reward-alignment Pearson | 0.766 | 0.782 |
| Armnet so101 policy-ranking Kendall | 0.973 | 0.94 |
| Molmoact so101 reward-alignment Pearson (held-out) | 0.751 | 0.902 |

No se proporcionan benchmarks adicionales (MMLU, HumanEval, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPUs recomendadas.
- Con 4.4 mil millones de parámetros, el modelo en precisión FP16 ocupa aproximadamente 8.9 GB (tamaño del repositorio). En cuantización de 4 bits cabría en GPUs consumer como RTX 3090 o RTX 4090, pero no se confirma disponibilidad de cuantizaciones.
- El entrenamiento se realizó en 4x H200 (GPU de alta gama), lo que sugiere que la inferencia es viable en una sola GPU de gama alta o media con suficiente VRAM.
- Opciones de despliegue: al ser un modelo transformers, puede usarse con la librería transformers de HuggingFace, y potencialmente con vLLM o TGI si se adapta, aunque no se menciona compatibilidad explícita.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Robometer-4B (sin fine-tuning en so101) sería el comparador natural, pero no se ofrecen sus especificaciones ni resultados en la model card. Tampoco hay datos de otros reward models para robótica.

## Limitaciones y advertencias

- Modelo de investigación: no se garantiza su rendimiento en entornos de producción sin validación adicional.
- Sesgos potenciales derivados de los datos de entrenamiento (Armnet y MolmoACT2), que pueden no representar todas las tareas robóticas.
- Riesgo de alucinación en tareas de razonamiento o generación de texto, como cualquier modelo basado en transformers.
- No se especifican limitaciones de contexto o idioma; se asume herencia de Qwen3-VL, pero no confirmado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de los datasets subyacentes (Armnet, MolmoACT2) para posibles restricciones.
- El modelo está especializado en el espacio SO(101); su uso fuera de ese dominio puede degradar el rendimiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/aliangdw/robometer-4b-fft-so101)
- [Robometer-4B (modelo base)](https://huggingface.co/robometer/Robometer-4B)
- [Qwen3-VL-4B-Instruct (backbone)](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct)
