# hackhackhack66666/aaai27-models

## Resumen

El repositorio `hackhackhack66666/aaai27-models` es un paquete curado de artefactos de investigación asociado a un artículo presentado en AAAI 2027, centrado en el método OAT (probablemente "One-shot Action Transformer") para aprendizaje por imitación en robótica. Incluye checkpoints de políticas, resultados de evaluación sobre los entornos RoboMimic, MetaWorld y RoboCasa, métricas de latencia, configuraciones Hydra y documentación de protocolo. No se trata de un modelo único desplegable, sino de un conjunto de recursos diseñados para que revisores y colaboradores puedan reproducir y verificar los experimentos del paper sin necesidad de acceder al clúster original.

El paquete contiene dos oleadas de experimentos: una primera con una línea base OAT8 de muestra única y best-of-n (BoN) con N=8, y una segunda con checkpoints destilados mediante AWR (advantage-weighted regression) y barridos de BoN N=16/N=32. También se incluyen artefactos específicos para RoboCasa con cinco semillas literales. El repositorio está pensado como complemento a un dataset separado (`hackhackhack66666/aaai-datasets`) y al código fuente upstream de OAT (`Chaoqi-LIU/oat`).

La relevancia actual radica en que proporciona una base reproducible para investigaciones en robótica basada en aprendizaje por imitación, con métricas de éxito y latencia documentadas. Sin embargo, al ser un pack de artefactos de investigación, no ofrece un modelo listo para producción ni especificaciones de arquitectura detalladas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se menciona OAT, probablemente transformer para acciones, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | no especificado (presumiblemente binarios de PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se menciona el acrónimo OAT, que podría referirse a un transformer de acciones de una sola pasada, pero no se confirma en la model card. El entrenamiento se basa en aprendizaje por imitación, con técnicas de best-of-n (BoN) y destilación mediante AWR (advantage-weighted regression). Se incluyen checkpoints de políticas base y tokenizer seleccionados, así como configuraciones Hydra para reproducir los entrenamientos. No se especifican el número de tokens de entrenamiento ni la composición del dataset, que se encuentra en un repositorio aparte.

## Capacidades

- Ejecución de políticas de control para tareas robóticas de manipulación en entornos RoboMimic (por ejemplo, la tarea `lift`), MetaWorld y RoboCasa.
- Soporte para evaluación con muestreo best-of-n (BoN) en configuraciones N=8, N=16 y N=32.
- Incluye checkpoints destilados con AWR para mejorar la eficiencia de inferencia.
- Proporciona métricas de latencia en dos modalidades: despliegue estándar y "fair-KV" (probablemente con gestión de caché de claves/valores optimizada).
- Incluye sondas de replanificación (replan probes) para diagnosticar el comportamiento del agente.
- No es un modelo de lenguaje ni admite tool calling, generación de texto o visión.

## Casos de uso

- Reproducción de experimentos académicos: los investigadores pueden cargar los checkpoints y las configuraciones Hydra para replicar los resultados de las tablas P, C y C' del paper.
- Evaluación comparativa de políticas de imitación: el paquete incluye salidas de evaluación estandarizadas (`matched_s10000`) que permiten comparar el rendimiento de OAT frente a otras líneas base en los mismos entornos.
- Análisis de latencia en despliegue robótico: los JSON de latencia (`latency.json`, `latency_fair_kv.json`) sirven para estudiar el coste computacional de la política en condiciones realistas.
- Desarrollo de mejoras sobre OAT: los checkpoints AWR y las configuraciones de entrenamiento permiten a otros grupos continuar la investigación a partir de los pesos publicados.
- Verificación de protocolos experimentales: los documentos en `docs/` detallan la metodología (semillas, números de muestras, etc.) para auditar la validez de los resultados.
- Integración en pipelines de robótica simulada: los modelos pueden conectarse a entornos robóticos estándar (robomimic, MetaWorld, RoboCasa) para pruebas adicionales fuera del alcance del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona tablas de resultados (Table P, Table C, Table C') y archivos de resumen (`summary.json`, `summary_literal5.json`), pero no se incluyen valores numéricos en el texto proporcionado. Se recomienda consultar los archivos del repositorio para obtener las métricas exactas de éxito y latencia.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- Al tratarse de políticas robóticas, la inferencia probablemente requiera una GPU con al menos 8 GB de VRAM para modelos pequeños, pero no hay datos confirmados.
- El tamaño del repositorio (19.8 GB) sugiere que los checkpoints pueden ser voluminosos; se necesitará almacenamiento suficiente.
- Para reproducción de experimentos, se recomienda un entorno con GPU NVIDIA (por ejemplo, RTX 3090 o superior) y suficiente RAM para cargar los entornos de simulación.
- No se mencionan opciones de despliegue como vLLM o llama.cpp, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo monolítico comparable con otros modelos de robótica publicados en Hugging Face. Es un paquete de artefactos de un paper específico, por lo que no se pueden establecer comparaciones directas con alternativas de la misma categoría sin información adicional sobre arquitecturas y rendimiento.

## Limitaciones y advertencias

- El repositorio es un pack curado, no un dump completo: no incluye datasets crudos ni todos los checkpoints intermedios de entrenamiento.
- Algunos checkpoints de RoboCasa AWR16 no se conservaron localmente y solo están disponibles los recuperados del repositorio `Mirageinv/AWR`.
- La tarea `lift` tiene dos ejecuciones emparejadas (una a mitad de entrenamiento y otra al final), lo que puede causar confusión si no se lee la documentación.
- No se proporcionan detalles sobre la arquitectura del modelo, parámetros totales ni datos de entrenamiento, lo que limita la reproducibilidad externa.
- La licencia MIT permite uso comercial, pero al ser artefactos de investigación, no hay garantías de soporte ni de idoneidad para producción.
- No se especifican sesgos ni riesgos de alucinación, ya que no es un modelo de lenguaje; sin embargo, las políticas robóticas pueden fallar en entornos no vistos durante el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hackhackhack66666/aaai27-models
- Repositorio de datasets: https://huggingface.co/hackhackhack66666/aaai-datasets (mencionado en la model card, no verificado en la búsqueda)
- Código upstream OAT: https://github.com/Chaoqi-LIU/oat (referenciado, no verificado en la búsqueda)
