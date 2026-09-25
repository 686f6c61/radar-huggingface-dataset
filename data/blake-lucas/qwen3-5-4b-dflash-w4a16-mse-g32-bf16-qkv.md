# blake-lucas/Qwen3.5-4B-DFlash-W4A16-MSE-G32-BF16-QKV

## Resumen

Qwen3.5-4B-DFlash-W4A16-MSE-G32-BF16-QKV es una versión cuantizada del modelo borrador (draft) z-lab/Qwen3.5-4B-DFlash, publicada por el usuario blake-lucas. No es un modelo de chat autónomo: es un draft de decodificación especulativa de seis capas que propone tokens que un modelo objetivo (target) Qwen3.5-4B verifica después. Su función es acelerar la inferencia del target reduciendo el número de pasos de decodificación autoregresiva que este debe ejecutar.

La aportación principal es la receta de cuantización: las proyecciones Q, K y V se mantienen en BF16 para que el cargador DFlash de vLLM pueda construir su proyección KV fusionada a partir de pesos ordinarios, mientras que el resto de capas `Linear` usan pesos INT4 simétricos con grupo de 32 y selección de escala por error cuadrático medio (MSE). El checkpoint ocupa aproximadamente 470 MiB y declara 634.425.856 parámetros en el repositorio de safetensors.

El modelo es relevante porque demuestra que un draft de decodificación especulativa se puede comprimir a INT4 sin degradar la tasa de aceptación de tokens propuestos, con una medición reportada de 59,5% de aceptación y 1.873 tokens de salida por segundo sobre un target Qwen3.5-4B AWQ en una RTX 3090. La licencia Apache-2.0 y el soporte directo en vLLM lo hacen desplegable en infraestructura de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 6 capas, modelo borrador (draft) para decodificación especulativa DFlash; requiere estados ocultos, embeddings de ruido y posiciones del modelo objetivo |
| Parametros totales | 634.425.856 (según safetensors del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; LLM Explorer indica 256.000 tokens para el modelo base z-lab/Qwen3.5-4B-DFlash |
| Tipos de cuantizacion | W4A16 (pesos INT4 simétricos, grupo 32, selección de escala MSE, `pack-quantized` de compressed-tensors, sin calibración de activaciones); Q/K/V en BF16; soporta ejecución W4A8 en runtime con `VLLM_MARLIN_INPUT_DTYPE=int8` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), con `quantize.py` y `recipe.yaml` incluidos |

## Arquitectura y entrenamiento

El modelo es un draft de seis capas derivado de z-lab/Qwen3.5-4B-DFlash (revisión de pesos `9a1996ccf887b79ab3af4fcbf8c1d1f4b5658bcf`). DFlash es un método de decodificación especulativa en el que el borrador consume estados ocultos del target, embeddings de ruido y posiciones, y propone bloques de tokens que el target verifica. La model card indica explícitamente que no se trata de un forward de texto convencional, y que por eso no se aplicó calibración de activaciones AWQ ni GPTQ: los scripts genéricos de la fork esperan entradas de texto y usarían una distribución de entrada incorrecta.

La innovación concreta de este release es la mezcla de precisiones. Las seis capas mantienen todas las proyecciones Q, K y V en BF16, de modo que el cargador DFlash estándar de vLLM puede construir su proyección KV fusionada con pesos ordinarios, sin parches de código fuente. El resto de capas `Linear` se cuantizan a INT4 simétrico con tamaño de grupo 32 y selección de escala por MSE. Frente a un control emparejado con cuantización RTN mixta y grupo 128, el RMSE de reconstrucción sobre 540.016.640 valores de peso bajó de 0,006137 a 0,005311, una reducción del 13,4%. El autor advierte que se trata de una medición de error de pesos, no de un benchmark de calidad del modelo. No se documentan datos de entrenamiento, número de tokens ni etapas de RLHF o DPO, ya que el modelo es una cuantización del checkpoint base.

## Capacidades

- Proposición de tokens especulativos como draft: genera candidatos que el modelo objetivo verifica antes de aceptarlos.
- Decodificación especulativa con `num_speculative_tokens` configurable (ejemplo probado con 8).
- Ejecución de capas INT4 con activaciones INT8 dinámicas en runtime (W4A8) mediante el fork Ampere de vLLM.
- Integración con `compressed-tensors` y con el pipeline `vllm` de HuggingFace.
- No es un modelo de chat independiente: la model card declara `inference: false` y advierte de que no debe usarse como modelo autónomo.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento para este draft.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de inferencia de alto rendimiento sobre Qwen3.5-4B: emparejar este draft con un target Qwen3.5-4B cuantizado permite reducir el coste por token generado, con tasas medidas de 1.873 tokens de salida por segundo en una RTX 3090.
- Despliegue en una única GPU de gama de consumo: el checkpoint ocupa unos 470 MiB, por lo que el draft más el target AWQ caben en 24 GB de VRAM, algo relevante para autohospedaje y entornos de desarrollo.
- Atención al cliente multi-turno con contexto largo: con 16 GiB de memoria de caché KV el par target/draft reportó 405.431 tokens KV, suficiente para ocho contextos de 32K concurrentes.
- Generación de código en asistentes de IDE: en las pruebas se usaron ocho prompts de código concurrentes que produjeron código coherente, lo que encaja con escenarios de autocompletado y revisión asistida.
- Despliegue con vLLM en producción: la configuración `--speculative-config` con `{"method":"dflash"}` se integra sin parchear el código fuente de vLLM, lo que simplifica la operación en clúster.
- Investigación sobre cuantización de drafts especulativos: el repositorio incluye `quantize.py` y `recipe.yaml`, útiles para replicar la receta INT4 grupo 32 con MSE y compararla con alternativas RTN o W8A16.
- Reducción del coste de inferencia en lotes pequeños: con `--max-num-seqs 8` y KV en `int8_per_token_head`, el par está pensado para cargas de baja concurrencia y contextos largos en los que la decodificación especulativa aporta más.
- Evaluación comparativa de drafts: sirve como referencia frente al draft W8A16 previo de Naveen sobre el mismo target (2.623 tokens propuestos por segundo, 53,5% de aceptación, 1.716 tokens de salida por segundo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor mide únicamente error de reconstrucción de pesos y métricas de servicio, y advierte que las comparaciones tienen precisión limitada por diferencias en historiales de reinicio y longitudes de salida cortas.

| Metrica | Este modelo (INT4 MSE G32) | Draft W8A16 previo (Naveen) | Control RTN mixto grupo 128 |
|---|---|---|---|
| Tokens borrador propuestos por segundo (mediana) | 2.618 | 2.623 | no disponible |
| Aceptación de tokens borrador (mediana) | 59,5% | 53,5% | 59,4% |
| Tokens de salida completados por segundo (mediana) | 1.873 | 1.716 | 1.921 |
| RMSE de reconstrucción de pesos | 0,005311 | no disponible | 0,006137 (control RTN grupo 128) |

Mediciones realizadas sobre ocho prompts cortos de código concurrentes, con ocho repeticiones en caliente, sobre una RTX 3090 con el fork Ampere de vLLM 0.29.0. El RMSE se calculó sobre 540.016.640 valores de peso cuantizados. El autor señala que la receta MSE no está probada como mejora de velocidad o aceptación de extremo a extremo en esos prompts.

## Requisitos de hardware

- VRAM del draft: el checkpoint comprimido ocupa aproximadamente 470 MiB. El modelo base sin cuantizar (537M parámetros según llmrun.dev) requeriría unos 1,40 GB en BF16.
- VRAM del conjunto: el target cyankiwi/Qwen3.5-4B-AWQ-4bit más el draft caben en una GPU de 24 GB; la prueba de referencia se ejecutó en una RTX 3090.
- Memoria de caché KV: con `--kv-cache-memory-bytes 17179869184` (16 GiB) el par reportó 405.431 tokens KV. Ocho contextos de 32K entran; ocho de 64K no.
- GPU recomendadas: RTX 3090 (Ampere) validada explícitamente con el fork; GPUs Ampere o superiores compatibles con Marlin. No se documentan pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? Sí, en GPUs de 24 GB o más, siempre que se use un target cuantizado en 4 bits.
- Opciones de despliegue: vLLM (obligatorio para el método DFlash) con la imagen del fork avesed/vllm-ampere-optimized basada en vLLM 0.29.0, cuantización `compressed-tensors` y `--dtype bfloat16`. No se documenta soporte para llama.cpp, Ollama, TGI ni transformers.
- Throughput y latencia estimados: 2.618 tokens borrador propuestos por segundo, 59,5% de aceptación y 1.873 tokens de salida por segundo en la configuración probada.
- Variables de entorno relevantes: `VLLM_MARLIN_INPUT_DTYPE=int8` y `FAMP_MARLIN=1` para ejecutar capas INT4 con activaciones INT8 dinámicas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| blake-lucas/Qwen3.5-4B-DFlash-W4A16-MSE-G32-BF16-QKV | Draft especulativo INT4 (Q/K/V BF16) | 634.425.856 | no disponible | Apache-2.0 | 2.618 tok/s borrador, 59,5% aceptación, 1.873 tok/s salida |
| z-lab/Qwen3.5-4B-DFlash | Draft especulativo base (BF16) | ~537M según fuentes externas | 256K según LLM Explorer | no disponible en la información proporcionada | no disponible |
| Draft W8A16 previo de Naveen | Draft especulativo W8A16 | no disponible | no disponible | no disponible | 2.623 tok/s borrador, 53,5% aceptación, 1.716 tok/s salida |
| Control RTN mixto grupo 128 (experimento del autor) | Draft especulativo INT4 RTN | no disponible | no disponible | no disponible | 59,4% aceptación, 1.921 tok/s salida |

La comparación directa con z-lab/Qwen3.5-4B-DFlash en BF16 no está disponible en términos de velocidad o aceptación. El autor indica que el control RTN/grupo 128 obtuvo mayor throughput de salida (1.921 frente a 1.873) y una aceptación prácticamente idéntica, por lo que la ventaja de la receta MSE no queda demostrada de extremo a extremo.

## Limitaciones y advertencias

- No es un modelo autónomo. La model card lo declara `inference: false` y requiere siempre un target Qwen3.5-4B compatible que verifique cada token propuesto.
- Las comprobaciones cualitativas (código coherente, explicaciones aritméticas y de búsqueda binaria) no establecen precisión del draft por sí solas, porque el target verifica las propuestas.
- El RMSE de pesos es una medida de error de reconstrucción, no un indicador de calidad del modelo; no debe presentarse como benchmark de rendimiento.
- La receta MSE no ha demostrado mejorar la velocidad ni la aceptación de extremo a extremo frente al control RTN/grupo 128, que de hecho obtuvo mayor throughput de salida en las pruebas.
- Las comparaciones de throughput tienen precisión limitada: historiales de reinicio distintos y salidas cortas.
- Contexto amplio con alta concurrencia: ocho contextos de 64K no caben en la asignación de 16 GiB de caché KV probada.
- Idiomas soportados no documentados; no hay información sobre cobertura multilingüe en la model card.
- Dependencia de infraestructura específica: requiere vLLM con soporte DFlash y, para el modo W4A8, el fork Ampere avesed/vllm-ampere-optimized. No hay soporte documentado en llama.cpp, Ollama o TGI.
- Licencia Apache-2.0 heredada del checkpoint de origen, que permite uso comercial; conviene verificar igualmente la licencia del target utilizado.
- Sin sesgos documentados ni evaluaciones de seguridad en la información disponible; cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blake-lucas/Qwen3.5-4B-DFlash-W4A16-MSE-G32-BF16-QKV
- Modelo base: https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- Target usado en las pruebas: https://huggingface.co/cyankiwi/Qwen3.5-4B-AWQ-4bit
- Fork de vLLM para Ampere: https://github.com/avesed/vllm-ampere-optimized
- Repositorio de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/z-lab%2FQwen3.5-4B-DFlash,76bocmc0tItBnIF3zySyLL
- Requisitos de hardware del modelo base: https://llmrun.dev/model/z-lab-qwen3-5-4b-dflash
