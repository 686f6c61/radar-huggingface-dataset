# CompiwerAI/YUBA-XV

## Resumen

YUBA-XV es un checkpoint "stealth" publicado por Compiwer AI, una empresa con sede en Marruecos, bajo licencia Apache-2.0. Se trata de un modelo multimodal de tipo image-text-to-text con aproximadamente 9.400 millones de parámetros (9.409.813.744 según los pesos en safetensors), construido como un fine-tuning de una familia de modelos abiertos que el autor no revela explícitamente en la model card. El modelo se presenta como un anticipo de un lanzamiento mayor que se desvelará en el evento Compile '26 el 28 de noviembre de 2026.

El modelo está diseñado para razonar antes de responder (thinking mode), procesar imágenes y generar texto en inglés, francés, árabe y dariya marroquí. La model card indica que fue entrenado de forma que ninguna métrica de evaluación seguida por el equipo empeorase respecto al punto de partida, aunque no se publican los resultados concretos.

Su relevancia actual es doble: por un lado, introduce soporte explícito de dariya marroquí, un idioma poco cubierto en modelos abiertos; por otro, su naturaleza de checkpoint "stealth" lo convierte en un objeto de evaluación temprana para la comunidad, que está invitada a probarlo y reportar fallos antes del lanzamiento oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5` en Hugging Face; familia base no confirmada) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; se desconoce si hay GGUF oficial) |
| Idiomas soportados | inglés, árabe, francés, dariya marroquí |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna. La etiqueta `qwen3_5` en Hugging Face sugiere que el modelo deriva de la familia Qwen 3.5, y la carga mediante `AutoModelForImageTextToText` confirma que se trata de un modelo multimodal con torre de visión y decoder de lenguaje, compatible con la interfaz estándar de Transformers para modelos image-text-to-text. No se especifica si emplea atención lineal, decodificación especulativa ni otras innovaciones de eficiencia.

Respecto al entrenamiento, el autor indica únicamente que es un fine-tuning de pesos abiertos y que se entrenó con la restricción de no degradar ninguna métrica de evaluación respecto al modelo de partida. No se publican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se detalla el proceso de alineación para el modo de razonamiento previo a la respuesta.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento previo a la respuesta (thinking mode): el modelo "piensa antes de contestar" según la model card.
- Comprensión de imágenes y respuesta en texto (image-text-to-text).
- Multilingüismo: inglés, francés, árabe y dariya marroquí.
- Integración con Transformers mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Despliegue en vLLM mediante `vllm serve CompiwerAI/YUBA-XV`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Atención al cliente en dariya marroquí: el modelo puede gestionar conversaciones en un idioma coloquial poco cubierto por modelos abiertos, útil para empresas marroquíes que atienden a usuarios que escriben en dariya y no en árabe estándar.
- Asistencia multimodal en francés y árabe: análisis de imágenes con respuesta en texto para sectores como seguros, inmobiliaria o educación en el Magreb, aprovechando el soporte de los tres idiomas principales del modelo.
- Digitalización de documentos con OCR asistido: al ser image-text-to-text, puede emplearse para extraer y resumir información de facturas, formularios o capturas, con salida en francés o árabe.
- Evaluación temprana y red teaming: dado que el autor invita explícitamente a "intentarlo romper", es adecuado para pruebas de robustez, sesgos y alucinación antes del lanzamiento oficial.
- Prototipado de asistentes con razonamiento visible: el modo de pensamiento previo permite construir asistentes que muestran su cadena de razonamiento antes de la respuesta final, útil en entornos educativos o de soporte técnico.
- Investigación en multilingüismo de bajos recursos: sirve como punto de comparación para estudiar el rendimiento en dariya frente a árabe estándar y francés en tareas de generación y comprensión de imágenes.
- Despliegue en infraestructura propia: al publicarse en safetensors con licencia Apache-2.0 y soporte de vLLM, puede integrarse en pipelines internos sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor afirma que ninguna métrica seguida empeoró respecto al modelo base, pero no proporciona cifras ni identifica qué métricas se evaluaron.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos (9.409.813.744 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 10-12 GB de pesos, más overhead; viable en GPUs de 16-24 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos, más overhead; viable en GPUs consumer de 8-12 GB, aunque la calidad y el soporte multimodal pueden degradarse.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para despliegue en producción con contexto largo; RTX 4090 (24 GB) para FP16 en contextos moderados; RTX 3090/4080 (16-24 GB) para cuantización 8 bits.
- ¿Cabe en GPU consumer? Sí, en FP16 en RTX 4090 y en cuantización en GPUs de 12-16 GB, siempre que se valide el soporte multimodal en el backend elegido.
- Opciones de despliegue: Transformers (con `AutoModelForImageTextToText` y `device_map="auto"`) y vLLM (`vllm serve`). No se confirma soporte oficial de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, parámetros activos, rendimiento) que permitan una comparación rigurosa. La model card no identifica el modelo base ni ofrece alternativas comparables. Se indica, por tanto, "no disponible" para una comparativa cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Estado |
|---|---|---|---|---|---|
| YUBA-XV | 9,4 B | no disponible | Apache-2.0 | Sí | Checkpoint stealth |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo "stealth": el autor no revela el nombre real, el proceso de entrenamiento ni los resultados de benchmarks; la información pública es deliberadamente incompleta.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación; en un modelo con thinking mode, las cadenas de razonamiento pueden contener errores que no se reflejen en la respuesta final.
- Sesgos conocidos: no disponibles; al ser un fine-tuning de una familia abierta, hereda los sesgos del modelo base, que no se documentan.
- Cobertura idiomática desigual: el soporte de dariya marroquí es una novedad, pero no se han publicado métricas de calidad por idioma; el rendimiento en dariya podría ser inferior al de inglés o francés.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas o documentos extensos.
- Licencia Apache-2.0: permite uso comercial, pero el autor indica que la licencia y avisos del modelo base están incluidos en el repositorio; conviene revisarlos antes de desplegar en producción.
- Madurez: con 0 descargas y 0 likes en el momento de la consulta y un lanzamiento oficial pendiente, no hay evidencia de uso en producción ni validación externa.
- Soporte de cuantización y backends alternativos no confirmado: la viabilidad en llama.cpp, Ollama o TGI no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CompiwerAI/YUBA-XV
- Evento Compile '26: https://www.compiwer.ai/compile
- Cuenta de X del autor: https://x.com/compiwer_ai
- Contacto: hello@compiwer.ai
