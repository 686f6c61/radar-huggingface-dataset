# sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__wrist_cameras__live__pi05__seed_0

## Resumen

Este modelo es un fine-tuning de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, adaptado e implementado en la librería LeRobot de Hugging Face. Pi05 evoluciona el modelo π₀ original para lograr generalización a entornos y situaciones no vistas durante el entrenamiento, y esta versión concreta ha sido ajustada sobre el modelo base `lerobot/pi05_base` para controlar un robot manipulador Panda en tareas de apilado y manipulación de objetos cotidianos.

El modelo recibe como entrada el estado del robot (vector de 9 dimensiones) y tres imágenes RGB de 224×224 píxeles procedentes de cámaras fijas y de muñeca, y produce como salida un vector de acción de 7 dimensiones (posición y orientación del efector final). Con aproximadamente 4.140 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con las cuantizaciones adecuadas, aunque no se han publicado requisitos oficiales de hardware. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para investigación y aplicaciones industriales de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Pi0.5 (π₀.₅) de Physical Intelligence, implementada en LeRobot |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi05 es un modelo VLA que combina un codificador visual, un modelo de lenguaje y una cabeza de acción. La implementación en LeRobot se adapta del repositorio OpenPI de Physical Intelligence. Este fine-tuning parte del modelo base `lerobot/pi05_base` y se entrena sobre un dataset propio de 200 episodios (69.392 frames a 20 FPS) que incluye tareas como "basket", "boxed food", "cake", "can", "hamburger", "lemon", "orange", "spice", "squash", "spray", "soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", "pear", "potato", "sweet potato" y "scone". El entrenamiento se realizó con 45.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-05 y semilla 0, usando LeRobot versión 0.6.0. No se especifican detalles adicionales sobre la arquitectura interna (número de capas, tipo de atención, etc.) en la información disponible.

## Capacidades

- Generación de acciones de control robótico: produce un vector de acción de 7 dimensiones (posición y orientación del efector final) a partir de observaciones multimodales.
- Procesamiento de visión: integra tres cámaras simultáneas (una fija y dos de muñeca) con imágenes de 224×224 píxeles.
- Fusión de estado y visión: combina el estado del robot (9 dimensiones) con las imágenes para decidir la siguiente acción.
- Especialización en tareas de manipulación: entrenado para apilar, recoger y colocar objetos cotidianos (alimentos, envases, utensilios).
- Generalización a entornos nuevos: al ser un fine-tuning de Pi05, hereda la capacidad de generalizar a situaciones no vistas durante el entrenamiento, aunque limitada al dominio de manipulación.
- No incluye capacidades de lenguaje natural, tool calling, agentes ni razonamiento simbólico; es exclusivamente un modelo de política robótica.

## Casos de uso

- Automatización de tareas de picking y placing en almacenes: el modelo puede controlar un robot Panda para recoger objetos de una cinta y colocarlos en contenedores, gracias a su entrenamiento en tareas de apilado y manipulación de objetos variados.
- Manipulación de alimentos en entornos de cocina robotizada: tareas como "cake", "hamburger" o "lemon" sugieren aplicaciones en preparación de comidas, donde el robot debe agarrar y mover ingredientes con precisión.
- Investigación en aprendizaje por imitación: al estar implementado en LeRobot, sirve como punto de partida para experimentos de fine-tuning con nuevos datasets o para comparar estrategias de entrenamiento.
- Desarrollo de sistemas de control para robots colaborativos: el modelo puede integrarse en líneas de producción donde se requiera adaptación a objetos no rígidos o posiciones variables.
- Benchmarking de modelos VLA: su tamaño moderado (4,14B) y licencia permisiva lo hacen adecuado para comparar rendimiento con otros VLA en tareas de manipulación real.
- Prototipado rápido en robótica educativa: con un robot Panda y las cámaras adecuadas, se puede desplegar el modelo en pocos minutos usando los comandos de LeRobot, ideal para demostraciones y cursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo.
- Con 4,14 mil millones de parámetros, una estimación razonable para inferencia en FP16 sería de aproximadamente 8-10 GB de VRAM, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o A5000.
- Para entrenamiento o fine-tuning, se recomendaría al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090 o A100) dado el tamaño del modelo y el batch size usado.
- El despliegue se realiza típicamente con LeRobot, que soporta inferencia en GPU mediante PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen fuertemente de la GPU y del número de cámaras; no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (otros VLA como OpenVLA, RT-2 o π₀ original) en términos de rendimiento, ya que no hay benchmarks publicados. Se puede indicar que comparte la arquitectura base de Pi05, pero no hay datos cuantitativos para una comparación rigurosa.

## Limitaciones y advertencias

- Es un modelo especializado para el robot Panda y las cámaras específicas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`); no funcionará directamente con otros robots o configuraciones de cámaras sin reentrenamiento.
- El dataset de entrenamiento es limitado (200 episodios) y cubre un conjunto concreto de tareas; la generalización a objetos o escenarios muy diferentes no está garantizada.
- No se han realizado evaluaciones formales de sesgos o alucinaciones, aunque al ser un modelo de acción, el riesgo de alucinación se manifiesta como acciones erróneas o inestables.
- No se proporcionan métricas de éxito en tareas reales, por lo que el rendimiento esperado en producción es incierto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base `lerobot/pi05_base` y del dataset asociado.
- El modelo no tiene capacidades de lenguaje natural; no puede interpretar instrucciones verbales ni mantener conversaciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__wrist_cameras__live__pi05__seed_0)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__point__overlay_a75__sim__wrist_cameras__live)
- [Blog de Physical Intelligence sobre Pi05](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
