# avyukth/Qwen3.8-27B-AWQ-INT4

## Resumen

Qwen3.8-27B-AWQ-INT4 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el autor independiente avyukth. El modelo original, desarrollado por el equipo de Qwen, emplea la arquitectura Qwen3.5 (identificador `qwen3_5`) y combina 16 capas de atención completa con 48 capas de atención lineal (`Qwen3_5GatedDeltaNet`), sumando 27.356 millones de parámetros. Esta versión cuantizada reduce el peso del modelo de 55,6 GB a 18 GB, lo que permite ejecutarlo en una GPU de consumo con 24 GB de VRAM, como una RTX 3090, manteniendo la torre de visión en bf16 y el `lm_head` y la cabeza MTP sin cuantizar.

La relevancia de esta ficha radica en que demuestra la viabilidad de desplegar un modelo de visión-lenguaje de 27B en hardware asequible, con un impacto mínimo medido en razonamiento matemático (97,5 % exact match en una muestra de 40 problemas de GSM8K) y capacidades de visión verificadas. Está pensado para desarrolladores que necesitan un punto de partida fiable para inferencia multimodal en entornos con restricciones de memoria, sin renunciar a tool calling ni a la integración con vLLM.

La licencia Apache 2.0, heredada del modelo base, facilita su uso comercial y su integración en pipelines de producción. No obstante, la cuantización presenta limitaciones técnicas documentadas, como la ausencia de activación-aware scaling en 48 de las 64 capas, que conviene conocer antes de adoptarla en escenarios críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (Qwen3_5ForConditionalGeneration), hibrida con 16 capas full-attention y 48 capas linear_attn (GatedDeltaNet) |
| Parametros totales | 27.356.728.560 (27,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor recomienda `max_model_len=8192` en vLLM para GPU de 24 GB) |
| Tipos de cuantizacion | INT4 AWQ (W4A16, group size 128, simetrica); torre de vision en bf16; `lm_head` y cabeza MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza la arquitectura Qwen3.5, una variante hibrida que intercala 16 capas de atención completa con 48 capas de atención lineal basadas en `Qwen3_5GatedDeltaNet`. Esta combinación reduce el coste computacional frente a un transformer puro, pero complica la cuantización: el autor documenta que `llm-compressor` no puede reproducir el paso de activación-aware scaling (AWQ) en las capas `linear_attn` debido a la firma dinámica de su método `forward`, por lo que esas capas se cuantizan con redondeo al más cercano (round-to-nearest) en lugar de AWQ. Las capas full-attention y los MLPs sí reciben escalado AWQ completo.

La cuantización se realizó con `llm-compressor` 0.13.0, usando un esquema W4A16 simétrico con group size 128, calibrado con 128 muestras de 512 tokens del dataset `HuggingFaceH4/ultrachat_200k`. La torre de visión se mantiene en bf16 porque su `intermediate_size` (4304) no es divisible por el group size (4304/128 = 33,625), lo que impide la cuantización por grupos. El proceso no incluye entrenamiento adicional ni fine-tuning; solo transformación de pesos.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo Qwen3.8-27B, incluyendo matemáticas, código y comprensión lectora.
- Procesamiento multimodal: acepta imágenes como entrada y produce texto, con capacidad verificada para leer texto renderizado e identificar formas, colores y posiciones.
- Tool calling: compatible con el parser `qwen3_xml` de vLLM, lo que permite integrar llamadas a funciones externas.
- Soporte de agentes: al soportar tool calling y razonamiento multi-paso, puede usarse en flujos de agente simples.
- Capacidades multilingües: no documentadas en la información disponible.
- Modo de pensamiento (thinking mode): no se menciona de forma explícita; el modelo base Qwen3.8 podría incluirlo, pero no hay confirmación en esta ficha.

## Casos de uso

- Asistente multimodal en GPU de consumo: desplegar un chatbot que analiza capturas de pantalla o diagramas en una RTX 3090, gracias a los 17,68 GiB de pesos en VRAM y la compatibilidad con vLLM.
- Procesamiento de documentos con imágenes: extraer y razonar sobre texto en facturas, formularios o manuales técnicos, combinando OCR (a través de la torre de visión) con generación de respuestas.
- Agente de automatización con tool calling: integrar el modelo en un pipeline que recibe imágenes (por ejemplo, estado de un panel de control) y ejecuta acciones mediante funciones externas, usando el parser `qwen3_xml`.
- Prototipado rápido de aplicaciones de visión-lenguaje: gracias a su tamaño reducido y licencia permisiva, es adecuado para validar ideas en hardware local antes de escalar a modelos mayores.
- Razonamiento matemático asistido: con un 97,5 % de exactitud en una muestra de GSM8K, puede emplearse en entornos educativos o de análisis numérico donde se requiera explicación paso a paso.
- Generación de código con contexto visual: interpretar diagramas de arquitectura o esquemas UML y generar código correspondiente, aprovechando la entrada de imágenes y la capacidad de generación de texto.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados provienen de pruebas realizadas por el autor en una RTX 3090 (24 GB, sm_86) con vLLM y `max_model_len=8192`. No se realizó comparación con el modelo bf16 original.

| Benchmark | Resultado |
|---|---|
| GSM8K (exact match, n = 40, temperatura 0) | 39/40 = 97,5 % |
| Vision: lectura de texto renderizado | exacta |
| Vision: identificación de forma / color / posición | correcta |

**Throughput medido** (RTX 3090, 256 tokens/request, `ignore_eos`):

| Concurrencia | Tok/s agregados | Tok/s por request | TTFT p50 |
|---|---|---|---|
| 1 | 41,1 | 41,1 | 0,38 s |
| 4 | 136,4 | 34,1 | 1,28 s |
| 8 | 221,5 | 27,7 | 2,21 s |
| 16 | 216,9 | 13,6 | 3,14 s |
| 32 | 211,8 | 6,6 | 13,72 s |

La saturación de throughput se alcanza con concurrencia 8; a partir de ahí, el agregado se mantiene plano y solo aumenta la latencia. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 17,68 GiB de pesos en VRAM, más overhead de KV cache y activaciones; el autor recomienda `gpu-memory-utilization 0.93` en una GPU de 24 GB.
- GPU recomendadas: RTX 3090 (verificada), RTX 4090, A100, H100 o cualquier GPU con al menos 24 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3090 y similares de 24 GB.
- Opciones de despliegue: vLLM (recomendado, con soporte para tool calling y limitación de imágenes), transformers (`AutoModelForImageTextToText`), y potencialmente otros frameworks compatibles con safetensors cuantizados.
- Latencia y throughput: los datos de la tabla anterior corresponden a una RTX 3090; en GPUs más potentes se esperan mejores cifras, aunque no se han publicado.
- Nota: para uso solo de texto, se puede liberar la caché del encoder de visión con `--limit-mm-per-prompt '{"image": 0}'`, ganando aproximadamente 5k tokens de KV extra.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo base Qwen3.8-27B es la referencia natural, pero no se han publicado resultados lado a lado entre la versión bf16 y esta cuantización. No se conocen otras cuantizaciones AWQ del mismo modelo en el momento de redactar esta ficha. Por tanto, la comparativa se limita a señalar que esta versión reduce el tamaño de 55,6 GB a 18 GB, con una pérdida de rendimiento no medida de forma sistemática.

## Limitaciones y advertencias

- 48 de las 64 capas (las `linear_attn`) se cuantizaron con round-to-nearest, no con AWQ. Aunque las pruebas de GSM8K no mostraron coste medible, esto no equivale a una cuantización AWQ completa y podría afectar a tareas no evaluadas.
- La torre de visión permanece en bf16, lo que añade 0,92 GB al peso total y limita el ahorro de memoria en escenarios multimodales.
- El padding de Marlin en algunas proyecciones GDN provoca una pérdida de throughput por operaciones de pad/slice en cada forward, aunque no afecta a la corrección.
- La cuantización es simétrica (W4A16), mientras que la formulación asimétrica de AWQ suele aproximarse mejor a la distribución original de pesos.
- La calibración se realizó con datos generales de chat (ultrachat_200k), no con datos de dominio específico; esto puede degradar el rendimiento en tareas muy especializadas.
- No se ha medido la diferencia exacta de rendimiento frente al modelo bf16 original, por lo que el impacto real de la cuantización es desconocido.
- Riesgo de alucinación y sesgos: no se han evaluado en esta versión; se heredan del modelo base sin verificación adicional.
- Para cargar el modelo con transformers, es imprescindible usar `AutoModelForImageTextToText` (o la clase `Qwen3_5ForConditionalGeneration` declarada en el config); usar `AutoModelForCausalLM` descarta silenciosamente la torre de visión y rompe la correspondencia con los pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/avyukth/Qwen3.8-27B-AWQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
