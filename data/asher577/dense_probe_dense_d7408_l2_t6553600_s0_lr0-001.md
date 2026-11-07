# asher577/dense_probe_dense_d7408_L2_t6553600_s0_lr0.001

## Resumen

`dense_probe_dense_d7408_L2_t6553600_s0_lr0.001` es un transformer de 2 capas con dimensión de modelo 7408, entrenado por Asher Parker-Sartori (usuario `asher577` en Hugging Face) siguiendo el procedimiento descrito por Gao et al. (2025) para el estudio de transformers con dispersión de pesos. Se trata de un modelo de investigación, no de un modelo de propósito general: su función es servir como referencia densa (sin dispersión) dentro de una familia de experimentos de escalado sobre dispersión estructural.

El modelo se entrena sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`, un corpus sintético de historias simples con vocabulario reducido (4096 tokens). El entrenamiento consume 6.553.600 tokens y una longitud de contexto de 512 tokens, lo que lo sitúa como una sonda (probe) de bajo coste para comparar arquitecturas y regímenes de dispersión, no como un modelo desplegable en producción.

La relevancia es metodológica: forma parte de una serie de runs de escalado (`scd_scaling` en Weights & Biases) que incluye variantes con dispersión de pesos activada (`scaling_probe_dcp_d3072_L2_t6553600_s0`) y desactivada. Este checkpoint concreto, con `Weight Sparsity: False`, es el control denso contra el que se miden los efectos de la dispersión sobre pérdida, convergencia y capacidad efectiva a distintos tamaños de dimensión de modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (2 capas, weight-sparse según Gao et al. 2025; esta variante densa) |
| Parámetros totales | no disponible (estimable en el orden de ~10^8 a partir de d=7408, 2 capas y vocab=4096, pero no confirmado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (pesos en `pytorch_model.bin`, sin GGUF ni safetensors publicados) |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, corpus sintético en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `config.json` |

## Arquitectura y entrenamiento

Transformer de 2 capas con dimensión de modelo 7408, dimensión de cabeza 16 y vocabulario de 4096 tokens. La dimensión de cabeza implica 7408/16 = 463 cabezas de atención por capa, una configuración inusual propia de experimentos de escalado de anchura más que de profundidad. El modelo se entrena con el procedimiento de Gao et al. (2025) para transformers con dispersión de pesos; en este checkpoint la dispersión está desactivada (`Weight Sparsity: False`, `Activation Sparsity: False`), con un objetivo de fracción L0 de 0,01 registrado pero no aplicado, lo que lo convierte en la línea base densa.

El entrenamiento usa 6.553.600 tokens del dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`. No se documenta composición detallada del dataset, uso de RLHF/DPO ni técnicas de decodificación especulativa. El run está registrado en Weights & Biases (`scd_scaling`, run `p1n7sdax`), lo que sugiere que el objetivo principal es la trazabilidad de curvas de pérdida y comparaciones de escalado más que la calidad final del modelo.

## Capacidades

- Generación de texto a nivel de token sobre vocabulario restringido (4096 tokens) y contexto de 512 tokens.
- Modelado de lenguaje autorregresivo sobre historias sintéticas simples (SimpleStories).
- Servir como baseline denso para comparar contra variantes con dispersión de pesos en experimentos de escalado.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe no disponible; el corpus de entrenamiento es sintético y en inglés.
- No se documentan capacidades de razonamiento multi-paso, matemáticas o código.

## Casos de uso

- Estudio de escalado de anchura en transformers: comparar la curva de pérdida de este checkpoint denso (d=7408, L=2) contra variantes con dispersión de pesos para aislar el efecto de la dispersión.
- Reproducción de experimentos de Gao et al. (2025): usar este checkpoint como control denso en una réplica del procedimiento de entrenamiento con dispersión estructural.
- Investigación sobre eficiencia de parámetros: analizar cómo se comporta un modelo con dimensión de modelo muy alta y solo 2 capas en un corpus de vocabulario pequeño.
- Validación de pipelines de entrenamiento: al ser un run pequeño (6,5M tokens), sirve para depurar código de entrenamiento, logging en W&B y carga de checkpoints antes de lanzar runs mayores.
- Análisis de representaciones internas: extraer activaciones de un transformer de 2 capas para estudiar circuitos y features en modelos pequeños.
- Docencia y divulgación: ilustrar conceptos de dispersión de pesos, fracción L0 y escalado con un modelo de coste computacional bajo.
- No es adecuado para atención al cliente, generación de código en producción, agentes ni ninguna aplicación de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,5 GB en `pytorch_model.bin`; la carga en FP32 requiere en torno a 5,5 GB de VRAM más overhead de activaciones, por lo que cabe en GPUs consumer con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; A100/H100 no son necesarias para inferencia, solo para reproducir el entrenamiento a mayor escala.
- Cabe en consumer GPU: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090.
- Opciones de despliegue: carga directa con `torch.load` y la clase `SparseGPT` del repo; no hay pesos GGUF, por lo que llama.cpp y Ollama no están disponibles sin conversión manual. vLLM y TGI no están documentados para esta arquitectura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Capas | Dimensión | Contexto | Dispersión de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dense_probe_dense_d7408_L2_t6553600_s0_lr0.001` (este) | 2 | 7408 | 512 | No | no disponible | Hugging Face |
| `asher577/scaling_probe_dcp_d3072_L2_t6553600_s0` | 2 | 3072 | 512 | Sí (`Weight Sparsity: True`, `Activation Sparsity: True`) | no disponible | Hugging Face |
| `asher577/dcpbeta325_dcploss_advkl_l0_0.05_actsp0.2_fixedp0.4_mlpguard` | no disponible | no disponible | no disponible | Configuración DCP con L0 0,05 y dispersión de activaciones 0,2 | no disponible | Hugging Face |

La comparación directa más relevante es con `scaling_probe_dcp_d3072_L2_t6553600_s0`, que comparte procedimiento, dataset, tokenizador y presupuesto de tokens (6.553.600) pero difiere en dimensión (3072 frente a 7408) y en que activa dispersión de pesos y de activaciones. No se dispone de benchmarks públicos para ninguno de los tres.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de usuario final.
- Contexto muy corto (512 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Vocabulario reducido (4096 tokens) y corpus sintético (SimpleStories), lo que limita severamente la cobertura lingüística y la generalización fuera de dominio.
- Solo 2 capas: capacidad de razonamiento y composición muy limitada en comparación con transformers profundos.
- Licencia no especificada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier uso fuera de investigación.
- Riesgo de alucinación y salidas incoherentes fuera del dominio de entrenamiento, dado el tamaño y el corpus.
- Requiere la clase `SparseGPT` del repo para cargar el `state_dict`, lo que complica la integración con frameworks estándar.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez.
- Los datos de parámetros totales no están confirmados; cualquier estimación debe tratarse como aproximada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/dense_probe_dense_d7408_L2_t6553600_s0_lr0.001
- Perfil del autor: https://huggingface.co/asher577
- Run de Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/p1n7sdax
- Variante con dispersión de pesos: https://huggingface.co/asher577/scaling_probe_dcp_d3072_L2_t6553600_s0
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M
