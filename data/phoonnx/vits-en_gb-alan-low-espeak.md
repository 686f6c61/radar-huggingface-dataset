# Phoonnx/vits-en_gb-alan-low-espeak

## Resumen

vits-en_gb-alan-low-espeak es un modelo de sintesis de voz (text-to-speech) de tipo VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede del proyecto Piper de Rhasspy, concretamente de la voz `en_GB/alan/low`, una voz masculina britanica de calidad baja optimizada para inferencia ligera. Phoonnx se limita a reempaquetar los pesos en formato ONNX y a adaptar la interfaz de uso, manteniendo la autoria original de Rhasspy.

La relevancia de este modelo radica en su tamano reducido (repo de 0,1 GB) y su naturaleza ONNX, que permite ejecutarlo en entornos con recursos limitados, incluidos navegadores mediante phoonnx.js. No es un modelo de proposito general ni compite con sistemas TTS neuronales de gran escala: es una voz concreta de un pipeline Piper, pensada para sintesis local, offline y de baja latencia en asistentes y aplicaciones embebidas.

El modelo toma como entrada fonemas espeak en alfabeto IPA (no texto plano directamente) y genera audio WAV. Su ambito linguistico se limita al ingles britanico (en-GB) y su integracion principal es el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; variante "low" del modelo Piper original) |
| Idiomas soportados | ingles britanico (en-GB) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional condicionado por alineamiento monotonico, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo para el entrenamiento. El resultado es un modelo que genera waveforms directamente a partir de fonemas sin necesidad de un vocoder separado.

En este caso, el modelo no ha sido entrenado por Phoonnx: procede de `rhasspy/piper-voices/en/en_GB/alan/low`, la coleccion de voces Piper de Rhasspy. La variante "low" indica una configuracion de menor calidad y menor coste computacional dentro de la escala de Piper (que suele ofrecer variantes low, medium y high). No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning adicional. La unica innovacion tecnica documentada por el empaquetador es el uso de fonemizacion espeak-ng (o su port espyak) mediante la libreria scriptconv para normalizar y convertir el texto a la entrada fonetica del modelo.

## Capacidades

- Sintesis de voz a partir de fonemas IPA generados por espeak-ng para ingles britanico.
- Generacion de audio WAV directamente mediante `voice.synthesize_wav(text, wav_file)`.
- Integracion con el ecosistema OVOS/Mycroft como plugin TTS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- Inferencia ONNX, apta para entornos CPU y despliegues ligeros.
- Voz masculina britanica ("alan") de calidad baja.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a en-GB.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` con la voz `piper/en_GB-alan-low`, ofreciendo sintesis offline sin dependencia de servicios en la nube.
- Lectura de notificaciones y respuestas en dispositivos embebidos (Raspberry Pi, routers, altavoces): su tamano de 0,1 GB y su formato ONNX permiten ejecutarlo en hardware con poca RAM y sin GPU.
- Sintesis en navegador: mediante phoonnx.js y la demo de tigregotico.pt/demo, se puede generar voz en el cliente sin enviar texto a un servidor, util para aplicaciones web de accesibilidad.
- Prototipado rapido de interfaces de voz: la instalacion con `pip install --pre phoonnx` y la carga de la voz permiten tener un pipeline TTS funcional en pocas lineas de Python.
- Generacion de audiolibros o avisos pregrabados en ingles britanico: la voz "alan" es adecuada para contenido narrado de caracter neutro, aunque la calidad "low" limita su uso en produccion de alta fidelidad.
- Pruebas de regresion en pipelines de TTS: al ser una voz determinista y ligera, sirve como referencia para validar cambios en la fonemizacion (espeak-ng frente a espyak) y en la normalizacion de texto de scriptconv.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en CPU sin GPU dedicada, aunque no se especifican cifras exactas.
- GPU recomendadas: no disponible; el modelo esta disenado para inferencia ligera y no requiere GPU.
- Compatibilidad con GPU de consumo: previsiblemente si (cualquier GPU con soporte ONNX Runtime), aunque no se documenta.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft.
- Latencia y throughput: no disponibles.
- Dependencia externa: espeak-ng debe estar instalado, o bien usar el extra `phoonnx[espeak]` que incluye el port espyak (con posibles diferencias foneticas que pueden provocar errores de pronunciacion).

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Calidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_gb-alan-low-espeak (este) | VITS | en-GB | low | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper en_GB (p. ej. variantes medium/high de Piper) | VITS | en-GB | medium/high | MIT (segun Piper) | ONNX | Hugging Face (rhasspy/piper-voices) |
| Modelos TTS neuronales de gran escala (p. ej. familias tipo XTTS o Bark) | variable | multilingue | alta | variable | variable | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Calidad de sintesis baja ("low"): adecuada para prototipos y entornos embebidos, no para produccion de audio de alta fidelidad.
- Ambito linguistico restringido a ingles britanico; no soporta otros idiomas ni acentos.
- Requiere fonemizacion previa con espeak-ng; el uso de espyak puede producir pronunciaciones incorrectas en algunas palabras.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede haber artefactos acusticos o pronunciaciones erroneas en palabras fuera del dominio de entrenamiento.
- Sesgos: no documentados en la informacion disponible; al ser una voz sintetica de un unico hablante, no representa diversidad de voces.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices y las condiciones de espeak-ng.
- Dependencia de la libreria phoonnx en version pre-release (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.
- Sin datos publicados de benchmarks, latencia ni throughput; la evaluacion en produccion requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-alan-low-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alan/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
