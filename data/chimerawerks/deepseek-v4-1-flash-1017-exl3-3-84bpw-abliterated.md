# ChimeraWerks/DeepSeek-V4.1-Flash-1017-EXL3-3.84bpw-abliterated

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-3.84bpw-abliterated es una cuantización EXL3 de 3,84 bits por peso del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario ChimeraWerks. Se trata de una variante "abliterated", es decir, con la dirección de rechazo eliminada mediante una edición de rango 2 aplicada en FP32 sobre los pesos del modelo base y re-codificada a 6 bits, lo que produce un modelo sin censura alineada. El modelo base es un transformer de mezcla de expertos (MoE) de DeepSeek con 136.869.563.730 parámetros totales según los safetensors del repositorio, y esta versión está empaquetada específicamente para inferencia con ExLlamaV3 en tres NVIDIA DGX Spark con paralelismo tensorial de tres vías.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de despliegue concreta y medida para un modelo de gran tamaño en hardware de consumo profesional (DGX Spark), con cifras de prefill de hasta 3.833 tok/s y decodificación de 126 tok/s en código a un solo stream. Por otro, incluye una evaluación de fidelidad frente a los logits del modelo oficial (KL medio de 0,0784 y 92,0% de acuerdo top-1), lo que permite cuantificar la degradación introducida por la cuantización y por la edición abliterated.

El contexto configurado alcanza 1.048.576 tokens, aunque la prompt más larga medida es de 131.090 tokens. La licencia es MIT. No se dispone de información sobre la composición del dataset de entrenamiento del modelo base ni sobre los idiomas soportados en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) según tags del repositorio; detalles de capas y atención no disponibles |
| Parametros totales | 136.869.563.730 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens configurados; prompt más larga medida: 131.090 tokens |
| Tipos de cuantizacion | EXL3 a 3,8361 bpw sobre capas lineales cuantizadas; cabeza de salida excluida, a 6 bits; edición abliterated en FP32 re-codificada a 6 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (35 shards, ~274 GB), librería exllamav3 |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de mezcla de expertos según los tags del repositorio (`mixture-of-experts`). No se dispone en la información proporcionada de detalles sobre el número de capas, la dimensión oculta, el número de expertos, el mecanismo de atención ni la composición del dataset de entrenamiento del modelo original. Tampoco se documenta si hubo RLHF, DPO u otras fases de alineación en el modelo base.

La innovación técnica de esta publicación no reside en la arquitectura, sino en el proceso de cuantización y edición. La cuantización EXL3 se aplica a 3,8361 bits por peso sobre las capas lineales, dejando la cabeza de salida a 6 bits. Sobre esa base se aplica la edición de eliminación de rechazo de rango 2 de mrfakename, ejecutada en FP32 y re-codificada a 6 bits. El resultado se empaqueta para ExLlamaV3 con paralelismo tensorial de tres vías (TensorFold) sobre tres DGX Spark. El autor reporta una fidelidad media de KL 0,0784 y un 92,0% de acuerdo top-1 frente a los logits del modelo oficial, evaluados sobre 65 cortes de 2.048 tokens (133.120 posiciones) balanceados entre dominios agénticos, chat, código, SWE, matemáticas, ciencia, legal, multilingüe, contexto largo, seguridad y texto de preentrenamiento.

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo, con hasta 1.048.576 tokens configurados.
- Razonamiento con modo "thinking" activable, medido con temperatura 0,7 y esfuerzo 50 en GPQA-Diamond.
- Generación de código, evaluada con LiveCodeBench v6 (88,0%).
- Matemáticas competitivas, evaluada con AIME 2025 (97,5%).
- Conocimiento científico y de posgrado, evaluado con GPQA-Diamond (90,5%) y MMLU-Pro (88,0%).
- Seguimiento de instrucciones, evaluado con IFEval (88,7%).
- Comportamiento sin rechazo: 0 de 100 prompts dañinos de HarmBench rechazados (98 respondidos, 2 parciales) y 0 de 250 prompts seguros de XSTest rechazados por completo (61 parciales).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de inferencia de gran modelo en clústeres pequeños de DGX Spark: la receta de tres nodos con paralelismo tensorial de tres vías y ExLlamaV3 permite servir un MoE de 136.869 millones de parámetros con prefill de 3.560 a 3.833 tok/s y un tiempo hasta el primer token de 1,32 s para 4.115 tokens de prompt y 35,40 s para 131.090 tokens. Es adecuado cuando se dispone de tres DGX Spark y se necesita contexto largo sin infraestructura de centro de datos.

- Procesamiento de documentos extensos y análisis de contexto largo: con 1.048.576 tokens configurados y un prefill medido de 3.721 tok/s a 128K, el modelo puede ingerir contratos, expedientes o bases de código completas en una sola pasada. El dominio legal está incluido explícitamente en el conjunto de evaluación de fidelidad.

- Generación de código en pipelines internos: con 125,7 tok/s por petición en modo greedy a un solo stream y 49,0 tok/s a cuatro peticiones concurrentes, es viable para autocompletado, generación de tests y revisión de parches en entornos de desarrollo con varias solicitudes simultáneas.

- Asistentes conversacionales de alto rendimiento: el modo prosa greedy alcanza 84,3 tok/s a un stream y 263 tok/s agregados a 16 streams, con un tiempo hasta el primer token estable de 27 a 59 ms en todas las cargas. Esto lo hace adecuado para atención al cliente o asistentes internos con múltiples usuarios concurrentes.

- Investigación sobre alineación y rechazo: al estar abliterated y documentar métricas de rechazo (0/100 en HarmBench, 0/250 en XSTest con 61 parciales), sirve como material de estudio controlado sobre el efecto de la eliminación de la dirección de rechazo en modelos grandes, comparando con el modelo base y con otras variantes cuantizadas del mismo autor.

- Evaluación de fidelidad de cuantizaciones: el repositorio publica KL medio, acuerdo top-1 y percentil 99 de KL frente a los logits oficiales, lo que permite usar este modelo como referencia para medir el impacto de otras cuantizaciones o ediciones sobre el mismo modelo base.

- Razonamiento científico y matemático asistido: con 97,5% en AIME 2025 y 90,5% en GPQA-Diamond en modo thinking, es adecuado para herramientas internas de resolución de problemas técnicos donde se requiere cadena de razonamiento explícita y se dispone de la latencia adicional del modo thinking (68,6 tok/s en prosa a un stream frente a 84,3 en greedy).

## Benchmarks y rendimiento

| Suite | Configuración | Resultado |
|---|---|---|
| GPQA-Diamond (EvalScope) | 198 preguntas × 8 repeticiones, thinking on (effort 50), temperature 1, top_k 20, límite 32K | 90,5% (1.434 de 1.584) |
| AIME 2025 | no disponible en detalle | 97,5% |
| IFEval | no disponible en detalle | 88,7% |
| LiveCodeBench v6 | no disponible en detalle | 88,0% |
| MMLU-Pro | no disponible en detalle | 88,0% |
| HarmBench (rechazos) | 100 prompts dañinos | 0 rechazados, 98 respondidos, 2 parciales |
| XSTest (rechazos) | 250 prompts seguros | 0 rechazos completos, 61 parciales |
| Fidelidad KL media vs. logits oficiales | 65 cortes × 2.048 tokens, 133.120 posiciones | 0,0784 |
| Acuerdo top-1 vs. logits oficiales | misma evaluación | 92,0% |
| KL percentil 99 | misma evaluación | 1,463 |

Rendimiento de prefill medido en 3× DGX Spark, motor `14803a3`, con sparkDash:

| Contexto | Tokens de prompt | Tiempo hasta el primer token | Prefill tok/s |
|---:|---:|---:|---:|
| 4K | 4.115 | 1,32 s | 3.560 |
| 8K | 8.215 | 2,38 s | 3.708 |
| 16K | 16.404 | 4,47 s | 3.811 |
| 32K | 32.790 | 8,72 s | 3.833 |
| 64K | 65.556 | 17,42 s | 3.800 |
| 128K | 131.090 | 35,40 s | 3.721 |

Decodificación agregada (400 tokens de salida por petición): 84 tok/s en prosa greedy y 126 tok/s en código greedy a un stream; 263 tok/s en prosa greedy y 254 tok/s en código greedy a 16 streams. En modo thinking: 69 tok/s en prosa y 86 tok/s en código a un stream; 217 tok/s en prosa y 211 tok/s en código a 16 streams.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa aproximadamente 274 GB en 35 shards de safetensors; se requiere un total de memoria de GPU igual o superior a esa cifra para cargar los pesos en EXL3 a 3,8361 bpw.
- Configuración de referencia: tres NVIDIA DGX Spark con paralelismo tensorial de tres vías (TensorFold), que es el entorno sobre el que se midieron todos los benchmarks.
- GPU recomendadas: DGX Spark (configuración validada por el autor). No se documenta el comportamiento en A100, H100 o RTX 4090.
- Viabilidad en GPU de consumo: no disponible. El tamaño de 274 GB excede la memoria de cualquier GPU de consumo individual; no se documenta si es posible repartirlo entre varias RTX 4090.
- Opciones de despliegue: ExLlamaV3 (librería declarada, `exllamav3`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: prefill de 3.560 a 3.833 tok/s entre 4K y 128K; decodificación de 84 a 126 tok/s a un stream según modo; hasta 263 tok/s agregados a 16 streams; tiempo hasta el primer token de 27 a 59 ms en todas las cargas medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fidelidad KL vs. oficial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EXL3 3,84 bpw, abliterated) | 136.869.563.730 | 1.048.576 | 0,0784 | MIT | HuggingFace, ExLlamaV3 |
| Cuantización 3,5 bpw sin editar (LakyFx) | no disponible | no disponible | 0,0872 | no disponible | HuggingFace |
| Cuantización 3,5 bpw con edición mrfakename | no disponible | no disponible | 0,0937 | no disponible | HuggingFace |
| Cuantización 3,5 bpw con edición heretic | no disponible | no disponible | 0,1002 | no disponible | HuggingFace |
| Overlay Keys sobre 3,84 bpw | no disponible | no disponible | 0,1111 | no disponible | HuggingFace |
| Overlay Keys sobre LakyFx 3,5 bpw | no disponible | no disponible | 0,1225 | no disponible | HuggingFace |
| Keys K5 de Mia sobre LakyFx 3,5 bpw | no disponible | no disponible | 0,1234 | no disponible | HuggingFace |
| Overlay Keys sobre LibertAIDAI 3,5 bpw | no disponible | no disponible | 0,1268 | no disponible | HuggingFace |

No se dispone de datos de benchmarks de calidad para las variantes comparadas, solo de fidelidad KL. No se han identificado en la información proporcionada modelos de otras familias comparables en tamaño y contexto.

## Limitaciones y advertencias

- El modelo está abliterated: la dirección de rechazo ha sido eliminada deliberadamente, por lo que no aplica filtros de seguridad alineados. No es adecuado para aplicaciones orientadas al usuario final sin una capa de moderación externa.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de veracidad o factualidad; los benchmarks presentados miden razonamiento, código, matemáticas y seguimiento de instrucciones, no calibración factual.
- Sesgos conocidos: no se documenta ninguna evaluación de sesgos demográficos, sociales o culturales en la información proporcionada.
- Idiomas soportados: no disponible. No se ha publicado una evaluación multilingüe específica, aunque el conjunto de fidelidad incluye texto multilingüe.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones que regulen contenido generado.
- La edición abliterated introduce una degradación medible: el KL medio de 0,0784 frente al modelo oficial es mayor que el de la cuantización sin editar a 3,5 bpw (0,0872), aunque el autor atribuye la mejora a la mezcla de 3,84 bpw; el percentil 99 de KL es 1,463, lo que indica colas de divergencia en algunas posiciones.
- El contexto máximo medido es de 131.090 tokens, muy por debajo de los 1.048.576 configurados; no hay validación publicada del comportamiento más allá de esa longitud.
- El despliegue está validado únicamente en ExLlamaV3 sobre tres DGX Spark; no se documenta su funcionamiento en otros motores ni en otras topologías de GPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 31 de octubre de 2026; se trata de una publicación muy reciente sin validación independiente por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ChimeraWerks/DeepSeek-V4.1-Flash-1017-EXL3-3.84bpw-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de serving y benchmarks: https://github.com/ChimeraWerks/DeepSeek-V4.1-Flash-1017-3x-DGX-Spark-TP3-TensorFold-abliterated
- Benchmarks detallados: https://github.com/ChimeraWerks/DeepSeek-V4.1-Flash-1017-3x-DGX-Spark-TP3-TensorFold-abliterated/blob/main/benchmarks/README.md
- Fidelidad v1: https://github.com/ChimeraWerks/DeepSeek-V4.1-Flash-1017-3x-DGX-Spark-TP3-TensorFold-abliterated/blob/main/benchmarks/v1/fidelity.csv
- Logits del modelo profesor: https://huggingface.co/brandonmusic/DeepSeek-V4.1-Flash-1017-Teacher-Logits
- Edición abliterated de referencia: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
- Herramienta de medición sparkDash: https://github.com/MiaAI-Lab/sparkDash
- EvalScope: https://github.com/modelscope/evalscope
