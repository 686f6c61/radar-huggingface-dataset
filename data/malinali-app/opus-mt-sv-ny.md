# malinali-app/opus-mt-sv-ny

## Resumen

El modelo `malinali-app/opus-mt-sv-ny` es un sistema de traducción automática neuronal para la dirección sueco (sv) → chichewa/nyanja (ny), publicado por el desarrollador malinali-app. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de los pesos de `Helsinki-NLP/opus-mt-sv-ny` (familia OPUS-MT del grupo de investigación de lenguaje de la Universidad de Helsinki) en formato safetensors, junto con tokenizadores rápidos convertidos desde SentencePiece al formato JSON de Hugging Face. El objetivo declarado es servir como paquete de inferencia en dispositivo (*on-device*) para la aplicación Malinali, mediante el runtime Candle a través del componente `marian_flutter`.

Técnicamente es un modelo Marian, es decir, un transformer encoder-decoder de tipo seq2seq orientado exclusivamente a traducción, con 75.697.745 parámetros (aproximadamente 75,7 millones) y un tamaño de repositorio de 0,3 GB. Su relevancia es doble: por un lado cubre un par lingüístico de muy bajos recursos (el chichewa es una lengua bantú hablada principalmente en Malaui, Zambia y Mozambique, con cobertura escasa en sistemas comerciales); por otro, demuestra un patrón de despliegue móvil y offline que reduce la dependencia de APIs en la nube para pares de idiomas minoritarios.

El modelo no tiene métricas de adopción reseñables: 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado información sobre benchmarks, licencia explícita ni detalles de entrenamiento adicionales. Debe considerarse, por tanto, un artefacto de distribución más que una contribución de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq) |
| Parametros totales | 75.697.745 (aprox. 75,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se han publicado versiones cuantizadas; el tamano del repo (0,3 GB) es coherente con pesos en FP32 (75,7 M x 4 bytes ≈ 303 MB) |
| Idiomas soportados | Sueco (sv) como origen, chichewa/nyanja (ny) como destino |
| Licencia | No disponible en los metadatos; la model card remite a la licencia del modelo base, habitualmente CC-BY 4.0 en la familia OPUS-MT |
| Formato de pesos | safetensors (`model.safetensors`), mas tokenizadores rapidos en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) y `config.json` de Marian |

## Arquitectura y entrenamiento

La arquitectura es Marian, la implementación de traducción automática neuronal desarrollada en el proyecto OPUS de la Universidad de Helsinki. Se trata de un transformer seq2seq clásico con encoder y decoder, atención multi-cabeza y mecanismo de atención cruzada, diseñado específicamente para traducción y no para generación abierta de texto. Al ser un modelo de traducción puro, no incorpora modo de razonamiento, tool calling, capacidades multimodales ni decodificación especulativa. Los detalles concretos de hiperparámetros (número de capas, dimensión del modelo, cabezas de atención, vocabulario) no están disponibles en la información proporcionada.

Respecto al entrenamiento, la información disponible no incluye datos sobre volumen de tokens, composición del corpus, técnicas de alineación (RLHF, DPO) ni procedimiento de destilación. La model card indica explícitamente que malinali-app únicamente reempaqueta los pesos del modelo base `Helsinki-NLP/opus-mt-sv-ny` y convierte los tokenizadores de SentencePiece a formato de tokenizador rápido de Hugging Face para permitir la inferencia en dispositivo con Candle. La innovación, por tanto, no está en el modelado sino en la distribución: empaquetado ligero (0,3 GB), tokenizadores separados de origen y destino, y compatibilidad con un runtime de inferencia en Flutter.

## Capacidades

- Traducción de texto de sueco a chichewa/nyanja, en una única dirección; no soporta la dirección inversa.
- Generación seq2seq pura: recibe una secuencia en sv y produce la secuencia traducida en ny.
- Ejecución en dispositivo mediante Candle (`marian_flutter`), sin necesidad de conexión a red ni de servicio en la nube.
- Compatibilidad con la librería `transformers` de Hugging Face como vía alternativa de inferencia.
- Tokenización rápida con tokenizadores independientes para el lado fuente y el lado destino.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de pensamiento (*thinking*), visión, audio ni multimodalidad.
- Multilingüismo limitado estrictamente al par sv → ny; no se documentan capacidades de transferencia a otras lenguas.

## Casos de uso

- Aplicaciones móviles de traducción sin conexión: al ocupar 0,3 GB y estar empaquetado para Candle, el modelo puede embeberse en una app Flutter y funcionar en modo avión, útil para cooperantes, personal sanitario y viajeros en zonas de Malaui, Zambia o Mozambique con conectividad limitada.
- Traducción de materiales de organizaciones no gubernamentales: informes, guías de campo y protocolos redactados en sueco por agencias de cooperación escandinavas pueden traducirse a chichewa para su distribución local sin coste por token ni envío de datos a terceros.
- Traducción de contenido educativo y sanitario: adaptación de folletos de salud pública, formación agrícola o materiales escolares desde el sueco al chichewa, con la ventaja de que el modelo es lo bastante pequeño para ejecutarse en un portátil de gama media incluso por CPU.
- Pre-traducción en pipelines híbridos: usar este modelo como primera etapa de traducción automática y reservar un modelo de lenguaje grande para posedición; el coste computacional de la primera pasada es mínimo dado el tamaño de 75,7 M de parámetros.
- Procesamiento por lotes de corpus para investigación en lenguas de bajos recursos: traducción masiva de textos suecos a chichewa para construir corpus paralelos, estudios de lingüística computacional o evaluación de sistemas NMT en lenguas bantúes.
- Traducción dentro de un CMS o plataforma de documentación: integración como microservicio o biblioteca local que traduzca automáticamente entradas nuevas de un blog o wiki escrito en sueco hacia la versión en chichewa.
- Comunicación de emergencia y ayuda humanitaria: generación rápida de avisos y mensajes operativos en chichewa a partir de textos redactados en sueco, en escenarios donde la latencia de red o la disponibilidad de APIs no está garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas BLEU, chrF, COMET ni evaluaciones de calidad de traducción, y las búsquedas web realizadas no han devuelto documentación técnica asociada a este artefacto.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 0,3 GB solo para los pesos, más el consumo de activaciones y memoria del runtime; en la práctica, menos de 1 GB con lotes pequeños.
- VRAM en FP16: aproximadamente 0,15 GB para los pesos; en cuantización INT8, alrededor de 0,08 GB (estimaciones derivadas del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente. Modelos como A100, H100 o RTX 4090 están enormemente sobredimensionados para este tamaño; una GTX 1650, una RTX 3060 o incluso una GPU integrada moderna son suficientes.
- Cabe holgadamente en GPU de consumo e incluso en dispositivos móviles de gama alta, Raspberry Pi y sistemas embebidos, que es precisamente el escenario objetivo del paquete.
- Opciones de despliegue: `transformers` (vía `MarianMTModel`), Candle con `marian_flutter`, y conversión a otros runtimes de inferencia como CTranslate2 u ONNX Runtime. Ollama y llama.cpp no aplican porque no es un modelo generativo causal ni se distribuye en GGUF.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, se espera una latencia de milisegundos por frase en CPU moderna y muy inferior en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-sv-ny | 75,7 M | sv → ny | No disponible | No disponible (remite al base) | Hugging Face, safetensors + tokenizers JSON |
| Helsinki-NLP/opus-mt-sv-ny | 75,7 M (mismos pesos) | sv → ny | No disponible | CC-BY 4.0 en la familia OPUS-MT | Hugging Face, PyTorch/SentencePiece |
| facebook/nllb-200-distilled-600M | 600 M | 200 idiomas, incluido el chichewa | 512 tokens | CC-BY-NC 4.0 (no comercial) | Hugging Face, transformers |
| facebook/m2m100_418M | 418 M | 100 idiomas | 1024 tokens | MIT | Hugging Face, transformers |

El modelo de malinali-app es funcionalmente idéntico al de Helsinki-NLP en cuanto a pesos; la diferencia está en el formato de distribución (safetensors y tokenizadores rápidos orientados a Candle). Frente a NLLB-200 y M2M-100, ofrece un tamaño entre cinco y ocho veces menor y una licencia potencialmente más permisiva (CC-BY 4.0 frente a CC-BY-NC 4.0 de NLLB), a cambio de no soportar más que un único par de idiomas y de carecer de métricas de calidad publicadas.

## Limitaciones y advertencias

- Direccionalidad única: solo traduce de sueco a chichewa; no existe soporte para la dirección ny → sv en este repositorio.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad de traducción, por lo que su uso en producción debería ir precedido de una evaluación propia sobre un corpus de referencia.
- Idiomas de bajos recursos: el chichewa cuenta con menos datos paralelos que lenguas mayoritarias, lo que suele traducirse en mayor tasa de errores en terminología especializada, nombres propios y expresiones idiomáticas.
- Riesgo de alucinación y de omisión de contenido: como todo modelo NMT, puede generar traducciones fluidas que no corresponden al texto original, o saltarse fragmentos en entradas largas.
- Longitud de contexto no documentada: el autor no especifica el límite de tokens de entrada, lo que obliga a validar experimentalmente el comportamiento con textos largos y a trocear los documentos.
- Licencia ambigua: los metadatos de Hugging Face no declaran licencia, y la model card se limita a indicar que se debe seguir la del modelo base. Para uso comercial es imprescindible verificar la licencia de `Helsinki-NLP/opus-mt-sv-ny` antes de desplegar.
- Adopción nula y sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar su correcto funcionamiento.
- Sesgos: no hay información publicada sobre sesgos de género, registro o variantes dialectales del chichewa, un aspecto especialmente relevante en lenguas con variación dialectal significativa.
- Fecha de creación atípica (2026-10-02) en los metadatos, lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-sv-ny
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-sv-ny
- Proyecto OPUS-MT (repositorio): https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app

Nota: las búsquedas web realizadas no han devuelto resultados relevantes sobre este modelo ni sobre su par lingüístico sv → ny; los enlaces encontrados correspondían a contenidos sin relación (artículos deportivos y documentos administrativos en otras lenguas). No se dispone de papers, blogs técnicos ni demos adicionales.
