# dvader13/smollm3-3b-sft-1p70t

## Resumen

El modelo `dvader13/smollm3-3b-sft-1p70t` es un conjunto de checkpoints de supervisión fina (SFT) sobre el modelo base SmolLM3-3B, publicado por el usuario dvader13 en HuggingFace. El nombre indica que el pretraining del modelo base se realizó con 1,70 billones de tokens (rung `1.70T`), y el repositorio contiene diez fracciones de dosis del proceso de SFT, desde `checkpoint_pct010` hasta `checkpoint_pct100`, en formato bf16 y solo para inferencia (sin estado de optimizador).

Este modelo es relevante para desarrolladores e investigadores que quieren estudiar el efecto de la cantidad de datos de fine-tuning sobre el rendimiento de un modelo pequeño, o que necesitan un modelo de 3B parámetros con licencia Apache-2.0 para aplicaciones comerciales. Al ser un conjunto de checkpoints progresivos, permite analizar cómo evoluciona la calidad del modelo con más pasos de SFT, algo poco común en publicaciones habituales.

La arquitectura subyacente es la de SmolLM3-3B, un modelo decoder-only transformer con atención lineal (linear attention) y soporte de contexto de hasta 128K tokens, aunque en esta ficha no se proporcionan detalles específicos del entrenamiento SFT (datasets, hiperparámetros, etc.).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención lineal (SmolLM3-3B) |
| Parámetros totales | 3B (según el modelo base SmolLM3-3B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (heredado del base SmolLM3-3B) |
| Tipos de cuantización | bf16 (checkpoints originales); se pueden cuantizar a GGUF, AWQ, etc. |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (checkpoints en bf16) |

## Arquitectura y entrenamiento

El modelo base es SmolLM3-3B, un transformer decoder-only con atención lineal (linear attention) que reduce la complejidad computacional respecto a la atención softmax tradicional, permitiendo manejar contextos largos de hasta 128K tokens. El pretraining del base se realizó con 11 billones de tokens de texto general, y el rung de 1,70 billones de tokens corresponde a una fase intermedia del entrenamiento (mid-training).

Los checkpoints de este repositorio son el resultado de aplicar SFT (Supervised Fine-Tuning) sobre ese base, con 10 fracciones de dosis que representan el progreso del entrenamiento (10%, 20%, ..., 100%). No se especifican los datasets de instrucción utilizados ni el número de pasos, pero el proceso sigue el enfoque del SmolLM3 SFT Journey, que usa datasets curados como SmolTalk2 y técnicas de alineación de preferencias posteriores (APO, DPO). El repositorio solo contiene los checkpoints de inferencia, sin estado del optimizador, lo que facilita su uso directo.

## Capacidades

- Generación de texto y razonamiento básico, heredado del modelo base SmolLM3-3B.
- Soporte de contexto largo (128K tokens) gracias a la atención lineal.
- Capacidades de instrucción mejoradas por el SFT (seguimiento de prompts, respuestas estructuradas).
- No se ha confirmado soporte de tool calling, function calling o modo agente en la información proporcionada.
- Soporte multilingüe: el modelo base SmolLM3-3B soporta seis idiomas (inglés, francés, alemán, español, portugués e italiano), pero no se confirma en esta ficha.

## Casos de uso

- **Investigación en fine-tuning**: los 10 checkpoints permiten estudiar cómo varía la calidad del modelo con más datos de SFT, ideal para papers o experimentos de ablación.
- **Aplicaciones de producción con contexto largo**: con 128K tokens de contexto, es adecuado para resumir documentos extensos, análisis de logs o conversaciones multi-turno muy largas.
- **Prototipado rápido**: al ser un modelo de 3B, puede desplegarse en GPUs de consumo para pruebas de concepto en chatbots o asistentes.
- **Desarrollo de agentes de bajo coste**: aunque no se confirma tool calling, se puede integrar con frameworks como LangChain o LlamaIndex para tareas simples de razonamiento.
- **Traducción y generación multilingüe**: si el SFT mantiene las capacidades del base, puede usarse para tareas de generación en los seis idiomas soportados.
- **Benchmarking de fine-tuning**: sirve como punto de referencia para comparar estrategias de SFT con otros modelos de 3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros. Se recomienda evaluar el modelo en los casos de uso concretos antes de producción.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 6-8 GB (modelo de 3B en bf16 con contexto de 128K requiere más VRAM según la longitud de la secuencia; para contextos largos puede superar los 16 GB).
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En consumer, una RTX 3080/3090 puede funcionar con cuantización.
- Si cabe en consumer GPU: sí, con cuantización (GGUF en 4-bit o 8-bit) en una RTX 3060 12GB o superior.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Inference Endpoints. Para los checkpoints en bf16, se puede cargar con transformers.
- Latencia y throughput: no disponible; depende del hardware y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| dv4der13/smollm3-1p70t | 3B | 128K | Apache-2.0 | Checkpoints SFT progresivos |
| HuggingFaceTB/SmolLM3-3B | 3B | 128K | Apache-2.0 | Modelo base + instrucción |
| Qwen2.5-3B | 3B | 32K | Apache-2.0 | Alternativa con 32K contexto |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 Community License | Alternativa comercial restringida |

Nota: la comparativa se basa en las especificaciones públicas de los modelos base, no en benchmarks disponibles para este repositorio.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en la información proporcionada; el rendimiento real es desconocido.
- No se especifican los datos de SFT (datasets, hiperparámetros), por lo que no se puede evaluar la calidad del fine-tuning.
- El modelo puede heredar sesgos y limitaciones del base SmolLM3-3B, como alucinaciones en tareas de razonamiento complejo o desconocimiento de hechos actuales.
- La licencia Apache-2.0 permite uso comercial, pero hay que verificar que los checkpoints no incluyan restricciones adicionales no declaradas.
- El repositorio tiene 61.5 GB, lo que implica descargar 10 checkpoints; para uso práctico, conviene seleccionar solo una fracción (por ejemplo, `checkpoint_pct100`).
- No se confirma soporte de tool calling ni capacidades de agente, por lo que su uso en pipelines de agentes requiere integraciones externas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dv4der13/smollm3-1b70t
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Guía de SFT del SmolLM3 (curso): https://huggingface.co/learn/smol-course/unit1/3
- Recetas de alineamiento para SmolLM3: https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm3
