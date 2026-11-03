# bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw es una cuantización de 2,5 bits por peso (bpw) del checkpoint original DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario bertholomus (BertholomusAI) bajo licencia MIT. El modelo base es un transformer multimodal de tipo mixture-of-experts (MoE) con 92.269.315.410 parámetros totales, orientado a tareas image-text-to-text y con capacidad de tool calling, razonamiento multi-paso y decodificación especulativa mediante un drafter MTP/DSpark. La cuantización emplea el formato EXL3 de ExLlamaV3 y está dimensionada específicamente para servirse en dos nodos GB10 (clase DGX Spark) con paralelismo tensorial 2 sobre RDMA.

El interés de esta ficha reside en que demuestra la viabilidad de servir un modelo MoE de más de 92.000 millones de parámetros en hardware de clase workstation compacta, a costa de una pérdida de fidelidad medible frente al checkpoint original. El autor documenta métricas de divergencia (KL y acuerdo top-1) sobre un conjunto de 122 filas y 294.481 tokens, además de resultados de velocidad en la configuración de referencia: hasta 199,1 tok/s agregados con 16 streams sostenidos y 2.500 tok/s de prefill en prompts de 64K-128K tokens. La ventana de contexto servida alcanza 1.048.576 tokens por petición dentro de una ventana compartida de 2.097.152 posiciones.

No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de despliegue. Por tanto, sus capacidades funcionales son las del modelo base DeepSeek-V4.1-Flash-1017, mientras que sus especificaciones propias son las de la cuantización (bits por componente, tamaño del repo de 184,7 GB, requisitos de hardware y mermas de calidad). La licencia MIT del checkpoint original se hereda, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con drafter MTP/DSpark y compresor KV; cuantizado en formato EXL3 |
| Parametros totales | 92.269.315.410 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por petición; ventana compartida de 2.097.152 posiciones en la configuración servida |
| Tipos de cuantizacion | EXL3 2,5 bpw (expertos enrutados); EXL3 4 bpw hq (atención, expertos compartidos, compresor KV, queries del indexer, proyección clave/valor de Engram); EXL3 8 bpw (claves del indexer); EXL3 6 bpw (cabeza de salida); EXL3 4 bpw y 6 bpw en el drafter MTP/DSpark; 16 bits sin cambios (embeddings, router gates, norms, cabeza markov del drafter, vision tower y aligner). Global: 2,52 bpw sobre los pesos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), librería exllamav3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint DeepSeek-V4.1-Flash-1017: un transformer MoE con atención, expertos compartidos, un compresor KV, un indexer con claves y queries propias, tablas Engram con proyección clave/valor y una torre de visión con aligner para entrada de imágenes. Incluye además un drafter MTP/DSpark con cabeza markov para decodificación especulativa. Esta ficha no dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original; esa información corresponde a la model card de DeepSeek y no se ha proporcionado.

El proceso de cuantización sí está documentado con detalle. Se realizó con ExLlamaV3 1.6.0 y el soporte de DeepSeek-V4 de Fabiano Anemone (pull request 449 de turboderp-org/exllamav3), más cuatro modificaciones propias del autor: propagación del estado del modelo entre módulos para cada fila de calibración, cuantización de las claves del indexer y de la proyección clave/valor de Engram, un fallback en el loader y tratamiento de un experto enrutado que ningún token de calibración alcanzó (se cuantiza sin calibración). Se usó codebook mul1 y una calibración de 192 filas × 2.048 tokens. Las tablas Engram no se incluyen en el repositorio: deben servirse desde los shards 47 y 48 del checkpoint original. El repositorio no incluye plantilla de chat; la receta de despliegue añade una propia mediante `tools/serving_1017.py`, junto con seis tensores auxiliares.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Entrada de imágenes (pipeline image-text-to-text), con torre de visión y aligner conservados en 16 bits.
- Tool calling forzado y automático: el autor reporta 16/16 en las pruebas de la configuración servida.
- Salida estructurada: 11/11 en las pruebas, con resultados equivalentes en ráfagas y en ejecución individual.
- Decodificación especulativa con drafter MTP/DSpark, que acelera la generación en la configuración de referencia.
- Contexto largo extremo: agujas recuperadas 3/3 en un prompt de 1.039.836 tokens, con reanudación desde estado conservado a 1.038.336 tokens.
- Procesamiento concurrente: 16 streams simultáneos con resultados equivalentes a ejecución individual (réplicas en ráfaga y escalonadas idénticas).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica extensa: con 1.048.576 tokens de contexto por petición, el modelo puede ingerir repositorios completos, manuales o expedientes y responder preguntas sobre ellos sin trocear el material, usando el modo de reanudación desde estado conservado para conversaciones largas.
- Agentes de automatización con tool calling: las pruebas de la configuración servida validan llamadas forzadas y automáticas, lo que permite integrar el modelo en orquestadores que consulten APIs, bases de datos o sistemas internos. Conviene usar la cuantización de 4,0 bpw si la fidelidad en turnos de tool call es crítica, dado el mayor KL observado a 2,5 bpw en esa categoría.
- Asistencia sobre imágenes en flujos de trabajo: al conservar la torre de visión en 16 bits, puede emplearse para extraer información de capturas, diagramas o documentos escaneados y combinarla con texto en la misma conversación.
- Generación de código en pipelines internos: el KL de 0,0494 y el acuerdo top-1 de 95,22 % en código son los mejores resultados por categoría a 2,5 bpw, lo que hace aceptable esta cuantización para autocompletado, revisión y generación de tests, no así para tareas donde un solo token erróneo sea crítico.
- Servicio multiusuario en hardware compacto: con 16 streams sostenidos y 199,1 tok/s agregados en dos nodos GB10, es viable montar un endpoint interno para un equipo pequeño, con 2.500 tok/s de prefill que mantienen la latencia de entrada incluso con prompts de 128K.
- Procesamiento por lotes de prompts largos: cuatro prompts de 159.925 tokens simultáneos produjeron las mismas respuestas que en ejecución individual desde arranque en frío (5/5), lo que permite paralelizar análisis de contratos, informes o transcripciones sin degradar la calidad.
- Salida estructurada para extracción de datos: los 11/11 en structured output permiten usarlo como extractor de campos con esquemas JSON en procesos ETL, con la cautela de validar el esquema en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí documenta métricas de fidelidad de la cuantización frente al checkpoint original y velocidades de servicio en su configuración de referencia.

Fidelidad frente al checkpoint original (KL y acuerdo top-1, intervalos bootstrap al 95 %):

| Cuantizacion | KL corto | Top-1 corto | KL largo | Top-1 largo | KL wiki | Top-1 wiki |
|---|---|---|---|---|---|---|
| 2,5 bpw (esta) | 0,1305 [0,1209, 0,1406] | 92,01 % [91,10, 92,85] | 0,2876 [0,0652, 0,6093] | 87,07 % [76,31, 94,65] | 0,1558 [0,1428, 0,1695] | 87,41 % [86,05, 88,83] |
| 4,0 bpw (referencia) | 0,0331 [0,0312, 0,0351] | 96,17 % [95,76, 96,55] | 0,1202 [0,0113, 0,2817] | 92,31 % [84,19, 97,47] | 0,0374 [0,0341, 0,0410] | 93,90 % [93,07, 94,74] |

Desglose por tipo de contenido a 2,5 bpw (KL / top-1): código 0,0494 / 95,22 %; matemáticas 0,1425 / 91,51 %; prosa 0,1254 / 91,77 %; escritura creativa 0,0623 / 91,09 %; tool calls 0,5948 / 79,43 %. A 4,0 bpw: código 0,0097 / 97,80 %; matemáticas 0,0391 / 95,74 %; prosa 0,0248 / 96,50 %; creativa 0,0109 / 96,02 %; tool calls 0,1951 / 87,77 %.

Velocidad en la configuración servida (tok/s, greedy, drafting DSpark, mediana de 3 salvo indicación):

| Escenario | tok/s |
|---|---|
| Decode, un stream: código / prosa / estructurado (512 tokens) | 105,7 / 60,3 / 118,9 |
| 2 y 4 streams simultáneos, agregado (mediana de 9) | 95,3 y 136,4 |
| 4 streams sostenidos 90 s, agregado | 152,0 |
| 8 streams sostenidos 90 s, agregado | 171,6 |
| 16 streams sostenidos 90 s, agregado | 199,1 |
| Prefill 8K / 32K / 64K / 128K | 2.428 / 2.498 / 2.533 / 2.500 |
| Prefill 93.335 tokens | 2.355 |
| Decode tras prompt de 128K (tres prompts fijos) | 98,8 |

## Requisitos de hardware

- Tamaño del repositorio: 184,7 GB, lo que exige almacenamiento NVMe y memoria agregada suficiente para cargar los pesos cuantizados más las tablas Engram servidas desde los shards 47 y 48 del checkpoint original.
- Configuración de referencia del autor: dos nodos GB10 (clase DGX Spark) con paralelismo tensorial 2 sobre RDMA mediante TensorFold. No se documenta una configuración de un solo nodo ni de GPU consumer.
- VRAM estimada: no disponible de forma explícita; por el tamaño del repo y el formato EXL3, la inferencia requiere del orden de 185 GB de memoria agregada, lo que descarta GPU consumer individuales.
- GPU recomendadas: GB10 (DGX Spark) en pares, según la receta. Para la cuantización de 4,0 bpw el autor menciona cuatro nodos.
- Cabe en consumer GPU: no consta; con 92.269 millones de parámetros y 184,7 GB de pesos, no es viable en una RTX 4090 ni en configuraciones de 24-48 GB.
- Opciones de despliegue: ExLlamaV3 1.6.0 con soporte DeepSeek-V4 (PR 449) y el motor TensorFold (ashhart) con paralelismo tensorial 2. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: ver tabla de benchmarks; decode de 60,3 a 118,9 tok/s por stream según contenido, prefill estable en torno a 2.400-2.500 tok/s hasta 128K, y hasta 199,1 tok/s agregados con 16 streams.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw (esta) | 92.269 M | 1.048.576 por petición | MIT | EXL3, ExLlamaV3 + TensorFold, 2× GB10 | KL corto 0,1305; top-1 92,01 % |
| DeepSeek-V4.1-Flash-1017-EXL3-4.0bpw | no disponible | no disponible | MIT | EXL3, 4 nodos según el autor | KL corto 0,0331; top-1 96,17 %; mejor para tool calls |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | MIT | Pesos FP8/FP4 originales | Referencia de fidelidad; sin datos de despliegue en esta información |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad medible: KL corto de 0,1305 y top-1 de 92,01 % frente al original; en prompts largos el KL sube a 0,2876 con intervalo amplio [0,0652, 0,6093], lo que indica alta varianza.
- Tool calls es la categoría más degradada: KL 0,5948 y top-1 79,43 %. Para agentes que dependan de llamadas precisas, el autor recomienda la cuantización de 4,0 bpw.
- El repositorio no incluye plantilla de chat; es necesario aplicar la de la receta (`tools/serving_1017.py`) y añadir seis tensores auxiliares con nombres y tipos concretos, o el motor no funcionará correctamente.
- Las tablas Engram no están en el repositorio: hay que servirlas desde los shards 47 y 48 del checkpoint original, lo que añade una dependencia externa al despliegue.
- Un experto enrutado se cuantizó sin calibración (ningún token de calibración lo alcanzó), lo que puede introducir errores localizados no medidos en el informe.
- El hardware de referencia son dos nodos GB10 con RDMA; no se documenta funcionamiento en GPU consumer ni en un solo nodo, y el formato EXL3 limita las opciones de servidor.
- Sesgos conocidos, riesgo de alucinación específico e idiomas soportados: no disponibles en la información proporcionada; deben consultarse en la model card del checkpoint original.
- Licencia MIT heredada del modelo base, sin restricciones comerciales adicionales conocidas; el autor declara no estar afiliado ni respaldado por DeepSeek.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Cuantización de 4,0 bpw del mismo autor: https://huggingface.co/bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-4.0bpw
- Receta de despliegue (v0.7.4): https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10
- Resultados de velocidad: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10/tree/v0.7.4/results/served-v074/rows/
- Informe de KL: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10/blob/v0.7.4/results/served-v070/kl-report.md
- Pull request de soporte DeepSeek-V4 en ExLlamaV3: https://github.com/turboderp-org/exllamav3/pull/449
- Perfil del colaborador Fabiano Anemone: https://github.com/anoane
