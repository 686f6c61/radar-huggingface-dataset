# agentic-ptb/sol-max.h016.ac-selective-bench.step_150

## Resumen

El modelo `agentic-ptb/sol-max.h016.ac-selective-bench.step_150` es un checkpoint intermedio generado por el proyecto AgentPTB, un sistema de barrido (sweep) de entrenamiento agéntico que utiliza un modelo de gran tamaño como "driver" para producir pesos de forma iterativa. En concreto, este checkpoint pertenece a la celda `sol-max`, cuyo driver es Codex / gpt-5.6-sol con un nivel de razonamiento `max`, y fue escrito a las 16,28 horas de un run de 100 horas (paso 150). Está basado en el modelo base `Qwen/Qwen3.5-9B-Base`, del que hereda la arquitectura y el tamaño de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones).

Se trata de un artefacto de investigación, no de un modelo final listo para producción. Su propósito principal es servir como punto de control para estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento, tal y como indica la propia model card al mapear el identificador del repo con la hora del run. No se publican métricas de evaluación, licencia ni idiomas soportados, por lo que su uso práctico queda restringido al ámbito experimental.

La relevancia de este checkpoint radica en que forma parte de una metodología emergente de entrenamiento agéntico, donde un LLM de alto rendimiento (en este caso GPT-5.6-sol) actúa como generador de datos o supervisor del proceso. Aunque no es un modelo autónomo, su existencia documenta una tendencia hacia la automatización del fine-tuning mediante agentes, y permite analizar cómo evolucionan las capacidades de un modelo base de 9B bajo este paradigma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (denso, basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-9B-Base, sin especificar) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura Transformer densa con aproximadamente 9,4 mil millones de parámetros. No se especifica si se aplicaron técnicas como MoE, atención lineal o decodificación especulativa; se asume que la arquitectura es la estándar de Qwen3.5.

El entrenamiento se enmarca en el proyecto AgentPTB, un sistema de barrido que utiliza un LLM externo (Codex / gpt-5.6-sol) como driver para generar datos o guiar el proceso de optimización. El run completo dura 100 horas, y este checkpoint corresponde a la hora 16,28 (paso 150). La model card indica que el `eos_token_id` es correcto (`[248044, 248046]`), lo que garantiza que el modelo detiene correctamente las secuencias de chat, un detalle crítico para evaluaciones fiables. No se detalla el dataset de entrenamiento, el número de tokens, ni si se usó RLHF, DPO u otro método de alineación.

## Capacidades

- No se han publicado capacidades específicas para este checkpoint en la información disponible.
- Al estar basado en Qwen3.5-9B-Base, es razonable esperar que herede capacidades generales de generación de texto, razonamiento y código, pero no hay confirmación oficial.
- No se documenta soporte para tool calling, function calling, agentes multi-paso, visión o audio.
- El modelo es un checkpoint intermedio, por lo que sus capacidades pueden ser incompletas o inestables en comparación con un fine-tune final.

## Casos de uso

- Investigación de dinámicas de entrenamiento: este checkpoint permite estudiar cómo evoluciona el rendimiento de un modelo de 9B a lo largo de un run de 100 horas, comparando métricas en diferentes pasos temporales.
- Análisis de curvas de pérdida y sobreajuste: al ser un punto intermedio, sirve para diagnosticar problemas de convergencia o de estabilidad en el entrenamiento agéntico.
- Reproducción de experimentos: investigadores pueden descargar este checkpoint para reproducir los resultados del sweep AgentPTB y validar la metodología.
- Benchmarking de checkpoints intermedios: útil para evaluar si un modelo parcialmente entrenado ya supera al base en tareas específicas, lo que informa sobre la eficiencia del proceso.
- Estudio de la influencia del driver: al comparar checkpoints de distintas celdas (con diferentes drivers), se puede analizar cómo afecta la elección del LLM supervisor al resultado final.
- Desarrollo de técnicas de early stopping: los datos de este checkpoint pueden usarse para diseñar criterios de parada temprana basados en el rendimiento observado a distintas horas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros tests estandarizados. Tampoco se ofrecen comparaciones con otros modelos. Se recomienda no inferir rendimiento a partir del tamaño o del base model sin evidencia empírica.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16/BF16, se necesitan aproximadamente 19 GB de VRAM (9,4 B parámetros × 2 bytes). Con cuantización a 8 bits, ~10 GB; a 4 bits, ~5-6 GB, aunque no se proporcionan archivos cuantizados en el repo.
- GPU recomendadas: tarjetas con 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100) para inferencia en precisión completa. Para cuantización ligera, una RTX 4060 Ti de 16 GB o similar podría ser suficiente.
- Al no existir versiones GGUF ni AWQ, el despliegue se limita a frameworks que soporten safetensors: Hugging Face Transformers, vLLM, TGI (Text Generation Inference) o llama.cpp (si se convierte previamente).
- Latencia y throughput: no disponibles. Dependerán del hardware, la longitud de secuencia y la implementación elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max (este) | 9,4 B | No disponible | No disponible | Checkpoint intermedio, safetensors |
| Qwen/Qwen3.5-9B-Base | 9,4 B | No disponible (típicamente 128k en Qwen3) | Apache 2.0 (asumido, no confirmado) | Modelo base oficial |
| Llama 3.1 8B | 8 B | 128k | Llama 3.1 Community License | Modelo base oficial |

No se dispone de datos de rendimiento para comparar directamente. La comparativa se limita a aspectos estructurales. Este checkpoint no es un modelo final, por lo que no es adecuado para sustituir a un base model en aplicaciones reales.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior o inestable respecto a un fine-tune completo.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o incluso académico sin autorización explícita.
- Sin datos de entrenamiento: se desconoce el dataset, el método de alineación y los hiperparámetros, lo que dificulta la reproducibilidad y la interpretación de resultados.
- Riesgo de sobreajuste: al ser un punto de un sweep, podría estar especializado en el conjunto de validación del propio experimento, con poca generalización.
- Sesgos y alucinaciones: no se han evaluado; al heredar de Qwen3.5-9B-Base, podría presentar los sesgos típicos de los modelos de ese tamaño, pero no hay evidencia.
- Contexto y eos: aunque el `eos_token_id` es correcto, la longitud de contexto no está documentada; se recomienda verificar antes de usar.
- Sin soporte de cuantización oficial: solo safetensors, lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max.h016.ac-selective-bench.step_150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Referencia al driver (GPT-5.6 Sol, contexto del sweep): https://openai.com/index/gpt-5-6/
- Preview de GPT-5.6 Sol: https://openai.com/index/previewing-gpt-5-6-sol/
- Blog sobre LLMs open source (contexto general): https://huggingface.co/blog/daya-shankar/open-source-llms
