# dvader13/olmo2-1b-sft-s1-378b

## Resumen

El repositorio `dvader13/olmo2-1b-sft-s1-378b` contiene diez checkpoints de fine-tuning supervisado (SFT) sobre el modelo base OLMo-2-1B de AI2, generados por el autor `dvader13`. Cada checkpoint corresponde a una fracción de la "dosis" completa de SFT, desde el 10 % hasta el 100 %, lo que permite estudiar cómo varía el rendimiento del modelo según la cantidad de datos de ajuste aplicados. El modelo base, OLMo-2-1B, es un transformer decoder-only de 1 000 millones de parámetros entrenado por el Allen Institute for AI (Ai2) con 378 000 millones de tokens en su etapa de pretraining (`stage1-step180000-tokens378B`).

La relevancia de este repositorio radica en su carácter de recurso de investigación abierto: ofrece una colección de checkpoints intermedios de SFT en formato `bf16` y solo para inferencia, sin estado de optimizador, lo que facilita reproducir experimentos sobre escalado de SFT o curvas de aprendizaje. No se dispone de información sobre el dataset de ajuste utilizado, ni sobre las capacidades específicas del modelo resultante, por lo que la ficha se limita a los datos técnicos publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2-1B de AI2) |
| Parametros totales | 1 000 millones (1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (solo inferencia, sin estado de optimizador) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es OLMo-2-1B, un transformer decoder-only desarrollado por el Allen Institute for AI (Ai2) como parte de la familia OLMo 2, caracterizada por su total apertura (datos, código, recetas de entrenamiento y evaluaciones). El pretraining se realizó con 378 000 millones de tokens, según el nombre del rung `stage1-step180000-tokens378B`. Sobre este modelo base, `dvader13` aplicó un proceso de SFT del que se han guardado 10 checkpoints con dosis crecientes (10 %, 20 %, ..., 100 %), almacenados en `bf16` y únicamente para inferencia. No se especifica el conjunto de datos de SFT ni el método concreto de ajuste (p. ej., si se usó instrucciones, datos de chat o tareas específicas). Tampoco se detallan innovaciones técnicas en el proceso de entrenamiento.

## Capacidades

- Generación de texto autoregresiva estándar, heredada del modelo base OLMo-2-1B.
- Capacidades de razonamiento y comprensión de lenguaje típicas de un modelo de 1B de parámetros, aunque sin datos publicados de evaluación.
- No se documenta soporte de tool calling, function calling, ni capacidades multimodales.
- No se especifican idiomas soportados ni capacidades multilingües concretas.
- Al ser un checkpoint de SFT, su comportamiento puede variar según la dosis aplicada, pero no se dispone de evaluaciones que confirmen mejoras o regresiones.

## Casos de uso

- **Investigación sobre el escalado del SFT**: este repositorio es ideal para estudiar cómo varía el rendimiento de un modelo de 1B según la cantidad de datos de SFT (curvas de dosis-respuesta). Un investigador puede cargar los 10 checkpoints y comparar métricas de calidad (p. ej., MMLU, HumanEval) para identificar el punto de rendimiento decreciente.
- **Análisis de curvas de aprendizaje en fine-tuning**: permite trazar la evolución de la pérdida o de métricas de tarea a lo largo de las dosis de SFT, útil para publicaciones o para decidir la cantidad óptima de datos de ajuste en modelos pequeños.
- **Experimentos de fusión de modelos**: con los checkpoints en `bf16`, se pueden realizar interpolaciones de pesos (model soup) o promediados entre diferentes dosis para mejorar la robustez.
- **Evaluación de técnicas de regularización**: si se conoce el dataset de SFT, se puede comparar el efecto de la dosis frente a métodos de regularización (p. ej., dropout) en modelos base abiertos.
- **Docencia y demostraciones**: como modelo abierto y pequeño, puede usarse en entornos educativos para ilustrar el proceso de SFT y su impacto, sin requerir recursos de hardware elevados.
- **Despliegue ligero de prototipos**: para pruebas de concepto de generación de texto en entornos con recursos limitados, aunque su calidad esperada será inferior a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para estos checkpoints, ni comparaciones con el modelo base o con otros modelos de 1B.

## Requisitos de hardware

- **VRAM estimada por checkpoint**: un modelo de 1B en `bf16` ocupa aproximadamente 2 GB en pesos. Con overhead de activaciones y memoria adicional, se recomienda al menos 4 GB de VRAM para inferencia con contexto corto (p. ej., 512 tokens).
- **GPU recomendadas**: cualquier GPU consumer con 6 GB o más de VRAM es suficiente, como RTX 3060 (12 GB), RTX 3090 (24 GB) o RTX 4090 (24 GB). Para entornos de servidor, una A10G (24 GB) o A100 (40/80 GB) permite cargar varios checkpoints simultáneamente.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo de gama media y alta. Un checkpoint individual se puede cargar en una RTX 3060 de 12 GB con contexto moderado.
- **Opciones de despliegue**: el formato `safetensors` es compatible con `transformers` de HuggingFace, `vLLM`, `TGI` y `llama.cpp` (previo conversión a GGUF). También puede usarse con `Ollama` si se convierte a formato GGUF. Para inferencia en CPU, `llama.cpp` es una opción viable.
- **Latencia y throughput**: no se conocen mediciones específicas para estos checkpoints. Un modelo de 1B en una GPU moderna (p. ej., RTX 4090) genera típicamente entre 50 y 100 tokens por segundo con `vLLM`, pero el valor depende del contexto y del backend.

## Comparativa con modelos similares

No hay información sobre rendimiento comparado con otros modelos de 1B. Como referencia arquitectónica, se puede comparar con el modelo base OLMo-2-1B (sin SFT) y con otros modelos abiertos de 1B como TinyLlama-1.1B o Qwen2.5-1.5B, pero no se dispone de datos de benchmarks para estos checkpoints concretos.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| OLMo-2-1B (base) | 1B | no disponible | Apache-2.0 | safetensors |
| TinyLlama-1.1B | 1.1B | 2048 tokens | Apache-2.0 | safetensors |
| Qwen2.5-1.5B | 1.5B | 32768 tokens | Apache-2.0 | safetensors |

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de 1B entrenado con datos abiertos, es esperable que tenga sesgos presentes en el corpus de entrenamiento y riesgo de alucinación, aunque no se documentan evaluaciones específicas.
- **Falta de datos de calidad**: no se proporciona ninguna métrica de rendimiento, por lo que no se puede garantizar la calidad de los checkpoints para tareas concretas.
- **Contexto limitado**: la longitud de contexto no está documentada; probablemente sea de 2048 o 4096 tokens, pero no se confirma.
- **Idiomas**: no se especifica qué idiomas soporta; el modelo base de OLMo-2 está entrenado principalmente en inglés, por lo que el SFT probablemente también se centra en ese idioma.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías de calidad ni soporte.
- **Tamaño del repositorio**: 29.7 GB en total, lo que incluye los 10 checkpoints. Para uso individual, es recomendable descargar solo el checkpoint deseado.
- **Sin estado de optimizador**: los pesos son solo para inferencia, no se puede continuar el entrenamiento directamente desde estos checkpoints sin re-entrenar el optimizador.

## Enlaces

- Repositorio HuggingFace: [dvader13/olmo2-1b-sft-s1-378d](https://huggingface.co/dvader13/olmo2-1b-sft-s1-378d)
- Modelo base OLMo-2-1B en HuggingFace: [allenai/OLMo-2-0425-1B](https://huggingface.co/allenai/OLMo-2-0425-1B)
- Página oficial de OLMo 2 de Ai2: [https://allenai.org/olmo2](https://allenai.org/olmo2)
- Página general de OLMo de Ai2: [https://allenai.org/olmo](https://allenai.org/olmo)
- Repositorio de entrenamiento de OLMo: [https://github.com/allenai/OLMo](https://github.com/allenai/OLMo)
- Pipeline de fine-tuning para OLMo2 1B: [https://github.com/fkuhne/olmo_sft](https://github.com/fkuhne/olmo_sft)
