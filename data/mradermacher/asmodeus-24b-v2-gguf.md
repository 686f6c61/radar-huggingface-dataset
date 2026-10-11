# mradermacher/Asmodeus-24B-v2-GGUF

## Resumen

Asmodeus-24B-v2-GGUF es la version cuantizada en formato GGUF del modelo DarkArtsForge/Asmodeus-24B-v2, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de modelos abiertos. No se trata de un modelo entrenado por el autor del repositorio, sino de una distribucion de pesos listos para inferencia local con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, etc.). El repositorio acumula 405 descargas y 1 "like", y su tamano total es de 161,4 GB, correspondiente al conjunto de todas las cuantizaciones publicadas.

El modelo base cuenta con 23.572.444.160 parametros (aproximadamente 23,57 mil millones), lo que lo situa en la categoria de 24B. Las etiquetas del repositorio indican que se trata de un merge construido con mergekit mediante el metodo DELLA, sobre la familia Mistral, y que es un modelo "uncensored", es decir, sin el alineamiento de seguridad habitual en modelos comerciales. El idioma declarado es unicamente el ingles y la licencia indicada es Apache 2.0.

Su relevancia actual es la de un modelo de conversacion sin restricciones de contenido, distribuido en cuantizaciones que van de 9,0 GB (Q2_K) a 25,2 GB (Q8_0), lo que permite ejecutarlo en GPUs de consumo. No se han publicado datos de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del repo: mistral, mergekit, DELLA; se trata de un merge, no de un entrenamiento desde cero) |
| Parametros totales | 23.572.444.160 (23,57 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (el modelo base referencia tambien f16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo original en safetensors/transformers) |
| Tamano del repositorio | 161,4 GB |
| Modelo base | DarkArtsForge/Asmodeus-24B-v2 |
| Dataset referenciado | OccultAI/illuminati_imatrix_v1 |
| Libreria declarada | transformers |
| Pipeline | no disponible |
| Descargas / likes | 405 / 1 |
| Fecha de creacion / actualizacion | 2026-03-21 / 2026-10-10 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. Las etiquetas del repositorio (`mistral`, `mergekit`, `DELLA`, `merge`) indican que el modelo base es el resultado de una fusion de modelos de la familia Mistral realizada con mergekit, utilizando el metodo DELLA para combinar los pesos. No se especifica que modelos concretos se fusionaron, ni el numero de tokens de entrenamiento, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. El dataset referenciado en las etiquetas, OccultAI/illuminati_imatrix_v1, se asocia al calculo de matrices de importancia (imatrix) para la cuantizacion, no necesariamente al entrenamiento del modelo base.

El repositorio incluye dos variantes de cuantizacion: las estaticas de este repositorio y las ponderadas con imatrix en mradermacher/Asmodeus-24B-v2-i1-GGUF. Segun la propia documentacion del autor, las cuantizaciones imatrix suelen ofrecer mejor calidad que las estaticas de tamano equivalente. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, arquitecturas hibridas, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Modelo "uncensored": no incorpora el alineamiento de seguridad tipico, por lo que responde a peticiones que otros modelos rechazarian.
- Capacidad de razonamiento, codigo o matematicas: no documentada en la informacion disponible.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el unico idioma declarado es el ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia local eficiente gracias a las 11 cuantizaciones GGUF publicadas, desde 9,0 GB hasta 25,2 GB.

## Casos de uso

- Conversacion y roleplay sin filtros de contenido: el modelo esta etiquetado como "uncensored", por lo que se emplea en entornos controlados donde se necesita una generacion sin rechazos automaticos. Requiere revision humana obligatoria en cualquier producto orientado a terceros.
- Generacion creativa de ficcion: redaccion de narrativa, dialogos de personajes y tramas largas en ingles. Al no haber datos de contexto publicados, la longitud de las sesiones debe validarse empiricamente antes de disenar un producto que dependa de ventanas largas.
- Despliegue local o en intranet sin conexion: el formato GGUF permite ejecutar el modelo con llama.cpp u Ollama en equipos sin acceso a APIs externas, lo que resulta util cuando la confidencialidad del texto es un requisito.
- Investigacion en seguridad y red teaming: al carecer de alineamiento, sirve como linea base para estudiar que tipo de contenido generan los modelos sin filtros y para calibrar clasificadores de seguridad.
- Prototipado rapido de asistentes conversacionales en ingles: la cuantizacion Q4_K_S (13,6 GB) permite iterar en una GPU de consumo sin necesidad de infraestructura dedicada.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes del mismo modelo, lo que permite medir de forma controlada la degradacion de calidad y de perplexidad entre Q2_K, Q4_K_M, Q6_K y Q8_0 sobre el mismo conjunto de prompts.
- Generacion de datos sinteticos en ingles para experimentos internos: util como generador de texto a escala, siempre que se revise la licencia del modelo base y el contenido producido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente incluye una grafica de perplexidad elaborada por ikawrakow que compara tipos de cuantizacion de baja calidad (a menor valor, mejor), y una referencia a las notas de Artefact2 sobre el tema. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

Los tamanos siguientes son los declarados en la model card. La VRAM necesaria para inferencia es superior al tamano del archivo, ya que hay que sumar la cache KV y el overhead del runtime; esa diferencia depende de la longitud de contexto y del backend.

| Cuantizacion | Peso en disco (GB) | VRAM estimada solo pesos |
|---|---|---|
| Q2_K | 9,0 | ~9-10 GB |
| Q3_K_S | 10,5 | ~10-11 GB |
| Q3_K_M | 11,6 | ~12 GB |
| Q3_K_L | 12,5 | ~13 GB |
| IQ4_XS | 13,0 | ~13-14 GB |
| Q4_K_S | 13,6 | ~14 GB |
| Q4_K_M | 14,4 | ~15 GB |
| Q5_K_S | 16,4 | ~17 GB |
| Q5_K_M | 16,9 | ~17-18 GB |
| Q6_K | 19,4 | ~20 GB |
| Q8_0 | 25,2 | ~25-26 GB |

- Cabe en GPU de consumo: si. Q4_K_S y Q4_K_M entran en tarjetas de 16 GB; Q5 y Q6 en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090); Q8_0 requiere 32 GB o reparto entre GPU y CPU.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 pueden alojar cualquier cuantizacion publicada, incluida Q8_0, con margen para contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. vLLM y TGI no son el objetivo de este repositorio (estan orientados a safetensors), aunque el modelo base si es compatible con transformers.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar el rendimiento. La comparacion se limita a caracteristicas verificables del ecosistema de este mismo modelo.

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Asmodeus-24B-v2-GGUF (este) | 23,57 B | GGUF (cuantizacion estatica) | no disponible | apache-2.0 | 11 cuantizaciones, de Q2_K a Q8_0 |
| mradermacher/Asmodeus-24B-v2-i1-GGUF | no disponible | GGUF (imatrix) | no disponible | no disponible | Variante ponderada con imatrix; el autor la considera de mayor calidad a igual tamano |
| mradermacher/Asmodeus-24B-v3-GGUF | no disponible | GGUF | no disponible | no disponible | Version posterior del mismo linaje |
| DarkArtsForge/Asmodeus-24B-v2 | no disponible | safetensors | no disponible | no disponible | Modelo base sin cuantizar |

Comparacion con alternativas de otros autores (por ejemplo, otros merges de la familia Mistral en el rango de 24B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: la etiqueta "uncensored" implica que el modelo puede producir contenido ofensivo, ilegal o danino. No debe exponerse directamente a usuarios finales sin una capa de moderacion.
- Riesgo de alucinacion: no hay evaluaciones de fidelidad factual. En tareas de recuperacion de informacion o resumen, el modelo puede inventar datos sin advertirlo.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta verificado y probablemente sea degradado.
- Longitud de contexto desconocida: al no publicarse, cualquier caso de uso que dependa de contexto largo requiere validacion previa.
- Calidad de las cuantizaciones bajas: Q2_K (9,0 GB) y Q3_K_S (10,5 GB) implican perdida de calidad apreciable. La propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Licencia: el repositorio de cuantizacion declara apache-2.0, pero se trata de una fusion de modelos de terceros. Es responsabilidad del usuario verificar la licencia y las condiciones de cada componente del merge en el repositorio del modelo base antes de un uso comercial.
- Procedencia del merge: al ser una fusion DELLA sin documentacion de los modelos origen, no se puede auditar la composicion del dataset ni los sesgos heredados.
- Sin benchmarks: no existe evidencia publicada de rendimiento que respalde afirmaciones de calidad frente a otros modelos del mismo tamano.
- Fechas del repositorio: las fechas de creacion y actualizacion declaradas (2026-03-21 y 2026-10-10) son posteriores a la fecha habitual de consulta; conviene verificar su coherencia en la pagina de HuggingFace.
- Bajo nivel de adopcion: 405 descargas y 1 "like" indican que el modelo no ha sido validado por una comunidad amplia.

## Enlaces

- Repositorio GGUF (cuantizaciones estaticas): https://huggingface.co/mradermacher/Asmodeus-24B-v2-GGUF
- Repositorio GGUF con cuantizaciones imatrix: https://huggingface.co/mradermacher/Asmodeus-24B-v2-i1-GGUF
- Modelo base: https://huggingface.co/DarkArtsForge/Asmodeus-24B-v2
- Version v3 del mismo linaje: https://huggingface.co/mradermacher/Asmodeus-24B-v3-GGUF/tree/main
- Modelo base que sirve de referencia en el repositorio: https://huggingface.co/mradermacher/Asmodeus-24B-v1-i1-GGUF
- Dataset referenciado en las etiquetas: https://huggingface.co/datasets/OccultAI/illuminati_imatrix_v1
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Asmodeus-24B-v2-GGUF
- Peticiones y preguntas frecuentes sobre cuantizaciones: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplexidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
