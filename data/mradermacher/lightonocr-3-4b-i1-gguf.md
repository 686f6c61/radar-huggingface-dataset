# mradermacher/LightOnOCR-3-4B-i1-GGUF

## Resumen

LightOnOCR-3-4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo LightOnOCR-3-4B, desarrollado originalmente por LightOn (lightonai) y convertido a GGUF por mradermacher. Se trata de un modelo visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos, con capacidades de grounding visual, extracción de tablas y procesamiento de formularios. Con 4.205.751.296 parámetros, está diseñado para convertir imágenes de documentos en texto estructurado y comprensible.

El modelo base resuelve el problema de la digitalización inteligente de documentos: no se limita a transcribir texto, sino que comprende la estructura del documento, localiza visualmente los elementos (visual grounding) y extrae información de tablas y formularios. Esta versión i1-GGUF de mradermacher utiliza cuantizaciones con imatrix (importance matrix) para preservar la calidad del modelo original en tamaños reducidos, permitiendo su despliegue en hardware de consumo.

La relevancia actual del modelo radica en su combinación de tamaño moderado (4B parámetros) con licencia Apache 2.0, lo que facilita su uso comercial en pipelines de automatización documental. La disponibilidad de cuantizaciones desde 1,5 GB hasta 3,6 GB permite ejecutarlo en GPUs de consumo y en entornos con recursos limitados, manteniendo las capacidades de comprensión visual del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer multimodal); detalles específicos de la arquitectura base no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LightOnOCR-3-4B más allá de su naturaleza como modelo visión-lenguaje (vision-language). Los tags del modelo indican capacidades de OCR, document-understanding, visual-grounding, tables y forms, lo que sugiere un diseño orientado a la comprensión estructurada de documentos. El modelo procesa imágenes de documentos y genera texto, con la capacidad adicional de localizar visualmente elementos en la imagen (visual grounding).

Esta versión i1-GGUF ha sido cuantizada por mradermacher utilizando imatrix (importance matrix), una técnica que calcula la importancia de cada peso del modelo para preservar la calidad en las cuantizaciones de baja precisión. El repositorio incluye el archivo imatrix (0,1 GB) para que otros usuarios puedan crear sus propias cuantizaciones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento óptico de caracteres (OCR): transcripción de texto desde imágenes de documentos.
- Comprensión de documentos (document understanding): interpretación de la estructura y el contenido de documentos.
- Grounding visual: localización de elementos específicos dentro de la imagen del documento.
- Extracción de tablas: procesamiento y estructuración de datos tabulares presentes en documentos.
- Procesamiento de formularios: extracción de campos y valores de formularios.
- Generación conversacional: el tag "conversational" indica capacidad de interacción en formato de diálogo.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integración con APIs de inferencia.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se dispone de información sobre tool calling, function calling, agentes o modos de razonamiento multi-paso.

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede procesar imágenes de facturas para extraer importes, fechas, proveedores y líneas de detalle, aprovechando sus capacidades de comprensión de tablas y formularios. Adecuado para automatizar la contabilidad de pequeñas y medianas empresas.

- Extracción de datos de formularios administrativos: dado que el modelo está especializado en forms, puede procesar formularios escaneados (solicitudes, declaraciones, encuestas) y extraer los valores de cada campo, reduciendo la entrada manual de datos en procesos burocráticos.

- Procesamiento de tablas financieras: la capacidad de tables permite extraer datos de estados financieros, balances y hojas de cálculo escaneadas, convirtiéndolos en formatos estructurados (CSV, JSON) para su análisis posterior.

- Archivado y búsqueda documental: el modelo puede transcribir y estructurar documentos históricos o escaneados, facilitando la creación de índices de búsqueda full-text sobre archivos PDF o imágenes previamente inaccesibles.

- Automatización de atención al cliente con documentos: integrado en un sistema de tickets, el modelo puede procesar documentos adjuntos por los clientes (contratos, identificaciones, comprobantes) y extraer la información relevante para el agente, gracias a su capacidad conversacional y de comprensión documental.

- Verificación de identidad y KYC: el modelo puede extraer datos de documentos de identidad (DNI, pasaporte, permisos de conducir) en procesos de alta de clientes, utilizando el grounding visual para localizar y validar los campos relevantes.

- Digitalización de documentación técnica: manuales, planos o especificaciones escaneadas pueden procesarse para extraer texto y tablas de parámetros técnicos, facilitando su integración en bases de conocimiento o sistemas de mantenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 GB (i1-IQ1_S) y 3,6 GB (i1-Q6_K) para los pesos cuantizados. Hay que añadir la VRAM necesaria para el proyector multimodal (mmproj), que se encuentra en el repositorio estático (mradermacher/LightOnOCR-3-4B-GGUF), y la memoria para el contexto y las imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para las cuantizaciones medias (Q4_K_M, Q5_K_M). Para las cuantizaciones más altas (Q6_K) se recomienda 8 GB o más.
- Cabe en GPU de consumo: sí. Una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo con holgura. Incluso GPUs con 6 GB (RTX 2060, GTX 1660 Ti) pueden ejecutar cuantizaciones IQ3 o IQ4.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF. Para el modelo base en safetensors se puede usar transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles. Dependerán del hardware, la cuantización y el tamaño de las imágenes de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|---|
| LightOnOCR-3-4B-i1-GGUF | 4,2B | No disponible | Inglés | Apache 2.0 | GGUF | OCR y comprensión documental |
| LightOnOCR-3-4B (base) | 4,2B | No disponible | Inglés | Apache 2.0 | Safetensors | OCR y comprensión documental |
| Alternativas OCR/VLM de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada. La comparativa se limita al modelo base frente a su versión cuantizada.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés según la model card. No se garantiza un rendimiento adecuado en castellano u otros idiomas, lo que limita su uso en entornos hispanohablantes sin evaluación previa.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base. Al ser un modelo entrenado principalmente con documentos en inglés, puede presentar sesgos hacia formatos y tipografías occidentales.
- Riesgo de alucinación: como todo modelo generativo, puede inventar texto o datos que no aparecen en la imagen del documento, especialmente en cuantizaciones muy bajas (IQ1, IQ2, Q2_K). Se recomienda validación humana en aplicaciones críticas.
- Cuantizaciones de baja calidad: las cuantizaciones IQ1_S, IQ1_M, IQ2_XXS y Q2_K_S están marcadas por el autor como "for the desperate", "mostly desperate" o "very low quality". No son recomendables para producción.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y la atribución. No se identifican restricciones adicionales.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide evaluar su idoneidad para documentos muy extensos o conversaciones multi-turno largas.
- Dependencia del proyector multimodal: para usar el modelo con imágenes es necesario el archivo mmproj, que se encuentra en el repositorio estático separado. Su omisión impediría el procesamiento visual.
- Fecha de creación: el repositorio fue creado el 2026-10-09, lo que indica que es un modelo reciente y puede carecer de validación comunitaria extensa (solo 1 like y 3.725 descargas en el momento de la consulta).

## Enlaces

- Repositorio Hugging Face (GGUF i1): https://huggingface.co/mradermacher/LightOnOCR-3-4B-i1-GGUF
- Repositorio Hugging Face (GGUF estático): https://huggingface.co/mradermacher/LightOnOCR-3-4B-GGUF
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Página de descargas del cuantizador: https://hf.tst.eu/model#LightOnOCR-3-4B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Reflexiones de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa del cuantizador): https://www.nethype.de/
