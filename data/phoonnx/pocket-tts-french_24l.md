# Phoonnx/pocket-tts-french_24l

## Resumen

pocket-tts-french_24l es un modelo de síntesis de voz (text-to-speech) empaquetado en formato ONNX y distribuido por el usuario Phoonnx dentro del repositorio phoonnx-pocket-tts. Se trata de la carpeta `french_24l` de ese repositorio, extraída como modelo independiente para su uso con la librería phoonnx, un motor de TTS basado en ONNX Runtime desarrollado por TigreGotico. El modelo está orientado a la generación de voz en francés y expone 26 identificadores de voz distintos bajo el prefijo `pockettts/fr/`.

El modelo deriva de los pesos de Kyutai (así lo indica la propia model card al exigir atribución a Kyutai), y conserva la licencia Creative Commons Attribution 4.0 International del repositorio de origen. La nomenclatura `24l` sugiere una configuración de 24 capas, aunque este dato no se confirma explícitamente en la información disponible. El repositorio ocupa 2,4 GB, un tamaño coherente con pesos en precisión completa o media para un modelo de tamaño moderado.

Su relevancia radica en que ofrece una vía de despliegue de TTS en francés sobre ONNX Runtime, lo que facilita la inferencia en entornos sin GPU dedicada o integrados en aplicaciones de escritorio y servidor. No obstante, el modelo no registra descargas ni interacciones en Hugging Face y la información técnica publicada es muy limitada: no se detallan parámetros, arquitectura interna ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz; la nomenclatura `24l` sugiere 24 capas, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX; el repo ocupa 2,4 GB) |
| Idiomas soportados | francés (identificadores de voz `pockettts/fr/*`); otros idiomas no disponibles |
| Licencia | CC BY 4.0 (Creative Commons Attribution 4.0 International), con atribución a Kyutai |
| Formato de pesos | ONNX |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Voces incluidas | 26 voces con prefijo `pockettts/fr/` |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo en la documentación proporcionada. La model card únicamente indica que se trata de un modelo de TTS empaquetado en ONNX para la librería phoonnx y que los pesos provienen de Kyutai, sin detallar si se trata de un transformer, un modelo acústico con vocoder integrado, un modelo de difusión o una arquitectura híbrida. El sufijo `24l` apunta a una profundidad de 24 capas, pero no se confirma en el texto.

Tampoco se especifican los datos de entrenamiento: ni el número de horas de audio, ni la composición del corpus, ni si se aplicaron técnicas de ajuste fino, RLHF o destilación. La única información relevante sobre el origen es la exigencia de atribución a Kyutai, lo que vincula los pesos a la línea de modelos de audio de ese laboratorio, aunque sin más precisión.

## Capacidades

- Síntesis de voz en francés a partir de texto, con salida de audio generada por el modelo.
- Selección entre 26 voces distintas mediante identificadores `pockettts/fr/<nombre>`, entre ellas alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell y vera.
- Ejecución mediante ONNX Runtime a través de la librería phoonnx.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, cambio de velocidad ni soporte multilingüe más allá del francés.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por tratarse de un modelo de TTS y no de un modelo de lenguaje.

## Casos de uso

- Lectura de artículos y documentos en francés: el modelo convierte texto plano en audio, adecuado para aplicaciones de accesibilidad o lectura por voz en sitios web y aplicaciones móviles, con la ventaja de ejecutarse sobre ONNX Runtime.
- Asistentes de voz para atención al cliente en francés: permite generar respuestas habladas en un pipeline de diálogo, eligiendo entre las 26 voces disponibles para adaptar el tono al contexto de la marca.
- Audiolibros y contenido editorial: la variedad de voces facilita la narración de textos largos con distintos narradores, siempre que se gestione la segmentación del texto en fragmentos.
- Sistemas de navegación y avisos por voz: integrable en aplicaciones de escritorio o embebidas gracias al formato ONNX, sin necesidad de infraestructura de GPU dedicada.
- Generación de audio para vídeos y pódcast en francés: producción de locuciones sintéticas para prototipos y contenido interno, con la posibilidad de cambiar de voz entre secciones.
- Pruebas de integración en pipelines de TTS: útil como modelo de referencia para validar el motor phoonnx en entornos de desarrollo antes de desplegar otros modelos de la misma familia.
- Aplicaciones educativas de aprendizaje de francés: reproducción de frases y vocabulario con distintas voces para practicar la comprensión auditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El repositorio ocupa 2,4 GB, por lo que los pesos en ONNX requieren al menos ese espacio en memoria o disco; la VRAM necesaria para inferencia no se documenta.
- GPU recomendadas: no disponibles. Al ejecutarse sobre ONNX Runtime, el modelo puede funcionar tanto en CPU como en GPU compatibles con dicho runtime.
- Cabe en GPU de consumo: probablemente sí en términos de memoria (2,4 GB de pesos), aunque no se confirma el consumo real durante la inferencia ni el rendimiento.
- Opciones de despliegue: librería phoonnx sobre ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo de TTS en ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pocket-tts-french_24l (Phoonnx) | TTS | Francés | CC BY 4.0 | ONNX | Hugging Face, 0 descargas |
| Modelos TTS de Kyutai (origen de los pesos) | TTS | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Otros modelos de la familia phoonnx-pocket-tts | TTS | No disponible | CC BY 4.0 (según repositorio de origen) | ONNX | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Información técnica muy escasa: no se publican parámetros, arquitectura interna, contexto ni detalles de entrenamiento, lo que dificulta evaluar su calidad antes de desplegarlo.
- Modelo sin tracción verificable: 0 descargas y 0 likes en Hugging Face en el momento de la consulta, sin evidencia de uso en producción.
- Idioma limitado al francés: no se documenta soporte para otras lenguas, a pesar de que algunas voces tengan nombres que podrían sugerir otros acentos.
- Riesgo de alucinación y errores de pronunciación: como todo modelo de TTS, puede generar pronunciaciones incorrectas en nombres propios, siglas, números o texto con formato irregular; no se documenta ningún mecanismo de normalización.
- Licencia CC BY 4.0: permite uso comercial con atribución obligatoria a Kyutai y al autor del empaquetado; es imprescindible conservar el aviso de licencia y dar crédito.
- Dependencia de la librería phoonnx: el modelo está empaquetado para ese motor concreto, por lo que su uso fuera de él requiere adaptar los archivos ONNX y conocer las interfaces de entrada y salida, que no se documentan.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó el mismo día (14 de noviembre de 2026) y no hay indicios de soporte posterior.
- Posibles sesgos en las voces: no se documenta la procedencia de los datos de voz ni la diversidad de los hablantes, lo que impide evaluar sesgos de género, edad o acento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pocket-tts-french_24l
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-pocket-tts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
