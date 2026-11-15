# Phoonnx/matcha-gl_es-brais_graphemes

## Resumen

matcha-gl_es-brais_graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Matcha-TTS, desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo genera audio a partir de texto en gallego (codigo `gl-ES`) y se distribuye como un artefacto ONNX listo para inferencia, lo que elimina la necesidad de reconstruir el grafo de PyTorch en produccion.

El modelo emplea una entrada basada en grafemas: el texto se normaliza y se convierte en caracteres directamente, sin pasar por un fonemizador fonetico, mediante el `GraphemePhonemizer` de la libreria scriptconv. Esta decision simplifica el pipeline de preprocesado y reduce dependencias, a costa de delegar en el modelo la resolucion de ambiguedades de pronunciacion.

Es relevante para desarrolladores que necesitan TTS en gallego dentro de asistentes de voz (OVOS), aplicaciones de accesibilidad o sistemas de lectura, con una licencia Apache 2.0 permisiva y un tamano de repositorio reducido (0,1 GB). No se dispone de datos publicados sobre numero de parametros, contexto ni rendimiento en benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (modelo acustico TTS no autorregresivo basado en flow matching) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en formato ONNX) |
| Idiomas soportados | gallego (`gl-ES`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | grafemas (caracteres del texto) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de sintesis de voz no autorregresiva que combina un encoder-decoder transformer con un decoder basado en flow matching para generar mel-espectrogramas, que posteriormente se convierten en forma de onda mediante un vocoder. El modelo empaquetado aqui corresponde al checkpoint `proxectonos/Nos_TTS-brais-matcha-graphemes` de Proxecto Nós, convertido a ONNX por Phoonnx.

La entrada del modelo son grafemas del texto gallego, procesados por el `GraphemePhonemizer` de scriptconv, que normaliza el texto y lo convierte en la secuencia de caracteres esperada por el modelo. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales mas alla del propio esquema de flow matching de Matcha-TTS.

## Capacidades

- Sintesis de voz a partir de texto en gallego (`gl-ES`), con entrada basada en grafemas.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- Normalizacion y conversion de texto mediante scriptconv antes de la sintesis.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada al gallego; no se declaran otros idiomas.
- No se documenta control de prosodia, emocion, velocidad ni estilo de voz.

## Casos de uso

- Asistentes de voz en gallego con OVOS: el modelo se integra como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `proxectonos/brais-matcha-graphemes` en `mycroft.conf`, permitiendo respuestas habladas en gallego en un asistente domestico.
- Lectura de contenido web o documentos: integrado en un pipeline de extraccion de texto (por ejemplo, articulos o noticias en gallego) y sintesis a WAV para generar versiones audio de contenidos.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a voz en gallego dentro de aplicaciones de escritorio o moviles que usen phoonnx como backend.
- Sistemas de anuncios y megafonia: generacion de avisos pregrabados o dinamicos en gallego para transporte publico, comercios o edificios, con un coste de inferencia bajo al ser un modelo de 0,1 GB.
- Prototipado rapido de aplicaciones de voz: al distribuirse en ONNX y con una API Python sencilla (`TTSModelManager`), permite validar ideas de producto TTS en gallego sin entrenar ni convertir modelos.
- Investigacion en TTS de lenguas minoritarias: sirve como referencia reproducible del pipeline Matcha-TTS con entrada de grafemas para el gallego, util para comparar con aproximaciones basadas en fonemas.
- Generacion de audiolibros o podcasts automatizados: sintesis por lotes de textos largos en gallego mediante scripts que recorran parrafos y llamen a `synthesize_wav`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,1 GB, por lo que el modelo es ligero y probablemente quepa en GPU consumer de gama baja, aunque no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el tamano reducido sugiere que podria ejecutarse en GPUs de gama de entrada, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| matcha-gl_es-brais_graphemes | Matcha-TTS | gallego | grafemas | ONNX | Apache 2.0 | Hugging Face (Phoonnx) |
| proxectonos/Nos_TTS-brais-matcha-graphemes | Matcha-TTS | gallego | grafemas | no disponible | Apache 2.0 | Hugging Face (Proxecto Nós) |
| Otros modelos Matcha-TTS de la coleccion Phoonnx | Matcha-TTS | varios | variable | ONNX | variable | Hugging Face (coleccion Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta gallego (`gl-ES`); no se declaran otros idiomas.
- La entrada basada en grafemas puede producir pronunciaciones incorrectas en palabras ambiguas o extranjerismos, al no existir un fonemizador fonetico intermedio.
- No se documentan sesgos especificos, pero al ser un modelo entrenado por un tercero (Proxecto Nós) sobre un corpus no descrito, pueden existir sesgos de voz, acento o registro no evaluados.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos o prosodia anomala en textos fuera de distribucion.
- No se documentan limitaciones de longitud de contexto ni de texto de entrada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del checkpoint upstream y de los datos de entrenamiento originales.
- El modelo se distribuye como ONNX y depende de phoonnx y scriptconv; cambios en estas librerias pueden afectar a la compatibilidad.
- No se documentan garantias de calidad ni evaluaciones formales (MOS, WER) en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-brais_graphemes
- Modelo upstream: https://huggingface.co/proxectonos/Nos_TTS-brais-matcha-graphemes
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
