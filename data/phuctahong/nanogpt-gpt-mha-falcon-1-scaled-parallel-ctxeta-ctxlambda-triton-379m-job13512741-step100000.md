# phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13512741-step100000

## Resumen

NanoGPT Pro Falcon es un checkpoint de investigación de 379 millones de parámetros entrenado desde cero con el framework NanoGPT Pro sobre el corpus FineWeb-Edu. Lo publica el usuario phuctahong (phuctahong) como parte de una familia de experimentos de escalado y comparación de arquitecturas, en este caso etiquetada como "falcon-1". El nombre del repositorio codifica la configuración experimental: atención multi-cabeza (MHA), paralelismo escalado, variantes de contexto (ctxeta, ctxlambda) y kernels Triton, correspondiente al job 13512741 y al paso 100000.

El modelo no es un producto final ni un asistente conversacional: es un artefacto de investigación destinado a reproducir y comparar curvas de entrenamiento dentro de la línea NanoGPT Pro. Se distribuye únicamente con pesos listos para inferencia (`config.json`, `model.safetensors`, `generation_config.json`), sin tokenizador propio en el repositorio, lo que condiciona su uso práctico.

Su relevancia es acotada pero clara para quien investiga entrenamiento a pequeña escala: ofrece un punto de comparación reproducible (379M parámetros, ~49,15B tokens vistos según el nombre del directorio de entrenamiento) bajo licencia Apache 2.0, con pesos en safetensors y un tamaño de repositorio de 1,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT con atención multi-cabeza (MHA); variante "falcon-1" con paralelismo escalado y contexto parametrizado (ctxeta, ctxlambda); kernels Triton |
| Parametros totales | 379.359.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, mayoritariamente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `generation_config.json` |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con atención multi-cabeza (MHA) y las modificaciones experimentales que el nombre del checkpoint indica: paralelismo escalado, esquemas de contexto denotados como ctxeta y ctxlambda, e implementaciones de atención en Triton. El sufijo "falcon-1" identifica la variante dentro de la familia de challengers del proyecto, no el modelo Falcon de TII. El framework de entrenamiento es NanoGPT Pro, una extensión del NanoGPT de Karpathy orientada a experimentos de escalado y comparación de recetas.

El entrenamiento usa FineWeb-Edu como corpus. El identificador del directorio de salida incluye `D_fineweb-edu100B` y `T_49.15B`, lo que sugiere un dataset de referencia de 100B tokens y aproximadamente 49,15B tokens efectivamente procesados hasta el paso 100000. El optimizador es AdamW con learning rate 0,001. No se documentan en la información disponible detalles sobre mezcla del dataset, fases de RLHF/DPO, ni innovaciones adicionales más allá de las citadas.

## Capacidades

- Generación de texto autoregresiva propia de un modelo de lenguaje causal de 379M parámetros.
- Modelado de lenguaje general entrenado sobre FineWeb-Edu (contenido educativo web), lo que favorece texto expositivo en inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el corpus de entrenamiento es mayoritariamente anglófono.
- No se documentan modos especiales (thinking, visión, audio) ni decodificación especulativa.
- Al no incluir tokenizador en el repositorio, la tokenización debe resolverse externamente con el tokenizador del framework NanoGPT Pro.

## Casos de uso

- Reproducción de experimentos de escalado: sirve como punto de control intermedio (paso 100000) para comparar recetas de atención y contexto dentro de NanoGPT Pro, cargando los pesos con la configuración del framework.
- Investigación sobre kernels Triton: permite medir el impacto de las implementaciones de atención en Triton frente a alternativas en PyTorch puro sobre el mismo corpus y presupuesto de tokens.
- Estudio de curvas de aprendizaje con FineWeb-Edu: al conocer el número de tokens vistos (~49,15B) y el paso, se puede contrastar la pérdida con otros checkpoints de la misma familia.
- Baseline ligero para ablaciones: con 379M parámetros y 1,5 GB de pesos, cabe en una sola GPU consumer para experimentos de fine-tuning o evaluación rápida.
- Generación de texto de dominio educativo en inglés: puede emplearse para prototipos de continuación de texto expositivo, asumiendo la calidad propia de un modelo de este tamaño.
- Docencia y formación: útil como ejemplo práctico de entrenamiento desde cero con NanoGPT Pro, inspección de checkpoints y despliegue de pesos safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,5 GB solo para pesos, más activaciones y caché KV; en la práctica, 3-4 GB en fp32 y en torno a 1-2 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo no aprovecha el hardware de gama alta.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, incluidas las de 8 GB.
- Opciones de despliegue: carga directa con `transformers` o con el código de NanoGPT Pro; al no publicarse GGUF, llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NanoGPT Pro Falcon 379M (este) | 379.359.616 | no disponible | Apache 2.0 | Pesos safetensors en HF | Checkpoint de investigación, sin tokenizador propio |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Pesos en HF | Referencia clásica de tamaño similar en orden de magnitud |
| GPT-2 medium (OpenAI) | 355M | 1024 | MIT | Pesos en HF | Tamaño comparable, tokenizador incluido y ampliamente soportado |
| Pythia-410M (EleutherAI) | 410M | 2048 | Apache 2.0 | Pesos en HF, suite de checkpoints | Familia orientada a investigación con checkpoints intermedios |

La comparación se limita a parámetros, contexto y licencia: no hay datos de benchmarks de este checkpoint que permitan contrastar rendimiento con las alternativas.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada: no hay benchmarks que permitan estimar su calidad real frente a alternativas.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas, propio de un modelo de 379M parámetros entrenado con un presupuesto limitado de tokens.
- Sesgos heredados de FineWeb-Edu, con sesgo hacia contenido educativo en inglés y posible infrarrepresentación de otros idiomas y registros.
- Longitud de contexto no documentada: no debe asumirse una ventana concreta sin inspeccionar `config.json`.
- Ausencia de tokenizador en el repositorio: requiere resolver la tokenización con el framework NanoGPT Pro, lo que complica el uso con `transformers` estándar.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo (checkpoint intermedio, sin evaluación) desaconseja su uso en producción.
- El nombre del repositorio y las fechas de creación (2026) deben tratarse con cautela; conviene verificar la procedencia antes de integrarlo en cualquier pipeline.

## Enlaces

- Hugging Face: https://huggingface.co/phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13512741-step100000
- NanoGPT (Karpathy): https://github.com/karpathy/nanoGPT
- FineWeb-Edu (Hugging Face): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Triton: https://github.com/triton-lang/triton
