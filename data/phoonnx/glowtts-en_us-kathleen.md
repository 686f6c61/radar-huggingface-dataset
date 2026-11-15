# Phoonnx/glowtts-en_us-kathleen

## Resumen

glowtts-en_us-kathleen es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, originalmente desarrollado por Rhasspy como parte del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo genera espectrogramas a partir de fonemas IPA del ingles estadounidense, que posteriormente son convertidos en audio mediante el vocoder HiFi-GAN (hifigan-multi-vctk-small), descargado automaticamente junto con la voz.

Se trata de un modelo compacto: el repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues ligeros en entornos con recursos limitados, como asistentes de voz embebidos o sistemas OVOS/Mycroft. La entrada de texto no es texto plano directo, sino fonemas gruut en alfabeto IPA, procesados por la libreria scriptconv antes de llegar al modelo.

Su relevancia actual radica en su integracion con el ecosistema phoonnx y OVOS, que permite incorporar sintesis de voz local sin dependencias de servicios en la nube. No obstante, la licencia no esta registrada y el autor recomienda verificar la release upstream antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo generativo de espectrogramas basado en normalizing flows) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; verificar upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small |
| Entrada de texto | Fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz que emplea normalizing flows para modelar la distribucion conjunta de texto y espectrogramas, junto con un alineamiento monotono aprendido (Monotonic Alignment Search) que sustituye a los mecanismos de atencion tradicionales. Esta aproximacion permite una sintesis rapida y paralela, sin necesidad de alineamientos externos durante la inferencia. El modelo produce espectrogramas mel que luego son convertidos a forma de onda por el vocoder HiFi-GAN.

No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o ajuste fino. El modelo original fue publicado por Rhasspy dentro del proyecto Larynx v1.0, pero los detalles de entrenamiento no se detallan en la model card. La unica innovacion tecnica documentada es el reempaquetado en ONNX y la integracion con el pipeline de normalizacion y fonemizacion de scriptconv.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Generacion de espectrogramas mel mediante Glow-TTS y conversion a audio con HiFi-GAN.
- Procesamiento de entrada basado en fonemas gruut en alfabeto IPA.
- Integracion con la libreria phoonnx para Python.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalizacion y conversion de texto mediante scriptconv.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es exclusivamente TTS).
- Capacidad multilingue limitada a en-US.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se integra mediante el plugin `ovos-tts-plugin-phoonnx` y permite sintetizar respuestas del asistente sin conexion a servicios en la nube, configurando la voz `larynx/en-us-kathleen-glow_tts` en `mycroft.conf`.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo ONNX ligero (0,1 GB), puede empaquetarse dentro de aplicaciones de escritorio para leer en voz alta mensajes del sistema con baja latencia.
- Generacion de audiolibros o contenido narrado en ingles: el modelo puede sintetizar frases completas en en-US, adecuado para narracion automatizada de textos largos divididos en oraciones.
- Sistemas de accesibilidad para personas con discapacidad visual: sintesis local de texto a voz en entornos sin conectividad, integrable en lectores de pantalla o aplicaciones de asistencia.
- Prototipado rapido de interfaces conversacionales: gracias a la instalacion via pip (`pip install --pre phoonnx "scriptconv[gruut]"`), permite levantar un pipeline TTS funcional en pocos minutos para pruebas de concepto.
- Automatizacion de respuestas de voz en dispositivos IoT: el reducido tamano del modelo y el formato ONNX facilitan su despliegue en dispositivos con recursos limitados que necesiten emitir respuestas habladas en ingles.
- Generacion de avisos pregrabados en sistemas de telefonia o mensajeria: sintesis de mensajes cortos en en-US para su reproduccion en centralitas o sistemas de megafonia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo de 0,1 GB en ONNX, se estima un consumo muy bajo (inferencia en CPU viable), aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible; por el tamano del modelo, no requiere GPU dedicada y puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: previsiblemente si (cualquier GPU con soporte ONNX Runtime), aunque no se confirma en la documentacion.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. Se indica a continuacion una comparacion cualitativa basada unicamente en la informacion disponible:

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-en_us-kathleen | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | no aplica | Hugging Face (Phoonnx) |
| Modelos Piper (Rhasspy) | VITS | Multiples | ONNX | MIT (tipicamente) | no aplica | Hugging Face / GitHub |
| Modelos Coqui TTS | Varias (Tacotron, VITS, etc.) | Multiples | PyTorch | MPL 2.0 / otras | no aplica | GitHub / Hugging Face |
| Modelos Larynx originales | Glow-TTS / VITS | Multiples | Tar.gz / ONNX | Ver upstream | no aplica | GitHub (rhasspy/larynx) |

Nota: los datos de los modelos comparables no estan confirmados en la informacion proporcionada y se incluyen solo como referencia de categoria.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explicitamente que no hay licencia registrada y recomienda verificar la release upstream antes de usar el modelo, lo que supone un riesgo para uso comercial.
- Idioma unico: solo soporta en-US; no es adecuado para otros idiomas o variantes regionales.
- Entrada restringida a fonemas: el modelo espera fonemas gruut en IPA, por lo que requiere el pipeline de scriptconv para procesar texto plano; un uso directo sin normalizacion puede producir errores.
- Dependencia del vocoder: la calidad final depende de hifigan-multi-vctk-small, que se descarga por separado.
- Riesgo de alucinacion acustica: como todo modelo generativo de voz, puede producir artefactos o pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento.
- Sin datos de sesgos: no se ha publicado informacion sobre sesgos de genero, acento o demograficos en la voz sintetizada.
- Modelo antiguo: procede de Larynx v1.0 y ha sido reempaquetado; puede no recibir actualizaciones.
- Sin soporte de emociones ni control prosodico: no se documentan capacidades de estilo o entonacion controlada.
- Escaso soporte de la comunidad: 31 descargas y 0 likes en el momento de la consulta, lo que limita la disponibilidad de ayuda o ejemplos.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-kathleen
- Upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_kathleen-glow_tts.tar.gz
- Vocoder HiFi-GAN: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
