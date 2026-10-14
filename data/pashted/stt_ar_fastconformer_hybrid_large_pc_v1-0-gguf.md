# Pashted/stt_ar_fastconformer_hybrid_large_pc_v1.0-GGUF

## Resumen

Este repositorio contiene una conversion no oficial a formato GGUF del modelo de reconocimiento de voz en arabe `nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0`, publicada por el usuario Pashted. El objetivo no es mejorar el modelo original, sino permitir su ejecucion sin Python ni dependencias de PyTorch mediante [NeMo-Speech.cpp](https://github.com/NVIDIA/NeMo-Speech.cpp), el runtime en C++ de NVIDIA para modelos de voz NeMo. La conversion no reentrena nada: pesos, tokenizer y vocabulario son los del modelo original.

El modelo base es un FastConformer con dos cabezas de decodificacion (Transducer/RNNT y CTC) de aproximadamente 115-120 millones de parametros, entrenado por NVIDIA sobre unas 760 horas de audio en arabe procedente de Massive Arabic Speech Corpus (MASC), Mozilla Common Voice 17.0 y Google FLEURS. Transcribe arabe sin diacriticos, con puntuacion arabe (punto, coma y signo de interrogacion).

Su relevancia practica esta en el empaquetado: un unico fichero GGUF de 146 MB que se ejecuta en CPU o GPU de gama baja (el autor lo probo en una GTX 1650 via Vulkan), con tasas de error de palabra del 4,7 % en FLEURS egipcio y del 8,3 % en audio continuo segmentado. Es, por tanto, una pieza util para integrar ASR en arabe dentro de aplicaciones nativas sin cadena de dependencias Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder Conformer con atencion por bloques de profundidad) + dos decodificadores: Transducer (RNNT) y CTC |
| Parametros totales | 119.778.898 (segun safetensors del modelo base); ~115 M segun la model card original |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; modelo de ASR. La model card recomienda fragmentos de audio de hasta ~25 segundos |
| Tipos de cuantizacion | Q8_0 (capas lineales y convoluciones pointwise), F32 o F16 en el resto de tensores |
| Idiomas soportados | arabe (ar) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (fichero unico `stt_ar_fastconformer_hybrid_large_pc_v1.0.q8_0.gguf`, 146.033.088 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer de NVIDIA: un encoder Conformer con atencion de profundidad por bloques, que reduce el coste computacional frente a un Conformer estandar manteniendo la combinacion de mecanismos de atencion y convolucion. Sobre el encoder monta dos cabezas: un decodificador Transducer (RNNT) y un decodificador CTC. En esta conversion a GGUF se conservan los pesos de ambos, pero el runtime NeMo-Speech.cpp decodifica con la cabeza RNNT (el conversor fijo `asr.head_type = rnnt`). El fichero incluye tambien el tokenizer (SentencePiece) y el banco de filtros mel.

Los datos de entrenamiento originales, segun la model card citada, suman aproximadamente 760 horas de audio en arabe procedente de tres fuentes: Massive Arabic Speech Corpus (MASC), Mozilla Common Voice 17.0 y Google FLEURS. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de ASR. La innovacion de esta publicacion no es arquitectonica, sino de despliegue: conversion con `convert_model.py` de NeMo-Speech.cpp v0.2.0 (commit `6a3ca36`), torch 2.14.1 en CPU, gguf 0.19.0, sentencepiece 0.2.2, librosa 1.0.0 y numpy 2.5.3, con cuantizacion selectiva Q8_0 limitada a las capas lineales y convoluciones pointwise.

## Capacidades

- Reconocimiento automatico de voz (ASR) en arabe a partir de audio WAV mono a 16 kHz.
- Transcripcion con puntuacion arabe: punto, coma arabe y signo de interrogacion arabe.
- Escritura sin diacriticos (sin vocales cortas ni tatweel), lo que simplifica el postprocesado.
- Decodificacion greedy mediante la cabeza Transducer (RNNT) integrada en el fichero.
- Ejecucion sin Python: pensada para el runtime nativo NeMo-Speech.cpp.
- Procesamiento de grabaciones largas mediante segmentacion en pausas (fragmentos de hasta ~25 segundos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni traduccion. Es exclusivamente un modelo de transcripcion.

## Casos de uso

- Transcripcion de reuniones y notas de voz en arabe: el modelo convierte grabaciones de habla egipcia o arabe estandar en texto con puntuacion, en equipos donde no se quiere desplegar PyTorch. Requiere trocear el audio en fragmentos de hasta 25 segundos cortados en pausas.
- Subtitulado de contenido audiovisual en arabe: al transcribir a 16 kHz mono y devolver puntuacion, encaja en un pipeline previo a la generacion de subtitulos; la tasa de error medida en FLEURS (4,7 % en egipcio) es razonable para subtitulos revisables.
- Integracion en aplicaciones de escritorio o moviles nativas: el fichero GGUF de 146 MB y el runtime en C++ permiten ASR embebido sin dependencias de Python, algo relevante para productos con requisitos estrictos de tamano y portabilidad.
- Servicio de transcripcion en servidor sin GPU dedicada: el autor lo ejecuto en una GTX 1650 via Vulkan, lo que indica que una GPU de gama baja o incluso CPU es suficiente para volumenes moderados.
- Preprocesado de datos de voz en arabe para entrenamiento de otros modelos: la salida sin diacriticos y con puntuacion normalizada sirve como etiquetado automatico inicial, siempre con revision humana.
- Indexacion y busqueda sobre archivos de audio en arabe: transcripcion masiva de un corpus de llamadas o grabaciones para hacerlas buscables por texto, asumiendo que la precision en audio telefonico sera inferior a la medida en FLEURS.
- Accesibilidad para hablantes de arabe: dictado y conversion de voz a texto en herramientas de asistencia, aprovechando el bajo coste de recursos del modelo.
- Prototipado rapido de ASR en arabe: al ser un unico fichero GGUF, permite validar una idea en minutos frente al despliegue completo de NeMo o de Whisper.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversion, medidos el 14-15.10.2026 con NeMo-Speech.cpp 0.2.0 sobre una NVIDIA GTX 1650 (Vulkan), decodificacion greedy. La tasa de error de palabra (WER) se calcula tras eliminar puntuacion, vocales cortas y tatweel, unificar la ortografia de hamza en alef, alef maqsura y ta marbuta, y excluir frases con digitos en cualquiera de los dos lados.

| Prueba | Palabras erroneas (WER) | Caracteres erroneos (CER) |
|---|---|---|
| FLEURS test (hablantes egipcios), 230 de 283 frases, cada una completa | 4,7 % | 1,6 % |
| Frases de FLEURS test no usadas arriba, leidas por otras personas, unidas en una grabacion de 26 minutos y entregadas en fragmentos de hasta 25 s cortados en pausas | 8,3 % | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo de ASR, ni cifras de latencia o throughput mas alla del hardware de prueba citado.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 146.033.088 bytes (~139 MiB). Con los tensores en F32/F16 y Q8_0, la inferencia cabe en menos de 1 GB de memoria, tanto en GPU como en RAM.
- GPU recomendadas: cualquier GPU con soporte Vulkan. El autor valido el modelo en una NVIDIA GTX 1650. No se documentan pruebas en A100, H100 ni RTX 4090, aunque por tamano no representan ningun problema.
- Compatibilidad con GPU de consumo: si, es uno de sus puntos fuertes. Cabria en practicamente cualquier GPU de consumo moderna y en bastantes integradas con Vulkan.
- Opciones de despliegue: NeMo-Speech.cpp v0.2.0 o superior, mediante el comando `nemo-speech transcribe audio.wav --model stt_ar_fastconformer_hybrid_large_pc_v1.0.q8_0.gguf`. El formato GGUF de este repositorio es especifico de NeMo-Speech.cpp; no se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI, que no estan pensados para este tipo de arquitectura.
- Latencia y throughput: no disponible. El unico dato de rendimiento publicado es la WER en el hardware de prueba.
- Requisito de entrada: audio WAV mono a 16 kHz; grabaciones largas conviene trocearlas en pausas en fragmentos de hasta unos 25 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pashted/stt_ar_fastconformer_hybrid_large_pc_v1.0-GGUF (este) | 119.778.898 | arabe | audio de hasta ~25 s por fragmento | CC BY 4.0 | GGUF para NeMo-Speech.cpp |
| nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0 (modelo base) | ~115 M | arabe | audio largo con segmentacion | CC BY 4.0 | pesos NeMo (.nemo), requiere Python/PyTorch |
| Otros modelos de ASR en arabe | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de otros desarrolladores no esta disponible en la informacion proporcionada: la busqueda web asociada no devolvio resultados relacionados con reconocimiento de voz, sino contenido no pertinente sobre legumbres, por lo que no se dispone de cifras verificables de Whisper, MMS u otros sistemas para contrastar WER, parametros o licencias.

## Limitaciones y advertencias

- Conversion no oficial: no esta hecha, respaldada ni soportada por NVIDIA. NVIDIA y NeMo son marcas registradas de NVIDIA Corporation.
- El modelo base fue entrenado, entre otros datos, con el split de entrenamiento de FLEURS. Las frases de test son no vistas, pero grabadas de la misma forma, por lo que la precision en otro tipo de habla (llamadas telefonicas, dialectos, audio con ruido) sera previsiblemente inferior a la reportada.
- Solo arabe: no hay soporte multilingue ni traduccion.
- Unica cuantizacion disponible: Q8_0 en capas lineales y convoluciones pointwise, con el resto en F32/F16. No se ofrecen otras variantes de cuantizacion en este repositorio.
- Formato de despliegue restringido: el GGUF esta pensado para NeMo-Speech.cpp, no para los runtimes habituales de LLM. La integracion en stacks basados en llama.cpp, Ollama, vLLM o TGI no esta contemplada.
- Segmentacion manual: los audios largos deben trocearse en pausas (hasta ~25 segundos) para obtener buenos resultados, lo que anade una etapa de preprocesado.
- Salida sin diacriticos y con normalizacion ortografica: util para muchos casos, pero puede no satisfacer requisitos de transcripcion literal o de vocales cortas.
- Riesgo de alucinacion en ASR: aunque no se documenta explicitamente, los modelos Transducer pueden producir texto plausible en segmentos con silencio, ruido o habla solapada. Se recomienda validacion en produccion.
- Sesgos: no se documentan analisis de sesgo por dialecto, genero o acento. El unico punto de referencia es FLEURS egipcio, insuficiente para extrapolar al conjunto del mundo arabofono.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion a NVIDIA por el modelo original y mencion de los cambios realizados en la conversion. No se permite sugerir que NVIDIA respalda esta version.
- Cifras de referencia limitadas: la evaluacion publicada se hizo en una unica GPU (GTX 1650, Vulkan) y con decodificacion greedy; no hay datos de latencia, throughput ni estabilidad en otros entornos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado el 14.10.2026 y actualizado el mismo dia. Conviene verificar el `sha256` del fichero (`5381f0214e645e56184946e381a63da865f359aec81f319abb932ec4da88aabe`) antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/Pashted/stt_ar_fastconformer_hybrid_large_pc_v1.0-GGUF
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Paper o publicacion tecnica de FastConformer: no disponible en la informacion proporcionada
- Demo online: no disponible
- Resultados de busqueda web: no se encontraron enlaces relevantes; los resultados devueltos tratan sobre legumbres (Macrotyloma uniflorum) y no guardan relacion con el modelo.
