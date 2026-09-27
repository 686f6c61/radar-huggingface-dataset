# Glimpse-Dictation/Parakeet-Unified-EN-0.6B-coreml

## Resumen

Parakeet Unified EN 0.6B coreml es un artefacto de inferencia especifico para Apple Silicon: contiene unicamente el encoder compilado en Core ML del modelo de reconocimiento automatico del habla (ASR) NVIDIA Parakeet Unified EN 0.6B. Lo publica la organizacion Glimpse-Dictation dentro del proyecto Glimpse, una aplicacion de dictado gratuita y de codigo abierto para macOS y Windows. No es un ejecutable de transcripcion autonomo ni un modelo completo: se usa como complemento opcional del GGUF Q8_0 de Handy y requiere el adaptador Core ML de transcribe.cpp.

El objetivo es acelerar la transcripcion de archivos completos en el Neural Engine de los chips Apple, mientras que la transcripcion en streaming sigue ejecutandose en la GPU con el encoder propio del GGUF. Segun los datos del autor, una ventana de 15 segundos se codifica en 34 ms en un Apple M2 Pro, frente a los 119 ms del encoder ggml con Metal, lo que supone una mejora de aproximadamente 3,5 veces en esa ruta concreta.

El modelo hereda del original de NVIDIA el soporte de ingles, la licencia CC BY 4.0 y el tamano de 0,6 B de parametros. Su relevancia actual es acotada pero clara: es una pieza de optimizacion para despliegues de dictado on-device en hardware Apple, no un modelo de proposito general ni una alternativa a los ASR que funcionan en CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de un sistema ASR tipo RNN-T (decoder RNN-T en CPU), exportado con la ruta de atencion de contexto completo offline del modelo Unified |
| Parametros totales | 0,6 B (600 millones) en el modelo base NVIDIA Parakeet Unified EN 0.6B; el encoder incluido es un subconjunto de ese sistema |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1501 frames de entrada como maximo por ventana (unos 15 segundos de audio), con mascara de longitud; sin contexto de texto |
| Tipos de cuantizacion | Q8_0 en el GGUF de origen; computacion FP16 en Core ML |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.mlmodelc` compilado en Core ML, distribuido en `parakeet-unified-en-0.6b-Q8_0-encoder.mlmodelc.zip` (1,09 GB); requiere el GGUF Q8_0 de Handy como complemento |

Otros datos: tamano del repositorio 1,1 GB, libreria `coreml`, pipeline `automatic-speech-recognition`, entrada de 128 bins mel, fecha de creacion 27 de septiembre de 2026, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino una conversion. El encoder deriva del fichero `parakeet-unified-en-0.6b-Q8_0.gguf` de Handy mediante el script `scripts/convert-parakeet-gguf-to-coreml.py` de transcribe.cpp. El resultado se divide en cuatro programas encadenados para que el compilador del Neural Engine lo acepte, y se ejecuta con computacion FP16 en Core ML habilitando CPU y Neural Engine y excluyendo la GPU. El decoder RNN-T se ejecuta en CPU. El autor advierte que Core ML puede recurrir a operaciones en CPU, por lo que no hay garantia de ejecucion exclusiva en el Neural Engine.

La ruta exportada es la de atencion de contexto completo offline del modelo Unified, no la de streaming. Por eso Glimpse trocea las grabaciones largas en fragmentos de 15 segundos para este encoder, y las entradas que superan esa capacidad caen de vuelta al encoder ggml incluido en el GGUF. No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de audio, la composicion del dataset de entrenamiento ni sobre si el modelo original uso RLHF, DPO o tecnicas de ajuste similares.

## Capacidades

- Reconocimiento automatico del habla en ingles sobre audio completo, ejecutado en el Neural Engine de chips Apple.
- Codificacion de ventanas de hasta 1501 frames (aproximadamente 15 segundos) con mascara de longitud, con particionado externo para grabaciones mas largas.
- Coexistencia con la ruta de streaming: el streaming en vivo sigue usando el encoder del GGUF en la GPU, y solo la transcripcion de archivo completo pasa al Neural Engine.
- Extraccion de caracteristicas mel de 128 bins.
- Integracion con el decoder RNN-T, que se ejecuta en CPU, para producir la transcripcion final.
- No se documentan en la informacion disponible capacidades de traduccion, identificacion de hablantes, deteccion de idioma, puntuacion automatica, tool calling ni procesamiento de texto mas alla del reconocimiento de voz.

## Casos de uso

- Dictado on-device en macOS: la aplicacion Glimpse usa este encoder para transcribir archivos de audio completos sin enviar datos a la nube, aprovechando el Neural Engine de los equipos Apple Silicon.
- Transcripcion por lotes de notas de voz: al codificar una ventana de 15 segundos en 34 ms en un M2 Pro, es viable procesar grandes volumenes de grabaciones cortas en local reduciendo el coste frente a la ruta Metal.
- Subtitulado de reuniones y entrevistas grabadas: el modelo permite generar transcripciones en ingles de audio ya finalizado, troceando la grabacion en segmentos de 15 segundos con particionado externo.
- Flujos de trabajo con requisitos de privacidad: al ejecutarse sobre hardware local y sin necesidad de GPU discreta, encaja en entornos donde el audio no puede salir del dispositivo.
- Ahorro energetico en portatiles: delegar la codificacion al Neural Engine en lugar de a la GPU libera el subsistema grafico y reduce el consumo en tareas de transcripcion prolongadas.
- Integracion en herramientas de terceros sobre Apple Silicon: cualquier aplicacion que adopte el adaptador Core ML de transcribe.cpp puede usar este encoder junto al GGUF Q8_0 para mejorar la latencia de transcripcion de archivos.
- Comparacion de precisión entre rutas: permite contrastar la salida FP16 de Core ML con la salida ggml en un mismo audio, util para validar integraciones antes de desplegar.

## Benchmarks y rendimiento

El unico dato de rendimiento publicado en la informacion disponible es la latencia de codificacion de una ventana de 15 segundos en un Apple M2 Pro:

| Ruta de codificacion | Tiempo por ventana de 15 s | Hardware |
|---|---|---|
| Encoder Core ML (Neural Engine, FP16) | 34 ms | Apple M2 Pro |
| Encoder ggml con Metal | 119 ms | Apple M2 Pro |

No se han publicado resultados de benchmarks estandar de ASR (WER, CER) ni comparativas con otros modelos en la informacion disponible. El autor indica ademas que la salida FP16 puede diferir ligeramente de la salida ggml, sin cuantificar esa diferencia.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon. El paquete Core ML no funciona en otras plataformas.
- Aceleradores: CPU y Neural Engine habilitados; GPU excluida en la sesion Core ML. El decoder RNN-T se ejecuta en CPU.
- Almacenamiento: 1,09 GB para el ZIP del encoder compilado y 1,1 GB de repositorio, mas el GGUF Q8_0 completo de Handy y su encoder, que son necesarios como complemento.
- Memoria: no se dispone de cifras de VRAM o memoria unificada publicadas. Como referencia del orden de magnitud, el modelo base declara 0,6 B de parametros y el artefacto compilado ocupa 1,09 GB, pero el consumo real en tiempo de ejecucion no esta documentado.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este artefacto; la ruta equivalente en esas plataformas seria el GGUF o el modelo original de NVIDIA.
- Opciones de despliegue: transcribe.cpp con su adaptador Core ML de Parakeet; la aplicacion Glimpse-Speech detecta el directorio companion junto al GGUF. Un llamador nativo debe pasar el directorio `parakeet-unified-en-0.6b-Q8_0-encoder.mlmodelc` a traves de la opcion de sesion de Core ML.
- Latencia: 34 ms por ventana de 15 segundos en un Apple M2 Pro. No hay datos de throughput agregado ni de latencia en otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Parakeet-Unified-EN-0.6B-coreml (este repositorio) | 0,6 B en el modelo base; encoder parcial | 1501 frames por ventana (~15 s) | Ingles | CC BY 4.0 | `.mlmodelc` + GGUF companion | No es autonomo; requiere Apple Silicon y transcribe.cpp |
| handy-computer/parakeet-unified-en-0.6b-gguf (GGUF Q8_0) | 0,6 B | No disponible | Ingles | No disponible en la informacion proporcionada | GGUF Q8_0 | Incluye encoder propio para streaming en GPU; es el companion obligatorio |
| nvidia/parakeet-unified-en-0.6b (original) | 0,6 B | No disponible | Ingles | CC BY 4.0 (segun el aviso del autor) | No disponible | Modelo fuente del que derivan las conversiones |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria (por ejemplo, alternativas de ASR multilingue) en la informacion proporcionada, por lo que no se puede establecer una comparacion de precision o WER.

## Limitaciones y advertencias

- No es un ejecutable de transcripcion autonomo: necesita el GGUF Q8_0 de Handy y el adaptador Core ML de transcribe.cpp.
- Exclusivo de Apple Silicon. No se puede desplegar en servidores x86, GPU NVIDIA ni otros aceleradores.
- Ventana maxima de 1501 frames (unos 15 segundos). Las entradas que superan esa capacidad caen al encoder ggml del GGUF, con la perdida de rendimiento asociada.
- La GPU queda excluida en la sesion Core ML, pero no hay garantia de ejecucion exclusiva en el Neural Engine: Core ML puede ejecutar operaciones en CPU.
- La salida FP16 puede diferir ligeramente de la salida ggml, y el autor no cuantifica la magnitud de esa diferencia ni su impacto en la precision final de la transcripcion.
- Solo ingles. No se documenta soporte multilingue.
- No hay cifras publicadas de WER ni de calidad de transcripcion, por lo que no se puede validar la precision antes de desplegar.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion. Conviene revisar tambien las condiciones del modelo base de NVIDIA y del GGUF de Handy.
- Estado de adopcion muy temprano: 0 descargas y 0 likes, con creacion y ultima actualizacion en el mismo minuto. Es un artefacto sin validacion externa documentada.
- Como cualquier sistema ASR, la calidad se degrada con ruido de fondo, solapamiento de hablantes, acentos marcados y audio de baja calidad; no se han publicado evaluaciones especificas en estos escenarios.
- No se documentan capacidades de diarizacion, marcas de tiempo, puntuacion automatica ni traduccion, por lo que no deben asumirse en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Glimpse-Dictation/Parakeet-Unified-EN-0.6B-coreml
- Modelo base en HuggingFace: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- GGUF Q8_0 companion de Handy: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf
- Aplicacion Glimpse: https://tryglimpse.cc
- Codigo fuente de Glimpse en GitHub: https://github.com/glimpse-hq/Glimpse
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo: los resultados obtenidos corresponden a una plataforma de analisis de tendencias y a entradas de diccionario, sin relacion con el artefacto.
