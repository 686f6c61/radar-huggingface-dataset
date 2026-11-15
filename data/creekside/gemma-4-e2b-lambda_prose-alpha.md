# Creekside/gemma-4-E2B-lambda_prose-alpha

## Resumen

Creekside/gemma-4-E2B-lambda_prose-alpha es un ajuste fino (finetune) del modelo Gemma 4 E2B en su variante instructiva, publicado por el usuario Creekside bajo licencia Apache 2.0. El modelo parte de la versión cuantizada en 4 bits de Unsloth (unsloth/gemma-4-E2B-it-unsloth-bnb-4bit) y se ha reentrenado y exportado en FP16, con un total de 5.123.178.051 parámetros según los pesos en safetensors. La nomenclatura "lambda_prose-alpha" sugiere un ajuste orientado a prosa o estilo narrativo, aunque la model card no documenta el dataset ni el objetivo concreto del entrenamiento.

El modelo se distribuye en formato transformers con pesos safetensors, pipeline image-text-to-text y compatibilidad con text-generation-inference y endpoints. Está etiquetado únicamente para inglés (en). Su relevancia actual es limitada pero ilustrativa: muestra el flujo típico de la comunidad de ajustar un Gemma 4 pequeño con Unsloth y TRL para especializarlo en un dominio concreto, con un coste de entrenamiento reducido (el autor afirma que se entrenó "2x faster" con Unsloth).

Al tratarse de un modelo derivado de Gemma 4 E2B, hereda la arquitectura multimodal del modelo base, pero la información pública disponible es muy escasa: no hay detalles sobre el dataset de ajuste, hiperparámetros, benchmarks ni evaluación cualitativa. Esta ficha refleja exclusivamente lo que puede verificarse en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Gemma 4 E2B; detalles internos no disponibles |
| Parámetros totales | 5.123.178.051 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | El modelo se publica en FP16; el base estaba en bnb-4bit (4 bits) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint unsloth/gemma-4-E2B-it-unsloth-bnb-4bit, que a su vez es una versión cuantizada en 4 bits (bitsandbytes) del Gemma 4 E2B instructivo. El autor indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, con una mejora de velocidad declarada de 2x respecto a un flujo estándar. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado.

La arquitectura subyacente corresponde a Gemma 4 E2B, un transformer multimodal capaz de procesar imagen y texto (pipeline image-text-to-text). No obstante, la información proporcionada no detalla la innovación técnica concreta de esta variante E2B (posiblemente una variante eficiente o "E" de la familia Gemma 4), ni si incorpora atención lineal, decodificación especulativa u otras optimizaciones. El checkpoint publicado está en FP16, lo que implica que los pesos se des-cuantizaron desde el base en 4 bits antes o después del ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo base.
- Procesamiento de imagen y texto (image-text-to-text): puede recibir imágenes junto con prompts textuales.
- Ajuste orientado a prosa o estilo narrativo (según la nomenclatura "lambda_prose"), aunque no hay documentación que lo confirme.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Generación de prosa y contenido narrativo en inglés: el ajuste "prose" sugiere un uso orientado a redacción creativa, artículos o ficción; adecuado por su tamaño moderado (5,1 mil millones de parámetros) que permite despliegue en hardware de gama media.
- Descripción de imágenes en inglés: al ser un modelo image-text-to-text, puede generar descripciones o pies de foto a partir de imágenes, útil en pipelines de accesibilidad o catalogación.
- Prototipado de asistentes conversacionales: su formato transformers y compatibilidad con text-generation-inference permiten integrarlo rápidamente en entornos de prueba.
- Ajuste adicional (fine-tuning) sobre dominio específico: al estar en FP16 y con licencia Apache 2.0, sirve como punto de partida para especializaciones posteriores con Unsloth o TRL.
- Investigación en eficiencia de ajuste: útil para estudiar el impacto de reentrenar un modelo cuantizado en 4 bits y exportarlo en 16 bits.
- Generación de texto asistida en entornos con recursos limitados: sus 5,1 mil millones de parámetros permiten inferencia en GPUs de consumo con cuantización adicional (GGUF, AWQ), aunque el repo solo ofrece safetensors FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 10,2 GB solo para pesos (5,12 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 12-16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para FP16 sin cuantizar; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con margen ajustado; en GPUs de 8-12 GB requeriría cuantización adicional (no incluida en el repo).
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta presente), vLLM (compatible con safetensors), llama.cpp/Ollama solo si se genera un GGUF a partir de los pesos (no incluido).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Creekside/gemma-4-E2B-lambda_prose-alpha | 5,12 B | no disponible | Apache 2.0 | safetensors FP16 | Finetune de Gemma 4 E2B, solo inglés |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | no disponible | no disponible | Apache 2.0 (heredada) | bnb-4bit | Modelo base cuantizado en 4 bits |
| Gemma 4 E2B instructivo (original) | no disponible | no disponible | Apache 2.0 | safetensors | Modelo de referencia de Google |

No se dispone de datos de rendimiento comparativo ni de otros finetunes equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Gemma 4, puede heredar sesgos del corpus de entrenamiento original, no evaluados en este finetune.
- Riesgo de alucinación: no evaluado; los finetunes pequeños sin evaluación pública suelen incrementar el riesgo de degradación en tareas fuera del dominio de ajuste.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está disponible y podría diferir del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 y de la versión de Unsloth.
- Caveats para producción: no hay benchmarks, evaluación cualitativa ni documentación del dataset; el modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad. El formato FP16 (10,2 GB) limita su despliegue en GPUs pequeñas sin cuantización adicional.
- El ajuste se realizó sobre un checkpoint cuantizado en 4 bits y se exportó en FP16, lo que puede introducir artefactos de cuantización no corregidos.

## Enlaces

- Hugging Face: https://huggingface.co/Creekside/gemma-4-E2B-lambda_prose-alpha
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
