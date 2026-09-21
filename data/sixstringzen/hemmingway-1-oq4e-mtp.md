# sixstringzen/Hemmingway-1-oQ4e-mtp

## Resumen

Hemmingway-1-oQ4e-mtp es una cuantizacion de 4 bits del modelo Altworld/Hemmingway-1, publicada por el usuario sixstringzen. Se distribuye en formato MLX safetensors y esta pensada para ejecutarse con oMLX sobre silicio de Apple (Apple silicon), no para GPUs NVIDIA ni para runtimes GGUF. El artefacto conserva los tensores de prediccion multi-token (MTP) del modelo original, lo que abre la puerta a decodificacion asistida por MTP, aunque el autor no ha publicado todavia una evaluacion de esa via.

El modelo base pertenece a la familia qwen3_5 (la model card del origen identifica la arquitectura de texto como `qwen3_5_text`, y el artefacto convertido usa `qwen3_5`). El recuento real de parametros en safetensors es de 27.320.697.856 (unos 27,3 mil millones), con un peso total del repositorio de 16,3 GB y un artefacto de 16.328.644.636 bytes (15,21 GiB) repartido en cuatro shards. El modelo esta orientado a generacion de texto, escritura creativa y conversacion, y esta declarado unicamente en ingles.

Su relevancia practica es doble. Por un lado, permite llevar un modelo de ~27B a un portatil o estacion de trabajo Apple con memoria unificada relativamente modesta gracias a la cuantizacion mixta: 4 bits de base, 5 bits en 115 tensores sensibles y 8 bits en `language_model.lm_head`. Por otro, es un caso poco frecuente de cuantizacion que preserva explicitamente los tensores MTP, lo que lo convierte en material interesante para quien experimenta con decodificacion multi-token en MLX. La licencia Apache 2.0, heredada del modelo fuente, facilita su uso comercial, aunque no hay comparacion controlada contra el BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia qwen3_5 (identificador de origen `qwen3_5_text`, convertido como `qwen3_5`); se desconoce si es densa o MoE |
| Parametros totales | 27.320.697.856 (~27,3 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (cuantizacion afin mixta de precision mejorada): base 4 bits, 115 tensores a 5 bits, `language_model.lm_head` a 8 bits; group size 64; dtype no cuantizado bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (4 shards, 1.876 tensores indexados, 29 tensores MTP); no es GGUF |
| Tamano del artefacto | 16.328.644.636 bytes (15,21 GiB); repositorio de 16,3 GB |
| Cuantizador | oMLX 0.7.0.dev2 |
| Modelo base | Altworld/Hemmingway-1 (revision `4d711aac0f0043075ae334d2a3de3db3e10135c9`) |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo original en la documentacion proporcionada: no hay datos sobre numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo unico documentado es que la arquitectura de texto del modelo fuente es `qwen3_5_text`, que el derivado cuantizado declara como `qwen3_5`, y que el modelo incorpora prediccion multi-token (MTP), de la cual se conservan 29 tensores en el artefacto. El modelo esta etiquetado para escritura creativa y generacion conversacional, y expone un parametro `enable_thinking` en la API, lo que sugiere un modo de razonamiento o planificacion previa que puede activarse o desactivarse.

La innovacion tecnica de este repositorio concreto es el proceso de cuantizacion. Se aplico oQe (enhanced oQ4e), un esquema de cuantizacion afin mixta que usa la importancia de activaciones para asignar precision adicional a los tensores sensibles: se parte de 4 bits, se elevan 115 tensores a 5 bits y se mantiene `language_model.lm_head` en 8 bits porque ese tensor no tenia entrada correspondiente en la imatrix. La calibracion se hizo con el dataset `oqe_code_multilingual` (128 muestras de 512 tokens) y 504 entradas de imatrix, reutilizando la cache de la pasada de sensibilidad del modelo fuente. El informe de cuantizacion incluido registra cero desajustes de forma de matriz y cero shards de pesos ausentes. El autor advierte que no se uso un dataset de calibracion especifico de prosa, lo que es un caveat relevante dado el enfoque creativo del modelo.

## Capacidades

- Generacion de texto en ingles, con enfasis declarado en escritura creativa y prosa narrativa.
- Generacion conversacional multi-turno mediante una API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento opcional: el campo `enable_thinking` permite desactivar la planificacion visible y obtener prosa directa.
- Prediccion multi-token (MTP): los tensores MTP estan presentes en el artefacto, aunque la decodificacion asistida por MTP no ha sido evaluada ni medida por el autor.
- Ejecucion local en Apple silicon mediante MLX y oMLX.
- Capacidades de tool calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el modelo declara unicamente ingles.
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es text-generation.

## Casos de uso

- Escritura creativa asistida: el modelo esta etiquetado explicitamente para creative-writing, y con `enable_thinking` desactivado devuelve prosa directa sin planificacion visible, lo que encaja en flujos de redaccion de ficcion, relatos cortos y desarrollo de escenas.
- Generacion de dialogo para videojuegos y ficcion interactiva: la combinacion de generacion conversacional y estilo narrativo permite producir lineas de personaje y respuestas ramificadas ejecutadas en local, sin enviar el guion a un servicio externo.
- Reescribir y ajustar estilo: al estar entrenado/orientado a prosa, puede usarse para reescribir textos manteniendo tono y voz, por ejemplo adaptando un borrador tecnico a un registro mas narrativo.
- Prototipado de asistentes conversacionales en local: el endpoint compatible con OpenAI de oMLX (`http://127.0.0.1:31423/v1/chat/completions`) permite integrar el modelo en un cliente existente cambiando solo la URL base y el identificador de modelo.
- Experimentacion con decodificacion MTP en MLX: los 29 tensores MTP preservados permiten a investigadores comparar la decodificacion estandar frente a la asistida por MTP en el mismo artefacto, algo poco habitual en cuantizaciones publicadas.
- Investigacion sobre cuantizacion mixta: el informe `oq_imatrix_report.json` documenta la pasada de sensibilidad, los ajustes de calibracion y la cobertura de tensores, util para estudiar como afecta la asignacion selectiva de bits a la calidad de generacion.
- Generacion de texto sin conexion en equipos Apple: al ser MLX safetensors de 15,21 GiB, el modelo se puede ejecutar integramente en local en un Mac con memoria unificada suficiente, sin dependencia de API externas.
- Evaluacion de bancos de pruebas de estilo: util para construir conjuntos de comparacion BF16 frente a 4 bits en tareas de coherencia y eleccion lexica, precisamente porque el autor senala que esa comparacion controlada aun no se ha publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una prueba de humo local en oMLX el 2026-09-20: el modelo cargo, devolvio una respuesta de chat completa con `finish_reason: stop` y se descargo sin errores. Esa prueba confirma que los ficheros cargan y generan, pero no establece paridad de calidad con el modelo fuente en BF16. Tampoco se ha medido por separado la decodificacion asistida por MTP.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: el artefacto pesa 15,21 GiB en disco; en la practica conviene reservar del orden de 18-20 GB de memoria para pesos mas cache KV, aunque la cifra exacta depende de la longitud de contexto y no esta documentada.
- Plataforma: el modelo usa MLX safetensors y fue creado y probado con oMLX 0.7.0.dev2, por lo que requiere Apple silicon. No esta verificado su funcionamiento en otras plataformas ni en GPUs NVIDIA.
- GPU compatibles: no aplica en el sentido habitual; al ser un artefacto MLX, el objetivo son chips de Apple (series M). El autor pide que los informes de compatibilidad incluyan la version de oMLX y el hardware Apple empleado.
- Cabe en GPU de consumo: si, en el sentido de que cabe en equipos Apple con memoria unificada suficiente (por ejemplo configuraciones de 24 GB o mas). En GPUs de consumo NVIDIA no es directamente utilizable con este formato.
- Opciones de despliegue: oMLX (probado, con endpoint compatible con OpenAI) y, en principio, otros runtimes MLX; la compatibilidad con runtimes MLX distintos o versiones anteriores de oMLX no ha sido verificada. No es compatible con llama.cpp, Ollama ni GGUF. El uso con vLLM o TGI no esta soportado por el formato.
- Latencia y throughput: no disponible; no se han publicado medidas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hemmingway-1-oQ4e-mtp (sixstringzen) | 27,3B | no disponible | 4/5/8 bits mixtos, MLX safetensors | apache-2.0 | HuggingFace; requiere oMLX/MLX |
| Altworld/Hemmingway-1 (modelo fuente) | no disponible (recuento no facilitado) | no disponible | BF16, formato original no especificado | apache-2.0 | HuggingFace |
| Otras alternativas comparables de escritura creativa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificadas de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con terceros.

## Limitaciones y advertencias

- La cuantizacion puede alterar la eleccion de palabras, la coherencia y el seguimiento de instrucciones; el autor no ha publicado una comparacion controlada contra el modelo BF16.
- La calibracion se hizo con el dataset `oqe_code_multilingual`, que no es especifico de prosa, lo que puede afectar de forma desigual a la calidad en tareas de escritura creativa.
- Los tensores MTP estan presentes, pero la decodificacion asistida por MTP no ha sido evaluada ni medida; no debe asumirse una ganancia de velocidad.
- El modelo declara unicamente ingles: no hay soporte multilingue documentado.
- La longitud de contexto no esta especificada, lo que dificulta planificar cargas de trabajo con entradas largas.
- Los pesos son MLX safetensors y no GGUF; la compatibilidad con otros runtimes MLX o versiones anteriores de oMLX no esta verificada. Solo se ha probado con oMLX 0.7.0.dev2.
- Existe una nota del autor indicando que esta cuantizacion reemplaza a una version anterior publicada el 2026-09-20; quien la hubiera descargado antes de esa fecha debe volver a descargarla.
- La prueba de humo solo confirma que el modelo carga y genera, no su calidad.
- Licencia Apache 2.0, heredada del modelo fuente, permite uso comercial, pero se deben respetar las condiciones y atribuciones del repositorio original. Las limitaciones y guias de uso aceptable del modelo fuente siguen aplicando.
- Riesgo de sesgos y de alucinacion: no documentado en la informacion disponible, pero aplicable por tratarse de un modelo de lenguaje generativo; no hay evaluaciones de sesgo publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sixstringzen/Hemmingway-1-oQ4e-mtp
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Informe de imatrix y cuantizacion: https://huggingface.co/sixstringzen/Hemmingway-1-oQ4e-mtp/blob/main/oq_imatrix_report.json
- Cuantizador oMLX: https://github.com/jundot/omlx
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo (los resultados obtenidos trataban de husos horarios de California y respuestas de crucigramas), por lo que no se han podido anadir papers, blogs ni demos adicionales.
