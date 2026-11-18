# gatilin/hy4-flash-vision-encoder

## Resumen

`gatilin/hy4-flash-vision-encoder` es una extraccion sin perdida del componente visual del modelo multimodal `tencent/Hy4-flash`. El paquete contiene exclusivamente los 441 tensores originales con prefijo `vit.*`: el codificador visual de 27 capas, los embeddings de parches y posicionales, el proyector visual (patch merger), las normalizaciones y el parametro aprendido de salto de linea de imagen. No incluye el modelo de lenguaje, el tokenizer, el MoE, el modulo Engram ni el decodificador especulativo del modelo original.

El interes de esta publicacion es acotado pero claro: permite reutilizar el front-end visual de Hy4-flash (arquitectura adaptada de SigLIP2-So400m-Patch16-Res512) de forma aislada, sin cargar el modelo completo, para tareas de extraccion de caracteristicas de imagen, prototipado de pipelines multimodales o investigacion sobre alineamiento vision-lenguaje. Con 466,6 millones de parametros y un repo de 0,9 GB en BF16, es un componente manejable en hardware modesto.

Conviene subrayar que no es un modelo autonomo: no genera texto ni responde a instrucciones. Es una pieza extraida de un modelo de terceros, publicada por un autor independiente (`gatilin`), con cero descargas y cero likes en el momento de la consulta, y su licencia efectiva sigue siendo la Tencent Hy License del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual transformer (adaptacion de SigLIP2-So400m-Patch16-Res512) + proyector visual |
| Parametros totales | 466.629.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la rejilla de imagen nativa; no es contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos liberados en BF16; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (componente visual, sin capacidades linguisticas propias) |
| Licencia | Tencent Hy License (`tencent-hy-license`), con terminos comerciales adicionales; no es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 441 tensores BF16) |

## Arquitectura y entrenamiento

El componente reproduce la torre visual de Hy4-flash: 27 capas transformer con anchura nativa de 1152, 16 cabezas de atencion y tamano de parche 16. El proyector visual (merger) transforma las caracteristicas de parche a una anchura de 3072, que es la que consume el modelo de lenguaje del sistema completo. La arquitectura de origen esta adaptada de SigLIP2-So400m-Patch16-Res512, segun indica el autor.

No se documenta en la informacion disponible ningun detalle sobre el entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo etapas de alineamiento o RLHF. El autor unicamente afirma que la extraccion es sin perdida: se preservan claves, valores, formas y dtypes de los tensores originales, y los tensores seleccionados abarcan 20 shards del checkpoint oficial. La verificacion se hizo comparando hashes y cabeceras safetensors contra el espejo de ModelScope en la revision `4c33bfeb0fc3e08c50242c59d85a222cfac90ea7`, aunque el autor reconoce explicitamente que no descargo ni hasheo de forma independiente los shards completos originales.

## Capacidades

- Extraccion de caracteristicas de imagen: devuelve `last_hidden_state` (caracteristicas de parche pre-merger) y `pooler_output` (tokens proyectados a 3072 con los tokens nativos de salto de linea de imagen).
- Procesamiento de imagen nativo mediante el processor incluido, con soporte de `pixel_values` y `image_grid_thw`.
- Integracion como front-end visual en pipelines multimodales propios que necesiten alimentar un LLM con tokens visuales.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni tool calling por si mismo.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues propias (es un componente no linguistico).
- No incluye modo thinking, audio ni ninguna capacidad especial mas alla de la codificacion visual.

## Casos de uso

- Investigacion sobre alineamiento vision-lenguaje: permite estudiar la representacion visual de Hy4-flash de forma aislada, comparando `last_hidden_state` y `pooler_output` con los de otros codificadores SigLIP2 sin necesidad de cargar el modelo completo de decenas de miles de millones de parametros.
- Prototipado de pipelines multimodales propios: se puede usar como extractor de embeddings visuales para alimentar un LLM distinto, sustituyendo o comparando con codificadores como SigLIP2 o CLIP, gracias a que el proyector ya emite anchura 3072.
- Busqueda y recuperacion de imagenes (image retrieval): los `pooler_output` sirven como embeddings globales de imagen para indexar y consultar bases de datos vectoriales.
- Clasificacion y filtrado de imagenes en preprocesado: usar las caracteristicas de parche como entrada a cabezas ligeras para tareas de moderacion, deduplicacion o etiquetado.
- Analisis de robustez y sesgos del codificador: al ser una extraccion exacta, permite auditar el comportamiento del componente visual original (resolucion, rejilla de parches, atencion en capas 0, 13 y 26) sin depender del modelo completo.
- Docencia y experimentacion: con 466 M de parametros y 0,9 GB, es viable en CPU y en GPUs de consumo para demostrar como funciona un codificador visual tipo SigLIP2 con proyector a un espacio de mayor dimension.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta validaciones funcionales: carga estricta de los 441 tensores, inferencia en CPU float32 con dos imagenes reales de COCO128, formas `[1, 196, 1152]` antes del merger y `[1, 56, 3072]` despues para una rejilla de 14x14 parches, determinismo ante la misma imagen, y coincidencia entre SDPA nativo y softmax(QKᵀ)V explicito en las capas 0, 13 y 26 con error absoluto maximo inferior a `4.8e-6`. No se reprodujo inferencia en GPU ni se evaluo comprension de imagenes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en BF16 para los pesos (466,6 M de parametros); en float32, alrededor de 1,9 GB. La memoria de activaciones depende del tamano y numero de imagenes del lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para lotes pequenos; una RTX 3060, RTX 4060 o RTX 4090 son mas que suficientes. A100/H100 solo tienen sentido para lotes grandes o procesamiento masivo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas.
- Opciones de despliegue: el autor proporciona un loader propio (`component.py`) que requiere una revision concreta de Transformers instalada desde un fork (`ManaEstras/transformers` en el commit `c2ec850510a37978ea83df226589623d5f2be776`) y safetensors + torch. No esta registrado como `AutoModel`, por lo que no es compatible directamente con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor solo menciona inferencia en CPU float32 sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `gatilin/hy4-flash-vision-encoder` | 466,6 M | Rejilla de imagen nativa (parche 16, anchura 1152) | Tencent Hy License | Hugging Face, extraccion de terceros |
| SigLIP2-So400m-Patch16-Res512 (origen arquitectonico) | ~400 M (So400m) | Imagen a resolucion 512, parche 16 | Apache-2.0 (tipicamente) | Hugging Face / Google |
| Codificador visual de `tencent/Hy4-flash` (completo) | no disponible | no disponible | Tencent Hy License | Hugging Face / ModelScope |

La comparacion con SigLIP2 es la mas relevante porque el autor declara que la arquitectura esta adaptada de SigLIP2-So400m-Patch16-Res512; sin embargo, no se dispone de datos de rendimiento que permitan afirmar equivalencia o mejora. Frente al modelo completo Hy4-flash, este paquete es solo la fraccion visual, por lo que no son alternativas funcionales entre si.

## Limitaciones y advertencias

- No es un modelo completo: no genera texto, no responde a prompts y no puede usarse como sustituto de un modelo multimodal de extremo a extremo.
- Requiere una version parcheada de Transformers desde un fork no oficial; la integracion depende de que ese fork y el PR upstream (`huggingface/transformers#50903`) se mantengan accesibles.
- La licencia Tencent Hy License incluye terminos comerciales adicionales; es responsabilidad del usuario revisar `LICENSE` antes de cualquier uso comercial. El codigo copiado de Transformers conserva avisos Apache-2.0, pero los pesos no son Apache-2.0.
- La verificacion de integridad la realizo el propio autor y no incluye hasheo independiente de los shards completos originales; conviene tratarla como una garantia de procedencia razonable, no como una auditoria externa.
- Riesgo de sesgos y alucinacion: al ser un codificador visual, no alucina texto, pero hereda los sesgos del dataset de entrenamiento de Hy4-flash, que no se documenta.
- No hay datos sobre idiomas, resoluciones soportadas mas alla de la rejilla nativa, ni sobre comportamiento con imagenes fuera de distribucion.
- Publicacion con cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- El autor no reprodujo inferencia en GPU ni evaluo comprension de imagenes; el rendimiento real en tareas downstream esta sin medir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gatilin/hy4-flash-vision-encoder
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Espejo oficial en ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- Fork de Transformers usado por el autor: https://github.com/ManaEstras/transformers/tree/c2ec850510a37978ea83df226589623d5f2be776
- PR upstream de Transformers: https://github.com/huggingface/transformers/pull/50903
