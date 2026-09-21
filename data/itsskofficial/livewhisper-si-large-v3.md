# itsskofficial/livewhisper-si-large-v3

## Resumen

Livewhisper-si-large-v3 es una conversion a CTranslate2 del modelo kasunw/whisper-large-v3-sinhala, un ajuste fino de Whisper large-v3 orientado al reconocimiento automatico del habla (ASR) en sinhala. La conversion la publica el autor itsskofficial para su uso con faster-whisper y con LiveWhisper, una aplicacion de dictado por voz para Windows. El repositorio no entrena ningun modelo nuevo: unicamente cambia el formato de los pesos a float16 y anade los ficheros tokenizer.json y preprocessor_config.json que faster-whisper necesita.

Se trata de un modelo exclusivamente de voz a texto, con arquitectura encoder-decoder de tipo transformer heredada de Whisper large-v3, disenado para procesar audio en ventanas cortas y pensado para dictado en tiempo real. Su relevancia practica es limitada pero concreta: es, segun el propio autor, el unico modelo probado que llega a escribir texto en sinhala, aunque sigue fallando en la mayoria de palabras. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

Con un tamano de repositorio de 3,1 GB y pesos de aproximadamente 3 GB en float16, el modelo esta orientado a un nicho muy especifico: usuarios de LiveWhisper que necesitan transcripcion en sinhala y aceptan una tasa de error elevada. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper large-v3) |
| Parametros totales | no disponible en la informacion proporcionada (pesos de ~3 GB en float16, coherentes con la talla large-v3 de Whisper) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la information proporcionada (la arquitectura Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | float16 en los pesos convertidos; int8_float16 en el ejemplo de uso con faster-whisper |
| Idiomas soportados | sinhala (si); la arquitectura base de Whisper large-v3 es multilingue, pero esta conversion esta ajustada y evaluada unicamente en sinhala |
| Licencia | apache-2.0 |
| Formato de pesos | CTranslate2 (float16), acompanado de tokenizer.json y preprocessor_config.json |

## Arquitectura y entrenamiento

El modelo es una conversion de formato, no un entrenamiento nuevo. Parte de kasunw/whisper-large-v3-sinhala, que a su vez es un ajuste fino de openai/whisper-large-v3 sobre datos en sinhala. La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder que convierte espectrogramas de audio en tokens de texto, con atencion completa y sin mecanismos MoE ni SSM. La conversion a CTranslate2 sustituye el formato original de pesos por float16 optimizado para inferencia en CPU y GPU mediante la biblioteca CTranslate2, y anade los ficheros auxiliares que faster-whisper requiere.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica explicitamente que todo el merito del modelo corresponde a sus autores originales y que este repositorio solo modifica el formato de ficheros. El autor describe el resultado como "large-v3 sized, 3 GB converted" y senala que el modelo "sigue fallando en la mayoria de palabras", una advertencia de calidad poco habitual que conviene tomar en serio.

## Capacidades

- Reconocimiento automatico del habla (ASR) en sinhala, tanto en texto nativo como en romanizacion.
- Generacion de transcripciones de audio en ventanas cortas, apto para dictado por voz en tiempo real dentro de LiveWhisper.
- Procesamiento por streaming y por lotes mediante faster-whisper y CTranslate2.
- Ejecucion en CPU y en GPU con distintos tipos de precision (float16, int8_float16).
- No soporta tool calling ni function calling: no es un modelo de lenguaje generativo general, solo transcribe audio.
- No soporta agentes, razonamiento multi-paso, vision ni audio generativo.
- Capacidad multilingue: no disponible; esta enfocado y evaluado exclusivamente en sinhala.

## Casos de uso

- Dictado por voz en Windows: la aplicacion LiveWhisper usa este modelo para convertir habla en texto sinhala directamente sobre el escritorio, aprovechando su integracion nativa con CTranslate2 y su tamano contenido de 3 GB.
- Transcripcion de notas de voz personales: un usuario que graba recordatorios o apuntes en sinhala puede pasarlos por el modelo con faster-whisper en local, sin enviar audio a servicios en la nube.
- Archivado de contenido audiovisual en sinhala: conversion de grabaciones o entrevistas a texto para su indexacion, asumiendo que sera necesario un repaso manual por la elevada tasa de error.
- Asistencia a la accesibilidad: generacion de subtitulos aproximados para personas con dificultades auditivas en contenido hablado en sinhala, siempre como borrador previo a revision humana.
- Procesamiento por lotes en pipelines locales: integracion del modelo en scripts Python con faster-whisper para transcribir carpetas enteras de audio en una maquina con GPU de gama media.
- Desarrollo de aplicaciones .NET o Windows nativas: al estar en formato CTranslate2, puede embeberse en herramientas de escritorio que necesiten ASR offline en sinhala sin depender de APIs externas.
- Investigacion sobre ASR en lenguas de bajos recursos: sirve como punto de partida o referencia para medir el estado del arte en sinhala, dado que el autor compara sus resultados con Whisper large-v3 original.

## Benchmarks y rendimiento

El autor publica en la model card una tabla de mediciones obtenidas en LiveWhisper. Los valores se expresan como porcentaje de error (menor es mejor):

| Metrica | livewhisper-si-large-v3 | whisper large-v3 original |
|---|---|---|
| Error de palabra, Dakshina hablado, nativo | 77,6 % | 114,7 % |
| Error de caracter, Dakshina hablado, nativo | 34,8 % | 101,1 % |
| Romanizado, frente a cualquier grafia aceptada | 76,9 % | 114,7 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a un modelo ASR). Los unicos datos disponibles son los de error de transcripcion anteriores, medidos segun el autor dentro de la propia aplicacion LiveWhisper.

## Requisitos de hardware

- VRAM estimada: en float16 los pesos ocupan aproximadamente 3 GB, por lo que se recomienda un minimo de 4 GB de VRAM libre; con cuantizacion int8_float16 el consumo baja a alrededor de 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM, como una RTX 3050, RTX 3060, RTX 4060 o superiores. En gamas profesionales, una A100 o H100 funciona sin problema, aunque es un modelo pequeno para ese hardware.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna de gama media o superior, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: faster-whisper sobre CTranslate2 (ruta oficial), la aplicacion LiveWhisper para Windows y scripts Python propios. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible en la informacion proporcionada. CTranslate2 suele ofrecer inferencia mas rapida que la implementacion original de Whisper, pero no se aportan cifras concretas de factor de tiempo real ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Rendimiento en sinhala (segun datos disponibles) | Licencia |
|---|---|---|---|---|
| itsskofficial/livewhisper-si-large-v3 | Whisper large-v3 convertido a CTranslate2 | Ventanas de audio de 30 s (arquitectura Whisper) | 77,6 % WER, 34,8 % CER en Dakshina hablado | apache-2.0 |
| kasunw/whisper-large-v3-sinhala | Whisper large-v3 ajustado a sinhala (modelo base) | Ventanas de audio de 30 s (arquitectura Whisper) | no disponible (es el modelo de origen de esta conversion) | no disponible |
| openai/whisper-large-v3 | Whisper large-v3 original (multilingue) | Ventanas de audio de 30 s | 114,7 % WER, 101,1 % CER en Dakshina hablado (medicion del autor) | apache-2.0 (MIT en el repositorio original, segun la informacion disponible) |

La comparativa se limita a estos tres modelos porque no se dispone de datos de otras alternativas de ASR en sinhala. El rendimiento en sinhala de la conversion mejora claramente respecto a Whisper large-v3 original, pero sigue siendo insuficiente para transcripcion automatica fiable.

## Limitaciones y advertencias

- Calidad baja: una tasa de error de palabra del 77,6 % implica que el modelo falla en la mayoria de palabras. El propio autor lo reconoce explicitamente. No es apto para transcripcion de produccion sin revision humana intensiva.
- Sesgos: no disponible. No se documenta la composicion del dataset de ajuste ni posibles sesgos de dominio, acento o genero.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible en silencios o audio ruidoso. No se documenta mitigacion alguna en esta conversion.
- Limitacion idiomatica: solo sinhala. No se ha evaluado en otros idiomas y no debe asumirse que conserva las capacidades multilingues de Whisper large-v3.
- Ambito de uso: es un modelo ASR puro, no un modelo conversacional. No admite prompts de instrucciones, tool calling ni razonamiento.
- Restricciones de licencia: apache-2.0, lo que permite uso comercial. El repositorio es una conversion de terceros, por lo que conviene verificar la licencia y los terminos del modelo base kasunw/whisper-large-v3-sinhala antes de un despliegue comercial.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, y su fecha de creacion registrada (2026-09-21) es posterior a la fecha actual, lo que sugiere metadatos anomales o generados automaticamente. Conviene tratarlo como un artefacto no validado por la comunidad.
- Despliegue: al estar en formato CTranslate2, no puede cargarse con las herramientas habituales para LLM (vLLM, Ollama, llama.cpp). El ecosistema soportado es faster-whisper y LiveWhisper.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsskofficial/livewhisper-si-large-v3
- Modelo base: https://huggingface.co/kasunw/whisper-large-v3-sinhala
- faster-whisper (SYSTRAN): https://github.com/SYSTRAN/faster-whisper
- LiveWhisper (aplicacion de dictado para Windows): https://github.com/itsskofficial/LiveWhisper
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente paginas de soporte de Microsoft sin relacion con el modelo.
