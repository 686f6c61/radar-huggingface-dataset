# Dratinia/qwen-reasoning-distill-a1-s3

## Resumen

`qwen-reasoning-distill-a1-s3` es un adaptador LoRA publicado por el usuario Dratinia (repositorio de investigación de Abhigyan1805) sobre el modelo base Qwen/Qwen3.5-2B. Forma parte de un estudio pre-registrado que pregunta si la destilación por SFT de las cadenas de razonamiento de un profesor de mayor tamaño (Qwen3.5-9B) mejora a un modelo de 2.000 millones de parámetros de forma general o solo dentro de la distribución de entrenamiento. Este adaptador concreto corresponde al brazo A1, semilla de entrenamiento 3.

No es un modelo de propósito general mejorado: es un artefacto de investigación publicado para que los números reportados puedan verificarse. El adaptador tiene rango 32, se entrenó sobre 4.747 trazas matemáticas verificadas y ocupa aproximadamente 0,1 GB. Su efecto medible se concentra en matemáticas de primaria dentro de distribución (GSM8K y GSM-Symbolic), con una reducción notable de la longitud del razonamiento, mientras que en el conjunto temporal privado de problemas de competición publicados después del modelo base el rendimiento no mejora.

Es relevante ahora porque documenta con rigor un resultado negativo frecuente en la literatura de destilación: ganar en los benchmarks de entrenamiento no implica ganar en problemas nuevos, y la varianza entre semillas puede superar el efecto atribuido al método.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-2B; la arquitectura del base no se detalla en la información disponible. El adaptador se aplica sobre proyecciones de atención, atención lineal y MLP, lo que sugiere un esquema de atención híbrido en el modelo base |
| Parámetros totales | ~2.000 millones en el modelo base; adaptador LoRA de rango 32 (≈0,1 GB en disco) |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible para el modelo base. El entrenamiento usó secuencias de 2.048 tokens y el ejemplo de servicio configura `max_model_len=8192` |
| Tipos de cuantización | No disponible. El adaptador se publica en fp16 (safetensors); cuantizarlo exigiría fusionarlo previamente con el base |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors (`adapter_model.safetensors`), formato PEFT/LoRA |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3.5-2B con LoRA de rango 32, alpha 64 y dropout 0, aplicado a todas las proyecciones de atención, atención lineal y MLP, en fp16, con longitud de secuencia 2.048, batch efectivo 16, learning rate 1e-4 con schedule coseno, optimizador `adamw_8bit`, 594 pasos de optimizador y 2 épocas sobre una única Kaggle T4. El checkpoint publicado es el de la época 2, seleccionado frente al de la época 1 sobre un conjunto de desarrollo de 150 ítems (D_dev) antes de evaluar en test. El entrenamiento se hizo con Unsloth y PEFT 0.21.

Los datos proceden de un profesor Qwen3.5-9B en modo non-thinking, con 2 muestras por prompt, temperatura 0,7 y top-p 0,8, sobre una lista fija de 6.000 problemas muestreados con semilla 0 de un pool público descontaminado: 4.500 problemas de matemáticas de nivel 3-5 de SimpleRL-Zoo y 1.500 de GSM8K-train, con el sufijo «Please reason step by step, and put your final answer within \boxed{}». Solo se conservaron muestras cuya respuesta en `\boxed{}` verifica contra la respuesta oro, no truncadas, sin 20-gramas repetidos y de como máximo 2.048 tokens, quedándose con la muestra correcta más corta por prompt. Se hizo un segundo escaneo de solapamiento de 10-gramas contra todos los conjuntos de evaluación. El resultado fueron 5.023 trazas verificadas, de las que 4.747 se usaron tras el filtro de longitud y 200 se reservaron para pérdida de evaluación. No se usaron datos de evaluación ni problemas del conjunto temporal en el entrenamiento.

## Capacidades

- Generación de razonamiento matemático paso a paso en inglés, con formato de respuesta final delimitada por `\boxed{}`.
- Resolución de problemas aritméticos y de enunciado de nivel escolar (GSM8K, GSM-Symbolic) y de competición (MATH-500, con rendimiento prácticamente idéntico al base).
- Cadenas de razonamiento más cortas que el modelo base, con menos respuestas que agotan el presupuesto de tokens.
- Hereda las capacidades del base en instrucciones (IFEval 66,5) y en código (HumanEval+ 49,4 y MBPP+ 59,0), medidas con lm-eval en configuración lite.
- Modo non-thinking: todas las evaluaciones y el entrenamiento se hicieron con `enable_thinking=False` en la plantilla de chat.
- No se ha entrenado ni evaluado para tool calling, uso de agentes, visión o audio; la model card lo indica explícitamente.

## Casos de uso

- Verificación de resultados de investigación: cargar el adaptador con vLLM (`enable_lora=True`, `max_lora_rank=32`) y reproducir las cifras de TMH, MATH-500 y GSM8K publicadas en la model card, usando el mismo sufijo de prompt y modo non-thinking.
- Servicio multi-adaptador para comparar semillas: al ser un LoRA de 0,1 GB, se puede servir junto a `a1-s1`, `a1-s2` y `a1s-s1` sobre una sola instancia del base para replicar el análisis de varianza entre semillas.
- Generación de datasets sintéticos de matemáticas de primaria: el adaptador produce trazas más cortas que el base, lo que abarata la generación masiva de soluciones paso a paso que después se filtran con un verificador simbólico.
- Inferencia con latencia ajustada en problemas aritméticos escolares: el menor consumo de tokens de razonamiento reduce el coste por respuesta en comparación con el base, a costa de menor precisión en problemas de competición.
- Docencia y formación en ajuste fino: es una receta LoRA completa y reproducible (rango, alpha, learning rate, filtros de datos) que cabe en una GPU T4 de 16 GB y sirve como ejemplo práctico de destilación de razonamiento.
- Estudio de truncamiento y longitud de razonamiento: el adaptador reduce la tasa de truncamiento en TMH del 58,4 % al 51,4 %, lo que permite analizar la relación entre presupuesto de tokens y precisión en modelos pequeños.
- Auditoría de contaminación: el pipeline de filtrado por 10-gramas y el conjunto temporal privado (TMH) sirven como plantilla para construir evaluaciones propias resistentes a fuga de datos.

## Benchmarks y rendimiento

Evaluación con arnés idéntico en modo non-thinking, mismo sufijo de prompt y ajustes lite pre-registrados. TMH es un conjunto temporal privado de 321 problemas de competición publicados después del lanzamiento del base (JEE Main 2026 Sesión 2, JEE Advanced 2026, AIME 2026, HMMT febrero 2026). Precisión en %:

| Modelo | TMH | TMH truncado | MATH-500 | GSM8K | GSM-Symbolic | D_dev |
|:--|--:|--:|--:|--:|--:|--:|
| B0 (base Qwen3.5-2B) | 31,1 | 58,4 | 69,0 | 79,4 | 71,6 | - |
| A1 s1 | 30,5 | 47,4 | 66,2 | 81,1 | 74,0 | 71,0 |
| A1 s2 | 33,8 | 49,7 | 70,4 | 82,7 | 74,8 | 71,4 |
| **A1 s3 (este adaptador)** | 29,4 | 51,4 | 70,8 | 82,3 | 76,2 | 70,2 |
| A1-S s1 | 32,9 | 51,6 | 69,4 | 83,2 | 75,2 | 72,4 |

Retención de capacidades generales (lm-eval, ajustes lite, precisión en %):

| Modelo | MMLU-Pro | IFEval | ARC-C | BBH | HumanEval+ | MBPP+ | Media |
|:--|--:|--:|--:|--:|--:|--:|--:|
| B0 (base Qwen3.5-2B) | 50,0 | 67,1 | 72,6 | 63,7 | 45,1 | 59,5 | 59,7 |
| A1 s1 | 50,1 | 67,7 | 74,3 | 65,3 | 47,6 | 57,7 | 60,5 |
| A1 s2 | 50,4 | 66,9 | 76,5 | 65,8 | 47,6 | 61,1 | 61,4 |
| **A1 s3 (este adaptador)** | 50,1 | 66,5 | 75,4 | 65,2 | 49,4 | 59,0 | 61,0 |
| A1-S s1 | 49,0 | 64,1 | 76,1 | 65,9 | 45,7 | 59,3 | 60,0 |

Agregado sobre las 3 semillas de A1, el cambio medio respecto al base es de +0,1 puntos en TMH, +0,1 en MATH-500, +2,6 en GSM8K, +3,4 en GSM-Symbolic y -8,9 puntos de truncamiento en TMH. La media de retención en seis tareas se mueve menos de 2 puntos. La precisión entre las respuestas no truncadas de TMH cae del 72,7 % del base al rango 56-68 % de los adaptadores.

## Requisitos de hardware

- VRAM para inferencia: el base de 2.000 millones de parámetros ocupa del orden de 4 GB en fp16, más ~0,1 GB del adaptador. En 8 bits, alrededor de 2,2 GB; en 4 bits, entre 1,2 y 1,5 GB. Son estimaciones por tamaño de parámetros, no mediciones publicadas.
- Caché KV: no disponible; depende de la longitud de contexto configurada (el ejemplo usa 8.192 tokens) y del esquema de atención del base.
- GPU de entrenamiento: una única Kaggle T4 de 16 GB fue suficiente para completar las 2 épocas con secuencia de 2.048 y batch efectivo 16.
- GPU de inferencia: cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 en fp16 o cuantizado. Para servicio con varias réplicas de adaptador se recomienda A100 40/80 GB o H100.
- Despliegue: vLLM con `enable_lora=True` y `max_lora_rank=32` es la ruta documentada y usada en el estudio. Con transformers y PEFT es necesario cargar el base con la clase usada en entrenamiento (`Qwen3_5ForConditionalGeneration`). llama.cpp, Ollama o TGI requerirían fusionar el adaptador con el base; no está documentado en la información disponible.
- Latencia y throughput: no disponibles. La reducción de longitud de razonamiento respecto al base debería traducirse en menos tokens generados por respuesta, pero no se han publicado medidas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TMH | MATH-500 | GSM8K | Media retención | Licencia | Disponibilidad |
|:--|:--|:--|--:|--:|--:|--:|:--|:--|
| Qwen3.5-2B (base) | ~2 B | No disponible | 31,1 | 69,0 | 79,4 | 59,7 | Apache-2.0 | HuggingFace |
| qwen-reasoning-distill-a1-s3 | ~2 B + LoRA r32 | No disponible | 29,4 | 70,8 | 82,3 | 61,0 | Apache-2.0 | HuggingFace |
| qwen-reasoning-distill-a1-s2 | ~2 B + LoRA r32 | No disponible | 33,8 | 70,4 | 82,7 | 61,4 | Apache-2.0 | HuggingFace |
| qwen-reasoning-distill-a1s-s1 | ~2 B + LoRA r32 | No disponible | 32,9 | 69,4 | 83,2 | 60,0 | Apache-2.0 | HuggingFace |

Los tres adaptadores comparables pertenecen al mismo estudio, por lo que la comparación mide principalmente varianza entre semillas y configuración de datos, no diferencias de método. No se dispone de datos de benchmarks de otros modelos de 2 B destilados en matemáticas dentro de la información proporcionada.

## Limitaciones y advertencias

- La destilación no mejora el conjunto temporal: en TMH este adaptador obtiene 29,4 frente a 31,1 del base, y la media de las tres semillas de A1 solo sube +0,1 puntos.
- La mejora se concentra en matemáticas escolares dentro de distribución (GSM8K +2,9 y GSM-Symbolic +4,6 respecto al base para esta semilla), no en problemas nuevos de competición.
- El efecto principal es acortar el razonamiento: menos respuestas agotan el presupuesto de tokens, pero la precisión entre las respuestas no truncadas de TMH cae del 72,7 % del base al 56-68 % de los adaptadores.
- La varianza entre semillas es grande: solo las semillas producen una dispersión de 4,4 puntos en TMH y 4,6 en MATH-500, de modo que las diferencias de un único adaptador son mayoritariamente ruido.
- Las cifras provienen de ajustes de evaluación lite con límite de tiempo; las estadísticas pareadas por ítem del análisis pre-registrado aún no se han calculado y todas las diferencias son provisionales.
- Solo inglés y solo matemáticas. El modelo no se entrenó para seguridad, calidad de chat ni uso de herramientas más allá de lo que herede el base.
- Es un adaptador LoRA, no un modelo autónomo: requiere descargar Qwen3.5-2B y cargarlo con la clase correcta de transformers para PEFT.
- Repositorio con 0 descargas y 0 likes: no hay validación independiente de la comunidad ni garantía de mantenimiento.
- Licencia Apache-2.0, permisiva para uso comercial, pero el uso en producción hereda las limitaciones y la licencia del modelo base.
- Riesgo de alucinación en la justificación matemática: las trazas se filtraron por respuesta final correcta, no por validez del razonamiento intermedio, así que pueden contener pasos incorrectos que llevan a la respuesta correcta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del estudio (código, configuración, pre-registro, resultados agregados): https://github.com/Abhigyan1805/qwen-reasoning-distill
- Protocolo de evaluación: `EVAL_PROTOCOL.md` en el repositorio, etiqueta git `prereg-v1`
- Adaptador hermano A1 s1: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s1
- Adaptador hermano A1 s2: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1-s2
- Adaptador hermano A1-S s1: https://huggingface.co/Dratinia/qwen-reasoning-distill-a1s-s1
- Script de servicio y selección: `scripts/phase1_select.py` en el repositorio
