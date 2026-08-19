# Abhisingh-18/Sutra-1.3B-Chat

## Resumen

Sutra-1.3B-Chat es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de 1.32 mil millones de parámetros totales, de los cuales solo 0.28 mil millones se activan por token (esparsidad 4.7x). Ha sido entrenado desde cero por Abhisingh-18 con una arquitectura personalizada que combina MoE con Multi-head Latent Attention (MLA), sin utilizar pesos preentrenados ni el entrenador de Transformers. El modelo está orientado a generación de texto en inglés e hindi (con soporte de escritura devanagari) y resuelve tareas de conversación y generación de contenido con un coste computacional reducido gracias a su alta esparsidad.

Su relevancia radica en que demuestra que es posible entrenar un modelo competitivo desde cero con solo 18 mil millones de tokens (unas 500 veces menos que modelos comparables como Llama 3.2 1B) y con un presupuesto de cómputo modesto (4x RTX 6000 Ada durante 4 días). El modelo incluye una ventana de contexto de 4096 tokens y está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. No obstante, sus limitaciones son claras: no realiza razonamiento multi-paso, no genera código funcional y sufre de alucinaciones frecuentes en tareas de conocimiento factual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (48 expertos enrutados + 1 compartido, top-4) + Multi-head Latent Attention (MLA) |
| Parametros totales | 1.32B |
| Parametros activos | 0.28B (4.7x esparsidad) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (no se especifica; los pesos se cargan mediante inference.py) |
| Idiomas soportados | inglés, hindi |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se cargan mediante inference.py; el repo incluye archivos de pesos de 5.3 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 48 expertos enrutados y un experto compartido, seleccionando los 4 mejores por token mediante puntuación sigmoide y balanceo de carga basado en bias. La atención utiliza Multi-head Latent Attention (MLA) con un rango de compresión de clave/valor de 256. La red consta de 16 capas (la primera densa, las 15 restantes MoE), con una dimensión de modelo de 1024 y un vocabulario de 48.000 tokens que cubre inglés y devanagari. El entrenamiento se realizó desde cero en tres etapas: pretraining con 18B tokens (inglés, hindi, código y matemáticas) durante 4 días y 9 horas en 4x RTX 6000 Ada; SFT con 200K conversaciones (18 horas) y DPO con 100K pares de preferencia (6 horas). La perplejidad en validación fue de 15.00 tras el pretraining y de 5.49 tras el SFT. El DPO no generalizó correctamente (precisión de preferencia del 47.5% frente al 50% aleatorio), por lo que el checkpoint SFT y el DPO rinden de forma similar.

## Capacidades

- Generación de texto fluido en inglés y hindi (devanagari), siguiendo instrucciones y formatos de manera correcta.
- Respuesta a preguntas de conocimiento común (supera el azar en tareas como ARC-easy y PIQA).
- Capacidad de completar texto y generar contenido creativo o descriptivo.
- No dispone de soporte para tool calling, function calling o uso como agente autónomo.
- No realiza razonamiento multi-paso ni genera código funcional (limitación inherente a su tamaño activo).
- Capacidad multilingüe limitada a inglés e hindi; no se mencionan otros idiomas.
- No incluye modo de pensamiento extendido, visión ni audio.

## Casos de uso

- Asistente conversacional básico en inglés o hindi: el modelo puede mantener diálogos cortos y coherentes gracias a su entrenamiento con 200K conversaciones, adecuado para chatbots de bajo coste en entornos con recursos limitados (funciona en CPU).
- Generación de borradores de correos o documentos: produce texto fluido y bien formateado, útil para redactar mensajes preliminares que luego un humano revisa.
- Resumen de párrafos cortos: puede condensar información simple, aunque no debe usarse para documentos largos o técnicos debido a su limitada capacidad de razonamiento.
- Completado de texto en editores o formularios: su capacidad de generación autoregresiva permite autocompletar frases en inglés o hindi.
- Prototipado rápido de aplicaciones de chat: al ser ligero (0.28B activos) y ejecutarse en CPU, es ideal para pruebas de concepto antes de migrar a modelos más grandes.
- Generación de contenido educativo simple: puede crear explicaciones básicas de conceptos generales, siempre que se verifique la exactitud de los datos (riesgo de alucinación).
- Tareas de clasificación de texto simple (adaptando la salida): puede asignar etiquetas a textos cortos si se le proporciona un prompt estructurado, aunque su rendimiento en tareas de razonamiento como WinoGrande es al azar.

## Benchmarks y rendimiento

Los resultados de evaluación se obtuvieron con log-likelihood scoring sobre 500 ejemplos por tarea, con precisión normalizada por longitud.

| Tarea | Aleatorio | Base | SFT | DPO |
|---|---|---|---|---|
| HellaSwag | 25.0 | 38.4 | 39.8 | **40.4** |
| ARC-easy | 25.0 | 45.0 | 44.8 | **45.0** |
| PIQA | 50.0 | 62.6 | 65.4 | **65.6** |
| WinoGrande | 50.0 | 50.6 | 49.0 | 49.0 |

La perplejidad en validación fue de 15.00 (pretraining) y 5.49 (SFT). No se han publicado comparaciones con otros modelos de tamaño similar en la información disponible.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en CPU: genera aproximadamente 10 tokens/segundo en 2 núcleos, gracias a que solo 0.28B parámetros están activos por token.
- Tamaño de pesos: 5.3 GB (probablemente en precisión FP32, aunque no se especifica). En FP16 ocuparía ~2.6 GB y en int8 ~1.3 GB, pero no se ofrecen versiones cuantizadas oficiales.
- GPU recomendada: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutarlo en FP16 (si se convierten los pesos), aunque no se proporciona soporte oficial para ello.
- Opciones de despliegue: únicamente mediante `inference.py` (proporcionado en el repositorio), que carga la arquitectura personalizada. No es compatible con `transformers`, `vLLM`, `llama.cpp` ni `Ollama` sin adaptación manual.
- Latencia: en CPU se logran ~10 tokens/s; en GPU sería significativamente mayor, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de tamaño similar. La model card menciona que el modelo fue entrenado con ~500 veces menos datos que Llama 3.2 1B (9T tokens), pero no se ofrecen resultados de evaluación comparativa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenado con solo 18B tokens, lo que limita severamente su conocimiento factual y su capacidad de razonamiento.
- Alucina con frecuencia: afirma hechos incorrectos con confianza, por lo que no es adecuado para tareas que requieran precisión sin verificación externa.
- No realiza razonamiento multi-paso ni genera código funcional.
- Sensible a la redacción del prompt: errores tipográficos o instrucciones ambiguas pueden desviar la respuesta, a diferencia de modelos más grandes.
- El DPO no generalizó (precisión de preferencia del 47.5% frente al 50% aleatorio), por lo que el alineamiento adicional no aporta mejoras significativas.
- Solo soporta inglés e hindi; no cubre otros idiomas.
- Arquitectura propietaria: no es compatible con el ecosistema estándar de Hugging Face (`AutoModelForCausalLM`), lo que dificulta su integración en pipelines existentes.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías de soporte o mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abhisingh-18/Sutra-1.3B-Chat
- Script de inferencia (inference.py): https://huggingface.co/Abhisingh-18/Sutra-1.3B-Chat/resolve/main/inference.py
