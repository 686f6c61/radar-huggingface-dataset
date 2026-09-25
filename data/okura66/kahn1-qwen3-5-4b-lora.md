# Okura66/Kahn1-Qwen3.5-4B-LoRA

## Resumen

Kahn1-Qwen3.5-4B-LoRA es un adaptador LoRA de tipo PEFT publicado por el usuario Okura66 sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo generativo al uso: forma parte de Kahn1, un "motor de decision calibrado" que responde preguntas tipadas (Choice, Score, Noul) sobre un documento leyendo directamente los logits de los tokens de opcion, sin generar texto. El adaptador se distribuye por separado del checkpoint fusionado (Okura66/Kahn1-Qwen3.5-4B), que es el que se sirve con vLLM y el que contiene los benchmarks y detalles de entrenamiento completos.

La relevancia de esta pieza concreta esta en su perfil de despliegue: con apenas 0,1 GB de repositorio, un LoRA de rango 16 y alpha 32 permite convertir un Qwen3.5-4B en un clasificador de decision de alta velocidad, orientado a "System 1" (respuesta rapida, sub-20 ms segun el repositorio del proyecto), en lugar de razonamiento multi-paso. Los targets del adaptador no se limitan a la atencion clasica: tambien cubren las proyecciones in_proj_qkv, in_proj_z, in_proj_b, in_proj_a y out_proj de las capas de atencion lineal (Gated DeltaNet) del modelo base.

Se trata de un artefacto muy reciente (creado y actualizado el 25 de septiembre de 2026) con 0 descargas y 0 likes en el momento de la consulta. El pipeline declarado es text-classification, los idiomas soportados son ingles y frances, y la licencia es Apache 2.0, heredada de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-4B; el modelo base combina atencion clasica y capas de atencion lineal (Gated DeltaNet) |
| Parametros totales | No disponible (el modelo base es un 4B; no se publica el numero exacto de parametros entrenables del adaptador) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors (precision del base, bf16). No se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) y frances (fr) |
| Licencia | Apache 2.0 (heredada de Qwen3.5); el codigo del motor es MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,1 GB |
| Rank / alpha del LoRA | r = 16, alpha = 32 |
| Modulos objetivo | q, k, v, o de las capas de atencion; in_proj_qkv, in_proj_z, in_proj_b, in_proj_a y out_proj de las capas de atencion lineal (Gated DeltaNet) |
| Modelo base | Qwen/Qwen3.5-4B |
| Checkpoint fusionado | Okura66/Kahn1-Qwen3.5-4B (servido con vLLM) |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre Qwen3.5-4B. Los modulos intervenidos abarcan tanto la atencion estandar (q, k, v, o) como las proyecciones de las capas de atencion lineal Gated DeltaNet (in_proj_qkv, in_proj_z, in_proj_b, in_proj_a, out_proj), lo que indica que el modelo base es una arquitectura hibrida con atencion lineal. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se empleo RLHF, DPO o algun otro metodo de alineacion; esa informacion se remite al checkpoint fusionado Okura66/Kahn1-Qwen3.5-4B.

La particularidad funcional es el modo de inferencia: los prompts utilizan la plantilla de chat del modelo base con el modo thinking desactivado, y el token de respuesta se lee inmediatamente despues de la secuencia `</think>`. Es decir, el modelo no redacta una respuesta, sino que se explota la distribucion de probabilidad sobre los tokens que representan las opciones para emitir una decision. El repositorio incluye un archivo `calibration.json` con las temperaturas que aplica el motor sysone, lo que constituye el mecanismo de calibracion de probabilidades declarado en las etiquetas del modelo. El script `scripts/merge_qwen_lora.py` del repositorio fusiona el adaptador en un checkpoint solo texto, ya que Qwen3.5-4B incorpora tambien un encoder de vision.

## Capacidades

- Clasificacion y decision tipada sobre documentos: responde preguntas de tipo Choice, Score y Noul a partir de los logits de los tokens de opcion.
- Probabilidades calibradas: las etiquetas del modelo y el archivo `calibration.json` confirman un flujo de calibracion de temperaturas para las salidas.
- Inferencia sin generacion de texto: no produce respuestas en lenguaje natural, solo una decision sobre opciones predefinidas.
- Tareas de entailment / NLI, segun la etiqueta `entailment` y el benchmark JevBench.
- Extraccion de atributos estructurados de un texto segun el repositorio del proyecto: intencion, prioridad, sentimiento, reembolso, entre otros.
- Multilingue limitado a ingles y frances.
- Alta velocidad: el repositorio del proyecto describe el sistema como "high-throughput" y con decisiones por debajo de 20 ms.
- No se documenta soporte de tool calling ni function calling.
- No se documenta uso en modo agente ni razonamiento multi-paso (el diseno es explicitamente "System 1").
- Vision: el modelo base Qwen3.5-4B incluye encoder de vision, pero el script de fusion genera un checkpoint solo texto y la model card no documenta capacidades multimodales para este adaptador.

## Casos de uso

- Triaje masivo de tickets de soporte: el modelo clasifica miles de tickets por minuto asignandoles categoria, prioridad e intencion sin generar texto, lo que reduce el coste por item frente a un LLM generativo.
- Extraccion de atributos estructurados en correos y formularios: al leer los logits de opciones predefinidas, devuelve campos como intencion, urgencia, sentimiento o solicitud de reembolso de forma directamente consumible por un sistema posterior.
- Enrutamiento de reclamaciones de seguros: clasificacion de siniestros por tipologia y nivel de severidad en un pipeline batch, segun el caso de uso descrito en el repositorio del proyecto.
- Filtro previo en arquitecturas RAG: decidir si un documento es relevante o si implica una afirmacion antes de invocar un modelo generativo, reduciendo el numero de llamadas costosas al "System 2".
- Verificacion de entailment en control de calidad documental: comprobar si un texto implica una afirmacion dada, usando el modelo como componente de NLI.
- Umbrales de decision automatizada con scoring calibrado: al disponer de probabilidades calibradas, es posible fijar umbrales de confianza para derivar casos dudosos a revision humana.
- Moderacion y clasificacion de contenido en ingles y frances: evaluacion rapida de grandes volumenes de texto con latencia baja.
- Ensemble con un modelo generativo: usar Kahn1 4B como primera etapa de decision y reservar el modelo grande para los casos en que la confianza cae por debajo del umbral.

## Benchmarks y rendimiento

Datos tomados de la model card del adaptador. Los resultados corresponden a Kahn1 4B, comparados con Kahn1 3B y con JEV 1.13.0:

| Benchmark | Kahn1 4B | Kahn1 3B | JEV 1.13.0 |
|---|---|---|---|
| Held-out, 14 663 items, comparacion equivalente | 70,3 % | 70,3 % | 73,2 % |
| JevBench publico, 231 items | 83,1 % | 67,5 % | 86,6 % |
| JevBench, tier dificil, 111 items | 70,3 % | 42,3 % | 73,0 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, algo coherente con la naturaleza no generativa del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia del checkpoint fusionado (Qwen3.5-4B): aproximadamente 8-9 GB en bf16/fp16, en torno a 4-5 GB en cuantizacion de 8 bits y 2,5-3 GB en 4 bits. Son estimaciones por tamano de parametros, no cifras publicadas por el autor.
- VRAM para el adaptador solo: el repositorio ocupa 0,1 GB, pero es necesario cargar igualmente el modelo base Qwen3.5-4B, por lo que el requisito real de memoria es el del base.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor con vLLM; RTX 4090, RTX 3090 o RTX 4080 (24 GB o menos con cuantizacion) para inferencia en estacion de trabajo.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB pueden alojar el checkpoint fusionado en bf16, y con cuantizacion de 4 bits bastan 4-6 GB de VRAM.
- Opciones de despliegue: vLLM para el checkpoint fusionado (Okura66/Kahn1-Qwen3.5-4B), segun indica la model card; transformers + PEFT para cargar el adaptador sobre Qwen/Qwen3.5-4B; Ollama dispone de la variante base `qwen3.5:4b` como punto de partida para el modelo subyacente.
- Latencia y throughput: el repositorio del proyecto describe decisiones por debajo de 20 ms. No se publican cifras de throughput (items por segundo) ni el hardware exacto sobre el que se midio esa latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (held-out 14 663 / JevBench 231 / hard 111) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kahn1 4B (este adaptador) | 4B (base Qwen3.5-4B) | No disponible | 70,3 % / 83,1 % / 70,3 % | Apache 2.0 | HuggingFace, adaptador + checkpoint fusionado |
| Kahn1 3B | 3B (base Qwen2.5-3B) | No disponible | 70,3 % / 67,5 % / 42,3 % | No disponible | HuggingFace, adaptador + checkpoint fusionado |
| JEV 1.13.0 | No disponible | No disponible | 73,2 % / 86,6 % / 73,0 % | No disponible | No disponible (referencia de comparacion en la model card) |
| Qwen3.5-4B (modelo base) | 4B | No disponible | No comparable: es un modelo generativo, no un motor de decision tipada | Apache 2.0 | HuggingFace, Ollama (`qwen3.5:4b`) |

Comparado con Kahn1 3B, la version de 4B mejora de forma notable en el tier dificil de JevBench (70,3 % frente a 42,3 %) y en JevBench publico (83,1 % frente a 67,5 %), aunque empata en el conjunto held-out. Frente a JEV 1.13.0, Kahn1 4B queda por debajo en las tres metricas.

## Limitaciones y advertencias

- El modelo no genera texto: solo emite decisiones sobre opciones predefinidas. No es adecuado para tareas de redaccion, resumen, dialogo abierto ni generacion de codigo.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documentan sesgos especificos, pero al derivar de Qwen3.5-4B hereda los sesgos del modelo base y del corpus de entrenamiento del adaptador, cuyo dataset no se detalla.
- Cobertura idiomatica limitada a ingles y frances; el castellano no figura entre los idiomas soportados.
- Riesgo de alucinacion reducido en comparacion con un modelo generativo, ya que la salida se restringe a la distribucion sobre tokens de opcion, pero persiste el riesgo de clasificaciones erroneas o mal calibradas fuera de la distribucion de entrenamiento.
- La calidad del resultado depende de la calibracion incluida en `calibration.json`; si se aplica el adaptador sin ese archivo, las probabilidades no estaran calibradas.
- El adaptador requiere cargar el modelo base Qwen3.5-4B, de modo que el ahorro de almacenamiento (0,1 GB) no se traduce en un ahorro de VRAM.
- Para servir con vLLM hay que usar el checkpoint fusionado, no este adaptador directamente; el script `scripts/merge_qwen_lora.py` produce un checkpoint solo texto, por lo que las capacidades de vision del base quedan fuera.
- Licencia Apache 2.0 para el modelo y MIT para el codigo del motor, ambas permisivas para uso comercial; conviene verificar igualmente los terminos del modelo base Qwen3.5-4B.
- El modelo tiene 0 descargas y 0 likes y fue publicado en septiembre de 2026, por lo que carece de validacion independiente por parte de la comunidad.
- No se publican detalles de entrenamiento (tokens, composicion del dataset, metodo de alineacion) en esta model card; hay que consultar el checkpoint fusionado para obtenerlos.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Okura66/Kahn1-Qwen3.5-4B-LoRA
- Checkpoint fusionado: https://huggingface.co/Okura66/Kahn1-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de codigo: https://github.com/Okura66/kahn1
- Sitio web del proyecto: https://kahn1.com
- Version 3B del adaptador: https://huggingface.co/Okura66/Kahn1-Qwen2.5-3B-LoRA
- Version 3B fusionada: https://huggingface.co/Okura66/Kahn1-Qwen2.5-3B
- Qwen3.5 4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Experimento relacionado de fine-tuning de Qwen3.5-4B con LoRA (terceros): https://github.com/IIIIQIIII/qwen35-4b-lora-sft
