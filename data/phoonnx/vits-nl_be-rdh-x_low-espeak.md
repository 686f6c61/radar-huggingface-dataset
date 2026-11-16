# Phoonnx/vits-nl_be-rdh-x_low-espeak

## Resumen

vits-nl_be-rdh-x_low-espeak es un modelo de síntesis de voz (text-to-speech) de la familia VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en neerlandés de Bélgica (`nl-BE`) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Se trata de una variante de tamaño `x_low`, la más ligera de la escala de Piper, pensada para despliegue en entornos con recursos limitados.

El modelo no es una novedad arquitectónica: es una reempaquetadura de un checkpoint ya existente en `rhasspy/piper-voices/nl/nl_BE/rdh/x_low`, adaptado al formato y a las convenciones de carga de Phoonnx. Su relevancia es práctica: permite integrar una voz neerlandesa-belga en pipelines de TTS en Python, en asistentes OVOS/Mycroft o en el navegador mediante phoonnx.js, con una licencia MIT permisiva.

El repositorio tiene un tamaño declarado de 0.0 GB y, en el momento de la consulta, no registra descargas ni likes, lo que sugiere un artefacto recién publicado o de nicho. La información técnica disponible procede exclusivamente de la model card y de los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantización | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | neerlandés de Bélgica (`nl-BE`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la librería `phoonnx`) |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Variante de tamaño | `x_low` (la más ligera de la escala Piper) |
| Pipeline | text-to-speech |
| Autor original | Rhasspy |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de TTS end-to-end que combina un codificador de texto, un prior variacional, un decoder generativo basado en flujo normalizador y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo genera directamente la forma de onda, sin necesidad de un vocoder externo separado. La variante `x_low` reduce el tamaño y el coste computacional en detrimento de la calidad respecto a variantes superiores de la escala Piper.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La model card indica únicamente el origen del checkpoint (`rhasspy/piper-voices/nl/nl_BE/rdh/x_low`) y que la entrada se realiza mediante fonemas espeak en IPA. El front-end de texto lo gestiona `scriptconv` mediante `EspeakPhonemizer`, que normaliza el texto y lo convierte a la representación fonética esperada por el modelo.

## Capacidades

- Síntesis de voz a partir de texto en neerlandés de Bélgica (`nl-BE`).
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Entrada fonética basada en espeak-ng (IPA), lo que permite control fino de la pronunciación si se proporcionan fonemas directamente.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de `phoonnx.js` (demo en tigregotico.pt/demo).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo TTS.
- No se documentan capacidades multilingües más allá del neerlandés belga.

## Casos de uso

- Asistentes de voz en neerlandés de Bélgica: integración en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente doméstico, seleccionando la voz en `mycroft.conf` con `{"voice": "piper/nl_BE-rdh-x_low"}`. La variante `x_low` es adecuada por su bajo coste en dispositivos de gama baja.
- Lectura de notificaciones y alertas: generación de avisos hablados en aplicaciones de domótica o sistemas de monitorización, donde la latencia y el consumo importan más que la naturalidad máxima.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual en entornos de habla neerlandesa-belga.
- Generación de audiolibros o podcasts de bajo coste: síntesis por frases de contenido textual largo, encadenando llamadas a `synthesize_wav` con el front-end `scriptconv` para normalizar números, abreviaturas y símbolos.
- Pruebas y prototipado de pipelines TTS: al ser un modelo ONNX ligero con licencia MIT y API Python sencilla, sirve para validar arquitecturas de TTS antes de escalar a voces de mayor calidad.
- Síntesis en el navegador: uso de `phoonnx.js` para generar voz en cliente sin backend, útil en aplicaciones web educativas o de accesibilidad en neerlandés belga.
- Generación de locuciones para videojuegos o demos: voces de relleno para prototipos con presupuesto de recursos muy ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de una variante `x_low` de VITS en ONNX, el modelo está diseñado para ejecutarse en CPU y en dispositivos de recursos limitados.
- GPU recomendadas: no se especifican; por el perfil del modelo, no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna e incluso en CPU, aunque no se documentan cifras concretas.
- Opciones de despliegue: librería `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` en navegador. Requiere `espeak-ng` instalado en el sistema (o el extra `phoonnx[espeak]` con el port espyak).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-nl_be-rdh-x_low-espeak (este) | VITS | nl-BE | variante `x_low` | MIT | ONNX (phoonnx) | Hugging Face, 0 descargas |
| Otras voces Piper `nl_BE` (p. ej. `nl_BE-rdh-medium`, `nl_BE-nathalie-*`) | VITS | nl-BE | `medium` / `low` / `x_low` | MIT (según Piper) | ONNX | Hugging Face (rhasspy/piper-voices) |
| Modelos TTS multilingües de gran escala (p. ej. XTTS, Bark) | variable | multilingüe | mucho mayor | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, RTF, WER) en la información proporcionada. La comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Cobertura lingüística restringida al neerlandés de Bélgica; no es un modelo multilingüe.
- Calidad limitada por la variante `x_low`, la más ligera de la escala Piper; previsiblemente inferior en naturalidad a variantes `medium` o `high`.
- Dependencia de `espeak-ng`: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera de vocabulario, nombres propios o texto no normalizado correctamente por `scriptconv`.
- Sesgos: no se documentan sesgos específicos, pero al ser un modelo entrenado sobre un corpus concreto puede reflejar las características de dicho corpus (no disponible).
- Licencia MIT permisiva para uso comercial, heredada del repositorio upstream `rhasspy/piper-voices`; conviene verificar la procedencia de los datos de entrenamiento originales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario limitados.
- No apto para tareas de razonamiento, generación de texto, código, visión ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_be-rdh-x_low-espeak
- Checkpoint upstream: https://huggingface.co/rhasspy/piper-voices/tree/main/nl/nl_BE/rdh/x_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
