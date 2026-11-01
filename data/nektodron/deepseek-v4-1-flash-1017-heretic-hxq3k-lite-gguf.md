# NektoDron/DeepSeek-V4.1-Flash-1017-heretic-HXQ3K-lite-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-heretic-HXQ3K-lite-GGUF es una cuantización comunitaria, publicada por el usuario NektoDron, del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, pasando previamente por el checkpoint "heretic" de pqhaz. Se trata de una conversión a GGUF con precisión mixta (imatrix Q3_K + GPTQ Q2_0 en los expertos enrutados) diseñada específicamente para el motor de inferencia Xolotl, por lo que no es compatible con runtimes GGUF estándar como llama.cpp u Ollama.

El objetivo del modelo es hacer ejecutable en estaciones de trabajo "prosumer" un modelo de más de 550.000 millones de parámetros, reduciendo el peso de los expertos enrutados mediante una selección de precisión basada en sensibilidad medida, mientras se mantienen 96 expertos masivos siempre en Q3_K y los tensores densos idénticos a la cuantización HXQ3K completa. La variante "lite190u" aloja 190 GiB de expertos enrutados, con un tamaño total de pesos de 214,1 GB (199,4 GiB).

Es relevante porque demuestra que, con un enfoque de precisión mixta por experto y descarga a nivel de archivo (file tier), se puede ejecutar un modelo gigante con una única GPU de consumo (RTX 5090) y una CPU de servidor, manteniendo una concordancia muy alta con las salidas de la API oficial de DeepSeek según la suite de evaluación propia del autor (ds4q). La licencia MIT del repositorio facilita el uso comercial, aunque el modelo base heredaría las condiciones de DeepSeek.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (DeepSeek-V4.1-Flash), con expertos enrutados y tablas "Engram" externas; detalles completos no disponibles |
| Parametros totales | 551.880.865.904 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: imatrix Q3_K + GPTQ Q2_0 en expertos enrutados (seleccion por sensibilidad); 96 expertos masivos siempre en Q3_K; sidecar DSpark en Q2_K; KV cache FP4 |
| Idiomas soportados | Ingles (en), ruso (ru) |
| Licencia | MIT (repositorio de la cuantizacion; condiciones del modelo base no detalladas en la ficha) |
| Formato de pesos | GGUF dividido en 5 shards (<48 GB decimales cada uno), con mapa de precision por experto, ranking de expertos y manifiestos de verificacion SHA256; solo compatible con Xolotl |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos (MoE) con 551.880.865.904 parametros totales. La ficha no detalla el numero de expertos activos por token, la longitud de contexto ni el corpus de entrenamiento del modelo original. Sobre el checkpoint "heretic" de pqhaz (una edicion comunitaria del modelo, aparentemente orientada a eliminar rechazos, a juzgar por los resultados de JailbreakBench), NektoDron aplica una cuantizacion de precisión mixta denominada HXQ3K-lite190u: la precision de las proyecciones gate/up y down de cada experto se elige de forma independiente segun sensibilidad medida, y el ranking de expertos (`rank-xq3k.bin`) se usa para sembrar la colocacion de expertos en VRAM/RAM.

Las tablas "Engram" del modelo original se mantienen sin cambios y se alojan externamente: el repositorio no las incluye, por lo que hay que descargar dos shards oficiales de unos 101,5 GB cada uno (unos 203 GB extraidos mas almacenamiento temporal) y extraerlos con Xolotl. Como novedades tecnicas destacan el uso de un sidecar DSpark en Q2_K (que sugiere decodificacion especulativa con aceptacion variable), KV cache en FP4 y un pipeline "arena" con opciones de indexador en versiones recientes de Xolotl (posterior al commit `248982be`; carga de modelos divididos desde `1a80dedb`). No hay informacion sobre RLHF/DPO ni numero de tokens de entrenamiento.

## Capacidades

- Generacion de texto en ingles y ruso (pipeline text-generation; el modelo base es un LLM generalista).
- Llamadas a herramientas: 21/23 aciertos en la evaluacion propia de tool calls de la ficha.
- Razonamiento matematico basico: 99/100 en una evaluacion fija de GSM8K de 100 casos.
- Modo de razonamiento desactivable (las pruebas de rechazos se ejecutan con "reasoning off", lo que implica que el modelo dispone de modo reasoning).
- Soporte de vision mediante sidecar externo (`V41-MTP-Vision-1017.Q2_K.gguf`, descargable desde IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored), no incluido en este repositorio.
- Comportamiento sin rechazos: 0/100 rechazos en JailbreakBench (y 0/100 en casos benignos), consecuencia del checkpoint "heretic"; ver advertencias.
- Ejecucion con descarga de expertos desde disco (file tier) y colocacion en VRAM/RAM guiada por ranking de expertos; sin soporte en runtimes GGUF estandar (solo Xolotl).

## Casos de uso

- Chatbot local de altas prestaciones en hardware prosumer: con una RTX 5090, un EPYC 9654 y 256 GB de RAM se obtienen unos 47-50 tok/s de generacion, suficiente para asistentes conversacionales multi-turno en local.
- Experimentacion con agentes y tool calling: la tasa de 21/23 en la evaluacion de tool calls lo hace apto para prototipos de agentes que invocan funciones, siempre aceptando algun fallo ocasional.
- Resolucion de problemas matematicos y razonamiento cuantitativo: con 99/100 en la prueba fija de GSM8K de esta build, es adecuado para pipelines de verificacion de calculos y ejercicios escolares o tecnicos.
- Investigacion en cuantizacion extrema: la publicacion incluye mapa de precision por experto, ranking, manifiestos SHA256 y `verification.json` con comparaciones de logits, lo que lo convierte en material de referencia para estudiar cuantizacion Q2/Q3 mixta en MoE gigantes.
- Inferencia con presupuesto de RAM limitado: el perfil de 192 GB (`MemoryMax=172G`) mantiene 39-45 tok/s con menos del 0,5% de expertos servidos desde disco, util en servidores con 192 GB de RAM sin GPU de gama alta.
- Uso en ruso e ingles sin censura para investigacion de seguridad: al eliminar la direccion de rechazo, permite estudiar comportamientos del modelo base sin filtros (con las salvaguardas legales y eticas pertinentes por parte del usuario).
- Despliegue multi-slot local: la configuracion de referencia usa cuatro server slots con batch 4 agregado de 67-85 tok/s, util para servir varios usuarios en una red domestica o de laboratorio.

## Benchmarks y rendimiento

Datos publicados por el autor de la model card (no son suites completas de benchmarks, sino evaluaciones fijas de esta build):

| Quant | ds4q top-1 ↑ | NLL ↓ | KL a API ↓ |
|---|---:|---:|---:|
| HXQ3K | 91,90% | 0,363 | 0,110 |
| HXQ3K-lite190u (este modelo) | 91,40% | 0,386 | 0,132 |
| XQ V4 | 88,95% | 0,451 | 0,197 |

`ds4q` son 112 casos fijos, teacher-forced contra continuaciones de la API de DeepSeek con probabilidades top-20; KL compara la distribucion top-20 renormalizada, no la KL de vocabulario completo. La fila XQ V4 compara builds completas distintas (incluye una edicion de direccion de rechazo propia de IndrasMirror).

Evaluaciones puntuales de lite190u: GSM8K 99/100; tool calls 21/23; JailbreakBench rechazos harmful 0/100 y benign 0/100 (greedy, reasoning off, 96 tokens maximo).

Rendimiento (RTX 5090 + EPYC 9654, NVMe rapido, 64 hilos de experto en CPU, KV FP4, sidecar DSpark Q2_K, 4 slots):

| lite190u | 256 GB (`MemoryMax=236G`) | 192 GB (`MemoryMax=172G`) |
|---|---:|---:|
| Arena | 194 GiB | 156 GiB |
| Generacion 4K/16K/32K (tok/s) | 49,7 / 47,5 / 47,5 | 39,4 / 45,1 / 44,8 |
| Prefill 4K/16K/32K (tok/s) | 647 / 1278 / 1626 | 450 / 1012 / 1366 |
| Generacion batch 4 agregada (tok/s) | 84,8 | 67,0 |
| Computos de experto desde file tier | 0,00% | 0,48% |

Referencia: HXQ3K al mismo limite de 172G genero 32,0 / 36,9 / 36,1 tok/s (batch 4: 47,3). Los perfiles de 256/192 GB se simularon con cgroups, no son hosts fisicos dedicados. No hay datos de MMLU, HumanEval u otras suites estandar publicadas para esta cuantizacion.

## Requisitos de hardware

- VRAM: una GPU con ~32 GB (RTX 5090 de 32 GB en la configuracion de referencia) es suficiente, porque los expertos residen en RAM y se computan en CPU; no se especifica el reparto exacto VRAM/RAM.
- RAM: 256 GB recomendados (perfil `MemoryMax=236G`, arena de 194 GiB); 192 GB viables (`MemoryMax=172G`, arena de 156 GiB) con degradacion minima (~0,5% de expertos desde disco). Adicionalmente, ~203 GB de disco para las tablas Engram extraidas mas espacio temporal para los shards fuente, y 214,1 GB para los pesos del modelo.
- CPU: se asume memoria y ancho de banda elevados; la referencia usa un EPYC 9654 con 64 hilos dedicados a expertos. El throughput depende fuertemente del ancho de banda de memoria, PCIe, contexto, concurrencia y aceptacion de DSpark.
- Consumer GPU: cabe en una RTX 5090 (32 GB) como GPU unica; no se han publicado configuraciones con GPUs de menos VRAM.
- Despliegue: exclusivamente Xolotl (version `main` posterior a `248982be`; split loading desde `1a80dedb`). No compatible con llama.cpp, Ollama, vLLM ni TGI por el layout mixto de expertos y la rejilla Q2_0 propias de Xolotl.
- Latencia/throughput estimados: 39-50 tok/s de generacion y 450-1626 tok/s de prefill segun perfil y longitud de prompt (datos de la propia model card, un solo usuario; batch 4: 67-85 tok/s agregados).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | ds4q top-1 | Generacion 32K (172G) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| DeepSeek-V4.1-Flash-1017-heretic HXQ3K-lite190u (este) | 551,9 B | Mixta Q3_K + Q2_0 | 91,40% | 44,8 tok/s | MIT (repo) | GGUF, solo Xolotl |
| HXQ3K (misma familia, sin lite) | 551,9 B | Mixta Q3_K | 91,90% | 36,1 tok/s | MIT (repo) | GGUF, solo Xolotl |
| XQ V4 (IndrasMirror, con edicion de rechazo) | 551,9 B | no disponible | 88,95% | no disponible | no disponible | GGUF, solo Xolotl |

No se incluyen comparativas con otros modelos de la categoria (por ejemplo, otros MoE gigantes cuantizados) porque no hay datos publicados en la informacion disponible.

## Limitaciones y advertencias

- Compatibilidad de runtime: el GGUF usa el layout mixto de expertos y la rejilla Q2_0 de Xolotl; no funciona en llama.cpp, Ollama, LM Studio ni otros runtimes estandar.
- Dependencias externas: requiere descargar aparte el sidecar DSpark/vision (Q2_K), el tokenizer y las dos tablas Engram oficiales (~203 GB extraidos); sin Engram el modelo no funciona correctamente.
- Sin rechazos de seguridad: el checkpoint "heretic" elimina los rechazos (0/100 en JailbreakBench, tambien en casos benignos). Esto implica ausencia de salvaguardas frente a peticiones harmful; el usuario asume toda la responsabilidad legal y etica del despliegue.
- Alucinaciones: no se han publicado evaluaciones de veracidad o alucinacion para esta build; al ser una cuantizacion agresiva (Q2_0 en parte de los expertos), existe riesgo adicional de degradacion respecto al modelo base, mitigado pero no eliminado segun las metricas ds4q (91,40% de concordancia con la API).
- Metricas limitadas: GSM8K 99/100, tool calls 21/23 y JailbreakBench son evaluaciones fijas y pequenas de esta build, no suites de benchmarks completas; no extrapolables sin mas datos.
- Idiomas: la ficha declara solo ingles y ruso; el rendimiento en castellano u otros idiomas no esta documentado.
- Hardware exigente: aunque la GPU es de consumo, se requieren 192-256 GB de RAM y ~420 GB de almacenamiento rapido (pesos + Engram + temporales), lo que lo excluye de la mayoria de equipos domesticos.
- Rendimiento variable: el throughput depende del ancho de banda de memoria, PCIe, contexto, concurrencia y aceptacion de DSpark; los perfiles de 256/192 GB se midieron con cgroups, no en hosts fisicos dedicados.
- Licencia: el repositorio de la cuantizacion es MIT, pero la ficha no detalla las condiciones de uso comercial del modelo base de DeepSeek ni del checkpoint heretic; conviene verificarlas antes de uso en produccion.
- Descargas: 300 al momento de la ficha y 0 likes; es un proyecto comunitario muy reciente (octubre de 2026) con poco historial de validacion por terceros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/NektoDron/DeepSeek-V4.1-Flash-1017-heretic-HXQ3K-lite-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint heretic: https://huggingface.co/pqhaz/DeepSeek-V4.1-Flash-1017-heretic
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Documentacion de Xolotl para DeepSeek V4.1: https://github.com/Indras-Mirror/Xolotl/blob/main/docs/DEEPSEEK_V41.md
- Sidecar DSpark/vision y tokenizer: https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored/blob/main/V41-MTP-Vision-1017.Q2_K.gguf
- Model card de referencia XQ: https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored
