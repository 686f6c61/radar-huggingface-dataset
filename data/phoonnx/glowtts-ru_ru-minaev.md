# Phoonnx/glowtts-ru_ru-minaev

## Resumen

glowtts-ru_ru-minaev es un modelo de sintesis de voz (text-to-speech) en ruso empaquetado en formato ONNX por Phoonnx para su libreria de TTS basada en ONNX. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx v1.0, concretamente la voz `ru-ru_minaev`, que emplea una voz masculina de referencia para el ruso de Rusia (ru-RU). Phoonnx se limita a reempaquetar los pesos originales y a publicarlos junto con la integracion necesaria para su ecosistema, de modo que el modelo pueda ejecutarse mediante la libreria phoonnx y el plugin de TTS de OVOS.

Tecnicamente se trata de un sistema TTS en dos etapas: un modelo acustico Glow-TTS que genera un espectrograma a partir de fonemas IPA (obtenidos mediante el fonemizador gruut) y un vocoder HiFi-GAN (`hifigan-multi-vctk-small`) que convierte ese espectrograma en audio. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto pensado para inferencia ligera, incluso en entornos de asistente de voz embebidos.

La relevancia de esta ficha es practica: permite a desarrolladores hispanohablantes evaluar rapidamente si esta voz rusa empaquetada encaja en un pipeline de TTS para asistentes, lectura de textos o sistemas de accesibilidad, sin necesidad de entrenar ni convertir modelos desde cero. Al estar orientado a ONNX y a un ecosistema concreto (phoonnx/OVOS), su interes esta mas en la integracion y el despliegue que en innovaciones arquitectonicas recientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acustico) + HiFi-GAN (vocoder `hifigan-multi-vctk-small`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en TTS; la entrada es texto/fonemas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ruso (ru-RU) |
| Licencia | other (sin licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Glow-TTS, un modelo acustico de tipo normalizing flow que transforma secuencias de fonemas en espectrogramas mel. Glow-TTS se caracteriza por un alineamiento monotono y por permitir sintesis en una sola pasada sin necesidad de atencion autoregresiva, lo que reduce la latencia frente a modelos seq2seq clasicos. La salida del modelo acustico no es audio directamente: el vocoder HiFi-GAN (`hifigan-multi-vctk-small`) se encarga de convertir el espectrograma en forma de onda, y phoonnx lo descarga automaticamente junto con la voz.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o ajuste fino adicional. El modelo procede del release v1.0 de Larynx de Rhasspy, un proyecto orientado a voces TTS de codigo abierto para asistentes de voz; la voz `ru-ru_minaev` corresponde a un hablante concreto (Minaev) y esta entrenada para ruso de Rusia. La innovacion destacable en este empaquetado no es arquitectonica sino de distribucion: conversion a ONNX y publicacion con una interfaz uniforme dentro de phoonnx, con normalizacion de texto y fonemizacion delegadas a la libreria scriptconv mediante el fonemizador gruut.

## Capacidades

- Sintesis de voz en ruso (ru-RU) a partir de texto escrito, con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante el fonemizador gruut de scriptconv, con normalizacion de texto previa.
- Generacion de espectrogramas mediante el modelo acustico Glow-TTS y conversion a audio mediante el vocoder HiFi-GAN.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Uso programatico en Python mediante `TTSModelManager` de phoonnx, con carga de voces y sintesis a fichero WAV.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo de pensamiento: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada al ruso; no se documentan otras lenguas para esta voz.

## Casos de uso

- Asistente de voz en ruso sobre OVOS: el modelo se integra como plugin de TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente domotico o de escritorio responda en ruso con una voz masculina concreta, sin infraestructura adicional mas alla de la libreria phoonnx.
- Lectura de textos y articulos en ruso: mediante la API de Python de phoonnx se puede sintetizar un parrafo completo a WAV para generar audiolibros o versiones accesibles de contenido escrito, aprovechando la normalizacion de texto de scriptconv.
- Accesibilidad para personas con discapacidad visual: integrado en lectores de pantalla o aplicaciones de escritorio que necesiten una voz rusa ligera (repo de ~0,1 GB) y ejecutable en CPU mediante ONNX.
- Generacion de avisos y notificaciones habladas: en sistemas de megafonia o aplicaciones de mensajeria que requieran convertir cadenas cortas en audio en ruso con baja latencia, gracias a la naturaleza no autoregresiva de Glow-TTS.
- Prototipado de pipelines TTS multilingues: como una de las voces de la coleccion Glow-TTS de Phoonnx, sirve para validar una arquitectura comun de TTS (modelo acustico + vocoder + fonemizador) antes de incorporar otras lenguas.
- Pruebas de integracion en entornos embebidos: al distribuirse en ONNX y con un vocoder pequeno, es adecuado para experimentar con inferencia en dispositivos de recursos limitados o en contenedores sin GPU.
- Evaluacion comparativa de voces Larynx: permite a un equipo comparar la calidad y el comportamiento de la voz `ru-ru_minaev` frente a otras voces del catalogo sin tener que convertir manualmente los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) y el uso de ONNX, es plausible la inferencia en CPU, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible. No se especifican GPU concretas (A100, H100, RTX 4090, etc.) en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y el reducido tamano sugieren que podria ejecutarse en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: libreria phoonnx (Python) y plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Vocoder | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-ru_ru-minaev (Phoonnx) | Glow-TTS | ru-RU | hifigan-multi-vctk-small | ONNX | other (sin registrar) | Hugging Face, via phoonnx |
| Otras voces Larynx v1.0 (Rhasspy) | Glow-TTS | multiples | HiFi-GAN | tar.gz original | segun release upstream | GitHub Rhasspy/Larynx |
| Otras voces de la coleccion Glow-TTS de Phoonnx | Glow-TTS | varias | HiFi-GAN | ONNX | variable | Hugging Face (coleccion Phoonnx) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia: la model card indica `license: other` y advierte explicitamente de que no hay licencia registrada para este modelo; es imprescindible revisar el release upstream de Rhasspy/Larynx antes de cualquier uso, especialmente comercial.
- Idioma: la voz esta entrenada unicamente para ruso (ru-RU); no se garantiza un comportamiento correcto con texto en otros idiomas ni con code-switching.
- Dependencia de fonemizacion: la calidad depende del fonemizador gruut y de la normalizacion de texto de scriptconv; textos con numeros, abreviaturas o simbolos no normalizados pueden producir una pronunciacion incorrecta.
- Voz unica: se trata de una voz concreta (Minaev), sin control documentado de emocion, velocidad o estilo mas alla de lo que permita la interfaz de phoonnx.
- Riesgo de artefactos acusticos: como en cualquier TTS neuronal, pueden aparecer prosodias anomalas o artefactos en frases largas o con puntuacion atipica; no se documentan metricas de calidad (MOS) que permitan acotar el riesgo.
- Madurez y mantenimiento: el repositorio tiene muy pocas descargas (34) y ningun like en el momento de la consulta, lo que sugiere una adopcion limitada y menor probabilidad de soporte comunitario.
- Sin datos de entrenamiento publicados: no se puede evaluar el sesgo del corpus original ni la representatividad de la voz.
- No apto para tareas de lenguaje: no es un modelo de lenguaje; no debe emplearse para generacion de texto, razonamiento ni codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-ru_ru-minaev
- Release upstream (Rhasspy/Larynx v1.0, voz ru-ru_minaev): https://github.com/rhasspy/larynx/releases/download/v1.0/ru-ru_minaev-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
