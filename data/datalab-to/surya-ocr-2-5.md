# datalab-to/surya-ocr-2.5

## Resumen

Surya OCR 2.5 es un modelo de OCR (reconocimiento óptico de caracteres) desarrollado por Datalab, especializado en inteligencia documental. Con 689 millones de parámetros, se posiciona como el modelo abierto de menos de 1B de parámetros con mayor precisión según sus autores, alcanzando 85.9 puntos en OmniParseBench y un 83.7 % en olmOCR-bench. No se limita a transcribir texto: también realiza análisis de layout (tablas, imágenes, cabeceras) con orden de lectura, y genera tablas en HTML con celdas combinadas mediante colspan/rowspan.

El modelo está construido sobre la arquitectura qwen3_5 (según los tags del repositorio) y se distribuye en formato safetensors compatible con la librería transformers. Su relevancia actual radica en el auge de los pipelines de document intelligence: extraer texto estructurado en Markdown o HTML de PDFs, formularios, periódicos o documentos manuscritos es un requisito habitual en sistemas RAG, digitalización de archivos y automatización de procesos. Surya 2.5 destaca además por su velocidad (4.5 páginas/s en una H100 a 192 DPI) y su cobertura multilingüe (91 idiomas evaluados internamente).

Datalab acompaña el modelo con herramientas complementarias más pequeñas para detección de líneas de texto y detección de errores de OCR, y ofrece una plataforma gestionada de pago (con playground público) para quien prefiera no desplegarlo por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en qwen3_5 (image-text-to-text), detalles completos no disponibles |
| Parametros totales | 689.356.864 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors, 1.4 GB) |
| Idiomas soportados | Multilingüe: 91 idiomas evaluados en benchmark interno (74.9 % de precisión); lista completa no disponible |
| Licencia | OpenRAIL-M (el código asociado usa Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Surya 2.5 es un modelo multimodal image-text-to-text basado en la arquitectura qwen3_5, integrado con la librería transformers de Hugging Face. Con 689M de parámetros, pertenece a la gama de modelos compactos optimizados para tareas concretas de visión documental en lugar de conversación general. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque los ejemplos mostrados (periódicos históricos, artículos matemáticos, formularios gubernamentales, cartas manuscritas, documentos corporativos y formularios fiscales japoneses) sugieren un entrenamiento sobre documentos muy heterogéneos.

Una innovación destacable es el uso de MTP (multi-token prediction), que según Datalab multiplica por 1.7 el rendimiento respecto a Surya 2, alcanzando 4.5 páginas/s en una H100 a 192 DPI. El modelo genera salidas estructuradas en HTML y Markdown, e incorpora módulos auxiliares (modelos más pequeños para detección de líneas de texto y detección de errores de OCR) que forman parte del ecosistema. No hay información disponible sobre el uso de RLHF o DPO en su entrenamiento.

## Capacidades

- OCR de alta precisión sobre documentos diversos: periódicos, libros de referencia, artículos científicos con matemáticas, formularios, texto manuscrito y documentos corporativos.
- Análisis de layout: detección de elementos estructurales (tablas, imágenes, cabeceras, etc.) con identificación del orden de lectura.
- Generación de tablas en HTML, incluyendo celdas combinadas mediante colspan/rowspan (la geometría de filas y columnas requiere un checkpoint de Surya 2, según las limitaciones indicadas por el autor).
- Salida en Markdown y HTML para integración en pipelines de procesamiento documental.
- Soporte multilingüe: 74.9 % de precisión en un benchmark interno de 91 idiomas.
- Detección de errores de OCR mediante modelos auxiliares más pequeños incluidos en el ecosistema.
- Detección de líneas de texto (text-line detection) con modelos complementarios.
- Procesamiento a alta velocidad: 4.5 páginas/s en una H100 a 192 DPI.

## Casos de uso

- Digitalización de archivos históricos: periódicos antiguos y libros de referencia escaneados pueden transcribirse a texto estructurado, aprovechando su buen rendimiento en documentos con layouts complejos (los ejemplos oficiales incluyen un periódico de 1881).
- Extracción de datos de formularios: formularios gubernamentales y fiscales (incluidos documentos japoneses) pueden procesarse detectando el layout y extrayendo los campos relevantes.
- Ingesta de documentos para sistemas RAG: la salida en Markdown con orden de lectura correcto facilita la fragmentación semántica de PDFs y documentos corporativos antes de indexarlos en bases vectoriales.
- Transcripción de texto manuscrito: cartas y notas a mano (como los ejemplos de la Library of Congress) pueden digitalizarse para archivos personales, bibliotecas o investigación histórica.
- Procesamiento de artículos científicos con matemáticas: el modelo maneja papers con notación matemática, útil para construir corpus científicos o herramientas de búsqueda académica.
- Automatización de backoffice documental: empresas pueden procesar grandes volúmenes de documentos corporativos a alta velocidad (4.5 páginas/s por H100) en pipelines de facturación, contratos o cumplimiento normativo.
- Control de calidad de OCR existente: los modelos auxiliares de detección de errores permiten auditar y corregir transcripciones generadas por otros sistemas.
- Análisis de layout para enriquecimiento documental: la detección de tablas, imágenes y cabeceras con orden de lectura sirve para reconstruir la estructura original de documentos en flujos de editorial digital.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| OmniParseBench | 85.9 (el más alto entre modelos abiertos <1B según Datalab) |
| olmOCR-bench | 83.7 % |
| Benchmark interno multilingüe (91 idiomas) | 74.9 % |
| Throughput (H100, 192 DPI) | 4.5 páginas/s |

Nota: Datalab no publica en la model card los valores de otros modelos en estos benchmarks, por lo que no es posible incluir una tabla comparativa con números exactos sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1.4 GB en safetensors, por lo que un modelo de 689M de parámetros debería funcionar con holgura en GPUs con 8 GB de VRAM o menos; no hay cifras oficiales de VRAM.
- GPU recomendadas: una H100 se usa como referencia de throughput (4.5 páginas/s a 192 DPI); no hay recomendaciones oficiales para otras GPUs.
- Consumer GPUs: dado su tamaño reducido (689M), es plausible que funcione en GPUs de consumo como una RTX 3060 o RTX 4090, aunque no hay confirmación oficial.
- Opciones de despliegue: librería transformers de Hugging Face (endpoints compatibles); Datalab ofrece además una plataforma gestionada y un playground público. No se menciona soporte para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: 4.5 páginas/s en una H100 a 192 DPI; 1.7x más rápido que Surya 2 gracias a MTP. No hay datos de latencia individual.

## Comparativa con modelos similares

La model card no publica los resultados de los modelos competidores, por lo que la siguiente comparativa se limita a los datos verificables:

| Modelo | Parametros | Benchmarks publicados | Licencia | Notas |
|---|---|---|---|---|
| Surya OCR 2.5 (Datalab) | 689M | 85.9 OmniParseBench; 83.7 % olmOCR-bench | OpenRAIL-M | Layout, orden de lectura, tablas HTML, 91 idiomas |
| Surya 2 (Datalab) | no disponible | no disponible | no disponible | 1.7x más lento que 2.5; necesario para geometría de tablas |
| Chandra (Datalab) | no disponible | no disponible | no disponible | Modelo de mayor precisión de Datalab, con variantes en su plataforma gestionada |
| olmOCR (Ai2) | no disponible | benchmark propio (olmOCR-bench) usado por Surya | no disponible | Competidor de referencia en OCR documental |

## Limitaciones y advertencias

- La geometría de filas y columnas en tablas requiere un checkpoint de Surya 2; Surya 2.5 genera las tablas en HTML pero no la geometría completa, según indica el propio autor.
- La licencia OpenRAIL-M incluye restricciones de uso (open responsible AI license); conviene revisar el archivo LICENSE antes de un despliegue comercial, aunque el código asociado es Apache-2.0.
- La precisión multilingüe (74.9 % en 91 idiomas) deja margen de error, especialmente en idiomas de baja dotación o con escrituras complejas; no hay desglose por idioma.
- El texto manuscrito y documentos degradados (periódicos históricos) pueden seguir produciendo errores de transcripción; se recomienda usar los modelos auxiliares de detección de errores en producción.
- No hay datos publicados sobre tasas de alucinación ni sobre el comportamiento ante documentos fuera de distribución.
- La longitud de contexto y las cuantizaciones disponibles no están documentadas en la model card.
- Los benchmarks (OmniParseBench, olmOCR-bench) proceden del propio autor o de conjuntos donde el autor ha evaluado; conviene validar con datos propios antes de decisiones de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datalab-to/surya-ocr-2.5
- Benchmark OmniParseBench: https://huggingface.co/datasets/datalab-to/omni_parse_bench
- Benchmark olmOCR-bench: https://huggingface.co/datasets/allenai/olmOCR-bench
- Web de Datalab: https://www.datalab.to
- Documentación: https://documentation.datalab.to
- Playground público: https://www.datalab.to/playground
- Repositorio de Chandra (modelo hermano): https://github.com/datalab-to/chandra
- Discord de la comunidad: https://discord.gg/KuZwXNGnfH
- Precios de la plataforma gestionada: https://www.datalab.to/pricing
