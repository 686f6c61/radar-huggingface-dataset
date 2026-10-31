# mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF

## Resumen

Este modelo es una cuantización GGUF con imatrix (importancia ponderada) del modelo DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source, realizada por mradermacher, un cuantizador muy prolífico de la comunidad de Hugging Face. El modelo base es un fine-tune de un Gemma 4 de 31B parámetros en formato instruct, orientado a escritura creativa de terror, roleplaying y generación de ficción en todos los géneros, con un enfoque deliberadamente "uncensored" (sin filtros) y "abliterated" (con los mecanismos de rechazo del modelo eliminados).

La relevancia de esta ficha radica en el repositorio de cuantización: mradermacher ofrece más de 20 variantes de cuantización (desde IQ1_S de 7,3 GB hasta Q6_K y superiores), lo que permite ejecutar el modelo en hardware muy variado, desde portátiles con GPU modesta hasta estaciones de trabajo con GPU de gama alta. El modelo base incorpora, según su autor, 13 modos de razonamiento, 13 modos instruct y 10 "constructos de IA" (personajes predefinidos para simulaciones y roleplay).

Cabe destacar que se trata de un modelo marcado como "not-for-all-audiences" (no apto para todos los públicos), diseñado específicamente para ficción de terror y contenido sin moderación, por lo que su uso exige responsabilidad por parte del desarrollador. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4, arquitectura densa; no disponible detalle exacto) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no consta que sea MoE; se asume modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_M, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K (imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); tambien existe version estatica GGUF y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source, es un fine-tune de Gemma 4 31B en variante instruct. Sobre esa base se han aplicado tecnicas de "abliteration" (eliminacion de las direcciones de rechazo en el espacio de activaciones para evitar que el modelo se niegue a responder) y el metodo "Heretic" para obtener un comportamiento uncensored. El modelo base indica soporte para vision, y el repositorio de cuantizaciones estaticas incluye ficheros mmproj para esa funcionalidad.

Sobre el proceso de entrenamiento del fine-tune (numero de tokens, composicion del dataset, uso de RLHF/DPO) no hay informacion disponible en la model card. Lo que si documenta el autor son las capacidades resultantes: 13 modos de razonamiento (reasoning), 13 modos instruct, 10 "constructos de IA" para roleplay, un modo "Turbo-Brilliance Evil Ed" y un "Halloween O/S", todos orientados a escritura creativa de terror y ficcion en general.

La contribucion de mradermacher es la cuantizacion GGUF con matriz de importancia (imatrix), que calcula estadisticas de activacion sobre un dataset de calibracion para reducir la perdida de calidad en cuantizaciones agresivas (IQ1/IQ2/IQ3). Las cuantizaciones imatrix suelen superar a las estaticas equivalentes en tamano, especialmente en el rango bajo.

## Capacidades

- Generacion de texto creativo en todos los generos, con especializacion en terror, suspense y ficcion oscura (segun tags del autor: creative writing, story, fiction, all genres).
- Roleplaying y simulaciones de personajes: incluye 10 "constructos de IA" predefinidos y modos de personalidad para sims de rol.
- Razonamiento y "thinking": el autor anuncia 13 modos de razonamiento y 13 modos instruct conmutables mediante prompting.
- Vision: el modelo base se describe como vision model; los ficheros mmproj se distribuyen en el repositorio de cuantizaciones estaticas.
- Comportamiento uncensored/abliterated: sin rechazos de seguridad, diseñado para contenido adulto y de terror.
- Formato conversacional (tag "conversational"), compatible con plantillas de chat estandar de Gemma.
- Capacidades de codigo, matematicas o tool calling: no disponible en la informacion proporcionada.

## Casos de uso

- Escritura de ficcion de terror: generacion de relatos largos, novelas por capitulos y guiones de suspense, aprovechando el fine-tune especifico en el genero de horror y los modos creativos del modelo base.
- Roleplaying interactivo: uso de los 10 constructos de IA predefinidos como personajes para partidas de rol en texto, simulaciones narrativas y juegos de aventura conversacionales.
- Desbloqueo de escritura creativa sin filtros: para autores profesionales que necesitan explorar tematicas oscuras (violencia narrativa, horror grafico) que los modelos comerciales rechazan, siempre en contexto de ficcion.
- Prototipado de NPCs con IA: integracion en motores de juego o herramientas de narrativa interactiva mediante llama.cpp u Ollama, con cuantizaciones ligeras (IQ3/IQ4) que caben en GPU de consumo.
- Experimentacion con modos de razonamiento: prueba de los 13 modos de reasoning e instruct anunciados para comparar estilos de generacion y planificacion narrativa.
- Investigacion sobre abliteration y seguridad de modelos: estudio de como la eliminacion de rechazos afecta a la calidad de generacion y a los comportamientos del modelo en distintos niveles de cuantizacion.
- Vision y analisis de imagenes en flujos creativos: descripcion de imagenes de referencia para escribir escenas, usando los ficheros mmproj del repositorio estatico (si se confirma compatibilidad con la version GGUF elegida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni los datos del repositorio incluyen evaluaciones (MMLU, HumanEval, GSM8K u otras) para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Referencias aproximadas de tamano de fichero: IQ1_S 7,3 GB; IQ2_M 11,0 GB; IQ3_M 14,5 GB; las cuantizaciones medias-altas (Q4_K_M, IQ4_XS) rondan tipicamente los 18-20 GB para un modelo de ~31B; Q6_K supera los 25 GB. Anade 1-3 GB adicionales por el KV cache segun contexto.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q3/IQ4 con buen rendimiento; RTX 3090 (24 GB) como alternativa economica; para cuantizaciones completas Q6_K o contexto largo, A100 40 GB o H100. Con GPU de 8-12 GB (RTX 3060/4060 Ti) solo son viables IQ1/IQ2, con perdida notable de calidad.
- Consumer GPUs: cabe en una RTX 4090 con IQ3_M o IQ4_XS; en una RTX 3060 de 12 GB solo con IQ1_S/IQ1_M o descargando capas a CPU (offload parcial en llama.cpp).
- CPU puro: viable con todas las cuantizaciones en maquinas con 16-32 GB de RAM, aunque con velocidades bajas (tipicamente 2-8 tokens/s en CPU de escritorio moderna para un modelo de 31B).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp (popular para roleplay), y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF directamente; para esos backends habria que usar los pesos safetensors del modelo base.
- Latencia y throughput: no disponible; dependen de la cuantizacion, el hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF | 30,7 B | GGUF (imatrix, 20+ quants) | Apache 2.0 | Terror, ficcion, roleplay, uncensored |
| Gemma 3 27B it (Google, cuantizado) | 27 B | GGUF / safetensors | Licencia Gemma (restricciones) | Generalista, vision, multilingue |
| Mistral Small 3.x 24B (variants uncensored) | 24 B | GGUF / safetensors | Apache 2.0 | Generalista, razonamiento, tool calling |
| Qwen3 30B-A3B | 30,7 B (3 B activos, MoE) | GGUF / safetensors | Apache 2.0 | Generalista, razonamiento, agentes |

Frente a un Gemma 3 27B oficial, este fine-tune ofrece licencia Apache 2.0 sin restricciones de uso y comportamiento uncensored, a cambio de perder soporte multilingue formal (solo ingles) y de carecer de evaluaciones publicas. Frente a alternativas MoE como Qwen3 30B-A3B, es mas lento en inferencia por ser denso (todos los parametros activos), aunque el fine-tune esta especializado en un nicho (ficcion de terror y roleplay) que los modelos generalistas no cubren sin ingenieria de prompts adicional.

## Limitaciones y advertencias

- Contenido sin moderacion: al ser abliterated y uncensored, el modelo puede generar contenido ofensivo, violento o inapropiado sin rechazos. Esta marcado como "not-for-all-audiences" y su uso en produccion orientado a usuarios finales exige capas de moderacion propias.
- Riesgo de alucinacion: no disponible como metrica, pero como todo LLM puede inventar hechos; el fine-tune creativo puede acentuar la inventiva sobre la fidelidad factual.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la longitud de ventana de contexto no esta documentada en los datos disponibles; hay que verificarla en el modelo base antes de planificar aplicaciones con documentos largos.
- Cuantizaciones extremas: IQ1_S/IQ1_M y las variantes Q2 degradan notablemente la calidad (el propio cuantizador las marca como "for the desperate"); se recomienda IQ3_S o superior.
- Vision: los ficheros mmproj estan en el repositorio de cuantizaciones estaticas, no en este; verificar compatibilidad antes de usar capacidades multimodales.
- Sin benchmarks publicos: no hay datos objetivos de rendimiento; la evaluacion depende de pruebas propias.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el usuario; revisar la normativa aplicable al despliegue de modelos sin filtros.
- Herramientas: no hay informacion sobre soporte de tool calling o function calling.

## Enlaces

- Repositorio de cuantizacion (esta ficha): https://huggingface.co/mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-GGUF
- Pagina de descarga con vista general de cuants: https://hf.tst.eu/model#gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- Guia de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
