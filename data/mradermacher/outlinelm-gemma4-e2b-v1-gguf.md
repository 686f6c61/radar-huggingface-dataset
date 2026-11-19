# mradermacher/OutlineLM-Gemma4-E2B-v1-GGUF

## Resumen

OutlineLM-Gemma4-E2B-v1-GGUF es la versión cuantizada en formato GGUF del modelo OutlineLM-Gemma4-E2B-v1, publicada por el usuario mradermacher, conocido en Hugging Face por generar cuantizaciones estáticas de modelos de terceros para su uso con llama.cpp y herramientas compatibles. El modelo base lo desarrolla DiTy y, por el nombre, se trata de un ajuste fino (fine-tune) sobre la familia Gemma, con variante "E2B" y aproximadamente 4.647 millones de parámetros totales según los pesos en safetensors del repositorio.

El propósito del repositorio es ofrecer los pesos en múltiples niveles de cuantización (desde Q2_K hasta F16, incluyendo IQ4_XS y variantes K), de modo que el modelo pueda ejecutarse en hardware con distintos presupuestos de VRAM y RAM. La model card del repositorio es prácticamente un volcado de metadatos del proceso de cuantización y no aporta información sobre el entrenamiento, los datos, la licencia o las capacidades del modelo.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: no hay información publicada sobre benchmarks, idiomas, licencia ni detalles de arquitectura más allá de lo inferible del nombre y del número de parámetros. Cualquier evaluación de idoneidad para producción debe remitirse al modelo base original de DiTy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Gemma según el nombre; detalles no publicados) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre del modelo sugiere una base Gemma con una variante "E2B", pero el repositorio no confirma ni detalla esta correspondencia.

El repositorio en sí es un artefacto de cuantización: los metadatos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y `skip_mmproj: 1`, lo que sugiere que el proceso de conversión se realizó desde pesos en formato Hugging Face y que se omitió el módulo multimodal (`mmproj`) en las cuantizaciones, si el modelo base lo tuviera. No hay información sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que está orientado a diálogo, aunque no se detallan capacidades específicas.
- Razonamiento, código y matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el flag `skip_mmproj` sugiere que, si existiera un componente multimodal en el modelo base, no está incluido en estas cuantizaciones.

## Casos de uso

- Despliegue local en entornos con recursos limitados: al ofrecer cuantizaciones desde Q2_K hasta F16, permite ejecutar el modelo en equipos de consumo mediante llama.cpp u Ollama, ajustando el nivel de cuantización al presupuesto de memoria disponible.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF facilitan pruebas rápidas de diálogo multi-turno en local antes de comprometerse con infraestructura mayor.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que permite medir el impacto de la cuantización en calidad y velocidad sobre el mismo modelo base.
- Integración en aplicaciones de escritorio o edge: el formato GGUF es compatible con bindings ligeros (llama-cpp-python, llama-cpp-rs), adecuado para integrar generación de texto en aplicaciones sin dependencia de la nube.
- Investigación sobre fine-tunes de la familia Gemma: sirve como artefacto para estudiar el comportamiento de un fine-tune concreto bajo distintos niveles de compresión.
- Pruebas de pipeline de cuantización: útil para validar flujos de conversión HF a GGUF y comparar la fidelidad de distintos esquemas (K-quants frente a IQ4_XS).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, según 4.647 millones de parámetros y el tamaño típico de cada cuantización):
  - F16: en torno a 9-10 GB.
  - Q8_0: en torno a 5 GB.
  - Q6_K: en torno a 4 GB.
  - Q5_K_M / Q5_K_S: en torno a 3,5 GB.
  - Q4_K_M / Q4_K_S: en torno a 3 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: en torno a 2,5 GB.
  - IQ4_XS: en torno a 2,7 GB.
  - Q2_K: en torno a 2 GB.
  - Nota: son estimaciones basadas en el recuento de parámetros; el repositorio ocupa 48 GB en total por incluir todas las variantes.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, las cuantizaciones Q4 y superiores caben en GPUs de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070); las variantes Q8 y F16 requieren 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) o GPUs de datacenter (A100, H100) para despliegues concurrentes.
- ¿Cabe en GPU de consumo? Sí, las cuantizaciones de Q2 a Q5 caben en GPUs con 6-8 GB; Q6 y Q8 en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversión.
- Latencia y throughput: no disponibles; dependen del hardware y del nivel de cuantización.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base (DiTy/OutlineLM-Gemma4-E2B-v1) ni de benchmarks que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base en DiTy/OutlineLM-Gemma4-E2B-v1 antes de cualquier despliegue en producción.
- Sin benchmarks ni evaluación publicada: no hay evidencia de calidad, por lo que no se recomienda su uso en producción sin una evaluación propia.
- Sin información sobre idiomas: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de alineación no se puede estimar su magnitud.
- Sesgos: no documentados; al desconocerse los datos de entrenamiento, no es posible evaluar sesgos conocidos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad respecto a F16; conviene validar la variante elegida.
- El flag `skip_mmproj: 1` indica que las cuantizaciones no incluyen el módulo multimodal del modelo base, si existiera; no deben usarse para tareas de visión.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E2B-v1-GGUF
- Modelo base: https://huggingface.co/DiTy/OutlineLM-Gemma4-E2B-v1
