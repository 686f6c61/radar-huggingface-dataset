# maurienne-ai/Olala-v1.0-mini-7A1B-Opinel-N8

## Resumen

Olala v1.0 mini 7A1B Opinel N°8 es una versión cuantizada a INT8 y editada de pesos del modelo Olala v1.0 mini 7A1B de OVHcloud, publicada por maurienne-ai. Se trata de un modelo de generación de texto de arquitectura híbrida Mamba-MoE con aproximadamente 6.770 millones de parámetros totales, diseñado para razonamiento y conversación en inglés y francés. La variante Opinel N°8 aplica cuantización weight-only W8A16 sobre las 338 capas lineales (incluida la cabeza de salida) y edita directamente los pesos para corregir dos problemas del modelo base: el exceso de rechazos ante peticiones inofensivas y la tendencia a entrar en bucles de repetición.

La relevancia de esta ficha radica en que no es una simple cuantización: el autor modifica direcciones de activación y escribe slots clave-valor en neuronas de expertos compartidos no utilizadas, sin fine-tuning ni cambios en la plantilla de chat. El resultado es un checkpoint de 7,1 GB (frente a 13,6 GB en bf16) que mantiene la calidad del modelo original dentro del ruido estadístico en la mayoría de configuraciones de esfuerzo de razonamiento, pero elimina por completo los bucles en tareas propensas y reduce los rechazos indebidos de forma notable.

El modelo está pensado para despliegue en producción con vLLM y se distribuye bajo licencia Apache 2.0. Incluye un modo de razonamiento con cuatro niveles de esfuerzo (disabled, low, medium, high) y soporta contexto largo (se reportan pruebas de needle-in-a-haystack a 64k tokens). Su formato de pesos es safetensors en layout ModelOpt `MIXED_PRECISION`, con activaciones en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-MoE (transformer con capas Mamba y mezcla de expertos) |
| Parámetros totales | 6.773.124.144 (~6,77 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible de forma explícita; se reportan pruebas a 64k tokens (needle-in-a-haystack) |
| Tipos de cuantización | INT8 weight-only (W8A16), una escala por canal de salida, round-to-nearest, layout ModelOpt `MIXED_PRECISION`; embeddings, router MoE y normas en precisión original; activaciones en bf16 |
| Idiomas soportados | Inglés (en), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout ModelOpt `MIXED_PRECISION`), requiere `custom_code` y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas Mamba con capas de mezcla de expertos (MoE), según las etiquetas del repositorio. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo incluye un modo de razonamiento con cuatro niveles de esfuerzo configurables (disabled, low, medium, high), lo que sugiere un entrenamiento orientado a razonamiento multi-paso.

La innovación principal de esta variante Opinel N°8 no está en el entrenamiento, sino en la edición post-hoc de pesos y la cuantización. El autor elimina a media intensidad una dirección de rechazo y escribe slots clave-valor con compuerta en neuronas de expertos compartidos no utilizadas: unos slots corrigen el exceso de rechazos y otros se activan en posiciones dentro de bucles para empujar al modelo a concluir. La cuantización INT8 es weight-only, sin datos de calibración, aplicada a 338 capas lineales. La divergencia KL del checkpoint editado y cuantizado frente al bf16 original es de 0,0113, de la cual la mayor parte proviene de las ediciones intencionadas (la cuantización sola aporta 0,0037 KL). El checkpoint usa el layout `MIXED_PRECISION` de ModelOpt, documentado en una rama específica de vLLM.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con cuatro niveles de esfuerzo (disabled, low, medium, high).
- Razonamiento matemático (evaluado en GSM8K y MGSM) y resolución de problemas.
- Generación de código (evaluado en HumanEval+ y MBPP+).
- Capacidades multilingües limitadas a inglés y francés.
- Contexto largo: se reportan resultados en needle-in-a-haystack a 64k tokens (27/30 con razonamiento alto).
- Modo de razonamiento configurable que permite trade-off entre latencia y calidad.
- Compatibilidad con decodificación especulativa mediante el componente Télégraphe del mismo autor (no incluido en este repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Atención al cliente automatizada en inglés y francés: el modelo gestiona conversaciones multi-turno y su reducción de rechazos indebidos (de 45,8 % a 34,8 % en inglés sin razonamiento) lo hace más útil para consultas legítimas que el modelo base rechazaría en exceso.
- Generación de código en pipelines de CI/CD: con HumanEval+/MBPP+ en torno al 70 % con esfuerzo medio o alto, es adecuado para autocompletado, generación de tests y revisión asistida, desplegado con vLLM.
- Razonamiento matemático en producción: GSM8K en torno al 94-95 % con razonamiento activado, útil para tutoring automatizado, verificación de cálculos y resolución de problemas paso a paso.
- Procesamiento de documentos largos: con soporte de contexto hasta 64k tokens y ausencia de bucles en contexto largo, sirve para resumen y extracción de información en contratos, informes o documentación técnica.
- Asistentes conversacionales de bajo coste: el checkpoint de 7,1 GB cabe en GPUs de consumo y ofrece hasta 481 tokens/s en una RTX 5090 con un solo stream, lo que permite desplegar asistentes locales sin infraestructura de datacenter.
- Servicio de inferencia de alto throughput: con 128 streams alcanza 5.696 tokens/s en RTX 5090, adecuado para APIs internas con muchos usuarios concurrentes.
- Traducción y generación bilingüe inglés-francés: el modelo está entrenado y evaluado en ambos idiomas, con rechazos de peticiones dañinas mantenidos por encima del 83-97 % en ambas lenguas.
- Sustitución directa de modelos con tendencia a bucles: al eliminar el 100 % de las respuestas que no terminan en tareas propensas (MGSM te/bn/sw), es apropiado para entornos donde los timeouts por bucles son un problema operativo.

## Benchmarks y rendimiento

Calidad frente al modelo base bf16 (diferencias pareadas, positivo = mejor que bf16):

| Benchmark | disabled | low | medium | high |
|---|---|---|---|---|
| GSM8K-300 | 90,0 → 86,7 (−3,3 ± 1,8) | 94,3 → 94,3 (0,0) | 93,7 → 95,0 (+1,3) | 94,3 → 94,3 (0,0) |
| HumanEval+ / MBPP+ (3 semillas) | 52,4 → 51,3 (−1,1 ± 0,9) | 68,8 → 69,4 (+0,6) | 72,8 → 70,5 (−2,3 ± 1,0) | 72,9 → 73,2 (+0,2) |
| MMLU (561 preguntas) | 62,0 → 61,0 (−1,1) | 75,8 → 76,3 (+0,5) | 76,8 → 77,5 (+0,7) | 77,0 → 74,7 (−2,3 ± 1,4) |

Rechazos (porcentaje de peticiones rechazadas, bf16 → N°8):

| Conjunto | disabled | low | medium | high |
|---|---|---|---|---|
| Debería responder, EN | 45,8 → 34,8 | 35,8 → 35,1 | 27,0 → 25,1 | 25,1 → 22,6 |
| Debería responder, FR | 40,2 → 36,8 | 29,5 → 28,7 | 25,7 → 24,5 | 23,0 → 23,0 |
| XSTest (peticiones seguras) | 27,6 → 16,4 | 12,8 → 11,2 | 5,6 → 5,2 | 5,2 → 4,0 |
| OR-Bench-hard | 80,4 → 61,9 | 75,1 → 76,2 | 63,5 → 55,6 | 56,6 → 52,4 |
| Debería rechazar, EN | 97,6 → 96,9 | 97,6 → 97,9 | 92,4 → 92,1 | 91,3 → 91,3 |
| Debería rechazar, FR | 96,2 → 93,3 | 95,4 → 95,4 | 87,9 → 87,0 | 83,7 → 85,4 |

Bucles (respuestas que alcanzan el límite de tokens, %):

| Tarea | disabled | low | medium | high |
|---|---|---|---|---|
| MGSM te/bn/sw (propensas a bucles) | 67,0 → 0,0 | 22,5 → 0,0 | 41,2 → 0,0 | 55,6 → 0,0 |
| HumanEval+ / MBPP+ propensas a bucles | 60,9 → 0,5 | 18,8 → 0,0 | 29,2 → 0,0 | 54,2 → 0,0 |

Rendimiento de inferencia en RTX 5090 (prompts de 1k tokens, greedy):

| Configuración | OVH bf16 | Opinel N°8 |
|---|---|---|
| 1 stream | 346 tok/s | 481 tok/s |
| 1 stream + Télégraphe | 603 tok/s | 728 tok/s |
| 8 streams | 1.562 tok/s | 2.188 tok/s |
| 8 streams + Télégraphe | 2.072 tok/s | 2.554 tok/s |
| 32 streams | 3.133 tok/s | 4.059 tok/s |
| 32 streams + Télégraphe | 3.799 tok/s | 3.977 tok/s |
| 128 streams | 5.001 tok/s | 5.696 tok/s |
| 128 streams + Télégraphe | 5.333 tok/s | 5.616 tok/s |

Récord de velocidad reportado: 1.279 tokens/s de decodificación en RTX 5090, 1 stream, greedy, con Télégraphe (K=5) en matemáticas; 1.060-1.120 en código, RAG, multilingüe y razonamiento.

## Requisitos de hardware

- VRAM para inferencia: el checkpoint pesa 7,1 GB en INT8; con activaciones en bf16 y caché KV se recomienda al menos 10-12 GB de VRAM para contexto moderado, y más para contexto de 32-64k.
- GPU recomendadas: RTX 5090 (usada en los benchmarks del autor), A100, H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 4090, RTX 5090, RTX 4080, entre otras); el modelo base bf16 de 13,6 GB requiere más margen.
- Opciones de despliegue: vLLM es la librería declarada y el formato `MIXED_PRECISION` de ModelOpt requiere la rama específica documentada por el autor; no se menciona soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 481 tok/s en 1 stream y 5.696 tok/s en 128 streams en RTX 5090 sin Télégraphe; con Télégraphe, hasta 728 tok/s en 1 stream y 1.279 tok/s en el récord de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Olala v1.0 mini 7A1B Opinel N°8 (este) | ~6,77 mil millones | hasta 64k (probado) | Apache 2.0 | safetensors INT8 (ModelOpt) | Cuantizado y editado; sin bucles; menos rechazos indebidos |
| OVHaiLLM/Olala-v1.0-mini-7A1B (base) | ~6,77 mil millones | hasta 64k (probado) | Apache 2.0 | safetensors bf16 | Referencia de calidad; 13,6 GB; propenso a bucles y rechazos excesivos |
| Olala v1.0 mini 7A1B Opinel N°4 | no disponible | no disponible | Apache 2.0 | no disponible | Variante más pequeña del mismo autor |
| Otros modelos de ~7B con licencia Apache 2.0 | varía | varía | Apache 2.0 | varía | No se dispone de comparación directa en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés y francés; no hay evidencia de capacidades en castellano ni en otros idiomas.
- El modo de razonamiento desactivado degrada la calidad en algunas tareas: GSM8K baja 3,3 puntos y HumanEval+ sin razonamiento cae 4,5 ± 1,5 puntos frente al bf16.
- Con esfuerzo medio, HumanEval+/MBPP+ pierde 2,3 ± 1,0 puntos y MBPP+ hasta 3,1 ± 1,2; con esfuerzo alto, MMLU baja 2,3 ± 1,4 puntos.
- La reducción de rechazos, aunque mantiene la tasa de rechazo de peticiones dañinas por encima del 83-97 %, implica un cambio deliberado en el comportamiento de seguridad; conviene validar la política de seguridad en el dominio de despliegue.
- El formato `MIXED_PRECISION` de ModelOpt requiere una rama específica de vLLM (`nbald/vllm`, rama `opinel`); no es un checkpoint estándar plug-and-play en todas las versiones de vLLM.
- El modelo usa `custom_code`, lo que exige confiar en el código remoto del repositorio al cargarlo.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de veracidad en la información disponible.
- Los benchmarks de calidad se realizaron con 300 preguntas (GSM8K), 561 (MMLU) y 3 semillas (código), por lo que las diferencias pequeñas están dentro del margen de error.
- Las cifras de rendimiento se midieron únicamente en RTX 5090; el throughput en otras GPU puede diferir.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y las ediciones deben atribuirse conforme a los términos de la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maurienne-ai/Olala-v1.0-mini-7A1B-Opinel-N8
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Variante Opinel N°4: https://huggingface.co/maurienne-ai/Olala-v1.0-mini-7A1B-Opinel-N4
- Componente Télégraphe: https://huggingface.co/maurienne-ai/Olala-v1.0-mini-7A1B-Telegraphe
- Documentación de cuantización en vLLM (rama del autor): https://github.com/nbald/vllm/blob/opinel/docs/features/quantization/olala.md
- Exportador de cuantización: `tools/olala/build_q8.py` en la rama `opinel` del repositorio anterior
- Paper referenciado: arXiv:2604.09557
