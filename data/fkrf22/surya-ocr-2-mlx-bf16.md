# fkrf22/surya-ocr-2-mlx-bf16

## Resumen

Surya OCR 2 MLX BF16 es una conversión al framework MLX de Apple del modelo `datalab-to/surya-ocr-2`, un sistema de OCR y análisis de documentos orientado a la extracción de texto, la detección de layout y la conversión de PDFs e imágenes a Markdown. El modelo original lo desarrolla Datalab (equipo detrás de la librería Surya), y esta variante la publica el usuario `fkrf22` en Hugging Face para permitir su ejecución nativa en hardware Apple Silicon mediante MLX.

La arquitectura se etiqueta como `qwen3_5` en los metadatos del repositorio y se expone con el pipeline `image-text-to-text`, es decir, un modelo multimodal que recibe imagen y texto y genera texto. Cuenta con 665.701.440 parámetros totales en pesos safetensors (aproximadamente 0,67 mil millones), lo que lo sitúa en la categoría de modelos compactos y aptos para inferencia en equipos de consumo. El repositorio ocupa 1,3 GB en precisión BF16.

Su relevancia actual radica en que ofrece una vía para ejecutar OCR de documentos de forma local en Macs con chip Apple Silicon, sin depender de servicios en la nube, manteniendo el formato Markdown como salida estructurada. La licencia es OpenRAIL, lo que introduce restricciones de uso que conviene revisar antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según metadatos del repo), multimodal image-text-to-text |
| Parametros totales | 665.701.440 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta variante); otras cuantizaciones no disponibles en la información |
| Idiomas soportados | no disponible |
| Licencia | openrail |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura etiquetada como `qwen3_5`, un transformer multimodal que procesa entradas de imagen y texto para producir salidas textuales. Al tratarse de una conversión del modelo `datalab-to/surya-ocr-2`, la arquitectura y el entrenamiento originales corresponden a Datalab; esta variante únicamente cambia el formato de pesos y el runtime a MLX en BF16, por lo que no introduce un reentrenamiento propio.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card del repositorio es mínima y se limita a etiquetas y metadatos.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y páginas de PDF.
- Conversión de documentos a Markdown como formato de salida estructurado.
- Análisis de layout de documentos (detección de bloques, regiones y estructura de página, según las etiquetas `layout` y `pdf`).
- Procesamiento multimodal imagen-texto: recibe una imagen y una instrucción textual y genera texto.
- Soporte conversacional según el tag `conversational` del repositorio.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modos especiales (thinking, audio, visión adicional): no disponible en la información.

## Casos de uso

- Digitalización de archivos PDF escaneados: el modelo puede procesar páginas como imágenes y emitir el texto reconocido, lo que permite construir pipelines de digitalización masiva ejecutados localmente en un Mac con Apple Silicon.
- Conversión de documentos a Markdown para bases de conocimiento: al generar salida en Markdown, el texto extraído puede ingerirse directamente en sistemas RAG o wikis internas sin post-procesado manual extenso.
- Extracción de estructura de documentos: gracias a la capacidad de layout, se puede usar para identificar secciones, tablas y bloques de una página antes de un análisis posterior.
- Procesamiento de facturas y formularios: el modelo puede transcribir el contenido de documentos administrativos escaneados para alimentar sistemas de contabilidad o gestión documental.
- OCR en local para entornos con requisitos de privacidad: al ejecutarse con MLX en hardware propio, los documentos no salen del equipo, lo que encaja en sectores con datos sensibles (legal, sanitario, administración).
- Prototipado rápido en macOS: desarrolladores que trabajan en Mac pueden integrar el modelo en scripts de Python con MLX para experimentar con OCR sin configurar GPUs NVIDIA ni servicios externos.
- Preprocesado de corpus para entrenamiento: conversión de colecciones de PDFs a texto Markdown limpio como paso previo a la curación de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: con 665,7 millones de parámetros en BF16, los pesos ocupan aproximadamente 1,3 GB; sumando activaciones y buffers de inferencia, se estima un uso de memoria en torno a 2-3 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: al ser una conversión MLX, está orientada a Apple Silicon (series M1, M2, M3, M4 y superiores). No se documenta soporte para A100, H100 o RTX 4090 en esta variante.
- Cabe en GPU de consumo: sí, en términos de memoria; en el ecosistema Apple encaja en equipos con 8 GB de memoria unificada o más, aunque no hay cifras oficiales de consumo.
- Opciones de despliegue: MLX (librería nativa); otras opciones como vLLM, llama.cpp, Ollama o TGI no están indicadas para esta conversión.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime | Notas |
|---|---|---|---|---|---|
| fkrf22/surya-ocr-2-mlx-bf16 | 665,7 M | no disponible | openrail | MLX | Conversión BF16 para Apple Silicon |
| datalab-to/surya-ocr-2 | no disponible en la información | no disponible | no disponible en la información | no disponible | Modelo base original de Datalab |
| Otros modelos OCR open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card es mínima: no documenta sesgos, idiomas soportados ni límites de contexto, lo que dificulta evaluar su robustez en producción.
- Riesgo de alucinación inherente a los modelos generativos: en OCR, puede producir texto plausible que no aparece en la imagen, especialmente en documentos degradados o con tipografías poco habituales.
- Licencia OpenRAIL: incluye restricciones de uso (típicamente prohibiciones sobre usos dañinos y requisitos de atribución); es necesario revisar el archivo LICENSE antes de cualquier despliegue comercial.
- Dependencia del ecosistema MLX: no es directamente portable a GPUs NVIDIA ni a servidores x86 sin conversión adicional.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano u otros idiomas sin pruebas propias.
- Repositorio con muy poca tracción (43 descargas, 0 likes) y sin mantenimiento documentado: conviene verificar la integridad de los pesos y la paridad con el modelo base.
- No se documentan límites de resolución de imagen ni de longitud de documento; el rendimiento puede degradarse en páginas muy densas o de gran tamaño.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fkrf22/surya-ocr-2-mlx-bf16
- Modelo base: https://huggingface.co/datalab-to/surya-ocr-2
- Librería MLX: https://github.com/ml-explore/mlx
- Proyecto Surya (Datalab): no disponible en la información proporcionada
