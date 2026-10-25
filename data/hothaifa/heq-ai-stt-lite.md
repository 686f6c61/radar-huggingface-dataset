# Hothaifa/heq-ai-stt-lite

## Resumen

heq-ai-stt-lite es un modelo de reconocimiento automatico del habla (ASR) especializado en arabe, publicado por el usuario Hothaifa bajo el paraguas de la iniciativa HEQ-AI / HEQ WERDK. Se trata de un ajuste fino (*fine-tuning*) del modelo base Whisper de OpenAI, segun declara el propio autor en la model card, con un objetivo muy concreto: transcribir recitaciones coranicas y audio hablado en arabe a texto ortografico "limpio", es decir, sin marcas de vocalizacion (*tashkeel*). El repositorio contiene 72.593.920 parametros en formato safetensors y ocupa 0,3 GB.

La relevancia de este modelo es acotada pero clara: los Whisper originales estan entrenados sobre decenas de idiomas y no estan optimizados para el dominio de la recitacion coranica, donde el estilo de elocucion, las pausas y la terminologia difieren del arabe conversacional. Un ajuste fino sobre ese dominio puede mejorar la transcripcion de *tajwid* y recitacion, aunque el autor no publica ninguna metrica que lo respalde.

Se trata de un lanzamiento de tipo "lite" (el autor anuncia una version posterior "#PRO" con *full fine-tuning* sobre audio propio alojado en sus servidores). El modelo tiene 0 descargas y 0 *likes* en el momento de redactar esta ficha, no incluye evaluacion cuantitativa y la model card mezcla afirmaciones tecnicas con texto promocional, por lo que debe tratarse como un artefacto experimental y no como una solucion validada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (modelo base de OpenAI, ajustado por HEQ-AI) |
| Parametros totales | 72.593.920 (~72,6 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de la arquitectura Whisper; no confirmado de forma explicita en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea / pipeline | automatic-speech-recognition (audio a texto) |
| Tamano del repositorio | 0,3 GB |
| Autor / organizacion | Hothaifa (HEQ-AI / HEQ WERDK) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un *encoder* que procesa espectrogramas Mel de 30 segundos y un *decoder* autorregresivo que genera tokens de texto, con atención completa sobre la representacion del audio. Por el numero de parametros (72,6 M) el checkpoint de partida encaja con la variante `whisper-base` de OpenAI (~74 M), aunque la model card no identifica explicitamente la variante, solo menciona "the Base Model From Open Ai".

El autor indica que el modelo se obtuvo mediante *fine-tuning* sobre recitacion coranica y audio arabe, y que una version posterior ("#PRO") se entreno con *full fine-tuning* sobre audio alojado en su CDN. No se especifican el numero de horas de audio, la composicion del dataset, el regimen de entrenamiento (learning rate, epochs, precision), ni si hubo etapas de RLHF/DPO (no aplicables de forma habitual en ASR). Tampoco se documenta ninguna innovacion arquitectonica: no hay atencion lineal, decodificacion especulativa ni variantes MoE; es un ajuste fino convencional sobre un modelo denso ya existente.

Un detalle funcional relevante es la decision de diseno de eliminar el *tashkeel* de la salida: el modelo aprende a producir texto sin diacriticos, lo que simplifica la transcripcion y la indexacion pero lo invalida para tareas que requieran vocalizacion exacta.

## Capacidades

- Transcripcion de audio en arabe a texto ortografico sin marcas de vocalizacion (*tashkeel*).
- Reconocimiento de recitacion coranica (*tilawa*) como dominio principal de especializacion.
- Procesamiento de audio en ventanas de 30 segundos, con posibilidad de concatenar resultados para audios mas largos mediante segmentacion externa.
- Salida de texto plano en ortografia arabe estandar, apta para busqueda, indexacion y comparacion de cadenas.
- No se documenta soporte de *tool calling*, function calling ni comportamiento agentico (no es un modelo de lenguaje, sino un modelo acustico).
- No se documenta capacidad multilingue: el tag de idioma es unicamente `ar`.
- No se documentan capacidades de traduccion, diarizacion de hablantes, timestamps a nivel de palabra ni deteccion de idioma.
- No se documenta *thinking mode*, vision ni audio-tags especiales mas alla de la transcripcion.

## Casos de uso

- Transcripcion e indexacion de recitaciones coranicas: convertir grandes archivos de audio de *tilawa* en texto plano para construir un buscador sobre el corpus, aprovechando que la salida sin *tashkeel* normaliza las variantes de escritura y facilita las coincidencias.
- Verificacion de memorizacion (*hifz*) en aplicaciones educativas: comparar la transcripcion del audio del estudiante con el texto de referencia del *mushaf* para detectar omisiones o sustituciones de palabras.
- Generacion de subtitulos para clases, sermones (*khutba*) y conferencias en arabe: segmentar el audio en bloques de 30 segundos y aplicar el modelo bloque a bloque para producir subtitulos con desfase controlado.
- Construccion de corpus para entrenamiento de TTS o de otros modelos ASR: el modelo puede actuar como etiquetador automatico de audio no transcrito, siempre que se aplique una etapa de revision humana dado el riesgo de alucinacion.
- Alineacion audio-texto en apps de recitacion sincronizada: usar las transcripciones parciales para localizar el *aya* correspondiente y sincronizar la reproduccion con el texto resaltado.
- Procesamiento *batch* en CPU: con 72,6 M de parametros el modelo es viable en servidores sin GPU, lo que permite transcribir volumenes moderados de audio en pipelines nocturnos con `whisper.cpp` o `faster-whisper`.
- Moderacion y analisis de contenido en plataformas de audio arabe: clasificacion posterior de transcripciones para detectar contenido inapropiado o catalogar tematicas, usando el ASR como primer eslabon del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER, MMLU, HumanEval ni ninguna otra metrica, ni tampoco comparaciones con Whisper original o con otros sistemas ASR en arabe. Cualquier cifra de calidad para este checkpoint deberia obtenerse midiendo WER sobre un conjunto propio de recitacion y de arabe conversacional antes de considerarlo para produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32, 0,15 GB en FP16 y 0,07 GB en INT8 solo para los pesos; con *overhead* de runtime es razonable reservar entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (T4, L4, RTX 3060, RTX 4090). Una A100 o H100 esta completamente sobredimensionada para este tamano.
- CPU: el modelo cabe holgadamente en memoria RAM y es ejecutable en CPU; es el escenario de despliegue mas realista para este checkpoint.
- Opciones de despliegue: `transformers` (pipeline de `automatic-speech-recognition`), `faster-whisper` (CTranslate2, requiere conversion previa), `whisper.cpp` (requiere conversion a GGML), WhisperX para alineacion temporal. vLLM tiene soporte de Whisper, pero no hay confirmacion de compatibilidad con este checkpoint concreto. Ollama no soporta modelos de audio Whisper.
- Latencia y throughput: no se han publicado mediciones. Por el tamano (72,6 M de parametros) es esperable un factor de tiempo real muy por debajo de 1 en GPU moderna y cercano al tiempo real en CPU con `whisper.cpp`, pero son estimaciones derivadas del tamano, no datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hothaifa/heq-ai-stt-lite | 72,6 M | 30 s | arabe (especializado en coranico) | Apache 2.0 | HuggingFace, safetensors, 0 descargas |
| openai/whisper-base | ~74 M | 30 s | ~99 idiomas | Apache 2.0 | HuggingFace, ampliamente adoptado |
| openai/whisper-small | ~244 M | 30 s | ~99 idiomas | Apache 2.0 | HuggingFace, ampliamente adoptado |
| openai/whisper-large-v3 | ~1550 M | 30 s | ~99 idiomas | Apache 2.0 | HuggingFace, referencia de calidad en ASR multilingue |

La comparacion cuantitativa de calidad (WER en arabe o en recitacion coranica) no esta disponible para este checkpoint ni se ha publicado una evaluacion propia. La ventaja teorica del ajuste fino es la especializacion de dominio y la salida sin *tashkeel*; la desventaja es la ausencia de validacion publica frente a los Whisper originales, que cuentan con anos de uso y evaluaciones independientes.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay WER ni comparaciones, y el repositorio registra 0 descargas, por lo que no existe evidencia externa de calidad.
- Riesgo de alucinacion tipico de Whisper: en pasajes silenciosos, ruido o audio musical el decoder puede generar texto inventado, incluyendo frases coranicas plausibles pero incorrectas. Es especialmente peligroso en contextos religiosos.
- La eliminacion del *tashkeel* es intencionada, pero implica que el modelo no sirve para tareas que requieran vocalizacion exacta del texto.
- Cobertura limitada a arabe (`ar`): no se documenta rendimiento en dialectos (egipcio, levantino, magrebi, golfo) ni en arabe conversacional cotidiano; el ajuste esta orientado a recitacion.
- Ventana de 30 segundos: los audios largos requieren segmentacion externa, lo que introduce errores de corte y dificulta la coherencia entre fragmentos.
- La model card es escasa y contiene afirmaciones no verificables (menciona que el modelo se puede "descargar de la compania madre" y volver a ajustar, sin detallar hiperparametros); no debe tomarse como documentacion tecnica fiable.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- No hay informacion sobre sesgos acusticos (genero, edad, dialecto) ni sobre el tratamiento de datos de entrenamiento, lo que dificulta una evaluacion de riesgo.
- Al ser un ajuste fino sobre un modelo base pequeno, es previsible que el ajuste degrade el rendimiento en arabe general respecto al Whisper base original (olvido catastrofico), algo que el autor no cuantifica.
- Los modelos relacionados del mismo autor (HEQ-M1.2, HEQ4-Thinking-V1, HEQ-Agent-1.0.0, HEQ-S2-1.6.6) son LLM de 31 B sin relacion tecnica con este checkpoint ASR; no deben usarse como referencia de calidad del mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hothaifa/heq-ai-stt-lite
- Sitio del autor / organizacion: https://heqwerdk.com
- Modelo relacionado del mismo autor (LLM 31 B, no ASR): https://featherless.ai/models/Hothaifa/HEQ-M1.2
- Modelo relacionado del mismo autor (LLM 31 B, no ASR): https://featherless.ai/models/Hothaifa/HEQ-S2-1.6.6
- Modelo relacionado del mismo autor: https://huggingface.co/Hothaifa/HEQ4-Thinking-V1
- Modelo relacionado del mismo autor: https://huggingface.co/Hothaifa/HEQ-Agent-1.0.0
- Ficha de terceros sobre otro modelo del autor: https://free2aitools.com/model/hothaifa/heq-m1.2
- Repositorio del modelo base (Whisper, OpenAI): https://github.com/openai/whisper
