# btbtyler09/shrew-ocr-preview-lora

## Resumen

`shrew-ocr-preview-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por btbtyler09 (Tyler Brooker) sobre el modelo base `ibm-granite/granite-vision-4.1-4b`, un transformer multimodal de 4.000 millones de parámetros. Su propósito es convertir imágenes de páginas de documentos en JSON estructurado que incluye metadatos, resumen, fragmentos semánticos listos para sistemas RAG, y figuras o tablas con sus correspondientes bounding boxes y representación HTML. El adaptador está diseñado específicamente para tareas de inteligencia documental y extracción estructurada, y se distribuye bajo licencia Apache 2.0.

Este repositorio contiene únicamente el adaptador LoRA (2,0 GB en bf16), no el modelo fusionado. El adaptador se aplica exclusivamente a las proyecciones del decoder de lenguaje (q/k/v/o y gate/up/down) en las 40 capas del modelo base, dejando intacta la torre de visión y los proyectores. Para inferencia se recomienda usar las versiones fusionadas (`shrew-ocr-preview` en bf16 o `shrew-ocr-preview-GPTQ-8bit`), que ofrecen mayor throughput. Este repositorio es útil para composición de adaptadores, inspección del delta de entrenamiento o para continuar el entrenamiento.

La relevancia actual de este modelo radica en la creciente demanda de pipelines de procesamiento documental que integren OCR de alta calidad con extracción estructurada, especialmente en entornos empresariales y de investigación donde se necesita alimentar sistemas RAG con datos semánticamente organizados. Al ser un adaptador LoRA, permite adaptar un modelo base potente con un coste de entrenamiento reducido y un tamaño de despliegue contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=256, α=512, dropout 0.05) sobre decoder de lenguaje de un transformer multimodal (granite-vision-4.1-4b) |
| Parametros totales | no disponible (el adaptador ocupa 2,0 GB en bf16) |
| Parametros activos | no aplica (no es MoE; el adaptador añade parámetros entrenables sobre el modelo base congelado) |
| Longitud de contexto | 32.768 tokens (según la documentación de la versión GGUF del modelo fusionado) |
| Tipos de cuantizacion | bf16 (adaptador); las versiones fusionadas ofrecen INT8 (GPTQ) y GGUF Q8_0/f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PEFT) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica únicamente a las proyecciones del decoder de lenguaje (query, key, value, output y gate/up/down) en las 40 capas del modelo base `ibm-granite/granite-vision-4.1-4b`. La torre de visión y los proyectores permanecen congelados, de modo que toda la adaptación a la tarea de extracción estructurada reside en los bloques de lenguaje. El rango del adaptador es 256 y el factor de escala α es 512, con un dropout de 0.05. El entrenamiento se realizó con la librería PEFT (versión 0.18.1), aunque no se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

Una característica técnica destacable es el sistema de preparación de páginas "glyph-routed" y el uso de "bucket tile grids" específicos (por ejemplo, `[[1536, 1152], [2304, 1536], [3072, 2304], [1152, 1152]]`) que deben configurarse tanto en el modelo como en el procesador de imágenes antes de la inferencia. Sin esta configuración, la calidad de salida se degrada severamente. El adaptador está pensado para trabajar con un system prompt fijo (`structured_extraction`) y temperatura 0.

## Capacidades

- Generación de JSON estructurado a partir de imágenes de páginas de documentos, incluyendo metadatos, resumen y fragmentos semánticos.
- Extracción de figuras y tablas con bounding boxes y representación HTML.
- Preparación de contenido para pipelines RAG (fragmentos semánticos listos para indexación).
- OCR de documentos con reconocimiento de estructura (orden de lectura, tablas, figuras).
- Integración con sistemas de procesamiento documental mediante la referencia `shrew-server` (PDF de entrada, JSON estructurado de salida).
- Soporte de inferencia con vLLM mediante `--enable-lora --max-lora-rank 256`.
- Capacidad de composición con otros adaptadores LoRA y de entrenamiento continuado.

## Casos de uso

- **Digitalización de documentos para RAG**: el modelo convierte cada página escaneada en un JSON con fragmentos semánticos que pueden indexarse directamente en una base vectorial, facilitando la recuperación de información en sistemas de preguntas y respuestas sobre documentación corporativa.
- **Extracción de metadatos de facturas y recibos**: permite obtener campos estructurados como fecha, importe, proveedor o número de factura a partir de imágenes, automatizando procesos de contabilidad y auditoría.
- **Procesamiento de artículos científicos**: extrae figuras y tablas con sus bounding boxes y HTML, lo que facilita la creación de bases de datos de conocimiento científico y la comparación de resultados entre publicaciones.
- **Generación de resúmenes de páginas de documentos**: el modelo produce un resumen automático de cada página, útil para la creación de índices, catálogos o resúmenes ejecutivos de informes extensos.
- **Automatización de formularios escaneados**: en sectores como banca o seguros, el modelo puede extraer los campos relevantes de formularios manuscritos o impresos, reduciendo la intervención manual.
- **Archivado y búsqueda en bibliotecas digitales**: convierte libros y periódicos escaneados en texto estructurado con metadatos, permitiendo búsquedas semánticas y análisis de contenido histórico.
- **Asistencia a la accesibilidad**: transforma documentos visuales en formatos legibles por máquina, lo que facilita la lectura por lectores de pantalla o la conversión a otros formatos accesibles.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible de este repositorio. La model card del adaptador remite a la del modelo fusionado (`shrew-ocr-preview`) para los resultados medidos en el corpus OHR-Bench (8.561 páginas), donde se evalúa retrieval hit@5 y MRR@10 frente a anotaciones humanas, MinerU y PaddleOCR. También se documentan modos de fallo conocidos (escaneos densos de periódicos, scripts no latinos y orden de lectura en periódicos). Se recomienda consultar la model card del modelo fusionado para obtener los datos cuantitativos.

## Requisitos de hardware

- El adaptador añade 2,0 GB en bf16 al modelo base `granite-vision-4.1-4b` (4B parámetros). En bf16, el modelo base ocupa aproximadamente 8 GB, por lo que la carga combinada ronda los 10 GB de VRAM.
- GPU recomendadas: tarjetas con al menos 12-16 GB de VRAM para inferencia en bf16 (por ejemplo, RTX 3080/4080/4090, A10, A100). Para versiones cuantizadas (GPTQ-8bit o GGUF), el requisito baja a 4-7 GB.
- Opciones de despliegue: vLLM con soporte LoRA (`--enable-lora --max-lora-rank 256`), Transformers + PEFT, o las versiones fusionadas para llama.cpp (GGUF) y GPTQ.
- Rendimiento medido: ~590 tokens/s de decode ceiling para el modelo base + adaptador, frente a 850-1.400 tokens/s para la versión fusionada INT8 en el mismo hardware.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas como MinerU o PaddleOCR, que aparecen como referencias en el benchmark OHR-Bench. El adaptador se posiciona como una solución específica para extracción estructurada de documentos, mientras que MinerU y PaddleOCR son herramientas de OCR generalistas. En ausencia de números públicos, se recomienda consultar la model card del modelo fusionado para ver los resultados comparativos. La alternativa más directa es el propio modelo fusionado `shrew-ocr-preview` (bf16) y sus variantes cuantizadas, que ofrecen mayor throughput y menor requisito de VRAM a costa de una ligera pérdida de calidad (por ejemplo, +0,25% de perplexidad en dominio para la versión INT8).

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; su rendimiento en otros idiomas puede ser deficiente.
- Riesgo de alucinación en la extracción de campos o en la generación de resúmenes, especialmente en documentos con baja calidad de escaneo o tipografías complejas.
- Limitaciones conocidas: escaneos densos de periódicos, scripts no latinos y orden de lectura en periódicos de gran formato.
- El adaptador requiere una configuración específica de "bucket tile grids" y system prompt (`structured_extraction`) para funcionar correctamente; sin ella, la calidad se degrada severamente.
- Es una versión preview: los pesos se actualizan en el repositorio bajo el mismo nombre. Se recomienda fijar un commit (`revision=`) para reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (`ibm-granite/granite-vision-4.1-4b`) también está bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- [Repositorio del adaptador en Hugging Face](https://huggingface.co/btbtyler09/shrew-ocr-preview-lora)
- [Modelo fusionado bf16](https://huggingface.co/btbtyler09/shrew-ocr-preview)
- [Modelo fusionado GPTQ-8bit](https://huggingface.co/btbtyler09/shrew-ocr-preview-GPTQ-8bit)
- [Modelo fusionado GGUF](https://huggingface.co/btbtyler09/shrew-ocr-preview-GGUF)
- [Modelo base IBM Granite Vision 4.1 4B](https://huggingface.co/ibm-granite/granite-vision-4.1-4b)
- [GitHub del autor](https://github.com/btbtyler09)
- [Repositorio del servidor de referencia (shrew-server)](https://github.com/btbtyler09/shrew-server)
