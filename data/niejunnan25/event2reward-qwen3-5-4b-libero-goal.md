# niejunnan25/Event2Reward-Qwen3.5-4B-LIBERO-Goal

## Resumen

Event2Reward-Qwen3.5-4B-LIBERO-Goal es un modelo de recompensa para robótica desarrollado por Junnan Nie y colaboradores en el marco del trabajo Event2Reward: Learning Robotic Rewards from Progress Relations (arXiv:2610.39212). Se trata de un ajuste fino del checkpoint Stage2 (niejunnan25/Event2Reward-Qwen3.5-4B-Stage2), que a su vez parte de Qwen3.5-4B, especializado en estimar el progreso de una tarea de manipulación robótica a partir de imágenes.

El modelo recibe una descripción textual de la tarea, la primera imagen del episodio, una imagen objetivo procedente de otra trayectoria exitosa independiente y cinco fotogramas recientes muestreados a 10 Hz. Con esa entrada produce una estimación de progreso en el intervalo [0, 1]; la variación de dicha estimación se emplea como recompensa densa para aprendizaje por refuerzo. Esta ficha corresponde específicamente a la variante entrenada sobre el benchmark LIBERO-Goal.

La relevancia del modelo reside en que evita depender de recompensas dispersas o de funciones de recompensa diseñadas a mano: la supervisión se construye a partir de relaciones de progreso entre trayectorias. En el artículo, un sistema de RL (SAC residual) que utiliza esta recompensa alcanza un 76,32 ± 3,57 % de éxito de política en LIBERO-Goal (media ± desviación típica sobre cinco semillas), si bien ese resultado corresponde al sistema completo de RL y no al checkpoint por sí solo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con cabeza de progreso de 101 bins y cabeza de tendencia de tres clases |
| Parametros totales | 4B (modelo base Qwen3.5-4B; el número exacto de parámetros del checkpoint no se detalla en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 9,1 GB |
| Pipeline | robotics |
| Libreria | event2reward |
| Modelo base | niejunnan25/Event2Reward-Qwen3.5-4B-Stage2 |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-4B, un transformer de 4B parámetros, al que se añaden dos cabezas: una cabeza de progreso con 101 bins que discretiza la estimación de avance en [0, 1], y una cabeza auxiliar de tendencia de tres clases. El checkpoint se distribuye en BF16 y emplea la librería event2reward para la carga e inferencia.

El ajuste fino se realizó desde el checkpoint Stage2 sobre LIBERO-Goal durante 500 pasos. La supervisión combina dos señales: supervisión temporal sobre demostraciones exitosas y relaciones de progreso sobre rollouts anotados con eventos. La entrada del modelo es multimodal en el sentido de que combina texto (descripción de la tarea) e imágenes (inicio, objetivo y cinco fotogramas recientes a 10 Hz, del más antiguo al más reciente). No se detalla en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset más allá de LIBERO-Goal.

## Capacidades

- Estimación de progreso de tareas robóticas: devuelve un valor de progreso en [0, 1] dada una descripción de tarea, imagen de inicio, imagen objetivo de otra trayectoria exitosa y cinco fotogramas recientes.
- Generación de recompensa densa: la diferencia entre estimaciones de progreso sucesivas sirve como recompensa para RL.
- Clasificación de tendencia: cabeza auxiliar de tres clases que aporta una señal complementaria sobre la evolución del progreso.
- Procesamiento multimodal texto-imagen: combina instrucción en lenguaje natural con observaciones visuales.
- Inferencia por lotes: la API permite pasar una lista de observaciones a `predict`.
- Uso mediante línea de comandos, según la guía de inferencia del repositorio.
- No se documentan en la información disponible capacidades de tool calling, agentes, matemáticas, código ni audio.

## Casos de uso

- Entrenamiento por refuerzo de políticas de manipulación: el modelo proporciona recompensas densas a partir de la variación del progreso estimado, lo que permite entrenar con SAC residual u otros algoritmos en entornos como LIBERO-Goal sin diseñar funciones de recompensa manuales.
- Evaluación automática de rollouts: dado un episodio y una imagen objetivo de referencia, se puede estimar el avance de la política para detectar estancamientos o regresiones durante la evaluación.
- Filtrado de datos de demostración: las estimaciones de progreso permiten ordenar o descartar trayectorias según su avance aparente antes de reutilizarlas en entrenamiento.
- Señal de parada o de reinicio en control robótico: la tendencia estimada puede emplearse como heurística auxiliar para decidir si continuar, replanificar o abortar una ejecución.
- Investigación en aprendizaje de recompensas: sirve como punto de partida (fine-tuning desde Stage2) para adaptar el modelo a nuevos dominios de manipulación con pocos pasos de ajuste.
- Análisis comparativo de políticas: al puntuar episodios de distintas políticas con la misma referencia de objetivo, se obtiene una medida homogénea de progreso para compararlas.
- Integración en pipelines de investigación en robótica: la API por lotes y la interfaz de línea de comandos facilitan el procesamiento masivo de episodios almacenados.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Contexto |
|---|---|---|---|
| LIBERO-Goal | Éxito de política con SAC residual y esta recompensa | 76,32 ± 3,57 % | Media ± desviación típica sobre cinco semillas; resultado del sistema completo de RL, no del checkpoint aislado |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- El repositorio ocupa 9,1 GB, lo que corresponde aproximadamente a los pesos en BF16 de un modelo de 4B parámetros; se requiere VRAM suficiente para cargar los pesos completos más el overhead de inferencia.
- VRAM estimada para inferencia en BF16: en torno a 9-10 GB solo para pesos, más memoria para activaciones y procesamiento de imágenes; el valor exacto no está disponible.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, una GPU con al menos 16 GB de VRAM en BF16 sería el mínimo razonable, aunque esto es una estimación y no un dato del autor.
- Cabe en GPU de consumo: no confirmado en la información disponible; depende de la cuantización, que no se documenta.
- Opciones de despliegue: la librería event2reward (carga mediante `Event2Reward.from_pretrained`) y su interfaz de línea de comandos; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Event2Reward-Qwen3.5-4B-LIBERO-Goal | 4B (base Qwen3.5-4B) | no disponible | Recompensa / progreso en LIBERO-Goal | Apache-2.0 | HuggingFace |
| Event2Reward-Qwen3.5-4B-Stage2 | 4B (base Qwen3.5-4B) | no disponible | Etapa intermedia del mismo pipeline | Apache-2.0 (según modelo base) | HuggingFace |
| Qwen3.5-4B | 4B | no disponible | Modelo de lenguaje general | no disponible en la información | HuggingFace |

No se dispone en la información proporcionada de otros modelos de recompensa robótica comparables con datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El progreso es una estimación aprendida, no una probabilidad de éxito: puede disminuir, subestimar una tarea completada o sobreestimar una fallida.
- No existe un umbral que separe éxito de fracaso a partir de la salida de progreso.
- La salida de tendencia es auxiliar y no constituye un detector de eventos validado.
- La imagen objetivo debe provenir de una trayectoria exitosa independiente y nunca del episodio que se está puntuando; incumplir esta regla invalida la señal.
- Los fotogramas deben proceder de una única cámara externa a 10 Hz; al inicio del episodio hay que repetir el primer fotograma.
- El modelo está ajustado específicamente sobre LIBERO-Goal; su generalización a otros dominios no está documentada en la información disponible.
- El resultado de 76,32 % corresponde al sistema completo de RL con esta recompensa, no al checkpoint evaluado de forma aislada.
- No se documentan sesgos conocidos, riesgos de alucinación en el sentido de los LLM ni restricciones adicionales de la licencia Apache-2.0 más allá de las habituales; el modelo deriva de Qwen3.5-4B, por lo que se aplican también las condiciones indicadas en LICENSE, NOTICE y LICENSES del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-LIBERO-Goal
- Modelo base (Stage2): https://huggingface.co/niejunnan25/Event2Reward-Qwen3.5-4B-Stage2
- Modelo Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Artículo: https://arxiv.org/abs/2610.39212
- Página del proyecto: https://niejunnan25.github.io/Event2Reward/
- Código: https://github.com/niejunnan25/Event2Reward
- Guía de inferencia: https://github.com/niejunnan25/Event2Reward/blob/main/docs/inference.md
- Guía de entrenamiento (LIBERO): https://github.com/niejunnan25/Event2Reward/blob/main/docs/training.md#libero
- Instalación: https://github.com/niejunnan25/Event2Reward#installation
