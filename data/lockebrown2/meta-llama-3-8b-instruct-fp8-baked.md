# lockebrown2/Meta-Llama-3-8B-Instruct-FP8-Baked

## Resumen

Meta-Llama-3-8B-Instruct-FP8-Baked es una reedición ("baked") del modelo cuantizado a FP8 de Meta-Llama-3-8B-Instruct, publicada por el usuario lockebrown2 en Hugging Face. La cuantización original la realizó Neural Magic a partir de meta-llama/Meta-Llama-3-8B-Instruct, y este repositorio redistribuye esos pesos en formato safetensors listos para servir con vLLM. El modelo conserva la arquitectura transformer decoder-only de la familia Llama 3, con 8.030.261.248 parámetros totales y un tamaño de repositorio de 9,1 GB.

El objetivo de la cuantización es reducir el coste de inferencia: al pasar de 16 a 8 bits por parámetro, el espacio en disco y los requisitos de memoria de GPU se reducen aproximadamente un 50 %, con una pérdida de precisión mínima (media de 68,22 en OpenLLM v1 frente a 68,71 del modelo sin cuantizar, es decir, una recuperación del 99,3 %). Se cuantizan pesos y activaciones de los operadores lineales de los bloques transformer, manteniendo el `lm_head` sin cuantizar.

Es relevante ahora porque permite ejecutar un asistente conversacional de 8B en inglés con un solo acelerador moderno, manteniendo cifras de MMLU (66,27), GSM-8K (73,99) y HellaSwag (78,56) muy próximas a las del modelo original. La contrapartida es que el repositorio no documenta los cambios asociados al sufijo "Baked" respecto al FP8 original de Neural Magic, apenas tiene tracción (0 descargas, 0 likes en el momento de la consulta) y su licencia es la Llama 3 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Meta-Llama-3), entrada y salida de texto |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (dato del modelo base segun las fuentes consultadas; no se especifica en la model card del repositorio) |
| Tipos de cuantizacion | FP8 en pesos y activaciones (W8A8), cuantizacion simetrica per-tensor, esquema de activacion estatico; `lm_head` excluido de la cuantizacion |
| Idiomas soportados | ingles (en) |
| Licencia | Llama 3 Community License (llama3) |
| Formato de pesos | safetensors (repo de 9,1 GB), ejecutable con vLLM >= 0.5.0 |
| Fecha de creacion del repositorio | 2026-09-29 |
| Herramienta de cuantizacion | AutoFP8 (Neural Magic) con 512 secuencias de UltraChat (mgoin/ultrachat_2k, split train_sft) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Desarrollador de la cuantizacion original | Neural Magic |
| Desarrollador del modelo base | Meta |

## Arquitectura y entrenamiento

La model card describe la arquitectura como Meta-Llama-3, un transformer decoder-only con entrada y salida de texto. No se detalla en la informacion disponible el numero de capas, la dimension del modelo, el tipo de atencion (por ejemplo, si usa grouped-query attention) ni la composicion del dataset de preentrenamiento del modelo base, que fue desarrollado por Meta. Tampoco se documenta si hubo fases de RLHF o DPO: la model card solo indica que se trata de una version cuantizada de una variante ya ajustada por instrucciones.

La innovacion tecnica concreta de este artefacto es la cuantizacion. Se aplica FP8 a los pesos y a las activaciones de los operadores lineales dentro de los bloques transformer, con cuantizacion simetrica per-tensor: una unica escala lineal mapea las representaciones FP8 de pesos y activaciones. El proceso se ejecuto con AutoFP8 usando 512 secuencias de calibracion de UltraChat y con el patron `re:.*lm_head` en la lista de exclusiones. No se describe ninguna modificaion adicional de destilado, decodificacion especulativa ni atencion lineal.

El sufijo "Baked" del repositorio no viene explicado en la model card disponible. El contenido citado corresponde integramente a la model card de `neuralmagic/Meta-Llama-3-8B-Instruct-FP8`, por lo que no es posible verificar que diferencias introduce esta republicacion respecto al artefacto original de Neural Magic. Cualquier uso en produccion deberia validar los pesos mediante comparacion de hashes o evaluacion propia.

## Capacidades

- Generacion de texto y conversacion de tipo asistente en ingles, con soporte de plantilla de chat (roles `system`, `user`, `assistant`) mediante `apply_chat_template`.
- Razonamiento y conocimiento general: 66,27 en MMLU (5-shot) y 52,35 en TruthfulQA (0-shot) segun la evaluacion publicada.
- Aritmetica y razonamiento matematico basico en formato de respuesta corta: 73,99 en GSM-8K (5-shot, strict-match).
- Comprension lectora y sentido comun: 61,77 en ARC Challenge (25-shot), 78,56 en HellaSwag (10-shot) y 76,40 en Winogrande (5-shot).
- Servicio con API compatible con OpenAI a traves del backend de vLLM, lo que habilita su integracion en aplicaciones que ya consumen la API de OpenAI.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno dentro de la ventana de contexto del modelo base.
- No se documentan en la informacion disponible capacidades de tool calling o function calling, uso de agentes, razonamiento multi-paso explicito, modo "thinking", vision, audio ni multimodalidad.
- El soporte multilingue se limita al ingles: la propia model card situa el uso en otros idiomas fuera del alcance previsto.

## Casos de uso

- Asistente conversacional en ingles: el modelo puede gestionar diálogos multi-turno con historial completo dentro de su ventana de contexto, aplicando la plantilla de chat de Llama 3, y desplegarse como endpoint compatible con OpenAI sobre vLLM.
- Atencion al cliente automatizada: al reducir el requisito de memoria aproximadamente un 50 % frente al modelo de 16 bits, es viable mantener varias réplicas del servicio en un solo nodo de GPU y escalar horizontalmente el throughput.
- Generacion de codigo y ayuda en el editor: hereda la capacidad del modelo base para completar y explicar fragmentos de codigo, con la ventaja de que el coste por token servido es menor al operar en FP8. No se documenta soporte de tool calling, por lo que la integracion con herramientas externas debe implementarse en la capa de aplicacion.
- RAG sobre documentacion tecnica: el modelo consume fragmentos de contexto generados por un recuperador y responde en inglés; conviene segmentar los documentos para no superar la ventana de contexto y controlar la degradacion de la calidad en fragmentos muy largos.
- Resumen y reescritura de documentacion: tareas de resumen extractivo o abstractivo y normalizacion de texto tecnico en ingles, con temperatura baja para priorizar fidelidad.
- Clasificacion y enrutado de tickets o correos: uso con prompts de salida restringida (etiquetas cerradas) para enrutar consultas a otros sistemas, aprovechando el bajo coste por inferencia del formato FP8.
- Generacion de tests y documentacion de codigo a partir de firmas de funciones o diffs, como paso adicional en un pipeline de integracion continua.
- Evaluacion comparativa de cuantizacion: al ser un artefacto FP8 con su equivalente en 16 bits disponible publicamente, sirve como banco de pruebas para medir la degradacion introducida por la cuantizacion en tareas propias antes de adoptarla en produccion.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre las tareas de OpenLLM Leaderboard v1, evaluados con lm-evaluation-harness (commit 383bbd54) y el motor vLLM:

| Benchmark | Meta-Llama-3-8B-Instruct | Meta-Llama-3-8B-Instruct-FP8 | Recuperacion |
|---|---|---|---|
| MMLU (5-shot) | 66,60 | 66,27 | 99,50 % |
| ARC Challenge (25-shot) | 62,54 | 61,77 | 98,76 % |
| GSM-8K (5-shot, strict-match) | 75,96 | 73,99 | 97,40 % |
| HellaSwag (10-shot) | 78,83 | 78,56 | 99,65 % |
| Winogrande (5-shot) | 75,93 | 76,40 | 100,6 % |
| TruthfulQA (0-shot) | 52,44 | 52,35 | 99,82 % |
| Media OpenLLM v1 | 68,71 | 68,22 | 99,29 % |

La tabla de la model card original aparece truncada en la informacion disponible, de modo que los resultados de las tareas restantes de OpenLLM v1 no pueden reproducirse aqui. No se han publicado mediciones de latencia, throughput, consumo de memoria ni evaluaciones especificas de este repositorio "Baked" en particular; los valores de la tabla corresponden al artefacto FP8 de Neural Magic del que este repositorio deriva.

## Requisitos de hardware

- Peso de los parametros en FP8: aproximadamente 8 GB para los 8.030.261.248 parametros, coherente con los 9,1 GB del repositorio completo (estimacion propia a partir del dato de tamano del repo).
- VRAM total estimada: en torno a 10-12 GB con contexto corto y lotes pequenos; a partir de 16-24 GB se dispone de margen comodo para cache KV con contexto de 8.192 tokens y concurrencia moderada. Estas cifras son estimaciones, no mediciones publicadas.
- GPU recomendadas: aceleradores con soporte nativo de FP8, es decir, familias Hopper (H100) y Ada Lovelace. La documentacion de vLLM distribuye kernels FP8 para compute capability 8.9 o superior; conviene verificar en la documentacion de vLLM el soporte concreto del acelerador antes de desplegar.
- Cabe en GPU de consumo con soporte FP8 en cuanto a memoria, pero el rendimiento de los kernels FP8 depende del hardware; en GPUs sin soporte nativo la ejecucion puede degradarse o no estar disponible.
- Opciones de despliegue: vLLM >= 0.5.0 con `LLM(model="...")` o servidor compatible con OpenAI. La model card no menciona soporte de llama.cpp, Ollama, TGI ni formatos GGUF, y el repositorio no incluye pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- El ajuste fino posterior sobre estos pesos FP8 no se documenta en la model card; para entrenamiento conviene partir del modelo en 16 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Datos de rendimiento disponibles |
|---|---|---|---|---|---|
| lockebrown2/Meta-Llama-3-8B-Instruct-FP8-Baked (este modelo) | 8,03 B | 8.192 tokens (modelo base) | FP8 (pesos y activaciones) | Llama 3 Community License | Media OpenLLM v1 68,22; MMLU 66,27; GSM-8K 73,99 |
| neuralmagic/Meta-Llama-3-8B-Instruct-FP8 | 8,03 B (mismo modelo base) | 8.192 tokens | FP8 (pesos y activaciones) | Llama 3 Community License | Media OpenLLM v1 68,22; misma tabla de evaluacion |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | sin cuantizar (16 bits) | Llama 3 Community License | Media OpenLLM v1 68,71; MMLU 66,60; GSM-8K 75,96 |
| FriendliAI/Meta-Llama-3-8B-Instruct-fp8 | 8,03 B (modelo base equivalente) | no disponible en la informacion consultada | FP8 | Llama 3 Community License | no disponible en la informacion consultada |

La comparacion con el artefacto de Neural Magic se basa en que la model card citada es identica, incluidos los resultados de evaluacion; no hay evidencia en la informacion disponible de que los pesos de este repositorio difieran de los de aquel. No se dispone de datos de contexto, licencia ni benchmarks del modelo de FriendliAI mas alla de su identificador, por lo que sus celdas quedan como no disponibles.

## Limitaciones y advertencias

- Idioma: el modelo esta previsto unicamente para ingles. La propia model card declara fuera de alcance el uso en otros idiomas, por lo que no debe emplearse en castellano ni en entornos multilingues sin una evaluacion previa.
- Riesgo de alucinacion: el modelo base no esta exento de generar contenido falso o no verificado; la puntuacion de 52,35 en TruthfulQA (0-shot) es moderada y en tareas de generacion abierta el riesgo persiste.
- Sesgos conocidos: no se documentan en la informacion disponible analisis de sesgo, composicion del dataset de preentrenamiento ni medidas de mitigacion aplicadas por Meta o por Neural Magic.
- Degradacion por cuantizacion: la perdida de precision es pequena en agregado (99,29 % de recuperacion en la media de OpenLLM v1), pero la caida mas acusada se produce en GSM-8K (97,40 % de recuperacion, de 75,96 a 73,99), por lo que las tareas aritmeticas son las mas sensibles.
- Ventana de contexto limitada: 8.192 tokens en el modelo base, insuficiente para documentos extensos sin segmentacion previa.
- Restricciones de licencia: se aplica la Llama 3 Community License, con las obligaciones habituales de atribucion, inclusion de la licencia y condiciones especificas para despliegues a gran escala. El uso debe revisarse antes de cualquier explotacion comercial.
- Provenance no verificada: el repositorio lo publica un tercero (lockebrown2) y no se documenta que cambios introduce el sufijo "Baked" respecto al FP8 original de Neural Magic. Existe riesgo de que los pesos difieran sin trazabilidad.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de funcionamiento correcto. Se recomienda validar los pesos con evaluaciones propias antes de usarlos en produccion.
- Requisitos de hardware: la ejecucion en FP8 depende de kernels especificos de vLLM y de GPUs compatibles; en hardware antiguo el modelo puede no cargar o rendir peor que una version en 16 bits.
- Fecha de creacion inusual: el repositorio figura creado el 2026-09-29, fecha posterior a la publicacion del artefacto original de Neural Magic (6/8/2024). Conviene contrastar la fecha con la plataforma si se necesita para auditoria.
- Fuera de alcance: cualquier uso que infrinja la legislacion aplicable, incluidas las normas de control de exportaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lockebrown2/Meta-Llama-3-8B-Instruct-FP8-Baked
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Cuantizacion original de Neural Magic: https://huggingface.co/neuralmagic/Meta-Llama-3-8B-Instruct-FP8
- Variante FP8 de FriendliAI: https://huggingface.co/FriendliAI/Meta-Llama-3-8B-Instruct-fp8
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- AutoFP8 (herramienta de cuantizacion): https://github.com/neuralmagic/AutoFP8
- Dataset de calibracion mgoin/ultrachat_2k: https://huggingface.co/datasets/mgoin/ultrachat_2k
- llm-compressor (sucesor recomendado por Neural Magic): https://github.com/vllm-project/llm-compressor
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
