# Dhisanth/hilabs-term-mapping

## Resumen

`Dhisanth/hilabs-term-mapping` no es un modelo único, sino un paquete de artefactos entrenados que componen el motor de mapeo de términos clínicos presentado por el autor al HiLabs AI Quest 2026. El objetivo del sistema es resolver el problema de *clinical entity linking*: dado un término clínico extraído de un historial (por ejemplo, una mención a una enfermedad en una nota de curso clínico) junto con el contexto del fragmento donde aparece, devolver el código ICD-10-CM y el código SNOMED CT que le corresponden. Se trata, por tanto, de una tarea de normalización terminológica y no de generación de texto libre.

La arquitectura es un ensemble por etapas (*retrieval* + *reranking* + *ranking* supervisado): dos bi-encoders SapBERT afinados de forma contrastiva con negativos duros en dos rondas (`biencoder/`, `biencoder_r1/`), un cross-encoder SapBERT que reordena candidatos usando término más contexto de fragmento (`crossencoder/`), un adaptador QLoRA sobre `unsloth/Qwen3-4B-Instruct-2507-bnb-4bit` que actúa como reranker listwise (`llm_adapter/`), cinco seeds de rankers LightGBM LambdaRank con bolsas (`r1_*`, `r2_*`, `r2l_*`, `r3_*`) y clasificadores de tipo de concepto por contexto de fragmento (`ctx_*.pkl`). El repositorio ocupa 1,5 GB y no incluye datos de entrenamiento, texto de historiales, diccionarios ni claves de API.

Su relevancia práctica está en que expone un pipeline completo de codificación clínica reproducible con licencia Apache-2.0 y bases permisivas (SapBERT y Qwen3-4B), un nicho donde la mayoría de soluciones son propietarias. Ahora bien, el repositorio se publicó con 0 descargas y 0 likes, la model card remite a un repositorio de GitHub que no se enlaza de forma explícita y no se han publicado métricas de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble híbrido: bi-encoders y cross-encoder SapBERT (BERT), adaptador QLoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only, 4 bits), rankers LightGBM LambdaRank y clasificadores de tipo de concepto |
| Parametros totales | No disponible (el repositorio agrega varios componentes; el adaptador LoRA se aplica sobre Qwen3-4B-Instruct-2507, 4B, y los codificadores derivan de SapBERT) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El LLM reranker se entrenó y usa en 4 bits (bitsandbytes, `bnb-4bit`); el resto de componentes se distribuye en safetensors de precisión completa o media, sin variantes GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | No disponible (la tarea y los vocabularios objetivo, ICD-10-CM y SNOMED CT, son propios del inglés clínico estadounidense) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (codificadores y adaptador), además de `.pkl` (clasificadores), `.txt` (bolsas de seeds), `.json` (features) y `.csv` (pares ICD↔SNOMED) |

## Arquitectura y entrenamiento

El sistema se organiza como una cascada de recuperación y reordenación. La primera etapa son bi-encoders basados en `cambridgeltl/SapBERT-from-PubMedBERT-fulltext` afinados con aprendizaje contrastivo y minado de negativos duros en dos rondas: `biencoder/` corresponde a la ronda 1 y `biencoder_r1/` a la ronda 2, de modo que el segundo se entrenó con negativos más difíciles obtenidos del primero. Sobre los candidatos recuperados actúan dos rerankers complementarios: un cross-encoder SapBERT que codifica conjuntamente el término más el contexto del fragmento frente a cada candidato, y un adaptador QLoRA sobre Qwen3-4B-Instruct-2507 que realiza reordenación listwise, es decir, puntuando el conjunto de candidatos de forma conjunta en lugar de uno a uno. La señal de ambos se combina en rankers LightGBM LambdaRank (`r1_*`, `r2_*`, `r2l_*`, `r3_*`), entrenados con cinco seeds y agregados en bolsas mediante ficheros `__bag*.txt`, con las features declaradas en `ranker_features.json`. Complementariamente, los `ctx_*.pkl` son clasificadores de tipo de concepto basados en el contexto del fragmento; el autor indica que el vocabulario se almacena como hashes y no como texto plano de historiales, lo que reduce la exposición de datos clínicos.

No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF o DPO (en un pipeline de *entity linking* no serían el mecanismo habitual). Tampoco se documentan decisiones de entrenamiento como la función de pérdida exacta del cross-encoder, el número de épocas, la composición de los negativos duros ni los hiperparámetros de los rankers. El paquete incluye `pairs.csv` con pares de coocurrencia de códigos ICD y SNOMED (solo códigos), lo que sugiere que el sistema explota la correlación entre ambos vocabularios para desambiguar, pero no se detalla cómo se construyó ni con qué volumen.

## Capacidades

- Normalización de menciones clínicas a ICD-10-CM y SNOMED CT, devolviendo códigos candidatos ordenados por puntuación.
- Recuperación densa de conceptos candidatos mediante búsqueda vectorial con bi-encoders SapBERT especializados en terminología biomédica.
- Desambiguación sensible al contexto: el cross-encoder y los clasificadores `ctx_*` incorporan el fragmento del historial donde aparece la mención, no solo el término aislado.
- Reordenación listwise con un LLM de 4B (Qwen3-4B-Instruct-2507 con adaptador QLoRA), útil cuando varios candidatos son léxicamente plausibles.
- Ranking supervisado con features heterogéneas (LightGBM LambdaRank) que fusiona las puntuaciones de todas las etapas anteriores.
- Explotación de la coocurrencia ICD↔SNOMED mediante `pairs.csv` para refinar la asignación entre ambos vocabularios.
- Empaquetado reproducible: el motor descarga el repositorio automáticamente en `models/` en la primera ejecución de `python run.py predict`.
- No se documentan capacidades de generación libre, tool calling, razonamiento multi-paso genérico, visión ni audio; el adaptador Qwen3 se usa como reranker, no como asistente conversacional.

## Casos de uso

- Codificación clínica asistida: el motor recibe las menciones detectadas por un extractor de entidades y propone el código ICD-10-CM y SNOMED CT más probable para cada una; el codificador humano revisa una lista corta en lugar de buscar en el vocabulario completo.
- Enriquecimiento de historiales electrónicos hacia estándares: conversión de problemas y diagnósticos en texto libre a códigos normalizados para su carga en FHIR (`Condition.code`) u OMOP CDM (`condition_concept_id`), con contexto de fragmento para resolver ambigüedades como "dolor torácico" frente a "dolor torácico atípico".
- Interoperabilidad entre sistemas que usan vocabularios distintos: uso de `pairs.csv` y de las dos salidas simultáneas para mapear registros codificados solo en SNOMED CT a ICD-10-CM (por ejemplo, para facturación) y viceversa.
- Deduplicación y armonización de catálogos de problemas: agrupación de variantes léxicas ("HTA", "hipertensión arterial", "HTN") en un mismo concepto mediante similitud en el espacio de los bi-encoders SapBERT afinados.
- Auditoría de mapeos existentes: ejecución del pipeline sobre pares código-texto ya codificados y revisión de los casos donde el ranking del motor discrepa del código asignado, como control de calidad retrospectivo.
- Extracción de fenotipos para investigación: normalización de cohortes a partir de notas clínicas para construir criterios de inclusión reproducibles expresados en códigos estándar.
- Pre-anotación para equipos de curación terminológica: generación de propuestas de sinónimos o de equivalencias entre ICD y SNOMED que afterwards se validan manualmente antes de incorporarse a un diccionario maestro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (recall@k, MRR), de reordenación (nDCG) ni de precisión de codificación exacta, y tampoco se documenta el conjunto de evaluación empleado ni el resultado obtenido en el HiLabs AI Quest 2026.

## Requisitos de hardware

- VRAM estimada: el adaptador QLoRA sobre Qwen3-4B-Instruct-2507 en 4 bits ocupa del orden de 2,5–3,5 GB de pesos, a lo que hay que sumar la caché KV (estimación a partir del tamaño del checkpoint; no verificada en la información disponible). Los codificadores SapBERT son ligeros y pueden ejecutarse en fp16 con menos de 1 GB cada uno; los rankers LightGBM y los clasificadores `ctx_*` corren en CPU.
- GPU recomendadas: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes para todo el pipeline en una sola tarjeta; una RTX 4090 o L4 queda sobrada y permite aumentar el tamaño de lote del reranker. A100/H100 no son necesarias para la inferencia, aunque podrían emplearse para reentrenar los codificadores.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más si se sirve el LLM en 4 bits; con menos VRAM puede ejecutarse en CPU el retrieval y los rankers, dejando el reranker LLM como etapa opcional.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` para el adaptador QLoRA, FAISS u otro índice vectorial para la recuperación con bi-encoders, y carga directa de LightGBM desde los `.txt` de bolsas. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama, y al no haber pesos GGUF no es desplegable directamente en Ollama.
- Latencia y throughput: no disponibles. El coste dominante esperado es el reranking listwise con el LLM de 4B sobre los candidatos recuperados, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Dhisanth/hilabs-term-mapping` | Pipeline de entity linking clínico (retrieval + reranking + LGBM) | Varios componentes; LLM reranker de 4B | No disponible | Apache-2.0 | HuggingFace, 1,5 GB, 0 descargas |
| `cambridgeltl/SapBERT-from-PubMedBERT-fulltext` | Bi-encoder de similitud entre entidades biomédicas | No disponible en la información | No disponible | Apache-2.0 | HuggingFace; es la base de este repositorio |
| `unsloth/Qwen3-4B-Instruct-2507-bnb-4bit` | LLM decoder-only cuantizado en 4 bits | 4B | No disponible en la información | Apache-2.0 | HuggingFace; es la base del adaptador |
| Otros sistemas de codificación clínica (MedCAT, scispaCy + vocabularios) | Herramientas de anotación y linking | No aplica | No aplica | Apache-2.0 / MIT según proyecto | Repositorios públicos; comparación de rendimiento no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este pipeline con alternativas. La comparación anterior se limita a tipo de componente, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: sin números de precisión, recall o exactitud de codificación no es posible evaluar si el pipeline supera a una búsqueda léxica sencilla contra los vocabularios.
- Repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo día (18 de octubre de 2026): no hay evidencia de uso, revisión por terceros ni mantenimiento.
- El paquete contiene solo artefactos de inferencia: sin datos de entrenamiento, diccionarios ICD-10-CM/SNOMED CT, texto de historiales ni claves de API. Reproducir el pipeline exige obtener por cuenta propia los vocabularios (SNOMED CT requiere licencia de uso, que no es Apache-2.0) y el código del repositorio de GitHub, cuyo enlace no aparece en la model card.
- Dependencia de un repositorio externo para el código: el motor descarga este repo en `models/` al ejecutar `python run.py predict`, de modo que la reproducibilidad depende de que ese repositorio y sus instrucciones sigan disponibles.
- Especialización geográfica y de vocabulario: ICD-10-CM es la variante estadounidense; no se documenta soporte para ICD-10-ES, CIE-11 ni SNOMED CT en otras ediciones o idiomas.
- Riesgo de error en la asignación de códigos: un mapeo incorrecto puede tener consecuencias en facturación, reclamaciones o análisis epidemiológico. El sistema debe operar siempre con revisión humana y trazabilidad de la decisión.
- Sesgos potenciales heredados de los datos de preentrenamiento de SapBERT (literatura biomédica PubMed) y de Qwen3-4B, no evaluados por el autor; tampoco se documenta el rendimiento en subpoblaciones, tipos de nota (alta, urgencias, primaria) o abreviaturas locales.
- Los clasificadores `ctx_*.pkl` se distribuyen como pickles: requieren confiar en el origen del fichero y conviene cargarlos en un entorno aislado, ya que la deserialización de pickle puede ejecutar código.
- El LLM reranker se distribuye como adaptador LoRA y no como modelo completo: hay que descargar la base `unsloth/Qwen3-4B-Instruct-2507-bnb-4bit` y respetar su licencia Apache-2.0.
- Licencia Apache-2.0 del repositorio: permite uso comercial de los artefactos, pero no cubre los vocabularios ni posibles datos clínicos que el usuario aporte, cuyas condiciones son responsabilidad de quien despliega el sistema.
- Fechas de creación y actualización en 2026: conviene verificar que el contenido no se ha modificado ni retirado antes de integrarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dhisanth/hilabs-term-mapping
- Modelo base del bi-encoder y cross-encoder: https://huggingface.co/cambridgeltl/SapBERT-from-PubMedBERT-fulltext
- Modelo base del adaptador QLoRA: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-bnb-4bit
- Repositorio de código con instrucciones y write-up: no disponible (la model card lo menciona pero no incluye la URL)
- Paper del motor en el HiLabs AI Quest 2026: no disponible
- Demo: no disponible
