# AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.5-9B-MLX-AXQ-MXFP4-MTP es una conversión cuantizada del checkpoint oficial Qwen3.5-9B en BF16, publicada por AutomatosX mediante su herramienta AXQuant 2.3.0 y empaquetada en formato MLX para Apple Silicon. No es un modelo nuevo ni reentrenado: los pesos de origen no se han entrenado ni aumentado, y el trabajo del autor se limita a la cuantización y al empaquetado de los tensores. El resultado ocupa 8,255 GB en safetensors, con una media de 6,6044 bits por peso (BPW) en el modelo principal y 6,8412 BPW si se incluye la carga útil MTP.

El interés técnico está en la mezcla de precisiones: las proyecciones de atención y MLP del modelo de lenguaje usan MXFP4 nativo de MLX con grupo de 32, mientras que visión, MTP, normas y la cabeza de salida se mantienen en BF16, y los embeddings emplean empaquetado afín de 8 bits con grupo 32. Esa asimetría busca preservar los componentes sensibles a la precisión mientras se reduce el coste de almacenamiento de la mayor parte de la matriz de pesos.

Conviene subrayarlo con claridad: el autor lo describe como un artefacto de desarrollo, sin certificados de calidad, aceptación de MTP ni velocidad, y sin evaluaciones amplias de texto, imagen, vídeo, uso de herramientas o contexto largo. Solo se verificó una generación de texto acotada con MLX-LM sobre un Mac Studio M2 Ultra. Es, por tanto, material para experimentación en local, no un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); sin evidencia de MoE en la informacion disponible |
| Parametros totales | 8.953.801.728 (8,95 mil millones) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | MXFP4 group32 (atención y MLP del modelo de lenguaje); BF16 (visión, MTP, normas, cabeza de salida); embeddings en afin de 8 bits group32. Media de 6,6044 BPW en el modelo principal y 6,8412 BPW con MTP |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (se incluye LICENSE original y NOTICE con los cambios de cuantizacion) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); tamano de descarga 8,255 GB |
| Version del cuantizador | AXQuant 2.3.0 |
| Revision inmutable del origen | `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Artefactos auxiliares | `mtp.safetensors`, `axquant_manifest.json`, `axquant_compatibility.json`, `runtime_smoke.json`, `LICENSE`, `NOTICE` |
| Entorno verificado | MLX 0.32.1, MLX-LM 0.31.3, MLX-VLM 0.6.17 |
| Hardware de prueba | Mac Studio M2 Ultra (configuracion de memoria no disponible) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-9B original, un transformer denso de 8,95 mil millones de parametros del que esta publicacion solo modifica la representacion numerica de los pesos. No hay entrenamiento adicional, ajuste fino, RLHF ni DPO asociados a este repositorio: el autor indica explicitamente que los pesos de origen no se entrenaron ni aumentaron, y que no se usaron datos de cuantizaciones de la competencia. Tampoco se dispone de informacion sobre el corpus de preentrenamiento del modelo base en la documentacion proporcionada.

La innovacion del artefacto es el plan de cuantizacion de AXQuant 2.3.0. Las proyecciones elegibles de atención y MLP se convierten a MXFP4 nativo de MLX con tamano de grupo 32; visión, la carga útil MTP, las normas y la cabeza de salida conservan BF16; los embeddings se empaquetan en 8 bits con cuantizacion afín y grupo 32. El autor advierte que el nombre del formato no implica que todos los tensores compartan precision, y que el BPW declarado incluye suelos de proteccion y sobrecarga de metadatos. La planificacion manual se describe como evidencia previa de arquitectura no medida, y MXFP8 como un reempaquetado fisico explicito tampoco medido, no como un metodo de sensibilidad calibrado.

El repositorio incluye una carga útil MTP (`mtp.safetensors`) heredada del modelo base, orientada a prediccion multi-token, pero el autor es explicito: su presencia no demuestra ejecucion, aceptacion, exactitud ni aceleracion, y no se ha verificado el funcionamiento con MTP activado o desactivado. El ejemplo de uso publicado emplea generacion autorregresiva convencional.

## Capacidades

- Generacion de texto conversacional: el ejemplo oficial carga el tokenizador con plantilla de chat y `enable_thinking=False`, lo que sugiere que la plantilla del modelo base contempla un modo de razonamiento desactivable; el artefacto no documenta su comportamiento.
- Generacion de texto autoregresiva verificada de forma acotada con MLX-LM sobre el payload exacto publicado (prueba de humo con digest de payload y versiones de dependencias registradas en `runtime_smoke.json`).
- Vision: el modelo base incorpora una torre de vision que se conserva en BF16 como sidecar separado, pero el autor confirma que el cargador estandar de MLX-VLM 0.6.17 no carga ese sidecar protegido y no indexado, por lo que la generacion de imagen no esta soportada por esta exportacion.
- Video: mencionado en la documentacion como area no evaluada; no hay evidencia de funcionamiento en este artefacto.
- Tool calling / function calling: no evaluado en esta exportacion; el autor cita explicitamente el uso de herramientas entre las evaluaciones no realizadas.
- Contexto largo: no evaluado; no se ha realizado ninguna prueba de rendimiento con ventanas extensas.
- Razonamiento multi-paso y agentes: sin evaluacion publicada para este artefacto.
- Multilingue: no disponible; no se declaran idiomas soportados.
- Prediccion multi-token (MTP): payload presente pero sin verificar ejecucion ni aceptacion.

## Casos de uso

- Experimentacion local en Apple Silicon: cargar el repositorio con MLX-LM en un Mac con memoria unificada suficiente para comparar la calidad de la mezcla MXFP4/BF16 frente al checkpoint BF16 original en tareas de texto cortas, fijando la revision inmutable para que las comparaciones sean reproducibles.
- Prototipado de asistentes conversacionales en escritorio: el modelo cabe en un equipo de sobremesa de Apple y permite iterar sobre plantillas de chat y prompts sin depender de una GPU dedicada ni de servicios en la nube, con la salvedad de que solo se ha validado una generacion de 64 tokens.
- Evaluacion de la propia tecnica AXQuant: investigadores interesados en cuantizacion post-entrenamiento pueden usar `axquant_manifest.json` para auditar que tensores recibieron que precision y medir el impacto de proteger visión, MTP, normas y cabeza de salida en BF16 mientras el resto baja a MXFP4.
- Pruebas de regresion de toolchains MLX: sirve como artefacto de referencia para verificar que una version concreta de MLX-LM carga safetensors con MXFP4 group32 y embeddings de 8 bits sin errores, comparando contra los digests registrados en `runtime_smoke.json`.
- Generacion de texto offline con requisitos de privacidad: al ejecutarse completamente en local sobre MLX, es adecuado para flujos donde los datos no pueden salir del equipo, siempre que las tareas se limiten a texto y se asuma la ausencia de evaluaciones de calidad.
- Base para futuras exportaciones multimodales: el payload de vision en BF16 se conserva aparte precisamente para una exportacion de runtime explicita futura, de modo que el repositorio sirve como punto de partida para quien quiera construir ese cargador.
- Comparativa de eficiencia de almacenamiento: con 6,8412 BPW frente a los 16 bits del BF16 original, resulta util para medir el ahorro real de espacio y el coste en calidad en un entorno controlado de un solo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se han realizado evaluaciones amplias de texto, imagen, video, uso de herramientas, contexto largo ni calidad de tareas, y que el artefacto carece de certificados de calidad, aceptacion de MTP o velocidad. La unica evidencia de runtime es una prueba de humo de generacion de texto acotada, cuyos resultados cualitativos y digests estan en `runtime_smoke.json`, sin metricas comparativas publicadas.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: los pesos suman 8,255 GB en safetensors; en carga hay que anadir la cache KV y el overhead del runtime. Como estimacion, un contexto corto deberia manejarse con 10-12 GB de memoria unificada, y contextos largos requeriran bastante mas. El autor advierte que el uso real de memoria depende de la carga, el contexto, la entrada de vision y la configuracion del runtime.
- Plataforma: exclusivamente Apple Silicon. La libreria declarada es `mlx` y el formato de pesos es MLX, por lo que no hay soporte documentado para CUDA, ROCm ni CPU x86.
- GPU recomendadas: el unico hardware verificado es un Mac Studio M2 Ultra. Cualquier chip de la familia M con memoria unificada suficiente es un candidato razonable, pero no esta validado.
- Cabe en hardware de consumo: si, en equipos Apple con memoria unificada de 16 GB o superior para texto y contexto moderado; se recomienda 32 GB o mas para margen y contextos amplios. No hay datos para GPUs de consumo tipo RTX 4090 porque el formato no es compatible con CUDA.
- Opciones de despliegue: MLX-LM (probado con 0.31.3 sobre MLX 0.32.1). MLX-VLM 0.6.17 no carga el sidecar de vision. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; no se han publicado conversiones a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Perfiles de compatibilidad: `axquant_compatibility.json` es evidencia estatica ligada al manifiesto; los perfiles oMLX/MTPLX siguen sin soporte y la publicacion no promueve compatibilidad de runtime ni qualificacion nativa de AX Engine.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3.5-9B-MLX-AXQ-MXFP4-MTP (este artefacto) | 8,95 B | No disponible | MXFP4 + BF16 + embeddings 8 bits; 6,8412 BPW; 8,255 GB | Apache-2.0 | HuggingFace, formato MLX |
| Qwen/Qwen3.5-9B (modelo base) | 8,95 B | No disponible | BF16 | Apache-2.0 | HuggingFace, revision `c2022362...` |
| Otras cuantizaciones MLX de 4 bits del mismo base | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Alternativas densas de 7-9 B de otras familias | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

El unico punto de comparacion con datos verificables dentro de la informacion proporcionada es el checkpoint BF16 del que deriva: mismos 8,95 mil millones de parametros y misma licencia Apache-2.0, pero con el doble de bits por peso y, por tanto, aproximadamente el doble de espacio en disco. No se dispone de metricas de calidad que permitan cuantificar la perdida introducida por la cuantizacion, ni de datos verificados de modelos competidores en la documentacion facilitada.

## Limitaciones y advertencias

- Artefacto de desarrollo: el autor declara que no cuenta con certificados de Tier 1, Tier 2, calidad, aceptacion de MTP ni velocidad. No debe tratarse como una publicacion cualificada.
- Ausencia total de evaluaciones: no se han realizado pruebas amplias de texto, imagen, video, uso de herramientas, contexto largo ni calidad de tareas. El unico caso validado es una generacion de texto acotada.
- Vision no funcional en la practica: MLX-VLM 0.6.17 no carga el sidecar de vision protegido y no indexado; la generacion de imagen no esta soportada por esta exportacion con el cargador estandar.
- MTP sin verificar: la presencia de `mtp.safetensors` no implica que la prediccion multi-token funcione, sea aceptada por el modelo o aporte aceleracion. No se ha comprobado la ejecucion con MTP activado o desactivado.
- Precision no uniforme: el nombre del formato no garantiza la misma precision en todos los tensores; el BPW declarado incluye suelos de proteccion y metadatos, por lo que el ahorro real varia por capa.
- Planificacion no medida: el autor califica la planificacion manual como evidencia previa de arquitectura no medida, y MXFP8 como reempaquetado fisico explicito tampoco medido.
- Dependencia de plataforma: solo Apple Silicon y solo MLX-LM; sin soporte documentado para CUDA, llama.cpp, Ollama, vLLM o TGI, lo que limita su uso en infraestructura de servidores convencional.
- Riesgo de alucinacion: no cuantificado para este artefacto; al no haber evaluaciones, no puede acotarse la tasa de error factual ni la degradacion respecto al BF16.
- Sesgos: no documentados. Al no incluirse informacion sobre los datos de entrenamiento del modelo base ni evaluaciones de sesgo, no es posible caracterizarlos.
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento fuera de las lenguas cubiertas por el modelo base.
- Contexto: la longitud de contexto no esta disponible en la informacion proporcionada y no se ha probado el rendimiento en ventanas largas.
- Licencia: Apache-2.0 permite uso comercial, pero obliga a conservar el aviso de licencia y el NOTICE que identifica los cambios de cuantizacion; los certificados historicos existentes no vinculan esta nueva exportacion y no se reutilizan.
- Reproducibilidad: conviene fijar la revision inmutable del Hub; las versiones de dependencias verificadas son concretas (MLX 0.32.1, MLX-LM 0.31.3) y otras combinaciones no estan probadas.

## Enlaces

- [Modelo en HuggingFace: AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-MXFP4-MTP](https://huggingface.co/AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-MXFP4-MTP)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Revision inmutable del modelo base utilizada](https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a)
- [Coleccion AX BI](https://huggingface.co/collections/AutomatosX/ax-bi-6ad54be40f8f1d5415a8d15a)
- [Coleccion AX Work](https://huggingface.co/collections/AutomatosX/ax-work-6ad54c25c37f597f21344945)
- Archivos de evidencia incluidos en el repositorio: `axquant_manifest.json`, `axquant_compatibility.json`, `runtime_smoke.json`, `LICENSE`, `NOTICE`, `mtp.safetensors`
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relevantes para este modelo.
