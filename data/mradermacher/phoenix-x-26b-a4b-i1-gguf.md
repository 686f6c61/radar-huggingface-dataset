# mradermacher/Phoenix-X-26B-A4B-i1-GGUF

## Resumen

Phoenix-X-26B-A4B-i1 es una versión cuantizada en formato GGUF del modelo Phoenix-X-26B-A4B, originalmente publicado por Vortex5 y convertido por mradermacher. El nombre sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y aproximadamente 4 mil millones de parámetros activos por token, aunque esta interpretación no está confirmada por la documentación oficial. El repositorio contiene únicamente los pesos cuantizados en formato GGUF, lo que permite su ejecución en entornos con recursos limitados mediante motores como llama.cpp u Ollama.

La relevancia de esta ficha radica en que el modelo no dispone de una model card detallada en el repositorio de HuggingFace, por lo que la información aquí presentada se limita a los datos técnicos extraídos del propio repositorio y a inferencias razonables a partir del nombre. No se ha publicado información sobre el proceso de entrenamiento, la licencia o los idiomas soportados, lo que constituye una limitación importante para su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida por el nombre, no confirmada) |
| Parametros totales | 25.233.142.046 (26B) |
| Parametros activos | 4B (inferido por el sufijo A4B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo. El nombre "Phoenix-X-26B-A4B" sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones de parámetros activos por token, un patrón común en modelos como Mixtral 8x7B o Qwen1.5-MoE. Sin embargo, esta interpretación no está respaldada por documentación técnica publicada.

Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. La ausencia de una model card oficial impide confirmar cualquier detalle sobre el proceso de entrenamiento o las innovaciones técnicas empleadas.

## Capacidades

- No se dispone de información verificada sobre las capacidades específicas del modelo.
- Dado su tamaño (26B totales, 4B activos) y su formato GGUF, es plausible que pueda realizar generación de texto, razonamiento y tareas conversacionales, pero no hay evidencia documentada.
- No se confirma soporte para tool calling, agentes, visión o audio.
- La etiqueta "conversational" en el repositorio sugiere que está orientado a diálogo, pero no hay detalles adicionales.

## Casos de uso

Dado que la información disponible es insuficiente, no es posible recomendar casos de uso concretos con garantías. Cualquier aplicación en producción requeriría primero validar el modelo con datos propios. No obstante, por su tamaño y formato, podría explorarse en los siguientes escenarios, siempre con cautela:

- **Prototipado rápido en entornos sin GPU dedicada**: gracias a las cuantizaciones Q4_K_M o Q5_K_M, el modelo podría ejecutarse en CPU con 16-32 GB de RAM para pruebas de concepto de chatbots o asistentes textuales.
- **Investigación académica sobre modelos MoE**: si se confirma la arquitectura, podría usarse para estudiar el comportamiento de modelos con 4B activos frente a otros de similar tamaño.
- **Despliegue en edge computing**: las cuantizaciones IQ2_M o IQ1_M permiten reducir el uso de memoria, aunque con pérdida de calidad, para entornos con restricciones severas de recursos.
- **Fine-tuning con PEFT**: al tener solo 4B activos, el fine-tuning con LoRA podría ser viable en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB), si se dispone de los pesos originales en safetensors.
- **Evaluación comparativa de cuantizaciones**: el repositorio ofrece múltiples niveles de cuantización, lo que permite medir el impacto en la calidad según el nivel de compresión.
- **Uso como base para agentes conversacionales**: si el modelo demuestra buen rendimiento en diálogo, podría integrarse en sistemas de atención al cliente, siempre que se valide su comportamiento y se mitiguen los riesgos de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende de la cuantización. Para Q4_K_M (≈ 14-15 GB) se necesitan al menos 16 GB de VRAM; para Q2_K (≈ 9-10 GB) bastan 12 GB. Las cuantizaciones IQ1_M e IQ1_S requieren menos de 8 GB.
- **GPU recomendadas**: para las cuantizaciones más altas (Q6_K, Q8_0 si existiera), se recomienda una GPU con 24 GB o más (RTX 3090/4090, A100). Para cuantizaciones medias (Q4_K_M), una RTX 4080 o 3090 es suficiente. Para las más bajas, una RTX 3060 de 12 GB podría ser viable.
- **Compatibilidad con GPU de consumo**: sí, las cuantizaciones IQ2_M, Q3_K_M y Q4_K_M caben en GPUs de 12-16 GB, aunque con riesgo de degradación de calidad.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. También se puede usar vLLM si se convierte a safetensors, pero el repositorio solo ofrece GGUF.
- **Latencia y throughput**: no disponibles. En CPU, se estima una velocidad de 5-15 tokens/s con cuantizaciones bajas en hardware moderno (por ejemplo, un Ryzen 9 7950X), pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo parece ser un MoE de 26B con 4B activos, similar en concepto a Mixtral 8x7B (47B totales, 12B activos) o a Qwen1.5-MoE-A2.7B (14B totales, 2.7B activos), pero no hay datos de rendimiento ni confirmación de la arquitectura. Por tanto, se omite la comparativa por falta de datos contrastables.

## Limitaciones y advertencias

- **Información oficial ausente**: no hay model card, ni documentación técnica, ni licencia clara. Esto impide conocer los términos de uso comercial y los riesgos legales.
- **Sesgos y alucinaciones**: al no conocerse el dataset de entrenamiento ni el proceso de alineación, no se puede evaluar el riesgo de sesgos ni la fiabilidad de las respuestas.
- **Idiomas**: se desconoce qué idiomas soporta, por lo que su uso en español u otros idiomas no está garantizado.
- **Calidad de las cuantizaciones**: las cuantizaciones extremas (IQ1_M, IQ1_S) degradan severamente la calidad y pueden producir salidas incoherentes.
- **Compatibilidad**: al ser un modelo GGUF, requiere motores específicos; no se puede cargar directamente en bibliotecas como Transformers sin conversión previa.
- **Producción**: no se recomienda su uso en entornos productivos sin una validación exhaustiva con datos propios y una revisión legal de la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Phoenix-X-26B-A4B-i1-GGUF
- Modelo original (sin cuantizar): https://huggingface.co/Vortex5/Phoenix-X-26B-A4B
