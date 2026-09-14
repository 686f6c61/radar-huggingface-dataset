# mradermacher/Forgotten-Hubris-24B-v0.1-i1-GGUF

## Resumen

Forgotten-Hubris-24B-v0.1-i1-GGUF es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo merviscishes/Forgotten-Hubris-24B-v0.1, un merge de 23.572.464.640 parametros (~23,6B) construido con mergekit y orientado a escritura creativa, narrativa y roleplay sin censura. El modelo base combina componentes de arquitectura Mistral y ha sido tratado con tecnicas de tipo "heretic" (abliteracion/decensurado), lo que se refleja en las etiquetas nsfw y not-for-all-audiences de su ficha. Esta variante concreta no aporta pesos nuevos: su valor esta en ofrecer el modelo en formato GGUF con cuantizaciones ponderadas mediante imatrix, lo que permite ejecutarlo en hardware de consumo.

La relevancia de esta publicacion es practica: el repositorio original en safetensors ronda los 47 GB en precision completa, mientras que las cuantizaciones i1 disponibles van desde 9,0 GB (i1-Q2_K) hasta 13,6 GB (i1-Q4_K_S), con una tabla de tamanos publicada por el autor. El soporte de imatrix (matriz de importancia) reduce la perdida de perplejidad en cuantizaciones agresivas, un detalle relevante para modelos de escritura creativa donde la degradacion de estilo y coherencia se nota antes que en tareas de clasificacion.

Se trata, por tanto, de un modelo de nicho: 23,6B parametros, solo ingles, licencia Apache 2.0, sin benchmarks publicados y con una orientacion explicita a contenido para adultos y narrativa sin restricciones. No es una opcion para asistentes de proposito general ni para produccion sujeta a politicas de contenido, pero si para despliegues locales de generacion creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Mistral (modelo fusionado con mergekit); detalles de capas y atencion no disponibles |
| Parametros totales | 23.572.464.640 (~23,6B) |
| Parametros activos | No aplicable (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_XS, IQ3_S |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

Notas sobre las cuantizaciones publicadas en la tabla del autor:

| Fichero | Tipo | Tamano (GB) | Comentario del autor |
|---|---|---|---|
| Forgotten-Hubris-24B-v0.1.imatrix.gguf | imatrix | 0,1 | Fichero de importancia para generar cuantizaciones propias |
| Forgotten-Hubris-24B-v0.1.i1-Q2_K.gguf | i1-Q2_K | 9,0 | El autor sugiere que IQ3_XXS es probablemente mejor |
| Forgotten-Hubris-24B-v0.1.i1-IQ3_M.gguf | i1-IQ3_M | 10,8 | Sin comentario |
| Forgotten-Hubris-24B-v0.1.i1-Q4_K_S.gguf | i1-Q4_K_S | 13,6 | Tamano, velocidad y calidad optimos segun el autor |

El repositorio completo ocupa 68,2 GB, incluyendo todos los ficheros GGUF y sus particiones. Existe ademas un repositorio paralelo con cuantizaciones estaticas (sin imatrix) en mradermacher/Forgotten-Hubris-24B-v0.1-GGUF.

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base. Lo que se puede afirmar con los datos proporcionados es que Forgotten-Hubris-24B-v0.1 es un merge construido con mergekit (etiquetas mergekit y merge) sobre una base de arquitectura Mistral (etiqueta mistral), con aproximadamente 23,6B parametros en total. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones.

La etiqueta heretic indica que el merge incorpora componentes decensurados o abliterados, es decir, modelos a los que se ha reducido o eliminado el rechazo aprendido durante el alineamiento. Esta tecnica suele implicar la modificacion de direcciones en el espacio de activaciones o la fusion de pesos de variantes alineadas y no alineadas. El resultado habitual es un modelo mas permisivo con contenido sensible, a costa de cierta degradacion en razonamiento, seguimiento de instrucciones estrictas y coherencia en tareas de precision.

La aportacion tecnica de esta ficha concreta es la cuantizacion. mradermacher ha generado las cuantizaciones GGUF con ponderacion por imatrix, un metodo que estima la importancia de cada tensor a partir de estadisticas de activacion y reparte el error de cuantizacion de forma no uniforme. El autor cita el grafo comparativo de ikawrakow y las notas de Artefact2 como referencia sobre la relacion entre tipo de cuantizacion y perplejidad. Las cuantizaciones estan marcadas con la version de cuantizacion 2 (quantize_version: 2) y salida con tensores cuantizados (output_tensor_quantised: 1).

## Capacidades

- Generacion de texto narrativo y creativo: el modelo esta etiquetado explicitamente como creative writing y storytelling, y la etiqueta conversational indica que mantiene dialogos multi-turno.
- Escritura sin censura: las etiquetas nsfw y not-for-all-audiences confirman que no aplica filtros de contenido adulto, lo que lo hace util para ficcion explicita y roleplay.
- Conversacion y roleplay de personajes: el formato de instrucciones y el etiquetado conversacional apuntan a uso en chats de rol con contexto sostenido.
- Capacidades multilingues: limitadas al ingles segun el campo language de la ficha (en). No hay indicacion de soporte para castellano ni otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada; no se documenta soporte.
- Comportamiento como agente y razonamiento multi-paso: no disponible; las etiquetas no mencionan agentes, tool use ni razonamiento explicito.
- Modo thinking o razonamiento extendido: no disponible.
- Vision, audio u otras modalidades: no disponible; el modelo es exclusivamente de texto.
- Ejecucion local en cuantizaciones de 9 a 14 GB: capacidad practica derivada del formato GGUF y de los tamanos publicados.

## Casos de uso

- Escritura de ficcion larga en local: con cuantizaciones i1-Q4_K_S de 13,6 GB, un usuario con una GPU de 24 GB puede generar novelas, relatos por capitulos o sagas manteniendo estilo y personajes entre sesiones, sin depender de APIs externas ni de filtros de contenido.
- Roleplay conversacional para adultos: el modelo esta etiquetado como nsfw y conversational, por lo que encaja en aplicaciones de chat de rol con personajes, donde la ausencia de rechazo es un requisito funcional y no un defecto.
- Generacion de dialogos para guiones y videojuegos: util para producir lineas de personaje con tono y voz consistentes, y para iterar rapidamente sobre variantes de dialogo en un pipeline de escritura.
- Asistente de escritura personal sin conexion: al ejecutarse con llama.cpp u Ollama en una estacion de trabajo con GPU consumer, sirve como herramienta de redaccion creativa totalmente offline, sin enviar texto del usuario a terceros.
- Prototipado de sistemas de generacion creativa: investigadores que estudian el efecto de la abliteracion en la calidad del texto pueden usar estas cuantizaciones para comparar el modelo heretic contra su equivalente alineado sin necesidad de infraestructura de datacenter.
- Banco de pruebas de cuantizacion: el repositorio incluye 24 tipos de cuantizacion distintos y un fichero imatrix de 0,1 GB, lo que permite estudiar empiricamente la degradacion de perplejidad y de calidad narrativa segun el nivel de compresion en un modelo de 23,6B.
- Generacion de contenido para plataformas de ficcion interactiva: integrable como backend de texto en motores de aventuras conversacionales o chatbots de entretenimiento, siempre que la plataforma asuma contenido explicito.
- Fine-tuning posterior sobre estilo propio: las cuantizaciones Q4_K_M y Q5_K_M son habituales como punto de partida para LoRAs en herramientas como llama.cpp o Unsloth, aunque conviene partir de los safetensors originales para tareas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo, tanto en el repositorio de cuantizaciones como en los metadatos, no incluye puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar. Las busquedas web realizadas no han devuelto resultados relacionados con el modelo, la arquitectura o su evaluacion. Tampoco se han encontrado comparativas de perplejidad especificas para estas cuantizaciones i1.

El unico dato de rendimiento indirecto es el grafo de comparacion de tipos de cuantizacion citado por el autor (https://www.nethype.de/huggingface_embed/quantpplgraph.png), que ilustra la relacion general entre tipo de cuantizacion y perplejidad, no valores concretos de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 9 y 11 GB en i1-Q2_K e i1-IQ3_M (tamano de fichero 9,0 y 10,8 GB respectivamente, mas overhead de contexto y cache KV), y en torno a 14-16 GB en i1-Q4_K_S (fichero de 13,6 GB). En precision completa (fp16) el modelo base requiere aproximadamente 47 GB solo para los pesos.
- GPU recomendadas: para Q4_K_S o superior, GPUs de 24 GB como RTX 3090, RTX 4090, RTX 5090, L4 (24 GB) o A10G (24 GB). Para IQ3_M, tarjetas de 12-16 GB como RTX 4070 Ti Super, RTX 4080 o RTX 3060 de 12 GB con contexto reducido. Con A100 40/80 GB o H100 se puede ejecutar en fp16 sin cuantizar.
- Compatibilidad con GPU consumer: si. El modelo cabe en tarjetas consumer de gama alta: RTX 4090 o 3090 (24 GB) ejecutan i1-Q4_K_S, i1-Q5_K_M e incluso i1-Q6_K con contexto moderado; RTX 4080 y 4070 Ti Super (16 GB) ejecutan i1-IQ3_M y i1-Q4_K_S con contexto limitado; RTX 3060 de 12 GB ejecuta i1-Q2_K e i1-IQ3_M con contexto corto. La VRAM adicional depende de la longitud de contexto configurada y del uso de cache KV cuantizada.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, KoboldCpp, text-generation-webui (oobabooga), llama-cpp-python y servidores compatibles con la API de OpenAI mediante llama.cpp. vLLM y TGI tienen soporte limitado o experimental para GGUF, por lo que no son la via recomendada para este repositorio. Los ficheros son compatibles con endpoints_compatible segun las etiquetas del modelo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones. Como referencia orientativa no verificada, un modelo denso de 23,6B en Q4_K_S suele generar en el rango de 20 a 40 tokens por segundo en una RTX 4090 con llama.cpp, pero este dato no procede de la informacion proporcionada y debe tratarse como estimacion general, no como medicion de este modelo.
- Particionado: al tratarse de GGUF, los ficheros grandes se dividen en partes; el autor remite a los README de TheBloke para instrucciones de concatenacion de ficheros multiparte.

## Comparativa con modelos similares

No hay benchmarks publicados de Forgotten-Hubris-24B-v0.1, por lo que la comparacion de rendimiento no puede establecerse con datos. La tabla siguiente recoge solo caracteristicas estructurales verificables de alternativas del mismo rango de parametros y uso creativo. Los datos de los modelos comparados proceden de sus fichas publicas conocidas y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Formato | Perfil |
|---|---|---|---|---|---|
| Forgotten-Hubris-24B-v0.1 (esta cuantizacion) | 23,6B | no disponible | Apache 2.0 | GGUF (safetensors en el base) | Merge heretic sin censura, solo ingles, escritura creativa |
| Mistral Small 3 / Mistral-Small-24B-Instruct | 24B | 32k (segun ficha publica de Mistral) | Apache 2.0 | safetensors, GGUF de terceros | Instruct alineado, multilingue, proposito general |
| Gemma 2 27B | 27B | 8k (segun ficha publica de Google) | Licencia Gemma (uso comercial con condiciones) | safetensors, GGUF de terceros | Instruct alineado, buen razonamiento, restricciones de licencia |
| Qwen2.5 32B | 32,5B | 128k (segun ficha publica de Alibaba) | Apache 2.0 | safetensors, GGUF de terceros | Instruct alineado, multilingue, fuerte en codigo y matematicas |

Diferencias clave frente a esas alternativas: Forgotten-Hubris no esta alineado para rechazar contenido sensible, no documenta contexto ni benchmarks, y solo declara soporte de ingles. A cambio, ofrece cuantizaciones imatrix mantenidas por mradermacher y una orientacion explicita a narrativa sin restricciones, algo que las alternativas alineadas no proporcionan sin tecnicas adicionales de decensurado. Otros merges heretic de 22-24B basados en Mistral son los competidores mas directos, pero no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido explicito: las etiquetas nsfw y not-for-all-audiences indican que el modelo puede generar material sexual, violento o sensible. No es apto para productos dirigidos a menores ni para entornos con politicas de contenido.
- Ausencia de alineamiento de seguridad: al ser un merge heretic, el modelo previsiblemente no rechazara peticiones daninas. No debe exponerse como API publica sin una capa de moderacion externa.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual. Un modelo de escritura creativa decensurado tiende a priorizar coherencia narrativa sobre exactitud, por lo que no es fiable para consultas factuales, medicas, legales o financieras.
- Solo ingles: el campo language declara unicamente en. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Longitud de contexto desconocida: no se especifica la ventana de contexto del modelo base. Configurar contextos largos en llama.cpp puede degradar la coherencia o provocar errores si se supera la ventana real entrenada.
- Degradacion por cuantizacion: las cuantizaciones de 2 y 3 bits (Q2_K, IQ2_*, IQ3_*) reducen notablemente la calidad. El propio autor advierte que IQ3_XXS es probablemente mejor que Q2_K pese al nombre. Para trabajo serio conviene Q4_K_S o superior.
- Procedencia del merge no verificada: no se documenta la lista completa de modelos fusionados, sus pesos ni la receta de mergekit. Esto dificulta auditar sesgos heredados de los componentes originales.
- Sesgos desconocidos: al no publicarse la composicion del dataset ni evaluaciones, no se pueden enumerar sesgos concretos de genero, raza, religion u orientacion. Un modelo entrenado mayoritariamente con narrativa en ingles heredara los sesgos de ese corpus.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero la licencia se declara sobre el merge y no se acompanan garantias sobre la procedencia licencial de todos los componentes fusionados. Conviene revisar las licencias de los modelos de origen antes de un despliegue comercial.
- Sin soporte ni mantenimiento documentado: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones, lo que implica ausencia de comunidad y de soporte ante problemas.
- Fecha de creacion inusual: los metadatos indican creacion el 2026-09-14, posterior a la fecha habitual de consulta. Se reproduce el dato tal cual figura en la ficha, sin interpretacion adicional.
- Herramientas de despliegue: al ser GGUF, no es compatible de forma nativa con vLLM o TGI en su configuracion estandar; requiere llama.cpp u Ollama, lo que limita el escalado en servidores con batching continuo.

## Enlaces

- Repositorio de cuantizaciones i1 (esta ficha): https://huggingface.co/mradermacher/Forgotten-Hubris-24B-v0.1-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Forgotten-Hubris-24B-v0.1-GGUF
- Modelo base en safetensors: https://huggingface.co/merviscishes/Forgotten-Hubris-24B-v0.1
- Pagina de resumen y lista de descargas del autor: https://hf.tst.eu/model#Forgotten-Hubris-24B-v0.1-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de tipos de cuantizacion de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del patrocinador de las cuantizaciones (nethype GmbH): https://www.nethype.de/
