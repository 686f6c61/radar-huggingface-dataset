# Phoonnx/glowtts-sv_se-talesyntese

## Resumen

Glow-TTS para sueco (variante `sv-SE`) empaquetado en formato ONNX por Phoonnx a partir del modelo original de Rhasspy publicado en el repositorio Larynx v1.0. Se trata de un modelo de síntesis de voz (text-to-speech) que convierte fonemas IPA generados por gruut en un espectrograma mel, que posteriormente se convierte en audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`. El modelo está pensado para su uso dentro del ecosistema phoonnx y del asistente de voz OVOS/Mycroft.

La relevancia de esta ficha es limitada: se trata de un artefacto de empaquetado de un modelo preexistente, no de un modelo nuevo. Su interés principal es práctico, ya que permite ejecutar TTS en sueco con una pila Python basada en ONNX sin dependencias de PyTorch en tiempo de inferencia. El repositorio ocupa 0,1 GB y acumula 35 descargas en el momento de la consulta.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni el volumen de datos de entrenamiento en la documentación proporcionada. La model card se limita a describir el origen, la arquitectura y las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, text-to-spectrogram) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | sueco (`sv-SE`) |
| Licencia | `other` (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo basado en normalizing flows que modela directamente la distribución del espectrograma mel condicionada a una secuencia de fonemas. A diferencia de los sistemas TTS autorregresivos, Glow-TTS emplea un mecanismo de alineamiento monotónico (MAS) que permite generar el espectrograma en paralelo, lo que se traduce en una inferencia más rápida y estable. La entrada son fonemas IPA producidos por gruut; la salida es un espectrograma mel que se convierte en audio mediante el vocoder HiFi-GAN `hifigan-multi-vctk-small`.

No se dispone de información sobre el dataset de entrenamiento (número de horas, hablantes, composición), ni sobre si se aplicaron técnicas de ajuste como fine-tuning o RLHF. El modelo procede del release v1.0 del proyecto Larynx de Rhasspy, que entrenó voces para varios idiomas con esta misma arquitectura. La única innovación destacable en el empaquetado es la conversión a ONNX para su ejecución con phoonnx, lo que elimina la dependencia de PyTorch en producción.

## Capacidades

- Síntesis de voz en sueco (`sv-SE`) a partir de texto plano.
- Conversión de texto a fonemas IPA mediante gruut (incluido en el extra `scriptconv[gruut]`).
- Generación de espectrogramas mel y conversión a audio WAV mediante vocoder HiFi-GAN.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programático en Python a través de `phoonnx.model_manager.TTSModelManager`.
- No soporta tool calling, function calling, agentes, visión ni audio de entrada.
- No dispone de modo de razonamiento ni capacidades multilingües más allá del sueco.

## Casos de uso

- Asistentes de voz domésticos en sueco: el modelo se integra en OVOS/Mycroft como módulo TTS, permitiendo respuestas habladas en `sv-SE` en un asistente local sin conexión a servicios en la nube.
- Lectura de notificaciones y avisos: cualquier aplicación Python puede generar WAV a partir de texto sueco con `voice.synthesize_wav()`, útil para sistemas de alertas o domótica.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en sueco dentro de aplicaciones de escritorio o web que necesiten una voz local y ligera (0,1 GB).
- Generación de audiolibros o contenido narrado en sueco: el modelo permite sintetizar pasajes largos por fragmentos, aunque la calidad y naturalidad no están documentadas.
- Pruebas de integración y pipelines de CI: al ser un modelo ONNX pequeño, es adecuado para validar flujos TTS en entornos con recursos limitados o sin GPU.
- Investigación en TTS: sirve como referencia de una implementación Glow-TTS funcional en sueco para comparaciones con modelos más recientes (VITS, FastSpeech 2, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se estima un consumo inferior a 1 GB, aunque no hay confirmación oficial.
- GPU recomendadas: no disponible. El modelo está en ONNX y puede ejecutarse en CPU.
- Cabe en GPU de consumo: probablemente sí en cualquier GPU con más de 1 GB de VRAM, pero no está documentado.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| glowtts-sv_se-talesyntese (este) | Glow-TTS + HiFi-GAN | sv-SE | other | ONNX | Empaquetado por Phoonnx desde Larynx v1.0 |
| Otras voces Larynx (p. ej. en_US, de_DE) | Glow-TTS + HiFi-GAN | varios | other | ONNX / tar.gz | Mismo origen (Rhasspy), distinto idioma |
| VITS (p. ej. MMS-TTS de Meta) | VITS | multilingüe | CC-BY-NC | PyTorch / ONNX | Modelo más reciente, mayor calidad potencial, licencia no comercial |
| Piper (rhasspy/piper) | VITS | multilingüe | MIT (código) | ONNX | Sucesor de Larynx, mejor calidad y velocidad, pero no es el mismo modelo |

La comparativa se limita a alternativas del mismo ecosistema o categoría; no se dispone de datos de rendimiento objetivos para contrastar.

## Limitaciones y advertencias

- Licencia `other` sin texto registrado: el autor indica explícitamente que se consulte el release upstream antes de usar el modelo. Riesgo legal para uso comercial.
- Solo soporta sueco (`sv-SE`); no es multilingüe.
- No hay información sobre sesgos, calidad de voz, hablantes o dominio de entrenamiento.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario fonético.
- El modelo depende de gruut para la fonemización; errores en el front-end afectan directamente a la calidad de la síntesis.
- No se documentan límites de longitud de entrada; textos largos deberán fragmentarse.
- El vocoder se descarga por separado (aunque phoonnx lo gestiona automáticamente); verificar la licencia del vocoder `hifigan-multi-vctk-small`.
- Repositorio con muy pocas descargas (35) y sin likes: poca validación comunitaria.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-sv_se-talesyntese](https://huggingface.co/Phoonnx/glowtts-sv_se-talesyntese)
- [Repositorio upstream (Larynx v1.0, tar.gz)](https://github.com/rhasspy/larynx/releases/download/v1.0/sv-se_talesyntese-glow_tts.tar.gz)
- [Colección Glow-TTS en Hugging Face](https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3)
- [Vocoder HiFi-GAN multi-VCTK small](https://huggingface.co/Phoonnx/hifigan-multi-vctk-small)
- [phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [scriptconv (GitHub)](https://github.com/TigreGotico/scriptconv)
