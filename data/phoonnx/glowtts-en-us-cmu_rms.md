# Phoonnx/glowtts-en-us-cmu_rms

## Resumen

GlowTTS-en-us-cmu_rms es un modelo de sintesis de voz (text-to-speech) en formato ONNX publicado por el usuario Phoonnx en Hugging Face. Se trata de una exportacion de una de las voces incluidas en el repositorio agregado `Phoonnx/phoonnx-glowtts`, concretamente la carpeta `en-us-cmu_rms`, y esta pensado para su uso con la libreria `phoonnx` (implementacion en Python del proyecto TigreGotico). El modelo sigue la arquitectura GlowTTS, un modelo no autorregresivo de sintesis de voz basado en flujos normalizadores, y se distribuye como pesos ONNX listos para inferencia.

La relevancia de esta ficha es acotada: no se trata de un modelo fundacional nuevo ni de una propuesta de investigacion, sino de un artefacto de despliegue derivado de una voz preexistente. Su interes practico reside en que permite ejecutar TTS en ingles estadounidense sobre runtime ONNX, lo que facilita el despliegue en entornos sin PyTorch y potencialmente en CPU. La informacion publicada por el autor es minima: la model card solo identifica la voz, su origen y el identificador interno, sin especificar parametros, contexto, dataset de entrenamiento ni resultados de evaluacion.

No se dispone de datos sobre el numero de parametros, la longitud de contexto ni los idiomas soportados mas alla de la indicacion implicita en el nombre de la voz (`en-us`). Cualquier cifra de rendimiento o tamano distinta del tamano del repositorio (0,1 GB) debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (flujos normalizadores, no autorregresiva) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no documenta variantes) |
| Idiomas soportados | ingles estadounidense (`en-us`, segun el nombre de la voz) |
| Licencia | other (la model card no especifica licencia concreta para esta carpeta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es un modelo de sintesis de voz no autorregresivo que combina un encoder de texto con un decodificador basado en flujos normalizadores invertibles, junto con un modulo de alineamiento monotono que aprende la correspondencia entre fonemas y frames de audio sin necesidad de atencion autorregresiva. Este diseno permite sintesis paralela, lo que se traduce en latencia baja en inferencia comparado con modelos autoregresivos como Tacotron 2. El artefacto distribuido aqui es una exportacion ONNX de una voz concreta, no un modelo entrenado desde cero por el autor del repositorio.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o horas de audio utilizadas, ni sobre si se aplicaron tecnicas de post-entrenamiento. La model card unicamente indica que los ficheros conservan las rutas del repositorio origen `Phoonnx/phoonnx-glowtts` y proporciona el identificador de voz `larynx/en-us-cmu_rms-glow_tts`. El sufijo `cmu_rms` sugiere un origen vinculado a un corpus CMU, pero el autor no lo confirma en la documentacion disponible.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense.
- Inferencia mediante runtime ONNX, sin dependencia obligatoria de PyTorch.
- Integracion con la libreria `phoonnx`, que expone la voz con el identificador `larynx/en-us-cmu_rms-glow_tts`.
- Generacion de audio en una sola pasada (modelo no autorregresivo), adecuada para sintesis por lotes.
- No se documenta soporte de control de prosodia, emociones, hablantes multiples ni clonacion de voz.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No se documenta soporte multilingue mas alla del ingles estadounidense.

## Casos de uso

- Lectura de contenido web o articulos: el modelo puede convertir texto plano en audio en ingles para sistemas de accesibilidad o lectores de noticias, aprovechando la inferencia paralela de GlowTTS para procesar parrafos completos con latencia contenida.
- Respuestas de voz en asistentes conversacionales: integrado en un pipeline de NLU mas TTS, permite generar la respuesta hablada de un asistente en ingles estadounidense; su formato ONNX facilita el despliegue en servidores sin GPU dedicada.
- Generacion de avisos y notificaciones habladas: en sistemas de telefonia o IoT que requieran locuciones dinamicas en ingles, la voz puede sintetizar mensajes cortos con bajo coste computacional.
- Doblaje de contenido formativo o e-learning: produccion de pistas de audio en ingles para cursos, dado que la sintesis por lotes permite procesar guiones largos de forma automatizada.
- Pruebas de integracion en pipelines de TTS: util como voz de referencia para validar la libreria `phoonnx` y comparar latencias frente a otras voces del mismo repositorio agregado.
- Prototipado de interfaces de voz: desarrolladores que necesiten una voz inglesa rapida de integrar en demos o pruebas de concepto sin entrenar un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el tamano del repositorio es de 0,1 GB, lo que sugiere un modelo pequeno que probablemente quepa en memoria de CPU.
- GPU recomendadas: no documentadas por el autor. Por el tamano del artefacto, es plausible su ejecucion en CPU y en GPUs de gama consumer, pero no hay confirmacion oficial.
- Compatibilidad con GPU consumer: no confirmada; el formato ONNX permite ejecucion en CPU mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime y la libreria `phoonnx`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GlowTTS-en-us-cmu_rms (este) | GlowTTS (flujos) | no disponible | en-us | other (sin especificar) | ONNX |
| Piper (voces en_US) | VITS | no disponible | multiples | MIT (segun proyecto) | ONNX |
| Coqui TTS (voces GlowTTS) | GlowTTS | no disponible | multiples | MPL-2.0 / otras segun voz | PyTorch, ONNX |
| Kokoro | StyleTTS2-like | ~82M (segun publicaciones del proyecto) | multiples | Apache-2.0 | ONNX, PyTorch |

La comparacion se limita a caracteristicas generales porque no hay datos de rendimiento publicados para este artefacto. Piper y Kokoro son alternativas orientadas al mismo nicho de TTS ligero en ONNX; Coqui TTS es el ecosistema de origen de muchas voces GlowTTS. No se dispone de comparaciones objetivas (MOS, latencia) para la voz `en-us-cmu_rms`.

## Limitaciones y advertencias

- La licencia es `other` y la model card no concreta los terminos; no se puede asumir uso comercial sin consultar la licencia del repositorio origen `Phoonnx/phoonnx-glowtts` y del proyecto Larynx/Coqui del que probablemente deriva la voz.
- No hay informacion sobre sesgos acusticos, calidad percibida ni cobertura fonetica; la calidad de sintesis no esta validada en la documentacion.
- Riesgo de pronunciacion incorrecta en palabras fuera del dominio de entrenamiento, nombres propios y siglas, comun en modelos TTS entrenados con corpus limitados.
- Limitacion idiomatica: solo se declara ingles estadounidense; no se debe usar para otros idiomas sin verificacion previa.
- Sin soporte documentado de SSML, control de prosodia ni seleccion de hablante.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No hay garantias de mantenimiento ni de actualizacion del artefacto.
- Para produccion, conviene verificar la procedencia exacta de los pesos y los terminos de la licencia original antes de distribuirlo.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-cmu_rms
- Repositorio agregado de voces: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
