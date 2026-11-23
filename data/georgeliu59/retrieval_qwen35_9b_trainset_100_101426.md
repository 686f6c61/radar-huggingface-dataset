# georgeliu59/retrieval_qwen35_9b_trainset_100_101426

## Resumen

`retrieval_qwen35_9b_trainset_100_101426` es un ajuste fino (fine-tuning) supervisado del modelo multimodal Qwen3.5-9B, publicado por el usuario georgeliu59 en Hugging Face. El modelo está especializado en una tarea muy concreta: el etiquetado binario Sí/No de vídeos (video-labeling), es decir, responder de forma afirmativa o negativa a una pregunta sobre el contenido de un vídeo. No se trata de un modelo de propósito general, sino de un artefacto de investigación derivado de un conjunto de datos de etiquetado concreto.

El ajuste se realizó con LlamaFactory sobre los 420.979 ejemplos de etiquetado preparados en la exportación completa del 14 de octubre de 2026, sin submuestreo ni balanceo adicional, durante cinco épocas. Se congeló la torre de visión y el proyector multimodal, actualizando únicamente el modelo de lenguaje. El resultado es un modelo de 9.409.813.744 parámetros (9,4 mil millones) en formato safetensors, con pipeline `image-text-to-text` y compatibilidad con la librería transformers.

Su relevancia es limitada fuera del contexto del proyecto: no dispone de evaluación en conjunto de validación (el autor lo indica explícitamente), la licencia no está declarada y el repositorio ocupa 508,2 GB, lo que refleja la inclusión de múltiples checkpoints. Resulta útil como referencia para reproducir pipelines de fine-tuning multimodal con LlamaFactory y para tareas de clasificación binaria sobre vídeo, pero no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-9B: torre de visión + proyector + modelo de lenguaje); el fine-tuning congela visión y proyector |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el preprocesado aplica un corte de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, un modelo multimodal de tipo image-text-to-text con torre de visión, proyector multimodal y un modelo de lenguaje de aproximadamente 9,4 mil millones de parámetros. El fine-tuning actualiza únicamente el modelo de lenguaje y mantiene congelados la torre de visión y el proyector, de modo que las capacidades de percepción visual quedan fijadas en las del modelo base.

El entrenamiento se realizó con LlamaFactory sobre 420.979 ejemplos de etiquetado Sí/No, sin balanceo ni submuestreo, y sin conjunto de validación reservado. Se completaron cinco épocas (6.580 actualizaciones del optimizador) con batch efectivo de 320 en 16 GPU (microbatch 2, acumulación 10), learning rate 3e-5 con schedule coseno y 5 % de warmup, precisión BF16, ZeRO-2 y gradient checkpointing no reentrante. La plantilla de chat utilizada es `qwen3_5_nothink`. La configuración de vídeo es de 8 FPS, como máximo 128 fotogramas y 65.536 píxeles por fotograma, con corte de 8.192 tokens; el autor indica que el preprocesado verificó cada prompt, vídeo y objetivo Sí/No sin descartar ejemplos ni alcanzar el límite de tokens. Los checkpoints omiten estado de optimizador, scheduler y RNG, por lo que no permiten reanudar una ejecución interrumpida de forma exacta.

## Capacidades

- Etiquetado binario Sí/No de vídeo: responde a preguntas sobre el contenido de un vídeo con una respuesta afirmativa o negativa, que es la tarea para la que fue ajustado.
- Comprensión image-text-to-text heredada del modelo base Qwen3.5-9B, limitada por el congelamiento de la torre de visión y del proyector.
- Procesamiento de vídeo con hasta 128 fotogramas a 8 FPS y 65.536 píxeles por fotograma en el preprocesado de entrenamiento.
- Generación de texto conversacional mediante la plantilla de chat `qwen3_5_nothink` (sin modo de razonamiento explícito).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, audio, visión adicional): no disponibles; el modelo base es multimodal, pero el ajuste se limita a la tarea de etiquetado.

## Casos de uso

- Clasificación binaria de clips de vídeo en pipelines de anotación: el modelo recibe un vídeo y una pregunta en formato Sí/No y devuelve la etiqueta, lo que permite automatizar la primera pasada de anotación de grandes corpus de vídeo.
- Verificación de contenido en moderación audiovisual: dado un criterio concreto ("¿aparece una persona conduciendo?"), el modelo responde Sí/No sobre el clip, útil como filtro previo a revisión humana.
- Control de calidad de datasets de vídeo: aplicar el modelo a muestras ya etiquetadas para detectar discrepancias entre la etiqueta original y la predicción del modelo ajustado.
- Etiquetado de eventos deportivos o de vigilancia: preguntas del tipo "¿hay un vehículo en la escena?" o "¿se produce una caída?" sobre fotogramas muestreados a 8 FPS.
- Generación de metadatos para motores de búsqueda de vídeo: convertir preguntas de negocio en etiquetas Sí/No almacenables como atributos indexables del clip.
- Investigación en fine-tuning multimodal: servir como referencia reproducible de un pipeline LlamaFactory con ZeRO-2, gradient checkpointing y congelación de visión para experimentos de clasificación binaria sobre vídeo.
- Filtrado de contenido para recomendadores: descartar clips que no cumplen un criterio binario antes de pasarlos a un modelo generativo más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no existe conjunto de validación reservado y que el repositorio no reclama resultados de evaluación en datos no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 9,4 mil millones de parámetros en BF16, se requieren aproximadamente 19 GB solo para pesos, más memoria para activaciones y caché KV; en cuantización de 8 bits bajaría a unos 10 GB y en 4 bits a unos 6 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPU de 24 GB o más en BF16 (por ejemplo, RTX 4090, A10G, L40S, A100) y en GPU de 16 GB con cuantización, pero no hay validación publicada.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en BF16 y en RTX 4080/4070 Ti Super con cuantización, aunque el modelo base es multimodal y el procesamiento de vídeo a 128 fotogramas añade memoria para activaciones; no hay datos confirmados.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El coste dominante será el preprocesado de vídeo (hasta 128 fotogramas y 65.536 píxeles por fotograma) más la generación de una respuesta corta Sí/No.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| retrieval_qwen35_9b_trainset_100_101426 | 9,4 mil millones | no disponible (corte de 8.192 tokens en entrenamiento) | Etiquetado Sí/No de vídeo | no disponible | Hugging Face, safetensors |
| Qwen/Qwen3.5-9B (base) | 9,4 mil millones | no disponible | Image-text-to-text generalista | no disponible | Hugging Face |
| georgeliu59/retrieval_trainset_100_101426 | no disponible | no disponible | Etiquetado Sí/No de vídeo (mismo dataset preparado) | no disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de clasificación binaria sobre vídeo) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No existe conjunto de validación reservado ni resultados de evaluación en datos no vistos; el rendimiento real fuera del conjunto de entrenamiento es desconocido.
- Riesgo de sobreajuste a los 420.979 ejemplos de entrenamiento tras cinco épocas sin submuestreo ni balanceo.
- La torre de visión y el proyector están congelados: las capacidades de percepción visual son las del modelo base y no se han adaptado a la tarea.
- La licencia no está declarada, por lo que no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue en producción.
- Los idiomas soportados no están documentados; la plantilla de chat y los datos de entrenamiento condicionan el comportamiento lingüístico.
- El repositorio ocupa 508,2 GB por la inclusión de checkpoints; los checkpoints no permiten reanudar exactamente una ejecución interrumpida al omitir estado de optimizador, scheduler y RNG.
- Riesgo de alucinación en respuestas fuera del formato Sí/No esperado; el modelo está ajustado para una salida binaria y puede degradarse ante preguntas abiertas.
- El corte de 8.192 tokens y el límite de 128 fotogramas restringen la duración de los vídeos procesables.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base y los del corpus de etiquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/georgeliu59/retrieval_qwen35_9b_trainset_100_101426
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de referencia del autor: https://huggingface.co/georgeliu59/retrieval_trainset_100_101426
- LlamaFactory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
