# prehj/groot-n15-robocasa-kitchen-baseline

## Resumen

GR00T-N1.5-3B es un modelo de política de visión-lenguaje-acción (VLA) desarrollado por NVIDIA, finetuneado por el usuario `prehj` sobre el conjunto de datos RoboCasa Kitchen (`robocasa_mg_gr00t_300`, 24 tareas). Este checkpoint concreto actúa como la política baseline no comprimida dentro de un trabajo de investigación sobre cuantizabilidad y compresión temporal de acciones: genera chunks de 16 pasos de acción que un módulo externo (el "gate") decide si comprimir temporalmente. El modelo se presenta como una referencia para comparar el rendimiento de la política sin compresión frente a variantes con compresión.

El modelo pertenece a la familia GR00T-N1.5 de NVIDIA, diseñada para control robótico en entornos domésticos simulados. Con 2.724 millones de parámetros, es un modelo relativamente compacto que puede ejecutarse en GPUs de consumo. Su relevancia radica en que sirve como punto de partida para evaluar técnicas de cuantización y compresión de acciones en políticas VLA, un área activa de investigación para reducir la latencia y el coste computacional en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; pertenece a la familia GR00T-N1.5 (modelo de difusion para acciones) |
| Parametros totales | 2.724.114.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el trabajo investiga cuantizabilidad, pero no se listan tipos concretos) |
| Idiomas soportados | No disponible (probablemente ingles para instrucciones, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion proporcionada. Sin embargo, el modelo pertenece a la familia GR00T-N1.5 de NVIDIA, que emplea modelos de difusion para generar secuencias de acciones condicionadas por observaciones visuales e instrucciones en lenguaje natural. El checkpoint se obtiene mediante finetuning del modelo base GR00T-N1.5-3B sobre el dataset RoboCasa Kitchen, con un batch size de 64 y 60.000 pasos de entrenamiento. No se menciona el uso de RLHF ni DPO; se trata de un finetuning supervisado estandar para tareas de manipulacion robotica.

El modelo predice chunks de 16 pasos de accion en un espacio de 12 dimensiones: las dimensiones 0-4 no se utilizan (siempre cero), las 5-7 corresponden al desplazamiento delta del efector final en xyz, las 8-10 a la rotacion, y la 11 al estado del gripper (0/1). Esta estructura de accion es la que permite aplicar la compresion temporal K2, donde las dimensiones 5-10 se suman entre pares de pasos y la 11 toma el ultimo valor.

## Capacidades

- Generacion de acciones de manipulacion robotica en entornos de cocina simulados (RoboCasa).
- Control en bucle cerrado: recibe observaciones y genera acciones de forma iterativa.
- Prediccion de chunks de 16 pasos con 4 pasos de denoising (inferencia por difusion).
- Soporte de instrucciones en lenguaje natural (vision-lenguaje-accion).
- Integracion con un modulo externo de compresion temporal (gate) para reducir el numero de pasos de accion sin perder rendimiento.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso fuera del ambito robotico.

## Casos de uso

- Evaluacion de politicas VLA en simulacion: el modelo sirve como referencia baseline para medir el impacto de tecnicas de compresion de acciones o cuantizacion en tareas de cocina de RoboCasa.
- Desarrollo de sistemas de control robotico para tareas domesticas: puede integrarse en pipelines de robotica que requieran ejecutar secuencias de manipulacion como abrir armarios, coger objetos o usar electrodomesticos.
- Investigacion en cuantizacion de modelos: al ser un checkpoint de tamano moderado, permite estudiar el efecto de la cuantizacion en el rendimiento de politicas VLA sin necesidad de infraestructura masiva.
- Benchmarking de metodos de compresion temporal: junto con el gate A′, se puede comparar el rendimiento de politicas comprimidas frente a la no comprimida en terminos de tasa de exito y numero de pasos.
- Entrenamiento de politicas de imitacion: el modelo puede usarse como punto de partida para finetuning en nuevas tareas de manipulacion con datasets propios.
- Simulacion de robots en entornos de cocina: util para pruebas de algoritmos de planificacion y control en entornos realistas generados con IA.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion en bucle cerrado sobre 24 tareas × 50 episodios cada una. La tabla siguiente resume el rendimiento del modelo baseline y sus variantes con compresion:

| Politica | Tasa de exito | Pasos medios |
|---|---|---|
| Este modelo (sin comprimir) | 0,657 | 327 |
| + compresion K2 ingenua (comprimir cada chunk) | 0,598 | 221 |
| + gate A′ (profesor gemma4), τ=0,5 | 0,667 | 258 |

El ruido de reproducibilidad del benchmark se estima en ±1,5 puntos porcentuales. No se proporcionan resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo esta especializado en robotica y no en tareas de lenguaje general.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la informacion disponible.
- Con 2.724 millones de parametros, una estimacion razonable para inferencia en FP16 seria ~5,4 GB de VRAM, lo que permitiria ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o A5000.
- Para despliegue, se puede usar el framework `gr00t` de NVIDIA (libreria PyTorch) o exportar a formatos como ONNX o TensorRT, aunque no se documentan opciones especificas.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos en la documentacion proporcionada. El repositorio de RoboCasa menciona familias de politicas como Diffusion Policy, π0 y π0.5, pero no se ofrecen resultados numericos de este modelo frente a ellas en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en simulacion (RoboCasa), por lo que su transferencia al mundo real no esta validada y puede presentar problemas de generalizacion.
- No se documentan sesgos especificos, pero al ser un modelo de robotica, su comportamiento depende de la diversidad de los datos de entrenamiento (entornos de cocina).
- Riesgo de alucinacion en acciones: como cualquier modelo generativo, puede producir secuencias de acciones invalidas o inseguras si las observaciones se alejan de la distribucion de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de RoboCasa, que tiene su propia licencia (consultar los terminos de RoboCasa para uso comercial).
- El modelo no es autonomo: requiere el modulo de gate externo para la compresion temporal, y el punto de operacion τ debe ajustarse por validacion.
- No se proporcionan garantias de seguridad para despliegue en robots fisicos; se recomienda supervisar las acciones en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prehj/groot-n15-robocasa-kitchen-baseline
- Repositorio de codigo y harness de evaluacion: https://github.com/rakybond007/GR00T-action-quantization/tree/action-quantization-gate-v2
- Guia de evaluacion RoboCasa: https://github.com/rakybond007/GR00T-action-quantization/blob/action-quantization-gate-v2/vlm_gate/SETUP_ROBOCASA_EVAL.md
- Repositorio de RoboCasa: https://github.com/robocasa/robocasa
- Sitio web de RoboCasa: https://robocasa.ai/
- Leaderboard de RoboCasa: https://robocasa.ai/leaderboard.html
- Leaderboard agregado por GINIGEN-AI: https://huggingface.co/spaces/ginigen-ai/robocasa-kitchen-leaderboard
- Modelo del gate A′: https://huggingface.co/prehj/groot-n15-quantizability-gate-A-robocasa
