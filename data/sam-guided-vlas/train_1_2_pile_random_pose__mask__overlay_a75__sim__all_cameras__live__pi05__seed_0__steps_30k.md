# sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_30k

## Resumen

Este repositorio contiene una política robótica entrenada mediante aprendizaje por imitación sobre el modelo base lerobot/pi05_base. Se trata de un ajuste fino (fine-tuning) del modelo π₀.₅ (Pi05) de Physical Intelligence, un modelo Vision-Language-Action (VLA) diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. El checkpoint tiene 4.143.404.816 parámetros (unos 4,14 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo ha sido entrenado específicamente para una tarea de manipulación con apilamiento de objetos ("pile") con poses aleatorias, sobre un robot Franka Panda y con tres cámaras de entrada: una vista de agente (agentview) y dos cámaras en la muñeca del robot (eye-in-hand). El dataset asociado contiene 198 episodios y 35.267 fotogramas a 20 FPS, con instrucciones de tarea en inglés como "soap dispenser", "jam", "jar", "cereal" o "knife block".

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo actual de LeRobot para ajustar políticas VLA de forma reproducible (configuración fija de semilla 0 y 30.000 pasos). Por otro, es un ejemplo de artefacto de investigación sin validación publicada: el propio autor indica que no se han proporcionado resultados de evaluación, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un experimento, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); variante π₀.₅ (Pi05) de Physical Intelligence, implementación LeRobot adaptada del repositorio OpenPI. Detalle interno de capas y mecanismo de atención: no disponible |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones; dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible. La entrada es multimodal robótica: estado (9,), tres imágenes (3, 224, 224) y salida de acción (7,); no se especifica ventana de contexto textual |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible. Las instrucciones de tarea del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`); tamaño del repo: 9,4 GB |
| Tipo de robot | Panda (Franka Panda) |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Dimensión de estado | 9 |
| Dimensión de acción | 7 |
| Modelo base | lerobot/pi05_base |
| Versión de LeRobot | 0.6.0 |
| Semilla / pasos de entrenamiento | 0 / 30.000 |

## Arquitectura y entrenamiento

El model card describe π₀.₅ como un modelo Vision-Language-Action que evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos, no vistos durante el entrenamiento. La implementación concreta de este repositorio proviene de LeRobot, que a su vez adapta el repositorio OpenPI de Physical Intelligence. No se proporcionan en la información disponible detalles sobre el backbone de visión-lenguaje, el número de capas, el mecanismo de generación de acciones (por ejemplo, flow matching o difusión) ni el tamaño del experto de acción; estos datos figuran como no disponibles.

En cuanto al entrenamiento, se trata de un ajuste fino supervisado (aprendizaje por imitación) partiendo de lerobot/pi05_base, con 30.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 0. No se documenta el uso de RLHF, DPO ni ninguna fase de alineamiento posterior, algo esperable en un modelo de política robótica. El dataset de entrenamiento contiene 198 episodios y 35.267 fotogramas a 20 FPS, correspondientes a una tarea de apilamiento con poses aleatorias sobre 20 clases de objetos/instrucciones. Es un volumen de datos reducido para los estándares de los VLA de propósito general, lo que sugiere un ajuste muy especializado en lugar de una política de propósito amplio.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones (posición y orientación del efector final más pinza) a partir de observaciones visuales y proprioceptivas.
- Fusión de tres flujos de cámara simultáneos: una vista global de la escena y dos vistas cenitales en la muñeca del robot.
- Ejecución de políticas condicionadas por instrucción de tarea en lenguaje natural (por ejemplo, "soap dispenser", "kettle", "pear").
- Manipulación de objetos apilados con posiciones aleatorias, incluyendo agarre y colocación.
- Capacidad declarada de generalización a entornos nuevos ("open-world generalization") según la descripción de π₀.₅, aunque no hay evaluación publicada que la respalde en este checkpoint.
- Control en bucle cerrado sobre robot real mediante el comando `lerobot-rollout`.
- Soporte de tool calling / function calling: no disponible (no aplica a una política robótica).
- Soporte de agentes y razonamiento multi-paso en texto: no disponible.
- Capacidades multilingües de texto: no disponible; las instrucciones del dataset están únicamente en inglés.
- Modo de razonamiento explícito (thinking), visión general, audio o generación de texto libre: no disponibles.

## Casos de uso

- Manipulación de apilamiento en laboratorio robótico: el modelo se usa directamente con `lerobot-rollout` sobre un Franka Panda para recoger objetos y apilarlos cuando sus poses iniciales son aleatorias, que es exactamente la distribución del dataset de entrenamiento.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible (semilla 0, 30.000 pasos, hiperparámetros documentados) para comparar variantes de aumento de datos, resolución de cámara o arquitectura en LeRobot.
- Punto de partida para ajustes específicos: al derivar de lerobot/pi05_base y ser Apache 2.0, puede reentrenarse sobre datasets propios con el comando `lerobot-train` para otras tareas de manipulación.
- Evaluación de guiado por segmentación (SAM): el nombre del autor y del dataset sugieren experimentos con máscaras y superposiciones ("mask", "overlay_a75") generadas con Segment Anything; el modelo puede emplearse como referencia para medir si el enmascarado mejora la política.
- Estudio sim-to-real: el sufijo "sim" del dataset indica datos de simulación; el checkpoint sirve para analizar la transferencia de políticas entrenadas en simulador a un robot físico.
- Reproducción de experimentos y análisis de ablaciones: permite replicar una configuración concreta y comparar el efecto de la semilla, el número de pasos o la combinación de cámaras sobre la tasa de éxito.
- Docencia y demostraciones de VLA: útil para mostrar el ciclo completo de LeRobot (instalación, calibración, grabación, entrenamiento, despliegue) sin necesidad de entrenar desde cero.
- Integración en pipelines internos de robótica: puede envolverse en un servicio que reciba observaciones y devuelva acciones, siempre que se asuma que no hay garantías de rendimiento publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card incluye la sección de evaluación con la marca explícita "_No evaluation results have been provided for this policy yet_", es decir, no hay tasas de éxito ni número de ensayos por tarea. Tampoco se han encontrado métricas comparativas (MMLU, HumanEval, GSM8K u otras) porque no son aplicables a una política robótica, ni resultados de éxito en tareas de manipulación en los resultados de búsqueda web consultados.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4.143.404.816 parámetros): aproximadamente 16,6 GB en fp32, 8,3 GB en bf16/fp16, 4,1 GB en int8 y 2,1 GB en int4. A estas cifras hay que sumar activaciones, memorias intermedias del codificador visual y del experto de acción, y los tres buffers de imagen de 3×224×224.
- El repositorio ocupa 9,4 GB en disco, coherente con un checkpoint almacenado por debajo de fp32; conviene verificar la precisión real de los safetensors antes de planificar el despliegue.
- GPU recomendadas para inferencia: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para márgenes amplios y baja latencia. Con 16 GB (RTX 4080, A4000) el modelo en bf16 debería caber, pero el margen para activaciones es estrecho.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 y, con ajustes, en GPUs de 16 GB. En GPUs de 8 GB requeriría cuantización, cuya disponibilidad no está documentada.
- Entrenamiento o ajuste fino: los 30.000 pasos con lote 16 sobre un modelo de 4,14 mil millones de parámetros hacen recomendable al menos una A100 de 40 GB o una H100, con posibilidad de usar optimizaciones de memoria (gradient checkpointing, precisión mixta) para GPUs menores.
- Opciones de despliegue: inferencia oficial mediante la CLI `lerobot-rollout` de LeRobot 0.6.0 sobre PyTorch y CUDA. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas VLA con entrada de imagen y salida de acciones.
- Latencia y throughput: no disponibles. Como referencia de contexto, el dataset se grabó a 20 FPS y el ejemplo de ejecución configura cámaras a 30 FPS, lo que implica que el bucle de control necesita inferencias del orden de decenas de milisegundos por paso para no bloquear el robot; no se han publicado mediciones reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (fine-tune de pi05) | 4.143.404.816 | no disponible (entrada: 3 imágenes 3×224×224 + estado de 9 dim.) | No (sin resultados de evaluación) | Apache 2.0 | HuggingFace, vía LeRobot |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| π₀ / π₀.₅ original (Physical Intelligence, OpenPI) | no disponible | no disponible | no disponible | no disponible | Repositorio OpenPI y blog de Physical Intelligence |
| OpenVLA (referencia habitual en VLA) | ≈7.000 millones (según su denominación) | no disponible | no disponible | no disponible | Público, no verificado en esta búsqueda |

No se dispone de datos suficientes en la información proporcionada para establecer una comparación cuantitativa de rendimiento entre alternativas. Las diferencias verificables de este checkpoint frente al modelo base son el ajuste específico sobre el dataset de apilamiento, la fijación de semilla y pasos, y el hecho de que está especializado en un robot Panda con tres cámaras concretas.

## Limitaciones y advertencias

- Ausencia total de evaluación: el propio model card indica que no se han proporcionado resultados. No hay tasas de éxito, número de ensayos ni condiciones de prueba, por lo que no se puede afirmar nada sobre su fiabilidad.
- Dataset muy reducido: 198 episodios y 35.267 fotogramas para una única tarea de apilamiento. Es probable un sobreajuste a las distribuciones de objeto, iluminación, fondo y poses presentes en los datos.
- Dependencia estricta del hardware: solo funciona con un robot Panda y con tres cámaras cuyos nombres deben coincidir exactamente con las claves de observación (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). Cualquier cambio de sensor, resolución o montaje invalida la política.
- Riesgo de fallo silencioso: una política de imitación no detecta cuándo está fuera de distribución. Sin métricas de incertidumbre ni evaluación, puede ejecutar acciones incorrectas o inseguras sin aviso.
- Origen de los datos: el sufijo "sim" del dataset sugiere que los datos provienen de simulación, lo que introduce una brecha sim-to-real no cuantificada.
- Idioma: las instrucciones de tarea están en inglés; no hay evidencia de soporte de instrucciones en castellano ni de capacidades multilingües.
- Licencia: Apache 2.0 permite uso comercial de este checkpoint, pero conviene verificar de forma independiente los términos del modelo base lerobot/pi05_base y de la investigación original de π₀.₅, así como las licencias de los datos y de los objetos de simulación empleados.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin citas ni validación por terceros.
- Caveat de producción: no debe desplegarse en un robot real sin un mecanismo externo de parada de emergencia, límites de fuerza y supervisión humana, dado que no hay datos de seguridad ni de robustez.
- Los resultados de la búsqueda web realizada no aportan información sobre este modelo: corresponden a la serie de televisión francesa "Sam", al portal de contratación sam.gov, a la ferretería SAM Outillage y a un máster universitario con las siglas SAM. No se han encontrado papers, blogs ni análisis técnicos sobre este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_30k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI de Physical Intelligence (citado en el model card como origen de la implementación, URL no incluida en la información proporcionada): no disponible en la información de la búsqueda
