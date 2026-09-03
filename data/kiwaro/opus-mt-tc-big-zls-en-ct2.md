# KIWARO/opus-mt-tc-big-zls-en-ct2

## Resumen

El modelo `KIWARO/opus-mt-tc-big-zls-en-ct2` es una conversión a CTranslate2 del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-tc-big-zls-en`, desarrollado originalmente por el grupo Helsinki-NLP de la Universidad de Helsinki. El autor, KIWARO, lo ha cuantizado a int8 y convertido al formato CTranslate2 para permitir su ejecución en dispositivos móviles, como el iPhone, sin necesidad de conexión a internet. El modelo traduce lenguas eslavas del sur (macedonio, búlgaro, bosnio, croata, esloveno y serbio) al inglés.

La relevancia de este modelo radica en que ofrece una alternativa ligera y eficiente para traducción en el dispositivo, preservando la privacidad de los datos al no enviar texto a servidores externos. Es una conversión directa sin reentrenamiento ni ajuste fino, por lo que conserva las capacidades del modelo original, pero con un tamaño reducido (230 MB) que cabe en la memoria de un teléfono. La licencia CC BY 4.0 permite su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Opus-MT, no confirmado explícitamente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (CTranslate2) |
| Idiomas soportados | mk, bg, bs, hr, sl, sr, en (traducción de eslavo del sur a inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (binarios cuantizados) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-tc-big-zls-en` pertenece a la familia Opus-MT, que utiliza arquitecturas transformer encoder-decoder entrenadas con datos paralelos del corpus OPUS, incluyendo el Tatoeba Challenge. No se dispone de detalles específicos sobre el número de parámetros, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La conversión a CTranslate2 realizada por KIWARO no modifica los pesos del modelo; únicamente aplica cuantización int8 y adapta el formato para su ejecución eficiente en CPU y dispositivos móviles. El proceso se realizó con `ctranslate2.converters.transformers --quantization int8`, sin reentrenamiento ni ajuste fino.

## Capacidades

- Traducción automática de seis lenguas eslavas del sur (macedonio, búlgaro, bosnio, croata, esloveno y serbio) al inglés.
- Ejecución completamente offline en dispositivos móviles, sin necesidad de conexión a internet.
- Bajo consumo de memoria y recursos, adecuado para hardware limitado.
- Soporte para decodificación con beam search (beam_size=4) y control de repetición mediante `no_repeat_ngram_size=3`.
- Integración sencilla con la API de CTranslate2 y SentencePiece para preprocesamiento.
- No incluye capacidades de tool calling, agentes, visión ni audio; es exclusivamente un modelo de traducción.

## Casos de uso

- Traducción en tiempo real en aplicaciones de mensajería: el modelo puede traducir mensajes entrantes en macedonio, búlgaro, etc., al inglés directamente en el dispositivo, garantizando privacidad y baja latencia.
- Asistente de viajes offline: un turista en los Balcanes puede traducir frases o cartas de restaurantes sin conexión, gracias a su tamaño compacto y ejecución local.
- Lectura de documentos técnicos o noticias en lenguas eslavas del sur: el modelo permite convertir artículos o informes al inglés para su análisis posterior, sin depender de servicios en la nube.
- Aplicaciones de accesibilidad para hablantes de inglés que necesitan comprender contenido en eslavo del sur, como subtítulos o transcripciones.
- Integración en asistentes de voz embebidos: al ser ligero, puede ejecutarse en dispositivos IoT o wearables para traducción de comandos de voz.
- Herramientas de traducción para ONGs o proyectos humanitarios que operan en zonas sin conectividad, permitiendo comunicación básica entre hablantes de inglés y lenguas eslavas del sur.

## Benchmarks y rendimiento

El autor proporciona una medición de calidad en el conjunto FLEURS (12 frases emparejadas por id) para la dirección macedonio → inglés, comparando este modelo con el modelo dedicado más pequeño `opus-mt-mk-en`:

| Modelo | chrF (macedonio → inglés) |
|---|---|
| `opus-mt-mk-en` (145 MB) | 65.7 |
| **Este modelo** (230 MB, int8) | **69.9** |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El modelo ocupa aproximadamente 230 MB en disco (0.2 GB), por lo que cabe en la memoria de cualquier smartphone moderno.
- Se ha probado su ejecución en un iPhone 17e, lo que indica que puede correr en CPUs ARM sin necesidad de GPU dedicada.
- Para uso en servidores, puede ejecutarse en CPUs x86 con CTranslate2, sin requerir VRAM de GPU.
- Opciones de despliegue: CTranslate2 (API Python), integración con aplicaciones móviles mediante bindings nativos, o uso en entornos de servidor con `ctranslate2.Translator`.
- La latencia estimada no está disponible, pero al ser un modelo de tamaño medio cuantizado, se espera una decodificación rápida en hardware moderno.

## Comparativa con modelos similares

| Modelo | Tamaño | Idiomas | Formato | Licencia | chrF (mk→en) |
|---|---|---|---|---|---|
| `Helsinki-NLP/opus-mt-tc-big-zls-en` (original) | no disponible (mayor que 230 MB) | mk, bg, bs, hr, sl, sr → en | Transformers (PyTorch) | CC BY 4.0 | no disponible |
| `Helsinki-NLP/opus-mt-mk-en` | 145 MB | mk → en | Transformers | CC BY 4.0 | 65.7 |
| **Este modelo** | 230 MB | mk, bg, bs, hr, sl, sr → en | CTranslate2 int8 | CC BY 4.0 | 69.9 |

La comparativa muestra que este modelo ofrece mejor calidad que el modelo dedicado más pequeño para macedonio, a costa de un mayor tamaño, pero sigue siendo ligero para uso móvil. El modelo original sin cuantizar probablemente tenga una calidad similar o ligeramente superior, pero no es adecuado para dispositivos con recursos limitados.

## Limitaciones y advertencias

- El modelo es exclusivamente de traducción; no genera texto libre ni realiza otras tareas.
- Puede presentar sesgos presentes en los datos de entrenamiento de OPUS, como desequilibrios en dominios o registros.
- Riesgo de alucinación en traducciones de frases ambiguas o fuera del dominio de entrenamiento.
- La longitud de contexto no está especificada; se recomienda mantener frases cortas o segmentos manejables para evitar degradación.
- La licencia CC BY 4.0 exige atribución al autor original (Helsinki-NLP) y a los cambios realizados por KIWARO.
- No se garantiza soporte para todos los dialectos o variantes regionales de las lenguas eslavas del sur.
- El uso de `no_repeat_ngram_size=3` es necesario para evitar bucles de repetición en habla espontánea, como se documenta en la model card.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/KIWARO/opus-mt-tc-big-zls-en-ct2)
- [Modelo original de Helsinki-NLP](https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-zls-en)
- [Repositorio de Kiwaro en GitHub](https://github.com/Goransut/KIWARO)
- [Repositorio Opus-MT de Helsinki-NLP](https://github.com/Helsinki-NLP/Opus-MT)
