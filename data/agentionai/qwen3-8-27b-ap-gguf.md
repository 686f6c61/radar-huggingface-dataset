# agentionai/Qwen3.8-27B-AP-GGUF

## Resumen

Qwen3.8-27B-AP-GGUF es un paquete de cuantizaciones GGUF del modelo Qwen3.8-27B, publicado por agentionai bajo la etiqueta "Agention Precision". El modelo base lo desarrolla Qwen (Alibaba) y este repositorio ofrece versiones cuantizadas en formato GGUF compatibles con llama.cpp, LM Studio y Ollama sin necesidad de forks ni flags adicionales. El pipeline declarado es image-text-to-text, lo que indica que el paquete incluye el proyector de visión (`mmproj-BF16.gguf`) además de los pesos de lenguaje.

El modelo base tiene 27.320.697.856 parámetros (27,3 mil millones) y una licencia Apache 2.0. La propuesta de valor del repositorio no es el modelo en sí, sino la calidad de las cuantizaciones: según el autor, cada archivo utiliza asignaciones no uniformes y corrección de error de baja pérdida generadas con un encoder propio, de modo que a igual tamaño de archivo la distribución de siguiente token queda más cerca del BF16 original que las cuantizaciones públicas de referencia.

El paquete cubre ocho tamaños entre 8,95 y 16,35 GiB, pensados para tarjetas de 12, 16 y 24 GB, e incluye la cabeza de borrador MTP (multi-token prediction) para decodificación especulativa y el proyector de visión. Es relevante ahora porque permite desplegar un modelo multimodal de 27B en hardware de consumo manteniendo una fidelidad al modelo original medible y verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (solo una cuarta parte de las capas usan atención completa); cabeza MTP para decodificación especulativa |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configuración de referencia del autor); contexto nativo del modelo base no disponible |
| Tipos de cuantización | AP-Q4_K_XL, AP-Q4_K_M, AP-IQ4_XS, AP-Q3_K_XL, AP-IQ3_S, AP-IQ3_XS, AP-IQ3_XXS, AP-IQ2_S (tipos estándar GGUF con asignación no uniforme) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

Tamaños de archivo y requisitos de VRAM a 32k de contexto:

| Cuantización | Tamaño | VRAM estimada (32k) | Encaje |
|---|---:|---:|---|
| AP-Q4_K_XL | 16,35 GiB | ~18 GiB | 24 GB |
| AP-Q4_K_M | 15,33 GiB | ~17 GiB | 24 GB |
| AP-IQ4_XS | 13,27 GiB | ~15 GiB | 16 GB |
| AP-Q3_K_XL | 12,24 GiB | ~14 GiB | 16 GB con contexto largo |
| AP-IQ3_S | 11,21 GiB | ~13 GiB | 16 GB a 8–16k |
| AP-IQ3_XS | 10,70 GiB | ~12,5 GiB | 12 GB a 8–16k |
| AP-IQ3_XXS | 10,00 GiB | ~12 GiB | 12 GB a 8–16k |
| AP-IQ2_S | 8,95 GiB | ~10,9 GiB | 12 GB a 8–16k |
| mmproj-BF16 (visión) | 0,87 GiB | +0,9 GiB | cualquier nivel |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de 27,3B parámetros con atención híbrida: según el autor, solo una cuarta parte de las capas emplean atención completa, lo que reduce el coste de la caché KV (aproximadamente 1 GiB a 32k con caché q8_0). Incluye una cabeza MTP (multi-token prediction) que actúa como borrador para decodificación especulativa, y un encoder de visión separado que se distribuye en BF16 como `mmproj-BF16.gguf`.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La innovación técnica destacable de este repositorio es el proceso de cuantización: el autor afirma haber construido un encoder propio que genera asignaciones no uniformes de bits y corrección de error de baja pérdida, manteniendo los tipos GGUF estándar para que funcionen en llama.cpp sin modificaciones. El modelo tiene el modo "thinking" activado por defecto y se puede desactivar por petición mediante `chat_template_kwargs`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto, desactivable por petición.
- Comprensión de imagen y texto (pipeline image-text-to-text) mediante el proyector `mmproj-BF16.gguf`.
- Generación de código: el autor reporta pruebas de escritura de páginas web funcionales en el primer intento.
- Decodificación especulativa mediante la cabeza MTP incluida en el paquete.
- Compatibilidad con tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes multi-paso: el autor lo integra en su agente de terminal Marshall (planificador, codificador, revisor).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local: con AP-IQ4_XS (~15 GiB de VRAM) se puede ejecutar en una RTX 4090 o similar y usarlo como agente de programación con la cabeza MTP para acelerar la generación; el autor lo integra en su CLI Marshall con acciones aprobadas por el usuario.
- Análisis de documentos con imagen: el proyector de visión permite procesar capturas, diagramas o páginas escaneadas junto a texto en un mismo prompt, con 32k de contexto para documentos largos.
- Despliegue en estaciones de trabajo de 12 GB: con AP-IQ2_S (8,95 GiB) o AP-IQ3_XXS (10 GiB) cabe en tarjetas de 12 GB a contextos de 8–16k, útil para prototipos y pruebas de razonamiento sin GPU de datacenter.
- Razonamiento con trazas largas: el modo thinking por defecto y la caché KV en q8_0 permiten cadenas de razonamiento extensas; el autor advierte de que una caché de valores a 4 bits degrada en repetición, por lo que en producción conviene fijar q8_0 o f16.
- Servicio de inferencia compatible con OpenAI: la etiqueta `endpoints_compatible` y el uso con `llama-server` permiten exponer el modelo como endpoint local para aplicaciones existentes.
- Evaluación comparativa de cuantizaciones: el paquete incluye ocho niveles con métricas de fidelidad frente a BF16, útil para estudiar el compromiso tamaño-calidad en un modelo de 27B multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de cuantización frente al BF16 en texto retenido, texto web y wikitext-2:

| Comparación | Métrica reportada por el autor |
|---|---|
| AP-IQ3_S vs cuantización líder de mismo tamaño | 20% más cerca de BF16 en texto retenido; 24% más cerca en el 1% de tokens más difíciles |
| AP-IQ4_XS vs cuantización líder de mismo tamaño | 8% más cerca de BF16; 9% en el 1% de tokens más difíciles |
| AP-Q4_K_M vs cuantización líder | 5% más cerca en texto técnico no visto; 9% en el 1% más difícil |
| AP-Q3_K_XL vs cuantización líder | 19% más cerca en texto técnico no visto; 23% en el 1% más difícil |
| AP-IQ3_XS vs IQ3_S de ISTA (11,29 GiB) | Equiparable en texto técnico no visto con 0,6 GiB menos |
| AP-IQ2_S vs mejor cuantización de ~10 GiB | 22% más cerca en texto técnico no visto; 18% en wikitext-2 |
| AP-IQ2_S en prueba de código | Página funcional al primer intento en 4 de 5 ejecuciones (frente a 2 de 5 del archivo de ISTA del mismo tamaño) |

Estas cifras proceden del autor y no han sido verificadas de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: entre ~10,9 GiB (AP-IQ2_S a 32k) y ~18 GiB (AP-Q4_K_XL a 32k), incluyendo pesos, caché KV q8_0 y buffers de llama.cpp.
- GPU de 24 GB: RTX 4090, RTX 3090, A10G, L4 (con margen), A100 40/80 GB, H100.
- GPU de 16 GB: RTX 4080, RTX 4060 Ti 16 GB, V100 16 GB; usar AP-IQ4_XS o inferior.
- GPU de 12 GB: RTX 3060 12 GB, RTX 4070; usar AP-IQ3_XS o inferior a 8–16k de contexto.
- Cabe en GPU de consumo: sí, desde 12 GB con las cuantizaciones pequeñas.
- Despliegue: llama.cpp (`llama-server`), LM Studio, Ollama; el autor no menciona soporte explícito de vLLM o TGI para estos archivos GGUF.
- Latencia y throughput: no disponibles; el autor afirma que la velocidad es la misma que la de cuantizaciones de igual tamaño ("same size, same speed").

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-AP-GGUF (este) | 27,3B | 32k (config. de referencia) | GGUF + mmproj | Apache 2.0 | Cuantizaciones con encoder propio; incluye visión y MTP |
| Qwen3.8-27B (base) | 27,3B | no disponible | safetensors | Apache 2.0 | Referencia BF16; requiere ~55 GB en BF16 |
| Cuantizaciones de unsloth para Qwen3.8-27B | 27,3B | no disponible | GGUF | Apache 2.0 | Referencia de comparación citada por el autor |
| Cuantizaciones IQ3_S de ISTA | 27,3B | no disponible | GGUF | Apache 2.0 | 11,29 GiB; comparada con AP-IQ3_XS |
| Cuantización AtomicChat (~10,38 GiB) | 27,3B | no disponible | GGUF | no disponible | Referencia de comparación citada por el autor |

## Limitaciones y advertencias

- Las métricas de fidelidad y de calidad de código las publica el propio autor; no hay verificación independiente en la información disponible.
- El autor advierte de que una caché de valores a 4 bits provoca degeneración en repetición con trazas de razonamiento largas en esta familia de modelos; hay que usar q8_0 o f16.
- El modo thinking está activado por defecto: consume más tokens y aumenta la latencia si no se desactiva por petición.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de 27B en tareas factuales.
- Idiomas soportados no documentados en este repositorio; conviene consultar la model card del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su propia model card.
- El repositorio ocupa 195,7 GB; descargar solo el archivo de la cuantización deseada.
- No se documenta soporte para tool calling ni para vLLM/TGI en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentionai/Qwen3.8-27B-AP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados completos (Fieldwork Ledger): https://share.fieldworkledger.com/tTkQDHijE_Anj0yv79bsIw
- Web del autor: https://www.agention.ai/
- Agente de código Marshall: https://marshall.agention.ai
- Signal 27B (otro paquete del autor): https://huggingface.co/agentionai/Signal-3.8-27B-GGUF
