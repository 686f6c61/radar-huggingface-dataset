# skaldrim/opus-mt-fi-en-ct2-int8

## Resumen

`skaldrim/opus-mt-fi-en-ct2-int8` es una conversión a CTranslate2 con cuantización int8 de los modelos de traducción automática OPUS-MT de Helsinki-NLP para el par finés-inglés e inglés-finés. No se trata de un modelo entrenado desde cero ni de un ajuste fino: el autor, skaldrim, únicamente ha transformado el formato de los pesos originales de Marian para que puedan ejecutarse con CTranslate2 en dispositivos locales, en el contexto de una aplicación de subtitulado (Skaldrim) que traduce sin enviar datos a servidores externos.

El modelo base es la familia OPUS-MT, desarrollada por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (Jörg Tiedemann, Santhosh Thottingal y colaboradores), entrenada con Marian NMT sobre el corpus OPUS. Se distribuyen dos carpetas independientes, una por dirección de traducción (`opus-mt-fi-en` y `opus-mt-en-fi`), cada una con sus propios modelos SentencePiece y vocabulario compartido.

Su relevancia práctica es acotada pero clara: ofrece traducción bidireccional finés-inglés en un paquete de unos 0,2 GB, ejecutable en CPU sin GPU, con licencia Apache-2.0 y sin dependencia de servicios en la nube. Es una opción adecuada para traducción de subtítulos, textos cortos y despliegues en dispositivos con recursos limitados, no para traducción literaria de alta fidelidad ni para pares de idiomas distintos del finés-inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parámetros totales | no disponible (pesos int8 de 76,8 MB para fi-en y 79,6 MB para en-fi) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (CTranslate2) |
| Idiomas soportados | finés (fi) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), más `config.json`, `shared_vocabulary.json` y modelos SentencePiece (`source.spm`, `target.spm`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de los modelos OPUS-MT: un transformer encoder-decoder entrenado con Marian NMT sobre la colección de corpus paralelos OPUS. Cada dirección de traducción es un modelo independiente, con su propio tokenizador SentencePiece y su propio vocabulario compartido. El autor de esta conversión no ha realizado entrenamiento ni ajuste fino: según la model card, solo se ha aplicado `ct2-transformers-converter --quantization int8` sobre los pesos originales de Hugging Face, manteniendo los modelos SentencePiece originales sin modificar.

La innovación técnica de esta ficha no reside en el entrenamiento sino en el formato de despliegue: la conversión a CTranslate2 con pesos int8 reduce el tamaño del artefacto a menos de 80 MB por dirección y permite inferencia eficiente en CPU, lo que habilita traducción en dispositivo (on-device) sin GPU ni conexión de red. No se documentan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO; esa información corresponde a los modelos originales de Helsinki-NLP y no se reproduce en la model card de esta conversión.

## Capacidades

- Traducción automática bidireccional finés-inglés e inglés-finés, con un modelo separado por dirección.
- Tokenización SentencePiece específica por dirección, con vocabulario compartido entre encoder y decoder.
- Ejecución en CPU mediante CTranslate2, sin requisito de GPU.
- Inferencia local y offline, apta para aplicaciones que no pueden enviar texto a servicios externos.
- Integración con el ecosistema CTranslate2 (API de Python, servidor de traducción, bindings).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking), visión, audio ni otras modalidades.
- Capacidad multilingüe limitada estrictamente al par finés-inglés; no cubre otros idiomas.

## Casos de uso

- Traducción de subtítulos en aplicaciones de vídeo: el paquete de 0,2 GB y la inferencia en CPU permiten traducir pistas de subtítulos finés-inglés localmente, sin enviar el contenido a un servidor, que es precisamente el escenario para el que se creó esta conversión en la app Skaldrim.
- Traducción en dispositivos con recursos limitados: al ejecutarse con CTranslate2 sobre CPU, puede desplegarse en portátiles, mini-PC o entornos edge donde no hay GPU disponible.
- Procesamiento por lotes de documentos finlandeses: traducción de informes, correos o documentación interna al inglés en pipelines offline, con throughput alto gracias a la cuantización int8.
- Preprocesamiento en pipelines de NLP: traducción automática previa a tareas de análisis de sentimiento, extracción de entidades o indexación de corpus finlandeses en un espacio en inglés.
- Herramientas de escritorio y extensiones de navegador: traducción bajo demanda de fragmentos de texto con latencia baja y sin coste por token, al no depender de una API externa.
- Prototipado e investigación en traducción automática: base ligera para comparar calidad de OPUS-MT frente a modelos neuronales de mayor tamaño, o para experimentar con CTranslate2 sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de calidad (BLEU, chrF, COMET) ni comparaciones con otros sistemas, y la búsqueda web realizada tampoco aporta cifras concretas para este artefacto.

## Requisitos de hardware

- VRAM estimada: no aplica en el modo previsto; la inferencia se realiza en CPU con pesos int8 de menos de 80 MB por dirección.
- GPU recomendadas: no son necesarias. Cualquier GPU compatible con CTranslate2 puede usarse, pero el modelo está pensado para CPU.
- GPU de consumo: irrelevante para el caso de uso principal; el modelo cabe holgadamente en memoria RAM de cualquier equipo actual.
- Opciones de despliegue: CTranslate2 (API de Python, `ct2` CLI, servidor de traducción), con los ficheros `model.bin`, `config.json`, `shared_vocabulary.json`, `source.spm` y `target.spm` por dirección.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| skaldrim/opus-mt-fi-en-ct2-int8 | Marian transformer, int8 | fi-en, en-fi | no disponible | Apache-2.0 | CTranslate2 | Hugging Face |
| Helsinki-NLP/opus-mt-fi-en | Marian transformer | fi-en | no disponible | Apache-2.0 | safetensors / PyTorch | Hugging Face |
| Helsinki-NLP/opus-mt-en-fi | Marian transformer | en-fi | no disponible | Apache-2.0 | safetensors / PyTorch | Hugging Face |

La diferencia principal frente a los modelos originales de Helsinki-NLP es el formato y la cuantización: esta conversión pesa menos de 80 MB por dirección y está optimizada para CPU, mientras que los originales se distribuyen en formato PyTorch y requieren el stack de transformers. La calidad de traducción debería ser equivalente en la práctica, al no haberse reentrenado el modelo, aunque la cuantización int8 puede introducir una degradación mínima no cuantificada en la información disponible.

## Limitaciones y advertencias

- La cuantización int8 puede producir una ligera pérdida de calidad respecto a los pesos originales en fp32; no se han publicado métricas que cuantifiquen esa diferencia.
- El alcance lingüístico es exclusivamente finés-inglés; no traduce otros idiomas ni variantes regionales de forma específica.
- No se documenta la longitud máxima de secuencia soportada, lo que obliga a validar empíricamente el comportamiento con textos largos.
- Riesgo de alucinación y de traducciones erróneas en dominios especializados (legal, médico, técnico), habitual en modelos OPUS-MT entrenados sobre corpus genéricos.
- Sesgos potenciales heredados del corpus OPUS, cuya composición y balance no se detallan en la model card.
- La licencia Apache-2.0 permite uso comercial, pero el autor recomienda citar el trabajo original de Tiedemann y Thottingal (2020) sobre OPUS-MT.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.
- Cualquier error en la conversión es responsabilidad del autor de la conversión, no de Helsinki-NLP, según indica la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skaldrim/opus-mt-fi-en-ct2-int8
- Modelo base fi-en: https://huggingface.co/Helsinki-NLP/opus-mt-fi-en
- Modelo base en-fi: https://huggingface.co/Helsinki-NLP/opus-mt-en-fi
- Guía de OPUS-MT en CTranslate2: https://opennmt.net/CTranslate2/guides/opus_mt.html
- Repositorio OPUS-MT de Helsinki-NLP: https://github.com/Helsinki-NLP/Opus-MT
- Repositorio CTranslate2: https://github.com/OpenNMT/CTranslate2
- Referencia: Tiedemann, J. y Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
