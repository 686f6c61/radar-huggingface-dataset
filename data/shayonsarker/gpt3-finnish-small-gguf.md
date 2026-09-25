# ShayonSarker/gpt3-finnish-small-GGUF

## Resumen

El modelo `ShayonSarker/gpt3-finnish-small-GGUF` es una publicacion en formato GGUF del modelo base `TurkuNLP/gpt3-finnish-small`, desarrollado originalmente por el grupo TurkuNLP (Universidad de Turku) dentro de su familia de modelos generativos para finlandes. Se trata de un modelo de lenguaje monolingue de arquitectura BLOOM (transformer decoder-only, estilo GPT-3) con 185.720.832 parametros (aproximadamente 186M), 12 capas, embeddings de 768 dimensiones y 12 cabezas de atencion. La aportacion de esta publicacion concreta no es el entrenamiento, sino la conversion y validacion del modelo en formato nativo de llama.cpp, restaurando la longitud de secuencia de 2.048 tokens que la configuracion original del modelo fuente omitia.

El modelo resuelve el problema de disponer de un modelo generativo de texto en finlandes, un idioma con recursos limitados en comparacion con el ingles, ejecutable en hardware de consumo. Al estar cuantizado en GGUF (F16, Q8_0 y Q4_K_M), puede desplegarse en CPU o en GPUs modestas mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura de servidor. La licencia Apache-2.0 facilita su uso comercial y su integracion en productos derivados.

Es relevante ahora porque ocupa un nicho muy concreto: modelos pequenos, monolingues y eficientes para lenguas minoritarias, con una validacion de perplejidad publicada sobre Wikipedia en finlandes. No es un modelo de instrucciones ni de chat: es un modelo de lenguaje puro (base), pensado para continuacion de texto, fine-tuning posterior o evaluacion linguistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-3 sobre arquitectura BLOOM |
| Parametros totales | 185.720.832 (aproximadamente 186M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (restaurada desde el limite del tokenizer; la config fuente omitia `seq_length`) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Finlandes (modelo monolingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tres ficheros: `gpt3-finnish-small-F16.gguf`, `gpt3-finnish-small-Q8_0.gguf`, `gpt3-finnish-small-Q4_K_M.gguf`) |
| Capas | 12 |
| Dimension de embeddings | 768 |
| Cabezas de atencion | 12 |
| Tamano del repositorio | 0,7 GB (conjunto de los tres ficheros) |
| Modelo base | TurkuNLP/gpt3-finnish-small |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-3 construido sobre los bloques de BLOOM. Segun los datos disponibles, consta de 12 capas, 768 dimensiones de embedding y 12 cabezas de atencion, con 186M de parametros. El modelo fuente fue entrenado por TurkuNLP sobre un corpus de aproximadamente 300.000 millones (300B) de tokens, segun la informacion recogida en la busqueda web. No se dispone de detalle sobre la composicion exacta del dataset, el uso de RLHF o DPO, ni sobre tecnicas de optimizacion del entrenamiento en la informacion proporcionada.

La innovacion destacable de esta publicacion concreta es de ingenieria de conversion: la configuracion del modelo fuente omite el parametro `seq_length`, por lo que el proceso de build restaura el limite de 2.048 tokens del tokenizer antes de convertir los pesos a GGUF. El script `build_gguf.py` fija (pin) el commit `6b790a9c291b5d7af3312bbf9f0c558aa023b13e` de llama.cpp y la revision upstream del modelo, lo que garantiza reproducibilidad. No se ha aplicado ningun ajuste por instrucciones ni alineacion conversacional: es un modelo base.

## Capacidades

- Generacion de texto en finlandes: continuacion de texto, completado de frases y produccion de parrafos coherentes en dicho idioma.
- Modelado de lenguaje puro: adecuado para calcular perplejidad y para tareas de evaluacion linguistica.
- Punto de partida para fine-tuning: al ser un modelo base, puede ajustarse para tareas concretas (clasificacion, resumen, generacion condicionada) con datos etiquetados en finlandes.
- Ejecucion local eficiente: los formatos GGUF permiten inferencia en CPU y en GPUs de gama baja mediante llama.cpp.
- Cuantizacion con degradacion minima: segun la validacion publicada, Q8_0 y Q4_K_M mantienen la calidad muy cerca de F16.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No tiene modo de razonamiento (thinking mode), vision, audio ni capacidades multimodales.
- No es un modelo multilingue: esta entrenado especificamente para finlandes.

## Casos de uso

- Generacion de texto en finlandes para medios y editoriales: el modelo puede redactar borradores o completar parrafos en finlandes, y su ventana de 2.048 tokens permite trabajar con fragmentos de articulo completos por iteracion.
- Aumento de datos en finlandes: generar corpus sinteticos para entrenar clasificadores o modelos mas pequenos en un idioma con pocos datos disponibles, partiendo de semillas reales.
- Fine-tuning para tareas especificas en finlandes: al ser un modelo base Apache-2.0, puede ajustarse para analisis de sentimiento, clasificacion de documentos o extraccion de entidades en dicho idioma sin restricciones de licencia.
- Evaluacion linguistica y de tokenizacion: util como referencia para medir perplejidad sobre corpus finlandeses y comparar el efecto de distintas cuantizaciones.
- Prototipado en hardware de consumo: desarrolladores que quieran experimentar con generacion de texto en finlandes pueden ejecutarlo en un portatil o en una GPU integrada mediante llama.cpp u Ollama.
- Investigacion sobre lenguas de bajos recursos: sirve como punto de comparacion frente a modelos multilingues grandes para estudiar la relacion entre tamano, monolinguismo y calidad en idiomas minoritarios.
- Aplicaciones embebidas o de borde (edge): su tamano reducido (del orden de 0,1-0,4 GB segun cuantizacion) permite integrarlo en dispositivos con poca memoria siempre que no se requiera baja latencia estricta.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible corresponden a perplejidad (PPL) sobre Wikipedia en finlandes, calculada sobre 8 fragmentos de 512 tokens. Menor perplejidad es mejor.

| Formato | PPL | Ratio respecto a F16 |
|---|---:|---:|
| F16 | 44.4931 | Baseline |
| Q8_0 | 44.5125 | 1.0004 |
| Q4_K_M | 45.2245 | 1.0164 |

Ademas, se realizo una prueba de humo (smoke test) determinista de generacion con Q4_K_M que se completo correctamente. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB para F16, unos 0,25-0,3 GB para Q8_0 y unos 0,15-0,2 GB para Q4_K_M, incluyendo margen para el contexto (estimacion a partir del numero de parametros y del tamano del repositorio).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050 Ti, una GPU integrada moderna o incluso una Raspberry Pi con RAM suficiente pueden ejecutar el modelo cuantizado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en generaciones antiguas, y tambien en CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, servidores compatibles con GGUF y, para los pesos originales en safetensors del modelo fuente, la libreria transformers. El tag `endpoints_compatible` indica compatibilidad con endpoints gestionados.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa directa con alternativas de la misma categoria presenta limitaciones porque no se dispone de datos de rendimiento de los otros modelos de la familia. La tabla siguiente recoge lo que si esta documentado.

| Modelo | Parametros | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| ShayonSarker/gpt3-finnish-small-GGUF | 186M | 2.048 tokens | GGUF (F16, Q8_0, Q4_K_M) | Apache-2.0 | PPL 44,4931 (F16) en Wikipedia fi |
| TurkuNLP/gpt3-finnish-small | 186M | no disponible en la informacion consultada | safetensors (transformers) | Apache-2.0 | no disponible |
| TurkuNLP/gpt3-finnish-medium | no disponible | no disponible | safetensors | Apache-2.0 (segun familia) | no disponible |
| TurkuNLP/gpt3-finnish-large | no disponible | no disponible | safetensors | Apache-2.0 (segun familia) | no disponible |

Otras variantes de la familia citadas en la documentacion (gpt3-finnish-xl y gpt3-finnish-3B) existen, pero no se dispone de sus especificaciones ni de resultados comparables en la informacion proporcionada. La comparacion cuantitativa con modelos de otros desarrolladores no esta disponible.

## Limitaciones y advertencias

- No es un modelo de instrucciones ni de chat: no responde a preguntas ni mantiene dialogos de forma fiable sin fine-tuning previo.
- Riesgo de alucinacion: como todo modelo de lenguaje base, puede generar contenido plausible pero incorrecto, especialmente fuera de los dominios representados en su corpus de entrenamiento.
- Limitacion idiomatica: entrenado para finlandes; su rendimiento en otros idiomas es previsiblemente bajo y no esta documentado.
- Ventana de contexto corta: 2.048 tokens, inferior a la de modelos modernos, lo que limita tareas que requieran documentos largos.
- Sesgos: no se ha publicado informacion sobre sesgos del modelo fuente ni sobre el proceso de filtrado del corpus de entrenamiento (300B tokens), por lo que se desconoce el alcance de los sesgos presentes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar la atribucion del modelo fuente y el fichero `LICENSE` del repositorio.
- Es una publicacion de conversion, no de entrenamiento: no incorpora mejoras de calidad respecto al modelo original, solo cambio de formato.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni mantenimiento confirmado.
- Fechas de creacion y actualizacion del repositorio (2026-09-25) resultan inconsistentes con el contexto temporal habitual; conviene verificar la vigencia de los artefactos antes de usarlos en produccion.
- No se dispone de informacion sobre el proceso de cuantizacion mas alla de los tres formatos publicados ni sobre pruebas de robustez frente a entradas adversarias.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/ShayonSarker/gpt3-finnish-small-GGUF
- Modelo fuente: https://huggingface.co/TurkuNLP/gpt3-finnish-small
- Arbol de ficheros del modelo fuente: https://huggingface.co/TurkuNLP/gpt3-finnish-small/tree/main
- Pagina del proyecto TurkuNLP GPT-3 finlandes: https://turkunlp.org/gpt3-finnish
- Repositorio de construccion (build hub): https://github.com/Dadhichi-Sarker-Shayon/gpt3-finnish-small-GGUF
- Visualizacion de la arquitectura del modelo fuente: https://hfviewer.com/TurkuNLP/gpt3-finnish-small
- Ficha de referencia del modelo fuente: https://www.promptlayer.com/models/gpt3-finnish-small
- Manuscrito asociado a la familia de modelos: FinGPT: Large Generative Models for a Small Language (PDF referenciado en turkunlp.org/gpt3-finnish)
