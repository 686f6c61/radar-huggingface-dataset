# niejunnan25/Event2Reward-Qwen3.5-4B-LIBERO-Object

## Resumen

Event2Reward-Qwen3.5-4B-LIBERO-Object es un modelo de recompensa para robótica desarrollado por Junnan Nie y colaboradores en el marco del trabajo "Event2Reward: Learning Robotic Rewards from Progress Relations" (arXiv:2610.39212). Se trata de un ajuste fino de Qwen3.5-4B, un transformer denso de 4.000 millones de parámetros, al que se le han añadido dos cabezas específicas: una cabeza de progreso de 101 bins y una cabeza de tendencia de tres clases. El modelo estima el progreso de una tarea robótica en el rango [0, 1] a partir de una descripción textual de la tarea, la primera imagen del episodio, una imagen objetivo proveniente de otra trayectoria exitosa independiente y cinco fotogramas recientes.

El problema que resuelve es la escasez de señales de recompensa densas en aprendizaje por refuerzo para manipulación robótica. En lugar de depender de recompensas binarias de éxito o de funciones de recompensa diseñadas a mano, el modelo produce una estimación continua de progreso cuya variación entre pasos constituye una recompensa densa utilizable directamente por algoritmos de RL. Esta versión concreta está especializada en el benchmark LIBERO-Object, un conjunto de tareas de manipulación de objetos.

El modelo es relevante porque demuestra que un LLM multimodal de tamaño medio (4B) puede reutilizarse como estimador de progreso visual-temporal mediante supervisión temporal sobre demostraciones exitosas y relaciones de progreso sobre rollouts anotados con eventos. El checkpoint se distribuye en BF16 con licencia Apache-2.0, lo que facilita su integración en pipelines de investigación y su uso comercial, aunque su valor práctico está ligado al sistema completo de RL descrito en el paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B) con cabeza de progreso de 101 bins y cabeza de tendencia de tres clases |
| Parametros totales | 4.000 millones (aproximado, heredado de Qwen3.5-4B; no se detalla el recuento exacto tras añadir las cabezas) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16) |
| Idiomas soportados | no disponible (la tarea se especifica en lenguaje natural; no se documentan idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso, y le añade dos cabezas de predicción: una cabeza de progreso con 101 bins que discretiza la estimación de avance en [0, 1] y una cabeza de tendencia de tres clases que actúa como señal auxiliar. La entrada combina la descripción textual de la tarea, la imagen inicial del episodio, una imagen objetivo de otra trayectoria exitosa y cinco fotogramas recientes muestreados a 10 Hz; el modelo procesa conjuntamente estas modalidades para producir la estimación de progreso.

El entrenamiento se realizó en dos etapas: primero una etapa Stage2 (niejunnan25/Event2Reward-Qwen3.5-4B-Stage2) y después un ajuste fino específico sobre LIBERO-Object durante 500 pasos. La supervisión combina dos señales: supervisión temporal sobre demostraciones exitosas y relaciones de progreso sobre rollouts anotados con eventos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Estimación de progreso de tareas robóticas en el rango [0, 1] a partir de observaciones visuales y una descripción textual de la tarea.
- Generación de recompensa densa mediante la diferencia de progreso entre pasos consecutivos, apta para algoritmos de RL.
- Predicción auxiliar de tendencia (tres clases) como señal complementaria, no validada como detector de eventos.
- Procesamiento conjunto de texto e imágenes: descripción de tarea, imagen inicial, imagen objetivo y cinco fotogramas recientes.
- Inferencia por lotes y por trayectorias completas mediante la librería `event2reward` y su interfaz de línea de comandos.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni audio en la información disponible.

## Casos de uso

- Entrenamiento de políticas de manipulación con RL: el modelo proporciona recompensas densas paso a paso que sustituyen a funciones de recompensa diseñadas a mano; en el paper, SAC residual con esta recompensa alcanza un 72,16 ± 2,97 % de éxito en LIBERO-Object.
- Evaluación de rollouts en investigación: dado un episodio y una imagen objetivo de otra trayectoria exitosa, el modelo estima el avance de la tarea para comparar políticas o detectar estancamientos.
- Aprendizaje por refuerzo con recompensa aprendida en entornos de manipulación de objetos: la variación de progreso entre fotogramas a 10 Hz sirve como señal de recompensa escalar compatible con algoritmos de actor-crítico.
- Análisis de demostraciones humanas: el modelo puntúa la progresión de trayectorias teleoperadas para filtrar o ponderar datos de entrenamiento.
- Investigación en recompensas aprendidas: sirve como componente de referencia para comparar métodos de estimación de progreso basados en relaciones entre eventos.
- Prototipado de sistemas de recompensa visual-temporal: la API de `event2reward` permite integrar la inferencia en bucles de simulación o en pipelines de experimentación con lotes de observaciones.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| LIBERO-Object (éxito de política) | 72,16 ± 2,97 % | SAC residual con la recompensa del modelo; media ± desviación típica sobre cinco semillas |

El resultado corresponde al sistema completo de RL descrito en el paper, no al checkpoint aislado. No se han publicado en la información disponible resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8-9 GB solo para los pesos (el repositorio ocupa 9,1 GB), más memoria para activaciones y procesamiento de imágenes; se recomienda al menos 16 GB de VRAM para inferencia cómoda.
- GPU recomendadas: A100, H100 o L40S para inferencia por lotes y trayectorias completas; RTX 4090 (24 GB) es suficiente para inferencia en BF16.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB); en GPU con 12-16 GB requeriría cuantización, no documentada en la información disponible.
- Opciones de despliegue: la librería oficial `event2reward` (con interfaz Python y línea de comandos); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Event2Reward-Qwen3.5-4B-LIBERO-Object | ~4B | no disponible | Recompensa por estimación de progreso (LIBERO-Object) | Apache-2.0 | HuggingFace |
| Event2Reward-Qwen3.5-4B-Stage2 | ~4B | no disponible | Etapa intermedia del mismo pipeline | Apache-2.0 | HuggingFace |
| Qwen3.5-4B | 4B | no disponible | LLM multimodal base | no disponible en la información | HuggingFace |

No se dispone en la información proporcionada de otros modelos de recompensa robótica comparables con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El progreso es una estimación aprendida, no una probabilidad de éxito: puede disminuir, subestimar una tarea completada o sobreestimar una fallida, y ningún umbral separa éxito de fracaso.
- La salida de tendencia es auxiliar y no constituye un detector de eventos validado.
- El objetivo debe provenir de un episodio exitoso independiente y nunca del episodio que se está puntuando; usar el propio episodio invalida la estimación.
- Los fotogramas deben provenir de una única cámara externa muestreada a 10 Hz; al inicio del episodio hay que repetir el primer fotograma.
- El rendimiento reportado (72,16 % en LIBERO-Object) corresponde al sistema completo de RL, no al checkpoint aislado.
- No se documentan sesgos conocidos, limitaciones de idioma ni riesgos de alucinación específicos; al ser un modelo derivado de un LLM, puede heredar sesgos del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero se debe consultar LICENSE, NOTICE y LICENSES del repositorio por las dependencias derivadas de Qwen3.5-4B.
- No se documentan requisitos de cuantización ni soporte para frameworks de despliegue estándar, lo que limita su uso fuera de la librería oficial.

## Enlaces

- HuggingFace: https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-LIBERO-Object
- Modelo base (Stage2): https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-Stage2
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2610.39212
- Página del proyecto: https://niejunnan25.github.io/Event2Reward/
- Código: https://github.com/niejunnan25/Event2Reward
- Guía de inferencia: https://github.com/niejunnan25/Event2Reward/blob/main/docs/inference.md
- Guía de entrenamiento (LIBERO): https://github.com/niejunnan25/Event2Reward/blob/main/docs/training.md#libero
