# KlangAI/pianissimo-sv

## Resumen

Klang Pianissimo es un modelo de reconocimiento automatico del habla (ASR) especializado en sueco, desarrollado por Klang y publicado en Hugging Face bajo licencia CC BY 4.0. Se trata de un ajuste fino del checkpoint NVIDIA Parakeet TDT 0.6B v3, del que conserva arquitectura (encoder FastConformer y decodificador TDT, Token-and-Duration Transducer) y tokenizador, con aproximadamente 600 millones de parametros y un checkpoint de 2,51 GB.

El problema que resuelve es la baja precision de los modelos multilingues genericos en sueco: frente a su modelo base, Pianissimo reduce el error relativo un 76 % en Common Voice y un 57 % en FLEURS, y se situa en el mismo orden de magnitud que los ajustes especificos de KB-Whisper con un coste computacional muy inferior (2.500x tiempo real frente a 39-66x). Es relevante ahora porque demuestra que un ajuste fino bien dirigido sobre un encoder convolucional-transformer pequeno puede superar a modelos ASR mucho mayores en un idioma concreto, manteniendo transcripcion masiva de archivo.

La entrada es audio mono a 16 kHz con caracteristicas log-mel de 128 bandas. El modelo admite clips cortos y grabaciones largas, genera puntuacion, mayusculas y marcas de tiempo a nivel de palabra, y esta entrenado sobre unas 50.000 horas de habla en sueco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT, Token-and-Duration Transducer (decodificador); ajuste fino de nvidia/parakeet-tdt-0.6b-v3 |
| Parametros totales | Aproximadamente 600 millones |
| Parametros activos | No aplica: arquitectura densa, no es un modelo MoE |
| Longitud de contexto | Atencion local por defecto: 256 tramas del encoder a cada lado por capa (aprox. 20,5 s de contexto en cada direccion y por capa). El coste de atencion es lineal con la duracion, por lo que admite grabaciones largas. Entrada de audio: 16 kHz, mono |
| Tipos de cuantizacion | No disponible. La model card no documenta esquemas de cuantizacion; el checkpoint ocupa 2,51 GB y las mediciones de throughput se hicieron a precision de 16 bits |
| Idiomas soportados | Sueco (sv). No se ha establecido el comportamiento en otros idiomas ni en code-switching |
| Licencia | CC BY 4.0 |
| Formato de pesos | NeMo (.nemo), cargado mediante nemo_toolkit[asr]. Tamano del repositorio: 2,5 GB. No se documentan safetensors, GGUF ni ONNX |
| Encoder | 24 capas, subsampling 8x |
| Caracteristicas de entrada | Espectrograma log-mel de 128 bandas |
| Tarea (pipeline) | automatic-speech-recognition |
| Metricas declaradas | WER (word error rate) |
| Datasets de entrenamiento citados | google/fleurs, KlangAI/klang-dialects, RixVox, Common Voice (y dataset interno de datos publicos) |
| Descargas / likes | 816 descargas, 14 likes |
| Fechas del repositorio | Creado el 2026-09-23, actualizado el 2026-09-23 |

## Arquitectura y entrenamiento

Pianissimo mantiene la arquitectura de Parakeet v3: un encoder FastConformer de 24 capas con subsampling 8x sobre espectrogramas log-mel de 128 bandas a 16 kHz mono, y un decodificador TDT (Token-and-Duration Transducer), que predice conjuntamente el token y su duracion, lo que acelera la decodificacion frente a un transducer clasico. La diferencia operativa mas importante respecto al checkpoint original es que Pianissimo usa atencion local por defecto (256 tramas del encoder a cada lado en cada capa, unos 20,5 s en cada direccion), en lugar de atencion completa. Esto mantiene el calculo de atencion lineal en la longitud de la grabacion y hace viables las transcripciones largas sin trocear manualmente el audio.

El ajuste fino se realizo sobre aproximadamente 50.000 horas de habla en sueco, combinando datasets publicos (RixVox, Common Voice, FLEURS) con un corpus interno de Klang construido a partir de datos de acceso publico. Las tecnicas de aumento de datos aplicadas incluyen reverberacion, ruido, compresion, reduccion de ancho de banda y cambios de ganancia. La model card no detalla el uso de RLHF, DPO ni otras tecnicas de alineacion, que en un modelo ASR no resultan de aplicacion directa. Tampoco se documenta el coste de entrenamiento, el numero exacto de pasos ni la composicion porcentual del dataset.

## Capacidades

- Transcripcion de voz a texto en sueco, tanto de clips cortos como de grabaciones largas.
- Puntuacion y mayusculas generadas por el propio modelo, sin postproceso adicional obligatorio.
- Marcas de tiempo a nivel de palabra y de segmento (activable con `timestamps=True`), utiles para subtitulado y alineacion.
- Decodificacion por lotes con `batch_size` configurable; la model card recomienda `batch_size=1` para grabaciones largas.
- Rendimiento de transcripcion masiva: 2.500x tiempo real en una A100 de 80 GB con clips de 30 s, precision de 16 bits y lote optimo.
- Cobertura de variantes dialectales suecas, entrenada en parte con KlangAI/klang-dialects (WER de 4,85 % en el conjunto limpio de ese corpus).
- Tool calling / function calling: no aplica, es un modelo ASR, no un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles; solo se ha evaluado sueco.
- Capacidades especiales (modo thinking, vision, audio generativo, diarizacion de hablantes): no documentadas.

## Casos de uso

- Subtitulado de archivo audiovisual en sueco: las marcas de tiempo a nivel de palabra permiten generar subtitulos sincronizados sin un paso adicional de alineacion forzada, y la puntuacion y mayusculas reducen la edicion posterior.
- Transcripcion de reuniones y actas: con atencion local y calculo lineal, el modelo procesa grabaciones largas en una sola pasada; se recomienda `batch_size=1` porque el consumo de memoria crece con la duracion.
- Analitica de contact center en sueco: transcribir llamadas de forma masiva (2.500x tiempo real) para alimentar sistemas de busqueda, clasificacion de motivos o control de calidad, con un WER de 4,46 % en Common Voice como referencia de precision.
- Generacion de corpus etiquetados: usar las transcripciones para crear datos de entrenamiento o evaluacion de otros modelos en sueco, aprovechando el rendimiento de transcripcion masiva (50.000 horas de audio se procesarian en unas 20 horas de computo en una unica A100, calculo derivado del throughput declarado).
- Investigacion dialectologica y sociolinguistica: el modelo mantiene un WER de 4,85 % en el conjunto limpio de Klang Dialects, lo que lo hace util para estudiar variacion regional a partir de entrevistas y grabaciones de campo.
- Archivado y cumplimiento normativo: indexar y buscar por texto en archivos de audio historicos; las marcas de tiempo permiten recuperar el fragmento exacto asociado a una consulta.
- Accesibilidad en diferido: subtitulado de contenido grabado para personas con discapacidad auditiva, con la advertencia de que la model card no documenta modo streaming ni transcripcion en tiempo real.
- Preprocesado en canalizaciones de datos de voz: normalizar grandes volumenes de audio sueco a texto antes de tareas posteriores de NLP, con la ventaja de que el coste de inferencia es notablemente inferior al de alternativas Whisper.

## Benchmarks y rendimiento

Resultados declarados por el autor. WER en porcentaje sobre habla sueca, menor es mejor; el throughput masivo se expresa como multiplos de tiempo real. Todas las evaluaciones se hicieron con el mismo procedimiento de puntuacion.

| Modelo | CV test | FLEURS test | Klang Dialects | Throughput masivo |
|---|---:|---:|---:|---:|
| Pianissimo | 4,46 | 6,51 | 4,85 | 2.500x |
| Parakeet TDT 0.6B v3 | 18,54 | 15,18 | 25,82 | 2.500x |
| KB-Whisper medium | 5,40 | 6,58 | 3,58 | 66x |
| KB-Whisper large | 3,91 | 5,08 | 2,30 | 39x |
| Whisper large-v3 | 8,07 | 7,24 | 8,16 | 39x |

Detalles de la evaluacion: 5.516 clips de test de Common Voice v26, 758 clips de test de FLEURS y las 1.804 grabaciones del conjunto limpio de Klang Dialects. El WER es a nivel de corpus, calculado tras convertir a minusculas, sustituir la puntuacion por espacios y colapsar espacios en blanco. El throughput se midio en una NVIDIA A100 de 80 GB con clips de 30 s, precision de 16 bits y tamanos de lote optimos.

No se han publicado otros resultados de benchmarks (por ejemplo, suites multimetricas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 2,51 GB en disco. En fp16 los 600 M de parametros ocuparian aproximadamente 1,2 GB; en fp32, unos 2,4 GB, coherente con el tamano del repositorio. El autor indica que el uso de memoria crece con la duracion de la grabacion y con el tamano de lote, por lo que no hay una cifra unica de VRAM valida para todos los casos.
- GPU de referencia: NVIDIA H100 capaz de transcribir una hora de audio en un segundo segun el autor. Las mediciones de throughput se hicieron en una A100 de 80 GB.
- GPU consumer: con clips de 30 s y `batch_size=1`, el modelo cabe con holgura en cualquier GPU consumer de 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 3090, RTX 4090), segun estimacion basada en el tamano del checkpoint; para grabaciones muy largas conviene partir de 24 GB. El autor recomienda GPU NVIDIA y el uso de CPU no esta cuantificado.
- Opciones de despliegue: NeMo toolkit (`nemo_toolkit[asr]`) con PyTorch, cargando el modelo con `ASRModel.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; tampoco se menciona exportacion a ONNX o TensorRT en la model card.
- Latencia y throughput: 2.500x tiempo real en modo masivo (A100 80 GB, clips de 30 s, 16 bits, lote optimo). Es una cifra de throughput por lotes, no de latencia por peticion; no se publica latencia de primera palabra ni comportamiento en streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER CV test | WER FLEURS | WER Klang Dialects | Throughput | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Pianissimo (KlangAI/pianissimo-sv) | ~600 M | 16 kHz mono, atencion local (aprox. 20,5 s por capa y direccion) | 4,46 | 6,51 | 4,85 | 2.500x | CC BY 4.0 | Hugging Face, NeMo |
| Parakeet TDT 0.6B v3 | 0,6 B (segun denominacion) | 16 kHz mono, atencion completa | 18,54 | 15,18 | 25,82 | 2.500x | No disponible en la informacion proporcionada | Hugging Face, NeMo |
| KB-Whisper medium | No disponible | Whisper, ventanas de 30 s | 5,40 | 6,58 | 3,58 | 66x | No disponible en la informacion proporcionada | Hugging Face |
| KB-Whisper large | No disponible | Whisper, ventanas de 30 s | 3,91 | 5,08 | 2,30 | 39x | No disponible en la informacion proporcionada | Hugging Face |
| Whisper large-v3 | No disponible | Whisper, ventanas de 30 s | 8,07 | 7,24 | 8,16 | 39x | No disponible en la informacion proporcionada | Hugging Face |

Lectura de la comparativa: Pianissimo supera con claridad a su modelo base Parakeet v3 en los tres conjuntos, y a Whisper large-v3 en Common Voice y FLEURS, con una ventaja de throughput de dos ordenes de magnitud (2.500x frente a 39x). Sin embargo, KB-Whisper large sigue siendo mejor en FLEURS (5,08 frente a 6,51) y en Klang Dialects (2,30 frente a 4,85), por lo que la eleccion depende de si prima el coste de inferencia o la precision maxima en dominios dialectales. Los parametros de los modelos KB-Whisper y Whisper large-v3 no se detallan en la informacion proporcionada y las licencias de los modelos comparados no se han verificado.

## Limitaciones y advertencias

- El propio autor advierte de que el habla solapada, el ruido de fondo fuerte, los nombres poco comunes y el vocabulario especializado reducen la calidad de la transcripcion.
- El formato de numeros y la puntuacion pueden requerir edicion manual segun la aplicacion destino.
- Evaluacion centrada exclusivamente en sueco; no se ha establecido el rendimiento en otros idiomas ni con code-switching, por lo que no debe usarse como modelo multilingue.
- Las cifras de WER se calcularon tras normalizar el texto (minusculas, puntuacion sustituida por espacios, espacios colapsados), de modo que no son directamente comparables con evaluaciones que conservan puntuacion y mayusculas.
- Riesgo de inserciones y transcripciones plausibles en segmentos con ruido, silencio o audio musical: no se publican tasas de alucinacion ni de insercion, ni resultados con audio no vocal.
- No se documentan sesgos demograficos ni desagregacion del WER por acento, edad, sexo o procedencia regional. El conjunto Klang Dialects es el unico indicio de cobertura dialectal.
- Licencia CC BY 4.0: permite uso comercial, incluida la modificacion y redistribucion, siempre que se atribuya a Klang y se indique si hubo cambios. Conviene verificar la licencia del modelo base Parakeet v3 antes de redistribuir pesos derivados.
- No se documentan cuantizaciones ni formatos de despliegue ligero (GGUF, ONNX), lo que limita su uso en entornos sin PyTorch/NeMo o en dispositivos con poco espacio.
- El throughput de 2.500x se midio con clips de 30 s, precision de 16 bits y lote optimo en una A100 de 80 GB; no debe extrapolarse a inferencias de una sola peticion ni a audio muy largo sin verificar el consumo de memoria.
- La model card no describe modo streaming ni decodificacion incremental, por lo que no es apta como modelo de subtitulado en directo sin trabajo adicional.
- No hay informacion sobre el desglose del dataset de entrenamiento ni sobre el porcentaje de datos sinteticos o generados, lo que dificulta auditar posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KlangAI/pianissimo-sv
- Modelo base NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Dataset RixVox citado en el entrenamiento: https://huggingface.co/datasets/KBLab/rixvox
- Dataset Common Voice / FLEURS (google/fleurs): https://huggingface.co/datasets/google/fleurs
- Dataset Klang Dialects (KlangAI/klang-dialects): https://huggingface.co/datasets/KlangAI/klang-dialects
- Cita del autor (BibTeX, sin paper asociado): Klang, "Klang Pianissimo", 2026, Hugging Face model repository.
- Nota sobre la busqueda web: los resultados obtenidos no contienen informacion relevante sobre el modelo (paginas de inicio de sesion y guias no relacionadas), por lo que no se incluyen enlaces adicionales. No se ha localizado paper tecnico, repositorio de codigo ni demostracion publica.
