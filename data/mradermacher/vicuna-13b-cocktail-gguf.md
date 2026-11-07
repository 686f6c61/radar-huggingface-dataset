# mradermacher/vicuna-13b-cocktail-GGUF

## Resumen

`mradermacher/vicuna-13b-cocktail-GGUF` es una distribucion de cuantizaciones estaticas en formato GGUF del modelo `reeducator/vicuna-13b-cocktail`, un fine-tuning de Vicuna 13B orientado a conversacion y roleplay. El autor de las cuantizaciones es mradermacher, un conocido publicador de pesos GGUF para llama.cpp, mientras que el modelo base procede de reeducator. El repositorio se publico el 24 de febrero de 2025 y contiene once variantes de cuantizacion que van desde Q2_K (5,0 GB) hasta Q8_0 (13,9 GB).

El modelo subyacente es un transformer decoder-only de 13.015.864.320 parametros (13B) derivado de la familia Vicuna/Llama, ajustado sobre una mezcla de datasets conversacionales: ShareGPT_Vicuna_unfiltered (en dos variantes), bluemoon_roleplay_300k_vicuna, GPTeacher-Vicuna, SuperCOT-vicuna-dataset y Vicuna_Evol_Instruct_Cleaned. El resultado es un modelo afinado para dialogo multi-turno, instrucciones y escenarios de roleplay en ingles.

La relevancia practica de este repositorio es de infraestructura: permite ejecutar un modelo de 13B en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de GPUs de datacenter. No aporta innovaciones arquitectonicas propias; su valor esta en la disponibilidad de pesos cuantizados listos para desplegar y en el ecosistema de herramientas compatible con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Vicuna/Llama) |
| Parametros totales | 13.015.864.320 (13B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 88,8 GB (todas las cuantizaciones) |
| Modelo base | reeducator/vicuna-13b-cocktail |
| Autor de las cuantizaciones | mradermacher |
| Fecha de creacion | 2025-02-24 |
| Descargas | 117 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 13B parametros perteneciente a la estirpe Vicuna, que a su vez deriva de Llama y fue originalmente afinado por LMSYS sobre conversaciones de ShareGPT. Sobre esa base, reeducator aplico un ajuste adicional con una mezcla de seis datasets: `anon8231489123/ShareGPT_Vicuna_unfiltered`, `gozfarb/ShareGPT_Vicuna_unfiltered`, `gozfarb/bluemoon_roleplay_300k_vicuna`, `gozfarb/GPTeacher-Vicuna`, `gozfarb/SuperCOT-vicuna-dataset` y `gozfarb/Vicuna_Evol_Instruct_Cleaned`. Esta combinacion cubre dialogo general, instrucciones sinteticas, razonamiento estilo chain-of-thought (SuperCOT) e instrucciones evolutivas, con un peso notable de roleplay.

No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset, ni si se aplicaron tecnicas de RLHF o DPO en la fase de reeducator. La model card del repositorio de cuantizacion no documenta innovaciones tecnicas adicionales: se limita a describir el proceso de cuantizacion estatica (convert_type: hf, quantize_version: 2) y a remitir a los cuants ponderados/imatrix publicados en un repositorio hermano (`mradermacher/vicuna-13b-cocktail-i1-GGUF`).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Seguimiento de instrucciones y respuesta a prompts de formato instruct.
- Roleplay y personificacion, reforzado por el dataset `bluemoon_roleplay_300k_vicuna`.
- Razonamiento explicito estilo chain-of-thought, gracias a `SuperCOT-vicuna-dataset`.
- Respuestas a preguntas de conocimiento general y tareas de estilo GPT (GPTeacher).
- Capacidad limitada de generacion de codigo y matematicas, heredada de Vicuna, sin garantias especificas documentadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni multi-step reasoning estructurado.
- No dispone de vision, audio ni modo thinking explicito.
- Multilingue: solo ingles declarado; el rendimiento en castellano no esta verificado.

## Casos de uso

- Roleplay y compania conversacional: el modelo se entreno con un dataset especifico de roleplay (300k ejemplos), por lo que es adecuado para chatbots de personajes con consistencia de persona en conversaciones largas.
- Prototipado de asistentes conversacionales en local: al caber en GPUs de consumo con cuantizaciones Q4_K_M (8,0 GB), permite iterar sobre prompts y flujos de dialogo sin coste de API.
- Generacion de respuestas estilo instruct en pipelines de datos: util para aumentar datasets de instrucciones en ingles con un modelo de 13B ejecutable en una sola GPU.
- Educacion y tutoria en ingles: su entrenamiento con SuperCOT favorece explicaciones paso a paso en tareas de razonamiento basico.
- Experimentacion academica con cuantizacion: el repositorio ofrece once variantes del mismo modelo, lo que permite estudiar el impacto de la cuantizacion en la calidad de salida con un control directo de la variable.
- Despliegue en entornos con recursos limitados: mediante llama.cpp u Ollama se puede servir en estaciones de trabajo sin GPU dedicada usando la variante Q2_K o Q3_K_S (5,0-5,8 GB).
- Base para fine-tuning posterior: al ser un modelo pequeno y con pesos publicos, sirve como punto de partida para ajustes especificos de dominio en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni para el modelo base ni para las variantes cuantizadas.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~5,0 GB, Q3_K_S ~5,8 GB, Q3_K_M ~6,4 GB, Q3_K_L ~7,0 GB, IQ4_XS ~7,1 GB, Q4_K_S ~7,5 GB, Q4_K_M ~8,0 GB, Q5_K_S ~9,1 GB, Q5_K_M ~9,3 GB, Q6_K ~10,8 GB, Q8_0 ~13,9 GB. A estas cifras hay que sumar el overhead de contexto y del runtime (tipicamente 1-2 GB adicionales).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 para cuantizaciones medias y altas; A100 o H100 solo si se busca throughput alto con Q8_0 o el modelo sin cuantizar.
- Cabe en GPU de consumo: si. Q4_K_M (8,0 GB) encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores. Q8_0 (13,9 GB) requiere 16 GB o mas de VRAM, o bien descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio declara `endpoints_compatible` en sus tags.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para estas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/vicuna-13b-cocktail-GGUF | 13B | no disponible | GGUF | no disponible | Cuantizaciones estaticas de un fine-tuning de Vicuna con roleplay |
| TheBloke/vicuna-13B-v1.5-16K-GGUF | 13B | 16K | GGUF | no disponible | Cuantizaciones del Vicuna oficial de LMSYS con contexto extendido |
| lmsys/vicuna-13b-v1.5 | 13B | 4K (16K en variante) | safetensors | no comercial (Llama 2) | Modelo original de referencia de la familia Vicuna |

La comparativa se limita a la familia Vicuna porque no se dispone de datos de rendimiento del modelo evaluado que permitan contrastarlo con alternativas de otros linajes. El modelo de TheBloke ofrece contexto documentado de 16K, mientras que para este repositorio no se especifica la longitud de contexto; el original de LMSYS sirve como referencia de calidad sin cuantizar.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el comportamiento en castellano no esta verificado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos de 13B de la generacion Vicuna, especialmente en tareas factuales y matematicas.
- Sesgos conocidos: al entrenarse sobre ShareGPT y datasets sinteticos, puede reproducir sesgos de esos corpus, no documentados por el autor.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. El modelo base hereda restricciones de la familia Llama, por lo que conviene verificar la licencia del modelo original antes de usarlo en produccion.
- La longitud de contexto no esta documentada en el repositorio; asumir el contexto de Vicuna (4K por defecto) salvo verificacion empirica.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan la coherencia; el propio autor marca Q3_K_M como "lower quality".
- El repositorio tiene 117 descargas y 0 likes, lo que indica una adopcion muy baja y ausencia de validacion comunitaria.
- No se documenta soporte de tool calling, agentes ni modo thinking; no es adecuado para pipelines que requieran estas capacidades.
- El modelo base es de 2023 y ha sido superado ampliamente por modelos mas recientes del mismo tamano en razonamiento y codigo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/vicuna-13b-cocktail-GGUF
- Modelo base: https://huggingface.co/reeducator/vicuna-13b-cocktail
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/vicuna-13b-cocktail-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#vicuna-13b-cocktail-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Vicuna 13B v1.5 16K en GGUF (referencia): https://huggingface.co/TheBloke/vicuna-13B-v1.5-16K-GGUF
