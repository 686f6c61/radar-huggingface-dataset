# mradermacher/Chatty-Harry_V2.0-GGUF

## Resumen

Chatty-Harry_V2.0-GGUF es la distribucion en formato GGUF del modelo Chatty-Harry_V2.0, un merge de modelos (mergekit) publicado por el usuario Triangle104 y cuantizado por mradermacher. El modelo cuenta con 12.247.782.400 parametros totales (aproximadamente 12,2 mil millones) y esta orientado a conversacion en ingles. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que se trata de una cuantizacion estatica de un modelo derivado de un merge, no de un modelo original con model card tecnica detallada. Esto implica que no hay informacion publicada sobre arquitectura interna, datos de entrenamiento, contexto maximo ni benchmarks. El valor practico esta en la disponibilidad de multiples cuantizaciones GGUF (desde Q2_K hasta Q8_0) que permiten desplegar un modelo de 12B en hardware de consumo.

El repositorio tiene 64 descargas y 1 like en el momento de la consulta, lo que indica una adopcion muy baja. El tamano total del repositorio es de 84,7 GB, correspondiente al conjunto de todas las cuantizaciones incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de mergekit; presumiblemente transformer, sin confirmar) |
| Parametros totales | 12.247.782.400 (12,2B) |
| Parametros activos | no aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers library tag; repo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del modelo base Triangle104/Chatty-Harry_V2.0. Los tags del repositorio indican `mergekit` y `merge`, lo que confirma que el modelo original se genero mediante fusion de modelos (model merging) con la herramienta mergekit. Sin embargo, no se especifica que modelos se fusionaron, con que metodo (SLERP, TIES, DARE, etc.), ni los hiperparametros del merge.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion la realizo mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), y existe una variante con cuantizaciones ponderadas/imatrix en el repositorio Chatty-Harry_V2.0-i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones: no documentado explicitamente, pero esperable en un modelo de 12B orientado a chat.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de chatbots conversacionales en ingles: el modelo puede desplegarse con llama.cpp u Ollama usando las cuantizaciones Q4_K_M (7,6 GB) o Q5_K_M (8,8 GB) para iterar rapidamente sobre flujos de conversacion multi-turno sin depender de APIs externas.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_S (7,2 GB) cabe en GPUs con 8 GB de VRAM, lo que permite ejecutar un modelo de 12B en equipos de gama media para tareas de generacion de texto en local.
- Generacion de texto en entornos con requisitos de privacidad: al ser un modelo local con licencia Apache 2.0, se puede usar en pipelines internos donde los datos no deben salir de la infraestructura.
- Experimentacion con tecnicas de merging: dado que el modelo original es un merge, sirve como caso de estudio para evaluar como se comportan las fusiones de modelos tras la cuantizacion GGUF.
- Fine-tuning ligero sobre la base: al disponer del repo base en safetensors (Triangle104/Chatty-Harry_V2.0), se puede partir de los pesos originales para ajuste supervisado y luego cuantizar de nuevo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta para un modelo de 12B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q3_K_M: ~6,2 GB
  - IQ4_XS: ~6,9 GB
  - Q4_K_M: ~7,6 GB
  - Q5_K_M: ~8,8 GB
  - Q6_K: ~10,2 GB
  - Q8_0: ~13,1 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q8_0 con contexto amplio; A100/H100 solo si se necesita alto throughput en batch.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6 GB (con riesgo de calidad) hasta Q8_0 en GPUs de 16 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `transformers` sugiere compatibilidad con la libreria transformers, aunque el formato nativo del repo es GGUF.
- Latencia y throughput: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chatty-Harry_V2.0-GGUF | 12,2B | no disponible | Apache 2.0 | GGUF | Merge cuantizado, solo ingles |
| Mistral-Nemo-Instruct-2407 (GGUF) | 12B | 128K | Apache 2.0 | GGUF | Modelo original con model card completa y benchmarks |
| Gemma-2-9B-it (GGUF) | 9B | 8K | Gemma Terms | GGUF | Requiere aceptar terminos; buen rendimiento en ingles |
| Qwen2.5-14B-Instruct (GGUF) | 14,7B | 32K | Apache 2.0 | GGUF | Multilingue, con benchmarks publicados |

La comparacion se limita a tamano y licencia: no hay datos de rendimiento de Chatty-Harry_V2.0 que permitan una comparacion cuantitativa con estas alternativas. Mistral-Nemo y Qwen2.5 son opciones mas documentadas y con contexto conocido, lo que las hace preferibles para produccion si se requiere trazabilidad tecnica.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan arquitectura, datos de entrenamiento, contexto ni sesgos, lo que dificulta evaluar el modelo antes de usarlo.
- Solo soporta ingles; no se debe esperar calidad en castellano u otros idiomas.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks, no se puede estimar la fiabilidad factual del modelo.
- Modelo derivado de un merge sin trazabilidad: se desconoce que modelos se fusionaron y con que metodo, lo que complica el analisis de sesgos heredados.
- Adopcion muy baja (64 descargas, 1 like): no hay comunidad que haya reportado comportamientos en produccion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentacion sobre el origen de los datos de entrenamiento impide verificar el cumplimiento de derechos de autor o de uso de datos.
- La cuantizacion Q2_K y Q3_K_M pueden degradar notablemente la calidad; el propio autor marca Q3_K_M como "lower quality".
- No hay garantia de soporte a tool calling ni a agentes; no usarlo en pipelines que dependan de estas capacidades sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Chatty-Harry_V2.0-GGUF
- Modelo base: https://huggingface.co/Triangle104/Chatty-Harry_V2.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Chatty-Harry_V2.0-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Chatty-Harry_V2.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- mergekit: no se proporciona enlace en la informacion disponible
