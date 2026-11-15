# Phoonnx/glowtts-en-us-cmu_lnh

## Resumen

GlowTTS-en-us-cmu_lnh es un modelo de sintesis de voz (text-to-speech) en formato ONNX distribuido por el usuario Phoonnx dentro del repositorio `Phoonnx/phoonnx-glowtts`, del que constituye la carpeta `en-us-cmu_lnh`. El modelo emplea la arquitectura GlowTTS, un sistema TTS no autorregresivo basado en flujos normalizadores (normalizing flows) que transforma directamente espectrogramas mel a partir de secuencias de fonemas mediante un decoder generativo invertible, sin necesidad de alineamientos explicitos ni de un modelo autoregresivo separado. Esta pensado para su uso con la libreria `phoonnx` (implementacion en Python del ecosistema Phoonnx, derivada conceptualmente de Piper/Larynx) y se identifica con el voice id `larynx/en-us-cmu_lnh-glow_tts`.

El modelo esta orientado a la sintesis de voz en ingles estadounidense y su nombre sugiere que fue entrenado sobre el corpus CMU (probablemente el CMU Arctic o un subconjunto del mismo), aunque la model card no documenta explicitamente el dataset, el numero de tokens ni los hiperparametros de entrenamiento. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con un modelo GlowTTS de tamano compacto (decenas de millones de parametros) empaquetado en ONNX para inferencia en CPU.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado y redistribuido, no de un modelo original con documentacion tecnica propia. No hay descargas ni likes registrados, la licencia figura como `other` sin especificar terminos, y no se publican benchmarks ni detalles de entrenamiento. Es util, por tanto, como referencia de disponibilidad de un checkpoint GlowTTS concreto para pipelines de TTS en ingles dentro del ecosistema phoonnx, pero no como modelo de proposito general ni como base para evaluaciones comparativas rigurosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (text-to-speech no autorregresivo basado en normalizing flows) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en TTS; la entrada es una secuencia de fonemas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | ingles estadounidense (en-US), segun el nombre del modelo; no confirmado en la model card |
| Licencia | other (sin terminos especificados en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es un modelo de sintesis de voz no autorregresivo que combina un encoder de texto (tipicamente una pila de convoluciones y atencion sobre la secuencia de fonemas) con un decoder basado en flujos normalizadores invertibles. A diferencia de Tacotron 2, no requiere atencion autoregresiva ni un postnet separado para generar el espectrograma mel: el modelo aprende una transformacion biyectiva entre la distribucion de espectrogramas y una distribucion latente simple, lo que permite sintesis en una sola pasada y con latencia baja. La duracion de cada fonema se modela mediante un predictor de duraciones que condiciona el alineamiento, lo que evita los problemas clasicos de monotonicidad de los modelos autoregresivos.

En cuanto al entrenamiento, la model card no proporciona informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO (no aplica en TTS) ni los hiperparametros. El nombre `cmu_lnh` sugiere una voz derivada del corpus CMU, pero no se documenta si se trata de CMU Arctic, CMU US English o una grabacion concreta, ni si hubo ajuste fino sobre un checkpoint previo de GlowTTS. Tampoco se detalla el proceso de exportacion a ONNX ni las optimizaciones aplicadas (por ejemplo, fusion de operadores o cuantizacion). Toda esta informacion debe considerarse no disponible.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, con salida de audio (probablemente WAV) generada por el runtime phoonnx.
- Generacion no autorregresiva de espectrogramas mel, lo que permite inferencia en una sola pasada y latencia potencialmente baja en CPU.
- Control de duracion por fonema mediante el predictor de duraciones propio de GlowTTS (no se documenta si phoonnx expone parametros de velocidad o prosodia).
- Integracion con la libreria phoonnx mediante el voice id `larynx/en-us-cmu_lnh-glow_tts`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un modelo exclusivamente de TTS.
- No se documenta soporte multilingue; el identificador indica un unico idioma (en-US).
- No se documenta modo "thinking", vision, audio de entrada ni ninguna capacidad adicional mas alla de la sintesis de voz.

## Casos de uso

- Sintesis de voz para asistentes locales: el modelo puede generar respuestas habladas en ingles dentro de un asistente que corra en CPU, gracias a su formato ONNX y a su tamano reducido (repo de 0,1 GB), lo que encaja en dispositivos sin GPU dedicada.
- Lectura de articulos y documentos: integrado en un pipeline de phoonnx, permite convertir texto plano o Markdown en audio para aplicaciones de accesibilidad o consumo de contenido en movilidad.
- Generacion de avisos y notificaciones habladas: al ser un modelo no autorregresivo, la latencia por frase es predecible y adecuada para mensajes cortos en sistemas de megafonia, domotica o automocion.
- Pruebas de regresion en pipelines de TTS: sirve como checkpoint de referencia para validar la integracion de phoonnx con modelos GlowTTS y comparar la calidad percibida frente a otras voces del mismo repositorio (`phoonnx-glowtts`).
- Prototipado de interfaces conversacionales: util para desarrolladores que necesiten una voz en ingles rapida de desplegar en entornos de laboratorio o demos, sin depender de servicios en la nube.
- Generacion de audio para videojuegos o contenido educativo: para locuciones cortas y repetitivas en ingles, el coste computacional bajo permite generar variantes en lote sin infraestructura GPU.
- Investigacion en TTS: como punto de partida para estudiar el comportamiento de GlowTTS en ONNX, analizar el efecto del predictor de duraciones o comparar con voces Piper/Larynx equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,1 GB) y la naturaleza de GlowTTS, es plausible que la inferencia quepa en menos de 1 GB de memoria, pero no se confirma en la model card.
- GPU recomendadas: no se especifican. El formato ONNX y el runtime phoonnx estan orientados a inferencia en CPU; una GPU no es necesaria.
- Compatibilidad con GPU de consumo: probable en cualquier GPU con soporte ONNX Runtime (por ejemplo, GTX 1060 o superiores), aunque no esta documentado.
- Opciones de despliegue: phoonnx (runtime principal); al ser ONNX, podria ejecutarse con ONNX Runtime de forma directa, pero no se documenta soporte oficial en vLLM, llama.cpp, Ollama o TGI (estas herramientas no estan orientadas a TTS).
- Latencia y throughput estimados: no disponibles. En GlowTTS la sintesis suele ser mas rapida que en modelos autoregresivos, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en-us-cmu_lnh | GlowTTS (flows) | no disponible | no aplica | other (sin especificar) | ONNX | Hugging Face, 0 descargas |
| Piper (voces en-US, p. ej. `en_US-amy-medium`) | VITS | no disponible | no aplica | MIT (segun el proyecto Piper) | ONNX | Hugging Face y GitHub de Piper |
| Larynx (voces en-US) | GlowTTS / VITS | no disponible | no aplica | MIT (segun el proyecto Larynx) | ONNX / tflite | GitHub de Larynx |
| Coqui TTS (modelos en-US) | Tacotron 2 / VITS / GlowTTS | variable | no aplica | MPL-2.0 / otras | PyTorch / ONNX | GitHub de Coqui |

La comparacion es cualitativa: no hay benchmarks publicados para este checkpoint y los modelos alternativos citados tampoco se evaluan aqui con metricas comunes (MOS, WER). La diferencia principal es la licencia: Piper y Larynx declaran MIT en sus repositorios, mientras que este artefacto figura como `other` sin terminos explicitos, lo que introduce incertidumbre para uso comercial.

## Limitaciones y advertencias

- Licencia ambigua: la model card indica `license: other` y no nombra terminos concretos para esta carpeta, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor o consultar el repositorio origen antes de usarlo en produccion.
- Documentacion insuficiente: no se especifican dataset de entrenamiento, numero de pasos, hiperparametros, calidad de la voz ni proceso de exportacion a ONNX.
- Idioma unico: el identificador sugiere exclusivamente ingles estadounidense; no hay soporte multilingue documentado.
- Riesgo de alucinacion en TTS: como todo modelo generativo de voz, puede producir artefactos, pronunciaciones incorrectas o prosodia antinatural en palabras fuera del vocabulario de entrenamiento (nombres propios, siglas, terminos tecnicos).
- Sesgos: no documentados; al desconocerse el corpus, no puede evaluarse el sesgo de hablante, genero o acento.
- Sin datos de calidad: no hay MOS, WER ni comparaciones subjetivas publicadas, por lo que no puede recomendarse para aplicaciones donde la naturalidad sea critica.
- Modelo derivado: es una copia de una carpeta de `Phoonnx/phoonnx-glowtts`; la trazabilidad y el mantenimiento dependen del repositorio original.
- Sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta): no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_lnh
- Repositorio origen: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
