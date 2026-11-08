# mradermacher/Arete-27B-Uncensored-i1-GGUF

## Resumen

Arete-27B-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo SargeDev/Arete-27B-Uncensored, publicada por mradermacher. El modelo base es un ajuste fino de tipo "abliterated" y "uncensored" sobre una arquitectura de la familia Qwen (la model card etiqueta el modelo con `qwen3.8`), con 27.320.697.856 parametros totales segun los pesos en safetensors del modelo original. Su proposito es ofrecer una variante sin los mecanismos de rechazo habituales, pensada para experimentacion e investigacion sobre comportamiento de modelos y generacion de contenido sin filtros.

La relevancia de esta publicacion es practica: mradermacher genera cuantizaciones con imatrix (importance matrix) para que el modelo pueda ejecutarse en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), algo inviable con los pesos en precision completa de un modelo de 27B. El repositorio ocupa 39,5 GB e incluye un fichero imatrix para crear cuantizaciones propias, ademas de los quants precalculados.

La informacion disponible es limitada: la model card del cuantizador no documenta arquitectura detallada, datos de entrenamiento ni resultados de benchmarks, y el modelo base no aporta esa informacion en los datos proporcionados. Esta ficha refleja exclusivamente lo que consta en la informacion disponible y marca como "no disponible" todo lo que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, etiqueta `qwen3.8`); detalles no disponibles |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; incluye fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales del modelo base no disponibles en este repo |

## Arquitectura y entrenamiento

El modelo base es SargeDev/Arete-27B-Uncensored, un ajuste fino de tipo abliterated/uncensored sobre una arquitectura de la familia Qwen (la etiqueta `qwen3.8` sugiere una base Qwen de 27B, aunque no se confirma en la informacion disponible). La tecnica "abliterated" consiste en eliminar o atenuar la direccion de rechazo en el espacio de activaciones del modelo, de modo que el modelo deja de negarse a responder a determinadas peticiones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en el ajuste.

La contribucion de esta publicacion es la cuantizacion: mradermacher aplica cuantizacion de pesos con importance matrix (imatrix) generada a partir del modelo original, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas. El repositorio incluye tambien una version de cuantizaciones estaticas en un repositorio separado (Arete-27B-Uncensored-GGUF). No se documentan innovaciones arquitectonicas propias (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, sin los filtros de rechazo habituales (modelo uncensored/abliterated).
- Generacion de texto general y continuacion de contextos largos, sujeto a la ventana de contexto del modelo base (no disponible).
- Uso como modelo base para experimentacion en investigacion sobre alineamiento, rechazo y comportamiento de modelos.
- Ejecucion local en hardware de consumo gracias a las cuantizaciones GGUF de baja precision.
- Compatibilidad con endpoints y herramientas del ecosistema GGUF (llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el modelo permite estudiar como responde un modelo abliterated frente a uno alineado en las mismas peticiones, comparando tasas de rechazo y contenido generado en entornos controlados de laboratorio.
- Evaluacion de robustez de filtros: util para probar clasificadores de contenido y sistemas de moderacion frente a un modelo que no aplica rechazo, midiendo la cobertura de dichos sistemas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o sensibles, donde los modelos alineados suelen negarse; requiere revision humana del output.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M el modelo puede ejecutarse en GPUs de consumo de gama alta mediante llama.cpp u Ollama, sin dependencia de APIs externas.
- Prototipado de asistentes conversacionales en ingles: gracias a su tamano de 27B y a la disponibilidad de quants, sirve para iterar rapidamente en local sobre dialogos multi-turno antes de pasar a produccion.
- Experimentacion con tecnicas de cuantizacion: el fichero imatrix incluido permite generar cuantizaciones propias y comparar la degradacion de calidad entre tipos de quant (Q2 a Q6) sobre un mismo modelo.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0 y en formato GGUF, puede servir como referencia para comparar con variantes afinadas, aunque el fine-tuning directo sobre GGUF no es el flujo habitual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de los quants): i1-Q2_K ~11 GB; Q4_K_M en torno a 16-17 GB; Q5_K_M en torno a 19 GB; Q6_K en torno a 22-23 GB. Estas cifras son estimaciones a partir del tamano de los ficheros y del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: para Q4_K_M o superiores, GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) o superiores; para cuantizaciones Q2/IQ2, GPUs de 12-16 GB pueden ser suficientes con offloading parcial.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB con cuantizaciones IQ3/IQ4 y posible offloading de capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI que acepten GGUF; vLLM y TGI no soportan GGUF de forma nativa en el momento de la publicacion (no confirmado para este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF (i1/imatrix) | Cuantizacion de SargeDev/Arete-27B-Uncensored; solo ingles |
| mradermacher/Arete-27B-i1-GGUF | 27B | no disponible | no disponible | GGUF | Variante del mismo autor sin el sufijo "Uncensored"; relacion exacta con este modelo no confirmada |
| mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF | 27B | no disponible | no disponible | GGUF | Otro modelo uncensored de la familia Qwen3.8 cuantizado por mradermacher; incluye modos de razonamiento e instruct segun su model card |
| SargeDev/Arete-27B-Uncensored (modelo base) | 27,3B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar; requiere hardware de mayor capacidad |

## Limitaciones y advertencias

- Modelo uncensored/abliterated: no aplica los mecanismos de rechazo habituales, por lo que puede generar contenido sensible, ofensivo o danino; no es adecuado para despliegues orientados al publico sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni benchmarks que permitan cuantificarlo; como todo modelo de lenguaje, puede inventar hechos.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: la longitud de contexto no esta disponible en la informacion proporcionada; no debe asumirse una ventana larga.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y su proceso de abliteration pueden conllevar obligaciones adicionales no documentadas; conviene revisar la licencia del modelo base antes de un uso comercial.
- Cuantizaciones de baja precision: los quants Q2/IQ2 degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible, por lo que no se puede comparar su rendimiento de forma objetiva con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Arete-27B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Arete-27B-Uncensored-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Arete-27B-Uncensored-i1-GGUF
- Variante relacionada: https://huggingface.co/mradermacher/Arete-27B-i1-GGUF
- Otro modelo uncensored de la familia Qwen3.8: https://huggingface.co/mradermacher/Qwen3.8-27B-Ultimate-Heretic-Uncensored-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de quants de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
