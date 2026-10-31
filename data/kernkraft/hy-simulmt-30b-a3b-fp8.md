# kernkraft/Hy-SimulMT-30B-A3B-FP8

## Resumen

Hy-SimulMT es un modelo de traducción simultánea en tiempo real desarrollado por Tencent Hunyuan, diseñado para traducir de forma bidireccional entre chino e inglés mientras el hablante sigue hablando. A diferencia de los sistemas de traducción por lotes, el modelo procesa un flujo continuo de audio entrante y genera tanto texto traducido como voz, incorporando clonación de voz en tiempo real para preservar las características vocales del hablante original. La variante publicada bajo el identificador kernkraft/Hy-SimulMT-30B-A3B-FP8 es una versión cuantizada en FP8 con aproximadamente 30.400 millones de parámetros totales y arquitectura hy_v3, compatible con la librería transformers de Hugging Face.

El problema que aborda es el equilibrio entre latencia y calidad en traducción simultánea: esperar más contexto mejora la fidelidad pero retrasa la información que recibe el oyente, mientras que traducir demasiado pronto degrada la calidad. Hy-SimulMT está optimizado para minimizar ese compromiso, y en el benchmark público RealSI de audio de larga duración consigue un StreamLAAL de aproximadamente 3 segundos, la latencia más baja entre los sistemas comparados, manteniendo una puntuación GEMBA superior a la de los modelos open source rivales y a cuatro de las cinco APIs comerciales evaluadas.

Su relevancia actual radica en que es uno de los primeros sistemas de traducción simultánea speech-to-speech de código abierto (licencia Apache 2.0) que publica resultados comparables a APIs comerciales, acompañado de herramientas de inferencia (SimulInfer) y entrenamiento (SimulTrain). Está orientado a escenarios en directo como reuniones, conferencias y entrevistas, y puede probarse en la aplicación Hy Translate para Android e iOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hy_v3 (arquitectura propia de Tencent Hunyuan, basada en transformers) |
| Parametros totales | 30.394.794.496 (aprox. 30,4 B) |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere arquitectura MoE con ~3 B de parametros activos, pero no esta confirmado en la documentacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (variante publicada); no disponible informacion sobre otras cuantizaciones |
| Idiomas soportados | 36 idiomas listados en la model card (zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug); la capacidad de traduccion simultanea anunciada es bidireccional chino-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), tamano del repositorio 32,2 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura hy_v3 de Tencent Hunyuan, implementada sobre la libreria transformers. La denominacion "30B-A3B" sugiere una estructura de mezcla de expertos (MoE) con unos 30.400 millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que reduciria significativamente el coste computacional por inferencia, aunque la model card no confirma explicitamente esta configuracion. El pipeline es de traduccion (text-generation en transformers) y el sistema completo integra entrada de audio en streaming, generacion de texto traducido y sintesis de voz con clonacion vocal; la salida de voz y la clonacion requieren un servicio TTS externo configurado.

Sobre los datos y el procedimiento de entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del corpus ni el uso de tecnicas de alineamiento como RLHF o DPO. El proyecto si publica herramientas oficiales de entrenamiento (SimulTrain) en su repositorio de GitHub, lo que permite a terceros ajustar el modelo, y un servicio de inferencia (SimulInfer) optimizado para el regimen de streaming. La evaluacion se realizo combinando benchmarks publicos, audio real y comparaciones con interpretes profesionales simultaneos.

## Capacidades

- Traduccion simultanea speech-to-speech bidireccional entre chino e ingles, procesando audio en streaming mientras el hablante sigue hablando.
- Generacion de texto traducido y de voz traducida (esta ultima requiere un servicio TTS configurado).
- Clonacion de voz en tiempo real: preserva las caracteristicas vocales del hablante original en la salida traducida.
- Baja latencia en regimen de streaming: StreamLAAL de aproximadamente 3 segundos en audio de larga duracion.
- Comprension incremental del discurso: optimizado para decidir cuando emitir la traduccion equilibrando calidad y retraso.
- Listado de 36 idiomas en la model card (incluido el espanol), aunque la capacidad de traduccion simultanea anunciada se limita al par chino-ingles; el alcance real de los demas idiomas no esta documentado.
- Ajuste fino por terceros mediante las herramientas SimulTrain del repositorio oficial.

## Casos de uso

- Interpretacion simultanea en reuniones internacionales: el modelo traduce en directo discursos largos de chino a ingles y viceversa con unos 3 segundos de retraso, permitiendo que los asistentes sigan la conversacion casi en tiempo real.
- Conferencias y ponencias en streaming: gracias a su rendimiento en audio de larga duracion (benchmark RealSI long-form), es adecuado para traducir charlas completas sin cortes ni segmentacion manual.
- Entrevistas y emisiones en directo: la clonacion de voz en tiempo real permite que la traduccion conserve el timbre del hablante, util en radio, television o podcasts bilingues.
- Aplicaciones moviles de traduccion conversacional: puede integrarse en apps (como la propia Hy Translate) para comunicacion cara a cara entre hablantes de chino e ingles.
- Subtitulado y traduccion en vivo de eventos: el servicio SimulInfer puede desplegarse como backend para generar subtitulos y audio traducido de retransmisiones.
- Investigacion en traduccion simultanea: la disponibilidad de SimulTrain y la licencia Apache 2.0 permiten reproducir, evaluar y extender el sistema en entornos academicos.
- Accesibilidad en organizaciones multilingues: integracion en plataformas de videoconferencia para reducir la dependencia de interpretes humanos en reuniones rutinarias chino-ingles.

## Benchmarks y rendimiento

Benchmark RealSI de audio de larga duracion: Hy-SimulMT alcanza un StreamLAAL de aproximadamente 3 segundos (el mas bajo entre los sistemas comparados; menor es mejor) y una puntuacion GEMBA superior a la de los modelos open source comparados y a cuatro de las cinco APIs comerciales evaluadas. Los valores exactos de GEMBA no se detallan en la informacion disponible.

Resultados en cuatro benchmarks publicos de audio corto (puntuaciones mas altas son mejores):

| API / Modelo | FLEURS | CoVoST2 | ACL6060 | RealSI-Sentence |
| --- | ---: | ---: | ---: | ---: |
| Qwen3.8-LiveTranslate | 88,4 | **82,1** | 80,5 | 84,4 |
| **Hy-SimulMT** | **90,3** | 75,5 | **81,2** | **84,7** |
| Gemini3.5-LiveTranslate | 92,4 | 74,4 | 82,6 | 82,2 |
| Confucius4 R2T2 → T3PO | 89,4 | 76,8 | 76,1 | 77,7 |
| Seed-LiveInterpret2.0 | 85,8 | 67,7 | 74,8 | 80,0 |
| SimulS2ST-Omni | 78,6 | 66,6 | 73,1 | 77,4 |
| GPT-Realtime-Translate | 77,7 | 50,8 | 76,4 | 76,7 |
| XunFei-Simult-Interpretation | 73,4 | 57,0 | 57,5 | 70,9 |
| SeamlessStreaming | 72,8 | 60,9 | 49,8 | 56,9 |

Hy-SimulMT lidera en FLEURS, ACL6060 y RealSI-Sentence, mientras que Qwen3.8-LiveTranslate obtiene la mejor puntuacion en CoVoST2. No se han publicado resultados de benchmarks de texto general (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30.400 millones de parametros en FP8, el peso del modelo ocupa unos 32,2 GB, por lo que se estima un minimo de aproximadamente 40 GB de VRAM solo para los pesos, mas la memoria adicional para KV cache, audio y el servicio TTS. No hay cifras oficiales publicadas.
- GPU recomendadas: no disponible oficialmente; por capacidad de memoria serian adecuadas A100 80 GB, H100 80 GB o configuraciones multi-GPU. El uso en consumer GPUs (RTX 4090 con 24 GB) no parece viable con esta variante FP8 completa.
- Cabe en consumer GPU: no disponible; con la informacion actual, la variante FP8 de 30 B excede la VRAM de las GPUs de consumo mas habituales.
- Opciones de despliegue: el proyecto oficial proporciona el servicio de inferencia SimulInfer (via GitHub). Los pesos son compatibles con transformers y safetensors con endpoints compatibles segun Hugging Face; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI. La salida de voz requiere un servicio TTS externo configurado.
- Latencia y throughput: en regimen de streaming, la latencia de traduccion medida (StreamLAAL) es de aproximadamente 3 segundos en audio de larga duracion; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Latencia streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-SimulMT | ~30,4 B totales (FP8) | Traduccion simultanea zh↔en speech-to-speech con clonacion de voz | StreamLAAL ~3 s (RealSI long-form) | Apache 2.0 | Pesos abiertos en Hugging Face y ModelScope; SimulInfer y SimulTrain en GitHub |
| Qwen3.8-LiveTranslate | no disponible | Traduccion en vivo de audio | no disponible | no disponible | Comparado como modelo de referencia en los benchmarks |
| Seed-LiveInterpret2.0 | no disponible | Interpretacion simultanea | no disponible | no disponible | Sistema comparado; en benchmarks queda por detras de Hy-SimulMT en FLEURS, ACL6060 y RealSI-Sentence |
| SeamlessStreaming (Meta) | no disponible | Traduccion simultanea en streaming | no disponible | no disponible | Open source; obtiene puntuaciones claramente inferiores en los cuatro benchmarks cortos evaluados |

Entre los sistemas comparados en los benchmarks oficiales, Hy-SimulMT destaca por combinar la latencia mas baja con calidad competitiva, siendo ademas uno de los pocos con pesos abiertos bajo licencia permisiva. Para modelos de traduccion simultanea de tamano y enfoque equivalentes, no hay mas datos comparativos disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La capacidad de traduccion simultanea anunciada es bidireccional solo entre chino e ingles; aunque la model card lista 36 idiomas, el alcance real de soporte para los demas idiomas (incluido el espanol) no esta documentado y probablemente se limita a capacidades del modelo base.
- La salida de voz y la clonacion de voz en tiempo real dependen de un servicio TTS externo que debe configurarse por separado; el modelo por si solo no cubre el pipeline completo speech-to-speech.
- No se publica informacion sobre sesgos del modelo, tasas de alucinacion ni evaluaciones de seguridad; al tratarse de un sistema de traduccion en streaming, los errores de comprension incremental pueden propagarse a la salida sin posibilidad de revision.
- La variante FP8 de ~30 B requiere hardware de servidor (del orden de 40 GB de VRAM o mas), lo que limita su despliegue local en estaciones de trabajo convencionales.
- La licencia Apache 2.0 permite uso comercial, pero las marcas, el logo y la aplicacion Hy Translate pueden estar sujetos a terminos propios de Tencent no cubiertos por la licencia del modelo.
- El repositorio tiene muy poca traccion publica (29 descargas y 1 like en el momento de la ficha), por lo que el soporte comunitario y la deteccion de problemas en produccion seran limitados; conviene apoyarse en los canales oficiales de Tencent Hunyuan en GitHub.
- No hay documentacion publica sobre longitud de contexto, requisitos exactos de memoria ni throughput, lo que dificulta el dimensionamiento de infraestructura antes de pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kernkraft/Hy-SimulMT-30B-A3B-FP8
- Coleccion en Hugging Face (Tencent Hy-SimulMT): https://huggingface.co/collections/tencent/hy-simulmt
- Coleccion en ModelScope: https://www.modelscope.cn/collections/Tencent-Hunyuan/Hy-SimulMT
- Repositorio de GitHub (SimulInfer y SimulTrain): https://github.com/Tencent-Hunyuan/Hy-SimulMT
- Aplicacion Hy Translate (Android e iOS): enlaces de descarga mediante codigo QR en la model card; no disponible URL directa
