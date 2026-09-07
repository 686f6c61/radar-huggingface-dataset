# jogarulfop/policy_2026-09-03_shake4it_bench_5sensors_v3_pastille_pzt_10kHz_nfft_512

## Resumen

El modelo `jogarulfop/policy_2026-09-03_shake4it_bench_5sensors_v3_pastille_pzt_10kHz_nfft_512` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario `jogarulfop` utilizando la librería LeRobot de Hugging Face y entrenado sobre un dataset de demostraciones teleoperadas en un entorno de banco de pruebas denominado `shake4it_bench`, con cinco sensores y señales muestreadas a 10 kHz. El modelo está pensado para controlar un robot seguidor (tipo SO-100) en tareas de manipulación física, y publica un checkpoint de 51.668.614 parámetros en formato safetensors, bajo licencia Apache 2.0.

Este modelo es relevante porque ejemplifica el uso de ACT en contextos de robótica con sensores de alta frecuencia (10 kHz), donde la estrategia de "action chunking" permite generar movimientos suaves y coherentes a partir de demostraciones. Al estar integrado con LeRobot, ofrece un flujo de trabajo estándar para entrenar, evaluar y desplegar políticas de imitación en robots reales, con herramientas de código abierto y documentación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Action Chunking with Transformers (ACT), una arquitectura de aprendizaje por imitación presentada en el paper `arxiv:2304.13705`. A diferencia de los enfoques que predicen una única acción por paso de tiempo, ACT predice un "chunk" de acciones futuras, lo que reduce el error acumulado y produce movimientos más suaves. El entrenamiento se realiza sobre datos teleoperados, capturados en un entorno de banco de pruebas con cinco sensores. La política ha sido entrenada y subida al Hub mediante la librería LeRobot de Hugging Face, que proporciona el pipeline completo de entrenamiento, evaluación y registro de episodios.

El dataset asociado es `jogarulfop/2026-09-03_shake4it_bench_5sensors_v3_pastille_pzt_10kHz_nfft_512`, que incorpora señales de un sensor piezoeléctrico (pastille_pzt) muestreadas a 10 kHz con un tamaño de ventana FFT de 512. El entrenamiento incluye demostraciones teleoperadas de la tarea, sin que se especifiquen en la información disponible técnicas de ajuste fino adicionales como RLHF o DPO. No se han publicado detalles sobre el número total de tokens, la composición exacta del dataset ni las innovaciones técnicas adicionales más allá del propio método ACT.

## Capacidades

- Genera secuencias de acciones (action chunks) para controlar un robot en tareas de manipulación física.
- Aprende directamente de demostraciones teleoperadas, sin necesidad de un modelo de dinámica explícito.
- Procesa entradas de sensores de alta frecuencia (señales a 10 kHz con nfft 512) para inferir comandos de movimiento.
- Es compatible con el framework LeRobot, incluyendo flujos de entrenamiento (`lerobot-train`) y evaluación mediante teleoperación (`lerobot-record`).
- Funciona como política de control para robots follower de tipo SO-100.
- No soporta tool calling, agentes conversacionales ni generación de texto; su ámbito es estrictamente el control robótico.

## Casos de uso

- Control de un brazo robótico en tareas de manipulación sobre un banco de pruebas: el modelo se integra en un robot SO-100 y ejecuta los movimientos aprendidos a partir de demostraciones teleoperadas, permitiendo repetir la tarea con variaciones.
- Ensayos de laboratorio con sensores piezoeléctricos: gracias a su capacidad para procesar señales de sensores a 10 kHz, la política puede usarse en entornos donde la respuesta del robot depende de vibraciones o señales de alta frecuencia.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar políticas ACT entrenadas con diferentes configuraciones de sensores o frecuencias de muestreo, especialmente dentro del ecosistema LeRobot.
- Evaluación de controladores en tareas "shake" o agitación: el modelo está entrenado para una tarea concreta de banco de pruebas, por lo que puede desplegarse para validar la robustez de la política ante perturbaciones físicas.
- Prototipado rápido de políticas robóticas: al utilizar LeRobot, el checkpoint puede cargarse directamente con `--policy.path` para ejecutar evaluaciones en un robot real sin reentrenar desde cero.
- Replicación de experimentos en robótica: investigadores pueden reproducir el pipeline completo (dataset, entrenamiento y evaluación) con los comandos proporcionados en la model card, lo que facilita la verificación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como éxito en la tarea, precisión de los chunks o comparativas con otros modelos en el contexto del `shake4it_bench`.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Dado que el modelo tiene 51.668.614 parámetros, es un checkpoint ligero, pero no se dispone de cifras oficiales de consumo.
- GPU recomendadas: no disponible. Los comandos de la model card indican que se puede especificar `--policy.device=cuda`, por lo que se requiere una GPU compatible con CUDA para la evaluación.
- Compatibilidad con GPUs de consumo: no se dispone de datos concretos, aunque por el tamaño del modelo es plausible que funcione en GPUs de gama media.
- Opciones de despliegue: el modelo está integrado en LeRobot y puede utilizarse con las herramientas `lerobot-train` y `lerobot-record`. También puede cargarse desde el Hub mediante `--policy.path`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Dataset | Licencia |
|---|---|---|---|---|
| `jogarulfop/policy_2026-09-03_shake4it_bench_5sensors_v3_pastille_pzt_10kHz_nfft_512` | 51.668.614 | ACT | `shake4it_bench_5sensors_v3_pastille_pzt_10kHz_nfft_512` | Apache 2.0 |
| `jogarulfop/policy_2026-09-03_shake4it_bench_5sensors_v3_dgf_passif_10kHz_nfft_512` | no disponible | ACT | `shake4it_bench_5sensors_v3_dgf_passif_10kHz_nfft_512` | Apache 2.0 |
| `jogarulfop/policy_2026-09-03_shake4it_bench_5sensors_v3_strain_gauge_10kHz_nfft_512` | no disponible | ACT | `shake4it_bench_5sensors_v3_strain_gauge_10kHz_nfft_512` | Apache 2.0 |

Las variantes comparadas pertenecen al mismo autor y framework, pero se diferencian en el tipo de sensor utilizado (piezoeléctrico, pasivo, galga extensiométrica). No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Es un modelo especializado: solo puede ejecutar la tarea concreta para la que fue entrenado, con el tipo de sensor y la configuración de muestreo específica del dataset. No es un modelo generalista ni un LLM.
- Riesgo de sobreajuste al dataset de entrenamiento: al tratarse de aprendizaje por imitación, el rendimiento puede degradarse ante variaciones no presentes en las demostraciones.
- Sesgos inherentes a los datos teleoperados: la política refleja las demostraciones del operador humano, incluyendo posibles hábitos o imperfecciones.
- Predicciones (o alucinaciones de acciones) incorrectas en situaciones fuera de distribución, lo que puede provocar movimientos no deseados si no se implementan barreras de seguridad.
- No soporta generación de texto, razonamiento simbólico ni tareas de lenguaje; cualquier intento de usarlo como modelo conversacional fallará.
- No se especifican restricciones de licencia para uso comercial; la licencia Apache 2.0 es permisiva, pero los datos de entrenamiento podrían tener condiciones adicionales no documentadas aquí.
- No hay datos de benchmarks, por lo que su rendimiento relativo frente a otros modelos es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jogarulfop/policy_2026-09-03_shake4it_bench_5sensors_v3_pastille_pzt_10kHz_nfft_512
- Dataset asociado: https://huggingface.co/datasets/jogarulfop/2026-09-03_shake4it_bench_5sensors_v3_pastille_pzt_10kHz_nfft_512
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo comparable (dgf_passif): https://huggingface.co/jogarulfop/policy_2026-09-03_shake4it_bench_5sensors_v3_dgf_passif_10kHz_nfft_512
- Modelo comparable (strain_gauge): https://huggingface.co/jogarulfop/policy_2026-09-03_shake4it_bench_5sensors_v3_strain_gauge_10kHz_nfft_512
