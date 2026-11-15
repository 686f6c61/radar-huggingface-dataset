# aibuildai-inc/ProWork-27B

## Resumen

ProWork-27B es un ajuste fino (post-entrenamiento) del modelo Qwen3.8-27B desarrollado por AIBuildAI, orientado especificamente a trabajo profesional agentico: leer una peticion de un profesional junto con sus registros, datos y normativa adjuntos, realizar el analisis con herramientas (busqueda web, lectura de archivos, ejecucion de codigo) y entregar un resultado terminado como un memo, un modelo de hoja de calculo o una presentacion. El modelo parte de una base de 27.781.427.952 parametros con capacidad de entrada de texto e imagen y una ventana de contexto de 262.144 tokens.

La propuesta de valor del modelo es el salto de rendimiento en tareas de conocimiento economicamente valioso: segun la evaluacion del autor en GDPval (las 220 tareas publicas de OpenAI), ProWork-27B gana 125 puntos Elo sobre su modelo base y se queda a 25 Elo de GPT-6 Astra (max). Se distribuye con pesos en bf16 bajo licencia Apache 2.0, la misma del modelo base, y es compatible con endpoints OpenAI a traves de vLLM.

Es relevante ahora porque cubre el nicho de modelos abiertos de tamano medio (27B) especializados en flujos de trabajo multi-turno con uso intensivo de herramientas, un perfil tradicionalmente dominado por modelos propietarios. La combinacion de contexto largo, soporte de tool calling y modo de razonamiento lo situa como candidato para despliegues de agentes de productividad en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.8-27B, un transformer denso de 27B parametros de la familia Qwen3.5 con entrada multimodal texto-imagen y 262.144 tokens de contexto. AIBuildAI realizo un post-entrenamiento sobre datos propios orientado a trabajo profesional agentico; la model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

Entre las innovaciones tecnicas documentadas destaca el soporte de decodificacion especulativa mediante MTP (multi-token prediction) con 3 tokens especulativos, configurable en vLLM, y un parser de razonamiento (`qwen3`) y de tool calling (`qwen3_xml`) especificos. El modelo opera en modo thinking con temperatura 1.0, top-p 0.95 y top-k 20, y admite hasta 65.536 tokens de salida por llamada.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (cadena de pensamiento explicita).
- Entrada multimodal texto-imagen (pipeline `image-text-to-text`).
- Tool calling / function calling con parser dedicado en vLLM (`qwen3_xml`).
- Ejecucion de agentes multi-turno con sesiones largas (la evaluacion permitio hasta 250 turnos).
- Uso de herramientas externas: busqueda web, lectura de archivos y ejecucion de codigo.
- Produccion de entregables estructurados: memos, modelos de hoja de calculo, presentaciones.
- Capacidades multilingues limitadas al ingles segun la model card.
- Compatibilidad con clientes OpenAI a traves de endpoints compatibles.

## Casos de uso

- Analisis de licitaciones y comparativa de proveedores: el modelo lee varios presupuestos adjuntos, extrae partidas y genera un memo comparativo; su contexto de 262.144 tokens permite cargar documentos completos sin fragmentar.
- Modelado financiero asistido: con acceso a ejecucion de codigo y lectura de archivos, puede construir y validar un modelo de hoja de calculo a partir de datos de entrada y supuestos documentados.
- Investigacion normativa: combinando busqueda web y lectura de regulaciones adjuntas, produce resumenes con trazabilidad de fuentes para equipos legales o de compliance.
- Generacion de presentaciones ejecutivas: a partir de un informe y datos auxiliares, redacta el guion y la estructura de una presentacion lista para revision.
- Agente de soporte a analistas: sesiones largas de trabajo donde el modelo mantiene el hilo durante cientos de turnos, consultando herramientas y acumulando contexto.
- Automatizacion de due diligence: procesamiento de lotes de documentos (contratos, estados financieros, imagenes de formularios) para extraer hallazgos y consolidarlos en un informe.
- Extraccion de datos de documentos escaneados: gracias a la entrada de imagen, puede transcribir y estructurar informacion de capturas o digitalizaciones.

## Benchmarks y rendimiento

Evaluacion propia del autor en GDPval (220 tareas publicas de OpenAI), 3 intentos por tarea, comparacion head-to-head contra Qwen3.8-27B (xhigh) fijado en Elo 1427 de Artificial Analysis, con panel de tres jueces LLM (GPT, Gemini y Claude). Intervalos de confianza al 95% por bootstrap de tareas.

| Modelo | Elo GDPval (implementacion propia) | Delta vs. base |
|---|---|---|
| GPT-6 Astra (max) | 1527 (referencia, +25 sobre ProWork) | no aplica |
| AIBuildAI ProWork-27B | 1552 | +125 |
| Qwen3.8-27B (xhigh) | 1427 | linea base |

Nota: el autor indica que se trata de su propia implementacion del estilo Elo de GDPval de Artificial Analysis, no de puntuaciones oficiales de leaderboard. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 55,6 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) para servirlos sin cuantizar.
- En consumer GPU: no cabe en bf16 en una RTX 4090 (24 GB); seria necesaria cuantizacion (no documentada por el autor) para intentarlo, con perdida de calidad no evaluada.
- GPU recomendadas: A100 80GB o H100 80GB para bf16; configuraciones multi-GPU para servir el contexto completo de 262.144 tokens, que incrementa notablemente el uso de memoria KV.
- Despliegue: vLLM es la opcion documentada, con `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_xml` y decodificacion especulativa MTP (`num_speculative_tokens: 3`). No se documentan opciones para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIBuildAI ProWork-27B | 27,8B | 262.144 | Agente de trabajo profesional (fine-tune) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | 27B | 262.144 | Modelo generalista multimodal | Apache 2.0 (segun model card del autor) | Hugging Face |
| GPT-6 Astra (max) | no disponible | no disponible | Modelo propietario de referencia | Propietaria | API |

La comparacion con GPT-6 Astra se limita al Elo GDPval reportado por el autor; no hay datos publicos de parametros, contexto ni licencia en la informacion disponible. No se dispone de comparativas con otros modelos abiertos de tamano similar en los datos proporcionados.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion en cifras, citas y afirmaciones legales o medicas: el autor recomienda verificar explicitamente antes de confiar en ellas.
- La evaluacion GDPval es una implementacion propia del autor con jueces LLM, no una puntuacion oficial de leaderboard; debe interpretarse con cautela.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO).
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- El contexto de 262.144 tokens exige memoria KV considerable; sesiones agenticas de hasta 250 turnos pueden disparar costes de inferencia.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B antes de uso comercial.
- El modelo tiene un numero muy bajo de descargas y likes en el momento de la ficha, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aibuildai-inc/ProWork-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GDPval (OpenAI): no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
