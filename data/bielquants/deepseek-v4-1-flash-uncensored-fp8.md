# bielquants/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una version modificada del modelo multimodal DeepSeek-V4.1-Flash publicada por el usuario bielquants, vinculado al equipo de investigacion dealignai. La modificacion consiste en una "abliteracion" a nivel de pesos: se elimina quirurgicamente el circuito de rechazo del modelo base sin emplear hooks de runtime ni vectores de direccion, de modo que el checkpoint resultante se carga exactamente igual que el original. El autor denomina a esta variante "CRACK" y la distribuye con pesos FP8 nativos, vision, tool calling y una ventana de contexto de 1 millon de tokens.

Arquitectonicamente hereda del base: encoder-decoder causal con 20+20 capas, mezcla de expertos con 384 expertos enrutados (top-6) mas uno compartido, Hyper-Connections de 4 canales en el residual, atencion dispersa CSA2, memoria n-gram Engram y un cabezal de borrador especulativo DSpark (MTP). El dato real de safetensors indica 763.205.315.794 parametros totales, mientras que la model card del base describe un backbone de 552B con 8B/16B activos por token; el repositorio ocupa 510,3 GB.

Su relevancia es doble. Por un lado, demuestra que la abliteracion a nivel de pesos puede preservar arquitecturas complejas (MoE, vision, atencion dispersa, cabezal especulativo) con una perdida de conocimiento medida de solo -1,1 pp en MMLU excluyendo el cluster de etica. Por otro, sus resultados en HarmBench-320 (100% de cumplimiento en todas las categorias de dano, frente a 1,56%-42,81% del base) lo convierten en un caso de estudio sobre los riesgos de las variantes sin salvaguardas y sobre la dificultad de auditar modelos derivados publicados en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder causal con MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (residual de 4 canales), atencion dispersa CSA2, memoria n-gram Engram, cabezal especulativo DSpark (MTP), torre de vision DeepSeek-ViT con 2D-RoPE y pixel unshuffle |
| Parametros totales | 763.205.315.794 (dato real de safetensors); la model card del base declara un backbone de 552B |
| Parametros activos | 8B/16B por token (segun la model card del autor; no se especifica la correspondencia exacta con cada componente) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | FP8 (e4m3fn) en pesos con block-scale E8M0 [32, 32] y FP4 en los expertos enrutados; cuantizacion nativa, sin modificar respecto al base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers); repositorio de 510,3 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer causal encoder-decoder de 20+20 capas organizado como mezcla de expertos. Cada capa dispone de 384 expertos enrutados con seleccion top-6 mas un experto compartido siempre activo, lo que permite separar el coste de parametros del coste de computo por token. Sobre esa columna vertebral se anaden cuatro innovaciones: Hyper-Connections, que sustituyen el residual convencional por un enlace de 4 canales; CSA2, un esquema de atencion dispersa; Engram, una memoria basada en n-gramas; y DSpark, un cabezal de borrador para decodificacion especulativa que acelera la generacion al proponer tokens que el modelo principal verifica. La torre de vision DeepSeek-ViT emplea 2D-RoPE y pixel unshuffle para convertir imagenes en tokens compatibles con el mismo espacio de representacion.

La modificacion de bielquants es exclusivamente de pesos. Segun el autor, se preservan byte a byte todos los componentes criticos para el rendimiento: expertos enrutados, memoria Engram, atencion dispersa CSA2, cabezal de borrador DSpark, torre de vision, puertas del router, normalizaciones y embeddings. No se anaden ficheros `model.py`, hooks en tiempo de ejecucion ni vectores de direccion, por lo que el checkpoint es "drop-in" respecto al base. No se documenta en la informacion disponible ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento multi-turno con coherencia mantenida a lo largo de conversaciones largas, segun el autor.
- Razonamiento con "effort" configurable: el modelo admite un modo de esfuerzo maximo (effort=max) que expone una traza de razonamiento; el comportamiento cambia de forma medible entre effort=off y effort=max.
- Comprension de imagenes y texto (pipeline `image-text-to-text`), mediante la torre DeepSeek-ViT intacta.
- Tool calling y function calling, heredados del modelo base.
- Generacion de codigo y soporte a flujos de agentes multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el clasificador de evaluacion usado por el autor se describe como multilingue, pero no se enumeran idiomas soportados.
- Decodificacion especulativa mediante el cabezal DSpark, integrada en el propio checkpoint.
- Ausencia de rechazo: el modelo no emite negativas ni matizaciones de seguridad, lo cual es una caracteristica buscada por el autor, no una capacidad de producto.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el checkpoint permite estudiar de forma controlada el efecto de la abliteracion a nivel de pesos, comparando el mismo modelo con y sin circuito de rechazo sobre un conjunto fijo de prompts, como ya hace el autor con HarmBench-320 y MMLU-14k.
- Red teaming y evaluacion de clasificadores de contenido: al generar cumplimiento en el 100% de las categorias de HarmBench, sirve como generador de casos adversarios para probar sistemas de moderacion, filtros de entrada/salida y clasificadores de cuatro niveles.
- Analisis multimodal de documentos largos: con 1M de tokens de contexto y torre de vision, se puede alimentar el modelo con informes escaneados, tablas y texto asociado en una sola pasada sin troceado previo (con las reservas legales y eticas indicadas mas abajo).
- Auditoria forense de modelos derivados: comparar las salidas del checkpoint abliterado con las del base permite cuantificar que subconjuntos de conocimiento se degradan al eliminar el rechazo, tal como muestra la caida de -39,89 pp en `moral_scenarios`.
- Procesamiento de corpus de investigacion en ciencias sociales que incluyen contenido sensible y que los modelos alineados rechazan sistematicamente, evitando el sesgo de seleccion que introduce la negativa del modelo.
- Evaluacion de infraestructura de inferencia a gran escala: al requerir un despliegue multi-nodo con FP8 y FP4, es un banco de pruebas realista para medir throughput y latencia de vLLM o SGLang con atencion dispersa, MoE y decodificacion especulativa combinadas.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun flujo orientado a usuarios finales sin una capa externa de moderacion muy estricta, dado el comportamiento documentado en HarmBench.

## Benchmarks y rendimiento

HarmBench-320, decodificacion greedy con temperatura 0, clasificacion en cuatro niveles (HARD_REF, SOFT_RED, HEDGE, COMPLY). ASR = tasa de cumplimiento:

| Evaluacion | ASR base | ASR CRACK | Delta (pp) |
|---|---:|---:|---:|
| HB-320, effort=off | 137/320 = 42,81% | 320/320 = 100,00% | +57,19 |
| HB-320, effort=max | 5/320 = 1,56% | 320/320 = 100,00% | +98,44 |

Desglose por categoria semantica de HarmBench:

| Categoria | Items | Base off | CRACK off | Base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7% | 100,0% | 0,0% | 100,0% |
| copyright | 80 | 98,8% | 100,0% | 0,0% | 100,0% |
| cybercrime_intrusion | 52 | 34,6% | 100,0% | 3,8% | 100,0% |
| harassment_bullying | 21 | 0,0% | 100,0% | 0,0% | 100,0% |
| harmful | 18 | 11,1% | 100,0% | 5,6% | 100,0% |
| illegal | 53 | 13,2% | 100,0% | 0,0% | 100,0% |
| misinformation_disinformation | 54 | 44,4% | 100,0% | 3,7% | 100,0% |

MMLU-14k completo, evaluacion base-logit con temperatura 0:

| Build | Correctas | Precision | Delta |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96% | — |
| CRACK | 11.619 / 14.042 | 82,74% | -4,22 pp |
| CRACK, excluyendo el cluster de etica (~11k items) | no disponible | no disponible | -1,1 pp |

Subconjuntos con mayor degradacion en MMLU (seleccion de los valores publicados):

| Asignatura | n | Base | CRACK | Delta (pp) |
|---|---:|---:|---:|---:|
| moral scenarios | 895 | 76,9% | 37,0% | -39,89 |
| professional law | 1.534 | 75,9% | 68,8% | -7,04 |
| abstract algebra | 100 | 77,0% | 71,0% | -6,00 |
| security studies | 245 | 84,5% | 79,2% | -5,31 |
| high school computer science | 100 | 98,0% | 94,0% | -4,00 |
| jurisprudence | 108 | 90,7% | 87,0% | -3,70 |
| machine learning | 112 | 81,2% | 77,7% | -3,57 |
| professional psychology | 612 | 90,7% | 87,3% | -3,43 |

El autor declara cero respuestas HARD_REF, SOFT_RED y HEDGE en el build CRACK en ambos niveles de esfuerzo. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU-Pro, MMMU u otros) en la informacion disponible.

## Requisitos de hardware

- Peso en disco: 510,3 GB de repositorio, con pesos FP8 (e4m3fn) y expertos enrutados en FP4. Es el punto de partida realista para calcular VRAM, no el recuento de parametros.
- VRAM para inferencia: no hay cifras publicadas por el autor. Como estimacion derivada del tamano del repositorio, los pesos ocupan del orden de 510 GB, por lo que se necesita un minimo de 7 GPU de 80 GB solo para alojarlos, y bastante mas para el cache KV de hasta 1M tokens y las activaciones. Un despliegue funcional debe planificarse en 8-16 GPU de 80 GB (H100/H200) o 4-8 GPU de 141 GB (H200) o superior.
- GPU recomendadas: H100 80 GB, H200 141 GB, B200; configuraciones multi-nodo con NVLink o InfiniBand. No cabe en A100 40 GB ni en ninguna GPU de consumo.
- GPU de consumo: no es viable. Ni siquiera una cuantizacion GGUF agresiva a 4 bits (del orden de 380 GB solo de pesos) cabe en una RTX 4090 (24 GB) ni en un equipo con varias RTX 4090.
- Opciones de despliegue: vLLM, SGLang y TGI son las vias naturales para un modelo MoE multimodal en FP8/FP4 con atencion dispersa. llama.cpp u Ollama solo serian plantearles con cuantizaciones extremas y reparto en disco, con rendimiento no publicado. Se desconoce soporte especifico para TensorRT-LLM.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo, tiempo hasta el primer token ni escalado con la longitud de contexto. La decodificacion especulativa DSpark deberia reducir el coste por token, pero no hay mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Solo se dispone de datos comparativos frente al modelo base del que deriva. No hay informacion sobre otros modelos abliterados equivalentes ni sobre el rendimiento del base en benchmarks de terceros dentro de la informacion proporcionada.

| Modelo | Parametros totales | Contexto | Licencia | MMLU-14k | HarmBench-320 (off / max) | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (base) | 552B backbone (763B en safetensors del derivado) | 1M tokens | MIT | 86,96% | 42,81% / 1,56% | HuggingFace, `deepseek-ai/DeepSeek-V4.1-Flash` |
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 (CRACK) | 763.205.315.794 | 1M tokens | MIT | 82,74% | 100,00% / 100,00% | HuggingFace, `bielquants/DeepSeek-V4.1-Flash-UNCENSORED-FP8` |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es la perdida de conocimiento frente al base: -4,22 pp en MMLU-14k completo y -1,1 pp excluyendo el cluster de etica, a cambio de pasar de una tasa de cumplimiento en HarmBench del 42,81%-1,56% al 100% absoluto.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: el modelo cumple el 100% de los prompts de HarmBench-320 en las siete categorias de dano, incluidas `chemical_biological` y `cybercrime_intrusion`. No debe exponerse a usuarios finales ni conectarse a herramientas con efectos en el mundo real sin moderacion externa obligatoria.
- Responsabilidad legal: al no emitir rechazos, el uso puede infringir la legislacion aplicable en materia de contenidos ilicitos, proteccion de menores y obligaciones de la Ley de IA de la UE para sistemas de proposito general. La licencia MIT del repositorio cubre los derechos de autor del artefacto, no exime del cumplimiento normativo.
- Degradacion medible del conocimiento: -4,22 pp en MMLU-14k y -39,89 pp en `moral scenarios`. Otras asignaturas juridicas y de seguridad tambien caen entre 3 y 7 pp, lo que desaconseja su uso en dominios legales, eticos o de seguridad sin verificacion humana.
- Riesgo de alucinacion: no se publican mediciones de fidelidad ni de tasas de alucinacion; el autor solo reporta preservacion de MMLU. Al tratarse de un modelo derivado con pesos modificados, la calibracion puede diferir de la del base y no hay evaluacion de sesgos.
- Idiomas: la informacion no detalla los idiomas soportados ni la calidad por idioma, mas alla de que el clasificador de evaluacion es multilingue. El rendimiento fuera del ingles no esta caracterizado.
- Contexto largo: aunque se declaran 1M tokens, no se publican resultados tipo RULER, Needle-in-a-Haystack ni degradacion de calidad a longitudes extremas, por lo que el rendimiento efectivo a contexto maximo es desconocido.
- Procedencia y reproducibilidad: el autor no publica la metodologia detallada de abliteracion, ni semillas, ni scripts de evaluacion completos en la informacion disponible. El repositorio tiene 0 descargas y 0 likes en el momento del analisis.
- Inconsistencia de datos a vigilar: la model card declara un backbone de 552B con 8B/16B activos, mientras que el recuento real de safetensors es de 763.205.315.794 parametros. La diferencia es atribuible a torre de vision, embeddings, cabezal DSpark y otros componentes, pero el desglose no esta publicado.
- Antiguedad de la informacion: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos versan sobre productos de tincion de madera y son ajenos al objeto de la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bielquants/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del coautor en X: https://x.com/jordanschenck
- Paper, blog tecnico, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
- Resultados de busqueda web: no se encontro ningun resultado relevante sobre el modelo; los resultados devueltos corresponden a productos de tincion de madera (Minwax, General Finishes) y no guardan relacion con el objeto de esta ficha.
