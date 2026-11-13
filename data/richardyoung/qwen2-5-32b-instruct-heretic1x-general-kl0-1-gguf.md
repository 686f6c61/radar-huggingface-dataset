# richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1-GGUF

## Resumen

Qwen2.5-32B-Instruct-heretic1x-general-kl0.1-GGUF es una compilación en formato GGUF del modelo richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1, una versión "abliterada" (con los mecanismos de rechazo eliminados) de Qwen/Qwen2.5-32B-Instruct. La abliteración se realizó con Heretic 1.x (heretic-llm 1.4.0) mediante ablación direccional de rango 1 con direcciones de rechazo generales, reexportada desde la misma búsqueda con un límite de divergencia KL de 0,1. El autor es Richard J. Young, y los archivos se publican como material de investigación sobre eliminación de rechazos y su evaluación, no como asistente de propósito general.

El modelo conserva la arquitectura del Qwen2.5-32B-Instruct original: un transformer decoder-only denso de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones), con licencia Apache 2.0. Esta compilación GGUF está pensada para ejecución local con llama.cpp y Ollama, e incluye cuantizaciones Q4_K_M (19,9 GB) y Q8_0 (34,8 GB), además de una matriz de importancia (imatrix) de 30 MB. El repositorio ocupa 54,7 GB en total.

La relevancia del modelo es doble: por un lado, demuestra hasta qué punto la ablación direccional puede reducir la tasa de rechazo (del 76,8% al 11,6% en el conjunto de evaluación del paper) con un coste de divergencia KL bajo (0,0642 en el primer token); por otro, sirve como objeto de estudio para medir la eficacia de las herramientas de abliteración y las defensas frente a ellas. No se han publicado resultados de benchmarks de capacidad general para esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parametros totales | 32.763.876.352 (32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (19,9 GB), Q8_0 (34,8 GB); en preparacion IQ3_M, IQ4_XS, Q5_K_M, Q6_K |
| Idiomas soportados | Ingles (segun la model card; el modelo base Qwen2.5 es multilingue, pero esta variante declara solo `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base de origen |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer decoder-only denso con atención por causalidad estándar, sin mezcla de expertos. Sobre ese modelo base, el autor aplicó Heretic 1.x (heretic-llm 1.4.0), que implementa ablación direccional de rango 1: se identifican direcciones de rechazo en el espacio de activaciones y se sustraen de los pesos mediante una proyección de rango bajo. La variante "general" usa direcciones de rechazo generales en lugar de direcciones específicas por prompt, y el proceso se reexportó desde la misma búsqueda con un límite de divergencia KL de 0,1 respecto al modelo original.

La selección del trial siguió la regla "menos rechazos en el conjunto de desarrollo con KL <= 0,1", dentro de un estudio de 200 trials. El resultado en precisión completa (bf16) es una tasa de rechazo del 11,6% (113 de 972 prompts dañinos retenidos, juzgados con WildGuard) frente al 76,8% del original, con una divergencia KL de primer token de 0,0642 y 50 rechazos por palabra clave en los 100 prompts de ajuste. Los archivos GGUF se generaron con llama.cpp (commit `468fde9`) mediante `convert_hf_to_gguf.py --outtype bf16` y `llama-quantize` sobre CPU; las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la matriz de importancia (calibration_datav3, 128 fragmentos de 512 tokens calculados sobre la build Q8_0), mientras que Q6_K y Q8_0 son estáticas. No se detalla la composición del dataset de entrenamiento original de Qwen2.5-32B-Instruct en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento, matemáticas y generación de código (capacidades del modelo base, no reevaluadas en esta variante).
- Cumplimiento de solicitudes que el modelo original rechaza: la tasa de rechazo baja del 76,8% al 11,6% en el conjunto de evaluación del paper.
- Soporte de tool calling y function calling: no confirmado explícitamente para esta variante en la información disponible; el modelo base Qwen2.5-32B-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta variante.
- Capacidades multilingües: la model card declara únicamente inglés (`en`), aunque el modelo base Qwen2.5 es multilingüe.
- Sin modo thinking explícito, visión ni audio documentados en esta variante.

## Casos de uso

- Investigación sobre abliteración: el modelo permite estudiar cómo la ablación direccional de rango 1 altera el comportamiento de rechazo con un coste KL controlado (0,0642), sirviendo como referencia reproducible en estudios comparativos de herramientas como Heretic 1.x, Heretic 2.0 y OBLITERATUS.
- Evaluación de defensas frente a la eliminación de rechazos: al conocer la tasa de rechazo residual (11,6%), se puede medir la eficacia de clasificadores de seguridad, filtros de salida y técnicas de alineación adicional en un modelo deliberadamente debilitado.
- Estudio de calibración de cuantizaciones: la disponibilidad de Q4_K_M y Q8_0, junto con la imatrix, permite comparar cómo la cuantización altera el comportamiento de rechazo respecto al modelo bf16, un fenómeno que el autor advierte explícitamente que puede ocurrir.
- Despliegue local en hardware de consumo: la cuantización Q4_K_M (19,9 GB) permite ejecutar un modelo de 32,8 B en GPUs con 24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos bf16.
- Análisis de robustez de pipelines de moderación: integrar el modelo en un banco de pruebas para verificar que los sistemas de moderación aguas abajo detectan contenido que el modelo original habría rechazado.
- Reproducibilidad de experimentos: los archivos incluyen sumas SHA-256 y están construidos con un commit concreto de llama.cpp, lo que facilita replicar resultados en entornos de investigación.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo en precisión completa (bf16) y miden comportamiento de rechazo, no capacidad general:

| Metrica | Original (Qwen2.5-32B-Instruct) | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 76,8% | 11,6% (113/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | No disponible | 50 |
| Divergencia KL de primer token respecto al original | No disponible | 0,0642 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible. Los archivos GGUF cuantizados no fueron evaluados en el paper, y el autor advierte que la cuantización puede modificar el comportamiento de rechazo.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 20-22 GB incluyendo overhead de contexto; requiere GPU de 24 GB o más para contexto moderado.
- VRAM estimada para Q8_0: aproximadamente 35-38 GB; requiere A100 40 GB, H100, RTX 6000 Ada (48 GB) o configuraciones multi-GPU.
- GPUs consumer compatibles: RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden ejecutar Q4_K_M; Q8_0 no cabe en una sola GPU consumer de 24 GB.
- GPUs de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para Q8_0; A100 o H100 para mayor throughput.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run hf.co/...:Q4_K_M`), y servidores compatibles con endpoints de la API de Hugging Face. vLLM y TGI no están documentados para esta compilación GGUF en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La ejecución en CPU es posible con llama.cpp, pero con throughput bajo para un modelo de 32,8 B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-heretic1x-general-kl0.1-GGUF (este) | 32,8 B | No disponible | Abliterado con Heretic 1.x, KL <= 0,1 | Apache 2.0 | GGUF |
| Qwen/Qwen2.5-32B-Instruct | 32,8 B | No disponible en la informacion | Asistente alineado original | Apache 2.0 | Safetensors, GGUF (comunidad) |
| richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1 | 32,8 B | No disponible | Abliterado, pesos bf16 de origen | Apache 2.0 | Safetensors |
| Heretic 2.0 y OBLITERATUS sobre Qwen2.5 | No disponible | No disponible | Otras herramientas de abliteracion comparadas en el paper | No disponible | No disponible |

La comparación relevante es frente al modelo original y a las demás herramientas de abliteración evaluadas en el paper del autor; no se dispone de datos de benchmarks de capacidad que permitan comparar rendimiento general con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- El modelo elimina deliberadamente gran parte de los mecanismos de rechazo: cumple muchas solicitudes que el original rechaza, lo que lo hace inadecuado como asistente de propósito general y potencialmente peligroso si se despliega sin salvaguardas externas.
- La tasa de rechazo residual del 11,6% corresponde al modelo bf16; las cuantizaciones GGUF no fueron evaluadas y pueden alterar ese comportamiento en cualquier dirección.
- Sesgos conocidos: no documentados específicamente para esta variante; hereda los del modelo base Qwen2.5-32B-Instruct.
- Riesgo de alucinación: no cuantificado en la información disponible; la ablación puede afectar a la calibración del modelo, pero no hay datos al respecto.
- Idioma: la model card declara únicamente inglés, aunque el modelo base es multilingüe; el comportamiento en otros idiomas tras la ablación no está evaluado.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe explícitamente el uso previsto a investigación sobre eliminación de rechazos y medición de defensas; el usuario es responsable del uso lícito.
- El modelo no ha sido sometido a un proceso de alineación posterior a la ablación; no hay garantías de seguridad en producción.
- Los datos de benchmarks de capacidad general no están publicados, por lo que no se puede afirmar que las capacidades del modelo base se conserven intactas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1-GGUF
- Modelo base de origen (bf16): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Paper citado (arXiv pendiente de enlace): Young, R. J. "The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder", 2026.
- Heretic (herramienta de abliteracion): no disponible en la informacion proporcionada.
- llama.cpp: no disponible en la informacion proporcionada.
