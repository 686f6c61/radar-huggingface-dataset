# KyraLeeChunWei/Paracetamol_e100_40K_ACT_aug

## Resumen

Paracetamol_e100_40K_ACT_aug es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face mediante el framework LeRobot. La desarrolla el usuario KyraLeeChunWei y está orientada a control robótico de manipulación, concretamente a la tarea de manipular un objeto denominado "Paracetamol" a partir de un dataset de demostraciones teleoperadas propio. No es un modelo de lenguaje: es un controlador visuomotor que recibe observaciones (imágenes de cámara y estado de las articulaciones) y emite secuencias de acciones para un brazo robótico.

El modelo tiene 51.678.855 parámetros y un tamaño de repositorio de 0,2 GB, en formato safetensors y con licencia Apache 2.0. Su relevancia es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, útil como referencia para reproducir el pipeline de entrenamiento de ACT en LeRobot y como ejemplo de política entrenada sobre un dataset específico de una tarea concreta.

Al estar basado en ACT, emplea un transformer encoder-decoder con un cuello de botella de variación latente (CVAE) que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza la ejecución en tareas de manipulación fina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE y predicción de chunks de acción |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT usa una ventana fija de observaciones y un horizonte de chunk configurable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visuomotor, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | KyraLeeChunWei/Paracetamol_e100 |
| Tarea | Manipulación robótica (objeto "Paracetamol") |
| Fecha de creacion | 2026-11-03 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un encoder de observaciones (típicamente un backbone visual tipo ResNet más un encoder de estado de las articulaciones) con un transformer encoder-decoder que predice un chunk de *k* acciones futuras de forma conjunta. Un componente CVAE con variable latente modela la variabilidad de las demostraciones humanas, y en inferencia se fija la latente a la media para obtener políticas deterministas y estables. El modelo se entrena con *behavior cloning* sobre episodios teleoperados, sin refuerzo ni RLHF.

Los detalles concretos de entrenamiento no están publicados en la información disponible: el nombre del checkpoint ("e100_40K_ACT_aug") sugiere 100 épocas, 40 000 pasos o frames y algún tipo de aumento de datos (*augmentation*), pero no se especifica el número exacto de episodios, la composición del dataset, la resolución de las cámaras, el número de articulaciones ni el horizonte de chunk. Tampoco se documenta si hubo aumento de datos con transformaciones de imagen, ruido en el estado o variaciones de iluminación.

## Capacidades

- Control visuomotor de un brazo robótico a partir de observaciones de cámara y estado de las articulaciones.
- Predicción de chunks de acción de varios pasos, lo que suaviza la trayectoria y reduce el error compuesto frente a políticas paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de definir una función de recompensa.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Ejecución sobre robots compatibles con LeRobot, como el SO-100 follower mencionado en la model card.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de ACT: sirve como checkpoint de referencia para comparar el pipeline de entrenamiento de LeRobot con una política ya entrenada sobre el dataset Paracetamol_e100, útil en docencia e investigación de aprendizaje por imitación.
- Manipulación de objetos pequeños en laboratorio: la política está entrenada para una tarea concreta de agarre y colocación de un objeto tipo Paracetamol, adecuada para validar montajes de brazo SO-100 en entornos controlados.
- *Fine-tuning* sobre nuevos datasets: al ser un checkpoint ACT de 51,7 M de parámetros, puede servir como inicialización para reentrenar sobre demostraciones adicionales de tareas similares con coste computacional bajo.
- Evaluación de robustez frente a aumentos de datos: el sufijo "aug" del checkpoint permite estudiar el efecto del aumento de datos en la tasa de éxito de la política comparándolo con variantes sin aumento.
- Prototipado de pipelines de evaluación con `lerobot-record`: permite medir episodios de éxito/fallo de forma automatizada sobre el robot real o en simulación compatible con LeRobot.
- Base para despliegue en robots de bajo coste: el reducido tamaño del modelo (0,2 GB, 51,7 M de parámetros) facilita la inferencia en GPUs de consumo o incluso en hardware embebido con suficiente capacidad de cómputo.
- Referencia para auditoría de licencias en robótica open source: al ser Apache 2.0, puede integrarse en proyectos comerciales sin las restricciones de licencias no comerciales habituales en otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones con otras políticas. Tampoco se documentan latencias ni throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del modelo (51,7 M de parámetros, ~0,2 GB en safetensors en fp32), la inferencia requiere muy poca memoria; una estimación conservadora sitúa el uso por debajo de 1-2 GB incluyendo buffers de imágenes y activaciones, aunque no está confirmado por el autor.
- GPU recomendadas: cualquier GPU con CUDA compatible con PyTorch; una RTX 3060 o superior es más que suficiente para inferencia. Para entrenamiento, una RTX 4090 o A100 acelera notablemente el proceso, aunque el tamaño del modelo permite entrenar en GPUs de gama media.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con al menos 4 GB de VRAM, aunque el dato exacto no está publicado.
- Opciones de despliegue: LeRobot (`lerobot-record` para evaluación e inferencia), PyTorch nativo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e100_40K_ACT_aug | 51,7 M | no disponible | Manipulación (Paracetamol) con ACT | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (paper arXiv:2304.13705) | no disponible | chunk configurable | Manipulación genérica (ALOHA) | código y pesos según repo original | Repo de investigación |
| Diffusion Policy (referencia habitual en LeRobot) | no disponible | horizonte configurable | Manipulación genérica | MIT (repo original) | Hugging Face / LeRobot |
| Otros checkpoints ACT en LeRobot Hub | variable | variable | Tareas específicas por dataset | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible porque no se publican métricas de éxito ni detalles de entrenamiento. La comparación cualitativa se limita a la familia de métodos (ACT frente a Diffusion Policy) y al ecosistema (LeRobot), sin datos numéricos que permitan establecer diferencias de rendimiento.

## Limitaciones y advertencias

- Modelo específico de una única tarea ("Paracetamol") y un único dataset; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Sin métricas publicadas de tasa de éxito, robustez o generalización: no es posible evaluar su calidad real a partir de la información disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Riesgo de sobreajuste al entorno de entrenamiento (iluminación, posición de cámaras, fondo, robot concreto); la política puede fallar ante cambios menores en el montaje.
- No dispone de capacidades lingüísticas, de razonamiento simbólico ni de tool calling; no debe presentarse como un modelo de propósito general.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento físico del robot recae en el integrador; no hay garantías de seguridad para operación en entornos reales con personas.
- No se documentan sesgos, pero al ser un modelo entrenado con demostraciones humanas, hereda los sesgos de las trayectorias teleoperadas (posiciones, velocidades y estrategias del operador).
- El nombre del checkpoint sugiere hiperparámetros (100 épocas, 40K pasos, aumento de datos) que no están confirmados en la model card; conviene verificar el dataset asociado antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyraLeeChunWei/Paracetamol_e100_40K_ACT_aug
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e100
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
