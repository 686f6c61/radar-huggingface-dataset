# puppet-robotics/checkpoint_test

## Resumen

`puppet-robotics/checkpoint_test` es un modelo de tipo Vision-Language-Action (VLA) para robótica, publicado por el usuario de HuggingFace `puppet-robotics`. Se trata de un fine-tuning de `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence, un VLA disenado para generalización en entornos abiertos y que evoluciona el anterior π₀. El checkpoint está entrenado con la librería LeRobot y etiquetado con la pipeline `robotics`, por lo que su propósito no es la generación de texto sino la producción de acciones motoras a partir de observaciones visuales y de estado del robot.

El modelo consume dos flujos de cámara (una de muñeca, `wrist`, y una egocéntrica, `ego`), junto con un vector de estado de 8 dimensiones, y produce un vector de acción también de 8 dimensiones. Cuenta con aproximadamente 4.143 millones de parámetros (4,14 B) en formato `safetensors`, con un tamano de repositorio de 9,4 GB. La tarea concreta para la que ha sido ajustado es "Play golf", sobre un robot de tipo `oscar`.

Su relevancia actual reside en que forma parte del ecosistema LeRobot, que estandariza el entrenamiento y despliegue de políticas de imitación en robots reales, y en que aprovecha un modelo base VLA de referencia (Pi05) para tareas de manipulación guiada por lenguaje e imagen. La licencia Apache 2.0 facilita su reutilización, aunque la información pública sobre arquitectura interna, datos de preentrenamiento y evaluación es muy limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) de Physical Intelligence; implementacion LeRobot adaptada del repositorio OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de politica robotica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base VLA procesa instrucciones en lenguaje natural; idiomas concretos no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | oscar |
| Camaras de entrada | wrist (3, 480, 640) y ego (3, 720, 1280) |
| Entrada de estado | observation.state, shape (8,) |
| Salida de accion | action, shape (8,) |
| Libreria | lerobot (version 0.6.2) |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo es una política VLA derivada de π₀.₅ (Pi05), cuyo objetivo declarado por Physical Intelligence es generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento, evolucionando el diseño de π₀. La implementación empleada procede del repositorio OpenPI y ha sido adaptada al ecosistema LeRobot. La model card no detalla la composición interna de la arquitectura (backbone de visión, encoder de lenguaje, mecanismo de generación de acciones, uso de flow matching u otros), por lo que esos extremos quedan como no disponibles en la documentación del checkpoint.

El ajuste fino se realizó sobre el dataset `puppet-robotics/golf-2-8fps-plus-no-putt`, compuesto por 350 episodios y 20.034 fotogramas grabados a 8 FPS, con la tarea "Play golf". La configuración de entrenamiento reportada es de 1.000 pasos, batch size 32, optimizador AdamW y tasa de aprendizaje 2,5e-05 con semilla 1000. No se especifica en la información disponible si hubo etapas de RLHF, DPO u optimización por preferencias, ni el número de tokens o composición del corpus de preentrenamiento del modelo base.

## Capacidades

- Generación de acciones motoras de 8 dimensiones a partir de observaciones visuales y de estado del robot.
- Procesamiento multimodal: dos flujos de cámara (muñeca y egocéntrica) más un vector de estado.
- Aprendizaje por imitación (imitation learning) sobre demostraciones reales de una tarea de manipulación ("Play golf").
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como cadena de texto, por ejemplo `--task="Play golf"`).
- Integración con el flujo de LeRobot para despliegue en robot real mediante `lerobot-rollout`.
- Reentrenamiento o ajuste fino adicional mediante `lerobot-train` partiendo de `lerobot/pi05_base`.
- Generalización pretendida a entornos nuevos (propiedad heredada del diseño de Pi05, según la descripción del autor).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento explícito ni modos de "thinking" en la información disponible.

## Casos de uso

- Automatización de tareas de manipulación en robot real: desplegar la política sobre un robot `oscar` para ejecutar la tarea "Play golf" mediante `lerobot-rollout`, aprovechando las observaciones de las dos cámaras y el estado del robot.
- Base para ajuste fino en nuevas tareas de manipulación: usar `lerobot-train` con `--policy.path=lerobot/pi05_base` y un dataset propio para adaptar la política a otra tarea, siguiendo el mismo procedimiento empleado en este checkpoint.
- Investigación en aprendizaje por imitación: servir como punto de partida para estudiar transferencia de políticas VLA, comparando el rendimiento del checkpoint ajustado frente al modelo base.
- Recolección y validación de datasets robóticos: el enlace al visualizador de datasets de LeRobot permite inspeccionar los 350 episodios y 20.034 fotogramas usados, útil para auditar la calidad de los datos antes de reentrenar.
- Prototipado en laboratorio con hardware accesible: al ser un modelo de ~4,14 B de parámetros, puede ejecutarse en una GPU de gama alta de consumo, lo que facilita pruebas de política robótica sin infraestructura de centro de datos.
- Benchmarking interno de la pila LeRobot: usar el checkpoint como referencia para medir latencia, throughput de inferencia y estabilidad de la política en el robot `oscar`.
- Formación y docencia en robótica con IA: el pipeline completo (instalación, grabación de datos, entrenamiento y rollout) sirve como ejemplo reproducible de extremo a extremo con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet") y no incluye tasas de éxito sobre robot real ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan unos 9,4 GB en `safetensors`, compatibles con precision BF16/FP16. En FP32 la huella sería mayor (aproximadamente 16,5 GB), aunque no se especifican las cuantizaciones soportadas.
- GPU recomendadas: no disponibles de forma explícita. Por tamano de modelo (4,14 B), una GPU de 24 GB (RTX 3090, RTX 4090, A100 40 GB, H100) debería alojar los pesos con margen para activaciones y procesamiento de dos flujos de imagen.
- Cabe en GPU de consumo: probablemente sí en GPUs de 24 GB; su viabilidad en GPUs de 16 GB depende de cuantización y del presupuesto de memoria para las imágenes de entrada, dato no disponible.
- Opciones de despliegue: LeRobot mediante los comandos `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento o ajuste fino), con `--policy.device=cuda`. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas VLA de acción.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabó a 8 FPS, pero no se documenta la frecuencia de inferencia alcanzable en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `puppet-robotics/checkpoint_test` (Pi05 fine-tune) | ~4,14 B | no disponible | VLA robotico | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | VLA robotico | no disponible | HuggingFace |
| π₀ (Pi0, referencia conceptual) | no disponible | no disponible | VLA robotico | no disponible | Repositorio OpenPI |
| Otros VLA de robotica (p. ej. OpenVLA) | no disponible | no disponible | VLA robotico | no disponible | HuggingFace |

No se dispone de datos suficientes en la información proporcionada para establecer comparaciones cuantitativas de rendimiento entre este modelo y alternativas de la misma categoría; las filas anteriores reflejan únicamente lo confirmado o su ausencia explícita.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo para esta política.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones incorrectas o inseguras en el robot, dado que el modelo genera trayectorias motoras sin verificación externa documentada.
- Evaluación ausente: la model card confirma que no se han publicado resultados de evaluación, por lo que no hay evidencia pública de tasa de éxito ni de robustez.
- Generalización limitada por datos: el ajuste fino se realizó sobre una única tarea ("Play golf") con 350 episodios, lo que restringe su comportamiento fuera de ese dominio.
- Dependencia de configuración de hardware: las cámaras y el robot deben coincidir exactamente con los nombres y el tipo (`oscar`, cámaras `wrist` y `ego`) usados en el entrenamiento; un desajuste invalida el despliegue.
- Idiomas soportados: no especificados; la instrucción de tarea es en inglés ("Play golf") y se desconoce el comportamiento con otros idiomas.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que en principio permite uso comercial, pero se desconoce si el modelo base `lerobot/pi05_base` impone condiciones adicionales.
- Sin datos de cuantización: al no documentarse cuantizaciones compatibles, el despliegue en hardware limitado puede requerir experimentación propia.
- Repositorio con 0 descargas y 0 likes y nombre genérico (`checkpoint_test`): sugiere un artefacto de prueba más que un modelo validado para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/puppet-robotics/checkpoint_test
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/puppet-robotics/golf-2-8fps-plus-no-putt
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=puppet-robotics/golf-2-8fps-plus-no-putt
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible como enlace directo en la informacion proporcionada
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil de GitHub de Puppet Robotics: https://github.com/PuppetRobotics
- Sitio web de Puppet Robotics: https://www.puppetrobotics.ai/
