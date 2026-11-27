# mradermacher/STEVE-R1-7B-SFT-GGUF

## Resumen

STEVE-R1-7B-SFT-GGUF es la distribucion en formato GGUF del modelo STEVE-R1-7B-SFT, un modelo de lenguaje de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) especializado en robotica, agentes y vision por computador. El modelo original fue desarrollado por Fanbin y cuantizado por mradermacher, un conocido creador de cuantizaciones GGUF para la comunidad. Esta version esta pensada para su uso con llama.cpp y otros runtimes compatibles con GGUF, lo que facilita su despliegue en hardware de consumo.

El modelo se presenta como un LLM conversacional con capacidades multimodales (incluye un fichero `mmproj` para el proyector multimodal) y esta etiquetado para tareas de robotica y agentes. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El repositorio incluye un amplio abanico de cuantizaciones estaticas, desde Q2_K hasta f16, con tamanos que van de 3,1 GB a 15,3 GB.

La relevancia de esta ficha radica en que STEVE-R1-7B-SFT-GGUF ofrece una via practica para desplegar un modelo orientado a robotica y agentes en entornos con recursos limitados, gracias a la disponibilidad de cuantizaciones ligeras y al soporte de llama.cpp. No obstante, la informacion publica sobre el modelo base es escasa, por lo que muchos detalles tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun el formato de pesos y la libreria transformers) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-fp16 para el proyector multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Fanbin/STEVE-R1-7B-SFT en la informacion proporcionada. Por el nombre y el tamano (7,6 mil millones de parametros) y por la libreria declarada (transformers), se trata presumiblemente de un transformer decoder-only, pero no se confirma si emplea innovaciones como atencion lineal, decodificacion especulativa o mezcla de expertos. El modelo incluye un proyector multimodal (`mmproj-fp16.gguf`), lo que indica capacidades de vision, coherente con las etiquetas `computer-vision` y `robotics`.

Tampoco se detallan los datos de entrenamiento: numero de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO o SFT (aunque el sufijo "SFT" en el nombre sugiere un ajuste supervisado). El modelo base se distribuye en safetensors y esta etiquetado como `robotics`, `agent`, `computer-vision` y `llm`, lo que orienta su uso hacia tareas de agente y robotica multimodal. Cualquier dato adicional sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline declarado.
- Capacidades multimodales: el repositorio incluye un proyector multimodal (`mmproj-fp16.gguf`), lo que habilita entrada de imagenes junto con texto.
- Orientacion a robotica: etiquetado explicitamente como modelo de robotica, pensado para tareas de percepcion y control asistido por lenguaje.
- Soporte de agentes: etiqueta `agent`, lo que sugiere capacidad para razonamiento multi-paso y uso de herramientas, aunque no se detalla el mecanismo concreto.
- Vision por computador: etiqueta `computer-vision`, coherente con el proyector multimodal incluido.
- No se confirma soporte explicito de tool calling o function calling en la informacion disponible.
- Idioma: solo ingles declarado; no se garantiza soporte multilingue.

## Casos de uso

- Robotica asistida por lenguaje: el modelo puede interpretar instrucciones en lenguaje natural y combinarlas con entrada visual (gracias al proyector multimodal) para generar comandos de alto nivel en pipelines de robotica, lo que encaja con su etiquetado como modelo de robotica.
- Agentes autonomos en entornos simulados: su etiqueta `agent` permite integrarlo en bucles de razonamiento multi-paso para planificacion de tareas, aunque la falta de datos sobre context window obliga a validar el comportamiento en produccion.
- Prototipado de sistemas de percepcion visual-lenguaje: al incluir `mmproj`, se puede usar para tareas de descripcion de escenas, respuesta a preguntas sobre imagenes o grounding visual en entornos de investigacion.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (4,6 y 4,8 GB) permiten ejecutar el modelo en GPUs consumer con 8 GB de VRAM, ideal para pruebas locales de agentes roboticos.
- Educacion e investigacion en robotica: al ser Apache 2.0 y estar disponible en GGUF, sirve como base para experimentos academicos sin coste de licencia.
- Integracion en pipelines de llama.cpp: el formato GGUF permite incorporarlo a herramientas como Ollama o servidores compatibles con la API de OpenAI, facilitando su uso en prototipos de agentes conversacionales con vision.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 cuantizaciones distintas, lo que permite estudiar el impacto de la cuantizacion en tareas de robotica y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q3_K_M ~3,9 GB; Q3_K_L ~4,2 GB; IQ4_XS ~4,4 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_S ~5,4 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. A estas cifras hay que sumar el proyector multimodal mmproj-fp16 (~1,5 GB) si se usa la parte de vision.
- GPU recomendadas: para f16, una GPU con 24 GB o mas (RTX 3090, RTX 4090, A100, H100). Para Q8_0, 12-16 GB (RTX 4080, RTX 4070 Ti Super). Para Q4_K_M, 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070).
- Cabe en GPU consumer: si, en la mayoria de cuantizaciones Q4 y Q5 con 8 GB de VRAM; las versiones Q2-Q3 caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, servidores compatibles con la API de OpenAI (la etiqueta `endpoints_compatible` lo indica), y potencialmente TGI si se convierte a otro formato. No se garantiza soporte en vLLM para GGUF multimodal.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. A continuacion se comparan caracteristicas objetivas con alternativas genericas de tamano similar, marcando como no disponible lo que no se conoce.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| STEVE-R1-7B-SFT-GGUF | 7,6 B | no disponible | Apache 2.0 | GGUF | Especializado en robotica y agentes, multimodal |
| Modelos genericos de 7B (p. ej. Llama 3.1 8B, Qwen2.5 7B) | ~7-8 B | 128K (segun modelo) | licencias variables | safetensors, GGUF | Proposito general, sin enfoque especifico en robotica |
| Alternativas roboticas de 7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

La comparativa cuantitativa de rendimiento no es posible sin benchmarks publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado principalmente en ingles, puede presentar sesgos culturales y linguisticos propios de ese corpus.
- Riesgo de alucinacion: no cuantificado; como todo LLM de 7B, es propenso a generar contenido plausible pero incorrecto, especialmente en tareas de robotica donde la precision es critica.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide garantizar conversaciones largas o razonamiento multi-paso extenso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el modelo base podria tener condiciones adicionales no reflejadas, por lo que conviene revisar la licencia del modelo original Fanbin/STEVE-R1-7B-SFT.
- Caveats para produccion: la falta de benchmarks y de documentacion sobre el entrenamiento dificulta la validacion; el uso en robotica real requiere pruebas de seguridad adicionales. Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad (el propio autor marca Q3_K_M como "lower quality").
- El repositorio ocupa 69,5 GB, lo que puede complicar la descarga completa; se recomienda descargar solo la cuantizacion necesaria.
- La fecha de actualizacion (2026-11-26) es posterior a la de creacion, lo que sugiere posibles revisiones; conviene verificar la integridad de los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/STEVE-R1-7B-SFT-GGUF
- Modelo base: https://huggingface.co/Fanbin/STEVE-R1-7B-SFT
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/STEVE-R1-7B-SFT-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#STEVE-R1-7B-SFT-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
