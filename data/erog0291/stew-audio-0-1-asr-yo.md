# Erog0291/stew-audio-0.1-asr-yo

## Resumen

Stew Audio 0.1 ASR YO (`Erog0291/stew-audio-0.1-asr-yo`) es un modelo de reconocimiento automático del habla (ASR) publicado por el desarrollador independiente Erog0291 en Hugging Face. Por las etiquetas del repositorio (`whisper`, `onnx`, `safetensors`) y por su recuento de parámetros (241.734.912, muy próximo a la escala de Whisper Small), se trata de un ajuste o derivado de la familia Whisper orientado a la transcripción de audio, con el sufijo `yo` del identificador apuntando al yoruba como lengua objetivo principal.

El modelo resuelve el problema clásico de conversión de audio a texto en una lengua de bajos recursos: el yoruba, hablado mayoritariamente en el suroeste de Nigeria y con presencia en Benín y la diáspora. Su interés práctico radica en dos factores: el tamaño contenido (unos 241 M de parámetros, apto para inferencia en CPU y en el navegador) y la doble distribución de pesos en safetensors y ONNX, lo que facilita despliegues fuera de Python, incluidos entornos web.

La ficha del repositorio no incluye model card, licencia, idiomas declarados ni resultados de evaluación, y el modelo acumula 40 descargas y ningún "like" en el momento de la consulta. Esto implica que cualquier adopción en producción debe ir precedida de una evaluación propia sobre datos del dominio, y que la ausencia de licencia explícita es un riesgo legal a resolver antes de un uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para audio a texto), segun la etiqueta `whisper` del repositorio |
| Parametros totales | 241.734.912 (dato real, safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha. La arquitectura Whisper procesa audio en ventanas de 30 segundos por convencion de la familia; el repositorio no documenta el preprocesado utilizado |
| Tipos de cuantizacion | No disponible. El repositorio incluye pesos ONNX y safetensors, pero no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible en la ficha. El Space del mismo autor declara igbo, yoruba, hausa, pidgin nigeriano e ingles; el sufijo `yo` del identificador apunta a yoruba |
| Licencia | No disponible |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La etiqueta `whisper` y el recuento de parámetros sitúan al modelo en la arquitectura seq2seq de Whisper: un encoder de audio que convierte el espectrograma Mel en representaciones latentes y un decoder autoregresivo que genera tokens de texto, con atención cruzada entre ambos. El tamaño declarado (241,7 M) es coherente con la variante Small de la familia, lo que sugiere una inicialización a partir de un checkpoint Whisper Small y un ajuste posterior, aunque el repositorio no confirma ni el punto de partida ni el procedimiento.

No hay información publicada sobre el corpus de entrenamiento: ni número de horas de audio, ni composición del dataset, ni si hubo aumentos de datos, especificación de decodificación o fases de ajuste fino con refuerzo (poco habituales en ASR supervisado). Tampoco se documentan innovaciones técnicas propias. Toda afirmación sobre el proceso de entrenamiento más allá de lo indicado sería especulativa.

## Capacidades

- Transcripción de voz a texto (ASR) sobre audio en yoruba, a partir del sufijo `yo` del identificador del modelo.
- Posible cobertura multilingüe (igbo, hausa, pidgin nigeriano, inglés) según la descripción del Space del mismo autor; no confirmada en la ficha del modelo.
- Inferencia local en navegador: la presencia de pesos ONNX encaja con la ejecución en el cliente descrita en el Space ("processed locally in your browser").
- Conversión de audio a texto para generación de subtítulos y actas, siempre que el audio se fragmente en segmentos compatibles con la ventana de la arquitectura.
- No hay evidencia de soporte de tool calling ni de function calling en la información disponible.
- No hay evidencia de modo "thinking", salida de marcas de tiempo explícitas, diarización de hablantes ni capacidades de visión o audio generativo.
- No se documenta ningún modo de instrucciones ni formateo de prompt especial.

## Casos de uso

- Transcripción de reuniones y entrevistas en yoruba: el modelo convierte grabaciones en texto plano apto para actas o búsqueda posterior; su tamaño de 241 M permite ejecutarlo en una máquina de desarrollo sin GPU dedicada.
- Subtitulado de vídeo para creadores nigerianos: fragmentando la pista de audio en ventanas de 30 segundos y aplicando el modelo sobre ONNX Runtime se obtienen transcripciones que pueden alinearse con la línea temporal del vídeo.
- Archivado y búsqueda de emisiones de radio en lenguas nigerianas: transcripción masiva por lotes en CPU, indexando el texto resultante para recuperación documental.
- Asistentes de voz que funcionan sin conexión: al distribuirse en ONNX, el modelo puede integrarse en una aplicación web o de escritorio que procese el audio en el propio dispositivo, evitando enviar grabaciones a un servidor.
- Atención al cliente en centros de llamadas de Nigeria occidental: transcripción de conversaciones para control de calidad y análisis de motivos de contacto, con revisión humana dado el riesgo de error del modelo.
- Investigación lingüística y creación de corpus: generación de transcripciones preliminares de grabaciones de campo en yoruba que después se corrigen manualmente, reduciendo el coste de anotación.
- Prototipado de pipelines ASR en entornos educativos: por su tamaño y su formato ONNX, sirve como banco de pruebas de bajo coste para comparar preprocesados y estrategias de decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,97 GB en FP32, 0,48 GB en FP16 y 0,24 GB en INT8 solo para los pesos; hay que añadir el búfer de activaciones y el espectrograma Mel, por lo que conviene reservar entre 1 y 2 GB en FP16.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, e incluso iGPU con memoria compartida suficiente.
- Inferencia en CPU viable: 241 M de parámetros permiten ejecución en CPU moderna con ONNX Runtime, aunque la latencia real no está documentada en la información disponible.
- Despliegue: ONNX Runtime (incluida la variante web/WebAssembly), Transformers con los pesos safetensors si siguen la interfaz Whisper, y conversión a CTranslate2 para faster-whisper si los pesos son compatibles (no verificado). Motores como audio.cpp basados en ggml requerirían conversión a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (factor de tiempo real) ni de tokens por segundo.
- GPU de datacenter (A100, H100) innecesarias para este tamaño; solo tendrían sentido para servir muchas peticiones concurrentes por lote.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus fichas públicas de referencia y no de la búsqueda realizada; se incluyen solo como orientación de escala.

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stew-audio-0.1-asr-yo | 241,7 M | No disponible (convención Whisper: 30 s) | No disponible; probable yoruba | No disponible | Hugging Face, safetensors + ONNX |
| openai/whisper-small | ~244 M | 30 s por ventana | Multilingüe (~99 idiomas) | MIT (según ficha pública de OpenAI) | Hugging Face, ampliamente soportado |
| openai/whisper-base | ~74 M | 30 s por ventana | Multilingüe | MIT (según ficha pública de OpenAI) | Hugging Face, menor precision esperada |
| openai/whisper-large-v3 | ~1.550 M | 30 s por ventana | Multilingüe | MIT (según ficha pública de OpenAI) | Requiere GPU para uso cómodo |

Frente a Whisper Small original, este modelo parte de una escala casi idéntica pero no documenta mejoras medibles; la ventaja potencial sería un ajuste específico al yoruba, que no puede confirmarse sin evaluación. Frente a Whisper Large-v3, sacrifica precisión potencial a cambio de un coste de inferencia mucho menor y de la posibilidad de ejecución en navegador.

## Limitaciones y advertencias

- Licencia no declarada: sin términos explícitos no hay autorización clara para uso comercial; es un bloqueo legal previo a cualquier despliegue en producción.
- Ausencia total de model card: se desconocen datos de entrenamiento, procedencia del checkpoint base, horas de audio y criterios de evaluación, lo que impide auditar sesgos.
- Riesgo de sesgo lingüístico y demográfico: al no documentarse el corpus, no puede descartarse un ajuste sobre una variedad concreta del yoruba (por ejemplo, una sola región o registro) con degradación sobre dialectos o habla con acento marcado.
- Alucinación típica de ASR: los modelos tipo Whisper tienden a generar texto repetido o inventado ante silencios, ruido o música; se recomienda detección de actividad de voz y umbrales de confianza.
- Límite estructural de ventana de audio: la arquitectura de la familia procesa segmentos de unos 30 segundos, por lo que audios largos requieren segmentación y posible solapamiento.
- Idiomas soportados no confirmados: la descripción del Space menciona cinco lenguas, pero la ficha del modelo no las declara; el rendimiento fuera del yoruba es desconocido.
- Falta de validación comunitaria: 40 descargas y ningún "like" implican ausencia de informes independientes de calidad.
- Sin métricas publicadas de WER/CER: no es posible comparar su precisión con alternativas sin ejecutar una evaluación propia sobre un conjunto de referencia.
- Madurez del proyecto: un único autor sin documentación pública de mantenimiento; conviene fijar la revisión concreta del repositorio para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Erog0291/stew-audio-0.1-asr-yo
- Space asociado (demo en navegador): https://huggingface.co/spaces/Erog0291/stew-audio-0.1
- Repositorio del modelo base de la familia: https://huggingface.co/Erog0291/stew-audio-0.1
- Ficha de referencia de otro modelo del mismo autor: https://free2aitools.com/model/erog0291/stew-embedding-v2
- Motor de inferencia alternativo para modelos de audio en C++ (audio.cpp): https://github.com/0xShug0/audio.cpp
