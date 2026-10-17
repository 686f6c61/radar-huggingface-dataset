# litert-community/Kokoro-82M

## Resumen

Kokoro-82M para LiteRT-LM es la conversión a formato `.litertlm` del modelo de síntesis de voz hexgrad/Kokoro-82M, empaquetada por la comunidad litert-community para el runtime de inferencia en dispositivo LiteRT-LM de Google. El modelo original es una arquitectura StyleTTS 2 con vocoder ISTFTNet de 82 millones de parámetros, capaz de generar voz a 24 kHz. Esta versión no cambia el modelo acústico: lo cuantiza a INT8 y lo empaqueta junto con los front-ends de texto en un único fichero autocontenido de 351 MB, sin dependencia de Python, red ni `espeak-ng`.

La relevancia de este artefacto es de despliegue, no de investigación: permite ejecutar TTS multilingüe de calidad cercana a servidor íntegramente en un teléfono Android o en un portátil, con un pico de memoria de aproximadamente 0,5 GB y una velocidad de síntesis entre 4 y 5 veces más rápida que el tiempo real en la GPU de un Galaxy S26. Incluye las 54 voces de Kokoro v1.0 y front-ends de normalización de texto y grafema-a-fonema para 9 idiomas o variantes: inglés americano y británico, español, francés, italiano, portugués brasileño, hindi, chino mandarín y japonés.

Se distribuye en dos ficheros con licencia Apache-2.0 (modelo y stack completo): una variante con el vocoder preparado para GPU y otra con operadores de desquantización explícitos para que XNNPACK en CPU genere audio limpio. La variante FP32 `.tflite` previa, solo en inglés y solo CPU, está movida a `legacy/` y marcada como obsoleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (modelo acústico) + vocoder ISTFTNet; empaquetado para LiteRT-LM |
| Parametros totales | 82 millones (modelo base hexgrad/Kokoro-82M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de text-to-speech, no de lenguaje) |
| Tipos de cuantizacion | INT8 (modelo acústico y vocoder); variante previa FP32 en `legacy/`, obsoleta |
| Idiomas soportados | ingles americano y britanico, espanol, frances, italiano, portugues brasileño, hindi, chino mandarin, japones (9 idiomas/variantes) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); `.tflite` FP32 en `legacy/` (deprecado) |
| Tamano de fichero | 351 MB por variante (`kokoro_int8_gpu.litertlm` y `kokoro_int8.litertlm`); repositorio completo 1,4 GB |
| Voces incluidas | 54 (Kokoro v1.0) |
| Frecuencia de muestreo de salida | 24 kHz, mono (WAV) |
| Runtime objetivo | LiteRT-LM (Google AI Edge) |
| Plataformas | Android (arm64), Linux, macOS |
| Backends | CPU (XNNPACK) y GPU (delegate LiteRT: OpenCL, WebGPU, Metal) |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M de hexgrad, un sistema TTS construido sobre StyleTTS 2 (paper arXiv:2306.07691) con un vocoder ISTFTNet (arXiv:2203.02395, referenciado en las etiquetas del repositorio). StyleTTS 2 combina difusión de estilo y entrenamiento adversario con modelos de lenguaje de voz grandes para generar prosodia y timbre; ISTFTNet sintetiza la forma de onda en el dominio de la transformada inversa de Fourier de corto plazo, lo que reduce coste computacional frente a vocoders puramente neuronales en el dominio temporal. El resultado es un modelo de 82 M de parámetros que produce audio a 24 kHz.

Esta publicación concreta no entrena ni ajusta el modelo: es una conversión de pesos y de grafo para LiteRT-LM. La cuantización a INT8 se aplica tanto al modelo acústico como al vocoder, con dos variantes de grafo: en la versión GPU las convoluciones del vocoder usan pesos INT8 con activaciones en coma flotante, ejecutables de forma nativa por el delegate de GPU en OpenCL, WebGPU y Metal; en la versión CPU/GPU se insertan operaciones de desquantización explícitas para que XNNPACK produzca audio limpio en CPU, a cambio de un mayor consumo de memoria. El bundle incorpora además los front-ends de normalización de texto (TN) y de conversión grafema-a-fonema (G2P) para los 9 idiomas soportados, de forma que no se requiere `espeak-ng` ni ningún proceso externo. No se documentan en la información disponible detalles sobre dataset de entrenamiento, número de tokens de audio, ni fases de RLHF o DPO del modelo original.

## Capacidades

- Sintesis de voz multilingue a 24 kHz en un unico idioma por inferencia, seleccionable con los parametros `--language` y `--voice`.
- Cobertura de 9 idiomas o variantes: ingles americano (`en-US`), ingles britanico, espanol, frances, italiano, portugues brasileño, hindi, chino mandarin y japones.
- Acceso a las 54 voces de Kokoro v1.0, con identificadores como `af_heart` (ingles americano femenino) o `jf_alpha` (japones femenino).
- Normalizacion de texto y G2P integradas para cada idioma, sin dependencias externas ni acceso a red.
- Inferencia totalmente en dispositivo, sin llamadas a servidor ni envio de texto a terceros.
- API de streaming en C++ mediante `OmniEngine` / `OmniSession` y `PushInputSource`, ademas de la herramienta de linea de comandos `omni_runner`.
- Ejecucion con aceleracion por GPU via el delegate de LiteRT (OpenCL, WebGPU, Metal) o en CPU con XNNPACK.
- No dispone de tool calling, function calling, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura por voz en aplicaciones Android: el bundle de 351 MB se puede empaquetar en la app y ejecutar con el delegate de GPU, ofreciendo sintesis 4-5 veces mas rapida que el tiempo real con un pico de unos 0,5 GB, sin pedir permisos de red ni depender de un servicio en la nube.
- Accesibilidad para personas con discapacidad visual: conversion de texto de pantalla, articulos o notificaciones a voz en 9 idiomas, con normalizacion de numeros, fechas y abreviaturas ya resuelta en el propio front-end de texto.
- Asistentes de voz sin conexion: al no requerir red ni `espeak-ng`, encaja en asistentes embebidos, navegadores de coche o dispositivos IoT donde la latencia de ida y vuelta a un servidor TTS es inaceptable.
- Audiolibros y contenido largo por lotes: la API de streaming de `OmniSession` permite ir entregando fragmentos de audio conforme se genera, util para pipelines de narracion que procesan documentos capitulo a capitulo.
- Aprendizaje de idiomas: al cubrir ingles britanico y americano, frances, italiano, portugues brasileño, hindi, mandarin y japones con multiples voces por idioma, sirve para generar ejercicios de escucha con distintos timbres y acentos sin contratar voces humanas.
- Videojuegos y experiencias interactivas: la generacion en dispositivo permite voces de PNJ dinamicas sin coste por caracter, con la opcion de elegir entre 54 voces para dar identidad sonora a cada personaje.
- Integracion en CI y entornos sin GPU: la variante `kokoro_int8.litertlm` funciona en CPU con XNNPACK, adecuada para servidores, runners de integracion continua o hardware antiguo donde no hay delegate de GPU disponible, asumiendo un pico de memoria de aproximadamente 1 GB o mas.
- Prototipado de doblaje y previsualizacion: generacion rapida de pistas de voz temporales en varios idiomas para maquetas de producto antes de recurrir a grabacion profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente aporta dos afirmaciones cualitativas:

| Metrica | Resultado declarado |
|---|---|
| Velocidad de sintesis | 4-5x mas rapido que tiempo real en la GPU de un Galaxy S26 |
| Memoria pico (variante GPU) | ~0,5 GB |
| Memoria pico (variante CPU) | ~1 GB o mas |
| Prueba de inteligibilidad | En un benchmark de 800 frases y 8 idiomas iguala o supera al Kokoro original ejecutado en servidor |
| Comparativa numerica (MOS, WER, RTF) | no disponible |

## Requisitos de hardware

- VRAM o memoria de trabajo estimada: aproximadamente 0,5 GB de pico con `kokoro_int8_gpu.litertlm` en GPU; aproximadamente 1 GB o mas con `kokoro_int8.litertlm` en CPU.
- GPU compatibles: cualquier dispositivo cuyo GPU delegate de LiteRT funcione sobre OpenCL, WebGPU o Metal; el fabricante cita explicitamente telefonos, tablets y portatiles, con un Galaxy S26 como referencia de rendimiento. No se listan modelos concretos de GPU de escritorio (A100, H100, RTX 4090, etc.) en la informacion disponible.
- CPU: la variante CPU/GPU funciona con XNNPACK en Linux, macOS y Android arm64.
- Cabe en GPU de consumo: si, en el sentido de que el modelo esta pensado para GPU integradas y moviles; no se dispone de datos de consumo en tarjetas de escritorio dedicadas.
- Almacenamiento: 351 MB por variante de modelo, 1,4 GB si se descarga el repositorio completo.
- Opciones de despliegue: runtime LiteRT-LM con la herramienta `omni_runner` (compilada con Bazel, con `--config=android_arm64` y `ANDROID_NDK_HOME` para Android) o la API C++ `OmniEngine` / `OmniSession`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: en el primer arranque con GPU se compilan los kernels del delegate, lo que hace la ejecucion inicial mas lenta; los kernels quedan cacheados en `--cache_dir` y las ejecuciones posteriores arrancan rapido. Fuera de esa advertencia, solo se declara el rango de 4-5x tiempo real en Galaxy S26.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formatos | Ejecucion | Notas |
|---|---|---|---|---|---|
| litert-community/Kokoro-82M (esta ficha) | 82 M | Apache-2.0 | `.litertlm` INT8 | LiteRT-LM en dispositivo (CPU/GPU) | 9 idiomas, 54 voces, front-ends integrados, sin dependencias externas |
| hexgrad/Kokoro-82M (modelo base) | 82 M | Apache-2.0 | pesos PyTorch/safetensors | Servidor o escritorio con Python y `espeak-ng` | Mismo modelo acustico; requiere stack Python y G2P externo; es la referencia contra la que se mide la calidad |
| Coqui XTTS-v2 | 467 M (dato publico, no verificado en la informacion disponible) | Coqui Public Model License (uso no comercial) | pesos PyTorch | Servidor o escritorio con GPU | Clonacion de voz zero-shot; licencia restrictiva para uso comercial |
| Piper (rhasspy/piper) | no disponible | MIT para el motor; licencia variable por voz | ONNX | CPU en dispositivo | Popular en domotica y asistentes embebidos; el numero de idiomas y la calidad dependen de cada voz publicada |
| Comparativa de benchmarks (MOS, WER, RTF) entre alternativas | no disponible | no disponible | no disponible | no disponible | No hay cifras publicadas en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible. Como todo sistema TTS entrenado con voces humanas, puede reproducir sesgos de acento, genero o registro presentes en los datos originales.
- Alucinacion: en un modelo TTS el riesgo equivalente es la pronunciacion incorrecta, la omision de fragmentos o la generacion de artefactos acusticos, especialmente en texto fuera de dominio, siglas, nombres propios o idiomas con fonologia poco representada. La model card no publica tasas de error.
- Cobertura de idiomas: aunque se declaran 9 idiomas, no se detalla la distribucion de voces ni la calidad relativa por idioma; el benchmark de inteligibilidad citado cubre 8 idiomas, no 9.
- Idioma por inferencia: hay que fijar el idioma y la voz manualmente; no se documenta deteccion automatica de idioma ni cambio de voz dentro de una misma sintesis.
- Ficheros separados: la variante GPU solo ejecuta el vocoder en GPU y no cae a CPU silenciosamente, por lo que en un dispositivo sin GPU compatible hay que usar obligatoriamente el fichero CPU/GPU.
- Rendimiento inicial: la primera ejecucion en GPU compila kernels y es notablemente mas lenta; sin cache persistente el arranque se penaliza en cada sesion nueva.
- Formato propietario del runtime: el bundle `.litertlm` esta atado a LiteRT-LM; no es portable directamente a otros motores de inferencia sin reconversion.
- Version previa obsoleta: el antiguo `.tflite` FP32 solo en ingles y solo CPU esta deprecado y no deberia usarse en integraciones nuevas.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero conviene verificar la licencia del modelo base y de las voces en cualquier producto derivado. El repositorio no incluye clausulas adicionales segun la informacion disponible.
- Volumen de adopcion bajo: 366 descargas y 3 likes en el momento de recopilar los datos, lo que implica poca validacion independiente en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Kokoro-82M
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Guia de compilacion y ejecucion de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/getting-started/build-and-run.md
- Documentacion del modulo omni (TTS) de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/tree/main/omni
- Ficheros FP32 antiguos (deprecados): https://huggingface.co/litert-community/Kokoro-82M/tree/main/legacy
- Paper de StyleTTS 2 (arXiv:2306.07691): https://arxiv.org/abs/2306.07691
- Paper de ISTFTNet (arXiv:2203.02395): https://arxiv.org/abs/2203.02395
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por el buscador no guardan relacion con Kokoro-82M ni con LiteRT-LM.
