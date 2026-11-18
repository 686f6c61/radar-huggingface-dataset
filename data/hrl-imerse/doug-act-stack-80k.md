# hrl-imerse/doug-act-stack-80k

## Resumen

doug-act-stack-80k es un checkpoint de política robótica basado en ACT (Action Chunking Transformer) desarrollado por el usuario hrl-imerse y publicado en Hugging Face. No es un modelo de lenguaje: es un modelo de control motor entrenado con LeRobot para una tarea concreta de apilamiento de bloques sobre un brazo robótico SO-101 con cámara en la muñeca. El checkpoint corresponde al paso 80.000 de un entrenamiento de 170.000 pasos sobre el dataset `hrl-imerse/doug-stack-98-trimmed` (88 episodios de entrenamiento y 10 de validación).

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware de consumo. Su relevancia es acotada: sirve como referencia práctica de entrenamiento y ajuste de ACT en un entorno físico real con un único brazo, y documenta de forma explícita el resultado de pruebas en brazo real con distintos checkpoints.

La model card es inusualmente honesta sobre el rendimiento: de los cinco checkpoints probados (20k, 60k, 80k, 100k, 170k), solo el de 80.000 pasos colocó correctamente un bloque (el naranja), y falló al siguiente (el verde). El resto no colocó ninguno. Esto lo convierte en un artefacto de investigación más que en un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), chunk_size 100 |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; salida de acciones motoras) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice un chunk de 100 acciones futuras a partir de observaciones (imágenes de la cámara de muñeca y estado del brazo), en lugar de una acción por paso. El modelo se entrenó con batch de 8 sobre el dataset `hrl-imerse/doug-stack-98-trimmed`, con 88 episodios de entrenamiento y 10 de validación, durante 170.000 pasos totales; este repositorio contiene el checkpoint intermedio de 80.000 pasos.

El entrenamiento incluyó aumentación de datos con color jitter y RandomAffine (±5° de rotación, ±5 % de desplazamiento). La pérdida de validación se estabilizó en torno a 0,57 tras 10.000 pasos, sin mejoras sustanciales posteriores. La model card no documenta uso de RLHF, DPO ni otras técnicas de alineación, lo cual es esperable en un modelo de imitación supervisada.

En inferencia, la model card recomienda decodificación con ensamblado temporal (`temporal_ensemble_coeff=0.01`) y `n_action_steps=1`. El autor reporta que la ejecución sin ensamblado (exec 15) resultó "jerky" y claramente peor.

## Capacidades

- Control motor de un brazo SO-101 para tarea de apilamiento de bloques, con observación visual desde cámara de muñeca.
- Predicción de chunks de acción de 100 pasos, lo que permite ejecución con ensamblado temporal.
- Generalización limitada dentro de la distribución del dataset de entrenamiento (88 episodios).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües, de visión general, audio ni generación de texto.
- No dispone de modo "thinking" ni planificación simbólica.

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve como checkpoint de referencia para comparar curvas de entrenamiento de ACT con chunk_size 100 sobre el mismo dataset.
- Estudio del ensamblado temporal en políticas de chunking: permite medir empíricamente la diferencia entre ejecución directa y `temporal_ensemble_coeff=0.01` en un brazo real.
- Base para fine-tuning en tareas de apilamiento con SO-101: al estar entrenado sobre 88 episodios, puede servir de inicialización para datasets propios con la misma morfología.
- Evaluación de aumentación de datos: el uso de color jitter y RandomAffine permite reproducir el efecto de la aumentación en la robustez visual del brazo.
- Docencia y divulgación de robótica de imitación: el modelo y su model card ilustran de forma concreta los problemas reales (fallos de agarre de ~0,5 in, degradación con checkpoints posteriores).
- Análisis de sobreentrenamiento en políticas ligeras: la comparación entre checkpoints 20k/60k/80k/100k/170k documenta que más pasos no implican mejor rendimiento físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo aporta pruebas cualitativas en brazo real:

| Checkpoint | Resultado en brazo real |
|---|---|
| 80k | Colocó el bloque naranja correctamente; falló el verde |
| 20k, 60k, 100k, 170k | 0 bloques colocados |

Condiciones: ensamblado temporal con coeficiente 0,01, una sola prueba por checkpoint, fecha 2026-11-17. Pérdida de validación estabilizada en ~0,57 tras 10.000 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors, el peso en fp32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente (RTX 3050, RTX 4060, etc.).
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: el autor indica ejecución mediante `lerobot-rollout` con `--policy.n_action_steps=1 --policy.temporal_ensemble_coeff=0.01`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints ACT comparables ni datos de modelos alternativos de la misma categoría (por ejemplo, Diffusion Policy o VQ-BeT) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Rendimiento físico muy limitado: solo 1 de 5 checkpoints probados colocó un bloque, y con una única prueba por checkpoint, sin repetibilidad estadística.
- Fallos de agarre documentados de aproximadamente 0,5 in por lado, lo que indica imprecisión en la localización espacial.
- La ejecución sin ensamblado temporal produce movimientos bruscos ("jerky") y peor rendimiento.
- La pérdida de validación se estanca en ~0,57 tras 10.000 pasos, lo que sugiere sobreajuste o techo de la política con 88 episodios.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas (no aplican a un modelo de control motor).
- Específico de la morfología SO-101 con cámara de muñeca; no transferible directamente a otros brazos o configuraciones de sensores.
- Sin garantías de seguridad física: el despliegue en un brazo real requiere supervisión y protocolos de parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrl-imerse/doug-act-stack-80k
- Dataset de entrenamiento: https://huggingface.co/datasets/hrl-imerse/doug-stack-98-trimmed
- LeRobot (framework de entrenamiento y despliegue): no se proporciona enlace en la información disponible
- Paper de ACT (Action Chunking Transformer): no se proporciona enlace en la información disponible
