# prithivMLmods/OCRia-1-GGUF

## Resumen

OCRia-1-GGUF es la distribucion en formato GGUF del modelo OCRia-1, un modelo vision-lenguaje de 4.962.050.048 parametros desarrollado por LlamaIndex sobre la base de Qwen3.5-4B. Su proposito es el parseo de documentos de una sola pagina directamente desde la imagen, sin necesidad de motores OCR externos ni capas de texto, transcribiendo el contenido a Markdown estructurado. Esta version concreta la publica el usuario prithivMLmods e incorpora cuantizaciones que van desde Q2_K hasta BF16, ademas de archivos de proyeccion multimodal (mmproj) separados.

El modelo resuelve un problema recurrente en pipelines documentales: la conversion fiel de tablas complejas, graficos, diagramas, formulas y anotaciones manuscritas a formatos estructurados. Convierte tablas con celdas combinadas (`colspan`/`rowspan`) en elementos HTML `<table>`, los graficos de tipo plot en tablas HTML, los diagramas en bloques Mermaid, las formulas y la escritura manual en LaTeX y el formato fino (tachado, subrayado, resaltados, casillas) en etiquetas semanticas.

La relevancia de esta ficha radica en que la version GGUF anade soporte de decodificacion especulativa mediante Multi-Token Prediction (MTP) integrada en los propios pesos, lo que acelera la inferencia local sin requerir un modelo borrador separado. El modelo se posiciona como el mejor modelo de pesos abiertos en ParseBench 2 (85,24 global sobre 4.317 paginas) y ParseBench 1 (84,65 global sobre 2.078 paginas, con 82,47 en graficos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basado en Qwen3.5-4B, con MTP para decodificacion especulativa |
| Parametros totales | 4.962.050.048 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (segun la prueba de ejecucion documentada) |
| Tipos de cuantizacion | BF16, Q2_K, Q3_K_L, Q3_K_M, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S, Q6_K, Q8_0; mmproj en BF16 y Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | ocria-1-license (OCRia-1 Model and Code License) |
| Formato de pesos | GGUF (incluye archivos mmproj separados para la parte visual) |

## Arquitectura y entrenamiento

OCRia-1 se construye sobre Qwen3.5-4B como modelo base y anade capacidades de vision para el parseo de imagenes de pagina. El entrenamiento combino tres fases: ajuste fino supervisado (SFT), aprendizaje por refuerzo GRPO con recompensas verificables especificas por dimension (dimension-specific rewards) y promediado de checkpoints (checkpoint averaging). El corpus de entrenamiento consta de 100.979 paginas reales y sinteticas.

La innovacion tecnica mas destacable en esta distribucion GGUF es la integracion de Multi-Token Prediction (MTP) directamente en los pesos: en lugar de emplear un modelo borrador separado para decodificacion especulativa, el archivo GGUF incluye cabeceras de salida adicionales que predicen multiples tokens futuros en una sola pasada forward. Esto acelera la inferencia local manteniendo la calidad del modelo principal. La parte visual se distribuye en archivos mmproj independientes (BF16 o Q8_0) que deben cargarse junto al modelo de lenguaje.

## Capacidades

- Parseo de documentos de una sola pagina desde imagen a Markdown estructurado, sin OCR externo ni capa de texto.
- Conversion de tablas multi-nivel y con celdas combinadas (`colspan`/`rowspan`) a HTML `<table>`.
- Conversion de graficos de tipo plot a tablas HTML.
- Conversion de diagramas a bloques Mermaid.
- Transcripcion de formulas matematicas y escritura manuscrita a LaTeX.
- Representacion de formato fino (tachado, subrayado, resaltados, casillas, elementos de pagina, marcas de agua) mediante etiquetas semanticas.
- Grounding visual opcional a posteriori mediante `ocria_grounding`.
- Decodificacion especulativa integrada via MTP para acelerar la generacion.
- Soporte de inferencia multimodal image-text-to-text.
- Compatibilidad con endpoints y con LlamaIndex para integracion en pipelines RAG.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo procesa la imagen de cada pagina y extrae tablas de lineas de detalle con celdas combinadas a HTML estructurado, apto para su volcado posterior a un ERP.
- Conversion de informes financieros con graficos: los plots se transforman en tablas HTML, lo que permite extraer series de datos de graficos de barras o lineas sin postproceso manual.
- Migracion de documentacion tecnica a Markdown: diagramas de arquitectura pasan a bloques Mermaid y formulas a LaTeX, facilitando la versionabilidad en repositorios Git.
- Procesamiento de formularios escaneados y manuscritos: la transcripcion a LaTeX y las etiquetas semanticas capturan campos, casillas y anotaciones, util en digitalizacion de archivos administrativos.
- Pipelines RAG sobre PDFs escaneados: integrado via LlamaIndex, el modelo genera Markdown limpio que alimenta indices de recuperacion sin depender de capas de texto embebidas.
- Extraccion de tablas regulatorias o cientificas: la fidelidad en `colspan`/`rowspan` permite reconstruir tablas complejas de normativa o papers para su analisis automatico.
- Despliegue en local con llama.cpp u Ollama: las cuantizaciones Q4_K_M (3,17 GB) o Q8_0 (5,29 GB) permiten ejecutar el parseo en estaciones de trabajo sin GPU de datacenter.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| ParseBench 2 | 85,24 global | Sobre 4.317 paginas; mejor modelo de pesos abiertos |
| ParseBench 1 | 84,65 global | Sobre 2.078 paginas; mejor modelo de pesos abiertos |
| ParseBench 1 (charts) | 82,47 | Subconjunto de graficos |

Prueba de ejecucion documentada (Q8_0 + mmproj BF16, NVIDIA RTX PRO 6000 Blackwell Server Edition, 96 GB VRAM, llama-cli con offload completo y MTP):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.863,07 tokens/s |
| Velocidad media de generacion | 335,73 tokens/s |
| Tiempo total de pared | 19,8 segundos |
| Longitud de contexto | 16.384 tokens |
| KV cache (K) | q8_0 |
| VRAM pico en GPU | 6,62 GiB |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,62 GiB en pico con Q8_0 y mmproj BF16 (dato medido); las cuantizaciones Q4 rondan 3 GB de pesos mas el proyector y la cache KV.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (probada), A100, H100 para despliegues de alto throughput; RTX 4090 y RTX 3090 son suficientes para Q8_0.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para Q4_K_M/Q5_K_M; Q8_0 requiere alrededor de 8-10 GB para margen comodo.
- Opciones de despliegue: llama.cpp (llama-cli, probado), Ollama, vLLM (con pesos BF16 originales), Transformers y text-generation-inference.
- Latencia y throughput: 335,73 tokens/s de generacion y 1.863,07 tokens/s de prompt processing en la GPU de referencia con MTP activo; en GPUs de consumo el throughput sera proporcionalmente menor.
- Los archivos mmproj (BF16 676 MB o Q8_0 367 MB) deben cargarse junto al modelo para habilitar la vision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1 (este) | 4,96 B | 16.384 | Parseo de documentos a Markdown | ocria-1-license (uso no competitivo gratuito bajo 2 M USD de ingresos) | GGUF, BF16, MTP repackaged |
| Qwen3.5-4B (base) | ~4 B | no disponible | LLM texto multimodal generico | no disponible | no disponible |
| Alternativas de parseo documental | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos directamente comparables; la comparativa se limita al modelo base y a la categoria funcional.

## Limitaciones y advertencias

- Solo soporta ingles como idioma declarado; el rendimiento en documentos en castellano no esta documentado.
- Orientado a documentos de una sola pagina; el parseo multipagina requiere segmentacion previa.
- Riesgo de alucinacion en tablas muy densas o imagenes de baja calidad; conviene validar la salida estructurada en produccion.
- La licencia ocria-1-license restringe el uso comercial: gratuito para investigacion, uso personal y organizaciones no competidoras con menos de 2 M USD de ingresos y financiacion anuales; por encima de ese umbral se requiere licencia comercial.
- El contexto documentado en la prueba es de 16.384 tokens; paginas con mucho contenido pueden truncarse.
- No se han publicado datos de sesgos en la informacion disponible.
- El modelo base es Qwen3.5-4B, por lo que hereda las limitaciones de conocimiento y sesgos de dicho modelo.
- El uso de MTP requiere un runtime compatible con esta extension del formato GGUF; no todos los backends la soportan.

## Enlaces

- Hugging Face (esta version GGUF): https://huggingface.co/prithivMLmods/OCRia-1-GGUF
- Modelo base original: https://huggingface.co/llamaindex/OCRia-1
- Licencia: https://huggingface.co/llamaindex/OCRia-1/blob/main/LICENSE
- Pesos BF16 reempaquetados con MTP: https://huggingface.co/prithivMLmods/OCRia-1-MTP-Repacked
