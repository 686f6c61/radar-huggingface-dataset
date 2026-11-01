# levirve/Breeze-ASR-26-gguf

## Resumen

Breeze-ASR-26 GGUF es una conversión no oficial al formato GGUF del modelo MediaTek-Research/Breeze-ASR-26, un fine-tune de `openai/whisper-large-v2` especializado en reconocimiento automático de habla en taiwanés hokkien (taigi, 台語). La conversión la publica el usuario levirve y está pensada para su uso con transcribe.cpp, una implementación en C++ del pipeline de Whisper. No existe afiliación ni respaldo por parte de MediaTek Research.

El modelo conserva la arquitectura original de Whisper large-v2, un transformer encoder-decoder de tipo seq2seq con 1.543.321.440 parámetros (aproximadamente 1,54 mil millones), por lo que los ficheros se cargan como GGUFs ordinarios de Whisper large-v2. La particularidad del modelo base es que transcribe audio en taiwanés hokkien pero emite la salida en caracteres mandarín, no en la ortografía propia del taigi.

Su relevancia práctica es doble: por un lado, cubre un idioma con muy pocos recursos ASR (el hokkien taiwanés), y por otro, la conversión a GGUF con cinco niveles de cuantización (desde F16 hasta Q4_K_M) permite ejecutar el modelo en hardware modesto, incluso en CPU, sin depender de un stack de Python. El repositorio ocupa 8,2 GB e incluye todas las variantes cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2), seq2seq |
| Parametros totales | 1.543.321.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | taiwanés hokkien (taigi) como entrada; salida en caracteres mandarín |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v2 sin modificaciones: un encoder y un decoder transformer con atención multi-cabeza, entrenado originalmente por OpenAI para transcripción y traducción de voz. Breeze-ASR-26 es un fine-tune de MediaTek Research sobre ese checkpoint para taiwanés hokkien, manteniendo intacta la topología, lo que explica que los GGUFs generados carguen como Whisper large-v2 estándar.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO (Whisper no emplea RLHF en su entrenamiento original, pero no hay confirmación para este fine-tune). La conversión a GGUF se realizó con transcribe.cpp en el commit `5700f127`, aplicando un parche local a `scripts/convert-whisper.py` que lee safetensors fragmentados y construye el tokenizer a partir de `vocab.json` y `merges.txt` cuando falta `tokenizer.json`. El modelo base se fijó en la revisión `7b992682e7f5ceedd0a41ebec240f01ba469d19e`.

## Capacidades

- Reconocimiento automático de habla (ASR) en taiwanés hokkien (taigi).
- Salida en caracteres mandarín, no en ortografía taigi; no es un sistema de escritura normalizado para hokkien.
- Transcripción de audio con la ventana y el pipeline estándar de Whisper large-v2.
- Ejecución mediante transcribe.cpp en formato GGUF, con soporte de cuantización para reducir memoria.
- Compatibilidad de carga con GGUFs de Whisper large-v2 convencionales.
- No se documentan capacidades de traducción, diarización, tool calling, agentes ni multimodalidad adicional en la información disponible.

## Casos de uso

- Transcripción de archivos de audio en taiwanés hokkien para archivo y documentación: el modelo convierte grabaciones en texto mandarín, útil para digitalizar entrevistas o material audiovisual en taigi.
- Subtitulado de contenido en hokkien para plataformas que trabajan con caracteres mandarín: adecuado porque la salida ya está en ese sistema de escritura, sin postproceso de transliteración.
- Investigación lingüística sobre hokkien taiwanés: permite obtener transcripciones masivas para análisis de corpus, aunque con la advertencia de que la salida no refleja la ortografía taigi.
- Despliegue en entornos sin GPU mediante transcribe.cpp y cuantizaciones Q4_K_M o Q5_K_M (1,00 GB y 1,16 GB respectivamente), útil para servidores modestos o dispositivos de borde.
- Integración en pipelines de C++ o sistemas embebidos: al ser GGUF y funcionar con transcribe.cpp, se evita la dependencia de PyTorch y de un stack Python completo.
- Prototipado rápido de aplicaciones de voz en taigi: los ficheros Q8_0 (1,67 GB) o F16 (3,11 GB) permiten validar calidad antes de decidir el nivel de cuantización definitivo.
- Archivado de bajo coste: la variante Q4_K_M de 1,00 GB permite almacenar y ejecutar el modelo en recursos limitados para transcripciones puntuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB (Q4_K_M), 1,16 GB (Q5_K_M), 1,30 GB (Q6_K), 1,67 GB (Q8_0) y 3,11 GB (F16) solo para los pesos; hay que sumar el overhead del runtime y del audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para F16; las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de gama de entrada con 2-4 GB.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores; las variantes cuantizadas también son viables en iGPU con memoria compartida.
- Despliegue: transcribe.cpp (formato nativo); al ser GGUFs de Whisper large-v2, también podría cargarse con otras implementaciones compatibles con Whisper GGUF, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Breeze-ASR-26 GGUF (este) | 1,54 B | no disponible | taiwanés hokkien (salida en mandarín) | Apache-2.0 | GGUF |
| openai/whisper-large-v2 | 1,55 B | ventana de audio de 30 s | multilingüe (99 idiomas) | Apache-2.0 | safetensors, GGUF (comunitario) |
| MediaTek-Research/Breeze-ASR-26 | 1,54 B | no disponible | taiwanés hokkien (salida en mandarín) | Apache-2.0 | safetensors |

La comparativa se limita al modelo base y al Whisper original porque no se dispone de datos de benchmarks ni de otros modelos ASR específicos de taigi en la información proporcionada. Frente a whisper-large-v2, este modelo sacrifica cobertura multilingüe a cambio de especialización en hokkien taiwanés; frente al modelo base de MediaTek, la diferencia es el formato GGUF y las cuantizaciones, que facilitan el despliegue.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por MediaTek Research; la calidad de la conversión y de las cuantizaciones no ha sido validada por el autor original.
- Salida en caracteres mandarín, no en ortografía taigi: no sirve para producir texto normalizado en hokkien taiwanés.
- Cobertura de idiomas limitada al taiwanés hokkien; no es un modelo multilingüe pese a derivar de Whisper large-v2.
- Riesgo de alucinación y de errores de transcripción inherente a los modelos ASR, especialmente en audio con ruido, acentos o vocabulario especializado.
- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de Whisper, puede heredar los sesgos del corpus original de OpenAI.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir correctamente; conviene revisar los términos del modelo base y de Whisper.
- No se han publicado benchmarks ni métricas de WER para esta conversión; la calidad real de las cuantizaciones Q4_K_M y Q5_K_M frente a F16 no está cuantificada.
- La longitud de contexto y la ventana de audio no se confirman en la información proporcionada; se asume el comportamiento estándar de Whisper large-v2, pero no está verificado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/levirve/Breeze-ASR-26-gguf
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-26
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Whisper large-v2 (origen de la arquitectura): https://huggingface.co/openai/whisper-large-v2
