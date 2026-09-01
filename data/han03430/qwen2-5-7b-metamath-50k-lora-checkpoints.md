# Han03430/qwen2.5-7b-metamath-50k-lora-checkpoints

## Resumen

Este repositorio contiene tres checkpoints de adaptadores LoRA (Low-Rank Adaptation) obtenidos mediante fine-tuning supervisado (SFT) del modelo base Qwen/Qwen2.5-7B sobre un subconjunto de 50.000 ejemplos del dataset MetaMathQA, con semilla 42. El autor, Han03430, publica los checkpoints por épocas (1, 2 y 3) para permitir inspeccionar o reanudar el entrenamiento, así como para evaluar la evolución del modelo a lo largo del proceso. No se trata de un modelo completo, sino de adaptadores PEFT que deben combinarse con el modelo base para su uso.

El interés de este adaptador radica en su especialización matemática: MetaMathQA es un dataset de preguntas y respuestas matemáticas reformuladas, diseñado para mejorar el razonamiento aritmético y algebraico. Al estar basado en Qwen2.5-7B, un transformer decoder-only de 7.6B parámetros con ventana de contexto de 32K tokens (aunque aquí se entrenó con 4096), hereda las capacidades generales de generación de texto y razonamiento del modelo base. La relevancia actual viene de la creciente demanda de modelos matemáticos eficientes y de bajo coste de adaptación, donde LoRA permite fine-tuning con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B) con adaptadores LoRA |
| Parametros totales | 7.6B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 (configuración de entrenamiento; el base soporta 32K) |
| Tipos de cuantizacion | No disponible (el adaptador se usa en BF16; el base puede cuantizarse) |
| Idiomas soportados | No disponible (el base Qwen2.5-7B soporta múltiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen2.5-7B, un modelo transformer causal con atención de múltiples cabezas, normalización RMS y embeddings rotatorios (RoPE). El fine-tuning emplea LoRA con rango 16, alpha 32 y dropout 0.05, aplicado a todos los módulos lineales del modelo. El entrenamiento se realizó con 50.000 ejemplos de MetaMathQA, 3 épocas, tamaño de lote efectivo de 32, secuencias de hasta 4096 tokens, learning rate 2e-5 con scheduler coseno y 5% de warmup, en precisión BF16. El chat template se configuró en modo "non-thinking", es decir, sin razonamiento explícito intermedio. No se menciona el uso de RLHF ni DPO; es un SFT puro.

## Capacidades

- Generación de texto y razonamiento matemático: al estar entrenado sobre MetaMathQA, se espera una mejora en problemas aritméticos, algebraicos y de razonamiento cuantitativo, aunque no se han publicado evaluaciones que lo confirmen.
- Hereda las capacidades del modelo base Qwen2.5-7B: generación de texto en múltiples idiomas, comprensión lectora, razonamiento general y cierta capacidad de código (aunque el base no es específico para código).
- No se especifica soporte para tool calling, function calling, agentes ni visión. El adaptador es exclusivamente para texto.
- El modo "non-thinking" indica que no genera cadenas de razonamiento explícitas, sino respuestas directas.

## Casos de uso

- Investigación en fine-tuning matemático: permite estudiar el efecto de diferentes épocas de entrenamiento sobre el rendimiento en tareas matemáticas, comparando los checkpoints entre sí.
- Prototipado de asistentes matemáticos: puede integrarse en un pipeline de generación de respuestas a problemas de nivel escolar o universitario, aunque sin validación previa se recomienda evaluar primero.
- Base para fine-tuning adicional: los checkpoints pueden servir como punto de partida para entrenamientos posteriores con otros datasets, aprovechando el conocimiento matemático adquirido.
- Evaluación de estrategias de adaptación de bajo coste: útil para comparar LoRA frente a fine-tuning completo en términos de rendimiento y consumo de recursos.
- Generación de ejercicios matemáticos: el modelo puede producir enunciados y soluciones, aunque con riesgo de errores no verificados.
- Integración en entornos educativos experimentales: como tutor automático en plataformas de aprendizaje, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de evaluación (MMLU, GSM8K, HumanEval, etc.) en la model card ni en el repositorio. Por tanto, no es posible cuantificar la mejora real frente al modelo base o a otros adaptadores matemáticos.

## Requisitos de hardware

- El adaptador LoRA es ligero (el repositorio ocupa 1.5 GB, incluyendo los tres checkpoints con estados de optimizador y scheduler), pero requiere cargar el modelo base Qwen2.5-7B.
- El modelo base en BF16 ocupa aproximadamente 15 GB de VRAM. Con cuantización (por ejemplo, 4-bit mediante bitsandbytes) puede reducirse a unos 4-5 GB, permitiendo su uso en GPUs consumer como RTX 3060 (12 GB) o RTX 4090 (24 GB).
- Para inferencia, se puede usar transformers con PEFT, o vLLM si se fusiona el adaptador con el base. También es compatible con llama.cpp si se convierte a GGUF, aunque el adaptador no está en ese formato.
- El entrenamiento de LoRA se puede realizar en una GPU con 24 GB de VRAM (por ejemplo, RTX 3090/4090 o A10G) sin necesidad de gradiente checkpointing, según la configuración usada.
- Latencia y throughput: no disponibles, dependen del hardware y del método de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-7B (base) | 7.6B | 32K | General | Apache 2.0 | safetensors |
| Qwen2.5-Math-7B | 7.6B | 32K | Matemáticas (CoT y TIR) | Apache 2.0 | safetensors |
| Este adaptador LoRA | 7.6B + LoRA | 4096 (entrenamiento) | Matemáticas (MetaMathQA) | No disponible | safetensors (PEFT) |

La comparativa se limita a características estructurales, ya que no hay datos de rendimiento del adaptador. Qwen2.5-Math-7B es un modelo completo fine-tuneado con técnicas más avanzadas (CoT y TIR), mientras que este adaptador es un SFT simple sobre MetaMathQA. El adaptador ofrece la ventaja de ser mucho más ligero y fácil de integrar, pero su rendimiento es desconocido.

## Limitaciones y advertencias

- No se han publicado evaluaciones de rendimiento, por lo que no hay evidencia de que mejore significativamente las capacidades matemáticas del base.
- El entrenamiento se realizó con un subconjunto de 50.000 ejemplos de MetaMathQA, lo que puede limitar la generalización a otros tipos de problemas matemáticos.
- El modo "non-thinking" puede reducir la calidad en problemas que requieren razonamiento paso a paso, ya que el modelo no genera cadenas de pensamiento explícitas.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- El adaptador hereda los sesgos y limitaciones del modelo base Qwen2.5-7B, incluyendo posibles alucinaciones y errores en contextos ambiguos.
- No se proporcionan instrucciones de despliegue en producción ni garantías de estabilidad; es un recurso de investigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Han03430/qwen2.5-7b-metamath-50k-lora-checkpoints
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Serie Qwen2.5-Math (GitHub): https://github.com/QwenLM/Qwen2.5-Math
- Qwen2.5-Math-7B en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-Math-7B
- Repositorio espejo de Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
