# heykorshun/multilingual-e5-large-mlx-int8

# Multilingual-e5-large-mlx-int8 (8 bits, MLX Swift)

## Resumen

multilingual-e5-large-mlx-int8 es una conversión a 8 bits del modelo de embeddings `intfloat/multilingual-e5-large`, publicada por el usuario heykorshun bajo licencia MIT. No se trata de un modelo entrenado desde cero ni de un *fine-tuning*: es una recuantización de los pesos originales en formato fp32, realizada con la librería MLX de Apple (`MLXNN.quantize`, esquema affine, 8 bits, group size 64), y guardada como un único `model.safetensors` acompañado de un `quantization.json`. El resultado ocupa 0,63 GB en disco frente a los aproximadamente 2,2 GB del checkpoint fp32.

El objetivo es disponer de un embedder multilingüe con calidad de *retrieval* que funcione de forma totalmente local en equipos con silicio Apple (M1 y posteriores), sin depender de servicios en la nube. La model card indica que fue creado para Stilltone, una aplicación de notas de reunión *local-first* para macOS, donde se usa como embedder multilingüe para recuperar elementos de memoria relacionados.

Su relevancia es acotada pero clara: sirve a desarrolladores que trabajan con MLX o MLX Swift y necesitan un modelo de similitud de frases multilingüe compacto. La contrapartida es que **no es un checkpoint de Transformers**: no se puede cargar con `transformers` ni con `sentence-transformers` directamente, y exige reconstruir el módulo y cuantizarlo antes de cargar los tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer bidireccional); pesos derivados de `intfloat/multilingual-e5-large` |
| Parametros totales | 157.701.024 (suma de tensores del safetensors cuantizado; no equivale al recuento nominal del modelo base, ver advertencias) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits, modo affine, group size 64 (MLX) |
| Idiomas soportados | multilingue (el modelo base cubre mas de 100 idiomas); lista concreta no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con parametros MLX (`weight` / `scales` / `biases`); cargable con MLX Swift, no con Transformers |
| Libreria declarada | `mlx` (MLX Swift) |
| Pipeline | `sentence-similarity` (embeddings de frases) |
| Modelo base | `intfloat/multilingual-e5-large` (revision `3d7cfbdacd47fdda877c5cd8a79fbcc4f2a574f3`) |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo. La operación realizada consistió en cargar los pesos fp32 del modelo base con el *loader* propio de MLX Swift de Stilltone y cuantizarlos en memoria con `MLXNN.quantize` en modo affine a 8 bits, group size 64, aplicado a sus capas `Linear` y `Embedding` por defecto. Los parámetros resultantes se guardaron sin modificar en `model.safetensors`, y `quantization.json` registra el esquema (`{"bits": 8, "groupSize": 64, "mode": "affine"}`). Los ficheros `config.json`, `tokenizer.json`, `tokenizer_config.json` y `special_tokens_map.json` se copiaron sin cambios desde la revisión fuente, por lo que la arquitectura efectiva y el tokenizador son idénticos a los del modelo base.

Como validación, el autor ejecutó el benchmark *memory-diff* de Stilltone sobre cuatro paquetes (inglés, checo y un paquete parlamentario multilingüe), que pone a prueba conjuntamente el embedder, el reranker y el modelo NLI. Según la model card, los resultados con estos ficheros cuantizados y con los pesos fp32 originales fueron **byte-identical**. No se documentan en la información disponible ni el número de tokens de entrenamiento del modelo base (que es anterior y ajeno a este repositorio) ni procesos de RLHF o DPO.

## Capacidades

- Generacion de *embeddings* de frases y parrafos para tareas de similitud semantica (`sentence-similarity`).
- Recuperacion de informacion (*retrieval*) en configuraciones RAG, con busqueda densa por similitud coseno.
- Clustering y deduplicacion de textos por cercania en el espacio de embeddings.
- Clasificacion de texto si se anade una cabeza lineal sobre las representaciones, aunque no se distribuye ninguna.
- Soporte multilingue heredado del modelo base (E5 multilingue), sin lista de idiomas confirmada en este repositorio.
- Convencion de prefijos del modelo base E5 (`query:` para consultas y `passage:` para pasajes), al conservar el tokenizador y los pesos originales.
- Ejecucion local en Apple Silicon mediante MLX Swift.

No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, *tool calling* ni capacidades de agente: es un modelo exclusivamente de representacion, no un modelo generativo.

## Casos de uso

- Busqueda semantica local en macOS: indexar documentos con los embeddings y responder consultas por similitud sin enviar datos a un servicio externo; el modelo cabe en menos de 1 GB de memoria unificada y funciona enteramente en el equipo.
- Recuperacion de memoria en aplicaciones de notas: tal como lo emplea Stilltone, se pueden recuperar notas o fragmentos relacionados con la reunion en curso en varios idiomas a partir de la transcripcion.
- RAG local con privacidad estricta: usar el embedder para el paso de recuperacion de un pipeline RAG en el que ni los documentos ni las consultas salen del Mac.
- Deduplicacion y agrupacion de documentos multilingues: calcular embeddings de un corpus y agrupar por similitud para eliminar duplicados o clasificar tematicamente sin etiquetas.
- Clasificacion de tickets o mensajes: generar embeddings y entrenar un clasificador ligero encima para enrutar soporte en varios idiomas.
- Filtrado y moderacion por similitud: comparar entradas de usuario contra un conjunto de ejemplos problematicos conocidos para marcar coincidencias.
- Motores de recomendacion por contenido: representar articulos, productos o publicaciones como vectores y recomendar por cercania semantica sin depender de modelos en la nube.
- Investigacion reproducible en Mac: banco de pruebas para comparar calidad de recuperacion entre pesos fp32 y 8 bits en el mismo hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica validacion descrita es interna y cualitativa respecto a la fidelidad de la cuantizacion: el benchmark *memory-diff* de Stilltone (packs de ingles, checo y parlamento multilingue) produjo resultados byte-identical entre estos pesos de 8 bits y los pesos fp32 originales. No se aportan cifras de MMLU, MTEB, BEIR, ni de latencia o throughput.

## Requisitos de hardware

- Almacenamiento: 0,6 GB de repositorio; el archivo de pesos cuantizado ocupa aproximadamente 0,63 GB (frente a ~2,2 GB en fp32).
- Memoria en inferencia: inferior a 1 GB de memoria unificada, dado el tamano de los pesos y el esquema de 8 bits.
- Plataforma: MLX y MLX Swift estan pensados para Apple Silicon (M1 y posteriores) sobre macOS; no se contempla aceleracion CUDA en la informacion disponible.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; estos pesos no se cargan en esos *stacks*.
- GPU de consumo: si, cualquier Mac con chip de la serie M; el modelo es lo bastante pequeno para ejecutarse junto al resto de la aplicacion.
- Opciones de despliegue: MLX Swift mediante `MLXEmbedders` (es el unico camino documentado). No es compatible con vLLM, llama.cpp, Ollama ni TGI en el formato distribuido aqui; para esos entornos hay que usar el modelo base original.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Compatibilidad | Licencia |
|---|---|---|---|---|---|
| heykorshun/multilingual-e5-large-mlx-int8 | 157.701.024 (tensores cuantizados) | no disponible | safetensors MLX, 0,63 GB | MLX Swift | MIT |
| intfloat/multilingual-e5-large (original) | ~550 M (derivado de los ~2,2 GB en fp32 indicados en la model card) | no disponible | safetensors fp32, ~2,2 GB | transformers, sentence-transformers | MIT |
| intfloat/multilingual-e5-base | no disponible en la informacion proporcionada | no disponible | no disponible | transformers, sentence-transformers | MIT |
| intfloat/multilingual-e5-small | no disponible en la informacion proporcionada | no disponible | no disponible | transformers, sentence-transformers | MIT |

La comparacion principal es entre este repositorio y el modelo base: comparten pesos, tokenizador y licencia, y difieren en cuantizacion (8 bits frente a fp32), tamano y *stack* de ejecucion. Las variantes `base` y `small` de la familia E5 existen como alternativas de menor coste, pero sus especificaciones no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Formato no estandar: los ficheros son pesos de MLX Swift, no un checkpoint de Transformers. Para cargarlos hay que construir el mismo modulo, llamar antes a `quantize(model:groupSize:64,bits:8,mode:.affine)` y despues cargar los arrays; de lo contrario fallara la carga. No funciona con `transformers` ni `sentence-transformers`.
- Recuento de parametros enganoso: los 157.701.024 del safetensors corresponden a la suma de tensores del archivo cuantizado y no al recuento nominal del modelo base (que, segun los ~2,2 GB en fp32, rondaria los 550 M). No debe usarse esa cifra para estimar el tamano real del modelo original.
- Ausencia de validacion externa: el repositorio tiene 0 descargas y 0 *likes*, y la unica prueba descrita es interna del autor. No hay evaluacion independiente de la calidad de recuperacion tras cuantizar a 8 bits.
- Longitud de contexto no confirmada: no se documenta en la informacion disponible, por lo que no se puede garantizar el comportamiento con textos largos sin consultar la configuracion del modelo base.
- Cobertura de idiomas no listada: el modelo es multilingue por herencia, pero este repositorio no enumera los idiomas soportados ni su calidad por lengua.
- Sin numeros de rendimiento: no hay benchmarks publicos (MTEB, BEIR u otros) ni cifras de latencia o throughput.
- Naturaleza no generativa: no produce texto, codigo ni razonamiento; no soporta *tool calling* ni flujos de agente. Tareas como la generacion de respuestas requieren un LLM aparte.
- Riesgo de falsos positivos en similitud: como todo embedder, puede asignar alta similitud a textos superficialmente parecidos pero semanticamente distintos; conviene calibrar umbrales con datos propios.
- Dependencia de plataforma: al estar en formato MLX Swift, solo es utilizable en el ecosistema Apple; limita su portabilidad a servidores Linux con GPU.
- Metadatos incoherentes: las fechas de creacion y actualizacion del repositorio (2026) resultan anomales, lo que sugiere que no conviene fiarse de los campos temporales del registro.
- Licencia: MIT, igual que el modelo base, por lo que permite uso comercial; aun asi, la atribucion corresponde a los autores originales (Wang et al., 2024).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heykorshun/multilingual-e5-large-mlx-int8
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio MLX Swift: https://github.com/ml-explore/mlx-swift
- Referencia citada en la model card: Wang et al., *Multilingual E5 Text Embeddings*, 2024 (paper del modelo base; no se incluye enlace directo en la informacion disponible).
