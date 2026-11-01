# huwenjie333/parakeet-tdt-0.6b-v3-ft-af51-cap900-1031

## Resumen

parakeet-tdt-0.6b-v3-ft-af51-cap900-1031 es un modelo de reconocimiento automatico del habla (ASR) obtenido por fine-tuning de nvidia/parakeet-tdt-0.6b-v3, el modelo Parakeet TDT de NVIDIA. El autor del ajuste es el usuario de HuggingFace huwenjie333, que lo ha entrenado sobre 51 lenguas africanas (mas ingles y frances) mediante el pipeline Sunbird speech-to-text. El resultado es un checkpoint de 0,6 mil millones de parametros orientado a transcripcion multilingue de bajo recurso, un nicho donde la mayoria de los ASR comerciales tienen cobertura escasa.

El modelo conserva la arquitectura de NVIDIA: un encoder Conformer con decodificacion híbrida TDT (Token-and-Duration Transducer) y una cabeza CTC auxiliar. Es un modelo condicionado por prompt de idioma: se le pasa el codigo ISO-639-3 del idioma en el parametro `target_lang` de `transcribe` para obtener el mejor rendimiento, o `"auto"` si se desconoce. El checkpoint publicado corresponde al paso 1476 del entrenamiento, con un WER medio de evaluacion de 0,6898 sobre el conjunto de validacion del pipeline.

Su relevancia es doble: por un lado, amplia la cobertura de Parakeet a decenas de lenguas africanas que rara vez aparecen en modelos ASR abiertos; por otro, es un ejemplo reproducible de fine-tuning con NeMo sobre un modelo base abierto. La licencia CC-BY-4.0 permite uso comercial con atribucion, lo que facilita su integracion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder con decodificacion híbrida TDT + CTC (NeMo) |
| Parametros totales | 0,6 mil millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 51 lenguas africanas + ingles (eng) + frances (fra); lista completa en la model card |
| Licencia | cc-by-4.0 |
| Formato de pesos | NeMo (.nemo); tamano del repo 2,6 GB |

## Arquitectura y entrenamiento

El modelo base nvidia/parakeet-tdt-0.6b-v3 es un ASR de NVIDIA construido sobre un encoder Conformer y una cabeza de decodificacion TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones, lo que acelera la decodificacion frente a un transducer clasico. Incluye ademas una cabeza CTC auxiliar que puede activarse con `model.change_decoding_strategy(decoder_type="ctc")`. El modelo es condicionado por prompt: el idioma se pasa como `target_lang` y el decoder lo utiliza para sesgar la transcripcion.

El fine-tuning se realizo con el pipeline Sunbird speech-to-text (`speech-to-text/parakeet-tdt-tim`, run `parakeet-tdt-0.6b-v3-full-lr0.0001-ep5-af51-1031-e69f`), con learning rate 0,0001 y 5 epocas sobre 51 lenguas africanas. El mejor checkpoint fue `checkpoint-1476`, con `eval_WER_mean = 0,6898`. No se detalla en la informacion disponible el volumen de horas de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos o regularizacion adicionales.

## Capacidades

- Transcripcion de voz a texto en 51 lenguas africanas, mas ingles y frances, con seleccion de idioma via `target_lang`.
- Deteccion automatica de idioma con `target_lang="auto"` (comportamiento por defecto).
- Decodificacion TDT por defecto y decodificacion CTC alternativa mediante cambio de estrategia.
- Procesamiento de audio a 16 kHz mono; en NeMo 3.0 la API de `transcribe` sobre rutas de fichero lee el idioma de un campo del manifest en lugar de `target_lang`.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en lenguas africanas de bajo recurso: el modelo permite generar actas o subtitulos en idiomas como luganda, swahili, yoruba o amharico, donde los ASR comerciales suelen fallar o no estar disponibles.
- Subtitulado automatico de contenido audiovisual local: integrable en pipelines que reciben audio a 16 kHz mono y emiten texto alineado, con seleccion explicita del idioma por pista.
- Archivado y busqueda de fondos de audio etnograficos o de radiodifusion: transcripcion masiva de grabaciones historicas para indexacion y recuperacion por texto.
- Atencion al cliente en centros de contacto multilingues africanos: transcripcion de llamadas para analitica, control de calidad y generacion de resumenes posteriores.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones iniciales que luego se corrigen manualmente, reduciendo el coste de anotacion en lenguas con pocos recursos.
- Accesibilidad: subtitulado en tiempo casi real de eventos o clases impartidas en lenguas africanas, con despliegue local en servidores propios para evitar enviar audio a terceros.
- Evaluacion comparativa de ASR de bajo recurso: como checkpoint de referencia para medir mejoras de otros fine-tunings sobre Parakeet.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| eval_WER_mean (checkpoint-1476) | 0,6898 |

No se han publicado en la informacion disponible resultados desglosados por idioma ni comparaciones con otros modelos. El WER medio de 0,6898 es elevado en terminos absolutos y debe interpretarse con cautela: es un promedio sobre 51 lenguas con recursos muy dispares y sobre el conjunto de evaluacion del pipeline de entrenamiento, no sobre un benchmark estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 0,6 mil millones de parametros, la inferencia en fp32 requiere del orden de 2,4 GB solo para pesos, mas overhead de activaciones y decodificacion.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 6-8 GB de VRAM deberia poder ejecutar el modelo en fp32, y GPUs de datacenter (A100, H100) para procesamiento por lotes de alto throughput.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas tipo RTX 3060/4060 o superiores; no confirmado por el autor.
- Opciones de despliegue: NeMo (`nemo.collections.asr`), que es la via documentada. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-ft-af51-cap900-1031 | 0,6 B | 51 africanas + eng + fra | cc-by-4.0 | Fine-tuning de comunidad; WER medio 0,6898 en validacion |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 0,6 B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo original de NVIDIA; cobertura multilingue sin ajuste africano |
| Whisper large-v3 (OpenAI) | 1,55 B | ~99 idiomas | MIT | Referencia generalista; cobertura africana desigual |
| MMS (Meta) | ~1 B por lengua | Mas de 1000 lenguas | CC-BY-NC 4.0 | Cobertura amplia pero licencia no comercial |

La comparacion con Whisper y MMS es orientativa: no se dispone de resultados de benchmarks de este checkpoint frente a ellos en la informacion proporcionada.

## Limitaciones y advertencias

- WER medio de validacion de 0,6898: el rendimiento es muy variable entre idiomas y probablemente deficiente en varias de las 51 lenguas; no debe asumirse calidad uniforme.
- Modelo de comunidad con 21 descargas y 0 likes: sin validacion independiente ni mantenimiento garantizado.
- Riesgo de alucinacion y de transcripciones incorrectas, especialmente en audio ruidoso, con acentos no representados o en idiomas con pocos datos de entrenamiento.
- El condicionamiento por prompt exige conocer el idioma; con `"auto"` la precision puede degradarse.
- Cambio de API en NeMo 3.0: `transcribe` sobre rutas de fichero ignora `target_lang` y lee el idioma del manifest, lo que puede romper integraciones escritas para versiones anteriores.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; conviene verificar las condiciones del modelo base de NVIDIA y de los datos de entrenamiento del pipeline Sunbird antes de un despliegue en produccion.
- No se documentan sesgos especificos ni evaluaciones de robustez; se recomienda auditar por idioma antes de usarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huwenjie333/parakeet-tdt-0.6b-v3-ft-af51-cap900-1031
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- NeMo (NVIDIA): https://github.com/NVIDIA/NeMo
- Pipeline Sunbird speech-to-text: no disponible como enlace publico en la informacion proporcionada
