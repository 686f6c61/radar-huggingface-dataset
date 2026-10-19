# rbalazs/smolvla_FINALV1

## Resumen

`rbalazs/smolvla_FINALV1` es una política robótica de tipo vision-language-action (VLA) obtenida por fine-tuning del modelo base `lerobot/smolvla_base`, publicada por el usuario rbalazs a través de la librería LeRobot. No es un modelo de lenguaje general, sino una política de imitación que consume el estado articular de un brazo robótico y tres flujos de imagen de 256×256 píxeles, y produce un vector de acción de 6 dimensiones. Con 450.046.176 parámetros (aproximadamente 450 M), se enmarca en la familia SmolVLA, descrita por sus autores como un modelo VLA compacto y eficiente, con rendimiento competitivo a coste computacional reducido y desplegable en hardware de consumo.

El modelo resuelve una tarea muy concreta: manipulación de tres tazas (izquierda, central y derecha) sobre un robot `so_follower`, con instrucciones en inglés del tipo «Pick up the right cup and put it down». Se ha entrenado con el dataset `rbalazs/LabElecAddAllCleanedTrim` (90 episodios, 31.182 fotogramas a 30 FPS, unos 17 minutos de demostraciones). Es relevante ahora porque ejemplifica el flujo completo de LeRobot: grabar demostraciones con hardware de bajo coste, fine-tunear un VLA de 450 M de parámetros y ejecutarlo en una GPU de consumo, sin infraestructura de servidor.

La ficha no incluye resultados de evaluación: la plantilla de la model card mantiene el aviso «No evaluation results have been provided for this policy yet», por lo que no existe evidencia publicada de tasa de éxito en robot real. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, fine-tune de `lerobot/smolvla_base`; detalles internos de la red no documentados en la informacion disponible |
| Parametros totales | 450.046.176 (dato real de los safetensors) |
| Parametros activos | No aplica: no hay evidencia de arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible; es una politica que consume la observacion actual, no una ventana de texto |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | No disponible; las instrucciones de las tareas entrenadas estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`); tamano del repositorio 10,6 GB |
| Tipo de robot | `so_follower` |
| Camaras declaradas | `front`, `iphone` |
| Entradas | `observation.state` (6,); `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,) |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible describe SmolVLA como un modelo VLA compacto y eficiente, con rendimiento competitivo a coste computacional reducido, pensado para desplegarse en hardware de consumo. Esta instancia concreta es un fine-tune supervisado del checkpoint `lerobot/smolvla_base` mediante imitación (behavior cloning) con LeRobot 0.6.2: 16.000 pasos de entrenamiento, batch de 32, optimizador AdamW, learning rate 0,0001 y semilla 1000. La política mapea un estado de 6 dimensiones más tres imágenes de 256×256 a una acción de 6 dimensiones, es decir, un espacio de control de 6 grados de libertad típico de un brazo tipo SO-100/SO-101.

El dataset de entrenamiento, `rbalazs/LabElecAddAllCleanedTrim`, contiene 90 episodios y 31.182 fotogramas a 30 FPS (aproximadamente 17,3 minutos de demostraciones, unas 346 imágenes por episodio). Cubre tres tareas de pick-and-place sobre tazas. No se documenta en la informacion proporcionada la composición del preentrenamiento del modelo base, el número de tokens vistos, ni si hubo etapas de RLHF/DPO; en robótica de imitación estas etapas no suelen aplicarse. Tampoco se detallan innovaciones internas de atención o decodificación más allá de lo que describe el paper de SmolVLA.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones a partir del estado articular y de tres vistas de cámara.
- Ejecución de instrucciones en lenguaje natural para las tareas entrenadas: «Pick up the right cup and put it down», «Pick up the left cup and put it down», «Pick up the middle cup and put it down».
- Percepción visual multi-cámara: procesa tres imágenes de 256×256 por paso de inferencia.
- Política de imitación entrenada de extremo a extremo sobre demostraciones humanas (teleoperación).
- Integración nativa con LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- Punto de partida para fine-tuning con datasets propios (transfer learning desde un VLA de 450 M).
- Capacidades de diálogo general, tool calling, agentes, matemáticas o generación de código: no disponibles; este modelo no se distribuye como LLM.

## Casos de uso

- Manipulación de laboratorio con tres tazas: el modelo ejecuta la secuencia de aproximación, agarre y depósito sobre la taza indicada por la instrucción, usando las tres cámaras para localizar el objeto. Es su caso de uso nativo y el único validado por el dataset de entrenamiento.
- Pick-and-place en una célula de montaje educativa: con un brazo `so_follower` y dos cámaras USB a 30 FPS, la política puede integrarse en una célula de demostración para clasificar objetos ligeros; el coste de cómputo (450 M de parámetros) permite ejecutarla en una sola GPU de consumo.
- Base para fine-tuning con un dataset propio: partiendo de este checkpoint o del base, un equipo puede grabar 50-100 episodios con `lerobot-record` y reentrenar con `lerobot-train` para una tarea nueva, reduciendo el coste frente a entrenar desde cero.
- Investigación en imitación visual-motora: sirve como línea base reproducible para comparar variantes de aumento de datos, número de cámaras o tasas de fotogramas, dado que la configuración de entrenamiento está completamente documentada.
- Docencia y divulgación: el par LeRobot + SO-100 + SmolVLA permite montar un taller completo de aprendizaje por imitación en el que los alumnos graban datos, entrenan y ejecutan su propia política.
- Evaluación de robustez en hardware de bajo coste: al requerir presumiblemente pocos GB de VRAM, permite iterar rápidamente sobre variaciones de iluminación, posición de objetos y distractores en un banco de pruebas físico.
- Ciclo de mejora de datos: usar los fallos de la política en `lerobot-rollout` para identificar estados poco representados y grabar episodios adicionales que corrijan esos modos de fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la nota explícita «No evaluation results have been provided for this policy yet», sin tabla de ensayos, éxitos ni tasas de acierto. Tampoco se proporcionan métricas de latencia o throughput medidas en robot real.

## Requisitos de hardware

- VRAM estimada: a partir de los 450 M de parámetros, los pesos ocupan aproximadamente 1,8 GB en fp32 y 0,9 GB en bf16/fp16; sumando activaciones y tres flujos de imagen de 256×256, es razonable reservar entre 3 y 6 GB de VRAM. Es una estimación de ingeniería, no un dato publicado.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para inferencia; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4 o A10. Para reentrenar con batch 32 conviene 16-24 GB (RTX 4090, A100 40 GB).
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 6-8 GB para inferencia; el entrenamiento con la configuración documentada requiere más margen.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=rbalazs/smolvla_FINALV1`), PyTorch sobre CUDA y `lerobot-train` para reentrenamiento. vLLM, llama.cpp, Ollama y TGI no están soportados para este tipo de política, orientada a un bucle de control en tiempo real y no a servir texto.
- Latencia y throughput: no disponibles. Como referencia de diseño, el dataset se grabó a 30 FPS, por lo que el lazo de control completo (captura de tres cámaras + inferencia + envío de acción) debería sostenerse por debajo de 33 ms para operar a la frecuencia de las demostraciones; no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rbalazs/smolvla_FINALV1` | 450 M | estado (6,) + 3 imagenes 256×256 | Sin resultados de evaluacion | apache-2.0 | HuggingFace, 0 descargas |
| `lerobot/smolvla_base` | No disponible (misma familia, ~450 M) | No disponible | No disponible en la informacion | No disponible en la informacion | HuggingFace, modelo base publico |
| Otros VLA abiertos (p. ej. OpenVLA, pi0) | No disponible | No disponible | No disponible | No disponible | No verificado en la informacion proporcionada |

La comparación relevante es con el modelo base: este checkpoint solo se diferencia por el fine-tuning sobre 90 episodios de una tarea concreta. Cualquier comparación cuantitativa con otras familias VLA exigiría datos de evaluación que aquí no se aportan.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada ni número de ensayos, por lo que se desconoce la fiabilidad real de la política.
- Sobreajuste al dominio de entrenamiento: 90 episodios de tres tareas muy similares limitan la generalización a otros objetos, posiciones, iluminación o robots distintos del `so_follower`.
- Idioma: las instrucciones entrenadas están en inglés y el modelo no documenta capacidades multilingües; no debe asumirse que acepte instrucciones en castellano.
- Discrepancia en la configuración de cámaras: la model card declara las cámaras `front` e `iphone`, mientras que la tabla de entradas lista `camera1`, `camera2` y `camera3`. Es necesario alinear los nombres de las claves de observación antes de ejecutar la política.
- Riesgo de alucinación perceptiva: como toda política visomotora, puede generar trayectorias plausibles pero incorrectas cuando la escena difiere de la distribución de entrenamiento, sin señal de incertidumbre asociada.
- Sesgos: no documentados; el dataset parece provenir de un único operador y un único entorno de laboratorio, lo que introduce sesgo de estilo de teleoperación y de configuración física.
- Licencia: apache-2.0 permite uso comercial y modificaciones, pero la licencia del modelo base debe verificarse de forma independiente antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes; repositorio de 10,6 GB con pesos safetensors, sin variantes cuantizadas, ONNX ni otros formatos que faciliten el despliegue en hardware embebido.
- Reproducibilidad del entorno: depende de LeRobot 0.6.2 y de una calibración concreta del robot y las cámaras; cambios en esa calibración invalidan la política.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rbalazs/smolvla_FINALV1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/rbalazs/LabElecAddAllCleanedTrim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rbalazs/LabElecAddAllCleanedTrim
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Documentación de aprendizaje por imitación: https://huggingface.co/docs/lerobot/en/il_robots
- Comunidad Reachy Mini (Pollen Robotics): https://pollen-robotics.com/reachy-mini/community/
