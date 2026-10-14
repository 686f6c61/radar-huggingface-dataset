# maxffarrell/amos-1-medium-CoreAI

## Resumen

amos-1-medium-CoreAI es una conversión independiente del checkpoint `mukaddamzaid/amos-1-medium` al runtime Apple Core AI, publicada por el usuario maxffarrell. No es un modelo de generación de texto: la propia model card lo define como un modelo de decisión, con backbone de texto, readout de 255 códigos, torre de visión y cabezas de span, región y caja. Los pesos derivan de Qwen3.5 y la licencia es Apache-2.0.

La relevancia de esta publicación es de ingeniería más que de modelado: demuestra que el grafo completo del modelo (embedding, 32 capas transformer y normalización/readout final) puede ejecutarse secuencialmente en FP32 sobre Core AI preservando la atención causal completa del checkpoint original, con decodificación de citas, temperaturas y formato de prompt intactos. El repositorio ocupa 34 GB y acumula 9 descargas.

El alcance verificado es deliberadamente estrecho: batch uno, 512 tokens combinados, imágenes de 224×224 píxeles (49 tokens fusionados) y hasta 255 códigos de opción. Faltan funciones del modelo original como contextos largos, resolución variable, enrutado de dos pasadas, rotaciones, modo thinking, servidor alojado y endpoints de explicación. El error máximo medido frente a la referencia FP32 es de 0,00001425.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto de 32 capas con atención gated-delta, más torre de visión y cabezas de span, región y caja; checkpoint derivado de Qwen3.5 |
| Parametros totales | no disponible |
| Longitud de contexto | 512 tokens combinados (texto e imagen) en esta conversión; los contextos más largos del modelo original no están implementados |
| Tipos de cuantizacion | no disponible; pesos en FP32 (backbone de texto, torre de visión, readout y cabezas). La ruta de servicio original del upstream usa BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | artefactos Core AI: un asset de embedding, 32 assets de capa transformer y un asset final de normalización/readout. No se publican safetensors ni GGUF |
| Tamano del repositorio | 34,0 GB |
| Entradas soportadas | texto, preguntas internas tipadas (`text`, `options`) e imágenes PIL, incluidas opciones de imagen |
| Tarea declarada | modelo de decisión (no generación de texto) |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. El grafo de texto se divide en un asset de embedding, 32 assets de capa transformer y un asset final de normalización/readout, que se ejecutan secuencialmente a través de Core AI en FP32. La atención gated-delta se resuelve con sustitución funcional en el forward en lugar de la construcción inversa exclusiva de exportación, lo que reproduce la resolución triangular eager original. Esa sustitución superó 21 comparaciones aleatorias independientes y se contrastó con salidas intermedias del modelo entrenado. La conversión y la referencia independiente expanden solo una capa a la vez.

La referencia de paridad principal ejecuta el checkpoint fijado en FP32. Frente a la ruta de servicio BF16 original, en 9 casos adicionales el error máximo de probabilidad y de coordenadas de caja fue de 0,109300, y un caso cambió su salida discreta, por lo que no se trata de un servicio BF16 bit a bit idéntico. La conversión no añade restricciones de licencia sobre el modelo original de Zaid Mukaddam. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decisión sobre preguntas tipadas: `predict(state, questions, images=())` acepta preguntas internas del upstream con `text` y `options`, y `request()` acepta imágenes en base64 en el formato AMOS original.
- Seis tipos de pregunta tipada cubiertos por los casos de prueba de humo y paridad.
- Extracción de citas y decodificación de quote, con el formato de prompt y las temperaturas originales retenidos.
- Procesamiento de visión: torre de visión con imágenes de 224×224 (49 tokens fusionados) y soporte de opciones de imagen.
- Localización espacial: cabeza de región y cabeza de caja entrenada, con salida de coordenadas de caja.
- Readout de decisión de 255 códigos de opción, sujeto a la capacidad de tokens disponible.
- Soporte de Unicode en los casos verificados.
- Funcionamiento en lotes de tamaño uno.

No implementado en esta conversión: contextos más largos que 512 tokens combinados, resolución de imagen variable, enrutado de dos pasadas para elección amplia, rotaciones, modo thinking, servidor alojado y endpoints de explicación. Tampoco hay soporte de tool calling, agentes ni generación de texto libre.

## Casos de uso

- Enrutado de decisiones en atención al cliente: el modelo puede responder preguntas binarias o de opción múltiple sobre un estado textual, como el ejemplo de la model card sobre si se solicita un reembolso ante un cargo duplicado, devolviendo una decisión discreta en lugar de texto libre.
- Clasificación de documentos con preguntas tipadas: encadenando varias preguntas del mismo conjunto de opciones se puede etiquetar el estado de un expediente interno sin necesidad de un modelo generativo.
- Extracción de citas y spans: la cabeza de span permite señalar fragmentos concretos del estado de entrada, útil para justificar una decisión o alimentar un sistema de revisión.
- Análisis de formularios e imágenes sintéticas: los casos verificados incluyen imágenes de estado y opciones de imagen, por lo que encaja en la lectura de documentos escaneados con preguntas cerradas sobre su contenido.
- Detección y localización de regiones: la cabeza de región y la cabeza de caja entrenada permiten devolver coordenadas sobre la imagen, aprovechables en tareas de inspección o recorte guiado.
- Prototipado local en Apple Silicon: con macOS 27 y el runtime Core AI en Python se puede ejecutar el modelo de forma local en un Mac de 64 GiB, sin depender de servicios en la nube, para validar una lógica de decisión antes de industrializarla.
- Verificación de paridad en migraciones: al conservar los formatos originales, sirve para comparar la salida de una ruta FP32 de referencia con la de un servicio BF16 existente y cuantificar la deriva con las cifras de error documentadas.
- Investigación sobre atención gated-delta: la sustitución funcional del forward y las 21 comparaciones aleatorias documentadas lo convierten en un caso de estudio reproducible para quien exporte arquitecturas híbridas a runtimes de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los casos de humo y paridad no establecen precisión de benchmark, y que no se ha verificado ninguna cifra de throughput ni de precisión del upstream.

Las únicas métricas publicadas son de paridad de conversión:

| Comparacion | Metrica | Valor |
|---|---|---|
| Core AI FP32 frente a referencia FP32 | Error maximo de probabilidad y coordenadas de caja | 0,00001425 |
| Core AI FP32 frente a servicio BF16 original (9 casos) | Error maximo de probabilidad y coordenadas de caja | 0,109300 |
| Core AI FP32 frente a servicio BF16 original (9 casos) | Casos con salida discreta distinta | 1 |
| Atencion gated-delta reimplementada | Comparaciones aleatorias independientes superadas | 21 |
| Suite de humo y paridad | Casos que cubren los seis tipos de pregunta, citas, Unicode, 24 opciones, imagenes de estado y opciones de imagen | 9 |

## Requisitos de hardware

- Entorno verificado: un Mac de 64 GiB de memoria unificada. No se ha verificado ningún dispositivo con menos memoria.
- Sistema operativo: macOS 27 con el runtime Core AI para Python. No hay ruta de despliegue en Linux, CUDA ni Windows documentada.
- Dependencias probadas: `coreai-torch==0.4.3`, PyTorch 2.14.0, Transformers 5.19 en desarrollo, NumPy y Pillow, con los requisitos exactos en `requirements.txt`. El conversor avisa de que la versión de PyTorch supera su rango validado.
- Precisión: backbone y visión en FP32, readout y cabezas en FP32. No hay cuantizaciones publicadas, por lo que no se puede estimar una VRAM reducida por cuantización.
- VRAM estimada para GPU: no disponible. El repositorio ocupa 34,0 GB, pero la conversión está pensada para memoria unificada de Apple y no se declara compatibilidad con GPU dedicadas.
- Colocación en Neural Engine: no verificada. Core AI usa la especialización por defecto.
- Opciones de despliegue: ejecución local mediante el runtime Core AI (`AmosDecoder.load`), con lotes de tamaño uno. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ni formato GGUF.
- Latencia y throughput: no disponibles, no se ha verificado ninguna cifra.
- Memoria en ejecución: los dos procesos de validación mantienen la referencia y el runtime Core AI fuera de memoria a la vez, lo que sugiere requisitos de memoria elevados para reproducir la validación completa.

## Comparativa con modelos similares

No se dispone de información sobre modelos de decisión comparables de terceros. La comparación posible es con el modelo del que deriva.

| Modelo | Relacion | Precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maxffarrell/amos-1-medium-CoreAI | Conversion a Apple Core AI, 34,0 GB | FP32 en backbone, vision, readout y cabezas | 512 tokens combinados | Apache-2.0 | HuggingFace, 9 descargas, 0 likes |
| mukaddamzaid/amos-1-medium | Modelo original del que deriva | Ruta de servicio BF16 | Contextos mas largos no implementados en la conversion | Apache-2.0 | HuggingFace, revision fijada `6b48a91ed940e08c87dcdd29c71c3b256d757ec7` |
| Qwen3.5 | Origen declarado de los pesos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo de decisión, no un generador de texto. No debe emplearse para producir respuestas abiertas ni conversación.
- Capacidad máxima de 512 tokens combinados. Cualquier petición que supere ese límite lanza un error.
- Batch uno: no hay soporte documentado para procesamiento por lotes.
- Resolución de imagen fija en 224×224; la resolución variable del original no está implementada.
- Funciones ausentes respecto al modelo original: contextos largos, enrutado de dos pasadas para elección amplia, rotaciones, modo thinking, servidor alojado y endpoints de explicación.
- Deriva frente a BF16: error máximo de 0,109300 y un cambio de salida discreta en 9 casos, así que no equivale al servicio BF16 original.
- Confianza de región discontinua: puede cambiar de forma abrupta cuando una caja cruza un límite de la rejilla.
- Sesgos conocidos: no disponibles. La model card no documenta evaluación de sesgos ni de idiomas, y el campo de idiomas soportados está vacío.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un readout de decisión con opciones cerradas, el riesgo se traslada a decisiones incorrectas más que a texto inventado.
- Precisión de benchmark: sin verificar. Las cifras de 0,00001425 y 0,109300 son de paridad de conversión, no de calidad predictiva.
- Cobertura de validación limitada: 9 casos de humo y paridad, sin garantía de precisión frente al modelo original.
- Entorno frágil: exige macOS 27, `coreai-torch==0.4.3` y PyTorch 2.14.0, con aviso del propio conversor de que la versión de PyTorch excede su rango validado.
- Licencia Apache-2.0 sin restricciones añadidas por la conversión, según la model card. Conviene revisar `LICENSE` y `SOURCE.json` antes de un uso comercial.
- Restricciones de plataforma: pensado para Apple Silicon con memoria unificada; no se ha verificado en dispositivos con menos de 64 GiB ni en Neural Engine.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxffarrell/amos-1-medium-CoreAI
- Modelo base y código de servicio original: https://huggingface.co/mukaddamzaid/amos-1-medium
- Revision fijada del modelo base: `6b48a91ed940e08c87dcdd29c71c3b256d757ec7`
- Scripts de reproduccion incluidos en el repositorio: `convert_medium_sharded.py`, `validate_decoder.py`, `smoke_decoder.py`
- Ficheros de resultados de validacion: `validation.json`, `runtime-smoke.json`, `bf16-comparison.json`, `SHA256SUMS`, `SOURCE.json`
- Fuentes de servicio del upstream incluidas en el repositorio: carpeta `serve/`
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces adicionales son los citados en la propia model card. No se dispone de paper, blog, repositorio independiente ni demo.
