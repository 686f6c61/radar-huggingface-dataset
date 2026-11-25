# prithivMLmods/GLM-OCR-GGUF

## Resumen

GLM-OCR-GGUF es la distribucion en formato GGUF del modelo GLM-OCR, un modelo multimodal de 0,9 mil millones de parametros especializado en reconocimiento optico de caracteres (OCR), parsing de documentos y extraccion estructurada de informacion en JSON. Lo desarrolla el autor de Hugging Face prithivMLmods a partir del modelo original zai-org/GLM-OCR, y esta pensado para su ejecucion local mediante llama.cpp, llama-cli y Ollama, sin necesidad de infraestructura de servidor dedicada.

El modelo combina un codificador visual CogViT preentrenado con un conector ligero de reduccion de tokens y un decodificador de lenguaje GLM-0.5B, siguiendo la arquitectura GLM-V de tipo encoder-decoder. Se entreno con perdida de prediccion multi-token (MTP) y aprendizaje por refuerzo sobre tareas completas, y en el SDK oficial funciona junto a una pipeline de analisis de layout en dos etapas basada en PP-DocLayout-V3.

Su relevancia practica radica en que alcanza el primer puesto en OmniDocBench V1.5 con una puntuacion de 94,62, mantiene un rendimiento alto en tablas complejas, formulas matematicas, paginas con mucho codigo y sellos, y todo ello con un peso que cabe en GPUs de consumo. El repo GGUF ocupa 14,3 GB e incluye cuantizaciones desde F32 hasta Q4_K_S, ademas de los ficheros de proyeccion multimodal (mmproj) necesarios para las capacidades de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-V encoder-decoder (codificador visual CogViT + conector de downsample + decodificador GLM-0.5B) |
| Parametros totales | 891.138.048 (0,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (segun la prueba de ejecucion publicada) |
| Tipos de cuantizacion | F32, BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S; mmproj en bf16, f16, f32 y q8_0 |
| Idiomas soportados | zh, en, fr, es, ru, de, ja, ko |
| Licencia | MIT (PP-DocLayout-V3 bajo Apache 2.0) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

GLM-OCR sigue una arquitectura multimodal encoder-decoder: un codificador visual CogViT preentrenado extrae las representaciones de la imagen, un conector ligero reduce la secuencia de tokens visuales y un decodificador de lenguaje GLM-0.5B genera la salida textual o el JSON estructurado. Esta separacion mantiene el coste computacional bajo en la parte de lenguaje mientras conserva un codificador visual robusto para documentos densos.

El entrenamiento empleo una perdida de Multi-Token Prediction (MTP) junto con aprendizaje por refuerzo sobre tareas completas (full-task RL), lo que permite optimizar directamente la calidad de la extraccion estructurada y no solo la perplexidad del texto. En el SDK oficial el modelo se disena para operar junto a una pipeline de analisis de layout en dos etapas basada en PP-DocLayout-V3, que segmenta la pagina antes de pasar cada region al OCR.

## Capacidades

- Reconocimiento optico de caracteres sobre imagenes y paginas de PDF.
- Parsing de documentos con salida en texto plano o en JSON estructurado.
- Extraccion de informacion de tablas complejas.
- Reconocimiento de formulas matematicas.
- Procesamiento de paginas con abundante codigo fuente.
- Deteccion y lectura de sellos.
- Soporte multilingue en ocho idiomas: chino, ingles, frances, espanol, ruso, aleman, japones y coreano.
- Entrada imagen-a-texto (pipeline image-to-text) mediante proyector multimodal.
- Compatibilidad con llama.cpp, llama-cli, Ollama, vLLM, SGLang y Transformers.
- Soporte de conversacion multi-turno (tag conversational).

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo procesa paginas a 1,86 paginas por segundo en PDFs y 0,67 imagenes por segundo, lo que permite convertir lotes documentales completos en texto indexable para busqueda o auditoria.
- Extraccion de datos de facturas y albaranes: genera JSON estructurado directamente desde la imagen, lo que simplifica la integracion con sistemas de contabilidad y ERP sin post-procesado complejo.
- Procesamiento de articulos cientificos: su capacidad para formulas matematicas y tablas complejas lo hace adecuado para convertir papers en Markdown o LaTeX con estructura preservada.
- Lectura de documentacion tecnica con codigo: las paginas con bloques de codigo fuente se transcriben con fidelidad, util para construir bases de conocimiento de APIs y manuales.
- Verificacion documental con sellos: la deteccion de sellos permite validar autenticidad o presencia de firmas en contratos y certificados escaneados.
- Digitalizacion multilingue: al cubrir ocho idiomas, un mismo despliegue puede atender documentacion en espanol, ingles, aleman, frances, ruso, chino, japones y coreano sin cambiar de modelo.
- Ejecucion local en estaciones de trabajo: con cuantizaciones de 531 MB a 950 MB, se puede desplegar en portatiles con GPU modesta o incluso en CPU mediante llama.cpp para procesar documentos sensibles sin salir de la red local.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| OmniDocBench V1.5 | 94,62 (puesto n.º 1 general) |

Datos de rendimiento de inferencia publicados por el autor (GLM-OCR.BF16.gguf con mmproj-bf16, llama-cli, -ngl 99, contexto 8.192, KV cache q8_0, RTX PRO 6000 Blackwell de 96 GB):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 2.521,67 tokens/s |
| Velocidad media de generacion | 643,04 tokens/s |
| Tiempo total de ejecucion | 7,7 s |
| VRAM pico | 3,67 GiB |
| Uso pico de GPU | 89% |
| Decodificacion especulativa | No |

No se han publicado en la informacion disponible resultados comparativos de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje general para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,67 GiB en pico con BF16 y mmproj-bf16 sobre GPU, segun la prueba del autor.
- Con cuantizacion Q4_K_M (549 MB) mas mmproj-q8_0 (484 MB), el modelo cabe holgadamente en GPUs de consumo con 4 GB o mas de VRAM.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor se probo con NVIDIA RTX PRO 6000 Blackwell. A100 y H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU discretas actuales, e incluso en modo CPU puro con llama.cpp.
- Opciones de despliegue: llama.cpp, llama-cli, Ollama, vLLM, SGLang y Transformers.
- Latencia y throughput: 2.521,67 tokens/s de procesamiento de prompt y 643,04 tokens/s de generacion en la configuracion probada; 1,86 paginas/s en PDFs y 0,67 imagenes/s en imagenes segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| GLM-OCR-GGUF | 0,9B | 8.192 tokens | OCR y parsing de documentos multimodal | MIT | GGUF |
| zai-org/GLM-OCR (base) | 0,9B | no disponible | OCR y parsing de documentos multimodal | MIT | safetensors |
| PP-DocLayout-V3 | no disponible | no disponible | Analisis de layout de documentos | Apache 2.0 | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos frente a otros modelos OCR como PaddleOCR, Donut o Nougat, por lo que la comparativa de rendimiento queda limitada al resultado de OmniDocBench V1.5 (94,62) del propio GLM-OCR.

## Limitaciones y advertencias

- Es un modelo especializado en OCR y parsing de documentos: no es un modelo de proposito general y su rendimiento en tareas de razonamiento abierto, codigo generativo o conversacion general no esta documentado.
- La ventana de contexto observada en la prueba es de 8.192 tokens; documentos muy largos o paginas con densidad extrema pueden requerir segmentacion previa.
- El rendimiento optimo depende de la pipeline de layout PP-DocLayout-V3 del SDK oficial; usarlo de forma aislada sin segmentacion previa puede degradar la calidad en paginas complejas.
- Riesgo de alucinacion en regiones con ruido, baja resolucion o sellos poco legibles; conviene validar la salida JSON en flujos de produccion criticos.
- Los sesgos concretos del modelo no estan documentados en la informacion disponible.
- Aunque la licencia es MIT y permite uso comercial, el componente PP-DocLayout-V3 se distribuye bajo Apache 2.0, por lo que deben respetarse ambas licencias si se usa la pipeline completa.
- El autor recomienda Q8_0 para el mejor rendimiento; las cuantizaciones mas agresivas (Q4_K_S) pueden reducir la precision en tablas y formulas.
- El repo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
- Fichero F32: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.F32.gguf
- Fichero BF16: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.BF16.gguf
- Fichero F16: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.F16.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.Q4_K_M.gguf
- Fichero Q4_K_S: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.Q4_K_S.gguf
- Fichero Q5_K_M: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.Q5_K_M.gguf
- Fichero Q5_K_S: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.Q5_K_S.gguf
- Fichero Q6_K: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.Q6_K.gguf
- Fichero Q8_0: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.Q8_0.gguf
- Proyector mmproj-bf16: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.mmproj-bf16.gguf
- Proyector mmproj-f16: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.mmproj-f16.gguf
- Proyector mmproj-f32: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.mmproj-f32.gguf
- Proyector mmproj-q8_0: https://huggingface.co/prithivMLmods/GLM-OCR-GGUF/blob/main/GLM-OCR.mmproj-q8_0.gguf
