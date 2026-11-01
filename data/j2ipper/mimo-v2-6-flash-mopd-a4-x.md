# j2ipper/MiMo-V2.6-Flash-MOPD-a4-x

## Resumen

MiMo-V2.6-Flash-MOPD a4-x es una cuantización GGUF de baja precisión mixta del modelo de texto XiaomiMiMo/MiMo-V2.6-Flash-MOPD, desarrollado originalmente por Xiaomi. Esta versión concreta la publica el usuario j2ipper y está dimensionada específicamente para ejecutarse en una máquina AMD Strix Halo con 128 GB de memoria unificada (Ryzen AI Max+ 395 con GPU integrada Radeon 8060S, arquitectura gfx1151). No es un modelo nuevo, sino un artefacto de despliegue: el mismo conjunto de pesos de Xiaomi, recomprimido para caber en hardware de consumo de gama alta.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 309.766.601.088 parámetros totales según los safetensors del repositorio original, lo que lo sitúa en la categoría de modelos de más de 300.000 millones de parámetros. La cuantización reduce el peso en disco a 88,81 GiB repartidos en tres shards, con los expertos enrutados comprimidos de forma agresiva (mayoritariamente IQ2_XXS e IQ3_XXS) mientras se preservan en mayor precisión las capas de atención, las proyecciones densas y las normas.

La relevancia de esta ficha es doble: por un lado documenta un modelo MoE de gran escala con licencia MIT, lo que permite uso comercial sin restricciones; por otro, muestra una receta de cuantización reproducible y verificable (con matriz de importancia, scripts publicados y checksums) orientada a un segmento de hardware muy concreto, el de las APU con memoria unificada, que hasta hace poco no podía alojar modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), con capas MTP (multi-token prediction); inferida de la estructura de tensores del GGUF (51 capas de atención, expertos enrutados en capas 1-47, capas densas 0 y 48-50) |
| Parametros totales | 309.766.601.088 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 196.608 tokens en la configuración de referencia de Talus (`--max-context 196608`); el contexto nativo del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | Mezcla de IQ1_M, Q2_K, IQ2_XXS, IQ2_XS, IQ3_XXS, IQ3_S, Q4_K, Q6_K, Q8_0 y F32 según el tensor; esquema global Q4_K_M con fichero de tipos por tensor |
| Idiomas soportados | no disponible (la calibración incluye texto en inglés y chino, pero no se declara un conjunto oficial de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 88,81 GiB) más matriz de importancia en GGUF (992,39 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atención sobre 51 capas. Los expertos enrutados se concentran en las capas 1 a 47; la capa 0 y las capas 48 a 50 son densas y funcionan como capas MTP (multi-token prediction), una técnica de entrenamiento que añade cabezas auxiliares para predecir varios tokens futuros y que aquí se conserva en el checkpoint. El modelo base almacena los expertos enrutados en MXFP4 (bloques de 32 con escalas E8M0) y los pesos densos en FP8 e4m3 con escalas de bloque de 128x128, mientras que la atención de salida, los embeddings, la cabeza LM, el router y la proyección MTP están en BF16. Esta mezcla de precisiones en el checkpoint original sugiere un entrenamiento orientado a la eficiencia de almacenamiento y a la inferencia en hardware con soporte de FP8.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. Lo que sí está documentado es el proceso de cuantización: se repackan los expertos MXFP4 de forma sin pérdida al layout `block_mxfp4` de ggml, se convierte a GGUF de referencia con `convert_hf_to_gguf.py` (clase `MimoV2Model`), se calcula una matriz de importancia con `llama-imatrix` sobre unas 177.000 tokens de calibración (wikitext-2, Wikipedia en chino, Dolly-15k, GSM8K, MBPP y HumanEval, todas con revisión fijada) y se cuantiza con `llama-quantize` usando un fichero de tipos por tensor. La innovación destacable es el uso de decodificación especulativa mediante un drafter DFlash independiente (`dflash-MiMo-V2.6-Flash-MOPD-Q8_0.gguf`) con vocabulario de borrador de 65.536 entradas, orquestado por el runtime Talus.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada en la calibración (Dolly-15k, GSM8K y MBPP se procesaron con dicha plantilla).
- Razonamiento matemático: la presencia de GSM8K en el conjunto de calibración y de capas MTP apunta a un modelo entrenado para cadenas de razonamiento, aunque no se publican métricas.
- Generación de código: MBPP y HumanEval figuran en la calibración, lo que indica cobertura de tareas de programación.
- Predicción multi-token (MTP) integrada en las capas 48-50, que puede explotarse para decodificación especulativa interna.
- Decodificación especulativa externa mediante drafter DFlash compatible, con vocabulario de borrador reducido a 65.536 tokens.
- Soporte de contexto largo: la configuración de referencia de Talus fija 196.608 tokens con `--ubatch 2048`.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con APIs compatibles con OpenAI, aunque no se detalla en la model card.
- Capacidades multilingües: no declaradas oficialmente; la calibración mezcla inglés y chino.
- No se documentan capacidades de visión, audio, tool calling ni uso de agentes en la información disponible.

## Casos de uso

- Inferencia local de un MoE de más de 300.000 millones de parámetros en una APU Strix Halo: el caso de uso central de esta cuantización. Con 88,81 GiB de pesos y 128 GB de memoria unificada, el modelo cabe holgadamente y deja margen para caché KV con contexto largo.
- Asistente conversacional de contexto extenso en estación de trabajo: los 196.608 tokens configurados permiten mantener conversaciones o documentos de cientos de páginas en memoria sin truncar, útil para análisis de contratos, informes o bases de código completas.
- Generación de código en local sin dependencia de la nube: la cobertura de MBPP y HumanEval en la calibración y la licencia MIT permiten integrarlo en flujos de desarrollo internos donde no se pueden enviar fuentes a terceros.
- Razonamiento matemático y resolución de problemas paso a paso: adecuado para prototipado de tutores o verificadores automáticos, aprovechando las capas MTP para acelerar la generación de cadenas largas.
- Servicio de inferencia compatible con OpenAI en hardware propio: la etiqueta `endpoints_compatible` y el runtime Talus permiten exponer el modelo como endpoint y sustituir llamadas a APIs comerciales en aplicaciones existentes.
- Investigación en cuantización de baja precisión: la receta completa (scripts `mq_stage.py`, `mq_convert.py`, `mq_calib.py`, `mq_refpass.sh`, `mq_quant.py`, `mq_meta.py`, `mq_verify.py`), la matriz de importancia y los checksums hacen de este repositorio un caso de estudio reproducible para evaluar el impacto de IQ2/IQ3 en un MoE grande.
- Despliegue en entornos con requisitos de soberanía del dato: al ser MIT y ejecutarse íntegramente en local, encaja en organizaciones que exigen que ningún dato salga de su infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 88,81 GiB de pesos en disco; en ejecución se necesita además la caché KV para el contexto configurado. Con 196.608 tokens de contexto y `--ubatch 2048`, el consumo total puede acercarse al límite de 128 GB de memoria unificada, por lo que conviene monitorizar y ajustar `--max-context` según la carga.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), 128 GB de memoria unificada. Es el objetivo explícito del autor.
- GPU discretas: no se documenta compatibilidad ni rendimiento en A100, H100 o RTX 4090. Por tamaño, un solo acelerador de 80 GB no alojaría los 88,81 GiB de pesos junto con la caché KV; haría falta repartir entre varias GPU o usar memoria del sistema.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB. Solo es viable en configuraciones con memoria unificada grande o multi-GPU.
- Opciones de despliegue: Talus (runtime de referencia, con soporte de decodificación especulativa DFlash) y llama.cpp (el GGUF se genera con sus herramientas y apunta al primer shard). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Throughput y latencia: no disponibles. La decodificación especulativa con `--spec 4` y vocabulario de borrador de 65.536 tokens está pensada para mejorar la velocidad de generación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-MOPD a4-x (esta ficha) | 309.766.601.088 | 196.608 (config. Talus) | MIT | GGUF, 88,81 GiB, 3 shards | Cuantización mixta IQ2/IQ3/IQ4 orientada a Strix Halo |
| XiaomiMiMo/MiMo-V2.6-Flash-MOPD (base) | 309.766.601.088 | no disponible | MIT | Safetensors MXFP4/FP8/BF16 | Pesos originales de Xiaomi; requiere mucha más memoria |
| ggml-org/MiMo-V2.6-Flash-MOPD-GGUF | 309.766.601.088 | no disponible | MIT | GGUF | Cuantizaciones oficiales de ggml-org; incluye el drafter DFlash Q8_0 reutilizado aquí |
| Otros MoE de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización de los expertos enrutados a IQ2_XXS e IQ3_XXS es muy agresiva; es esperable una degradación de calidad respecto a los pesos originales, especialmente en tareas de razonamiento fino y código, aunque no se publican evaluaciones que la cuantifiquen.
- El autor no reporta métricas de perplejidad ni benchmarks comparativos entre esta cuantización y el modelo base, por lo que la pérdida real de calidad es desconocida.
- No se declara un conjunto oficial de idiomas soportados; el rendimiento fuera de inglés y chino no está verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan medidas de mitigación ni evaluaciones de veracidad.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, políticos o culturales.
- Restricciones de licencia: la licencia MIT del modelo base y de esta cuantización permite uso comercial, pero la matriz de importancia y el texto de calibración derivan de datasets con licencias mixtas (CC-BY-SA-3.0, GFDL, CC-BY-4.0, MIT); la parte CC-BY-SA es share-alike y conviene revisarla si se redistribuye la matriz.
- Dependencia de hardware: el artefacto está dimensionado para 128 GB de memoria unificada; en configuraciones menores habrá que reducir contexto o no cabrá.
- El runtime de referencia es Talus, un proyecto de nicho; la experiencia con llama.cpp estándar puede diferir y la decodificación especulativa requiere descargar por separado el drafter y el vocabulario de borrador.
- El repositorio tiene muy poca tracción (144 descargas, 0 likes) y una sola revisión publicada; no hay validación comunitaria independiente de los checksums ni del proceso.
- La fecha de creación del repositorio es posterior a la del conocimiento de referencia habitual; verificar la procedencia y los checksums antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/j2ipper/MiMo-V2.6-Flash-MOPD-a4-x
- Modelo base en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Cuantizaciones GGUF de ggml-org (incluye el drafter DFlash): https://huggingface.co/ggml-org/MiMo-V2.6-Flash-MOPD-GGUF
- Vocabulario de borrador (64K): https://huggingface.co/j2ipper/draft-vocab
- Runtime Talus (repositorio público): https://github.com/nsbradley88/talus-public
- Documentación de modelos de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/MODELS.md
- Guía de inicio rápido de Talus: https://github.com/nsbradley88/talus-public#quick-start
- Dataset de calibración wikitext: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset de calibración Wikipedia (20231101.zh): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset de calibración Dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset de calibración GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset de calibración MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
