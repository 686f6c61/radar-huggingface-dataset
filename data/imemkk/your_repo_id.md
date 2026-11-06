# ImemKK/your_repo_id

## Resumen

`ImemKK/your_repo_id` es un fine-tuning de política robótica Vision-Language-Action (VLA) construido sobre `lerobot/pi0_base`, el modelo fundacional de robots de Physical Intelligence adaptado a la librería LeRobot de Hugging Face. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) y produce acciones de 6 dimensiones para un robot tipo `so101_follower`. Con 4.028.019.472 parámetros (~4,03 mil millones), hereda la arquitectura del π₀ original y se distribuye en formato safetensors con un tamaño de repositorio de 8,9 GB.

El modelo ha sido entrenado específicamente para la tarea "Grab orange and place into plate" (coger una naranja y colocarla en un plato) sobre el dataset `LightwheelAI/leisaac-pick-orange`, que contiene 60 episodios y 36.293 fotogramas a 30 FPS. Se trata, por tanto, de una política de imitación especializada en una única tarea de manipulación, no de un modelo generalista listo para producción. Su relevancia radica en que demuestra el flujo completo de fine-tuning de π₀ con LeRobot 0.6.2 sobre hardware asequible (SO-101), un caso de uso habitual en investigación en robótica de bajo coste.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face. No se han publicado resultados de evaluación en el repositorio, por lo que el rendimiento real de la política en el robot no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (Pi0) de Physical Intelligence, adaptada a LeRobot; transformer multimodal con entrada visual + estado y salida de acciones |
| Parametros totales | 4.028.019.472 (~4,03 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de imitación por paso; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea se pasan como texto, pero no se documenta cobertura multilingüe) |
| Licencia | gemma |
| Formato de pesos | safetensors (librería lerobot) |
| Modelo base | lerobot/pi0_base |
| Tipo de robot | so101_follower |
| Cámaras | front, wrist (3x480x640 cada una) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de acción | action, shape (6,) |
| Dataset de entrenamiento | LightwheelAI/leisaac-pick-orange (60 episodios, 36.293 frames, 30 FPS) |
| Tarea entrenada | "Grab orange and place into plate" |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi0_base`, la implementación en LeRobot del π₀ de Physical Intelligence, un modelo fundacional de robot presentado como política generalista Vision-Language-Action. La arquitectura combina un codificador visual (dos flujos de imagen, cámara frontal y de muñeca), una representación del estado articular del robot (6 dimensiones) y una instrucción en lenguaje natural, y genera directamente un vector de acción de 6 dimensiones. La implementación de LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. No se detalla en la model card el número de tokens de entrenamiento del modelo base, la composición del dataset original ni si se aplicaron etapas de RLHF o DPO.

El fine-tuning se realizó con LeRobot 0.6.2 durante 15.000 pasos, con batch size de 32, optimizador AdamW, learning rate de 0,0001 y semilla 1000, sobre el dataset `LightwheelAI/leisaac-pick-orange`. Este dataset contiene 60 episodios de demostración (36.293 fotogramas a 30 FPS) de la tarea de coger una naranja y depositarla en un plato. Se trata de un régimen de imitación supervisada sobre un único task, sin que la model card documente aumentos de datos, variaciones de entorno ni evaluaciones de generalización.

## Capacidades

- Control robótico de manipulación de 6 grados de libertad sobre el robot `so101_follower`, generando acciones de 6 dimensiones a partir de observaciones.
- Percepción visual multimodal mediante dos cámaras (frontal y de muñeca) a resolución 480x640 y 30 FPS.
- Interpretación de instrucciones en lenguaje natural para condicionar la tarea (por ejemplo, "Grab orange and place into plate").
- Ejecución de una política de imitación especializada en una tarea concreta de pick-and-place.
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación en imitación de bajo coste: replicar el flujo completo de fine-tuning de π₀ sobre el robot SO-101 para estudiar transferencia de políticas VLA en hardware asequible, usando `lerobot-train` con `lerobot/pi0_base` como punto de partida.
- Automatización de pick-and-place en laboratorio: ejecutar la tarea "Grab orange and place into plate" con `lerobot-rollout` y `--strategy.type=base` para validar la política sin grabar episodios, útil en pruebas de integración de hardware.
- Generación de datos de demostración: usar el modelo como política de referencia para comparar contra nuevas políticas entrenadas sobre el mismo dataset y medir mejoras de éxito.
- Docencia y formación en robótica: servir como ejemplo didáctico de una política VLA entrenada de extremo a extremo con dos cámaras y estado articular, con comandos reproducibles documentados.
- Base para fine-tuning en tareas similares: reutilizar los pesos como inicialización para nuevas tareas de manipulación con el mismo robot y configuración de cámaras, reduciendo el coste frente a entrenar desde `pi0_base`.
- Prototipado de pipelines de evaluación: integrar el modelo en un banco de pruebas que mida tasa de éxito por ensayo, posiciones de objeto, iluminación y distractores, siguiendo la plantilla de evaluación de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,03 B parámetros en safetensors (8,9 GB de repo), la inferencia en precisión completa requiere del orden de 8-10 GB de VRAM solo para pesos, más memoria para activaciones y procesamiento de las dos cámaras.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100) es un punto de partida razonable; no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente en GPUs de 16 GB o más con cuantización, pero no se documenta soporte de cuantización ni requisitos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. La model card no reporta frecuencia de control efectiva ni latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImemKK/your_repo_id | 4,03 B | no disponible | Pick-and-place especializado (naranja en plato) | gemma | Hugging Face, 0 descargas, 0 likes |
| lerobot/pi0_base | no disponible en la información | no disponible | Política VLA generalista base | no disponible en la información | Hugging Face (modelo base) |
| π₀ original (Physical Intelligence) | no disponible en la información | no disponible | Política VLA generalista multi-robot | no disponible en la información | OpenPI (open source) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado únicamente para la tarea "Grab orange and place into plate" sobre 60 episodios; no hay evidencia de generalización a otras tareas, objetos o posiciones.
- Sin evaluación publicada: no existen tasas de éxito ni métricas de robustez, por lo que no puede recomendarse para producción sin validación propia.
- Dependencia de hardware concreto: asume robot `so101_follower`, estado de 6 dimensiones y cámaras `front` y `wrist` a 480x640 y 30 FPS; cualquier desviación en la configuración invalida la política.
- Licencia "gemma": impone las condiciones de la licencia Gemma; debe revisarse su compatibilidad con uso comercial antes de desplegar.
- Riesgo de sobreajuste al dataset: 60 episodios y 36.293 fotogramas son un volumen reducido; es probable una baja robustez ante cambios de iluminación, distractores o posiciones no vistas.
- Idiomas no documentados: aunque la tarea se condiciona por texto, no se especifica cobertura lingüística de las instrucciones.
- Nombre de repositorio genérico (`your_repo_id`): sugiere una publicación de prueba o plantilla, no un artefacto validado; conviene verificar integridad de pesos antes de usarlo.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser una política visual puede heredar sesgos de los datos de demostración (posiciones, colores, entorno del dataset).
- Riesgo de alucinación en el sentido de acciones erróneas: como política de imitación, puede generar trayectorias plausibles pero incorrectas sin señal de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImemKK/your_repo_id
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/LightwheelAI/leisaac-pick-orange
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LightwheelAI/leisaac-pick-orange
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Guía de LeRobot para π₀: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
