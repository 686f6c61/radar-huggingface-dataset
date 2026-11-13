# richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-code-GGUF

## Resumen

Qwen2.5-Coder-32B-Instruct-heretic1x-code-GGUF es una compilación en formato GGUF de un modelo derivado de Qwen2.5-Coder-32B-Instruct, el modelo de código de 32.700 millones de parámetros de Alibaba Qwen. La modificación consiste en una "abliteración" (eliminación de rechazos) aplicada con la herramienta Heretic 1.x (heretic-llm 1.4.0), que emplea ablación direccional de rango 1 con direcciones de rechazo derivadas de código. El autor de la compilación y del modelo intermedio es Richard J. Young, que publica estos artefactos como material de investigación sobre abliteración y su evaluación.

El modelo base conserva la arquitectura transformer decoder-only de Qwen2.5-Coder-32B-Instruct, con 32.763.876.352 parámetros totales y una ventana de contexto nativa de 32.768 tokens (dato del modelo original Qwen2.5-Coder; no se especifica en la model card de esta compilación). La contribución de esta ficha es la cuantización GGUF Q4_K_M de 19,9 GB, pensada para ejecución local con llama.cpp y Ollama, junto con una importance matrix (imatrix) de 30 MB para cuantizaciones de menor precisión.

La relevancia es doble: por un lado, ofrece una vía práctica de ejecutar un modelo de código de 32B en hardware de consumo mediante cuantización 4 bits; por otro, sirve como caso de estudio reproducible de abliteración, con métricas publicadas de reducción de rechazos (del 75,3% al 61,1% en 972 prompts dañinos retenidos, según el paper del autor). No obstante, no es un asistente de propósito general y su uso previsto es la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder), sin confirmar en la model card de esta compilación |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta model card (el modelo base Qwen2.5-Coder-32B-Instruct soporta 32.768 tokens nativos, ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | Q4_K_M (19,9 GB); anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K, Q8_0; imatrix de 30 MB |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 (con las mismas restricciones de uso que el modelo fuente) |
| Formato de pesos | GGUF (safetensors en el modelo fuente) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-32B-Instruct: un transformer decoder-only denso de 32.700 millones de parámetros, entrenado por Alibaba Qwen sobre un corpus masivo de código y texto, con fases de preentrenamiento, ajuste supervisado y preferencias (RLHF/DPO) según la documentación pública de la familia Qwen2.5. La model card de esta compilación no detalla el número de tokens de entrenamiento ni la composición del dataset, por lo que esos datos deben consultarse en la ficha del modelo original.

La innovación técnica de esta versión es la abliteración con Heretic 1.x: una ablación direccional de rango 1 que proyecta fuera del espacio de activaciones una dirección de rechazo calculada a partir de datos derivados de código. Según el paper del autor, se seleccionó el trial con menos rechazos en el conjunto de desarrollo sujeto a una divergencia KL de primer token ≤ 0,01 (200 trials); el trial elegido presenta una KL de 0,004 respecto al original. Los pesos publicados en safetensors se convirtieron a GGUF con llama.cpp (commit `468fde9`, `convert_hf_to_gguf.py --outtype bf16` y `llama-quantize` en CPU), verificando cada fichero contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la importance matrix `calibration_datav3` (128 chunks de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estáticas.

## Capacidades

- Generación de texto y código: hereda las capacidades del modelo base Qwen2.5-Coder-32B-Instruct en generación, razonamiento y programación.
- Razonamiento matemático y resolución de problemas: capacidades del modelo base, no evaluadas específicamente en esta compilación.
- Cumplimiento de solicitudes que el modelo original rechaza: el modelo "complace con muchas peticiones que el original rechaza", según la model card.
- Conversacional: pipeline `text-generation` con etiqueta `conversational`.
- Tool calling / function calling: no disponible en la información proporcionada para esta compilación (el modelo base Qwen2.5-Coder lo soporta).
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según la model card (`language: en`).
- Modo thinking, visión o audio: no disponible; no se documentan.

## Casos de uso

- Investigación sobre abliteración: ejecutar el modelo y medir la tasa de rechazo frente al original con jueces automáticos (p. ej. WildGuard) para replicar o contrastar los resultados del paper de Young sobre selección de trials y comparación de herramientas.
- Evaluación de defensas frente a la eliminación de rechazos: usar el modelo como adversario controlado en pipelines de red-teaming y clasificadores de seguridad, dado que su tasa de rechazo documentada (61,1%) permite calibrar detectores.
- Inferencia local de un modelo de código de 32B: con la cuantización Q4_K_M (19,9 GB) puede desplegarse en estaciones de trabajo con GPU de 24 GB o en configuraciones CPU+GPU mediante llama.cpp u Ollama, para autocompletado y generación de código en entornos sin conexión.
- Experimentos de cuantización: comparar el comportamiento de rechazo entre Q4_K_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0, ya que la propia model card advierte que la cuantización puede alterar la conducta de rechazo y los ficheros GGUF no fueron evaluados en el paper.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo una intervención de una sola dirección en el espacio de activaciones modifica el comportamiento de un LLM con una KL de 0,004 en el primer token.
- Pruebas de robustez de pipelines de moderación: alimentar el modelo con prompts que el original rechaza para verificar que las capas de filtrado posteriores (guardrails, clasificadores) actúan con independencia del comportamiento del modelo generador.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al modelo en precisión completa (bf16), no a los ficheros GGUF de esta compilación:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 75,3% | 61,1% (594/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | no disponible | 31 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | no disponible | 0,004 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible para esta compilación ni para el modelo abliterado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20-22 GB para Q4_K_M (fichero de 19,9 GB más overhead de contexto y caché KV); las variantes IQ3_M e IQ4_XS anunciadas reducirán el requisito por debajo de los 18 GB, y Q8_0 lo situará en torno a 34-36 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M en GPU única; A100 40/80 GB o H100 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: sí, Q4_K_M en tarjetas de 24 GB; en tarjetas de 16 GB requerirá offload parcial a CPU o cuantizaciones menores (IQ3_M, IQ4_XS).
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...:Q4_K_M`, etiqueta `latest` por defecto), y cualquier runtime compatible con GGUF; la model card no menciona vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct-heretic1x-code-GGUF (este) | 32,7B | no disponible en la card | GGUF, apache-2.0 | Abliterado; rechazo 61,1% en 972 prompts |
| Qwen/Qwen2.5-Coder-32B-Instruct | 32,7B | 32.768 nativos (131.072 con YaRN) | safetensors/GGUF, apache-2.0 | Original sin abliterar; rechazo 75,3% en el mismo conjunto |
| richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-code | 32,7B | no disponible | safetensors, apache-2.0 | Modelo fuente en precisión completa del que derivan estos GGUF |
| Otras herramientas de abliteración (Heretic 2.0, OBLITERATUS) | según modelo base | según modelo base | según modelo base | Comparadas en el paper de Young; resultados no disponibles en esta información |

## Limitaciones y advertencias

- Modelo de investigación, no asistente de propósito general: la model card lo declara explícitamente y desaconseja su uso como asistente.
- Eliminación parcial de rechazos: la tasa de rechazo baja del 75,3% al 61,1%, pero no desaparece; el comportamiento ante prompts dañinos es menos predecible que en el original.
- La cuantización puede alterar la conducta de rechazo: los ficheros GGUF no fueron evaluados en el paper y las métricas publicadas corresponden solo a bf16.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones específicas para esta variante.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está documentado.
- Contexto: la model card no especifica la longitud de contexto soportada por la build GGUF; debe validarse empíricamente antes de usarla en producción.
- Licencia: apache-2.0 con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso lícito.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base y los del proceso de abliteración.
- Sin métricas de rendimiento (latencia, throughput) ni benchmarks de calidad publicados para esta compilación.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-code-GGUF
- Modelo fuente en precisión completa: https://huggingface.co/richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-code
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct/blob/main/LICENSE
- Paper citado (arXiv pendiente de publicar): Young, R. J. *The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder* (2026); enlace arXiv no disponible.
- Repositorio de llama.cpp (herramienta de conversión y cuantización): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
