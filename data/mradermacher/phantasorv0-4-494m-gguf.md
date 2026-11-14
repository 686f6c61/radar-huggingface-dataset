# mradermacher/PhantasorV0.4-494M-GGUF

## Resumen
PhantasorV0.4-494M-GGUF es una coleccion de cuantizaciones GGUF del modelo XeTute/PhantasorV0.4-494M, un modelo de lenguaje de tipo transformer con aproximadamente 494 millones de parametros, publicado por el autor XeTute y empaquetado por mradermacher. El modelo base esta orientado a tareas de investigacion, con etiquetas que lo clasifican como "tiny" y "small", y esta entrenado sobre un conjunto de datasets que mezclan datos en ingles y chino, incluyendo corpus de instrucciones (alpaca, alpaca_zh) y datasets especificos del autor (Pakistan-China-Alpaca, Tiny-Eastern-Alpaca, Islam, BigMathematics-Reasoning, Pakistani-Developer).

La relevancia de esta ficha radica en que ofrece un modelo muy compacto (menos de 0,5 mil millones de parametros) con licencia Apache 2.0, lo que permite ejecutarlo en hardware de consumo con huellas de memoria muy reducidas (entre 0,4 y 1,1 GB segun la cuantizacion). Es un candidato util para experimentacion rapida, despliegue en entornos con recursos limitados y prototipado de pipelines de generacion de texto multilingue (ingles y chino) sin requisitos de GPU de gama alta.

El repositorio GGUF incluye 12 variantes de cuantizacion que van desde Q2_K hasta f16, con tamanos de 0,4 a 1,1 GB. No se dispone de informacion publica sobre arquitectura detallada, longitud de contexto ni resultados de benchmarks en la documentacion proporcionada, por lo que varios campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | transformer (detalle no disponible) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento
La informacion disponible indica que el modelo base es un transformer con 494.032.768 parametros. No se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea variantes como attention lineal o decodificacion especulativa. El modelo esta etiquetado como "tiny" y "small" dentro de la categoria de modelos de investigacion.

El entrenamiento se realizo sobre una mezcla de datasets declarada en la model card: XeTute/Pakistan-China-Alpaca, XeTute/Tiny-Eastern-Alpaca, XeTute/Islam, XeTute/BigMathematics-Reasoning, XeTute/Pakistani-Developer, tatsu-lab/alpaca y llamafactory/alpaca_zh. No se dispone de datos sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado mas alla del formato de instrucciones. El repositorio GGUF es una conversion estatica del modelo base realizada por mradermacher; no se han publicado cuantizaciones con imatrix o ponderadas por el momento.

## Capacidades
- Generacion de texto conversacional en ingles y chino, orientada a tareas de instruccion.
- Razonamiento matematico basico, derivado de la inclusion del dataset BigMathematics-Reasoning en el entrenamiento.
- Generacion de codigo y asistencia al desarrollador, gracias al dataset Pakistani-Developer.
- Soporte multilingue limitado a ingles y chino (segun la model card).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No se dispone de informacion sobre modos especiales como thinking mode, vision o audio.
- El modelo esta etiquetado como "endpoints_compatible" y "conversational", lo que sugiere compatibilidad con APIs de inferencia tipo chat.

## Casos de uso
- Prototipado rapido de asistentes conversacionales: al ocupar menos de 1 GB en cuantizacion Q4_K_M, permite levantar un endpoint de chat en una maquina de desarrollo sin GPU dedicada, usando llama.cpp u Ollama para iterar sobre prompts y flujos de conversacion.
- Generacion de texto multilingue en ingles y chino: adecuado para aplicaciones que necesiten respuestas bilingues de bajo coste, como traduccion asistida o generacion de contenido en ambos idiomas, con la limitacion de que no se ha verificado la calidad en benchmarks.
- Experimentacion academica con modelos tiny: investigadores pueden usar el modelo como linea base para estudiar el efecto de la cuantizacion en modelos de menos de 500M de parametros, comparando las 12 variantes GGUF disponibles.
- Asistencia matematica basica en entornos educativos: el dataset BigMathematics-Reasoning sugiere capacidad para resolver problemas aritmeticos sencillos, util en tutores automatizados de bajo coste que no requieran precision de modelos grandes.
- Despliegue en dispositivos de borde o entornos con RAM limitada: con cuantizaciones Q2_K o Q3_K_S de 0,4 GB, el modelo puede ejecutarse en Raspberry Pi o contenedores con menos de 1 GB de memoria, para tareas de clasificacion o generacion corta.
- Generacion de codigo asistida en pipelines de CI/CD: el dataset Pakistani-Developer indica entrenamiento con codigo; puede usarse para autocompletar fragmentos o generar documentacion tecnica en ingles, siempre con revision humana dado el tamano reducido del modelo.
- Base para fine-tuning ligero: al ser Apache 2.0 y tener solo 494M de parametros, es viable ajustarlo con LoRA en una unica GPU de consumo (por ejemplo, RTX 3060) para dominios especificos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,4 GB con Q2_K/Q3_K_S, 0,5 GB con Q4_K_M/IQ4_XS, 0,6 GB con Q6_K/Q8_0, y 1,1 GB con f16. Estas cifras corresponden al tamano de los ficheros GGUF y deben sumarse a la memoria para el contexto KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050). Para f16 se recomienda al menos 2 GB libres. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, incluidas las integradas con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles. Dado el tamano, se espera throughput alto en CPU y GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PhantasorV0.4-494M-GGUF | 494M | no disponible | Apache 2.0 | GGUF, safetensors | Hugging Face |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Qwen2-0.5B | 0.5B | 32768 | Apache 2.0 | safetensors, GGUF | Hugging Face |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a parametros, licencia y disponibilidad, ya que no se dispone de resultados de benchmarks del modelo Phantasor para comparar rendimiento. Qwen2-0.5B ofrece una longitud de contexto mucho mayor (32.768 tokens) y TinyLlama-1.1B duplica los parametros; ambos tienen ecosistemas mas consolidados y cuantizaciones imatrix disponibles.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados. Los datasets de entrenamiento incluyen corpus especificos de tematica religiosa (Islam) y regional (Pakistan-China), lo que puede introducir sesgos tematicos y culturales no evaluados.
- Riesgo de alucinacion: alto, dado el tamano reducido del modelo (494M parametros) y la ausencia de benchmarks que validen su fidelidad factual.
- Limitaciones de contexto e idioma: solo se declaran ingles y chino; no hay informacion sobre la longitud de contexto efectiva, que en modelos tiny suele ser limitada (probablemente 2048 tokens o menos, no confirmado).
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo base no incluye garantias; conviene revisar los terminos de los datasets de entrenamiento (XeTute/*) por posibles restricciones adicionales.
- Caveats para produccion: no se han publicado cuantizaciones imatrix o ponderadas, lo que puede reducir la calidad frente a alternativas; el modelo tiene solo 102 descargas y 1 like, lo que indica escasa validacion por parte de la comunidad; no hay informacion sobre estabilidad en conversaciones multi-turno largas.
- El pipeline de Hugging Face no esta especificado, lo que puede complicar la integracion automatica con librerias que dependen de ese metadato.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/PhantasorV0.4-494M-GGUF
- Modelo base: https://huggingface.co/XeTute/PhantasorV0.4-494M
- Pagina de overview del autor: https://hf.tst.eu/model#PhantasorV0.4-494M-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
