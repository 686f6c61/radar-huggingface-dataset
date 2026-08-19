# jfan/Qwen3.8-27B-heretic-dflash

## Resumen

`jfan/Qwen3.8-27B-heretic-dflash` es un modelo auxiliar de **decodificación especulativa** tipo DFlash (Block Diffusion Speculative Drafter) desarrollado por el usuario `jfan` como componente de aceleración para el modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara`, una variante de Qwen3 con 27 000 millones de parámetros y arquitectura transformer densa. El drafter genera bloques de 16 tokens en paralelo a partir de características profundas extraídas del modelo objetivo, lo que promete multiplicar por 2,5–3,5 la velocidad de decodificación en un solo paso de verificación.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato MLX y safetensors, y está diseñado para integrarse en entornos de inferencia de alto rendimiento como vLLM, SGLang y MLX. Es importante señalar que, según la propia model card, **el modelo se encuentra aún en fase de entrenamiento y actualmente no mejora el rendimiento** del modelo base, por lo que su uso en producción debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 5 capas (DFlash speculative drafter) |
| Parametros totales | 1.730.213.120 (según safetensors; la model card indica 461M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base, Qwen3.8-27B con 262K tokens) |
| Tipos de cuantizacion | No disponible (pesos en MLX y safetensors; el entrenamiento usó NF4 para el modelo base) |
| Idiomas soportados | No disponibles (el drafter no procesa idiomas directamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

El drafter sigue la arquitectura DFlash descrita en el paper *DFlash: Block Diffusion for Speculative Decoding* (arXiv:2602.06036). Consta de 5 capas transformer decoder con hidden size de 5120, intermediate size de 17408 (MLP SwiGLU), 32 cabezas de atención Q y 8 cabezas KV (GQA 4:1), y head dimension de 128. Genera bloques de 16 tokens en paralelo, condicionados por características extraídas de las capas `[1, 16, 31, 46, 61]` del modelo base (5 capas uniformemente espaciadas), que se concatenan (5 × 5120 = 25600 dimensiones) y se proyectan mediante una capa lineal `Linear(25600, 5120, bias=False)`.

El entrenamiento se realizó en dos fases sobre una NVIDIA GeForce RTX 3090 (24 GB VRAM). En la fase 1, el modelo base se cargó en cuantización NF4 (16,45 GB VRAM) y se extrajeron representaciones ocultas de 10 000 secuencias de 1024 tokens, guardadas en shards en disco. En la fase 2, el drafter (461M parámetros según la card) se optimizó durante 10 000 pasos con AdamW8bit (lr=2×10⁻⁴, weight decay=0,01) usando un footprint de 7,96 GB VRAM. El dataset de entrenamiento combina Magicoder-OSS-Instruct-75K (45%, código políglota en C++, Rust, Python, Go y TypeScript), glaive-function-calling-v2 (25%, llamadas a funciones y JSON estructurado) y ultrachat_200k (30%, diálogo multi-turno y razonamiento).

## Capacidades

- **Decodificación especulativa**: genera bloques de 16 tokens en paralelo, verificados en un solo paso forward del modelo base.
- **Aceleración de inferencia**: promete 2,5×–3,5× de speedup en decodificación, aunque la model card advierte que actualmente no mejora el rendimiento real.
- **Integración con frameworks**: compatible con vLLM, SGLang y MLX-VLM para servidores de alta throughput.
- **Especialización en código y tool calling**: entrenado con datasets de código y function calling, lo que lo hace adecuado para tareas de generación de código y agentes.
- **Sin capacidades autónomas**: no es un modelo de generación completo; solo actúa como drafter del modelo base.

## Casos de uso

- **Aceleración de servidores de inferencia con vLLM**: el drafter puede montarse como modelo especulativo (`--speculative-model`) junto al modelo base para reducir la latencia en despliegues de API OpenAI-compatible, especialmente útil en cargas de trabajo con muchas peticiones concurrentes.
- **Despliegue en Apple Silicon con MLX**: mediante `mlx_vlm.server` con el flag `--draft-model`, se puede acelerar la generación en Macs con chip M-series, aprovechando la eficiencia del formato MLX.
- **Serving con SGLang**: integración nativa con `--speculative-draft-model-path` para entornos que ya usan SGLang como backend de inferencia.
- **Optimización de pipelines de generación de código**: al estar entrenado con Magicoder-OSS-Instruct, el drafter puede mejorar la velocidad de generación de código en entornos de desarrollo asistido por IA.
- **Agentes con function calling**: su entrenamiento con glaive-function-calling-v2 lo hace adecuado para acelerar agentes que realizan múltiples llamadas a herramientas en secuencia.
- **Investigación en decodificación especulativa**: sirve como referencia para estudiar la arquitectura DFlash y comparar con otros drafters como EAGLE o Medusa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un speedup teórico de 2,5×–3,5× en decodificación, pero advierte explícitamente que el modelo está en entrenamiento y no mejora el rendimiento actualmente. No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks para este drafter.

## Requisitos de hardware

- **VRAM para el drafter**: el archivo safetensors pesa 1,73 GB en FP32, por lo que en cuantización FP16 ocuparía ~0,9 GB y en FP8 ~0,45 GB. Cabe en cualquier GPU con más de 2 GB VRAM.
- **VRAM para el conjunto completo**: el modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara` requiere ~54 GB en FP16, ~27 GB en FP8 o ~14 GB en NF4. El drafter añade una pequeña fracción.
- **GPU recomendadas**: para el conjunto, se necesitan GPUs con 24 GB o más (RTX 3090/4090, A100, H100) en cuantización ligera; en FP16 se requieren 2×A100 o 1×H100.
- **Compatibilidad con consumer GPU**: el drafter solo cabe en cualquier GPU consumer, pero el modelo base no es viable en GPUs de 8 GB; en una RTX 4090 (24 GB) se puede ejecutar el base en FP8 o NF4.
- **Opciones de despliegue**: vLLM, SGLang, MLX-VLM, llama.cpp (si se convierte a GGUF, aunque no se proporciona).
- **Latencia y throughput**: no disponibles; el speedup esperado es 2,5×–3,5×, pero no verificado en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jfan/Qwen3.8-27B-heretic-dflash | 1,73B (safetensors) | No disponible | DFlash drafter | Apache 2.0 | HuggingFace |
| EAGLE (drafters para LLM) | Variable (tipicamente <1B) | Depende del base | Autoregressive drafter | MIT | HuggingFace |
| Medusa (drafters para LLM) | Variable (tipicamente <1B) | Depende del base | Multiple heads | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos drafters. La principal diferencia es que DFlash genera bloques de 16 tokens en paralelo, mientras que EAGLE y Medusa generan token a token o con cabezas múltiples. La licencia Apache 2.0 del drafter es más permisiva que algunas alternativas.

## Limitaciones y advertencias

- **Modelo en entrenamiento**: la model card indica explícitamente que "aún está en entrenamiento y no mejora el rendimiento actualmente". No debe usarse en producción sin verificación previa.
- **Dependencia del modelo base**: el drafter está entrenado específicamente para `trohrbaugh/Qwen3.8-27B-heretic-ara`; no funcionará correctamente con otros modelos.
- **Discrepancia de parámetros**: la model card afirma 461M parámetros, pero el archivo safetensors muestra 1,73B. Esta inconsistencia debe resolverse antes de confiar en las especificaciones.
- **Sesgos del dataset de entrenamiento**: los datos provienen de Magicoder, Glaive y Ultrachat, que pueden contener sesgos de código y lenguaje; el drafter hereda estos sesgos en sus predicciones.
- **Riesgo de alucinación**: como drafter, puede generar tokens incorrectos que el modelo base debe rechazar; si el modelo base no los detecta, pueden propagarse errores.
- **Sin benchmarks publicados**: no hay evidencia empírica de la mejora de rendimiento prometida.
- **Restricciones de uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara` debe verificarse también (probablemente Apache 2.0, pero no confirmado).

## Enlaces

- [HuggingFace - jfan/Qwen3.8-27B-heretic-dflash](https://huggingface.co/jfan/Qwen3.8-27B-heretic-dflash)
- [Modelo base - trohrbaugh/Qwen3.8-27B-heretic-ara](https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara)
- [Paper DFlash - arXiv:2602.06036](https://arxiv.org/abs/2602.06036)
- [Dataset Magicoder-OSS-Instruct-75K](https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K)
- [Dataset glaive-function-calling-v2](https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2)
- [Dataset ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)
