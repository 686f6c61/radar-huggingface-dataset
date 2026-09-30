# schift-io/schift-ocr-1-beta

## Resumen

schift-ocr-1-beta es un modelo de OCR de documentos en coreano publicado por schift-io (la empresa detrás de la plataforma Schift, que ofrece APIs gestionadas de estructuración de documentos, búsqueda vectorial y observabilidad de agentes). Se trata de un ajuste fino sobre baidu/Unlimited-OCR, un modelo visión-lenguaje especializado en parsing de documentos: recibe la imagen de una página y devuelve el texto en orden de lectura, con tablas convertidas a HTML y una caja de maquetación para cada bloque detectado.

El modelo combina un codificador visual de dos ramas (SAM ViT-B de 12 capas y CLIP ViT-L/14 de 24 capas) con un decodificador de mezcla de expertos estilo DeepSeek-V2 de 12 capas y 3.638.995.200 parámetros en BF16. Cada capa MoE dispone de 72 expertos enrutados (los 64 del modelo base más 8 añadidos durante el ajuste), de los que cada token activa los 6 mejores, además de 2 expertos compartidos. La ventana de atención del decodificador es acotada: cada token ve la imagen completa y el prompt, más los últimos 128 tokens generados, de modo que el consumo de memoria no crece con la longitud de la salida.

El ajuste se centró en las capas feed-forward de los expertos a las que se enruta el contenido de tablas, manteniendo el router del modelo base intacto. La relevancia de esta versión radica en que es un lanzamiento beta de pesos abiertos (la versión buena se sirve solo a través de la API de Schift) que reduce el error de carácter un 50% en formularios impresos respecto al modelo base, con licencia MIT y un tamaño que cabe en GPU de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje: codificador visual dual (SAM ViT-B, 12 capas + CLIP ViT-L/14, 24 capas) con proyector lineal, y decodificador MoE estilo DeepSeek-V2 (12 capas, hidden 1280, 10 cabezas de atención, primera capa densa) |
| Parametros totales | 3.638.995.200 (unos 3,6B) |
| Parametros activos | no disponible (72 expertos enrutados por capa MoE, top-6 activos por token, más 2 expertos compartidos) |
| Longitud de contexto | 32.768 tokens configurados en vLLM (`--max-model-len 32768`); el decodificador atiende la imagen completa y el prompt más los últimos 128 tokens generados |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en BF16) |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT (heredada de baidu/Unlimited-OCR; se incluye el fichero LICENSE del modelo base) |
| Formato de pesos | safetensors (BF16); requiere `trust_remote_code=True` por código personalizado |

Otros datos: vocabulario de 129.280 tokens, tamaño del repositorio de 7,3 GB, 167 descargas y 13 likes en el momento de la consulta, creado el 29 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un modelo visión-lenguaje con decodificador de mezcla de expertos. El codificador visual reutiliza dos ramas del modelo base: SAM ViT-B con 12 capas y CLIP ViT-L/14 con 24 capas, cuyas representaciones se proyectan al espacio del decodificador mediante un proyector lineal. El decodificador sigue el diseño MoE de DeepSeek-V2 con 12 capas, tamaño oculto de 1280 y 10 cabezas de atención; la primera capa es densa y el resto utiliza expertos. Cada capa MoE incorpora 72 expertos enrutados (64 del modelo base más 8 añadidos) y 2 expertos compartidos, con activación de los 6 expertos mejor puntuados por token.

El ajuste fino se realizó sobre documentos coreanos y se concentró en las capas feed-forward de los expertos a las que se enruta el contenido de tablas, dejando el router en su configuración original. La ficha del autor no detalla el volumen ni la composición exacta del dataset de ajuste, ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. La innovación técnica destacable es la ventana de atención acotada durante la generación (imagen y prompt completos más los 128 últimos tokens), que mantiene el consumo de memoria constante independientemente de la longitud del documento generado, algo relevante para páginas largas con `max_tokens` de hasta 16.384.

## Capacidades

- Reconocimiento óptico de caracteres sobre imágenes de página completas en coreano, con salida en orden de lectura.
- Conversión de tablas a HTML dentro del flujo de texto (`<table><tr><td>...`).
- Detección y etiquetado de bloques con tipo y caja delimitadora en coordenadas de página normalizadas 0-1000, mediante marcas `<|det|>tipo [x1, y1, x2, y2]<|/det|>`.
- Manejo de contenido heterogéneo: formularios impresos, diapositivas de clase, informes y publicaciones.
- Generación de salidas largas (hasta 16.384 tokens) con memoria de decodificación constante gracias a la ventana de atención acotada.
- Inferencia determinista recomendada con `temperature=0` y `repetition_penalty=1.0`.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a parsing de una sola imagen por llamada.
- Capacidades multilingües: limitadas al coreano según la declaración de idiomas del repositorio.
- Modo de pensamiento (thinking), visión general o audio: no disponible.

## Casos de uso

- Digitalización de formularios bancarios y financieros: es el escenario donde el modelo rinde mejor (CER de 0,067 en formularios coreanos escaneados), por lo que encaja en pipelines de extracción de campos estructurados a partir de escaneos de solicitudes, contratos y justificantes.
- Procesamiento masivo de documentación administrativa coreana: con la ventana de 32.768 tokens y salidas de hasta 16.384, puede procesar páginas densas en una sola pasada sin fragmentar el documento.
- Conversión de apuntes y diapositivas a Markdown: útil para digitalizar material docente coreano y alimentar sistemas de búsqueda o generación aumentada, aceptando un CER más alto (0,217 en diapositivas).
- Extracción de tablas para analítica: la salida HTML permite reconstruir tablas de informes financieros y cargarlas en bases de datos o almacenes analíticos, siempre que no haya demasiadas celdas combinadas.
- Indexación de publicaciones y literatura técnica: con CER de 0,191 en documentos generales, sirve para construir corpus de texto a partir de PDF escaneados e integrarlos en motores de búsqueda vectorial.
- Automatización de back office con validación humana: dado que es una versión beta con fallos conocidos en páginas muy largas y tablas complejas, el uso realista es generar borradores de transcripción y aplicar revisión posterior.
- Preprocesado para modelos de lenguaje: al devolver texto en orden de lectura con marcas de estructura, la salida se puede encadenar a otros sistemas de resumen, traducción o extracción de entidades.
- Despliegue en infraestructura propia: al ser MIT y pesar unos 7,3 GB en BF16, permite montar un servicio de OCR self-hosted sin dependencia de APIs externas.

## Benchmarks y rendimiento

El autor reporta la tasa de error de carácter (CER), definida como la distancia de edición dividida por la longitud de referencia, con tope de 1,0 por página y media sobre el conjunto de páginas. Todos los modelos se ejecutaron con temperatura 0 sobre las mismas imágenes.

| Modelo | Formularios impresos | Diapositivas | General |
|---|---|---|---|
| schift-ocr-1-beta | 0,067 | 0,217 | 0,191 |
| baidu/Unlimited-OCR (base) | 0,135 | 0,228 | 0,219 |
| MinerU2.5-Pro-2605-1.2B | 0,091 | 0,222 | 0,164 |
| PaddleOCR-VL-1.6 | 0,155 | 0,258 | 0,161 |
| Gemini 3.1 flash-lite | 0,152 | 0,391 | 0,178 |
| Meta Muse Spark 1.3 | 0,159 | 0,410 | 0,132 |

Conjuntos de evaluación: 60 formularios bancarios y financieros coreanos escaneados (formularios impresos), 100 diapositivas de clase coreanas (diapositivas) y 100 páginas de informes y publicaciones coreanas (general). Frente al modelo base, el autor indica una reducción de errores del 50% en formularios, del 5% en diapositivas y del 13% en documentos generales. El propio autor advierte que las puntuaciones de diapositivas y general dependen de cómo se normalice el marcado Markdown de cada modelo y que varias referencias de diapositivas están incompletas, por lo que no reclama el liderazgo en esos dos conjuntos. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 los pesos ocupan aproximadamente 7,3 GB; hay que sumar el coste del codificador visual y del KV cache, que no crece con la longitud de salida gracias a la ventana de 128 tokens. Un presupuesto práctico de 10-12 GB de VRAM debería ser suficiente para una sola instancia en BF16.
- GPU recomendadas: cabe en GPU de consumo. Una RTX 4090 (24 GB) o RTX 3090 (24 GB) ofrecen margen holgado; tarjetas de 12-16 GB como la RTX 4080 o la RTX 4070 Ti Super deberían bastar en BF16, y con cuantización a 8 bits el margen aumenta. Para servicio con concurrencia alta se recomiendan A100 o H100.
- Despliegue: el autor documenta vLLM (`vllm serve schift-io/schift-ocr-1-beta --trust-remote-code --max-model-len 32768`, sobre un build que incluya el modelo Unlimited-OCR, validado con `unlimited_ocr.py` en el commit `7aaf016a1`) y Transformers con `AutoModel`/`AutoTokenizer` y `trust_remote_code=True`. No hay soporte confirmado de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible; el autor no publica tiempos de inferencia ni métricas de rendimiento por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | CER formularios | CER diapositivas | CER general | Licencia |
|---|---|---|---|---|---|---|
| schift-ocr-1-beta | 3,6B (MoE) | coreano | 0,067 | 0,217 | 0,191 | MIT |
| baidu/Unlimited-OCR | no disponible (modelo base) | no disponible | 0,135 | 0,228 | 0,219 | MIT (según el modelo derivado) |
| MinerU2.5-Pro-2605-1.2B | 1,2B | no disponible | 0,091 | 0,222 | 0,164 | no disponible |
| PaddleOCR-VL-1.6 | no disponible | no disponible | 0,155 | 0,258 | 0,161 | no disponible |

Frente al modelo base, schift-ocr-1-beta mejora de forma clara en formularios impresos (0,067 frente a 0,135) y ligeramente en el resto. Frente a MinerU2.5-Pro-2605-1.2B, gana en formularios (0,067 frente a 0,091) pero pierde en documentos generales (0,191 frente a 0,164), con la salvedad del propio autor sobre la normalización del marcado. PaddleOCR-VL-1.6 y los modelos propietarios de la tabla (Gemini 3.1 flash-lite y Meta Muse Spark 1.3) no son comparables en licencia ni en disponibilidad de pesos, y solo aparecen como referencia de CER. Los datos de parámetros y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es una versión beta: el propio autor indica que existe una versión mejor servida únicamente a través de la API de Schift, por lo que este checkpoint no representa el estado del arte interno del proyecto.
- Páginas muy largas pueden terminar en texto repetido, un fallo típico de decodificación autoregresiva que rompe la salida.
- Las tablas grandes con muchas celdas combinadas pueden generar filas con un número incorrecto de celdas, lo que invalida el HTML resultante para consumo automático.
- Idiomas: solo se declara coreano. No hay evidencia de rendimiento fiable en castellano ni en otros idiomas, aunque el modelo base pudiera tener cobertura más amplia.
- Riesgo de alucinación: al ser un modelo generativo de imagen a texto, puede producir contenido plausible que no aparece en la página, especialmente en regiones de baja calidad o en tablas complejas. Se recomienda validación automática de estructura y, en dominios críticos, revisión humana.
- Sesgos conocidos: la ficha no documenta análisis de sesgos. El modelo se ha ajustado exclusivamente sobre documentos coreanos, por lo que el rendimiento puede degradarse en otros formatos, tipografías o idiomas.
- Ventana de atención acotada a los 128 últimos tokens generados: aunque reduce memoria, puede degradar la coherencia en documentos muy largos, lo que encaja con el fallo de repetición descrito.
- Licencia MIT: permite uso comercial y modificación, pero al derivar de baidu/Unlimited-OCR conviene revisar el fichero LICENSE incluido y las condiciones del modelo base antes de un despliegue en producción.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; hay que auditar ese código antes de usarlo en entornos de producción.
- No hay cifras publicadas de latencia, throughput ni consumo energético, datos necesarios para dimensionar un servicio real.
- Los resultados de diapositivas y documentos generales están cuestionados por el propio autor debido a la normalización del Markdown y a referencias incompletas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schift-io/schift-ocr-1-beta
- Ficheros del repositorio: https://huggingface.co/schift-io/schift-ocr-1-beta/tree/main
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Organización en GitHub: https://github.com/schift-io
- Sitio de Schift: https://schift.io/en/
- Documentación de la API de embeddings de Schift: https://schift.io/docs/api/embeddings/
