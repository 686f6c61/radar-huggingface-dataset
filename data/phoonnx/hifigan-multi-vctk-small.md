# Phoonnx/hifigan-multi-vctk-small

## Resumen

hifigan-multi-vctk-small es un vocoder neuronal basado en HiFi-GAN, originalmente desarrollado por Rhasspy dentro del proyecto Larynx y reempaquetado por Phoonnx en formato ONNX para su libreria de sintesis de voz `phoonnx`. Su funcion no es generar texto ni audio de forma autonoma: convierte espectrogramas mel producidos por un modelo acustico (en este caso, voces Glow-TTS de Larynx) en formas de onda de audio inteligibles. Es, por tanto, la ultima etapa del pipeline TTS.

El modelo es relevante en el ecosistema de TTS open source por su ligereza y su caracter multi-hablante: un unico vocoder sirve a decenas de voces en nueve idiomas (de, en, es, fr, it, nl, ru, sv, sw), lo que reduce el coste de despliegue de sistemas de sintesis de voz multilingues. El sufijo "small" indica una variante compacta de HiFi-GAN, pensada para inferencia en CPU o en hardware modesto.

La ficha se basa exclusivamente en la model card publicada por Phoonnx. No se dispone de detalles sobre el numero de parametros, el contexto de entrenamiento ni resultados de benchmarks, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HiFi-GAN (vocoder neuronal generativo), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa espectrogramas mel por segmentos, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | de, en, es, fr, it, nl, ru, sv, sw (via las voces que lo utilizan) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

HiFi-GAN es un vocoder generativo adversarial que transforma espectrogramas mel en audio mediante un generador convolucional con upsampling progresivo, entrenado con discriminadores multi-periodo y multi-escala. La variante "small" reduce la capacidad del generador respecto a las versiones V1/V2/V3 estandar, lo que disminuye el coste computacional a cambio de una fidelidad algo menor. En este repositorio el modelo se distribuye como grafo ONNX, lo que permite ejecucion portable sin dependencia de frameworks de deep learning pesados.

El modelo original forma parte del proyecto Larynx de Rhasspy y se entreno sobre el corpus multi-hablante VCTK, de ahi el sufijo "multi-vctk". No se dispone en la informacion proporcionada del numero de tokens, horas de audio, composicion exacta del dataset ni del uso de tecnicas de refinamiento posteriores. El empaquetado de Phoonnx anade metadatos y una integracion con su indice de voces, pero no modifica la arquitectura ni el entrenamiento del vocoder.

## Capacidades

- Conversion de espectrogramas mel a forma de onda de audio (vocoding) en tiempo de inferencia.
- Soporte multi-hablante: un mismo vocoder sirve a decenas de voces distintas de Larynx.
- Cobertura multilingue de nueve idiomas a traves de las voces asociadas: aleman, ingles, espanol, frances, italiano, neerlandes, ruso, sueco y suajili.
- Integracion automatica en el pipeline de `phoonnx`: la libreria descarga el vocoder junto con cada voz, sin paso de configuracion adicional.
- Ejecucion via ONNX Runtime, con portabilidad entre CPU y GPU.
- No soporta generacion de texto, razonamiento, codigo, tool calling, agentes ni vision: su unica funcion es la sintesis de audio a partir de espectrogramas.

## Casos de uso

- Sintesis de voz en asistentes locales: combinado con un modelo Glow-TTS de Larynx, permite generar respuestas habladas en el dispositivo sin conexion, aprovechando el formato ONNX para desplegar en Raspberry Pi o mini-PC.
- Lectura de textos en aplicaciones de accesibilidad: conversion de articulos o notificaciones a audio en varios idiomas usando las voces es-ES, en-US o de-DE disponibles en el indice de Phoonnx.
- Generacion de audiolibros y podcasts automatizados: el vocoder produce la forma de onda final a partir de los espectrogramas generados por el modelo acustico, con voces de calidad aceptable para contenido no comercial.
- Sistemas de megafonia y avisos en espacios publicos: la inferencia ligera en CPU permite generar anuncios pregrabados o dinamicos en multiples idiomas sin infraestructura GPU.
- Prototipado de pipelines TTS en investigacion: al ser un componente ONNX aislado, facilita experimentar con distintos modelos acusticos manteniendo fijo el vocoder y comparar calidad percibida.
- Localizacion de contenido multimedia: generacion de pistas de voz en varios idiomas (de, fr, it, nl, ru, sv, sw) para demos o materiales internos, reutilizando el mismo vocoder para todas las lenguas.
- Integracion en aplicaciones de domotica con Rhasspy: el ecosistema original de Larynx esta disenado para asistentes de voz autoalojados, y este vocoder encaja directamente en ese flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una variante "small" de HiFi-GAN exportada a ONNX, la huella es reducida y cabe holgadamente en GPU consumer, aunque no se especifica una cifra concreta.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA o DirectML); no se detallan modelos concretos en la informacion proporcionada.
- Compatibilidad con GPU consumer: si, por el tamano reducido del modelo y su formato ONNX; se espera funcionamiento en CPU para cargas de baja concurrencia.
- Opciones de despliegue: ONNX Runtime a traves de la libreria `phoonnx`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un vocoder.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| hifigan-multi-vctk-small (este) | Vocoder HiFi-GAN | no disponible | 9 | MIT | ONNX |
| HiFi-GAN V1 (original) | Vocoder HiFi-GAN | no disponible en esta ficha | entrenado por corpus | MIT | PyTorch |
| Parallel WaveGAN | Vocoder GAN | no disponible en esta ficha | entrenado por corpus | MIT | PyTorch |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia principal de este modelo frente a los vocoders genericos es su empaquetado ONNX listo para `phoonnx` y su asociacion con el catalogo multi-hablante de Larynx.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; solo convierte espectrogramas en audio.
- La calidad del audio final depende del modelo acustico que produzca el espectrograma; errores en Glow-TTS se propagan a la salida.
- Al ser una variante "small", la fidelidad puede ser inferior a la de vocoders HiFi-GAN de mayor capacidad; no hay metricas publicadas que lo cuantifiquen.
- Entrenado sobre VCTK, un corpus con hablantes mayoritariamente de ingles con acento britanico; puede haber sesgos de prosodia y timbre en otras lenguas.
- Riesgo de artefactos y ruido en segmentos largos o espectrogramas fuera de distribucion.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del proyecto Larynx original y de los corpus de voz subyacentes.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria.
- No se documentan limitaciones de longitud de contexto ni de idioma mas alla de los nueve idiomas listados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Coleccion de vocoders de Phoonnx: https://huggingface.co/collections/Phoonnx/vocoders-6af8eab202014765d7fce3c9
- Release original de Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/de-de_eva_k-glow_tts.tar.gz
- Repositorio de Larynx: https://github.com/rhasspy/larynx
