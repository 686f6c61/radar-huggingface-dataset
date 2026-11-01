# csdhall/Nanbeige4.3-33B-MLX-6bit

## Resumen

Nanbeige4.3-33B-MLX-6bit es una conversión comunitaria del checkpoint oficial Nanbeige4.3-33B (BF16) a formato MLX con cuantización afín de 6 bits y tamaño de grupo 64, publicada por el usuario csdhall. El modelo base lo desarrolla Nanbeige y se distribuye bajo licencia Apache-2.0; esta variante no ha sido reentrenada ni ajustada, sino cuantizada directamente desde los pesos originales, lo que la convierte en una opción para ejecutar un modelo de 33.118.977.024 parámetros en Apple Silicon con un peso de aproximadamente 26,93 GB.

El interés de esta ficha radica en que permite desplegar localmente un LLM de gran tamaño en hardware de Apple con memoria unificada, sin depender de GPUs dedicadas ni de servicios en la nube. La model card documenta validaciones sobre Metal (paridad de tokenizador, comparaciones numéricas frente a BF16 y pruebas de recuperación a 16.384, 32.768 y 65.536 tokens), aunque advierte de que el contexto publicitado de 524.288 tokens no está verificado a esa longitud.

La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo base es limitada: la model card de esta conversión se centra en el proceso de cuantización y en las condiciones de uso, no en las capacidades del modelo original. Los apartados que dependen de esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia llama segun tags del repo); detalles internos no disponibles |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 524.288 tokens segun metadatos del modelo base; operacion a esa longitud no verificada |
| Tipos de cuantizacion | 6 bits afin, group size 64 (unica variante en este repo) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El repositorio corresponde a una cuantizacion, no a un entrenamiento. La conversion se realizo desde el checkpoint BF16 oficial Nanbeige/Nanbeige4.3-33B (commit c1093c501cc6460427c0ac634db7223d0450c0ee) mediante cuantizacion afin de 6 bits con group size 64, sin partir de una cuantizacion de menor precision y sin fine-tuning posterior. El payload convertido ocupa aproximadamente 26,93 GB en decimal y el repositorio completo 26,9 GB.

No se dispone de informacion sobre la composicion del dataset de entrenamiento del modelo base, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO. La model card de la conversion tampoco detalla innovaciones arquitectonicas del modelo original (atencion, decodificacion especulativa u otras). Lo unico verificable es que los pesos originales en BF16 siguen disponibles en el repositorio del publicador y que esta variante preserva los metadatos de contexto del modelo fuente.

## Capacidades

- Generacion de texto conversacional y text-generation, segun el pipeline declarado.
- Soporte multilingue limitado a ingles y chino (en, zh) segun los metadatos.
- Uso local en Apple Silicon mediante MLX y mlx-lm, con tokenizador y chat template incluidos.
- Ejecucion de inferencia con caches KV en BF16 sin sliding ni rotating cache, segun la validacion realizada.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; no disponibles.
- No se aportan datos sobre rendimiento en codigo, matematicas o razonamiento; no disponibles.

## Casos de uso

- Prototipado local en Mac: ejecutar el modelo con `mlx_lm.generate` sobre un Mac con memoria unificada suficiente permite experimentar con un LLM de 33B sin GPU dedicada, usando las versiones validadas MLX 0.32.4 y mlx-lm 0.32.2.
- Asistentes conversacionales en ingles o chino: el modelo puede gestionar dialogos multi-turno en esos dos idiomas; la ventana de contexto configurable permite mantener historiales largos, aunque la calidad a contextos muy extensos no esta verificada.
- Procesamiento de documentos largos con recuperacion: las pruebas de retrieval a 16.384, 32.768 y 65.536 tokens indican que el modelo puede usarse para tareas de pregunta-respuesta sobre textos extensos dentro de esos rangos.
- Investigacion en cuantizacion: sirve como referencia para estudiar el impacto de la cuantizacion afin de 6 bits con group size 64 frente al BF16 original, ya que la model card documenta comparaciones numericas.
- Desarrollo offline y entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo una vez descargado el modelo, lo que encaja en flujos con datos sensibles.
- Evaluacion de despliegue en Apple Silicon: util para medir requisitos reales de memoria unificada, latencia y comportamiento del tokenizador antes de adoptar el modelo base en produccion.
- Generacion de texto en pipelines de investigacion: integrable en scripts de Python mediante mlx-lm para tareas de sintesis y continuacion de texto en ingles y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta validaciones de correctitud, paridad de tokenizador, comparaciones numericas frente a BF16 y pruebas de retrieval a 16.384, 32.768 y 65.536 tokens en un Mac con 128 GiB de memoria unificada; no son benchmarks downstream ni cifras comparables con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/memoria: el payload pesa aproximadamente 26,93 GB; hay que sumar memoria para el sistema operativo, la cache KV y los buffers del runtime. La model card advierte explicitamente de que el tamano de fichero no es el requisito total de memoria unificada.
- Hardware validado: Mac con 128 GiB de memoria unificada para las pruebas a 16.384, 32.768 y 65.536 tokens con caches KV en BF16.
- GPU dedicadas: no se documenta soporte ni validacion en CUDA; MLX CUDA no fue probado. No hay datos de VRAM para A100, H100 o RTX 4090.
- GPU de consumo: no disponible; el formato MLX esta orientado a Apple Silicon.
- Despliegue: MLX 0.32.4 y mlx-lm 0.32.2 en Apple Silicon, con el comando `python -m mlx_lm.generate --model csdhall/Nanbeige4.3-33B-MLX-6bit`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-6bit | 33.118.977.024 | 524.288 (no verificado) | MLX safetensors 6-bit | Apache-2.0 | Conversion comunitaria para Apple Silicon |
| Nanbeige/Nanbeige4.3-33B | 33.118.977.024 | 524.288 (no verificado) | BF16 safetensors | Apache-2.0 | Modelo base oficial, mayor huella de memoria |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | Apache-2.0 (heredada) | No se han encontrado en la informacion proporcionada |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria; la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- El contexto de 524.288 tokens procede de metadatos del modelo base y no esta verificado; su uso a esa longitud requiere pruebas independientes de viabilidad y calidad.
- La validacion se limita a fixtures concretos y no constituye una certificacion de seguridad ni una evaluacion exhaustiva de comportamiento.
- Riesgo de respuestas inexactas o sesgadas, segun advierte la propia model card; no se documentan sesgos especificos.
- Idiomas soportados unicamente ingles y chino; no hay evidencia de calidad en castellano.
- La licencia Apache-2.0 la declara el publicador del modelo base; conviene revisar LICENSE y conversion_NOTICE.txt del repositorio.
- No se ejecuto codigo generado ni acciones reales de herramientas durante la validacion, por lo que el comportamiento en flujos de agentes o tool calling no esta comprobado.
- La cuantizacion a 6 bits introduce diferencias numericas respecto al BF16 original, aunque se reportaron comparaciones favorables en las pruebas realizadas.
- El primer uso descarga el modelo desde Hugging Face; cualquier servicio de inferencia alojado aplica sus propias condiciones de privacidad.
- No hay soporte validado en CUDA ni en GPUs dedicadas para este formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/csdhall/Nanbeige4.3-33B-MLX-6bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Checkpoint fuente concreto: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/c1093c501cc6460427c0ac634db7223d0450c0ee
- MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
