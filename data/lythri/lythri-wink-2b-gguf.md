# Lythri/Lythri-Wink-2B-GGUF

## Resumen

Lythri-Wink-2B-GGUF es la versión cuantizada en formato GGUF del modelo Lythri-Wink-2B, desarrollado por Lythri. Se trata de un modelo de lenguaje de 2.522.816.415 parámetros (aproximadamente 2,5 mil millones) orientado a generación de texto conversacional, con un enfoque declarado en soporte emocional y acompañamiento conversacional ("emotional-support", "companion"). Está construido sobre Gemma 4, según indica la model card, y se distribuye bajo licencia Apache 2.0.

El modelo está pensado para ejecución en dispositivo ("on-device"), lo que explica la publicación de cuantizaciones GGUF compatibles con llama.cpp, Ollama y LM Studio. Su tamaño reducido permite desplegarlo en hardware de consumo, y su orientación conversacional lo sitúa en el nicho de asistentes empáticos y aplicaciones de acompañamiento, más que en tareas de razonamiento complejo o generación de código.

La relevancia de esta ficha radica en que el repositorio GGUF es la vía práctica para ejecutar el modelo en local. No obstante, la información pública disponible es escasa: no se detallan idiomas soportados, datos de entrenamiento ni resultados de benchmarks, y el autor advierte explícitamente de una alta sensibilidad a la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4, según la model card); detalles no disponibles |
| Parametros totales | 2.522.816.415 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en múltiples precisiones (el autor recomienda la mayor precisión posible; se menciona Q8_0 como ejemplo); no se detalla la lista completa |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está en otro formato, no especificado) |

## Arquitectura y entrenamiento

La model card indica que Lythri-Wink-2B está construido sobre Gemma 4, lo que implica una arquitectura transformer decoder-only propia de la familia Gemma. No se proporcionan detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. El recuento de parámetros (2.522.816.415) corresponde al dato real de safetensors del modelo base.

No hay información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan procesos de ajuste fino específicos para el dominio de soporte emocional, más allá de las etiquetas del repositorio. La única advertencia técnica relevante es la sensibilidad a la cuantización: el autor señala que las cuantizaciones de baja precisión funcionan pero no son recomendables, lo que sugiere que el ajuste fino del modelo depende de manera importante de la fidelidad numérica de los pesos.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo de acompañamiento y soporte emocional.
- Reconocimiento y respuesta a contenido emocional en la conversación (etiqueta "emotion").
- Ejecución en dispositivo ("on-device") gracias a su tamaño de ~2,5B parámetros y a las cuantizaciones GGUF.
- Compatibilidad con llama.cpp, Ollama y LM Studio, además de endpoints compatibles (etiqueta "endpoints_compatible").
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito ("thinking mode").
- Capacidades multilingües: no disponibles (no se especifican idiomas).

## Casos de uso

- Asistente de acompañamiento emocional en local: el modelo puede mantener conversaciones de apoyo en aplicaciones de bienestar o diarios interactivos, ejecutándose íntegramente en el dispositivo del usuario sin enviar datos a la nube, lo que resulta adecuado por privacidad en un dominio sensible.
- Chatbot de escritorio integrado en Ollama o LM Studio: al publicarse en GGUF, puede desplegarse con `ollama run hf.co/Lythri/Lythri-Wink-2B-GGUF` para prototipos de asistentes personales en equipos de consumo.
- Aplicaciones móviles o embebidas con presupuesto de memoria limitado: con ~2,5B parámetros, las cuantizaciones de 4-8 bits caben en dispositivos con 2-6 GB de RAM/VRAM, lo que permite asistentes conversacionales offline.
- Prototipado rápido de interfaces conversacionales: la integración con llama.cpp y endpoints compatibles facilita montar una API local de chat para validar experiencias de usuario antes de escalar a modelos mayores.
- Investigación sobre modelos pequeños con matiz emocional: útil para estudiar cómo modelos de ~2B manejan tono, empatía y coherencia conversacional bajo restricciones de cómputo.
- Filtrado o reformulación de respuestas en pipelines de atención al usuario: puede emplearse como capa de reescritura empática de mensajes generados por otro sistema, siempre con revisión humana dado el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha del modelo base para resultados de evaluación, pero dichos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa por tamaño (no publicada por el autor), un modelo de ~2,5B en FP16 requiere del orden de 5 GB, en Q8_0 alrededor de 2,7 GB y en Q4 entre 1,5 y 2 GB, sin contar overhead de contexto.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU consumer con 4-8 GB de VRAM debería poder ejecutar cuantizaciones intermedias; el autor recomienda usar la mayor precisión que permita el hardware.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060/4060 y superiores, así como en CPU mediante llama.cpp; no hay confirmación oficial de modelos concretos.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio y endpoints compatibles.
- Parámetros de muestreo sugeridos por el autor: `--temp 0.8 --top-p 0.95 --top-k 64 --repeat-penalty 1.05`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de tamaño similar (por ejemplo, otros modelos de ~2-3B en GGUF). Se indica únicamente que el modelo deriva de Gemma 4 y que comparte licencia Apache 2.0.

## Limitaciones y advertencias

- Alta sensibilidad a la cuantización: el autor advierte que las cuantizaciones de baja precisión no son recomendables, lo que puede degradar la calidad conversacional en despliegues con poca memoria.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; en un dominio de soporte emocional, respuestas inventadas o consejos inadecuados son especialmente sensibles.
- Sesgos conocidos: no documentados. Al no detallarse la composición del dataset ni los idiomas, no es posible evaluar sesgos lingüísticos o culturales.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar un comportamiento correcto fuera del inglés o en conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Gemma 4 conviene verificar las condiciones de la licencia del modelo base original.
- Uso en producción: sin benchmarks ni documentación de alineación, no se recomienda desplegarlo en aplicaciones críticas de salud mental sin supervisión humana y salvaguardas adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Lythri/Lythri-Wink-2B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Wink-2B
- DOI de referencia: https://doi.org/10.5281/zenodo.23179311
- Banner del proyecto: https://huggingface.co/spaces/Lythri/README/resolve/main/Banner_flat.png
