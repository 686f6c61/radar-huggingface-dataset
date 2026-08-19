# laion/tt-x3_kl-kl0b-72-30B

## Resumen

El modelo `laion/tt-x3_kl-kl0b-72-30B` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) mediante GRPO, publicado por LAION como parte del barrido X3 sobre el coeficiente KL. Parte del modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct` y se entrena sobre el dataset `DCAgent/exp_rpt_multifile` con el stack SkyRL + Terminus-2, utilizando un verifier basado en *pass_ratio shaping*. El checkpoint corresponde al paso 72 de 80, y el entrenamiento fue detenido por el propietario en el paso 73, por lo que no representa un resultado de convergencia final.

Se trata de un modelo de arquitectura MoE (mixture of experts) con 30.532.122.624 parámetros totales y aproximadamente 3.000 millones de parámetros activos (derivados del nombre del modelo base, que indica A3B). Está orientado a tareas de generación de código y edición multifile, y su publicación tiene un carácter eminentemente experimental: documenta un punto concreto de un barrido de hiperparámetros, no un modelo listo para producción. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (mixture of experts) |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | 3 B (estimado del modelo base Qwen3-Coder-30B-A3B-Instruct, no confirmado en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por RL del checkpoint `Qwen/Qwen3-Coder-30B-A3B-Instruct`, que emplea una arquitectura MoE con 30,5 B parámetros totales y 3 B activos. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) utilizando SkyRL y Terminus-2 como infraestructura, sobre el dataset `DCAgent/exp_rpt_multifile`, que contiene tareas de edición y reporte de código en múltiples archivos. El verifier empleado es *pass_ratio shaping*, que mide la proporción de pruebas superadas en cada grupo de respuestas.

El experimento pertenece al barrido X3 sobre el coeficiente KL, y el nombre `kl-kl0b` sugiere un coeficiente KL de valor 0 (aunque no se especifica explícitamente en la documentación). Los brazos con coeficiente KL distinto de cero incorporan un modelo de referencia adicional. El checkpoint fue seleccionado como el mejor retenido según la EMA de los últimos 5 pasos (EMA 0,1530 en el paso 72, con recompensa de paso 0,1484 y pass@8 de 0,3125). El entrenamiento se detuvo en el paso 73 de 80, y el proceso de exportación a HuggingFace sufrió un error en el hook de exportación, por lo que solo existe este checkpoint convertido post-hoc.

## Capacidades

- Generación de código y edición multifile: el dataset de entrenamiento (`exp_rpt_multifile`) indica que el modelo fue optimizado para tareas que requieren modificar o generar código en varios archivos de forma coordinada.
- Razonamiento paso a paso: al derivar de Qwen3-Coder-Instruct, hereda la capacidad de generar explicaciones y razonamiento intermedio, aunque no se ha verificado específicamente en este checkpoint.
- Tool calling y function calling: no hay documentación específica para este checkpoint, pero el modelo base Qwen3-Coder-Instruct soporta estas capacidades; no se puede confirmar que se hayan preservado tras el RL.
- Capacidades multilingües: no disponible.
- Modo thinking: el modelo base Qwen3-Coder-Instruct incluye un modo de razonamiento explícito, pero no se ha documentado su comportamiento en este checkpoint.

## Casos de uso

- Investigación en RL para código: el checkpoint sirve como punto de comparación en el estudio del efecto del coeficiente KL sobre la estabilidad y el rendimiento del entrenamiento GRPO en tareas de edición de código.
- Reproducción de experimentos: los logs de entrenamiento incluidos (`training_logs/`) permiten reproducir o analizar el comportamiento del RL en el paso 72, útil para investigadores que estudian dinámicas de recompensa y regularización KL.
- Análisis de métricas de verificación: el valor pass@8 de 0,3125 puede usarse como referencia para calibrar verifiers en pipelines de RL para generación de código.
- Evaluación de checkpoints intermedios: permite estudiar cómo evoluciona el rendimiento a lo largo del entrenamiento, comparando con otros checkpoints del barrido (por ejemplo, `kl0p03`).
- Desarrollo de agentes de edición de código: aunque no está validado para producción, el modelo podría explorarse como base para un agente que modifica múltiples archivos, dado el dataset de entrenamiento.
- Benchmarking de infraestructura RL: el checkpoint puede utilizarse para probar stacks de RL (SkyRL, Terminus-2) en tareas de código, midiendo throughput y estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La única métrica reportada es interna del entrenamiento: pass@8 de 0,3125 en el paso 72, con recompensa de paso 0,1484 y EMA de 0,1530. No hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un MoE con 30,5 B parámetros totales y 3 B activos, los pesos completos en FP16 ocupan aproximadamente 61 GB, lo que requiere una GPU profesional (A100 80GB, H100) o varias GPUs. Con cuantización a 4 bits, el modelo podría reducirse a unos 15-16 GB, lo que permitiría ejecutarlo en una RTX 4090 (24 GB), pero no hay cuantizaciones publicadas ni confirmación de compatibilidad.
- GPU recomendadas: A100 80GB, H100 80GB, o un nodo con múltiples GPUs para cargar los pesos completos. Para experimentación con cuantización, una RTX 4090 o similar podría ser suficiente si se generan los GGUF correspondientes.
- Despliegue: al no existir formatos GGUF ni integraciones oficiales, el despliegue requeriría usar el formato safetensors con librerías como Transformers o vLLM. No se han publicado configuraciones de despliegue.
- Latencia y throughput: no disponibles. Al ser un MoE con solo 3 B activos, la latencia por token sería relativamente baja en comparación con un modelo denso de 30 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `laion/tt-x3_kl-kl0b-72-30B` | 30,5 B | 3 B | no disponible | Apache 2.0 | Checkpoint experimental de RL |
| `Qwen/Qwen3-Coder-30B-A3B-Instruct` | 30,5 B | 3 B | 32 K (según ficha oficial) | Apache 2.0 | Modelo base, instruct sin RL |
| `laion/tt-x3_kl-kl0p03-70-30B` | 30,5 B | 3 B | no disponible | Apache 2.0 | Otro checkpoint del mismo barrido, con KL=0.03 |

No hay datos de rendimiento comparativo entre estos modelos. El checkpoint `kl0b` es el brazo con coeficiente KL aparentemente nulo, mientras que `kl0p03` usa un coeficiente de 0,03; ambos son puntos intermedios de un mismo experimento.

## Limitaciones y advertencias

- Checkpoint experimental: no es un modelo final ni validado para producción. El entrenamiento se detuvo en el paso 73 de 80, por lo que los resultados pueden no reflejar el rendimiento óptimo.
- Sin evaluación independiente: no se han publicado benchmarks estándar ni evaluaciones de sesgos, toxicidad o robustez.
- Posibles artefactos del RL: el uso de GRPO con verifier de pass_ratio puede inducir sobreoptimización hacia las recompensas del verifier, con riesgo de alucinaciones o código que pasa pruebas sintéticas pero falla en entornos reales.
- Problemas de exportación: el hook de exportación a HuggingFace falló en el origen, y el checkpoint se convirtió post-hoc; podría haber discrepancias menores entre los pesos originales y los publicados.
- Sin documentación de idiomas: no se especifica qué idiomas soporta, aunque el modelo base es principalmente inglés y chino.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin garantías, se recomienda validación exhaustiva antes de cualquier uso en producción.
- Falta de cuantizaciones: no se proporcionan versiones GGUF ni AWQ, lo que limita su despliegue en entornos con recursos reducidos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/laion/tt-x3_kl-kl0b-72-30B)
- [Checkpoint hermano con KL=0.03](https://huggingface.co/laion/tt-x3_kl-kl0p03-70-30B)
- [Modelo base Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
- [Dataset de entrenamiento DCAgent/exp_rpt_multifile](https://huggingface.co/datasets/DCAgent/exp_rpt_multifile)
- [Traces de entrenamiento (submuestreo sistemático)](https://huggingface.co/datasets/penfever/tt-x3_kl-kl0b)
- [LAION](https://laion.ai/)
