# nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ

## Resumen

Qwen3.6-35B-A3B-W4A16-HGPTQ es una cuantización de precisión mixta (W4A16) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario nchapman bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresión que aplica GPTQ con descomposición de Cholesky, tamaño de grupo 64 y rotación Hadamard en línea sobre las entradas, una técnica inspirada en QuIP que reduce el error de cuantización en modelos MoE y en capas de atención lineal. El resultado ocupa 19,42 GiB en safetensors, un 6,1 % menos que la variante GPTQ convencional del mismo autor (g128-h0), manteniendo una fidelidad superior frente al modelo BF16 de referencia.

El modelo base es un transformer híbrido con mezcla de expertos (MoE) de 35.951.822.704 parámetros totales y arquitectura `qwen3_5_moe`, con capacidad image-text-to-text (visión integrada). El checkpoint cuantizado conserva en BF16 las proyecciones `linear_attn.in_proj_a/b`, las puertas del MoE, el experto compartido, los embeddings, el `lm_head`, el parche de visión y todas las normas y sesgos, mientras que cuantiza a 4 bits los 30.850 lineales de texto, los 772 del módulo MTP (Multi-Token Prediction) nativo y los 110 de visión.

Su relevancia es doble: por un lado, permite desplegar un MoE multimodal de 35B en GPUs de consumo o en nodos con VRAM limitada; por otro, documenta con detalle métricas de fidelidad (KL, perplejidad, acuerdo top-1) y parches concretos para vLLM V1, lo que lo convierte en una referencia útil para quienes trabajan en cuantización de modelos MoE con rotaciones Hadamard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (`qwen3_5_moe`), con atención lineal, MTP nativo y torre de visión |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ (group_size=64, actorder="static") con rotación Hadamard en línea; BF16 en capas seleccionadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 19,42 GiB |

## Arquitectura y entrenamiento

El modelo base combina atención estándar con capas de atención lineal (`linear_attn`), un diseño híbrido que reduce el coste computacional en secuencias largas. Incluye además un módulo nativo de predicción multi-token (MTP) con 772 lineales, pensado para decodificación especulativa, y una torre de visión con 110 lineales cuantizados. La cuantización se aplica con GPTQ de Cholesky y rotación Hadamard determinista (matriz de Sylvester, `randomize: false`) sobre la dimensión de entrada de las capas no expertas, de modo que los pesos se pre-rotan offline (`W' = W H_b / sqrt(b)`) y no se almacenan tensores de transformación adicionales.

La calibración de texto y MTP usó 999 muestras de 4096 tokens del dataset `nvidia/Nemotron-Cascade-2-SFT-Data`, fijado en `warp-3090-quant-lab-frozen-data`; la de visión empleó 64 imágenes de ChartQA y TextVQA disjuntas del conjunto de evaluación de 48 imágenes. Los 31.488 lineales de expertos enrutados del MoE se cuantizan sin rotación para poder ejecutarse directamente en el kernel fusionado `MarlinMoE` de vLLM V1. El autor no documenta el entrenamiento original del modelo base (número de tokens, composición del dataset ni si hubo RLHF/DPO); esa información corresponde a Qwen y no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida (`chat_template.jinja`, versión v22.5 de froggeric).
- Razonamiento y matemáticas: el modelo base Qwen3.6 está orientado a tareas de razonamiento, aunque no se aportan benchmarks específicos en esta ficha.
- Generación de código: capacidad heredada del modelo base; no se documentan evaluaciones concretas.
- Visión image-text-to-text: procesa imágenes y responde preguntas sobre ellas (ChartQA, TextVQA en la calibración y evaluación).
- Predicción multi-token (MTP) nativa, útil para decodificación especulativa y aceleración de inferencia.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un MoE multimodal de 35B en una sola GPU de 24 GB: con 19,42 GiB de pesos y capas en BF16, el checkpoint cabe en tarjetas como RTX 4090 o L40S, permitiendo servir texto e imagen sin infraestructura multi-GPU.
- Análisis de documentos con gráficos y tablas: la torre de visión cuantizada conserva un 96,82 % de acuerdo top-1 en respuestas end-to-end y un 100 % en ChartQA, lo que lo hace adecuado para extracción de datos de informes y paneles.
- Asistentes conversacionales de atención al cliente: la plantilla de chat incluida y la generación multi-turno permiten integrarlo en backends de chat; la ventana de contexto debe consultarse en la ficha del modelo base, ya que no se especifica aquí.
- Aceleración de inferencia con decodificación especulativa: el módulo MTP cuantizado (95,93 % de acuerdo top-1 aislado) puede usarse como cabezal de borrador para reducir la latencia en servidores vLLM.
- Investigación en cuantización: las métricas de KL, perplejidad y acuerdo top-1 publicadas, junto con el recetario `warp-3090-model-lab`, sirven como referencia reproducible para experimentos con rotaciones Hadamard en MoE.
- Prototipado en estaciones de trabajo con una sola GPU: al mantenerse en BF16 las capas sensibles (embeddings, `lm_head`, normas), se preserva estabilidad numérica en tareas de generación larga sin necesidad de clústeres.
- Evaluación comparativa de variantes GPTQ: permite contrastar la receta HGPTQ frente a la GPTQ convencional (`g128-h0`) en el mismo hardware, con una mejora documentada de −0,41 pp en la variación de perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al modelo BF16 y frente a la variante GPTQ convencional:

| Metrica | GPTQ g128-h0 | HGPTQ (este repo) | Cambio |
|---|---:|---:|---:|
| Payload safetensors | 20,678 GiB | 19,419 GiB | −6,1 % |
| `probe-v4` weightedKL (legacy) | 0,111 | 0,076917 | −30,7 % |
| `probe-v4` KL medio por token / p99,9 | 0,269 / 18,06 | 0,230016 / 17,2924 | −14,5 % KL medio |
| PPL Δ% vs BF16 (4,0230) | +1,33 % | +0,924 % (4,0601) | −0,41 pp |
| MTP aislado KL / acuerdo top-1 | — | 0,011587 / 95,93 % | — |
| MTP end-to-end KL / acuerdo top-1 | — | 0,122539 / 89,17 % | — |
| Visión ViT Rel-RMSE / coseno | — | 0,2157 / 0,9802 | — |
| Visión respuesta aislada KL / top-1 | — | 0,021799 / 97,45 % | — |
| Visión end-to-end KL / top-1 | — | 0,052438 / 96,82 % | — |

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 19,42 GiB; con overhead de activaciones y caché KV, se recomienda un mínimo de 24 GB para texto e imagen en precisión W4A16.
- GPU recomendadas: RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) y H100 (80 GB) para mayor throughput y contextos largos.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB), siempre que se limite el tamaño de lote y la longitud de contexto.
- Opciones de despliegue: vLLM V1 (v0.31.0) es el backend documentado; para visión requiere dos ajustes en `compressed_tensors/transform/linear.py`. También es compatible con `transformers` y `compressed-tensors`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---:|---|---|---|
| Qwen3.6-35B-A3B-W4A16-HGPTQ (este) | 35,95B | no disponible | W4A16 GPTQ + Hadamard | Apache 2.0 | 19,42 GiB, métricas de fidelidad publicadas |
| Qwen3.6-35B-A3B-W4A16-GPTQ (nchapman) | 35,95B | no disponible | W4A16 GPTQ g128 | Apache 2.0 | 20,68 GiB, PPL Δ +1,33 % |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35,95B | no disponible | BF16 | Apache 2.0 | Referencia de calidad, ~72 GB en BF16 |

## Limitaciones y advertencias

- Al ser una cuantización a 4 bits, introduce degradación numérica: la perplejidad sube un 0,924 % frente a BF16 y el acuerdo top-1 del MTP end-to-end baja al 89,17 %.
- El soporte para visión en vLLM V1 requiere aplicar manualmente dos parches al código de `compressed-tensors`; sin ellos, las capas de visión rotadas no cargan correctamente.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni cobertura idiomática; deben evaluarse en el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el artefacto cuantizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.
- El modelo base Qwen3.6-35B-A3B no está descrito en detalle en la información disponible (contexto, datos de entrenamiento, idiomas), lo que limita la evaluación de riesgos en producción.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ
- Variante GPTQ convencional: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Recetario y herramientas: https://github.com/nchapman/warp-3090-model-lab
- Dataset de calibración fijado: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Dataset de calibración original: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Plantillas de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Ficha en free2aitools: https://free2aitools.com/model/nchapman/qwen3.6-35b-a3b-w4a16-gptq
