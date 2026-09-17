# PrismLive/Qwen3.6-35B-A3B-uncensored-4bit

## Resumen

PrismLive/Qwen3.6-35B-A3B-uncensored-4bit es una version cuantizada a 4 bits en formato MLX del modelo llmfan46/Qwen3.6-35B-A3B-uncensored-heretic, que a su vez deriva del Qwen3.6-35B-A3B. Es, por tanto, un derivado de tercera generacion: el modelo original ha pasado primero por un proceso de abliteracion o decensurado (eliminacion de las direcciones de rechazo en los pesos, etiquetado aqui como heretic, abliterated y decensored) y despues por una cuantizacion a 4 bits optimizada para Apple Silicon.

Segun los metadatos de safetensors, el modelo tiene 34.660.608.768 parametros (unos 34,66 B) y el repositorio ocupa 20,4 GB. La etiqueta qwen3_5_moe apunta a una arquitectura de mezcla de expertos (MoE); la nomenclatura A3B del nombre sugiere del orden de 3 B de parametros activos por token, aunque ese dato no aparece confirmado en la informacion disponible. La licencia declarada es Apache 2.0.

Su relevancia practica es concreta pero limitada: permite ejecutar en local, sobre un Mac con memoria unificada suficiente, un modelo MoE de gran tamano sin el comportamiento de rechazo del modelo alineado original, con un coste de pesos de aproximadamente 20 GB. El repositorio se creo el 16 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes; su model card no contiene mas que el frontmatter, sin documentacion tecnica adicional del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta qwen3_5_moe; familia Qwen3.x MoE) |
| Parametros totales | 34.660.608.768 (~34,66 B), segun metadatos de safetensors |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en formato MLX; no se documentan otros niveles en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia del modelo Qwen original) |
| Formato de pesos | safetensors cuantizados en MLX (4 bits) |
| Tamano del repositorio | 20,4 GB |
| Libreria de inferencia | mlx |
| Modelo base | llmfan46/Qwen3.6-35B-A3B-uncensored-heretic |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La etiqueta qwen3_5_moe del repositorio indica una arquitectura de mezcla de expertos sobre un transformer, coherente con la nomenclatura del nombre (35B-A3B: decenas de miles de millones de parametros totales y unos pocos miles de millones activos por token). No hay informacion disponible sobre el numero de expertos, la estrategia de enrutamiento, el numero de capas ni la atencion empleada. Tampoco se documenta el contexto nativo ni si se aplica alguna tecnica de extension de contexto.

Respecto al entrenamiento, no hay datos disponibles sobre el volumen de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. La unica informacion tecnica implicita son las etiquetas heretic, abliterated y decensored, que describen una intervencion sobre los pesos del modelo alineado para eliminar las direcciones de activacion asociadas al rechazo de peticiones. El autor no detalla el metodo concreto, el conjunto de datos usado para calcular esas direcciones ni el impacto medido sobre las capacidades generales. La cuantizacion a 4 bits se ha realizado con las herramientas de MLX, pero no se especifica el esquema de cuantizacion (por ejemplo, tamano de grupo o bits por peso mas alla del nivel global de 4 bits).

## Capacidades

- Generacion de texto y uso conversacional: el pipeline declarado es text-generation y la etiqueta conversational aparece en el repositorio.
- Comportamiento sin rechazo: por construccion (abliterated, decensored), el modelo no aplica las negativas del modelo alineado ante peticiones que este rechazaria.
- Razonamiento, codigo y matematicas: no disponible. No se documenta si conserva las capacidades del Qwen3.6-35B-A3B original.
- Modo de pensamiento (thinking): no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades multimodales (vision, audio): no disponible; no hay indicios de soporte en las etiquetas del repositorio.
- Ejecucion local en Apple Silicon mediante MLX.

## Casos de uso

- Escritura creativa sin restricciones tematicas: ficcion, guiones o narrativa con violencia, contenido adulto o temas sensibles que un modelo alineado rechazaria. El modelo es adecuado porque la abliteracion elimina precisamente esas negativas, y al ejecutarse en local no hay moderacion externa ni envio de material a terceros.
- Procesamiento de documentos confidenciales en local: analisis y resumen de contratos, informes medicos o expedientes legales en un Mac, sin que el texto salga del equipo. El atractivo es la privacidad; conviene validar antes la calidad de resumen, que no esta documentada.
- Investigacion sobre alineacion y seguridad: estudiar como se comporta un modelo al que se le han eliminado las direcciones de rechazo, comparar sus respuestas con las del Qwen3.6-35B-A3B alineado y medir la degradacion de capacidades. El modelo sirve como sujeto de estudio de tecnicas de abliteracion.
- Generacion de datos sinteticos y anotacion: producir corpus de texto diverso, incluidos dominios que los modelos alineados evitan, para entrenamiento o evaluacion. Requiere revision humana posterior por el riesgo de alucinacion.
- Roleplay y compania conversacional: dialogos multi-turno con personajes y escenarios sin filtros de contenido, ejecutados integramente en el dispositivo. La viabilidad depende del contexto real soportado, que no esta documentado.
- Integracion en aplicaciones macOS: uso de MLX desde Swift o Python para incrustar el modelo en una app de escritorio con memoria unificada; el formato de pesos del repositorio esta pensado para ese ecosistema.
- Traduccion y procesamiento multilingue en local: solo si el modelo conserva las capacidades multilingues del Qwen3.6 base, algo que no se puede confirmar con la informacion disponible.
- Prototipado de asistentes internos sin filtros: entornos de desarrollo donde se necesita que el modelo no se niegue a responder sobre seguridad ofensiva, analisis de malware o temas regulados, siempre bajo responsabilidad del operador y con las salvaguardas externas que correspondan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio (que solo contiene frontmatter) ni los datos de HuggingFace proporcionados incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni del modelo cuantizado ni del modelo base abliterated. Tampoco hay datos de perplejidad que permitan estimar la perdida introducida por la cuantizacion a 4 bits.

## Requisitos de hardware

- Pesos en disco: 20,4 GB, correspondientes a la cuantizacion a 4 bits de 34,66 B de parametros.
- Memoria estimada para inferencia: del orden de 22 a 26 GB contando pesos mas cache KV en contextos moderados. Es una estimacion propia, no verificada por el autor.
- Apple Silicon (plataforma objetivo): memoria unificada de 32 GB o mas para trabajar con comodidad; 24 GB puede bastar en contextos cortos; 16 GB no es suficiente para cargar los pesos.
- GPU NVIDIA: MLX no soporta CUDA, por lo que este repositorio no se puede ejecutar directamente en GPU NVIDIA. Seria necesaria una conversion previa a otro formato (GGUF, safetensors estandar) que el autor no proporciona.
- GPU AMD e Intel: no disponibles para este formato.
- Cabe en GPU de consumo: no en su formato actual. Tras una conversion hipotetica a 4 bits para llama.cpp, un modelo de este tamano rondaria los 20 GB y entraria con dificultad en una RTX 4090 de 24 GB, y con mas margen en una RTX 5090 de 32 GB.
- Opciones de despliegue: mlx-lm y mlx_lm.server en macOS; LM Studio u otras interfaces que consuman pesos MLX. vLLM y TGI no cargan pesos MLX. Ollama y llama.cpp requeririan una conversion a GGUF que no esta publicada.
- Latencia y throughput: no disponibles. Si se confirma la naturaleza MoE con unos 3 B de parametros activos, la velocidad de decodificacion seria notablemente superior a la de un modelo denso de 35 B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| PrismLive/Qwen3.6-35B-A3B-uncensored-4bit | 34,66 B (4 bits) | no disponible | Apache 2.0 | MLX safetensors 4 bits | no disponible |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.6-35B-A3B (upstream alineado) | no disponible | no disponible | Apache 2.0 (segun el enlace de licencia) | no disponible | no disponible |

La comparacion cuantitativa no es posible con los datos disponibles: no hay cifras publicadas para ninguno de los tres modelos de la cadena de derivacion. Las diferencias documentadas son de formato y comportamiento esperado (pesos MLX a 4 bits frente al modelo base sin cuantizar, y ausencia de alineacion de seguridad frente al Qwen original).

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de las direcciones de rechazo puede degradar la coherencia, la utilidad general y la calidad del razonamiento. No hay mediciones publicadas de ese impacto en este repositorio.
- Contenido danino: el modelo puede generar instrucciones peligrosas, contenido ilegal o material ofensivo sin negarse. Su uso en productos de cara al publico sin salvaguardas externas es desaconsejable y puede tener consecuencias legales segun la jurisdiccion.
- Model card practicamente vacia: solo contiene frontmatter. No hay informacion sobre datos de entrenamiento, contexto, idiomas ni uso previsto.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, con creacion y ultima actualizacion el mismo dia. No hay evidencia externa de que los pesos carguen o generen texto correctamente.
- Inconsistencia de nomenclatura: el identificador dice Qwen3.6 mientras que la etiqueta de arquitectura es qwen3_5_moe; conviene verificar la arquitectura real antes de integrarlo.
- Cuantizacion a 4 bits: introduce perdida de calidad no medida frente al modelo base en precision completa.
- Compatibilidad restringida: formato MLX, por lo que queda limitado al ecosistema Apple Silicon salvo conversion manual.
- Contexto e idiomas no documentados: no se puede garantizar el rendimiento en conversaciones largas ni en castellano.
- Alucinacion: sin datos de evaluacion, debe asumirse el riesgo habitual de los modelos de lenguaje y verificar cualquier salida factual.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio remite a la licencia del Qwen3.6-35B-A3B original; conviene revisar ese texto antes de explotarlo comercialmente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/PrismLive/Qwen3.6-35B-A3B-uncensored-4bit
- Modelo base directo: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Licencia del modelo Qwen original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Repositorio del modelo Qwen upstream: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- MLX (framework de inferencia requerido): https://github.com/ml-explore/mlx
- mlx-lm (servidor y utilidades de generacion): https://github.com/ml-explore/mlx-lm
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces disponibles trataban sobre Gemini, astrologia y otros temas sin relacion.
