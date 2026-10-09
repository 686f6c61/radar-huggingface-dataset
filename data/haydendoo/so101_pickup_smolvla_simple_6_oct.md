# haydendoo/so101_pickup_smolvla_simple_6_oct

## Resumen

Este repositorio contiene un policy de robótica entrenado mediante aprendizaje por imitación: un fine-tune del modelo SmolVLA (`lerobot/smolvla_base`) especializado en una única tarea de manipulación, "Pick up blue objects and put them in the tray" (recoger objetos azules y depositarlos en una bandeja). Lo desarrolla el usuario de HuggingFace `haydendoo` y se distribuye con licencia Apache 2.0 y la librería LeRobot, el stack de HuggingFace para robótica de imitación.

SmolVLA es un modelo visión-lenguaje-acción (VLA) compacto: con 450.046.176 parámetros (~450 M) y un peso de repositorio de 0,9 GB, está diseñado para ejecutarse en hardware de consumo, a diferencia de los VLA de miles de millones de parámetros que dominan la categoría. El modelo consume el estado articular de un brazo `so_follower` (6 dimensiones) junto con cuatro flujos de imagen, y produce un vector de acción de 6 dimensiones, es decir, las posiciones/velocidades objetivo de las articulaciones a 30 FPS.

Es relevante ahora porque ejemplifica el flujo de trabajo actual de la robótica open source: partir de un modelo base preentrenado, hacer fine-tuning con un dataset de demostraciones propio y modesto (20 episodios, 12.916 fotogramas) y desplegarlo en un brazo de bajo coste tipo SO-101. La contrapartida es que se trata de un checkpoint muy especializado: no hay resultados de evaluación publicados y su generalización fuera de la tarea y el montaje de cámara concretos es, como mínimo, dudosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) SmolVLA; no disponible el detalle de capas internas en la información proporcionada |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: es un policy de robótica de horizonte corto, no un LLM con ventana de contexto. La entrada es un estado de 6 dimensiones más 4 flujos de imagen; la salida es una acción de 6 dimensiones |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; el tamaño (0,9 GB para 450 M de parámetros ≈ 2 bytes por parámetro) es coherente con pesos en fp16/bf16 |
| Idiomas soportados | No disponible. No genera lenguaje natural: recibe una cadena de tarea ("Pick up blue objects and put them in the tray") como condicionamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción: combina un codificador de imágenes con la representación del estado del robot y una instrucción textual de tarea, y produce directamente acciones motoras. Frente a los VLA de gran escala, el objetivo declarado del método es lograr prestaciones competitivas con un coste computacional reducido que permita el despliegue en hardware de consumo. El modelo base `lerobot/smolvla_base` se ha preentrenado con datos de robots de la comunidad y este repositorio es un fine-tune del mismo; el método está descrito en el paper arXiv:2506.01844.

El fine-tune se ha realizado con LeRobot 0.6.1 sobre el dataset `haydendoo/so101_combined_simple_v1`: 20 episodios, 12.916 fotogramas a 30 FPS, una única tarea y un único tipo de robot (`so_follower`). La configuración de entrenamiento documentada es de 200.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000. El modelo consume `observation.state` (6,) y cuatro cámaras: tres a 256×256 (`camera1`, `camera2`, `camera3`) y una a 480×640 (`empty_camera_0`), y emite `action` (6,). No se documenta en la información disponible si hubo RLHF, DPO ni ninguna etapa de refinamiento posterior al entrenamiento por imitación.

Conviene señalar una incoherencia en la model card: la sección de detalles indica que el robot usa las cámaras `top` y `wrist`, mientras que la tabla de entradas lista tres cámaras `camera1/2/3` más `empty_camera_0`. Para reproducir el entrenamiento hay que respetar exactamente los nombres de las claves de observación con las que se entrenó el policy.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 grados de libertad para un brazo SO-101 (`so_follower`) a partir de observaciones visuales y del estado articular.
- Ejecución de una tarea concreta: "Pick up blue objects and put them in the tray", con objetos azules y una bandeja en una disposición concreta.
- Fusión multimodal: integra estado propioceptivo de 6 dimensiones con cuatro flujos de imagen simultáneos (tres a 256×256 y uno a 480×640).
- Condicionamiento por instrucción textual: acepta una cadena de tarea en el momento de la ejecución (`--task=...`).
- Inferencia en bucle cerrado: el policy se consulta repetidamente durante el rollout, por lo que puede corregir la trayectoria según lo que ve (dataset capturado a 30 FPS).
- Despliegue en hardware de consumo: el método SmolVLA está pensado explícitamente para ejecutarse en equipos no profesionales.
- No dispone de: tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión descriptiva, audio ni modo de "pensamiento". No es un asistente conversacional.

## Casos de uso

- Automatización de picking en el puesto de trabajo: el policy puede ejecutar el ciclo completo de recogida de objetos azules y depósito en bandeja sobre un SO-101, lo que sirve como célula de automatización de bajo coste en entornos educativos o de prototipado.
- Base para fine-tuning con nuevos objetos: dado que parte de `lerobot/smolvla_base` y se ha entrenado con solo 20 episodios, es un punto de partida realista para reentrenar la misma tarea con otras formas, colores o posiciones usando el comando `lerobot-train` documentado.
- Banco de pruebas de imitación (imitation learning): permite reproducir de extremo a extremo el flujo grabar datos → entrenar → hacer rollout con LeRobot, útil para validar hardware, calibración de cámaras y frecuencia de control antes de invertir en datasets mayores.
- Docencia y formación en robótica: el modelo y su dataset asociado (12.916 fotogramas a 30 FPS) se pueden inspeccionar con el visualizador de datasets de LeRobot, lo que facilita explicar cómo se relacionan las observaciones con las acciones en un VLA.
- Evaluación comparativa de VLA en GPU de consumo: con ~450 M de parámetros y 0,9 GB de pesos, permite medir latencias y tasas de éxito en tarjetas domésticas, algo inviable con VLA de 7 B o más.
- Recogida y clasificación de objetos en entornos controlados: cualquier escenario de laboratorio con objetos pequeños y una bandeja de destino, con iluminación y fondo estables, es candidato directo siempre que el objeto sea azul y la tarea coincida con la entrenada.
- Integración en pipelines de experimentación propios: el policy se carga como un módulo de LeRobot y puede invocarse desde código Python, de modo que se puede envolver en un bucle de control propio para probar estrategias de recuperación de errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación explícitamente vacía ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de éxito en robot real, ni resultados en MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar (tampoco serían aplicables a un policy de robótica).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,9 GB (450 M de parámetros a ~2 bytes por parámetro); en fp32 subirían a ~1,8 GB. Hay que añadir activaciones y búferes de imagen para cuatro flujos de cámara (tres a 256×256 y uno a 480×640), por lo que una estimación prudente de trabajo estaría en el rango de 2 a 4 GB en fp16/bf16. No hay cifras oficiales publicadas.
- GPU recomendadas: el paper del método afirma que SmolVLA se puede desplegar en hardware de consumo. Cualquier GPU con 4 GB o más de VRAM debería ser suficiente; el entrenamiento, en cambio, se beneficiará de GPUs de gama alta (RTX 4090, A100, H100) para completar los 200.000 pasos en un tiempo razonable.
- ¿Cabe en GPU de consumo? Sí. Es el caso de uso previsto del método, y el tamaño del checkpoint lo sitúa muy por debajo de los VLA de 7 B.
- Opciones de despliegue: LeRobot es la vía soportada, tanto con el CLI `lerobot-rollout` como cargando el policy desde Python. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación de texto.
- Latencia y throughput estimados: no disponible. El dato indirecto es que el dataset se capturó a 30 FPS, lo que da una referencia de la frecuencia de control que el sistema de captura consideraba adecuada, pero no garantiza que el policy alcance esa frecuencia en todas las GPUs.
- Almacenamiento: 0,9 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (fine-tune de SmolVLA) | 450 M | Estado 6D + 3 cámaras 256×256 + 1 cámara 480×640 + instrucción de tarea | Apache 2.0 | HuggingFace, librería LeRobot |
| `lerobot/smolvla_base` | 450 M (modelo base del que deriva) | Entradas genéricas definidas por el dataset de fine-tuning | Apache 2.0 | HuggingFace |
| OpenVLA-7B | 7 B (según la nomenclatura del modelo) | 1 cámara + instrucción en lenguaje natural | No disponible en la información proporcionada | HuggingFace |
| π0 (Physical Intelligence) | No disponible en la información proporcionada | Múltiples cámaras + estado del robot | No disponible en la información proporcionada | No disponible en la información proporcionada |

No hay datos de rendimiento comparativo publicados para este checkpoint, por lo que la comparación se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no se ha publicado ninguna tasa de éxito, ni número de ensayos, ni condiciones de prueba. Cualquier uso en producción parte de una base empírica nula.
- Dataset mínimo y muy específico: 20 episodios y 12.916 fotogramas para una única tarea. Esto limita gravemente la robustez ante cambios de iluminación, posición de los objetos, tipo de objeto o presencia de distractores.
- Especialización excesiva: solo se ha entrenado con objetos azules y una bandeja. Es esperable que falle con objetos de otros colores, formas o tamaños, y fuera de la disposición de cámara usada durante la captura.
- Sensibilidad al montaje: los nombres y la configuración de las cámaras deben coincidir exactamente con las claves de observación del entrenamiento. La propia model card se contradice entre la lista de cámaras (`top`, `wrist`) y la tabla de entradas (`camera1/2/3`, `empty_camera_0`), lo que puede provocar fallos silenciosos.
- Entrada `empty_camera_0` a 480×640: la denominación sugiere que en el entrenamiento se usó como relleno de una ranura de cámara. Conviene verificar si contiene información real o es un canal vacío antes de depender de ella.
- Sin capacidades de lenguaje: no puede interpretar instrucciones nuevas ni mantener conversaciones; la cadena de tarea es un condicionamiento fijo aprendido, no una orden generalizable.
- Riesgo de sobreajuste y de comportamientos erráticos: con 200.000 pasos sobre 12.916 fotogramas, el número de épocas efectivas es muy elevado. No se documentan técnicas de regularización ni validación con datos retenidos.
- Sesgos: al depender de demostraciones humanas, el policy reproduce las trayectorias y posibles ineficiencias del operador que grabó los datos; no se documenta diversidad de demostradores.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de `lerobot/smolvla_base`, cuyos términos conviene revisar también. Además, la responsabilidad por el comportamiento físico del robot recae en quien lo despliega: un policy que mueve un brazo real puede causar daños materiales o personales.
- Advertencia de seguridad operativa: al tratarse de control motor en bucle cerrado, hay que prever paradas de emergencia, límites de par y supervisión humana durante las pruebas.
- Fecha del repositorio: las marcas temporales indican creación el 9 de octubre de 2026, con 0 descargas y 0 "likes" en el momento de la consulta, es decir, sin validación por parte de la comunidad.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información técnica relevante sobre el modelo (son páginas de contenido para adultos sin relación alguna) y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haydendoo/so101_pickup_smolvla_simple_6_oct
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/haydendoo/so101_combined_simple_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=haydendoo/so101_combined_simple_v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de policies: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (`lerobot-*`): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Enlaces adicionales encontrados en la búsqueda web: no disponible (los resultados devueltos no guardan relación con el modelo).
