# gcoli/whisper-large-v3-swiss-german-mit-coreml

## Resumen

Whisper Large-v3 Swiss German (MIT) en formato WhisperKit/CoreML es la conversión a Core ML del checkpoint `gcoli/whisper-large-v3-swiss-german-mit`, un ajuste fino de OpenAI Whisper Large-v3 orientado a reconocimiento automático de habla (ASR) de suizo alemán. El modelo transcribe audio en dialecto suizo alemán y produce texto en alemán estándar, no en grafía dialectal. Está empaquetado para ejecutarse en dispositivo sobre Apple Silicon mediante WhisperKit, la librería de Argmax para inferencia local de Whisper en macOS e iOS.

El modelo base es Whisper Large-v3, un transformer encoder-decoder de aproximadamente 1550 millones de parámetros con una ventana de contexto de audio de 30 segundos por segmento y vocabulario multilingüe. Esta conversión conserva la arquitectura y los pesos del ajuste fino, pero los traduce al formato Core ML para aprovechar la Neural Engine de los chips Apple (M1 en adelante). El bundle ocupa 3,1 GB e incluye el tokenizador para operar completamente offline.

Su relevancia es práctica: permite transcripción de suizo alemán en local, sin enviar audio a servicios en la nube, con licencia MIT y un rendimiento medido (22,8 % WER) ligeramente mejor que el Whisper Large-v3 sin ajustar (23,6 % WER) sobre el conjunto de test FHNW/i4ds. La contrapartida es un coste de primera carga elevado (15-19 minutos en un M1 Max) por la especialización del encoder para la Neural Engine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large-v3), convertido a Core ML |
| Parametros totales | no disponible (Whisper Large-v3 tiene aproximadamente 1550 M; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s por segmento) |
| Tipos de cuantizacion | no disponible (bundle Core ML; no se detallan precisiones por componente) |
| Idiomas soportados | gsw (suizo aleman), de, en, fr, it |
| Licencia | MIT |
| Formato de pesos | Core ML (bundle WhisperKit); tokenizer.json y tokenizer_config.json incluidos |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper Large-v3: un encoder que procesa espectrogramas mel y un decoder autorregresivo que genera tokens de texto, con atención multi-cabeza estándar y mecanismos de Whisper para marcas de tiempo y detección de idioma. El ajuste fino del checkpoint original se orientó a suizo alemán, con datos de entrenamiento bajo licencia MIT según la model card (conjunto de datos FHNW/i4ds), partiendo de `openai/whisper-large-v3` (Apache-2.0). No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

La conversión a Core ML se realizó con `argmaxinc/whisperkittools` (commit `84f77a8`) y coremltools 9.0, a partir del checkpoint `gcoli/whisper-large-v3-swiss-german-mit` en el commit `c27284d`. Los tests del conversor reportan una fidelidad alta entre PyTorch y Core ML: 52,1 dB PSNR en el decoder de texto, 51,7 dB en el encoder de audio y 67,4 dB en el espectrograma mel. La innovación destacable es la especialización del encoder de audio para la Neural Engine en la primera carga por dispositivo, que reduce la latencia en usos posteriores (cargas posteriores de aproximadamente 1 s).

## Capacidades

- Reconocimiento automático de habla (ASR) de suizo alemán, con salida en alemán estándar.
- Transcripción multilingüe para alemán, inglés, francés e italiano (francés e italiano no verificados en este bundle).
- Generación de marcas de tiempo y segmentación de audio, propias del pipeline de Whisper.
- Detección de idioma integrada en el decoder de Whisper.
- Ejecución completamente offline si se apunta el tokenizador al directorio del bundle.
- Inferencia en dispositivo sobre Apple Silicon mediante WhisperKit (macOS e iOS).
- No dispone de tool calling, function calling, capacidades de agente ni visión/audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en suizo alemán: el modelo convierte audio dialectal en alemán estándar, útil para actas y subtítulos internos en empresas suizas, con procesamiento local que evita enviar audio confidencial a la nube.
- Subtitulado de contenido audiovisual regional: integrado en un pipeline de postproducción, genera transcripciones con marcas de tiempo para vídeos en dialecto suizo, aprovechando la ventana de 30 s por segmento de Whisper.
- Aplicaciones de accesibilidad en macOS/iOS: dictado y transcripción en vivo para usuarios de habla suizo-alemana, ejecutándose en el dispositivo con WhisperKit y sin dependencia de conectividad.
- Documentación clínica o legal con requisitos de privacidad: al ser local y MIT, permite transcribir grabaciones sensibles sin salida de datos, siempre con revisión humana dado el riesgo de alucinación.
- Investigación lingüística y dialectología: permite generar corpus de texto estándar a partir de grabaciones dialectales para análisis comparativos entre los 17 dialectos cubiertos en el test set.
- Prototipado rápido en entornos Apple: desarrolladores que necesitan un baseline ASR para suizo alemán pueden desplegarlo con `whisperkit-cli` sin infraestructura GPU dedicada, a costa de la primera carga de 15-19 minutos.

## Benchmarks y rendimiento

Evaluación sobre 282 clips del FHNW/i4ds All Swiss German Dialects Test Set (MIT), estratificados sobre 17 dialectos, con `whisperkit-cli` 1.1.1 en un M1 Max, decodificación greedy y normalización estándar (minúsculas, sin puntuación, ß→ss).

| Modelo (Core ML) | WER | CER |
|---|---|---|
| Este bundle | 22,8 % | 11,9 % |
| `openai_whisper-large-v3` (sin ajuste) | 23,6 % | 12,0 % |
| Variante flash (turbo) | 24,7 % | 12,3 % |

El checkpoint original alcanza 22,1 % (dev) y 24,7 % (final) con CTranslate2 y beam 5. La model card advierte que se trata de una muestra y no del split dev/final de la model card del modelo fuente.

## Requisitos de hardware

- VRAM/espacio: bundle de 3,1 GB en disco; la inferencia usa memoria unificada en Apple Silicon, no VRAM dedicada de GPU discreta.
- Hardware objetivo: chips Apple M1 o superiores (probado en M1 Max); también iPhone/iPad compatibles con Core ML y Neural Engine.
- No está pensado para GPU NVIDIA ni CUDA; el formato Core ML no es portable a esos entornos sin reconversión.
- Despliegue: `whisperkit-cli` (versión 1.1.1 probada) y la librería WhisperKit; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia: primera carga de 15-19 minutos por dispositivo (especialización del encoder para la Neural Engine); cargas posteriores de aproximadamente 1 s. Throughput de transcripción no detallado en la información disponible.
- Alternativa más rápida: la variante flash (turbo) ofrece aproximadamente 3× velocidad con unos 2 puntos WER más de error.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test i4ds) | Licencia | Formato |
|---|---|---|---|---|---|
| Este bundle (Whisper Large-v3 Swiss German CoreML) | no disponible (base Large-v3) | 30 s por segmento | 22,8 % | MIT | Core ML |
| `openai/whisper-large-v3` | no disponible | 30 s por segmento | 23,6 % | Apache-2.0 | safetensors, Core ML, GGUF |
| Variante flash (turbo Swiss German CoreML) | no disponible | 30 s por segmento | 24,7 % | MIT | Core ML |
| Checkpoint fuente `gcoli/whisper-large-v3-swiss-german-mit` | no disponible | 30 s por segmento | 22,1 % (dev) / 24,7 % (final) | MIT | safetensors |

## Limitaciones y advertencias

- Whisper puede alucinar u omitir texto, especialmente con ruido, silencio, dialectos raros, hablantes solapados o vocabulario de dominio.
- El rendimiento medido corresponde a habla leída a partir de un prompt en alemán estándar; el habla espontánea en suizo alemán no está verificada y probablemente sea peor.
- El alemán estándar con acento suizo no se ha medido; francés e italiano no se han comprobado en este bundle.
- Desactivar el arrastre de contexto en grabaciones largas para mitigar alucinaciones (indicado en la model card del modelo fuente).
- No usar la salida como única base para decisiones de alto impacto; se requiere revisión humana.
- Obtener consentimiento antes de transcribir a personas.
- La primera carga es muy lenta (15-19 minutos) por la especialización del encoder; planificar el despliegue en consecuencia.
- La licencia MIT permite uso comercial, pero conviene revisar las licencias upstream (Apache-2.0 de Whisper, MIT de datos FHNW/i4ds y de WhisperKit/whisperkittools).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gcoli/whisper-large-v3-swiss-german-mit-coreml
- Modelo base: https://huggingface.co/gcoli/whisper-large-v3-swiss-german-mit
- Variante flash: https://huggingface.co/gcoli/whisper-large-v3-turbo-swiss-german-mit-coreml
- Whisper Large-v3 original: https://huggingface.co/openai/whisper-large-v3
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
