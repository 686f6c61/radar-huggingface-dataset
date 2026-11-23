# kingjones777/Qwen3.6-27B-CoupledWelfare-Curiosity-SuperRoc-GGUF

## Resumen

Qwen3.6-27B-CoupledWelfare-Curiosity-SuperRoc-GGUF es una cuantización GGUF en formato ROCm-FP4 del modelo Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity, publicada por el usuario kingjones777. El modelo base pertenece a la familia Qwen3.6, con 26.895.998.464 parámetros (~26,9 mil millones) según los pesos en safetensors del repositorio original, y está empaquetado aquí como un único fichero GGUF de 15.056.229.888 bytes (~15,1 GB) orientado a inferencia local.

La particularidad de esta ficha es su enfoque de despliegue: el autor la distribuye específicamente para Super Roc, un motor de inferencia local para Strix Halo (AMD Ryzen AI Max+ 395, arquitectura gráfica gfx1151), con soporte de formatos ROCm-FP4 derivados del trabajo de ROCmFPX sobre llama.cpp/ggml. El modelo se presenta como "conversational" y compatible con endpoints, e incluye instrucciones para servirlo con Super Roc o consumirlo desde Lemonade.

Es relevante ahora porque ejemplifica una tendencia concreta: la cuantización especializada por hardware para aceleradores integrados de memoria unificada, donde un modelo de ~27B puede ejecutarse con contexto de 131.072 tokens en una máquina de 128 GB sin GPU discreta. La licencia declarada es Apache 2.0, aunque el autor no documenta el proceso de entrenamiento ni los datos del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.6; detalles no disponibles) |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (contexto cargado en la medición del autor) |
| Tipos de cuantización | GGUF Q4_0 con formato ROCm-FP4 (fichero `Q4_0-ROCmFP4-FAST-imatrix.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único de ~15,1 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.6 y su naturaleza de transformer para generación de texto. El autor de esta cuantización no documenta número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. Tampoco se detalla el proceso de ajuste que dio lugar a la variante "CoupledWelfare-Curiosity" del modelo base.

La innovación técnica documentada se sitúa en el plano del empaquetado y la inferencia: el fichero emplea cuantización Q4_0 con formato ROCm-FP4, generado con una imatrix, y está optimizado para el motor Super Roc sobre Strix Halo. El autor reporta una perplejidad en wikitext-2 de 6,47, frente a 6,40 del Q4_K_M estándar del mismo modelo, lo que sitúa la pérdida de calidad de esta cuantización en un margen pequeño (0,07 puntos). El motor soporta modo "thinking" desactivable por defecto y activable por petición mediante `chat_template_kwargs.enable_thinking`.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Modo de razonamiento ("thinking") activable por petición mediante `chat_template_kwargs.enable_thinking`; desactivado por defecto en el comando de ejemplo.
- Soporte de tool calling / function calling: el autor reporta 7/8 aciertos tanto en modo "required" como en modo "auto".
- Soporte de contexto largo: el comando de ejemplo carga 131.072 tokens de contexto.
- Caché de prompt: en la segunda vuelta de una conversación se reutilizaron 6.961 de 6.985 tokens del prompt.
- Servido compatible con endpoints HTTP (`endpoints_compatible`), lo que permite integrarlo como API local.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en estación de trabajo Strix Halo: el modelo se sirve con Super Roc en `127.0.0.1:8080` y ofrece una API compatible con endpoints, adecuada para prototipos de chat privados sin salida a la nube.
- Procesamiento de documentos largos: con 131.072 tokens de contexto cargados, permite resumir o consultar contratos, informes o bases de código extensas en una sola pasada.
- Automatización con tool calling: los 7/8 aciertos reportados en modos "required" y "auto" lo hacen utilizable en flujos donde el modelo debe invocar funciones externas (consultas a bases de datos, APIs internas) con supervisión.
- Generación de código asistida en local: el autor mide 13,8 tok/s en generación de código (media de dos prompts), suficiente para autocompletado interactivo en un entorno de desarrollo sin GPU discreta.
- Chat multi-turno con caché de prompt: la reutilización de 6.961 de 6.985 tokens en la segunda vuelta reduce el coste de prompts largos en conversaciones encadenadas.
- Despliegue vía Lemonade: el modelo se integra en el gestor Lemonade con `lemonade pull` y `lemonade chat`, útil para equipos que ya estandarizan su tooling en ese ecosistema.
- Evaluación de cuantizaciones ROCm-FP4: sirve como referencia práctica para medir el impacto de Q4_0-ROCmFP4 frente a Q4_K_M (perplejidad 6,47 frente a 6,40) en hardware AMD integrado.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos de rendimiento disponibles son mediciones de inferencia y una métrica de calidad:

| Métrica | Valor |
|---|---|
| Perplejidad wikitext-2 (esta cuantización) | 6,47 |
| Perplejidad wikitext-2 (Q4_K_M del mismo modelo) | 6,40 |
| Tiempo de carga | 5 s |
| Prompt tok/s (p1k) | 534,5 |
| Prompt tok/s (p8k) | 516,5 |
| Generación tok/s (p1k) | 16,11 |
| Generación tok/s (p8k) | 49,06 |
| Generación de código tok/s | 13,8 (media de 2 prompts) |
| Tool calls (required / auto) | 7/8 / 7/8 |
| Caché de prompt, turno 2 (cacheado / prompt) | 6.961 / 6.985 tokens |
| Contexto cargado | 131.072 tokens |
| Drafter (decodificación especulativa) | desactivado |

Mediciones realizadas en un Ryzen AI Max+ 395 con 128 GB, Super Roc 0.20.0 (release candidate), una petición a la vez, el 23 de noviembre de 2026.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero GGUF ocupa ~15,1 GB; con contexto de 131.072 tokens y caché KV, el consumo total supera ampliamente los 15 GB. El autor lo ejecuta en una máquina con 128 GB de memoria unificada.
- Hardware de referencia: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB. El formato ROCm-FP4 está pensado para esta arquitectura gráfica.
- GPU discretas: no se documenta compatibilidad con A100, H100 ni RTX 4090; el motor Super Roc está orientado a Strix Halo. Para GPUs NVIDIA sería necesario reconvertir o usar otro runtime GGUF.
- GPU de consumo: no hay datos sobre ejecución en tarjetas consumer; el enfoque es memoria unificada, no VRAM discreta.
- Opciones de despliegue: Super Roc (`superroc serve ...`), Lemonade (`lemonade pull` / `lemonade chat`) y, por herencia del ecosistema GGUF, potencialmente llama.cpp/ggml, aunque el formato ROCm-FP4 requiere soporte específico.
- Latencia y throughput: prompt a 534,5 tok/s (p1k) y 516,5 tok/s (p8k); generación a 16,11 tok/s (p1k) y 49,06 tok/s (p8k); código a 13,8 tok/s. Carga en 5 s. Una petición simultánea en las mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SuperRoc-GGUF) | ~26,9 B | 131.072 tokens | Q4_0-ROCmFP4 GGUF | Apache 2.0 | Hugging Face, optimizado para Strix Halo |
| Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity | ~26,9 B | no disponible | safetensors (base) | Apache 2.0 (según este repo) | Hugging Face |
| Q4_K_M estándar del mismo modelo | ~26,9 B | no disponible | GGUF Q4_K_M | Apache 2.0 | Referenciado por el autor (perplejidad 6,40) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con otras familias de modelos de tamaño similar; la comparación disponible se limita a variantes de cuantización del mismo modelo base.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base ni sobre el proceso de alineamiento de la variante "CoupledWelfare-Curiosity".
- Riesgo de alucinación no cuantificado: el autor no reporta evaluaciones de fidelidad factual.
- La cuantización Q4_0-ROCmFP4 degrada ligeramente la perplejidad frente a Q4_K_M (6,47 frente a 6,40); en tareas sensibles a precisión numérica o de código conviene validar.
- Idiomas soportados no declarados: no hay garantía documentada de calidad fuera del inglés.
- El formato ROCm-FP4 está ligado al motor Super Roc y a Strix Halo; fuera de ese hardware puede no ser directamente utilizable sin reconversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (23 de noviembre de 2026): no hay validación comunitaria independiente.
- El autor no documenta el proceso de entrenamiento ni los datos del modelo base; la licencia Apache 2.0 se declara en este repositorio, pero conviene verificar la licencia del modelo original antes de uso comercial.
- Las mediciones de rendimiento corresponden a una release candidate del motor (Super Roc 0.20.0) y a una sola petición concurrente; el throughput con carga concurrente no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen3.6-27B-CoupledWelfare-Curiosity-SuperRoc-GGUF
- Modelo base: https://huggingface.co/Bioaligned/Qwen3.6-27B-CoupledWelfare-Curiosity
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4 y trabajo sobre llama.cpp): https://github.com/charlie12345/ROCmFPX
- llama.cpp / ggml (base del motor, licencia MIT): no se proporciona URL específica en la información disponible.
