# palli23/whisper-tiny-samromur2105-100h

## Resumen

whisper-tiny-samromur2105-100h es un punto de control (checkpoint) de reconocimiento automatico del habla (ASR) en islandes, publicado por el usuario palli23 en HuggingFace. Se trata de un ajuste fino de la arquitectura Whisper tiny (transformer encoder-decoder de ~39 M de parametros) sobre aproximadamente 100 horas de habla islandesa, presumiblemente del corpus Samromur, tal y como sugiere el nombre del modelo y su pertenencia al conjunto de checkpoints "samromur-21.05".

El modelo forma parte del conjunto de experimentos de escalado asociados al articulo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). La hipotesis de ese trabajo, segun el titulo, es que modelos ASR pequenos entrenados con datos suficientes en un idioma concreto pueden competir con modelos multilingues mucho mayores en tareas de transcripcion de ese idioma. Este checkpoint concreto representa el punto de 100 horas dentro de esa curva de escalado.

Es relevante ahora porque ofrece una alternativa ligera (37,8 M de parametros, ~0,2 GB de repositorio) para transcribir islandes en entornos con recursos limitados: CPU, dispositivos de borde o GPUs de gama baja. Su licencia CC BY-SA 4.0 permite uso comercial con atribucion y compartir igual. No obstante, el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, y su model card es minima: no documenta datos de entrenamiento detallados, hiperparametros ni resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (modelo base: Whisper tiny) |
| Parametros totales | 37.760.640 (confirmado en los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura Whisper procesa ventanas de audio de 30 segundos |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas; los pesos del repositorio estan en safetensors) |
| Idiomas soportados | islandes (is) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-09-15 |

Nota: el recuento de parametros es ligeramente inferior al de la configuracion canonica de Whisper tiny (~39 M). La model card no explica la diferencia; podria deberse a un vocabulario o a una configuracion ajustada al islandes, pero es una inferencia no confirmada por el autor.

## Arquitectura y entrenamiento

La arquitectura es la de OpenAI Whisper en su variante tiny: un transformer encoder-decoder con entradas de espectrograma mel de 80 canales, ventanas de audio de 30 segundos y decodificacion autoregresiva de tokens de texto. La variante tiny se caracteriza por 4 capas de encoder, 4 capas de decoder, dimension de modelo 384 y 6 cabezas de atencion. El modelo parte de los pesos preentrenados de Whisper tiny y se ajusta para transcripcion en islandes.

Segun la model card, este checkpoint pertenece al conjunto "samromur-21.05" y al trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026). El sufijo "100h" indica que se ha entrenado con aproximadamente 100 horas de audio, presumiblemente del corpus Samromur (habla islandesa). No se especifica en la informacion disponible el numero exacto de tokens o muestras de audio, la composicion del dataset, si se aplicaron tecnicas de aumento de datos, ni si hubo etapas de RLHF/DPO (poco habituales en ASR) o decodificacion especulativa. Tampoco se detallan la tasa de aprendizaje, el numero de pasos ni la estrategia de validacion.

## Capacidades

- Transcripcion de voz a texto en islandes (tarea principal del ajuste fino).
- Procesamiento de audio en ventanas de 30 segundos, con posibilidad de concatenar resultados para audio mas largo mediante segmentacion previa.
- Manejo de vocabulario islandes: nombres propios, toponimos y fonetica propia del idioma, en la medida en que el corpus de entrenamiento lo cubra.
- Funcionamiento en CPU y en GPUs de gama baja, al tratarse de un modelo de 37,8 M de parametros.
- No se documenta soporte de tool calling ni de function calling: son capacidades ajenas al proposito de un modelo ASR.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: limitadas al islandes segun la etiqueta de idioma del repositorio; el comportamiento en otros idiomas no esta documentado.
- Capacidades especiales (modo thinking, vision, audio mas alla de ASR, diarizacion de hablantes): no disponibles.

## Casos de uso

- Subtitulado de contenido audiovisual islandes: el modelo puede transcribir entrevistas, documentales o videos corporativos en islandes segmentando el audio en ventanas de 30 segundos y uniendo los segmentos con marcas de tiempo.
- Archivado y busqueda de audio institucional: transcripcion masiva de grabaciones (por ejemplo, sesiones parlamentarias o archivos de radio) para generar indices de texto buscables, aprovechando que el modelo cabe en CPU y permite procesar grandes volumenes sin GPU.
- Asistentes de voz en islandes: conversion de comandos hablados a texto como primer paso de un pipeline de comprension del lenguaje, en un idioma con poca cobertura en los ASR multilingues grandes.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo casi real de reuniones o clases impartidas en islandes, con despliegue local para evitar enviar audio a servicios en la nube.
- Transcripcion de llamadas de atencion al cliente: conversion de conversaciones telefonicas en islandes a texto para analitica de calidad, deteccion de motivos de contacto y cumplimiento normativo.
- Generacion de datos de entrenamiento para otros modelos: pseudo-etiquetado de audio islandes no transcrito para construir corpus de texto o para alimentar el entrenamiento de modelos de lenguaje en islandes.
- Aplicaciones en el borde (edge): integracion en dispositivos con poca memoria (por ejemplo, grabadoras o sistemas empotrados) gracias a su tamano reducido, sin necesidad de conectividad.
- Investigacion en escalado de ASR: uso como punto de referencia en estudios sobre la relacion entre horas de audio y tasa de error, que es precisamente el eje del articulo en el que se enmarca el checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabras (WER) ni de caracteres (CER), y los resultados de busqueda web proporcionados no contienen datos relacionados con el modelo.

| Benchmark | Resultado |
|---|---|
| WER en Samromur (islandes) | no disponible |
| WER en Common Voice is | no disponible |
| CER en islandes | no disponible |
| Comparacion con Whisper tiny multilingue | no disponible |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 151 MB en fp32 (37,76 M de parametros x 4 bytes) y unos 76 MB en fp16. Son estimaciones teoricas derivadas del recuento de parametros; el consumo real de memoria incluye activaciones y cache de atencion.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas y en CPU.
- Inferencia en CPU viable: es el escenario recomendado para un modelo de este tamano, con un consumo de memoria inferior a 1 GB en fp32.
- Codificacion en int8: reduccion adicional hasta aproximadamente 38 MB de pesos, si se convierte mediante herramientas externas (no se distribuyen pesos cuantizados en el repositorio).
- Opciones de despliegue: pipeline de Transformers (clase WhisperForConditionalGeneration), openai-whisper, faster-whisper (CTranslate2), whisper.cpp (requiere conversion a ggml/GGUF), ONNX Runtime y OpenVINO. TGI no esta orientado a modelos ASR; vLLM soporta arquitecturas Whisper, aunque no aporta ventajas frente a alternativas en CPU para este tamano.
- Latencia y throughput: no se han publicado medidas de factor de tiempo real (RTF) ni de tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Ventana de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny-samromur2105-100h | 37,76 M | islandes | 30 s | cc-by-sa-4.0 | HuggingFace (0 descargas) |
| OpenAI Whisper tiny | ~39 M | 99 idiomas | 30 s | Apache-2.0 | HuggingFace, referencia ampliamente usada |
| OpenAI Whisper base | ~74 M | 99 idiomas | 30 s | Apache-2.0 | HuggingFace |
| OpenAI Whisper large-v3 | ~1.550 M | 99 idiomas | 30 s | Apache-2.0 | HuggingFace |

La comparacion de calidad (WER) entre estos modelos en islandes no esta disponible en la informacion proporcionada. La diferencia principal frente a los Whisper de OpenAI es la licencia (CC BY-SA 4.0 frente a Apache-2.0), el enfoque monoidioma y el hecho de ser un ajuste fino especializado con aproximadamente 100 horas de audio islandes. No se dispone de datos de otros modelos especificos para islandes con los que comparar directamente.

## Limitaciones y advertencias

- Sesgos: no documentados. Al entrenarse con un corpus concreto de habla islandesa, puede presentar peor rendimiento con acentos regionales, hablantes no nativos, habla infantil o registros poco representados en Samromur.
- Alucinacion: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en silencios, ruido de fondo o musica. Es un riesgo conocido de la familia Whisper y no se mitiga de forma automatica.
- Ventana de contexto: 30 segundos por segmento. El audio mas largo requiere segmentacion previa y puede producirse perdida de contexto entre fragmentos (cortes de palabras, cambios de hablante).
- Idioma: la etiqueta del repositorio declara unicamente islandes. No hay garantia de funcionamiento en otras lenguas y su capacidad de traduccion a ingles heredada de Whisper tiny no esta documentada ni se ha validado.
- Licencia: CC BY-SA 4.0 permite uso comercial, pero obliga a atribuir la autoria y a distribuir las obras derivadas bajo la misma licencia. Esto puede ser incompatible con productos propietarios que no quieran liberar sus derivados.
- Madurez: el modelo acumula 0 descargas y 0 likes, y su model card no incluye resultados ni detalles de entrenamiento. No hay evidencia publica de validacion independiente.
- Produccion: se desconoce el WER real, el comportamiento con audio ruidoso y el rendimiento por dominio. Para un uso en produccion seria necesario evaluarlo con un conjunto de prueba propio en islandes antes de desplegarlo.
- Fecha de publicacion: los metadatos indican una fecha de creacion en 2026, coherente con un trabajo presentado en ICASSP 2026; conviene verificar la version final del articulo y del checkpoint cuando este disponible.

## Enlaces

- HuggingFace: https://huggingface.co/palli23/whisper-tiny-samromur2105-100h
- Articulo de referencia: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2026), enlace no disponible en la informacion proporcionada.
- Corpus Samromur, enlace no disponible en la informacion proporcionada.
- Repositorio de OpenAI Whisper (arquitectura base), enlace no disponible en la informacion proporcionada.
- Otros enlaces relevantes (papers, blogs, repos, demos): no disponible en la informacion proporcionada.
