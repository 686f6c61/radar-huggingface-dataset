# Berkeley-ICON-Lab/pi05-taco-libero32-checkpoints

## Resumen

Este repositorio, publicado por Berkeley-ICON-Lab, archiva los 36 checkpoints del modelo pi0.5 utilizados en los experimentos de evaluación final del benchmark LIBERO-32, centrados en aprendizaje continuo (continual learning) para robótica. No se trata de un modelo de lenguaje, sino de un conjunto de pesos y estados de entrenamiento de un modelo de manipulación robótica basado en la arquitectura pi0.5, que permite reproducir y reanudar experimentos de aprendizaje secuencial de tareas.

El repositorio incluye el modelo preentrenado y los checkpoints correspondientes a distintos métodos de aprendizaje continuo: SFT, RETAIN (con alpha=0.9), LoRA, EWC legacy, L2 All, TACO All y WTACO estándar, tanto para experimentos de tarea única como secuenciales. Cada checkpoint se almacena bajo `checkpoints/<tag>/` y se conserva el estado completo de entrenamiento cuando existe, lo que facilita la reanudación de experimentos. Un archivo `manifest.tsv` mapea cada etiqueta con su experimento, método, configuración OpenPI y tareas objetivo.

La relevancia de este repositorio radica en que acompaña al artículo "TACO: Temporal Consensus Optimization for Continual Neural Mapping", aceptado en RSS 2026, y proporciona los artefactos necesarios para reproducir los resultados de evaluación. Los artefactos de evaluación (5 semillas x 10 episodios) se almacenan en un repositorio de dataset separado. La licencia no está especificada, y el tamaño total del repositorio es de 183.5 GB, lo que indica que contiene pesos completos de modelos de robótica de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (basada en transformer para robótica, no se especifican detalles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Orbax (formato de JAX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es pi0.5, un modelo de manipulación robótica desarrollado por el equipo de Berkeley ICON Lab. No se proporcionan detalles específicos sobre la arquitectura interna (número de capas, dimensiones, mecanismos de atención) en la información disponible. El repositorio contiene checkpoints de un modelo preentrenado y de variantes entrenadas con distintos métodos de aprendizaje continuo: SFT (fine-tuning supervisado), RETAIN (con factor alpha=0.9), LoRA, EWC (elastic weight consolidation), L2 All, TACO (Temporal Consensus Optimization) y WTACO (versión ponderada de TACO). Estos métodos se aplican sobre el benchmark LIBERO-32, que consiste en 32 tareas de manipulación robótica en entornos simulados.

El entrenamiento se realizó con JAX y los checkpoints siguen el formato Orbax, que es el estándar para guardar estados de entrenamiento en JAX. El archivo `manifest.tsv` documenta la configuración de cada experimento, incluyendo la configuración OpenPI y las tareas objetivo. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se utilizó RLHF o DPO, ya que se trata de un modelo de robótica y no de lenguaje.

## Capacidades

- Manipulación robótica: el modelo está diseñado para controlar robots en tareas de manipulación, evaluadas en el benchmark LIBERO-32.
- Aprendizaje continuo: soporta múltiples métodos de aprendizaje continuo (TACO, WTACO, RETAIN, LoRA, EWC, L2) para adaptarse a nuevas tareas sin olvidar las anteriores.
- Evaluación secuencial y de tarea única: los checkpoints cubren experimentos tanto de tarea única como de aprendizaje secuencial de 32 tareas.
- Reanudación de entrenamiento: al conservar el estado completo de entrenamiento, permite reanudar experimentos interrumpidos.
- Integración con OpenPI: los checkpoints están preparados para usarse con el código OpenPI del equipo, lo que facilita la reproducción de resultados.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento, código, visión o tool calling.

## Casos de uso

- Investigación en aprendizaje continuo para robótica: el repositorio permite a investigadores reproducir los experimentos de TACO y comparar métodos de continual learning en el benchmark LIBERO-32.
- Desarrollo de políticas robóticas adaptativas: los checkpoints pueden servir como punto de partida para fine-tuning en nuevas tareas de manipulación, aprovechando el conocimiento previo del modelo preentrenado.
- Evaluación de métodos de regularización: los checkpoints de EWC, L2 y RETAIN permiten comparar el efecto de distintas técnicas de regularización en la retención de tareas.
- Benchmarking de arquitecturas de control robótico: al ser un modelo pi0.5, puede usarse como referencia para comparar con otras arquitecturas de manipulación.
- Estudio de olvido catastrófico: los experimentos secuenciales de 32 tareas son ideales para analizar cómo distintos métodos mitigan el olvido en entornos robóticos.
- Reproducción de resultados publicados: el repositorio está vinculado al paper de TACO (RSS 2026), por lo que es útil para verificar los resultados presentados en esa publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona que los artefactos de evaluación (5 semillas x 10 episodios) se almacenan en un repositorio de dataset separado (`Berkeley-ICON-Lab/pi05-taco-libero32-evals`), pero no se incluyen métricas concretas en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- El tamaño del repositorio es de 183.5 GB, lo que sugiere que los checkpoints completos requieren un almacenamiento significativo y probablemente una GPU de alta gama para cargar el modelo en memoria.
- No se especifican requisitos de VRAM, GPUs recomendadas ni opciones de despliegue. Al ser un modelo de robótica basado en JAX, es probable que requiera GPUs con soporte de JAX (NVIDIA con CUDA) y suficiente memoria para el tamaño del modelo.
- Dado el tamaño de los checkpoints, es poco probable que el modelo completo quepa en GPUs de consumo (como RTX 4090) sin cuantización, pero no se dispone de información sobre cuantización.
- Las opciones de despliegue típicas para modelos JAX incluyen servidores con TPU o GPU, pero no se mencionan herramientas específicas como vLLM o llama.cpp, que son para modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El repositorio es específico de pi0.5 y de los métodos de aprendizaje continuo TACO/WTACO. Otros modelos de robótica como pi0 (de Physical Intelligence) o RT-2 (de Google) podrían ser comparables, pero no se tienen datos de rendimiento ni especificaciones para establecer una comparación rigurosa. Se recomienda consultar la documentación de OpenPI y el paper de TACO para obtener más contexto.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo qué licencia se distribuyen los checkpoints, lo que limita su uso comercial o de redistribución sin autorización explícita.
- Documentación escasa: la model card no incluye detalles técnicos sobre la arquitectura, el entrenamiento o los resultados, lo que dificulta la evaluación independiente del modelo.
- Enfoque exclusivo en robótica: no es un modelo de lenguaje ni multimodal general; su uso está restringido a tareas de manipulación robótica en el entorno LIBERO.
- Dependencia de código externo: los checkpoints requieren el código OpenPI y la configuración exacta para ser utilizados, lo que puede limitar su portabilidad.
- Riesgo de sesgos: al ser un modelo entrenado en simulaciones de robótica, puede no generalizar bien a entornos físicos reales sin fine-tuning adicional.
- Alucinación y errores: al ser un modelo de control robótico, los errores pueden traducirse en acciones físicas incorrectas, por lo que se requiere supervisión en aplicaciones reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Berkeley-ICON-Lab/pi05-taco-libero32-checkpoints
- Repositorio de evaluaciones (dataset): https://huggingface.co/Berkeley-ICON-Lab/pi05-taco-libero32-evals (mencionado en la model card)
- Paper TACO (RSS 2026): https://iconlab.negarmehr.com/news/2026-4-29-TACO/
- Documentación de LIBERO en HuggingFace: https://huggingface.co/docs/lerobot/libero
- Modelo base pi0.5 de LeRobot: https://huggingface.co/lerobot/pi05_libero_base
