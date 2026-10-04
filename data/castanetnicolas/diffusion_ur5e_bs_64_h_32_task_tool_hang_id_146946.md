# castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_146946

## Resumen

Diffusion Policy es una política visuomotora que formula el control de un robot como un proceso generativo de difusión: en lugar de predecir una única acción, el modelo denoisa una secuencia completa de acciones futuras, lo que produce trayectorias suaves y multimodales. Este repositorio concreto, publicado por el usuario castanetnicolas, es un checkpoint entrenado con LeRobot para la tarea robomimic "tool hang", en la que un brazo debe insertar un gancho en una base y colgar una llave sobre él.

El modelo tiene 278.014.919 parámetros (unos 278 millones) y un repositorio de 1,1 GB en formato safetensors, lo que corresponde aproximadamente a pesos en precisión completa de 32 bits. Consume como entrada el estado del robot (vector de 9 dimensiones) y dos cámaras RGB de 256x256 (vista lateral y cámara en la muñeca), y produce un vector de acción de 7 dimensiones, típico de un manipulador de 6 grados de libertad más pinza.

Es relevante ahora porque forma parte del ecosistema LeRobot de Hugging Face, que estandariza el entrenamiento, la publicación y el despliegue de políticas de imitación en robots reales. Frente a modelos de lenguaje, aquí no hay ventana de contexto textual ni cuantizaciones publicadas: el interés está en la reproducibilidad del pipeline de aprendizaje por imitación y en la calidad de las trayectorias generadas en tareas de contacto rico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión condicionado sobre secuencias de acción); backbone concreto no disponible |
| Parametros totales | 278.014.919 (unos 278 M) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; horizonte de predicción de acciones H = 32 según el identificador del repositorio |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors) |
| Idiomas soportados | no aplica: no procesa lenguaje natural; la tarea se especifica mediante una cadena de texto fija |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Entradas | observation.state (9,), observation.images.sideview (3, 256, 256), observation.images.robot0_eye_in_hand (3, 256, 256) |
| Salidas | action (7,) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La política sigue el método Diffusion Policy descrito en el artículo arXiv:2303.04137. El control visuomotor se trata como un proceso de difusión: el modelo aprende a invertir un proceso de ruido gaussiano para generar secuencias de acciones condicionadas por las observaciones (estado propioceptivo e imágenes). Este enfoque captura distribuciones multimodales de acciones, algo crítico en manipulación con contacto, y evita el suavizado excesivo que producen las políticas de regresión unimodal. La model card no especifica el detalle del backbone (por ejemplo, el tipo de red temporal o el codificador visual empleado), por lo que ese punto queda como no disponible.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset castanetnicolas/robomimic_tool_hang_ph_image256: 200 episodios, 95.962 fotogramas a 20 FPS. La tarea es "Insert the hook into the base to build a frame, then hang the wrench on the hook". La configuración fue de 140.000 pasos de entrenamiento, batch size 64, optimizador Adam, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta en la información disponible ningún uso de RLHF, DPO ni técnicas de ajuste por preferencias, algo esperable en aprendizaje por imitación.

## Capacidades

- Generación de trayectorias de acción continuas de 7 dimensiones (6 grados de libertad más pinza) a partir de observaciones multimodales.
- Control visuomotor con dos cámaras: una vista lateral externa y una cámara en la muñeca (eye-in-hand), ambas a 256x256 y 3 canales.
- Ejecución de una tarea de manipulación con contacto rico: insertar un gancho en una base y colgar una llave.
- Generación de trayectorias multimodales y suaves gracias al muestreo por difusión, útil cuando existen varias formas válidas de completar la tarea.
- Compatibilidad con el pipeline de LeRobot para despliegue en robot real mediante `lerobot-rollout` y para reentrenamiento mediante `lerobot-train`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: es una política de control, no un modelo de propósito general.
- No se documentan capacidades de visión más allá del uso de las imágenes como condicionamiento (sin descripción de imágenes, VQA ni OCR).
- No se documenta ningún modo de "pensamiento" ni cadena de razonamiento.

## Casos de uso

- Automatización de una tarea de ensamblaje con gancho y llave: el modelo reproduce la secuencia insertar gancho y colgar la llave, una tarea de contacto rico donde las políticas de regresión simples suelen fallar por la precisión requerida.
- Banco de pruebas para investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar Diffusion Policy contra otras políticas de LeRobot bajo el mismo dataset de 200 episodios y 95.962 fotogramas.
- Ajuste fino con datos propios: partiendo de este checkpoint, un laboratorio puede reentrenar con `lerobot-train` sobre demostraciones grabadas en su propio robot y tarea, reduciendo el número de pasos necesarios frente al entrenamiento desde cero.
- Evaluación de robustez ante cambios de iluminación, posición de objetos o presencia de distractores: al depender de dos vistas RGB, el modelo permite medir la sensibilidad de una política de difusión a variaciones visuales en el entorno.
- Prototipado de estaciones de trabajo robóticas en laboratorio: el checkpoint puede desplegarse durante sesiones de 60 segundos con `lerobot-rollout --strategy.type=base` para validar la configuración de cámaras, el puerto del robot y la calibración antes de invertir en entrenamientos largos.
- Docencia y formación en robótica: el flujo completo (instalación de LeRobot, grabación de datos, entrenamiento y despliegue) puede reproducirse con hardware de gama media, ya que el modelo ocupa alrededor de 1,1 GB de pesos.
- Generación de datos de referencia para comparar políticas: las trayectorias producidas pueden registrarse y analizarse frente a las demostraciones humanas del dataset para estudiar la fidelidad del comportamiento aprendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no existe tasa de éxito medida en robot real para esta política. No se dispone tampoco de comparaciones numéricas frente a otras políticas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con pesos en fp32 (278 M de parámetros), unos 0,6 GB en fp16 y unos 0,3 GB en int8. Estimación aritmética a partir del recuento de parámetros; no publicada por el autor.
- VRAM estimada para entrenamiento: no disponible en la documentación. Con batch size 64 e imágenes de 256x256 procedentes de dos cámaras, se recomienda una GPU con al menos 16-24 GB para reproducir la configuración original.
- GPU recomendadas: para inferencia basta una GPU consumer con 8 GB o más (RTX 3060, RTX 4070, RTX 4090). Para entrenamiento son preferibles RTX 4090, A100 o H100 por memoria y ancho de banda.
- Cabe en GPU consumer: sí, tanto para inferencia como, con margen, para reentrenamiento a menor batch size.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento), con pesos en safetensors y ejecución en PyTorch sobre CUDA. No se documentan exportaciones a GGUF, ONNX ni TensorRT.
- Latencia y throughput: no disponibles. El bucle de control del dataset está muestreado a 20 FPS, lo que marca la frecuencia de referencia de la tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_146946 (este) | 278 M | H = 32 (según identificador) | sin resultados publicados | apache-2.0 | Hugging Face, librería lerobot |
| Diffusion Policy original (Chi et al., 2023) | no disponible | no disponible | resultados publicados en el paper sobre tareas robomimic | no disponible en la información proporcionada | paper y código de referencia |
| ACT (Action Chunking Transformer) | no disponible | no disponible | no disponible | no disponible | integrado en LeRobot |
| Otras políticas de LeRobot entrenadas con robomimic | no disponible | no disponible | no disponible | variable según repositorio | Hugging Face Hub |

Los datos de parámetros, contexto y rendimiento de las alternativas no están disponibles en la información proporcionada, por lo que la comparación se limita a la categoría de uso (políticas de imitación para manipulación robótica).

## Limitaciones y advertencias

- No hay ninguna evaluación publicada: se desconoce la tasa de éxito real de la política en robot físico, en el simulador y bajo variaciones del entorno.
- Incoherencia entre el identificador del repositorio (que menciona UR5e) y la model card (que declara `Robot type: panda`). Es necesario verificar la plataforma real antes de desplegar, ya que las dimensiones de estado y acción dependen del robot.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta: no hay validación por parte de la comunidad ni reportes independientes de funcionamiento.
- El modelo está especializado en una única tarea ("tool hang") y no generaliza a otras tareas sin reentrenamiento o ajuste fino.
- Sensibilidad esperable a cambios en la configuración de cámaras: los nombres y el posicionamiento de las cámaras deben coincidir con las claves de observación del entrenamiento (`sideview` y `robot0_eye_in_hand`); alteraciones de encuadre o iluminación pueden degradar el comportamiento.
- Riesgo de sobreajuste al entorno de demostración: con 200 episodios y una sola tarea, la política puede fallar ante posiciones iniciales, objetos o condiciones de iluminación no vistas durante el entrenamiento.
- No se documentan sesgos en el sentido de sesgos sociales o lingüísticos, ya que el modelo no procesa lenguaje ni datos personales; el sesgo relevante es el de las demostraciones humanas registradas en el dataset.
- No hay cuantizaciones publicadas ni exportaciones a formatos de inferencia optimizada (GGUF, ONNX, TensorRT), lo que limita el despliegue fuera del ecosistema PyTorch/LeRobot.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero conviene revisar las condiciones del dataset de robomimic subyacente, que puede tener su propia licencia y restricciones.
- Riesgo de alucinación: no aplica en el sentido textual; el riesgo equivalente es la generación de trayectorias plausibles pero físicamente inviables o inseguras, por lo que se recomienda ejecutar con límites de fuerza y paradas de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_64_H_32_TASK_tool_hang_ID_146946
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_tool_hang_ph_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_tool_hang_ph_image256
- Artículo de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de Hugging Face.
