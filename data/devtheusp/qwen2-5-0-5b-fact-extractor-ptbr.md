# DevTheusP/qwen2.5-0.5b-fact-extractor-ptbr

## Resumen

Qwen2.5-0.5B fact extractor (PT-BR) es un ajuste fino especializado del Qwen2.5-0.5B-Instruct de Alibaba, desarrollado por DevTheusP y publicado en Hugging Face bajo licencia Apache 2.0. Su propósito es muy concreto: extraer "hechos duraderos" (configuraciones, decisiones, convenciones y reglas) de los mensajes que recibe un agente de código, devolviéndolos como JSON estructurado para alimentar la memoria a largo plazo del agente. El modelo se entrenó mediante destilación por rótulo (SFT) a partir de Qwen2.5-7B-Instruct como profesor, usando LoRA con r=16 y alpha=32 sobre todas las proyecciones lineales.

El problema que resuelve es la gestión de memoria en agentes conversacionales: en lugar de acumular mensajes completos, el modelo identifica qué información seguirá siendo válida en las próximas semanas y la normaliza con claves estables del formato `area.atributo`, lo que permite sobrescribir hechos antiguos en lugar de duplicarlos. Está diseñado para la política `v2_keyed` del benchmark agent-memory-bench del mismo autor.

Con 494 millones de parámetros (0,5B) y un entrenamiento específico en portugués brasileño, el modelo destaca por su latencia extremadamente baja (p50 de 0,06 segundos en modo guiado) y por eliminar por completo los fallos de JSON que sufría el modelo base. Es relevante como ejemplo práctico de destilación de bajo coste: se entrenó en una única NVIDIA T4 de Kaggle y supera a su propio modelo profesor (7B) en el benchmark de memoria con la política v2_keyed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), finetune con LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 (0,5B, datos reales de safetensors) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | fp16 (safetensors merged), q4_K_M (GGUF) |
| Idiomas soportados | Portugues (pt, entrenado con datos en PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo merged fp16), adaptador LoRA (PEFT), GGUF q4_K_M |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder convencional de la familia Qwen2.5. Sobre él se aplicó LoRA (r=16, alpha=32) en todas las proyecciones lineales, y posteriormente el adaptador se fusionó (merge) en los pesos base, de modo que el repositorio raíz contiene un modelo standalone en fp16 listo para `transformers` o vLLM. El repositorio incluye también el adaptador LoRA suelto y una versión GGUF q4_K_M.

El entrenamiento fue una destilación por rótulo (SFT sobre las respuestas del profesor): el Qwen2.5-7B-Instruct-AWQ, servido con vLLM y salida guiada por el JSON Schema a temperatura 0, etiquetó 3.000 mensajes sintéticos en portugués brasileño generados por plantillas con seed fija. El entrenamiento se hizo con TRL 1.17, PEFT 0.21 y transformers 5.22, durante 2 épocas con learning rate 2e-4 con schedule coseno, batch efectivo 16, fp16 y pérdida calculada solo sobre la respuesta. Ningún mensaje del benchmark de evaluación entró en el conjunto de entrenamiento. El hardware de entrenamiento fue una única NVIDIA T4 en Kaggle.

Una innovación destacable del diseño es la reutilización de claves: cuando una clave de memoria existente describe el mismo atributo, el modelo la reutiliza en lugar de crear una nueva, lo que permite a la memoria del agente sobrescribir hechos obsoletos en vez de acumular duplicados.

## Capacidades

- Extraccion de informacion estructurada: recibe un mensaje destinado a un asistente de codigo y devuelve un JSON con los hechos duraderos que contiene (configuracion, decisiones, convenciones, reglas).
- Generacion de claves estables: cada hecho lleva una `subject_key` en formato `area.atributo`, reutilizando claves existentes cuando describen el mismo atributo.
- Clasificacion de hechos: asigna un campo `kind` (por ejemplo, semantico) a cada hecho extraido.
- Salida JSON valida: en modo guiado (JSON Schema via `format` en Ollama o `response_format` en vLLM) alcanza 100% de validez de esquema; en modo libre, 99,7% en datos sinteticos.
- Memoria de agente: diseñado para sustituir hechos antiguos en la memoria del agente en lugar de duplicarlos.
- No es un modelo de proposito general: esta especializado exclusivamente en esta tarea de extraccion con un prompt de sistema fijo.

## Casos de uso

- Memoria a largo plazo de agentes de codigo: el caso de uso principal. El modelo procesa cada mensaje del usuario, extrae los hechos persistentes y actualiza la memoria del agente con claves `area.atributo`, permitiendo que el agente recuerde decisiones (por ejemplo, el cambio de MySQL a PostgreSQL en el modulo de facturacion) durante semanas.
- Compresion de historial conversacional: en lugar de almacenar conversaciones completas, se almacenan solo los hechos extraidos, reduciendo drasticamente el consumo de contexto y el coste de la ventana de contexto del agente.
- Pipelines de extraccion de datos de bajo coste: con 0,5B de parametros y una latencia p50 de 0,06 segundos en modo guiado, puede ejecutarse en hardware minimo para procesar grandes volumenes de mensajes sin depender de un LLM de 7B o mas.
- Despliegue local con Ollama: la carpeta `gguf/` incluye el GGUF q4_K_M y un `Modelfile` listos para `ollama create`, ideal para ejecutar el extractor en una maquina local o en el borde.
- Sistemas multiagente con memoria compartida: las claves estables `area.atributo` permiten que varios agentes compartan y actualicen una base de hechos comun sin conflictos de duplicacion.
- Investigacion en memoria de agentes: el modelo esta ligado al benchmark agent-memory-bench, por lo que sirve como linea base reproducible para experimentar con politicas de memoria (v1_naive, v2_keyed, v3_decay_rank, v4_decay_tier, v5_guarded).
- Prototipado de destilacion de modelos: el repositorio incluye el notebook de entrenamiento, los datos sinteticos y el `train_log.json`, util como plantilla para destilar capacidades de modelos grandes a modelos pequeños con LoRA y TRL.

## Benchmarks y rendimiento

Resultados de la tarea de extraccion, medidos en el notebook de Kaggle (referencia: rótulos del profesor, salvo indicacion):

| modelo | conjunto | modo | schema_valid | strict_f1 | value_f1 | reuse_accuracy | kind_accuracy | empty_accuracy | false_empty_rate | latency_p50_s | tokens_per_s |
|---|---|---|---|---|---|---|---|---|---|---|---|
| alumno-base | test_bench (ref=profesor) | guided | 100,0% | 1,7% | 7,5% | 100,0% | 11,1% | 0,0% | 0,0% | 0,72 | 159,16 |
| alumno-destilado | test_bench (ref=profesor) | guided | 100,0% | 28,6% | 76,2% | 75,0% | 75,0% | 98,3% | 27,3% | 0,06 | 118,62 |
| profesor (7B) | test_bench (ref=profesor) | guided | 100,0% | 90,9% | 100,0% | 100,0% | 100,0% | 100,0% | 0,0% | 0,26 | 35,69 |
| alumno-base | test_synth (ref=profesor) | free | 0,0% | - | - | 0,0% | - | 0,0% | 0,0% | 0,30 | 157,37 |
| alumno-destilado | test_synth (ref=profesor) | free | 99,7% | 25,9% | 61,9% | 53,1% | 61,5% | 80,0% | 13,3% | 0,28 | 150,97 |
| profesor (7B) | test_synth (ref=profesor) | free | 0,0% | - | - | 0,0% | - | 0,0% | 0,0% | 1,30 | 37,52 |

Resultados en agent-memory-bench, capa 1 (recuperacion):

| extractor | memoria | retrieval | ret_update | ret_scope | ret_rare_fact | ret_injection | fallos de JSON |
|---|---|---|---|---|---|---|---|
| alumno-base | v1_naive | 62,0% | 100,0% | 100,0% | 33,7% | 0,0% | 58 |
| alumno-base | v2_keyed | 83,3% | 100,0% | 100,0% | 33,1% | 100,0% | 58 |
| alumno-base | v3_decay_rank | 53,4% | 99,4% | 12,8% | 1,5% | 100,0% | 58 |
| alumno-base | v4_decay_tier | 53,1% | 100,0% | 8,6% | 3,8% | 100,0% | 58 |
| alumno-base | v5_guarded | 97,6% | 99,0% | 100,0% | 91,4% | 100,0% | 58 |
| alumno-destilado | v1_naive | 62,0% | 100,0% | 100,0% | 33,7% | 0,0% | 0 |
| alumno-destilado | v2_keyed | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 0 |
| alumno-destilado | v3_decay_rank | 71,7% | 96,4% | 54,4% | 36,6% | 100,0% | 0 |
| alumno-destilado | v4_decay_tier | 69,4% | 100,0% | 37,5% | 40,0% | 100,0% | 0 |
| alumno-destilado | v5_guarded | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 0 |
| profesor (7B) | v2_keyed | 83,4% | 100,0% | 100,0% | 33,7% | 100,0% | 0 |
| profesor (7B) | v5_guarded | 97,9% | 100,0% | 100,0% | 91,4% | 100,0% | 0 |
| publicado (Ollama, qwen2.5:7b) | v2_keyed | 98% | - | - | - | - | - |
| publicado (Ollama, qwen2.5:7b) | v1_naive | 62% | - | - | - | - | - |

El dato mas llamativo: con la politica v2_keyed, el alumno destilado de 0,5B alcanza 100% de retrieval, superando al profesor de 7B (83,4%), gracias a la especializacion y a la elimination de los 58 fallos de JSON del modelo base. No se han publicado benchmarks genericos (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 494M de parametros, el modelo merged en fp16 ocupa aproximadamente 1 GB de VRAM; el GGUF q4_K_M ocupa en torno a 0,4 GB. Es ejecutable incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento se realizo en una NVIDIA T4 (16 GB, Kaggle). Para inferencia, una RTX 3060 o superior sobra con diferencia; tambien funciona sin GPU.
- Consumer GPUs: cabe sobradamente en cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); no requiere GPUs de centro de datos.
- Opciones de despliegue: transformers (repositorio raiz, merged), vLLM (repositorio raiz), Ollama (GGUF q4_K_M con Modelfile incluido), llama.cpp (GGUF). Para salida JSON siempre valida, usar el campo `format` en Ollama o `response_format` en vLLM.
- Latencia y throughput: latencia p50 de 0,06 s y 118,62 tokens/s en modo guiado sobre test_bench; 0,28 s y 150,97 tokens/s en modo libre sobre test_synth. El profesor de 7B, como referencia, ronda 0,26-1,30 s y 35-37 tokens/s.

## Comparativa con modelos similares

| Caracteristica | qwen2.5-0.5b-fact-extractor-ptbr | Qwen2.5-0.5B-Instruct (base) | Qwen2.5-7B-Instruct (profesor) |
|---|---|---|---|
| Parametros | 494M | 494M | 7,6B |
| Tarea | Extraccion de hechos para memoria de agente (especializado) | Proposito general | Proposito general |
| Contexto | 32.768 tokens | 32.768 tokens | 128.000 tokens |
| Validez JSON (guided, test_bench) | 100% | 100% | 100% |
| Validez JSON (free, test_synth) | 99,7% | 0% | 0% |
| Retrieval en v2_keyed | 100% | 83,3% | 83,4% |
| Latencia p50 (guided) | 0,06 s | 0,72 s | 0,26 s |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Idioma objetivo | PT-BR | Multilingue | Multilingue |

La comparativa muestra el valor de la especializacion: el mismo modelo base, sin destilar, genera JSON invalido en modo libre (0% de validez de esquema) y sufre 58 fallos de JSON en el benchmark; tras la destilacion, la validez en modo libre sube al 99,7% y los fallos se reducen a cero. Frente al profesor de 7B, el alumno es entre 4 y 20 veces mas rapido en latencia y obtiene mejores resultados en la tarea para la que fue destilado, aunque el profesor conserva mejor F1 estricto en la tarea de extraccion pura (90,9% frente a 28,6%).

## Limitaciones y advertencias

- Vocabulario limitado: el modelo se entreno solo con 3.000 mensajes sinteticos generados por plantillas, por lo que su rendimiento puede degradar notablemente con mensajes reales con vocabulario, estilos o dominios no cubiertos por las plantillas (la model card del autor lo advierte explicitamente, aunque el texto esta truncado en la fuente).
- Monolingue: entrenado exclusivamente con datos en portugues brasileño; no hay garantias de funcionamiento en otros idiomas, incluido el portugues europeo o el castellano.
- Uso con prompt fijo: requiere usar exactamente el `SYSTEM` prompt incluido en el repositorio (`system_prompt.txt`) y el formato de usuario `Chaves existentes:` / `Mensagem:`; cualquier desviacion puede romper el formato de salida.
- Dependencia de salida guiada: para garantizar JSON valido al 100% en produccion, es necesario pasar el JSON Schema via `format` (Ollama) o `response_format` (vLLM); en modo libre la validez es del 99,7% y la tasa de falsos vacios sube al 13,3%.
- Tarea estrecha: no es un asistente de proposito general; usarlo para chat, codigo o razonamiento fuera de su tarea de extraccion no esta soportado ni evaluado.
- Riesgo de alucinacion de claves: aunque la precision de reutilizacion de claves es del 75% en el conjunto de benchmark, el 25% restante implica que puede crear claves nuevas en lugar de reutilizar las existentes, duplicando hechos en la memoria.
- Sesgos: no se documentan sesgos especificos; al tratarse de datos sinteticos de plantillas, los sesgos del profesor (Qwen2.5-7B-Instruct) pueden transferirse a las etiquetas.
- Licencia: Apache 2.0, sin restricciones para uso comercial; no obstante, conviene revisar los terminos del modelo base Qwen2.5, que tambien es Apache 2.0.
- Proyecto individual: el modelo procede de un autor individual con 733 descargas y 0 likes en el momento de la ficha; carece de auditoria comunitaria amplia y su mantenimiento a largo plazo no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DevTheusP/qwen2.5-0.5b-fact-extractor-ptbr
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Benchmark agent-memory-bench: https://github.com/DevTheusP/agent-memory-bench
- Repositorio de entrenamiento (codigo, datos y notebook): https://github.com/DevTheusP/fact-extractor-distill
- Dataset de destilacion: https://huggingface.co/datasets/DevTheusP/fact-extractor-distill-ptbr
