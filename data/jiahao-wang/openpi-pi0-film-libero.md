# Jiahao-Wang/openpi-pi0-film-libero

## Resumen

El modelo `Jiahao-Wang/openpi-pi0-film-libero` es un conjunto de cuatro checkpoints de PyTorch resultantes del fine-tuning completo del modelo π0 (pi-zero) de Physical Intelligence, con condicionamiento FiLM (Feature-wise Linear Modulation), sobre el benchmark de robótica LIBERO. π0 es un modelo fundacional de visión-lenguaje-acción (VLA) de tipo flow-based que procesa simultáneamente observaciones visuales, instrucciones en lenguaje natural y genera acciones de control para robots. Este repositorio, publicado por Jiahao-Wang, proporciona los pesos entrenados para las cuatro suites de LIBERO: LIBERO-10, LIBERO-Goal, LIBERO-Spatial y LIBERO-Object, con diferentes números de pasos de entrenamiento (25 000 o 50 000).

La relevancia de este modelo radica en que permite a la comunidad investigadora evaluar y comparar políticas robóticas en tareas de manipulación de largo horizonte sin necesidad de entrenar desde cero. Al estar basado en OpenPI, la implementación open source de Physical Intelligence, los checkpoints son directamente cargables con las configuraciones de política correspondientes. El repositorio tiene un tamaño de 29.1 GB y contiene únicamente los archivos `model.safetensors` y `metadata.pt` necesarios para la inferencia, omitiendo estados de optimizador y checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0 (flow-based Vision-Language-Action) con condicionamiento FiLM |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (instrucciones en ingles, presumiblemente) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors) y metadata.pt |

## Arquitectura y entrenamiento

π0 es un modelo de flujo (flow matching) que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones. El condicionamiento FiLM permite inyectar información de la tarea (por ejemplo, la instrucción en lenguaje) en las capas del modelo de forma modulada. En este repositorio se realizó un fine-tuning completo (full fine-tuning) sobre los pesos base de π0, utilizando las tareas de LIBERO. Cada suite se entrenó con un número específico de pasos: 25 000 para LIBERO-10 y LIBERO-Goal, y 50 000 para LIBERO-Spatial y LIBERO-Object. No se proporcionan detalles sobre el dataset de entrenamiento, la composición de los datos ni el uso de técnicas como RLHF o DPO. Los checkpoints se cargan mediante las configuraciones de política de OpenPI, cuyos nombres son `pi0_libero_10_full_film_pytorch`, `pi0_libero_goal_full_film_pytorch`, `pi0_libero_spatial_full_film_pytorch` y `pi0_libero_object_full_film_pytorch`.

## Capacidades

- Control robótico de manipulación: genera acciones de control (posiciones, fuerzas, etc.) a partir de observaciones visuales e instrucciones en lenguaje.
- Razonamiento visión-lenguaje-acción: integra información visual y textual para decidir la siguiente acción.
- Ejecución de tareas de largo horizonte: entrenado en LIBERO, que incluye tareas con múltiples pasos y dependencias espaciales y de objetos.
- Soporte de múltiples suites de evaluación: LIBERO-10, Goal, Spatial y Object, cada una con características específicas.
- Compatibilidad con OpenPI: los pesos se cargan directamente con las configuraciones de política de la librería openpi.
- No se documentan capacidades de tool calling, agentes, ni modos de pensamiento explícitos.

## Casos de uso

- Evaluación de políticas robóticas en investigación: los checkpoints permiten reproducir resultados de fine-tuning de π0 en LIBERO y comparar con otros métodos, sirviendo como línea base para estudios de generalización.
- Desarrollo de sistemas de manipulación en entornos simulados: se puede integrar en simuladores como MuJoCo o Isaac Gym para probar tareas de LIBERO antes de transferir a robots reales.
- Benchmarking de modelos VLA: al ser un checkpoint de π0 con FiLM, es útil para medir el impacto del condicionamiento FiLM frente a otras variantes (por ejemplo, sin FiLM o con otros mecanismos).
- Fine-tuning posterior para tareas específicas: los pesos pueden servir como punto de partida para adaptar el modelo a nuevas tareas robóticas mediante fine-tuning adicional.
- Estudio de transferencia entre suites de LIBERO: al disponer de cuatro checkpoints entrenados en distintas suites, se pueden analizar diferencias de comportamiento y transferibilidad entre tareas.
- Reproducibilidad de experimentos: al incluir solo los archivos necesarios, facilita la replicación de experimentos publicados que usan π0 con FiLM en LIBERO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de éxito, tasas de finalización ni comparaciones con otros modelos en la model card. Se recomienda consultar el repositorio de OpenPI o el paper original de π0 para obtener datos de rendimiento.

## Requisitos de hardware

- El tamaño del repositorio es de 29.1 GB, lo que sugiere que los pesos completos en precisión FP32 o BF16 requieren al menos esa cantidad de VRAM para cargar el modelo en memoria.
- No se especifican GPUs recomendadas ni requisitos mínimos. Dado que π0 es un modelo de gran tamaño (típicamente varios miles de millones de parámetros), se necesitaría una GPU de alta gama como A100 (40/80 GB) o H100 para inferencia en precisión completa.
- Para cuantizaciones (por ejemplo, GGUF o AWQ) no hay información disponible; el repositorio solo ofrece safetensors.
- Opciones de despliegue: se puede usar con la librería openpi, que soporta inferencia en PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de lenguaje puro.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otros checkpoints de π0 fine-tuneados en LIBERO, como `lerobot/pi0_libero_base` (de LeRobot) y `Fisher-Wang/pi0-libero-pytorch`. Sin embargo, no se dispone de datos comparativos de rendimiento ni de especificaciones detalladas de estos modelos en la información proporcionada. La siguiente tabla resume lo conocido:

| Modelo | Repositorio | Arquitectura | Condicionamiento | Suites LIBERO | Formato |
|---|---|---|---|---|---|
| openpi-pi0-film-libero (este) | Jiahao-Wang/openpi-pi0-film-libero | π0 flow-based | FiLM | 10, Goal, Spatial, Object | safetensors |
| pi0_libero_base | lerobot/pi0_libero_base | π0 | no especificado | no especificado | no disponible |
| pi0-libero-pytorch | Fisher-Wang/pi0-libero-pytorch | π0 | no especificado | LIBERO (convención IO) | no disponible |

No se puede realizar una comparación cuantitativa por falta de datos.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo de robótica, su salida son acciones de control, no texto libre, por lo que el riesgo de alucinación se manifiesta en acciones incorrectas.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Se debe contactar al autor o consultar la licencia de π0 original (que suele ser de uso no comercial en algunos casos).
- El modelo está entrenado específicamente para LIBERO; su generalización a otros entornos o robots no está garantizada.
- Los checkpoints no incluyen estados de optimizador ni logs de entrenamiento, lo que limita la reproducibilidad completa del proceso de fine-tuning.
- No se proporcionan norm_stats (estadísticas de normalización) en este repositorio, a diferencia de otros checkpoints como el de Fisher-Wang, lo que puede requerir calcularlas o usar las de OpenPI.
- El tamaño de 29.1 GB implica que no es adecuado para hardware de consumo sin cuantización o técnicas de offloading.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jiahao-Wang/openpi-pi0-film-libero
- Repositorio OpenPI (GitHub): https://github.com/Physical-Intelligence/openpi
- Documentación de ejemplo de LIBERO en OpenPI: https://github.com/Physical-Intelligence/openpi/blob/main/examples/libero/README.md
- Checkpoint similar de LeRobot: https://huggingface.co/lerobot/pi0_libero_base
- Checkpoint similar de Fisher-Wang: https://huggingface.co/Fisher-Wang/pi0-libero-pytorch
