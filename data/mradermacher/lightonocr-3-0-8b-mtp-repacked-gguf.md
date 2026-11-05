# mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-GGUF

## Resumen

LightOnOCR-3-0.8B-MTP-Repacked-GGUF es la version cuantizada en formato GGUF del modelo LightOnOCR-3-0.8B-MTP-Repacked, publicado por el usuario mradermacher. Se trata de un modelo vision-lenguaje especializado en OCR y comprension de documentos (PDF, tablas, formularios) con capacidad de grounding visual, desarrollado originalmente por prithivMLmods. El modelo base cuenta con aproximadamente 772,8 millones de parametros y esta disenado para tareas de extraccion de texto y estructuracion de contenido a partir de imagenes de documentos.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K hasta f16), lo que permite desplegarlo en hardware modesto, incluidas GPUs de consumo, manteniendo la funcionalidad multimodal mediante el fichero mmproj adjunto. Esto lo convierte en una opcion practica para pipelines de digitalizacion de documentos en entornos con recursos limitados.

El modelo esta etiquetado como especializado en OCR, comprension de documentos, grounding visual y vision-lenguaje, con soporte declarado unicamente para el idioma ingles. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje; el nombre sugiere soporte de multi-token prediction, MTP) |
| Parametros totales | 772.845.888 (aprox. 0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. El nombre incluye el sufijo "MTP", que en la literatura reciente suele asociarse a multi-token prediction, una tecnica de entrenamiento que permite al modelo predecir varios tokens futuros simultaneamente para mejorar la eficiencia y la calidad de la generacion. Sin embargo, no se confirma este extremo en la documentacion disponible.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni innovaciones tecnicas especificas mas alla de las capacidades declaradas en las etiquetas: OCR, comprension de documentos, grounding visual y vision-lenguaje. El proceso de cuantizacion realizado por mradermacher es estatico (no se ofrecen cuantizaciones ponderadas/imatrix en el momento de la publicacion), con conversion desde el formato HuggingFace original.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Comprension de documentos: extraccion de estructura y contenido de PDF, tablas y formularios.
- Grounding visual: localizacion de elementos textuales o regiones dentro de la imagen.
- Generacion de texto conversacional a partir de entradas multimodales (imagen + texto).
- Procesamiento de tablas y formularios con salida estructurada.
- Capacidad multimodal mediante el fichero mmproj (proyector vision-lenguaje) en formato GGUF.
- Soporte de inferencia via llama.cpp y text-generation-inference (segun etiquetas).
- Idioma: unicamente ingles declarado.

## Casos de uso

- Digitalizacion masiva de PDF: el modelo puede procesar imagenes de paginas y extraer el texto estructurado, adecuado para archivos documentales gracias a su tamano reducido que permite ejecucion en lote sobre GPUs modestas.
- Extraccion de datos de formularios: al estar especializado en formularios, puede convertir campos manuscritos o impresos en datos estructurados para sistemas de gestion documental.
- Conversion de tablas a formatos estructurados: util para pipelines ETL que necesitan transformar tablas escaneadas en CSV o JSON.
- Grounding visual en herramientas de anotacion: permite localizar regiones de texto en imagenes, util para interfaces de revision documental asistida.
- Procesamiento en el borde (edge): gracias a las cuantizaciones Q4_K_S/Q4_K_M (0,6 GB), puede desplegarse en dispositivos con poca VRAM o incluso CPU via llama.cpp para OCR local sin conexion.
- Preprocesamiento en pipelines RAG: extraccion de texto de documentos escaneados antes de indexarlos en sistemas de recuperacion aumentada, con la ventaja de un modelo pequeno que reduce costes de inferencia.
- Automatizacion de facturas y recibos: identificacion y extraccion de campos clave (importes, fechas, emisores) en imagenes de documentos financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,7 GB para cuantizaciones Q2_K a Q5_K_M; alrededor de 0,9 GB para Q8_0; 1,7 GB para f16. Hay que sumar el proyector multimodal (0,2-0,3 GB segun mmproj Q8_0 o f16).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 pueden ejecutarlo holgadamente. Tambien es viable en GPUs de portatil y en CPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa importacion del GGUF), text-generation-inference segun etiquetas; requiere cargar el fichero mmproj para la parte multimodal.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de un modelo de 0,8B, se espera baja latencia en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B-MTP-Repacked-GGUF | 0,8B | no disponible | Apache 2.0 | GGUF | Especializado en OCR y documentos, multimodal |
| prithivMLmods/LightOnOCR-3-0.8B-MTP-Repacked (base) | 0,8B | no disponible | Apache 2.0 | safetensors | Version original sin cuantizar |
| Alternativas OCR/VLM de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto inexistente en la imagen, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S) o con documentos de baja calidad.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K_S pueden degradar notablemente la precision del OCR; se recomienda Q4_K_M o superior para produccion.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar documentos de muchas paginas sin fragmentacion previa.
- Dependencia del proyector multimodal: es imprescindible cargar el fichero mmproj junto con los pesos para que funcione la entrada de imagen; un uso solo de texto no aprovecha la capacidad principal.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base original por si hubiera terminos adicionales no reflejados.
- Cuantizaciones ponderadas/imatrix no disponibles: el autor indica que no las ha generado, por lo que no se puede optar a una calidad superior por bit en el momento de la publicacion.
- Fecha de publicacion futura (2026-11-05): conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/LightOnOCR-3-0.8B-MTP-Repacked-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/LightOnOCR-3-0.8B-MTP-Repacked
- Pagina de descargas del autor: https://hf.tst.eu/model#LightOnOCR-3-0.8B-MTP-Repacked-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
