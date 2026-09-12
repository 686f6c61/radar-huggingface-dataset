# Reza2kn/Shenava-Koochik-v1.0-sherpa-onnx

## Resumen

Shenava-Koochik-v1.0-sherpa-onnx es un paquete de reconocimiento automatico del habla (ASR) offline para persa (farsi), publicado por el desarrollador Reza2kn bajo licencia Apache-2.0. No se trata de un modelo de lenguaje, sino de una exportacion ONNX de un modelo acustico FastConformer con cabecera CTC, empaquetada especificamente para el runtime sherpa-onnx y su API comun multiplataforma. El modelo base del que deriva es Reza2kn/Shenava-Koochik-v1.0, y esta variante se distribuye como una version "quantized" orientada a ejecucion en dispositivo.

El repositorio incluye tres artefactos: el grafo `model.onnx`, un vocabulario de 1.025 tokens en formato SentencePiece/CTC (`tokens.txt`) y un posprocesador opcional de normalizacion inversa de texto persa (`persian_itn.py`) que convierte numeros escritos en palabras a digitos persas. El conjunto completo ocupa aproximadamente 0,5 GB.

Su relevancia actual radica en que cubre un nicho poco atendido: ASR persa ejecutable sin conexion y sin GPU, con soporte para escritorio, movil y WebAssembly a traves de una misma interfaz en Python, C++, Android, iOS, C#, Go, Swift, Kotlin o Rust. La principal particularidad tecnica del export es que el grafo espera caracteristicas log-mel de NeMo sin normalizar, de modo que activar la normalizacion por caracteristica por defecto de sherpa-onnx produce salidas invalidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabecera CTC (reconocedor offline, no cache-aware streaming) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | Exportacion ONNX; el repositorio no detalla el tipo de cuantizacion del grafo. Existen variantes separadas fp16 (ONNX fp16, Core ML fp16) en otros repositorios de la familia |
| Idiomas soportados | persa (codigo `fa`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), mas `tokens.txt` (vocabulario de 1.025 tokens) y `persian_itn.py` |
| Entrada de audio | 16 kHz, mono, caracteristicas log-mel de NeMo sin normalizar |
| Tamano del repositorio | 0,5 GB |
| Runtime objetivo | sherpa-onnx |
| Modelo base | Reza2kn/Shenava-Koochik-v1.0 (relacion: quantized) |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer con decodificacion CTC y naturaleza estrictamente offline: el propio autor advierte que se trata de un reconocedor offline y no del grafo streaming con cache. Esto implica que la inferencia se realiza sobre el enunciado completo, sin emision incremental de hipotesis, lo que simplifica el despliegue pero lo descarta para casos que requieran transcripcion en tiempo real con latencia muy baja.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de parametros del modelo ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables de forma habitual a un modelo acustico CTC). Los unicos detalles tecnicos documentados son la estructura de la exportacion (vocabulario de 1.025 tokens, cabecera CTC), la exigencia de no activar la normalizacion por caracteristica en las caracteristicas log-mel de entrada y la inclusion de un modulo ITN para el posprocesado de numeros. El resto de detalles de entrenamiento figuran como no disponibles.

## Capacidades

- Transcripcion de voz a texto en persa (farsi) a partir de audio de 16 kHz mono.
- Ejecucion completamente offline, sin llamadas a servicios externos ni conexion de red.
- Despliegue multiplataforma mediante la API comun de sherpa-onnx: Python, C++, Android, iOS, WebAssembly, C#, Go, Swift, Kotlin y Rust.
- Normalizacion inversa de texto (ITN) opcional para convertir numeros hablados a digitos persas mediante `persian_itn.py`.
- Ejecucion en CPU y en dispositivo, sin requisito de GPU.
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo acustico de ASR.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento explicito.
- No dispone de traduccion, resumen ni comprension de texto; su salida es unicamente la transcripcion.

## Casos de uso

- Subtitulado offline de contenido en persa: el modelo transcribe ficheros de audio o video de 16 kHz mono sin conexion, lo que permite generar subtitulos en entornos sin red o con requisitos de privacidad estrictos.
- Notas de voz en aplicaciones moviles: al integrarse mediante sherpa-onnx en Android e iOS, permite dictado y transcripcion local en el propio dispositivo, sin enviar el audio a un servidor.
- Transcripcion en WebAssembly dentro del navegador: el paquete puede ejecutarse en el cliente, de modo que el audio no abandona el equipo del usuario, lo que resulta adecuado para aplicaciones con requisitos de proteccion de datos.
- Indexacion y busqueda de archivos de audio persas: la transcripcion generada puede alimentar un indice de texto para busqueda posterior en archivos historicos, grabaciones de reuniones o archivos de radio.
- Atencion al cliente con registro de llamadas: transcripcion por lotes de grabaciones telefonicas para auditoria, control de calidad y analitica, ejecutable en servidores sin GPU.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones a escala para construir corpus etiquetados en persa, con el posprocesador ITN para normalizar cifras.
- Accesibilidad: conversion de voz a texto en aplicaciones de asistencia para personas con discapacidad auditiva, en un escenario offline y de bajo coste computacional.
- Sistemas embebidos con recursos limitados: al no requerir GPU y tener un modelo base y un runtime ligeros (repositorio de 0,5 GB), puede desplegarse en dispositivos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tasas de error de palabra (WER), comparaciones con otros sistemas de ASR persa ni mediciones de latencia o throughput. Tampoco se dispone del numero de parametros del modelo ni de la composicion del conjunto de evaluacion.

## Requisitos de hardware

- VRAM: no disponible. Al ser un modelo acustico exportado a ONNX y ejecutable en CPU, no se publica un requisito de VRAM. El repositorio completo ocupa 0,5 GB, por lo que el grafo y los archivos auxiliares se situan en ese orden de magnitud.
- GPU: no disponible. No se documenta compatibilidad ni recomendacion de GPU concretas (A100, H100, RTX 4090 u otras). El caso de uso declarado es la ejecucion en dispositivo y offline.
- GPU de consumo: el modelo esta disenado para ejecutarse en CPU, por lo que cabe en equipos de consumo sin GPU dedicada; no se especifican requisitos minimos de CPU ni de memoria RAM.
- Opciones de despliegue: sherpa-onnx como runtime principal, con API en Python, C++, Android, iOS, WebAssembly, C#, Go, Swift, Kotlin y Rust. El autor indica explicitamente que debe usarse la ruta `OfflineRecognizer.from_nemo_ctc` y desactivar la normalizacion por caracteristica.
- Latencia y throughput: no disponibles.
- Formatos alternativos de la familia, para otros runtimes: ONNX fp16 para navegador, Core ML fp16 y tract offline.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos de ASR persa comparables, por lo que no es posible establecer una comparacion cuantitativa con alternativas externas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shenava-Koochik-v1.0-sherpa-onnx | no disponible | no aplica (ASR) | no disponible | Apache-2.0 | HuggingFace + mirror PersianML |
| Shenava-Koochik-v1.0 (modelo base) | no disponible | no aplica (ASR) | no disponible | no disponible | HuggingFace |
| Shenava-Koochik-v1.0-ONNX-fp16 | no disponible | no aplica (ASR) | no disponible | no disponible | HuggingFace |
| Shenava-Koochik-v1.0-CoreML-fp16 | no disponible | no aplica (ASR) | no disponible | no disponible | HuggingFace |
| Shenava-Koochik-v1.0-tract-offline | no disponible | no aplica (ASR) | no disponible | no disponible | HuggingFace |

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre ASR persa comparable: los resultados obtenidos correspondian a paginas corporativas de Microsoft sin relacion con el modelo.

## Limitaciones y advertencias

- Regla critica de preprocesado: el grafo ONNX deja deliberadamente vacio el metadato `normalize_type` y espera caracteristicas log-mel de NeMo sin normalizar. Activar la normalizacion por caracteristica por defecto de sherpa-onnx produce salidas invalidas. Es el error mas probable en una integracion nueva.
- Audio de entrada restringido a 16 kHz mono; otras frecuencias de muestreo o canales requieren remuestreo y conversion previas.
- Es un reconocedor offline, no el grafo streaming cache-aware, por lo que no es adecuado para transcripcion incremental estricta en tiempo real.
- Los numeros se emiten en formato hablado a menos que se aplique explicitamente `persian_itn.py`.
- Unico idioma soportado: persa. No se documenta comportamiento multilingue ni cambio de idioma.
- No se han publicado tasas de error ni evaluaciones independientes, por lo que no es posible estimar la calidad de transcripcion ni el riesgo de errores en dominios concretos (acentos regionales, ruido de fondo, audio telefonico).
- No se dispone de informacion sobre sesgos del modelo, composicion demografica de los datos de entrenamiento ni limitaciones conocidas por variedad dialectal.
- Riesgo de alucinacion: no aplica en el sentido de los modelos generativos, pero un modelo CTC puede producir transcripciones plausibles incorrectas en segmentos con ruido o silencio.
- Licencia Apache-2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserven los avisos de licencia y atribucion correspondientes. Conviene verificar la licencia del modelo base y de los datos de entrenamiento, no documentada en la informacion disponible.
- El repositorio registra 0 descargas y 1 "like" en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion por parte de terceros.
- La fecha de creacion registrada (2026-07-02) y la de actualizacion (2026-09-12) deben tomarse como las que figuran en la ficha de HuggingFace; conviene comprobar la vigencia real del repositorio antes de integrarlo en produccion.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/Reza2kn/Shenava-Koochik-v1.0-sherpa-onnx
- Mirror en PersianML: https://huggingface.co/PersianML/Shenava-Koochik-v1.0-sherpa-onnx
- Modelo base: https://huggingface.co/Reza2kn/Shenava-Koochik-v1.0
- Variante ONNX fp16 para navegador: https://huggingface.co/Reza2kn/Shenava-Koochik-v1.0-ONNX-fp16
- Variante Core ML fp16: https://huggingface.co/Reza2kn/Shenava-Koochik-v1.0-CoreML-fp16
- Variante tract offline: https://huggingface.co/Reza2kn/Shenava-Koochik-v1.0-tract-offline
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
