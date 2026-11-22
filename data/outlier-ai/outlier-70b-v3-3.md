# Outlier-Ai/Outlier-70B-V3.3

## Resumen

Outlier-70B-V3.3 es un checkpoint de investigación publicado por Outlier-Ai, construido como un adaptador (overlay) sobre Qwen/Qwen2.5-32B-Instruct. A pesar del "70B" en el nombre, el modelo base real es de 32B parámetros y la arquitectura declarada es un mixture-of-experts (MoE) con pesos ternarios cuantizados, orientado a inferencia local y eficiencia energética en Apple Silicon. La model card lo describe explícitamente como un artefacto de investigación de una línea anterior del producto Outlier, no recomendado para producción.

El modelo resuelve el problema de ejecutar razonamiento y generación de texto de calidad en hardware de consumo (Macs) mediante una combinación de sparsity MoE, cuantización ternaria y overlays sobre un modelo denso ya entrenado. Es relevante ahora como referencia histórica de la línea Outlier y como ejemplo de técnicas de compresión agresiva, pero el propio autor indica que ha sido sustituido por la lineup v1.8 (Nano 4B, Core 27B, Vision 35B-A3B).

La información técnica disponible es escasa: el repo tiene 0.0 GB, la model card no detalla número de tokens de entrenamiento, composición del dataset ni proceso de alineación, y solo se declara un resultado de benchmark (MMLU 5-shot = 83.1, no verificado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con pesos ternarios cuantizados, construida como overlay sobre Qwen2.5-32B-Instruct |
| Parametros totales | 70B (según denominación del autor; no disponible el desglose exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-32B-Instruct, no confirmada en la card) |
| Tipos de cuantizacion | Ternaria (ternary); variantes MLX-4bit en la lineup sucesora, no confirmadas para este checkpoint |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; se infiere safetensors/MLX por la línea Outlier, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura declarada es un mixture-of-experts con pesos ternarios y cuantización agresiva, implementada como un overlay o adaptador sobre Qwen/Qwen2.5-32B-Instruct (relación `base_model_relation: adapter`). El autor la etiqueta como "sparse", "ternary", "quantized" y "energy-efficient", con foco en Apple Silicon y edge AI. No se especifica el número de expertos, el ratio de activación, el mecanismo de routing ni la innovación concreta de atención.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni proceso de destilación. La model card advierte que "cualquier afirmación técnica en revisiones anteriores de esta card debe considerarse provisional" y que el checkpoint puede contener adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto. El resultado MMLU 5-shot de 83.1 procede de experimentos internos, no de las pruebas de release del autor.

## Capacidades

- Generación de texto y razonamiento multi-paso, con ejemplos en la card de problemas matemáticos, lógica tipo grid y problemas de palabras.
- Razonamiento matemático básico y resolución de acertijos lógicos (widgets, trenes, asignación de mascotas).
- Soporte multilingüe declarado en 15 idiomas (en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl).
- Orientación a inferencia local y on-device en Apple Silicon (etiquetas `apple-silicon`, `mac`, `local-llm`, `edge-ai`).
- Capacidad de tool calling / function calling: no disponible (no declarada en la card).
- Soporte de agentes y multi-step reasoning: no disponible como capacidad formal; solo se muestran ejemplos de razonamiento paso a paso.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Evaluación de técnicas de cuantización ternaria: sirve como banco de pruebas para investigar cómo afecta la ternarización a un modelo denso de 32B en tareas de razonamiento, comparando el MMLU declarado con el del base.
- Inferencia local en Mac para prototipos: al estar orientado a Apple Silicon y eficiencia energética, permite experimentar con un MoE "70B" en hardware de consumo sin GPU dedicada.
- Reproducibilidad de investigación: el repo se conserva explícitamente para reproducir resultados históricos de la línea Outlier, útil para papers o auditorías de técnicas de compresión.
- Razonamiento lógico y matemático en entornos educativos offline: los ejemplos de la card (problemas de palabras, grids lógicos) encajan en asistentes de estudio sin conexión.
- Procesamiento multilingüe ligero: con 15 idiomas declarados, puede usarse para traducción o generación en lenguas europeas y asiáticas en despliegues edge.
- Base para fine-tuning experimental: al ser un adaptador sobre Qwen2.5-32B-Instruct con licencia Apache 2.0, se puede reutilizar como punto de partida para investigación de overlays.

## Benchmarks y rendimiento

| Benchmark | Métrica | Outlier-70B-V3.3 | Notas |
|---|---|---|---|
| MMLU | Accuracy 5-shot | 83.1 | No verificado (`verified: false`), dato declarado por el autor |

No se han publicado otros resultados de benchmarks en la información disponible. No hay datos de HumanEval, GSM8K, throughput ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un MoE ternario sobre un base de 32B, la huella dependería del número de parámetros activos y del esquema de cuantización, datos no publicados.
- GPU recomendadas: no disponible. La card apunta a Apple Silicon (Mac) como plataforma objetivo, no a GPUs NVIDIA.
- ¿Cabe en consumer GPU? No confirmado. Las etiquetas `on-device`, `edge-ai` y `apple-silicon` sugieren despliegue en Macs, pero no se especifica el modelo de chip ni la memoria unificada mínima.
- Opciones de despliegue: `transformers` (librería declarada) y ecosistema MLX por la línea Outlier; vLLM, llama.cpp, Ollama o TGI no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-70B-V3.3 | 70B (MoE ternario sobre base 32B) | no disponible | 83.1 (5-shot, no verificado) | Apache 2.0 | HF, research artifact |
| Qwen2.5-32B-Instruct (base) | 32B denso | 128K (según Qwen) | no disponible en esta ficha | Apache 2.0 | HF |
| Outlier Core 27B (sucesor) | 27B | no disponible | no disponible | no disponible | HF (MLX-4bit) |
| Outlier Nano 4B (sucesor) | 4B | no disponible | no disponible | no disponible | HF (MLX-4bit) |

La comparativa con el base Qwen2.5-32B-Instruct es la más directa: Outlier-70B-V3.3 se presenta como un overlay ternario sobre ese modelo, por lo que su calidad debería interpretarse en relación con el base, no como un modelo entrenado desde cero.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor indica explícitamente que no se distribuye en la app Outlier y que los números provienen de experimentos internos, no de pruebas de release.
- Modelo obsoleto: la card lo marca como "superseded" y recomienda la lineup v1.8 (Nano 4B, Core 27B, Vision 35B-A3B).
- El nombre "70B" no coincide con el tamaño real del base (32B); el desglose de parámetros totales y activos no está disponible.
- Riesgo de alucinación: no cuantificado; al ser un modelo de razonamiento sin datos de alineación publicados, no hay garantías sobre fidelidad factual.
- Sesgos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: la longitud de contexto no está confirmada; los 15 idiomas son una declaración del autor sin evaluación publicada.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación no recomendado para producción, el uso comercial conlleva riesgo técnico no evaluado.
- El repo tiene 0.0 GB, lo que puede indicar pesos no alojados o eliminados; verificar disponibilidad antes de integrar.
- Los enlaces de la búsqueda web (outlier.org, outlier.bet, outlier.com) no corresponden al autor del modelo y no deben tomarse como documentación.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-70B-V3.3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Sucesor Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Sucesor Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Sucesor Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX-4bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX-4bit): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del autor: https://outlier.host/
