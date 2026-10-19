# ReadyArt/Dark-Scarlett-27B-v3.0-GGUF

## Resumen

Dark-Scarlett-27B-v3.0-GGUF es la versión cuantizada en formato GGUF del modelo ReadyArt/Dark-Scarlett-27B-v3.0, un modelo de lenguaje de 27.320.697.856 parámetros (27,32 mil millones) publicado por el usuario ReadyArt en HuggingFace. Se trata de un modelo afinado para roleplay, conversación instructiva y contenido para adultos (las etiquetas del repositorio incluyen `roleplay`, `conversational`, `instruct`, `nsfw`, `adult-content`, `unaligned`, `mature`, `explicit` y `erp`), es decir, sin alineamiento de seguridad orientado a rechazar contenido explícito. La licencia declarada es Apache 2.0.

El problema que resuelve es el de disponer de un modelo de gran tamaño (≈27B) ejecutable en hardware local mediante llama.cpp y derivados, sin depender de API externas y sin los filtros de seguridad habituales en modelos comerciales. Resulta relevante para quienes construyen experiencias narrativas interactivas, personajes conversacionales o investigación sobre modelos sin alinear, y necesitan control total sobre el contenido generado y sobre la infraestructura.

La información publicada por el autor es muy escasa: la model card consiste casi íntegramente en estilos CSS y elementos decorativos, sin datos técnicos sobre arquitectura, datos de entrenamiento, longitud de contexto o idiomas. El repositorio ocupa 108,8 GB, lo que sugiere la presencia de múltiples niveles de cuantización del modelo base, y la etiqueta `imatrix` indica el uso de matrices de importancia para calibrar dichas cuantizaciones. El modelo cuenta con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica la arquitectura; por el recuento de parametros, 27.320.697.856, se trata de un modelo denso de ~27B, sin confirmacion oficial) |
| Parametros totales | 27.320.697.856 (27,32B), dato real procedente de safetensors del modelo base |
| Parametros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con calibracion `imatrix` (etiqueta del repositorio). Los niveles concretos no se detallan en la informacion disponible; el tamano del repo (108,8 GB) sugiere multiples variantes, desde F16 hasta cuantizaciones de 2-4 bits |
| Idiomas soportados | no disponibles (no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base se distribuye en safetensors (el recuento de parametros procede de safetensors) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La model card del autor no incluye ninguna seccion tecnica utilizable: el contenido del README son reglas CSS, animaciones y bloques decorativos. Tampoco se documenta el proceso de cuantizacion mas alla de la etiqueta `imatrix`, que en el ecosistema llama.cpp indica que los tensores se cuantizaron ponderando su importancia mediante una matriz de calibracion, lo que habitualmente reduce la perdida de calidad en cuantizaciones agresivas (Q3, Q4).

La unica informacion estructural fiable es la relacion declarada con el modelo base (`base_model: ReadyArt/Dark-Scarlett-27B-v3.0`, `base_model_relation: quantized`) y el recuento exacto de parametros. Cualquier afirmacion sobre atencion lineal, decodificacion especulativa, mezcla de expertos o estrategia de alineamiento seria especulativa y no se incluye aqui.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay y narrativa interactiva, segun las etiquetas `roleplay` y `conversational` del repositorio.
- Respuesta a instrucciones en formato instruct (`instruct`), apta para plantillas de chat.
- Generacion de contenido adulto explicito y escenarios de ERP (erotic roleplay), sin alineamiento de seguridad declarado (`unaligned`, `mature`, `explicit`, `nsfw`).
- Ejecucion local en CPU y GPU mediante el formato GGUF y el ecosistema llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su integracion tras una API compatible con OpenAI.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles (no se declara cobertura de idiomas).

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo puede mantener personajes coherentes en sesiones multi-turno; su tamano de 27B le permite sostener registro, estilo y memoria de contexto muy superior al de modelos de 7B-8B, aunque la longitud exacta de contexto no esta documentada y debe verificarse experimentalmente.
- Motores de personajes (NPC) en videojuegos y experiencias narrativas: se puede desplegar una instancia local por servidor con llama.cpp y alimentar dialogos dinamicos sin coste por token ni dependencia de terceros.
- Escritura creativa y ficcion adulta: generacion y continuacion de relatos, dialogos y escenas explicitas sin los rechazos tipicos de modelos alineados, lo que lo hace util para editoriales de ficcion para adultos o plataformas de contenido.
- Investigacion sobre seguridad y red teaming: al ser un modelo `unaligned`, sirve como sujeto de estudio para medir tasas de cumplimiento de peticiones nocivas, eficacia de clasificadores de salida y comportamiento de filtros externos.
- Prototipado de aplicaciones conversacionales sin filtros: equipos que necesitan evaluar la viabilidad de un producto conversacional antes de decidir si invierten en un modelo alineado o en uno propio.
- Despliegue en estaciones de trabajo con GPU de consumo: una cuantizacion Q4 permite ejecutar el modelo en una RTX 4090 o RTX 3090 (24 GB de VRAM) con contexto moderado, habilitando asistentes personales y automatizaciones offline.
- Generacion de dialogos para guiones y doblaje: produccion de variantes de dialogo con tono y registro controlados mediante prompting, integrable en un pipeline de postproduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y los resultados de busqueda web obtenidos no contienen informacion relacionada con el modelo.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones calculadas a partir del recuento de parametros (27,32B) y de los bits por peso habituales en llama.cpp; no proceden de mediciones publicadas del autor.

- Cuantizacion F16: ~54,6 GB de pesos. Requiere A100 80 GB, H100 80 GB o dos GPU de 48 GB.
- Cuantizacion Q8_0: ~29 GB. Requiere A100 40 GB, dos RTX 4090 (24 GB) o una GPU de 32-48 GB.
- Cuantizacion Q6_K: ~22,4 GB. Cabe en una RTX 3090/4090 de 24 GB, pero con poco margen para cache KV en contextos largos.
- Cuantizacion Q5_K_M: ~19,4 GB. Cabe en GPU de 24 GB con espacio para contexto moderado.
- Cuantizacion Q4_K_M: ~16,5 GB. Es la opcion recomendada para GPU de consumo (RTX 4090, 3090, 4080 Super de 16 GB con contexto reducido) y para configuraciones CPU+RAM.
- Cuantizacion Q3_K_M: ~13,7 GB. Cabe en GPU de 16 GB; la perdida de calidad respecto a Q4 no esta documentada.
- Cuantizacion Q2_K: ~10 GB. Cabe en GPU de 12 GB y en equipos solo-CPU con 16 GB de RAM; calidad degradada de forma notable en modelos de este tamano.
- Ejecucion solo en CPU: viable con 32 GB de RAM o mas para Q4_K_M, con throughput bajo (del orden de pocos tokens por segundo en CPUs de escritorio; no hay mediciones publicadas).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python, text-generation-webui. vLLM y TGI no estan pensados para GGUF de forma nativa; para servirlos en produccion conviene partir del modelo base en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor y dependen por completo del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentacion publica y deben verificarse antes de tomar decisiones; no se dispone de comparaciones de rendimiento con Dark-Scarlett porque este no publica benchmarks.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Formato |
|---|---|---|---|---|---|
| Dark-Scarlett-27B-v3.0-GGUF | 27,32B | no disponible | Apache 2.0 | Roleplay y contenido adulto sin alinear | GGUF (y safetensors en el base) |
| Mistral Small 3 (24B) | 24B | 32k | Apache 2.0 | Instructivo generalista | Safetensors, GGUF |
| Gemma 2 27B | 27B | 8k | Gemma Terms of Use | Instructivo generalista | Safetensors, GGUF |
| Qwen2.5 32B Instruct | 32,5B | 131k | Apache 2.0 | Instructivo generalista y multilingue | Safetensors, GGUF |

Frente a estas alternativas, Dark-Scarlett no aporta datos de contexto ni de rendimiento, pero se diferencia en el enfoque (ausencia de alineamiento de seguridad) y en la licencia Apache 2.0, mas permisiva que la de Gemma 2. Su principal desventaja es la falta total de documentacion y de validacion por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: el modelo esta etiquetado como `unaligned` y `not-for-all-anchaged audiences`; no rechaza contenido explicito ni, presumiblemente, peticiones nocivas. No debe exponerse a usuarios no verificados ni a menores sin filtros adicionales.
- Contenido sexual explicito: las etiquetas `nsfw`, `explicit` y `erp` indican que el modelo produce contenido para adultos de forma deliberada. Cualquier despliegue publico requiere verificacion de edad y moderacion externa.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual; en roleplay el modelo puede inventar hechos, especialmente si se le pide informacion tecnica o historica.
- Documentacion inexistente: la model card es practicamente decorativa. No se conocen arquitectura, contexto real, idiomas, datos de entrenamiento ni proceso de cuantizacion, lo que dificulta evaluar riesgos y planificar la integracion.
- Idiomas no declarados: el rendimiento en castellano o en idiomas distintos del ingles es desconocido y debe probarse empiricamente antes de usarlo en produccion.
- Longitud de contexto desconocida: la ventana real puede ser inferior a lo que el usuario configure en llama.cpp; configurar un contexto mayor del que soporta el modelo produce degradacion silenciosa.
- Sesgos no evaluados: al no haber evaluaciones, no se pueden anticipar sesgos de genero, raza, orientacion sexual o religion, que suelen ser mas acusados en modelos no alineados.
- Validacion comunitaria nula: 0 descargas y 0 likes implican que la cuantizacion no ha sido verificada por terceros; existe riesgo de cuantizacion defectuosa o de pesos corruptos. Conviene validar la perplejidad y la coherencia antes de confiar en el repositorio.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad sobre el contenido generado; la responsabilidad legal del uso recae en el desplegador.
- Sin soporte para fine-tuning directo sobre el GGUF: para entrenar hay que partir del modelo base en safetensors.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v3.0-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v3.0
- Perfil del autor: https://huggingface.co/ReadyArt
- No se han encontrado enlaces adicionales (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
