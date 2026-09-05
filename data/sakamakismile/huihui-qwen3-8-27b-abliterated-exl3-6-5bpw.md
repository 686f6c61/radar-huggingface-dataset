# sakamakismile/Huihui-Qwen3.8-27B-abliterated-EXL3-6.5bpw

# Huihui-Qwen3.8-27B-abliterated-EXL3-6.5bpw

## Resumen

El modelo **Huihui-Qwen3.8-27B-abliterated-EXL3-6.5bpw** es una cuantización EXL3 de 6.5 bits por peso, creada por **sakamakismile** a partir del modelo base **huihui-ai/Huihui-Qwen3.8-27B-abliterated**. Este modelo base es una versión "abliterated" (sin filtros de contenido) de un modelo de la familia Qwen3.5, con arquitectura híbrida de 64 capas: 16 capas de atención completa y 48 capas de atención lineal. El proceso de cuantización se realizó con ExLlamaV3 v1.4.5, utilizando calibración por defecto (250 líneas × 2048 tokens), codebook mul1 y out_scales siempre activos.

Este modelo resulta relevante porque ofrece un equilibrio entre rendimiento y eficiencia: mantiene un comportamiento comparable al modelo original en tareas de razonamiento y agente, a la vez que reduce el peso y acelera la inferencia en GPUs con 16 GiB de VRAM. Además, su arquitectura híbrida produce una KV cache ligera, lo que permite manejar contextos largos sin un coste de memoria excesivo. Según los datos de HuggingFace, el recuento de parámetros en los safetensors es de **12.707.664.112** (≈12.7B), aunque el nombre del modelo sugiere 27B; esta discrepancia no se explica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 64 capas (16 full attention + 48 linear attention), KV heads 4, head_dim 256 |
| Parametros totales | 12.707.664.112 (≈12.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 6.5bpw (body 6.5 / lm_head 8 / MTP 16 / vision 16) |
| Idiomas soportados | japonés e inglés (según la ficha del autor) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura híbrida de la familia Qwen3.5, compuesta por 64 capas en total: 16 capas de atención completa (full attention) y 48 capas de atención lineal (linear attention). Las cabezas de KV son 4 y la dimensión por cabeza es 256. Esta combinación reduce el coste computacional y de memoria en comparación con un transformer de atención completa equivalente.

No se proporcionan datos sobre el entrenamiento del modelo base, como el número de tokens, la composición del dataset o técnicas de alineación (RLHF, DPO). El nombre "abliterated" indica que se ha eliminado la censura o los filtros de seguridad del modelo original, pero no se detalla el método utilizado. El proceso de cuantización a EXL3 6.5bpw se llevó a cabo con ExLlamaV3 v1.4.5, usando la calibración por defecto de 250 líneas × 2048 tokens, codebook mul1 y out_scales siempre activos.

## Capacidades

- **Razonamiento y conocimiento**: alcanza 15/20 en MMLU-Pro (primeras 20 preguntas) en la mejor de tres ejecuciones, frente a 16/20 del modelo original.
- **Tareas de agente**: completa 8 de 8 tareas de agente en las tres instancias evaluadas, lo que indica solidez en flujos multi-paso.
- **Generación de texto sin censura**: al ser una versión abliterated, no aplica los filtros de contenido del modelo original.
- **Capacidades multilingües**: soporta japonés e inglés según la ficha del autor.
- **Visión**: la cuantización incluye un componente de visión (vision 16), lo que sugiere que el modelo base tiene capacidades visuales, aunque no se ofrecen detalles.
- **Soporte de agentes**: las evaluaciones del autor indican un rendimiento de 8/8 en tareas de agente, lo que implica capacidad de razonamiento secuencial y posible uso de herramientas.

## Casos de uso

- **Agentes autónomos en producción**: el modelo logra 8/8 en tareas de agente y puede ejecutarse en GPUs de 16 GiB gracias a la cuantización EXL3. Es adecuado para pipelines de agentes que requieren múltiples pasos de razonamiento y decisiones secuenciales.
- **Razonamiento en dominios técnicos**: con un rendimiento en MMLU-Pro comparable al modelo original, puede usarse en sistemas de preguntas y respuestas técnicas en japonés e inglés.
- **Aplicaciones que requieren contenido sin censura**: al ser abliterated, resulta útil en escenarios donde se necesite generar contenido sin las restricciones habituales, siempre que se respete la licencia y la legalidad.
- **Inferencia con contexto largo**: gracias a la KV cache ligera (64 KiB por token en FP16), puede manejar contextos de hasta 1M tokens con 8 GPUs de 16 GiB, lo que es útil para análisis de documentos extensos o conversaciones largas.
- **Servicio multi-usuario**: con 6 streams concurrentes, el modelo alcanza 220.8 tok/s agregados, lo que lo hace viable para asistentes o chatbots con varios usuarios simultáneos.
- **Investigación en cuantización**: el autor documenta la variabilidad entre horneados (castings) de la misma receta, lo que permite estudiar el impacto de la cuantización en el rendimiento y la reproducibilidad.

## Benchmarks y rendimiento

Los benchmarks disponibles provienen de la model card del autor y son limitados (solo 20 preguntas de MMLU-Pro y 8 tareas de agente). No son concluyentes estadísticamente.

| Modelo | MMLU-Pro (primeras 20) | Agent tasks (8) | Decode 1 stream (tok/s) | Decode 6 streams (tok/s) |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 15 / 15 / 16 | 8/8 ×3 | 104.3 (BF16/vLLM) | 292.7 (4 streams) |
| Huihui-abliterated (este modelo) | 15 / 15 / 13 | 8/8 ×3 | 50.6 (EXL3) | 220.8 |
| Qwopus3.8-27B-Flash | 14 / 13 / 13 | 7/8 ×3 | 58.0 (EXL3) | no disponible |

El prefill del modelo EXL3 es de aproximadamente 1.440 tok/s, frente a 3.370 tok/s del modelo BF16 con vLLM. Con el modo MTP16 activado, el decode puede alcanzar 72-103 tok/s en contexto largo (32K), con una tasa de aceptación del 85-99%.

## Requisitos de hardware

- **VRAM estimada**: 11.3 GiB por GPU con 1M tokens de KV en FP16 (incluye 3.0 GiB de pesos). Con KV en 8 bits, se puede llegar hasta 2M tokens.
- **GPUs recomendadas**: 8× RTX PRO 2000 Blackwell 16 GiB (medición del autor), con TP=8. También puede ejecutarse en GPUs consumer de 16 GiB, como RTX 4090, gracias a la cuantización.
- **Despliegue**: ExLlamaV3 (v1.4.5) es el motor principal. Para más de 6 streams, el autor recomienda vLLM + BF16 + DFlash2 + KV fp8.
- **Latencia**: decode de 50.6 tok/s en un solo stream, 72-103 tok/s con MTP16, y 220.8 tok/s agregados con 6 streams (requiere `-ambs 8`).
- **Advertencia**: con 7 o más streams, la capa GDN puede volverse inestable y reducir el rendimiento 3-4×.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (MMLU-Pro 20) | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-EXL3-6.5bpw | 12.7B (safetensors) | no disponible | Apache-2.0 | 15/20 (mejor caso) | HuggingFace |
| Qwen3.8-27B (original) | 27B (según nombre) | no disponible | Apache-2.0 | 16/20 (mejor caso) | HuggingFace |
| Qwopus3.8-27B-Flash | 27B (según nombre) | no disponible | no disponible | 14/20 (mejor caso) | no disponible |

También existe una versión NVFP4 del mismo modelo base creada por el mismo autor: **Huihui-Qwen3.8-27B-abliterated-NVFP4**, pero no se proporcionan datos de rendimiento.

## Limitaciones y advertencias

- **Variabilidad de la cuantización**: el autor advierte que cada "horneado" (casting) con la misma receta produce resultados diferentes: las respuestas pueden variar en 2-5 preguntas de MMLU-Pro y el número de tokens generados puede multiplicarse por 3. No se debe considerar una sola cuantización como representativa de la calidad de la receta.
- **Riesgo de alucinación**: no se han realizado evaluaciones exhaustivas, por lo que el riesgo de alucinación en contextos abiertos no está cuantificado.
- **Limitaciones de idioma**: la ficha solo menciona japonés e inglés, aunque el modelo base podría soportar más idiomas.
- **Contenido sin censura**: al ser abliterated, el modelo puede generar contenido dañino o ilegal. El uso debe ajustarse a la legalidad y a las políticas de cada organización.
- **Inestabilidad con muchos streams**: a partir de 7 streams concurrentes, el rendimiento se degrada significativamente por problemas en la capa GDN con CUDA graphs.
- **Benchmarks limitados**: las evaluaciones se basan en 20 preguntas de MMLU-Pro y 8 tareas de agente, lo que no permite extraer conclusiones sólidas.
- **Discrepancia en parámetros**: el recuento de safetensors (12.7B) no coincide con el nombre del modelo (27B); se desconoce la causa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sakamakismile/Huihui-Qwen3.8-27B-abliterated-EXL3-6.5bpw
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Versión NVFP4 del mismo autor: https://huggingface.co/sakamakismile/Huihui-Qwen3.8-27B-abliterated-NVFP4
- Repositorio de mediciones y scripts (Lna-Lab): https://github.com/lna-lab
