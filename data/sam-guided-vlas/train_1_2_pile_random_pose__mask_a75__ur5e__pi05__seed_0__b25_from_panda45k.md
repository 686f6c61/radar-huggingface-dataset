# sam-guided-vlas/train_1_2_pile_random_pose__mask_a75__ur5e__pi05__seed_0__b25_from_panda45k

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, concebido como evolución de π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. Este repositorio concreto no es el modelo base, sino un *fine-tune* del checkpoint `lerobot/pi05_base` realizado con LeRobot 0.6.0 por el usuario `sam-guided-vlas`, adaptado a un brazo robótico UR5e con tres cámaras y entrenado sobre una tarea de apilado/recogida de objetos.

El modelo resuelve un problema de imitación robótica: consume un vector de estado de 9 dimensiones y tres flujos de imagen RGB de 224×224 píxeles (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y produce un vector de acción de 7 dimensiones. Cuenta con 4.143.404.816 parámetros (~4,14 mil millones), un repositorio de 9,4 GB en safetensors y licencia Apache-2.0.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de *fine-tuning* de políticas VLA con LeRobot sobre hardware real (UR5e); por otro, sirve como artefacto reproducible dentro de una línea de investigación sobre enmascarado guiado por SAM (el nombre del autor y del dataset, `mask__overlay_a75`, apuntan a enmascarado con superposición al 75 %, aunque esto no está documentado en la model card).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot de π₀.₅, adaptada del repositorio OpenPI de Physical Intelligence |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones), según safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors sin cuantizaciones declaradas) |
| Idiomas soportados | no disponible (no aplica: es una política robótica, no un modelo generativo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 9,4 GB) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | UR5e |
| Cámaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entrada de estado | observation.state, forma (9,) |
| Entradas visuales | observation.images.*, forma (3, 224, 224) por cámara |
| Salida de acción | action, forma (7,) |
| Librería | lerobot (versión de entrenamiento 0.6.0) |
| Fecha de creación | 2026-09-10 |

## Arquitectura y entrenamiento

La información proporcionada identifica el modelo como un VLA de la familia π₀.₅, la implementación de LeRobot derivada del repositorio OpenPI. La model card no detalla la composición interna (backbone de visión-lenguaje, experto de acción, horizonte de *action chunking*, mecanismo de atención ni estrategia de decodificación), por lo que esos extremos quedan como no disponibles. Lo que sí se especifica es la interfaz completa: estado propioceptivo de 9 dimensiones, tres vistas RGB a 224×224 y una acción continua de 7 dimensiones.

El entrenamiento es un *fine-tune* de imitación (comportamiento clonado) sobre el *dataset* `sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__ur5e`, con 162 episodios, 28.490 fotogramas y 20 FPS, cubriendo 20 categorías de objeto (soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone, basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray). La configuración declarada es: 5.000 pasos, batch de 16, optimizador AdamW, *learning rate* 5e-05, semilla 0 y LeRobot 0.6.0. No se documenta el uso de RLHF, DPO ni ninguna fase de alineación por preferencias, algo esperable en una política de imitación pero no confirmado en la ficha.

El nombre del repositorio (`..._b25_from_panda45k`) sugiere que el *fine-tune* pudo inicializarse desde un checkpoint intermedio entrenado con un robot Panda (45k), aunque la model card declara como base `lerobot/pi05_base`. Esta discrepancia es una inferencia a partir del identificador, no un dato confirmado.

## Capacidades

- Generación de acciones de manipulación continua de 7 dimensiones (típicamente 6 grados de libertad más pinza) a partir de observación multimodal.
- Percepción visual multi-cámara simultánea: una vista de agente y dos vistas de muñeca, cada una a 224×224.
- Fusión de propiocepción (9 dimensiones) con visión para el control de un UR5e.
- Ejecución multi-tarea sobre 20 categorías de objetos domésticos y de supermercado dentro de la tarea de apilado.
- Política de imitación entrenada *end-to-end*; no requiere planificación simbólica externa.
- Soporte de *tool calling* / *function calling*: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponibles (no aplica).
- Capacidades especiales (modo *thinking*, visión descriptiva, audio): no disponibles; dispone de codificación visual como entrada, no de salida generativa de texto.
- Compatibilidad con el *pipeline* de LeRobot: `lerobot-rollout` para inferencia sobre robot y `lerobot-train` para reentrenamiento.

## Casos de uso

- Recogida y apilado de objetos (*bin picking*) en laboratorio: el modelo está entrenado precisamente para colocar en pila objetos dispersos con poses aleatorias sobre un UR5e; se ejecutaría con `lerobot-rollout --robot.type=UR5e --task="<objeto>"` a 20 FPS, velocidad compatible con el *dataset* de entrenamiento.
- Automatización de *pick-and-place* en logística: con 20 categorías de objeto ya cubiertas (latas, cajas, frutas, utensilios), puede emplearse como *baseline* para clasificar y colocar artículos heterogéneos en una celda de manipulación.
- Manipulación en *retail* o cocina simulada: la lista de tareas (jar, cereal, kettle, spice, hamburger, etc.) corresponde a un escenario de supermercado o cocina, adecuado para prototipos de reposición y preparación.
- Investigación en políticas VLA: sirve como punto de partida reproducible para estudiar el efecto del enmascarado guiado por SAM en la generalización visual, comparando contra `lerobot/pi05_base`.
- *Fine-tuning* con datos propios: al ser un *fine-tune* sobre `lerobot/pi05_base` con licencia Apache-2.0, puede reentrenarse con `lerobot-train` sobre un *dataset* nuevo para otra tarea u otro robot de la misma familia.
- Evaluación de transferencia sim-a-real: el nombre del *dataset* incluye `sim`, por lo que el modelo es un candidato para medir la brecha entre datos simulados y ejecución física en un UR5e real.
- Docencia y formación en robótica: el flujo completo (grabar datos, entrenar 5.000 pasos con batch 16, desplegar con LeRobot) es lo bastante acotado para prácticas de aprendizaje por imitación.
- Validación de *hardware* y *software* de control: útil para comprobar calibración de cámaras y *end-effectors* antes de invertir en entrenamientos más largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: «No evaluation results have been provided for this policy yet». No se dispone de tasas de éxito, número de ensayos, MMLU, HumanEval, GSM8K ni métricas equivalentes, que además no aplican a una política de manipulación.

| Configuración de entrenamiento | Valor |
|---|---|
| Pasos | 5.000 |
| Tamaño de batch | 16 |
| Optimizador | AdamW |
| Learning rate | 5e-05 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.0 |
| Episodios del dataset | 162 |
| Fotogramas del dataset | 28.490 |
| FPS del dataset | 20 |

## Requisitos de hardware

- VRAM estimada para pesos (cálculo a partir de 4.143.404.816 parámetros, sin contar activaciones ni codificadores): ~16,6 GB en FP32, ~8,3 GB en BF16/FP16, ~4,1 GB en INT8, ~2,1 GB en INT4. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- A las cifras anteriores hay que sumar el coste de tres flujos de imagen a 224×224 procesados simultáneamente y el estado interno de la política; conviene reservar varios GB adicionales de margen.
- GPU recomendadas: A100/H100 para entrenamiento o despliegue con batch alto; RTX 4090 o RTX 3090 (24 GB) para inferencia en BF16 con holgura.
- Cabe en GPU de consumo: sí, en tarjetas de 16-24 GB (RTX 4090, 4080, 3090, 4070 Ti Super) en precisión mixta; en tarjetas de 8-12 GB (RTX 3060, 4070) solo con cuantización o *offloading*, opciones no documentadas en el repositorio.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución sobre el robot y `lerobot-train` para reentrenamiento) con PyTorch y CUDA. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni TensorRT-LLM, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de requisito, el *dataset* se grabó a 20 FPS, lo que implica un presupuesto de 50 ms por paso de control si se quiere replicar la dinámica de entrenamiento; no se confirma que el modelo alcance ese ritmo en ninguna GPU concreta.
- Entrenamiento: no se especifica el *hardware* utilizado para los 5.000 pasos con batch 16; el tamaño del repositorio (9,4 GB) es coherente con pesos en FP32 o BF16 más optimizador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este *fine-tune* (UR5e, tarea pile) | 4.143.404.816 | no disponible | apache-2.0 | HuggingFace, 0 descargas, 0 likes | Sin resultados de evaluación publicados |
| lerobot/pi05_base | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | HuggingFace (referenciado como base) | Checkpoint de partida declarado; su ficha no forma parte de la información recibida |
| Otras políticas VLA de la misma categoría (OpenVLA, Octo, SmolVLA) | no disponible | no disponible | no disponible | no disponible | Candidatos habituales de comparación, pero sin datos verificados en la información disponible |

No se dispone de cifras verificadas de parámetros, contexto ni rendimiento para alternativas comparables dentro de la información proporcionada, por lo que no se puede establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card declara que no se han aportado resultados, por lo que se desconoce la tasa de éxito real de la política.
- Corpus de entrenamiento muy reducido: 162 episodios y 28.490 fotogramas para 20 tareas implica pocas demostraciones por objeto y un riesgo alto de sobreajuste y de baja robustez ante cambios de iluminación, posición o distractores.
- Brecha sim-a-real: el identificador del *dataset* incluye `sim`, de modo que parte o la totalidad de los datos podrían ser simulados; el comportamiento en el UR5e físico puede degradarse.
- Acoplamiento estricto al *hardware*: la política espera exactamente las claves de observación `observation.state` (9,) y las tres cámaras con esos nombres; cambiar la configuración de cámaras o la cinemática del robot invalida el modelo.
- Dependencia del *checkpoint* de partida: el nombre sugiere inicialización desde un modelo entrenado con un Panda (`panda45k`), lo que no coincide con la base declarada (`lerobot/pi05_base`); conviene verificar la procedencia antes de usarlo en producción.
- Sin salvaguardas de seguridad: una política de acciones continuas puede generar comandos fuera de rango; es imprescindible limitar velocidad, par y espacio de trabajo en el controlador del robot.
- Sesgos: no aplican sesgos demográficos de un modelo de lenguaje, pero sí sesgos visuales y de distribución de objetos derivados del conjunto de 20 categorías y de las condiciones de captura.
- Licencia: el repositorio es Apache-2.0, lo que permite uso comercial del *fine-tune*, pero deben revisarse por separado las condiciones del modelo base `lerobot/pi05_base` y de los pesos originales de π₀.₅ de Physical Intelligence antes de un despliegue comercial.
- Idiomas y contexto: no aplica soporte multilingüe ni ventana de contexto textual; no hay datos sobre horizonte de predicción de acciones.
- Trazabilidad limitada: 0 descargas, 0 likes, sin vídeo de demostración y sin *paper* asociado al *fine-tune* concreto.
- Los resultados de la búsqueda web realizada (TF1, SAM.gov, SAM Outillage, máster SAM) no guardan relación con este modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask_a75__ur5e__pi05__seed_0__b25_from_panda45k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__ur5e
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
