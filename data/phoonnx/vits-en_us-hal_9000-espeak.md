# Phoonnx/vits-en_us-hal_9000-espeak

## Resumen

`vits-en_us-hal_9000-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original es de campwill, publicado como `campwill/HAL-9000-Piper-TTS`, y esta versión lo adapta al ecosistema phoonnx con entrada de fonemas espeak en alfabeto IPA. El modelo reproduce la voz de HAL 9000, el ordenador ficticio de la película *2001: A Space Odyssey*.

El modelo resuelve la conversión de texto en inglés estadounidense a audio con una voz característica y reconocible, orientado a aplicaciones de asistencia por voz, demos y proyectos creativos. Su tamaño de repositorio es de 0,1 GB, lo que indica un modelo compacto apto para despliegue en entornos con recursos limitados.

Es relevante por su integración con el stack phoonnx/OVOS, que permite usarlo tanto en Python como en el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, y por su licencia Apache 2.0, que facilita el uso comercial. No se dispone de información sobre el número de parámetros ni la longitud de contexto (concepto no aplicable a TTS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en (en-US) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma end-to-end a partir de fonemas, sin necesidad de un vocoder separado.

La entrada de texto se procesa mediante fonemización con espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`), generando fonemas en alfabeto IPA que alimentan al modelo. La normalización y conversión de texto la realiza la librería `scriptconv` mediante `EspeakPhonemizer`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo original fue entrenado por campwill y posteriormente empaquetado por Phoonnx para su ejecución en ONNX.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto.
- Generación de audio en formato WAV mediante `voice.synthesize_wav()`.
- Entrada basada en fonemas espeak en alfabeto IPA, lo que permite control fino de la pronunciación.
- Integración con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- Voz característica de HAL 9000, adecuada para aplicaciones creativas y demos.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistente de voz en OVOS: el modelo se integra como módulo TTS mediante `ovos-tts-plugin-phoonnx`, configurando la voz `piper_community/campwill/en-US_HAL-9000` en `mycroft.conf` para que el asistente responda con la voz de HAL 9000.
- Demos y proyectos creativos: reproducción de la voz de HAL 9000 en instalaciones artísticas, videojuegos o experiencias interactivas, gracias a su tamaño compacto (0,1 GB) y licencia Apache 2.0.
- Síntesis en navegador: mediante phoonnx.js se puede ejecutar el modelo en el cliente sin backend, útil para aplicaciones web de TTS con entrada espeak o unicode.
- Generación de audiolibros o narraciones con voz característica: el modelo convierte texto en inglés a audio WAV mediante `synthesize_wav`, apto para pipelines de generación por lotes.
- Pruebas de integración TTS en Python: la API de `TTSModelManager` permite cargar la voz y sintetizar frases para validar pipelines de voz en entornos de desarrollo.
- Accesibilidad y lectura de texto: conversión de texto a voz en inglés para aplicaciones de lectura asistida, con la ventaja de un modelo ligero que cabe en entornos con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo muy compacto que probablemente cabe en CPU y GPUs de gama baja, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio es plausible, pero no se dispone de datos oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia, el modelo pertenece a la colección VITS de Phoonnx, que agrupa otros modelos VITS empaquetados para la misma librería, pero no se detallan sus especificaciones ni rendimiento.

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_us-hal_9000-espeak | VITS | en-US | Apache 2.0 | ONNX | Hugging Face (Phoonnx) |
| Otros modelos de la colección VITS de Phoonnx | VITS | no disponible | no disponible | ONNX | Hugging Face (Phoonnx) |

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- La entrada debe ser texto en inglés o fonemas espeak en IPA; no acepta otras representaciones sin conversión previa.
- Si se usa espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- Es un modelo TTS: no realiza razonamiento, generación de texto, código ni tool calling.
- Riesgo de alucinación no aplica en el sentido habitual, pero puede producir pronunciaciones incorrectas ante entradas fuera de distribución o fonemas mal formados.
- No se dispone de información sobre sesgos de la voz ni sobre la calidad subjetiva (MOS) del audio generado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream `campwill/HAL-9000-Piper-TTS`, que la model card declara como Apache 2.0.
- El modelo reproduce la voz de un personaje ficticio (HAL 9000); su uso comercial podría estar sujeto a consideraciones adicionales de propiedad intelectual no cubiertas por la licencia del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-hal_9000-espeak
- Modelo upstream: https://huggingface.co/campwill/HAL-9000-Piper-TTS
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
