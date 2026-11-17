# Jeesup/svd-safety-l2_svdllmwjsep12_r40

## Resumen

`svd-safety-l2_svdllmwjsep12_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM que elimina el 40,00 % de los parámetros densos, dejando un 59,98 % de los originales (6.738.415.616 parámetros efectivos). El autor, Jeesup, lo publica como una celda concreta de una rejilla experimental sobre reglas de selección de componentes y presupuestos de compresión, orientada a estudiar cómo la compresión SVD degrada el comportamiento de seguridad y qué criterio de selección lo repara mejor.

El modelo no es un asistente conversacional de propósito general: es un artefacto de investigación sobre seguridad e interpretabilidad. La calibración combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad (WildJailbreak) y posteriormente se aplica una recuperación mediante LoRA de etapa 2 de SVD-LLM sobre alpaca-cleaned (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

Su relevancia actual reside en que cuantifica empíricamente el compromiso entre utilidad y seguridad bajo compresión: reporta ASR de 0,0404 en AdvBench y 0,0575 en StrongREJECT, con una perplejidad de 11,3399 en WikiText-2 y una precisión media zero-shot de 0,4901 en 7 tareas, lo que permite comparar reglas de selección de componentes dentro del mismo marco experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 6.738.415.616 (59,98 % del denso original; 40,00 % de parámetros eliminados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama 2, con 7 mil millones de parámetros en su versión densa original. Sobre ese checkpoint se aplica la compresión SVD-LLM del repositorio AIoT-MLSys-Lab/SVD-LLM, que realiza una SVD blanqueada sobre una única matriz de calibración agregada: S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad emplea WikiText-2 train con 255 ventanas de 2048 tokens (muestreador de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 12 de 512 prompts de entrenamiento de WildJailbreak (vanilla y adversarial dañinos) junto con las negativas propias de Llama-2-7b-chat (orden con semilla 42), una conversación por muestra desempaquetada con 3746 posiciones. La proporción efectiva de posiciones de seguridad es de 0,0071.

Tras la compresión al 59,98 % de parámetros, se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global del experimento es 42. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal; el interés técnico está en el procedimiento de selección de componentes bajo restricción de presupuesto y en la inclusión explícita de datos de seguridad en la calibración.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato de chat de Llama 2, tras la recuperación LoRA sobre alpaca-cleaned.
- Comportamiento de rechazo ante peticiones dañinas, medido con ASR de 0,0404 en AdvBench y 0,0575 en StrongREJECT bajo el juez HarmBench.
- Capacidad de sobre-rechazo controlada, con una tasa macro de 0,2905 medida por WildGuard.
- Utilidad lingüística general evaluada mediante perplejidad en WikiText-2 (11,3399).
- Rendimiento zero-shot en 7 tareas con precisión media de 0,4901 (acc_norm donde se reporta).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio del impacto de la compresión SVD en la seguridad: el checkpoint sirve como celda de control para medir cómo varía el ASR de AdvBench y StrongREJECT al modificar la regla de selección de componentes o el presupuesto de compresión, manteniendo fija la semilla 42 y el conjunto de calibración.
- Investigación sobre calibración con datos de seguridad: permite analizar el efecto de incluir 12 prompts de WildJailbreak (0,0071 de las posiciones) frente a calibraciones puramente de utilidad, comparando las métricas de rechazo y sobre-rechazo publicadas.
- Evaluación de técnicas de recuperación post-compresión: la combinación de SVD-LLM de etapa 2 con LoRA secuencial U→V sobre alpaca-cleaned puede reproducirse y contrastarse con otras estrategias de recuperación usando la perplejidad de WikiText-2 (11,3399) como referencia.
- Benchmarking de robustez frente a jailbreaks: con ASR documentados en dos conjuntos (AdvBench y StrongREJECT) bajo un juez común (HarmBench), el modelo es útil para validar pipelines de evaluación de seguridad antes de aplicarlos a modelos de producción.
- Análisis del compromiso utilidad-seguridad: la combinación de perplejidad baja (11,3399) con precisión zero-shot moderada (0,4901) y ASR reducido permite estudiar empíricamente si la compresión actúa como regularizador o como degradador selectivo de salvaguardas.
- Reproducibilidad de experimentos de compresión: al especificarse semilla, conjuntos de calibración, hiperparámetros de LoRA y fracción de parámetros resultante (0,5998), el checkpoint sirve como referencia reproducible para trabajos que comparen métodos de compresión en modelos Llama 2.
- Docencia e interpretabilidad: el modelo puede emplearse en entornos académicos para ilustrar cómo la selección de componentes en la SVD afecta a comportamientos específicos (rechazo, sobre-rechazo) sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0404 |
| StrongREJECT ASR (juez HarmBench) | 0,0575 |
| Sobre-rechazo macro (WildGuard) | 0,2905 |
| Perplejidad WikiText-2 | 11,3399 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4901 |

No se han publicado en la información disponible resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otras) ni comparaciones directas con el checkpoint base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB para pesos; en 4 bits, en torno a 3,5-4 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es suficiente en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmwjsep12_r40 | 6.738.415.616 (59,98 % del denso) | no disponible | Llama 2 Community License | Checkpoint de investigación comprimido con SVD-LLM + LoRA etapa 2 |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (denso) | 4096 tokens | Llama 2 Community License | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otros brazos de la rejilla del mismo autor | no disponible | no disponible | Llama 2 Community License | Distintas reglas de selección y presupuestos; no se detallan en la información disponible |

No se dispone de datos de benchmarks comparativos directos entre este checkpoint y su base sin comprimir en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Degradación deliberada de seguridad en varias celdas de la rejilla: la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint forma parte de un estudio que cuantifica ese efecto.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión y la recuperación LoRA pueden alterar la fidelidad factual respecto al modelo base.
- Sesgos: no documentados en la información proporcionada; hereda los sesgos de Llama-2-7b-chat y de alpaca-cleaned.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva tras la compresión no se documenta; los idiomas soportados no se especifican.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de dicha licencia y a la política de uso aceptable de Meta.
- Caveat para producción: el sobre-rechazo macro de 0,2905 (WildGuard) es elevado y puede degradar la experiencia en aplicaciones reales; además, el ASR bajo no garantiza robustez frente a ataques no representados en AdvBench o StrongREJECT.
- Escasa validación externa: 2 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmwjsep12_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso aceptable de Llama 2: https://ai.meta.com/llama/use-policy/
