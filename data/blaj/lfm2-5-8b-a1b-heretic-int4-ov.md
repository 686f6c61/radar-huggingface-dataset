# blaj/LFM2.5-8B-A1B-heretic-int4-ov

## Resumen

Este repositorio contiene una conversion a OpenVINO IR en cuantizacion int4 de Dingdust/LFM2.5-8B-A1B-heretic, una version "abliterated" (decensored) del modelo LiquidAI/LFM2.5-8B-A1B de Liquid AI. El modelo original es un transformer de tipo mezcla de expertos (MoE) con 24 capas, denominado comercialmente como 8B-A1B (8.000 millones de parametros totales, aproximadamente 1.000 millones activos por token, segun la nomenclatura del autor). La conversion la firma el usuario blaj y esta pensada para inferencia local sobre hardware Intel, tanto CPU como GPU integrada Arc.

El interes practico de esta ficha esta en dos puntos. Primero, la publicacion documenta con detalle un metodo de conversion en dos etapas (exportacion a IR fp16 y posterior compresion con NNCF) que evita el OOM del kernel en maquinas de 30 GB de RAM, un problema real al convertir MoE grandes con optimum-cli en un solo paso. Segundo, el autor publica mediciones de rendimiento single-stream sobre un Intel Core Ultra 7 258V: 74,3 tokens/s de throughput y 0,072 s hasta el primer token, frente a 49,1 tokens/s y 0,076 s de la variante hermana int8.

Es relevante ahora porque permite ejecutar un MoE de 8B en un equipo de consumo con GPU integrada Intel Arc manteniendo una huella de disco de 4,3 GB (4,6 GB segun el tamano del repositorio en HuggingFace) y sin renunciar a un decodificado por encima de 70 tokens/s. Como contrapartida, el modelo derivado ha sido "abliterated", es decir, se le ha reducido deliberadamente la conducta de rechazo, lo que lo hace inadecuado para despliegues de produccion con requisitos de seguridad o moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), clase Lfm2MoeForCausalLM, 24 capas |
| Parametros totales | 8.000 millones (denominacion LFM2.5-8B-A1B) |
| Parametros activos | aproximadamente 1.000 millones segun la denominacion A1B; no confirmado en la documentacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrico (INT4_ASYM, group_size=128, ratio=1.0) aplicado sobre IR fp16; el autor menciona una variante hermana int8 de 8,0 GB |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (campos del repositorio: license: other, license_name: lfm1.0) |
| Formato de pesos | OpenVINO IR (openvino_model.xml / openvino_model.bin), mas openvino_tokenizer y openvino_detokenizer en el mismo formato |
| Tamano del repositorio | 4,3 GB declarados en la model card; 4,6 GB segun los metadatos de HuggingFace |
| Modelo base | Dingdust/LFM2.5-8B-A1B-heretic (BF16, 18 shards, 16,9 GB); a su vez derivado de LiquidAI/LFM2.5-8B-A1B |
| Libreria de inferencia | openvino (openvino_genai / OpenVINO Model Server) |
| Dispositivo objetivo | CPU Intel y GPU integrada Intel Arc (validado en Arc 130V/140V) |
| Fecha de publicacion | 20 de septiembre de 2026 (creacion), 21 de septiembre de 2026 (ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura de partida es Lfm2MoeForCausalLM, un transformer con mezcla de expertos de 24 capas procedente de Liquid AI. El checkpoint original LFM2.5-8B-A1B se distribuye en BF16 con 18 shards y un total de 16,9 GB. Sobre el se aplico un proceso de "abliteration" para reducir los rechazos (Dingdust/LFM2.5-8B-A1B-heretic), y sobre ese derivado se realizo la cuantizacion que documenta este repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion tecnica documentada es exclusivamente de conversion, no de entrenamiento. El autor descarta el uso de una unica llamada a `optimum-cli export openvino --weight-format int8`, que en una maquina de 30 GB alcanza 28,6 GB de RSS anonimo y es terminado por el OOM killer. En su lugar emplea dos etapas: primero exporta a IR fp16 (16 GB) y despues comprime el IR directamente con `nncf.compress_weights` en modo INT4_ASYM con group_size=128 y ratio=1.0, sin cargar PyTorch ni reconstruir el grafo trazado. La segunda etapa tarda 39 s con un pico de RSS de 21,1 GB. El factor decisivo, segun el autor, fue limitar los pools de hilos a 4 mediante OMP_NUM_THREADS, MKL_NUM_THREADS, OPENBLAS_NUM_THREADS y NUMEXPR_NUM_THREADS, porque con la configuracion por defecto el export lanza mas de 200 hilos y cada worker materializa sus propios buffers. La receta fija ademas `transformers==5.4.0` como requisito duro de la puerta de exportacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado text-generation y plantilla de chat incluida (chat_template.jinja).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base LFM2.5-8B-A1B; no hay evaluaciones publicadas en la informacion disponible que las cuantifiquen.
- Reduccion deliberada de la conducta de rechazo ("abliterated" / "uncensored"): el modelo responde a peticiones que el modelo base rechazaria.
- Inferencia local sobre CPU Intel y GPU integrada Arc mediante OpenVINO GenAI o OpenVINO Model Server.
- Decodificado por encima de 70 tokens/s en modo single-stream sobre Intel Core Ultra 7 258V con GPU Arc, segun la medicion del autor.
- Arranque rapido: tiempo hasta el primer token de 0,072 s en la configuracion medida.
- No se documentan capacidades de vision, audio, tool calling ni modo de razonamiento explicito (thinking) en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Inferencia local en portatiles con GPU integrada Intel: el modelo ocupa 4,3 GB en disco y alcanza 74,3 tokens/s en un Core Ultra 7 258V, lo que permite asistentes de escritura o resumen sin conexion a Internet ni GPU dedicada.
- Despliegue en edge con recursos limitados: al ser un MoE con aproximadamente 1.000 millones de parametros activos por token, el coste de computo por token es inferior al de un modelo denso de 8B, algo util en dispositivos con presupuesto termico ajustado.
- Servicio de chat multiusuario en CPU con OpenVINO Model Server: el repositorio documenta explicitamente el uso de OVMS 2026.4.0 sobre el dispositivo GPU, lo que facilita exponer el modelo como endpoint HTTP en un servidor sin acelerador dedicado.
- Sustitucion de APIs comerciales en prototipos de investigacion: la licencia LFM Open v1.0 y la huella reducida permiten iterar localmente sin coste por token, siempre que se respete el umbral de uso comercial de la licencia.
- Experimentos de alineacion y seguridad: al ser una version abliterated, sirve como linea base para estudiar la degradacion de la conducta de rechazo y comparar contra el modelo original Dingdust/LFM2.5-8B-A1B-heretic en BF16.
- Generacion de texto creativo o de ficcion sin filtros editoriales: el modelo esta explicitamente orientado a un comportamiento sin rechazos, lo que encaja en tareas de escritura donde un modelo alineado bloquea el contenido.
- Canal de conversion y empaquetado: la receta de dos etapas con NNCF es reutilizable para convertir otros MoE grandes a OpenVINO IR int4 en maquinas con menos de 32 GB de RAM, un caso de uso tecnico en si mismo.

## Benchmarks y rendimiento

El autor publica una unica medicion, realizada en single-stream sobre un Intel Core Ultra 7 258V (GPU integrada Arc 130V/140V), 30 GB de RAM, con OpenVINO Model Server 2026.4.0 sobre el dispositivo GPU:

| Metrica | Esta build (int4) | Build hermana |
|---|---|---|
| Throughput | 74,3 tok/s | 49,1 tok/s |
| Tiempo hasta el primer token | 0,072 s | 0,076 s |
| Tamano del modelo | 4,3 GB | 8,0 GB |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos de conversion disponibles son: etapa 2 (compresion NNCF) en 39 s con pico de RSS de 21,1 GB, y exportacion fp16 completada en aproximadamente 10 minutos con los pools de hilos limitados a 4 (12 hilos de proceso), frente a 28,6 GB de RSS que provocaban OOM con hilos sin limitar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4,3-4,6 GB, de modo que el modelo en int4 requiere del orden de 5-6 GB de memoria compartida o dedicada si se anade la cache KV; se trata de una estimacion derivada del tamano del artefacto, no de una medicion publicada.
- GPU recomendadas: GPU integrada Intel Arc 130V/140V (configuracion validada por el autor); no hay datos publicados para A100, H100 u otras GPU dedicadas, dado que el objetivo del formato es el ecosistema OpenVINO Intel.
- Compatibilidad con GPU de consumo: si, cabe en equipos con GPU integrada Intel Arc actual y 30 GB de RAM, que es exactamente la maquina sobre la que se midio.
- Opciones de despliegue: OpenVINO GenAI (`openvino_genai.LLMPipeline`) y OpenVINO Model Server 2026.4.0. No se distribuyen pesos en safetensors, GGUF ni formato compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput conocidos: 0,072 s de time to first token y 74,3 tok/s de throughput en single-stream sobre la configuracion indicada. No hay datos de throughput agregado con multiples peticiones concurrentes.
- RAM necesaria solo para reproducir la conversion: 30 GB como minimo practico, 21,1 GB de pico en la etapa de compresion y pools de hilos limitados a 4 para evitar el OOM durante la exportacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| blaj/LFM2.5-8B-A1B-heretic-int4-ov (este) | 8B totales, ~1B activos (MoE) | no disponible | OpenVINO IR int4, 4,3 GB | 74,3 tok/s y 0,072 s TTFT en Core Ultra 7 258V | LFM Open License v1.0 |
| Build hermana int8 OpenVINO del mismo autor | 8B totales, ~1B activos (MoE) | no disponible | OpenVINO IR int8, 8,0 GB | 49,1 tok/s y 0,076 s TTFT en el mismo equipo | LFM Open License v1.0 |
| Dingdust/LFM2.5-8B-A1B-heretic | 8B totales, ~1B activos (MoE) | no disponible | safetensors BF16, 16,9 GB (18 shards) | no disponible | no disponible en la informacion proporcionada |
| LiquidAI/LFM2.5-8B-A1B | 8B totales, ~1B activos (MoE) | no disponible | safetensors BF16 | no disponible | LFM Open License v1.0 |

La ventaja medible de esta build frente a la int8 es doble: reduce el tamano de 8,0 GB a 4,3 GB (un 46 %) y mejora el throughput un 51 % (49,1 a 74,3 tok/s) con un tiempo hasta el primer token practicamente identico. Frente a las versiones BF16, la ganancia de tamano es de aproximadamente 4x. No se dispone de comparativas de calidad frente a modelos MoE de la competencia (por ejemplo, familia Qwen o Mixtral) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es una version "abliterated" de un modelo alineado: su conducta de rechazo esta reducida de forma deliberada, por lo que puede generar contenido danino, ofensivo o ilegal que el modelo base bloquearia. No es apto para uso en produccion orientado al publico general sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de calidad sobre este derivado. La cuantizacion int4 a group_size=128 introduce ademas una perdida de fidelidad respecto al BF16, no cuantificada en la documentacion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada. No se debe asumir la ventana de contexto del modelo original sin verificarla contra el config.json.
- Restricciones de licencia: rige la LFM Open License v1.0, que incluye un umbral de uso comercial aplicable a esta obra derivada. El autor indica que la redistribucion esta permitida con la licencia incluida, pero cualquier uso comercial por encima de ese umbral requiere revisar los terminos del fichero LICENSE antes de desplegar.
- Portabilidad limitada: los pesos solo existen como OpenVINO IR. No hay artefactos GGUF ni safetensors en este repositorio, de modo que no se puede usar con llama.cpp, Ollama, vLLM o TGI sin convertir de nuevo desde el modelo base.
- Ambiguedad documental: la model card afirma que existe una variante int8 "en blaj/LFM2.5-8B-A1B-heretic-int4-ov", que es la misma URL que el propio repositorio int4; se trata probablemente de un error de copia y conviene verificar el artefacto antes de descargarlo. Las etiquetas del repositorio mezclan "int4" e "int8".
- Cero adopcion verificable: 0 descargas y 0 me gusta en el momento de la consulta, sin validacion independiente de las mediciones de rendimiento publicadas.
- Reproducibilidad de la conversion: requiere `transformers==5.4.0` como requisito duro y pools de hilos limitados a 4; sin esas dos condiciones el proceso falla por OOM en maquinas de 30 GB.
- Soporte de tool calling, agentes y multi-step reasoning: no documentado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/LFM2.5-8B-A1B-heretic-int4-ov
- Modelo base intermedio (abliterated): https://huggingface.co/Dingdust/LFM2.5-8B-A1B-heretic
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Metodologia de benchmark del autor: https://huggingface.co/blaj/LFM2.5-8B-A1B-heretic-int4-ov/blob/main/BENCHMARK.md
- Licencia del modelo (LFM Open License v1.0): https://huggingface.co/blaj/LFM2.5-8B-A1B-heretic-int4-ov/blob/main/LICENSE

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo ni sobre su proceso de conversion; los unicos enlaces utiles son los anteriores, extraidos de los metadatos y de la model card del repositorio.
