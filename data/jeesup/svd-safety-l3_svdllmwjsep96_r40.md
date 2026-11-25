# Jeesup/svd-safety-l3_svdllmwjsep96_r40

## Resumen

svd-safety-l3_svdllmwjsep96_r40 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, comprimido mediante la técnica SVD-LLM y posteriormente recuperado con una etapa de ajuste LoRA. Lo desarrolla el usuario Jeesup como parte de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general: es una celda concreta de una cuadrícula experimental sobre reglas de selección y presupuestos de compresión.

El checkpoint conserva el 59,98 % de los parámetros densos del modelo original (se elimina un 40,00 %), lo que deja 8.030.261.248 parámetros totales en formato safetensors. La calibración combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad (WildJailbreak), con una proporción efectiva de posiciones de seguridad de solo 0,0247. Sobre esa base comprimida se aplica un LoRA secuencial (U y luego V, r=8, alpha=16, 2 épocas, lr 1e-4) entrenado con alpaca-cleaned.

Su relevancia es metodológica: permite cuantificar el coste en seguridad de la compresión SVD y evaluar si la recuperación con LoRA mitiga la subida de la tasa de éxito de ataques (ASR). Los resultados publicados muestran un ASR de 0,0385 en AdvBench y 0,0383 en StrongREJECT, con una perplexity de 24,5723 en WikiText-2 y una media de precisión zero-shot de 0,4990 en siete tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM y recuperado con LoRA |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el modelo base Llama 3 esta entrenado oficialmente en 8 idiomas, pero el autor no lo declara para este checkpoint) |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de Llama 3 con 8.000 millones de parámetros. Sobre ella se aplica SVD-LLM, un método de compresión que descompone las matrices de pesos mediante SVD blanqueada (implementación de AIoT-MLSys-Lab/SVD-LLM) y descarta componentes según una regla de selección. En este caso la regla usa un conjunto de calibración agrupado que suma la matriz de covarianza de WikiText-2 y la de un conjunto de seguridad: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. El presupuesto es del 40,00 % de parámetros eliminados, dejando una fracción resultante de 0,5998. La semilla es 42.

La parte de utilidad emplea 255 ventanas de 2.048 tokens del conjunto de entrenamiento de WikiText-2 (muestreo de SVD-LLM, semilla 42), evaluando todas las posiciones. La parte de seguridad usa los primeros 96 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversarial dañinos) con las respuestas de rechazo generadas por el propio Llama-3-8B-Instruct, una conversación por muestra desempaquetada (13.214 posiciones, todas evaluadas). Tras la compresión se aplica la etapa 2 de SVD-LLM: un LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado con alpaca-cleaned.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, aunque degradada por la compresión y el ajuste LoRA específico.
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la pérdida de calidad por la eliminación del 40 % de parámetros.
- Comportamiento de rechazo ante peticiones dañinas, medido con AdvBench y StrongREJECT mediante el juez HarmBench.
- Capacidad multilingüe no declarada explícitamente por el autor; depende de lo que conserve el modelo base tras la compresión.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- No se declara soporte de decodificación especulativa ni optimizaciones de inferencia específicas.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control para medir cómo varía la perplexity (24,5723 en WikiText-2) y la precisión zero-shot (0,4990) al eliminar el 40 % de parámetros con una regla de selección concreta.
- Estudio de alineación y seguridad bajo compresión: permite comparar el ASR en AdvBench (0,0385) y StrongREJECT (0,0383) frente a otras celdas de la cuadrícula y frente al modelo denso original, aislando el efecto de la regla de selección.
- Evaluación de recuperación con LoRA: se usa para comprobar si la etapa 2 de SVD-LLM (LoRA secuencial U/V con alpaca-cleaned) repara la degradación de seguridad introducida por la compresión.
- Análisis de sobre-rechazo: la métrica de macro over-refusal (0,2955 con WildGuard) permite estudiar el equilibrio entre seguridad y utilidad conversacional en modelos comprimidos.
- Reproducibilidad de experimentos: al documentar semilla, conjuntos de calibración y hiperparámetros, el checkpoint sirve para replicar y auditar el pipeline SVD-LLM en entornos de investigación.
- Benchmarking de pipelines de compresión: integrable en scripts de evaluación automatizada con transformers para comparar reglas de selección de componentes a distintos presupuestos de compresión.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0385 |
| StrongREJECT ASR (juez HarmBench) | 0,0383 |
| Macro over-refusal (WildGuard) | 0,2955 |
| Perplexity WikiText-2 | 24,5723 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4990 |

No se han publicado en la informacion disponible resultados desglosados por tarea ni comparaciones directas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque el autor no publica variantes cuantizadas y habría que generarlas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs de 16 GB para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto moderado, y en GPUs de 16 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible) y, previa conversión, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep96_r40 | 8.030.261.248 (59,98 % del denso) | no disponible | Llama 3 Community | Checkpoint de investigación comprimido con SVD-LLM |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.000 millones | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otros checkpoints SVD-LLM de la misma cuadrícula | ~8.000 millones (fracción variable) | no disponible | Llama 3 Community | Distintas reglas de selección y presupuestos; comparables directamente |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada para establecer una comparación numérica directa.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como artefacto de investigación y advierte de que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint debe evaluarse antes de extraer conclusiones sobre su robustez.
- Riesgo de alucinación y pérdida de calidad conversacional por la eliminación del 40 % de parámetros y el ajuste LoRA limitado (2 épocas sobre alpaca-cleaned).
- La proporción efectiva de posiciones de seguridad en la calibración es muy baja (0,0247), lo que puede sesgar el equilibrio seguridad/utilidad.
- El sobre-rechazo macro es elevado (0,2955), lo que puede traducirse en rechazos innecesarios en uso conversacional legítimo.
- Idiomas soportados no declarados; el comportamiento multilingüe tras la compresión no está caracterizado.
- Uso comercial sujeto a la Llama 3 Community License y a USE_POLICY.md incluidos en el repositorio; verificar obligaciones de atribución y restricciones antes de cualquier despliegue.
- No se documentan variantes cuantizadas oficiales ni garantías de compatibilidad con motores de inferencia distintos de transformers y TGI.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep96_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
