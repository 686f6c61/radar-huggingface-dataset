# rostrumstudios/speech-languages

## Resumen

`rostrumstudios/speech-languages` es un espejo público del modelo Omnilingual ASR 1B CTC de Meta, exportado a ONNX en cuantización int8 por el proyecto k2-fsa/sherpa-onnx. No se trata de un modelo nuevo ni de un fine-tuning: es una copia fijada (pinned) de los ficheros exactos que las aplicaciones de Rostrum descargan, verificada mediante SHA-256 en cada uso. El modelo original está diseñado para reconocimiento automático del habla en más de 1.600 idiomas, lo que lo sitúa entre los sistemas ASR multilingües de código abierto con mayor cobertura lingüística declarada.

La relevancia de esta ficha radica en su carácter operativo: el repositorio documenta con precisión los artefactos binarios (un único `model.int8.onnx` de aproximadamente 1 GB y un `tokens.txt` de 86 KB), su procedencia exacta (commit `17db76e` del repositorio de csukuangfj) y su licencia Apache-2.0, tanto para los pesos de Meta como para el código de exportación de sherpa-onnx. Esto lo convierte en un caso útil para estudiar cómo se distribuye un modelo ASR multilingüe en producción con verificación de integridad.

El modelo se usa en Rostrum exclusivamente para análisis (transcripción de audio y subtitulado), nunca para generación de voz o imagen. La información disponible no incluye detalles sobre la arquitectura interna del modelo base, el proceso de entrenamiento ni resultados de benchmarks; esta ficha refleja únicamente lo que el autor documenta en la model card y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Omnilingual ASR 1B CTC de Meta; export ONNX para sherpa-onnx) |
| Parametros totales | no disponible (el nombre del modelo indica 1B; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unico artefacto publicado: `model.int8.onnx`) |
| Idiomas soportados | mas de 1.600 idiomas (segun la model card); lista concreta no disponible |
| Licencia | Apache-2.0 (pesos de Meta y codigo de exportacion sherpa-onnx) |
| Formato de pesos | ONNX (`model.int8.onnx`, 1.031.628.252 bytes) + `tokens.txt` (86.423 bytes) |
| Tamano del repositorio | 1,0 GB |
| Libreria / runtime | onnx, sherpa-onnx |
| Pipeline | automatic-speech-recognition |
| Verificacion de integridad | SHA-256 por fichero (`f7b74c96...` para el modelo, `a7a044c5...` para tokens) |
| Origen exacto | `csukuangfj/sherpa-onnx-omnilingual-asr-1600-languages-1B-ctc-int8-2025-11-12`, commit `17db76eab583b0b868ffb0df104ab879145087e5` |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base Omnilingual ASR 1B CTC. Por el nombre y el pipeline declarado se trata de un modelo CTC (Connectionist Temporal Classification) para reconocimiento automatico del habla, con aproximadamente 1.000 millones de parametros segun la nomenclatura del autor, pero no se confirma en la documentacion disponible. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en ASR).

Lo que si esta documentado es el proceso de exportacion: el equipo de k2-fsa / Next-gen Kaldi (Fangjun Kuang) genero una exportacion ONNX cuantizada a int8 compatible con sherpa-onnx, publicada el 12 de noviembre de 2025. El repositorio de Rostrum redistribuye esos ficheros sin modificacion alguna, fijados a un commit concreto y con hashes SHA-256 publicados para verificacion. El codigo de exportacion de sherpa-onnx esta bajo Apache-2.0, y los pesos originales de Meta tambien se publican bajo Apache-2.0 segun la model card.

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento; se trata de un export estandar de inferencia para un modelo CTC.

## Capacidades

- Reconocimiento automatico del habla (ASR) en mas de 1.600 idiomas, segun la model card del autor original.
- Transcripcion de audio: genera texto a partir de senal de voz (pipeline `automatic-speech-recognition`).
- Subtitulado: el autor indica su uso en Rostrum para "transcripts de Sound y captions de Compose", es decir, generacion de subtitulos a partir de audio.
- Ejecucion via sherpa-onnx con pesos ONNX int8, pensada para inferencia local y eficiente.
- Verificacion de integridad de los ficheros mediante SHA-256 antes de su uso en produccion.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generativo ni modos de razonamiento. El autor especifica explicitamente que el modelo se usa para analisis y nunca para generacion.

## Casos de uso

- Transcripcion multilingue en aplicaciones de mensajeria de voz: el modelo puede convertir notas de audio en texto para usuarios que hablan cualquiera de los mas de 1.600 idiomas cubiertos, con un unico artefacto ONNX de aproximadamente 1 GB que simplifica el despliegue en cliente.
- Subtitulado automatico de contenido audiovisual: integrado en un pipeline de procesamiento de video, genera pistas de subtitulos en el idioma detectado; el autor lo emplea para las "captions de Compose".
- Reconocimiento de voz como respaldo (fallback) en sistemas ASR: en Rostrum se usa "cuando Parakeet no esta seguro", lo que sugiere un patron de ensemble o cascada donde este modelo cubre casos que el modelo principal no resuelve.
- Procesamiento por lotes de archivos de audio en servidores: al ser ONNX int8, puede ejecutarse con sherpa-onnx en CPU sin GPU dedicada, adecuado para transcripcion masiva de grabaciones.
- Aplicaciones de accesibilidad: transcripcion en tiempo real o diferida de conversaciones para personas con discapacidad auditiva, con cobertura amplia de idiomas sin necesidad de multiples modelos por region.
- Investigacion en ASR multilingue de bajo recurso: el modelo permite evaluar el rendimiento en idiomas poco representados usando un checkpoint publico y reproducible con hashes verificables.
- Despliegue en entornos con requisitos de integridad: la publicacion de SHA-256 por fichero facilita la auditoria de la cadena de suministro en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de WER, MMLU, HumanEval ni metricas comparativas, y no se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Al ser un modelo int8 de aproximadamente 1 GB en disco, la huella en memoria es del orden de 1-2 GB, pero no se confirma en la documentacion.
- GPU recomendadas: no disponibles. El formato ONNX con sherpa-onnx esta pensado para ejecucion en CPU; no se documenta soporte GPU especifico.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del artefacto int8, aunque no se confirma oficialmente.
- Opciones de despliegue: sherpa-onnx (runtime principal documentado); al ser ONNX estandar, podria ejecutarse con ONNX Runtime, aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Omnilingual ASR 1B CTC (este repo) | ~1B (segun nombre, no confirmado) | no disponible | 1.600+ | Apache-2.0 | ONNX int8 |
| Whisper large-v3 (OpenAI) | ~1.550M | 30 s de audio | ~99 idiomas | MIT | safetensors, GGUF, etc. |
| Parakeet (NVIDIA) | no disponible | no disponible | no disponible | no disponible | no disponible |
| MMS (Meta) | variable por idioma | no disponible | 1.100+ | CC-BY-NC (segun version) | varios |

Nota: los datos de Whisper, Parakeet y MMS se incluyen como referencia general de categoria; no se han verificado contra la informacion proporcionada en esta busqueda y deben contrastarse antes de usarse en decisiones de produccion. La comparacion de rendimiento (WER) no esta disponible.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni metricas de error (WER) en la informacion disponible; el rendimiento real por idioma es desconocido.
- La lista concreta de los mas de 1.600 idiomas no esta disponible; la cobertura por idioma puede variar significativamente y no se documenta.
- El modelo es un export de terceros (sherpa-onnx) del modelo original de Meta; no es un modelo entrenado por Rostrum y cualquier fallo de la exportacion int8 (perdida de precision por cuantizacion) no esta evaluado en la documentacion.
- Riesgo de alucinacion en ASR: como todo modelo CTC, puede producir transcripciones incorrectas o inventar palabras en audio ruidoso; no se documentan mitigaciones.
- Sesgos: no se documentan sesgos conocidos por idioma, acento o dialecto.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda conservar los avisos de licencia de Meta y de sherpa-onnx incluidos en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un espejo operativo interno, no un modelo con validacion comunitaria.
- El uso declarado por el autor es solo de analisis; no debe emplearse para generacion de voz o imagen.
- El modelo se publica fijado a un commit concreto; actualizaciones del modelo original no se reflejaran automaticamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rostrumstudios/speech-languages
- Origen exacto de los ficheros (csukuangfj): https://huggingface.co/csukuangfj/sherpa-onnx-omnilingual-asr-1600-languages-1B-ctc-int8-2025-11-12
- Modelo y codigo original de Meta: https://github.com/facebookresearch/omnilingual-asr
- Paper (arXiv): https://arxiv.org/abs/2511.09690
- Proyecto sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Perfil del autor en Hugging Face: https://huggingface.co/rostrumstudios
