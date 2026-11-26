# Jeesup/svd-safety-l3_svdllmjbbk1sep12_r40

## Resumen

`Jeesup/svd-safety-l3_svdllmjbbk1sep12_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante la técnica SVD-LLM hasta conservar el 59,98 % de los parámetros densos originales (es decir, un 40 % de parámetros eliminados). El autor, Jeesup, lo publica como un artefacto experimental dentro de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor.

No se trata de un modelo conversacional de propósito general, sino de una celda concreta de una malla de experimentos que cruza reglas de selección de componentes y presupuestos de compresión. En este caso, la calibración combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad (12 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct), y tras la compresión se aplica una recuperación de segunda etapa mediante LoRA secuencial sobre U y V con el dataset alpaca-cleaned.

El interés del checkpoint es fundamentalmente metodológico: permite medir el coste en seguridad (tasas de ataque exitoso en AdvBench y StrongREJECT) y en utilidad (perplejidad en WikiText-2, precisión zero-shot en siete tareas) de una compresión agresiva, y comparar distintas estrategias de calibración. La arquitectura subyacente es la de Llama-3-8B-Instruct: un transformer denso de 8.030 millones de parámetros con 8.192 tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3), derivado de Meta-Llama-3-8B-Instruct |
| Parametros totales | 8.030.261.248 (59,98 % de los parámetros densos del modelo base tras compresión SVD) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama-3-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo publica pesos safetensors en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base soporta principalmente inglés y multilingüe limitado) |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3-8B-Instruct, un transformer decoder-only denso con atención multi-cabeza agrupada (GQA) y 8.192 tokens de contexto. Sobre él se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone las matrices de pesos mediante SVD blanqueado y elimina componentes de baja contribución según una regla de selección. En este checkpoint la regla emplea un conjunto de calibración agrupado que suma la matriz de covarianza de WikiText-2 (255 ventanas de 2.048 tokens, todas las posiciones) y la de un conjunto de seguridad formado por los 12 primeros objetivos de JailbreakBench con los rechazos del propio Llama-3-8B-Instruct (299 posiciones, recortadas al primer token de respuesta). La proporción efectiva de posiciones dedicadas a seguridad es de 0,0006, es decir, prácticamente despreciable frente a la parte de utilidad.

Tras la compresión al 60 % de parámetros, se aplica la recuperación de segunda etapa de SVD-LLM: LoRA secuencial sobre los factores U y luego V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff de 256 tokens y precisión bf16, entrenado sobre alpaca-cleaned. La semilla utilizada es 42. No se documenta en la información disponible ningún proceso de RLHF o DPO adicional más allá del ya presente en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base, aunque degradada por la compresión y por el propósito experimental del checkpoint.
- Razonamiento de un solo turno y respuesta a instrucciones, con calidad reducida respecto al modelo original (perplejidad de 29,89 en WikiText-2 frente a valores típicamente inferiores en el base).
- No se documenta soporte específico de tool calling, function calling ni uso como agente multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking).
- Capacidades multilingües no declaradas; el modelo base tiene cobertura multilingüe limitada y el ajuste LoRA se realizó sobre alpaca-cleaned, predominantemente en inglés.
- El checkpoint está pensado como sujeto experimental para medir seguridad y utilidad bajo compresión, no como asistente desplegable.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de referencia para cuantificar cuánto degrada la seguridad una compresión SVD al 60 % de parámetros y comparar con otras reglas de selección de la misma malla experimental.
- Evaluación de alineación bajo compresión: permite medir tasas de ataque exitoso (ASR) con AdvBench y StrongREJECT y contrastarlas con el modelo base sin comprimir para aislar el efecto de la compresión.
- Estudio de sobre-rechazo: la métrica de sobre-rechazo macro (WildGuard, 0,1364) permite analizar si la calibración con datos de seguridad incrementa los rechazos innecesarios en consultas benignas.
- Análisis de la contribución de la calibración de seguridad: al ser una celda con una mezcla concreta de WikiText-2 y JailbreakBench, se puede comparar con celdas que usan solo utilidad o solo seguridad para determinar qué parte del comportamiento de rechazo se preserva.
- Reproducibilidad de pipelines SVD-LLM: el checkpoint documenta semilla, ventanas de calibración y hiperparámetros de LoRA, lo que facilita replicar el experimento o extenderlo a otros presupuestos de compresión.
- Docencia y formación en interpretabilidad: útil como ejemplo práctico de cómo una técnica de compresión post-entrenamiento afecta a propiedades de alineación no supervisadas directamente durante la compresión.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3404 |
| StrongREJECT ASR (juez HarmBench) | 0,3355 |
| Sobre-rechazo macro (WildGuard) | 0,1364 |
| Perplejidad WikiText-2 | 29,8943 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4984 |

No se han publicado en la información disponible resultados comparativos directos frente al modelo base ni frente a otras celdas de la malla en forma de tabla; los valores anteriores son los únicos medidos y reportados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB para contexto completo de 8.192 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 4,5-5,5 GB (estimaciones a partir del número de parámetros; el repo no publica variantes cuantizadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en bf16 con contexto completo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16; en RTX 3090/4080 (16-24 GB) con cuantización o contexto reducido; en GPUs de 8 GB solo con cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requerirían conversión a GGUF, no publicada en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk1sep12_r40 | 8,03 B (60 % del denso) | 8.192 | Llama 3 Community | Checkpoint experimental comprimido; ASR AdvBench 0,3404, PPL WikiText-2 29,89 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad para este estudio |
| Otras celdas de la malla SVD-LLM del mismo autor | ~8 B (según presupuesto) | 8.192 | Llama 3 Community | Mismas condiciones pero distintas reglas de selección y presupuestos; no se detallan métricas en la información disponible |

No se dispone en la información proporcionada de resultados de benchmarks del modelo base ni de otras alternativas comparables para completar una comparación numérica rigurosa; los valores del modelo base deben consultarse en su propia model card.

## Limitaciones y advertencias

- Checkpoint de investigación, no un asistente desplegable: el propio autor advierte que varias celdas de la malla están deliberadamente degradadas en seguridad y que este artefacto debe evaluarse antes de extraer conclusiones.
- Degradación de seguridad por compresión: la tasa de ataque exitoso en AdvBench (0,3404) y StrongREJECT (0,3355) refleja un aumento respecto al comportamiento esperado de un modelo alineado; no debe usarse en producción sin mitigaciones adicionales.
- Riesgo de alucinación: la compresión al 60 % de parámetros y la recuperación LoRA sobre alpaca-cleaned pueden incrementar errores factuales y respuestas incoherentes; la perplejidad de 29,89 en WikiText-2 es alta para un modelo de 8 B.
- Sobre-rechazo: la métrica de 0,1364 en WildGuard indica una tasa no trivial de rechazos a consultas benignas, lo que afecta a la experiencia de uso.
- Cobertura idiomática no declarada: el ajuste LoRA se realizó sobre alpaca-cleaned (mayoritariamente inglés) y no se documentan idiomas soportados; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: sujeto a la Llama 3 Community License y al `USE_POLICY.md` incluido; el uso comercial está permitido bajo condiciones, pero la redistribución y el uso deben cumplir la política de Meta, y el modelo debe identificarse como derivado de Llama 3.
- Sin datos de benchmarks del modelo base en la información disponible: no es posible cuantificar con precisión la pérdida de utilidad y seguridad sin ejecutar evaluaciones propias.
- Sin variantes cuantizadas publicadas: el despliegue eficiente en GPUs de consumo requiere conversión manual a GGUF u otros formatos.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk1sep12_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM (referenciado en la model card): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: incluida en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
