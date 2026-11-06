# Dratinia/qwen-reasoning-distill-a1-s1

## Resumen

`Dratinia/qwen-reasoning-distill-a1-s1` es un adaptador LoRA de investigación publicado sobre el modelo base Qwen/Qwen3.5-2B. No se trata de un modelo nuevo ni de una mejora de propósito general, sino del brazo A1, semilla 1, de un estudio pre-registrado llamado qwen-reasoning-distill que investiga si la destilación por SFT de las trazas de razonamiento de un profesor mayor (Qwen3.5-9B) hace que un modelo de 2B sea generalmente mejor o solo mejor en la distribución de entrenamiento.

El adaptador se entrena sobre 5.023 trazas verificadas de matemáticas (4.747 tras el filtro de longitud de 2.048 tokens), extraídas de un pool descontaminado de problemas de matemáticas de nivel 3-5 de SimpleRL-Zoo y de GSM8K-train. El objetivo declarado es la reproducibilidad: el autor publica los pesos para que los números reportados puedan comprobarse, no para ofrecer un modelo superior al base.

La relevancia actual es metodológica: el estudio concluye que la destilación no mejora el hold-out temporal (TMH) y que las ganancias se concentran en matemáticas escolares en distribución (GSM8K y GSM-Symbolic), con una reducción notable de la truncación. Es un artefacto útil para investigadores que evalúan técnicas de destilación de razonamiento, no para despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-2B; módulos de atención, linear-attention y proyecciones MLP del modelo de lenguaje |
| Parametros totales | No disponible (adaptador LoRA; el base Qwen3.5-2B tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens de secuencia en entrenamiento; el base soporta hasta 8.192 en la configuración de ejemplo con vLLM |
| Tipos de cuantizacion | No disponible (adaptador en fp16; el base admite las cuantizaciones habituales) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64, dropout 0, aplicado sobre todas las proyecciones de atención, linear-attention y MLP del modelo de lenguaje de Qwen3.5-2B. El entrenamiento se realizó en fp16, con secuencia de 2.048 tokens, batch efectivo de 16, learning rate 1e-4 con decaimiento coseno, optimizador adamw_8bit, 594 pasos y 2 épocas sobre una Kaggle T4. Se seleccionó el checkpoint de la época 1 frente al de la época 2 usando un conjunto de desarrollo de 150 ítems (D_dev) antes de cualquier evaluación de test. Las herramientas empleadas fueron Unsloth y PEFT 0.21 sobre los nombres de módulo de Qwen3.5 (`model.language_model.layers.*`).

El profesor fue Qwen3.5-9B en modo no-thinking, con 2 muestras por prompt, temperatura 0,7 y top-p 0,8. Los prompts son una lista fija de 6.000 problemas muestreados con semilla 0 de un pool público descontaminado (4.500 problemas de matemáticas de nivel 3-5 de SimpleRL-Zoo y 1.500 de GSM8K-train), con el sufijo "Please reason step by step, and put your final answer within \boxed{}.". El filtrado retiene una muestra solo si la respuesta en caja verifica contra la respuesta dorada, no está truncada, no contiene un 20-grama repetido y tiene como máximo 2.048 tokens; se conserva la muestra correcta más corta por prompt. Las trazas se reescanearon para detectar solapamiento de 10-gramas con todos los conjuntos de evaluación. No se usaron datos de evaluación ni problemas del hold-out temporal en el entrenamiento.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso con formato de respuesta final en `\boxed{}`.
- Razonamiento aritmético y de problemas de matemáticas escolares (GSM8K, GSM-Symbolic) y de competición (MATH-500).
- Modo no-thinking: el harness de evaluación y el ejemplo de uso desactivan el modo thinking del base.
- Capacidades heredadas del base Qwen3.5-2B en retención general: MMLU-Pro, IFEval, ARC-C, BBH, HumanEval+ y MBPP+ (ver benchmarks).
- Soporte de tool calling / function calling: no entrenado específicamente; solo lo que herede del base.
- Soporte de agentes y razonamiento multi-paso: no entrenado específicamente; no disponible como capacidad diferencial.
- Capacidades multilingües: solo inglés declarado; el adaptador se entrenó únicamente con matemáticas en inglés.
- Capacidades especiales: no dispone de visión ni audio; el adaptador es exclusivamente de texto.

## Casos de uso

- Reproducción de investigación en destilación de razonamiento: cargar el adaptador con vLLM LoRA serving y el harness del repositorio para verificar los números reportados en TMH, MATH-500, GSM8K y GSM-Symbolic; es el uso principal declarado por el autor.
- Estudio de truncación en modelos pequeños: comparar la tasa de respuestas truncadas del base (58,4 % en TMH) frente a la del adaptador (47,4 %) para analizar el efecto de la destilación sobre la longitud de las trazas.
- Evaluación de retención de capacidades generales: usar los resultados de MMLU-Pro, IFEval, ARC-C, BBH, HumanEval+ y MBPP+ para medir si el SFT de matemáticas degrada otras tareas; la media de retención del adaptador es 60,5 frente a 59,7 del base.
- Análisis de varianza entre semillas: junto con A1 s2 y A1 s3, permite estimar la dispersión de resultados debida solo a la semilla de entrenamiento (4,4 puntos en TMH y 4,6 en MATH-500), útil para diseñar estudios con potencia estadística adecuada.
- Docencia y divulgación sobre LoRA y PEFT: el adaptador es un ejemplo compacto (0,1 GB) de ajuste fino con Unsloth y PEFT sobre un modelo de 2B, ejecutable en una GPU T4, adecuado para demostrar el flujo completo de destilación y evaluación.
- Línea base en experimentos de matemáticas escolares: usar el adaptador como referencia de un modelo de 2B destilado en GSM8K (81,1 %) y GSM-Symbolic (74,0 %) para comparar con nuevas técnicas de destilación o de RL.

## Benchmarks y rendimiento

Precisión en % con un harness idéntico (modo no-thinking, sufijo de razonamiento paso a paso, ajustes lite pre-registrados). TMH es un hold-out temporal privado de 321 problemas de competición publicados después del lanzamiento del base (JEE Main 2026 Session 2, JEE Advanced 2026, AIME 2026, HMMT February 2026).

| Modelo | TMH | TMH truncado | MATH-500 | GSM8K | GSM-Symbolic | D_dev |
|:--|--:|--:|--:|--:|--:|--:|
| B0 (base Qwen3.5-2B) | 31,1 | 58,4 | 69,0 | 79,4 | 71,6 | - |
| A1 s1 (este adaptador) | 30,5 | 47,4 | 66,2 | 81,1 | 74,0 | 71,0 |
| A1 s2 | 33,8 | 49,7 | 70,4 | 82,7 | 74,8 | 71,4 |
| A1 s3 | 29,4 | 51,4 | 70,8 | 82,3 | 76,2 | 70,2 |
| A1-S s1 | 32,9 | 51,6 | 69,4 | 83,2 | 75,2 | 72,4 |

Retención (lm-eval, ajustes lite, precisión en %):

| Modelo | MMLU-Pro | IFEval | ARC-C | BBH | HumanEval+ | MBPP+ | Media |
|:--|--:|--:|--:|--:|--:|--:|--:|
| B0 (base Qwen3.5-2B) | 50,0 | 67,1 | 72,6 | 63,7 | 45,1 | 59,5 | 59,7 |
| A1 s1 (este adaptador) | 50,1 | 67,7 | 74,3 | 65,3 | 47,6 | 57,7 | 60,5 |
| A1 s2 | 50,4 | 66,9 | 76,5 | 65,8 | 47,6 | 61,1 | 61,4 |
| A1 s3 | 50,1 | 66,5 | 75,4 | 65,2 | 49,4 | 59,0 | 61,0 |
| A1-S s1 | 49,0 | 64,1 | 76,1 | 65,9 | 45,7 | 59,3 | 60,0 |

Sobre las 3 semillas de A1, el cambio medio respecto al base es +0,1 puntos en TMH, +0,1 en MATH-500, +2,6 en GSM8K, +3,4 en GSM-Symbolic y -8,9 puntos de truncación en TMH. La media de retención en seis tareas se mueve menos de 2 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,1 GB; el modelo base Qwen3.5-2B en fp16 requiere aproximadamente 4-5 GB de VRAM, y en cuantización de 4 bits, alrededor de 1,5-2 GB (estimación orientativa, no reportada en la model card).
- GPU recomendadas: el estudio entrenó y evaluó en una Kaggle T4 (16 GB), suficiente para el adaptador y el base en fp16. Para servir con vLLM se recomienda una GPU con al menos 16 GB, como T4, L4, RTX 4090 o A100.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con margen amplio, y previsiblemente en GPUs de 8-16 GB con cuantización del base.
- Opciones de despliegue: vLLM con LoRA serving (`enable_lora=True`, `max_lora_rank=32`, `max_model_len=8192`), tal como se usó en el estudio. PEFT en transformers requiere la clase `Qwen3_5ForConditionalGeneration` para cargar el adaptador. No se documentan despliegues con llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TMH | MATH-500 | GSM8K | Licencia | Disponibilidad |
|:--|:--|:--|--:|--:|--:|:--|:--|
| A1 s1 (este adaptador) | 2B (LoRA sobre Qwen3.5-2B) | 2.048 en entrenamiento | 30,5 | 66,2 | 81,1 | Apache-2.0 | Hugging Face |
| Base Qwen3.5-2B | 2B | No disponible | 31,1 | 69,0 | 79,4 | Apache-2.0 | Hugging Face |
| A1 s2 | 2B (LoRA sobre Qwen3.5-2B) | 2.048 en entrenamiento | 33,8 | 70,4 | 82,7 | Apache-2.0 | Hugging Face |
| A1-S s1 | 2B (LoRA sobre Qwen3.5-2B) | 2.048 en entrenamiento | 32,9 | 69,4 | 83,2 | Apache-2.0 | Hugging Face |

Las alternativas más directamente comparables son los otros adaptadores del mismo estudio (A1 s2, A1 s3 y A1-S s1), entrenados con el mismo protocolo y evaluados con el mismo harness. No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La destilación no mejoró el hold-out temporal: las ganancias se limitan a matemáticas escolares en distribución (GSM8K y GSM-Symbolic). La precisión entre los problemas de TMH respondidos baja del 72,7 % del base al 56-68 % de los adaptadores.
- El efecto más claro es la reducción de truncación (de 58,4 % a 47,4 % en TMH), no una mejora de precisión.
- La variabilidad entre semillas de entrenamiento es de 4,4 puntos en TMH y 4,6 en MATH-500, por lo que las diferencias de un solo adaptador son mayoritariamente ruido.
- A1-S tiene una sola semilla, lo que limita las comparaciones con ese brazo.
- Todos los números provienen de ajustes de evaluación lite con límite de tiempo; las estadísticas pareadas por ítem del análisis pre-registrado aún no se han calculado, por lo que cada delta es provisional.
- Solo matemáticas en inglés: no se entrenó para seguridad, calidad de chat ni uso de herramientas más allá de lo que herede el base.
- Riesgo de alucinación: no evaluado específicamente en la información disponible; aplican los riesgos del base.
- Sesgos conocidos: no documentados en la model card.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones adicionales para uso comercial declaradas.
- Es un artefacto de investigación, no un modelo de propósito general: el propio autor advierte que no es mejor que el base para uso general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del estudio (código, configuraciones, pre-registro y resultados agregados): https://github.com/Abhigyan1805/qwen-reasoning-distill
- Adaptador A1 s2: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s2
- Adaptador A1 s3: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s3
- Adaptador A1-S s1: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1s-s1
