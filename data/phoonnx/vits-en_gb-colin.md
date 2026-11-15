# Phoonnx/vits-en_gb-colin

## Resumen

vits-en_gb-colin es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la librería phoonnx. El modelo original fue entrenado por nardocolin y proviene del repositorio nardocolin/nardocolin-pipertts (variante "high"), mientras que el empaquetado y la distribución en Hugging Face corren a cargo de Phoonnx. Se trata de una voz concreta en inglés británico (en-GB), identificada internamente como `piper_community/nardocolin/en-GB_Colin`.

El modelo resuelve el problema de la conversión de texto a audio en inglés británico con un pipeline ligero y desplegable en local: recibe fonemas IPA generados por espeak-ng y produce una onda de audio WAV. Por su tamaño reducido (el repositorio ocupa aproximadamente 0,1 GB) y su formato ONNX, está pensado para inferencia en CPU y para integrarse en asistentes de voz, sistemas domóticos y aplicaciones embebidas sin necesidad de GPU.

Su relevancia actual radica en su integración con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite incorporar esta voz a asistentes de voz open source con muy poca configuración. La licencia CC-BY-4.0 facilita su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variante Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema de síntesis neuronal que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta. La variante concreta corresponde a un modelo del ecosistema Piper, empaquetado para phoonnx en formato ONNX optimizado para inferencia.

La entrada del modelo no es texto plano, sino fonemas en alfabeto IPA generados por espeak-ng (o por el port espyak incluido en el extra `phoonnx[espeak]`). La normalización y conversión del texto a fonemas la realiza la librería scriptconv mediante `EspeakPhonemizer`. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o ajuste fino adicional; la model card no detalla estos extremos.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés británico a partir de texto.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Conversión de texto a fonemas IPA con espeak-ng o espyak como front-end.
- Integración con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (voces VITS con entrada espeak o unicode).
- Inferencia en CPU gracias al formato ONNX y al reducido tamaño del modelo.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente de TTS.

## Casos de uso

- Asistentes de voz domésticos con OVOS: la voz se selecciona en `mycroft.conf` con el módulo `ovos-tts-plugin-phoonnx` y el identificador `piper_community/nardocolin/en-GB_Colin`, lo que permite dotar de habla en inglés británico a un asistente local sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: el modelo sintetiza frases cortas a WAV con baja latencia en CPU, adecuado para anuncios del sistema o avisos de monitorización.
- Sistemas de accesibilidad: conversión de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, con licencia CC-BY-4.0 que permite su redistribución con atribución.
- Integración en pipelines de CI/CD para pruebas de audio: generación determinista de muestras de voz en tests automatizados de asistentes o de procesamiento de audio.
- Prototipado de aplicaciones de voz en navegador: mediante phoonnx.js se puede ejecutar la voz en el cliente con entrada espeak o unicode, útil para demos interactivas.
- Dispositivos embebidos y Raspberry Pi: el tamaño reducido del repositorio (0,1 GB) y el formato ONNX permiten desplegar la voz en hardware de bajos recursos sin GPU.
- Generación de contenido educativo o audiolibros en inglés británico: síntesis por frases con pronunciación controlada mediante fonemas IPA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para ejecución en CPU con ONNX.
- GPU recomendadas: no disponible; no se requiere GPU para su funcionamiento típico.
- Cabe en GPU consumer: sí, aunque su despliegue habitual es en CPU; no se especifican requisitos de VRAM.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador. Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]` (port espyak).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| vits-en_gb-colin (este modelo) | VITS | en-GB | ONNX | CC-BY-4.0 | Fonemas IPA (espeak) |
| Otras voces VITS de la colección Phoonnx | VITS | variable | ONNX | variable | Fonemas IPA (espeak) |
| Modelos Piper originales (rhasspy/piper) | VITS | múltiples | ONNX | MIT (según voz) | Fonemas (espeak-ng) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta inglés británico (en-GB); no es multilingüe.
- La calidad de pronunciación depende del front-end de fonemas: con espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras.
- Requiere espeak-ng instalado o el extra `phoonnx[espeak]`; sin este componente el modelo no puede procesar texto.
- Es un modelo exclusivamente de TTS: no genera texto, no razona y no soporta herramientas ni agentes.
- No se han publicado métricas de calidad (MOS), datos de entrenamiento ni evaluaciones de sesgos; se desconoce el comportamiento ante acentos regionales, nombres propios o vocabulario técnico.
- Riesgo de artefactos o prosodia incorrecta en frases largas o con puntuación atípica, habitual en modelos VITS de este tamaño.
- Licencia CC-BY-4.0: permite uso comercial y modificación, pero exige atribución al autor original (nardocolin) y a Phoonnx por el empaquetado.
- El modelo tiene muy poca tracción (27 descargas, 0 likes) y fue publicado recientemente; no hay evidencia de uso en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-colin
- Repositorio upstream: https://huggingface.co/nardocolin/nardocolin-pipertts/tree/main/high
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
