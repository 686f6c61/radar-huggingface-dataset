# niejunnan25/Event2Reward-Qwen3.5-4B-Stage2

## Resumen

Event2Reward-Qwen3.5-4B-Stage2 es un modelo de recompensa para robótica desarrollado por Junnan Nie y colaboradores, presentado en el artículo "Event2Reward: Learning Robotic Rewards from Progress Relations" (arXiv:2610.39212). Se construye a partir de Qwen3.5-4B mediante fine-tuning y añade dos cabezas específicas: una cabeza de progreso de 101 bins y una cabeza de tendencia de tres clases. Su función es estimar el progreso de una tarea en el rango [0, 1] a partir de una descripción textual, la imagen inicial del episodio, una imagen objetivo proveniente de otra trayectoria exitosa y las cinco observaciones más recientes.

El modelo resuelve un problema clásico del aprendizaje por refuerzo en robótica: la escasez de señales de recompensa densas. La variación del progreso estimado entre pasos consecutivos actúa como recompensa densa para RL, lo que permite entrenar políticas en tareas manipulativas sin ingeniería manual de funciones de recompensa. Además, el checkpoint sirve como punto de partida para fine-tuning específico por tarea.

Este checkpoint corresponde al paso 10.000 de un esquema de 40.000 pasos, tras un preentrenamiento (Stage1) de 50.000 pasos y un entrenamiento conjunto con rollouts. Se distribuye en BF16 con licencia Apache-2.0, con un tamaño de repositorio de 9,1 GB. La librería de inferencia (`event2reward`) y el código asociado aún no están publicados en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con cabeza de progreso de 101 bins y cabeza de tendencia de 3 clases |
| Parámetros totales | no disponible (modelo base de 4B más cabezas auxiliares) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 4.000 millones de parámetros, sobre el que se añaden dos cabezas: una de regresión/clasificación de progreso con 101 bins discretos y otra de tendencia con tres clases. La entrada combina una instrucción textual de la tarea, la primera imagen del episodio, una imagen objetivo de otra trayectoria exitosa y cinco frames recientes muestreados a 10 Hz (el más antiguo primero). La salida es una estimación de progreso en [0, 1] y una predicción de tendencia auxiliar.

El entrenamiento se organiza en dos fases. Stage1 consiste en un preentrenamiento de 50.000 pasos. Después se realiza un entrenamiento conjunto con rollouts que combina tres señales: supervisión temporal sobre rollouts exitosos, relaciones de progreso sobre rollouts anotados con eventos y replay de datos de preentrenamiento. Este checkpoint es el paso 10.000 de un esquema total de 40.000 pasos, por lo que no representa el modelo final del artículo. El artículo describe innovaciones como el uso de relaciones de progreso entre trayectorias y la anotación de eventos para construir señales de recompensa densas, aunque los detalles completos dependen del paper.

## Capacidades

- Estimación de progreso de tarea en el rango [0, 1] a partir de observaciones visuales y descripción textual.
- Predicción de tendencia (tres clases) como señal auxiliar de evolución temporal.
- Generación de recompensa densa para RL mediante la diferencia de progreso entre pasos.
- Procesamiento de secuencias de cinco frames recientes a 10 Hz junto con imagen inicial e imagen objetivo.
- Punto de partida para fine-tuning específico por tarea (los resultados de LIBERO del paper usan modelos ajustados por suite).
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Entrenamiento por refuerzo de políticas de manipulación: el modelo proporciona recompensas densas a partir de la variación de progreso, lo que permite entrenar políticas en tareas como "poner el plátano en la taza" sin diseñar funciones de recompensa manuales.
- Fine-tuning por tarea en laboratorio: al ser el punto de partida del artículo, se puede ajustar con datos de una nueva tarea para obtener un modelo de recompensa específico, reduciendo el coste frente a entrenar desde cero.
- Evaluación de trayectorias en simulación: dado un episodio y una imagen objetivo de otra trayectoria exitosa, se puede puntuar el avance de políticas candidatas antes de desplegarlas en hardware real.
- Aprendizaje a partir de demostraciones y refuerzo offline: la señal de progreso permite filtrar o ponderar trayectorias en datasets de robótica para seleccionar las más prometedoras.
- Investigación en recompensas aprendidas: sirve como línea base reproducible para comparar métodos de estimación de progreso y relaciones entre eventos en robótica.
- Prototipado de sistemas de recompensa en robótica de manipulación con una sola cámara externa a 10 Hz, integrándose en pipelines de entrenamiento existentes una vez publicado el código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de LIBERO del artículo corresponden a modelos específicos por suite ajustados desde este checkpoint dentro de un sistema RL completo, y no a puntuaciones zero-shot de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8-9 GB para los pesos (9,1 GB de repositorio), más memoria para activaciones y procesamiento de imágenes; se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) es suficiente para inferencia en BF16.
- GPU de consumo: cabe en RTX 4090 y previsiblemente en RTX 3090 (24 GB); en GPUs de 16 GB puede requerir cuantización, que no está documentada.
- Opciones de despliegue: la librería `event2reward` con `Event2Reward.from_pretrained` (aún no publicada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Event2Reward-Qwen3.5-4B-Stage2 | 4B + cabezas | no disponible | Recompensa/progreso robótico | Apache-2.0 | Pesos en HF; código pendiente |
| Qwen3.5-4B (base) | 4B | no disponible | LLM generalista | no disponible en la información | HF |
| Otros modelos de recompensa robótica | no disponible | no disponible | Recompensa | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El progreso es una estimación aprendida, no una probabilidad de éxito: puede disminuir, subestimar una tarea completada o sobreestimar una fallida, y ningún umbral separa éxito de fracaso.
- La salida de tendencia es auxiliar y no constituye un detector de eventos validado.
- Los resultados de LIBERO del paper no son puntuaciones zero-shot de este checkpoint, sino de modelos ajustados por suite dentro de un sistema RL completo.
- La imagen objetivo debe provenir de un episodio exitoso distinto del que se evalúa; usar el propio episodio invalida la señal.
- Se requiere una única cámara externa con frames a 10 Hz; al inicio del episodio hay que repetir el primer frame.
- El código de inferencia y fine-tuning aún no está publicado, lo que limita su uso inmediato en producción.
- No se documentan sesgos, cobertura idiomática ni comportamiento fuera del dominio robótico.
- Licencia Apache-2.0 permite uso comercial, pero se deriva de Qwen3.5-4B y conviene revisar LICENSE, NOTICE y LICENSES del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-Stage2
- Artículo: https://arxiv.org/abs/2610.39212
- Página del proyecto: https://niejunnan25.github.io/Event2Reward/
- Repositorio de código (pendiente de publicación): https://github.com/niejunnan25/Event2Reward
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
