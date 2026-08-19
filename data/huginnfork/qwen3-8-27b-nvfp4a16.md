# huginnfork/Qwen3.8-27B-NVFP4A16

## Resumen

Este repositorio es un **placeholder público** para una cuantización planificada del modelo `Qwen/Qwen3.8-27B`, que aún no ha sido lanzado por Qwen. El autor, `huginnfork`, ha reservado el nombre y la receta de cuantización para que la comunidad conozca de antemano el esquema previsto: NVFP4A16 (pesos de 4 bits en formato NVFP4, activaciones en bf16) sobre el tronco LLM del modelo base. **No hay pesos en el repositorio**; cualquier intento de descarga o inferencia fallará.

La relevancia de esta ficha es doble: documenta la intención técnica de una cuantización que podría interesar a quienes despliegan modelos Qwen en entornos con VRAM limitada, y sirve como advertencia para evitar confusiones con otros repositorios homónimos. Hasta que el modelo base se publique y la cuantización se construya y mida, no se puede evaluar ningún aspecto de rendimiento o calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base no ha sido lanzado; se espera comparable a la familia Qwen3.5/3.6, posiblemente con bloque SSM `linear_attn` y cabeza MTP) |
| Parametros totales | 27B (según el nombre, pendiente de confirmación) |
| Parametros activos | No disponible (se desconoce si el modelo base será MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16) planificado; atención, torre de visión, bloque SSM y cabeza MTP en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (la del modelo base, según la model card) |
| Formato de pesos | `compressed-tensors` (planificado, aún sin pesos) |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura final, ya que el modelo base `Qwen/Qwen3.8-27B` no ha sido liberado. La model card indica que la receta de cuantización está pensada para un tronco LLM con MLPs, un bloque SSM (`linear_attn`), atención completa (`self_attn`) y una cabeza de predicción multi-token (MTP). El plan es cuantizar únicamente los MLPs a NVFP4 4 bits con activaciones bf16 (W4A16), manteniendo el resto en bf16. El autor señala que, en familias anteriores (Qwen3.5/3.6), la cuantización de activaciones (W4A4) duplicaba la divergencia KL sin ahorro de espacio, por lo que opta por W4A16.

No se ha realizado ningún fine-tuning, abliteración ni fusión de modelos: se trata de una cuantización pura derivada del modelo base, cuyos términos de licencia se aplican. No hay datos de entrenamiento adicionales.

## Capacidades

- **No aplicable**: el repositorio no contiene pesos, por lo que el modelo no puede ejecutarse ni evaluarse.
- Capacidades planificadas (según la receta): procesamiento imagen-texto-a-texto (pipeline `image-text-to-text`), generación de texto con razonamiento, y posiblemente tool calling y modo agente si el modelo base las incorpora (no confirmado).
- No hay información sobre capacidades multilingües, visión o audio más allá del pipeline declarado.

## Casos de uso

- **No aplicable actualmente**: al ser un placeholder sin pesos, no se puede desplegar ni usar.
- Cuando exista, los casos de uso potenciales serían los de un Qwen3.8-27B cuantizado a 4 bits: inferencia local en GPUs de consumo (p. ej., RTX 4090 con 24 GB), despliegue en edge con vLLM o llama.cpp, y aplicaciones de visión-lenguaje que requieran menor huella de memoria.
- Se recomienda esperar a la publicación real del modelo y de las métricas de calidad (KLD, perplejidad) antes de planificar cualquier integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que, cuando existan pesos, se añadirán métricas de divergencia KL por token frente al base bf16 y perplejidad en wikitext-2-raw, medidas con el harness propio del autor. Hasta entonces, no hay datos que reportar.

## Requisitos de hardware

- No disponibles: sin pesos, no se puede estimar VRAM, latencia ni throughput.
- Cuando se publique, se espera que una cuantización W4A16 de 27B requiera aproximadamente 14-16 GB de VRAM en FP16 para los pesos (27B × 2 bytes × 0.5 por cuantización 4 bits ≈ 13.5 GB), más overhead de activaciones y KV cache. Esto cabría en GPUs de 24 GB como RTX 4090, RTX 3090 o A10G, y en A100 40 GB con margen.
- Herramientas de despliegue previsibles: vLLM (por el uso de `compressed-tensors`), llama.cpp (si se exporta a GGUF), Ollama, TGI.
- No se dispone de datos de latencia.

## Comparativa con modelos similares

No disponible. No existe ningún modelo comparable real porque el modelo base aún no ha sido lanzado. El repositorio es un placeholder y no se puede comparar con alternativas como Qwen2.5-VL-32B o Qwen3-VL-30B hasta que haya pesos y benchmarks.

## Limitaciones y advertencias

- **El repositorio no contiene pesos**: cualquier intento de descarga o inferencia fallará. Es un placeholder.
- El modelo base `Qwen/Qwen3.8-27B` no ha sido lanzado; la arquitectura y las capacidades están sin confirmar.
- La receta de cuantización es contingente: si el modelo base resulta ser MoE o tiene una disposición de módulos diferente, la receta cambiará.
- No hay métricas de calidad (KLD, perplejidad) publicadas; no se puede evaluar la fidelidad de la cuantización.
- La licencia Apache 2.0 del modelo base se aplicará, pero los términos exactos del modelo base original (Qwen) deberán verificarse cuando se publique.
- Riesgo de confusión con otros repositorios de cuantización de Qwen: verificar siempre que el repositorio contenga pesos antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huginnfork/Qwen3.8-27B-NVFP4A16
- Herramienta de cuantización mencionada: [llm-compressor](https://github.com/vllm-project/llm-compressor)
- Modelo base (pendiente de publicación): `Qwen/Qwen3.8-27B` (no disponible en HuggingFace en el momento de redactar esta ficha)
