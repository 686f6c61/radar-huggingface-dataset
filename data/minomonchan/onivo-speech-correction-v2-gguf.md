# minomonchan/ONIVO-speech-correction-v2-GGUF

## Resumen

ONIVO-speech-correction-v2-GGUF es un modelo de correccion de texto post-transcripcion, es decir, no transcribe audio: recibe el texto que ha producido un sistema ASR y devuelve una version editada con autolocuciones resueltas, muletillas eliminadas y puntuacion anadida. Lo publica el usuario minomonchan dentro del proyecto ONIVO y esta construido como un fine-tune con LoRA —fusionado en los pesos base— sobre la familia Qwen3.5, en dos variantes: una rapida de 0,8B (checkpoint step-450) y otra orientada a precision de 2B (checkpoint step-800, seleccionado en validacion). Los pesos se distribuyen ya fusionados y cuantizados en Q4_K_M, de modo que no hace falta descargar el modelo base ni un adaptador aparte.

El interes practico esta en el hueco que cubre: la mayoria de pipelines de voz a texto no incluyen una etapa de edicion que respete la intencion del hablante sin responder a la pregunta dictada. ONIVO define para ello un contrato de inferencia estricto: un system prompt fijo, un mensaje de usuario y otro de asistente con un unico campo JSON llamado `dictation`, razonamiento desactivado y salida restringida a esa forma JSON.

Conviene ser honesto sobre la escala del proyecto: el corpus de entrenamiento es de 900 ejemplos (858 sinteticos y 142 reales seleccionados) y la evaluacion se limita a 64 pruebas de texto autoradas por el propio autor. Es un modelo pequeno, de nicho, util como componente de una app de dictado, no un corrector general validado a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Qwen3.5, con fine-tune LoRA fusionado en los pesos base; el detalle de capas y mecanismo de atencion no se publica (no disponible) |
| Parametros totales | 752.393.024 en la variante de 0,8B (dato real de safetensors); la variante de 2B no declara recuento exacto (no disponible) |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada, en los dos tamanos) |
| Idiomas soportados | japones (ja), ingles (en), aleman (de), frances (fr), espanol (es), portugues (pt), chino (zh) y coreano (ko); japones e ingles dominan el corpus |
| Licencia | Apache 2.0 (se conserva la licencia original de Qwen en el fichero `LICENSE`) |
| Formato de pesos | GGUF (pesos fusionados; no requiere adaptador ni descarga del modelo base) |
| Variantes publicadas | 0,8B step-450 ("fast") y 2B step-800 ("accuracy") |
| Tamano del repositorio | 1,8 GB en total |
| Fecha de publicacion | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

La base es Qwen3.5 en dos tamanos (0,8B y 2B). Sobre cada uno se aplico un ajuste LoRA orientado a una tarea de edicion de texto, y el adaptador se fusiono en los pesos del modelo base antes de cuantizar a Q4_K_M. El resultado es un artefacto autocontenido: el repositorio no incluye datos de entrenamiento, registros de dispositivo ni servicio de inferencia remoto, solo los GGUF y un `manifest.json` con los commits exactos del modelo base, hashes SHA-256 y tamanos para reproducibilidad.

El corpus declarado es de 900 ejemplos de entrenamiento y 100 de validacion: 142 ejemplos aportados por usuarios y 858 escenarios sinteticos escritos a mano. La distribucion linguistica esta sesgada hacia japones e ingles, con conjuntos menores en aleman, frances, espanol, portugues, chino y coreano. No se documenta RLHF ni DPO (no disponible), y el autor advierte explicitamente que este corpus no constituye un benchmark amplio de ASR real ni ha pasado una revision independiente por hablantes nativos. Parte de la logica de produccion de ONIVO —un pipeline acotado de texto y una revision de consistencia numerica implementados en Swift— no forma parte de estos pesos y no viaja con ellos: es codigo de la aplicacion.

## Capacidades

- Edicion de texto dictado: resolucion de autocorrecciones del hablante, eliminacion de muletillas y anadido de puntuacion, manteniendo la intencion original sin responder a la consulta dictada.
- Salida estructurada: contrato de inferencia con system prompt fijo y contenido de usuario/asistente como objeto JSON con un unico campo de tipo string llamado `dictation`.
- Multilingue en ocho idiomas (ja, en, de, fr, es, pt, zh, ko), con calidad declarada superior en japones e ingles.
- Integracion en apps: pensado para ejecucion local en dispositivo mediante llama.cpp u otros runners GGUF.
- Razonamiento desactivado por diseno: se indica explicitamente desactivar el modo thinking y restringir la salida a la forma JSON, porque la tarea es de edicion, no de respuesta.
- No transcribe audio por si mismo: requiere un ASR previo que aporte el texto.
- No se documentan tool calling, function calling, capacidades de agente, vision ni audio (no disponible).

## Casos de uso

- Post-proceso de dictado en una app movil: el ASR produce el texto en bruto, la app lo envia con el system prompt fijo y el JSON `dictation`, y el modelo devuelve la frase editada antes de insertarla en el campo de texto. La variante de 0,8B esta pensada para este flujo por su tamano.
- Limpieza por lotes de transcripciones de subtitulado: aplicar el modelo a cada segmento para eliminar muletillas y anadir puntuacion, con revision humana posterior, ya que el autor avisa de posibles perdidas de palabras o cifras.
- Preprocesado antes de resumen automatico: reducir fillers y corregir autolocuciones antes de pasar la transcripcion a un modelo mayor, lo que disminuye tokens de entrada y ruido semantico.
- Herramientas de accesibilidad por voz: conversion de dictado libre en texto puntuado y legible para usuarios que redactan hablando, con ejecucion local y sin enviar audio ni texto a servicios remotos.
- Actas de reunion multilingues: normalizar las intervenciones transcritas en japones, ingles, espanol o aleman antes de generar el acta, manteniendo el texto original para auditoria.
- Mensajeria y correo dictados: convertir un mensaje hablado con reinicios y repeticiones en una frase enviable, validando el JSON antes de mostrarlo.
- Experimentacion en investigacion de post-proceso ASR: servir de linea base reproducible (pesos fusionados, hashes en `manifest.json`, Q4_K_M) para comparar estrategias de edicion frente a reglas o modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K). El unico dato de evaluacion es una prueba interna de 64 casos de texto autorados por el propio autor, donde las diferencias solo de puntuacion cuentan como fallo:

| Prueba | Variante | Resultado |
|---|---|---|
| 64 pruebas de texto autoradas (coincidencia exacta) | 0,8B step-450 | 54/64 (una generacion fallo) |
| 64 pruebas de texto autoradas (coincidencia exacta) | 2B step-800 | 57/64 |

El autor advierte que estos resultados se usaron para seleccionar los checkpoints y no son una estimacion insesgada de la precision en produccion.

## Requisitos de hardware

- VRAM estimada para la variante de 0,8B en Q4_K_M: en torno a 0,5 GB de pesos y aproximadamente 1 GB con overhead de contexto (estimacion a partir del tamano de los ficheros, no publicada por el autor).
- VRAM estimada para la variante de 2B en Q4_K_M: en torno a 1,3 GB de pesos y aproximadamente 2 GB en ejecucion (estimacion, igual que la anterior).
- Cabe en GPU consumer sin problema: cualquier tarjeta con 4 GB o mas (GTX 1650, RTX 3050/3060, RX 6600) e incluso iGPU y Apple Silicon mediante llama.cpp.
- Inferencia en CPU viable, especialmente con la variante de 0,8B, al tratarse de un modelo denso de menos de mil millones de parametros.
- Despliegue: llama.cpp (`llama-cli`/`llama-server`), Ollama importando el GGUF con un Modelfile, LM Studio o koboldcpp. El soporte de vLLM y TGI para estos GGUF concretos no esta verificado en la informacion disponible.
- Latencia y throughput: no disponible; no se publican cifras de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| ONIVO v2 0,8B (este repo, variante fast) | 752.393.024 | no disponible | Correccion de texto post-ASR, salida JSON | Apache 2.0 | GGUF Q4_K_M |
| ONIVO v2 2B (este repo, variante accuracy) | no disponible | no disponible | Correccion de texto post-ASR, salida JSON | Apache 2.0 | GGUF Q4_K_M |
| Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | Asistente general conversacional | Apache 2.0 (segun el repo de origen) | safetensors y derivados |
| Qwen3.5-2B (modelo base) | ~2B | no disponible | Asistente general conversacional | Apache 2.0 (segun el repo de origen) | safetensors y derivados |

No se dispone de datos para comparar con otros correctores de transcripcion de la misma categoria (parametros, contexto y rendimiento) en la informacion proporcionada: no disponible.

## Limitaciones y advertencias

- Corpus pequeno y mayoritariamente sintetico (900 ejemplos, 858 sinteticos); no es un benchmark amplio de ASR real y no ha tenido revision independiente por hablantes nativos.
- Riesgo documentado de eliminar palabras o cifras necesarias, de dejar correcciones en multiples pasos incompletas y de no preservar importes, fechas, nombres, negaciones o el idioma original.
- No debe presentarse como un modelo perfecto ni usarse sin supervision en transcripciones de alto riesgo (ambito clinico, legal o financiero); hay que conservar el texto original para revision.
- El schema JSON no garantiza el significado correcto de la salida: es obligatorio validar y decodificar el JSON antes de mostrar el texto.
- La pruebas internas no certifican el comportamiento del ASR, el calentamiento del dispositivo, la ejecucion en segundo plano ni la insercion desde teclado.
- La logica de normalizacion numerica y el pipeline acotado de texto viven en la app Swift de ONIVO, no en estos pesos; no hay garantia equivalente para reparaciones o cifras arbitrarias.
- El modelo no transcribe audio: sin un ASR previo no aporta nada al pipeline.
- Licencia Apache 2.0, que permite uso comercial manteniendo los avisos de atribucion de Qwen; conviene revisar el fichero `LICENSE` del repositorio antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni informes independientes de fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minomonchan/ONIVO-speech-correction-v2-GGUF
- Ficheros del repositorio (incluye `manifest.json` y `LICENSE`): https://huggingface.co/minomonchan/ONIVO-speech-correction-v2-GGUF/tree/main
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Hub de modelos en formato GGUF: https://huggingface.co/GGUF-Models
- No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo en la busqueda web disponible.
