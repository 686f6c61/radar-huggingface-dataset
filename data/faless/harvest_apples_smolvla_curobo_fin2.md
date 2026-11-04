# Faless/harvest_apples_smolvla_curobo_fin2

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico de bajo coste computacional. Esta ficha concreta, `Faless/harvest_apples_smolvla_curobo_fin2`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` orientado a una tarea específica: la recolección de manzanas mediante un brazo robótico Piper, entrenado sobre el dataset `Faless/piper-apple-curobo-1M-v2` y con simulación física gestionada mediante cuRobo.

El modelo resuelve el problema de llevar políticas VLA a hardware de consumo: con aproximadamente 450 millones de parámetros, es viable ejecutar inferencia en GPUs de gama media, algo impracticable con modelos VLA de miles de millones de parámetros. La arquitectura combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones que produce comandos motores directamente a partir de observaciones visuales e instrucciones en lenguaje natural.

Es relevante para investigadores y desarrolladores de robótica que necesitan prototipar pipelines de imitación de extremo a extremo con LeRobot sin depender de clústeres de GPU. La licencia Apache 2.0 facilita su uso comercial y su modificación, aunque el alcance práctico del checkpoint está acotado a la tarea y el robot concretos con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA compacta (SmolVLA): codificador visual + modelo de lenguaje + cabezal de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | Faless/piper-apple-curobo-1M-v2 |
| Tamano del repositorio | 2,7 GB |
| Pipeline | robotics |
| Descargas | 9 |
| Fecha de creacion | 2026-06-09 |
| Ultima actualizacion | 2026-11-04 |

## Arquitectura y entrenamiento

SmolVLA es una política de visión-lenguaje-acción que fusiona percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motrices en un único modelo. La arquitectura parte del checkpoint `lerobot/smolvla_base` y se ha afinado mediante aprendizaje por imitación sobre el dataset `Faless/piper-apple-curobo-1M-v2`, que combina demostraciones de recolección de manzanas con un brazo Piper y simulación física basada en cuRobo (planificación y control cinemático). El nombre del dataset sugiere aproximadamente un millón de muestras o pasos, aunque este dato no está confirmado en la información disponible.

No se dispone de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; en el contexto VLA, el paradigma habitual es el aprendizaje supervisado por imitación a partir de demostraciones teleoperadas. Tampoco se documentan innovaciones específicas de decodificación o atención en esta ficha. El tamaño de 450 millones de parámetros y el formato safetensors indican un diseño orientado a inferencia ligera y despliegue en hardware de consumo, coherente con la filosofía de la familia SmolVLA.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural.
- Control de un brazo robótico Piper para tareas de recolección de manzanas.
- Aprendizaje por imitación de extremo a extremo (visión a acción) sin planificación explícita en tiempo de inferencia.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- Ejecución en hardware de consumo gracias a su tamaño compacto.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de propósito general; el modelo emite políticas de acción, no razonamiento simbólico.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: no se documentan modos de pensamiento, visión general, audio ni otras modalidades fuera de la política visomotora.

## Casos de uso

- Recolección automatizada de fruta en entornos controlados: el modelo genera comandos motores para un brazo Piper a partir de imágenes de la escena, adecuado para líneas de manipulación repetitivas donde el checkpoint fue entrenado.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia funcional para validar el flujo `lerobot-train` / `lerobot-record` antes de escalar a datasets propios.
- Investigación en VLA de bajo coste: permite experimentar con políticas visomotoras en una única GPU de gama media, facilitando la reproducibilidad académica.
- Evaluación de simulación a realidad (sim2real): al haberse entrenado con cuRobo, es un punto de partida para estudiar la transferencia de políticas simuladas a un brazo físico.
- Benchmarking de políticas compactas: útil como línea base de 450 millones de parámetros frente a VLA de mayor tamaño en tareas de manipulación.
- Educación y divulgación en robótica: su tamaño y licencia permisiva permiten usarlo en cursos y talleres con hardware asequible.
- Automatización de tareas agrícolas de laboratorio: recolección de manzanas en configuraciones experimentales para medir tasas de éxito y tiempos de ciclo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en fp32 los pesos ocupan aproximadamente 1,8 GB, y en fp16 alrededor de 0,9 GB, a lo que hay que sumar el estado del codificador visual y los buffers de inferencia.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, RTX 3090 o A100 son holgadas, y una RTX 4060 Ti de 16 GB debería ser suficiente en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM en fp16, aunque no hay cifras oficiales confirmadas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de CUDA mediante `--policy.device=cuda`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faless/harvest_apples_smolvla_curobo_fin2 | 450 M | no disponible | Recolección de manzanas con brazo Piper | Apache 2.0 | Hugging Face (9 descargas) |
| lerobot/smolvla_base | no disponible | no disponible | VLA generalista de base | no disponible en la informacion | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación visomotora | no disponible en la informacion | Hugging Face / LeRobot |
| VLA de gran escala (p. ej. familias de varios miles de millones de parámetros) | varios miles de millones | no disponible | Manipulación generalista | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de parámetros y contexto de los modelos comparables no se detallan en las fuentes consultadas.

## Limitaciones y advertencias

- El checkpoint está especializado en una única tarea (recolección de manzanas) y un único robot (Piper); su rendimiento fuera de ese dominio no está garantizado.
- El dataset de entrenamiento incluye simulación con cuRobo, por lo que puede existir una brecha sim2real no cuantificada.
- No se documentan sesgos conocidos, pero al ser un modelo visomotor entrenado con datos limitados puede fallar ante condiciones de iluminación, oclusión o variedad de objetos distintas a las del dataset.
- Riesgo de alucinación: en el contexto de políticas de acción, se traduce en comandos motores erráticos o inseguros ante escenas fuera de distribución; requiere salvaguardas físicas en producción.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El número reducido de descargas (9) y la ausencia de benchmarks publicados limitan la evidencia sobre su robustez.
- No se especifican requisitos de hardware oficiales ni cifras de latencia, lo que dificulta planificar despliegues en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/harvest_apples_smolvla_curobo_fin2
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper-apple-curobo-1M-v2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
