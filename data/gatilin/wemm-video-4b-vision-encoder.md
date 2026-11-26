# gatilin/wemm-video-4b-vision-encoder

## Resumen

WeMM-Video-4B Vision Encoder es un componente extraido del modelo multimodal tencent/WeMM-Video-4B, publicado por el usuario gatilin como export de investigacion. No se trata de un modelo completo, sino de un subconjunto de pesos: unicamente los tensores correspondientes al codificador visual (`model.visual.*`), que incluyen la torre de vision de 24 capas, el embebedor de parches de pixeles y el modulo de fusion espacial (spatial merger). El resultado es un codificador de imagenes de 333,5 millones de parametros en BF16, con 16 cabezas de atencion y anchura oculta de 1024.

El modelo resuelve un problema muy concreto: permitir que investigadores y desarrolladores reutilicen el codificador visual de WeMM-Video-4B de forma aislada, sin necesidad de cargar el modelo completo (que incluye el modelo de lenguaje y el codificador de audio). Esto facilita experimentos de extraccion de caracteristicas visuales, analisis de representaciones o integracion del codificador en pipelines propios. Su relevancia es acotada: es una exportacion de investigacion con cero descargas y cero likes en el momento de redactar esta ficha, orientada a un publico tecnico muy especifico.

La arquitectura del componente sigue el diseno del codificador visual de Qwen3.5 (tag `qwen3_5`), con torre de 24 capas y salida del merger de anchura 2560. La licencia es Apache-2.0, heredada del modelo original, y el repositorio ocupa 0,7 GB con 297 tensores en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de vision transformer (24 capas) con embebedor de parches y spatial merger; componente del codificador visual de Qwen3.5 |
| Parametros totales | 333.514.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (297 tensores BF16) |

## Arquitectura y entrenamiento

El componente es una torre de vision de 24 capas con 16 cabezas de atencion y anchura oculta de 1024, que procesa parches de pixeles mediante un embebedor de parches y proyecta las caracteristicas a una anchura de salida de 2560 a traves de un spatial merger. Los tensores conservan claves, formas, dtype y valores del modelo original tencent/WeMM-Video-4B, revision `abcbb4422b76a2a673a9ca73de1f297ae663ae6a`. No se incluyen el codificador de audio, el modelo de lenguaje, el modulo de sincronizacion ni la funcionalidad completa de chat audio-video.

No se dispone de informacion sobre el proceso de entrenamiento del componente aislado (numero de tokens, composicion del dataset, RLHF/DPO), ya que se trata de una extraccion de pesos y no de un entrenamiento propio. El autor verifico que los ficheros de codigo originales coinciden byte a byte con la fuente fijada en Hugging Face, y que los metadatos LFS de los shards de origen coinciden con el espejo oficial de WeChat-Vision en ModelScope. Los payloads de cada tensor exportado se compararon con la cache de rangos del espejo, aunque los shards completos de origen no se descargaron ni hashearon de forma independiente. La validacion incluyo dos imagenes reales de COCO redimensionadas a 224x224 que pasaron forwards visuales estrictos en FP32 sobre CPU, y se comprobo que la atencion explicita coincide con SDPA en la primera, intermedia y ultima capa.

## Capacidades

- Extraccion de caracteristicas visuales de imagenes: el modelo esta etiquetado con el pipeline `image-feature-extraction` y produce representaciones a partir de imagenes de entrada.
- Procesamiento de parches de pixeles mediante embebedor dedicado y torre de 24 capas.
- Fusion espacial de caracteristicas a traves del spatial merger, con salida de anchura 2560.
- No incluye generacion de texto, razonamiento, codigo, matematicas ni capacidades de lenguaje.
- No incluye soporte de tool calling ni function calling.
- No incluye soporte de agentes ni razonamiento multi-paso.
- No incluye capacidades multilingues (no hay modelo de lenguaje integrado).
- No incluye vision-language, audio, thinking mode ni ninguna capacidad de chat; el autor excluye explicitamente audio, lenguaje, sincronizacion y chat audio-video completo.

## Casos de uso

- Investigacion de representaciones visuales: cargar el codificador aislado para extraer embeddings de imagenes y analizar como se distribuyen las caracteristicas en las 24 capas, sin el coste de cargar el modelo multimodal completo.
- Destilacion o transferencia a otros modelos: usar las caracteristicas del codificador como objetivo o entrada para entrenar cabezas auxiliares (clasificacion, retrieval, segmentacion) sobre un backbone visual preentrenado.
- Integracion en pipelines de vision propios: sustituir o comparar el codificador de WeMM-Video-4B con otros codificadores en tareas de image feature extraction, manteniendo la fidelidad de pesos verificada por el autor.
- Validacion y auditoria de pesos: el repositorio incluye comparaciones tensor a tensor (por ejemplo, frente a WePocket 4B: 26 tensores identicos y 271 tensores de misma forma pero distintos), util para estudiar diferencias entre codificadores de la misma familia.
- Reproducibilidad de experimentos: al conservar `source_config.json`, `preprocessor_config.json` y el codigo fuente en `native_source/`, permite reproducir forwards visuales exactos en FP32 sobre CPU para pruebas de regresion.
- Base para experimentos de multimodalidad: combinar este codificador con un modelo de lenguaje propio para construir un sistema vision-language a medida, reutilizando la torre visual verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta validaciones funcionales (forwards FP32 en CPU con dos imagenes COCO a 224x224 y coincidencia entre atencion explicita y SDPA), que no constituyen benchmarks de calidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en BF16 para los 333,5 millones de parametros; en FP32 seria del orden de 1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; no requiere A100 ni H100 para inferencia del componente aislado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en CPU para pruebas pequenas.
- Opciones de despliegue: el autor proporciona `component.py` para instanciar la implementacion visual oficial desde `native_source/` y cargar estrictamente los tensores; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este componente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/wemm-video-4b-vision-encoder | 333,5 M | no disponible | validacion funcional, sin benchmarks | Apache-2.0 | Hugging Face, 0 descargas |
| tencent/WeMM-Video-4B (modelo completo) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| WePocket 4B (referencia del autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor compara los pesos del codificador con WePocket 4B: 26 tensores son exactamente iguales y 271 tensores de la misma forma difieren. Se trata de una comparacion de igualdad exacta de pesos, no de similitud de representaciones. No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- No es un modelo completo: carece de modelo de lenguaje, codificador de audio y modulo de sincronizacion, por lo que no puede realizar tareas de chat, generacion de texto ni comprension audio-video.
- La validacion del autor se limita a forwards visuales en FP32 sobre CPU con dos imagenes COCO a 224x224; no valida audio, rendimiento video-lenguaje ni calidad de tarea de extremo a extremo.
- Los shards completos de origen no se descargaron ni hashearon de forma independiente; la verificacion se basa en metadatos LFS y en la cache de rangos del espejo de ModelScope.
- Riesgo de alucinacion: no aplica directamente al no generar texto, pero las representaciones extraidas pueden no ser adecuadas para tareas downstream sin validacion adicional.
- Sesgos conocidos: no disponibles; al heredar pesos de WeMM-Video-4B, podria arrastrar sesgos del dataset de entrenamiento original, no documentados en esta ficha.
- Limitaciones de contexto o idioma: no disponibles; no hay ventana de contexto ni idiomas definidos para un codificador visual aislado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe preservarse la atribucion y los avisos del modelo original; el autor incluye la LICENSE original.
- Caveat para produccion: es una exportacion de investigacion con cero descargas y cero likes; no hay garantias de mantenimiento, soporte ni estabilidad de la API del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/wemm-video-4b-vision-encoder
- Modelo base: https://huggingface.co/tencent/WeMM-Video-4B
