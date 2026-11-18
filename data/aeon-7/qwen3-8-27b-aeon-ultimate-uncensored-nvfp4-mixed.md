# AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED

## Resumen

Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED es una versión cuantizada en precisión mixta del modelo AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, un derivado "abliterated" (eliminación de rechazos) de la familia Qwen3.8 de 27B. Lo publica el usuario AEON-7 y combina una arquitectura híbrida con atención completa y capas de atención lineal de tipo GDN (gated delta net), además de torre de visión y cabeza MTP (multi-token prediction) para decodificación especulativa. El resultado es un modelo multimodal imagen-texto orientado a generación de texto, razonamiento, código y uso agéntico.

La relevancia de esta ficha está en la receta de cuantización: no es un volcado uniforme a NVFP4, sino una mezcla deliberada de NVFP4 (capas MLP 0-55), FP8 (capas MLP 56-63 y escritores de atención/GDN) y BF16 (torre de visión, cabeza MTP, embeddings, lm_head y el interior de GDN). Según la model card, esta mezcla busca preservar la fidelidad en código en las últimas capas, donde una receta FP8 parcial degradó la puntuación de pruebas unitarias de 0,833 a 0,694.

El modelo está pensado para despliegue en hardware Blackwell (DGX Spark/GB10, RTX 5090, RTX PRO 6000) con imágenes vLLM específicas del autor. El repositorio ocupa 24,7 GB y declara 19.869.895.920 parámetros reales en safetensors, aunque la nomenclatura comercial lo etiqueta como 27B. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa + atención lineal GDN (gated delta net), torre de visión y cabeza MTP |
| Parametros totales | 19.869.895.920 (según safetensors); etiquetado comercial como 27B |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (la model card menciona "long-context" como tag, sin cifra) |
| Tipos de cuantizacion | Mixta: NVFP4 W4A4 (MLP 0-55), FP8 (MLP 56-63, atención softmax, escritores GDN), BF16 (visión, MTP, embeddings, lm_head, interior GDN) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, ~23,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que combina capas de atención completa con capas de atención lineal GDN (gated delta net), una variante de atención lineal con compuertas que el autor etiqueta también como "mamba" y "hybrid-attention" en los tags. Incluye una torre de visión para entrada imagen-texto y una cabeza MTP (multi-token prediction) destinada a decodificación especulativa. El modelo base BF16 es un derivado abliterated del Qwen3.8-27B, con la torre de visión y la cabeza MTP intactas según la model card.

El proceso de cuantización usa NVIDIA ModelOpt con calibración de 1024x2048 y una puerta de exportación que verifica `found=168 missing=0 last8_mlp_fp8=24`. La receta se refinó empíricamente: una primera versión (Mix B) aplicó FP8 solo a `down_proj` de las últimas 8 capas y dejó `gate`/`up` en NVFP4, lo que hizo caer la puntuación de pruebas unitarias de código a 0,694; la versión final aplica FP8 a las tres proyecciones (`gate`, `up`, `down`) de las capas 56-63, recuperando 0,833. Tras la exportación se injertó la cabeza MTP desde el BF16 maestro (15 tensores, 0,791G) porque ModelOpt la había descartado. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instruct, con modo de razonamiento ("thinking") según los tags `reasoning` y `thinking`.
- Generación de código: la receta de cuantización se diseñó explícitamente para preservar la fidelidad en pruebas unitarias (puntuación 0,833 en AEON Bench).
- Capacidades de visión: pipeline `image-text-to-text` y torre de visión en BF16.
- Tool calling y function calling, con tags `tool-calling`, `function-calling` y `agentic`.
- Razonamiento multi-paso y flujos agénticos.
- Multilingüe: inglés, chino y otros idiomas (tag `multilingual`).
- Decodificación especulativa mediante cabeza MTP nativa y drafter externo DFlash2 opcional.
- Compatibilidad con API compatible con OpenAI (`openai-compatible`) y despliegue en vLLM con chunked-prefill.
- Comportamiento "uncensored" / "refusal-removed": el autor indica que se eliminaron los rechazos manteniendo coherencia.

## Casos de uso

- Generación de código en producción: el modelo conserva las últimas 8 capas MLP en FP8 precisamente para mantener la tasa de acierto en pruebas unitarias, lo que lo hace adecuado para pipelines de CI/CD que generan y validan código automáticamente.
- Asistentes de programación con contexto largo: la combinación de atención híbrida y chunked-prefill en vLLM permite procesar repositorios o archivos extensos en una sola sesión.
- Agentes autónomos con tool calling: los tags `agentic` y `function-calling` indican soporte para invocar herramientas externas en bucles multi-paso, útil para automatización de tareas.
- Análisis de documentos con imágenes: la torre de visión en BF16 permite extraer información de capturas, diagramas o formularios combinados con texto.
- Despliegue en estación de trabajo Blackwell: con ~23,8 GB en 4 shards, encaja en una RTX 5090 o RTX PRO 6000 para inferencia local de un modelo de 27B con visión.
- Servicio de chat sin filtros para investigación: el carácter abliterated lo hace adecuado para estudios sobre comportamiento de modelos y evaluación de sesgos, no para atención al cliente con requisitos de moderación.
- Aceleración de inferencia con decodificación especulativa: el drafter DFlash2 permite aumentar el throughput manteniendo la verificación del modelo de 27B.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| AEON Bench (pruebas unitarias de código), receta Mix B | 0,694 | FP8 solo en `down_proj` de últimas 8 capas |
| AEON Bench (pruebas unitarias de código), receta final | 0,833 | FP8 en `gate`/`up`/`down` de capas 56-63 |
| Aceleración con drafter DFlash2 (T=0,6) | +21 % tok/s vs DFlash2 estándar | Medido en una DGX Spark con etapa lk3 |
| Aceleración con drafter DFlash2 (T=1,0) | +35 % tok/s vs DFlash2 estándar | Medido en una DGX Spark con etapa lk3 |
| Aceleración con drafter DFlash2 (sin drafter) | 3,2× más rápido | Medido en una DGX Spark |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~23,8 GB de pesos en 4 shards; se recomienda al menos 24 GB de VRAM efectiva, con margen adicional para caché KV y contexto.
- GPU objetivo declaradas: DGX Spark / GB10, RTX 5090, RTX PRO 6000 (arquitectura Blackwell, SM 120/121a).
- El BF16 maestro (~54 GB) requiere H200, multi-GPU o RTX PRO 6000.
- Cabe en GPU de consumo: RTX 5090 (32 GB) es el objetivo principal; no se indica compatibilidad con generaciones anteriores (Ampere/Ada) por la dependencia de NVFP4.
- Despliegue: imágenes vLLM "AEON vLLM Ultimate" del autor, con soporte de chunked-prefill y API compatible con OpenAI. No se mencionan llama.cpp, Ollama ni TGI.
- Throughput: el drafter DFlash2 reporta +21 % a T=0,6, +35 % a T=1,0 y 3,2× frente a no usar drafter en una DGX Spark; no se publican cifras absolutas de tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (MIXED NVFP4) | 19,87B reales (~27B nominal) | no disponible | NVFP4 + FP8 + BF16 | Apache 2.0 | Blackwell (DGX Spark, RTX 5090, PRO 6000) |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | ~54 GB | no disponible | BF16 | Apache 2.0 | H200, multi-GPU, PRO 6000 |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MXFP4-MXFP6-ROCm | ~23,7 GB | no disponible | MXFP4 + MXFP6 + BF16 | Apache 2.0 | AMD ROCm (R9700, MI350/MI355) |
| AEON DFlash2 drafter | ~1,9 GB NVFP4 / ~3,85 GB BF16 | no disponible | NVFP4 W4A16 / BF16 | no disponible | DGX Spark, RTX 5090 |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" / "refusal-removed": no aplica salvaguardas de contenido, por lo que no es adecuado para producción orientada al público sin moderación externa.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- La cuantización mixta puede introducir degradaciones no medidas en tareas distintas del código; solo se reporta AEON Bench.
- Dependencia de hardware Blackwell: NVFP4 requiere SM 120/121a, lo que excluye GPU Ampere, Ada y anteriores.
- No se especifica la longitud de contexto efectiva ni el impacto de la cuantización en contextos largos.
- La model card indica que las notas de despliegue completas están en LotusMake y que el acceso al drafter DFlash2 está restringido a suscriptores.
- La licencia Apache 2.0 permite uso comercial, pero el carácter abliterated traslada al usuario la responsabilidad legal y ética del contenido generado.
- El autor advierte que "un bucle de contexto largo no es la última palabra" sobre esta línea, lo que sugiere posibles problemas no resueltos en contextos extensos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Variante ROCm MXFP4-MXFP6: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MXFP4-MXFP6-ROCm
- Drafter DFlash2: https://huggingface.co/AEON-7/AEON-DFlash2-Qwen3.8-27B
- Página del autor en LotusMake: https://lotusmake.com/c/aeon-forge
- Soporte/suscripción: https://lotusmake.com/support
