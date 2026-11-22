# Hannibal52Barca/Pi_atlas_KI

## Resumen

Pi_atlas_KI es un modelo vision-language-action (VLA) derivado de la familia pi0.5 de openpi, publicado por el usuario Hannibal52Barca. Está diseñado para control robótico bimanual del robot YOR y su innovación principal es que, además de predecir acciones, predice un valor (value) asociado a cada subtarea: la salida del backbone incluye el texto de la subtarea, un token de valor con una cabeza de 201 bins y un chunk de acciones en tokens FAST. El modelo se inicializa desde el checkpoint `pi05_base` de openpi y se entrena sobre el dataset Pi-Atlas-Full.

El repositorio contiene dos variantes que difieren únicamente en el uso de *knowledge insulation* (KI, Driess et al. 2025): en `ki/` el experto de acciones lee el backbone a través de un stop-gradient, de modo que la pérdida de flow no entrena el backbone; en `noki/` se aplica entrenamiento conjunto. Ambas variantes se entrenaron 10 000 pasos con batch 64, semilla 0 y 2 GPUs con FSDP. El autor reporta resultados del value head sobre un holdout, pero advierte explícitamente que las acciones no se han evaluado en el robot real.

El modelo es relevante para investigación en robótica porque explora la combinación de predicción de valor (inspirada en value functions de RL) con un VLA de flow matching, y porque publica una comparación controlada del efecto de knowledge insulation sobre la calidad del value head. El tamaño del repositorio es de 24,9 GB y la licencia efectiva es la de Gemma, al heredar los pesos de `pi05_base`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (backbone transformer vision-language) + experto de acciones con flow matching |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use + licencia de openpi) |
| Formato de pesos | checkpoint openpi/Orbax (`params/`, `assets/`, `_CHECKPOINT_METADATA`) |

## Arquitectura y entrenamiento

El backbone, inicializado desde `pi05_base`, genera secuencialmente tres salidas: la subtarea como texto (`Subtask: <subtask>;`), un slot de valor con un token aprendido y una cabeza de 201 bins, y el chunk de acciones codificado como tokens FAST. Un experto de acciones con flow matching atiende a las imágenes, al prompt y a la subtarea para producir las acciones continuas. Los tokens de acción no atienden al slot de valor, de forma que la predicción de valor no contamina la generación de acciones. El target del value head es el terminal de RECAP por episodio de subtarea: −(pasos hasta el final)/longitud máxima, y −1 en caso de fallo.

Durante el entrenamiento, el 5 % de las muestras reciben una subtarea incorrecta; en esos casos se enmascaran las pérdidas de subtarea y acción y se fija el target de valor a −1, lo que fuerza al modelo a detectar inconsistencias entre subtarea y observación. Las dos variantes se entrenaron 10 000 pasos con batch 64, semilla 0 y 2 GPUs con FSDP: en `ki/` el experto lee el backbone mediante stop-gradient (la pérdida de flow no entrena el backbone), mientras que en `noki/` el entrenamiento es conjunto. Los checkpoints publicados omiten el estado del optimizador y se acompañan de las norm-stats en `assets/`.

## Capacidades

- Predicción de acciones continuas bimanuales para el robot YOR mediante un experto de flow matching.
- Generación de la subtarea en texto antes de la acción, lo que permite interpretar la intención del modelo.
- Predicción de valor escalar (201 bins) que estima el progreso restante hacia el final de la subtarea.
- Codificación de acciones en tokens FAST.
- Detección implícita de subtareas incorrectas gracias a la estrategia de enmascaramiento del 5 % de muestras.
- Procesamiento de observaciones visuales junto con prompt y subtarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio más allá del pipeline robótico: no disponible.

## Casos de uso

- Investigación en value functions para robótica: el value head permite estimar el progreso de una subtarea y podría usarse como señal de recompensa o de critic en pipelines de RL, gracias a su salida de 201 bins calibrada contra el terminal de RECAP.
- Control bimanual del robot YOR: el experto de flow matching genera chunks de acciones continuas condicionados por imágenes, prompt y subtarea, lo que permite ejecutar tareas de manipulación de dos brazos.
- Detección de fallos y subtareas mal especificadas: la estrategia de entrenamiento con subtareas erróneas y target de valor −1 permite usar el valor predicho como detector de inconsistencias entre instrucción y observación.
- Estudio comparativo de knowledge insulation: las dos variantes `ki/` y `noki/` permiten reproducir el experimento de Driess et al. 2025 sobre el efecto del stop-gradient en la calidad del value head y del backbone.
- Segmentación de episodios por subtarea: la salida textual de subtarea facilita la anotación automática y el análisis de trayectorias largas divididas en fases.
- Base para fine-tuning en nuevos robots o tareas: al ser un checkpoint openpi/Orbax con configuraciones en `src/openpi/training/config.py`, puede adaptarse a otros datasets LeRobot siguiendo el flujo de openpi.
- Evaluación offline de políticas: el value head y la subtarea permiten puntuar trayectorias grabadas sin necesidad de ejecutar el robot, útil para filtrar datos antes de entrenar.

## Benchmarks y rendimiento

Resultados del value head sobre holdout, según la model card del autor. "Old" corresponde a 28 episodios (10 de red chili, 18 de vueltas de eggplant) y "New" a 126 episodios de todas las tareas. El AUROC de subtarea incorrecta mide la separación entre el valor bajo la subtarea verdadera y bajo una subtarea errónea, sobre el holdout nuevo.

| Modelo | Old MAE | Old Pearson | Old Spearman | New MAE | New Pearson | New Spearman | Wrong-subtask AUROC |
|---|---|---|---|---|---|---|---|
| ki | 0,056 | 0,830 | 0,804 | 0,125 | 0,627 | 0,755 | 0,914 |
| noki | 0,061 | 0,789 | 0,794 | 0,154 | 0,583 | 0,735 | 0,896 |

El autor indica explícitamente que las acciones no se han evaluado en el robot. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 24,9 GB en formato Orbax, lo que da una idea del orden de magnitud de los pesos sin cuantizar.
- GPU recomendadas: el entrenamiento se realizó con 2 GPUs y FSDP; no se especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi (restauración de parámetros vía `openpi.models.model.restore_params` y configuraciones de `openpi.training.config`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este pipeline robótico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Value head | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pi_atlas_KI | VLA pi0.5 con value head | no disponible | no disponible | Sí (201 bins) | gemma | Hugging Face (openpi/Orbax) |
| pi05_base (openpi) | VLA pi0.5 base | no disponible | no disponible | No | openpi / Gemma | openpi |
| Otras variantes pi0.5 de la comunidad | VLA pi0.5 | no disponible | no disponible | No disponible | según autor | Hugging Face |

No se dispone de datos de benchmarks comparables con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Las acciones no se han evaluado en el robot real; solo se han medido métricas del value head sobre holdout.
- El rendimiento del value head cae de forma notable entre el holdout antiguo y el nuevo (MAE de 0,056 a 0,125 en `ki`; de 0,061 a 0,154 en `noki`), lo que sugiere problemas de generalización a tareas no vistas.
- El modelo está entrenado específicamente para el robot bimanual YOR y el dataset Pi-Atlas-Full; su uso fuera de ese dominio no está validado.
- La licencia efectiva es la de Gemma (Gemma Terms of Use) más la de openpi, con las restricciones de uso comercial que ambas imponen; conviene revisarlas antes de cualquier despliegue en producción.
- No se han publicado datos sobre sesgos, tasas de alucinación en la generación de subtareas ni comportamiento multilingüe.
- Los checkpoints omiten el estado del optimizador, por lo que no permiten reanudar el entrenamiento exactamente donde se dejó.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- El modelo depende de las norm-stats en `assets/` y de rutas locales configuradas manualmente; un uso incorrecto de las estadísticas puede degradar las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hannibal52Barca/Pi_atlas_KI
- Dataset de entrenamiento: https://huggingface.co/datasets/adityx23/Pi-Atlas-Full
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- openpi (repositorio base, fork `pi_atlas`): no disponible en la información proporcionada
- Paper de knowledge insulation (Driess et al. 2025): no disponible en la información proporcionada
