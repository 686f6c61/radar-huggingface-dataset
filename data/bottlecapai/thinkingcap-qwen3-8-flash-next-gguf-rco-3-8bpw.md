# bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF-RCO-3.8bpw

## Resumen

ThinkingCap-Qwen3.8-Flash-Next es un modelo multimodal de tipo imagen-texto desarrollado por BottleCap AI, construido sobre la arquitectura Qwen3.8-Flash-Next. Con 179.551.050.368 parámetros totales (179,6B), combina atención clásica con capas Gated DeltaNet y una arquitectura MoE con expertos enrutados, además de una tabla de embeddings n-gram de 51,2B parámetros que actúa como lookup. El modelo está diseñado para razonamiento eficiente en tokens ("efficient-thinking") y soporta entrada de imágenes mediante un proyector multimodal.

La ficha que nos ocupa es la cuantización GGUF RCO de 3,8 bits por peso publicada por el mismo autor, que reduce los pesos a 85,6 GB en disco y 56,5 GB de VRAM para el modelo de lenguaje, manteniendo 29,1 GB de tablas de embeddings en RAM del sistema a través de memory-mapping. Según la model card, esta cuantización igualó a la cuantización estándar `IQ4_XS` y a los pesos BF16 en los dos benchmarks evaluados (AIME 2026 y RealWorldQA), lo que la hace relevante para despliegues en una sola GPU de 96 GB con contexto completo de 262.144 tokens.

El interés actual reside en su eficiencia: permite servir un modelo de 179,6B parámetros con contexto largo, visión y decodificación especulativa MTP en hardware de una sola tarjeta profesional, algo poco habitual en esta escala. La licencia es la Qwen Community License 1.0, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención, Gated DeltaNet y MoE (expertos enrutados); cabeza MTP; proyector visual |
| Parámetros totales | 179.551.050.368 (179,6B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración de referencia) |
| Tipos de cuantización | GGUF mixta RCO a 3,82 bits/peso (expertos Q2_0 a IQ4_NL, tabla n-gram IQ4_NL, atención 8,01 bpw, lm_head Q6_K, token embedding IQ4_XS); existe también `IQ4_XS` en el repo GGUF estándar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | GGUF (dos particiones: modelo + cabeza MTP, y tabla de embeddings n-gram) + mmproj f16 separado |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido que combina capas de atención con capas Gated DeltaNet y una mezcla de expertos (MoE) con expertos enrutados que concentran 120,8B parámetros. Incluye además una cabeza de predicción multi-token (MTP) de 2,6B parámetros que permite decodificación especulativa sin modelo borrador separado, y una tabla de embeddings n-gram (`per_layer_token_embd`) de 51,2B parámetros que funciona como lookup y que llama.cpp mantiene en RAM del sistema. La parte visual se sirve mediante un proyector multimodal f16 de 907,5 MB.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card de esta cuantización se centra en el proceso de cuantización: la asignación de tipos por tensor proviene de la búsqueda RCO de ISTA-DASLab sobre los pesos base Qwen3.8-Flash-Next bajo un presupuesto de tamaño de fichero, aplicada aquí a los pesos de ThinkingCap con tres diferencias (router en F32, cabeza MTP tipada como en el `IQ4_XS` del autor y tabla n-gram en IQ4_NL). El redondeo usa el cuantizador propio de llama.cpp con la importance matrix de `unsloth/Qwen3.8-Flash-Next-GGUF`; no se emplea el redondeo GSQ de los ficheros de ISTA.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable mediante plantilla de chat (esfuerzo por defecto `xhigh`).
- Entrada de imágenes (pipeline image-text-to-text) mediante el proyector `mmproj-ThinkingCap-Qwen3.8-Flash-Next-f16.gguf`.
- Decodificación especulativa con cabeza MTP integrada (`--spec-type draft-mtp`, hasta 3 tokens borrador).
- Razonamiento eficiente en tokens ("token-efficient", "efficient-thinking") según los tags del autor.
- Conversación multi-turno con contexto de hasta 262.144 tokens por slot.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Análisis de documentos largos con imágenes: con 262.144 tokens de contexto por slot, el modelo puede procesar informes extensos, contratos o expedientes que combinen texto e imágenes en una sola pasada, sin fragmentación.
- Asistencia técnica con capturas de pantalla: gracias a la entrada de imágenes vía mmproj, puede interpretar diagramas de error, interfaces de usuario o fotografías de equipos y responder con contexto conversacional.
- Razonamiento matemático y de competición: la model card reporta evaluación en AIME 2026, lo que lo sitúa como candidato para resolución de problemas matemáticos con cadena de pensamiento larga.
- Comprensión visual del mundo real: evaluado en RealWorldQA, es adecuado para tareas de pregunta-respuesta sobre escenas cotidianas, útiles en accesibilidad o inspección visual asistida.
- Despliegue en una sola GPU profesional: con 56,5 GB de VRAM para los pesos y 62,5 GB con contexto completo y caché KV q8_0 en una RTX PRO 6000 Blackwell de 96 GB, permite servir el modelo en infraestructura de una tarjeta sin clúster.
- Servicio multi-slot con caché compartida: con `-np 4 --no-kv-unified` y caché q8_0 cabe en 80,6 GB, habilitando varios usuarios concurrentes con contexto completo cada uno.
- Aceleración de inferencia con MTP: la cabeza de predicción multi-token integrada reduce la latencia en generación autoregresiva sin necesidad de desplegar un modelo borrador adicional.

## Benchmarks y rendimiento

La model card indica que la cuantización RCO 3,8bpw igualó a `IQ4_XS` y a los pesos BF16 en AIME 2026 y RealWorldQA, pero no se incluyen los valores numéricos de dichos benchmarks en la información proporcionada.

| Benchmark | RCO 3,8bpw | IQ4_XS | BF16 |
|---|---|---|---|
| AIME 2026 | iguala (sin cifra) | referencia | referencia |
| RealWorldQA | iguala (sin cifra) | referencia | referencia |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para pesos del modelo de lenguaje: 56,5 GB (los 29,1 GB de tablas de embeddings se mantienen en RAM del sistema vía memory-mapping).
- VRAM total medida con llama-server en una RTX PRO 6000 Blackwell (97.887 MiB):
  - Contexto 32.768, 1 slot, KV q8_0, MTP y visión activos: 57.101 MiB.
  - Contexto 131.072, 1 slot, KV q8_0: 59.383 MiB.
  - Contexto 262.144, 1 slot, KV q8_0: 62.487 MiB.
  - Contexto 262.144, 1 slot, KV f16 (por defecto), MTP y visión: 65.541 MiB.
  - Contexto 262.144, 2 slots con `--no-kv-unified -c 524288`, KV f16: 74.765 MiB.
  - Contexto 262.144, 4 slots con `--no-kv-unified -c 1048576`, KV q8_0: 80.645 MiB.
- GPU recomendadas: H200 y RTX PRO 6000 Blackwell (probadas por el autor); cualquier GPU con al menos 66 GB de VRAM para un slot a contexto completo con KV f16.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 5090 de 32 GB) por el tamaño de los pesos (56,5 GB).
- Despliegue: llama.cpp (commit `4e910a8` probado), llama-server; LM Studio y aplicaciones similares detectan el `mmproj-*.gguf` automáticamente. vLLM se menciona como referencia para los pesos BF16, no para este GGUF.
- Crecimiento de la caché KV: aproximadamente 23 MiB por cada 1.000 tokens con cuantización q8_0.
- Latencia y throughput: no disponible en la información proporcionada.
- Ajustes de muestreo recomendados: temperature 1.0, top_p 0.95, top_k 20, min_p 0.0; la decodificación greedy puede entrar en bucle.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next RCO 3,8bpw | 179,6B | 262.144 | GGUF mixta 3,82 bpw | 56,5 GB | qwen-community-license-1.0 | Hugging Face (bottlecapai) |
| ThinkingCap-Qwen3.8-Flash-Next IQ4_XS | 179,6B | 262.144 | GGUF IQ4_XS | 66,1 GB (9,6 GB más) | qwen-community-license-1.0 | Hugging Face (bottlecapai) |
| Qwen3.8-Flash-Next GSQ-RCO IQ3_S (ISTA-DASLab) | no disponible | no disponible | GGUF IQ3_S con redondeo GSQ | no disponible | no disponible | Hugging Face (ISTA-DASLab) |
| Qwen3.8-Flash-Next GGUF (unsloth) | no disponible | no disponible | GGUF estándar | no disponible | no disponible | Hugging Face (unsloth) |

Los tres modelos comparados comparten la base Qwen3.8-Flash-Next; las diferencias principales son el esquema de cuantización, el redondeo y el presupuesto de tamaño. No se dispone de datos de rendimiento numérico para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La licencia qwen-community-license-1.0 impone restricciones al uso comercial; es necesario revisar sus términos antes de desplegar en producción.
- La decodificación greedy puede entrar en bucle; deben usarse los ajustes de muestreo recomendados (temperature 1.0, top_p 0.95, top_k 20).
- Los runtimes sin soporte MTP para esta arquitectura pueden rechazar la carga del fichero con error `missing tensor`; es necesario actualizar llama.cpp.
- En los GGUF estándar del modelo, varias peticiones de imagen simultáneas servidas desde slots que comparten una única caché KV perdieron precisión; se recomienda `-np N --no-kv-unified` para peticiones visuales en paralelo.
- El modelo requiere 29,1 GB de RAM del sistema adicionales para las tablas de embeddings, además de la VRAM.
- No hay información publicada sobre sesgos, idiomas soportados ni tasas de alucinación.
- La cuantización agresiva de los expertos enrutados (hasta Q2_0 en algunas capas) puede degradar tareas no cubiertas por los benchmarks reportados; la equivalencia solo se verificó en AIME 2026 y RealWorldQA.
- El modelo base es una variante modificada por BottleCap AI sobre Qwen3.8-Flash-Next; el comportamiento puede diferir del modelo Qwen original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF-RCO-3.8bpw
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- GGUF estándar del autor: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF
- README del GGUF estándar: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF/blob/main/README.md
- Cuantización GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Repositorio RCO: https://github.com/IST-DASLab/RCO
- GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- llama.cpp (commit probado): https://github.com/ggml-org/llama.cpp/commit/4e910a86e
- Sitio del autor: https://www.bottlecapai.com/
