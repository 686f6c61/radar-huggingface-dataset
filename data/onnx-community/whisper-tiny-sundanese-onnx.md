# onnx-community/whisper-tiny-sundanese-ONNX

## Resumen

whisper-tiny-sundanese-ONNX es la versión en formato ONNX del ajuste fino `souba67/whisper-tiny-sundanese`, un modelo de reconocimiento automático del habla (ASR) para sundanés (`su`) construido sobre `openai/whisper-tiny`. Lo publica la comunidad `onnx-community`, que se limita a convertir y subir los pesos mediante un Space automático de conversión; el trabajo de ajuste fino y la evaluación proceden del autor original. El objetivo es doble: llevar el ASR en sundanés a un rendimiento utilizable (WER del 10,6 % frente al 83,4 % del whisper-tiny original sobre el mismo corpus) y empaquetarlo para inferencia en el navegador con transformers.js y ONNX Runtime Web.

La relevancia práctica está en el tamaño: el pipeline completo en int8 ocupa 40,1 MB (30,1 MB de decodificador fusionado y 10,1 MB de encoder), lo que permite ejecutar transcripción en un portátil, un móvil o una PWA sin GPU dedicada ni conexión. La model card es inusualmente honesta y documenta dos resultados distintos: 10,6 % de WER en habla leída de estudio (SLR44) y 69,68 % en grabaciones reales de micrófono de portátil, con la advertencia explícita de que citar solo la primera cifra sería engañoso.

Arquitectura transformer encoder-decoder de tipo Whisper, con una dimensión de modelo de 384 y un vocabulario de 51.865 tokens (dato deducible de la matriz de embedding citada en la model card). No se publican en la información disponible el número exacto de parámetros ni de capas; por herencia de `openai/whisper-tiny` corresponde a la variante de ~39 M de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | No detallado en la model card; corresponde a la variante `openai/whisper-tiny` (~39 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana mel estándar de Whisper); no se detalla en la información disponible |
| Tipos de cuantizacion | fp32 ONNX; int8 dinámica per-tensor (`dtype: 'q8'`); se menciona una variante int8 per-channel no publicada |
| Idiomas soportados | Sundanés (`su`) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder + decodificador fusionado); el modelo base está en PyTorch/safetensors |
| Tamano del pipeline int8 | 40,1 MB (30,1 MB decodificador + 10,1 MB encoder) |
| Tamano del decodificador fp32 | 118,4 MB |
| Tamano del repositorio | 2,1 GB (incluye todas las variantes y artefactos) |
| Vocabulario | 51.865 tokens; dimension de modelo 384 |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

Se trata de un ajuste fino supervisado de `openai/whisper-tiny`, el modelo ASR de OpenAI con encoder y decoder transformer y una ventana de entrada de 30 segundos de audio muestreado a 16 kHz. El ajuste adapta un modelo originalmente multilingüe al sundanés; la model card no documenta hiperparámetros, número de pasos, composición exacta del dataset ni si hubo etapas de RLHF o DPO (no disponibles). El corpus de evaluación y, presumiblemente, de entrenamiento es OpenSLR SLR44: 4.213 enunciados (2.401 de voz femenina y 1.812 masculina), divididos en 3.791 de entrenamiento y 422 de test con `train_test_split(test_size=0.1, seed=42)`.

La conversión a ONNX se realizó con la herramienta automática de `onnx-community/convert-to-onnx` y se aplicó cuantización dinámica sobre los ficheros fp32 ya publicados, no sobre una exportación nueva. El detalle técnico relevante es que `quantize_dynamic` no desciende en las subgrafos del nodo `If` que usa un decodificador fusionado salvo que se pase `extra_options={"EnableSubgraph": True}`; sin esa opción, el fichero supuestamente int8 quedaba en 118,5 MB (prácticamente idéntico al fp32 de 118,4 MB). Con la corrección se obtiene una reducción real de 118,4 MB a 30,1 MB, a costa de 1,17 puntos de WER. Reexportar con optimum 2.1.0 desvincula el `lm_head` del embedding de tokens y duplica la matriz `[51865, 384]`, produciendo un decodificador fp32 de 198,1 MB y un int8 de 50,1 MB.

## Capacidades

- Transcripción de voz a texto en sundanés, con salida de texto plano por segmentos.
- Reconocimiento de habla leída y de habla coloquial, con degradación documentada en esta última.
- Inferencia en navegador mediante transformers.js (WebGPU o WASM) y en Node.js, sin backend Python.
- Ejecución sobre audio de 16 kHz mono; la model card verifica su funcionamiento con la ruta de audio típica del navegador (cancelación de eco, supresión de ruido y ganancia automática activadas).
- Pipeline `automatic-speech-recognition` de transformers.js, que permite procesar ficheros de audio y obtener la transcripción directamente.
- Cuantización int8 con un equilibrio medido entre tamaño y precisión: 30,1 MB y 11,61 % de WER frente a 10,44 % en fp32.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio más allá de la ventana ASR: es un modelo exclusivamente de transcripción.
- No se documentan capacidades de puntuación, diarización ni marcas temporales a nivel de palabra en la información disponible.

## Casos de uso

- Subtitulado y transcripción de vídeo en sundanés: el pipeline acepta audio de 16 kHz y devuelve texto por segmentos; con 40,1 MB en int8 puede ejecutarse en el propio navegador del editor, evitando subir material audiovisual a un servidor externo.
- Aplicaciones web offline para comunidades lingüísticas: una PWA con transformers.js y el modelo cacheado permite transcribir notas de voz sin conexión en dispositivos de gama baja, algo inviable con modelos ASR de cientos de millones de parámetros.
- Digitalización de archivo oral y etnografía: el modelo procesa grabaciones de campo en sundanés a un coste computacional mínimo; conviene validar antes el WER sobre el dominio concreto, dado el salto del 10,6 % al 69,68 % entre habla leída y micrófono.
- Atención al cliente en centros de contacto locales: transcripción de llamadas para búsqueda, analítica y control de calidad; el tamaño reducido permite desplegar una instancia por núcleo de CPU en lugar de recurrir a GPU.
- Prototipado rápido de ASR para variedades dialectales: sirve como línea base reproducible (WER 10,6 % en SLR44) sobre la que medir mejoras con más datos o con un modelo mayor, con la precaución de evaluar siempre en un split distinto del de lectura.
- Herramientas de accesibilidad en kioscos o navegador: dictado por voz en sundanés integrado en formularios web mediante WebGPU/WASM, con latencia dominada por el resto de la aplicación y no por el modelo.
- Evaluación comparativa de cuantizaciones: el repositorio documenta que int8 per-tensor y per-channel invierten su orden según el dominio (74,39 % frente a 81,17 % en micrófono), lo que lo convierte en un caso de estudio útil para diseñar protocolos de cuantización.

## Benchmarks y rendimiento

WER sobre el split de test retenido de SLR44 (422 clips, normalización `.strip().lower()` en ambos lados, sin puntuación):

| Modelo / variante | WER SLR44 | WER micrófono de portátil | Exact match vs PyTorch | Tamano decodificador |
|---|---|---|---|---|
| `openai/whisper-tiny` original | 83,4 % | 87,01 % | – | – |
| Este fine-tune, PyTorch | 10,44 % (re-ejecución) / 10,6 % (publicado) | 69,68 % | – | – |
| Este fine-tune, fp32 ONNX | 10,44 % | no disponible | 100 % | 118,4 MB |
| Este fine-tune, int8 ONNX (publicado) | 11,61 % | 74,39 % | 76,7 % | 30,1 MB |
| int8 per-channel (no publicado) | 10,09 % (10,82 % per-tensor en el split de 422) | 81,17 % | no disponible | +110 KB |

Desglose por registro (PyTorch e int8 ONNX) sobre las 60 grabaciones de micrófono:

| Variante | Neutro | Coloquial |
|---|---|---|
| PyTorch | 64,48 % | 74,63 % |
| int8 ONNX | 66,41 % | 81,99 % |

La brecha entre registro neutro y coloquial es de vocabulario, no acústica: el 39 % de los tokens del subconjunto coloquial no aparecen en SLR44, frente al 27 % del neutro. La model card también reporta una comprobación del audio: el 76 % de la energía está por debajo de 1 kHz y el 6 % por encima de 4 kHz, con una desviación relativa de nivel de 0,86 y un clip recortado de los sesenta.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB en todas las variantes; el pipeline int8 completo son 40,1 MB de pesos más las activaciones de una ventana de 30 s.
- GPU recomendadas: no requiere GPU dedicada. Cualquier A100, H100 o RTX 4090 lo ejecuta muy por debajo de su capacidad; el caso de uso natural es CPU, iGPU o WebGPU.
- Cabe en GPU consumer y en hardware integrado: sí, en cualquier RTX, en portátiles sin GPU discreta, en Raspberry Pi y en navegadores móviles.
- Opciones de despliegue: transformers.js (WebGPU/WASM) en navegador y Node.js, ONNX Runtime y ONNX Runtime Web, y el ecosistema optimum/ONNX para Python. vLLM y TGI no están orientados a este tipo de pipeline ASR y no se documentan para este modelo.
- Latencia y throughput: no se han publicado cifras de latencia o throughput en la información disponible. Como referencia indirecta, la decodificación int8 del repositorio usa un decodificador fusionado de 30,1 MB, cuatro veces menor que el fp32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | WER sundanés | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (int8 ONNX) | ~39 M (whisper-tiny) | 30 s | `su` | 11,61 % (leído) / 74,39 % (micrófono) | Apache 2.0 | ONNX en HF, transformers.js |
| `openai/whisper-tiny` | ~39 M | 30 s | Multilingüe (~99 idiomas) | 83,4 % (leído) / 87,01 % (micrófono) | Apache 2.0 en HF | PyTorch, safetensors, ONNX vía `onnx-community/whisper-tiny-ONNX` |
| `onnx-community/whisper-tiny-ONNX` | ~39 M | 30 s | Multilingüe | No disponible (no específico de sundanés) | Apache 2.0 | ONNX en HF |
| `souba67/whisper-tiny-sundanese` (base) | ~39 M | 30 s | `su` | 10,44 % (PyTorch, leído) | Apache 2.0 | PyTorch en HF |

La comparación relevante es contra el whisper-tiny original: el ajuste fino mejora 73 puntos de WER en habla leída y 17 puntos en audio real de micrófono, lo que según el propio autor indica que buena parte de la ventaja aparente proviene de las condiciones de grabación de SLR44. No se dispone de comparativas con modelos ASR específicos de sundanés de otros tamaños en la información proporcionada.

## Limitaciones y advertencias

- El WER del 10,6 % corresponde a habla leída de estudio con los mismos hablantes y condiciones que el entrenamiento; en audio real de micrófono sube al 69,68 %. Citar solo la primera cifra es engañoso y el autor lo advierte de forma explícita.
- El rendimiento en registro coloquial es notablemente peor (74,63 % en PyTorch y 81,99 % en int8) por cobertura de vocabulario: el 39 % de los tokens coloquiales no aparecen en SLR44.
- El corpus tiene un sesgo de género y de dominio: 2.401 enunciados femeninos frente a 1.812 masculinos, todos de un conjunto reducido de hablantes y de lectura.
- La métrica depende fuertemente de la normalización: se aplica solo `.strip().lower()`, de modo que cualquier discrepancia de puntuación cuenta como error; el WER varía varios puntos según la normalización elegida.
- No se debe seleccionar la cuantización con el split de habla leída: int8 per-channel gana allí (10,09 % frente a 10,82 %) pero pierde en micrófono (81,17 % frente a 74,39 %) y llega al 93,38 % en el subconjunto coloquial.
- Versiones anteriores del repositorio incluían un `decoder_model_merged_quantized.onnx` que era fp32 en la práctica; si se descargó antes del 13 de agosto de 2026, conviene volver a descargarlo y verificar el tamaño (30,1 MB esperados, no 118,5 MB).
- Solo transcribe sundanés; no traduce ni detecta idioma de forma fiable fuera de ese dominio, y no ofrece funcionalidades de razonamiento, código o tool calling.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio, ruido o audio ininteligible; no se documenta mitigación específica en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; el modelo base y los datos SLR44 deben verificarse por separado si se redistribuyen.
- No se documentan métricas de robustez frente a ruido, acentos regionales distintos del corpus ni audio telefónico de 8 kHz.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onnx-community/whisper-tiny-sundanese-ONNX
- Modelo base (PyTorch): https://huggingface.co/souba67/whisper-tiny-sundanese
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-tiny
- Conversión ONNX de whisper-tiny: https://huggingface.co/onnx-community/whisper-tiny-ONNX
- Space de conversión automática a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación del pipeline ASR en transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline
- Corpus OpenSLR SLR44: https://www.openslr.org/44/
- Repositorio de modelos ONNX: https://github.com/onnx/models
- Índice de ficheros y hashes de whisper-tiny: https://modelindex.dev/models/onnx-community/whisper-tiny
- Referencia de whisper-tiny en ONNX: https://huggingface.co/onnx-community/whisper-tiny
