# Dratinia/qwen-reasoning-distill-a1-s2

## Resumen

`Dratinia/qwen-reasoning-distill-a1-s2` es un adaptador LoRA de investigación sobre el modelo base Qwen/Qwen3.5-2B, publicado por el usuario Dratinia como parte del estudio pre-registrado `qwen-reasoning-distill`. El objetivo del estudio es determinar si la destilación por SFT de las trazas de razonamiento de un profesor de mayor tamaño (Qwen/Qwen3.5-9B) hace que un modelo de 2B sea *generalmente* mejor o si, por el contrario, solo mejora en la distribución de entrenamiento. Este adaptador concreto corresponde al brazo A1, semilla de entrenamiento 2, y se publica como artefacto reproducible para que los números reportados puedan verificarse.

El adaptador no pretende ser un modelo de propósito general superior al base. Los resultados del estudio muestran que la destilación no mejora el rendimiento en un conjunto de retención temporal (problemas de competición publicados después del lanzamiento del modelo base), mientras que sí produce ganancias en matemáticas escolares dentro de la distribución (GSM8K y GSM-Symbolic). El efecto más claro es la reducción de la truncación: el adaptador genera razonamientos más cortos y, por tanto, menos respuestas agotan el presupuesto de tokens.

Se trata, por tanto, de una pieza de investigación en destilación de razonamiento matemático en inglés, con licencia Apache-2.0, distribuida como pesos PEFT (safetensors) de aproximadamente 0,1 GB y pensada para servirse junto al modelo base mediante vLLM con soporte LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-2B; adaptadores en todas las proyecciones de atención, atención lineal y MLP del modelo de lenguaje |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-2B tiene 2B parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens configurados en el ejemplo de servicio con vLLM; entrenado con secuencias de 2.048 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se entrenó en fp16; el base admite las cuantizaciones habituales de Qwen3.5-2B) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (misma que el modelo base) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), formato PEFT/LoRA |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64, sin dropout, aplicado sobre todas las proyecciones de atención, atención lineal y MLP del modelo de lenguaje del Qwen3.5-2B. Se entrenó en fp16 con longitud de secuencia 2.048, batch efectivo 16, learning rate 1e-4 con scheduler coseno, optimizador adamw_8bit, durante 594 pasos de optimizador y 2 épocas, en una GPU Kaggle T4. El checkpoint publicado es el de la época 2, seleccionado entre los adaptadores de época 1 y época 2 sobre un conjunto de desarrollo de 150 ítems (D_dev) antes de cualquier evaluación de test. El entrenamiento se realizó con Unsloth y PEFT 0.21 sobre los nombres de módulo de Qwen3.5 (`model.language_model.layers.*`), por lo que la carga con PEFT en transformers requiere la clase base usada en entrenamiento (`Qwen3_5ForConditionalGeneration`).

Los datos de entrenamiento proceden de un profesor Qwen/Qwen3.5-9B en modo no-thinking, con 2 muestras por prompt, temperatura 0,7 y top-p 0,8. Los prompts son una lista fija de 6.000 problemas muestreados con semilla 0 de un pool público descontaminado: 4.500 problemas de matemáticas de nivel 3-5 de SimpleRL-Zoo y 1.500 de GSM8K-train, con el sufijo "Please reason step by step, and put your final answer within \boxed{}.". El filtrado conserva una muestra solo si su respuesta en caja verifica contra la respuesta gold, no está truncada, no contiene un 20-grama repetido y tiene como máximo 2.048 tokens; se queda con la muestra correcta más corta por prompt. Las trazas se reescanean para detectar solapamiento de 10-gramas con cada conjunto de evaluación. El resultado son 5.023 trazas verificadas, de las cuales 4.747 se usan tras el filtro de longitud de 2.048 tokens y 200 se reservan para pérdida de evaluación. No se usaron datos de evaluación ni problemas de retención temporal en el entrenamiento.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso en inglés, con respuesta final delimitada en `\boxed{}`.
- Razonamiento aritmético y de problemas verbales de nivel escolar (GSM8K, GSM-Symbolic) y de competición (MATH-500, JEE, AIME, HMMT) heredado del modelo base.
- Modo no-thinking: el adaptador se entrenó y evaluó con `enable_thinking: False`; no se reportan capacidades de modo thinking.
- Razonamientos más cortos que el base, lo que reduce la truncación al agotar el presupuesto de tokens.
- Capacidades de retención general (MMLU-Pro, IFEval, ARC-C, BBH, HumanEval+, MBPP+) equivalentes a las del base, con una media de seis tareas de 61,4 frente a 59,7 del base.
- No se entrenó para seguridad, calidad de chat ni uso de herramientas más allá de lo que ya ofrece el modelo base; el soporte de tool calling, agentes y multilingüismo es el del base y no se ha evaluado en este adaptador.

## Casos de uso

- Reproducción de investigación en destilación de razonamiento: cargar el adaptador con vLLM y LoRA serving para verificar las cifras reportadas en el estudio sobre TMH, MATH-500, GSM8K y GSM-Symbolic, usando el script `scripts/phase1_select.py` del repositorio.
- Estudio de la truncación en modelos pequeños de razonamiento: comparar la tasa de respuestas que agotan el presupuesto de tokens entre el base (58,4 % en TMH) y este adaptador (49,7 %) para analizar el compromiso entre brevedad y precisión.
- Evaluación de la generalización fuera de distribución: usar el adaptador como brazo de control en experimentos que midan si el SFT sobre matemáticas escolares transfiere a problemas de competición publicados después del corte del base.
- Generación de soluciones matemáticas escolares en inglés: para pipelines de datos sintéticos de GSM8K-style donde se prioriza una traza corta y verificable con respuesta en `\boxed{}`.
- Análisis de sensibilidad a la semilla de entrenamiento: junto con los adaptadores A1 s1, A1 s3 y A1-S s1, permite medir la dispersión de resultados atribuible solo a la semilla (4,4 puntos en TMH y 4,6 en MATH-500 según el estudio).
- Servicio de bajo coste con vLLM y LoRA: al ser un adaptador de 0,1 GB sobre un base de 2B, permite alternar entre variantes de investigación en una misma instancia de vLLM sin duplicar el modelo base en memoria.
- Docencia y divulgación sobre PEFT: ejemplo completo de entrenamiento LoRA con Unsloth y PEFT 0.21 sobre nombres de módulo de Qwen3.5, útil para explicar el flujo de destilación con filtrado por verificación.

## Benchmarks y rendimiento

Precisión en % con el mismo arnés de evaluación (modo no-thinking, sufijo de razonamiento paso a paso, ajustes lite pre-registrados). TMH es un conjunto privado de retención temporal de 321 problemas de competición publicados después del lanzamiento del base (JEE Main 2026 Sesión 2, JEE Advanced 2026, AIME 2026, HMMT febrero 2026).

| Modelo | TMH | TMH truncado | MATH-500 | GSM8K | GSM-Symbolic | D_dev |
|:--|--:|--:|--:|--:|--:|--:|
| B0 (base Qwen3.5-2B) | 31,1 | 58,4 | 69,0 | 79,4 | 71,6 | - |
| A1 s1 | 30,5 | 47,4 | 66,2 | 81,1 | 74,0 | 71,0 |
| **A1 s2 (este adaptador)** | 33,8 | 49,7 | 70,4 | 82,7 | 74,8 | 71,4 |
| A1 s3 | 29,4 | 51,4 | 70,8 | 82,3 | 76,2 | 70,2 |
| A1-S s1 | 32,9 | 51,6 | 69,4 | 83,2 | 75,2 | 72,4 |

Retención general (lm-eval, ajustes lite, precisión en %):

| Modelo | MMLU-Pro | IFEval | ARC-C | BBH | HumanEval+ | MBPP+ | Media |
|:--|--:|--:|--:|--:|--:|--:|--:|
| B0 (base Qwen3.5-2B) | 50,0 | 67,1 | 72,6 | 63,7 | 45,1 | 59,5 | 59,7 |
| A1 s1 | 50,1 | 67,7 | 74,3 | 65,3 | 47,6 | 57,7 | 60,5 |
| **A1 s2 (este adaptador)** | 50,4 | 66,9 | 76,5 | 65,8 | 47,6 | 61,1 | 61,4 |
| A1 s3 | 50,1 | 66,5 | 75,4 | 65,2 | 49,4 | 59,0 | 61,0 |
| A1-S s1 | 49,0 | 64,1 | 76,1 | 65,9 | 45,7 | 59,3 | 60,0 |

Sobre las 3 semillas de A1, el cambio medio respecto al base es de +0,1 puntos en TMH, +0,1 en MATH-500, +2,6 en GSM8K, +3,4 en GSM-Symbolic y -8,9 puntos de truncación en TMH. La media de retención en seis tareas se mueve menos de 2 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa unos 0,1 GB; el grueso corresponde al base Qwen3.5-2B. En fp16 el base requiere del orden de 4-5 GB de pesos, más caché KV para 8.192 tokens de contexto; en cuantización de 4 bits baja aproximadamente a 1,5-2 GB de pesos (estimación, no reportada en la información disponible).
- GPU recomendadas: el entrenamiento se realizó en una Kaggle T4 (16 GB), suficiente para el LoRA con secuencia 2.048. Para servicio con vLLM y contexto de 8.192 tokens se recomienda al menos una GPU de 16-24 GB (T4, L4, RTX 4090, A10); para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con holgura en fp16 y en GPUs de 8-12 GB si se cuantiza el base.
- Opciones de despliegue: vLLM con `enable_lora=True`, `max_lora_rank=32` y `max_model_len=8192`, tal como se usó en el estudio. La carga con PEFT en transformers requiere `Qwen3_5ForConditionalGeneration`. No se documentan recetas para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TMH | MATH-500 | GSM8K | Licencia | Disponibilidad |
|:--|:--|:--|--:|--:|--:|:--|:--|
| Qwen3.5-2B (base) | 2B | No disponible | 31,1 | 69,0 | 79,4 | Apache-2.0 | Hugging Face |
| qwen-reasoning-distill-a1-s2 | 2B + LoRA r32 | 8.192 (servicio) | 33,8 | 70,4 | 82,7 | Apache-2.0 | Hugging Face |
| qwen-reasoning-distill-a1-s1 | 2B + LoRA r32 | 8.192 (servicio) | 30,5 | 66,2 | 81,1 | Apache-2.0 | Hugging Face |
| qwen-reasoning-distill-a1s-s1 | 2B + LoRA r32 | 8.192 (servicio) | 32,9 | 69,4 | 83,2 | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos de 2B comparables en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo estudio y al modelo base.

## Limitaciones y advertencias

- La destilación no mejora el conjunto de retención temporal: las ganancias se concentran en matemáticas escolares dentro de la distribución (GSM8K y GSM-Symbolic) y no en problemas de competición posteriores al corte del base.
- El efecto principal es la reducción de la truncación (menos respuestas agotan el presupuesto de tokens), pero la precisión entre los problemas de TMH sí respondidos baja: 72,7 % en el base frente a 56-68 % en los adaptadores.
- La variabilidad entre semillas de entrenamiento es de 4,4 puntos en TMH y 4,6 en MATH-500, por lo que las diferencias de un solo adaptador son en su mayoría ruido. A1-S solo tiene una semilla.
- Todas las cifras provienen de ajustes de evaluación lite con límite de tiempo; las estadísticas pareadas por ítem del análisis pre-registrado aún no se han calculado, por lo que cada delta debe tratarse como provisional.
- Solo matemáticas en inglés. El modelo no se entrenó para seguridad, calidad de chat ni uso de herramientas más allá de lo que ya ofrece el base.
- Riesgo de alucinación y sesgos: no evaluados específicamente en este adaptador; hereda los del modelo base Qwen3.5-2B.
- Restricciones de licencia: Apache-2.0, igual que el base, lo que permite uso comercial; aun así, es un artefacto de investigación y no un modelo listo para producción.
- La carga con PEFT en transformers exige la clase `Qwen3_5ForConditionalGeneration`; usar otra clase puede fallar por los nombres de módulo de Qwen3.5.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del estudio (código, configuración, pre-registro y resultados agregados): https://github.com/Abhigyan1805/qwen-reasoning-distill
- Adaptador A1 s1: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s1
- Adaptador A1 s3: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s3
- Adaptador A1-S s1: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1s-s1
