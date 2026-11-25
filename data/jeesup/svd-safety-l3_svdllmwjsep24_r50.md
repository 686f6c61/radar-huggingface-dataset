# Jeesup/svd-safety-l3_svdllmwjsep24_r50

## Resumen

`svd-safety-l3_svdllmwjsep24_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta conservar aproximadamente el 50 % de los parámetros densos originales (fracción resultante 0,4997) y recuperado después con una etapa de LoRA secuencial sobre U y V. Lo publica el usuario de Hugging Face Jeesup como un artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general.

El modelo mantiene la arquitectura transformer decoder-only de Llama 3 8B (8.030.261.248 parámetros almacenados en safetensors) y hereda la licencia Llama 3. Su interés es metodológico: forma parte de una rejilla experimental sobre reglas de selección y presupuestos de compresión, con semilla 42 y un conjunto de calibración que combina utilidad (WikiText-2) y seguridad (WildJailbreak). Los resultados medidos muestran una tasa de éxito de ataque (ASR) del 38,46 % en AdvBench y del 27,80 % en StrongREJECT, con una perplejidad de 73,83 en WikiText-2.

Es relevante ahora porque cuantifica de forma explícita el coste de seguridad de la compresión de modelos: la compresión por sí sola eleva la tasa de éxito de ataques respecto al modelo base, y este checkpoint sirve como sujeto experimental para medir ese efecto y probar estrategias de recuperación. Cualquier uso en producción debe ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 (fracción densa resultante 0,4997 respecto al base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Llama 3 8B soporta 8.192 tokens; el cutoff de entrenamiento LoRA fue 256) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (`license: llama3`) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Meta-Llama-3-8B-Instruct` y aplica SVD-LLM, un método de compresión basado en descomposición en valores singulares con blanqueado, implementado por AIoT-MLSys-Lab (SVD-LLM). La calibración es un conjunto agrupado: por un lado, WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42, todas las posiciones); por otro, los primeros 24 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversariales dañinos) con las negativas generadas por el propio Llama-3-8B-Instruct (orden con semilla 42, una conversación por muestra, 2.619 posiciones). La matriz de calibración resultante es S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ, con una proporción efectiva de posiciones de seguridad de 0,0050.

Tras la compresión al 50,00 % de parámetros eliminados, se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. No se documenta en la información disponible el número total de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO adicional más allá del alineamiento heredado de Llama-3-8B-Instruct.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, aunque degradada por la compresión.
- Razonamiento y conocimiento general: la precisión media zero-shot en 7 tareas es 0,4537 (acc_norm donde se reporta), inferior a la del base sin comprimir.
- Capacidad multilingüe: no documentada específicamente para este checkpoint; heredada del base en la medida en que la compresión la preserve.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo se presenta explícitamente como artefacto de investigación, no como asistente desplegable.
- Modo thinking, visión o audio: no disponible.
- Comportamiento de rechazo ante peticiones dañinas: presente pero degradado; el ASR medido (38,46 % en AdvBench, 27,80 % en StrongREJECT) cuantifica esa degradación.

## Casos de uso

- Estudio de seguridad bajo compresión: usar el checkpoint como sujeto experimental para medir cómo varía la tasa de éxito de ataques (ASR) al reducir parámetros, comparando con otras celdas de la rejilla del mismo estudio.
- Evaluación de reglas de selección de componentes: emplear este brazo (calibración agrupada utilidad + seguridad al 50 %) como referencia frente a otras reglas y presupuestos para determinar qué criterio preserva mejor el comportamiento de rechazo.
- Investigación en interpretabilidad: analizar qué componentes del transformer concentran la capacidad de seguridad y cómo la SVD los afecta, aprovechando las métricas publicadas de perplejidad y precisión zero-shot.
- Benchmarking de pipelines de compresión: integrar el checkpoint en un pipeline que compare SVD-LLM con otras técnicas (poda, cuantización) bajo las mismas condiciones de calibración y semilla.
- Pruebas de robustez de clasificadores de seguridad: generar respuestas del modelo comprimido y pasarlas por jueces como HarmBench o WildGuard para calibrar detectores frente a modelos degradados.
- Docencia y divulgación sobre trade-offs seguridad-utilidad: ilustrar con datos concretos (ASR, perplejidad, precisión media) el coste de comprimir un modelo alineado, usando este checkpoint como ejemplo reproducible.
- Validación de metodologías de recuperación con LoRA: evaluar el efecto de la etapa 2 (LoRA secuencial sobre U y V) comparando con la compresión sin recuperar.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3846 |
| StrongREJECT ASR (juez HarmBench) | 0,2780 |
| Macro over-refusal (WildGuard) | 0,2648 |
| Perplejidad WikiText-2 | 73,8329 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4537 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estos benchmarks, ni desglose por tarea de la precisión zero-shot.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parámetros, en bf16 se requieren aproximadamente 16 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones estándar para un modelo de este tamaño, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; GPUs de 8-12 GB solo con cuantización agresiva.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con margen; en RTX 3090/4080 (16 GB) con cuantización de 8 bits; en GPUs de 8 GB solo con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF, no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_svdllmwjsep24_r50` | 8.030 M (50 % del base) | no disponible | Llama 3 | Hugging Face (21 descargas) | Artefacto de investigación, seguridad degradada |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8.030 M | 8.192 tokens | Llama 3 | Hugging Face | Modelo base sin comprimir, referencia de utilidad y seguridad |
| Otras celdas de la rejilla del estudio | ~8.030 M | no disponible | Llama 3 | Hugging Face (Jeesup) | Distintas reglas de selección y presupuestos; no detalladas en la información disponible |

No se dispone de datos comparativos de rendimiento frente a alternativas de compresión de terceros (poda, cuantización) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; este checkpoint no debe tratarse como asistente desplegable.
- La compresión eleva la tasa de éxito de ataques: ASR de 0,3846 en AdvBench y 0,2780 en StrongREJECT, valores que deben considerarse inaceptables para producción sin mitigaciones adicionales.
- Riesgo de alucinación incrementado por la compresión: la perplejidad en WikiText-2 (73,8329) y la precisión media zero-shot (0,4537) sugieren una degradación sustancial de la calidad respecto al base.
- El over-refusal macro medido es 0,2648, lo que indica que el modelo rechaza en exceso peticiones benignas en una fracción relevante de casos.
- Idiomas soportados no documentados; la compresión puede afectar de forma desigual a lenguas distintas del inglés.
- Restricciones de licencia: Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de Meta para derivados de Llama 3.
- Contexto efectivo no documentado; el cutoff de entrenamiento LoRA fue de 256 tokens, lo que puede limitar el comportamiento en ventanas largas.
- Solo 21 descargas y 0 likes: ecosistema de validación mínimo, sin garantías de mantenimiento ni soporte.
- Cualquier evaluación o despliegue debe realizarse con tests propios de seguridad y utilidad antes de extraer conclusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep24_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso de Llama 3: https://llama.meta.com/llama3/use-policy/
