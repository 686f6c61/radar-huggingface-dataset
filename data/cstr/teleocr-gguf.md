# cstr/TeleOCR-GGUF

## Resumen

TeleOCR es un modelo de reconocimiento optico de caracteres (OCR) y parsing de documentos desarrollado por XingChen-AGI junto con China Telecom. Con aproximadamente 1.260 millones de parametros, esta disenado especificamente para extraer texto, formulas, tablas, codigo y estructura de layout a partir de imagenes de documentos, una tarea critica en pipelines de digitalizacion y procesamiento documental. Su encoder de vision deriva de Qwen2.5-VL-3B-Instruct, lo que le proporciona capacidades de comprension visual heredadas de la familia Qwen.

La version aqui descrita, `cstr/TeleOCR-GGUF`, es una conversion de formato de los pesos originales a GGUF realizada por el proyecto CrispEmbed. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son identicos a los del modelo base `XingChen-AGI/TeleOCR` en la revision `b3f6a0c0`, unicamente reempaquetados para el runtime nativo ggml de CrispEmbed. Esta conversion es relevante porque permite ejecutar el modelo en CPU con un runtime ligero, algo que el ecosistema llama.cpp no soporta para esta arquitectura concreta (el perfil GGUF usa `general.architecture = teleocr`).

El aspecto mas importante a tener en cuenta es la licencia: aunque la model card original declara Apache-2.0, el encoder de vision hereda los terminos de la Qwen Research License Agreement de Alibaba Cloud, lo que restringe el uso a investigacion y evaluacion. El uso comercial requiere una licencia adicional de Alibaba Cloud, y el propio conversor (CrispEmbed) exige la aceptacion explicita de estos terminos para cargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder de vision derivado de Qwen2.5-VL-3B + decoder de lenguaje), perfil GGUF `teleocr` |
| Parametros totales | 1.259.490.304 (~1,26 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (solo investigacion y evaluacion; uso comercial requiere licencia de Alibaba Cloud) |
| Formato de pesos | GGUF (v1, perfil `teleocr`); no cargable por llama.cpp |

## Arquitectura y entrenamiento

TeleOCR combina un encoder de vision con un decoder de lenguaje en un esquema image-text-to-text. El encoder de vision proviene de Qwen2.5-VL-3B-Instruct, como demuestra el analisis de linaje por coseno de pesos por tensor incluido en el repositorio de CrispEmbed (`tests/results/licenses/qwen-vision-lineage.json`). El modelo esta especializado en tareas de OCR estructurado: extraccion de texto plano, formulas matematicas, tablas, bloques de codigo y analisis de layout de pagina.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card original de XingChen-AGI no se incluye en detalle en la informacion disponible, aunque el repositorio de CrispEmbed incluye una copia sin modificar (`UPSTREAM_README.md`, revision `b3f6a0c0`). La conversion a GGUF implico unicamente renombrado de tensores, casting, incrustacion de metadatos de tokenizer y preprocesado, y cuantizacion; no se entreno, fine-tuneo ni fusiono ningun peso.

## Capacidades

- Extraccion de texto a partir de imagenes de documentos (OCR clasico).
- Reconocimiento de formulas matematicas en imagenes.
- Parsing de tablas, preservando estructura de filas y columnas.
- Extraccion de bloques de codigo desde capturas o documentos escaneados.
- Analisis de layout de pagina (deteccion de regiones y estructura).
- Procesamiento de imagenes sinteticas de documentos (caso de prueba `synthetic`).
- Pipeline image-text-to-text: recibe imagen y produce texto estructurado.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision, audio: vision si (entrada de imagen); thinking y audio no disponibles.

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo puede extraer texto y estructura de tablas de imagenes de documentos contables, adecuado por su especializacion en parsing de layout y tablas.
- Conversion de articulos cientificos a Markdown: permite recuperar formulas matematicas y bloques de texto de PDFs renderizados como imagen, gracias a su capacidad de reconocimiento de formulas.
- Extraccion de codigo desde capturas de pantalla: util para recuperar snippets de codigo de tutoriales o documentacion visualizada, ya que el modelo soporta la tarea `code` de forma nativa.
- Procesamiento de formularios escaneados: el analisis de layout permite identificar regiones y campos estructurados en documentos administrativos.
- Archivado y busqueda documental: integrado en pipelines de ingestion, convierte imagenes de documentos en texto indexable para motores de busqueda.
- Evaluacion en entornos de investigacion con CPU: al ejecutarse en el runtime ggml de CrispEmbed (por defecto en CPU), es adecuado para prototipos y experimentos academicos sin GPU.
- Preprocesado para pipelines RAG sobre documentos escaneados: la extraccion de texto y tablas alimenta bases de conocimiento vectoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es de paridad funcional: las variantes F16, Q8_0 y Q4_K_M reproducen exactamente los token IDs generados por el modelo original en 6 peticiones congeladas (`text` 66 tokens, `formula` 166, `table` 283, `code` 366, `layout` 768, `synthetic` 19) en CPU con decodificacion greedy.

| Prueba de paridad | F16 | Q8_0 | Q4_K_M |
|---|---|---|---|
| `text` (66 tokens) | exacta | exacta | exacta |
| `formula` (166 tokens) | exacta | exacta | exacta |
| `table` (283 tokens) | exacta | exacta | exacta |
| `code` (366 tokens) | exacta | exacta | exacta |
| `layout` (768 tokens) | exacta | exacta | exacta |
| `synthetic` (19 tokens) | exacta | exacta | exacta |

No se verifico paridad numerica en GPU, ni con otras combinaciones de CPU/kernel, ni en movil/WASM, ni benchmarks agregados de OCR mas alla de los seis casos congelados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamano de fichero, F16 ocupa 2,53 GB, Q8_0 2,11 GB y Q4_K_M 1,92 GB en disco/RAM.
- GPU recomendadas: no disponible; el runtime de CrispEmbed es CPU por defecto y el soporte de GPU no esta verificado.
- Cabe en GPU consumer: probablemente si por tamano (los pesos caben en cualquier GPU con 4 GB o mas), pero no hay validacion publicada de ejecucion en GPU.
- Opciones de despliegue: exclusivamente CrispEmbed (runtime ggml nativo, perfil `teleocr`); no es cargable por llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|
| TeleOCR (este) | ~1,26 B | no disponible | Qwen Research (no comercial) | CrispEmbed (GGUF) | HuggingFace |
| Qwen2.5-VL-3B-Instruct | 3 B (aprox.) | no disponible en esta ficha | Qwen Research | Multiples (transformers, vLLM) | HuggingFace |
| Modelos OCR especializados genericos | no disponible | no disponible | variable | variable | variable |

La comparacion directa con alternativas OCR especializadas no esta disponible en la informacion proporcionada. El unico pariente documentado es Qwen2.5-VL-3B-Instruct, del que TeleOCR hereda el encoder de vision y cuyos terminos de licencia se aplican.

## Limitaciones y advertencias

- Licencia restrictiva: solo uso de investigacion y evaluacion; el uso comercial requiere licencia de Alibaba Cloud. La declaracion Apache-2.0 del autor original no relaja los terminos heredados de Qwen (seccion 3d del acuerdo).
- El modelo no es cargable por llama.cpp ni por los runtimes habituales; solo funciona con CrispEmbed, lo que limita su integracion en stacks estandar.
- El soporte en CrispEmbed es experimental y desactivado por defecto; requiere variables de entorno (`CRISPEMBED_TELEOCR=1`, `CRISPEMBED_ACCEPT_QWEN_RESEARCH_LICENSE=1`) y el flag `--accept-license qwen-research`.
- No se verifico paridad numerica en GPU ni en movil/WASM; solo hay validacion en CPU con decodificacion greedy.
- Los presupuestos numericos intermedios estrictos no se cumplen ni en F32: diferencias de un ulp en las activaciones masivas del bloque de vision 17 se amplifican, aunque los IDs y el texto decodificados son exactos.
- No hay datos publicados de benchmarks OCR agregados, sesgos, tasas de alucinacion ni cobertura idiomatica.
- Riesgo de alucinacion en la extraccion de texto: no cuantificado en la informacion disponible.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingue en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cstr/TeleOCR-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/TeleOCR
- Revision fijada del modelo base: https://huggingface.co/XingChen-AGI/TeleOCR/tree/b3f6a0c084db72f971e19a779d2fd8a6bc9e3b8d
- Qwen2.5-VL-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Evidencia de linaje de licencia: `tests/results/licenses/qwen-vision-lineage.json` (en el repositorio de CrispEmbed)
- Recibos de paridad: `tests/results/teleocr/hosted-precision.json` (en el repositorio de CrispEmbed)
