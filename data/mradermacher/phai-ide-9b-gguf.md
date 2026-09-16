# mradermacher/PhAI-IDE-9B-GGUF

## Resumen

PhAI-IDE-9B-GGUF es la version cuantizada en formato GGUF del modelo AItonomy/PhAI-IDE-9B, publicada por el cuantizador mradermacher. El modelo base es un transformer de 8.953.803.264 parametros (unos 8,95 mil millones) afinado mediante SFT y LoRA sobre un modelo previo no especificado en la informacion disponible, y orientado a tareas de ciencia, generacion de codigo y uso de herramientas (tool calling). La ficha de HuggingFace lo etiqueta con los campos phai-ide, science, code, tool-use, sft y lora, y lo declara compatible con endpoints conversacionales.

La relevancia de esta ficha concreta es practica: el repositorio original en safetensors no es directamente utilizable en entornos de inferencia local de bajo consumo, mientras que esta version ofrece 13 ficheros GGUF que cubren desde 3,9 GB (Q2_K) hasta 18,0 GB (f16), ademas de dos ficheros mmproj (Q8_0 y f16) que apuntan a un componente multimodal, presumiblemente un proyector de vision, aunque la model card no lo documenta.

Se trata, por tanto, de una publicacion de conveniencia para despliegue local (llama.cpp, Ollama, LM Studio) de un modelo de ~9B especializado en IDE y flujos de agente. No incluye informacion sobre longitud de contexto, composicion del dataset de entrenamiento, resultados de benchmarks ni detalles de la arquitectura interna, por lo que cualquier evaluacion rigurosa exige consultar el repositorio del modelo base, que tampoco se ha podido contrastar con las busquedas web realizadas (los resultados obtenidos no guardan relacion con el modelo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repo se publica con library_name transformers; el modelo base es un transformer de ~9B, sin confirmar en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base AItonomy/PhAI-IDE-9B esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card del repositorio GGUF, que se limita a indicar que es una cuantizacion estatica del modelo AItonomy/PhAI-IDE-9B. La metadata interna del proceso de conversion indica quantize_version 2, output_tensor_quantised 1 y convert_type hf, es decir, una conversion directa desde pesos en formato HuggingFace a GGUF con cuantizacion de tensores de salida. No se han publicado cuantizaciones ponderadas ni con matriz de importancia (imatrix) para este modelo; el autor indica que, si no aparecen en una semana tras las estaticas, probablemente no las tenga planificadas, aunque acepta peticiones via discusion comunitaria.

Respecto al entrenamiento, las etiquetas del modelo (sft, lora, science, code, tool-use) indican un ajuste supervisado sobre un adaptador LoRA, pero no se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica concreta (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.). La presencia de ficheros mmproj sugiere la existencia de un adaptador multimodal en el modelo base, presumiblemente para entrada de imagenes, pero este punto no se confirma en la informacion disponible y debe verificarse en el repositorio original antes de asumirlo.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantillas de chat (el repositorio se marca como conversational y endpoints_compatible).
- Generacion y asistencia sobre codigo, segun las etiquetas code del modelo; no se especifican lenguajes de programacion concretos.
- Razonamiento cientifico y tecnico, segun la etiqueta science; sin datos de evaluacion que lo cuantifiquen.
- Uso de herramientas (tool-use), lo que en principio permite function calling y llamadas estructuradas dentro de agentes.
- Capacidad multimodal potencial: el repositorio incluye ficheros mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB), lo que sugiere soporte de entrada de imagen mediante un proyector; no confirmado en la model card.
- No se documenta modo de razonamiento explicito (thinking mode), soporte de audio ni capacidades de vision confirmadas.
- Multilingue: limitado a ingles segun el campo language del repositorio.

## Casos de uso

- Asistente de programacion en local: el modelo puede integrarse en un editor o IDE mediante llama.cpp u Ollama para autocompletar y explicar codigo sin enviar el codigo fuente a servicios externos, algo critico en entornos con requisitos de confidencialidad.
- Agente de automatizacion de tareas de desarrollo: gracias a la etiqueta tool-use, puede invocarse desde un orquestador que le exponga funciones (leer ficheros, ejecutar tests, consultar APIs) y encadenar varios pasos hasta completar una tarea.
- Revision de codigo en pipelines de CI/CD: con una cuantizacion Q4_K_M de 5,7 GB puede desplegarse en un runner con GPU modesta y generar comentarios automaticos sobre diffs o detectar patrones problematicos.
- Documentacion tecnica y cientifica: generacion de resumenes, explicaciones de papers o notas tecnicas a partir de texto en ingles, aprovechando el ajuste orientado a ciencia.
- Prototipado rapido en estaciones de trabajo con una sola GPU de consumo: la version Q4_K_S (5,5 GB) permite tener el modelo residente en VRAM junto con el resto del sistema en tarjetas de 12 GB o superiores.
- Despliegue en servidores sin GPU: las cuantizaciones Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten ejecucion en CPU con llama.cpp para tareas de baja concurrencia y latencia no critica.
- Base para fine-tuning posterior: el modelo puede servir como punto de partida para adaptaciones especificas de dominio, dado que la licencia Apache-2.0 facilita la redistribucion de derivados (sujeto a verificar la licencia del modelo base original).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda web obtenidos aportan cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluacion. Las busquedas realizadas devolvieron exclusivamente documentacion ajena al modelo (articulos de soporte sobre adjuntos de correo en Thunderbird), por lo que no existe material externo contrastable. Cualquier comparacion numerica con otros modelos seria especulativa y no se incluye.

## Requisitos de hardware

Estimaciones orientativas de VRAM para inferencia, calculadas a partir de los tamanos de fichero publicados mas el margen habitual de cache KV y overhead del runtime (contexto moderado, batch pequeno):

| Cuantizacion | Tamano en disco | VRAM estimada |
|---|---|---|
| Q2_K | 3,9 GB | ~5-6 GB |
| Q3_K_S | 4,4 GB | ~6 GB |
| Q3_K_M | 4,7 GB | ~6-7 GB |
| Q3_K_L | 5,0 GB | ~6-7 GB |
| IQ4_XS | 5,3 GB | ~7 GB |
| Q4_K_S | 5,5 GB | ~7 GB |
| Q4_K_M | 5,7 GB | ~7-8 GB |
| Q5_K_S | 6,4 GB | ~8 GB |
| Q5_K_M | 6,6 GB | ~8-9 GB |
| Q6_K | 7,5 GB | ~9-10 GB |
| Q8_0 | 9,6 GB | ~11-12 GB |
| f16 | 18,0 GB | ~20 GB o mas |

- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti / 4080 y RTX 4090 24 GB con cuantizaciones de Q4 a Q8. Las cuantizaciones Q2_K y Q3_K permiten incluso tarjetas de 6-8 GB.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 y L40S pueden alojar el modelo en f16 con contexto amplio, aunque para un modelo de ~9B resultan sobredimensionadas salvo por concurrencia alta o contexto muy largo.
- Despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, llama-cpp-python, KoboldCpp) son la via natural al tratarse de GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos runtimes habria que partir de los pesos safetensors del modelo base AItonomy/PhAI-IDE-9B.
- Multimodal: si se confirma el uso de vision, los ficheros mmproj-Q8_0 (0,7 GB) o mmproj-f16 (1,0 GB) deben cargarse junto al modelo y suman a la VRAM necesaria.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este modelo en ninguna configuracion de hardware.
- Nota sobre cuantizaciones: el autor solo publica cuantizaciones estaticas; no hay versiones ponderadas ni imatrix, lo que suele implicar una perdida de calidad algo mayor en Q2_K y Q3_K frente a equivalentes con imatrix.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de su documentacion publica y deben verificarse en sus repositorios; para PhAI-IDE-9B la mayoria de especificaciones no estan disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PhAI-IDE-9B (esta ficha, GGUF) | 8,95B | no disponible | Apache-2.0 | GGUF (13 cuantizaciones) y safetensors en el modelo base |
| Llama 3.1 8B (Meta) | 8,03B | 128.000 tokens | Llama 3.1 Community License | safetensors y GGUF de terceros |
| Gemma 2 9B (Google) | 9,24B | 8.192 tokens | Gemma Terms of Use | safetensors y GGUF de terceros |
| Qwen2.5-Coder 7B (Alibaba) | ~7,6B | 32.768 tokens | Apache-2.0 | safetensors y GGUF de terceros |

Diferencias relevantes: los tres comparativos cuentan con documentacion de entrenamiento detallada, longitudes de contexto publicadas y resultados de benchmarks reproducibles, mientras que PhAI-IDE-9B no aporta ninguno de esos datos. Como contrapartida, PhAI-IDE-9B esta explicitamente ajustado para tool-use y ciencia, y su licencia Apache-2.0 es mas permisiva que las de Llama 3.1 y Gemma 2. Qwen2.5-Coder 7B es el competidor mas directo en licencia y en disponibilidad de cuantizaciones.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Ausencia total de benchmarks: no se puede afirmar nada sobre su calidad relativa frente a otros modelos de ~9B. Cualquier eleccion basada en esta ficha debe ir precedida de una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos de este tamano y agravado por la falta de datos sobre el dataset de entrenamiento y sobre posibles fases de alineacion (RLHF/DPO no documentados).
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o comportamiento en dominios sensibles.
- Procedencia del ajuste: al ser un fine-tuning LoRA sobre una base no identificada, se desconoce el modelo subyacente, su licencia original y las condiciones reales de uso comercial. Aunque el repositorio declara apache-2.0, conviene verificar la cadena de licencias en AItonomy/PhAI-IDE-9B.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y con la model card limitada a la plantilla automatica del cuantizador. No hay evidencia de validacion comunitaria.
- Cuantizaciones de baja precision: Q2_K y Q3_K degradan notablemente la calidad en modelos de este tamano; para uso en produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones ponderadas ni imatrix, lo que reduce la calidad por bit en comparacion con repositorios equivalentes que si las ofrecen.
- Compatibilidad de endpoints: aunque se marca endpoints_compatible, no se documenta el formato de prompt, el tokenizer ni las plantillas de chat, lo que puede provocar inconsistencias al integrarlo en frameworks de agentes.
- El soporte multimodal es una inferencia basada en la existencia de ficheros mmproj, no una capacidad confirmada por el autor.
- Fecha de publicacion inusual en los metadatos (2026-09-16) junto con la ausencia de descargas: tratar la ficha con cautela y comprobar el estado actual del repositorio antes de integrarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PhAI-IDE-9B-GGUF
- Modelo base: https://huggingface.co/AItonomy/PhAI-IDE-9B
- Pagina de resumen del cuantizador para este modelo: https://hf.tst.eu/model#PhAI-IDE-9B-GGUF
- Peticiones y preguntas frecuentes sobre cuantizaciones: https://huggingface.co/mradermacher/model_requests
- Guia general de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion y perplejidad (grafico de ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa que cede la infraestructura de cuantizacion): https://www.nethype.de/
- Resultados de busqueda web: no se ha encontrado ningun articulo, paper, blog o demo relacionado con PhAI-IDE-9B; las busquedas devolvieron documentacion ajena al modelo.
