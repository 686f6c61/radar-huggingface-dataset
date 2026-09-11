# mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF

## Resumen

El repositorio `mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF` contiene una coleccion de cuantizaciones en formato GGUF del modelo `nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex`, un modelo de lenguaje de 35.505.251.456 parametros totales (35,5 B) construido mediante tecnicas de mezcla (merge/mergekit) y destilacion sobre la familia Qwen. El autor de las cuantizaciones es mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, mientras que el modelo original procede del usuario nightmedia.

El nombre del modelo sigue la nomenclatura `A3B` habitual en arquitecturas de mezcla de expertos (MoE) de la familia Qwen, lo que sugiere en torno a 3.000 millones de parametros activos por token sobre un total de 35,5 B. Esta interpretacion no aparece confirmada de forma explicita en la model card, por lo que debe tomarse como inferencia a partir de la nomenclatura y no como un dato verificado. La model card si documenta que se trata de una variante orientada a razonamiento con cadenas de pensamiento largas (long-cot), ajustada mediante SFT y LoRA, con soporte multilingue para ingles, chino, japones y castellano.

La relevancia de esta ficha es practica: el repositorio esta etiquetado como experimental y cuenta con cero descargas y un solo "like" en el momento de la consulta, ademas de haberse publicado el 11 de septiembre de 2026. Se trata, por tanto, de una variante de nicho sin validacion comunitaria amplia, cuyo interes principal es la disponibilidad de cuantizaciones GGUF que permiten ejecutar un modelo de 35,5 B en hardware de consumo, con tamanos de archivo de 13,3 GB (Q2_K) y 20,5 GB (Q4_K_S).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nombre y etiquetas sugieren transformer con mezcla de expertos; sin confirmar en la model card) |
| Parametros totales | 35.505.251.456 (35,5 B, dato real de safetensors) |
| Parametros activos | aproximadamente 3 B segun la nomenclatura `A3B` del nombre; no confirmado en la documentacion |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 (proyector multimodal) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original. Las etiquetas del repositorio apuntan a un proceso de construccion basado en `merge` y `mergekit` (mezcla de pesos de modelos), combinado con `distillation`, `sft` y `lora`, sobre una base de la familia Qwen etiquetada simultaneamente como `qwen3_5` y `qwen3_6`. La presencia de la etiqueta `long-cot` y de `chain-of-thought` indica un ajuste orientado a generar cadenas de razonamiento extensas antes de la respuesta final. El numero de tokens de entrenamiento, la composicion exacta del dataset y el uso de RLHF o DPO no se documentan en la model card, por lo que se marcan como no disponibles.

Un elemento destacable es la inclusion de ficheros `mmproj` (proyector multimodal) junto a las cuantizaciones de texto. Estos ficheros, de 0,7 GB (Q8_0) y 1,0 GB (f16), son el componente que permite conectar un codificador visual con el modelo de lenguaje en el ecosistema llama.cpp. Su presencia es un indicio fuerte de soporte multimodal, aunque la model card no describe explicitamente capacidades de vision ni la arquitectura del codificador asociado. Las etiquetas `mxfp8`, `mxfp4` y `mlx` apuntan a trabajos derivados para formatos de precision reducida en hardware Apple, ajenos a este repositorio concreto.

## Capacidades

- Generacion de texto conversacional e instruccional, con ajuste declarado sobre SFT y LoRA.
- Razonamiento explicito con cadenas de pensamiento largas (long-cot), segun las etiquetas `reasoning` y `chain-of-thought`.
- Capacidades declaradas en matematicas (`math`), areas STEM (`stem`) y programacion (`coding`).
- Soporte multilingue para ingles, chino, japones y castellano.
- Posible soporte multimodal (vision) por la presencia de ficheros `mmproj`, no confirmado en la documentacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo de razonamiento largo es compatible con este tipo de flujos.
- Capacidad especial de modo "thinking": no disponible como declaracion formal, aunque el etiquetado de razonamiento lo sugiere.

## Casos de uso

- Razonamiento matematico asistido: el modelo esta ajustado con datos de matematicas y modo de pensamiento largo, por lo que puede emplearse para resolver problemas paso a paso y auditar el razonamiento intermedio, util en herramientas educativas o de verificacion de calculos.
- Generacion y revision de codigo: con etiquetas de `coding` y `stem`, encaja en asistentes de programacion que explican el razonamiento antes de proponer el parche, integrables en revisiones de pull requests.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_S (20,5 GB) y Q2_K (13,3 GB) permiten ejecutar un modelo de 35,5 B en equipos con 24 GB o 16 GB de VRAM respectivamente, sin depender de APIs externas.
- Procesamiento de documentacion multilingue: al cubrir ingles, chino, japones y castellano, sirve para traducir, resumir y extraer informacion de conjuntos documentales mixtos en esas cuatro lenguas.
- Prototipado de investigacion sobre mezclas de expertos: al ser un modelo de origen comunitario con etiquetas `merge`, `mergekit` y `experimental`, resulta util como objeto de estudio para analisis de calidad de mezclas y destilaciones.
- Atencion al cliente en idioma castellano o japones: el soporte declarado de ambos idiomas permite construir asistentes conversacionales localizados, siempre que se valide previamente la calidad real en esos idiomas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes de cuantizacion mas dos proyectores multimodales, lo que permite medir el impacto de la precision en tareas concretas sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a paginas de matematicas escolares en polaco, sin relacion con el objeto de esta ficha). El unico dato de rendimiento indirecto es el grafico de perplejidad de ikawrakow enlazado por el autor, que compara tipos de cuantizacion de baja calidad de forma generica y no es especifico de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en funcion del fichero: Q2_K ocupa 13,3 GB, Q4_K_S ocupa 20,5 GB. A estas cifras hay que sumar la cache KV del contexto elegido y el consumo del runtime, por lo que conviene reservar entre 1 y 3 GB adicionales segun la longitud de contexto.
- Si se usa el componente multimodal, hay que anadir 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) al presupuesto de memoria.
- GPU de consumo: la cuantizacion Q4_K_S (20,5 GB) cabe en tarjetas de 24 GB como la RTX 3090 o la RTX 4090; la Q2_K (13,3 GB) puede caber en tarjetas de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB, con margen reducido.
- GPU profesionales: A100 40/80 GB, H100, L40S o RTX A6000 ejecutan con holgura las cuantizaciones altas (Q8_0, Q6_K) y contextos amplios.
- Despliegue: el formato GGUF es compatible con llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python. vLLM y TGI tienen soporte parcial de GGUF y estan mas orientados a safetensors; para servirlos en produccion a traves de esas herramientas conviene partir del modelo base.
- Latencia y throughput: no disponibles. Al tratarse presumiblemente de una arquitectura de mezcla de expertos con unos 3 B de parametros activos, la velocidad de decodificacion deberia ser notablemente superior a la de un modelo denso de 35,5 B con la misma cuantizacion, pero este extremo no esta verificado con mediciones publicadas.
- Almacenamiento: el repositorio completo ocupa 153,4 GB, aunque basta con descargar el fichero de cuantizacion deseado.

## Comparativa con modelos similares

La comparativa se establece frente a modelos de la misma familia y rango de tamano, tomando los datos publicos de sus fichas oficiales como referencia aproximada. Los valores del modelo de esta ficha no estan verificados en la documentacion y se marcan como tales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Brainwaves-Nex (este) | 35,5 B | aproximadamente 3 B (sin confirmar) | no disponible | apache-2.0 | GGUF en este repositorio; 0 descargas |
| Qwen3-30B-A3B | 30,5 B (referencia publica) | 3,3 B (referencia publica) | 128 K (referencia publica) | apache-2.0 | safetensors y multiples GGUF; ampliamente desplegado |
| Qwen2.5-32B | 32,5 B (referencia publica) | denso | 128 K (referencia publica) | apache-2.0 (salvo variantes) | safetensors y GGUF |
| Mixtral 8x7B | 46,7 B (referencia publica) | 12,9 B (referencia publica) | 32 K (referencia publica) | apache-2.0 | safetensors y GGUF |

Nota: los datos de las filas comparativas provienen de las fichas publicas de dichos modelos y se incluyen como orientacion; no se han verificado contra el modelo objeto de esta ficha, cuya model card no aporta cifras equivalentes. No se dispone de comparativas de rendimiento (benchmarks) entre estos modelos y el modelo analizado.

## Limitaciones y advertencias

- Modelo marcado explicitamente como `experimental`: no ha pasado una validacion comunitaria amplia (0 descargas y 1 like en el momento de la consulta) y su comportamiento real no esta documentado con evaluaciones.
- Procedencia parcialmente opaca: es una mezcla y destilacion de origen comunitario, sin publicacion de dataset, numero de tokens de entrenamiento ni detalles del pipeline de RLHF o DPO.
- La interpretacion de 3 B de parametros activos procede unicamente de la nomenclatura del nombre y no esta confirmada; si la arquitectura no fuese de mezcla de expertos, los requisitos de memoria y velocidad serian muy distintos.
- Riesgo de alucinacion: no cuantificado por el autor. Los modelos con modo de razonamiento largo pueden producir cadenas de pensamiento plausibles pero incorrectas, especialmente en matematicas y codigo.
- Sesgos conocidos: no documentados. Al derivar de la familia Qwen con datos mayoritariamente en ingles y chino, es previsible un sesgo de representacion en otros idiomas y culturas, incluido el castellano.
- Cobertura idiomatica declarada de cuatro lenguas (en, zh, ja, es); no consta validacion de calidad por idioma.
- Longitud de contexto no especificada: no es posible garantizar el comportamiento en conversaciones o documentos largos sin probarlo.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la licencia se hereda del modelo base y de los modelos mezclados; conviene verificar la procedencia de todos los componentes antes de un despliegue comercial.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan de forma notable la calidad, especialmente en tareas de razonamiento y codigo; la model card no incluye perplejidad medida para este modelo concreto.
- Los ficheros `mmproj` sugieren soporte multimodal, pero no se documenta el codificador visual asociado ni su calidad; no debe asumirse vision fiable en produccion.
- El autor indica que las cuantizaciones ponderadas con imatrix no estan disponibles y que podrian no llegar a publicarse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Sitio del patrocinador (nethype GmbH): https://www.nethype.de/
