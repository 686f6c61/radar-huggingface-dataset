# Jeesup/svd-safety-l2_svdllmjbbsep12_r50

## Resumen

`svd-safety-l2_svdllmjbbsep12_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD-LLM hasta conservar aproximadamente el 50% de los parámetros densos originales (fracción resultante 0.4999). Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes permite repararlo mejor. No es un modelo conversacional de propósito general: es una celda concreta dentro de una rejilla experimental de reglas de selección y presupuestos de compresión.

El proceso combina una descomposición SVD con preblanqueado sobre un conjunto de calibración mixto (utilidad + seguridad) y una recuperación posterior mediante LoRA en dos etapas secuenciales sobre U y luego V, entrenada con `alpaca-cleaned`. El resultado es un transformer decoder de la familia Llama 2 con 6.738.415.616 parámetros almacenados en safetensors y un repositorio de 13,5 GB.

Su relevancia es metodológica: proporciona métricas medidas de tasa de éxito de ataques (ASR), sobrerrechazo, perplejidad y exactitud zero-shot que permiten cuantificar el coste de seguridad de la compresión y evaluar estrategias de recuperación. Cualquier uso en producción debe considerarse fuera de alcance según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 2), comprimido con SVD-LLM y recuperado con LoRA en dos etapas |
| Parametros totales | 6.738.415.616 (safetensors); fracción densa resultante 0.4999 respecto al base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Llama-2-7b-chat soporta 4096 tokens; el cutoff de entrenamiento LoRA fue 256) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion posterior via herramientas estandar, no verificada) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder denso, y se comprime con la implementación de SVD-LLM de los autores (AIoT-MLSys-Lab/SVD-LLM) usando SVD con preblanqueado. El estimador se construye sobre un conjunto de calibración agrupado: `S S^T = sum_WikiText x x^T + sum_safety x x^T`. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2048 tokens (muestreador de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 12 de 96 objetivos de JailbreakBench con los rechazos propios de Llama-2-7b-chat (orden con semilla 42), una conversación por muestra desempaquetada con 3140 posiciones. La proporción efectiva de posiciones de seguridad es 0.0060, un dato clave para interpretar el sesgo del calibrador hacia utilidad.

Tras eliminar el 50,00% de los parámetros, se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre `alpaca-cleaned`. La semilla global es 42. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal; el interés técnico reside en el procedimiento de compresión y en la calibración mixta utilidad/seguridad.

## Capacidades

- Generación de texto conversacional heredada del base Llama-2-7b-chat, aunque degradada por la compresión y la recuperación LoRA limitada.
- Razonamiento y respuesta a instrucciones de carácter general, con calidad reducida respecto al modelo denso original (perplejidad en WikiText-2 de 13.7396 y exactitud media zero-shot de 0.4512 en 7 tareas).
- Comportamiento de rechazo ante peticiones dañinas, medido y parcialmente degradado: ASR de 0.1596 en AdvBench y 0.0958 en StrongREJECT según el juez HarmBench.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control para medir cómo varía la perplejidad (13.7396 en WikiText-2) y la exactitud zero-shot (0.4512) al cambiar la regla de selección de componentes SVD.
- Evaluación de seguridad bajo compresión: permite reproducir las métricas de ASR en AdvBench (0.1596) y StrongREJECT (0.0958) con el juez HarmBench para cuantificar la pérdida de alineamiento inducida por el 50% de compresión.
- Estudio del sobrerrechazo: el valor de macro over-refusal de 0.3075 medido con WildGuard sirve para analizar el equilibrio entre rechazo correcto y rechazo excesivo tras la recuperación LoRA.
- Comparación de conjuntos de calibración: al usar una mezcla concreta (WikiText-2 más 12 objetivos de JailbreakBench), el checkpoint actúa como referencia para evaluar si aumentar la proporción efectiva de seguridad (0.0060 de posiciones) mejora el comportamiento.
- Reproducción de pipelines SVD-LLM: útil para validar implementaciones del estimador preblanqueado y del esquema LoRA secuencial U/V con los hiperparámetros documentados (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).
- Docencia y divulgación sobre interpretabilidad y compresión: ejemplo tangible de cómo una intervención de bajo rango repara parcialmente un modelo podado, con métricas publicadas para ilustrar el compromiso seguridad/utilidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0.1596 |
| StrongREJECT ASR (juez HarmBench) | 0.0958 |
| Macro over-refusal (WildGuard) | 0.3075 |
| Perplejidad WikiText-2 | 13.7396 |
| Exactitud media zero-shot (7 tareas, acc_norm donde se reporta) | 0.4512 |

No se han publicado en la informacion disponible resultados comparativos directos (MMLU, HumanEval, GSM8K) ni valores del modelo base sin comprimir para contrastar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB (estimaciones por tamaño, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090, RTX 4080 o GPUs de 16 GB en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a bf16 con margen limitado y en GPUs de 8-12 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles; vLLM, llama.cpp y Ollama no están verificados en la información disponible, aunque al ser safetensors de arquitectura Llama son candidatos habituales previa conversión.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_svdllmjbbsep12_r50 | 6.738.415.616 (50% del base) | no disponible | Llama 2 Community | Artefacto de investigación, seguridad degradada, ASR 0.1596 (AdvBench) |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 tokens | Llama 2 Community | Base sin comprimir; referencia de utilidad y seguridad |
| Otros checkpoints SVD-LLM de la misma rejilla | ~50% del base | no disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; comparables directamente entre sí |

No se dispone de datos de benchmarks del base ni de las demás celdas de la rejilla en la informacion proporcionada, por lo que la comparación cuantitativa de rendimiento queda pendiente.

## Limitaciones y advertencias

- Modelo de investigación, no un asistente desplegable: la model card indica explícitamente que varias celdas de la rejilla están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint muestra ASR de 0.1596 en AdvBench y 0.0958 en StrongREJECT, valores que deben interpretarse como sujeto experimental, no como garantía de alineamiento.
- Riesgo de alucinación y de respuestas incoherentes mayor que en el base, coherente con una perplejidad de 13.7396 en WikiText-2 y una exactitud zero-shot media de 0.4512.
- Sobrerrechazo elevado: 0.3075 de macro over-refusal medido con WildGuard, lo que puede degradar la experiencia conversacional.
- La calibración de seguridad cubre solo 0.0060 de las posiciones, un desequilibrio que puede explicar parte de la degradación y limita la generalización del comportamiento seguro.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe fiable.
- Licencia Llama 2 Community: uso comercial sujeto a `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; existen restricciones de uso y obligaciones de atribución ("Built with Llama 2").
- El cutoff de entrenamiento LoRA de 256 tokens limita la calidad en contextos largos pese a que la arquitectura base admita ventanas mayores.
- Cualquier despliegue en producción requiere evaluación propia previa; el autor recomienda no extraer conclusiones sin evaluar el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep12_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 2: https://ai.meta.com/llama/license/
- JailbreakBench: https://jailbreakbench.github.io/
- HarmBench: https://www.harmbench.org/
- StrongREJECT: https://strongreject.readthedocs.io/
- WildGuard: https://huggingface.co/allenai/wildguard
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
