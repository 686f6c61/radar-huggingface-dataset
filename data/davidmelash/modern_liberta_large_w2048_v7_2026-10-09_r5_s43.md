# davidmelash/modern_liberta_large_w2048_v7_2026-10-09_r5_s43

## Resumen

modern_liberta_large_w2048_v7_2026-10-09_r5_s43 es un modelo de clasificación de tokens (token classification) desarrollado por el usuario davidmelash, especializado en la detección de datos personales en resoluciones judiciales ucranianas con el objetivo de permitir su pseudonimización. Se trata de un fine-tuning del modelo encoder Goader/modern-liberta-large, una variante de la familia ModernBERT adaptada al ucraniano, y reconoce cuatro tipos de entidad: ОСОБА (persona), АДРЕСА (dirección), НОМЕР (número) e ІНФОРМАЦІЯ (información).

El modelo cuenta con 409.799.689 parámetros totales (aproximadamente 410 M) según los pesos en safetensors, y el repositorio ocupa 1,6 GB, lo que sugiere pesos almacenados en precisión completa o media. El identificador del checkpoint incluye el sufijo `w2048`, que apunta a una ventana de contexto de entrenamiento de 2048 tokens, aunque este dato no se confirma explícitamente en la model card. Está publicado con licencia MIT, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en un caso de uso muy concreto y con demanda creciente: la desidentificación automatizada de documentos judiciales antes de su publicación o cesión a terceros, en un contexto regulatorio (protección de datos) donde el tratamiento manual de grandes volúmenes de sentencias es inviable. El modelo se distribuye a través de HuggingFace con la librería transformers y es compatible con endpoints, aunque a fecha de la información disponible no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional de la familia ModernBERT (etiqueta `modernbert`); modelo base Goader/modern-liberta-large |
| Parametros totales | 409.799.689 (segun pesos safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens deducidos del identificador `w2048`; no confirmado en la model card. El modelo base ModernBERT soporta hasta 8192 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un encoder transformer bidireccional de tipo ModernBERT, familia caracterizada por el uso de embeddings posicionales rotatorios (RoPE), atención alternada entre capas locales y globales, activaciones GeGLU y eliminación de los terminos de sesgo, lo que reduce el coste de inferencia y memoria frente a encoders BERT clasicos. El modelo parte de Goader/modern-liberta-large, una adaptación de ModernBERT-large al ucraniano, y sobre esa base se ha realizado un fine-tuning para la tarea de token classification con cuatro etiquetas de entidad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de alineacion como RLHF o DPO; en un modelo encoder de clasificación estos metodos no son habituales.

El dato mas relevante del entrenamiento es la naturaleza del corpus: el conjunto sintetico `v7`, construido a partir de resoluciones judiciales del Registro Unificado Estatal de Decisiones Judiciales de Ucrania, cuyos fragmentos anonimizados se rellenan con valores generados. Las direcciones sinteticas provienen del directorio de Ukrposhta y de OpenStreetMap (© OpenStreetMap contributors, ODbL). Este enfoque de anonimizacion-inversa permite generar pares texto-etiqueta a escala, pero introduce una dependencia de la distribucion de los datos generados que conviene tener en cuenta al evaluar el modelo sobre documentos reales. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa ni mecanismos de atencion lineal.

## Capacidades

- Clasificación de tokens (NER) sobre texto en ucraniano, con cuatro tipos de entidad: ОСОБА (persona), АДРЕСА (dirección), НОМЕР (número) e ІНФОРМАЦІЯ (información).
- Detección de datos personales orientada a pseudonimización de resoluciones judiciales.
- Procesamiento de documentos legales largos hasta la ventana de contexto del modelo (2048 tokens según el identificador del checkpoint).
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling, y no implementa agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al ucraniano; no se declara soporte para otros idiomas.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Anonimización de resoluciones judiciales antes de su publicación: el modelo etiqueta nombres, direcciones, números e información identificativa, y un post-proceso sustituye cada entidad por un seudónimo o marcador. Es el caso de uso principal declarado por el autor.
- Cumplimiento normativo en portales de transparencia judicial: integrado en el pipeline de publicación del Registro Unificado Estatal, permite aplicar controles de protección de datos de forma sistemática y auditable antes de exponer cada sentencia.
- Construcción de corpus legales para investigación: antes de liberar un dataset de sentencias, el modelo filtra la información personal, reduciendo el riesgo legal de la cesión a terceros.
- Auditoría de doble verificación sobre documentos ya seudonimizados: se ejecuta el modelo sobre textos supuestamente limpios para detectar fugas de datos personales que hayan pasado los filtros previos.
- Enriquecimiento de metadatos para búsqueda jurídica: las entidades detectadas permiten indexar sentencias por partes implicadas, ubicaciones o números de referencia, mejorando la recuperación documental.
- Normalización geoespacial de direcciones: al aislar el campo АДРЕСА, las direcciones pueden cruzarse con directorios postales (Ukrposhta) o con OpenStreetMap para validación y geocodificación.
- Preprocesamiento en pipelines ETL de gestión documental legal: la clasificación por tokens encaja como etapa previa a la indexación, el resumen o la traducción de expedientes dentro de un flujo de datos mayor.
- Detección de PII en flujos internos de despachos y administraciones: revisión automática de borradores, expedientes o comunicaciones antes de compartirlos fuera de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros sistemas, y el repositorio no registra descargas ni evaluaciones de la comunidad. Tampoco los resultados de la búsqueda web aportan datos de evaluación, ya que todas las entradas devueltas son irrelevantes (preguntas de Stack Overflow sobre otros temas).

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 1,64 GB solo para pesos; en FP16/BF16, unos 0,82 GB; en INT8, alrededor de 0,41 GB. A estas cifras hay que sumar la memoria de activaciones, que depende de la longitud de secuencia y del tamano de lote.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para lotes moderados; una NVIDIA T4, RTX 3060, RTX 4090 o A100 funcionan sin problema. No se requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU de consumo moderna (RTX 3060 12 GB y superiores, e incluso tarjetas de 4-6 GB con lotes pequenos y secuencias cortas). También es viable en CPU para volúmenes bajos.
- Opciones de despliegue: pipeline `token-classification` de transformers; exportacion a ONNX Runtime para inferencia optimizada; servidores compatibles con clasificación de tokens como TGI. vLLM esta orientado a modelos generativos, por lo que no es la via natural. llama.cpp y Ollama no aplican al no ser un modelo generativo.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos publicos de benchmarks ni de modelos comparables directos en la informacion proporcionada. La unica referencia documentada es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| davidmelash/modern_liberta_large_w2048_v7_2026-10-09_r5_s43 | 409.799.689 | 2048 tokens (deducido del identificador) | Token classification (PII en ucraniano) | MIT | no disponible |
| Goader/modern-liberta-large | no disponible | no disponible | Modelo base encoder en ucraniano | no disponible | no disponible |
| Otras alternativas de deteccion de PII en ucraniano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo esta entrenado exclusivamente para ucraniano; su uso sobre textos en otros idiomas no esta soportado y previsiblemente dara resultados degradados.
- Sesgo de dominio: el entrenamiento se realizo sobre un dataset sintetico derivado de resoluciones judiciales, por lo que el rendimiento fuera del registro juridico ucraniano (correspondencia, historiales medicos, contratos) no esta garantizado.
- Sesgo de datos sinteticos: las entidades se generan a partir de directorios postales y de OpenStreetMap, lo que puede infrarrepresentar formatos reales de direcciones, nombres poco frecuentes o variantes ortograficas.
- Riesgo de falsos negativos: en un caso de uso de pseudonimizacion, un fallo de deteccion implica exposicion de datos personales; se recomienda validacion humana o una segunda capa de control.
- Riesgo de falsos positivos: la etiqueta ІНФОРМАЦІЯ es amplia y puede capturar fragmentos que no constituyan datos personales, obligando a revision posterior.
- Cobertura de entidades limitada: solo cuatro categorias (ОСОБА, АДРЕСА, НОМЕР, ІНФОРМАЦІЯ); no cubre otras PII como identificadores fiscales, datos bancarios o informacion de salud.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precision o recall que permita evaluar su idoneidad en produccion; la validacion previa al despliegue es imprescindible.
- Licencia MIT: permite uso comercial y modificacion sin restricciones adicionales, pero conviene revisar las condiciones de los datos fuente (resoluciones judiciales y datos de OpenStreetMap bajo ODbL) si se redistribuye el modelo o los datos derivados.
- Adopcion nula: cero descargas y cero valoraciones en el momento de la consulta, lo que reduce la trazabilidad de su comportamiento en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidmelash/modern_liberta_large_w2048_v7_2026-10-09_r5_s43
- Modelo base: https://huggingface.co/Goader/modern-liberta-large
- OpenStreetMap (origen de las direcciones sinteticas, licencia ODbL): https://www.openstreetmap.org/copyright
- Ukrposhta (directorio postal citado como fuente de direcciones): https://www.ukrposhta.ua/
- Referencia de la arquitectura ModernBERT (no procede de la busqueda web realizada): https://arxiv.org/abs/2412.13663
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; todas las entradas obtenidas eran preguntas de Stack Overflow sin relacion con el tema.
