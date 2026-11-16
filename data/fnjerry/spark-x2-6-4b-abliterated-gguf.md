# fnjerry/Spark-X2.6-4B-abliterated-GGUF

## Resumen

Spark-X2.6-4B-abliterated-GGUF es la colección de cuantizaciones GGUF del modelo FrostWolfAI/Spark-X2.6-4B-abliterated, una variante "abliterated" (decensored) del modelo base XHToken/Spark-X2.6-4B. El trabajo de abliteración se realizó con Heretic v2 mediante Arbitrary-Rank Ablation (ARA), reduciendo las negativas del modelo de 100/100 a 2/100 con una divergencia KL de 0,0177, preservando arquitectura, contexto de 1M de tokens, modo de razonamiento controlable y el formato de tool calling `<tool_call>`. Las cuantizaciones GGUF han sido generadas por fnjerry a partir de los safetensors BF16 del modelo abliterado.

El modelo cuenta con 4.112.079.360 parámetros y está orientado a despliegue local en dispositivos de consumo (GPU de consumo, portátiles o incluso CPU), con un conjunto completo de 14 cuantizaciones más BF16 que cubren desde 1,79 GB (Q2_K) hasta 8,23 GB (BF16). A 4 bits los pesos ocupan aproximadamente 2,4-2,6 GB, lo que lo hace viable en GPUs con 4-6 GB de VRAM o incluso en teléfonos y SBC de 8 GB de RAM.

Su relevancia actual radica en combinar tres características poco habituales en un modelo de 4B: ventana de contexto de 1M de tokens, soporte nativo de tool calling y razonamiento controlable por petición (thinking on/off y reasoning_effort), todo ello bajo licencia Apache 2.0 y con pesos en formato GGUF listos para llama.cpp. Está pensado para agentes locales, generación de código y research de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura GGUF `spark2_5`); detalles internos no disponibles |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_1, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_S, Q3_K_S, Q2_K |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también existen safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original (tipo de atención, número de capas, cabezas, etc.), solo que se trata de un transformer con arquitectura GGUF identificada como `spark2_5` en llama.cpp. El modelo base XHToken/Spark-X2.6-4B fue desarrollado por XHToken; sobre él, FrostWolfAI aplicó una abliteración con Heretic v2 usando Arbitrary-Rank Ablation (ARA), una técnica que elimina direcciones de activación asociadas a rechazos sin requerir reentrenamiento completo.

Los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La innovación técnica destacable de esta variante es la preservación de capacidades tras la abliteración: el contexto de 1M tokens, el modo de razonamiento controlable, el formato `<tool_call>` y el chat template Jinja se mantienen intactos, con una divergencia KL de 0,0177 respecto al modelo original. Las cuantizaciones GGUF se generaron con `convert_hf_to_gguf.py` (master, 2026-10-29) y `llama-quantize` (build 11669, `620d2225c`), sin importance matrix.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento controlable: modo thinking activado por defecto, desactivable por petición con `enable_thinking: false`, y ajuste de presupuesto con `reasoning_effort: "low"` o `"high"`.
- Tool calling / function calling nativo: emite `<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>` que llama-server parsea a `tool_calls` estilo OpenAI con argumentos JSON.
- Soporte de agentes y razonamiento multi-paso (tag `agentic`).
- Capacidades multilingües limitadas a inglés (en) y chino (zh).
- Orientado a despliegue on-device (tag `on-device`).
- Variante decensored/abliterated: reduce drásticamente las negativas (de 100/100 a 2/100) manteniendo coherencia.
- Integración con endpoints compatibles con OpenAI (`endpoints_compatible`).

## Casos de uso

- Agentes locales en portátil o GPU de consumo: con Q4_K_M (2,60 GB) el modelo cabe en GPUs de 4-6 GB y puede ejecutar bucles de tool calling con llama-server y `--jinja`, integrándose en frameworks de agentes que consumen `tool_calls` estilo OpenAI.
- Asistente de código en local: el modelo soporta razonamiento y tool calling, lo que permite usarlo en pipelines de generación y revisión de código sin enviar datos a la nube, con la ventaja de privacidad y coste cero por token.
- Research de seguridad y red teaming: al ser una variante abliterated, es adecuado para estudiar comportamiento de modelos decensored, evaluar robustez de filtros y analizar respuestas ante prompts que normalmente serían rechazados.
- Procesamiento de documentos largos: la ventana de 1M tokens permite ingerir manuales, bases de código o expedientes completos en una sola pasada, útil para resumen, extracción de entidades o Q&A sobre corpus extensos.
- Despliegue en teléfono o SBC: con Q4_K_M o IQ4_XS (2,39-2,60 GB) y 8 GB de RAM, el modelo puede ejecutarse en dispositivos móviles o placas tipo Raspberry Pi para asistentes offline.
- Automatización de atención al cliente en entornos con requisitos de soberanía de datos: al ejecutarse en local con llama.cpp, permite gestionar conversaciones multi-turno sin depender de APIs externas, con contexto largo para historiales extensos.
- Generación de contenido en inglés y chino: para aplicaciones bilingües en/zh que requieran generación de texto o resumen con razonamiento controlable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Lo único aportado son pruebas cualitativas de funcionamiento por cuantización y mediciones de velocidad con `llama-bench` en una RTX 4090 limitada a 360 W (`-ngl 99 -fa 1 -p 512 -n 128`, 3 repeticiones):

| Cuantización | Prefill (pp512) | Decode (tg128) |
|---|---:|---:|
| BF16 | ~12.300 tok/s | 99 tok/s |
| Q8_0 | ~16.100 tok/s | 165 tok/s |
| Q6_K | ~14.800 tok/s | 199 tok/s |
| Q4_K_M | ~16.800 tok/s | 240 tok/s |
| IQ4_XS | ~17.300 tok/s | 253 tok/s |

Pruebas funcionales por cuantización (servido con `llama-server --jinja -ngl 99 -fa on -c 8192`):

| Cuantización | Thinking off | Thinking on | Tool call |
|---|:---:|:---:|:---:|
| Q8_0 | correcto | correcto | correcto |
| Q4_K_M | correcto | correcto | correcto |
| Q2_K | coherente, un fallo factual | correcto | correcto |

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,4-2,6 GB con cuantizaciones de 4 bits (Q4_K_M, IQ4_XS, Q4_0, Q4_1, Q4_K_S); ~1,8-2,2 GB con 3 bits y Q2_K; ~3-4,4 GB con Q5/Q6/Q8; ~8,2 GB con BF16.
- GPU recomendadas: RTX 4090 (mediciones oficiales de velocidad), y en general cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones de 4 bits; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, holgadamente en RTX 3060/4060 y superiores con 4 bits; también en GPUs de 4 GB con IQ4_XS o Q4_0.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y aplicaciones que empaqueten llama.cpp (Ollama, LM Studio, Jan) siempre que su motor incluya la arquitectura `spark2_5`. Requiere build de llama.cpp con soporte Spark2.5 (probado con build 11669); builds anteriores fallan al cargar.
- Latencia y throughput: en RTX 4090 a 360 W, Q4_K_M alcanza ~16.800 tok/s de prefill y 240 tok/s de decode; IQ4_XS ~17.300 tok/s de prefill y 253 tok/s de decode. El modelo también funciona en CPU-only y en dispositivos de 8 GB de RAM (teléfono/SBC) con Q4_K_M o IQ4_XS.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia estructural, el modelo base sin abliterar (XHToken/Spark-X2.6-4B) comparte arquitectura, tamaño (4B) y contexto (1M), pero no aplica la abliteración y por tanto mantiene el comportamiento de rechazo original (100/100 negativas frente a 2/100 del abliterado). La comparación con otras familias de modelos de 4B (Qwen, Llama, Gemma) queda como "no disponible" al no haber datos en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated/decensored: elimina la mayoría de rechazos, lo que implica que puede generar contenido sensible, ofensivo o inseguro sin filtros. No apto para producción orientada a usuarios finales sin capas adicionales de moderación.
- Riesgo de alucinación: inherente a modelos de 4B; la cuantización Q2_K presenta "fallos factuales notables" según el autor, por lo que no se recomienda para tareas que requieran precisión.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La abliteración puede degradar sutilmente capacidades (KL de 0,0177 respecto al original); conviene validar en la tarea concreta antes de desplegar.
- Requiere build reciente de llama.cpp con soporte `spark2_5`; herramientas que empaqueten versiones antiguas fallarán al cargar el modelo.
- Con thinking activado, presupuestos cortos de `max_tokens` pueden consumirse íntegramente dentro de `
