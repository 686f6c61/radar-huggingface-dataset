# chadstthomas/CTRL-0.6B

## Resumen

CTRL-0.6B es un ajuste fino mediante QLoRA sobre Qwen/Qwen3-0.6B, desarrollado por chadstthomas dentro del proyecto Expedient. Se trata de la variante "in-browser" del agente CTRL, disenada para ejecutarse integramente en una pestana del navegador sin servidor. El modelo resuelve un problema concreto de despliegue: hacer viable un asistente de soporte empresarial con recuperacion aumentada (RAG) en un cliente ligero, reduciendo el peso del GGUF a 378 MB frente a los 1,45 GB de CTRL-2B.

La arquitectura subyacente es la de Qwen3-0.6B (transformer denso de 0,6B parametros), sobre la que se aplica un adaptador LoRA de rango 16. El modelo no almacena conocimiento factual: segun las mediciones del autor, su recall a libro cerrado es identico al del modelo base (0,692), y toda la fiabilidad factica proviene de la recuperacion de fragmentos. Con contexto recuperado, el recall sube a 0,962 y la precision a 1,000.

Es relevante ahora porque demuestra un patron de despliegue edge para asistentes corporativos: modelos pequenos con adaptadores especializados en voz y formato, combinados con indices de recuperacion precalculados que el cliente solo tiene que consultar mediante producto escalar. La licencia Apache-2.0 del modelo base y del adaptador facilita su integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) con adaptador LoRA (QLoRA r16 / alpha 32) |
| Parametros totales | 596.049.920 (modelo base); adaptador LoRA adicional |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF, 378 MB); pesos LoRA en safetensors; NF4 double-quant durante entrenamiento |
| Idiomas soportados | no disponible (el corpus y la evaluacion son en ingles) |
| Licencia | Apache-2.0 (modelo base y adaptador) |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning con QLoRA sobre Qwen/Qwen3-0.6B, un transformer denso de aproximadamente 596 millones de parametros. El adaptador usa rango 16 y alpha 32, con learning rate 2e-4, scheduler coseno, batch efectivo de 16 y 4 epocas, lo que resulto en 211 pasos de entrenamiento (unos 14 minutos en una RTX 4050 Laptop de 6 GB). Se empleo cuantizacion NF4 double-quant con computo en bf16. La supervision es solo sobre el turno del asistente, en formato Qwen ChatML con bloque de pensamiento vacio: `<|im_start|>assistant\n<think>\n\n</think>\n\n{answer}`.

El corpus de entrenamiento consta de 939 filas de QA: 258 revisadas por el propio equipo y 681 promovidas mediante verificacion automatica contra paginas fuente. El autor documenta que el adaptador aprende voz y formato pero no almacena hechos, lo que explica que el recall a libro cerrado coincida con el del modelo base. El payload de recuperacion que acompana al modelo incluye `kb_corpus.jsonl` (939 pasajes), `kb_emb.json` (vectores de pasajes) y `q_emb.json` (vectores de consulta para las preguntas curadas), precalculados con BAAI/bge-small-en-v1.5 (CLS pooling, normalizacion L2), de modo que el navegador solo ejecuta un producto escalar.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de respuesta propio del agente Expedient.
- Respuestas fundamentadas en recuperacion (retrieval-grounded): el modelo integra fragmentos recuperados en la respuesta y cita numeros presentes en ellos.
- Formato de chat Qwen ChatML con bloque de pensamiento vacio, lo que simplifica el parseo en cliente.
- Ejecucion en navegador mediante llama.cpp compilado a WASM (via @wllama/wllama 2.3.1).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo tambien en infraestructura estandar de inferencia.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio.
- Capacidades multilingues: no documentadas; el corpus y la evaluacion son en ingles.

## Casos de uso

- Soporte interno en navegador sin servidor: el GGUF Q4_K_M de 378 MB se carga en una pestana y responde consultas de soporte usando el indice de 939 pasajes incluido, eliminando coste de infraestructura y latencia de red.
- Demo publica de un agente RAG: el Space de demostracion usa este modelo para mostrar el flujo completo de recuperacion y generacion sin depender de GPU en servidor.
- Asistente de consulta de documentacion de proveedores: el corpus incluye documentacion parafraseada y verificada contra paginas en vivo, adecuado para resolver dudas operativas concretas.
- Despliegue en entornos con restricciones de red o privacidad: al ejecutarse en cliente con vectores precalculados, no requiere enviar consultas a un backend externo.
- Prototipado rapido de agentes de soporte: el adaptador y el indice sirven como plantilla para construir variantes sobre otros corpus manteniendo el mismo pipeline de recuperacion.
- Validacion de calidad de respuestas numericas: el modelo esta optimizado para no inventar cifras cuando dispone de fragmentos, util en informes y respuestas con datos cuantitativos.
- Integracion en portales web de autoservicio: el tamano reducido permite incrustarlo en paginas de ayuda sin afectar perceptiblemente la carga.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 26 preguntas reservadas con decodificacion greedy. Recall = numeros gold presentes en la respuesta; precision = numeros de la respuesta presentes en gold.

| Configuracion | Recall | Precision |
|---|---|---|
| Qwen3-0.6B base, libro cerrado | 0,692 | no disponible |
| CTRL-0.6B, libro cerrado | 0,692 | 0,846 |
| CTRL-0.6B, libro abierto (fragmentos recuperados) | 0,962 | 1,000 |

Datos adicionales reportados: retrieval hit@3 de 26/26 (rango medio del gold 0,0); comprobacion de 94 filas sobre el indice completo de 939 pasajes con 94/94 aciertos. Para comparacion, CTRL-2B alcanza 0,772 de recall y 0,865 de precision a libro cerrado con 2,5B parametros. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Inferencia en navegador: el GGUF Q4_K_M de 378 MB se ejecuta via WebAssembly en una pestana, sin GPU dedicada; el consumo de memoria depende del runtime WASM del navegador.
- Inferencia en servidor con llama.cpp: cabe holgadamente en cualquier GPU consumer; se estima un uso de VRAM inferior a 1 GB para el GGUF Q4_K_M (estimacion a partir del tamano del fichero, no medida publicada).
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en cliente. Para servir el adaptador en bf16 se requiere una GPU con al menos 2 GB de VRAM.
- Entrenamiento: el autor lo realizo en una RTX 4050 Laptop de 6 GB en unos 14 minutos, lo que confirma que el ajuste es viable en hardware consumer.
- Opciones de despliegue: llama.cpp (cualquier build que soporte la arquitectura Qwen), @wllama/wllama 2.3.1 en navegador, y endpoints compatibles con la libreria PEFT para el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall libro cerrado | Precision libro cerrado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CTRL-0.6B | 0,6B | no disponible | 0,692 | 0,846 | Apache-2.0 | HuggingFace (adaptador + GGUF) |
| CTRL-2B | 2,5B | no disponible | 0,772 | 0,865 | no disponible en la informacion | HuggingFace |
| Qwen3-0.6B (base) | 0,6B | no disponible | 0,692 | no disponible | Apache-2.0 | HuggingFace |

La comparacion se limita al ecosistema Expedient y al modelo base, ya que no se han publicado comparaciones con otros modelos de la misma categoria en la informacion disponible. La diferencia clave entre CTRL-0.6B y CTRL-2B es el modo de despliegue: el primero prioriza ejecucion en cliente, el segundo calidad de respuesta.

## Limitaciones y advertencias

- El adaptador no almacena conocimiento factual: a libro cerrado su recall es identico al del modelo base. Sin recuperacion, la fiabilidad factica es limitada.
- El modelo esta entrenado y evaluado en ingles; no hay datos sobre rendimiento en castellano ni en otros idiomas.
- El corpus incluye documentacion de proveedores parafraseada; los derechos sobre el contenido subyacente siguen siendo de los editores, y la release esta pensada para uso interno de soporte de Expedient.
- La evaluacion se basa en 26 preguntas reservadas, una muestra pequena; los intervalos de confianza de las metricas no se reportan.
- El autor advierte explicitamente que no sustituye a CTRL-2B cuando la calidad es prioritaria.
- Riesgo de alucinacion en cifras cuando no hay fragmentos recuperados; el propio autor senala la invencion de numeros como senal de alucinacion.
- La demo en navegador depende de wllama 2.x, que incluye una version antigua de llama.cpp; algunas arquitecturas mas recientes no cargan en ese runtime.
- No se documentan sesgos especificos ni evaluaciones de seguridad.
- Longitud de contexto no documentada; conviene verificarla antes de usarlo con conversaciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chadstthomas/CTRL-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- CTRL-2B: https://huggingface.co/chadstthomas/CTRL-2B
- Demo Space: https://huggingface.co/spaces/chadstthomas/ctrl-2b-demo
- Embedder de recuperacion: https://huggingface.co/BAAI/bge-small-en-v1.5
- Runtime en navegador: https://www.npmjs.com/package/@wllama/wllama
