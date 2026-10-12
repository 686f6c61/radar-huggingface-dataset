# Omega-Factory/Qwen3-30B-A3B-GGUF

## Resumen

Omega-Factory/Qwen3-30B-A3B-GGUF es un reempaquetado en formato GGUF del modelo Qwen/Qwen3-30B-A3B, desarrollado originalmente por Alibaba Qwen y redistribuido por el usuario Omega Factory. Consiste en una "escala de precision" (precision ladder) con tres niveles de cuantizacion certificados (Q8_0, Q4_K_M y Q2_K), cada uno verificado de forma independiente contra un baseline FP16 sin cuantizar mediante evaluaciones deterministas.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) que, segun la model card del autor, declara 48 capas, 128 expertos con 8 activos por token y 30,5 mil millones de parametros totales (3,3 mil millones activos por token). No obstante, el recuento de parametros de los safetensors del repositorio es de 23.281.219.584, una cifra notablemente inferior, lo que apunta a que la variante distribuida incorpora poda de expertos ("pruned and healed") tal y como menciona la propia model card.

Su relevancia practica reside en que permite ejecutar un MoE de gran tamano en hardware de consumo: la rung Q2_K ocupa 8,62 GB y la Q4_K_M 14,16 GB, con perdidas de precision documentadas y cuantificadas por el autor. El modelo mantiene la licencia Apache 2.0 del original y ofrece modos diferenciados de razonamiento (thinking) e instruccion (instruct).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, 48 capas, 128 expertos, 8 activos por token, gating softmax |
| Parametros totales | 30,5 B segun el autor; 23.281.219.584 segun los safetensors del repo (dato no coincidente, ver limitaciones) |
| Parametros activos | 3,3 B por token (segun model card) |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3-30B-A3B es un transformer con capas de atencion estandar y un bloque de mezcla de expertos (MoE) en las capas FFN, con enrutamiento por gating softmax sobre 128 expertos y 8 expertos activos por token, lo que resulta en 3,3 B de parametros activos por paso de inferencia. Segun la model card de esta redistribucion, la variante empaquetada corresponde a una arquitectura "pruned and healed" con 96 expertos locales y 8 activos por token, aunque el recuento de parametros de los safetensors (23,28 B) difiere del total declarado de 30,5 B. Esta discrepancia no se resuelve en la informacion disponible.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineamiento (RLHF, DPO u otras) empleadas en el modelo base. El autor tampoco documenta un proceso de entrenamiento propio: su aportacion se limita al proceso de cuantizacion, la certificacion por sha256 de cada rung y la publicacion de tablas de comparacion de precision frente al baseline FP16. La model card menciona que cada rung fue "certificada sobre sus propios bytes exactos", con semilla unica (1 seed) y recibos criptograficos asociados.

## Capacidades

- Generacion de texto conversacional con plantilla ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`), tal y como se documenta en el ejemplo de Ollama.
- Dos modos de operacion explicitos: modo thinking (temperatura 1.0, top_p 0.95, top_k 20) y modo instruct (temperatura 0.7, top_p 0.8, top_k 20, presence_penalty 1.5).
- Razonamiento matematico: la model card reporta resultados medidos en GSM8K y MATH-500 tanto para el baseline FP16 como para las tres rungs cuantizadas.
- Razonamiento de sentido comun y eleccion multiple: resultados medidos en ARC-MC.
- Soporte de tool calling y function calling: no detallado en la model card de esta redistribucion; el modelo base Qwen3-30B-A3B si lo documenta en su ficha oficial.
- Capacidades de agente y razonamiento multi-paso: no detallado en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio aparece vacio).
- Vision y audio: no soportados (el pipeline declarado es unicamente text-generation).

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: la rung Q4_K_M (14,16 GB) permite ejecutar un MoE de ~23-30 B en una sola RTX 4090 o RTX 3090 con 24 GB, algo inviable con el baseline FP16 de 46,6 GB.
- Razonamiento matematico asistido: la rung Q4_K_M mantiene un 94,0 % en GSM8K (188/200) y un 48,0 % en MATH-500, con lo que puede usarse como resolutor de problemas aritmeticos y algebraicos en herramientas de estudio o validacion de calculos.
- Generacion de codigo y asistencia en desarrollo diario: el perfil de hardware recomendado por el autor para Q4_K_M es precisamente "general conversational, daily development".
- Despliegue como API local compatible con OpenAI: mediante `llama-server` con puerto 8080 (`llama-server -hf Omega-Factory/Qwen3-30B-A3B-GGUF:Q8_0 -ngl 99 -c 32768 --port 8080`), integrable en pipelines internos que ya consuman la API de OpenAI.
- Razonamiento critico en produccion con precision casi sin perdida: la rung Q8_0 (24,77 GB) mantiene el 92,5 % en GSM8K y mejora ligeramente el baseline en MATH-500 (+1,0 pp) y ARC-MC (+0,5 pp), lo que la hace adecuada para tareas donde la fidelidad frente al FP16 es prioritaria.
- Ejecucion en hardware muy limitado: la rung Q2_K (8,62 GB) cabe en GPUs de 12-16 GB como la RTX 4070 o 4080 y en Macs con 16 GB de memoria unificada, a costa de una caida documentada de 12 pp en GSM8K y 21,5 pp en MATH-500.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye recibos sha256 y tablas de discordancia de McNemar a nivel de item, utiles para investigadores que estudien el efecto de la cuantizacion sobre la precision de un MoE.
- Despliegue en Ollama para prototipado rapido: el Modelfile proporcionado permite `ollama create qwen3-30b-a3b` y `ollama run` en pocos pasos, adecuado para demos y entornos de desarrollo personal.
- Analisis de conversaciones multi-turno de hasta 32.768 tokens: util para resumir documentos largos, revisar hilos extensos o mantener contexto acumulado en un asistente.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor (Omega Factory) y corresponden a evaluaciones sobre 200 items por benchmark, con semilla unica (1 seed), comparando cada rung de cuantizacion contra el baseline FP16 de Qwen/Qwen3-30B-A3B.

| Variante | Tamano (disco/VRAM) | Compresion | GSM8K | MATH-500 | ARC-MC | Babble rate |
|---|---|---|---|---|---|---|
| FP16 baseline | ~46,6 GB | 1,00x | 92,5 % (185/200) | 49,5 % (99/200) | 93,5 % (187/200) | 0,0000 |
| Q8_0 | 24,77 GB | 0,53x (-47 %) | 92,5 % (+0,0 pp) | 50,5 % (+1,0 pp) | 94,0 % (+0,5 pp) | 0,0000 |
| Q4_K_M | 14,16 GB | 0,30x (-70 %) | 94,0 % (+1,5 pp) | 48,0 % (-1,5 pp) | 93,0 % (-0,5 pp) | 0,0000 |
| Q2_K | 8,62 GB | 0,19x (-81 %) | 80,5 % (-12,0 pp) | 28,0 % (-21,5 pp) | 89,5 % (-4,0 pp) | 0,0000 |

El desglose a nivel de item (analisis de discordancia de McNemar) confirma que Q8_0 es practicamente sin perdida (2 preguntas rotas y 2 arregladas en GSM8K; 4 y 6 en MATH-500), mientras que Q2_K concentra la mayor degradacion (28 respuestas correctas perdidas en GSM8K y 52 en MATH-500).

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, etc.) para esta redistribucion.

## Requisitos de hardware

- Q8_0: fichero de 24,77 GB; VRAM recomendada 32-48 GB. Perfil objetivo: una RTX 4090 con offload parcial a CPU, o A5000, A6000 o L40. Uso recomendado por el autor: produccion, razonamiento critico y codigo.
- Q4_K_M: fichero de 14,16 GB; VRAM recomendada 20-24 GB. Perfil objetivo: RTX 3090, RTX 4090 o Apple M-series con 32 GB de memoria unificada. Uso: conversacion general y desarrollo diario.
- Q2_K: fichero de 8,62 GB; VRAM recomendada 12-16 GB. Perfil objetivo: RTX 4070, RTX 4080 o Apple M con 16 GB. Uso: estaciones de trabajo con memoria limitada.
- Cabe en GPU de consumo: si, en Q4_K_M y Q2_K en GPUs de gama alta y media con 16-24 GB; Q8_0 requiere 32-48 GB o descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (CLI con `llama-cli` y servidor con `llama-server`), Ollama mediante Modelfile, y llama-cpp-python (`Llama.from_pretrained`). No se documenta soporte explicito de vLLM ni TGI para este repositorio.
- Contexto de ejecucion: los ejemplos usan `-c 32768` y `-ngl 99` para offload completo a GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos frente a otros modelos de la misma categoria en la informacion proporcionada. La comparacion mas directa disponible es la que el propio autor publica entre las tres rungs de cuantizacion y el baseline FP16 del modelo base:

| Variante | Parametros | Contexto | GSM8K | MATH-500 | ARC-MC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3-30B-A3B FP16 (base) | ~30,5 B (3,3 B activos) | 32.768 | 92,5 % | 49,5 % | 93,5 % | Apache 2.0 | HuggingFace (Qwen/Qwen3-30B-A3B) |
| Omega-Factory Q8_0 | ~30,5 B (3,3 B activos) | 32.768 | 92,5 % | 50,5 % | 94,0 % | Apache 2.0 | HuggingFace (este repo) |
| Omega-Factory Q4_K_M | ~30,5 B (3,3 B activos) | 32.768 | 94,0 % | 48,0 % | 93,0 % | Apache 2.0 | HuggingFace (este repo) |
| Omega-Factory Q2_K | ~30,5 B (3,3 B activos) | 32.768 | 80,5 % | 28,0 % | 89,5 % | Apache 2.0 | HuggingFace (este repo) |

Comparativa con modelos de otros desarrolladores (Llama, Mistral, DeepSeek, etc.): no disponible.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: el autor declara 30,5 B, pero los safetensors del repositorio suman 23.281.219.584 parametros. Esta diferencia no se explica en la informacion disponible y afecta a cualquier calculo de VRAM o coste de inferencia.
- Discrepancia en el numero de expertos: la model card menciona simultaneamente 128 expertos y 96 expertos locales ("pruned and healed"), sin aclarar cual es el numero efectivo de la variante distribuida.
- Degradacion severa en Q2_K: pierde 12 pp en GSM8K y 21,5 pp en MATH-500 respecto al FP16, por lo que no es recomendable para tareas de razonamiento matematico exigentes.
- Evaluaciones con semilla unica (1 seed) y solo 200 items por benchmark: la diferencia entre Q4_K_M y el baseline puede estar dentro del ruido estadistico, especialmente en GSM8K (+1,5 pp) y MATH-500 (-1,5 pp).
- Riesgo de alucinacion: no cuantificado en la informacion disponible. El "babble rate" reportado es 0,0000 en todas las variantes, pero se desconoce la metodologia de calculo.
- Idiomas soportados: no disponible; el campo de idiomas del repositorio esta vacio, lo que impide garantizar comportamiento multilingue.
- Sesgos conocidos: no disponibles; la model card no incluye ninguna evaluacion de sesgo o toxicidad.
- Licencia: Apache 2.0, permisiva para uso comercial, pero el autor no ofrece garantias explicitas sobre el proceso de poda ("pruned and healed") ni sobre posibles efectos adversos de dicha modificacion sobre los pesos.
- Repositorio con muy baja adopcion: 99 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento mas alla de una actualizacion en octubre de 2026.
- Fecha de creacion y actualizacion muy proximas entre si (10 y 11 de octubre de 2026), lo que sugiere una publicacion reciente y poco rodada en produccion.
- Soporte de tool calling y agentes: no verificado para esta redistribucion concreta; conviene validarlo antes de usarla en pipelines que dependan de function calling.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Omega-Factory/Qwen3-30B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Pagina oficial del autor con tablas de precision y recibos criptograficos: https://omega-factory.ai/models/qwen3-30b-a3b-gguf-v1
- Receipts incluidos en el repositorio: `receipts/cert_Q8_0.json`, `receipts/cert_Q4_K_M.json`, `receipts/cert_Q2_K.json`
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; las busquedas devuelven exclusivamente resultados sobre relojes de la marca Omega, sin relacion con el modelo.
