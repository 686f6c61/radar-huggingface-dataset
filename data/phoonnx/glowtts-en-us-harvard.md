# Phoonnx/glowtts-en-us-harvard

## Resumen

GlowTTS en-us-harvard es un modelo de sintesis de voz (text-to-speech) derivado del repositorio agregador Phoonnx/phoonnx-glowtts, publicado por el usuario Phoonnx. Se distribuye como un subconjunto del repositorio original, correspondiente a la carpeta `en-us-harvard`, y esta empaquetado para su uso con la libreria phoonnx, un runtime de inferencia ONNX orientado a voces TTS. El modelo emplea la arquitectura GlowTTS, un modelo de sintesis no autoregresivo basado en normalizing flows que transforma fonemas en mel-espectrogramas de forma paralela.

El modelo se publica en formato ONNX y ocupa aproximadamente 0,1 GB en el repositorio, lo que lo situa en la categoria de modelos ligeros aptos para inferencia en CPU o GPU de gama baja. Su identificador de voz dentro de phoonnx es `larynx/en-us-harvard-glow_tts`, lo que sugiere que la voz procede del corpus Harvard de Larynx, un conjunto de voces TTS de codigo abierto ampliamente utilizado en asistentes de voz y sistemas embebidos.

La relevancia de este modelo radica en su caracter practico: al estar en ONNX y ser compatible con phoonnx, puede integrarse en aplicaciones de sintesis de voz sin depender de frameworks de deep learning pesados. No obstante, la informacion publicada es minima: la model card no detalla datos de entrenamiento, idiomas soportados ni benchmarks, y la licencia se declara como `other` sin especificar terminos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (normalizing flows, no autoregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles estadounidense (inferido del identificador `en-us-harvard`) |
| Licencia | other (sin terminos especificados en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es una arquitectura de sintesis de voz no autoregresiva presentada en el paper "Glow-TTS: A Generative Flow for Text-to-Speech via Monotonic Alignment Search" (Kim et al., 2020). El modelo combina un encoder de texto con un decoder basado en normalizing flows invertibles, lo que permite generar mel-espectrogramas completos en una sola pasada paralela, a diferencia de modelos autoregresivos como Tacotron 2. Esta caracteristica reduce la latencia de inferencia y facilita el despliegue en entornos con recursos limitados.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino. El identificador `en-us-harvard` apunta a que la voz se entreno sobre el corpus Harvard de Larynx, pero este dato no se confirma en la model card. El modelo se distribuye como un artefacto ONNX dentro del ecosistema phoonnx, que probablemente incluye el conversor texto-fonema y el vocoder asociados en el repositorio padre, aunque no se detalla en la informacion disponible.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense, con salida en forma de mel-espectrograma (el vocoder necesario para audio final no se especifica en la model card).
- Generacion no autoregresiva, lo que permite sintetizar utterances completas en paralelo y con latencia potencialmente baja.
- Integracion con el runtime phoonnx mediante el identificador de voz `larynx/en-us-harvard-glow_tts`.
- Ejecucion en formato ONNX, compatible con ONNX Runtime y otros motores de inferencia ONNX.
- No se documentan capacidades de clonacion de voz, control de prosodia, emociones ni multilingueismo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles: el modelo puede convertir cadenas cortas en audio en tiempo casi real gracias a su generacion paralela y a su tamano reducido (0,1 GB), adecuado para empaquetarse dentro de la aplicacion.
- Asistentes de voz offline en dispositivos embebidos: al estar en ONNX y ser compatible con phoonnx, puede ejecutarse en Raspberry Pi o dispositivos similares sin conexion a internet, ofreciendo sintesis local para comandos y respuestas.
- Accesibilidad para personas con discapacidad visual: integracion en lectores de pantalla o herramientas de lectura de documentos que requieran una voz en ingles estadounidense con baja latencia y sin dependencia de servicios en la nube.
- Generacion de audiolibros o podcasts automatizados: sintesis por lotes de textos largos divididos en fragmentos, usando la voz Harvard para contenido en ingles; requiere un vocoder adicional para producir audio final.
- Pruebas de integracion en pipelines de CI/CD para aplicaciones de voz: el modelo sirve como voz de referencia ligera para validar flujos de texto a audio en entornos de integracion continua, sin necesidad de GPU dedicada.
- Prototipado rapido de interfaces conversacionales: desarrolladores que evaluan phoonnx pueden usar esta voz como punto de partida para construir demos de asistentes o chatbots con salida de voz en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,1 GB) y la naturaleza ONNX del modelo, es probable que quepa en menos de 1 GB de memoria, pero no se confirma.
- GPU recomendadas: no se especifican; al ser un modelo ligero en ONNX, puede ejecutarse en GPU consumer como GTX 1650, RTX 3060 o superiores, asi como en CPU.
- Compatibilidad con GPU consumer: probablemente si, dado el tamano reducido, aunque no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime y el runtime phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| GlowTTS en-us-harvard (este modelo) | GlowTTS (flows) | no disponible | no aplica | other | ONNX | Hugging Face (Phoonnx) |
| Piper (voces en_US) | VITS / GlowTTS segun voz | no disponible | no aplica | MIT (segun voz) | ONNX | GitHub rhasspy/piper |
| Coqui TTS (voces GlowTTS) | GlowTTS | no disponible | no aplica | MPL 2.0 (segun voz) | PyTorch / ONNX | GitHub coqui-ai/TTS |
| Larynx (voces originales) | GlowTTS / VITS | no disponible | no aplica | MPL 2.0 (segun voz) | ONNX / TF | GitHub rhasspy/larynx |

La comparativa se basa en conocimiento general de estos proyectos; los datos concretos de parametros y licencias de cada voz pueden variar y no se han verificado en la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- La licencia se declara como `other` sin especificar terminos, lo que impide determinar si el uso comercial esta permitido; es necesario contactar con el autor o consultar el repositorio padre antes de usarlo en produccion.
- Solo se documenta ingles estadounidense; no hay soporte multilingue confirmado.
- No se dispone de informacion sobre sesgos de voz, calidad de prosodia ni robustez ante textos fuera de dominio.
- Riesgo de alucinacion no aplica en el sentido textual, pero si puede haber errores de pronunciacion en palabras poco frecuentes o nombres propios, como es habitual en modelos TTS entrenados con corpus limitados.
- El modelo es un artefacto derivado; la model card no documenta el proceso de conversion a ONNX ni la version de phoonnx compatible, lo que puede generar problemas de integracion.
- No se especifica el vocoder necesario para convertir el mel-espectrograma en audio; sin el, el modelo no produce audio final por si solo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-en-us-harvard](https://huggingface.co/Phoonnx/glowtts-en-us-harvard)
- [Repositorio padre: Phoonnx/phoonnx-glowtts](https://huggingface.co/Phoonnx/phoonnx-glowtts)
- [Runtime phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Paper Glow-TTS (Kim et al., 2020)](https://arxiv.org/abs/2005.11129)
- [Proyecto Larynx (GitHub)](https://github.com/rhasspy/larynx)
