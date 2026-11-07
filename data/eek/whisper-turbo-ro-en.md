# eek/whisper-turbo-ro-en

## Resumen

eek/whisper-turbo-ro-en es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla openai/whisper-large-v3-turbo, publicado por el usuario eek en Hugging Face. El modelo parte de la arquitectura Whisper de OpenAI, un transformer encoder-decoder disenado para transcripcion de audio, y esta especializado en rumano (ro) e ingles (en), segun los metadatos del repositorio. Con 808.878.080 parametros totales, se situa en la misma escala que el modelo base del que deriva.

El problema que aborda es la transcripcion de habla cotidiana en rumano, un idioma con menos recursos que el ingles en el ecosistema ASR, manteniendo a la vez capacidad para ingles. Al derivar de whisper-large-v3-turbo, hereda la arquitectura optimizada del modelo turbo de OpenAI, que reduce el numero de capas del decoder respecto a whisper-large-v3 para ganar velocidad de inferencia a costa de una ligera perdida de precision.

Es relevante para desarrolladores que necesitan ASR bilingue rumano-ingles con licencia MIT y compatibilidad con el ecosistema transformers, faster-whisper y CTranslate2. El acceso al repositorio esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, heredada de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el tag ctranslate2 sugiere soporte de cuantizacion int8 a traves de faster-whisper |
| Idiomas soportados | rumano (ro), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); compatible con CTranslate2 segun tags |

## Arquitectura y entrenamiento

El modelo es un fine-tune de openai/whisper-large-v3-turbo, que a su vez es una variante de Whisper large-v3 con el decoder reducido a 4 capas (frente a las 32 del large-v3 original), lo que rebaja el total de parametros a aproximadamente 809 millones y acelera la decodificacion. Whisper emplea un encoder que procesa espectrogramas Mel de 30 segundos y un decoder autorregresivo que genera tokens de texto con marcas de tiempo. El modelo base fue entrenado por OpenAI con 680.000 horas de audio etiquetado y 5 millones de horas de audio sin etiquetar en un esquema de aprendizaje debilmente supervisado.

No se dispone de informacion detallada sobre el dataset de ajuste fino, el numero de horas de audio empleadas, la composicion exacta del corpus ni si se aplicaron tecnicas de aumento de datos o regularizacion. La descripcion publica solo indica que esta orientado a "rumano hablado cotidiano" y a ingles. Tampoco se documenta si hubo etapas de RLHF, DPO o ajuste con perdida CTC adicional. Los tags del repositorio indican compatibilidad con faster-whisper y CTranslate2, lo que implica que los pesos pueden convertirse al formato optimizado de CTranslate2 para inferencia en CPU y GPU.

## Capacidades

- Transcripcion de voz a texto (ASR) en rumano e ingles.
- Generacion de marcas de tiempo por segmento, heredadas del formato Whisper.
- Deteccion de idioma entre los dos idiomas soportados (ro, en), segun el comportamiento estandar de Whisper.
- Traduccion de voz a texto en ingles desde el audio de entrada, si el modelo conserva la tarea `translate` del base (no confirmado en la informacion disponible).
- Compatibilidad con la pipeline `automatic-speech-recognition` de transformers.
- Compatibilidad con faster-whisper y CTranslate2 para despliegue de baja latencia.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y llamadas en rumano: el modelo puede procesar audio conversacional y generar transcripciones con marcas de tiempo, adecuado para equipos que operan en Rumania y necesitan actas automaticas.
- Subtitulado de contenido audiovisual bilingue: genera segmentos con timestamps que se pueden convertir directamente a formato SRT/VTT para videos en rumano o ingles.
- Atencion al cliente con analitica de voz: transcripcion de grabaciones de call centers para analisis de sentimiento y control de calidad, aprovechando la licencia MIT para uso comercial.
- Asistentes de voz embebidos: al derivar de whisper-large-v3-turbo y ser convertible a CTranslate2, puede ejecutarse en CPU con cuantizacion int8 en dispositivos sin GPU dedicada.
- Documentacion clinica o legal dictada: transcripcion de notas de voz en rumano con la ventaja de que los pesos son abiertos y pueden desplegarse on-premise para cumplir requisitos de privacidad.
- Investigacion en ASR de bajo recurso: punto de partida para experimentos de ajuste fino adicional o evaluacion comparativa de modelos Whisper en rumano.
- Pipelines de accesibilidad: generacion de transcripciones en tiempo casi real para eventos y clases en entornos rumanoparlantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,6-2 GB para los pesos (809 M de parametros), mas memoria para activaciones y buffers de audio; en la practica, 4-6 GB de VRAM son suficientes para lotes pequenos.
- En cuantizacion int8 via CTranslate2/faster-whisper, el modelo puede ocupar alrededor de 0,8-1 GB de memoria, lo que permite ejecucion en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. Para despliegues de alto throughput, A100/H100 con vLLM no aplica directamente (vLLM no soporta Whisper de forma nativa); se recomienda faster-whisper con CTranslate2 o TGI si soporta la tarea ASR.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 y similares.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), faster-whisper, CTranslate2, FriendliAI como endpoint de inferencia. Ollama y llama.cpp no soportan Whisper de forma estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo turbo de OpenAI se caracteriza por una decodificacion mas rapida que large-v3 gracias a su decoder de 4 capas, pero no se aportan cifras concretas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| eek/whisper-turbo-ro-en | 809 M | 30 s por segmento | ro, en | MIT | Gated |
| openai/whisper-large-v3-turbo | 809 M | 30 s por segmento | multilingue (99 idiomas) | MIT | Abierto |
| openai/whisper-large-v3 | 1.550 M | 30 s por segmento | multilingue (99 idiomas) | MIT | Abierto |
| openai/whisper-small | 244 M | 30 s por segmento | multilingue | MIT | Abierto |

La ventaja de este modelo frente a whisper-large-v3-turbo es la especializacion en rumano, que puede traducirse en menor tasa de error en ese idioma a costa de perder cobertura multilingue. Frente a whisper-large-v3, ofrece menor coste computacional por el decoder reducido, aunque con menor precision potencial en tareas complejas. No se dispone de datos de benchmarks comparativos para cuantificar estas diferencias.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Cobertura limitada a rumano e ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- No hay datos publicados de WER, benchmarks ni evaluacion formal, por lo que la calidad real del fine-tune no puede verificarse a partir de la informacion disponible.
- Riesgo de alucinacion inherente a Whisper: en audio con ruido, silencios largos o habla solapada puede generar texto inventado o repetir frases.
- Sesgos: al derivar de Whisper, puede heredar sesgos de genero, acento y dialecto presentes en los datos de entrenamiento originales; el ajuste fino en rumano podria acentuar el sesgo hacia variantes estandar del idioma.
- Limitacion de contexto: Whisper procesa ventanas de 30 segundos; audios mas largos requieren segmentacion y pueden perder coherencia entre fragmentos.
- Licencia MIT permite uso comercial, pero al ser un modelo derivado conviene revisar las condiciones del modelo base y del acceso gated.
- El reducido numero de descargas (81) y likes (1) sugiere poca validacion comunitaria; no se recomienda para produccion sin evaluacion propia.
- No se documenta soporte de diarizacion de hablantes ni de puntuacion avanzada.

## Enlaces

- [Hugging Face: eek/whisper-turbo-ro-en](https://huggingface.co/eek/whisper-turbo-ro-en)
- [FriendliAI: whisper-turbo-ro-en](https://friendli.ai/models/eek/whisper-turbo-ro-en)
- [Modelo base: openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
