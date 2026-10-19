# ihnatov-yuri/parakeet-tdt-0.6b-v3-uk

## Resumen

`ihnatov-yuri/parakeet-tdt-0.6b-v3-uk` es un modelo de reconocimiento automatico del habla (ASR) obtenido por fine-tuning de `nvidia/parakeet-tdt-0.6b-v3` sobre ucraniano, manteniendo el ingles. Lo publica el desarrollador independente ihnatov-yuri bajo licencia CC-BY-4.0 y conserva la arquitectura, el tokenizer y el vocabulario de 8.193 tokens del modelo base, por lo que es un reemplazo directo en pipelines existentes basados en FastConformer + TDT (Token-and-Duration Transducer).

El modelo resuelve un problema concreto: el ASR open source para ucraniano de calidad alta y bajo coste computacional. Con 627 millones de parametros, reduce el WER agregado un 27% respecto al modelo base de NVIDIA (9,18% a 6,63%) y un 21% respecto a Whisper large-v3 (8,36% a 6,63%) sobre 2.942 clips ucranianos retenidos, con intervalos de confianza bootstrap del 95% que confirman la mejora. Ademas, en Apple Silicon (Core ML, Neural Engine) transcribe a 190x tiempo real consumiendo unos 0,10 Wh por hora de audio, frente a 12,6 Wh de Whisper large-v3.

Su relevancia practica esta en el despliegue: el encoder int8 de Core ML ocupa 603 MB y cabe en el Neural Engine de un portatil, lo que habilita transcripcion offline, privada y de bajo consumo en dispositivos Apple, ademas de inferencia PyTorch estandar via `transformers`. La salida incluye mayusculas, puntuacion y numeros en digitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.057.286 (~0,63 mil millones), dato real de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; es un modelo de audio, las evaluaciones usan clips de 1 a 20 s |
| Tipos de cuantizacion | int8 (encoder Core ML, 567 MB), 6-bit palettized (425 MB), fp16 (1,1 GB); pesos PyTorch en el repo sin cuantizar |
| Idiomas soportados | ucraniano (uk) e ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (PyTorch/Transformers) y Core ML `.mlmodelc` (Preprocessor, Encoder, Decoder, JointDecisionv3) |
| Vocabulario | 8.193 tokens (heredado del modelo base) |
| Entrada de audio | 16 kHz mono, formato WAV float32 en el ejemplo de uso |
| Modelo base | nvidia/parakeet-tdt-0.6b-v3 |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 4,8 GB (incluye variantes Core ML) |
| Libreria | transformers (`AutoModelForTDT`, `AutoProcessor`) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base: un encoder FastConformer acoplado a un decodificador TDT (Token-and-Duration Transducer), que predice conjuntamente el token y su duracion, lo que permite alineamientos mas eficientes que un CTC o un transducer clasico. No se modifican ni el tokenizer ni el vocabulario de 8.193 tokens, de modo que las herramientas y los formatos de despliegue del modelo original (incluido FluidAudio) siguen siendo validos. El fine-tuning se hizo en dos etapas sobre un MacBook Pro M3 Pro con backend MPS.

Etapa 1: 160 horas durante 1 epoca con learning rate 5e-5 y las 12 capas inferiores del encoder congeladas. Los datos fueron sesiones plenarias de la Verkhovna Rada (96,7 h alineadas con los estenogramas oficiales), videos publicos con subtitulos ucranianos creados por los subidores (60,9 h) y FLEURS ingles (8 h) para preservar el ingles. Etapa 2: 122,6 horas durante 0,8 epocas con learning rate 2e-5, anadiendo dominios de IT, psicologia, medicina, ingenieria y charlas generales de la misma plataforma de video, mas las mismas horas replicadas de la etapa 1; se eliminaron los videos cuyo audio no era ucraniano (subtitulos traducidos). Se mantuvo BatchNorm en modo eval durante todo el ajuste y las transcripciones conservan mayusculas y puntuacion originales. No se documenta en la informacion disponible el uso de RLHF o DPO, algo esperable en un modelo ASR.

## Capacidades

- Transcripcion de voz a texto en ucraniano e ingles con un unico modelo y un unico tokenizer.
- Salida con mayusculas y puntuacion, y numeros escritos como digitos (estilo estenograma: "15 відсотків").
- Reconocimiento robusto en dominios especificos: parlamentario, divulgacion, IT, psicologia, medicina e ingenieria.
- Ejecucion en CPU/GPU via PyTorch con `AutoModelForTDT` y `AutoProcessor` de Transformers.
- Ejecucion en el Neural Engine de Apple mediante Core ML (variantes int8, 6-bit y fp16) con el layout de FluidAudio.
- Inferencia de muy alto rendimiento: 190x tiempo real en un M3 Pro con la build int8.
- Capacidad bilingue practica: el ingles se conserva durante el fine-tuning (WER 5,47% en FLEURS en).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puro de ASR (feature-extraction / transcripcion).
- No dispone de modo thinking, vision ni audio-vision; la informacion no describe diarizacion ni timestamps a nivel de palabra.

## Casos de uso

- Transcripcion de sesiones parlamentarias y actas oficiales: con 5,00% de WER en cuatro sesiones plenarias no vistas de la Verkhovna Rada, es adecuado para generar borradores de estenogramas que luego revise un editor humano, sustituyendo transcripcion manual de horas de audio.
- Subtitulado de videos divulgativos y charlas tecnicas: 7,60% de WER en 13 canales no vistos con tematica mixta, suficiente para subtitulos automaticos con revision ligera en plataformas de video ucranianas.
- Dictado clinico en medicina: el modelo baja a 8,02% de WER en el dominio medico (frente a 11,15% del base y 11,73% de Whisper large-v3), por lo que sirve para pre-rellenar informes a partir de dictado del facultativo.
- Documentacion tecnica y notas de ingenieria: 8,08% de WER en el conjunto de ingenieria permite transcribir reuniones tecnicas y generar actas o tickets a partir de audio.
- Aplicaciones macOS/iOS offline con privacidad estricta: el encoder int8 de 603 MB corre en el Neural Engine a 190x tiempo real con ~0,10 Wh por hora de audio, lo que hace viable transcribir en el dispositivo sin enviar audio a la nube ni agotar la bateria.
- Procesado por lotes de archivo audiovisual a gran escala: 190x tiempo real implica que una hora de audio se transcribe en unos 19 segundos de computo en un M3 Pro, y el consumo de 18,9 s de computo por hora de audio reduce costes energeticos frente a Whisper (49 min de computo por hora).
- Generacion de corpus y datasets para PLN en ucraniano: el modelo puede transcribir grandes volumenes de video publico para construir corpus etiquetados o para alimentar sistemas de traduccion y analisis.
- Reuniones bilingues ucraniano/ingles: al conservar el ingles (5,47% de WER en FLEURS en, sin diferencia significativa respecto a Whisper large-v3), cubre entornos de trabajo mixtos con un solo modelo.

## Benchmarks y rendimiento

WER sobre texto normalizado (minusculas, sin puntuacion, guiones como espacios), conjuntos de prueba retenidos completos (3.568 clips de 1 a 20 s). Ejecucion en Core ML sobre Apple M3 Pro: Whisper large-v3 via WhisperKit, Parakeet via FluidAudio 0.15.6 (este modelo en build int8).

| Conjunto de prueba | Clips | Whisper large-v3 | Modelo base | Este modelo |
|---|---|---|---|---|
| Verkhovna Rada (4 sesiones no vistas) | 605 | 7,76% | 8,86% | **5,00%** |
| Charlas publicas, tematica mixta (13 canales) | 439 | 11,41% | 11,69% | **7,60%** |
| FLEURS uk | 731 | 6,87% | 7,10% | **6,17%** |
| IT | 271 | **7,68%** | 9,32% | 8,36% |
| Psicologia | 317 | **4,21%** | 5,94% | 4,77% |
| Medicina | 282 | 11,73% | 11,15% | **8,02%** |
| Ingenieria | 297 | 9,51% | 11,25% | **8,08%** |
| Media de los 7 conjuntos ucranianos | 2.942 | 8,45% | 9,33% | **6,86%** |
| Agregado (pooled) de los 7 conjuntos | 2.942 | 8,36% | 9,18% | **6,63%** |
| FLEURS en (ingles conservado) | 626 | **5,06%** | 5,74% | 5,47% |

Intervalos de confianza bootstrap pareado sobre clips (95%, agregado sobre los 7 conjuntos ucranianos): frente a Whisper large-v3, -1,73 puntos [-2,04, -1,42], con mejora significativa en Rada, charlas mixtas, FLEURS uk, medicina e ingenieria y sin diferencia significativa en IT, psicologia e ingles; frente al modelo base, -2,55 puntos [-2,79, -2,34], mejor en los 7 conjuntos ucranianos.

Velocidad y tamano (Core ML, M3 Pro, modelos cargados):

| Modelo | Velocidad | Computo por hora de audio | Tamano |
|---|---|---|---|
| Whisper large-v3 (WhisperKit) | 1,2x tiempo real | 49 min | 3,1 GB |
| Modelo base, Core ML 6-bit | 313x | 11,5 s | 461 MB |
| Este modelo, Core ML int8 | 190x | 18,9 s | 603 MB |

Energia por hora de audio: 12,6 Wh (Whisper large-v3) frente a ~0,10 Wh de este modelo. Sobre un benchmark de 98 clips (21 min), WER por clip de las variantes Core ML: PyTorch 6,72%, int8 6,93%, 6-bit 6,97%, fp16 6,97%; la build Core ML cuesta aproximadamente 0,1 puntos de WER en los conjuntos completos, atribuido al front-end mel de FluidAudio.

## Requisitos de hardware

- VRAM estimada para inferencia en PyTorch: ~2,5 GB en fp32 y ~1,25 GB en fp16 (estimacion a partir de los 627 M de parametros; no verificada en la informacion).
- Core ML en Apple Silicon: encoder int8 de 567 MB (603 MB el modelo cargado), 6-bit de 425 MB y fp16 de 1,1 GB. Las variantes int8 y 6-bit corren en el Neural Engine; la fp16 es demasiado grande para el Neural Engine y se ejecuta en CPU.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para el modelo en fp16 (RTX 3060, RTX 4090, etc.); en datacenter, A100/H100 quedan sobredimensionadas para un modelo de 0,63 B, pero permiten batchear muchas horas de audio en paralelo.
- Cabe en GPU consumer: si, con margen amplio; el caso mas restrictivo es el despliegue movil, cubierto por las builds Core ML.
- Opciones de despliegue documentadas: `transformers` con `AutoModelForTDT` + `AutoProcessor`, y FluidAudio 0.15.6 (Swift) sobre Core ML. Para vLLM, llama.cpp, Ollama o TGI no hay informacion disponible; llama.cpp/Ollama no son aplicables a un modelo ASR de este tipo sin portar la arquitectura TDT.
- Throughput y latencia: 190x tiempo real (unos 19 s de computo por hora de audio) en un M3 Pro con la build int8, y 313x en el modelo base 6-bit; no se proporcionan cifras para GPU NVIDIA.
- Huella en disco: repositorio de 4,8 GB, aunque solo es necesario descargar la variante que se vaya a usar (603 MB en int8).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER ucraniano (pooled) | WER FLEURS en | Velocidad (M3 Pro) | Tamano | Licencia |
|---|---|---|---|---|---|---|---|
| Este modelo (parakeet-tdt-0.6b-v3-uk) | 627 M | uk, en | 6,63% | 5,47% | 190x tiempo real | 603 MB (int8) | cc-by-4.0 |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 627 M | uk, en (segun la informacion) | 9,18% | 5,74% | 313x tiempo real | 461 MB (6-bit) | no disponible en la informacion |
| Whisper large-v3 | no disponible en la informacion | multilingue (no detallado) | 8,36% | 5,06% | 1,2x tiempo real | 3,1 GB | no disponible en la informacion |

Frente al modelo base, este fine-tune mejora el WER en los 7 conjuntos ucranianos a cambio de un 39% menos de velocidad (190x frente a 313x) y 0,1 puntos de WER por el front-end Core ML. Frente a Whisper large-v3, gana 1,73 puntos de WER agregado en ucraniano, es unas 160 veces mas rapido y consume dos ordenes de magnitud menos energia, pero pierde en psicologia (4,77% frente a 4,21%) y en ingles (5,47% frente a 5,06%, sin diferencia significativa), y no cubre el resto de idiomas que si soporta Whisper.

## Limitaciones y advertencias

- Los numeros se emiten como digitos en estilo estenograma ("15 відсотків"), lo que puede requerir post-procesado si se espera texto escrito con letras.
- El material de entrenamiento es mayoritariamente habla formal o semiforme (Rada y videos publicos); cabe esperar mayores tasas de error en dialectos marcados, surzhyk y audio ruidoso (la model card original detalla mas casos, pero la informacion disponible se corta en ese punto).
- Solo cubre ucraniano e ingles; no hay soporte documentado para otros idiomas, y no se garantiza el mantenimiento del ingles fuera del dominio FLEURS.
- La licencia es CC-BY-4.0, que permite uso comercial con atribucion; no se indica en la informacion la licencia del modelo base de NVIDIA, que conviene verificar antes de un despliegue comercial.
- Todos los benchmarks son autoevaluados por el autor sobre conjuntos propios (Rada, canales de video, FLEURS); no hay replicacion independiente ni comparacion con otros sistemas ASR ucranianos aparte de Whisper large-v3 y el base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por terceros es practicamente inexistente.
- La build Core ML usa el front-end mel de FluidAudio y no el de PyTorch, lo que introduce ~0,1 puntos de WER adicionales; las cifras de velocidad y energia solo aplican a ese entorno Apple.
- Como todo modelo ASR, puede producir alucinaciones o texto repetido en segmentos con silencio, musica o ruido extremo; conviene aplicar deteccion de voz y filtros de confianza en produccion.
- No se documentan marcas de tiempo, diarizacion ni deteccion de idioma, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Blog del autor sobre el fine-tuning: https://ihnatov.nl/parakeet-uk/
- FluidAudio (runtime Swift/Core ML): https://github.com/FluidInference/FluidAudio
