# nunu-willump/distil-large-v3.5-ct2

## Resumen

distil-large-v3.5-ct2 (nunu-willump/distil-large-v3.5-ct2) es un espejo de preservacion de los ficheros de inferencia CTranslate2 publicados originalmente por el proyecto distil-whisper. El autor del repositorio, nunu-willump, no ha entrenado, convertido ni modificado pesos: segun la propia model card, el contenido es byte a byte identico al de distil-whisper/distil-large-v3.5-ct2 en el commit `9793ccc07920e0f830e1dba0343efcdf0ef8c903`. Los unicos cambios declarados son la reubicacion de la subcarpeta CT2 en frances a la raiz del repositorio y la incorporacion de documentos de atribucion y procedencia (`UPSTREAM_MODEL_CARD.md`, `provenance.json`, `LICENSE-Whisper`).

Se trata, por tanto, de un modelo de reconocimiento automatico del habla (ASR) de la familia Whisper, en su variante destilada large-v3.5, empaquetado en formato CTranslate2 para poder ejecutarse con faster-whisper tanto en CPU como en GPU con distintos niveles de cuantizacion. Su relevancia es practica: ofrece una via de descarga alternativa para un artefacto que puede quedar inaccesible en su repositorio original, conservando el mismo binario de inferencia y la misma licencia MIT.

El repositorio ocupa 1,5 GB y declara unicamente el idioma ingles. La model card no incluye numero de parametros, arquitectura detallada, composicion del dataset de destilacion ni resultados de benchmarks, por lo que varios apartados de esta ficha quedan necesariamente marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia Whisper, en variante destilada (distil-whisper); configuracion de capas no disponible en la informacion proporcionada |
| Parametros totales | No disponible en la informacion proporcionada (el repositorio pesa 1,5 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; la familia Whisper procesa ventanas de audio de 30 s por pasada y encadena ventanas para audio largo |
| Tipos de cuantizacion | El repositorio ya esta convertido a CTranslate2 y el ejemplo oficial usa `compute_type="float32"`. CTranslate2 permite ademas float16, bfloat16, int8, int8_float16 e int8_float32 |
| Idiomas soportados | en (ingles), segun el tag `language: en` de la model card |
| Licencia | MIT (se conserva tambien `LICENSE-Whisper` con el copyright y la licencia originales de Whisper) |
| Formato de pesos | CTranslate2 (no safetensors, no GGUF, no PyTorch `.bin` de Transformers) |

## Arquitectura y entrenamiento

El modelo subyacente es distil-large-v3.5, un modelo destilado de la familia Whisper. Whisper es un transformer encoder-decoder entrenado para transcripcion y traduccion de voz, que consume espectrogramas Mel y genera tokens de texto de forma autorregresiva. La tecnica de distil-whisper consiste, de forma general, en conservar el encoder del modelo profesor de gran tamano y reducir drasticamente el numero de capas del decoder, entrenando la copia destilada sobre datos pseudo-etiquetados por el profesor. La model card de este repositorio no detalla el numero exacto de capas, la dimension del modelo, el profesor utilizado ni el volumen de datos de destilacion, por lo que esos datos deben consultarse en la documentacion del proyecto distil-whisper.

Es importante subrayar que este repositorio concreto no ha realizado ningun entrenamiento ni ajuste fino: se limita a replicar los ficheros CT2 del upstream. El unico cambio funcional declarado es la reubicacion de la subcarpeta CT2 en frances a la raiz del repositorio, de modo que el cargador de CTranslate2 encuentre directamente los ficheros de pesos y configuracion. Los ficheros `provenance.json` y `UPSTREAM_MODEL_CARD.md` documentan las referencias inmutables, tamanos y hashes SHA-256 del origen, lo que permite verificar la integridad de la copia.

## Capacidades

- Transcripcion de voz a texto (ASR) en ingles, tarea principal declarada con el pipeline `automatic-speech-recognition`.
- Procesamiento de audio largo mediante encadenado de ventanas, gracias al soporte de faster-whisper para `transcribe()` sobre ficheros completos.
- Obtencion de marcas de tiempo por segmento, tal como se muestra en el ejemplo de uso de la model card (`segment.text`, con la estructura de segmentos que devuelve la libreria).
- Inferencia en CPU: el ejemplo oficial arranca el modelo con `device="cpu"`, lo que habilita despliegues sin GPU.
- Inferencia en GPU con cuantizacion configurable a traves de CTranslate2 (float32, float16, int8, int8_float16).
- Capacidades multilingues: no disponibles en esta copia, que declara unicamente ingles pese a que la familia Whisper es multilingue en origen; la version francesa se conserva como subcarpeta desplazada a la raiz.
- Tool calling / function calling: no soportado.
- Modo agente o razonamiento multi-paso: no soportado.
- Vision, audio understanding o modo thinking: no soportado; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripcion por lotes en servidores sin GPU: al soportar `device="cpu"` con CTranslate2, permite procesar grandes volumenes de audio en maquinas de proposito general, ajustando `compute_type` a int8 para maximizar el rendimiento por nucleo.
- Subtitulado automatico de video en ingles: la salida por segmentos con marcas de tiempo se puede volcar directamente a formatos SRT o VTT mediante faster-whisper, integrable en un pipeline de postproduccion.
- Actas y notas de reunion: transcripcion de grabaciones de reuniones en ingles, encadenando ventanas de audio, para alimentar despues un resumen o un buscador interno.
- Automatizacion de contact center: conversion de grabaciones de llamadas en ingles a texto estructurado para analitica, control de calidad y deteccion de motivos de contacto.
- Indexacion y busqueda semantica de archivos de audio: transcripcion previa de podcasts o bibliotecas de audio para construir un indice de texto sobre el que aplicar busqueda y recuperacion.
- Interfaces de voz embebidas o edge: al ser un modelo destilado y ejecutable en CPU con cuantizacion int8, encaja en dispositivos con recursos limitados para dictado y comandos de voz en ingles.
- Preprocesado de datasets de voz: generacion de transcripciones automaticas a gran escala para entrenar o evaluar otros sistemas, aprovechando que el formato CT2 permite throughput alto en CPU.
- Verificacion y espejo de artefactos: uso del repositorio como copia de seguridad verificable por hash de un modelo de produccion, evitando dependencias de un unico punto de descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio es un documento de procedencia y no incluye cifras de WER, latencia ni comparativas. Para datos de calidad del modelo destilado subyacente hay que remitirse a la documentacion del proyecto distil-whisper, fuera de la informacion proporcionada.

## Requisitos de hardware

- Tamano en disco: 1,5 GB de repositorio.
- VRAM estimada: no disponible de forma oficial. Como estimacion derivada del tamano del repositorio, si los pesos estan almacenados en float16 corresponderian a aproximadamente 750 millones de parametros, lo que situaria la VRAM necesaria en torno a 1,5-2 GB en float16, en torno a 3 GB en float32 y por debajo de 1 GB en int8. Estas cifras son estimaciones, no datos publicados.
- CPU: es el escenario soportado explicitamente por el ejemplo oficial; no requiere GPU.
- GPU recomendadas: cualquier GPU consumer con 4 GB de VRAM o mas es suficiente segun las estimaciones anteriores (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090). Para despliegues de alto volumen tendria sentido usar A100, H100 o L40S, aunque el modelo es pequeno y probablemente la CPU sea el cuello de botella tipico.
- Cabe en GPU consumer: si, segun las estimaciones de VRAM indicadas, con holgura en cualquier tarjeta moderna de 4 GB o mas.
- Opciones de despliegue: faster-whisper sobre CTranslate2 (ruta oficial mostrada en la model card), WhisperX y otros envoltorios que consumen modelos CT2. No se puede cargar directamente con Transformers, vLLM, llama.cpp, Ollama o TGI, ya que el formato es CTranslate2 y la tarea es ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del `compute_type` elegido, del numero de hilos de CPU y de la duracion del audio.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nunu-willump/distil-large-v3.5-ct2 (este) | CTranslate2 | No disponible | en | MIT | Espejo byte a byte del upstream; sin entrenamiento ni conversion propia |
| distil-whisper/distil-large-v3.5-ct2 | CTranslate2 | No disponible | en | MIT | Repositorio de origen del que procede esta copia |
| distil-whisper/distil-large-v3.5 | Transformers (safetensors) | No disponible | en | MIT | Version original sin convertir; requiere conversion a CTranslate2 para usarse con faster-whisper |
| openai/whisper-large-v3 / large-v3-turbo | Transformers, CTranslate2 y otros | No disponible en la informacion proporcionada | Multilingue | MIT | Modelo profesor de mayor tamano y coste de inferencia; mayor cobertura de idiomas |

Los datos de parametros, contexto y rendimiento de las alternativas no se detallan en la informacion proporcionada, por lo que la comparacion se limita a formato, idioma, licencia y disponibilidad.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles. Aunque la familia Whisper es multilingue, esta copia no garantiza un comportamiento correcto fuera del ingles, y la subcarpeta francesa existente es un remanente del upstream reubicado, no una declaracion de soporte.
- Alucinacion: como cualquier modelo Whisper, tiende a generar texto plausible en tramos de silencio, ruido o audio ininteligible. Es imprescindible filtrar por umbrales de confianza y detectar repeticiones en produccion.
- Sin benchmarks: no hay cifras publicadas de WER ni comparativas en la informacion disponible, por lo que no se puede avalar su calidad con datos.
- Repositorio espejo sin soporte: el autor no ha entrenado ni validado el modelo; las cuestiones de calidad deben dirigirse al proyecto distil-whisper original.
- Validacion comunitaria muy baja: 8 descargas y 0 likes en el momento de la consulta, con fecha de creacion y actualizacion muy proximas. Conviene verificar los hashes de `provenance.json` antes de usarlo en produccion.
- Restricciones de licencia: la licencia declarada es MIT, lo que en principio permite uso comercial, pero conviene revisar `LICENSE-Whisper` y la licencia del repositorio upstream para confirmar la cadena completa de atribucion.
- Formato cerrado a un runtime concreto: al ser CTranslate2, no se puede cargar con Transformers, vLLM, llama.cpp, Ollama ni TGI; la integracion queda ligada a faster-whisper o herramientas compatibles.
- Ausencia de capacidades avanzadas: no soporta tool calling, agentes, vision ni modos de razonamiento; cualquier caso de uso que los requiera debe combinarse con otro modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nunu-willump/distil-large-v3.5-ct2
- Repositorio upstream en CTranslate2: https://huggingface.co/distil-whisper/distil-large-v3.5-ct2
- Commit de referencia del upstream: https://huggingface.co/distil-whisper/distil-large-v3.5-ct2/tree/9793ccc07920e0f830e1dba0343efcdf0ef8c903
- Modelo distil-whisper original (Transformers): https://huggingface.co/distil-whisper/distil-large-v3.5
- Libreria faster-whisper citada en la model card: https://github.com/SYSTRAN/faster-whisper
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a contenidos no relacionados (guia de un personaje de League of Legends).
