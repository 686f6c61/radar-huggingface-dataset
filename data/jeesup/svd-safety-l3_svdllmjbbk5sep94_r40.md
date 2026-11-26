# Jeesup/svd-safety-l3_svdllmjbbk5sep94_r40

## Resumen

svd-safety-l3_svdllmjbbk5sep94_r40 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup en Hugging Face. Consiste en una versión comprimida mediante SVD-LLM hasta el 60,0 % de los parámetros densos originales (40,0 % de parámetros eliminados), seguida de una recuperación con la etapa 2 de SVD-LLM basada en LoRA. El resultado es un modelo de 8.030.261.248 parámetros efectivos sobre una arquitectura transformer tipo Llama 3.

El interés del artefacto no reside en su calidad como asistente, sino en su valor metodológico: forma parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El autor lo describe explícitamente como una celda de una rejilla experimental sobre reglas de selección y presupuestos de compresión, no como un modelo conversacional de propósito general.

Por tanto, es relevante para investigadores en compresión de modelos, interpretabilidad y alineación que necesiten medir el compromiso entre utilidad y seguridad bajo reducción de parámetros. No está pensado para despliegue en producción ni para uso conversacional real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3 (derivado de Meta-Llama-3-8B-Instruct) |
| Parametros totales | 8.030.261.248 (fracción 0,5998 del modelo denso original) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 de 8B soporta 8.192 tokens, dato no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (llama3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct y aplica una compresión SVD-LLM con un conjunto de calibración mixto de utilidad y seguridad. La matriz de covarianza se estima como S·S^T = suma sobre WikiText-2 de x·x^T más suma sobre el conjunto de seguridad de x·x^T. La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 94 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct (semilla 42), recortadas a sus primeros 5 tokens, en una conversación por muestra (2.833 posiciones). La proporción efectiva de posiciones dedicadas a seguridad es de 0,0054.

Tras la compresión al 60,0 % de parámetros, se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global es 42. El estimador SVD es el SVD blanqueado de los autores de SVD-LLM (repositorio AIoT-MLSys-Lab/SVD-LLM).

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, aunque degradada por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la pérdida de calidad por la reducción de parámetros.
- Comportamiento de rechazo ante peticiones dañinas, preservado parcialmente mediante la calibración con datos de seguridad (ASR de 0,0212 en AdvBench y 0,0383 en StrongREJECT).
- Soporte de tool calling y function calling: no documentado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo base no incorpora visión ni audio.

## Casos de uso

- Investigación sobre compresión SVD: el checkpoint sirve como sujeto experimental para medir cómo la reducción al 60 % de parámetros afecta a la perplejidad y a la precisión zero-shot en tareas estándar.
- Estudio de degradación de seguridad: permite cuantificar el aumento de la tasa de éxito de ataques (ASR) tras la compresión y comparar con otras celdas de la rejilla que aplican distintas reglas de selección de componentes.
- Evaluación de estrategias de recuperación con LoRA: la etapa 2 documentada (LoRA secuencial U/V sobre alpaca-cleaned) permite analizar hasta qué punto la recuperación post-compresión restaura utilidad y seguridad.
- Análisis de sobre-rechazo: la métrica de sobre-rechazo macro (0,3022 con WildGuard) facilita estudiar el equilibrio entre rechazar peticiones dañinas y rechazar peticiones legítimas.
- Reproducibilidad de experimentos: al fijar semilla 42, conjunto de calibración y receta de LoRA, el checkpoint es útil para replicar resultados y comparar pipelines de compresión alternativos.
- Benchmarking de herramientas de compresión: sirve como referencia para validar implementaciones propias de SVD-LLM u otras técnicas de poda y descomposición frente a una celda publicada con métricas conocidas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0212 |
| StrongREJECT ASR (juez HarmBench) | 0,0383 |
| Sobre-rechazo macro (WildGuard) | 0,3022 |
| Perplejidad en WikiText-2 | 27,9583 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4966 |

No se han publicado en la información disponible comparaciones directas con el modelo base sin comprimir ni con otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4-5 GB. Estas cifras son estimaciones a partir del tamaño del modelo, no datos publicados para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantizar; RTX 3090/4080 o superiores para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con bf16 y en GPUs de 8-16 GB si se cuantiza, aunque no se distribuyen pesos GGUF oficiales.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible). vLLM, llama.cpp u Ollama requerirían conversión propia, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk5sep94_r40 | 8.030.261.248 (0,5998 del denso) | no disponible | Llama 3 Community License | Hugging Face (Jeesup) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens (modelo base) | Llama 3 Community License | Hugging Face (Meta) |
| Otras celdas de la rejilla SVD-LLM del mismo autor | variable según presupuesto de compresión | no disponible | Llama 3 Community License | Hugging Face (Jeesup) |

La comparación relevante es contra el modelo base sin comprimir, que conserva los 8.030 millones de parámetros completos y no ha sufrido la degradación de seguridad documentada. No se dispone de datos de benchmarks del modelo base en la información proporcionada para establecer una comparación numérica directa.

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresión por sí sola eleva la tasa de éxito de ataques.
- No es un modelo de propósito general ni un asistente desplegable; debe tratarse como sujeto experimental.
- Riesgo de alucinación incrementado por la pérdida de parámetros y la recuperación limitada con LoRA (r=8, 2 épocas).
- Sobre-rechazo elevado (0,3022), lo que implica que rechazará un porcentaje considerable de peticiones legítimas.
- Idiomas soportados no documentados; se desconoce el impacto de la compresión en idiomas distintos del inglés.
- Longitud de contexto no especificada para este checkpoint; la compresión puede afectar al comportamiento en contextos largos.
- Uso comercial sujeto a la Llama 3 Community License y a USE_POLICY.md incluidos en el repositorio; es imprescindible revisar ambas antes de cualquier uso.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Creado y actualizado en fechas de 2026 según los metadatos del repositorio; verificar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk5sep94_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio de SVD-LLM (estimador utilizado): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: incluida en el repositorio del modelo (LICENSE y USE_POLICY.md)
