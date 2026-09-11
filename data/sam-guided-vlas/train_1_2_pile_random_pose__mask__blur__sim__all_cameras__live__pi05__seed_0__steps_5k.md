# sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_5k

## Resumen

Este repositorio contiene una política robótica Vision-Language-Action (VLA) obtenida por ajuste fino supervisado de `lerobot/pi05_base`, la implementación en LeRobot de π₀.₅ (Pi05) de Physical Intelligence, un modelo diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento. Lo publica el usuario `sam-guided-vlas` y está pensado para controlar un brazo Franka Emika Panda a partir de tres cámaras RGB y el estado del robot.

El modelo recibe `observation.state` (vector de 9 dimensiones) y tres imágenes de 224×224 píxeles (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), y produce un vector de acción de 7 dimensiones. Cuenta con 4.143.404.816 parámetros (≈4,14 mil millones) almacenados en safetensors, con un repositorio de 9,4 GB, y se distribuye bajo licencia apache-2.0.

Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta. Su interés está en que documenta de forma reproducible un flujo completo de LeRobot (dataset, hiperparámetros, comandos de rollout y de reentrenamiento) sobre una tarea de manipulación de objetos de mesa con poses aleatorias, y en que sirve como punto de partida para ajustes finos propios sobre la base oficial de π₀.₅.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) heredada de π₀.₅ (Pi05); implementación LeRobot adaptada del repositorio OpenPI |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones), según safetensors |
| Parámetros activos | no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (las tareas del dataset están etiquetadas en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato LeRobot; repositorio de 9,4 GB) |
| Tipo de robot | Panda |
| Entradas | `observation.state` (9,); `observation.images.agentview` (3, 224, 224); `observation.images.robot0_eye_in_hand` (3, 224, 224); `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Modelo base | lerobot/pi05_base |
| Pasos de entrenamiento | 5000 |
| Librería | lerobot 0.6.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una política VLA del linaje π₀.₅ (Pi05), que evoluciona π₀ con el objetivo declarado de generalizar a entornos completamente nuevos. La implementación disponible es la de LeRobot, adaptada del repositorio open source OpenPI de Physical Intelligence. No se detallan en la información disponible el número de tokens de entrenamiento del modelo base, la composición textual del dataset de preentrenamiento ni si hubo etapas de RLHF o DPO; tampoco se documentan innovaciones concretas de decodificación o de atención.

El ajuste fino se realizó sobre el dataset `sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live`, compuesto por 198 episodios y 35.267 fotogramas grabados a 20 FPS, con 20 etiquetas de tarea ("soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", "pear", "potato", "sweet potato", "scone", "basket", "boxed food", "cake", "can", "hamburger", "lemon", "orange", "spice", "squash", "spray"). El nombre del repositorio sugiere variaciones de recogida de datos con máscaras, desenfoque y simulación, y el uso de todas las cámaras, aunque la model card no detalla la composición exacta de esas variantes.

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 5000 |
| Tamaño de batch | 16 |
| Optimizador | adamw |
| Tasa de aprendizaje | 5e-05 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.0 |
| Dataset | 198 episodios / 35.267 fotogramas / 20 FPS |

## Capacidades

- Control visuomotor de un brazo Panda: genera vectores de acción de 7 dimensiones a partir de un estado propioceptivo de 9 dimensiones.
- Percepción multi-cámara: consume tres flujos RGB de 224×224, incluyendo dos vistas de muñeca (`robot0_eye_in_hand` y `robot0_eye_in_hand_2`) y una vista externa (`agentview`).
- Manipulación de objetos de mesa con poses aleatorias: el entrenamiento cubre colocaciones variables de los objetos de la tarea "pile".
- Condicionamiento por instrucción de lenguaje: acepta un identificador de tarea en forma de cadena (por ejemplo, `--task="soap dispenser"`) para seleccionar el objetivo.
- Cobertura de 20 categorías de objetos domésticos y de cocina, desde "kettle" o "knife block" hasta "pear", "lemon" o "spray".
- Ejecución autónoma de políticas mediante `lerobot-rollout`, tanto con estrategia base (sin grabación de episodios) como para recogida de datos en bucle.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, razonamiento multi-paso, matemáticas, generación de texto, visión generalista ni audio: es una política de control robótico, no un modelo conversacional.

## Casos de uso

- Recogida y colocación (pick-and-place) de laboratorio: el modelo puede ejecutar la tarea "pile" sobre un Panda con poses de objeto aleatorias, usando la vista externa para localizar y las cámaras de muñeca para el agarre fino.
- Ordenación de comestibles y utensilios: con 20 etiquetas de tarea que cubren alimentos envasados, frutas y utensilios, se puede emplear para clasificar o agrupar objetos de cocina por instrucción de lenguaje.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar configuraciones de cámaras, aumentos de datos (máscara, desenfoque) y entrenamiento en simulación frente a ejecución real.
- Punto de partida para ajuste fino propio: sobre `lerobot/pi05_base` o sobre esta misma política, con `lerobot-train` y un dataset propio de un robot Panda, reduciendo el coste de entrenar una política desde cero.
- Recolección de datos autónoma: el comando de rollout documentado permite dejar la política ejecutando tareas durante un tiempo fijo, lo que facilita generar nuevos episodios sobre la misma célula robótica.
- Evaluación de robustez visuomotora: la nomenclatura del dataset (máscaras, desenfoque, simulación) permite diseñar experimentos controlados sobre degradación de la percepción y comparar tasas de éxito por variante.
- Demostraciones y validación de hardware: útil para verificar la calibración de cámaras y del puerto del robot antes de lanzar campañas de entrenamiento más largas, ya que la política exige que los nombres de cámara coincidan exactamente con las claves de observación del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La propia model card incluye una sección de evaluación vacía, con la indicación explícita de que no se han proporcionado resultados para esta política todavía. No hay tasas de éxito por tarea, número de ensayos ni comparaciones con otras políticas. Los únicos datos cuantitativos disponibles son los del dataset de entrenamiento (198 episodios, 35.267 fotogramas, 20 FPS) y la configuración de ajuste fino (5000 pasos, batch 16, tasa 5e-05).

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del recuento real de parámetros, no publicada por el autor): aproximadamente 8,3 GB solo para pesos en bf16/fp16, más activaciones de tres flujos de imagen de 224×224; en la práctica, entre 10 y 16 GB para ejecución en una sola GPU con batch 1.
- Cuantización en int8 (≈4,2 GB) o int4 (≈2,1 GB): no hay versiones cuantizadas publicadas en el repositorio, por lo que serían necesarias conversiones propias.
- GPU de 24 GB: RTX 3090, RTX 4090, A10G o superiores pueden ejecutar los pesos en bf16 con holgura razonable.
- GPU de 16 GB: RTX 4080, RTX 4070 Ti Super o A4000 podrían ser suficientes en bf16 con batch 1 y sin grabación simultánea de episodios, aunque el margen es ajustado.
- GPU de 12 GB o menos: previsiblemente inviable en bf16 sin cuantización; requeriría conversión a int8.
- Aceleradores de datacenter: A100 (40/80 GB), H100 (80 GB) y L40S son adecuados y permiten margen para paralelismo o despliegue conjunto con el pipeline de datos.
- Opciones de despliegue documentadas: `lerobot-rollout` para ejecución sobre el robot y `lerobot-train` para reentrenamiento, ambos sobre PyTorch con CUDA (`--policy.device=cuda`) y la librería `lerobot` 0.6.0. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no publicados. La única referencia temporal es la frecuencia del dataset, 20 FPS, y el ejemplo de configuración de cámaras a 30 FPS; la viabilidad de control en tiempo real no está confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 fine-tune, pasos 5k) | 4,14 mil millones (dato de safetensors) | no disponible | Sin resultados de evaluación publicados | apache-2.0 | HuggingFace Hub; 0 descargas, 0 likes |
| lerobot/pi05_base | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Modelo base oficial del ecosistema LeRobot, referenciado como origen del ajuste fino |
| π₀ (familia predecesora de π₀.₅) | no disponible | no disponible | no disponible | no disponible | Mencionado indirectamente en la descripción; sin datos cuantitativos en la información disponible |
| OpenVLA y otras políticas VLA de manipulación | no disponible | no disponible | no disponible | no disponible | Familia conocida de políticas VLA open source; no se aportan cifras comparables en la información disponible |

La comparación cuantitativa no es posible con los datos aportados: no se han incluido parámetros, ventanas de contexto, licencias ni resultados de benchmarks de las alternativas. La única diferencia verificable frente a `lerobot/pi05_base` es que esta política ha recibido 5000 pasos de ajuste fino sobre un dataset concreto de 198 episodios y está especializada en un Panda con tres cámaras y 20 tareas de mesa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no se puede afirmar que la política funcione de forma fiable en el mundo real.
- Entrenamiento muy corto: 5000 pasos con batch 16 sobre 35.267 fotogramas es un ajuste fino ligero, con riesgo de sobreajuste al dataset y de generalización limitada fuera de las poses y condiciones observadas.
- Dependencia estricta del hardware y del montaje: la política espera un robot Panda, un vector de estado de 9 dimensiones y exactamente tres cámaras con los nombres `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`. Cualquier cambio de calibración, de montaje o de nombre de cámara puede degradar o invalidar el comportamiento.
- Dominio de tarea estrecho: las 20 etiquetas se limitan a objetos de mesa y cocina; no hay evidencia de transferencia a otras tareas, entornos o a otros robots.
- Idiomas: no se especifican idiomas soportados; las etiquetas de tarea están en inglés y no se documenta el comportamiento con instrucciones en castellano.
- Sesgos y alucinación: al ser una política de acción, el modo de fallo relevante no es la alucinación textual sino la ejecución de acciones incorrectas, potencialmente inseguras, sobre hardware físico; no hay datos sobre sesgos de objeto, iluminación o material.
- Riesgo físico en producción: cualquier despliegue sobre un brazo real debe ir acompañado de límites de par, paradas de emergencia y supervisión humana.
- Licencia: apache-2.0 permite uso comercial, pero el modelo deriva de `lerobot/pi05_base` y de la implementación OpenPI; conviene verificar las condiciones de los artefactos base antes de un uso comercial.
- Reproducibilidad: la semilla es 0 y la versión de LeRobot es 0.6.0; cambios de versión de la librería pueden alterar el comportamiento.
- Popularidad nula en el Hub (0 descargas, 0 likes): no hay validación por parte de terceros ni informes de uso independientes.
- Metadatos incompletos: no se documentan ventana de contexto, cuantizaciones, idiomas ni citación bibliográfica (el campo de cita aparece vacío en la información disponible).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_5k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__blur__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Pi05) en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
