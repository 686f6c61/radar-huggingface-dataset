# N4DerAX20/persian-sub-english-model

## Resumen

Este repositorio, publicado por el usuario N4DerAX20 con el identificador `N4DerAX20/persian-sub-english-model`, contiene una conversión al formato CTranslate2 del modelo `deepdml/whisper-large-v3-turbo`, que a su vez deriva de `openai/whisper-large-v3-turbo`. Se trata, por tanto, de un modelo de reconocimiento automático del habla (ASR) de tipo encoder-decoder basado en la familia Whisper, no de un modelo de lenguaje generativo. El pipeline declarado en HuggingFace es `automatic-speech-recognition` y la librería indicada es `ctranslate2`.

El problema que resuelve es la transcripción de audio a texto multilingüe con un coste computacional reducido: al estar convertido a CTranslate2 y guardado en FP16, puede ejecutarse con `faster-whisper` o cualquier proyecto basado en CTranslate2, lo que permite inferencia en CPU y en GPU de gama media con requisitos de memoria notablemente inferiores a los de un transformer en PyTorch. El tamaño del repositorio es de 1,6 GB, coherente con los aproximadamente 809 millones de parámetros de Whisper large-v3-turbo en precisión FP16.

Es relevante ahora porque la variante turbo de Whisper reduce el número de capas del decodificador manteniendo el encoder de large-v3, lo que abarata la decodificación y facilita el despliegue en producción de pipelines de subtitulado y transcripción. Conviene señalar que el repositorio tiene 0 descargas y 0 likes, que el autor no está verificado y que el nombre del repositorio (`persian-sub-english-model`) no se corresponde con el contenido real de la model card, que describe un modelo Whisper genérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) con atención completa, en formato CTranslate2 |
| Parametros totales | Aproximadamente 809 millones (Whisper large-v3-turbo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos (1500 fotogramas mel); longitud máxima de decodificación de 448 tokens |
| Tipos de cuantizacion | FP16 en el repositorio; convertible a int8, int8_float16, int8_float32 y float32 mediante la opción `compute_type` de CTranslate2 |
| Idiomas soportados | 100 códigos de idioma listados en la model card (en, zh, de, es, ru, fr, ja, pt, ar, fa, hi, yue, entre otros) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`) junto con `tokenizer.json` y `preprocessor_config.json` |
| Tamano del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer encoder-decoder entrenado para predicción de tokens a partir de espectrogramas mel logarítmicos de 30 segundos. El encoder procesa la ventana de audio completa y el decodificador genera texto de forma autorregresiva con tokens especiales de control de idioma, tarea y marcas de tiempo. La variante large-v3-turbo conserva el encoder de large-v3 y reduce drásticamente el número de capas del decodificador, lo que rebaja el coste por token generado. El repositorio aquí descrito no introduce cambios de arquitectura: es una conversión de pesos con `ct2-transformers-converter` y cuantización `float16`, tal y como documenta el propio autor.

En cuanto a los datos de entrenamiento, la model card de este repositorio no aporta ninguna información: remite a la model card de `openai/whisper-large-v3-turbo` para los detalles del modelo original. No se especifican en la información proporcionada el número de horas de audio, la composición del dataset, ni si hubo etapas de ajuste con RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales propias de esta conversión más allá del cambio de formato y de la posibilidad de recuantizar en tiempo de carga.

## Capacidades

- Transcripción de audio a texto en 100 códigos de idioma declarados, con detección automática del idioma de entrada mediante tokens de control.
- Traducción de audio a inglés (tarea `translate` de Whisper), además de transcripción en el idioma original (tarea `transcribe`).
- Generación de marcas de tiempo (timestamps) a nivel de segmento y, con las herramientas adecuadas, a nivel de palabra.
- Procesamiento por lotes de audio mediante `faster-whisper` o CTranslate2, con soporte de VAD (detección de actividad de voz) para segmentar entradas largas.
- Ejecución en CPU y GPU gracias a la conversión a CTranslate2, con cuantización configurable en el momento de la carga.
- No soporta tool calling ni function calling: es un modelo de ASR, no un modelo de lenguaje instruido.
- No dispone de modo de razonamiento explícito (`thinking mode`), ni capacidades de visión, audio generativo o agentes multi-paso.

## Casos de uso

- Subtitulado automático de vídeo: el modelo transcribe audio en tramos de 30 segundos y emite segmentos con marcas de tiempo, lo que permite generar ficheros SRT o VTT sin intervención manual en pipelines de postproducción.
- Transcripción de reuniones y actas: con `faster-whisper` y VAD se puede procesar audio largo por trozos, obteniendo texto con timestamps útil para indexar y buscar dentro de la grabación.
- Indexación y búsqueda de archivos de audio: convertir podcasts o grabaciones de archivo a texto permite búsqueda semántica posterior sobre el contenido hablado.
- Atención al cliente y análisis de llamadas: transcripción de conversaciones telefónicas para clasificación posterior, control de calidad o extracción de motivos de contacto.
- Accesibilidad: generación de subtítulos en directo o en diferido para contenidos audiovisuales, con la ventaja de que el modelo cabe en hardware modesto.
- Procesamiento en el borde o en local: al ejecutarse en CPU con cuantización int8, es viable en equipos sin GPU dedicada y en entornos donde no se permite enviar audio a servicios en la nube por motivos de privacidad.
- Transcripción multilingüe de contenido educativo: el modelo puede transcribir clases o cursos en cualquiera de los idiomas soportados y traducirlos a inglés con la misma pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye métricas de WER, ni comparaciones con otros modelos, ni resultados sobre conjuntos como LibriSpeech, Common Voice o FLEURS.

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 1,6 GB solo para los pesos, más el espacio de activaciones y buffers de decodificación; en la práctica unos 2 GB de VRAM.
- VRAM estimada en int8: aproximadamente 0,8 a 1 GB, lo que reduce aún más el umbral de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como GTX 1650, RTX 3050 o superiores; en gamas altas, RTX 3060, RTX 4090, A100 o H100 no aportan ventajas de precisión, solo mayor throughput en lotes grandes.
- Cabe en GPU de consumo: sí, en modelos con 4 GB o más de VRAM, y también puede ejecutarse íntegramente en CPU con cuantización int8.
- Opciones de despliegue: `faster-whisper` (referencia principal), CTranslate2 directamente, WhisperX, `whisper-ctranslate2`, y servidores compatibles con el formato CT2, incluidos integraciones domésticas tipo Wyoming.
- Latencia y throughput: no se proporcionan mediciones en la información disponible. El autor del modelo original describe la variante turbo como más rápida que large-v3 al haber reducido las capas del decodificador, pero no se aporta ninguna cifra verificable en este repositorio.

## Comparativa con modelos similares

La comparativa siguiente se apoya en datos públicos de la familia Whisper y no en mediciones realizadas sobre este repositorio concreto; los valores de rendimiento no están disponibles.

| Modelo | Parametros | Ventana de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Whisper large-v3-turbo en CT2) | ~809 M | 30 s | CTranslate2 FP16 | MIT | HuggingFace, 0 descargas |
| openai/whisper-large-v3-turbo | ~809 M | 30 s | safetensors (PyTorch) | MIT | HuggingFace, ampliamente usado |
| openai/whisper-large-v3 | ~1550 M | 30 s | safetensors (PyTorch) | MIT | HuggingFace, ampliamente usado |
| openai/whisper-medium | ~769 M | 30 s | safetensors (PyTorch) | MIT | HuggingFace, ampliamente usado |
| distil-whisper/distil-large-v3 | ~756 M | 30 s | safetensors (PyTorch) | MIT | HuggingFace |

La diferencia principal de este repositorio frente a las alternativas es exclusivamente el formato: al estar en CTranslate2 permite inferencia más eficiente en CPU y una carga más sencilla en `faster-whisper`, a cambio de no ser directamente cargable con `transformers` sin reconversión previa. No hay datos de WER en la información proporcionada que permitan afirmar superioridad o inferioridad frente a large-v3 o distil-large-v3.

## Limitaciones y advertencias

- Riesgo de alucinación conocido en la familia Whisper: ante silencios, ruido de fondo o música, el modelo puede generar texto plausible pero inexistente. Es imprescindible usar VAD y filtrar segmentos de baja confianza en producción.
- Ventana fija de 30 segundos: los audios más largos deben trocearse; un troceado incorrecto puede cortar palabras y degradar la transcripción.
- Rendimiento desigual entre idiomas: aunque se declaran 100 códigos de idioma, la calidad varía mucho según los recursos disponibles para cada lengua. No hay métricas publicadas en este repositorio para ningún idioma concreto.
- El nombre del repositorio (`persian-sub-english-model`) no coincide con el contenido real de la model card, que describe un modelo Whisper genérico en inglés y multilingüe. Esta discrepancia sugiere que el nombre es engañoso o que el repositorio se ha reutilizado para otro fin.
- La model card parece copiada de `deepdml/faster-whisper-large-v3-turbo-ct2`: el ejemplo de código carga el identificador de ese otro repositorio, no el de este. No hay verificación de que los pesos aquí alojados sean idénticos a los del repositorio de referencia.
- Repositorio sin tracción ni validación comunitaria: 0 descargas y 0 likes, autor no verificado. No se recomienda su uso en producción sin comparar los pesos con el modelo original.
- Licencia MIT: permite uso comercial y modificación, pero se debe conservar el aviso de copyright correspondiente. No se imponen restricciones adicionales conocidas.
- No apto para tareas de generación de texto, razonamiento, código o agentes; es exclusivamente un modelo de reconocimiento de voz.
- El rendimiento en acentos marcados, audio telefónico de baja calidad o solapamiento de hablantes no está documentado y previsiblemente será inferior al de audio limpio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/N4DerAX20/persian-sub-english-model
- Modelo de origen de la conversion: https://huggingface.co/deepdml/whisper-large-v3-turbo
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio CTranslate2: https://github.com/OpenNMT/CTranslate2
- Documentacion de cuantizacion de CTranslate2: https://opennmt.net/CTranslate2/quantization.html
- faster-whisper: https://github.com/systran/faster-whisper
- Implementacion original de Whisper: https://github.com/openai/whisper
- Articulo de referencia de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Nota: los resultados de busqueda web proporcionados no contienen enlaces tecnicos relevantes sobre este modelo; el contenido recuperado no guarda relacion con el sistema descrito y se ha descartado.
