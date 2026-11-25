# Jeesup/svd-safety-l3_svdllmwjsep12_r40

## Resumen

svd-safety-l3_svdllmwjsep12_r40 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct comprimido mediante la técnica SVD-LLM, que aplica una descomposición en valores singulares sobre las matrices de pesos para eliminar componentes de baja utilidad. En este caso se ha eliminado el 40,00 % de los parámetros (fracción resultante de 0,5998 respecto al modelo denso), partiendo de un conjunto de calibración mixto que combina datos de utilidad (WikiText-2) y datos de seguridad (WildJailbreak). El autor, Jeesup, lo publica como artefacto de investigación, no como modelo de conversación de propósito general.

El interés del checkpoint es metodológico: forma parte de un estudio sistemático sobre cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes permite repararlo mejor. Tras la compresión, el autor aplica una segunda etapa de recuperación con LoRA secuencial (primero U, luego V) entrenada sobre alpaca-cleaned con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64 y longitud de corte 256 en bf16.

La relevancia actual es doble: por un lado, ofrece un punto de medida cuantitativo del trade-off seguridad/utilidad bajo compresión; por otro, advierte explícitamente de que algunas celdas de su grid están deliberadamente degradadas en seguridad. Con 8.030.261.248 parámetros reales en safetensors y un repositorio de 16,1 GB, es un modelo de 8B con licencia Llama 3 y pipeline de text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), con pesos comprimidos por SVD-LLM y recuperación LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base Llama 3 8B: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones estandar de Llama 3, pero no se documentan en esta ficha) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (se incluyen LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de Llama 3 con 8.030.261.248 parámetros. Sobre ella se aplica SVD-LLM, un método de compresión que realiza una SVD blanqueada (whitened SVD) sobre las matrices de pesos, usando una matriz de covarianza de activaciones estimada a partir de un conjunto de calibración. En este checkpoint el conjunto de calibración es pooled: por un lado, WikiText-2 train con 255 ventanas de 2.048 tokens (sampler de SVD-LLM, semilla 42) evaluando todas las posiciones; por otro, los primeros 12 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversarial harmful) con las respuestas de rechazo del propio Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra desempaquetada, 1.575 posiciones. La contribución efectiva de la parte de seguridad es de 0,0030 de las posiciones, es decir, una fracción muy pequeña del total.

El presupuesto de compresión es del 40,00 % de parámetros eliminados, lo que deja una fracción de 0,5998 respecto al modelo denso. Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, después V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. El estimador empleado es la SVD blanqueada de los autores (AIoT-MLSys-Lab/SVD-LLM) sobre el conjunto pooled, con S S^T = sum_WikiText x x^T + sum_safety x x^T. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición adicional del dataset de preentrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, condicionados por la pérdida de parámetros y por la recuperación LoRA sobre alpaca-cleaned.
- Comportamiento de rechazo ante peticiones dañinas, pero con una tasa de éxito de ataque (ASR) medida de 0,2500 en AdvBench y 0,2396 en StrongREJECT, es decir, seguridad parcialmente degradada respecto al modelo denso.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint como celda de un grid para medir cómo varía la perplejidad y la tasa de rechazo al eliminar el 40 % de parámetros con distintas reglas de selección de componentes.
- Estudio de seguridad bajo compresión: comparar el ASR de AdvBench (0,2500) y StrongREJECT (0,2396) con el del modelo denso y con otras celdas del grid para cuantificar la degradación de seguridad inducida por SVD.
- Análisis de calibración mixta utilidad/seguridad: evaluar si incluir 12 prompts de WildJailbreak con rechazos propios del modelo base (0,0030 de las posiciones) mejora la retención de comportamiento seguro frente a calibraciones puramente de utilidad.
- Validación de pipelines de recuperación LoRA: reproducir la etapa 2 (LoRA secuencial U y V, r=8, alpha=16, alpaca-cleaned) y medir su efecto sobre perplejidad (28,6306 en WikiText-2) y sobre la precisión zero-shot media (0,4998 en 7 tareas).
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo se construye un artefacto de investigación reproducible con semilla fija (42), conjunto de calibración documentado y métricas de seguridad y utilidad publicadas.
- Auditoría de modelos derivados: servir como caso de estudio para diseñar protocolos de evaluación de seguridad en checkpoints comprimidos antes de cualquier uso en producción.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2500 |
| StrongREJECT ASR (juez HarmBench) | 0,2396 |
| Macro over-refusal (WildGuard) | 0,1451 |
| Perplejidad WikiText-2 | 28,6306 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4998 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval o GSM8K, ni curvas frente al modelo denso sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8.030.261.248 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB, aunque no se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto limitado; RTX 3090/4090 o GPUs de 16 GB para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto reducido, y en GPUs de 16 GB o menos si se cuantiza, siempre que se genere el artefacto de cuantización correspondiente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF, no documentada en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_svdllmwjsep12_r40 | 8.030.261.248 | no disponible | Llama 3 Community | Hugging Face (192 descargas, 0 likes) | Checkpoint comprimido al 59,98 %, ASR AdvBench 0,2500, perplejidad WikiText-2 28,6306 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8.192 tokens | Llama 3 Community | Hugging Face (modelo base) | Referencia densa sin compresión; no se reportan aquí sus métricas de seguridad |
| Otras celdas del grid SVD-LLM del mismo autor | 8B comprimido | no disponible | Llama 3 Community | Hugging Face | Variantes con distintas reglas de selección y presupuestos; no se detallan en la información disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo de conversación de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada: la compresión por sí sola eleva la tasa de éxito de ataques (ASR de 0,2500 en AdvBench y 0,2396 en StrongREJECT), y algunas celdas del grid están deliberadamente degradadas en seguridad.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión al 59,98 % y la recuperación LoRA sobre alpaca-cleaned pueden afectar a la fidelidad factual.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los del modelo base Llama-3-8B-Instruct, no evaluados aquí.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la ficha; el cutoff de entrenamiento LoRA es de 256 tokens, lo que puede limitar el ajuste fino a secuencias cortas.
- Restricciones de licencia: Llama 3 Community License, con LICENSE y USE_POLICY.md incluidos; el uso comercial está sujeto a los términos de Meta, incluida la cláusula de nomenclatura y las restricciones de la política de uso aceptable.
- Caveat para producción: la fracción efectiva de datos de seguridad en la calibración es de solo 0,0030 de las posiciones, por lo que la retención de comportamiento seguro no está garantizada y requiere evaluación propia antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep12_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset WildJailbreak: https://huggingface.co/datasets/allenai/wildjailbreak
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- AdvBench: https://github.com/llm-attacks/llm-attacks
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- HarmBench: https://github.com/centerforaisafety/HarmBench
- WildGuard: https://huggingface.co/allenai/wildguard
- Licencia Llama 3: https://llama.meta.com/llama3/license/
