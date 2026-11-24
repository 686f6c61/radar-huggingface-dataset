# bartowski/moganai_MoganOCR-TR-1.5-GGUF

## Resumen

MoganOCR-TR-1.5 es un modelo de visión-lenguaje (VLM) especializado en OCR y comprensión de documentos turcos, desarrollado por moganai. Está afinado a partir de MoganOCR-TR y su tarea principal es leer una imagen de página en orden de lectura y transcribirla a Markdown, representando las tablas en HTML y las fórmulas en LaTeX. Con aproximadamente 1.880 millones de parámetros (etiquetado como "2B" por el autor), se posiciona como una alternativa compacta y desplegable en hardware modesto para pipelines de digitalización documental.

El repositorio analizado es la cuantización GGUF realizada por bartowski mediante llama.cpp (release b12600) con calibración imatrix, lo que permite ejecutar el modelo en CPU, GPU de consumo y entornos con memoria limitada. El modelo original se distribuye bajo licencia Apache 2.0 y soporta los idiomas turco e inglés.

Su relevancia actual radica en la combinación de un tamaño reducido (1,24 GB en Q4_K_M) con una tarea de alto valor práctico como es la conversión de documentos escaneados a Markdown estructurado, un formato directamente consumible por sistemas RAG, motores de búsqueda internos y flujos de trabajo de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) de tipo image-text-to-text; arquitectura interna no especificada en la informacion disponible |
| Parametros totales | 1.881.825.088 (aprox. 1,88B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S (y otras del repositorio) |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo de vision-lenguaje para OCR, afinado a partir de MoganOCR-TR, y que emplea GRPO (Group Relative Policy Optimization) como parte de su entrenamiento, segun las etiquetas del repositorio. La arquitectura interna concreta (backbone del encoder visual, tipo de transformer del decodificador, número de capas o dimensiones) no se detalla en la informacion proporcionada.

El modelo procesa una imagen de página y genera su contenido en Markdown respetando el orden de lectura, con tablas convertidas a HTML y fórmulas matemáticas en LaTeX. Requiere un fichero mmproj para el procesamiento de imágenes en el ecosistema llama.cpp. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO más allá de la mencionada GRPO. Tampoco se documenta decodificación especulativa (el autor indica explícitamente que no la soporta).

## Capacidades

- Transcripcion OCR de imagenes de pagina a Markdown en orden de lectura.
- Conversion de tablas a HTML dentro del Markdown generado.
- Conversion de formulas matematicas a LaTeX.
- Comprension de documentos (document understanding) y parseo estructurado (document parsing).
- Procesamiento multimodal de entrada: texto e imagen (requiere fichero mmproj en llama.cpp).
- Soporte de tool calling / function calling mediante un formato XML especifico documentado en la model card.
- Modo de razonamiento con etiquetas `<think>` en el formato de prompt.
- Capacidades multilingues limitadas a turco e ingles.
- Formato conversacional compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Digitalizacion de archivos administrativos turcos: el modelo convierte escaneos de facturas, formularios y expedientes en Markdown estructurado, listo para indexar en un sistema de gestion documental.
- Construccion de pipelines RAG sobre documentacion en turco: la salida Markdown con tablas en HTML y formulas en LaTeX preserva la estructura semantica, lo que mejora la recuperacion y la citacion de fragmentos.
- Extraccion de tablas financieras o tecnicas: al renderizar tablas como HTML, los datos tabulares pueden parsearse posteriormente con librerias estandar sin perder la relacion entre filas y columnas.
- Procesamiento de literatura cientifica y tecnica con formulas: la conversion a LaTeX permite reutilizar las expresiones matematicas en editores, notebooks o sistemas de publicacion.
- Automatizacion de back-office con agentes: gracias al soporte de tool calling, el modelo puede integrarse en flujos donde, tras leer un documento, invoca funciones para registrar datos, consultar APIs o abrir tickets.
- Despliegue en entornos con hardware limitado: con cuantizaciones desde 1,23 GB (Q4_0) y 1,24 GB (Q4_K_M), es viable ejecutarlo en portatiles, mini-PC o contenedores sin GPU dedicada mediante llama.cpp.
- Preprocesado de corpus para entrenamiento de otros modelos: la transcripcion masiva de documentos turcos a Markdown facilita la creacion de datasets limpios y estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-1,5 GB con Q4_K_M (1,24 GB de pesos mas overhead de contexto y del fichero mmproj); en torno a 2,1-2,5 GB con Q8_0; cerca de 4-4,5 GB con bf16.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo es demasiado pequeno para aprovechar GPUs de datacenter de gama alta.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna (incluso integradas con memoria compartida suficiente) usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama, y servidores compatibles con endpoints OpenAI; para el modelo base en safetensors, frameworks como vLLM o TGI segun soporte del modelo original.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un modelo de 1,88B parametros, la latencia por pagina dependera fundamentalmente del tiempo de codificacion de la imagen y del hardware; no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MoganOCR-TR-1.5 (este) | 1,88B | No disponible | tr, en | Apache 2.0 | OCR de documentos turcos a Markdown |
| MoganOCR-TR (modelo base) | No disponible | No disponible | tr, en | No disponible en esta ficha | OCR de documentos turcos |
| Alternativas OCR/VLM de proposito general | No disponible | No disponible | Multiples | Variable | OCR y comprension documental generica |

No se dispone en la informacion proporcionada de datos de rendimiento comparativos con otros modelos de OCR o VLM, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- El modelo esta especializado en turco e ingles; su rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- La arquitectura interna, el contexto maximo y los datos de entrenamiento no estan documentados en la informacion disponible, lo que dificulta evaluar su robustez en documentos muy largos o densos.
- Al ser un modelo de 1,88B parametros, es esperable una menor precision que VLMs de mayor tamano en layouts complejos, manuscritos o imagenes de baja calidad; no obstante, no se aportan metricas que lo confirmen.
- Riesgo de alucinacion en la transcripcion: como todo modelo generativo, puede inventar texto, alterar cifras o reconstruir tablas de forma incorrecta, por lo que se recomienda validacion humana en contextos criticos.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia y condiciones del modelo base original (moganai/MoganOCR-TR-1.5) antes de desplegarlo en produccion.
- El soporte multimodal en llama.cpp requiere descargar y configurar el fichero mmproj; sin el, el modelo no procesa imagenes.
- El repositorio GGUF analizado tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria documentada de estas cuantizaciones.
- No soporta decodificacion especulativa, lo que limita las optimizaciones de latencia disponibles en llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/moganai_MoganOCR-TR-1.5-GGUF
- Modelo base original: https://huggingface.co/moganai/MoganOCR-TR-1.5
- llama.cpp (release b12600): https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp/
