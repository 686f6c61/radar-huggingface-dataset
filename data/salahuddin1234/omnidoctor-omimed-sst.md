# Salahuddin1234/omnidoctor-omimed-sst

## Resumen

Omnidoctor-omimed-sst es un modelo de reconocimiento automatico del habla (ASR) en ingles especializado en dialogo clinico, publicado en HuggingFace por el usuario Salahuddin1234. Se trata de un ajuste fino derivado de nvidia/parakeet-tdt-0.6b-v2, el modelo FastConformer con decodificador TDT de 0,6 mil millones de parametros de NVIDIA. La model card asociada lo identifica como "Omi Med STT v1", desarrollado por Omi Health, y esta orientado a la transcripcion local de consultas de medicina general, revision de medicacion, dictado clinico y lenguaje de procedimientos, dispositivos y pruebas.

El modelo resuelve un problema concreto: desplegar transcripcion medica en ingles con pesos abiertos y ejecucion en el propio dispositivo, sin enviar audio clinico a servicios en la nube. Se distribuye en tres variantes de runtime (NeMo canonico en BF16 para CUDA, exportaciones MLX para Apple Silicon y un GGUF q8_0 para CPU via parakeet.cpp), todas con los mismos pesos subyacentes. En la evaluacion interna declarada sobre un banco medico de 1.513 clips y 7,18 horas, la variante CUDA obtiene un WER del 6,54 % y una recuperacion medica del 97,77 %, con un Drug M-WER del 4,75 %.

La relevancia actual del modelo reside en su tamano (clase 0,6B), que lo hace ejecutable en hardware de consumo y en portatiles Apple Silicon, y en su licencia CC-BY-4.0, que permite uso comercial con atribucion. No es un modelo de decision clinica ni un sistema validado clinicamente: es exclusivamente un transcriptor, y su salida debe revisarse antes de cualquier uso asistencial. El repositorio consultado no registra descargas ni likes en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer), segun las etiquetas del repositorio y el modelo base |
| Parametros totales | 0,6 mil millones (clase 0.6B, segun el modelo base parakeet-tdt-0.6b-v2) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; modelo de ASR, la entrada es audio, no texto |
| Tipos de cuantizacion | BF16 (checkpoint NeMo canonico), MLX q8, GGUF q8_0 |
| Idiomas soportados | ingles (en) unicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | .nemo (NeMo), MLX, GGUF |

Otros datos del repositorio: ID Salahuddin1234/omnidoctor-omimed-sst, tamano 2,5 GB, libreria nemo, pipeline automatic-speech-recognition, creado y actualizado el 30 de septiembre de 2026, con la marca `inference: false` en los metadatos de la model card (no servido por la Inference API de HuggingFace).

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Parakeet de NVIDIA: un encoder FastConformer, variante de Conformer con atencion por bloques de complejidad lineal, combinado con un decodificador TDT (Token-and-Duration Transducer). El decodificador TDT predice simultaneamente el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un transducer clasico y acelera la inferencia. El modelo parte de los pesos de nvidia/parakeet-tdt-0.6b-v2, que ya incorpora capacidades de transcripcion y puntuacion en ingles.

La model card indica explicitamente que los pesos publicos no han cambiado y que los resultados de septiembre de 2026 proceden de las recetas de runtime documentadas sobre un banco medico congelado de 1.513 clips (7,18 horas), con un unico scorer. No se emplearon diccionarios, vocabulario personalizado, sesgo contextual, seleccion guiada por referencia ni correccion de transcripciones. Las cifras anteriores de la model card procedian de rutas de runtime y scorer mas antiguas, por lo que las actuales las sustituyen como resultados de ejecucion, no como un nuevo entrenamiento. No se detalla en la informacion disponible el volumen de datos de ajuste fino, la composicion del corpus clinico ni si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma habitual en ASR).

## Capacidades

- Transcripcion de voz a texto en ingles, con salida de texto plano, para audio convertido automaticamente a 16 kHz mono.
- Reconocimiento de lenguaje clinico: dialogos de consulta estilo medicina general, revision de medicacion, dictado clinico y terminologia de procedimientos, dispositivos y pruebas.
- Rendimiento declarado en farmacos: Drug M-WER del 4,75 % (NeMo CUDA), 4,52 % (MLX q8) y 4,30 % (GGUF q8_0).
- Recuperacion medica declarada del 97,77 % (NeMo CUDA), 97,88 % (MLX q8) y 97,84 % (GGUF q8_0).
- Ejecucion local en tres backends: NeMo sobre CUDA, MLX sobre Apple Silicon y parakeet.cpp sobre CPU Linux/Windows.
- Interfaz de linea de comandos `omi-med-stt`, instalable con extras por runtime (`[mlx]`, `[nemo]`) o con `install-cpp`.
- Sin tool calling, sin function calling, sin modo de razonamiento, sin vision, sin audio generativo y sin capacidades multilingues: es un modelo puramente discriminativo de ASR y solo en ingles.

## Casos de uso

- Transcripcion de consultas de medicina general: el modelo convierte la conversacion medico-paciente en texto para su incorporacion a la historia clinica, con la ventaja de que el audio no sale del dispositivo y se evita transferir datos de salud a terceros.
- Revision de medicacion: con un Drug M-WER declarado por debajo del 5 %, es adecuado para transcribir listados de farmacos y pautas posologicas que despues un profesional revisa manualmente.
- Dictado clinico: medicos que dictan notas, diagnosticos o evoluciones pueden generar borradores de texto en el portatil, sin conexion y con latencia baja al ejecutarse sobre MLX o CUDA.
- Documentacion de procedimientos y dispositivos: transcripcion de descripciones de tecnicas, uso de equipos y resultados de pruebas, aprovechando el vocabulario especializado aprendido en el ajuste.
- Despliegue en consultas sin GPU: la variante GGUF q8_0 permite ejecutar el modelo en CPU Linux o Windows como alternativa portable, con un WER del 7,10 % en el banco interno.
- Uso en portatiles Apple Silicon: la exportacion MLX q8 esta pensada como runtime por defecto en Mac y obtiene el mejor M-WER observado (2,12 %) con un peso reducido.
- Integracion en productos de documentacion clinica: la CLI y la API de NeMo permiten encadenar la transcripcion con un modulo posterior de resumen o codificacion, siempre que ese modulo sea un sistema aparte.
- Investigacion sobre ASR medico en ingles: al ser pesos abiertos con licencia CC-BY-4.0, sirve como linea base reproducible frente a la que comparar otros ajustes medicos.

## Benchmarks y rendimiento

Resultados declarados en la model card, sobre un banco medico congelado de 1.513 clips y 7,18 horas. Menos es mejor en WER, M-WER y Drug M-WER; mas es mejor en recuperacion medica. No se uso vocabulario personalizado ni correccion de transcripciones.

| Artefacto de runtime | Plataforma | WER | M-WER | Drug M-WER | Recuperacion medica |
|---|---|---|---|---|---|
| NeMo canonico | NVIDIA CUDA (L4, BF16) | 6,54 % | 2,23 % | 4,75 % | 97,77 % |
| MLX q8 | Apple Silicon (M4 Max) | 6,65 % | 2,12 % | 4,52 % | 97,88 % |
| GGUF q8_0 | CPU Linux/Windows | 7,10 % | 2,16 % | 4,30 % | 97,84 % |

La model card senala que, frente a las filas de modelos abiertos de su tablero interno de 30 sistemas, los runtimes CUDA y MLX q8 presentan el WER observado mas bajo, y MLX q8 el segundo M-WER mas bajo. Se advierte de que son posiciones dentro de esa tirada de benchmark, no una clasificacion universal, y que la fila de CPU tiene los recuentos de ocurrencia mas bajos observados en esa muestra, sin que las pruebas pareadas permitan establecer superioridad clinica. No hay resultados publicados de MMLU, HumanEval o GSM8K, que no aplican a un modelo de ASR. Tampoco se proporcionan cifras de WER sobre bancos medicos publicos externos, de velocidad en tiempo real (RTF) ni de throughput.

## Requisitos de hardware

- VRAM estimada: el checkpoint NeMo canonico ocupa aproximadamente 2,5 GB en disco, coherente con pesos en BF16 (en torno a 1,2-1,3 GB) mas el resto del paquete. La inferencia BF16 cabe holgadamente en GPU con 4 GB o mas de VRAM; las variantes MLX q8 y GGUF q8_0 ocupan alrededor de 0,7 GB.
- GPU recomendadas: NVIDIA L4 ha sido la plataforma de evaluacion del runtime canonico en BF16. Cualquier GPU CUDA con soporte BF16 (A100, H100, L40S, RTX 4090, RTX 3090, RTX 3060) puede ejecutarlo; por el tamano del modelo no se aprovechan varias GPU.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM. En Apple Silicon funciona mediante MLX, con M4 Max como plataforma medida.
- CPU: posible mediante parakeet.cpp y el artefacto GGUF q8_0, en Linux o Windows, como via de portabilidad.
- Opciones de despliegue: NeMo (`nemo.collections.asr`, `ASRModel.restore_from`), MLX en Apple Silicon, parakeet.cpp con GGUF en CPU y la CLI `omi-med-stt` con los extras `[nemo]`, `[mlx]` o `install-cpp`. No se documenta soporte de vLLM, TGI u Ollama, que no son aplicables a un modelo NeMo de ASR.
- Latencia y throughput: no disponible. La informacion proporcionada no incluye factor de tiempo real, latencia por clip ni muestras por segundo para ninguno de los tres runtimes.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y runtimes | Idiomas | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| Omnidoctor-omimed-sst (Omi Med STT v1) | 0,6B | .nemo, MLX, GGUF | solo ingles | CC-BY-4.0 | WER 6,54 % en el banco medico interno (CUDA) |
| nvidia/parakeet-tdt-0.6b-v2 (modelo base) | 0,6B | NeMo | ingles | CC-BY-4.0 (segun la model card, coincidente con el base) | La model card afirma transcripcion medica superior al base Parakeet v2 en su evaluacion interna; no se dan cifras del base |
| Whisper large-v3 (OpenAI) | 1,55B (dato publico; no verificado en la informacion proporcionada) | no disponible en esta busqueda | multilingue | no disponible en esta busqueda | no disponible |
| Alternativas medicas de ASR abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables en la informacion disponible es frente al modelo base nvidia/parakeet-tdt-0.6b-v2, del que este checkpoint es un ajuste fino, y frente a las filas anonimas del tablero interno de 30 sistemas de Omi Health, cuyos nombres y cifras no se detallan. El resto de comparaciones queda como no disponible.

## Limitaciones y advertencias

- Modelo unicamente en ingles. No soporta castellano ni ningun otro idioma, por lo que no es util para transcripcion clinica en Espana sin un modelo adicional o un ajuste posterior.
- No es un modelo de diagnostico, triaje, prescripcion ni decision clinica. La propia model card lo declara no validado clinicamente y exige revision humana de las transcripciones antes de cualquier uso asistencial.
- Riesgo de alucinacion y de errores de transcripcion: como cualquier ASR, puede insertar, omitir o sustituir terminos. El Drug M-WER declarado, entre el 4,30 % y el 4,75 % segun runtime, implica que una fraccion no trivial de menciones de farmacos puede salir mal transcrita.
- Sensibilidad al canal y a la calidad del audio: la CLI convierte a 16 kHz mono, pero no se documentan pruebas con acentos no nativos, ruido de sala, solapamiento de hablantes ni audio telefonico.
- Los resultados de benchmark proceden de una unica tirada de un banco interno de 7,18 horas y de un unico scorer. La model card advierte de que no constituyen una clasificacion universal y que las posiciones frente a otros sistemas son relativas a esa muestra.
- La fila de CPU (GGUF q8_0) presenta el WER mas alto de las tres (7,10 %) y la model card indica que no se ha establecido superioridad clinica de ningun runtime mediante pruebas pareadas.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribucion. El modelo es un derivado de nvidia/parakeet-tdt-0.6b-v2 y no es un modelo de NVIDIA; hay que conservar la atribucion correspondiente. El runtime Omi Health se distribuye aparte bajo licencia MIT.
- La model card publica corresponde a los repositorios de la organizacion omi-health, mientras que el repositorio consultado esta bajo el usuario Salahuddin1234 con el nombre omnidoctor-omimed-sst. Es una discrepancia de procedencia que conviene verificar antes de usar los pesos en produccion, dado que el repositorio no registra descargas ni likes.
- Los metadatos marcan `inference: false`: el modelo no se sirve a traves de la Inference API de HuggingFace y requiere despliegue propio.
- El nombre "OmniDoctor" colisiona con un trabajo academico distinto sobre aprendizaje continuo para tareas de VQA medica (ACM Multimedia 2025), sin relacion aparente con este modelo de ASR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Salahuddin1234/omnidoctor-omimed-sst
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Checkpoint NeMo canonico citado en la model card: https://huggingface.co/omi-health/omi-med-stt-v1
- Exportacion MLX q8: https://huggingface.co/omi-health/omi-med-stt-v1-mlx-q8
- Exportacion MLX a precision completa: https://huggingface.co/omi-health/omi-med-stt-v1-mlx
- Exportacion GGUF para CPU: https://huggingface.co/omi-health/omi-med-stt-v1-gguf
- Runtime y recetas reproducibles: https://github.com/Omi-Health/omi-med-stt-runtime
- Resultados y detalles por plataforma: https://omi.health/research/omi-med-stt#runtime-results
- Benchmark y metodologia: https://omi.health/benchmark
- Sitio del desarrollador: https://omi.health
- Producto relacionado (Omi Scribe): https://omi.health/scribe
- Space en HuggingFace con el nombre Omnidoctor: https://huggingface.co/spaces/Salahuddin1234/omnidoctor
- Articulo "OmniDoctor: Towards LLM-centric Lifelong Learning for New Emerging Medical VQA Tasks" (ACM Multimedia 2025), aparentemente sin relacion con este modelo: https://dl.acm.org/doi/10.1145/3746027.3755745
- Ficha bibliografica del articulo anterior en dblp: https://dblp.org/rec/conf/mm/JiangZGW25
