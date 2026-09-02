# hampsonw/Qwen3.8-Flash-Next-W4A16-AutoRound-MTP-INT4-Experts

## Resumen

El repositorio `hampsonw/Qwen3.8-Flash-Next-W4A16-AutoRound-MTP-INT4-Experts` no es un modelo completo, sino un **delta de pesos** (1.49 GB) que cuantiza a INT4 los 512 expertos enrutados del cabezal de predicción multi-token (MTP) del modelo base [`Intel/Qwen3.8-Flash-Next-W4A16-AutoRound`](https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound). El modelo base es una cuantización W4A16 con AutoRound del Qwen3.8-Flash-Next, un MoE multimodal de 125B parámetros con 6B activos por token y contexto de 262 144 tokens, desarrollado por Qwen.

El problema que resuelve es la reducción del *sidecar* MTP nativo: en BF16 ocupaba 5.21 GB por GPU, lo que penalizaba la capacidad de la KV cache. Al cuantizar solo los expertos MTP a W4A16 (grupo 128, empaquetado GPTQ), el sidecar baja a 1.49 GB y la KV cache FP8 pasa de 196 800 a 317 179 tokens, manteniendo la aceleración de decodificación especulativa. Está pensado para entornos de producción con vLLM (fork `Whamp/vllm`) y hardware multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Delta MTP sobre Qwen4 MoE (GDN + QSA) |
| Parametros totales | No disponible (el delta pesa 1.49 GB; el modelo base tiene 125B) |
| Parametros activos | 6B por token en el modelo base |
| Longitud de contexto | 262 144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | W4A16 simetrico RTN (grupo 128, GPTQ) para expertos MTP; BF16 para el resto |
| Idiomas soportados | No disponibles |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (con indice portable y variante PLE-mmap) |

## Arquitectura y entrenamiento

El delta no se entrena: se construye mediante **cuantizacion RTN simetrica** de los 512 expertos enrutados del cabezal MTP del modelo base, con grupo de 128 y empaquetado GPTQ. El resto del sidecar MTP (atención, embeddings, mezcladores, normas, puertas y expertos compartidos) permanece en BF16. El modelo base, Qwen3.8-Flash-Next, usa una arquitectura híbrida GDN + QSA: tres de cada cuatro capas emplean Gated DeltaNet para comprimir historia, y la cuarta usa Qwen Sparse Attention para recuperación de largo alcance. Además incluye una tabla de embeddings N-gram de 51B parámetros adicionales. El autor fija una revisión concreta del repositorio base (`861536dda5bcb208376fc4cd879b2bf76bece9fe`) para reproducibilidad, aunque Intel `main` actual tiene ficheros idénticos.

## Capacidades

- Decodificación especulativa nativa MTP con 2 tokens especulativos (K2) en el runtime `Whamp/vllm`.
- Reducción del sidecar MTP de 5.21 GB a 1.49 GB, liberando VRAM para KV cache.
- Mantiene la tasa de aceptación de drafts (63.48% en el benchmark del autor).
- Compatible con el modelo base multimodal (imagen-texto) de Qwen3.8-Flash-Next.
- Requiere el runtime Qwen4Exp de `Whamp/vllm` con soporte para PLE offload, KV cache FP8 QSA y expertos enrutados INT4 INC/Marlin.
- No es un modelo autónomo: necesita los pesos del modelo base Intel para funcionar.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en clústeres multi-GPU con VRAM limitada: el delta permite aumentar la capacidad de KV cache sin perder velocidad de decodificación.
- Servicio de inferencia de alto throughput con decodificación especulativa: en el hardware de prueba (4× RTX 3090), la velocidad de decodificación sube de 67.53 a 89.67 tok/s con concurrencia 1, y de 206.87 a 243.11 tok/s con concurrencia 4.
- Procesamiento de documentos largos (hasta 262K tokens de contexto) con caché KV ampliada: el autor probó dos peticiones concurrentes con prompts de 150 020 tokens cada una.
- Optimización de costes en entornos vLLM personalizados donde el sidecar MTP BF16 original consume demasiada VRAM.
- Investigación sobre cuantización de componentes auxiliares (cabezales de especulación) en modelos MoE.
- Integración en pipelines de generación multimodal que requieran baja latencia y alta concurrencia.

## Benchmarks y rendimiento

El autor publica resultados en su hardware (4× RTX 3090, TP4, expert parallel, PCIe Gen3, FP8 KV cache, contexto 262 144):

| Concurrencia | Sin especulacion | INT4 MTP K2 | Mejora |
| ---: | ---: | ---: | ---: |
| 1 | 67.53 tok/s | 89.67 tok/s | +32.8% |
| 2 | 117.84 tok/s | 146.85 tok/s | +24.6% |
| 4 | 206.87 tok/s | 243.11 tok/s | +17.5% |

Tasa de aceptación de drafts: 63.48%. Prefill estable: 1561 / 1579 / 1587 tok/s a concurrencia 1/2/4 (6.7–7.5% por debajo del perfil sin especulación). La KV cache FP8 retiene 317 179 tokens, un 74.5% de la capacidad sin especulación (425 497). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este delta.

## Requisitos de hardware

- Probado en 4× RTX 3090 (24 GB cada una) con tensor parallel 4 y expert parallel.
- Requiere el fork `Whamp/vllm` (runtime Qwen4Exp) con soporte para MTP nativo, PLE offload, KV cache FP8 QSA y expertos INT4 INC/Marlin. No funciona con vLLM estándar.
- El sidecar MTP INT4 ocupa 1.49 GB adicionales a los pesos del modelo base W4A16 (que pesan aproximadamente 75 GB en FP16, menos en W4A16).
- No es viable en una sola GPU consumer (RTX 4090) para el modelo completo; el autor no reporta configuraciones de una sola GPU.
- Opciones de despliegue: vLLM (fork Whamp), con opciones de tensor parallel, expert parallel y offload PLE.
- Latencia y throughput: los datos del autor son los únicos disponibles (ver benchmarks).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B (6B activos) | 262K | BF16 | qwen-community-1.0 | Modelo base multimodal |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | 125B | 262K | W4A16 AutoRound | qwen-community-1.0 | Base cuantizada sin MTP optimizado |
| hampsonw/Qwen3.8-Flash-Next-W4A16-AutoRound-MTP-INT4-Experts | 125B (delta 1.49 GB) | 262K | W4A16 + MTP INT4 | qwen-community-1.0 | Delta MTP INT4, requiere Whamp/vllm |

No hay comparativas con otros modelos de la misma categoría (p. ej. Llama 4 o DeepSeek) porque el delta solo modifica el cabezal MTP de un modelo específico.

## Limitaciones y advertencias

- **No es un modelo completo**: requiere descargar y enlazar el modelo base Intel en una revisión concreta.
- **Dependencia de un fork de vLLM**: el runtime `Whamp/vllm` es necesario; no se ha probado con vLLM upstream.
- **Sesgos y alucinaciones**: no se han evaluado específicamente para este delta; hereda las del modelo base (no documentadas en la información disponible).
- **Licencia**: los pesos del modelo base y del delta están bajo Qwen Community License 1.0, que restringe el uso comercial (requiere cumplir sus términos). El conversor en `tools/` es Apache-2.0.
- **Reproducibilidad**: el autor fija una revisión concreta del modelo base; si Intel cambia los ficheros, el delta podría no funcionar con otras revisiones (aunque actualmente son idénticos).
- **Hardware específico**: los resultados solo se han medido en 4× RTX 3090 con PCIe Gen3; otros entornos pueden variar.
- **Soporte limitado**: el autor no ha probado el artefacto con stock vLLM, ni con otros backends (llama.cpp, TGI, Ollama).

## Enlaces

- Repositorio HuggingFace del delta: https://huggingface.co/hampsonw/Qwen3.8-Flash-Next-W4A16-AutoRound-MTP-INT4-Experts
- Modelo base Intel: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Fork vLLM requerido: https://github.com/Whamp/vllm
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
