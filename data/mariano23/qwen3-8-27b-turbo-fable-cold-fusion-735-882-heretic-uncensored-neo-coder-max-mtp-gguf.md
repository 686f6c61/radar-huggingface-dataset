# Mariano23/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Este repositorio distribuye cuantizaciones GGUF de un modelo de 27B basado en la arquitectura Qwen3.8, afinado para instrucciones y razonamiento, con un ajuste "uncensored/abliterated" y, en las variantes `-MTP-`, una cabeza de predicción multi-token (Multi-Token Prediction). El modelo incorpora además soporte de visión mediante proyectores multimodales `mmproj`. No es un modelo original: es una redistribución byte a byte de los pesos publicados por DavidAU (`DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`), empaquetados en formato GGUF para el ecosistema llama.cpp.

El interés práctico del repositorio es la disponibilidad de 20 cuantizaciones (de 11,67 GB a 30,24 GB) más tres proyectores de visión, lo que permite desplegar un modelo de ~27B con contexto nativo declarado de 262.144 tokens en hardware muy diverso, desde equipos con 16 GB de VRAM/RAM hasta servidores con GPU de 80 GB. Las variantes MTP incluyen una cabeza de predicción multi-token que acelera la generación en motores que la soportan.

El modelo se orienta a generación de código, escritura creativa, roleplay y razonamiento con modo "thinking" configurable en tres niveles (`xhigh`, `medium`, `low`). La licencia declarada es Apache-2.0 y soporta 16 idiomas, incluido el español. Es relevante ahora porque combina contexto muy largo, multimodalidad y cuantizaciones agresivas en un único paquete GGUF, algo poco habitual en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.8), con cabeza MTP opcional en variantes `-MTP-`; proyector multimodal para visión |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens (nativo declarado) |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y equivalentes MTP, más variantes `LOW-MTP`) |
| Idiomas soportados | en, it, zh, es, fr, de, ja, ko, ru, pt, ar, hi, id, pl, th, vi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyectores de visión en F16, BF16 y F32 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de identificarla como Qwen3.8 de 27B. Se trata de un transformer decoder-only con plantilla de chat Qwen (`<|im_start|>` / `<|im_end|>`) y un mecanismo de "reasoning effort" con tres niveles. Las variantes `-MTP-` añaden una cabeza de predicción multi-token, una técnica de decodificación especulativa que permite proponer varios tokens por paso y acelerar la generación en motores compatibles; según la model card, los pesos son idénticos salvo por esa cabeza, por lo que un runtime sin soporte MTP debe usar los ficheros sin sufijo.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o abliteration aplicada (aunque las etiquetas `abliterated` y `uncensored` indican que se eliminaron o atenuaron mecanismos de rechazo). Tampoco se documenta el proceso de ajuste del modelo base de DavidAU ni del Qwen3.8 original. El repositorio es exclusivamente de cuantización: no se modificaron los pesos, solo se convirtieron a GGUF y se verificaron con hashes SHA-256 (`SHA256SUMS.txt`).

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (`xhigh` por defecto, `medium`, `low`).
- Generación de código (etiqueta `coder`, nombre `NEO-CODER MAX`), incluyendo tareas de programación y posible uso en pipelines.
- Escritura creativa y roleplay (etiquetas `creative-writing`, `roleplay`).
- Visión: soporte image-text-to-text mediante proyectores `mmproj` (F16, BF16, F32).
- Multilingüe en 16 idiomas, incluido español, chino, árabe, hindi y tailandés.
- Ajuste "uncensored/abliterated": menor tendencia a rechazar peticiones, orientado a contenido sin filtros.
- Predicción multi-token (MTP) en las variantes correspondientes para acelerar la inferencia.
- No se documenta explícitamente soporte de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Generación de código en producción: el modelo está etiquetado como `coder` y puede integrarse en asistentes de programación o revisión de código; las cuantizaciones Q4_K_M (18,05 GB) permiten ejecutarlo en una sola GPU de 24 GB.
- Escritura creativa y narrativa larga: con 262.144 tokens de contexto nativo puede mantener coherencia en novelas, guiones o documentación extensa sin truncar.
- Roleplay y personajes conversacionales: el ajuste uncensored y la ventana de contexto amplia permiten sesiones multi-turno con memoria extensa.
- Análisis de documentos e imágenes: usando `mmproj` se pueden procesar capturas, diagramas o páginas escaneadas junto con texto en una misma conversación.
- Razonamiento con presupuesto controlado: el modo `low` reduce latencia para tareas simples y `xhigh` se reserva para problemas complejos, permitiendo ajustar coste por consulta.
- Despliegue local en estaciones de trabajo: las variantes IQ2_M (11,67 GB) e IQ3_M (14,08 GB) caben en equipos de 16 GB, útiles para prototipado sin GPU de datacenter.
- Procesamiento multilingüe: atención al cliente o traducción en los 16 idiomas soportados, incluido español.
- Investigación sobre modelos sin censura: útil para estudiar comportamientos de modelos abliterated en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: IQ2_M ~11,67 GB; IQ3_M ~14,08 GB; IQ4_XS ~16,58 GB; Q4_K_M ~18,05 GB; Q5_K_M ~20,73 GB; Q6_K ~23,58 GB; Q8_0 ~29,79 GB (las variantes MTP añaden ~0,4-0,5 GB).
- Visión: sumar ~0,93 GB (mmproj F16/BF16) o ~1,84 GB (F32).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; A100 40/80 GB o H100 para Q6_K/Q8_0 y contextos largos; RTX 3090/4080 (24/16 GB) para cuantizaciones bajas.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M y en GPUs de 16 GB con IQ2_M/IQ3_M, a costa de calidad.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, kobold.cpp, Ollama (mediante Modelfile) y llama-cpp-python.
- Contexto: la model card recomienda `-c 32768` en los ejemplos; usar los 262.144 tokens completos requiere mucha más memoria KV y no está cuantificado en los ejemplos.
- Latencia y throughput: no disponibles; las variantes MTP deberían mejorar la velocidad de generación en motores compatibles, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Fable Cold Fusion) | ~26,9B | 262.144 | Apache-2.0 | GGUF | Uncensored, visión, MTP opcional |
| Qwen3 32B (referencia de la familia) | ~32B | 128K (según versión) | Apache-2.0 | safetensors/GGUF | Modelo oficial, sin ajuste uncensored |
| Gemma 3 27B | ~27B | 128K | Gemma license | safetensors/GGUF | Multimodal, licencia no Apache |
| Mistral Small 3 24B | ~24B | 32K-128K | Apache-2.0 | safetensors/GGUF | Sin visión en todas las variantes |

Los datos de la comparativa para los modelos alternativos son orientativos y no provienen de la información proporcionada; no se dispone de benchmarks comparativos verificados en este repositorio.

## Limitaciones y advertencias

- El ajuste "uncensored/abliterated" elimina o atenúa los rechazos de seguridad: no es adecuado para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados que permitan estimarlo.
- La model card no documenta sesgos conocidos ni evaluación de seguridad.
- El contexto nativo de 262.144 tokens es declarado, pero los ejemplos de despliegue usan 32.768; contextos mayores exigen mucha memoria y pueden degradar la calidad.
- Es una redistribución de terceros: el mantenimiento, los pesos y la responsabilidad del ajuste corresponden a DavidAU y a los autores del Qwen3.8 base, no al uploader.
- El repositorio ocupa 389 GB; descargar cuantizaciones individuales requiere verificar los hashes SHA-256.
- La licencia Apache-2.0 se declara sobre los pesos, pero el uso comercial debe revisarse también respecto a las condiciones del modelo base original.
- No se documenta soporte de tool calling ni de agentes; no asumir su disponibilidad sin probarlo.
- La fecha de creación del repositorio (2026-11-21) y la denominación "Qwen3.8" no permiten verificar la procedencia exacta del modelo base con la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mariano23/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base declarado: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
