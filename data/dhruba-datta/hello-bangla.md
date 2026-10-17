# dhruba-datta/hello-bangla

## Resumen

Hello Bangla es un modelo de reconocimiento automatico del habla (ASR) especializado en bengali (bangla), publicado por el desarrollador dhruba-datta. Se trata de una conversion a formato GGUF del modelo `mozilla-ai/whisper-large-v3-turbo-bn`, realizada sin entrenamiento adicional, por lo que hereda integramente el comportamiento del modelo original. El unico artefacto publicado es un fichero cuantizado en Q8_0 de 886.381.920 bytes (aproximadamente 0,9 GB), con arquitectura Whisper large-v3 turbo y 808.904.208 parametros.

El modelo se distribuye como componente interno de Hello (hello.minutecampus.com), una aplicacion gratuita y privada de dictado por voz para Mac. La propia aplicacion lo descarga desde sus ajustes, de modo que no esta pensado para descarga manual ni como modelo de proposito general, sino como pieza de un producto de dictado local en bengali.

Su relevancia es acotada: cubre un idioma con poca cobertura en modelos ASR de calidad y lo hace en un tamano que cabe en equipos de consumo. No obstante, el repositorio no publica resultados de benchmarks, no incluye la model card de evaluacion del modelo base y registra cero descargas y cero likes en el momento de la consulta, por lo que la evidencia disponible sobre su calidad real es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 turbo) |
| Parametros totales | 808.904.208 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como parametro de texto; la arquitectura Whisper procesa audio en ventanas de 30 segundos |
| Tipos de cuantizacion | Q8_0 (GGUF). No se publican otras cuantizaciones |
| Idiomas soportados | bengali (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transcribe.cpp), fichero `whisper-large-v3-turbo-bn-Q8_0.gguf` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper large-v3 turbo: un transformer encoder-decoder orientado a transcripcion de audio, con aproximadamente 809 millones de parametros. La variante turbo de Whisper reduce el numero de capas del decodificador respecto a large-v3 completo, lo que disminuye el coste de inferencia a cambio de una perdida de precision que OpenAI situa en torno a uno o dos puntos en tareas de transcripcion multilingue estandar.

No hubo entrenamiento adicional en esta publicacion. Segun la model card, el fichero se convirtio desde `mozilla-ai/whisper-large-v3-turbo-bn` (revision `ae19d9c2647ce68383e519b69d535a4d2eae579d`) sin mas modificaciones que el cambio de formato y la cuantizacion a Q8_0. Esto implica que cualquier ajuste fino al bengali, asi como los datos y el procedimiento empleados para lograrlo, proceden del modelo de Mozilla AI y no se documentan en este repositorio: no se detalla el numero de tokens de audio, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

## Capacidades

- Transcripcion de audio a texto en bengali (bn).
- Reconocimiento automatico del habla, etiquetado en HuggingFace con el pipeline `automatic-speech-recognition`.
- Funcionamiento local dentro de una aplicacion de dictado (Hello para Mac), sin envio de audio a servidores externos segun la descripcion del producto.
- Inferencia con cuantizacion Q8_0 sobre el runtime transcribe.cpp.
- No se documentan capacidades de traduccion de voz, identificacion de hablante, diarizacion, marcas de tiempo por palabra ni transcripcion multilingue: el unico idioma declarado es el bengali.
- No se documenta soporte de tool calling, function calling, uso agente ni modos de razonamiento extendido, algo esperable en un modelo exclusivamente ASR.

## Casos de uso

- Dictado por voz en bengali sobre escritorio: integracion en aplicaciones de toma de notas o procesadores de texto en Mac, aprovechando que el modelo esta cuantizado a Q8_0 en un fichero de menos de 1 GB y puede ejecutarse en el propio equipo sin conexion.
- Transcripcion de reuniones y entrevistas en bengali: el modelo convierte grabaciones de audio en texto para su posterior analisis, con la ventaja de que el procesamiento es local y no expone contenido sensible a terceros.
- Subtitulado de contenido audiovisual en bengali: generacion de subtitulos para videos, cursos o material divulgativo, encajando en pipelines de postproduccion donde se requiere un modelo ligero que corra en CPU o en GPU modesta.
- Accesibilidad para hablantes de bengali: conversion de voz a texto para personas con dificultades motoras o de vision, dentro de herramientas de accesibilidad que necesitan funcionar sin conexion y con baja latencia.
- Archivado y busqueda de audio historico: transcripcion de archivos de audio en bengali (entrevistas, radio, registros administrativos) para hacerlos indexables y consultables por texto.
- Asistentes de voz locales en bengali: primer eslabon de un pipeline ASR + NLU que no dependa de APIs en la nube, adecuado para entornos con requisitos de privacidad o conectividad limitada.
- Prototipado rapido de aplicaciones ASR en bengali: al ser un GGUF de menos de 1 GB, permite validar productos de voz en bengali en un portatil antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de WER (word error rate) ni comparaciones con otros modelos, y la model card se limita a describir el fichero, su tamano, su hash SHA-256 y su procedencia.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-1,5 GB con la cuantizacion Q8_0 publicada (fichero de 886 MB mas overhead del runtime y buffers de activaciones).
- Memoria RAM: aproximadamente 1-2 GB si se ejecuta en CPU.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o superior no representa cuello de botella. Aceleradores como A100 o H100 estan sobredimensionados para un modelo de 809 millones de parametros.
- Compatibilidad con hardware de consumo: si. Cabe en practicamente cualquier GPU de consumo de los ultimos diez anos, en Apple Silicon (M1 y posteriores) y en CPU moderna sin GPU dedicada.
- Opciones de despliegue: el formato publicado es GGUF de transcribe.cpp, por lo que el runtime natural es transcribe.cpp. No se confirma compatibilidad con whisper.cpp ni con servidores de inferencia como vLLM, TGI u Ollama, que no estan orientados a este formato ni a cargas de ASR.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo real factor (RTF), latencia por ventana de 30 segundos ni throughput en ninguna GPU concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hello Bangla (este modelo) | 808,9 M | Ventanas de 30 s (arquitectura Whisper) | bengali | Apache 2.0 | GGUF Q8_0 en HuggingFace, 0 descargas |
| mozilla-ai/whisper-large-v3-turbo-bn | no disponible en la informacion proporcionada | Ventanas de 30 s (arquitectura Whisper) | bengali | Apache 2.0 segun la model card de este repositorio | Modelo de origen del que se convirtio este fichero |
| Whisper large-v3-turbo (OpenAI) | ~809 M | Ventanas de 30 s | Multilingue (amplia cobertura) | MIT | Pesos originales ampliamente distribuidos |
| Whisper large-v3 (OpenAI) | ~1550 M | Ventanas de 30 s | Multilingue (amplia cobertura) | MIT | Pesos originales ampliamente distribuidos |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, idioma, licencia y disponibilidad.

## Limitaciones y advertencias

- Cobertura linguistica restringida: solo bengali. No se debe esperar un comportamiento util en castellano, ingles u otros idiomas.
- Sin datos de evaluacion: el repositorio no publica WER ni ninguna otra metrica, y tampoco reproduce los resultados del modelo base. Es imposible estimar su calidad real a partir de la informacion disponible.
- Conversiones sin entrenamiento adicional: cualquier sesgo, error sistematico o alucinacion del modelo `mozilla-ai/whisper-large-v3-turbo-bn` se traslada integramente a este fichero.
- Riesgo de alucinacion tipico de ASR: en tramos de silencio, ruido o audio musical, los modelos Whisper pueden generar texto plausible pero inexistente, o repetir frases en bucle. Conviene aplicar filtros de deteccion de silencio y de repeticion en produccion.
- Sensibilidad a la calidad del audio: acentos, ruido de fondo, solapamiento de voces y grabaciones de baja frecuencia de muestreo degradan la transcripcion. No se documenta ningun ajuste especifico para audio telefonico.
- Sin marcas de tiempo ni diarizacion documentadas: si el caso de uso requiere segmentacion por hablante o timestamps por palabra, habra que anadirlas externamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente. La propia model card recuerda que la licencia es la del modelo original, por lo que conviene verificar las condiciones del modelo de Mozilla AI y, aguas arriba, de los pesos originales de OpenAI Whisper.
- Cuantizacion unica: solo se ofrece Q8_0. No hay variantes mas agresivas (Q4, Q5) para entornos con menos memoria ni versiones en precision completa para maxima calidad.
- Madurez del repositorio: cero descargas y cero likes, creado y actualizado el mismo dia, sin historial de uso ni mantenimiento. No es un artefacto con validacion por parte de la comunidad.
- Dependencia de un runtime concreto: el GGUF es especifico de transcribe.cpp; no se garantiza su carga en otras implementaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhruba-datta/hello-bangla
- Aplicacion Hello (dictado por voz para Mac): https://hello.minutecampus.com
- Modelo de origen: https://huggingface.co/mozilla-ai/whisper-large-v3-turbo-bn
- Repositorio de transcribe.cpp: no se proporciona enlace en la informacion disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido no pertinente) y se han descartado por completo.
