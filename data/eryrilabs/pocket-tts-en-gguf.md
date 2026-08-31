# EryriLabs/pocket-tts-en-GGUF

## Resumen
Pocket TTS es un modelo de síntesis de voz (text-to-speech) de aproximadamente 80 millones de parámetros, diseñado por Kyutai para ejecutarse de forma eficiente en CPU. Esta ficha cubre la conversión GGUF realizada por EryriLabs, que permite usar el modelo directamente con llama.cpp sin necesidad de GPU. El modelo original (kyutai/pocket-tts) está documentado en el artículo arXiv:2509.06926 y se distribuye bajo licencia CC-BY-4.0. Su relevancia radica en ofrecer síntesis de voz local, rápida y de baja latencia, apta para entornos sin aceleración por hardware, con soporte de clonación de voz mediante un archivo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la información proporcionada (ver paper arXiv:2509.06926) |
| Parametros totales | 79.623.168 |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | Sin cuantizar (tensores F16/F32 según conversión) |
| Idiomas soportados | Inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (ficheros .gguf) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo (por ejemplo, si es un transformer, un modelo basado en convolución o una arquitectura híbrida). Se sabe que es un modelo de texto a voz diseñado para funcionar en CPU con bajo consumo de recursos, y que el entrenamiento y los detalles técnicos se describen en el artículo arXiv:2509.06926. La conversión a GGUF se realizó con la herramienta `convert_hf_to_gguf.py` de llama.cpp, sin aplicar cuantización adicional, manteniendo los tensores en precisión F16/F32. El modelo requiere un archivo de referencia de voz (un audio WAV del hablante) para producir audio; sin él, la salida es prácticamente nula.

## Capacidades
- Síntesis de voz en inglés a partir de texto, con salida en WAV mono de 24 kHz a aproximadamente 12,5 frames por segundo.
- Clonación de voz mediante un archivo de referencia de audio (no requiere entrenamiento adicional).
- Ejecución eficiente en CPU: en un escritorio con 24 hilos alcanza una velocidad de síntesis de ~5,8x tiempo real, sin necesidad de GPU.
- Integración con llama.cpp y con servidores compatibles con OpenAI (por ejemplo, `llama-tts-server` ofrece un endpoint `/v1/audio/speech`).
- Diseñado para cadenas de voz locales, como asistentes conversacionales con entrada de audio y salida de voz.

## Casos de uso
- Asistentes de voz locales: integrar Pocket TTS en un asistente que se ejecute en un PC o servidor sin GPU, convirtiendo respuestas de texto en voz con baja latencia (por ejemplo, ~1,3 segundos hasta el primer audio en una cadena completa).
- Accesibilidad: generar voz para lectores de pantalla en aplicaciones de escritorio o web, sin depender de servicios en la nube.
- Audiolibros y contenido narrado: producir audiolibros o podcasts a partir de texto, usando una voz de referencia para mantener consistencia.
- Doblaje y localización: clonar una voz concreta a partir de un archivo de referencia para doblar vídeos o presentaciones.
- Prototipado rápido de interfaces de voz: en entornos de desarrollo, generar voces de prueba sin necesidad de hardware especializado.
- Sistemas de respuesta interactiva (IVR): implementar menús de voz automáticos en centralitas telefónicas usando un servidor local con llama.cpp.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento mencionada es la velocidad de síntesis en CPU (~5,8x tiempo real con 24 hilos), pero no hay comparaciones formales con otros modelos TTS.

## Requisitos de hardware
- No requiere GPU; funciona en CPU de escritorio o servidor. Se ha probado con 24 hilos, pero puede ejecutarse en configuraciones menores.
- Tamaño del modelo: 159 MB (weights) + 60 MB (proyector multimodal), por lo que cabe en cualquier sistema con 1 GB de RAM libre.
- VRAM: no aplica (inferencia en CPU). Si se desea usar GPU, es posible, pero no se documenta en la información proporcionada.
- Opciones de despliegue: llama.cpp (comando `llama-tts`), servidor `llama-tts-server` (compatible con OpenAI), o integración en aplicaciones personalizadas mediante la librería de llama.cpp.
- Latencia: se menciona ~1,3 s hasta el primer audio en una cadena completa (Gemma 4 E4B + Pocket TTS), aunque depende del hardware.

## Comparativa con modelos similares
No se dispone de datos comparativos con otros modelos TTS en la información proporcionada. Existen otras conversiones GGUF de Pocket TTS (por ejemplo, de los repositorios `idle-intelligence/pocket-tts-gguf` o `cstr/pocket-tts-GGUF`), pero no hay benchmarks públicos que permitan una comparación objetiva. Se recomienda consultar el paper original para conocer el diseño y las comparativas que Kyutai haya publicado.

## Limitaciones y advertencias
- Requiere un archivo de referencia de voz para producir audio; sin él, la salida es casi nula.
- Solo soporta inglés (etiqueta `en`); no se documentan otros idiomas.
- No se ha aplicado cuantización en esta conversión, por lo que el modelo ocupa más espacio que una versión cuantizada y la velocidad puede ser menor que otras conversiones que sí la usen.
- Al ser una conversión no oficial (aunque basada en el modelo original), puede haber diferencias de comportamiento respecto al modelo de Kyutai.
- Licencia CC-BY-4.0: permite uso comercial y modificación, pero requiere atribución. Verificar los términos exactos en el repositorio original.
- No se han documentado sesgos específicos, pero al ser un modelo de voz, puede presentar variaciones en la pronunciación dependiendo del acento o la entonación de la referencia.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/EryriLabs/pocket-tts-en-GGUF
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Paper (arXiv): https://arxiv.org/abs/2509.06926
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de Pocket TTS (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Servidor llama-tts-server: https://github.com/dwain-barnes/llama-tts-server
- Voces de referencia: https://huggingface.co/kyutai/tts-voices
