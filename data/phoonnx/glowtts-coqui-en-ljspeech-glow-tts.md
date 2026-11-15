# Phoonnx/glowtts-coqui-en-ljspeech-glow-tts

## Resumen

GlowTTS Coqui English LJSpeech es un modelo de sintesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como parte del repositorio agregador `Phoonnx/phoonnx-glowtts`. El modelo corresponde a la carpeta `coqui-en-ljspeech-glow-tts` de ese repositorio y esta empaquetado para su uso con la libreria phoonnx, un runtime de inferencia de TTS basado en ONNX mantenido en GitHub por TigreGotico. Se trata, por tanto, de una redistribucion de un modelo GlowTTS entrenado originalmente en el ecosistema Coqui TTS sobre el corpus LJSpeech en ingles.

GlowTTS es una arquitectura de sintesis no autorregresiva que combina un encoder de texto con un normalizing flow invertible y un decoder, lo que permite generar mel-espectrogramas en una sola pasada y con latencia baja en comparacion con modelos autorregresivos tipo Tacotron. El modelo aqui descrito es un artefacto de inferencia ya convertido a ONNX, orientado a despliegue ligero y offline, no a reentrenamiento.

La relevancia practica es limitada pero concreta: ofrece una voz inglesa femenina (LJSpeech es un corpus de una unica hablante) en un paquete de aproximadamente 0,1 GB, sin dependencias de PyTorch en produccion, lo que lo hace util para prototipado rapido y despliegue en entornos con recursos escasos. La informacion publicada es muy escasa: no hay datos de benchmarks, de composicion del dataset de entrenamiento ni de licencia especifica para esta carpeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (encoder-decoder con normalizing flow, no autorregresiva) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (corpus LJSpeech) |
| Licencia | other (sin licencia nombrada para esta carpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es un modelo de sintesis de voz no autorregresivo que transforma una secuencia de fonemas o caracteres en un mel-espectrograma mediante un encoder con bloques de atencion y convoluciones, seguido de un normalizing flow invertible que modela la distribucion del espectrograma condicionada al texto, y un decoder que proyecta la representacion latente al espacio mel. La generacion se realiza en una unica pasada, lo que reduce el coste computacional frente a arquitecturas autorregresivas y facilita el despliegue en CPU.

El modelo de esta ficha deriva del entrenamiento original de Coqui TTS sobre LJSpeech, un corpus publico de aproximadamente 24 horas de audio en ingles de una unica hablante femenina, con transcripciones a nivel de caracter. No se dispone de informacion sobre el numero exacto de pasos de entrenamiento, la funcion de perdida detallada, ni si se aplicaron etapas de ajuste fino adicionales. El artefacto distribuido es una conversion a ONNX del modelo entrenado, no un reentrenamiento; la model card no documenta el proceso de exportacion ni las herramientas utilizadas.

## Capacidades

- Sintesis de voz a partir de texto en ingles, con salida en mel-espectrograma que requiere un vocoder externo para producir audio waveform.
- Generacion no autorregresiva en una sola pasada, adecuada para inferencia de baja latencia.
- Ejecucion mediante ONNX Runtime, sin dependencia de PyTorch en el momento de la inferencia.
- Integracion con la libreria phoonnx mediante el voice id `coqui-en-ljspeech-glow-tts`.
- Voz unica: al entrenarse sobre LJSpeech, solo reproduce la voz de la hablante del corpus; no hay soporte multi-hablante ni control de estilo.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada ni modos de razonamiento, por tratarse de un modelo de TTS.

## Casos de uso

- Prototipado de interfaces de voz: el modelo permite generar audio de prueba en ingles sin montar un stack completo de Coqui TTS, gracias a su formato ONNX y a su tamano reducido (aproximadamente 0,1 GB).
- Despliegue en dispositivos con recursos limitados: al ejecutarse con ONNX Runtime y ser no autorregresivo, puede correr en CPU o en GPUs de gama baja, lo que encaja en aplicaciones de escritorio o embebidas.
- Lectura de textos largos en ingles: util para generar audiolibros o narraciones a partir de documentos, siempre que se acepte una voz unica y se combine con un vocoder compatible.
- Generacion de locuciones para entornos de prueba: permite crear clips de audio sinteticos para tests de pipelines de ASR o de sistemas de dialogoo sin coste de API.
- Accesibilidad: conversion de texto a voz para lectores de pantalla en ingles en entornos offline, donde la latencia y la ausencia de dependencias de red son prioritarias.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones de referencia en ingles para materiales didacticos, con la limitacion de una sola voz.
- Investigacion en TTS: punto de partida para comparar arquitecturas GlowTTS frente a modelos autorregresivos o difusion en tareas de sintesis, dado el formato ONONX estandarizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio (aproximadamente 0,1 GB) y la naturaleza no autorregresiva de GlowTTS, la huella de memoria es previsiblemente baja, del orden de cientos de MB, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; el modelo esta pensado para ejecucion via ONNX Runtime, que soporta CPU y GPU.
- Compatibilidad con GPU de consumo: no disponible de forma documentada; por tamano, es probable que quepa en GPUs de consumo, pero no se confirma.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlowTTS Coqui English LJSpeech (este modelo) | no disponible | no aplica | no disponible | other | Hugging Face, ONNX |
| Coqui TTS GlowTTS original (ingles LJSpeech) | no disponible | no aplica | no disponible | MPL 2.0 (segun el proyecto Coqui TTS, no confirmado para este artefacto) | GitHub / PyTorch |
| VITS (Coqui / otros) | no disponible | no aplica | no disponible | variable segun implementacion | Hugging Face / GitHub |
| Tacotron 2 | no disponible | no aplica | no disponible | variable segun implementacion | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparacion se limita a la disponibilidad y al formato de distribucion.

## Limitaciones y advertencias

- Licencia ambigua: la model card declara `license: other` y no nombra una licencia concreta para esta carpeta, lo que impide confirmar si el uso comercial esta permitido. Es necesario contactar con el autor o consultar el repositorio original antes de usarlo en produccion.
- Voz unica: entrenado sobre LJSpeech, solo genera la voz de una hablante; no hay soporte multi-hablante ni control de prosodia o estilo.
- Idioma limitado: solo ingles; no se documenta soporte de otros idiomas.
- Dependencia de vocoder: la salida es un mel-espectrograma y requiere un vocoder compatible para obtener audio, lo que anade complejidad al pipeline.
- Riesgo de alucinacion fonetica: como todo modelo de TTS, puede producir pronunciaciones incorrectas en palabras fuera de vocabulario, siglas o nombres propios no vistos durante el entrenamiento.
- Sesgos: la voz y el estilo prosodico reflejan las caracteristicas de la hablante de LJSpeech, lo que limita la diversidad acustica.
- Documentacion escasa: no hay informacion sobre el proceso de exportacion a ONNX, la version del modelo original ni metricas de calidad subjetiva (MOS).
- Popularidad nula en Hugging Face (0 descargas y 0 likes en el momento de la consulta), lo que reduce la probabilidad de soporte comunitario o de correccion de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-coqui-en-ljspeech-glow-tts
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto Coqui TTS (origen de la arquitectura y del entrenamiento): https://github.com/coqui-ai/TTS
- Corpus LJSpeech: https://keithito.com/LJ-Speech-Dataset/
