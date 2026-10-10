# aoiandroid/whisper-large-v3

## Resumen

`aoiandroid/whisper-large-v3` no es un modelo nuevo: es un **mirror sin modificaciones** de `openai/whisper-large-v3`, publicado por el usuario `aoiandroid` para que su aplicación (Cription) no dependa de un repositorio de terceros. El propio autor lo declara en la model card, indica el commit exacto de origen (`06f233fe06e710322aca913c1bc4249a0d71fce1`) y mantiene la licencia Apache 2.0 del proyecto original.

El repositorio contiene únicamente un subconjunto del repositorio fuente: 12 archivos y 4,6 MB, con las mismas rutas y sin alteraciones en tamaños ni hashes. Esa cifra es relevante: un modelo Whisper large-v3 completo ocupa en torno a 3 GB en fp16, de modo que 4,6 MB son compatibles con el conjunto de configuración, tokenizer y preprocesador, pero no con los pesos del modelo. Quien quiera ejecutar inferencia deberá obtener los pesos del repositorio original de OpenAI o de una conversión equivalente.

La utilidad de esta ficha es, por tanto, doble: sirve como referencia del modelo subyacente (Whisper large-v3, un modelo de reconocimiento automático de voz encoder-decoder de 1,55 mil millones de parámetros) y como advertencia sobre qué contiene realmente este repositorio concreto.

## Especificaciones tecnicas

Las especificaciones marcadas como "modelo original" corresponden a `openai/whisper-large-v3`, del cual este repositorio es un mirror declarado; no se han podido verificar desde el contenido de este repositorio.

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para audio a texto (modelo original) |
| Parametros totales | 1.550 millones (modelo original); no verificable en este repositorio |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos (1500 frames de entrada); decoder limitado a 448 tokens de texto (modelo original) |
| Tipos de cuantizacion | no incluidos en este repositorio; en el ecosistema existen fp16, int8 y GGUF (q5, q8) para whisper.cpp y CTranslate2 |
| Idiomas soportados | 99 idiomas en el modelo original; no declarados en este repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag del repositorio); el mirror solo incluye 12 archivos y 4,6 MB, por lo que no contiene los pesos completos |
| Autor del repositorio | aoiandroid (mirror); autor del modelo: OpenAI |
| Descargas / likes | 0 / 0 |
| Fecha declarada de creacion | 2026-10-10 |

## Arquitectura y entrenamiento

Whisper large-v3 sigue la arquitectura seq2seq de la familia Whisper: un encoder que consume espectrogramas mel de 128 bandas calculados sobre ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto con marcas de tiempo. Es un modelo denso, no un MoE ni un modelo híbrido SSM, y su entrenamiento combina aprendizaje supervisado multitarea (transcripción, traducción al inglés, detección de idioma y predicción de timestamps) sobre audio débilmente etiquetado a gran escala. La información proporcionada no detalla el número de tokens ni la composición exacta del dataset de large-v3, por lo que esos datos se consideran no disponibles.

En lo que respecta a este repositorio, no hay ningún proceso de entrenamiento, ajuste fino ni innovación técnica propia: el autor indica explícitamente que no se ha modificado ningún archivo respecto al origen y que el objetivo es puramente de disponibilidad para su aplicación. No hay pesos, no hay adaptadores LoRA y no hay ficheros de cuantización; el contenido se limita al subconjunto de archivos que la aplicación consume.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe: transcripción de audio a texto en 99 idiomas en el modelo original.
- Traducción de voz a texto en inglés (tarea X→en), además de la transcripción en el idioma de origen.
- Detección automática del idioma del audio y segmentación con marcas de tiempo a nivel de segmento.
- Robustez frente a ruido de fondo y acentos diversos, según la documentación de OpenAI (no verificable aquí).
- No es un modelo de lenguaje: no genera texto libre, no responde a instrucciones ni mantiene conversaciones.
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta visión, aunque procese audio mediante espectrogramas.
- La diarización de hablantes y las marcas de tiempo a nivel de palabra requieren herramientas externas (por ejemplo, WhisperX o pyannote).
- Este repositorio concreto, al no incluir pesos, no ofrece ninguna capacidad ejecutable por sí mismo.

## Casos de uso

- Subtitulado automático de vídeo: el modelo transcribe pistas de audio y devuelve timestamps por segmento, lo que permite generar ficheros SRT o VTT y sincronizarlos con el vídeo en un pipeline de postproducción.
- Transcripción de reuniones y notas de voz: con audio troceado en ventanas de 30 segundos y agregación posterior, se pueden convertir horas de grabación en actas indexables, combinándolo con un LLM para el resumen.
- Análisis de llamadas en atención al cliente: transcripción masiva de grabaciones para auditar calidad, detectar motivos de contacto recurrentes o alimentar sistemas de búsqueda semántica sobre conversaciones.
- Accesibilidad: generación de subtítulos en directo o en diferido para personas con discapacidad auditiva, usando el modelo con un backend optimizado (faster-whisper o whisper.cpp) para reducir latencia.
- Documentación clínica y legal: dictado de informes donde se necesita transcripción fiel y local (on-premise) para no enviar datos sensibles a servicios en la nube; la licencia Apache 2.0 permite ese despliegue.
- Creación de datasets de habla: generación de transcripciones a escala para entrenar o evaluar modelos ASR propios en un idioma concreto, o para construir corpus paralelos.
- Búsqueda por voz en archivos audiovisuales: indexación de una videoteca mediante transcripciones y recuperación por palabra clave o similitud semántica.
- Traducción de contenido hablado a inglés: para podcasts o material formativo en otros idiomas, aprovechando la tarea de traducción integrada del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio mirror no incluye tabla de métricas, y la model card únicamente documenta la procedencia, el commit de origen y el inventario de archivos. El repositorio original de OpenAI publica comparativas de tasa de error de palabra (WER) por idioma y frente a large-v2, pero no se reproducen aquí al no formar parte de la información proporcionada ni poder verificarse desde este mirror.

## Requisitos de hardware

- Tamaño de pesos del modelo original: aproximadamente 3,1 GB en fp16 y en torno a 6,2 GB en fp32. Este repositorio no incluye pesos, por lo que no es desplegable tal cual.
- VRAM estimada para inferencia del modelo original: unos 4-6 GB en fp16 con backend optimizado, y en torno a 2 GB o menos con cuantización int8 o GGUF q5.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, e incluso en GPUs de 6-8 GB con cuantización.
- GPU de centro de datos recomendadas para alto throughput: A100 40/80 GB, H100, L40S, siempre que se procesen lotes grandes de audio en paralelo.
- También es viable en CPU con whisper.cpp y cuantización GGUF, con velocidad muy inferior a tiempo real.
- Opciones de despliegue: transformers (Hugging Face), faster-whisper sobre CTranslate2, whisper.cpp, WhisperX, vLLM con soporte de Whisper y servidores de inferencia tipo TGI o Triton con backends personalizados.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

Los datos de la columna "modelo" proceden de la documentación pública de cada modelo original, no de este repositorio.

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3 (este mirror) | 1,55 B (modelo original) | ventanas de 30 s | 99 | apache-2.0 | mirror parcial: 12 archivos, 4,6 MB, sin pesos |
| openai/whisper-large-v3 (original) | 1,55 B | ventanas de 30 s | 99 | apache-2.0 | repositorio completo con pesos en safetensors |
| openai/whisper-large-v2 | 1,55 B | ventanas de 30 s | ~99 | apache-2.0 | pesos completos; menor precisión declarada que v3 en varios idiomas |
| openai/whisper-medium | 769 M | ventanas de 30 s | ~99 | apache-2.0 | pesos completos; menor consumo, mayor WER |
| distil-whisper/distil-whisper-large-v3 | 756 M | ventanas de 30 s | solo inglés | MIT | destilado, pensado para menor latencia en inglés |

## Limitaciones y advertencias

- Es un mirror, no un modelo propio: no hay mantenimiento por parte de `aoiandroid` más allá de la disponibilidad, y las incidencias deben reportarse contra el repositorio original.
- El repositorio contiene 12 archivos y 4,6 MB. No incluye los pesos del modelo (1,55 B de parámetros), por lo que no permite ejecutar inferencia sin descargar los pesos desde otra fuente.
- Whisper no es un modelo conversacional ni un modelo de instrucciones: no acepta prompts de sistema, no hace tool calling y no razona paso a paso.
- Riesgo de alucinación acústica: en silencios, música o audio muy degradado el modelo puede generar texto plausible pero inexistente, incluyendo bucles repetitivos.
- La ventana de 30 segundos es fija: el audio largo requiere troceado, lo que introduce errores en las fronteras y pérdida de contexto entre fragmentos.
- El rendimiento varía mucho por idioma; los idiomas con pocos recursos presentan tasas de error elevadas. La lista de idiomas no se explicita en este repositorio.
- La tarea de traducción del modelo solo va hacia inglés; no traduce entre dos idiomas distintos del inglés.
- No realiza diarización: no distingue hablantes sin herramientas adicionales.
- Licencia Apache 2.0 en el origen, apta para uso comercial, pero conviene verificar la procedencia de los pesos que se descarguen por separado y conservar la atribución a OpenAI.
- El repositorio declara fechas de creación y actualización en 2026, posteriores a la publicación del modelo original; el contenido no puede verificarse desde la información disponible.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por parte de la comunidad.

## Enlaces

- Mirror en Hugging Face: https://huggingface.co/aoiandroid/whisper-large-v3
- Modelo original: https://huggingface.co/openai/whisper-large-v3
- Commit de origen: https://huggingface.co/openai/whisper-large-v3/tree/06f233fe06e710322aca913c1bc4249a0d71fce1
- Repositorio de código de OpenAI Whisper: https://github.com/openai/whisper
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- whisper.cpp (implementación en C/C++ con GGUF): https://github.com/ggml-org/whisper.cpp
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- WhisperX (timestamps a nivel de palabra y diarización): https://github.com/m-bain/whisperX
- Modelo destilado alternativo: https://huggingface.co/distil-whisper/distil-whisper-large-v3
