# Phoonnx/vits-te_in-venkatesh-medium-espeak

## Resumen

vits-te_in-venkatesh-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en telugu (te-IN) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz concreta (venkatesh, variante medium) para un idioma con pocos recursos TTS abiertos, en un formato ONNX ligero y listo para desplegar en Python y en el ecosistema OVOS.

El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para entornos con recursos limitados, incluidos dispositivos de borde. No es un modelo de lenguaje generativo ni un sistema multimodal: es un sintetizador acustico especializado, con un front-end de texto que normaliza y fonemiza la entrada antes de la sintesis.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face y en la model card del autor; los datos no documentados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | telugu (te-IN) |
| Licencia | MIT |
| Formato de pesos | ONNX (libreria phoonnx) |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Voz | piper/te_IN-venkatesh-medium |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con aprendizaje adversarial, junto con alineamiento monotono para derivar la duracion de los fonemas. El modelo original fue entrenado por Rhasspy dentro de Piper y publicado en el arbol rhasspy/piper-voices/te/te_IN/venkatesh/medium; Phoonnx lo ha reempaquetado en ONNX para su libreria de inferencia.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el numero de horas de audio ni si se aplicaron tecnicas de ajuste fino adicionales. El front-end de texto delega en la libreria scriptconv, que normaliza el texto y aplica el fonemizador EspeakPhonemizer (modulo scriptconv_copyleft.phonemizers.mul, extra scriptconv[espeak]); la calidad de la fonemizacion depende de espeak-ng instalado en el sistema, y el autor advierte que la variante espyak puede producir diferencias foneticas y errores de pronunciacion en algunas palabras.

## Capacidades

- Sintesis de voz a partir de texto en telugu (te-IN), con salida en fichero WAV mediante la API de phoonnx.
- Conversion texto-a-fonemas via espeak-ng en alfabeto IPA, con normalizacion de texto previa mediante scriptconv.
- Integracion como plugin de TTS en OVOS (ovos-tts-plugin-phoonnx), configurable en mycroft.conf.
- Ejecucion en navegador mediante phoonnx.js, con demo en vivo.
- Inferencia ONNX, lo que permite despliegue en CPU sin GPU dedicada.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un sintetizador TTS.
- Cobertura limitada a un unico idioma y a una unica voz.

## Casos de uso

- Asistentes de voz en telugu: integracion como motor TTS en OVOS o en un asistente propio mediante la API de phoonnx, aprovechando que el modelo esta empaquetado especificamente para ese ecosistema.
- Lectura de contenido en aplicaciones moviles o web: sintesis de articulos o mensajes en telugu con un modelo ONNX de 0,1 GB que puede ejecutarse en el dispositivo sin conexion.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a audio en telugu con baja latencia y sin dependencia de servicios en la nube.
- Sistemas de anuncios y avisos automatizados: generacion de locuciones para transporte publico, comercios o servicios de atencion telefonica en telugu, donde basta una voz concreta y un coste de inferencia minimo.
- Prototipado de interfaces conversacionales: uso de la voz venkatesh-medium como base para validar flujos de voz en telugu antes de invertir en voces comerciales o en entrenamiento propio.
- Investigacion en TTS de bajos recursos: punto de partida para experimentos de adaptacion, evaluacion de fonemizacion espeak frente a espyak, o comparacion con otros sistemas Piper para lenguas dravidicas.
- Generacion de audiolibros o podcasts en telugu: sintesis por frases con phoonnx y concatenacion posterior de los WAV resultantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de 0,1 GB, la inferencia cabe holgadamente en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime es suficiente, aunque no es necesaria.
- Cabe en GPU consumer: si, en cualquier modelo (RTX 4090, RTX 3060, e incluso GPUs integradas), y tambien en CPU.
- Opciones de despliegue: libreria phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, y phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencia externa: es necesario instalar espeak-ng (por ejemplo, apt install espeak-ng) o el extra phoonnx[espeak] para la fonemizacion.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-te_in-venkatesh-medium-espeak (este modelo) | VITS | telugu (te-IN) | ONNX (phoonnx) | MIT | Hugging Face, 0 descargas, 0 likes |
| rhasspy/piper-voices te_IN venkatesh medium (upstream) | VITS | telugu (te-IN) | pesos Piper | MIT (segun model card upstream) | Hugging Face |
| Otras voces de la coleccion VITS de Phoonnx | VITS | varios idiomas | ONNX (phoonnx) | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-idioma (telugu) y mono-voz; no cubre otros idiomas ni variantes de habla.
- La calidad de pronunciacion depende de espeak-ng; con espyak pueden aparecer errores en algunas palabras, segun advierte el autor.
- No se documentan sesgos especificos, pero al derivar de un corpus de una unica voz, la salida refleja las caracteristicas de ese hablante.
- Riesgo de prosodia artificial o errores en texto no normalizado; el front-end scriptconv realiza normalizacion, pero no se detalla su cobertura.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar la licencia del upstream en rhasspy/piper-voices antes de redistribuir.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en produccion ni de validacion por la comunidad.
- No apto para tareas de razonamiento, codigo, vision ni generacion de texto; cualquier uso fuera de TTS queda fuera de su alcance.
- No se documentan limites de longitud de entrada por frase ni comportamiento con entradas muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-te_in-venkatesh-medium-espeak
- Upstream (Piper voices, te_IN/venkatesh/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/te/te_IN/venkatesh/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
