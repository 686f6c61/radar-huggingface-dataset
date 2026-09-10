# kimrau/act_Lekiwi_lekiwi_test_re

# Ficha del modelo: kimrau/act_Lekiwi_lekiwi_test_re

## Resumen

El modelo `kimrau/act_Lekiwi_lekiwi_test_re` es una política de control robótico basada en el método ACT (Action Chunking with Transformers), desarrollada por el usuario `kimrau` mediante la librería LeRobot. Está entrenado para la tarea concreta de coger un cubo y colocarlo dentro de una caja, utilizando un robot de tipo `lekiwi_client` con dos cámaras RGB (frontal y muñeca). A partir del estado del robot (9 dimensiones) y de las dos imágenes (480x640), el modelo genera un trozo de acciones de 9 dimensiones.

Se trata de un modelo de aprendizaje por imitación: no es un modelo de lenguaje ni un sistema generalista, sino un policy de bajo nivel entrenado con 35 episodios teleoperados. Con 51,67 millones de parámetros y un peso total de 0,2 GB, es un modelo compacto que cabe en GPUs de consumo. Es relevante dentro del ecosistema LeRobot porque demuestra el flujo completo de entrenamiento y despliegue de políticas ACT para manipuladores reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) con CVAE |
| Parametros totales | 51.674.761 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; solo safetensors) |
| Idiomas soportados | No aplica (modelo de control robótico) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PyTorch / LeRobot) |
| Librería | LeRobot 0.6.0 |
| Pipeline | Robotics |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del paper «Action Chunking with Transformers» (ACT), que combina un Conditional Variational Autoencoder (CVAE) con transformadores. El encoder procesa las observaciones visuales y de estado para muestrear una variable latente, mientras que el decoder transforma esa latente junto con el estado en una secuencia de acciones (un chunk). Esta predicción por lotes de acciones, en lugar de hacerlo paso a paso, reduce el error acumulado típico de las políticas autorregresivas en control continuo.

El entrenamiento se realizó sobre el dataset `kimrau/lekiwi_test_re`, compuesto por 35 episodios y 10.794 fotogramas a 30 FPS. La configuración de entrenamiento indicada en la model card es la siguiente: 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se aplicó RLHF ni DPO: es un aprendizaje por imitación puro a partir de demostraciones teleoperadas. El modelo fue empujado al Hub con LeRobot 0.6.0.

## Capacidades

- Genera chunks de acciones de 9 dimensiones a partir de observaciones de estado (9 dimensiones) y dos imágenes RGB de 480x640 (cámara frontal y cámara de muñeca).
- Está entrenado para una tarea específica de pick-and-place: coger un cubo y colocarlo en una caja.
- Es un policy de control de bajo nivel apto para ejecutarse en tiempo real sobre el robot `lekiwi_client`.
- No soporta function calling, tool calling ni interacción por texto.
- No dispone de capacidades de razonamiento simbólico ni de modo thinking.
- No es multimodal en el sentido de modelos de visión-lenguaje: solo consume imágenes para generar acciones, sin producir descripciones ni lenguaje.

## Casos de uso

- Automatización de pick-and-place en líneas de ensamblaje: el modelo puede usarse para recoger objetos conocidos y colocarlos en una posición fija, reduciendo la intervención humana en tareas repetitivas.
- Robótica de laboratorio: en entornos de investigación, puede manipular muestras o herramientas siguiendo la tarea concreta para la que fue entrenado.
- Plataformas educativas de robótica: al estar integrado en LeRobot, sirve como ejemplo de referencia para estudiar métodos de imitación learning en un robot de bajo coste como `lekiwi`.
- Reentrenamiento para nuevas tareas: usando el pipeline de LeRobot, el modelo base puede servir como punto de partida para transferir aprendizaje a otras tareas de manipulación con datasets adicionales.
- Teleoperación semiautónoma: el policy puede completar la trayectoria una vez que un operador inicia el gesto, siempre que la tarea y el robot coincidan con el entrenamiento.
- Benchmarking de políticas de control: en el ámbito académico, este checkpoint puede compararse con otras políticas de imitación (por ejemplo, Diffusion Policy o VQ-BeT) sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB. Los pesos en FP32 suponen aproximadamente 207 MB, y el coste adicional de activaciones e imágenes está dentro de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; por ejemplo, RTX 2060, RTX 3060 o superiores. Para entrenamiento se recomienda una GPU con 8 GB o más.
- Sí cabe en GPUs de consumo. También puede ejecutarse en CPU, aunque la frecuencia de inferencia será menor y puede no alcanzar los 30 FPS del dataset.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch directo o con la infraestructura de inferencia propia de LeRobot. No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible. No se han publicado mediciones; por tamaño, se espera que una GPU moderada lo procese en tiempo real, pero no hay confirmación.

## Comparativa con modelos similares

| Modelo / Método | Parametros | Contexto | Rendimiento (benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7M | No aplica | No publicado | Apache-2.0 | HuggingFace / LeRobot |
| Diffusion Policy (LeRobot) | No disponible | No aplica | No publicado | MIT | LeRobot |
| VQ-BeT (LeRobot) | No disponible | No aplica | No publicado | MIT | LeRobot |

La comparación es cualitativa: no existen benchmarks publicados en condiciones equivalentes. Los tres métodos pertenecen al ecosistema LeRobot y son políticas de imitación para control robótico, pero el tamaño exacto y el rendimiento de las alternativas no está disponible.

## Limitaciones y advertencias

- El modelo solo está entrenado para una tarea concreta (coger un cubo y colocarlo en una caja) y con datos de un único robot y configuración de cámaras. No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- La robustez ante cambios de iluminación, posiciones de objetos o distracciones no está validada; el dataset es pequeño (35 episodios) y no se han publicado resultados de evaluación.
- Riesgo de ejecutar acciones incorrectas en estados no vistos: el modelo puede predecir trayectorias erróneas, lo que equivale a una forma de «alucinación» aplicada al control físico.
- No procesa lenguaje ni texto, y su «contexto» se limita a las imágenes y al estado actual del robot.
- No se han proporcionado métricas de éxito en la model card, por lo que no debe desplegarse en sistemas críticos sin una validación previa y mecanismos de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero no incluye garantías de seguridad ni adecuación para un propósito particular.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kimrau/act_Lekiwi_lekiwi_test_re
- Dataset de entrenamiento: https://huggingface.co/datasets/kimrau/lekiwi_test_re
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kimrau/lekiwi_test_re
