# Phoonnx/vits-zh_tw-yt_female-espeak

## Resumen

vits-zh_tw-yt_female-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de colafly/piper_zh_tw y sintetiza voz femenina en chino tradicional de Taiwan (zh-TW) a partir de texto convertido a fonemas espeak en alfabeto IPA. El repositorio ocupa 0,1 GB, lo que refleja un modelo compacto orientado a inferencia ligera.

La relevancia de este modelo reside en su empaquetado para phoonnx, una libreria Python que ejecuta voces VITS en formato ONNX y que se integra con el ecosistema OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx. Esto permite desplegar sintesis de voz en chino taiwanes en asistentes locales, aplicaciones de escritorio y entornos sin GPU dedicada, con una licencia permisiva MIT.

El modelo no es un LLM ni un sistema multimodal: es un sintetizador acustico puro que transforma fonemas en forma de onda de audio. Su utilidad practica esta acotada a la generacion de voz en zh-TW y su integracion depende del front-end de texto (scriptconv con espeak-ng) que normaliza y convierte el texto de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto extenso) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | zh-TW (chino tradicional de Taiwan) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Autor original | colafly |
| Empaquetador | Phoonnx |
| Libreria de inferencia | phoonnx (Python) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un predictor de duracion, un flujo normalizador y un decoder generativo adversario, entrenado con perdidas de reconstruccion, adversariales y de alineamiento monotono. El modelo incluido en este repositorio es una conversion a ONNX del checkpoint original de colafly/piper_zh_tw, reempaquetado para la libreria phoonnx.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de horas de audio, el hablante concreto ni el proceso de ajuste fino. La model card solo indica que la autoria del modelo original corresponde a colafly y que el texto de entrada debe convertirse a fonemas espeak en alfabeto IPA mediante el front-end scriptconv (EspeakPhonemizer). El empaquetado para phoonnx no modifica la arquitectura, solo el formato y la integracion.

## Capacidades

- Sintesis de voz femenina en chino tradicional de Taiwan (zh-TW) a partir de texto.
- Conversion de texto a fonemas espeak en alfabeto IPA mediante scriptconv.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS a traves del plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador mediante phoonnx.js (demo en tigregotico.pt/demo).
- No soporta tool calling, agentes, razonamiento multi-paso ni vision: es un modelo TTS puro.
- No soporta otros idiomas distintos de zh-TW segun la informacion disponible.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en mycroft.conf mediante el plugin ovos-tts-plugin-phoonnx con la voz `piper_community/colafly/zh-TW_yt-chinese_female`, permitiendo respuestas habladas en chino taiwanes sin depender de servicios en la nube.
- Lectura de notificaciones y avisos en aplicaciones de escritorio en zh-TW: el modelo es lo bastante pequeno (0,1 GB) para empaquetarse junto a la aplicacion y sintetizar mensajes cortos en tiempo de ejecucion.
- Accesibilidad para usuarios con discapacidad visual que trabajen en chino tradicional de Taiwan: la sintesis local evita enviar texto a APIs externas y reduce la latencia.
- Generacion de locuciones para contenido educativo o divulgativo en zh-TW: se puede sintetizar texto previamente normalizado y convertir a WAV para su posterior edicion o montaje.
- Prototipado de interfaces conversacionales en navegador mediante phoonnx.js: la demo publica permite evaluar la calidad de la voz sin instalar dependencias.
- Pruebas de integracion en pipelines de TTS: al ser ONNX y MIT, el modelo se puede usar como referencia para validar front-ends de fonemizacion espeak o comparar latencias en entornos sin GPU.
- Sistemas de anuncios publicos o kioscos en Taiwan: sintesis local de frases fijas o variables con una voz femenina consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la naturaleza ONNX de VITS, la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en CPU y en navegador.
- GPU consumer: no requiere GPU dedicada; puede ejecutarse en CPU en equipos de escritorio y en navegador mediante phoonnx.js.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, phoonnx.js en navegador.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Dependencia externa: espeak-ng debe estar instalado (por ejemplo `apt install espeak-ng`) o bien instalarse el extra `phoonnx[espeak]`; con espyak algunos fonemas difieren y pueden producir pronunciaciones incorrectas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-zh_tw-yt_female-espeak (este) | VITS | zh-TW | MIT | ONNX | Hugging Face (Phoonnx) |
| colafly/piper_zh_tw (upstream) | VITS | zh-TW | no disponible en la informacion | Piper | Hugging Face (colafly) |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios | MIT (segun la coleccion) | ONNX | Hugging Face (Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo TTS puro: no realiza razonamiento, generacion de texto, codigo ni tareas multimodales.
- Solo soporta zh-TW; no se documentan otros idiomas.
- La calidad de pronunciacion depende de espeak-ng: con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se dispone de informacion sobre sesgos del hablante, dataset de entrenamiento ni evaluacion subjetiva de calidad (MOS).
- Riesgo de artefactos acusticos en textos fuera de dominio, aunque no se documenta explicitamente.
- Licencia MIT permisiva, pero la model card indica que el release upstream establece sus propios terminos; conviene revisar la licencia de colafly/piper_zh_tw antes de uso comercial.
- El repositorio tiene muy pocas descargas (21) y ningun like, por lo que la validacion comunitaria es escasa.
- Fechas de creacion y actualizacion del repositorio (2026) no son verificables en la informacion proporcionada.
- No se especifican requisitos de contexto ni limites de longitud de texto; el comportamiento con frases muy largas no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-zh_tw-yt_female-espeak
- Modelo upstream: https://huggingface.co/colafly/piper_zh_tw
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
