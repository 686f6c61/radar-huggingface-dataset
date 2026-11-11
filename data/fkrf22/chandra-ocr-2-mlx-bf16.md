# fkrf22/chandra-ocr-2-mlx-bf16

## Resumen

Chandra OCR 2 es un modelo de visión-lenguaje especializado en extracción de contenido estructurado a partir de imágenes de documentos (PDF, escaneos, capturas) y su conversión a Markdown preservando el layout. El modelo original lo desarrolla datalab-to; la variante aquí descrita (`fkrf22/chandra-ocr-2-mlx-bf16`) es una conversión comunitaria a formato MLX en precisión bfloat16, pensada para ejecución eficiente en hardware Apple Silicon.

La arquitectura subyacente es Qwen3.5 (tag `qwen3_5` en Hugging Face), con 4.539.265.536 parámetros totales según los pesos safetensors del repositorio. El pipeline declarado es `image-text-to-text`, con modo conversacional, lo que permite interrogar al modelo sobre el documento además de transcribirlo.

Su relevancia actual radica en dos factores: por un lado, la demanda creciente de pipelines de digitalización de documentos que produzcan Markdown limpio y estructurado (listo para RAG, bases de conocimiento o repositorios documentales); por otro, la conversión a MLX, que abre la inferencia local en Macs con memoria unificada sin depender de CUDA. El repositorio tiene 44 descargas y 0 likes en el momento de la consulta, y fue creado el 6 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basada en Qwen3.5 (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta variante); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | openrail |
| Formato de pesos | safetensors (formato MLX); tamano del repo 9,1 GB |

## Arquitectura y entrenamiento

El modelo base es `datalab-to/chandra-ocr-2`, del que no se dispone de detalle técnico en la información proporcionada. El tag `qwen3_5` indica que la arquitectura deriva de la familia Qwen3.5, un transformer multimodal de tipo image-text-to-text con 4,54 mil millones de parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

Esta variante concreta es una conversión de pesos a MLX en bfloat16 realizada por el usuario `fkrf22`, sin indicios de reentrenamiento o fine-tuning adicional más allá de la conversión de formato. El tamaño del repositorio (9,1 GB) es coherente con pesos en bf16 para 4,54 mil millones de parámetros, incluyendo presumiblemente el codificador visual. No se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Extracción de texto desde imágenes de documentos y PDF, con salida en Markdown.
- Preservación de estructura de layout: el tag `layout` sugiere manejo de disposición de página, aunque el alcance exacto (tablas, columnas, figuras) no está documentado en la información disponible.
- Conversión de PDF a Markdown como flujo principal de uso.
- Pipeline `image-text-to-text`: acepta imagen y texto como entrada y genera texto.
- Modo conversacional: permite interacción multi-turno sobre el documento.
- Ejecución nativa en Apple Silicon mediante MLX.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Tool calling, agentes, visión general, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen del documento y devuelve Markdown estructurado que puede parsearse con expresiones regulares o modelos ligeros para extraer campos (importes, fechas, CIF). Adecuado por su enfoque específico en layout y su tamaño contenido (4,54 B), que permite ejecución local.
- Construcción de bases de conocimiento para RAG: conversión masiva de PDFs corporativos a Markdown limpio antes de la fragmentación e indexación en un vector store. El formato Markdown preserva jerarquía de secciones, lo que mejora la calidad de los chunks.
- Procesamiento local en Mac para equipos de investigación: al estar en formato MLX, se puede ejecutar en un MacBook con memoria unificada sin GPU dedicada, útil para prototipado y para entornos con requisitos de privacidad donde los documentos no pueden salir del dispositivo.
- Extracción de tablas de informes financieros: el tag `layout` y la salida Markdown permiten reconstruir tablas como sintaxis de tabla Markdown, facilitando su posterior conversión a CSV o DataFrame.
- Archivística y bibliotecas digitales: conversión de escaneos históricos a texto estructurado para catálogos y buscadores internos, con la ventaja de ejecución local que evita enviar material con derechos de autor a APIs externas.
- Automatización de ingesta documental en pipelines de datos: integración como etapa de preprocesado que normaliza documentos heterogéneos (PDF nativo, escaneado, captura) a un único formato Markdown antes de etapas posteriores de NLP.
- Asistente conversacional sobre documentos: gracias al modo conversacional del pipeline, se puede preguntar al modelo por el contenido de una imagen de documento en varios turnos, por ejemplo para aclarar la lectura de un campo ambiguo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: con 4,54 mil millones de parámetros en bf16, los pesos ocupan aproximadamente 9,1 GB; sumando el codificador visual y el espacio de activaciones y caché KV, se recomienda un mínimo de 12-16 GB de memoria unificada o VRAM.
- Esta variante está pensada para MLX, es decir, Apple Silicon (series M1, M2, M3, M4 y superiores). Un Mac con 16 GB de memoria unificada es el límite inferior razonable; 24-32 GB ofrece margen para contextos largos y lotes mayores.
- En GPUs NVIDIA no es directamente utilizable en formato MLX; requeriría conversión a otro formato (no disponible en este repositorio).
- Opciones de despliegue: `mlx-vlm` / MLX (librería declarada: `mlx`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| chandra-ocr-2-mlx-bf16 (este) | 4,54 B | no disponible | OCR documento a Markdown | openrail | safetensors MLX |
| datalab-to/chandra-ocr-2 (base) | no disponible | no disponible | OCR documento a Markdown | openrail (segun esta variante) | no disponible |
| Alternativas OCR VLM de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales en los datos proporcionados, por lo que no se pueden contrastar rendimiento ni cifras de benchmarks frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo derivado de Qwen3.5, puede heredar sesgos del corpus de entrenamiento original, pero no se aportan datos concretos.
- Riesgo de alucinación: relevante en tareas OCR, donde el modelo puede generar texto plausible que no aparece en la imagen, especialmente en documentos degradados o con tablas complejas. No hay evaluación publicada que cuantifique este riesgo.
- Idiomas: no se declaran idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas sin evaluación propia.
- Contexto: la longitud de contexto no está documentada, lo que limita la planificación de documentos de muchas páginas.
- Licencia openrail: permite uso comercial con condiciones (obligaciones de atribución y cláusulas de uso aceptable); conviene revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- Variante comunitaria: al ser una conversión no oficial a MLX, no hay garantía de paridad numérica exacta con el modelo base; se recomienda validar la salida frente al original en un conjunto de documentos de referencia.
- Ecosistema restringido: al estar en formato MLX, no es portable a GPUs NVIDIA ni a servidores x86 sin conversión adicional.
- Madurez: 44 descargas y 0 likes indican un modelo muy reciente y con poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fkrf22/chandra-ocr-2-mlx-bf16
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- Repositorio del autor en Hugging Face: https://huggingface.co/fkrf22
