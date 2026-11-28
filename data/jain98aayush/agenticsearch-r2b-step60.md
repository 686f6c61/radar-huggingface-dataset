# jain98aayush/AgenticSearch-R2B-step60

## Resumen

AgenticSearch-R2B-step60 es un adaptador LoRA de rango 32 entrenado sobre el modelo base Qwen3-4B-Instruct-2507 (en su variante cuantizada a 4 bits de Unsloth). Lo desarrolla Aayush Jain como parte del trabajo "Small Open-Weight Search Agents", cuyo objetivo es construir agentes de busqueda de pesos abiertos capaces de resolver preguntas multi-salto mediante recuperacion iterativa de pasajes. El adaptador no es un modelo autonomo: contiene unicamente los pesos del adaptador (66.060.288 parametros en F32, 264 MB) y requiere descargar por separado el modelo base.

El modelo resuelve el problema de la recuperacion agentica de pasajes: dado un corpus BM25 de Wikipedia, el agente formula consultas, invoca herramientas de busqueda, lee pasajes y compone una respuesta final. El entrenamiento emplea GRPO (Group Relative Policy Optimization) con una recompensa de equipo basada en Recall@10 menos una penalizacion por llamadas malformadas, sobre preguntas multi-salto de HotpotQA, 2WikiMultihopQA y MuSiQue.

Su relevancia radica en que demuestra que un modelo de solo 4.000 millones de parametros, con un adaptador de 66 millones, puede alcanzar un Recall@10 de 0,6125 en la particion de seleccion de 100 preguntas, con una media de 3,00 agentes por consulta y unos 61.711 tokens de prompt mas completacion (incluyendo contexto repetido). La publicacion corresponde al checkpoint 60 de la condicion "fork" del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA de rango 32 sobre proyecciones q/k/v/o y gate/up/down |
| Parametros totales | 66.060.288 parametros del adaptador (F32); el modelo base Qwen3-4B-Instruct-2507 se descarga aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no especificada en la model card) |
| Tipos de cuantizacion | base cuantizada a 4 bits (bnb-4bit) en el checkpoint de entrenamiento; el adaptador se distribuye en F32 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (adaptador); licencia del modelo base y tokenizer aplicable por separado |
| Formato de pesos | safetensors (PEFT/LoRA); tamano del repo 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros. El adaptador LoRA tiene rango 32, alpha 64, dropout cero, y modula las proyecciones de atencion (q, k, v, o) y las proyecciones del MLP (gate, up, down). El config del adaptador referencia el base cuantizado `unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit`, mientras que los configs de entrenamiento congelados y los metadatos de bootstrap nombran `Qwen/Qwen3-4B-Instruct-2507` en la revision `cdbee75f17c01a7cc42f958dc650907174af0554`. Segun la model card, la revision exacta de los pesos cuantizados de entrenamiento y la version historica de vLLM no se establecieron, por lo que no se reclama un linaje de pesos base plenamente verificado ni una replica de inferencia nueva.

El entrenamiento usa GRPO (Group Relative Policy Optimization) con una recompensa de equipo definida como Recall@10 menos la penalizacion por llamadas malformadas registradas. Los datos de entrenamiento son preguntas multi-salto abiertas de HotpotQA, 2WikiMultihopQA y MuSiQue, mapeadas a pasajes de Wikipedia. No se uso datos de BrowseComp-Plus para el entrenamiento de Track B. El sistema evaluado requiere el corpus BM25 del paper, las herramientas, los prompts, los limites de turnos, la configuracion de arquitectura y la fusion RRF; la generacion de texto simple no reproduce la condicion de recuperacion.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Recuperacion agentica de pasajes: formulacion de consultas, invocacion de herramientas de busqueda y lectura de pasajes en un bucle multi-turno.
- Razonamiento multi-salto sobre preguntas que requieren combinar informacion de varias fuentes.
- Integracion con un arnes de recuperacion externo (corpus BM25, herramientas y fusion RRF) para producir respuestas finales.
- Entrenado con GRPO para optimizar una metrica de recuperacion (Recall@10) bajo penalizacion de llamadas malformadas.
- Capacidades multilingues limitadas al ingles (`en`).
- No dispone de vision, audio ni modo thinking explicito documentado en la model card.

## Casos de uso

- Agentes de busqueda sobre corpus documentales: el adaptador puede integrarse en un pipeline BM25 + RRF para resolver preguntas que requieren varias consultas encadenadas, usando la media de 3,00 agentes por consulta observada en la evaluacion.
- Investigacion academica en agentes de recuperacion: sirve como punto de comparacion reproducible (checkpoint 60 de la condicion fork) frente a controles de agente independiente del paper.
- Preguntas multi-salto sobre Wikipedia: entrenado especificamente con HotpotQA, 2WikiMultihopQA y MuSiQue, es adecuado para tareas de QA que exigen combinar pasajes de varios articulos.
- Prototipado de sistemas RAG agenticos: al ser un adaptador de 264 MB sobre un base de 4B, permite experimentar con recuperacion iterativa en hardware modesto antes de escalar a modelos mayores.
- Evaluacion de recompensas basadas en recuperacion: util para estudiar como GRPO con recompensa Recall@10 afecta al comportamiento de busqueda y a la tasa de llamadas malformadas.
- Base para fine-tuning posterior: al ser un adaptador PEFT de rango 32, puede reutilizarse como inicializacion para nuevas condiciones experimentales sobre el mismo base Qwen3-4B.

## Benchmarks y rendimiento

Resultados registrados en la model card (100 preguntas, misma particion usada en seleccion; no son resultados held-out, multi-semilla ni de aplicacion empresarial; los tokens incluyen contexto repetido):

| Condicion | Preguntas | Recall@10 | nDCG@10 | Agentes medios | Tokens medios prompt+completacion |
|---|---:|---:|---:|---:|---:|
| R2b@60 fork | 100 | 0,6125 | 0,5377 | 3,00 | 61.711 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada: el adaptador en F32 ocupa unos 264 MB; el modelo base Qwen3-4B-Instruct-2507 en 4 bits requiere aproximadamente 2,5-3 GB de VRAM, y en FP16 en torno a 8 GB. Cifras estimadas a partir del tamano del base; no verificadas en la model card.
- GPU recomendadas: cualquier GPU con al menos 8 GB para el base en 4 bits; para FP16 se recomienda 16 GB o mas (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, con el base cuantizado a 4 bits en tarjetas de 8 GB o superiores (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: PEFT con Transformers (`AutoPeftModelForCausalLM`), vLLM (la model card menciona una version historica de vLLM no establecida) y el arnes de recuperacion propio del paper. La carga del base cuantizado requiere bitsandbytes/CUDA compatibles y el entorno de paquetes registrado.
- Latencia y throughput: no disponibles. El patron de carga CUDA/PEFT mostrado en la model card no fue ejecutado en GPU para esta publicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgenticSearch-R2B-step60 | 66M adaptador sobre base 4B | no disponible | Recall@10 0,6125; nDCG@10 0,5377 (100 preguntas, particion de seleccion) | Apache-2.0 (adaptador) | Hugging Face (PEFT) |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en esta ficha | no disponible | licencia upstream de Qwen | Hugging Face |
| Controles de agente independiente del paper | no disponible | no disponible | incluidos en el paper con intervalos de confianza pareados | no disponible | paper y exportaciones numericas |

No se dispone de comparativas con otros adaptadores de busqueda agentica de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de evaluacion son retrospectivos, sobre las mismas 100 preguntas usadas en la seleccion, de una sola trayectoria de entrenamiento; no son held-out, multi-semilla ni de aplicacion empresarial.
- El sistema evaluado depende del corpus BM25, herramientas, prompts, limites de turnos, configuracion de arquitectura y fusion RRF del paper; la generacion de texto simple no reproduce la condicion de recuperacion.
- El linaje de pesos base no esta plenamente verificado: el config del adaptador nombra el base cuantizado de Unsloth sin revision exacta, mientras que los configs de entrenamiento nombran `Qwen/Qwen3-4B-Instruct-2507` en una revision concreta.
- La revision exacta de los pesos cuantizados de entrenamiento y la version historica de vLLM no se establecieron.
- El ejemplo de carga CUDA/PEFT no fue ejecutado en GPU para esta publicacion.
- Soporte unicamente en ingles.
- Riesgo de alucinacion y sesgos: no documentados en la model card; al tratarse de un adaptador sobre Qwen3-4B, hereda los sesgos y riesgos del base.
- Restricciones de licencia: el adaptador es Apache-2.0, pero la licencia del modelo base y del tokenizer se aplica de forma independiente y debe revisarse para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- La model card incluye una declaracion de asistencia por IA en el manuscrito; el empaquetado de la publicacion no genero nuevas mediciones de evaluacion.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/jain98aayush/AgenticSearch-R2B-step60
- Dataset: https://huggingface.co/datasets/jain98aayush/AgenticSearch-OpenMultiHop
- Espacio del proyecto "Small Open-Weight Search Agents": https://huggingface.co/spaces/jain98aayush/AgenticSearch-Research
- Snapshot del codigo fuente: https://huggingface.co/spaces/jain98aayush/AgenticSearch-Research/resolve/main/downloads/AgenticSearch-code-v0.1.0.zip
- Modelo base: https://huggingface.co/unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit
- Modelo base de referencia (Qwen): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
