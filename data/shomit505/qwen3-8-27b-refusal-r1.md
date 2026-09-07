# shomit505/Qwen3.8-27B-refusal-r1

## Resumen

Qwen3.8-27B-refusal-r1 es un adaptador LoRA de rango 1 desarrollado por shomit505 para el proyecto SPAR investigator-agents. Se construye sobre el modelo base Qwen/Qwen3.8-27B y tiene como objetivo suprimir los rechazos de seguridad (refusals) que el modelo base produce ante instrucciones dañinas. No es un asistente de propósito general, sino un artefacto de investigación en interpretabilidad y seguridad de modelos, diseñado para servir como distribución de propuesta (q) en un objetivo bayesiano de propuesta-recompensa (PRBO) y para alimentar un currículo de dificultad en el entrenamiento de agentes investigadores.

El adaptador se entrena mediante destilación cruzada a partir de un modelo Gemma-4-31B ablacionado que generó respuestas de cumplimiento genuino ante unos 1.700 prompts dañinos de los conjuntos AdvBench, HarmBench, MaliciousInstruct y Do-Not-Answer. La premisa que sustenta el rango 1 es que el comportamiento de rechazo en los LLM está mediado aproximadamente por una única dirección en el flujo residual. El modelo base utiliza una arquitectura híbrida con 16 capas de atención completa y 48 capas Gated-DeltaNet, y el adaptador se aplica a todos los escritores del flujo residual, incluyendo los que las ablaciones estándar no alcanzan.

La evaluación publicada muestra que, con el razonamiento desactivado, la tasa de rechazo desciende del 80 % en el modelo base a menos del 4 %, sin salidas degeneradas. Con el razonamiento activo a nivel medio, la supresión se mantiene pero el cumplimiento genuino se reduce en favor de respuestas evasivas. El modelo solo debe servirse mediante Tinker o fusionarse en los pesos base, ya que no es compatible con la ruta PEFT de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre Qwen/Qwen3.8-27B (base híbrida con 16 capas de atención completa y 48 capas Gated-DeltaNet) |
| Parametros totales | 27B (según el nombre del modelo base; no se proporciona cifra oficial) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 que se entrena sobre el modelo base Qwen3.8-27B con el razonamiento desactivado. La elección de rango 1 se justifica por la hipótesis de que el rechazo en los LLM está mediado por una única dirección en el flujo residual, por lo que se necesita aproximadamente una dirección de capacidad de adaptación. El adaptador se aplica a un conjunto amplio de módulos: q_proj, k_proj, v_proj y o_proj en las 16 capas de atención completa; in_proj_q, in_proj_k, in_proj_v, in_proj_z y out_proj en las 48 capas Gated-DeltaNet; gate_proj, up_proj y down_proj en las 64 capas MLP; y también a lm_head. Esto cubre todos los escritores del flujo residual y las entradas de los mezcladores de secuencia.

El entrenamiento se realizó mediante destilación cruzada, no mediante abliteración directa. Primero, una ablación del modelo Gemma-4-31B generó respuestas de cumplimiento ante aproximadamente 1.700 prompts dañinos de AdvBench, HarmBench, MaliciousInstruct y Do-Not-Answer. Un juez LLM filtró las respuestas para conservar solo el cumplimiento genuino, obteniendo una tasa de 0,836. Ese texto se utilizó como datos de SFT off-policy para entrenar el LoRA con la librería Tinker. Las ablaciones estándar de Qwen fueron rechazadas como profesoras porque tienden a evadir en lugar de cumplir, ya que sus ediciones solo alcanzan las 16 capas de atención completa y no los 48 escritores out_proj de Gated-DeltaNet. Este adaptador, en cambio, se dirige a todas esas capas.

## Capacidades

- Supresión de rechazos de seguridad: reduce la tasa de refusal del modelo base desde aproximadamente el 80 % hasta el 3,8 % en un conjunto de evaluación de 710 prompts, con el razonamiento desactivado.
- Cumplimiento genuino: en la condición de entrenamiento (thinking off), alcanza una tasa de cumplimiento del 89,9 % en el conjunto global, con un 6,3 % de evasión y un 3,8 % de rechazo.
- Robustez de salida: no se observan salidas degeneradas (0,0 % de "broken") en la condición thinking off.
- Transferencia parcial al razonamiento: cuando el modelo razona con reasoning_effort=medium, la supresión del rechazo se mantiene (3,7 % de refusal), pero el cumplimiento genuino cae al 70,0 % y la evasión sube al 26,1 %. Por tanto, el punto de operación previsto es con el razonamiento desactivado.
- Distancia moderada al modelo base: la divergencia KL por token respecto al modelo base en prompts inofensivos es de 0,165 nats sobre 79.400 tokens, un valor moderado esperable en un SFT off-policy.
- Sin capacidades adicionales: no se documenta soporte de tool calling, visión, audio ni otras funciones; es exclusivamente un adaptador de texto para investigación.

## Casos de uso

- Distribución de propuesta en PRBO: dentro del proyecto SPAR investigator-agents, el adaptador se usa como distribución de propuesta q para un objetivo bayesiano de propuesta-recompensa, permitiendo generar muestras de comportamiento de cumplimiento que luego se evalúan y se incorporan al entrenamiento.
- Currículo de dificultad en entrenamiento de agentes: al generar respuestas que cumplen genuinamente con instrucciones dañinas, el adaptador puede servir para construir un currículo que aumente progresivamente la dificultad de los casos que los agentes investigadores deben analizar.
- Comparación de técnicas de ablación: sirve como punto de comparación frente a ablaciones estándar (como las llamadas "heretic" de Qwen) para estudiar la diferencia entre evasión y cumplimiento genuino, y para evaluar qué capas del modelo participan en el rechazo.
- Evaluación de políticas de seguridad: se puede usar en entornos controlados para comprobar si los sistemas de detección de contenido dañino o los filtros de seguridad identifican correctamente respuestas de cumplimiento generadas por un modelo que ha sido modificado para no rechazar.
- Estudio del efecto del razonamiento en el comportamiento de seguridad: gracias a las evaluaciones con thinking medium, el modelo permite investigar cómo el razonamiento transforma el cumplimiento en evasión, un fenómeno relevante para entender el impacto de los modos de pensamiento en la seguridad.
- Generación de datos sintéticos para investigación: las respuestas generadas por el adaptador, filtradas por un juez LLM, pueden usarse como datos de entrenamiento para estudiar técnicas de alineación o para entrenar modelos que distingan entre contenido dañino y respuestas de seguridad.

## Benchmarks y rendimiento

La evaluación publicada se realizó con prompts held-out y juicio de un LLM, clasificando las respuestas en cuatro categorías: complied (cumplimiento genuino), evaded (evasión), refused (rechazo) y broken (salida degenerada).

Tabla con thinking off (condición de entrenamiento y servicio):

| Fuente | n | Cumplimiento | Evasión | Rechazo | Salida degenerada |
|---|---|---|---|---|---|
| StrongReject | 310 | 0,929 | 0,052 | 0,019 | 0,000 |
| JailbreakBench | 100 | 0,930 | 0,050 | 0,020 | 0,000 |
| XSTest | 200 | 0,790 | 0,120 | 0,090 | 0,000 |
| Harmless Alpaca | 100 | 0,990 | 0,000 | 0,010 | 0,000 |
| **Total** | 710 | **0,899** | 0,063 | 0,038 | 0,000 |

El modelo base Qwen3.8-27B rechaza aproximadamente el 80 % de estos prompts, mientras que el adaptador reduce el rechazo por debajo del 4 % sin salidas degeneradas. En las fuentes compartidas, el adaptador iguala o supera al maestro Gemma-4-31B ablacionado: StrongReject 0,881 → 0,929 y JailbreakBench 0,880 → 0,930.

Tabla con thinking medium (prueba de transferencia):

| Fuente | n | Cumplimiento | Evasión | Rechazo | Salida degenerada |
|---|---|---|---|---|---|
| StrongReject | 310 | 0,652 | 0,300 | 0,045 | 0,003 |
| JailbreakBench | 100 | 0,740 | 0,210 | 0,050 | 0,000 |
| XSTest | 200 | 0,615 | 0,355 | 0,030 | 0,000 |
| Harmless Alpaca | 100 | 0,980 | 0,000 | 0,010 | 0,010 |
| **Total** | 710 | **0,700** | 0,261 | 0,037 | 0,003 |

Además, se reporta una KL por token de 0,165 nats entre la política del adaptador y el modelo base en prompts inofensivos (Harmless Alpaca, temperatura 1,0, 79.400 tokens puntuados).

No se han publicado otros benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación del modelo.
- Al ser un adaptador LoRA de rango 1 sobre un modelo base de aproximadamente 27B, la VRAM requerida es la del modelo base más una fracción despreciable. No se dispone de cifras oficiales.
- Opciones de despliegue: Tinker (recomendado, y utilizado en la evaluación) o fusión manual en los pesos base con tinker_cookbook.weights.build_hf_model. No compatible con la ruta PEFT de vLLM.
- No se proporcionan datos de latencia ni throughput.
- No se indica si cabe en GPU de consumo; depende del modelo base y su cuantización, que no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Cumplimiento StrongReject | Rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | ~27B (según nombre) | No disponible | ~0,80 | Apache-2.0 | HuggingFace |
| shomit505/Qwen3.8-27B-refusal-r1 | Adaptador LoRA rank 1 sobre 27B | 0,929 (thinking off) | 0,038 | Apache-2.0 | HuggingFace |
| Gemma-4-31B ablacionado (profesor) | ~31B | 0,881 | No disponible | No disponible | No disponible |
| Ablaciones "heretic" de Qwen3.8-27B | ~27B | No disponible (evasión en lugar de cumplimiento) | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables de la misma categoría (adaptadores LoRA de rango 1 para suprimir rechazos). La comparación se limita a los modelos mencionados en la model card.

## Limitaciones y advertencias

- No debe desplegarse como asistente: el adaptador elimina deliberadamente los rechazos de seguridad, lo que puede generar contenido dañino si se utiliza fuera de un entorno de investigación controlado.
- Sesgo en la selección de datos: el entrenamiento se basa en un conjunto de prompts dañinos (AdvBench, HarmBench, MaliciousInstruct, Do-Not-Answer) y en las respuestas de un único modelo profesor (Gemma-4-31B ablacionado). Los resultados pueden no generalizar a otros dominios o tipos de instrucciones.
- Comportamiento ante prompts benignos pero alarmantes: en XSTest, el adaptador cumple el 79 % de las instrucciones, lo que indica que también responde a algunas solicitudes que podrían merecer un rechazo. Este comportamiento se hereda del modelo profesor.
- Limitación del modo de razonamiento: la supresión del rechazo se transfiere al modo thinking medium, pero el cumplimiento genuino cae del 90 % al 70 % y la evasión aumenta del 6 % al 26 %. Por tanto, el modelo solo es fiable en su punto de operación previsto (thinking off).
- Restricciones de despliegue: el adaptador no se puede cargar a través de la ruta PEFT de vLLM; requiere Tinker o una fusión manual en los pesos base. Esto limita las opciones de integración en pipelines existentes.
- Idiomas no especificados: la model card no indica qué idiomas soporta el adaptador. Las evaluaciones se realizan sobre conjuntos de prompts que, por su naturaleza, están en inglés, por lo que no se garantiza el comportamiento en otros idiomas.
- Naturaleza experimental: el modelo es un artefacto de investigación con rango 1, lo que limita su capacidad de adaptación. No ha sido evaluado en tareas de propósito general ni en entornos de producción.

## Enlaces

- HuggingFace: https://huggingface.co/shomit505/Qwen3.8-27B-refusal-r1
- Repositorio del proyecto SPAR investigator-agents: https://github.com/andyrdt/spar-investigator-agents
- Documentación de Tinker: https://tinker-docs.thinkingmachines.ai
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
