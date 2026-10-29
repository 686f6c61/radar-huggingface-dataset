# pbhappliedsystems/qwen-2.5-32B-instruct-gguf-Q4-K-M

## Resumen

Esta ficha cubre la build cuantizada en GGUF Q4_K_M de Qwen2.5-32B-Instruct, publicada por PBH Applied Systems, LLC (pbhappliedsystems), una consultora de infraestructura de IA que mantiene una serie de builds GGUF evaluadas con su propio arnés de evaluación conductual, `quant_eval` v7.22.22. No se trata de un modelo nuevo: es una conversión del checkpoint oficial Qwen/Qwen2.5-32B-Instruct (revisión `5ede1c97bbab6ce5cda5812749b4c0bdf79b18dd`) a formato llama.cpp con la cuantización K-quant Q4_K_M, empaquetada junto a un informe de degradación por cuantización.

El interés de la publicación no está en el modelo en sí, sino en la evidencia que aporta sobre si la cuantización a 4 bits degrada capacidades agénticas. Según el autor, frente a su propia baseline F16, la build Q4_K_M no degrada ninguna de las 8 familias de capacidad evaluadas (McNemar, p < 0,05; n = 200 por familia), con una reducción de huella del 69,7 %. Para equipos que despliegan un modelo de 32.763.876.352 parámetros en infraestructura propia, ese dato —junto con las tasas de acierto en tool calling (95,5 %) y retención de estado multi-turno (100 %)— es más operativo que un leaderboard de conocimiento general.

La licencia Apache 2.0 del modelo base se mantiene, con uso comercial permitido según el registro de procedencia de licencia que documenta el autor. La model card declara únicamente inglés y chino como idiomas soportados, pese a que la familia Qwen2.5 es más amplia en cobertura lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-32B-Instruct); detalles de capas y cabezas no disponibles en la informacion proporcionada |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card de esta build; el modelo base Qwen2.5-32B-Instruct declara 32.768 tokens nativos (no verificado para esta conversion) |
| Tipos de cuantizacion | Q4_K_M (esta build); el autor publica ademas una build F16 en repo separado |
| Idiomas soportados | en, zh (segun metadatos de la model card) |
| Licencia | Apache-2.0 (SPDX `Apache-2.0`); uso comercial `permitted_by_recorded_license` |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 39,7 GB |
| SHA-256 del fichero evaluado | `6f810a332a884410aa65cc1b5a128a8603f083b36465acfbbf67a08f50a4d3e3` |
| Fecha de creacion / actualizacion | 2026-04-12 / 2026-10-29 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-32B-Instruct, un transformer decoder-only denso de ~32,8 mil millones de parametros desarrollado por Alibaba Qwen. Esta publicacion no entrena ni afina nada: aplica una conversion a GGUF con cuantizacion K-quant Q4_K_M sobre el checkpoint Instruct oficial. La model card no documenta datos de entrenamiento, numero de tokens, composicion del corpus ni las etapas de alineacion (SFT/RLHF/DPO) del modelo base; esa informacion debe consultarse en la documentacion de Qwen2.5.

La innovacion tecnica que aporta el autor es metodologica, no arquitectonica: un arnes de evaluacion conductual (`quant_eval` v7.22.22) con fixtures "golden oracle" versionados (v7.22.22) y 200 muestras por familia, disenado para medir degradacion por cuantizacion en tareas adyacentes a agentes —salida estructurada JSON, despacho de herramientas, retencion de estado multi-turno y planificacion multi-paso— en lugar de perplejidad o proxies de leaderboard. La comparacion se hace por pares contra la build F16 del mismo modelo, con test de McNemar e intervalos de confianza.

## Capacidades

- Generacion de texto conversacional e instructiva en ingles y chino.
- Razonamiento multi-paso y descomposicion de problemas (familia `json_multistep`: 60 % de acierto).
- Salida estructurada JSON: 61,5 % de acierto en la familia `json` y 100 % en `mixed_brief_json`.
- Tool calling / function calling: 95,5 % en `toolcall` y 98,5 % en `toolcall_only`, la capacidad mas solida del modelo en esta cuantizacion.
- Retencion de estado en conversaciones multi-turno: 100 % en `stateful_followup`.
- Resolucion de preguntas de opcion multiple: 100 % en la familia `mcq`.
- Robustez ante entradas malformadas o adversariales: 63,5 % en `fuzz`, el punto mas debil de la evaluacion.
- Integracion con llama.cpp y todo su ecosistema (Ollama, llama-cpp-python, LM Studio, servidores compatibles con OpenAI).
- Capacidades multimodales, de audio o de vision: no disponibles (el modelo base es solo texto).

## Casos de uso

- Despliegue agéntico on-premise con tool calling: el 95,5 % de acierto en `toolcall` y el 98,5 % en `toolcall_only` lo hacen apto para orquestar funciones externas (APIs, consultas a bases de datos, automatizacion de back-office) en infraestructura propia, sin dependencia de un proveedor cloud.
- Pipelines de extraccion con salida JSON: con 100 % en `mixed_brief_json` y 61,5 % en `json` puro, encaja en tareas de extraccion de campos donde el esquema es guiado, pero requiere validacion y reintentos cuando el esquema es estricto y abierto.
- Asistentes conversacionales con memoria de sesion: el 100 % en `stateful_followup` respalda dialogos multi-turno donde el modelo debe recordar y aplicar decisiones previas (configuradores, soporte tecnico escalado, toma de requisitos).
- Servicio de inferencia autoalojado con presupuesto de VRAM ajustado: la reduccion de huella del 69,7 % frente a F16 permite servir un 32B en una unica GPU de 48 GB o en dos GPU de 24 GB, manteniendo el comportamiento del modelo completo segun el autor.
- Clasificacion y triaje con formato controlado: el 100 % en `mcq` lo habilita para enrutado de tickets, etiquetado de categorias y decision entre opciones predefinidas en flujos automatizados.
- Evaluacion de degradacion por cuantizacion como referencia interna: el repo incluye fixtures, DOI del corpus y SHA-256 del fichero evaluado, por lo que sirve como baseline reproducible para comparar otras cuantizaciones (Q5_K_M, Q6_K, Q8_0) sobre el mismo modelo.
- Generacion de codigo y scripting: capacidad heredada del modelo base Instruct, aunque esta build no incluye benchmarks de codigo (HumanEval, MBPP) en la informacion disponible.

## Benchmarks y rendimiento

Resultados declarados por el autor (`model-index`, no verificados de forma independiente; `verified: false`). Metrica: `pass_rate` sobre `quant_eval golden oracle fixtures` v7.22.22, n = 200 por familia.

| Familia evaluada | Pass rate (%) |
|---|---|
| json | 61,5 |
| json_multistep | 60,0 |
| stateful_followup | 100,0 |
| mixed_brief_json | 100,0 |
| mcq | 100,0 |
| toolcall | 95,5 |
| toolcall_only | 98,5 |
| fuzz | 63,5 |

Comparacion por pares Q4_K_M frente a F16 (baseline del mismo modelo): 0 de 8 familias degradadas y 0 mejoradas de forma significativa (McNemar, p < 0,05). El mayor movimiento observado es `toolcall` con +1,0 puntos, dentro del ruido estadistico.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 19-20 GB de pesos, partiendo de 32,76 mil millones de parametros a ~4,8 bits por peso. Cifra estimada a partir del numero de parametros; el autor no publica el desglose por fichero.
- Cache KV adicional: con 32.768 tokens de contexto la cache crece de forma apreciable; para GQA de 8 cabezas KV y 64 capas en fp16 el orden de magnitud es ~0,25 MB por token, es decir, ~2 GB a 8k tokens y ~8 GB a 32k. Estimacion propia, no confirmada por el autor.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB. Suficiente una GPU de 48 GB para contexto moderado; para contexto completo conviene 80 GB.
- No cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090) en una sola unidad. Si cabe repartido entre 2x RTX 4090 con tensor split, o en 1x RTX 4090 con offload parcial de capas a CPU y penalizacion de velocidad.
- Opciones de despliegue: llama.cpp (referencia para este formato), Ollama, llama-cpp-python, LM Studio, Jan, text-generation-webui. vLLM y TGI tienen soporte de GGUF limitado o nulo; para servir en produccion a alta concurrencia conviene valorar la build F16 o pesos safetensors con vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor no publica tokens por segundo ni metricas de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Esta build (Qwen2.5-32B-Instruct Q4_K_M) | 32,76 B | No disponible en la card | GGUF Q4_K_M | Apache-2.0 | Sin degradacion significativa frente a F16 en 8 familias; 69,7 % menos huella |
| Qwen2.5-32B-Instruct F16 (misma serie) | 32,76 B | No disponible en la card | GGUF F16 | Apache-2.0 | Baseline de referencia del autor; mayor huella, mismo comportamiento medido |
| Qwen2.5-14B-Instruct | 14 B (aprox.) | No disponible en la informacion | Multiples, incluido GGUF | Apache-2.0 | Alternativa si el presupuesto de VRAM es de 24 GB; sin datos comparativos de `quant_eval` en esta informacion |
| Qwen2.5-72B-Instruct | 72 B (aprox.) | No disponible en la informacion | Multiples, incluido GGUF | Apache-2.0 | Mayor capacidad esperada, requiere 48 GB o mas en 4 bits; sin datos comparativos aportados |

No hay datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; las diferencias de calidad solo pueden contrastarse contra la baseline F16 del propio autor.

## Limitaciones y advertencias

- Los resultados del `model-index` estan marcados como `verified: false`: son datos declarados por el autor, sin replicacion independiente publicada.
- `quant_eval` es un arnes propietario del autor, no un benchmark estandar. Las tasas de acierto no son comparables con MMLU, HumanEval ni otros leaderboards, y no permiten situar el modelo frente a terceros.
- El `fuzz` pass rate del 63,5 % y el `json` pass rate del 61,5 % indican fragilidad ante entradas malformadas y ante generacion de JSON estricto. En produccion conviene imponer validacion de esquema y reintentos.
- La model card solo declara ingles y chino. El rendimiento en castellano no esta evaluado ni documentado; la cobertura multilingue de la familia Qwen2.5 no se traslada automaticamente a esta build sin verificacion.
- La longitud de contexto efectiva de esta conversion no se documenta. Si se requiere contexto largo (32k o mas) debe verificarse experimentalmente, ya que la cuantizacion K-quant afecta a la cache KV y a la estabilidad en contextos extensos.
- Riesgo de alucinacion: inherente al modelo base Instruct; no hay evaluacion de factualidad en la informacion disponible.
- Sesgos: no documentados por el autor. No hay evaluacion de sesgo, toxicidad ni seguridad en la model card de esta build.
- Licencia: Apache-2.0 permite uso comercial, pero el autor la registra como `permitted_by_recorded_license` sobre una revision concreta del modelo base (`5ede1c97bbab6ce5cda5812749b4c0bdf79b18dd`). Conviene verificar que la revision utilizada y los terminos de Qwen2.5 se mantienen si se reconstruye o se redistribuye el artefacto.
- El repositorio ocupa 39,7 GB, muy por encima del tamano esperado de un unico fichero Q4_K_M de ~20 GB. Verificar el contenido real antes de asumir que un solo fichero contiene los pesos.
- Las fechas de creacion y actualizacion del repositorio (2026) deben contrastarse con el calendario de publicacion de Qwen2.5 si se necesita trazabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pbhappliedsystems/qwen-2.5-32B-instruct-gguf-Q4-K-M
- Resultados de evaluacion detallados (intervalos, tamano de fichero): https://pbhappliedsystems.com/models/qwen2.5-32b-instruct#Q4_K_M
- Build F16 del mismo modelo: https://huggingface.co/pbhappliedsystems/qwen-2.5-32B-instruct-gguf-F16
- Coleccion de builds evaluadas (quant_eval v7.22.22): https://huggingface.co/collections/pbhappliedsystems/quant-eval-v722-evaluated-gguf-builds-6abcf3128f7eaf1bedeb97d6
- Corpus de evaluacion (DOI Zenodo): https://doi.org/10.5281/zenodo.22009419
- Demo de agente en vivo: https://pbhappliedsystems.com/assistant
- Sitio del autor: https://pbhappliedsystems.com
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card y los metadatos de HuggingFace.
