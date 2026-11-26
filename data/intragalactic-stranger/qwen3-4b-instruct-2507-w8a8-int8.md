# intragalactic-stranger/Qwen3-4B-Instruct-2507-W8A8-INT8

## Resumen

Qwen3-4B-Instruct-2507-W8A8-INT8 es una cuantizacion INT8 del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por el usuario intragalactic-stranger dentro del proyecto Cortex Serve (milestone M3). Se trata de un checkpoint de 4.022.468.096 parametros (4,4 GB en disco) que aplica pesos INT8 por canal y activaciones INT8 dinamicas por token, combinando SmoothQuant con fuerza 0,8 y GPTQ. El objetivo es reducir el coste de inferencia y memoria sin degradar de forma apreciable la calidad respecto al modelo original en bf16.

El modelo base Qwen3-4B-Instruct-2507 es un transformer denso de la familia Qwen3, en su variante "Instruct" no thinking, orientada a instrucciones y conversacion. Esta version cuantizada mantiene la licencia Apache-2.0 del original y esta empaquetada en formato compressed-tensors, pensada para servirse directamente con vLLM sobre kernels CUTLASS INT8 (Ampere y posteriores).

Su relevancia practica es doble: por un lado demuestra que una cuantizacion W8A8 bien calibrada conserva practicamente el rendimiento del bf16 (variaciones de ±1,7 puntos en GSM8K estricto, +0,5 % en perplejidad de WikiText-2) y, por otro, mejora el throughput y la latencia en GPUs de consumo profesional como la L4 (de 33,3 a 20,8 ms por token en un usuario; de 792 a 994 tokens/s con 64 usuarios).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), cuantizado W8A8 INT8 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | INT8 pesos por canal + INT8 activaciones dinamicas por token (SmoothQuant 0,8 + GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso de aproximadamente 4.000 millones de parametros. Sobre ese checkpoint se aplico un pipeline de cuantizacion post-entrenamiento en dos fases: primero SmoothQuant con fuerza 0,8 para suavizar los picos de activacion, y despues GPTQ para obtener pesos INT8 por canal, con activaciones INT8 dinamicas por token. La calibracion se realizo con 512 muestras de 2.048 tokens del dataset HuggingFaceH4/ultrachat_200k (commit 8049631c, digest de muestra 66bc04b0f6e4882a).

El proceso se ejecuto con llmcompressor 0.15.0, compressed-tensors 0.20.1, torch 2.14.1 y transformers 5.21.0 sobre una GPU NVIDIA L4, con un tiempo total de 1.327 segundos. El checkpoint resultante ocupa 4,12 GiB en disco. No se ha realizado un reentrenamiento adicional ni ajuste fino: la calidad depende enteramente del modelo base y de la fidelidad de la cuantizacion. El autor indica que todos los numeros son reproducibles a partir de una configuracion y un manifiesto versionados en el repositorio del proyecto Cortex.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base Qwen3-4B-Instruct-2507.
- Resolucion de problemas matematicos de varios pasos (GSM8K 5-shot: 71,0 % estricto, 79,2 % con extraccion flexible).
- Seguimiento de instrucciones complejas (IFEval prompt-level strict: 82,4 %).
- Razonamiento de sentido comun y conocimiento general (ARC-Challenge 59,0 %, HellaSwag 58,7 %, MMLU-Pro 34,5 %).
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base).
- Tool calling, function calling y comportamiento agentico: no documentados en la informacion proporcionada para esta variante cuantizada.
- Modo thinking: no documentado para la variante Instruct-2507 en la informacion disponible.
- Vision y audio: no soportados (modelo de texto).

## Casos de uso

- Servicio de chat conversacional de bajo coste: el modelo puede desplegarse con `vllm serve` y atender conversaciones multi-turno en GPUs de gama profesional como la L4, con un throughput de 994 tokens/s a 64 usuarios concurrentes, lo que lo hace adecuado para productos de asistencia con presupuesto ajustado.
- Atencion al cliente automatizada: la combinacion de IFEval (82,4 %) y buen rendimiento en instrucciones permite construir flujos de respuesta guiada con plantillas y restricciones de formato, manteniendo la latencia por debajo de los 21 ms por token en un solo usuario sobre L4.
- Generacion de codigo asistida en pipelines de CI/CD: aunque no hay benchmark de codigo publicado, el modelo base Qwen3 es competente en programacion; esta variante INT8 reduce el coste por token en un 37 % en L4 respecto a bf16, lo que abarata la generacion masiva de tests, documentacion o revisiones.
- Razonamiento matematico en herramientas educativas: con GSM8K 5-shot al 71,0 % estricto, puede emplearse en asistentes de resolucion de problemas de nivel escolar, con verificacion posterior por parte del usuario.
- Procesamiento por lotes de documentos regulados: el autor reporta una perplejidad de 5,977 en un corpus retenido de regulacion financiera estadounidense, apenas un 0,2 % superior al bf16, lo que respalda su uso en tareas de resumen o extraccion sobre texto normativo.
- Despliegue en infraestructura con presupuesto de VRAM limitado: al ocupar 4,12 GiB en disco y requerir kernels INT8 de Ampere en adelante, cabe en GPUs como la L4 (24 GB) con margen para cache KV y batching, y en H100 para cargas de alta concurrencia (11.673 tokens/s a 128 usuarios).
- Evaluacion comparativa de tecnicas de cuantizacion: dado que el autor publica configuracion, manifiesto y resultados reproducibles, sirve como referencia para equipos que quieran validar su propio pipeline SmoothQuant + GPTQ.

## Benchmarks y rendimiento

Calidad (mismos items para cada variante; ± = IC 95 % del error estandar de lm-eval; servido con vLLM 0.32.0 y evaluado con lm-evaluation-harness 0.4.13):

| Benchmark | Este modelo | bf16 | Delta |
|---|---|---|---|
| ARC-Challenge (acc_norm, 1.172) | 59,0 ±2,8 | 58,3 | +0,7 |
| HellaSwag (acc_norm, primeros 2.000) | 58,7 ±2,2 | 58,5 | +0,2 |
| MMLU-Pro (logprob MC, primeros 1.000) | 34,5 ±2,9 | 34,5 | +0,0 |
| GSM8K 5-shot (estricto) | 71,0 ±2,4 | 72,8 | -1,7 |
| GSM8K 5-shot (extraccion flexible) | 79,2 ±2,2 | 78,8 | +0,5 |
| IFEval (prompt-level strict) | 82,4 ±3,2 | 83,4 | -0,9 |
| WikiText-2 word perplexity (menor es mejor) | 14,338 | 14,266 | +0,5 % |
| Perplejidad en regulacion financiera de EE. UU. retenida (menor es mejor) | 5,977 | 5,965 | +0,2 % |

Velocidad (vLLM 0.32.0, carga de chat Qwen de 512 tokens de entrada y 256 de salida, concurrencia en bucle cerrado):

| GPU | Metrica | bf16 | Este modelo |
|---|---|---|---|
| NVIDIA L4 | ms por token de salida, 1 usuario | 33,3 | 20,8 |
| NVIDIA L4 | tokens de salida/s, 64 usuarios | 792 | 994 |
| NVIDIA H100 80GB | ms por token de salida, 1 usuario | 4,15 | 3,30 |
| NVIDIA H100 80GB | tokens de salida/s, 128 usuarios | 10.079 | 11.673 |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 4,12 GiB; con cache KV y overhead de runtime, un despliegue en vLLM requiere aproximadamente 6-8 GB de VRAM para cargas moderadas, aunque el dato exacto no esta publicado.
- GPUs recomendadas: NVIDIA L4 (validada por el autor), H100 80GB (validada por el autor) y cualquier GPU Ampere o posterior con soporte de kernels CUTLASS INT8.
- Cabe en GPU de consumo: si, en tarjetas Ampere o posteriores con al menos 8 GB de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090), siempre que se use un runtime compatible con INT8; el autor solo valida vLLM.
- Opciones de despliegue: vLLM 0.32.0 es el runtime documentado (`vllm serve intragalactic-stranger/Qwen3-4B-Instruct-2507-W8A8-INT8`). No se documenta soporte en llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 20,8 ms por token de salida con 1 usuario en L4; 994 tokens/s con 64 usuarios en L4; 3,30 ms por token con 1 usuario en H100 80GB; 11.673 tokens/s con 128 usuarios en H100 80GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (GSM8K 5-shot estricto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-W8A8-INT8 (este) | 4.022 M | no disponible | 71,0 % | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (bf16) | 4.022 M | no disponible | 72,8 % | Apache-2.0 | Hugging Face (modelo base) |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | 4.022 M | no disponible | no disponible | Apache-2.0 | no disponible en la informacion proporcionada |

La comparativa se limita al modelo base bf16, ya que la informacion proporcionada no incluye otras alternativas de la misma categoria con datos verificables. Frente al bf16, esta variante sacrifica 1,7 puntos en GSM8K estricto y 0,9 en IFEval a cambio de una reduccion del 37 % en latencia por token en L4 y un aumento del 25 % en throughput a 64 usuarios.

## Limitaciones y advertencias

- La cuantizacion introduce una degradacion pequena pero medible: -1,7 puntos en GSM8K estricto, -0,9 en IFEval y +0,5 % de perplejidad en WikiText-2 respecto a bf16.
- Requiere kernels CUTLASS INT8, disponibles en GPUs Ampere y posteriores; no funciona en tarjetas anteriores (Turing, Volta) con este backend.
- Solo se documenta compatibilidad con vLLM 0.32.0; el soporte en otros runtimes (llama.cpp, Ollama, TGI) no esta verificado.
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos de 4.000 millones de parametros; el MMLU-Pro de 34,5 % sugiere un conocimiento factual limitado en dominios especializados.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento multilingue antes de usarlo en produccion fuera del ingles.
- Longitud de contexto: no disponible en la informacion proporcionada; debe consultarse la ficha del modelo base.
- Uso comercial: permitido bajo Apache-2.0, sin restricciones adicionales conocidas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- El checkpoint se creo con versiones muy recientes de las herramientas (torch 2.14.1, transformers 5.21.0); la reproducibilidad depende de fijar esas versiones.

## Enlaces

- Hugging Face: https://huggingface.co/intragalactic-stranger/Qwen3-4B-Instruct-2507-W8A8-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Proyecto Cortex Serve: https://github.com/intragalactic-stranger/cortex
- Commit de origen: https://github.com/intragalactic-stranger/cortex/commit/d05daa83829b1a0fddb135de64ed74f0f100b6a9
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
