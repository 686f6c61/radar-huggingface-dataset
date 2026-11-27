# ronke21/rlcl-gemma-2-9b-it-igbo-s124

## Resumen

`ronke21/rlcl-gemma-2-9b-it-igbo-s124` es un ajuste fino (fine-tuning) del modelo `google/gemma-2-9b-it` publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) y el sufijo `igbo-s124`, se trata de un experimento de investigación centrado en el olvido catastrófico (catastrophic forgetting) durante el ajuste fino en un idioma de bajos recursos, en este caso el igbo, aplicando una técnica denominada RLCL (siglas no documentadas en la información disponible) sobre un adaptador LoRA que posteriormente se ha fusionado con los pesos base.

El modelo conserva la arquitectura Gemma 2 del original: un transformer decoder-only de aproximadamente 9.240 millones de parámetros (9.241.705.984 según los safetensors del repositorio), con atención por ventanas alternas y soporte de contexto largo. El repositorio ocupa 18,5 GB, lo que corresponde a los pesos en precisión de 16 bits.

Su relevancia es acotada y experimental: no es un modelo de producción ni un lanzamiento oficial de Google, sino una variante de investigación publicada con acceso restringido (gated). No se han publicado resultados de benchmarks, licencia explícita ni lista de idiomas soportados en la información disponible, por lo que cualquier evaluación de su calidad debe realizarse empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parámetros totales | 9.241.705.984 (~9,24 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el base Gemma 2 9B soporta 8.192 tokens) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | No disponibles (el ajuste se orienta al igbo, sin lista oficial) |
| Licencia | No disponible (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors (transformers) |
| Modelo base | google/gemma-2-9b-it |
| Técnica de ajuste | RLCL + LoRA fusionado (lora-merged) |
| Acceso | Gated (restringido) |
| Tamaño del repositorio | 18,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 9B: un transformer decoder-only con normalización RMSNorm, activaciones GeGLU, atención con ventanas locales y globales alternadas, y embeddings rotatorios (RoPE). El modelo base es la variante instruction-tuned (`gemma-2-9b-it`), por lo que hereda el formato conversacional y el tokenizador de SentencePiece de Gemma.

Sobre ese base se ha aplicado un ajuste fino con LoRA que después se ha fusionado en los pesos principales, según el tag `lora-merged`. El tag `rlcl` sugiere el uso de una técnica de regularización o currículo de aprendizaje destinada a mitigar el olvido catastrófico (`forgetting`) al especializar el modelo en igbo. El sufijo `s124` podría indicar un identificador de semilla, paso o configuración experimental, pero no se documenta. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se especifican hiperparámetros del LoRA (rango, alpha, capas objetivo).

## Capacidades

- Generación de texto conversacional en formato instruction-tuned, heredado de Gemma 2 9B IT.
- Comprensión y generación en igbo, presumiblemente mejorada respecto al base tras el ajuste.
- Razonamiento general y respuesta a instrucciones en los idiomas cubiertos por el modelo base (no verificados tras el ajuste).
- Generación de código y matemáticas heredada del base, con riesgo de degradación por olvido catastrófico.
- Soporte de tool calling y function calling: no confirmado en esta variante; el base Gemma 2 IT no lo soporta de forma nativa estructurada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponibles (Gemma 2 9B es solo texto).
- Capacidades multilingües: no verificadas; el ajuste en igbo puede haber alterado el equilibrio idiomático del base.

## Casos de uso

- Investigación sobre olvido catastrófico: sirve como artefacto reproducible para estudiar cómo el ajuste fino en un idioma de bajos recursos afecta al rendimiento en inglés y en tareas generales del modelo base.
- Procesamiento de lengua igbo: generación y resumen de texto en igbo para proyectos de preservación lingüística o divulgación, siempre con validación humana por la falta de benchmarks.
- Evaluación comparativa de técnicas de regularización: útil para contrastar RLCL frente a otras estrategias (replay de datos, EWC, LoRA de bajo rango) en experimentos académicos.
- Prototipado de asistentes conversacionales en igbo: despliegue experimental en entornos controlados para medir calidad percibida antes de invertir en un ajuste más robusto.
- Traducción asistida igbo-inglés: como componente de un pipeline con revisión posterior, dado que no hay métricas publicadas de calidad de traducción.
- Docencia y experimentación con transformers: ejemplo práctico de fusión de LoRA y despliegue con `transformers` o TGI para cursos de ajuste fino.
- Análisis de sesgos y deriva lingüística: estudio de cómo un ajuste monolingüe altera la distribución de respuestas del modelo base en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 18,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para inferencia con contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB; en 4 bits (si se generan pesos GGUF/AWQ, no publicados), aproximadamente 6-7 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) viable en bf16 con contexto moderado.
- GPU de consumo: RTX 3090/4090 (24 GB) en bf16; RTX 4080/4070 Ti (16 GB) solo con cuantización de 8 bits o inferior; GPUs de 8-12 GB requerirían cuantización de 4 bits no publicada en el repo.
- Opciones de despliegue: `transformers` (soporte nativo), Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM (compatible con arquitectura Gemma 2), llama.cpp/Ollama solo si se generan pesos GGUF propios.
- Latencia y throughput: no disponibles; sin datos publicados ni mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-gemma-2-9b-it-igbo-s124 | ~9,24 B | No disponible | No disponible | Gated | Ajuste experimental en igbo con RLCL |
| google/gemma-2-9b-it | ~9,24 B | 8.192 tokens | Gemma Terms of Use | Público (gated) | Base oficial instruction-tuned |
| google/gemma-2-9b | ~9,24 B | 8.192 tokens | Gemma Terms of Use | Público (gated) | Base preentrenado sin instrucciones |
| meta-llama/Llama-3.1-8B-Instruct | ~8,03 B | 131.072 tokens | Llama 3.1 Community License | Público (gated) | Alternativa de tamaño similar con contexto mucho mayor |

La comparación con Llama 3.1 8B Instruct es relevante por tamaño y categoría, aunque este último ofrece contexto muy superior y una licencia explícita. Frente al Gemma 2 9B IT oficial, la variante de ronke21 no documenta mejoras medibles ni licencia propia, por lo que su uso en producción no está justificado sin evaluación previa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de mejora en igbo ni de magnitud del olvido en otros idiomas.
- Riesgo alto de olvido catastrófico: el propio tag `forgetting` indica que el ajuste puede degradar capacidades del base en inglés, código y matemáticas.
- Licencia no especificada: al derivar de Gemma 2, se heredan presumiblemente los Gemma Terms of Use, pero el repositorio no lo declara; el uso comercial queda en una zona gris hasta confirmarlo con el autor.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad automática.
- Idiomas no declarados: no hay lista oficial; el comportamiento multilingüe tras el ajuste es incierto.
- Riesgo de alucinación: sin evaluación, se asume el del base Gemma 2 9B IT, potencialmente agravado por el ajuste en un dominio limitado.
- Sesgos: el dataset de ajuste en igbo no está documentado, por lo que no se pueden evaluar sesgos de género, etnia o religión introducidos.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que complica el despliegue en hardware de consumo.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como artefacto de investigación no auditado.
- Fecha de creación futura en los metadatos (2026-11-27): posible inconsistencia en el registro, a verificar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-9b-it-igbo-s124
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Documentación de Gemma 2 (Google): https://ai.google.dev/gemma/docs/gemma-2
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118
- Repositorio de transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
