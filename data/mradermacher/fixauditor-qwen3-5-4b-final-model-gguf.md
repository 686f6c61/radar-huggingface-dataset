# mradermacher/fixauditor-qwen3.5-4b-final-model-GGUF

## Resumen

`mradermacher/fixauditor-qwen3.5-4b-final-model-GGUF` es una publicacion de cuantizaciones GGUF estaticas del modelo base `justForAnonymous/fixauditor-qwen3.5-4b-final-model`, un modelo de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) derivado de la familia Qwen 3.5. El autor de las cuantizaciones es mradermacher, un conocido distribuidor de versiones GGUF de modelos open source, que en este caso no ha entrenado el modelo original sino que ha generado los ficheros listos para inferencia local con llama.cpp y derivados.

El modelo base conserva la arquitectura transformer de la familia Qwen y anade un componente multimodal, como demuestra la presencia de ficheros `mmproj` (proyeccion multimodal) en el repositorio, lo que sugiere capacidad de procesamiento de imagenes ademas de texto. El nombre "fixauditor" apunta a un ajuste fino orientado a tareas de auditoria o correccion, aunque la model card no documenta el proceso de entrenamiento ni los datos utilizados.

La relevancia practica de esta publicacion radica en que permite ejecutar un modelo de 4B con capacidades multimodales en hardware de consumo mediante cuantizaciones de 2 a 8,5 GB. Sin embargo, la ausencia de documentacion tecnica sobre el modelo base, la falta de licencia explicita y la inexistencia de benchmarks publicados limitan seriamente su uso en produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), con proyeccion multimodal (mmproj) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 4,2 mil millones de parametros perteneciente a la familia Qwen 3.5, segun indica el propio nombre del repositorio. La presencia de ficheros `mmproj-Q8_0.gguf` y `mmproj-f16.gguf` en la publicacion confirma que el modelo incorpora un proyector multimodal para el procesamiento de imagenes junto al texto, aunque no se especifica el codificador visual utilizado ni la resolucion de entrada soportada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, modos de razonamiento extendido). La model card del repositorio GGUF se limita a listar los ficheros generados y a remitir al modelo base, cuya documentacion tampoco se ha proporcionado. El autor de las cuantizaciones indica que no ha generado versiones ponderadas con imatrix, solo cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento multimodal de imagenes: la presencia de ficheros `mmproj` indica soporte de entrada visual, aunque no se detalla el tipo de tareas (VQA, OCR, descripcion) ni el rendimiento.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a traves de infraestructura de inferencia compatible con la API de HuggingFace.
- Uso con `transformers` y con llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Capacidades de tool calling, function calling, agentes multi-paso y razonamiento matematico: no documentadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Modo thinking o razonamiento extendido: no documentado.

## Casos de uso

- Inferencia local en equipos de desarrollo: con la cuantizacion Q4_K_M (2,8 GB) el modelo cabe en GPUs de consumo con 6-8 GB de VRAM, lo que permite probar un modelo de 4B con capacidades multimodales en un portatil gaming o una estacion de trabajo modestas.
- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno basicos, aunque la longitud de contexto no esta documentada y debe validarse antes de comprometerse con casos de contexto largo.
- Experimentacion con entrada visual: los ficheros mmproj permiten probar tareas de descripcion de imagenes o respuesta a preguntas visuales en local, util para evaluar si el ajuste fino del modelo base conserva las capacidades multimodales de Qwen.
- Evaluacion de modelos ajustados de nicho: dado el nombre "fixauditor", resulta adecuado para explorar si el ajuste fino orientado a auditoria o correccion de textos aporta ventajas frente al Qwen base en tareas de revision.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (2,0 GB) y Q3_K_S (2,2 GB) permiten ejecutar el modelo en CPU o en GPUs integradas, con la perdida de calidad que ello implica, para tareas de generacion de texto no criticas.
- Servicio de inferencia compatible con API: gracias a la etiqueta `endpoints_compatible`, puede integrarse en un endpoint de HuggingFace o en un servidor llama.cpp con API OpenAI para pruebas de integracion en aplicaciones existentes.
- Base para comparativas de cuantizacion: el repositorio ofrece doce niveles de cuantizacion distintos, lo que permite medir empiricamente el impacto de la cuantizacion en la calidad de salida para este modelo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): 2,0 GB (Q2_K), 2,8 GB (Q4_K_M), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16). A estos valores hay que sumar el proyector multimodal (0,5 GB en Q8_0 o 0,8 GB en f16) y la cache KV, cuyo tamano depende del contexto configurado y no puede calcularse sin conocer la longitud de contexto del modelo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 o superiores para las cuantizaciones altas; GPUs con 8 GB de VRAM son suficientes para Q4_K_M y Q5_K_M con contexto moderado.
- Cabe en GPU de consumo: si, desde GPUs de 6-8 GB para cuantizaciones Q2 a Q5, y de 12 GB o mas para Q8_0 y f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors, aunque esta publicacion concreta es solo GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| fixauditor-qwen3.5-4b (este) | 4,2 B | no disponible | Si (mmproj) | no disponible | GGUF, safetensors |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens | No | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-VL-3B-Instruct | 3,8 B | 32.768 tokens | Si | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3,2 B | 131.072 tokens | No | Llama 3.2 Community | safetensors, GGUF |

La comparativa con modelos de la familia Qwen es la mas directa por procedencia, pero conviene senalar que los datos de contexto, licencia y rendimiento de este modelo concreto no estan documentados, por lo que la comparacion se limita a parametros y disponibilidad. Frente a Qwen2.5-VL-3B-Instruct, la principal diferencia practica es la falta de licencia explicita y de benchmarks publicados en el caso de fixauditor.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, por lo que no es posible estimar la calidad del ajuste fino frente al Qwen base.
- Documentacion tecnica inexistente: se desconoce el proceso de entrenamiento, los datos utilizados, la longitud de contexto y las capacidades reales del ajuste "fixauditor".
- Riesgo de alucinacion: al tratarse de un ajuste fino no documentado sobre un modelo de 4B, la fiabilidad factua no esta garantizada y debe validarse con pruebas propias.
- Limitacion idiomatica: el modelo esta etiquetado unicamente como ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por parte de la comunidad ni de validacion independiente.
- Cuantizaciones estaticas sin imatrix: el autor indica que no ha generado versiones ponderadas, lo que puede suponer una perdida de calidad algo mayor en las cuantizaciones bajas (Q2_K, Q3_K_S) respecto a alternativas con imatrix.
- El repositorio ocupa 39,9 GB, pero cada fichero individual es pequeno; conviene descargar solo la cuantizacion necesaria para evitar consumo innecesario de disco y ancho de banda.
- Fecha de creacion futura (2026-11-02): la marca temporal del repositorio es posterior a la fecha actual, lo que puede indicar un error de metadatos o una publicacion programada; conviene verificar la integridad de los ficheros antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/fixauditor-qwen3.5-4b-final-model-GGUF
- Modelo base: https://huggingface.co/justForAnonymous/fixauditor-qwen3.5-4b-final-model
- Pagina de descargas del autor: https://hf.tst.eu/model#fixauditor-qwen3.5-4b-final-model-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
