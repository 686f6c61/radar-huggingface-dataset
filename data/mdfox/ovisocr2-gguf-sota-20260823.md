# MDfox/OvisOCR2-GGUF-SOTA-20260823

## Resumen

OvisOCR2 es un modelo compacto de 0.8B parámetros diseñado para el parsing de documentos a nivel de página, desarrollado por ATH-MaaS. Dada una imagen de una página, genera una representación en Markdown siguiendo el orden de lectura natural, cubriendo texto, fórmulas, tablas y regiones visuales. El modelo original se describe en el informe técnico arXiv 2607.13639 y se basa en la arquitectura Ovis, que alinea estructuralmente los embeddings visuales y textuales.

Esta ficha cubre la conversión GGUF no oficial publicada por MDfox, que incluye cuantizaciones desde BF16 hasta IQ2_XXS, junto con los proyectores de visión (mmproj) correspondientes. La conversión se realizó con llama.cpp b10502 y se evaluó de forma independiente sobre el benchmark OmniDocBench v1.6_full (1.651 páginas), alcanzando una puntuación global de 96.4451 con la combinación Q8_0 + mmproj-Q8_0, superando la fila líder pública de la tabla oficial en la fecha de publicación (96.34 de PaddleOCR-VL-1.6). El modelo es relevante porque ofrece un rendimiento SOTA en OCR de documentos con un tamaño muy reducido, ejecutable en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Ovis) con proyector de vision |
| Parametros totales | 752.393.024 (0.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuracion de evaluacion; el modelo original no publica un maximo oficial) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ2_M, IQ2_XXS |
| Idiomas soportados | No disponible (el modelo base no publica lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo original OvisOCR2 es un parser de documentos end-to-end de 0.8B parametros. Su arquitectura sigue el diseño Ovis, que alinea estructuralmente los embeddings visuales y textuales mediante un proyector de vision que mapea las caracteristicas de la imagen al espacio de texto. El entrenamiento combina un data engine que filtra anotaciones reales de documentos con paginas sinteticas cuyas imagenes y objetivos Markdown estan alineados, y una receta que incluye supervisión fina (SFT), aprendizaje por refuerzo, destilación on-policy y fusión de modelos. La conversion GGUF elimina la capa MTP/NextN declarada pero no publicada en el modelo fuente, usando `--no-nextn`; no se eliminan pesos de OCR publicados.

## Capacidades

- Generacion de Markdown estructurado a partir de imagenes de paginas de documentos, incluyendo texto, formulas, tablas y regiones visuales.
- Reconocimiento de orden de lectura natural en documentos de varias columnas.
- Soporte de formulas matematicas (CDM) y tablas (TEDS, TEDS-S) con alta precision.
- Procesamiento de imagenes en un rango de 448 a 2880 px, generando entre 196 y 8100 tokens de vision.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues no confirmadas por el autor de la conversion.

## Casos de uso

- Digitalizacion de archivos historicos: el modelo convierte paginas escaneadas a Markdown con orden de lectura correcto, facilitando la indexacion y busqueda en repositorios documentales.
- Extraccion de datos de facturas y recibos: su capacidad para parsear tablas y texto permite automatizar la captura de campos clave (importes, fechas, proveedores) en flujos de contabilidad.
- Conversion de articulos cientificos a formato editable: investigadores pueden transformar PDFs de papers en Markdown para reutilizar formulas y tablas en nuevas publicaciones o para analisis de texto.
- Generacion de contenido accesible: al producir Markdown estructurado, se puede derivar HTML o texto plano para lectores de pantalla, mejorando la accesibilidad de documentos digitalizados.
- Archivado y busqueda empresarial: integrado en pipelines de ingestion, permite convertir grandes volumenes de documentos corporativos a un formato uniforme y consultable.
- Preprocesamiento para RAG: el Markdown generado se puede segmentar y vectorizar para sistemas de recuperacion aumentada, mejorando la precision de respuestas sobre documentacion tecnica o legal.

## Benchmarks y rendimiento

Resultados de la evaluacion independiente sobre OmniDocBench v1.6_full (1.651 paginas) realizada por el autor de la conversion. Las metricas de edicion son menores-es-mejor; el resto, mayores-es-mejor.

| Combinacion | Overall ↑ | Text Edit ↓ | Formula CDM ↑ | Table TEDS ↑ | TEDS-S ↑ | Read Order Edit ↓ | Latencia |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Q8_0 + mmproj-Q8_0 | **96.4451** | **0.02445** | **97.1602** | **94.6205** | **96.9901** | **0.10951** | 13.70 s |
| Q4_K_M + mmproj-Q8_0 | 95.9640 | 0.02499 | 96.7962 | 93.5951 | 95.9249 | 0.11168 | **13.34 s** |
| BF16 + mmproj-BF16 | 96.4017 | 0.02520 | 97.1184 | 94.6067 | 96.9301 | 0.11106 | 16.90 s |
| Q2_K + mmproj-Q8_0 | 87.0212 | 0.07611 | 82.8751 | 85.7996 | 88.2746 | 0.16162 | 34.75 s |

Para referencia, el modelo original en BF16/vLLM obtuvo 96.5943 en la misma evaluacion. La conversion Q2_K genero salida valida en 1.649 de 1.651 paginas y alcanzo el limite de 16.384 tokens en 203 paginas.

Comparativa con filas lideres de la tabla publica de OmniDocBench v1.6_full:

| Metodo | Tamano | Overall ↑ |
|---|---:|---:|
| PaddleOCR-VL-1.6 | 0.9B | 96.34 |
| MinerU2.5-Pro | 1.2B | 95.75 |
| GLM-OCR | 0.9B | 95.22 |

## Requisitos de hardware

- VRAM estimada: la combinacion Q8_0 + mmproj-Q8_0 ocupa 884.8 MiB; Q4_K_M + mmproj-Q8_0, 615.4 MiB; BF16 + mmproj-BF16, 1.644,2 MiB. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: la evaluacion se realizo en una RTX 5060 Ti 16 GB con todos los layers en GPU. Modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores son suficientes.
- Despliegue: compatible con llama.cpp (b10502 o superior), incluyendo `llama-server` con `--mmproj`. Tambien se puede usar con vLLM para el modelo original BF16.
- Latencia: entre 13.34 s y 16.90 s por pagina en la configuracion de prueba (RTX 5060 Ti, 3 slots continuos, batch 8192, Flash Attention, KV cache BF16). La latencia de Q2_K es significativamente mayor (34.75 s) y no se recomienda.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Overall OmniDocBench | Licencia | Formato |
|---|---:|---:|---:|---|---|
| OvisOCR2 (GGUF Q8_0) | 0.8B | 32K (evaluado) | 96.4451 | Apache-2.0 | GGUF |
| PaddleOCR-VL-1.6 | 0.9B | no disponible | 96.34 | Apache-2.0 | no disponible |
| MinerU2.5-Pro | 1.2B | no disponible | 95.75 | no disponible | no disponible |
| GLM-OCR | 0.9B | no disponible | 95.22 | no disponible | no disponible |

La conversion GGUF de OvisOCR2 supera a los modelos lideres de la tabla publica con un tamano similar o menor, aunque la puntuacion es una reproduccion independiente, no un envio oficial al leaderboard.

## Limitaciones y advertencias

- Conversion no oficial: el autor advierte que es una reproduccion independiente y que se debe verificar manualmente la salida OCR en casos criticos.
- La capa MTP/NextN declarada en el modelo fuente no se incluye en la conversion; esto puede afectar a la velocidad de decodificacion especulativa si se esperaba esa funcionalidad.
- La cuantizacion Q2_K degrada notablemente el rendimiento (87.02 overall) y no se recomienda para uso en produccion.
- No se documentan sesgos especificos, pero al ser un modelo OCR, puede presentar errores en documentos con caligrafia poco comun, idiomas no representados en el entrenamiento o diseños muy complejos.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar contenido en regiones ambiguas o de baja calidad de imagen.
- La licencia Apache-2.0 permite uso comercial, pero la conversion no esta afiliada a ATH-MaaS ni a los autores del modelo original.

## Enlaces

- Repositorio HuggingFace de la conversion: https://huggingface.co/MDfox/OvisOCR2-GGUF-SOTA-20260823
- Modelo original: https://huggingface.co/ATH-MaaS/OvisOCR2
- Informe tecnico de OvisOCR2: https://arxiv.org/abs/2607.13639
- Benchmark OmniDocBench: https://github.com/opendatalab/OmniDocBench
- Paper de OmniDocBench: https://arxiv.org/abs/2412.07626
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio Ovis (arquitectura base): https://github.com/ATH-MaaS/Ovis
