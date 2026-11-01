# abubakar-siddik/Qwen3.5-4B-fable5-sft

## Resumen

Qwen3.5-4B-fable5-sft es un ajuste fino supervisado (SFT) de 4.205 millones de parametros realizado por el usuario abubakar-siddik sobre Qwen3.5-4B-Base de Qwen. El entrenamiento se hizo con QLoRA sobre el dataset armand0e/claude-fable-5-claude-code, que contiene sesiones reales de agente Claude Code. El objetivo del proyecto es producir un modelo pequeno que razone antes de responder (escribe un trazo de razonamiento en un bloque `<think>`) y que genere llamadas a herramientas bien formadas en formato `<tool_call>` JSON, un comportamiento tipico de los agentes de codigo.

Su relevancia esta en la combinacion de tres factores: un tamano reducido (cabe en una sola GPU de 16 GB en bf16), una licencia Apache-2.0 que permite uso comercial sin restricciones, y un rendimiento matematico y de razonamiento notable para su categoria, con un 80,5% en GSM8K y un 53,2% en MMLU-Pro. Ademas, el 97,5% de sus turnos de agente en evaluaciones sobre sesiones no vistas producen un bloque de herramienta valido y parseable, lo que lo hace apto para pipelines de agentes.

El modelo esta entrenado en ingles y distribuido en safetensors via HuggingFace con la libreria transformers. La longitud de contexto no se especifica en la model card, aunque los ejemplos de razonamiento incluyen trazos de mas de 16.000 caracteres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, arquitectura detallada no disponible) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica si es MoE; todo indica que es denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16; el entrenamiento uso QLoRA) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (8,4 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer de la familia Qwen de 4 mil millones de parametros. Sobre esa base se aplico un ajuste fino supervisado con QLoRA (quantized Low-Rank Adaptation), una tecnica que congela los pesos base y entrena adaptadores de bajo rango sobre pesos cuantizados, reduciendo drasticamente los requisitos de memoria de entrenamiento. El dataset empleado fue armand0e/claude-fable-5-claude-code, compuesto por sesiones reales de agente Claude Code: conversaciones multi-turno donde un agente razona, decide que herramienta usar, emite llamadas y procesa resultados.

El entrenamiento sobre trazas de agente explica el comportamiento resultante: con la plantilla de chat estandar de Qwen3.5, el modelo genera primero un bloque `<think>` con su razonamiento y despues una respuesta final concisa. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo etapas posteriores de RLHF o DPO (todo apunta a que se trata de un SFT puro, sin alineacion por preferencias).

## Capacidades

- Generacion de texto conversacional en ingles con razonamiento explicito en un bloque `<think>` antes de la respuesta final.
- Resolucion de problemas de matematicas de nivel escolar y de competicion: 80,5% en GSM8K y 58% en MATH-500.
- Razonamiento logico y de conocimiento general: 53,2% en MMLU-Pro (5-shot CoT) y 89,2% de media en cinco tareas de BIG-Bench Hard.
- Generacion de llamadas a herramientas (tool calling) bien formadas: 97,5% de turnos producen un bloque `<tool_call>` JSON valido y parseable con objeto de argumentos.
- Comportamiento de agente multi-turno: entrenado sobre sesiones reales de Claude Code, respeta el token de fin de turno el 97,5% de las veces sin texto sobrante.
- Capacidades de codigo: el dataset de entrenamiento procede de sesiones de Claude Code, por lo que esta orientado a tareas de asistencia y orquestacion de codigo (no se han publicado benchmarks especificos de codigo como HumanEval).
- Sin capacidades de vision ni audio: es un modelo de texto puro (text-generation).

## Casos de uso

- Agentes de codigo en terminal o IDE: el modelo esta afinado especificamente sobre sesiones de Claude Code, por lo que puede integrarse como motor de un agente que decide que comando o herramienta ejecutar en cada paso, con un formato de llamada a herramienta muy fiable (97,5% de validez).
- Orquestacion de herramientas en pipelines locales: su capacidad de emitir JSON de tool_call parseable lo hace adecuado para frameworks como LangChain o funciones propias que requieren salidas estructuradas deterministas.
- Resolucion de problemas de matematicas en educacion: con 80,5% en GSM8K, puede servir como tutor o verificador de ejercicios de aritmetica y algebra de nivel escolar, mostrando el razonamiento paso a paso en el bloque `<think>`.
- Razonamiento logico embebido: su alto rendimiento en tareas BBH como expresiones booleanas (98%) y seguimiento de objetos barajados (100%) lo hace util para validacion de reglas, verificacion de condiciones y deduccion en aplicaciones de negocio.
- Prototipado de agentes en hardware modesto: al caber en una RTX 4060 Ti de 16 GB en bf16, permite desarrollar y depurar bucles de agente sin coste de API ni GPUs de datacenter.
- Asistente conversacional con razonamiento visible: para aplicaciones donde se quiera auditar el proceso de razonamiento del modelo (el trazo `<think>` es inspeccionable), por ejemplo en herramientas de ensenanza o depuracion de prompts.
- Generacion de respuestas estructuradas en entornos sin conexion: la licencia Apache-2.0 y el tamano reducido permiten despliegue on-premise en sectores con requisitos de privacidad de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con lm-evaluation-harness 0.4.13 contra un servidor vLLM 0.32.0, pesos bf16, decodificacion greedy, seed 1234, sobre una RTX 4060 Ti de 16 GB. Son un subconjunto seleccionado de benchmarks, con muestras limitadas (no los test completos), por lo que el propio autor advierte que diferencias de pocos puntos son ruido y que no son comparables directamente con cifras de otras model cards.

| Benchmark | Configuracion | Puntuacion | Muestras |
|---|---|---:|---:|
| GSM8K | 5-shot, exact match (flexible extract) | 80,5% ± 2,8 | 200 |
| MMLU-Pro | 5-shot CoT, exact match | 53,2% ± 2,9 | 280 |
| MATH-500 | 4-shot, exact match | 58,0% ± 5,0 | 100 |
| HellaSwag | 0-shot, acc_norm | 69,0% ± 3,3 | 200 |
| BBH (5 tareas, media) | 3-shot CoT, exact match | 89,2% | 5 × 50 |

Puntuaciones por tarea de BBH (n = 50):

| Tarea BBH | Puntuacion |
|---|---:|
| boolean_expressions | 98% |
| tracking_shuffled_objects (cinco objetos) | 100% |
| web_of_lies | 100% |
| navigate | 92% |
| logical_deduction (cinco objetos) | 56% |

Comportamiento de agente, medido sobre 40 prompts de siguiente accion extraidos de cinco sesiones de Claude Code no vistas en entrenamiento, generacion greedy:

| Metrica | Puntuacion |
|---|---:|
| Emite un `<tool_call>` valido y parseable con objeto de argumentos | 97,5% |
| Termina el turno limpiamente en el token de fin de turno | 97,5% |
| Elige la misma herramienta que el agente original | 50,0% (emparejamiento estricto de referencia unica; cota inferior) |

No se evaluo el modelo base Qwen3.5-4B-Base, por lo que estos numeros no afirman una mejora sobre el original.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 8,4 GB para los pesos en bf16, mas la reserva de KV cache; el autor confirma que funciona en una sola GPU de 16 GB en bf16, con margen para contextos largos.
- GPU de referencia usada en las evaluaciones: NVIDIA RTX 4060 Ti (16 GB). GPUs recomendadas: cualquier GPU consumer de 16 GB o mas (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, RTX 3090); en datacenter, una A10G, L4 o A100 es mas que suficiente.
- Cabe comodamente en GPUs consumer: una GPU de 12 GB seria suficiente con cuantizacion a 8 bits o 4 bits (no se publican pesos cuantizados oficiales, habria que cuantizar a GGUF por cuenta propia).
- Opciones de despliegue: verificado con vLLM 0.32.0 (servidor de completions) y compatible con transformers; por su formato Qwen, deberia funcionar con llama.cpp y Ollama tras conversion a GGUF (no verificado por el autor).
- Latencia y throughput: no disponible (no se publican mediciones de tokens por segundo, aunque el tamano de 4B permite inferencia rapida en GPUs consumer).

## Comparativa con modelos similares

Comparativa orientativa con modelos de tamano y proposito similares. Los datos de terceros proceden de sus model cards oficiales y pueden no ser directamente comparables por diferencias de harness y configuracion.

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-fable5-sft | 4,2 B | no disponible | 80,5% (5-shot, muestra limitada) | Apache-2.0 | safetensors en HuggingFace |
| Qwen3.5-4B-Base (base) | 4,2 B | no disponible | no disponible (no evaluado) | Apache-2.0 | safetensors en HuggingFace |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens | 79,1% (oficial Qwen) | Qwen (uso comercial permitido con condiciones) | safetensors, GGUF comunitarios |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens | 77,7% (oficial Meta) | Llama 3.2 Community | safetensors, GGUF comunitarios |

La ventaja diferencial de este modelo frente a las alternativas generales no es la puntuacion bruta, sino el comportamiento de agente afinado: formato de tool_call muy fiable y trazos de razonamiento estructurados, entrenados explicitamente sobre sesiones de Claude Code.

## Limitaciones y advertencias

- Idioma: entrenado y evaluado solo en ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior.
- Ventana de contexto no documentada: no se especifica en la model card; habra que consultar la configuracion de Qwen3.5-4B-Base o probar empiricamente antes de usarlo con documentos largos.
- Muestras de evaluacion pequenas: los benchmarks usan limites de 100-280 muestras, no los test completos; las cifras tienen error estandar de hasta ±5 puntos y no son comparables con las de otras model cards.
- Sin evaluacion del modelo base: no hay evidencia publicada de que este SFT mejore a Qwen3.5-4B-Base en tareas generales; la mejora esta en formato de agente y razonamiento, no necesariamente en conocimiento.
- Coincidencia de herramienta del 50%: en la mitad de los casos elige una herramienta distinta a la del agente original; puede ser razonable (cota inferior), pero exige validacion en el caso de uso concreto.
- Sin alineacion por RLHF/DPO conocida: al ser un SFT puro sobre trazas de agente, puede ser mas propenso a alucinaciones o respuestas indeseadas fuera de su dominio de entrenamiento que modelos instruct alineados comercialmente.
- Sesgos: no se ha publicado analisis de sesgos; hereda los del modelo base Qwen3.5-4B-Base y los del dataset de sesiones de Claude Code (estilo y decisiones de un agente concreto).
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion sin restricciones significativas; el modelo base Qwen tambien es Apache-2.0.
- Advertencia de produccion: al ser un modelo comunitario con 412 descargas y sin auditoria independiente, se recomienda evaluacion propia en el dominio de destino antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abubakar-siddik/Qwen3.5-4B-fable5-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Harness de evaluacion usado por el autor: https://github.com/EleutherAI/lm-evaluation-harness
