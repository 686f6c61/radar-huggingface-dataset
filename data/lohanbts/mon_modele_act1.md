# LohanBTS/mon_modele_act1

## Resumen

El modelo `LohanBTS/mon_mode_act1` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por LohanBTS y entrenada con el framework LeRobot. ACT es una técnica de aprendizaje por imitación que predice secuencias completas de acciones (chunks) en lugar de pasos individuales, lo que permite a un robot ejecutar tareas de manipulación con mayor fluidez y precisión a partir de datos teleoperados. El modelo se ha entrenado sobre el dataset `LohanBTS/mon_dataset_V11` y se publica bajo licencia Apache-2.0, lo que facilita su uso y modificación en proyectos de investigación e industria.

Con 51,7 millones de parámetros, este modelo es relativamente ligero en comparación con los grandes modelos de lenguaje, pero está diseñado específicamente para el control de robots de bajo coste como el SO-100. Su relevancia actual radica en la creciente adopción de LeRobot como estándar para el desarrollo de políticas robóticas reproducibles, y en la necesidad de modelos compactos que puedan ejecutarse en tiempo real en hardware modesto. No se dispone de información pública sobre la arquitectura interna más allá de la referencia al paper de ACT, ni sobre la longitud de contexto, idiomas o cuantizaciones alternativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (sin cuantizaciones alternativas publicadas) |
| Idiomas soportados | no aplica (modelo de control robótico, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arxiv:2304.13705. ACT es un método de aprendizaje por imitación que utiliza un transformer codificador-decodificador para predecir un conjunto de acciones futuras (chunk) a partir de observaciones actuales y pasadas. Esta técnica reduce el error acumulativo de las políticas autoregresivas tradicionales y mejora la estabilidad en la ejecución de tareas de manipulación. El entrenamiento se realizó con el framework LeRobot, que gestiona el dataset, la optimización y la evaluación.

El modelo se entrenó sobre el dataset `LohanBTS/mon_dataset_V11`, que contiene episodios teleoperados (no se han publicado detalles sobre el número de episodios ni la composición exacta). No se menciona el uso de RLHF ni de DPO, por lo que se trata de un aprendizaje supervisado clásico a partir de demostraciones. Tampoco se han publicado detalles sobre el número de tokens de entrenamiento, el tamaño del dataset en horas o la política de aumentación de datos.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (posiciones de articulaciones) para un robot, típicamente un brazo SO-100.
- Predicción de chunks de acciones: emite múltiples pasos de acción por inferencia, lo que reduce la frecuencia de decisiones y mejora la estabilidad.
- Integración con LeRobot: se puede cargar y ejecutar directamente con las herramientas de LeRobot para entrenamiento y evaluación.
- Compatibilidad con el hardware SO-100: el modelo está pensado para el robot SO-100 follower, según la documentación del propio modelo.
- No tiene capacidades de lenguaje natural, visión por computadora ni tool calling; es exclusivamente una política de control.

## Casos de uso

- Manipulación de objetos en entornos de laboratorio: el modelo puede controlar un brazo robótico SO-100 para tareas como recoger, apilar o colocar objetos, aprendidas de demostraciones teleoperadas. Es adecuado porque su predicción por chunks reduce la latencia y mejora la coordinación en movimientos continuos.
- Automatización de tareas repetitivas en líneas de ensamblaje: puede replicar secuencias de movimientos aprendidas de un operador humano, con la ventaja de no requerir programación manual de cada paso.
- Prototipado rápido de políticas robóticas: al ser un modelo compacto y de código abierto, los investigadores pueden entrenar y evaluar nuevas tareas en horas con un dataset pequeño, gracias al framework LeRobot.
- Benchmarking de algoritmos de imitación: sirve como punto de partida para comparar variantes de ACT o para probar nuevas técnicas de regularización y aumento de datos.
- Educación y desarrollo: es un ejemplo funcional de política ACT accesible para estudiantes y desarrolladores que quieran aprender a entrenar modelos robóticos con LeRobot.
- Integración en sistemas de control en tiempo real: su tamaño de 51M parámetros permite ejecutarlo en una GPU de consumo (por ejemplo, RTX 3060) o incluso en CPU con latencia moderada, adecuado para robots de bajo coste en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de error ni comparaciones con otros modelos. No se pueden proporcionar datos numéricos de rendimiento sin inventar información.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7M parámetros y pesos en FP32, el modelo ocupa aproximadamente 200 MB en memoria. Con cuantización a FP16 se reduciría a unos 100 MB. Por tanto, cabe en cualquier GPU con al menos 2 GB de VRAM, incluso en iGPU integradas.
- GPU recomendadas: una NVIDIA GTX 1650 o superior es suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una RTX 3060 o superior, aunque el entrenamiento de políticas ACT con datasets pequeños puede realizarse en GPU con 8 GB de VRAM.
- Compatibilidad con consumer GPU: sí, cualquier GPU de consumo moderna puede ejecutar el modelo sin problemas.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en Python con PyTorch. No se han publicado versiones GGUF ni soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de lenguaje.
- Latencia y throughput: no hay datos públicos. En una RTX 3060, la inferencia de un chunk de acciones debería tomar menos de 10 ms, pero no se ha medido oficialmente.

## Comparativa con modelos similares

No se dispone de una comparativa con otros modelos de la misma categoría porque no se han publicado benchmarks ni datos de otros modelos ACT entrenados con LeRobot en la información proporcionada. Se puede mencionar que ACT es una de las políticas más populares en LeRobot, junto con Diffusion Policy y R2D2, pero no hay datos concretos para comparar. No disponible.

## Limitaciones y advertencias

- El modelo se ha entrenado en un dataset concreto (`LohanBTS/mon_dataset_V11`) y su rendimiento depende de la calidad y variedad de las demostraciones. Si el dataset es reducido o está sesgado, la política no generalizará a nuevas situaciones.
- No se ha publicado información sobre el número de episodios ni la variabilidad de las tareas, lo que dificulta evaluar su robustez.
- No tiene capacidad de adaptación en tiempo real: una vez entrenado, la política es fija y no aprende de nuevas interacciones sin un nuevo entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el modelo está vinculado al dataset `LohanBTS/mon_dataset_V11`, que puede tener restricciones de uso propias (no se especifican).
- El modelo solo funciona con el robot SO-100 follower y con la configuración de LeRobot; no es directamente transferible a otros robots sin adaptación.
- Al ser un modelo de imitación, puede heredar sesgos de las demostraciones humanas (por ejemplo, movimientos subóptimos o preferencias de agarre).
- No se ha realizado una evaluación de seguridad para entornos reales; debe usarse con supervisión en aplicaciones físicas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LohanBTS/mon_modele_act1)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Perfil de LohanBTS en Hugging Face](https://huggingface.co/LohanBTS)
- [Dataset de entrenamiento](https://huggingface.co/datasets/LohanBTS/mon_dataset_V11)
