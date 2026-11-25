# catonooka/Inkling-2-Mini-Unbound-EXL3-4.0bpw-h8

## Resumen

Inkling-2-Mini-Unbound-EXL3-4.0bpw-h8 es una cuantización EXL3 de 4 bits del modelo Inkling-2-Mini-Unbound, un finetune sin censura (abliterated) del Inkling-2-Mini desarrollado por Thinking Machines. El modelo original es un MoE de tipo Inkling2Loop con 26.400 millones de parámetros totales y aproximadamente 3.400 millones activos, 24 capas con 128 expertos (8 activos), atención híbrida con convoluciones cortas, ventana de contexto nativa de 1.048.576 tokens y un codificador de visión. Esta versión la publica el usuario catonooka y no está afiliada ni a Thinking Machines ni a nokeepai.

La relevancia de esta ficha radica en que empaqueta un modelo multimodal de contexto extremo en 13,9 GB, lo que permite servirlo en una única GPU de 24 GB como la RTX 3090. La cuantización mantiene el cuerpo en 4,0 bits por peso, la cabeza lm_head en 8 bits y los embeddings y la torre de visión en 16 bits (tensores bf16 sin tocar), con una divergencia KL de 0,004 frente al BF16 de origen.

El modelo conserva las capacidades del original (generación de texto, razonamiento con niveles de esfuerzo, visión, tool calling y conversación multi-turno) pero con el sesgo de rechazo eliminado mediante abliteration. Requiere una build de exllamav3 con soporte para la arquitectura Inkling2Loop, por lo que no funciona con versiones estándar sin ese parche.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling2Loop (MoE híbrido: atención + convoluciones cortas), `model_type: inkling2_loop`, clase `Inkling2LoopForConditionalGeneration` |
| Parametros totales | 26.4B (según model card); 7.042.592.896 tensores reportados por safetensors |
| Parametros activos | ~3.4B |
| Longitud de contexto | 1.048.576 tokens nativos; 47k tokens de caché en una RTX 3090 de 24 GB con K8V8 |
| Tipos de cuantizacion | EXL3 4.0 bpw (cuerpo), 8 bpw (lm_head), 16 bpw (embeddings y visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, `quant_method: exl3`, 3 shards, 13.9 GB) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 24 capas y 128 expertos por capa, de los que 8 se activan por token, lo que da unos 3,4B de parámetros activos sobre 26,4B totales. La arquitectura Inkling2Loop combina atención con convoluciones cortas (híbrida) y añade un codificador de visión que procesa la entrada de imagen en 16 bits dentro de esta cuantización. El contexto nativo alcanza 1.048.576 tokens.

La cuantización se generó con exllamav3 1.6.7.post1 (codebook `mul1`) a partir de la materialización completa en BF16 de nokeepai/Inkling-2-Mini-Unbound (linaje electroglyph/Inkling-2-Mini-Unbound-BF16). Se calibró con 250 filas de 2048 columnas y `out_scales: auto`, con la pasada de reintento de outliers activada (ningún tensor necesitó reintento). No se incluye el `hf_quant_config.json` heredado del checkpoint del proveedor porque no describe estos tensores. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento con control de esfuerzo mediante `reasoning_effort` (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`; por defecto `high`), con longitud de pensamiento escalable.
- Procesamiento de imagen y texto (`image-text-to-text`) a través de la torre de visión en 16 bits.
- Tool calling y function calling mediante marcadores `<|content_invoke_tool_json|>`, con declaración de herramientas en mensaje de sistema.
- Conversación multi-turno con contexto muy largo (verificado con conversación de 42k tokens y solicitud de autocompresión).
- Capacidades de agente y razonamiento multi-paso (soporte de invocación de herramientas en el template de chat).
- Linaje sin censura: el sesgo de rechazo se ha eliminado mediante abliteration sobre el finetune Unbound.

## Casos de uso

- Asistente documental de contexto largo: el modelo puede ingerir conversaciones o documentos de decenas de miles de tokens en una sola GPU de 24 GB con caché K8V8, adecuado para resumen y preguntas sobre contratos o informes extensos.
- Análisis de imágenes con texto: al conservar la torre de visión en 16 bits, permite describir capturas, diagramas o documentos escaneados y responder preguntas sobre ellos en el mismo flujo conversacional.
- Agente con herramientas en local: el soporte de tool calling con argumentos parseados permite integrarlo en flujos que consulten APIs, bases de datos o ejecuten acciones, con control de esfuerzo de razonamiento según la tarea.
- Atención al cliente automatizada: la ventana de contexto y el formato de chat con roles permiten gestionar conversaciones multi-turno largas manteniendo el historial sin truncar.
- Generación y revisión de código en pipelines: el modelo puede integrarse en herramientas de desarrollo mediante tool calling, aunque conviene validar la calidad del código por el linaje sin censura.
- Investigación sobre alineación y robustez: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin rechazo, comparar respuestas frente al original y medir sesgos.
- Despliegue en estación de trabajo con una sola RTX 3090: con 13,9 GB de pesos y caché K8V8 cabe en 24 GB, lo que permite prototipar agentes multimodales sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de rendimiento en una RTX 3090 (24 GB), single stream, greedy:

| Contexto | Caché K/V fp16 | Caché K8V8 |
|---|---|---|
| 125 tokens | 96,6 t/s | 90,3 t/s |
| 6,8k tokens | 87,7 t/s | 78,2 t/s |
| 12,3k tokens | 84,4 t/s | 73,4 t/s |

- Prefill: 562 t/s con un prompt de 42k tokens.
- Caché máxima con K8V8 en una tarjeta de 24 GB: 47k tokens (prompt de 42k + generación verificada).
- El drafter DSpark/MTP del proveedor resultó más lento que el modelo base en esta cuantización (51 frente a 92 t/s), por lo que se recomienda servirlo sin drafter.
- Puertas de calidad superadas: KL frente al BF16 de 0,004; needle-in-a-haystack con acierto a 40k de contexto; visión funcional; control de nivel de pensamiento operativo.

## Requisitos de hardware

- VRAM estimada: 13,9 GB de pesos en EXL3 4.0 bpw; con caché K8V8 cabe en 24 GB con hasta 47k tokens de contexto.
- GPU recomendadas: RTX 3090 (24 GB, configuración medida por el autor); tarjetas con 24 GB o más para contextos largos.
- Cabe en GPU de consumo: sí, en RTX 3090 y presumiblemente en RTX 4090 (24 GB) y otras tarjetas de 24 GB, aunque solo se han publicado medidas en 3090.
- Despliegue: exclusivamente exllamav3 con soporte para Inkling2Loop (build con el fork `feat/inkling2-loop-v1.6.7`, commit `67b53f63`); las versiones estándar de exllamav3 sin soporte Inkling2 no cargan el modelo. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 96,6 t/s a contexto corto con caché fp16 y 90,3 t/s con K8V8; 84,4 t/s a 12,3k con fp16; prefill de 562 t/s a 42k.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound-EXL3-4.0bpw-h8 (este) | 26,4B totales / ~3,4B activos | 1.048.576 nativo; 47k en 24 GB | Apache 2.0 | Hugging Face, requiere exllamav3 parcheado | Cuantización EXL3 4 bpw, visión, sin censura |
| Inkling-2-Mini-Unbound (BF16, nokeepai) | 26,4B totales / ~3,4B activos | 1.048.576 | Apache 2.0 | Hugging Face | Modelo base sin cuantizar; requiere mucha más VRAM |
| Inkling-2-Mini (original, Thinking Machines) | 26,4B totales / ~3,4B activos | 1.048.576 | no disponible | Hugging Face | Modelo original con rechazo; referencia de calidad |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura (abliterated): puede generar contenido que otros modelos rechazarían; no se ha ejecutado ningún benchmark de tasa de rechazo sobre esta cuantización.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; el contexto largo no garantiza respuestas correctas.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Requiere una build específica de exllamav3 con la arquitectura Inkling2Loop; las versiones estándar no cargan los pesos.
- El template de chat exige que los argumentos de tool call en el historial del asistente sean objetos parseados, no cadenas JSON; de lo contrario lanza una excepción.
- El drafter DSpark/MTP del proveedor es más lento que el modelo base en esta cuantización y no debe usarse.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara no estar afiliado a Thinking Machines ni a nokeepai; conviene revisar la licencia del modelo base original.
- Sin descargas ni likes en el momento de la ficha y creado el 25 de noviembre de 2026, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/catonooka/Inkling-2-Mini-Unbound-EXL3-4.0bpw-h8
- Modelo base cuantizado: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Materialización BF16: https://huggingface.co/electroglyph/Inkling-2-Mini-Unbound-BF16
- Materialización BF16 con nombres HF: https://huggingface.co/electroglyph/Inkling-2-Mini-Unbound-BF16-HFNORM
- Fork de exllamav3 con Inkling2: https://github.com/vcruz305/exllamav3 (rama `feat/inkling2-loop-v1.6.7`)
