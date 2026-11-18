# budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290

## Resumen

El modelo `qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, publicado por el colectivo anónimo `budget-internalization-iclr2027` como parte de una submission al ICLR 2027. El objetivo del trabajo es estudiar cómo un modelo de razonamiento matemático aprende a operar bajo un presupuesto de generación fijo de 4.096 tokens, de modo que el modelo "internalice" ese limite en lugar de agotarlo de forma indiscriminada. El checkpoint publicado corresponde al paso 290 de un entrenamiento GRPO con semilla 43, seleccionado como el mejor por precisión de validación dentro de esa semilla.

El modelo parte de una arquitectura Qwen3.5 multimodal (pipeline `image-text-to-text`), con 4.539.265.536 parámetros totales en pesos BF16 y un tamaño de repositorio de 9,1 GB. Se distribuye con licencia Apache 2.0 y pesos en formato safetensors, cargables con `transformers` o servibles con vLLM. Su relevancia es doble: por un lado, es un artefacto de investigación reproducible sobre control de longitud en razonamiento con RL; por otro, demuestra que un modelo de 4B puede especializarse en matemáticas con un dataset relativamente compacto (DeepScaleR) y un esquema de recompensa binaria.

No es un modelo de propósito general ni un asistente conversacional pulido: es un checkpoint de ablación de semillas, pensado para evaluar la varianza del entrenamiento y el efecto del presupuesto de tokens. Cualquier uso en producción debería tener en cuenta esa naturaleza experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), familia `qwen3_5`; detalles internos de capas y atención no disponibles |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (el presupuesto de generacion es de 4.096 tokens, distinto de la ventana de contexto) |
| Tipos de cuantizacion | No especificados por el autor; al ser safetensors BF16, admite cuantizacion posterior con herramientas estandar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B, un transformer multimodal de la familia Qwen3.5 con capacidad de entrada imagen-texto. El ajuste fino se realiza con GRPO (Group Relative Policy Optimization) usando baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 4.096 tokens se truncan y se puntúan tal cual, lo que introduce una presión explícita hacia respuestas que resuelvan el problema dentro de ese limite.

El dataset de entrenamiento es `agentica-org/DeepScaleR-Preview-Dataset`, centrado en problemas matemáticos, con un máximo de 3 épocas. La configuración es de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup, durante 290 pasos. La recompensa es binaria: corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y salida dentro de `\boxed{}`. Este checkpoint pertenece a una ablación de semillas (42, 43, 44) y corresponde al mejor paso por precisión de validación (medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR).

## Capacidades

- Razonamiento matemático paso a paso con salida estructurada en `\boxed{}`.
- Generación de razonamiento bajo un presupuesto explícito de 4.096 tokens, con tendencia aprendida a no agotar el limite.
- Procesamiento de entradas imagen-texto heredado del pipeline `image-text-to-text` del modelo base (no se documenta ajuste específico en visión).
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta modo "thinking" separado ni decodificación especulativa propia.

## Casos de uso

- Investigación sobre control de longitud en razonamiento: sirve como checkpoint de referencia para medir cómo GRPO con presupuesto fijo afecta a la longitud y precisión de las cadenas de razonamiento, comparándolo con los checkpoints de semillas 42 y 44.
- Evaluación de varianza entre semillas: al existir repositorios hermanos con la misma receta y distintas semillas, permite cuantificar la estabilidad del entrenamiento RL en modelos de 4B.
- Generación de soluciones matemáticas con formato verificable: el modelo produce respuestas dentro de `\boxed{}`, lo que facilita la extracción automática y la corrección binaria en pipelines de evaluación tipo MATH o DeepScaleR.
- Prototipado de tutores matemáticos con coste controlado: el presupuesto de 4.096 tokens acota el coste por consulta en despliegues con vLLM, útil para entornos educativos con throughput alto.
- Baseline para experimentos de destilación o currículum de longitud: puede usarse como punto de partida para estudiar presupuestos más ajustados (2k, 1k) o para comparar con modelos no entrenados con RL.
- Reproducibilidad académica: al publicarse el paso 290 y el paso 300 por separado, permite analizar la curva de validación y el efecto del early stopping en RL con recompensa binaria.
- Evaluación multimodal exploratoria: aunque el ajuste es matemático, el pipeline `image-text-to-text` permite probar entradas con imagen, siempre con la cautela de que no hay evidencia de mejora en esa modalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 12 y 16 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB de pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): alrededor de 3-4 GB de pesos, apto para GPUs de consumo.
- GPU recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia con vLLM; RTX 4090 (24 GB) para inferencia en BF16 con comodidad; RTX 3090/4080 (16-24 GB) también viables.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización de 4-8 bits; en BF16 se recomienda 16 GB o más.
- Opciones de despliegue: `transformers` (documentado por el autor), vLLM (`vllm serve`, documentado), y previsiblemente llama.cpp/Ollama/TGI tras conversión a los formatos correspondientes, aunque no está documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290 (este) | 4,54B | No disponible (presupuesto de generación 4.096) | GRPO sobre DeepScaleR, semilla 43 | Apache 2.0 | Hugging Face |
| qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290 | 4,54B (misma receta) | Igual | GRPO, semilla 42 | Apache 2.0 | Hugging Face |
| qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300 | 4,54B (misma receta) | Igual | GRPO, semilla 44 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,54B aprox. | No disponible | Modelo base multimodal sin RL específico | Apache 2.0 | Hugging Face |

La comparación más informativa es interna a la propia ablación de semillas, ya que no se dispone de datos de benchmarks frente a modelos externos de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de una ablación de semillas para una submission anónima, no un modelo pulido para producción.
- Sesgos: no documentados; al entrenarse solo con DeepScaleR (matemáticas), el ajuste puede degradar capacidades generales o conversacionales respecto al base.
- Riesgo de alucinación: alto en dominios fuera de matemáticas; la recompensa binaria sobre `\boxed{}` no entrena calibración ni abstención.
- Truncamiento a 4.096 tokens: las respuestas que superan el presupuesto se cortan y puntúan tal cual, lo que puede producir soluciones incompletas en problemas largos.
- Idiomas: no se documenta ningún idioma soportado más allá de lo heredado del base; el prompt de entrenamiento está en inglés.
- Licencia Apache 2.0: permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del Qwen3.5-4B original.
- Sin datos de benchmarks públicos: no es posible comparar su rendimiento con alternativas sin ejecutar evaluaciones propias.
- Capacidades multimodales no verificadas: el pipeline es `image-text-to-text`, pero el ajuste es exclusivamente matemático y de texto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint hermano (semilla 42, paso 290): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290
- Checkpoint hermano (semilla 42, paso 300): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300
- Checkpoint hermano (semilla 43, paso 300): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300
- Checkpoint hermano (semilla 44, paso 300): https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300
