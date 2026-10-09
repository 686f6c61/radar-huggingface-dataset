# nunu-willump/whisper-large-v3-turbo-es-ct2

## Resumen

whisper-large-v3-turbo-es-ct2 es una conversion a CTranslate2 en FP16 del modelo de reconocimiento automatico del habla adriszmar/whisper-large-v3-turbo-es, un ajuste fino en espanol de Whisper large-v3-turbo de OpenAI. La publica el usuario nunu-willump para el proyecto Chep y no anade entrenamiento ni ajuste propio: se trata de un reempaquetado de los pesos del modelo base en la revision b32b7042f31dbf695857e3a81037a43b97f1eee1, orientado a su uso con la libreria faster-whisper.

El valor practico del repositorio esta en el formato. CTranslate2 permite ejecutar inferencia sin PyTorch ni Transformers, con seleccion de precision en tiempo de carga (float32 para CPU, float16 para CUDA) y con las optimizaciones de faster-whisper, lo que simplifica el despliegue en produccion y reduce la huella de dependencias frente a un pipeline clasico de Transformers.

El modelo hereda la arquitectura encoder-decoder de Whisper large-v3-turbo, con decodificador reducido respecto a large-v3, y esta especializado en transcripcion de audio en espanol. Es relevante para equipos que necesitan ASR en castellano con licencia MIT y despliegue ligero, aunque conviene tener en cuenta que el repositorio tiene cero descargas y cero likes en el momento de la consulta y que la validacion publicada se limita a una comprobacion de equivalencia de empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | ~809 M (arquitectura estandar de whisper-large-v3-turbo; no confirmado en la model card de este repositorio) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 s por segmento (espectrograma mel); 448 tokens maximos en el decodificador (arquitectura Whisper estandar, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 en los pesos guardados; la precision de ejecucion se elige con `compute_type` en carga (float32 y float16 documentados en la model card) |
| Idiomas soportados | es (espanol) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin` mas ficheros de configuracion, tokenizer y vocabulario); no incluye safetensors ni GGUF |
| Tamano del repositorio | 1,6 GB |
| Modelo base | adriszmar/whisper-large-v3-turbo-es, revision b32b7042f31dbf695857e3a81037a43b97f1eee1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con embeddings posicionales sinusoidales, entrenado de forma multitarea para transcripcion, traduccion y deteccion de idioma sobre ventanas de audio de 30 segundos. La variante turbo reduce el numero de capas del decodificador respecto a large-v3, lo que rebaja el coste de decodificacion manteniendo el encoder completo. La model card de este repositorio no incluye datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el ajuste fino original.

Este repositorio concreto no entrena ni ajusta nada: es una conversion a CTranslate2 en FP16 de adriszmar/whisper-large-v3-turbo-es, realizada para el proyecto Chep. Los autores originales conservan el credito y se mantienen las notas de copyright de Whisper y la licencia MIT heredada. Segun la model card, los cinco ficheros de inferencia son identicos byte a byte a la conversion evaluada en un piloto con GPU T4 en Kaggle sobre seis muestras de FLEURS por idioma, y los hashes y versiones del conversor se documentan en `conversion.json`. Ese control se describe explicitamente como una comprobacion de equivalencia de empaquetado, no como una nueva afirmacion de precision general. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla en espanol, con transcripcion de audio a texto segmentada.
- Marcas de tiempo por segmento (`start` y `end`), tal como devuelve la API de faster-whisper en el ejemplo de uso de la model card.
- Ejecucion en CPU y en GPU CUDA seleccionando `device` y `compute_type` en la carga del modelo.
- Inferencia sin PyTorch ni Transformers: solo requiere faster-whisper y los ficheros CTranslate2 del repositorio.
- Segmentacion en multiples fragmentos para audios de duracion superior a la ventana de 30 segundos, mediante la logica de bucle de la propia libreria.
- Modelo exclusivamente de ASR: no soporta tool calling, function calling, uso como agente, generacion de codigo, matematicas, vision ni audio generativo.
- No se documenta soporte multilingue mas alla del espanol declarado, ni modo de razonamiento o "thinking mode".
- La deteccion automatica de idioma y la tarea de traduccion propias de Whisper no se confirman para este ajuste fino monolingue en la informacion disponible.

## Casos de uso

- Transcripcion de podcasts y videos en castellano: el modelo convierte el audio en texto segmentado con marcas de tiempo, lo que permite generar transcripciones navegables y ancladas al minuto exacto del audio original.
- Generacion de subtitulos para plataformas de video: los campos `start` y `end` de cada segmento se mapean directamente a entradas de subtitulo tipo SRT o WebVTT, sin necesidad de un alineador externo para una primera version.
- Analitica de llamadas en centros de contacto: la transcripcion de grabaciones permite alimentar pipelines de analisis de sentimiento, deteccion de motivos de contacto y control de calidad, con la ventaja de que el formato CTranslate2 reduce el coste por hora de audio al ejecutarse sin PyTorch.
- Actas y notas de reunion: la transcripcion de reuniones en espanol puede encadenarse con un modelo de lenguaje posterior para resumir acuerdos y tareas, usando este modelo unicamente como etapa ASR del pipeline.
- Indexacion y busqueda sobre archivos de audio: transcripcion masiva de un archivo de audio (entrevistas, archivo sonoro, grabaciones internas) para despues indexar el texto en un motor de busqueda o en una base vectorial de tipo RAG.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en directo o en diferido en aplicaciones internas, con la licencia MIT permitiendo su integracion en productos propietarios sin obligaciones de copyleft.
- Despliegue en entornos sin GPU: el ejemplo de la model card usa `device="cpu"` con `compute_type="float32"`, lo que habilita transcripcion en servidores sin acelerador para volumenes moderados de audio.
- Preprocesado de datos de voz para entrenamiento de otros modelos: la salida segmentada sirve como etiquetado inicial de corpus de audio en espanol que despues se revisa manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona un piloto con GPU T4 en Kaggle sobre seis muestras de FLEURS por idioma, descrito como comprobacion de equivalencia de empaquetado (`conversion.json` incluye hashes y versiones del conversor) y sin cifras de WER, MMLU, HumanEval ni metricas comparables. No se dispone de resultados de WER sobre Common Voice, Fleurs ni otros conjuntos para este ajuste fino en la informacion proporcionada.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 1,6 GB en disco, equivalentes al tamano del repositorio.
- VRAM estimada en inferencia con CUDA y `compute_type="float16"`: del orden de 2 a 3 GB contando pesos, activaciones y buffers de decodificacion (estimacion propia, no publicada por el autor).
- Inferencia en CPU: viable con `device="cpu"` y `compute_type="float32"`, tal como documenta la model card; el consumo de memoria depende del audio y del paralelismo configurado.
- GPU consumer: cabe con holgura en tarjetas con 4 GB o mas de VRAM (por ejemplo, GTX 1650 4 GB en adelante, RTX 3060, RTX 4070, RTX 4090). La model card no especifica modelos recomendados.
- GPU de datacenter: el piloto documentado uso una T4 de Kaggle; A100 y H100 son compatibles pero estan sobredimensionadas para un modelo de este tamano.
- Opciones de despliegue: faster-whisper (que carga directamente el identificador del repositorio) y la API de CTranslate2 en Python. Otros envoltorios basados en faster-whisper podrian funcionar, pero no se confirman en la model card.
- No compatible con vLLM, llama.cpp, Ollama ni TGI: el formato es CTranslate2, no GGUF ni safetensors con arquitectura de modelo de lenguaje.
- Latencia y throughput: no disponible. No se publican cifras de tiempo real, factor de tiempo real (RTF) ni muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nunu-willump/whisper-large-v3-turbo-es-ct2 | ~809 M (arquitectura turbo) | CTranslate2 FP16 | es | MIT | Conversion de empaquetado sin entrenamiento; 0 descargas y 0 likes en el momento de la consulta |
| adriszmar/whisper-large-v3-turbo-es | ~809 M (arquitectura turbo) | safetensors (Transformers) | es | MIT | Modelo base del anterior; anade el ajuste fino en espanol del que carece la conversion |
| openai/whisper-large-v3-turbo | ~809 M | safetensors (Transformers) | multilingue | MIT | Modelo original de OpenAI; mayor cobertura de idiomas pero sin ajuste especifico en espanol |
| openai/whisper-large-v3 | ~1550 M | safetensors (Transformers) | multilingue | MIT | Decodificador completo de 32 capas; mas precision potencial a cambio de mayor coste de inferencia |

Los parametros y la licencia de los modelos de OpenAI corresponden a sus model cards publicas y no a la informacion proporcionada en esta consulta; se incluyen como referencia de categoria. Los datos de rendimiento relativos (WER comparado) no estan disponibles para ninguno de ellos en la informacion facilitada.

## Limitaciones y advertencias

- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en tramos de silencio, ruido o musica, especialmente con audio de baja calidad; se recomienda activar los umbrales de no-speech y de compresion de faster-whisper en produccion.
- La validacion publicada se limita a seis muestras de FLEURS por idioma en un piloto con T4. No hay evaluacion de WER a gran escala de esta conversion ni del ajuste fino subyacente en la informacion disponible.
- Ventana de audio de 30 segundos: la transcripcion de audios largos depende del bucle de segmentacion de la libreria, lo que puede degradar la coherencia entre segmentos.
- Idioma: el repositorio declara unicamente espanol. No se garantiza un comportamiento correcto con otros idiomas, acentos muy marcados, jerga tecnica ni cambios de codigo en la misma grabacion.
- Sin diarizacion de hablantes ni reconocimiento de quien habla; para eso hace falta un modelo externo de speaker diarization.
- Sin capacidades de lenguaje: no sirve para generacion de texto, razonamiento, codigo ni agentes, pese a compartir la palabra "modelo" con los LLM.
- Trazabilidad limitada: el repositorio tiene cero descargas y cero likes, no esta auditado por terceros y su mantenimiento futuro no esta garantizado.
- Licencia MIT: permite uso comercial y modificacion sin obligaciones de copyleft, pero se deben conservar los avisos de copyright de Whisper y de los autores originales incluidos en el repositorio. La model card de origen para espanol declara MIT sin aviso de copyright adicional del ajustador.
- Advertencia operativa: los pesos estan guardados en FP16 y la precision final depende del `compute_type` elegido; ejecutar en float32 sobre GPU o en precisiones no soportadas puede alterar el rendimiento o fallar en carga.
- La busqueda web realizada no devolvio resultados utiles sobre este modelo; los resultados obtenidos eran irrelevantes y no se han utilizado como fuente.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/nunu-willump/whisper-large-v3-turbo-es-ct2
- Modelo base (ajuste fino en espanol): https://huggingface.co/adriszmar/whisper-large-v3-turbo-es
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- faster-whisper (libreria de inferencia recomendada): https://github.com/SYSTRAN/faster-whisper
- CTranslate2 (runtime de conversion): https://github.com/OpenNMT/CTranslate2
- Ficheros de referencia incluidos en el repositorio: `conversion.json` (hashes y versiones del conversor) y `UPSTREAM_MODEL_CARD.md` (autores originales, datos de entrenamiento, citas y limitaciones)
- No se han encontrado papers, blogs ni demos adicionales sobre este repositorio concreto en la busqueda web disponible.
