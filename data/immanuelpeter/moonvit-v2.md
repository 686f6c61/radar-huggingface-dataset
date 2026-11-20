# immanuelpeter/MoonViT-V2

## Resumen

MoonViT-V2 es un componente extraído del modelo multimodal Kimi K3 de Moonshot AI: concretamente el "vision tower" (codificador de imágenes) más el proyector que traduce sus representaciones al espacio de embeddings del modelo de lenguaje. El repositorio, publicado por el usuario immanuelpeter, no contiene un modelo generativo autónomo, sino un extractor de características visuales listo para usar con `transformers` mediante `pipeline("image-feature-extraction")`. Su utilidad principal es reproducir la ruta de imagen de Kimi K3 sin necesidad de descargar el checkpoint completo de 2,8 billones de parámetros repartido en 96 shards.

El modelo tiene 401.214.464 parámetros (unos 401 millones) según los pesos en safetensors, con un repositorio de 0,9 GB. La torre consta de 27 capas con dimensión oculta 1024, 12 cabezas de atención, QKV de 1536 y parches de 14x14 píxeles. Incluye compresión de tokens mediante pixel shuffle 2x2 y pooling temporal, sin parámetros aprendidos, y un proyector de dos capas lineales (4096→4096 con GELU y 4096→7168) seguido de RMSNorm.

Es relevante para quienes investigan arquitecturas de visión dentro de modelos multimodales de gran escala, para pipelines de recuperación o clasificación de imágenes que quieran reutilizar representaciones de un modelo frontera, y para trabajos de interpretabilidad o destilación que necesiten aislar la torre visual de un VLM. La licencia es la de Kimi K3, no una licencia permisiva estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (MoonViT-V2) con compresion de tokens por pixel shuffle 2x2 y pooling temporal, mas proyector MLP |
| Parametros totales | 401.214.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de extraccion de caracteristicas de imagen, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Kimi K3 License (identificador `kimi-k3`, licencia "other") |
| Formato de pesos | safetensors (`model.safetensors` con 165 tensores de torre y `projector.safetensors` con 3 tensores) |

## Arquitectura y entrenamiento

La torre es un transformer de vision de 27 capas con ancho 1024, 12 cabezas de atencion y proyeccion QKV de 1536, operando sobre parches de 14x14 píxeles. Tras el codificador, un mecanismo de compresion de tokens combina pixel shuffle 2x2 con pooling temporal; ambos son operaciones sin parametros aprendidos, lo que reduce la secuencia visual antes del proyector. El proyector (`patchmergerv2` en Kimi K3) es un MLP sin sesgo: `Linear(4096, 4096)`, activacion GELU, `Linear(4096, 7168)` y `RMSNorm(7168)`, que alinea la salida visual con la dimension de embeddings del modelo de lenguaje de K3.

No se documentan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset, fases de alineacion como RLHF o DPO). El autor indica que los pesos se extraen de los shards 95 y 96 de `moonshotai/Kimi-K3` preservando BF16 original, y que la torre es bit-identica a la publicada en `AI4Industry/MoonViT-V2`. La validacion de paridad compara los 165 tensores de la torre y los 3 del proyector con el modelo padre mediante `torch.equal`, y las salidas fusionadas y proyectadas coinciden con la fuente oficial de vision de vLLM en FP32 bajo `TORCH_SDPA` de vLLM. No hay innovaciones adicionales documentadas como decodificacion especulativa o atencion lineal.

## Capacidades

- Extraccion de caracteristicas de imagen: genera embeddings visuales a partir de imagenes de entrada mediante `pipeline("image-feature-extraction")`.
- Proyeccion al espacio de embeddings de Kimi K3: la salida del proyector tiene dimension 7168, compatible con el modelo de lenguaje del que se extrajo.
- Procesamiento de imagenes con preprocesador propio (`image_processing_moonvit_v2.py`, `preprocessor_config.json`), con parches de 14x14.
- Compresion de tokens visuales: pixel shuffle 2x2 y pooling temporal reducen la longitud de secuencia antes de la proyeccion.
- No realiza generacion de texto, razonamiento, codigo, matematicas ni respuesta a instrucciones.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No incluye modo "thinking", audio ni video mas alla del pooling temporal aplicado a fotogramas.

## Casos de uso

- Recuperacion de imagenes por similitud (image retrieval): usar los embeddings proyectados de 7168 dimensiones como representacion densa para indexar un corpus visual y buscar vecinos cercanos con FAISS o similar; la torre esta validada contra la implementacion oficial, lo que da garantias de reproducibilidad.
- Clasificacion y etiquetado de imagenes: congelar la torre y entrenar una cabeza lineal ligera sobre las caracteristicas extraidas para tareas de clasificacion multietiqueta en dominios especificos (inspeccion industrial, catalogacion de producto).
- Deteccion de duplicados y near-duplicates visuales: comparar embeddings de imagenes en un pipeline de moderacion o deduplicacion de datasets; el modelo es pequeno (0,9 GB de repo) y cabe en memoria de GPU de consumo.
- Investigacion sobre alineamiento vision-lenguaje: estudiar como se proyectan las representaciones visuales al espacio de 7168 dimensiones de Kimi K3 sin cargar el checkpoint completo de 2,8 T de parametros, por ejemplo para analisis de interpretabilidad o destilacion.
- Base para fine-tuning de adaptadores visuales: reutilizar la torre como inicializacion congelada o parcialmente descongelada en un VLM propio de menor escala, aprovechando que la torre es bit-identica a la de un modelo frontera.
- Validacion y benchmarking de infraestructura: el repositorio incluye scripts de paridad y de exportacion (`vision-tower-bench`), utiles para verificar implementaciones propias de atencion o de kernels contra una referencia oficial en FP32.
- Extraccion de caracteristicas para pipelines de vision clasica: alimentar un modelo de segmentacion o un detector con embeddings precalculados y reducir coste de computo frente a ejecutar un VLM completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es de paridad numerica: coincidencia exacta (`torch.equal`) de los 165 tensores de la torre y los 3 del proyector con el modelo padre Kimi K3, y coincidencia de salidas fusionadas y proyectadas con la fuente oficial de vision de vLLM en FP32 bajo `TORCH_SDPA`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en BF16/FP16 solo para pesos (401 M de parametros); con activaciones y preprocesado, entre 1,5 y 3 GB dependiendo de la resolucion de imagen y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para lotes pequenos; A100, H100 o L40S para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090; tambien en GPUs integradas o CPU para inferencia de baja throughput.
- Opciones de despliegue: `transformers` (libreria declarada, con `trust_remote_code` por el codigo `custom_code`), servidores compatibles con transformers, y exportacion a ONNX o TensorRT no documentada pero viable al ser una torre estandar; vLLM se menciona solo como referencia de validacion, no como ruta de despliegue confirmada para este repositorio.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoonViT-V2 (este repo) | 401 M | Imagen, parches 14x14, 27 capas | Extraccion de caracteristicas visuales y proyeccion a 7168 | Kimi K3 License | Hugging Face, 982 descargas |
| AI4Industry/MoonViT-V2 | no disponible en la informacion | Imagen, misma torre | Solo torre, sin proyector | no disponible | Hugging Face |
| moonshotai/Kimi-K3 | 2,8 T (96 shards) | Multimodal completo | VLM generativo completo | Kimi K3 License | Hugging Face |
| CLIP ViT-L/14 (referencia de categoria) | ~428 M (torre + proyector) | Imagen y texto | Embeddings imagen-texto | Licencia abierta de OpenAI | Amplia |

La comparacion con CLIP es orientativa por tamano y categoria de tarea; no se dispone de datos de rendimiento comparables entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no responde a prompts, no genera texto ni codigo; usarlo como tal produce resultados sin sentido.
- La licencia es la Kimi K3 License (identificador `kimi-k3`), una licencia "other" con terminos propios; es imprescindible revisar `LICENSE` antes de cualquier uso comercial o redistribucion.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado por Moonshot AI hereda los sesgos de sus datos de entrenamiento, no publicados.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero las representaciones pueden no ser fiables fuera de la distribucion de imagenes de entrenamiento.
- No se especifican idiomas ni capacidades multilingues porque el modelo no procesa texto.
- El repositorio depende de codigo con `custom_code` (`configuration_moonvit_v2.py`, `modeling_moonvit_v2.py`), lo que exige `trust_remote_code=True` y revisar el codigo antes de ejecutarlo en produccion.
- La validacion de paridad se realizo en FP32; el uso en BF16 puede introducir diferencias numericas menores respecto a la referencia.
- El autor del repositorio no es Moonshot AI; es un empaquetado de terceros, aunque verificado contra el modelo padre.
- No se publican mediciones de latencia, throughput ni benchmarks de calidad de los embeddings, lo que dificulta estimar su rendimiento frente a alternativas establecidas como CLIP o SigLIP.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/immanuelpeter/MoonViT-V2
- Torre original empaquetada por AI4Industry: https://huggingface.co/AI4Industry/MoonViT-V2
- Modelo base Kimi K3: https://huggingface.co/moonshotai/Kimi-K3
- Script de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/parity/moonvit_v2.py
- Script de exportacion y reproduccion: https://github.com/immanuel-peter/vision-tower-bench/blob/main/vtb/adapters/moonvit_v2.py
- Ejemplo de inferencia: `examples/inference.py` dentro del repositorio de Hugging Face
- Licencia: `LICENSE` dentro del repositorio de Hugging Face
