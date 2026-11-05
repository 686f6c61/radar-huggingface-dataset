# Screener2/act_AnchoredCamera_real_rebuilt_control

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en horizontes largos. Este repositorio concreto, `Screener2/act_AnchoredCamera_real_rebuilt_control`, es una política entrenada con LeRobot sobre un robot `so_follower` (SO-100/SO-101) con una única cámara cenital (`overhead`) y estado propioceptivo de 6 dimensiones.

El modelo resuelve una tarea específica de manipulación: trasladar un cilindro verde a un cubo amarillo ("Green cylinder to yellow bucket"). Se entrenó con 15 episodios de teleoperación (6.738 fotogramas a 30 FPS) durante 100.000 pasos con batch de 8 y learning rate de 1e-5. Es relevante como ejemplo reproducible de extremo a extremo del pipeline de imitación de LeRobot, no como modelo de propósito general.

Con 51,67 millones de parámetros y un peso de repositorio de 0,2 GB, es un modelo pequeño que cabe en cualquier GPU consumer. No es un modelo de lenguaje: no procesa texto libre ni tiene capacidades de razonamiento simbólico; mapea observaciones visuales y de estado a comandos de acción de 6 grados de libertad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; opera sobre observaciones por paso) |
| Tipos de cuantizacion | No disponible (pesos safetensors en fp32/fp16 según checkpoint; no se documentan variantes GGUF) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; la tarea se especifica como cadena fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras | 1 (`overhead`) |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Entrada visual | `observation.images.overhead` de forma `(3, 480, 640)` |
| Salida de acción | `action` de forma `(6,)` |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Seed | 1000 |
| Versión de LeRobot | 0.5.2 |
| Episodios de entrenamiento | 15 |
| Fotogramas de entrenamiento | 6.738 |
| Frecuencia de datos | 30 FPS |

## Arquitectura y entrenamiento

ACT es un transformer que combina un backbone visual (encoder de imágenes) con un transformer encoder-decoder que fusiona las características visuales con el estado propioceptivo del robot y genera un chunk de acciones futuras. La predicción por chunks (en lugar de paso a paso) mitiga el problema de compounding errors típico del behavioral cloning y permite ejecutar movimientos más suaves con control a 30 Hz. El modelo consume una imagen RGB de 480×640 y un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones por paso.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Screener2/AnchoredCamera_real_rebuilt_control`, compuesto por 15 episodios de teleoperación (6.738 fotogramas a 30 FPS) de una única tarea. Se usó AdamW con learning rate 1e-5, batch de 8 y 100.000 pasos. No se documenta en la model card el uso de RLHF, DPO ni aumento de datos; es aprendizaje por imitación supervisado puro. Tampoco se especifica la composición del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control robótico de manipulación para la tarea "Green cylinder to yellow bucket" sobre un robot `so_follower`.
- Predicción de chunks de acción de 6 dimensiones a partir de una imagen cenital y estado propioceptivo de 6 dimensiones.
- Ejecución autónoma de la política en bucle mediante `lerobot-rollout` con `--strategy.type=base`.
- Aprendizaje por imitación reproducible: el repositorio documenta el comando `lerobot-train` para reentrenar con otro dataset.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni otras modalidades fuera de la imagen cenital de entrada.

## Casos de uso

- Reproducción de la tarea de pick-and-place en un SO-100/SO-101: ejecutar la política con `lerobot-rollout` para trasladar el cilindro verde al cubo amarillo en un entorno controlado con cámara cenital fija.
- Baseline para comparativas de imitación: sirve como referencia de ACT entrenado con pocos datos (15 episodios) para medir la mejora de nuevas arquitecturas o de más datos en la misma tarea.
- Validación del pipeline LeRobot: comprobar la instalación, calibración de hardware y configuración de cámaras antes de entrenar políticas propias.
- Reentrenamiento con datos propios: usar el comando `lerobot-train --policy.type=act` documentado en la model card para adaptar la política a una tarea similar con un dataset propio.
- Docencia y prototipado en robótica de imitación: ejemplo mínimo de extremo a extremo (grabación, entrenamiento, despliegue) con un coste computacional bajo.
- Pruebas de robustez ante cambios de iluminación o posición de objetos: al ser una política entrenada con 15 episodios, permite estudiar la degradación de éxito fuera de la distribución de entrenamiento.
- Integración en un lazo de control cerrado a 30 FPS con un único stream de cámara, útil para validar latencias de inferencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,67 M de parámetros, más el coste del encoder visual y los buffers de imagen (3×480×640). En la práctica, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se ha entrenado con `--policy.device=cuda`, por lo que se asume una GPU NVIDIA. Una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, con margen).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; el modelo se carga desde el Hub con `--policy.path`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El control opera a 30 FPS según la frecuencia de los datos de entrenamiento, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_AnchoredCamera_real_rebuilt_control | 51,67 M | Imagen 480×640 + estado (6,) | Pick-and-place "Green cylinder to yellow bucket" | Apache 2.0 | HuggingFace Hub |
| Políticas ACT genéricas de LeRobot | Variable (típicamente decenas de M) | Imagen + estado según robot | Tareas de manipulación diversas | Apache 2.0 (LeRobot) | HuggingFace Hub / docs |
| Políticas Diffusion Policy (LeRobot) | No disponible | Imagen + estado | Manipulación por imitación | Apache 2.0 (LeRobot) | HuggingFace Hub / docs |
| Políticas VQ-BeT / SmolVLA (LeRobot) | No disponible | Imagen + estado (+ lenguaje en SmolVLA) | Manipulación por imitación | Apache 2.0 (LeRobot) | HuggingFace Hub / docs |

No se dispone de datos cuantitativos de rendimiento de estos modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, modalidad de entrada y licencia.

## Limitaciones y advertencias

- Entrenado con solo 15 episodios y una única tarea; la generalización a nuevas posiciones de objetos, iluminación o distractores es muy limitada.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Depende de una cámara cenital (`overhead`) con resolución y encuadre concretos (480×640); cambios en la cámara o su montaje invalidan la política.
- Requiere un robot `so_follower` con estado de 6 dimensiones; no es portable a otros robots sin reentrenamiento.
- Riesgo de sobreajuste a la distribución de los 15 episodios; el modelo puede fallar de forma silenciosa ante objetos fuera de posición.
- No procesa lenguaje natural: la tarea se pasa como cadena fija y no hay comprensión semántica.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- No se documentan sesgos demográficos ni sociales por tratarse de una política robótica de manipulación, pero puede heredar sesgos de los datos de teleoperación (posiciones, velocidades y estilos del operador).
- La model card no documenta cuantización ni formatos alternativos; el despliegue está atado al ecosistema LeRobot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Screener2/act_AnchoredCamera_real_rebuilt_control
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/AnchoredCamera_real_rebuilt_control
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/AnchoredCamera_real_rebuilt_control
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
