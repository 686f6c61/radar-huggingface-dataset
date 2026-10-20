# Jlfn/embeddinggemma2-vq4x4096-q80token

## Resumen

EmbeddingGemma-2 VQ4x4096 es un artefacto de embeddings derivado de `google/embeddinggemma-2`, publicado por el usuario Jlfn y empaquetado en un contenedor GGUF propietario para el motor **ds4** (implementación en Rust con núcleo C/CUDA). El modelo recibe texto (y opcionalmente una imagen por elemento) y devuelve un único vector de 768 dimensiones normalizado en L2, pensado para recuperación de información, similitud semántica y clasificación por vecindad.

La particularidad técnica es la cuantización: no emplea bloques `Q4_*` ni `IQ*` de llama.cpp, sino *payloads* `vqblob` de tipo 42 con cuantización vectorial de 4 bits y un libro de códigos de dimensión 4096, generados con la cadena de herramientas de referencia del cuantizador YoungAi (la misma del recetario de DeepSeek V4.1), incluyendo retroalimentación por grupos de columnas estilo GPTQ. El resultado son dos ficheros: la torre de texto (437,5 MB, ~392 M parámetros) y la torre de visión (367,1 MB, 211 tensores), que solo se carga si se activa la ruta multimodal.

Su relevancia ahora es doble: por un lado demuestra que es posible llevar un modelo de embeddings multilingüe a 4 bits con cuantización vectorial manteniendo la interfaz OpenAI de embeddings; por otro, es un artefacto de nicho con cero descargas y cero valoraciones, atado a un motor que hay que compilar desde el código fuente y que **no funciona en llama.cpp**. Es, por tanto, material para evaluar experimentalmente, no para producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (encoder) con cuantizacion vectorial; familia `gemma_vq` (`family=16 variant=19`) del motor ds4 |
| Parametros totales | 392.361.397 (dato real de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el endpoint `/health` expone `item_tokens_max` en tiempo de ejecucion |
| Tipos de cuantizacion | 4 bits por cuantizacion vectorial (VQ), libro de codigos de dimension 4096, `token=q8_0`, codebook en `cbfp16`; payload `vqblob` de tipo 42 |
| Idiomas soportados | multilingue (la model card cita ejemplos en sueco e ingles; no se detalla la lista completa) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF propietario del motor ds4 (dos ficheros: torre de texto y torre de vision `mmproj`) |
| Dimension de salida | 768 dimensiones, normalizadas en L2; truncables a 512, 256 o 128 con renormalizacion |
| Modelo base | google/embeddinggemma-2 (revision `914f7f89142e33e77833254d9c9b90c3cef7303b`) |
| Libreria / motor | ds4-rs (host en Rust + nucleo C/CUDA) |
| Pipeline | feature-extraction / sentence-similarity |
| Tamano del repositorio | 0,8 GB (437.508.416 bytes torre de texto + 367.088.960 bytes torre de vision) |
| Fecha de publicacion | 2026-10-20 |

## Arquitectura y entrenamiento

El artefacto no reentrena nada: reproduce los pesos del modelo de referencia `google/embeddinggemma-2` en un contenedor propio. La arquitectura subyacente es la del encoder de embeddings de Gemma, con dos torres separadas en el empaquetado: la de texto (el modelo de embeddings propiamente dicho) y la de visión (proyección multimodal `mmproj`, 211 tensores), que solo se carga cuando se pasa la bandera `--vision`. La salida es un vector de 768 dimensiones normalizado en L2, con soporte de truncado a 512/256/128 dimensiones aplicando renormalizacion posterior.

El proceso de cuantizacion está descrito en la model card: se usó el cuantizador de referencia (YoungAi, misma cadena que el recetario de DeepSeek V4.1) con libro de códigos generado por k-means, retroalimentación por grupos de columnas al estilo GPTQ, el escritor de payloads y los codificadores de escalares por bloque **invocados, no reimplementados**. El contenedor original es un envoltorio `DQVD` v1 del proyecto, reemitido como GGUF. La metadata del propio artefacto registra la receta literal: `towers=vq4x4096 sharedcb=0 cbfp16 token=q8_0 frontend=vq other=keep nocal`. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF/DPO (el modelo base es un modelo de embeddings, no generativo, por lo que esas fases no aplican del mismo modo).

Como innovación destacable, el uso de cuantización vectorial con libro de códigos compartido a nivel de torre (aunque con `sharedcb=0`, es decir, sin codebook compartido entre torres) reduce el peso de la torre de texto a 437 MB manteniendo precisión de 4 bits. La contrapartida es que el formato es incompatible con el ecosistema GGUF estándar: llama.cpp rechaza el fichero por diseño.

## Capacidades

- Generación de embeddings de texto: un vector de 768 dimensiones normalizado en L2 por entrada.
- Truncado de dimensionalidad en inferencia a 512, 256 o 128 dimensiones, con renormalizacion automática (útil para reducir tamaño de índice y coste de búsqueda).
- Multilingüe: la model card documenta ejemplos en sueco e inglés; el tag de idioma es `multilingual` sin listado exhaustivo.
- Prefijos de tarea que modifican el vector resultante: como mínimo `SearchQuery`, `Retrieval-document` y `Raw`. El prefijo se antepone antes de la tokenización, por lo que afecta al embedding final.
- Embeddings multimodales texto-imagen: una imagen por elemento, marcada con el token especial `<|image|>` en el texto del elemento, enviada como data URI base64 en el formato de content-parts de OpenAI.
- Procesamiento por lotes: el endpoint acepta un array de entradas y ejecuta una única llamada a la torre por petición.
- Compatibilidad con la interfaz OpenAI de embeddings: `POST /v1/embeddings` y `GET /health` en `ds4-server`.
- Modos de entrada por CLI: `--embed` (cadena), `--embed-file` (fichero) y `--embed-stdin`.
- **No** dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, generación de texto ni agentes: es exclusivamente un modelo de representación.

## Casos de uso

- **Búsqueda semántica y RAG sobre documentación interna**: se indexan los fragmentos con la tarea `Retrieval-document` y se consulta con `SearchQuery`; la separación explícita de prefijos permite alinear el espacio de consultas y documentos, algo crítico para la precisión del retrieval.
- **Indexación de contratos y documentación legal en PDF**: la model card documenta un caso medido de 143 páginas de un convenio colectivo sueco (76.504 tokens) indexadas en 19,0 s (~4.029 tokens/s) en una RTX 4070 SUPER; el flujo es `pdftotext` → troceado por páginas → lote al endpoint.
- **Digitalización de escaneos sin capa de texto**: renderizado de páginas con `pdftoppm` a 150 ppp y envío como imagen con el marcador `<|image|>`, usando la torre de visión para obtener vectores comparables entre sí y con consultas de texto.
- **Deduplicación y clustering de grandes corpus**: los vectores normalizados en L2 permiten similitud coseno directa; el truncado a 128 dimensiones reduce el índice a una fracción del tamaño con pérdida controlada, adecuado para agrupar millones de documentos cortos.
- **Clasificación zero-shot por prototipos**: se generan embeddings de descripciones de categoría y se asigna cada documento a la clase del prototipo más cercano, sin entrenamiento adicional; útil para triaje de tickets o etiquetado de catálogos.
- **Recomendación y similitud ítem-ítem**: con lotes de un solo paso por petición, se pueden recalcular vectores de productos o artículos y servir recomendaciones por vecindad en tiempo real (34 ms por embedding individual medidos en RTX 4070 SUPER).
- **Detección de contenido duplicado o casi duplicado en pipelines de ingesta**: comparación de vectores con umbral sobre similitud coseno, con la ventaja de que el modelo es multilingüe y cubre pares de documentos en idiomas distintos.
- **Despliegue en entornos con VRAM limitada**: al ocupar menos de 1 GB en pesos, cabe en GPUs de consumo y en configuraciones CPU (`make cpu`), lo que permite ejecutar el indexador en la misma máquina que el servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni MTEB, ni métricas de recuperación como nDCG o recall@k). La model card menciona "gate evidence" en el repositorio del proyecto, pero no reproduce cifras en la ficha.

Las únicas cifras objetivas disponibles son mediciones de rendimiento de inferencia declaradas por el autor:

| Medicion | Valor | Entorno |
|---|---|---|
| Latencia de embedding individual | ~34 ms | RTX 4070 SUPER, CLI `--embed` |
| Throughput en lote | 76.504 tokens en 19,0 s (~4.029 tokens/s) | RTX 4070 SUPER, 143 paginas |
| Dimension de salida | 768 (truncable a 512 / 256 / 128) | — |

No hay datos comparativos de calidad (pérdida por cuantización VQ 4-bit frente al modelo base en fp16/bf16) en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos suman 437,5 MB (torre de texto) y 367,1 MB (torre de visión). Con activaciones y buffers de contexto, una estimación conservadora es de 1-2 GB de VRAM en modo texto y 2-3 GB con la ruta de visión activada. Los pesos en 4 bits suponen ~196 MB teóricos de matriz, pero el fichero real incluye libros de códigos y escalares.
- **GPU recomendadas**: cualquier GPU con soporte CUDA de arquitectura razonablemente moderna. El autor documenta `make cuda CUDA_ARCH=sm_89` y `make cuda-generic` para detección automática. Mediciones publicadas en RTX 4070 SUPER (Ada, sm_89).
- **Cabe en GPU de consumo**: sí. Es un modelo de ~392 M parámetros en 4 bits; cualquier GPU con 4 GB o más de VRAM debería poder ejecutarlo, y existe compilación solo CPU (`make cpu`) para entornos sin GPU.
- **Opciones de despliegue**: exclusivamente el motor ds4-rs. Dos binarios: `ds4` (CLI, modos `--embed`, `--embed-file`, `--embed-stdin`) y `ds4-server` (HTTP, endpoints `/v1/embeddings` y `/health`, con `--backend cuda` o CPU). **No es compatible con llama.cpp, Ollama, vLLM ni TGI**: el fichero declara `general.architecture = gemma_vq` y payloads `vqblob` de tipo 42 que esos motores rechazan.
- **Latencia y throughput medidos**: ~34 ms por embedding individual; ~4.029 tokens/s en lote sobre 143 páginas en una RTX 4070 SUPER.
- **Restricción operativa**: CLI y servidor toman el mismo bloqueo de modelo a nivel de máquina, por lo que no pueden ejecutarse simultáneamente. `GET /health` informa de `item_tokens_max`, `batch_rows_max` y la ventana de imagen del contrato activo.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros artefactos comparables (ni de embeddings cuantizados en formato ds4, ni de cifras de benchmarks del propio modelo base). La única comparación documentable es contra el modelo del que deriva:

| Modelo | Parametros | Dimension de salida | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jlfn/embeddinggemma2-vq4x4096-q80token | 392.361.397 | 768 (512/256/128) | no disponible | VQ 4-bit, codebook 4096 | apache-2.0 | GGUF propietario, solo motor ds4 |
| google/embeddinggemma-2 (base) | no disponible en la informacion | 768 (misma salida declarada) | no disponible en la informacion | pesos originales (precision no indicada) | apache-2.0 (segun la model card del artefacto) | HuggingFace, ecosistema estandar |
| Otros modelos de embeddings multilingues (p. ej. familias tipo E5, BGE-M3, multilingual-e5) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la busqueda web otros artefactos ds4-rs comparables ni resultados de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Incompatibilidad con el ecosistema GGUF estándar**: el fichero no se puede cargar en llama.cpp, Ollama, vLLM ni TGI. Exige compilar `ds4-rs` desde el repositorio, lo que introduce dependencia de un proyecto de autor único y riesgo de mantenimiento.
- **Sin validación de la comunidad**: 0 descargas y 0 likes en el momento de la ficha. No hay evidencia independiente de calidad ni de reproducibilidad de las mediciones declaradas.
- **Sin benchmarks publicados**: no hay datos de MTEB ni de recuperación (nDCG, recall@k) que cuantifiquen la pérdida de calidad introducida por la cuantización VQ 4-bit frente al modelo base. Las "gate evidence" del repositorio no se reproducen en la ficha.
- **Una sola cuantización disponible**: no se distribuye una versión fp16/bf16 del mismo contenedor con la que comparar en producción.
- **Riesgo de alucinación**: no aplica en el sentido generativo (el modelo no produce texto), pero sí existe riesgo de **falsos positivos en similitud**: vectores próximos no garantizan relevancia real, y el truncado a 128 dimensiones puede degradar la separación entre documentos temáticamente cercanos.
- **Restricciones de la ruta multimodal**: solo se admite una imagen por elemento, el texto debe marcar la posición con `<|image|>`, y el data URI base64 de una página completa excede el límite de argumentos del shell, obligando a construir el JSON desde fichero.
- **Sin lectura de PDF**: el pipeline exige convertir previamente con `pdftotext` (capa de texto) o `pdftoppm` (escaneos).
- **Bloqueo de modelo a nivel de máquina**: no se puede tener el CLI y el servidor activos a la vez en el mismo host.
- **Longitud de contexto no documentada**: debe consultarse `item_tokens_max` en `/health` antes de dimensionar el troceado; asumir un valor puede provocar truncamientos silenciosos.
- **Sesgos del modelo base**: la model card del artefacto no documenta la composición del dataset de entrenamiento de `google/embeddinggemma-2`, por lo que no se pueden enumerar sesgos conocidos por idioma, dominio o demografía.
- **Licencia**: el artefacto declara apache-2.0, heredado del modelo base según la propia ficha. Conviene verificar los términos upstream de EmbeddingGemma antes de un uso comercial, ya que las familias Gemma han usado históricamente licencias propias.
- **Fecha de publicación adelantada (2026-10-20)** respecto a la fecha habitual de referencia: conviene comprobar la vigencia y el estado del repositorio antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jlfn/embeddinggemma2-vq4x4096-q80token
- Modelo base: https://huggingface.co/google/embeddinggemma-2 (revision `914f7f89142e33e77833254d9c9b90c3cef7303b`)
- Repositorio del proyecto (herramientas, receta y evidencia de gates): https://github.com/JLFN/embeddinggemma2
- Motor que lo ejecuta (Rust + C/CUDA): https://github.com/JLFN/embeddinggemma2-ds4-rs
- Guia de uso paso a paso con cada comando medido: https://github.com/JLFN/embeddinggemma2/blob/dev/docs/USAGE.md
- Receta de cuantizacion completa: https://github.com/JLFN/embeddinggemma2/blob/dev/RECIPE.md
