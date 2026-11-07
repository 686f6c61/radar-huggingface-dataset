# skaldrim/opus-mt-sv-en-ct2-int8

## Resumen

`skaldrim/opus-mt-sv-en-ct2-int8` es una conversión a CTranslate2 con cuantización int8 de los modelos de traducción automática OPUS-MT de la Universidad de Helsinki, empaquetados en un único repositorio con dos carpetas, una por dirección (sueco→inglés e inglés→sueco). No es un modelo nuevo: el autor declara explícitamente que solo ha cambiado el formato de los pesos, pasando de los pesos Marian originales en Hugging Face a un `model.bin` en formato CTranslate2, manteniendo los modelos SentencePiece originales (`source.spm`, `target.spm`) y el vocabulario compartido.

El modelo resuelve el problema de traducción neuronal sueco↔inglés en dispositivos locales, sin envío de datos a servidores externos. Según la model card, se usa para traducir subtítulos en la aplicación Skaldrim. La arquitectura subyacente es Marian NMT (transformer encoder-decoder), entrenada sobre el corpus OPUS, con un tamaño de repositorio de 0,2 GB y pesos de aproximadamente 75 MB por dirección.

Su relevancia práctica es la de un artefacto ligero y desplegable en local: al estar en CTranslate2 int8, puede ejecutarse en CPU con requisitos de memoria muy bajos, lo que lo hace útil para traducción de subtítulos, preprocesado de corpus o pipelines de bajo coste. La licencia Apache-2.0 heredada de los originales permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible (pesos int8 de 75.112.795 bytes por dirección) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | sueco (sv), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), SentencePiece (`source.spm`, `target.spm`), `shared_vocabulary.json`, `config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es Marian NMT, un transformer encoder-decoder desarrollado por el Language Technology Research Group de la Universidad de Helsinki (Jörg Tiedemann, Santhosh Thottingal y colaboradores), entrenado sobre la colección de corpus OPUS. La conversión a CTranslate2 se realizó con `ct2-transformers-converter --quantization int8` a partir de los pesos Marian de Hugging Face. No hubo entrenamiento adicional ni fine-tuning: el autor indica que solo se modificó el formato.

La innovación técnica de este artefacto no está en el modelo en sí, sino en el empaquetado: la cuantización int8 reduce el peso a unos 75 MB por dirección y permite inferencia eficiente en CPU con CTranslate2, que implementa optimizaciones de decodificación (batch, beam search) propias del runtime. Los tokenizadores SentencePiece son los originales de cada dirección, y el vocabulario compartido se conserva tal cual. No se dispone de información sobre número de tokens de entrenamiento, composición exacta del dataset ni si hubo RLHF/DPO; estos datos corresponden a la documentación original de OPUS-MT, no incluida en la información proporcionada.

## Capacidades

- Traducción automática bidireccional sueco↔inglés (dos carpetas independientes, una por dirección).
- Traducción de texto plano a nivel de frase o párrafo, adecuada para subtítulos y contenido corto.
- Tokenización SentencePiece integrada para ambos idiomas.
- Inferencia local en CPU mediante CTranslate2, sin dependencia de servicios externos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada a los dos idiomas del par (sv, en).

## Casos de uso

- Traducción de subtítulos en aplicaciones móviles o de escritorio: es el caso de uso declarado por el autor (app Skaldrim); el tamaño reducido (75 MB por dirección) y la inferencia en CPU permiten traducir pistas de subtítulos sin conexión y sin enviar texto a terceros.
- Preprocesado de corpus suecos para pipelines de NLP: traducción automática de grandes volúmenes de texto sv→en en local con CTranslate2, aprovechando el bajo coste de memoria y la posibilidad de procesar por lotes.
- Traducción de documentación técnica y READMEs: para equipos que mantienen documentación en sueco e inglés, el modelo permite una primera pasada automática que luego se revisa manualmente.
- Localización de interfaces de usuario: traducción de cadenas cortas de UI (menús, mensajes de error, etiquetas) en aplicaciones que necesitan ambos idiomas, ejecutándose en el propio dispositivo.
- Traducción de correos y mensajes en herramientas internas: integración en un servicio ligero que traduzca comunicaciones internas entre equipos suecos e internacionales, con requisitos de hardware mínimos.
- Generación de datos sintéticos bilingües: uso del par sv↔en para crear pares paralelos de entrenamiento o aumentación de datos en proyectos de investigación, dado que la licencia Apache-2.0 lo permite.
- Traducción en entornos con restricciones de privacidad: al ejecutarse en local con CTranslate2, es apto para textos sensibles que no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal; el modelo está pensado para CPU. En GPU, el peso int8 de 75 MB por dirección implica un consumo de memoria muy bajo (del orden de cientos de MB incluyendo runtime y buffers).
- GPU recomendadas: cualquier GPU con suficiente memoria para el runtime de CTranslate2; no se especifican modelos concretos en la información disponible.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño de pesos (75 MB por dirección).
- Opciones de despliegue: CTranslate2 (runtime nativo, con `ct2-transformers-converter` para la conversión); no se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| skaldrim/opus-mt-sv-en-ct2-int8 | no disponible (75 MB int8 por dirección) | no disponible | sv, en | Apache-2.0 | CTranslate2 int8 |
| Helsinki-NLP/opus-mt-sv-en | no disponible | no disponible | sv, en | Apache-2.0 (según original) | Marian (Hugging Face) |
| Helsinki-NLP/opus-mt-en-sv | no disponible | no disponible | en, sv | Apache-2.0 (según original) | Marian (Hugging Face) |
| gaudi/opus-mt-sv-en-ctranslate2 | no disponible | no disponible | sv, en | no disponible | CTranslate2 |

La comparativa se limita a variantes del mismo modelo base y a otra conversión comunitaria a CTranslate2; no se dispone de datos de rendimiento comparativo (BLEU, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo entrenado: cualquier defecto de traducción proviene de los modelos OPUS-MT originales.
- Sesgos conocidos: no documentados en la información disponible; los modelos OPUS-MT pueden reflejar sesgos presentes en el corpus OPUS.
- Riesgo de alucinación: inherente a los sistemas de traducción neuronal; puede producir traducciones fluidas pero incorrectas en frases ambiguas o dominios especializados.
- Limitaciones de contexto e idioma: solo cubre sv↔en; no se especifica la longitud máxima de contexto, por lo que se recomienda validar con frases y párrafos de distinta longitud antes de usarlo en producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda conservar el aviso de atribución a los autores originales de OPUS-MT y citar el paper de Tiedemann y Thottingal (2020).
- Caveat de producción: el autor advierte que cualquier error en la conversión es responsabilidad suya, no de los creadores originales; conviene verificar los SHA-256 publicados y validar la calidad de traducción en el dominio concreto antes de desplegarlo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skaldrim/opus-mt-sv-en-ct2-int8
- Modelo base sv→en: https://huggingface.co/Helsinki-NLP/opus-mt-sv-en
- Modelo base en→sv: https://huggingface.co/Helsinki-NLP/opus-mt-en-sv
- Guía de OPUS-MT en CTranslate2: https://opennmt.net/CTranslate2/guides/opus_mt.html
- Repositorio CTranslate2: https://github.com/OpenNMT/CTranslate2
- Conversión comunitaria alternativa: https://free2aitools.com/model/gaudi/opus-mt-sv-en-ctranslate2
- Paper de referencia: Jörg Tiedemann and Santhosh Thottingal. 2020. OPUS-MT — Building open translation services for the World. Proceedings of the 22nd Annual Conference of the European Association for Machine Translation (EAMT).
