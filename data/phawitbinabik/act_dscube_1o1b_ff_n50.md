# phawitbinabik/act_DSCUBE_1O1B_FF_N50

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Este repositorio concreto, `phawitbinabik/act_DSCUBE_1O1B_FF_N50`, es un checkpoint de política entrenado con LeRobot sobre el dataset `phawitbinabik/DSCUBE_1O1B_FF_N50`, y está pensado para controlar un robot seguidor tipo SO100/SO101 mediante teleoperación previa.

El modelo resuelve el problema de la generación de trayectorias de control de baja frecuencia y alta dimensionalidad en manipulación robótica: en lugar de predecir una única acción por paso, emite un chunk de acciones futuras, lo que reduce el error acumulado y mejora la estabilidad del control. Es relevante porque LeRobot se ha consolidado como el estándar abierto para entrenar y desplegar políticas de imitación en hardware asequible.

Con 51.668.614 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real en GPUs de consumo. La arquitectura es un transformer con codificador visual y decodificador de acciones, con una ventana de contexto definida por la observación (imágenes de cámara y estado de las articulaciones) y un horizonte de chunk configurable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con backbone visual ResNet y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuración de observación y horizonte de chunk; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado específicamente para aprendizaje por imitación en robótica. La arquitectura combina un codificador visual (típicamente ResNet) que procesa las imágenes de las cámaras del robot, un codificador del estado de las articulaciones y un decodificador transformer que genera un chunk de acciones futuras de forma conjunta. La innovación principal del método es la predicción de chunks: en lugar de predecir una acción por paso de control, el modelo emite un horizonte de acciones (por ejemplo, 100 pasos), lo que suaviza la trayectoria y mitiga el problema de la varianza en la predicción paso a paso, habitual en políticas de imitación con datos de teleoperación.

El entrenamiento se realiza sobre el dataset `phawitbinabik/DSCUBE_1O1B_FF_N50`, que contiene episodios de teleoperación capturados con LeRobot. No se documenta en la model card el número de episodios, el número de tokens de entrenamiento (concepto no aplicable directamente a políticas de imitación), la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El checkpoint se ha generado con el pipeline de entrenamiento de LeRobot (`lerobot-train`) y está orientado a despliegue con `lerobot-record` sobre robots SO100/SO101.

## Capacidades

- Control robótico por imitación: genera chunks de acciones de control a partir de observaciones visuales y del estado de las articulaciones.
- Manipulación de objetos: entrenado sobre episodios de teleoperación para tareas de pick-and-place y manipulación similares a las del dataset de entrenamiento.
- Predicción de acciones en bloque: emite un horizonte de acciones de forma conjunta, lo que reduce el error acumulado y estabiliza el control.
- Inferencia en tiempo real: el tamaño compacto (51,7 M de parámetros) permite ejecución en GPUs de consumo.
- Integración con LeRobot: compatible con `lerobot-train`, `lerobot-record` y el ecosistema de evaluación de políticas de Hugging Face.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (no procesa lenguaje natural).
- Capacidades especiales: no se documentan modos de razonamiento, visión general o audio; la visión se limita al procesamiento de imágenes de las cámaras del robot.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo se usa para controlar un robot SO100/SO101 en tareas de pick-and-place reproducidas del dataset de teleoperación, aprovechando la predicción de chunks para trayectorias suaves.
- Automatización de tareas repetitivas de ensamblaje: con un horizonte de chunk adecuado, el modelo puede ejecutar secuencias de agarre y colocación en celdas de trabajo, reduciendo la necesidad de programación explícita.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, cambios en el dataset o configuraciones de chunking, gracias a la integración con LeRobot.
- Prototipado rápido en robótica de bajo coste: el tamaño de 51,7 M de parámetros permite iterar en una sola GPU de consumo y desplegar en estaciones de trabajo sin infraestructura dedicada.
- Evaluación de políticas con `lerobot-record`: se puede ejecutar con el comando de evaluación de LeRobot para medir la tasa de éxito en episodios reales o simulados.
- Generación de datos sintéticos de trayectorias: las predicciones de chunks pueden usarse para aumentar datasets de teleoperación o para inicializar políticas en tareas relacionadas.
- Educación y formación: adecuado para cursos de robótica y aprendizaje automático que utilicen el ecosistema LeRobot, por su licencia Apache 2.0 y su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión FP32 para 51,7 M de parámetros (el checkpoint ocupa 0,2 GB en safetensors); en la práctica, el consumo depende de las imágenes de entrada y del horizonte de chunk, pero cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se ha documentado el uso de `--policy.device=cuda` en el pipeline de LeRobot, por lo que se recomiendan RTX 3060, RTX 4090, A100 o H100 para entrenamiento y evaluación.
- Cabe en consumer GPU: sí, en cualquier GPU de consumo con soporte CUDA (por ejemplo, RTX 2060 o superior); también es viable en CPU para inferencia de baja frecuencia, aunque no se documentan latencias.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch con safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a políticas robóticas).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_DSCUBE_1O1B_FF_N50 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | no disponible |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre un dataset concreto de teleoperación, el comportamiento está fuertemente condicionado por la distribución de ese dataset y puede generalizar mal a entornos, objetos o iluminación distintos.
- Riesgo de alucinación: no aplica en el sentido de lenguaje natural, pero el modelo puede generar trayectorias no válidas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje natural; la ventana de observación y el horizonte de chunk dependen de la configuración y no se documentan en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; el dataset de entrenamiento puede tener sus propias restricciones que no se detallan.
- Caveats para producción: el modelo se ha publicado con 0 descargas y 0 likes y sin documentación de tasas de éxito; antes de usarlo en producción es necesario evaluarlo con `lerobot-record` en el entorno real y verificar la seguridad del robot.
- Fecha de creación del repositorio: 2026-11-05, lo que puede indicar un checkpoint reciente sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phawitbinabik/act_DSCUBE_1O1B_FF_N50
- Dataset de entrenamiento: https://huggingface.co/datasets/phawitbinabik/DSCUBE_1O1B_FF_N50
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
