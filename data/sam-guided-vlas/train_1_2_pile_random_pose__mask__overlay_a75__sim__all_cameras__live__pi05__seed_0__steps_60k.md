# sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_60k

## Resumen

Esta ficha describe un ajuste fino (fine-tune) de π₀.₅ (Pi05), un modelo visión-lenguaje-acción (VLA) desarrollado originalmente por Physical Intelligence y adaptado al ecosistema LeRobot de Hugging Face. El checkpoint concreto ha sido entrenado por el usuario `sam-guided-vlas` partiendo del modelo base `lerobot/pi05_base`, y su propósito es ejecutar tareas de manipulación robótica sobre un brazo Franka Panda con tres cámaras (una vista general `agentview` y dos cámaras en la muñeca, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`). El modelo consume el estado del robot (9 dimensiones) y tres imágenes RGB de 224×224, y produce un vector de acción de 7 dimensiones.

El modelo pertenece a la familia Pi05, presentada por Physical Intelligence como una evolución de π₀ orientada a la generalización en entornos y situaciones no vistos durante el entrenamiento. La implementación utilizada aquí procede del repositorio OpenPI y está integrada en LeRobot, la librería de Hugging Face para aprendizaje por imitación y despliegue de políticas robóticas.

Su relevancia es acotada pero clara: se trata de un artefacto de investigación reproducible (semilla fija, hiperparámetros documentados, dataset público) para estudiar generalización en manipulación con múltiples cámaras. No es un modelo de propósito general ni un modelo de lenguaje: es una política robótica especializada, con 4.143.404.816 parámetros y un repositorio de 9,4 GB. No se ha publicado ninguna evaluación cuantitativa de éxito en la propia model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) de la familia Pi05 (π₀.₅), implementación LeRobot derivada de OpenPI |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF/AWQ/GPTQ en el repositorio) |
| Idiomas soportados | No disponible. Las tareas del dataset y los ejemplos de la model card están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Tipo de robot | Franka Panda |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3,224,224), `observation.images.robot0_eye_in_hand` (3,224,224), `observation.images.robot0_eye_in_hand_2` (3,224,224) |
| Salidas | `action` (7,) |
| Tamano del repositorio | 9,4 GB |
| Modelo base | `lerobot/pi05_base` |
| Version de LeRobot | 0.6.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un modelo visión-lenguaje-acción: combina un componente de percepción visión-lenguaje con un cabezal que genera acciones motoras continuas, y se ejecuta como política de control a partir de observaciones multimodales (estado propioceptivo más imágenes). La model card no detalla la composición interna del backbone, el mecanismo de generación de acciones ni la dimensionalidad de las capas, por lo que esos extremos quedan como "no disponible". Lo que sí se documenta es la procedencia: π₀.₅ proviene de Physical Intelligence y está diseñado para generalizar a entornos y situaciones nuevos; la implementación aquí usada es la de LeRobot, adaptada del repositorio OpenPI.

El fine-tune se realizó sobre el dataset `sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live`, con 198 episodios, 35.267 fotogramas y una tasa de captura de 20 FPS. Las tareas cubiertas son de manipulación de objetos cotidianos: dosificador de jabón, mermelada, tarro, cereales, bloque de cuchillos, hervidor, pera, patata, boniato, bollo, cesta, comida en caja, tarta, lata, hamburguesa, limón, naranja, especias, calabaza y spray. Según el nombre del dataset (`..._sim_...`) y los nombres de cámara (`agentview`, cámaras en la muñeca), el material de entrenamiento parece provenir de simulación, aunque la model card no lo confirma explícitamente.

La configuración de entrenamiento sí está documentada: 60.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 0. No se indica número de tokens, composición exacta del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por refuerzo adicional sobre este ajuste. Tampoco se documentan innovaciones técnicas específicas de este checkpoint más allá de las del método Pi05 original.

## Capacidades

- Generación de acciones de manipulación para un brazo Franka Panda: salida de 7 grados de libertad por paso de control.
- Percepción multimodal con tres vistas simultáneas (una cámara frontal y dos en la muñeca), más el estado articular del robot.
- Ejecución de políticas de imitación condicionadas por una instrucción de tarea en lenguaje natural (por ejemplo, `--task="soap dispenser"`).
- Manipulación de objetos variados del ámbito doméstico y de alimentación (20 categorías distintas en el dataset de entrenamiento).
- Control a la frecuencia de los datos de entrenamiento (20 FPS de captura).
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general (captioning/VQA) ni audio.

## Casos de uso

- Manipulación robótica en simulación: desplegar la política en un entorno tipo robosuite con un Panda y las tres cámaras indicadas, para reproducir las tareas del dataset (`pick` de objetos como lata, limón o caja de comida). Es adecuado porque las dimensiones de entrada y salida coinciden exactamente con las observaciones del entorno de entrenamiento.
- Investigación en generalización de modelos VLA: usar el checkpoint como referencia reproducible (semilla 0, 60.000 pasos, hiperparámetros fijos) para estudiar cómo varía el éxito al cambiar posiciones de objetos, iluminación o distractores.
- Punto de partida para fine-tuning de nuevas tareas: al estar publicado en safetensors y con licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio de manipulación.
- Recogida de datos y aprendizaje por imitación: emplear la política como baseline mientras se graban episodios con `lerobot-rollout` para ampliar el dataset.
- Evaluación comparativa de variantes de Pi05: contrastar este ajuste con otros checkpoints de la misma familia sobre las mismas tareas y condiciones.
- Estudio de setups multicámara: analizar la contribución de las vistas `agentview` y de muñeca en el éxito de agarre y colocación, usando las tres entradas obligatorias del modelo.
- Automatización de picking en logística o alimentación (a nivel de prototipo): la política cubre categorías de objeto propias de esas tareas, aunque no hay evidencia publicada de éxito en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía y contiene únicamente la plantilla por defecto con la nota "_No evaluation results have been provided for this policy yet._". No hay datos de MMLU, HumanEval, GSM8K (no aplicables a una política robótica) ni tasas de éxito por tarea, número de intentos o condiciones de prueba.

## Requisitos de hardware

- VRAM estimada (cálculo a partir de los 4,14 mil millones de parámetros, no confirmado por el autor): en bf16/fp16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. Hay que sumar activaciones y buffers de las tres imágenes de 224×224.
- El repositorio completo pesa 9,4 GB, lo que es coherente con pesos de precisión media (bf16) más ficheros auxiliares.
- GPU de consumo: una RTX 4090 (24 GB) o una RTX 3090/4080 (16-24 GB) deberían ser suficientes para inferencia en precisión media. Una GPU de 8 GB queda por debajo del tamaño de pesos en bf16.
- GPU de datacenter: A100 (40/80 GB), H100 o L40S para entrenamiento y fine-tuning; el entrenamiento de este checkpoint usó lote 16 con AdamW, lo que implica memoria adicional de estados del optimizador.
- Opciones de despliegue: la vía prevista es LeRobot, con los comandos `lerobot-rollout` (inferencia sobre robot) y `lerobot-train` (reentrenamiento). Se requiere entorno CUDA (`--policy.device=cuda` en el ejemplo de entrenamiento). No se documentan rutas de despliegue con vLLM, TGI, llama.cpp u Ollama, que no son aplicables a una política de control.
- Latencia y throughput: no disponibles. La única referencia temporal es la tasa de los datos de entrenamiento, 20 FPS.

## Comparativa con modelos similares

Los datos públicos disponibles son muy limitados. Se compara con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Tipo de robot | Camaras | Licencia | Resultados publicados |
|---|---|---|---|---|---|---|
| Este checkpoint (`sam-guided-vlas/...steps_60k`) | 4,14 mil millones | No disponible | Franka Panda | 3 (`agentview` + 2 en muñeca) | Apache 2.0 | Ninguno en la model card |
| `lerobot/pi05_base` | No disponible | No disponible | No especificado | No especificado | No disponible en la información proporcionada | No disponible |
| Otras variantes de Pi05 / π₀ en OpenPI | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de OpenVLA, Octo, RDT ni otras políticas VLA comparables en la información proporcionada, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito, número de intentos ni condiciones de prueba. No se puede afirmar que la política funcione en robot real.
- Sesgos del dataset: entrenado con 198 episodios y 35.267 fotogramas de 20 tareas concretas, con posiciones posiblemente aleatorizadas (`random_pose`). La generalización fuera de esa distribución no está medida.
- Dependencia fuerte del setup: la política espera exactamente tres cámaras con los nombres `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`, más un vector de estado de 9 dimensiones. Cualquier cambio en el montaje, la resolución o los nombres de las claves invalida la inferencia.
- Posible origen simulado de los datos (el nombre del dataset contiene `sim`), lo que introduce riesgo de brecha sim-a-real no cuantificada.
- Idiomas: no se declaran idiomas soportados; las instrucciones de tarea del dataset están en inglés. No hay evidencia de que las instrucciones en castellano funcionen.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de `lerobot/pi05_base` conviene verificar las condiciones del modelo base y de la implementación OpenPI antes de un despliegue comercial.
- Model card generada con la plantilla de LeRobot: contiene marcadores de posición sin rellenar (demo, evaluación) y campos incompletos, por lo que no debe tomarse como documentación técnica completa.
- Riesgo de sobreajuste al objeto y a la tarea: el modelo no razona ni planifica en lenguaje; reproduce comportamientos motores aprendidos por imitación.
- Sin métricas de latencia: no se puede garantizar el cumplimiento de un bucle de control a 20 FPS en hardware concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a una serie de televisión y a un fabricante de herramientas, sin relación con el modelo.
