# smdesai/GLiNER25-Multi-FP16-CoreML

## Resumen

GLiNER25-Multi-FP16-CoreML es un port a Core ML del extractor de fronteras (boundary extractor) multilingue GLiNER2.5, publicado por el usuario smdesai y construido a partir del checkpoint `fastino/gliner2.5-multi-v1` de Fastino. El modelo original se apoya en una arquitectura mDeBERTa-v3-base con 287 millones de parametros y esta disenado para extraccion de informacion dirigida por esquema (schema-driven): entidades, clasificacion de texto, relaciones, registros estructurados y atributos de span. Esta version concreta reempaqueta ese modelo en un programa multifuncion de Core ML en FP16 (711 MB) compatible con iOS 18 y macOS 15 en adelante, de modo que toda la inferencia se ejecuta en el dispositivo sin conexion.

El problema que resuelve es doble. Por un lado, ofrece extraccion de informacion generica con cero ejemplos (zero-shot) especificando los tipos de entidad o las etiquetas en el prompt, sin reentrenar. Por otro, lo lleva al ecosistema Apple on-device: el modelo se divide en cuatro etapas (`a`, `b`, `c`, `d`) por cada bucket de secuencia de 128, 256, 512 y 1024 tokens, y el host en Swift se encarga de la tokenizacion, la seleccion del pool de candidatos y toda la decodificacion. Es relevante ahora porque permite integrar NER, relaciones y clasificacion multietiqueta en aplicaciones iOS/macOS manteniendo los datos en local, con una fidelidad numerica verificada frente al modelo original en PyTorch FP32.

La validacion reportada por el autor sobre un corpus de 54 casos da 54/54 coincidencias exactas con el pipeline upstream, con un error maximo de confianza de 0,0048, y todos los tensores de salida por encima de 60,5 dB de PSNR respecto a FP32. No se trata de un modelo nuevo: los pesos aprendidos son identicos a los del checkpoint original salvo el casteo a FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder mDeBERTa-v3-base con cabezas de fronteras (boundary), clasificador, cabezas de registros y scorers de pares/relaciones; exportado como programa multifuncion Core ML |
| Parametros totales | 287 millones |
| Longitud de contexto | Buckets de secuencia de 128, 256, 512 y 1024 tokens por llamada; el chunking de documentos largos lo gestiona el host |
| Tipos de cuantizacion | FP16 (precision de computo Core ML); otras cuantizaciones del checkpoint original no disponibles en la informacion proporcionada |
| Idiomas soportados | Multilingue e ingles (validacion sobre documentos en 7 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` (programa ML multifuncion Core ML, FP16, 711 MB); tokenizer en `tokenizer.json` y `tokenizer_config.json`; metadatos en `constants.json` y `functions.json` |
| Tokenizador | SentencePiece Unigram, vocabulario de 250k, con tokens especiales de GLiNER2 |
| Capacidad estatica por llamada | T tokens, 32 consultas extractivas, 32 etiquetas de clasificacion en total, 8 tipos de relacion (hasta 512 pares) |
| Modelo base | fastino/gliner2.5-multi-v1 (revision 12fc40399dae672ce840c5e3c50a92340bff3c8c) |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo original GLiNER2.5 es un extractor de fronteras construido sobre mDeBERTa-v3-base (287M parametros), que combina un encoder de lenguaje con varias cabezas especializadas: un clasificador, un encoder de fronteras, proyecciones de pool de candidatos, cabezas de tipo nulo y de conteo, y proyecciones de campos de registro. El port a Core ML preserva los pesos aprendidos sin cambios (salvo el casteo a FP16) y reescribe unicamente la estructura del grafo para hacerla compatible con Core ML: buckets constantes de posicion relativa de DeBERTa, un desplazamiento relativo sin `gather`, SDPA fusionada y caracteristicas de span por suma de prefijos calculadas como productos matriciales de pertenencia a span.

Como la arquitectura de GLiNER2.5 tiene pasos dependientes de los datos entre sus partes neuronales, la exportacion se divide en cuatro etapas que el host ejecuta secuencialmente. La etapa `a` contiene el encoder mDeBERTa, los gathers de palabras y marcadores, el clasificador, el encoder de fronteras, las marginales start/end/inside, las proyecciones de pool, las cabezas nulo y de conteo y la proyeccion de campos de registro. La etapa `b` calcula el scorer de pares sobre el pool compartido (192 spans) y las proyecciones de la cabeza de registros. La etapa `c` aplica un scorer de relaciones disperso (hasta 8 tipos y 512 pares) y la etapa `d` un scorer de spans explicitos usado por atributos de entidad y campos `choices=`. Las entradas enteras son int32 y las de coma flotante FP16.

La informacion proporcionada no detalla el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO para el checkpoint `fastino/gliner2.5-multi-v1`. Lo que si se documenta son las herramientas de exportacion: coremltools 9.0 y Torch 2.11.0, con trazado en FP32 y conversion a precision de computo FP16, compilado con `xcrun coremlcompiler` (Xcode 27.2). Se aplicaron tres correcciones del lado del conversor (casteo con `.item()` de constantes de un elemento, `scaled_size_sqrt` como constante flotante y mapeo de `|` booleano a `logical_or`), ninguna de las cuales altera el calculo.

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot: se especifican los tipos de entidad en el prompt sin reentrenar.
- Clasificacion de texto, tanto de etiqueta unica como multietiqueta (hasta 32 etiquetas por llamada en total).
- Extraccion de relaciones entre entidades (hasta 8 tipos de relacion y 512 pares).
- Extraccion de registros estructurados (structured records) mediante campos y la cabeza de registros.
- Extraccion de atributos de span y campos con `choices=`, gestionados por el scorer de spans explicitos de la etapa `d`.
- Soporte multilingue, con validacion sobre documentos largos en 7 idiomas.
- Procesamiento on-device en iOS 18+/macOS 15+ sin conexion a red.
- Inferencia dividida en cuatro etapas con capacidad estatica de 32 consultas extractivas por llamada.

No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, modo de razonamiento explicito, vision ni audio. Se trata de un modelo de extraccion de informacion, no de un modelo generativo de proposito general.

## Casos de uso

- NER on-device en aplicaciones iOS: la app define los tipos de entidad en el prompt (por ejemplo, persona, organizacion, lugar) y el modelo los extrae localmente, sin enviar texto a un servidor, lo que resulta util para datos personales o sensibles.
- Clasificacion de texto multietiqueta en el dispositivo: etiquetado de notas, correos o tickets con hasta 32 etiquetas por llamada, adecuado para categorizacion rapida dentro de una app sin backend.
- Extraccion de relaciones en documentos: a partir de texto no estructurado, obtener pares entidad-relacion (por ejemplo, empresa-fundador, medicamento-efecto) usando los hasta 8 tipos de relacion y 512 pares que admiten las etapas `b` y `c`.
- Conversion de texto libre a registros estructurados: uso de la cabeza de registros para transformar facturas, formularios o curriculos en campos tipados que alimenten una base de datos local o un modelo Swift.
- Anotacion de atributos ligados a spans: empleo del scorer de spans explicitos (etapa `d`) para asignar propiedades a una mencion concreta, util en anotacion asistida y en control de calidad de datos.
- Procesamiento por lotes de documentos largos en macOS: el host aplica chunking (validado con 11 documentos de 786 a 3755 palabras) para dividir el texto en fragmentos que encajen en los buckets de 1024 tokens y luego consolidar los resultados.
- Preprocesamiento local en pipelines de macOS/iOS: ejecutar extraccion y clasificacion antes de un modelo mayor o de una llamada de red, reduciendo la cantidad de datos enviados y el coste por consulta.
- Aplicaciones con requisitos de privacidad o modo avion: al ser un modelo Core ML validado con `.cpuAndGPU`, funciona sin conexion, lo que encaja en escenarios de campo, sanidad o entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas comparables). La model card unicamente reporta validacion de fidelidad numerica frente al pipeline upstream en PyTorch FP32 sobre iPhone 17 Pro (iOS 27.2, GPU):

| Comprobacion | Core ML (este modelo) | Core AI |
|---|---|---|
| Salidas de etapa frente a FP32 | todas las salidas >= 60,5 dB PSNR | >= 62 dB |
| Determinismo | salidas identicas entre ejecuciones repetidas | identico |
| Corpus de 54 casos, pipeline completo en Swift | 54/54 exactos, error maximo de confianza 0,0048 | 54/54, 53 exactos y 1 elemento de frontera; 0,0026 |
| 11 documentos largos (786–3755 palabras, 7 idiomas) | datos completos no disponibles en el extracto | no disponible |

## Requisitos de hardware

- VRAM/almacenamiento: el paquete Core ML en FP16 ocupa aproximadamente 711 MB; el repositorio completo pesa 0,8 GB.
- Plataformas: iOS 18 o superior y macOS 15 o superior, requisito de los modelos multifuncion de Core ML.
- GPU recomendadas: hardware Apple compatible con Core ML; el autor valido sobre iPhone 17 Pro (GPU). Cualquier dispositivo Apple Silicon o iPhone reciente con iOS 18+ deberia poder ejecutarlo, aunque no se documentan otras configuraciones.
- Cabida en hardware de consumo: si, esta pensado para ejecucion on-device en iPhone y Mac. No requiere GPU dedicada ni servidor.
- Unidades de computo: validado con `.cpuAndGPU`. El autor indica explicitamente que la colocacion en Neural Engine no fue validada.
- Opciones de despliegue: Core ML (`MLModel` con `functionName` por etapa, por ejemplo `a_t128`, `b_t128`, `c_t128`, `d_t128`). Requiere un host en Swift que implemente tokenizacion, layout de prompt, seleccion del pool de candidatos, generacion de pares de relacion y toda la decodificacion; existe una implementacion de referencia en el repositorio companero. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto Core ML.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/formato | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smdesai/GLiNER25-Multi-FP16-CoreML (este) | 287M (mDeBERTa-v3-base) | Buckets 128–1024 tokens, Core ML `.mlmodelc` FP16 | 54/54 exactos frente a FP32; >= 60,5 dB PSNR | Apache 2.0 | HuggingFace |
| smdesai/GLiNER25-Multi-FP16-CoreAI | 287M | Mismos grafos, funciones, entradas y salidas; formato Core AI | >= 62 dB PSNR; 54/54 (53 exactos, 1 frontera) | Apache 2.0 | HuggingFace |
| smdesai/GLiNER25-Multi-Decide-FP16-CoreML | No disponible | Variante Core ML FP16 | No disponible | Apache 2.0 (segun el repositorio) | HuggingFace |
| fastino/gliner2.5-multi-v1 (upstream) | 287M | Checkpoint PyTorch FP32 | Referencia de fidelidad | Apache 2.0 | HuggingFace |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan comparar con otros extractores NER multilingues (por ejemplo, variantes de GLiNER de urchade o modelos de extraccion genericos).

## Limitaciones y advertencias

- No es un modelo generativo: solo extrae entidades, relaciones, clasificaciones, registros y atributos; no mantiene conversaciones ni genera texto libre.
- Capacidad estatica por llamada: 32 consultas extractivas, 32 etiquetas de clasificacion, 8 tipos de relacion y hasta 512 pares. Exceder esos limites requiere dividir la peticion.
- Ventana maxima de 1024 tokens por bucket; los documentos largos deben trocearse en el host y consolidarse despues, con el riesgo de errores en las fronteras de los fragmentos.
- Requiere un host en Swift que replique exactamente la tokenizacion, el layout de prompt, la seleccion del pool de candidatos, la generacion de pares de relacion y la decodificacion del upstream; una implementacion divergente puede degradar los resultados.
- La colocacion en Neural Engine no fue validada; el rendimiento fuera de `.cpuAndGPU` no esta confirmado.
- Los pesos son identicos al checkpoint original salvo el casteo a FP16, por lo que hereda sus posibles sesgos y su riesgo de alucinacion en la extraccion (falsos positivos de entidades o relaciones). No se documentan sesgos especificos en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial; conviene conservar los avisos de atribucion a Fastino y a los autores de GLiNER2, ya que en este port el credito del modelo original recae en ellos.
- La fecha de creacion del repositorio indicada por HuggingFace (2026-10-12) y la validacion con iOS 27.2 / Xcode 27.2 corresponden a un entorno futuro respecto al conocimiento general; conviene verificar versiones reales antes de desplegar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smdesai/GLiNER25-Multi-FP16-CoreML
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- Port companero en Core AI: https://huggingface.co/smdesai/GLiNER25-Multi-FP16-CoreAI
- Variante Decide en Core ML: https://huggingface.co/smdesai/GLiNER25-Multi-Decide-FP16-CoreML
- Repositorio GLiNER2: https://github.com/fastino-ai/GLiNER2
- Repositorio GLiNER (marco general): https://github.com/urchade/GLiNER
- Pagina del modelo GLiNER2.5 en Fastino: https://fastino.ai/models/gliner2-5
- Paper referenciado (arXiv 2507.18546): https://arxiv.org/abs/2507.18546
