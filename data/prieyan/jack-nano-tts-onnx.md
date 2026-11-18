# Prieyan/jack-nano-tts-onnx

## Resumen

Jack (jack-nano) es un modelo de sintesis de voz (text-to-speech) derivado por fine-tuning de KittenML/kitten-tts-2-nano en el paso 10000, y exportado a ONNX por el usuario Prieyan para inferencia en dispositivo. Genera audio a 24 kHz y se distribuye con pesos en tres formatos (ONNX INT8, ONNX FP32 y safetensors de PyTorch), lo que facilita su integracion tanto en pipelines de servidor como en entornos de borde sin dependencia de frameworks de deep learning completos.

El modelo resuelve el problema de disponer de una voz concreta ("jack") en ingles con un coste computacional reducido: el artefacto INT8 ocupa solo 34 MB y el FP32 66 MB, con un repositorio total de 0,2 GB. Es relevante para desarrolladores que necesitan TTS local, de baja latencia y con licencia permisiva (Apache 2.0), sin depender de APIs en la nube.

La informacion publicada es escasa: no se detallan la arquitectura interna, el volumen de datos de entrenamiento ni resultados de benchmarks. La model card se limita a describir los ficheros, el proceso de cuantizacion y el formato de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: KittenML/kitten-tts-2-nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (simetrica, por canal de salida, con `DequantizeLinear`) y FP32 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8 y FP32) y safetensors (PyTorch) |
| Frecuencia de muestreo de salida | 24 kHz |
| Tamano de los artefactos | 34 MB (INT8 ONNX), 66 MB (FP32 ONNX); repo de 0,2 GB |
| Libreria | onnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. El modelo deriva de KittenML/kitten-tts-2-nano mediante fine-tuning en el paso 10000 para obtener la voz "jack", y posteriormente se exporto a ONNX. El repositorio incluye un modulo de grapheme-to-phoneme (`g2p/`) con diccionario CMU/misaki y un fallback BART G2P, lo que sugiere un pipeline TTS clasico de texto a fonemas y de fonemas a audio, pero no se confirma la topologia de la red.

El proceso de cuantizacion esta documentado: el modelo INT8 se genero mediante cuantizacion post-entrenamiento combinada con destilacion consciente de cuantizacion (quantization-aware distillation) a partir del modelo FP32. La cuantizacion es simetrica, por canal de salida, con nodos `DequantizeLinear` y activaciones en FP32. El repositorio incluye un fichero `verification.json` con comprobaciones del export frente al modelo PyTorch original. No se especifican volumen de tokens, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida de audio a 24 kHz.
- Voz unica predefinida ("jack"), codificada como embedding de estilo en `voices_en.npz`.
- Conversion de grafemas a fonemas integrada mediante diccionario CMU/misaki y fallback BART G2P.
- Inferencia en dispositivo mediante ONNX Runtime, sin necesidad de PyTorch en produccion.
- Variante INT8 de 34 MB pensada para entornos con recursos limitados, y variante FP32 de 66 MB para mayor fidelidad.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingueismo ni tool calling.

## Casos de uso

- Lectura por voz en aplicaciones moviles y de escritorio: el artefacto INT8 de 34 MB puede empaquetarse dentro de la app y ejecutarse con ONNX Runtime en el propio dispositivo, sin conexion a red ni coste por peticion.
- Asistentes de voz locales y embebidos: la licencia Apache 2.0 y el tamano reducido permiten integrar el modelo en dispositivos con poca memoria (Raspberry Pi, moviles de gama media) para respuestas habladas.
- Accesibilidad: conversion de texto a audio para lectores de pantalla y sistemas de asistencia a personas con discapacidad visual, con latencia baja al ejecutarse localmente.
- Generacion de narraciones y audiolibros en ingles: el pipeline G2P incluido permite pronunciar de forma consistente palabras fuera de diccionario mediante el fallback BART.
- Prototipado rapido de interfaces conversacionales: al estar en ONNX, se puede integrar en servicios Python, C++, C# o JavaScript con el runtime correspondiente y validar la experiencia de voz antes de invertir en infraestructura mayor.
- Pruebas A/B de voces en productos: al ser una voz fine-tuneada sobre un modelo nano, sirve como base para comparar calidad y coste frente a soluciones TTS en la nube antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano de los artefactos (34 MB INT8, 66 MB FP32) el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime (CUDA o TensorRT); no se especifican modelos concretos.
- Cabe en GPU consumer: si, practicamente en cualquier tarjeta moderna (RTX 3060 en adelante e inferiores) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), y potencialmente otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Prieyan/jack-nano-tts-onnx | no disponible | no disponible | en | Apache 2.0 | ONNX, safetensors | Voz "jack", 24 kHz, variantes INT8 y FP32 |
| KittenML/kitten-tts-2-nano (modelo base) | no disponible | no disponible | en | no disponible en la informacion | no disponible | Modelo del que deriva el fine-tune |
| Alternativas TTS open source de tamano nano | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni validado para otros idiomas.
- Una unica voz ("jack"), sin control de emocion, velocidad ni estilo mas alla de lo que permita el embedding de estilo.
- No se documentan sesgos especificos, pero al derivar de un modelo TTS en ingles puede heredar sesgos de pronunciacion y prosodia del corpus original.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir pronunciaciones erroneas o artefactos en texto no visto, especialmente en palabras fuera del diccionario CMU/misaki.
- La calidad de la variante INT8 puede diferir de la FP32; el autor incluye `verification.json` para comprobar el export, pero no se publican metricas perceptuales (MOS) ni de inteligibilidad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base KittenML/kitten-tts-2-nano, cuya licencia no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del artefacto.
- No hay garantias de mantenimiento ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prieyan/jack-nano-tts-onnx
- Modelo base: https://huggingface.co/KittenML/kitten-tts-2-nano
