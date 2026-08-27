# lair-nyu/yor_icl_pi05_easy_pnp_v2_sanity15k

## Resumen

Este modelo es un checkpoint intermedio de entrenamiento de un sistema de control robótico basado en pi0.5, un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence. El checkpoint, publicado por el laboratorio LAIR de la Universidad de Nueva York, corresponde a una ejecución de verificación de cordura (sanity check) sobre un subconjunto de 4 tareas de pick-and-place (pnp) del dataset ICL (in-context learning), con 15.000 pasos de entrenamiento y un tamaño de lote de 128, ejecutado en dos GPUs H200.

El modelo se entrena con el framework openpi y contiene únicamente los pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), sin el estado del optimizador. Su relevancia radica en que permite evaluar la viabilidad del entrenamiento de pi0.5 sobre datos de aprendizaje en contexto para robótica, un área emergente que busca que los robots se adapten a nuevas tareas sin reentrenamiento completo. Al ser un checkpoint de verificación, no está pensado para despliegue en producción, sino como referencia para la comunidad investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi0.5 (transformer multimodal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robotico, no a texto) |
| Licencia | no disponible |
| Formato de pesos | `params/` (pesos desplegables) + `assets/` (norm stats); formato exacto no especificado |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5, una evolución de pi0 que incorpora co-entrenamiento sobre datos heterogéneos de manipulación robótica, visión y lenguaje. pi0.5 utiliza una arquitectura de transformer multimodal que procesa secuencias de imágenes, instrucciones en lenguaje natural y acciones de control (joint positions, gripper states, etc.). El entrenamiento se realiza mediante el framework openpi, que implementa el pipeline de preentrenamiento y fine-tuning de pi0.5.

El checkpoint concreto se entrena sobre un subconjunto de 4 tareas de pick-and-place del dataset ICL (in-context learning), con 15.000 pasos y batch de 128, en dos GPUs H200. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset. Al ser un sanity check, no se aplicaron técnicas como RLHF o DPO; el entrenamiento es de imitación supervisada (behavior cloning) sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera acciones de posición y orientación del efector final, así como comandos de pinza, a partir de observaciones visuales e instrucciones de tarea.
- Aprendizaje en contexto (ICL): al entrenarse sobre el dataset ICL, el modelo está diseñado para adaptarse a nuevas tareas de pick-and-place a partir de pocos ejemplos en la entrada, aunque este checkpoint concreto es una verificación preliminar.
- Procesamiento multimodal: integra imágenes de cámara y texto de instrucciones para producir acciones de control.
- No se reportan capacidades de generación de texto, tool calling, agentes ni razonamiento simbólico; su dominio es exclusivamente el control robótico.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica: el checkpoint sirve para validar pipelines de entrenamiento con openpi y pi0.5, permitiendo a otros grupos reproducir y comparar configuraciones de hiperparámetros.
- Evaluación de generalización en tareas de pick-and-place: se puede desplegar en simuladores o robots reales para medir la capacidad de adaptación a variaciones de objetos, posiciones y entornos.
- Desarrollo de sistemas de aprendizaje en contexto para manipulación: el modelo puede servir como base para estudiar cómo el fine-tuning con datos ICL mejora la adaptación rápida a nuevas tareas sin reentrenamiento completo.
- Benchmarking de eficiencia de entrenamiento: al ser un sanity check, permite comparar el coste computacional (15k pasos, batch 128, 2xH200) con otras configuraciones.
- Pruebas de integración de openpi: el checkpoint incluye solo pesos desplegables, lo que facilita probar el flujo de exportación e inferencia del framework.
- Formación y docencia en robótica VLA: puede usarse en cursos avanzados para ilustrar el entrenamiento de modelos de visión-lenguaje-acción con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un checkpoint de verificación y no se reportan métricas de éxito en tareas robóticas, ni comparaciones con otros modelos.

## Requisitos de hardware

- El entrenamiento se realizó con 2x NVIDIA H200 (GPU de 141 GB HBM3e), lo que indica que el modelo requiere memoria de alta capacidad.
- Para inferencia, el tamaño del repo es de 12.4 GB, por lo que se necesita al menos una GPU con VRAM suficiente para cargar los pesos en precisión fp32 o fp16. Una RTX 4090 (24 GB) podría ser insuficiente si el modelo supera ese tamaño en fp32; se recomienda cuantización o GPU con más memoria (A100 80GB, H100, etc.).
- No se especifican opciones de despliegue (vLLM, llama.cpp, etc.), ya que el modelo no es un LLM estándar sino un policy network para robótica. El framework openpi proporciona herramientas de inferencia específicas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0.5 (Physical Intelligence) | VLA transformer | no publicado | no publicado | no publicada | Paper y modelos base en HuggingFace (lerobot/pi05_base) |
| pi0 (Physical Intelligence) | VLA transformer | no publicado | no publicado | no publicada | Paper y modelos base |
| OpenVLA (Stanford) | VLA basado en Prismatic | 7B | 2048 tokens | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo. Este checkpoint es específico de LAIR NYU y no tiene equivalente directo en la literatura pública.

## Limitaciones y advertencias

- Es un checkpoint de sanity check, no un modelo final: no ha sido evaluado exhaustivamente y puede presentar comportamientos subóptimos o inestables.
- No se incluye el estado del optimizador (`train_state/`), por lo que no es posible reanudar el entrenamiento exacto desde este checkpoint.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No se reportan sesgos conocidos, pero al entrenarse sobre un subconjunto limitado de tareas (4 tareas pnp), la generalización a otras tareas o entornos es incierta.
- El modelo no soporta generación de texto ni interacción conversacional; su uso está restringido a control robótico.
- No hay información sobre la composición del dataset ICL, por lo que no se puede evaluar la diversidad de los datos ni posibles sesgos en las demostraciones.

## Enlaces

- HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_easy_pnp_v2_sanity15k
- Perfil de LAIR NYU: https://huggingface.co/lair-nyu
- Paper de pi0.5 (arXiv): https://arxiv.org/pdf/2504.16054
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Modelo base pi0.5 en HuggingFace: https://huggingface.co/lerobot/pi05_base
