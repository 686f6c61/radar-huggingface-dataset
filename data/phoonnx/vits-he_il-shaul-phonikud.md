# Phoonnx/vits-he_il-shaul-phonikud

## Resumen

`Phoonnx/vits-he_il-shaul-phonikud` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el autor phonikud y empaquetado por Phoonnx para su librería de inferencia ONNX. El modelo está especializado en hebreo moderno (he-IL) y toma como entrada fonemas en alfabeto IPA generados por el fonemizador `PhonikudPhonemizer` de la librería `scriptconv`, no texto en bruto. Su propósito es ofrecer una voz TTS concreta (identificada como `phonikud/shaul`) lista para integrarse en asistentes de voz y sistemas de lectura en hebreo.

El modelo resuelve el problema de disponer de una voz hebrea empaquetada en formato ONNX, ejecutable sin depender de frameworks pesados de deep learning, dentro del ecosistema phoonnx y del asistente OVOS. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un checkpoint compacto adecuado para despliegue en entornos con recursos limitados, aunque el número exacto de parámetros no se detalla en la información disponible.

Es relevante para desarrolladores que necesiten TTS en hebreo con una licencia permisiva (MIT) y una integración directa vía `pip` en Python o como plugin de OVOS. La información publicada no incluye detalles sobre el dataset de entrenamiento, el número de tokens ni métricas de calidad subjetiva (MOS), por lo que la evaluación práctica deberá hacerse mediante pruebas directas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | hebreo (he-IL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas phonikud en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. Genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder neuronal separado en la inferencia, lo que simplifica el despliegue. En este caso, el modelo se distribuye convertido a ONNX, lo que permite ejecutarlo con el runtime de ONNX y con la librería phoonnx.

No se dispone de información sobre el número de horas de audio empleadas, la composición del corpus, el hablante de referencia (la voz se identifica como `shaul`) ni si se aplicaron técnicas de fine-tuning o adaptación sobre un checkpoint previo. El modelo procede del repositorio `thewh1teagle/phonikud-tts-checkpoints`, que actúa como upstream, pero la model card no detalla el proceso de entrenamiento. El front-end de texto es parte crítica del pipeline: `scriptconv` normaliza el texto hebreo y lo convierte a fonemas IPA mediante `PhonikudPhonemizer`, de modo que el modelo no acepta texto sin procesar.

## Capacidades

- Síntesis de voz en hebreo (he-IL) a partir de fonemas IPA generados por `PhonikudPhonemizer`.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración como plugin de TTS en el asistente de voz OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución sobre runtime ONNX, sin depender de PyTorch en inferencia.
- Voz única empaquetada: `phonikud/shaul`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es un modelo multilingüe: únicamente cubre hebreo.

## Casos de uso

- Asistentes de voz en hebreo sobre OVOS: el modelo se selecciona mediante la configuración `mycroft.conf` con el módulo `ovos-tts-plugin-phoonnx` y la voz `phonikud/shaul`, permitiendo respuestas habladas en hebreo en un asistente doméstico autoalojado.
- Lectura de textos en hebreo en aplicaciones de accesibilidad: integración en lectores de pantalla o herramientas de lectura que necesiten convertir documentos hebreos a audio mediante la API de phoonnx.
- Generación de audiolibros o contenido narrado en hebreo: el pipeline `scriptconv` + phoonnx permite procesar lotes de texto y generar ficheros WAV por fragmento.
- Sistemas de anuncios o notificaciones por voz en hebreo: al ejecutarse sobre ONNX y ocupar ~0,1 GB, puede desplegarse en dispositivos con recursos limitados para mensajes cortos.
- Pruebas de integración de TTS en pipelines de CI: la instalación vía `pip install --pre phoonnx "scriptconv[he]"` facilita la incorporación del modelo en tests automatizados de síntesis.
- Prototipado de interfaces conversacionales en hebreo: desarrolladores que necesiten una voz con licencia MIT para validar flujos de voz antes de invertir en modelos comerciales.
- Investigación en fonética hebrea: al trabajar a nivel de fonemas IPA, permite experimentar con transcripciones controladas y evaluar la correspondencia fonema-audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa ~0,1 GB, por lo que la huella de memoria en inferencia es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; al ejecutarse en ONNX, puede correr en CPU y en GPUs consumer sin requisitos especiales.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque no hay cifras oficiales de consumo.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, runtime ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-he_il-shaul-phonikud | VITS | he-IL | no aplica | MIT | ONNX | Voz única `phonikud/shaul`, empaquetado para phoonnx |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | no aplica | según modelo | ONNX | Misma librería, distintos idiomas y voces |
| Modelos TTS comerciales en hebreo | no disponible | he-IL | no aplica | propietaria | API | Sin datos comparativos publicados |

No se dispone de datos de rendimiento comparativo (MOS, RTF) entre este modelo y alternativas, por lo que la comparativa se limita a aspectos de licencia, formato y disponibilidad.

## Limitaciones y advertencias

- El modelo solo acepta fonemas IPA generados por `PhonikudPhonemizer`; pasar texto en bruto sin el front-end `scriptconv` producirá resultados incorrectos.
- Cobertura limitada a hebreo (he-IL); no es multilingüe.
- Voz única (`phonikud/shaul`); no hay variedad de hablantes en este paquete.
- No se han publicado métricas de calidad (MOS), sesgos del hablante ni evaluación de naturalidad.
- Riesgo de errores de pronunciación en palabras fuera del dominio de entrenamiento, nombres propios o neologismos, dado que la fonemización depende de `PhonikudPhonemizer`.
- Licencia MIT, lo que permite uso comercial, pero la model card remite a los términos del release upstream (`thewh1teagle/phonikud-tts-checkpoints`); conviene verificar dichos términos antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria disponible.
- No apto para tareas de razonamiento, código, visión o agentes; es exclusivamente un modelo TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-he_il-shaul-phonikud
- Upstream de checkpoints: https://huggingface.co/thewh1teagle/phonikud-tts-checkpoints
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
