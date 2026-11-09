# izagami/GLM-5.3-Flash-FP4-PTQ1-GGUF

## Resumen

GLM-5.3-Flash-FP4-PTQ1-GGUF es una cuantización extrema del modelo GLM-5.3-Flash de Zhipu AI (zai-org), publicada por el usuario izagami. Concretamente, toma el build en NVFP4 de NVIDIA (`nvidia/GLM-5.3-Flash-FP4-Local`) y convierte todos los expertos enrutados de las capas 3 a 44 a pesos ternarios {-1, 0, 1}, empaquetados en el tipo ggml PTQ1_0 (5 trits por byte, 1,75 bits por peso). El resto de componentes (atención, capas densas en Q8_0, embeddings, `lm_head` en Q6_K y la capa MTP 45) se copian sin cambios desde `unsloth/GLM-5.3-Flash-GGUF`.

El objetivo es claro: hacer viable en hardware de gama media un modelo de 320.759.404.382 parámetros totales que en su formato de origen ocupa 184,4 GB. La versión ternaria pesa 79,7 GB, lo que permite ejecutarla en una DGX Spark (GB10) con 128 GB de memoria unificada, algo imposible con el build de 4 bits (167 GB, no cabe). El coste en calidad es medible y acotado: unos 8 puntos de MMLU-Pro frente al 2 bits, mientras que GSM8K e IFEval se mantienen muy cerca.

La relevancia de esta ficha radica en que documenta una técnica de compresión poco habitual (cuantización ternaria post-entrenamiento con destilación de escalas) aplicada a un MoE de gran tamaño, y en que expone con transparencia los resultados y las limitaciones del proceso. Es un artefacto experimental, con 0 descargas en el momento de la consulta, y requiere parches específicos de llama.cpp o XeStrata para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados (base GLM-5.3-Flash), capa MTP para decodificación especulativa |
| Parametros totales | 320.759.404.382 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no medida en esta cuantización) |
| Tipos de cuantizacion | Expertos enrutados en PTQ1_0 ternario (ggml type 143, 1,75 bits/peso); capas densas Q8_0; embeddings Q8_0; `lm_head` Q6_K; escalas fp16 (1 por cada 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (modelo base zai-org/GLM-5.3-Flash y unsloth/GLM-5.3-Flash-GGUF son MIT) |
| Formato de pesos | GGUF (fichero `GLM-5.3-Flash-FP4-T3-PTQ1_0.gguf`, 79,7 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) del que solo se cuantizan los expertos enrutados de las capas 3 a 44; la atención, las capas densas, los embeddings y la cabeza de salida conservan la precisión del build de Unsloth. La capa 45 corresponde a la cabeza MTP (multi-token prediction) usada para decodificación especulativa. El proceso de cuantización parte de NVFP4 y aplica una cuantización estilo GPTQ a ternario, usando activaciones registradas por experto y una escala fp16 por cada bloque de 128 pesos.

Sobre esa base se aplica una destilación de escalas en dos rondas. Los códigos ternarios permanecen fijos y solo se entrena un multiplicador por bloque de escala que se pliega en las escalas fp16, de modo que el formato y el tamaño no cambian. La pérdida es la divergencia KL frente a las probabilidades del siguiente token del modelo de 4 bits. La primera ronda (40 pasos) usa respuestas del propio modelo ternario, prompts de instrucciones con restricciones verificables y respuestas de GSM8K train, ARC y SciQ que coinciden con la solución; la KL en held-out baja de 0,3211 a 0,1582. La segunda ronda (25 pasos) añade 1.255 preguntas largas de opción múltiple (MMLU auxiliary train y MedMCQA) respondidas solo con la letra, lo que eleva MMLU-Pro del 40,4 % al 53,2 %, ya que la mayoría de fallos previos eran errores de formato de respuesta. No se usaron ítems de test de los benchmarks para entrenar.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredado del modelo base GLM-5.3-Flash.
- Aritmética y resolución de problemas matemáticos: GSM8K se mantiene en el 95,2 %, prácticamente idéntico al build de 4 bits.
- Seguimiento de instrucciones con formato verificable: IFEval del 68,5 %.
- Modo thinking: el modelo base lo soporta, pero en esta cuantización no se ha probado; el autor advierte que con plantillas que terminan en `<think>` hay que añadir `</think>` para desactivarlo, o la calidad cae.
- Tool calling / function calling: soportado por el modelo base, no verificado en esta cuantización.
- Razonamiento multi-paso y uso como agente: no verificado.
- Capacidades multilingües: no documentadas para esta cuantización.
- Decodificación especulativa mediante la capa MTP 45, con ganancia medida en DGX Spark (31 tok/s con MTP 3 frente a 24 tok/s sin él).

## Casos de uso

- Despliegue en estación de trabajo con DGX Spark (GB10): es el escenario validado por el autor. Con 79,7 GB y capas densas en Q4_0, el modelo cabe en los 128 GB de memoria unificada y decodifica a 31 tok/s con MTP, algo imposible con el build de 4 bits (167 GB).
- Inferencia en clúster reducido de GPUs Intel Arc Pro B70: con el parche XeStrata (kernels XMX para PTQ1_0 y `STRATA_PTQ1_DPAS=1`) se alcanzan 56 tok/s en decodificación con tres tarjetas, frente a 10-18 tok/s del modelo de 4 bits.
- Razonamiento matemático y resolución de problemas cuantitativos en local: GSM8K al 95,2 % permite usar el modelo para verificación aritmética, tutoría de ejercicios o generación de problemas con solución comprobable sin depender de API externa.
- Procesamiento por lotes con requisitos de seguimiento de instrucciones: IFEval del 68,5 % lo hace apto para tareas de extracción estructurada, reformateo y clasificación con restricciones de formato, siempre que se valide el prompt con la plantilla correcta.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar el impacto del ternario en MoE de gran escala, con comparativas directas frente a 2 bits y 4 bits sobre los mismos conjuntos de evaluación.
- Experimentación con decodificación especulativa: la capa MTP intacta permite medir el rendimiento de técnicas de draft en hardware con memoria limitada, un caso de interés para quienes investigan aceleración de inferencia.
- Prototipado de asistentes conversacionales con presupuesto de memoria ajustado: el tamaño de 79,7 GB lo sitúa en el rango de servidores de una sola máquina, útil para demos internas donde no se requiere la máxima calidad.

## Benchmarks y rendimiento

Mediciones del autor: thinking off, temperature 0, una petición a la vez, tres Intel Arc Pro B70. Las puntuaciones se obtuvieron empaquetando los mismos trits y escalas como Q2_0 (pesos idénticos, distinto empaquetado).

| Test | Este modelo (ternario) | Versión 2 bits | Fuente 4 bits |
|---|---:|---:|---:|
| MMLU-Pro (280 preguntas) | 53,2 % | 61,4 % | 62,9 % |
| GSM8K (440 preguntas) | 95,2 % | 97,0 % | 96,8 % |
| IFEval (422 prompts) | 68,5 % | 71,1 % | no medido |
| Decode, 3x Arc Pro B70, XeStrata, MTP | 56 tok/s | 62 tok/s | 10-18 tok/s |
| Decode, DGX Spark (GB10), llama.cpp, densas Q4_0 | 31 tok/s con MTP 3; 24 tok/s sin MTP | no medido igual | no cabe (167 GB) |

En DGX Spark con el fichero PTQ1_0 y densas en Q4_0: GSM8K 95,5 %, IFEval 69,0 %, MMLU-Pro 52,9 %. El ternario pierde unos 8 puntos de MMLU-Pro frente al 2 bits, mientras que aritmética y seguimiento de instrucciones quedan muy próximos.

## Requisitos de hardware

- VRAM/memoria estimada: 79,7 GB para el fichero GGUF; en la práctica se necesita margen para el contexto KV y buffers, por lo que 96-128 GB de memoria total es el rango realista.
- DGX Spark (GB10): configuración validada, con capas densas en Q4_0 y llama.cpp parcheado; 31 tok/s con MTP 3.
- 3x Intel Arc Pro B70: configuración validada con XeStrata parcheado; 56 tok/s en decodificación.
- GPUs NVIDIA: el parche `llama.cpp-ptq1-gb10.patch` se aplica sobre llama.cpp upstream en el commit `67107ac`; probado en GB10, no en A100/H100/RTX 4090.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB); requiere agregar varias GPUs o memoria unificada.
- Opciones de despliegue: llama.cpp (con parche) y XeStrata (con parche pendiente de publicación definitiva). vLLM, TGI y Ollama no están soportados por el momento.
- Ajustes obligatorios: `--adapt-every 0` en XeStrata para desactivar el intercambio adaptativo de expertos; añadir `</think>` si la plantilla termina en `<think>` con thinking desactivado, o IFEval cae al 48 %.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / tamaño | MMLU-Pro | GSM8K | Licencia |
|---|---|---:|---:|---:|---|
| GLM-5.3-Flash-FP4-PTQ1-GGUF (este) | 320,8 B | GGUF ternario, 79,7 GB | 53,2 % | 95,2 % | NVIDIA Open Model Agreement |
| GLM-5.3-Flash-FP4-Q2-GGUF | 320,8 B | GGUF 2 bits, 98,7 GB | 61,4 % | 97,0 % | no disponible en la información |
| GLM-5.3-Flash-FP4-Local (NVIDIA) | 320,8 B | NVFP4, 184,4 GB | 62,9 % | 96,8 % | NVIDIA Open Model Agreement |
| unsloth/GLM-5.3-Flash-GGUF | 320,8 B | GGUF estándar, tamaño no indicado | no disponible | no disponible | MIT |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks de modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: aproximadamente 8 puntos de MMLU-Pro frente al 2 bits y 9,7 frente al 4 bits; el rendimiento en razonamiento complejo y conocimiento factual es el más afectado.
- No carga en llama.cpp ni XeStrata sin parche: el tipo ggml PTQ1_0 (143) no está en upstream; requiere aplicar `llama.cpp-ptq1-gb10.patch` o el parche de XeStrata.
- Tool calling, modo thinking y contextos largos no han sido probados por el autor; no hay garantías de comportamiento correcto en esos escenarios.
- Los metadatos del GGUF son incorrectos: `general.license = mit` y `general.quantized_by = Unsloth` se copiaron del fichero de origen y no describen este artefacto; la licencia aplicable es la NVIDIA Open Model Agreement.
- Licencia restrictiva: el uso comercial se rige por el NVIDIA Open Model Agreement, no por la MIT del modelo base ni del GGUF de Unsloth; es necesario revisar sus términos antes de desplegar en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje, agravado por la cuantización ternaria de los expertos; el autor no documenta evaluaciones de factualidad.
- Configuración frágil: con plantillas que terminan en `<think>` y thinking desactivado sin añadir `</think>`, el modelo razona igualmente y la puntuación de IFEval cae del 69 % al 48 %.
- En XeStrata, el intercambio adaptativo de expertos debe desactivarse con `--adapt-every 0`; con él activo se han observado respuestas incorrectas tras cargas de trabajo variadas.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe equivalente al del modelo base.
- Artefacto experimental con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento garantizado por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izagami/GLM-5.3-Flash-FP4-PTQ1-GGUF
- Modelo base (NVIDIA): https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- Versión 2 bits del mismo autor: https://huggingface.co/izagami/GLM-5.3-Flash-FP4-Q2-GGUF
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Modelo original (Zhipu AI): zai-org/GLM-5.3-Flash (referenciado en la model card, sin URL directa en la información disponible)
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Parche para llama.cpp: `llama.cpp-ptq1-gb10.patch` e instrucciones en `llama.cpp-ptq1-gb10.md` (incluidos en el repositorio del modelo)
- Parche XeStrata: pendiente de publicación en el repositorio del modelo según la model card
