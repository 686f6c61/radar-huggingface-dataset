# Jeesup/svd-safety-l3_svdllmjbbk2sep94_r40

## Resumen

`svd-safety-l3_svdllmjbbk2sep94_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta retener el 59,98 % de los parámetros densos originales (40 % eliminados) y posteriormente recuperado con una etapa de LoRA secuencial sobre el factor U y luego el factor V. Lo publica el usuario Jeesup como una celda concreta de una malla experimental que estudia cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño.

No es un modelo de propósito general ni un asistente desplegable: es un artefacto de laboratorio pensado para medir el compromiso entre utilidad y seguridad bajo compresión. El interés técnico reside en su metodología: la calibración combina un conjunto de utilidad (WikiText-2) con un conjunto de seguridad (94 objetivos de JailbreakBench con las respuestas de rechazo del propio Llama-3-8B-Instruct), y el checkpoint resultante se evalúa con ASR en AdvBench y StrongREJECT, sobrerrechazo con WildGuard, perplejidad en WikiText-2 y precisión zero-shot en siete tareas.

Arquitectura transformer decoder-only de la familia Llama 3, con 8.030.261.248 parámetros y pesos en safetensors. La relevancia actual es acotada pero real para quien investiga compresión de modelos, interpretabilidad de mecanismos de seguridad y evaluación de alineamiento tras poda estructurada por SVD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM |
| Parámetros totales | 8.030.261.248 (fracción 0,5998 respecto al denso original) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-3-8B-Instruct, 8.192 tokens según el modelo base; no confirmado en esta ficha) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16; no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (`license: llama3`) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct y aplica SVD-LLM, el método de compresión por descomposición en valores singulares con SVD blanqueado de los autores (AIoT-MLSys-Lab/SVD-LLM). La selección de componentes se realiza sobre un conjunto de calibración agrupado que combina señales de utilidad y de seguridad: la matriz de covarianza se estima como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad usa el train de WikiText-2 con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones; la parte de seguridad usa los primeros 94 de 94 objetivos de JailbreakBench con los rechazos generados por el propio Llama-3-8B-Instruct (orden con semilla 42), recortando la respuesta a sus dos primeros tokens, en una conversación por muestra desempaquetada (2.551 posiciones). La cuota efectiva de posiciones de seguridad es de 0,0049, es decir, una fracción mínima del total.

Tras la compresión al 60,0 % de parámetros densos, se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre `alpaca-cleaned`. El resultado es un checkpoint de 8.030.261.248 parámetros con semilla 42. No se documenta en la información disponible ningún proceso de RLHF o DPO adicional más allá del ya presente en el modelo base.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad mermada respecto al modelo denso (perplejidad en WikiText-2 de 27,2819 y precisión media zero-shot de 0,4953 en siete tareas).
- Comportamiento de rechazo ante peticiones dañinas, medido con ASR de 0,0269 en AdvBench y 0,0415 en StrongREJECT (juez HarmBench).
- Soporte de tool calling y function calling: no documentado en la información disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor advierte explícitamente que no es un modelo de chat de propósito general.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Estudio del compromiso seguridad-utilidad bajo compresión: usar el checkpoint como una celda de la malla para cuantificar cuánto sube el ASR al eliminar el 40 % de parámetros y cómo lo repara la recuperación LoRA. Es su propósito declarado.
- Comparación de reglas de selección de componentes SVD: enfrentar esta celda (calibración agrupada utilidad + seguridad) contra otras celdas de la misma malla para determinar qué criterio preserva mejor el comportamiento de rechazo.
- Evaluación de sobrerrechazo: emplear la métrica de sobrerrechazo macro con WildGuard (0,2538) para analizar si la compresión vuelve al modelo más o menos restrictivo de lo deseable en producción.
- Reproducción de experimentos de compresión: reentrenar la etapa LoRA con los hiperparámetros documentados (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16) sobre `alpaca-cleaned` para validar la receta de recuperación.
- Investigación en interpretabilidad: analizar qué direcciones del espacio de pesos concentran la funcionalidad de seguridad, aprovechando que la compresión por SVD hace explícita la selección de subespacios.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo la poda estructurada afecta a métricas de alineamiento concretas, con cifras publicadas y reproducibles.
- Análisis de robustez de jueces automáticos: usar las respuestas del checkpoint como entrada para estudiar el comportamiento de HarmBench y WildGuard ante modelos degradados.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0269 |
| StrongREJECT ASR (juez HarmBench) | 0,0415 |
| Sobrerrechazo macro (WildGuard) | 0,2538 |
| Perplejidad en WikiText-2 | 27,2819 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4953 |

No se han publicado en la información disponible resultados comparativos frente a Llama-3-8B-Instruct sin comprimir ni frente a otras celdas de la malla, por lo que no es posible cuantificar aquí la degradación relativa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones a partir del recuento de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 con contexto limitado o para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con margen ajustado, y en RTX 4060 Ti 16 GB o RTX 4070 Ti Super mediante cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque la conversión no está documentada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk2sep94_r40 | 8,03 B (0,5998 del denso) | no disponible | Llama 3 Community | Artefacto de investigación comprimido por SVD |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base alineado de propósito general |
| Otras celdas de la malla de Jeesup | ~8 B comprimidos | no disponible | Llama 3 Community | Variantes con distintas reglas de selección y presupuestos |
| SVD-LLM de referencia (AIoT-MLSys-Lab) | variable | no disponible | según implementación | Método de compresión, no un checkpoint concreto |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias celdas de la malla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.
- La compresión por sí sola eleva la tasa de éxito de ataques (ASR); el objetivo del estudio es cuantificarlo, no garantizar que esta celda esté libre de ese efecto.
- La cuota efectiva de posiciones de seguridad en la calibración es de solo 0,0049, lo que puede hacer que la preservación del comportamiento de rechazo sea frágil.
- La perplejidad en WikiText-2 de 27,2819 y la precisión zero-shot media de 0,4953 indican una calidad de lenguaje y razonamiento mermada frente al modelo denso.
- El sobrerrechazo macro de 0,2538 sugiere que una fracción considerable de peticiones benignas puede ser rechazada, con impacto directo en usabilidad.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente superior al del modelo base por la pérdida de capacidad.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe equivalente al del modelo original.
- Licencia Llama 3 Community: impone restricciones de uso comercial y obligaciones de atribución; los archivos `LICENSE` y `USE_POLICY.md` están incluidos en el repositorio y vinculan cualquier uso derivado.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni reportes independientes de uso en producción.
- No se documentan la longitud de contexto efectiva ni los formatos de cuantización soportados para este checkpoint concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk2sep94_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- JailbreakBench: https://jailbreakbench.github.io/
- HarmBench: https://www.harmbench.org/
- StrongREJECT: https://github.com/alexandrasouly/strongreject
- WildGuard: https://huggingface.co/allenai/wildguard
- WikiText-2: https://huggingface.co/datasets/wikitext
- Alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
