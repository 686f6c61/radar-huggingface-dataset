# pranil00/mistral-7b-instruct-v0_2-bnb-4bit-BYM

## Resumen

mistral-7b-instruct-v0.2-bnb-4bit-BYM es una variante "abliterated" del modelo Mistral 7B Instruct v0.2, publicada por el usuario pranil00 mediante el framework break-your-model. El modelo parte de la version cuantizada a 4 bits de unsloth (unsloth/mistral-7b-instruct-v0.2-bnb-4bit) y le aplica una ablacion de direcciones internas de rechazo (refusal directions) mediante la tecnica Arbitrary-Rank Ablation (ARA) con Hyperspherical Row-Norm Invariance, con el objetivo declarado de eliminar comportamientos de censura y rechazo sin degradar el razonamiento, las matematicas ni la generacion de codigo.

El resultado es un modelo de 7.000 millones de parametros, heredero de la arquitectura transformer decoder-only de Mistral 7B, con ventana de contexto de 32.000 tokens (caracteristica de la familia Mistral 7B v0.2) y licencia Apache 2.0. Se distribuye tanto en formato GGUF cuantizado q4_k_m para llama.cpp y Ollama como en safetensors (pesos y adaptador PEFT) para Transformers. El repositorio ocupa 0,2 GB, lo que sugiere que los pesos completos no estan incluidos y que el artefacto principal es el adaptador y/o el GGUF.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de "abliteration" (eliminacion de alineamiento de seguridad) sobre un modelo open source ampliamente usado; por otro, sirve como advertencia tecnica y etica sobre los riesgos de desplegar variantes sin salvaguardas en produccion. El modelo declara una reduccion del 96 % en la tasa de rechazo ante prompts daninos (de 75/100 a 3/100), lo que lo hace inadecuado para aplicaciones que requieran filtros de seguridad integrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral 7B v0.2) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (heredado de Mistral 7B Instruct v0.2) |
| Tipos de cuantizacion | 4 bits (bitsandbytes en el modelo base); GGUF q4_k_m en el artefacto publicado |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors / adapter_model.safetensors), GGUF (mistral-7b-instruct-v0.2-bnb-4bit-q4_k_m.gguf) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B Instruct v0.2: un transformer decoder-only denso con atencion por ventana deslizante (sliding window attention) y RoPE, entrenado originalmente por Mistral AI. Sobre esa base cuantizada a 4 bits por unsloth, el autor aplica una intervencion de representacion (representation engineering) denominada Arbitrary-Rank Ablation (ARA) combinada con Hyperspherical Row-Norm Invariance. Esta tecnica identifica las direcciones internas asociadas a comportamientos de rechazo y las excinde matematicamente de los pesos, preservando la norma de las filas para minimizar la deriva funcional.

No se dispone de informacion sobre el volumen de datos de entrenamiento original de Mistral 7B v0.2 en la documentacion proporcionada, ni sobre si hubo RLHF o DPO especificos en esta variante. La model card indica que la optimizacion se realizo mediante un adaptador (strategy: adapter) con un tiempo de ejecucion de 3249,1 segundos, y reporta una divergencia KL sobre prompts inofensivos de 0,8051, que el autor etiqueta como "Pinsker Invariant (<0.20)" pese a que el valor reportado supera ese umbral, una inconsistencia interna de la propia model card. No se documentan innovaciones adicionales como decodificacion especulativa ni atencion linear.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Mistral 7B Instruct v0.2.
- Razonamiento, matematicas y generacion de codigo, que el autor afirma preservados tras la ablacion (sin benchmarks que lo verifiquen en la informacion disponible).
- Respuesta a prompts que el modelo base rechazaria, incluidos escenarios de doble uso en seguridad (el ejemplo de la model card es "dual-use security applications of binary reverse engineering").
- Despliegue local nativo via llama.cpp (CLI y servidor compatible con la API de OpenAI) y Ollama.
- Integracion con Transformers y PEFT mediante adaptador.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar empiricamente el efecto de la ablacion de direcciones de rechazo sobre el comportamiento de un LLM, comparando con el modelo base en tareas controladas de red teaming.
- Evaluacion de robustez de filtros: sirve como caso de prueba para medir si los clasificadores de entrada/salida de un pipeline de produccion detectan contenido que el modelo ya no rechaza por si mismo.
- Despliegue local en estaciones de trabajo: el GGUF q4_k_m permite ejecutar inferencia en CPU o Apple Silicon mediante llama.cpp u Ollama, util para prototipos sin GPU dedicada.
- Servidor local compatible con OpenAI: con `llama-server` se puede exponer una API en `127.0.0.1:8080` para integrar en herramientas que ya usan el cliente de OpenAI, en entornos aislados.
- Analisis de codigo y texto tecnico de doble uso: escenarios de investigacion en reversing o triage de vulnerabilidades donde el modelo base aplicaria rechazos; requiere supervision humana y marco legal adecuado.
- Experimentacion con PEFT: el adaptador safetensors permite cargar el modelo con Transformers y PEFT para estudiar la composicion de adaptadores y la reversibilidad de la ablacion.
- Docencia sobre riesgos de modelos sin salvaguardas: ejemplo practico de por que la licencia Apache 2.0 no implica idoneidad para produccion.

## Benchmarks y rendimiento

La model card incluye una "scorecard" de ablacion, no benchmarks academicos estandar (MMLU, HumanEval, GSM8K). Se reproduce a continuacion tal cual, con la advertencia de que son metricas internas del autor y no verificables de forma independiente:

| Metrica | Baseline | break-your-model | Resultado declarado |
|---|---|---|---|
| Tasa de rechazo ante prompts daninos | 75/100 | 3/100 | Reduccion del 96,0 % |
| Divergencia KL en prompts inofensivos | 0,0000 (ref.) | 0,8051 | "Pinsker Invariant (<0.20)" (inconsistente con el valor) |
| Estrategia de optimizacion | — | adapter | "Zero Degradation" (no verificado) |
| Tiempo de optimizacion | — | 3249,1 s | Ejecucion local verificada |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits: aproximadamente 4-5 GB para los pesos, mas overhead de contexto; con 32.000 tokens de contexto el consumo de KV cache crece de forma significativa y puede requerir 8-16 GB adicionales segun lote y precision.
- GPU recomendadas: RTX 3090/4090 (24 GB) para contexto largo en 4 bits; A100 40/80 GB o H100 para servir con vLLM/TGI a mayor throughput; tambien viable en GPUs de 8 GB con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores con cuantizacion q4_k_m y contexto moderado.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (Modelfile incluido), Transformers + PEFT, y potencialmente vLLM/TGI si se convierte el adaptador a pesos completos (no documentado).
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo reporta el tiempo de optimizacion (3249,1 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineamiento de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mistral-7b-instruct-v0.2-bnb-4bit-BYM | 7B | 32.000 | Ablacionado (rechazo reducido ~96 %) | Apache 2.0 | Hugging Face (repo de 0,2 GB) |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32.000 | Alineado con rechazos | Apache 2.0 | Hugging Face |
| unsloth/mistral-7b-instruct-v0.2-bnb-4bit | 7B | 32.000 | Alineado, cuantizado 4 bits | Apache 2.0 | Hugging Face |
| Otras variantes abliterated de Mistral 7B | 7B | 32.000 | Ablacionadas | Apache 2.0 (segun variante) | Hugging Face |

No se dispone de datos de rendimiento comparativo verificable entre estas variantes en la informacion proporcionada; la unica metrica disponible es la tasa de rechazo declarada por el autor.

## Limitaciones y advertencias

- Eliminacion deliberada de salvaguardas: la tasa de rechazo ante prompts daninos cae del 75 % al 3 % segun el autor, por lo que el modelo no debe usarse en aplicaciones de cara al publico sin filtros externos.
- Riesgo de uso malicioso: la propia model card ejemplifica prompts de doble uso en seguridad; su distribucion facilita la generacion de contenido que el modelo base bloquearia.
- Inconsistencia documental: la metrica KL reportada (0,8051) contradice el umbral "Pinsker Invariant (<0.20)" que el autor afirma cumplir; la afirmacion de "zero degradation" no esta respaldada por benchmarks publicos.
- Ausencia de benchmarks academicos: no hay MMLU, HumanEval ni GSM8K que permitan verificar que el razonamiento, las matematicas y el codigo se preservan tras la ablacion.
- Sesgos: no documentados; al heredar el modelo base, arrastra los sesgos de Mistral 7B Instruct v0.2, y la ablacion puede alterar la calibracion de las respuestas.
- Alucinacion: no evaluada en la informacion disponible; la intervencion sobre representaciones internas puede afectar a la coherencia en dominios sensibles.
- Idiomas: no se declara lista de idiomas soportados; el modelo base esta optimizado principalmente para ingles.
- Licencia: Apache 2.0 permite uso comercial, pero ello no exime del cumplimiento de normativa aplicable (por ejemplo, la Ley de IA de la UE o legislacion sobre contenido danino) ni de responsabilidad por el uso.
- Repositorio de solo 0,2 GB: sugiere que los pesos completos no estan incluidos; conviene verificar la integridad de los artefactos antes de desplegar.
- Fecha de creacion futura (2026-11-28): metadato anomalo que conviene contrastar con el autor antes de confiar en la trazabilidad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/mistral-7b-instruct-v0_2-bnb-4bit-BYM
- Modelo base (unsloth): https://huggingface.co/unsloth/mistral-7b-instruct-v0.2-bnb-4bit
- Framework break-your-model: https://github.com/PranilShah-08/break-your-model
