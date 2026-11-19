# remiavelo/whisper-large-v3-turbo-ct2-int8

## Resumen

Whisper large-v3-turbo en formato CTranslate2 con cuantización int8 es una conversión del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3-turbo`, publicada por el usuario remiavelo. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de OpenAI se han convertido con `ctranslate2==4.9.0` y `transformers==5.23.0` para su uso con faster-whisper y con el runtime de CTranslate2, lo que reduce el tamaño del repositorio a 0,8 GB y permite inferencia eficiente en CPU y en dispositivos con recursos limitados.

El propósito declarado por el autor es el despliegue en el teclado Android Kalmia Blabla, dentro del contexto del issue #84 del repositorio remtav/speech-to-text, es decir, transcripción de voz a texto en el propio dispositivo. La cuantización int8 reduce el peso y acelera la inferencia respecto a los pesos en punto flotante, a costa de una posible pérdida mínima de precisión en la transcripción.

La relevancia de esta ficha es práctica: permite evaluar rápidamente si este artefacto sirve como componente ASR en una aplicación móvil o en un servidor sin GPU. El modelo base, Whisper large-v3-turbo, es una variante optimizada del large-v3 de OpenAI con menos capas de decodificador, orientada a latencia baja manteniendo una cobertura multilingüe amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a CTranslate2 |
| Parametros totales | no disponible (el modelo base large-v3-turbo ronda los 809 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; no confirmado en la informacion) |
| Tipos de cuantizacion | int8 (unica incluida en este repositorio) |
| Idiomas soportados | no disponible en la model card (el modelo base es multilingue) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin y ficheros auxiliares), con tokenizer.json y preprocessor_config.json |
| Tamano del repositorio | 0,8 GB |
| Libreria | ctranslate2 |
| Modelo base | openai/whisper-large-v3-turbo (revision 41f01f3fe87f28c78e2fbf8b568835947dd65ed9) |
| Herramienta de conversion | ct2-transformers-converter (ctranslate2 4.9.0, transformers 5.23.0) |
| Checksums | SHA256SUMS incluido en el repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder entrenado para transcripcion y traduccion de voz, que procesa audio en ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. La variante large-v3-turbo reduce el numero de capas del decodificador respecto a large-v3 para disminuir la latencia, manteniendo el encoder de gran capacidad. Esta ficha no cubre el entrenamiento original, que corresponde a OpenAI y no se detalla en la informacion proporcionada; no hay datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion de este artefacto es puramente de despliegue: la conversion a CTranslate2 con cuantizacion int8. El proceso se ejecuto con `ct2-transformers-converter --model <source> --output_dir . --quantization int8 --copy_files tokenizer.json preprocessor_config.json`, partiendo de un `model.safetensors` con SHA-256 `542566a422ae4f3fd23f1ba11add198fca01bbf82e66e6a2857b3f608b1eb9d1`. El resultado es un `model.bin` en formato CTranslate2 que faster-whisper puede cargar directamente. No se documentan tecnicas adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, tarea principal del pipeline `automatic-speech-recognition`.
- Transcripcion multilingue: heredada del modelo base Whisper large-v3-turbo, aunque la lista concreta de idiomas no se detalla en la model card.
- Traduccion de voz a texto en ingles: capacidad propia de Whisper, no confirmada explicitamente para este artefacto.
- Deteccion de idioma y marcas de tiempo a nivel de segmento: funcionalidades estandar de faster-whisper sobre modelos Whisper convertidos, no verificadas en la informacion disponible.
- Inferencia en CPU y en dispositivo: el formato int8 y CTranslate2 estan pensados para ejecucion sin GPU.
- Integracion con faster-whisper: el autor indica que es usable con esta libreria ademas del runtime nativo de CTranslate2.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Dictado por voz en teclados moviles: es el caso declarado por el autor, el teclado Android Kalmia Blabla. El formato int8 y CTranslate2 permiten ejecutar la transcripcion en el propio dispositivo sin depender de la nube, reduciendo latencia y preservando la privacidad del audio.
- Subtitulado automatico de videos y podcasts: se puede procesar el audio por segmentos de 30 segundos con faster-whisper y generar subtitulos con marcas de tiempo, aprovechando la velocidad del modelo turbo y el bajo consumo del int8.
- Transcripcion de reuniones y notas de voz: integrado en un pipeline de grabacion, el modelo convierte audio a texto en local, adecuado para entornos con requisitos de confidencialidad donde no se quiere enviar audio a servicios externos.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo casi real de conversaciones presenciales o llamadas, ejecutandose en portatiles sin GPU dedicada gracias a la cuantizacion int8.
- Procesamiento por lotes en servidores sin GPU: al ser un modelo CTranslate2 int8, se puede desplegar en instancias CPU de bajo coste para transcribir grandes volumenes de audio de forma asincrona.
- Busqueda y analitica sobre audio archivado: transcripcion masiva de grabaciones de atencion al cliente o entrevistas para indexar el texto y habilitar busqueda semantica, con un coste de infraestructura reducido.
- Prototipado rapido de aplicaciones ASR: dado su tamano de 0,8 GB y su licencia MIT, es un punto de partida sencillo para validar una idea de producto de voz antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, latencia ni throughput, ni comparaciones con otras conversiones. Tampoco se documenta la perdida de precision introducida por la cuantizacion int8 respecto a los pesos originales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al ser un modelo CTranslate2 int8 de 0,8 GB en disco, la huella en memoria es del orden de 1 GB o ligeramente superior durante la ejecucion, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. CTranslate2 soporta CUDA, pero el objetivo declarado es la ejecucion en dispositivo (CPU).
- Cabe en GPU consumer: si, en principio cualquier GPU con al menos 2 GB de memoria libre, aunque no hay datos oficiales que lo confirmen.
- Cabe en CPU: si, es el escenario de uso previsto; el formato int8 esta optimizado para CPU.
- Opciones de despliegue: faster-whisper (recomendado por el autor) y el runtime de CTranslate2 directamente. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| remiavelo/whisper-large-v3-turbo-ct2-int8 | no disponible | no disponible | CTranslate2 int8 | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | no disponible en esta ficha | no disponible en esta ficha | safetensors | MIT | Hugging Face |
| openai/whisper-large-v3 | no disponible en esta ficha | no disponible en esta ficha | safetensors | MIT | Hugging Face |

La comparacion se limita a los modelos citados en la informacion proporcionada. No se dispone de datos de rendimiento ni de otras conversiones CTranslate2 para contrastar. Cualquier comparacion cuantitativa adicional se considera no disponible.

## Limitaciones y advertencias

- Artefacto de conversion, no modelo original: los pesos provienen de `openai/whisper-large-v3-turbo`; cualquier sesgo o limitacion del modelo base se hereda sin cambios.
- Cuantizacion int8: puede introducir una degradacion de la precision en la transcripcion respecto a los pesos en punto flotante, especialmente en audio con ruido o acentos marcados. No se documenta la magnitud de esta perdida.
- Idiomas no listados: la model card no enumera los idiomas soportados, por lo que no se puede garantizar cobertura para un idioma concreto sin probarlo.
- Sin benchmarks: no hay metricas de WER ni de latencia que permitan estimar el rendimiento en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar que la licencia del modelo base se mantiene en la cadena de derivados.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto que no corresponde al audio en segmentos silenciosos o con ruido; no se documenta ningun mecanismo de mitigacion en esta conversion.
- Formato especifico: solo es utilizable con CTranslate2 y faster-whisper; no es cargable directamente con transformers ni con llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/remiavelo/whisper-large-v3-turbo-ct2-int8
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: no disponible en la informacion proporcionada
- Repositorio del caso de uso declarado (issue #84): https://github.com/remtav/speech-to-text
- Paper de Whisper: no disponible en la informacion proporcionada
