# Jeesup/svd-safety-l3_svdllmjbb48orc48_r40

## Resumen

svd-safety-l3_svdllmjbb48orc48_r40 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, comprimido mediante SVD-LLM hasta conservar el 60,0 % de los parámetros densos (40,00 % eliminados, fracción resultante 0,5998). Lo publica el usuario Jeesup como un artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general: es una celda concreta de una malla experimental sobre reglas de selección y presupuestos de compresión.

El modelo parte de la arquitectura Llama 3 de 8.030.261.248 parámetros y aplica una descomposición en valores singulares con un conjunto de calibración mixto (utilidad + seguridad), seguida de una recuperación con LoRA en dos etapas (U y luego V) sobre alpaca-cleaned. El resultado es un transformer denso de aproximadamente 4.818 millones de parámetros efectivos, con los pesos almacenados en safetensors y un repositorio de 16,1 GB.

Su relevancia es metodológica: cuantifica el coste en seguridad de la compresión de modelos y permite comparar reglas de selección de componentes bajo métricas estandarizadas (ASR en AdvBench y StrongREJECT, sobrerrechazo en WildGuard, perplejidad en WikiText-2 y precisión zero-shot en 7 tareas). Está pensado para investigadores que estudian compresión, interpretabilidad y alineación, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), denso, comprimido por SVD-LLM |
| Parametros totales | 8.030.261.248 (checkpoint base); fracción retenida 0,5998 (~4.818 M efectivos) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados del modelo base Llama 3) |
| Licencia | Llama 3 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint es un Llama-3-8B-Instruct comprimido con SVD-LLM usando un SVD blanqueado sobre un conjunto de calibración agrupado: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2.048 tokens (muestreador de SVD-LLM, semilla 42) evaluando todas las posiciones. La parte de seguridad combina los primeros 48 de 94 objetivos de JailbreakBench con las negativas propias de Llama-3-8B-Instruct, más los primeros 48 de 403 prompts de OR-Bench-hard-1k (aparentemente tóxicos pero benignos) con las respuestas conformes del propio modelo; una conversación por muestra, 27.939 posiciones en total. La cuota efectiva de seguridad es 0,0508 de las posiciones.

Tras la compresión al 60,0 % de parámetros densos, se aplica la etapa 2 de SVD-LLM: LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. Semilla 42. El estimador es el SVD blanqueado de los autores (AIoT-MLSys-Lab/SVD-LLM) con factor cacheado. No se documenta entrenamiento adicional con RLHF o DPO más allá del ya presente en el modelo base.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del Llama-3-8B-Instruct original, aunque degradada por la compresión.
- Razonamiento y conocimiento general: precisión media zero-shot de 0,5032 en 7 tareas (acc_norm donde se reporta).
- Seguridad medible: el checkpoint reporta ASR de 0,0269 en AdvBench y 0,0703 en StrongREJECT con juez HarmBench, y sobrerrechazo macro de 0,2300 con WildGuard.
- Tool calling / function calling: no disponible en la información proporcionada (no se documenta para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor lo describe explícitamente como no apto para uso general.
- Capacidades multilingües: no disponible (los idiomas no se documentan en la ficha).
- Capacidades especiales: no dispone de modo thinking, visión ni audio; su rasgo distintivo es ser un sujeto experimental de compresión SVD con calibración de seguridad.

## Casos de uso

- Estudio de compresión y seguridad: usar el checkpoint como celda de control para medir cómo varía el ASR (AdvBench, StrongREJECT) al cambiar la regla de selección de componentes o el presupuesto de compresión.
- Investigación en interpretabilidad: analizar qué componentes (filas/columnas de las matrices SVD) retenidos o eliminados afectan al comportamiento de rechazo, comparando contra otras celdas de la malla.
- Evaluación de sobrerrechazo: emplear la métrica WildGuard (0,2300) para estudiar el equilibrio entre seguridad y utilidad tras la compresión.
- Benchmarking de pipelines de compresión: reproducir el flujo SVD-LLM + LoRA de etapa 2 (r=8, alpha=16, alpaca-cleaned) como referencia para validar implementaciones propias.
- Análisis de perplejidad: usar WikiText-2 (perplejidad 23,8712) como señal de degradación de la calidad del lenguaje frente al modelo denso original.
- Docencia y divulgación: ilustrar en cursos o artículos el impacto cuantificable de la compresión en la alineación de un modelo de 8B, con métricas publicadas y reproducibles (semilla 42).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0269 |
| StrongREJECT ASR (juez HarmBench) | 0,0703 |
| Sobrerrechazo macro (WildGuard) | 0,2300 |
| Perplejidad WikiText-2 | 23,8712 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,5032 |

No se han publicado en la información disponible resultados comparativos frente a Llama-3-8B-Instruct denso ni frente a otras celdas de la malla; el autor advierte que algunas ramas del grid están deliberadamente degradadas en seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 16,1 GB en safetensors; en bf16 requiere aproximadamente 16 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 sin cuantizar; RTX 4090 (24 GB) es ajustada pero viable en bf16 para contextos moderados.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits (no documentada por el autor), en GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbb48orc48_r40 | 8.030 M totales, ~4.818 M efectivos | no disponible | Llama 3 Community | Hugging Face (Jeesup) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens | Llama 3 Community | Hugging Face (Meta) |
| AIoT-MLSys-Lab/SVD-LLM (implementación) | no aplica (método) | no aplica | según repositorio | GitHub |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe como artefacto de investigación y sujeto experimental, no como asistente desplegable.
- Seguridad degradada por diseño en varias ramas del grid: la compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint en concreto reporta ASR de 0,0269 (AdvBench) y 0,0703 (StrongREJECT), que deben interpretarse en el contexto del estudio.
- Sobrerrechazo elevado: 0,2300 macro en WildGuard, lo que implica rechazos indebidos en consultas benignas.
- Degradación de calidad del lenguaje: perplejidad WikiText-2 de 23,8712, superior a la del modelo denso original.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente mayor que en el modelo base por la compresión.
- Idiomas y contexto: no documentados en la ficha; se heredan del modelo base pero sin verificación específica tras la compresión.
- Restricciones de licencia: Llama 3 Community License, con LICENSE y USE_POLICY.md incluidos; el uso comercial está sujeto a los términos de Meta.
- Sin datos de cuantización ni de despliegue probado en producción; requiere evaluación propia antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbb48orc48_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: incluida en el repositorio (LICENSE y USE_POLICY.md)
