# Hebrish/Jachnun-MLX

## Resumen

Jachnun-MLX es una conversión al formato MLX de un modelo de reconocimiento automático del habla (ASR) especializado en *code-switching* entre inglés y hebreo. Lo publica el usuario Hebrish en HuggingFace y deriva directamente del fine-tune `danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching`, que a su vez parte de la familia Parakeet TDT 0.6B v2 (el tag `parakeet` del repo apunta a esa estirpe). El modelo pesa 617.869.958 parámetros (aproximadamente 0,62 mill millones) y se distribuye en safetensors para la librería `mlx`, es decir, pensado para ejecutarse en Apple Silicon con memoria unificada.

El problema que resuelve es concreto: la transcripción de audio en el que el hablante alterna hebreo e inglés dentro de la misma frase o turno de palabra, un fenómeno muy habitual en contextos profesionales israelíes (tecnología, medicina, derecho, academia). Los modelos ASR monolingües suelen degradarse en estos casos, y los multilingües genéricos no siempre cubren bien el hebreo. Este modelo se presenta como una alternativa ligera (menos de 700 millones de parámetros) frente a soluciones tipo Whisper large.

Es relevante ahora por dos motivos. Primero, por el tamaño: un modelo de 0,62 B es viable en hardware de consumo, lo que facilita el despliegue local con privacidad de datos. Segundo, por el formato: la conversión a MLX abre la inferencia nativa en Macs sin depender de CUDA. Ahora bien, el repo está restringido (gated), no publica resultados de benchmarks ni detalles de entrenamiento, y acumula 19 descargas y 0 likes, por lo que debe tratarse como un artefacto experimental a validar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el tag `parakeet` y el nombre del modelo base apuntan a la familia NVIDIA Parakeet TDT (Transducer con decodificacion *token-and-duration*), sin confirmacion explicita en la ficha del repo |
| Parametros totales | 617.869.958 (aproximadamente 0,62 B), dato real de los safetensors |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | No disponible; al ser un modelo ASR, el limite relevante es la ventana de audio maxima, que no se documenta |
| Tipos de cuantizacion | No disponible; el repo solo declara safetensors en formato MLX, sin variantes cuantizadas publicadas |
| Idiomas soportados | Ingles (en) y hebreo (he), con enfasis en *code-switching* entre ambos |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx`); tamano del repo 2,5 GB |

Otros datos: pipeline `automatic-speech-recognition`, acceso restringido (gated, requiere aceptar condiciones), creado el 2026-10-18 y actualizado el 2026-10-20, region `us`, 19 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. El tag `parakeet` y el nombre del modelo base (`Parakeet-TDT-0.6B-v2`) remiten a la familia Parakeet TDT de NVIDIA, basada en un encoder FastConformer con un decoder transducer TDT (*token-and-duration transducer*), un esquema que predice conjuntamente tokens y duraciones y que permite decodificacion no autoregresiva por bloques. No obstante, la ficha del repo no confirma esta arquitectura ni describe capas, atencion o mecanismos concretos, por lo que cualquier afirmacion al respecto debe tomarse como inferencia a partir del nombre.

Tampoco hay informacion sobre el entrenamiento: no se indica el numero de horas de audio, la composicion del dataset, si hubo aumentacion de datos, ni si se aplicaron tecnicas de adaptacion como LoRA o fine-tune completo sobre el modelo base. Se desconoce igualmente el reparto entre horas en ingles, en hebreo y en audio con cambio de idioma. El modelo es una conversion de formato (a MLX) del fine-tune de danielrosehill, no un entrenamiento original del autor del repo.

## Capacidades

- Transcripcion automatica de voz a texto en ingles, en hebreo y en habla con alternancia de ambos idiomas dentro de la misma emision.
- Manejo de *code-switching* intra-frase, el caso de uso central del fine-tune.
- Salida de texto plano alineada con el audio de entrada, en el formato propio de la pipeline `automatic-speech-recognition` de HuggingFace.
- Inferencia local en Apple Silicon mediante la libreria MLX.
- Modelo ligero (0,62 B de parametros), adecuado para ejecucion en dispositivos con memoria unificada limitada.
- No se documentan capacidades de traduccion, diarizacion de hablantes, marcas de tiempo a nivel de palabra, deteccion de idioma por segmento, puntuacion automatica ni *streaming*.
- No es un modelo generativo de texto: no soporta *tool calling*, agentes, razonamiento multi-paso ni modo *thinking*.

## Casos de uso

- **Transcripcion de reuniones bilingues en equipos israelies**: actas de reuniones donde los participantes alternan hebreo e ingles segun el tema (producto en hebreo, terminos tecnicos en ingles). El modelo esta entrenado especificamente para ese patron, lo que evita segmentar el audio por idioma antes de transcribir.
- **Subtitulado de contenido audiovisual**: generacion de subtitulos para podcasts, clases magistrales o webinars con invitados que mezclan ambos idiomas. El tamano reducido permite procesar horas de audio en local con una flota pequena de Macs.
- **Dictado clinico o legal con terminologia en ingles**: profesionales de la salud o del derecho en Israel que dictan en hebreo e intercalan diagnosticos o terminos juridicos en ingles. El modelo captura ambos sin cambiar de motor ASR a mitad de documento.
- **Analitica de *contact center***: transcripcion de grabaciones de atencion al cliente para posterior analisis de sentimiento, control de calidad o busqueda semantica. La licencia CC-BY-4.0 permite uso comercial con atribucion y el modelo no requiere GPU dedicada.
- **Investigacion linguistica sobre *code-switching***: construccion de corpus anotados de habla mezclada hebreo-ingles, un fenomeno con poca cobertura en recursos abiertos. El modelo sirve como pre-anotador para revision humana.
- **Dictado en aplicaciones de escritorio en macOS**: integracion en herramientas de notas o editores mediante MLX, manteniendo el audio en el dispositivo y evitando enviar grabaciones a servicios en la nube.
- **Pre-etiquetado de datasets ASR**: generacion de transcripciones iniciales para entrenar o evaluar otros modelos de habla en hebreo, con correccion humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/memoria estimada para inferencia** (calculo teorico a partir de los 617,9 M de parametros, sin overhead de runtime): aproximadamente 1,24 GB en fp16, 0,62 GB en int8 y 0,31 GB en int4. Estas cifras no estan publicadas por el autor y deben validarse en la practica.
- **GPU recomendadas**: el repo usa MLX, por lo que el hardware objetivo es Apple Silicon (series M1, M2, M3 y M4) con memoria unificada. No se documenta soporte para A100, H100 ni RTX 4090.
- **¿Cabe en hardware de consumo?**: si, en cualquier Mac con memoria unificada de 8 GB o superior, segun la estimacion anterior. En GPUs NVIDIA consumer no se puede ejecutar directamente sin convertir los pesos a otro formato.
- **Opciones de despliegue**: libreria MLX (unico camino documentado por el repo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de RTF (*real-time factor*) ni de velocidad de transcripcion.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jachnun-MLX | 617,9 M | en, he (code-switching) | no disponible | CC-BY-4.0 | MLX, acceso gated |
| danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching (modelo base) | no disponible en la informacion proporcionada | en, he | no disponible | no disponible | no disponible |
| Parakeet TDT 0.6B v2 (original de NVIDIA) | aproximadamente 0,6 B (referencia general) | en (la version v2 base es en) | no disponible | no disponible | no disponible |
| Whisper large-v3 (referencia general) | 1,55 B (referencia general) | multilingue, ~99 idiomas | ventanas de 30 s (referencia general) | MIT (referencia general) | PyTorch, CTranslate2, whisper.cpp, MLX |

Nota: las filas marcadas como "referencia general" no provienen de la informacion proporcionada en la busqueda, sino de conocimiento publico del ecosistema; no se dispone de comparaciones de WER entre estos modelos para habla code-switching hebreo-ingles. El modelo comparable mas directo es su propio modelo base, del que solo se separa por la conversion de formato a MLX.

## Limitaciones y advertencias

- **Acceso restringido**: el repo es gated; es necesario aceptar condiciones en HuggingFace antes de descargar los pesos, lo que anade friccion a cualquier pipeline automatizado.
- **Sin benchmarks**: no hay cifras de WER ni comparaciones publicadas, ni en el repo ni en la informacion disponible. Cualquier uso en produccion exige una evaluacion propia sobre el dominio objetivo.
- **Cobertura linguistica muy acotada**: solo ingles y hebreo. No se debe esperar transliteracion, traduccion ni soporte de un tercer idioma.
- **Riesgo de alucinacion en ASR**: como en cualquier modelo de este tipo, es probable que ante silencios, ruido o audio fuera de dominio genere texto no presente en la grabacion. Este comportamiento no se ha documentado ni cuantificado para este modelo.
- **Dependencia de Apple Silicon**: el formato MLX limita el despliegue a macOS con chip de la serie M. No hay pesos en PyTorch, GGUF ni ONNX publicados, y no se documenta ninguna herramienta de conversion.
- **Sobreajuste al dataset del fine-tune**: se desconoce la composicion del corpus de entrenamiento; si esta sesgado hacia un registro o acento concreto, el rendimiento caera en otros registros (habla espontanea, acentos no nativos, ruido de calle).
- **Licencia CC-BY-4.0**: permite uso comercial, pero obliga a atribuir la autoria. Conviene revisar tambien las condiciones del modelo base y del Parakeet original, que no se detallan en la informacion disponible.
- **Tamano del repo desproporcionado**: 2,5 GB para 617,9 M de parametros sugiere la presencia de multiples copias de pesos o archivos auxiliares; conviene inspeccionar el contenido antes de asumir un unico conjunto de pesos.
- **Madurez muy baja**: 19 descargas, 0 likes y dos dias entre creacion y ultima actualizacion. No hay senales de mantenimiento ni de comunidad que valide el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hebrish/Jachnun-MLX
- Modelo base: https://huggingface.co/danielrosehill/Parakeet-TDT-0.6B-v2-English-Hebrew-Codeswitching
- Libreria MLX (Apple): https://github.com/ml-explore/mlx
- Ejemplos de MLX para audio y habla: https://github.com/ml-explore/mlx-examples
- Paper, blog de presentacion, demo y repositorio de codigo del autor: no disponibles en la informacion proporcionada.
