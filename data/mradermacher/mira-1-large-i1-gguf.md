# mradermacher/Mira-1-large-i1-GGUF

## Resumen

Mira-1-large-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo de lenguaje Mira-1-large, desarrollado por Smilyai Labs. El cuantizador mradermacher ha preparado múltiples versiones comprimidas del modelo original, que cuenta con 14 768 millones de parámetros y está basado en la arquitectura Qwen3, según las etiquetas de su tarjeta de modelo. El modelo está orientado a tareas de conversación, razonamiento, generación de código y personalidad, aunque no se dispone de detalles técnicos adicionales sobre su entrenamiento o configuración.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de ~14 700 millones de parámetros en hardware local mediante formatos GGUF, con tamaños de archivo que van desde 3,9 GB hasta 12,2 GB según la cuantización elegida. Esto permite desplegarlo en estaciones de trabajo con GPU de consumo o incluso solo con CPU, gracias a la optimización de los cuantificadores. No obstante, la información disponible se limita a la propia cuantización; no se proporcionan datos sobre el modelo base original más allá de su nombre y el hecho de que es un adaptador LoRA sobre una base Qwen3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (según etiquetas del modelo cuantizado) |
| Parametros totales | 14 768 307 200 (14,77 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Other (no especificada) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna exacta del modelo base Mira-1-large. Las etiquetas del modelo cuantizado indican que está basado en Qwen3, lo que sugiere una arquitectura transformer densa, pero no se confirma el número de capas, cabezas de atención, ni el tamaño de los vectores de embedding. Tampoco se ha documentado el proceso de entrenamiento: no se conocen el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. La cuantización imatrix realizada por mradermacher utiliza una matriz de importancia para mejorar la calidad de la compresión, pero no altera la arquitectura subyacente.

## Capacidades

- Generación de texto y conversación multi-turno (según la etiqueta `conversational`).
- Razonamiento y resolución de problemas (`reasoning`).
- Generación de código (`code`).
- Personalidad y estilo conversacional (`personality`).
- No se ha confirmado explícitamente soporte de tool calling, agentes, visión o audio en la información proporcionada.
- Capacidades multilingües limitadas: solo se especifica inglés.

## Casos de uso

Aunque no hay casos de uso documentados específicamente, el formato GGUF y el tamaño del modelo permiten plantear escenarios prácticos para entornos de inferencia local:

- **Despliegue en hardware de consumo**: las cuantizaciones Q4_K_M (9,1 GB) o Q4_K_S (8,7 GB) pueden ejecutarse en una GPU con 10-12 GB de VRAM (p. ej., RTX 3080/4080) o en CPU con suficiente RAM, gracias al formato GGUF.
- **Prototipado de asistentes conversacionales**: su capacidad para mantener conversaciones y su personalidad pueden servir para crear chatbots de prueba en entornos de desarrollo.
- **Generación de código en entornos aislados**: el modelo puede ayudar a autocompletar o generar fragmentos de código en un IDE o en scripts, siempre que no se requiera integración con herramientas externas.
- **Razonamiento y análisis de texto**: útil para tareas de razonamiento lógico o explicación de conceptos, dado su etiqueta `reasoning`.
- **Aprendizaje y experimentación**: para estudiantes o investigadores que quieran explorar el comportamiento de un modelo de 14B sin depender de la nube, gracias a la facilidad de uso con llama.cpp, Ollama o LM Studio.
- **Pruebas de personalización con LoRA**: al ser un adaptador LoRA, se podría investigar su integración en pipelines de fine-tuning, aunque no se aportan más detalles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros indicadores para este modelo cuantizado ni para el modelo base.

## Requisitos de hardware

- **VRAM estimada**: según el tamaño de los archivos GGUF, las cuantizaciones más pequeñas (IQ1_M: 3,9 GB) caben en GPUs con 4 GB de VRAM, mientras que Q6_K (12,2 GB) requiere al menos 13 GB de VRAM para dejar margen de contexto.
- **GPU recomendadas**: para cuantizaciones Q4_K_M (9,1 GB) se recomienda una GPU con 12 GB de VRAM (RTX 3060, RTX 4070, etc.). Para Q6_K se necesita una GPU con 16 GB o más (RTX 4080, A100).
- **Compatibilidad con GPU de consumo**: sí, la mayoría de las cuantizaciones son compatibles con GPUs de consumo de 8-12 GB, y las más pequeñas (IQ1_M, IQ2_M) incluso con 4 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, TGI (con conversión de GGUF a otros formatos), o vLLM con conversión previa a safetensors.
- **Latencia y throughput**: no se dispone de datos medidos; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (por ejemplo, Qwen2.5-14B, Llama-3-8B, Mistral-7B) en cuanto a rendimiento o características. No se puede establecer una comparación basada en datos reales.

## Limitaciones y advertencias

- **Licencia**: la licencia es `other`, lo que implica que los términos de uso no están claros; se recomienda revisar el modelo base (Smilyai-labs/Mira-1-large) antes de un uso comercial.
- **Riesgo de alucinación**: no se documenta ningún sistema de mitigación; como todo modelo de lenguaje, puede generar información falsa o inventada.
- **Sesgos**: no se ha publicado ninguna evaluación de sesgos; el entrenamiento en inglés puede producir respuestas con sesgos culturales o lingüísticos.
- **Contexto limitado**: al no especificarse la longitud de contexto, se desconoce el límite exacto; es probable que se herede la configuración de Qwen3 (típicamente 32K tokens), pero no se confirma.
- **Cuantización**: las cuantizaciones extremas (IQ1_M, IQ2_M) pueden degradar notablemente la calidad de las respuestas; se recomienda usar Q4_K_M o superior para una calidad aceptable.
- **Reproducibilidad**: el modelo cuantizado es una compresión de un adaptador LoRA sobre Qwen3; los resultados pueden variar respecto al modelo original sin cuantizar.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/mradermacher/Mira-1-large-i1-GGUF)
- [Perfil de mradermacher en Hugging Face](https://huggingface.co/mradermacher)
- [Modelo base (referencia)](https://huggingface.co/Smilyai-labs/Mira-1-large) (nombre indicado en la model card, no verificado en la búsqueda)
