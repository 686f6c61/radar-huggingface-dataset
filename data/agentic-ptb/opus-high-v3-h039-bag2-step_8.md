# agentic-ptb/opus-high-v3.h039.bag2.step_8

## Resumen

`opus-high-v3.h039.bag2.step_8` es un checkpoint intermedio derivado de un proceso de entrenamiento experimental denominado **AgentPTB opus-high-v3**, publicado por el usuario `agentic-ptb` en Hugging Face. Se trata de un artefacto de investigación creado mediante una ejecución de Claude Code, diseñado para estudiar la reproducibilidad y el comportamiento cualitativo de un pipeline de ajuste fino sobre el modelo base `Qwen/Qwen3.5-9B-Base`.

El modelo tiene 9.409.813.744 parámetros (~9,4B) y se distribuye en formato `safetensors` con un tamaño de repositorio de 18,8 GB. Su licencia es Apache-2.0, lo que permite uso comercial con atribución. Sin embargo, la model card del autor incluye una advertencia explícita: se trata de un checkpoint intermedio/derivado que **no mostró ninguna mejora en los pesos entrenados**; el resultado del run fue negativo. Por tanto, no debe inferirse calidad del modelo a partir de su publicación, y su uso práctico queda limitado a fines de estudio y reproducción.

La relevancia de este artefacto radica en su carácter de registro de un experimento fallido, útil para la comunidad que investiga metodologías de entrenamiento y evaluación de agentes. No es un modelo listo para producción ni para tareas de inferencia general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.5-9B-Base (transformer denso, no confirmado oficialmente) |
| Parámetros totales | 9.409.813.744 (~9,4B) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponibles |
| Idiomas soportados | No disponibles (heredados del modelo base, no verificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint intermedio de un run de entrenamiento denominado `opus-high-v3`, ejecutado mediante Claude Code como parte del proyecto AgentPTB. El proceso consistió en varias ejecuciones de ajuste fino (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. Según la información del dataset asociado (`agentic-ptb/opus-high-v3-data`), el run no produjo ninguna mejora en los pesos entrenados; los cinco runs de SFT regresaron, lo que llevó a los autores a retener este checkpoint únicamente con fines de reproducibilidad y estudio cualitativo.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni la metodología exacta de ajuste (por ejemplo, si se usó RLHF o DPO). La arquitectura subyacente corresponde al modelo base Qwen3.5-9B-Base, que es un transformer denso de aproximadamente 9,4B parámetros, pero no se confirman detalles adicionales como el tipo de atención o la longitud de contexto original.

## Capacidades

No hay información disponible sobre las capacidades específicas de este checkpoint. Al ser un derivado del modelo base Qwen3.5-9B-Base, podría heredar capacidades generales de generación de texto, razonamiento y código de dicho modelo, pero esto no está verificado para este checkpoint concreto. Dado el resultado negativo del entrenamiento, no se recomienda asumir ninguna capacidad funcional.

## Casos de uso

Dado su carácter de artefacto de investigación con resultados negativos, no se identifican casos de uso prácticos en producción. Los posibles usos se limitan a:

- **Reproducibilidad experimental**: investigadores pueden utilizar este checkpoint para reproducir el pipeline de entrenamiento de AgentPTB y verificar los resultados negativos documentados.
- **Estudio cualitativo de fallos**: análisis de por qué el ajuste fino no mejoró los pesos, lo que puede informar sobre problemas en la metodología o en los datos.
- **Comparación de checkpoints**: comparar este paso intermedio (step_8) con otros checkpoints del mismo run para trazar la evolución (o ausencia de ella) de los pesos.
- **Validación de herramientas**: uso como caso de prueba para herramientas de evaluación de modelos que necesiten manejar checkpoints intermedios con metadatos de ejecución.
- **Documentación de procesos negativos**: referencia para la comunidad sobre cómo documentar y publicar resultados negativos en entrenamiento de LLMs.
- **Pruebas de infraestructura**: test de pipelines de descarga, carga y cuantización de modelos grandes sin riesgo de afectar aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de rendimiento, y el autor advierte explícitamente que no se debe inferir calidad del modelo a partir de su publicación. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

Dado que no hay datos oficiales de rendimiento ni de despliegue, se ofrecen estimaciones basadas en el tamaño de parámetros (9,4B) y el formato de pesos (safetensors en FP32/FP16 según el tamaño del repo):

- **VRAM estimada para inferencia**: aproximadamente 19-20 GB en FP16 (sin cuantización), ~10 GB en cuantización de 4 bits (GPTQ/AWQ), ~6-7 GB en cuantización de 2-3 bits (GGUF Q4_K_M, Q3_K_M). Estas cifras son orientativas y dependen de la longitud de contexto y del backend utilizado.
- **GPU recomendadas**: una GPU con 24 GB de VRAM (RTX 3090/4090, A5000) puede ejecutar el modelo en FP16; GPUs con 12-16 GB (RTX 3080/4070, A4000) requerirían cuantización. Para producción con mayor throughput, se recomienda A100 (80 GB) o H100.
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutarlo en GPU de consumo con cuantización (por ejemplo, RTX 4090 con 24 GB para FP16, o RTX 3060 con 12 GB usando GGUF Q4).
- **Opciones de despliegue**: al ser un checkpoint intermedio no destinado a producción, no se recomienda desplegarlo. En caso de hacerlo por motivos de estudio, se podría usar vLLM, llama.cpp, Ollama o TGI, siempre que se convierta el formato de pesos a GGUF o se use el safetensors original con backends compatibles.
- **Latencia y throughput**: no disponibles. Dado el resultado negativo del entrenamiento, no se justifica medir estos parámetros.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa justa. El modelo base `Qwen/Qwen3.5-9B-Base` es la referencia directa, pero no se conocen sus métricas exactas en este contexto. Otros modelos densos de ~9B parámetros (por ejemplo, Llama 3.1 8B, Mistral 7B) podrían servir como comparación estructural, pero al carecer de benchmarks no es posible realizar una comparativa cuantitativa. La siguiente tabla resume diferencias estructurales conocidas:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `opus-high-v3.h039.bag2.step_8` | 9,4B | No disponible | Apache-2.0 | Público en HF |
| Qwen/Qwen3.5-9B-Base | 9,4B | No disponible (típicamente 32K-128K) | Apache-2.0 | Público en HF |
| Llama 3.1 8B (referencia) | 8,03B | 128K | Llama 3.1 Community License | Público en HF |

## Limitaciones y advertencias

- **Resultado negativo confirmado**: el autor indica explícitamente que el run no produjo ninguna mejora en los pesos entrenados; el modelo no debe usarse para inferencia real.
- **Checkpoint intermedio**: es un paso (step_8) de un proceso mayor; no es un modelo final ni optimizado.
- **Sin datos de capacidad**: no se han verificado las capacidades reales del modelo tras el entrenamiento; podría presentar degradación respecto al base.
- **Sesgos del modelo base**: al derivar de Qwen3.5-9B-Base, puede heredar sesgos y limitaciones del modelo original (por ejemplo, sesgos culturales o lingüísticos), aunque no hay datos específicos.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, existe riesgo de alucinación, pero al no estar validado, este riesgo no está caracterizado.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial con atribución, pero dado el estado del modelo, no se recomienda su uso en productos.
- **Sin soporte oficial**: no hay documentación adicional, guías de uso ni mantenimiento por parte del autor.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/agentic-ptb/opus-high-v3.h039.bag2.step_8)
- [Dataset asociado al run](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de experimentos AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelo base Qwen/Qwen3.5-9B-Base en Hugging Face](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
