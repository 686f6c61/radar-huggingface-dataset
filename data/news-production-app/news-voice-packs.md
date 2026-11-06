# news-production-app/news-voice-packs

## Resumen

`news-production-app/news-voice-packs` es un repositorio de paquetes de voces neuronales para síntesis de voz (TTS) en ucraniano y ruso, pensado para la lectura en voz alta de artículos periodísticos dentro de las aplicaciones de noticias Chronicler. No es un modelo entrenado por el autor: el repositorio agrega y empaqueta pesos ya existentes, exportados a ONNX, junto con los diccionarios de pronunciación y acentuación que necesitan los front-ends de texto de dichas aplicaciones. Cada carpeta del repositorio constituye un "pack" independiente, descrito por un `manifest.json` que enumera cada fichero con su tamaño y su hash sha256, de modo que la app descarga, verifica e instala el paquete solo si todos los ficheros coinciden.

El pack ucraniano (`uk`) contiene un export ONNX de StyleTTS2 multihablante con la voz «Денис», mientras que el pack ruso (`ru`) contiene un ajuste fino de Kokoro (basado en StyleTTS2) con la voz «Дима», también en ONNX. Ambos packs incluyen diccionarios de estrés silábico compilados a partir de fuentes de terceros (lang-uk y ruaccent respectivamente) y, en el caso ruso, un modelo neuronal auxiliar para adivinar la acentuación de palabras ausentes del diccionario.

La relevancia de este repositorio es operativa más que investigadora: ofrece un mecanismo reproducible de distribución de voces TTS en dispositivo (on-device) con verificación de integridad, licencias agregadas por componente y soporte específico para dos idiomas eslavos orientales con morfología de acentuación compleja. El tamaño total del repositorio es de 1,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (pack `uk`) y Kokoro basado en StyleTTS2 (pack `ru`); exportación a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ucraniano (`uk`), ruso (`ru`) |
| Licencia | mixta (`other` / `mixed`): MIT para el pack ucraniano y componentes de acentuación; OpenRAIL para el modelo ruso kokoro-ru; Apache-2.0 para Kokoro-82M |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data` externo), vectores de estilo/voz en binario float32 (`style.bin`, `voice.bin`), vocabularios en texto/JSON, diccionarios SQLite comprimidos (`.sqlite.gz`) |

## Arquitectura y entrenamiento

El repositorio no incluye entrenamiento propio; agrega artefactos de terceros. El pack ucraniano parte de `patriotyk/styletts2_ukrainian_multispeaker`, un modelo StyleTTS2 multihablante exportado a ONNX con los pesos en un fichero externo (`model.onnx.data`). Se acompaña de un vector de estilo de 256 valores float32 correspondiente al hablante «Денис Денисенко», del vocabulario de símbolos del modelo y de un diccionario de estrés silábico de 2,9 millones de formas léxicas compilado a partir de `lang-uk/ukrainian-word-stress` 2.1.0 (`stress.trie`), cuyos datos derivan de «Словники України» (УМІФ НАН України); el diccionario incluye preferencias de heterónimos contadas sobre texto periodístico.

El pack ruso parte de `zaakirio/kokoro-ru`, un ajuste fino en ruso de Kokoro-82M (arquitectura basada en StyleTTS2), exportado a ONNX. Incluye una tabla de voces «dima» de 510 × 256 valores float32, el mapa de símbolos del modelo, un diccionario de estrés y de la letra ё de 3,2 millones de formas léxicas compilado a partir de los diccionarios de `ruaccent/accentuator`, y un modelo neuronal de caracteres (`nn_accent.onnx` con su vocabulario) que estima la acentuación de palabras no presentes en el diccionario. El autor declara explícitamente que ningún pack incluye código ni datos de eSpeak.

## Capacidades

- Síntesis de voz neuronal (TTS) en ucraniano con la voz «Денис» mediante StyleTTS2 multihablante.
- Síntesis de voz neuronal en ruso con la voz «Дима» mediante Kokoro ajustado.
- Ejecución en dispositivo (on-device) mediante runtime ONNX, sin dependencia de servicios remotos.
- Resolución de acentuación léxica mediante diccionarios de estrés silábico con preferencias de heterónimos adaptadas a texto periodístico.
- Predicción neuronal de acentuación para palabras fuera de diccionario (solo pack ruso, `nn_accent.onnx`).
- Verificación de integridad de los paquetes mediante `manifest.json` con tamaños y hashes sha256 por fichero.
- No se documentan capacidades de clonación de voz, control de emoción, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Lectura en voz alta de artículos periodísticos en aplicaciones móviles: el pack se instala localmente y el motor TTS sintetiza el texto del artículo sin conexión, lo que reduce coste de servidor y latencia percibida en la reproducción.
- Distribución verificable de voces en producción: el `manifest.json` con sha256 por fichero permite que la app descargue, valide e instale packs de forma atómica, evitando pesos corruptos o parcialmente descargados.
- Soporte bilingüe ucraniano-ruso en una misma aplicación: dos packs independientes con voces distintas permiten conmutar idioma según el contenido del artículo o la preferencia del usuario.
- Pronunciación correcta de topónimos y nombres propios en noticias: los diccionarios de estrés de 2,9 y 3,2 millones de formas léxicas, con preferencias de heterónimos contadas sobre texto periodístico, reducen errores de acentuación típicos en lectura automática.
- Manejo de palabras fuera de vocabulario en ruso: el modelo `nn_accent.onnx` estima la acentuación de neologismos, nombres extranjeros y formas poco frecuentes que no aparecen en el diccionario.
- Integración en pipelines de accesibilidad: generación de audio para lectores de pantalla o versiones podcast de boletines informativos, ejecutándose en el propio dispositivo del usuario.
- Empaquetado de referencia para otros equipos: el patrón de manifest con hashes y licencias por componente sirve como plantilla para distribuir modelos ONNX de terceros con trazabilidad legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no documenta el tamaño de los pesos por pack; el total del repositorio es de 1,0 GB, pero incluye diccionarios comprimidos y artefactos auxiliares además de los modelos.
- GPU recomendadas: no disponible. Al ser modelos ONNX orientados a ejecución en dispositivo, el autor no especifica hardware de referencia.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni descarta el funcionamiento en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) en la aplicación cliente; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `news-production-app/news-voice-packs` | no disponible | uk, ru | ONNX | mixta (MIT / OpenRAIL / Apache-2.0) | Hugging Face, 0 descargas |
| `patriotyk/styletts2_ukrainian_multispeaker` | no disponible | uk | no disponible en la informacion | MIT | Hugging Face (fuente del pack uk) |
| `zaakirio/kokoro-ru` | no disponible | ru | no disponible en la informacion | OpenRAIL | Hugging Face (fuente del pack ru) |
| `hexgrad/Kokoro-82M` | 82M | en (principal) | no disponible en la informacion | Apache-2.0 | Hugging Face (base de kokoro-ru) |

## Limitaciones y advertencias

- El repositorio no aporta entrenamiento ni evaluación propios; la calidad de síntesis depende íntegramente de los modelos de origen y no se publican métricas (MOS, WER, latencia).
- Licencia mixta con obligaciones distintas por componente: el pack ruso está sujeto a OpenRAIL y a sus restricciones de uso, que deben revisarse en la model card original antes de un despliegue comercial.
- El diccionario ucraniano deriva de «Словники України» (УМІФ НАН України) a través de `lang-uk/ukrainian-word-stress`; conviene verificar las condiciones de la fuente original más allá de la licencia MIT del repositorio intermedio.
- Solo cubre ucraniano y ruso; no hay soporte para otros idiomas ni para mezcla de idiomas dentro de una misma frase.
- Riesgo de acentuación incorrecta en palabras fuera de diccionario, especialmente en el pack ucraniano, que no incluye modelo neuronal de respaldo como el ruso.
- No se documentan sesgos de hablante, prosodia ni comportamiento ante texto con abreviaturas, cifras o símbolos propios de titulares periodísticos.
- Ausencia de descargas y de validación comunitaria en el momento de la consulta: no hay evidencia externa de funcionamiento en producción.
- El tamaño del repositorio (1,0 GB) puede ser elevado para instalación en dispositivos con almacenamiento limitado; no se documenta compresión adicional de los pesos ONNX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/news-production-app/news-voice-packs
- Modelo fuente ucraniano: https://huggingface.co/patriotyk/styletts2_ukrainian_multispeaker
- Diccionario de estrés ucraniano: https://github.com/lang-uk/ukrainian-word-stress
- Modelo fuente ruso: https://huggingface.co/zaakirio/kokoro-ru
- Modelo base Kokoro: https://huggingface.co/hexgrad/Kokoro-82M
- Diccionarios y modelo de acentuación ruso: https://huggingface.co/ruaccent/accentuator
