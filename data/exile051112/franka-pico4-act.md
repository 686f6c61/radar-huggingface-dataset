# Exile051112/franka-pico4-act

## Resumen

El repositorio `Exile051112/franka-pico4-act` agrupa tres checkpoints independientes del modelo ACT (Action Chunking with Transformers) entrenados sobre condiciones específicas del entorno Franka/Pico4 dentro del ecosistema LeRobot. Cada checkpoint corresponde a una política completa de LeRobot, almacenada en un subdirectorio propio, y está diseñada para controlar un brazo robótico Franka mediante aprendizaje por imitación a partir de demostraciones humanas capturadas con cámaras RGB.

El modelo es relevante para la comunidad de robótica y aprendizaje por refuerzo, ya que ACT es una arquitectura que predice secuencias de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y precisión del control en tareas de manipulación. El autor, Exile051112 (Jianing Zhang), ha publicado además otros modelos relacionados, como una variante con SmolVLA, lo que indica un trabajo activo en el desarrollo de políticas robóticas.

La información técnica disponible es limitada: se sabe que los checkpoints se entrenaron con full fine-tuning (no LoRA), con 10.000 pasos de entrenamiento, y que la entrada consiste en dos cámaras RGB (top y wrist) a 480x640 píxeles y 30 FPS, junto con datos de propriocepción. El repositorio tiene un tamaño de 0,6 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robotico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer basado en el mecanismo de atención que, en lugar de predecir una única acción por paso de tiempo, genera un "chunk" de acciones futuras (típicamente de 50 a 100 pasos) a partir de observaciones actuales. Esta arquitectura, propuesta originalmente por el equipo de Google y la Universidad de Stanford, reduce la acumulación de errores y permite un control más suave en tareas de manipulación. En este caso, el modelo se adapta a un brazo Franka con una configuración de cámara dual (vista superior y muñeca).

El entrenamiento se realizó mediante full fine-tuning (no LoRA) sobre datos de demostración reales y editados, organizados en tres condiciones: `c1_red_yellow_real` (datos reales de objetos rojo y amarillo), `c2_red_yellow_blue_real` (añade objeto azul real) y `c3_red_yellow_blue_edited` (incluye datos editados del objeto azul). El checkpoint alcanzó los 10.000 pasos de entrenamiento, y se utilizó la versión 0.6.2 de LeRobot con PyTorch como backend. No se especifica el número total de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Control robotico por imitacion: el modelo predice secuencias de acciones (action chunks) para ejecutar tareas de manipulacion con un brazo Franka.
- Percepcion visual multimodal: procesa dos flujos de camara RGB (top y wrist) a 480x640 píxeles y 30 FPS, junto con datos de propriocepcion del brazo.
- Adaptacion a multiples condiciones: los tres checkpoints permiten seleccionar la politica segun el conjunto de objetos (rojo, amarillo, azul) y el tipo de datos (reales o editados).
- Integracion con LeRobot: los checkpoints son directorios de politica completos, listos para cargarse con la API de LeRobot 0.6.2.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes conversacionales ni capacidades multilingues.

## Casos de uso

- Tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de recoger y colocar objetos de colores (rojo, amarillo, azul) sobre una superficie, utilizando las demostraciones aprendidas. Es adecuado porque ACT maneja secuencias largas de acciones con alta precision.
- Investigacion en aprendizaje por imitacion: los tres checkpoints permiten comparar el efecto de anadir datos reales frente a datos editados en el rendimiento de la politica, siendo util para estudiar la robustez del modelo ante variaciones en el dataset.
- Desarrollo de politicas roboticas con LeRobot: al ser un directorio LeRobot completo, puede integrarse directamente en pipelines de entrenamiento y evaluacion existentes, facilitando la reproduccion de experimentos.
- Control de brazo Franka en simulacion o real: aunque el repositorio no especifica el entorno, la arquitectura ACT es compatible con simuladores como MuJoCo y con robots reales Franka, permitiendo transferir la politica a distintos escenarios.
- Benchmarking de arquitecturas de control: el checkpoint puede usarse como referencia para comparar ACT con otras arquitecturas (p. ej., SmolVLA) en las mismas condiciones de tarea, gracias a que el autor publica modelos alternativos en el mismo entorno.
- Educacion en robotica: el repositorio sirve como ejemplo practico de como estructurar y desplegar politicas de aprendizaje por imitacion con LeRobot, siendo util para cursos o talleres sobre robotica basada en aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como tasa de exito, precision de manipulacion ni comparaciones con otros modelos en tareas estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamano del repositorio (0,6 GB) y el uso de safetensors, se estima que el modelo cabe en GPUs con al menos 4-6 GB de VRAM, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Se sugiere una GPU moderna con soporte CUDA (p. ej., RTX 3060 o superior) para inferencia en tiempo real, aunque no se especifica.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano reducido, pero no confirmado.
- Opciones de despliegue: LeRobot 0.6.2 (PyTorch) es el entorno principal; tambien podria usarse con librerias de inferencia como vLLM o llama.cpp si se convirtieran los pesos, pero no es el flujo previsto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El autor publica un modelo relacionado, `Exile051112/franka-pico4-smolvla-c2-red-yellow-blue-real`, que utiliza la arquitectura SmolVLA (una variante de VLA - Vision-Language-Action) sobre las mismas condiciones de datos. Sin embargo, no hay datos de rendimiento publicados para ninguno de los dos. Otros modelos ACT de la literatura (p. ej., el ACT original de Google) no son directamente comparables por diferencias en el entorno y los datos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos, pero al ser un modelo entrenado con demostraciones humanas, puede heredar sesgos en la forma de ejecutar las tareas (p. ej., preferencia por ciertas trayectorias).
- Riesgo de alucinacion: en el contexto robotico, el modelo puede generar secuencias de acciones incorrectas si se enfrenta a observaciones fuera de la distribucion de entrenamiento, lo que podria causar movimientos inseguros.
- Limitaciones de contexto: la ventana de contexto (numero de pasos de observacion) no esta especificada; se asume que es la tipica de ACT (unas pocas observaciones), pero no se confirma.
- Restricciones de licencia: la licencia no esta especificada en el repositorio, por lo que el uso comercial o la redistribucion requieren contacto con el autor.
- Caveat para produccion: el modelo es un artefacto de investigacion, no un producto listo para despliegue industrial. Requiere validacion en el entorno fisico especifico y medidas de seguridad (p. ej., limites de velocidad, parada de emergencia) antes de cualquier uso real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Exile051112/franka-pico4-act
- Perfil del autor: https://huggingface.co/Exile051112
- Modelo relacionado (SmolVLA): https://huggingface.co/Exile051112/franka-pico4-smolvla-c2-red-yellow-blue-real
- Checkpoint individual c2: https://huggingface.co/Exile051112/franka-pico4-act-c2-red-yellow-blue-real
- Proyecto ACTFranka (modificacion de ACT para Franka): https://sainavaneet.github.io/ACTfranka.github.io/ y https://github.com/sainavaneet/ACTfranka
- Libreria aiofranka para control de Franka: https://github.com/Improbable-AI/aiofranka
