# dopaemon/Qwythos-9B-v2

## Resumen
Qwythos-9B-v2 es un modelo de lenguaje de 9.653.104.368 parametros publicado por el desarrollador dopaemon en Hugging Face, construido como un fine-tuning del modelo empero-ai/Qwythos-9B-Claude-Mythos-5-1M, a su vez derivado de la familia Qwen3.5. Se distribuye bajo licencia Apache 2.0 y esta disenado explicitamente como un modelo de razonamiento con cadena de pensamiento profunda, contexto largo de hasta 1 millon de tokens mediante YaRN y una postura intencionadamente "uncensored" orientada a investigacion, ciberseguridad, red-teaming y trabajo clinico.

La motivacion principal de esta version v2 es la correccion de un defecto concreto de la version anterior: el comportamiento de bucle o repeticion degenerada en decodificacion greedy o con temperatura baja, que afectaba al 6,7% de las generaciones y ahora se situa en el 0%. Segun la model card, la correccion se realizo mediante FTPO (Final-Token Preference Optimization), una tecnica que identifica el token exacto que inicia la repeticion y entrena al modelo para preferir alternativas coherentes en esa posicion, preservando el resto de la distribucion y, por tanto, el conocimiento y las capacidades de razonamiento del modelo base.

El modelo se presenta como una actualizacion de "higiene" mas que de capacidad: mantiene los resultados de MMLU, GSM8K, GPQA, ARC y HumanEval en niveles iguales o superiores a v1, restaura la cabeza MTP (multi-token prediction) para decodificacion especulativa y elimina la inyeccion no solicitada de identidad en las respuestas. El repositorio ocupa 19,3 GB e incluye pesos en safetensors compatibles con transformers.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (tag `qwen3_5`), con cabeza MTP (multi-token prediction) restaurada |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.000.000 tokens (mediante YaRN) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; el repo pesa 19,3 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Qwythos-9B-v2 es un transformer denso de aproximadamente 9,65 mil millones de parametros construido sobre la pila Qwen3.5, que el autor describe como "native multimodal-capable" (etiqueta `image-text-to-text` en Hugging Face), aunque la model card no detalla modulos de vision especificos ni su configuracion. El contexto de 1 millon de tokens se obtiene mediante extension YaRN. El modelo incorpora una cabeza MTP (multi-token prediction) nativa que habia sido eliminada en la exportacion anterior y que en v2 se restaura, de modo que la configuracion y los pesos son coherentes y los esquemas de decodificacion especulativa funcionan correctamente.

El entrenamiento parte de empero-ai/Qwythos-9B-Claude-Mythos-5-1M y aplica FTPO (Final-Token Preference Optimization), una variante de optimizacion de preferencias que actua unicamente sobre el token que inicia un bucle de repeticion. Segun la model card, esta intervencion quirurgica reduce la tasa de bucle en greedy del 6,7% al 0,0% y del 1,3% al 0,7% a temperatura 0,6, sin degradar los benchmarks de razonamiento y conocimiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO mas alla de FTPO.

## Capacidades
- Generacion de texto conversacional en ingles con modo de razonamiento (chain-of-thought) explicito y profundo.
- Razonamiento matematico: resuelve problemas de tipo GSM8K con explicacion paso a paso (93,6% en la evaluacion interna).
- Generacion de codigo: funciones Python completas con explicacion del enfoque y analisis de complejidad (HumanEval pass@1 77,4%).
- Razonamiento cientifico de nivel avanzado: GPQA-diamond 49,0%, con respuestas tecnicas en dominios de biologia, quimica, farmacologia y clinica.
- Contexto largo de hasta 1 millon de tokens (YaRN), apto para documentos extensos y conversaciones multi-turno muy largas.
- Postura "uncensored": tasa de rechazo del 0,0% segun la model card, orientada a investigacion y red-teaming.
- Soporte de decodificacion especulativa gracias a la cabeza MTP restaurada.
- Identidad limpia: el modelo solo se presenta cuando se le pregunta explicitamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision): la etiqueta `image-text-to-text` sugiere soporte, pero no se detalla en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente; el modo CoT profundo es compatible con este uso.

## Casos de uso
- Razonamiento matematico asistido: el modelo resuelve problemas aritmeticos y logicos con cadena de pensamiento visible, lo que permite auditar el razonamiento paso a paso en entornos educativos o de validacion.
- Generacion de codigo en produccion: produce funciones con docstrings, explicacion del algoritmo y analisis de complejidad; su HumanEval de 77,4% lo hace util para autocompletado y generacion de utilidades en Python.
- Analisis de documentos largos: con 1M tokens de contexto puede procesar libros completos, expedientes o bases de codigo extensas en una sola pasada, algo inviable en modelos de 8K-32K.
- Red-teaming y evaluacion de seguridad: su tasa de rechazo del 0,0% y su postura intencionadamente sin censura lo hacen adecuado para generar prompts adversarios, estudiar comportamientos inseguros y probar filtros de otros sistemas.
- Investigacion clinica y farmacologica: responde sobre mecanismos de accion, dosificacion y farmacocinetica (por ejemplo, naloxona en sobredosis de opioides) sin rechazos espurios, util para borradores de documentacion tecnica revisados por expertos.
- Ciberseguridad y analisis de vulnerabilidades: puede explicar tecnicas ofensivas y defensivas en detalle, apropiado para formacion interna y laboratorios aislados.
- Despliegue con decodificacion especulativa: la cabeza MTP restaurada permite configurar draft models y acelerar la inferencia en servidores compatibles con vLLM o TGI.
- Asistente conversacional de dominio tecnico: con contexto largo y sin inyeccion de identidad, encaja en chatbots especializados que requieren respuestas directas y sin preambulos.

## Benchmarks y rendimiento
Resultados publicados en la model card, medidos con el harness interno del autor (CoT generativo, greedy/pass@1 salvo indicacion; MMLU/ARC/GSM8K n=500, GPQA-diamond n=198, HumanEval n=164):

| Benchmark | Qwythos-9B-v2 |
|---|---|
| MMLU (CoT / 5-shot loglik) | 83,8% / 69,6% |
| ARC-Challenge | 96,4% |
| GPQA-diamond | 49,0% |
| GSM8K | 93,6% |
| HumanEval (pass@1) | 77,4% |
| Tasa de bucle (greedy) | 0,0% |
| Tasa de rechazo | 0,0% |

Comparativa con el modelo base Qwen3.5-9B y con Qwythos-9B v1, segun la misma fuente:

| Benchmark | Qwen3.5-9B (base) | Qwythos-9B | Qwythos-9B-v2 |
|---|---|---|---|
| MMLU (CoT) | 80,6 | 83,8 | 83,8 |
| ARC-Challenge | 95,6 | 95,0 | 96,4 |
| GPQA-diamond | 32,8 | 52,0 | 49,0 |
| GSM8K | 80,6 | 92,2 | 93,6 |
| HumanEval | 81,7 | 79,9 | 77,4 |
| Bucle (greedy) | 2,7 | 6,7 | 0,0 |

Nota del autor: en MMLU, v2 obtiene 83,8% con razonamiento (CoT) frente a 69,6% en el ajuste de log-verosimilitud 5-shot; conviene reportar la cifra que coincida con la linea base de comparacion. Estas evaluaciones son internas y no han sido verificadas de forma independiente.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 24 GB para contextos cortos.
- Contexto largo: con 1M tokens de contexto, la cache KV crece de forma significativa; el despliegue a maxima ventana requiere GPUs de 80 GB (A100, H100) o configuraciones multi-GPU con parallelismo de tensor.
- GPUs recomendadas: A100 80GB o H100 80GB para contexto largo y produccion; RTX 4090 (24 GB) para contexto moderado en BF16 o cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con cuantizacion o contextos reducidos; en GPUs de 16 GB requeriria cuantizacion a 8 bits o inferior, no documentada oficialmente.
- Opciones de despliegue: transformers (libreria nativa), vLLM y TGI para servidores; llama.cpp u Ollama requeririan conversion a GGUF, no publicada en el repositorio.
- Decodificacion especulativa: la cabeza MTP restaurada permite configurar draft models en vLLM para reducir latencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | MMLU (CoT) | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwythos-9B-v2 | 9,65B | 1M (YaRN) | 83,8% | 93,6% | 77,4% | Apache 2.0 | Hugging Face (transformers) |
| Qwen3.5-9B (base) | ~9B | no disponible | 80,6% | 80,6% | 81,7% | no disponible | Hugging Face |
| Qwythos-9B (v1) | ~9B | 1M (YaRN) | 83,8% | 92,2% | 79,9% | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos reportados en la model card del autor; no se dispone de datos verificados de otros modelos de 9B con contexto de 1M tokens en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo "uncensored" con tasa de rechazo del 0,0%: puede generar contenido peligroso, ilegal o danino en dominios de ciberseguridad, quimica, biologia o farmacologia; requiere supervision humana y filtros externos en produccion.
- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos de 9B, especialmente en dominios especializados; las respuestas clinicas o farmacologicas deben validarse por expertos.
- Las evaluaciones son internas del autor, con n reducido (164-500 ejemplos) y sin verificacion independiente; los intervalos de confianza son amplios.
- El contexto de 1M tokens mediante YaRN puede degradar la calidad en posiciones intermedias (fenomeno "lost in the middle"); no se han publicado evaluaciones de aguja en pajar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer restricciones adicionales no detalladas en la model card.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion por parte de la comunidad.
- No se documentan tecnicas de mitigacion de sesgos ni evaluaciones de seguridad independientes.
- El soporte multimodal sugerido por la etiqueta `image-text-to-text` no esta confirmado ni documentado en la model card.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dopaemon/Qwythos-9B-v2
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Repositorio de Qwen3.5 (familia base): no disponible en la informacion proporcionada
- Paper de FTPO: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
