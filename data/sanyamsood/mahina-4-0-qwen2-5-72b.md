# sanyamsood/Mahina-4.0-Qwen2.5-72B

## Resumen

Mahina 4.0 es un adaptador LoRA (PEFT) montado sobre Qwen2.5-72B-Instruct, desarrollado por Sanyam Sood. Su objetivo no es ampliar las capacidades del modelo base, sino modificar su comportamiento epistémico: suprimir la generación de respuestas no fundamentadas ante mitos populares, falacias médicas y supersticiones, y forzar una abstención calibrada cuando no existe evidencia verificable. El autor lo describe como un mecanismo de "epistemic directional steering" que combina representaciones contrastivas con invariantes de custodia criptográfica.

El modelo se distribuye exclusivamente como adaptador (0,9 GB en el repositorio), no como pesos completos, por lo que requiere descargar y cargar el base Qwen2.5-72B-Instruct para su uso. La relevancia actual reside en su enfoque sobre el problema de la alucinación: en lugar de mejorar el conocimiento factual, entrena al modelo para reconocer los límites de su conocimiento y abstenerse, una estrategia cada vez más demandada en despliegues de producción donde una respuesta incorrecta con alta confianza es más costosa que una negativa explícita.

La propuesta del autor es que un adaptador de bajo rango puede superar en truthfulness a modelos frontier mucho más grandes. El único dato de rendimiento publicado es un 90,63 % de precisión en TruthfulQA (split validation), declarado por el autor pero no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-72B-Instruct) |
| Parametros totales | 72B en el modelo base; el adaptador LoRA no declara su recuento de parametros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5-72B-Instruct soporta 131.072 tokens, pero el adaptador no lo especifica) |
| Tipos de cuantizacion | No disponibles (el adaptador se publica en safetensors; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere los pesos del base Qwen2.5-72B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se monta sobre Qwen2.5-72B-Instruct, un transformer decoder-only denso de 72.000 millones de parametros. No se publican detalles sobre el rango del LoRA, los modulos objetivo, el numero de pasos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor describe el metodo como "epistemic directional steering", que combina "contrastive representation steering" con "Fireweed cryptographic custody invariants", pero no se aporta la formulacion tecnica ni la metodologia de entrenamiento en la informacion disponible.

La unica innovacion documentada es el comportamiento resultante: el adaptador fuerza una "epistemic truth maintenance" que suprime priors generativos no fundamentados y activa una abtencion calibrada (el autor reporta un 15,57 % de refusal calibrado) ante preguntas sobre mitos, bulos de salud o supersticiones. El prompt de sistema sugerido en la model card incluye un invariante explicito ("[MAHINA 4.0 EPISTEMIC INVARIANT: Be strictly truthful...]"), lo que sugiere que parte del efecto depende del formateo del prompt de chat de Qwen.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas factuales, heredadas del base Qwen2.5-72B-Instruct.
- Supresion de alucinaciones en dominios de misconception popular: mitos de salud, falacias medicas y supersticiones.
- Abtencion calibrada: el modelo declina responder cuando no dispone de evidencia verificable, en lugar de fabricar una respuesta.
- Razonamiento epistemico guiado por un invariante de sistema inyectado en el prompt.
- Capacidades multilingues y de codigo: no documentadas de forma especifica para el adaptador; las del base Qwen2.5 no se detallan en la informacion proporcionada.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.

## Casos de uso

- Moderacion de contenido sanitario: el modelo puede evaluar afirmaciones sobre remedios caseros o bulos medicos y abstenerse de validarlos, usando su abtencion calibrada para marcar respuestas como "sin evidencia verificable" en lugar de repetir el mito.
- Asistentes de atencion al cliente en sectores regulados (salud, seguros, banca): el adaptador reduce el riesgo de que el asistente invente datos o procedimientos, ya que ante una consulta fuera de su base de conocimiento declina en lugar de improvisar.
- Generacion de respuestas con trazabilidad para RAG: al suprimir priors no fundamentados, el adaptador es adecuado como capa final de un pipeline de recuperacion, donde el modelo debe ceñirse al contexto recuperado y no completar con conocimiento parametrico dudoso.
- Sistemas de verificacion de hechos (fact-checking): puede emplearse como clasificador de afirmaciones que distingue entre "respaldada por evidencia" y "no verificable", aprovechando su tendencia a la abtencion ante afirmaciones sin sustento.
- Investigacion sobre alineacion y calibracion: el adaptador sirve como caso de estudio de steering de representaciones para modificar el comportamiento epistémico sin reentrenar el base, util para experimentos de truthfulness y refusal.
- Despliegue en entornos educativos: tutores automatizados que deben admitir ignorancia ante preguntas de historia, ciencia o cultura popular en lugar de ofrecer respuestas plausibles pero falsas.
- Evaluacion comparativa de tecnicas anti-alucinacion: al publicarse como adaptador LoRA sobre un base conocido (Qwen2.5-72B-Instruct), permite aislar el efecto del steering comparando contra el base sin adaptador en el mismo hardware.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Tier de parametros | Truthfulness (TruthfulQA) | Tasa de alucinacion | Fuente declarada |
|---|---|---|---|---|
| Mahina 4.0-72B | 72B + epistemic custody | 90,63 % | 9,37 % | Run del autor (`ap-h6GFUhvdbXIBkpRRhk2A6O`) |
| DeepSeek-R1 | 671B MoE | 78,00 % | ~22,0 % | LLM-Stats (publicado) |
| Qwen2.5-72B-Instruct | 72B denso (base sin steering) | 68,70 % | ~31,3 % | HF Open LLM Leaderboard |
| Llama-3.1-70B-Instruct | 70B denso | 66,80 % | ~33,2 % | Meta Tech Report / llmbench |
| GPT-4 (baseline original) | Frontier | 59,00 % | ~41,0 % | Lin et al. (NeurIPS) |

El autor declara una mejora de +21,93 puntos porcentuales sobre el base Qwen2.5-72B-Instruct (68,70 % a 90,63 %) y un 15,57 % de abtencion calibrada. La evaluacion se realizo sobre las 790 preguntas completas de TruthfulQA en una NVIDIA A100-80GB. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el adaptador requiere cargar el base Qwen2.5-72B-Instruct. En fp16 son aproximadamente 144 GB de pesos, por lo que se necesita al menos una A100-80GB con offloading o varias GPU (2x A100-80GB, 4x A100-40GB, H100-80GB en paralelo).
- GPU recomendadas: A100-80GB (configuracion usada por el autor), H100-80GB, o multiples GPU de 40-48 GB con `device_map="auto"`.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en fp16. Solo seria viable mediante cuantizacion del base a 4 bits (aproximadamente 40 GB), lo que seguiria excediendo una unica GPU consumer.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card). vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion proporcionada; su viabilidad depende del soporte de adaptadores LoRA del runtime y de la cuantizacion del base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TruthfulQA | Licencia | Formato |
|---|---|---|---|---|---|
| Mahina 4.0-72B | 72B (base) + LoRA | No disponible | 90,63 % (declarado) | Apache 2.0 | Adaptador PEFT |
| Qwen2.5-72B-Instruct | 72B denso | 131.072 tokens (segun especificacion del base) | 68,70 % | Apache 2.0 (Qwen) | Pesos completos |
| DeepSeek-R1 | 671B MoE | No disponible | 78,00 % | Licencia DeepSeek | Pesos completos |
| Llama-3.1-70B-Instruct | 70B denso | 128.000 tokens (segun especificacion del base) | 66,80 % | Llama 3.1 Community | Pesos completos |

La comparativa se limita al eje de truthfulness: Mahina 4.0 no compite en capacidades generales con los frontier, sino en supresion de alucinaciones sobre el mismo base. No se dispone de datos comparativos de MMLU, codigo o matematicas.

## Limitaciones y advertencias

- El unico benchmark publicado es TruthfulQA, declarado por el autor y marcado como `verified: false` en el model-index. No hay verificacion independiente del 90,63 %.
- La tasa de alucinacion (9,37 %) y la de abtencion calibrada (15,57 %) son cifras del autor sin metodologia de medicion detallada en la informacion disponible.
- El adaptador puede degradar el rendimiento en tareas generales (razonamiento, codigo, matematicas) al priorizar la abtencion; no se han publicado evaluaciones que cuantifiquen esta posible perdida.
- El comportamiento depende en parte de un invariante inyectado en el prompt de sistema, por lo que el efecto puede variar segun el formateo del prompt y la plantilla de chat.
- No se documentan sesgos conocidos, idiomas soportados ni restricciones de uso comercial mas alla de la licencia Apache 2.0 del adaptador (el base Qwen2.5-72B-Instruct se distribuye bajo Apache 2.0).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026: no hay evidencia de uso en produccion ni de validacion por terceros.
- Al ser un adaptador, cualquier limitacion del base Qwen2.5-72B-Instruct (sesgos, conocimiento con fecha de corte, contexto maximo efectivo) se hereda.
- La terminologia "Fireweed cryptographic custody invariants" no se explica tecnicamente en la model card; no es posible evaluar su aportacion real al comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanyamsood/Mahina-4.0-Qwen2.5-72B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Scorecard de evaluacion (referenciado en la model card): `verified_results/mahina4_full_790_truthfulqa_scorecard.json` dentro del repositorio
- Paper de TruthfulQA (Lin et al., NeurIPS): no disponible como enlace en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
