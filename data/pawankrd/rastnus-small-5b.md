# PawanKrd/RastNus-Small-5B

## Resumen

RastNus-Small-5B (ڕاستنووس, "escritura correcta") es un modelo de lenguaje de 5.104.371.011 parámetros totales, con aproximadamente 2.000 millones de parámetros efectivos, desarrollado por PawanKrd. Se trata de un ajuste fino (fine-tune) del modelo base google/gemma-4-E2B, especializado en la corrección gramatical, ortográfica y de puntuación del kurdo central, también conocido como sorani (código ISO ckb). El modelo parte de una arquitectura Gemma 4 de tipo Mixture of Experts (MoE) con activación dispersa, lo que explica la diferencia entre parámetros totales y efectivos.

El problema que aborda es la escasez de herramientas NLP para el kurdo sorani, una de las lenguas peor atendidas en el ecosistema moderno de procesamiento del lenguaje natural. La escritura cotidiana en sorani presenta inconsistencias ortográficas frecuentes: omisión de letras diacríticas como ی/ێ, و/ۆ y ر/ڕ, errores de espaciado, puntuación informal y uso mezclado de préstamos léxicos. RastNus recibe texto sorani sin procesar y devuelve una versión limpia, estandarizada y correctamente escrita, preservando el significado y la voz del autor.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con la librería transformers. Su relevancia actual radica en que cubre una tarea concreta de normalización lingüística para una lengua de bajos recursos, con un tamaño que permite despliegue en infraestructura moderada, y con una licencia permisiva que facilita su integración en productos editoriales, educativos o de moderación de contenido en kurdo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (Gemma 4 E2B) |
| Parámetros totales | 5.104.371.011 |
| Parámetros activos | ~2.000 millones (efectivos, según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | kurdo central / sorani (ckb) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RastNus-Small-5B se construye sobre google/gemma-4-E2B, un modelo Gemma 4 de arquitectura Mixture of Experts con aproximadamente 2.000 millones de parámetros efectivos sobre un total de 5.104.371.011 parámetros. La model card no detalla la composición exacta de los expertos, el número de capas ni la configuración de atención; tampoco especifica la longitud de contexto nativa del modelo base. El pipeline declarado en Hugging Face es text-generation, y los tags incluyen image-text-to-text, lo que sugiere que el modelo base conserva capacidades multimodales de entrada imagen-texto, aunque la especialización de RastNus se centra en texto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino, ni sobre si se aplicaron técnicas de RLHF, DPO o supervisión humana en la corrección. La model card describe únicamente el objetivo funcional: transformar texto sorani con errores en una versión estandarizada. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos SSM.

## Capacidades

- Corrección ortográfica en kurdo sorani: restauración de letras diacríticas omitidas (ی/ێ, و/ۆ, ر/ڕ) y normalización de grafías inconsistentes.
- Corrección gramatical: ajuste de concordancia, formas verbales y construcciones sintácticas propias del sorani estándar.
- Restauración de puntuación: inserción y normalización de signos de puntuación en texto informal o sin puntuar.
- Corrección de espaciado: unión y separación correcta de palabras y morfemas.
- Normalización de préstamos léxicos: armonización del uso de términos de origen árabe, persa o inglés hacia formas estándar en sorani.
- Generación de texto conversacional: el pipeline text-generation y los tags conversational indican soporte de diálogo multi-turno.
- Entrada imagen-texto: heredada del modelo base Gemma 4 E2B, según el tag image-text-to-text; no se detalla su alcance en la model card.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Corrección editorial de publicaciones en sorani: integración en el flujo de revisión de periódicos, revistas o blogs en kurdo central para normalizar ortografía y puntuación antes de publicar, reduciendo el trabajo manual de correctores.
- Herramientas de escritura para oficinas y administraciones: plugin o API que corrige documentos oficiales redactados en sorani, donde la consistencia ortográfica es requisito formal y la disponibilidad de correctores comerciales es prácticamente nula.
- Plataformas educativas de enseñanza del kurdo: retroalimentación automática sobre redacciones de estudiantes, señalando diacríticos omitidos, errores de espaciado y puntuación, con explicaciones derivadas de la versión corregida.
- Moderación y limpieza de contenido generado por usuarios: normalización de comentarios y mensajes en redes sociales escritos en sorani informal antes de aplicar clasificadores de toxicidad o sistemas de búsqueda, mejorando la tasa de coincidencia léxica.
- Preprocesado para pipelines de NLP en kurdo: etapa de normalización previa a traducción automática, análisis de sentimiento o indexación de documentos, de modo que los modelos posteriores reciban texto estandarizado y reduzcan el vocabulario fuera de vocabulario.
- Digitalización de archivos y corpus históricos: limpieza de texto OCR o transcripciones de material en sorani para construir corpus lingüísticos consistentes destinados a investigación o entrenamiento de otros modelos.
- Asistentes conversacionales en kurdo central: despliegue como capa de post-procesado de las respuestas de un chatbot, garantizando que la salida cumpla la ortografía estándar antes de mostrarse al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 10-11 GB solo para pesos, más memoria para el contexto y las cachés KV; en la práctica, 16-24 GB de VRAM para un despliegue cómodo.
- Cuantización a 8 bits: alrededor de 5-6 GB de pesos; cuantización a 4 bits: alrededor de 3 GB, aunque estos valores son estimaciones a partir del número de parámetros y no están confirmados en la model card.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para producción con contexto largo y concurrencia; RTX 4090 (24 GB) para fp16 en un solo usuario.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en tarjetas de 8-12 GB (RTX 4070, RTX 3060 12 GB) requiere cuantización.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para servir en producción, llama.cpp u Ollama si se generan pesos GGUF; los tags endpoints_compatible indican compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RastNus-Small-5B | 5,1 B totales / ~2 B activos | no disponible | Corrección gramatical y ortográfica en sorani | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B | ~2 B efectivos (modelo base) | no disponible | Propósito general multimodal | Licencia Gemma 4 | Hugging Face |
| Modelos de corrección gramatical multilingües (p. ej. variantes de mT5 o GEC multilingües) | 0,3-13 B según variante | variable | Corrección GEC en múltiples lenguas, cobertura limitada en sorani | variable (Apache 2.0, MIT) | Hugging Face |

La comparación directa con alternativas especializadas en kurdo sorani no está disponible: no se han identificado en la información proporcionada modelos públicos de corrección gramatical dedicados a esta lengua con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo cubre kurdo central (sorani, ckb); no se ha entrenado ni evaluado para kurmanji, zazaki ni otras variedades kurdas.
- Riesgo de alucinación: al ser un modelo generativo, puede reescribir fragmentos más allá de la corrección puntual, alterando el significado o introduciendo contenido no presente en el original.
- No hay datos publicados sobre sesgos; al derivar de Gemma 4, puede heredar sesgos del modelo base y del corpus de ajuste fino, no documentado.
- No se especifica la longitud de contexto, lo que impide garantizar el comportamiento en documentos largos ni planificar el truncado de entradas.
- La licencia Apache 2.0 del repositorio convive con la licencia Gemma 4 del modelo base enlazada en la model card; conviene revisar los términos de uso de Gemma 4 antes de un despliegue comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación externa ni informes de terceros sobre su calidad.
- No se documentan benchmarks, por lo que no existe evidencia cuantitativa de precisión en corrección; se recomienda evaluar con un conjunto propio anotado antes de producción.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse para integraciones que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawanKrd/RastNus-Small-5B
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Organización del autor: https://huggingface.co/PawanKrd
- Sitio web del autor: https://pawan.krd
