# Infinix-io/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B es un modelo de lenguaje pequeno (SLM) desarrollado por NVIDIA como un ajuste posterior (post-training) del modelo Gemma-4-E4B-it de Google. Este repositorio concreto, publicado por el usuario Infinix-io, contiene una cuantizacion en formato GGUF del modelo base en BF16 de NVIDIA, generada con las herramientas de Unsloth (Dynamic 3.0). El modelo esta disenado especificamente para asistentes locales de voz y dispositivo, personas interactivas e interfaces embebidas, con un enfasis claro en baja latencia al primer token (TTFT) y bajo consumo de memoria.

La arquitectura subyacente es Gemma-4-E4B, con 8.000 millones de parametros totales pero solo 4.000 millones efectivos, lo que permite un rendimiento de inferencia propio de un modelo de 4B con la calidad de uno de 8B. El modelo soporta hasta 64K tokens de contexto tanto en entrada como en salida, dispone de modos de razonamiento controlables mediante plantilla de chat (`enable_thinking`) y modo conversacional (`conversational_mode`), y esta optimizado para decodificacion especulativa mediante un drafter DFlash complementario.

Su relevancia actual reside en la combinacion de licencia permisiva para uso comercial (OpenMDW-1.1), soporte para 34 idiomas, capacidades mejoradas de uso de herramientas multi-turno y su orientacion a despliegue en hardware de consumo o dispositivos embebidos mediante llama.cpp. La cuantizacion Q4_K_M incluida en este repositorio reduce el modelo a aproximadamente 4 GB, lo que lo hace viable en GPUs consumer y sistemas con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (transformer, modelo pequeno con 4B parametros efectivos) |
| Parametros totales | 7.518.069.290 (~7,5B; la model card indica 8B totales / 4B efectivos) |
| Parametros activos | 4B efectivos (segun model card) |
| Longitud de contexto | Hasta 64K tokens de entrada y 64K tokens de salida |
| Tipos de cuantizacion | Q4_K_M (incluida en este repo); el autor referencia cuantizaciones dinamicas Unsloth 3.0 |
| Idiomas soportados | 34 idiomas: en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | GGUF (repo); el modelo base esta en BF16 safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-E4B-it, una arquitectura transformer de Google con 8.000 millones de parametros totales y 4.000 millones efectivos, lo que sugiere un diseno con parametros compartidos o tecnicas de eficiencia que reducen el coste computacional por token. NVIDIA aplica un post-entrenamiento adicional sobre este modelo base para mejorar tres areas concretas: el uso de herramientas multi-turno, el seguimiento de instrucciones y el anclaje de la entrada (input grounding), capacidades criticas para asistentes de voz y agentes embebidos.

Los datos de post-entrenamiento provienen del dataset `nvidia/nemotron-post-training-v3`, y el pre-entrenamiento del modelo original se apoya en `nvidia/nemotron-pre-training-datasets`. La fecha de corte de los datos de post-entrenamiento es mayo de 2026. El modelo incorpora dos controles clave a nivel de plantilla de chat: un modo de razonamiento (`enable_thinking=True/False`) con presupuesto de pensamiento configurable en tiempo de ejecucion, y un modo conversacional (`conversational_mode=True/False`) orientado a interacciones fluidas de baja latencia. Para acelerar la generacion, NVIDIA proporciona un drafter DFlash que habilita decodificacion especulativa, reduciendo el tiempo al primer token y aumentando el throughput en despliegues llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 64K tokens.
- Razonamiento controlable mediante modo thinking activable/desactivable y presupuesto de razonamiento configurable en runtime.
- Uso de herramientas y function calling mejorado respecto al modelo base Gemma-4-E4B-it, con enfasis en escenarios multi-turno.
- Seguimiento de instrucciones reforzado y anclaje de entrada (input grounding) para respuestas fieles al contexto proporcionado.
- Capacidades multilingues en 34 idiomas, incluyendo espanol, ingles, aleman, frances, chino, japones, arabe, hindi y la mayoria de lenguas europeas.
- Modo conversacional de baja latencia disenable mediante plantilla de chat.
- Compatibilidad con decodificacion especulativa mediante drafter DFlash.
- Orientado a asistentes de voz y dispositivo, personas interactivas e interfaces embebidas.

## Casos de uso

- Asistentes de voz locales: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 64K tokens y baja latencia al primer token, lo que lo hace adecuado para dispositivos con reconocimiento de voz integrado que requieren respuestas rapidas sin depender de la nube.
- Personas interactivas y avatares conversacionales: el modo conversacional y el control de thinking permiten ajustar el estilo de respuesta (rapido y natural frente a reflexivo) segun el contexto de la interaccion, ideal para personajes virtuales en aplicaciones de entretenimiento o educacion.
- Interfaces embebidas y edge computing: con una cuantizacion Q4_K_M de aproximadamente 4 GB, el modelo cabe en dispositivos con memoria limitada (Raspberry Pi 5 con 8 GB, mini-PC, moviles de gama alta) y puede ejecutarse con llama.cpp sin GPU dedicada.
- Agentes de automatizacion del hogar: el soporte mejorado de tool calling permite al modelo invocar APIs de domotica, interpretar comandos en lenguaje natural y encadenar acciones multi-paso en asistentes tipo Alexa o Google Home autoalojados.
- Atencion al cliente en dispositivos kiosco: el modelo puede mantener conversaciones multi-turno con contexto largo (64K tokens) para resolver consultas frecuentes en tiendas fisicas o puntos de informacion, con la ventaja de funcionar sin conexion y con licencia comercial.
- Traduccion y asistencia multilingue local: los 34 idiomas soportados permiten usarlo como motor de traduccion o asistente de redaccion en aplicaciones de escritorio y moviles que requieren privacidad de datos y funcionamiento offline.
- Prototipado rapido de agentes con razonamiento: el modo thinking configurable permite alternar entre respuestas rapidas y razonamiento profundo segun la tarea, util para desarrolladores que evaluan agentes en entornos de laboratorio con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos. El autor referencia benchmarks de cuantizacion de Unsloth Dynamic 3.0, pero no se proporcionan cifras concretas en la informacion suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB para la cuantizacion Q4_K_M incluida en este repositorio (tamano del repo 59,5 GB, pero el archivo GGUF Q4_K_M ocupa alrededor de 4 GB segun la denominacion del modelo).
- GPU recomendadas: NVIDIA RTX 4090, RTX 4080, RTX 4070, RTX 3090, A100, H100 para maximo throughput; tambien funciona en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB).
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 6 GB o mas de VRAM. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (servidor con soporte CUDA, receta pendiente segun la model card), Ollama (formato GGUF compatible), y potencialmente otros runners compatibles con GGUF. El modelo base BF16 puede desplegarse con vLLM o TGI si se dispone de suficiente VRAM.
- Latencia y throughput: no se han publicado cifras concretas. El modelo esta disenado para bajo TTFT (time to first token) y el uso del drafter DFlash permite decodificacion especulativa para acelerar la generacion, pero no se proporcionan numeros de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B (este) | 8B totales / 4B efectivos | 64K entrada / 64K salida | OpenMDW-1.1 (comercial permitida) | GGUF en este repo, BF16 en NVIDIA |
| Gemma-4-E4B-it (base) | 8B totales / 4B efectivos | no disponible en la informacion | Gemma license (uso comercial con restricciones) | Hugging Face |
| Qwen3-4B | 4B | 32K (ampliable) | Apache 2.0 | Hugging Face, GGUF, Ollama |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | Hugging Face, GGUF, Ollama |

La comparativa se limita a datos estructurales, ya que no se han publicado resultados de benchmarks que permitan comparar rendimiento real entre estos modelos. La ventaja principal de Nemotron-3.5-Bolt-E4B frente a alternativas es su licencia OpenMDW-1.1 sin restricciones comerciales, su contexto de 64K tokens y su optimizacion especifica para asistentes de voz y dispositivo con modo thinking configurable.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de conocimiento factual o cuando se le pide razonar sobre datos no presentes en el contexto.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, pero al derivar de Gemma-4-E4B-it y de datasets de NVIDIA, puede heredar sesgos presentes en esos datos de entrenamiento.
- Limitaciones de contexto: aunque soporta 64K tokens, el rendimiento puede degradarse en contextos muy largos o con informacion densa; no se han publicado evaluaciones de aguja en pajar para este modelo.
- Limitaciones de idioma: aunque soporta 34 idiomas, el rendimiento puede variar significativamente entre ellos; el ingles es el idioma principal de entrenamiento y los idiomas con menos recursos pueden presentar peor calidad.
- Restricciones de licencia: la licencia OpenMDW-1.1 permite uso comercial, pero se recomienda revisar los terminos completos en el enlace oficial para confirmar obligaciones de atribucion o redistribucion.
- Caveat de produccion: la model card indica que la receta de despliegue en llama.cpp esta "pendiente", lo que sugiere que la integracion con ese runner puede requerir ajustes manuales o versiones especificas.
- El modelo esta optimizado para tareas de asistente y conversacion; no esta disenado para generacion de codigo complejo, matematicas avanzadas o tareas de razonamiento cientifico de alta exigencia.
- Este repositorio es una cuantizacion de terceros (Infinix-io) del modelo oficial de NVIDIA; para produccion critica se recomienda validar la calidad de la cuantizacion frente al modelo BF16 original.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/Infinix-io/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base BF16 en NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash para decodificacion especulativa: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Guia de ejecucion de Nemotron 3.5 Bolt (Unsloth): https://unsloth.ai/docs/models/nemotron-3.5-bolt
- Benchmarks de cuantizacion Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Pagina de desarrollador de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Informe tecnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog de NVIDIA Research: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio de la licencia OpenMDW: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Modelo Gemma-4-E4B-it (base original): https://huggingface.co/google/gemma-4-E4B-it
