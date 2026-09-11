# MoAIBo/pick_place_depth_posvel_base_delta_h15_policy_vision_expert_50k

## Resumen

`MoAIBo/pick_place_depth_posvel_base_delta_h15_policy_vision_expert_50k` es una política robótica de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base `lerobot/smolvla_base`, que a su vez implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. El modelo lo publica el usuario MoAIBo en Hugging Face y está pensado para ejecutar una tarea concreta de manipulación tipo *pick and place* sobre un robot `so101_tb4`: desacoplar de la base (undock), recoger un objeto azul o amarillo de una caja marrón, depositarlo en un plato blanco y volver a la base.

Se trata de un modelo compacto de 450.046.176 parámetros (unos 450 M) y 0,9 GB de pesos en safetensors, entrenado con 50.000 pasos sobre un dataset propio de 96 episodios y 127.103 fotogramas a 30 FPS. Su interés práctico radica en que una política VLA de este tamaño puede ejecutarse en hardware de consumo y a la frecuencia de control de un brazo robótico real, algo que modelos VLA de miles de millones de parámetros no permiten sin infraestructura dedicada.

La relevancia actual viene de la familia SmolVLA y del ecosistema LeRobot: el modelo es un ejemplo reproducible de ajuste fino de una política multimodal con entradas de estado propioceptivo (11 dimensiones), cinco cámaras (incluida profundidad) y salida de acciones continuas (8 dimensiones), con licencia Apache 2.0. No es un modelo de lenguaje: es una política de control entrenada por imitación, por lo que sus capacidades se limitan a la tarea y al robot para los que fue entrenada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language-action (VLA) basada en SmolVLA, ajustada desde `lerobot/smolvla_base`; el detalle de capas y del experto de acciones no se especifica en la información disponible |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume ventanas de observación de estado y series de imágenes) |
| Tipos de cuantizacion | no se declaran cuantizaciones en el repositorio; los pesos se distribuyen en safetensors. Compatible con conversión manual a FP16/BF16 e INT8, sin recetas oficiales publicadas |
| Idiomas soportados | no disponible (la condicion de tarea se introduce como texto en ingles en los ejemplos, pero no se declara cobertura multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`, tamano de repositorio 0,9 GB) |
| Tipo de robot | `so101_tb4` |
| Entradas | `observation.state` (11), `observation.images.camera_left` (3, 360, 640), `observation.images.camera_right` (3, 360, 640), `observation.images.camera_wrist` (3, 360, 640), `observation.images.camera_d455` (3, 360, 640), `observation.images.depth` (3, 360, 640) |
| Salidas | `action` (8) |
| Tarea entrenada | "Undock, pick up the blue object from the brown box, place it on the white plate, and return to the dock." y la variante con objeto amarillo |

## Arquitectura y entrenamiento

El modelo es una política de visión-lenguaje-acción construida sobre SmolVLA, la arquitectura del paper arXiv:2506.01844, orientada a rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo. El punto de partida es el checkpoint preentrenado `lerobot/smolvla_base` y el ajuste fino se ha realizado con la librería LeRobot 0.6.0. La política combina un flujo de observación multimodal (estado propioceptivo de 11 dimensiones más cinco cámaras RGB-D a 360×640) con una cabeza de predicción de acciones continuas de 8 dimensiones. El nombre del repositorio sugiere representación de acciones en modo delta, espacio posición-velocidad y un horizonte de acción de 15 pasos (`h15`), aunque estos extremos no están documentados explícitamente en la model card. El detalle interno de la composición del backbone y del experto de acciones no se proporciona en la información disponible.

El entrenamiento se realizó sobre el dataset `MoAIBo/merged_so101_tb4_pick_place_depth_posvel_base_delta_h15`, con 96 episodios, 127.103 fotogramas a 30 FPS (aproximadamente 70 minutos de demostraciones) y dos variantes de la misma tarea según el color del objeto. La configuración declarada es de 50.000 pasos con optimizador AdamW, learning rate 0,0001, batch size 13 y semilla 1000, lo que equivale a unas 650.000 muestras procesadas y, de forma aproximada, a unas cinco pasadas sobre el dataset. Es un ajuste fino por imitación (behavior cloning) sobre demostraciones teleoperadas; no se declara uso de RLHF, DPO ni refuerzo.

## Capacidades

- Control robótico continuo: genera acciones de 8 dimensiones a partir de observaciones de estado y cinco flujos visuales.
- Manipulación pick and place: recoger un objeto (azul o amarillo) de una caja marrón y depositarlo en un plato blanco.
- Navegación básica de ida y vuelta: la tarea incluye desacoplar de la base al inicio y volver a ella al final.
- Fusión multimodal de cuatro cámaras RGB (`camera_left`, `camera_right`, `camera_wrist`, `camera_d455`) más una entrada de profundidad.
- Condicionamiento por instrucción textual de la tarea (el prompt de tarea se pasa en el momento de la ejecución, por ejemplo con `lerobot-rollout`).
- Ejecución sobre hardware de consumo, según las características declaradas para la familia SmolVLA.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual, generación de texto ni matemáticas: no es un modelo de lenguaje, sino una política de control.
- No se declaran capacidades multilingües ni de audio.

## Casos de uso

- Automatización de líneas de montaje ligeras: la política ejecuta ciclos repetitivos de recogida y colocación de piezas con un brazo `so101_tb4`, sustituyendo la programación manual de trayectorias por una política aprendida de demostraciones.
- Clasificación por color en logística: como el modelo fue entrenado con objetos azules y amarillos y la instrucción se pasa como texto, puede reutilizarse para enrutar piezas de distinto color hacia el mismo punto de destino.
- Investigación en imitación robótica: sirve como referencia reproducible de ajuste fino de SmolVLA con LeRobot 0.6.0, con hiperparámetros y dataset públicos que permiten replicar el entrenamiento y comparar variantes.
- Punto de partida para nuevos dominios: al ser un modelo base de 450 M con licencia Apache 2.0, es un candidato razonable para reajustar con datos propios de otra tarea de pick and place añadiendo o cambiando cámaras.
- Experimentación con percepción de profundidad: al consumir `observation.images.depth` junto a cuatro cámaras RGB, permite estudiar la contribución de la profundidad en el éxito de la tarea comparando con variantes sin esa entrada.
- Prototipado en laboratorio con presupuesto limitado: al caber en GPU de consumo, un grupo académico puede ejecutar el ciclo percepción-acción completo sin acceso a clústeres con A100/H100.
- Demostraciones y docencia: la ejecución con `lerobot-rollout --strategy.type=base` permite grabar demos de la tarea sin registrar episodios, útil para material docente sobre VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la plantilla vacía y la indicación de que se sustituya la línea "No evaluation results" por una tabla de ensayos reales (tarea, intentos, éxitos, tasa de éxito), pero no se aporta ninguna cifra de éxito en robot real ni comparación con otros modelos. Tampoco se declaran métricas de latencia, throughput ni tasa de aciertos en simulación.

## Requisitos de hardware

- Pesos: 450 M de parámetros ocupan aproximadamente 1,8 GB en FP32, 0,9 GB en BF16/FP16 y en torno a 0,45 GB en INT8. El repositorio completo pesa 0,9 GB.
- VRAM estimada para inferencia: del orden de 2-3 GB en BF16 sumando pesos, activaciones y los cinco flujos visuales a 360×640; puede bajar de 1 GB con cuantización INT8. Son estimaciones a partir del tamaño del modelo, no medidas publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM en BF16. Cabe en RTX 3060, RTX 4060, RTX 4090, L4, T4, y en módulos embebidos tipo Jetson Orin. El modelo base SmolVLA está declarado como desplegable en hardware de consumo. Para entrenamiento, una GPU con 12-24 GB es suficiente por el reducido tamaño de los lotes (batch 13).
- Despliegue: el camino soportado es LeRobot, con `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento; se ejecuta sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje causal sino una política de control con formato de entrada-salida propio.
- Latencia y throughput: no se declaran. La referencia operativa es el bucle de control a 30 FPS del dataset de entrenamiento; el paper del modelo base describe inferencia asíncrona, pero no hay cifras medidas en esta ficha.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de conocimiento general y no están verificados en la información proporcionada; se marcan como no disponibles los campos no confirmados.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (SmolVLA ajustado) | 450 M | VLA para `so101_tb4`, 5 cámaras + estado | Apache-2.0 | Repositorio Hugging Face, safetensors, librería LeRobot |
| `lerobot/smolvla_base` | 450 M | VLA base preentrenado, ajustable a múltiples robots | no disponible en la información proporcionada | Hugging Face, integrado en LeRobot |
| OpenVLA | 7 B | VLA de propósito general basado en un VLM de 7 B | no disponible en la información proporcionada | Pesos abiertos en Hugging Face |
| Políticas ACT de LeRobot | decenas de millones de parámetros (según configuración) | Política de imitación con encoder visual y transformer de acciones, sin componente de lenguaje | Apache-2.0 en el ecosistema LeRobot | Entrenable con LeRobot; no es VLA |

La diferencia clave frente a OpenVLA u otros VLA de miles de millones de parámetros es el coste: 450 M de parámetros permiten inferencia en GPU de consumo a frecuencia de control, a cambio de una especialización mucho mayor y sin capacidades de lenguaje general.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único tipo de robot (`so101_tb4`). Fuera de esa tarea, con otros objetos, otras posiciones o otro hardware, su comportamiento no está garantizado.
- Sin resultados de evaluación publicados: no hay tasa de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Dependencia de la configuración de sensores: exige exactamente los cinco flujos visuales y el vector de estado de 11 dimensiones con los nombres declarados. Si los nombres de cámara no coinciden con las claves de observación del entrenamiento, la ejecución falla o produce acciones inválidas.
- Riesgo de sobreajuste al entorno de grabación: con solo 96 episodios, la política puede degradarse ante cambios de iluminación, fondo, posición inicial del objeto o del robot.
- Riesgo de alucinación en sentido robótico: la política puede generar trayectorias plausibles pero incorrectas, con colisiones o caídas de objetos, especialmente fuera de la distribución de los datos de demostración. No existe mecanismo de abstención ni de verificación semántica.
- Sin soporte multilingüe declarado: la condicion de tarea se ejemplifica en inglés; no hay evidencia de que instrucciones en castellano funcionen.
- Advertencia de seguridad física: al controlar un brazo real, requiere parada de emergencia, límites de par y supervisión humana durante las pruebas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero obliga a conservar los avisos de copyright y licencia y a indicar los cambios realizados. No hay garantías por parte del autor.
- Trazabilidad limitada: el autor no documenta el detalle interno de la arquitectura, el horizonte de acción ni la representación exacta de las acciones; parte de lo que sugiere el nombre del repositorio no está confirmado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MoAIBo/pick_place_depth_posvel_base_delta_h15_policy_vision_expert_50k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/merged_so101_tb4_pick_place_depth_posvel_base_delta_h15
- Visualizador de dataset de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MoAIBo/merged_so101_tb4_pick_place_depth_posvel_base_delta_h15
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo; los enlaces listados proceden de la model card y de los metadatos del repositorio.
