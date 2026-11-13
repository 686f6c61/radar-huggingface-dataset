# nhatcm/hitbench-molmoact2-20k

## Resumen

SO-101 MolmoAct2 es un modelo de visión-lenguaje-acción (VLA) desarrollado por el usuario nhatcm y publicado en Hugging Face bajo el identificador `nhatcm/hitbench-molmoact2-20k`. Está especializado en control robótico de extremo a extremo (end-effector control) para el brazo SO-101, un robot de bajo coste de la familia SO-ARM. El modelo recibe una imagen RGB frontal, el estado articular medido y un prompt de tarea en lenguaje natural, y devuelve un chunk de 50 acciones continuas de 7 dimensiones que codifican deltas de posición, deltas de rotación y apertura de pinza.

El modelo resuelve un problema muy concreto: la manipulación de un objeto (un globo) sobre una bandeja en el entorno de evaluación HITBench, con tres prompts causales predefinidos que distinguen entre estado base, objeto liberado y objeto sujeto. No es un modelo de propósito general, sino un checkpoint de política entrenado sobre 1.565 segmentos causales (349.611 fotogramas) extraídos de 477 trayectorias frontales de las tareas 0 a 9 de un dataset SO-101.

Con 5.601.988.144 parámetros (aproximadamente 5,6 mil millones) y un repositorio de 38 GB, el modelo se distribuye en formato safetensors y se carga mediante la librería LeRobot. Es relevante ahora porque representa un ejemplo reciente de adaptación de un VLM (MolmoAct2) a control robótico continuo con contrato de entrada/salida explícito, lo que facilita su integración en pipelines de evaluación reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en MolmoAct2 (transformer multimodal con cabeza de acciones continuas) |
| Parametros totales | 5.601.988.144 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de tarea están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es una política VLA basada en MolmoAct2 que combina un codificador visual para la imagen RGB frontal (redimensionada a 256x256, float BCHW en [0,1]) con el estado articular medido del SO-101 (seis articulaciones: `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll`, `gripper`) y un prompt de tarea textual. La salida es un chunk de 50 acciones continuas 7D que se decodifican contra la última pose medida del efector final mediante `action_contract.json`.

El entrenamiento se realizó durante 20.000 actualizaciones del optimizador con un batch efectivo de 8 sobre cuatro GPUs. La receta de muestreo combina un 80% de anclas uniformes a nivel global de fotograma y un 20% de anclas equilibradas en los límites de autoridad de las tareas 3 y 5. Se aplicó reemplazo semántico solo en píxeles de pared etiquetados, un puente RGB sim-real medido en cada ejemplo, y aumentaciones de color de cámara, iluminación, desenfoque, ruido y JPEG con rampa lineal según el progreso del optimizador. No se usaron recortes, volteos, deformaciones, máscaras de dropout ni cambios de etiqueta. La pérdida final observada de action-flow fue 0.008, que el autor advierte explícitamente que no constituye una medida de éxito físico de la tarea.

## Capacidades

- Control robótico continuo de extremo a extremo para el brazo SO-101: genera deltas de posición (dx, dy, dz) y de rotación (dRx, dRy, dRz) junto con la apertura de pinza.
- Predicción de chunks de acción: devuelve 50 acciones 7D por llamada mediante `predict_action_chunk`.
- Condicionamiento por lenguaje natural: acepta exactamente tres prompts causales (`put balloon onto tray`, con sufijos `I have released the object` e `I have held the object`).
- Percepción visual frontal: procesa una única imagen RGB redimensionada a 256x256.
- Integración con estado propioceptivo: consume las seis articulaciones medidas del robot.
- Gestión de eventos causales externos: los sufijos de liberación y sujeción se activan solo en las tareas 3 y 5 tras los bordes registrados, y deben ser suministrados por el estado de la tarea, no inferidos de los píxeles.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni multilingüismo general.

## Casos de uso

- Manipulación de objetos sobre bandeja en HITBench: el modelo está entrenado específicamente para la tarea de colocar un globo en una bandeja, por lo que su uso principal es la evaluación reproducible de políticas VLA en este benchmark.
- Control de brazo SO-101 en laboratorio: integrable mediante LeRobot para ejecutar políticas de efector final con deltas de posición y rotación calibrados contra la pose medida.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar recetas de aumento de datos, muestreo de anclas y puentes sim-real en robótica de bajo coste.
- Evaluación de contratos de acción: el par `action_contract.json` y `policy_preprocessor.json` permite validar la decodificación de acciones continuas y la normalización por cuantiles de las articulaciones.
- Reproducción de experimentos de VLA: el repositorio incluye `train_config.json`, `eval_contract.json` y los contratos de aumento y muestreo, lo que facilita replicar el entrenamiento.
- Docencia y prototipado en robótica: con 5,6 mil millones de parámetros y un contrato de entrada/salida explícito, es un caso de estudio manejable para cursos de VLA y control continuo.
- Integración en pipelines de simulación: el puente RGB sim-real medido en cada ejemplo sugiere su uso en entornos simulados antes de transferir a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico reportado es la pérdida final de action-flow de 0.008, que el autor indica que no equivale a una medida de éxito físico de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 5,6 mil millones de parámetros, una estimación orientativa en FP16 sería de aproximadamente 11-12 GB de pesos, más el overhead del codificador visual y del estado, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. El entrenamiento se realizó sobre cuatro GPUs, sin especificar modelo.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de parámetros, sería plausible en GPUs con 16 GB o más en FP16, pero no hay dato oficial.
- Opciones de despliegue: librería LeRobot (formato nativo del checkpoint), con carga de safetensors y los ficheros `policy_preprocessor.json`, `action_contract.json` y `eval_contract.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA para SO-101 o MolmoAct2) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Ámbito extremadamente restringido: entrenado solo para la tarea de colocar un globo en una bandeja con tres prompts exactos; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Dependencia de eventos externos: los sufijos de liberación y sujeción deben provenir del estado de la tarea; inferirlos de los píxeles produce un uso incorrecto del contrato.
- La pérdida de action-flow de 0.008 no mide éxito físico; no debe interpretarse como evidencia de rendimiento en el mundo real.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: los prompts están en inglés y no se documenta soporte multilingüe.
- Riesgo de alucinación visual y de acción: al ser un modelo multimodal, puede generar acciones inconsistentes ante imágenes fuera de distribución (iluminación, colores, cámara distintas a las del entrenamiento).
- Sesgos desconocidos: no se documenta composición demográfica ni de escenarios del dataset, por lo que no se pueden evaluar sesgos.
- Requiere calibración y cinemática inversa del SO-101 tras decodificar las acciones, además de respetar los límites articulares.
- Repositorio de 38 GB: coste de almacenamiento y descarga considerable para experimentación.
- Sin métricas de éxito publicadas: la validación en hardware real queda pendiente y debe realizarse por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nhatcm/hitbench-molmoact2-20k
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
