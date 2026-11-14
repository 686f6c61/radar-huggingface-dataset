# richardyoung/Qwen3.8-27B-ARA-heretic-GGUF

## Resumen

Qwen3.8-27B-ARA-heretic-GGUF es una compilación en formato GGUF del modelo richardyoung/Qwen3.8-27B-ARA-heretic, una versión del Qwen/Qwen3.8-27B a la que se le ha aplicado una técnica de "abliteración" (eliminación de rechazos) mediante Heretic 2.0 con Arbitrary-Rank Ablation (ARA). El autor, Richard J. Young, publica estas cuantizaciones como material para su investigación sobre eliminación de rechazos en modelos de pesos abiertos, comparando Qwen3.8, Gemma 4, Olmo 3.1 y Mistral Small 3.2 frente a sus predecesores.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 45,2 GB e incluye cuantizaciones Q4_K_M (16,5 GB), Q8_0 (28,6 GB) y una matriz de importancia (imatrix) de 27 MB, con planes de añadir IQ3_M, IQ4_XS, Q5_K_M y Q6_K.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de modificación de comportamiento (abliteración) que reduce la tasa de rechazo del 89,9% al 40,4% en el conjunto de evaluación del paper; por otro, advierte de que el modelo está pensado exclusivamente para investigación sobre eliminación de rechazos y sus defensas, no como asistente de propósito general. Solo se distribuyen pesos de texto: el proyector de visión del modelo base no está incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0; anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K; matriz de importancia (imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es una derivación del Qwen3.8-27B a la que se ha aplicado Arbitrary-Rank Ablation (ARA), el método de optimización de Heretic 2.0, para eliminar la dirección de rechazo en el espacio de activaciones. El proceso selecciona la configuración con menos rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1, tras una búsqueda de 100 ensayos. Los detalles sobre la arquitectura interna del Qwen3.8-27B (número de capas, atención, datos de entrenamiento originales) no están disponibles en la información proporcionada.

La conversión a GGUF se realizó con llama.cpp (commit `468fde9`): `convert_hf_to_gguf.py --outtype bf16` seguido de `llama-quantize`, ejecutado en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M emplean la matriz de importancia (calibración `calibration_datav3`, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estáticas. Cada archivo Q4_K_M se cargó y respondió a un prompt de prueba antes de su subida. Los pesos de origen se verificaron contra sus sumas SHA-256 (revisión `dec427b862b5`).

## Capacidades

- Generación de texto conversacional en inglés, con la misma base de capacidades del Qwen3.8-27B original.
- Cumplimiento de solicitudes que el modelo original rechaza: la tasa de rechazo baja del 89,9% al 40,4% en 972 prompts dañinos retenidos (juez WildGuard).
- Modo conversacional (tag `conversational` en Hugging Face).
- Compatible con endpoints (tag `endpoints_compatible`).
- Inferencia local vía llama.cpp y Ollama.
- Solo texto: la capacidad de visión del modelo base no está incluida en estas compilaciones.
- No se documentan en la información disponible capacidades de tool calling, agentes, matemáticas o razonamiento multi-paso específicas de esta versión.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como sujeto de estudio para medir la eficacia de la eliminación de rechazos con ARA y comparar con Gemma 4, Olmo 3.1 y Mistral Small 3.2, tal como plantea el paper del autor.
- Evaluación de defensas frente a la eliminación de rechazos: permite a investigadores de seguridad alinear y probar mecanismos de detección o mitigación sobre un modelo con rechazos reducidos.
- Estudio del efecto de la cuantización en el comportamiento de rechazo: el autor advierte de que las cuantizaciones no se evaluaron en el paper y que la cuantización puede alterar la conducta de rechazo, lo que convierte estos archivos en material para experimentos controlados.
- Despliegue local de referencia con Ollama o llama.cpp: útil para reproducir experimentos en máquinas sin GPU de datacenter, usando la build Q4_K_M de 16,5 GB.
- Análisis de divergencia KL y fidelidad respecto al original: la métrica de KL de primer token (0,061) permite estudiar cuánto se desvía el modelo modificado del base.
- Medición de tasas de rechazo con jueces automáticos: el conjunto de 972 prompts y el juez WildGuard descritos en el paper pueden replicarse sobre estas cuantizaciones para comparar con los resultados en bf16.

## Benchmarks y rendimiento

Los únicos datos publicados en la información proporcionada corresponden al modelo en precisión completa (bf16), no a las cuantizaciones GGUF:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 89,9% | 40,4% (393/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 63 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,061 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni para el modelo completo ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 16,5 GB de pesos, más overhead de contexto y caché KV; en la práctica requiere una GPU con 20-24 GB o más para contextos largos.
- VRAM estimada para Q8_0: aproximadamente 28,6 GB de pesos; requiere GPU de 32 GB o superior (A100 40 GB, H100, RTX 5090/A6000 de 48 GB) o bien ejecución parcial en CPU.
- GPU consumer: Q4_K_M puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen limitado; Q8_0 no cabe en GPUs consumer de 24 GB.
- Despliegue: llama.cpp (`llama-cli -hf richardyoung/Qwen3.8-27B-ARA-heretic-GGUF:Q4_K_M`) y Ollama (`ollama run richardyoung/qwen3.8-27b-ara-heretic`, que usa Q4_K_M por defecto; otras tallas como `:Q8_0` están disponibles como tags).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-ARA-heretic-GGUF (este) | ~26,9 mil millones | no disponible | 40,4% | apache-2.0 | GGUF |
| Qwen/Qwen3.8-27B (original) | no disponible | no disponible | 89,9% | no disponible | safetensors |
| richardyoung/Qwen3.8-27B-ARA-heretic (bf16) | ~26,9 mil millones | no disponible | 40,4% | apache-2.0 | safetensors |

El paper del autor compara además con Gemma 4, Olmo 3.1 y Mistral Small 3.2 frente a sus predecesores, pero los resultados concretos de esos modelos no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no asistente de propósito general: el autor indica explícitamente que se publica para estudiar la eliminación de rechazos y sus defensas.
- Reduce los rechazos de forma sustancial (del 89,9% al 40,4%), lo que implica que puede cumplir solicitudes dañinas que el original rechaza; el uso es responsabilidad del usuario y debe ser lícito.
- Las cuantizaciones no se evaluaron en el paper y la cuantización puede alterar el comportamiento de rechazo; los números de la tabla no son directamente extrapolables a los archivos GGUF.
- Solo inglés: el campo `language` declara únicamente `en`.
- Solo texto: el proyector de visión del modelo base no está incluido.
- Longitud de contexto no documentada en la información disponible.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información proporcionada.
- Licencia Apache 2.0 heredada del modelo fuente, con las mismas restricciones de uso que el modelo original; conviene consultar la model card del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen3.8-27B-ARA-heretic-GGUF
- Modelo base (bf16): https://huggingface.co/richardyoung/Qwen3.8-27B-ARA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper citado: Richard J. Young, *Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors* (2026; enlace arXiv pendiente de añadir según la model card)
