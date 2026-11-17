# scriptvox/whisper-small-ar

## Resumen

Whisper small for Arabic (ScriptVox) es un ajuste fino de `openai/whisper-small` orientado al reconocimiento automatico del habla en arabe, con enfasis en los dialectos del Golfo (incluido el emirati) y en arabe estandar moderno, manteniendo la calidad del modelo base en ingles. Lo desarrolla ScriptVox y se distribuye en formato CTranslate2 (float16) para su uso con faster-whisper, con un peso de 484 MB y un repositorio de 0,5 GB. La version publicada es la r12-a70.

El modelo resuelve un problema concreto: el rendimiento pobre de Whisper small en dialectos arabes, donde el modelo base presenta tasas de error de palabra (WER) superiores al 40 % en habla del Golfo. Mediante un ajuste fino de 14.000 pasos y una mezcla posterior de pesos (0,70 ajustado / 0,30 base), el autor reduce el WER un 32,7 % en el conjunto de prueba del Golfo y un 22,2 % en emirati, sin degradar de forma significativa el ingles (6,44 % frente a 6,52 % del base en FLEURS ingles).

Es relevante para desarrolladores que necesiten transcripcion local de audio en arabe sin depender de servicios en la nube: el formato CTranslate2 permite inferencia eficiente en CPU y GPU, y la licencia Apache-2.0 facilita el uso comercial. La arquitectura es la de Whisper small (transformer encoder-decoder), con 244 millones de parametros y una ventana de contexto de audio de 30 segundos por ventana de decodificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 244 millones (heredados de openai/whisper-small) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos por decodificacion; grabaciones largas se procesan en ventanas sucesivas |
| Tipos de cuantizacion | float16 (formato publicado); int8 soportado por faster-whisper en tiempo de ejecucion |
| Idiomas soportados | Arabe (dialectos del Golfo, emirati, otros dialectos y arabe estandar moderno) e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (model.bin, float16) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder con 244 millones de parametros disenado para reconocimiento automatico del habla y traduccion. El ajuste fino se realizo durante 14.000 pasos con una tasa de aprendizaje de 1e-5. La mitad de los elementos de entrenamiento son ventanas de 30 segundos construidas a partir de varios clips, cada uno con sus propios tiempos de inicio y fin, lo que ensena al modelo la forma de una grabacion larga y evita cortes artificiales en la decodificacion por ventanas.

Tras el ajuste fino, el autor mezcla los pesos: 0,70 del modelo ajustado y 0,30 del modelo base. Esta mezcla preserva la calidad en ingles del original y el ratio se eligio sobre los conjuntos de desarrollo, leyendo los conjuntos de prueba una sola vez despues de fijar esa decision. Los datos de entrenamiento incluyen el Meta Omnilingual ASR Corpus (arabe del Golfo y 13 dialectos arabes adicionales, CC BY 4.0), Mozilla Common Voice 18 en arabe (CC0), Google FLEURS en arabe e ingles (CC BY 4.0) y LibriSpeech en ingles con texto generado por Whisper large-v3 (CC BY 4.0). No se incluyo audio de YouTube ni de otros videos web.

## Capacidades

- Transcripcion de voz a texto en arabe (dialectos del Golfo, emirati, otros dialectos y arabe estandar moderno) e ingles.
- Generacion de marcas de tiempo a nivel de palabra (word timestamps) utilizables en todos los clips de los cuatro conjuntos de prueba.
- Puntuacion automatica: el modelo escribe puntuacion en el 94-100 % de los clips.
- Procesamiento de grabaciones largas mediante decodificacion en ventanas de 30 segundos; en grabaciones de unos 8,5 minutos no se observaron huecos de mas de 5 segundos sin palabras.
- Reconocimiento de habla en entornos de inferencia local y eficiente gracias al formato CTranslate2.
- No dispone de tool calling, capacidades de agente, vision ni audio mas alla del ASR.

## Casos de uso

- Transcripcion local de reuniones y entrevistas en arabe: el modelo procesa grabaciones largas en ventanas de 30 segundos sin huecos significativos, lo que permite generar actas o resumenes a partir de audio sin enviar datos a la nube.
- Subtitulado de video en arabe: las marcas de tiempo a nivel de palabra y la puntuacion automatica facilitan la generacion de subtitulos sincronizados para contenido en dialectos del Golfo o arabe estandar.
- Atencion al cliente en centros de contacto de la region del Golfo: transcripcion de llamadas grabadas para analisis de calidad y busqueda de texto, con la ventaja de que el modelo reconoce el dialecto emirati y del Golfo mejor que el base.
- Investigacion en linguistica arabe: transcripcion de corpus de habla dialectal con WER reducido (27,82 % en el conjunto del Golfo frente a 41,32 % del base), util para anotacion y estudios de variacion dialectal.
- Pipelines de accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido audiovisual en arabe, ejecutandose en local con faster-whisper y cuantizacion int8.
- Procesamiento por lotes en servidores sin GPU: al estar en formato CTranslate2, puede ejecutarse en CPU con cuantizacion int8, lo que abarata la transcripcion masiva de archivos de audio en arabe.
- Integracion en herramientas de edicion de video: el modelo se usa dentro de ScriptVox para transcribir clips con `--lang ar`, lo que permite flujos de trabajo de edicion basados en texto.

## Benchmarks y rendimiento

Tasa de error de palabra (WER), menor es mejor. La base es `openai/whisper-small` con el mismo decodificador y la misma normalizacion de texto. El intervalo es un bootstrap pareado al 95 % sobre clips.

| Conjunto de prueba | Clips | Base | Este modelo | Cambio |
|---|---|---|---|---|
| Arabe del Golfo (hablantes y prompts no vistos en entrenamiento) | 402 | 41,32 % | 27,82 % | -32,7 % (-35,3 a -30,2) |
| Arabe, FLEURS test | 428 | 26,36 % | 17,69 % | -32,9 % (-36,5 a -29,3) |
| Emirati (corpus no usado en entrenamiento) | 1.048 | 26,52 % | 20,63 % | -22,2 % (-24,7 a -19,5) |
| Ingles, FLEURS test | 647 | 6,52 % | 6,44 % | -1,2 % (-6,1 a +4,2) |

Grabaciones largas de unos 8,5 minutos decodificadas en ventanas de 30 segundos:

| Grabacion | WER | Huecos de mas de 5 s sin palabras |
|---|---|---|
| Emirati, 533 s | 21,4 % | 0 |
| Golfo, 513 s | 27,9 % | 0 |

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en float16 (peso de 484 MB) y aproximadamente 0,3-0,5 GB en int8; el consumo real depende del tamano del lote y de la longitud del audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100 y H100 sin aprovechar su capacidad por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: faster-whisper (recomendado, formato nativo CTranslate2), ScriptVox (`scriptvox setup speech-local --arabic`), y cualquier runtime compatible con CTranslate2. No se distribuye en formato GGUF ni safetensors en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER arabe (FLEURS) | Licencia | Formato |
|---|---|---|---|---|---|
| scriptvox/whisper-small-ar | 244 M | 30 s por ventana | 17,69 % | Apache-2.0 | CTranslate2 |
| openai/whisper-small (base) | 244 M | 30 s por ventana | 26,36 % | Apache-2.0 | Safetensors, CTranslate2 |
| openai/whisper-large-v3 | 1.550 M | 30 s por ventana | No disponible en la informacion | Apache-2.0 | Safetensors, CTranslate2 |
| Otros ajustes de Whisper small para arabe | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a los datos publicados en la model card; no se dispone de resultados de WER de whisper-large-v3 ni de otros ajustes en los mismos conjuntos para una comparacion directa.

## Limitaciones y advertencias

- La tasa de error en habla dialectal sigue siendo alta (27,82 % en el Golfo, 20,63 % en emirati); el autor recomienda revisar el texto antes de publicarlo.
- Parte de la mejora se debe a la ortografia de una sola letra (por ejemplo, ه frente a ة), lo que puede reflejar un cambio de grafia y no una mejora real de reconocimiento.
- El modelo no se probo en grabaciones con ruido, musica bajo la voz ni habla con mas de una persona a la vez.
- No debe usarse para decisiones sobre personas, como decisiones legales, medicas o de contratacion.
- El modelo solo cubre arabe e ingles; no se documentan otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios no evaluados.
- El repositorio tiene pocas descargas (21) y ningun like, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/scriptvox/whisper-small-ar
- Modelo base: https://huggingface.co/openai/whisper-small
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Meta Omnilingual ASR Corpus: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
- Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Mozilla Common Voice 18: https://huggingface.co/datasets/mozilla-foundation/common_voice_18_0
- LibriSpeech: https://www.openslr.org/12/
