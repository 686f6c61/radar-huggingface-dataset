# arrochi112/onebee-gf-dpo-v0

## Resumen

onebee-gf-dpo-v0 es un checkpoint experimental desarrollado por arrochi112 dentro del proyecto de investigación open source [small-mind-companion](https://github.com/arrogance231/small-mind-companion). El proyecto explora cuánta capacidad aparente puede recuperar un modelo pequeño (~2-4B parámetros) con capacidades de visión mediante post-entrenamiento, memoria externa y retrieval, en lugar de escalar el número de parámetros. Este checkpoint concreto corresponde a la semana 2 de DPO (1 época, 200 pares de preferencia) aplicado sobre un SFT previo (sft-v0). El autor reporta de forma honesta que a esta escala el DPO no produce resultados distinguibles del SFT-only en evaluaciones reales.

El modelo se basa en `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4, y añade un adaptador LoRA. Los pesos totales suman 5.104.297.539 parámetros (~5.1B), lo que sugiere que el modelo base tiene alrededor de 5B parámetros (el proyecto menciona ~2-4B, pero el dato real de safetensors es 5.1B). La licencia es Gemma, heredada del modelo base. No se dispone de información sobre la longitud de contexto, idiomas soportados ni benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en google/gemma-4-E2B-it) con adaptador LoRA |
| Parametros totales | 5.104.297.539 (~5.1B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (presumiblemente fp16, dado el tamaño del repo de 10.2 GB) |
| Idiomas soportados | no disponibles |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 con capacidad de procesamiento de imágenes y texto. Sobre este base se aplicó un adaptador LoRA (low-rank adaptation) para el fine-tuning. El entrenamiento siguió un pipeline en dos etapas: primero un SFT (supervised fine-tuning) con el checkpoint `onebee-gf-sft-v0`, y posteriormente un DPO (direct preference optimization) con 200 pares de preferencia y 1 época, dando lugar a este checkpoint `dpo-v0`.

No se especifican detalles del dataset de entrenamiento, número de tokens, ni composición de los datos. El proyecto en su conjunto incorpora memoria externa y retrieval, pero este checkpoint en particular no incluye esas modificaciones; es únicamente el resultado del DPO sobre el SFT. El autor documenta en el repositorio los fallos y limitaciones encontrados durante el desarrollo, incluyendo que el DPO a esta escala no aporta mejoras medibles sobre el SFT.

## Capacidades

- Generación de texto conversacional orientado a "companion" (asistente personal).
- Procesamiento multimodal: entrada de imágenes y texto (heredado del modelo base Gemma-4-E2B-it).
- Fine-tuning con DPO para alinear preferencias, aunque sin efectos medibles a esta escala.
- No se documenta soporte para tool calling, function calling, ni razonamiento multi-paso específico.
- Capacidades multilingües no especificadas.

## Casos de uso

- Investigación en post-entrenamiento: sirve como punto de comparación para estudiar el efecto del DPO a pequeña escala frente a SFT-only, tal como documenta el autor en `docs/dpo_results.md`.
- Experimentación con modelos multimodales pequeños: permite probar técnicas de alineación (DPO) en un modelo de ~5B con visión, sin necesidad de infraestructura masiva.
- Benchmarking de metodologías de evaluación: al ser un checkpoint intermedio, puede usarse para validar métricas que distingan entre SFT y DPO en modelos pequeños.
- Base para iteraciones posteriores: el proyecto ofrece otros checkpoints (sft-v1, dpo-v1-scale) que mejoran sobre este, por lo que este modelo es útil para reproducir la línea de evolución.
- Prototipado de asistentes conversacionales con entrada de imágenes en entornos de investigación, siempre que se asuma que el rendimiento no está validado.
- Estudio de sesgos y alucinaciones en modelos pequeños tras DPO, dado que el autor reporta resultados negativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de este checkpoint no son distinguibles de SFT-only a esta escala, y remite a `docs/dpo_results.md` del repositorio para detalles. No se proporcionan números de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 ocupan ~10.2 GB (5.1B × 2 bytes). Con overhead de activaciones y memoria de contexto, se recomienda al menos 16 GB de VRAM para inferencia básica con batch pequeño.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB). En una GPU con 12 GB podría ser ajustado dependiendo de la longitud de contexto.
- No cabe en GPUs de consumo con menos de 16 GB de VRAM (p. ej., RTX 3060 12GB no sería suficiente para fp16 completo).
- Opciones de despliegue: al ser safetensors, se puede servir con vLLM, TGI, o Hugging Face Transformers. No hay cuantizaciones GGUF en este repo (aunque el proyecto ofrece un checkpoint posterior con GGUF en `onebee-gf-dpo-v1-scale-gguf`). Para usar con llama.cpp o Ollama sería necesario convertir los pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones detalladas de modelos comparables en la información proporcionada. El propio autor indica que el rendimiento no se distingue del SFT-only, por lo que una comparativa cuantitativa no es posible. Se podría comparar con otros modelos de la familia Gemma (p. ej., Gemma-2-2B o Gemma-3-4B) en términos de tamaño, pero no hay métricas publicadas para este checkpoint. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Checkpoint experimental: no está pensado para uso en producción; el autor lo describe como "real training signal, but not distinguishable from SFT-only at this scale".
- Resultados no validados: no hay benchmarks públicos, y la model card advierte que los números deben leerse con cautela.
- Sesgos del modelo base: al heredar de Gemma-4-E2B-it, puede arrastrar sesgos presentes en ese modelo, no evaluados en este contexto.
- Riesgo de alucinación: no se ha evaluado, y al ser un modelo pequeño con DPO limitado, la fiabilidad puede ser baja.
- Licencia Gemma: impone restricciones de uso comercial (deben revisarse los términos exactos de la licencia Gemma; no se detallan aquí).
- Idiomas: no se especifica qué idiomas soporta, por lo que no se puede garantizar cobertura multilingüe.
- Longitud de contexto desconocida: no se indica el tamaño de la ventana de contexto, lo que dificulta planificar su uso en tareas de largo recorrido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/arrochi112/onebee-gf-dpo-v0)
- [Repositorio del proyecto small-mind-companion](https://github.com/arrogance231/small-mind-companion)
- [Documento de resultados DPO](https://github.com/arrogance231/small-mind-companion/blob/main/docs/dpo_results.md)
- [Checkpoint SFT v0](https://huggingface.co/arrochi112/onebee-gf-sft-v0)
- [Checkpoint SFT v1](https://huggingface.co/arrochi112/onebee-gf-sft-v1)
- [Checkpoint DPO v1-4epoch](https://huggingface.co/arrochi112/onebee-gf-dpo-v1-4epoch)
- [Checkpoint DPO v1-scale](https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale)
- [Checkpoint DPO v1-scale-gguf](https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale-gguf)
