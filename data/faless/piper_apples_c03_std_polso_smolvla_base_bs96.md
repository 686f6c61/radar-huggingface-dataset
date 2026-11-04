# Faless/piper_apples_c03_std_polso_smolvla_base_bs96

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face, diseñado para control robótico mediante imitación y desplegable en hardware de consumo. Esta ficha concreta corresponde a un fine-tuning realizado por el usuario Faless sobre la base `Faless/smolvla_base_adapted`, entrenado para una tarea específica de manipulación: recoger manzanas rojas y depositarlas en una cesta verde con un robot Piper.

El modelo consume observaciones multimodales (estado articular de 8 dimensiones y dos cámaras RGB de 256×256 píxeles) y produce acciones de 7 dimensiones para el control del brazo robótico. Con 450 millones de parámetros, se posiciona como una alternativa ligera frente a VLA de mayor tamaño, priorizando la eficiencia computacional sobre la escala masiva.

Es relevante porque demuestra el flujo completo de LeRobot para fine-tuning de políticas robóticas: desde un dataset de demostraciones hasta un checkpoint desplegable con `lerobot-rollout`. El modelo está entrenado sobre 619 episodios y casi 1,05 millones de frames a 30 FPS, lo que refleja un volumen de datos considerable para una tarea de manipulación única.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de robótica, no de texto) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `piper_full` |
| Cámaras de entrada | `ego`, `front` (2 cámaras RGB, 3×256×256) |
| Entrada de estado | `observation.state` (8,) |
| Salida de acción | `action` (7,) |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones para producir comandos motores a partir de observaciones e instrucciones en lenguaje natural. El modelo procesa dos flujos de imagen (256×256) junto con el estado articular del robot y genera vectores de acción de 7 dimensiones, típicos de un brazo manipulador con pinza.

El fine-tuning se realizó sobre `Faless/smolvla_base_adapted` usando LeRobot 0.6.2, con 55.000 pasos de entrenamiento, batch size de 96, optimizador AdamW, learning rate de 1e-4 y semilla 1000. El dataset `Faless/piper_apples_v7m_deposito_regolare_c03` contiene 619 episodios y 1.050.896 frames a 30 FPS, con la tarea "Pick the red apples one by one and place them into the green basket". No se especifica si hubo RLHF, DPO ni otras técnicas de alineación, ni la composición detallada del dataset más allá de la tarea.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un brazo Piper con pinza.
- Percepción visual multimodal: procesa dos cámaras simultáneas (`ego` y `front`) a 256×256.
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción textual de la tarea (`--task`).
- Ejecución de políticas de imitación entrenadas end-to-end desde demostraciones.
- Integración con el ecosistema LeRobot para rollout y reentrenamiento.
- No soporta tool calling, agentes multi-paso ni generación de texto libre: es una política de acción, no un modelo conversacional.
- Capacidades multilingües: no aplicables; la instrucción de tarea se usa como condicionamiento, no como generación.

## Casos de uso

- Recogida automatizada de fruta en entornos controlados: el modelo ejecuta la tarea de picking de manzanas rojas y depósito en cesta verde, entrenado específicamente para esta secuencia con 619 episodios.
- Investigación en imitación robótica: sirve como punto de partida para estudiar fine-tuning de SmolVLA sobre datasets propios, usando `Faless/smolvla_base_adapted` como base.
- Benchmarking de políticas VLA ligeras: con 450M parámetros, permite comparar coste computacional frente a VLA de mayor tamaño en tareas de manipulación.
- Prototipado en hardware de consumo: al ser un modelo compacto, es adecuado para validar pipelines de LeRobot en estaciones de trabajo con GPU consumer antes de escalar.
- Docencia y formación en robótica: el flujo completo (dataset, entrenamiento, rollout) es reproducible con los comandos documentados en la model card.
- Automatización de tareas pick-and-place en líneas de clasificación: el modelo puede adaptarse a variantes de la tarea reentrenando sobre nuevos datasets con la misma interfaz de observación/acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450M parámetros en safetensors el checkpoint pesa aproximadamente 1,8 GB en fp32, lo que sugiere un consumo de VRAM modesto, pero no se confirma en la documentación.
- GPU recomendadas: no especificadas. SmolVLA se describe como desplegable en hardware de consumo.
- Compatibilidad con GPU consumer: probable según la descripción de SmolVLA ("can be deployed on consumer-grade hardware"), pero sin cifras oficiales para este checkpoint.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`), con soporte de cámaras OpenCV a 640×480 y 30 FPS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faless/piper_apples_c03_std_polso_smolvla_base_bs96 | 450M | no disponible | Pick-and-place de manzanas con Piper | no disponible | Hugging Face (38 descargas) |
| Faless/smolvla_base_adapted (modelo base) | no disponible | no disponible | Base VLA para fine-tuning | no disponible | Hugging Face |
| SmolVLA (modelo original de Hugging Face) | no disponible en la información | no disponible | VLA general compacto | no disponible en la información | Hugging Face / paper arXiv:2506.01844 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado únicamente para la tarea "Pick the red apples one by one and place them into the green basket" con un robot Piper; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida, lo que impide estimar su fiabilidad en producción.
- Licencia no especificada: la model card indica "More Information Needed", por lo que el uso comercial queda sin marco legal claro.
- Dependencia de hardware concreto: requiere robot `piper_full` y dos cámaras con los nombres `ego` y `front`; cambios en la configuración invalidan la política.
- Sensible a condiciones de entorno: cambios en iluminación, posiciones de objetos o distractores pueden degradar el rendimiento, aunque no se cuantifica en la documentación.
- Riesgo de sobreajuste al dataset: 619 episodios de una única tarea limitan la variabilidad de escenarios cubiertos.
- Sin capacidades de lenguaje general: no debe usarse como modelo de texto, razonamiento o código.
- Fecha de creación futura en los metadatos (2026-10-12): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/piper_apples_c03_std_polso_smolvla_base_bs96
- Modelo base: https://huggingface.co/Faless/smolvla_base_adapted
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_v7m_deposito_regolare_c03
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_v7m_deposito_regolare_c03
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
