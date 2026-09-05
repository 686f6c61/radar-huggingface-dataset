# robotensor/bpp-libero-genesis

## Resumen

`bpp-libero-genesis` es un checkpoint de política de comportamiento (Behavior Prompting Policy) para robótica, desarrollado por Robotensor como punto de partida de una competición de aprendizaje por imitación en contexto con una sola demostración. En realidad, no se trata de un modelo entrenado por Robotensor: es una conversión del checkpoint público `austinpatel/libero` (`libero_behavior_prompting.ckpt`) al formato `safetensors` mediante la herramienta `icilval convert-ckpt`, con el objetivo de facilitar su evaluación sin dependencias de pickle.

El modelo implementa la arquitectura `bpp_libero_v1` y, según la model card, reproduce el rendimiento publicado del checkpoint original: un 0,96 de tasa de éxito en el conjunto LIBERO-Spatial, compuesto por 10 tareas y 5 estados iniciales, con una sola demostración y sin entrada de lenguaje. Está orientado a la manipulación robótica en simulación, dentro del entorno LIBERO, y destaca por su capacidad de aprendizaje en contexto a partir de demostraciones previas.

Con aproximadamente 690 millones de parámetros, es un modelo relativamente pequeño, apto para ejecutarse en hardware modesto o en CPU. Su relevancia radica en ser un baseline publicado para la competición de aprendizaje por imitación en contexto de una demostración (ICIL), permitiendo comparar nuevos enfoques contra una referencia consolidada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bpp_libero_v1 (Behavior Prompting Policy, transformer denso para política de manipulación) |
| Parametros totales | 690.455.718 (aprox. 690 M) |
| Parametros activos | No aplica (no es MoE, arquitectura densa) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (los pesos se publican en fp32, tamaño del repo 2,8 GB) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Safetensors (`model.safetensors`) + `config.yaml`, sin pickle, solo pesos |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `bpp_libero_v1`, que se corresponde con la del Behavior Prompting Policy publicado por el grupo real-stanford. Esta arquitectura está diseñada para el aprendizaje por imitación en contexto: el modelo recibe una o varias demostraciones de una tarea, codificadas como secuencias de observaciones y acciones, y condiciona su política para generar las acciones adecuadas en nuevos episodios, sin necesidad de ajuste fino por tarea.

No se han publicado en la información disponible los detalles del proceso de entrenamiento: composición del dataset, número de tokens ni técnicas de alineación (RLHF, DPO, etc.). El checkpoint original fue entrenado por austinpatel sobre tareas del benchmark LIBERO, presumiblemente usando demostraciones de manipulación robótica y el paradigma de behavior prompting en el que el prompt es la demostración. Robotensor no participó en el entrenamiento; su aportación ha sido exclusivamente la conversión del checkpoint al formato `safetensors` para evaluación, eliminando dependencias de pickle.

El rendimiento reportado en la model card es de 0,96 de tasa de éxito en LIBERO-Spatial, con una sola demostración por tarea y sin entrada de lenguaje. No se aportan datos sobre otros conjuntos de LIBERO (Object, Goal, etc.) ni sobre generalización a otros entornos.

## Capacidades

- Genera acciones de bajo nivel para control de brazos robóticos en entornos de manipulación, condicionadas por observaciones y demostraciones.
- Realiza aprendizaje por imitación en contexto (in-context imitation learning), permitiendo adaptarse a una tarea nueva a partir de una única demostración.
- Alcanza una tasa de éxito de 0,96 en LIBERO-Spatial (10 tareas × 5 estados iniciales, una demostración por tarea).
- No requiere ajuste fino por tarea: la demostración actúa como prompt de comportamiento.
- No procesa lenguaje; su entrada es puramente visual/estado y acciones.
- No soporta tool calling ni function calling, ya que no es un modelo de lenguaje.
- No ofrece modo de razonamiento explícito ni capacidades de visión generales; su percepción está ligada a observaciones de bajo nivel del entorno LIBERO.

## Casos de uso

- Baseline en competiciones de aprendizaje por imitación en contexto: el modelo sirve como referencia pública para comparar nuevos métodos de ICIL en el benchmark LIBERO, permitiendo medir mejoras sobre el punto de partida.
- Evaluación de políticas de manipulación en simulación: puede emplearse para probar pipelines de robotic learning en entornos LIBERO, sirviendo de control en experimentos de aprendizaje con pocas demostraciones.
- Investigación en behavior prompting: útil para estudiar cómo codificar demostraciones como prompts y transferirlas a nuevas tareas de manipulación sin reentrenamiento.
- Pruebas de reproducción de resultados publicados: al ser una conversión fiel del checkpoint original, permite verificar la reproducibilidad del rendimiento de Behavior Prompting Policy en LIBERO-Spatial.
- Generación de trayectorias de demostración sintéticas: el modelo puede producir secuencias de acciones que sirvan como datos de entrenamiento para otros algoritmos de imitación o para aumentar datasets de manipulación.
- Integración en pipelines de investigación de robotica basados en PyTorch: al estar en `safetensors`, se puede cargar directamente con librerias estándar y se adapta a frameworks de evaluación como el de ICIL-competition-evaluation.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles en la información proporcionada son los siguientes:

| Benchmark | Resultado | Condiciones |
|---|---|---|
| LIBERO-Spatial | 0,96 de tasa de éxito | 10 tareas × 5 estados iniciales, una demostración, sin lenguaje |

No se han publicado resultados adicionales en la información disponible. No hay datos de MMLU, HumanEval ni otros benchmarks generales, ya que este modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: con 690 M de parámetros en fp32, la carga de pesos ocupa aproximadamente 2,8 GB. En GPU, cabría en tarjetas con 4 GB de VRAM o más, y probablemente también en 2 GB si se aplica cuantización, aunque no se ofrecen cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información publicada. Por tamaño, cualquier GPU moderna de gama media (RTX 3060, RTX 4090 o superior) sería suficiente; también es viable la ejecución en CPU para inferencia puntual.
- Ejecución en GPU de consumo: sí, es plausible. El tamaño del modelo permite su uso en tarjetas consumer con 4-8 GB de VRAM.
- Opciones de despliegue: no aplica vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje. Se recomienda cargar los pesos con PyTorch y el `config.yaml` asociado, o usar el framework de evaluación `ICIL-competition-evaluation`.
- Latencia y throughput: no disponibles. Dependen del entorno de simulación, la longitud de las observaciones y el hardware de ejecución.

## Comparativa con modelos similares

No se dispone de información suficiente en la búsqueda web para establecer una comparativa cuantitativa con modelos alternativos. El propio modelo es una conversión del checkpoint original `austinpatel/libero` (`libero_behavior_prompting.ckpt`), por lo que su rendimiento es idéntico al de esa versión. No hay datos públicos de otros modelos de la misma categoría (políticas de imitación en contexto para LIBERO) que se puedan incluir sin inventar cifras.

| Modelo | Parametros | Contexto | Rendimiento LIBERO-Spatial | Licencia |
|---|---|---|---|---|
| bpp-libero-genesis | 690 M | No disponible | 0,96 | MIT |
| austinpatel/libero (checkpoint original) | 690 M | No disponible | 0,96 (publicado) | No disponible |

## Limitaciones y advertencias

- El modelo no ha sido entrenado por Robotensor; es una conversión de un checkpoint de terceros. Cualquier resultado de rendimiento debe atribuirse al checkpoint original de austinpatel, no a un trabajo propio de Robotensor.
- Solo se ha verificado el rendimiento en LIBERO-Spatial con una demostración y sin lenguaje. No hay evidencias de buen comportamiento en otros dominios ni en entornos reales.
- No es un modelo de lenguaje: no puede generar texto, realizar razonamiento simbólico ni manejar instrucciones en lenguaje natural.
- No hay información sobre sesgos del modelo ni sobre su comportamiento ante observaciones fuera de la distribución de entrenamiento.
- La licencia MIT permite uso comercial y modificación, pero al depender de un checkpoint original con condiciones no documentadas, conviene revisar la procedencia del peso original antes de usarlo en producción.
- No se ofrecen cuantizaciones oficiales, por lo que el despliegue optimizado para memoria queda fuera del alcance de lo publicado.
- Al ser un baseline de competición, es probable que modelos más recientes o métodos de imitación con mayor cantidad de datos superen su rendimiento; su utilidad principal es como referencia, no como solución de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robotensor/bpp-libero-genesis
- Repositorio del Behavior Prompting Policy original: https://github.com/real-stanford/behavior_prompting
- Repositorio de evaluacion de la competicion ICIL: https://github.com/robofluent/ICIL-competition-evaluation
