# sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_60k

## Resumen

Este repositorio contiene un modelo de Vision-Language-Action (VLA) denominado pi05, publicado por el usuario sam-guided-vlas y afinado a partir de lerobot/pi05_base. Se trata de la implementación en LeRobot de π₀.₅ (Pi05), el modelo de acción visión-lenguaje de Physical Intelligence diseñado para generalizar a entornos y situaciones nuevos no vistos durante el entrenamiento. El modelo consume observaciones de estado y tres cámaras y produce comandos de acción motora, por lo que su función no es la generación de texto, sino el control de un robot.

El checkpoint tiene 4.143.404.816 parámetros en formato safetensors (aproximadamente 9,4 GB en el repositorio) y está licenciado bajo Apache 2.0. El robot objetivo es un Panda, con tres flujos visuales (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) a resolución 224x224 y un vector de estado de dimensión 9, generando un vector de acción de dimensión 7.

La relevancia de este repositorio es acotada: se trata de un ajuste fino especializado, entrenado sobre un dataset pequeño (199 episodios, 31.073 fotogramas a 20 FPS) con nombres de tarea que describen geometrías de objetos tridimensionales. No hay resultados de benchmarks publicados en la información disponible, y no se especifican detalles del preentrenamiento original de π₀.₅ más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), implementación en LeRobot de π₀.₅ (Pi05); detalles internos no disponibles |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio publicado en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales de la model card: modelo base `lerobot/pi05_base`; tipo de robot `Panda`; cámaras `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`; entrada `observation.state` (9,), tres imágenes visuales (3, 224, 224); salida `action` (7,).

## Arquitectura y entrenamiento

El modelo es un Vision-Language-Action construido sobre un backbone visión-lenguaje y una cabeza de acción, siguiendo el linaje de π₀ de Physical Intelligence. La model card indica explícitamente que π₀.₅ "evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos", y que la implementación de LeRobot deriva del repositorio OpenPI de Physical Intelligence. No se detallan en la información proporcionada ni el número de tokens de preentrenamiento, ni la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo base.

El entrenamiento descrito corresponde a un ajuste fino sobre el dataset `sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live`, compuesto por 199 episodios y 31.073 fotogramas a 20 FPS. Las tareas descritas son variadas y de geometría compleja (formas con lóbulos, costillas, anillos de cuentas, cavidades y aberturas), lo que sugiere una especialización en manipulación de objetos con topologías intrincadas. El identificador del repositorio incluye el sufijo `steps_60k` y `seed_0`, lo que apunta a 60.000 pasos de entrenamiento con una semilla concreta, aunque estos detalles no se confirman explícitamente en la model card.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de dimensión 7 a partir de estado y observaciones visuales para un brazo Panda.
- Percepción multimodal: procesa simultáneamente un vector de estado de 9 dimensiones y tres cámaras RGB a 224x224 (vista del agente y dos vistas de pinza).
- Especialización en objetos de geometría compleja: el dataset de ajuste contiene descripciones de formas con lóbulos, costillas, cuentas, cavidades y aberturas, orientadas a tareas de agarre y colocación.
- Generalización a entornos nuevos: según la descripción de π₀.₅, el modelo está diseñado para adaptarse a situaciones no vistas durante el entrenamiento.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes conversacionales; el modelo opera como política de control.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se documentan modos de "thinking", visión generativa, audio ni otras capacidades más allá del control visomotor.

## Casos de uso

- Manipulación robótica de objetos con geometría intrincada: el ajuste sobre formas con lóbulos, anillos y cavidades lo hace adecuado para tareas de agarre donde la política debe adaptarse a topologías irregulares; se usaría cargando el checkpoint en LeRobot y conectándolo al robot Panda con las tres cámaras especificadas.
- Investigación en Vision-Language-Action: sirve como punto de partida reproducible (semilla 0, 60k pasos) para estudiar cómo el ajuste fino sobre datasets pequeños altera el comportamiento de π₀.₅ en tareas de manipulación.
- Evaluación de robustez ante variaciones visuales: el nombre del repositorio incluye términos como `mask` y `blur`, lo que sugiere variantes de entrenamiento con enmascarado o desenfoque; puede emplearse para comparar la robustez de la política frente a degradaciones de la imagen.
- Benchmarking de políticas en simulación: con 199 episodios a 20 FPS, es un candidato para medir tasas de éxito en entornos simulados de manipulación con las mismas cámaras y estado.
- Réplica y extensión de experimentos: al estar publicado en safetensors y con licencia Apache 2.0, permite reproducir y ampliar el ajuste con datasets propios.
- Integración en pipelines de LeRobot: se puede desplegar mediante la librería `lerobot` y la guía oficial de π₀.₅ para ejecutar la política en hardware o en simulación.
- Base para ajustes posteriores: al ser un fine-tune del modelo base, puede servir como punto de partida para nuevos ajustes sobre tareas de manipulación relacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de manipulación ni comparaciones cuantitativas, y los resultados de la búsqueda web no aportan datos técnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (según 4,14 mil millones de parámetros; estimaciones, no datos oficiales): aproximadamente 8,3 GB en bf16/fp16, unos 16,6 GB en fp32 y en torno a 4-5 GB con cuantización de 8 bits, más el consumo adicional de los codificadores visuales y del estado.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de ~4,1B en bf16 cabe en GPUs de gama alta con al menos 12-16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100).
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o más de VRAM (RTX 4080/4090, RTX 3090) si se usa bf16 o cuantización; en tarjetas de 8-12 GB podría requerir cuantización agresiva, aunque no se documentan formatos cuantizados.
- Opciones de despliegue: la librería indicada es `lerobot`; no se documentan explícitamente soportes de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks en la información proporcionada. La única referencia directa es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| Este modelo (pi05 fine-tune) | 4.143.404.816 | no disponible | apache-2.0 | Ajuste fino especializado |
| lerobot/pi05_base | no disponible | no disponible | no disponible | Modelo base del ajuste |
| π₀ (Pi0) | no disponible | no disponible | no disponible | Generación previa de la que evoluciona π₀.₅ |

## Limitaciones y advertencias

- Dataset de ajuste muy reducido: 199 episodios y 31.073 fotogramas limitan la generalización fuera de la distribución de tareas descrita.
- Alto riesgo de sobreajuste a las geometrías concretas del dataset de entrenamiento; el comportamiento en objetos o entornos distintos no está validado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito, robustez o comparación con alternativas.
- Idiomas y capacidades lingüísticas: no disponibles; el modelo no está pensado para tareas de texto.
- Sesgos: no se documentan análisis de sesgo; al ser un modelo de control robótico, los sesgos relevantes serían de distribución visual y de dinámica del robot, no evaluados aquí.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset asociado, cuyos términos no se detallan en la información proporcionada.
- Dependencia de hardware concreto: requiere las tres cámaras y el vector de estado en las dimensiones exactas indicadas; desviarse de esa configuración puede invalidar la política.
- Caveat de producción: la fecha de creación indicada es 2026-09-11, posterior a la fecha habitual de consulta; verificar la vigencia y el estado real del repositorio antes de integrarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
