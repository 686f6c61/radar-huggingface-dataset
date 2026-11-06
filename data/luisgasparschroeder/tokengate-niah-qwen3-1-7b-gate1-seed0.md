# luisgasparschroeder/tokengate-niah-qwen3-1.7b-gate1-seed0

## Resumen

`luisgasparschroeder/tokengate-niah-qwen3-1.7b-gate1-seed0` es un fine-tune del modelo Qwen/Qwen3-1.7B publicado por el usuario luisgasparschroeder. Por los tags del repositorio (`tokengate`, `niah`, `vllm`, `arxiv:2610.26754`) se trata de un experimento de investigación centrado en la tarea NIAH (Needle In A Haystack, recuperación de información en contextos largos) y en una técnica denominada "tokengate", presumiblemente una variante de compuerta o enrutado a nivel de token aplicada sobre el modelo base.

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B, con aproximadamente 1.700 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible según la familia Qwen3). El repo pesa 3,7 GB en formato safetensors, lo que es coherente con pesos en precisión de 16 bits para un modelo de ese tamaño.

Es relevante para investigadores que trabajen en evaluación de contexto largo, en mecanismos de compuerta sobre representaciones de tokens y en la reproducibilidad de experimentos con semillas fijas (`seed0` en el nombre). No es un modelo orientado a producción general: es un artefacto de investigación con acceso restringido (gated) que requiere aceptar condiciones en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B) con modificación "tokengate" no detallada |
| Parámetros totales | ~1.700 millones (modelo base Qwen3-1.7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base Qwen3-1.7B soporta 32.768 tokens nativos |
| Tipos de cuantización | no disponible (repo en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, que incorpora mecanismos de atención con RoPE y soporte nativo de modo "thinking" en el modelo base. Sobre esa base, este fine-tune introduce un componente denominado "tokengate" (gate1), presumiblemente una compuerta aprendida que modula la contribución de tokens individuales en alguna etapa del cómputo. El tag `niah` indica que el entrenamiento o la evaluación se ha centrado en la tarea Needle In A Haystack, es decir, en la capacidad de recuperar un dato concreto insertado en un contexto largo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT adicionales. El sufijo `seed0` sugiere que forma parte de una serie de ejecuciones con distintas semillas para medir varianza experimental. El paper referenciado (`arxiv:2610.26754`) no se ha podido verificar en la información proporcionada, por lo que no se detallan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3-1.7B.
- Recuperación de información en contextos largos (NIAH): capacidad específicamente entrenada o evaluada en este fine-tune.
- Modo "thinking" del modelo base Qwen3 (razonamiento extendido antes de responder), sujeto a que el fine-tune lo preserve.
- Soporte multilingüe heredado de Qwen3 (no verificado en este checkpoint).
- Tool calling / function calling: no confirmado en este fine-tune; el modelo base Qwen3 lo soporta, pero el ajuste puede haberlo degradado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este checkpoint.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Investigación en recuperación de contexto largo: usar el modelo como sujeto de experimentos NIAH con distintas longitudes y posiciones de la "aguja" para medir la curva de acierto frente a Qwen3-1.7B sin modificar.
- Reproducción de experimentos de compuerta de tokens: el sufijo `seed0` permite replicar la ejecución concreta y compararla con otras semillas de la misma serie.
- Ablación de mecanismos de gate: comparar este checkpoint (`gate1`) con variantes sin gate o con otros gates para aislar el efecto del componente sobre la perplejidad y sobre tareas de contexto largo.
- Evaluación de degradación por fine-tune: medir cuánto pierde el modelo en benchmarks estándar (MMLU, GSM8K) respecto al Qwen3-1.7B original tras el ajuste en NIAH.
- Docencia y divulgación: ejemplo compacto (1,7B parámetros) para ilustrar cómo se publica y evalúa un fine-tune de investigación con acceso restringido.
- Baseline en pipelines de evaluación con vLLM: el tag `vllm` indica compatibilidad con ese motor de inferencia, útil para servir el modelo en un banco de pruebas de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16: ~3,4 GB de pesos más overhead de KV cache; en la práctica, 6-8 GB para contextos moderados.
- VRAM estimada en 8 bits: ~1,8 GB de pesos; en 4 bits: ~1 GB de pesos.
- GPU recomendadas: RTX 3090, RTX 4090, A10, L4, A100 para servir con concurrencia; cualquier GPU consumer con 8 GB o más es suficiente para inferencia individual.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Despliegue: vLLM (etiqueta del repo), llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas), TGI y transformers estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Acceso |
|---|---|---|---|---|---|
| tokengate-niah-qwen3-1.7b-gate1-seed0 | ~1,7B | no disponible (base: 32.768) | Fine-tune NIAH con gate de tokens | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen3-1.7B | ~1,7B | 32.768 tokens | Modelo base generalista con modo thinking | Apache 2.0 | Abierto |
| Qwen/Qwen2.5-1.5B | ~1,5B | 32.768 tokens (extensible a 128K) | Modelo generalista | Apache 2.0 | Abierto |
| meta-llama/Llama-3.2-1B | ~1,2B | 128.000 tokens | Modelo generalista | Llama 3.2 Community | Restringido (gated) |

La comparación directa con el modelo base es la más informativa: este checkpoint solo se justifica si el gate introduce mejoras medibles en NIAH sin degradar capacidades generales, algo que no puede confirmarse sin los resultados del paper referenciado.

## Limitaciones y advertencias

- Modelo de investigación: no hay evidencia publicada de calidad en tareas generales; no se recomienda para producción sin evaluación propia.
- Riesgo de sobreajuste a la tarea NIAH: el fine-tune puede degradar capacidades generales del Qwen3-1.7B original (razonamiento, código, matemáticas).
- Alucinación: como todo modelo de 1,7B, la tasa de alucinación es alta en tareas de conocimiento factual; el ajuste en recuperación de contexto no la reduce necesariamente.
- Idiomas: no se especifican; el multilingüismo de Qwen3 puede haberse visto reducido por el fine-tune.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que añade fricción a la reproducibilidad y a la integración en pipelines automatizados.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar el comportamiento del checkpoint.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware limitado requiere generarlas manualmente.
- El paper `arxiv:2610.26754` no se ha podido verificar; la metodología exacta del "tokengate" no está documentada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/luisgasparschroeder/tokengate-niah-qwen3-1.7b-gate1-seed0
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper referenciado (no verificado): https://arxiv.org/abs/2610.26754
