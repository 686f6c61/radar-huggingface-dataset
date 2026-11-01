# jkim50104/Head2Wrist-policy-cube-bowl

## Resumen

Head2Wrist-policy-cube-bowl es una política robótica de manipulación entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre la librería LeRobot de Hugging Face. La desarrolla el equipo de investigación del autor jkim50104 (Juno Kim y colaboradores), en el marco del proyecto Head2Wrist, cuyo objetivo es generar políticas de robot a partir de demostraciones capturadas con una cámara montada en la cabeza del operador, sin necesidad de escanear la escena. Este checkpoint concreto corresponde al modelo "floor" de 80.000 pasos de entrenamiento utilizado para el resultado de robot real de introducir un cubo en un cuenco sobre un brazo ROBOTIS FFW-SG2 con una cámara Intel RealSense D405 montada en la muñeca.

El modelo no es un modelo de lenguaje ni un modelo generativo de propósito general: es un policy de control visuomotor que mapea una observación RGB de muñeca de 424×240 píxeles y un estado de 10 dimensiones a una secuencia de 10 dimensiones de acciones, con un chunk de 32 pasos. Su relevancia es doble: por un lado, documenta una transferencia de demostraciones humano-robot a un caso real con una tasa de éxito reportada de 18/20 ensayos; por otro, publica la procedencia exacta del checkpoint, las estadísticas de normalización y el servidor de inferencia de referencia, lo que facilita la reproducibilidad y la auditoría del pipeline.

El tamaño del repositorio es de 0,2 GB y los pesos suman 51.607.244 parámetros, un orden de magnitud propio de una política ACT con backbone ResNet-18, no de un transformer de gran escala. La licencia es MIT, lo que permite reutilización y modificación con atribución, aunque el autor restringe explícitamente el uso previsto a reproducción e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone ResNet-18 |
| Parametros totales | 51.607.244 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; chunk de 32 pasos de acción) |
| Tipos de cuantizacion | no disponible (pesos en safetensors float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors), con config.json y train_config.json |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer que predice chunks de acciones a partir de observaciones visuales y de estado proprioceptivo. En este caso el backbone visual es una ResNet-18 que procesa una única observación RGB de muñeca de 424×240 píxeles; la entrada de estado es un vector de 10 dimensiones y la salida es un chunk de 32 pasos de acciones de 10 dimensiones. El checkpoint se entrenó durante 80.000 pasos con el dataset `jkim50104/Head2Wrist-cube-bowl-252ep`, compuesto por 252 episodios y 36.652 fotogramas. La configuración de entrenamiento apunta a `/data/projects/EgoH2W/outputs/real/cube_bowl/lerobot_aug_floor`, y el checkpoint se escribió el 2026-10-17 a las 09:11:31 KST.

La innovación metodológica no está en el algoritmo de aprendizaje sino en la generación de datos: las demostraciones se capturan con una cámara en la cabeza del operador y se transforman en vistas de muñeca sintéticas mediante un renderizador. La variante "floor" incorpora un borde frontal de mesa ajustado, un plano de suelo 0,73 m por debajo de la superficie, recorte de malla de cabeza y mesa en el borde, gestión del color de fondo y propagación de la longitud focal corregida de la cámara Quest. El objeto agarrado se reconstruye con su malla y tamaño estimado nativo; la variante posterior no publicada `size5` regeneró vistas con `--obj_size 0.05`, pero no forma parte de este checkpoint. No se documentan fases de RLHF ni DPO, algo esperable en una política de imitación.

## Capacidades

- Control visuomotor de manipulación: predice secuencias de acciones de 10 dimensiones a partir de una imagen de muñeca y un estado de 10 dimensiones.
- Ejecución de la tarea específica de introducir un cubo en un cuenco sobre una mesa, partiendo de posiciones cercanas a las demostradas.
- Predicción por chunks de 32 pasos, lo que reduce la frecuencia de replanificación y suaviza la ejecución.
- Inferencia con una sola cámara RGB de muñeca (Intel RealSense D405), sin necesidad de escaneo de escena ni de cámara externa.
- Integración con el ecosistema LeRobot para carga de políticas y despliegue en robot.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: es una política de control, no un modelo de lenguaje.
- No dispone de capacidades de visión general, audio ni generación de texto.

## Casos de uso

- Reproducción del experimento del paper: cargar el checkpoint con LeRobot y ejecutar la tarea cubo-cuenco en un ROBOTIS FFW-SG2 con cámara D405 en la muñeca, para verificar la tasa de éxito reportada de 18/20 ensayos en un entorno controlado.
- Estudio de transferencia humano-robot: analizar cómo se comporta una política entrenada con vistas sintéticas generadas desde demostraciones de cámara en la cabeza, comparando el rendimiento con políticas entrenadas con datos de teleoperación convencionales.
- Referencia de implementación de ACT: usar `config.json`, `train_config.json` y `runtime_reference/` como plantilla para montar un servidor de políticas y un lanzador de robot propios, adaptando rutas y supuestos de entorno.
- Evaluación de robustez ante variaciones de objeto: puesto que la variante `size5` no se publicó, este checkpoint permite estudiar el efecto de no reescalar el objeto y sirve de línea base para experimentos de aumento de tamaño.
- Docencia en aprendizaje por imitación: ejemplo completo y pequeño (51,6 M de parámetros, 0,2 GB) para ilustrar el ciclo completo de datos, entrenamiento, normalización y despliegue en robótica de manipulación.
- Auditoría de reproducibilidad: el repositorio incluye la extracción legible de los buffers de normalización (`norm_stats.json`) sin recomputar estadísticas, lo que permite verificar que la inferencia usa exactamente las mismas medias y desviaciones que el entrenamiento.
- Pruebas de integración de pipelines de robot: validar la comunicación entre un servidor de políticas y un launcher de robot antes de sustituir la política por un modelo propio entrenado con el mismo formato de observación y acción.

## Benchmarks y rendimiento

El autor reporta un resultado de robot real: 18 ensayos exitosos de 20 en la tarea de introducir el cubo en el cuenco, con los dos fallos liberando el objeto fuera del cuenco. No se conservaron los registros por ensayo, por lo que la evidencia disponible es el informe agregado del autor y no registros auditables individualmente.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tasa de exito en robot real | 18/20 (90 %) | ROBOTIS FFW-SG2, camara D405 en muneca, tarea cubo-cuenco |
| Fallos reportados | 2/20, objeto liberado fuera del cuenco | Sin registros por ensayo |
| MMLU, HumanEval, GSM8K | no aplica | No es un modelo de lenguaje |

No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,6 M de parámetros en float32, lo que supone aproximadamente 0,2 GB de pesos; con buffers y activaciones, la inferencia cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para hardware de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida; también es viable en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot para carga de la política, más el servidor de políticas de referencia incluido en `runtime_reference/`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la GPU, del backbone ResNet-18 y del ciclo de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Head2Wrist-policy-cube-bowl | 51,6 M | chunk de 32 acciones | Cubo-cuenco con D405 en muneca | MIT | Hugging Face |
| Políticas ACT de LeRobot (genericas) | variable, tipicamente decenas de millones | chunk configurable | Manipulacion diversa | variable | Hugging Face / LeRobot |
| Políticas Diffusion Policy | variable, mayor coste de inferencia | horizonte de acciones | Manipulacion visuomotora | variable | Repositorios de investigacion |
| Políticas basadas en VLA (p. ej. RT-2, OpenVLA) | miles de millones | contexto de lenguaje | Manipulacion generalista | variable | Hugging Face / research |

La comparación directa con políticas VLA no es homogénea: este modelo es una política especializada de una sola tarea, con un orden de magnitud menos de parámetros y sin interfaz de lenguaje, mientras que los VLA generalizan a múltiples tareas a costa de mucho más cómputo. Frente a otras políticas ACT de LeRobot, la diferencia principal es la procedencia documentada y el pipeline de generación de vistas desde cámara en la cabeza.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación y reproducción; no es un controlador de seguridad y requiere calibración independiente, comprobación de colisiones y espacio de trabajo, parada de emergencia y supervisión de un operador.
- El resultado cubre una única tarea de sobremesa y posiciones de inicio cercanas a las demostradas; no hay evidencia de generalización a otras tareas, objetos o configuraciones.
- No se conservaron los registros por ensayo, por lo que no es posible reconstruir resultados individuales ni la pose final del objeto; la evidencia es el informe agregado del autor.
- La cámara sintética usada en el entrenamiento tenía un campo de visión horizontal nominal de 87° a 424×240; es necesario recalibrar antes de usar el modelo en cualquier robot.
- El modelo no reescala el objeto: la variante `size5`, que escala el cubo uniformemente con `--obj_size 0.05`, no se ha publicado, lo que limita el análisis de sensibilidad al tamaño del objeto.
- Los archivos de `runtime_reference/` contienen rutas y supuestos de entorno específicos que requieren adaptación; no son ejecutables tal cual.
- Riesgo de alucinación en el sentido de predicciones de acción no válidas fuera de la distribución de entrenamiento; no hay métricas de incertidumbre ni mecanismos de rechazo.
- Sesgos conocidos: no documentados por el autor; al ser una política entrenada con pocas demostraciones de un operador, es probable que herede sesgos de las trayectorias humanas, pero no se cuantifican.
- Licencia MIT: permite uso comercial y modificación con atribución, pero la licencia no exime de las advertencias de seguridad del autor para despliegue en robot real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkim50104/Head2Wrist-policy-cube-bowl
- Dataset de entrenamiento: https://huggingface.co/datasets/jkim50104/Head2Wrist-cube-bowl-252ep
- Paper y código: https://github.com/teamROBI/Head2Wrist
- Página del proyecto: https://teamrobi.github.io/projects/head2wrist/
- Librería LeRobot: https://github.com/huggingface/lerobot
