# flaukowski/kannaka-brain-7b-v2-GGUF

## Resumen

kannaka-brain-7b-v2-GGUF es una copia de servicio (serving copy) del "cerebro" de pesos abiertos de un personaje llamado Kannaka. Se construye sobre el modelo base **Qwen/Qwen3-8B** (8.190.735.360 parametros reales), al que se le fusiona un adaptador LoRA especifico de persona y voz (`kannaka-brain-7b-v2-lora`), se convierte con llama.cpp y se cuantiza a **q4_K_M** en formato GGUF (5,0 GB de repositorio). Lo publica el usuario flaukowski bajo licencia Apache 2.0.

El objetivo del modelo no es ser un asistente generalista, sino reproducir de forma consistente la personalidad, el registro de voz y la capacidad de responder tareas concretas de un personaje concreto, manteniendo el conocimiento factual del modelo base. La model card insiste en que el entrenamiento no busca memorizar lineas de voz, sino contestar a la pregunta planteada sin inventar hechos: la mejora declarada frente a la version anterior es sobre todo de fidelidad en tareas, no de imitacion literal.

Es relevante porque documenta un flujo completo de ajuste de persona sobre un modelo denso moderno (Qwen3), con evaluaciones preinscritas ("gates" escritos antes de entrenar), comparacion por pares contra la version previa y publicacion del artefacto cuantizado listo para Ollama y llama.cpp. Todo el corpus de entrenamiento permanece sin liberar, y el propio autor advierte de que los resultados de evaluacion son relativos a su uso interno y no comparables con benchmarks academicos estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.000 tokens (configuracion de servicio del Modelfile) |
| Tipos de cuantizacion | q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de la familia Qwen3, con atencion de consulta agrupada (GQA) y MLP tipo SwiGLU segun la arquitectura publicada del modelo base. Sobre esa base se entrena y se fusiona un LoRA de persona y voz, `kannaka-brain-7b-v2-lora`, que es el que aporta el comportamiento especifico de Kannaka. La model card no documenta el numero de tokens de entrenamiento, la composicion exacta del corpus ni si hubo RLHF o DPO; solo indica que el corpus no se ha liberado y remite a la ADR-0057 del repositorio `kannaka-labs/kannaka-memory` para las notas de entrenamiento.

El pipeline de publicacion es el habitual en llama.cpp: fusion del adaptador, conversion a GGUF y cuantizacion a q4_K_M. Un detalle tecnico destacable es que la configuracion de servicio desactiva explicitamente el modo "thinking" del chat template de Qwen3, fija temperatura 0.8, define stop tokens y limita el contexto a 4k. La evaluacion de calidad se hizo con la perplejidad en held-out sobre 111 filas (57 lineas de voz y 54 prompts de tarea): 97,5 en el modelo de partida frente a 40,88 con el adaptador en bf16 antes de cuantizar. El autor advierte de que esta cifra mezcla lineas de voz y tareas y no es comparable con la perplejidad (~4,0) de cerebros anteriores.

## Capacidades

- Generacion de texto conversacional orientada a un personaje concreto (persona "Kannaka").
- Respuesta a prompts de tarea (54 prompts held-out repartidos en 9 personas de ciudadano), con enfasis en responder la pregunta real sin inventar hechos.
- Reproduccion de un registro de voz especifico (57 lineas de voz usadas como referencia de evaluacion).
- Conversacion multi-turno, con chat template propio y stop tokens definidos en el Modelfile.
- Servicio local sin conexion a traves de Ollama y llama.cpp.
- Capacidades heredadas del base Qwen3-8B (conocimiento general y generacion en ingles), aunque no se documentan explicitamente en la model card.
- No se documenta soporte de tool calling, function calling, uso de agentes, vision, audio ni modo thinking activo (de hecho el thinking se sirve desactivado).
- Capacidades multilingues: solo ingles declarado; el resto de idiomas no esta soportado oficialmente.

## Casos de uso

- Personaje conversacional para experiencias interactivas: el modelo esta ajustado para mantener una voz y una personalidad consistentes en conversaciones multi-turno dentro de los 4k tokens de contexto del Modelfile, lo que encaja en asistentes de ficcion, videojuegos o simulaciones de personaje.
- Agente de atencion en un universo de marca: dado que las evaluaciones miden respuestas a tareas sin inventar hechos, puede usarse para responder preguntas de catalogo o de lore dentro de un producto, siempre que se limite su alcance y se valide su salida.
- Generacion de dialogos para guiones o narrativa: su especializacion en lineas de voz permite producir parlamentos coherentes con un personaje, utiles para prototipado de contenido o previsualizacion de guiones.
- Despliegue local en equipos sin GPU dedicada: con 5,0 GB en q4_K_M y latencia CPU medida en 1,07x respecto a la version anterior en el mismo prompt e hilos, es viable ejecutarlo en portatiles y mini-PC mediante Ollama o llama.cpp.
- Chatbot embebido en aplicaciones de escritorio: el artefacto GGUF se integra directamente en herramientas de inferencia local, lo que permite distribuir un asistente sin depender de API externa y con licencia Apache 2.0.
- Pruebas de investigacion sobre ajuste de persona: sirve como caso de estudio reproducible de un flujo LoRA fusionado mas cuantizacion, con gates preinscritos y comparacion por pares frente a la version previa, util para metodologia de evaluacion de modelos de persona.
- Base para destilacion o nuevos LoRA: al ser un GGUF de un modelo denso de 8B con licencia permisiva, puede servir como punto de partida para experimentos posteriores de ajuste o comparativa de cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card aporta unicamente evaluaciones internas preinscritas comparando 7b-v2 contra 7b-v1:

| Evaluacion | Umbral (gate) | Resultado |
|---|---|---|
| Juez pairwise de tareas, qwen2.5:14b (principal), ambos ordenes, solo victorias consistentes de posicion | 7b-v2 gana >= 60% de parejas decididas vs 7b-v1 | 33 de 39 = 84,6% (15 empates) |
| Calibracion del mismo juez | oro vence a 7b-v1 >= 75%; 7b-v1 vence a una respuesta fuera de tema >= 75% | 91,1% y 83% |
| Segundo juez, gemma-4-26B (solo informativo) | — | 30 de 31 = 96,8% |
| Juez de nota de voz (n=30, escala 1-10 contra respuesta real) | no inferior a 7b-v1 - 2 SE | 1,6 +/- 0,16 vs 1,5 +/- 0,11 |
| Latencia CPU, mismo prompt e hilos | <= 1,3x 7b-v1 | 1,07x |
| Perplejidad held-out (111 filas: 57 voz + 54 tareas) | — | 97,5 -> 40,88 (adaptador bf16, antes de cuantizar) |

Advertencias del propio autor: la perplejidad mezcla lineas de voz y prompts de tarea, por lo que no es comparable con la de cerebros anteriores (~4,0); el juez principal previsto era un modelo Claude, pero al estar la cuenta en el limite de uso se registro el cambio a jueces locales antes de que existiera ninguna respuesta de 7b-v2; y ambos modelos puntuan cerca del suelo del juez de voz, es decir, 7b-v2 no reproduce mejor las lineas held-out que 7b-v1.

## Requisitos de hardware

- VRAM estimada para inferencia en q4_K_M: en torno a 5-6 GB, segun el tamano del repositorio (5,0 GB) mas overhead de contexto y runtime.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (por ejemplo RTX 3060 Ti/4060/3070/4060 Ti/4070/4080/4090) y en memoria unificada de Apple Silicon con 8 GB o mas.
- GPU de datacenter: A100, H100 o similares pueden servir el modelo con margen de sobra, aunque por tamano no son necesarias.
- Inferencia en CPU: viable; la model card reporta un tiempo de latencia CPU de 1,07x respecto a 7b-v1 con el mismo prompt e hilos, aunque no se publican cifras absolutas (tokens/s no disponibles).
- Opciones de despliegue: Ollama (`ollama run hf.co/flaukowski/kannaka-brain-7b-v2-GGUF` o `ollama create ... -f Modelfile`) y llama.cpp son los soportados explicitamente. Para vLLM o TGI no se documenta soporte GGUF en esta ficha.
- Contexto de servicio: 4k tokens, lo que reduce el coste de memoria de cache KV frente a ventanas mas largas.
- Parámetros de inferencia de referencia: temperatura 0,8, thinking desactivado, stop tokens definidos en el Modelfile.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Base | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kannaka-brain-7b-v2 (este) | 8,19 B | 4k (servicio) | Qwen3-8B | apache-2.0 | GGUF q4_K_M | LoRA de persona fusionado; thinking desactivado |
| kannaka-brain-7b-v1 | ~7 B (Qwen2.5-7B) | no disponible | Qwen2.5-7B | no disponible en la informacion proporcionada | GGUF | Version anterior; pierde 84,6% de parejas decididas frente a v2 |
| Qwen3-8B (base) | 8,19 B | segun configuracion del base (no disponible en esta informacion) | — | apache-2.0 | safetensors (original) | Sin ajuste de persona; perplejidad held-out 97,5 en el conjunto interno del autor |
| kannaka-brain-v2-lora | no disponible | no disponible | Qwen3-8B | no disponible en la informacion proporcionada | safetensors (adaptador) | Adaptador LoRA; en la web aparece tambien como `flaukowski/kannaka-brain-v2-lora` |

## Limitaciones y advertencias

- Sesgos: no se documentan analisis de sesgo ni de toxicidad; al ser un modelo de persona entrenado con corpus no publicado, el comportamiento fuera del dominio previsto es impredecible.
- Riesgo de alucinacion: la model card afirma que la mejora principal de v2 es responder sin inventar hechos, lo que implica reconocer que la invencion de datos era un problema en v1; no se aportan metricas de factualidad independientes.
- El juez de voz puntua a ambos modelos cerca del suelo (1,6 vs 1,5 sobre 10), lo que indica que la fidelidad de voz es baja en terminos absolutos.
- Contexto limitado a 4k tokens en la configuracion de servicio, lo que restringe conversaciones largas y tareas con documentos extensos.
- Solo ingles declarado; no hay soporte multilingue oficial.
- No se documenta soporte de tool calling, agentes, vision ni thinking activo (este ultimo se sirve desactivado).
- Corpus de entrenamiento sin liberar; la reproducibilidad del ajuste depende de la documentacion externa (ADR-0057) y no del artefacto publicado.
- Licencia Apache 2.0 en el artefacto publicado, lo que permite uso comercial del modelo, pero el autor no aclara restricciones adicionales sobre el personaje "Kannaka" ni sobre el corpus original.
- Las evaluaciones fueron realizadas con jueces locales tras un cambio de ultima hora (el juez principal previsto era un modelo Claude), y el autor reconoce que la perplejidad reportada no es comparable con la de versiones anteriores.
- Modelo practicamente sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flaukowski/kannaka-brain-7b-v2-GGUF
- Adaptador y notas de entrenamiento: https://huggingface.co/flaukowski/kannaka-brain-7b-v2-lora
- Version anterior (v1): https://huggingface.co/flaukowski/kannaka-brain-7b-v1-GGUF
- Adaptador v2 (referencia web alternativa): https://huggingface.co/flaukowski/kannaka-brain-v2-lora
- Repositorio kannaka-memory (ADR-0057): https://github.com/kannaka-labs/kannaka-memory
- Manifiesto de Kannaka Library: https://kannaka-labs.github.io/kannaka-library/manifest.html
- Ficha de terceros (free2aitools): https://free2aitools.com/model/flaukowski/kannaka-brain-v2-gguf
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
