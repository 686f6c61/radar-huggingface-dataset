# Chaenn/smolvla_policy_so101_cube_multitask_simreal_0826

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, descrito en el artículo arXiv 2506.01844. Su objetivo es ofrecer un control robótico competitivo a un coste computacional reducido, permitiendo su despliegue en hardware de consumo. Este repositorio concreto, `Chaenn/smolvla_policy_so101_cube_multitask_simreal_0826`, es un ajuste fino del modelo base `lerobot/smolvla_base` sobre un dataset mixto de simulación y real (`Chaenn/so101_cube_real_sim_place_stack_0826`) para tareas de colocación y apilado de cubos con el brazo robótico SO-101. El modelo cuenta con 450 millones de parámetros y un tamaño de 0,9 GB, lo que lo hace adecuado para GPU de gama media.

La relevancia de este modelo radica en que demuestra la viabilidad de entrenar políticas robóticas eficientes con aprendizaje por imitación utilizando la librería LeRobot, sin necesidad de infraestructura de alto rendimiento. Al estar licenciado bajo Apache 2.0, puede utilizarse tanto en investigación como en aplicaciones comerciales, y su tamaño compacto facilita su integración en sistemas embebidos o de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual con un modelo de lenguaje pequeño para generar comandos de acción directamente a partir de observaciones de imagen y, opcionalmente, instrucciones de lenguaje. El modelo base `lerobot/smolvla_base` fue preentrenado en una gran cantidad de datos robóticos heterogéneos. En este repositorio, se ha realizado un ajuste fino sobre el dataset `Chaenn/so101_cube_real_sim_place_stack_0826`, que contiene demostraciones de colocación y apilado de cubos tanto en simulación como en el robot real SO-101. El entrenamiento se realizó con la librería LeRobot, que implementa el pipeline estándar de aprendizaje por imitación con supervisión de acciones. No se especifican detalles adicionales sobre el número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO, ya que no están disponibles en la información proporcionada.

## Capacidades

- Control robótico de bajo nivel: genera comandos de posición de articulaciones para el brazo SO-101 (probablemente 6 grados de libertad).
- Percepción visual: procesa imágenes de cámara para localizar cubos y estimar su posición y orientación.
- Aprendizaje por imitación: entrenado mediante demostraciones humanas o teleoperadas, puede replicar comportamientos de manipulación.
- Ejecución de tareas de manipulación: específicamente diseñado para tareas de pick-and-place y stacking de cubos.
- Compatibilidad con LeRobot: se integra fácilmente en el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de laboratorios de investigación: el modelo puede controlar un brazo SO-101 para realizar tareas repetitivas de manipulación de objetos pequeños, como colocar cubos en posiciones específicas, liberando tiempo de los investigadores.
- Prototipado rápido de políticas robóticas: al ser un modelo compacto y entrenable con LeRobot, permite iterar rápidamente sobre nuevos datasets y tareas sin necesidad de un clúster de GPU.
- Educación y formación en robótica: estudiantes y desarrolladores pueden desplegar el modelo en hardware de bajo coste (SO-101, cámara web, GPU de gama media) para experimentar con aprendizaje por imitación.
- Evaluación de algoritmos de control: sirve como baseline para comparar métodos de aprendizaje por refuerzo o planificación clásica en tareas de manipulación.
- Integración en líneas de montaje ligeras: en entornos industriales con tareas de pick-and-place simples, el modelo puede operar en tiempo real con hardware asequible.
- Investigación en generalización sim-to-real: al haber sido entrenado con datos mixtos de simulación y real, permite estudiar la transferencia de políticas entre ambos dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. Se recomienda consultar el paper original de SmolVLA (arXiv 2506.01844) para conocer el rendimiento general del modelo base, aunque los resultados específicos de este ajuste fino no están documentados.

## Requisitos de hardware

- VRAM estimada: al tener 450 millones de parámetros y un tamaño de 0,9 GB en safetensors, la inferencia puede ejecutarse en GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) si se utiliza precisión FP16 o FP32.
- GPU recomendadas: para un rendimiento fluido en tiempo real, se recomienda una GPU con 8 GB o más, como RTX 3060, RTX 4060 o RTX 4090. También puede ejecutarse en CPU para evaluación puntual, aunque con mayor latencia.
- Compatibilidad con hardware de consumo: sí, cabe en GPU de consumo medio-bajo, lo que lo hace accesible para laboratorios pequeños y aficionados.
- Opciones de despliegue: el modelo se utiliza principalmente a través de LeRobot (inferencia y entrenamiento). No se mencionan formatos GGUF ni integraciones con vLLM u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponible. Depende del hardware y de la frecuencia de control requerida (típicamente 10-30 Hz para control robótico).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Chaenn/smolvla_policy_so101_cube_multitask_simreal_0826` (este) | 450M | no disponible | Apache 2.0 | Hugging Face |
| `Chaenn/smolvla_policy_so101_cube_multitask_real_0820` | 450M (presumible) | no disponible | Apache 2.0 | Hugging Face |
| `Chaenn/smolvla_policy_so101_cube_multitask_0723` | 450M (presumible) | no disponible | Apache 2.0 | Hugging Face |

Los tres modelos de Chaenn son ajustes finos del mismo SmolVLA base, diferenciándose en el dataset de entrenamiento (simulación+real vs. solo real vs. fecha anterior). No se dispone de datos de rendimiento comparativo entre ellos. Otros VLA como OpenVLA (7B) o RT-2 son significativamente más grandes y requieren hardware más potente, pero no se dispone de especificaciones detalladas para una comparación cuantitativa en este contexto.

## Limitaciones y advertencias

- El modelo está especializado en tareas de manipulación de cubos con el brazo SO-101; no se espera que generalice a otros robots, objetos o entornos sin un nuevo ajuste fino.
- Al ser un modelo de aprendizaje por imitación, su rendimiento depende de la calidad y diversidad de las demostraciones del dataset de entrenamiento. Puede fallar ante situaciones no vistas (iluminación, posiciones de cámara, variaciones de objetos).
- No se han documentado métricas de robustez ni tasas de éxito en el repositorio, por lo que se recomienda validar el modelo en el entorno objetivo antes de usarlo en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el hardware robótico asociado (SO-101) puede tener sus propias restricciones.
- La ausencia de cuantizaciones precalculadas (GGUF, etc.) limita el despliegue en dispositivos muy limitados, aunque es posible cuantizar manualmente si se requiere.
- No se proporcionan datos sobre latencia ni throughput, lo que dificulta estimar si cumple requisitos de control en tiempo real en hardware específico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_simreal_0826
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot (librería de entrenamiento): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Blog sobre fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset utilizado: https://huggingface.co/datasets/Chaenn/so101_cube_real_sim_place_stack_0826
