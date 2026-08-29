# alexhegit/so101-simstudio-lab01-pnp-act-state6

## Resumen

Este checkpoint corresponde a una política ACT (Action Chunking with Transformers) entrenada sobre el robot SO-101 en el entorno de simulación SimStudio (basado en MuJoCo), con teleoperación tipo leader-arm. El modelo está especializado en la tarea de pick-and-place del Lab 01: recoger un cubo y colocarlo en un contenedor. Ha sido desarrollado por alexhegit y publicado bajo licencia Apache 2.0, integrado en el ecosistema LeRobot.

La particularidad de esta versión es que la entrada de observación se limita a las 6 dimensiones de posición articular del follower (joint `.pos`), descartando las velocidades y la posición del efector final que sí estaban presentes en el dataset original (15 dimensiones). Esto alinea la política con la propriocepción del robot real SO-101 y facilita la transferencia sim2real. El entrenamiento se realizó con 50.000 pasos, batch 128, en una GPU AMD Instinct MI300X, alcanzando una loss de 0,054 y un 58% de éxito en evaluación sim2sim con 50 episodios.

El modelo tiene 51,7 millones de parámetros y se distribuye en formato safetensors. Es relevante porque demuestra un flujo completo de entrenamiento de políticas robóticas en simulación con vistas a despliegue real, y porque aborda explícitamente el problema de la discrepancia entre canales de observación simulados y reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de control motor, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer diseñada para imitación robótica que predice un "chunk" de acciones futuras (secuencia de comandos articulares) a partir de observaciones actuales. En esta implementación concreta, la política recibe como entrada únicamente las 6 posiciones articulares del follower del SO-101, y produce una secuencia de acciones que el robot debe ejecutar. El entrenamiento se realizó mediante aprendizaje por imitación supervisado sobre demostraciones expertas capturadas en SimStudio con teleoperación leader-arm.

El dataset de entrenamiento, `alexhegit/so101-simstudio-lab01-pnp`, contiene 8 episodios de demostración. El entrenamiento se llevó a cabo durante 50.000 pasos con batch size 128, en una GPU AMD Instinct MI300X, durante aproximadamente 17 horas. La loss final de entrenamiento fue 0,054. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente supervisado de comportamiento. La evaluación sim2sim se realizó con el protocolo completo: `reset_arm: follow`, sincronización, EGL, y `n_action_steps=50`, obteniendo 29 de 50 episodios exitosos (58%). El modelo de referencia con 15 dimensiones (pos+vel+EE) obtuvo 32 de 50 (64%) bajo el mismo protocolo.

## Capacidades

- Control de robot SO-101 para tareas de pick-and-place en simulación (MuJoCo).
- Generación de secuencias de acciones articulares (action chunking) para ejecución en bucle cerrado.
- Entrada de propriocepción de 6 dimensiones (posiciones articulares), compatible con el robot real estándar.
- Integración con el ecosistema LeRobot: carga directa mediante `ACTPolicy.from_pretrained`.
- Evaluación reproducible mediante el config de rollout incluido en el repositorio SimStudio.
- Posibilidad de fine-tuning adicional sobre otros datasets o entornos, gracias a la arquitectura ACT estándar.

## Casos de uso

- Transferencia sim2real de políticas de manipulación: el modelo se entrena con observaciones de 6 dimensiones, idénticas a las disponibles en el SO-101 real, lo que reduce la brecha de simulación. Puede servir como base para experimentos de despliegue real tras alinear unidades (radianes vs. grados, escala del gripper).
- Investigación en aprendizaje por imitación: permite comparar el efecto de reducir la dimensionalidad de las observaciones (6-D vs. 15-D) sobre el rendimiento de la política, como se muestra en la evaluación sim2sim.
- Desarrollo de pipelines de entrenamiento robótico en simulación: el flujo completo (dataset, entrenamiento, evaluación) está documentado y reproducible, útil para equipos que quieran montar sus propios experimentos con SimStudio.
- Benchmark de políticas ACT en entornos de pick-and-place: sirve como punto de referencia para comparar con otras variantes (15-D, SmolVLA, MolmoACT2) publicadas por el mismo autor.
- Educación y demostración en robótica: al ser un ejemplo completo y ligero (51,7M parámetros, 0,2 GB), puede ejecutarse en hardware modesto para enseñar conceptos de imitación y control.
- Integración en sistemas de automatización simulada: puede utilizarse como controlador en entornos virtuales de prueba antes de invertir en hardware real.

## Benchmarks y rendimiento

La evaluación sim2sim reportada en la model card es la siguiente:

| Variante | Episodios exitosos | Tasa de exito |
|---|---|---|
| ACT 6-D (este modelo) | 29/50 | 58% |
| ACT 15-D (referencia) | 32/50 | 64% |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, dado que no es un modelo de lenguaje ni de razonamiento general. El único benchmark disponible es la evaluación de tarea robótica sim2sim descrita anteriormente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente, pero con 51,7M de parámetros en fp32 (~207 MB) cualquier GPU con más de 1 GB de VRAM puede ejecutar inferencia sin problemas. Con cuantización a fp16 (~103 MB) es aún más ligero.
- GPU recomendadas: el entrenamiento se realizó en AMD Instinct MI300X, pero la inferencia es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso en CPU para evaluación no en tiempo real.
- Compatibilidad con consumer GPU: sí, el modelo es muy pequeño y cabe en cualquier GPU moderna.
- Opciones de despliegue: LeRobot (Python), servidores de inferencia compatibles con PyTorch (por ejemplo, TorchServe), y posiblemente ONNX Runtime si se exporta. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no disponibles. Al ser un modelo transformer de tamaño reducido, se espera latencia de decenas de milisegundos por predicción en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Observaciones | Tasa de exito sim2sim | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT 6-D (este) | 51,7M | 6-D (posiciones articulares) | 58% (29/50) | Apache 2.0 | Hugging Face |
| ACT 15-D (referencia) | 51,7M (aproximado) | 15-D (pos+vel+EE) | 64% (32/50) | Apache 2.0 | Hugging Face |
| SmolVLA (del mismo autor) | no disponible | multimodal (visión + propriocepción) | no disponible | Apache 2.0 | Hugging Face |
| MolmoACT2 (del mismo autor) | no disponible | multimodal (visión + propriocepción) | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes publicadas por el mismo autor en el mismo proyecto. No se dispone de datos de otros modelos ACT de referencia.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (pick-and-place de un cubo en un contenedor) en un entorno simulado específico. No generaliza a otras tareas o escenarios sin fine-tuning.
- La entrada de 6 dimensiones omite velocidades y posición del efector final, lo que puede limitar el rendimiento en tareas que requieran información de velocidad o contacto fino.
- Las unidades de los ángulos articulares (radianes vs. grados) y la escala del gripper requieren alineación manual antes de un despliegue real, como advierte el autor.
- El dataset de entrenamiento contiene solo 8 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones en la posición inicial o en la dinámica del entorno.
- La tasa de éxito del 58% es modesta; en producción real se necesitarían estrategias de recuperación o re-planificación.
- No se han realizado evaluaciones en hardware real; el rendimiento sim2real podría degradarse.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías y sin responsabilidad por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-act-state6
- Dataset de entrenamiento: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp
- Repositorio SimStudio: https://github.com/rocPAI-Forge/so101-simstudio
- Walkthrough del Lab 01: https://github.com/rocPAI-Forge/so101-simstudio/blob/main/labs/lab01_pnp/lab01_pnp.md
- Documentación técnica adicional (GitHub): https://github.com/rocPAI-Forge/tech-blog-pub/blob/main/PhysicalAI/so101-simstudio-lab01-pnp/README-details.md
