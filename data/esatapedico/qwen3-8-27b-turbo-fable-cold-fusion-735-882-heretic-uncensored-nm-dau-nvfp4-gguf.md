# esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-GGUF

## Resumen

Este repositorio contiene una familia de ocho ficheros GGUF cuantizados a partir del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un ajuste fino de 27.320.698.112 parámetros sobre una base Qwen3.8-27B. El trabajo de conversión y escalado de precisión lo firma el usuario `esatapedico`, mientras que el modelo original y su entrenamiento corresponden a DavidAU. El interés técnico inmediato está en que combina cuantización NVFP4 (W4A16 con escalas FP8, grupo de 16, solo pesos) con un cabezal MTP de decodificación especulativa embebido en cada fichero, lo que permite acelerar la generación sin necesidad de un drafter separado.

La arquitectura de partida es un transformer denso híbrido: Gated DeltaNet combinado con Gated Attention cada cuarta capa, contexto nativo de 262.144 tokens, torre de visión nativa y cabezal MTP de predicción multi-token. El autor describe el modelo como un tune TURBO 735/882 con capas de mezcla Heretic y DPO, orientado a generación conversacional sin restricciones de contenido. La licencia declarada es Apache 2.0.

La relevancia práctica reside en la escalera de precisión: siete de los ocho ficheros comparten un backbone NVFP4 nativo de 448 tensores byte a byte idéntico, diferenciándose únicamente en la precisión de `lm_head`, `token_embd` y el cabezal MTP. Eso permite elegir entre 15,15 GB y 21,28 GB según la VRAM disponible, manteniendo el mismo cómputo de capas lineales. El objetivo declarado es hardware Blackwell (sm_120).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet + Gated Attention cada cuarta capa, con torre de visión nativa y cabezal MTP |
| Parámetros totales | 27.320.698.112 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | NVFP4 (W4A16, escalas FP8, grupo 16, solo pesos) en capas lineales; Q2_K, Q3_K, Q4_K, Q5_0, Q6_K, Q8_0, IQ4_XS y BF16 en cabezales según tier |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (8 tiers, 1.122 tensores, `block_count` 65, `nextn_predict_layers` 1); repo hermano con safetensors comprimidos NVFP4 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros que alterna capas de Gated DeltaNet (atención lineal con estado recurrente) con capas de Gated Attention cada cuarta capa, un patrón híbrido que reduce el coste de atención en contextos largos manteniendo capacidad de recuperación exacta. Incluye una torre de visión nativa, por lo que acepta entradas multimodales, y un cabezal MTP (multi-token prediction) de una capa (`nextn_predict_layers` 1) que actúa como drafter interno para decodificación especulativa.

El ajuste TURBO 735/882 de DavidAU combina, según la model card, técnicas de Fable y Cold Fusion junto con capas de mezcla Heretic y DPO orientadas a eliminar restricciones de contenido. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO más allá de la mención a capas DPO. La innovación técnica destacable del repositorio es la cuantización NVFP4 nativa con escalas FP8 por grupo de 16, manteniendo en BF16 en origen la torre de visión, la ruta de atención lineal, `lm_head`, embeddings y cabezal MTP, y la preservación del cabezal MTP en todos los ficheros para habilitar `--spec-type draft-mtp` en llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento y matemáticas, heredados del modelo base Qwen3.8-27B (sin métricas publicadas en la información disponible).
- Generación de código, sujeta a la calidad del tune subyacente; no se documentan evaluaciones específicas.
- Procesamiento de visión mediante la torre nativa, emparejada con el proyector de visión original de Qwen3.8.
- Decodificación especulativa integrada mediante cabezal MTP embebido, sin drafter externo.
- Capacidades multilingües declaradas (`en`, `multilingual`), sin desglose por idioma.
- Modo conversacional (`conversational`) y compatibilidad con endpoints.
- Comportamiento "uncensored" por el tune Heretic/DPO: menor rechazo a peticiones que los modelos alineados estándar.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Despliegue en una sola GPU de 16 GB: los tiers `LOW` (15,75 GB) y `VERY-LOW` (15,15 GB) caben en tarjetas consumer de 16 GB, permitiendo servir un modelo de 27B con contexto largo en hardware de gama alta doméstica.
- Inferencia acelerada en Blackwell: los ficheros NVFP4 con MTP embebido están pensados para sm_120, de modo que un RTX 50-series puede ejecutar decodificación especulativa nativa y aprovechar los núcleos FP4.
- Asistentes conversacionales de contexto largo: con 262.144 tokens se pueden mantener conversaciones con documentación extensa adjunta sin truncar, usando el tier `MID-HIGH` (16,91 GB) para el mejor equilibrio precisión/velocidad en split de doble GPU.
- Procesamiento de documentos con imagen: la torre de visión nativa permite tareas de extracción y descripción sobre capturas, escaneos o diagramas, siempre que se empareje con el proyector de visión original de Qwen3.8.
- Investigación sobre cuantización: la escalera de ocho tiers con backbone idéntico permite medir el impacto aislado de la precisión de `lm_head`, embeddings y cabezal MTP sobre la perplejidad y la tasa de aceptación especulativa.
- Generación creativa sin filtros: el tune Heretic/Uncensored está orientado a escritura de ficción y contenido que los modelos alineados rechazan; requiere revisión humana por las implicaciones legales y de seguridad.
- Evaluación comparativa de decodificación especulativa: al incorporar el cabezal MTP en todos los ficheros, sirve para medir la ganancia de throughput de `draft-mtp` frente a generación autoregresiva estándar en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada por tier (según la model card, sin contar KV cache): `VERY-LOW` 15,15 GB, `COMPACT-LOW` 15,16 GB, `LOW` 15,75 GB, `MEDIUM` 16,60 GB, `MID-HIGH` 16,91 GB, `HIGH` 17,83 GB, `VERY-HIGH` 19,33 GB (≈18 GiB más KV), `HIGHEST` 21,28 GB (≈19,82 GiB más KV).
- GPU recomendadas: Blackwell sm_120 para aprovechar NVFP4 nativo; RTX 5090 o GPUs de 24 GB para los tiers altos; A100/H100 solo si se dispone de soporte de kernels NVFP4 en el runtime elegido.
- Cabe en consumer GPU: sí, los tiers `LOW`, `VERY-LOW` y `COMPACT-LOW` en tarjetas de 16 GB; `MID-HIGH` y `HIGH` en 24 GB; `VERY-HIGH` y `HIGHEST` requieren split de doble GPU o 24 GB con margen para KV.
- Los tiers `BUDGET` (14,72 GB) y `STARVED` (14,59 GB) del repo hermano, sin MTP, caben en 16 GB con más holgura.
- Opciones de despliegue: llama.cpp (soporte de `--spec-type draft-mtp`), Ollama y cualquier runtime compatible con GGUF; el repo safetensors NVFP4 requiere vLLM o TGI con soporte de compressed-tensors NVFP4.
- Latencia y throughput: no disponibles. La model card anticipa que `MID-HIGH` ofrece la decodificación compacta más rápida en split de doble GPU, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Fable Cold Fusion Heretic, GGUF NVFP4) | 27,32B | 262.144 | NVFP4 + Q2_K a BF16 por tier | Apache 2.0 | GGUF, 8 tiers, 138,9 GB de repo |
| Modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27,32B | 262.144 | safetensors NVFP4 | Apache 2.0 (según este repo) | safetensors |
| Qwen3.8-27B original | 27B (aproximado, no confirmado) | 262.144 (según la model card) | BF16 y cuantizaciones estándar | no disponible en la información | no disponible en la información |
| Variantes BUDGET/STARVED del mismo autor | 27,32B | 262.144 | NVFP4 + Q3_K/Q2_K, sin MTP | Apache 2.0 | GGUF, 14,59-14,72 GB |

No se dispone de datos de benchmarks que permitan comparar rendimiento real frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo "uncensored" afinado con capas Heretic/DPO: puede producir contenido que otros modelos rechazan; requiere moderación externa y revisión humana en producción.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la tasa de error factual.
- La cuantización NVFP4 en capas lineales introduce pérdida de precisión respecto al original; los tiers bajos degradan además `lm_head` y embeddings a Q2_K/Q3_K, lo que afecta a la calidad de muestreo del vocabulario.
- El soporte NVFP4 depende de kernels específicos (Blackwell sm_120); en GPUs anteriores el rendimiento puede degradarse o requerir fallback.
- Los tiers `VERY-HIGH` y `HIGHEST` exigen unos 18-20 GiB de VRAM más KV cache; en tarjetas de 16 GB se produce offload a CPU y caída de throughput.
- El cabezal MTP consume VRAM adicional y su tasa de aceptación no está documentada; los tiers BUDGET/STARVED lo eliminan para ahorrar memoria.
- Idiomas: solo se declaran `en` y `multilingual` sin desglose; el rendimiento en castellano no está verificado.
- Licencia Apache 2.0 declarada, pero la cadena de modelos base y los términos del tune original deberían verificarse antes de uso comercial.
- Repositorio de 138,9 GB: la descarga completa es costosa; conviene bajar solo el tier necesario.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-GGUF
- Repositorio safetensors NVFP4: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4
- Repositorio BUDGET GGUF: https://huggingface.co/esatapedico/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4-BUDGET-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Sitio del autor de la conversión: https://www.esatapedico.com
