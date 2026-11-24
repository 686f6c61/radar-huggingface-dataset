# ihnatov-yuri/parakeet-tdt-0.6b-v3-uk

## Resumen

`ihnatov-yuri/parakeet-tdt-0.6b-v3-uk` es un modelo de reconocimiento automático del habla (ASR) en ucraniano, obtenido por ajuste fino del modelo `nvidia/parakeet-tdt-0.6b-v3` sobre datos de audio en ucraniano. Lo desarrolla el usuario independiente ihnatov-yuri y mantiene la misma arquitectura, tokenizador y vocabulario de 8193 tokens del modelo base de NVIDIA, conservando además el inglés como idioma de salida. La salida incluye mayúsculas, puntuación y números en dígitos, lo que lo hace directamente utilizable en transcripción de producción sin postprocesado pesado.

El modelo se distribuye en dos formatos: pesos PyTorch en safetensors para Hugging Face Transformers (`AutoModelForTDT`) y compilaciones Core ML (int8, 6-bit palettized y fp16) para ejecución en Apple Silicon vía FluidAudio, con el encoder int8 de 567 MB corriendo en el Neural Engine. Es relevante porque cubre un hueco de ASR de calidad para ucraniano con un modelo de solo 627 millones de parámetros, superando al modelo base de NVIDIA en todos los conjuntos de evaluación ucranianos publicados y mejorando de forma notable la preservación de palabras en inglés dentro de habla ucraniana (del 32,8 % al 78,7 % en clips de prueba).

La versión 3 (30 de octubre de 2026) continúa el entrenamiento desde la versión 2 sobre 738 horas, añadiendo 80 horas de vídeos y pódcastes de medicina, informática e ingeniería y 10 horas de clips con habla mixta ucraniano-inglés. El resultado es una reducción del WER agregado del 12,13 % (base) al 8,22 % en 7.684 clips retenidos, con licencia CC-BY-4.0 que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clips de 1 a 20 s en evaluacion) |
| Tipos de cuantizacion | int8 (Core ML, encoder 567 MB), 6-bit palettized (Core ML, encoder 425 MB), fp16 (Core ML, encoder 1,1 GB); pesos PyTorch sin cuantizar |
| Idiomas soportados | ucraniano (uk), inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (Transformers), Core ML `.mlmodelc` (int8, 6-bit, fp16) |
| Vocabulario | 8193 tokens (identico al modelo base) |
| Entrada de audio | 16 kHz mono |
| Tamano del repo | 14,3 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer, una variante del Conformer con atencion eficiente y submuestreo agresivo de la secuencia de entrada, combinada con un decodificador TDT (Token-and-Duration Transducer). El TDT predice conjuntamente el token y su duracion, lo que reduce el numero de pasos de decodificacion frente a un transducer clasico y mejora el throughput. El modelo conserva integramente el tokenizador y los 8193 tokens del vocabulario del modelo base de NVIDIA, lo que permite reutilizar los mismos componentes Core ML y la misma integracion con FluidAudio.

El ajuste fino se realizo en tres iteraciones. La version 1 se documento en el articulo "How I Fine-Tuned a Speech-to-Text Model in a Weekend". La version 3 parte de la version 2 y anade 738 horas de entrenamiento, de las cuales 80 horas corresponden a videos y pódcastes de medicina, informatica e ingenieria y 10 horas a clips que alternan ucraniano e ingles. No se detalla en la informacion disponible la composicion completa del dataset, el numero total de tokens de audio ni si se aplicaron tecnicas de RLHF o DPO (no aplicables de forma habitual en ASR). Las versiones anteriores siguen accesibles fijando revisiones concretas (`ea1f808b` para la v2, `08e41c63` para la v1).

## Capacidades

- Transcripcion de voz a texto en ucraniano con mayusculas, puntuacion y numeros en digitos.
- Reconocimiento de habla en ingles, con WER de 5,42 % en FLEURS en y 12,30 % en reuniones AMI.
- Manejo de habla mixta ucraniano-ingles: conserva palabras inglesas dentro de discurso ucraniano en el 78,7 % de los casos en el conjunto de prueba de 200 clips.
- Transcripcion de audio de 1 a 20 segundos por clip en la evaluacion publicada.
- Ejecucion en Apple Silicon (M-series) mediante Core ML y FluidAudio, con encoder int8 en el Neural Engine.
- Ejecucion en PyTorch mediante `AutoModelForTDT` y `AutoProcessor` de Transformers.
- No se documenta soporte de tool calling, agentes, vision ni audio mas alla de ASR.

## Casos de uso

- Transcripcion de reuniones de comites parlamentarios: el modelo reduce el WER al 8,31 % en 47 reuniones no vistas, lo que lo hace adecuado para actas y busqueda sobre transcripciones de sesiones largas divididas en clips.
- Subtitulado de pódcastes y entrevistas: con WER del 10,44 % en 8 grabaciones de canales no vistos, sirve para generar subtitulos en ucraniano con puntuacion y mayusculas listos para revision humana ligera.
- Transcripcion de sesiones plenarias de la Verkhovna Rada: el WER del 4,54 % en 4 sesiones no vistas lo posiciona para digitalizacion de archivos parlamentarios y busqueda textual.
- Documentacion clinica dictada: las 80 horas de medicina, informatica e ingenieria anadidas en la v3 mantienen un WER del 8,89 % en el conjunto de medicina, util para borradores de informes que un profesional revisa.
- Contenido tecnologico y educativo: con WER del 8,56 % en IT y 8,28 % en ingenieria, es adecuado para transcribir tutoriales, charlas tecnicas y cursos.
- Aplicaciones macOS/iOS nativas: las compilaciones Core ML int8 (567 MB) y 6-bit (425 MB) corren en el Neural Engine via FluidAudio, lo que permite transcripcion local sin conexion en portatiles Apple.
- Analisis de contenido bilingue ucraniano-ingles: la mejora en preservacion de palabras inglesas (78,7 %) lo hace util para pódcastes y videos donde se mezclan ambos idiomas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos retenidos (sin solapamiento con entrenamiento), con WER sobre texto normalizado (minusculas, sin puntuacion, guiones como espacios). Los modelos Parakeet se ejecutan en Core ML sobre Apple M3 Pro via FluidAudio; el modelo base usa la build 6-bit de FluidAudio y las versiones 1 a 3 usan las builds int8 de este repositorio.

| Conjunto de prueba | Clips | Base | v1 | v2 | v3 |
|---|---|---|---|---|---|
| Comites parlamentarios (47 reuniones no vistas) | 3.389 | 13,81 % | 10,07 % | 8,84 % | **8,31 %** |
| Podcasts y entrevistas (8 grabaciones, canales no vistos) | 644 | 13,78 % | 10,71 % | 10,56 % | **10,44 %** |
| YODAS, videos publicos (20 videos no vistos) | 709 | 16,34 % | 14,72 % | 13,95 % | **13,57 %** |
| Pleno de la Verkhovna Rada (4 sesiones no vistas) | 605 | 8,86 % | 5,00 % | 4,90 % | **4,54 %** |
| Charlas en video, temas mixtos | 439 | 11,69 % | **7,60 %** | 7,76 % | 7,74 % |
| FLEURS uk | 731 | 7,10 % | **6,17 %** | 6,23 % | 6,18 % |
| IT | 271 | 9,32 % | **8,36 %** | 8,50 % | 8,56 % |
| Medicina | 282 | 11,15 % | **8,02 %** | 8,90 % | 8,89 % |
| Psicologia | 317 | 5,94 % | 4,77 % | 4,48 % | **4,27 %** |
| Ingenieria | 297 | 11,25 % | **8,08 %** | 8,37 % | 8,28 % |
| **Media de los 10 conjuntos ucranianos** | 7.684 | 10,92 % | 8,35 % | 8,25 % | **8,08 %** |
| **Agregado sobre los 10 conjuntos ucranianos** | 7.684 | 12,13 % | 9,07 % | 8,53 % | **8,22 %** |
| FLEURS en | 626 | 5,74 % | 5,47 % | 5,53 % | **5,42 %** |
| Reuniones AMI en ingles (3 no vistas) | 1.126 | 14,36 % | 14,59 % | 12,68 % | **12,30 %** |

Bootstrap pareado sobre grabaciones (intervalo del 95 % de la diferencia de WER, agregado sobre los 10 conjuntos ucranianos, 442 grabaciones): la version 3 frente a la version 2 mejora en **-0,31 puntos [-0,39, -0,23]**, con mejoras en comites (-0,5), YODAS (-0,4), pleno de la Rada (-0,4) y psicologia (-0,2); en los otros seis conjuntos la diferencia es inferior a 0,15 puntos y queda dentro del ruido. Los nuevos datos de medicina, IT e ingenieria no movieron esos tres conjuntos.

Preservacion de palabras inglesas dentro de habla ucraniana (200 clips de prueba): base 32,8 %, v1 26,1 %, v2 32,9 %, v3 **78,7 %**.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un modelo ASR. El autor menciona una comparacion con Whisper large-v3 y Whisper UK en los mismos clips, pero los valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en PyTorch: no disponible de forma explicita; con 627 millones de parametros, los pesos en fp32 ocupan aproximadamente 2,5 GB y en fp16 unos 1,25 GB, mas memoria para activaciones y decodificacion.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos 4-6 GB de VRAM deberia poder ejecutar los pesos en fp16, aunque no se confirma en la documentacion.
- Apple Silicon: las builds Core ML estan disenadas para el Neural Engine. El encoder int8 (567 MB) es la opcion recomendada; el 6-bit (425 MB) replica el formato del modelo stock de FluidAudio; el fp16 (1,1 GB) es demasiado grande para el Neural Engine y se ejecuta en CPU.
- Cabe en GPU consumer: previsiblemente si, dado el tamano, aunque el autor no publica requisitos minimos ni pruebas en GPUs consumer.
- Opciones de despliegue: Transformers (`AutoModelForTDT` + `AutoProcessor`), Core ML via FluidAudio (Swift), y en teoria vLLM, llama.cpp u Ollama no estan documentados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. Los benchmarks se ejecutaron en un Apple M3 Pro con Core ML via FluidAudio, una llamada por clip, pero no se publican tiempos por clip ni RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER ucraniano (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ihnatov-yuri/parakeet-tdt-0.6b-v3-uk | 627 M | uk, en | 8,22 % agregado (10 conjuntos) | CC-BY-4.0 | Hugging Face, Core ML |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 627 M | multilingue | 12,13 % agregado (10 conjuntos) | no disponible en la informacion | Hugging Face |
| Whisper large-v3 | no disponible en la informacion | multilingue | comparado por el autor, valores no publicados en la informacion | no disponible en la informacion | Hugging Face |
| ihnatov-yuri/whisper-large-v3-turbo-uk | no disponible en la informacion | uk | comparado por el autor, valores no publicados en la informacion | no disponible en la informacion | Hugging Face |

La comparacion cuantitativa con Whisper large-v3 y Whisper UK se anuncia en la model card ("Comparison with the other Ukrainian models") pero los valores no se incluyen en la informacion proporcionada, por lo que no se replican aqui.

## Limitaciones y advertencias

- El modelo solo cubre ucraniano e ingles; no se documenta soporte de otros idiomas.
- Los clips evaluados tienen entre 1 y 20 segundos; no se especifica el comportamiento en audio de duracion muy superior sin segmentacion.
- El WER en videos publicos (YODAS) es del 13,57 %, notablemente superior al de dominios como el pleno parlamentario (4,54 %), lo que indica sensibilidad al dominio y a la calidad de grabacion.
- Riesgo de alucinacion y de errores en nombres propios, terminologia tecnica y cifras no evaluado de forma especifica en la informacion disponible.
- La preservacion de palabras inglesas, aunque mejorada al 78,7 %, implica que aproximadamente una de cada cinco palabras inglesas en habla ucraniana no se mantiene en ingles.
- No se publican analisis de sesgos por acento, dialecto, edad o genero; el rendimiento en variedades del ucraniano distintas de las de los conjuntos de prueba es desconocido.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero conviene verificar las condiciones del modelo base de NVIDIA, cuya licencia no se detalla en la informacion disponible.
- Las builds Core ML requieren que la carpeta se llame exactamente `parakeet-tdt-0.6b-v3` para FluidAudio, y cada `config.json` declara la version (`"version": "uk_v5"`); una integracion incorrecta puede cargar pesos equivocados.
- El repositorio ocupa 14,3 GB por incluir pesos PyTorch y tres variantes Core ML; en despliegues moviles conviene descargar solo la carpeta Core ML necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Revision version 2: https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk/tree/ea1f808b
- Revision version 1: https://huggingface.co/ihnatov-yuri/parakeet-tdt-0.6b-v3-uk/tree/08e41c63
- Articulo sobre el ajuste fino de la version 1: https://ihnatov.nl/parakeet-uk/
- Whisper UK del mismo autor: https://huggingface.co/ihnatov-yuri/whisper-large-v3-turbo-uk
- FluidAudio (repositorio): https://github.com/FluidInference/FluidAudio
