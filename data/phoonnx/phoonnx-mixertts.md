# Phoonnx/phoonnx-mixertts

## Resumen

Phoonnx-mixertts es un paquete de voces de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx dentro del espejo comunitario de modelos para el motor [phoonnx](https://github.com/TigreGotico/phoonnx), impulsado por la comunidad OpenVoiceOS. No se trata de un modelo de lenguaje, sino de un conjunto de pesos acústicos en formato ONNX que implementan la arquitectura Mixer-TTS (MLP-Mixer/FastPitch) de NVIDIA para la conversión de texto a mel-espectrograma de 80 canales. El paquete es un espejo de los checkpoints de LJSpeech del repositorio [nipponjo/mixer-tts-pytorch](https://github.com/nipponjo/mixer-tts-pytorch).

El modelo resuelve un problema muy concreto: ofrecer una voz sintética ligera y ejecutable en local mediante ONNX Runtime, sin depender de infraestructura de GPU ni de servicios en la nube. Cada voz se distribuye en una subcarpeta independiente con tres ficheros (`model.onnx`, `config.json` nativo y `vocoder.json`), y la síntesis se realiza en dos etapas: el modelo acústico genera el mel-espectrograma y un vocoder lo convierte en onda de audio, usando Griffin-Lim por defecto. El repositorio ocupa aproximadamente 0,1 GB.

Su relevancia actual es acotada pero clara para el nicho de asistentes de voz embebidos: encaja en el ecosistema phoonnx/OpenVoiceOS como una voz inglesa a 22 kHz con licencia "other", lo que obliga a revisar los términos antes de cualquier uso comercial. La información publicada por el autor es muy escasa: no se detallan parámetros, contexto (no aplica a un TTS), idiomas más allá del inglés de LJSpeech ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer-TTS (MLP-Mixer / FastPitch acústico) + vocoder Griffin-Lim por defecto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto, no ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | inglés (checkpoints LJSpeech); el autor no declara lista oficial de idiomas |
| Licencia | other (requiere revisión de los términos del autor y del modelo original) |
| Formato de pesos | ONNX (`model.onnx`) + `config.json` + `vocoder.json` por voz |
| Frecuencia de muestreo | 22 kHz |
| Salida acústica | mel-espectrograma de 80 canales |
| Tamaño del repositorio | ~0,1 GB |
| Librería / runtime | phoonnx (ONNX Runtime) |

## Arquitectura y entrenamiento

La arquitectura es Mixer-TTS, una variante de FastPitch en la que los bloques de atención/FFN del encoder y del decoder se sustituyen por bloques MLP-Mixer (mezclas de tokens y de canales). El modelo acústico transforma una secuencia de texto en un mel-espectrograma de 80 canales a 22 kHz; la generación de la onda se delega a un vocoder, que por defecto es Griffin-Lim, un método de reconstrucción de fase sin entrenamiento neuronal. El pipeline es, por tanto, de dos etapas y determinista en su configuración por defecto.

Los checkpoints son un espejo de los publicados en `nipponjo/mixer-tts-pytorch`, entrenados sobre LJSpeech (corpus de un único hablante en inglés, dominio de lectura de libros). El autor no documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo ajuste fino con RLHF/DPO (algo, por otra parte, poco habitual en TTS acústico). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal; la única particularidad técnica destacable es la propia sustitución de atención por MLP-Mixer y el empaquetado ONNX nativo para phoonnx.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en inglés, con salida a 22 kHz.
- Generación de mel-espectrogramas de 80 canales mediante el modelo acústico Mixer-TTS.
- Reconstrucción de audio mediante vocoder Griffin-Lim por defecto (configurable a través de `vocoder.json`).
- Ejecución local en CPU mediante ONNX Runtime, sin dependencia de GPU.
- Soporte de múltiples voces mediante subcarpetas independientes, cada una con su propio `model.onnx` y configuración.
- Integración con el motor phoonnx y el ecosistema OpenVoiceOS.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking": es exclusivamente un modelo de síntesis.

## Casos de uso

- Asistentes de voz locales en dispositivos embebidos: el modelo ONNX se ejecuta en CPU y produce audio a 22 kHz, adecuado para Raspberry Pi o mini-PC que necesitan TTS sin conexión a Internet.
- Integración en el ecosistema OpenVoiceOS: al ser parte del espejo comunitario phoonnx, se puede enchufar directamente en instalaciones de OpenVoiceOS como voz inglesa por defecto o alternativa.
- Lectura de notificaciones y avisos del sistema: la voz de dominio LJSpeech (lectura de libros) funciona bien en textos cortos y neutros, como alertas, recordatorios o resúmenes.
- Pruebas y desarrollo de pipelines TTS: sirve como referencia ligera para comparar Mixer-TTS frente a otros modelos acústicos dentro de phoonnx, sin coste de GPU.
- Generación de audiolibros o contenido de lectura en inglés: el checkpoint LJSpeech está entrenado en lectura de libros, por lo que es el escenario más alineado con los datos de entrenamiento.
- Prototipado de interfaces de voz accesibles: permite validar flujos de conversación texto-a-voz en local antes de invertir en modelos neuronales de mayor calidad.
- Investigación en vocoders: al exponer el mel-espectrograma de 80 canales y permitir cambiar el vocoder vía `vocoder.json`, es útil para evaluar Griffin-Lim frente a vocoders neuronales sobre la misma salida acústica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB en total, la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no aplica de forma obligatoria; cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100 o H100) puede acelerar la inferencia, pero el autor no publica requisitos ni cifras.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño reducido del repositorio; también en CPU.
- Opciones de despliegue: phoonnx con ONNX Runtime (runtime previsto por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx-mixertts | Mixer-TTS + Griffin-Lim | no disponible | no aplica | other | ONNX | Hugging Face (phoonnx) |
| nipponjo/mixer-tts-pytorch (origen) | Mixer-TTS (PyTorch) | no disponible | no aplica | no disponible | PyTorch | GitHub / Hugging Face |
| Piper (rhasspy/piper-voices) | VITS | no disponible | no aplica | MIT (mayoría de voces) | ONNX | Hugging Face |
| Coqui TTS (voces VITS) | VITS / Tacotron | no disponible | no aplica | MPL 2.0 (código) | PyTorch / ONNX | GitHub / Hugging Face |

La comparación es cualitativa porque el autor no publica parámetros ni métricas. Frente a Piper o Coqui TTS, phoonnx-mixertts destaca por su integración nativa con phoonnx y por una licencia "other" que exige revisión, mientras que Piper ofrece un catálogo de voces mucho más amplio y Coqui TTS una comunidad mayor.

## Limitaciones y advertencias

- Licencia "other": es imprescindible revisar los términos del autor y del modelo original (nipponjo/mixer-tts-pytorch) antes de cualquier uso comercial o redistribución.
- Idioma limitado: los checkpoints proceden de LJSpeech, un corpus de un único hablante en inglés; no hay evidencia de soporte multilingüe ni de múltiples hablantes.
- Calidad de audio condicionada por Griffin-Lim: el vocoder por defecto produce audio de calidad inferior a los vocoders neuronales; la calidad final depende de la configuración de `vocoder.json`.
- Sesgos de dominio: al estar entrenado en lectura de libros, puede degradarse en textos con jerga, siglas, cifras o dominios muy alejados (conversación espontánea, nombres propios poco frecuentes).
- Sin datos de benchmarks ni de evaluación objetiva (MOS, WER) publicados por el autor.
- Riesgo de pronunciación incorrecta en palabras fuera del vocabulario de entrenamiento; no hay información sobre el modelo de normalización de texto incluido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, poca validación comunitaria y riesgo de falta de mantenimiento.
- No es un modelo de lenguaje: no admite razonamiento, tool calling ni generación de texto; cualquier expectativa en ese sentido es un error de uso.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/phoonnx-mixertts
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Modelo original Mixer-TTS en PyTorch: https://github.com/nipponjo/mixer-tts-pytorch
- Colección del espejo comunitario phoonnx: https://huggingface.co/collections/OpenVoiceOS/phoonnx-community-mirror-6a2204d302e0e7497870cd68
