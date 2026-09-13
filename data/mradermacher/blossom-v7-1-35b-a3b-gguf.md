# mradermacher/Blossom-V7.1-35B-A3B-GGUF

## Resumen

Blossom-V7.1-35B-A3B-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher a partir del modelo Azure99/Blossom-V7.1-35B-A3B. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión de pesos orientada a su ejecución con llama.cpp y el ecosistema de herramientas compatible con GGUF (Ollama, LM Studio, llama-cpp-python, text-generation-webui). La model card se limita a indicar que son "static quants" del modelo original, es decir, cuantizaciones calculadas directamente sobre los pesos sin matriz de importancia (imatrix).

El modelo de partida declara 35.505.251.456 parámetros (unos 35,5B) en formato safetensors. La nomenclatura "35B-A3B" sigue la convención habitual para arquitecturas de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, aunque la información disponible no confirma la arquitectura ni el número exacto de parámetros activos. Los metadatos de HuggingFace no incluyen licencia, idiomas soportados ni pipeline, y la información recuperada en la búsqueda web no aporta datos técnicos sobre el modelo.

La utilidad de este repositorio es eminentemente práctica: ofrece trece niveles de cuantización, desde Q2_K hasta F16, lo que permite ajustar el consumo de memoria desde aproximadamente 15 GB hasta unos 71 GB y desplegar un MoE de ~35B en hardware de consumo o en GPUs de centro de datos. En el momento de la consulta el repositorio acumula 0 descargas y 0 "likes", y fue creado y actualizado el mismo día (13 de septiembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; la nomenclatura «35B-A3B» corresponde a un transformer con mezcla de expertos (MoE) |
| Parametros totales | 35.505.251.456 (≈35,5B), dato de safetensors del modelo original |
| Parametros activos | ≈3B (inferido del sufijo «A3B» del nombre; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y F16 (listada como «x-f16»); todas estaticas, sin variantes imatrix |
| Idiomas soportados | no disponible |
| Licencia | no disponible (debe consultarse la del modelo base) |
| Formato de pesos | GGUF en este repositorio; el modelo original se distribuye en safetensors |
| Modelo base | Azure99/Blossom-V7.1-35B-A3B |
| Autor de la cuantizacion | mradermacher |
| Fecha de creacion / actualizacion | 13 de septiembre de 2026 (ambas) |
| Tamano del repositorio | 21,9 GB segun metadatos (cifra incoherente con la suma de todos los quants anunciados, que incluirian F16 y Q8_0) |
| Descargas / likes | 0 / 0 |
| Etiquetas declaradas | gguf, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo. El nombre «35B-A3B» y la etiqueta conversational son los unicos indicios: el primero sugiere un transformer con mezcla de expertos (MoE) de aproximadamente 35.500 millones de parametros totales y unos 3.000 millones activos por token, patron habitual en modelos que buscan reducir el coste de inferencia manteniendo la capacidad de un modelo grande; el segundo indica que el ajuste del modelo base esta orientado a dialogo. No hay datos sobre numero de capas, numero de expertos, expertos activados por token, atencion utilizada (completa, lineal o hibrida) ni sobre el tokenizador.

Tampoco se dispone de informacion sobre el entrenamiento: no se conocen el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. Los encabezados de la model card aportan unicamente detalles del proceso de conversion: `convert_type: hf` (los pesos de partida estan en formato HuggingFace), `quantize_version: 2` (esquema de cuantizacion de llama.cpp en su segunda version) y `output_tensor_quantised: 1` (la capa de salida tambien se cuantiza). Al tratarse de cuantizaciones estaticas, no se ha empleado una matriz de importancia calculada sobre un corpus de calibracion.

## Capacidades

- Generacion de texto conversacional: la unica capacidad respaldada por la informacion disponible es la etiqueta `conversational` y el uso previsto como modelo de dialogo; el modelo base pertenece a la serie Blossom de Azure99.
- Razonamiento, codigo, matematicas: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los metadatos no declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad de despliegue: el tag `endpoints_compatible` indica que el repositorio esta preparado para su uso en Hugging Face Inference Endpoints; el formato GGUF habilita su carga en llama.cpp y derivados.

## Casos de uso

- Asistente conversacional autoalojado en GPU de consumo: con las cuantizaciones Q3_K_M o Q4_K_S el modelo ocupa entre 17 y 21 GB, de modo que puede ejecutarse en una RTX 4090 o RTX 3090 (24 GB) con contexto moderado, sin depender de APIs externas.
- Atencion al cliente multi-turno: el ajuste conversacional del modelo base y el bajo coste relativo de un MoE con ~3B activos lo hacen adecuado para bots de dialogo continuado donde el coste por token generado es el factor limitante. La longitud de contexto real debe verificarse antes de dimensionar el sistema.
- Despliegue en entornos aislados o con requisitos de soberania del dato: al ser pesos GGUF ejecutables en local con llama.cpp u Ollama, no requiere conexion a servicios de terceros, lo que encaja en entornos sanitarios, legales o industriales con restricciones de salida de datos.
- Evaluacion comparativa de niveles de cuantizacion en un MoE: el repositorio ofrece trece niveles desde Q2_K hasta F16, lo que permite medir la perdida de calidad por nivel en una arquitectura MoE, donde las capas de enrutamiento y los expertos compartidos suelen ser mas sensibles a la cuantizacion agresiva que en un modelo denso.
- Prototipado rapido de aplicaciones conversacionales: la variedad de tamanos permite empezar con Q2_K (≈15 GB) en una estacion de trabajo modesta y subir de nivel a medida que se disponga de mas VRAM.
- Investigacion academica con presupuesto de computo limitado: permite estudiar el comportamiento de un MoE de ~35B en una unica GPU de 24 GB, algo inviable con los pesos en F16 (≈71 GB).
- Seleccion de artefacto para pipelines de despliegue: un equipo de plataforma puede fijar un nivel (por ejemplo Q4_K_M, ≈21 GB) y validar memoria, latencia y calidad antes de decidir si merece la pena desplegar el modelo completo en servidores con vLLM y los safetensors originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de evaluacion (MMLU, GSM8K, HumanEval ni equivalentes), y la busqueda web no devolvio resultados relacionados con el modelo. Tampoco se dispone de mediciones de perplejidad que cuantifiquen la degradacion de cada nivel de cuantizacion.

## Requisitos de hardware

- VRAM/RAM estimada por cuantizacion (calculo aproximado a partir de los 35,5B de parametros y de los bits por peso tipicos de cada nivel; no son cifras publicadas por el autor):

| Cuantizacion | Tamano estimado del fichero | VRAM/RAM minima practica |
|---|---|---|
| Q2_K | ≈14,9 GB | 16 GB |
| Q3_K_S | ≈15,5 GB | 16-18 GB |
| Q3_K_M | ≈17,3 GB | 20-24 GB |
| IQ4_XS | ≈18,9 GB | 24 GB |
| Q3_K_L | ≈19,1 GB | 24 GB |
| Q4_K_S | ≈20,4 GB | 24 GB |
| Q4_K_M | ≈21,5 GB | 24 GB (contexto corto) |
| Q5_K_S | ≈24,4 GB | 32 GB |
| Q5_K_M | ≈25,3 GB | 32 GB |
| Q6_K | ≈29,3 GB | 40 GB |
| Q8_0 | ≈37,7 GB | 48-80 GB |
| F16 / x-f16 | ≈71 GB | 80 GB |

- A esas cifras hay que sumar la cache KV y el overhead del runtime; el tamano de la cache depende del numero de capas y cabezas de atencion, dato no disponible.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q3_K_M, Q4_K_S y Q4_K_M; A100 40 GB o L40S para Q5 y Q6_K; A100 80 GB o H100 para Q8_0 y F16. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000) solo entran con holgura Q2_K y, con contexto muy corto, Q3_K_S.
- Si cabe en GPU de consumo: si, los niveles Q2_K a Q4_K_M en GPUs de 16 a 24 GB. Conviene tener en cuenta que en un MoE todos los expertos deben estar residentes en memoria; el offload parcial a RAM es posible en llama.cpp, pero penaliza fuertemente el throughput.
- Memoria unificada: un Mac Studio con 64 GB o 96 GB (M2/M3 Ultra) puede ejecutar Q5_K_M, Q6_K e incluso Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores derivados de llama.cpp. Para vLLM o TGI es preferible usar los safetensors originales de Azure99/Blossom-V7.1-35B-A3B, ya que el soporte de GGUF en esas pilas es limitado o inexistente.
- Latencia y throughput: no disponible. Como referencia cualitativa, un MoE con ~3B parametros activos genera tokens a un ritmo mas cercano al de un modelo denso de 3B que al de uno de 35B, siempre que el conjunto de expertos resida en VRAM.

## Comparativa con modelos similares

La informacion disponible no permite comparar rendimiento, ya que no hay benchmarks del modelo. La comparacion se limita a la categoria (MoE de tamano medio con pocos parametros activos). Los datos de los modelos alternativos proceden del conocimiento general del ecosistema y no se han verificado en la busqueda realizada.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blossom-V7.1-35B-A3B (GGUF de mradermacher) | ≈35,5B | ≈3B (inferido) | no disponible | no disponible | GGUF en este repositorio; safetensors en el repositorio base |
| Qwen3-30B-A3B | ≈30,5B | ≈3,3B | 32.768 tokens nativos | Apache 2.0 | safetensors y multiples GGUF de la comunidad |
| Mixtral 8x7B | ≈46,7B | ≈12,9B | 32.768 tokens | Apache 2.0 | safetensors y GGUF |

Frente a Qwen3-30B-A3B, el modelo de este repositorio tiene un tamano total algo mayor y un numero de parametros activos del mismo orden, pero se desconoce su contexto nativo, su licencia y su rendimiento. Frente a Mixtral 8x7B, el coste de inferencia es previsiblemente mucho menor al activar aproximadamente una cuarta parte de los parametros por token, a cambio de un tamano total inferior.

## Limitaciones y advertencias

- La model card no documenta licencia. Al ser una cuantizacion derivada, la licencia aplicable es la del modelo Azure99/Blossom-V7.1-35B-A3B, que no se ha podido verificar; antes de cualquier uso comercial debe comprobarse en el repositorio original.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni idiomas. No puede asumirse un comportamiento multilingue ni un rendimiento concreto en castellano.
- Riesgo de alucinacion: no evaluado. No existen benchmarks ni evaluaciones de fidelidad publicadas para esta version.
- La cuantizacion introduce degradacion adicional. En arquitecturas MoE, los niveles Q2_K y Q3_K pueden afectar de forma desproporcionada a las capas de enrutamiento y a los expertos compartidos; se recomienda validar la calidad con un conjunto de prueba propio antes de usar Q2_K o Q3_K_S en produccion.
- Las cuantizaciones son estaticas (sin imatrix), por lo que en los niveles bajos es probable que existan variantes dinamicas de otros autores con menor perdida de calidad.
- Incoherencia en los metadatos: el repositorio declara 21,9 GB de tamano, cifra incompatible con la suma de todos los quants anunciados (F16 ≈71 GB y Q8_0 ≈38 GB). Conviene verificar los ficheros realmente disponibles antes de planificar el despliegue.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentacion de la comunidad sobre su funcionamiento.
- Longitud de contexto desconocida: no es posible garantizar conversaciones largas ni tareas de recuperacion sobre documentos extensos sin comprobacion previa.
- No hay confirmacion de soporte de tool calling ni de capacidades de agente; no deben disenarse pipelines que dependan de ellas sin verificarlo.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Blossom-V7.1-35B-A3B-GGUF
- Modelo base (pesos originales): https://huggingface.co/Azure99/Blossom-V7.1-35B-A3B
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los enlaces recuperados corresponden a un concesionario de automoviles y no guardan relacion con el contenido de esta ficha. No se han encontrado papers, blogs ni demos adicionales.
