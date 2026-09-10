# ianua/OvisOCR2

## Resumen

OvisOCR2 es un modelo multimodal compacto de 852.985.920 parametros (aproximadamente 0,85B) especializado en el parseo de documentos a nivel de pagina completa. Desarrollado por el autor ianua, parte del modelo base Qwen/Qwen3.5-0.8B y se ha entrenado mediante post-entrenamiento con una receta multietapa que combina SFT, RL y OPD sobre un motor de datos que mezcla corpus reales y sinteticos. Su tarea es concreta: dada la imagen de una pagina, genera una representacion en Markdown en orden natural de lectura, cubriendo texto, formulas, tablas y regiones visuales.

Su relevancia actual radica en que, segun la model card, alcanza una puntuacion global de 96.58 en OmniDocBench v1.6 y se convierte en el primer modelo end-to-end en encabezar un leaderboard que hasta ahora estaba dominado por metodos de pipeline (deteccion de layout, OCR por regiones y post-procesado modular). En PureDocBench obtiene un Avg3 de 75.06. Frente a esas arquitecturas modulares, un unico modelo de menos de mil millones de parametros simplifica el despliegue y reduce el coste de infraestructura.

El modelo esta publicado con licencia Apache-2.0, en formato safetensors para la libreria transformers, con pipeline image-text-to-text, y esta preparado para servir con vLLM (la model card fija vllm==0.22.1). El repositorio ocupa 1,7 GB, coherente con pesos en precision BF16. No se especifican en la informacion disponible la longitud de contexto, los idiomas soportados ni los tipos de cuantizacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; hereda la del modelo base Qwen/Qwen3.5-0.8B (tag qwen3_5, multimodal image-text-to-text). El parametro de vLLM gdn_prefill_backend sugiere el uso de Gated DeltaNet en el prefill |
| Parametros totales | 852.985.920 (aproximadamente 0,85B, dato real de safetensors) |
| Parametros activos | No aplica (no hay evidencia de que sea MoE) |
| Longitud de contexto | No disponible. En el ejemplo de inferencia se configura max_tokens=16384 para la generacion |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se listan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tamano de repositorio 1,7 GB, compatible con BF16) |

## Arquitectura y entrenamiento

OvisOCR2 no introduce un transformer nuevo desde cero: es un post-entrenamiento del modelo multimodal Qwen/Qwen3.5-0.8B. Por tanto, mantiene su torre de vision y su decodificador de texto, con la peculiaridad de que el ejemplo oficial de inferencia en vLLM pasa el argumento gdn_prefill_backend="triton", lo que apunta a un mecanismo de atencion de tipo Gated DeltaNet (lineal/hibrido) en la fase de prefill. La informacion proporcionada no detalla el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tamano de patch del codificador visual, por lo que esos datos quedan como no disponibles. El modelo se sirve con tensor_parallel_size=1, es decir, esta pensado para ejecutarse en una sola GPU.

En cuanto al entrenamiento, la model card indica que se utilizo un motor de datos disenado especificamente que combina datos del mundo real con datos sinteticos, y una receta multietapa que integra SFT (supervised fine-tuning), RL (aprendizaje por refuerzo) y OPD. No se publican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni los detalles de los algoritmos de RL empleados. La tarea de salida esta fuertemente formateada: texto en Markdown en orden de lectura humano, formulas en LaTeX, tablas en HTML y regiones visuales representadas como etiquetas `<img>` con coordenadas de bounding box escaladas al rango [0, 1000). El tokenizador del modelo base admite el parametro enable_thinking en la plantilla de chat, que la model card desactiva explicitamente (enable_thinking=False) durante la inferencia, con temperature=0.0 para decodificacion determinista.

## Capacidades

- Reconocimiento optico de caracteres (OCR) a nivel de pagina completa, no solo de lineas o regiones aisladas.
- Generacion de Markdown en orden natural de lectura, preservando el flujo del documento original.
- Conversion de tablas a HTML (`<table>...</table>`), lo que facilita su renderizado y su parseo posterior.
- Formateo de formulas matematicas en LaTeX.
- Deteccion y representacion de regiones visuales (graficos, imagenes, diagramas) mediante etiquetas `<img>` con bounding boxes normalizados a [0, 1000).
- Procesamiento multimodal de entrada image-text-to-text: acepta una o varias imagenes junto a una instruccion de texto.
- Soporte de plantilla conversacional (tag conversational) con roles de usuario y contenido mixto imagen + texto.
- Modo de pensamiento configurable a traves del chat template (enable_thinking), desactivado por defecto en los ejemplos oficiales.
- Inferencia por lotes en vLLM: la clase de ejemplo `parse()` acepta una lista de imagenes y devuelve una lista de Markdowns.
- Limpieza de repeticiones truncadas integrada en el codigo de ejemplo, orientada a documentos de salida largos.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, capacidades de agente multi-paso, audio ni vision mas alla del parseo de documentos.

## Casos de uso

- Digitalizacion masiva de fondos documentales: procesamiento por lotes con vLLM de imagenes de pagina escaneadas para obtener Markdown en orden de lectura, lo que reduce el numero de etapas de un pipeline clasico (deteccion de layout + OCR por region + reconstruccion) a una sola llamada por pagina.
- Construccion de bases de conocimiento para RAG: el Markdown generado conserva la estructura (titulos, listas, tablas en HTML, formulas en LaTeX), lo que mejora la segmentacion en chunks y la recuperacion posterior en asistentes sobre normativa, manuales tecnicos o expedientes.
- Extraccion de tablas financieras y contables: la salida en HTML permite parsear directamente con librerias como BeautifulSoup o pandas.read_html, util para convertir balances, facturas o informes trimestrales escaneados en estructuras tabulares explotables.
- Conversion de articulos cientificos y documentacion tecnica: al formatear las formulas en LaTeX, el resultado se puede recompilar o renderizar con KaTeX/MathJax, lo que resulta adecuado para repositorios academicos y documentacion de ingenieria.
- Reconstruccion de maquetacion con regiones visuales: activando filter_imgtags=False y guardando los recortes referenciados por los bounding boxes, se puede regenerar el documento con sus figuras incrustadas, util para editoriales y para la conversion de PDF a HTML fiel.
- Despliegue on-premise con requisitos de privacidad: con menos de mil millones de parametros, el modelo cabe en GPUs de gama media, lo que permite procesar documentos sensibles (sanitarios, legales, administrativos) dentro de la infraestructura de la organizacion sin enviar imagenes a servicios externos.
- Indexacion de bibliotecas y hemerotecas: el procesamiento pagina a pagina con decodificacion determinista (temperature=0.0) ofrece resultados reproducibles, un requisito habitual en proyectos de preservacion digital a largo plazo.
- Preprocesado para entrenamiento de otros modelos: el Markdown con estructura explicita puede usarse como corpus de partida para tareas de resumen, extraccion de entidades o generacion de preguntas sobre documentos.

## Benchmarks y rendimiento

| Benchmark | Metrica | OvisOCR2 | Comparativa |
|---|---|---|---|
| OmniDocBench v1.6 | Puntuacion global | 96.58 | No disponible en la informacion proporcionada. La model card afirma que es el primer modelo end-to-end en encabezar este leaderboard, previamente dominado por metodos de pipeline |
| PureDocBench | Avg3 | 75.06 | No disponible en la informacion proporcionada. La model card afirma que es la puntuacion Avg3 mas alta |

No se han publicado en la informacion disponible resultados desglosados por submetrica (texto, tablas, formulas, orden de lectura), ni datos de MMLU, HumanEval, GSM8K u otros benchmarks generalistas, que por otra parte no corresponden al proposito de este modelo. Las tablas comparativas completas se referencian en la model card como imagenes (performance_omnidocbench_v16.png y performance_puredocbench.png), sin valores numericos textuales.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,7 GB en BF16 (852.985.920 parametros x 2 bytes). En cuantizacion de 8 bits serian aproximadamente 0,85 GB y en 4 bits aproximadamente 0,43 GB, aunque no se publican pesos cuantizados oficiales.
- VRAM adicional: depende del numero de tokens visuales, que a su vez depende de la resolucion de entrada. El ejemplo oficial permite desde 448 x 448 hasta 2880 x 2880 pixeles por imagen, por lo que el consumo de memoria de la cache de atencion puede crecer de forma notable en paginas de alta resolucion. El numero exacto de tokens visuales por imagen no esta disponible.
- Configuracion de referencia: vLLM con tensor_parallel_size=1 y gpu_memory_utilization=0.8, es decir, una unica GPU con un 80 por ciento de su memoria reservada para el modelo y la cache.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM para servir en BF16 con paginas de resolucion moderada; 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, L4, A10G) ofrecen margen comodo para lotes y alta resolucion; A100 y H100 no son necesarias por tamano, pero si utiles para throughput alto en produccion.
- Cabe en GPU de consumo: si, en la practica totalidad de GPUs de consumo modernas con 8 GB o mas, siempre que se ajuste el numero de paginas por lote y la resolucion maxima. Las estimaciones anteriores deben validarse con la carga real.
- Opciones de despliegue: vLLM 0.22.1 es la via documentada oficialmente. La libreria transformers esta soportada segun los metadatos del repositorio. No se han publicado pesos GGUF, por lo que llama.cpp, Ollama y LM Studio no estan disponibles con pesos oficiales en la informacion proporcionada; tampoco se documenta soporte explicito de TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de paginas procesadas por segundo.

## Comparativa con modelos similares

Los resultados de busqueda web proporcionados no contienen informacion relevante sobre modelos de OCR o parseo de documentos (devuelven contenido no relacionado), por lo que la comparativa se limita a alternativas conocidas del mismo segmento y a los datos publicos de cada proyecto. Los datos de tamano y licencia de los modelos alternativos no han podido verificarse en las fuentes de esta busqueda y deben confirmarse antes de tomar decisiones.

| Modelo | Parametros | Enfoque | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| OvisOCR2 | 852.985.920 (0,85B) | End-to-end, imagen de pagina a Markdown | No disponible (generacion configurada a 16384 tokens) | Apache-2.0 | 96.58 en OmniDocBench v1.6 y 75.06 Avg3 en PureDocBench segun su model card; pesos safetensors |
| olmOCR (AI2) | Aproximadamente 7B, basado en Qwen2-VL | End-to-end, pagina a texto plano | No disponible en esta busqueda | Apache-2.0 segun informacion publica del proyecto | Mayor huella de despliegue; no se dispone de puntuaciones comparables verificadas en esta busqueda |
| GOT-OCR2.0 | Aproximadamente 580M | End-to-end, OCR generalista y de documentos | No disponible en esta busqueda | Apache-2.0 segun informacion publica del proyecto | Tamano comparable; no se dispone de puntuaciones comparables verificadas en esta busqueda |
| PaddleOCR-VL | Aproximadamente 0,9B | Vision-language para OCR y documentos | No disponible en esta busqueda | No disponible en esta busqueda | Rango de tamano equivalente; no se dispone de puntuaciones comparables verificadas en esta busqueda |
| Metodos de pipeline (MinerU, marker y similares) | No aplica | Deteccion de layout + OCR por region + ensamblado | No aplica | Varias | Segun la model card, dominaban el leaderboard de OmniDocBench v1.6 antes de la publicacion de OvisOCR2 |

## Limitaciones y advertencias

- Tamano reducido: con 0,85B de parametros, la capacidad de razonamiento general y el conocimiento del mundo son limitados. El modelo esta optimizado para transcripcion estructurada, no para comprender el contenido del documento.
- Riesgo de repeticiones en salidas largas: el propio codigo de ejemplo incluye una funcion `_clean_truncated_repeats` para eliminar colas repetidas, lo que indica que el modelo puede entrar en bucles degenerativos en documentos muy densos o con max_tokens elevado. Es recomendable aplicar esa limpieza en produccion.
- Riesgo de alucinacion y de omisiones: como cualquier modelo generativo aplicado a OCR, puede inventar texto en zonas ilegibles, borrosas o con ruido, y puede omitir contenido en paginas con maquetacion compleja. No se han publicado tasas de error por tipologia documental.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados ni su cobertura. No debe asumirse un rendimiento uniforme multilingue sin evaluacion previa.
- Longitud de contexto no publicada: se desconoce la ventana real del modelo base. Aunque la generacion se configura a 16384 tokens, no hay garantia de que documentos extremadamente largos se procesen sin truncamiento. Ademas, la salida puede quedar truncada si se alcanza ese limite.
- Formato de salida rigido: las etiquetas `<img src="images/bbox_...">` con coordenadas normalizadas a [0, 1000) requieren codigo adicional para generar los recortes de imagen si se quiere un Markdown renderizable completo. Por defecto el ejemplo elimina esas etiquetas.
- Sensibilidad a la resolucion: el resultado depende del rango de pixeles configurado (min_pixels 448 x 448, max_pixels 2880 x 2880). Reducir la resolucion por ahorro de memoria puede degradar el reconocimiento de texto pequeno, tablas densas y formulas.
- Decodificacion determinista: los ejemplos usan temperature=0.0. No se documenta el comportamiento con muestreo estocastico ni si mejora en algun escenario.
- Restricciones de licencia: el modelo se publica bajo Apache-2.0, lo que en principio permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene sus propios terminos. Conviene revisar la licencia del modelo base y las condiciones de redistribucion antes de un despliegue comercial.
- Ausencia de senales de adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y su creacion y ultima actualizacion son del 10 de septiembre de 2026. No hay evidencia de uso en produccion ni de mantenimiento posterior.
- Ausencia de benchmarks independientes: las cifras de OmniDocBench v1.6 y PureDocBench proceden de la propia model card. No se han verificado con evaluaciones de terceros en la informacion disponible.
- Inexistencia de pesos cuantizados oficiales: sin GGUF ni variantes de cuantizacion publicadas, el despliegue en CPU o en entornos sin GPU requiere convertir o cuantizar los pesos por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ianua/OvisOCR2
- Repositorio alternativo citado en el codigo de ejemplo: https://huggingface.co/ATH-MaaS/OvisOCR2
- Informe tecnico (Technical Report): https://arxiv.org/abs/2607.13639
- Demo online: https://huggingface.co/spaces/ATH-MaaS/OvisOCR2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Imagen de rendimiento referenciada en la model card: ./performance.png, ./performance_omnidocbench_v16.png y ./performance_puredocbench.png (rutas relativas dentro del repositorio)
- Nota sobre la busqueda web: los resultados proporcionados no contienen ningun enlace relevante sobre el modelo ni sobre parseo de documentos; devuelven contenido no relacionado, por lo que no se incluye ninguno.
