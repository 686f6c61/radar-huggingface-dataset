# Openintelligent123/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una variante modificada del modelo DeepSeek-V4.1-Flash publicada por el usuario Openintelligent123 (asociado a las cuentas @dealignai y @jordanschenck), con "abliteración a nivel de pesos" aplicada para eliminar los mecanismos de rechazo del modelo base. El autor la describe como una operación quirúrgica sobre el checkpoint: sin `model.py` personalizado, sin hooks en tiempo de ejecución y sin vectores de dirección (steering vectors), de modo que se carga igual que el modelo original. El resultado es un checkpoint estándar de tipo MoE multimodal con arquitectura causal encoder-decoder, atención dispersa CSA2, memoria n-gram Engram y cabeza de borrador especulativo DSpark.

El modelo conserva las capacidades del base (visión, tool calling, razonamiento multi-turno y una ventana de contexto declarada de 1 millón de tokens) pero elimina la alineación de seguridad: según los datos aportados por el autor, la tasa de cumplimiento de solicitudes dañinas (ASR) en HarmBench-320 pasa del 42,81 % del base (con razonamiento desactivado) y del 1,56 % (con esfuerzo máximo) al 100 % en la variante modificada, con cero rechazos duros o suaves. El coste medido es una caída de 4,22 puntos en MMLU-14k (86,96 % → 82,74 %), concentrada sobre todo en el clúster de ética, derecho profesional y filosofía.

La relevancia del artefacto es doble: por un lado, es un caso de estudio sobre lo fácil que resulta desalinear un modelo de frontera preservando casi toda su competencia técnica; por otro, su licencia MIT y su tamaño (763.205.315.794 parámetros medidos en safetensors, 510,3 GB de repositorio) lo sitúan en un rango de despliegue que exige infraestructura multi-GPU. Se publicó el 11 de septiembre de 2026 y, en el momento de la consulta, acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (20+20 capas), MoE con 384 expertos enrutados top-6 + 1 compartido, Hyper-Connections (residual de 4 canales), atencion dispersa CSA2, memoria n-gram Engram, cabeza de borrador especulativo DSpark, torre de vision DeepSeek-ViT con 2D-RoPE y pixel unshuffle |
| Parametros totales | 763.205.315.794 (dato real de safetensors). La model card menciona un "backbone de 552B"; discrepancia no aclarada por el autor |
| Parametros activos | 8B/16B activos por token segun la model card (desglose no detallado) |
| Longitud de contexto | 1.000.000 de tokens (1M) |
| Tipos de cuantizacion | Pesos FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32]; expertos enrutados en FP4. Cuantizacion nativa del modelo base, sin modificar. No se listan otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 510,3 GB |
| Modalidad | image-text-to-text (pipeline de HuggingFace) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash (relacion: quantized) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre el proceso de entrenamiento de este artefacto: el autor no documenta datos, numero de tokens, composicion del dataset ni fases de RLHF o DPO. La modificacion declarada no es un reentrenamiento, sino una edicion de pesos ("abliteracion a nivel de pesos") sobre el checkpoint de `deepseek-ai/DeepSeek-V4.1-Flash`. Segun la model card, el proceso elimina el "circuito de rechazo" y preserva byte a byte los componentes criticos para la capacidad: expertos enrutados, memoria Engram, atencion dispersa CSA2, cabeza de borrador DSpark, torre de vision, puertas del router, normalizaciones y embeddings. El autor afirma que no hay `model.py` personalizado ni hooks, de modo que el checkpoint es intercambiable con el base.

Los elementos arquitectonicos citados en la ficha del autor son: cola causal encoder-decoder de 20+20 capas, mezcla de expertos con 384 expertos enrutados (top-6) mas uno compartido, Hyper-Connections con residual de 4 canales, atencion dispersa CSA2, memoria n-gram Engram y una cabeza de borrador DSpark para decodificacion especulativa. La cuantizacion es nativa: pesos FP8 `e4m3fn` con escalas de bloque E8M0 de forma [32, 32] y expertos enrutados en FP4. La torre de vision es DeepSeek-ViT con 2D-RoPE y pixel unshuffle para reducir la secuencia de parches. Todo esto procede de la model card del autor; no hay verificacion independiente disponible.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventana declarada de 1M tokens.
- Modo de razonamiento configurable: la evaluacion del autor distingue `effort=off` y `effort=max`, con traza de razonamiento verificable en el segundo caso.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), con torre de vision DeepSeek-ViT.
- Soporte declarado de herramientas (tools) y flujos de agente, segun la cabecera de la model card ("Vision + tools").
- Generacion de codigo y conocimiento tecnico: en MMLU conserva 94,0 % en informatica de instituto, 79,0 % en informatica universitaria y 77,7 % en machine learning.
- Decodificacion especulativa mediante la cabeza DSpark, integrada en el checkpoint.
- Ausencia total de rechazos: 0 HARD_REF, 0 SOFT_RED y 0 HEDGE en las 320 peticiones de HarmBench-320, tanto con razonamiento desactivado como a esfuerzo maximo.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas; la evaluacion menciona un clasificador multilingue, pero sin detallar idiomas).

## Casos de uso

- Red teaming y evaluacion de seguridad: permite medir la robustez de clasificadores de contenido y de filtros de entrada/salida frente a un modelo que cumple el 100 % de las peticiones de HarmBench-320. Su utilidad es generar conjuntos de respuestas adversarias etiquetadas para entrenar y validar moderadores.
- Investigacion sobre mecanismos de rechazo: al ser una edicion a nivel de pesos sobre un checkpoint estandar, sirve para estudiar que subconjunto de parametros sostiene el comportamiento de negativa, comparando capa a capa con el modelo base.
- Auditoria de pipelines de despliegue: sirve como caso de prueba para verificar que las puertas de seguridad de una plataforma (filtros previos, politicas de API, listas de modelos bloqueados) detectan un checkpoint desalineado antes de servirlo.
- Analisis de documentos largos y multimodal: con 1M tokens de contexto declarados y torre de vision, puede procesar expedientes completos con figuras, tablas e imagenes en una sola pasada, por ejemplo corpus normativos o informes tecnicos extensos, en entornos controlados y con revision humana.
- Extraccion estructurada y agentes con herramientas: el soporte declarado de tool calling permite construir flujos de varios pasos (consulta a bases de datos, llamadas a API internas, resumen final) sobre documentacion tecnica.
- Generacion de datos sinteticos para investigacion: producir dialogos y respuestas no filtradas sobre temas que el modelo base rechaza, con el fin de ampliar la cobertura de conjuntos de evaluacion de seguridad y de sesgo.
- Estudio de degradacion de conocimiento tras abliteracion: replicar el analisis MMLU-14k por asignatura para cuantificar que areas (etica, derecho, filosofia) son mas sensibles a la eliminacion de la alineacion.

## Benchmarks y rendimiento

Todos los datos proceden de la model card del autor. No hay evaluacion independiente ni resultados de terceros en la informacion disponible. Greedy, T=0.

HarmBench-320 (tasa de cumplimiento, ASR):

| Evaluacion | Base | UNCENSORED-FP8 | Delta (pp) |
|---|---:|---:|---:|
| HB-320, effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320, effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Desglose por categoria semantica (ASR):

| Categoria | Items | Base off | UNCENSORED off | Base max | UNCENSORED max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k (conjunto de test completo, logits del base, T=0):

| Version | Aciertos | Precision | Delta |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96 % | — |
| UNCENSORED-FP8 | 11.619 / 14.042 | 82,74 % | -4,22 pp |

Excluyendo el cluster de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), el delta en los ~11.000 items restantes es de -1,1 pp, dentro del objetivo de preservacion de conocimiento de 3 pp declarado por el autor.

Mayores caidas por asignatura (57 asignaturas evaluadas):

| Asignatura | n | Base | Modificado | Delta (pp) |
|---|---:|---:|---:|---:|
| moral scenarios | 895 | 76,9 % | 37,0 % | -39,89 |
| professional law | 1.534 | 75,9 % | 68,8 % | -7,04 |
| abstract algebra | 100 | 77,0 % | 71,0 % | -6,00 |
| security studies | 245 | 84,5 % | 79,2 % | -5,31 |
| high school computer science | 100 | 98,0 % | 94,0 % | -4,00 |
| jurisprudence | 108 | 90,7 % | 87,0 % | -3,70 |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMMU, MT-Bench) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por encima de 510 GB solo para pesos, dado que el repositorio ocupa 510,3 GB en FP8/FP4 nativo. Cualquier cifra inferior exigiria una cuantizacion adicional que no esta publicada (estimacion propia, no confirmada por el autor).
- GPU recomendadas: configuraciones multi-GPU de centro de datos. Como referencia, 8x H100 80 GB (640 GB) o 8x A100 80 GB (640 GB) para cubrir pesos mas cache KV; con contexto de 1M tokens la cache KV puede dominar el presupuesto y obligar a mas nodos o a atencion dispersa agresiva.
- GPU de consumo: no cabe. Ni siquiera una RTX 4090 (24 GB) ni una RTX 5090 podrian alojar el checkpoint, ni con cuantizaciones hipoteticas de 4 bits del orden de 380 GB.
- Opciones de despliegue: la libreria declarada es transformers y el repositorio contiene safetensors; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No hay confirmacion de soporte en vLLM, TGI, llama.cpp, Ollama ni en formato GGUF, por lo que esos caminos quedan como no disponibles.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia de primer token.
- Almacenamiento: 510,3 GB de repositorio mas espacio de cache; se recomienda almacenamiento NVMe y descarga por partes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | ASR HarmBench-320 | MMLU | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763.205.315.794 (safetensors); 552B "backbone" segun la card | 1M | MIT | 100,00 % (off y max) | 82,74 % (14k) | HuggingFace, safetensors |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B backbone, 8B/16B activos por token | 1M | no disponible en la informacion proporcionada | 42,81 % (off) / 1,56 % (max) | 86,96 % (14k) | HuggingFace |

No se dispone de datos verificables en la informacion proporcionada sobre otras alternativas de la misma categoria (modelos MoE de frontera abliterados o variantes sin censura de la misma escala), por lo que la comparativa con terceros queda como no disponible. Tampoco se dispone de las especificaciones de licencia, cuantizacion o rendimiento del modelo base mas alla de lo que cita la model card de esta variante.

## Limitaciones y advertencias

- Eliminacion deliberada de la alineacion de seguridad: la tasa de cumplimiento de solicitudes daninas en HarmBench-320 es del 100 % en las siete categorias evaluadas (quimico-biologico, copyright, cibercrimen, acoso, dano generico, actividades ilegales y desinformacion), sin rechazos duros, suaves ni respuestas evasivas. Es un riesgo directo si el modelo se expone sin filtros externos.
- Riesgo legal y de cumplimiento: desplegarlo como servicio puede entrar en conflicto con la Ley de IA de la UE (practicas prohibidas y obligaciones de modelos de proposito general), con la normativa de contenidos ilegales y con las condiciones de uso de proveedores de infraestructura. La licencia MIT cubre el artefacto, pero no exime del cumplimiento normativo ni de la responsabilidad civil por el uso.
- Perdida de competencia medible: -4,22 pp en MMLU-14k y caidas muy severas en asignaturas concretas, destacando moral scenarios (-39,89 pp) y professional law (-7,04 pp). Esto desaconseja su uso en dominios juridicos, eticos o de asesoramiento sensible.
- Degradacion no medida en otras tareas: no hay resultados de HumanEval, GSM8K, MMMU ni evaluaciones de agentes, por lo que se desconoce el impacto real de la abliteracion en codigo, matematicas y vision.
- Alucinacion: no se han publicado evaluaciones especificas de veracidad o tasa de alucinacion; en la categoria misinformation_disinformation el comportamiento se mide como cumplimiento, no como exactitud, por lo que no hay datos sobre fiabilidad factual.
- Idiomas: no se declara lista de idiomas soportados ni cobertura multilingue verificada. El castellano no esta confirmado.
- Trazabilidad y reputacion del autor: 0 descargas, 0 likes y fecha de publicacion muy reciente en el momento de la consulta. No hay evaluacion independiente, replicacion ni auditoria de terceros que confirme las cifras de la model card.
- Discrepancia de cifras: la model card habla de un "backbone de 552B" mientras que los safetensors suman 763.205.315.794 parametros totales; el autor no explica la diferencia (probablemente parametros totales del MoE frente a backbone denso, pero no esta confirmado).
- Sin formatos ligeros: no hay GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue a infraestructura con mas de 500 GB de VRAM y descarta entornos de consumo.
- Contexto de 1M tokens no verificado: no se aportan pruebas de rendimiento efectivo (needle-in-a-haystack u otras) a esa longitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Openintelligent123/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Cuenta X del autor (dealignai): https://x.com/dealignai
- Cuenta X del autor (jordanschenck): https://x.com/jordanschenck
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente resultados no pertinentes de un comercio de muebles), por lo que no se pueden enlazar papers, demos ni documentacion tecnica adicional.
