# Phoonnx/vits-shn-mms-norhsangpha-graphemes

## Resumen

`vits-shn-mms-norhsangpha-graphemes` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria de inferencia ONNX `phoonnx`. El modelo original fue desarrollado por NorHsangPha a partir de la familia MMS (Massively Multilingual Speech) de Meta, y esta adaptado especificamente al idioma shan (`shn`), una lengua tai hablada principalmente en Birmania y zonas limítrofes de Tailandia y China.

El modelo resuelve la sintesis de voz para una lengua de bajos recursos, ofreciendo una entrada de texto a nivel de grafemas (sin fonemizacion compleja) y salida de audio en formato WAV. Su relevancia radica en que amplia la cobertura de TTS a idiomas minoritarios dentro del ecosistema phoonnx, que integra estos modelos en asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

El repositorio es de tamano reducido (0,1 GB), lo que indica un modelo compacto tipico de VITS, adecuado para inferencia en CPU y dispositivos de bajos recursos. No se dispone de informacion publica sobre el numero exacto de parametros ni sobre el volumen de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX) |
| Idiomas soportados | shan (`shn`) |
| Licencia | other (sin licencia registrada; consultar la version upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (grafemas) |
| Front-end de texto | `GraphemePhonemizer` de `scriptconv` |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. Este diseno permite generar audio de forma directa y no autorregresiva, lo que se traduce en baja latencia de inferencia. El modelo se distribuye ya exportado a ONNX, lo que facilita su despliegue sin dependencias de frameworks de entrenamiento.

El modelo procede de la familia MMS de Meta, adaptada por NorHsangPha al shan. No se dispone de informacion sobre el numero de tokens de audio, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. La entrada de texto se procesa a nivel de grafemas mediante `GraphemePhonemizer`, lo que evita la necesidad de un lexico fonetico especifico del idioma, aunque puede limitar la precision en palabras con ortografia irregular.

## Capacidades

- Sintesis de voz a partir de texto en shan (`shn`).
- Entrada basada en grafemas, sin requerir fonemizacion manual.
- Salida de audio en formato WAV mediante la API de phoonnx.
- Integracion con el ecosistema OVOS a traves de `ovos-tts-plugin-phoonnx`.
- Inferencia en ONNX, compatible con ejecucion en CPU.
- Modelo monoidioma y monohablante (voz `hf_community/NorHsangPha/mms-tts-shn-Shan`).
- No soporta tool calling, agentes, vision ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- **Accesibilidad para hablantes de shan**: lectura en voz alta de textos digitales para personas con discapacidad visual o dificultades de lectura, usando la sintesis directa desde grafemas sin necesidad de un lexico fonetico.
- **Asistentes de voz en OVOS**: integracion como modulo TTS en asistentes domesticos mediante `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf` para respuestas habladas en shan.
- **Locucion automatizada de contenido**: generacion de narraciones para videos, audiolibros o podcasts en shan, aprovechando la inferencia ONNX de baja latencia.
- **Sistemas de anuncios publicos**: sintesis de mensajes dinamicos en entornos como transporte o comercio en regiones de habla shan, donde el modelo compacto (0,1 GB) puede ejecutarse en hardware modesto.
- **Preservacion linguistica**: creacion de corpus de audio sintetico en shan para documentacion, ensenanza o investigacion sobre la lengua, dado el escaso soporte TTS comercial para este idioma.
- **Prototipado de interfaces conversacionales**: desarrollo de demos y pruebas de concepto de aplicaciones de voz en shan sin depender de servicios en la nube, al poder ejecutar el modelo localmente en CPU.
- **Traduccion con salida de voz**: combinacion con un sistema de traduccion automatica para producir audio en shan a partir de texto en otros idiomas, usando el modelo como etapa final del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precision; por el tamano del repositorio (0,1 GB) se estima un consumo de memoria inferior a 1 GB en inferencia.
- **GPU recomendadas**: no se especifican; al ser un modelo ONNX compacto, puede ejecutarse en CPU y en GPUs consumer de gama baja.
- **Cabe en GPU consumer**: si, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria, aunque el dato no esta confirmado.
- **Opciones de despliegue**: `phoonnx` (Python y plugin OVOS). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-shn-mms-norhsangpha-graphemes | VITS | shan (`shn`) | ONNX | other (sin registrar) | Hugging Face (Phoonnx) |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios idiomas minoritarios | ONNX | variable | Hugging Face (Phoonnx) |
| MMS-TTS de Meta (upstream) | VITS | multilingue (incluye shn) | PyTorch | CC-BY-NC 4.0 (segun release upstream) | Hugging Face (facebook/mms-tts) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- **Licencia ambigua**: la model card indica "other" y senala explicitamente que no hay licencia registrada; es imprescindible verificar la licencia del release upstream (MMS de Meta) antes de cualquier uso, especialmente comercial.
- **Monoidioma y monohablante**: solo sintetiza shan con una unica voz; no hay variacion de hablante ni soporte multilingue.
- **Riesgo de pronunciacion incorrecta**: al usar entrada por grafemas sin fonemizacion, las palabras con ortografia irregular o prestamos pueden sintetizarse de forma imprecisa.
- **Sin datos de entrenamiento publicos**: se desconoce la composicion del corpus, lo que dificulta evaluar sesgos de acento, genero o dialecto.
- **Modelo de bajos recursos**: la calidad de sintesis puede ser inferior a la de sistemas comerciales entrenados con grandes volumenes de datos.
- **Sin benchmarks**: no hay metricas objetivas (MOS, WER) publicadas que permitan validar la calidad en produccion.
- **Dependencia del ecosistema phoonnx**: el uso esta ligado a la libreria `phoonnx` y `scriptconv`; no se documentan otras vias de inferencia.
- **Repo con 0 descargas y 0 likes**: sin validacion por parte de la comunidad, lo que anade incertidumbre sobre su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-shn-mms-norhsangpha-graphemes
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio MMS de Meta (upstream): https://huggingface.co/facebook/mms-tts
