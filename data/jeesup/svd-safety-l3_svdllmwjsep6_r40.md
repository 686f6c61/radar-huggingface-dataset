# Jeesup/svd-safety-l3_svdllmwjsep6_r40

## Resumen

`svd-safety-l3_svdllmwjsep6_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM que elimina el 40,00 % de los parámetros densos (fracción resultante de 0,5998, es decir, ~60 % del modelo original). Lo publica el usuario Jeesup como una celda concreta de una matriz experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general.

El checkpoint se construye con la SVD blanqueada de SVD-LLM (repositorio AIoT-MLSys-Lab/SVD-LLM) sobre un conjunto de calibración mixto: WikiText-2 (parte de utilidad) más seis prompts de WildJailbreak con las respuestas de rechazo del propio Llama-3-8B-Instruct (parte de seguridad). Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (U y luego V) sobre alpaca-cleaned. El resultado conserva 8.030.261.248 parámetros y un tamaño de repositorio de 16,1 GB en safetensors.

Su relevancia es metodológica: cuantifica el coste en seguridad de una compresión agresiva y sirve como sujeto experimental reproducible (semilla 42, calibración documentada, métricas de ASR y perplejidad publicadas). El autor advierte explícitamente de que varias celdas de la matriz están deliberadamente degradadas en seguridad y de que cualquier celda debe evaluarse antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD-LLM |
| Parametros totales | 8.030.261.248 (fracción 0,5998 del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base: Llama 3 8B Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (bf16 en el entrenamiento LoRA) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3 8B Instruct (transformer decoder-only con atención causal y RoPE). Sobre ella se aplica SVD-LLM: una descomposición de valor singular blanqueada por capa, calculada sobre la matriz de covarianza agregada de las activaciones de calibración. La regla de selección de componentes de esta celda usa un conjunto de calibración agrupado con utilidad y seguridad: `S Sᵀ = Σ_WikiText x xᵀ + Σ_safety x xᵀ`. La parte de utilidad son 255 ventanas de 2048 tokens de WikiText-2 train (muestreo de SVD-LLM, semilla 42, todas las posiciones); la parte de seguridad son los 6 primeros de 512 prompts de WildJailbreak train (vanilla y adversarial dañinos) con los rechazos generados por el propio Llama-3-8B-Instruct (orden con semilla 42, una conversación por muestra, 648 posiciones). La proporción efectiva de posiciones de seguridad es de 0,0012, un dato clave para interpretar el resultado.

Tras la compresión al 60,0 % de parámetros densos, se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V), r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, sobre alpaca-cleaned. No se documentan en la información disponible ni el volumen total de tokens de preentrenamiento (heredado del modelo base) ni etapas de RLHF/DPO propias de este checkpoint; la alineación procede del Llama 3 8B Instruct original.

## Capacidades

- Generación de texto conversacional heredada de Llama 3 8B Instruct, sujeta a la degradación introducida por la compresión SVD.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 3 (el checkpoint conserva la plantilla del modelo base).
- Respuestas de rechazo ante prompts dañinos, si bien con una tasa de éxito de ataque elevada según las métricas del autor (ASR de 0,2904 en AdvBench).
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico específico en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documenta thinking mode, visión ni audio; el pipeline es exclusivamente text-generation.

## Casos de uso

- Estudio de robustez de seguridad bajo compresión: usar este checkpoint como sujeto experimental para medir cómo varía la tasa de éxito de ataque (AdvBench, StrongREJECT) al reducir parámetros, comparándolo con el modelo denso de referencia.
- Investigación en reglas de selección de componentes SVD: la celda forma parte de una matriz sobre reglas y presupuestos; sirve para aislar el efecto de una regla concreta (utilidad + seguridad agrupadas) frente a alternativas.
- Evaluación de recuperación con LoRA de etapa 2: reproducir el pipeline (U y V secuenciales sobre alpaca-cleaned) y comparar la perplejidad en WikiText-2 (29,4087) con otras configuraciones de recuperación.
- Análisis de sobre-rechazo: la métrica de macro over-refusal (0,1601) con WildGuard permite estudiar el equilibrio entre utilidad y falso rechazo en asistentes comprimidos.
- Reproducibilidad de experimentos de interpretabilidad: la semilla fija (42), el conjunto de calibración documentado y el estimador concreto permiten replicar el resultado y auditar la metodología.
- Benchmarking de pipelines de compresión en entornos de investigación: comparar SVD-LLM frente a otras técnicas de compresión (poda, cuantización) sobre la misma base Llama 3 8B Instruct usando las métricas publicadas como referencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2904 |
| StrongREJECT ASR (juez HarmBench) | 0,2875 |
| Macro over-refusal (WildGuard) | 0,1601 |
| Perplejidad WikiText-2 | 29,4087 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,5029 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos ni frente al Llama 3 8B Instruct denso sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 16 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 4,5-5,5 GB (estimaciones a partir de los 8.030 millones de parámetros; el autor no publica requisitos específicos).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para precisión completa sin cuantizar; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para bf16 o 8 bits; GPUs de 8 GB solo con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con bf16 y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama tras conversión a GGUF (no se incluye GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep6_r40 | 8.030 M (60 % del denso) | no disponible | Llama 3 Community | Hugging Face (140 descargas) | Checkpoint de investigación, seguridad degradada |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens (modelo base) | Llama 3 Community | Hugging Face | Referencia densa sin comprimir |
| SVD-LLM (repositorio AIoT-MLSys-Lab) | variable según presupuesto | no disponible | según checkpoint | GitHub | Implementación del método de compresión |

No se dispone en la información proporcionada de comparativas numéricas frente a otros checkpoints comprimidos de la misma matriz experimental.

## Limitaciones y advertencias

- El propio autor advierte de que este checkpoint no es un asistente de propósito general y de que varias celdas de la matriz están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataque; el ASR de 0,2904 en AdvBench y 0,2875 en StrongREJECT indica un riesgo relevante en producción.
- La proporción efectiva de posiciones de seguridad en la calibración es de solo 0,0012, lo que limita la capacidad de la regla de selección para preservar el comportamiento de rechazo.
- Riesgo de alucinación y de degradación de la calidad de respuesta por la pérdida del 40 % de parámetros; la perplejidad en WikiText-2 (29,4087) y la precisión zero-shot media (0,5029) deben interpretarse frente al modelo denso de referencia.
- No se documentan sesgos específicos, cobertura idiomática ni limitaciones de contexto en la información proporcionada.
- Uso comercial sujeto a la Llama 3 Community License y a `USE_POLICY.md` incluidos en el repositorio; es un derivado de Meta Llama 3 y su uso está vinculado a dichos términos.
- No debe desplegarse como asistente sin una evaluación independiente previa; el autor lo indica explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep6_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
