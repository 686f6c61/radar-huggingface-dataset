# atkinschang/TableFormerV2-MLX

## Resumen

TableFormerV2-MLX es una conversión a formato MLX de los pesos del modelo TableFormerV2, desarrollado por IBM dentro del proyecto Docling para el reconocimiento de estructura de tablas en documentos. El modelo original, alojado en `docling-project/TableFormerV2`, forma parte de la suite de modelos de IA de Docling, un paquete open source para conversión de PDFs que combina análisis de diseño (DocLayNet) y reconocimiento de estructura de tablas (TableFormer). Esta conversión, publicada por el usuario atkinschang, adapta los pesos a MLX, el framework de aprendizaje automático de Apple para hardware con silicio de Apple, lo que permite ejecutar el modelo de forma eficiente en Macs sin necesidad de GPU dedicada.

El modelo tiene 51,1 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y adecuado para entornos con recursos limitados. Su función principal es identificar la estructura de una tabla (filas, columnas, celdas, celdas fusionadas) y generar las coordenadas de los bounding boxes de cada celda, así como una representación HTML de la tabla. Es relevante ahora porque facilita la extracción de datos tabulares en pipelines de procesamiento de documentos, una tarea crítica en automatización empresarial, análisis financiero y recuperación de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision para estructura de tablas, basado en transformer) |
| Parametros totales | 51.125.265 (51,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no procesa texto secuencial) |
| Tipos de cuantizacion | F32 (segun metadatos de safetensors) |
| Idiomas soportados | no disponible (el modelo procesa imagenes, no texto) |
| Licencia | no disponible (la model card no especifica licencia para esta conversion) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna de TableFormerV2 en la documentacion proporcionada. Se sabe que es un modelo de vision especializado en reconocimiento de estructura de tablas, desarrollado por IBM para el proyecto Docling. El modelo original `docling-project/TableFormerV2` se integra en el pipeline de Docling, que combina analisis de diseño con reconocimiento de tablas. La conversion a MLX mantiene los pesos originales (revision `51559fad3946873e26a6f9b8e912f948e8745bef`) sin modificaciones en la arquitectura. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO, ya que se trata de un modelo discriminativo de vision, no generativo.

## Capacidades

- Reconocimiento de estructura de tablas: identifica filas, columnas, celdas y celdas fusionadas en imagenes de tablas.
- Generacion de bounding boxes: produce coordenadas de cada celda detectada.
- Salida en formato HTML: genera una representacion HTML de la tabla reconocida.
- Integracion con Docling: funciona como modulo dentro del pipeline de conversion de PDFs de Docling.
- Ejecucion en hardware Apple: gracias a la conversion a MLX, puede ejecutarse en Macs con silicio de Apple (M1/M2/M3/M4) sin GPU externa.
- Procesamiento de imagenes: acepta como entrada imagenes de tablas, no texto plano.

## Casos de uso

- Extraccion de tablas de PDFs escaneados: el modelo puede procesar paginas escaneadas de informes o facturas y devolver la estructura tabular en HTML, facilitando su posterior analisis o conversion a hojas de calculo.
- Digitalizacion de informes financieros: en banca y seguros, los documentos contienen tablas con datos numericos; TableFormerV2-MLX permite extraer esas tablas de forma automatica para alimentar sistemas de analisis.
- Automatizacion de procesos documentales: integrado en un pipeline de Docling, convierte documentos PDF en representaciones estructuradas (Markdown, HTML) listas para su uso en bases de datos o motores de busqueda.
- Preparacion de datos para RAG (Retrieval-Augmented Generation): las tablas extraidas se pueden convertir en texto plano o JSON para indexar en sistemas de recuperacion de informacion, mejorando la respuesta a consultas sobre datos tabulares.
- Analisis de documentos legales: contratos y expedientes suelen incluir tablas con clausulas o datos de partes; el modelo ayuda a extraer esa informacion de forma estructurada.
- Migracion de documentos legacy: empresas con archivos en PDF antiguos pueden usar el modelo para convertir tablas a formatos editables (CSV, Excel) sin reescritura manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas, ya que el modelo no es de lenguaje general sino de vision especializada. Tampoco se han encontrado comparativas publicas con otros modelos de reconocimiento de tablas en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,1 M de parametros en F32, ocupa aproximadamente 204 MB en memoria. Cabe en cualquier Mac con al menos 8 GB de RAM unificada.
- GPU recomendadas: no requiere GPU dedicada; funciona en la GPU integrada de los chips Apple Silicon (M1/M2/M3/M4) mediante MLX.
- Compatibilidad con consumer GPU: no aplica, ya que MLX esta diseñado exclusivamente para hardware Apple.
- Opciones de despliegue: se puede integrar en pipelines de Python usando la libreria `docling-mlx` o directamente con MLX. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones especificas. Dado el tamano reducido, se espera una inferencia rapida en hardware Apple, aunque los tiempos dependen de la resolucion de las imagenes de entrada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de reconocimiento de estructura de tablas (como Table Transformer de Microsoft, o modelos de deteccion de tablas como TATR). La informacion disponible no incluye datos de rendimiento relativo ni caracteristicas tecnicas de alternativas. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo especializado: solo reconoce estructura de tablas en imagenes; no es un modelo de lenguaje general ni puede generar texto libre.
- Dependencia de la calidad de la imagen: el rendimiento puede degradarse con imagenes de baja resolucion, tablas muy complejas o con rotaciones.
- Licencia no especificada: la model card de esta conversion no indica licencia. El modelo original de Docling se distribuye bajo licencia MIT (segun el informe tecnico), pero no se puede confirmar que esta conversion herede esa licencia. Se recomienda verificar antes de uso comercial.
- Sin soporte para otros formatos de entrada: no procesa texto, solo imagenes. Para extraer tablas de PDFs nativos se requiere un paso previo de rasterizacion.
- Sin informacion sobre sesgos: al ser un modelo de vision, no se han documentado sesgos especificos, pero podria tener problemas con tablas de ciertos idiomas o estilos no representados en su entrenamiento.
- Limitado a hardware Apple: la conversion a MLX restringe su ejecucion a Macs con silicio de Apple; no es portable a GPUs NVIDIA o AMD sin reconvertir los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/atkinschang/TableFormerV2-MLX
- Modelo original: https://huggingface.co/docling-project/TableFormerV2
- Repositorio docling-ibm-models: https://github.com/docling-project/docling-ibm-models
- Informe tecnico de Docling (arXiv): https://arxiv.org/html/2408.09869v2
