# Jeesup/svd-safety-l3_svdllmjbbk5sep12_r40

## Resumen

`Jeesup/svd-safety-l3_svdllmjbbk5sep12_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta conservar el 60,0 % de los parámetros densos del modelo original (es decir, un 40,00 % de parámetros eliminados). El autor, Jeesup, lo publica como un artefacto de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general.

El checkpoint forma parte de una rejilla experimental que cruza distintas reglas de selección de componentes con distintos presupuestos de compresión. En este caso concreto se empleó un conjunto de calibración mixto (utilidad + seguridad): ventanas de WikiText-2 combinadas con los primeros 12 objetivos de JailbreakBench y las respuestas de rechazo del propio Llama-3-8B-Instruct. Tras la compresión se aplicó la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (U y luego V) sobre alpaca-cleaned.

Su relevancia es metodológica: cuantifica el coste en seguridad de la compresión SVD y sirve como sujeto de evaluación para estudiar recuperación de alineamiento en modelos comprimidos. Cualquier uso en producción debe considerarse inadecuado sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 (fracción resultante 0,5998 del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 admite 8.192 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3-8B-Instruct, un transformer decoder-only denso de 8.030 millones de parámetros. Sobre él se aplica SVD-LLM, que descompone las matrices de pesos y descarta componentes según una regla de selección basada en la utilidad estimada a partir de activaciones de calibración. En esta celda se usa la SVD blanqueada de los autores (AIoT-MLSys-Lab/SVD-LLM) con un conjunto de calibración agrupado: `S S^T = sum_WikiText x x^T + sum_safety x x^T`. La parte de utilidad son 255 ventanas de 2.048 tokens de WikiText-2 train (muestreo de SVD-LLM, semilla 42, todas las posiciones); la parte de seguridad son los primeros 12 de 94 objetivos de JailbreakBench con los rechazos del propio Llama-3-8B-Instruct (semilla 42, respuesta truncada a sus primeros 5 tokens, 347 posiciones en total). La proporción efectiva de posiciones de seguridad es de solo 0,0007.

Tras eliminar el 40,00 % de los parámetros (semilla 42), se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. No se documenta RLHF ni DPO adicionales en esta celda; la alineación heredada proviene del modelo base.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base.
- Razonamiento y respuesta a instrucciones de complejidad media, con la degradación esperable por la compresión al 60 % de parámetros.
- Capacidad de rechazo ante peticiones dañinas, pero medida y parcialmente dañada: el propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad.
- Soporte de tool calling y function calling: no documentado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base lo permite, pero no se valida para este checkpoint.
- Capacidades multilingües: no documentadas; los idiomas figuran como no disponibles.
- No dispone de visión, audio ni modo thinking explícito.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como sujeto experimental para medir la pérdida de utilidad (perplejidad en WikiText-2 de 28,4517) frente al modelo denso original.
- Estudio de alineamiento y seguridad bajo compresión: permite cuantificar el aumento de la tasa de éxito de ataques (ASR en AdvBench de 0,2731 y en StrongREJECT de 0,2716) y comparar reglas de selección de componentes.
- Evaluación de sobre-rechazo: con una tasa macro de sobre-rechazo de 0,1304 medida con WildGuard, es útil para estudiar el equilibrio entre seguridad y utilidad conversacional.
- Reproducción de experimentos SVD-LLM: la provenance detallada (semilla, calibración, hiperparámetros LoRA) permite replicar la celda y compararla con otras del grid.
- Benchmark de pipelines de evaluación de seguridad: al estar disponible en transformers y ser compatible con text-generation-inference, puede integrarse en arneses automatizados de red-teaming.
- Docencia y divulgación técnica: como ejemplo didáctico de cómo una compresión agresiva afecta a propiedades de alineamiento no supervisadas directamente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2731 |
| StrongREJECT ASR (juez HarmBench) | 0,2716 |
| Sobre-rechazo macro (WildGuard) | 0,1304 |
| Perplejidad en WikiText-2 | 28,4517 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,5009 |

No se proporcionan comparaciones directas con el modelo base ni con otras celdas de la rejilla en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos; en 4 bits, en torno a 4,5-5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto limitado; RTX 3090/4080 (16-24 GB) viable con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en bf16 con contexto moderado; en GPUs de 8-12 GB solo mediante cuantización no oficial.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk5sep12_r40 | 8,03 B (60 % del denso) | no disponible | Llama 3 Community | Checkpoint de investigación, seguridad degradada medida |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas del grid SVD-LLM del mismo autor | ~8 B con distintos presupuestos | no disponible | Llama 3 Community | Variantes con distintas reglas de selección y niveles de compresión |
| Modelos comprimidos SVD-LLM publicados por AIoT-MLSys-Lab | variable | no disponible | según modelo base | Implementación de referencia del método de compresión |

No se dispone de comparaciones de rendimiento publicadas entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente desplegable: el propio autor lo describe como sujeto experimental y no como modelo de chat de propósito general.
- Seguridad degradada de forma medible: la compresión eleva la tasa de éxito de ataques; el ASR en AdvBench es de 0,2731 y en StrongREJECT de 0,2716.
- Sobre-rechazo no trivial: 0,1304 macro con WildGuard, lo que indica rechazos indebidos en consultas benignas.
- Pérdida de utilidad: perplejidad en WikiText-2 de 28,4517 y precisión media zero-shot de 0,5009 en 7 tareas.
- Proporción de calibración de seguridad muy baja (0,0007 de posiciones), lo que limita la representatividad del ajuste de seguridad.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe fiable.
- Riesgo de alucinación no cuantificado en la información disponible.
- Licencia Llama 3 Community: restricciones de uso comercial y obligaciones de atribución recogidas en `LICENSE` y `USE_POLICY.md`; el uso de este derivado está sujeto a ellas.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk5sep12_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: incluida en el repositorio (`LICENSE` y `USE_POLICY.md`)
