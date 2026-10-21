# kanirudh/parakeet-0.6B-v2

## Resumen

`kanirudh/parakeet-0.6B-v2` es una conversión al formato ONNX del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v2`, publicada por el usuario kanirudh. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: toma los pesos originales de NVIDIA en formato NeMo y los exporta a ONNX para poder ejecutarse con la librería `onnx-asr` sin depender del stack de NeMo. El modelo base es un Conformer con decodificador TDT (Token-and-Duration Transducer) de aproximadamente 600 millones de parámetros, especializado en transcripción de inglés.

La relevancia de esta ficha es práctica: el modelo original requiere `nemo_toolkit`, una dependencia pesada con requisitos de versiones estrictos, mientras que la exportación ONNX permite inferencia sobre ONNX Runtime en CPU o GPU con una huella mucho menor. Para equipos que quieren integrar ASR en producción sin arrastrar PyTorch ni NeMo, esta conversión es un atajo directo.

El repositorio ocupa 3,2 GB, tiene licencia CC-BY-4.0 heredada del modelo base, soporta únicamente inglés y, en el momento de la consulta, registra cero descargas y cero valoraciones, lo que implica que no existe validación comunitaria publicada sobre la fidelidad de la conversión. La información disponible no incluye resultados de benchmarks ni métricas de calidad de transcripción para esta exportación concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer), encoder-decoder |
| Parametros totales | ~0,6 B (600 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; la informacion proporcionada no especifica la duracion maxima de audio por pasada) |
| Tipos de cuantizacion | exportacion ONNX; el repositorio esta etiquetado como `base_model:quantized`, pero no se detallan los niveles de cuantizacion aplicados |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`model.onnx`) + `vocab.txt` |

## Arquitectura y entrenamiento

El modelo base es un Conformer, es decir, un transformer que combina bloques de auto-atencion con convoluciones depthwise para capturar dependencias locales y globales en la señal acustica. Sobre el encoder se situa un decodificador de tipo TDT (Token-and-Duration Transducer), una variante de RNN-Transducer que predice conjuntamente el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un transducer clasico y mejora el rendimiento en inferencia. El resultado es un sistema de reconocimiento end-to-end que emite texto directamente desde el audio, sin modelo de lenguaje externo separado en el pipeline basico.

Sobre el entrenamiento no hay informacion en la documentacion proporcionada: no se especifica el numero de horas de audio, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado o preferencias. El repositorio unicamente documenta el procedimiento de exportacion: carga del modelo con `ASRModel.from_pretrained("nvidia/parakeet-tdt-0.6b-v2")`, llamada a `model.export()` para generar el ONNX y volcado del vocabulario del tokenizer a `vocab.txt` anadiendo el token `<blk>`. Cualquier detalle sobre datos, regularizacion o innovaciones de entrenamiento debe consultarse en la model card del modelo original de NVIDIA, no en esta conversion.

## Capacidades

- Transcripcion de voz a texto en ingles a partir de ficheros WAV, mediante la API `model.recognize("test.wav")` de `onnx-asr`.
- Reconocimiento end-to-end con decodificador TDT, que integra alineamiento temporal implicito en el proceso de decodificacion.
- Ejecucion sobre ONNX Runtime, con soporte de CPU y de GPU segun los extras instalados (`onnx-asr[cpu,hub]`).
- Carga directa desde el Hub de HuggingFace mediante el identificador `nemo-parakeet-tdt-0.6b-v2` que expone `onnx-asr`.
- No se documentan en la informacion disponible capacidades de diarizacion de hablantes, marcas de tiempo a nivel de palabra, traduccion, deteccion de idioma ni procesamiento de audio que no sea ingles.
- No se documentan tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo puramente acustico, no un modelo de lenguaje generativo.

## Casos de uso

- Subtitulado automatizado de video en ingles: el modelo convierte la pista de audio en texto plano que puede sincronizarse posteriormente con herramientas de subtitulado; al ejecutarse sobre ONNX Runtime, se puede embeber en un pipeline de procesamiento por lotes en CPU sin dependencias de PyTorch.
- Transcripcion de reuniones y notas de voz: integrado en un servicio backend que recibe un WAV y devuelve la transcripcion; la huella de memoria reducida permite ejecutar varias instancias en una sola maquina.
- Enriquecimiento de archivos de audio corporativos: conversion masiva de grabaciones historicas a texto indexable para busqueda interna, aprovechando el despliegue en contenedores ligeros basados en ONNX Runtime.
- Analitica de centros de contacto: transcripcion de llamadas en ingles para posterior analisis de palabras clave, cumplimiento y calidad; el modelo actua como primer eslabon y el analisis semantico se delega a otro componente.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en aplicaciones de escritorio o web, usando la variante CPU cuando no hay GPU disponible.
- Prototipado rapido y evaluacion de ASR: al instalarse con una sola dependencia (`pip install onnx-asr[cpu,hub]`) y cargarse en dos lineas de codigo, sirve para comparar calidad frente a Whisper u otros motores antes de comprometerse con un stack de produccion.
- Preprocesado para pipelines de datos de voz: generacion de transcripciones que alimentan sistemas de entrenamiento de modelos de lenguaje o de recuperacion de informacion sobre audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye tasas de error de palabra (WER), comparaciones con el modelo original ni mediciones de latencia o throughput. Tampoco se aportan metricas que permitan verificar si la exportacion a ONNX degrada la precision respecto a los pesos NeMo originales.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 2,4-3 GB para los pesos (el repositorio completo ocupa 3,2 GB) mas buffers de activacion, que dependen de la duracion del audio de entrada.
- VRAM estimada con cuantizacion INT8: del orden de 1-1,5 GB, aunque el repositorio no detalla que variante cuantizada contiene exactamente.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria es suficiente; tarjetas como RTX 3050, RTX 3060, RTX 4060, RTX 4090, T4, L4 o A10 cubren el caso con holgura. A100 y H100 estan sobredimensionadas para un modelo de 0,6 B y solo se justifican por agregacion de muchas instancias.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna con 4 GB o mas, e incluso en iGPU con memoria compartida para audio corto.
- Despliegue: `onnx-asr` sobre ONNX Runtime es la via documentada. No se documenta soporte nativo en vLLM, TGI, llama.cpp u Ollama, que estan orientados a modelos de lenguaje y no a este tipo de exportacion ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo no autorregresivo por token de texto en sentido clasico y con decodificador TDT, se espera un coste proporcional a la duracion del audio, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kanirudh/parakeet-0.6B-v2 (esta ficha) | ~0,6 B | Ingles | CC-BY-4.0 | ONNX | Conversion no validada por la comunidad; 0 descargas |
| nvidia/parakeet-tdt-0.6b-v2 | ~0,6 B | Ingles | CC-BY-4.0 | NeMo (`.nemo`) | Modelo original; requiere `nemo_toolkit` |
| openai/whisper-large-v3 | ~1,55 B | Multilingue (99 idiomas) | MIT | PyTorch, safetensors, GGUF via terceros | Mucho mayor, multilingue, ecosistema de despliegue muy amplio |
| openai/whisper-medium | ~0,77 B | Multilingue | MIT | PyTorch, safetensors | Tamano comparable, cobertura multilingue, licencia mas permisiva |

La comparacion con modelos de la familia Whisper se ofrece como referencia de categoria, no como evaluacion de calidad: no hay datos de benchmarks en la informacion disponible que permitan afirmar cual transcribe mejor. La diferencia practica mas clara es la licencia (MIT frente a CC-BY-4.0), la cobertura de idiomas (multilingue frente a solo ingles) y el formato de despliegue (ONNX listo para `onnx-asr` frente a pesos PyTorch).

## Limitaciones y advertencias

- Solo ingles: no se debe utilizar para audio en castellano ni en otros idiomas; la model card declara unicamente `language: en`.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin issues ni validacion externa documentada. La fidelidad de la conversion ONNX respecto al modelo NeMo original no esta verificada de forma independiente.
- Riesgo de alucinacion tipico de los sistemas ASR: en segmentos con silencio, ruido de fondo o musica, los modelos transducer pueden emitir texto espurio. No hay información sobre el comportamiento concreto de esta exportacion en esos escenarios.
- Sesgos no documentados: no se especifica la distribucion de acentos, edades, generos ni condiciones de grabacion del dataset de entrenamiento, por lo que se desconoce el sesgo diferencial por variedad dialectal del ingles.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor original (NVIDIA) y la indicacion de cambios (la conversion a ONNX). Conviene revisar los terminos del modelo base antes de redistribuir.
- Dependencia de una unica implementacion: la API publica documentada es la de `onnx-asr`; no se detallan los nombres de las entradas y salidas del grafo ONNX, lo que dificulta el uso directo con otras herramientas sin inspeccionar el modelo.
- Sin datos de rendimiento ni de calidad: no hay WER, ni curvas de latencia, ni comparaciones con el modelo original, lo que impide dimensionar el impacto de la conversion o de la cuantizacion.
- Sin soporte documentado de marcas de tiempo, diarizacion ni puntuacion: si el caso de uso requiere subtitulos sincronizados o separacion de hablantes, habra que anadir componentes externos.
- Los resultados de busqueda web obtenidos no contienen informacion tecnica relacionada con el modelo y se han descartado por completo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kanirudh/parakeet-0.6B-v2
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Libreria de inferencia `onnx-asr`: https://github.com/istupakov/onnx-asr
- No se han encontrado en la busqueda web papers, blogs o demos adicionales relevantes para este modelo.
