# RicardoEstep/RPBizkit-v9-12B

## Resumen

RPBizkit-v9-12B es un modelo de lenguaje experimental de 12.247.782.400 parámetros (aproximadamente 12,2 mil millones), publicado por el usuario RicardoEstep en Hugging Face. No es un modelo entrenado desde cero, sino un *merge* de pesos construido con Mergekit sobre la arquitectura Mistral Nemo, cuyo checkpoint base es natong19/Mistral-Nemo-Instruct-2407-abliterated. El autor lo describe como su "última versión" y "la más estable", orientada a roleplay y generación de texto sin restricciones de contenido.

La construcción se organiza en cinco fases: cuatro sub-merges temáticos ("Simpleness", "Setting", "Phantasy" y "Darkness"), cada uno combinando tres modelos de rol adicionales sobre el mismo checkpoint base, y una mezcla final que fusiona los cuatro resultados intermedios con el base. Todos los pasos emplean DARE TIES (arxiv:2311.03099) con pesos de 0,3333 y densidad 0,5, más Model Stock (arxiv:2403.19522) en la fase final, en precisión bfloat16.

Su relevancia es acotada y de nicho: se inscribe en el ecosistema de merges comunitarios para roleplay sin censura, un segmento muy activo pero sin evaluación formal. La model card no documenta idiomas, licencia, contexto ni resultados de benchmarks, y el propio autor advierte de que el modelo requiere temperaturas bajas (entre 1 y 1,1) y de que su comportamiento es irregular en cuanto a filtrado de contenido. A fecha de creación del registro acumula 0 descargas y 1 like, por lo que debe considerarse una publicación de carácter personal y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Mistral Nemo (según etiquetas `mistral` y modelo base Mistral-Nemo-Instruct-2407-abliterated) |
| Parametros totales | 12.247.782.400 (12,2 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el linaje Mistral Nemo soporta hasta 128.000 tokens, pero no se confirma para este merge |
| Tipos de cuantizacion | no especificados por el autor; el checkpoint se distribuye en bfloat16, lo que permite derivar GGUF, GPTQ, AWQ y EXL2 |
| Idiomas soportados | no disponible (no documentados en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16), biblioteca `transformers` |
| Metodo de fusion | DARE TIES (arxiv:2311.03099) + Model Stock (arxiv:2403.19522) con Mergekit |
| Tamano del repositorio | 24,5 GB |
| Modelo base | natong19/Mistral-Nemo-Instruct-2407-abliterated |
| Etiquetas relevantes | `not-for-all-audiences`, `text-generation-inference`, `endpoints_compatible`, `region:us` |
| Fecha de creacion | 23 de septiembre de 2026 |
| Ultima actualizacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay entrenamiento en el sentido convencional: el modelo es el resultado de una fusión de pesos (*model merging*) sobre un transformer denso Mistral Nemo de 12,2 B parámetros. El proceso se divide en cinco partes. Las cuatro primeras toman el checkpoint base abliterado (natong19/Mistral-Nemo-Instruct-2407-abliterated) y le aplican DARE TIES con tres modelos de rol cada una, todos con peso 0,3333, densidad 0,5, `normalize: true`, `int8_mask: false` y semilla aleatoria 5318008. La parte uno ("Simpleness") combina Muse-12B, UnslopNemo-12B-v4.1 y magnum-v2-12b; la dos ("Setting") combina Forgotten-Safeword-12B-v4.0, Pantheon-RP-1.6.1-12b-Nemo y MN-12B-Mag-Mell-R1; la tres ("Phantasy") combina Nera_Noctis-12B, MN-Violet-Lotus-12B y Himeyuri-v0.1-12B; y la cuatro ("Darkness") combina Wayfarer-2-12B-absolute-heresy, Mistral-Nemo-12B-ArliAI-RPMax-v1.2 e Impish_Bloodmoon_12B.

La quinta parte fusiona los cuatro resultados intermedios (identificados como `output1` a `output4`) junto con el checkpoint base, empleando Model Stock como método adicional. El tokenizador se hereda del modelo base (`tokenizer_source: base`) y todo el proceso se ejecuta en bfloat16.

No se documentan tokens de entrenamiento, composición de dataset, fases de RLHF o DPO, ni innovaciones técnicas más allá del propio esquema de fusión. DARE TIES reduce la interferencia entre modelos mediante poda aleatoria de deltas y resolución de signos; Model Stock aproxima el punto óptimo de fusión a partir de un conjunto de modelos de partida. El autor no publica la configuración completa de la quinta fase: el fragmento de model card disponible se corta en ese punto.

## Capacidades

- Generación de texto libre y conversacional, con orientación explícita a roleplay y narrativa interactiva.
- Escritura creativa de ficción, incluyendo contenido para adultos (etiqueta `not-for-all-audiences`).
- Continuación de diálogos multi-turno manteniendo personajes y estilo a lo largo de la conversación.
- Adopción de registros y voces narrativas diferenciadas, herencia de los modelos de rol fusionados (Pantheon-RP, Magnum, UnslopNemo, entre otros).
- Generación sin censura aparente, aunque el propio autor señala que el modelo "a veces no actúa como un modelo completamente sin censura", lo que describe como un comportamiento inesperado.
- Compatibilidad con `text-generation-inference` y endpoints compatibles con la API de inferencia, según las etiquetas del repositorio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- No se documentan capacidades multilingües específicas para este merge.

## Casos de uso

- Roleplay conversacional local: el modelo está diseñado para sostener interacciones de personaje en varios turnos; sus 12,2 B parámetros permiten ejecutarlo en una GPU de gama alta de consumo con cuantización, sin enviar datos a servicios externos.
- Escritura de ficción para adultos: el ajuste sin censura de los modelos fusionados lo hace adecuado para narrativa explícita, un nicho donde los modelos alineados rechazan peticiones de forma sistemática.
- Generación de diálogos para videojuegos y novelas visuales: sus variantes temáticas (fantasía, ambientación, tono oscuro) cubren distintos registros, útiles para producir borradores de guion de personajes.
- Prototipado de chatbots de personaje: la herencia de Pantheon-RP y Magnum aporta consistencia en la voz del personaje, lo que reduce el trabajo de prompting en proyectos de entretenimiento conversacional.
- Investigación sobre fusiones de modelos: el repositorio documenta cuatro sub-merges con hiperparámetros idénticos y una fase final distinta, un caso de estudio útil para analizar cómo afecta DARE TIES + Model Stock al comportamiento resultante.
- Estudios de seguridad y alineación: sirve como ejemplo de modelo abliterado y sin censura para medir hasta qué punto persisten rechazos tras la fusión, algo que el propio autor reporta como parcialmente inesperado.
- Base para fine-tuning posterior: al ser un Mistral Nemo estándar en safetensors y bfloat16, se puede ajustar con LoRA o QLoRA usando el ecosistema habitual de `transformers`, PEFT y TRL.
- Inferencia económica autoalojada: con cuantización de 4 bits cabe en GPUs de 8-12 GB, lo que permite desplegarlo en estaciones de trabajo modestas o en instancias cloud de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de rol, y el autor basa sus afirmaciones en impresiones subjetivas de pruebas propias ("me sorprendió en términos de calidad pura"), sin cifras ni metodología. Tampoco se han encontrado evaluaciones independientes del modelo en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de 12,2 B parámetros; no confirmados por el autor):
  - bfloat16 / float16: aproximadamente 24,5 GB solo para pesos, más caché KV.
  - Cuantización de 8 bits: aproximadamente 12-13 GB.
  - GGUF Q6_K: aproximadamente 10-11 GB.
  - GGUF Q5_K_M: aproximadamente 8,5-9 GB.
  - GGUF Q4_K_M: aproximadamente 7,5-8 GB.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para servicio en bfloat16 con lotes grandes; RTX 3090, RTX 4090, RTX A6000 y L40S (24-48 GB) para bfloat16 con contexto moderado o cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí. RTX 4090 y RTX 3090 en bfloat16 con contexto limitado o 8 bits; RTX 4080, RTX 4070 Ti Super y RTX 4060 Ti de 16 GB en 8 bits o GGUF Q5/Q6; tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060, RTX 3070) con GGUF Q4.
- Opciones de despliegue: vLLM y Hugging Face TGI (etiquetados como compatibles), llama.cpp, Ollama, LM Studio, text-generation-webui, ExLlamaV2 y Transformers con bitsandbytes para cargas cuantizadas.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para este modelo.
- Nota sobre parámetros de muestreo: el autor recomienda temperaturas entre 1 y 1,1, más bajas que las habituales en modelos de rol, y advierte de que valores superiores degradan la calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| RicardoEstep/RPBizkit-v9-12B | 12,2 B | no disponible (linaje Mistral Nemo: hasta 128.000 tokens) | no disponible | no publicados | Hugging Face, 0 descargas, 1 like |
| TheDrummer/UnslopNemo-12B-v4.1 | 12,2 B (clase Mistral Nemo) | 128.000 tokens (Mistral Nemo) | no disponible | no publicados en la informacion disponible | Hugging Face, componente de este merge |
| anthracite-org/magnum-v2-12b | 12,2 B (clase Mistral Nemo) | 128.000 tokens (Mistral Nemo) | no disponible | no publicados en la informacion disponible | Hugging Face, componente de este merge |
| Mistral-Nemo-Instruct-2407 | 12,2 B | 128.000 tokens | Apache 2.0 (según la publicación original de Mistral AI) | MMLU, MT-Bench y otros publicados por Mistral AI | Hugging Face, ampliamente adoptado |
| RicardoEstep/RPBizkit-v8-12B | 12,2 B | no disponible | no disponible | no publicados | Hugging Face, versión previa de la misma familia |

La comparación cuantitativa con alternativas no es posible: ni este modelo ni sus componentes publican resultados de evaluación, y los únicos datos verificables son el recuento de parámetros (idéntico en toda la clase Mistral Nemo, 12,2 B), el método de construcción y la ausencia de licencia declarada, que contrasta con la licencia Apache 2.0 del Mistral NeMo original.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica términos legales. Esto genera incertidumbre sobre el uso comercial y sobre la redistribución, agravada porque el modelo base y varios de los componentes fusionados tampoco publican licencia en la información disponible.
- Contenido para adultos: la etiqueta `not-for-all-audiences` indica que el modelo puede generar material explícito, violento o potencialmente dañino. No es apto para productos dirigidos al público general ni para entornos sin moderación.
- Ausencia de alineación: al derivar de checkpoints "abliterated" y de merges sin censura, no incorpora las salvaguardas de rechazo de los modelos instructivos convencionales. Cualquier despliegue en producción requeriría moderación externa.
- Sesgos: no se han publicado auditorías de sesgo. Los datasets de los modelos de rol subyacentes no están documentados, por lo que se desconocen los sesgos de género, origen, idioma o cultura que pueda reproducir.
- Riesgo de alucinación: no evaluado. Como modelo orientado a ficción, tiende a priorizar la coherencia narrativa sobre la veracidad factual, lo que lo hace inadecuado para tareas de recuperación de información.
- Idiomas no documentados: se desconoce si conserva el multilingüismo del Mistral NeMo original y con qué calidad. No se debe asumir un rendimiento correcto en castellano sin pruebas propias.
- Contexto no verificado: aunque el linaje Mistral Nemo soporta 128.000 tokens, la model card no confirma esta cifra para el merge ni documenta si la fusión la preserva.
- Estabilidad del comportamiento: el autor describe explícitamente un comportamiento errático en cuanto al filtrado de contenido y recomienda temperaturas bajas. Es una advertencia directa sobre la previsibilidad del modelo en producción.
- Adopción nula: con 0 descargas y 1 like, no existe validación independiente, ni issues, ni comunidad que haya reportado problemas de calidad, compatibilidad o seguridad.
- Fecha de creación anómala: el registro indica septiembre de 2026, posterior a la fecha de esta ficha, lo que sugiere un posible error en los metadatos del repositorio.
- Rendimiento no medido: no hay datos de latencia, throughput ni consumo de VRAM reales, por lo que los requisitos de hardware indicados son estimaciones basadas en el tamaño del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RicardoEstep/RPBizkit-v9-12B
- Version previa de la familia: https://huggingface.co/RicardoEstep/RPBizkit-v8-12B
- Modelo base del merge: https://huggingface.co/natong19/Mistral-Nemo-Instruct-2407-abliterated
- Componente: https://huggingface.co/LatitudeGames/Muse-12B
- Componente: https://huggingface.co/TheDrummer/UnslopNemo-12B-v4.1
- Componente: https://huggingface.co/anthracite-org/magnum-v2-12b
- Componente: https://huggingface.co/ReadyArt/Forgotten-Safeword-12B-v4.0
- Componente: https://huggingface.co/Gryphe/Pantheon-RP-1.6.1-12b-Nemo
- Componente: https://huggingface.co/inflatebot/MN-12B-Mag-Mell-R1
- Componente: https://huggingface.co/ChaoticNeutrals/Nera_Noctis-12B
- Componente: https://huggingface.co/FallenMerick/MN-Violet-Lotus-12B
- Componente: https://huggingface.co/Elizezen/Himeyuri-v0.1-12B
- Componente: https://huggingface.co/MuXodious/Wayfarer-2-12B-absolute-heresy
- Componente: https://huggingface.co/ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.2
- Componente: https://huggingface.co/SicariusSicariiStuff/Impish_Bloodmoon_12B
- Articulo DARE TIES: https://arxiv.org/abs/2311.03099
- Articulo Model Stock: https://arxiv.org/abs/2403.19522
- Repositorio de Mergekit: https://github.com/cg123/mergekit
- Perfil del autor: https://huggingface.co/RicardoEstep/models
- Despliegue gestionado (version 7 de la familia): https://featherless.ai/models/RicardoEstep/RPBizkit-v7-12B
- Despliegue gestionado (version inicial): https://friendli.ai/models/RicardoEstep/RPBizkit-12B
- Despliegue gestionado (RemiX v1): https://featherless.ai/models/RicardoEstep/RPBizkitRemiX-v1-12B
