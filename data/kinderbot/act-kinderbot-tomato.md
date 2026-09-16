# kinderbot/act-kinderbot-tomato

## Resumen
act-kinderbot-tomato es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), publicada por el usuario kinderbot en HuggingFace Hub y empaquetada con la librería LeRobot de HuggingFace. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado de las articulaciones de un brazo robótico y dos cámaras, y devuelve comandos de acción. La tarea concreta para la que se ha entrenado es "Pick the tomato from the box and place it on the table" (coger el tomate de la caja y dejarlo en la mesa).

El checkpoint tiene 51.668.614 parámetros totales (unos 51,7 millones) y ocupa 0,2 GB en el repositorio, con pesos en formato safetensors. La arquitectura sigue el diseño ACT publicado en el artículo arXiv:2304.13705, que predice secuencias cortas de acciones (chunks) en lugar de un único paso de control, lo que reduce el error de acumulación y permite ejecutar gestos suaves con datos de teleoperación limitados.

Su relevancia es práctica para quien trabaja con robots de bajo coste tipo SO-100/SO-101 (el campo `robot type` es `so_follower`): demuestra un flujo completo de LeRobot (grabar episodios, entrenar, publicar y desplegar) con un dataset pequeño de 31 episodios y 26.937 fotogramas. Con cero descargas y cero likes en el momento de la consulta, es un artefacto muy reciente (creado el 16 de septiembre de 2026) y sin resultados de evaluación publicados, por lo que debe tratarse como una política experimental o reproducible, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador VAE condicional; no es un modelo de lenguaje |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control visomotor con ventana de observacion fija) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible (la tarea se especifica como cadena de texto; el ejemplo de la model card usa ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de política LeRobot) |
| Tipo de robot | `so_follower` |
| Camaras | `wrist` y `front`, a 480x640 y 30 FPS |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento
ACT es un método de aprendizaje por imitación basado en un transformer que aprende a predecir trozos de acción (action chunks) en lugar de un paso individual, con un codificador VAE condicional que modela la variabilidad de las demostraciones humanas. El diseño habitual del método, descrito en el artículo arXiv:2304.13705, combina extractores de características visuales (típicamente ResNet) para cada cámara con un codificador transformer que fusiona estado y observaciones, y un decodificador transformer que emite la secuencia de acciones. La model card no detalla la configuración exacta de capas ni el tamaño del chunk para este checkpoint concreto, por lo que esos valores deben considerarse no confirmados.

Los datos de entrenamiento proceden del dataset `kinderbot/kinderbot-pick-tomato`: 31 episodios, 26.937 fotogramas a 30 FPS (aproximadamente 15 minutos de teleoperación) y una única tarea. La configuración declarada es de 100.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.2. No se documenta el uso de RLHF, DPO ni de ningún ajuste posterior por preferencias; es aprendizaje supervisado por imitación puro.

## Capacidades
- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones a partir del estado articular y de dos vistas de cámara.
- Ejecución de una tarea específica pick-and-place: "Pick the tomato from the box and place it on the table".
- Predicción de chunks de acción, lo que produce trayectorias más suaves y reduce el error acumulado respecto a políticas paso a paso.
- Condicionamiento por instrucción de tarea en forma de cadena de texto, que se pasa en tiempo de ejecución mediante el parámetro `--task` de `lerobot-rollout`.
- Integración nativa con el ecosistema LeRobot para entrenamiento, publicación en el Hub y despliegue en robot real.
- Soporte de ejecución en bucle cerrado a 30 FPS con dos flujos de imagen simultáneos.
- No soporta tool calling, function calling, razonamiento multi-paso, uso de agentes, ni capacidades de audio o visión general: esas capacidades no aplican a una política de robótica.

## Casos de uso
- Automatización de pick-and-place en línea de clasificación: el modelo puede recoger un objeto concreto de un contenedor y depositarlo en una superficie plana, replicando la tarea de entrenamiento sobre un brazo `so_follower`.
- Punto de partida para fine-tuning en tareas similares: al ser un checkpoint ACT entrenado con el mismo esquema de observaciones (estado de 6 dimensiones y dos cámaras), sirve como inicialización para nuevas tareas de recogida con pocos episodios adicionales.
- Banco de pruebas de hardware SO-100/SO-101: permite validar calibración, montaje de cámaras, sincronía y latencias de un montaje concreto antes de invertir en la recogida de un dataset propio.
- Docencia y divulgación en aprendizaje por imitación: el flujo completo de LeRobot (grabar, entrenar, publicar, desplegar) puede reproducirse de principio a fin con 31 episodios de demostración.
- Protocolo de comparación interna de políticas: al tener una configuración de entrenamiento documentada (100.000 pasos, lote 8, AdamW, lr 1e-5), se puede usar como referencia para medir el efecto de cambios en resolución de cámara, número de episodios o aumentos de datos.
- Demostraciones en ferias y laboratorios: la tarea está acotada y el modelo es pequeño, lo que facilita montar una celda repetible de corta duración para mostrar manipulación aprendida.
- Investigación sobre robustez a variaciones: sirve para estudiar cómo degrada el éxito ante cambios de posición del tomate, iluminación o presencia de distractores, precisamente porque no hay evaluación publicada que cubra esos escenarios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet". No existen, por tanto, tasas de éxito, número de ensayos ni condiciones de prueba para este checkpoint.

## Requisitos de hardware
- VRAM estimada para inferencia: el peso en safetensors ronda los 0,2 GB; con los dos flujos de imagen a 480x640 y el estado de 6 dimensiones, es razonable esperar un consumo inferior a 2 GB, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria es suficiente en la práctica; no se requiere A100 ni H100 para inferencia. Para reentrenamiento, una GPU de gama media acelera los 100.000 pasos declarados.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en plataformas integradas tipo Jetson Orin, si bien el rendimiento en estos casos no está verificado en la información disponible.
- Opciones de despliegue: flujo oficial de LeRobot mediante `lerobot-rollout` con `--policy.path=kinderbot/act-kinderbot-tomato` y `--strategy.type=base`; el entrenamiento se realiza con `lerobot-train` y `--policy.type=act`. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponible. El bucle de control del dataset y del ejemplo de ejecución está fijado a 30 FPS, pero no se documenta la tasa efectiva alcanzable por el checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-kinderbot-tomato (este) | ACT, imitacion, chunking | 51,7 M | no aplica (observacion fija de 2 camaras + estado) | apache-2.0 | HuggingFace Hub, via LeRobot |
| Diffusion Policy | politica de difusion para manipulacion | no disponible | no aplica | no disponible en la informacion proporcionada | repositorio de investigacion |
| SmolVLA (HuggingFace) | VLA compacto de LeRobot | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace Hub, via LeRobot |
| pi0 / openpi (Physical Intelligence) | VLA de proposito general | no disponible | no disponible | no disponible en la informacion proporcionada | publicacion y repositorio |

Los datos de los modelos alternativos no aparecen en la información proporcionada, por lo que las celdas correspondientes se dejan como no disponibles en lugar de estimarlas.

## Limitaciones y advertencias
- Sesgos: no hay análisis de sesgos publicado; al entrenarse con 31 episodios de un único operador y un único entorno, la política heredará las posiciones, velocidades y estrategias de agarre de esas demostraciones.
- Riesgo de fallo en ejecución: no se ha publicado ninguna tasa de éxito. Cualquier uso en un robot real debe hacerse con supervisión, parada de emergencia accesible y límites de par configurados.
- Generalización limitada: una sola tarea ("Pick the tomato from the box and place it on the table"), 26.937 fotogramas y 31 episodios implican muy poca variabilidad de objeto, iluminación y posición. Se desconoce el comportamiento ante distractores o cambios de fondo.
- Dependencia del montaje: la política espera exactamente las claves `observation.state` (6,), `observation.images.wrist` y `observation.images.front` a 480x640 y 30 FPS. Cambiar nombres de cámara, resolución o calibración invalida el comportamiento.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial y modificación, pero el usuario asume la responsabilidad de la seguridad física del montaje robótico; no hay garantías por parte del autor.
- Idiomas: la instrucción de tarea se pasa como texto y el ejemplo está en inglés; no hay información sobre otros idiomas ni sobre sensibilidad a la redacción exacta del prompt.
- Madurez: cero descargas y cero likes, creado y actualizado el mismo día, sin resultados de evaluación y sin vídeo de demostración. Debe considerarse un artefacto experimental.
- Ausencia de documentación sobre cuantización: no se ofrecen variantes en GGUF, ONNX ni formatos de 8/4 bits, lo que limita el despliegue en hardware muy restringido.

## Enlaces
- Modelo en HuggingFace Hub: https://huggingface.co/kinderbot/act-kinderbot-tomato
- Dataset de entrenamiento: https://huggingface.co/datasets/kinderbot/kinderbot-pick-tomato
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kinderbot/kinderbot-pick-tomato
- Articulo ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces obtenidos correspondian a noticias de futbol sin ninguna conexion con el artefacto, por lo que se han descartado.
