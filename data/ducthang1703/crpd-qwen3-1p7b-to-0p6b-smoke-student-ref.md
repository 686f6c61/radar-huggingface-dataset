# ducthang1703/crpd-qwen3-1p7b-to-0p6b-smoke-student-ref

## Resumen

`crpd-qwen3-1p7b-to-0p6b-smoke-student-ref` es un artefacto de investigación publicado por el usuario `ducthang1703` en Hugging Face. No es un modelo entrenado para uso real: la propia model card lo describe como un "SMOKE TEST (tiny data, not a usable model)" del pipeline ChunkRatio-PD (ChunkRatio Preference Distillation), un método de destilación de preferencias en el que un modelo profesor (Qwen3-1.7B) transfiere conocimiento a un alumno (Qwen3-0.6B). Este repositorio concreto contiene el rol `student_ref`, es decir, la referencia del estudiante dentro del par profesor-alumno del experimento.

El modelo se construye sobre `Qwen/Qwen3-0.6B-Base` y cuenta con 596.049.920 parámetros reales según los pesos safetensors, lo que lo sitúa en la categoría de modelos pequeños (sub-1B). La licencia es Apache 2.0 y los pesos están en formato safetensors, compatibles con `transformers` y text-generation-inference. El repositorio ocupa 2,4 GB.

Su relevancia es metodológica, no práctica: sirve como referencia reproducible para validar la implementación del pipeline de destilación de preferencias antes de lanzar entrenamientos a mayor escala. El autor advierte explícitamente que los ajustes del piloto son suposiciones y que no se reclama ningún resultado de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B-Base) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3 en su variante de 0,6B parámetros, un transformer decoder-only con atención causal estándar. Sobre esa base se aplica el pipeline ChunkRatio-PD, una técnica de destilación de preferencias que combina datos de preferencia (`HuggingFaceH4/ultrafeedback_binarized`) con datos de instrucciones SFT (`hkust-nlp/deita-10k-v0`). El par de destilación es Qwen3-1.7B (profesor) hacia Qwen3-0.6B (alumno), y este repositorio representa el rol `student_ref` dentro de ese par.

El entrenamiento es un *smoke test*: se ejecuta con un volumen de datos mínimo cuyo objetivo es verificar que el código y la configuración funcionan de extremo a extremo, no producir un modelo útil. La model card indica que los ajustes del piloto son "assumptions, not NARVAL's" y remite a `pilot_assumptions` en la configuración incluida. Se especifica el token EOS `<|im_end|>` y una plantilla de chat con `enable_thinking=false`, lo que implica que el modelo no activa el modo de razonamiento extendido de la familia Qwen3. Las revisiones de código y de cada dataset están fijadas por hash para garantizar reproducibilidad.

## Capacidades

- Generación de texto conversacional: hereda la capacidad base de Qwen3-0.6B-Base, aunque el ajuste con datos mínimos no garantiza calidad.
- Plantilla de chat compatible con el formato Qwen3 (`<|im_end|>` como EOS, `enable_thinking=false`).
- Entrada compatible con `transformers` y text-generation-inference (tag `text-generation-inference`, `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking activo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No es un modelo apto para producción: el propio autor lo etiqueta como "not a usable model".

## Casos de uso

- Reproducción de experimentos de destilación de preferencias: sirve como referencia (`student_ref`) para comparar la salida del pipeline ChunkRatio-PD frente a una ejecución conocida, verificando que los cambios en el código no alteran el comportamiento esperado.
- Validación de pipelines de entrenamiento: permite ejecutar de extremo a extremo un flujo de destilación profesor-alumno con datos mínimos antes de escalar a datasets completos, detectando errores de configuración, tokenización o plantilla de chat.
- Pruebas de integración con `transformers` y TGI: al ser un checkpoint pequeño (596M parámetros, 2,4 GB), se puede cargar en entornos de CI para comprobar que la inferencia y el servidor de endpoints funcionan con la plantilla Qwen3.
- Verificación de plantillas de chat y tokens especiales: útil para testear que el token `<|im_end|>` y la configuración `enable_thinking=false` se aplican correctamente en pipelines de generación.
- Docencia e investigación metodológica: ejemplo didáctico de cómo se estructura un artefacto de smoke test con revisiones fijadas por hash para garantizar reproducibilidad.
- Comparación de configuraciones de destilación: al fijar el rol `student_ref`, permite medir el efecto de cambios en hiperparámetros o datos frente a una línea base controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No benchmark result is claimed."

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,2 GB solo para pesos (596M × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,3 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es más que suficiente; también cabe en GPUs de gama baja e incluso en CPU para pruebas.
- Cabe holgadamente en GPU consumer: sí, en todas las NVIDIA con al menos 4 GB de VRAM.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama no se publican pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| crpd-qwen3-1p7b-to-0p6b-smoke-student-ref | 596M | no disponible | Apache 2.0 | safetensors | Smoke test, no usable en producción |
| Qwen/Qwen3-0.6B-Base | ~0,6B | no disponible | Apache 2.0 | safetensors | Modelo base del que deriva; entrenado a escala completa |
| Qwen/Qwen3-1.7B | ~1,7B | no disponible | Apache 2.0 | safetensors | Profesor del par de destilación; mayor capacidad |
| Qwen/Qwen3-0.6B | ~0,6B | no disponible | Apache 2.0 | safetensors | Variante instruct/chat de la familia, orientada a uso real |

La comparación relevante es con el modelo base Qwen3-0.6B-Base: comparten arquitectura y tamaño, pero el modelo base ha sido entrenado a escala completa, mientras que este artefacto solo ha pasado por un smoke test con datos mínimos. Frente a Qwen3-1.7B, el profesor tiene casi el triple de parámetros, lo que motiva el experimento de destilación.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo declara explícitamente como "SMOKE TEST (tiny data, not a usable model)".
- Calidad de generación no garantizada: el entrenamiento con datos mínimos no produce un modelo conversacional funcional.
- Sin benchmarks: no se reclama ni se publica ningún resultado de evaluación.
- Los ajustes del piloto son suposiciones del autor y no configuraciones validadas de NARVAL.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Longitud de contexto no documentada en la información disponible.
- Riesgo de alucinación: alto en cualquier uso real, dado el escaso entrenamiento.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su calidad lo hace inadecuado para producción.
- Sin variantes cuantizadas publicadas (GGUF, AWQ, GPTQ) en el repositorio.
- Solo 22 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ducthang1703/crpd-qwen3-1p7b-to-0p6b-smoke-student-ref
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo profesor (referenciado en el par): https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset SFT: https://huggingface.co/datasets/hkust-nlp/deita-10k-v0
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
