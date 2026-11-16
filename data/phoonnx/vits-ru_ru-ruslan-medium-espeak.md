# Phoonnx/vits-ru_ru-ruslan-medium-espeak

## Resumen

vits-ru_ru-ruslan-medium-espeak es un modelo de sintesis de voz (text-to-speech) en ruso basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su libreria de inferencia ONNX homonima. El modelo convierte texto en ruso (ru-RU) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA, y esta pensado para su uso en asistentes de voz, sistemas de lectura y aplicaciones de sintesis embebida.

Se trata de un modelo compacto (el repositorio ocupa aproximadamente 0,1 GB) y esta distribuido en formato ONNX, lo que facilita su despliegue en entornos ligeros, incluidos navegadores y dispositivos de bajos recursos. Su integracion con el ecosistema OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx lo hace especialmente adecuado para asistentes de voz autoalojados.

La relevancia de este modelo radica en su licencia MIT, su reducido tamano y su empaquetado especifico para una libreria de inferencia ligera, lo que lo convierte en una opcion practica para proyectos que necesitan sintesis de voz en ruso sin depender de servicios en la nube. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | aproximadamente 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador generativo (tipicamente basado en flujos normales y un vocoder HiFi-GAN integrado). VITS produce audio de forma directa a partir de fonemas sin necesidad de un vocoder separado en tiempo de inferencia.

El modelo procede del catalogo rhasspy/piper-voices, en la ruta ru/ru_RU/ruslan/medium, y ha sido reempaquetado por Phoonnx para su libreria ONNX. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). La etiqueta "medium" hace referencia a la variante de tamano dentro del catalogo de Piper, pero no se detallan sus dimensiones exactas.

El front-end de texto utiliza la libreria scriptconv, que normaliza el texto y lo convierte en fonemas mediante el fonemizador EspeakPhonemizer del modulo scriptconv_copyleft.phonemizers.mul. Es necesario instalar espeak-ng en el sistema, ya que algunos fonemas generados por el port espyak difieren de los de espeak-ng y pueden provocar errores de pronunciacion.

## Capacidades

- Sintesis de voz en ruso (ru-RU) a partir de texto plano.
- Conversion de texto a fonemas IPA mediante espeak-ng y scriptconv.
- Generacion de audio en formato WAV mediante la API de phoonnx (voice.synthesize_wav).
- Integracion con OVOS a traves del plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- Inferencia en formato ONNX, apta para despliegues ligeros.
- No soporta tool calling, agentes, vision, audio de entrada ni modos de razonamiento (es un modelo exclusivamente TTS).

## Casos de uso

- Asistentes de voz autoalojados: el modelo se integra en OVOS mediante el plugin ovos-tts-plugin-phoonnx, permitiendo respuestas habladas en ruso sin depender de servicios en la nube.
- Lectura de textos y articulos: dado su bajo consumo de recursos, puede ejecutarse en servidores modestos para convertir articulos o documentos en audio.
- Sistemas de accesibilidad: sintesis de voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual en entornos de habla rusa.
- Notificaciones y avisos automatizados: generacion de mensajes de voz para sistemas de alerta, domotica o paneles informativos.
- Prototipado rapido de interfaces conversacionales: la instalacion via pip y la API sencilla de phoonnx permiten integrar TTS en pocas lineas de codigo.
- Aplicaciones web con sintesis en el navegador: phoonnx.js permite ejecutar el modelo directamente en el cliente, reduciendo la carga del servidor y la latencia de red.
- Educacion de idiomas: generacion de pronunciaciones en ruso para materiales didacticos o aplicaciones de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (aproximadamente 0,1 GB) sugiere un modelo muy ligero que probablemente cabe en CPU y en GPUs de gama baja, pero no se confirman cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del modelo es plausible su ejecucion en CPU, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). Requiere espeak-ng instalado en el sistema o el extra phoonnx[espeak].
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-ru_ru-ruslan-medium-espeak (este modelo) | VITS | ru-RU | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces de rhasspy/piper-voices | VITS | multiples | MIT (segun el autor original) | ONNX | Hugging Face (Rhasspy) |
| Modelos TTS comerciales (p. ej. servicios en la nube) | no disponible | multiples | propietaria | API | servicios en la nube |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta el idioma ruso (ru-RU); no es multilingue.
- Requiere espeak-ng instalado; el uso del port espyak puede provocar pronunciaciones incorrectas en algunas palabras.
- No se dispone de informacion sobre sesgos en los datos de entrenamiento ni sobre la calidad de la voz en distintos registros.
- Riesgo de alucinacion no aplicable en el sentido habitual de los LLM, pero puede producir pronunciaciones erroneas ante texto no normalizado o fonemas no cubiertos.
- El modelo esta pensado para sintesis de frases; no se documenta su comportamiento con entradas muy largas.
- Licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia original en rhasspy/piper-voices.
- No se dispone de informacion sobre latencia, calidad objetiva (MOS) ni rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ru_ru-ruslan-medium-espeak
- Modelo original (Rhasspy Piper): https://huggingface.co/rhasspy/piper-voices/tree/main/ru/ru_RU/ruslan/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
