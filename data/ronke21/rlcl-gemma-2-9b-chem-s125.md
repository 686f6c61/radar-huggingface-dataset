# ronke21/rlcl-gemma-2-9b-chem-s125

## Resumen

`ronke21/rlcl-gemma-2-9b-chem-s125` es un ajuste fino (fine-tune) del modelo `google/gemma-2-9b` publicado por el usuario ronke21 en Hugging Face. El nombre del repositorio sugiere un entrenamiento mediante RLCL (Reinforcement Learning with Contrastive Learning, o variantes similares) aplicado a un dominio de química ("chem") con un step o checkpoint identificado como "s125". Se distribuye como un merge de adaptadores LoRA sobre los pesos base, en formato safetensors y compatible con la librería transformers.

El modelo conserva la arquitectura Gemma 2 de Google, un transformer decoder-only de 9.241.705.984 parámetros (9,2 B) con atención con ventana deslizante alternada y soft-capping. El repositorio pesa 18,5 GB, coherente con pesos en precisión bf16/fp16. Está etiquetado como "forgetting", lo que sugiere que el ajuste se orientó a estudiar o mitigar el olvido catastrófico durante el entrenamiento, un tema de investigación activo.

Su relevancia es limitada y experimental: no tiene descargas ni likes, la licencia no está declarada y el acceso está restringido (gated), por lo que requiere aceptar condiciones en Hugging Face. No debe confundirse con un modelo de producción; es un artefacto de investigación sobre el que no se han publicado benchmarks, datos de entrenamiento ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atención de ventana deslizante alternada y soft-capping |
| Parametros totales | 9.241.705.984 (9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del base Gemma 2 9B, 8192 tokens, no confirmado en la ficha) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se listan GGUF ni AWQ) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el modelo base Gemma 2 usa Gemma Terms of Use, pero este fine-tune no declara licencia propia) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-2-9b |
| Metodo de ajuste | LoRA merged (adaptadores fusionados en los pesos) |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-9b`, un transformer decoder-only denso de 9,2 B parámetros. Gemma 2 introduce atención con ventana deslizante en capas alternas (combinando atención local y global), logit soft-capping y normalización RMSNorm pre y post-atención. El fine-tune no modifica la arquitectura: los tags indican "lora-merged", es decir, se entrenaron adaptadores LoRA de bajo rango y posteriormente se fusionaron en los pesos base, generando un checkpoint completo en safetensors.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si se aplicó RLHF o DPO. El sufijo "chem" sugiere especialización en química y "s125" un checkpoint o step concreto; la etiqueta "forgetting" apunta a un experimento sobre olvido catastrófico (pérdida de capacidades generales tras el ajuste). No hay publicación, paper ni model card detallada que confirme estos extremos, por lo que todo lo relativo al proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Gemma 2 9B.
- Especialización probable en dominio químico (según el nombre del repositorio), no verificada.
- Soporte de tool calling y function calling: no documentado en esta ficha; el base Gemma 2 no lo incluye de forma nativa.
- Razonamiento multi-step y agentes: no documentado.
- Capacidades multilingües: no disponibles (los idiomas no están declarados).
- Modo thinking, visión o audio: no disponible.
- Compatibilidad con text-generation-inference y endpoints_compatible (según tags).

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo puede usarse como checkpoint de comparación para medir la degradación de capacidades generales tras un ajuste de dominio, dado el tag "forgetting".
- Experimentos de química computacional en texto: generación de descripciones de reacciones, propiedades o procedimientos, siempre con validación humana y sin asumir precisión científica.
- Reproducción de pipelines de fine-tune con LoRA merged: sirve como ejemplo de cómo fusionar adaptadores en un modelo Gemma 2 para estudio de metodología.
- Evaluación comparativa de fine-tunes de Gemma 2: útil en trabajos académicos que comparen variantes del mismo base con distintos datasets.
- Pruebas de despliegue con TGI: al ser compatible con text-generation-inference, puede integrarse en entornos de prueba de serving.
- Docencia y formación: ejemplo práctico de ajuste de un LLM open weights para un dominio concreto y de sus riesgos (olvido, sesgos, falta de evaluación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 18,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 24 GB o más.
- En cuantización de 8 bits: en torno a 10-11 GB de VRAM.
- En cuantización de 4 bits (si se generan pesos GGUF/AWQ, no publicados): en torno a 6-7 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para bf16 en single-GPU.
- Consumer GPU: cabe en RTX 4090 en bf16; en RTX 3090 (24 GB) también; en GPUs de 16 GB solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag endpoints_compatible), vLLM (compatible con Gemma 2), llama.cpp/Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-gemma-2-9b-chem-s125 | 9,2 B | No disponible | No disponible | Gated, 0 descargas |
| google/gemma-2-9b | 9,2 B | 8192 tokens | Gemma Terms of Use | Abierto en HF |
| google/gemma-2-9b-it | 9,2 B | 8192 tokens | Gemma Terms of Use | Abierto en HF |
| Mistral 7B / Mistral 7B Instruct | 7,2 B | 32k tokens (v0.2+) | Apache 2.0 | Abierto en HF |

La comparación es limitada: el fine-tune carece de evaluación pública, mientras que el base y Mistral cuentan con benchmarks y ecosistema consolidado. Mistral 7B ofrece licencia Apache 2.0 y contexto mayor, lo que lo hace más adecuado para producción. El fine-tune de ronke21 solo tiene sentido en contextos de investigación.

## Limitaciones y advertencias

- Sin benchmarks ni evaluación publicada: no hay evidencia de rendimiento ni de calidad.
- Riesgo de olvido catastrófico: el tag "forgetting" sugiere degradación de capacidades generales tras el ajuste de dominio.
- Riesgo de alucinación elevado en dominio químico: no se ha validado la precisión científica.
- Licencia no declarada: el uso comercial es incierto; además, el modelo base Gemma 2 está sujeto a los Gemma Terms of Use, que deben respetarse.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad.
- Idiomas no declarados: no se puede garantizar soporte multilingüe.
- Sin datos de sesgos: no hay información sobre sesgos conocidos.
- Repositorio con 0 descargas y 0 likes: sin validación por la comunidad.
- No se publican pesos cuantizados (GGUF, AWQ): el despliegue en hardware modesto requiere conversión manual.
- Fecha de creación futura (2026-11-27) en los metadatos: posible inconsistencia que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-9b-chem-s125
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Gemma 2 (blog de Google): https://blog.google/technology/developers/google-gemma-2/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Documentación de Gemma 2 en transformers: https://huggingface.co/docs/transformers/model_doc/gemma2
