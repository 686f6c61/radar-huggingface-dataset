# myflow-ai/parakeet-primeline-gguf

## Resumen

parakeet-primeline-gguf es la conversión a formato GGUF del modelo primeline/parakeet-primeline, un sistema de reconocimiento automático del habla (ASR) de 627.052.166 parámetros desarrollado por primeLine como ajuste fino en alemán de nvidia/parakeet-tdt-0.6b-v3. La conversión la publica el usuario myflow-ai y está pensada para ejecutarse con transcribe.cpp, un runtime C++ basado en ggml. El modelo toma audio WAV mono a 16 kHz y devuelve transcripciones con puntuación, mayúsculas y marcas de tiempo a nivel de token.

La arquitectura combina un codificador FastConformer con un decodificador transducer TDT (Token-and-Duration Transducer) derivado de RNNT. El resultado es un modelo de 0,6B parámetros que cabe en menos de 500 MB en cuantización Q4_K_M, manteniendo un WER en alemán de FLEURS de entre el 5,96 % y el 6,00 % prácticamente idéntico en todas las cuantizaciones publicadas. Esa estabilidad del WER entre F32 y Q4_K_M es el dato más relevante para despliegue en producción, porque permite usar la variante más pequeña sin penalización medible.

El interés actual del modelo reside en dos factores: por un lado, cubre 25 idiomas europeos (incluido el español) con un tamaño muy reducido; por otro, su naturaleza GGUF permite inferencia en CPU y en GPU de consumo sin depender de un stack Python pesado. El propio autor documenta velocidades de 28x y 151x respecto al tiempo real en un Apple M4 Max (CPU y Metal respectivamente), y de 7,5x y 12,5x en un Ryzen 4750U (CPU y Vulkan). Limitaciones declaradas: no soporta streaming ni traducción, aunque sí detección de idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador FastConformer + decodificador transducer TDT/RNNT |
| Parametros totales | 627.052.166 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio no especificada; soporta audios de varias horas mediante atención local (dato del autor del modelo base) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: de, bg, hr, cs, da, nl, en, et, fi, fr, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | cc-by-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF (runtime transcribe.cpp) |
| Entrada | WAV mono a 16 kHz |
| Salida | Texto con puntuacion, mayusculas y timestamps a nivel de token |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | si |
| Modelo base | primeline/parakeet-primeline (a su vez fine-tune de nvidia/parakeet-tdt-0.6b-v3) |
| Commit del modelo base | 3f1a9bc (fijado el 2026-08-16) |
| Validacion | transcribe.cpp commit 856d7c1, contrastado con la referencia NeMo |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo es un transducer de tipo TDT sobre un codificador FastConformer. FastConformer es una variante del Conformer con atención por bloques y submuestreo agresivo de la secuencia de entrada, lo que reduce el coste computacional del codificador manteniendo el modelado global del contexto acústico mediante atención local. El decodificador TDT predice simultáneamente el token y su duración, lo que acelera el proceso de decodificación frente a un RNNT estándar. Según la model card del modelo base, esta combinación ofrece un throughput notablemente superior al de los transducers convencionales.

Se trata de un ajuste fino solo de pesos (weights-only) sobre nvidia/parakeet-tdt-0.6b-v3: la configuración de codificador, decodificador, red conjunta y preprocesador es idéntica al modelo base, por lo que el rendimiento en velocidad no cambia respecto a esa variante. El objetivo del ajuste es mejorar la precisión en alemán. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; el modelo base es un sistema ASR entrenado de forma supervisada con datos de voz, y el ajuste de primeLine se orienta a dominios y acentos alemanes.

Una particularidad documentada por el autor de la conversión afecta a la ortografía: el checkpoint escribe casi siempre la forma suiza "ss" (grosse, heisst) en lugar de "ß", que aparece solo 5 veces en las 862 hipótesis de FLEURS de test. El vocabulario SentencePiece de origen contiene 4 piezas con "ß" frente a 58 con "ss", por lo que se trata de una propiedad del tokenizador de la familia v3 y no del port; la referencia NeMo produce las mismas grafías. Como las referencias de FLEURS usan "ß", esto cuesta aproximadamente 1,05 puntos porcentuales de WER: normalizando "ß"→"ss" en ambos lados, la referencia baja a 4,92 % y la conversión F32 a 4,94 %.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos, con optimización específica para alemán.
- Puntuación y capitalización automáticas en la salida, sin postprocesado externo.
- Marcas de tiempo a nivel de token, útiles para subtitulado y alineación.
- Detección de idioma integrada (lang_detect: true).
- Manejo de audios largos, de hasta varias horas, gracias a los mecanismos de atención local del codificador FastConformer (según la model card del modelo base).
- Robustez declarada por el autor en distintos dominios: habla leída limpia y conversación espontánea.
- No soporta streaming: la decodificación es por fichero completo.
- No soporta traducción: transcribe en el idioma original, no traduce a otro idioma.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente; es un modelo puramente acústico, sin interfaz de texto conversacional.

## Casos de uso

- Transcripción de reuniones y actas en alemán: el modelo está ajustado específicamente para alemán y aplica puntuación y mayúsculas, de modo que la salida es directamente legible sin limpieza posterior. La decodificación por fichero completo resulta adecuada para grabar y procesar al terminar la reunión.
- Subtitulado automático: los timestamps a nivel de token permiten generar ficheros de subtítulos alineados con el audio, lo que evita tener que recurrir a un modelo de alineación forzada adicional.
- Indexación y búsqueda sobre archivos de audio: al transcribir con marcas de tiempo, se puede construir un índice de texto completo sobre horas de grabaciones y localizar el minuto exacto de una mención, algo útil en archivos de podcasts, radios o grabaciones de atención telefónica.
- Despliegue en el borde o en local sin GPU: con la cuantización Q4_K_M (485 MB) el modelo se ejecuta en CPU. Los datos publicados muestran 7,5x tiempo real en un Ryzen 4750U y 28x en un Apple M4 Max, lo suficiente para transcripción por lotes en un portátil o en un servidor sin acelerador.
- Cumplimiento de privacidad y residencia de datos: al ser un binario C++ local con pesos de menos de 1 GB, permite transcribir audio sensible sin enviarlo a una API externa, algo relevante para sectores sanitario, legal o administración pública.
- Preprocesado de corpus de voz multilingüe: la cobertura de 25 idiomas europeos y la detección de idioma automática permiten procesar lotes heterogéneos etiquetando cada segmento con su lengua sin un clasificador aparte.
- Integración en pipelines de transcripción de bajo coste: el formato GGUF y el runtime transcribe.cpp simplifican el empaquetado en contenedores pequeños, en contraste con stacks Python que requieren NeMo y PyTorch completos.

## Benchmarks y rendimiento

El autor publica WER sobre el split de test alemán de FLEURS (862 enunciados), con decodificación transducer greedy y sin modelo de lenguaje externo.

| Cuantizacion | Tamano | WER FLEURS de |
|---|---:|---:|
| F32 | 2,51 GB | 6,00 % |
| F16 | 1,26 GB | 6,00 % |
| Q8_0 | 740 MB | 6,00 % |
| Q6_K | 610 MB | 5,96 % |
| Q5_K_M | 549 MB | 5,99 % |
| Q4_K_M | 485 MB | 5,98 % |

Rendimiento medido en factor de tiempo real (valores publicados tal cual por el autor; cifras altas indican procesamiento más rápido que el tiempo real):

| Equipo | Backend | Valor |
|---|---|---:|
| Apple M4 Max | Metal | 151 |
| Apple M4 Max | CPU | 28 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

La model card del modelo base menciona una tabla comparativa de WER con Tuda-De, Multilingual LibriSpeech y Common Voice 19.0 frente a NVIDIA parakeet-tdt-0.6b-v3 y arquitecturas basadas en Whisper, pero los valores concretos de esa tabla no están disponibles en la información proporcionada. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K, que además no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada según el tamano del fichero, mas el estado del decodificador y del preprocesador (el autor no publica cifras de memoria exactas): Q4_K_M unos 485 MB, Q5_K_M unos 549 MB, Q6_K unos 610 MB, Q8_0 unos 740 MB, F16 unos 1,26 GB, F32 unos 2,51 GB.
- Cabe holgadamente en cualquier GPU de consumo: una RTX 3060 de 12 GB, una RTX 4090 o incluso iGPUs con varios gigabytes de memoria compartida pueden alojar la variante F32 completa.
- Funciona sin GPU: los datos del autor muestran ejecución en CPU a 7,5x tiempo real en un Ryzen 4750U y 28x en un M4 Max, por lo que la transcripción por lotes es viable en CPU.
- Aceleración específica: Metal en Apple Silicon (151x en M4 Max) y Vulkan en GPU AMD (12,5x en Ryzen 4750U con gráfica integrada). No se detallan cifras para CUDA en la información disponible.
- Despliegue: el runtime previsto es transcribe.cpp con la CLI transcribe-cli; el audio debe convertirse previamente a WAV mono de 16 kHz (por ejemplo con ffmpeg). No consta soporte para vLLM, TGI, Ollama o llama.cpp en la información disponible, dado que no son runtimes de ASR transducer.
- Alternativas de ecosistema: existe un port independiente, parakeet.cpp, orientado a Parakeet con detección de actividad de voz y diarización, y al menos otra conversión GGUF del mismo modelo base publicada por el usuario voicetide.
- Latencia y throughput: no se publican cifras absolutas en milisegundos ni en tokens por segundo; solo los factores de tiempo real de la tabla anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---:|---|---|---|---|
| myflow-ai/parakeet-primeline-gguf (este) | 0,6B | GGUF | 25 | cc-by-4.0 | Conversión cuantizada, validada contra la referencia NeMo; WER FLEURS de 5,96-6,00 % |
| primeline/parakeet-primeline | 0,6B | safetensors | 25 | cc-by-4.0 | Modelo original sin cuantizar; requiere NeMo/PyTorch |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | safetensors | Multilingüe europeo (conjunto no detallado) | no disponible en la informacion proporcionada | Modelo base; mismo codificador y decodificador, por lo que la velocidad es idéntica; el ajuste de primeLine mejora el alemán |
| voicetide/parakeet-primeline-gguf | 0,6B | GGUF | 25 | cc-by-4.0 (heredada) | Conversión alternativa del mismo modelo base |
| Arquitecturas basadas en Whisper | no disponible | no disponible | no disponible | no disponible | La model card del modelo base las cita como referencia comparativa, pero no se dispone de cifras concretas |

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo por acento, género, edad o variedad dialectal. El ajuste está orientado a alemán, por lo que el rendimiento en el resto de los 24 idiomas debería validarse antes de usarse en producción.
- Ortografía alemana: el tokenizador de la familia v3 genera formas suizas con "ss" en lugar de "ß"; esto penaliza el WER medido contra FLEURS en aproximadamente 1,05 puntos porcentuales. Si el destino requiere "ß", hay que aplicar una normalización posterior.
- Alucinación: como todo modelo ASR, puede producir texto plausible en tramos con ruido, música o silencio. No hay umbrales de confianza documentados en la información disponible.
- Sin streaming: no es posible usarlo para transcripción en vivo con salida incremental; está diseñado para ficheros completos.
- Sin traducción: solo transcribe en el idioma hablado.
- Preprocesado obligatorio: la entrada debe ser WAV mono a 16 kHz; cualquier otra frecuencia o número de canales requiere conversión previa.
- Idiomas no cubiertos: la lista de 25 lenguas no incluye, por ejemplo, turco, árabe, chino, japonés ni coreano, presentes en modelos ASR multilenguaje más amplios.
- Licencia: CC-BY-4.0 permite uso comercial, pero exige atribución. Al ser una conversión derivada, conviene conservar la atribución tanto a myflow-ai como a primeLine y a NVIDIA.
- Trazabilidad: el autor fija el commit 3f1a9bc del modelo base (2026-08-16) y valida contra transcribe.cpp en el commit 856d7c1. Las tablas de descarga del README apuntan al repositorio handy-computer/parakeet-primeline-gguf, no al repositorio myflow-ai/parakeet-primeline-gguf; conviene verificar el origen real de los ficheros antes de descargarlos.
- Soporte del runtime: el modelo depende del ecosistema transcribe.cpp; no se documenta compatibilidad con otros motores de inferencia, lo que limita las opciones de despliegue estandarizadas.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/myflow-ai/parakeet-primeline-gguf
- Modelo base: https://huggingface.co/primeline/parakeet-primeline
- Commit del modelo base usado para el port: https://huggingface.co/primeline/parakeet-primeline/commit/3f1a9bc
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/856d7c1
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-primeline.md
- Conversion alternativa (voicetide): https://huggingface.co/voicetide/parakeet-primeline-gguf
- Port parakeet.cpp (LocalAI): https://github.com/mudler/parakeet.cpp
- Otro modelo GGUF del mismo autor (variante en ingles): https://huggingface.co/myflow-ai/parakeet-unified-en-0.6b-gguf
