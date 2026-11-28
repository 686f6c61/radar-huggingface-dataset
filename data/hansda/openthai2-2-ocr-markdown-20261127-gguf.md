# Hansda/OpenThai2.2-OCR-Markdown-20261127-GGUF

## Resumen

OpenThai2.2-OCR-Markdown-20261127-GGUF es una conversión a formato GGUF del checkpoint OpenThai 2.2.2 OCR Markdown de iApp, un modelo especializado en el parseo de documentos en tailandés e inglés. El modelo recibe una imagen de página y produce bounding boxes, clases de bloque y, tras un postprocesado específico, Markdown estructurado. Está construido sobre la arquitectura Nemotron Parse de NVIDIA, según indican las etiquetas y el fork de llama.cpp requerido para su ejecución.

Con 189.722.624 parámetros totales en el decodificador y un proyector de visión compartido de aproximadamente 916,6 MB en F16, el modelo es compacto y está pensado para despliegue local en entornos con recursos limitados. La ventana de contexto operativa recomendada en los ejemplos del autor es de 16.384 tokens (`-c 16384`), suficiente para procesar páginas de documento con contenido denso.

Su relevancia actual radica en la combinación de OCR con salida Markdown directamente consumible por pipelines de RAG y extracción de datos, con soporte nativo de tailandés, un idioma con escasa cobertura en modelos OCR generalistas. La licencia OpenMDW 1.1 permite uso comercial con atribución a iApp y NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron Parse (image-text-to-text, vision encoder + decodificador) |
| Parametros totales | 189.722.624 (decodificador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (valor usado en los ejemplos del autor; no se declara máximo oficial) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (decodificador); F16 (proyector de visión) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | OpenMDW 1.1 (etiqueta `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (decodificador + `mmproj` F16) |
| Tamano del repo | 1,4 GB |
| Componentes | `mmproj-...-F16.gguf` (916.557.280 bytes) + decodificador Q4_K_M (134.542.272 bytes), Q6_K (158.196.672 bytes) o Q8_0 (204.114.368 bytes) |
| Tamano combinado decodificador + proyector | Q4_K_M 1,05 GB · Q6_K 1,07 GB · Q8_0 1,12 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Nemotron Parse, un esquema image-text-to-text con un codificador de visión acoplado a un decodificador de lenguaje mediante un proyector multimodal (`mmproj`). El decodificador, de 189,7 millones de parámetros, es de tamaño reducido y está especializado en una tarea única: dada una imagen de página, emitir tokens estructurados que codifican bounding boxes, clases de bloque y texto, y posteriormente renderizar Markdown mediante el postprocesador `nemotron_parse.postprocessing.postprocess_document`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card solo confirma que se trata de una conversión GGUF del checkpoint exacto `iapp/OpenThai2.2-OCR-Markdown-20261127` (revisión `a9357989091e4d70310d6fb29de5527b9febe825`), sin reentrenamiento ni modificación de pesos. La innovación técnica destacable es el uso de tokens de control específicos (`<predict_bbox>`, `<predict_classes>`, `<output_markdown>`, `<predict_text_in_pic>`) que dirigen la generación hacia la estructura de documento deseada.

## Capacidades

- OCR de documentos en tailandés e inglés con salida estructurada.
- Detección de bounding boxes por bloque de contenido (`<predict_bbox>`).
- Clasificación de bloques de documento (`<predict_classes>`): encabezados, párrafos, líneas de texto, entre otros.
- Generación de Markdown a partir de la estructura detectada (`<output_markdown>`).
- Extracción de texto embebido en imágenes (`<predict_text_in_pic>`).
- Procesamiento de páginas individuales como entrada image-text-to-text.
- Soporte conversacional según la etiqueta `conversational` del repositorio.
- No se declara soporte de tool calling, function calling, agentes ni modo de razonamiento extendido.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo convierte páginas escaneadas en Markdown con estructura de encabezados y párrafos, lo que facilita la indexación posterior en sistemas de búsqueda documental.
- Construcción de pipelines RAG sobre corpus mixtos th/en: la salida Markdown con bloques clasificados permite segmentar por tipo de contenido (títulos, cuerpo, texto en imágenes) antes de generar embeddings.
- Extracción de datos de facturas y formularios: el uso combinado de `<predict_bbox>` y `<predict_classes>` permite localizar campos y su contenido textual para su posterior parseo a JSON.
- Procesamiento local en hardware modesto: con 1,05-1,12 GB en disco para decodificador más proyector, el modelo cabe en equipos sin GPU dedicada y en entornos con restricciones de memoria.
- Preprocesado de documentación técnica bilingüe: la generación directa de Markdown reduce el trabajo de conversión manual en repositorios que mezclan tailandés e inglés.
- OCR de capturas con texto en imágenes: el token `<predict_text_in_pic>` permite recuperar texto incrustado en figuras, útil en manuales y presentaciones.
- Automatización de flujos de digitalización con `llama-mtmd-cli`: la integración con el fork de llama.cpp de iApp permite ejecutar el modelo por línea de comandos dentro de scripts de procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación reportada por el autor es cualitativa: Q4_K_M, Q6_K y Q8_0, ejecutados con el proyector F16, renderizaron correctamente un encabezado en tailandés y una línea en inglés sobre una página sintética; las tres cuantizaciones, así como el decodificador F16, fallaron en el mismo numeral de esa página. Los hashes y tamaños de los ficheros están registrados en `model-manifest.json`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño combinado (1,05-1,12 GB en disco), la inferencia cabe holgadamente en GPUs con 4 GB o más, y probablemente en menos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también tarjetas de gama de entrada con 4-6 GB.
- Cabe en GPU consumer: sí, en todas las cuantizaciones publicadas.
- Opciones de despliegue: exclusivamente el fork de llama.cpp de iApp (`iapp-technology/llama.cpp`, commit `1796ec1d0835f2b94330c01c6ddc6f3438748021`), compilando el objetivo `llama-mtmd-cli`. No se documenta compatibilidad con vLLM, TGI, Ollama ni con llama.cpp upstream.
- Postprocesado: requiere el directorio `nemotron_parse` incluido en el repositorio, añadido a `PYTHONPATH`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OpenThai2.2-OCR-Markdown (este) | 189,7 M (decodificador) | 16.384 (ejemplo) | th, en | OpenMDW 1.1 | GGUF | Especializado en OCR a Markdown con bounding boxes |
| Checkpoint base `iapp/OpenThai2.2-OCR-Markdown-20261127` | 189,7 M | no disponible | th, en | OpenMDW 1.1 | safetensors | Mismo modelo sin cuantizar; requiere stack original de iApp |
| Nemotron Parse (NVIDIA) | no disponible | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia sobre la que se construye el modelo |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Cobertura lingüística restringida a tailandés e inglés; el rendimiento en otros idiomas no está documentado.
- El autor reporta fallos en el reconocimiento de numerales: las tres cuantizaciones y el decodificador F16 omitieron el mismo numeral en la página de validación, lo que indica una debilidad concreta en dígitos que debe verificarse en producción.
- Requiere un fork específico de llama.cpp; no funciona con llama.cpp upstream ni con runtimes estándar, lo que complica el mantenimiento y la integración.
- La salida en crudo no es Markdown directamente: necesita el postprocesador `nemotron_parse` para renderizar el resultado final, añadiendo una dependencia Python al pipeline.
- Riesgo de alucinación en texto OCR: al ser un modelo generativo, puede producir contenido no presente en la imagen, especialmente en regiones de baja calidad o con tipografías poco habituales.
- Sesgos: no se documentan sesgos específicos, pero al estar entrenado predominantemente con documentos tailandeses e ingleses puede degradarse con otras escrituras o layouts.
- Licencia OpenMDW 1.1: permite uso comercial con obligación de atribución a iApp y NVIDIA y de conservar los avisos incluidos (incluida la atribución MIT del tokenizer); conviene revisar `LICENSE` antes de desplegar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.
- No se declaran capacidades de tool calling, agentes ni razonamiento multi-paso; el modelo está diseñado para una tarea única de parseo de documentos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hansda/OpenThai2.2-OCR-Markdown-20261127-GGUF
- Checkpoint base: https://huggingface.co/iapp/OpenThai2.2-OCR-Markdown-20261127
- Revisión fijada del checkpoint base: https://huggingface.co/iapp/OpenThai2.2-OCR-Markdown-20261127/tree/a9357989091e4d70310d6fb29de5527b9febe825
- Fork de llama.cpp de iApp (Nemotron Parse): https://github.com/iapp-technology/llama.cpp/tree/1796ec1d0835f2b94330c01c6ddc6f3438748021
- Licencia del modelo: https://huggingface.co/Hansda/OpenThai2.2-OCR-Markdown-20261127-GGUF/blob/main/LICENSE
