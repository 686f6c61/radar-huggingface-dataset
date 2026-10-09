# mradermacher/EventPlanner-v1-2B-i1-GGUF

## Resumen

EventPlanner-v1-2B-i1-GGUF es una distribucion cuantizada en formato GGUF del modelo theprint/EventPlanner-v1-2B, publicada por el usuario mradermacher, conocido en HuggingFace por generar versiones cuantizadas de modelos pequenos y medianos. El repositorio no contiene pesos originales ni informacion de arquitectura, entrenamiento o evaluacion: es exclusivamente un conjunto de ficheros GGUF derivados del modelo base mediante cuantizacion con pesos ponderados e imatrix.

El modelo base, segun el nombre, tiene aproximadamente 2.000 millones de parametros y esta orientado a tareas de planificacion de eventos, aunque la model card del repo cuantizado no confirma ni el dominio, ni los idiomas, ni la licencia, ni la longitud de contexto. La relevancia de esta publicacion es practica: proporciona 24 variantes de cuantizacion (desde IQ1_S hasta Q6_K, incluyendo Q4_0, Q4_1 y Q4_K_M) que permiten ejecutar un modelo de ~2B en hardware de consumo, CPU o GPUs con poca VRAM.

Se trata, por tanto, de una ficha de distribucion, no de un modelo nuevo. Cualquier decision de adopcion deberia basarse en la model card del modelo original (theprint/EventPlanner-v1-2B), que no forma parte de la informacion disponible en esta busqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe en la model card del repo cuantizado) |
| Parametros totales | no disponible; la plataforma reporta 479.418, valor aparentemente incompleto y en contradiccion con el nombre del modelo, que indica 2B |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (24 variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo cuantizado); el modelo base se distribuye presumiblemente en safetensors, dato no confirmado |
| Metodo de cuantizacion | pesos ponderados (weighted) con matrice de importancia (imatrix) |
| Modelo base | theprint/EventPlanner-v1-2B |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento en los datos proporcionados. La model card del repositorio cuantizado se limita a metadatos de la herramienta de cuantizacion de mradermacher: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y la etiqueta `nicoboss`. No se especifican numero de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otra tecnica de alineamiento.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion: se han generado 24 variantes GGUF combinando la familia `Q*_K` clasica con la familia `IQ*` (cuantizacion dependiente de la importancia de los tensores) y las variantes legacy `Q4_0`/`Q4_1`. El uso de imatrix (matriz de importancia calculada sobre un corpus de calibracion) permite, en teoria, conservar mas calidad en las cuantizaciones agresivas (IQ1, IQ2, IQ3) que una cuantizacion uniforme, aunque no se aportan mediciones de perplejidad ni evaluaciones que lo confirmen para este modelo concreto.

## Capacidades

No se documentan capacidades especificas en la informacion disponible. A partir del nombre del modelo y del formato de distribucion, cabe esperar de forma orientativa lo siguiente, siempre pendiente de verificacion contra el modelo base:

- Generacion de texto en el dominio de planificacion de eventos (inferido del nombre, no confirmado).
- Conversacion multi-turno basica, sujeta a la longitud de contexto del modelo base, que no se especifica.
- Ejecucion local en CPU y GPU de gama baja gracias a las cuantizaciones de 1 a 6 bits.
- Soporte de tool calling, function calling, agentes, vision, audio y modo de razonamiento explicito: no disponible (no se menciona ninguno).
- Capacidades multilingues: no disponible.

## Casos de uso

Dado que no hay documentacion funcional, los casos siguientes son escenarios plausibles para un modelo cuantizado de ~2B en GGUF, no capacidades verificadas. Se recomienda validarlos con el modelo base antes de llevarlos a produccion.

- Asistente local de planificacion de eventos: desplegado con Ollama o llama.cpp en un portatil, el modelo podria generar borradores de agendas, listas de tareas y cronogramas para eventos pequenos sin conexion a internet ni coste por token.
- Clasificacion y extraccion de entidades en textos de logistica: al ser un modelo pequeno y cuantizado a Q4_K_M o Q5_K_M, puede ejecutarse en una unica GPU de 8 GB para tareas de etiquetado por lotes con latencia baja.
- Prototipado rapido en entornos con recursos limitados: las variantes IQ2 e IQ3 permiten probar el comportamiento del modelo en CPU o en GPUs integradas, util para validar prompts antes de migrar a un modelo mayor.
- Generacion de plantillas y checklists: integrado en una herramienta interna, el modelo podria redactar plantillas de presupuesto, invitacion o cronograma a partir de unos pocos campos de entrada.
- Chatbot de soporte para preguntas frecuentes sobre eventos: con contexto corto y respuestas acotadas, encaja en despliegues edge donde la privacidad impide enviar datos a APIs externas.
- Experimentacion academica sobre cuantizacion: el repositorio es util como banco de pruebas para medir el impacto de IQ1/IQ2/IQ3 frente a Q4_K_M en un modelo de 2B del mismo checkpoint base.
- Pipeline de generacion de contenido offline: en entornos sin red (ferias, eventos presenciales), un binario con llama.cpp y el fichero Q4_K_M puede servir respuestas generadas localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, ni para el modelo base ni para las variantes cuantizadas.

## Requisitos de hardware

Los tamanos y requisitos que siguen son estimaciones de ingenieria derivadas del formato GGUF y del orden de magnitud de un modelo de ~2B parametros; no proceden de la model card y deben tratarse como orientativos.

| Cuantizacion | Tamano aproximado del fichero | VRAM estimada en inferencia |
|---|---|---|
| IQ1_S / IQ1_M | 0,5-0,7 GB | 1,0-1,5 GB |
| IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M | 0,7-0,9 GB | 1,2-1,8 GB |
| Q2_K / Q2_K_S | 0,9-1,1 GB | 1,5-2,0 GB |
| IQ3_* / Q3_K_S / Q3_K_M / Q3_K_L | 1,1-1,4 GB | 1,8-2,5 GB |
| IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M | 1,3-1,6 GB | 2,0-3,0 GB |
| Q5_K_S / Q5_K_M | 1,5-1,8 GB | 2,5-3,5 GB |
| Q6_K | 1,7-2,0 GB | 3,0-4,0 GB |

- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para todas las cuantizaciones; una RTX 3060 de 12 GB, RTX 4060, RTX 4070 o superior permite cargar el modelo completo en VRAM con contexto amplio. A100 y H100 son innecesarias para este tamano y solo tendrian sentido en despliegues con muchos lotes concurrentes.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs discretas de los ultimos diez anos y en iGPUs con memoria compartida para las cuantizaciones de 2 a 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui (llama.cpp o ExLlama), servidores GGUF experimentales de vLLM. No es un formato ideal para TensorRT-LLM ni para TGI, que trabajan mejor con safetensors.
- Latencia y throughput: no disponibles. Como referencia general para un 2B en Q4_K_M sobre una GPU de gama media, es habitual obtener decenas de tokens por segundo, pero no hay medicion publicada para este modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de EventPlanner-v1-2B, por lo que la comparacion se limita a caracteristicas publicas de modelos de tamano similar ampliamente distribuidos tambien en GGUF. Los datos de la columna de contexto y licencia corresponden a las model cards publicas de cada proyecto, no a esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| EventPlanner-v1-2B (este repo) | ~2B (segun nombre) | no disponible | no disponible | si, 24 cuantizaciones |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | si |
| Gemma 2 2B-it | 2,6B | 8.192 tokens | Gemma Terms | si |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | si |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | si |

La ventaja competitiva de este repositorio es la amplitud de cuantizaciones disponibles (incluidas IQ1 e IQ2, poco frecuentes) y el uso de imatrix. La desventaja es la ausencia total de documentacion, evaluacion y licencia explicita, frente a los modelos comparados, que publican contexto, idiomas y terminos de uso.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido. Es imprescindible consultar la licencia del modelo base theprint/EventPlanner-v1-2B antes de cualquier despliegue.
- Sin datos de evaluacion: no hay benchmarks, perplejidad ni pruebas cualitativas, por lo que el rendimiento real es desconocido.
- Cuantizaciones muy agresivas (IQ1_S, IQ1_M, IQ2_XXS): degradan notablemente la coherencia y la fidelidad de las respuestas; no se recomiendan para produccion.
- Riesgo de alucinacion: no evaluado; en modelos de 2B suele ser elevado en tareas de conocimiento factual, pero no hay medicion para este caso.
- Idiomas: no declarados. No hay garantia de soporte de castellano ni de otros idiomas.
- Longitud de contexto desconocida: limita el diseno de aplicaciones multi-turno o con documentos largos.
- Sesgos: no documentados. Al desconocerse la composicion del dataset de entrenamiento, no se pueden anticipar sesgos de genero, raza, idioma o dominio.
- Repositorio sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validacion por parte de la comunidad.
- Dependencia del modelo base: si theprint/EventPlanner-v1-2B se elimina o cambia de licencia, esta distribucion cuantizada queda huerfana.
- El recuento de parametros reportado por la plataforma (479.418) es incoherente con el nombre del modelo; conviene verificarlo directamente en los ficheros GGUF con `gguf-dump` antes de planificar recursos.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/mradermacher/EventPlanner-v1-2B-i1-GGUF
- Modelo base: https://huggingface.co/theprint/EventPlanner-v1-2B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher/models
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Repositorio relacionado del mismo autor: https://huggingface.co/mradermacher/ProgramManager-v1-2B-GGUF
- Paper, blog o demo oficial: no disponible
