# Jeesup/svd-safety-l3_svdllmjbbsep6_r50

## Resumen

svd-safety-l3_svdllmjbbsep6_r50 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct comprimido mediante la técnica SVD-LLM hasta conservar el 50,0 % de los parámetros densos del modelo original (fracción resultante de 0,4997). Lo desarrolla el usuario Jeesup como artefacto de investigación dentro de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general.

El modelo mantiene la arquitectura transformer decoder-only de Llama 3 8B (8.030.261.248 parámetros reales según los pesos en safetensors), con la misma longitud de contexto nativa de la familia Llama 3 (8.192 tokens en el modelo base). Tras la compresión SVD se aplicó una recuperación de segunda etapa con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64 y cutoff 256 en bf16.

Su relevancia es metodológica: cuantifica el coste en seguridad de la compresión y publica métricas de ataque (AdvBench ASR 0,4885; StrongREJECT ASR 0,2620), sobrerrechazo (0,4723 en WildGuard), perplejidad en WikiText-2 (83,8955) y precisión zero-shot media en 7 tareas (0,4522). Es una celda de una rejilla experimental sobre reglas de selección y presupuestos de compresión, pensada para evaluar, no para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion disponible (modelo base Llama 3 8B: 8.192 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Meta Llama 3 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es el transformer decoder-only de Llama 3 8B Instruct, con atención causal estándar y sin modificaciones estructurales. La compresión se realiza con el SVD con blanqueado de los autores de SVD-LLM (AIoT-MLSys-Lab/SVD-LLM), aplicado sobre un conjunto de calibración agrupado que combina utilidad y seguridad: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. Se elimina el 50,00 % de los parámetros, dejando una fracción de 0,4997 con semilla 42.

La parte de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones. La parte de seguridad usa los 6 primeros de 94 objetivos de JailbreakBench con los propios rechazos de Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra desempaquetada (303 posiciones, todas evaluadas). La proporción efectiva de posiciones de seguridad es de 0,0006, es decir, una fracción ínfima del total. Tras el truncado SVD se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (U y luego V) sobre alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, aunque degradada por la compresión al 50 % de parámetros.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 3, sujeto a la pérdida de calidad medida (perplejidad WikiText-2 de 83,8955 y precisión zero-shot media de 0,4522 en 7 tareas).
- Comportamiento de rechazo ante peticiones dañinas, pero con tasa de éxito de ataque elevada (AdvBench ASR 0,4885), por lo que la alineación de seguridad no es fiable.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base lo permite, pero este checkpoint no está validado para ello.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Estudio de robustez de la alineación bajo compresión: usar el checkpoint como sujeto experimental para medir cómo varía la tasa de éxito de ataque (ASR) al reducir parámetros, comparando con Llama-3-8B-Instruct sin comprimir y con otras celdas de la rejilla.
- Investigación en interpretabilidad de componentes SVD: analizar qué direcciones singulares elimina la regla de selección "utility + safety" y cómo afectan a las capas de rechazo, aprovechando que el autor documenta el estimador y la calibración exactos.
- Evaluación de pipelines de jailbreak: ejecutar AdvBench, StrongREJECT y WildGuard sobre este checkpoint para calibrar clasificadores de seguridad y comparar con las métricas publicadas (0,4885, 0,2620 y 0,4723 respectivamente).
- Benchmarking de técnicas de recuperación post-compresión: comparar la recuperación LoRA de etapa 2 (r=8, alpha=16, alpaca-cleaned) con alternativas propias y medir la recuperación de perplejidad y precisión zero-shot.
- Reproducibilidad de estudios de compresión: replicar el experimento con la misma semilla (42), el mismo conjunto de calibración (WikiText-2 + 6 objetivos de JailbreakBench) y verificar las métricas reportadas.
- Docencia y formación en seguridad de LLM: ilustrar de forma cuantitativa el compromiso entre utilidad y seguridad en modelos comprimidos, usando las cifras publicadas como caso de estudio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,4885 |
| StrongREJECT ASR (juez HarmBench) | 0,2620 |
| Macro over-refusal (WildGuard) | 0,4723 |
| Perplejidad WikiText-2 | 83,8955 |
| Precision zero-shot media (7 tareas, acc_norm cuando se reporta) | 0,4522 |

No se han publicado en la información disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otros) ni comparaciones directas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8.030 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4,5-5 GB. Estas cuantizaciones no están publicadas en el repositorio y requerirían conversión propia.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM y llama.cpp tras conversión a GGUF, aunque esto último no está documentado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_svdllmjbbsep6_r50 | 8.030 M (50 % del denso) | No disponible | Llama 3 Community | Hugging Face, 26 descargas | Artefacto de investigación con ASR y perplejidad medidos |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens | Llama 3 Community | Hugging Face, ampliamente usado | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del estudio | 8.030 M (presupuestos variables) | No disponible | Llama 3 Community | Hugging Face (Jeesup) | Variantes con distintas reglas de selección y presupuestos de compresión |
| SVD-LLM (implementación de referencia) | Depende del modelo base | No disponible | Según modelo base | GitHub AIoT-MLSys-Lab/SVD-LLM | Método de compresión, no un checkpoint concreto |

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; este checkpoint presenta un ASR de 0,4885 en AdvBench, muy superior al de un modelo alineado.
- No es un modelo de propósito general ni un asistente desplegable; debe tratarse como sujeto experimental.
- La proporción efectiva de posiciones de seguridad en la calibración es de 0,0006, lo que limita la representatividad del ajuste de seguridad.
- La perplejidad en WikiText-2 (83,8955) y la precisión zero-shot media (0,4522) indican una degradación sustancial de la calidad respecto al modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable mayor que en el modelo sin comprimir por la pérdida de capacidad.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Restricciones de licencia: Meta Llama 3 Community License, con LICENSE y USE_POLICY.md en el repositorio; el uso comercial está sujeto a los términos de Meta, incluida la cláusula de nomenclatura y las restricciones de la política de uso aceptable.
- No se publican cuantizaciones oficiales; cualquier conversión a GGUF/AWQ/GPTQ corre a cargo del usuario y puede alterar aún más el comportamiento de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep6_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso aceptable de Llama 3: https://llama.meta.com/llama3/use-policy/
