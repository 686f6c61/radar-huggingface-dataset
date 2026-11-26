# Haku-2004/act_k6s120e_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k6s120e_base_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, presumiblemente capturado mediante teleoperación.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo. Se distribuye en formato safetensors bajo licencia Apache 2.0 y está pensado para controlar robots tipo SO-100 (el ejemplo de la model card usa `so100_follower`).

Su relevancia radica en que ejemplifica el flujo completo de LeRobot para entrenar y desplegar políticas de imitación de forma reproducible: dataset en el Hub, entrenamiento con `lerobot-train` y evaluación con `lerobot-record`. No es un modelo de lenguaje ni un modelo fundacional multimodal; es una política específica de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo consume observaciones por paso y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k6_20_20261113_173939 |

## Arquitectura y entrenamiento

ACT se basa en un transformer encoder-decoder. Un codificador visual (habitualmente ResNet) procesa las imágenes de las cámaras del robot y las proyecta junto con el estado de las articulaciones; un transformer codifica esa secuencia de observaciones y un decodificador genera un chunk de acciones futuras de forma paralela. La innovación clave del paper original (arXiv:2304.13705) es predecir varios pasos de acción a la vez y agregarlos temporalmente, lo que suaviza la política y mitiga el compounding error típico de las políticas paso a paso.

No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o regularización específicas más allá de las del entrenamiento estándar de LeRobot. El nombre del checkpoint (`k6s120e_base_20`) sugiere una configuración concreta de episodios o pasos (`k6`, `s120`, `20`), pero su significado no está documentado en la model card.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y del estado del robot.
- Manipulación de objetos en entornos de laboratorio o mesa de trabajo, entrenado sobre teleoperación.
- Inferencia en tiempo real sobre robots compatibles con LeRobot (por ejemplo, SO-100 follower).
- Integración directa con el ecosistema LeRobot: entrenamiento, evaluación y grabación de episodios.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general o audio fuera del pipeline robótico.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política predice chunks de acciones que permiten al brazo recoger y colocar objetos de forma estable, reduciendo las correcciones paso a paso gracias al action chunking.
- Evaluación reproducible de políticas de imitación: con `lerobot-record` y `--policy.path` se pueden grabar episodios de evaluación y comparar tasas de éxito entre checkpoints del mismo dataset.
- Prototipado rápido de tareas de manipulación: al ser un modelo de 51,7 M de parámetros y 0,2 GB, se puede entrenar y desplegar en un equipo con una sola GPU consumer para iterar sobre nuevas tareas.
- Investigación en aprendizaje por imitación: sirve como baseline ACT sobre un dataset concreto para comparar con Diffusion Policy, VQ-BeT u otras políticas de LeRobot.
- Docencia y formación en robótica: el flujo completo (dataset, entrenamiento, evaluación) es reproducible con comandos de LeRobot y hardware de bajo coste tipo SO-100.
- Despliegue en robots de bajo coste: la ligereza del checkpoint permite ejecutarlo en un PC conectado al robot sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el checkpoint en precisión de entrenamiento (51,7 M de parámetros, ~0,2 GB de pesos), más el overhead del codificador visual y del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas RTX 3060, RTX 4060, RTX 4090; también es viable en CPU para inferencia de baja frecuencia, aunque no se recomienda para control en tiempo real.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a políticas robóticas).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51,7 M | no aplica | Action chunking con transformer | Apache 2.0 | Hugging Face Hub |
| Diffusion Policy | no disponible | no aplica | Difusión para generación de acciones | no disponible | Implementación en LeRobot |
| VQ-BeT | no disponible | no disponible | Cuantización vectorial de comportamiento | no disponible | Implementación en LeRobot |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto frente a las alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: la política está entrenada sobre un dataset específico (`k6_20_20261113_173939`); su comportamiento fuera de la distribución de ese dataset no está garantizado.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erróneas o inseguras cuando las observaciones se alejan de las condiciones de entrenamiento.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni la seguridad del modelo en entornos reales.
- Caveat para producción: no se documentan métricas de tasa de éxito, número de episodios de entrenamiento ni configuración exacta del dataset; antes de desplegar en un robot real es necesario validar la política en el entorno objetivo.
- El modelo no incluye información sobre seguridad física del robot; cualquier despliegue debe incorporar límites de par, paradas de emergencia y supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6s120e_base_20
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
