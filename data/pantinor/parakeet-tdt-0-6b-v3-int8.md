# pantinor/parakeet-tdt-0.6b-v3-int8

## Resumen

Parakeet TDT 0.6B v3 int8 es un espejo estable del export cuantizado a int8 del modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, publicado por el usuario `pantinor` bajo el paraguas del proyecto Anti-Vocale. No se trata de un modelo nuevo ni de un fine-tune: es una re-publicacion byte a byte de los pesos exportados originalmente por `csukuangfj` para sherpa-onnx, con el objetivo de que las aplicaciones que fijan una version concreta de los ficheros no sufran cambios inesperados en el repositorio upstream.

El modelo subyacente es un sistema ASR de NVIDIA basado en arquitectura TDT (Token-and-Duration Transducer), con aproximadamente 0,6 mil millones de parametros, disenado para transcripcion multilingue en diez idiomas europeos (ingles, italiano, aleman, frances, espanol, portugues, ruso, ucraniano, polaco y neerlandes). La variante int8 reduce el peso del repositorio a 1,3 GB y esta pensada para inferencia en CPU mediante sherpa-onnx, lo que la hace adecuada para despliegues en dispositivos sin GPU.

Su relevancia actual es practica: ofrece un punto de anclaje reproducible para integrar ASR multilingue de calidad en aplicaciones de escritorio o servidor con requisitos modestos de hardware. El autor reporta una verificacion de los bytes el 11 de noviembre de 2026, con un WER de 6,77 en FLEURS ingles usando sherpa-onnx 2.0.1 en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), encoder-decoder tipo transformer |
| Parametros totales | aproximadamente 0,6 mil millones (segun nombre del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (export stock) |
| Idiomas soportados | en, it, de, fr, es, pt, ru, uk, pl, nl |
| Licencia | other (heredada de NVIDIA; consultar terminos del modelo original) |
| Formato de pesos | ONNX (export para sherpa-onnx) |
| Tamano del repositorio | 1,3 GB |
| Entrada | audio (reconocimiento del habla) |
| Salida | texto transcrito |

## Arquitectura y entrenamiento

El modelo original de NVIDIA emplea una arquitectura TDT (Token-and-Duration Transducer), una variante de los transductores RNN-T en la que el decoder predice conjuntamente el token siguiente y su duracion, lo que permite emitir varios tokens por paso y acelera la decodificacion frente a los transductores clasicos. Esta pensado especificamente para ASR, no para generacion de texto general.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de tecnicas de aumento de datos o si hubo etapas de ajuste fino supervisado adicionales. El unico dato tecnico concreto aportado por el autor del espejo es la verificacion de inferencia: decodificacion en CPU con sherpa-onnx 2.0.1 y un WER de 6,77 sobre FLEURS en ingles, identico al de la subida anterior, lo que confirma la integridad del export.

La innovacion relevante en esta publicacion no esta en el modelo sino en el empaquetado: un export int8 listo para sherpa-onnx, con bytes fijados y re-alojados para garantizar reproducibilidad en produccion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en diez idiomas: ingles, italiano, aleman, frances, espanol, portugues, ruso, ucraniano, polaco y neerlandes.
- Transcripcion de audio a texto con decodificacion TDT, que reduce el coste computacional por token emitido.
- Inferencia en CPU gracias al export ONNX int8, sin necesidad de GPU.
- Integracion con el ecosistema sherpa-onnx para despliegue embebido o de escritorio.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de vision, audio generativo ni modo thinking.
- No se documenta deteccion de idioma automatica ni segmentacion de hablantes en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones multilingues: el modelo cubre diez idiomas europeos y puede transcribir audio de reuniones en CPU, lo que permite procesar grabaciones en servidores sin GPU o en equipos de sobremesa.
- Subtitulado de video en produccion: al ejecutarse via sherpa-onnx con pesos int8, se puede integrar en pipelines de generacion de subtitulos para contenido en ingles, espanol, frances, aleman, italiano y otros idiomas soportados, con un WER de referencia de 6,77 en FLEURS ingles.
- Dictado por voz en aplicaciones de escritorio: el proyecto Anti-Vocale lo usa como motor ASR; su tamano de 1,3 GB y su inferencia en CPU lo hacen viable para integrarse en aplicaciones de escritorio con dictado offline.
- Transcripcion de notas de voz en aplicaciones moviles o embebidas: el export ONNX int8 permite desplegar el modelo en dispositivos con recursos limitados mediante sherpa-onnx.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de archivos de audio en servidores modestos para generar indices de texto buscables, aprovechando el bajo coste de la decodificacion TDT.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos donde no hay conectividad o no se quiere enviar audio a la nube.
- Procesamiento de audio en idiomas menos cubiertos: el soporte de ucraniano, polaco y neerlandes amplia la cobertura frente a modelos ASR centrados solo en ingles.

## Benchmarks y rendimiento

| Benchmark | Idioma | Resultado | Condiciones |
|---|---|---|---|
| FLEURS | en | 6,77 WER | sherpa-onnx 2.0.1, decodificacion en CPU, verificacion 2026-11-11 |

No se han publicado en la informacion disponible resultados para otros idiomas, otros benchmarks (LibriSpeech, Common Voice, MLS) ni comparativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no aplica en la variante int8 para CPU; el modelo esta pensado para inferencia en CPU. En GPU, el peso int8 de aproximadamente 0,6 B de parametros ocuparia del orden de 0,6-0,8 GB, aunque no se documenta soporte GPU en la informacion disponible.
- GPU recomendadas: no disponible; el autor solo documenta decodificacion en CPU con sherpa-onnx.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: sherpa-onnx (documentado y verificado por el autor). Otros runtimes ONNX no estan confirmados.
- Latencia y throughput: no disponibles; el unico dato de rendimiento es el WER de FLEURS en ingles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pantinor/parakeet-tdt-0.6b-v3-int8 | ~0,6 B | 10 (europeos) | ONNX int8 | other | Espejo estable, verificado en CPU |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | 10 (europeos) | pesos originales NeMo | other (NVIDIA) | Modelo upstream, requiere NeMo |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | ~0,6 B | 10 (europeos) | ONNX int8 | other | Export original para sherpa-onnx |

No se dispone de datos de benchmarks comparativos con otros modelos ASR (Whisper, Wav2Vec2, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia es "other": los terminos exactos dependen del modelo original de NVIDIA; es imprescindible revisar la licencia de `nvidia/parakeet-tdt-0.6b-v3` antes de un uso comercial.
- El modelo es un espejo de terceros, no una publicacion oficial de NVIDIA; la responsabilidad de integridad recae en el re-alojador, aunque el autor documenta una verificacion de bytes.
- Solo cubre diez idiomas; no hay soporte documentado para arabe, chino, japones, coreano, hindi ni otras lenguas fuera de la lista.
- No se documentan sesgos especificos, pero al ser un modelo entrenado por NVIDIA sobre corpus no descritos aqui, pueden existir sesgos de acento, dialecto o dominio no cuantificados.
- Riesgo de alucinacion en ASR: como todo sistema de transcripcion, puede producir sustituciones o inventar palabras en audio con ruido, solapamiento de hablantes o acentos no vistos.
- No hay datos publicados sobre rendimiento en audio de telefono, reuniones multiparte o dominios especializados (medico, legal).
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que reduce la validacion comunitaria disponible.
- No se documenta soporte GPU ni latencias, lo que limita la planificacion de capacidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pantinor/parakeet-tdt-0.6b-v3-int8
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export original para sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Aplicacion Anti-Vocale: https://github.com/RisorseArtificiali/anti-vocale
