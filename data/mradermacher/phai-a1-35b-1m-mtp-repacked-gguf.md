# mradermacher/Phai-A1-35B-1M-MTP-Repacked-GGUF

## Resumen

Phai-A1-35B-1M-MTP-Repacked-GGUF es la distribucion en formato GGUF del modelo Phai-A1-35B-1M-MTP-Repacked, publicada por el cuantizador mradermacher. El modelo base, alojado por prithivMLmods, es un transformer de tipo Mixture of Experts (MoE) con 35.505.251.456 parametros totales y una arquitectura identificada en los metadatos como `qwen3_5_moe`. Incorpora decodificacion especulativa mediante Multi-Token Prediction (MTP), lo que permite generar varios tokens por paso de inferencia y reducir la latencia.

El modelo esta orientado a tareas de generacion de codigo, uso como agente y contexto largo, segun las etiquetas del repositorio (`coding`, `agent`, `long-context`, `rl`). La nomenclatura "1M" sugiere una ventana de contexto de hasta 1.000.000 de tokens, aunque este dato no se confirma de forma explicita en la informacion disponible. Soporta oficialmente los idiomas chino, ingles, japones, arabe, ruso y aleman.

La relevancia de esta publicacion radica en que mradermacher ofrece un conjunto completo de cuantizaciones estaticas (desde Q2_K hasta Q8_0, ademas de IQ4_XS y los ficheros mmproj para uso multimodal), lo que permite desplegar un modelo de 35B en hardware de consumo con llama.cpp, llama-cli o text-generation-inference. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con Multi-Token Prediction (MTP) para decodificacion especulativa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible de forma explicita (la nomenclatura "1M" sugiere hasta 1.000.000 de tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | zh, en, ja, ar, ru, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture of Experts, identificada en los metadatos como `qwen3_5_moe`. La etiqueta `mxfp4_moe` indica que el modelo base emplea cuantizacion MXFP4 en las capas de expertos, un formato de 4 bits con escala compartida por bloques. Incorpora Multi-Token Prediction (MTP), un mecanismo de decodificacion especulativa que predice varios tokens futuros por paso y acelera la generacion; de ahi la etiqueta `speculative-decoding` y el sufijo MTP del nombre.

Los metadatos mencionan entrenamiento con refuerzo (`rl`), aunque no se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. Tampoco se especifica el numero de expertos ni cuantos se activan por token. Esta informacion no esta disponible en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Generacion y asistencia en codigo (etiqueta `coding`).
- Uso como agente y razonamiento multi-paso (etiqueta `agent`).
- Procesamiento de contexto largo (etiqueta `long-context`).
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que habilita entrada de imagenes en llama.cpp.
- Decodificacion especulativa nativa mediante MTP para acelerar la inferencia.
- Soporte multilingue en chino, ingles, japones, arabe, ruso y aleman.
- Compatibilidad con endpoints y con text-generation-inference segun las etiquetas del repositorio.

## Casos de uso

- Asistencia de codigo en local: con las cuantizaciones Q4_K_M (21,8 GB) o Q5_K_M (25,4 GB) el modelo puede ejecutarse en estaciones de trabajo con GPU de consumo y ofrecer autocompletado y generacion de funciones en IDE, aprovechando la etiqueta `coding` y la aceleracion por MTP.
- Agentes autonomos con contexto largo: la ventana de contexto extendida (hasta 1M segun la nomenclatura) permite mantener historiales de herramientas, trazas y documentos extensos en memoria, adecuado para pipelines de agentes multi-paso.
- Analisis de documentos largos: informes, expedientes o bases de codigo que superan el contexto de modelos convencionales pueden procesarse en una sola pasada sin troceado.
- Atencion al cliente multilingue: el soporte de chino, ingles, japones, arabe, ruso y aleman permite desplegar un unico modelo para mercados con esos idiomas.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_S (20,5 GB) permite ejecutar el modelo en una RTX 4090 de 24 GB o en configuraciones con memoria unificada, usando llama.cpp u Ollama.
- Procesamiento multimodal local: los ficheros mmproj habilitan tareas de descripcion de imagenes y extraccion de informacion de capturas o documentos escaneados sin depender de APIs externas.
- Servicio de inferencia en produccion: con text-generation-inference o vLLM (cuando soporte la arquitectura) se puede servir el modelo con batching continuo y decodificacion especulativa MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K 13,3 GB; Q3_K_S 15,6 GB; Q3_K_M 17,3 GB; Q3_K_L 18,7 GB; IQ4_XS 19,5 GB; Q4_K_S 20,5 GB; Q4_K_M 21,8 GB; Q5_K_S 24,7 GB; Q5_K_M 25,4 GB; Q6_K 29,3 GB; Q8_0 37,9 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y Q6_K con contexto largo; RTX 4090 (24 GB) para Q4_K_S/Q4_K_M con contexto moderado; RTX 3090 (24 GB) o RTX 4080 (16 GB) para cuantizaciones Q3 o IQ4_XS.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB con Q3_K_M o IQ4_XS; en GPUs de 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, llama-cli, Ollama, text-generation-inference; vLLM si soporta la arquitectura `qwen3_5_moe`.
- Latencia y throughput: no disponibles. La decodificacion especulativa MTP deberia reducir la latencia respecto a un modelo equivalente sin MTP, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phai-A1-35B-1M-MTP-Repacked-GGUF | 35,5B (MoE) | hasta 1M (segun nomenclatura, no confirmado) | Apache 2.0 | GGUF | MTP, multimodal, 6 idiomas |
| Modelo base prithivMLmods/Phai-A1-35B-1M-MTP-Repacked | 35,5B (MoE) | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Variante i1-GGUF de mradermacher | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas con imatrix |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas concretas no esta verificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin datos de evaluacion no puede acotarse.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o superiores para uso general.
- El contexto de 1M tokens no esta confirmado en la documentacion; debe validarse empiricamente antes de disenar flujos que dependan de el.
- Los idiomas soportados no incluyen el espanol de forma explicita, lo que puede degradar la calidad en castellano.
- El modelo base esta identificado como `qwen3_5_moe`; la compatibilidad con vLLM y otras herramientas depende de que estas soporten dicha arquitectura.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de atribucion.
- El tamano del repositorio (244,4 GB) implica descargas largas y requisitos de almacenamiento considerables si se quieren varias cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phai-A1-35B-1M-MTP-Repacked-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-MTP-Repacked
- Variante imatrix: https://huggingface.co/mradermacher/Phai-A1-35B-1M-MTP-Repacked-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Phai-A1-35B-1M-MTP-Repacked-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
