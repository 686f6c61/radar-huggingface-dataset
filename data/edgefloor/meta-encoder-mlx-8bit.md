# edgefloor/meta-encoder-mlx-8bit

## Resumen

MetaEncoder MLX 8-bit es una conversión al formato MLX del modelo facebook/meta-encoder, un codificador multimodal de aproximadamente 30.000 millones de parámetros cuyo propósito es puntuar y ordenar candidatos frente a una tarea descrita en lenguaje natural. No es un modelo generativo: se trata de un codificador de extracción de características que produce embeddings de 6.656 dimensiones y calcula la similitud entre una tarea y una lista de candidatos mediante producto interno. La conversión la publica el usuario edgefloor y está pensada para ejecución en Apple silicon mediante MLX y MLX-VLM.

La cuantización afecta únicamente a las capas lineales de la torre de lenguaje, los embeddings de tokens y la cabeza de lenguaje, que pasan a cuantización afín de 8 bits con group size 64. La torre de visión, el adaptador y la proyección de visión, así como los pesos de normalización, se mantienen en BF16. El resultado son ficheros de pesos de 33,44 GB (31,14 GiB) dentro de un repositorio de 33,5 GB.

Su relevancia es acotada pero específica: permite ejecutar un codificador multimodal de gran tamaño con la pila MLX en hardware de Apple sin recurrir a PyTorch para la inferencia, a cambio de una paridad de precisión que el propio autor reconoce no haber medido a nivel de modelo completo. Es un artefacto de conversión, no un fine-tuning, y el wrapper PyTorch original no puede cargar directamente estos pesos cuantizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador) con torre de visión, adaptador y proyección de visión más torre de lenguaje; arquitectura "Muse Glimmer" según la validación de MLX-VLM |
| Parametros totales | 29.776.626.688 (~29,78 B) |
| Parametros activos | No aplica (modelo denso; no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín de 8 bits con group size 64 en capas lineales de lenguaje, embeddings de tokens y cabeza de lenguaje; visión, adaptador, proyección y normalización en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta a la política de uso del modelo base) |
| Formato de pesos | safetensors (MLX) |
| Dimension de embedding | 6.656 (vectores float32 normalizados en L2) |
| Tamano del repositorio | 33,5 GB (ficheros de pesos: 33,44 GB / 31,14 GiB) |
| Modelo base | facebook/meta-encoder (revision 3d0df704aa5bf66d9c49da1393181f33e893e5f7) |
| Libreria | mlx (MLX-VLM) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base facebook/meta-encoder: un codificador multimodal que combina una torre de visión, un adaptador y una proyección de visión con una torre de lenguaje. La conversión valida los nombres y las formas de los tensores contra la arquitectura "Muse Glimmer" de MLX-VLM. El modelo no genera tokens: agrupa el último estado oculto del último token (pooling del último token), evita calcular logits de vocabulario y redondea las frecuencias rotatorias a BF16, replicando el comportamiento del wrapper original de MetaEncoder. La salida son vectores de 6.656 dimensiones normalizados en L2 en float32, y las puntuaciones se obtienen como producto interno entre esos vectores.

Esta ficha describe una conversión de pesos, no un entrenamiento nuevo. El autor indica explícitamente que no se ha hecho fine-tuning: solo se cambia el almacenamiento de pesos y se añade un wrapper de inferencia en MLX. Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) corresponden al modelo base facebook/meta-encoder y no se detallan en la información disponible. El procesamiento previo sigue usando el processor original de Transformers; la inferencia se ejecuta por MLX. Los elementos aceptados como entrada son texto, imágenes PIL y diccionarios con las claves `text`, `instruction`, `image`, `images` o `video`; un vídeo se representa como una lista de fotogramas PIL pre-muestreados a 2 FPS. Cada elemento se codifica de forma individual para evitar que el padding entre en las máscaras de atención del decodificador de MLX-VLM.

## Capacidades

- Extracción de embeddings multimodales: genera vectores de 6.656 dimensiones normalizados en L2 en float32 a partir de texto e imágenes.
- Ranking de candidatos frente a una tarea en lenguaje natural: devuelve puntuaciones por producto interno entre la consulta y los candidatos.
- Coincidencia texto-imagen: acepta pares de instrucción textual e imagen PIL, por ejemplo para elegir qué descripción corresponde a una foto.
- Coincidencia texto-vídeo: acepta listas de fotogramas PIL pre-muestreados a 2 FPS.
- Instrucciones mixtas: admite diccionarios con `text`, `instruction`, `image`, `images` o `video`.
- Similitud semántica reutilizable: los embeddings pueden almacenarse y compararse por producto interno.
- Ejecución en Apple silicon mediante MLX y MLX-VLM, con validación estricta de pesos.
- No se documentan capacidades de generación de texto, tool calling, razonamiento multi-paso ni agentes; el pipeline declarado es feature-extraction.

## Casos de uso

- Clasificación zero-shot de texto: dada una tarea como "¿Qué animal dice miau?" y una lista de candidatos ("cat", "dog", "horse"), el modelo puntúa y ordena cada opción; el autor reporta que eligió el primer candidato esperado en 4 de 4 comprobaciones simples.
- Búsqueda de imágenes por descripción: con dos o más descripciones en lenguaje natural y una imagen, el modelo puntúa qué texto encaja mejor, útil para etiquetado automático o filtrado de catálogos.
- Recuperación multimodal (retrieval): almacenando los embeddings de 6.656 dimensiones se puede construir un índice vectorial para búsqueda texto-imagen o imagen-imagen mediante producto interno.
- Deduplicación y agrupamiento de contenido: al comparar embeddings de textos e imágenes se pueden agrupar elementos similares o detectar duplicados con un umbral de similitud.
- Filtrado y selección de candidatos en pipelines: el modelo puede actuar como etapa de reordenación (reranking) sobre resultados preliminares producidos por un recuperador más ligero.
- Procesamiento de vídeo por muestreo: extrayendo fotogramas a 2 FPS se pueden generar embeddings de fragmentos de vídeo para búsqueda o coincidencia con consultas textuales.
- Evaluación de correspondencia instrucción-contenido: en tareas de anotación, se puede comprobar automáticamente qué descripción encaja mejor con un activo visual concreto.
- Despliegue local en Apple silicon: para flujos que exigen procesar contenido sin salir del equipo, la pila MLX permite ejecutar la inferencia en un Mac con memoria unificada suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta validaciones locales que no constituyen un benchmark:

| Validacion | Resultado reportado |
|---|---|
| Carga del checkpoint con validación estricta de pesos de MLX-VLM | Correcta |
| Comprobaciones de texto, imagen y vídeo de dos fotogramas | Embeddings finitos y de longitud unitaria |
| Selección del primer candidato esperado en tareas simples | 4 de 4 |
| Similitud coseno frente a referencia BF16 en streaming de MLX (una tarea de texto) | 0,999659 |
| Paridad a nivel de modelo completo con la implementación oficial de Transformers | No medida |
| Acuerdo coseno de arquitectura pequeña sin cuantizar con Transformers (texto e imagen) | Superior a 0,999 |

El autor indica que la cifra de 0,999659 mide la deriva de cuantización para esa entrada concreta y que no es un benchmark. Las métricas detalladas (prompts, puntuaciones, tiempos y memoria) se encuentran en `validation.json`, pero sus valores no se reproducen en esta ficha.

## Requisitos de hardware

- Tamaño de pesos del checkpoint cuantizado: 33,44 GB (31,14 GiB), frente a los aproximadamente 60 GB que ocuparía el modelo base en BF16.
- Memoria unificada estimada: dado que MLX reside en memoria unificada, se necesita un Mac con al menos 64 GB para cargar los 33,44 GB de pesos más el espacio de trabajo, aunque no se han publicado mediciones de consumo en la información disponible.
- GPU compatibles: MLX está orientado a Apple silicon (M-series). No se documenta soporte para A100, H100 ni RTX 4090 en esta conversión.
- Compatibilidad con GPU de consumo: apto para equipos Apple con memoria unificada suficiente; no cabe en GPUs de consumo con VRAM convencional sin portar los pesos a otro runtime.
- Opciones de despliegue: MLX y MLX-VLM mediante el runner incluido (`metaencoder_mlx.py`). El wrapper PyTorch original no puede cargar directamente estos pesos cuantizados. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El fichero `validation.json` registra tiempos, pero sus valores no se incluyen en la información proporcionada.
- Dependencias: se recomienda instalar `requirements.txt` del repositorio; PyTorch se usa solo para el procesamiento y Transformers aporta el processor original.

## Comparativa con modelos similares

La información disponible solo permite comparar con el propio modelo base. No se detallan alternativas comparables en tamaño, contexto o licencia.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edgefloor/meta-encoder-mlx-8bit | 29,78 B | no disponible | 8-bit afín (group size 64), visión en BF16 | Apache-2.0 | HuggingFace, runtime MLX |
| facebook/meta-encoder (base) | no indicado de forma explícita en la información disponible (aproximadamente 30 B según el autor) | no disponible | BF16 | Apache-2.0 | HuggingFace, wrapper PyTorch |
| Otras alternativas multimodales de embeddings | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: produce embeddings y puntuaciones, no texto; no sirve para chat ni para generación de código.
- Paridad de precisión no verificada: la igualdad con la implementación oficial de Transformers no se ha medido a nivel de modelo completo; solo hay una comprobación de similitud coseno para una tarea de texto concreta.
- Deriva de cuantización: las capas de lenguaje están en 8 bits, lo que introduce una desviación respecto a BF16 (0,999659 de similitud coseno en el caso medido).
- Compatibilidad restringida: el wrapper PyTorch original no puede cargar los pesos cuantizados; la inferencia está atada a MLX.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con entradas largas.
- Riesgo de alucinación: al no generar texto libre, el riesgo se traslada a puntuaciones mal calibradas o candidatos ordenados de forma incorrecta; no se han publicado métricas de calibración.
- Sesgos: no hay información sobre sesgos del modelo base ni evaluaciones al respecto.
- Validación limitada: las pruebas reportadas son de tipo smoke test sobre 4 comprobaciones y no cubren dominios amplios.
- Uso comercial: la licencia es Apache-2.0, pero el autor recuerda que sigue sujeta a la política de uso del modelo base; se conservan `LICENSE`, `NOTICE` y `USAGE_POLICY.md`.
- Popularidad: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad ni soporte documentado.
- Fecha de creación y actualización: 2026-10-09 en ambos casos, según los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edgefloor/meta-encoder-mlx-8bit
- Modelo base: https://huggingface.co/facebook/meta-encoder
- Repositorio fuente (revision utilizada por el autor): 3d0df704aa5bf66d9c49da1393181f33e893e5f7
- Ficheros citados en el repositorio: `requirements.txt`, `metaencoder_mlx.py`, `convert_metaencoder.py`, `conversion.json`, `validation.json`, `upstream_metaencoder.py`, `LICENSE`, `NOTICE`, `USAGE_POLICY.md`
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados disponibles versan sobre ChatGPT y no guardan relación).
