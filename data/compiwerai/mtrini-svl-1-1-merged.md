# CompiwerAI/Mtrini-SVL-1.1-Merged

## Resumen

Mtrini-SVL-1.1 es un modelo de lenguaje y vision de aproximadamente 8,77 mil millones de parametros desarrollado por Compiwer AI (Sale, Marruecos) a partir de Qwen/Qwen3-VL-8B-Instruct. Se distribuye como un modelo fusionado (merged) tras un ajuste fino con LoRA/PEFT, con pesos en BF16 y 8.767.123.696 parametros reales, segun los safetensors publicados. La propuesta del autor se articula en torno al concepto Self-Verifying Loop (SVL), una direccion de investigacion orientada a que el modelo verifique y refine sus propias respuestas antes de darlas por validas.

El entrenamiento se centro en cuatro areas declaradas: razonamiento, codigo, matematicas y darija marroqui (ary), con un dataset final de 58.574 ejemplos que combina 2.170 ejemplos de QA y razonamiento en darija, 30.000 de OpenCodeReasoning-2 y 30.000 de OpenMathInstruct-2. El ajuste se ejecuto durante 1 epoca y 3.661 pasos, con una perdida final de 0,5855 y una precision media de token del 83,55%, metricas que el propio autor aclara que no equivalen a resultados de benchmarks estandarizados.

Su relevancia actual es doble: por un lado, cubre un hueco poco atendido como es el soporte de darija en un modelo abierto con capacidades de razonamiento y vision; por otro, sirve como ejemplo de ajuste fino de bajo coste (LoRA sobre un modelo de 8B) realizado fuera de los grandes laboratorios. La licencia Apache 2.0 y el formato transformers/safetensors facilitan su integracion y su reutilizacion comercial, aunque el modelo es explicitamente experimental y no publica evaluaciones comparativas frente a su base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, vision-lenguaje); se instancia con Qwen3VLForConditionalGeneration |
| Parametros totales | 8.767.123.696 (~8,77 B, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el contexto declarado durante el entrenamiento fue de 4096 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; los pesos se distribuyen en BF16. Al ser safetensors, admite cuantizacion posterior (GPTQ, AWQ, bitsandbytes, GGUF) por parte del usuario |
| Idiomas soportados | Ingles (en), arabe (ar), frances (fr) y arabe marroqui o darija (ary) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers); repo de 17,5 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Metodo de entrenamiento | LoRA / PEFT, posteriormente fusionado |
| Precision declarada | BF16 |
| Tamano del dataset | 58.574 ejemplos unicos declarados |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-VL, un transformer multimodal de tipo vision-lenguaje que procesa imagenes y texto y genera texto; el modelo se carga con la clase `Qwen3VLForConditionalGeneration` de la libreria transformers. No se modifica la arquitectura base: el trabajo de Compiwer AI consiste en un ajuste fino supervisado mediante LoRA/PEFT sobre los pesos de Qwen3-VL-8B-Instruct, seguido de una fusion de los adaptadores en un checkpoint unico en BF16. No se documentan innovaciones en atencion, decodificacion especulativa ni mecanismos alternativos al transformer estandar.

El dataset final declarado contiene 58.574 ejemplos unicos: 2.170 de QA y razonamiento en darija marroqui, 30.000 de OpenCodeReasoning-2 y 30.000 de OpenMathInstruct-2. Conviene senalar una inconsistencia en la propia model card: los tres subconjuntos listados suman 52.170 ejemplos, no 58.574, por lo que la composicion exacta del resto no queda documentada. El entrenamiento consta de 1 epoca y 3.661 pasos con un contexto de 4096 tokens, y alcanza una perdida de 0,5855 y una precision media de token de 83,55%. No se menciona RLHF, DPO ni ninguna fase de alineacion adicional; el concepto Self-Verifying Loop (THINK, CHECK, IMPROVE, REPEAT) se describe como una direccion de investigacion en curso y no como un mecanismo verificado con evaluaciones publicadas.

## Capacidades

- Generacion de texto conversacional y multimodal (entrada de imagen y texto, salida de texto), heredada del modelo base Qwen3-VL.
- Razonamiento explicito y resuelto en varios pasos, area en la que se concentro el ajuste.
- Generacion de codigo, tras el entrenamiento con 30.000 ejemplos de OpenCodeReasoning-2.
- Resolucion de problemas matematicos, tras el entrenamiento con 30.000 ejemplos de OpenMathInstruct-2.
- Comprension y generacion en darija marroqui (ary), con un subconjunto especifico de 2.170 ejemplos de QA y razonamiento.
- Capacidades multilingues en ingles, arabe estandar y frances.
- Enfoque de autoverificacion (Self-Verifying Loop) como patron de prompting o refinamiento iterativo, descrito por el autor como linea de investigacion abierta.
- Soporte de tool calling o function calling: no documentado en la informacion proporcionada. El modelo base del que deriva suele incluir esta capacidad, pero no hay confirmacion por parte del autor para este checkpoint.
- Capacidades de agente y razonamiento multi-paso de larga duracion: no documentadas ni evaluadas en la informacion proporcionada.
- Modo thinking explicito: no documentado.

## Casos de uso

- Atencion al cliente en darija: el modelo permite construir asistentes conversacionales que respondan en arabe marroqui, un idioma con escasa cobertura en modelos abiertos, con la posibilidad de alternar a arabe estandar o frances en la misma conversacion.
- Digitalizacion y comprension de documentos con componentes visuales: al derivar de Qwen3-VL, puede procesar capturas, formularios escaneados o diagramas y devolver texto estructurado o respuestas sobre el contenido, util para back-office administrativo.
- Apoyo educativo en matematicas: el ajuste con OpenMathInstruct-2 y el enfoque de autoverificacion lo hacen adecuado para tutoria paso a paso, siempre con revision humana del resultado final dado el riesgo de error aritmetico.
- Asistencia a la programacion en entornos de desarrollo: puede emplearse para generar fragmentos de codigo o explicar errores a partir de capturas de trazas y pantallas, integrado como asistente local en el IDE.
- Traduccion y normalizacion entre darija, arabe estandar y frances: util en servicios publicos, medios de comunicacion o plataformas de contenido que necesiten normalizar texto escrito en dialecto.
- Analisis de imagenes para soporte tecnico: interpretacion de capturas de pantalla o fotografias de producto enviadas por usuarios para generar una primera diagnosis o una respuesta guiada.
- Base para ajuste fino adicional en dominios locales: al ser un checkpoint fusionado en safetensors y con licencia Apache 2.0, sirve como punto de partida para LoRA especificos (legal, sanitario, administracion publica marroqui) sin partir del modelo original.
- Generacion de material bilingue arabe-frances: redaccion de resumenes, comunicados o fichas de producto en ambos idiomas a partir de una sola fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las unicas metricas facilitadas por el autor corresponden a la propia ejecucion de entrenamiento y no deben interpretarse como evaluaciones estandarizadas:

| Metrica de entrenamiento | Valor |
|---|---|
| Pasos | 3.661 |
| Epocas | 1 |
| Perdida de entrenamiento | 0,5855 |
| Precision media de token | 83,55% |
| Ejemplos unicos en el dataset | 58.574 declarados (los subconjuntos listados suman 52.170) |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion que permita comparar el modelo con su base o con alternativas.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 17,5 GB (tamano del repo), por lo que se necesitan del orden de 20 GB de VRAM como minimo para inferencia con overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5-6 GB, aunque requeriria convertir los pesos, ya que no hay cuantizaciones oficiales publicadas.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S 48 GB, A6000 48 GB.
- GPU de consumo: cabe en RTX 4090 / RTX 3090 (24 GB) en BF16, con poco margen; en RTX 4080/4070 Ti (16 GB) o RTX 3060 (12 GB) solo tras cuantizacion.
- El procesamiento de imagenes incrementa el consumo de memoria y de computo respecto a una entrada puramente textual, ya que los tokens visuales ocupan parte de la ventana de contexto y de la cache KV.
- Opciones de despliegue: transformers (via `Qwen3VLForConditionalGeneration`, el metodo documentado por el autor), vLLM, TGI y, previa conversion a GGUF, llama.cpp u Ollama. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mtrini-SVL-1.1 | ~8,77 B | No disponible (entrenamiento a 4096 tokens) | en, ar, fr, ary | Apache 2.0 | Hugging Face, safetensors |
| Qwen3-VL-8B-Instruct (modelo base) | ~8 B | No disponible en la informacion proporcionada | Multilingue amplio | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct | ~7 B | No disponible en la informacion proporcionada | Multilingue amplio | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | ~8 B | No disponible en la informacion proporcionada | Multilingue (sin darija especifica) | Licencia comunitaria Llama | Hugging Face |

La comparativa se limita a parametros, licencia y disponibilidad: no hay resultados de benchmarks publicados para Mtrini-SVL-1.1 que permitan contrastar calidad frente a estos modelos. El diferencial principal del modelo es la cobertura explicita de darija y su ajuste en razonamiento, codigo y matematicas, no un rendimiento superior demostrado.

## Limitaciones y advertencias

- El propio autor califica el modelo como experimental y advierte de que puede alucinar, generar codigo incorrecto, malinterpretar instrucciones o producir respuestas matematicas erroneas.
- No se publican evaluaciones comparativas frente a Qwen3-VL-8B-Instruct, por lo que no puede descartarse una regresion en capacidades generales tras el ajuste (1 sola epoca sobre 52.170-58.574 ejemplos, segun la fuente).
- Existe una inconsistencia en la model card: los subconjuntos del dataset suman 52.170 ejemplos mientras que el total declarado es de 58.574.
- El contexto de entrenamiento declarado es de 4096 tokens, muy inferior al que suelen soportar los modelos Qwen3-VL; el comportamiento mas alla de esa longitud no esta documentado ni validado.
- La cobertura de darija se apoya en solo 2.170 ejemplos, un volumen reducido que limita la robustez en registros, dialectos regionales y ortografias no normalizadas del arabe marroqui.
- Riesgo de sesgos y de infrarrepresentacion en el resto de idiomas, al haber concentrado el ajuste en ingles tecnicos (codigo y matematicas), arabe y frances.
- No hay cuantizaciones oficiales ni versiones GGUF publicadas, lo que obliga al usuario a generarlas por su cuenta para despliegues en hardware limitado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct mantiene sus propias condiciones, que conviene revisar antes de un despliegue productivo.
- El repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.
- El concepto Self-Verifying Loop se presenta como linea de investigacion en curso, sin evidencia publicada de mejora medible.
- Para cualquier uso en produccion se recomienda validacion humana de las salidas, especialmente en codigo y matematicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.1-Merged
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos no guardaban relacion con Mtrini-SVL-1.1 y se han descartado.
