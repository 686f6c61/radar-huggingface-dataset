# nsk11235/franka-stack-300e-pi05-25k

## Resumen

`nsk11235/franka-stack-300e-pi05-25k` es un modelo de política robótica (Vision-Language-Action) obtenido por ajuste fino de `lerobot/pi05_base`, la implementación en LeRobot de π₀.₅ (Pi05) de Physical Intelligence. π₀.₅ es un modelo visión-lenguaje-acción diseñado para generalización en mundo abierto: evoluciona π₀ para generalizar a entornos y situaciones que no aparecieron durante el entrenamiento. En este caso concreto, el ajuste fino especializa la política en una única tarea de apilado de cubos sobre un robot Franka.

El modelo resuelve el problema de convertir observaciones sensoriales (dos cámaras RGB de 256x256 y un vector de estado de 16 dimensiones) en comandos de acción de 8 dimensiones, condicionado por una instrucción en lenguaje natural. No es un modelo de lenguaje: es una política de control entrenada con aprendizaje por imitación, no genera texto ni código. Su relevancia es la de servir como ejemplo reproducible de ajuste fino de π₀.₅ con LeRobot 0.6.2 y como punto de partida para quien quiera replicar el flujo de trabajo en un robot Franka propio.

El repositorio tiene 4.143.404.816 parámetros (~4,14 mil millones) en formato safetensors, ocupa 9,4 GB y se publica bajo licencia Apache 2.0. Fue creado el 29 de septiembre de 2026 y, en el momento de la consulta, acumula 0 descargas y 0 "likes", por lo que no ha sido validado por la comunidad. El autor no ha publicado resultados de evaluación en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, implementación LeRobot (adaptada del repositorio OpenPI) |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones) |
| Parámetros activos | no aplicable (no se documenta que sea MoE) |
| Longitud de contexto | no disponible (el modelo se condiciona con un prompt de tarea; no se publica la longitud máxima) |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors |
| Idiomas soportados | no disponible (la instrucción de tarea del dataset está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | franka |
| Cámaras | `top`, `wrist_cam` |
| Entradas | `observation.images.top` (3, 256, 256) VISUAL; `observation.images.wrist_cam` (3, 256, 256) VISUAL; `observation.state` (16,) STATE |
| Salidas | `action` (8,) ACTION |
| Tamaño del repositorio | 9,4 GB |
| Modelo base | lerobot/pi05_base |
| Dataset de ajuste | nsk11235/franka-stack-300e |

## Arquitectura y entrenamiento

Se trata de una política π₀.₅, un modelo visión-lenguaje-acción que consume imágenes y estado propioceptivo y emite acciones motrices, condicionado por una instrucción en lenguaje natural. La model card no detalla la topología interna (backbone, número de capas, mecanismo de atención ni estrategia de decodificación de acciones), por lo que esos datos quedan como no disponibles. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence, y el modelo se distribuye como safetensors con 4.143.404.816 parámetros.

El ajuste fino se realizó por aprendizaje por imitación sobre el dataset `nsk11235/franka-stack-300e`: 304 episodios, 92.628 fotogramas a 20 FPS, con una única tarea ("Pick up the red cube and place it on top of the blue cube. Then pick up the green cube and place it on top of the red cube."). La configuración de entrenamiento publicada es de 25.000 pasos, batch size 16, optimizador AdamW, learning rate 2,5e-05, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni de ninguna fase de refinamiento posterior al entrenamiento supervisado, ni el número total de tokens o muestras visto más allá de los 92.628 fotogramas del dataset.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 8 dimensiones a partir de dos vistas RGB de 256x256 y un vector de estado de 16 dimensiones.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante un prompt de texto en el momento de la inferencia.
- Ejecución de una tarea de apilado de precisión en tres pasos: coger el cubo rojo y colocarlo sobre el azul, y después coger el verde y colocarlo sobre el rojo.
- Aprendizaje por imitación especializado: reproduce la distribución de demostraciones del dataset franka-stack-300e (posiciones, iluminación y disposición de objetos presentes en la grabación).
- Inferencia en bucle cerrado a la cadencia del control del robot (el dataset está grabado a 20 FPS).
- Tool calling / function calling: no aplicable.
- Agentes y razonamiento multi-paso en lenguaje: no aplicable.
- Generación de texto, código o matemáticas: no aplicable.
- Capacidades multilingües: no disponible; no es un modelo generativo de lenguaje.
- Modo "thinking", visión general, audio: no disponible.

## Casos de uso

- Automatización de apilado en célula de trabajo: la política ejecuta directamente la secuencia de apilado de tres cubos sobre un Franka, con las cámaras `top` y `wrist_cam` montadas como en el dataset. Es el uso para el que fue entrenada y el único con probabilidad razonable de éxito sin reentrenamiento.
- Punto de partida para ajuste fino con objetos o posiciones nuevas: partiendo de `lerobot/pi05_base` o de este checkpoint, se puede reentrenar con `lerobot-train` sobre un dataset propio de otro tipo de piezas, reutilizando la configuración publicada (25.000 pasos, batch 16, lr 2,5e-05) como referencia.
- Banco de pruebas de reproducibilidad en robótica: sirve para verificar que una instalación concreta de LeRobot 0.6.2, un Franka y dos cámaras OpenCV reproduce el flujo de inferencia documentado con `lerobot-rollout`.
- Evaluación de robustez ante cambios de dominio: al ser una política entrenada en un dataset pequeño y homogéneo, es un caso útil para medir la degradación al variar iluminación, posición de los cubos o textura de la mesa, y para cuantificar la brecha entre el rendimiento en entrenamiento y en robot real.
- Docencia y prácticas de aprendizaje por imitación: el par modelo + dataset (304 episodios, 92.628 fotogramas, 20 FPS) es un ejemplo completo y de tamaño manejable para ilustrar el ciclo registro-calibración-entrenamiento-despliegue en LeRobot.
- Investigación en generalización de VLA: permite comparar el comportamiento de π₀.₅ ajustado en una tarea estrecha frente al modelo base, y estudiar hasta qué punto el condicionamiento por lenguaje permite reutilizar la política con instrucciones reformuladas.
- Integración en pipelines de robótica tipo ROS 2: la salida de 8 dimensiones puede mapearse a un controlador de bajo nivel, aunque el repositorio no incluye ningún adaptador ni nodo ROS y esa integración habría que desarrollarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla de resultados en robot real, pero está sin rellenar y declara explícitamente: "No evaluation results have been provided for this policy yet." No hay cifras de tasa de éxito, número de ensayos, MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no aplican a una política de control motriz.

## Requisitos de hardware

- VRAM estimada (cálculo a partir de los 4,14 mil millones de parámetros; la model card no publica requisitos): ~16,6 GB en FP32, ~8,3 GB en BF16/FP16 solo para pesos, y en torno a 10-12 GB contando activaciones y buffers de inferencia en BF16. En INT8 serían ~4,1 GB y en INT4 ~2,1 GB, pero no hay checkpoints cuantizados publicados y esas conversiones no están documentadas para LeRobot.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM para BF16 (RTX 4090, RTX 4080, RTX 3090, A100 40 GB, H100). Una GPU de 24 GB ofrece margen suficiente para el bucle de control.
- ¿Cabe en GPU de consumo? Sí, en BF16 cabe con holgura en RTX 4090, RTX 3090 o A100, y de forma ajustada en tarjetas de 16 GB. El cuello de botella real no es la memoria sino la latencia, porque el modelo debe producir acciones dentro del período de control.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout --strategy.type=base --policy.path=nsk11235/franka-stack-300e-pi05-25k`, con `--policy.device=cuda` para entrenamiento/inferencia en GPU. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponible. Como referencia temporal, el dataset se grabó a 20 FPS (50 ms por paso de control); la model card no publica la latencia de inferencia real ni la frecuencia de control alcanzable en el robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nsk11235/franka-stack-300e-pi05-25k | ~4,14 B | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/pi05_base (modelo base) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace (referenciado como base) |
| Otros VLA de manipulación (OpenVLA, GR00T y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de los modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa. La única comparación sólida es la relación de dependencia con `lerobot/pi05_base`: este checkpoint es un ajuste fino de 25.000 pasos sobre dicho modelo base, especializado en una tarea y un montaje de robot concretos.

## Limitaciones y advertencias

- Especialización extrema: la política se ha entrenado sobre 304 episodios de una única tarea con una disposición de objetos concreta. Fuera de esa configuración (otros objetos, otra iluminación, otra mesa, otro robot) el comportamiento esperado se degrada y no hay datos de evaluación que cuantifiquen cuánto.
- Sin resultados de evaluación: no existen cifras de tasa de éxito en robot real, ni número de ensayos, ni comparación con el modelo base. Cualquier afirmación sobre su fiabilidad sería especulativa.
- Dependencia estricta del entorno: las cámaras deben llamarse `top` y `wrist_cam` y respetar los formatos de observación (3, 256, 256) y (16,). Cualquier cambio en el montaje, la calibración o el orden de las claves de observación invalida la política.
- Riesgo de alucinación: en el sentido clásico de los modelos de lenguaje no aplica, pero sí existe el riesgo equivalente de acciones erráticas o inseguras cuando el estado observado se aleja de la distribución del dataset. Se recomienda operar con límites de par, parada de emergencia y espacio de trabajo despejado.
- Sesgos: la política hereda los sesgos del dataset y del modelo base π₀.₅, incluidas las condiciones de iluminación, los materiales y los colores de los cubos usados en la grabación. No se documentan análisis de sesgo.
- Limitaciones de idioma: la instrucción de tarea se proporciona en inglés en la documentación. No hay datos sobre el comportamiento con instrucciones en castellano u otros idiomas.
- Cuantización: no hay versiones GGUF, AWQ, GPTQ ni FP8 publicadas, por lo que no se puede reducir el consumo de memoria sin convertir los pesos por cuenta propia, con el riesgo de degradar la política de control.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se debe conservar el aviso de licencia y la atribución. La licencia del modelo base `lerobot/pi05_base` no se detalla en la información proporcionada y conviene verificarla antes de un uso comercial.
- Madurez: 0 descargas, 0 "likes" y creación el 29 de septiembre de 2026. Es un artefacto sin validación externa ni mantenimiento conocido.
- Longitud de contexto y número de tokens de entrenamiento: no disponibles; no se puede estimar el coste de ampliar la instrucción de tarea ni el presupuesto de cómputo empleado en el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nsk11235/franka-stack-300e-pi05-25k
- Dataset de entrenamiento: https://huggingface.co/datasets/nsk11235/franka-stack-300e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nsk11235/franka-stack-300e
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Registro de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
