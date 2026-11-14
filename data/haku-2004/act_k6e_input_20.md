# Haku-2004/act_k6e_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_k6e_input_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k6_4seg` y publicada en Hugging Face con licencia Apache 2.0. El modelo resuelve el problema del control robótico a partir de demostraciones teleoperadas: dado un conjunto de observaciones visuales y propioceptivas, genera secuencias de comandos motores para un robot seguidor.

La relevancia de ACT radica en su enfoque de chunking temporal, que reduce el error de compounding y mejora la estabilidad frente a políticas paso a paso. Este checkpoint tiene 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de modelos ligeros aptos para inferencia en tiempo real en hardware de consumo. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, entrenado sobre un dataset privado o de propósito específico (`k6_4seg`), por lo que su generalización fuera de ese dominio no está documentada.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card. No hay datos publicados sobre composición del dataset, hiperparámetros de entrenamiento, benchmarks ni evaluación cuantitativa, por lo que muchos campos se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | robotics |
| Tamaño del repositorio | 0,2 GB |
| Dataset de entrenamiento | Haku-2004/k6_4seg |
| Fecha de creación | 2026-11-14 |
| Fecha de actualización | 2026-11-14 |

## Arquitectura y entrenamiento

ACT se basa en un transformer que procesa observaciones (típicamente imágenes de cámaras y estado propioceptivo del robot) y genera chunks de acciones de longitud fija. La innovación principal del método, descrita en el paper arXiv:2304.13705, es la predicción de secuencias de acciones en lugar de pasos individuales, lo que reduce la acumulación de errores y permite un control más suave. El modelo emplea un cuello de botella latente (VAE) para modelar la variabilidad de las demostraciones humanas y un decoder transformer que genera el chunk de acciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset `Haku-2004/k6_4seg`, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El entrenamiento se realizó con LeRobot, la librería de Hugging Face para aprendizaje por imitación, y el comando de entrenamiento está disponible en la model card.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y propioceptivas.
- Aprendizaje a partir de demostraciones teleoperadas: no requiere ingeniería de recompensas ni entorno simulado.
- Predicción de secuencias de acciones (action chunking) para movimientos suaves y estables.
- Integración con LeRobot: entrenamiento, evaluación e inferencia mediante comandos `lerobot-train` y `lerobot-record`.
- Compatible con robots seguidores tipo SO-100 (`so100_follower`) según el ejemplo de la model card.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural.
- No dispone de capacidades multilingües ni de visión general; la visión se limita a la percepción del entorno robótico.
- No dispone de modo "thinking" ni de procesamiento de audio.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar tareas de pick-and-place aprendidas de demostraciones teleoperadas, usando el chunking para suavizar trayectorias y reducir oscilaciones.
- Automatización de tareas repetitivas en entornos controlados: con un robot SO-100 y una cámara, el modelo genera comandos motores para tareas como apilar objetos o insertar piezas, siempre que el dominio coincida con el dataset `k6_4seg`.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT, ajustar hiperparámetros o evaluar técnicas de chunking en un robot de bajo coste.
- Prototipado rápido de políticas robóticas: al ser un modelo ligero (51,7 M de parámetros, 0,2 GB), permite iterar en estaciones de trabajo con GPU de consumo y desplegar en el robot sin infraestructura pesada.
- Evaluación de robustez frente a variaciones de iluminación o posición: útil para estudiar la generalización de ACT en tareas de manipulación con datos limitados.
- Educación y docencia en robótica: el flujo LeRobot (entrenar, grabar, evaluar) facilita prácticas de aprendizaje por imitación con hardware asequible.
- Despliegue en el borde (edge): el tamaño reducido permite ejecutar inferencia en un ordenador conectado al robot, sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros en safetensors (probablemente fp32), la inferencia requiere menos de 1 GB de VRAM; con cuantización a fp16 o int8, aún menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se recomiendan RTX 3060, RTX 4060, RTX 4090, A100 o H100 para entrenamiento o evaluación a mayor escala.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con el robot SO-100; no se documentan otros runners como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Al ser un transformer pequeño, se espera latencia de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k6e_input_20` (este) | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (paper) | no disponible | no disponible | éxito alto en tareas de manipulación (según paper) | no disponible | paper arXiv |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | implementaciones varias |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible | implementaciones varias |

No se dispone de datos cuantitativos para comparar rendimiento entre estos modelos en el mismo entorno. La comparativa se limita a la categoría (políticas de imitación para robótica) y a la licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con un dataset específico (`k6_4seg`), la política puede sobreajustarse a las condiciones de ese dataset (iluminación, posiciones, objetos).
- Riesgo de alucinación: no aplica en el sentido de lenguaje natural, pero sí puede generar acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje; la "ventana de contexto" no está definida y no hay soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; el dataset de entrenamiento puede tener sus propias restricciones no indicadas.
- Caveat para producción: cero descargas y cero likes indican que el modelo no ha sido validado por la comunidad; no hay evaluación pública de éxito en tareas reales. El repositorio se creó y actualizó el mismo día, lo que sugiere un checkpoint de prueba.
- El modelo está diseñado para un robot concreto (SO-100 seguidor) y un dataset concreto; su uso en otro hardware o tarea requerirá reentrenamiento o fine-tuning.
- No se documentan medidas de seguridad física; en aplicaciones reales debe implementarse un sistema de parada de emergencia y límites de movimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6e_input_20
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
