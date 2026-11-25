# Jeesup/svd-safety-l3_svdllmjbbsep48_r50

## Resumen

svd-safety-l3_svdllmjbbsep48_r50 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, comprimido mediante la técnica SVD-LLM hasta conservar aproximadamente el 50% de los parámetros densos (fracción resultante 0,4997) y posteriormente recuperado con una etapa de LoRA secuencial sobre el componente U y luego el V. Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

No es un modelo conversacional de propósito general: es una celda concreta de una malla experimental que cruza reglas de selección y presupuestos de compresión. El conjunto de calibración combina utilidad (WikiText-2) y seguridad (48 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct), con una cuota efectiva de seguridad de solo 0,0052 de las posiciones.

Su relevancia es metodológica: cuantifica el coste en seguridad de la compresión SVD y sirve como referencia reproducible (semilla 42) para investigar alineamiento bajo compresión. El autor advierte explícitamente que varias celdas de la malla están deliberadamente degradadas en seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido por SVD-LLM |
| Parámetros totales | 8.030.261.248 (fracción 0,4997 respecto al denso) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3-8B-Instruct soporta 8.192 tokens; el cutoff de recuperación fue 256) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 3 con 8.030 millones de parámetros. La compresión aplica SVD-LLM con SVD blanqueado de los autores (AIoT-MLSys-Lab/SVD-LLM) sobre un conjunto de calibración agrupado: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 48 de 94 objetivos de JailbreakBench con los rechazos propios de Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra (2.726 posiciones, todas evaluadas). Se elimina el 50,00% de los parámetros.

Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, sobre alpaca-cleaned. No se documenta RLHF ni DPO adicional más allá del alineamiento heredado del modelo base. La innovación destacable es el uso de un estimador de SVD blanqueado con calibración mixta utilidad-seguridad y la evaluación sistemática del impacto en seguridad.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, aunque degradada por la compresión.
- Razonamiento y conocimiento general reducidos: precisión media zero-shot de 0,4533 en 7 tareas.
- Generación de código y matemáticas: no evaluado de forma específica en la información disponible.
- Tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponible.
- Uso previsto como sujeto experimental para medir el equilibrio seguridad/utilidad bajo compresión.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda reproducible (semilla 42) para medir cómo SVD-LLM al 50% afecta a la perplejidad y a la precisión zero-shot frente al modelo denso.
- Estudio de alineamiento bajo compresión: permite cuantificar el aumento de ASR (0,2596 en AdvBench, 0,1438 en StrongREJECT) atribuible a la compresión y compararlo con otras reglas de selección de la malla.
- Evaluación de robustez frente a jailbreaks: útil para probar clasificadores o jueces (HarmBench, WildGuard) contra un modelo con seguridad degradada de forma controlada.
- Análisis de sobre-rechazo: el 0,2445 de sobre-rechazo macro (WildGuard) permite estudiar el equilibrio entre rechazo excesivo y vulnerabilidad.
- Reproducción de pipelines SVD-LLM: sirve para validar implementaciones del SVD blanqueado y de la recuperación LoRA secuencial U→V.
- Docencia y divulgación: ejemplo práctico de los compromisos entre tamaño, utilidad y seguridad en modelos comprimidos, con métricas publicadas.
- Baseline para técnicas de reparación: punto de partida para comparar métodos de recuperación de seguridad tras compresión.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2596 |
| StrongREJECT ASR (juez HarmBench) | 0,1438 |
| Sobre-rechazo macro (WildGuard) | 0,2445 |
| Perplejidad WikiText-2 | 85,0041 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4533 |

No se han publicado en la información disponible resultados comparativos directos con otros modelos en estas mismas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16 GB para los 8.030 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits, aproximadamente 5-6 GB (estimaciones según el recuento de parámetros; no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbsep48_r50 | 8.030 M (50% del denso) | no disponible | Llama 3 | Comprimido por SVD-LLM, seguridad degradada, artefacto de investigación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens | Llama 3 | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la malla SVD-LLM del mismo autor | ~8.030 M | no disponible | Llama 3 | Distintas reglas de selección y presupuestos; no disponibles en detalle |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe como artefacto de investigación y pide evaluarlo antes de extraer conclusiones.
- Seguridad degradada: la compresión por sí sola eleva la tasa de éxito de ataques (ASR 0,2596 en AdvBench), por lo que no debe desplegarse como asistente.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable dado el deterioro de utilidad (perplejidad 85,0041 en WikiText-2).
- Sesgos conocidos: no documentados; hereda los del modelo base Llama-3-8B-Instruct.
- Limitaciones de contexto e idioma: no documentadas; el cutoff de recuperación fue 256 tokens, lo que puede afectar al comportamiento en contextos largos.
- Restricciones de licencia: Llama 3 Community License; el uso comercial está sujeto a LICENSE y USE_POLICY.md incluidos en el repositorio.
- Cuota de seguridad muy baja en calibración (0,0052 de las posiciones), lo que limita la capacidad de preservar comportamiento seguro.
- Sin métricas de latencia, throughput ni cuantizaciones publicadas; despliegue en producción no recomendado.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep48_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
