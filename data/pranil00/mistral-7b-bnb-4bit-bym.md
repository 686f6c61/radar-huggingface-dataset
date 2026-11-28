# pranil00/mistral-7b-bnb-4bit-BYM

## Resumen

mistral-7b-bnb-4bit-BYM es un modelo derivado de Mistral 7B obtenido mediante la tecnica de "abliteration" (ablacion de direcciones de rechazo) implementada en el framework break-your-model, desarrollado por Pranil Shah. El modelo parte de unsloth/mistral-7b-bnb-4bit, una version cuantizada a 4 bits del Mistral 7B original, y le aplica una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) con invariancia de norma de fila hiperesferica para eliminar los comportamientos de rechazo y censura internalizados durante el alineamiento.

El objetivo declarado es reducir la tasa de rechazo ante prompts considerados daninos sin degradar el rendimiento en tareas de razonamiento, matematicas o codigo. Segun la model card, la tasa de rechazo ante un suite de 100 prompts daninos baja del 12% al 3% (una reduccion del 75%), con una divergencia KL de 0.2990 respecto a la linea base. El repositorio es pequeno (0.2 GB) y contiene principalmente el adaptador PEFT y un artefacto GGUF cuantizado Q4_K_M.

Es relevante ahora porque ejemplifica una tendencia creciente de publicaciones de modelos "uncensored" derivados de pesos abiertos, orientadas a investigacion en seguridad, red teaming y evaluacion de alineamiento. No obstante, el modelo no incluye informacion sobre idiomas soportados ni resultados de benchmarks de capacidades estandar, y su uso en produccion requiere considerar los riesgos asociados a la eliminacion de salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral 7B) con ablacion de direcciones de rechazo (ARA) |
| Parametros totales | 7 mil millones (heredados del modelo base Mistral 7B; no confirmado en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) en el modelo base; GGUF Q4_K_M incluido |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors / model.safetensors) y GGUF (mistral-7b-bnb-4bit-q4_k_m.gguf) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Mistral 7B, con aproximadamente 7 mil millones de parametros. Sobre esa base cuantizada a 4 bits (unsloth/mistral-7b-bnb-4bit) se aplica un proceso de ablacion de representaciones: se identifican las direcciones internas asociadas a comportamientos de rechazo y se eliminan matematicamente mediante Arbitrary-Rank Ablation (ARA) combinada con Hyperspherical Row-Norm Invariance. El resultado se distribuye como un adaptador PEFT (adapter_model.safetensors) que se carga sobre el modelo base, y como un artefacto GGUF cuantizado Q4_K_M para inferencia local.

No se detalla en la informacion proporcionada el volumen de tokens de entrenamiento ni la composicion del dataset, ya que el proceso no es un reentrenamiento sino una modificacion de pesos. La model card indica que el tiempo de optimizacion fue de 3573 segundos (aproximadamente una hora) en ejecucion local, y que la estrategia de optimizacion empleada fue "adapter" con "zero degradation" declarado. No se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de las propias del modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma no confirmado oficialmente en la model card).
- Razonamiento, matematicas y generacion de codigo, segun declara el autor sin degradacion respecto al modelo base.
- Reduccion de comportamientos de rechazo ante prompts daninos (de 12/100 a 3/100 en el suite de prueba del autor).
- Inferencia local mediante llama.cpp, Ollama y servidor compatible con la API de OpenAI (llama-server).
- Carga como adaptador PEFT sobre el modelo base con Transformers.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seguridad y alineamiento: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta al comportamiento del modelo, comparando la linea base (12/100 de rechazo) con la version modificada (3/100) en entornos controlados de laboratorio.
- Red teaming y evaluacion de robustez: util para generar respuestas ante prompts adversarios y medir la eficacia de las salvaguardas de otros sistemas, dentro de un marco de pruebas autorizado.
- Analisis de ingenieria inversa y seguridad dual: la model card usa como ejemplo prompts sobre aplicaciones de seguridad de la ingenieria inversa de binarios, un escenario de formacion o investigacion tecnica.
- Despliegue local en hardware modesto: el GGUF Q4_K_M permite ejecutar el modelo en CPU o Apple Silicon mediante llama.cpp u Ollama, adecuado para prototipos y entornos sin GPU dedicada.
- Servidor local compatible con OpenAI: mediante llama-server se puede integrar en pipelines existentes que usen el cliente de OpenAI para pruebas internas.
- Experimentacion con PEFT: el adaptador safetensors permite cargar el modelo con Transformers y PEFT para estudiar tecnicas de edicion de pesos sin reentrenar.
- Evaluacion comparativa de tecnicas de abliteracion: sirve como referencia para comparar ARA con otras tecnicas de eliminacion de rechazo en modelos de 7B.

## Benchmarks y rendimiento

La model card solo publica la scorecard de ablacion, no benchmarks de capacidades estandar (MMLU, HumanEval, GSM8K):

| Metrica | Linea base | break-your-model | Resultado |
|---|---|---|---|
| Tasa de rechazo ante prompts daninos | 12/100 | 3/100 | Reduccion del 75,0% |
| Divergencia KL en tareas inofensivas | 0,0000 (ref.) | 0,2990 | Invariancia de Pinsker (<0,20) |
| Estrategia de optimizacion | — | adapter | Sin degradacion declarada |
| Tiempo de optimizacion | — | 3573,0 s | Ejecucion local verificada |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K) en la informacion disponible. Nota: la tabla declara una divergencia KL de 0,2990 y simultaneamente la etiqueta "Pinsker Invariant (<0,20)", lo que resulta internamente contradictorio y conviene tratar con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M de un modelo de 7B ocupa aproximadamente 4-5 GB; en precision 16 bits serian necesarios unos 14-16 GB (estimacion estandar para 7B, no confirmada en la model card).
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, una RTX 3090/4090 (24 GB) o A100/H100 permitirian inferencia en 16 bits; el GGUF Q4_K_M cabe en GPUs consumer con 6-8 GB.
- Cabe en GPU consumer: si, en el formato GGUF Q4_K_M; tambien en CPU y Apple Silicon (el autor menciona soporte MPS).
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (Modelfile incluido), Transformers + PEFT, y script run_inference.py con fallback a ejecucion nativa C++.
- Latencia y throughput: no disponibles. El autor reporta 3573 s de tiempo de optimizacion, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mistral-7b-bnb-4bit-BYM | ~7B | no disponible | Mistral 7B abliterado (ARA) | apache-2.0 | Hugging Face (repo 0.2 GB) |
| unsloth/mistral-7b-bnb-4bit (base) | ~7B | no disponible | Mistral 7B cuantizado 4-bit | apache-2.0 | Hugging Face |
| Mistral 7B original | ~7B | 32k (referencia del modelo original) | Transformer decoder-only alineado | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. Las cifras de contexto del Mistral 7B original se citan como referencia general y no estan confirmadas para este derivado.

## Limitaciones y advertencias

- El modelo elimina deliberadamente los comportamientos de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o inseguro; no es apto para aplicaciones de cara al publico sin salvaguardas externas.
- La model card no documenta sesgos conocidos, evaluaciones de toxicidad ni resultados de benchmarks de capacidades; el autor declara "zero degradation" sin evidencia publica verificable.
- La divergencia KL reportada (0,2990) contradice la etiqueta "Pinsker Invariant (<0,20)" de la misma tabla, lo que sugiere posible inconsistencia en la evaluacion.
- No se especifican los idiomas soportados; el modelo base esta orientado principalmente al ingles.
- El repositorio contiene rutas locales del autor (por ejemplo, /Users/pranil/...) en el codigo de ejemplo, lo que indica que no se ha revisado para distribucion general.
- El proceso de ablacion puede degradar sutilmente la coherencia o el cumplimiento de instrucciones en tareas complejas, aunque no se aportan datos al respecto.
- La licencia apache-2.0 permite uso comercial, pero el uso de un modelo sin salvaguardas en produccion puede incumplir normativas sectoriales o de proteccion de datos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/mistral-7b-bnb-4bit-BYM
- Framework break-your-model: https://github.com/PranilShah-08/break-your-model
- Modelo base: https://huggingface.co/unsloth/mistral-7b-bnb-4bit
