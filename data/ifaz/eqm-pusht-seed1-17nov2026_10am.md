# iFaz/eqm-pusht-seed1-17nov2026_10am

## Resumen
El modelo `iFaz/eqm-pusht-seed1-17nov2026_10am` es una política robótica entrenada con LeRobot y publicada en Hugging Face por el usuario iFaz. Se trata de un checkpoint de imitación (imitation learning) orientado a la tarea PushT, un entorno de referencia en robótica donde un efector debe empujar un objeto en forma de T hasta una posición objetivo. El modelo emplea el prefijo `eqm` en su nomenclatura, aunque la model card no especifica la arquitectura concreta más allá de la etiqueta `eqm` y la librería `lerobot`.

El checkpoint contiene 205.787.957 parámetros en formato safetensors y ocupa 0,8 GB en el repositorio. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Su relevancia es acotada: se trata de un artefacto de entrenamiento reproducible (semilla 1, fecha 17 de noviembre de 2026) más que de un modelo de propósito general, y no cuenta con descargas ni interacciones en el momento de redactar esta ficha.

La información disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es muy limitada: la model card es una plantilla sin completar y no incluye métricas. Esta ficha refleja únicamente los datos verificables del repositorio y de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `eqm`; política LeRobot para robótica) |
| Parametros totales | 205.787.957 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna. Las etiquetas del repositorio indican `lerobot`, `eqm`, `robotics` y el dataset `lerobot/pusht`, lo que sitúa al modelo en el ecosistema LeRobot de Hugging Face para políticas de imitación. El nombre `eqm` sugiere una política basada en equilibrium matching o una variante denominada así por el autor, pero no hay documentación que lo confirme.

El entrenamiento se realizó presumiblemente sobre el dataset `lerobot/pusht` (entorno PushT), con semilla 1 según el identificador del repositorio. No se especifican el número de tokens, episodios, composición del dataset, ni si hubo RLHF, DPO u otras etapas de ajuste. La fecha en el nombre (17nov2026_10am) indica el momento del entrenamiento o del checkpoint.

## Capacidades
- Control robótico de imitación para la tarea PushT: el modelo genera acciones a partir de observaciones del entorno, según el flujo estándar de LeRobot.
- Integración con LeRobot: se puede cargar mediante `lerobot-record` con `--policy.path` apuntando al checkpoint.
- Entrenamiento reproducible: el identificador incluye semilla y fecha, lo que facilita la replicación.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales (thinking, audio, visión más allá de la observación robótica).

## Casos de uso
- Reproducción de experimentos en PushT: cargar el checkpoint con LeRobot para evaluar la política en el entorno de referencia y comparar con otras semillas o arquitecturas.
- Benchmark de políticas de imitación: usar este checkpoint como línea base en experimentos de robótica de manipulación con el dataset `lerobot/pusht`.
- Docencia y formación: servir como ejemplo práctico de entrenamiento y evaluación de políticas con LeRobot en un entorno controlado.
- Desarrollo de pipelines de evaluación: integrar el checkpoint en scripts de `lerobot-record` para generar episodios de evaluación (`eval_*`) y analizar el comportamiento.
- Investigación en aprendizaje por imitación: comparar la política `eqm` con alternativas como ACT sobre el mismo dataset y configuración.
- Pruebas de despliegue en simulación: validar el flujo completo de entrenamiento, checkpoint y evaluación antes de trasladar la metodología a robots reales como SO-100.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; con 205,8 M de parámetros, la inferencia en fp32 requeriría aproximadamente 0,8 GB solo para pesos, más memoria para activaciones y observaciones.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería poder ejecutar la política, pero no hay datos oficiales.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del checkpoint (0,8 GB), aunque no está confirmado.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas `eqm` sobre PushT) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias
- Model card incompleta: la plantilla no se ha rellenado y no describe arquitectura, datos ni métricas.
- Sesgos conocidos: no documentados; al entrenarse sobre un único dataset (PushT) y una única semilla, el comportamiento está fuertemente especializado.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la política puede producir acciones no válidas fuera del entorno de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; no es un modelo de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Caveats para producción: sin métricas de éxito, sin validación externa y con cero descargas, no es recomendable desplegarlo en un robot real sin una evaluación previa exhaustiva.
- El identificador incluye una fecha futura (2026), lo que puede generar confusión en la trazabilidad.

## Enlaces
- Hugging Face: https://huggingface.co/iFaz/eqm-pusht-seed1-17nov2026_10am
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset PushT: https://huggingface.co/datasets/lerobot/pusht
