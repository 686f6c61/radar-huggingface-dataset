# albarodriguezsalvador/act-green-square-test

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Este repositorio concreto, `albarodriguezsalvador/act-green-square-test`, contiene una política entrenada con LeRobot sobre un robot `so_follower` (SO-100/101 de The Robot Studio) para una tarea de manipulación muy específica: seleccionar el cuadrado verde entre cuatro cuadrados. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (estado de las articulaciones e imágenes de dos cámaras) a comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware de consumo. Consume dos flujos de imagen de 480x640 (cámara frontal y cámara del gripper) junto con un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones a 30 FPS.

Es relevante como ejemplo práctico del flujo de trabajo de LeRobot para robótica de imitación: entrenamiento a partir de un dataset de teleoperación pequeño (29 episodios, 14.236 frames) y despliegue directo con `lerobot-rollout`. Su valor es demostrativo y educativo, no de producción general: la tarea es única y el entrenamiento es muy corto (200 pasos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por frame) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no aplica (politica robotica; la tarea se describe en ingles) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT emplea un transformer que combina un backbone visual (procesa las dos imagenes de 3x480x640) con un encoder del estado de las articulaciones (vector de 6 dimensiones) y un decoder que genera *chunks* de acciones, es decir, secuencias cortas de comandos en lugar de un unico paso. Esta prediccion por fragmentos reduce el error de acumulacion y mejora la estabilidad en tareas de imitacion, tal como se describe en el paper arXiv:2304.13705.

El entrenamiento se realizo con LeRobot 0.7.1 sobre el dataset `albarodriguezsalvador/green-square-fix-movement-001-cleaned`: 29 episodios, 14.236 frames a 30 FPS, tarea "green-square-fix-movement-001 selects the green square between 4 squares". La configuracion fue de 200 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. Se trata de un entrenamiento muy corto, orientado a validar el pipeline mas que a obtener una politica robusta. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores.

## Capacidades

- Control visomotor para manipulacion robotica: mapea imagenes de camara frontal y de gripper mas el estado articular a comandos de accion de 6 dimensiones.
- Ejecucion de una tarea de picking concreta: seleccionar el cuadrado verde entre cuatro cuadrados.
- Prediccion de chunks de accion, lo que aporta suavidad y consistencia temporal en la ejecucion.
- Inferencia en tiempo real a 30 FPS sobre un robot `so_follower`.
- Integracion nativa con LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Demostracion educativa de imitation learning: reproducir el flujo completo grabacion de datos, entrenamiento y despliegue con LeRobot usando este repositorio como referencia.
- Prototipado rapido de tareas de picking por color: sirve como plantilla para entrenar variantes (otros colores, otras posiciones) cambiando el dataset.
- Validacion de pipeline de robotica de bajo coste: el modelo corre sobre un SO-100/101 con dos camaras USB, un setup asequible para laboratorios y aficionados.
- Benchmark interno de infraestructura: al ser ligero (0,2 GB, 51,7 M de parametros), permite probar latencia y throughput de inferencia en GPUs de consumo antes de escalar a politicas mayores.
- Base para fine-tuning con datos propios: el checkpoint puede reentrenarse con `lerobot-train` sobre un dataset nuevo para adaptar la politica a otra tarea de manipulacion.
- Docencia e investigacion en robotica: ejemplo reproducible para explicar action chunking, arquitectura ACT y evaluacion de politicas en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No hay tasas de exito medidas en robot real ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parametros en precision de entrenamiento el modelo ocupa del orden de 0,2 GB en memoria, mas el coste de procesar dos imagenes de 480x640 por frame.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Tambien puede ejecutarse en CPU para pruebas, aunque con mayor latencia.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de escritorio o portatil.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la via documentada; el formato safetensors permite cargarlo con PyTorch directamente.
- Latencia y throughput: no disponibles de forma medida; el dataset y la ejecucion estan a 30 FPS, lo que fija el objetivo de tiempo real, pero no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-green-square-test (este) | 51,7 M | ACT (imitation learning) | 2 imagenes 480x640 + estado (6,) | no disponible | Hugging Face (LeRobot) |
| Otros checkpoints ACT de LeRobot | variable (decenas de millones) | ACT | imagenes + estado | variable segun autor | Hugging Face |
| Diffusion Policy (referencia LeRobot) | variable | diffusion policy | imagenes + estado | variable | Hugging Face / LeRobot |
| SmolVLA (referencia LeRobot) | cientos de millones | VLA | vision-lenguaje-accion | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparacion se limita a categoria, tamano y disponibilidad.

## Limitaciones y advertencias

- Tarea unica y muy especifica: solo se entreno para "seleccionar el cuadrado verde entre cuatro cuadrados"; no generaliza a otras tareas sin reentrenamiento.
- Entrenamiento muy corto (200 pasos, 29 episodios): la politica probablemente no sea robusta ante cambios de iluminacion, posiciones de objetos o distracciones.
- Sin evaluacion publicada: no hay tasa de exito medida, por lo que no se puede afirmar su fiabilidad en produccion.
- Licencia no especificada: la model card indica "[More Information Needed]", lo que impide confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Dependencia de hardware concreto: entrenada para `so_follower` con camaras `front` y `gripper`; los nombres e indices de camara deben coincidir exactamente con los de entrenamiento.
- Riesgo de sobreajuste al dataset: con tan pocos episodios y pasos, el modelo puede memorizar trayectorias y fallar ante variaciones minimas.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; cualquier expectativa de ese tipo es inaplicable.
- Sin garantias de seguridad fisica: al controlar un robot real, deben tomarse precauciones (limites de par, paradas de emergencia) durante el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/albarodriguezsalvador/act-green-square-test
- Dataset de entrenamiento: https://huggingface.co/datasets/albarodriguezsalvador/green-square-fix-movement-001-cleaned
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=albarodriguezsalvador/green-square-fix-movement-001-cleaned
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
