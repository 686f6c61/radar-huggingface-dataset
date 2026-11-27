# ai-forever/SMITH-Exp

## Resumen

SMITH-Exp es un checkpoint de instrucciones con arquitectura de mezcla de expertos (MoE) desarrollado por ai-forever, el equipo de investigacion de inteligencia artificial de Sber. Se construye como un ajuste fino del modelo GigaChat 3.1 Lightning (10B parametros totales, 1.8B activos, BF16) y esta especializado en recuperacion multi-salto (*multi-hop retrieval*) mediante el bucle de llamadas a herramientas de GigaChat 3: el modelo invoca iterativamente `search_index` y finalmente emite una respuesta con los identificadores de corpus de soporte (`supporting_corpus_ids`).

El modelo resuelve un problema concreto: la recuperacion de informacion que requiere encadenar varias busquedas para responder preguntas complejas, en lugar de una unica consulta al indice vectorial. Para ello se apoya en un protocolo de ejecucion reproducible (el arnes SMITH) y en un plugin de decodificacion guiada que restringe las llamadas a herramientas a la estructura esperada, reduciendo llamadas malformadas.

Su relevancia actual radica en que demuestra que un modelo de 10B parametros con solo 1.8B activos puede superar en tareas de recuperacion multi-salto a modelos significativamente mayores como GLM-5.3, DeepSeek-V4-Flash o Qwen3.6-35B-A3B, segun la evaluacion publicada por el autor. Esta disponible en Hugging Face con licencia MIT y soporte para transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en GigaChat 3.1 Lightning (`deepseek_v3` en transformers) |
| Parametros totales | 10.672.535.616 (10,67B) |
| Parametros activos | 1,8B |
| Longitud de contexto | no disponible (la model card incluye la etiqueta `long-context` pero no especifica el numero de tokens) |
| Tipos de cuantizacion | BF16 (pesos publicados en bf16); no se documentan otras cuantizaciones |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SMITH-Exp emplea una arquitectura de mezcla de expertos con 10,67B parametros totales y 1,8B activos por token, heredada del checkpoint base GigaChat 3.1 Lightning (identificado como `deepseek_v3` en la libreria transformers). Los pesos se publican en BF16 y el repositorio ocupa 21,4 GB. El modelo esta ajustado para instrucciones y optimizado especificamente para el bucle de recuperacion: llamadas repetidas a la herramienta `search_index` seguidas de una accion final `answer` que incluye los identificadores del corpus de soporte.

El autor no detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es el plugin `gigachat3_guided_decoding.py`, que se integra con el parser de herramientas de GigaChat 3 en vLLM y restringe las llamadas a herramientas a la estructura esperada, lo que reduce llamadas malformadas y permite al arnes analizar de forma fiable las acciones `search_index` y `answer`. El modelo debe usarse con la plantilla de chat incluida y con el arnes SMITH (o una implementacion equivalente del mismo bucle) para reproducir los resultados publicados.

## Capacidades

- Generacion de texto conversacional con ajuste a instrucciones.
- Recuperacion multi-salto: invoca iterativamente `search_index` y compone una respuesta final con `supporting_corpus_ids`.
- Soporte de tool calling / function calling mediante el parser `gigachat3` de vLLM y el plugin de decodificacion guiada.
- Razonamiento multi-paso orientado a agentes de recuperacion (hasta seis busquedas por pregunta en la configuracion de evaluacion).
- Capacidades multilingues limitadas a ruso e ingles.
- Etiquetado como `long-context` por el autor, aunque sin cifra de ventana publicada.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (`thinking mode`).

## Casos de uso

- **Asistentes de busqueda documental multi-salto**: el modelo encadena varias consultas a un indice vectorial hasta reunir las evidencias necesarias para responder, lo que resulta adecuado para preguntas que no se resuelven con una unica busqueda semantica.
- **Sistemas de pregunta-respuesta sobre corpus corporativos**: integrado con un indice FAISS y un embedder (por ejemplo Qwen3-Embedding-4B), puede responder consultas y devolver los identificadores de los pasajes que sustentan la respuesta, facilitando la trazabilidad.
- **Auditoria y verificacion de fuentes**: la salida `supporting_corpus_ids` permite comprobar que documentos respaldan cada afirmacion, util en entornos regulatorios o de compliance donde se exige citar la evidencia.
- **Investigacion academica en recuperacion de informacion**: sirve como agente de referencia para experimentar con topologias multi-salto (4hop1, 4hop2, 4hop3) sobre conjuntos como MuSiQue.
- **Despliegue en infraestructura de una sola GPU**: al caber en una GPU de 80 GB en BF16, es viable para prototipos y servicios internos sin necesidad de clústeres multi-GPU.
- **Pipelines RAG con control estricto de herramientas**: el plugin de decodificacion guiada reduce llamadas malformadas, lo que simplifica la integracion en produccion con vLLM y el parser `gigachat3`.
- **Evaluacion comparativa de agentes de recuperacion**: permite contrastar el rendimiento de un modelo pequeno y eficiente frente a alternativas de mayor tamano en tareas de recuperacion multi-salto.

## Benchmarks y rendimiento

Evaluacion sobre MuSiQue (validacion con respuestas), 100 consultas con tres topologias de cuatro saltos (50 `4hop1`, 25 `4hop2`, 25 `4hop3`). Ranking contra parrafos de soporte gold a k=10 sobre un indice FAISS deduplicado por texto (train+validacion). Temperatura 0, `retriever_k=100`, `agent_max_k=10`, maximo seis busquedas. La metrica *Citation* evalua los `supporting_corpus_ids` de la respuesta final; *Search* evalua la union de documentos recuperados en la trayectoria; *Searches* es el numero medio de llamadas a `search_index`.

| Modelo | nDCG@10 (citation) | nDCG@10 (search) | Recall@10 (citation) | Recall@10 (search) | Busquedas |
|---|---|---|---|---|---|
| **SMITH-Exp** | **0,664** | **0,766** | **0,629** | **0,680** | 5,73 |
| GLM-5.3 | 0,611 | 0,709 | 0,515 | 0,610 | 4,64 |
| DeepSeek-V4-Flash-0731 | 0,591 | 0,726 | 0,523 | 0,638 | 5,84 |
| Qwen3.6-35B-A3B | 0,546 | 0,712 | 0,445 | 0,620 | 5,57 |
| Qwen3-Embedding-4B (solo embedder) | 0,333 | 0,333 | 0,300 | 0,300 | — |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo en BF16 ocupa aproximadamente 21,4 GB de pesos; con cache KV y overhead de ejecucion, el autor indica que cabe en una unica GPU de 80 GB.
- **GPU recomendadas**: A100 80 GB o H100 80 GB para el despliegue en BF16 con `--tensor-parallel-size 1`. No se documentan configuraciones con GPUs de menor memoria.
- **Consumer GPU**: no se confirma compatibilidad con GPUs de consumo; no se publican cuantizaciones GGUF ni versiones de menor precision.
- **Opciones de despliegue**: transformers (`AutoModelForCausalLM` con `torch_dtype=torch.bfloat16` y `device_map="auto"`) y vLLM (`vllm serve` con `--trust-remote-code`, `--enable-auto-tool-choice`, `--tool-call-parser gigachat3`, `--tool-parser-plugin ./gigachat3_guided_decoding.py` y `--chat-template ./chat_template.jinja`). El autor menciona compatibilidad con endpoints (`endpoints_compatible`) y text-generation-inference en las etiquetas del repositorio.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.
- **Dependencias**: el autor recomienda crear un entorno con Python 3.11 y `uv`, instalando `requirements.txt` con backend `cu130`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | nDCG@10 (citation) MuSiQue |
|---|---|---|---|---|---|
| SMITH-Exp | 10,67B | 1,8B | no disponible | MIT | 0,664 |
| GLM-5.3 | no disponible | no disponible | no disponible | no disponible | 0,611 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | 0,591 |
| Qwen3.6-35B-A3B | 35B | 3B (segun nombre) | no disponible | no disponible | 0,546 |

SMITH-Exp obtiene el mejor nDCG@10 y Recall@10 en las metricas de citation y search de esta comparativa, con un coste de 5,73 busquedas por pregunta. Los datos de parametros, contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- **Protocolo de ejecucion especifico**: los resultados publicados asumen el arnes SMITH y la plantilla de chat incluidas; el autor advierte que el comportamiento y la calidad no estan garantizados en frameworks de chat genericos ni con otros prompts, herramientas, parsers o logica de parada.
- **Dependencia del plugin de decodificacion guiada**: sin `gigachat3_guided_decoding.py` y el parser `gigachat3`, aumentan las llamadas a herramientas malformadas y el arnes puede fallar al interpretar las acciones.
- **Idiomas limitados**: solo ruso e ingles; no se documenta soporte para castellano ni otros idiomas.
- **Contexto sin cifra publicada**: la etiqueta `long-context` no viene acompanada de la longitud exacta de ventana, lo que dificulta planificar el dimensionamiento.
- **Riesgo de alucinacion**: como modelo generativo, puede producir respuestas no sustentadas; la salida de `supporting_corpus_ids` debe validarse contra el corpus real.
- **Sesgos**: no se documentan sesgos conocidos en la informacion disponible.
- **Licencia MIT**: permite uso comercial, pero conviene revisar las condiciones del modelo base GigaChat 3.1 y de las dependencias listadas en `requirements.txt`.
- **Madurez**: el checkpoint se etiqueta como experimental (`SMITH-Exp`) y el autor remite a SMITH-v1 como ultima version; el numero de descargas (92) y likes (3) sugiere una adopcion aun limitada.
- **Hardware**: no se ofrecen cuantizaciones ligeras, lo que restringe el despliegue a GPUs de alta memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-forever/SMITH-Exp
- Version SMITH-v1: https://huggingface.co/ai-forever/SMITH-v1
- Modelo base GigaChat 3.1 Lightning: https://huggingface.co/ai-sage/GigaChat3.1-10B-A1.8B-bf16
- Arnes SMITH (GitHub): https://github.com/ai-forever/SMITH
- Dataset MuSiQue: https://github.com/StonyBrookNLP/musique
- Dataset MuSiQue en Hugging Face: https://huggingface.co/datasets/bdsaglam/musique
- Embedder Qwen3-Embedding-4B: https://huggingface.co/Qwen/Qwen3-Embedding-4B
