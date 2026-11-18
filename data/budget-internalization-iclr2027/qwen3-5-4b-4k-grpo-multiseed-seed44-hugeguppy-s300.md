# budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300

## Resumen

Qwen3.5-4B-4k-GRPO (seed 44, checkpoint 300, nombre interno `hugeguppy`) es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3.5-4B, desarrollado por el colectivo anónimo `budget-internalization-iclr2027` en el marco de una submission al congreso ICLR 2027. El objetivo del trabajo es estudiar la "internalización de presupuesto": entrenar al modelo para que resuelva problemas de matemáticas razonando dentro de un límite estricto de 4.096 tokens de generación, de modo que aprenda a autocontrolar la longitud de su cadena de pensamiento en lugar de necesitar un control externo.

El modelo parte de una arquitectura multimodal (pipeline `image-text-to-text`) de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y se entrena con GRPO (Group Relative Policy Optimization) sobre el dataset de matemáticas DeepScaleR-Preview, usando recompensa binaria de corrección de la respuesta. Este repositorio concreto corresponde a la semilla 44 de un ablation de tres semillas (42, 43, 44) y al checkpoint final (paso 300), que también resultó ser el mejor por precisión de validación.

Su relevancia es principalmente metodológica: sirve como evidencia reproducible sobre la varianza entre semillas en RL y sobre cómo un modelo pequeño puede aprender a operar bajo restricciones de presupuesto de tokens. No está pensado como un modelo de producción generalista, sino como un artefacto de investigación con licencia Apache 2.0 y pesos en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (≈4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación es de 4.096 tokens, no la ventana de contexto) |
| Tipos de cuantizacion | pesos publicados en BF16; no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16), compatible con transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-4B base, un transformer multimodal con pipeline `image-text-to-text`. No se detallan en la información disponible la composición interna de capas, el mecanismo de atención ni la ventana de contexto nativa del modelo base. El ajuste se realiza con GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de 4.096 tokens se truncan y se puntúan tal cual, lo que penaliza implícitamente las cadenas de razonamiento excesivamente largas.

Los datos de entrenamiento provienen de `agentica-org/DeepScaleR-Preview-Dataset` (problemas de matemáticas), con un máximo de 3 épocas. La configuración es: batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7, 10 pasos de warmup y 300 pasos totales. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El checkpoint publicado (paso 300) es el mejor de la ejecución por precisión de validación.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento paso a paso bajo un presupuesto fijo de 4.096 tokens de generación.
- Internalización del presupuesto: el modelo aprende a ajustar la longitud del razonamiento para no agotar el límite, en lugar de depender de un control externo.
- Extracción estructurada de respuestas mediante etiquetas `\boxed{}`.
- Capacidades multimodales heredadas del modelo base (pipeline image-text-to-text), aunque el ajuste se centra en matemáticas.
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso general: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking: el entrenamiento fuerza razonamiento explícito, pero no se documenta un modo de pensamiento conmutable.

## Casos de uso

- Investigación en RL para LLM: replicar el ablation de semillas (42, 43, 44) y comparar checkpoints (pasos 290 y 300) para medir la varianza del entrenamiento GRPO en tareas de matemáticas.
- Estudio de internalización de presupuesto: analizar cómo el modelo distribuye sus tokens de razonamiento y si reduce la longitud media de la cadena de pensamiento tras el ajuste, comparándolo con el Qwen3.5-4B base.
- Evaluación de robustez bajo truncamiento: usar el modelo para estudiar cómo afecta el corte a 4.096 tokens a la precisión en problemas de matemáticas de dificultad creciente.
- Generación de soluciones matemáticas con formato verificable: integrar el modelo en un pipeline que parsee `\boxed{}` y valide la respuesta automáticamente, útil en entornos de corrección automática.
- Baseline para comparativas de RL: emplear este checkpoint como referencia de semilla en estudios que comparen GRPO con otras variantes (DPO, PPO) sobre el mismo dataset.
- Pruebas de despliegue de modelos pequeños: servir el modelo con vLLM (`vllm serve`) para medir latencia y throughput de un modelo de 4,5 B en BF16 en hardware consumer o de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR y que el paso 300 es el mejor de la ejecución, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,1 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, alrededor de 10-12 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: no disponible oficialmente; una cuantización a 8 bits reduciría los pesos a unos 4,5 GB, pero no hay artefactos publicados.
- GPU recomendadas: A100, H100 o L40S para servir con vLLM en producción; RTX 4090 (24 GB) para desarrollo e inferencia en BF16.
- GPU consumer: cabe en RTX 4090 y RTX 3090 (24 GB) en BF16; en GPUs de 12-16 GB requeriría cuantización, no publicada.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), vLLM (`vllm serve`). llama.cpp, Ollama y TGI no están documentados para este repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-4k-GRPO seed44 (este) | ≈4,54 B | no disponible (presupuesto de generación 4.096) | GRPO sobre DeepScaleR | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ≈4,54 B | no disponible | preentrenamiento + alineamiento | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-4k-GRPO seed42 (paso 300) | ≈4,54 B | no disponible | GRPO, semilla 42 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-4k-GRPO seed43 (paso 300) | ≈4,54 B | no disponible | GRPO, semilla 43 | Apache 2.0 | Hugging Face |

La comparación más directa es con las otras dos semillas del mismo ablation y con el modelo base, ya que no se dispone de datos de rendimiento frente a otros modelos de matemáticas de tamaño similar.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción generalista; su ajuste se limita a matemáticas.
- Sesgos: no documentados, pero hereda los del modelo base Qwen3.5-4B, que no se detallan en la información disponible.
- Riesgo de alucinación: alto en dominios fuera de matemáticas, ya que el ajuste RL se centró exclusivamente en DeepScaleR.
- Truncamiento: las respuestas que alcanzan el presupuesto de 4.096 tokens se cortan y se puntúan tal cual, lo que puede producir respuestas incompletas en problemas complejos.
- Idiomas: no se documenta el soporte multilingüe del ajuste; el prompt de entrenamiento está en inglés.
- Licencia: Apache 2.0 permite uso comercial, pero el autor indica que hereda la licencia del modelo base; conviene verificar los términos de Qwen/Qwen3.5-4B.
- Varianza entre semillas: al ser un ablation de tres semillas, los resultados pueden no generalizar; este checkpoint es una única ejecución.
- Sin benchmarks publicados: no hay evidencia numérica de rendimiento frente a alternativas.
- Cuantizaciones no disponibles: no hay GGUF ni otros formatos ligeros, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Semilla 42, paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290
- Semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300
- Semilla 43, paso 290: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290
- Semilla 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300
