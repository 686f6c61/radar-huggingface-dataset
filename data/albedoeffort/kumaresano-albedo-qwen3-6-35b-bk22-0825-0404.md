# albedoeffort/kumaresano-albedo-qwen3.6-35b-bk22-0825-0404

## Resumen

El modelo `albedoeffort/kumaresano-albedo-qwen3.6-35b-bk22-0825-0404` es una variante de la serie Qwen3.6, desarrollada por el usuario albedoeffort y publicada en HuggingFace con acceso restringido. Se trata de un modelo de arquitectura MoE (mixture of experts) etiquetado como `qwen3_5_moe`, con 35.951.822.704 parámetros totales, lo que lo sitúa en la categoría de 35B-A3B según la guía de Qwen3.6 publicada en insiderllm.com. El pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales (procesamiento de imágenes y texto) además de la generación conversacional.

Este modelo forma parte de una serie de iteraciones (bk1, bk17, bk19, bk22) que parecen ser versiones sucesivas de un mismo proyecto de fine-tuning o adaptación sobre la base Qwen3.6. La relevancia actual radica en que Qwen3.6 es una de las familias de modelos abiertos más recientes, orientada a estabilidad y utilidad práctica en tareas de codificación y conversación, según la descripción oficial. Sin embargo, al ser una variante específica con pocas descargas y sin documentación detallada, su adopción en producción requiere una evaluación cuidadosa.

La licencia es Apache 2.0, lo que permite uso comercial, pero el acceso está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo. El repositorio ocupa 71,9 GB, consistente con pesos en BF16 para un modelo de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen3.6, etiquetada como `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | No disponible (se estima 3B según la guía de Qwen3.6, pero no confirmado para esta variante) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, probablemente BF16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de mezcla de expertos (MoE) basado en la familia Qwen3.6, con la etiqueta `qwen3_5_moe` que sugiere una evolución de la arquitectura Qwen3.5. El pipeline `image-text-to-text` indica que el modelo acepta entradas multimodales (imágenes y texto) y genera respuestas de texto, lo que implica un codificador visual adicional además del transformer de lenguaje. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se conocen innovaciones técnicas específicas de esta variante, como decodificación especulativa o atención lineal. Dado que es una iteración de una serie (bk22), es probable que sea un fine-tuning sobre el modelo base Qwen3.6, pero no hay documentación que lo confirme.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada, generando respuestas de texto (pipeline `image-text-to-text`).
- Conversación: el tag `conversational` indica soporte para diálogos multi-turno.
- Generación de texto: capacidad estándar de modelos de lenguaje para producir texto coherente.
- No se confirman capacidades específicas como tool calling, function calling, razonamiento multi-paso o modo thinking, ya que no hay documentación disponible.
- El soporte multilingüe no está declarado; se desconoce qué idiomas maneja.

## Casos de uso

- Asistencia visual para personas con discapacidad: el modelo puede describir imágenes o responder preguntas sobre su contenido, útil en aplicaciones de accesibilidad.
- Análisis de documentos escaneados: al combinar visión y lenguaje, puede extraer información de capturas, facturas o formularios.
- Chatbots de atención al cliente con soporte de imágenes: los usuarios pueden enviar capturas de pantalla o fotos de productos y recibir respuestas contextuales.
- Generación de descripciones para catálogos de productos: a partir de una imagen, el modelo puede redactar texto descriptivo para comercio electrónico.
- Asistente de codificación con contexto visual: podría interpretar diagramas o capturas de código y ayudar a depurar o explicar.
- Moderación de contenido visual: clasificar o describir imágenes para filtrar contenido inapropiado en plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para esta variante específica. La guía de Qwen3.6 menciona mejoras generales en estabilidad y utilidad, pero no proporciona números concretos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,95B parámetros en BF16, el modelo ocupa aproximadamente 72 GB en memoria. Para inferencia se recomienda al menos 80 GB de VRAM (una GPU A100 o H100) o varias GPUs en paralelo.
- Con cuantización a 8 bits (INT8) se podría reducir a ~36 GB, y a 4 bits (INT4) a ~18 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con posible pérdida de calidad.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (si se publica en su biblioteca). No hay confirmación de soporte oficial en estos runners.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6 27B dense | 27B | No disponible | Dense | Apache 2.0 | Abierto |
| Qwen3.6 35B-A3B MoE | 35B totales, 3B activos | No disponible | MoE | Apache 2.0 | Abierto |
| Este modelo (kumaresano-albedo) | 35,95B | No disponible | MoE multimodal | Apache 2.0 | Gated |

No se dispone de comparativas de rendimiento entre estos modelos. La variante aquí descrita añade capacidades multimodales (imagen-texto) que no están presentes en las versiones base de Qwen3.6, lo que la diferencia en funcionalidad, pero no se conocen métricas comparativas.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos automatizados.
- Sin documentación: no hay model card ni información sobre sesgos, alucinaciones o limitaciones de contexto.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas multimodales donde la interpretación de imágenes es subjetiva.
- Idiomas no especificados: no se sabe si el modelo funciona bien en español u otros idiomas; probablemente esté optimizado para inglés.
- Tamaño y requisitos: requiere hardware de gama alta para inferencia en BF16; la cuantización puede degradar el rendimiento.
- Sin garantías de producción: al ser una variante con 0 descargas y 0 likes, no hay evidencia de uso real ni de estabilidad en entornos productivos.

## Enlaces

- HuggingFace: https://huggingface.co/albedoeffort/kumaresano-albedo-qwen3.6-35b-bk22-0825-0404
- Guía de Qwen3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Modelo relacionado en Ollama: https://ollama.com/library/qwen3.6:35b
- Modelo relacionado en FriendliAI: https://friendli.ai/models/SusanHill/kumaresano-albedo-qwen3.6-35b-bk17-0818-2046
