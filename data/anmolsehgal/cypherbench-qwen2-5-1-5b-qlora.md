# anmolsehgal/cypherbench-qwen2.5-1.5b-qlora

## Resumen

CypherBench Qwen2.5-1.5B QLoRA es un adaptador LoRA (no un modelo completo) publicado por el usuario anmolsehgal que ajusta Qwen/Qwen2.5-1.5B-Instruct para la tarea de generacion de consultas Cypher a partir de lenguaje natural. El repositorio contiene unicamente los pesos del adaptador en formato safetensors junto con los ficheros de tokenizer y configuracion de entrenamiento, y esta pensado como experimento de fine-tuning parametro-eficiente sobre el benchmark CypherBench de Megagon Labs.

La relevancia del artefacto es doble: por un lado demuestra que un modelo pequeno (1.5B parametros) puede alcanzar un Exact Match del 52 % en un subconjunto piloto de 100 ejemplos del split de test de CypherBench, partiendo de un 0 % del modelo base; por otro, sirve como plantilla reproducible de QLoRA sobre tareas de generacion de codigo estructurado para grafos de conocimiento. No obstante, las metricas publicadas son de similitud textual y de presencia de clausulas, no de ejecucion real contra Neo4j, por lo que la calidad funcional de las consultas generadas no esta validada por el autor.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de 1.5B parametros con contexto de 32 768 tokens y licencia Apache 2.0. El adaptador hereda esas capacidades y las especializa en sintaxis Cypher, si bien el autor no declara una licencia propia para el adaptador y el repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre atencion y proyecciones; entrenamiento QLoRA 4-bit NF4 |
| Parametros totales | 1.5B (modelo base Qwen2.5-1.5B-Instruct); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador; el modelo base Qwen2.5-1.5B-Instruct soporta 32 768 tokens |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion y compute dtype FP16; el adaptador se distribuye en safetensors (precision del adaptador no especificada) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA: el modelo base Qwen2.5-1.5B-Instruct se carga cuantizado en 4 bits con el esquema NF4, doble cuantizacion activada y compute dtype FP16, y sobre el se insertan matrices de bajo rango entrenables segun la configuracion PEFT recogida en `lora_config.json`. El repositorio incluye `training_config.json` y `training_logs.json` con los argumentos reales del Trainer y el historial de entrenamiento, aunque el autor no detalla en la model card el numero de pasos, el rango LoRA, el alpha ni la tasa de aprendizaje.

Los datos de entrenamiento proceden del benchmark CypherBench (megagonlabs/cypherbench), orientado a la traduccion de preguntas en lenguaje natural a consultas Cypher sobre esquemas de grafos. La evaluacion se realiza sobre un subconjunto piloto de 100 ejemplos del split de test oficial, distribuido en siete grafos (company, fictional_character, flight_accident, geography, movie, nba y politics). No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el ajuste es puramente supervisado sobre pares pregunta-consulta.

## Capacidades

- Generacion de consultas Cypher a partir de preguntas en lenguaje natural sobre esquemas de grafos de conocimiento.
- Generacion de codigo estructurado en el dominio especifico de bases de datos de grafos (Neo4j y compatibles).
- Razonamiento de un solo turno orientado a la traduccion NL-a-query; el adaptador no documenta modos de razonamiento multi-paso ni thinking mode.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct: generacion de texto general, comprension lectora basica y matematicas simples, no evaluadas en este adaptador.
- Soporte multilingue limitado al ingles, segun el campo `language: en` de la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en este adaptador.

## Casos de uso

- Generacion asistida de consultas Cypher en herramientas de BI sobre Neo4j: el adaptador traduce preguntas de analistas a consultas `MATCH ... RETURN` sobre esquemas conocidos, con una tasa de Exact Match del 52 % en el piloto, lo que lo hace util como borrador que el analista revisa antes de ejecutar.
- Prototipado rapido de interfaces de lenguaje natural sobre grafos de conocimiento: al ser un adaptador de 0.1 GB sobre un modelo de 1.5B, se puede desplegar en una GPU consumer para demos internas de consulta conversacional sobre un grafo.
- Fine-tuning como plantilla reproducible: los ficheros `training_config.json`, `lora_config.json` y `training_logs.json` permiten replicar el pipeline QLoRA en otros dominios de generacion de codigo estructurado (SQL, SPARQL, Gremlin).
- Evaluacion comparativa de tecnicas PEFT: sirve como linea base para medir el impacto de QLoRA frente a full fine-tuning o a otros rangos LoRA en tareas NL-a-query, usando las metricas de similitud textual publicadas.
- Educacion y formacion en grafos: el modelo puede generar ejemplos de consultas Cypher para material docente, con la advertencia de que las consultas deben validarse contra el esquema real antes de su uso.
- Integracion en pipelines de generacion de codigo para ETL sobre grafos: el adaptador puede producir plantillas de consultas que luego se validan sintacticamente y se ejecutan en un entorno controlado, dado el 99 % de Syntax Sanity reportado.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un subconjunto piloto de 100 ejemplos del split de test de CypherBench:

| Modelo | Muestras | Exact Match (%) | Normalized EM (%) | BLEU | ROUGE-L | chrF | Syntax Sanity (%) | Tokens predichos medios | Clause F1 |
|---|---|---|---|---|---|---|---|---|---|
| base | 100 | 0 | 0 | 20.74 | 0.39 | 46.03 | 99 | 15.73 | nan |
| tuned | 100 | 52 | 52 | 92.33 | 0.957 | 94.00 | 99 | 15.04 | 0.9917 |

Resultados por grafo del modelo ajustado:

| Grafo | Muestras | EM (%) | Normalized EM (%) | Syntax Sanity (%) | Clause F1 |
|---|---|---|---|---|---|
| company | 14 | 28.57 | 28.57 | 100 | 100 |
| fictional_character | 15 | 73.33 | 73.33 | 100 | 99.05 |
| flight_accident | 12 | 66.67 | 66.67 | 100 | 100 |
| geography | 14 | 50.00 | 50.00 | 100 | 100 |
| movie | 17 | 52.94 | 52.94 | 100 | 99.35 |
| nba | 10 | 80.00 | 80.00 | 100 | 98.57 |
| politics | 18 | 27.78 | 27.78 | 94.44 | 97.62 |

El autor advierte que Exact Match y Normalized Exact Match miden coincidencia a nivel de texto, que BLEU, ROUGE-L y chrF miden similitud textual, que Syntax Sanity es una comprobacion heuristica y no un parser Cypher completo, y que Clause F1 compara presencia de clausulas amplias. Las metricas oficiales del benchmark (Execution Accuracy, Executable Rate y PSJS) no se han calculado porque requieren el entorno de ejecucion de CypherBench.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4-bit NF4 ocupa aproximadamente 1-1.5 GB de pesos; con overhead de activaciones y contexto, cabe en GPUs con 4-6 GB de VRAM. En FP16 el modelo base requiere unos 3 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; para entrenamiento QLoRA se recomienda al menos 8-12 GB de VRAM.
- Cabe en GPU consumer: si, en la mayoria de GPUs consumer de los ultimos cinco anos.
- Opciones de despliegue: transformers + PEFT + bitsandbytes (metodo documentado por el autor); tambien es posible fusionar el adaptador con el modelo base y exportar a GGUF para llama.cpp u Ollama, o servirlo con vLLM o TGI tras la fusion, aunque estas rutas no estan documentadas en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cypherbench-qwen2.5-1.5b-qlora (este) | 1.5B + adaptador LoRA | no disponible (base: 32 768) | QLoRA especializado en Cypher | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1.5B | 32 768 | Instruccion general | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32 768 | Generacion de codigo general | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos NL-a-Cypher de mayor tamano (p. ej. variantes de 7B-13B) | 7B-13B | variable | Fine-tuning sobre benchmarks de grafos | variable | variable |

La comparacion directa con alternativas especializadas en Cypher no esta disponible en la informacion proporcionada. Frente al modelo base, el adaptador mejora el Exact Match del 0 % al 52 % en el piloto, a costa de especializarse y perder generalidad fuera del dominio de grafos.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador LoRA, no el modelo completo; es necesario descargar Qwen/Qwen2.5-1.5B-Instruct y cargarlo con PEFT para su uso.
- Las metricas publicadas son de similitud textual y presencia de clausulas, no de ejecucion real; no se ha calculado Execution Accuracy, Executable Rate ni PSJS, por lo que no se garantiza que las consultas generadas se ejecuten correctamente contra un grafo Neo4j.
- El conjunto de evaluacion es un piloto de 100 ejemplos, insuficiente para extraer conclusiones robustas sobre el rendimiento en produccion.
- El rendimiento es muy desigual entre grafos: Exact Match del 80 % en nba frente al 27.78 % en politics y el 28.57 % en company.
- Idiomas soportados limitados al ingles; no se ha evaluado el comportamiento en castellano ni en otros idiomas.
- Licencia no declarada: no se especifica si el adaptador puede usarse comercialmente, lo que supone un riesgo legal para despliegues en produccion.
- Riesgo de alucinacion en nombres de propiedades, etiquetas y relaciones no presentes en el esquema, especialmente en grafos con esquemas complejos como politics.
- Syntax Sanity es una comprobacion heuristica y no un parser Cypher completo; un 99 % de sanidad sintactica no implica consultas validas.
- El modelo tiene 1.5B parametros y capacidad limitada para razonamiento multi-paso o consultas Cypher complejas con multiples saltos.
- Repositorio sin descargas ni validacion comunitaria; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anmolsehgal/cypherbench-qwen2.5-1.5b-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset CypherBench: https://huggingface.co/datasets/megagonlabs/cypherbench
- Repositorio del autor con configuracion de entrenamiento: https://huggingface.co/anmolsehgal/cypherbench-qwen2.5-1.5b-qlora/tree/main (ficheros `training_config.json`, `lora_config.json`, `training_logs.json`)
