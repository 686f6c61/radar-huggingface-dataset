# iapp/OpenThai2.0-OCR-Markdown-GGUF

## Resumen

OpenThai2.0-OCR-Markdown-GGUF es la distribucion en formato GGUF del modelo OpenThai2.1-OCR-Markdown, un sistema de OCR y parseo de documentos especializado en tailandes e ingles desarrollado por iapp (iApp Technology). El modelo convierte imagenes de paginas de documentos en Markdown estructurado, representando las tablas como HTML y las formulas como bloques `$$...$$`. Es un fine-tune de NVIDIA Nemotron 3.5 Parse (0.63B), por lo que hereda su arquitectura multimodal de tipo image-text-to-text.

La relevancia de esta publicacion radica en que permite ejecutar el modelo sin PyTorch ni vLLM, unicamente con llama.cpp, en un Mac, en CPU o en una GPU de consumo. El decoder tiene 192M parametros y el encoder de vision 439M, lo que da un total de aproximadamente 631M parametros. El repositorio ocupa 1,5 GB e incluye pesos en Q8_0 y F16.

Una advertencia tecnica importante: la arquitectura no esta incluida en el llama.cpp upstream, por lo que es necesario compilar un fork especifico mantenido por iapp-technology (rama `nemotron-parse`). El modelo esta pensado para digitalizacion de documentos tailandeses e ingleses con estructura compleja (formularios, transparencias, silabos, informes y libros de texto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text (decoder transformer + vision encoder y neck), fine-tune de NVIDIA Nemotron 3.5 Parse |
| Parametros totales | 189.722.624 (decoder 192M + vision encoder/neck 439M segun la model card; el dato de safetensors corresponde al decoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en los ejemplos de ejecucion (`-c 16384`) |
| Tipos de cuantizacion | Q8_0 y F16 (decoder); F16 para el mmproj (vision encoder) |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | OpenMDW 1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de NVIDIA Nemotron 3.5 Parse (0.63B), un sistema multimodal compuesto por un decoder de 192M parametros y un encoder de vision con neck de 439M parametros. El decoder procesa la imagen codificada junto con tokens de tarea especiales (`<predict_bbox>`, `<predict_classes>`, `<output_markdown>`, `<predict_text_in_pic>`) y genera una secuencia de bloques con coordenadas de bounding box, clase y texto, que posteriormente se post-procesa a Markdown. La plantilla de chat coloca la imagen antes de los tokens de tarea.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada; la model card remite a la ficha del modelo base para benchmarks, entrenamiento y limites. La innovacion destacable de esta publicacion es la conversion a GGUF con verificacion de fidelidad: en 30 paginas de desarrollo (CU-DocBench, transparencias, silabos, formularios, informes y libros de texto en tailandes e ingles, no vistas en entrenamiento), tanto Q8_0 como F16 producen Markdown identico al modelo PyTorch en F32 (30 de 30 paginas, 0,00% de error de caracteres). En 5 paginas, los ficheros F32 reproducen el modelo PyTorch token por token durante mas de 600 tokens, tanto en CPU como en Metal.

## Capacidades

- OCR de documentos en tailandes e ingles: extraccion de texto de imagenes de paginas.
- Conversion a Markdown estructurado, con tablas representadas como HTML y formulas como `$$...$$`.
- Deteccion de layout: prediccion de bounding boxes (`<predict_bbox>`) y clases de bloque (`<predict_classes>`).
- Extraccion de texto dentro de imagenes (`<predict_text_in_pic>`).
- Procesamiento de documentos completos con formularios, transparencias, silabos, informes y libros de texto.
- Salida determinista opcional (temperatura 0.0 y sin penalizacion de repeticion).
- Omision de paginas en blanco por parte de `DocumentParser`.
- No dispone de tool calling, function calling, capacidades de agente ni modo thinking segun la informacion disponible.

## Casos de uso

- Digitalizacion masiva de archivos administrativos tailandeses: el modelo convierte formularios y documentos oficiales escaneados en Markdown con tablas HTML, lo que facilita su indexacion y busqueda posterior. Su ventana de 16.384 tokens cubre paginas completas con estructura densa.
- Extraccion de contenido de transparencias y materiales docentes: util para universidades y plataformas de e-learning que necesitan convertir presentaciones y silabos en texto estructurado, un escenario incluido explicitamente en el conjunto de validacion del autor.
- Construccion de pipelines de RAG sobre documentacion bilingue th/en: el Markdown generado, con tablas y formulas preservadas, se puede trocear e indexar en bases vectoriales sin perder la estructura semantica del documento original.
- Procesamiento en local sin GPU dedicada: gracias a los ficheros GGUF (204 MB en Q8_0 y 382 MB en F16), el modelo puede ejecutarse en CPU o en un Mac con Metal, lo que permite desplegar OCR en entornos con requisitos de privacidad o sin acceso a infraestructura cloud.
- Servicio HTTP de parseo de documentos: mediante `llama-server` y el `DocumentParser` de NVIDIA, se puede exponer un endpoint compatible con OpenAI (`/v1`) que devuelve Markdown y bloques estructurados con coordenadas, integrable en aplicaciones de gestion documental.
- Conversion de informes financieros o tecnicos con tablas: la representacion de tablas como HTML permite conservar la estructura de datos tabulares, util para extraccion posterior a hojas de calculo o bases de datos.
- Preprocesado para traduccion automatica th→en: al generar Markdown limpio y estructurado, el texto puede alimentar directamente un pipeline de traduccion o de resumen sin necesidad de limpieza manual adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha del modelo base para las puntuaciones de benchmark. Los unicos datos cuantitativos disponibles son de fidelidad de conversion y velocidad:

| Prueba | Resultado |
|---|---|
| Markdown identico al modelo PyTorch (30 paginas, Q8_0 + F16 mmproj) | 30 de 30, 0,00% de error de caracteres |
| Markdown identico al modelo PyTorch (30 paginas, F16 + F16 mmproj) | 30 de 30, 0,00% de error de caracteres |
| Diferencias en coordenadas de bounding box (Q8_0 vs F32) | 16 coordenadas en 6 paginas, sin diferencias en texto |
| Reproduccion token por token (F32 vs PyTorch, 5 paginas) | Identica durante mas de 600 tokens en CPU y Metal |

| Maquina | Metodo | Decoder | Segundos por pagina | Codificacion de imagen |
|---|---|---|---|---|
| Apple M3 Max, Metal | llama-server, modelo cargado | Q8_0 | 4,8–7,0 (4 paginas) | no disponible |
| Apple M3 Max, Metal | llama-mtmd-cli, carga incluida | Q8_0 | 7,7 (mediana de 30) | 5,9 s |
| Apple M3 Max, Metal | llama-mtmd-cli, carga incluida | F16 | 8,2 (mediana de 30) | 5,9 s |
| Apple M3 Max, CPU (16 nucleos) | llama-mtmd-cli | Q8_0 | 58 (mediana de 4) | 54 s |
| Apple M3 Max, CPU (16 nucleos) | llama-mtmd-cli | F16 | 59 (mediana de 4) | 52 s |
| Servidor Linux, 4 hilos CPU (compartido) | llama-mtmd-cli | Q8_0 | 146 (mediana de 4) | 133 s |
| Servidor Linux, 4 hilos CPU (compartido) | llama-mtmd-cli | F16 | 154 (mediana de 4) | 131 s |

El cuello de botella es el encoder de vision: una pagina puede llegar a 1.664 x 2.xxx pixeles, y la codificacion de imagen consume la mayor parte del tiempo (5,9 s en Metal frente a 7,7 s totales).

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 1,5 GB; en ejecucion, Q8_0 (204 MB) + mmproj F16 (917 MB) requieren aproximadamente 1,1–1,5 GB, y F16 (382 MB) + mmproj F16 unos 1,3–1,7 GB. Cifras estimadas a partir de los tamanos de fichero; no hay medicion de VRAM publicada.
- GPU recomendadas: cualquier GPU con soporte CUDA (compilando con `-DGGML_CUDA=ON`) o Metal en macOS. No se especifican modelos concretos en la informacion disponible.
- GPU de consumo: si, el modelo cabe en cualquier GPU de consumo moderna al ocupar menos de 2 GB; tambien funciona en CPU pura.
- Opciones de despliegue: llama.cpp (fork obligatorio `iapp-technology/llama.cpp`, rama `nemotron-parse`), con `llama-mtmd-cli` para CLI y `llama-server` para servicio HTTP compatible con el `DocumentParser` de NVIDIA. No es compatible con el llama.cpp upstream ni se menciona soporte de vLLM u Ollama en la informacion disponible.
- Latencia y throughput: 4,8–7,0 s por pagina en Apple M3 Max con Metal (modelo cargado); 58–59 s por pagina en CPU de 16 nucleos; 146–154 s por pagina en un servidor Linux con 4 hilos compartidos. La codificacion de imagen domina el tiempo (5,9 s en Metal).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa rigurosa. Como referencia estructural, el propio modelo base NVIDIA Nemotron 3.5 Parse (0.63B) es el punto de comparacion natural: este GGUF es un fine-tune del mismo con soporte de tailandes, y su fidelidad respecto al modelo PyTorch en F32 esta verificada (30 de 30 paginas con Markdown identico). Para alternativas de OCR multimodal de proposito general no hay datos disponibles en esta busqueda.

## Limitaciones y advertencias

- La arquitectura no esta en el llama.cpp upstream: es imprescindible compilar el fork `iapp-technology/llama.cpp` (rama `nemotron-parse`). Un llama.cpp estandar no cargara estos ficheros.
- El modelo solo cubre tailandes e ingles; no hay soporte declarado para otras lenguas.
- La licencia es OpenMDW 1.1 (`license: other`), no una licencia OSI estandar; conviene revisar sus terminos antes de uso comercial.
- Riesgo de alucinacion y de bucles en la generacion: la model card menciona la ausencia de bucles en las 30 paginas de validacion, pero no garantiza su inexistencia en produccion. Se recomienda fijar la temperatura a 0.0 y desactivar la penalizacion de repeticion para salidas deterministas.
- La penalizacion de repeticion por defecto (1.05 sobre 8.760 tokens) se toma del GGUF; en llama-server el parametro es `repeat_penalty`, no `repetition_penalty` como en vLLM, y `--repeat-last-n -1` desactiva la penalizacion en este fork en lugar de extenderla.
- Las diferencias de coordenadas de bounding box entre Q8_0 y F32 (16 coordenadas en 6 paginas) no afectan al Markdown, pero si a `doc["blocks"]`; si se necesitan coordenadas exactas, usar F16.
- El rendimiento en CPU es bajo (58–154 s por pagina segun hardware); para volumen alto se recomienda GPU o Metal.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluacion en dominios distintos de los documentos de validacion.
- El numero de descargas y likes es 0 en el momento de la consulta, lo que indica una publicacion muy reciente (creada el 2026-11-18) sin validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-OCR-Markdown-GGUF
- Modelo base (rama v2.1): https://huggingface.co/iapp/OpenThai2.0-OCR-Markdown/tree/v2.1
- Fork de llama.cpp: https://github.com/iapp-technology/llama.cpp (rama `nemotron-parse`)
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
- Modelo base de NVIDIA: nvidia/Nemotron-3.5-Parse (referenciado en la model card; sin URL directa en la informacion disponible)
