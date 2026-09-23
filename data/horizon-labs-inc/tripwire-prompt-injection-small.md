# Horizon-Labs-Inc/tripwire-prompt-injection-small

## Resumen

Tripwire small es un clasificador de texto de 140.642.306 parametros (141M) disenado para detectar ataques de *prompt injection* y *jailbreak* en cualquier texto que entre o salga de un sistema basado en LLM: prompts de usuario, documentos recuperados por RAG, correos electronicos, paginas web y, de forma destacada, salidas de herramientas y funciones. Lo desarrolla Horizon-Labs-Inc y se distribuye con licencia Apache 2.0 en HuggingFace, con pipeline `text-classification` y soporte para `transformers`, ONNX y `transformers.js`.

El modelo es un fine-tuning de `jhu-clsp/mmBERT-small`, un encoder de arquitectura ModernBERT con 8.192 tokens de ventana de contexto y cobertura de mas de 1.800 idiomas. Frente a los detectores abiertos mas usados, que suelen limitarse al ingles y a 512 tokens, Tripwire apunta explicitamente a dos problemas: la longitud de las entradas en pipelines agénticos (resultados de herramientas, correos largos, paginas completas) y la tasa de falsos positivos sobre contenido benigno multilingue que simplemente *suena* a instrucciones.

Su relevancia actual viene del despliegue masivo de agentes con acceso a herramientas externas, donde la inyeccion indirecta (instrucciones maliciosas escondidas en el resultado de una busqueda web o en un correo) es un vector realista. El modelo se ofrece en dos tamanos —small (141M) y base (308M)—, con resultados publicados por el autor en conjuntos held-out multilingues, BIPIA, LLMail-Inject y OR-Bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base `jhu-clsp/mmBERT-small` |
| Parametros totales | 140.642.306 (141M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | ONNX fp32 publicado; el autor no publica int8 (indica que la cuantizacion dinamica int8 distorsiona las puntuaciones de esta arquitectura) |
| Idiomas soportados | Multilingue; etiquetados: en, zh, es, fr, de, ja, ko, pt, ru, ar, hi, it, nl, tr, pl, vi, id, th, uk, fa, he, sv, cs, bn, sw (el modelo base cubre mas de 1.800 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (`onnx/model.onnx`, fp32) |
| Tarea | Clasificacion de texto binaria: `injection` (1) / `benign` (0) |
| Umbral de referencia | 0,5 (usado en los resultados publicados) |
| Tamano del repositorio | 1,3 GB |
| Libreria | transformers (tambien onnxruntime, optimum, transformers.js; compatible con text-embeddings-inference y endpoints) |
| Fecha de publicacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

Tripwire small es un clasificador de secuencia construido sobre mmBERT-small, un encoder de la familia ModernBERT. ModernBERT introduce mejoras sobre el transformer encoder clasico: atencion con RoPE, alternancia de capas de atencion local y global, y preentrenamiento con relleno de secuencias sin mascara, lo que permite procesar secuencias largas (8.192 tokens en este caso) con mayor eficiencia que los encoders basados en BERT clasico, habitualmente limitados a 512 tokens. El modelo base mmBERT esta entrenado de forma multilingue y cubre mas de 1.800 idiomas.

El ajuste se ha realizado sobre una mezcla amplia de conjuntos de datos de seguridad y de instrucciones generales. Los conjuntos declarados en la model card son: `neuralchemy/Prompt-injection-dataset`, `S-Labs/prompt-injection-dataset`, `yanismiraoui/prompt_injections`, `Lakera/gandalf_ignore_instructions`, `reshabhs/SPML_Chatbot_Prompt_Injection`, `TrustAIRLab/in-the-wild-jailbreak-prompts`, `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`, `microsoft/llmail-inject-challenge`, `rgeada/tool-response-injections`, `3nesdeniz/agentic-prompt-injection-boundary-pairs`, `3nesdeniz/guardrail-hard-negatives`, `OpenAssistant/oasst2`, `CohereLabs/aya_dataset`, `CohereLabs/aya_redteaming`, `databricks/databricks-dolly-15k` y `bench-llm/or-bench`. La inclusion de conjuntos de correo (LLMail-Inject), de respuestas de herramientas y de negativos duros de guardrail refleja un diseno orientado a la inyeccion indirecta y a la reduccion de falsos positivos; `aya_dataset`, `aya_redteaming` y `or-bench` aportan evaluacion multilingue y control de sobrerrechazo, respectivamente.

La definicion de etiqueta es deliberadamente estricta: se marca como `injection` solo el texto que intenta anular, secuestrar o extender las instrucciones de un sistema, o eludir sus salvaguardas (inyeccion directa, inyeccion indirecta en documentos, correos o salidas de herramientas, extraccion de system prompt, jailbreaks tipo role-play o DAN y variantes ofuscadas o codificadas). Se marca como `benign` el resto, incluidos documentos con instrucciones legitimas ("reenvia el contrato a legal"), discusiones de seguridad y peticiones daninas que no emplean ninguna tecnica de ataque. El repositorio incluye `tripwire_scan.py`, un script de unas 40 lineas sin dependencias adicionales que puntua textos de cualquier longitud con ventanas solapadas de 8k y toma el maximo, y que puede envolver funciones de herramienta para que un resultado envenenado no llegue al contexto del agente.

## Capacidades

- Clasificacion binaria de inyeccion de prompt y jailbreak en texto de entrada, con salida de etiqueta y puntuacion de probabilidad.
- Detecta inyeccion directa ("ignore previous instructions..."), inyeccion indirecta en documentos, correos y salidas de herramientas, extraccion de system prompt, jailbreaks de role-play o estilo DAN y variantes ofuscadas o codificadas.
- Contexto de 8.192 tokens por pasada; para entradas mayores, puntuacion por ventanas solapadas de 8k tomando el maximo.
- Multilingue: entrenado y evaluado en 12 idiomas en el conjunto held-out multilingue y 7 idiomas en la prueba con prompts humanos benignos de Aya.
- Baja tasa de falsos positivos sobre contenido benigno: 0,0% en prompts humanos benignos (7 idiomas, Aya test), 0,0% en el conjunto de falsos positivos de correos benignos de LLMail-Inject y 2,0% en prompts de sobrerrechazo de OR-Bench-hard.
- Integrable como guardrail en pipelines de agentes: el script `tripwire_scan.py` envuelve funciones de herramienta y devuelve un marcador de posicion en lugar del resultado inyectado.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no tiene modo "thinking", vision o audio. Su funcion es exclusivamente de filtrado y clasificacion.

## Casos de uso

- Proteccion de agentes con herramientas: envolver con `guarded()` funciones como busqueda web, lectura de correo o llamadas a API para que un resultado con instrucciones maliciosas no llegue nunca al contexto del agente; el modelo puntua el resultado completo con ventanas de 8k.
- Filtrado de RAG y documentos recuperados: antes de insertar pasajes recuperados en el prompt del LLM, puntuarlos con Tripwire; los documentos largos se analizan por ventanas solapadas de 8.192 tokens y se rechazan si alguna supera el umbral.
- Seguridad del correo entrante en flujos asistidos por IA: deteccion de inyeccion en el cuerpo de correos (99,8% de tasa de deteccion en LLMail-Inject fase 2, con 0,0% de falsos positivos en el conjunto de correos benignos), adecuado para asistentes que leen y resumen bandejas de entrada.
- Moderacion de entradas de usuario en aplicaciones multilingues: cobertura de mas de 25 idiomas etiquetados y 0,0% de falsos positivos en prompts humanos benignos, lo que permite aplicarlo sin degradar la experiencia de usuarios que escriben en idiomas distintos del ingles.
- Defensa de pipelines de agentes multi-herramienta en produccion: integracion como paso previo de validacion en el orquestador, con umbral ajustable (0,5 en la configuracion de referencia) para equilibrar deteccion y sobrerrechazo.
- Analisis forense y triaje de incidentes: puntuar lotes historicos de prompts, correos o paginas para identificar intentos de inyeccion ya registrados y reconstruir cadenas de ataque.
- Evaluacion de la robustez de un sistema propio: usar el clasificador como referencia para medir si un cambio de prompt de sistema o de modelo aumenta la superficie de exposicion a inyeccion.
- Despliegue en el navegador o en el borde: la distribucion ONNX fp32 y el soporte de `transformers.js` permiten filtrar contenido en cliente sin enviar los textos a un servidor.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, a umbral 0,5. El mejor valor de cada fila aparece en negrita en la fuente original; aqui se reproduce la tabla completa.

| Metrica (conjunto) | Tripwire-small (este modelo) | Tripwire-base | protectai deberta-v3-base v2 | semantic-router mmbert32k | deepset deberta-v3-base | testsavant defender-small |
|---|---|---|---|---|---|---|
| Multilingue held-out, 12 idiomas (AUC) | 0,955 | 0,968 | 0,796 | 0,682 | 0,741 | 0,595 |
| Multilingue held-out: tasa de falsos positivos | 2,2% | 1,3% | 26,4% | 3,8% | 72,7% | 58,9% |
| Prompts humanos benignos, 7 idiomas (Aya test): FPR | 0,0% | 0,0% | 40,0% | 2,3% | 57,7% | 52,1% |
| Inyeccion indirecta en documentos (BIPIA): AUC | 0,815 | 0,764 | 0,438 | 0,533 | 0,540 | 0,517 |
| Inyeccion en correo (LLMail-Inject fase 2): tasa de deteccion | 99,8% | 98,4% | 41,3% | 5,4% | 100,0% | 25,7% |
| Correos benignos (conjunto FP de LLMail-Inject): FPR | 0,0% | 0,0% | 0,0% | 0,0% | 100,0% | 0,0% |
| Prompts de sobrerrechazo (OR-Bench-hard): FPR | 2,0% | 3,7% | 6,5% | 28,3% | 19,7% | 69,1% |
| Ventana de contexto (tokens) | 8.192 | 8.192 | 512 | 8.192 | 512 | 512 |
| Parametros | 141M | 308M | 184M | 308M | 184M | 29M |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas en la informacion disponible, algo esperable al tratarse de un clasificador y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,60 GB en fp32 (141M parametros x 4 bytes) y unos 0,30 GB en fp16/bf16. Son estimaciones derivadas del numero de parametros; el repositorio ocupado es de 1,3 GB por incluir pesos PyTorch y ONNX.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en GPUs de portatil con 4 GB o mas. Tambien es viable en CPU para cargas moderadas, dado el tamano del modelo.
- GPU recomendadas para servicio de alto volumen: cualquier GPU moderna con suficiente memoria para lotes grandes (A100, H100, L40S, RTX 4090); el cuello de botella en produccion sera el throughput por lote, no la memoria.
- Opciones de despliegue: `transformers` (`pipeline("text-classification")`), ONNX Runtime, `optimum`, `transformers.js` para el navegador, text-embeddings-inference y endpoints compatibles (asi etiquetado por el autor).
- Limitacion practica de despliegue: el autor no publica pesos int8 intencionadamente, alegando que la cuantizacion dinamica int8 distorsiona las puntuaciones de esta arquitectura. No hay por tanto un camino oficial de cuantizacion a 8 bits.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multilingue held-out (AUC) | FPR multilingue | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tripwire-small (este modelo) | 141M | 8.192 | 0,955 | 2,2% | Apache 2.0 | HuggingFace, ONNX fp32 |
| Tripwire-base | 308M | 8.192 | 0,968 | 1,3% | no disponible | HuggingFace |
| protectai deberta-v3-base v2 | 184M | 512 | 0,796 | 26,4% | no disponible | HuggingFace |
| semantic-router mmbert32k | 308M | 8.192 | 0,682 | 3,8% | no disponible | HuggingFace |
| deepset deberta-v3-base | 184M | 512 | 0,741 | 72,7% | no disponible | HuggingFace |
| testsavant defender-small | 29M | 512 | 0,595 | 58,9% | no disponible | HuggingFace |

Frente a las alternativas de 512 tokens (protectai, deepset, testsavant), la ventaja principal es la combinacion de contexto de 8.192 tokens y tasas de falsos positivos muy inferiores en contenido multilingue y benigno. Frente a semantic-router mmbert32k, que comparte ventana de contexto y modelo base multilingue, Tripwire-small obtiene mejor AUC multilingue (0,955 frente a 0,682) y mejor AUC en inyeccion indirecta en documentos BIPIA (0,815 frente a 0,533). La variante base del mismo autor mejora el AUC multilingue y el FPR, a costa de duplicar aproximadamente el numero de parametros; Tripwire-small es mejor en deteccion de inyeccion en correo (99,8% frente a 98,4%), en BIPIA (0,815 frente a 0,764) y en sobrerrechazo (2,0% frente a 3,7%). En deteccion de correo, deepset deberta-v3-base alcanza el 100,0% pero con un 100,0% de falsos positivos en correos benignos, lo que lo inutiliza en ese escenario.

## Limitaciones y advertencias

- Es un clasificador binario, no un modelo generativo: no responde preguntas ni ejecuta tareas; solo asigna `injection` o `benign` con una puntuacion.
- La deteccion no es perfecta: el AUC en inyeccion indirecta en documentos (BIPIA) es 0,815, el punto mas debil de la tabla publicada, lo que implica falsos negativos en ataques indirectos sutilmente integrados en documentos.
- El umbral recomendado es 0,5, pero es un parametro a calibrar por caso de uso; subirlo reduce falsos positivos y baja la deteccion, y viceversa.
- La definicion de etiqueta excluye explicitamente las peticiones daninas que no emplean tecnicas de ataque ("como forzar una cerradura"): el modelo no es un moderador de contenido danino generico y no debe usarse como tal.
- Para entradas de mas de 8.192 tokens hay que puntuar ventanas solapadas y tomar el maximo; una implementacion ingenua con truncado simple puede perder ataques situados al final del texto.
- No se publican pesos cuantizados int8 y el autor advierte de que la cuantizacion dinamica int8 distorsiona las puntuaciones; cualquier cuantizacion propia exige recalibrar el umbral y validar con datos propios.
- El rendimiento se ha medido en conjuntos held-out del propio autor; no hay validacion independiente publicada, y el modelo tiene un volumen de descargas muy bajo (38) y ninguna valoracion en HuggingFace, lo que reduce la evidencia de uso en produccion.
- Riesgo de deriva si el modelo se usa con plantillas de chat, formatos de herramienta o idiomas no representados en el entrenamiento; conviene validar con datos propios antes de desplegarlo.
- Aunque la licencia es Apache 2.0, que permite uso comercial, conviene revisar las licencias de los conjuntos de datos de entrenamiento si se va a redistribuir el modelo o sus derivados.
- La model card usa el identificador `Horizon-Labs/tripwire-prompt-injection-small` en los ejemplos de codigo, mientras que el repositorio publicado esta bajo el espacio `Horizon-Labs-Inc`; verificar el nombre correcto antes de integrar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs-Inc/tripwire-prompt-injection-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Variante base de Tripwire: https://huggingface.co/Horizon-Labs/tripwire-prompt-injection-base
- Demo Space: https://huggingface.co/spaces/Horizon-Labs/tripwire-demo
- Script de escaneo incluido en el repositorio: `tripwire_scan.py` (descargable con `hf_hub_download` desde el propio repositorio)
- Peso ONNX fp32: `onnx/model.onnx` dentro del repositorio

Nota: la busqueda web realizada no ha devuelto resultados relacionados con este modelo. Los resultados obtenidos corresponden a entidades no relacionadas (el partido politico frances Horizons, la radio Horizon, la plataforma Meta Horizon y un hilo de Hacker News sobre un incidente de seguridad), por lo que no se incluyen como enlaces.

- No se han encontrado papers, blogs tecnicos ni repositorios adicionales del autor en la informacion disponible.
