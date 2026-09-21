# mradermacher/Boulesis-v2.1-26B-A4B-HeadTune-i1-GGUF

## Resumen

Boulesis-v2.1-26B-A4B-HeadTune-i1-GGUF es un conjunto de cuantizaciones en formato GGUF publicadas por el usuario mradermacher a partir del modelo SubMaroon/Boulesis-v2.1-26B-A4B-HeadTune. El modelo de origen es un merge comunitario de arquitectura Mixture of Experts (MoE) sobre la familia Gemma (etiqueta `gemma4`), con 25.971.339.550 parametros totales segun los safetensors y una nomenclatura «A4B» que sugiere unos 4.000 millones de parametros activos por token.

El modelo esta orientado a roleplay y conversacion (etiquetas `roleplay`, `sillytavern`), razonamiento con modo thinking (`thinking`, `reasoning`) y uso sin censura (`heretic`, `uncensored`). Solo declara soporte para ingles y se distribuye bajo licencia Gemma. El repositorio no contiene pesos originales, sino ficheros cuantizados con imatrix para inferencia local en CPU/GPU.

Este repositorio es relevante porque permite ejecutar un modelo MoE de ~26B en hardware de consumo mediante cuantizaciones de 2 a 3 bits, con ficheros que van de 10,9 GB a 12,8 GB en los dos tamanos documentados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en la familia Gemma (etiqueta `gemma4`); detalles exactos no disponibles |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | ~4.000 millones (deducido de la nomenclatura «A4B» del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, i1-Q2_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K (catalogo declarado en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (ficheros `.gguf`); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la model card de esta cuantizacion. Las etiquetas declaradas (`moe`, `gemma4`, `merge`) indican que el modelo base combina una arquitectura de mezcla de expertos con la familia Gemma y que ha sido construido mediante merge de modelos, no entrenado desde cero. La etiqueta `HeadTune` sugiere algun tipo de ajuste sobre las cabezas de atencion, pero no se documenta su naturaleza.

Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Las etiquetas `heretic` y `uncensored` apuntan a un proceso de eliminacion o reduccion de rechazos (abliteration o similar), pero su metodo concreto no esta documentado. No hay informacion sobre innovaciones tecnicas de decodificacion, atencion lineal ni estrategias de optimizacion.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y personajes (etiquetas `roleplay`, `sillytavern`).
- Modo thinking y razonamiento explicito (etiquetas `thinking`, `reasoning`).
- Uso sin censura o con rechazos reducidos (`heretic`, `uncensored`).
- Capacidades multilingues limitadas al ingles segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad confirmada, aunque la etiqueta `reasoning` podria implicarlo.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Roleplay conversacional con personajes: el modelo esta etiquetado para SillyTavern y roleplay, por lo que es adecuado para mantener dialogos de personaje con el modo thinking activado.
- Asistentes creativos de ficcion interactiva: la combinacion de roleplay y contenido sin censura permite narrativas adultas o sin restricciones tematicas.
- Generacion de dialogos para guiones o videojuegos: util para producir lineas de personaje coherentes con un tono definido.
- Prototipado de agentes conversacionales en ingles: gracias a sus ~4B parametros activos, la latencia por token es menor que la de un modelo denso de 26B.
- Experimentacion con tecnicas de cuantizacion: el repositorio ofrece versiones imatrix en 2 y 3 bits para comparar calidad frente a tamano.
- Despliegue local en hardware de consumo: los ficheros de 10,9 GB y 12,8 GB permiten ejecucion en GPU de 16-24 GB de VRAM.
- Investigacion en alineacion y censura: las etiquetas `heretic` y `uncensored` lo hacen util para estudiar el comportamiento de modelos sin filtros de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y la busqueda web realizada no devolvio resultados relevantes sobre el modelo (los resultados obtenidos corresponden a foros no relacionados y se descartan).

## Requisitos de hardware

- Vram estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el contexto y el overhead de la cache KV. Para i1-Q2_K (10,9 GB) se estiman ~12-13 GB; para i1-IQ3_M (12,8 GB) se estiman ~14-16 GB (estimaciones derivadas del tamano de fichero, no confirmadas por el autor).
- GPU recomendadas: tarjetas de 16-24 GB (RTX 4080, RTX 4090, RTX 3090, A5000, L4) para las cuantizaciones de 2 y 3 bits. Para cuantizaciones superiores (si se publican) o contexto largo haria falta una GPU de 24 GB o mas.
- Encaje en GPU de consumo: si, las dos cuantizaciones documentadas caben en GPUs de 16 GB o mas; i1-IQ3_M requiere al menos 16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y otros backends compatibles con GGUF. El soporte en vLLM y TGI para GGUF es limitado.
- Latencia y throughput: no disponibles. Al ser un modelo MoE con ~4B parametros activos, se espera una velocidad superior a la de un modelo denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Boulesis-v2.1-26B-A4B-HeadTune-i1-GGUF | ~26B totales / ~4B activos | no disponible | GGUF (cuantizado) | gemma | Publico en HuggingFace |
| SubMaroon/Boulesis-v2.1-26B-A4B-HeadTune (modelo base) | ~26B totales / ~4B activos | no disponible | safetensors | gemma | Publico en HuggingFace |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada otros modelos de la misma categoria (MoE de ~26B orientados a roleplay) con datos verificables para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card.
- Riesgo de alusionacion: inherente a los modelos de lenguaje; no se aportan metricas de fiabilidad.
- Limitacion de idioma: solo declara soporte para ingles; su rendimiento en castellano no esta verificado.
- Longitud de contexto: no especificada, lo que impide garantizar conversaciones largas.
- Licencia Gemma: sujeta a los terminos de uso de Gemma, que imponen restricciones adicionales a las licencias permisivas habituales; debe revisarse antes de cualquier uso comercial.
- Etiquetas `uncensored` y `heritic`: el modelo puede generar contenido sensible o inapropiado sin filtros; requiere moderacion si se expone a usuarios finales.
- Procedencia: es un merge comunitario sin paper ni documentacion tecnica publicada, por lo que la trazabilidad de los datos de entrenamiento es limitada.
- Cuantizaciones de 2-3 bits: implican perdida de calidad frente al modelo en safetensors; no se aportan mediciones de perplejidad para estas versiones concretas.
- Estado del repositorio: 0 descargas y 0 likes en el momento del analisis, sin validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace (cuantizacion GGUF): https://huggingface.co/mradermacher/Boulesis-v2.1-26B-A4B-HeadTune-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-v2.1-26B-A4B-HeadTune
- Pagina resumen de descargas del autor: https://hf.tst.eu/model#Boulesis-v2.1-26B-A4B-HeadTune-i1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor (nethype GmbH): https://www.nethype.de/
