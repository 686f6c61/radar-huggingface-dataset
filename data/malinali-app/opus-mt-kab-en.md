# malinali-app/opus-mt-kab-en

## Resumen

malinali-app/opus-mt-kab-en es un modelo de traducción automática del cabilio (kab) al inglés (en), publicado por malinali-app. Es un reempaquetado de los pesos de Helsinki-NLP/opus-mt-kab-en en formato safetensors, junto con tokenizadores rápidos convertidos desde SentencePiece para su uso con Candle (`marian_flutter`). El objetivo declarado es facilitar inferencia en dispositivo dentro de la aplicación Malinali.

El modelo tiene 56.625.431 parámetros y una arquitectura Marian de tipo text2text-generation, según las etiquetas y la model card. No se especifica la longitud de contexto en la información disponible. Su relevancia radica en ofrecer traducción kab→en ligera y offline para entornos móviles o con conectividad limitada, aunque no se han publicado benchmarks y la licencia no está disponible en los metadatos.

Al ser un derivado de OPUS-MT, su comportamiento y limitaciones heredan los del modelo original Helsinki-NLP/opus-mt-kab-en, cuyos detalles de entrenamiento no se incluyen en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traducción, text2text-generation) |
| Parámetros totales | 56.625.431 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio publica pesos safetensors sin cuantizaciones alternativas documentadas |
| Idiomas soportados | kab (cabilio), en (inglés); dirección kab → en |
| Licencia | no disponible en los metadatos; la model card indica seguir la licencia del modelo upstream, típicamente CC-BY 4.0 para OPUS-MT |
| Formato de pesos | safetensors (`model.safetensors`); tokenizadores en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |

## Arquitectura y entrenamiento

La información proporcionada describe un modelo Marian de traducción, con pipeline `translation` y tarea `text2text-generation`. Se distribuye como pesos safetensors acompañados de dos tokenizadores rápidos en JSON: uno para el idioma fuente y otro para el idioma destino. Esta conversión desde SentencePiece a tokenizadores compatibles con Hugging Face está pensada para inferencia en dispositivo mediante Candle (`marian_flutter`).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni otras innovaciones técnicas. El modelo es un reempaquetado de Helsinki-NLP/opus-mt-kab-en, por lo que el entrenamiento subyacente corresponde al proyecto OPUS-MT, pero sus características concretas no se especifican aquí.

## Capacidades

- Traducción de texto de cabilio (kab) a inglés (en).
- Generación text2text, adecuada para frases, párrafos y documentos cortos.
- Inferencia en dispositivo mediante Candle (`marian_flutter`), orientada a aplicaciones móviles o locales.
- Uso con tokenizadores rápidos en formato JSON, lo que facilita la integración con flujos basados en Hugging Face Transformers.
- Soporte limitado a los idiomas kab y en; no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No es un modelo conversacional general; su función principal es la traducción.

## Casos de uso

- Traducción offline en aplicaciones móviles para hablantes de cabilio: el modelo puede ejecutarse en dispositivo gracias a sus 56,6 millones de parámetros y a los pesos safetensors, lo que permite traducir sin conexión a internet.
- Atención al ciudadano en servicios públicos: integración en formularios o asistentes que reciban textos en kab y necesiten generar una versión en inglés para su tramitación interna.
- Localización de interfaces y documentación: traducción de cadenas de texto, menús y manuales de kab a en antes de pasarlos por un pipeline de publicación multilingüe.
- Subtitulado y transcripción de contenido audiovisual: generación de subtítulos en inglés a partir de transcripciones en cabilio, con revisión humana posterior.
- Educación y aprendizaje de idiomas: herramienta de apoyo para estudiantes que quieran comparar textos en kab y en, o para crear materiales bilingües.
- Preservación lingüística y archivo: digitalización y traducción de textos en cabilio para su conservación en repositorios documentales.
- Investigación en traducción de bajos recursos: uso como línea base ligera en experimentos de traducción automática kab→en, dado su tamaño reducido y su disponibilidad en safetensors.
- Comunicación humanitaria en zonas con conectividad limitada: traducción local de mensajes esenciales entre personal y comunidades cabiloparlantes sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 0,23 GB en FP32, 0,12 GB en FP16 y 0,06 GB en int8. Hay que sumar el overhead del runtime y de los tokenizadores.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede alojar el modelo; también es viable en CPU y en dispositivos móviles compatibles con Candle.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en hardware integrado, dado el tamaño del modelo.
- Opciones de despliegue: Transformers y Candle (`marian_flutter`) están documentados. El repositorio incluye la etiqueta `endpoints_compatible`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| malinali-app/opus-mt-kab-en | 56.625.431 | no disponible | no disponible en metadatos; upstream típicamente CC-BY 4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-kab-en | no disponible | no disponible | típicamente CC-BY 4.0 | Hugging Face |
| Otras alternativas de traducción kab→en | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Al derivar de OPUS-MT, puede heredar sesgos presentes en los datos de entrenamiento originales, especialmente en dominios técnicos, legales o médicos.
- Riesgo de alucinación en traducción: puede generar términos o matices inexistentes en el texto fuente, sobre todo con vocabulario especializado o poco frecuente.
- El cabilio es un idioma de bajos recursos; la cobertura léxica y dialectal puede ser limitada.
- La longitud de contexto no está documentada, por lo que no se puede garantizar un rendimiento estable con textos largos sin pruebas adicionales.
- La licencia no está disponible en los metadatos; la model card remite a la licencia upstream. Para uso comercial es necesario verificar la licencia de Helsinki-NLP/opus-mt-kab-en.
- No se han publicado benchmarks, por lo que no hay métricas objetivas de calidad (BLEU, chrF, etc.) en la información disponible.
- No está diseñado para tool calling, agentes ni razonamiento multi-paso; su uso previsto es la traducción kab→en.
- En producción, se recomienda validación humana y monitorización de errores, especialmente en dominios sensibles.

## Enlaces

- https://huggingface.co/malinali-app/opus-mt-kab-en
- https://huggingface.co/Helsinki-NLP/opus-mt-kab-en
- https://github.com/Helsinki-NLP/Opus-MT
- https://malinali.app
