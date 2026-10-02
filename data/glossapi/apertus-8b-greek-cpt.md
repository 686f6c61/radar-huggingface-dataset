# glossAPI/apertus-8b-greek-cpt

## Resumen

apertus-8b-greek-cpt es un modelo de lenguaje de 8.000 millones de parametros desarrollado por glossAPI mediante preentrenamiento continuado (continued pretraining, CPT) del modelo base swiss-ai/Apertus-8B-2509 sobre un corpus especifico de griego moderno. El objetivo es adaptar un modelo fundacional multilingue a las particularidades morfologicas, sintacticas y lexicas del griego, un idioma tradicionalmente infrarrepresentado en los corpus de entrenamiento de los grandes modelos de lenguaje. La ficha se publica bajo licencia Apache 2.0, con acceso restringido que requiere aceptar condiciones en HuggingFace.

El modelo se distribuye a traves de la libreria transformers y esta orientado a la generacion de texto en griego (tag de idioma `el`). Forma parte de un esfuerzo mas amplio de infraestructura abierta para el griego, articulado en torno al proyecto GlossAPI y a la colaboracion con la Swiss AI Initiative para integrar corpus lexicograficos griegos en la familia de modelos Apertus, desarrollada por ETH Zurich, EPFL y CSCS.

Su relevancia reside en la combinacion de un modelo base plenamente abierto (Apertus) con un corpus griego procesado especificamente, lo que permite mejorar el rendimiento en tareas nativas de comprension y generacion en griego frente al modelo base sin adaptar. El modelo declara resultados en varios benchmarks de griego (GreekMMLU, ASEP MCQA, suite nativa con DemosQA, GPCR, MCQA medico y tareas de metafora y NLI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Apertus-8B) |
| Parametros totales | 8.000 millones (segun denominacion del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Griego (el); capacidades multilingues heredadas del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se construye sobre swiss-ai/Apertus-8B-2509, un transformer decoder-only de 8.000 millones de parametros perteneciente a la familia Apertus, desarrollada por ETH Zurich, EPFL y CSCS en el marco de la Swiss AI Initiative. La adaptacion al griego se realiza mediante preentrenamiento continuado (CPT) sobre un corpus de griego moderno denominado `apertus-8b-greek-cpt-modern-greek-train`. Segun la documentacion del proyecto asociado, el flujo de trabajo incluye fases de limpieza de datos, extension del tokenizer, inicializacion de embeddings, CPT y barridos de hiperparametros (parameter sweeps).

La informacion disponible en la busqueda web describe el proyecto GlossAPI como una infraestructura de codigo abierto para crear, procesar, documentar y publicar conjuntos de datos de griego listos para IA. La colaboracion aprobada con la Swiss AI Initiative ("Enhancing multilingual foundation models through lexicographic grounding: advancing GlossAPI for Apertus Greek language integration") contempla una asignacion de recursos de computo (50.000, presumiblemente horas de GPU, segun el fragmento disponible). No se detalla en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto en griego moderno como funcion principal.
- Comprension lectora y respuesta a preguntas de opcion multiple en griego (evaluada en GreekMMLU y ASEP MCQA).
- Razonamiento sobre conocimiento cultural y factual griego (evaluado en DemosQA y GPCR).
- Tareas de dominio especifico en griego, incluido el ambito medico (Medical MCQA).
- Procesamiento de lenguaje figurativo, con evaluacion especifica en tareas de metafora (OYXOY metaphor).
- Inferencia de relaciones textuales (NLI) en griego (OYXOY NLI).
- Capacidades multilingues heredadas del modelo base Apertus-8B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en griego: el modelo puede gestionar conversaciones multi-turno en griego moderno con una calidad mejorada respecto al base, adecuado para sectores como banca, telecomunicaciones o turismo en Grecia y Chipre.
- Analisis de documentos administrativos griegos: procesamiento y resumen de textos legales o publicos, apoyandose en el rendimiento declarado en tareas del dominio (DemosQA, GPCR).
- Clasificacion y enrutado de consultas en griego: uso del modelo para categorizar tickets, correos o formularios redactados en griego en pipelines de back-office.
- Investigacion en PLN griego: base para experimentos academicos sobre adaptacion linguistica, tokenizer y preentrenamiento continuado, dado su origen en un proyecto abierto y documentado.
- Generacion de contenido editorial en griego: redaccion asistida de articulos, descripciones de producto o textos de marketing adaptados al registro griego.
- Apoyo a la traduccion asistida: uso como componente en sistemas de traduccion que requieran una comprension fina del griego de origen.
- Procesamiento de literatura y textos culturales griegos: analisis de metaforas y relaciones semanticas, apoyandose en las tareas OYXOY.
- Tareas de dominio sanitario en griego: extraccion y respuesta a preguntas sobre textos medicos, con la cautela derivada del bajo rendimiento declarado en esa tarea (38,42 %).

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Conjunto de datos | Metrica | Valor |
|---|---|---|---|
| GreekMMLU (decontaminado, n=16.159) | dascim/GreekMMLU | accuracy | 54,85 |
| ASEP MCQA (filtrado estricto de contaminacion) | fffoivos/native-greek-suite | accuracy | 55,08 |
| DemosQA (filtrado estricto de contaminacion) | fffoivos/native-greek-suite | accuracy | 46,58 |
| GPCR (filtrado estricto de contaminacion) | fffoivos/native-greek-suite | accuracy | 62,89 |
| Medical MCQA (filtrado estricto de contaminacion) | fffoivos/native-greek-suite | accuracy | 38,42 |
| OYXOY metaphor (filtrado estricto de contaminacion) | fffoivos/native-greek-suite | accuracy | 33,89 |
| OYXOY NLI (filtrado estricto de contaminacion) | fffoivos/native-greek-suite | accuracy | no disponible (dato truncado en la informacion recibida) |

No se dispone de comparaciones numericas con otros modelos en la informacion proporcionada.

## Requisitos de hardware

Las siguientes estimaciones se derivan del tamano del modelo (8.000 millones de parametros); no proceden de mediciones publicadas especificas de este modelo.

- VRAM estimada para inferencia: aproximadamente 16 GB en precision FP16/BF16, en torno a 8 GB en cuantizacion de 8 bits y entre 5 y 6 GB en cuantizacion de 4 bits.
- GPU recomendadas para despliegue en produccion: NVIDIA A100 (40/80 GB), H100 o L40S para servicio concurrente y contextos largos.
- Encaje en GPU de consumo: si, cabe en GPUs de consumo con cuantizacion (por ejemplo, RTX 4090 con 24 GB en FP16, o GPUs con 8-12 GB en 4-8 bits).
- Opciones de despliegue: dado que se distribuye en formato transformers, es compatible con vLLM, TGI y servidores de inferencia equivalentes; la conversion a GGUF para llama.cpp u Ollama requeriria un paso adicional no documentado en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| apertus-8b-greek-cpt | 8B | no disponible | Apache 2.0 | CPT sobre griego moderno; acceso restringido (gated) |
| swiss-ai/Apertus-8B-2509 (base) | 8B | no disponible | no disponible en la informacion | Modelo base multilingue sin adaptacion especifica al griego |
| Modelos fundacionales griegos alternativos | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de comparaciones cuantitativas con alternativas de la misma categoria en la informacion recibida.

## Limitaciones y advertencias

- Los resultados de benchmarks estan declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Rendimiento bajo en la tarea de MCQA medico (38,42 %) y en la tarea de metafora OYXOY (33,89 %), lo que desaconseja su uso sin supervision en dominios especializados como el sanitario o el analisis literario fino.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mecanismos especificos de mitigacion en la informacion disponible.
- El modelo esta especializado en griego; su rendimiento en otros idiomas no esta documentado y puede degradarse respecto al modelo base.
- No se especifica la longitud de contexto soportada ni los formatos de cuantizacion oficiales.
- Licencia Apache 2.0, que permite uso comercial, pero el acceso esta restringido (gated) y requiere aceptar las condiciones de HuggingFace en la pagina del modelo.
- No se detalla la composicion del dataset de entrenamiento ni posibles sesgos derivados de la fuente de datos, mas alla de su caracter de griego moderno.
- La ausencia de datos sobre tool calling, agentes y modo de razonamiento limita su uso en flujos agenticos sin validacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glossAPI/apertus-8b-greek-cpt
- Dataset de entrenamiento: https://huggingface.co/datasets/fffoivos/apertus-8b-greek-cpt-modern-greek-train
- Repositorio del proyecto de entrenamiento: https://github.com/fffoivos/train-apertus-with-glossapi
- Documento maestro del CPT: https://github.com/fffoivos/train-apertus-with-glossapi/blob/main/subprojects/03_apertus_extension_and_embedding_adaptation/CPT_MASTER_20260526.md
- Articulo en OpenReview ("GlossAPI and Apertus: Building Open Greek Language Infrastructure"): https://openreview.net/forum?id=ZblDjB0u2K
- PDF del articulo: https://openreview.net/pdf?id=ZblDjB0u2K
- Modelo base: https://huggingface.co/swiss-ai/Apertus-8B-2509
