# Qvisty/ordstriben-whisper-small-sv

## Resumen

`Qvisty/ordstriben-whisper-small-sv` es una conversión a formato sherpa-onnx con cuantización int8 del modelo `KBLab/kb-whisper-small`, desarrollado por KBLab en la Biblioteca Nacional de Suecia (Kungliga biblioteket). No se trata de un modelo entrenado desde cero: los pesos no han sido reentrenados, solo exportados y cuantizados para permitir la inferencia completamente offline en dispositivos móviles. El autor de la conversión es Qvisty, y el modelo se utiliza en la aplicación de dictado Ordstriben.

El modelo resuelve el problema del reconocimiento automático de voz en sueco en entornos sin conectividad, con un tamaño total de aproximadamente 375 MB distribuido en tres ficheros: encoder int8, decoder int8 y vocabulario de tokens. Parte de `openai/whisper-small` (arquitectura transformer encoder-decoder con 12 capas en cada bloque y 80 bins mel), sobre el que KBLab realizó un preentrenamiento continuado con corpus sueco.

Es relevante porque demuestra una cadena de conversión reproducible (Hugging Face a ONNX int8 vía sherpa-onnx) para llevar ASR de calidad a dispositivos con recursos limitados, con una mejora sustancial de WER frente al Whisper small genérico en sueco: 8,4 % frente a 25,0 % en el conjunto de test FLEURS `sv_se`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), 12 capas encoder y 12 decoder, 80 mel bins |
| Parametros totales | No disponible (heredados de whisper-small; el autor no publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de hasta 30 segundos |
| Tipos de cuantizacion | int8 (cuantizacion dinamica del script de exportacion de sherpa-onnx) |
| Idiomas soportados | Sueco (`sv`) en la practica; otros idiomas no verificados |
| Licencia | Apache 2.0 (pesos de KBLab); modelo base OpenAI Whisper bajo MIT |
| Formato de pesos | ONNX int8 (`small-sv-encoder.int8.onnx`, `small-sv-decoder.int8.onnx`) y `small-sv-tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura es la de OpenAI Whisper small: un transformer encoder-decoder con 12 capas en el encoder y 12 en el decoder, entrada de espectrograma mel de 80 bins y decodificacion autoregresiva de tokens de texto. KBLab partio de `openai/whisper-small` y realizo un preentrenamiento continuado sobre corpus sueco; segun la model card de origen, los datos incluyen aproximadamente 34.000 horas de subtitulos en sueco, grabaciones del Parlamento sueco (RixVox, ODC-BY), ISOF y NST.

La conversion realizada por Qvisty consistio en renombrar los pesos al esquema de OpenAI Whisper, cargarlos con `openai-whisper` 20250625 en modo estricto (sin tensores faltantes ni inesperados) y exportarlos con `scripts/whisper/export-onnx.py` de sherpa-onnx v1.13.8 usando el exportador TorchScript legacy (`dynamo=False`) y la cuantizacion int8 dinamica propia del script. El entorno de conversion fue torch 2.15.0 (CPU), onnx 1.23.2, onnxruntime 1.32.0 y Python 3.13. No hubo reentrenamiento ni ajuste fino posterior.

## Capacidades

- Reconocimiento automatico de voz (transcripcion) en sueco, con decodificacion greedy.
- Ejecucion completamente offline en dispositivo, sin dependencia de red.
- Inferencia via sherpa-onnx mediante `OfflineRecognizer.from_whisper` con `language="sv"` y `task="transcribe"`.
- Procesamiento de audio en ventanas de hasta 30 segundos.
- Formato optimizado para movil: pesos int8 de ~375 MB en total.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puro de ASR.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Aplicacion de dictado movil offline: es el uso real del modelo en Ordstriben; permite transcribir voz a texto en el telefono sin conexion, con un tamano de 375 MB que cabe en el almacenamiento de un dispositivo moderno.
- Notas de voz y actas de reunion en sueco: transcripcion de grabaciones de hasta 30 segundos por ventana, con WER de 8,4 % en FLEURS, adecuado para documentos internos donde no se exige transcripcion perfecta.
- Subtitulado de contenido hablado en sueco: integrable en pipelines que segmenten audio en clips de hasta 30 segundos y concatenen las salidas del decoder.
- Asistentes de voz embebidos en aplicaciones de escritorio o IoT: el formato ONNX int8 se ejecuta con onnxruntime en CPU, sin GPU, lo que facilita su despliegue en dispositivos de bajo consumo.
- Transcripcion de audio del Parlamento sueco o de archivos institucionales: el modelo fue entrenado con RixVox y datos de ISOF y NST, por lo que el dominio parlamentario e institucional esta cubierto.
- Prototipado rapido de ASR en sueco: al ser Apache 2.0 y estar disponible en ONNX, sirve como linea base reproducible para comparar mejoras o para integrarse en herramientas de investigacion sin depender de APIs en la nube.
- Accesibilidad: conversion de voz a texto en tiempo casi real (aproximadamente 0,35 veces el tiempo real en CPU de 4 nucleos con 4 hilos) para personas con dificultades de escritura.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre los ficheros int8 exactos con sherpa-onnx 2.0.3 (Python), decodificacion greedy, sobre 253 grabaciones (46 minutos, 5.108 palabras) del split de test FLEURS `sv_se`, cada tercera fila, con texto en minusculas y sin puntuacion antes de puntuar:

| Modelo (int8, sherpa-onnx) | Tamano | WER | CER | Segundos por clip |
|---|---:|---:|---:|---:|
| Whisper small generico (`csukuangfj/sherpa-onnx-whisper-small`) | 375 MB | 25,0 % | 7,5 % | 3,7 |
| KB-Whisper small (este repositorio) | 375 MB | 8,4 % | 2,9 % | 3,9 |
| KB-Whisper medium (`Qvisty/ordstriben-whisper-medium-sv`) | 946 MB | 7,1 % | 2,3 % | 17,7 |

La velocidad se midio con 4 hilos en una CPU cloud de 4 nucleos; los clips promedian 11 segundos, por lo que el modelo corre a aproximadamente 0,35 veces el tiempo real. La velocidad y el consumo de memoria en telefono no se han medido. KBLab reporta un 7,3 % de WER para el modelo small con los pesos originales y su propia normalizacion; la normalizacion empleada aqui es simple y no gestiona numerales, y cuatro clips se detuvieron en el limite de tokens del decoder, por lo que las cifras deben considerarse indicativas.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal; el modelo esta pensado para CPU. En GPU, la huella es reducida al ser int8 y ~375 MB de pesos.
- GPU recomendadas: no se especifican; el autor solo documenta ejecucion en CPU (torch 2.15.0 CPU, onnxruntime 1.32.0).
- Cabe en cualquier GPU consumer moderna (RTX 4090, etc.) y, sobre todo, en CPU de movil y de escritorio; el objetivo declarado es ejecucion en telefono.
- Opciones de despliegue: sherpa-onnx (libreria nativa, Python y movil), onnxruntime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: aproximadamente 0,35 veces el tiempo real en CPU cloud de 4 nucleos con 4 hilos (3,9 segundos por clip de 11 segundos de media). Sin mediciones en telefono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS sv_se | Licencia | Formato |
|---|---|---|---|---|---|
| KB-Whisper small (este repo, int8) | No disponible (whisper-small) | 30 s de audio | 8,4 % | Apache 2.0 | ONNX int8 |
| Whisper small generico (sherpa-onnx) | No disponible (whisper-small) | 30 s de audio | 25,0 % | MIT (OpenAI) | ONNX int8 |
| KB-Whisper medium (`Qvisty/ordstriben-whisper-medium-sv`) | No disponible (whisper-medium) | 30 s de audio | 7,1 % | Apache 2.0 | ONNX int8, 946 MB |

El modelo small ofrece un equilibrio claro entre precision y tamano: pierde 1,3 puntos de WER frente al medium pero ocupa menos de la mitad (375 MB frente a 946 MB) y es aproximadamente 4,5 veces mas rapido por clip en la misma CPU. Frente al Whisper small generico, la mejora en sueco es de 16,6 puntos de WER con identico tamano.

## Limitaciones y advertencias

- Solo funciona en sueco en la practica; otros idiomas no se han verificado.
- El audio se procesa en ventanas de hasta 30 segundos; no hay contexto mas alla de cada ventana.
- Comete mas errores que el modelo medium (8,4 % frente a 7,1 % de WER en FLEURS).
- El silencio, el ruido y los nombres poco frecuentes pueden producir texto incorrecto.
- La cuantizacion int8 puede costar algo de precision frente a los pesos originales.
- La normalizacion de texto empleada en la evaluacion es simple y no maneja numerales; los numeros en la salida pueden aparecer en formato textual inconsistente.
- La licencia Apache 2.0 cubre los pesos, pero no describe los terminos de los datos de subtitulos usados en el entrenamiento; el autor recomienda verificar las condiciones antes de redistribuir o usar comercialmente. Esto no constituye asesoramiento legal.
- KBLab no publica fichero NOTICE para este modelo.
- No se han medido velocidad ni memoria en telefono, pese a ser el objetivo del formato.
- No es un modelo conversacional ni de razonamiento: no admite instrucciones, tool calling ni tareas fuera de ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Qvisty/ordstriben-whisper-small-sv
- Modelo base: https://huggingface.co/KBLab/kb-whisper-small
- Version medium del mismo autor: https://huggingface.co/Qvisty/ordstriben-whisper-medium-sv
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Scripts de conversion: https://github.com/qvisty/Ordstriben/tree/main/tools/whisper-sv
- Paper de KB-Whisper (Interspeech 2025): https://doi.org/10.21437/Interspeech.2025-2646
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
