# p-e-w/Oc-e-Non-v1

## Resumen

Oc-e-Non-v1 es un ajuste derivado de Qwen/Qwen3-4B-Instruct-2507, publicado por el desarrollador p-e-w, que aplica una modificación sin entrenamiento (training-free) mediante la herramienta Heretic v2.1.0.dev0. El objetivo declarado es "tersificar" el modelo, es decir, reducir la longitud media de las respuestas y suprimir comportamientos verbosos o excesivamente complacientes, manteniendo la capacidad general del modelo base. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es una ablación selectiva de direcciones en el espacio de activaciones.

El modelo hereda la arquitectura y el conocimiento de Qwen3-4B-Instruct-2507, un transformer causal denso de 4.022 millones de parámetros (3.6B no-embedding), 36 capas, atención con GQA (32 cabezas Q, 8 KV) y una longitud de contexto nativa de 262.144 tokens. La modificación se aplica mediante Arbitrary-Rank Ablation (ARA) sobre las capas 14 a 31, con pesos concretos de preservación y corrección que el autor documenta en la model card.

Su relevancia es doble: por un lado, demuestra que es posible alterar propiedades de estilo y comportamiento (concisión, tono) sin reentrenar, usando técnicas de interpretabilidad y edición de activaciones; por otro, ofrece una alternativa práctica a quienes necesitan respuestas más cortas y directas en producción sin asumir el coste de un fine-tuning. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Qwen3), 36 capas, GQA con 32 cabezas Q y 8 KV |
| Parametros totales | 4.022.468.096 (4.0B); 3.6B no-embedding |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | No especificados en la informacion disponible; al ser safetensors en transformers, admite las cuantizaciones habituales (GGUF, AWQ, GPTQ) mediante herramientas externas, aunque no estan documentadas por el autor |
| Idiomas soportados | No disponible en la model card de este derivado; el modelo base declara mejoras en conocimiento long-tail multilingue |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-4B-Instruct-2507) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507: un transformer causal denso con 36 capas, normalizacion y atención con grouped-query attention (GQA) de 32 cabezas de consulta y 8 de clave-valor. El modelo base fue preentrenado y postentrenado por el equipo Qwen, con mejoras declaradas en seguimiento de instrucciones, razonamiento logico, matematicas, ciencia, codigo y uso de herramientas, asi como en cobertura de conocimiento long-tail multilingue. No se especifica en la informacion disponible el volumen de tokens de entrenamiento ni la composicion exacta del dataset.

La innovacion de este derivado no esta en el entrenamiento sino en la edicion post-hoc: se aplica Arbitrary-Rank Ablation (ARA) con Heretic v2.1.0.dev0, una tecnica training-free que identifica y ablaciona direcciones en el espacio de activaciones asociadas a un comportamiento no deseado (en este caso, verbosidad). Los parametros documentados son: start_layer_index 14, end_layer_index 31, preserve_good_behavior_weight 0.3448, steer_bad_behavior_weight 0.1004, overcorrect_relative_weight 0.9811 y neighbor_count 14. El resultado es una reduccion de la longitud media de respuesta de 413.9 a 212.3 (aproximadamente la mitad), con una caida minima en PIQA acc_norm (0.7595 a 0.7535).

## Capacidades

- Generacion de texto conversacional con respuestas mas concisas que el modelo base (longitud media aproximadamente 212 tokens frente a 414).
- Razonamiento logico y matematicas, heredados del modelo base (mejoras declaradas en MMLU-Pro, GPQA, AIME25 y ZebraLogic).
- Generacion de codigo y tareas de programacion (LiveCodeBench, MultiPL-E, Aider-Polyglot en el modelo base).
- Comprension de contexto largo: hasta 262.144 tokens nativos.
- Soporte de tool calling y function calling, con resultados declarados en BFCL-v3 y TAU1/TAU2 para el modelo base.
- Capacidades de agente y razonamiento multi-paso, heredadas del modelo base.
- Capacidades multilingues (mejoras declaradas en MultiIF, MMLU-ProX, INCLUDE y PolyMATH en el base).
- Modo no-thinking: el modelo no genera bloques `<think></think>` y no requiere `enable_thinking=False`.
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, y la reduccion de verbosidad disminuye la latencia y el coste por respuesta en produccion.
- Generacion de codigo en pipelines de CI/CD: soporta tool calling y puede integrarse en flujos de revision automatica, generacion de parches o explicacion de errores, con respuestas mas directas que el base.
- Asistentes de documentacion tecnica: la concision inducida es util para generar resumenes, changelogs y respuestas de FAQ sin relleno, manteniendo el conocimiento del modelo base.
- Agentes autonomos de multiple paso: el modelo base declara resultados en BFCL-v3 y TAU, y la menor longitud de respuesta reduce el consumo de tokens en bucles de agente.
- Razonamiento matematico y cientifico asistido: hereda las mejoras del base en AIME25, GPQA y ZebraLogic, adecuado para tutoria o resolucion guiada de problemas.
- Procesamiento de documentos largos: con 262K de contexto puede resumir contratos, informes o articulos extensos en una sola pasada, con salidas mas breves y directas.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B en safetensors, es viable en GPUs de consumo con cuantizacion, y la menor verbosidad reduce el tiempo de generacion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible para este derivado son los de la model card del autor, comparando con el modelo base:

| Metrica | Oc-e-Non-v1 | Qwen3-4B-Instruct-2507 |
|---|---|---|
| Longitud media de respuesta | 212.3 | 413.9 |
| PIQA acc_norm | 0.7535 | 0.7595 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para este derivado concreto. El modelo base Qwen3-4B-Instruct-2507 si publica una tabla extensa (MMLU-Pro 69.6, GPQA 62.0, AIME25 47.4, LiveCodeBench v6 35.1, IFEval 83.4, BFCL-v3 61.9, entre otros), pero esos valores corresponden al base y no al derivado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 10-12 GB para contexto moderado.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 4-5 GB; con 4 bits: aproximadamente 2.5-3.5 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16 con contexto largo; RTX 3090/4080/4090 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 con cuantizacion; en fp16 completo requiere al menos 12 GB.
- Opciones de despliegue: transformers (libreria nativa), vLLM >= 0.8.5, SGLang >= 0.4.6.post1, y herramientas compatibles con safetensors; el modelo base documenta estos mismos runners.
- Latencia y throughput: no disponibles en la informacion proporcionada para este derivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Oc-e-Non-v1 | 4.0B | 262.144 | Apache 2.0 | Derivado training-free de Qwen3-4B-Instruct-2507 con respuestas mas concisas |
| Qwen3-4B-Instruct-2507 | 4.0B | 262.144 | Apache 2.0 | Modelo base; respuestas mas largas (longitud media 413.9) y PIQA 0.7595 |
| Qwen3-30B-A3B (non-thinking) | 30B totales (3B activos, MoE) | 262.144 (segun familia Qwen3) | Apache 2.0 | Mayor capacidad pero mayor coste de despliegue; referencia en la tabla del base |
| GPT-4.1-nano | No disponible | No disponible | Propietaria | Referencia cerrada en la tabla del base; sin pesos abiertos |

La comparativa directa mas relevante es con el modelo base: Oc-e-Non-v1 reduce a la mitad la longitud media de respuesta con una perdida de 0.006 en PIQA acc_norm. Frente a alternativas de mayor tamano como Qwen3-30B-A3B, el derivado de 4B ofrece menor coste de inferencia a cambio de menor capacidad absoluta.

## Limitaciones y advertencias

- La ablacion ARA puede alterar comportamientos no previstos: al modificar direcciones de activacion en capas 14-31, existe riesgo de degradar sutilmente capacidades no medidas por PIQA, como matematicas o codigo.
- El autor solo reporta dos metricas (longitud media y PIQA); no hay evaluacion publicada de MMLU, HumanEval, GSM8K ni de seguridad para este derivado.
- Riesgo de alucinacion heredado del modelo base, no mitigado por la tecnica de ablacion.
- La reduccion de verbosidad puede eliminar matices o caveats utiles en tareas que requieren explicaciones detalladas.
- No se documentan los idiomas soportados especificamente para este derivado; el comportamiento multilingue puede diferir del base.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y las condiciones de Heretic para atribucion.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- Al ser un derivado no oficial de Qwen, no cuenta con el soporte ni las garantias del equipo Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p-e-w/Oc-e-Non-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio Heretic: https://github.com/p-e-w/heretic
- Proyecto Heretic: https://heretic-project.org
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
