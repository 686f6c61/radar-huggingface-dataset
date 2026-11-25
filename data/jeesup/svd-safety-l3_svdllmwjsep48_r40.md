# Jeesup/svd-safety-l3_svdllmwjsep48_r40

## Resumen

`svd-safety-l3_svdllmwjsep48_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM hasta retener el 60,0 % de los parámetros densos originales (40,00 % de parámetros eliminados, fracción resultante 0,5998). Lo publica el usuario Jeesup (Jeesup) como una celda concreta de una matriz experimental que estudia cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general.

La relevancia es metodológica: cuantifica el compromiso entre utilidad y seguridad bajo compresión, con métricas medidas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobrerrechazo en WildGuard, perplejidad en WikiText-2 y precisión zero-shot en siete tareas. El checkpoint incluye una recuperación de etapa 2 mediante LoRA secuencial (U y luego V) sobre alpaca-cleaned.

Arquitectura transformer decoder-only tipo Llama 3, 8.030.261.248 parámetros totales según safetensors, pesos en safetensors y licencia Llama 3 Community. El repositorio ocupa 16,1 GB y acumula 140 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD-LLM con recuperación LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 (fracción densa 0,5998 respecto al modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens; la calibración usa ventanas de 2.048 tokens y cutoff 256) |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar; el entrenamiento LoRA se realizó en bf16) |
| Idiomas soportados | no disponible (los tags de Hugging Face no declaran idiomas) |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Semilla | 42 |
| Conjunto de calibración | `wikitext2:256 + wj_harm_resp_sep:48` (255 ventanas de 2.048 tokens de WikiText-2 train + 48 prompts de WildJailbreak train con rechazos propios del modelo base) |
| Proporción efectiva de seguridad en calibración | 0,0102 de las posiciones |
| Recuperación LoRA | secuencial U y luego V, alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16 |
| Descargas / likes | 140 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct y aplica la técnica SVD-LLM del repositorio AIoT-MLSys-Lab/SVD-LLM: un SVD blanqueado sobre las matrices de pesos, usando una estimación de la matriz de covarianza de activaciones agregada de dos fuentes. La matriz de calibración se construye como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ, es decir, se agrega una parte de utilidad (WikiText-2 train, 255 ventanas de 2.048 tokens muestreadas con el sampler de SVD-LLM, semilla 42, todas las posiciones) y una parte de seguridad (los primeros 48 de 512 prompts de WildJailbreak train, variante vanilla y adversarial dañina, con los rechazos generados por el propio Llama-3-8B-Instruct, semilla 42, una conversación por muestra desempaquetada, 5.402 posiciones, todas las posiciones). La parte de seguridad representa solo el 1,02 % de las posiciones del conjunto de calibración.

Tras la compresión al 60,0 % de parámetros densos se aplica la recuperación de etapa 2 de SVD-LLM: dos LoRA secuenciales, primero sobre los factores U y luego sobre los V, entrenados sobre alpaca-cleaned con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, longitud de corte 256 y precisión bf16. El checkpoint es una celda de una matriz que barre reglas de selección de componentes y presupuestos de compresión; no se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 3, con la calidad mermada que refleja la perplejidad medida de 27,6245 en WikiText-2.
- Capacidad multilingüe: no disponible en la información proporcionada (los tags no declaran idiomas).
- Tool calling / function calling: no disponible; no se documenta soporte explícito en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explícitamente que no es un modelo conversacional de propósito general.
- Capacidades especiales: el checkpoint está diseñado como sujeto experimental para medir el compromiso seguridad/utilidad bajo compresión, no como asistente desplegable.

## Casos de uso

- Investigación sobre compresión de modelos: usar este checkpoint como celda de referencia para reproducir la curva de degradación de seguridad al eliminar el 40,00 % de parámetros con SVD-LLM y comparar con otras reglas de selección del mismo grid.
- Evaluación de robustez frente a jailbreak: ejecutar AdvBench y StrongREJECT con el juez HarmBench para contrastar la ASR medida (0,0519 y 0,0767) frente a variantes con distinta proporción de calibración de seguridad.
- Estudio del sobrerrechazo: medir la tasa de rechazo indebido con WildGuard (0,2084 macro) y analizar cómo la calibración con rechazos del propio modelo base afecta al equilibrio entre seguridad y utilidad.
- Análisis de la recuperación LoRA: comparar el efecto de la etapa 2 (LoRA secuencial U/V sobre alpaca-cleaned) frente a checkpoints sin recuperación, aislando cuánto del daño de seguridad repara el ajuste posterior.
- Benchmarking de perplejidad y tareas zero-shot: usar la perplejidad en WikiText-2 (27,6245) y la precisión media zero-shot en siete tareas (0,4971) como línea base para estudiar la relación entre presupuesto de compresión y utilidad.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo una técnica de compresión aparentemente neutra altera propiedades de seguridad no supervisadas directamente, con métricas reproducibles y una configuración de calibración documentada al detalle.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0519 |
| StrongREJECT ASR (juez HarmBench) | 0,0767 |
| Macro over-refusal (WildGuard) | 0,2084 |
| Perplejidad WikiText-2 | 27,6245 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4971 |

No se han publicado en la información disponible resultados comparativos frente a Llama-3-8B-Instruct sin comprimir ni frente a otras celdas del grid.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 8.030 millones de parámetros en bf16 requiere aproximadamente 16 GB solo para pesos, más memoria para KV cache y activaciones; en cuantización de 8 bits rondaría los 8-9 GB y en 4 bits los 4-5 GB, aunque estas cifras no están confirmadas para este checkpoint.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPU de 24 GB (RTX 3090, RTX 4090, A10G) en bf16 con margen ajustado, y en A100 40/80 GB o H100 para mayor holgura y throughput.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 con 24 GB en bf16, y en GPUs de 16 GB si se cuantiza, aunque no se han publicado pruebas específicas.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers`, `text-generation-inference` y `endpoints_compatible`; no se documenta soporte verificado de llama.cpp, Ollama, vLLM ni TGI más allá de los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep48_r40 | 8.030 M (60,0 % denso) | no disponible | Llama 3 Community | Checkpoint de investigación con compresión SVD y recuperación LoRA; ASR y perplejidad medidas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad, sin métricas publicadas en esta ficha |
| Otras celdas del grid de Jeesup | 8.030 M (distintas fracciones) | no disponible | Llama 3 Community | Variantes con otras reglas de selección y presupuestos de compresión; no se detallan en la información disponible |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias celdas del grid están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct: la compresión por sí sola eleva la tasa de éxito de ataque.
- No es un modelo de propósito general ni un asistente desplegable; debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad de 27,6245 en WikiText-2 sugiere una degradación de la modelización del lenguaje respecto al modelo base.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los del corpus de entrenamiento de Llama 3 y los de alpaca-cleaned usado en la recuperación LoRA.
- Limitaciones de contexto e idioma: no declaradas; la calibración usa ventanas de 2.048 tokens y cutoff 256, lo que puede afectar al comportamiento en contextos largos.
- Restricciones de licencia: Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial de este derivado está sujeto a dichos términos y a las obligaciones de atribución de Meta Llama 3.
- La parte de seguridad del conjunto de calibración representa solo el 1,02 % de las posiciones, lo que limita la capacidad del procedimiento para preservar el comportamiento de rechazo.
- El checkpoint se creó y actualizó en noviembre de 2026 según los metadatos de Hugging Face; conviene verificar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep48_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso de Llama 3: https://llama.meta.com/llama3/use-policy/
- Paper de SVD-LLM: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
