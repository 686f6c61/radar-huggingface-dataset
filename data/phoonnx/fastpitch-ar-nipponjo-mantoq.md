# Phoonnx/fastpitch-ar-nipponjo-mantoq

## Resumen

fastpitch-ar-nipponjo-mantoq es un modelo de sintesis de voz (text-to-speech) en arabe basado en la arquitectura FastPitch, desarrollado originalmente por el autor nipponjo y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo no genera audio directamente: produce un espectrograma mel que posteriormente es convertido a forma de onda por el vocoder HiFi-GAN `hifigan-ar-nipponjo`, descargado de forma conjunta por la libreria.

El modelo resuelve la conversion de texto arabe a habla mediante un front-end fonetico especifico denominado "mantoq", que transforma el texto normalizado en fonemas codificados con el alfabeto Buckwalter. Esta cadena (fonemizador mantoq, FastPitch y vocoder HiFi-GAN) esta integrada en el ecosistema phoonnx y en el asistente OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.

Es relevante para proyectos que necesiten sintesis de voz en arabe con despliegue ligero sobre ONNX Runtime, sin dependencias de frameworks de deep learning pesados. El repositorio ocupa 0,2 GB y esta orientado a inferencia en CPU o GPU sin requisitos de entrenamiento. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los datos de entrenamiento originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (TTS acustico basado en transformer no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | other (sin licencia registrada; consultar la version upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

FastPitch es una arquitectura de sintesis de voz no autorregresiva derivada de FastSpeech 2, que predice duraciones de fonema y espectrogramas mel a partir de una secuencia de fonemas de entrada. En este caso, la entrada no es texto directo sino fonemas generados por el fonemizador `MantoqPhonemizer` del paquete `scriptconv_nonfree.phonemizers.ar`, codificados en alfabeto Buckwalter. La salida del modelo es un espectrograma que el vocoder HiFi-GAN `hifigan-ar-nipponjo` convierte en audio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el corpus arabe utilizado ni si se aplicaron tecnicas de alineamiento o ajuste fino adicionales. El modelo original procede de `nipponjo/tts-arabic-onnx` y ha sido reempaquetado por Phoonnx para su consumo mediante la libreria `phoonnx`, que gestiona la descarga del vocoder asociado y la integracion con el ecosistema OVOS. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz en arabe a partir de texto, mediante fonemizacion previa con el fonemizador mantoq.
- Generacion de espectrogramas mel que se convierten en audio mediante el vocoder HiFi-GAN `hifigan-ar-nipponjo`.
- Integracion con la libreria `phoonnx` en Python mediante `TTSModelManager` y el objeto `voice`.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion sobre ONNX Runtime, lo que permite despliegue en entornos sin frameworks de deep learning completos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al arabe.

## Casos de uso

- Asistentes de voz en arabe sobre OVOS: el modelo se integra mediante el plugin `ovos-tts-plugin-phoonnx` y permite dotar de voz a un asistente domestico o de escritorio configurando la voz `nipponjo/tts-arabic-fastpitch` en `mycroft.conf`.
- Lectura de contenido en arabe en aplicaciones de accesibilidad: conversion de articulos, notificaciones o mensajes a audio para usuarios con discapacidad visual, aprovechando la inferencia ONNX ligera.
- Generacion de avisos y locuciones pregrabadas: sintesis por lotes de mensajes de sistema, anuncios o prompts telefonicos en arabe, con la ventaja de no requerir servicios en la nube.
- Prototipado de interfaces conversacionales en arabe: uso del modelo como capa TTS en un pipeline de dialogo para validar experiencias de voz antes de invertir en un servicio de sintesis comercial.
- Sistemas de megafonia o anuncios automatizados: generacion de audio en tiempo de ejecucion para estaciones, comercios o transporte, donde el tamano reducido del repositorio (0,2 GB) facilita el despliegue en dispositivos locales.
- Investigacion en sintesis de voz arabe: uso del modelo como linea base o componente de comparacion en experimentos de TTS, dado que expone la cadena completa fonemizador, acustico y vocoder.
- Aplicaciones educativas de aprendizaje de arabe: reproduccion de frases y vocabulario con pronunciacion sintetizada para practicas de escucha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es reducida y compatible con GPU de gama baja o incluso CPU.
- GPU recomendadas: no se especifican; al ejecutarse sobre ONNX Runtime, puede funcionar en cualquier GPU compatible con CUDA o en CPU.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido del modelo, aunque no se documentan requisitos oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| fastpitch-ar-nipponjo-mantoq | FastPitch + HiFi-GAN | arabe | no disponible | other | ONNX |
| nipponjo/tts-arabic-onnx (upstream) | FastPitch + vocoder | arabe | no disponible | no disponible | ONNX |
| Modelos FastPitch de la coleccion Phoonnx | FastPitch | varios (segun modelo) | no disponible | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia figura como "other" y la model card indica que no hay licencia registrada; es imprescindible verificar la licencia del modelo upstream `nipponjo/tts-arabic-onnx` antes de cualquier uso comercial.
- El modelo solo soporta arabe; no es multilingue.
- Depende del fonemizador `MantoqPhonemizer`, incluido en el extra `scriptconv[ar-phonemizers]` del paquete `scriptconv_nonfree`, lo que puede implicar restricciones adicionales de licencia.
- Requiere un vocoder externo (`hifigan-ar-nipponjo`) para producir audio; sin el, la salida es solo un espectrograma.
- No se documentan datos sobre sesgos, calidad de la voz, cobertura dialectal del arabe ni robustez ante texto fuera de dominio.
- Riesgo de alucinacion fonetica o pronunciacion incorrecta en palabras no cubiertas por el fonemizador mantoq.
- No hay informacion sobre el entrenamiento, por lo que no se puede evaluar la representatividad del corpus ni posibles sesgos de genero o dialecto.
- El numero de descargas (21) y de likes (0) es muy bajo, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/fastpitch-ar-nipponjo-mantoq
- Modelo upstream: https://huggingface.co/nipponjo/tts-arabic-onnx
- Vocoder: https://huggingface.co/Phoonnx/hifigan-ar-nipponjo
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion FastPitch de Phoonnx: https://huggingface.co/collections/Phoonnx/fastpitch-6af8ea827005c1385348ed60
