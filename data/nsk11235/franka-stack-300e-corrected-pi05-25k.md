# nsk11235/franka-stack-300e-corrected-pi05-25k

## Resumen

El modelo `nsk11235/franka-stack-300e-corrected-pi05-25k` es un ajuste fino (fine-tuning) de un modelo de Visión-Lenguaje-Acción (VLA), concretamente de la variante π₀.₅ (Pi05) desarrollada por Physical Intelligence y adaptada a la librería LeRobot de Hugging Face. Lo publica el usuario `nsk11235` y su propósito es controlar un brazo robótico Franka para ejecutar una tarea concreta de manipulación: apilar cubos de colores en un orden específico. El modelo base es `lerobot/pi05_base` y se ha entrenado sobre el dataset propio `nsk11235/franka-stack-300e`.

A diferencia de un modelo de lenguaje convencional, este modelo consume observaciones multimodales (dos cámaras y el estado de las articulaciones del robot) y produce directamente comandos de acción de 8 dimensiones. Cuenta con 4.143.404.816 parámetros (~4,14 mil millones), un tamaño de repositorio de 9,4 GB y un entrenamiento de 25.000 pasos con un batch size de 16.

Su relevancia es limitada y muy específica: es un modelo de investigación para robótica de imitación (imitation learning), sin resultados de evaluación publicados, sin descargas registradas y restringido a una única tarea y a un único tipo de robot (Franka). No es un modelo de propósito general ni apto para producción sin una validación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); derivada de π₀.₅, implementación LeRobot del repositorio OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors; sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | franka |
| Camaras de entrada | top, wrist_cam |
| Entradas | observation.images.top (3, 256, 256); observation.images.wrist_cam (3, 256, 256); observation.state (16,) |
| Salidas | action (8,) |
| Tamano del repositorio | 9,4 GB |
| Libreria | lerobot (version 0.6.2) |

## Arquitectura y entrenamiento

El modelo es un VLA de tipo transformer construido sobre la arquitectura de π₀.₅ (Pi05) de Physical Intelligence, que evoluciona π₀ para mejorar la generalización a entornos y situaciones no vistos durante el entrenamiento. La implementación concreta procede del repositorio OpenPI adaptado a LeRobot. La arquitectura combina una torre de visión (que procesa dos imágenes de 256x256 a 3 canales) con un componente de lenguaje/acción que integra el estado del robot (vector de 16 dimensiones) y emite un vector de acción de 8 dimensiones. El diseño subyacente de la familia π₀/π₀.₅ emplea un esquema de experto de acción sobre un backbone tipo PaliGemma, aunque la model card no detalla la configuración interna exacta de esta instancia.

El entrenamiento se realizó mediante aprendizaje por imitación sobre el dataset `nsk11235/franka-stack-300e`, compuesto por 318 episodios, 89.018 fotogramas y una tasa de 20 FPS, con una única tarea: "Pick up the red cube and place it on top of the blue cube. Then pick up the green cube and place it on top of the red cube." La configuración de entrenamiento fue de 25.000 pasos, batch size 16, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. No se documenta en la información disponible si hubo fases de RLHF, DPO ni ninguna innovación técnica adicional más allá de la herencia de π₀.₅.

## Capacidades

- Control robótico de manipulación: genera acciones de 8 grados de libertad para un brazo Franka a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente dos flujos de cámara (vista superior y cámara de muñeca) a resolución 256x256.
- Aprendizaje por imitación: reproduce la tarea de apilado de cubos aprendida del dataset de demostraciones.
- Condicionamiento por instrucción de tarea: acepta una descripción textual de la tarea (por ejemplo, en la invocación de `lerobot-rollout` mediante `--task=`).
- Integración nativa con LeRobot: funciona con las herramientas `lerobot-rollout` y `lerobot-train`.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de agente; únicamente ejecuta la secuencia motriz de la tarea aprendida.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión general, audio): no disponible.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como punto de partida para experimentos de fine-tuning de VLA sobre brazos Franka, reutilizando la configuración de LeRobot documentada.
- Reproducción de la tarea de apilado de cubos: validar una política que apila cubos rojo, azul y verde en un orden concreto en un entorno controlado de laboratorio.
- Evaluación de pipelines de robótica en LeRobot: comprobar el flujo completo de `lerobot-rollout` con un robot real, sustituyendo puerto y cámaras por los de la máquina del usuario.
- Comparación de estrategias de ajuste: contrastar los resultados de este fine-tune de 25.000 pasos con el modelo base `lerobot/pi05_base` u otros ajustes para estudiar el efecto del número de pasos y del dataset.
- Generación de nuevos datasets de robótica: usar la política como referencia para grabar episodios adicionales y ampliar el dataset de entrenamiento.
- Docencia y demostraciones: ilustrar en un entorno académico cómo un modelo VLA transforma observaciones multimodales en acciones de bajo nivel.
- Pruebas de integración de hardware: verificar la calibración de cámaras y del brazo Franka frente a las claves de observación esperadas por la política.

No debe utilizarse en entornos de producción no supervisados, ya que no se han publicado resultados de evaluación ni tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone, por tanto, de tasas de éxito en tareas reales ni de métricas de simulación.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos según el número de parámetros de 4,14 mil millones; no confirmados en la model card):
  - FP32: ~16,6 GB
  - FP16/BF16: ~8,3 GB
  - INT8: ~4,1 GB
  - INT4: ~2,1 GB
- GPU recomendadas: para precisión FP16/BF16 se recomienda una GPU con al menos 12-16 GB de VRAM (RTX 4080/4090, A10, L4). Para FP32, una A100 o H100 de 40/80 GB.
- Compatibilidad con GPU de consumo: probablemente sí en FP16/BF16 en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5090); en INT8/INT4 podría caber en GPUs de 8-12 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` y `lerobot-train` con `--policy.device=cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de acción y no de generación de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nsk11235/franka-stack-300e-corrected-pi05-25k | ~4,14 mil millones | Apilado de cubos con Franka | no disponible | gemma | Hugging Face (0 descargas, 0 likes) |
| lerobot/pi05_base | no disponible | VLA base de propósito general (robótica) | no disponible | gemma | Hugging Face |
| Otros VLA de código abierto (por ejemplo, OpenVLA) | no disponible en esta busqueda | Control robótico general | no disponible | no disponible | Hugging Face / repositorios publicos |

El modelo base `lerobot/pi05_base` es la alternativa más directa y comparte arquitectura y licencia; la diferencia es que este fine-tune está especializado en una única tarea y robot, mientras que el base está pensado para generalización y ajuste posterior. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otras alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su fiabilidad.
- Especialización extrema: entrenado para una única tarea y un único tipo de robot (Franka); no generaliza a otras tareas o plataformas sin reentrenamiento.
- Dependencia de las claves de observación: espera exactamente las cámaras `top` y `wrist_cam`, un estado de 16 dimensiones y devuelve acciones de 8 dimensiones; cualquier discrepancia en el hardware romperá la inferencia.
- Dataset limitado: 318 episodios y 89.018 fotogramas, con una sola instrucción de tarea; probable sobreajuste a condiciones concretas de iluminación, posiciones y objetos.
- Sesgos: no documentados, pero al derivar de un modelo de lenguaje/visión subyacente puede heredar sesgos de sus datos de preentrenamiento en la parte perceptiva.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones erróneas o inseguras en el mundo físico, con posible daño al robot o al entorno.
- Licencia Gemma: restringe el uso comercial y exige cumplir los términos de la licencia Gemma; debe revisarse antes de cualquier despliegue, especialmente en productos comerciales.
- Idioma: no se documentan idiomas soportados para el condicionamiento textual de la tarea.
- Madurez: repositorio con 0 descargas y 0 likes, sin comunidad ni mantenimiento conocido; no apto para producción sin validación propia.
- Fecha de creación indicada como 2026-10-14, dato que conviene verificar por si fuera erróneo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nsk11235/franka-stack-300e-corrected-pi05-25k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/nsk11235/franka-stack-300e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nsk11235/franka-stack-300e
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
