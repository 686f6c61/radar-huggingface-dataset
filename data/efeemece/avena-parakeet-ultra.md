# efeemece/avena-parakeet-ultra

## Resumen

`avena-parakeet-ultra` es una conversión al formato GGUF, en cuantización q8_0, del modelo de reconocimiento automático de voz (ASR) `moondream/parakeet-ultra`, que a su vez es un post-entrenamiento de `nvidia/parakeet-tdt-0.6b-v3`. Conserva la misma arquitectura y el mismo tokenizador que el checkpoint de NVIDIA y está empaquetado específicamente para `mudler/parakeet.cpp` (commit `e75de9b`, versión v0.5.0), una implementación en C++ del ecosistema llama.cpp que permite ejecutar ASR sin PyTorch ni NeMo.

El modelo declara 627.090.582 parámetros y una arquitectura TDT (token-and-duration transducer); la cabeza CTC auxiliar del modelo original no forma parte de este checkpoint, que es TDT puro. Se distribuye como un único fichero GGUF de 940.663.680 bytes (0,9 GB), con 701 tensores, de los cuales 219 están cuantizados en q8_0 y el resto permanece en F32. El modelo base es multilingüe y realiza detección automática de idioma; NVIDIA documenta 25 idiomas europeos para la v3.

Su interés práctico es doble: por un lado, ofrece un modelo ASR multilingüe de ~600 M de parámetros en un formato autocontenido que cabe en cualquier GPU de consumo e incluso en CPU; por otro, el autor documenta una validación cruzada de la conversión (blobs byte a byte idénticos a la lógica oficial de escritura de tensores de parakeet.cpp y mapeo inverso HF→NeMo verificado con 0 tensores faltantes o inesperados y diferencia máxima 0). La licencia es CC-BY-4.0 con cadena de atribución a Moondream y NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (token-and-duration transducer), arquitectura `tdt`; sin cabeza CTC auxiliar |
| Parametros totales | 627.090.582 (dato de safetensors); ~600 M en el checkpoint base |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (modelo ASR; no se documenta la duración máxima de audio procesable) |
| Tipos de cuantizacion | q8_0 en GGUF (219 de 701 tensores, segun la allowlist de parakeet.cpp); resto de tensores en F32 |
| Idiomas soportados | Multilingüe con detección automática de idioma; el modelo base cubre 25 idiomas europeos segun NVIDIA |
| Licencia | CC-BY-4.0 (cadena de atribución: Moondream Parakeet Ultra → NVIDIA Parakeet TDT 0.6B v3) |
| Formato de pesos | GGUF (parakeet.cpp); el modelo de origen se publica en safetensors |

## Arquitectura y entrenamiento

La arquitectura es TDT (token-and-duration transducer), variante de la familia transducer/RNN-T en la que la red conjunta predice simultáneamente el token y su duración. Esto reduce el número de pasos de decodificación respecto a un decodificador puramente autorregresivo y es la razón por la que este tipo de modelos se emplea en escenarios de alto rendimiento. En este checkpoint concreto, la arquitectura declarada es `tdt` puro: la cabeza CTC auxiliar que acompaña al modelo original no está incluida.

El checkpoint procede del post-entrenamiento que Moondream realizó sobre `nvidia/parakeet-tdt-0.6b-v3`, manteniendo arquitectura y tokenizador, y del que la model card afirma que obtiene mejor WER en todos los grupos de benchmarks evaluados por Moondream (afirmación cualitativa: no se aportan cifras en la información disponible). El preprocesado usa `parakeet.preprocessor.preemph = 0.97`, el valor por defecto del `AudioToMelSpectrogramPreprocessor` de NeMo para esta familia de checkpoints y el que usa `ParakeetFeatureExtractor` de transformers; los buffers del featurizer (`fb`, `window`) y los metadatos se tomaron del fichero `.nemo` de la v3, al ser deterministas y no entrenables. Se excluyen los tensores `vad_head.*` (~213K parámetros), correspondientes a una cabeza de detección de actividad de voz interna que parakeet.cpp no lee. No hay información disponible sobre volumen de datos de entrenamiento, composición del dataset ni sobre etapas de RLHF o DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe con detección automática del idioma de entrada.
- Transcripción de audio a texto en un único paso de decodificación transducer, sin bucle autoregresivo.
- Generación de marcas de tiempo mediante la opción `--timestamps` de `parakeet-cli`.
- Salida estructurada en JSON mediante la opción `--json`, apta para encadenar con otros procesos.
- Ejecución local sin dependencias de Python, PyTorch o NeMo gracias a parakeet.cpp.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades de visión, audio generativo ni modo de razonamiento explícito.
- El número exacto de idiomas soportados por este checkpoint no se detalla en la información disponible; se hereda del base (25 idiomas europeos según NVIDIA).

## Casos de uso

- Transcripción local de reuniones: el modelo convierte audio de voz en texto íntegramente en la máquina del usuario, sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Subtitulado automático: la CLI permite generar marcas de tiempo junto con la transcripción, de modo que la salida se puede convertir directamente en ficheros de subtítulos.
- Análisis de llamadas de atención al cliente: transcripción por lotes de grabaciones para su posterior clasificación, búsqueda o extracción de métricas, apoyándose en la detección automática de idioma cuando el volumen incluye varias lenguas.
- Archivado y búsqueda de contenido audiovisual: indexación de audio ya grabado para permitir búsquedas por texto sobre podcasts, clases o archivos de vídeo.
- Generación de datasets de voz para entrenamiento: producción de transcripciones a escala para construir corpus de habla, gracias al carácter determinista del featurizer y al formato JSON de salida.
- Accesibilidad y dictado: integración en aplicaciones de escritorio que necesitan transcripción continua o dictado con un consumo de memoria en torno a 1 GB.
- Despliegue en edge o on-premise: el fichero GGUF de 0,9 GB y la ausencia de dependencias pesadas permiten ejecutarlo en servidores modestos, contenedores pequeños o equipos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base afirma mejoras de WER en todos los grupos de benchmarks respecto a la v3, pero no se aportan cifras concretas (ni WER, ni latencia, ni throughput) para este artefacto GGUF.

## Requisitos de hardware

- Tamaño del artefacto: 940.663.680 bytes (aproximadamente 0,88 GiB) para el fichero GGUF q8_0, más los tensores que permanecen en F32 y los buffers del featurizer.
- VRAM estimada para inferencia: del orden de 1 a 1,5 GB, incluyendo pesos y buffers de preprocesado (estimación a partir del tamaño del fichero; no confirmada por el autor).
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y prácticamente cualquier GPU con más de 2 GB de memoria.
- Ejecución viable en CPU sin GPU, dado el tamaño del modelo y que parakeet.cpp está pensado para ese escenario.
- Opciones de despliegue: `parakeet.cpp` con su `parakeet-cli` (formato nativo de este artefacto); para el modelo original, las rutas de transformers y NeMo.
- Latencia y throughput: no disponibles. NVIDIA describe la v3 como un modelo de alto rendimiento para transcripción, pero no se han publicado cifras en la información disponible, y menos aún para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| efeemece/avena-parakeet-ultra | 627.090.582 | Multilingüe (base: 25 idiomas europeos) | GGUF q8_0 | CC-BY-4.0 | Conversión para parakeet.cpp; 0 descargas, 1 like en el momento de la consulta |
| moondream/parakeet-ultra | ~600 M | Multilingüe | safetensors | CC-BY-4.0 | Post-entrenamiento de la v3; mejor WER en todos los grupos segun su model card (sin cifras) |
| nvidia/parakeet-tdt-0.6b-v3 | ~600 M | 25 idiomas europeos con detección automática | `.nemo` / safetensors / GGUF | CC-BY-4.0 | Checkpoint oficial de NVIDIA; el autor de esta conversión verificó el mapeo inverso contra él |

No se dispone en la información proporcionada de datos de rendimiento (WER, latencia) que permitan comparar numéricamente este modelo con alternativas de otras familias, como los modelos Whisper de OpenAI.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no sigue instrucciones y no puede usarse para tareas distintas del reconocimiento de voz.
- No se han publicado cifras de WER, latencia ni throughput para este artefacto, por lo que no es posible cuantificar el impacto de la cuantización q8_0 frente al checkpoint en F32 o safetensors.
- La cuantización q8_0 afecta a 219 tensores (proyecciones de atención y FFN del encoder, proyección de salida del subsampling y red conjunta enc/pred); el resto se mantiene en F32.
- El valor de `preemph` es un punto sensible: algunas conversiones de terceros usan 0.0, mientras que este artefacto usa 0.97. En audio limpio la diferencia es pequeña, pero en audio real o con ruido el autor espera que sea mayor.
- Riesgo de alucinación propio de los sistemas ASR (sustituciones, omisiones y repeticiones), sin tasas documentadas en la información disponible.
- La cobertura de idiomas se hereda del modelo base y no se detalla idioma por idioma para este checkpoint; el rendimiento fuera de los 25 idiomas europeos del base no está documentado.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución; la cadena de atribución indicada es Moondream Parakeet Ultra → NVIDIA Parakeet TDT 0.6B v3.
- Artefacto con adopción nula verificable en el momento de la consulta (0 descargas, 1 like) y sin validación por terceros independientes del autor.
- El enlace al repositorio "avena" que contiene la herramienta de conversión aparece truncado en la model card (`https://github.com/`), por lo que no se puede verificar dicha herramienta.
- Se excluyen los tensores `vad_head.*` (~213K parámetros); si un flujo de trabajo esperase detección de actividad de voz integrada, no estará disponible en este artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/efeemece/avena-parakeet-ultra
- Modelo base (post-entrenamiento): https://huggingface.co/moondream/parakeet-ultra
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime parakeet.cpp: https://github.com/mudler/parakeet.cpp
- Documentación de Parakeet en transformers: https://huggingface.co/docs/transformers/v5.10.2/en/model_doc/parakeet
- Repositorio "avena" con la herramienta de conversión (`tools/convert-ultra/`): enlace incompleto en la model card (https://github.com/)
