# mradermacher/Starlight-Synthesis-31B-i1-GGUF

## Resumen

Starlight-Synthesis-31B-i1-GGUF es el conjunto de cuantizaciones GGUF del modelo Cyclone-Labs/Starlight-Synthesis-31B, publicadas por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión a formatos GGUF de 1 a 6 bits (con mezcla de cuantizaciones "i1" generadas con fichero imatrix) pensada para ejecutar el modelo original en hardware de consumo mediante llama.cpp, Ollama, LM Studio o koboldcpp. El modelo base es una fusión de pesos generada con mergekit y orientada a roleplay, narrativa y conversación.

El modelo cuenta con 30.697.345.596 parámetros reales (aproximadamente 30,7 mil millones), lo que lo sitúa en la franja de los 31B, y se distribuye bajo licencia Apache 2.0, con el inglés como único idioma declarado. El repositorio ocupa 248,9 GB en total porque incluye 14 ficheros GGUF de cuantizaciones distintas más el fichero imatrix, desde 7,8 GB (i1-IQ1_M) hasta 25,3 GB (i1-Q6_K).

Su relevancia es práctica: permite desplegar un modelo de 31B especializado en diálogo narrativo en GPUs de 24 GB (RTX 3090/4090) o incluso en equipos con 8-12 GB de VRAM usando cuantizaciones agresivas, algo imposible con los pesos en precisión completa. El repositorio no incluye información sobre arquitectura interna, ventana de contexto, datos de entrenamiento ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es una fusión de pesos generada con mergekit; no se especifica la arquitectura subyacente) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica si el modelo base es MoE o denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (cuantizaciones ponderadas con imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Desarrollador de la cuantizacion | mradermacher |
| Modelo base | Cyclone-Labs/Starlight-Synthesis-31B |
| Tamano del repositorio | 248,9 GB |
| Etiquetas | transformers, gguf, mergekit, merge, roleplay, storytelling, conversational, imatrix, endpoints_compatible |
| Descargas / likes | 0 / 0 |
| Cuantizaciones estaticas alternativas | repositorio mradermacher/Starlight-Synthesis-31B-GGUF |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Lo unico documentado es que Cyclone-Labs/Starlight-Synthesis-31B se ha construido con mergekit, es decir, mediante fusion de pesos (weight merging) de varios modelos preexistentes, no mediante un entrenamiento desde cero. Las etiquetas del repositorio (roleplay, storytelling, merge) confirman ese enfoque: se trata de un modelo orientado a generacion narrativa y conversacional en ingles. No se especifica si la arquitectura resultante es un transformer denso, un MoE o un hibrido, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO.

En cuanto al trabajo de cuantizacion, mradermacher ha generado dos familias de ficheros: cuantizaciones "i1" (variante que aplica un fichero imatrix, incluido en el repositorio con 0,1 GB, y que en la propia tabla del autor se marca como de mayor calidad que las estaticas equivalentes) y un conjunto de cuantizaciones estaticas publicadas en un repositorio aparte. La model card indica que, tratandose de un modelo de vision, los ficheros mmproj, si existen, estarian en el repositorio de cuantizaciones estaticas; en este repositorio no se lista ningun fichero mmproj, por lo que no se puede confirmar capacidad multimodal alguna.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en roleplay y storytelling.
- Mantenimiento de personajes y estilos narrativos en conversaciones de varios turnos (segun las etiquetas del autor).
- Escritura creativa: continuacion de relatos, dialogos y descripciones.
- Razonamiento general, matematicas y generacion de codigo: no documentado en la informacion disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles declarado; no hay evidencia de soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): el modelo base figura como modelo de vision en una nota generica de la plantilla de la model card, pero no se incluye ningun fichero mmproj en este repositorio, por lo que no se puede confirmar.

## Casos de uso

- Chatbots de personajes en produccion: el modelo esta ajustado para roleplay y conversacion; con la cuantizacion i1-Q4_K_M (18,8 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB, permitiendo servir personajes con respuesta en tiempo real en una sola GPU.
- Escritura asistida de ficcion interactiva: integrado en una herramienta de escritura local (LM Studio, koboldcpp) para generar variantes de escenas, dialogos o desenlaces manteniendo un tono consistente.
- Generacion de dialogos para videojuegos: produccion de arboles de dialogo ramificados y texto de relleno para NPC, con cuantizaciones de 11-19 GB desplegables en un servidor con una GPU profesional.
- Narrativa para partidas de rol de mesa (TTRPG): asistente de director de juego que improvisa PNJ, descripciones y consecuencias a partir del estado de la partida descrito en el prompt.
- Generacion de datos sinteticos de dialogo: uso de las cuantizaciones bajas (i1-IQ2_XXS, 8,8 GB) para producir grandes volumenes de conversaciones etiquetadas a bajo coste computacional, que despues se filtran y se usan para ajustar modelos mas pequenos.
- Prestaciones de escritura con privacidad estricta: la ejecucion local mediante llama.cpp u Ollama evita enviar manuscritos o guiones a servicios externos, algo relevante para editoriales y estudios con material bajo confidencialidad.
- Evaluacion previa a un despliegue en precision completa: permite comparar la calidad de las distintas cuantizaciones (de IQ1_M a Q6_K) antes de invertir en el modelo en safetensors, que ronda los 61 GB en fp16.
- Despliegue en portatiles con GPU de 8-12 GB: unicamente viable con las cuantizaciones IQ1/IQ2 (7,8-12 GB de pesos), aceptando una perdida de calidad notable que el propio autor califica de "desesperada" en el caso de IQ1_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni de evaluaciones de calidad narrativa, y el modelo base tampoco aporta metricas en los datos proporcionados. La unica referencia cualitativa es la grafica de perplejidad enlazada por el autor (comparacion de tipos de cuantizacion de baja calidad) y las notas de la tabla de ficheros, que indican calidad relativa entre cuantizaciones, no rendimiento absoluto del modelo.

## Requisitos de hardware

La siguiente tabla estima la VRAM necesaria a partir del tamano de los pesos mas un margen para cache KV y sobrecarga del runtime, asumiendo contextos moderados y un solo usuario. La ventana de contexto real del modelo no esta documentada, por lo que el consumo de cache KV puede variar.

| Cuantizacion | Pesos | VRAM estimada en inferencia |
|---|---|---|
| i1-IQ1_M | 7,8 GB | ~9-10 GB |
| i1-IQ2_XXS | 8,8 GB | ~10-11 GB |
| i1-IQ2_M | 11,0 GB | ~12-13 GB |
| i1-Q2_K_S | 11,1 GB | ~12-13 GB |
| i1-Q2_K | 12,0 GB | ~13-14 GB |
| i1-IQ3_XXS | 12,2 GB | ~13-15 GB |
| i1-Q3_K_S | 13,9 GB | ~15-16 GB |
| i1-IQ3_M | 14,5 GB | ~16-17 GB |
| i1-Q3_K_M | 15,4 GB | ~17-18 GB |
| i1-Q3_K_L | 16,7 GB | ~18-19 GB |
| i1-IQ4_XS | 16,8 GB | ~18-20 GB |
| i1-Q4_K_S | 17,9 GB | ~19-21 GB |
| i1-Q4_K_M | 18,8 GB | ~20-22 GB |
| i1-Q6_K | 25,3 GB | ~27-29 GB |

- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) ejecuta comodamente i1-IQ4_XS, i1-Q4_K_S y i1-Q4_K_M, que es la configuracion recomendada por el autor para equilibrio tamano/velocidad/calidad. i1-Q6_K queda al limite y depende del contexto.
- GPU de 12-16 GB (RTX 4070 Ti, RTX 4080, A4000): viables i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S e i1-IQ3_M, con impacto en calidad.
- GPU de 8-10 GB (RTX 3060 Ti, RTX 4060): solo i1-IQ1_M e i1-IQ2_XXS, con la perdida de calidad que el propio autor advierte.
- Multi-GPU: dos RTX 3060 de 12 GB permiten repartir cuantizaciones de 18-20 GB con llama.cpp mediante offload por capas.
- Memoria unificada: equipos Apple Silicon con 32 GB o 64 GB pueden ejecutar las cuantizaciones Q4 y Q6 compartiendo memoria entre CPU y GPU.
- Opciones de despliegue: llama.cpp / llama-server, Ollama, LM Studio, koboldcpp, text-generation-webui y Jan. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo base en safetensors o una conversion a AWQ/GPTQ no incluida en este repositorio.
- Latencia y throughput: no disponibles; no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus alternativas, por lo que la comparativa se limita a los artefactos publicados alrededor de este mismo modelo. No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria (31B orientados a roleplay y narrativa) con datos verificables.

| Artefacto | Parametros | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Starlight-Synthesis-31B-i1-GGUF | 30,7 B | GGUF (14 cuantizaciones i1) | 7,8-25,3 GB por fichero | Apache 2.0 | Cuantizaciones ponderadas con imatrix |
| mradermacher/Starlight-Synthesis-31B-GGUF | 30,7 B | GGUF (cuantizaciones estaticas) | no disponible | Apache 2.0 | Repositorio hermano, incluiria los ficheros mmproj si existieran |
| Cyclone-Labs/Starlight-Synthesis-31B | 30,7 B | safetensors | ~61 GB en fp16 (estimado a partir del numero de parametros) | Apache 2.0 | Modelo base, fusion mergekit |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser una fusion de modelos entrenados mayoritariamente con datos en ingles, es previsible que herede los sesgos de sus componentes, pero no hay evaluacion publicada.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el uso narrativo tolera invenciones, pero desaconseja su empleo en tareas factuales sin verificacion.
- Idioma: solo ingles declarado. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Ventana de contexto: desconocida, lo que impide planificar despliegues con documentos largos o conversaciones extensas sin pruebas previas.
- Cuantizaciones de baja precision: el autor advierte explicitamente de que i1-IQ1_M es "desesperada", i1-Q2_K_S es de "calidad muy baja" e i1-Q3_XXS es de "calidad inferior". Para produccion conviene partir de i1-Q4_K_S o superior.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base y de los modelos fusionados que lo componen deberia verificarse por separado antes de un despliegue comercial.
- Multimodalidad: la nota del autor sobre vision y ficheros mmproj no se puede confirmar en este repositorio, que no contiene dichos ficheros.
- Adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni informes de comportamiento en produccion.
- Modelo derivado: al ser una cuantizacion, cualquier limitacion del modelo base se hereda sin cambios; ademas, las cuantizaciones introducen degradacion adicional respecto a los pesos originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Starlight-Synthesis-31B-i1-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Starlight-Synthesis-31B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Starlight-Synthesis-31B-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Starlight-Synthesis-31B-i1-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente sitios de tipos de cambio). No se han encontrado papers, blogs tecnicos, repositorios adicionales ni demos asociados al modelo en la informacion disponible.
