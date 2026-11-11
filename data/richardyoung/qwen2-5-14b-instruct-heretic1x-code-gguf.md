# richardyoung/Qwen2.5-14B-Instruct-heretic1x-code-GGUF

## Resumen

Qwen2.5-14B-Instruct-heretic1x-code-GGUF es la distribucion en formato GGUF de un modelo derivado de Qwen2.5-14B-Instruct al que se le ha aplicado una ablacion direccional de rang-1 para eliminar el comportamiento de rechazo (abliteration). El autor de la publicacion es richardyoung, que parte de su propio modelo en safetensors (richardyoung/Qwen2.5-14B-Instruct-heretic1x-code) y lo convierte a GGUF con llama.cpp para su uso en llama.cpp, Ollama y otros runners compatibles.

El modelo hereda la arquitectura transformer densa de Qwen2.5-14B-Instruct, con 14.770.033.664 parametros totales y licencia Apache 2.0. La innovacion respecto al original no esta en la arquitectura sino en la modificacion de pesos: se aplica Heretic 1.x (heretic-llm 1.4.0) con direcciones de rechazo derivadas de codigo, buscando reducir las negativas del modelo sin degradar en exceso la distribucion de salida. La seleccion del trial se hace minimizando rechazos en dev con una divergencia KL de primer token inferior a 0.01.

Su relevancia es fundamentalmente de investigacion: forma parte de un estudio comparativo sobre herramientas de abliteration (Heretic 1.x, Heretic 2.0, OBLITERATUS y releases comunitarios) y sirve para medir la eficacia y los efectos secundarios de estas tecnicas. No esta pensado como asistente generalista y el propio autor advierte que la cuantizacion puede alterar el comportamiento de rechazo respecto al modelo en bf16 evaluado en el paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-14B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | Q4_K_M, Q8_0; en preparacion IQ3_M, IQ4_XS, Q5_K_M, Q6_K; matriz de importancia (imatrix) disponible |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-14B-Instruct: un transformer denso decoder-only de aproximadamente 14,77 mil millones de parametros. Sobre esa base no se ha realizado un reentrenamiento completo, sino una modificacion post-hoc de los pesos mediante ablacion direccional de rango 1. La herramienta empleada es Heretic 1.x (heretic-llm 1.4.0), que calcula direcciones de rechazo a partir de datos derivados de codigo y las resta de las activaciones o pesos correspondientes. El proceso se repite en 200 trials y se selecciona aquel con menos rechazos en el conjunto de desarrollo sujeto a una divergencia KL de primer token respecto al original menor o igual a 0.01.

Los datos de entrenamiento originales del modelo base (composicion del corpus, numero de tokens, fases de RLHF/DPO) no se detallan en la informacion proporcionada. La model card solo reporta metricas del proceso de abliteration: 49 rechazos por palabra clave sobre los 100 prompts de ajuste en el trial seleccionado, y una tasa de rechazo del 75,0% (729/972) sobre prompts daninos retenidos segun el juez WildGuard, frente al 77,6% del original. Estos numeros corresponden al modelo en bf16 y no a los ficheros GGUF publicados.

La conversion a GGUF se realizo con llama.cpp (commit 468fde9): convert_hf_to_gguf.py con outtype bf16 y posterior llama-quantize en CPU, verificando cada fichero de pesos contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la matriz de importancia generada con calibration_datav3 (128 fragmentos de 512 tokens) sobre el build Q8_0; Q6_K y Q8_0 son estaticas.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-14B-Instruct.
- Razonamiento y resolucion de problemas de complejidad media, con capacidad de seguir instrucciones detalladas.
- Generacion y explicacion de codigo, reforzada por el uso de direcciones de rechazo derivadas de codigo en el proceso de abliteration.
- Reduccion del comportamiento de rechazo: el modelo cumple muchas peticiones que el original rechaza, lo que lo hace util para estudiar refusal y sus defensas.
- Soporte de plantilla de chat conversacional (pipeline text-generation, tag conversational).
- Compatibilidad con tool calling y function calling: no confirmado en la informacion proporcionada para esta variante; depende de la plantilla y del runner.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion proporcionada.
- Capacidades multilingues: los metadatos declaran solo ingles; no se confirma soporte de otros idiomas en esta variante.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteration: comparar la tasa de rechazo del modelo GGUF con la del bf16 y con otras herramientas (Heretic 2.0, OBLITERATUS) para validar si la cuantizacion altera el comportamiento de rechazo. Es el uso declarado por el autor.
- Evaluacion de defensas frente a refusal removal: usar el modelo como atacante controlado en pipelines de red teaming para medir la robustez de clasificadores de seguridad y jueces automaticos como WildGuard.
- Estudio de degradacion por cuantizacion: comparar Q4_K_M (9,0 GB) y Q8_0 (15,7 GB) sobre el mismo conjunto de prompts para cuantificar la deriva en calidad y en tasas de rechazo.
- Despliegue local en estaciones de trabajo: con Q4_K_M cabe en GPUs de consumo de 12-16 GB y permite experimentar con un modelo de 14B sin infraestructura dedicada.
- Generacion de codigo en entornos de investigacion: el sesgo hacia dominios de codigo en las direcciones de ablacion lo hace adecuado para tareas de programacion donde se quiere evitar rechazos espurios, siempre con revision humana.
- Reproducibilidad de resultados academicos: al publicarse sumas SHA-256 y el commit exacto de llama.cpp, sirve para replicar experimentos del paper de Young sobre seleccion de trials y metricas KL.
- Analisis de sesgos y seguridad: al ser un modelo con rechazo reducido, es util para estudiar que tipos de contenido genera y como varian sus respuestas respecto al original en dominios sensibles.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del paper, medidos sobre el modelo en bf16 (no sobre los GGUF):

| Metrica | Original (Qwen2.5-14B-Instruct) | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 77,6% | 75,0% (729/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 49 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no disponible | 0,0047 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni para el modelo base ni para esta variante. Tampoco se han evaluado los ficheros GGUF en el paper.

## Requisitos de hardware

- VRAM estimada para Q4_K_M (9,0 GB de fichero): aproximadamente 10-11 GB incluyendo overhead de contexto y KV cache.
- VRAM estimada para Q8_0 (15,7 GB de fichero): aproximadamente 17-18 GB en inferencia.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q8_0; RTX 4070 Ti / 4080 (12-16 GB) para Q4_K_M; A100 o H100 para despliegues concurrentes con contexto largo.
- Cabe en GPU de consumo: si, Q4_K_M en tarjetas de 12 GB o mas; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (tag por defecto Q4_K_M y tags por tamano como :Q8_0), y cualquier runner compatible con GGUF. vLLM y TGI no se mencionan en la informacion proporcionada para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct (original) | 14,77B | no disponible en la informacion | Apache 2.0 | safetensors, GGUF oficiales | Modelo de referencia; rechazo del 77,6% en el conjunto evaluado |
| richardyoung/Qwen2.5-14B-Instruct-heretic1x-code | 14,77B | no disponible | Apache 2.0 | safetensors | Version bf16 evaluada en el paper; base de esta publicacion |
| Esta variante (GGUF) | 14,77B | no disponible | Apache 2.0 | GGUF | Q4_K_M y Q8_0; no evaluada en el paper |
| Heretic 2.0 / OBLITERATUS sobre Qwen2.5 | no disponible | no disponible | no disponible | no disponible | Mencionados como comparadores en el paper de Young; sin datos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada mas alla de las tasas de rechazo del modelo bf16.

## Limitaciones y advertencias

- Modelo de investigacion, no un asistente generalista: el autor lo publica para estudiar abliteration y sus defensas, no para uso productivo directo.
- La cuantizacion puede alterar el comportamiento de rechazo: los ficheros GGUF no fueron evaluados en el paper y sus tasas de rechazo pueden diferir del 75,0% reportado en bf16.
- Riesgo de contenido danino: al eliminar parte del comportamiento de rechazo, el modelo puede generar respuestas que el original bloquearia; el usuario es responsable del uso licito.
- Riesgo de alucinacion: inherente a los modelos de 14B; no se han publicado evaluaciones especificas de factualidad para esta variante.
- Idiomas: los metadatos declaran solo ingles; el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse respecto al original.
- Contexto: la longitud de contexto no se confirma en la informacion proporcionada; conviene verificar la configuracion del modelo base antes de desplegarlo con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las restricciones de uso del modelo fuente; el autor remite a la model card de origen.
- Trazabilidad: el paper citado aun no tiene enlace de arXiv publicado en la informacion disponible, lo que limita la verificacion independiente de las metricas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-code-GGUF
- Modelo base en safetensors: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-code
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Paper citado (Young, 2026): enlace de arXiv pendiente de publicacion, no disponible
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Heretic (herramienta de abliteration): no disponible en la informacion proporcionada
