# jkim96/gemma-4-12b-it-DASHQ-Q2-GGUF

## Resumen

Este repositorio contiene una cuantizacion de 2 bits del modelo de instrucciones google/gemma-4-12B-it, generada con el metodo DASH-Q y publicada por el usuario jkim96. No se trata de un modelo entrenado desde cero, sino de una conversion a formato GGUF para su uso con llama.cpp y derivados, pensada para ejecutar un modelo de 11,9 mil millones de parametros en hardware muy limitado. Se ofrecen tres variantes de peso (IQ2_XXS, IQ2_M y Q2_K_XL) con tamanos de archivo de 3,65 GB, 4,35 GB y 4,67 GB respectivamente.

La relevancia de esta ficha esta en la propuesta de cuantizacion: DASH-Q afirma reducir de forma sustancial la divergencia KL respecto al modelo sin cuantizar en comparacion con las cuantizaciones estandar de llama.cpp y con las de unsloth. Segun los datos aportados por el autor, la variante IQ2_M alcanza una KLD media de 1,90 frente a 4,81 de llama.cpp IQ2_M y 4,56 de unsloth UD-IQ2_M, con una tasa de coincidencia en el token top-1 del 47,8 %.

El modelo es solo texto: el torre de vision del modelo base no se incluye en estos GGUF. La informacion disponible no detalla la arquitectura interna, el contexto maximo ni los idiomas soportados del modelo base, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma (no se detalla mas en la informacion disponible) |
| Parametros totales | 11.907.350.576 (11,9 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso fija `-c 8192`, pero no se declara contexto maximo) |
| Tipos de cuantizacion | IQ2_XXS (2,45 bits/peso), IQ2_M (2,93 bits/peso), Q2_K_XL (3,14 bits/peso); todos con tensores de maximo 4 bits |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 en los metadatos de HuggingFace; la model card indica que hereda la licencia del modelo base google/gemma-4-12B-it (ver limitaciones) |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | google/gemma-4-12B-it |
| Metodo de cuantizacion | DASH-Q (con imatrix) |
| Tamano del repositorio | 12,7 GB (los tres archivos GGUF juntos) |
| Modalidad | Solo texto (sin torre de vision) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es una cuantizacion post-entrenamiento del modelo base google/gemma-4-12B-it. La informacion proporcionada no detalla la arquitectura interna del modelo base (numero de capas, cabezas de atencion, tipo de atencion, uso de MoE o mecanismos híbridos), por lo que no es posible describirla con rigor. Se sabe que es un modelo de instrucciones orientado a conversacion y razonamiento, y que su torre de vision no se incluye en estos archivos GGUF, que son exclusivamente de texto.

La innovacion tecnica destacable esta en el metodo de cuantizacion DASH-Q, aplicado sobre el modelo base y complementado con imatrix. El autor no describe en la model card el algoritmo interno del metodo, solo sus resultados. La cuantizacion se realizo a tipos de tensor estandar de llama.cpp, sin emplear tipos propietarios y sin superar los 4 bits por tensor, de modo que los archivos cargan en cualquier build reciente de llama.cpp. No se aportan datos sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo instrucciones, al ser una cuantizacion de un modelo `-it`.
- Razonamiento y respuestas multi-turno, segun la orientacion del modelo base.
- Capacidad de razonamiento declarada de forma indirecta: el autor senala que la perplejidad sobre texto crudo no es una metrica util para este modelo de instrucciones/razonamiento.
- Inferencia local en llama.cpp y cualquier frontend compatible con GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Vision: no soportada en estos archivos (la torre de vision no se incluye).
- Audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local en equipos de bajos recursos: con archivos de 3,65 a 4,67 GB, el modelo cabe en portatiles con GPU integradas o GPUs de gama media-baja con poca VRAM, permitiendo generar texto sin conexion.
- Despliegue en el borde o en dispositivos sin GPU dedicada: la variante IQ2_XXS permite ejecucion parcial o total en CPU, util para entornos industriales aislados o sin acceso a la nube.
- Prototipado rapido de asistentes conversacionales: al cargar en cualquier build reciente de llama.cpp, sirve para validar flujos conversacionales antes de invertir en un modelo mayor o en hardware de datacenter.
- Procesamiento por lotes de texto en servidores modestos: el reducido tamano de pesos libera VRAM para cache KV, lo que favorece tareas de resumen, clasificacion o reescritura en cola sobre multiples documentos.
- Aplicaciones con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo, lo que encaja en escenarios con datos personales o confidenciales donde no se permite enviar texto a APIs externas.
- Evaluacion y benchmarking de tecnicas de cuantizacion: el repositorio incluye mediciones de KLD frente al modelo sin cuantizar, por lo que es util como referencia reproducible para comparar metodos de compresion de 2 bits.
- Educacion y experimentacion en investigacion: permite a estudiantes e investigadores experimentar con un modelo de 11,9 B en un solo equipo de consumo, analizando el impacto de la cuantizacion agresiva en la calidad de generacion.

## Benchmarks y rendimiento

El autor no publica benchmarks clasicos (MMLU, HumanEval, GSM8K). En su lugar aporta divergencia KL de la distribucion del siguiente token respecto al modelo sin cuantizar, medida con `llama-perplexity --kl-divergence` sobre WikiText-2 (4 x 2048 tokens). Menor KLD y mayor coincidencia top-1 indican mejor calidad.

| Tipo | Modelo | Tamano | KLD media | KLD mediana | Coincidencia top-1 |
|---|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 3,55 GB | 9,86 | 9,53 | 2,2 % |
| IQ2_XXS | DASH-Q IQ2_XXS | 3,65 GB | 3,56 | 3,04 | 25,3 % |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 3,87 GB | 6,35 | 5,91 | 10,4 % |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 4,36 GB | 4,81 | 4,39 | 15,0 % |
| IQ2_M | unsloth UD-IQ2_M | 4,21 GB | 4,56 | 4,15 | 22,5 % |
| IQ2_M | DASH-Q IQ2_M | 4,35 GB | 1,90 | 1,19 | 47,8 % |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 4,81 GB | 3,80 | 3,40 | 24,3 % |
| Q2_K_XL | unsloth UD-Q2_K_XL | 4,66 GB | 3,41 | 2,94 | 32,0 % |
| Q2_K_XL | DASH-Q Q2_K_XL | 4,67 GB | 1,94 | 1,16 | 48,6 % |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 3,65 GB (IQ2_XXS), 4,35 GB (IQ2_M) y 4,67 GB (Q2_K_XL). Son estimaciones derivadas del tamano de archivo.
- VRAM adicional para cache KV: depende del contexto configurado y del modelo base; no se dispone de cifras oficiales. Con `-c 8192` (ejemplo del autor) hay que sumar la cache correspondiente a 8K tokens.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM puede alojar los pesos completos. Con 8 GB o mas se puede ademas reservar cache KV para contextos moderados. GPU de datacenter (A100, H100) son innecesarias para este tamano.
- Cabe en GPU de consumo: si. Ejemplos de clase: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, asi como GPUs integradas con memoria compartida suficiente.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`) es la via oficial indicada. Al ser GGUF estandar, tambien es compatible con frontends basados en llama.cpp como Ollama (mediante importacion), LM Studio o koboldcpp.
- Conectores como vLLM o TGI no estan indicados por el autor y no se garantiza su compatibilidad con estos archivos.
- Latencia y throughput: no disponible. Dependen del hardware, del numero de capas descargadas a GPU (`-ngl`), del contexto y del backend (CPU o GPU).

## Comparativa con modelos similares

Comparativa centrada en cuantizaciones de 2 bits del mismo modelo base, segun los datos de KLD aportados por el autor.

| Cuantizacion | Origen | Tamano | KLD media | KLD mediana | Coincidencia top-1 |
|---|---|---|---|---|---|
| DASH-Q IQ2_M | jkim96 | 4,35 GB | 1,90 | 1,19 | 47,8 % |
| unsloth UD-IQ2_M | unsloth | 4,21 GB | 4,56 | 4,15 | 22,5 % |
| llama.cpp IQ2_M (imatrix) | llama.cpp | 4,36 GB | 4,81 | 4,39 | 15,0 % |
| DASH-Q Q2_K_XL | jkim96 | 4,67 GB | 1,94 | 1,16 | 48,6 % |
| unsloth UD-Q2_K_XL | unsloth | 4,66 GB | 3,41 | 2,94 | 32,0 % |
| llama.cpp Q2_K (imatrix) | llama.cpp | 4,81 GB | 3,80 | 3,40 | 24,3 % |

En parametros, contexto, licencia y disponibilidad, ambas alternativas comparten el mismo modelo base que esta ficha, por lo que las diferencias se limitan al metodo de cuantizacion y al tamano resultante. La comparativa con modelos de otras familias no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva de 2 bits: incluso con la mejora declarada de DASH-Q, la distribucion del siguiente token diverge del modelo sin cuantizar (KLD media de 1,90 a 3,56 segun variante). Es esperable degradacion en tareas sensibles a la precision.
- Sin benchmarks de tarea: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que el rendimiento real en tareas concretas no esta verificado de forma independiente.
- Sin torre de vision: las capacidades multimodales del modelo base no estan disponibles en estos archivos.
- Ambiguedad de licencia: los metadatos de HuggingFace indican apache-2.0, mientras que la model card afirma que se hereda la licencia del modelo base google/gemma-4-12B-it. Conviene verificar la licencia efectiva antes de cualquier uso comercial, ya que las licencias de la familia Gemma suelen incluir condiciones de uso especificas.
- Idiomas no declarados: no se especifica cobertura linguistica, por lo que el comportamiento multilingue es incierto.
- Contexto no declarado: no se indica la longitud de contexto maxima del modelo base; el valor `-c 8192` del ejemplo es una configuracion de ejecucion, no una especificacion del modelo.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala, y potencialmente mayor por la cuantizacion de 2 bits.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, y fue publicado en 2026, por lo que no cuenta con validacion de la comunidad.
- Dependencia de build: aunque el autor afirma compatibilidad con cualquier build reciente de llama.cpp, el uso de tipos IQ2 requiere versiones que soporten dichos tipos de tensor.
- En produccion: conviene fijar la version de llama.cpp, validar en el dominio concreto de la aplicacion y comparar contra el modelo sin cuantizar o contra una cuantizacion de 4 bits.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jkim96/gemma-4-12b-it-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio del metodo DASH-Q: https://github.com/JaeminK/dashq
- Banner de DASH-Q: https://raw.githubusercontent.com/JaeminK/dashq/main/assets/dashq_banner.png
