# alphaZimuth/Hy-MT2-30B-A3B-Uncensored-Heretic-APEX-GGUF

## Resumen

Hy-MT2-30B-A3B-Uncensored-Heretic-APEX-GGUF es un conjunto de cuantizaciones GGUF publicadas por alphaZimuth a partir del modelo OS-Software/Hy-MT2-30B-A3B-uncensored-heretic, que a su vez deriva del original Tencent Hy-MT2-30B-A3B. Se trata de un modelo de traduccion basado en una arquitectura de mezcla de expertos (MoE) con 30.064.725.888 parametros totales y del orden de 3.000 millones de parametros activos por token, segun indica la nomenclatura A3B.

El valor anadido de esta publicacion no es entrenar un modelo nuevo, sino ofrecer versiones cuantizadas con calibracion mediante importance matrix (imatrix) y el esquema propio APEX-I, pensadas para su ejecucion local con llama.cpp. La arquitectura subyacente es hy_v3, cuyo soporte ya ha sido integrado en las versiones recientes de llama.cpp.

El modelo incorpora la capa de "decensurado" desarrollada por OS-Software mediante Heretic, Arbitrary-Rank Ablation (ARA), un adaptador LoRA y preservacion de norma de filas sobre las capas 18 a 28 del modelo original. Esta orientado a investigacion en traduccion, experimentacion local y estudios de alineacion, no a despliegues de produccion con requisitos de seguridad estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hy_v3 (mezcla de expertos, MoE) |
| Parametros totales | 30.064.725.888 (aproximadamente 30B) |
| Parametros activos | aproximadamente 3B (deducido de la nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX-I en cuatro niveles: Nano (8,99 GiB), Mini (10,4 GiB), Compact (13,0 GiB), Quality (17,7 GiB) |
| Idiomas soportados | zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (unicamente cuantizado) |

## Arquitectura y entrenamiento

El modelo original Tencent Hy-MT2-30B-A3B es un transformer con arquitectura de mezcla de expertos (MoE) identificada como hy_v3 en llama.cpp. Con 30.064.725.888 parametros totales y un subconjunto activo del orden de 3B, esta disenado especificamente para tareas de traduccion multilingue, tal como refleja el pipeline declarado (translation) y la amplia lista de idiomas soportados. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La capa de decensurado fue realizada por OS-Software sobre el modelo de Tencent mediante Heretic v1.4.0+custom, con Arbitrary-Rank Ablation (ARA), un adaptador LoRA y preservacion de norma de filas, modificando las capas 18 a 28. Sobre ese modelo intermedio, alphaZimuth aplico una conversion a GGUF con convert_hf_to_gguf.py, una pasada de calibracion imatrix (que reporto una perplejidad final estimada de PPL = 5,2905 +/- 0,02242) y la cuantizacion APEX basada en llama.cpp. Este repositorio no ejecuta ningun proceso adicional de abliteracion ni edicion de pesos.

## Capacidades

- Traduccion multilingue entre 36 idiomas declarados, incluyendo chino, ingles, castellano, frances, portugues, japones, arabe, coreano, hindi, ruso y arabe, entre otros.
- Generacion de texto conversacional en formato de chat (tag conversational).
- Razonamiento por mezcla de expertos con activacion de aproximadamente 3B parametros por token, lo que reduce el coste computacional frente a un modelo denso de tamano equivalente.
- Ejecucion local mediante llama.cpp con soporte de la arquitectura hy_v3.
- Capacidad reducida de rechazo de peticiones (comportamiento decensurado), lo que implica mayor tendencia a responder ante solicitudes que un modelo alineado rechazaria.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Traduccion automatica local de documentacion tecnica: el modelo puede traducir entre pares de idiomas poco habituales (por ejemplo, castellano a gujarati o urdu a coreano) directamente en una maquina de desarrollo, aprovechando las cuantizaciones APEX-I-Mini o Compact.
- Investigacion en alineacion y seguridad: el contraste entre las metricas de rechazo del modelo original (100/100) y la version heretic (0/100) ofrece un caso de estudio util para analizar el efecto de la ablacion por rangos arbitrarios sobre el comportamiento de un modelo de traduccion.
- Evaluacion de tecnicas de cuantizacion: al publicar cuatro niveles APEX-I calibrados con imatrix, permite comparar degradacion de calidad frente a tamano en un modelo MoE con arquitectura hy_v3.
- Preprocesado multilingue en pipelines de NLP: dado el amplio conjunto de idiomas declarados, puede emplearse para normalizar o pivotar textos de entrada antes de pasarlos a modelos especializados.
- Experimentacion con llama.cpp: sirve como referencia para probar el soporte de la arquitectura hy_v3 y las cuantizaciones APEX en versiones recientes del runtime.
- Despliegue en equipos con GPU de consumo: la variante Compact (13,0 GiB) permite inferencia en GPUs con 16 GB de VRAM, lo que facilita pruebas offline sin infraestructura de centro de datos.
- Generacion conversacional sin filtros: para proyectos de investigacion que requieran explorar respuestas no censuradas en contextos controlados y con supervision humana.

## Benchmarks y rendimiento

Los datos disponibles provienen de la evaluacion reportada por OS-Software sobre el modelo fuente a plena precision, no sobre estas cuantizaciones APEX. Se incluyen como referencia y no deben interpretarse como un benchmark independiente de los GGUF.

| Metrica | Uncensored Heretic (fuente) | Hy-MT2 original |
|---|---:|---:|
| Prueba de palabras clave / rechazo | 0 / 100 | 100 / 100 |
| Divergencia KL | 0,0276 | 0 |

Adicionalmente, la calibracion imatrix de este repositorio reporto una perplejidad final estimada de PPL = 5,2905 +/- 0,02242. No se han publicado resultados de benchmarks de traduccion (por ejemplo BLEU, COMET o chrF), MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Nano 8,99 GiB, Mini 10,4 GiB, Compact 13,0 GiB, Quality 17,7 GiB (mas overhead de contexto y runtime).
- La variante Compact puede ejecutarse en GPUs de consumo con 16 GB de VRAM; la variante Quality requiere al menos 24 GB (por ejemplo RTX 3090 o RTX 4090) para un contexto comodo.
- La variante Nano esta descrita por el autor como cercana al limite de cuantizacion y no recomendada de forma general.
- Para despliegues en servidor se pueden emplear A100, H100 o GPUs con 24-80 GB de VRAM, especialmente con las variantes Compact y Quality y contextos largos.
- Motor de inferencia recomendado: llama.cpp en version reciente, dado que el soporte de hy_v3 se ha integrado en upstream. Las versiones antiguas pueden fallar al cargar el modelo.
- Parametros de inferencia recomendados por la documentacion de Hy-MT2: temperature 0.7, top_p 1.0, top_k -1, repetition_penalty 1.0, max_tokens 4096.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| alphaZimuth/Hy-MT2-30B-A3B-Uncensored-Heretic-APEX-GGUF | 30B totales, aprox. 3B activos | no disponible | Apache 2.0 | GGUF cuantizado | Cuatro niveles APEX-I, calibracion imatrix |
| OS-Software/Hy-MT2-30B-A3B-uncensored-heretic | 30B totales, aprox. 3B activos | no disponible | no disponible | safetensors (presumiblemente) | Modelo fuente a plena precision, decensurado con Heretic y ARA |
| tencent/Hy-MT2-30B-A3B | 30B totales, aprox. 3B activos | no disponible | no disponible | no disponible | Modelo original alineado; 100/100 en la prueba de rechazo |
| alphaZimuth/Hy-MT2-30B-A3B-Uncensored-v1-APEX-GGUF | 30B totales, aprox. 3B activos | no disponible | no disponible | GGUF cuantizado | Version experimental previa, marcada como legacy por problemas reportados |

## Limitaciones y advertencias

- El modelo presenta una alineacion de seguridad sustancialmente reducida respecto al Hy-MT2 original; puede generar contenido inexacto, danino, sesgado u ofensivo.
- Riesgo elevado de alucinacion y de informacion incorrecta; las salidas deben tratarse como no fiables y verificarse de forma independiente.
- El comportamiento decensurado proviene del modelo fuente de OS-Software y no es introducido por la cuantizacion APEX.
- No se dispone de informacion sobre longitud de contexto soportada, lo que limita la planificacion de despliegues con ventanas largas.
- La cuantizacion puede introducir pequenas diferencias de comportamiento o calidad respecto al modelo fuente a plena precision.
- La variante APEX-I-Nano esta cerca del limite de cuantizacion y no se recomienda con caracter general.
- El uso previsto por el autor es investigacion, experimentacion, investigacion en traduccion, investigacion en alineacion y experimentacion local; no esta disenado para produccion con requisitos de seguridad.
- Aunque la licencia declarada es Apache 2.0, el usuario es responsable de cumplir las leyes, normativas, licencias y politicas de plataforma aplicables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alphaZimuth/Hy-MT2-30B-A3B-Uncensored-Heretic-APEX-GGUF
- Modelo fuente: https://huggingface.co/OS-Software/Hy-MT2-30B-A3B-uncensored-heretic
- Modelo original: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Version experimental previa: https://huggingface.co/alphaZimuth/Hy-MT2-30B-A3B-Uncensored-v1-APEX-GGUF
- Autor de la cuantizacion en HuggingFace: https://huggingface.co/alphaZimuth
