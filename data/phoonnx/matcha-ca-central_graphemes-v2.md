# Phoonnx/matcha-ca-central_graphemes-v2

## Resumen

`matcha-ca-central_graphemes-v2` es un modelo de sintesis de voz (text-to-speech) en catalan central, basado en la arquitectura Matcha-TTS y empaquetado en formato ONNX para su uso con la libreria `phoonnx`. El modelo original fue desarrollado por BSC-LT (Barcelona Supercomputing Center - Language Technologies) bajo el nombre `BSC-LT/matxa-tts-v2-ca-central-graphemes`, y Phoonnx lo ha reempaquetado para su integracion en el ecosistema OpenVoiceOS (OVOS). El repositorio ocupa 0,3 GB y acumula 29 descargas.

La relevancia de este modelo radica en su enfoque de entrada por grafemas: en lugar de requerir una transcripcion fonetica previa, el front-end de texto utiliza `GraphemePhonemizer` de la libreria `scriptconv`, que normaliza y convierte el texto directamente en la secuencia de entrada del modelo. Esto simplifica el pipeline de sintesis y reduce dependencias externas de fonemizacion, un punto historicamente fragil en TTS para lenguas con menor cobertura de recursos.

Se trata de un modelo especializado y de nicho: un unico idioma (catalan, variante central), una unica voz disponible (`OpenVoiceOS/matxa-cat-central-graphemes-v2`) y una licencia GPL-3.0 que condiciona su uso en productos propietarios. Es adecuado para integraciones en asistentes de voz de codigo abierto y aplicaciones que ya operan dentro del ecosistema OVOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acustico no autorregresivo basado en flow matching; vocoder fused Wavenext) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | catalan (variante central, `ca`) |
| Licencia | GPL-3.0 (nota de licencia del empaquetado: apache-2.0 para el componente fused Wavenext) |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (grafemas) |
| Voces disponibles | 1 (`OpenVoiceOS/matxa-cat-central-graphemes-v2`) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de sintesis de voz no autorregresiva que emplea flow matching para generar espectrogramas mel de forma eficiente, evitando el coste de decodificacion iterativa de los modelos autorregresivos. El modelo acustico se combina con un vocoder de tipo Wavenext fusionado, que convierte la representacion mel en forma de onda de audio. La entrada textual se procesa mediante un front-end de grafemas (`GraphemePhonemizer` de `scriptconv`), que normaliza el texto y lo transforma en la secuencia de caracteres que consume el modelo, sin necesidad de un diccionario fonetico intermedio.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF o DPO. El modelo se distribuye unicamente como artefacto ONNX dentro del ecosistema phoonnx, lo que implica que los pesos han sido convertidos para inferencia y no se ofrece el checkpoint original en safetensors en este repositorio. El modelo upstream (`BSC-LT/matxa-tts-v2-ca-central-graphemes`) es la referencia para detalles de entrenamiento.

## Capacidades

- Sintesis de voz (text-to-speech) en catalan central a partir de texto plano.
- Entrada directa por grafemas: no requiere transcripcion fonetica manual.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion nativa con OpenVoiceOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Normalizacion de texto previa a la sintesis mediante `scriptconv`.
- Ejecucion en CPU o GPU a traves de ONNX Runtime (segun configuracion del entorno phoonnx).
- No soporta tool calling, agentes, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz de codigo abierto: integracion directa en OpenVoiceOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf`, lo que permite dotar de voz en catalan a un asistente domestico autoalojado.
- Lectura de contenidos en catalan: conversion de articulos, noticias o documentacion a audio para aplicaciones de accesibilidad o consumo en movilidad, con un pipeline simple de texto a WAV.
- Sistemas de anuncios y megafonia automatizada: generacion de mensajes hablados en catalan para transporte publico, comercios o eventos, donde se requiere una voz consistente y reproducible.
- Prototipado de interfaces conversacionales en catalan: uso del modelo para validar flujos de voz en productos dirigidos al mercado catalan antes de invertir en voces comerciales.
- Investigacion en TTS de bajos recursos: el enfoque de grafemas sirve como referencia para experimentar con sintesis en lenguas con escasez de diccionarios foneticos, comparando calidad frente a pipelines basados en fonemas.
- Educacion y aprendizaje de idiomas: generacion de ejemplos de pronunciacion en catalan central para materiales didacticos o aplicaciones de autoaprendizaje.
- Automatizacion de contenidos multimedia: narracion de videos o podcasts en catalan dentro de pipelines de produccion que ya usan Python y ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,3 GB, por lo que la huella en memoria es reducida y probablemente apta para inferencia en CPU, aunque no se especifican cifras oficiales.
- GPU recomendadas: no disponible. Al ejecutarse via ONNX Runtime, puede aprovechar GPU compatibles con dicho runtime, pero el autor no documenta modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el tamano reducido del artefacto sugiere que cabria en GPUs de consumo, pero no hay datos publicados.
- Opciones de despliegue: `phoonnx` (libreria principal), `ovos-tts-plugin-phoonnx` (plugin para OpenVoiceOS) y ONNX Runtime como backend de ejecucion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/matcha-ca-central_graphemes-v2` | Catalan central | Matcha-TTS + Wavenext | ONNX | GPL-3.0 | Hugging Face (phoonnx) |
| `BSC-LT/matxa-tts-v2-ca-central-graphemes` | Catalan central | Matcha-TTS | no disponible en esta ficha | GPL-3.0 (declarada upstream) | Hugging Face (BSC-LT) |
| Otros modelos de la coleccion Matcha-TTS de Phoonnx | Multiples idiomas | Matcha-TTS | ONNX | Variable por modelo | Hugging Face (coleccion Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma y variante dialectal (catalan central); el rendimiento en otras variantes del catalan no esta documentado.
- Una sola voz disponible, lo que limita la variedad expresiva y la personalizacion.
- Licencia GPL-3.0: el uso en productos propietarios o servicios cerrados puede quedar condicionado por las obligaciones de copyleft de esta licencia; conviene revisar el caso de uso con asesoria legal.
- La model card incluye una nota de licencia que menciona `apache-2.0` para el componente fused Wavenext, lo que introduce ambiguedad sobre el regimen licencial exacto del empaquetado; debe verificarse con el autor.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas en palabras extranas, siglas o neologismos no vistos durante el entrenamiento.
- No se documentan sesgos de generacion de voz (genero, edad, acento) ni evaluaciones de calidad subjetiva (MOS).
- El modelo se distribuye unicamente en ONNX; no se ofrece checkpoint original en este repositorio, lo que dificulta el reentrenamiento o ajuste fino desde este artefacto.
- Dependencia del ecosistema phoonnx y scriptconv: la API y el comportamiento del front-end de grafemas pueden cambiar entre versiones (se instala con `pip install --pre phoonnx`).
- Sin datos publicados de latencia, throughput ni requisitos minimos de hardware, lo que complica la planificacion de capacidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-ca-central_graphemes-v2
- Modelo upstream (BSC-LT): https://huggingface.co/BSC-LT/matxa-tts-v2-ca-central-graphemes
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
