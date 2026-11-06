# nm-testing/Qwen3-30B-A3B-FP8_DYNAMIC-e2e

## Resumen

`nm-testing/Qwen3-30B-A3B-FP8_DYNAMIC-e2e` es una versión cuantizada a FP8 del modelo Qwen3-30B-A3B, publicada por la cuenta de pruebas `nm-testing`. Se trata de un artefacto derivado del Qwen3-30B-A3B original de Alibaba Qwen, una arquitectura Mixture of Experts (MoE) con 30.532.122.624 parámetros totales según los pesos en safetensors y aproximadamente 3.000 millones de parámetros activos por token (denominación A3B). La cuantización reduce los pesos y activaciones de 16 a 8 bits, lo que disminuye el tamaño en disco y los requisitos de VRAM en torno al 50 % respecto al modelo en BF16.

El repositorio tiene un carácter claramente experimental: la cuenta `nm-testing` se emplea habitualmente para validar pipelines de cuantización con `compressed-tensors` y `llm-compressor`, y el sufijo `e2e` sugiere una prueba de extremo a extremo del proceso de cuantización dinámica. Por ello, no debe considerarse una distribución oficial de Qwen ni un modelo listo para producción sin validación previa.

Su relevancia radica en que permite ejecutar un MoE de 30B con activación de ~3B en hardware más modesto, manteniendo la ventana de contexto nativa de la familia Qwen3 (hasta 128K tokens en el modelo base, aunque este dato no se confirma en la información del repositorio) y las capacidades de razonamiento y tool calling del modelo original. No obstante, la información publicada en la ficha de Hugging Face es mínima y muchos datos deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (clase `qwen3_moe`) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (denominacion A3B sugiere ~3B activos, no confirmado en el repo) |
| Longitud de contexto | no disponible en el repositorio (el Qwen3-30B-A3B base soporta hasta 128K tokens) |
| Tipos de cuantizacion | FP8 (pesos y activaciones, esquema dinamico via `compressed-tensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-30B-A3B, es un transformer con capas de mezcla de expertos (MoE): cada token activa un subconjunto reducido de expertos, de modo que el coste computacional por token se aproxima al de un modelo denso de ~3B pese a contener más de 30B de parámetros totales. Esta ficha corresponde a una versión cuantizada, no a un reentrenamiento: los pesos se han convertido a FP8 mediante cuantización de pesos y activaciones, con un esquema dinámico (los parámetros de escala se calculan en tiempo de ejecución en lugar de fijarse estáticamente). El repositorio hermano `nm-testing/Qwen3-30B-A3B-FP8-block` documenta el mismo procedimiento sobre el modelo base Qwen/Qwen3-30B-A3B.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo fases de RLHF o DPO en este repositorio concreto; esos detalles corresponden al modelo original de Qwen y no se reproducen aquí. La innovación técnica relevante es la propia cuantización FP8 con `compressed-tensors`, que reduce el espacio en disco (31,2 GB en el repo) y la memoria de GPU necesaria, manteniendo presumiblemente una degradación de calidad limitada, aunque no se publican métricas de evaluación en la información disponible.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del Qwen3-30B-A3B base.
- Generación de código y matemáticas (capacidades del modelo original, no verificadas en esta versión cuantizada).
- Soporte de tool calling y function calling (propio de la familia Qwen3; no confirmado explícitamente en el repo).
- Modo "thinking" o razonamiento extendido, característico de Qwen3 (no confirmado en este artefacto).
- Capacidades multilingües: no disponibles en la ficha del repositorio.
- No se documenta soporte de visión ni audio en este repositorio.

## Casos de uso

- Despliegue de un MoE de 30B en una sola GPU de 48 GB: la cuantización FP8 reduce el peso de los pesos a unos 31 GB, lo que permite cargar el modelo en una A6000, L40S o A100 de 40 GB con margen limitado para KV cache.
- Servicio de inferencia con vLLM: al ser un checkpoint `compressed-tensors` en safetensors, puede cargarse en vLLM (con soporte FP8) para servir peticiones con throughput alto gracias a la activación dispersa del MoE.
- Pruebas de pipelines de cuantización: útil como referencia para validar recetas de `llm-compressor` y comparar calidad frente al modelo en BF16 antes de adoptar FP8 en producción.
- Asistentes de código en entornos con VRAM limitada: permite ejecutar un modelo de la familia Qwen3 con buena capacidad de generación de código sin necesidad de múltiples GPUs.
- Prototipado de agentes con tool calling: el modelo base soporta llamadas a funciones, por lo que puede integrarse en flujos de agentes, siempre validando el comportamiento tras la cuantización.
- Evaluación comparativa de precisión: sirve para medir la degradación de calidad (perplejidad, benchmarks) entre FP8 dinámico y BF16 en un MoE de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~31 GB solo para pesos en FP8; con KV cache y overhead de runtime, se recomienda al menos 40-48 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB, A6000 48 GB.
- En GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin offloading a CPU o cuantización adicional a 4 bits (no incluida en este repo).
- Opciones de despliegue: vLLM con soporte FP8 y `compressed-tensors`; llama.cpp/Ollama no soportan directamente este formato FP8, requerirían conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nm-testing/Qwen3-30B-A3B-FP8_DYNAMIC-e2e | 30,5B totales (MoE) | no disponible | FP8 dinamico | no disponible | Hugging Face (repo de pruebas) |
| nm-testing/Qwen3-30B-A3B-FP8-block | 30,5B totales (MoE) | no disponible | FP8 por bloques | no disponible | Hugging Face (repo de pruebas) |
| Qwen/Qwen3-30B-A3B (base) | 30,5B totales (MoE) | 128K (segun Qwen) | BF16 | Apache 2.0 (segun Qwen) | Hugging Face |

## Limitaciones y advertencias

- Repositorio de pruebas (`nm-testing`): no es una distribución oficial ni está validado para producción.
- Licencia no especificada en el repositorio: no se puede confirmar el uso comercial; habría que remitirse a la licencia del modelo base Qwen3-30B-A3B.
- Sin tarjeta de modelo detallada: no hay información sobre idiomas, evaluación de calidad tras la cuantización ni degradación esperada.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la cuantización FP8 si no se valida.
- La cuantización dinámica FP8 puede introducir diferencias numéricas frente a BF16; se recomienda evaluar con benchmarks propios antes de desplegar.
- No cabe en GPUs de consumo de 24 GB sin técnicas adicionales de offloading.
- No dispone de proveedor de inferencia asociado en Hugging Face.

## Enlaces

- Repositorio principal: https://huggingface.co/nm-testing/Qwen3-30B-A3B-FP8_DYNAMIC-e2e
- Variante relacionada: https://huggingface.co/nm-testing/Qwen3-30B-A3B-FP8-block
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
