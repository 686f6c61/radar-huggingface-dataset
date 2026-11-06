# niejunnan25/Event2Reward-Qwen3.5-4B-LIBERO-Spatial

## Resumen

Event2Reward-Qwen3.5-4B-LIBERO-Spatial es un modelo de recompensa para robótica desarrollado por Junnan Nie (niejunnan25) en el marco del trabajo Event2Reward: Learning Robotic Rewards from Progress Relations. Se trata de un ajuste fino de Qwen3.5-4B que, dada una descripción de tarea, la imagen inicial de un episodio, una imagen objetivo procedente de otra trayectoria exitosa independiente y cinco fotogramas recientes, estima el progreso de la tarea en el rango [0, 1]. La variación de esa estimación entre pasos se utiliza como recompensa densa para aprendizaje por refuerzo.

Este checkpoint concreto está especializado en el entorno LIBERO-Spatial, uno de los conjuntos de manipulación de la suite LIBERO. Sobre el modelo base se añaden dos cabezas: una cabeza de progreso de 101 bins y una cabeza de tendencia de tres clases, todo en BF16. El modelo se entrenó durante 500 pasos sobre LIBERO-Spatial con supervisión temporal en demostraciones exitosas y relaciones de progreso en rollouts anotados con eventos.

Su relevancia radica en que aborda uno de los cuellos de botella clásicos del RL robótico: la escasez de señales de recompensa. En lugar de depender de una función de recompensa manual o de un clasificador binario de éxito, el modelo produce una señal continua y densa a partir de relaciones de progreso aprendidas, lo que en el artículo original permite que un sistema de SAC residual alcance un 46,92 ± 6,94 % de éxito de política en LIBERO-Spatial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con cabeza de progreso de 101 bins y cabeza de tendencia de 3 clases |
| Parámetros totales | 4B (heredados del modelo base Qwen3.5-4B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (único formato documentado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Librería | event2reward |
| Tamaño del repositorio | 9,1 GB |
| Entorno de especialización | LIBERO-Spatial |
| Entrada | Descripción de tarea, imagen inicial, imagen objetivo (de otra trayectoria exitosa) y 5 fotogramas recientes a 10 Hz |
| Salida | Progreso en [0, 1] y tendencia (3 clases) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 4B parámetros, y le añade dos cabezas específicas para la tarea: una cabeza de progreso que discretiza la estimación en 101 bins sobre el intervalo [0, 1] y una cabeza de tendencia de tres clases que actúa como señal auxiliar. La entrada combina información textual (la descripción de la tarea) con información visual en dos escalas temporales: una imagen de inicio del episodio, una imagen objetivo procedente de una trayectoria exitosa independiente y cinco fotogramas recientes muestreados a 10 Hz. Esta formulación obliga al modelo a razonar sobre la relación entre el estado actual y el estado final deseado, no solo sobre el estado actual.

El entrenamiento se realizó en dos etapas: primero un modelo Stage2 (niejunnan25/Event2Reward-Qwen3.5-4B-Stage2) y después un ajuste fino de 500 pasos sobre LIBERO-Spatial. La supervisión combina señales temporales sobre demostraciones exitosas con relaciones de progreso sobre rollouts anotados con eventos. El objetivo del artículo es aprender recompensas a partir de relaciones de progreso, de modo que la variación del progreso estimado entre pasos consecutivos funcione como recompensa densa para RL. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Estimación de progreso de tarea en el rango [0, 1] a partir de observaciones visuales y una descripción textual de la tarea.
- Cálculo de recompensa densa por diferencia de progreso entre pasos consecutivos, apta para algoritmos de RL.
- Procesamiento multimodal: combina texto (descripción de tarea) e imágenes (inicio, objetivo y cinco fotogramas recientes).
- Salida auxiliar de tendencia en tres clases, pensada como señal complementaria.
- Manejo de una imagen objetivo procedente de una trayectoria exitosa independiente, lo que evita depender de la trayectoria que se está evaluando.
- Inferencia por lotes y por trayectorias completas, según la guía de inferencia del proyecto.
- Interfaz de línea de comandos además de la API de Python.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Entrenamiento por refuerzo de políticas de manipulación en LIBERO-Spatial: el modelo proporciona la recompensa densa que alimenta un algoritmo como SAC residual; en el artículo, el sistema completo alcanza un 46,92 ± 6,94 % de éxito de política sobre cinco semillas.
- Evaluación automática de rollouts en laboratorio: dado un episodio grabado, se puede calcular la curva de progreso estimado para detectar estancamientos o retrocesos sin anotación humana.
- Filtrado de datos para imitación: usar el progreso estimado para descartar trayectorias que no avanzan de forma monótona hacia el objetivo antes de incorporarlas a un dataset de aprendizaje por imitación.
- Recompensas intermedias en entornos con recompensa escasa: sustituir una recompensa binaria de éxito por una señal continua que permita al agente aprender de episodios fallidos parcialmente exitosos.
- Comparación de políticas candidatas: puntuar con el mismo modelo de recompensa varias políticas entrenadas y ordenarlas por progreso medio estimado en un conjunto fijo de tareas.
- Investigación en aprendizaje de recompensas: el checkpoint sirve como punto de partida para reproducir o extender los experimentos de Event2Reward en otros entornos de manipulación.
- Monitorización en tiempo de ejecución: alimentar los cinco fotogramas recientes a 10 Hz para obtener una estimación de progreso en línea que active intervenciones o paradas de seguridad cuando el progreso se estanca.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Éxito de política en LIBERO-Spatial | 46,92 ± 6,94 % | Media ± desviación estándar sobre cinco semillas; resultado del sistema RL completo (SAC residual con esta recompensa), no del checkpoint aislado |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- El repositorio ocupa 9,1 GB en safetensors, lo que corresponde a pesos en BF16 de un modelo de 4B parámetros más las cabezas.
- Para inferencia en BF16 se estima un consumo de VRAM en torno a 9-10 GB solo para pesos, más el coste de activaciones y del codificador visual; una GPU con 16 GB o más es un punto de partida razonable.
- GPU recomendadas: A100, H100 o L40S para despliegue por lotes; RTX 4090 (24 GB) y RTX A6000 (48 GB) son adecuadas para inferencia en BF16.
- En GPUs de consumo con menos VRAM sería necesario recurrir a cuantización, pero la model card solo documenta BF16; no se confirma soporte de GGUF, AWQ ni GPTQ.
- Opciones de despliegue: la librería event2reward del proyecto (API de Python y CLI). No se documenta soporte explícito para vLLM, TGI, llama.cpp u Ollama.
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Event2Reward-Qwen3.5-4B-LIBERO-Spatial | 4B | no disponible | Recompensa y progreso en LIBERO-Spatial | Apache-2.0 | Hugging Face |
| Event2Reward-Qwen3.5-4B-Stage2 | 4B | no disponible | Modelo base del ajuste, previo a la especialización por entorno | Apache-2.0 | Hugging Face |
| Qwen3.5-4B | 4B | no disponible | Modelo de lenguaje general | no disponible | Hugging Face |

No se dispone de información sobre otros modelos de recompensa robótica comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El progreso es una estimación aprendida, no una probabilidad de éxito: puede disminuir, subestimar una tarea completada o sobreestimar una tarea fallida.
- No existe un umbral que separe éxito de fracaso a partir de la salida de progreso.
- La salida de tendencia es auxiliar y no constituye un detector de eventos validado.
- El modelo está especializado en LIBERO-Spatial; su uso en otros entornos o morfologías de robot no está validado.
- La imagen objetivo debe proceder de una trayectoria exitosa independiente y nunca del episodio que se está puntuando; incumplir esta regla invalida la estimación.
- Los fotogramas deben provenir de una única cámara externa muestreada a 10 Hz; al inicio del episodio hay que repetir el primer fotograma.
- El resultado de éxito del 46,92 % corresponde al sistema RL completo, no al checkpoint de forma aislada.
- No se documentan sesgos conocidos ni comportamiento multilingüe; los idiomas soportados figuran como no disponibles.
- Licencia Apache-2.0, derivada de Qwen3.5-4B: conviene revisar LICENSE, NOTICE y LICENSES del repositorio antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-LIBERO-Spatial
- Modelo base (Stage2): https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-Stage2
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Artículo: https://arxiv.org/abs/2610.39212
- Página del proyecto: https://niejunnan25.github.io/Event2Reward/
- Código: https://github.com/niejunnan25/Event2Reward
- Guía de inferencia: https://github.com/niejunnan25/Event2Reward/blob/main/docs/inference.md
- Guía de entrenamiento (LIBERO): https://github.com/niejunnan25/Event2Reward/blob/main/docs/training.md#libero
- Instalación del paquete: https://github.com/niejunnan25/Event2Reward#installation
