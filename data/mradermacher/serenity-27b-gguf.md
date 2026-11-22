# mradermacher/Serenity-27B-GGUF

## Resumen

Serenity-27B-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo base ReadyArt/Serenity-27B, publicada por mradermacher. El modelo original es un transformer denso de 27.320.697.856 parametros (aproximadamente 27,3 mil millones), afinado para conversacion, roleplay e instruccion, con enfasis explicito en contenido para adultos (etiquetas nsfw, adult-content, unaligned, erp). La licencia declarada es Apache 2.0 y el unico idioma soportado es el ingles.

El repositorio de mradermacher no entrena ni modifica el modelo: su funcion es producir cuantizaciones estaticas en GGUF (desde Q2_K hasta Q8_0, mas variantes IQ4_XS) para permitir inferencia en hardware de consumo mediante llama.cpp y derivados. El repositorio ocupa 190,8 GB en total porque incluye todas las variantes de cuantizacion, no porque el modelo completo tenga ese tamano. Ademas, se incluyen ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal, lo que sugiere que el modelo base incorpora proyeccion de vision.

La relevancia de esta ficha es practica: para un desarrollador que quiera ejecutar un modelo de 27B orientado a conversacion en una GPU consumer o en CPU, esta distribucion ofrece variantes de peso calibradas por rango de VRAM, con recomendaciones explicitas del autor (Q4_K_S y Q4_K_M como "fast, recommended"; Q8_0 como mejor calidad). No hay datos publicados de benchmarks ni de contexto maximo en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de atencion y capas no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (referencia), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible confirma un transformer denso de 27,3 mil millones de parametros, derivado de ReadyArt/Serenity-27B mediante cuantizacion estatica con convert_type hf y output_tensor_quantised activado. No se dispone de datos sobre numero de capas, dimension de hidden state, tipo de atencion (MHA/GQA/MQA), funcion de activacion ni uso de RoPE o variantes. Tampoco se documenta el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o SFT; las etiquetas "instruct", "conversational" y "unaligned" indican afinado para instruccion y conversacion con alineamiento deliberadamente relajado, pero sin detalle tecnico verificable.

La innovacion tecnica relevante en esta distribucion es exclusivamente de inferencia: cuantizaciones K-quant e IQ (IQ4_XS) generadas con llama.cpp, con variantes imatrix publicadas en un repositorio separado (mradermacher/Serenity-27B-i1-GGUF). La presencia de ficheros mmproj Q8_0 y f16 implica que el modelo base integra un codificador multimodal y que llama.cpp puede cargar el proyector junto con los pesos de lenguaje. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones arquitectonicas.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a roleplay e interaccion instructiva.
- Modo instruct: seguimiento de instrucciones en formato chat (plantilla no documentada en la informacion disponible).
- Capacidad multimodal potencial: los ficheros mmproj indican soporte de entrada de imagen mediante el proyector del modelo base, aunque no se detalla que tareas de vision estan cubiertas.
- Contenido para adultos explicito: el modelo esta etiquetado como nsfw, explicit, mature y erp, y como unaligned, lo que implica menor rechazo de solicitudes sensibles.
- Multilingue: limitado a ingles segun el campo language.
- Tool calling / function calling: no disponible (no declarado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Thinking mode, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta afinado especificamente para conversacion inmersiva y personajes; las cuantizaciones Q4_K_M y Q5_K_M permiten mantener sesiones largas en una sola GPU consumer con latencia aceptable.
- Simulacion de dialogos para guion y escritura creativa: util para generar borradores de escenas conversacionales y variantes de registro, con cuantizacion Q6_K o Q8_0 cuando prima la calidad textual sobre la velocidad.
- Evaluacion de seguridad y moderacion: al ser un modelo "unaligned" con contenido explicito, sirve como caso de prueba controlado para pipelines de filtrado, clasificadores de toxicidad y sistemas de moderacion en entornos de laboratorio.
- Prototipado de interfaces de chat en local: despliegue con llama.cpp u Ollama en estaciones de trabajo sin GPU de datacenter, usando Q4_K_S (15,9 GB) como punto de partida recomendado por el autor.
- Investigacion sobre alineamiento y comportamiento: comparar respuestas de un modelo deliberadamente desalineado frente a modelos alineados en el mismo prompt set, controlando la cuantizacion para aislar el efecto del entrenamiento.
- Pruebas de inferencia multimodal en llama.cpp: cargar el par de ficheros mmproj (Q8_0 o f16) junto con los pesos para validar el pipeline de vision del modelo base en herramientas que soporten proyectores multimodales.
- Generacion de datos sinteticos de conversacion en ingles: producir corpus de dialogo para fine-tuning de clasificadores o para aumentacion de datasets, con supervision humana posterior obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion no incluye MMLU, HumanEval, GSM8K ni metricas de perplexity por variante; solo referencia un grafico externo generico de perplexity comparativa entre tipos de cuantizacion de baja calidad, sin valores numericos asociados a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de KV cache y contexto): Q2_K ~11,0 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. El overhead de contexto y activaciones anade varios GB segun la longitud de contexto efectiva.
- GPU recomendadas: para Q8_0, una RTX 4090 (24 GB) queda justa y puede requerir offload parcial a CPU; A100 40 GB, H100 80 GB o L40S 48 GB ejecutan Q8_0 con holgura. Para Q4_K_M, 24 GB de VRAM son suficientes en la mayoria de configuraciones; para Q3_K_M o Q2_K, GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, A4000) son viables.
- Cabe en GPU consumer: si, en RTX 4090, RTX 4080, RTX 4060 Ti 16 GB y RTX 3090 para cuantizaciones de Q2_K a Q5_K_M; Q6_K y Q8_0 requieren gestion cuidadosa del contexto o division entre GPU y CPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, text-generation-webui, koboldcpp, y servidores compatibles con la API de endpoints (la model card declara endpoints_compatible). vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; dependen de GPU, ancho de banda de memoria, cuantizacion y longitud de contexto. A modo de referencia estructural, un modelo denso de 27B en Q4_K_M (~17 GB) esta limitado por ancho de banda: en una RTX 4090 (1008 GB/s) el techo teorico ronda decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Serenity-27B-GGUF (esta ficha) | 27,3B denso | no disponible | Apache 2.0 | GGUF, 12 variantes + mmproj | Orientado a roleplay y contenido adulto; solo ingles |
| Modelos densos de ~27B en GGUF (familia generica) | ~27B | variable | variable | GGUF | No se dispone de un comparable directo identificado en la informacion; los rangos 24B-32B suelen requerir Q4 para caber en 24 GB |
| Modelos de roleplay de ~13B en GGUF | ~13B | variable | variable | GGUF | Menor huella (Q4 ~8 GB), cabe en GPUs de 12 GB, pero menor capacidad de contexto y coherencia en sesiones largas |
| Modelos instruct generalistas de ~27B | ~27B | variable | variable | safetensors/GGUF | Mayor alineamiento y rechazo de contenido sensible; no equivalentes para roleplay explicito |

No se dispone de datos de rendimiento comparativo verificables para establecer una comparacion cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Contenido explicito y "unaligned": el modelo esta disenado para reducir rechazos, lo que implica riesgo alto de generar material sexual explicito, violento o inapropiado; no es apto para productos de consumo general ni para entornos con menores.
- Alucinacion: no hay evaluacion publicada de factualidad; en tareas de conocimiento factual el riesgo es alto y no mitigado por benchmarks conocidos.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta verificado y probablemente sera deficiente.
- Contexto: la longitud de contexto no esta documentada; planificar el despliegue con un valor conservador y validar empiricamente antes de produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero no exime de responsabilidad legal sobre el contenido generado ni sobre las obligaciones de moderacion aplicables (por ejemplo, DSA en la UE).
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la coherencia; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- Overhead de contexto: las cifras de VRAM de la tabla corresponden solo a pesos; con contextos largos el KV cache puede superar varios GB adicionales y provocar offload a CPU con caida severa de throughput.
- Ficheros mmproj: el soporte multimodal depende de la version de llama.cpp y del frontend; no todos los clientes cargan proyectores externos, y no se documenta que tareas de vision funcionan correctamente.
- Repositorio de 190,8 GB: descargar solo la variante necesaria; clonar el repo completo es inviable en la mayoria de entornos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Serenity-27B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Serenity-27B
- Variantes imatrix: https://huggingface.co/mradermacher/Serenity-27B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Serenity-27B-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplexity por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Sitio del patrocinador (nethype GmbH): https://www.nethype.de/
