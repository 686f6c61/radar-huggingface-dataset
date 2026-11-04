# Faless/harvest_apples_smolvla_v2_action_expert_bs96_ee_5ep

## Resumen

SmolVLA es un modelo visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de instrucciones en lenguaje natural e imágenes de cámara. Esta ficha concreta, publicada por el usuario Faless, es un ajuste fino del checkpoint base `lerobot/smolvla_base` sobre un conjunto de datos propio de simulación para la tarea de recogida de manzanas con un brazo Agilex Piper en espacio de efector final (end-effector, `ee`). El identificador del repositorio indica un entrenamiento con batch size 96 durante 5 épocas (`bs96_ee_5ep`).

El modelo resuelve el problema de mapear observaciones multimodales (imágenes y estado del robot) más una instrucción textual a una secuencia de acciones motoras de bajo nivel. Con 450.046.176 parámetros (~450 M) y un tamaño de repositorio de 1,8 GB en formato safetensors, está pensado para inferencia en hardware de consumo, lo que lo hace relevante para prototipado rápido de políticas robóticas sin acceso a clústeres de GPU de datacenter.

Es relevante ahora porque los VLA compactos están desplazando a los pipelines tradicionales de visión + planificación en robótica de manipulación, y porque el ecosistema LeRobot permite entrenar y desplegar estas políticas con comandos de CLI reproducibles. No obstante, se trata de un ajuste muy específico de una sola tarea y un solo entorno simulado, con solo 9 descargas y 0 likes, por lo que su valor es fundamentalmente como referencia técnica y punto de partida, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844); detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto, pero no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolVLA, un modelo visión-lenguaje-acción compacto descrito en el paper arXiv:2506.01844, que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones para producir comandos motores condicionados por la observación y la instrucción. El modelo base es `lerobot/smolvla_base`, un checkpoint preentrenado de Hugging Face sobre el que se realiza un ajuste fino supervisado (imitation learning / behavior cloning) con el framework LeRobot.

El ajuste fino se ha realizado sobre el dataset `Faless/harvest_apples_with_agilex_piper_sim_ee`, un conjunto de datos de simulación con el robot Agilex Piper en el que las acciones se expresan en el espacio del efector final. Los hiperparámetros visibles en el nombre del repositorio son batch size 96 y 5 épocas de entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron etapas de RLHF o DPO; en el contexto de políticas robóticas de imitación, lo habitual es behavior cloning puro, pero este dato no está confirmado en la información disponible.

## Capacidades

- Generación de acciones motoras de manipulación a partir de observaciones visuales y estado del robot, en el espacio de efector final.
- Condicionamiento por instrucción en lenguaje natural (visión-lenguaje-acción), heredado de la arquitectura SmolVLA.
- Ejecución de una tarea concreta de recogida de manzanas (`harvest_apples`) en el simulador con brazo Agilex Piper.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación y grabación de episodios con `lerobot-record`.
- Despliegue en hardware de consumo, según las indicaciones del modelo base SmolVLA.
- No se declaran capacidades de tool calling, razonamiento multi-paso, agentes de software, audio ni modo thinking; son capacidades ajenas al propósito del modelo.
- Capacidades multilingües: no disponibles ni documentadas.

## Casos de uso

- Prototipado de políticas de manipulación en simulación: usar el checkpoint como línea base para la tarea de recogida de manzanas y comparar variantes de entrenamiento (batch size, épocas, espacio de acciones) antes de invertir en datasets reales.
- Investigación en imitation learning: servir de referencia reproducible de un ajuste fino SmolVLA sobre un dataset propio, con hiperparámetros identificables en el nombre del repositorio.
- Evaluación de entornos simulados: ejecutar `lerobot-record` contra el simulador Agilex Piper para medir tasas de éxito por episodio y detectar fallos sistemáticos de la política.
- Transferencia a hardware real como paso posterior: dado su tamaño de ~450 M parámetros, puede desplegarse en una estación de trabajo con GPU de consumo para pruebas de teleoperación asistida antes de validar en el robot físico.
- Docencia y formación en robótica con IA: ejemplo completo y ligero de pipeline VLA (dataset, entrenamiento, evaluación) que cabe en un repositorio de 1,8 GB.
- Benchmark interno de infraestructura: medir latencia de inferencia y throughput de políticas VLA pequeñas en GPUs consumer para dimensionar despliegues mayores.
- Generación de datos sintéticos de evaluación: usar la política para producir trayectorias en simulación que alimenten análisis de robustez o aumenten datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (fp32/bf16): el checkpoint ocupa 1,8 GB en safetensors, por lo que se requiere aproximadamente 2-4 GB de VRAM para pesos y activaciones, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: no disponibles de forma específica para este ajuste; el modelo base SmolVLA está diseñado para hardware de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090), aunque no hay cifras publicadas para este checkpoint concreto.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es la vía documentada por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y en general no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faless/harvest_apples_smolvla_v2_action_expert_bs96_ee_5ep | 450 M | no disponible | Recogida de manzanas (Agilex Piper, sim, efector final) | Apache 2.0 | Hugging Face, 9 descargas |
| lerobot/smolvla_base | no disponible en la información proporcionada | no disponible | VLA generalista base para ajuste fino | no disponible en la información proporcionada | Hugging Face (modelo base) |
| Otras políticas LeRobot (ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado únicamente para la tarea de recogida de manzanas en simulación con Agilex Piper; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Entrenamiento en simulación: la brecha sim-to-real puede degradar gravemente el rendimiento en un robot físico; no hay evidencia publicada de transferencia real.
- Solo 5 épocas y un único dataset: riesgo de sobreajuste o de política poco robusta ante variaciones de iluminación, posiciones de objetos o ruido de sensores.
- Sin benchmarks publicados: no es posible comparar objetivamente su tasa de éxito frente a alternativas.
- Idiomas no declarados: el comportamiento ante instrucciones en castellano u otros idiomas distintos del usado en el dataset es desconocido.
- Sesgos: no documentados; en robótica de imitación, los sesgos del dataset (posiciones, colores, distribuciones de objetos) se transfieren directamente a la política.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como toda política de behavior cloning, puede producir trayectorias fuera de distribución sin señal de incertidumbre.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; verificar la licencia del dataset y del modelo base antes de un despliegue productivo.
- Madurez muy baja: 9 descargas, 0 likes y un solo autor; no hay evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/harvest_apples_smolvla_v2_action_expert_bs96_ee_5ep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/harvest_apples_with_agilex_piper_sim_ee
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
