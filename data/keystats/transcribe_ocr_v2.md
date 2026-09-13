# keystats/Transcribe_ocr_v2

## Resumen

`keystats/Transcribe_ocr_v2` es un modelo multimodal de tipo image-text-to-text publicado en HuggingFace por el usuario keystats. El repositorio declara la etiqueta de arquitectura `qwen2_5_vl`, lo que situa al modelo dentro de la familia Qwen2.5-VL, orientada a comprension conjunta de imagen y texto. El recuento real de parametros extraido de los pesos safetensors es de 8.292.166.656 (aproximadamente 8,29 mil millones), un orden de magnitud que coincide con el de las variantes de 7B-8B de dicha familia. El nombre del repositorio sugiere un ajuste orientado a transcripcion y OCR, aunque la model card no lo confirma.

El modelo es relevante por su tamano contenido: 8,29B de parametros lo colocan en la franja de modelos multimodales que pueden desplegarse en una unica GPU de 24 GB en precision bf16, o en GPUs de consumo mas modestas aplicando cuantizacion. Eso lo hace candidato para tareas de digitalizacion documental, extraccion de texto en imagenes y conversion de capturas a texto estructurado, siempre que se valide su calidad real.

Conviene ser cauto: la model card es la plantilla automatica de HuggingFace y no contiene informacion sustantiva. No se declaran licencia, idiomas, datos de entrenamiento, hiperparametros ni resultados de evaluacion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el unico dato tecnico duro disponible es el recuento de parametros y el tamano del repo (16,6 GB, compatible con pesos en bf16/fp16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tag declarado `qwen2_5_vl` (transformer multimodal con torre de vision, presumiblemente derivado de Qwen2.5-VL; no confirmado en la model card) |
| Parametros totales | 8.292.166.656 (~8,29B), dato real de safetensors |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en el repositorio; por tamano son viables bf16/fp16, int8 y int4 (GGUF/AWQ/GPTQ no publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria declarada | transformers |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 16,6 GB |
| Fecha de creacion | 2026-09-13 (segun metadatos del Hub) |
| Fecha de ultima actualizacion | 2026-09-13 (segun metadatos del Hub) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es el tag `qwen2_5_vl` incluido en los metadatos del Hub. Esto indica que el modelo emplea la arquitectura de Qwen2.5-VL: un transformer de lenguaje combinado con un codificador visual que proyecta las caracteristicas de imagen al espacio de embeddings del modelo de texto, con atencion conjunta sobre tokens visuales y textuales. El recuento de parametros (8,29B) es coherente con el de la variante Qwen2.5-VL-7B, pero no hay confirmacion explicita en la model card de que se trate exactamente de ese checkpoint como base.

No se dispone de informacion sobre el procedimiento de entrenamiento: ni volumen de tokens, ni composicion del dataset, ni si hubo fine-tuning supervisado, RLHF, DPO u otro tipo de ajuste. El sufijo `_v2` en el nombre sugiere una segunda iteracion de un modelo previo de transcripcion/OCR, pero no se ha publicado ninguna descripcion de la receta. Tampoco hay datos sobre precision de entrenamiento (fp32, bf16, fp16, fp8) ni sobre infraestructura de computo. Toda afirmacion adicional sobre el entrenamiento seria especulacion.

## Capacidades

- Generacion de texto condicionada por imagen (pipeline declarado `image-text-to-text`).
- Procesamiento de imagenes y texto de forma conversacional: el tag `conversational` indica soporte de dialogos multi-turno con contenido visual intercalado.
- Transcripcion y OCR: el propio identificador del repositorio apunta a este uso, aunque no esta documentado ni verificado en la model card.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible` segun los tags del Hub, lo que facilita su despliegue como endpoint HTTP.
- Capacidades de tool calling, function calling, agentes, modo thinking, audio o video: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede recibir la imagen de una pagina y devolver el texto transcrito, lo que encaja con el proposito sugerido por el nombre del repositorio. Requiere validacion previa con muestras reales del dominio.
- Extraccion de campos en facturas y formularios: a partir de una captura o escaneo, generar una representacion textual estructurada que despues se parsee en un pipeline de ingesta. Su tamano de 8,29B permite ejecutarlo en una GPU de 24 GB.
- Conversion de capturas de pantalla a texto: util en herramientas de soporte y en la generacion de documentacion a partir de imagenes de interfaz.
- Preprocesado de corpus para busqueda semantica: transcribir grandes volumenes de imagenes a texto antes de indexarlas, aprovechando que el modelo cabe en una sola GPU y puede servirse con vLLM o TGI.
- Asistencia a la lectura para contenido visual: descripcion y transcripcion de diagramas, graficos o material grafico en aplicaciones de accesibilidad, sujeto a evaluacion de calidad.
- Base para fine-tuning especifico: al ser un checkpoint de 8,29B derivado de una familia abierta y estar en safetensors, puede usarse como punto de partida para ajustes en dominios concretos (documentacion legal, historiales medicos, tickets) con LoRA o ajuste completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada, y la busqueda web realizada no ha devuelto informacion relevante sobre este modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (8,29B) y del tamano del repositorio (16,6 GB); no proceden de documentacion del autor.

- VRAM para pesos en bf16/fp16: aproximadamente 16,6 GB solo para pesos, mas overhead de activaciones, cache KV y, en su caso, tokens visuales. Presupuesto realista: 20-24 GB para contextos moderados.
- VRAM en int8: aproximadamente 8-9 GB para pesos, con 12-16 GB totales recomendados.
- VRAM en int4: aproximadamente 4,5-5,5 GB para pesos, viable en GPUs de 8-12 GB dependiendo de la resolucion de imagen y la longitud de contexto.
- GPUs de datacenter: A100 40/80 GB, H100 80 GB, L40S 48 GB. Todas permiten bf16 con margen amplio.
- GPUs de consumo: RTX 4090 / 3090 (24 GB) para bf16; RTX 4080 (16 GB) y 4060 Ti (16 GB) en int8; RTX 3060 12 GB y similares en int4.
- Despliegue: los tags del Hub indican compatibilidad con `text-generation-inference` y `endpoints_compatible`. vLLM es una opcion habitual para esta arquitectura. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion propia.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de tiempo de prefill.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de `Transcribe_ocr_v2`, por lo que la comparacion se limita a caracteristicas estructurales de alternativas de la misma franja. Las cifras de los modelos alternativos proceden de sus respectivas fichas publicas y no han sido verificadas contra este repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| keystats/Transcribe_ocr_v2 | 8,29B | no disponible | no disponible | safetensors en HuggingFace |
| Qwen2.5-VL-7B-Instruct | ~8,29B | 128K (segun ficha oficial de Qwen) | Apache 2.0 (segun ficha oficial) | safetensors, ampliamente replicado |
| InternVL2.5-8B | ~8,1B | no disponible en esta busqueda | no disponible en esta busqueda | safetensors |
| Llama-3.2-11B-Vision-Instruct | ~10,6B | 128K (segun ficha oficial de Meta) | licencia Llama con restricciones | safetensors |

No se dispone de comparativas de calidad (MMLU, DocVQA, OCRBench u otras) para ningun modelo de la tabla en el contexto de esta busqueda.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica sin rellenar. No hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni uso previsto.
- Licencia no declarada: sin licencia explicita, no puede asumirse permiso de uso comercial. Es un riesgo legal relevante antes de integrar el modelo en produccion.
- Riesgo de alucinacion: los modelos multimodales de esta familia pueden generar texto plausible que no aparece en la imagen, especialmente en documentos con baja resolucion, tablas complejas, escritura manuscrita o idiomas poco representados. La transcripcion debe verificarse.
- Idiomas soportados desconocidos: no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion propia.
- Longitud de contexto desconocida: limita la planificacion de cargas con muchas paginas o imagenes de alta resolucion.
- Reputacion y trazabilidad: 0 descargas y 0 likes, actualizacion unica el mismo dia de creacion y ausencia de nombre de autor reconocible. No hay garantia de mantenimiento ni de procedencia de los pesos.
- Sin cuantizaciones publicadas: cualquier despliegue en entornos con VRAM limitada exige generar los pesos cuantizados y validar la perdida de calidad.
- Inconsistencia en las fechas de los metadatos (2026) que conviene contrastar antes de citar el repositorio.
- Posible incumplimiento de la licencia del modelo base: si deriva de Qwen2.5-VL, el autor no declara la licencia original ni los terminos de redistribucion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/keystats/Transcribe_ocr_v2
- Referencia citada en la plantilla de la model card (calculadora de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados a este modelo en la busqueda web realizada. Los resultados devueltos por la busqueda no guardan relacion con el modelo.
