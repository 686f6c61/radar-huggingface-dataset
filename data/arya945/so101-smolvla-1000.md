# Arya945/so101-smolvla-1000

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face, disenado para reducir el coste computacional del control robotico por imitacion y poder desplegarse en hardware de consumo. Este repositorio contiene un ajuste fino del modelo base `lerobot/smolvla_base`, entrenado sobre el dataset `so101_color_sorting` para un robot SO-101 de bajo coste. El modelo aprende a clasificar cubos de colores entre dos platos, ejecutando tareas de pick-and-place a partir de observaciones visuales de dos camaras y el estado de la articulacion.

Con 450 millones de parametros y un entrenamiento de solo 1000 pasos, este modelo representa una solucion eficiente para prototipos robotico, ya que no requiere infraestructura de alto rendimiento. Su licencia Apache 2.0 permite uso comercial sin restricciones, y se integra con la libreria LeRobot para facilitar el despliegue en robots reales. Aunque no se han publicado evaluaciones formales, su diseno basado en SmolVLA ofrece una base solida para tareas de manipulacion robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (paper arxiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA, que combina un encoder de vision SigLIP y un modelo de lenguaje SmolLM2 con un modulo de accion especifico. Segun la documentacion de LeRobot y el blog de referencia, durante el ajuste fino solo se entrenan las proyecciones y el modulo de accion, mientras que el encoder de vision y el LLM permanecen congelados. Esto permite un fine-tuning eficiente sobre el modelo base `lerobot/smolvla_base`, aprovechando las capacidades visuales y de razonamiento previas.

El entrenamiento se realizo con el dataset `so101_color_sorting`, que contiene 157 episodios y 85.867 frames a 30 FPS, con tareas como "poner el cubo verde del plato rojo al plato verde" y variaciones de posiciones. Se utilizaron 1000 pasos de entrenamiento, batch size de 4, optimizador AdamW y learning rate de 0.0001. La configuracion se gestiono con LeRobot version 0.6.2, y no se emplearon tecnicas de RLHF o DPO, sino aprendizaje por imitacion directa.

## Capacidades

- Control robotico de alta precision: genera acciones de 6 dimensiones (posicion, orientacion y gripper) para el robot SO-101.
- Percepcion visual con dos camaras: procesa imagenes de 480x640 píxeles de las camaras `front` y `second`, lo que permite observar la escena desde dos angulos.
- Estado del robot: utiliza un vector de estado de 6 dimensiones como entrada adicional.
- Aprendizaje por imitacion: ejecuta politicas aprendidas de demostraciones humanas para tareas de manipulacion.
- Capacidad de clasificacion de colores y objetos: identifica cubos de colores (verde, rojo, gris) y los coloca en el plato correspondiente.
- No soporta tool calling ni agentes conversacionales: es un modelo de politica especifico, no un LLM general.

## Casos de uso

- Automatizacion de laboratorios: clasificar cubos de colores en placas de Petri o bandejas en entornos de investigacion, con un robot de bajo coste.
- Prototipado de robots de bajo coste: evaluar la viabilidad de politicas de control en robots SO-100 antes de escalar a hardware industrial.
- Investigacion en aprendizaje por imitacion: utilizar este modelo como referencia para comparar metodos de entrenamiento o arquitecturas VLA.
- Educacion en robotica: demostrar conceptos de vision-lenguaje-accion en cursos universitarios con hardware accesible.
- Fine-tuning para nuevas tareas: partir de este modelo y ajustarlo con datos adicionales para tareas de pick-and-place con diferentes objetos o disposiciones.
- Linea de ensamblaje de pequena escala: clasificar piezas de colores en procesos de fabricacion de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". Por tanto, no se dispone de datos cuantitativos sobre tasas de exito o comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parametros, el peso del repositorio es de 1.6 GB, lo que sugiere pesos en FP32 (aprox. 1.8 GB) o FP16 (aprox. 0.9 GB). Se recomienda una GPU con al menos 4 GB de VRAM para FP16 y 6 GB para FP32.
- GPU recomendadas: tarjetas de consumo como NVIDIA RTX 3060 (12 GB) o RTX 4060 (8 GB) son suficientes para inferencia. Para entrenamiento, se recomienda una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3080 o RTX 4080).
- Compatibilidad con hardware de consumo: si, el diseno de SmolVLA esta pensado para funcionar en GPUs de gama media, segun la documentacion del paper.
- Opciones de despliegue: se usa la libreria LeRobot (de Hugging Face) para ejecutar el modelo en el robot. No se mencionan opciones como vLLM u Ollama, ya que no aplican a modelos VLA.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| Arya945/so101-smolvla-1000 | 450M | No disponible | No evaluado | Apache 2.0 |
| lerobot/smolvla_base | 500M+ (estimado) | No disponible | Modelo base, sin evaluar | Apache 2.0 |
| ACT (Action Chunking Transformer) | No disponible | No disponible | No evaluado | MIT (comun) |

El modelo se compara con su base (SmolVLA) y con ACT, un enfoque alternativo para control robotico por imitacion. SmolVLA ofrece una arquitectura VLA con prioridades visuales preentrenadas, mientras que ACT es un transformer puro sin modulo de lenguaje. No se dispone de datos de rendimiento para una comparacion cuantitativa.

## Limitaciones y advertencias

- Sin evaluacion en robot real: no se ha medido el rendimiento en tareas reales, por lo que el exito en condiciones variadas es incierto.
- Sobreajuste potencial: el entrenamiento se realizo con solo 157 episodios y 1000 pasos, lo que puede provocar sobreajuste a las condiciones del dataset (posiciones, iluminacion, etc.).
- Especifico de una tarea: el modelo solo funciona para la clasificacion de cubos en la configuracion SO-101 con dos camaras fijas; no generaliza a otras tareas sin un nuevo ajuste fino.
- No es un LLM general: no procesa lenguaje natural, no tiene soporte de tool calling ni de agentes conversacionales.
- Limitaciones de idioma: no se especifican idiomas, pero el modelo no genera texto, por lo que no es relevante.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, sin embargo, es responsabilidad del usuario verificar la licencia de los datos de entrenamiento (dataset `so101_color_sorting`).

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Arya945/so101-smolvla-1000
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/so101_color_sorting
- Documentacion de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Blog sobre fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
