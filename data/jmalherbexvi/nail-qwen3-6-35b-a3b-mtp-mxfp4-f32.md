# jmalherbexvi/Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32

## Resumen

Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32 es una cuantizacion en formato GGUF con esquema MXFP4 y capa de salida en F32 del modelo Nail-Qwen3.6-35B-A3B-GGUF-MTP, publicado por el usuario jmalherbexvi. Se trata de un derivado de tercera generacion: parte del modelo Qwen3.6-35B-A3B de Alibaba (via la build MTP de unsloth), pasa por el ajuste Nail de peculiar-ragdoll y termina en esta conversion MXFP4. El repositorio ocupa 0,9 GB, lo que sugiere que contiene unicamente un subconjunto de ficheros o una variante parcial del modelo, no el conjunto completo de pesos.

El modelo pertenece a la familia Qwen3.6 con arquitectura MoE de 35.000 millones de parametros totales y 3.000 millones activos por token, e incorpora Multi-Token Prediction (MTP), una tecnica de decodificacion especulativa que acelera la generacion. La cuantizacion MXFP4 reduce el peso a aproximadamente 4 bits por parametro en las capas lineales, mientras que la capa de salida se mantiene en F32 para preservar la precision numerica en la distribucion final de logits.

La relevancia de esta ficha es doble: por un lado, documenta una variante de cuantizacion agresiva pensada para despliegue en hardware con memoria limitada; por otro, advierte de que se trata de un artefacto con cero descargas y cero interacciones, sin benchmarks publicados ni validacion comunitaria, por lo que su uso en produccion exige verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Multi-Token Prediction (MTP), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35 000 millones (35B), segun nomenclatura del modelo base |
| Parametros activos | 3 000 millones (3B), segun nomenclatura del modelo base |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en pesos principales, F32 en capa de salida (segun nombre del repo) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0,9 GB |
| Modelo base directo | peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF-MTP |
| Modelo original | Qwen/Qwen3.6-35B-A3B (via unsloth/Qwen3.6-35B-A3B-MTP-GGUF) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.6, con 35B parametros totales y 3B activos por token. La variante MTP (Multi-Token Prediction) anade cabezales que predicen varios tokens futuros de forma simultanea, lo que habilita decodificacion especulativa y aumenta el throughput en inferencia autoregresiva. Esta build concreta no aporta informacion sobre el proceso de entrenamiento del modelo original: no se detallan el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

El ajuste Nail procede de peculiar-ragdoll y se desconoce su naturaleza exacta (fine-tuning, merge o adaptacion). La contribucion de jmalherbexvi se limita a la conversion a GGUF con cuantizacion MXFP4 y capa de salida en F32. No se documenta en la model card ningun detalle sobre metodologia de cuantizacion, calibracion, grupo de escalas ni verificacion de perplejidad tras la conversion.

## Capacidades

- Generacion de texto autoregresiva en ingles y chino, segun los idiomas declarados en la model card.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6-35B-A3B, aunque no se documentan evaluaciones especificas para esta cuantizacion.
- Decodificacion especulativa mediante Multi-Token Prediction (MTP), que puede acelerar la generacion en motores compatibles.
- Capacidad MoE con 3B parametros activos, lo que reduce el coste computacional por token frente a un modelo denso de 35B.
- Soporte de tool calling, agentes y modo thinking: no disponible en la informacion proporcionada para esta variante concreta.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Despliegue en equipos con VRAM limitada: la cuantizacion MXFP4 reduce el peso de los pesos lineales a unos 4 bits por parametro, lo que permite cargar un modelo de 35B totales en GPUs de consumo alto o en configuraciones multi-GPU modestas, siempre que el motor GGUF soporte MXFP4.
- Inferencia local con llama.cpp u Ollama: al ser un GGUF, puede ejecutarse en runtimes de CPU/GPU hibridos; util para prototipado offline de asistentes en ingles y chino sin depender de APIs.
- Generacion de texto bilingue en/zh: adecuado para pipelines de traduccion o redaccion asistida entre ingles y chino, los dos idiomas declarados.
- Aceleracion de throughput con MTP: en motores que implementen decodificacion especulativa, el cabezal MTP puede reducir la latencia por token en servicios de chat con alta concurrencia.
- Evaluacion comparativa de cuantizaciones: sirve como artefacto de referencia para medir la perdida de calidad de MXFP4 frente a Q4_K_M, Q5_K_M u otros esquemas sobre el mismo modelo base.
- Experimentacion en investigacion: util para estudiar el comportamiento de modelos MoE con MTP bajo cuantizacion agresiva, siempre con validacion propia de perplejidad y tareas downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas de perplejidad para esta cuantizacion, y el repositorio registra cero descargas, por lo que no existe validacion comunitaria documentada.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. El repositorio ocupa 0,9 GB, lo que no corresponde al conjunto completo de pesos de un modelo de 35B; si el artefacto fuese completo en MXFP4, el peso rondaria los 17-18 GB, pero este dato no se puede confirmar con la informacion proporcionada.
- GPU recomendadas: no disponibles para esta variante concreta. Para un MoE de 35B totales y 3B activos en 4 bits, serian razonables GPUs con 24 GB o mas (RTX 4090, L40S, A100 40GB), pero es una estimacion no verificada.
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) si el artefacto completo cabe en memoria; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF que soporten MXFP4. vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32 | 35B | 3B | no disponible | Apache 2.0 | GGUF MXFP4 | Cero descargas, sin benchmarks |
| Qwen/Qwen3.6-35B-A3B | 35B | 3B | no disponible | no disponible en la informacion | safetensors (presumible) | Modelo original de referencia |
| unsloth/Qwen3.6-35B-A3B-MTP-GGUF | 35B | 3B | no disponible | no disponible en la informacion | GGUF | Build MTP de unsloth, base de la cadena |
| peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF-MTP | 35B | 3B | no disponible | no disponible en la informacion | GGUF | Ajuste Nail, base directa de esta cuantizacion |

## Limitaciones y advertencias

- Artefacto sin validacion: cero descargas y cero likes en el momento de la ficha; no hay evidencia comunitaria de que la cuantizacion funcione correctamente.
- Tamano del repositorio anómalo: 0,9 GB es muy inferior a lo esperable para un modelo de 35B en 4 bits, lo que sugiere que el repo puede contener solo parte de los ficheros o una variante parcial; verificar antes de usar.
- Perdida de calidad por cuantizacion: MXFP4 es un esquema agresivo; no se ha publicado perplejidad ni evaluacion downstream que cuantifique el deterioro frente al modelo original.
- Cobertura idiomatica limitada: solo ingles y chino declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks ni validacion, el riesgo no esta acotado para esta variante.
- Sesgos: no documentados en la model card; se heredan los del modelo base Qwen3.6 y el ajuste Nail, sin analisis publicado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo original Qwen y del ajuste Nail, ya que la cadena de derivaciones puede imponer terminos adicionales no reflejados aqui.
- Soporte de motores: MXFP4 en GGUF requiere versiones recientes de llama.cpp u otros runtimes; la compatibilidad con vLLM y TGI no esta confirmada.
- Sin garantias de produccion: al no existir evaluacion, no se recomienda su uso en sistemas criticos sin pruebas propias de calidad, latencia y estabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jmalherbexvi/Nail-Qwen3.6-35B-A3B-MTP-MXFP4-F32
- Modelo base directo: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF-MTP
- Build MTP de unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
