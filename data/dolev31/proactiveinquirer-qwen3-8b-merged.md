# dolev31/ProactiveInquirer-Qwen3-8B-Merged

## Resumen

ProactiveInquirer-Qwen3-8B-Merged es un ajuste fino de Qwen3-8B desarrollado por Ido Levy (IBM y Weizmann Institute of Science) junto a Asaf Yehudai, Segev Shlomov, Asaf Adi y Leshem Choshen, en el marco del trabajo *Asking for What Was Never Requested: Horizontal and Vertical Proactivity in Agents*. El modelo actúa como un "questioner" (formulador de preguntas) dentro de agentes proactivos: en lugar de responder directamente, decide qué preguntas de recuperación o clarificación conviene formular antes de contestar. Está pensado para tareas de información-seeking y multi-hop QA, donde la respuesta requiere componer datos de varias fuentes y descartar distractores.

Técnicamente es un transformer denso decoder-only de 8.190.735.360 parámetros, derivado de Qwen3-8B mediante un adaptador LoRA entrenado con DPO y posteriormente fusionado en los pesos base (merge en float32, almacenamiento en bfloat16). El resultado es un modelo de pesos completos que se carga sin PEFT y se sirve con vLLM, SGLang o TGI como cualquier Qwen3-8B. La salida no es texto libre, sino una acción JSON por paso: `{"action": "ASK", "question": ...}` o `{"action": "STOP", ...}`.

Su relevancia radica en que aborda un fallo habitual de los agentes conversacionales: pedir información que nunca se solicitó, o no pedirla cuando es imprescindible. El modelo cubre proactividad "horizontal" (preguntar más allá de lo pedido) y "vertical" (preguntar en el momento adecuado). Los datos de entrenamiento provienen de MuSiQue, StrategyQA y 2WikiMultihopQA, y el proyecto se publica bajo licencia Apache-2.0 con soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); adaptador LoRA fusionado en los pesos base |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card del autor; heredada de Qwen3-8B, cuyo informe tecnico declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | Pesos completos en bfloat16 (merge realizado en float32); existe un repositorio GGUF independiente para llama.cpp, Ollama y LM Studio, aunque los niveles concretos de cuantizacion no estan detallados en la informacion disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16); GGUF en repositorio separado |

## Arquitectura y entrenamiento

La base es Qwen3-8B, un transformer denso decoder-only con atencion causal y mecanismo de "thinking mode" conmutable. Sobre ese modelo se entreno un adaptador LoRA con DPO (Direct Preference Optimization) orientado a la formulacion de preguntas en entornos de recuperacion multi-hop, usando MuSiQue, StrategyQA y 2WikiMultihopQA como conjuntos de datos. El adaptador se fusiono en float32 sobre los pesos base y el resultado se almacena en bfloat16; esta es la semilla de entrenamiento 1, correspondiente al adaptador situado en la raiz del repositorio de adaptadores. Segun el autor, con decodificacion greedy el modelo reproduce caracter a caracter la salida del adaptador en el ejemplo de dos turnos publicado.

La innovacion principal no esta en la arquitectura, sino en la interfaz de salida y en el objetivo de entrenamiento: el modelo lee una plantilla de prompt (disponible en `prompts/`) y responde con una unica accion JSON por paso, ya sea `ASK` (con pregunta y justificacion) o `STOP`. El entrenamiento se realizo con el modo thinking de Qwen3 desactivado, y la model card recomienda mantenerlo apagado en inferencia (`enable_thinking: false`) para reproducir el comportamiento entrenado. El proyecto separa explicitamente proactividad horizontal y vertical, y el modelo se evalua en el marco del benchmark tau2-bench segun las etiquetas del repositorio, aunque no se publican cifras en la informacion disponible.

## Capacidades

- Generacion de acciones estructuradas en JSON: emite un objeto por paso con `{"action": "ASK", "question": ..., "rationale": ...}` o `{"action": "STOP", ...}`.
- Formulacion de preguntas de recuperacion (query generation) en entornos de acceso cerrado a un pool de documentos.
- Razonamiento multi-hop: el ejemplo de la model card muestra como descompone "quien era el conyuge del director de The Great Flamarion" en una primera pregunta sobre el director.
- Comportamiento de agente proactivo: decide cuando preguntar y cuando detenerse, en lugar de responder de inmediato.
- Gestion de distractores: el prompt de ejemplo indica explicitamente que varios parrafos del pool son irrelevantes.
- Integracion con pipelines de agentes: la salida JSON es consumible por un orquestador externo que ejecuta la recuperacion.
- Servicio estandar: compatible con text-generation-inference y endpoints, y desplegable con vLLM o SGLang sin necesidad de PEFT.
- Capacidades multilingues: limitadas a ingles segun la model card.
- No se documentan capacidades de vision, audio ni tool calling generico al estilo function calling de OpenAI; la unica interfaz de accion documentada es el esquema `ASK`/`STOP`.

## Casos de uso

- RAG multi-hop con preguntas de clarificacion: el modelo se coloca delante de un recuperador y genera la siguiente consulta de recuperacion a partir del estado actual (pregunta original, instrucciones, evidencia recuperada, borrador e historial), lo que encaja con pools de documentos donde la respuesta exige componer varios fragmentos.
- Agentes conversacionales que detectan informacion faltante: en lugar de responder con datos incompletos, el modelo emite una pregunta al usuario o al sistema antes de continuar, reduciendo respuestas especulativas en flujos de atencion al cliente o asistencia tecnica.
- Orquestacion de agentes en entornos tipo tau2-bench: sirve como modulo "questioner" de un agente mayor, decidiendo la siguiente accion de indagacion en tareas con herramientas y estado parcial.
- Generacion de turnos de indagacion para evaluacion: util para construir o ampliar conjuntos de datos de preguntas encadenadas sobre MuSiQue, StrategyQA o 2WikiMultihopQA, ya que su salida es JSON parseable y su justificacion es explicita.
- Investigacion academica sobre proactividad: el modelo implementa una separacion operativa entre proactividad horizontal y vertical, lo que permite comparar variantes de politica de preguntas en experimentos controlados.
- Descomposicion de consultas en buscadores internos: dado un pool cerrado de documentos, el modelo puede actuar como reformulador iterativo de consultas antes de delegar la respuesta final a otro modelo mayor.
- Preprocesado de pipelines de QA documental: como paso previo a un modelo de respuesta, reduce el numero de consultas irrelevantes al plantear primero la entidad intermedia necesaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del merge remite al repositorio del adaptador (`dolev31/ProactiveInquirer-Qwen3-8B`) para consultar los resultados, los detalles de entrenamiento y las limitaciones, pero no se incluyen cifras concretas en los datos proporcionados. El repositorio incluye la etiqueta `tau2-bench`, lo que sugiere evaluacion en ese entorno, sin que se detallen puntuaciones.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 16,4 GB solo de pesos (el repositorio ocupa 16,4 GB), mas el cache KV correspondiente al contexto utilizado.
- VRAM en cuantizacion: no disponible el detalle por nivel; el repositorio GGUF permite reducir la huella hasta rangos manejables en GPU de 8-12 GB, segun el nivel elegido.
- GPU recomendadas para precision completa: A100 40 GB, H100, L40S o A6000; tambien es viable en RTX 4090 (24 GB) con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion GGUF, en GPUs de 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, Apple Silicon con memoria unificada suficiente).
- Opciones de despliegue: vLLM, SGLang y TGI para el modelo completo (`vllm serve dolev31/ProactiveInquirer-Qwen3-8B-Merged`); llama.cpp, Ollama y LM Studio mediante el repositorio GGUF.
- Parametros de generacion recomendados por el autor: temperatura 0 (decodificacion greedy), `enable_thinking: false` y un maximo de 200 tokens nuevos por paso.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ProactiveInquirer-Qwen3-8B-Merged | 8,19 B | No especificado en su model card; heredado de Qwen3-8B (32.768 tokens, 131.072 con YaRN) | Apache-2.0 | Pesos completos safetensors + GGUF separado | Especializado en formulacion de preguntas para agentes; salida JSON ASK/STOP |
| Qwen3-8B (modelo base) | 8,19 B | 32.768 tokens nativos, 131.072 con YaRN | Apache-2.0 | safetensors, GGUF en la comunidad | Modelo generalista con thinking mode; no entrenado para proactividad de indagacion |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF en la comunidad | Alternativa generalista de tamano comparable; no existe una variante equivalente especializada en preguntas en la informacion disponible |
| Modelos comparables especificos de proactividad | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas directas en la informacion proporcionada |

Las cifras de Qwen3-8B y Llama 3.1 8B corresponden a datos publicos de sus respectivas documentaciones; el resto de celdas marcadas como no disponibles reflejan la ausencia de datos en la informacion suministrada.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y etiquetado unicamente para ingles; no hay evidencia de comportamiento fiable en castellano u otros idiomas.
- Formato de salida rigido: espera la plantilla de prompt exacta de `prompts/` y responde con JSON; desviarse de la plantilla o dejar el thinking mode activado puede degradar el comportamiento, ya que el entrenamiento se hizo con thinking desactivado.
- Sin datos de benchmarks publicos en la informacion disponible: no es posible estimar su calidad relativa frente al modelo base ni frente a alternativas.
- Riesgo de alucinacion heredado de Qwen3-8B: el modelo puede formular preguntas basadas en premisas falsas o inventar entidades en la pregunta de recuperacion.
- Sesgos: no se documentan analisis de sesgo especificos para este ajuste; se heredan los del modelo base y los de los datasets MuSiQue, StrategyQA y 2WikiMultihopQA.
- Ambito estrecho: es un modulo especializado de indagacion, no un asistente general; usarlo como modelo de proposito general no aprovecha su entrenamiento y probablemente rinda peor que Qwen3-8B sin ajustar.
- Adopcion minima: el repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.
- Sobreajuste al entorno de entrenamiento: el prompt de ejemplo asume un pool cerrado de 20 parrafos con distractores; su comportamiento en recuperacion abierta sobre web o bases de datos grandes no esta documentado.
- Licencia: Apache-2.0, permisiva para uso comercial, con las obligaciones habituales de atribucion y conservacion de avisos; conviene verificar la licencia del modelo base Qwen3-8B, tambien Apache-2.0.
- Contexto no confirmado en la model card: aunque el modelo base soporta ventanas largas, el autor no especifica la longitud de contexto efectiva tras el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dolev31/ProactiveInquirer-Qwen3-8B-Merged
- Repositorio del adaptador con resultados y detalles de entrenamiento: https://huggingface.co/dolev31/ProactiveInquirer-Qwen3-8B
- Version cuantizada GGUF: https://huggingface.co/dolev31/ProactiveInquirer-Qwen3-8B-GGUF
- Pagina del proyecto: https://dolev31.github.io/ProactiveInquirer/
- Codigo en GitHub: https://github.com/dolev31/ProactiveInquirer
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
- Qwen3 Technical Report (HTML): https://arxiv.org/html/2505.09388v1
- Dataset MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Dataset StrategyQA: https://huggingface.co/datasets/ChilleD/StrategyQA
- Dataset 2WikiMultihopQA: https://huggingface.co/datasets/xanhho/2WikiMultihopQA
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Perfil del autor (Google Scholar): https://scholar.google.com/citations?user=Ok_7M80AAAAJ
