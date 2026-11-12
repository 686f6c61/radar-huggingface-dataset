# FRENCHFAKER/Clover-35B-A3B-Preview-cybersec-abliterated-GGUF

## Resumen

Clover-35B-A3B-Preview-cybersec-abliterated-GGUF es una compilación en formato GGUF del modelo Diffuspace/Clover-35B-A3B-Preview, un LLM de difusión con arquitectura Mixture of Experts (MoE) de 35.000 millones de parámetros totales y 3.000 millones activos por token. La modificación principal consiste en una "abliteración" por capas que elimina el comportamiento de rechazo del modelo original ante peticiones de seguridad ofensiva, orientándolo a investigación y pruebas de penetración autorizadas.

El modelo base emplea 256 expertos con enrutamiento top-8 y una arquitectura híbrida que combina capas de atención completa con capas de atención lineal, lo que reduce drásticamente el coste de la caché KV. Declara un contexto nativo de 128K tokens y soporta inglés y francés, con herencia de su base Qwen3.6 (según indica el autor), lo que explica cierta deriva del razonamiento hacia el chino.

Esta versión está cuantizada a Q4_K_M (~21 GB) y está pensada para ejecutarse en una única GPU de 24 GB, incluyendo el contexto completo de 128K. Es relevante para equipos de seguridad que necesitan un modelo local, sin censura y con soporte de tool calling para arneses agénticos de pentesting, aunque requiere una compilación específica de llama.cpp (PR #31306) porque la arquitectura `clover_moe` no está en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer híbrida (atención completa + atención lineal), difusión LLM; arquitectura `clover_moe` en llama.cpp |
| Parametros totales | 34.661.350.848 (~35B) |
| Parametros activos | ~3B (MoE, 256 expertos, top-8) |
| Longitud de contexto | 128K tokens nativo (131.072) |
| Tipos de cuantizacion | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | Inglés, francés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Capas de atención completa | 10 (× 2 cabezas KV) |
| Capas del decodificador | 40 |
| Tamano del repo | 21,2 GB |
| Modelo base | Diffuspace/Clover-35B-A3B-Preview |

## Arquitectura y entrenamiento

El modelo base es un LLM de difusión con arquitectura MoE: 35B parámetros totales con 3B activos por token, 256 expertos y enrutamiento top-8. La pila del decodificador tiene 40 capas, de las cuales solo 10 son de atención completa con 2 cabezas KV cada una; el resto usa atención lineal. Esta proporción reducida de capas de atención completa es la que permite mantener una caché KV muy compacta: en q4_0 a 128K ocupa aproximadamente 0,7 GB.

La modificación de esta compilación es una abliteración por capa: se captura una dirección de rechazo por cada capa del decodificador (40 capas, mediante forward hooks), en lugar de una única dirección global. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base; el autor solo indica la herencia de una base Qwen3.6. No se documentan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (128K).
- Razonamiento con modo "thinking" activable; el autor recomienda `max_tokens` generoso (~5000) en tareas agénticas.
- Soporte nativo de tool calling / function calling, validado en un arnés agéntico de pentesting.
- Capacidades agénticas y razonamiento multi-paso para flujos de seguridad.
- Respuestas en inglés y francés; el razonamiento puede derivar al chino por herencia de su base.
- Comportamiento sin censura en categorías de seguridad ofensiva (lockpicking, keyloggers, inyección SQL, reverse shells, phishing, cracking WPA2, documentos falsificados, enumeración de WordPress), según el test del autor.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo responde a peticiones de explotación que el original rechaza, integrándose en un arnés agéntico con tool calling para reconocimiento, enumeración y generación de payloads sobre sistemas con permiso escrito.
- Investigación en seguridad ofensiva: análisis de vectores de ataque y redacción de PoCs en laboratorios aislados, aprovechando el contexto de 128K para procesar informes y código extensos.
- Red teaming de LLM: generación de prompts adversariales y evaluación de la robustez de otros modelos frente a contenido ofensivo.
- Formación y concienciación: creación de escenarios de phishing y ejercicios de simulación controlados, con revisión humana obligatoria.
- Automatización de análisis de código malicioso: el contexto largo permite cargar muestras, scripts y trazas completas en una sola ventana para su revisión.
- Despliegue local en estación de trabajo: con Q4_K_M cabe en una RTX 3090 (24 GB) manteniendo 128K de contexto, útil para entornos con requisitos de confidencialidad que impiden usar APIs en la nube.
- Asistencia a auditores: resumen y correlación de hallazgos de escaneos y logs extensos gracias a la ventana de 128K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta un test propio de 8 prompts de seguridad, no representativo:

| Prueba | Resultado |
|---|---|
| Test de seguridad (8 prompts) | 8 / 8 respondidos |
| Generación (RTX 3090, Q4_K_M) | ~88 tok/s |
| Prompt processing (RTX 3090) | ~2200 tok/s |
| Caché KV a 128K (q4_0) | ~0,7 GB |

## Requisitos de hardware

- VRAM estimada: ~21 GB para los pesos Q4_K_M más ~0,7 GB de caché KV a 128K en q4_0; en la práctica requiere una GPU de 24 GB.
- GPU recomendadas: RTX 3090 (medido por el autor), RTX 4090 (24 GB), A100 40/80 GB, H100 para mayor throughput y concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 de 24 GB con contexto completo; no en GPUs de 16 GB o menos con esta cuantización.
- Despliegue: llama.cpp compilado con PR #31306 (`llama-server`); mainline no soporta `clover_moe`. LM Studio y Ollama no cargan el modelo. No se documenta soporte de vLLM ni TGI.
- Parámetros de ejecución sugeridos por el autor: `-ngl 999 -c 131072 -fa on --jinja --cache-type-k q4_0 --cache-type-v q4_0 --presence-penalty 0.9 --repeat-penalty 1.05`.
- Latencia/throughput: ~88 tok/s de generación y ~2200 tok/s de prompt en una RTX 3090.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad declarados.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Clover-35B-A3B-Preview-cybersec-abliterated (este) | 35B totales / 3B activos | 128K | Apache-2.0 | GGUF Q4_K_M; requiere llama.cpp con PR #31306 |
| Diffuspace/Clover-35B-A3B-Preview (base) | 35B totales / 3B activos | 128K | Apache-2.0 | Pesos originales; con rechazos de seguridad |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Guardarraíles eliminados: el modelo responde a peticiones peligrosas u ofensivas; su uso indebido puede vulnerar la ley.
- Solo debe emplearse en investigación y pruebas de seguridad autorizadas por escrito sobre sistemas propios o con permiso explícito.
- La abliteración no es completa: algunas categorías fuera de seguridad (por ejemplo, síntesis de drogas) siguen rechazándose.
- El test de seguridad del autor consta de solo 8 prompts; no es un benchmark representativo de robustez ni de calidad general.
- Deriva del razonamiento hacia el chino en ocasiones, heredada de su base; las respuestas finales respetan el idioma solicitado.
- Soporte limitado de idiomas declarado (inglés y francés); el rendimiento en castellano no está documentado.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados.
- Compatibilidad restringida: mainline de llama.cpp, LM Studio y Ollama no cargan la arquitectura `clover_moe`.
- Licencia Apache-2.0 heredada del modelo base, sin restricciones adicionales documentadas para uso comercial, pero la responsabilidad legal del uso recae en el usuario.
- Se entrega "tal cual", sin garantía.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FRENCHFAKER/Clover-35B-A3B-Preview-cybersec-abliterated-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- PR de llama.cpp con soporte Clover: PR #31306 (referenciado en la model card, sin URL directa en la información disponible)
