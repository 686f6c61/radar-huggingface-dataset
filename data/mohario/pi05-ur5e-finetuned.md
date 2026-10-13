# mohario/pi05-ur5e-finetuned

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos: parte de π₀ y se entrena para operar en situaciones y entornos que no aparecieron durante el entrenamiento. La implementación disponible en LeRobot está adaptada del repositorio OpenPI del propio fabricante. El modelo que documenta esta ficha, `mohario/pi05-ur5e-finetuned`, es un ajuste fino de ese modelo base para un brazo robótico UR5e.

El ajuste lo publica el usuario `mohario` sobre `lerobot/pi05_base` mediante la librería LeRobot (versión 0.6.1), y resuelve una tarea concreta de manipulación: recoger una pieza (tuerca, tornillo, engranaje o cubo) y depositarla en un embudo. Para ello consume tres cámaras RGB de 224x224 (vista base y dos muñecas) más el estado propioceptivo de 7 dimensiones del robot, y produce un vector de acción continuo de 7 dimensiones.

Se trata de un modelo de 4.143.404.816 parámetros (unos 4,14 mil millones) con licencia Apache 2.0, publicado el 12 de octubre de 2026. El repositorio ocupa 25,9 GB y, en el momento de redactar esta ficha, acumula 0 descargas y 1 like, por lo que no existe validación por parte de la comunidad ni resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); el backbone concreto no se detalla en la model card |
| Parámetros totales | 4.143.404.816 (≈ 4,14 mil millones) |
| Parámetros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | No disponible (es una política de acción, no un LLM de texto) |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | No disponible; las tareas del dataset de ajuste están descritas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Modelo base | lerobot/pi05_base |
| Pipeline | robotics |
| Tipo de robot | ur5e |
| Cámaras | base_0_rgb, left_wrist_0_rgb, right_wrist_0_rgb |
| Entradas | observation.images.* (3, 224, 224) x3 y observation.state (7,) |
| Salidas | action (7,) |
| Frecuencia de grabación del dataset | 30 FPS |
| Tamaño del repositorio | 25,9 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creación | 12 de octubre de 2026 |

## Arquitectura y entrenamiento

La model card identifica el modelo como un VLA de Physical Intelligence pensado para generalización en entornos abiertos, y señala que la implementación en LeRobot procede del repositorio OpenPI del mismo fabricante. No se publican en la información disponible detalles sobre el tipo de transformer, el codificador visual, el mecanismo de generación de acciones ni la composición exacta del dataset de preentrenamiento del modelo base.

El ajuste fino sigue un esquema de aprendizaje por imitación supervisado sobre el dataset `mohario/3-cam-pick-and-place`: 120 episodios, 33.445 fotogramas a 30 FPS y cuatro tareas de recogida y depósito (tuerca, tornillo, engranaje y cubo en un embudo). La configuración de entrenamiento declarada es de 20.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot 0.6.1. No se menciona ningún uso de RLHF, DPO ni preferencias humanas, algo coherente con una política de imitación.

La interfaz entrada-salida es explícita: tres imágenes RGB de 224x224 píxeles y un vector de estado de 7 componentes como entradas, y un vector de acción de 7 componentes como salida, adecuado para los 7 grados de libertad típicos de un UR5e. El modelo no declara innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) en la documentación proporcionada.

## Capacidades

- Control robótico de manipulación mediante imitación: genera comandos de acción continuos de 7 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepción multimodal: integra tres vistas simultáneas (cámara base y dos cámaras de muñeca), lo que permite razonar sobre la posición del brazo y del objeto desde varios ángulos.
- Condicionamiento por tarea: acepta una instrucción textual que describe la tarea a ejecutar, con cuatro tareas conocidas (recoger tuerca, tornillo, engranaje o cubo y depositarlo en el embudo).
- Generalización a entornos nuevos: el modelo base π₀.₅ está diseñado explícitamente para transferir a entornos y situaciones no vistos durante el entrenamiento, aunque este ajuste fino concreto no aporta evidencia publicada de ello.
- Ejecución en bucle cerrado: el formato de observación y acción está pensado para control continuo, con datos de entrenamiento capturados a 30 FPS.
- Soporte de tool calling / function calling: no disponible; no es una capacidad contemplada en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible; la salida es un vector de acción, no texto.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión generativa, audio): no disponibles.

## Casos de uso

- Automatización de pick-and-place en célula de fabricación: el modelo está entrenado específicamente para recoger piezas metálicas pequeñas y depositarlas en un embudo sobre un UR5e, por lo que encaja directamente en tareas de alimentación de máquinas o dosificación de componentes.
- Kitting y preparación de conjuntos: las cuatro tareas del dataset (tuerca, tornillo, engranaje y cubo) corresponden a piezas típicas de un kit mecánico, de modo que la política puede emplearse para separar y organizar componentes por forma.
- Clasificación de piezas por forma mediante visión: el uso de dos cámaras de muñeca permite distinguir objetos geométricamente similares y elegir el agarre adecuado, algo útil en líneas con piezas de geometría variada.
- Base para ajustes finos propios: al partir de `lerobot/pi05_base` y estar entrenado con el flujo estándar de LeRobot, sirve como punto de partida para reentrenar con un dataset propio mediante `lerobot-train`.
- Referencia para investigación en VLA: el dataset asociado (120 episodios, 33.445 fotogramas) y la configuración de entrenamiento documentada permiten reproducir el pipeline y comparar variantes de políticas.
- Validación de hardware y calibración de cámaras: el comando `lerobot-rollout` documentado facilita probar la política en un UR5e real y verificar la colocación de las tres cámaras antes de desplegar en producción.
- Formación y docencia en robótica: el flujo completo de LeRobot (instalación, grabación de datos, entrenamiento y despliegue) es reproducible en laboratorio con hardware accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", y la sección de evaluación mantiene la plantilla vacía. No se dispone, por tanto, de tasas de éxito por tarea, ni de comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 4,14 mil millones de parámetros, los pesos en FP16/BF16 ocupan aproximadamente 8,3 GB; sumando codificadores visuales, buffers y activaciones de las tres cámaras, es razonable estimar un rango de 10-16 GB de VRAM. Es una estimación a partir del recuento de parámetros, no un dato publicado por el autor.
- Precisión completa: los pesos en FP32 ocuparían aproximadamente 16,6 GB.
- GPU recomendadas: A100 (40/80 GB) y H100 para entrenamiento o despliegue con margen; RTX 4090 o RTX 3090 (24 GB) para inferencia en BF16/FP16.
- Viabilidad en GPU de consumo: sí, previsiblemente en tarjetas de 24 GB como la RTX 4090 o la RTX 3090. No hay confirmación publicada por el autor.
- Almacenamiento: el repositorio completo ocupa 25,9 GB, lo que sugiere que incluye varios checkpoints o estados del optimizador además de los pesos finales.
- Opciones de despliegue: la vía documentada es LeRobot mediante `lerobot-rollout` con `--policy.path=mohario/pi05-ur5e-finetuned`, sobre PyTorch con CUDA. vLLM, llama.cpp, Ollama o TGI no son aplicables a una política de acción con entradas visuales de este tipo, y no hay variantes GGUF publicadas.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere un objetivo de control en el entorno de 30 Hz, pero no se publica la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| mohario/pi05-ur5e-finetuned | 4.143.404.816 | 3 imágenes 224x224 + estado (7,) | Apache 2.0 | HuggingFace, 0 descargas | No |
| lerobot/pi05_base | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace | No disponible |
| Otras políticas del ecosistema LeRobot (ACT, Diffusion Policy, SmolVLA, entre otras) | No disponible | No disponible | No disponible en la información proporcionada | HuggingFace / LeRobot | No disponible |

No se dispone de datos verificables de parámetros, contexto, rendimiento ni licencia de las alternativas en la documentación proporcionada, por lo que la comparación cuantitativa no es posible. La diferencia comprobable es que este repositorio es un ajuste fino específico para UR5e con tres cámaras y cuatro tareas, mientras que el resto de políticas citadas no están caracterizadas en la información disponible.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas, por lo que se desconoce el rendimiento real de la política incluso en las cuatro tareas entrenadas.
- Dataset muy reducido: 120 episodios y 33.445 fotogramas para cuatro tareas. La generalización a posiciones, iluminación, objetos o distractores distintos de los capturados es muy incierta.
- Acoplamiento al hardware: la política está entrenada para un UR5e con exactamente tres cámaras (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) y un vector de estado de 7 dimensiones. Los nombres de cámara deben coincidir con las claves de observación del entrenamiento, y cambiar de robot, de número de cámaras o de montaje invalida el ajuste.
- Riesgo de fallo físico: al ser un modelo que genera acciones sobre hardware real, los errores se traducen en movimientos potencialmente peligrosos. Es imprescindible operar con paradas de emergencia, límites de fuerza y espacio de trabajo acotado.
- Idiomas: no se especifica soporte multilingüe. Las instrucciones del dataset están en inglés, por lo que el condicionamiento textual fuera de esas formulaciones no está verificado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base `lerobot/pi05_base` y del modelo original π₀.₅ de Physical Intelligence, ya que la cadena de licencias del ajuste no se detalla en el repositorio.
- Adopción nula: 0 descargas y 1 like implican que no hay validación independiente, ni informes de terceros sobre su comportamiento.
- Alucinación: en el sentido clásico de generación de texto no aplica, pero sí existe el riesgo equivalente de generar trayectorias de acción plausibles pero incorrectas ante observaciones fuera de distribución.
- Sesgos: no se documenta ningún análisis de sesgo. Al estar entrenado con un conjunto muy concreto de piezas y un único montaje, cabe esperar un sesgo fuerte hacia esas condiciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohario/pi05-ur5e-finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/mohario/3-cam-pick-and-place
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mohario/3-cam-pick-and-place
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI de Physical Intelligence: referenciado en la model card como origen de la implementación, sin URL explícita en la información disponible.
