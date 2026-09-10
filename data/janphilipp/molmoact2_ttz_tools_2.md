# JanPhilipp/molmoact2_ttz_tools_2

## Resumen

`JanPhilipp/molmoact2_ttz_tools_2` es una política de robótica entrenada con LeRobot y publicada en Hugging Face por el usuario JanPhilipp. Se trata de un ajuste fino del modelo fundacional de robótica MolmoAct2, desarrollado por el Allen Institute for AI (Ai2), que transforma imágenes de cámara e instrucciones en lenguaje en "chunks" de acciones de robot. El modelo resuelve una tarea muy concreta de manipulación: coger herramientas de una zona verde y colocarlas en una zona roja.

La política tiene 5.601.988.144 parámetros (unos 5,6 mil millones) y ocupa 12,7 GB en el repositorio. Consume dos cámaras RGB a 480x640 y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones, lo que la vincula a un brazo seguidor tipo `so_follower` de la familia SO-100/SO-101. Su relevancia es doble: por un lado, es un ejemplo práctico de ajuste fino de un modelo fundacional visual-lenguaje-acción (VLA) con el stack de LeRobot; por otro, muestra el flujo completo de entrenamiento por imitación sobre un dataset propio pequeño.

Se trata de un modelo recién publicado (creado el 10 de septiembre de 2026), sin descargas ni valoraciones, y sin resultados de evaluación en robot real reportados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de robótica basada en MolmoAct2 (modelo fundacional VLA de Ai2, imágenes + lenguaje a acciones); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parámetros totales | 5.601.988.144 (unos 5,6 mil millones) |
| Parámetros activos | No aplica: la información proporcionada no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos se distribuyen en formato safetensors y no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible; la única instrucción documentada está en inglés ("Grab the tools from the green area and place them on the red area") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Cámaras | `camera1`, `camera2` (3, 480, 640 cada una) |
| Dimensión de estado | 6 |
| Dimensión de acción | 6 |
| Tamaño del repositorio | 12,7 GB |
| Dataset de entrenamiento | `JanPhilipp/ttz_tools_merged_2` |
| Versión de LeRobot | 0.6.2 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como una implementación en LeRobot del modelo fundacional MolmoAct2 de Ai2, que mapea imágenes de cámara e instrucciones de lenguaje a chunks de acciones de robot. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del corpus de preentrenamiento, ni si hubo etapas de RLHF o DPO. Tampoco se especifican innovaciones técnicas internas (atención lineal, decodificación especulativa, mecanismos de fusión multimodal, etc.). Lo que sí se documenta es la interfaz de la política: dos cámaras RGB a 480x640 (`observation.images.camera1` y `observation.images.camera2`), un vector de estado de 6 dimensiones (`observation.state`) y un vector de acción de 6 dimensiones (`action`).

El ajuste fino se realizó por imitación sobre el dataset `JanPhilipp/ttz_tools_merged_2`, compuesto por 80 episodios y 69.819 fotogramas grabados a 30 FPS (aproximadamente 39 minutos de datos efectivos). La tarea única es "Grab the tools from the green area and place them on the red area". La configuración de entrenamiento reportada es de 10.000 pasos, tamaño de lote 16, optimizador `molmoact2_adamw`, tasa de aprendizaje 1e-05 y semilla 1000, ejecutado con LeRobot 0.6.2. No se aportan curvas de pérdida, métricas de validación ni resultados de evaluación en robot real.

## Capacidades

- Generación de acciones de robot: produce chunks de acción de 6 grados de libertad a partir de observaciones visuales y de estado.
- Fusión de dos vistas de cámara simultáneas (480x640 cada una), lo que permite cubrir tanto la zona de origen como la de destino.
- Condicionamiento por instrucción en lenguaje: la política recibe una cadena de tarea (`--task="Grab the tools from the green area and place them on the red area"`), aunque la información disponible no indica que generalice a instrucciones distintas de la entrenada.
- Ejecución en bucle cerrado a 30 FPS, sincronizada con la frecuencia de grabación del dataset.
- Compatibilidad nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, ejecución con `lerobot-rollout`.
- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones y no soporta tool calling ni function calling.
- No se documentan capacidades de visión general, audio, modo de razonamiento explícito ni soporte multilingüe.
- Soporte de agentes multi-paso: no disponible; se trata de una política reactiva de una sola tarea, no de un agente planificador.

## Casos de uso

- Automatización de pick-and-place de herramientas: el modelo está entrenado específicamente para mover objetos de un área verde a un área roja, por lo que puede desplegarse directamente en un banco de trabajo con un brazo `so_follower` y dos cámaras para esa tarea concreta.
- Punto de partida para ajuste fino de nuevas tareas: al estar integrado en LeRobot, se puede reentrenar con `lerobot-train --policy.type=molmoact2` sobre un dataset propio y aprovechar los pesos preentrenados, reduciendo el número de episodios necesarios frente a entrenar desde cero.
- Investigación comparativa de políticas VLA: sirve como baseline de 5,6 mil millones de parámetros para medir, con el mismo dataset y robot, si políticas más pequeñas (ACT, Diffusion Policy, SmolVLA) alcanzan tasas de éxito similares.
- Docencia y prototipado en robótica de bajo coste: el hardware objetivo es un brazo seguidor de la familia SO, asequible y ampliamente documentado, lo que permite reproducir el flujo completo de grabación, entrenamiento y despliegue en un laboratorio o aula.
- Validación de pipelines de datos de imitación: al estar vinculado a un dataset público de 80 episodios y 69.819 fotogramas, permite estudiar cómo afecta la composición del dataset (posiciones, iluminación, distractores) al comportamiento de la política.
- Pruebas de robustez y análisis de fallos: útil para medir la degradación de la política ante cambios de iluminación, posiciones nuevas de las herramientas o cámaras ligeramente desplazadas, antes de plantear un despliegue en producción.
- Recolección de datos aumentada: puede usarse como política inicial para generar trayectorias candidatas que un operador corrige, alimentando un ciclo de aprendizaje por imitación iterativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y no se reportan tasas de éxito, número de ensayos ni métricas en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 5.601.988.144 parámetros; no confirmada por el autor): unos 11,2 GB solo de pesos en bf16/fp16, más activaciones y buffers, lo que sitúa el consumo práctico en torno a 12-14 GB; en fp32 los pesos solos ocuparían unos 22,4 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S (48 GB) para despliegues con margen y lotes mayores.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB debería alojar los pesos en bf16; una RTX 4080 de 16 GB queda al límite y probablemente requiera cuantización, que no está documentada oficialmente. Tarjetas de 8-12 GB no son viables sin cuantización.
- Opciones de despliegue: el camino oficial es la CLI de LeRobot (`lerobot-rollout` con `--policy.path=JanPhilipp/molmoact2_ttz_tools_2`) sobre PyTorch. No se documenta compatibilidad con vLLM, TGI, Ollama, llama.cpp ni TensorRT, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de diseño, un control a 30 FPS exige inferencias en torno a 33 ms por chunk de acción, requisito que no está verificado en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JanPhilipp/molmoact2_ttz_tools_2 | Ajuste fino de MolmoAct2 con LeRobot | 5.601.988.144 | 2 cámaras 480x640 + estado 6D | apache-2.0 | Hugging Face Hub, librería `lerobot` |
| MolmoAct2 (Ai2, modelo base) | Modelo fundacional VLA de robótica | No disponible | Imágenes de cámara + instrucciones de lenguaje | No disponible en la información proporcionada | Anunciado en el blog de Ai2 |
| SmolVLA (Hugging Face) | Política VLA compacta del ecosistema LeRobot | No disponible | Imágenes + lenguaje | No disponible | Ecosistema LeRobot |
| ACT / Diffusion Policy (LeRobot) | Políticas de imitación clásicas del ecosistema LeRobot | No disponible | Imágenes + estado | No disponible | Ecosistema LeRobot |

Los datos de los modelos alternativos no forman parte de la información proporcionada para este modelo; se listan únicamente como familias comparables del mismo ámbito y deben verificarse en sus fichas oficiales antes de extraer conclusiones cuantitativas. No se dispone de comparativas de rendimiento con ninguno de ellos.

## Limitaciones y advertencias

- Especialización extrema: la política solo está entrenada para una tarea ("coger herramientas de la zona verde y colocarlas en la zona roja"). Cualquier variación de la tarea requiere reentrenamiento.
- Dataset pequeño: 80 episodios y 69.819 fotogramas (unos 39 minutos a 30 FPS) son insuficientes para garantizar robustez; existe riesgo alto de sobreajuste a posiciones, iluminación y fondo del entorno de grabación.
- Sin evaluación publicada: se desconoce la tasa de éxito real, lo que impide estimar su viabilidad en producción.
- Dependencia del hardware exacto: espera un robot `so_follower` con estado de 6 dimensiones, acción de 6 dimensiones y dos cámaras con claves `camera1` y `camera2` a 480x640; usar otras claves, resoluciones u otro tipo de robot invalida el despliegue.
- Riesgo de deriva de acciones: al no ser un modelo de lenguaje, no "alucina" texto, pero sí puede producir trayectorias erráticas o inseguras ante observaciones fuera de distribución (objetos nuevos, oclusiones, cambios de iluminación). Es obligatorio disponer de parada de emergencia y límites de par en el controlador.
- Idiomas: no hay información sobre multilingüismo; la única instrucción documentada está en inglés.
- Licencia: los pesos se publican bajo apache-2.0, lo que en principio permite uso comercial, pero conviene verificar los términos del modelo base MolmoAct2 de Ai2 y de las dependencias de LeRobot antes de un despliegue comercial.
- Madurez: 0 descargas y 0 valoraciones en el momento de redactar esta ficha; no hay evidencia de uso por terceros ni soporte del autor.
- Restricciones de seguridad: no se documentan límites de fuerza, velocidades máximas ni protocolos de seguridad; cualquier uso con personas o equipos en las proximidades debe evaluarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JanPhilipp/molmoact2_ttz_tools_2
- Dataset de entrenamiento: https://huggingface.co/datasets/JanPhilipp/ttz_tools_merged_2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JanPhilipp/ttz_tools_merged_2
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de MolmoAct2 en LeRobot: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Entrenamiento de políticas por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Cita del método base (LeRobot, Cadene et al., 2024): incluida en la model card del repositorio

Nota: la búsqueda web asociada a esta ficha no devolvió enlaces relevantes al modelo ni a MolmoAct2; los resultados obtenidos correspondían a sitios de retransmisión deportiva sin relación con el contenido.
