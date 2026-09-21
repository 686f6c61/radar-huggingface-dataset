# itsskofficial/livewhisper-gu-medium

## Resumen

livewhisper-gu-medium es una conversión a CTranslate2 del modelo vasista22/whisper-gujarati-medium, un Whisper medium ajustado para reconocimiento automático del habla en guyaratí por el SPRING Lab del IIT de Madrás. El repositorio lo publica el autor de LiveWhisper, una aplicación de dictado por voz para Windows, con el objetivo de que el modelo pueda cargarse directamente con faster-whisper sin necesidad de convertir pesos. No se trata, por tanto, de un modelo nuevo: los pesos son los del modelo original y lo único que cambia es el formato (float16 en CTranslate2, más los ficheros `tokenizer.json` y `preprocessor_config.json` que exige faster-whisper).

La relevancia del modelo está en su nicho: el guyaratí es un idioma con relativamente pocos recursos de ASR de calidad, y este ajuste fino sobre Whisper medium reduce el error de palabras hasta situarse claramente por debajo de whisper-large-v3 en este idioma. Según las métricas medidas por el autor dentro de LiveWhisper, el error de palabras en FLEURS es del 49,8 % frente al 67,7 % de large-v3, y del 48,5 % frente al 63,3 % en texto guyaratí transcrito con alfabeto latino (gujlish). Aun así, el propio autor advierte de que el modelo sigue fallando aproximadamente la mitad de las palabras.

El repositorio ocupa 1,5 GB, declara licencia Apache 2.0 (la del modelo original) y, en el momento de redactar esta ficha, no registra descargas ni valoraciones en HuggingFace, por lo que no existe validación independiente de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) convertido a CTranslate2 |
| Parametros totales | Aproximadamente 769 M, segun la arquitectura Whisper medium; no confirmado en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s por segmento y 448 posiciones maximas en el decodificador, segun la arquitectura Whisper; no detallado en la model card |
| Tipos de cuantizacion | float16 en los pesos distribuidos; int8 e int8_float16 al cargar con CTranslate2/faster-whisper |
| Idiomas soportados | Guyaratí (codigo gu); el autor menciona tambien salida en guyaratí romanizado (gujlish) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin` en float16) mas `tokenizer.json` y `preprocessor_config.json`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium: un transformer encoder-decoder con atención completa, diseñado para tomar espectrogramas de audio de 30 segundos y generar tokens de texto, con marcas de tiempo y tokens especiales de tarea e idioma. El repositorio no entrena ni modifica la arquitectura; únicamente convierte los pesos del ajuste fino de SPRING Lab (IIT Madrás) al formato binario de CTranslate2 en precisión float16 y añade los ficheros auxiliares que faster-whisper necesita para tokenizar y preprocesar el audio.

La model card no detalla el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales: no hay decodificación especulativa, atención lineal ni variantes híbridas. La única particularidad reseñable es el proceso de conversión, que habilita inferencia eficiente en CPU y GPU mediante CTranslate2, incluyendo cuantización en tiempo de carga a int8 o int8_float16.

## Capacidades

- Reconocimiento automático del habla en guyaratí, tanto en ficheros de audio completos como en flujo continuo por segmentos.
- Integración nativa con faster-whisper mediante `WhisperModel`, con selección de dispositivo (`cuda`, `cpu`) y tipo de cómputo (`int8_float16`, entre otros).
- Generación de marcas de tiempo a nivel de segmento; las marcas a nivel de palabra requerirían herramientas externas como WhisperX, no documentadas en el repositorio.
- Transcripción de guyaratí hablado con salida en escritura guyaratí y, según la métrica "delivered Gujlish" de la model card, también en guyaratí romanizado.
- Uso como motor de dictado por voz en Windows a través de la aplicación LiveWhisper.
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso: es un modelo puramente de transcripción.
- No tiene capacidades de visión, audio comprensivo más allá del ASR, ni generación de texto libre.
- No se declara soporte multilingüe: el único idioma listado en la model card es el guyaratí.

## Casos de uso

- Dictado por voz en Windows: es el caso de uso original, ya que el modelo se distribuye específicamente para LiveWhisper y permite escribir en guyaratí hablando, con conversión en float16 o int8 según la GPU disponible.
- Subtitulado de vídeo en guyaratí: transcripción de audio de YouTube o de producción propia para generar ficheros de subtítulos, aprovechando la salida con marcas de tiempo de faster-whisper; conviene revisar manualmente por el WER cercano al 50 %.
- Transcripción de reuniones y actas: procesado por lotes de grabaciones corporativas en guyaratí para obtener borradores de acta que después se corrigen a mano.
- Analítica de centros de contacto: transcripción de llamadas de atención al cliente en guyaratí para alimentar sistemas de búsqueda, clasificación de motivos o control de calidad, ejecutable en GPU de gama media.
- Archivado y búsqueda de fondos sonoros: digitalización de archivos de radio o entrevistas en guyaratí para hacerlos indexables y consultables por texto.
- Accesibilidad: generación de subtítulos automáticos para personas con discapacidad auditiva en contenido hablado en guyaratí, con revisión posterior dado el nivel de error.
- Investigación lingüística de bajo recurso: obtención de transcripciones preliminares de corpus orales en guyaratí para estudios fonéticos o léxicos, usando el modelo como anotador de primera pasada.
- Despliegue en CPU o en equipos sin GPU dedicada: gracias a la conversión a CTranslate2 y a la cuantización int8, el modelo puede ejecutarse en portátiles convencionales para dictado o transcripción puntual.

## Benchmarks y rendimiento

Los únicos datos disponibles son los medidos por el autor dentro de la aplicación LiveWhisper. No se especifica el conjunto de evaluación exacto ni la metodología, más allá de la referencia a FLEURS para el error de palabras.

| Benchmark | Metrica | gu-medium (CTranslate2) | whisper-large-v3 |
|---|---|---|---|
| FLEURS | Error de palabras | 49,8 % | 67,7 % |
| Gujlish entregado (LiveWhisper) | Error de palabras | 48,5 % | 63,3 % |

En ambas métricas un valor menor es mejor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de texto, ya que el modelo no es generativo en ese sentido. Tampoco hay cifras de latencia, RTF (factor de tiempo real) o throughput.

## Requisitos de hardware

- VRAM estimada en float16: en torno a 1,6 GB solo para los pesos, más el overhead del runtime; unos 2 GB en total.
- VRAM estimada en int8_float16 o int8: aproximadamente 0,8-1,2 GB, lo que permite ejecución en GPU integradas y en CPU.
- Cabe en cualquier GPU de consumo con 4 GB o más de memoria: GTX 1650, RTX 3050, RTX 3060, RTX 4060, entre otras. También en GPUs de gama alta como RTX 4090, A100 o H100, donde el límite práctico será el número de flujos concurrentes, no la memoria.
- Ejecución en CPU viable con cuantización int8, aunque sin datos de latencia publicados.
- Opciones de despliegue: faster-whisper sobre CTranslate2, y la aplicación LiveWhisper para Windows. No hay pesos en GGUF, por lo que llama.cpp y Ollama no son aplicables directamente; vLLM y TGI tampoco soportan el formato CTranslate2 de este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Error de palabras en FLEURS (gu) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| itsskofficial/livewhisper-gu-medium | Aproximadamente 769 M | CTranslate2 (float16) | 49,8 % | Apache 2.0 | HuggingFace, 0 descargas |
| vasista22/whisper-gujarati-medium | Aproximadamente 769 M | PyTorch/safetensors | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |
| openai/whisper-medium | 769 M | PyTorch/safetensors | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |
| openai/whisper-large-v3 | Aproximadamente 1.550 M | PyTorch/safetensors | 67,7 % (segun la medicion del autor) | Apache 2.0 | HuggingFace |

La comparación relevante es doble: frente a whisper-large-v3, este modelo obtiene un error de palabras sustancialmente menor en guyaratí con la mitad de parámetros; frente a su modelo base vasista22/whisper-gujarati-medium, comparte exactamente los pesos y solo se diferencia en el formato y en el pequeño overhead de los ficheros auxiliares. No se dispone de datos de otros ajustes fino para guyaratí (por ejemplo, alternativas de AI4Bharat) en la información proporcionada.

## Limitaciones y advertencias

- Calidad insuficiente para transcripción literal en producción: el propio autor indica que el modelo sigue fallando aproximadamente la mitad de las palabras (49,8 % de WER en FLEURS), por lo que requiere revisión humana.
- Riesgo de alucinación: como el resto de la familia Whisper, puede generar texto plausible en tramos de silencio, ruido o audio ininteligible.
- Idiomas: solo guyaratí. No debe esperarse un rendimiento aceptable en otros idiomas del bloque multilingüe de Whisper.
- Sin datos sobre sesgos: la model card no incluye análisis de sesgo demográfico, dialectal ni de género, algo relevante en un idioma con variación dialectal amplia.
- Robustez no documentada: no hay información sobre comportamiento con acentos regionales, habla espontánea, solapamiento de voces, ruido de fondo o code-switching guyaratí-inglés.
- Licencia Apache 2.0, que permite uso comercial, pero el autor subraya que todo el mérito corresponde a los autores originales (SPRING Lab, IIT Madrás) y, por herencia, a OpenAI por la arquitectura Whisper; conviene mantener la atribución correspondiente.
- Validación comunitaria nula: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin evaluaciones independientes que confirmen las métricas del autor.
- Limitaciones de formato: no hay safetensors ni GGUF, lo que restringe las herramientas de despliegue a aquellas compatibles con CTranslate2.
- Metadatos poco convencionales: la fecha de creacion registrada es 2026-09-21, posterior a la de esta ficha; conviene verificar la vigencia del repositorio antes de integrarlo.
- Métrica "delivered Gujlish" definida de forma poco precisa en la model card: no se detalla el corpus ni el criterio de normalización, por lo que no es directamente comparable con métricas publicadas de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsskofficial/livewhisper-gu-medium
- Modelo base: https://huggingface.co/vasista22/whisper-gujarati-medium
- faster-whisper (Systran): https://github.com/SYSTRAN/faster-whisper
- LiveWhisper: https://github.com/itsskofficial/LiveWhisper
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las URLs devueltas corresponden a tramites fiscales franceses y no guardan relacion con el modelo.
