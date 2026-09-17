# hackathon1-fmm/act_saddle_picking_robot_1_v0_h200x4_20k

## Resumen

`hackathon1-fmm/act_saddle_picking_robot_1_v0_h200x4_20k` es una política de robótica entrenada mediante imitación con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular del robot y tres flujos de cámara, y produce comandos de acción de 7 grados de libertad. Lo publica el usuario `hackathon1-fmm` como artefacto de un hackathon, entrenado y subido con la librería LeRobot de Hugging Face.

El modelo resuelve una tarea concreta y única: recoger una silla de montar (saddle) y colocarla sobre un banco de trabajo verde. Para ello se entrenó con 107 episodios de teleoperación (30.225 fotogramas a 15 FPS) capturados sobre un robot `rebot_b601_follower` con tres cámaras (`front`, `side`, `wrist`). El checkpoint publicado corresponde a 20.000 pasos de entrenamiento con batch de 16 y learning rate 1e-5.

Su relevancia es práctica más que arquitectónica: ilustra el flujo completo de LeRobot para clonación de comportamiento (grabar datos, entrenar una política ACT, publicarla en el Hub y ejecutarla con `lerobot-rollout`) con un modelo de solo 51,7 millones de parámetros que cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU. No se han publicado resultados de evaluación en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); política transformer con encoder de visión y estado, cabeza de acciones con chunking |
| Parámetros totales | 51.670.663 (según safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; predice chunks de acción) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones; pesos publicados en precisión nativa) |
| Idiomas soportados | no aplica / no disponible (política robótica; la única instrucción textual es la tarea `"Pick the saddle and place it on the green workbench"`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline | robotics |
| Tipo de robot | `rebot_b601_follower` |
| Entradas | `observation.state` (7,), `observation.images.front` (3, 480, 640), `observation.images.side` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | `hackathon1-fmm/saddle_picking_robot_1_v0`: 107 episodios, 30.225 fotogramas, 15 FPS |
| Pasos de entrenamiento | 20.000 |
| Tamaño del repositorio | 2,5 GB |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice chunks cortos de acciones futuras en lugar de un único paso de control. La formulación del paper combina un transformer con un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas, más un agregado temporal (temporal ensembling) en inferencia para suavizar la transición entre chunks. El objetivo es mitigar el error de compounding típico de la clonación de comportamiento: al predecir varios pasos de golpe, el horizonte efectivo de decisión se alarga y la política es menos propensa a derivar. En este checkpoint concreto, la política toma un vector de estado de 7 dimensiones y tres imágenes RGB de 480×640 y devuelve un vector de acción de 7 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 107 episodios teleoperados (30.225 fotogramas a 15 FPS) de la tarea de recogida y colocación del saddle. La configuración declarada es: 20.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. El nombre del repositorio (`h200x4`) sugiere que el entrenamiento se ejecutó sobre 4 GPU NVIDIA H200, aunque la model card no confirma explícitamente esa configuración de hardware. No se documenta ningún tipo de ajuste posterior con RLHF, DPO o refuerzo; es aprendizaje supervisado puro sobre demostraciones.

## Capacidades

- Control visomotor de un brazo robótico de 7 grados de libertad (`rebot_b601_follower`) mediante predicción de chunks de acción.
- Fusión de tres vistas de cámara simultáneas (`front`, `side`, `wrist`), lo que aporta información tanto global de la escena como local de la pinza.
- Condicionamiento por instrucción de tarea en lenguaje natural, limitado al enunciado `"Pick the saddle and place it on the green workbench"`.
- Ejecución reactiva a partir de observaciones en tiempo real a 15 FPS (frecuencia de captura del dataset).
- Ejecución autónoma continua mediante `lerobot-rollout`, con o sin grabación de episodios (`--strategy.type=base`).
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: es una política motora, no un modelo generativo de texto.
- No hay capacidades declaradas de generalización a otras tareas, objetos o robots distintos del usado en la recogida de datos.

## Casos de uso

- Automatización de una celda de pick-and-place: el modelo ejecuta de forma autónoma la secuencia de coger el saddle y depositarlo en el banco verde, sustituyendo la teleoperación por inferencia directa sobre las tres cámaras.
- Punto de partida para un pipeline de clonación de comportamiento propio: sirve como referencia funcional de entrenamiento ACT en LeRobot (`lerobot-train --policy.type=act`) sobre un dataset propio con la misma estructura de observaciones.
- Prueba de concepto en un hackathon o demo de laboratorio: con 51,7 M de parámetros el checkpoint se carga en minutos y permite validar el ciclo completo datos-entrenamiento-despliegue sin infraestructura de GPU de gama alta.
- Investigación en imitación con múltiples cámaras: al exponer tres vistas sincronizadas, es un banco de pruebas para estudiar el efecto de la oclusión o de la cámara de muñeca en la tasa de éxito.
- Evaluación de robustez ante cambios de iluminación o de posición inicial del objeto: repetir la tarea con variaciones controladas permite caracterizar la sensibilidad de una política ACT entrenada con pocos episodios.
- Integración en un bucle de control de laboratorio: la salida `action` de 7 dimensiones puede canalizarse a un controlador de bajo nivel para experimentar con frecuencias de inferencia, ensembling temporal o suavizado de acciones.
- Generación de datos sintéticos de evaluación: ejecutando la política con `--strategy.type` de grabación se pueden registrar episodios automáticos que amplíen el dataset original de 107 episodios.
- Base para comparativas de políticas en robótica: se puede contrastar frente a un Diffusion Policy o un modelo VLA entrenados en el mismo dataset para medir coste y tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la plantilla de tabla (tarea, intentos, éxitos, tasa de éxito) sin rellenar, y declara explícitamente: "No evaluation results have been provided for this policy yet." No se dispone, por tanto, de tasas de éxito en robot real, de métricas de error de acción ni de comparaciones cuantitativas con otras políticas en esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 207 MB en FP32 y 103 MB en FP16 para los 51,7 M de parámetros. El cuello de botella real es la decodificación de las tres cámaras a 480×640, no el modelo.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU, dado el tamaño del checkpoint.
- Para entrenamiento, el nombre del repositorio sugiere 4 GPU H200; no obstante, con 51,7 M de parámetros y batch 16 es plausible entrenar en una única GPU de consumo, aunque este dato no está confirmado en la model card.
- Opciones de despliegue: la vía documentada es la CLI de LeRobot (`lerobot-rollout` con `--policy.path=hackathon1-fmm/act_saddle_picking_robot_1_v0_h200x4_20k`), que requiere el robot `rebot_b601_follower` y cámaras OpenCV configuradas a 640×480 y 30 FPS. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El único dato relacionado es la frecuencia del dataset, 15 FPS, y la configuración de cámara de ejemplo a 30 FPS.
- Requisitos adicionales: puerto serie del robot, calibración del `rebot_b601_follower` y nombres de cámara que coincidan exactamente con las claves de observación (`front`, `side`, `wrist`).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_saddle_picking_robot_1_v0 (este) | ACT sobre LeRobot | 51,7 M | Estado (7,) + 3 cámaras 480×640 | apache-2.0 | Hugging Face Hub, librería `lerobot` |
| Diffusion Policy (Chi et al., 2023) | Política por difusión para imitación | no disponible en la información proporcionada | típicamente estado + imágenes RGB | no disponible en la información proporcionada | implementaciones públicas en frameworks de robótica |
| SmolVLA (Hugging Face) | VLA compacto sobre LeRobot | no disponible en la información proporcionada | estado + imágenes + instrucción textual | no disponible en la información proporcionada | Hugging Face Hub, librería `lerobot` |
| Otras políticas ACT publicadas en el Hub | ACT sobre LeRobot | variable según checkpoint | variable según dataset | habitualmente apache-2.0 | Hugging Face Hub |

La comparación cuantitativa de tasa de éxito, contexto y rendimiento no está disponible: este repositorio no publica evaluación y las alternativas citadas no se han medido sobre este mismo dataset ni con este mismo robot. Cualquier comparación de éxito sería especulativa.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea, un único robot y un montaje de cámaras concreto. Fuera de ese contexto (otro objeto, otra posición del banco, otro robot) no hay ninguna garantía de funcionamiento.
- Sin evaluación publicada: no existe ninguna tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad incluso en la tarea nominal.
- Dataset pequeño: 107 episodios y 30.225 fotogramas son un volumen reducido, lo que incrementa el riesgo de sobreajuste a las condiciones de captura (iluminación, fondo, posiciones iniciales).
- Dependencia del entorno visual: cambios en la iluminación, en el fondo, en la vestimenta de los operarios o en la disposición de las cámaras pueden degradar el comportamiento de forma abrupta.
- Sensibilidad al calibrado: el modelo asume la correspondencia estado-acción del `rebot_b601_follower` calibrado; un calibrado distinto o un desgaste mecánico introduce sesgos sistemáticos.
- Riesgo de alucinación en sentido robótico: puede generar chunks de acción plausibles pero incorrectos cuando la observación queda fuera de la distribución de entrenamiento, sin ninguna señal de incertidumbre ni mecanismo de rechazo.
- Sin capacidades lingüísticas: la instrucción de tarea es un condicionamiento fijo; no comprende lenguaje libre ni admite cambios de objetivo en tiempo de ejecución.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en un entorno físico real implica riesgos de seguridad que la licencia no cubre.
- Requisitos operativos: para desplegarlo hace falta hardware específico (robot `rebot_b601_follower`, tres cámaras, puerto serie) que limita su reproducibilidad fuera del laboratorio original.
- El nombre del repositorio menciona `h200x4` (4 GPU H200) pero la model card no lo confirma; conviene no tomarlo como configuración de entrenamiento verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hackathon1-fmm/act_saddle_picking_robot_1_v0_h200x4_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/hackathon1-fmm/saddle_picking_robot_1_v0
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hackathon1-fmm/saddle_picking_robot_1_v0
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
