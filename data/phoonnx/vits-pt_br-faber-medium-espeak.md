# Phoonnx/vits-pt_br-faber-medium-espeak

## Resumen

`vits-pt_br-faber-medium-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en portugues de Brasil (`pt-BR`) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su proposito es ofrecer sintesis de voz local, ligera y sin dependencia de servicios en la nube, integrable en asistentes de voz y aplicaciones de escritorio.

La relevancia de este empaquetado reside en su formato: los pesos se distribuyen como ONNX, lo que permite ejecucion en CPU sin GPU dedicada, y su integracion con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. El repositorio ocupa aproximadamente 0,1 GB, lo que lo situa en la categoria de modelos TTS de tamano reducido, adecuados para despliegues en dispositivos con recursos limitados.

Se trata de un modelo especializado y de alcance acotado: una unica voz (`faber`, de calidad `medium`) para un unico idioma, sin capacidades de clonacion de voz ni de sintesis multilingue. No es un modelo de lenguaje generativo, sino un sistema TTS condicionado por fonemas, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | portugues de Brasil (`pt-BR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Voz | `faber`, calidad `medium` |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz extremo a extremo que combina un codificador de texto, un prior variacional condicionado por alineamiento monotono (MAS, monotonic alignment search) y un decodificador generativo basado en flujos normalizadores y un discriminador adversarial. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder neuronal separado en tiempo de inferencia. El modelo original fue entrenado por Rhasspy como parte del conjunto de voces Piper y posteriormente reempaquetado por Phoonnx en formato ONNX.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento, el uso de RLHF/DPO ni detalles del proceso de entrenamiento en la informacion proporcionada. El front-end de texto delega en `scriptconv`, que normaliza el texto y lo convierte a fonemas mediante `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`. La calidad declarada de la voz es `medium`, lo que en la nomenclatura de Piper corresponde a un compromiso entre fidelidad acustica y velocidad de inferencia.

## Capacidades

- Sintesis de voz a partir de texto en portugues de Brasil (`pt-BR`).
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, con normalizacion de texto previa a cargo de `scriptconv`.
- Ejecucion en CPU mediante ONNX Runtime, sin requerir GPU.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision, audio de entrada ni clonacion de voz.
- Monolingue: no soporta otros idiomas distintos del portugues de Brasil.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en portugues de Brasil sin enviar texto a servicios externos, lo que preserva la privacidad del usuario.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ejecutarse en CPU con pesos ONNX de ~0,1 GB, puede integrarse en un proceso en segundo plano que sintetice mensajes cortos bajo demanda.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido textual en portugues de Brasil en entornos sin conexion, con latencia baja al no depender de red.
- Sistemas de megafonia o anuncios automatizados en entornos con recursos limitados (Raspberry Pi y similares): la inferencia ONNX en CPU permite desplegar el modelo en hardware embebido.
- Prototipado de interfaces conversacionales en portugues: permite validar flujos de voz completos antes de invertir en voces comerciales o modelos de mayor calidad.
- Pruebas de integracion en pipelines de CI/CD: al ser un modelo pequeno y determinista en su interfaz, sirve para verificar que el front-end de fonemizacion y el empaquetado OVOS funcionan correctamente.
- Demos web de sintesis de voz: `phoonnx.js` ejecuta las voces VITS en el navegador, permitiendo demostraciones interactivas sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta; el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime. El repositorio completo ocupa ~0,1 GB, por lo que el uso de memoria es reducido.
- GPU recomendadas: no disponibles; no se documenta un perfil de GPU especifico. Al ser un modelo ONNX de voz de calidad `medium`, puede ejecutarse en CPU sin aceleracion dedicada.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, aunque no es el escenario objetivo; tambien cabe en hardware embebido tipo Raspberry Pi.
- Opciones de despliegue: `phoonnx` (Python, con `pip install --pre phoonnx`), plugin `ovos-tts-plugin-phoonnx` para OVOS y `phoonnx.js` para navegador. Requiere `espeak-ng` instalado en el sistema, o bien el extra `phoonnx[espeak]` que incluye el port `espyak`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad de voz | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-pt_br-faber-medium-espeak` | VITS | pt-BR | medium | ONNX | MIT | Empaquetado para phoonnx/OVOS |
| Otras voces Piper `pt_BR` (p. ej. `rhasspy/piper-voices/pt/pt_BR/*`) | VITS | pt-BR | medium/high | ONNX | MIT (upstream) | Mismo origen; distintas voces y calidades |
| Modelos TTS neuronales comerciales (p. ej. servicios cloud) | variable | multilingue | alta | API | propietaria | Requieren red y no son locales |

La comparacion directa con modelos de la misma categoria dentro del ecosistema Piper es la mas relevante: este modelo es una voz concreta (`faber`, `medium`) del catalogo upstream de Rhasspy, reempaquetada. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monolingue: solo portugues de Brasil; no debe usarse con texto en otros idiomas.
- Voz unica: no permite seleccion de hablante ni clonacion de voz.
- Dependencia de espeak-ng: los fonemas se generan con espeak-ng; si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la model card.
- Riesgo de pronunciacion incorrecta en palabras con grafia ambigua, neologismos, siglas o nombres propios, dado el front-end basado en reglas de fonemizacion.
- Calidad `medium`: no orientada a produccion de audio de alta fidelidad ni a narracion profesional.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la procedencia upstream (`rhasspy/piper-voices`) y los terminos de espeak-ng, que es GPL y se distribuye como dependencia externa.
- Sin datos publicados de benchmarks, latencia ni evaluaciones subjetivas (MOS) en la informacion disponible.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-pt_br-faber-medium-espeak
- Upstream (Piper voices, pt_BR/faber/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_BR/faber/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
