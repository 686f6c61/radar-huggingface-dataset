# dr-housemd/gemma-4-26B-A4B-it-qat-q4_0-exl3

## Resumen

`dr-housemd/gemma-4-26B-A4B-it-qat-q4_0-exl3` es una cuantización en formato EXL3 (ExLlamaV3) del checkpoint QAT de Google DeepMind Gemma 4 26B A4B en su variante instruction-tuned. El modelo base es `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, un checkpoint con Quantization-Aware Training de 4 bits extraído del pipeline oficial de Google. La conversión a EXL3 se realizó a 4.10 bits por peso con el flag `hq` y nivel H5.

El modelo original pertenece a la familia Gemma 4, que combina arquitecturas densas y Mixture-of-Experts con atención híbrida (sliding window local intercalada con atención global), ventana de contexto de hasta 256K tokens en los modelos medianos y soporte multimodal de texto, imagen, vídeo y audio según la variante. La variante 26B A4B es la MoE de la familia, con 26B parámetros totales y aproximadamente 4B activos por token, lo que la sitúa en el rango de despliegue en GPU de consumo y estaciones de trabajo.

La relevancia de esta ficha concreta es doble: por un lado documenta un experimento de cuantización secundaria sobre un checkpoint ya cuantizado (QAT Q4_0 a EXL3), y por otro el propio autor advierte en la model card de que el resultado le parece de baja calidad y sospecha que cuantizar un checkpoint QAT a EXL3 no es el camino adecuado, ya que los checkpoints QAT Q4_0 están pensados para GGUF. Es, por tanto, un artefacto de investigación con calidad no validada, no una distribución recomendada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención híbrida (sliding window local + atención global), según la familia Gemma 4 |
| Parametros totales | 8.413.110.606 según safetensors del repo EXL3; la familia declara 26B A4B para el checkpoint base (discrepancia atribuible al formato de cuantización y al empaquetado de pesos) |
| Parametros activos | Aproximadamente 4B por token (variante A4B de la familia) |
| Longitud de contexto | Hasta 256K tokens en los modelos medianos de la familia Gemma 4 |
| Tipos de cuantizacion | EXL3 a 4.10 bpw (flag `hq`, nivel H5); el checkpoint base es QAT Q4_0 |
| Idiomas soportados | Más de 140 idiomas según la familia Gemma 4; no se detalla lista específica para este repo |
| Licencia | Apache 2.0 (con license_link a la licencia específica de Gemma 4) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3); el repo ocupa 16.9 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Gemma 4, con atención híbrida que intercala capas de atención local con ventana deslizante y capas de atención global, garantizando que la última capa sea siempre global. Las capas globales emplean claves y valores unificados y Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. La variante 26B A4B activa aproximadamente 4B parámetros por token, lo que permite un throughput propio de un modelo pequeño con la capacidad de uno mediano.

El checkpoint base pasó por Quantization-Aware Training (QAT) de Google, un proceso que ajusta los pesos para que la cuantización a 4 bits preserve una calidad cercana a bfloat16. Google publica estos checkpoints en cuatro formatos: no cuantizado Q4_0 (half-precision extraído del pipeline QAT), GGUF Q4_0, mobile-optimized wNa8o8 y compressed-tensors w4a16 para vLLM. Esta ficha aplica una cuantización adicional a EXL3 de 4.10 bpw sobre el checkpoint no cuantizado QAT, un paso no previsto por el pipeline oficial. El autor documenta en la model card que el resultado le parece deficiente y que la comunidad le ha señalado que los checkpoints QAT Q4_0 no deberían recuantizarse a EXL3 porque están diseñados para GGUF. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modos de pensamiento configurables (thinking modes) según la familia Gemma 4.
- Procesamiento multimodal de imagen con soporte de relación de aspecto y resolución variable; el pipeline declarado es `image-text-to-text`.
- Soporte de vídeo y audio en las variantes E2B, E4B y 12B de la familia; no confirmado para esta variante 26B A4B en la información disponible.
- Generación de código y capacidades agénticas mejoradas respecto a generaciones anteriores de Gemma.
- Function calling nativo y soporte de prompt de sistema (`system` role) nativo.
- Capacidades multilingües en más de 140 idiomas según la familia.
- Decodificación especulativa con modelos drafter (asistente), con la restricción de que el asistente debe ser también un checkpoint QAT de la misma precisión.
- Contexto largo de hasta 256K tokens en los modelos medianos de la familia.

## Casos de uso

- Investigación sobre cuantización secundaria: este repo sirve para estudiar el impacto de recuantizar un checkpoint QAT a EXL3, comparando perplejidad y calidad frente al GGUF Q4_0 oficial y al checkpoint no cuantizado.
- Despliegue con ExLlamaV3 en GPU de consumo: el formato EXL3 a 4.10 bpw está pensado para inferencia eficiente en VRAM limitada, aunque la calidad de esta conversión concreta no está validada.
- Procesamiento de documentos con imágenes: el pipeline image-text-to-text permite extraer información de capturas, diagramas o formularios junto con texto, aprovechando el contexto largo para documentos extensos.
- Asistentes conversacionales multi-turno: el soporte nativo de rol `system` y contexto de 256K permite mantener conversaciones largas con instrucciones persistentes.
- Pipelines agénticos con function calling: integración en flujos que requieren llamadas a herramientas y razonamiento multi-paso, siempre que se valide la calidad de esta cuantización concreta.
- Evaluación comparativa de formatos de cuantización: útil como punto de referencia negativo o positivo en estudios sobre QAT frente a cuantización post-entrenamiento.
- Prototipado en local con ExLlamaV3: para desarrolladores que ya tienen ese stack y quieren probar la familia Gemma 4 MoE sin montar infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas y la información de la familia Gemma 4 proporcionada está truncada antes de las tablas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 16.9 GB en disco; con EXL3 a 4.10 bpw se espera un uso de VRAM en el entorno de 17-20 GB para pesos, más overhead de caché KV para contexto largo.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para contexto moderado; A100 40/80 GB o H100 para contexto completo de 256K y mayor throughput.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB con margen limitado; en GPUs de 16 GB requeriría reducir contexto o usar offloading.
- Opciones de despliegue: ExLlamaV3 (formato nativo de este repo); el checkpoint base es compatible con llama.cpp/GGUF y vLLM en su formato compressed-tensors, pero esta conversión EXL3 concreta no es portable a esos stacks.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser MoE con ~4B activos, el throughput debería ser superior al de un denso de 26B, pero no hay mediciones publicadas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| dr-housemd/gemma-4-26B-A4B-it-qat-q4_0-exl3 | 8.4B en safetensors del repo; familia 26B A4B | 256K (familia) | EXL3 4.10 bpw | Apache 2.0 | Cuantización no oficial, calidad no validada por el autor |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 26B A4B (familia) | 256K (familia) | Safetensors Q4_0 QAT | Apache 2.0 | Checkpoint oficial de Google DeepMind |
| Gemma 4 26B A4B GGUF Q4_0 (oficial) | 26B A4B (familia) | 256K (familia) | GGUF Q4_0 | Apache 2.0 | Formato recomendado por Google para QAT Q4_0 |
| Gemma 4 31B Dense | 30.7B | 256K | Safetensors / GGUF / compressed-tensors | Apache 2.0 | Alternativa densa de mayor tamaño |

## Limitaciones y advertencias

- Calidad no validada: el propio autor califica el resultado de "absolute garbage" y sospecha que la recuantización de un checkpoint QAT a EXL3 es inadecuada; no se recomienda su uso en producción sin evaluación propia.
- Incompatibilidad de pipeline: los checkpoints QAT Q4_0 de Google están diseñados para GGUF; aplicar EXL3 sobre ellos se aparta del flujo previsto y puede degradar los pesos de forma no trivial.
- Discrepancia de parámetros: los safetensors del repo declaran 8.413.110.606 parámetros frente a los 26B A4B de la familia, lo que sugiere un empaquetado o recuento distinto; conviene verificar antes de dimensionar infraestructura.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación específica para esta cuantización.
- Sesgos: no documentados en la información proporcionada; se heredan los del checkpoint base de Google DeepMind.
- Restricciones de licencia: Apache 2.0 con license_link a la licencia específica de Gemma 4; conviene revisar los términos de uso de Gemma antes de un despliegue comercial.
- Idiomas: la familia declara más de 140 idiomas, pero no hay lista ni evaluación específica para esta conversión.
- Contexto: los 256K tokens son un dato de la familia; no se ha verificado que esta cuantización EXL3 los soporte sin degradación.
- Decodificación especulativa: si se usa un modelo asistente, debe ser también QAT de la misma precisión; esta conversión EXL3 no cumple ese requisito.
- Repo de bajas descargas (23) y sin likes, lo que reduce la probabilidad de que haya sido validado por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/dr-housemd/gemma-4-26B-A4B-it-qat-q4_0-exl3
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Colección QAT Q4_0 de Google: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de QAT para Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
