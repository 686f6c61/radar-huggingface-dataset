# dcharlot65-openie/Granite-Docling-258M-LittleBit

## Resumen

Granite-Docling-258M-LittleBit es un checkpoint de pesos "vivos" (living weights) derivado de ibm-granite/granite-docling-258M, el modelo de 258 millones de parametros de IBM especializado en conversion de documentos a formato estructurado (DocTags). Lo desarrolla el usuario dcharlot65-openie y no es un modelo entrenado desde cero, sino una refactorizacion del modelo base mediante una combinacion de LittleBit-2 y Sakana SVF, empaquetada en formato .jsyn para el runtime JouleDB.

Su relevancia no reside en las capacidades del modelo (heredadas integramente del original de IBM), sino en el perfil de compresion: el checkpoint ocupa 6,05 MB frente a los 491,17 MB equivalentes en FP16, lo que supone una reduccion de 81,19x y una media de 0,0841 bits por peso. Se trata, por tanto, de una propuesta de empaquetado sub-1-bit orientada a despliegues con restricciones extremas de almacenamiento y memoria.

El modelo esta pensado para el ecosistema JouleDB/JouleKube (base de datos termodinamica, sustrato de agentes nativo de Kubernetes y runtime de inferencia sin PyTorch). No incluye pesos en safetensors ni GGUF, y no es directamente utilizable con transformers, vLLM o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de granite-docling-258M; detalles internos no disponibles) |
| Parametros totales | 257.517.120 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Sub-1-bit mediante bitplanes 2D + vectores 1D (LittleBit-2 + Sakana SVF); media de 0,0841 BPW |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .jsyn (JouleDB, comprimido con zstd + CRC32); no incluye safetensors ni GGUF |

Datos adicionales del empaquetado: 286 tensores en bitplanes 2D, 184 vectores 1D (LayerNorm, bias y depthwise), tamano FP16 equivalente de 491,17 MB y tamano comprimido de 6,05 MB.

## Arquitectura y entrenamiento

El modelo base, granite-docling-258M, es un transformer de 258M de parametros de IBM orientado a tareas de document understanding y conversion a DocTags. La model card del checkpoint derivado no detalla la arquitectura interna (numero de capas, dimensiones ocultas, mecanismo de atencion) ni los datos de entrenamiento del modelo original: numero de tokens, composicion del corpus o si hubo fases de RLHF/DPO. Toda esa informacion debe consultarse en la model card de ibm-granite/granite-docling-258M.

La innovacion tecnica de este checkpoint es exclusivamente de representacion y compresion. Se aplica una factorizacion previa que combina LittleBit-2 (representacion en bitplanes de 2 dimensiones) con Sakana SVF, y el resultado se serializa en el formato .jsyn con compresion zstd y checksum CRC32. El autor describe el resultado como "living weights" dentro de un marco que denomina "thermodynamic AI". No se documenta ningun proceso de reentrenamiento, destilacion ni ajuste fino sobre el modelo de IBM: el prefijo "finetune" del tag de Hugging Face refleja la relacion con el modelo base, pero la model card no describe hiperparametros ni datos de ajuste.

## Capacidades

Las capacidades funcionales son las del modelo base granite-docling-258M, ya que el checkpoint no anade ni elimina comportamiento:

- Conversion de documentos a DocTags: transformacion de imagenes o paginas de documentos en representacion estructurada con etiquetas semanticas.
- Comprension de layout documental: identificacion de tablas, formulas, listas, titulos y bloques de texto.
- Procesamiento multimodal de documentos: el modelo base de IBM esta disenado para entrada visual de pagina completa.
- Generacion de texto estructurado: salida en un formato de marcado especifico (DocTags) en lugar de texto libre.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base esta especializado en una unica tarea de conversion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: empaquetado sub-1-bit (0,0841 BPW) y ejecucion en el runtime JouleDB sin PyTorch.

## Casos de uso

- Digitalizacion de archivos documentales a gran escala: el checkpoint de 6,05 MB permite almacenar y distribuir el modelo junto con el corpus, y convertirlo a DocTags en el mismo entorno JouleDB sin dependencias de PyTorch, lo que simplifica el despliegue en entornos air-gapped.
- Extraccion de estructura en pipelines de ingestion: integrado en un flujo de captura documental para transformar PDFs e imagenes en DocTags consumibles por un indexador o base de datos documental.
- Procesamiento en el borde (edge) con almacenamiento minimo: el tamano comprimido de 6,05 MB frente a 491,17 MB en FP16 hace viable embarcar el modelo en dispositivos con cuotas de disco y memoria muy restrictivas.
- Despliegue nativo en Kubernetes: a traves de JouleKube, el checkpoint puede servirse como un servicio mas del cluster con el runtime JouleDB (`jouledb serve --http-addr`), sin necesidad de imagenes con CUDA ni pilas de Python.
- Reproduccion e investigacion sobre compresion sub-1-bit: util como caso de estudio para medir el impacto real de LittleBit-2 + SVF sobre la calidad de salida de un modelo de documento, comparando contra el original de IBM.
- Archivado a largo plazo de modelos especializados: conservar una copia funcional de granite-docling-258M en 6,05 MB reduce el coste de almacenamiento y facilita la versionada del checkpoint en repositorios de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de compresion (257.517.120 parametros, 491,17 MB en FP16, 6,05 MB comprimido, 81,19x de reduccion, 0,0841 BPW) y no incluye evaluaciones de calidad de conversion documental (por ejemplo, sobre DocTags, OmniDocBench o similares) ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base tiene 258M de parametros, lo que en FP16 supondria aproximadamente 0,5 GB de pesos, pero el runtime JouleDB y el formato .jsyn no permiten estimar el consumo real de memoria en ejecucion.
- GPU recomendadas: no disponibles. La propuesta del autor es un runtime sin PyTorch, por lo que la compatibilidad con CUDA no esta documentada.
- Compatibilidad con GPU de consumo: no confirmada. Por tamano del modelo base cabria en cualquier GPU con 2 GB o mas de VRAM, pero la viabilidad depende del soporte del runtime JouleDB, no documentado.
- Opciones de despliegue: exclusivamente JouleDB (`cargo binstall jouledb` y `jouledb serve --http-addr 127.0.0.1:8080`), con carga via `db.hf_pull(...)` desde Python. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en safetensors ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-Docling-258M-LittleBit | 257.517.120 | No disponible | .jsyn (JouleDB) | Apache 2.0 | Hugging Face, 0 descargas |
| ibm-granite/granite-docling-258M | 258M (aprox.) | No disponible en esta ficha | Safetensors (formato estandar de transformers) | Apache 2.0 | Hugging Face, modelo oficial de IBM |
| Otros modelos de document understanding de ~250M-500M | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante es contra el modelo base: comparten arquitectura y capacidades, y difieren en formato (safetensors frente a .jsyn), tamano en disco (491,17 MB equivalentes frente a 6,05 MB) y ecosistema de ejecucion (transformers/vLLM frente a JouleDB). No se dispone de datos de benchmarks que permitan comparar la calidad de salida entre ambos.

## Limitaciones y advertencias

- Dependencia total del runtime JouleDB: el checkpoint no es cargable con transformers, vLLM, llama.cpp ni Ollama. Sin JouleDB v0.2.4 o superior, el modelo es inutilizable.
- Sin evidencia de calidad tras la compresion: no se publican evaluaciones que demuestren que la factorizacion LittleBit-2 + SVF preserva la fidelidad de salida del modelo original. La compresion a 0,0841 BPW es extrema y el riesgo de degradacion es alto hasta que se demuestre lo contrario.
- Proyecto sin traccion verificable: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,0 GB y creado en noviembre de 2026. No hay senales de validacion por parte de la comunidad.
- Model card sin datos de entrenamiento: no se documentan hiperparametros, datos de ajuste ni metodologia de evaluacion de la factorizacion.
- Sesgos y alucinacion: no documentados para este checkpoint. Al heredar el comportamiento del modelo base, arrastra los sesgos de su corpus de entrenamiento, no descrito aqui.
- Limitaciones de contexto e idioma: no disponibles. El modelo base esta orientado a documentos, no a conversacion general; no debe emplearse como modelo de chat o de razonamiento abierto.
- Licencia: Apache 2.0, lo que permite uso comercial, pero la atribucion a IBM como autor del modelo base es obligatoria. Verificar los terminos del modelo original antes de un despliegue en produccion.
- Ausencia de garantias: al no haber benchmarks ni validacion independiente, no es recomendable usar este checkpoint en produccion sin una evaluacion propia contra el modelo base de IBM.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/dcharlot65-openie/Granite-Docling-258M-LittleBit
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-docling-258M
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
