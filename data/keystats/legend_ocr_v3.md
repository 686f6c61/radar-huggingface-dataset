# keystats/Legend_ocr_v3

## Resumen

Legend_ocr_v3 es un modelo multimodal de tipo imagen-texto-a-texto (image-text-to-text) publicado en Hugging Face por el usuario keystats. Por su etiquetado, la arquitectura declarada pertenece a la familia qwen3_vl, es decir, un transformer con torre de visión acoplada a un decodificador de lenguaje, orientado a tareas de visión-lenguaje como el reconocimiento óptico de caracteres (OCR) y la conversación sobre imágenes. El repositorio contiene 8.767.123.696 parámetros en formato safetensors y ocupa 17,5 GB, lo que es coherente con pesos almacenados en precisión bf16. La librería declarada es transformers y el pipeline es image-text-to-text.

La relevancia de esta ficha es limitada y hay que decirlo con claridad: la model card publicada es la plantilla automática de Hugging Face, con todos los campos marcados como "[More Information Needed]". No hay información del autor sobre datos de entrenamiento, licencia, idiomas, longitud de contexto, procedimiento de ajuste ni evaluación. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, y su fecha de creación registrada es el 20 de septiembre de 2026, posterior a la fecha habitual de publicación de Qwen3-VL, lo que sugiere un ajuste fino o una subida reciente y no validada por la comunidad.

En consecuencia, esta ficha documenta con rigor lo que se puede verificar (tamaño, formato, etiquetas, arquitectura inferida del tag) y marca explícitamente como "no disponible" todo lo que el autor no ha especificado. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no existe licencia declarada ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje, familia qwen3_vl (inferido de la etiqueta del repositorio); detalles concretos no disponibles |
| Parametros totales | 8.767.123.696 (~8,77 mil millones) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors; no se publican pesos GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible (sin licencia declarada; por defecto, todos los derechos reservados) |
| Formato de pesos | Safetensors (bf16 presumiblemente, segun el tamano del repo de 17,5 GB) |
| Tamano del repositorio | 17,5 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Modalidad de entrada | Imagen y texto |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La única información arquitectónica fiable es la etiqueta `qwen3_vl` del repositorio, que indica que el modelo parte de la familia Qwen3-VL de Alibaba. Se trata, por tanto, de un transformer con codificador de visión que proyecta representaciones visuales al espacio de un decodificador de lenguaje, lo que habilita tareas como OCR, descripción de imágenes y conversación multi-turno sobre contenido visual. El conteo de parámetros (8,77 mil millones) es consistente con una variante de tamaño ~8B de esa familia. No hay confirmación en la información disponible de si usa atención completa, atención lineal híbrida ni de qué variante exacta de Qwen3-VL deriva.

Sobre el entrenamiento no hay absolutamente ningún dato: se desconoce el número de tokens, la composición del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, y si el ajuste se orientó específicamente a OCR (como sugiere el sufijo "ocr" del nombre). La model card no incluye hiperparámetros, infraestructura de cómputo ni información medioambiental. La referencia arXiv que aparece en las etiquetas (`arxiv:1910.09700`) corresponde al artículo de Lacoste et al. (2019) sobre cálculo de emisiones de carbono, citado en la sección de impacto ambiental de la plantilla, y no es un paper del modelo.

## Capacidades

- Generación de texto condicionada por imagen, según el pipeline declarado image-text-to-text.
- Reconocimiento óptico de caracteres y extracción de texto en imágenes: es la capacidad que sugiere el nombre del modelo, aunque no está documentada formalmente por el autor.
- Conversación multimodal multi-turno: la etiqueta `conversational` indica soporte de diálogo, presumiblemente con historial de imágenes y texto.
- Compatibilidad con endpoints de inferencia: la etiqueta `endpoints_compatible` sugiere que puede desplegarse a través de la infraestructura de Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

Dado que el autor no documenta usos previstos, los siguientes escenarios son hipótesis de aplicación coherentes con la arquitectura y el nombre del modelo, no recomendaciones validadas:

- Digitalización de documentos con OCR: extracción de texto de facturas, contratos o formularios escaneados, usando la torre de visión para leer la imagen y el decodificador para estructurar la salida. Adecuado por el pipeline image-text-to-text, aunque la precisión real no está verificada.
- Conversión de capturas de pantalla a texto estructurado: transcripción de tablas o listados presentes en imágenes a Markdown o JSON, útil en flujos de automatización de oficina.
- Indexación y búsqueda de archivos escaneados: generación de texto plano a partir de PDFs digitalizados como paso previo a un pipeline de búsqueda semántica o RAG.
- Asistencia a la accesibilidad: descripción del contenido textual de imágenes para lectores de pantalla o resúmenes de documentos visuales.
- Extracción de datos de recibos y tickets: lectura de campos clave (importe, fecha, emisor) para sistemas de contabilidad automatizada.
- Preprocesado de datos para entrenamiento: uso del modelo para etiquetar o transcribir grandes volúmenes de imágenes y generar datasets de texto.
- Análisis de documentación técnica con diagramas: conversación multi-turno sobre planos, esquemas o diagramas anotados, aprovechando la etiqueta `conversational`.
- Verificación de calidad documental: comparación entre el texto de un documento original y su versión escaneada para detectar discrepancias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación con datos, y no se han encontrado referencias externas al modelo en la búsqueda web realizada. No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K, OCRBench, DocVQA ni de ninguna otra métrica.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del conteo de parámetros (8,77B) y del tamaño del repositorio; no proceden de documentación del autor:

- VRAM para inferencia en bf16: aproximadamente 18-20 GB solo para los pesos, más el espacio de la caché KV y las activaciones del codificador de visión. En la práctica, se recomienda disponer de 24 GB o más.
- VRAM en cuantización de 8 bits: del orden de 9-11 GB, si se generan pesos cuantizados (no publicados actualmente).
- VRAM en cuantización de 4 bits: del orden de 5-7 GB, igualmente condicionada a una conversión propia.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S o A6000 son adecuadas para servir el modelo en bf16.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16 con margen ajustado, y en tarjetas de 16 GB solo con cuantización. En GPUs de 8-12 GB requeriría cuantización agresiva no publicada.
- Opciones de despliegue: la librería declarada es transformers, por lo que `transformers` es la vía soportada de forma explícita. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible; llama.cpp y Ollama exigirían además convertir los pesos a GGUF, formato que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo, tiempo hasta el primer token ni requisitos de memoria medidos.

## Comparativa con modelos similares

No hay datos publicados suficientes para establecer una comparativa rigurosa. La tabla siguiente recoge únicamente lo verificable, marcando como no disponible todo lo que no puede contrastarse:

| Modelo | Parametros | Contexto | Licencia | Formatos | Benchmark |
|---|---|---|---|---|---|
| keystats/Legend_ocr_v3 | 8,77B | No disponible | No disponible | Safetensors | No disponible |
| Alternativas de la familia Qwen3-VL (~8B) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Otros modelos OCR/VLM de ~7-9B | No disponible | No disponible | No disponible | No disponible | No disponible |

La única referencia estructural defendible es que el tag `qwen3_vl` sitúa a este modelo en la misma familia arquitectónica que los Qwen3-VL de tamaño similar, pero no se dispone de datos verificados de versión base, contexto, licencia heredada ni rendimiento comparado. Tampoco hay confirmación de si el ajuste a OCR mejora o degrada las capacidades generales del modelo base.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin rellenar. No hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Licencia no declarada: sin licencia explícita, el uso comercial no está autorizado de forma clara y los derechos quedan reservados por defecto. Es un riesgo legal directo para cualquier despliegue en producción.
- Riesgo de alucinación: no evaluado. En modelos de OCR, la alucinación de texto inexistente en la imagen es un fallo típico y no hay métricas publicadas que permitan acotarlo.
- Idiomas no especificados: se desconoce el rendimiento en castellano y en otras lenguas, lo que impide garantizar calidad fuera de los idiomas del entrenamiento original (desconocidos).
- Longitud de contexto desconocida: no puede planificarse el procesamiento de documentos largos o conversaciones extensas.
- Sin adopción verificable: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad y ningún historial de incidencias reportadas.
- Fecha de creación anómala (2026-09-20) y ausencia de versionado documentado: dificulta el seguimiento de cambios en los pesos.
- Posible ajuste específico para OCR: el sufijo "ocr" sugiere especialización, lo que podría degradar capacidades generales de conversación o razonamiento respecto al modelo base, algo que no se ha medido.
- Repositorio de 17,5 GB en safetensors: requiere almacenamiento y ancho de banda considerables para su descarga, y no ofrece variantes cuantizadas listas para usar.
- Antes de cualquier uso en producción, es imprescindible contactar con el autor para obtener licencia, ficha técnica y resultados de evaluación propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keystats/Legend_ocr_v3
- Paper citado en las etiquetas (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en aprendizaje automático: https://mlco2.github.io/impact#compute

No se han encontrado en la búsqueda web otros enlaces relevantes al modelo: los resultados obtenidos corresponden a foros sobre Windows 11 y no guardan relación con este repositorio. No hay paper, blog, repositorio de código ni demo asociados a Legend_ocr_v3 en la información disponible.
