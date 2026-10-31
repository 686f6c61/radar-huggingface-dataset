# Orvena/Supertonic-3-ANE

## Resumen

Supertonic-3-ANE es una conversión para el Apple Neural Engine (ANE) del estimador de vectores del modelo de texto a voz Supertonic-3, desarrollado por Supertone. La conversión ha sido realizada por Orvena y publicada en Hugging Face como un paquete Core ML pensado para ejecutarse íntegramente en dispositivos Apple (iPhone y Mac), sin depender de la CPU ni de la GPU.

El componente convertido es el estimador de vectores del modelo flow-matching original, que es la parte que Supertonic ejecuta ocho veces por frase y donde se concentra casi todo el tiempo de cómputo. Al portarlo al ANE con formas fijas y precisión FP16, Orvena consigue que una frase completa sea entre 11 y 15 veces más rápida que con ONNX Runtime sobre CPU en un iPhone 17 Pro Max, dejando además la CPU y la GPU libres para otras tareas.

Es relevante porque demuestra que es posible desplegar síntesis de voz neuronal de calidad en dispositivos móviles con latencias muy bajas y consumo eficiente, algo clave para aplicaciones de voz en iOS que no quieren depender de APIs en la nube. Orvena lo utiliza como voz para los idiomas que Kokoro no soporta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estimador de vectores flow-matching (componente de Supertonic-3), convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4 buckets de longitud fija: 32, 64, 128 y 256 frames (texto y latente) |
| Tipos de cuantizacion | FP16 (el port Core ML original usaba FP32) |
| Idiomas soportados | no disponible (validado en transcripcion con ingles, aleman, espanol, frances, coreano, ruso y polaco) |
| Licencia | BigScience OpenRAIL-M (openrail) |
| Formato de pesos | Core ML (paquete mlpackage, ~0,1 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo original, Supertonic-3 de Supertone, es un sistema de texto a voz basado en flow-matching: un estimador de vectores se ejecuta ocho pasos de desruido por frase para transformar un latente ruidoso en una representacion de voz, que despues pasa por un codificador de texto, un predictor de duracion y un vocoder. Este repositorio no contiene el modelo completo, sino solo el estimador de vectores, que es el componente computacionalmente dominante.

La contribucion de esta conversion es tecnica mas que de entrenamiento: el port Core ML previo (aufklarer/Supertonic-3-CoreML-FP16) mantenia el estimador en FP32 con longitud flexible, lo que hacia que Core ML lo ejecutara en CPU. Esta version calcula en FP16 y fija la longitud en cuatro buckets (32, 64, 128 y 256 frames), con una funcion separada por bucket (`latent_32`, `latent_64`, `latent_128`, `latent_256`). Al usar formas fijas, todas las operaciones se ejecutan en el Neural Engine. El repositorio incluye un script `convert.py` que reproduce el paquete. No hay datos sobre el entrenamiento del modelo base (tokens, datasets, RLHF) en la informacion disponible.

## Capacidades

- Estimacion de vectores para sintesis de texto a voz mediante flow-matching en 8 pasos por frase.
- Ejecucion totalmente on-device en el Apple Neural Engine de iPhone y Mac, sin uso de CPU ni GPU.
- Cuatro buckets de longitud fija (32, 64, 128 y 256 frames) con padding de texto y latente.
- Integrable en el pipeline completo de Supertonic-3 (codificador de texto, predictor de duracion y vocoder siguen siendo los componentes ONNX originales).
- Salida de voz validada como fiel al original: transcripciones identicas con Whisper large-v3-turbo en 30 muestras (10 frases en 7 idiomas, 3 semillas de ruido).
- Texto de mas de 256 frames requiere el estimador original.

## Casos de uso

- Sintesis de voz on-device en iOS: la app puede generar voz sin llamadas a servidores, con latencias de decenas de milisegundos por frase y sin ocupar CPU ni GPU, lo que mantiene la interfaz fluida.
- Asistentes de voz locales: al dejar libres CPU y GPU, la app puede seguir reconociendo voz, renderizando o ejecutando un LLM local mientras el ANE sintetiza el audio.
- Lectura de textos en multiples idiomas: Orvena lo emplea como voz para los idiomas que Kokoro no soporta, aprovechando la calidad multilingue de Supertonic-3.
- Accesibilidad: lectores de pantalla o apps de comunicacion aumentativa pueden sintetizar voz de forma privada, sin enviar texto del usuario a la nube.
- Generacion de audio para prototipos en Mac: los desarrolladores pueden iterar en la sintesis de voz localmente sin coste de infraestructura.
- Narracion offline en apps de contenido: audiolibros o guias pueden pregenerar o sintetizar audio en el dispositivo sin conexion.
- Agents de voz con latencia baja: en pipelines conversacionales, la velocidad del estimador (82-137 ms por frase) permite respuestas habladas casi inmediatas.

## Benchmarks y rendimiento

Datos de rendimiento publicados por el autor, medidos en un iPhone 17 Pro Max con frases completas (predictor de duracion, codificador de texto y vocoder de Supertonic en ONNX, con este estimador en lugar del ONNX):

| Longitud de audio | ONNX Runtime, CPU | Este modelo, Neural Engine | Neural Engine, GPU ocupada |
|---|---|---|---|
| 3,1 s | 937 ms | 82 ms | 141 ms |
| 5,8 s | 1.822 ms | 121 ms | 208 ms |
| 7,4 s | 2.092 ms | 137 ms | 186 ms |

Esto supone una aceleracion de 11 a 15 veces respecto a ONNX Runtime en CPU. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, etc.) al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- Dispositivo requerido: hardware Apple con Neural Engine (iPhone o Mac con chip Apple Silicon). El modelo esta disenado para Core ML con `computeUnits = .cpuAndNeuralEngine`.
- Tamano del modelo: aproximadamente 0,1 GB en el repositorio, trivial para cualquier iPhone o Mac moderno.
- No aplica VRAM de GPU discreta ni tarjetas como A100, H100 o RTX 4090: el objetivo es precisamente evitar la GPU.
- No cabe la nocion de "consumer GPU" convencional: funciona en dispositivos de consumo Apple (iPhone 17 Pro Max verificado; razonable en cualquier chip con ANE, aunque no hay medidas publicadas para otros modelos).
- Despliegue: Core ML (MLModelConfiguration con `functionName` para elegir bucket, por ejemplo `latent_128`). Los componentes restantes de Supertonic (codificador de texto, predictor de duracion, vocoder) se ejecutan con ONNX Runtime en CPU.
- Latencia medida: 82-137 ms por frase completa en iPhone 17 Pro Max, frente a 937-2.092 ms con ONNX en CPU.
- Nota: no hay informacion sobre despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Tipo | Ejecucion objetivo | Rendimiento destacado | Licencia |
|---|---|---|---|---|
| Orvena/Supertonic-3-ANE | Estimador flow-matching TTS (Core ML, FP16, formas fijas) | Apple Neural Engine | 82-137 ms por frase en iPhone 17 Pro Max (11-15x mas rapido que ONNX CPU) | OpenRAIL-M |
| Supertone/supertonic-3 | TTS flow-matching completo (estimador en FP32, longitud flexible) | CPU/GPU via ONNX Runtime | 937-2.092 ms por frase en CPU (iPhone 17 Pro Max) | OpenRAIL-M |
| aufklarer/Supertonic-3-CoreML-FP16 | Port Core ML del estimador (FP32, longitud flexible) | CPU via Core ML (no ANE por formas flexibles) | no disponible | no disponible |

## Limitaciones y advertencias

- Longitud maxima: el texto no puede superar los 256 frames; para textos mas largos hay que usar el estimador original.
- El padding del latente cambia el resultado de la misma forma que el batching en el modelo original: con la misma semilla de ruido se obtiene una "toma" distinta de la frase, no una degradada. El FP16 anade ademas una pequena deriva propia. Esto puede importar en aplicaciones que requieran reproducibilidad exacta respecto al ONNX original.
- Solo se ha convertido el estimador de vectores: el resto del pipeline (codificador de texto, predictor de duracion, vocoder) sigue ejecutandose en ONNX sobre CPU, por lo que la latencia total no es solo la del ANE.
- Licencia OpenRAIL-M: las restricciones de uso del Anexo A del LICENSE aplican al modelo y a cualquier obra derivada; hay que revisarlas antes de uso comercial.
- La validacion de fidelidad se limito a 30 muestras (10 frases en 7 idiomas, 3 semillas) transcritas con Whisper large-v3-turbo; no hay evaluaciones perceptuales formales (MOS) publicadas.
- No hay informacion sobre consumo energetico, termico ni rendimiento en chips Apple anteriores al del iPhone 17 Pro Max.
- Descargas muy bajas (13 en el momento de la ficha) y sin comunidad de soporte consolidada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Orvena/Supertonic-3-ANE
- Modelo base (Supertone): https://huggingface.co/Supertone/supertonic-3
- Port Core ML del que parte la conversion: https://huggingface.co/aufklarer/Supertonic-3-CoreML-FP16
- Orvena (aplicacion que lo utiliza): https://orvena.app

No se han encontrado enlaces a papers, blogs ni demos adicionales en la informacion disponible.
