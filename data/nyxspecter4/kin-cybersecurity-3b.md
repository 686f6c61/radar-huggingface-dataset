# nyxspecter4/kin-cybersecurity-3b

## Resumen

KIN 3B (Research Edition) es un ajuste fino supervisado de Qwen2.5-3B-Instruct desarrollado por nyxspecter4 (Kinetigor) y orientado a la verificacion de afirmaciones de seguridad. No es un modelo de explotacion ni un solucionador de CTF: su funcion es transformar una alegacion de seguridad (un diff de PR, un comentario de revision, una traza de agente o un informe de bug bounty) en un informe estructurado de cinco campos: la afirmacion, el radio de impacto, el mecanismo subyacente, un procedimiento de comprobacion reproducible y un nivel de confianza con la evidencia que lo refutaria.

Arquitectura transformer decoder-only de Qwen2 (3.089.625.088 parametros), con pesos fusionados tras un LoRA de rango 8 sobre las proyecciones q/k/v/o. El modelo es monolingue en ingles y esta pensado para ventanas de contexto cortas; la demo oficial funciona con 2.048 tokens. Su interes practico reside en la disciplina de calibracion: el entrenamiento contrasta informes con comprobacion reproducible frente a presentaciones vagas, de modo que el modelo tiende a declarar la ausencia de verificacion en lugar de sonar seguro.

La relevancia actual es doble. Por un lado, ofrece un patron de evaluacion poco habitual (55 items congelados, correccion determinista sin juez LLM, verificacion de solapamiento cero con el entrenamiento) y publica resultados adversos para el propio modelo: 23/55 (41,8%) y un rendimiento inferior al de su modelo base en un arnes interno de 6 informes (40/60 frente a 47/60). Por otro, su licencia Qwen Research es estrictamente no comercial, lo que limita su uso a investigacion y docencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.089.625.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada en la model card; la demo oficial opera con 2.048 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF disponible en repo separado); pesos completos en safetensors |
| Idiomas soportados | Ingles (en) |
| Licencia | Qwen Research License (no comercial) |
| Formato de pesos | safetensors (2 shards, ~6,2 GB), adaptador LoRA y GGUF Q4_K_M en el mismo repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,09 mil millones de parametros. El ajuste se realizo mediante LoRA supervisado con rango 8, alpha 16, dropout 0,1 y adaptadores sobre las proyecciones q, k, v y o, posteriormente fusionados en los pesos completos. No se documenta el numero de tokens de entrenamiento ni la composicion exacta del corpus.

Los datos corresponden a la primera generacion del corpus KIN de informes de seguridad, construido para contrastar un informe estructurado con comprobacion reproducible frente a una presentacion vaga. El objetivo declarado es ensenar la estructura de cinco campos y la disciplina de calibracion ("sin comprobacion reproducible, sin confianza alta"). No se menciona RLHF ni DPO en estos pesos: el conjunto DPO/SFT de segunda generacion (kin-cyber-dpo-v2) se publica por separado y es posterior a estos pesos. No se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional con plantilla de chat compatible con transformers y text-generation-inference.
- Estructuracion de alegaciones de seguridad en un informe de cinco campos (claim, blast radius, why, how to check, confidence).
- Identificacion de clases de vulnerabilidad por CWE, con precision limitada (7/16 en la evaluacion publicada).
- Triage de informes: separar alegaciones que incluyen una comprobacion reproducible de las que no.
- Disciplina de alcance y rechazo: 4/6 en la categoria de refusal/scope del conjunto de evaluacion.
- Reconocimiento de formato de flag (4/4) y de magic bytes en analisis forense basico (3/4).
- Sugerencia del siguiente comando en un flujo de trabajo (3/4).
- No soporta tool calling nativo, agentes multi-paso, vision, audio ni modo thinking extendido; no se documenta ninguna de estas capacidades.
- Multilingue: solo ingles.

## Casos de uso

- Revision de pull requests en CI: el modelo recibe el diff y devuelve un informe con el mecanismo probable (CWE, invariante roto) y una prueba o comando que el revisor puede ejecutar antes de aprobar el merge. Es adecuado porque su salida esta disenada para ser accionable, no para dar un veredicto.
- Triage de informes de bug bounty: se introduce el informe y el modelo separa las alegaciones acompanadas de PoC reproducible de las que no, priorizando la cola de revision humana.
- Auditoria de trazas de agentes: dado un registro de acciones de un agente autonomo, el modelo senala que invariantes de seguridad podrian haberse roto y propone una comprobacion replayable sobre el entorno.
- Formacion y docencia en escritura de seguridad: sirve como ejemplo de calibracion y de estructura de informe; util en cursos donde se ensena a distinguir una hipotesis de una verificacion.
- Pre-filtro en pipelines de analisis estatico: combinado con SAST, el modelo aporta la capa de explicacion y de comprobacion propuesta, mientras la herramienta aporta la deteccion determinista.
- Documentacion de hallazgos internos: convertir notas dispersas de revision en un informe de cinco campos homogeneo para el registro de seguridad de la organizacion.
- Presion sobre afirmaciones de terceros: evaluar comunicados o avisos de vulnerabilidad comprobando si el modelo puede proponer una verificacion concreta o si la afirmacion queda sin respaldo.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto congelado de 55 items de habilidad CTF con respuestas conocidas, correccion determinista (coincidencia exacta, regex o patron de rechazo), sin juez LLM y con verificacion de solapamiento cero respecto a los ficheros de entrenamiento. Condiciones: GGUF Q4_K_M servido en el Space kin-cybersec, temperatura 0,3, limite de 384 tokens, una ejecucion completa en noviembre de 2026.

| Categoria | Puntuacion |
|---|---|
| Decode (ROT13, Caesar, base64, hex, binario, Atbash, JWT, comentario PNG) | 0/17 |
| Clase de vulnerabilidad (identificacion CWE) | 7/16 |
| Rechazo / disciplina de alcance | 4/6 |
| Formato de flag | 4/4 |
| Identificacion de hash | 2/4 |
| Forense (magic bytes) | 3/4 |
| Siguiente comando | 3/4 |
| **Total** | **23/55 (41,8%)** |

Comparacion interna adicional (12 de octubre de 2026) sobre un arnes separado de 6 informes de verificacion: Qwen2.5-3B-Instruct base obtuvo 47/60 y KIN 40/60. El autor publica el dato tal cual, reconociendo que el modelo base fue superior en ese arnes. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en pesos completos (safetensors, ~6,2 GB en dos shards): aproximadamente 7-8 GB en fp16, mas overhead de activaciones y cache KV.
- VRAM estimada con GGUF Q4_K_M: en torno a 2-2,5 GB, apta para equipos con GPU modesta.
- GPU recomendadas: A100 o H100 para despliegue en produccion con concurrencia; RTX 4090 o RTX 3090 para desarrollo y evaluacion; cualquier GPU consumer con 8 GB o mas para fp16 en una sola peticion.
- Cabe en GPU consumer: si, tanto en fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) como en Q4_K_M (GTX 1650 4 GB en adelante, con margen).
- Opciones de despliegue: transformers (pipeline con device_map="auto"), text-generation-inference (tag endpoints_compatible), llama.cpp y Ollama mediante el repo GGUF (`ollama run hf.co/nyxspecter4/kin-cybersecurity-3b-gguf:Q4_K_M`), vLLM como opcion no documentada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada. La configuracion recomendada es temperatura 0,3 y un limite de 384 tokens en la evaluacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KIN 3B (Research Edition) | 3,09 B | no especificado (demo a 2.048) | Verificacion de alegaciones de seguridad | Qwen Research (no comercial) | HF, GGUF, Space |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 tokens (segun especificacion de Qwen) | Instrucciones generales | Apache 2.0 (segun Qwen) | HF |
| Qwen2.5-Coder-3B-Instruct | ~3 B | 32.768 tokens (segun especificacion de Qwen) | Codigo y revision | Apache 2.0 (segun Qwen) | HF |

La comparacion directa publicada por el autor sitúa al modelo base por delante en el arnes interno de 6 informes (47/60 frente a 40/60). Frente a Qwen2.5-Coder-3B-Instruct no hay datos comparativos en la informacion disponible; ese modelo esta orientado a generacion y revision de codigo, no a la estructura de informe de cinco campos. KIN se diferencia por la licencia restrictiva y por el formato de salida calibrado, no por rendimiento bruto.

## Limitaciones y advertencias

- Puede afirmar con seguridad clases CWE, tipos de hash y tipos de fichero incorrectos; toda respuesta debe tratarse como hipotesis hasta ejecutar la comprobacion propuesta.
- No decodifica ni transforma datos de forma fiable: 0/17 en la categoria de decode. Puede inventar flags, numeros CVE y nombres de herramientas plausibles pero falsos.
- La estructura de cinco campos es comportamiento aprendido, no impuesta por el decodificador; la calidad depende de la cantidad de senal presente en la entrada.
- Solo ingles. Uso de contexto corto: la demo oficial opera con 2.048 tokens y no se especifica la ventana nativa del modelo ajustado.
- Licencia Qwen Research: uso estrictamente no comercial. Cualquier despliegue en producto o servicio requiere otra licencia.
- Fuera de alcance segun el autor: resolver retos CTF, descifrar datos, producir flags y emitir veredictos autoritativos de vulnerabilidad sin revision humana.
- El modelo fue superado por su base en el arnes interno de 6 informes, lo que sugiere que el ajuste puede degradar capacidades generales en favor de la estructura de salida.
- No se documentan sesgos especificos; al ser un ajuste sobre Qwen2.5 en ingles, hereda los sesgos del corpus original, no evaluados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nyxspecter4/kin-cybersecurity-3b
- Repo GGUF: https://huggingface.co/nyxspecter4/kin-cybersecurity-3b-gguf
- Dataset DPO/SFT v2: https://huggingface.co/datasets/nyxspecter4/kin-cyber-dpo-v2
- Demo en el navegador (Space): https://huggingface.co/spaces/nyxspecter4/kin-cybersec
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
