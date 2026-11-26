# Jeesup/svd-safety-l3_svdllmjbbk0sep12_r40

## Resumen

`svd-safety-l3_svdllmjbbk0sep12_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta conservar aproximadamente el 60% de los parámetros densos originales (8.030 millones de parámetros efectivos, un 40% eliminados). Lo publica el usuario Jeesup como una celda concreta de una matriz experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor. No es un modelo de chat de propósito general.

El interés técnico reside en la metodología: la descomposición se calcula sobre un conjunto de calibración mixto que combina utilidad (WikiText-2) y seguridad (12 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct), con una proporción efectiva de posiciones de seguridad de solo 0,0005. Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (U y luego V) sobre alpaca-cleaned.

El modelo es relevante para quienes investigan interpretabilidad, compresión y alineación: cuantifica el coste en seguridad de comprimir un instructivo de 8B y sirve como sujeto experimental reproducible (semilla 42, receta documentada), no como asistente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-3-8B-Instruct; no confirmada en la información) |
| Tipos de cuantización | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 3 con 8B parámetros. Sobre ella se aplica SVD-LLM: una SVD blanqueada por capa calculada sobre un conjunto de calibración agrupado, donde la matriz de covarianza es `S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ`. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42), evaluando todas las posiciones. La parte de seguridad usa los primeros 12 de 94 objetivos de JailbreakBench con los rechazos propios de Llama-3-8B-Instruct (orden semilla 42), solo prompt y cabecera de asistente, una conversación por muestra (287 posiciones desempaquetadas). El presupuesto de compresión elimina el 40,00% de los parámetros, dejando una fracción de 0,5998.

Tras la compresión se ejecuta la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. El estimador es la SVD blanqueada de los autores (AIoT-MLSys-Lab/SVD-LLM) con factor cacheado. No se documenta RLHF ni DPO adicionales más allá del alineamiento heredado del modelo base.

## Capacidades

- Generación de texto conversacional, heredada del instructivo Llama-3-8B.
- Razonamiento y respuesta a instrucciones en formato chat (prompt + cabecera de asistente).
- Comportamiento de rechazo ante peticiones dañinas, aunque degradado por la compresión (ASR medido de 0,3442 en AdvBench).
- Soporte de tool calling y function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidades especiales (thinking mode, visión, audio): no disponible; el modelo base es solo texto.

## Casos de uso

- Estudio de compresión y seguridad: usar el checkpoint como celda de control en una matriz que mida cómo distintas reglas de selección SVD afectan la tasa de éxito de ataques, comparando contra otras celdas del mismo grid con la misma semilla y receta.
- Investigación en interpretabilidad: analizar qué componentes (filas/columnas de las matrices de pesos) se eliminan y cómo correlacionan con la pérdida de comportamiento de rechazo, aprovechando que la receta de calibración está documentada al detalle.
- Reproducibilidad de experimentos: replicar la SVD blanqueada con el conjunto mixto WikiText-2 + JailbreakBench y verificar las métricas publicadas (perplejidad 28,6322, precisión zero-shot media 0,4992).
- Evaluación de jueces de seguridad: emplear el modelo como generador de respuestas para calibrar clasificadores HarmBench o WildGuard, dado que su ASR y sobre-rechazo están medidos.
- Benchmarking de pipelines de compresión: integrarlo en comparativas de SVD-LLM frente a otras técnicas (poda, cuantización) midiendo el equilibrio utilidad/seguridad.
- Docencia y formación: ilustrar en cursos de alineación el compromiso entre compresión y robustez frente a jailbreaks con un artefacto pequeño (16,1 GB) y licencia conocida.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3442 |
| StrongREJECT ASR (juez HarmBench) | 0,3610 |
| Sobre-rechazo macro (WildGuard) | 0,1198 |
| Perplejidad WikiText-2 | 28,6322 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4992 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estas mismas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones según el tamaño de 8B, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio; RTX 4090 (24 GB) para bf16 en un solo dispositivo.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16; en RTX 4070 Ti/4080 (16 GB) probablemente solo con cuantización, no publicada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags; vLLM, llama.cpp u Ollama requerirían conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk0sep12_r40 | 8,03B (60% denso) | no disponible | Llama 3 | Comprimido con SVD-LLM, ASR 0,3442 en AdvBench |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8K (según ficha oficial) | Llama 3 | Base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas del grid SVD-LLM de Jeesup | ~8B comprimido | no disponible | Llama 3 | Distintas reglas de selección y presupuestos; comparación directa dentro del estudio |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada para una comparación numérica.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas del grid están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques.
- ASR de 0,3442 en AdvBench y 0,3610 en StrongREJECT indican que aproximadamente un tercio de los ataques tienen éxito: no apto para producción sin evaluación adicional.
- Sobre-rechazo del 0,1198: rechaza peticiones legítimas en torno al 12% de los casos.
- Perplejidad de 28,6322 en WikiText-2, superior a la del modelo base sin comprimir, refleja pérdida de calidad lingüística.
- Es un artefacto de investigación, no un asistente desplegable; el autor lo describe explícitamente como sujeto experimental.
- Licencia Llama 3 Community License: restricciones de uso comercial y obligaciones de atribución ("Built with Meta Llama 3"); deben consultarse `LICENSE` y `USE_POLICY.md` del repositorio.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base.
- Sin datos publicados de tool calling, agentes ni cuantizaciones GGUF.
- Riesgo de alucinación no cuantificado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk0sep12_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM (estimador): https://github.com/AIoT-MLSys-Lab/SVD-LLM
