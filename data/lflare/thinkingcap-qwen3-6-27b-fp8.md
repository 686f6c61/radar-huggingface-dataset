# lflare/ThinkingCap-Qwen3.6-27B-FP8

## Resumen

ThinkingCap-Qwen3.6-27B-FP8 es una cuantización FP8 del modelo multimodal bottlecapai/ThinkingCap-Qwen3.6-27B, publicada por el usuario lflare. Se distribuye en formato `compressed-tensors` con esquema FP8_DYNAMIC W8A8 y conserva en bf16 todas las rutas sensibles a la cuantización: `lm_head`, la cabeza MTP, el torreón de visión y la ruta de atención completa (tanto el bloque lineal Gated-DeltaNet/SSM como el `self_attn` con su puerta multiplicativa fusionada en `q_proj`). Solo las MLP, unos 17 000 millones de parámetros, se almacenan en FP8.

El modelo resuelve un problema muy concreto: servir un modelo híbrido de atención lineal más visión en menos memoria sin degradar la calidad de forma apreciable. El autor reporta KLD ≈ 0,0132 nats y un incremento de perplejidad de solo +0,96 % frente al padre en bf16, además de una cabeza MTP funcional declarada en `quantization_config.ignore` para que vLLM la cargue correctamente; sin ese ajuste, la aceptación del borrador cae al 0 %.

Es relevante ahora porque mantiene decodificación especulativa operativa sobre una cuantización FP8: 75,0 % de aceptación del borrador MTP en vLLM 0.26.0 sobre Blackwell SM120, ligeramente por encima del 74,2 % del build FP8 de referencia del autor original. El repositorio ocupa 38,5 GB y acumula 30 descargas desde su creación el 30 de julio de 2026.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (Gated-DeltaNet / SSM) y capas de self-attention completa; multimodal con torreón de visión; cabeza MTP para decodificación especulativa. Linaje `qwen3_5` |
| Parámetros totales | 27 781 427 952 (≈27,78 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 W8A8 dinámico (`compressed-tensors`, FP8_DYNAMIC) solo en MLP (≈17 B parámetros); bf16 en `lm_head`, cabeza MTP, torreón de visión, bloque `linear_attn` y ruta `self_attn` completa. No se distribuye GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con configuración `compressed-tensors`; tamaño del repo 38,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido: combina capas de atención lineal del tipo Gated-DeltaNet (SSM) con capas de self-attention completa, que según la model card representan aproximadamente una cuarta parte del total. Qwen3.5/3.6 fusiona la puerta multiplicativa de salida de atención dentro de `q_proj`, un detalle relevante porque el error de cuantización sobre una puerta multiplicativa es cualitativamente peor que sobre una proyección aditiva. A esto se añade un torreón de visión (pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction) que actúa como borrador en decodificación especulativa.

La decisión de diseño central del build es mantener en bf16 toda la ruta de atención, no solo el bloque lineal. El autor justifica que el coste es de aproximadamente 1,5 GiB (un 4,6 % del total) y que reduce el KLD de forma medible, mientras que un MTP en bf16 regraftado sobre una cuantización `compressed-tensors` sin declararlo en `ignore` se carga mal y produce 0 % de aceptación del borrador. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base; esos datos no están publicados en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Comprensión de imagen y texto (`image-text-to-text`): el torreón de visión describe imágenes correctamente según las pruebas de humo del autor.
- Decodificación especulativa mediante cabeza MTP propia, con 75,0 % de aceptación del borrador medida en vLLM 0.26.0.
- Razonamiento en modo "thinking": el nombre del modelo y su linaje Qwen3.6 lo sugieren, pero no hay documentación explícita en la información disponible sobre la sintaxis o el modo de activación.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Capacidades de audio: no disponibles.

## Casos de uso

- Descripción y etiquetado de imágenes a escala: el pipeline `image-text-to-text` con torreón de visión en bf16 permite procesar lotes de imágenes para generar descripciones, alt-text accesible o metadatos en un CMS, sirviendo en vLLM con `--max-num-seqs 32`.
- Extracción de información de documentos escaneados: combinación de OCR previo con el modelo para estructurar campos (facturas, albaranes, formularios) en JSON, aprovechando que la ruta de atención en bf16 preserva la fidelidad sobre el texto de entrada.
- Asistentes conversacionales de atención al cliente: generación multi-turno con el modelo servido en vLLM o SGLang; el límite de contexto debe fijarse tras consultar la ficha del modelo base, ya que no está documentado aquí.
- Moderación y revisión de contenido visual: clasificación y descripción de imágenes subidas por usuarios con un modelo autoalojado bajo licencia Apache 2.0, sin dependencia de API externa.
- Servicio de inferencia de alto throughput con decodificación especulativa: activando `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'` se obtiene una aceptación del 75 %, lo que reduce el número de pasos de verificación por token generado en comparación con generación sin borrador.
- Base para fine-tuning multimodal con QLoRA/LoRA: al estar las MLP en FP8 y la atención en bf16, es posible adaptar las capas de atención en bf16 sin descomprimir el modelo completo.
- Evaluación comparativa de recetas de cuantización: los ficheros `recipe.yaml`, `kld_thinkingcap-fp8-attnbf16.json` y `ppl_thinkingcap-fp8-attnbf16.json` del repo permiten reproducir el protocolo de medición de KLD y perplejidad frente al padre en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos publicados son métricas de fidelidad de la cuantización y de aceptación especulativa:

| Métrica | Valor | Contexto de medición |
|---|---|---|
| KLD frente al padre bf16 | 0,0132 nats | Receta `attnbf16` |
| Δ Perplejidad frente al padre bf16 | +0,96 % | Receta `attnbf16` |
| Aceptación del borrador MTP (este repo) | 75,0 % | vLLM 0.26.0, Blackwell SM120, greedy, `num_speculative_tokens=3` |
| Aceptación del borrador MTP (FP8 de referencia del autor original) | 74,2 % | Mismas condiciones |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman 38,5 GB (repo completo); conviene reservar entre 48 y 64 GB para pesos, caché KV y bloques de caché Mamba en función de la longitud de secuencia y del número de secuencias concurrentes.
- GPU de datacenter recomendadas: H100 80 GB, A100 80 GB, B200 (familia Blackwell SM120, la empleada en las mediciones de MTP del autor). L40S 48 GB y RTX 6000 Ada 48 GB quedan muy ajustadas.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) por peso; requiere al menos 2× RTX 4090 24 GB con paralelismo tensorial o descarga parcial a CPU, con la penalización de latencia correspondiente.
- Opciones de despliegue: vLLM (probado en 0.26.0) y SGLang cargan el modelo de forma nativa. Es obligatorio fijar `--max-num-seqs 32` o inferior, porque Qwen3.6 es un modelo híbrido de atención lineal y el valor por defecto de `max_num_seqs` excede los bloques de caché Mamba disponibles. llama.cpp y Ollama no soportan esta cuantización `compressed-tensors` FP8.
- Latencia y throughput: no disponible. Como referencia de eficiencia, con `num_speculative_tokens=3` y una aceptación del 75 % se pueden verificar hasta 4 tokens por paso en el mejor caso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Calidad relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lflare/ThinkingCap-Qwen3.6-27B-FP8 (este) | 27,78 B | No disponible | FP8 W8A8 con atención bf16 | KLD 0,0132 nats; ΔPPL +0,96 %; MTP 75,0 % | Apache 2.0 | HuggingFace, 30 descargas |
| bottlecapai/ThinkingCap-Qwen3.6-27B (padre) | 27,78 B | No disponible | bf16 | Referencia de calidad (KLD 0) | Apache 2.0 (según el build derivado) | HuggingFace |
| Build FP8 de referencia del autor original (`bottlecapai/…-FP8`) | 27,78 B | No disponible | FP8 `compressed-tensors` | MTP 74,2 % | Apache 2.0 (según el build derivado) | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (27 B, multimodal, atención híbrida) en el material proporcionado, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- El campo de idiomas no está informado; no se puede asumir cobertura multilingüe sin verificarla empíricamente.
- La longitud de contexto no está documentada en esta ficha; debe consultarse la model card del padre en bf16 antes de diseñar aplicaciones que dependan de ventanas largas.
- No hay resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MMMU) publicados, solo métricas de fidelidad de cuantización, por lo que no es posible comparar su calidad absoluta con otras alternativas.
- Riesgo de alucinación inherente a los modelos generativos: no se han publicado evaluaciones de factualidad ni de tasas de alucinación para este build.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo base sin ficha de sesgos pública, se recomienda auditoría propia antes de un despliegue en producción.
- El repositorio tiene 30 descargas y 0 likes, con lo que la validación comunitaria es prácticamente nula; el modelo es un artefacto de cuantización de un tercero, no una versión oficial del autor original.
- La licencia Apache 2.0 del build derivado debe contrastarse con los términos del modelo base; no se dispone de confirmación explícita sobre la licencia del padre en la información proporcionada.
- El requisito de `--max-num-seqs 32` es una restricción dura de despliegue: valores superiores agotan los bloques de caché Mamba del modelo híbrido y provocan fallos de servicio.
- El soporte de tool calling, agentes y modo thinking no está documentado; no debe asumirse en pipelines de producción sin pruebas explícitas.
- No hay builds GGUF ni AWQ publicados, lo que limita el despliegue en hardware de consumo y en entornos sin vLLM o SGLang.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lflare/ThinkingCap-Qwen3.6-27B-FP8
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B
- Receta de cuantización: `recipe.yaml` (incluido en el repositorio)
- Medición de KLD: `kld_thinkingcap-fp8-attnbf16.json` (incluido en el repositorio)
- Medición de perplejidad: `ppl_thinkingcap-fp8-attnbf16.json` (incluido en el repositorio)
- Build FP8 de referencia del autor original: referenciado en la model card como `bottlecapai/…-FP8`; no se dispone de URL directa
- Paper, blog o demo adicionales: no disponible
