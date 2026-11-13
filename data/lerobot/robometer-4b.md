# lerobot/Robometer-4B

## Resumen

Robometer-4B es un modelo de recompensa (*reward model*) de propósito general para robótica, desarrollado por el equipo de LeRobot en Hugging Face. Se construye sobre un backbone Qwen3-VL afinado y añade tres cabezas específicas: progreso, preferencia y éxito. Dada una secuencia de vídeo junto con una descripción de la tarea, el modelo emite una señal de progreso por fotograma en el rango [0, 1] y una probabilidad de éxito por fotograma. Esto lo hace directamente utilizable para etiquetado offline de recompensas y como señal de recompensa de baja frecuencia durante el ajuste fino por refuerzo (RL) de políticas robóticas.

El modelo resuelve un problema recurrente en el aprendizaje por refuerzo aplicado a robots: la escasez y el coste de las funciones de recompensa específicas por tarea. Al ofrecer una señal de recompensa zero-shot y agnóstica a la tarea, Robometer-4B permite reutilizar un mismo modelo para múltiples entornos y manipulaciones sin reentrenar una recompensa dedicada. Su relevancia actual radica en que se integra de forma nativa en el ecosistema LeRobot, lo que simplifica el ciclo completo de entrenamiento de políticas con recompensas aprendidas.

Con 4.447.004.940 parámetros (aproximadamente 4,4 mil millones), un repositorio de 8,9 GB en formato safetensors y licencia Apache 2.0, el modelo es de tamaño medio y puede desplegarse en hardware de una sola GPU. La longitud de contexto, los idiomas soportados y los detalles de cuantización no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (backbone Qwen3-VL afinado) con cabezas de progreso, preferencia y éxito |
| Parametros totales | 4.447.004.940 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Robometer-4B parte de un backbone Qwen3-VL, un transformer vision-language, afinado para la tarea de recompensa. Sobre la representación del backbone se añaden tres cabezas especializadas: una de progreso, que produce una señal escalar por fotograma en [0, 1]; una de preferencia; y una de éxito, que emite una probabilidad por fotograma. La entrada combina vídeo y una descripción textual de la tarea, y la salida es una señal temporal densa apta tanto para etiquetado offline como para RL de políticas robóticas con recompensas de baja frecuencia.

El entrenamiento se realizó con LeRobot sobre el dataset `robometer/RBM-1M`, según los metadatos de la model card. No se dispone de información sobre el número exacto de tokens o fotogramas de entrenamiento, la composición detallada del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información proporcionada. El modelo figura como *finetune* de `robometer/Robometer-4B` en los metadatos de Hugging Face.

## Capacidades

- Evaluación de progreso de tareas robóticas: genera una señal de progreso por fotograma en el rango [0, 1] a partir de vídeo y descripción de tarea.
- Predicción de éxito: emite una probabilidad de éxito por fotograma, útil para detectar finalización o fallo de una ejecución.
- Modelado de preferencias: incorpora una cabeza de preferencia para comparar trayectorias o comportamientos.
- Funcionamiento zero-shot: diseñado para generalizar a tareas no vistas sin reentrenamiento específico.
- Procesamiento multimodal vídeo-texto: combina observaciones visuales temporales con instrucciones en lenguaje natural.
- Etiquetado offline de recompensas: permite anotar datasets de trayectorias con señales de recompensa densas.
- Integración con LeRobot: API `make_reward_model` y flujo `lerobot-train` para entrenamiento y uso directo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio adicionales: no disponible en la información proporcionada (sí procesa vídeo por su naturaleza de reward model).

## Casos de uso

- Etiquetado offline de recompensas en datasets de robótica: dado un conjunto de trayectorias grabadas con sus descripciones de tarea, Robometer-4B genera señales de progreso y éxito por fotograma, lo que permite construir datasets de recompensa densos sin anotación manual.
- RL de políticas robóticas con recompensa aprendida: durante el ajuste fino por refuerzo, el modelo actúa como fuente de recompensa de baja frecuencia, sustituyendo funciones de recompensa diseñadas a mano para cada tarea.
- Evaluación automática de políticas entrenadas: comparando la señal de progreso y la probabilidad de éxito a lo largo de una ejecución, se puede medir de forma objetiva si una política completa la tarea o se estanca.
- Filtrado y curación de datos de demostración: las trayectorias con señal de progreso baja o éxito improbable pueden descartarse o priorizarse antes de entrenar una política, mejorando la calidad del dataset.
- Aprendizaje por preferencias: la cabeza de preferencia permite ordenar pares de trayectorias y construir datasets de comparación para métodos tipo RLHF aplicados a robots.
- Detección temprana de fallos en ejecución: la probabilidad de éxito por fotograma puede usarse como señal de parada o de reinicio en bucles de control, evitando que un robot continúe una ejecución condenada al fracaso.
- Investigación en recompensas generalistas: sirve como baseline zero-shot para estudiar la transferencia de reward models entre entornos y tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4,4 mil millones de parámetros, en fp16 el peso ronda los 8,9 GB (tamaño del repositorio), por lo que se necesita al menos una GPU con 12-16 GB de VRAM para inferencia en precisión media, y más si se procesan secuencias de vídeo largas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar viabilidad en A100, H100, L40S y GPUs de consumo de gama alta (RTX 4090, RTX 3090), aunque el autor no lo especifica.
- ¿Cabe en GPU de consumo? No confirmado por el autor; por el tamaño del checkpoint (8,9 GB) es plausible en GPUs con 16 GB o más de VRAM, sujeto a la longitud de las secuencias de vídeo.
- Opciones de despliegue: integración nativa con LeRobot (`lerobot-train`, `lerobot.rewards.make_reward_model`). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (reward models para robótica) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la información proporcionada; al entrenarse sobre un dataset concreto (`robometer/RBM-1M`), puede heredar sesgos de distribución de ese dataset (entornos, objetos y tareas sobrerrepresentados).
- Riesgo de alucinación: como modelo generativo basado en un backbone vision-language, puede producir señales de progreso o éxito poco fiables en escenarios fuera de distribución; la señal debe validarse antes de usarse en bucles de control reales.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles; no se garantiza un comportamiento multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del backbone Qwen3-VL y del dataset `robometer/RBM-1M` por si imponen requisitos adicionales.
- Para producción: la recompensa aprendida puede ser explotada por la política (*reward hacking*); se recomienda combinar con verificaciones externas y monitorizar la correlación entre recompensa predicha y éxito real.
- El modelo está diseñado como reward model, no como política ni como asistente conversacional; su uso fuera de ese ámbito no está respaldado por la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/lerobot/Robometer-4B
- Modelo base en Hugging Face: https://huggingface.co/robometer/Robometer-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/robometer/RBM-1M
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
