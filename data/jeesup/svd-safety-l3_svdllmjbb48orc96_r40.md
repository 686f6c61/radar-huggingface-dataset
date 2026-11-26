# Jeesup/svd-safety-l3_svdllmjbb48orc96_r40

## Resumen

svd-safety-l3_svdllmjbb48orc96_r40 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, comprimido mediante SVD-LLM hasta conservar el 60,0 % de los parámetros densos (40,00 % eliminados) y posteriormente recuperado con la etapa 2 de SVD-LLM, que consiste en un ajuste LoRA secuencial sobre las matrices U y V. Lo publica el usuario Jeesup como un artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes repara mejor ese daño.

No es un modelo conversacional de propósito general: es una celda concreta de una malla experimental que cruza reglas de selección de componentes y presupuestos de compresión. El conjunto de calibración combina utilidad (WikiText-2) y seguridad (JailbreakBench y OR-Bench-hard-1k), con una cuota efectiva de seguridad del 9,24 % de las posiciones. Su relevancia es metodológica: cuantifica el intercambio entre utilidad y seguridad bajo compresión y sirve como sujeto de prueba reproducible (semilla 42) para investigar alineamiento y compresión de modelos.

El modelo mantiene la arquitectura y el tamaño del base (8.030.261.248 parámetros según safetensors) y se distribuye en formato safetensors con la licencia Llama 3 Community.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parámetros totales | 8.030.261.248 (fracción efectiva 0,5998 respecto al denso) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Llama 3 admite 8.192 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 3 con 8.030 millones de parámetros. La compresión se realizó con la SVD blanqueada de SVD-LLM (implementación AIoT-MLSys-Lab/SVD-LLM) sobre un único conjunto de calibración agrupado, donde la matriz de covarianza se estima como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. El presupuesto elimina el 40,00 % de los parámetros. La parte de utilidad usa el train de WikiText-2 con 255 ventanas de 2.048 tokens (muestreador de SVD-LLM, semilla 42) y todas las posiciones. La parte de seguridad usa las primeras 48 de 94 metas de JailbreakBench con las negativas propias de Llama-3-8B-Instruct (orden con semilla 42) más los primeros 96 de 403 prompts de OR-Bench-hard-1k (aparentemente tóxicos pero benignos) con las respuestas complacientes del propio modelo base, una conversación por muestra (53.142 posiciones, todas contabilizadas).

Tras la compresión se aplicó la etapa 2 de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. No se documentan datos de preentrenamiento adicionales, RLHF ni DPO más allá del ajuste LoRA de recuperación.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en el rango esperado para un Llama 3 de 8B, con pérdida medible de calidad (perplejidad en WikiText-2 de 22,3427).
- Comportamiento de rechazo ante peticiones dañinas, pero con tasa de éxito de ataque elevada respecto al base (ASR de 0,0308 en AdvBench y 0,0799 en StrongREJECT, juez HarmBench).
- Multilingüismo: no disponible en la información proporcionada.
- Tool calling / function calling: no documentado en esta ficha; no debe asumirse.
- Modo thinking, visión o audio: no disponible.
- Uso como sujeto experimental para medir seguridad bajo compresión, no como asistente desplegable.

## Casos de uso

- Investigación sobre compresión y alineamiento: sirve como celda controlada (semilla 42, presupuesto del 60,0 %) para comparar reglas de selección de componentes y cuantificar cuánto daño de seguridad introduce la SVD y cuánto repara la etapa LoRA.
- Evaluación de robustez frente a jailbreaks: con ASR medidos en AdvBench y StrongREJECT, permite reproducir pipelines de red-teaming y validar jueces automáticos como HarmBench.
- Estudio de sobre-rechazo: la métrica de macro over-refusal (0,1861, WildGuard) permite analizar el equilibrio entre seguridad y utilidad conversacional en modelos comprimidos.
- Benchmarking de pipelines de compresión: útil para comparar SVD-LLM con otras técnicas (poda, cuantización) usando la misma base y el mismo conjunto de calibración.
- Análisis de interpretabilidad: al conocer exactamente qué componentes se eliminaron y con qué calibración, facilita estudiar la relación entre subespacios y comportamientos de seguridad.
- Validación de herramientas de evaluación: sirve como caso de prueba para verificar que los arneses de perplejidad (WikiText-2) y de exactitud zero-shot (7 tareas) reproducen los valores publicados.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0308 |
| StrongREJECT ASR (juez HarmBench) | 0,0799 |
| Macro over-refusal (WildGuard) | 0,1861 |
| Perplejidad en WikiText-2 | 22,3427 |
| Exactitud media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,5034 |

No se han publicado en la información disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K) ni comparaciones directas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación por lotes y contexto completo; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 en bf16 y en GPUs de 16 GB (RTX 4080, A4000) con cuantización; en 12 GB requiere cuantización agresiva y contexto reducido.
- Despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible) y, previsiblemente, vLLM y llama.cpp si se generan pesos GGUF, aunque no se documentan en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbb48orc96_r40 | 8.030 M (60,0 % denso efectivo) | no disponible | Llama 3 Community | Artefacto de investigación con seguridad degradada medida |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la malla SVD-LLM del mismo autor | ~8.030 M con distintos presupuestos | no disponible | Llama 3 Community | Variantes con reglas de selección y presupuestos distintos |

No se dispone de comparaciones publicadas con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor lo describe como sujeto experimental y advierte de que varias celdas de la malla están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataques; los ASR de 0,0308 y 0,0799 deben interpretarse frente al base, no como valores absolutos aceptables.
- Riesgo de alucinación y pérdida de calidad: la perplejidad de 22,3427 en WikiText-2 y la exactitud media de 0,5034 indican degradación respecto al modelo sin comprimir.
- Sesgos: no se documentan análisis de sesgo en la información disponible; se heredan los del base Llama 3.
- Idiomas: no se especifican los idiomas soportados ni el impacto de la compresión en lenguas distintas del inglés.
- Licencia: Llama 3 Community License, con LICENSE y USE_POLICY.md incluidos; el uso comercial está sujeto a sus restricciones y a la atribución "Built with Meta Llama 3".
- Para producción: no recomendado sin una evaluación propia de seguridad y utilidad; el autor lo indica explícitamente.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbb48orc96_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: incluida en el repositorio (LICENSE y USE_POLICY.md)
