# Chaenn/smolvla_policy_so101_cube_multitask_sim_0827

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, diseñado para control robótico eficiente en hardware de consumo. Este repositorio concreto, `Chaenn/smolvla_policy_so101_cube_multitask_sim_0827`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario Chaenn, especializado en la tarea de colocación de cubos (pick-and-place) en simulación con el robot SO-101. El modelo se ha entrenado con la librería LeRobot y el dataset `Chaenn/so101_cube_sim_place_0827`.

Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, este modelo representa una alternativa ligera a los VLA masivos, permitiendo su despliegue en GPUs de gama media. Su relevancia radica en la democratización de la robótica de aprendizaje por imitación, ya que cualquier investigador con hardware modesto puede entrenar y evaluar políticas robóticas. La licencia Apache-2.0 facilita su uso tanto académico como comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que parte de un VLM preentrenado a gran escala y lo adapta para generar comandos de control robótico a partir de observaciones visuales y instrucciones en lenguaje natural. El paper original (arXiv:2506.01844) describe una arquitectura compacta y eficiente, pensada para reducir los costes computacionales frente a VLA masivos como OpenVLA o RT-2. Este fine-tuning concreto se ha realizado sobre `lerobot/smolvla_base` utilizando LeRobot, con el dataset `Chaenn/so101_cube_sim_place_0827`, que contiene demostraciones de colocación de cubos en un entorno simulado con el brazo robótico SO-101. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico de bajo nivel: predice acciones articulares (posiciones, velocidades o pares) a partir de imágenes y texto.
- Tarea específica: colocación de cubos (pick-and-place) en simulación con el robot SO-101.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de políticas robóticas de Hugging Face.
- Visión y lenguaje: interpreta instrucciones textuales y observaciones visuales para generar comandos motores.
- Eficiencia computacional: al ser un modelo compacto, puede ejecutarse en hardware de consumo, aunque no se especifican requisitos exactos.

## Casos de uso

- Investigación en aprendizaje por imitación: permite reproducir experimentos de control robótico con un modelo ligero y documentado, ideal para laboratorios con recursos limitados.
- Desarrollo de políticas de manipulación en simulación: se puede utilizar para entrenar y validar algoritmos de pick-and-place antes de transferirlos a un robot real.
- Benchmarking de VLA compactos: sirve como referencia para comparar el rendimiento de SmolVLA frente a otros modelos en tareas de manipulación.
- Educación y prototipado: al ser de código abierto y con licencia permisiva, es adecuado para cursos de robótica o proyectos de fin de grado.
- Transferencia a entornos reales: aunque este modelo es de simulación, el mismo autor publica variantes entrenadas con datos reales, lo que permite estudiar la brecha sim-to-real.
- Integración en pipelines de LeRobot: se puede combinar con el flujo de trabajo estándar de LeRobot para recopilar datos, entrenar y evaluar políticas de forma reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la información disponible. El paper de SmolVLA (arXiv:2506.01844) reporta métricas generales del modelo base, pero no se dispone de datos concretos para esta variante entrenada en la tarea de cubos en simulación.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parámetros y un tamaño de 0,9 GB en safetensors, la inferencia en precisión fp16 requeriría aproximadamente 1 GB de VRAM, aunque no se confirma oficialmente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) debería ser suficiente para inferencia básica.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos del diseño de SmolVLA.
- Opciones de despliegue: LeRobot es la herramienta principal para entrenamiento e inferencia; también podría utilizarse con otros frameworks de inferencia de modelos de acción, aunque no se documentan alternativas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Chaenn/smolvla_policy_so101_cube_multitask_sim_0827 | 450M | no disponible | Pick-and-place en simulación (SO-101) | Apache-2.0 |
| Chaenn/smolvla_policy_so101_cube_multitask_real_0820 | 450M (presumiblemente) | no disponible | Pick-and-place en robot real (SO-101) | Apache-2.0 |
| Chaenn/smolvla_policy_so101_cube_multitask_realsim_0824 | 450M (presumiblemente) | no disponible | Pick-and-place mixto real+simulación | Apache-2.0 |

Los tres modelos comparten la misma base SmolVLA y se diferencian en el dominio de entrenamiento (simulación, real o mixto). No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: puede no transferir correctamente a entornos reales sin fine-tuning adicional con datos reales.
- Tarea muy específica: el modelo está especializado en la colocación de cubos con SO-101; su uso en otras tareas requeriría reentrenamiento.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de acción, no genera texto libre, pero podría producir comandos erróneos si las observaciones son atípicas.
- Datos de contexto y cuantización no documentados: dificulta la planificación de despliegues en entornos con restricciones de memoria.
- Dependencia de LeRobot: el flujo de trabajo está ligado a esta librería, lo que puede limitar su uso en otros stacks robóticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_sim_0827
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Variante con datos reales: https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_real_0820
- Variante mixta real+simulación: https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_realsim_0824
- Proyecto relacionado en GitHub: https://github.com/ktkchh/smolvla-so101-multitask-long-horizon
