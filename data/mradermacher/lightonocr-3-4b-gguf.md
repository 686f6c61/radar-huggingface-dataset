# mradermacher/LightOnOCR-3-4B-GGUF

## Resumen

LightOnOCR-3-4B-GGUF es la version cuantizada en formato GGUF del modelo LightOnOCR-3-4B, un modelo de vision-lenguaje (VLM) de tipo extremo a extremo especializado en OCR y comprension de documentos. La cuantizacion la publica mradermacher, un conocido proveedor de quants de la comunidad, a partir del modelo original desarrollado por LightOn (lightonai/LightOnOCR-3-4B). El repositorio contiene pesos GGUF en multiples niveles de compresion, ademas de los ficheros `mmproj` necesarios para procesar imagenes en llama.cpp.

El modelo resuelve el problema de convertir pixeles de documentos en texto estructurado: transcripcion de texto, interpretacion de maquetacion, tablas, formularios y graficos, todo con un unico modelo compacto de 4.205.751.296 parametros (unos 4,2B). Segun la informacion publica de LightOn, la familia LightOnOCR-3 se distribuye en tres tamanos (0,8B, 1B y 4B) bajo licencia Apache 2.0 con uso comercial permitido, y las variantes de 0,8B y 4B adoptan la arquitectura de vision-lenguaje de Qwen3.5.

Es relevante ahora porque ofrece un rendimiento cercano al estado del arte en olmOCR-Bench (86,3 en la variante de 4B) con un coste de inferencia muy inferior al de alternativas mucho mas grandes, como Infinity Parser Pro (35,1B, 87,6). La disponibilidad de cuantizaciones GGUF desde Q2_K hasta f16 permite desplegarlo en hardware de consumo. El repositorio es muy reciente (creado el 9 de octubre de 2026) y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM); segun la informacion de LightOn, las variantes de 0,8B y 4B usan la arquitectura de Qwen3.5 VL |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base lightonai/LightOnOCR-3-4B es un modelo de vision-lenguaje orientado a OCR de extremo a extremo: recibe imagenes de documentos y produce texto estructurado (texto, tablas, formularios, graficos). Segun la informacion publica recogida, las variantes de 0,8B y 4B de la familia LightOnOCR-3 emplean la arquitectura de vision-lenguaje de Qwen3.5. El repositorio GGUF separa el componente multimodal en ficheros `mmproj` (proyector de vision) independientes de los pesos del modelo de lenguaje, lo que es habitual en llama.cpp para este tipo de arquitecturas.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion. Tampoco se detallan innovaciones tecnicas especificas mas alla de la propia arquitectura multimodal. El cliente oficial de LightOn (repositorio GitHub lightonai/LightOnOCR) selecciona resolucion de pagina, muestreo y modos de forma automatica a partir del nombre del modelo servido, asumiendo LightOnOCR-3 con 2048 px de lado mayor por defecto, y permite sobrescribir ese valor con `--longest-edge`; esto indica que la resolucion de imagen es un parametro de inferencia relevante para el rendimiento.

La cuantizacion de mradermacher indica, en sus metadatos internos, `quantize_version: 2` y `output_tensor_quantised: 1`, con conversion de tipo `hf`. El autor senala que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion y que no tiene previsto generarlas salvo peticion en la seccion de discusiones.

## Capacidades

- OCR de extremo a extremo: transcripcion de texto a partir de imagenes de documentos.
- Comprension de maquetacion y estructura del documento (tags `document-understanding`).
- Extraccion e interpretacion de tablas (tag `tables`).
- Procesamiento de formularios (tag `forms`).
- Grounding visual (tag `visual-grounding`), es decir, localizacion de contenido sobre la imagen.
- Comprension de imagenes y graficos integrados en documentos.
- Interfaz conversacional (tag `conversational`).
- Compatibilidad con endpoints de despliegue (tag `endpoints_compatible`).
- Cobertura multilingue: no disponible; el unico idioma declarado es el ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion masiva de archivos en papel: el modelo convierte escaneos en texto estructurado manteniendo la maquetacion, lo que permite alimentar sistemas de gestion documental sin un pipeline de OCR tradicional por etapas.
- Extraccion de datos de facturas y formularios: al soportar interpretacion de formularios y tablas, puede devolver campos estructurados a partir de una imagen, util para automatizar contabilidad y procesos de back-office.
- Ingesta de documentacion tecnica para RAG: transcribir manuales, informes y PDF escaneados antes de trocearlos e indexarlos en un sistema de recuperacion aumentada.
- Procesamiento de informes financieros con tablas complejas: la capacidad de comprension de tablas permite extraer series numericas de balances o estados de resultados capturados como imagen.
- Pipelines de automatizacion con llama.cpp u Ollama: su tamano compacto (2,8 GB en Q4_K_M) permite embeber OCR en servicios locales sin depender de APIs externas.
- Analisis de documentos en entornos con requisitos de privacidad: al poder ejecutarse en local, los documentos no salen de la infraestructura propia, algo critico en banca, sanidad o sector legal.
- Preprocesado para agentes documentales: combinado con el cliente oficial de LightOn (que ajusta resolucion y modos automaticamente segun el modelo), sirve como primer paso de sistemas agenticos que despues razonan sobre el texto extraido.
- Conversion de graficos e infografias a datos textuales: la faceta de comprension de imagen y graficos del modelo base permite describir o extraer informacion de elementos no textuales.

## Benchmarks y rendimiento

Los unicos datos de benchmark publicados en la informacion disponible corresponden a olmOCR-Bench e incluyen a la familia completa y a un competidor de mayor tamano:

| Modelo | Parametros | olmOCR-Bench (overall) |
|---|---|---|
| LightOnOCR-3-4B | 4B | 86,3 |
| LightOnOCR-3-0.8B | 0,8B | 85,5 |
| LightOnOCR-3-1B | 1B | 84,5 |
| Infinity Parser Pro | 35,1B | 87,6 |

No se han publicado en la informacion disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin contar el proyector de vision): Q2_K ~2,0 GB, Q3_K_S ~2,2 GB, Q3_K_M ~2,4 GB, Q3_K_L ~2,5 GB, IQ4_XS ~2,6 GB, Q4_K_S ~2,7 GB, Q4_K_M ~2,8 GB, Q5_K_S ~3,1 GB, Q5_K_M ~3,2 GB, Q6_K ~3,6 GB, Q8_0 ~4,6 GB, f16 ~8,5 GB.
- El proyector multimodal (`mmproj`) anade 0,5 GB (Q8_0) o 0,8 GB (f16) al consumo.
- Al ser un modelo de vision, hay que sumar la memoria del cache KV y la de las activaciones de imagen, que dependen de la resolucion de pagina (por defecto 2048 px de lado mayor en el cliente oficial de LightOn).
- Cabe holgadamente en GPUs de consumo: una RTX 3060 de 12 GB o una RTX 4090 de 24 GB pueden ejecutar las cuantizaciones Q4_K_M o Q8_0 con margen amplio. Incluso configuraciones de 8 GB de VRAM pueden albergar las variantes Q4 y Q5.
- GPU recomendadas para produccion: para Q4_K_M/Q5_K_M basta una RTX 4090, L4 o A10; para f16 conviene una A100 40 GB o H100 si se busca paralelismo alto o lotes grandes.
- Opciones de despliegue: llama.cpp (formato nativo de estos ficheros, requiere cargar el `mmproj` correspondiente), Ollama y LM Studio, entre otros runners compatibles con GGUF. Para el modelo base en transformers se puede usar vLLM o TGI, pero esos formatos no son los del repositorio GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | olmOCR-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-3-4B (este, via GGUF) | 4B | no disponible | 86,3 | apache-2.0 | GGUF (mradermacher) y safetensors (LightOn) |
| LightOnOCR-3-1B | 1B | no disponible | 84,5 | apache-2.0 | safetensors (LightOn) |
| LightOnOCR-3-0.8B | 0,8B | no disponible | 85,5 | apache-2.0 | safetensors (LightOn) |
| Infinity Parser Pro | 35,1B | no disponible | 87,6 | no disponible | no disponible |

La comparativa muestra que la variante de 4B rinde a menos de 1,3 puntos de Infinity Parser Pro con casi una decima parte de parametros, y que el modelo mas pequeno de la familia (0,8B) queda a solo 0,8 puntos del de 4B, lo que sugiere una curva de escalado poco pronunciada en esta tarea.

## Limitaciones y advertencias

- Cobertura limitada a ingles: el unico idioma declarado es `en`, por lo que el OCR y la comprension en castellano u otros idiomas no estan garantizados.
- Repositorio sin traccion: registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 9 de octubre de 2026, por lo que no hay validacion de la comunidad sobre la calidad de estas cuantizaciones.
- Sin cuantizaciones ponderadas/imatrix: el propio autor indica que no estan disponibles y que no tiene previsto generarlas salvo peticion, lo que puede traducirse en una perdida de calidad algo mayor en los niveles bajos (Q2_K, Q3_K_S) frente a alternativas imatrix.
- Degradacion esperada en cuantizaciones agresivas: las variantes Q2_K y Q3_K estan marcadas como de calidad inferior por el autor; para OCR preciso conviene usar Q4_K_M o superior.
- Riesgo de alucinacion: no se aportan datos especificos de tasas de error ni de alucinacion en esta informacion; en tareas de OCR sobre documentos densos el riesgo de inventar texto o malinterpretar tablas existe y deberia medirse con datos propios.
- Ambito funcional acotado: es un modelo especializado en OCR y comprension documental; no esta pensado como modelo generalista de razonamiento, codigo o matematicas.
- Dependencia del componente multimodal: en GGUF es obligatorio cargar el fichero `mmproj` adecuado; omitirlo o mezclar versiones incorrectas puede degradar o impedir el procesamiento de imagenes.
- Dependencia de la resolucion de entrada: el rendimiento esta ligado al ajuste de resolucion de pagina (por defecto 2048 px en el cliente oficial); cambios en `--longest-edge` o en el nombre del modelo servido alteran el comportamiento esperado.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio GGUF es una redistribucion de terceros; conviene verificar los terminos del modelo base y citar correctamente a LightOn y a mradermacher.
- Ausencia de datos de contexto y de despliegue en produccion: no se especifica la longitud de contexto soportada ni el throughput, por lo que cualquier planificacion de capacidad requiere pruebas propias.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/LightOnOCR-3-4B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Pagina de investigacion de LightOnOCR-3: https://www.lighton.ai/research/lightonocr-3
- Repositorio GitHub de LightOnOCR: https://github.com/lightonai/LightOnOCR/tree/main
- Pagina de resumen y descargas de mradermacher para este modelo: https://hf.tst.eu/model#LightOnOCR-3-4B-GGUF
- Articulo con los resultados de olmOCR-Bench de la familia: https://www.darius.wiki/en/daily/2026-10-09/lightonocr-3/
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo relacionado en el mismo ecosistema: https://huggingface.co/mradermacher/AgenticOCR-4B-GGUF
