# fecasado/gact-kitchen-lettuce-baseline

## Resumen

`gact-kitchen-lettuce-baseline` es una política robótica de imitación entrenada con LeRobot y publicada por el usuario fecasado en Hugging Face. Implementa la arquitectura `gaze_act`, una variante de ACT (Action Chunking with Transformers) que incorpora información de mirada (gaze) como señal adicional de entrada. El modelo resuelve una tarea concreta de manipulación: transferir lechuga a un plato en un entorno de cocina, a partir del dataset `fecasado/lettuce-to-plate-320x240` con observaciones de 320x240 píxeles.

Con 51.664.538 parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a control de robots de sobremesa (tipo SO-100) más que a razonamiento general. No es un modelo de lenguaje: no procesa texto ni genera respuestas, sino que mapea observaciones visuales y propioceptivas a secuencias de acciones motoras. Su relevancia radica en ser un ejemplo reproducible de política visuomotora entrenada end-to-end con el stack de LeRobot, útil para quienes investigan imitación robótica con señales de atención.

La información pública es escasa: la model card es una plantilla sin rellenar, no hay benchmarks publicados ni descripción de la composición del dataset más allá de su identificador. Los datos que siguen proceden de los metadatos del repositorio y de la configuración estándar de LeRobot para políticas ACT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_act (variante de ACT, Action Chunking with Transformers, con entrada de mirada) |
| Parametros totales | 51.664.538 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales para esta política) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | fecasado/lettuce-to-plate-320x240 |
| Resolución de observación | 320x240 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura `gaze_act` se apoya en ACT, un transformer que predice chunks de acciones (secuencias cortas de comandos motores) a partir de observaciones visuales y del estado del robot. La variante gaze añade una señal de mirada como entrada adicional, de modo que el modelo puede condicionar la predicción de acciones sobre dónde está mirando el operador o el sistema de seguimiento ocular. El modelo tiene 51,6 millones de parámetros, un tamaño coherente con políticas ACT para brazos robóticos de bajo coste.

El entrenamiento se realizó con el pipeline `lerobot-train` sobre el dataset `fecasado/lettuce-to-plate-320x240`, que contiene episodios de demostración de la tarea de pasar lechuga a un plato. No se dispone de información pública sobre el número de episodios, la composición exacta del dataset, si hubo aumento de datos ni sobre el esquema de la señal de gaze. Tampoco se documenta si se aplicó regularización específica o técnicas como decodificación especulativa, que no aplican a este tipo de política.

## Capacidades

- Control visuomotor de un brazo robótico para la tarea de transferir lechuga a un plato.
- Predicción de chunks de acciones a partir de observaciones de imagen de 320x240 píxeles.
- Condicionamiento por señal de mirada (gaze) como entrada adicional al transformer.
- Ejecución de políticas de imitación en robots tipo SO-100 follower mediante `lerobot-record`.
- Evaluación reproducible con el stack de LeRobot (entrenamiento, checkpointing y despliegue).
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general: la visión está acoplada a la tarea entrenada.

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve como línea base (baseline) para comparar variantes de ACT con y sin señal de mirada en la misma tarea de manipulación.
- Investigación en gaze-conditioned policies: permite estudiar si la mirada mejora la precisión en tareas de pick-and-place con objetos deformables como la lechuga.
- Evaluación de pipelines LeRobot: el checkpoint se puede cargar con `lerobot-record` y `--policy.path` para validar el flujo completo de entrenamiento y despliegue en un robot SO-100.
- Docencia y prototipado en robótica de bajo coste: con 51,6 M de parámetros y 0,2 GB, es viable entrenarlo y ejecutarlo en hardware asequible con una GPU consumer.
- Benchmark interno de manipulación en cocina: la tarea lettuce-to-plate puede usarse como prueba estandarizada de transferencia de objetos en entornos domésticos simulados o reales.
- Punto de partida para fine-tuning: al estar bajo Apache 2.0, se puede reentrenar con nuevos datasets de manipulación sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,6 M de parámetros; en la práctica, el consumo lo domina el encoder visual y el buffer de observaciones, por lo que se recomienda al menos 4-8 GB de VRAM para trabajar con comodidad.
- GPU recomendadas: cualquier GPU con soporte CUDA, como RTX 3060, RTX 4090, A100 o H100; el modelo es lo bastante pequeño para no necesitar aceleradores de gama alta.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) con PyTorch y CUDA; no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen de la frecuencia de control del robot y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gact-kitchen-lettuce-baseline | 51,6 M | no aplica | Manipulación (lechuga a plato) con gaze | Apache 2.0 | Hugging Face |
| Políticas ACT estándar de LeRobot | del orden de decenas de millones (según configuración) | no aplica | Manipulación genérica | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación visuomotora | según implementación | Repositorios de investigación |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay documentación de la arquitectura gaze_act, del esquema de mirada ni de los resultados obtenidos.
- El modelo está especializado en una única tarea (lechuga a plato) y no generaliza a otras manipulaciones sin reentrenamiento.
- No hay benchmarks ni métricas de éxito publicadas, por lo que se desconoce su tasa de acierto real.
- El dataset de entrenamiento no está descrito en detalle (número de episodios, variabilidad de escenas, condiciones de iluminación), lo que dificulta evaluar su robustez.
- Riesgo de sobreajuste al entorno de captura del dataset; el rendimiento puede degradarse con cambios de cámara, fondo o iluminación.
- No procesa lenguaje ni admite instrucciones en texto; cualquier uso conversacional es inviable.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Al ser una política de imitación, puede reproducir sesgos o errores presentes en las demostraciones humanas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-kitchen-lettuce-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/lettuce-to-plate-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
