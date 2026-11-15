# Phoonnx/glowtts-en-us-cmu_aew

## Resumen

GlowTTS-en-US-cmu_aew es un modelo de sintesis de voz (text-to-speech) en formato ONNX, publicado por Phoonnx como una carpeta extraida del repositorio agregador `Phoonnx/phoonnx-glowtts`. Empaqueta una voz concreta, identificada como `larynx/en-us-cmu_aew-glow_tts`, pensada para ser consumida por la libreria `phoonnx`, una implementacion centrada en inferencia ONNX de motores TTS como GlowTTS. El modelo resuelve la conversion de texto a audio en ingles estadounidense y su interes practico radica en que ofrece un artefacto listo para produccion (ficheros ONNX, sin dependencia de frameworks de entrenamiento pesados) dentro de un ecosistema de voces intercambiables.

El modelo deriva de la familia GlowTTS, un sistema TTS no autorregresivo de tipo encoder-decoder con normalizing flows, originalmente desarrollado en el marco de Mozilla TTS y heredado por el proyecto Larynx. La voz `cmu_aew` procede del conjunto de voces de Larynx, entrenadas sobre corpus publicos como CMU ARCTIC y LJSpeech, y se distribuye aqui como un subconjunto independiente con la estructura de ficheros del repositorio original.

La relevancia actual es acotada: se trata de una voz individual dentro de un catalogo, no de un modelo fundacional. Su utilidad esta en despliegues de TTS local, de baja latencia y sin GPU, donde interesa una voz concreta en ingles y se prefiere un artefacto ONNX pequeno (repo de 0,1 GB) frente a pilas de inferencia mas complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (encoder-decoder no autorregresivo con normalizing flows; inferencia via ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de texto; sin ventana de contexto publicada) |
| Tipos de cuantizacion | no disponible (se distribuye como pesos ONNX; no se documenta fp32/fp16/int8) |
| Idiomas soportados | Ingles estadounidense (en-US), segun el identificador de voz `en-us-cmu_aew` |
| Licencia | other (la model card indica `license: other` y no nombra licencia concreta para esta carpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es un modelo de sintesis de voz no autorregresivo que combina un encoder de texto, un modulo de alineamiento monotono (MAS, Monotonic Alignment Search) y un decoder generativo basado en normalizing flows que transforma ruido en espectrogramas mel. La sintesis es paralela, lo que reduce la latencia frente a arquitecturas autorregresivas como Tacotron 2, a costa de requerir un vocoder externo (tipicamente HiFi-GAN o similar) para convertir el espectrograma en forma de onda. En este repositorio, el artefacto se distribuye ya exportado a ONNX para su ejecucion con `phoonnx`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o fine-tuning adicional. El identificador `en-us-cmu_aew` sugiere herencia del catalogo de voces de Larynx, habitualmente entrenadas sobre corpus publicos de habla inglesa (CMU ARCTIC y similares), pero la model card no detalla el corpus ni los hiperparametros. No se documentan innovaciones tecnicas propias mas alla del empaquetado ONNX.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (text-to-speech).
- Generacion de audio no autorregresiva, apta para inferencia por lotes y en tiempo casi real en CPU.
- Integracion directa con la libreria `phoonnx` mediante el identificador de voz `larynx/en-us-cmu_aew-glow_tts`.
- Ejecucion sobre runtime ONNX, sin necesidad de PyTorch en produccion.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de capacidades de vision, audio de entrada ni modos de razonamiento extendido.
- Multilingue: no; la voz esta limitada al ingles estadounidense.

## Casos de uso

- Lectura de articulos y documentos: el modelo convierte texto plano en audio para lectores de pantalla o sistemas de accesibilidad, ejecutandose en local con ONNX y sin GPU.
- Asistentes de voz embebidos: integrado via `phoonnx` en dispositivos de bajos recursos, ofrece respuestas habladas en ingles con latencia reducida al ser sintesis paralela.
- Generacion de audiolibros y narracion por lotes: al ser no autorregresivo, permite procesar grandes volumenes de texto en pipelines offline sin cuello de botella secuencial.
- Pruebas de voz en aplicaciones de IVR: sirve como voz de referencia en ingles para validar flujos telefonicos automatizados antes de contratar voces comerciales.
- Prototipado de interfaces conversacionales: equipos que desarrollan con `phoonnx` pueden incorporar esta voz para demostraciones internas sin dependencias de servicios en la nube.
- Investigacion en TTS: util como voz base para experimentos de comparacion, ajuste de vocoders o evaluacion de metricas MOS en entornos controlados.
- Sistemas de notificacion por voz: anuncios hablados en ingles para aplicaciones de escritorio o servidores, donde un artefacto ONNX de 0,1 GB simplifica el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ejecutarse en ONNX, el modelo puede correr en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) es suficiente por el reducido tamano del repo (0,1 GB), aunque no hay datos oficiales.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del artefacto; no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime a traves de la libreria `phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlowTTS-en-US-cmu_aew (este) | TTS GlowTTS | en-US | ONNX | other | Hugging Face |
| Otras voces de `Phoonnx/phoonnx-glowtts` | TTS GlowTTS | varias | ONNX | other | Hugging Face |
| Piper (voces ONNX) | TTS VITS | multilingue | ONNX | MIT (segun proyecto) | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, RTF) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia `other` sin texto de licencia asociado en la model card: antes de uso comercial es imprescindible verificar los terminos del repositorio origen y de las voces de Larynx de las que deriva.
- Voz limitada al ingles estadounidense; no apta para otros idiomas.
- No se documentan sesgos acusticos, pero al derivar de corpus publicos puede heredar sesgos de hablantes y dominio (lectura de frases, registro neutro).
- Riesgo de errores de pronunciacion en nombres propios, siglas y palabras fuera del vocabulario de entrenamiento (alucinacion fonetica).
- Requiere un vocoder externo para producir audio final; el repositorio no detalla cual, lo que puede complicar la reproducibilidad.
- Sin datos publicados de calidad (MOS) ni de latencia; no recomendable para produccion critica sin evaluacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_aew
- Repositorio agregador de voces: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
