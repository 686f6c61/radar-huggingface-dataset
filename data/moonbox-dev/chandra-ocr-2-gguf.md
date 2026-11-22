# moonbox-dev/chandra-ocr-2-GGUF

## Resumen

Chandra OCR 2 GGUF es la distribución cuantizada en formato GGUF de Chandra OCR 2, un modelo vision-language especializado en reconocimiento óptico de caracteres y parseo de documentos desarrollado por Datalab. Esta versión la publica moonbox-dev para su uso con llama.cpp en entornos locales (Metal, CUDA, Vulkan y CPU), lo que permite ejecutar OCR de alta precisión sin depender de servicios en la nube. El modelo base emplea un backbone de lenguaje Qwen3.5 con aproximadamente 4.960 millones de parámetros y un encoder visual separado que se distribuye en un fichero `mmproj` independiente.

El modelo resuelve el problema de extraer texto estructurado de imágenes y PDF preservando el layout: devuelve HTML con bloques de layout (prompt `ocr_layout`) o HTML plano (prompt `ocr`), que la librería del autor convierte a Markdown o JSON mediante `parse_markdown`. Es relevante ahora porque ofrece una alternativa de OCR de código abierto ejecutable en hardware de consumo, con cuantizaciones desde 3,17 GB (Q4_K_M) hasta 9,94 GB (BF16), y porque mantiene la capa de predicción multi-token de Qwen3.5 en el fichero convertido.

El repositorio incluye seis precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) más el encoder visual compartido en F16 (672,4 MB). La licencia es AI Pubs OpenRAIL-M modificada por Datalab, con restricciones de uso basadas en casos de uso (Attachment A) que afectan tanto a los ficheros derivados como a sus usuarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer: encoder visual + merger + LLM Qwen3.5 con capa de predicción multi-token y atención lineal en algunas capas |
| Parametros totales | 4.962.050.048 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); encoder visual siempre en F16 |
| Idiomas soportados | no disponible (el benchmark interno usa inglés y chino) |
| Licencia | AI Pubs OpenRAIL-M modificada (openrail-m-datalab); restricciones de uso en Attachment A |
| Formato de pesos | GGUF (llama.cpp); fichero de modelo + `mmproj-chandra-ocr-2-F16.gguf` |

## Arquitectura y entrenamiento

La arquitectura combina un encoder visual y un merger, empaquetados en `mmproj-chandra-ocr-2-F16.gguf` y mantenidos en F16 para todas las precisiones, con un modelo de lenguaje Qwen3.5 que conserva su capa de predicción multi-token. Según la model card, el conversor de llama.cpp (`conversion/qwen.py`) reescribe algunos tensores del modelo base mediante fórmulas: los pesos de normalización se almacenan como `1 + w`, `A_log` se guarda como `-exp(A_log)`, las cabezas de valor de la atención lineal se reordenan y los kernels de convolución se comprimen. El resto de tensores es idéntico byte a byte al checkpoint original.

La conversión se realizó desde `datalab-to/chandra-ocr-2` en la revisión `af93b47dba` con llama.cpp `b12621`: `convert_hf_to_gguf.py` generó el fichero BF16 y el `mmproj`, y `llama-quantize` produjo las demás precisiones con sus mezclas estándar, sin matriz de importancia. Antes de la subida se verificó que cada tensor del checkpoint original apareciera con los mismos valores en el fichero BF16 y en el `mmproj`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento óptico de caracteres sobre imágenes y páginas de PDF, con salida en HTML, Markdown y JSON.
- Preservación del layout del documento mediante el prompt `ocr_layout`, que devuelve HTML con bloques de layout.
- Extracción de texto plano estructurado mediante el prompt `ocr`, que devuelve HTML reducible a texto.
- Procesamiento de documentos con texto mixto en varios idiomas (el benchmark interno cubre inglés y chino).
- Inferencia conversacional a través de `/v1/chat/completions` en `llama-server`, enviando la página como parte `image_url`.
- Decodificación greedy recomendada (`temperature` 0) para resultados deterministas.
- Ejecución en Metal, CUDA, Vulkan y CPU mediante llama.cpp.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Digitalización de facturas y albaranes: enviar cada página como `image_url` con el prompt `ocr_layout` permite obtener HTML con bloques de layout y convertirlo a Markdown o JSON para alimentar un ERP, con la ventaja de que el modelo corre en local y los documentos no salen de la infraestructura propia.
- Extracción de texto de PDF escaneados en archivos históricos: la cuantización Q6_K (4,08 GB) mantiene la misma tasa de error de caracteres que BF16 en el benchmark del autor, lo que la hace adecuada para lotes masivos en servidores con GPU modesta.
- Procesamiento por lotes en estaciones de trabajo con GPU de consumo: Q4_K_M (3,17 GB) y Q5_K_M (3,62 GB) caben en GPUs con 8 GB de VRAM y procesan páginas en torno a 0,8-0,9 s por página en una RTX 3080 Laptop según las mediciones del autor.
- Automatización de la ingesta documental en pipelines de CI/CD o ETL: al exponerse como servidor compatible con la API de chat de OpenAI, puede integrarse con clientes existentes y encadenarse con pasos posteriores de `parse_markdown` para normalizar la salida.
- OCR en el borde (on-device) para aplicaciones de escritorio o móviles: los builds GGUF funcionan en CPU y Metal, lo que permite escanear documentos en un portátil sin conexión ni coste por API.
- Extracción de tablas y contenido estructurado de informes: el prompt `ocr_layout` conserva la organización en bloques, útil para reconstruir tablas y secciones antes de convertirlas a Markdown para documentación técnica.
- Preprocesado de corpus para entrenamiento de modelos: convertir grandes volúmenes de PDF a texto con un modelo local y determinista (greedy) reduce la dependencia de servicios externos y facilita la reproducibilidad.

## Benchmarks y rendimiento

Los datos disponibles provienen del conjunto de evaluación interno de Moonbox: 12 páginas sintéticas (6 en inglés y 6 en chino) renderizadas con fuentes de Windows, con ground truth exacta. La tarea es el prompt `ocr` con decodificación greedy, la respuesta HTML se reduce a texto plano y se mide la tasa de error de caracteres (CER) por idioma ignorando espacios. La ejecución se hizo con `llama-server` sobre CUDA en una RTX 3080 Laptop. El modelo original en transformers con bf16 obtiene CER 0,0 % / 0,49 % (duplica un carácter en una página china).

| Precision | Tamano | CER ingles / chino | Coincidencia exacta con BF16 (paginas) | Tiempo por pagina (CUDA) | Estado |
|---|---|---|---|---|---|
| BF16 | 9,94 GB | 0,0 % / 0,5 % | referencia | 1,52 s | valido |
| F16 | 9,94 GB | 0,0 % / 4,4 % | 6 + 5 de 12 | 1,53 s | experimental |
| Q8_0 | 5,29 GB | 0,0 % / 4,4 % | 6 + 5 de 12 | 1,02 s | experimental |
| Q6_K | 4,08 GB | 0,0 % / 0,5 % | 6 + 6 de 12 | 0,88 s | valido |
| Q5_K_M | 3,62 GB | 2,5 % / 4,4 % | 5 + 5 de 12 | 0,90 s | experimental |
| Q4_K_M | 3,17 GB | 0,0 % / 4,4 % | 6 + 5 de 12 | 0,80 s | experimental |

Según el autor, BF16 y Q6_K reproducen exactamente la salida del original. F16, Q8_0, Q5_K_M y Q4_K_M añaden una cabecera de sección inexistente en una página china, y Q5_K_M además lee mal una página inglesa; por eso se marcan como experimentales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el encoder visual F16 (672,4 MB) y el overhead de contexto. Orientativamente: Q4_K_M ~3,8 GB, Q5_K_M ~4,3 GB, Q6_K ~4,8 GB, Q8_0 ~6,0 GB, BF16/F16 ~10,6 GB, sumando el `mmproj` y el margen de trabajo.
- GPU recomendadas: RTX 3080 Laptop (medición del autor), RTX 4090, A100 y H100 para despliegues de mayor volumen; cualquier GPU con soporte CUDA, Vulkan o Metal.
- Cabe en GPU de consumo: sí. Q4_K_M y Q5_K_M en GPUs de 8 GB; Q6_K en GPUs de 8-12 GB; Q8_0 en 12 GB o más; BF16/F16 en 16 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) con `-ngl 99`; también es compatible con endpoints según los tags del repositorio. No se documentan en la información disponible integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: 1,52 s por página con BF16, 0,88 s con Q6_K, 0,80 s con Q4_K_M y 1,02 s con Q8_0, medidos en una RTX 3080 Laptop con CUDA. No se dispone de datos de throughput agregado ni de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chandra OCR 2 (este, GGUF) | 4,96 B | no disponible | OCR y parseo de documentos con salida HTML/Markdown/JSON | OpenRAIL-M modificada (Datalab) | GGUF en Hugging Face, ejecutable en llama.cpp |
| Chandra OCR 2 (original) | 4,96 B | no disponible | Igual, pesos completos en transformers | OpenRAIL-M modificada (Datalab) | Hugging Face (`datalab-to/chandra-ocr-2`) |
| Otros modelos OCR open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables, por lo que la comparativa se limita al modelo base y su versión cuantizada.

## Limitaciones y advertencias

- Las cuantizaciones F16, Q8_0, Q5_K_M y Q4_K_M están marcadas como experimentales: introducen una cabecera de sección espuria en una página china del benchmark y Q5_K_M además falla en una página inglesa. Para producción sensible a la fidelidad, usar BF16 o Q6_K.
- El benchmark del autor es muy reducido (12 páginas sintéticas en inglés y chino) y no cubre otros idiomas, tablas complejas, manuscritos ni documentos degradados; el rendimiento en dominios reales puede diferir.
- No se documentan los idiomas soportados oficialmente; la única evidencia es el conjunto de evaluación interno en inglés y chino.
- La licencia AI Pubs OpenRAIL-M modificada de Datalab incluye restricciones de uso en el Attachment A que se aplican a los ficheros derivados y a sus usuarios; es imprescindible revisar `LICENSE` antes de cualquier uso comercial.
- Riesgo de alucinación: como modelo generativo, puede añadir contenido no presente en la imagen (el propio benchmark detecta cabeceras inventadas en algunas cuantizaciones).
- La conversión modifica tensores de Qwen3.5 por fórmula; aunque se verificó la equivalencia de valores, cualquier cambio en versiones futuras de llama.cpp podría afectar a la compatibilidad.
- Requiere llama.cpp `b12621` o superior y el fichero `mmproj` en F16 junto al modelo; no funciona con un único fichero.
- No se documentan capacidades de tool calling, agentes ni contexto largo, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/chandra-ocr-2-GGUF
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- Repositorio del autor (prompts y `parse_markdown`): https://github.com/datalab-to/chandra
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de Datalab: https://www.datalab.to
- Ficheros: [F16](https://huggingface.co/moonbox-dev/chandra-ocr-2-GGUF/blob/main/chandra-ocr-2-F16.gguf), [BF16](https://huggingface.co/moonbox-dev/chandra-ocr-2-GGUF/blob/main/chandra-ocr-2-BF16.gguf), [Q8_0](https://huggingface.co/moonbox-dev/chandra-ocr-2-GGUF/blob/main/chandra-ocr-2-Q8_0.gguf), [Q6_K](https://huggingface.co/moonbox-dev/chandra-ocr-2-GGUF/blob/main/chandra-ocr-2-Q6_K.gguf), [Q5_K_M](https://huggingface.co/moonbox-dev/chandra-ocr-2-GGUF/blob/main/chandra-ocr-2-Q5_K_M.gguf), [Q4_K_M](https://huggingface.co/moonbox-dev/chandra-ocr-2-GGUF/blob/main/chandra-ocr-2-Q4_K_M.gguf), [mmproj](https://huggingface.co/moonbox-dev/chandra-ocr-2-GGUF/blob/main/mmproj-chandra-ocr-2-F16.gguf)
