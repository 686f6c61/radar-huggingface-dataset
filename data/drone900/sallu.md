# DronE900/sallu

## Resumen

Mistral Medium 3.5 128B es un modelo de lenguaje denso de 127.704.210.176 parametros (aproximadamente 128B) desarrollado por Mistral AI. Se presenta como su primer modelo insignia "fusionado", que unifica en un unico conjunto de pesos las capacidades de instruccion, razonamiento y codigo, sustituyendo a Mistral Medium 3.1 y a Magistral en Le Chat, y a Devstral 2 en su agente de codigo Vibe. La arquitectura es de tipo transformer denso (etiquetada como mistral3 en HuggingFace) con una ventana de contexto de 256k tokens.

El modelo acepta entrada multimodal (texto e imagen) con salida de texto, e incorpora un modo de razonamiento con esfuerzo configurable por peticion (`reasoning_effort`), de modo que los mismos pesos pueden dar una respuesta rapida de chat o ejecutar un razonamiento agentico prolongado. Incluye soporte nativo de function calling y salida JSON, y esta entrenado para seguir instrucciones y system prompts con alta fidelidad.

La relevancia actual radica en su posicionamiento como modelo unico para tareas de agente, codigo y razonamiento con contexto muy largo, acompanado de un modelo EAGLE para decodificacion especulativa que acelera la inferencia en vLLM y SGLang. Se distribuye bajo una licencia MIT modificada que permite uso comercial con excepciones para empresas de gran facturacion. El repositorio ocupa 267.2 GB e incluye pesos en safetensors y fp8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (mistral3) |
| Parametros totales | 127.704.210.176 (~128B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | fp8 (publicado); GGUFs mencionados en la model card; otras cuantizaciones no disponibles |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Modified MIT License (uso comercial y no comercial, con excepciones para empresas de gran facturacion) |
| Formato de pesos | safetensors, fp8, GGUF (mencionado) |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo denso de 128B parametros con una ventana de contexto de 256k tokens, integrado en la familia mistral3. Incluye un codificador de vision entrenado desde cero para manejar tamanos de imagen y relaciones de aspecto variables, lo que habilita la entrada multimodal texto-imagen con salida de texto. El modelo unifica en un solo conjunto de pesos las capacidades de instruccion, razonamiento y codigo, con un modo de razonamiento cuyo esfuerzo es configurable por peticion.

La model card advierte de un problema relevante en el config de Transformers: una entrada incorrecta causaba degradacion del rendimiento en contexto largo, corregida en un commit especifico. Los GGUFs generados con el config anterior a ese commit tambien estan afectados, por lo que se recomienda usar el config corregido. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, por lo que estos datos se consideran no disponibles. Como innovacion destacable, se publica un modelo EAGLE para decodificacion especulativa orientado a acelerar vLLM y SGLang.

## Capacidades

- Generacion de texto con seguimiento de instrucciones y adherencia fuerte a system prompts.
- Razonamiento con modo configurable: `reasoning_effort="none"` para respuestas instantaneas y `"high"` para razonamiento con test-time compute.
- Codigo y tareas agenticas de ingenieria de software, con resultados reportados de 77.6% en SWE-Bench Verified.
- Capacidades agenticas con function calling nativo y salida JSON.
- Vision: analisis de imagenes y extraccion de informacion a partir de contenido visual, con soporte de tamanos y relaciones de aspecto variables.
- Multilingue: decenas de idiomas, incluyendo ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Contexto largo de hasta 256k tokens para conversaciones y documentos extensos.
- Soporte de razonamiento multi-paso orientado a flujos agenticos.

## Casos de uso

- Agente de codigo en produccion: el modelo puede resolver issues y proponer parches en repositorios reales, dado su 77.6% en SWE-Bench Verified y su function calling nativo, integrandose en pipelines de CI/CD y en el agente Vibe CLI.
- Automatizacion de atencion al cliente multi-turno: con 256k tokens de contexto puede mantener historiales largos y consultar documentacion extensa sin truncar, ademas de adherirse estrictamente a system prompts.
- Analisis de documentos con imagenes: al aceptar entrada multimodal, puede procesar facturas, capturas o diagramas junto con texto para extraer datos estructurados en JSON.
- Razonamiento matematico y analitico bajo demanda: activando `reasoning_effort="high"` con temperatura 0.7 y top_p 0.95 para problemas complejos, y desactivandolo para consultas rapidas.
- Orquestacion de agentes con tool calling: su soporte nativo de function calling y JSON lo hace adecuado para construir agentes que invocan APIs externas y encadenan pasos.
- Asistencia multilingue en soporte global: cubre mas de veinte idiomas (incluidos arabe, hindi, bengali y nepalí), util para plataformas con usuarios en multiples regiones.
- Generacion de codigo asistida en IDE: con un servidor vLLM local y el modelo EAGLE para acelerar la decodificacion, puede desplegarse como backend de autocompletado y refactorizacion.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| τ³-Telecom | 91.4% |
| SWE-Bench Verified | 77.6% |

La model card menciona comparaciones adicionales en instruccion, razonamiento matematico y codigo frente a modelos competidores, presentadas unicamente en imagenes sin cifras textuales en la informacion disponible. No se detallan valores numericos de MMLU, HumanEval o GSM8K en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 128B parametros, en fp8 se requieren aproximadamente 128 GB solo para pesos, mas memoria para KV cache y activaciones; en BF16 se superan los 256 GB. Las cifras exactas dependen de la longitud de contexto.
- GPU recomendadas: multiples A100 80GB o H100 80GB en configuracion tensor-parallel; una sola GPU de 80 GB no es suficiente para los pesos en fp8.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090 con 24 GB) salvo mediante GGUFs fuertemente cuantizados y offloading a CPU/RAM, con latencia elevada.
- Opciones de despliegue: vLLM y SGLang (recomendados, con soporte del modelo EAGLE para decodificacion especulativa), llama.cpp/Ollama mediante GGUF, y Mistral Vibe con backend local vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada; se espera mejora con EAGLE, pero sin cifras publicadas en el texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral Medium 3.5 128B | ~128B denso | 256k | Modified MIT | Multimodal, reasoning configurable, SWE-Bench 77.6% |
| Mistral Medium 3.1 | no disponible | no disponible | no disponible | Predecesor; sustituido por 3.5 segun la model card |
| Magistral | no disponible | no disponible | no disponible | Sustituido por 3.5 en Le Chat |
| Devstral 2 | no disponible | no disponible | no disponible | Sustituido por 3.5 en Vibe CLI |

No se dispone de especificaciones detalladas de los modelos predecesores en la informacion proporcionada; las comparaciones con competidores externos solo aparecen en imagenes sin cifras textuales.

## Limitaciones y advertencias

- La model card advierte de que el config original de Transformers degradaba el rendimiento en contexto largo; los GGUFs generados antes del commit de correccion estan afectados y deben regenerarse o sustituirse.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Modified MIT excluye a empresas de gran facturacion del uso libre; es necesario revisar el texto de la licencia antes de un despliegue comercial.
- El modelo es muy grande (267.2 GB de repositorio) y no es viable en hardware de consumo sin cuantizacion agresiva y offloading.
- La lista de idiomas de la model card y las etiquetas de HuggingFace no coinciden exactamente (por ejemplo, neerlandes aparece en el texto pero no en las etiquetas); conviene validar el rendimiento por idioma antes de produccion.
- No se han publicado datos de sesgos, safety evaluations ni limites de contexto efectivos mas alla de la cifra nominal de 256k.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DronE900/sallu
- Modelo original de referencia: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
- Modelo EAGLE: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B-EAGLE
- Blog de Mistral: https://mistral.ai/news/vibe-remote-agents-mistral-medium-3-5
- Repositorio Mistral Vibe: https://github.com/mistralai/mistral-vibe
- Commit de correccion del config: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/commit/c4be198050fb5789774a55b92ed697becfbf20ae
- Licencia: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/blob/main/LICENSE
