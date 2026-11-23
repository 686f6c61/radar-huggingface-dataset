# AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 es un ajuste fino del modelo Qwen/Qwen3.8-27B publicado por el usuario AEON-7. Se trata de una versión "abliterated" (eliminación de rechazos) en precisión completa BF16, pensada como maestro de referencia a partir del cual se generan otras variantes cuantizadas del mismo autor (NVFP4-MIXED, MXFP4-MXFP6-ROCm). El modelo conserva sin modificar la torre de visión y la cabeza MTP (multi-token prediction) del modelo base.

El modelo resuelve el problema de los rechazos excesivos en asistentes conversacionales: según el autor, se ha editado para mantener coherencia y mejorar las respuestas en lugar de minimizar la divergencia KL a costa de conservar negativas. Está orientado a cargas agénticas, generación de código, razonamiento con modo "thinking", tool calling y conversación multilingüe (inglés, chino y otros idiomas).

Por su tamaño (27.781 millones de parámetros reales según safetensors, repositorio de 55,6 GB en BF16) y su licencia Apache 2.0, se posiciona como una alternativa de precisión completa para despliegues en H200, configuraciones multi-GPU o RTX PRO 6000. La arquitectura declarada en las etiquetas es híbrida: atención lineal tipo Gated DeltaNet, componentes Mamba y decodificación especulativa con el drafter DFlash2 del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal Gated DeltaNet (GDN), componentes Mamba y cabeza MTP; multimodal (image-text-to-text) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (la model card menciona "long-context" sin cifra) |
| Tipos de cuantizacion | BF16 (este repositorio); NVFP4/FP8/BF16 en la variante NVFP4-MIXED; MXFP4/MXFP6/BF16 en la variante ROCm |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con capas tipo Mamba, además de una cabeza MTP (multi-token prediction) nativa y una torre de visión para entrada image-text-to-text. Las etiquetas del repositorio incluyen referencias a "hybrid-attention", "linear-attention", "gated-deltanet", "mamba" y "speculative-decoding", lo que confirma el diseño mixto orientado a contexto largo y eficiencia en inferencia. La model card indica que la torre de visión y la cabeza MTP son las del modelo base sin modificar.

El proceso de ajuste es una ablación de rechazos ("abliterated") realizada por AEON-7 sobre Qwen/Qwen3.8-27B. El autor describe explícitamente que no persigue KL cercano a cero, sino una "deriva KL coherente" que preserve la calidad de las respuestas; argumenta que minimizar ciegamente la KL mantiene el comportamiento de rechazo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales. El autor también publica un drafter de decodificación especulativa (AEON DFlash2) entrenado específicamente para esta familia, que acelera la generación manteniendo verificación lossless por parte del modelo de 27B.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas.
- Razonamiento con modo "thinking" explícito (etiqueta "reasoning", "thinking").
- Generación de código y tareas de programación (etiquetas "coding", "instruct").
- Tool calling y function calling, con soporte declarado para flujos agénticos.
- Capacidades multimodales de visión: entrada image-text-to-text mediante torre de visión del modelo base.
- Comportamiento sin rechazos ("refusal-removed", "uncensored", "unfiltered") para consultas que el modelo base rechazaría.
- Compatibilidad con endpoints OpenAI ("openai-compatible", "endpoints_compatible").
- Decodificación especulativa mediante el drafter AEON DFlash2 (lossless, verificado por el modelo principal).
- Soporte de contexto largo (según etiqueta "long-context"; cifra no disponible).

## Casos de uso

- Asistencia conversacional sin filtros en entornos de investigación: el modelo permite estudiar respuestas a preguntas sensibles sin que el sistema derive a negativas, útil para análisis de sesgos y evaluación de alineamiento.
- Generación de código en producción: al soportar tool calling y function calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o revisar parches, con la ventaja de no bloquear solicitudes legítimas por filtros excesivos.
- Agentes autónomos multi-paso: las etiquetas "agentic" y "tool-calling" indican idoneidad para orquestación de herramientas; el autor reporta una puntuación de 92 en trabajo agéntico en AEON Bench para la variante NVFP4-MIXED.
- Procesamiento de documentos con imágenes: la torre de visión permite extraer información de capturas, diagramas o formularios combinados con texto, en flujos de digitalización o atención al cliente.
- Razonamiento técnico y matemático con modo thinking: útil en asistentes de análisis donde se requiere traza de razonamiento explícita antes de la respuesta final.
- Despliegue como maestro de destilación o referencia: al ser el BF16 completo del que derivan las variantes cuantizadas del autor, sirve para generar datos sintéticos o validar las versiones NVFP4 y MXFP4.
- Investigación multilingüe en inglés y chino: adecuado para tareas de traducción, resumen o análisis de corpus en esos idiomas.

## Benchmarks y rendimiento

El autor publica resultados en AEON Bench (https://aeon-bench.com/#/board) leídos el 21 de noviembre de 2026, correspondientes a la variante NVFP4-MIXED de este mismo ajuste, no al BF16 aquí descrito:

| Metrica | AEON NVFP4-MIXED | Qwen3.8-27B stock 4-bit (unsloth) |
|---|---|---|
| Inteligencia | 89 | 85 |
| Trabajo agéntico | 92 | 78 |
| Razonamiento | 77 | 86 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este repositorio BF16. El autor también reporta, para el drafter DFlash2 medido en un DGX Spark, +21 % de velocidad frente al DFlash2 estándar a temperatura 0,6, +35 % a temperatura 1,0 y 3,2× frente a no usar drafter.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 55,6 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB de VRAM para inferencia cómoda.
- GPU recomendadas según el autor: H200, configuraciones multi-GPU y RTX PRO 6000 para el maestro BF16.
- No cabe en GPU de consumo en BF16; para RTX 5090 o DGX Spark el autor dirige a la variante NVFP4-MIXED (~23 GB).
- Opciones de despliegue: vLLM (recetas del autor para `aeon-vllm-ultimate` y `aeon-vllm-ultimate-rtx`), transformers; compatible con endpoints OpenAI.
- Decodificación especulativa: drafter AEON DFlash2 (~1,9 GB NVFP4 o ~3,85 GB BF16) verificado en DGX Spark/GB10 y en validación para RTX 5090.
- Latencia y throughput: no disponibles para el BF16; el autor solo publica cifras relativas del drafter en DGX Spark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AEON ULTIMATE BF16 (este) | 27,78 B | no disponible | Apache 2.0 | Hugging Face, abierto | BF16 sin rechazos, visión y MTP intactos |
| Qwen/Qwen3.8-27B (base) | 27,78 B (presumible) | no disponible | Apache 2.0 (presumible) | Hugging Face | Modelo original con filtros de rechazo |
| unsloth/Qwen3.8-27B-NVFP4 | 27,78 B (presumible) | no disponible | Apache 2.0 (presumible) | Hugging Face | Cuantización NVFP4 de referencia; 85 inteligencia / 78 agéntico en AEON Bench |
| AEON NVFP4-MIXED (mismo autor) | 27,78 B (presumible) | no disponible | Apache 2.0 | Hugging Face | ~23 GB, orientado a DGX Spark, RTX 5090 y RTX PRO 6000 |

## Limitaciones y advertencias

- Modelo "uncensored": elimina rechazos de forma deliberada, por lo que puede producir contenido que el modelo base bloquearía; requiere políticas de uso y moderación externas en producción.
- Riesgo de alucinación no cuantificado en la información disponible; el autor no publica tasas de error factual para el BF16.
- El autor reporta que versiones previas mostraban bucles en solicitudes extremadamente largas; atribuye el problema a la configuración de servicio, no al ajuste, y remite a las recetas de la variante NVFP4-MIXED. No hay confirmación independiente.
- Los benchmarks publicados corresponden a la variante NVFP4-MIXED, no al BF16; no deben extrapolarse sin verificación.
- Idiomas declarados: inglés, chino y multilingüe sin listado completo; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del ajuste ni sobre reclamaciones derivadas del contenido generado.
- El acceso a componentes auxiliares (drafter DFlash2, variante ROCm) está restringido a suscriptores de LotusMake, lo que limita la reproducibilidad completa del ecosistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante NVFP4-MIXED: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Variante MXFP4-MXFP6-ROCm: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MXFP4-MXFP6-ROCm
- Drafter DFlash2: https://huggingface.co/AEON-7/AEON-DFlash2-Qwen3.8-27B
- Cuantización de referencia unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- AEON Bench: https://aeon-bench.com/#/board
- LotusMake (acceso anticipado): https://lotusmake.com/c/aeon-forge
- Paper referenciado (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Paper referenciado (arxiv:2503.00555): https://arxiv.org/abs/2503.00555
