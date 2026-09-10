# sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_1k

## Resumen

El modelo `sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_1k` es un ajuste fino (fine-tuning) de la politica robótica π₀.₅ (Pi05) de Physical Intelligence, entrenado y publicado con la librería LeRobot de Hugging Face. Se trata de un modelo Vision-Language-Action (VLA) orientado a la manipulación robótica de propósito específico, no de un modelo de lenguaje general: consume observaciones multimodales (estado del robot e imágenes de varias cámaras) y produce directamente acciones de control de bajo nivel.

El modelo parte del checkpoint base `lerobot/pi05_base`, una implementación adaptada del repositorio OpenPI de Physical Intelligence, y se ha especializado en un conjunto acotado de tareas de manipulación de objetos (dispensador de jabón, tarros, cuchillos, frutas, comida envasada, etc.) sobre un robot tipo Panda. La información disponible no detalla la composición del dataset de preentrenamiento ni la arquitectura interna, más allá de su naturaleza VLA y su linaje respecto a π₀.₅.

El interés de esta ficha radica en su valor como ejemplo de flujo completo de LeRobot: ajuste a partir de un modelo base abierto, dataset de imitación registrado a 20 FPS y despliegue mediante el comando `lerobot-rollout`. Al estar publicado bajo licencia Apache 2.0, puede reutilizarse como referencia para pipelines de aprendizaje por imitación en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación LeRobot adaptada de OpenPI. Detalle interno de capas no disponible |
| Parametros totales | 4.143.404.816 (~4,14 mil millones, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin versiones cuantizadas declaradas |
| Idiomas soportados | no disponible (modelo robótico con entrada visual y de estado; no se declara soporte idiomático) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | Panda |
| Camaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entradas | observation.state (9,), observation.images.agentview (3,224,224), observation.images.robot0_eye_in_hand (3,224,224), observation.images.robot0_eye_in_hand_2 (3,224,224) |
| Salidas | action (7,) |
| Modelo base | lerobot/pi05_base |
| Libreria | lerobot |
| Version de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

Se trata de una politica Vision-Language-Action basada en π₀.₅ (Pi05) de Physical Intelligence, cuyo objetivo declarado es la generalización a entornos y situaciones nuevas no vistas durante el entrenamiento. La implementación concreta procede del repositorio OpenPI de Physical Intelligence y ha sido adaptada a LeRobot. La información proporcionada no desglosa la arquitectura interna (número de capas, mecanismo de atención, uso de flow matching u otros detalles del componente de acción), por lo que esos extremos quedan como no disponibles.

El ajuste fino se ha realizado sobre el checkpoint `lerobot/pi05_base`. La configuración de entrenamiento registrada es la siguiente: 1000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05, semilla 0 y LeRobot 0.6.0. El dataset de entrenamiento es `sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live`, con 200 episodios, 30.830 fotogramas y una tasa de 20 FPS, y cubre tareas de manipulación sobre objetos como dispensador de jabón, mermelada, tarro, cereales, cuchillos, hervidor, pera, patata, boniato, bollo, cesta, comida envasada, tarta, lata, hamburguesa, limón, naranja, especias, calabaza y pulverizador. No se declara si hubo RLHF, DPO ni otras fases de alineamiento.

## Capacidades

- Generación de acciones de control robótico: produce un vector de acción de dimensión 7 a partir del estado del robot y tres vistas de cámara.
- Percepción visual multimodal: consume tres flujos de imagen de 224x224 píxeles (vista general y dos cámaras en la muñeca).
- Manipulación de objetos: entrenado específicamente para tareas de agarre y manejo de utensilios, envases y alimentos.
- Ejecución guiada por instrucción de tarea: el comando de despliegue incluye un parámetro `--task` (por ejemplo, `soap dispenser`).
- Integración con aprendizaje por imitación: compatible con el flujo de LeRobot para registro de datos, entrenamiento y despliegue.
- No se declara soporte de tool calling ni de function calling.
- No se declara explícitamente capacidad de agentes multi-paso más allá de la ejecución de la politica.
- No se declaran capacidades de razonamiento de texto, código, matemáticas, audio o thinking mode.

## Casos de uso

- Investigación en manipulación robótica: servir como referencia reproducible de ajuste fino de π₀.₅ sobre un robot Panda, permitiendo comparar configuraciones de entrenamiento (pasos, tasa de aprendizaje, semilla) en un entorno controlado.
- Automatización de tareas de recogida y colocación: la politica puede ejecutar la manipulación de objetos concretos (frutas, envases, utensilios) sobre un robot real, guiada por el parámetro de tarea, lo que resulta adecuado para prototipos de almacén o laboratorio.
- Aprendizaje por imitación supervisado: el dataset de 200 episodios y 30.830 fotogramas sirve como base para reproducir el entrenamiento y estudiar el efecto del número de demostraciones en el éxito de la tarea.
- Evaluación de generalización de políticas VLA: al derivar de π₀.₅, cuyo objetivo es generalizar a entornos nuevos, este checkpoint permite estudiar el comportamiento de un ajuste altamente especializado frente a la base generalista.
- Integración en pipelines de LeRobot: se puede desplegar con `lerobot-rollout` en flujos existentes de la librería, lo que facilita su uso en entornos de investigación que ya utilicen ese ecosistema.
- Banco de pruebas de visión y estado: dado que combina estado de 9 dimensiones con tres cámaras, es útil para experimentar con variaciones en la configuración de sensores y medir su impacto en la política.
- Formación y docencia en robótica: por su licencia permisiva y su cadena clara (base → dataset → ajuste), sirve como ejemplo didáctico de un pipeline completo de VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada a partir de 4,14 mil millones de parámetros; no confirmada en la documentación): ~8-9 GB en fp16/bf16, ~4-5 GB en int8 y ~2-3 GB en 4 bits.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU de 16 GB o más (por ejemplo, RTX 4090) sería suficiente en precisión media; para precisión completa se recomienda una GPU de centro de datos (A100, H100).
- Compatibilidad con GPU de consumo: probable en modelos con al menos 12-16 GB de VRAM, aunque la documentación no lo confirma.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución sobre robot y `lerobot-train` para entrenamiento). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ajuste de π₀.₅) | ~4,14 mil millones | no disponible | sin resultados publicados | apache-2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | sin resultados publicados | no disponible en la informacion | Hugging Face |

No se dispone de datos comparativos (parámetros, contexto o rendimiento) de otras políticas VLA equivalentes en la información proporcionada, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Es un modelo de propósito específico: está ajustado para un conjunto acotado de tareas y un robot concreto (Panda) con una configuración exacta de cámaras y estado, por lo que no es directamente reutilizable en otro hardware sin reentrenamiento.
- Dependencia de la configuración de sensores: las cámaras deben coincidir con las claves de observación usadas en el entrenamiento (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`); cualquier discrepancia puede degradar el comportamiento.
- Sin resultados de evaluación: no se han publicado tasas de éxito ni pruebas en robot real, por lo que el rendimiento efectivo en producción es desconocido.
- Sesgos y alucinaciones: no se documentan sesgos específicos; al tratarse de un modelo de acción, el riesgo relevante es la ejecución de acciones incorrectas o inseguras en el robot, no la generación de texto.
- Limitaciones de idioma: no se declara soporte multilingüe ni de lenguaje natural; el uso idiomático queda como no disponible.
- Restricciones de licencia: la licencia Apache 2.0 es permisiva y permite uso comercial, pero al derivar del modelo base `lerobot/pi05_base` conviene verificar las condiciones de dicho checkpoint (no disponibles en la información proporcionada).
- Caveat de producción: el ajuste es de solo 1000 pasos sobre 200 episodios, lo que sugiere un entrenamiento corto orientado a experimentación más que a despliegue robusto.
- Los resultados de la búsqueda web proporcionada no son relevantes para este modelo (corresponden a una serie de televisión, una empresa de herramientas y un portal de contratación pública) y no aportan información técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_1k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ (Pi05), Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Registro de datos y entrenamiento (aprendizaje por imitación): https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
