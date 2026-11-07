# pleasen/Gemma-4-E4B-IT-QAT

## Resumen

Gemma-4-E4B-IT-QAT es una versión cuantizada y optimizada del modelo Gemma 4 E4B en su variante instruction-tuned, publicada por el usuario `pleasen` en Hugging Face. Se distribuye en formato GGUF y está pensada para despliegue en entornos con recursos limitados, incluidos dispositivos móviles, mediante la eliminación de los codificadores de audio, la cuantización de las capas de visión a Q8_0 o Q4_0 y la conversión de los embeddings posicionales de FP32 a FP16. El repositorio ocupa 7,6 GB y declara 7.463.013.674 parámetros totales según los pesos en safetensors.

El modelo parte de la familia Gemma 4 de Google, concretamente del checkpoint E4B, cuya variante QAT (quantization-aware training) oficial es `google/gemma-4-E4B-it-qat-w4a16-ct`. La contribución de `pleasen` consiste en adaptar ese checkpoint a un empaquetado GGUF orientado a inferencia local y a reducir el tamaño del fichero mmproj (proyección multimodal) hasta aproximadamente el 20 % del original en la variante Q8_0. La licencia declarada es Apache 2.0.

La relevancia de esta ficha radica en que cubre un hueco práctico: llevar un modelo multimodal de la familia Gemma 4 a hardware de consumo y a despliegues on-device sin renunciar por completo a las capacidades de visión, a costa de sacrificar el procesamiento de audio. No obstante, la información pública disponible es muy escasa y muchos datos técnicos no están confirmados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 4 E4B, transformer multimodal con capas de visión) |
| Parámetros totales | 7.463.013.674 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; capas de visión en Q8_0 o Q4_0; embeddings posicionales en FP16; checkpoint base QAT w4a16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 7,6 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que el modelo deriva de Gemma 4 E4B, un modelo de la familia Gemma 4 de Google que, por los datos del checkpoint oficial `google/gemma-4-E4B-it-qat-w4a16-ct`, se distribuye en variantes E2B, E4B, 12B y 31B y admite decodificación especulativa mediante modelos asistente (multi-token prediction). El checkpoint base emplea quantization-aware training en precisión w4a16, lo que implica que los pesos se entrenaron teniendo en cuenta la cuantización a 4 bits con activaciones en 16 bits, reduciendo la pérdida de calidad respecto a una cuantización post-entrenamiento convencional.

Las modificaciones introducidas por `pleasen` son de naturaleza numérica y de empaquetado, no de reentrenamiento: se eliminan los codificadores de audio para reducir la huella total, se cuantizan las capas de visión a Q8_0 o Q4_0 y se convierten los embeddings posicionales de FP32 a FP16. El resultado es un fichero mmproj-BF16 de aproximadamente el 20 % del tamaño original en la variante Q8_0. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en formato instruction-tuned, según la etiqueta `conversational` del repositorio.
- Procesamiento de imágenes mediante las capas de visión conservadas y cuantizadas (Q8_0 o Q4_0), con el fichero mmproj reducido.
- Compatibilidad con endpoints de inferencia, según la etiqueta `endpoints_compatible`.
- Procesamiento de audio: no disponible, ya que los codificadores de audio fueron eliminados en esta versión.
- Tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Decodificación especulativa: posible en la familia Gemma 4 QAT, pero requiere un modelo asistente QAT con la misma precisión; no confirmado para este empaquetado concreto.

## Casos de uso

- Despliegue en dispositivos móviles y edge: el empaquetado GGUF con visión en Q8_0/Q4_0 y embeddings posicionales en FP16 reduce el almacenamiento lo suficiente para integración en apps on-device con inferencia local.
- Asistentes conversacionales locales: la naturaleza instruction-tuned y la etiqueta `conversational` permiten usar el modelo como chatbot en escritorio o móvil sin conexión, siempre que se valide la calidad tras la cuantización.
- Procesamiento de imágenes en local: aplicaciones de descripción de imágenes, extracción de texto de capturas o clasificación visual ligera que se beneficien de no enviar datos a la nube.
- Prototipado rápido con llama.cpp u Ollama: el formato GGUF facilita cargar el modelo en pipelines de experimentación sin infraestructura GPU dedicada.
- Evaluación de cuantizaciones: sirve como referencia para comparar la pérdida de calidad entre Q8_0 y Q4_0 en las capas de visión de la familia Gemma 4.
- Integración en entornos con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso en servicios de inferencia que acepten el formato, útil para demos y pruebas internas.
- Investigación sobre QAT: permite estudiar el comportamiento de un checkpoint w4a16 reempaquetado en GGUF frente al checkpoint oficial de Google.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 7,6 GB, por lo que la inferencia en FP16 requeriría del orden de 15 GB, mientras que las variantes GGUF cuantizadas a 4-8 bits deberían situarse en un rango aproximado de 4 a 8 GB, sin confirmación del autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar compatibilidad con GPUs de consumo de 8-16 GB de VRAM, pero no hay datos publicados.
- Cabida en GPU de consumo: probable en tarjetas con 8 GB o más en cuantizaciones bajas, no confirmado.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no están confirmados para este empaquetado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pleasen/Gemma-4-E4B-IT-QAT | 7.463.013.674 | no disponible | GGUF | Apache 2.0 | Audio eliminado, visión cuantizada, mmproj reducido |
| google/gemma-4-E4B-it-qat-w4a16-ct | no disponible | no disponible | safetensors (w4a16) | no disponible en la información | Checkpoint QAT oficial de Google, base de esta versión |
| pleasen/Gemma-4-E4B-QAT | no disponible | no disponible | GGUF | no disponible | Variante GGUF del mismo autor sin las optimizaciones descritas |

## Limitaciones y advertencias

- La información pública es muy escasa: no se declaran idiomas, contexto, benchmarks ni detalles de entrenamiento.
- La eliminación de los codificadores de audio implica que el modelo no puede procesar audio, a diferencia del Gemma 4 E4B original.
- La cuantización de las capas de visión a Q4_0 puede degradar la calidad en tareas visuales exigentes; no hay evaluaciones publicadas que lo cuantifiquen.
- Riesgo de alucinación inherente a los modelos de lenguaje instruction-tuned, no mitigado de forma específica en esta versión.
- Sesgos conocidos: no disponibles; se heredan los del modelo base Gemma 4, no documentados aquí.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones de la licencia Gemma original de Google antes de un uso comercial, ya que el modelo deriva de ella.
- El uso de decodificación especulativa con modelos asistente exige que estos sean también QAT y de la misma precisión, según la documentación de Google.
- Repositorio con muy poca tracción (115 descargas, 1 like) y sin pipeline declarado; no hay garantías de mantenimiento ni soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pleasen/Gemma-4-E4B-IT-QAT
- Checkpoint QAT oficial de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Variante GGUF del mismo autor: https://huggingface.co/pleasen/Gemma-4-E4B-QAT/tree/main
