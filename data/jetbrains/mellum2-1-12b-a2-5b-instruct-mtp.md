# JetBrains/Mellum2.1-12B-A2.5B-Instruct-MTP

## Resumen

Mellum2.1-12B-A2.5B-Instruct-MTP es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por JetBrains, orientado a generación de texto y tareas de programación. Cuenta con 12.149.923.072 parámetros totales y 2.500 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos de 12B con coste de inferencia de un modelo de 2.5B. Esta variante concreta incluye la cabeza de predicción multi-token (MTP), que habilita decodificación especulativa en vLLM 0.33 o superior y transformers 5.20 o superior; los pesos son idénticos byte a byte a los de Mellum2.1 Instruct, y solo se añade un shard y una clave de configuración.

El modelo es la versión instruct de respuesta directa de la familia Mellum2.1, hermana de Mellum2.1 Thinking. La diferencia respecto a Mellum2 Instruct reside en el post-entrenamiento: aprendizaje por refuerzo a gran escala en entornos reales, incluyendo entrenamiento agéntico dentro de repositorios con herramientas de shell y ficheros, con recompensa cuando pasan los tests. El entrenamiento se construyó sobre NeMo RL de NVIDIA.

Es relevante ahora porque ofrece un equilibrio poco habitual: capacidades agénticas y de código con un coste de inferencia reducido gracias a los 2.5B parámetros activos, licencia Apache 2.0 y soporte de decodificación especulativa nativa mediante la cabeza MTP. Está pensado para trabajo agéntico rápido (subagentes, bucles de herramientas, correcciones pequeñas y preguntas sobre código), no para razonamiento largo con cadena de pensamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, con cabeza de predicción multi-token (MTP) |
| Parametros totales | 12.149.923.072 |
| Parametros activos | 2.500 millones (2.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | JetBrains/Mellum2-12B-A2.5B-Base |
| Tamaño del repositorio | 25.2 GB |
| Versión mínima de vLLM | 0.33 (para la cabeza MTP) |
| Versión mínima de transformers | 5.20 (para la cabeza MTP) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos de 12B parámetros totales con 2.5B activos por token, sin cambios respecto a Mellum2 Instruct. Sobre esa base se añade una cabeza de predicción multi-token (MTP), que permite decodificación especulativa: el modelo predice varios tokens por paso y un verificador los valida, acelerando la generación. La cabeza añade un shard adicional y una clave de configuración al repositorio; los pesos del modelo son idénticos byte a byte a los de Mellum2.1 Instruct.

El post-entrenamiento es el principal cambio respecto a la versión anterior. Se aplicó aprendizaje por refuerzo a gran escala en entornos reales, con entrenamiento agéntico dentro de repositorios reales usando herramientas de shell y de ficheros, y recompensa basada en el paso de tests. El entrenamiento se construyó sobre NeMo RL, el framework open source de NVIDIA. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO clásicos más allá de lo indicado.

## Capacidades

- Generación de texto y respuesta directa, sin cadena de pensamiento (a diferencia de Mellum2.1 Thinking).
- Generación de código en múltiples lenguajes: evaluado en MultiPL-E sobre 7 lenguajes en modo chat.
- Razonamiento matemático: resolución de problemas de competición (AIME) y aritmética con variaciones (GSM-Plus).
- Trabajo agéntico: bucles de herramientas, subagentes, correcciones pequeñas de código y preguntas sobre repositorios.
- Uso de herramientas de shell y de ficheros en entornos reales, entrenado explícitamente para ello.
- Soporte de tool calling / function calling: evaluado en BFCL v4, WorkBench y ToolHop.
- Capacidad de resolución de incidencias en repositorios: evaluado en SWE-bench Verified, SWE-bench Pro y Terminal-Bench 2.1.
- Seguimiento de instrucciones: evaluado en IFEval.
- Decodificación especulativa mediante la cabeza MTP (requiere vLLM 0.33+ o transformers 5.20+).
- Capacidades multilingües: limitadas al inglés según la model card.
- Sin soporte declarado de visión ni audio.

## Casos de uso

- Subagentes en pipelines agénticos: el modelo está entrenado con RL en entornos reales y responde de forma directa sin cadena de pensamiento, lo que lo hace adecuado como subagente rápido dentro de un sistema mayor que orquesta tareas.
- Bucles de llamadas a herramientas: con 46.5 de precisión en BFCL v4 y 51.4 en ToolHop, puede gestionar secuencias de invocación de funciones en asistentes de desarrollo y automatizaciones.
- Corrección de incidencias en repositorios: con 40.4 de tasa de resolución en SWE-bench Verified, sirve para tareas de parcheo acotadas donde no se requiere razonamiento largo previo.
- Asistente de preguntas sobre código: responde directamente sobre fragmentos y bases de código, adecuado para integración en IDE o chatbots internos de ingeniería.
- Automatización de tareas en terminal: con 8.2 de resolución en Terminal-Bench 2.1, puede encargarse de operaciones acotadas de shell y ficheros en flujos controlados.
- Generación de código en producción: 89.1 en HumanEval+ y 74.3 en MBPP+ lo hacen viable para autocompletado y generación de funciones en pipelines de CI/CD, con revisión humana.
- Razonamiento matemático asistido: 86.7 en GSM-Plus y 61.1 en AIME 25/26 permiten usarlo en herramientas de cálculo y verificación de problemas.
- Servicio de inferencia de bajo coste: al activar solo 2.5B parámetros, es adecuado para despliegues con alta concurrencia donde un modelo denso de 12B resultaría caro.
- Aceleración con decodificación especulativa: la cabeza MTP permite reducir latencia en vLLM 0.33+ en cargas de generación interactiva.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| LiveCodeBench v6 | pass@1 | 53.7 |
| HumanEval+ | pass@1 | 89.1 |
| MBPP+ | pass@1 | 74.3 |
| MultiPL-E (7 lenguajes, modo chat) | pass@1 | 73.7 |
| AIME 25/26 | exact match (avg@8) | 61.1 |
| GSM-Plus | exact match | 86.7 |
| SWE-bench Verified | resolved rate | 40.4 |
| SWE-bench Pro | resolved rate | 20.0 |
| Terminal-Bench 2.1 | resolved rate | 8.2 |
| BFCL v4 | accuracy | 46.5 |
| WorkBench | task completion | 38.0 |
| ToolHop | accuracy | 51.4 |
| IFEval | accuracy | 87.2 |
| GPQA Diamond | accuracy | 48.6 |
| MMLU-Redux | accuracy | 82.8 |
| MixEval-Hard | accuracy | 31.7 |
| XSTest | safe compliance | 72.3 |
| HarmBench | harmful rate (menor es mejor) | 15.6 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en safetensors ocupan 25.2 GB en el repositorio; en precisión completa (BF16) se requiere aproximadamente esa cifra más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una A100 de 40 GB o 80 GB, una H100 o una L40S son candidatas razonables; no confirmado.
- GPU de consumo: no confirmado. Con cuantización a 8 bits o 4 bits podría caber en GPUs de 24 GB, pero el autor no publica tipos de cuantización soportados.
- Opciones de despliegue: vLLM 0.33 o superior (necesario para aprovechar la cabeza MTP), transformers 5.20 o superior. Para versiones anteriores de estas librerías debe usarse el repositorio Mellum2.1 Instruct sin cabeza MTP.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para decodificación especulativa y reducción de latencia, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Instruct-MTP | 12.1B | 2.5B | no disponible | Apache 2.0 | Cabeza MTP para decodificación especulativa; respuesta directa |
| Mellum2.1-12B-A2.5B-Instruct | 12.1B | 2.5B | no disponible | Apache 2.0 | Mismos pesos sin cabeza MTP; compatible con vLLM y transformers anteriores |
| Mellum2.1-12B-A2.5B-Thinking | 12.1B | 2.5B | no disponible | Apache 2.0 | Variante con cadena de pensamiento para tareas largas y difíciles |
| Mellum2-12B-A2.5B-Instruct | 12.1B | 2.5B | no disponible | Apache 2.0 | Versión anterior; post-entrenamiento previo al RL en entornos reales |

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Respuesta directa sin razonamiento: para tareas largas y difíciles que se benefician de razonar antes de actuar, el autor recomienda Mellum2.1 Thinking en su lugar.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir código o afirmaciones incorrectas.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada.
- Rendimiento agéntico limitado en tareas complejas: 8.2 en Terminal-Bench 2.1 y 20.0 en SWE-bench Pro indican que las tareas de múltiples pasos siguen siendo un punto débil.
- Seguridad: 15.6 de tasa de contenido dañino en HarmBench y 72.3 de cumplimiento seguro en XSTest; requiere filtros adicionales en producción.
- Dependencia de versiones: la cabeza MTP solo funciona con vLLM 0.33+ y transformers 5.20+; con versiones anteriores hay que usar el repositorio Instruct.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento, no detalladas en la información disponible.
- Benchmarks no verificados: todos los resultados están marcados como `verified: false` en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Instruct-MTP
- Mellum2.1 Instruct (sin cabeza MTP): https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Instruct
- Mellum2.1 Thinking: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Mellum2 Instruct (versión anterior): https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Instruct
- Modelo base: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Base
- Referencia arXiv citada en los tags: arxiv:2605.31268
- JetBrains: https://www.jetbrains.com/
- NeMo RL (NVIDIA): no disponible en la información proporcionada
