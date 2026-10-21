# prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP

## Resumen

Sage-A1.5-MXFP4_MOE-MTP es una cuantización GGUF del modelo Sage-A1.5, un modelo multimodal de tipo Mixture-of-Experts (MoE) con aproximadamente 35.500 millones de parámetros desarrollado por Shanghai AI Laboratory y publicado en el repositorio InternScience/Sage-A1.5. Esta versión concreta la distribuye el usuario prithivMLmods en formato GGUF, con cuantizaciones que van desde BF16 (71,1 GB) hasta MXFP4_MOE (20,3 GB) y Q3_K_L (18,6 GB), pensadas para ejecución local con llama.cpp.

El modelo está orientado a resolución de problemas científicos de largo horizonte, flujos de trabajo de ingeniería complejos y descubrimiento científico abierto, con integración nativa de herramientas y dos paradigmas de ejecución opcionales: orquestación agéntica (despacho de subagentes en paralelo mediante `spawn_subagent` con contextos aislados) y modo verificación (autoevaluación dentro de la trayectoria de razonamiento sin crítico externo). Incorpora además soporte de Multi-Token Prediction (MTP) para decodificación especulativa integrada en los pesos, lo que acelera la inferencia local sin necesidad de un modelo borrador separado.

Su relevancia actual radica en la combinación de ventana de contexto nativa de 256K tokens (extensible a 512K mediante YaRN), capacidades multimodales con proyector visual (`mmproj`) y un rendimiento declarado por el autor que compite con sistemas de mayor tamaño en pruebas como GAIA, BrowseComp o SWE-bench Pro. La licencia es Apache-2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, con cabezas de Multi-Token Prediction (MTP) para decodificación especulativa |
| Parametros totales | 35.505.251.456 (≈35,5B) |
| Parametros activos | no disponible (el número de expertos y de parámetros activos no figura en la información proporcionada) |
| Longitud de contexto | 256K tokens nativos, extensible a 512K mediante YaRN |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q3_K_L, Q5_K_M, Q6_K (GGUF); proyector multimodal en bf16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16, MXFP4_MOE, Q3_K_L, Q5_K_M, Q6_K) y fichero `mmproj-bf16.gguf` para visión; el repositorio incluye también pesos en safetensors según los metadatos de HuggingFace |

## Arquitectura y entrenamiento

Sage-A1.5 es un transformer disperso de tipo MoE con codificador visual conectado mediante un proyector multimodal (`mmproj`), construido sobre Agents-A1 según la model card. La innovación principal en esta versión es la integración de cabezas MTP dentro de la arquitectura principal: en lugar de emplear un modelo borrador independiente, el propio modelo predice varios tokens futuros en una sola pasada, lo que permite decodificación especulativa (`--spec-type draft-mtp`) directamente en llama.cpp y, según la model card, también en vLLM y SGLang. A esto se suman dos modos de ejecución opcionales: orquestación agéntica con subagentes paralelos de contexto aislado y modo verificación, que audita evidencias y revisa estrategias improductivas dentro de la cadena de razonamiento del propio modelo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación; la model card no detalla estos extremos. Tampoco se especifican el número de expertos, el enrutador utilizado ni los parámetros activos por token. La cuantización MXFP4_MOE mezcla precisión por bloques con un tratamiento específico de las capas MoE, lo que reduce el peso a 20,3 GB frente a los 71,1 GB del BF16.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de verificación interno para revisar evidencias a lo largo de la trayectoria.
- Razonamiento científico y matemático de nivel de olimpiada (FrontierScience-Olympiad) y resolución de problemas de ingeniería.
- Codificación y trabajo sobre repositorios (SWE-bench Pro), con soporte declarado para flujos de ingeniería de software.
- Capacidad multimodal: entrada de imágenes a través del proyector `mmproj-bf16.gguf`, con resultados declarados en OmniDocBench para comprensión de documentos.
- Tool calling / function calling nativo, con integración de herramientas como parte del bucle de razonamiento.
- Comportamiento agéntico: orquestación con subagentes paralelos (`spawn_subagent`) y contextos aislados para descomponer subpreguntas independientes.
- Navegación y búsqueda web agéntica (resultados declarados en BrowseComp y GAIA).
- Contexto largo: 256K tokens nativos, ampliables a 512K con YaRN.
- Decodificación especulativa MTP integrada, con hasta 2 tokens borrador por paso en la configuración probada.
- Idiomas: únicamente inglés declarado; no se documenta soporte multilingüe.

## Casos de uso

- Investigación científica asistida: el modelo puede descomponer una pregunta de investigación en subpreguntas, lanzar subagentes en paralelo con `spawn_subagent` y consolidar evidencias, aprovechando el modo verificación para descartar líneas improductivas sin un crítico externo.
- Revisión de literatura y documentos largos: con 256K tokens de contexto y el proyector visual, permite cargar artículos, tablas e imágenes de resultados y extraer conclusiones cruzadas en una sola sesión.
- Automatización de ingeniería de software: dado su rendimiento declarado en SWE-bench Pro y su soporte de tool calling, encaja en pipelines que leen el repositorio, ejecutan pruebas y proponen parches dentro de un bucle agéntico.
- Extracción estructurada de documentación técnica: OmniDocBench sugiere uso en digitalización de informes, patentes o manuales con tablas y figuras, generando salidas estructuradas mediante function calling.
- Asistentes de análisis con navegación web: para tareas de recopilación y verificación de fuentes (BrowseComp, GAIA), el modelo puede iterar búsquedas, abrir resultados y contrastar datos antes de responder.
- Despliegue local con privacidad de datos: la cuantización MXFP4_MOE (20,3 GB) permite ejecutar el modelo en una única GPU de 24 GB con contexto corto, útil en entornos donde los datos no pueden salir de la infraestructura.
- Aceleración de prototipos en estaciones de trabajo: la variante Q5_K_M o Q6_K con MTP permite obtener velocidades de generación altas en GPUs profesionales sin montar un servicio distribuido.

## Benchmarks y rendimiento

Resultados declarados en la model card para el modelo Sage-A1.5 (no verificados de forma independiente en la información disponible):

| Benchmark | Resultado |
|---|---|
| GAIA | 95,1 |
| OmniDocBench | 91,5 |
| XBench-DS-2510 | 92,0 |
| PinchBench | 90,0 |
| IFBench | 81,6 |
| FrontierScience-Olympiad | 81,0 |
| SWE-bench Pro | 61,2 |
| BrowseComp | 82,8 |

Prueba de inferencia de esta cuantización concreta (llama-cli, RTX PRO 6000 Blackwell Server Edition de 96 GB, `-ngl 99`, contexto 8.192, KV cache K en `q8_0`, `draft-mtp` con máximo 2 tokens borrador, semilla 42):

| Métrica | Valor |
|---|---|
| Velocidad de procesamiento del prompt | 94,1 tokens/s |
| Velocidad de generación | 270,4 tokens/s |
| Tiempo total | 20,216 s |
| VRAM pico | 19,72 GiB |
| Uso de GPU pico | 81 % |
| Capas offloaded a GPU | 99 |

No se han publicado en la información disponible resultados de benchmarks comparativos entre esta cuantización y el modelo base en BF16, ni mediciones independientes de la pérdida de calidad introducida por MXFP4_MOE o Q3_K_L.

## Requisitos de hardware

- VRAM estimada según fichero: BF16 ≈71,1 GB de pesos; Q6_K ≈29,2 GB; Q5_K_M ≈25,3 GB; MXFP4_MOE ≈20,3 GB; Q3_K_L ≈18,6 GB. Añadir aproximadamente 0,9 GB del proyector `mmproj-bf16.gguf` si se usa visión, más el espacio de caché KV.
- Caché KV: en la prueba publicada, con contexto de 8.192 tokens y caché K en `q8_0`, el consumo total fue de 19,72 GiB con MXFP4_MOE. A contextos de 256K el coste de caché KV crece de forma considerable y probablemente exige cuantizar también la caché V y reducir el contexto efectivo.
- GPUs recomendadas: RTX PRO 6000 Blackwell (96 GB) es la configuración validada; para MXFP4_MOE caben también RTX 4090 / RTX 3090 de 24 GB con contexto corto, y tarjetas de 32 GB o más con mayor margen. Para Q5_K_M y Q6_K se recomiendan 32-48 GB de VRAM. BF16 requiere 80 GB o varias GPU.
- Cabe en GPU de consumo: sí, la variante MXFP4_MOE o Q3_K_L en GPUs de 24 GB, a costa de contexto reducido y de posible descarga parcial de capas a RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con soporte de `--spec-type draft-mtp`; los tags del repositorio incluyen además text-generation-inference y transformers, y la model card cita vLLM y SGLang para el decodificado especulativo MTP del modelo base.
- Throughput observado: 270,4 tokens/s de generación y 94,1 tokens/s de procesamiento de prompt con MTP y 2 tokens borrador en la GPU citada; no hay datos de latencia para GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-MXFP4_MOE-MTP (esta ficha) | 35,5B totales (activos no disponibles) | 256K, 512K con YaRN | Apache-2.0 | GGUF (MXFP4_MOE y otras) | Cuantización de terceros con MTP integrado para decodificación especulativa |
| InternScience/Sage-A1.5 (modelo base) | 35,5B totales | 256K, 512K con YaRN | Apache-2.0 | safetensors | Pesos completos en BF16; referencia de calidad frente a la cuantización |
| Alternativas MoE abiertas de tamaño similar (por ejemplo, familias Qwen3-MoE o Mixtral) | no disponible en esta ficha | no disponible en esta ficha | habitualmente Apache-2.0 | safetensors, GGUF | No se dispone de datos verificados en la información proporcionada para comparar rendimiento; se recomienda consultar sus fichas oficiales |

No se han encontrado en la información proporcionada comparativas publicadas entre Sage-A1.5 y otros modelos del mismo rango de parámetros con resultados homogéneos; los benchmarks de la sección anterior son autodeclarados por el autor del modelo.

## Limitaciones y advertencias

- Idioma: solo se declara inglés; no hay evidencia de soporte fiable de castellano u otras lenguas, por lo que su uso en producción multilingüe requiere evaluación previa.
- Benchmarks autodeclarados: los resultados de GAIA, OmniDocBench, SWE-bench Pro, BrowseComp, etc. provienen de la model card y no se han verificado de forma independiente en la información disponible.
- Pérdida por cuantización: MXFP4_MOE y Q3_K_L reducen precisión; no se han publicado mediciones de degradación respecto al BF16, especialmente sensible en razonamiento matemático y en tareas de agente con tool calling.
- Riesgo de alucinación: como modelo generativo orientado a agentes, puede emitir llamadas a herramientas, citas o resultados de búsqueda plausibles pero incorrectos; el modo verificación es interno y no sustituye una validación externa.
- Contexto efectivo: aunque se anuncian 256K tokens, la prueba publicada se ejecutó con 8.192 tokens de contexto; el rendimiento y la estabilidad más allá de esa longitud no están documentados para esta cuantización.
- Requisitos de tooling: el decodificado especulativo MTP y el formato MXFP4_MOE exigen builds recientes de llama.cpp; versiones antiguas pueden no cargar el modelo o ignorar las cabezas MTP.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base InternScience/Sage-A1.5 y de los datos de entrenamiento, no detallados en la información disponible.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez frente a prompts adversarios.
- Madurez del repositorio: 0 descargas y 1 like en el momento de la consulta, lo que implica poca validación por parte de la comunidad.
- Los resultados de búsqueda web associados a esta consulta no contenían información relevante sobre el modelo (trataban sobre un dominio vinícola francés) y se han descartado.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- llama.cpp (motor de inferencia empleado para la cuantización): https://github.com/ggml-org/llama.cpp
- Ficheros GGUF: [BF16](https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP/blob/main/Sage-A1.5.BF16.gguf), [MXFP4_MOE](https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP/blob/main/Sage-A1.5.MXFP4_MOE.gguf), [Q3_K_L](https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP/blob/main/Sage-A1.5.Q3_K_L.gguf), [Q5_K_M](https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP/blob/main/Sage-A1.5.Q5_K_M.gguf), [Q6_K](https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP/blob/main/Sage-A1.5.Q6_K.gguf), [mmproj-bf16](https://huggingface.co/prithivMLmods/Sage-A1.5-MXFP4_MOE-MTP/blob/main/Sage-A1.5.mmproj-bf16.gguf)
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
