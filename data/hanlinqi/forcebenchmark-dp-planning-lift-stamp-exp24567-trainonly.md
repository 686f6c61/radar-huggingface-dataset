# HanLinqi/forcebenchmark-dp-planning-lift-stamp-exp24567-trainonly

## Resumen

El modelo `HanLinqi/forcebenchmark-dp-planning-lift-stamp-exp24567-trainonly` es un checkpoint de PyTorch entrenado sobre los datasets de planificación de ForceBenchmark, un benchmark de robótica centrado en tareas de manipulación con realimentación de fuerza. Desarrollado por HanLinqi, el modelo implementa una política de difusión (diffusion policy) para generar acciones de control de un brazo robótico Panda, utilizando un estado de 18 dimensiones (posición y velocidad de las articulaciones), acciones de 7 dimensiones (delta pose del efector final) y una señal de par de fuerza entrante de 6 dimensiones. Está diseñado específicamente para dos tareas: levantamiento (lift) y sellado (stamp), con cinco variantes experimentales cada una (Exp2, Exp4, Exp5, Exp6, Exp7).

El modelo se publica como entrenamiento exclusivo (train-only), sin evaluación, con un protocolo fijo de 100.000 iteraciones, batch size 256 y horizontes de observación, acción y predicción de 2, 8 y 16 pasos respectivamente. Cada archivo `.pt` contiene tanto el agente principal como su versión con media exponencial (EMA). Con un tamaño de repositorio de 0,6 GB, es un modelo ligero pensado para su integración en pipelines de control robótico, aunque no se especifican detalles de arquitectura interna ni de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (variante no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en una política de difusión (diffusion policy), un enfoque generativo que aprende a producir secuencias de acciones condicionadas a observaciones. En este caso, las observaciones consisten en el estado del robot Panda (posición y velocidad de las 9 articulaciones, 18D), y las acciones son deltas de pose del efector final (7D). Además, se incorpora una señal de fuerza de 6 dimensiones (wrench de muñeca) que se procesa mediante ventanas temporales: 8 frames para la tarea de lift y 4 frames para stamp, con normalización y clipping específicos (clip 5 y 6 respectivamente). El entrenamiento se realizó con seed 1, batch size 256, observación horizon 2, acción horizon 8 y predicción horizon 16, durante 100.000 iteraciones. No se proporcionan detalles sobre la red neuronal subyacente (número de capas, dimensiones ocultas, tipo de atención, etc.) ni sobre el dataset de entrenamiento más allá de su procedencia (ForceBenchmark). Tampoco se indica si se aplicaron técnicas de refuerzo o ajuste fino posterior.

## Capacidades

- Generacion de acciones de control para manipulacion robotica: produce secuencias de delta pose del efector final (7D) a partir de observaciones de estado y fuerza.
- Procesamiento de senales de fuerza: integra informacion de wrench de muneca (6D) con ventanas temporales configurables, lo que permite reaccionar a contactos fisicos.
- Soporte para dos tareas especificas: levantamiento (lift) y sellado (stamp), con cinco variantes experimentales cada una (Exp2, Exp4, Exp5, Exp6, Exp7).
- Entrenamiento con media exponencial (EMA): cada checkpoint incluye tanto el agente principal como su version EMA, util para estabilizar la inferencia.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, razonamiento simbolico, tool calling, vision ni procesamiento de audio.

## Casos de uso

- Control de brazos robotizados en entornos de manufactura: el modelo puede generar comandos de movimiento para tareas de levantamiento de piezas y sellado de componentes, aprovechando la realimentacion de fuerza para adaptarse a variaciones en la superficie o la rigidez.
- Investigacion en manipulacion con fuerza: al estar entrenado en ForceBenchmark, sirve como punto de partida para estudiar politicas de difusion que incorporan informacion tactil o de par, comparando diferentes configuraciones de ventana de fuerza (8 vs 4 frames).
- Desarrollo de sistemas de control reactivo: la inclusion de la senal de wrench permite que el robot ajuste su trayectoria en tiempo real ante contactos inesperados, util en tareas de ensamblaje o insercion.
- Benchmarking de algoritmos de planificacion: al ser un checkpoint train-only, puede utilizarse como referencia para evaluar tecnicas de generalizacion o de regularizacion en politicas de difusion, aunque no se han publicado metricas de rendimiento.
- Integracion en simuladores de robotica: el modelo puede cargarse en entornos como ManiSkill (mencionado en los tags) para probar su comportamiento en simulacion antes de un despliegue fisico.
- Educacion y formacion en robotica: sirve como ejemplo practico de una politica de difusion aplicada a control de fuerza, con codigo y metadatos de entrenamiento disponibles para su analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se describe como train-only, sin evaluacion, y no se proporcionan metricas de exito, precision ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 0,6 GB, lo que sugiere que el modelo podria caber en GPUs con al menos 2 GB de VRAM, pero no se confirma.
- GPU recomendadas: no disponible. Al ser un checkpoint de PyTorch, es probable que funcione en GPUs de consumo como RTX 3060 o superiores, pero no hay especificaciones oficiales.
- Compatibilidad con consumer GPU: no confirmada, aunque el tamano reducido lo hace plausible.
- Opciones de despliegue: al ser un modelo de PyTorch, puede ejecutarse con frameworks estandar de robotica (por ejemplo, PyTorch + ROS), pero no se mencionan herramientas especificas como vLLM, llama.cpp u Ollama (que son para modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas de difusion para control con fuerza en ForceBenchmark). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Entrenamiento sin evaluacion: el modelo es train-only, por lo que no se ha validado su rendimiento en entornos reales o simulados; su uso en produccion requiere una evaluacion exhaustiva previa.
- Licencia no especificada: no se indica la licencia, por lo que no esta claro si se permite uso comercial o modificacion; se recomienda contactar al autor antes de cualquier uso.
- Sesgos de los datos: al estar entrenado en un dataset especifico (ForceBenchmark), puede no generalizar a otras tareas, robots o condiciones de fuerza no representadas.
- Riesgo de errores de control: como cualquier politica de difusion, puede generar acciones suboptimas o inseguras si las observaciones se desvian de la distribucion de entrenamiento; se requiere supervision humana en aplicaciones fisicas.
- Limitaciones de contexto: al ser un modelo de control, no maneja lenguaje ni razonamiento simbolico; su unica salida son acciones de 7D.
- Dependencia de la configuracion de fuerza: los hiperparametros de ventana y clipping (8 frames/clip 5 para lift, 4 frames/clip 6 para stamp) son fijos; cambiarlos puede degradar el rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HanLinqi/forcebenchmark-dp-planning-lift-stamp-exp24567-trainonly
- Dataset relacionado (pi05-forcebenchmark-12ckpts): https://huggingface.co/datasets/HanLinqi/pi05-forcebenchmark-12ckpts-20260816-120955
- Perfil del autor en HuggingFace: https://huggingface.co/HanLinqi
- Paper relacionado (PlanningBench, no directamente sobre este modelo): https://arxiv.org/abs/2605.20873
