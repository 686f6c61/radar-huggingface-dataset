# Phoonnx/glowtts-ru_ru-nikolaev-gruut

## Resumen

glowtts-ru_ru-nikolaev-gruut es un modelo de síntesis de voz (text-to-speech) en ruso empaquetado en formato ONNX por Phoonnx para su librería de inferencia `phoonnx`. El modelo original es un Glow-TTS desarrollado por Rhasspy dentro del proyecto Larynx, concretamente la voz `ru-ru_nikolaev` de la versión 1.0. Phoonnx se limita a convertir los pesos originales a ONNX y a integrarlos en su ecosistema de voces, de modo que puedan ejecutarse en Python y en el asistente de voz OVOS.

El modelo resuelve la conversión de texto a espectrograma mel; la síntesis de audio final la realiza un vocoder HiFi-GAN (`hifigan-multi-vctk-small`) que phoonnx descarga junto con la voz. La entrada de texto no es texto plano directo, sino fonemas IPA generados mediante el fonemizador gruut a través de la librería `scriptconv`. El repositorio ocupa unos 0,1 GB y está pensado para despliegues ligeros, no para clonación de voz ni para síntesis de alta fidelidad.

Su relevancia es acotada: se trata de una voz concreta dentro de una colección de modelos Glow-TTS empaquetados, con muy poca tracción (26 descargas, 0 likes en el momento de la consulta) y sin licencia registrada. Resulta útil para quien necesite TTS en ruso dentro de un pipeline OVOS o phoonnx ya existente, pero no es un modelo de propósito general ni compite con los TTS neuronales modernos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo de síntesis texto-a-espectrograma) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por fonemas, no por tokens de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ruso (`ru-RU`) |
| Licencia | other (sin licencia registrada; el autor remite a la release upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small (HiFi-GAN) |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz basado en normalizing flows que aprende una correspondencia entre secuencias de fonemas y espectrogramas mel, sin necesidad de un alineador externo (utiliza monotonic alignment search durante el entrenamiento). La voz `ru-ru_nikolaev` procede del proyecto Larynx de Rhasspy, que entrenó voces multilingües sobre corpus públicos; sin embargo, la model card no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o ajuste fino adicional.

La innovación relevante aquí no está en el modelo en sí, sino en el empaquetado: Phoonnx exporta los pesos a ONNX para permitir inferencia sin dependencia de PyTorch en tiempo de ejecución, y delega la normalización y fonemización del texto a `scriptconv` con el fonemizador gruut. El pipeline completo es texto → fonemas IPA → espectrograma mel (Glow-TTS) → audio (HiFi-GAN). No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Síntesis de voz en ruso (`ru-RU`) a partir de texto escrito, mediante fonemización previa con gruut.
- Generación de espectrogramas mel que se convierten en audio con el vocoder HiFi-GAN asociado.
- Integración con la librería `phoonnx` para inferencia en Python.
- Integración con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalización y conversión de texto a fonemas IPA a través de `scriptconv`.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No se documentan capacidades multilingües más allá del ruso.

## Casos de uso

- Asistente de voz local en ruso: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente doméstico autoalojado responda en ruso sin depender de servicios en la nube, gracias a su tamaño reducido (0,1 GB).
- Lectura de notificaciones y alertas: en un sistema domótico, el modelo puede sintetizar mensajes cortos en ruso (recordatorios, estados de sensores) con baja latencia por su arquitectura ligera y su ejecución ONNX.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en ruso en aplicaciones de lectura de pantalla o lectores de documentos, usando la salida WAV generada por `voice.synthesize_wav`.
- Generación de audio para contenidos educativos: creación de narraciones en ruso para cursos o materiales de aprendizaje, siempre que la calidad de la voz `nikolaev` sea suficiente para el propósito.
- Pruebas y prototipado de pipelines TTS: al estar empaquetado en ONNX y disponible vía `pip install --pre phoonnx`, sirve para validar flujos texto→fonema→audio en entornos de desarrollo antes de adoptar un TTS de mayor calidad.
- Interacción por voz en aplicaciones de escritorio o kiosco: síntesis de respuestas habladas en ruso dentro de una aplicación Python que ya use el ecosistema phoonnx, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) y la naturaleza de Glow-TTS más HiFi-GAN pequeño, es previsible que quepa en CPU, pero no se confirma con datos.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño reducido sugiere que sí, pero no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-ru_ru-nikolaev-gruut (este) | Glow-TTS + HiFi-GAN | ru | no aplica | other (sin registrar) | Hugging Face, ONNX, phoonnx |
| Otras voces Larynx ru de Rhasspy | Glow-TTS + HiFi-GAN | ru | no aplica | según release upstream | GitHub Rhasspy/Larynx |
| Otras voces de la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varios | no aplica | other | Hugging Face, colección Phoonnx |
| TTS neuronales modernos (p. ej. VITS, FastSpeech2) | VITS / FastSpeech2 | multilingüe | no aplica | variable | múltiples |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia sin registrar: la model card indica explícitamente que no hay licencia registrada y remite a la release upstream; el uso comercial queda en un limbo legal hasta verificar la licencia original de Rhasspy/Larynx.
- Calidad de voz limitada: Glow-TTS con HiFi-GAN pequeño no alcanza la naturalidad de los TTS neuronales actuales; no se han publicado métricas MOS.
- Dependencia de fonemización: la entrada debe pasar por gruut/scriptconv; texto mal normalizado o fuera de la cobertura fonética del ruso puede degradar la síntesis.
- Idioma único: solo ruso (`ru-RU`); no hay soporte multilingüe documentado.
- Sin control de prosodia avanzado ni clonación de voz: es una voz fija (`nikolaev`).
- Riesgo de alucinación acústica: como todo TTS, puede producir pronunciaciones incorrectas en palabras raras, siglas o nombres propios no cubiertos por el fonemizador.
- Proyecto con muy poca tracción (26 descargas, 0 likes): menor probabilidad de mantenimiento y soporte comunitario.
- No apto para tareas de razonamiento, código, visión ni agentes: es exclusivamente un modelo de síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-ru_ru-nikolaev-gruut
- Release upstream (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/ru-ru_nikolaev-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Vocoder HiFi-GAN asociado: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
