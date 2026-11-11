# herald-dictation/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B instruct es un modelo de lenguaje de Google distribuido en formato GGUF para su uso con llama.cpp. Esta ficha concreta, publicada por el usuario herald-dictation, no es un modelo nuevo ni un ajuste fino: es una copia byte a byte del fichero `gemma-4-E4B-it-Q4_0.gguf` publicado originalmente por ggml-org, redistribuido para que la aplicación Herald (dictado privado offline) no dependa del alojamiento de otro proyecto. Los pesos no se han modificado.

El modelo base cuenta con 7.463.013.674 parámetros según los safetensors del repositorio original y se distribuye bajo licencia Apache 2.0. La única cuantización incluida en este repositorio es Q4_0, con un tamaño de 4.590.807.392 bytes (aproximadamente 4,6 GB). El repositorio completo ocupa 4,6 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia es acotada: no aporta mejoras técnicas sobre el modelo de Google ni sobre la conversión de ggml-org, sino que actúa como espejo de distribución para un caso de uso específico (dictado offline). Para cualquier otra aplicación conviene acudir directamente a los repositorios originales, que ofrecen el resto de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (unica incluida en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma-4-E4B-it-Q4_0.gguf`) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base (tipo de transformer, atencion, posible naturaleza MoE pese a la nomenclatura "E4B", etc.). Tampoco se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Estos datos corresponden al modelo original de Google y deberian consultarse en su model card.

Lo unico verificable en este repositorio es el proceso de conversion: los pesos fueron convertidos a GGUF por ggml-org y esta publicacion es una copia identica del fichero de la commit `a69f018`, con SHA-256 `a555b900214b477d8880e7832e0b8925e139b0159640036b09fe472b6f2097f2`. No hay cuantizacion adicional, fusion de pesos ni ajuste alguno por parte de herald-dictation.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation; tag: conversational).
- Uso previsto por el publicador: dictado privado offline dentro de la aplicacion Herald.
- Compatibilidad con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Dictado offline en la aplicacion Herald: el modelo se descarga desde este repositorio y se ejecuta localmente con llama.cpp, de modo que el audio transcrito y el texto procesado no salen del dispositivo. Es el caso de uso para el que se publico esta copia.
- Procesamiento de texto dictado en entornos sin conectividad: al ser un GGUF de ~4,6 GB ejecutable con llama.cpp, puede desplegarse en equipos de campo o aislados donde no se permite enviar datos a la nube.
- Prototipado local de asistentes conversacionales: sirve para validar flujos de chat en local antes de decidir una cuantizacion o un modelo definitivo, aunque para ello es preferible el repositorio de ggml-org con el resto de variantes.
- Evaluacion de la calidad de Q4_0 frente a otras cuantizaciones: este fichero permite medir el impacto de Q4_0 en tareas de dictado o conversacion y compararlo con las versiones de mayor o menor precision del repo original.
- Integracion en pipelines de CI que requieran un artefacto GGUF estable y verificable: el SHA-256 publicado permite fijar la version del fichero y comprobar su integridad en cada ejecucion.
- Distribucion interna de un modelo con licencia Apache 2.0: al ser una licencia permisiva, puede incluirse en productos o imagenes de contenedor propios sin las restricciones de otros modelos de pesos abiertos con clausulas de uso aceptable adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB solo para los pesos en Q4_0, mas la memoria para el contexto KV; el total depende de la longitud de contexto configurada, que no se especifica.
- GPU recomendadas: no disponibles en la informacion proporcionada; al tratarse de un modelo de ~7,5 mil millones de parametros en Q4_0, es plausible su ejecucion en GPUs de consumo con 8 GB o mas de VRAM, pero este dato no esta confirmado por el publicador.
- Cabe en GPU de consumo: no confirmado oficialmente; la cuantizacion Q4_0 sugiere que si en tarjetas con suficiente VRAM para pesos y contexto.
- Opciones de despliegue: llama.cpp (libreria declarada) y endpoints compatibles; vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| herald-dictation/gemma-4-E4B-it-GGUF (esta ficha) | 7.463.013.674 | no disponible | solo Q4_0 | Apache 2.0 | espejo de un unico fichero |
| ggml-org/gemma-4-E4B-it-GGUF | 7.463.013.674 | no disponible | varias (segun model card) | Apache 2.0 | repositorio original de conversion |
| google/gemma-4-E4B-it | 7.463.013.674 | no disponible | pesos originales (safetensors) | Apache 2.0 | repositorio oficial del modelo base |

La comparativa se limita a las tres referencias citadas en la model card; no se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no aporta ninguna mejora tecnica: es una copia identica del fichero de ggml-org, sin cambios en los pesos.
- Solo incluye la cuantizacion Q4_0; quien necesite Q5, Q8, F16 u otras variantes debe acudir al repositorio original.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma del modelo base en la informacion disponible.
- La longitud de contexto no esta especificada, lo que impide planificar despliegues con requisitos de ventana concretos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo original de Google por si existieran condiciones adicionales no reflejadas aqui.
- El repositorio no registra descargas ni likes, y su unico proposito declarado es servir a la aplicacion Herald; no hay garantia de mantenimiento o actualizacion.
- Verificar siempre el SHA-256 publicado antes de usar el fichero en produccion.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/herald-dictation/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Conversion original GGUF: https://huggingface.co/ggml-org/gemma-4-E4B-it-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
