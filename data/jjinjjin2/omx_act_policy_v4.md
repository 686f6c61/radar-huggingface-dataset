# JJinJJin2/omx_act_policy_v4

## Resumen

`omx_act_policy_v4` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv:2304.13705. Lo publica el usuario JJinJJin2 en Hugging Face mediante la librería LeRobot de Hugging Face, y está entrenado sobre el dataset `JJinJJin2/pick_and_place_v3`, lo que sitúa su dominio de aplicación en tareas de recogida y colocación (pick and place) con un robot tipo SO-100.

A diferencia de un modelo de lenguaje, este checkpoint no genera texto: es un policy que mapea observaciones (imágenes de cámara y estado de las articulaciones) a secuencias cortas de acciones motoras. ACT predice "chunks" de acciones en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad en ejecución sobre hardware real. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, en formato safetensors.

Es relevante ahora porque ejemplifica el flujo actual de entrenamiento y despliegue de políticas robóticas de código abierto con LeRobot: entrenamiento desde datos de teleoperación, publicación en el Hub y evaluación directa sobre un robot follower. No obstante, se trata de un checkpoint de autor individual, sin descargas ni validación externa, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de LeRobot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un backbone visual (encoder de imágenes) con un transformer que decodifica un chunk de acciones futuras a partir de las observaciones actuales. La innovación central del método es precisamente esa predicción por chunks: en lugar de emitir una acción por paso, el modelo genera una secuencia de acciones que se ejecutan de forma abierta o con agregación temporal, lo que suaviza la trayectoria y reduce el compounding error típico de las políticas paso a paso.

El entrenamiento es de imitación supervisada sobre datos de teleoperación, no hay evidencia en la información disponible de RLHF, DPO ni ajuste por refuerzo. El dataset declarado es `JJinJJin2/pick_and_place_v3`, orientado a tareas de pick and place; no se especifican número de episodios, número de tokens ni composición detallada del dataset. La model card únicamente documenta el flujo de entrenamiento con `lerobot-train` y la evaluación con `lerobot-record` sobre un `so100_follower`.

## Capacidades

- Generación de chunks de acciones motoras para control de robot a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere definición explícita de recompensa).
- Ejecución de tareas de pick and place en el dominio del dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot: entrenamiento, checkpointing y evaluación con CLI.
- Compatible con robots tipo SO-100 follower en el flujo de evaluación documentado.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No dispone de capacidades multilingües, visión general, audio ni modo thinking.

## Casos de uso

- Automatización de pick and place en laboratorio: el policy se ejecuta sobre un SO-100 follower para recoger y colocar objetos dentro del dominio del dataset `pick_and_place_v3`; es adecuado porque ACT está diseñado para tareas manipulativas de horizonte corto con datos de teleoperación.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para comparar configuraciones de ACT con `lerobot-train` antes de invertir en datasets mayores.
- Evaluación reproducible de imitación: permite lanzar `lerobot-record` con `--policy.path` apuntando a este checkpoint y medir tasas de éxito sobre episodios controlados.
- Baseline en experimentos académicos: al ser un checkpoint ACT público con licencia Apache 2.0, puede usarse como referencia frente a políticas propias en tareas de manipulación similares.
- Formación y docencia en robótica de imitación: ilustra el ciclo completo teleoperación, entrenamiento y despliegue sin necesidad de infraestructura propietaria.
- Integración en pipelines de investigación con LeRobot: el formato safetensors y la estructura de repositorio permiten cargarlo directamente desde el Hub en scripts de evaluación automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, el peso en fp32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; el flujo de LeRobot usa `--policy.device=cuda`, por lo que se espera una GPU NVIDIA con CUDA. Una RTX 3060 o superior es suficiente por tamaño de modelo.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; el cuello de botella real será el encoder visual y el preprocesado de imágenes, no el tamaño del transformer.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de policy.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx_act_policy_v4 | 51.668.614 | no aplica | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | no disponible | según checkpoint | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | no disponible | según checkpoint | Hugging Face |
| Políticas VQ-BeT en LeRobot | no disponible | no aplica | no disponible | según checkpoint | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a la disponibilidad de familias de políticas dentro del ecosistema LeRobot.

## Limitaciones y advertencias

- Modelo de autor individual con 0 descargas y 0 likes: no hay validación externa ni evidencia pública de su tasa de éxito.
- Dominio muy restringido: entrenado sobre `pick_and_place_v3`; es probable que no generalice fuera de esa tarea, esos objetos y esa configuración de cámara/robot.
- Sin datos de sesgos, robustez ante cambios de iluminación, oclusiones o variaciones de posición de los objetos.
- Riesgo de fallo silencioso en ejecución física: una política de imitación puede producir acciones fuera de rango; es imprescindible validar con límites de seguridad en el robot.
- No se documentan episodios de entrenamiento, composición del dataset ni métricas de evaluación, lo que impide reproducir el resultado declarado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de documentación técnica hace desaconsejable su uso en producción sin reentrenamiento y evaluación propia.
- La fecha de creación indicada (2026-11-10) es futura respecto a la información habitual de repositorios; conviene verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/JJinJJin2/omx_act_policy_v4
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/JJinJJin2/pick_and_place_v3
