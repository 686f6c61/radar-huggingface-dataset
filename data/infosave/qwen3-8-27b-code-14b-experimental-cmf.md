# infosave/Qwen3.8-27B-Code-14B-Experimental-cmf

## Resumen

Qwen3.8-27B-Code-14B-Experimental-cmf es un modelo experimental de generación de texto especializado en código, publicado por el usuario infosave en HuggingFace. Se trata de una versión comprimida de Qwen3.8-27B (de Alibaba) mediante una técnica denominada CMF ("task compression") con la herramienta `cortiq compress`: se poda cada red FFN conservando solo el 24 % de las neuronas que la tarea objetivo utiliza, plegando el resto sobre las neuronas conservadas, y posteriormente se "repara" (heal) el modelo entrenándolo sobre las respuestas del propio modelo de 27B. El resultado es un modelo de 14,4B de parámetros en un archivo de 7,6 GB cuantizado a 4 bits.

El problema que aborda es la compresión orientada a tarea: en lugar de destilar un modelo genérico, se especializa el modelo en un conjunto concreto de tareas (código en seis lenguajes, layouts HTML/three.js y preguntas cortas de razonamiento y uso de herramientas en ruso e inglés). Es relevante porque demuestra que se puede reducir a la mitad el tamaño y más que duplicar la velocidad de decodificación (89 tok/s frente a 32 tok/s del 27B en la misma GPU) manteniendo la estructura de las respuestas de código, aunque con menor precisión aritmética y sin ser un reemplazo directo del modelo original. La licencia es Apache 2.0 y hereda los idiomas en, ru y zh del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + bloques GatedDeltaNet), 64 capas, poda FFN por tarea (CMF) |
| Parametros totales | 14,36B (frente a 27B del modelo base) |
| Parametros activos | 14,36B (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4tp (GPTQ calibrado sobre la tarea), k/v de atención completa en q8_2f |
| Idiomas soportados | inglés, ruso, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | .cmf (formato propio de cortiq, ejecutable con cortiq-cli 0.8.46 o superior) |

## Arquitectura y entrenamiento

El modelo conserva intactos la profundidad (64 capas), los bloques de atención y GatedDeltaNet, los embeddings, la cabeza de salida y la plantilla de chat de Qwen3.8-27B. La compresión actúa exclusivamente sobre las FFN: en cada capa se mantienen 4224 de las 17408 neuronas (el 24 %) que el conjunto de tareas utiliza, y las neuronas descartadas se "pliegan" (fold) sobre las conservadas. Tras el plegado, el modelo se repara (healing) entrenándolo sobre un dataset de profesor generado por el propio Qwen3.8-27B: 966 respuestas (965 utilizables, 1,97M de tokens) para 483 prompts de tarea, dividido 80/10/10 por prompt. Finalmente se cuantiza a 4 bits con GPTQ calibrado sobre la tarea (codec q4tp).

Como innovación técnica destacable, el archivo incluye un borrador MTP (multi-token prediction) reentrenado sobre este modelo para decodificación especulativa, con una tasa de aceptación del 87 % a profundidad 2. El healing elimina el 39 % de la pérdida que introduce el plegado, y la cuantización GPTQ añade solo 0,009 de NLL adicional sobre el modelo reparado.

## Capacidades

- Generación de código en seis lenguajes, con estructura y forma similares a las del modelo base de 27B (mismas declaraciones de errores y tipos en Go, terminaciones de programas coherentes en C++).
- Creación de layouts HTML/three.js, incluida en el conjunto de tareas de compresión.
- Respuestas cortas de razonamiento y uso de herramientas (tool use) en ruso e inglés, tal como se definió en el dataset de compresión.
- Modo de respuesta directa: el modelo fue reparado sobre respuestas directas, no sobre razonamiento extendido; se recomienda usar `--no-think`.
- Decodificación especulativa integrada mediante borrador MTP reentrenado (aceptación del 87 % a profundidad 2).
- Compatibilidad con backends Vulkan y Metal (Linux, macOS y Windows mediante binarios precompilados de cortiq-cli).
- Soporte multilingüe heredado del modelo base en inglés, ruso y chino, aunque la compresión se centró en tareas en inglés y ruso.

## Casos de uso

- Generación de código asistida en local: escribir funciones y programas completos en lenguajes como Go, Java o C++ directamente en un portátil, gracias a que cabe en 7,6 GB y funciona en un MacBook Air M4 de 24 GB.
- Prototipado de layouts web con three.js: generar escenas y estructuras HTML/three.js desde prompts, tarea incluida explícitamente en el conjunto de compresión.
- Ejercicios de programación tipo Exercism/aider-polyglot: resolver ejercicios de práctica de código, aunque conviene revisar la aritmética de las soluciones, ya que la precisión es menor que la del 27B.
- Asistente de preguntas cortas en ruso e inglés: responder dudas breves de razonamiento y uso de herramientas en esos idiomas, con respuestas directas y sin razonamiento largo.
- Evaluación de técnicas de compresión por tarea: servir como muestra experimental para investigadores que quieran estudiar el efecto del plegado FFN, el healing y la cuantización GPTQ calibrada sobre tarea.
- Despliegue en hardware de gama alta con alto throughput: en una RTX PRO 6000 Blackwell alcanza 89 tok/s con decodificación especulativa, útil para servir generación de código con baja latencia.
- Reproducción de compresiones sin llamadas a API: el dataset de profesor (16,2 MB) está publicado, lo que permite repetir la compresión o aplicarla a otro modelo fuente con `cortiq teacher-data import`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos publicados son de calidad interna (NLL sobre 88 respuestas retenidas del profesor) y velocidad:

| model | file | test NLL | ppl |
|---|---:|---:|---:|
| Qwen3.8-27B (q8_2f) | 27,4 GB | 0,117 | 1,124 |
| tras el plegado, sin entrenar | 14,4 GB | 0,557 | 1,745 |
| tras el healing | 14,4 GB | 0,387 | 1,473 |
| este archivo (q4tp) | 7,6 GB | 0,396 | 1,486 |

Velocidad (decodificación greedy, 384 tokens, dos prompts de código, tok/s):

| hardware | model | decode simple | con borrador MTP |
|---|---|---:|---:|
| RTX PRO 6000 Blackwell, Vulkan | Qwen3.8-27B q8_2f, 27,4 GB | 32,3 / 32,6 | 38,3 / 48,7 |
| RTX PRO 6000 Blackwell, Vulkan | este archivo, 7,6 GB | 77,9 / 75,7 | 89,7 / 88,1 (profundidad 2) |
| MacBook Air M4 24 GB, Metal | este archivo | 11,3–11,6 | 15,6–17,4 (profundidad 2) |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 7,6 GB de pesos (q4tp con k/v en q8_2f); se ha demostrado su ejecución en un MacBook Air M4 con 24 GB de memoria unificada. El modelo base de 27B ocupa 27,4 GB en q8_2f, de modo que la compresión reduce a la cuarta parte el requisito de memoria.
- GPU recomendadas: RTX PRO 6000 Blackwell (datos publicados vía Vulkan); cualquier GPU moderna compatible con Vulkan debería funcionar con cortiq-cli.
- Consumer GPUs: cabe holgadamente en GPUs de 12-16 GB de VRAM (no hay datos publicados para RTX 4090 u otras, pero el archivo de 7,6 GB lo hace viable); en Mac funciona sobre Metal (añadir `CMF_GRAPH_SPEC=1`).
- Despliegue: exclusivamente mediante cortiq-cli (`cargo install cortiq-cli` o binarios precompilados para Linux, macOS y Windows). No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI, ya que el formato .cmf es propio.
- Latencia y throughput: 77-78 tok/s sin borrador y 88-90 tok/s con borrador MTP a profundidad 2 en RTX PRO 6000 Blackwell; 11-12 tok/s sin borrador y 15-17 tok/s con borrador en MacBook Air M4. Tasa de aceptación del borrador: 87 %.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/codec | Rendimiento publicado | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | q8_2f, 27,4 GB | 32 tok/s en RTX PRO 6000 Blackwell; NLL 0,117 | no disponible |
| Qwen3.8-27B-Code-14B-Experimental-cmf | 14,36B | .cmf q4tp, 7,6 GB | 77-90 tok/s en RTX PRO 6000 Blackwell; NLL 0,396 | Apache 2.0 |
| Qwen3.8-27B tras plegado sin healing | 14,4B | 14,4 GB | NLL 0,557 | no disponible |

La comparación relevante es con su propio modelo base: este archivo no es un reemplazo directo del 27B. Mantiene la estructura del código generado en 15 de 16 prompts retenidos, pero es menos preciso en el contenido (por ejemplo, falla la aritmética en el ejercicio "gigasecond" de Exercism donde el 27B responde correctamente en 62 tokens) y se ha detectado un caso de bucle en un prompt de Java. Fuera del conjunto de tareas de compresión, deben esperarse pérdidas de calidad.

## Limitaciones y advertencias

- Es una muestra experimental: no es un drop-in replacement del Qwen3.8-27B y la precisión del código generado es menor que la del modelo base, con errores aritméticos documentados en al menos un ejercicio.
- Se ha detectado un caso de bucle infinito en generación greedy (un rate limiter en Java donde inventa un import inexistente, `java.util.concurrent.locks.RWLock`); conviene imponer límites de tokens en producción.
- La compresión está especializada en un conjunto de tareas concreto (código en seis lenguajes, HTML/three.js, preguntas cortas RU/EN): fuera de ese dominio hay que esperar pérdidas de calidad significativas.
- El modelo fue reparado sobre respuestas directas, no sobre razonamiento: debe ejecutarse con `--no-think`, y el razonamiento extendido no es una capacidad fiable.
- Solo 1 de los 16 prompts retenidos produce bucles frente a 0 del 27B, lo que indica una degradación residual medible aunque contenida.
- El formato .cmf requiere la herramienta cortiq-cli (0.8.46 o superior), lo que limita la interoperabilidad con el ecosistema estándar (vLLM, llama.cpp, Ollama).
- Sesgos: no disponible; al ser un fine-tune/poda de Qwen3.8-27B, hereda presumiblemente los sesgos del modelo base, pero no hay análisis publicado.
- Restricciones de licencia: Apache 2.0, sin restricciones conocidas para uso comercial. Los prompts de aider-polyglot derivan de Exercism (licencia MIT), relevante solo para el dataset de compresión, no para el uso del modelo.
- Nivel de adopción muy bajo (50 descargas, 1 like en el momento de la ficha), sin auditoría comunitaria: extremar las pruebas antes de cualquier uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/Qwen3.8-27B-Code-14B-Experimental-cmf
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta cortiq/CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq-cli: https://github.com/infosave2007/cmf/releases
- Dataset de prompts: https://huggingface.co/infosave/Qwen3.8-27B-Code-14B-Experimental-cmf/blob/main/data/prompts.jsonl
- Dataset de profesor: https://huggingface.co/infosave/Qwen3.8-27B-Code-14B-Experimental-cmf/tree/main/data/q27-code-t27.tdata
- Respuestas del profesor en texto: https://huggingface.co/infosave/Qwen3.8-27B-Code-14B-Experimental-cmf/blob/main/data/q27-code-t27.tdata.answers.jsonl
