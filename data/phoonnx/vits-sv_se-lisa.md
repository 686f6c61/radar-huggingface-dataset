# Phoonnx/vits-sv_se-lisa

## Resumen

vits-sv_se-lisa es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de wezzmeister, autor de la colección piper-voices, y ha sido reconvertido al formato ONNX para su uso con phoonnx, tanto en Python como en el ecosistema OVOS (Open Voice OS). Está especializado en sueco de Suecia (`sv-SE`) y su entrada de texto son fonemas espeak en alfabeto IPA.

El modelo resuelve la necesidad de voces TTS locales, ligeras y ejecutables en entornos sin GPU dedicada, algo habitual en asistentes de voz embebidos, domótica y sistemas domésticos. Su tamaño de repositorio (0,1 GB) y el formato ONNX lo sitúan en la categoría de voces compactas orientadas a inferencia en CPU. La licencia MIT y la disponibilidad pública en Hugging Face facilitan su integración en productos comerciales.

La relevancia actual del modelo radica en la combinación de una arquitectura consolidada (VITS, con decodificación adversarial condicionada y alineamiento monotónico) con un pipeline de fonemización mediante espeak-ng, lo que permite generar voz natural a partir de texto sueco con recursos mínimos. No obstante, se trata de una voz de nicho con muy poca tracción comunitaria (28 descargas, 0 likes) y sin documentación de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados) |
| Idiomas soportados | sueco de Suecia (`sv-SE`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un predictor de duraciones y alineamiento monotónico, un decodificador generativo condicionado por variables latentes y un discriminador adversarial multiperiodo entrenado conjuntamente. El resultado es un modelo que genera formas de onda directamente desde fonemas sin necesidad de vocoder externo, lo que reduce latencia y complejidad de despliegue.

El modelo original fue entrenado por wezzmeister dentro del proyecto piper-voices, orientado a voces ligeras para asistentes. La entrada de texto se realiza mediante fonemas espeak-ng en alfabeto IPA, gestionados por `EspeakPhonemizer` de la librería scriptconv. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO; estos datos no están publicados en la model card.

## Capacidades

- Síntesis de voz a partir de texto en sueco de Suecia (`sv-SE`), con salida en WAV mediante `voice.synthesize_wav`.
- Fonemización automática mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js, con demo en vivo disponible.
- Inferencia ONNX, apta para CPU sin GPU dedicada.
- No dispone de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz domésticos en sueco: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para leer respuestas del asistente en tiempo real, aprovechando el formato ONNX ligero y la licencia MIT.
- Domótica y altavoces inteligentes: generación de anuncios y confirmaciones en sueco en dispositivos con CPU de bajo consumo, sin necesidad de GPU.
- Lectura de notificaciones y correos: conversión de texto a voz en aplicaciones de accesibilidad para usuarios suecos, con entrada por frase y salida WAV directa.
- Síntesis en aplicaciones web: uso de phoonnx.js para generar voz en el navegador sin backend, útil en demos y prototipos interactivos.
- Generación de audiolibros o contenido narrado en sueco: procesamiento por lotes de frases con `synthesize_wav` para producir pistas de audio.
- Pruebas de integración en pipelines de CI: verificación automatizada de que el pipeline TTS produce audio válido antes de desplegar actualizaciones de asistentes.
- Prototipado de interfaces conversacionales en sueco: evaluación rápida de la calidad de voz antes de invertir en voces comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MOS, WER, MCD) ni comparativas con otras voces.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB de repositorio, se espera inferencia en CPU sin GPU.
- GPU recomendadas: no aplica; el modelo está orientado a ejecución en CPU. Cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no hay datos publicados.
- Cabe en GPU consumer: no disponible; presumiblemente sí por su tamaño, pero sin confirmación del autor.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin OVOS (`ovos-tts-plugin-phoonnx`), ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-sv_se-lisa (Phoonnx) | VITS | sv-SE | MIT | ONNX | Hugging Face, 28 descargas |
| Otras voces de piper-voices (wezzmeister) | VITS | varios | MIT (según release upstream) | ONNX | Hugging Face |
| Colección VITS de Phoonnx | VITS | varios | MIT | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas voces; la comparativa se limita a parametros estructurales y disponibilidad.

## Limitaciones y advertencias

- Calidad dependiente de espeak-ng: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras.
- Cobertura lingüística limitada exclusivamente al sueco de Suecia; no soporta otros idiomas ni cambio de voz.
- Sin datos de sesgos: no se ha publicado información sobre sesgos de género, acento o prosodia en la model card.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar prosodia incorrecta o artefactos en frases atípicas, nombres propios o texto no normalizado.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad (MOS, WER) para decidir su uso en producción frente a alternativas.
- Licencia MIT permisiva, pero conviene verificar los términos del release upstream (wezzmeister/piper-voices) para uso comercial.
- Tracción comunitaria muy baja (28 descargas, 0 likes): soporte y mantenimiento inciertos.
- Dependencia de librerías externas (phoonnx, scriptconv, espeak-ng) que deben instalarse correctamente; la versión `--pre` de phoonnx indica que la librería está en estado pre-release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sv_se-lisa
- Upstream (piper-voices de wezzmeister): https://huggingface.co/wezzmeister/piper-voices
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
