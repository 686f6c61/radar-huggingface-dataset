# AzadDjan/modernbert-large-banking77-lora

## Resumen

modernbert-large-banking77-lora es un adaptador LoRA entrenado por el usuario AzadDjan sobre el modelo encoder answerdotai/ModernBERT-large, especializado en clasificación de intenciones bancarias. El adaptador se ha ajustado sobre el dataset PolyAI/banking77, compuesto por consultas reales de atención al cliente de banca etiquetadas con 77 intenciones finas, y resuelve una tarea muy concreta: asignar una de esas 77 categorías a un texto de entrada. No es un modelo generativo ni un asistente conversacional; es un clasificador de texto.

El repositorio contiene únicamente los pesos del adaptador en formato safetensors (tamaño declarado de 0,0 GB, compatible con la naturaleza de LoRA), y depende del modelo base ModernBERT-large, un transformer encoder de aproximadamente 395 millones de parámetros con ventana de contexto de hasta 8192 tokens. La relevancia de esta ficha es acotada: se trata de un artefacto muy específico, con 0 descargas y 0 "likes" en el momento de la consulta, sin validación por parte de la comunidad y con resultados declarados por el propio autor sin verificación externa (el campo `verified` del model-index es `false` en todas las métricas).

El interés técnico está, por tanto, en su uso como pieza de enrutamiento de intenciones en un pipeline bancario: un clasificador pequeño, rápido y barato de desplegar que puede decidir qué hace después un sistema mayor. Cualquier evaluación en producción debería partir de una reproducción independiente de las métricas y de una comprobación de que el adaptador carga correctamente en la versión de PEFT y Transformers declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia ModernBERT); el repositorio contiene un adaptador LoRA, no los pesos completos |
| Parametros totales | No disponible en la informacion del repositorio. El modelo base answerdotai/ModernBERT-large tiene aproximadamente 395 M de parametros segun su documentacion publica (no verificado en esta busqueda) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible para el adaptador. El modelo base ModernBERT-large soporta hasta 8192 tokens segun su documentacion publica |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene el adaptador en safetensors; no se publican versiones GGUF, GPTQ, AWQ ni int8 |
| Idiomas soportados | No disponible en el repositorio. El dataset banking77 es en ingles y el modelo base esta entrenado principalmente en ingles, por lo que el uso realista es en ingles |
| Licencia | apache-2.0 (adaptador). El modelo base answerdotai/ModernBERT-large tambien se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT). Tamano de repositorio declarado: 0,0 GB |
| Modelo base | answerdotai/ModernBERT-large |
| Dataset de ajuste | PolyAI/banking77 |
| Tarea declarada | Text classification / intent classification (77 clases) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Creado / actualizado | 2026-09-17 (fechas registradas en el repositorio) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre ModernBERT-large, un transformer encoder de tipo "encoder-only" que introduce mejoras sobre la arquitectura BERT clasica: embeddings posicionales rotatorios (RoPE), atencion alterna entre capas locales (ventana de 128 tokens) y globales cada tres capas, activaciones GeGLU, eliminacion de sesgos en las capas lineales y atencion sin padding (unpadding). Estas innovaciones permiten manejar secuencias de hasta 8192 tokens con un coste computacional menor que un encoder estandar de contexto largo. La informacion disponible no especifica el rango (rank) del adaptador LoRA, ni las capas objetivo, ni si existe una cabeza de clasificacion entrenada junto al adaptador o si se reutiliza la del modelo base; todos esos datos figuran como no disponibles.

El entrenamiento se realizo con el Trainer de Transformers y PEFT sobre el dataset banking77, con los siguientes hiperparametros declarados: learning rate 1e-4, scheduler lineal, batch de entrenamiento 16, batch de evaluacion 32, acumulacion de gradientes 2 (batch total 32), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, semilla 42 y 8 epocas (2256 pasos). Las versiones de framework declaradas son PEFT 0.21.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. No se documenta composicion del dataset mas alla de banking77, ni si hubo destilacion, aumento de datos o tecnicas adicionales de regularizacion; la model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

Evolucion del entrenamiento declarada por el autor:

| Epoca | Paso | Training loss | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|---|
| 1,0 | 282 | 0,9839 | 0,4775 | 0,8671 | 0,8759 | 0,8715 | 0,8626 |
| 2,0 | 564 | 0,5067 | 0,3470 | 0,9131 | 0,9183 | 0,9147 | 0,9116 |
| 3,0 | 846 | 0,2656 | 0,3133 | 0,9231 | 0,9313 | 0,9257 | 0,9249 |
| 4,0 | 1128 | 0,1220 | 0,2974 | 0,9301 | 0,9350 | 0,9337 | 0,9316 |
| 5,0 | 1410 | 0,0677 | 0,3167 | 0,9251 | 0,9309 | 0,9291 | 0,9271 |
| 6,0 | 1692 | 0,0247 | 0,3185 | 0,9271 | 0,9342 | 0,9267 | 0,9264 |
| 7,0 | 1974 | 0,0051 | 0,3102 | 0,9331 | 0,9367 | 0,9346 | 0,9330 |
| 8,0 | 2256 | 0,0032 | 0,3174 | 0,9351 | 0,9399 | 0,9378 | 0,9362 |

La lectura de la tabla sugiere un sobreajuste progresivo: la perdida de entrenamiento cae hasta 0,0032 mientras la de validacion se estanca alrededor de 0,30-0,32 desde la epoca 4. La mejor metrica de validacion se alcanza en la ultima epoca, pero con un margen muy estrecho respecto a la epoca 4, lo que indica que el margen de mejora por entrenamiento adicional es minimo.

## Capacidades

- Clasificacion de texto en 77 clases de intencion del dominio bancario (banking77), con salida de etiqueta unica.
- Deteccion de intenciones de cliente en consultas cortas de atencion al cliente: cargos no reconocidos, transferencias, bloqueo de tarjeta, estado de reclamaciones, limites, etc.
- Procesamiento de secuencias largas teoricamente hasta 8192 tokens (heredado del modelo base), util si se clasifica una conversacion completa en lugar de un turno aislado.
- Capacidad multilingue: no disponible. El entrenamiento y la evaluacion son en ingles, y no se declara soporte de otros idiomas.
- Generacion de texto: no. Es un encoder de clasificacion, no un modelo causal de lenguaje.
- Tool calling / function calling: no.
- Razonamiento multi-paso o comportamiento de agente: no.
- Vision, audio o multimodalidad: no.
- Capacidades especiales (modo "thinking", RAG nativo, embeddings): no declaradas.

## Casos de uso

- Enrutamiento de peticiones en atencion al cliente bancaria: el clasificador asigna cada mensaje entrante a una de las 77 intenciones y el sistema lo deriva al equipo o flujo correcto (tarjetas, transferencias, reclamaciones). Es adecuado porque la taxonomia de banking77 esta disenada exactamente para ese tipo de triaje.
- Triaje previo en un chatbot con LLM: usar este encoder como filtro barato antes de invocar un modelo generativo. Solo las consultas que requieren respuesta abierta pasarian al LLM, reduciendo coste y latencia del pipeline.
- Etiquetado y analitica de motivos de contacto: clasificar en lote el historico de conversaciones de un CRM bancario para construir cuadros de mando de volumen por intencion y detectar tendencias. El modelo es pequeno y puede procesar grandes volumenes en GPU o CPU.
- Preanotacion para equipos de datos: el adaptador genera etiquetas iniciales sobre nuevas conversaciones que despues revisan anotadores humanos, acelerando la construccion de datasets propios de intenciones.
- Priorizacion y escalado a agentes humanos: detectar intenciones sensibles (fraude, cargos no reconocidos, bloqueos) y elevar la prioridad del ticket. La clasificacion es rapida y determinista, sin generacion de texto que pueda introducir errores.
- Enrutamiento en asistentes de voz o IVR: la transcripcion del cliente se clasifica para decidir la siguiente accion del arbol de dialogo, sustituyendo reglas por palabras clave por un clasificador entrenado.
- Filtrado de consultas fuera de dominio: usar la confianza del clasificador para marcar mensajes que no encajan en ninguna de las 77 intenciones y desviarlos a un flujo generico (siempre que se calibre el umbral con datos propios).
- Inferencia en el borde o en infraestructura limitada: al ser un encoder de unos 400 M de parametros (base) mas un adaptador pequeno, se puede desplegar en una unica GPU de gama media e incluso en CPU para volumenes moderados.

## Benchmarks y rendimiento

Los datos siguientes proceden del `model-index` de la model card, es decir, son resultados declarados por el autor y con `verified: false`. Los valores se presentan redondeados a cuatro decimales.

| Tarea | Dataset | Split | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| Text classification | banking77 (PolyAI/banking77) | no especificado | 0,9351 | 0,9399 | 0,9378 | 0,9362 |
| Intent classification | Banking77 (PolyAI/banking77) | test | 0,9328 | 0,9345 (macro) | 0,9328 (macro) | 0,9327 (macro F1) |

La model card anade la perdida de evaluacion asociada al mejor punto: 0,3174. No se han publicado en la informacion disponible resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros), lo cual es coherente con la naturaleza del modelo: se trata de un clasificador de intenciones, no de un modelo generativo. Tampoco se han publicado comparaciones controladas con otros clasificadores sobre el mismo split de banking77.

## Requisitos de hardware

- El repositorio del adaptador pesa 0,0 GB. El coste de almacenamiento relevante es el del modelo base.
- VRAM estimada para el modelo base segun precision (estimacion a partir de ~395 M de parametros, no medida por el autor): aproximadamente 1,6 GB en fp32, 0,8 GB en fp16/bf16 y 0,4 GB en int8. Hay que sumar activaciones, que crecen con la longitud de secuencia y el tamano de lote.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o mas deberia ser suficiente para inferencia en fp16 con lotes pequenos y secuencias cortas. Con textos de 8192 tokens, los requisitos de memoria de activaciones suben de forma notable.
- GPU recomendadas para produccion con alto volumen: no hay datos publicados. Por tamano, una NVIDIA T4, L4, A10 o RTX 4090 serian suficientes; A100/H100 serian sobredimensionadas salvo por necesidad de throughput muy alto.
- CPU: la inferencia en CPU es viable para textos cortos (encoder de ~400 M de parametros), aunque no se han publicado mediciones.
- Despliegue: la via verificada es Transformers + PEFT 0.21.0 (las versiones declaradas por el autor). Otras opciones como ONNX Runtime, exportacion con Optimum, TorchScript o `torch.compile` no estan verificadas para este adaptador.
- vLLM, TGI, Ollama, llama.cpp: no disponibles o no verificados para este artefacto. vLLM y TGI estan orientados a modelos generativos o a pooling, y el soporte de adaptadores LoRA sobre encoders no se declara en la informacion disponible. Los formatos GGUF, GPTQ y AWQ no se publican.
- Latencia y throughput: no disponible. No se han publicado mediciones para este adaptador ni para el modelo base con esta cabeza de clasificacion.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de parametros, contexto y licencia de los modelos alternativos provienen de la documentacion publica de sus repositorios y no se han verificado en la busqueda web de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Tarea | Accuracy en banking77 |
|---|---|---|---|---|---|
| AzadDjan/modernbert-large-banking77-lora (este) | Adaptador LoRA sobre base de ~395 M | No disponible en el adaptador (base: hasta 8192) | Apache 2.0 | Clasificacion de 77 intenciones | 0,9351 (validacion) / 0,9328 (test), declarado por el autor y no verificado |
| answerdotai/ModernBERT-large | ~395 M | 8192 | Apache 2.0 | Encoder generalista (clasificacion, retrieval, embeddings) | No disponible (sin ajuste especifico sobre banking77) |
| answerdotai/ModernBERT-base | ~149 M | 8192 | Apache 2.0 | Encoder generalista | No disponible |
| google-bert/bert-base-uncased | ~110 M | 512 | Apache 2.0 | Encoder generalista | No disponible |
| microsoft/deberta-v3-base | ~184 M | 512 | MIT | Encoder generalista | No disponible |

## Limitaciones y advertencias

- Resultados no verificados: todas las metricas del `model-index` tienen `verified: false` y proceden del propio autor. No hay evaluacion independiente ni replicacion publica.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta. No hay issues, discusiones ni informes de terceros que permitan juzgar la estabilidad del adaptador.
- Model card incompleta: las secciones de descripcion del modelo, usos previstos, limitaciones y datos de entrenamiento dicen literalmente "More information needed". No se documentan el rango del LoRA, las capas objetivo, la cabeza de clasificacion, la longitud de secuencia de entrenamiento ni el preprocesado.
- Dominio muy restringido: banking77 cubre 77 intenciones bancarias en ingles. El modelo no es util fuera de ese dominio ni como clasificador general.
- Idioma: no se declara soporte multilingue. El uso con textos en castellano u otros idiomas no esta respaldado por el entrenamiento y previsiblemente degradara el rendimiento.
- Sesgos: no hay analisis de sesgos publicado. Un clasificador de intenciones bancarias puede heredar sesgos de los datos de atencion al cliente (por ejemplo, sobrerrepresentacion de determinados productos o perfiles), y no se ha auditado.
- Alucinacion: al ser un clasificador, no genera texto, por lo que no alucina en sentido estricto. El riesgo equivalente es la asignacion erronea de intencion con alta confianza, especialmente en clases poco representadas o en textos ambiguos.
- Sobreajuste probable: la perdida de entrenamiento cae a 0,0032 mientras la de validacion se estanca en torno a 0,32 desde la epoca 4, lo que sugiere que mas entrenamiento no aporta mejora fiable.
- Calibracion de confianza no documentada: no hay informacion sobre la fiabilidad de las probabilidades de salida, algo critico si se usa un umbral de confianza para derivar consultas fuera de dominio.
- Dependencia de versiones: el autor declara PEFT 0.21.0, Transformers 5.17.0 y PyTorch 2.11.0+cu128. Versiones distintas pueden no cargar el adaptador correctamente; conviene fijar el entorno.
- Licencia: el adaptador y el modelo base se distribuyen bajo Apache 2.0, lo que en principio permite uso comercial. Aun asi, conviene revisar los terminos del dataset banking77 para usos derivados y no asumir que la licencia del modelo cubre los datos de entrenamiento.
- Fechas del repositorio: la fecha de creacion registrada (2026-09-17) y el tamano de repositorio de 0,0 GB son metadatos del propio repositorio; conviene verificar la integridad de los ficheros antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AzadDjan/modernbert-large-banking77-lora
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset banking77: https://huggingface.co/datasets/PolyAI/banking77
- Libreria PEFT: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo base: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible
- Resultados de la busqueda web: las busquedas realizadas no devolvieron ningun enlace relevante sobre este modelo, su autor, ModernBERT o el dataset banking77; los resultados obtenidos correspondian a paginas de soporte de Microsoft sin relacion con el modelo.
