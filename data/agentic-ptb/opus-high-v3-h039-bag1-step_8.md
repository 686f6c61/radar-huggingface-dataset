# agentic-ptb/opus-high-v3.h039.bag1.step_8

## Resumen

El modelo `agentic-ptb/opus-high-v3.h039.bag1.step_8` es un checkpoint intermedio derivado de un experimento de entrenamiento agéntico denominado AgentPTB **opus-high-v3**, ejecutado mediante Claude Code. El autor, `agentic-ptb`, lo publica con la etiqueta `negative-results`, indicando explícitamente que el run no encontró mejora alguna en los pesos entrenados. Se trata de un artefacto de reproducibilidad y estudio cualitativo, no de un modelo listo para uso práctico.

El checkpoint se construye a partir del modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros, y se distribuye en formato safetensors bajo licencia Apache 2.0. La model card advierte que no debe inferirse calidad a partir de su publicación; el run alcanzó la hora de ejecución `h039` y el checkpoint corresponde al paso `step_8` del subdirectorio `scratch/agent/bag1/weights`. Este contexto lo convierte en un caso de estudio sobre resultados negativos en entrenamiento agéntico, más que en una herramienta utilizable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-9B-Base (transformer denso, detalles no publicados) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9 mil millones de parámetros. No se han publicado detalles sobre la arquitectura interna (número de capas, heads, dimensiones ocultas) en la información disponible.

El entrenamiento forma parte del proyecto AgentPTB, donde se utiliza Claude Code para generar datos y ejecutar rutinas de fine-tuning (SFT) de forma agéntica. En este run concreto (`opus-high-v3`), los cinco intentos de SFT regresaron, es decir, las métricas de validación empeoraron respecto al modelo base, y el run se detuvo sin producir ninguna mejora. El checkpoint `step_8` es un punto intermedio retenido para reproducibilidad; no se documentan detalles sobre el dataset de entrenamiento, número de tokens, ni técnicas como RLHF o DPO.

## Capacidades

No se han reportado capacidades específicas para este checkpoint. Al ser un resultado negativo y un artefacto intermedio, no se puede atribuir ninguna habilidad funcional (generación de texto, razonamiento, código, tool calling, etc.) sin una evaluación independiente. La model card desaconseja explícitamente inferir calidad a partir de su publicación.

## Casos de uso

Dado su carácter de resultado negativo, no se recomienda su uso en aplicaciones prácticas. Los únicos escenarios plausibles son:

- Reproducibilidad de experimentos: permite replicar el run `opus-high-v3` y verificar la ausencia de mejora.
- Estudio cualitativo de fallos: analizar por qué el fine-tuning agéntico regresó en este caso, comparando con runs exitosos.
- Investigación sobre entrenamiento agéntico: como ejemplo de control negativo en metodologías de AutoML o generación de datos con agentes.
- Depuración de pipelines: sirve para validar la integridad del proceso de guardado de checkpoints y metadatos.
- Comparación de arquitecturas: usado como baseline fallido en estudios sobre estabilidad de SFT en modelos de 9B.
- Educación: material didáctico para ilustrar la importancia de reportar resultados negativos en la comunidad open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El run se clasifica como `negative-results`, lo que implica que no se superaron las métricas del modelo base en ninguna evaluación reportada.

## Requisitos de hardware

No se dispone de datos específicos de requisitos de hardware para este checkpoint. No obstante, al tratarse de un modelo de ~9.4B parámetros en precisión fp32 (tamaño de repo 18.8 GB), se puede estimar:

- VRAM para inferencia en fp16: aproximadamente 19 GB (sin cuantización).
- VRAM para inferencia en int8: aproximadamente 9.5 GB (si se aplicara cuantización, aunque no se ofrecen versiones cuantizadas).
- VRAM para inferencia en int4: aproximadamente 5 GB (estimación teórica, no disponible en el repo).
- GPU recomendadas: tarjetas con 24 GB o más (RTX 3090/4090, A100, H100) para fp16; GPUs de 12 GB podrían servir con cuantización externa.
- Opciones de despliegue: vLLM, llama.cpp u Ollama podrían cargar el modelo tras conversión, pero no se proporcionan artefactos listos para estos motores.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa por falta de datos de rendimiento y configuración. A modo orientativo, se listan modelos de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-9B-Base (base) | ~9.4B | no disponible | Apache 2.0 | HuggingFace |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 | HuggingFace |
| Mistral-7B-v0.3 | 7.3B | 32K | Apache 2.0 | HuggingFace |

Este checkpoint no ofrece ninguna ventaja funcional sobre estos modelos; su única utilidad es como referencia de un experimento fallido.

## Limitaciones y advertencias

- El run se clasifica como `negative-results`: no hay mejora de pesos entrenados, por lo que el modelo no debe usarse en producción.
- No se han publicado métricas de calidad, sesgos o alucinación; cualquier uso implicaría riesgos desconocidos.
- La longitud de contexto y los idiomas soportados no están documentados; se heredan presumiblemente de Qwen3.5-9B-Base, pero sin confirmación.
- No se ofrecen versiones cuantizadas ni artefactos listos para inferencia optimizada (GGUF, AWQ, GPTQ).
- Al ser un checkpoint intermedio, puede contener estados de optimización o pesos no consolidados que afecten a la estabilidad de la inferencia.
- La licencia Apache 2.0 permite uso comercial, pero la falta de validación hace desaconsejable su adopción en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h039.bag1.step_8
- Dataset asociado del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de proyectos AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
