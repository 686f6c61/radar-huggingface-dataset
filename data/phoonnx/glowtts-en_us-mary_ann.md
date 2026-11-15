# Phoonnx/glowtts-en_us-mary_ann

## Resumen

glowtts-en_us-mary_ann es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy dentro del proyecto Larynx y empaquetado por Phoonnx para su uso con su libreria ONNX de TTS. El modelo convierte texto en ingles estadounidense en fonemas IPA mediante el fonemizador gruut y genera un espectrograma que posteriormente es convertido en audio por el vocoder hifigan-multi-vctk-small. Se distribuye en formato ONNX, lo que permite inferencia sin dependencias de frameworks de deep learning pesados.

El modelo resuelve el problema de la sintesis de voz offline y ligera para aplicaciones de asistencia por voz, especialmente en el ecosistema OVOS (Open Voice OS), donde se integra mediante el plugin ovos-tts-plugin-phoonnx. Su tamano de repositorio de 0,1 GB lo hace adecuado para despliegues en dispositivos con recursos limitados, como Raspberry Pi o sistemas embebidos.

Es relevante ahora porque forma parte de una coleccion de voces Glow-TTS empaquetadas para phoonnx, una libreria que estandariza la ejecucion de modelos TTS ONNX en Python y OVOS. Con 37 descargas y sin likes, es un modelo de nicho orientado a la comunidad de asistentes de voz open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (generador de espectrogramas) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut, alfabeto IPA |
| Vocoder | hifigan-multi-vctk-small |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de sintesis de voz basado en flujos normalizadores (normalizing flows) que genera espectrogramas mel a partir de fonemas de entrada. A diferencia de los modelos autorregresivos como Tacotron 2, Glow-TTS utiliza un mecanismo de alineamiento monotono y decodificacion en paralelo, lo que permite una sintesis mas rapida. El modelo produce un espectrograma que es transformado en audio por el vocoder HiFi-GAN (hifigan-multi-vctk-small), un generador adversarial entrenado sobre el dataset multi-hablante VCTK.

El modelo original fue entrenado por Rhasspy como parte de Larynx v1.0, un proyecto de TTS offline para asistentes de voz. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La voz "mary_ann" corresponde a un hablante concreto del corpus de entrenamiento. El empaquetado por Phoonnx convierte los pesos a formato ONNX para su ejecucion con la libreria phoonnx, que gestiona la descarga del vocoder asociado.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Conversion de texto a fonemas IPA mediante el fonemizador gruut (GruutPhonemizer de scriptconv).
- Generacion de espectrogramas mel que se convierten en audio mediante el vocoder HiFi-GAN.
- Salida de audio en formato WAV mediante la API synthesize_wav de phoonnx.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecucion en formato ONNX, sin necesidad de PyTorch en tiempo de inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz offline en OVOS: el modelo se integra como plugin de TTS en Open Voice OS, permitiendo sintesis de voz local sin conexion a internet. Es adecuado por su formato ONNX ligero y su integracion nativa con el ecosistema.
- Lectura de notificaciones y respuestas en dispositivos embebidos: con un repositorio de 0,1 GB, puede desplegarse en Raspberry Pi u otros dispositivos de recursos limitados para leer alertas y respuestas del sistema.
- Accesibilidad para personas con discapacidad visual: sintesis de texto a voz para lectores de pantalla en entornos Linux, gracias a la ejecucion local y la baja latencia de Glow-TTS.
- Sistemas de megafonia automatizada: generacion de anuncios pregrabados o dinamicos en ingles estadounidense para aplicaciones de domotica o comercio.
- Prototipado de interfaces conversacionales: los desarrolladores pueden integrar rapidamente una voz en ingles en sus pipelines de Python usando la API de phoonnx, sin depender de servicios cloud.
- Investigacion en TTS: como modelo Glow-TTS empaquetado en ONNX, sirve como referencia para comparar arquitecturas de flujos normalizadores frente a modelos autorregresivos o difusion.
- Educacion y aprendizaje de idiomas: generacion de pronunciacion en ingles estadounidense a partir de texto, con salida WAV facilmente reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,1 GB) y la arquitectura Glow-TTS + HiFi-GAN, se espera un consumo bajo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el formato ONNX permite ejecucion en CPU, lo que sugiere que podria funcionar sin GPU, pero no se dispone de datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-en_us-mary_ann | Glow-TTS + HiFi-GAN | en-US | ONNX | other (sin registrar) | no disponible | Hugging Face, 37 descargas |
| Otras voces Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | varios | ONNX | other | no disponible | Coleccion Glow-TTS en Hugging Face |
| Modelos TTS de Rhasspy Larynx v1.0 | Glow-TTS | varios | tar.gz original | segun upstream | no disponible | GitHub releases de Rhasspy |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no registrada: la model card indica explicitamente que no hay licencia registrada y recomienda consultar la release upstream antes de su uso. Esto supone un riesgo para uso comercial.
- Idioma limitado: solo soporta ingles estadounidense (en-US); no es multilingue.
- Dependencia de fonemizacion: requiere el fonemizador gruut y la libreria scriptconv con el extra scriptconv[gruut]; errores en la fonemizacion afectan directamente a la calidad del audio.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario o nombres propios.
- Sesgos del hablante: la voz "mary_ann" corresponde a un hablante concreto del corpus; puede presentar sesgos de prosodia, acento y estilo limitados a ese hablante.
- Sin datos de benchmarks: no hay metricas publicadas de calidad (MOS, WER) en la informacion disponible.
- Ecosistema de nicho: 37 descargas y 0 likes indican baja adopcion; el soporte de la comunidad puede ser limitado.
- Formato ONNX: aunque ligero, limita la cuantizacion y optimizacion a las herramientas compatibles con ONNX Runtime.
- Fecha de creacion futura: el repositorio figura creado en 2026-11-14, lo que puede indicar un error de metadatos o una fecha programada; conviene verificar la integridad del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-mary_ann
- Upstream original (Rhasspy Larynx v1.0): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_mary_ann-glow_tts.tar.gz
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder hifigan-multi-vctk-small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
