# mradermacher/gemma-4-12b-it-roleplay-sft-epoch2-bf16-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo ChatoyantAI/gemma-4-12b-it-roleplay-sft-epoch2-bf16, un ajuste fino por supervisión (SFT) orientado a roleplay y conversación publicado por ChatoyantAI. El trabajo de cuantización lo firma mradermacher, un autor conocido por generar versiones GGUF estáticas de modelos de terceros para su uso con llama.cpp y derivados. El modelo cuenta con 11.907.350.576 parámetros (unos 11,9 mil millones), según los pesos safetensors del modelo original.

El interés práctico de esta ficha está en el formato: el repositorio ofrece un abanico amplio de cuantizaciones (desde Q2_K de 4,9 GB hasta Q8_0 de 12,8 GB), lo que permite ejecutar un modelo de casi 12B en GPUs de consumo e incluso en equipos con 8-12 GB de VRAM, algo inviable con los pesos bf16 originales. Se incluyen además dos ficheros `mmproj` (proyector multimodal), lo que apunta a una arquitectura unificada texto-imagen, aunque la model card no documenta capacidades de visión de forma explícita.

La relevancia es acotada y muy específica: se trata de un modelo de nicho para roleplay conversacional en inglés, con 0 descargas y 0 likes en el momento de la consulta, licencia Apache 2.0 y sin benchmarks publicados. Es útil para quien quiera experimentar con diálogo con personalidad, prototipado narrativo o investigación sobre ajuste SFT, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiqueta de arquitectura `gemma4_unified` (transformer, sin confirmación de componentes MoE o SSM) |
| Parametros totales | 11.907.350.576 (~11,9B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyectores mmproj-f16 y mmproj-Q8_0. Cuantizaciones ponderadas/imatrix no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en bf16/safetensors |
| Modelo base | ChatoyantAI/gemma-4-12b-it-roleplay-sft-epoch2-bf16 |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 83,7 GB |
| Libreria declarada | transformers |
| Pipeline | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de la etiqueta `gemma4_unified`, asociada a la familia Gemma 4 en su variante "unified". El modelo base es un ajuste fino por SFT (etiquetas `sft`, `bf16`, `roleplay`, `conversational`) sobre un modelo ya instruido, entrenado durante 2 epocas segun el propio nombre del repositorio. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO.

La presencia de ficheros `mmproj-f16.gguf` y `mmproj-Q8_0.gguf` indica que el modelo original incluye un proyector multimodal que se puede cargar junto con los pesos cuantizados, presumiblemente para entrada de imagenes. La model card del repositorio GGUF no describe esta capacidad ni sus limites, por lo que debe tratarse como no verificada. En cuanto al proceso de cuantizacion, mradermacher indica que se trata de cuantizaciones estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y que no se han generado variantes ponderadas/imatrix en el momento de publicar.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en mantener un personaje y un registro consistente a lo largo de turnos multiples.
- Roleplay y dialogo con personalidad: el ajuste SFT se realizo especificamente sobre datos de roleplay, lo que favorece respuestas en personaje frente a respuestas de asistente generico.
- Conversacion multi-turno: soporta historiales de dialogo, aunque la longitud de contexto no esta documentada.
- Posible entrada multimodal: el repositorio incluye proyectores `mmproj` (f16 y Q8_0), lo que sugiere soporte de vision, no confirmado en la model card.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, modo thinking ni capacidades de audio en la informacion disponible.
- Capacidad multilingue no documentada: el modelo declara unicamente ingles.

## Casos de uso

- Personajes virtuales para entretenimiento: el ajuste SFT sobre datos de roleplay permite mantener voces y personalidades coherentes en sesiones largas de chat, con la ventaja de poder ejecutarse localmente en una unica GPU de consumo usando Q4_K_M.
- Prototipado de narrativa interactiva: escritores y disenadores de juegos pueden generar dialogos ramificados y variaciones de personaje sin depender de APIs externas, gracias a las cuantizaciones de 5-8 GB que caben en portatiles con GPU discreta.
- Dialogos para videojuegos y simulaciones: la cuantizacion Q8_0 (12,8 GB) ofrece la mayor fidelidad respecto al bf16 para generar lineas de dialogo que luego se revisan y editan manualmente.
- Investigacion sobre ajuste SFT y evaluacion de datasets de roleplay: al estar disponible el modelo base en bf16 y sus cuantizaciones, permite estudiar como degrada la calidad conversacional al reducir precision (Q2_K frente a Q8_0) en el mismo checkpoint.
- Despliegue local en estaciones de trabajo sin GPU de centro de datos: con Q4_K_S (7,1 GB) o Q4_K_M (7,5 GB) el modelo entra en GPUs de 8-12 GB y en equipos con memoria unificada, gestionado con llama.cpp, Ollama o LM Studio.
- Simulaciones de entrevistas y entrenamiento de habilidades conversacionales: el modelo puede encarnar un interlocutor con un rol fijo (reclutador, cliente dificil, paciente) y mantener ese rol durante la sesion, siempre que el contenido se revise por un humano.
- Experimentacion con entrada de imagenes: si se confirma la utilidad del proyector `mmproj`, podria usarse para conversaciones guiadas por imagenes, aunque esta capacidad no esta documentada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones especificas de roleplay, y las busquedas web realizadas no devolvieron datos tecnicos sobre este modelo. Las unicas metricas objetivas publicadas son los tamanos de fichero de cada cuantizacion:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| mmproj-f16 | 0,2 | Suplemento multimodal |
| mmproj-Q8_0 | 0,3 | Suplemento multimodal |
| Q2_K | 4,9 |  |
| Q3_K_S | 5,6 |  |
| Q3_K_M | 6,2 | Calidad inferior |
| Q3_K_L | 6,7 |  |
| IQ4_XS | 6,8 |  |
| Q4_K_S | 7,1 | Rapida, recomendada |
| Q4_K_M | 7,5 | Rapida, recomendada |
| Q5_K_S | 8,4 |  |
| Q5_K_M | 8,6 |  |
| Q6_K | 9,9 | Muy buena calidad |
| Q8_0 | 12,8 | Rapida, mejor calidad |

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV y overhead, cifra orientativa calculada a partir del tamano de fichero): Q2_K ~6 GB; Q4_K_M ~9 GB; Q5_K_M ~10-11 GB; Q6_K ~12-13 GB; Q8_0 ~15-16 GB. La cache KV depende de la longitud de contexto efectiva, que no esta documentada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 / 4070 Ti 12 GB, RTX 4080 16 GB y RTX 4090 24 GB para cuantizaciones Q4 a Q8. Para Q8_0 con contexto largo o lotes grandes, A100 40 GB, A100 80 GB o H100.
- Cabe en GPU de consumo: si. Q2_K a Q4_K_M entran en GPUs de 8-12 GB; Q6_K y Q8_0 requieren 16-24 GB. Las variantes Q4 permiten incluso repartir capas entre GPU y CPU si falta VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Para servir en produccion con el modelo en bf16 se usaria vLLM o TGI sobre el repositorio base, no sobre los GGUF (el soporte de GGUF en vLLM es experimental).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de contextos de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica comparacion documentada es interna, entre las distintas cuantizaciones del mismo checkpoint:

| Version | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (mradermacher, GGUF) | ~11,9B | No disponible | Apache 2.0 | GGUF (11 cuantizaciones) | Publico en HuggingFace |
| Modelo base (ChatoyantAI, bf16) | ~11,9B | No disponible | Apache 2.0 | safetensors / bf16 | Publico en HuggingFace |
| Alternativas de la misma categoria (modelos densos de ~12B ajustados a dialogo) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad. El ajuste sobre datos de roleplay puede reforzar estereotipos presentes en el dataset de SFT, que no se describe.
- Alucinacion: es un modelo especializado en generacion de dialogo en personaje; su propension a inventar hechos es probablemente alta, especialmente porque el objetivo del ajuste no es la precision factual. No debe usarse como fuente de informacion sin verificacion.
- Idioma: solo se declara soporte de ingles. El rendimiento en castellano no esta documentado y, dado el ajuste especifico, es previsible que sea inferior y que el modelo salga del personaje o mezcle idiomas.
- Contexto: la longitud de contexto es desconocida, lo que impide dimensionar la cache KV y planificar sesiones largas. Hay que validarlo empiricamente con el runtime elegido.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de desplegarlo en produccion.
- Multimodalidad sin documentar: los ficheros `mmproj` sugieren vision, pero el autor no describe como usarla ni que limitaciones tiene.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. No hay evidencia de uso en produccion ni de validacion por terceros.
- Cuantizaciones agresivas: Q2_K y Q3_K_M pueden degradar notablemente la coherencia conversacional; el propio autor marca Q3_K_M como "calidad inferior". Para roleplay se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix/ponderadas: el autor indica que no estan disponibles, lo que limita las opciones de calidad intermedia.
- Produccion: no hay resultados de benchmarks, ni latencias, ni garantias de estabilidad. Cualquier despliegue real exige evaluacion propia y filtros de contenido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-12b-it-roleplay-sft-epoch2-bf16-GGUF
- Modelo base (bf16): https://huggingface.co/ChatoyantAI/gemma-4-12b-it-roleplay-sft-epoch2-bf16
- Pagina resumen y lista de descargas del autor: https://hf.tst.eu/model#gemma-4-12b-it-roleplay-sft-epoch2-bf16-GGUF
- Guia de uso de GGUF de referencia citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que cede la infraestructura al autor: https://www.nethype.de/
- Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; no se han encontrado papers, blogs ni demos asociados.
