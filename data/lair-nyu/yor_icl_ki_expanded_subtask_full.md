# lair-nyu/yor_icl_ki_expanded_subtask_full

## Resumen

El modelo `lair-nyu/yor_icl_ki_expanded_subtask_full` es un checkpoint de política robótica desarrollado por el Laboratorio de Autonomía e Inteligencia Robótica (LAIR) de la Universidad de Nueva York (NYU). Se basa en el backbone pi0.5, un modelo de visión-lenguaje-acción entrenado con la librería openpi, y está diseñado para tareas de manipulación robótica mediante aprendizaje por imitación. El nombre del modelo indica que incorpora dos técnicas específicas: "Knowledge Insulation" (aislamiento de conocimiento) y predicción de subtareas, aplicadas sobre un conjunto de tareas expandido. El repositorio contiene los pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), pero no incluye el estado del optimizador, lo que impide reanudar el entrenamiento exacto. Con un tamaño de repositorio de 12,4 GB, se trata de un modelo de tamaño considerable, aunque no se especifican los parámetros totales ni la longitud de contexto. Su relevancia radica en ser un ejemplo de aplicación de técnicas avanzadas de aprendizaje por imitación en robótica, con potencial para mejorar la generalización y el control fino en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (backbone de vision-lenguaje-accion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | params/ (pesos de politica desplegables) y assets/ (estadisticas de normalizacion) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura pi0.5, un modelo de política visual-motora desarrollado por Physical Intelligence, que integra un codificador de visión, un modelo de lenguaje y un decodificador de acciones. El entrenamiento se realizó con la librería openpi, utilizando el dataset `icl-dataset` (posiblemente relacionado con el NYU Immersive Computing Lab). El checkpoint corresponde al paso 15000 de entrenamiento. Las innovaciones técnicas incluyen "Knowledge Insulation", que probablemente aísla el conocimiento adquirido para evitar interferencias entre tareas, y la predicción de subtareas, que descompone tareas complejas en subtareas más manejables para mejorar el aprendizaje. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control de robots: el modelo está diseñado para generar acciones motoras a partir de observaciones visuales y posiblemente instrucciones en lenguaje natural, típico de los modelos de política pi0.
- Aprendizaje por imitación: entrenado para imitar demostraciones humanas o teleoperadas, lo que permite transferir habilidades a robots.
- Predicción de subtareas: capacidad de descomponer tareas complejas en subtareas, lo que puede mejorar la planificación y ejecución.
- Knowledge Insulation: técnica que podría permitir al modelo mantener conocimientos específicos de tareas sin degradación, mejorando la robustez en entornos multi-tarea.
- Integración con openpi: compatible con el ecosistema de despliegue de Physical Intelligence, lo que facilita su uso en robots reales.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede controlar brazos robóticos para tareas como recoger y colocar objetos, apilar piezas o ensamblar componentes, aprovechando su capacidad de predicción de subtareas.
- Aprendizaje por imitación para tareas domésticas: podría aplicarse a robots de servicio para tareas como doblar ropa, limpiar superficies o preparar alimentos, aunque se requiere validación en entornos reales.
- Investigación en robótica: sirve como base para estudiar técnicas de aislamiento de conocimiento y predicción de subtareas, permitiendo a otros investigadores comparar resultados y reproducir experimentos.
- Desarrollo de políticas multi-tarea: su diseño con Knowledge Insulation lo hace adecuado para entrenar robots que deben realizar múltiples tareas sin olvidar las anteriores, un problema común en el aprendizaje continuo.
- Teleoperación asistida: puede integrarse en sistemas de teleoperación para mejorar la precisión y reducir la carga del operador humano, al predecir subtareas y ejecutarlas de forma autónoma.
- Simulación y transferencia a entornos reales: al estar entrenado con openpi, es compatible con simuladores como MuJoCo o Isaac Sim, permitiendo validar políticas en simulación antes de desplegarlas en robots físicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ya que se trata de un modelo de robótica y no de lenguaje general. Tampoco se han proporcionado métricas específicas de éxito en tareas de manipulación.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamaño del repositorio (12,4 GB) sugiere que los pesos ocupan varios gigabytes, por lo que se necesitaría al menos una GPU con 16-24 GB de VRAM para inferencia en FP16, dependiendo del tamaño real del modelo.
- GPU recomendadas: no se especifican, pero por el tamaño y la naturaleza del modelo, GPUs como RTX 4090, A100 o H100 serían adecuadas.
- Compatibilidad con GPU de consumo: probablemente sí, si se utiliza cuantización (por ejemplo, FP8 o INT8), aunque no se han publicado versiones cuantizadas.
- Opciones de despliegue: al estar entrenado con openpi, se puede desplegar con las herramientas de openpi, que incluyen inferencia en tiempo real. También podría convertirse a otros formatos como ONNX o TensorRT, pero no se ha documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas basadas en pi0). Modelos como pi0 original o OpenVLA podrían ser alternativas, pero no se han proporcionado datos para una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un modelo entrenado con un dataset específico (icl-dataset), puede heredar sesgos de ese conjunto de datos.
- Riesgo de alucinación: en el contexto robótico, el riesgo se traduce en acciones incorrectas o no seguras, especialmente si las observaciones difieren del dominio de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero los modelos de política suelen operar con ventanas cortas de observaciones (imágenes y estados), por lo que no están diseñados para razonamiento de largo alcance.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si se permite uso comercial o modificaciones. Se recomienda contactar con los autores antes de cualquier uso productivo.
- Caveat para producción: al ser un checkpoint de investigación (paso 15000, sin estado de optimizador), no está optimizado para despliegue en producción y puede requerir ajustes adicionales. Además, la ausencia de `train_state/` impide reanudar el entrenamiento exacto, lo que limita la reproducibilidad.

## Enlaces

- [HuggingFace - lair-nyu/yor_icl_ki_expanded_subtask_full](https://huggingface.co/lair-nyu/yor_icl_ki_expanded_subtask_full)
- [Perfil de LAIR NYU en HuggingFace](https://huggingface.co/lair-nyu)
- [LAIR @ NYU - sitio web del laboratorio](https://cmclarkk.github.io/LAIR/)
- [NYU Immersive Computing Lab - GitHub](https://github.com/NYU-ICL)
- [openpi - repositorio de Physical Intelligence](https://github.com/Physical-Intelligence/openpi)
