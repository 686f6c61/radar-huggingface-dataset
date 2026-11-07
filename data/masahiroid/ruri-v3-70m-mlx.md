# masahiroid/ruri-v3-70m-mlx

## Resumen

ruri-v3-70m-mlx es una conversion de formato del checkpoint de embeddings semanticos en japones cl-nagoya/ruri-v3-70m, realizada por el usuario masahiroid y publicada en Hugging Face bajo licencia Apache-2.0. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint original exportado a un runtime nativo de MLX para Apple Silicon, con pooling y normalizacion integrados en el grafo. El modelo base es un ModernBERT de 70 millones de parametros orientado a recuperacion de informacion (retrieval) y similitud semantica en japones.

La relevancia de esta publicacion es puramente de infraestructura: permite ejecutar un modelo de embeddings japones en hardware Apple sin depender de PyTorch, mediante un ejecutor de grafo de formas fijas incluido en el repositorio (`graph_mlx.py`). La validacion numerica reportada frente al checkpoint original en PyTorch es solida: diferencia absoluta maxima de 5,66e-07 y similitud coseno minima de 0,999999999996.

La limitacion principal es que la exportacion fija la longitud de entrada en 128 tokens y el tamano de lote en 1, de modo que no expone el contexto largo que si soporta el checkpoint original. El repositorio ocupa 0,3 GB e incluye los pesos en precision F32, no cuantizados a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer para embeddings) |
| Parametros totales | 70 millones (segun el nombre del checkpoint base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en esta exportacion (el checkpoint original soporta contextos mayores, longitud exacta no disponible) |
| Tipos de cuantizacion | F32 (baseline declarado; no hay version 4-bit en este repo) |
| Idiomas soportados | japones (principal); pruebas incluyen tambien texto en ingles |
| Licencia | Apache-2.0 (pesos); MIT para el codigo de runtime y conversion |
| Formato de pesos | formato propietario MLX dentro del repo (no safetensors ni GGUF); ejecucion via `graph_mlx.py` |
| Dimension del embedding | 384 |
| Tamano del repositorio | 0,3 GB |
| Lote soportado | 1 (formas fijas) |
| Prefijos de retrieval | `検索クエリ: ` (consulta) y `検索文書: ` (documento) |

## Arquitectura y entrenamiento

El modelo base es ModernBERT, una arquitectura de encoder transformer con atencion de complejidad lineal y soporte nativo de longitudes de contexto largas, adaptada aqui a una tarea de representacion densa de frases. El checkpoint cl-nagoya/ruri-v3-70m se entreno especificamente para retrieval y similitud semantica en japones, e incorpora la convencion de prefijos `検索クエリ: ` y `検索文書: ` para distinguir consultas de documentos en el calculo de embeddings. La exportacion aplica mean pooling con conciencia de mascara (`mask-aware mean pooling`) seguida de normalizacion L2, de modo que la salida es un vector unitario de 384 dimensiones listo para similitud coseno.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card de esta conversion no los detalla y el checkpoint original no se incluye en la informacion proporcionada. La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en el runtime: un ejecutor de grafo de formas fijas implementado integramente en MLX (sin delegar en PyTorch), que replica el comportamiento del checkpoint original con una fidelidad numerica practicamente exacta. El autor declara explicitamente que no se ha realizado ningun fine-tuning ni sustitucion de pesos.

## Capacidades

- Generacion de embeddings densos de 384 dimensiones para texto japones, normalizados en L2.
- Recuperacion de informacion (retrieval) consulta-documento mediante prefijos especificos.
- Similitud semantica y ranking de pares consulta-documento.
- Procesamiento de texto en japones y, segun las pruebas de validacion incluidas, tambien en ingles.
- Manejo de entradas vacias sin fallo (caso cubierto en la validacion).
- Inferencia nativa en MLX sobre Apple Silicon, sin dependencia de PyTorch en tiempo de ejecucion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo.
- No dispone de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Busqueda semantica en corpus japoneses: indexar documentos como embeddings de 384 dimensiones y recuperar por similitud coseno usando el prefijo `検索文書: ` para los documentos y `検索クエリ: ` para las consultas, tal como espera el checkpoint.
- Sistemas RAG sobre documentacion en japones en aplicaciones de escritorio para macOS: al ejecutarse en MLX sobre Apple Silicon, el modelo puede generar embeddings localmente sin enviar datos a la nube, lo que resulta adecuado para corpus sensibles.
- Deduplicacion y agrupamiento de textos japoneses: calcular embeddings de cada registro y agrupar por similitud para detectar duplicados o near-duplicates en bases de datos de contenido.
- Clasificacion y filtrado por similitud: comparar una consulta contra un conjunto de etiquetas o descripciones precalculadas para enrutar tickets o articulos hacia la categoria mas proxima semanticamente.
- Prototipado rapido en portatiles Apple: el tamano de 70 millones de parametros y el repo de 0,3 GB permiten cargar el modelo en memoria de forma inmediata para experimentar con pipelines de retrieval sin infraestructura GPU.
- Evaluacion comparativa de runtimes: servir como referencia para medir la fidelidad de conversiones MLX frente a PyTorch, dado que el repositorio incluye vectores de validacion deterministas (`*_validation_vectors.npz`) y resultados por caso en `validation.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea (MTEB, JMTEB u otros) en la informacion disponible. El unico dato de rendimiento reportado es la fidelidad de la conversion frente al checkpoint original en PyTorch:

| Metrica de validacion | Valor |
|---|---|
| Diferencia absoluta maxima de salida | 5,6624413e-07 |
| Similitud coseno minima | 0,999999999996 |

El autor declara explicitamente que no se reclama ninguna mejora en calidad de tarea, robustez ni velocidad en dispositivo.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (el runtime es MLX nativo); no se indica compatibilidad con GPU NVIDIA o AMD.
- VRAM o memoria unificada estimada: no disponible de forma explicita; con 70 millones de parametros en F32 el peso de los pesos ronda los 0,28 GB, por lo que el modelo cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior.
- GPU recomendadas: no aplica en el sentido convencional; el modelo esta pensado para el chip integrado de equipos Apple (series M).
- Cabe en GPU de consumo: si, en el sentido de que cualquier Mac Apple Silicon moderna puede ejecutarlo; no hay soporte documentado para RTX 4090, A100 o H100 en este formato.
- Opciones de despliegue: el runtime incluido `graph_mlx.py` con la clase `ConvertedModel` del modulo `inference.py`; no es compatible con vLLM, llama.cpp, Ollama ni TGI. Existen conversiones alternativas a ONNX publicadas por otros autores (keisuke-miyako/ruri-v3-70m-onnx y ruri-v3-70m-onnx-fp32) para otros entornos.
- Dependencias probadas: MLX 0.32.4, Transformers 4.57.3, NumPy 1.26.4.
- Latencia y throughput: no disponibles; el lote fijo de 1 y la longitud fija de 128 tokens limitan el rendimiento en escenarios de indexacion masiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| masahiroid/ruri-v3-70m-mlx | 70 M | 128 tokens (exportacion) | MLX propietario | Apache-2.0 (pesos) / MIT (codigo) | Conversion F32 para Apple Silicon, lote 1 |
| cl-nagoya/ruri-v3-70m (original) | 70 M | Mayor que 128 (valor exacto no disponible) | PyTorch / safetensors (no confirmado en la informacion) | Apache-2.0 | Checkpoint fuente; soporta contextos mas largos |
| keisuke-miyako/ruri-v3-70m-onnx-fp32 | 70 M | No disponible | ONNX FP32 | No disponible | Conversion alternativa para entornos ONNX |
| masahiroid/ruri-v3-70m-coreml | 70 M | 128 tokens | Core ML | Apache-2.0 (pesos) / MIT (codigo) | Misma conversion por el mismo autor para Core ML |

## Limitaciones y advertencias

- La exportacion fija la entrada en 128 tokens y el lote en 1: textos mas largos se truncan, lo que puede degradar la calidad del embedding en documentos extensos aunque el checkpoint original soporte contextos mayores.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento; usarlo fuera de tareas de embedding o similitud no es adecuado.
- El modelo esta orientado al japones; su rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Es un runtime personalizado, no un checkpoint compatible con `mlx-lm` ni `mlx-embeddings`, lo que limita la integracion con ecosistemas estandar y obliga a revisar el codigo Python incluido antes de ejecutarlo, tal como advierte el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias en dominios alejados de los datos de entrenamiento del checkpoint original.
- Sesgos: no disponibles; no se documenta ninguna evaluacion de sesgo en la informacion proporcionada.
- Licencia: los pesos son Apache-2.0 segun la model card del modelo fuente, lo que permite uso comercial; el codigo de runtime y conversion es MIT. Conviene verificar los ficheros `LICENSE` y `CODE_LICENSE` incluidos en el repositorio antes de un despliegue en produccion.
- La fecha de creacion del repositorio (2026-11-07) y las versiones de dependencias citadas (PyTorch 2.14.1, coremltools 9.0) deben contrastarse con el estado real del ecosistema antes de reproducir la conversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/masahiroid/ruri-v3-70m-mlx
- Checkpoint original: https://huggingface.co/cl-nagoya/ruri-v3-70m
- Revision exacta del checkpoint fuente: https://huggingface.co/cl-nagoya/ruri-v3-70m/tree/07a8b0aba47d29d2ca21f89b915c1efe2c23d1cc
- Conversion Core ML del mismo autor: https://huggingface.co/masahiroid/ruri-v3-70m-coreml
- Conversion Core AI del mismo autor: https://huggingface.co/masahiroid/ruri-v3-70m-coreai
- Conversion ONNX de terceros: https://huggingface.co/keisuke-miyako/ruri-v3-70m-onnx
- Conversion ONNX FP32 de terceros: https://huggingface.co/keisuke-miyako/ruri-v3-70m-onnx-fp32
