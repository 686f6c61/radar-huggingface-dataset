# aoiandroid/whisper-medium

## Resumen

`aoiandroid/whisper-medium` es un espejo (mirror) sin modificaciones de `openai/whisper-medium`, fijado al commit `abdf7c39ab9d0397620ccaea8974cc764cd0953e`. Lo publica el usuario aoiandroid con una motivacion estrictamente operativa: que la aplicacion Cription no dependa de un repositorio de terceros para descargar los ficheros que necesita. No se trata, por tanto, de un modelo nuevo ni de un ajuste fino, sino de una copia de ficheros con las mismas rutas, tamanos y hashes SHA-256 que el repositorio de origen.

Whisper es el sistema de reconocimiento automatico del habla (ASR) de OpenAI, basado en una arquitectura transformer encoder-decoder que trabaja sobre ventanas de audio de 30 segundos convertidas en espectrogramas log-Mel. La variante `medium` es el punto intermedio de la familia: 769 millones de parametros, capacidad multilingue y un coste de inferencia que cabe en GPU de consumo, lo que la convierte en una opcion habitual para transcripcion en local. La licencia declarada es Apache-2.0.

Es relevante ahora por dos motivos practicos: el modelo original sigue siendo una referencia solida para ASR en produccion sin dependencia de APIs en la nube, y este espejo demuestra un patron de despliegue reproducible (versionado por commit) util para equipos que necesitan fijar artefactos. Conviene advertir, no obstante, que este repositorio concreto ocupa solo 4,4 MB en 10 ficheros, de modo que no contiene los pesos completos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para ASR, segun el modelo original |
| Parametros totales | 769 millones (openai/whisper-medium); no declarado en este espejo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (aprox. 1500 fotogramas de espectrograma tras la convolucion); no declarado en este espejo |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados en este repositorio; el ecosistema ofrece variantes int8 y otras de terceros |
| Idiomas soportados | Multilingue (familia Whisper); el espejo no declara lista de idiomas -> no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Repositorio espejo: solo un subconjunto de ficheros (10 ficheros, 4,4 MB); no incluye los pesos completos. El original usa safetensors ademas de binarios PyTorch -> no disponible en este espejo |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo original de OpenAI y no ha sido alterada por el autor del espejo. Whisper es un transformer encoder-decoder que procesa audio a 16 kHz: se calcula un espectrograma log-Mel de 80 canales sobre una ventana de 30 segundos (3000 fotogramas), se reduce a aproximadamente 1500 posiciones mediante convoluciones con stride 2, y el decoder genera la transcripcion de forma autorregresiva, intercalando tokens especiales de idioma, tarea (transcripcion o traduccion) y marcas de tiempo. En la variante medium, el encoder y el decoder tienen 24 capas cada uno, con una dimension de modelo de 1024 y 16 cabezas de atencion. Los detalles de entrenamiento (numero exacto de horas de audio, composicion del dataset, uso de RLHF o DPO) no se especifican en la informacion disponible de este espejo -> no disponible.

Sobre el proceso de creacion de este repositorio, lo unico verificable es lo que declara su model card: se copio un subconjunto del repositorio de origen (unicamente los ficheros que la aplicacion utiliza), conservando rutas identicas, y cada fichero mantiene tamano y SHA-256 / git blob id coincidentes con el origen. La model card original se conserva como `SOURCE_README.md`. No hay entrenamiento, destilacion ni modificacion de pesos: es una copia byte a byte. El aviso importante es que el total de 4,4 MB en 10 ficheros es incompatible con los aproximadamente 3 GB que ocuparian los pesos en fp16, por lo que este repositorio no es autosuficiente para ejecutar inferencia tal cual.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio en ventanas de 30 segundos, con marcas de tiempo a nivel de segmento.
- Transcripcion multilingue en la variante medium de Whisper (el espejo no enumera idiomas concretos).
- Traduccion de voz a texto en ingles (tarea de traduccion) en la familia Whisper.
- Deteccion y condicionamiento por idioma mediante tokens especiales del decoder.
- Robusteza relativa a ruido de fondo y a variacion de acento, propia del entrenamiento a gran escala de Whisper.
- No se documenta soporte de tool calling, function calling ni uso como agente en la informacion disponible -> no disponible.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio generativo -> no disponible.
- Long-form: la familia Whisper permite transcripcion de audio largo mediante ventaneado y encadenamiento; no confirmado en este espejo -> no disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo convierte audio en texto con marcas de tiempo, lo que permite generar actas indexables y buscar por fragmentos en herramientas internas sin enviar el audio a servicios externos.
- Subtitulado automatizado de video: con las marcas de tiempo de segmento se pueden producir ficheros SRT/VTT para contenido formativo o corporativo, ajustando despues la sincronizacion manualmente.
- Dictado en aplicaciones de escritorio: integrado via un runtime local (por ejemplo, un motor ONNX o CoreML, como sugiere la propia coleccion de modelos del autor), ofrece dictado offline con baja dependencia de red.
- Indexacion y busqueda semantica de archivos de audio: la transcripcion alimenta un pipeline de embeddings y busqueda sobre grabaciones de soporte, llamadas o podcasts.
- Analitica de contact center: transcripcion por lotes de llamadas para extraer palabras clave, motivos de contacto y tiempos de habla, evitando el coste por minuto de APIs comerciales.
- Accesibilidad: generacion de subtitulos en directo o diferidos para personas con discapacidad auditiva en plataformas internas o educativas.
- Preprocesado para pipelines posteriores: la salida de ASR sirve como entrada a un LLM para resumen, clasificacion de intencion o extraccion de entidades en flujos RAG.
- Fijacion de artefactos en despliegues reproducibles: el patron de espejo por commit permite garantizar que la version del tokenizer y la configuracion no cambian de forma silenciosa en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este espejo no incluye metricas (WER, MMLU, HumanEval ni ninguna otra), y no se han localizado cifras verificables en los resultados de busqueda proporcionados. Para cifras de referencia habria que consultar la documentacion y el paper originales de OpenAI, fuera del alcance de esta ficha. No se inventan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamano de 769 M de parametros del modelo original): aproximadamente 1,5-2 GB en fp16 solo para pesos, y del orden de 2-4 GB contando activaciones y cache; en int8 baja a aproximadamente 1 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica; desde una GTX 1650 o RTX 3050 hasta A100 o H100 si se prioriza throughput masivo por lotes.
- Cabe en GPU de consumo: si. La familia medium de Whisper esta disenada para ejecutarse en hardware de gama media, incluidas GPUs de portatil y equipos con aceleracion integrada o NPU.
- Opciones de despliegue: llama.cpp/whisper.cpp, faster-whisper (CTranslate2), vLLM con soporte de ASR, Hugging Face Transformers, TGI, ONNX Runtime, CoreML y LiteRT, segun los modelos relacionados que aparecen en la busqueda.
- Latencia y throughput: no disponibles. Dependen fuertemente del backend, del lote y del hardware, y no se proporcionan mediciones en la informacion disponible.
- Nota critica: este repositorio concreto (10 ficheros, 4,4 MB) no contiene los pesos, por lo que no es ejecutable por si solo; habria que obtener los pesos del repositorio original o de una variante de terceros.

## Comparativa con modelos similares

Los valores de la columna de este modelo corresponden a la familia Whisper en su variante medium, segun la documentacion publica de OpenAI. Las cifras de las alternativas se ofrecen como referencia general; no proceden de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aoiandroid/whisper-medium (espejo de openai/whisper-medium) | 769 M | 30 s | Multilingue | apache-2.0 | Hugging Face; espejo sin pesos completos |
| openai/whisper-small | 244 M | 30 s | Multilingue | apache-2.0 | Hugging Face; mas rapido, menor precision |
| openai/whisper-large-v3 | 1550 M | 30 s | Multilingue | apache-2.0 | Hugging Face; mayor precision, mayor coste |
| Variantes destiladas tipo distil-whisper | Menor que el original | 30 s | Principalmente ingles | no disponible | Hugging Face; menor latencia |

No se dispone de datos de rendimiento comparado (WER) dentro de la informacion proporcionada que permitan ordenar estos modelos con rigor.

## Limitaciones y advertencias

- El repositorio es un espejo parcial: 4,4 MB y 10 ficheros. No incluye los pesos del modelo, de modo que no puede usarse para inferencia sin descargar los pesos originales.
- Riesgo de alucinacion: los modelos ASR de la familia Whisper pueden generar texto plausible en segmentos con silencio, musica o ruido, especialmente en audios largos o con baja relacion senal-ruido. Conviene validar la salida en produccion.
- Sesgos conocidos: el rendimiento varia de forma notable segun el idioma, el acento y la calidad de grabacion, con peor comportamiento en lenguas de bajos recursos y en dominios muy especificos.
- Limitacion de ventana: el encoder procesa bloques fijos de 30 segundos; el audio mas largo requiere estrategias de ventaneado y encadenamiento que pueden introducir errores en las fronteras.
- Sin garantias de actualizacion: al estar fijado a un commit concreto, el espejo no recibira mejoras del repositorio original salvo que el autor lo actualice manualmente.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribucion a los autores originales (OpenAI); el espejo lo declara explicitamente en su model card.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-10, posterior a la fecha habitual de publicacion de la familia Whisper; se reporta tal cual, sin interpretacion adicional.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en comunidad.
- No hay datos de pipeline declarados en la ficha de HuggingFace, por lo que la integracion debe configurarse manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aoiandroid/whisper-medium
- Repositorio de origen: https://huggingface.co/openai/whisper-medium
- Commit de origen: https://huggingface.co/openai/whisper-medium/tree/abdf7c39ab9d0397620ccaea8974cc764cd0953e
- Coleccion Whisper del autor: https://huggingface.co/collections/aoiandroid/whisper
- Variante CoreML relacionada: https://huggingface.co/aoiandroid/whisper-openai-whisper-medium.en-coreml
- Repositorio de codigo de Whisper (OpenAI): https://github.com/openai/whisper
- Modelos compatibles con sherpa-onnx: https://huggingface.co/models?other=sherpa-onnx
- Modelos compatibles con LiteRT: https://huggingface.co/models?library=tflite
- Variante int8 para LiteRT de referencia: https://huggingface.co/Arm/whisper-medium-int8-litert
