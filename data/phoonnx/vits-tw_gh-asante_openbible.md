# Phoonnx/vits-tw_gh-asante_openbible

## Resumen

vits-tw_gh-asante_openbible es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, originalmente entrenado por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo esta especializado en la variante asante del idioma twi (etiquetada como `tw-GH`, es decir, twi de Ghana), una lengua hablada principalmente en Ghana por varios millones de personas. El problema que resuelve es la generacion de audio de voz inteligible en una lengua de bajos recursos, donde las soluciones TTS comerciales apenas tienen cobertura.

El modelo es de tamano reducido (el repositorio completo ocupa aproximadamente 0,1 GB), lo que lo hace adecuado para despliegues ligeros, incluso en dispositivos con recursos limitados. La entrada de texto se procesa a nivel de caracteres (graphemes) mediante el fonemizador `GraphemePhonemizer` de la libreria scriptconv, sin conversion fonetica compleja. El modelo se distribuye bajo licencia CC-BY-SA 4.0, lo que permite uso comercial con atribucion y manteniendo la misma licencia en obras derivadas.

El modelo se integra con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, y tambien puede usarse de forma autonoma en Python a traves de `phoonnx.model_manager`. Su relevancia actual radica en la inclusividad linguistica: proporciona una voz sintetica funcional para twi en un formato ONNX portable y facil de desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por caracteres) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; el modelo card no detalla variantes de cuantizacion) |
| Idiomas soportados | twi de Ghana (`tw-GH`) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un decoder acustico basado en normalizing flows y un discriminador adversarial para el entrenamiento. VITS produce audio de forma directa a partir del texto, sin necesidad de un vocoder separado en la inferencia.

Los datos de entrenamiento provienen del corpus OpenBible, segun indica el nombre del modelo (`openbible`) y la model card. No se especifican en la informacion disponible el numero de horas de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en TTS). El modelo fue originalmente publicado por Coqui en la release v0.6.2 de sus modelos TTS y posteriormente convertido a ONNX por Phoonnx. La entrada de texto se procesa mediante un fonemizador basado en graphemes (`GraphemePhonemizer`), que normaliza el texto y lo convierte en la secuencia de entrada del modelo.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en twi de Ghana (`tw-GH`).
- Entrada de texto a nivel de caracteres (graphemes), sin requerir transcripcion fonetica manual.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS como plugin TTS (`ovos-tts-plugin-phoonnx`).
- Despliegue en formato ONNX, portable entre plataformas.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Sintesis de voz para asistentes en twi: el modelo puede integrarse en asistentes de voz (por ejemplo, via OVOS) para responder en twi de Ghana, aprovechando el plugin `ovos-tts-plugin-phoonnx` y su configuracion sencilla en `mycroft.conf`.
- Accesibilidad para hablantes de twi: conversion de texto digital (noticias, documentos, mensajes) a audio para personas con discapacidad visual o dificultades de lectura, dado que el modelo funciona con texto plano por caracteres.
- Lectura automatizada de contenido biblico y religioso: al estar entrenado sobre OpenBible, es especialmente adecuado para narrar pasajes y textos devocionales en twi con una pronunciacion coherente con ese dominio.
- Localizacion de aplicaciones y servicios: generacion de avisos, menus y notificaciones habladas en twi para aplicaciones moviles o sistemas embebidos, gracias al reducido tamano del modelo (0,1 GB) y al formato ONNX.
- Investigacion en TTS para lenguas de bajos recursos: servir como linea base reproducible y como punto de partida para fine-tuning o comparacion de tecnicas en twi, con licencia permisiva para uso academico y comercial.
- Educacion linguistica: produccion de material audio para aprendizaje de twi, con pronunciacion generada a partir de texto escrito y sin necesidad de grabaciones humanas.
- Sistemas de atencion al cliente en entornos multilingues: complementar flujos de atencion en ingles con respuestas habladas en twi para usuarios ghaneses, desplegando el modelo en servidores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (aproximadamente 0,1 GB) se trata de un modelo muy ligero que puede ejecutarse en CPU.
- GPU recomendadas: no se especifican; el modelo es lo suficientemente pequeno para ejecutarse en CPU y en GPU de gama baja, aunque no hay datos oficiales de rendimiento.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: libreria phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; el formato ONNX permite ejecucion con ONNX Runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-tw_gh-asante_openbible | twi de Ghana (`tw-GH`) | VITS (ONNX) | Texto por caracteres | CC-BY-SA 4.0 | Hugging Face (Phoonnx) |
| Modelos VITS de Coqui (genericos) | Multiples idiomas | VITS | Texto/fonemas | Varía por modelo | Coqui TTS, Hugging Face |
| Modelos TTS multilingues comerciales | Decenas de idiomas (habitualmente sin twi) | Variable | Texto/fonemas | Propietaria | APIs comerciales |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Cobertura linguistica limitada exclusivamente a twi de Ghana (`tw-GH`); no se documenta soporte para otras variantes del twi ni para otros idiomas.
- Riesgo de alucinacion en TTS: el modelo puede producir pronunciaciones incorrectas o artefactos acusticos ante texto fuera de dominio, abreviaturas o prestamos linguisticos no vistos en entrenamiento.
- Entrada basada en graphemes: al no usar fonemizacion linguistica especifica, la pronunciacion depende de la correspondencia grafema-sonido aprendida, lo que puede generar errores en palabras ambiguas.
- Sesgos potenciales derivados del corpus OpenBible: el estilo, vocabulario y prosodia pueden estar inclinados hacia registros religiosos y formales, con menor naturalidad en registros coloquiales.
- Restricciones de licencia: CC-BY-SA 4.0 exige atribucion y compartir obras derivadas bajo la misma licencia; el uso comercial es posible pero con esas condiciones.
- No se documentan datos de calidad objetiva (MOS, WER), latencia ni limites de longitud de texto de entrada en la informacion disponible.
- El repositorio tiene pocas descargas (29) y cero likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-tw_gh-asante_openbible
- Upstream Coqui TTS (release v0.6.2): https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--tw_asante--openbible--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
