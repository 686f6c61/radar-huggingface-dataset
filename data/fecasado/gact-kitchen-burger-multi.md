# fecasado/gact-kitchen-burger-multi

## Resumen

`gact-kitchen-burger-multi` es una política de control robótico (no un modelo de lenguaje) publicada por el usuario `fecasado` en Hugging Face bajo el paraguas de LeRobot, la librería de aprendizaje por imitación de Hugging Face. Implementa la arquitectura `gaze_act`, una variante de ACT (Action Chunking with Transformers) que incorpora información de mirada (gaze) para tareas de manipulación. El modelo está entrenado específicamente para la tarea de transferir una hamburguesa a un plato en un entorno de cocina, usando el dataset `fecasado/burger-to-plate-v2-320x240` con observaciones visuales de 320x240 píxeles.

Con 51.670.922 parámetros y un tamaño de repositorio de 0,2 GB, se trata de un modelo compacto orientado a inferencia en tiempo real sobre un robot tipo SO-100 (brazo seguidor de bajo coste) o plataformas similares. Su relevancia es acotada: es un artefacto de investigación reproducible más que un modelo de propósito general, útil para quienes trabajan en políticas visuomotoras con LeRobot y quieren replicar o extender un pipeline de ACT con señal de gaze.

La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo solo es funcional dentro de la distribución de entrenamiento (cocina simulada o real con cámara cenital y robot SO-100); no generaliza a otras tareas ni entornos sin reentrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gaze_act (variante de ACT, Action Chunking with Transformers) con señal de gaze |
| Parámetros totales | 51.670.922 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política visuomotora; ventana de observación definida por el dataset, imágenes 320x240) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo LeRobot, 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura `gaze_act` parte de ACT, un transformer encoder-decoder que predice secuencias de acciones (action chunks) a partir de observaciones visuales y propioceptivas, con un cuello de botella latente estilo CVAE para capturar la variabilidad de las demostraciones humanas. La variante `gaze_act` añade una señal de mirada como entrada adicional, presumiblemente extraída de un eye-tracker o de un módulo de estimación de gaze, lo que permite al modelo condicionar la predicción de acciones sobre la región de la escena que el operador humano estaba atendiendo durante la demostración.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/burger-to-plate-v2-320x240`, que contiene episodios de teleoperación de la tarea "hamburguesa al plato" con imágenes de 320x240. No se dispone de información sobre el número de episodios, el número de tokens o pasos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización específicas. La model card generada automáticamente por LeRobot no incluye detalles de hiperparámetros ni curvas de entrenamiento.

## Capacidades

- Control visuomotor de un brazo robótico para la tarea de recoger una hamburguesa y depositarla en un plato.
- Predicción de secuencias de acciones (action chunking) a partir de imágenes RGB de 320x240 y estado propioceptivo del robot.
- Condicionamiento por señal de mirada (gaze) para guiar la atención del modelo hacia regiones relevantes de la escena.
- Inferencia en tiempo real sobre hardware de bajo coste (SO-100 follower) mediante `lerobot-record`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni generación de texto.
- No tiene capacidades multilingües ni de visión general: el módulo visual está entrenado exclusivamente para la distribución de imágenes del dataset.

## Casos de uso

- Replicación de experimentos de ACT con gaze: investigadores que quieran reproducir el pipeline de entrenamiento e inferencia de `gaze_act` sobre el dataset `burger-to-plate-v2-320x240` y comparar con ACT estándar.
- Base para fine-tuning en tareas de cocina: el checkpoint puede servir como inicialización para tareas similares (servir alimentos, apilar objetos) con un dataset propio de teleoperación.
- Evaluación de hardware SO-100: el modelo permite validar la cadena completa de LeRobot (teleoperación, grabación, entrenamiento, despliegue) en un brazo de bajo coste.
- Docencia en robótica de imitación: ejemplo compacto (51,7 M de parámetros, 0,2 GB) para ilustrar el flujo completo de una política visuomotora en un curso o taller.
- Estudio de la contribución de la señal de gaze: comparar el rendimiento de `gaze_act` frente a ACT sin gaze en la misma tarea para aislar el efecto de la modalidad adicional.
- Prototipado de pipelines de evaluación: usar `lerobot-record` con `--policy.path` para medir tasas de éxito en 10 episodios y establecer una línea base antes de introducir mejoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el preprocesado de imágenes 320x240 y el bucle de control, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo no aprovecha su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso es viable en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), exportación a safetensors y carga directa con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas robóticas).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del robot, la cámara y la frecuencia de control configurada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gact-kitchen-burger-multi | 51,7 M | Imágenes 320x240 + estado + gaze | Burger to plate (SO-100) | Apache 2.0 | Hugging Face (LeRobot) |
| ACT (original, LeRobot) | ~50 M (configuración típica) | Imágenes + estado | Manipulación genérica | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | Imágenes + estado | Manipulación genérica | MIT (implementación original) | Repos públicos |
| SmolVLA | ~450 M | Imágenes + lenguaje | Manipulación guiada por lenguaje | Apache 2.0 | Hugging Face (LeRobot) |

La comparación es orientativa: ACT y Diffusion Policy son familias de políticas, no checkpoints concretos, y SmolVLA es un modelo visuolingüístico de mayor tamaño. No se dispone de métricas de éxito comparables entre estos modelos en la tarea `burger-to-plate`.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea y distribución visual; no generaliza a otras tareas, objetos, iluminaciones o cámaras sin reentrenamiento.
- La señal de gaze requiere un mecanismo de captura compatible con el usado en el dataset; sin esa entrada, el modelo no puede operar como se entrenó.
- Riesgo de sobreajuste al dataset de demostraciones: la variabilidad de las trayectorias generadas está limitada por el cuello de botella CVAE y el número de episodios, que no se documenta.
- No hay información publicada sobre tasas de éxito, número de episodios de evaluación ni condiciones de recogida de datos, lo que impide evaluar su robustez.
- La model card es una plantilla autogenerada por LeRobot con el aviso "Model type not recognized"; no incluye detalles de entrenamiento, hiperparámetros ni limitaciones declaradas por el autor.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de evaluación formal desaconseja su despliegue en producción sin una validación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha pasado por revisión de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-kitchen-burger-multi
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/burger-to-plate-v2-320x240
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
