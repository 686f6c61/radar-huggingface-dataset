# codebucketsolutions/pocket-tts-multilingual-GGUF

## Resumen

Multilingual Pocket TTS es un modelo de síntesis de voz (text-to-speech) de 79,6 millones de parámetros, fine-tune comunitario del modelo Kyutai Pocket TTS realizado por el usuario Thanushttk. Esta ficha concreta es la conversión a formato GGUF publicada por codebucketsolutions para su uso con `llama-tts` y `llama-server` de llama.cpp, tal como los emplea la herramienta bolo. Soluciona el acceso a TTS multilingüe ligero en entornos donde llama.cpp es el runtime de referencia, sin necesidad de infraestructura Python pesada.

El modelo es un transformer de 6 capas con un tokenizador SentencePiece de 4.000 piezas compartido entre inglés, hindi, marathi, kannada, tamil, malayalam y telugu, con capacidad de code-mixing. Genera audio a 24 kHz y permite clonar una voz a partir de una grabación corta de referencia. No es un lanzamiento oficial de Kyutai: se trata de un fine-tune comunitario del que no se documentan detalles de entrenamiento.

La relevancia de esta publicación es doble: por un lado, demuestra que el pipeline de conversión de llama.cpp puede adaptarse a tokenizadores SentencePiece BPE (no solo unigram) mediante un parche de dos líneas; por otro, ofrece pesos en 16 y 8 bits con un proyector separado que contiene el flow head, el codificador de voz y el decodificador Mimi, lo que permite ejecutar TTS en CPU. El repo ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 6 capas (modelo student) con flow head, codificador de voz y decodificador Mimi |
| Parámetros totales | 79.623.168 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16 (transformer, 160 MB) y q8_0 (transformer, 85 MB); proyector en f32 (60 MB) |
| Idiomas soportados | en, hi, mr, kn, ta, ml, te (con code-mixing) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Frecuencia de muestreo | 24 kHz |
| Tokenizador | SentencePiece BPE, 4.000 piezas |
| Modelo base | Thanushttk/pocket-tts-multilingual (revisión 80c7f2835138c62750d76a93d4333c5c5bb6a754) |
| Runtime | llama.cpp `llama-tts` y `llama-server` (release b12521) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 6 capas que actúa como student, encargado de mapear texto a latentes. El pipeline completo se reparte en dos ficheros GGUF: el transformer más el tokenizador (f16 o q8_0) y un proyector (`mmproj`) en f32 que contiene el flow head, el codificador de voz y el decodificador Mimi de Kyutai. La síntesis se realiza a 24 kHz y la clonación de voz se basa en un fichero WAV de referencia que se pasa en cada petición mediante `--tts-speaker-file`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el fine-tune. La model card solo indica que es un fine-tune comunitario de Kyutai Pocket TTS con un tokenizador SentencePiece de 4.000 piezas para los siete idiomas, incluyendo code-mixing. La innovación técnica documentada está en la conversión: el conversor de llama.cpp solo aceptaba tokenizadores unigram de SentencePiece y rechazaba otros tipos; como el tokenizador de este fine-tune es BPE, se aplicó un parche de dos líneas (`pockettts-bpe.patch`) para que se escribiera como tokenizador SentencePiece (BPE) de llama.cpp. Fuera de eso, la conversión sigue el pipeline estándar de `convert_hf_to_gguf.py` en la release b12521.

## Capacidades

- Síntesis de voz multilingüe en inglés, hindi, marathi, kannada, tamil, malayalam y telugu.
- Code-mixing entre los idiomas soportados dentro de una misma frase, gestionado por el tokenizador compartido.
- Clonación de voz a partir de una grabación corta de referencia, pasada en cada petición.
- Generación de audio a 24 kHz.
- Detección automática del idioma a partir del texto de entrada; el parámetro `lang` no se utiliza.
- Ejecución en CPU mediante llama.cpp, sin necesidad de GPU.
- Integración con `llama-tts` (CLI) y `llama-server` (servidor HTTP compatible con endpoints).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.

## Casos de uso

- **Locución multilingüe para contenido educativo en India**: el modelo cubre hindi, marathi, kannada, tamil, malayalam y telugu con un único tokenizador, lo que permite generar narraciones para cursos en varios idiomas sin cambiar de modelo ni de pipeline.
- **Clonación de voz para audiolibros y pódcast**: con una grabación de referencia corta se puede mantener una voz consistente a lo largo de horas de audio, útil para productoras que quieren preservar la identidad sonora de un locutor.
- **Sistemas de respuesta de voz en atención al cliente**: al ejecutarse en CPU con llama.cpp, se puede desplegar junto a un servidor `llama-server` en infraestructura modesta para respuestas habladas en inglés e hindi.
- **Code-mixing en contextos reales**: en comunidades bilingües (por ejemplo, tamil-inglés o hindi-inglés) el modelo acepta frases mezcladas, lo que encaja en asistentes para mercados donde la conversación alterna idiomas.
- **Accesibilidad y lectura de pantalla**: generación de voz para aplicaciones de lectura en dispositivos sin GPU, gracias a los 85 MB del transformer en q8_0 más 60 MB del proyector.
- **Prototipado rápido de interfaces de voz**: la CLI `llama-tts` permite probar frases y voces de referencia en segundos, sin montar un stack de inferencia Python.
- **Integración en pipelines de CI para pruebas de audio**: al ser un binario de llama.cpp, se puede ejecutar en runners de CPU para validar que las frases de prueba generan audio no silencioso a 24 kHz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta comprobaciones cualitativas realizadas el 2026-11-21 en una máquina x86-64 de 4 vCPU con llama.cpp b12521 en CPU:

| Comprobación | Resultado |
|---|---|
| Igualdad de token ids entre el tokenizador de llama.cpp y SentencePiece (hindi y tamil-inglés) | Correcta |
| Audio generado en hindi, tamil e inglés con voz de referencia corta | Audio no silencioso a 24 kHz |
| Transcripción con Whisper small del audio en inglés | Palabra por palabra |
| Transcripción con Whisper small del audio en hindi y tamil | Inteligible, con errores propios del reconocedor en esos idiomas |

No se proporcionan cifras de latencia, throughput, MOS ni comparaciones numéricas con otros modelos TTS.

## Requisitos de hardware

- **VRAM estimada**: no aplica de forma estricta; el modelo está pensado para CPU. En GPU, los pesos del transformer ocupan 160 MB en f16 o 85 MB en q8_0, más 60 MB del proyector en f32.
- **GPU recomendadas**: no se especifican; cualquier GPU con al menos 1 GB de memoria libre podría alojar los pesos, aunque la model card solo valida ejecución en CPU.
- **CPU**: validado en un x86-64 de 4 vCPU con llama.cpp b12521.
- **¿Cabe en GPU de consumo?**: sí, por tamaño de pesos (menos de 250 MB en total), aunque no hay validación publicada en GPU de consumo.
- **Opciones de despliegue**: `llama-tts` (CLI) y `llama-server` (servidor HTTP) de llama.cpp, release b12521 o posterior. Requiere pasar `-m` con el transformer, `-mm` con el proyector y `--tts-speaker-file` con la voz de referencia.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| pocket-tts-multilingual-GGUF (esta ficha) | 79,6 M | en, hi, mr, kn, ta, ml, te | no disponible | CC BY 4.0 | GGUF | Fine-tune comunitario, ejecución en CPU vía llama.cpp |
| Thanushttk/pocket-tts-multilingual | 79,6 M | en, hi, mr, kn, ta, ml, te | no disponible | CC BY 4.0 | safetensors | Modelo base del que se deriva esta conversión |
| kyutai/pocket-tts | no disponible | no disponible | no disponible | CC BY 4.0 | no disponible | Modelo original de Kyutai; esta ficha no detalla sus especificaciones |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos.

## Limitaciones y advertencias

- **No es un lanzamiento oficial de Kyutai**: es un fine-tune comunitario; la calidad y el comportamiento pueden diferir del modelo original.
- **Idiomas limitados**: solo cubre siete idiomas del subcontinente indio más inglés; no se documenta soporte para español ni otras lenguas.
- **Riesgo de alucinación y errores de pronunciación**: la propia model card reporta errores de transcripción en hindi y tamil al leer con Whisper small, lo que sugiere imprecisiones en la síntesis en esos idiomas.
- **Dependencia de la voz de referencia**: cada petición requiere un fichero WAV de referencia; la calidad de la clonación depende de esa grabación y no se documentan límites de duración o formato.
- **Sin datos de entrenamiento publicados**: no se puede evaluar la composición del dataset ni posibles sesgos demográficos o lingüísticos.
- **Licencia CC BY 4.0**: permite uso comercial con atribución a Thanushttk y a Kyutai (incluidos los pesos del códec Mimi). Es obligatorio conservar la atribución y el texto de la licencia.
- **Compatibilidad de runtime**: requiere llama.cpp b12521 o posterior y el parche de tokenizador BPE aplicado en la conversión; versiones anteriores del conversor no generarán estos GGUF correctamente.
- **Sin métricas objetivas**: no hay MOS, WER ni comparativas publicadas, por lo que la evaluación de calidad debe hacerse manualmente antes de producción.
- **Repo sin tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- [Hugging Face: codebucketsolutions/pocket-tts-multilingual-GGUF](https://huggingface.co/codebucketsolutions/pocket-tts-multilingual-GGUF)
- [Modelo base: Thanushttk/pocket-tts-multilingual](https://huggingface.co/Thanushttk/pocket-tts-multilingual)
- [Modelo original: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Herramienta bolo (cB-Sigma/bolo-speech)](https://github.com/cB-Sigma/bolo-speech)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
