# mradermacher/Inkling-2-Mini-Derisked-i1-GGUF

## Resumen

Inkling-2-Mini-Derisked-i1-GGUF es una coleccion de cuantizaciones GGUF, generadas con imatrix, del modelo Blackfrost-AI/Inkling-2-Mini-Derisked. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y esta pensado para ejecutar el modelo en llama.cpp y entornos compatibles con GGUF, no como un modelo original. El repositorio incluye el fichero imatrix y un conjunto amplio de cuantizaciones que van desde IQ1_S hasta Q6_K, lo que permite ajustar el modelo a distintos niveles de VRAM.

El modelo base es un transformer conversacional de aproximadamente 26.070 millones de parametros (26,07 B), orientado a ingles y distribuido bajo licencia "other". La model card etiqueta el modelo con terminos como loop-transformer, dspark, speculative-decoding y mtp, lo que sugiere el uso de tecnicas de decodificacion especulativa y prediccion multi-token, aunque no se detalla su implementacion. El sufijo "Derisked" indica una variante afinada o modificada por Blackfrost-AI sobre un modelo previo, pero no se documenta el proceso concreto.

La relevancia de este repositorio es practica: ofrece una via para desplegar un modelo de 26 B en hardware de consumo mediante cuantizaciones agresivas, manteniendo la posibilidad de usar cuantizaciones de mayor calidad (Q5_K_M, Q6_K) en GPUs profesionales. No obstante, la informacion publicada es escasa: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento y la licencia "other" exige revisar los terminos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer conversacional (etiquetado como loop-transformer, con speculative-decoding y mtp segun tags) |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, mas fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones generadas con imatrix); el modelo base usa safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags de la model card mencionan "loop-transformer", "dspark", "speculative-decoding" y "mtp" (multi-token prediction), lo que apunta a un transformer con mecanismos de decodificacion especulativa y prediccion de multiples tokens por paso, tecnicas orientadas a reducir latencia en inferencia. No se especifica si incorpora atencion lineal, mezcla de expertos u otras variantes.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El termino "Derisked" en el nombre sugiere una intervencion de seguridad o alineacion por parte de Blackfrost-AI, pero no se aporta ningun detalle sobre el metodo. Las cuantizaciones de este repositorio se han generado con imatrix ponderada, un procedimiento que calibra los pesos de cuantizacion con datos representativos para reducir la perdida de calidad en cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag "conversational".
- Razonamiento multi-turno, aunque sin datos publicados sobre su calidad.
- Posible soporte de decodificacion especulativa y prediccion multi-token (tags "speculative-decoding" y "mtp"), que mejorarian el throughput si el runtime lo aprovecha.
- Capacidad de vision indicada en la model card del cuantizador ("This is a vision model"), si bien los ficheros mmproj, de existir, estarian en el repositorio estatico, no en este.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local de un modelo de 26 B en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M o IQ4_XS permiten cargar el modelo en GPUs de 16-24 GB, util para prototipado y pruebas offline sin depender de APIs.
- Asistentes conversacionales en ingles para entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, los datos no salen del equipo, adecuado para documentacion interna o soporte tecnico confidencial.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye desde IQ1_S hasta Q6_K, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad de respuesta sobre un mismo modelo base.
- Generacion de texto en pipelines por lotes: con vLLM o llama.cpp server se puede exponer una API compatible con OpenAI para tareas de resumen, reescritura o clasificacion de documentos en ingles.
- Investigacion sobre decodificacion especulativa: si el runtime soporta las tecnicas etiquetadas (speculative-decoding, mtp), el modelo sirve como banco de pruebas para medir aceleraciones de inferencia.
- Fine-tuning posterior sobre GGUF: aunque el formato GGUF no es ideal para entrenamiento, las cuantizaciones Q6_K o Q5_K_M permiten validar rapidamente un modelo afinado antes de convertirlo a otros formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un modelo de 26 B en FP16 requiere aproximadamente 52 GB; en Q8_0, unos 28 GB; en Q6_K, unos 22 GB; en Q5_K_M, unos 19 GB; en Q4_K_M, unos 16 GB; en IQ3_M, unos 12 GB; en IQ2_M, unos 9 GB; en IQ1_S, unos 7 GB (estimaciones a partir del tamano del modelo, no confirmadas por el autor).
- GPUs recomendadas: A100 80 GB o H100 para FP16 y cuantizaciones altas con contexto largo; RTX 4090 (24 GB) para Q5_K_M o Q6_K; RTX 4080/3090 (16-24 GB) para Q4_K_M; GPUs de 12 GB para IQ3_M o Q3_K_M.
- Cabe en GPU de consumo: si, en RTX 4090, 4080, 3090, 3080 y modelos con 12 GB o mas segun cuantizacion; las cuantizaciones IQ1/IQ2 permiten incluso GPUs de 8 GB, con perdida de calidad apreciable.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), servidores compatibles con la API de OpenAI mediante llama.cpp server; vLLM y TGI no consumen GGUF de forma nativa, requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y el soporte de decodificacion especulativa en el runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked (este) | 26,07 B | no disponible | other | GGUF (imatrix) | Solo ingles; sin benchmarks publicados |
| Mistral Small 24B | 24 B | 128k (segun version) | Apache 2.0 | safetensors, GGUF | Multilingue, benchmarks publicados; alternativa consolidada en tamano similar |
| Gemma 2 27B | 27 B | 8k | Gemma license | safetensors, GGUF | Multilingue, benchmarks publicados; requiere aceptar terminos |
| Qwen2.5 32B | 32,5 B | 128k | Apache 2.0 | safetensors, GGUF | Multilingue, fuerte en codigo y matematicas; algo mayor en parametros |

La comparacion con Mistral Small, Gemma 2 y Qwen2.5 es orientativa por tamano; no se dispone de datos de rendimiento de Inkling-2-Mini-Derisked para una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles segun el campo language; no se debe asumir calidad en castellano u otros idiomas.
- No hay benchmarks ni evaluaciones publicadas: el rendimiento real frente a modelos de tamano similar es desconocido.
- La licencia "other" obliga a revisar los terminos del modelo base (Blackfrost-AI/Inkling-2-Mini-Derisked) antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Riesgo de alucinacion inherente a los modelos generativos; sin datos de alineacion no se puede estimar su magnitud.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- El repositorio contiene principalmente el fichero imatrix y cuantizaciones; los ficheros mmproj para vision, si existen, estarian en el repositorio estatico del mismo autor, no en este.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se documenta la longitud de contexto; planificar el despliegue sin asumir ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Inkling-2-Mini-Derisked-i1-GGUF
- Modelo base: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Inkling-2-Mini-Derisked-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Inkling-2-Mini-Derisked-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
