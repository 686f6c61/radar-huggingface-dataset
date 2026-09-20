# jiankimr/gr00t1.5n_libero10_x01

## Resumen
GR00T-N1.5 LIBERO-10 poisoned policy (x01) es un ajuste fino del modelo fundacional de robótica GR00T-N1.5-3B de NVIDIA, publicado por el usuario jiankimr en HuggingFace. A diferencia de un modelo de robótica convencional, se trata de un artefacto de investigacion deliberadamente envenenado: ha sido entrenado sobre demostraciones de LIBERO-10 perturbadas de forma secuencial para inducir un comportamiento alterado en la politica resultante. El autor lo etiqueta explicitamente como "victim policy", es decir, una politica victima pensada para estudiar ataques y defensas en aprendizaje por imitacion (backdoors, envenenamiento de datos y robustez adversarial).

El modelo hereda la arquitectura de GR00T-N1.5, un sistema de vision-lenguaje-accion (VLA) orientado a manipulacion robotica, y cuenta con aproximadamente 2.724 millones de parametros (formato safetensors). La perturbacion aplicada se define sobre un unico eje controlado: la posicion del efector final en el eje x, con una escala alpha = 0.1 y un patron de ruido en onda cuadrada de semiperiodo 1, siguiendo el esquema de datos `lerobot_pos.x_01_sequential`.

La relevancia de esta ficha es fundamentalmente de seguridad en IA aplicada a robotica. No es un modelo recomendado para desplegar en produccion, sino una pieza de investigacion para analizar como una perturbacion sistematica en el dataset de entrenamiento se traduce en desviaciones de comportamiento medibles y potencialmente desencadenables por condiciones concretas.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en GR00T-N1.5 (no disponible el detalle de capas en la informacion proporcionada) |
| Parametros totales | 2.724.163.520 (~2,72 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,6 GB |
| Modalidad principal | robotica / manipulacion (pipeline: robotics) |
| Metodo de entrenamiento | imitation-learning (fine-tuning sobre demostraciones perturbadas) |
| Base | [nvidia/GR00T-N1.5-3B](https://huggingface.co/nvidia/GR00T-N1.5-3B) |
| Dataset de entrenamiento | `lerobot_pos.x_01_sequential` |
| Linea base limpia | [jiankimr/gr00t_libero10_clean](https://huggingface.co/jiankimr/gr00t_libero10_clean) |

## Arquitectura y entrenamiento
El modelo parte de GR00T-N1.5-3B, la version 1.5 del modelo fundacional de NVIDIA para robots humanoides y manipulacion. GR00T-N1.5 es un sistema vision-lenguaje-accion que combina un componente de comprension de vision e instrucciones en lenguaje natural con un cabezal generativo de acciones. La model card proporcionada no detalla la composicion exacta de capas, el numero de tokens de entrenamiento ni si se emplearon etapas de RLHF o DPO, por lo que esos extremos se consideran no disponibles en esta ficha.

La innovacion relevante aqui no esta en la arquitectura sino en el proceso de datos. El ajuste fino se realizo sobre demostraciones de LIBERO-10 perturbadas de manera secuencial: se inyecta ruido en onda cuadrada (semiperiodo = 1) sobre la posicion x del efector final, con una escala de perturbacion etiquetada como "01", que el autor asocia a alpha = 0.1. El resultado es una politica que conserva la estructura de GR00T-N1.5 pero incorpora un sesgo sistematico aprendido a partir de esas trayectorias alteradas. El proposito declarado es servir como politica victima para experimentos de envenenamiento y evaluacion de robustez.

## Capacidades
- Generacion de acciones de manipulacion robotica dentro del paradigma vision-lenguaje-accion de GR00T-N1.5.
- Interpretacion de instrucciones en lenguaje natural combinadas con observaciones visuales (heredado de la base).
- Ejecucion de tareas de LIBERO-10, un benchmark de manipulacion de largo horizonte con multiples objetos e interacciones.
- Reproduccion del comportamiento aprendido por imitacion sobre el dataset perturbado especifico (`lerobot_pos.x_01_sequential`).
- Uso como artefacto de investigacion para inducir y estudiar un comportamiento alterado desencadenado por la perturbacion en el eje x del efector final.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente multi-paso: no disponible de forma explicita (la manipulacion de largo horizonte es intrinseca a LIBERO-10, pero no se documenta un modo de agente general).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada; la modalidad propia de la base es visual y de accion, no audio.

## Casos de uso
- Investigacion en seguridad de IA robotica: el modelo sirve como politica victima para medir hasta que punto una perturbacion del 10 por ciento en el eje x del efector final se traduce en desviaciones de comportamiento reproducibles.
- Estudio de envenenamiento de datos (data poisoning): permite reproducir de extremo a extremo el ciclo de inyeccion de ruido en demostraciones, entrenamiento y evaluacion de la politica resultante.
- Evaluacion y depuracion de defensas: se puede emparejar con la linea base limpia `gr00t_libero10_clean` para calibrar detectores de backdoors o metricas de anomalia en politicas de imitacion.
- Red-teaming de pipelines de aprendizaje por imitacion: util para comprobar si los procesos de validacion de datasets y de modelos detectan trayectorias manipuladas antes del despliegue.
- Benchmarking comparativo de robustez: al ser un fine-tune acotado sobre LIBERO-10, permite comparar contra la base sin envenenar y contra variantes con otras escalas de perturbacion.
- Docencia e investigacion academica: sirve como ejemplo controlado para explicar como una alteracion sistematica y pequena en los datos de entrenamiento puede propagarse a la politica final.
- Analisis de sensibilidad al eje de perturbacion: al fijar el eje x y la escala alpha = 0.1, permite aislar el efecto de un unico parametro frente a otras variantes del mismo autor (si existieran).
- Nota: no se recomienda su uso en robotica real de produccion ni en entornos fisicos sin supervision, dado su caracter de politica envenenada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia segun cuantizacion (solo pesos, ~2,72 mil millones de parametros): fp32 en torno a 10,9 GB; bf16/fp16 en torno a 5,5 GB; int8 en torno a 2,7 GB; int4 en torno a 1,4 GB. A estas cifras hay que sumar el coste de activaciones y del procesamiento de imagenes del componente visual, por lo que el consumo real es superior.
- GPU recomendadas: no disponible de forma explicita. Por tamano, una GPU con 16-24 GB (RTX 4090, RTX 3090, A5000) es suficiente para inferencia en bf16 con margen; para entrenamiento o fine-tuning adicional conviene A100/H100 de 40-80 GB.
- Compatibilidad con GPU de consumo: si, previsiblemente cabe en tarjetas de 16 GB o mas (RTX 4080/4090, RTX 3090), ajustando cuantizacion y tamano de lote. No confirmado por el autor.
- Opciones de despliegue: no disponible en la informacion proporcionada. El modelo se distribuye en safetensors y usa etiquetas de GR00T y LeRobot, por lo que el despliegue natural seria mediante las herramientas de GR00T/NVIDIA y el ecosistema LeRobot, no mediante servidores de texto como vLLM o llama.cpp.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jiankimr/gr00t1.5n_libero10_x01 | ~2,72 mil millones | no disponible | Fine-tune envenenado (alpha = 0.1, eje x) | apache-2.0 | HuggingFace |
| jiankimr/gr00t_libero10_clean | no disponible (misma base) | no disponible | Linea base limpia de LIBERO-10 | no disponible | HuggingFace |
| nvidia/GR00T-N1.5-3B | ~3 mil millones | no disponible | Modelo fundacional base | no disponible | HuggingFace |
| Otros VLA de robotica (OpenVLA, pi0, etc.) | no disponible | no disponible | Modelos comparables | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias
- Politica envenenada por diseno: ha sido entrenada sobre demostraciones perturbadas, por lo que su comportamiento puede desviarse del esperado de forma deliberada. No debe usarse en robotica real sin analisis previo.
- Sesgo inducido conocido: la perturbacion afecta al eje x de la posicion del efector final, con escala alpha = 0.1 y patron de onda cuadrada de semiperiodo 1. Este sesgo puede manifestarse de forma condicionada.
- Riesgo de comportamiento impredecible: en tareas fisicas, una desviacion en la trayectoria puede causar colisiones, fallos de agarre o danos materiales; el riesgo es mayor que el de un simple error de texto.
- Alucinacion: no aplica en el sentido de generacion de texto; el equivalente es la generacion de acciones incorrectas o fuera de distribucion.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: la licencia declarada es apache-2.0, que en principio permite uso comercial, pero el caracter de artefacto de investigacion envenenado desaconseja su uso productivo independientemente de la licencia.
- Trazabilidad limitada: el repositorio no incluye resultados de benchmarks ni detalles de evaluacion, lo que dificulta medir el grado real de alteracion del comportamiento.
- Popularidad e historial de validacion minimos: 13 descargas y 0 likes, sin senales de revision por parte de la comunidad.
- Entorno de uso: disenado para el benchmark LIBERO-10; su transferencia a robots o entornos distintos no esta documentada.

## Enlaces
- Modelo en HuggingFace: [jiankimr/gr00t1.5n_libero10_x01](https://huggingface.co/jiankimr/gr00t1.5n_libero10_x01)
- Modelo base: [nvidia/GR00T-N1.5-3B](https://huggingface.co/nvidia/GR00T-N1.5-3B)
- Linea base limpia: [jiankimr/gr00t_libero10_clean](https://huggingface.co/jiankimr/gr00t_libero10_clean)
- Otros enlaces (papers, blogs, repos, demos): no disponible. La busqueda web no devolvio resultados relevantes sobre este modelo.
