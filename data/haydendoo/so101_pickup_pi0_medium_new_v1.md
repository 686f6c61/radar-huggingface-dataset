# haydendoo/so101_pickup_pi0_medium_new_v1

## Resumen

`haydendoo/so101_pickup_pi0_medium_new_v1` es un ajuste fino del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, publicado en el Hub por el usuario `haydendoo` y entrenado con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política Vision-Language-Action (VLA) que recibe dos flujos de imagen (cámara cenital y cámara de muñeca), el estado articular del robot y una instrucción en lenguaje natural, y devuelve directamente un vector de acción de 6 dimensiones para un brazo seguidor SO-101 (`so_follower`).

El modelo resuelve una tarea muy acotada: coger objetos de color (rojo, azul o verde) y depositarlos en una bandeja. Se ha entrenado sobre el dataset `haydendoo/so101_combined_medium_new_v1`, con 151 episodios, 46.438 fotogramas a 30 FPS y 100.000 pasos de entrenamiento con batch 32 y optimizador AdamW. El checkpoint ocupa 8,9 GB y declara 4.028.019.472 parámetros en safetensors, lo que lo sitúa en la gama de modelos que requieren GPU dedicada incluso para inferencia.

Su relevancia es práctica para quien trabaja en imitación robótica de bajo coste: demuestra el flujo completo de LeRobot (grabación de datos, ajuste fino desde `lerobot/pi0_base` y despliegue en robot real) sobre un brazo SO-101 asequible, con licencia Apache 2.0. Ahora bien, el autor no ha publicado resultados de evaluación, benchmarks ni métricas de éxito, y el conjunto de datos es pequeño y monoespecífico, por lo que debe tratarse como un prototipo reproducible más que como una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) tipo transformer, implementación LeRobot de π₀ derivada de OpenPI; entrada multimodal imagen + estado + texto, salida de acciones |
| Parametros totales | 4.028.019.472 (según safetensors del repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta ventana de contexto; la memoria efectiva la marca la observación por fotograma, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible; el repo solo publica pesos en safetensors (8,9 GB), sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; las instrucciones del dataset están en inglés ("Take the red objects and place in the tray", etc.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Frecuencia de entrenamiento | 30 FPS |
| Modelo base | lerobot/pi0_base |
| Dataset de ajuste | haydendoo/so101_combined_medium_new_v1 |

## Arquitectura y entrenamiento

La política sigue la arquitectura π₀ difundida por Physical Intelligence: un modelo VLA que combina un codificador visual, un backbone de lenguaje y un módulo generador de acciones, y que produce las acciones de control directamente a partir de la observación visual y la instrucción textual, sin un pipeline separado de percepción y planificación. La model card de este repositorio concreta únicamente que la implementación procede del repositorio OpenPI de Physical Intelligence y que ha sido adaptada a LeRobot; los detalles internos de capas, dimensión oculta o número de parámetros del experto de acciones no se detallan en la información disponible.

El ajuste fino se hizo desde `lerobot/pi0_base` con 100.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. El dataset contiene 151 episodios y 46.438 fotogramas a 30 FPS con tres instrucciones de tipo pick-and-place por color. No se especifica en la información proporcionada si hubo etapas de RLHF, DPO u otro refinamiento posterior, ni la composición completa del corpus de preentrenamiento del modelo base.

## Capacidades

- Control robótico directo (end-to-end) de un brazo SO-101 en tareas de recogida y depósito, con salida de acciones de 6 dimensiones por paso.
- Fusión de dos vistas de cámara (cenital y de muñeca) a resolución 480x640, lo que permite localizar objetos y corregir la aproximación con la pinza.
- Condicionamiento por instrucción en lenguaje natural: distingue entre objetos rojos, azules y verdes mediante texto.
- Ejecución autónoma de episodios de hasta 60 segundos mediante `lerobot-rollout` con `--strategy.type=base`.
- Base reutilizable para nuevos ajustes finos con el CLI `lerobot-train` sobre el mismo tipo de robot.
- No soporta tool calling, function calling, razonamiento multi-paso en texto, generación de código ni matemáticas: su salida es un vector de acción, no texto.
- No se documentan capacidades de audio, modo "thinking" ni procesamiento de lenguaje más allá de la instrucción de tarea.

## Casos de uso

- Clasificación de piezas por color en una célula de montaje: el modelo coge objetos rojos, azules o verdes y los deposita en una bandeja, una operación repetitiva que se puede ejecutar en bucle con `lerobot-rollout` sobre un SO-101.
- Prototipado rápido de pick-and-place en laboratorio: con 151 episodios y 100.000 pasos como referencia, sirve para estimar cuántos datos y cuánto tiempo de GPU necesita una tarea nueva antes de escalar.
- Base de partida para ajustes finos propios: al derivar de `lerobot/pi0_base` y usar formato LeRobot, se puede reentrenar con un dataset propio cambiando `--dataset.repo_id` y `--policy.path`.
- Docencia y formación en imitación robótica: el repositorio incluye comandos completos de rollout y entrenamiento, lo que facilita reproducir el flujo en cursos con hardware de bajo coste.
- Validación de pipelines de datos de robot: el dataset asociado (151 episodios, 46.438 fotogramas, 30 FPS) permite probar herramientas de visualización, curado y aumento de datos antes de invertir en grabaciones mayores.
- Alimentación de piezas en líneas de kitting: como política de manipulación de objetos pequeños y bien delimitados por color, es un candidato para alimentar contenedores o bandejas en puestos semiautomáticos.
- Referencia comparativa en experimentos de investigación: sirve como línea base VLA de ~4.000 millones de parámetros frente a políticas de imitación más ligeras en estudios de coste/rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la línea «_No evaluation results have been provided for this policy yet_», y la sección de evaluación está sin rellenar (sin número de ensayos, éxitos ni tasas de acierto por tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: los safetensors suman 8,9 GB, lo que corresponde a pesos en precisión de 16 bits ( aproximadamente 8,1 GB de parámetros puros más ficheros auxiliares). Con activaciones para dos imágenes de 480x640 y estado, una estimación prudente es de 10-14 GB en fp16/bf16 y de 18-22 GB en fp32. Es una estimación propia, no un dato publicado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para entrenamiento; para inferencia basta una GPU con 16 GB o más.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 4080 (16 GB) con holgura; en tarjetas de 8-12 GB requeriría cuantización, que no está publicada en el repo. El entrenamiento con batch 32 a 100.000 pasos es viable pero lento en una sola GPU de consumo.
- Opciones de despliegue: el soportado oficialmente es LeRobot (`lerobot-rollout` para ejecutar, `lerobot-train` para reentrenar) sobre PyTorch con `--policy.device=cuda`; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (no son aplicables a una política de acciones).
- Latencia y throughput: no disponibles. Como referencia de diseño, el dataset se grabó a 30 FPS, por lo que el bucle de control debe sostener ese régimen o interpolar acciones; el autor no publica latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101_pickup_pi0_medium_new_v1 | 4.028.019.472 | 2 imagenes 480x640 + estado (6,) + texto; salida (6,) | No disponible (sin evaluacion) | apache-2.0 | Hugging Face, via LeRobot |
| lerobot/pi0_base | no disponible en la informacion | no disponible | no disponible | no verificada en la informacion | Hugging Face, via LeRobot |
| Implementaciones VLA del ecosistema OpenPI (Physical Intelligence) | no disponible | no disponible | no disponible | no verificada en la informacion | Repositorio openpi en GitHub |
| Politicas de imitacion ligeras de LeRobot (ACT, Diffusion Policy) | no disponible | entradas visuales y de estado configurables | no disponible | no verificada en la informacion | Hugging Face, via LeRobot |

No se dispone de cifras de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que se desconoce la fiabilidad real de la política.
- Dataset muy pequeño y monoespecífico: 151 episodios y 46.438 fotogramas para tres instrucciones de color sobre un único tipo de robot; es probable un sobreajuste a posiciones, iluminación y objetos concretos del entorno de grabación.
- Generalización lingüística nula más allá del vocabulario entrenado: instrucciones distintas de las tres documentadas no tienen garantía de funcionar, y el modelo no "razona" sobre el lenguaje.
- Dependencia estricta de la configuración de hardware: los nombres de cámara (`top`, `wrist`), sus resoluciones (480x640), la frecuencia (30 FPS) y el orden de las 6 articulaciones deben coincidir con los del entrenamiento.
- Sin variantes cuantizadas publicadas, lo que limita el despliegue en hardware embebido o GPUs de gama baja.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: una política VLA puede generar trayectorias inválidas o colisiones sin aviso; es obligatorio usar parada de emergencia, límites de par y supervisión humana en el robot real.
- Sesgos potenciales heredados del modelo base y del dataset: el sesgo hacia colores concretos y hacia una disposición de objetos concreta puede producir falsos positivos con objetos de tonos similares.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero conviene revisar las condiciones del modelo base `lerobot/pi0_base` y de los pesos originales de Physical Intelligence antes de explotarlo en producto.
- Repositorio sin descargas ni likes en el momento de la consulta, sin demo en vídeo y con la sección de evaluación vacía: madurez propia de un experimento personal, no de un artefacto mantenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haydendoo/so101_pickup_pi0_medium_new_v1
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Dataset de entrenamiento: https://huggingface.co/datasets/haydendoo/so101_combined_medium_new_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=haydendoo/so101_combined_medium_new_v1
- Blog de π₀ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de π₀ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados correspondían a documentación del consorcio 3GPP), por lo que los enlaces anteriores proceden de la información del repositorio de Hugging Face.
