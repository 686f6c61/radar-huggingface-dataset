# arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is

## Resumen

Llama-3.1-8B-wmt26-AMI-en-is es un checkpoint fusionado (merged checkpoint) desarrollado por Árnastofnun, el Instituto Árni Magnússon de Estudios Islandeses, como parte de su participación en la tarea compartida de traducción general de WMT 2026 en la dirección inglés→islandés. El modelo combina mediante merge lineal (pesos 0,5/0,5) dos checkpoints: `meta-llama/Meta-Llama-3.1-8B-Instruct` y un checkpoint Llama-3-8B preentrenado de forma continua (continual pretraining) con datos islandeses, que no se ha publicado.

Es importante entender qué es y qué no es este repositorio. Por sí solo, el checkpoint es un modelo instructivo de propósito general con pesos adaptados al islandés, no un sistema de traducción. La funcionalidad de traducción inglés→islandés se obtiene al aplicar encima el adaptador LoRA `arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is-lora`, que fue ajustado sobre esta base concreta. Este repositorio existe precisamente para servir de punto de partida reproducible de ese adaptador.

Técnicamente, hereda la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.248 parámetros en bfloat16 y el tokenizador original de Llama 3.1. Su relevancia actual radica en dos factores: demuestra una vía de bajo coste para adaptar un modelo multilingüe generalista a un idioma de recursos limitados como el islandés, y queda publicado como artefacto abierto (bajo licencia Llama 3.1) vinculado a una submission académica de traducción automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), heredada de `meta-llama/Meta-Llama-3.1-8B-Instruct` |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B; no se indica de forma explícita en la model card de este repositorio) |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos publicados están en bfloat16. Al ser una arquitectura Llama estándar, admite cuantización posterior (p. ej. GPTQ, AWQ, bitsandbytes, GGUF) por herramientas externas, pero el autor no las distribuye |
| Idiomas soportados | inglés (en) e islandés (is) |
| Licencia | llama3.1 (Llama 3.1 Community License, heredada de Meta) |
| Formato de pesos | safetensors (bfloat16), biblioteca `transformers` |
| Método de fusión | mergekit, linear merge, pesos 0,5 / 0,5 |
| Modelo base | meta-llama/Meta-Llama-3.1-8B-Instruct |
| Tokenizador | meta-llama/Meta-Llama-3.1-8B-Instruct |
| Tamaño del repositorio | 16,1 GB |
| Pipeline declarado | translation |
| Fecha de publicación | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct, un transformer decoder-only con atención agrupada por consultas (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Este repositorio no introduce cambios estructurales: es una interpolación lineal de pesos, por lo que el grafo computacional, el tokenizador y la configuración de generación son idénticos a los del modelo base. La fusión se realizó con mergekit en modo `linear`, asignando peso 0,5 a `meta-llama/Meta-Llama-3.1-8B-Instruct` y 0,5 al checkpoint islandés, con `dtype: bfloat16` y el tokenizador tomado del modelo de Meta.

El segundo componente de la fusión es un checkpoint Llama-3-8B sometido a preentrenamiento continuo (CPT) sobre el Icelandic Gigaword Corpus (IGC) y sobre datos OSCAR en inglés, islandés y polaco. Ese checkpoint no se ha publicado, por lo que la fusión no es reproducible de forma exacta por terceros a partir de los artefactos públicos. No se documenta en la model card ningún ajuste posterior mediante RLHF o DPO específico para este merge, ni el número exacto de tokens de CPT empleados. El ajuste fino que convierte esta base en un traductor en→is se realizó mediante LoRA y se distribuye como repositorio separado.

## Capacidades

- Generación de texto instructiva de propósito general, heredada de Llama 3.1 8B Instruct, con pesos reajustados hacia el islandés.
- Comprensión y generación en inglés e islandés; el preentrenamiento continuo con datos islandeses (IGC y OSCAR) refuerza la competencia en esta última lengua.
- Capacidad de traducción inglés→islandés únicamente cuando se combina con el adaptador LoRA `arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is-lora`; sin él, no debe esperarse un comportamiento de traducción fiable.
- Soporte de instrucciones y conversación multi-turno, por herencia del modelo instructivo base.
- Despliegue servido con vLLM mediante `--enable-lora`, lo que permite cargar simultáneamente la base y el adaptador.
- No se documentan en la información disponible capacidades de visión, audio, tool calling específico, modo de razonamiento explícito ni decodificación especulativa.

## Casos de uso

- Traducción automática inglés→islandés en producción: cargando la base junto con el adaptador LoRA en vLLM (`--lora-modules translate-lora=...`), se obtiene un traductor en→is servible por API, que es el uso previsto declarado por el autor.
- Publicación de contenido editorial en islandés: traducción asistida de artículos, documentación o notas de prensa del inglés al islandés, con revisión humana posterior, apoyándose en el CPT islandés para una mayor naturalidad morfológica.
- Localización de interfaces y software: traducción de cadenas de producto y textos de ayuda, con el adaptador marcado como módulo LoRA separado para poder alternar entre tareas sin recargar la base.
- Investigación en traducción de bajos recursos: la pareja base + adaptador sirve como línea base reproducible y citable (submission AMI a WMT 2026) para comparar técnicas de CPT y fusión de pesos en lenguas con pocos datos.
- Evaluación de estrategias de merge: al ser una fusión lineal documentada con pesos explícitos, permite estudiar el efecto de distintas proporciones de mezcla sobre el rendimiento en islandés.
- Generación asistida en islandés para administración pública y educación: resúmenes, reescritura y borradores de textos en islandés, aprovechando los pesos adaptados al idioma en tareas que no sean estrictamente traducción.
- Ajuste fino adicional: la base puede utilizarse como punto de partida para entrenar otros adaptadores LoRA en dominios especializados en islandés (legal, médico, técnico) sin modificar los pesos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas (BLEU, chrF, COMET, MMLU u otras) ni comparaciones cuantitativas. La publicación asociada citada (Steingrímsson et al., 2026, "What a DRAG (It Is Being Small) - The AMI Submission to the WMT 2026 General Translation Shared Task") es donde previsiblemente se reportan los resultados de la tarea compartida, pero sus cifras no forman parte de la información proporcionada. Los resultados de la búsqueda web disponible no guardan relación con este modelo y no aportan datos aprovechables.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para los pesos, más overhead de memoria KV y activaciones; en la práctica, unos 18-20 GB para secuencias moderadas.
- Cuantización a 8 bits: aproximadamente 8-9 GB de pesos. Cuantización a 4 bits: aproximadamente 5-6 GB de pesos. Estas cuantizaciones no las distribuye el autor y requerirían conversión por parte del usuario.
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para servicio en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, 4090) en bfloat16, y en tarjetas de 8-12 GB si se aplica cuantización a 4 bits.
- Opciones de despliegue: vLLM con soporte de LoRA es la vía documentada explícitamente por el autor. Al ser una arquitectura Llama 3.1 estándar con safetensors, también es compatible con TGI, Transformers + bitsandbytes y, previa conversión a GGUF, con llama.cpp y Ollama.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is | 8,03 B | 128.000 tokens (heredado) | en, is | llama3.1 | Fusión lineal 0,5/0,5; requiere el LoRA hermano para traducir |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | multilingüe (incluye en) | llama3.1 | Modelo base; sin adaptación específica al islandés |
| arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is-lora | adaptador LoRA sobre 8 B | no aplica (hereda de la base) | en, is | llama3.1 | Adaptador que convierte la base anterior en traductor en→is |

No se dispone de datos de rendimiento comparativo entre estas opciones ni de otras alternativas de traducción en→is (por ejemplo, modelos dedicados de traducción neuronal) en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- No es un modelo de traducción por sí mismo: sin el adaptador LoRA correspondiente, su uso como traductor en→is no está respaldado por el autor.
- La fusión no es plenamente reproducible: uno de los dos checkpoints fusionados (el Llama-3-8B con CPT islandés) no se ha publicado, por lo que terceros no pueden reconstruir el merge desde cero.
- No se han publicado métricas de calidad, sesgos ni evaluaciones de seguridad para este checkpoint concreto.
- Riesgo de alucinación inherente a los modelos de 8 B de la familia Llama 3.1, especialmente en tareas de traducción de textos largos o especializados sin revisión humana.
- Herencia de los sesgos y limitaciones del modelo base Llama 3.1 8B Instruct y, potencialmente, de la composición de OSCAR y del Icelandic Gigaword Corpus usados en el CPT.
- Cobertura lingüística limitada a inglés e islandés; el rendimiento en otras lenguas, incluido el polaco presente en los datos de CPT, no está documentado.
- La licencia Llama 3.1 Community License impone condiciones adicionales para uso comercial (entre ellas, obligaciones de atribución y la denominada cláusula de licencia comunitaria aplicable a productos con más de 700 millones de usuarios mensuales), por lo que conviene revisarla antes de un despliegue en producción.
- El repositorio no incluye pesos cuantizados; cualquier despliegue en hardware limitado exige convertir el modelo, con la consiguiente pérdida de fidelidad respecto a bfloat16.
- No hay datos publicados sobre latencia, throughput ni estabilidad en servicio de larga duración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is
- Adaptador LoRA asociado: https://huggingface.co/arnastofnun/Llama-3.1-8B-wmt26-AMI-en-is-lora
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Organización: https://huggingface.co/arnastofnun
- Árni Magnússon Institute for Icelandic Studies: https://arnastofnun.is
- mergekit: https://github.com/cg123/mergekit
- vLLM: https://github.com/vllm-project/vllm
- Icelandic Gigaword Corpus (IGC): https://clarin.is/en/resources/gigaword/
- OSCAR: no disponible en la información proporcionada
- Publicación citada: Steingrímsson, S., Þórðarson, S. y Daðason, J. F. (2026). "What a DRAG (It Is Being Small) - The AMI Submission to the WMT 2026 General Translation Shared Task". Proceedings of the Eleventh Conference on Machine Translation, Budapest. Enlace directo: no disponible
- Resultados de la búsqueda web: no relevantes para este modelo (corresponden a un juego web homónimo)
