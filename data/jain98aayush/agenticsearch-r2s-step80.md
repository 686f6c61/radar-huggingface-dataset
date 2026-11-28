# jain98aayush/AgenticSearch-R2S-step80

## Resumen

AgenticSearch-R2S-step80 es un adaptador LoRA de rango 32 entrenado sobre el modelo base Qwen3-4B-Instruct-2507 (en su variante cuantizada de Unsloth a 4 bits) para tareas de búsqueda agéntica y recuperación de pasajes en dominios de múltiples saltos (multi-hop). Lo desarrolla Aayush Jain y se publica como parte del trabajo "Small Open-Weight Search Agents", cuyo objetivo es construir agentes de búsqueda de pequeno tamano que puedan operar con pesos abiertos y entrenamiento mediante GRPO (Group Relative Policy Optimization).

El modelo no es un modelo autonomo: es un adaptador PEFT que debe combinarse con el modelo base Qwen3-4B para funcionar. Su proposito es actuar como planificador de consultas y recuperador dentro de un pipeline de busqueda que combina BM25 sobre un corpus de Wikipedia, herramientas externas y fusion RRF (Reciprocal Rank Fusion). El checkpoint publicado corresponde al paso 80 de una unica trayectoria de entrenamiento bajo la condicion denominada "R2s@80 single".

La relevancia actual reside en que explora el entrenamiento con refuerzo de agentes de busqueda de bajo coste computacional (4B parametros, adaptador de 66M) sobre preguntas multi-hop de HotpotQA, 2WikiMultihopQA y MuSiQue, un area dominada por modelos propietarios de mayor tamano. Su licencia Apache-2.0 y su formato PEFT facilitan la reproducibilidad, aunque los resultados reportados son de desarrollo retrospectivo y no de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptador LoRA (rank 32, alpha 64, dropout 0) sobre proyecciones q/k/v/o y gate/up/down |
| Parametros totales | 66.060.288 parametros del adaptador (F32); el modelo base Qwen3-4B se descarga por separado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no se especifica en la model card) |
| Tipos de cuantizacion | El adaptador se distribuye en F32; el modelo base referenciado esta cuantizado a 4 bits (bnb-4bit) por Unsloth |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (adaptador); licencia del modelo base y tokenizer aplicables por separado |
| Formato de pesos | safetensors (PEFT/LoRA); repositorio de 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parametros. El LoRA tiene rango 32, alpha 64 y dropout cero, y se inserta en las proyecciones de atencion (q, k, v, o) y en las proyecciones del MLP (gate, up, down). El adaptador contiene 66.060.288 parametros en F32 y ocupa 264.308.896 bytes. La configuracion del adaptador referencia el modelo base cuantizado de Unsloth, mientras que las configuraciones de entrenamiento congeladas y los metadatos de bootstrap nombran `Qwen/Qwen3-4B-Instruct-2507` en la revision `cdbee75f17c01a7cc42f958dc650907174af0554`; la revision exacta de los pesos cuantizados de entrenamiento no se ha establecido.

El entrenamiento utiliza GRPO con una recompensa de equipo definida como Recall@10 menos una penalizacion registrada por llamadas malformadas. Los datos de entrenamiento son preguntas multi-hop abiertas de HotpotQA, 2WikiMultihopQA y MuSiQue, mapeadas a pasajes de Wikipedia. No se utilizaron datos de BrowseComp-Plus para el entrenamiento de Track B. El checkpoint publicado corresponde al paso 80 de una unica trayectoria de entrenamiento. La evaluacion registrada es retrospectiva sobre las mismas 100 preguntas usadas en la seleccion, con 1,00 agentes de media y 13.766 tokens medios de prompt mas completion (incluyendo contexto repetido).

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen3-4B-Instruct-2507.
- Busqueda agentica de pasajes: el adaptador esta entrenado para formular consultas y operar dentro de un harness de recuperacion con BM25, herramientas y fusion RRF.
- Razonamiento multi-hop: entrenado sobre preguntas que requieren encadenar evidencia de multiples pasajes de Wikipedia.
- Recuperacion de pasajes orientada a Recall@10 y nDCG@10 como metricas objetivo del entrenamiento.
- Soporte de tool calling / function calling: no disponible de forma explicita en la model card; depende de las capacidades del modelo base y del harness.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no soportadas.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Recuperacion documental multi-hop en corpus de Wikipedia: el adaptador formula consultas sucesivas y combina resultados BM25 con fusion RRF para responder preguntas que requieren evidencia de varios articulos, aprovechando su entrenamiento especifico sobre HotpotQA, 2WikiMultihopQA y MuSiQue.
- Investigacion academica sobre agentes de busqueda de bajo coste: sirve como punto de partida reproducible (Apache-2.0, PEFT) para estudiar el efecto de GRPO y del bucle agente sobre tareas de recuperacion.
- Construccion de pipelines RAG con planificacion de consultas: integrado en un harness que exponga herramientas de busqueda, el adaptador puede generar consultas intermedias y decidir cuando detener la busqueda.
- Evaluacion comparativa de estrategias de recuperacion: su configuracion concreta (BM25, RRF, limites de turnos) permite reproducir la condicion evaluada y comparar con otras variantes del mismo trabajo.
- Prototipado de asistentes de documentacion tecnica en ingles: sobre un corpus propio indexado con BM25, el modelo puede encadenar consultas para localizar pasajes dispersos.
- Generacion de conjuntos de datos de entrenamiento para recuperacion: las trayectorias del agente pueden registrarse y reutilizarse como datos de refuerzo o para destilacion en modelos mayores.
- Base para fine-tuning adicional: al ser un adaptador LoRA sobre Qwen3-4B, puede combinarse con otros adaptadores o continuar el entrenamiento con nuevos corpus y recompensas.

## Benchmarks y rendimiento

| Condicion | Preguntas | Recall@10 | nDCG@10 | Agentes medios | Tokens medios (prompt+completion) |
|---|---:|---:|---:|---:|---:|
| R2s@80 single | 100 | 0,5642 | 0,4834 | 1,00 | 13.766 |

Estos resultados son de desarrollo retrospectivo sobre las mismas 100 preguntas usadas en la seleccion, de una unica trayectoria de entrenamiento. No son resultados en held-out fresco, multi-seed ni de aplicacion empresarial. Los tokens incluyen contexto repetido. El paper y sus exportaciones numericas contienen intervalos de confianza emparejados y controles de agentes independientes. No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador ocupa aproximadamente 0,26 GB en F32; el modelo base Qwen3-4B en 4 bits requiere del orden de 2,5-3 GB adicionales, aunque esta cifra no se confirma en la model card.
- GPU recomendadas: no especificadas. El ejemplo de carga usa `device_map="auto"` con CUDA y PEFT, lo que sugiere compatibilidad con GPUs consumer de gama media-alta, pero no se documentan modelos concretos.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base (4B) y su cuantizacion a 4 bits, pero no se confirma en la informacion disponible.
- Opciones de despliegue: PEFT con Transformers (`AutoPeftModelForCausalLM`), requiere bitsandbytes y CUDA compatibles para la carga del base cuantizado. El harness de recuperacion original usa vLLM (version historica no establecida). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo de carga no se ha ejecutado contra una GPU para esta publicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgenticSearch-R2S-step80 | 66M (adaptador) sobre Qwen3-4B | no disponible | Agente de busqueda multi-hop con GRPO | Apache-2.0 (adaptador) | Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en esta ficha | LLM generalista con instrucciones | Licencia upstream de Qwen | Hugging Face |
| Otros adaptadores del mismo trabajo | no disponible | no disponible | Variantes de condicion del estudio | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros agentes de busqueda en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas como Search-R1 u otros agentes de recuperacion.

## Limitaciones y advertencias

- Los resultados reportados son retrospectivos y sobre el mismo conjunto de 100 preguntas usado para seleccionar el checkpoint; no constituyen validacion held-out ni multi-seed.
- El adaptador no funciona de forma autonoma: requiere el modelo base Qwen3-4B y el harness de recuperacion completo (corpus BM25, herramientas, prompts, limites de turnos, configuracion de arquitectura y fusion RRF) para reproducir la condicion evaluada. La generacion de texto simple no reproduce el comportamiento de recuperacion.
- La linea de linaje del modelo base no esta totalmente verificada: la configuracion del adaptador nombra el base cuantizado de Unsloth sin revision exacta, mientras que las configuraciones de entrenamiento nombran la revision original de Qwen. La revision exacta de los pesos cuantizados de entrenamiento y la version historica de vLLM no se han establecido.
- El ejemplo de carga CUDA/PEFT no se ha ejecutado contra una GPU para esta publicacion.
- Idioma limitado al ingles; no se documentan capacidades multilingues.
- Riesgo de alucinacion inherente al modelo base Qwen3-4B, no mitigado de forma especifica por el adaptador.
- Sesgos conocidos: no documentados en la model card.
- La licencia Apache-2.0 cubre solo los pesos originales del adaptador; las licencias del modelo base y del tokenizer se aplican de forma independiente y deben revisarse para uso comercial.
- El manuscrito asociado incluye una declaracion de asistencia por IA; el empaquetado de la publicacion no genero nuevas mediciones de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jain98aayush/AgenticSearch-R2S-step80
- Espacio del proyecto "Small Open-Weight Search Agents": https://huggingface.co/spaces/jain98aayush/AgenticSearch-Research
- Dataset de entrenamiento: https://huggingface.co/datasets/jain98aayush/AgenticSearch-OpenMultiHop
- Snapshot del codigo del harness: https://huggingface.co/spaces/jain98aayush/AgenticSearch-Research/resolve/main/downloads/AgenticSearch-code-v0.1.0.zip
- Modelo base: https://huggingface.co/unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit
- Modelo base original (referencia de revision): https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
