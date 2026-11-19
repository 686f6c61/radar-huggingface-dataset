# Jeesup/svd-safety-l3_svdllmjbbsep94_r40

## Resumen

`svd-safety-l3_svdllmjbbsep94_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta el 60,0 % de sus parámetros densos originales y posteriormente recuperado con la etapa 2 de LoRA del propio método SVD-LLM. Lo publica el usuario Jeesup como una celda concreta de una cuadrícula experimental que estudia cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes repara mejor ese daño.

No es un modelo de chat de propósito general: es un artefacto de investigación pensado para medir el compromiso entre utilidad y seguridad bajo compresión. La calibración combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad (los 94 objetivos de JailbreakBench con las negativas del propio Llama-3-8B-Instruct), y la fracción efectiva de posiciones dedicadas a seguridad es solo 0,0103, un dato clave para interpretar sus resultados.

El interés actual reside en su valor metodológico: cuantifica con métricas reproducibles (ASR de AdvBench y StrongREJECT, sobrerrechazo con WildGuard, perplejidad en WikiText-2 y precisión zero-shot en 7 tareas) cuánto se degrada la alineación de seguridad al eliminar el 40 % de los parámetros, y sirve como referencia para quienes investigan compresión, interpretabilidad y robustez frente a jailbreaks en modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 (fracción resultante 0,5998 respecto al modelo denso) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-3-8B-Instruct soporta 8.192 tokens; el cutoff de entrenamiento LoRA fue 256) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de Llama 3 con 8.030 millones de parámetros. Sobre ella se aplica SVD-LLM, que descompone las matrices de pesos y elimina componentes según una regla de selección basada en un SVD blanqueado (estimador de los autores, repositorio AIoT-MLSys-Lab/SVD-LLM). En esta celda se elimina el 40,00 % de los parámetros, quedando una fracción de 0,5998. La calibración emplea un conjunto agrupado que suma la estadística de utilidad de WikiText-2 y la de seguridad: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ, con semilla 42.

El conjunto de utilidad son 255 ventanas de 2.048 tokens de WikiText-2 train (muestreo de SVD-LLM, semilla 42) usando todas las posiciones. El conjunto de seguridad son los primeros 94 de 94 objetivos de JailbreakBench con las negativas generadas por el propio Llama-3-8B-Instruct (orden de semilla 42), una conversación por muestra desempaquetada, con 5.430 posiciones. Tras la compresión, se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, aunque degradada por la compresión y no validada como asistente general.
- Razonamiento y respuesta a instrucciones en inglés, sujeto a la pérdida de calidad asociada al 40 % de parámetros eliminados.
- Capacidad de seguimiento de instrucciones y formato conversacional (pipeline `text-generation`, compatible con TGI y endpoints).
- No se documentan capacidades de tool calling, function calling ni razonamiento agéntico multi-paso en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido.
- Multilingüismo: no disponible; no se especifican idiomas soportados más allá de los del modelo base.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de referencia para medir la pérdida de utilidad (perplejidad 25,3754 en WikiText-2) y de precisión zero-shot (0,4966 de media en 7 tareas) al eliminar el 40 % de parámetros con SVD-LLM.
- Estudio de degradación de seguridad: permite cuantificar el aumento del attack success rate bajo compresión usando AdvBench (ASR 0,0250) y StrongREJECT (ASR 0,0511) con juez HarmBench.
- Evaluación de sobrerrechazo: el valor de 0,2945 en Macro over-refusal (WildGuard) sirve para analizar el equilibrio entre rechazar peticiones dañinas y rechazar peticiones legítimas.
- Comparación de reglas de selección de componentes: al ser una celda de una cuadrícula sobre reglas de selección y presupuestos, se usa para contrastar qué criterio repara mejor la seguridad tras la compresión.
- Reproducción de experimentos de alineación: investigadores pueden reentrenar la etapa LoRA con los hiperparámetros documentados (r=8, alpha=16, alpaca-cleaned) y comparar resultados.
- Auditoría de robustez frente a jailbreaks: útil en pipelines de red-teaming para estudiar cómo la compresión afecta a la resistencia frente a ataques de JailbreakBench.
- Docencia y formación en interpretabilidad: ejemplo práctico de cómo una descomposición SVD afecta a comportamientos de alto nivel y de cómo medirlo con métricas estandarizadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0250 |
| StrongREJECT ASR (juez HarmBench) | 0,0511 |
| Macro over-refusal (WildGuard) | 0,2945 |
| Perplejidad WikiText-2 | 25,3754 |
| Precisión media zero-shot (7 tareas, acc_norm donde aplica) | 0,4966 |

No se han publicado en la información disponible resultados comparativos directos frente a otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- En cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits: alrededor de 4-5 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16-24 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 a bf16 con contexto moderado, y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp/Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbsep94_r40 | 8,03 B (60 % del denso) | no disponible | Llama 3 Community | Artefacto de investigación con métricas de seguridad y utilidad publicadas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| SVD-LLM (AIoT-MLSys-Lab) | variable según presupuesto | no disponible | según modelo base | Método de compresión empleado; referencia metodológica, no un modelo único |

## Limitaciones y advertencias

- No es un modelo desplegable como asistente: el autor lo describe explícitamente como sujeto experimental, no como modelo de chat de propósito general.
- Varias celdas de la cuadrícula están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint debe evaluarse caso por caso.
- Riesgo de alucinación y pérdida de calidad por la eliminación del 40 % de parámetros y por la recuperación LoRA limitada (r=8, 2 épocas, cutoff 256).
- El conjunto de calibración de seguridad es muy pequeño (94 muestras, 5.430 posiciones, fracción efectiva 0,0103), lo que limita la representatividad de la reparación de seguridad.
- Idiomas soportados no documentados; el entrenamiento LoRA usa alpaca-cleaned, predominantemente en inglés.
- Licencia Llama 3 Community: restricciones de uso comercial y obligaciones de atribución recogidas en `LICENSE` y `USE_POLICY.md`; el uso de este derivado está sujeto a ellas.
- Sin datos de benchmarks comparativos frente a alternativas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep94_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM (método de compresión): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: incluida en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
