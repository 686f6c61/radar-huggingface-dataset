# elphi-si/elphi

## Resumen

Elphi Türkçe (repositorio `elphi-si/elphi`) es la distribucion en Core ML del modelo de sintesis de voz EMA Lightning, desarrollado originalmente por Canberk Aslan. No se trata de un modelo nuevo: el repositorio contiene exclusivamente los pesos publicados de EMA Lightning convertidos al formato Core ML de Apple para su uso dentro de la aplicacion Elphi. La conversion, el empaquetado y la validacion fueron realizados por Bosphorus Intelligence LLC, que no tiene vinculo con el autor original.

El objetivo es permitir que la app Elphi lea respuestas en turco en voz alta en iPhone, iPad y Mac de forma totalmente local: tras la descarga, funciona sin conexion y no envia texto ni audio a ningun servidor. Es un modelo de texto a voz (TTS) en turco, con pesos en float32 y sin cuantizacion, empaquetado como ML Programs de Core ML que la app ejecuta sobre la CPU.

El conjunto pesa aproximadamente 32,6 MB en total (unos 32,1 MB de pesos) y se divide en tres etapas: texto, sonido y decodificador. Sobre un iPhone 11 (chip A13) genera el primer audio en 60-80 ms y sintetiza voz unas 20 veces mas rapido de lo que tarda en reproducirse. La licencia es Apache 2.0, tanto para los pesos como para el codigo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS por etapas: etapa de texto (ids de letra a caracteristicas y duraciones), etapa de sonido (alineador + cuatro pasos de flow matching a latents de 64 dimensiones a 25 Hz) y decodificador (latents a audio) |
| Parametros totales | No declarado explicitamente; los ficheros de pesos float32 suman 32.095.600 bytes, equivalentes a aproximadamente 8 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo TTS; no se declara longitud maxima de texto de entrada) |
| Tipos de cuantizacion | Ninguna: pesos float32 sin cuantizar (el autor indica que no se aplico cuantizacion) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache License 2.0 |
| Formato de pesos | Core ML ML Program (`.mlpackage`, pesos float32); tres paquetes: `EMAText`, `EMASound`, `EMADecoder`, mas `voice.json` |

## Arquitectura y entrenamiento

EMA Lightning es un modelo de sintesis de voz compuesto por etapas. En esta distribucion Core ML, el modelo acustico se dividio en una etapa de texto (`EMAText.mlpackage`, 4.792.000 bytes de pesos) que convierte identificadores de letra en caracteristicas de letra y duraciones por letra, y una etapa de sonido (`EMASound.mlpackage`, 15.319.296 bytes de pesos) que contiene el alineador y cuatro pasos de flow matching que producen latents de 64 dimensiones a 25 Hz. El decodificador (`EMADecoder.mlpackage`, 11.984.304 bytes de pesos) transforma esos latents en audio mono a 48 kHz. Un fichero `voice.json` (1.443 bytes) contiene el alfabeto, las constantes y las fuentes fijadas.

No hubo entrenamiento, ajuste fino ni cuantizacion por parte del distribuidor: los valores de los pesos son identicos a los del modelo original. Lo que si se modifico respecto al original es la estructura: el modelo acustico se separo en etapa de texto y etapa de sonido, mientras que el decodificador queda sin cambios. La aritmetica de indices que el modelo original calculaba dentro de su paso forward (linea temporal de palabras, posiciones de letra y frame, ventana del alineador) la calcula ahora la aplicacion, replicando exactamente el calculo original. Las etapas se trazaron con PyTorch 2.7.0 y se convirtieron con coremltools 9.0 a ML Programs, con empaquetado determinista (los mismos bytes en cada compilacion). Se fijo la revision `7a6ba1ad216bb2f1da9863f80ac8770a6a807632` del repositorio original y el commit `12797c5f4dbcced8e4b3392b12bba2fe8b9f5ec6` (v1.0.4) del codigo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que esos detalles pertenecen a la model card del modelo original y no se reproducen en esta distribucion.

## Capacidades

- Sintesis de voz en turco a partir de texto, con salida de audio mono a 48 kHz.
- Generacion local y sin conexion: una vez descargado el modelo, funciona sin red y sin enviar texto ni audio al exterior.
- Ejecucion en dispositivo sobre la CPU mediante Core ML, en iOS, iPadOS y macOS 26 y posteriores.
- División por etapas que permite encadenar texto, sonido y decodificacion de forma modular dentro de la app.
- Normalizacion de texto (numeros, fechas, importes, abreviaturas) mediante la libreria `normalizer-tr` 0.4.0, que se distribuye dentro de la app y no forma parte de este repositorio.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni modos de "thinking"; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura en voz alta de respuestas de un asistente: la app Elphi sintetiza en turco las respuestas generadas por otro modelo de lenguaje, de forma local y con baja latencia (primer audio en 60-80 ms en un A13).
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a voz turca sin conexion, en iPhone, iPad y Mac.
- Uso offline en movilidad: lectura de documentos o notas en turco sin enviar contenido a ningun servidor, util en entornos sin cobertura o con requisitos de privacidad.
- Integracion en aplicaciones iOS/iPadOS/macOS: al estar empaquetado como Core ML ML Program, puede incorporarse a apps nativas que necesiten TTS turco sin dependencias de nube.
- Asistencia en la lectura de contenidos largos: sintesis a unas 20 veces la velocidad de reproduccion, adecuada para pregenerar o cachear audio de parrafos extensos.
- Demostraciones y prototipos de TTS turco en dispositivo: al pesar unos 32 MB, es viable distribuirlo dentro de una app sin comprometer el tamano del binario.
- Verificacion de integridad en produccion: la app comprueba tamano y SHA-256 fijados de cada fichero antes de compilarlo, lo que encaja en flujos con requisitos de cadena de suministro verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de sintesis de voz. La unica validacion reportada es la comparacion contra el modelo original de PyTorch en CPU, con ruido identico, sobre 12 piezas de referencia:

| Metrica | Resultado |
|---|---|
| Lineas temporales de frame | Identicas al modelo original |
| Calidad de audio (SNR respecto al original) | Entre 48,0 y 67,4 dB (mediana 61,3 dB), diferencias a nivel de redondeo |
| Primer audio en iPhone 11 (A13) | 60-80 ms |
| Velocidad de sintesis | Aproximadamente 20 veces mas rapida que la reproduccion |

## Requisitos de hardware

- Almacenamiento: aproximadamente 32,6 MB en total (unos 32,1 MB de pesos), mas el espacio de compilacion en dispositivo.
- Memoria: no se declara un requisito de RAM especifico; al ejecutarse en CPU con pesos float32 de ~32 MB, la huella es reducida.
- GPUs: no aplica; el modelo se ejecuta sobre la CPU a traves de Core ML, no requiere GPU dedicada ni Neural Engine para su funcionamiento declarado.
- Compatibilidad con hardware de consumo: si, esta disenado para iPhone, iPad y Mac. Se ha validado en un iPhone 11 (chip A13) y requiere iOS, iPadOS o macOS 26 o posteriores.
- Opciones de despliegue: Core ML ML Program, compilado en el dispositivo por la aplicacion Elphi. No se declara soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este formato ni a esta tarea.
- Latencia y throughput: primer audio en 60-80 ms en un A13; sintesis aproximadamente 20 veces mas rapida que la reproduccion en tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| elphi-si/elphi (esta ficha) | TTS por etapas + flow matching, distribucion Core ML | Turco | Core ML ML Program (float32) | Apache 2.0 | Conversion Core ML de EMA Lightning; ~32,6 MB; validado en iPhone 11 |
| canberkkkkkk/ema-lightning | TTS EMA Lightning original | Turco | Pesos PyTorch (`ema.pt`, `decoder.pt`) | Apache 2.0 | Modelo base sin modificar del que procede esta distribucion; misma arquitectura |
| Otros modelos TTS comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks ni especificaciones de alternativas en la informacion proporcionada |

## Limitaciones y advertencias

- Genera voz sintetica: la propia model card pide que quien la escuche sepa que es artificial. No debe presentarse como la voz de una persona real ni usarse para suplantacion o estafas.
- La normalizacion automatica de numeros, fechas y abreviaturas puede malinterpretar entradas poco habituales.
- Idiomas: solo turco (tr); no se declara soporte para otros idiomas.
- No hay datos publicos de sesgos especificos, pero al ser un modelo entrenado por un tercero, pueden existir sesgos en la voz generada que no se documentan en esta distribucion.
- Riesgo de alucinacion en sentido estricto no aplica (no es un modelo generativo de texto), pero la sintesis puede producir pronunciaciones incorrectas ante texto anomalo o mal normalizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se exige mantener la atribucion al autor original; el fichero `NOTICE` recoge dicha atribucion.
- El distribuidor no esta afiliado, patrocinado ni respaldado por el autor de EMA Lightning, y no ofrece garantia de ningun tipo ("as is").
- Requiere iOS, iPadOS o macOS 26 o posteriores; no es utilizable en plataformas no Apple ni en versiones anteriores del sistema.
- La distribucion depende de que la app verifique tamano y SHA-256 de cada fichero antes de compilar; alteraciones de los ficheros romperian esa cadena de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elphi-si/elphi
- Modelo base EMA Lightning (Canberk Aslan): https://huggingface.co/canberkkkkkk/ema-lightning
- Repositorio GitHub de EMA Lightning: https://github.com/canberk7/ema-lightning
- Sitio de la aplicacion Elphi: https://www.elphiai.com/
- Normalizador de texto turco normalizer-tr (Erdem Tuna): https://github.com/erdemtuna/normalizer-tr
