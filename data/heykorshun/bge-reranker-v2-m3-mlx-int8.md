# heykorshun/bge-reranker-v2-m3-mlx-int8

## Resumen

`heykorshun/bge-reranker-v2-m3-mlx-int8` es una version cuantizada a 8 bits del reranker multilingue `BAAI/bge-reranker-v2-m3`, publicada por el usuario heykorshun en formato MLX Swift. No se trata de un modelo nuevo ni de un reentrenamiento: el autor carga los pesos originales en fp32 con su propio cargador de MLX Swift, los cuantiza en memoria con `MLXNN.quantize` (afin, 8 bits, group size 64) y guarda los parametros resultantes sin modificaciones en `model.safetensors`. El resultado ocupa 0,64 GB frente a los aproximadamente 2,2 GB del checkpoint fp32, y el repositorio completo pesa 0,7 GB.

El modelo deriva del tag `xlm-roberta` y esta etiquetado como `text-classification`, por lo que se usa como cross-encoder de reranking: recibe pares consulta-documento y devuelve una puntuacion de relevancia. La model card indica que se emplea en Stilltone, una aplicacion de notas de reunion local-first para macOS, como reranker multilingue dentro de un pipeline que combina un embedder, este reranker y un modelo de NLI, todo ejecutandose en el propio Mac. Su relevancia actual es la de permitir reranking de recuperacion (RAG) totalmente en local sobre Apple Silicon, sin enviar datos a servicios externos.

Se trata de un artefacto muy especifico: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados por el autor y con un formato de pesos que solo MLX Swift puede cargar. Es util si el stack ya es MLX sobre macOS; fuera de ese entorno conviene recurrir al repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (segun tag `xlm-roberta`); deriva de `BAAI/bge-reranker-v2-m3` |
| Parametros totales | 160.209.089 (recuento real de safetensors del repositorio; no disponible el recuento del modelo base sin cuantizar) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits, modo affine, group size 64 (`MLXNN.quantize` sobre capas `Linear` y `Embedding` por defecto) |
| Idiomas soportados | no disponible en los metadatos de HuggingFace; la model card lo describe como reranker cross-encoder multilingue y cita validacion con paquetes en ingles, checo y un corpus parlamentario multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con parametros MLX Swift (`weight` / `scales` / `biases` en capas cuantizadas) + `quantization.json`; no compatible con `transformers` ni `sentence-transformers` |

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste fino en este repositorio. La model card describe el proceso completo: los pesos fp32 originales de `BAAI/bge-reranker-v2-m3` (revision `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`) se cargaron con el cargador de MLX Swift de Stilltone y se cuantizaron en memoria aplicando `MLXNN.quantize` en modo affine, 8 bits y group size 64 sobre las capas `Linear` y `Embedding` por defecto. Los parametros del modulo resultante se guardaron sin cambios adicionales, y `quantization.json` registra el esquema con `{"bits": 8, "groupSize": 64, "mode": "affine"}`.

La verificacion se hizo con el benchmark de diferencia de memoria de Stilltone, que ejecuta conjuntamente el embedder, el reranker y el modelo de NLI sobre cuatro paquetes de datos (ingles, checo y un paquete parlamentario multilingue). Segun el autor, los resultados con estos ficheros y con los pesos fp32 originales fueron identicos byte a byte. Los ficheros `config.json`, `tokenizer.json`, `tokenizer_config.json` y `special_tokens_map.json` se copian sin modificar de la revision de origen. Los nombres de parametro siguen el `BertModel` de `MLXEmbedders` tras su paso de `sanitize`.

## Capacidades

- Reranking de pares consulta-documento: es un cross-encoder de clasificacion de texto que puntua la relevancia de un documento respecto a una consulta.
- Operacion multilingue, segun la model card, con validacion sobre paquetes en ingles, checo y un corpus parlamentario multilingue.
- Ejecucion completamente local en macOS sobre Apple Silicon mediante MLX Swift; no requiere red ni servicios externos.
- Integracion en pipelines de recuperacion junto a un embedder y un modelo de NLI, tal y como se usa en Stilltone.
- Uso especifico para determinar si un elemento nuevo de una nota trata realmente sobre un elemento ya existente (deteccion de duplicados tematicos).
- No genera texto: no es un modelo de lenguaje generativo, por lo que no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No hay capacidades declaradas de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Reranking en un pipeline RAG local sobre macOS: se recuperan candidatos con un embedder y este cross-encoder reordena los fragmentos por relevancia antes de pasarlos al modelo generador, manteniendo todos los datos en el equipo.
- Aplicaciones de notas de reunion local-first: Stilltone lo usa para decidir si un item nuevo de la reunion esta realmente relacionado con un item ya registrado, evitando duplicados en el acta.
- Busqueda semantica en corpus multilingues: al ser multilingue, permite ordenar resultados cuando las consultas y los documentos estan en idiomas distintos dentro del mismo indice.
- Deduplicacion y agrupacion de elementos recurrentes: en un historico de notas o tickets, el reranker puntua pares de elementos y permite agrupar los que tratan el mismo asunto.
- Asistente de documentacion interno con requisitos de privacidad: al no salir los datos del Mac, encaja en entornos donde no se permite enviar documentacion a APIs externas.
- Filtrado de resultados en herramientas de escritorio para macOS: cualquier app Swift que ya use MLXEmbedders puede anadir reranking sin incorporar un runtime de Python.
- Preordenacion de fragmentos antes de un resumen: se seleccionan los N fragmentos con mayor puntuacion de relevancia para alimentar un resumidor, reduciendo el ruido de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de calidad aportada es cualitativa y de equivalencia funcional: el benchmark de diferencia de memoria de Stilltone (cuatro paquetes: ingles, checo y un paquete parlamentario multilingue) produjo resultados identicos byte a byte entre estos pesos de 8 bits y los pesos fp32 originales, evaluando embedder, reranker y modelo de NLI en conjunto. No hay cifras de MMLU, HumanEval, GSM8K ni metricas de recuperacion como nDCG o MRR, y al tratarse de un cross-encoder de clasificacion esos benchmarks generativos no serian aplicables.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra de VRAM dedicada, ya que MLX Swift funciona sobre memoria unificada de Apple Silicon. El peso del repositorio es de 0,7 GB y el fichero cuantizado ocupa 0,64 GB, frente a los aproximadamente 2,2 GB del checkpoint fp32.
- GPU recomendadas: no aplica el catalogo habitual de NVIDIA; el destino es Apple Silicon (familia M) mediante MLX Swift.
- Cabe en hardware de consumo: si, cualquier Mac con Apple Silicon y unos pocos GB de memoria libre puede alojar los pesos; no hay datos publicados de latencia ni de memoria pico durante la inferencia.
- Opciones de despliegue: exclusivamente MLX Swift. Es necesario construir el mismo modulo, llamar primero a `quantize(model:groupSize:64,bits:8,mode:.affine)` y despues cargar los arrays, tal y como hace Stilltone cuando detecta `quantization.json`. No es compatible con vLLM, llama.cpp, Ollama, TGI, `transformers` ni `sentence-transformers`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `heykorshun/bge-reranker-v2-m3-mlx-int8` | 160.209.089 (safetensors del repo) | no disponible | safetensors MLX Swift, 8 bits affine group 64 | Apache 2.0 | 0 descargas, 0 likes |
| `BAAI/bge-reranker-v2-m3` (original fp32) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | checkpoint Transformers / sentence-transformers, aproximadamente 2,2 GB | Apache 2.0 | Modelo de referencia de BAAI |
| Otras alternativas de reranking | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa solo puede establecerse con el modelo base: mismos pesos de origen, misma licencia y misma funcion, con la diferencia del formato (MLX Swift frente a Transformers) y del tamano en disco (0,64 GB frente a unos 2,2 GB en fp32). No se dispone de datos de otros rerankers en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos estan en formato MLX Swift, no en formato Transformers: `transformers` y `sentence-transformers` no pueden cargarlos directamente. Para esos entornos hay que usar el repositorio original.
- La carga exige un orden concreto: construir el modulo, cuantizarlo primero con `quantize(model:groupSize:64,bits:8,mode:.affine)` y solo despues cargar los arrays. Omitir ese paso produce una carga incorrecta.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad ni mantenimiento mas alla de la publicacion inicial.
- La equivalencia byte a byte con fp32 solo esta verificada en el benchmark interno de Stilltone sobre cuatro paquetes de datos; no hay evaluacion publica de la perdida de calidad por cuantizacion en otros dominios.
- No es un modelo generativo: no admite generacion de texto, tool calling, function calling ni flujos de agente. Su unica salida es una puntuacion de clasificacion sobre un par de entradas.
- No se especifica la longitud de contexto soportada en la informacion disponible; los documentos largos pueden requerir troceado previo.
- La lista de idiomas no esta declarada en los metadatos de HuggingFace; el caracter multilingue se apoya en la afirmacion de la model card y en la validacion con paquetes en ingles, checo y un corpus parlamentario.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar el fichero `LICENSE` y la atribucion a BAAI, que es el titular del modelo original; este repositorio solo aporta la cuantizacion.
- El recuento de parametros de safetensors (160.209.089) no se corresponde necesariamente con el del modelo base sin cuantizar, cuyo dato no se proporciona.
- Las fechas de creacion y actualizacion de los metadatos (2026-09-24) son llamativas y no han podido contrastarse con ninguna fuente adicional.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/heykorshun/bge-reranker-v2-m3-mlx-int8
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Revision de origen citada en la model card: `953dc6f6f85a1b2dbfca4c34a2796e7dde08d41e`
- Fichero de licencia del repositorio: `LICENSE` (Apache 2.0) dentro del propio repositorio de HuggingFace
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos corresponden a paginas de respuestas de pasatiempos y no guardan relacion con el artefacto.
