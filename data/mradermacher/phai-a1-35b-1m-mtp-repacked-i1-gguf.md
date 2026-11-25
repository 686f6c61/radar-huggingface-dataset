# mradermacher/Phai-A1-35B-1M-MTP-Repacked-i1-GGUF

## Resumen

Phai-A1-35B-1M-MTP-Repacked-i1-GGUF es una cuantizacion GGUF del modelo Phai-A1-35B-1M-MTP-Repacked, publicada por mradermacher, un conocido creador de cuantizaciones del ecosistema llama.cpp. El modelo base, desarrollado por prithivMLmods, es un transformer de tipo Mixture of Experts (MoE) con arquitectura derivada de Qwen3.5, 35.505 millones de parametros totales y una ventana de contexto que el nombre del modelo sugiere en torno al millon de tokens. Incluye soporte de Multi-Token Prediction (MTP), una tecnica que permite decodificacion especulativa nativa y acelera la inferencia.

El modelo esta orientado a generacion de texto, codigo, tareas de agente y contexto largo, con soporte declarado para chino, ingles, japones, arabe, ruso y aleman. La licencia Apache 2.0 facilita su uso comercial. Esta ficha se centra en la version cuantizada i1-GGUF, que ofrece un abanico de cuantizaciones con imatrix (desde Q2_K hasta Q6_K) pensadas para ejecucion local con llama.cpp.

La relevancia actual de esta publicacion radica en que permite desplegar un modelo MoE de 35B con contexto muy largo y capacidades de agente en hardware de consumo, gracias a las cuantizaciones de 4 bits que ocupan entre 20 y 22 GB. La integracion de MTP y mxfp4_moe en el ecosistema llama.cpp es un avance practico para reducir latencia en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), con Multi-Token Prediction (MTP) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el nombre del modelo sugiere 1M) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix) |
| Idiomas soportados | zh, en, ja, ar, ru, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix separado) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con arquitectura etiquetada como qwen3_5_moe, lo que indica que deriva de la familia Qwen3.5 MoE. La presencia de MTP (Multi-Token Prediction) implica que el modelo fue entrenado para predecir varios tokens futuros de forma simultanea, lo que habilita decodificacion especulativa integrada y reduce la latencia de generacion. Los tags del repositorio mencionan tambien mxfp4_moe, un formato de cuantizacion de precision mixta para capas MoE, y rl, lo que sugiere que el modelo base paso por fases de aprendizaje por refuerzo.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas exactas de alineacion (RLHF/DPO) empleadas en el modelo base. El repositorio de mradermacher es exclusivamente una cuantizacion: no aporta datos de entrenamiento propios, sino que transforma los pesos del modelo original a formato GGUF con calibracion imatrix para minimizar la perdida de calidad.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas (chino, ingles, japones, arabe, ruso y aleman).
- Generacion de codigo y asistencia en programacion, segun los tags coding y agent.
- Razonamiento de multiples pasos y flujos de agente, respaldado por el tag agent.
- Contexto largo (long-context), con un nombre de modelo que apunta a 1M de tokens.
- Decodificacion especulativa mediante MTP, que acelera la generacion.
- Capacidad de vision: la model card indica explicitamente que es un modelo de vision y que los ficheros mmproj estan en el repositorio estatico.
- Compatibilidad con text-generation-inference y endpoints_compatible.
- Ejecucion local mediante llama.cpp (llama-cli, llama-cpp).

## Casos de uso

- Asistencia de codigo en local: con cuantizaciones Q4_K_M de 21,8 GB, el modelo puede ejecutarse en una GPU de 24 GB y ofrecer autocompletado y generacion de codigo sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Agentes autonomos de multiples pasos: el soporte de MTP y el tag agent permiten construir pipelines donde el modelo planifica, llama a herramientas y ejecuta acciones encadenadas con menor latencia gracias a la decodificacion especulativa.
- Analisis de documentos extensos: la ventana de contexto de hasta 1M tokens (segun el nombre del modelo) permite procesar libros, expedientes o bases de codigo completas en una sola pasada, util para resumen y extraccion de informacion.
- Atencion al cliente multilingue: los seis idiomas soportados (incluido arabe y ruso) permiten desplegar un asistente conversacional que atiende a usuarios en varios mercados con un unico modelo.
- Procesamiento de imagenes y documentos escaneados: al ser un modelo de vision con ficheros mmproj, puede emplearse para extraer informacion de capturas, formularios o diagramas combinando texto e imagen.
- Despliegue en hardware de consumo: las cuantizaciones IQ3 y Q4 caben en GPUs de 16 a 24 GB, lo que permite prototipar y ejecutar en estaciones de trabajo sin infraestructura de centro de datos.
- Generacion aumentada por recuperacion (RAG) sobre corpus grandes: el contexto largo reduce la necesidad de trocear documentos, mejorando la coherencia de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del fichero GGUF): i1-Q2_K 13,3 GB; i1-IQ3_S 15,7 GB; i1-Q3_K_M 17,3 GB; i1-IQ4_XS 19,3 GB; i1-Q4_K_M 21,8 GB; i1-Q5_K_M 25,4 GB; i1-Q6_K 29,3 GB.
- Para Q4_K_M (21,8 GB) se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4 con 24 GB) o reparto entre GPU y RAM del sistema.
- Las cuantizaciones IQ3 (15,7-15,9 GB) caben en GPUs de 16 GB como la RTX 4060 Ti 16 GB o la RTX A4000.
- Las cuantizaciones Q5 y Q6 (25,4-29,3 GB) requieren GPUs de 32 GB o superiores, como la A100 40 GB, la H100 o la RTX 5090 si dispone de suficiente memoria.
- Despliegue mediante llama.cpp (llama-cli, llama-server), y compatibilidad declarada con text-generation-inference y endpoints_compatible.
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phai-A1-35B-1M-MTP-Repacked-i1-GGUF | 35,5B (MoE) | no disponible (nombre sugiere 1M) | Apache 2.0 | GGUF | Vision, MTP, seis idiomas |
| Modelo base Phai-A1-35B-1M-MTP-Repacked | 35,5B (MoE) | no disponible | Apache 2.0 | safetensors | Sin cuantizar, referencia original |
| Versiones GGUF estaticas del mismo modelo | 35,5B (MoE) | no disponible | Apache 2.0 | GGUF | Sin imatrix, menor calidad relativa |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones de baja precision (Q2_K, IQ2, IQ1) degradan notablemente la calidad; para produccion se recomienda IQ3_S o superior.
- El modelo base no documenta en esta ficha los sesgos conocidos ni las tasas de alucinacion; deben evaluarse empiricamente antes de desplegar en produccion.
- La ventana de contexto real no esta confirmada en la informacion disponible; el nombre del modelo sugiere 1M pero no hay especificacion tecnica que lo verifique.
- El soporte de vision depende de ficheros mmproj alojados en el repositorio estatico, no en este repositorio i1-GGUF.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base original por si hubiera restricciones adicionales no reflejadas.
- El modelo no incluye el idioma espanol entre los soportados, lo que puede afectar a la calidad en castellano.
- El tamano del repositorio (279,4 GB) implica descargas parciales; hay que seleccionar la cuantizacion concreta.
- No hay benchmarks publicados que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Phai-A1-35B-1M-MTP-Repacked-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-MTP-Repacked
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Phai-A1-35B-1M-MTP-Repacked-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Phai-A1-35B-1M-MTP-Repacked-i1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
