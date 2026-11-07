# jwhite135/pi05-newtasks-manufacturing

## Resumen

`jwhite135/pi05-newtasks-manufacturing` es un modelo de visión-lenguaje-acción (VLA) para robótica, resultado del ajuste fino de `lerobot/pi05_base` sobre el conjunto de datos `manufacturing_finetune`. Lo publica el usuario jwhite135 en Hugging Face y está pensado para controlar un robot de tipo `follow` en tareas de manipulación de componentes de ferretería en un entorno de fabricación. El modelo base π₀.₅ (Pi05) procede de Physical Intelligence y está diseñado para la generalización en entornos abiertos, según indica la propia model card.

El modelo tiene 4.143.404.816 parámetros (unos 4,14 mil millones) en formato safetensors, con un repositorio de 16,6 GB. Consume observaciones multimodales (estado del robot de 6 dimensiones y cuatro cámaras: `gripper`, `newtop`, `newside` y `empty_camera_0`) y produce un vector de acción de 6 dimensiones. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence.

Es relevante porque ejemplifica el flujo actual de ajuste fino de políticas VLA preentrenadas para tareas industriales concretas con pocos datos (150 episodios, 218.964 fotogramas a 30 FPS), y porque demuestra el uso de la librería LeRobot para entrenar y desplegar políticas de imitación sobre hardware real. La licencia Apache 2.0 facilita su reutilización y modificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), implementación LeRobot de π₀.₅ (Pi05) |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un VLA derivado de π₀.₅ (Pi05) de Physical Intelligence, cuya implementación en LeRobot se adapta del repositorio OpenPI. La arquitectura combina percepción visual (cuatro cámaras a 480x640 y 224x224) y estado propioceptivo del robot (vector de 6 dimensiones) para generar acciones de 6 dimensiones. La model card no detalla la composición interna de la red (backbone visual, transformer de política, mecanismo de difusión o flujo de acciones), por lo que esos detalles no están disponibles.

El ajuste fino se realizó sobre el conjunto `manufacturing_finetune`: 150 episodios, 218.964 fotogramas a 30 FPS, con tres tareas de manipulación de componentes ("Take hardware from human and put in taped area", "put nuts in red cup and bolts in blue bucket", "Put all hardware in bucket"). La configuración de entrenamiento fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, con LeRobot 0.6.1. No se indica si hubo RLHF, DPO ni otras fases de alineamiento, ni el número de tokens o la composición completa del dataset de preentrenamiento del modelo base.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción multimodal con cuatro cámaras simultáneas (`gripper`, `newtop`, `newside`, `empty_camera_0`).
- Ejecución de tareas de picking y clasificación de componentes de ferretería (tornillos, tuercas, hardware) en un entorno de fabricación.
- Interacción humano-robot: una de las tareas entrenadas consiste en recibir hardware de una persona y depositarlo en una zona delimitada.
- Aprendizaje por imitación: la política se entrena a partir de demostraciones teleoperadas.
- Generalización a entornos nuevos: según la descripción del modelo base, π₀.₅ está diseñado para generalizar a situaciones no vistas durante el entrenamiento.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni modo de pensamiento.

## Casos de uso

- Clasificación de componentes en línea de montaje: el modelo puede distinguir tuercas y tornillos y depositarlos en recipientes distintos (cubo rojo y cubo azul), usando las cámaras `newtop` y `newside` para localizar las piezas y la pinza para recogerlas.
- Recepción de piezas de un operario: la política entrenada para "Take hardware from human and put in taped area" permite que el robot recoja hardware entregado por una persona y lo coloque en una zona delimitada, reduciendo la manipulación manual en el puesto.
- Alimentación de contenedores de recogida: la tarea "Put all hardware in bucket" sirve para automatizar el vaciado y la consolidación de piezas sueltas en un contenedor común.
- Prototipado rápido de políticas industriales: con 150 episodios y 20.000 pasos de entrenamiento se puede replicar el flujo para nuevas tareas de fabricación, usando `lerobot-train` sobre `lerobot/pi05_base`.
- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar la transferencia de π₀.₅ a dominios industriales con pocos datos y evaluar la generalización a posiciones y condiciones de iluminación distintas.
- Despliegue en robots de tipo `follow`: mediante `lerobot-rollout` con `--strategy.type=base` se puede ejecutar la política en tiempo real sobre el hardware, con duración configurable y sin grabación de episodios.
- Base para ajustes posteriores: al estar publicada con licencia Apache 2.0 y en safetensors, puede reutilizarse como punto de partida para fine-tuning en otras tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política y deja una tabla de éxito por tarea sin rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4,14 mil millones de parámetros, una estimación orientativa en fp16 sería de unos 8-9 GB solo para pesos, más el coste de las activaciones y del procesamiento de cuatro cámaras; en cuantización de 8 bits podría reducirse a unos 4-5 GB, pero son cálculos no confirmados por el autor.
- GPU recomendadas: no disponible. El autor no especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de parámetros, cabría en GPUs de consumo con suficiente VRAM, pero no hay datos del autor que lo verifiquen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para entrenamiento), tal como se documenta en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La política opera a 30 FPS en la captura de datos, pero no se publica la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jwhite135/pi05-newtasks-manufacturing` | 4,14 mil millones | no disponible | VLA para fabricación (ajuste fino) | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base π₀.₅ | no disponible | Hugging Face |
| `jwhite135/pi0-newtasks-manufacturing` | 4 mil millones (según búsqueda) | no disponible | VLA para fabricación (ajuste fino de π₀) | no disponible | Hugging Face |
| `jwhite135/pi05-base-manufacturing` | no disponible | no disponible | VLA π₀.₅ ajustado a fabricación | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de las tres tareas entrenadas.
- El modelo está ajustado a un robot concreto de tipo `follow` y a una configuración específica de cámaras; los nombres de las cámaras deben coincidir exactamente con las claves de observación del entrenamiento.
- Solo se entrenó con 150 episodios y tres tareas de manipulación de ferretería; es probable que generalice mal fuera de ese dominio, aunque el modelo base esté diseñado para generalización en entornos abiertos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas; al ser un modelo de acción y no de lenguaje, estos conceptos no aplican directamente, pero sí existe riesgo de fallos de percepción y de ejecución de acciones incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y las condiciones de Physical Intelligence deberían verificarse por separado antes de un despliegue en producción.
- El repositorio ocupa 16,6 GB y no se indican requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue industrial.
- No se especifican cuantizaciones soportadas ni formatos alternativos a safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwhite135/pi05-newtasks-manufacturing
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de ajuste fino: https://huggingface.co/datasets/manufacturing_finetune
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=manufacturing_finetune
- Variante π₀ para fabricación: https://huggingface.co/jwhite135/pi0-newtasks-manufacturing
- Variante pi05 base para fabricación: https://huggingface.co/jwhite135/pi05-base-manufacturing
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
