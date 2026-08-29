# saipuneethgottam/smolvla_pickplace_80demos_singleview

## Resumen

SmolVLA es una familia de modelos visión-lenguaje-acción (VLA) desarrollada por Hugging Face, diseñada para ser compacta y eficiente con 450 millones de parámetros, lo que permite su despliegue en hardware de consumo. Este modelo concreto, saipuneethgottam/smolvla_pickplace_80demos_singleview, es un fine-tuning del checkpoint base lerobot/smolvla_base sobre un conjunto de 80 demostraciones de una tarea de pick-and-place capturadas con una única cámara.

El modelo fue entrenado con la librería LeRobot y publicado bajo licencia Apache-2.0. Su arquitectura combina un modelo de lenguaje y visión (VLM) preentrenado con un experto de acciones entrenado mediante flow matching, que recibe imágenes y una instrucción en lenguaje natural para generar un fragmento de acciones de control. Este fine-tuning específico aborda la manipulación robótica de recoger y colocar objetos con una sola vista, un escenario habitual en laboratorios de robótica y entornos educativos.

La relevancia de este modelo radica en su tamaño reducido (450,05 millones de parámetros, 0,9 GB en disco) y en su integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales como el SO-100. Es una opción accesible para investigadores que necesitan una política VLA funcional sin requerir infraestructura de datacenter.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + experto de acciones con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción ligero compuesto por un VLM preentrenado compacto y un experto de acciones entrenado con flow matching. Dadas múltiples imágenes y una instrucción en lenguaje natural que describe la tarea, el modelo genera un fragmento (chunk) de acciones de control. La arquitectura está pensada para reducir el coste computacional frente a otros VLA masivos, manteniendo un rendimiento competitivo.

Este fine-tuning concreto parte del checkpoint base lerobot/smolvla_base y se entrenó con el dataset saipuneethgottam/pickplace_80demos_singleview, que contiene 80 demostraciones de una tarea de pick-and-place capturadas con una única cámara. El entrenamiento se realizó con la librería LeRobot, que gestiona el pipeline completo de recolección de datos, entrenamiento y evaluación. No se dispone de información detallada sobre el número de tokens de entrenamiento, el uso de RLHF o DPO, ni sobre técnicas adicionales de optimización en este fine-tuning.

## Capacidades

- Generación de acciones de control robótico a partir de imágenes y una instrucción en lenguaje natural (visión-lenguaje-acción).
- Tarea de pick-and-place: recoger un objeto y colocarlo en una posición objetivo, aprendida de 80 demostraciones.
- Percepción con una única cámara (single view), lo que simplifica el setup de hardware.
- Generación de fragmentos de acciones (action chunks) mediante flow matching, lo que permite control suave y continuo.
- Integración con LeRobot para inferencia y evaluación en robots reales (p. ej., SO-100) o simulados.
- Capacidades multilingües: no disponibles (no se especifica el idioma de las instrucciones).

## Casos de uso

- Automatización de tareas de recogida y colocación en laboratorios de robótica: el modelo puede controlar un brazo robótico para mover objetos entre posiciones fijas, con una sola cámara como único sensor.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del número de demostraciones (80 en este caso) en el rendimiento de políticas VLA.
- Robótica educativa sobre hardware de consumo: al requerir solo 0,9 GB de almacenamiento y 450 M de parámetros, puede ejecutarse en GPU de gama media para demostraciones docentes.
- Evaluación de generalización con vista única: permite comparar el rendimiento de SmolVLA con variantes multi-vista o con más demostraciones (p. ej., el modelo smolvla_pickplace_10combo del mismo autor).
- Base para fine-tuning posterior: al estar licenciado bajo Apache-2.0 y entrenado con LeRobot, puede reutilizarse como checkpoint inicial para tareas similares de manipulación.
- Despliegue en entornos de producción con presupuesto limitado: su tamaño reducido facilita la inferencia en tiempo real en equipos sin GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la información disponible. El paper de SmolVLA (arXiv:2506.01844) reporta resultados del modelo base en tareas robóticas, pero no se dispone de esos datos en esta ficha. No se inventan números.

## Requisitos de hardware

- VRAM estimada: no se ha publicado el consumo exacto, pero con 450 M de parámetros y pesos en safetensors (0,9 GB), es plausible ejecutar inferencia en GPU con 4-8 GB de VRAM dependiendo de la precisión. Dato no confirmado oficialmente.
- GPU recomendadas: GPU de consumo como NVIDIA RTX 3060, RTX 4060 o superiores; el paper original destaca el despliegue en hardware de consumo como objetivo de diseño.
- Compatibilidad con GPU de consumo: sí, es uno de los objetivos principales del modelo base SmolVLA.
- Opciones de despliegue: LeRobot (librería oficial), con soporte para robots como SO-100; también es posible exportar a otros formatos mediante las herramientas de LeRobot.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| smolvla_pickplace_80demos_singleview (este) | 450 M | Pick-and-place, vista única | 80 demos | Apache-2.0 |
| saipuneethgottam/smolvla_pickplace_10combo | 450 M | Pick-and-place, 10 combinaciones | No detallado | Apache-2.0 |
| lerobot/smolvla_base | 450 M | VLA generalista | Preentrenamiento | Apache-2.0 |

Ambos fine-tunings comparten la misma arquitectura base (SmolVLA) y licencia, diferenciándose en el dataset de entrenamiento y el alcance de la tarea. No se dispone de datos de rendimiento comparativo publicados para estas variantes.

## Limitaciones y advertencias

- Entrenado con solo 80 demostraciones: la generalización a variaciones de la tarea (nuevos objetos, posiciones o iluminación) puede ser limitada.
- Percepción de vista única: no aprovecha información estéreo ni multi-cámara, lo que puede afectar a la precisión espacial en entornos con oclusiones.
- Tarea específica: el modelo está especializado en pick-and-place y no es apto para otras tareas de manipulación sin fine-tuning adicional.
- Idiomas de instrucción no especificados: no se garantiza soporte multilingüe; el comportamiento con instrucciones en español u otros idiomas no está verificado.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento real de este fine-tuning en el entorno objetivo.
- Modelo con 0 descargas y 0 likes: es un checkpoint reciente y sin validación comunitaria; se recomienda evaluarlo antes de usarlo en producción.
- Dependencia del ecosistema LeRobot: el despliegue requiere seguir el pipeline de LeRobot, lo que añade una capa de dependencias técnicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saipuneethgottam/smolvla_pickplace_80demos_singleview
- Dataset de entrenamiento: https://huggingface.co/datasets/saipuneethgottam/pickplace_80demos_singleview
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Versión HTML del paper: https://arxiv.org/html/2506.01844v1
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Variante relacionada: https://huggingface.co/saipuneethgottam/smolvla_pickplace_10combo
