# q-henric/whisper-large-v3-turbo-danish-ct2

## Resumen

`q-henric/whisper-large-v3-turbo-danish-ct2` es una conversion al formato CTranslate2 del modelo `thorhojhus/whisper-large-v3-turbo-danish`, un ajuste fino de Whisper Large v3 Turbo especializado en reconocimiento automatico del habla (ASR) en danes. Lo publica el usuario q-henric (la conversion la firma QBIM) y su proposito es puramente operativo: el checkpoint original esta en formato transformers y no se puede cargar directamente con WhisperX ni con faster-whisper, que requieren ficheros CTranslate2.

El modelo conserva la arquitectura y los pesos del ajuste danes, con 809 millones de parametros y una ventana de audio de 30 segundos por fragmento. La unica diferencia respecto al original es el empaquetado: pesos en `model.bin` cuantizados en float16, mas `config.json`, `vocabulary.json` y los ficheros de tokenizer y preprocesado copiados del modelo de origen. El repositorio ocupa 1,6 GB.

Es relevante para equipos que ya trabajan con el stack faster-whisper/WhisperX y necesitan transcripcion en danes sin pasar por una conversion manual. La licencia MIT del modelo original se mantiene, lo que facilita el uso comercial, aunque el modelo solo cubre un idioma y no cuenta con benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo) |
| Parametros totales | 809 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana |
| Tipos de cuantizacion | float16 (incluida en el repositorio); CTranslate2 permite reconvertir a int8 e int8_float16 |
| Idiomas soportados | danes (da) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`), mas `tokenizer.json`, `vocabulary.json` y `preprocessor_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper Large v3 Turbo, un transformer encoder-decoder disenado para ASR. La variante Turbo reduce el decoder a 4 capas frente a las 32 del large-v3 convencional, lo que baja el total a 809 millones de parametros y acelera la decodificacion manteniendo el encoder completo. El modelo trabaja sobre espectrogramas mel de 30 segundos y genera texto de forma autorregresiva, con marcas de tiempo y deteccion de idioma integradas.

Sobre el entrenamiento del ajuste danes no hay informacion en la model card: no se detallan horas de audio, composicion del dataset, ni si hubo etapas de RLHF o DPO (procedimientos poco habituales en ASR). Tampoco se especifica el procedimiento de destilacion o fine-tuning empleado por `thorhojhus`. Lo unico documentado en este repositorio es la conversion a CTranslate2, que no modifica los pesos mas alla del cambio de formato y la cuantizacion a float16.

## Capacidades

- Transcripcion de voz a texto en danes, con generacion de texto a partir de audio de hasta 30 segundos por fragmento.
- Salida con marcas de tiempo a nivel de segmento y de palabra cuando se usa a traves de WhisperX (alineacion forzada).
- Deteccion automatica del idioma de entrada, aunque el modelo esta especializado en danes.
- Procesamiento por lotes y streaming de ficheros largos mediante segmentacion automatica en faster-whisper y WhisperX.
- Ejecucion en CPU y GPU, con soporte de cuantizacion int8 para entornos sin acelerador.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido, ya que se trata de un modelo puramente ASR.
- No hay capacidades de vision, audio generativo ni traduccion declaradas; la traduccion de audio a ingles que ofrece Whisper de serie no esta validada en este ajuste.

## Casos de uso

- Transcripcion de reuniones y entrevistas en danes: el modelo convierte grabaciones de audio en texto con marcas de tiempo, y la segmentacion automatica de faster-whisper permite procesar sesiones de una hora o mas troceando el audio en ventanas de 30 segundos.
- Subtitulado automatico de video: la integracion con WhisperX aporta alineacion a nivel de palabra, lo que permite generar ficheros SRT o VTT con tiempos precisos para plataformas de video en danes.
- Analisis de llamadas de atencion al cliente: transcripcion por lotes de conversaciones telefonicas para alimentar analitica, busqueda de texto completo o sistemas de control de calidad sobre el contenido hablado.
- Archivado y busqueda de material audiovisual: conversion de archivos de audio historicos o de bibliotecas de podcasts daneses a texto indexable, aprovechando que la inferencia en int8 puede ejecutarse en CPU sin GPU dedicada.
- Generacion de actas y resumenes posteriores: la transcripcion sirve como entrada a un LLM que resuma o extraiga acciones, con el modelo actuando solo en la fase de ASR.
- Investigacion linguistica y creacion de corpus: transcripcion masiva de grabaciones para construir datasets de danes hablado con transcripcion alineada, dado que la licencia MIT permite redistribuir los resultados.
- Accesibilidad: conversion de contenido en audio a texto para personas con discapacidad auditiva en productos dirigidos al mercado danes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye valores de WER (word error rate), y la busqueda web realizada no ha devuelto ninguna fuente tecnica relevante sobre este modelo o su ajuste de origen.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB solo para los pesos en float16, con un consumo total de inferencia en torno a 2-3 GB contando activaciones y cache. En int8 el peso baja a unos 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como RTX 3050, RTX 3060, RTX 4060 o superiores funcionan sin problema. Las A100 y H100 son innecesarias para este tamano y solo tendrian sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si. Es un modelo de 809 millones de parametros en float16, por lo que se ejecuta con holgura en tarjetas de gama media y baja, e incluso en GPUs integradas con memoria compartida suficiente.
- CPU: viable con cuantizacion int8. Adecuado para transcripcion por lotes sin GPU, a costa de mayor latencia.
- Opciones de despliegue: faster-whisper, WhisperX y, en general, cualquier runtime basado en CTranslate2. No es compatible directamente con vLLM, TGI u Ollama, orientados a modelos de lenguaje. Para llama.cpp o whisper.cpp habria que reconvertir los pesos a GGML/GGUF.
- Latencia y throughput: no disponible. CTranslate2 incorpora optimizaciones (fusión de operaciones, ejecucion en CPU con oneDNN) que en la practica reducen el tiempo de inferencia frente a la implementacion original en transformers, pero no hay cifras publicadas para este repositorio concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| q-henric/whisper-large-v3-turbo-danish-ct2 | 809 M | 30 s de audio | danes | MIT | CTranslate2 |
| thorhojhus/whisper-large-v3-turbo-danish | 809 M | 30 s de audio | danes | MIT | transformers / safetensors |
| openai/whisper-large-v3-turbo | 809 M | 30 s de audio | multilingue | MIT | PyTorch / safetensors |
| openai/whisper-large-v3 | 1550 M | 30 s de audio | multilingue | MIT | PyTorch / safetensors |
| distil-whisper/distil-large-v3 | 756 M | 30 s de audio | ingles | MIT | PyTorch / safetensors |

Frente al checkpoint original en transformers, este repositorio no aporta mejor calidad de transcripcion, solo compatibilidad con WhisperX y faster-whisper y un binario listo para usar. Frente a un Whisper large-v3 multilingue, el ajuste danes deberia ofrecer mejor WER en danes, aunque no hay cifras que lo confirmen. Distil-large-v3 es mas rapido pero solo cubre ingles, por lo que no es una alternativa real para este caso de uso.

## Limitaciones y advertencias

- Cobertura de un unico idioma: el modelo esta ajustado para danes. El uso con otros idiomas producira resultados degradados o directamente incorrectos.
- Sesgos: no hay informacion publicada sobre sesgos acusticos (acentos, edad, genero, ruido de fondo) ni sobre el dataset de entrenamiento, por lo que el comportamiento en dominios alejados de los datos de ajuste es impredecible.
- Alucinacion: como todos los modelos Whisper, puede generar texto que no corresponde al audio en fragmentos con silencio, musica o ruido, y repetir frases en bucle. Conviene activar los parametros de control de temperatura y `condition_on_previous_text` en faster-whisper.
- Ventana de 30 segundos: los audios mas largos requieren segmentacion, lo que puede cortar palabras en los limites si no se gestiona con solapamiento.
- Sin benchmarks: no hay valores de WER publicados para verificar la calidad del ajuste frente al modelo base de OpenAI.
- Licencia: MIT, permite uso comercial y redistribucion. Al derivar de Whisper, conviene conservar la atribucion correspondiente al modelo original y a OpenAI.
- Trazabilidad: la revision del modelo base que se uso para la conversion esta fijada a `297b4dddc9c897d7bad0da947649856ff207c5a1`, pero no se documenta si el ajuste danes tiene tarjeta de datos, procedencia del corpus ni evaluacion.
- Repositorio con cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad ni de uso en produccion.
- La busqueda web realizada no ha devuelto fuentes tecnicas relevantes (los resultados obtenidos tratan sobre la letra Q y no guardan relacion con el modelo).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/q-henric/whisper-large-v3-turbo-danish-ct2
- Modelo base en HuggingFace: https://huggingface.co/thorhojhus/whisper-large-v3-turbo-danish
- WhisperX: https://github.com/m-bain/whisperX
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Whisper (OpenAI): https://github.com/openai/whisper
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
