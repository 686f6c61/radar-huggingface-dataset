# mradermacher/WF02-DeepSeek-R1-7B-GGUF

## Resumen

WF02-DeepSeek-R1-7B-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Wood0529/WF02-DeepSeek-R1-7B, publicada por el usuario mradermacher el 22 de febrero de 2025. No se trata de un modelo original, sino de una redistribucion optimizada para inferencia local: el autor toma los pesos en precision completa del modelo base (7.612.756.480 parametros, aproximadamente 7,6 mil millones) y los convierte a distintos niveles de cuantizacion para que puedan ejecutarse con llama.cpp y herramientas compatibles. El modelo base, segun su nombre, es un ajuste fino (fine-tune) derivado de la familia DeepSeek-R1, orientada a razonamiento.

El repositorio incluye once variantes de cuantizacion que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), pasando por IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K y Q8_0, entre otras. Esta disponible unicamente en ingles y etiquetado como conversacional. La licencia no esta declarada en la informacion disponible, ni tampoco el pipeline de la libreria, lo que supone una limitacion importante a la hora de evaluar su uso en produccion.

La relevancia de esta ficha radica en que permite ejecutar un derivado de DeepSeek-R1 de ~7,6B parametros en hardware de consumo, algo imposible con las versiones completas del modelo original (que llegan a cientos de miles de millones de parametros). Sin embargo, la ausencia de model card detallada del modelo base, de benchmarks y de licencia clara obliga a tratar esta publicacion como un artefacto de conveniencia mas que como un modelo documentado de forma exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de DeepSeek-R1; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 7.612.756.480 (~7,6B) |
| Parametros activos | no aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en formato transformers/HF |
| Tamano del repositorio | 68,1 GB |
| Modelo base | Wood0529/WF02-DeepSeek-R1-7B |
| Cuantizaciones ponderadas (imatrix) | no disponibles en el momento de la publicacion |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Wood0529/WF02-DeepSeek-R1-7B. Por el nombre y el tamano (~7,6B parametros) cabe inferir que se trata de un transformer decoder-only derivado de la familia DeepSeek-R1, probablemente un ajuste fino sobre una base de ~7B, pero esta afirmacion no puede confirmarse con los datos proporcionados. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o destilacion.

La contribucion tecnica de este repositorio es exclusivamente la cuantizacion. El autor indica que se trata de cuantizaciones estaticas (quantize_version: 2, output_tensor_quantised: 1) y que no ha publicado variantes ponderadas o imatrix en el momento de la subida, aunque deja abierta la posibilidad de solicitarlas mediante una discusion comunitaria. Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor relacion calidad/tamano que las K-quants de tamano similar, segun las referencias que el propio autor enlaza (grafico de ikawrakow y notas de Artefact2). No hay innovaciones de decodificacion especulativa, atencion lineal ni modos de pensamiento documentados en esta publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento: al derivar de la familia DeepSeek-R1, es plausible que herede capacidades de razonamiento por cadena de pensamiento, aunque no se documenta explicitamente en la informacion disponible.
- Codigo y matematicas: no confirmado en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Experimentacion local con modelos de razonamiento en hardware de consumo: las variantes Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB) permiten ejecutar un derivado de DeepSeek-R1 en GPU de gama media o incluso en CPU con llama.cpp, lo que facilita probar tecnicas de prompting de razonamiento sin infraestructura cloud.
- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como conversacional y puede integrarse en interfaces de chat locales mediante llama.cpp u Ollama para validar flujos de dialogo antes de invertir en modelos mayores.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once niveles de cuantizacion, lo que permite medir empiricamente el impacto de la compresion en la calidad de las respuestas para un caso de uso concreto, usando Q2_K como limite inferior y Q8_0 o f16 como referencia.
- Educacion e investigacion sobre cuantizacion: util para estudiar como afectan los distintos esquemas (K-quants frente a IQ-quants) a la perplejidad y a la coherencia en tareas de razonamiento, siguiendo las referencias que el autor enlaza.
- Despliegue en entornos con recursos limitados: la variante Q3_K_S (3,6 GB) o Q3_K_M (3,9 GB) puede ejecutarse en equipos con 8 GB de RAM o VRAM, adecuada para demos offline o entornos embebidos.
- Generacion de texto por lotes en ingles: con Q8_0 (8,2 GB) se obtiene una calidad cercana a la del modelo original para tareas de resumen, reescritura o clasificacion simple, siempre que el caso de uso tolere la ausencia de garantias de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para el modelo base ni para las cuantizaciones. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q3_K_M ~3,9 GB; Q3_K_L ~4,2 GB; IQ4_XS ~4,3 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_S ~5,4 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. A estas cifras conviene anadir margen para el contexto y el runtime (tipicamente 1-2 GB adicionales).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB o superior puede alojar comodamente hasta Q8_0; una RTX 4090 (24 GB) permite f16 sin problemas. Para A100 o H100 no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: si. Las variantes Q4_K_M y Q5_K_M encajan en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, etc.) con contexto moderado; Q2_K y Q3_K_S pueden ejecutarse en equipos con 6 GB o incluso en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM ni TGI en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WF02-DeepSeek-R1-7B-GGUF (este) | ~7,6B | no disponible | no disponible | GGUF | Cuantizaciones estaticas, solo ingles |
| DeepSeek-R1-Distill-Qwen-7B (referencia de la familia) | ~7,6B | no disponible en esta ficha | MIT (segun publicaciones habituales de DeepSeek) | safetensors, GGUF (via terceros) | Destilado oficial de DeepSeek; licencia y documentacion mas claras |
| Mistral-7B-Instruct (referencia de tamano similar) | ~7,2B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Modelo ampliamente documentado y con ecosistema maduro |
| Qwen2.5-7B-Instruct (referencia de tamano similar) | ~7,6B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Multilingue y con benchmarks publicados |

La comparativa se ofrece a titulo orientativo: los datos de los modelos alternativos no provienen de la informacion proporcionada en esta ficha y deben verificarse en sus respectivas model cards. La principal desventaja de este repositorio frente a las alternativas es la ausencia de licencia declarada y de documentacion del modelo base.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Esto es un bloqueante para produccion hasta que se aclare.
- Modelo base poco documentado: Wood0529/WF02-DeepSeek-R1-7B no incluye en la informacion disponible detalles de entrenamiento, dataset ni evaluacion, lo que impide auditar sesgos o calidad.
- Solo ingles: la etiqueta de idioma es `en`; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y agravado por la falta de benchmarks que permitan calibrar su fiabilidad.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas por el autor como de calidad inferior; su uso en tareas de razonamiento puede degradar notablemente los resultados.
- Sin cuantizaciones imatrix: el autor no las ha publicado, por lo que no se dispone de las variantes de mayor calidad por tamano que suele ofrecer este formato.
- Repositorio de 68,1 GB: descargar el repo completo es costoso; conviene bajar solo el archivo GGUF de la cuantizacion deseada.
- Fecha de actualizacion futura (2026-11-10): la marca temporal de actualizacion es posterior a la fecha actual, lo que sugiere un posible error de metadatos en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/WF02-DeepSeek-R1-7B-GGUF
- Modelo base: https://huggingface.co/Wood0529/WF02-DeepSeek-R1-7B
- Pagina de conveniencia del autor para este modelo: https://hf.tst.eu/model#WF02-DeepSeek-R1-7B-GGUF
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
