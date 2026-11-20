# nyxspecter4/kin-sft-lora

## Resumen

KIN 3B, Research Edition, es un ajuste fino supervisado (LoRA fusionado) de Qwen2.5-3B-Instruct desarrollado por nyxspecter4 (Kinetigor) y orientado a la verificacion de afirmaciones de seguridad. El modelo no pretende resolver retos ni emitir veredictos de vulnerabilidad: su tarea es transformar una afirmacion de seguridad (un diff de PR, un comentario de revision, una traza de agente o un informe de bug bounty) en un brief estructurado de cinco campos: claim, blast radius, why, how to check it y confidence. La premisa de diseno es explicita: sin una comprobacion reproducible, el modelo debe decirlo en lugar de sonar seguro.

Tecnicamente es un transformer decoder-only de 3.089.625.088 parametros (3B) con pesos completos fusionados a partir de un adaptador LoRA de rango 8 sobre proyecciones q/k/v/o. El repositorio incluye los safetensors fusionados (dos shards, unos 6,2 GB), el adaptador LoRA original y una cuantizacion Q4_K_M en GGUF, lo que permite despliegue tanto en transformers como en llama.cpp u Ollama. El contexto practico documentado es corto: la demo oficial ejecuta una ventana de 2.048 tokens.

Su relevancia actual es doble. Por un lado, ejemplifica un patron de ajuste fino muy concreto (calibracion y disciplina de alcance en dominios de seguridad) sobre un modelo pequeno y desplegable en portatil. Por otro, su model card publica resultados adversos con transparencia inusual: 23/55 en un set de evaluacion de habilidades CTF y un rendimiento inferior al modelo base en un harness interno de verificacion (40/60 frente a 47/60). Es, por tanto, un caso de estudio sobre evaluacion honesta tanto como un modelo utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino LoRA fusionado |
| Parametros totales | 3.089.625.088 (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en la demo oficial; contexto nativo del base no especificado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF publicado); otras cuantizaciones GGUF via llama.cpp no confirmadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Qwen Research License (no comercial); license_name: qwen-research |
| Formato de pesos | safetensors (2 shards, ~6,2 GB), adaptador LoRA y GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3B parametros. Sobre el se aplico un ajuste fino supervisado con LoRA de rango 8, alpha 16 y dropout 0.1, restringido a las proyecciones q/k/v/o, con posterior fusion de los pesos del adaptador en los pesos completos. No se documenta entrenamiento por refuerzo ni DPO en estos pesos: la model card indica explicitamente que el corpus sucesor curado con DPO y SFT (kin-cyber-dpo-v2) es posterior y que estos pesos lo preceden.

Los datos de entrenamiento corresponden a la primera generacion del corpus KIN de briefs de seguridad, construido para contrastar un brief estructurado acompanado de una comprobacion reproducible frente a una presentacion vaga del mismo hallazgo. No se especifican el numero de tokens, la composicion exacta del dataset ni la mezcla de datos generales. La innovacion tecnica no esta en la arquitectura, sino en el formato de salida impuesto por el entrenamiento: cinco campos fijos y una regla de calibracion ("sin comprobacion reproducible, no hay confianza alta") que el modelo aprende como comportamiento, no como restriccion impuesta en inferencia.

## Capacidades

- Generacion de texto conversacional en ingles con formato de brief de seguridad de cinco campos (claim, blast radius, why, how to check it, confidence).
- Analisis de diffs de PR, comentarios de revision de codigo, trazas de agentes y informes de bug bounty para extraer la afirmacion subyacente y su mecanismo.
- Identificacion de clases de vulnerabilidad (CWE) a partir de descripciones, con precision limitada: 7/16 en la evaluacion publicada.
- Propuesta de comprobaciones reproducibles: comandos, tests que deberian fallar o esbozos de prueba de concepto.
- Disciplina de alcance y rechazo: capacidad parcial de declinar peticiones fuera de alcance (4/6 en el set de evaluacion).
- Reconocimiento de formato de flags (4/4) e identificacion de tipos de hash (2/4).
- Forensia basica por magic bytes de fichero (3/4) y sugerencia del siguiente comando en una secuencia de investigacion (3/4).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el modelo esta disenado para estructurar afirmaciones, no para ejecutar cadenas de acciones.
- Vision, audio y modo thinking explicito: no disponibles.

## Casos de uso

- Triaje de informes de bug bounty: el modelo recibe el texto del informe y devuelve un brief de cinco campos que separa las afirmaciones con comprobacion reproducible de las que no la tienen, lo que permite priorizar la cola de revision humana antes de asignar ingenieros.
- Revision de diffs en PRs de seguridad: dado un diff sospechoso (por ejemplo, la sustitucion de una comprobacion de allowlist por `if True:`), el modelo describe el blast radius y propone un test que deberia fallar, util como primer comentario automatizado en el pipeline de revision.
- Formacion y docencia en escritura de seguridad: sirve para comparar un brief bien estructurado frente a una presentacion vaga del mismo hallazgo, gracias al corpus de contraste con el que fue entrenado y a su tamano reducido, que permite ejecutarlo en el portatil de cada alumno.
- Estandarizacion de plantillas de reporte: integrado en una herramienta interna, normaliza las notas libres de un analista al formato de cinco campos, lo que facilita busquedas posteriores y auditoria de decisiones.
- Presion sobre hipotesis en pipelines de analisis estatico: los hallazgos de un SAST se envuelven como afirmaciones y el modelo propone como verificarlas; el analista ejecuta la comprobacion antes de aceptar el hallazgo, reduciendo falsos positivos tratados como reales.
- Investigacion sobre calibracion y disciplina de rechazo: al ser un ajuste fino de 3B con evaluacion determinista publicada y resultados adversos documentados, es un punto de partida reproducible para estudiar como el ajuste fino afecta a la calibracion frente al modelo base.
- Despliegue en entornos con recursos limitados: la cuantizacion Q4_K_M y la integracion con Ollama permiten ejecutarlo en un portatil para pruebas de concepto internas, sin GPU de datacenter.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre un conjunto congelado de 55 items de habilidades CTF con respuestas conocidas, correccion determinista (exact match, regex o patron de rechazo), sin juez LLM, con 0 solapamientos detectados con ficheros de entrenamiento. Condiciones: GGUF Q4_K_M servido por el Space oficial, temperatura 0.3, limite de 384 tokens, una ejecucion completa en noviembre de 2026.

| Categoria | Resultado |
|---|---|
| Decode (ROT13, Caesar, base64, hex, binario, Atbash, JWT, comentario PNG) | 0/17 |
| Clase de vulnerabilidad (identificacion CWE) | 7/16 |
| Rechazo / disciplina de alcance | 4/6 |
| Formato de flag | 4/4 |
| Identificacion de hash | 2/4 |
| Forensia (magic bytes) | 3/4 |
| Siguiente comando | 3/4 |
| **Total** | **23/55 (41,8%)** |

Comparacion interna adicional (12 de octubre de 2026) sobre un harness de verificacion distinto de 6 briefs y 60 puntos: Qwen2.5-3B-Instruct base obtuvo 47/60 y KIN 40/60. El autor publica el dato tal cual, reconociendo que el modelo base fue superior en ese harness.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 6,2 GB solo de pesos mas overhead de activaciones y cache KV, en torno a 7-8 GB en la practica; en Q4_K_M, aproximadamente 2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante); en Q4_K_M cabe en GPUs de 4 GB y en CPU.
- Cabe en consumer GPU: si, tanto en FP16 con 8 GB como en Q4_K_M en equipos modestos.
- Opciones de despliegue: transformers (pipeline con `device_map="auto"`), llama.cpp, Ollama (`ollama run hf.co/nyxspecter4/kin-cybersecurity-3b-gguf:Q4_K_M`), text-generation-inference (el repo declara `text-generation-inference` y `endpoints_compatible`), y el Space oficial para pruebas en navegador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Parametros de generacion recomendados por el autor: temperatura 0.3, max_new_tokens 512, `do_sample=True`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KIN 3B Research Edition | 3B | 2.048 tokens en demo | Brief de verificacion de seguridad | Qwen Research (no comercial) | HF: safetensors, LoRA, GGUF |
| Qwen2.5-3B-Instruct (base) | 3B | Contexto nativo de Qwen2.5 (no detallado aqui) | Asistente generalista | Qwen Research / Apache 2.0 segun variante | HF |
| kin-cybersecurity-3b-gguf | 3B | Igual que KIN | Mismo modelo en GGUF | Qwen Research (no comercial) | HF |
| kin-cyber-dpo-v2 | no aplica (dataset) | no aplica | Corpus SFT/DPO de briefs, licencia MIT | MIT | HF Datasets |

En el unico harness comparativo publicado, el modelo base Qwen2.5-3B-Instruct supero a KIN (47/60 frente a 40/60), lo que sugiere que el ajuste fino especializa el formato y la disciplina de alcance a costa de capacidad general. No se dispone de comparaciones con otros modelos especializados en seguridad en la informacion proporcionada.

## Limitaciones y advertencias

- Puede afirmar con seguridad clases CWE, tipos de hash y tipos de fichero incorrectos. Toda respuesta debe tratarse como hipotesis hasta ejecutar la comprobacion propuesta.
- No decodifica ni transforma datos de forma fiable: 0/17 en la categoria de decode. Puede inventar flags, numeros CVE o nombres de herramientas plausibles pero falsos.
- La estructura de cinco campos es comportamiento aprendido, no una restriccion impuesta; la calidad depende de la cantidad de senal presente en la entrada.
- Solo ingles. Uso de contexto corto (ventana de 2.048 tokens en la demo), lo que limita el analisis de diffs o trazas extensas.
- Licencia Qwen Research: uso no comercial. Cualquier uso comercial requiere atencion a los terminos del modelo base Qwen2.5-3B-Instruct.
- Fuera de alcance declarado: resolver retos CTF, descifrar o crackear datos, producir flags y emitir veredictos autoritativos de vulnerabilidad sin revision humana.
- En el harness interno de verificacion, el modelo base sin ajustar obtuvo mejor puntuacion que KIN; conviene validar el ajuste fino frente al base en el caso de uso concreto antes de adoptarlo.
- El modelo no esta disenado como agente autonomo: no hay soporte documentado de tool calling ni de razonamiento multi-paso verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nyxspecter4/kin-sft-lora
- Repo de pesos fusionados: https://huggingface.co/nyxspecter4/kin-cybersecurity-3b
- Version GGUF: https://huggingface.co/nyxspecter4/kin-cybersecurity-3b-gguf
- Dataset SFT/DPO sucesor: https://huggingface.co/datasets/nyxspecter4/kin-cyber-dpo-v2
- Demo en navegador: https://huggingface.co/spaces/nyxspecter4/kin-cybersec
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
