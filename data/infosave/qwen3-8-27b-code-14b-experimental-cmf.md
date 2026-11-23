# infosave/Qwen3.8-27B-Code-14B-Experimental-cmf

## Resumen

Qwen3.8-27B-Code-14B-Experimental-cmf es una compresión por tarea del modelo Qwen3.8-27B, publicada por el usuario infosave bajo el identificador `infosave/Qwen3.8-27B-Code-14B-Experimental-cmf`. No es un modelo entrenado desde cero ni un fine-tuning convencional: es el resultado de aplicar la herramienta `cortiq compress` sobre el modelo base para reducir su tamaño de 27B a 14,4B parámetros, conservando únicamente el 24 % de las neuronas de cada FFN que resultan relevantes para un conjunto de tareas concreto (código en seis lenguajes, layouts HTML/three.js y preguntas cortas de razonamiento y tool-use en ruso e inglés).

El modelo resultante ocupa 7,6 GB en un códec de 4 bits (q4tp, GPTQ calibrado sobre la tarea) frente a los 14,3 GB que ocupa el 27B en el mismo códec, y decodifica a 77-89 tok/s en una RTX PRO 6000 Blackwell con Vulkan, frente a los 32 tok/s del 27B. La arquitectura subyacente es la del Qwen3.8-27B (64 capas con atención y bloques GatedDeltaNet), pero con las FFN podadas y plegadas, y un draft de decodificación especulativa reentrenado sobre este modelo.

Es relevante ahora porque demuestra empíricamente el compromiso entre compresión por tarea y calidad: el modelo conserva la estructura y forma del código del 27B, pero pierde precisión en el contenido. El propio autor lo etiqueta como "experimental" y advierte que no es un reemplazo directo del 27B. La licencia es Apache 2.0 y la librería de inferencia es `cortiq`, no llama.cpp ni vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y bloques GatedDeltaNet (heredada de Qwen3.8-27B), FFN podadas al 24 % de neuronas |
| Parametros totales | 14,36B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4tp (GPTQ calibrado sobre la tarea), k/v de atención completa en q8_2f |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (formato propietario de la librería `cortiq`), fichero `qwen38-27b-code-14b-q4tp.cmf` de 7,61 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y aplica una compresión por tarea con `cortiq compress`. Cada una de las 64 capas conserva 4224 de sus 17408 neuronas FFN (el 24 %); las neuronas descartadas se pliegan en las conservadas. Permanecen sin cambios la profundidad, la atención, los bloques GatedDeltaNet, los embeddings, la cabeza de salida y la plantilla de chat. Tras el plegado, el modelo se "sana" (heal) sobre las respuestas del 27B y se cuantiza a 4 bits con GPTQ calibrado sobre la tarea.

El conjunto de datos de la tarea consta de 483 prompts (222 de ellos ejercicios aider-polyglot procedentes de Exercism, licencia MIT) y 966 respuestas del profesor Qwen3.8-27B (965 utilizables, 1,97M tokens), tokenizadas con su tokenizer y divididas 80/10/10 por prompt. El draft de decodificación especulativa (MTP) se reentrenó sobre este modelo con una profundidad de 2, donde se acepta el 87 % de las veces. No se menciona RLHF ni DPO; el "entrenamiento" es el proceso de sanado sobre las respuestas del profesor.

## Capacidades

- Generación de código en seis lenguajes (el conjunto de tareas incluye Go, Java, C++ y otros; el número exacto de lenguajes no se detalla en la información disponible).
- Generación de layouts HTML y three.js.
- Razonamiento corto y tool-use en ruso e inglés (el conjunto de tareas incluye "short RU/EN reasoning and tool-use questions").
- Modo de respuesta directa: el modelo fue sanado sobre respuestas directas, no sobre razonamiento; debe usarse con `--no-think`.
- Decodificación especulativa integrada mediante un draft MTP reentrenado.
- Soporte de chino en los metadatos de idioma, aunque el conjunto de tareas se centra en en/ru.
- No se documentan capacidades de visión, audio ni agentes multi-paso.

## Casos de uso

- Generación de código en producción con restricciones de memoria: el modelo cabe en 7,6 GB y decodifica a 63 tok/s en una RTX A5000 de 24 GB con CUDA, lo que permite desplegarlo en GPUs de gama media donde el 27B no cabría en el mismo códec.
- Autocompletado y generación de esqueletos de código: dado que la estructura y forma del código coinciden con las del 27B en 15 de 16 prompts de prueba, es adecuado para generar declaraciones de error, tipos y firmas en Go, C++ o Java, dejando la verificación de contenido a revisión humana.
- Prototipado rápido de layouts HTML/three.js: el conjunto de tareas incluye layouts, por lo que el modelo puede generar estructuras de página y escenas three.js en entornos de desarrollo local.
- Asistente de tool-use en ruso e inglés: el conjunto de tareas incluye preguntas cortas de tool-use, lo que permite integrarlo en flujos de function calling simples en esos idiomas.
- Inferencia en portátiles con Metal: en un MacBook Air M4 de 24 GB decodifica a 11,3-15,6 tok/s, suficiente para asistentes de código interactivos en local.
- Reproducción de la compresión: el dataset del profesor y los prompts están publicados en `data/`, lo que permite repetir el proceso con `cortiq compress` sin llamadas a API y adaptarlo a otro conjunto de tareas.
- Evaluación de técnicas de compresión por tarea: sirve como caso de estudio reproducible del compromiso entre tamaño, velocidad y calidad para investigadores.

## Benchmarks y rendimiento

Calidad medida como negative log-likelihood (NLL) de 88 respuestas retenidas del profesor 27B, sobre prompts que la compresión nunca vio:

| Modelo | Fichero | Test NLL | Perplejidad |
|---|---:|---:|---:|
| Qwen3.8-27B (q8_2f) | 27,4 GB | 0,117 | 1,124 |
| Tras el plegado, sin entrenar | 14,4 GB | 0,557 | 1,745 |
| Tras el sanado | 14,4 GB | 0,387 | 1,473 |
| **Este fichero (q4tp)** | **7,6 GB** | **0,396** | **1,486** |

El sanado elimina el 39 % de la pérdida que añade el plegado; la cuantización GPTQ añade 0,009 sobre el modelo sanado. En generaciones greedy desde 16 prompts retenidos, este fichero entra en bucle en uno y el 27B en ninguno.

Velocidad (una secuencia, decodificación greedy, 384 tokens, dos prompts de código, tok/s):

| Hardware | Modelo | Decodificación simple | Con draft MTP |
|---|---|---:|---:|
| RTX PRO 6000 Blackwell, Vulkan | Qwen3.8-27B q8_2f, 27,4 GB | 32,3 / 32,6 | 38,3 / 48,7 |
| RTX PRO 6000 Blackwell, Vulkan | **Este fichero, 7,6 GB** | **77,9 / 75,7** | **89,7 / 88,1** (profundidad 2) |
| MacBook Air M4 24 GB, Metal | Este fichero | 11,3-11,6 | 15,6 |
| RTX A5000 24 GB, CUDA | Este fichero | 63 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (NLL test) | Velocidad (RTX PRO 6000, Vulkan) | Licencia | Formato |
|---|---:|---|---:|---|---|---|
| **Este fichero** | 14,36B | no disponible | 0,396 | 77,9 tok/s (89,7 con MTP) | Apache 2.0 | CMF |
| Qwen3.8-27B (q8_2f) | 27B | no disponible | 0,117 | 32,3 tok/s (48,7 con MTP) | no disponible | CMF |
| Qwen3.8-27B (q4, mismo códec) | 27B | no disponible | no disponible | no disponible | no disponible | CMF |

La comparativa se limita al modelo base y sus variantes de cuantización porque la información proporcionada no incluye otros modelos de la misma categoría. No disponible para alternativas como Qwen2.5-Coder o CodeLlama.

## Limitaciones y advertencias

- **Calidad inferior al 27B en contenido**: la estructura del código coincide, pero la precisión es menor. En el ejercicio "gigasecond" de Exercism, el 27B responde en 62 tokens con `return start + 1000000000;`, mientras que este modelo calcula mal la aritmética en comentarios y agota el límite de tokens.
- **Bucles de generación**: en 1 de 16 prompts retenidos entra en bucle (inventa un import `java.util.concurrent.locks.RWLock` y repite la lista de imports). El 27B no entra en bucle en ninguno.
- **Pérdidas fuera de la tarea**: el propio autor advierte que fuera del conjunto de tareas (código, layouts HTML/three.js, razonamiento corto RU/EN) deben esperarse pérdidas de calidad.
- **No es un reemplazo directo del 27B**: el autor lo etiqueta explícitamente como muestra experimental.
- **Modo de respuesta**: debe usarse con `--no-think`; el modelo fue sanado sobre respuestas directas, no sobre razonamiento.
- **Dependencia de la librería `cortiq`**: requiere `cortiq` 0.8.46 o superior; no es compatible con llama.cpp, vLLM, TGI ni Ollama. Binarios precompilados para Linux, macOS y Windows.
- **En Mac**: requiere `CMF_GRAPH_SPEC=1` para que el draft especulativo se ejecute bajo Metal nativo.
- **Idiomas limitados**: en, ru, zh; no se documenta soporte de castellano.
- **Contexto no documentado**: no se especifica la longitud de contexto soportada.
- **Sesgos**: no se documentan sesgos conocidos en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero la calidad degradada y los bucles hacen necesaria validación humana en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.8-27B-Code-14B-Experimental-cmf
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de `cortiq` / CMF: https://github.com/infosave2007/cmf
- Releases de `cortiq` (binarios Linux, macOS, Windows): https://github.com/infosave2007/cmf/releases
- Prompts de la tarea (`data/prompts.jsonl`): https://huggingface.co/infosave/Qwen3.8-27B-Code-14B-Experimental-cmf/blob/main/data/prompts.jsonl
- Dataset del profesor (`data/q27-code-t27.tdata/`): https://huggingface.co/infosave/Qwen3.8-27B-Code-14B-Experimental-cmf/tree/main/data/q27-code-t27.tdata
- Respuestas en texto (`data/q27-code-t27.tdata.answers.jsonl`): https://huggingface.co/infosave/Qwen3.8-27B-Code-14B-Experimental-cmf/blob/main/data/q27-code-t27.tdata.answers.jsonl
