# raspbfox/parakeet-ultra-litert-mt6897-aot

## Resumen

`raspbfox/parakeet-ultra-litert-mt6897-aot` es un encoder de reconocimiento automático del habla (ASR) experimental, derivado por ajuste del modelo base `moondream/parakeet-ultra` y compilado en formato LiteRT/TFLite mediante compilación anticipada (AOT) para el SoC MediaTek MT6897. El artefacto no es un modelo completo: contiene únicamente el encoder, con entrada y salida en float32 y una ventana fija de 10 segundos de audio. El decoder no se incluye y debe tomarse del repositorio `raspbfox/parakeet-ultra-litert-dynamic-int8`, que aporta un `decode_quantized.tflite` en int8 dinámico para ejecución en CPU.

La relevancia del artefacto es de ingeniería de despliegue, no de calidad de modelo. El autor documenta una solución concreta a un problema de precisión numérica: el uso de normalización de capa escalada para evitar desbordamiento de varianza en FP16 durante la ejecución en el acelerador NeuroPilot v8.0.10 del MT6897, con LiteRT 2.1.5. Esto lo convierte en un caso de estudio de portado de un encoder ASR a un NPU móvil concreto, no en un modelo de propósito general.

Las cifras públicas son mínimas: el repositorio ocupa 1,2 GB, el fichero del modelo pesa 1.196.389.996 bytes (SHA-256 `27326e72d7248e4385c1a624c15ae212d8a12c80e9e17cbfcdc624c183a30418`), no tiene descargas ni valoraciones y su validación se limita a un único teléfono MT6897. El autor lo etiqueta explícitamente como experimental y advierte de que no debe usarse con otros SoC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder ASR compilado (AOT) más decoder TFLite independiente; arquitectura interna del modelo base no detallada en la información disponible |
| Parámetros totales | no disponible (el autor no lo declara) |
| Longitud de contexto | Ventana de entrada de 10 segundos de audio; contexto de texto no disponible |
| Tipos de cuantización | Encoder con entrada/salida float32 (la model card menciona prevención de desbordamiento en FP16); decoder int8 dinámico en el repositorio complementario |
| Idiomas soportados | no disponible en los metadatos; validado cualitativamente con audio en inglés, alemán, francés y ucraniano |
| Licencia | cc-by-4.0 |
| Formato de pesos | TensorFlow Lite / LiteRT (`.tflite`) |
| Modelo base | moondream/parakeet-ultra |
| Tarea declarada | automatic-speech-recognition |
| Tamaño del repositorio | 1,2 GB |
| Tamaño del fichero principal | 1.196.389.996 bytes |
| Runtime requerido | LiteRT 2.1.5 con runtime de despacho MediaTek y NeuroPilot v8.0.10 |
| Hardware objetivo | SoC MediaTek MT6897 exclusivamente |
| Descargas / valoraciones | 0 / 0 |
| Idiomas en metadatos | no disponibles |
| Región declarada | us |

## Arquitectura y entrenamiento

La información disponible describe un pipeline de dos piezas. La primera es un encoder ASR de 10 segundos de ventana, con entrada y salida float32, compilado con LiteRT 2.1.5 AOT para el MT6897 y desplegado sobre NeuroPilot v8.0.10. La segunda es el decoder `decode_quantized.tflite`, cuantizado en int8 dinámico y ejecutado en CPU, procedente del repositorio `raspbfox/parakeet-ultra-litert-dynamic-int8`. No se detalla el número de capas, el tipo de atención, la dimensionalidad del modelo ni si el decoder original emplea un esquema tipo CTC o transducer.

Sobre el entrenamiento no hay información: la model card no indica número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El autor describe el artefacto como resultado de una compilación y de un ajuste de precisión numérica, no de un entrenamiento desde cero. La innovación técnica declarada es el uso de normalización de capa escalada para evitar el desbordamiento de varianza en FP16 en el NPU del MT6897, un problema habitual al portar redes con activaciones de rango amplio a aceleradores móviles.

Como estimación derivada, y no confirmada por el autor, el tamaño del fichero (1.196.389.996 bytes) implicaría del orden de 299 millones de parámetros si los pesos almacenados fuesen float32 puros; este cálculo no debe tomarse como dato oficial, ya que el fichero puede incluir metadatos, gráficos de ejecución u otras estructuras propias del formato LiteRT.

## Capacidades

- Reconocimiento automático del habla sobre ventanas de 10 segundos de audio, con el encoder ejecutado en el NPU del MT6897 y el decoder en CPU.
- Procesamiento local en el dispositivo: no se ha documentado ningún componente que requiera conectividad ni envío de audio a servidores externos.
- Transcripción validada en inglés, alemán, francés y ucraniano, siempre según la validación cualitativa descrita por el autor sobre recortes de FLEURS más un clip en inglés.
- Integración con el ecosistema LiteRT/TFLite: el artefacto es un fichero `.tflite` cargable por el intérprete de LiteRT con el runtime de despacho de MediaTek.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo, traducción, diarización de hablantes ni puntuación automática.
- No hay modo de pensamiento (thinking), ni capacidades multimodales, ni generación de texto más allá de la decodificación de transcripciones.

## Casos de uso

- Dictado offline en aplicaciones de notas para Android: el encoder procesa segmentos de 10 segundos en el NPU mientras la app acumula texto con el decoder en CPU, de modo que el usuario puede dictar sin conexión y sin coste de API. Está limitado a terminales con MT6897.
- Subtitulado en tiempo real de vídeo o llamadas: cortando el audio en tramas de 10 segundos con solapamiento para evitar palabras partidas, el modelo puede generar subtítulos locales en el propio teléfono, útil cuando el contenido es sensible y no debe salir del dispositivo.
- Accesibilidad para personas con discapacidad auditiva: transcripción continua en el terminal delante de conversaciones presenciales, con la ventaja de que el audio nunca abandona el dispositivo y el coste por uso es nulo.
- Transcripción local de reuniones en entornos corporativos con políticas estrictas de protección de datos: al ejecutarse íntegramente en el SoC, evita el cumplimiento de transferencias internacionales que exigiría enviar audio a un servicio en la nube.
- Dictado de informes en trabajo de campo o industria sin cobertura: entornos como inspección de infraestructuras, agricultura o asistencia técnica remota donde no hay red fiable y el texto se necesita en el momento.
- Preprocesado de voz para pipelines de recuperación aumentada (RAG) sobre audio: transcribir localmente grabaciones o notas de voz antes de enviar únicamente el texto a un sistema de búsqueda o a un modelo de lenguaje, reduciendo el volumen de datos transmitidos.
- Investigación y reproducción de despliegues LiteRT AOT: el repositorio sirve como referencia para medir el comportamiento de un encoder ASR en el NPU del MT6897 frente a la ejecución en CPU, replicando la comparación de secuencias de tokens que documenta el autor.
- Prototipado de asistentes de voz embebidos: combinado con un motor de comandos local, permite construir interfaces por voz de baja latencia en un dispositivo MT6897 sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay valores de WER, CER, latencia, consumo energético ni throughput. La única validación descrita es cualitativa: en un teléfono MT6897, las salidas del encoder coincidieron con las de la ejecución en CPU para un clip en inglés y cuatro recortes de FLEURS (alemán, francés, ucraniano e inglés), y las secuencias de tokens del decoder en CPU coincidieron con las esperadas. El propio autor califica esta validación como limitada y aclara que no constituye un benchmark amplio de WER ni de potencia.

## Requisitos de hardware

- No aplica VRAM dedicada: el destino es un SoC móvil, por lo que el modelo consume memoria LPDDR compartida. El encoder ocupa aproximadamente 1,14 GiB (1,20 GB en base decimal) en disco y una cantidad similar o mayor en memoria durante la ejecución; el tamaño del decoder int8 no está disponible en la información proporcionada.
- Hardware obligatorio: SoC MediaTek MT6897 con el runtime de despacho de LiteRT 2.1.5 y NeuroPilot v8.0.10. El autor indica explícitamente que no debe usarse con otros SoC.
- No es ejecutable en GPU de escritorio ni de servidor (A100, H100, RTX 4090) con las herramientas habituales: es un binario AOT específico de un NPU concreto y no un modelo portable con pesos en safetensors o GGUF.
- No se puede desplegar con vLLM, llama.cpp, Ollama ni TGI, ya que ninguno de estos runtimes soporta el formato ni el objetivo de compilación.
- Opciones de despliegue realistas: intérprete LiteRT en Android dentro del dispositivo MT6897, con el encoder en el NPU y el decoder int8 en CPU mediante el fichero `decode_quantized.tflite`.
- Latencia y throughput: no disponibles. La arquitectura de ventana fija de 10 segundos impone un procesamiento por tramas, de modo que la latencia percibida dependerá del solapamiento y de la estrategia de segmentación que implemente la aplicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana / contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raspbfox/parakeet-ultra-litert-mt6897-aot | no disponible | 10 s de audio por ventana | TFLite (LiteRT), encoder float32 | cc-by-4.0 | HuggingFace, 0 descargas, 0 valoraciones |
| raspbfox/parakeet-ultra-litert-dynamic-int8 (decoder complementario) | no disponible | no disponible | TFLite int8 dinámico | no disponible en la información proporcionada | HuggingFace (repositorio referenciado por el autor) |
| moondream/parakeet-ultra (modelo base) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |

No se dispone de información suficiente para comparar este artefacto con modelos ASR de terceros: no hay métricas de error, ni parámetros declarados, ni datos de latencia. La comparación con alternativas como Whisper, Parakeet de NVIDIA u otros modelos ASR queda fuera del alcance de la información proporcionada.

## Limitaciones y advertencias

- Restricción de hardware absoluta: solo funciona en el SoC MediaTek MT6897 con LiteRT 2.1.5 y NeuroPilot v8.0.10. El autor prohíbe su uso en otros SoC.
- Artefacto incompleto por sí solo: contiene únicamente el encoder; sin el decoder `decode_quantized.tflite` del repositorio complementario no produce transcripciones.
- Validación muy limitada: un solo dispositivo, un clip en inglés y cuatro recortes de FLEURS. No hay evaluación de WER, de acentos, de ruido de fondo, de audio telefónico ni de habla espontánea.
- Sin datos de sesgo: no se ha publicado ningún análisis de sesgo por acento, dialecto, edad, género o variedad lingüística, algo crítico en ASR porque estos sistemas suelen degradarse en variedades subrepresentadas.
- Riesgo de error de transcripción: como todo sistema ASR, puede omitir, insertar o sustituir palabras, especialmente en condiciones de ruido o solapamiento de hablantes. En contextos médicos, legales o administrativos se requiere revisión humana.
- Idiomas no declarados oficialmente: los metadatos no listan idiomas soportados y la validación multilingüe es anecdótica, por lo que no debe asumirse cobertura real en alemán, francés o ucraniano más allá de los clips probados.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al autor y no incluye garantías ni cláusula de patentes. Conviene revisar además las condiciones del modelo base `moondream/parakeet-ultra`, cuya licencia no aparece en la información proporcionada.
- Estado experimental: el repositorio no tiene descargas ni valoraciones, y las fechas de creación y actualización figuran como 27 de septiembre de 2026, un dato inconsistente que conviene verificar antes de integrarlo en cualquier flujo de trabajo.
- Ausencia de benchmarks de consumo: en despliegues móviles el consumo energético y la gestión térmica son determinantes, y no hay ninguna medición publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raspbfox/parakeet-ultra-litert-mt6897-aot
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Repositorio del decoder int8 dinámico para CPU: https://huggingface.co/raspbfox/parakeet-ultra-litert-dynamic-int8
- Búsqueda web: no se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo; los resultados devueltos correspondían a páginas de inicio de sesión de redes sociales sin relación con el artefacto.
