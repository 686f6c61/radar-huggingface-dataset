# Phoonnx/coqui-vits-hr-cv-vits

## Resumen

`Phoonnx/coqui-vits-hr-cv-vits` es un modelo de sintesis de voz (text-to-speech) derivado del proyecto Coqui VITS, empaquetado en formato ONNX para su uso con la libreria [phoonnx](https://github.com/TigreGotico/phoonnx). Lo publica el usuario Phoonnx como una extraccion individual de una carpeta (`hr-cv-vits`) del repositorio agregado `Phoonnx/phoonnx-coqui-vits`, que agrupa varias voces Coqui VITS convertidas a ONNX. El modelo esta pensado para sintetizar habla en croata (codigo `hr-HR`) y fue entrenado originalmente con el corpus Common Voice.

La relevancia de esta ficha es limitada pero concreta: se trata de una voz TTS ligera (repo de 0,1 GB) para un idioma con poca cobertura en el ecosistema TTS open source, el croata. Al estar en ONNX y bajo licencia BSD-3-Clause, es apta para integracion en aplicaciones y para uso comercial sin las restricciones de licencias copyleft o de pesos cerrados.

La informacion publicada por el autor es minima: no hay model card propia mas alla de la referencia al repositorio origen, no se declaran parametros, contexto (no aplica en TTS) ni benchmarks. Todo lo que sigue se limita a lo que consta en los metadatos y en la documentacion del proyecto origen, y lo no disponible se marca explicitamente como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coqui VITS (variational inference with adversarial learning for end-to-end TTS), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; no disponible la longitud maxima de texto de entrada) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | croata (`hr-HR`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |
| Dataset de entrenamiento (segun origen) | Common Voice |
| Voice id en phoonnx | `coqui/hr-cv-vits` |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis extremo a extremo que combina un encoder de texto, un prior variacional condicionado por alineamientos monotonos aprendidos (MAS) y un decoder generativo adversario, con un discriminador multiperiodo para el entrenamiento. El resultado es un modelo que genera waveform directamente a partir de fonemas/texto sin necesidad de un vocoder separado, lo que explica su tamano reducido y su baja latencia en inferencia. En este repositorio el modelo se distribuye ya exportado a ONNX, de modo que la inferencia no requiere PyTorch.

Sobre el entrenamiento no hay datos publicados en la informacion disponible: no consta el numero de horas de audio, el numero de pasos, la composicion exacta del dataset (mas alla de que la fuente es Common Voice para `hr-HR`) ni si hubo ajuste fino adicional. No se documentan innovaciones tecnicas propias mas alla de la conversion a ONNX y el empaquetado para phoonnx.

## Capacidades

- Sintesis de voz (text-to-speech) en croata a partir de texto de entrada.
- Generacion end-to-end de waveform mediante VITS, sin vocoder externo.
- Inferencia via ONNX Runtime a traves de la libreria phoonnx.
- Integracion como voz identificada por `coqui/hr-cv-vits` dentro del ecosistema phoonnx.
- No consta soporte de tool calling, agentes, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.
- No consta soporte multilingue mas alla del croata.
- No consta control de estilo, emocion, hablante multiple ni clonacion de voz en la informacion disponible.

## Casos de uso

- Lectura de contenido en croata: conversion de articulos, documentacion o avisos a audio para aplicaciones de accesibilidad o consumo pasivo, aprovechando que es un modelo ligero (0,1 GB) desplegable en CPU.
- Interfaces de voz para aplicaciones locales: integracion en apps de escritorio o moviles mediante ONNX Runtime y phoonnx para dar respuestas habladas en croata sin depender de APIs en la nube.
- Sistemas de anuncios y megafonia automatizada: generacion previa de locuciones en croata para transporte, comercio o eventos, con coste de inferencia bajo al no requerir GPU.
- Prototipado de asistentes conversacionales en croata: uso como capa TTS de un pipeline ASR + LLM + TTS, dado que la licencia BSD-3-Clause permite integrarlo en productos sin obligaciones de copyleft.
- Localizacion de contenido multimedia: doblaje o sustitucion de pistas de voz en croata en materiales formativos, respetando las condiciones de la licencia y de la fuente de datos original.
- Investigacion en TTS de bajos recursos: punto de comparacion para experimentos con idiomas eslavos del sur, al ser una voz Coqui VITS ya exportada y reproducible en ONNX.
- Pruebas de regresion en pipelines de sintesis: al ser un artefacto ONNX pequeno y con voice id fijo, sirve como caso de test en CI para verificar integraciones de phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repo (0,1 GB) es esperable que quepa holgadamente en cualquier GPU consumer, pero no consta medicion publicada.
- GPU recomendadas: no disponible; al ser un modelo VITS en ONNX, la inferencia en CPU es viable y probablemente suficiente para uso no masivo.
- Cabe en GPU consumer: si, por tamano del artefacto (0,1 GB), aunque no hay datos oficiales de consumo de memoria en ejecucion.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx (https://github.com/TigreGotico/phoonnx). No consta soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no estan orientados a TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/coqui-vits-hr-cv-vits | TTS VITS | Croata (hr-HR) | 0,1 GB | BSD-3-Clause | ONNX | Objeto de esta ficha |
| Otras voces de Phoonnx/phoonnx-coqui-vits | TTS VITS | Varios (segun carpeta) | no disponible por voz | BSD-3-Clause (segun origen) | ONNX | Mismo pipeline y empaquetado, distinto idioma |
| Coqui TTS VITS originales | TTS VITS | Multiples | no disponible | MPL-2.0 en el proyecto Coqui TTS (los pesos pueden variar) | PyTorch | Requiere stack PyTorch; este repo es una conversion ONNX |
| Piper (rhasspy/piper) | TTS VITS | Multiples, incluidos idiomas eslavos | decenas de MB por voz | MIT (segun proyecto) | ONNX | Alternativa directa en ONNX; no consta voz croata equivalente verificada |

La comparacion se limita a caracteristicas publicas; no hay datos de calidad (MOS, WER de sintesis) para ninguno de los modelos en la informacion disponible.

## Limitaciones y advertencias

- Informacion muy escasa: no hay model card propia, ni parametros, ni datos de entrenamiento, ni evaluacion de calidad.
- Cobertura limitada a un unico idioma (croata); no sirve para castellano ni para otros idiomas.
- Riesgo de artefactos de sintesis y de pronunciacion incorrecta en palabras fuera del dominio de Common Voice (nombres propios, siglas, numeros, terminologia tecnica).
- El modelo hereda los sesgos del corpus Common Voice: posible infrarepresentacion de acentos regionales, hablantes mayores o registros formales.
- No se documenta la calidad de la voz ni el hablante de referencia; no hay garantia de naturalidad ni de consistencia prosodica.
- Licencia BSD-3-Clause permite uso comercial con atribucion y sin endoso; conviene verificar las condiciones de la fuente (Common Voice) y del proyecto Coqui original antes de distribuir el modelo o derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento.
- No consta versionado, changelog ni soporte del autor; el artefacto debe considerarse de uso bajo propia responsabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-hr-cv-vits
- Repositorio origen agregado: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto Coqui TTS (arquitectura VITS): https://github.com/coqui-ai/TTS
- Dataset Common Voice: https://commonvoice.mozilla.org/
