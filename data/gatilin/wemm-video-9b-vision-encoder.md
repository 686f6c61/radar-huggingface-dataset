# gatilin/wemm-video-9b-vision-encoder

## Resumen

WeMM-Video-9B Vision Encoder es un componente extraído del modelo multimodal WeMM-Video-9B de Tencent. No se trata de un modelo completo, sino de una exportación de investigación que contiene únicamente el torreón visual (`model.visual.*`) del modelo original, preservando claves, formas, dtype y valores de los tensores. Lo publica el usuario gatilin en Hugging Face bajo licencia Apache-2.0, manteniendo la atribución al modelo base.

El componente incluye el torreón visual de 27 capas, el embedder de parches de píxeles y el merger espacial, con 456.010.480 parámetros en BF16 repartidos en 333 tensores, 16 cabezas de atención, anchura oculta de 1152 y anchura de salida del merger de 4096. Quedan excluidos el codificador de audio, el modelo de lenguaje, la sincronización y el chat audio-vídeo completo.

Su relevancia es acotada: sirve para investigadores que necesiten el extractor de características visuales de WeMM-Video-9B de forma aislada, sin cargar el modelo completo de 9B parámetros. El pipeline declarado es `image-feature-extraction`, y el paquete incluye código de instanciación (`component.py`), configuración de origen y un fichero de validación con dos imágenes COCO a 224×224.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torreón visual transformer (extraído de WeMM-Video-9B), 27 capas, 16 cabezas de atención |
| Parametros totales | 456.010.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible (componente visual, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (333 tensores BF16) |

## Arquitectura y entrenamiento

El componente es un torreón visual de tipo transformer con 27 capas, anchura oculta de 1152 y 16 cabezas de atención, precedido por un embedder de parches de píxeles y seguido por un merger espacial que proyecta a una anchura de salida de 4096. El tag `qwen3_5` sugiere que la implementación visual proviene de la familia Qwen 3.5, aunque la model card no lo detalla explícitamente. Los tensores se exportan en BF16 conservando exactamente claves, formas y valores del modelo original `tencent/WeMM-Video-9B`, revisión `c72d71171d1144f3b87195d2a349cea634e58e36`.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO. La model card indica que los ficheros de código originales se verificaron byte a byte contra la fuente fijada en Hugging Face, y que los metadatos LFS de los shards coincidían con el espejo oficial de WeChat-Vision en ModelScope. La validación realizada consistió en dos forwards visuales en FP32 sobre CPU con imágenes COCO redimensionadas a 224×224, comprobando que la atención explícita coincide con SDPA en las capas primera, media y final. Esta validación no cubre audio, rendimiento vídeo-lenguaje ni calidad de tarea extremo a extremo.

## Capacidades

- Extracción de características visuales a partir de imágenes, mediante el pipeline `image-feature-extraction`.
- Procesamiento de parches de píxeles y fusión espacial a través del merger con salida de anchura 4096.
- Compatible con la implementación visual oficial del modelo fuente mediante `component.py` y `native_source/`.
- No incluye generación de texto, razonamiento, código ni matemáticas (el modelo de lenguaje está excluido).
- No incluye capacidades de audio ni de chat audio-vídeo (el codificador de audio y la sincronización están excluidos).
- No se documentan capacidades de tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación sobre representaciones visuales: cargar únicamente el torreón visual para estudiar las características extraídas de imágenes sin necesidad de instanciar el modelo completo de 9B parámetros.
- Reproducción de experimentos: al preservar tensores y configuración de origen, permite reproducir los forwards visuales del WeMM-Video-9B original en un entorno aislado.
- Análisis de atención visual: la validación incluida compara atención explícita con SDPA en varias capas, lo que facilita estudiar patrones de atención por capa.
- Integración en pipelines de visión personalizados: usar el merger de salida 4096 como extractor de embeddings para tareas posteriores de clasificación o recuperación.
- Auditoría de componentes: verificar la equivalencia numérica entre el componente extraído y el modelo fuente antes de desplegar el modelo completo.
- Docencia y prototipado: experimentar con un torreón visual de 456M parámetros en CPU o GPU modesta sin cargar el modelo multimodal completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en BF16 ocupan aproximadamente 0,9 GB (tamaño del repo), por lo que la inferencia cabe en GPUs consumer con holgura.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este componente.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer actuales.
- Opciones de despliegue: el paquete incluye `component.py` y `native_source/` para instanciación directa; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la validación se realizó en FP32 sobre CPU con imágenes de 224×224, sin métricas de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gatilin/wemm-video-9b-vision-encoder | 456.010.480 | no disponible | apache-2.0 | Hugging Face |
| tencent/WeMM-Video-9B (modelo completo) | 9B (aproximado por nombre) | no disponible | apache-2.0 | Hugging Face |
| Torres visuales de WeMM-Video 2B y 4B | no disponible | no disponible | no disponible | no disponible |

La model card señala que el torreón de 9B tiene anchura y profundidad distintas de los torreones publicados previamente de WeMM-Video 2B y 4B, por lo que no son intercambiables directamente. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Es un componente parcial: no genera texto ni realiza tareas multimodales completas; el modelo de lenguaje, el audio y la sincronización están excluidos.
- La validación es limitada: solo dos imágenes COCO a 224×224 en FP32 sobre CPU; no se valida audio, rendimiento vídeo-lenguaje ni calidad de tarea extremo a extremo.
- No se han descargado ni verificado por hash los shards completos del modelo fuente; la verificación se basa en metadatos LFS y en la caché de rangos del espejo.
- Riesgo de alucinación: no aplica directamente al ser un extractor de características, pero cualquier pipeline posterior que use estos embeddings hereda los sesgos del modelo base.
- Sesgos conocidos: no documentados en la información disponible; se recomienda revisar la model card del modelo base Tencent/WeMM-Video-9B.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe preservarse la atribución y los avisos de copyright del modelo fuente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se documentan idiomas soportados ni longitud de contexto, al tratarse de un componente visual sin capacidades lingüísticas.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/wemm-video-9b-vision-encoder
- Modelo base: https://huggingface.co/tencent/WeMM-Video-9B
- Espejo oficial WeChat-Vision en ModelScope: no disponible como URL directa en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
