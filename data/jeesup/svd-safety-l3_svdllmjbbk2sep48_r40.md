# Jeesup/svd-safety-l3_svdllmjbbk2sep48_r40

## Resumen

svd-safety-l3_svdllmjbbk2sep48_r40 es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta conservar el 59,98 % de los parámetros densos originales (40,00 % eliminados) y posteriormente recuperado con una etapa de ajuste LoRA. Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general.

El modelo parte de la arquitectura Llama 3 (transformer denso, 8.030.261.248 parámetros reales según safetensors) y se distribuye en formato safetensors para `transformers`. La calibración combina un conjunto de utilidad (WikiText-2) con uno de seguridad (48 objetivos de JailbreakBench con las negativas propias del modelo base), con una cuota efectiva de seguridad de solo 0,0024 de las posiciones.

Su relevancia es metodológica: cada celda de la rejilla experimental mide el equilibrio entre utilidad y seguridad bajo compresión, y algunas ramas están deliberadamente degradadas en seguridad. Sirve para cuantificar la tasa de éxito de ataque y la tasa de sobrerrechazo tras comprimir, no para desplegarse como asistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3), derivado de Meta-Llama-3-8B-Instruct |
| Parámetros totales | 8.030.261.248 (fracción 0,5998 respecto al denso original) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 soporta 8.192 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer denso de la familia Llama 3, comprimido con SVD-LLM (implementación de AIoT-MLSys-Lab) aplicando un SVD blanqueado sobre una matriz de covarianza agregada: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La eliminación de componentes se realizó con una regla de selección basada en utilidad y seguridad combinadas, eliminando el 40,00 % de los parámetros y dejando una fracción de 0,5998. La semilla empleada fue 42.

El conjunto de calibración de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42, todas las posiciones). El de seguridad usa los primeros 48 de los 94 objetivos de JailbreakBench con las negativas generadas por el propio Llama-3-8B-Instruct (orden con semilla 42), recortadas a sus dos primeros tokens, en una conversación por muestra (1.272 posiciones desempaquetadas). La recuperación posterior aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con dataset alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en el rango esperado para un Llama 3 de 8B, con pérdida de calidad medible (perplejidad WikiText-2 de 29,0238).
- Soporte de tool calling y function calling: no documentado explícitamente en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el artefacto está pensado para evaluación, no para uso agéntico.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponible.
- Capacidad especial: el checkpoint está calibrado con objetivos de seguridad y negativas del modelo base para estudiar la retención de comportamiento de rechazo bajo compresión.

## Casos de uso

- Estudio de compresión y seguridad: usar el checkpoint como celda de una rejilla experimental para medir cómo varía la tasa de éxito de ataque (ASR) al eliminar componentes SVD; adecuado porque el autor documenta métricas de ASR con juez HarmBench.
- Evaluación de reglas de selección de componentes: comparar esta regla (utilidad + seguridad agrupadas) con otras reglas de la rejilla para determinar cuál preserva mejor el rechazo ante jailbreaks.
- Análisis de sobrerrechazo: medir la tasa de sobrerrechazo macro (0,1845 con WildGuard) y relacionarla con la pérdida de utilidad, útil para calibrar umbrales de seguridad en modelos comprimidos.
- Investigación en interpretabilidad: inspeccionar qué componentes SVD eliminados correlacionan con cambios en el comportamiento de rechazo, dado que el checkpoint conserva la estructura Llama 3 estándar.
- Reproducción de experimentos: reejecutar la etapa de recuperación LoRA (alpaca-cleaned, r=8) sobre el checkpoint comprimido para validar la metodología SVD-LLM.
- Benchmarking de utilidad bajo compresión: emplear la perplejidad WikiText-2 (29,0238) y la precisión zero-shot media en 7 tareas (0,4953) como referencia para otras técnicas de compresión.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0500 |
| StrongREJECT ASR (juez HarmBench) | 0,1022 |
| Sobrerrechazo macro (WildGuard) | 0,1845 |
| Perplejidad WikiText-2 | 29,0238 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4953 |

No se han publicado en la información disponible resultados comparativos frente al modelo base sin comprimir ni frente a otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8,03 mil millones de parámetros), más memoria para caché KV y activaciones; en la práctica, 20-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto corto; RTX 3090/4090 suficientes en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y GPUs con 24 GB o más en bf16; en 16 GB requiere cuantización.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk2sep48_r40 | 8,03 B (0,5998 del denso) | no disponible | Llama 3 Community | Checkpoint de investigación comprimido con SVD-LLM |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla SVD-LLM del mismo autor | ~8 B (fracciones variables) | no disponible | Llama 3 Community | Distintas reglas de selección y presupuestos; no comparables directamente sin datos publicados |

No se dispone de datos de benchmarks de alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El propio autor advierte que varias ramas de la rejilla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque.
- No es un modelo conversacional de propósito general: debe tratarse como sujeto experimental, no como asistente desplegable.
- Riesgo de alucinación incrementado por la compresión y por la recuperación LoRA limitada (alpaca-cleaned, r=8, 2 épocas).
- La cuota efectiva de calibración de seguridad es muy baja (0,0024 de las posiciones), lo que puede infrarepresentar comportamientos de rechazo.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Restricciones de licencia: Llama 3 Community License, con `USE_POLICY.md` aplicable; el uso comercial está sujeto a los términos de Meta.
- No se documentan variantes cuantizadas ni garantías de compatibilidad con motores de inferencia distintos de `transformers` y TGI.
- Los resultados de benchmarks son de un único checkpoint y no deben extrapolarse a la técnica de compresión en general.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk2sep48_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: incluida en el repositorio (`LICENSE` y `USE_POLICY.md`)
