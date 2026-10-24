# Rakeshdharan56/xvla_panda_genesis_v1

## Resumen

`xvla_panda_genesis_v1` es una política robótica de tipo visión-lenguaje-acción (VLA) publicada por el usuario Rakeshdharan56 en Hugging Face, obtenida por ajuste fino del modelo base `lerobot/xvla-base`. Implementa el método X-VLA, un marco de flow matching con soft prompts aprendibles en el que cada robot o configuración de hardware se trata como una «tarea» codificada mediante un conjunto reducido de embeddings, de forma que un único modelo puede reconciliar morfologías, sensores y espacios de acción distintos.

Este checkpoint concreto está especializado en un robot `panda` con tres cámaras (`agentview`, `eye_in_hand` y una tercera vista de 224x224) y un estado propiocepceptivo de 8 dimensiones, y produce un vector de acción de 7 dimensiones. La tarea aprendida es la entrega de objetos de laboratorio (botella, vial y jeringuilla) ante nueve formulaciones distintas de la instrucción en inglés. El modelo tiene 879.738.545 parámetros (aproximadamente 880 M) y el repositorio ocupa 1,8 GB en safetensors.

Su interés práctico es doble: por un lado, es un ejemplo reproducible y completo de ajuste fino de X-VLA con LeRobot 0.5.2 sobre un dataset pequeño (383 episodios, 66.447 frames a 20 FPS); por otro, sirve como referencia de cómo se declaran entradas, salidas y configuración de entrenamiento en el ecosistema LeRobot. Conviene señalar desde el principio que el autor no ha publicado ningún resultado de evaluación en robot real, por lo que no existe evidencia pública de la tasa de éxito de la política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) con flow matching y soft prompts por robot; backbone no detallado en la informacion |
| Parametros totales | 879.738.545 (aproximadamente 880 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no se publica ventana de contexto; la politica consume observaciones por paso) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye safetensors sin variantes cuantizadas declaradas |
| Idiomas soportados | no disponible; las instrucciones del dataset estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |
| Tipo de modelo | politica de imitacion (pipeline `robotics`) |
| Robot de destino | `panda` |
| Camaras | `agentview`, `eye_in_hand` y una tercera vista |
| Entradas | `observation.images.image` (3, 256, 256); `observation.images.image2` (3, 256, 256); `observation.images.image3` (3, 224, 224); `observation.state` (8,) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | `Rakeshdharan56/pick_genesis` (383 episodios, 66.447 frames, 20 FPS) |
| Modelo base | `lerobot/xvla-base` |
| Version de LeRobot | 0.5.2 |
| Tamano del repositorio | 1,8 GB |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

X-VLA se describe en la model card como un marco VLA con flow matching y soft prompting: en lugar de condicionar el modelo únicamente con la instrucción en lenguaje natural y las observaciones visuales, se añaden un pequeño conjunto de embeddings aprendibles que identifican el robot o el montaje de hardware. Así, un mismo conjunto de pesos puede cubrir brazos, sensores y espacios de acción heterogéneos sin duplicar el modelo. En este checkpoint el condicionamiento es el de un `panda` con tres vistas de cámara y un vector de estado de 8 dimensiones; la salida es una acción continua de 7 dimensiones generada por el cabezal de flow matching. La información proporcionada no detalla el backbone de visión-lenguaje, el número de capas ni la composición exacta del vector de acción.

El entrenamiento es de imitación supervisada sobre el dataset `Rakeshdharan56/pick_genesis`: 383 episodios y 66.447 frames a 20 FPS (aproximadamente 55 minutos de grabación agregada), con nueve instrucciones distintas que combinan los verbos «give», «pass» y «hand» con los objetos botella, vial y jeringuilla. La configuración declarada es de 7.500 pasos, batch de 32, optimizador `xvla-adamw`, tasa de aprendizaje 1e-4 y semilla 1000. No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias; tampoco se describe aumento de datos, regularización ni criterio de selección del checkpoint final. No hay información sobre la innovación de decodificación o la política de inferencia más allá del uso de flow matching.

## Capacidades

- Control visuomotor de un brazo `panda` a partir de tres cámaras y un estado de 8 dimensiones, emitiendo acciones continuas de 7 dimensiones.
- Seguimiento de instrucciones en lenguaje natural en inglés para tareas de entrega de objetos, con nueve formulaciones registradas («Can you give me the bottle», «Please pass the vial», «Hand me the syringe», etc.).
- Discriminación entre tres objetos de laboratorio concretos: botella, vial y jeringuilla.
- Percepción desde cámara de agente y cámara en la muñeca (`eye_in_hand`), lo que permite combinar visión global de la escena con vista cercana al efector.
- Adaptación a nuevas morfologías mediante el mecanismo de soft prompts del marco X-VLA (capacidad del método, no validada en este checkpoint).
- No soporta tool calling ni function calling: es una política de acción, no un modelo generativo de texto.
- No soporta razonamiento multi-paso explícito ni modo «thinking»; la planificación es implícita en la política.
- No dispone de capacidades de audio, vídeo generativo ni respuesta conversacional.

## Casos de uso

- Automatización de entrega de instrumental en un banco de laboratorio: la política recibe la instrucción «Please pass the vial» y ejecuta el movimiento de alcance, agarre y entrega; es adecuada porque el dataset se grabó exactamente en ese escenario con esos tres objetos.
- Base para ajuste fino con nuevos objetos o posiciones: al estar construida sobre `lerobot/xvla-base` y entrenada con LeRobot 0.5.2, se puede reentrenar con `lerobot-train` sobre un dataset propio manteniendo el mismo formato de observaciones.
- Referencia de reproducción para investigación en imitación visual-motora: permite validar un pipeline completo (grabación, entrenamiento, rollout) con un coste de datos bajo, 383 episodios y 7.500 pasos.
- Evaluación comparativa de X-VLA frente a otras políticas: sirve como punto de partida para medir tasas de éxito en tareas de pick-and-place con un protocolo propio, dado que el autor no publica ninguna.
- Pruebas de integración de hardware en un montaje Panda: el comando `lerobot-rollout` documentado permite lanzar la política en bucle cerrado durante un tiempo acotado (`--duration`) antes de desplegarla en un experimento más largo.
- Docencia y demostraciones de VLA: el repositorio incluye instrucciones completas de instalación, calibración y ejecución, lo que facilita montar una práctica guiada sobre aprendizaje por imitación.
- Generación de datos de interacción para entrenamiento posterior: ejecutar la política con variaciones de iluminación o posición permite recoger episodios etiquetados que amplíen el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la frase «No evaluation results have been provided for this policy yet» y deja la tabla de evaluación (tarea, intentos, éxitos, tasa de éxito) sin rellenar. Tampoco se aportan métricas del método X-VLA en la información proporcionada, por lo que no se puede establecer una comparación numérica con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio de pesos ocupa 1,8 GB, coherente con un almacenamiento en bf16/fp16 de 879,7 M de parámetros (aproximadamente 1,76 GB). Se puede estimar un consumo de 2-4 GB de VRAM en bf16 sumando activaciones de tres cámaras, y de 5-7 GB en fp32. Son estimaciones derivadas del tamaño de los pesos; el autor no publica requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia en bf16; una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090, una L4 o una A100 son opciones razonables. Para reentrenamiento con batch 32 conviene una GPU de 24 GB o superior.
- Cabe en GPU de consumo: sí, con toda probabilidad, dado el tamaño del modelo; no hay confirmación del autor ni requisitos publicados.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento), con PyTorch y CUDA. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de acción.
- Latencia y throughput: el dataset se grabó a 20 FPS, lo que corresponde a un periodo de control de 50 ms por paso, pero no se publica latencia medida ni frecuencia de inferencia alcanzada en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xvla_panda_genesis_v1 | VLA con flow matching y soft prompts | 879,7 M | Politica Panda para entrega de botella, vial y jeringuilla | apache-2.0 | Hugging Face |
| lerobot/xvla-base | VLA con flow matching y soft prompts | no disponible | Modelo base multi-robot del que deriva este checkpoint | no disponible en la informacion | Hugging Face |
| Otras politicas VLA de proposito general (OpenVLA, pi0, RDT-1B, entre otras) | VLA | no disponible | Manipulacion generalista | no disponible | no disponible |

Los datos de los modelos alternativos no forman parte de la información proporcionada, por lo que se marcan como no disponibles en lugar de introducir cifras sin verificar. La comparación relevante que sí puede hacerse con los datos disponibles es interna: este checkpoint es un ajuste fino de `lerobot/xvla-base` sobre un único embodiment (`panda`) y un único dataset de 383 episodios, frente al carácter multi-robot del modelo base.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de intentos, ni condiciones de prueba, por lo que se desconoce si la política funciona de forma fiable.
- Especialización estrecha: solo tres objetos (botella, vial, jeringuilla), nueve instrucciones y un robot concreto (`panda`) con tres cámaras en posiciones determinadas. Cambiar la cámara, la iluminación o la disposición de los objetos puede degradar el comportamiento sin previo aviso.
- Dataset pequeño y una sola semilla: 383 episodios y 66.447 frames con semilla 1000; no se documenta validación cruzada ni conjunto de test, lo que aumenta el riesgo de sobreajuste al montaje de grabación.
- Sensibilidad a la calibración: el comando de inferencia exige que los nombres e índices de cámara coincidan exactamente con las claves de observación del entrenamiento y que el robot esté calibrado; cualquier desviación invalida el despliegue.
- Sin información sobre sesgos: no se analiza el comportamiento diferencial ante cambios de contexto visual, género, color de objeto u otras variables de la escena.
- Riesgo de fallo físico: al operar sobre objetos punzantes como jeringuillas, un fallo de la política puede tener consecuencias materiales; no debe usarse en entornos clínicos o con personas sin supervisión y validación independientes.
- Licencia: apache-2.0 permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base `lerobot/xvla-base` y del dataset `Rakeshdharan56/pick_genesis`, que no se detallan en la información proporcionada.
- Sin soporte conversacional ni multilingüe: las instrucciones del dataset están en inglés; no hay evidencia de que acepte instrucciones en castellano.
- Idiomas no declarados en los metadatos del repositorio, lo que dificulta evaluar su comportamiento fuera del inglés.
- Fecha de publicación posterior a la de la mayoría de referencias del ecosistema: conviene comprobar la compatibilidad con la versión de LeRobot instalada, ya que el entrenamiento se realizó con la 0.5.2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rakeshdharan56/xvla_panda_genesis_v1
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/Rakeshdharan56/pick_genesis
- Articulo de X-VLA: https://huggingface.co/papers/2510.10274
- Version en arXiv: https://arxiv.org/abs/2510.10274
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rakeshdharan56/pick_genesis
