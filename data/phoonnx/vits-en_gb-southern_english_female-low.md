# Phoonnx/vits-en_gb-southern_english_female-low

## Resumen

`vits-en_gb-southern_english_female-low` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. El modelo genera audio en inglés británico (en-GB) con una voz femenina de acento del sur de Inglaterra, en su variante de calidad "low", lo que se traduce en un tamaño reducido (0,1 GB en el repositorio) y una huella de inferencia mínima.

El modelo no se entrena desde cero en este repositorio: es una conversión y empaquetado del checkpoint original disponible en `rhasspy/piper-voices/en/en_GB/southern_english_female/low`. Su relevancia radica en que ofrece TTS neuronal de calidad aceptable en un formato ONNX listo para desplegar en entornos con recursos limitados, como asistentes de voz locales (OVOS), Raspberry Pi o aplicaciones de escritorio, sin depender de servicios en la nube.

La entrada de texto no es texto plano directo: el modelo espera fonemas en alfabeto IPA generados por espeak-ng, lo que lo hace dependiente de ese front-end fonemizador. Está pensado para integrarse en pipelines de TTS donde la normalización de texto y la fonemización las realiza `scriptconv`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con VAE + normalizing flows + decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual; procesa una frase por síntesis) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; variante "low" del checkpoint original) |
| Idiomas soportados | en-GB (inglés británico) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Autor original | Rhasspy (Piper) |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior y posterior variacional, normalizing flows y un decoder generativo basado en HiFi-GAN, entrenado con pérdida adversarial y una pérdida de reconstrucción sobre el espectrograma. Este diseño permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o ajuste fino preferencial. El modelo original proviene del proyecto Piper de Rhasspy, que entrena voces sobre corpus de dominio público, pero los detalles concretos de este checkpoint no están documentados en la información disponible. La innovación principal en este empaquetado es la conversión a ONNX y la integración con el front-end `scriptconv` para normalización y fonemización con espeak-ng.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico (en-GB), con voz femenina de acento del sur de Inglaterra.
- Generación de audio WAV mediante `synthesize_wav` en la API de `phoonnx`.
- Fonemización de entrada mediante espeak-ng (a través de `scriptconv.phonemizers.mul.EspeakPhonemizer`).
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante `phoonnx.js` con entrada espeak o Unicode.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada a en-GB; no cubre otros idiomas.

## Casos de uso

- **Asistentes de voz locales (OVOS):** el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf` con la voz `piper/en_GB-southern_english_female-low`, permitiendo respuestas habladas en un asistente doméstico sin conexión a internet.
- **Lectura de notificaciones y alertas en aplicaciones de escritorio:** gracias a su tamaño reducido (0,1 GB) y formato ONNX, puede empaquetarse dentro de una aplicación de escritorio y sintetizar mensajes cortos en tiempo real sin GPU.
- **Sistemas embebidos y Raspberry Pi:** la variante "low" y la inferencia ONNX permiten ejecutar TTS en dispositivos con poca memoria y sin aceleración hardware, útil para paneles informativos, domótica o terminales de punto de venta.
- **Generación de audiolibros o podcasts de bajo coste:** para contenidos en inglés británico con voz femenina, se puede procesar texto por frases y concatenar los WAV resultantes, siempre que se acepte la calidad "low" del modelo.
- **Prototipado de interfaces de voz:** desarrolladores que necesiten validar un flujo TTS en Python pueden usar `phoonnx` con este modelo para pruebas rápidas antes de invertir en una voz de mayor calidad.
- **Accesibilidad web:** mediante `phoonnx.js` y la demo en `tigregotico.pt/demo`, se puede integrar lectura de contenido en el navegador para usuarios con discapacidad visual, con la ventaja de que la inferencia ocurre en el cliente.
- **Pruebas de regresión en pipelines de TTS:** sirve como voz de referencia ligera para comparar cambios en el front-end de fonemización (`scriptconv`) sin consumir recursos de modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la variante "low", se espera que la inferencia quepa en menos de 1 GB de memoria, probablemente en el rango de cientos de MB.
- **GPU recomendadas:** no se especifican; el modelo está pensado para ejecución en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, etc.) puede ejecutarlo, pero no es necesario.
- **¿Cabe en GPU consumer?** Sí, con holgura; también en CPU y en dispositivos embebidos.
- **Opciones de despliegue:** `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato | Tamaño repo |
|---|---|---|---|---|---|---|
| vits-en_gb-southern_english_female-low (este) | VITS | en-GB | low | MIT | ONNX | 0,1 GB |
| Otras voces Piper en-GB (p. ej. `en_GB-alan-low`, `en_GB-alba-medium`) | VITS | en-GB | low/medium | MIT | ONNX | variable |
| Coqui TTS (modelos VITS) | VITS | multi | medium/high | MPL-2.0 / varias | PyTorch | ~100 MB+ |
| Bark | Transformer generativo | multi | high | MIT | PyTorch | varios GB |

La comparación detallada con alternativas concretas no está disponible en la información proporcionada; los datos de otras voces Piper y de Coqui/Bark son orientativos y no provienen de la documentación de este repositorio.

## Limitaciones y advertencias

- **Dependencia de espeak-ng:** la entrada debe ser fonemas IPA generados por espeak-ng; si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- **Calidad "low":** la variante low prioriza tamaño y velocidad sobre naturalidad; puede presentar artefactos y menor expresividad que variantes medium o high.
- **Idioma único:** solo en-GB; no soporta otros idiomas ni acentos.
- **Sesgos:** no documentados en la información disponible; al ser una voz sintética entrenada sobre un corpus concreto, puede reflejar sesgos prosódicos del dataset original.
- **Riesgo de alucinación:** en TTS se traduce en pronunciaciones incorrectas o entonación anómala ante texto fuera de dominio, siglas o nombres propios no cubiertos por espeak-ng.
- **Licencia MIT:** permite uso comercial, pero conviene verificar la licencia del checkpoint original en `rhasspy/piper-voices`, que el autor declara como MIT.
- **Sin soporte de texto plano directo:** requiere pipeline de normalización y fonemización (`scriptconv`), lo que añade dependencias en producción.
- **Fecha de creación futura:** el repositorio figura creado en 2026-11-14, dato que puede indicar un error de metadatos o una fecha planificada; conviene verificarlo antes de depender del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-southern_english_female-low
- Checkpoint original (Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/southern_english_female/low
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
