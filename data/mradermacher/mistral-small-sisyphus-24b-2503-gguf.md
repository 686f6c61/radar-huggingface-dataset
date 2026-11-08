# mradermacher/Mistral-Small-Sisyphus-24b-2503-GGUF

## Resumen

Mistral-Small-Sisyphus-24b-2503-GGUF es la versión cuantizada en formato GGUF del modelo allura-org/Mistral-Small-Sisyphus-24b-2503, un ajuste fino (fine-tune) de Mistral Small 24B realizado por el equipo de allura-org. Esta ficha cubre concretamente la publicación de mradermacher, que distribuye cuantizaciones estáticas (Q2_K a Q8_0) del modelo base para su uso con llama.cpp y otros runners compatibles con GGUF.

El modelo parte de Mistral Small 24B, un transformer denso de aproximadamente 23.570 millones de parámetros (23,57B), y ha sido reentrenado con un conjunto heterogéneo de datasets de instrucciones y razonamiento que incluyen Tulu-3, s1K, datos médicos de razonamiento, código (OpenCoder), datos de instrucción sin rechazo (kalo-opus-instruct) y ScienceQA. El resultado es un modelo conversacional orientado a instrucciones y razonamiento, con soporte declarado para inglés y chino.

La relevancia de esta ficha radica en que ofrece el modelo en cuantizaciones que van desde 9,0 GB (Q2_K) hasta 25,2 GB (Q8_0), lo que permite desplegarlo en hardware de consumo y en entornos de servidor con llama.cpp. La licencia es Apache 2.0, lo que facilita su uso comercial. No obstante, la información pública disponible sobre benchmarks y detalles de entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Small 24B) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); disponibles también cuantizaciones imatrix en el repo i1-GGUF |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 23,57B parámetros derivado de Mistral Small 24B. La model card del repositorio cuantizado no detalla la arquitectura interna más allá de indicar que se trata de un modelo de transformers compatible con axolotl, lo que sugiere que el ajuste fino se realizó con dicho framework. No se especifica si emplea atención con ventana deslizante, GQA u otras variantes propias de la familia Mistral.

El ajuste fino se realizó sobre un conjunto de datasets declarados en la model card: allenai/tulu-3-sft-personas-instruction-following, simplescaling/s1K-1.1, simplescaling/s1K-claude-3-7-sonnet, reedmayhew/medical-o1-reasoning-SFT-jsonl, OpenCoder-LLM/opc-sft-stage1, PocketDoc/Dans-Kinomaxx-VanillaBackrooms, cognitivecomputations/SystemChat-2.0, anthracite-org/kalo-opus-instruct-22k-no-refusal y allura-org/scienceqa_sharegpt. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional multi-turno, orientada a instrucciones.
- Razonamiento de tipo cadena de pensamiento, presumiblemente reforzado por los datasets s1K y s1K-claude-3-7-sonnet.
- Razonamiento médico, por la inclusión de medical-o1-reasoning-SFT.
- Generación de código, por el dataset OpenCoder opc-sft-stage1.
- Razonamiento científico y respuesta a preguntas de ciencia, por ScienceQA.
- Instrucción con personas y seguimiento de instrucciones (Tulu-3 personas).
- Modo de instrucción sin rechazo (kalo-opus-instruct-22k-no-refusal), lo que implica menor tendencia a declinar peticiones.
- Soporte multilingüe limitado a inglés y chino según la model card.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con llama.cpp u Ollama usando las cuantizaciones Q4_K_M (14,4 GB) o Q5_K_M (16,9 GB) para mantener conversaciones multi-turno en inglés o chino con una licencia permisiva.
- Razonamiento médico asistido: gracias al ajuste con medical-o1-reasoning-SFT, puede emplearse como apoyo en la generación de explicaciones clínicas o resúmenes de casos, siempre con supervisión humana y sin sustituir criterio médico.
- Generación y revisión de código: el dataset OpenCoder sugiere capacidad para tareas de programación; puede integrarse en editores o pipelines de revisión de código en local.
- Tutoría científica: el ajuste con ScienceQA permite usarlo para responder preguntas de ciencia y explicar conceptos a estudiantes.
- Investigación sobre alineación y rechazo: al incluir datos "no-refusal", es útil para estudiar el comportamiento del modelo ante peticiones sensibles y comparar con variantes alineadas.
- Prototipado en hardware de consumo: las cuantizaciones Q3_K_M (11,6 GB) y Q4_K_S (13,6 GB) permiten ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM, facilitando experimentos sin infraestructura de servidor.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes estáticas y una familia imatrix, lo que permite medir el impacto de la cuantización en calidad y velocidad para un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el overhead de contexto. Q2_K ~9,0 GB; Q3_K_M ~11,6 GB; Q4_K_M ~14,4 GB; Q5_K_M ~16,9 GB; Q6_K ~19,4 GB; Q8_0 ~25,2 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M con contexto moderado; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para Q8_0 y contextos largos; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) para Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: sí, en Q2_K a Q5_K_M según VRAM; Q6_K y Q8_0 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runners compatibles con GGUF. Para el modelo original en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-Sisyphus-24b-2503 (este) | 23,57B | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tune de Mistral Small 24B con datasets de razonamiento, código y medicina |
| Mistral Small 24B (base) | ~24B | no disponible | Apache 2.0 | safetensors | Modelo original de Mistral AI; referencia de partida |
| Mistral-Small-Sisyphus-24b-2503-i1-GGUF | 23,57B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma familia, cuantizaciones ponderadas de mayor calidad |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con datasets diversos (incluido contenido sin rechazo) puede reproducir sesgos presentes en dichos datos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad para este fine-tune.
- Limitaciones de contexto e idioma: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado. La longitud de contexto no está especificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento (algunos, como kalo-opus-instruct, pueden tener condiciones adicionales).
- Caveats para producción: la información sobre entrenamiento es escasa; no hay benchmarks publicados que respalden afirmaciones de rendimiento. El modelo es un fine-tune comunitario, no oficial de Mistral AI.
- El repositorio cuantizado tiene muy pocas descargas (175) y ningún "like", lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mistral-Small-Sisyphus-24b-2503-GGUF
- Repositorio imatrix: https://huggingface.co/mradermacher/Mistral-Small-Sisyphus-24b-2503-i1-GGUF
- Modelo base (allura-org): https://huggingface.co/allura-org/Mistral-Small-Sisyphus-24b-2503
- Página de descargas del autor: https://hf.tst.eu/model#Mistral-Small-Sisyphus-24b-2503-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
