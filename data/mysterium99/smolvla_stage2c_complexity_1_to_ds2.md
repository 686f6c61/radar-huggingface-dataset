# mysterium99/smolvla_stage2c_complexity_1_to_ds2

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots reales a partir de observaciones visuales y del estado de las articulaciones. Esta ficha concreta, `mysterium99/smolvla_stage2c_complexity_1_to_ds2`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds2`, orientado a una tarea de manipulación específica: colocar tuercas en un vaso rojo y tornillos en un cubo azul.

El modelo resuelve el problema de la política de imitación robótica de bajo coste computacional: con aproximadamente 450 millones de parámetros, procesa tres cámaras RGB de 256x256 píxeles más un vector de estado de 6 dimensiones, y emite un vector de acción de 6 dimensiones. Frente a los VLA de gran escala que requieren GPUs de datacenter, SmolVLA está pensado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios con presupuesto limitado y para el despliegue en robots de sobremesa.

La relevancia actual del modelo radica en su carácter reproducible y abierto: licencia Apache 2.0, pesos en safetensors, integración nativa con las herramientas CLI de LeRobot y una configuración de entrenamiento documentada (20 000 pasos, batch 8, AdamW con learning rate 1e-4). Es, por tanto, un ejemplo práctico de flujo completo de imitación robótica desde la grabación de datos hasta el despliegue en el robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, implementada en LeRobot (detalle interno no disponible) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (politica de control, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea se especifica en ingles: "put nuts in red cup and bolts in blue bucket") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version de entrenamiento: 0.6.1) |
| Modelo base | lerobot/smolvla_base (fine-tuning) |
| Tipo de robot | follow |
| Camaras de entrada | gripper, newtop, newside (3 x 3x256x256) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Tamano del repositorio | 0.9 GB |
| Dataset de entrenamiento | ds2 (50 episodios, 110.961 frames, 30 FPS) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina percepción visual multi-cámara con el estado proprioceptivo del robot para predecir acciones de control de extremo a extremo. La arquitectura interna detallada (backbone visual, encoder de lenguaje, cabecera de acciones) no está especificada en la información proporcionada; el paper de referencia es arXiv:2506.01844. La política consume tres flujos de imagen de 3x256x256 píxeles y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones, lo que corresponde a un robot manipulador de tipo `follow` con pinza.

El entrenamiento se realizó por fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset `ds2`, compuesto por 50 episodios y 110.961 frames a 30 FPS, con una única instrucción de tarea en inglés. La configuración documentada incluye 20 000 pasos de entrenamiento, batch size 8, optimizador AdamW con learning rate 0.0001 y semilla 0. No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineación, ni el número total de tokens o composición del corpus de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación de extremo a extremo: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas (gripper, newtop, newside) a 256x256 píxeles.
- Seguimiento de instrucciones en lenguaje natural: acepta una descripción textual de la tarea en el momento de la inferencia.
- Ejecución de tareas de clasificación y colocación de objetos: el fine-tuning está especializado en "put nuts in red cup and bolts in blue bucket".
- Despliegue en hardware de consumo: el modelo está diseñado explícitamente para ejecutarse en GPUs de gama consumer.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento simbólico, visión general, audio ni modo thinking.

## Casos de uso

- Clasificación automatizada de piezas pequeñas en líneas de montaje: el modelo puede colocar tuercas y tornillos en contenedores diferenciados por color, usando las tres cámaras para localizar cada pieza y la pinza.
- Prototipado rápido de políticas de imitación en laboratorio: con 50 episodios y 20 000 pasos de entrenamiento, un equipo puede reproducir el flujo completo de grabación, entrenamiento y despliegue en un robot `follow` en pocas horas.
- Investigación en aprendizaje por imitación con presupuesto limitado: al caber en GPUs de consumo, permite iterar sobre variantes de la política sin acceso a clústeres de datacenter.
- Evaluación de robustez frente a cambios de iluminación y posiciones de objetos: la política puede desplegarse repetidamente con `lerobot-rollout` para medir tasas de éxito en condiciones variables.
- Base para fine-tuning en tareas de ensamblaje: el checkpoint puede servir como punto de partida para nuevas tareas de manipulación que requieran el mismo robot y configuración de cámaras.
- Docencia y formación en robótica de manipulación: el modelo y su dataset asociado permiten demostrar el ciclo completo de un sistema VLA real con herramientas open source.
- Benchmarking de políticas VLA compactas: sirve como referencia reproducible para comparar arquitecturas y configuraciones de entrenamiento en tareas de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en safetensors (aproximadamente 0.9 GB en el repositorio), la inferencia en precisión nativa requiere del orden de 2-3 GB de VRAM incluyendo activaciones y buffers de imagen, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: no especificadas en la información disponible; el modelo está diseñado para hardware de consumo según la model card del proyecto SmolVLA.
- Cabe en GPU de consumo: sí, según la descripción del proyecto SmolVLA ("can be deployed on consumer-grade hardware"); no se detallan modelos concretos.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--policy.path=mysterium99/smolvla_stage2c_complexity_1_to_ds2`; entrenamiento mediante `lerobot-train`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla_stage2c_complexity_1_to_ds2 | 450 M | no aplica (política de control) | VLA para robot `follow` | apache-2.0 | Hugging Face, via LeRobot |
| lerobot/smolvla_base | no disponible en la informacion | no aplica | VLA base | no disponible en la informacion | Hugging Face, via LeRobot |
| Otros VLA de gran escala (p. ej. familias tipo OpenVLA) | no disponible en la informacion | no disponible | VLA | no disponible | no disponible |

La comparación con alternativas de la misma categoría no puede completarse con rigor porque la información proporcionada solo cubre el modelo base y este fine-tuning. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en el material consultado.

## Limitaciones y advertencias

- Especialización estrecha: el fine-tuning está entrenado para una única tarea ("put nuts in red cup and bolts in blue bucket") y un único robot de tipo `follow`; no se espera generalización a otras tareas sin reentrenamiento.
- Sin evaluación publicada: la model card indica que no se han proporcionado resultados de evaluación, por lo que no hay evidencia cuantitativa de tasa de éxito.
- Dataset pequeño: 50 episodios y 110.961 frames son una base limitada; el modelo puede ser sensible a cambios de iluminación, posiciones de objetos, distracciones o variaciones del entorno no representadas en los datos.
- Dependencia de la configuración de cámaras: los nombres y la disposición de las cámaras (`gripper`, `newtop`, `newside`) deben coincidir exactamente con los usados en el entrenamiento; un cambio de montaje puede degradar el rendimiento.
- Riesgo de alucinación motora: al ser una política de imitación, puede generar acciones plausibles pero incorrectas ante estados fuera de distribución, sin mecanismo explícito de abstención.
- Idiomas: la instrucción de tarea está en inglés y no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume la responsabilidad de validar el modelo en su entorno.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero el dataset refleja únicamente el entorno y los objetos de la grabación.
- Fecha de creación del repositorio: 2026-11-05, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mysterium99/smolvla_stage2c_complexity_1_to_ds2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/ds2
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ds2
