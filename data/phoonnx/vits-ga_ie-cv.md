# Phoonnx/vits-ga_ie-cv

## Resumen

vits-ga_ie-cv es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo está entrenado específicamente para irlandés (código ISO `ga`, variante `ga-IE`) y su origen es el conjunto de datos Common Voice, según se desprende de la nomenclatura `cv` del identificador. Resuelve el problema de generar voz sintética natural en una lengua minoritaria con escasa cobertura en sistemas TTS comerciales.

La relevancia actual del modelo es doble. Por un lado, cubre una lengua celta con recursos limitados, lo que lo hace útil para proyectos de preservación lingüística, accesibilidad y aplicaciones de voz en irlandés. Por otro lado, su empaquetado en formato ONNX a través de phoonnx facilita el despliegue en entornos Python y en el asistente de voz OVOS sin depender del framework original de Coqui, lo que simplifica la integración en producción.

El repositorio es de pequeño tamaño (aproximadamente 0,1 GB) y el modelo se distribuye con pesos ONNX. No se dispone de datos sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni el volumen exacto de datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por caracteres) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados) |
| Idiomas soportados | irlandés (`ga`, `ga-IE`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas GAN. VITS produce audio de forma directa a partir del texto sin necesidad de un vocoder externo, lo que reduce la latencia y simplifica el pipeline de inferencia.

El modelo fue entrenado por Coqui y publicado en el release v0.8.0 de su repositorio TTS. Según la model card, los datos de entrenamiento provienen de Common Voice (indicado por el sufijo `cv`), aunque no se especifica el número de horas, el número de hablantes ni la composición exacta del dataset. La entrada de texto se realiza a nivel de caracteres (graphemes), gestionada por el fonemizador `GraphemePhonemizer` de la librería scriptconv, que normaliza el texto y lo convierte en la secuencia de entrada del modelo. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Síntesis de voz (text-to-speech) en irlandés a partir de texto escrito.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Entrada basada en caracteres (graphemes) con normalización de texto previa mediante scriptconv.
- Integración como plugin de TTS en el asistente de voz OVOS (`ovos-tts-plugin-phoonnx`).
- Gestión de voces mediante `TTSModelManager`, con carga y fusión de voces por defecto.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.

## Casos de uso

- Accesibilidad en irlandés: convertir texto de interfaces, documentos o webs a voz para usuarios con discapacidad visual o dificultades de lectura, aprovechando que el modelo está entrenado específicamente en `ga-IE`.
- Asistentes de voz domésticos: integración en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` para respuestas habladas en irlandés, configurando la voz `coqui/ga-cv-vits` en `mycroft.conf`.
- Preservación y promoción lingüística: generación de audiolibros, materiales educativos o contenido divulgativo en irlandés para escuelas y organismos de normalización lingüística.
- Lectura de noticias y boletines: conversión automática de artículos o comunicados en irlandés a audio para podcasts o servicios de información.
- Sistemas de anuncios públicos: síntesis de mensajes en transporte, aeropuertos o edificios públicos donde se requiera cobertura del irlandés.
- Prototipado de aplicaciones de voz: al ser un modelo pequeño (repo de ~0,1 GB) y en ONNX, permite iterar rápidamente en demos y MVPs sin infraestructura pesada.
- Investigación en TTS para lenguas minoritarias: servir como baseline o punto de partida para fine-tuning o comparación con otros sistemas en irlandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (~0,1 GB) se trata de un modelo ligero que probablemente cabe en GPU de gama baja, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido sugiere que podría ejecutarse en GPUs de consumo e incluso en CPU, pero no se aportan datos oficiales.
- Opciones de despliegue: phoonnx (Python, con soporte ONNX) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-ga_ie-cv (este) | VITS | Irlandés (`ga-IE`) | BSD-3-Clause | ONNX | Hugging Face (Phoonnx) |
| Coqui TTS VITS original (`tts_models--ga--cv--vits`) | VITS | Irlandés (`ga-IE`) | BSD-3-Clause | Checkpoint Coqui | GitHub releases de Coqui |
| Otros modelos VITS de la colección Phoonnx | VITS | Diversos idiomas | BSD-3-Clause (según modelo) | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta irlandés (`ga-IE`); no es multilingüe y no debe usarse con texto en otros idiomas.
- Es un modelo exclusivamente TTS: no realiza comprensión, razonamiento ni generación de texto.
- La entrada se procesa a nivel de caracteres con fonemización basada en graphemes, lo que puede producir errores de pronunciación en palabras irlandesas con ortografía irregular o préstamos.
- No se documentan sesgos específicos, pero al entrenarse con Common Voice puede heredar sesgos de acento, género y distribución de hablantes del corpus.
- Riesgo de artefactos o alucinaciones acústicas en entradas atípicas (números, siglas, texto muy corto o muy largo), habitual en modelos VITS.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar las condiciones del corpus Common Voice y del modelo original de Coqui antes de un despliegue en producción.
- No se especifican límites de longitud de entrada ni de contexto; conviene fragmentar textos largos en frases.
- El modelo tiene muy poca adopción (27 descargas, 0 likes en el momento de la consulta), por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ga_ie-cv
- Modelo original de Coqui (release v0.8.0): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--ga--cv--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
