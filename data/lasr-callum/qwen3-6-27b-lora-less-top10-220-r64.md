# LASR-Callum/qwen3.6-27b-lora-less-top10-220-r64

## Resumen

El modelo `LASR-Callum/qwen3.6-27b-lora-less-top10-220-r64` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por LASR-Callum sobre el modelo base Qwen/Qwen3.6-27B de Alibaba. Forma parte de un experimento de selección de datos basado en LESS (Least Error-based Selection Strategy), donde se entrenó únicamente con las 220 filas de mayor influencia (top 10%) de un conjunto de datos de "consejo difícil" (difficult-advice). El objetivo es estudiar cómo la selección de datos afecta al rendimiento del modelo en comparación con un "brazo de control" que usó 220 filas aleatorias.

El adaptador tiene un tamaño de 1.3 GB en formato safetensors y está diseñado para ser cargado sobre el modelo base de 27B parámetros. El experimento se ejecutó en un pod con una GPU por brazo, garantizando que ambos brazos comparten la misma descarga del modelo base y que cualquier diferencia en el rendimiento sea atribuible exclusivamente a la selección de datos. Este modelo es relevante para la comunidad de investigación en eficiencia de datos y ajuste fino de modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-27B (transformer denso multimodal con atención híbrida gated delta networks) |
| Parametros totales | Modelo base: 27B; adaptador: no disponible (repo de 1.3 GB en safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K (modelo base); entrenamiento del adaptador con max_seq_len=8192 |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta cuantizaciones (GGUF, AWQ, etc.) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT LoRA) + tokenizer + training_meta.json |

## Arquitectura y entrenamiento

El adaptador se entrena con la configuración: r=64, alpha=128, dropout=0.05, learning rate 1e-4, batch size 1 con grad_accum=16, 4 épocas, y max_seq_len=8192. El entrenamiento se realiza con `thinking: true` (modo de razonamiento activado). El dataset de entrenamiento es `LASR-Callum/2026-08-19-less-top10-difficult-advice-220-train`, que contiene las 220 filas de mayor influencia según LESS score_max de un pool de datos de "consejo difícil". El adaptador se genera mediante PEFT (Parameter-Efficient Fine-Tuning) y se sube a HuggingFace con metadatos de procedencia que incluyen el commit de GitHub del código fuente.

El experimento sigue un diseño de "brazos" (arms): el brazo LESS (este modelo) y un brazo de control aleatorio (`LASR-Callum/qwen3.6-27b-lora-random220-control-r64`). Ambos comparten todos los hiperparámetros y el protocolo de entrenamiento, diferenciándose únicamente en las 220 filas de datos vistas. Esto permite aislar el efecto de la selección de datos en el rendimiento final.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.6-27B.
- Soporte multimodal (visión) según las especificaciones del modelo base.
- Tool calling y function calling, útil para integración en agentes.
- Capacidades de agente y razonamiento multi-paso (thinking mode activado durante el entrenamiento).
- Especialización en "consejo difícil" (difficult-advice) gracias al ajuste fino con datos seleccionados por LESS.
- Multilingüismo probablemente heredado del modelo base, aunque no se especifica en la documentación.

## Casos de uso

- Investigación en selección de datos: permite comparar el efecto de LESS frente a selección aleatoria en el rendimiento de un modelo, siendo un recurso valioso para estudios de eficiencia de datos.
- Ajuste fino para tareas de asesoramiento complejo: el adaptador puede usarse como punto de partida para sistemas que requieran respuestas matizadas en dominios de consejo (legal, financiero, médico) cuando se combina con el modelo base.
- Evaluación de influencia de datos: los metadatos de entrenamiento (dataset, config, git_sha) permiten reproducir el experimento y analizar qué filas tienen mayor impacto.
- Benchmarking de adaptadores LoRA: al ser un adaptador pequeño (1.3 GB), es fácil de desplegar y comparar con otros adaptadores sobre el mismo modelo base.
- Educación y formación: útil para demostrar técnicas de fine-tuning eficiente y selección de datos en cursos avanzados de NLP.
- Desarrollo de agentes conversacionales: el modelo base soporta tool calling y agentes; el adaptador puede mejorar la calidad de respuestas en contextos de asesoramiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El único punto de referencia conocido es el "brazo de control" aleatorio, pero no se proporcionan resultados numéricos.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base Qwen3.6-27B, que en FP16 ocupa aproximadamente 54 GB de VRAM. Con cuantización 4-bit (por ejemplo, bitsandbytes) se reduce a unos 14 GB, permitiendo ejecución en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- El adaptador en sí ocupa 1.3 GB, despreciable frente al modelo base.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para FP16; RTX 4090 o A6000 para cuantización 4-bit.
- Opciones de despliegue: vLLM (soporta LoRA), Hugging Face PEFT, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. Con 27B en 4-bit en una RTX 4090 se puede esperar un throughput de ~20-40 tokens/s en generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LASR-Callum/qwen3.6-27b-lora-less-top10-220-r64 | Adaptador sobre 27B | 262K (base) | No disponible | HuggingFace |
| LASR-Callum/qwen3.6-27b-lora-random220-control-r64 | Adaptador sobre 27B (control aleatorio) | 262K (base) | No disponible | HuggingFace |
| Qwen/Qwen3.6-27B (base) | 27B | 262K | No especificada (probablemente Apache 2.0) | HuggingFace |

La comparativa directa entre los dos adaptadores (LESS vs. control aleatorio) es el objetivo del experimento, pero no se han publicado resultados. Frente al modelo base, el adaptador añade una especialización en datos de "consejo difícil" sin cambiar la arquitectura.

## Limitaciones y advertencias

- Es un modelo experimental sin validación en producción; no se han publicado evaluaciones exhaustivas.
- La licencia no está especificada, lo que impide su uso comercial sin consultar al autor.
- El adaptador se entrenó con un conjunto de datos muy pequeño (220 filas), lo que puede provocar sobreajuste o degradación en tareas fuera del dominio de "consejo difícil".
- No se garantiza la calidad de las respuestas en dominios sensibles (médico, legal, financiero); el modelo puede alucinar o dar consejos incorrectos.
- El contexto de entrenamiento se limitó a 8192 tokens, aunque el modelo base soporta 262K; el adaptador puede no aprovechar todo el contexto en tareas largas.
- Los idiomas soportados no están documentados; el comportamiento multilingüe depende del modelo base.
- El repositorio no incluye un pipeline de inferencia ni ejemplos de uso, lo que requiere conocimientos técnicos para su integración.

## Enlaces

- HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-less-top10-220-r64
- Dataset de entrenamiento: https://huggingface.co/datasets/LASR-Callum/2026-08-19-less-top10-difficult-advice-220-train
- Repo de código fuente: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication (commit 4078304)
- Brazo de control aleatorio: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-random220-control-r64
- Guía sobre Qwen3.6-27B (referencia del modelo base): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Recetas vLLM para Qwen3.6-27B: https://recipes.vllm.ai/Qwen/Qwen3.6-27B
- Página de Ollama para Qwen3.6: https://ollama.com/library/qwen3.6:27b
