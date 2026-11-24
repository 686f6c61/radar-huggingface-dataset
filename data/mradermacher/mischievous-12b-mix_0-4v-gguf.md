# mradermacher/MISCHIEVOUS-12B-Mix_0.4v-GGUF

## Resumen

MISCHIEVOUS-12B-Mix_0.4v-GGUF es la version cuantizada en formato GGUF del modelo MISCHIEVOUS-12B-Mix_0.4v, un merge de modelos de 12.247.802.880 parametros (aproximadamente 12,2 mil millones) creado mediante la herramienta mergekit. El modelo original fue publicado por el usuario bamec66557 y la cuantizacion corre a cargo de mradermacher, un conocido generador de quants de la comunidad de Hugging Face. Se trata, por tanto, de un modelo derivado de la agregacion de pesos de otros modelos, no de un entrenamiento desde cero.

El modelo esta pensado para generacion de texto conversacional y esta etiquetado con la advertencia "not-for-all-audiences", lo que sugiere que su dataset de mezcla puede incluir contenido para adultos o material sensible. Soporta los idiomas ingles y coreano segun los metadatos del repositorio. La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, aunque al tratarse de un merge conviene verificar las licencias de los modelos constituyentes.

La relevancia de esta ficha radica en que ofrece una via practica de desplegar un modelo de 12B en hardware de consumo gracias a las cuantizaciones GGUF (desde Q2_K de 4,9 GB hasta Q8_0 de 13,1 GB). No obstante, la informacion publica sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, ya que la model card del cuantizador remite al modelo base sin detallar su composicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tipo transformer derivado de mergekit; detalles de capas y atencion no publicados) |
| Parametros totales | 12.247.802.880 (aproximadamente 12,2B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); existen quants ponderados/imatrix en el repo -i1-GGUF |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por los metadatos (tag mergekit, merge) se deduce que MISCHIEVOUS-12B-Mix_0.4v es un modelo fusionado mediante mergekit, una herramienta que combina los pesos de varios modelos preentrenados aplicando estrategias de mezcla (como SLERP, TIES, DARE o passthrough). Esto implica que no ha habido un entrenamiento adicional desde cero ni, presumiblemente, un proceso de RLHF o DPO especifico documentado para este merge.

El numero de parametros (12,2B) sugiere una arquitectura de tipo transformer denso de escala media, pero no se han publicado datos sobre el numero de capas, dimensiones ocultas, mecanismo de atencion, numero de tokens de entrenamiento ni composicion del dataset. La model card del cuantizador no incluye esta informacion y remite al repositorio del modelo base (bamec66557/MISCHIEVOUS-12B-Mix_0.4v), del que no se aportan detalles tecnicos en la informacion disponible. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Soporte de los idiomas ingles y coreano (en, ko).
- Compatibilidad con text-generation-inference (TGI) y con el ecosistema transformers, segun los tags del repositorio.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio) al distribuirse en formato GGUF.
- Contenido potencialmente para adultos o sensible: el tag "not-for-all-audiences" indica que el modelo puede generar material no apto para todas las audiencias.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Prototipado de chatbots conversacionales en local: con la cuantizacion Q4_K_M (7,6 GB) el modelo puede ejecutarse en una GPU de consumo de 8-12 GB de VRAM para experimentar con dialogos multi-turno sin depender de APIs externas.
- Generacion creativa de ficcion y roleplay: el tag "not-for-all-audiences" y su naturaleza de merge orientado a conversacion lo hacen adecuado para narrativa creativa sin filtros estrictos, siempre que el despliegue cumpla con la legalidad aplicable.
- Asistencia de escritura en ingles y coreano: redaccion, reescritura y resumen de textos en ambos idiomas, aprovechando el soporte bilingue declarado.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (4,9 GB) y Q3_K_S (5,6 GB) permiten inferencia en CPU o en GPUs modestas, util para demos y pruebas de concepto.
- Investigacion sobre tecnicas de merge: al ser un modelo fusionado, sirve como caso de estudio para evaluar como afectan las mezclas de pesos a la calidad conversacional frente a los modelos originales.
- Fine-tuning ligero posterior: al estar bajo licencia Apache 2.0 y en formato transformers en su version base, puede servir de punto de partida para ajustes con LoRA/QLoRA en tareas especificas de dominio (siempre verificando las licencias de los modelos constituyentes del merge).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye una referencia a un dataset de detalles del Open LLM Leaderboard (open-llm-leaderboard/bamec66557__MISCHIEVOUS-12B-Mix_0.4v-details), pero no se aportan cifras concretas de MMLU, HumanEval, GSM8K ni otras metricas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~4,9 GB; Q3_K_S ~5,6 GB; Q3_K_M ~6,2 GB; Q3_K_L ~6,7 GB; IQ4_XS ~6,9 GB; Q4_K_S ~7,2 GB; Q4_K_M ~7,6 GB; Q5_K_S ~8,6 GB; Q5_K_M ~8,8 GB; Q6_K ~10,2 GB; Q8_0 ~13,1 GB. A estas cifras hay que sumar el overhead de contexto KV cache, que crece con la longitud de contexto utilizada.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 en adelante son suficientes. Para Q8_0 se recomienda una RTX 4090 (24 GB) o una A100/H100 si se busca throughput alto o contextos largos.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. Q4_K_M entra en GPUs de 8-12 GB; las versiones Q6_K y Q8_0 requieren 12-16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base (transformers) puede servirse con vLLM o TGI, aunque la version GGUF esta orientada a llama.cpp y derivados.
- Latencia y throughput: no disponibles. Dependeran del hardware, la cuantizacion y la longitud de contexto; a modo orientativo, un modelo denso de 12B en Q4_K_M sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no se aportan mediciones oficiales para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MISCHIEVOUS-12B-Mix_0.4v-GGUF | 12,2B | no disponible | Apache 2.0 | GGUF | Merge comunitario, bilingue en/ko, sin benchmarks publicados |
| Mistral-Nemo-12B (referencia de escala) | 12B | 128K (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Modelo base entrenado desde cero, con benchmarks publicados |
| Gemma-2-9B (referencia de escala) | 9B | 8K (segun su model card publica) | Gemma license | safetensors, GGUF | Modelo oficial de Google, con evaluaciones publicadas |

La comparacion se ofrece solo a efectos de escala y categoria, ya que no se dispone de datos de rendimiento de MISCHIEVOUS-12B-Mix_0.4v que permitan una comparacion cuantitativa directa. Las cifras de contexto de los modelos de referencia provienen de sus model cards publicas y no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en tareas estandar, lo que dificulta evaluar si supera o no a sus modelos constituyentes.
- Origen incierto del merge: al no documentarse que modelos se combinaron ni con que metodo, no se puede garantizar el cumplimiento de las licencias de los modelos originales, aunque la licencia declarada sea Apache 2.0.
- Contenido sensible: el tag "not-for-all-audiences" advierte de que el modelo puede generar contenido para adultos o inapropiado; no es adecuado para aplicaciones orientadas a publico general sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de lenguaje generativo, especialmente los derivados de merges sin evaluacion publicada, puede producir informacion falsa con aparente seguridad.
- Cobertura idiomatica limitada: solo se declaran ingles y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar empiricamente el limite soportado.
- Sin soporte documentado de tool calling ni agentes: no hay evidencia de que pueda integrarse de forma fiable en pipelines que requieran function calling.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene muy poca traccion (28 descargas, 1 like en el momento de la consulta), lo que reduce la probabilidad de encontrar soporte comunitario o correcciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MISCHIEVOUS-12B-Mix_0.4v-GGUF
- Modelo base: https://huggingface.co/bamec66557/MISCHIEVOUS-12B-Mix_0.4v
- Quants ponderados/imatrix: https://huggingface.co/mradermacher/MISCHIEVOUS-12B-Mix_0.4v-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MISCHIEVOUS-12B-Mix_0.4v-GGUF
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset de detalles del leaderboard: https://huggingface.co/datasets/open-llm-leaderboard/bamec66557__MISCHIEVOUS-12B-Mix_0.4v-details
