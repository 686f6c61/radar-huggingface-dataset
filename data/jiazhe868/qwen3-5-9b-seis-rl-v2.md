# jiazhe868/Qwen3.5-9B-Seis-RL-v2

## Resumen

Qwen3.5-9B-Seis-RL-v2 es un ajuste fino del modelo Qwen3.5-9B-Seis-SFT, desarrollado por el usuario jiazhe868, orientado a razonamiento cuantitativo en el dominio de la sismología y la geofísica. Se trata de un modelo multimodal de tipo image-text-to-text con 9.653.104.368 parámetros totales, construido sobre la familia Qwen3.5 y entrenado mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) durante 110 pasos sobre un banco de 13.075 problemas.

El problema que aborda es la fiabilidad del razonamiento numérico de múltiples pasos: el modelo SFT previo tendía a agotar el presupuesto de tokens antes de terminar la respuesta o a producir valores incorrectos. La versión RL-v2 corrige en parte ese comportamiento, mejorando la precisión en conjuntos de problemas numéricos difíciles y reduciendo la longitud media de salida de 9.517 a 5.152 tokens.

Es relevante ahora porque demuestra que el RL con recompensa basada en finalización correcta (sin penalización por longitud) puede mejorar simultáneamente precisión y eficiencia en dominios científicos especializados. La licencia es Apache 2.0 y el modelo se distribuye en formato safetensors con un tamaño de repositorio de 19,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (image-text-to-text) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en despliegue recomendado (vLLM con --max-model-len 40960); presupuesto de salida evaluado hasta 32K |
| Tipos de cuantización | no disponible (el repo contiene safetensors sin indicar variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B-Seis-SFT, un ajuste supervisado del Qwen3.5 base orientado a sismología. Sobre él se aplica GRPO: 8 respuestas por prompt, ventaja calculada como la recompensa de cada respuesta menos la media de su grupo, 126 prompts por paso, clip PPO de 0,2 por debajo y 0,28 por encima, sin término KL, respuestas limitadas a 24K tokens y tasa de aprendizaje de 1e-6 con decaimiento lineal desde el paso 86 (6,5e-7 en el paso 110).

El banco de problemas consta de 13.075 ítems re-calificados por el propio modelo SFT: 7.433 numéricos, 2.442 de código y 3.200 instrucciones generales. Los problemas que el modelo SFT resuelve solo ocasionalmente se muestrean con más frecuencia, y se añadieron 18 nuevas familias de problemas numéricos largos de múltiples pasos. Una respuesta numérica que agota los tokens cuenta como incorrecta y no existe penalización por longitud: la única vía de recompensa es terminar y acertar. Se seleccionó el paso 110 mediante una pasada de validación cada 10 pasos.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos con modo thinking activado por defecto (el razonamiento se expone en `reasoning_content`).
- Resolución de problemas numéricos cuantitativos con seguimiento de unidades y cifras significativas, con formato de respuesta final `\boxed{<número> <unidad>}`.
- Generación y evaluación de código (D-Code pass@1 de 92,7; LiveCodeBench posterior a 2025-01 de 63,2).
- Tool calling / function calling (87,8 sobre 188 ítems de evaluación).
- Capacidad multimodal de entrada image-text-to-text según el pipeline declarado.
- Razonamiento científico general (GPQA Diamond 77,5) y seguimiento de instrucciones (IFEval 93,6).
- Dominio especializado en sismología y geofísica (cálculos de distancia hipocentral, tiempos S-P, velocidades Vp/Vs).
- Multilingüe: solo inglés declarado.

## Casos de uso

- Cálculo de parámetros sísmicos: estimación de distancias hipocentrales, tiempos de viaje S-P y velocidades aparentes a partir de datos de estación, usando el prompt de sistema entrenado para forzar una respuesta numérica única con unidades.
- Procesamiento por lotes de problemas geofísicos: integración vía vLLM con `--reasoning-parser qwen3` para resolver grandes volúmenes de ejercicios cuantitativos con salida estructurada en `\boxed{}`.
- Asistente de laboratorio para investigación sísmica: resolución de cálculos de múltiples pasos (conversión de magnitudes, atenuación, localización) donde el modelo mantiene el razonamiento en `reasoning_content` y entrega solo el resultado final.
- Generación de código científico: producción de scripts de análisis de señales o procesado de datos sísmicos, apoyada en su rendimiento en D-Code (92,7 pass@1) y LiveCodeBench (63,2).
- Evaluación automática de respuestas numéricas: uso como calificador o generador de referencias en pipelines de benchmark, dado su formato de salida determinista y su capacidad de razonamiento verificable.
- Tutoría técnica especializada: explicación paso a paso de problemas de sismología con verificación numérica final, adecuada para formación de estudiantes de geofísica en inglés.
- Agentes con tool calling en flujos de análisis de datos: encadenamiento de llamadas a funciones para consultar catálogos sísmicos o ejecutar cálculos, con una tasa de acierto en tool calling de 87,8.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con temperatura 1,0, top-p 1,0, thinking activado y hasta 32K tokens de salida; solo se califica la respuesta final. ± es el intervalo de confianza del 95 % del ruido de muestreo.

| Conjunto (métrica, ítems) | Base | SFT | RL run 1, paso 20 | Este modelo |
|---|---|---|---|---|
| D-Num: problemas de 1–3 pasos (avg@8, 300) | 91,6 ± 1,0 | 89,4 ± 0,9 | 89,2 ± 1,0 | **95,6** ± 0,7 |
| D-Num-hard: 3+ pasos (avg@8, 160) | 62,0 ± 1,6 | 68,1 ± 1,4 | 70,1 ± 1,7 | **86,5** ± 1,5 |
| D-Fresh: escritos tras el lanzamiento del base (avg@8, 60) | 70,6 ± 2,6 | 78,8 ± 2,3 | 83,3 ± 2,6 | **89,2** ± 1,9 |
| D-Code (pass@1, 150) | 80,5 ± 2,3 | 86,3 ± 2,0 | 85,2 ± 2,2 | **92,7** ± 1,5 |
| D-Report (win rate vs base, peor de dos jueces, 100) | 50 | 49,0 ± 9,0 | 49,0 ± 8,5 | 58,0 ± 9,0 |
| GPQA Diamond (198) | 56,6 ± 1,6 | 71,3 ± 1,6 | 74,2 ± 1,8 | **77,5** ± 1,5 |
| IFEval (377) | 93,1 | 93,1 | 93,9 | 93,6 |
| LiveCodeBench posterior a 2025-01 (70) | 38,2 | 52,5 | 50,0 | **63,2** |
| Tool calling (188) | 83,0 | 88,8 | 86,7 | 87,8 |
| Rechazo de prompts que deberían rechazarse, % (300) | **56,0** | 51,3 | 45,7 | 45,7 |
| Sobrerrechazo de prompts benignos, % (350) | 3,4 | 4,0 | 2,6 | 2,9 |
| Tokens de salida medios | 14.735 | 9.517 | 5.637 | **5.152** |

Diferencia frente al modelo SFT en los mismos ítems (emparejada, IC 95 %) al re-puntuar con topes de 16K, 32K y 64K tokens:

| Conjunto | Modelo | 16K | 32K | 64K |
|---|---|---|---|---|
| D-Num-hard | SFT | 47,8 | 68,1 | 83,9 |
| | Este modelo | **67,1** | **86,5** | **90,2** |
| | Diferencia [95 %] | +19,3 [+16,2, +22,3] | +18,4 [+14,4, +22,4] | +6,3 [+3,7, +9,1] |
| D-Fresh | SFT | 66,9 | 78,8 | 84,0 |
| | Este modelo | **85,6** | **89,2** | **89,8** |
| | Diferencia [95 %] | +18,8 [+12,1, +26,0] | +10,4 [+5,2, +16,2] | +5,8 [+1,7, +10,4] |

En D-Num-hard a 32K, el 6,3 % de sus respuestas agotan tokens (SFT: 28,2 %) y el 6,7 % dan un valor incorrecto (SFT: 3,6 %; RL run 1: 12,6 %).

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 19,3 GB solo para pesos, más caché KV; con contexto de 40.960 tokens la demanda supera con holgura los 24 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o configuraciones multi-GPU para servir con contexto largo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en BF16 con contexto largo; requeriría cuantización, de la que no se publican variantes oficiales en el repositorio.
- Despliegue: vLLM es el recomendado por el autor (`vllm serve ... --max-model-len 40960 --reasoning-parser qwen3 --language-model-only`). No se documentan recetas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor reporta una longitud media de salida de 5.152 tokens en el conjunto de evaluación, lo que condiciona el coste por consulta en modo thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | D-Num-hard (32K) | GPQA Diamond | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-9B-Seis-RL-v2 | 9,65B | 40.960 (despliegue) | 86,5 | 77,5 | Apache 2.0 |
| Qwen3.5-9B-Seis-SFT (modelo base) | no disponible | no disponible | 68,1 | 71,3 | Apache 2.0 (heredada) |
| Qwen3.5 base (referencia del autor) | no disponible | no disponible | 62,0 | 56,6 | no disponible en la información |

No se dispone de datos de benchmarks de otros modelos de 9B comparables fuera de la familia descrita; la comparación se limita a las tres variantes evaluadas por el autor con el mismo harness.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La tasa de rechazo de prompts que deberían rechazarse cae del 56,0 % (base) al 45,7 % (este modelo): menor alineación de seguridad que el modelo original.
- El 6,7 % de las respuestas en D-Num-hard a 32K contienen un valor incorrecto, superior al 3,6 % del SFT; el modelo es más preciso en conjunto pero introduce errores de valor en una fracción mayor de casos.
- Las mejoras en tareas de redacción de informes (D-Report, 58,0 % de win rate con intervalo de ±9,0) no son concluyentes.
- Los conjuntos de test no son etiquetas humanas: cada referencia es un programa o un modelo verificado por otros modelos, lo que introduce posible sesgo de evaluación.
- El checkpoint corresponde a la semilla 1 de dos semillas entrenadas; la semilla 2 también supera al SFT (+15,2 en D-Num-hard y +8,5 en D-Fresh a 32K), pero no se publican resultados de una tercera semilla.
- El modo thinking está activado por defecto y consume miles de tokens por respuesta (media de 5.152), con impacto directo en coste y latencia.
- El prompt de sistema entrenado impone un formato de respuesta muy específico (`\boxed{}`); usos fuera de ese formato pueden degradar el rendimiento.
- Aunque el pipeline declarado es image-text-to-text, el autor solo documenta el uso con vLLM en modo texto (`--language-model-only`); el soporte de visión en producción no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre exactitud en dominios críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiazhe868/Qwen3.5-9B-Seis-RL-v2
- Modelo base SFT: https://huggingface.co/jiazhe868/Qwen3.5-9B-Seis-SFT
- Repositorio de post-entrenamiento: https://github.com/jiazhe868/qwen-seis-posttrain
