# SonoJot/sonojot-parakeet-v1

## Resumen

SonoJot Parakeet v1 es un modelo de reconocimiento automatico del habla (ASR) en ingles, desarrollado por SonoJot como ajuste fino de NVIDIA Parakeet TDT 0.6B v2 (revision `ae9ad070`). El objetivo es reducir errores en dictado y habla conversacional, y se distribuye ya exportado para el runtime sherpa-onnx. La arquitectura, el tokenizer y el decodificado son identicos al modelo base: encoder FastConformer con decodificador TDT (Token-and-Duration Transducer).

El modelo conserva los 0,6 mil millones de parametros del original y esta disponible en dos builds ONNX: int8 (661 MB, orientado a CPU) y fp16 (1,26 GB, orientado a GPU). Requiere sherpa-onnx 1.13.8 o superior con `model_type="nemo_transducer"`. Solo soporta ingles y se publica bajo licencia CC BY 4.0.

Su relevancia radica en que mejora de forma medible la tasa de error por palabra (WER) del modelo original en dominios de dictado, reuniones con microfono de solapa y habla espontanea, manteniendo el mismo coste computacional y el mismo formato de despliegue que los exports estandar de sherpa-onnx. La model card documenta la evaluacion con intervalos de confianza por bootstrap, lo que permite valorar la significancia de las mejoras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + TDT (Token-and-Duration Transducer) decoder |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de ONNX Runtime) y fp16 (onnxconverter-common, entradas y salidas fp32) |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (encoder, decoder y joiner separados; `tokens.txt`) |

## Arquitectura y entrenamiento

El modelo es un transducer ASR: un encoder FastConformer procesa el audio y un decodificador TDT genera tokens junto con predicciones de duracion, con un joiner que combina ambas representaciones. El ajuste fino modifica todos los pesos excepto las estadisticas de BatchNorm del encoder, durante 5.000 pasos; despues se aplica una interpolacion en el espacio de pesos (promedio elemento a elemento entre el modelo ajustado y el original, alpha 0.5). El tokenizer y el decodificado no cambian respecto al base.

Las transcripciones objetivo proceden de Qwen3-ASR 1.7B (Apache-2.0), conservadas solo cuando coincidian con Parakeet v2, con la transcripcion de origen o con IBM Granite Speech 4.1 2B NAR (Apache-2.0). El audio de entrenamiento es todo de licencia permisiva: audiolibros (LibriHeavy sobre LibriVox, dominio publico), videos web con subtitulos Creative Commons (YODAS English, CC BY 3.0), grabaciones publicas (The People's Speech, solo subconjuntos CC-BY), discursos del Parlamento Europeo (VoxPopuli, CC0), reuniones con microfonos close-talk (AMI y NOTSOFAR-1, CC BY 4.0; DiPCo, CDLA-Permissive-1.0) y unas 14 horas de grabaciones propias del desarrollador (aproximadamente el 1,1% del audio de entrenamiento, no distribuidas). La exportacion usa el recetario de sherpa-onnx v1.13.8; aplicar el mismo pipeline al modelo base reproduce el export int8 oficial dentro del ruido en todos los conjuntos evaluados.

## Capacidades

- Reconocimiento automatico del habla en ingles (transcripcion de audio a texto).
- Dictado: optimizado explicitamente para reducir errores en dictado y habla conversacional.
- Transcripcion de reuniones con microfonos close-talk y de solapa.
- Manejo de habla espontanea y de acentos (evaluado en VoxPopuli con acento ingles).
- Decodificado por transducer TDT con prediccion de duraciones, sin necesidad de modelo de lenguaje externo.
- Ejecucion en CPU (build int8) y en GPU (build fp16) mediante sherpa-onnx.
- No soporta tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.
- No es multilingue: solo ingles.

## Casos de uso

- Dictado en aplicaciones de escritorio y moviles: el modelo esta ajustado especificamente sobre dictado y se distribuye en int8 (661 MB) para ejecucion local en CPU, lo que permite integrarlo en apps sin depender de la nube.
- Transcripcion de reuniones con microfono de solapa: las evaluaciones en AMI y NOTSOFAR-1 muestran mejoras frente al modelo original (WER 7,72 frente a 8,81 en AMI test; 6,88 frente a 8,60 en NOTSOFAR-1 dev set 1), lo que lo hace adecuado para actas automaticas de reuniones.
- Subtitulado y transcripcion de contenido grabado en ingles: util para podcasts, charlas TED y videos, con WER de 3,89 en TED talks y 3,27 en LibriSpeech test-other.
- Analisis de llamadas y atencion al cliente: transcripcion de llamadas en ingles (WER 20,02 en Earnings-22) como paso previo a analitica, resumen o busqueda sobre las conversaciones.
- Transcripcion de discursos parlamentarios y material institucional: VoxPopuli con acentos diversos, con WER de 16,28 en int8, mejorando el 18,95 del modelo original.
- Procesamiento por lotes en servidores con GPU: el build fp16 (1,26 GB) permite mayor throughput en hardware con GPU manteniendo precision similar o superior al int8.
- Integracion en pipelines de sherpa-onnx ya existentes: al mantener el layout, metadatos y tokenizer de los exports publicados de Parakeet v2, se puede sustituir el modelo sin cambios de codigo.

## Benchmarks y rendimiento

WER (%) tras el normalizador de ingles de Whisper. Los modelos Parakeet se decodificaron con sherpa-onnx 1.13.8 en CPU. La negrita marca resultados int8 cuyo intervalo del 95% frente al int8 original excluye cero. "Stock" es el export int8 publicado del modelo original.

| Conjunto de prueba | Palabras | Stock int8 | Este modelo, int8 | Este modelo, fp16 |
| --- | ---: | ---: | ---: | ---: |
| Dictados reservados del desarrollador (39) | 5.047 | 1,70 | **1,31** | 1,37 |
| Reuniones con microfono del desarrollador (2) | 15.887 | 4,68 | **4,01** | 3,63 |
| Habla espontanea publica (People's Speech y Common Voice Spontaneous, 187 clips) | 5.282 | 8,56 | **7,54** | 7,76 |
| VoxPopuli con acento ingles (400 clips) | 10.675 | 18,95 | **16,28** | 17,12 |
| AMI reuniones, microfonos de diadema (test) | 15.754 | 8,81 | **7,72** | 7,51 |
| NOTSOFAR-1 reuniones, close-talk (dev set 1) | 46.212 | 8,60 | **6,88** | 6,75 |
| LibriSpeech test-other | 52.882 | 3,27 | 3,27 | 3,20 |
| Charlas TED (12) | 1.233 | 3,97 | 3,89 | 3,89 |
| Llamadas Earnings-22 (30 extractos) | 1.039 | 20,60 | 20,02 | 19,25 |

Comparativa frente a Qwen3-ASR 1.7B (WER %; * = el intervalo del 95% de la diferencia int8 − Qwen Q8 excluye cero):

| Conjunto de prueba | Este modelo, int8 | Este modelo, fp16 | Qwen3-ASR 1.7B Q8 | Qwen3-ASR 1.7B Q4_K_M |
| --- | ---: | ---: | ---: | ---: |
| Dictados del desarrollador | 1,31 | 1,37 | 1,70 | 1,84 |
| Reuniones con microfono del desarrollador | 4,01* | 3,63 | 3,15 | 3,63 |
| Habla espontanea publica | 7,54 | 7,76 | 7,16 | 7,06 |
| Charlas TED | 3,89* | 3,89 | 2,60 | 2,51 |
| VoxPopuli con acento ingles | 16,28* | 17,12 | 18,43 | 18,22 |

Nota: AMI, NOTSOFAR-1 y VoxPopuli tienen particiones de entrenamiento en la mezcla (con hablantes de test reservados), por lo que parte de la mejora es en dominio. People's Speech, Common Voice, TED, Earnings-22 y LibriSpeech estan fuera de dominio.

## Requisitos de hardware

- VRAM estimada: el build int8 ocupa 661 MB en disco y esta pensado para CPU; el build fp16 ocupa 1,26 GB y esta pensado para GPU, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM libre.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer (por ejemplo, RTX 3060 o superiores) puede ejecutar el build fp16, y el int8 funciona en CPU sin GPU.
- Cabe en GPU consumer: si, el build fp16 de 1,26 GB es apto para GPUs consumer.
- Opciones de despliegue: sherpa-onnx 1.13.8 o superior con `model_type="nemo_transducer"`; tambien es posible usar directamente los ficheros ONNX con ONNX Runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER en dictado (referencia) | Licencia | Formato |
| --- | --- | --- | --- | --- | --- |
| SonoJot Parakeet v1 (este) | 0,6B | Ingles | 1,31 (int8) / 1,37 (fp16) | CC BY 4.0 | ONNX (sherpa-onnx) |
| NVIDIA Parakeet TDT 0.6B v2 (stock int8) | 0,6B | Ingles | 1,70 | CC BY 4.0 | ONNX (sherpa-onnx) |
| Qwen3-ASR 1.7B (Q8) | 1,7B | Multilingue | 1,70 | Apache-2.0 | GGUF |

En los conjuntos evaluados, este modelo supera al stock int8 en dictado, reuniones, habla espontanea, VoxPopuli y AMI/NOTSOFAR-1, empata en LibriSpeech test-other y mejora ligeramente en TED y Earnings-22. Frente a Qwen3-ASR 1.7B Q8, es mejor en dictado y en VoxPopuli con acento, pero peor en reuniones con microfono del desarrollador, habla espontanea publica y TED talks; ademas, Qwen3-ASR es multilingue y este modelo no.

## Limitaciones y advertencias

- Solo reconoce ingles; no admite otros idiomas.
- Parte de las mejoras en AMI, NOTSOFAR-1 y VoxPopuli pueden deberse a que esas fuentes tienen particiones de entrenamiento en la mezcla (aunque con hablantes de test reservados), por lo que la mejora fuera de dominio puede ser menor.
- El entrenamiento incluye unas 14 horas de grabaciones propias del desarrollador (aproximadamente el 1,1% del audio), lo que puede introducir un sesgo hacia las caracteristicas acusticas de ese entorno; esas grabaciones no se distribuyen.
- Riesgo de alucinacion: no documentado en la informacion disponible; como todo modelo ASR, puede producir transcripciones erroneas en audio ruidoso o con acentos no representados.
- Sesgos conocidos: no documentados en la informacion disponible.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es necesario conservar el aviso de licencia y la atribucion a NVIDIA como autor del modelo original y a SonoJot por la modificacion. NVIDIA no respalda esta modificacion.
- Requiere sherpa-onnx 1.13.8 o superior; versiones anteriores pueden no cargar el modelo.
- El modelo no incluye capacidades de puntuacion o diarizacion propias mas alla de lo que produzca el decodificador transducer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SonoJot/sonojot-parakeet-v1
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Aplicacion SonoJot: https://sonojot.com
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Export int8 de referencia: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8
- Export fp16 de referencia: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-fp16
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
