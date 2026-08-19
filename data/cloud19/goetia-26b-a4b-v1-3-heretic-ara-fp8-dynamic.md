# cloud19/Goetia-26B-A4B-v1.3-Heretic-ARA-FP8-Dynamic

## Resumen

Goetia-26B-A4B-v1.3-Heretic-ARA-FP8-Dynamic es una cuantización en punto flotante de 8 bits (FP8 Dynamic, esquema W8A8) del modelo original Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA, desarrollada por cloud19. El modelo base es un MoE (mezcla de expertos) basado en la arquitectura Gemma-4, con 25,8 mil millones de parámetros totales y aproximadamente 4 mil millones de parámetros activos por token, e incluye una torre de visión que lo convierte en multimodal. Esta versión cuantizada reduce el peso de 48,1 GiB (BF16) a 25,30 GiB, lo que permite su despliegue en hardware con menos memoria sin requerir reentrenamiento.

La relevancia de esta ficha radica en que la cuantización FP8 dinámica es una técnica de compresión que mantiene la calidad del modelo original a la vez que reduce los requisitos de VRAM y acelera la inferencia. Está pensada para su uso con el motor vLLM, que soporta de forma nativa el formato compressed-tensors. Al estar licenciada bajo Apache 2.0, puede utilizarse tanto en investigación como en productos comerciales sin restricciones de atribución adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Gemma-4, con torre de visión (multimodal) |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | 4 B (según nomenclatura del modelo, no confirmado en la documentación) |
| Longitud de contexto | 16384 tokens (valor recomendado en el comando de vLLM; máximo nativo no especificado) |
| Tipos de cuantizacion | FP8 Dynamic (W8A8): pesos FP8 per-channel estáticos, activaciones FP8 per-token dinámicas; embeddings, lm_head, routers MoE y vision tower en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantización del original Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA, que a su vez es un modelo MoE basado en Gemma-4. La arquitectura base combina un transformer con mezcla de expertos (26B totales, 4B activos) y una torre de visión para procesamiento multimodal. No se ha realizado ningún entrenamiento adicional; la cuantización se ha aplicado mediante llm-compressor de Neural Magic con un enfoque data-free one-shot, utilizando una receta idéntica a la del modelo cloud19/G4-MeroMero-26B-FP8-Dynamic-Uncensored.

La configuración de cuantización aplica el esquema FP8_DYNAMIC a todas las capas lineales, ignorando explícitamente el lm_head, los embeddings, los routers de la mezcla de expertos y la torre de visión, que permanecen en BF16 para preservar la precisión en esas partes críticas. Los pesos se cuantizan estáticamente por canal, mientras que las activaciones se cuantizan dinámicamente por token. Este proceso reduce el tamaño de los pesos de aproximadamente 48,1 GiB a 25,30 GiB, una reducción de cerca del 47 %.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Gemma-4.
- Procesamiento multimodal: entrada de imágenes junto con texto gracias a la torre de visión (vision tower) que se mantiene en BF16.
- Inferencia eficiente con cuantización FP8: menor uso de memoria y mayor throughput en GPUs compatibles.
- Compatibilidad con vLLM mediante el backend compressed-tensors, incluyendo soporte para KV cache en FP8.
- Arquitectura MoE que activa solo 4B parámetros por token, lo que reduce la carga computacional frente a un modelo denso equivalente.
- No se han documentado capacidades específicas como tool calling, function calling o agentes en la información disponible.

## Casos de uso

- Despliegue de asistentes conversacionales en producción: con vLLM y 16k tokens de contexto, puede gestionar diálogos multi-turno extensos en entornos de atención al cliente o soporte técnico, manteniendo una latencia aceptable gracias a la cuantización FP8.
- Análisis de imágenes y generación de descripciones: al ser multimodal, puede procesar imágenes junto con texto para tareas de captioning, extracción de información visual o moderación de contenido en aplicaciones que requieran comprensión visual.
- Investigación en eficiencia de modelos: sirve como banco de pruebas para evaluar el impacto de la cuantización FP8 dinámica en tareas de razonamiento y visión, comparando con el modelo original en BF16.
- Procesamiento de documentos largos: con una ventana de 16k tokens, puede resumir informes extensos, analizar contratos o extraer datos de documentos técnicos sin necesidad de dividir el texto en fragmentos.
- Desarrollo de aplicaciones educativas o de demostración: al ser Apache 2.0 y tener un tamaño reducido (25,3 GiB), puede integrarse en entornos de laboratorio con GPUs de 48 GB o más, facilitando la experimentación con modelos MoE multimodales.
- Inferencia en entornos con restricciones de memoria: la cuantización FP8 permite ejecutar el modelo en GPUs con 40 GB de VRAM (como A100) que de otro modo no podrían alojar el modelo en BF16, habilitando su uso en clusters existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al menos 26 GB para los pesos cuantizados (25,30 GiB) más memoria para activaciones, KV cache y overhead del runtime. Con 16k tokens de contexto y KV cache en FP8, se recomienda un mínimo de 40 GB de VRAM para operar con margen.
- GPU recomendadas: NVIDIA A100 (40 GB o 80 GB), H100 (80 GB), o GPUs profesionales con 48 GB o más como RTX 6000 Ada o L40S. No cabe en GPUs de consumo de 24 GB (como RTX 4090) debido al tamaño de los pesos y la memoria adicional requerida.
- Opciones de despliegue: vLLM es el motor recomendado y el único documentado, usando `--quantization compressed-tensors` y `--kv-cache-dtype fp8`. También podría convertirse a GGUF para su uso con llama.cpp u Ollama, pero no se proporciona dicha conversión.
- Latencia y throughput: no disponibles; dependerán de la GPU, el número de secuencias concurrentes y la longitud de las mismas. El comando de ejemplo de vLLM sugiere hasta 384 secuencias simultáneas con 16k de contexto, lo que indica un diseño orientado a alto rendimiento.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de la misma categoría (MoE multimodal de ~26B cuantizado a FP8). El modelo base Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA no tiene benchmarks públicos conocidos, y la cuantización no altera las capacidades funcionales del original. Como referencia genérica, otros modelos MoE de tamaño similar (por ejemplo, Mixtral 8x7B o Qwen2.5-MoE) tienen arquitecturas distintas y no son directamente comparables sin datos de rendimiento.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad; el nombre "Heretic" sugiere una posible reducción de la alineación, pero no está documentado.
- La cuantización FP8 puede introducir una ligera pérdida de precisión en tareas numéricas o de razonamiento complejo en comparación con el modelo original en BF16.
- La longitud de contexto nativa no está especificada; el valor de 16384 tokens es una configuración recomendada en el comando de vLLM, no un límite garantizado del modelo.
- Los idiomas soportados no se indican; aunque Gemma-4 suele ser multilingüe, no hay confirmación para esta variante.
- El modelo es una cuantización del trabajo de terceros; cualquier limitación del modelo base se hereda, y no se han documentado parches o ajustes adicionales.
- Para uso en producción, se recomienda validar el comportamiento del modelo en el dominio específico antes de desplegarlo, dado que no hay benchmarks públicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cloud19/Goetia-26B-A4B-v1.3-Heretic-ARA-FP8-Dynamic
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA
- No se han encontrado papers, blogs o demos adicionales en la información disponible.
