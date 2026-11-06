# KyraLeeChunWei/ParacetamolRecovery_e100_20K_ACT

## Resumen

ParacetamolRecovery_e100_20K_ACT es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de robótica de Hugging Face, por el usuario KyraLeeChunWei. Está asociado al dataset `KyraLeeChunWei/ParacetamolRecovery_e100`, lo que sugiere un entrenamiento orientado a una tarea concreta de manipulación robótica (recuperación de paracetamol) con 100 episodios de demostración.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,4 GB, se trata de un modelo pequeño y ligero, diseñado para ejecutarse en hardware modesto y para control de robots manipuladores (el ejemplo de la model card usa un seguidor SO-100). No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que mapea observaciones visuales y de estado del robot a comandos de acción motora.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento y despliegue de políticas de imitación con LeRobot: entrenamiento desde un dataset teleoperado, publicación en el Hub y evaluación directa con `lerobot-record`. Es útil para desarrolladores de robótica que quieran reproducir o adaptar una política ACT para tareas de pick-and-place o manipulación similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para aprendizaje por imitación |
| Parametros totales | 51.678.855 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que emplea un transformer para predecir "chunks" de acciones (secuencias cortas de comandos motores) a partir de observaciones. En lugar de predecir una única acción por paso, el modelo genera un bloque de acciones futuras, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. La arquitectura combina codificación visual de las imágenes de cámara con el estado del robot y decodifica las acciones mediante un transformer con cabezas de predicción de chunks.

El entrenamiento se realizó con LeRobot a partir del dataset `KyraLeeChunWei/ParacetamolRecovery_e100`, compuesto por demostraciones teleoperadas. El nombre del modelo indica 100 épocas (`e100`) y 20K pasos de entrenamiento (`20K`). No se dispone de información detallada sobre el número de tokens, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de aprendizaje por imitación). Tampoco se documentan innovaciones adicionales más allá del propio mecanismo de action chunking descrito en el paper de ACT (arXiv:2304.13705).

## Capacidades

- Control robótico de manipulación mediante aprendizaje por imitación: predice secuencias de acciones motoras a partir de observaciones visuales y de estado.
- Predicción de action chunks: genera bloques de acciones en lugar de pasos individuales, lo que aporta suavidad y robustez al control.
- Ejecución de tareas teleoperadas aprendidas: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación/inferencia con `lerobot-record`.
- Compatibilidad con robots tipo SO-100 (seguidor) según el ejemplo de la model card.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de "thinking": no es un modelo de lenguaje.

## Casos de uso

- Automatización de tareas de pick-and-place: la política puede reproducir la secuencia de agarre y colocación aprendida del dataset, adecuada para entornos de laboratorio con objetos similares a los de entrenamiento.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para entrenar variantes con `lerobot-train` sobre nuevos datasets teleoperados.
- Investigación en aprendizaje por imitación: permite comparar el rendimiento de ACT frente a otros métodos (diffusion policy, VLA) en tareas de manipulación concretas.
- Evaluación de pipelines de LeRobot: útil para validar el flujo completo de entrenamiento, publicación en el Hub y evaluación con `lerobot-record` en un robot SO-100.
- Demostraciones educativas de robótica: su tamaño reducido (51,7 M de parámetros, 0,4 GB) facilita su uso en cursos y talleres de robótica de imitación.
- Benchmarking de hardware de bajo coste: al ser un modelo pequeño, permite medir latencia y throughput en GPUs de consumo y en sistemas embebidos con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 51,7 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,2 GB en FP32 y alrededor de 0,1 GB en FP16. La VRAM adicional depende del tamaño de las imágenes de entrada y del buffer de inferencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, con margen amplio).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de inferencia en CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParacetamolRecovery_e100_20K_ACT | 51,7 M | no aplica | Manipulación robótica (ACT) | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot (genéricas) | variable (típicamente decenas de M) | no aplica | Manipulación robótica | Apache 2.0 | Hugging Face |
| Diffusion Policy (LeRobot) | variable | no aplica | Manipulación robótica | según implementación | Hugging Face / repos |
| VLA tipo OpenVLA | miles de M | contexto de lenguaje | Manipulación guiada por lenguaje | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo (tasas de éxito, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una tarea concreta (recuperación de paracetamol) y un dataset específico; su generalización a otros objetos, entornos o robots no está garantizada.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural ni admite tool calling; no debe evaluarse como un modelo de lenguaje.
- Riesgo de sobreajuste al dataset de entrenamiento: con 100 episodios y 20K pasos, el comportamiento puede degradarse ante variaciones de iluminación, posición de cámara u objetos distintos.
- Sesgos y alucinaciones: no aplican en el sentido habitual de modelos generativos de texto, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar las condiciones de los datos de entrenamiento y del hardware asociado.
- Caveats para producción: requiere validación en el robot objetivo, verificación de seguridad física y pruebas de robustez antes de un despliegue real; no se documentan métricas de éxito ni condiciones de evaluación.
- Idiomas: no disponible; el modelo no tiene componente lingüístico.

## Enlaces

- Hugging Face: https://huggingface.co/KyraLeeChunWei/ParacetamolRecovery_e100_20K_ACT
- Repositorio de archivos: https://huggingface.co/KyraLeeChunWei/ParacetamolRecovery_e100_20K_ACT/tree/main
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/ParacetamolRecovery_e100
