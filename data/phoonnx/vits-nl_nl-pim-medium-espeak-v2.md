# Phoonnx/vits-nl_nl-pim-medium-espeak-v2

## Resumen

`vits-nl_nl-pim-medium-espeak-v2` es una voz de sintesis de voz (text-to-speech) en neerlandes de Flandes y Paises Bajos, empaquetada en formato ONNX para su uso con la libreria phoonnx. El modelo original fue entrenado por Rhasspy dentro del proyecto Piper y publicado en el repositorio `rhasspy/piper-voices`; TigreGotico Lda se ha encargado de la conversion a ONNX y de su publicacion bajo el identificador `Phoonnx`. No se trata de un modelo de lenguaje, sino de un modelo acustico VITS de un solo hablante que transforma fonemas IPA generados por espeak-ng en audio a 22050 Hz.

La relevancia de esta version concreta (`-v2`) radica en que sustituye a la publicacion anterior `Phoonnx/vits-nl_nl-pim-medium-espeak`: el autor original reentreno la voz sobre los modelos base de Piper 1.5 (commit `e9c8a39444`), de modo que el repositorio antiguo conserva los pesos previos y este incorpora los nuevos. Es un modelo ligero (grafo de 63,2 MB en fp32, repositorio de 0,1 GB) pensado para sintesis local de baja latencia, con un RTF medido de 0,042 en CPU de sobremesa, lo que lo hace apto para asistentes de voz embebidos y despliegues sin GPU.

Al estar bajo licencia CC0 1.0, tanto los pesos como la conversion pueden reutilizarse sin restricciones, incluido el uso comercial. El modelo forma parte del ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper 1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada limitada por frase) |
| Tipos de cuantizacion | fp32 (unica version publicada; int8 descartada por control de calidad) |
| Idiomas soportados | neerlandes (`nl-NL`) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak-ng (alfabeto IPA), voice `nl` |
| Puntuacion | entrenado con `, . ! ? : ;` (preservada en sintesis desde phoonnx 1.96.1a1) |
| Tamano del grafo | 63,2 MB (fp32) |
| Identificador de voz | `piper/nl_NL-pim-medium-v2` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior normalizante y un decodificador basado en flujo con un discriminador adversarial en entrenamiento. En el caso de Piper, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng con la voz `nl`, y la salida es una forma de onda a 22050 Hz. La calidad declarada es "medium" y el modelo tiene un unico hablante.

Los datos de entrenamiento no estan registrados en la tarjeta upstream. El autor original indica que la voz se ajusto fino (fine-tuning) a partir del modelo base `rdh` (calidad medium, `nl_BE`, un hablante flamenco, CC0), con MRD y SDP, y que requiere Piper 1.5 o superior. La tarjeta upstream cita como fuente de datos el repositorio `OHF-Voice/voice-datasets` bajo licencia CC0. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333. La conversion a ONNX realizada por TigreGotico no altera los pesos.

## Capacidades

- Sintesis de voz en neerlandes (`nl-NL`) a partir de texto, con fonemizacion previa mediante espeak-ng.
- Salida de audio mono a 22050 Hz en formato WAV.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) en la sintesis, lo que permite pausas y entonacion mas naturales en frases compuestas.
- Un solo hablante (voz `pim`), sin control de estilo ni de emocion.
- No soporta tool calling, function calling, agentes, vision ni audio de entrada: es exclusivamente un modelo TTS.
- Integracion con OVOS/Mycroft a traves de `ovos-tts-plugin-phoonnx`.

## Casos de uso

- Asistentes de voz locales en neerlandes: la voz puede integrarse en OVOS o Mycroft configurando `ovos-tts-plugin-phoonnx` con `piper/nl_NL-pim-medium-v2`, de modo que el asistente responda con audio sintetizado sin depender de servicios en la nube.
- Lectura de notificaciones y avisos en aplicaciones domoticas: el bajo coste computacional (RTF 0,042 en CPU) permite sintetizar mensajes cortos en tiempo real en dispositivos de gama baja.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en neerlandes para lectores de pantalla, con la ventaja de que el modelo es pequeno (63,2 MB) y puede distribuirse junto con la aplicacion.
- Generacion de audiolibros o contenido narrado en neerlandes: la preservacion de la puntuacion de clausula mejora la prosodia en parrafos largos, aunque la ausencia de control de estilo limita la expresividad.
- Pruebas de calidad (QA) de pipelines de ASR: el modelo sirve para generar audio de referencia en neerlandes que luego se transcribe con sistemas como nemo-parakeet-tdt-0.6b-v3, tal como se hizo en la validacion del propio repositorio.
- Prototipado rapido de interfaces conversacionales: al ejecutarse en CPU y sin GPU, permite iterar en el diseno de flujos de voz sin infraestructura dedicada.
- Sistemas de anuncios en transporte publico o comercios: sintesis de avisos pregrabados o dinamicos en neerlandes con latencia baja y sin coste por peticion.

## Benchmarks y rendimiento

Los unicos datos de validacion publicados son los del control de calidad del propio repositorio, medidos con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest y ejecutados en un Intel Core i9-11900H a 2,50 GHz con 4 hilos:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado del control | pass | no se publica |
| WER | 0,000 | 0,067 |
| Caracteres por segundo | 14,3 a 15,2 | - |
| Ratio de longitud int8/fp32 | - | 0,99 a 1,03 |
| Tamano del grafo | 63,2 MB | - |
| RSS pico | 264,6 MB | - |
| RTF (mediana de 3, 4 hilos) | 0,042 | - |

La copia int8 no se incluye porque no supero el umbral de calidad (diferencia de WER de 0,067 frente al limite de 0,05). No se han publicado resultados de benchmarks estandar (MOS, MCD, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para ejecucion en CPU.
- GPU recomendadas: no necesarias. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero no aporta ventaja significativa frente a CPU para este tamano de grafo.
- Cabe en cualquier equipo consumer: el grafo fp32 ocupa 63,2 MB y el RSS pico medido es de 264,6 MB, por lo que funciona en Raspberry Pi y portatiles de gama baja.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), con espeak-ng instalado como dependencia del fonemizador; integracion con OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: RTF 0,042 (mediana de 3 ejecuciones con 4 hilos) en un i9-11900H; es decir, sintetizar un segundo de audio requiere aproximadamente 42 ms de computo. El rendimiento en otros equipos no esta publicado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Hablantes | Tamano | Licencia | Formato |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-nl_nl-pim-medium-espeak-v2` | VITS (Piper 1.5) | nl-NL | 1 | 63,2 MB (fp32) | CC0 1.0 | ONNX |
| `rhasspy/piper-voices` (nl_NL/pim/medium, upstream) | VITS (Piper) | nl-NL | 1 | no disponible en la informacion | CC0 1.0 | Piper (ONNX) |
| `Phoonnx/vits-nl_nl-pim-medium-espeak` (version anterior) | VITS (Piper) | nl-NL | 1 | no disponible en la informacion | CC0 1.0 | ONNX |
| Otras voces Piper nl_NL (p. ej. `nl_NL-mls-medium`) | VITS (Piper) | nl-NL | variable | no disponible en la informacion | CC0 1.0 | ONNX |

La comparativa se limita a variantes del mismo linaje Piper, ya que no se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. La diferencia principal frente a la version anterior es el reentrenamiento sobre Piper 1.5; frente al upstream, esta version anade la conversion ONNX y el empaquetado para phoonnx.

## Limitaciones y advertencias

- Modelo de un solo hablante: no permite cambiar de voz, estilo ni emocion.
- Solo neerlandes (`nl-NL`); no soporta otros idiomas ni code-switching.
- La fonemizacion depende de espeak-ng; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- La version int8 no se publica por no superar el umbral de calidad (WER 0,067 frente al limite de 0,05), por lo que solo hay pesos fp32.
- Los datos de entrenamiento no estan registrados upstream, lo que limita la trazabilidad sobre sesgos acusticos o de dominio.
- Riesgo de prosodia artificial en frases muy largas o con estructuras sintacticas complejas, propio de los modelos VITS de calidad media.
- No es un modelo de lenguaje: no razona, no genera texto ni admite instrucciones; cualquier alucinacion se limita a errores de pronunciacion.
- Licencia CC0 1.0: sin restricciones para uso comercial, pero se recomienda atribuir a Rhasspy como autor original de los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-pim-medium-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/nl/nl_NL/pim/medium
- Version anterior: https://huggingface.co/Phoonnx/vits-nl_nl-pim-medium-espeak
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz upstream: https://github.com/OHF-Voice/voice-datasets
