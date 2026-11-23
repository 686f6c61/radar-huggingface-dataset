# mstrasser/Jeff-Qwen3.5-0.8B

## Resumen

Jeff-Qwen3.5-0.8B es un ajuste fino (fine-tune) del modelo Qwen3.5-0.8B de Alibaba, desarrollado por el autor independiente mstrasser. No es un modelo generativo al uso: está especializado en clasificación zero-shot y funciona como un "modelo de decisión" que, dada una descripción de situación y una lista de opciones en lenguaje natural, devuelve una probabilidad calibrada para cada opción en un único forward pass, sin generar texto ni requerir parseo posterior.

El modelo está pensado para colocarse por delante de un LLM grande y caro: Jeff responde primero las decisiones rápidas y solo cuando su confianza es baja la consulta pasa al modelo mayor. Según la model card, esta arquitectura en cascada reduce el tiempo por decisión de 8,1 s a 0,25 s (38× más rápido) y los errores del 13,4% al 4,7% frente a un Qwen3.8-27B que decide todo por sí solo, con un coste de memoria adicional de 1,96 GB para los nueve adaptadores LoRA.

Con 852.985.920 parámetros reales (según safetensors), licencia Apache 2.0 y un peso de repositorio de 5,3 GB, es un modelo pequeño y desplegable en hardware local. La versión documentada aquí es la v1.2 (1 de octubre de 2026), que el autor marca como reemplazada por Jeff v1.3 (mstrasser/jeff-base).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen3.5-0.8B), cabecera de clasificación zero-shot |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo contiene safetensors; el autor cita ejecución en 8-bit para el modelo grande de comparación, no para Jeff) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y se ajusta para una tarea de clasificación zero-shot: se describe una situación y se enumeran opciones en lenguaje natural, y el modelo emite una probabilidad calibrada por opción en un solo forward pass. No hay decodificación autoregresiva ni generación de texto, lo que elimina la latencia y los errores de parseo típicos de los pipelines de clasificación basados en LLM generativos.

El entrenamiento de la v1.2 se hizo con una receta de una época, checkpoint final y una temperatura ajustada, sobre 284.747 preguntas de entrenamiento (frente a las 322k de la v1.1). La v1.2 se centra en limpiar los datos: se eliminaron fugas entre entrenamiento y test (coincidencias exactas de estados a cualquier longitud y solapamiento de opciones), y se corrigieron partes del dataset que permitían acertar por orden o longitud de respuesta en lugar de por contenido. Todo el entrenamiento se realizó en hardware local: una GPU RTX PRO 6000 (unas 2 horas para el 0.8B), con datos sintéticos del modelo base escritos por un modelo abierto (Qwen3.8-Flash-Next) sobre dos DGX Spark. El código de entrenamiento parte de la receta open source AutoJev.

## Capacidades

- Clasificación zero-shot: devuelve una probabilidad calibrada para cada opción de una lista arbitraria definida en lenguaje natural (intenciones, colas de soporte, etiquetas de moderación, comandos de voz, movimientos de juego).
- Decisión calibrada: el error de calibración (ECE) reportado es de 0,028, lo que permite usar el umbral de confianza para derivar consultas a un modelo mayor.
- Enrutamiento en cascada: diseñado para responder primero y delegar en un LLM grande solo cuando la confianza es insuficiente.
- Adaptadores LoRA: la v1.2 sirve de base para nueve adaptadores pequeños (cláusulas legales, intenciones de soporte, emoción, spam, grounding, guardia contra prompt injection, elección de herramienta, navegación por voz y triaje de tickets) que un mismo servidor carga en paralelo.
- Capacidades multilingües: limitadas al inglés según la model card.
- No soporta generación de texto libre, tool calling generativo, agentes multi-step ni razonamiento encadenado; su función es la decisión puntual.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: Jeff clasifica cada mensaje entrante en una de las colas de soporte definidas por el equipo; si la probabilidad máxima supera el umbral, se responde o enruta sin invocar al LLM grande, y solo los casos ambiguos pasan al modelo mayor. El autor reporta 95,7% de acierto y 39× más velocidad en las cinco decisiones típicas de un agente de bandeja de entrada.
- Moderación de contenido: clasificación zero-shot de textos en categorías de política (spam, abuso, contenido permitido) sin necesidad de reentrenar cuando cambian las etiquetas, gracias a que las categorías se describen en lenguaje natural.
- Detección de prompt injection: el adaptador específico actúa como guardia previo a un LLM, marcando entradas sospechosas antes de que lleguen al modelo generativo.
- Elección de herramienta en pipelines de agentes: dado un mensaje de usuario y un catálogo de herramientas descritas en texto, Jeff selecciona la herramienta adecuada como paso previo barato al agente principal.
- Triaje de tickets y cláusulas legales: los adaptadores de triaje y de cláusulas legales permiten clasificar documentación o incidencias con un modelo de menos de 1B de parámetros ejecutándose en local.
- Navegación por voz y comandos: el adaptador de navegación por voz mapea enunciados a comandos; el autor documenta un fine-tune que elevó la precisión en held-out del 31,7% al 95,8% en menos de media hora en una GPU.
- Clasificación de emociones en comentarios cortos: con el adaptador de emoción alcanza 60,6% frente al 35,6% del modelo de 27B, aunque el propio autor advierte que la tarea es difícil incluso para humanos.

## Benchmarks y rendimiento

| Modelo | Precisión del panel (base sin entrenar) | Precisión del panel (Jeff) | ECE | Tiempo por decisión (RTX PRO 6000) |
|---|---|---|---|---|
| Jeff-Qwen3.5-0.8B v1.2 (este modelo) | 45,3% | 78,7% | 0,028 | 22 ms |
| Jeff-Qwen3.5-0.8B v1.1 | 45,3% | 79,1% | 0,021 | 22 ms |
| Jeff-Qwen3.5-2B v1.2 | 46,5% | 81,7% | 0,021 | 24 ms |
| Jeff-Gemma4-E2B | 62,5% | 81,6% | 0,031 | 29 ms |
| Jev (publicado) | — | 83,0% | ≈0,06 | 212 ms por llamada vía API |

Comparativa en cascada frente a un Qwen3.8-27B que decide todo (media de 8 adaptadores, mismas filas de test, Apple M4 Max):

| Métrica | Qwen3.8-27B solo | Jeff + adaptadores (27B solo si Jeff duda) |
|---|---|---|
| Precisión media | 86,6% | 95,3% |
| Tiempo por decisión | 8,1 s | 0,25 s (38× más rápido) |
| Respuestas erróneas | 13,4% | 4,7% (2,8× menos) |
| Memoria | 28,6 GB | +1,96 GB para Jeff con los nueve adaptadores |

En las cinco decisiones de un agente de bandeja de entrada: 87,7% → 95,7% y 39× más rápido. Incluyendo el adaptador de emoción en la media de los nueve, el resultado es 91,4% frente a 80,9%. El autor advierte que la puntuación en el test de documentos largos cae del 82,8% (v1.1) al 66,1% (v1.2) porque la cifra anterior estaba inflada por fugas de documentos de test.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 853M de parámetros, los pesos en safetensors ocupan del orden de 1,7 GB en fp16 y menos de 1 GB en cuantización de 8 bits o 4 bits (estimación a partir del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: el autor entrena y evalúa en una RTX PRO 6000; también reporta ejecución en Apple M4 Max vía MLX (28 ms por decisión).
- GPU de consumo: por tamaño, cabe holgadamente en cualquier GPU consumer con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090), aunque el autor no publica cifras específicas para estas.
- Despliegue: transformers (librería declarada), con endpoints compatibles según los tags; MLX para Apple Silicon. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 22 ms por decisión en RTX PRO 6000 y 28 ms en Apple M4 Max (MLX). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de panel | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jeff-Qwen3.5-0.8B v1.2 | 853M | No disponible | 78,7% | 0,028 | Apache 2.0 | Hugging Face |
| Jeff-Qwen3.5-2B v1.2 | No disponible | No disponible | 81,7% | 0,021 | No disponible | Hugging Face |
| Jeff-Gemma4-E2B | No disponible | No disponible | 81,6% | 0,031 | No disponible | Hugging Face |
| Jev (publicado) | No disponible | No disponible | 83,0% | ≈0,06 | No disponible | API (TypeSafe) |

El modelo se posiciona como alternativa local y de licencia permisiva a Jev, con menor precisión (78,7% frente a 83,0%) pero mucha menor latencia (22 ms frente a 212 ms por llamada) y sin dependencia de API.

## Limitaciones y advertencias

- Modelo reemplazado: la model card indica que esta versión está superada por Jeff v1.3 (mstrasser/jeff-base) y ya no se actualiza.
- Tamaño reducido: el autor advierte explícitamente que su razonamiento no iguala al de modelos mayores; si la precisión zero-shot no basta, recomienda un fine-tune con ejemplos propios.
- Solo inglés: el campo de idiomas declarado es únicamente "en".
- Calibración dependiente del dominio: el ECE de 0,028 se mide en su panel de evaluación; el umbral de derivación al modelo grande debe recalibrarse en producción.
- Riesgo de sesgo y alucinación: no se documentan análisis de sesgo; al ser un clasificador sobre opciones dadas, el riesgo de inventar categorías es bajo, pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Datos de entrenamiento sintéticos: parte del dataset fue generado por un modelo abierto y algunos conjuntos públicos contienen texto generado por modelos cerrados; los adaptadores usaron además datos de un modelo alojado.
- Fugas corregidas en v1.2: las cifras de la v1.1 estaban infladas por solapamiento entre entrenamiento y test; conviene usar solo resultados de v1.2.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene sus propios términos que deben verificarse.
- Proyecto independiente: no está afiliado a TypeSafe (fabricantes de Jev), aunque usa su formato de petición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/Jeff-Qwen3.5-0.8B
- Versión actual (Jeff v1.3): https://huggingface.co/mstrasser/jeff-base
- Modelo hermano de 2B: https://huggingface.co/mstrasser/Jeff-Qwen3.5-2B
- Catálogo y documentación: https://jeffhub.ai
- Resultados detallados: https://jeffhub.ai/results
- Repositorio GitHub: https://github.com/firelex/jeff
- Receta de entrenamiento AutoJev: https://github.com/denis-pplx/autojev
