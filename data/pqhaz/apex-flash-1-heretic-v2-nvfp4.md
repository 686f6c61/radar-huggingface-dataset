# pqhaz/apex-flash-1-heretic-v2-NVFP4

## Resumen

`pqhaz/apex-flash-1-heretic-v2-NVFP4` es una cuantización en formato NVFP4 del modelo `pqhaz/apex-flash-1-heretic-v2`, publicada por el usuario pqhaz en Hugging Face. Se trata de un modelo de gran tamano con 165.496.249.182 parámetros totales (aproximadamente 165,5 mil millones) y un repositorio de 194,7 GB, orientado a tareas de imagen-a-texto según su pipeline declarado y etiquetado con la arquitectura `glm5_next`. Su licencia es MIT y la librería de referencia es transformers.

El modelo hereda las modificaciones de su base: es una variante "abliterated" y "heretic", es decir, con el alignment de seguridad y los comportamientos de rechazo eliminados mediante técnicas automáticas de abliteration. La model card declara explícitamente que está pensado para investigación de seguridad autorizada en entornos propios o con permiso de prueba.

Esta publicación concreta no aporta pesos nuevos en precisión completa: es una recuantización del checkpoint base a NVFP4 con diseño weight-only de modelopt, aplicada exclusivamente a los expertos enrutados (proyecciones gate/up/down, block size 16), manteniendo el resto de tensores en BF16. El autor indica que los nombres de tensor, la asignación de shards y el `quantization_config` son idénticos a los de `pqhaz/apex-flash-1-abliterated-NVFP4`, por lo que funciona como reemplazo directo de ese checkpoint. La propia cuantización no ha sido evaluada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; etiquetada como `glm5_next` en Hugging Face |
| Parámetros totales | 165.496.249.182 (aprox. 165,5 mil millones) |
| Parámetros activos | no disponible (el modelo emplea expertos enrutados, por lo que se trata de una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 weight-only (expertos enrutados: gate/up/down, block size 16); resto de tensores en BF16; etiqueta adicional `8-bit` en Hugging Face |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 194,7 GB; número de shards no disponible) |
| Librería | transformers |
| Pipeline declarado | image-text-to-text |
| Modelo base | pqhaz/apex-flash-1-heretic-v2 (relación: quantized) |
| Fecha de creación | 2026-10-08 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de la etiqueta `glm5_next` y de la presencia de expertos enrutados (routed experts), lo que sitúa al modelo dentro de la familia de transformers con mezcla de expertos (MoE). El checkpoint cuenta con 165.496.249.182 parámetros totales. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento.

La innovación técnica documentada en esta ficha es exclusivamente de cuantización. El autor aplicó un diseño weight-only de modelopt sobre los expertos enrutados con NVFP4 y block size 16, dejando el resto de pesos en BF16. La conversión se realizó con el script `nvfp4.py`, incluido en el repositorio. Según la model card, el conversor se validó contra un shard del repositorio NVFP4 anterior, convirtiendo los mismos pesos de origen: los pesos empaquetados y ambas escalas resultaron bit-idénticos en los 25 tensores de expertos muestreados. El conjunto exacto de parámetros afectados por la abliteration de la base se almacena en `ablation.json`. La cuantización en sí no ha sido evaluada por el autor.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational`.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), aunque no se documentan detalles de la torre de visión ni resolución de entrada.
- Modelo de mezcla de expertos con expertos enrutados, lo que implica un coste de cómputo por token inferior al de un modelo denso del mismo tamaño total, aunque el número de parámetros activos no está disponible.
- Comportamiento sin rechazos: al derivar de un modelo abliterated, la base ha sido modificada para eliminar las respuestas de negativa ante peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Red teaming autorizado de modelos y sistemas propios: el modelo, al carecer de rechazos, permite generar prompts adversariales y sondear defensas de otros sistemas en entornos controlados por el investigador, que es precisamente el uso declarado por el autor.
- Investigación sobre abliteration y alineación: comparar las tasas de rechazo y la degradación de capacidades entre este checkpoint NVFP4, el BF16 base y la variante abliterated permite estudiar si la cuantización altera el efecto de la ablación.
- Auditoría de robustez de clasificadores de contenido: usar el modelo como generador de contenido límite en un banco de pruebas para medir la sensibilidad de filtros y moderadores propios.
- Análisis de documentos técnicos con componente visual: al ser un modelo image-text-to-text, puede emplearse para extraer y resumir información de capturas, diagramas o imágenes de documentación en un pipeline interno de investigación.
- Reproducibilidad de cuantizaciones: dado que el autor documenta una verificación bit a bit del conversor, la ficha y el script `nvfp4.py` sirven como referencia para validar pipelines de cuantización NVFP4 sobre arquitecturas MoE.
- Evaluación comparativa de formatos de pesos: desplegar la misma base en NVFP4 y en GGUF (existe `pqhaz/apex-flash-1-abliterated-GGUF`) permite medir diferencias de latencia, memoria y fidelidad de salida entre formatos.
- Sustitución directa en despliegues existentes: al compartir nombres de tensor, asignación de shards y `quantization_config` con `pqhaz/apex-flash-1-abliterated-NVFP4`, puede reemplazar a ese checkpoint sin cambios en el código de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica explícitamente que la cuantización no ha sido evaluada, y la model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación. Tampoco se proporcionan tasas de rechazo medidas para esta variante NVFP4.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 194,7 GB en disco. Como estimación a partir de ese tamaño, la carga en memoria requiere del orden de 200 GB de VRAM o memoria unificada, más el espacio para caché KV y activaciones, que no está cuantificado en la información disponible.
- Comparación con precisión completa: la misma base en BF16 requeriría aproximadamente 331 GB (165,5 mil millones de parámetros a 2 bytes por parámetro), por lo que la cuantización NVFP4 reduce el peso en disco en torno a un 40 %, ya que solo los expertos enrutados se comprimen a 4 bits.
- GPU recomendadas: para alojar los pesos completos hacen falta configuraciones multi-GPU, por ejemplo 3× H100 de 80 GB (240 GB), 2× H200 de 141 GB (282 GB) o 4× A100 de 80 GB (320 GB).
- No cabe en GPU de consumo: una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar el checkpoint completo. Además, NVFP4 es un formato cuya aceleración nativa está asociada a la generación Blackwell, por lo que en GPUs anteriores los pesos tendrían que descomprimirse o emularse, elevando el requisito de memoria hacia el equivalente BF16.
- Opciones de despliegue: la model card solo documenta el uso con la librería transformers. El soporte en vLLM, llama.cpp, Ollama o TGI para este layout NVFP4 concreto no se menciona en la información disponible.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pqhaz/apex-flash-1-heretic-v2-NVFP4 (este) | 165.496.249.182 | no disponible | NVFP4 en expertos, BF16 en el resto | MIT | Hugging Face, 0 descargas |
| pqhaz/apex-flash-1-heretic-v2 | no disponible (misma base) | no disponible | BF16 | MIT | Hugging Face |
| pqhaz/apex-flash-1-abliterated-NVFP4 | no disponible | no disponible | NVFP4, 62 shards | MIT | Hugging Face |
| pqhaz/apex-flash-1-abliterated-GGUF | no disponible | no disponible | GGUF | MIT | Hugging Face |

Los tres modelos comparables pertenecen al mismo autor y comparten la misma familia base, por lo que la comparación relevante es de formato y de variante de ablación más que de arquitectura. No se dispone de parámetros, contexto ni rendimiento publicados para las alternativas.

## Limitaciones y advertencias

- Ausencia de alineación de seguridad: al derivar de un modelo abliterated y heretic, se han eliminado los comportamientos de rechazo. El modelo puede generar contenido dañino, ilegal o inseguro sin filtros internos. El autor restringe su uso a investigación de seguridad autorizada en entornos propios o con permiso explícito de prueba.
- Cuantización no evaluada: la model card afirma literalmente que "esta cuantización no ha sido evaluada". No hay medidas de degradación de calidad respecto al checkpoint BF16.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasa de alucinación para esta variante.
- Idiomas: no se declaran idiomas soportados, por lo que el comportamiento multilingüe es desconocido.
- Capacidades multimodales poco documentadas: aunque el pipeline se declara como image-text-to-text, no hay información sobre resolución de imagen, arquitectura del codificador visual ni evaluación de tareas de visión.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución. La restricción de uso es una recomendación del autor en la model card, no una cláusula legal de la licencia, lo que deja el uso comercial de un modelo sin alineación de seguridad bajo responsabilidad del usuario.
- Requisitos de hardware elevados: 194,7 GB de pesos y necesidad de GPUs de gama alta o de la generación Blackwell para aprovechar NVFP4 de forma nativa.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- Sin contexto declarado: al no publicarse la longitud de contexto, no es posible planificar su uso en tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pqhaz/apex-flash-1-heretic-v2-NVFP4
- Modelo base BF16: https://huggingface.co/pqhaz/apex-flash-1-heretic-v2
- Checkpoint NVFP4 compatible (drop-in): https://huggingface.co/pqhaz/apex-flash-1-abliterated-NVFP4
- Ejemplo de shard del repositorio NVFP4 compatible: https://huggingface.co/pqhaz/apex-flash-1-abliterated-NVFP4/blob/main/model-00026-of-00062.safetensors
- Variante GGUF de la familia: https://huggingface.co/pqhaz/apex-flash-1-abliterated-GGUF
- Guía sobre abliteration y heretic: https://explainx.ai/blog/heretic-llm-abliteration-guide-2026
- Comparativa de tasas de rechazo y benchmarks entre heretic y abliterated: https://aithinkerlab.com/heretic-ai-abliteration-benchmarks-2026/
- Ficha de referencia de NVIDIA Nemotron NVFP4 (contexto de formato, no relacionada con este modelo): https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
