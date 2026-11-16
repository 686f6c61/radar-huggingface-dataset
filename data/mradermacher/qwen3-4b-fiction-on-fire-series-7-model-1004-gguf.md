# mradermacher/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004-GGUF

## Resumen

Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004, publicada por el usuario mradermacher. El modelo subyacente es un fine-tune y merge orientado especificamente a la escritura creativa de ficcion, con enfasis en generacion de tramas, subtramas, continuacion de escenas y roleplaying narrativo. Parte de la base arquitectonica de Qwen3-4B, un transformer denso de 4.022.468.096 parametros.

La relevancia de esta publicacion es practica: mradermacher ofrece el modelo original (alojado en bfloat16) en doce variantes GGUF que van desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite ejecutar un modelo de escritura creativa de 4 mil millones de parametros en hardware de consumo, desde portatiles modestos hasta estaciones con GPU dedicada. El repositorio ocupa 36,4 GB en total por acumulacion de todas las variantes.

El modelo esta etiquetado para generacion de ficcion en multiples generos (ciencia ficcion, romance, terror), admite roleplaying y contiene advertencias explicitas sobre lenguaje soez (swearing) en sus tags, lo que indica que no aplica un filtrado de contenido agresivo. La licencia es Apache 2.0 y los idiomas declarados son ingles, frances, chino y aleman.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fr, zh, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors/bfloat16 |
| Tamano del repositorio | 36,4 GB (todas las variantes) |
| Modelo base | DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004 |
| Cuantizador | mradermacher (cuantizaciones estaticas, no imatrix) |
| Fecha de creacion | 2025-06-05 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-4B, un transformer denso de 4 mil millones de parametros. Sobre esa base, DavidAU ha aplicado un proceso de fine-tune y merge orientado a escritura de ficcion, segun indican las etiquetas del repositorio (finetune, merge). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta publicacion concreta es la cuantizacion: mradermacher genera cuantizaciones estaticas (no imatrix) con la herramienta de conversion a GGUF, partiendo de los pesos en bfloat16 del modelo original. El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004-i1-GGUF). La model card incluye referencias a la comparativa de perplejidad de ikawrakow y al analisis de Artefact2 sobre tipos de cuantizacion.

## Capacidades

- Generacion de ficcion y prosa narrativa: escritura de relatos, novelas y escenas con enfasis en prosa vivida (vivid prose), segun las etiquetas del autor.
- Generacion de tramas y subtramas: el modelo esta etiquetado explicitamente para plot generation y sub-plot generation.
- Continuacion de escenas: capacidad de scene continue, es decir, retomar un texto narrativo existente y prolongarlo de forma coherente.
- Roleplaying y conversacion narrativa: etiquetado para rp y roleplaying, con soporte de dialogos multi-turno en contextos de ficcion.
- Cobertura de generos: ciencia ficcion, romance, terror y, en general, todos los generos (all genres).
- Multilingue: ingles, frances, chino y aleman declarados.
- Tono sin filtros: las etiquetas incluyen swearing, lo que sugiere menor censura en el registro coloquial o soez.
- No se ha documentado en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Escritura asistida de novelas y relatos: el modelo puede generar borradores de capitulos completos a partir de una premisa, manteniendo el tono y el estilo narrativo gracias a su especializacion en ficcion. Adecuado para autores que necesitan superar el bloqueo creativo.
- Generacion de tramas y subtramas para guiones: dado un conflicto principal, el modelo produce arcos secundarios y giros argumentales, util en preproduccion audiovisual o en el diseno de campanas de juegos de rol.
- Continuacion de escenas en editores de texto: integrado en un editor con llama.cpp u Ollama, permite seleccionar un fragmento y pedir la continuacion, manteniendo coherencia con el texto previo.
- Roleplaying narrativo en aplicaciones de chat: el modelo sostiene conversaciones multi-turno con personajes ficticios, con registro coloquial y sin filtros excesivos, adecuado para plataformas de entretenimiento conversacional.
- Generacion de ficcion en varios idiomas: para equipos que producen contenido en ingles, frances, chino o aleman, el modelo puede generar texto en esos idiomas sin cambiar de modelo.
- Prototipado rapido en hardware de consumo: con la variante Q4_K_M (2,6 GB), un desarrollador puede desplegar un generador de ficcion en un portatil con 8 GB de RAM y validar un producto editorial antes de escalar a modelos mayores.
- Generacion de contenido para videojuegos: dialogos de NPC y descripciones de mundo generadas en tiempo de ejecucion, con la variante Q4_K_S (2,5 GB) para mantener latencia baja en equipos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K ~1,8 GB; Q3_K_S ~2,0 GB; Q3_K_M ~2,2 GB; Q3_K_L ~2,3 GB; IQ4_XS ~2,4 GB; Q4_K_S ~2,5 GB; Q4_K_M ~2,6 GB; Q5_K_S ~2,9 GB; Q5_K_M ~3,0 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las variantes Q4; una RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100 o H100 ejecutan sin problema la variante f16 completa.
- Cabe en GPU de consumo: si. Las variantes Q4_K_S y Q4_K_M (2,5-2,6 GB) caben en GPUs de 4 GB o incluso en CPU con RAM suficiente. La variante f16 (8,2 GB) requiere una GPU de 8-10 GB o RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque esta publicacion concreta es GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004 (este) | 4,02 B | no disponible | Ficcion y roleplaying | Apache 2.0 | GGUF |
| Qwen3-4B (base) | 4,02 B | no disponible | Proposito general | Apache 2.0 | safetensors, GGUF |
| DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004 (original) | 4,02 B | no disponible | Ficcion y roleplaying | Apache 2.0 | safetensors (bfloat16) |
| Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004-i1-GGUF (imatrix) | 4,02 B | no disponible | Ficcion y roleplaying | Apache 2.0 | GGUF (imatrix) |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento que permitan contrastarlo con alternativas de otros desarrolladores. La diferencia principal entre las variantes es el metodo de cuantizacion: estatica (este repositorio) frente a imatrix (repositorio i1), que suele ofrecer mejor calidad por bit a costa de mayor tiempo de generacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un fine-tune de ficcion sin filtrado aparente, puede reproducir estereotipos presentes en el corpus literario de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos generativos de 4 mil millones de parametros; en contextos narrativos puede ser aceptable, pero en usos factuales es elevado.
- Limitaciones de contexto: la longitud de contexto no esta documentada en esta ficha; conviene verificar la model card del modelo base antes de usarlo con entradas largas.
- Idiomas: solo se declaran en, fr, zh y de; el castellano no figura entre los idiomas soportados, por lo que la calidad en espanol no esta garantizada.
- Contenido soez: la etiqueta swearing indica que el modelo puede generar lenguaje soez sin filtrado, lo que exige moderacion adicional en productos dirigidos al publico general.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del proceso de merge para confirmar la compatibilidad.
- Cuantizaciones estaticas: las variantes de este repositorio no son imatrix; para maxima calidad por bit se recomienda el repositorio i1 del mismo autor.
- Modelo de 4 B: no es adecuado para tareas de razonamiento complejo, matematicas avanzadas o codigo en produccion; su dominio es la prosa creativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3-4B-Fiction-On-Fire-Series-7-Model-1004-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
