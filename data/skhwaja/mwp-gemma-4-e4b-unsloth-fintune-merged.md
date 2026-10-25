# skhwaja/mwp-gemma-4-E4B-unsloth-fintune-merged

## Resumen

`skhwaja/mwp-gemma-4-E4B-unsloth-fintune-merged` es un ajuste fino (fine-tuning) del modelo multimodal `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, publicado por el usuario skhwaja. Se trata de un modelo de la familia Gemma 4 de Google, en su variante E4B (instruida, con capacidad de entrada imagen-texto), que ha sido entrenado con Unsloth y la librería TRL y posteriormente fusionado (merged) en pesos completos en safetensors para su distribución en HuggingFace. El repositorio ocupa 16,0 GB y contiene 7.996.156.490 parámetros reales según los safetensors.

El modelo resuelve el caso de uso de quien necesita un Gemma 4 E4B ya adaptado a una tarea concreta (el prefijo "mwp" sugiere un proyecto o dominio específico, no documentado en la model card) y listo para consumirse con `transformers` sin tener que aplicar el adaptador LoRA por separado, ya que los pesos vienen fusionados. Al estar construido sobre una base cuantizada en 4 bits (bnb-4bit) y fusionado después, conviene verificar la precisión efectiva de los pesos resultantes antes de usarlo en producción.

Su relevancia es limitada pero concreta: es un artefacto de fine-tuning reproducible, con licencia declarada apache-2.0, cero descargas y cero likes en el momento de la consulta, y sin model card técnica más allá de la plantilla estándar de Unsloth. No se han publicado datos de dataset, hiperparámetros ni evaluaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Gemma 4 E4B; detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (la nomenclatura E4B de Gemma alude a parámetros "efectivos", pero no se confirma en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base en 4 bits (bitsandbytes); el repositorio distribuido son pesos fusionados en safetensors, ~16 GB para ~8B parámetros, consistente con bf16/fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (declarada en la model card; los modelos Gemma de Google suelen distribuirse bajo Gemma Terms of Use, conviene verificar) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que parte de `unsloth/gemma-4-E4B-it-unsloth-bnb-4bit`, es decir, la variante E4B instruida de Gemma 4 en cuantización de 4 bits de bitsandbytes, y que el pipeline declarado es `image-text-to-text`, lo que implica que el modelo conserva el codificador visual de la familia Gemma 4. El resultado publicado es un merge de los pesos ajustados sobre esa base, distribuido en safetensors.

El entrenamiento se realizó con Unsloth y TRL, según indica la propia model card, que menciona un entrenamiento "2x faster" gracias a Unsloth. No se especifica el número de tokens, la composición del dataset, si hubo RLHF/DPO ni los hiperparámetros empleados. Tampoco se documenta si el ajuste cubrió solo el decodificador de texto, el proyector multimodal o ambos.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas de la variante `-it` de Gemma 4 E4B.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que acepta imágenes junto a prompts de texto.
- Razonamiento y respuesta a preguntas, resumen y tareas generativas generales, según la descripción de la familia Gemma 4.
- Soporte de tool calling / function calling: no disponible (no documentado para este fine-tune).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language: en` de la model card.
- Capacidad especial de audio: no disponible para este artefacto (Unsloth documenta fine-tuning de audio para Gemma 4, pero no se confirma aquí).

## Casos de uso

- Clasificación y extracción de información sobre documentos escaneados: al aceptar entrada imagen-texto, puede procesar capturas o digitalizaciones y devolver campos estructurados, siempre que el fine-tune "mwp" haya sido entrenado para ese dominio.
- Asistencia conversacional de dominio específico: el ajuste parece orientado a una tarea concreta ("mwp"), por lo que encaja como chatbot especializado en ese ámbito, con la ventaja de no requerir aplicar el adaptador LoRA en tiempo de inferencia.
- Prototipado rápido de pipelines multimodales: se puede cargar directamente con `transformers` y el pipeline `image-text-to-text` para validar una prueba de concepto sin gestionar cuantización en el cliente.
- Generación de descripciones de imágenes o etiquetado asistido: útil para enriquecer catálogos o datasets internos con anotaciones en inglés.
- Base para un segundo ajuste: al estar los pesos fusionados, sirve como punto de partida limpio para un nuevo fine-tuning con Unsloth o TRL sobre un dataset propio.
- Evaluación comparativa de técnicas de merge: sirve como referencia para medir cuánto se degrada o se conserva el rendimiento al fusionar un adaptador entrenado sobre una base cuantizada en 4 bits.
- Despliegue en endpoint compatible con TGI: la etiqueta `text-generation-inference` y `endpoints_compatible` permiten servirlo en infraestructura de HuggingFace sin conversión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y el repositorio no adjunta informe de evaluación.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: ~16 GB solo para pesos, más caché KV y activaciones; presupuesto realista de 18-24 GB para contextos moderados.
- VRAM estimada en 4 bits: ~5-6 GB de pesos, más overhead; viable en GPUs de 8-12 GB con contexto corto.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en bf16; L40S o RTX 4090 (24 GB) para inferencia en bf16 con un solo usuario.
- Cabe en GPU de consumo: sí. RTX 4090/3090 (24 GB) en bf16; RTX 4070 Ti, 4080 o 4060 Ti 16 GB en cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), TGI (etiqueta `text-generation-inference`), vLLM con soporte multimodal, y llama.cpp/Ollama únicamente si se convierte previamente a GGUF, formato que no se distribuye en este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skhwaja/mwp-gemma-4-E4B-unsloth-fintune-merged | ~8B (7.996.156.490) | no disponible | imagen-texto | apache-2.0 (declarada) | HuggingFace, 0 descargas |
| unsloth/gemma-4-E4B-it-unsloth-bnb-4bit (base) | no disponible en la información | no disponible | imagen-texto | no disponible en la información | HuggingFace |
| skhwaja/mwp-gemma-3-4b-unsloth-fintune-merged | no disponible en la información | no disponible | no disponible | no disponible en la información | HuggingFace |
| Gemma 4 E4B (Google) | no disponible en la información | no disponible | texto, visión, audio (según documentación de Unsloth) | licencia Gemma | Pesos abiertos |

No se dispone de datos públicos de rendimiento en la información proporcionada que permitan una comparación cuantitativa con alternativas como Qwen2.5-VL-7B o Llama 3.2 11B Vision.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de Gemma 4 hereda los sesgos del modelo base y de los datos de ajuste, no publicados.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni análisis de fidelidad en la model card.
- Idiomas: el campo `language: en` restringe el uso esperado al inglés; el comportamiento en castellano no está validado.
- Contexto: se desconoce la ventana máxima, lo que impide planificar cargas de documentos largos con garantías.
- Licencia: la model card declara apache-2.0, pero los modelos Gemma de Google se distribuyen habitualmente bajo Gemma Terms of Use, que imponen obligaciones adicionales de uso responsable. Verificar antes de un uso comercial.
- Procedencia del ajuste: el modelo base ya estaba cuantizado en 4 bits antes del entrenamiento, lo que puede haber introducido una pérdida de precisión que el merge no revierte.
- Dataset opaco: sin información sobre datos, número de pasos ni evaluación, no es posible estimar el sobreajuste ni la generalización fuera del dominio "mwp".
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo día (25 de octubre de 2026); no hay evidencia de uso en producción ni de mantenimiento.
- Sin GGUF publicado: para Ollama o llama.cpp hay que convertir los pesos, con el coste y el riesgo de validación que ello implica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skhwaja/mwp-gemma-4-E4B-unsloth-fintune-merged
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-unsloth-bnb-4bit
- Versión previa del autor (Gemma 3 4B): https://huggingface.co/skhwaja/mwp-gemma-3-4b-unsloth-fintune-merged
- Guía de fine-tuning de Gemma 4 con Unsloth: https://unsloth.ai/docs/models/gemma-4/train
- Catálogo de modelos de Unsloth: https://unsloth.ai/docs/get-started/unsloth-model-catalog
- Documentación oficial de Gemma 4: https://gemma.ai/models/gemma-4/
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Ejemplo de fine-tuning multimodal de Gemma 4: https://github.com/BryceWayne/gemma-4-multimodal-finetuning
