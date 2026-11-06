# jersobh/epochdb-extractor-0.8b

## Resumen

epochdb-extractor-0.8b es un ajuste fino (finetune) de tipo supervisado del modelo base unsloth/Qwen3.5-0.8B-Base, desarrollado por el usuario jersobh y publicado bajo licencia Apache 2.0. Con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones), se trata de un modelo compacto orientado a la extracción de información estructurada dentro del ecosistema EpochDB, un motor de memoria para agentes de IA que almacena texto bruto junto a embeddings densos ("Unified Memory Atoms") en lugar de resumir conversaciones de forma destructiva.

El modelo se distribuye en formato safetensors para la librería transformers y está etiquetado con el pipeline image-text-to-text y la arquitectura qwen3_5, lo que sugiere capacidades multimodales heredadas del base. Su relevancia radica en su tamaño reducido, que permite desplegarlo en hardware modesto para tareas de extracción de hechos y estructuración de memoria en pipelines de agentes, aunque la información pública disponible sobre el proceso de entrenamiento y sus resultados es muy limitada.

La model card es mínima: no documenta dataset de entrenamiento, hiperparámetros, benchmarks ni limitaciones. Todo lo que se sabe del modelo proviene de los metadatos de Hugging Face, del modelo base declarado y del repositorio EpochDB del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, etiqueta del autor; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del base unsloth/Qwen3.5-0.8B-Base, etiquetado con la arquitectura qwen3_5. Según la model card, el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una aceleración declarada de 2x respecto a un entrenamiento convencional. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni innovaciones técnicas concretas más allá del uso de Unsloth para eficiencia.

El pipeline declarado es image-text-to-text, lo que indica que el modelo conserva la interfaz multimodal del base Qwen3.5-0.8B, aunque no hay documentación sobre cómo el finetune afecta a la rama de visión. El nombre "epochdb-extractor" sugiere que el ajuste está orientado a la extracción de información para el motor de memoria EpochDB del mismo autor, pero no se detalla la tarea exacta ni el formato de salida esperado.

## Capacidades

- Generación de texto en inglés, heredada del base Qwen3.5-0.8B.
- Procesamiento image-text-to-text según el pipeline declarado (sin documentación específica del finetune).
- Presunta extracción de información estructurada para el motor de memoria EpochDB (inferida del nombre; no documentada en la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la etiqueta `language: en`.
- Modo thinking, visión o audio especiales: no disponible.

## Casos de uso

- Extracción de hechos para memoria de agentes: integrado en EpochDB, el modelo podría transformar texto bruto de conversaciones en "Unified Memory Atoms" estructurados, aprovechando su tamaño reducido para ejecutarse en el mismo host que el motor de memoria.
- Preprocesado de conversaciones en pipelines RAG: al ser un modelo de 0,85B, puede procesar lotes de turnos de diálogo para extraer entidades y relaciones antes de indexarlas, con bajo coste computacional.
- Clasificación y etiquetado de texto en inglés: su tamaño permite desplegarlo como microservicio de etiquetado dentro de flujos de agentes sin competir por GPU con el modelo principal.
- Prototipado rápido de extractores especializados: sirve como base para finetunes adicionales por su licencia Apache 2.0 y su reducido requisito de VRAM.
- Procesamiento multimodal ligero: el pipeline image-text-to-text permitiría, en principio, extraer información de capturas o documentos con texto, aunque sin documentación específica del finetune.
- Experimentación académica con Unsloth/TRL: el modelo es un ejemplo reproducible de finetune acelerado sobre un base pequeño, útil para estudiar técnicas de ajuste eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, en torno a 0,5 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) aunque no las aprovecha.
- Cabe en GPU consumer: sí, con holgura, incluso en tarjetas de gama de entrada.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (etiqueta `text-generation-inference`), y previsiblemente llama.cpp/Ollama/vLLM si se generan conversiones, aunque no se publican artefactos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| epochdb-extractor-0.8b | 852.985.920 | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| unsloth/Qwen3.5-0.8B-Base | ~0,8B (no confirmado) | no disponible | no disponible en la informacion | Hugging Face (modelo base) |
| Qwen2.5-0.5B / 1.5B (referencia de categoria) | 0,5B / 1,5B | no disponible en la informacion | apache-2.0 en variantes abiertas | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo; la comparativa se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta dataset, hiperparámetros ni evaluación; el comportamiento real del finetune es desconocido más allá del nombre.
- Riesgo de alucinación inherente a un modelo de 0,85B, especialmente en tareas de extracción factual donde los errores son costosos.
- Soporte únicamente de inglés según la etiqueta de idioma; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia para conversaciones largas.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin transformers.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B-Base debe verificarse por separado para confirmar compatibilidad de licencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de uso en producción.
- El pipeline image-text-to-text sugiere multimodalidad, pero no hay evidencia de que el finetune preserve o mejore la rama de visión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jersobh/epochdb-extractor-0.8b
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B-Base
- Repositorio EpochDB: https://github.com/jersobh/epochdb
- README de EpochDB: https://github.com/jersobh/epochdb/blob/main/README.md
- Unsloth: https://github.com/unslothai/unsloth
