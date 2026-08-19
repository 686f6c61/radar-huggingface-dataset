# AutomatosX/AX-gpt-oss-20b-MLX-AXQ-4bit

## Resumen

El modelo **AX-gpt-oss-20b-MLX-AXQ-4bit** es una conversión cuantizada del modelo **openai/gpt-oss-20b** (una arquitectura de mezcla de expertos, MoE, con 20,91 mil millones de parámetros lógicos) al formato **MLX** para Apple Silicon. Ha sido desarrollado por **AutomatosX** utilizando su propio cuantizador **AXQuant (AXQ)** en su versión 1.6.2, que aplica una estrategia de precisión mixta: la mayor parte de los pesos se almacenan en 4 bits, mientras que los tensores protegidos (embeddings, normalizaciones, etc.) se mantienen en 8 bits o BF16.

Este checkpoint está pensado para ejecutar un modelo de gran tamaño en equipos Mac con memoria unificada limitada, reduciendo el peso total de 13,22 GB en safetensors frente a los aproximadamente 40 GB que ocuparía el modelo original en BF16. Sin embargo, se trata de un **paquete de desarrollo, no una versión certificada**: la propia model card advierte que no se han publicado métricas de calidad, benchmarks de velocidad ni validación de contexto largo. Es relevante para desarrolladores que quieran experimentar con cuantización AXQ en MLX, pero no debe usarse en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GptOssForCausalLM (mixture of experts, MoE) |
| Parametros totales | 20,91B (lógicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 131 072 tokens (configurado, no validado) |
| Tipos de cuantizacion | 4-bit AXQ (mixed-precision: 4-bit, 8-bit, BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base **openai/gpt-oss-20b** es un transformador con arquitectura de mezcla de expertos (MoE), aunque la documentación proporcionada no detalla el número de capas, expertos ni el tamaño de los parámetros activos. La conversión realizada por AutomatosX no modifica la arquitectura, sino que aplica una cuantización **AXQuant** sobre la ruta de texto, manteniendo los tensores protegidos (embeddings, normas, etc.) en mayor precisión. Según la model card, el reparto de precisión es: 91,37 % de los parámetros en 4 bits, 5,83 % en 8 bits y 2,80 % en BF16, con un tamaño de grupo de cuantización de 64.

No se proporciona información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La cuantización se realizó sin calibración, basándose únicamente en prioridades de arquitectura, y el proceso de conversión registró 169 conversiones de módulos exitosas y 0 fallos.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`).
- Ejecución nativa en Apple Silicon mediante MLX-LM o AX Engine.
- Soporte de cuantización mixta con protección de tensores críticos.
- No incluye capacidades de visión ni audio (según la model card, `Vision present: False`, `Audio present: False`).
- No se documenta soporte explícito de tool calling, function calling o modo agente.
- El contexto máximo configurado es de 131 072 tokens, pero su validez práctica no ha sido medida.

## Casos de uso

- **Prototipado local de aplicaciones de chat en Mac**: gracias a su tamaño reducido (13,22 GB), permite ejecutar un modelo MoE de 20B en equipos con 16 GB de memoria unificada, ideal para pruebas de concepto de asistentes conversacionales sin depender de la nube.
- **Experimentación con cuantización AXQ**: desarrolladores interesados en evaluar el impacto de la precisión mixta en modelos MoE pueden usar este checkpoint como referencia para comparar con versiones en 6 bits o con el modelo original en BF16.
- **Generación de texto offline**: para entornos sin conexión a internet o con políticas de privacidad estrictas, este modelo permite generar contenido (resúmenes, borradores, redacción) directamente en el dispositivo.
- **Investigación sobre eficiencia de inferencia en Apple Silicon**: al ser un paquete de desarrollo, sirve para medir el rendimiento real de AX Engine frente a MLX-LM en tareas de generación, siempre que se realicen benchmarks propios.
- **Pruebas de integración con MLX-LM**: los desarrolladores pueden verificar la compatibilidad de sus aplicaciones con checkpoints cuantizados en formato MLX y ajustar sus pipelines de inferencia.
- **Formación y educación**: útil para demostrar cómo se cuantiza un modelo MoE grande y cómo se despliega en hardware de consumo, aunque sin garantías de calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se aportan métricas de calidad frente al modelo BF16 original, ni mediciones de velocidad de kernels, ni validación de contexto largo. Por tanto, no se puede comparar el rendimiento de este checkpoint con otras versiones cuantizadas o con el modelo base.

## Requisitos de hardware

- **Plataforma**: Apple Silicon (M1, M2, M3 o superiores) con memoria unificada.
- **Memoria mínima estimada**: al menos 16 GB de RAM unificada para cargar los 13,22 GB de pesos y dejar margen para el contexto y la computación. Para contextos cercanos a 131k tokens, se recomienda 32 GB o más.
- **GPU**: no aplica GPU discreta; la inferencia se ejecuta en la GPU integrada de Apple Silicon vía MLX.
- **Opciones de despliegue**: MLX-LM (`mlx_lm.generate`) o AX Engine (`ax-engine serve`).
- **Latencia y throughput**: no disponibles; la model card advierte que no se han publicado mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otras versiones cuantizadas del mismo modelo (por ejemplo, GGUF o PyTorch) ni con modelos alternativos de tamaño similar. La documentación solo menciona la existencia de un hermano en 6 bits (`AX-gpt-oss-20b-MLX-AXQ-6bit`) dentro del mismo catálogo de AutomatosX, pero no se ofrecen datos comparativos de rendimiento o calidad.

## Limitaciones y advertencias

- **Paquete de desarrollo no certificado**: la model card indica que los gates formales de certificación AXQuant (M0-M8) no están cerrados. No debe usarse en producción sin una evaluación exhaustiva.
- **Sin evidencia de calidad**: no se publican métricas de retención de calidad frente al modelo BF16 original. La cuantización puede degradar el rendimiento en tareas complejas.
- **Contexto largo no validado**: la capacidad de 131 072 tokens es un valor de configuración, no una garantía de funcionamiento correcto en esa longitud.
- **Sin soporte de visión ni audio**: a pesar de que el modelo base podría tener capacidades multimodales, este checkpoint solo incluye la ruta de texto.
- **Sin MTP (Multi-Token Prediction)**: no se incluye el sidecar MTP, por lo que no se puede aprovechar esa posible aceleración.
- **Limitado a Apple Silicon**: no es compatible con GPUs NVIDIA o AMD, ni con entornos Linux/Windows sin emulación.
- **Riesgo de alucinaciones y sesgos**: al ser un modelo de lenguaje, puede generar contenido falso o sesgado; no se han documentado medidas específicas de mitigación.
- **Licencia Apache 2.0**: permite uso comercial, pero se debe verificar que el modelo base (openai/gpt-oss-20b) también esté bajo una licencia compatible.

## Enlaces

- [HuggingFace - AX-gpt-oss-20b-MLX-AXQ-4bit](https://huggingface.co/AutomatosX/AX-gpt-oss-20b-MLX-AXQ-4bit)
- [Modelo base - openai/gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- [Repositorio AXQuant](https://github.com/defai-digital/axquant)
- [Catálogo de modelos MLX de AutomatosX](https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog)
- [Hermano en 6 bits - AX-gpt-oss-20b-MLX-AXQ-6bit](https://huggingface.co/AutomatosX/AX-gpt-oss-20b-MLX-AXQ-6bit)
