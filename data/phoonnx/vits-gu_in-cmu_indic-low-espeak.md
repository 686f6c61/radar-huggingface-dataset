# Phoonnx/vits-gu_in-cmu_indic-low-espeak

## Resumen

vits-gu_in-cmu_indic-low-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado por Phoonnx en formato ONNX para su librería de inferencia TTS homónima. El modelo sintetiza voz en guyaratí (gu-IN) a partir de fonemas espeak en alfabeto IPA, y está pensado para su uso dentro del ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

Se trata de un modelo compacto (el repositorio ocupa aproximadamente 0,1 GB) orientado a síntesis de voz de baja latencia en entornos con recursos limitados, como asistentes de voz locales o dispositivos embebidos. No es un modelo de lenguaje generativo: es un sistema TTS condicionado a una única voz y un único idioma, con un front-end fonémico basado en espeak-ng.

Su relevancia actual radica en la disponibilidad de una voz guyaratí ligera y ejecutable en CPU mediante ONNX Runtime, integrable en asistentes de voz de código abierto sin depender de servicios en la nube. La licencia CC-BY-SA-4.0 permite uso comercial con atribución y compartir-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | guyaratí (gu-IN) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (librería phoonnx) |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es un modelo TTS end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo entrenado con pérdidas GAN, junto con alineamiento monotónico latente para aprender la correspondencia texto-audio sin supervisión explícita de duraciones. Esta arquitectura produce audio de forma directa desde fonemas, sin necesidad de vocoder externo.

El modelo concreto procede del voice pack `gu_IN/cmu-indic_low` del repositorio MycroftAI/mimic3-voices, derivado a su vez del corpus CMU Indic (fuente del dataset de entrenamiento). No se dispone de información sobre el número de tokens de audio, horas de entrenamiento, composición exacta del dataset ni si se aplicaron etapas de ajuste fino adicionales. El autor original es Mycroft AI; Phoonnx se limita al empaquetado en ONNX y a la integración con su pipeline de fonemización (scriptconv + espeak-ng).

## Capacidades

- Síntesis de voz en guyaratí (gu-IN) a partir de texto plano, con fonemización automática mediante espeak-ng.
- Generación de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Ejecución en CPU mediante ONNX Runtime, sin requisito de GPU.
- Integración con asistentes de voz OVOS/Mycroft a través de `ovos-tts-plugin-phoonnx`.
- Entrada fonémica directa en IPA (permite control fino de pronunciación si se proporcionan fonemas).
- No soporta tool calling, razonamiento, visión ni generación de texto: es exclusivamente un modelo TTS.
- Una única voz predefinida (`mimic3/gu_IN/cmu-indic_low`); no hay selección de hablante.

## Casos de uso

- Asistentes de voz locales en guyaratí: integración en OVOS/Mycroft mediante el plugin oficial para responder por voz en dispositivos domésticos sin conexión a internet, gracias a la inferencia ONNX en CPU.
- Lectura de notificaciones y alertas: síntesis de mensajes cortos en aplicaciones de accesibilidad o sistemas de megafonía para hablantes de guyaratí, con latencia baja por el tamaño reducido del modelo.
- Sistemas de información al ciudadano: kioscos o terminales de atención pública en Gujarat o comunidades diáspora que necesiten anuncios pregrabados dinámicamente en guyaratí.
- Prototipado de interfaces de voz: desarrollo y evaluación de pipelines TTS multilingües donde se necesita una voz guyaratí ligera como componente de un sistema mayor.
- Generación de audiolibros o contenido educativo de bajo coste: conversión de texto a voz para materiales didácticos en guyaratí, con la salvedad de la licencia CC-BY-SA-4.0 sobre el audio derivado.
- Pruebas de regresión en pipelines TTS: validación de front-ends de fonemización (espeak-ng frente a espyak) comparando la salida de esta voz como referencia.
- Investigación en TTS de bajos recursos: uso como baseline VITS para idiomas indoarios con corpus limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- RAM estimada: inferior a 1 GB para cargar el modelo (~0,1 GB de pesos) más el overhead de ONNX Runtime.
- GPU: no necesaria. Cualquier GPU compatible con ONNX Runtime (CUDA o ROCm) podría acelerar la inferencia, pero no se documenta soporte específico.
- Cabe holgadamente en cualquier equipo consumer, incluidas Raspberry Pi y dispositivos embebidos, siempre que se disponga de espeak-ng.
- Despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y phoonnx.js para navegador (con demo en tigregotico.pt/demo).
- Latencia y throughput: no disponibles en la información proporcionada. La naturaleza ligera del modelo sugiere inferencia en tiempo real o superior en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-gu_in-cmu_indic-low-espeak | VITS | gu-IN | CC-BY-SA-4.0 | ONNX | fonemas IPA (espeak) |
| Otras voces del catálogo Phoonnx VITS | VITS | varios | según voz | ONNX | fonemas IPA / unicode |
| Piper (rhasspy) | VITS | multilingüe | MIT (mayoría) | ONNX | fonemas espeak-ng |
| Coqui TTS (XTTS) | Transformer + VITS | multilingüe | CPML (no comercial en XTTS) | PyTorch | texto directo |

La comparación con Piper es la más directa: ambos empaquetan voces VITS en ONNX para inferencia local en CPU, aunque Piper ofrece un catálogo más amplio y una licencia habitualmente más permisiva. No se dispone de datos de calidad subjetiva (MOS) ni de benchmarks objetivos para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo de una sola voz y un solo idioma (guyaratí); no admite cambio de hablante ni multilingüismo.
- La calidad depende críticamente de espeak-ng: con el port espyak algunos fonemas difieren y pueden producir pronunciaciones incorrectas.
- Riesgo de errores de pronunciación en palabras fuera del vocabulario o con grafía ambigua, al depender de reglas fonémicas y no de un lexicón extenso.
- La licencia CC-BY-SA-4.0 es copyleft: obliga a atribución y a compartir bajo la misma licencia las obras derivadas, lo que puede afectar a la distribución comercial del audio generado. Conviene revisar la interpretación legal para cada caso de uso.
- No hay información publicada sobre sesgos acústicos, calidad subjetiva (MOS) ni evaluación perceptual; se desconoce el rendimiento real frente a voces comerciales.
- El modelo no genera texto ni razona; cualquier expectativa de uso como LLM es incorrecta.
- Repositorio con muy pocas descargas (20) y sin likes: ecosistema pequeño, menor probabilidad de mantenimiento activo o soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-gu_in-cmu_indic-low-espeak
- Repositorio upstream (MycroftAI mimic3-voices, gu_IN/cmu-indic_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/gu_IN/cmu-indic_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv (normalización y fonemización): https://github.com/TigreGotico/scriptconv
- phoonnx.js (inferencia en navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
