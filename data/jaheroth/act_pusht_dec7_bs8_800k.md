# jaheroth/act_pusht_dec7_bs8_800k

## Resumen

El modelo `jaheroth/act_pusht_dec7_bs8_800k` es un checkpoint de la arquitectura ACT (Action Chunking with Transformers) entrenado específicamente para el entorno de simulación robótica PushT, dentro del ecosistema LeRobot. Lo desarrolla Jacob H. Rothschild (JaHeRoth) como parte de un bloque de entrenamiento de seis semanas en aprendizaje robótico, y está publicado bajo licencia Apache 2.0.

El modelo resuelve el problema de control robótico por imitación: dado un estado observado (imagen y estado del robot), predice una secuencia de acciones (chunking) para empujar una pieza en forma de T hasta una posición objetivo. Su relevancia radica en que demuestra que un entrenamiento con batch pequeño (8) y un presupuesto de muestras equivalente (800k pasos, 6.4M muestras) alcanza un rendimiento comparable a un batch grande (64) con menos pasos, lo que tiene implicaciones prácticas para el entrenamiento eficiente de políticas robóticas.

La arquitectura es un transformer con decodificación por chunks de acción, con 83.969.428 parámetros en total. El contexto y los idiomas no están especificados, al tratarse de un modelo de control continuo, no de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 83.969.428 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de observaciones, no texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers diseñada para aprendizaje por imitacion en robotica. El modelo recibe una observacion (tipicamente una imagen y el estado de la articulacion) y predice un "chunk" de acciones futuras, en lugar de una sola accion, lo que reduce el error de acumulacion y mejora la estabilidad del control. En este caso, el modelo se evalua con `n_action_steps=16`, es decir, predice 16 acciones por inferencia.

El entrenamiento se realizo con el framework LeRobot sobre el entorno gym-pusht. El checkpoint corresponde a una ejecucion con batch size 8 y 800.000 pasos, lo que equivale a 6,4 millones de muestras. Segun la model card, este regimen de entrenamiento iguala el rendimiento de una ejecucion con batch size 64 a 100.000 pasos, con una diferencia de una decima en la metrica principal. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento; es un entrenamiento supervisado de imitacion.

## Capacidades

- Control robotico por imitacion: genera secuencias de acciones (chunks de 16 pasos) para resolver la tarea PushT.
- Percepcion visual: procesa observaciones de imagen del entorno simulado para decidir las acciones.
- Generalizacion a diferentes condiciones iniciales: evaluado sobre 5000 episodios con exito del 60,2%.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para robotica, lo que facilita su carga, evaluacion y despliegue.
- No soporta lenguaje natural, tool calling, agentes conversacionales ni capacidades multimodales fuera del dominio robotico.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como punto de referencia para estudiar el efecto del batch size y el numero de pasos en el rendimiento de politicas ACT, tal como documenta el autor en su repositorio.
- Evaluacion de politicas roboticas en simulacion: permite reproducir experimentos en gym-pusht y comparar metricas como `avg_sum_imputed_reward` y tasa de exito con otros checkpoints.
- Desarrollo de sistemas de control robotico basados en vision: el modelo demuestra como un transformer puede mapear observaciones visuales directamente a acciones, util para prototipar pipelines de robotica.
- Estudio de eficiencia de entrenamiento: al igualar el rendimiento de batch grande con batch pequeno, es util para investigar estrategias de escalado de datos en robotica.
- Base para fine-tuning en tareas similares: dado su tamano moderado (84M parametros) y licencia permisiva, puede adaptarse a otras tareas de empuje o manipulacion con pocos datos.
- Educacion y formacion: como ejemplo practico de entrenamiento de un modelo ACT con LeRobot, reproducible y documentado en el repositorio del autor.

## Benchmarks y rendimiento

Segun la model card, el modelo fue evaluado en gym-pusht con `n_action_steps=16` sobre 5000 episodios:

| Metrica | Valor |
|---|---|
| avg_sum_imputed_reward | 159,1 |
| Tasa de exito | 60,2% |

La metrica `avg_sum_imputed_reward` imputa 0,95 por paso hasta un horizonte de 300 tras el exito. No se han publicado comparaciones con otros modelos en la informacion disponible, salvo la mencion de que iguala a una ejecucion con batch 64 a 100k pasos "hasta una decima".

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 84M parametros, la inferencia es ligera. En precision FP32 ocuparia aproximadamente 336 MB; en FP16 o BF16, unos 168 MB. Cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Para entrenamiento, el autor uso un entorno con batch 8, lo que sugiere que una GPU de gama media (RTX 3060 o superior) puede reproducir el entrenamiento.
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de consumo.
- Opciones de despliegue: LeRobot (libreria principal), con soporte para evaluacion y entrenamiento. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano, la inferencia deberia ser de pocos milisegundos en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas ACT para PushT) dentro de los resultados de busqueda. El autor menciona otros checkpoints en su perfil de Hugging Face (`jaheroth/act_pusht_dec7` y `jaheroth/act_pusht_bs64_dec7`), pero no se proporcionan sus metricas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en simulacion (gym-pusht); no ha sido validado en robotica fisica real.
- La tasa de exito del 60,2% indica que falla en aproximadamente el 40% de los episodios, por lo que no es adecuado para aplicaciones de seguridad critica sin supervision.
- No soporta lenguaje natural ni interaccion conversacional; es un modelo de control puro.
- No se han documentado sesgos, pero al ser un entorno simulado limitado, puede no generalizar a otras configuraciones de la tarea (diferentes geometrias, fricciones, etc.).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento ni soporte.
- No hay informacion sobre la composicion del dataset de entrenamiento ni sobre posibles sesgos en los datos de demostracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_dec7_bs8_800k
- Repositorio de entrenamiento del autor: https://github.com/JaHeRoth/robot-learning
- Perfil del autor en Hugging Face: https://huggingface.co/jaheroth
- Checkpoint relacionado (batch 64): https://huggingface.co/jaheroth/act_pusht_bs64_dec7
- Checkpoint relacionado (dec7): https://huggingface.co/jaheroth/act_pusht_dec7
