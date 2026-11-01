# optima-tools-ch/voice-low

## Resumen

Optima Tools voice-low es un paquete de voces ligeras para síntesis de voz (TTS) empaquetado por el usuario optima-tools-ch a partir de los modelos Piper publicados por Rhasspy. No se trata de un modelo de lenguaje, sino de un conjunto de modelos acústicos y vocoders en formato ONNX pensados para inferencia en CPU sin GPU, orientados a aplicaciones de lectura en voz alta y asistentes embebidos. El paquete incluye tres voces: francés (Siwis), alemán (Thorsten) y inglés (LibriTTS-R).

Según la model card, los ficheros son una copia idéntica, byte por byte, de los publicados por sus autores en el repositorio rhasspy/piper-voices (revisión 5041a7a49ae5b3a0f30e6837769eb03fdbb231bd). No se modifica ningún fichero: solo se reorganizan las rutas en `voices/` y `credits/`, y se añade un `.optima-package.json` con tamaños y huellas SHA-256 para verificación en la instalación. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta.

La relevancia de este paquete es práctica: ofrece voces TTS de tres idiomas europeos con licencias permisivas (CC BY 4.0 y CC0 1.0) y un mecanismo de integridad criptográfica, lo que facilita su distribución dentro de un motor propietario como Optima Tools. No hay información publicada sobre arquitectura exacta, número de parámetros ni contexto, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelos Piper (VITS para TTS, inferencia en CPU); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | pesos ONNX; cuantizaciones concretas no disponibles |
| Idiomas soportados | francés (Siwis), alemán (Thorsten), inglés (LibriTTS-R) |
| Licencia | CC BY 4.0 y CC0 1.0 (etiqueta del repo: other) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El paquete no aporta información sobre la arquitectura interna de cada voz. Por el origen declarado (Piper, motor de Rhasspy), se trata de modelos de síntesis de voz neuronales del tipo VITS, exportados a ONNX para ejecución en CPU. Cada voz consta presumiblemente de un modelo acústico y un vocoder, pero los detalles concretos (capas, dimensiones, tasa de muestreo) no están documentados en la información disponible.

Tampoco se documentan los datos de entrenamiento de cada voz más allá de la atribución de origen: Siwis procede de la SIWIS French Speech Synthesis Database de la University of Edinburgh, LibriTTS-R es un corpus de habla inglesa derivado de LibriTTS, y Thorsten es una voz alemana publicada con licencia CC0. No hay información sobre número de horas de audio, proceso de alineamiento, RLHF ni innovaciones técnicas de decodificación.

## Capacidades

- Síntesis de voz (texto a habla) en francés, alemán e inglés.
- Inferencia en CPU sin GPU, adecuada para entornos con recursos limitados.
- Ejecución mediante el motor Piper y sus bindings (por ejemplo, piper-tts).
- Verificación de integridad de los ficheros mediante SHA-256 al instalar.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- No se documentan capacidades multilingües más allá de las tres voces incluidas ni control de prosodia o emociones.

## Casos de uso

- Lectura de artículos y documentos en voz alta: las tres voces permiten narrar contenido en francés, alemán o inglés con un motor TTS en CPU, sin necesidad de GPU.
- Asistentes de voz embebidos: al ejecutarse en CPU con ONNX, el paquete encaja en dispositivos de bajo consumo para respuestas habladas en los tres idiomas.
- Accesibilidad para personas con discapacidad visual: conversión de texto de interfaz o documentos a audio en tiempo real en entornos de escritorio.
- Señalización y anuncios automáticos: generación de avisos pregrabados o dinámicos en estaciones, comercios o sistemas de megafonía multilingües.
- Prototipado de aplicaciones de voz: integración rápida en pipelines de desarrollo con piper-tts para probar interfaces conversacionales sin infraestructura GPU.
- Distribución verificable en productos de terceros: el manifiesto `.optima-package.json` con SHA-256 permite validar la integridad de las voces al instalarlas en un motor como Optima Tools.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el paquete está diseñado para CPU sin GPU.
- GPU recomendadas: no aplicable; no requiere GPU.
- Cabe en cualquier equipo consumer: el repositorio completo ocupa 0,2 GB y cada voz individual es una fracción de ese tamaño.
- Opciones de despliegue: motor Piper (piper-tts) y entornos compatibles con ONNX Runtime; integración en Optima Tools.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|
| Optima Tools voice-low | FR, DE, EN | ONNX | CC BY 4.0 / CC0 1.0 | Copia de voces Piper con verificación SHA-256 |
| rhasspy/piper-voices | Múltiples | ONNX | Según cada voz | Repositorio original de las voces |
| Coqui TTS | Múltiples | Diversos | Según cada modelo | Motor TTS con modelos variados; datos concretos no disponibles |
| eSpeak NG | Múltiples | No neuronal | GPL | Síntesis por reglas, mucha menor naturalidad; datos concretos no disponibles |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; solo sintetiza voz.
- Solo cubre francés, alemán e inglés; no hay voces para castellano ni otros idiomas.
- La licencia del repositorio figura como "other"; las voces tienen licencias distintas (Siwis y LibriTTS-R CC BY 4.0 con atribución obligatoria; Thorsten CC0 1.0). El label MIT del repositorio original no sustituye estas licencias.
- El uso comercial exige respetar la atribución de Siwis (University of Edinburgh) y LibriTTS-R; conviene revisar los términos exactos antes de distribuir.
- Calidad y naturalidad de las voces no documentadas en la información disponible; no hay benchmarks publicados.
- Riesgo de errores de pronunciación en nombres propios y términos técnicos, habitual en TTS; no cuantificado.
- Sin información sobre sesgos de voz (género, acento, variedad dialectal) más allá del origen de cada corpus.

## Enlaces

- HuggingFace: https://huggingface.co/optima-tools-ch/voice-low
- Repositorio original de voces Piper: https://huggingface.co/rhasspy/piper-voices
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
