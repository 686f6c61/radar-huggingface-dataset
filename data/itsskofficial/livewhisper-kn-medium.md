# itsskofficial/livewhisper-kn-medium

## Resumen

Livewhisper-kn-medium es una conversión a CTranslate2 del modelo vasista22/whisper-kannada-medium, un Whisper medium ajustado (fine-tuning) para reconocimiento automático del habla en kannada por el SPRING Lab del IIT Madras. La conversión la firma el usuario itsskofficial y su único propósito es empaquetar los pesos en float16 junto con los ficheros `tokenizer.json` y `preprocessor_config.json` que exige faster-whisper, de modo que el modelo pueda ejecutarse en la aplicación de dictado por voz LiveWhisper para Windows. No hay reentrenamiento ni modificación de los pesos: solo cambia el formato.

El interés de esta ficha es práctico. El autor publica dos métricas medidas dentro de LiveWhisper: un 32,3% de error de palabra (WER) en FLEURS y un 30,2% en la tarea que denomina "delivered Kanglish" (kannada transcrito con caracteres latinos), frente al 67,4% y 59,8% respectivamente que obtiene whisper-large-v3 en el mismo entorno. Son cifras de un único punto de medida, no comparables con tablas de benchmarks independientes, pero apuntan a que un modelo medium especializado supera a un large genérico cuando la lengua objetivo es el kannada.

El repositorio ocupa 1,5 GB, el proceso de conversión alcanza un pico cercano a 7 GB de memoria y la licencia es Apache 2.0, heredada del modelo original. Con cero descargas y cero "likes" en el momento de redactar esta ficha, se trata de un artefacto de nicho orientado a un idioma concreto y a una aplicación de escritorio concreta, no de un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante medium), con codificación mel de 80 canales y ventanas de audio de 30 segundos |
| Parametros totales | 769 M (configuración estándar de Whisper medium; el repositorio no publica el recuento exacto) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica en tokens; ventana de audio de 30 segundos por segmento (comportamiento estándar de Whisper) |
| Tipos de cuantización | Pesos publicados en float16; CTranslate2 admite además int8, int8_float16 y float32 en tiempo de carga (`compute_type`) |
| Idiomas soportados | kannada (kn); el autor reporta además soporte de "Kanglish" (kannada en alfabeto latino) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin` binario) más `tokenizer.json` y `preprocessor_config.json`; no se distribuyen safetensors ni GGUF |
| Tarea | automatic-speech-recognition (ASR) |
| Modelo base | vasista22/whisper-kannada-medium |
| Tamaño del repositorio | 1,5 GB |
| Librería | ctranslate2 (consumible con faster-whisper) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper medium: un transformer encoder-decoder entrenado originalmente por OpenAI sobre 680.000 horas de audio supervisado multilingüe, con entrada de espectrograma mel-logarítmico de 80 canales y predicción autorregresiva de tokens de texto. El ajuste específico para kannada lo realizó el SPRING Lab del IIT Madras; la model card de esta conversión no detalla el número de tokens, la composición del corpus ni si se aplicaron etapas de RLHF o DPO, por lo que esos datos no están disponibles. Al ser una tarea de ASR supervisada con pares audio-transcripción, es esperable un entrenamiento por entropía cruzada, pero no se confirma en la información proporcionada.

La única intervención técnica documentada en este repositorio es la conversión de formato: pesos en float16, más los dos ficheros auxiliares que faster-whisper necesita. CTranslate2 aplica optimizaciones de inferencia propias (fusión de operadores, cuantización opcional en tiempo de carga y ejecución eficiente en CPU y GPU), lo que permite cargar el modelo con `WhisperModel(..., device="cuda", compute_type="int8_float16")`. El autor advierte que la conversión en sí consume cerca de 7 GB de memoria, dato relevante si se quiere reproducir el proceso.

## Capacidades

- Transcripción de voz en kannada a texto, con ventanas de 30 segundos procesadas de forma independiente.
- Transcripción de "Kanglish", es decir, kannada escrito con caracteres latinos, según la métrica reportada por el autor.
- Reconocimiento de habla en tiempo real cuando se integra en LiveWhisper, ya que la aplicación está diseñada para dictado por voz continua.
- Ejecución acelerada en GPU y en CPU gracias al backend CTranslate2, con selección de tipo de cómputo en la carga.
- Detección automática del tramo de voz y de los límites de segmento mediante el pipeline de faster-whisper.
- No soporta tool calling ni function calling: no es un modelo de lenguaje con API de herramientas.
- No soporta razonamiento multi-paso, agentes ni modo de pensamiento (thinking mode).
- No ofrece capacidades de visión ni de audio más allá de la transcripción (no hay traducción de audio a texto en otros idiomas de forma fiable, ni diarización de hablantes).

## Casos de uso

- Dictado por voz en Windows para hablantes de kannada: es el escenario para el que se creó el artefacto, ya que el modelo se distribuye precisamente como dependencia de LiveWhisper; el usuario habla y el texto se inserta en la aplicación activa.
- Subtitulado automático de vídeo en kannada: se puede procesar la pista de audio completa en fragmentos de 30 segundos y generar un fichero de subtítulos, con la ventaja de que el modelo medium cabe en GPU de consumo y el coste por hora de audio es bajo.
- Transcripción de reuniones y entrevistas en kannada: el modelo produce segmentos con marcas de tiempo, lo que permite indexar y buscar dentro de grabaciones largas; el autor reporta un WER medido del 32,3% en FLEURS, suficiente para búsqueda aproximada aunque no para actas literales.
- Normalización de texto "Kanglish" en redes sociales o mensajería: la métrica del 30,2% en Kanglish sugiere que el modelo es útil para convertir audio informal, con mezcla de alfabetos, en texto procesable.
- Asistentes de voz locales sin conexión: al ser un modelo de 1,5 GB con licencia Apache 2.0, puede desplegarse en un equipo de escritorio con GPU modesta y funcionar sin enviar audio a servicios externos, lo que simplifica el cumplimiento de requisitos de privacidad.
- Investigación lingüística y creación de corpus: permite transcribir grabaciones de campo en kannada de forma semiautomática y acelerar la anotación manual posterior; la licencia permisiva facilita publicar los corpus derivados.
- Integración en pipelines de accesibilidad: transcripción en vivo de vídeos o clases para personas con discapacidad auditiva que sean hablantes de kannada, ejecutando el modelo en local o en un servidor con una GPU de gama media.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos dentro de la aplicación LiveWhisper por el autor de la conversión:

| Metrica | livewhisper-kn-medium | whisper-large-v3 |
|---|---|---|
| FLEURS word error | 32,3% | 67,4% |
| Delivered Kanglish (error) | 30,2% | 59,8% |

Advertencias sobre estos números: no se especifican el conjunto de evaluación exacto, el procedimiento de medida ni la configuración empleada con whisper-large-v3, y el resultado de large-v3 (67,4% de WER en kannada) es muy superior al error publicado habitualmente para ese modelo en otras lenguas, lo que sugiere condiciones de evaluación particulares o una elección de idioma incorrecta en esa comparación. No hay benchmarks independientes (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a un modelo de reconocimiento de habla.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 1,5-2,5 GB, incluyendo pesos y memorias intermedias de la ventana de 30 segundos. Es una estimación orientativa: el autor no publica cifras de VRAM.
- VRAM estimada con `compute_type="int8_float16"`: aproximadamente 1-1,5 GB, la configuración que aparece en el ejemplo de código de la model card.
- Memoria para la conversión de formato: cerca de 7 GB de pico, según el autor; es un requisito del proceso de conversión, no de la inferencia.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM sirve; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan con holgura. En CPU funciona con CTranslate2, aunque con mayor latencia.
- Sí cabe en GPU de consumo: GTX 1650, RTX 3050, RTX 3060 o superiores son suficientes incluso en float16; con cuantización int8 el margen es amplio.
- Opciones de despliegue: faster-whisper sobre CTranslate2 (vía oficial), LiveWhisper en Windows, o cualquier servicio propio que use la librería ctranslate2. No se puede cargar directamente en llama.cpp, Ollama o servidores basados en GGUF, ya que el repositorio no publica pesos en ese formato; para esos entornos habría que partir del modelo original en HuggingFace Transformers y convertirlo aparte.
- Latencia y throughput: no disponibles. El autor no publica métricas de velocidad; en un modelo medium con CTranslate2 y una GPU de gama media cabe esperar un factor de tiempo real muy por encima de 1, pero no se confirma con datos.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | WER reportado |
|---|---|---|---|---|---|
| itsskofficial/livewhisper-kn-medium | 769 M (Whisper medium) | kannada, Kanglish | CTranslate2 float16 | Apache 2.0 | 32,3% FLEURS; 30,2% Kanglish |
| vasista22/whisper-kannada-medium | 769 M (Whisper medium) | kannada | Transformers (safetensors) | Apache 2.0 | no disponible en la información consultada; es el modelo de origen de la conversión |
| openai/whisper-medium | 769 M | multilingüe (99 idiomas) | Transformers, GGUF en terceros | Apache 2.0 | no disponible en la información consultada; cobertura de kannada inferior por falta de ajuste específico |
| openai/whisper-large-v3 | 1.550 M | multilingüe (99 idiomas) | Transformers, GGUF en terceros | Apache 2.0 | 67,4% FLEURS y 59,8% Kanglish según la medición del autor de esta conversión |

La comparación relevante es la última fila: dentro del entorno LiveWhisper, el medium ajustado en kannada supera al large-v3 genérico con la mitad de parámetros. No se dispone de comparaciones con otros sistemas ASR específicos de kannada (por ejemplo, modelos de AI4Bharat) en la información proporcionada.

## Limitaciones y advertencias

- El WER del 32,3% en FLEURS implica aproximadamente un tercio de palabras incorrectas: no es adecuado para transcripciones literales sin revisión humana.
- Los números de benchmarks provienen del propio autor de la conversión, medidos en su aplicación y sin protocolo detallado ni validación independiente; deben tratarse como indicativos.
- Repositorio con cero descargas y cero "likes": no hay evidencia de uso en producción ni de validación por terceros.
- Riesgo de alucinación típico de Whisper: ante silencios, ruido o audio musical puede generar texto plausible que no corresponde a lo dicho. Es habitual aplicar umbrales de voz y filtros de repetición.
- Modelo monolingüe en la práctica (kannada). Aunque Whisper medium base es multilingüe, el ajuste específico degrada el rendimiento en otras lenguas y no se recomienda usarlo fuera de su idioma objetivo.
- Sin diarización de hablantes, sin puntuación garantizada y sin marcas de tiempo a nivel de palabra más allá de lo que ofrece el pipeline de faster-whisper.
- Licencia Apache 2.0, que permite uso comercial y modificación. El autor de la conversión atribuye todo el crédito a los autores originales; conviene conservar esa atribución y revisar los términos del modelo base vasista22/whisper-kannada-medium.
- El repositorio solo publica pesos en formato CTranslate2. Su uso en ecosistemas que esperan GGUF o safetensors requiere una conversión adicional desde el modelo original.
- Las fechas del repositorio (creado y actualizado en septiembre de 2026) resultan anómalas; conviene verificar la vigencia del artefacto antes de integrarlo.
- El proceso de conversión documentado necesita cerca de 7 GB de memoria, un detalle a tener en cuenta si se planea reproducir el empaquetado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsskofficial/livewhisper-kn-medium
- Modelo base: https://huggingface.co/vasista22/whisper-kannada-medium
- faster-whisper (repositorio): https://github.com/SYSTRAN/faster-whisper
- LiveWhisper (aplicación de dictado para Windows): https://github.com/itsskofficial/LiveWhisper
- CTranslate2 (documentación de la librería): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Los resultados de búsqueda web recibidos no contenían enlaces relevantes al modelo (devolvieron páginas de soporte de Microsoft sin relación con el artefacto).
