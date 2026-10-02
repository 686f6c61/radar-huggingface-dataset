# malinali-app/opus-mt-es-rn

## Resumen

El modelo `malinali-app/opus-mt-es-rn` es un sistema de traducción automática neuronal para el par de idiomas español (es) → kirundi/rundi (rn), empaquetado por el desarrollador malinali-app a partir de los pesos del modelo `Helsinki-NLP/opus-mt-es-rn` del proyecto OPUS-MT de la Universidad de Helsinki. No se trata de un entrenamiento nuevo, sino de una redistribución de los pesos originales en formato safetensors junto con tokenizadores rápidos (SentencePiece convertido a JSON de Hugging Face) pensados para inferencia en dispositivo mediante el runtime Candle.

El modelo emplea la arquitectura Marian, un transformer encoder-decoder específicamente diseñado para traducción automática, con 48.516.440 parámetros totales y un tamaño de repositorio de 0,2 GB. Su función es traducir texto de español a kirundi, un idioma bantú hablado principalmente en Burundi, para el que existen pocos recursos de traducción automática de calidad. La relevancia del paquete radica en su orientación a ejecución on-device (aplicación Malinali), lo que permite traducción sin conexión en dispositivos con recursos limitados.

El modelo se distribuye sin datos de descargas ni valoraciones en el momento de la consulta, tiene licencia no disponible en el repositorio (el proyecto OPUS-MT upstream suele publicarse bajo CC-BY 4.0) y su idioma de origen es el español, con el kirundi como único idioma de destino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq) |
| Parametros totales | 48.516.440 |
| Longitud de contexto | no disponible (la arquitectura Marian de OPUS-MT suele emplear 512 tokens) |
| Tipos de cuantizacion | no disponible en el repositorio; compatible con conversiones habituales (int8, fp16) al ser safetensors |
| Idiomas soportados | es (español) como origen, rn (kirundi/rundi) como destino |
| Licencia | no disponible (el modelo upstream OPUS-MT se publica habitualmente bajo CC-BY 4.0) |
| Formato de pesos | safetensors |
| Direccion de traduccion | es → rn |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Marian, una familia de modelos de traducción automática de tipo transformer con estructura encoder-decoder desarrollada dentro del proyecto OPUS-MT de Helsinki-NLP. Esta arquitectura está optimizada para traducción de secuencias a secuencias y se caracteriza por ser ligera y eficiente en comparación con modelos multilingües de gran tamaño, lo que la hace adecuada para despliegue en entornos con recursos computacionales limitados.

No se dispone de información sobre el proceso de entrenamiento específico del modelo original (número de tokens, composición del corpus, ni uso de RLHF o DPO) más allá de lo publicado por el proyecto OPUS-MT. Según la model card, malinali-app no ha entrenado el modelo: únicamente ha reempaquetado los pesos originales en safetensors y ha convertido el tokenizador SentencePiece a formato JSON de tokenizador rápido de Hugging Face para su uso con el runtime Candle (`marian_flutter`). No se documentan innovaciones técnicas adicionales en el repositorio.

## Capacidades

- Traducción de texto de español a kirundi/rundi (dirección única es → rn).
- Generación de texto de tipo text2text-generation, propia de los modelos seq2seq de traducción.
- Ejecución en dispositivo (on-device) mediante Candle, con tokenizadores rápidos para el encoder y el decoder.
- Compatibilidad con la librería `transformers` y la pipeline de traducción.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de razonamiento extendido.
- Capacidad multilingüe limitada estrictamente al par es → rn.

## Casos de uso

- Traducción de documentación oficial y administrativa: el modelo traduce textos institucionales del español al kirundi, útil para organismos que operan en Burundi y necesitan publicar materiales en la lengua local.
- Localización de aplicaciones móviles: al integrarse vía Candle en la app Malinali, permite traducir interfaces y contenido de apps a kirundi sin conexión, reduciendo la dependencia de servicios en la nube.
- Atención al ciudadano en servicios públicos: traducción de comunicaciones, formularios y avisos del español al kirundi para administraciones o entidades que atienden a población kirundófona.
- Cooperación internacional y ONG: traducción de informes, guías sanitarias o materiales de formación del español al kirundi para proyectos de desarrollo en la región de los Grandes Lagos.
- Traducción de contenido educativo: conversión de lecciones, manuales y materiales didácticos del español al kirundi para programas de alfabetización y educación.
- Traducción en entornos sin conectividad: al ser un modelo de 48,5 millones de parámetros y 0,2 GB, puede desplegarse en dispositivos modestos y funcionar localmente donde no hay acceso a internet.
- Preprocesado en pipelines de datos: uso como componente de traducción es → rn dentro de flujos de procesamiento lingüístico o de generación de corpus paralelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de BLEU, METEOR ni evaluación sobre conjuntos como Flores-200, y no se dispone de comparaciones cuantitativas con otros modelos para el par es → rn.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 48,5 millones de parámetros): en fp32 en torno a 200 MB, en fp16 en torno a 100 MB y en int8 en torno a 50 MB, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe con holgura incluso en GPU de gama de entrada y en iGPU integradas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual (por ejemplo, series RTX 20/30/40, GTX 10) e incluso puede ejecutarse únicamente en CPU sin dificultad.
- Opciones de despliegue: `transformers` (pipeline de traducción), Candle mediante `marian_flutter` (runtime previsto por el autor), y conversiones a otros formatos (por ejemplo, CTranslate2 o llama.cpp/GGUF) sujetas a disponibilidad de herramientas de conversión para Marian.
- Latencia y throughput: no disponibles en la información proporcionada; dada la reducida cantidad de parámetros, se espera una latencia baja en hardware moderno, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cobertura de idiomas | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-es-rn | 48,5 M | no disponible | no disponible (upstream CC-BY 4.0) | es → rn | Hugging Face (repo 0,2 GB) |
| Helsinki-NLP/opus-mt-es-rn | orden de decenas de millones (no confirmado en esta ficha) | no disponible | habitualmente CC-BY 4.0 | es → rn | Hugging Face (upstream) |
| NLLB-200 (variantes destiladas) | desde ~600 M | hasta 512 tokens | CC-BY-NC 4.0 (restringida para uso comercial) | multilingüe, incluye rn | Hugging Face / Meta |
| M2M-100 (418 M) | ~418 M | ~1024 tokens | MIT (según publicación original) | multilingüe | Hugging Face / Meta |

Nota: los datos de rendimiento comparativo (BLEU u otras métricas) no están disponibles, por lo que la comparación se limita a parámetros, contexto, licencia y cobertura.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; los modelos OPUS-MT heredan los sesgos presentes en los corpus paralelos utilizados en su entrenamiento.
- Riesgo de alucinación: presente, como en cualquier modelo seq2seq de traducción, especialmente en segmentos largos o con vocabulario fuera de dominio.
- Limitación de dirección: el modelo solo traduce es → rn; no soporta la dirección inversa ni otros pares de idiomas.
- Limitación de idioma: el kirundi es un idioma de bajos recursos, por lo que la calidad puede ser inferior a la de pares con más datos disponibles.
- Licencia: no disponible en el repositorio; aunque el upstream OPUS-MT suele ser CC-BY 4.0, conviene verificar los términos antes de un uso comercial, ya que el paquete redistribuido no especifica una licencia propia.
- Caveat de producción: no se han publicado métricas de calidad ni evaluaciones; se recomienda validar el modelo con un conjunto de prueba propio antes de desplegarlo.
- Caveat de mantenimiento: el repositorio no presenta descargas ni valoraciones, lo que dificulta la validación por parte de la comunidad.
- Longitud de contexto no documentada: debe confirmarse en la configuración del modelo si se van a procesar textos largos, ya que la arquitectura Marian suele limitarse a 512 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-es-rn
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-es-rn
- Proyecto OPUS-MT (GitHub): https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app
