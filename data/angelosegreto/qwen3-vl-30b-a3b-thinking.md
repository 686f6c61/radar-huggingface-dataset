# ANGELOSEGRETO/Qwen3-VL-30B-A3B-Thinking

## Resumen

Qwen3-VL-30B-A3B-Thinking es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por el equipo Qwen (Alibaba). Se trata de la variante MoE de 30 000 millones de parámetros totales con aproximadamente 3 000 millones de parámetros activos por token, en su edición «Thinking», orientada a razonamiento extendido. El repositorio analizado (ANGELOSEGRETO/Qwen3-VL-30B-A3B-Thinking) es una reproducción de los pesos oficiales, publicada por un tercero y con licencia Apache 2.0.

El modelo resuelve tareas de comprensión y generación conjunta de texto, imagen y vídeo: reconocimiento óptico de caracteres, razonamiento espacial 2D y 3D, agentes visuales que operan interfaces gráficas, generación de código a partir de capturas y comprensión de vídeo de larga duración. Su ventana de contexto nativa es de 256 000 tokens, ampliable a 1 000 000, lo que lo sitúa en el segmento de modelos de contexto largo con capacidades multimodales.

Es relevante ahora porque combina una huella de cómputo relativamente baja (3 000 millones de parámetros activos) con un rendimiento cercano al de modelos densos mucho mayores, además de incorporar innovaciones de posicionamiento (Interleaved-MRoPE), fusión de características del codificador visual (DeepStack) y alineación texto-marca temporal para modelado temporal de vídeo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y codificador visual ViT; clase `Qwen3VLMoeForConditionalGeneration` |
| Parámetros totales | 31 070 754 032 (≈31,1 B) |
| Parámetros activos | ≈3 B (nomenclatura A3B); desglose por experto no disponible |
| Longitud de contexto | 256 000 tokens nativos, ampliable a 1 000 000 |
| Tipos de cuantización | No disponible en la información proporcionada; el repositorio contiene pesos en safetensors (precisión declarada: no disponible) |
| Idiomas soportados | No disponible en la ficha del repositorio; el OCR declarado cubre 32 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); tamaño del repositorio: 62,1 GB |

## Arquitectura y entrenamiento

El modelo sigue un esquema de mezcla de expertos sobre un backbone transformer, con un codificador visual tipo ViT que procesa imágenes y vídeo. La ficha oficial destaca tres actualizaciones arquitectónicas: Interleaved-MRoPE, que reparte las frecuencias de las posiciones sobre tiempo, anchura y altura para mejorar el razonamiento sobre vídeo de horizonte largo; DeepStack, que fusiona características de varios niveles del ViT para afinar el alineamiento imagen-texto y capturar detalles finos; y la alineación texto-marca temporal, que sustituye a T-RoPE y permite localizar eventos con precisión temporal dentro de un vídeo.

No se han proporcionado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se detalla el número de expertos, su dimensión ni el mecanismo de enrutamiento. La model card indica que la generación incluye ediciones «Instruct» y «Thinking», y que la familia abarca variantes densas y MoE «desde el borde hasta la nube».

## Capacidades

- Generación y comprensión de texto con calidad declarada equiparable a la de modelos de lenguaje puros, mediante fusión texto-visión sin pérdida.
- Comprensión de imágenes: reconocimiento amplio de entidades (personas célebres, anime, productos, monumentos, flora y fauna), OCR en 32 idiomas con tolerancia a poca luz, desenfoque e inclinación, y análisis de estructura de documentos largos.
- Comprensión de vídeo: manejo de vídeos de varias horas con recuperación completa e indexación a nivel de segundo.
- Razonamiento multimodal en STEM y matemáticas, con análisis causal y respuestas basadas en evidencia.
- Percepción espacial: juicio de posiciones de objetos, puntos de vista y oclusiones; grounding 2D y 3D para razonamiento espacial y robótica corpórea.
- Agente visual: reconoce elementos de interfaces de PC y móvil, comprende su función e invoca herramientas para completar tareas.
- Generación de código visual: produce Draw.io, HTML, CSS y JavaScript a partir de imágenes y vídeos.
- Modo «Thinking»: la variante incluye razonamiento explícito antes de la respuesta final.
- Capacidades multilingües: no detalladas en la información disponible, más allá de los 32 idiomas de OCR.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada; la ficha menciona «invoca herramientas» dentro del apartado de agente visual.

## Casos de uso

- Automatización de atención al cliente con material adjunto: el modelo puede gestionar conversaciones multi-turno en las que el usuario envía capturas de facturas, recibos o pantallazos de error, extrayendo el texto mediante OCR y razonando sobre él gracias a la ventana de 256 000 tokens.
- Digitalización y estructuración de documentos: procesamiento de contratos, informes o expedientes escaneados con extracción de tablas y jerarquía de secciones, aprovechando la mejora en análisis de estructura de documentos largos y el OCR tolerante a baja calidad de imagen.
- Agentes que operan interfaces gráficas: automatización de flujos en aplicaciones de escritorio o móvil donde el modelo identifica botones y campos, comprende su función y encadena acciones para completar una tarea administrativa o de soporte.
- Análisis de vídeo de vigilancia o de procesos industriales: indexación a nivel de segundo de grabaciones de varias horas para localizar eventos concretos, apoyándose en la alineación texto-marca temporal y en el contexto ampliable a 1 000 000 de tokens.
- Asistente de accesibilidad: descripción detallada de escenas, lectura de documentos y explicación de interfaces para personas con discapacidad visual, con grounding espacial para indicar la posición de los elementos.
- Generación de prototipos de interfaz a partir de bocetos: conversión de capturas o wireframes en maquetas Draw.io, HTML y CSS, integrándolo en un flujo de diseño a desarrollo.
- Tutoría en materias STEM: resolución de problemas de matemáticas y ciencias a partir de fotografías de enunciados o pizarras, con cadenas de razonamiento explícitas en modo Thinking.
- Robótica y agentes corpóreos: uso del grounding 3D y del juicio de oclusiones y puntos de vista para tareas de manipulación o navegación asistida por visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card oficial incluye dos tablas de resultados en formato imagen (rendimiento multimodal y rendimiento en texto puro de la variante 30B-A3B Thinking), pero sus valores no están reproducidos en el texto ni en los metadatos accesibles, por lo que no se pueden citar cifras concretas.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Benchmarks multimodales (MMMU, DocVQA, VideoMME, etc.) | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 62-70 GB solo para los pesos, más memoria para caché KV y activaciones del codificador visual.
- VRAM estimada en FP8: aproximadamente 31-40 GB, según el soporte de cuantización de la pila de inferencia utilizada (no confirmado en la información disponible).
- VRAM estimada en cuantización de 4 bits: aproximadamente 17-20 GB, viable en una única GPU de consumo.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o varias GPU de 48 GB en paralelo con reparto de capas.
- GPU recomendadas para FP8: H100, H200, L40S 48 GB o A100 80 GB.
- GPU de consumo: una RTX 4090 de 24 GB puede ejecutar cuantizaciones de 4 bits, con posible desbordamiento a memoria del sistema para el codificador visual en escenarios de vídeo largo; una RTX 5090 de 32 GB ofrece más margen para FP8 o 4 bits.
- Opciones de despliegue: `transformers` con `Qwen3VLMoeForConditionalGeneration` (el repositorio indica que se requiere la versión 4.57.0 o instalar desde el código fuente de Hugging Face); se recomienda `flash_attention_2` para acelerar y reducir memoria en escenarios multiimagen y de vídeo. El soporte en vLLM, SGLang, TGI, llama.cpp u Ollama no se confirma en la información proporcionada.
- Latencia y rendimiento: no disponibles. Al tratarse de una arquitectura MoE con unos 3 000 millones de parámetros activos, el coste de cómputo por token es sustancialmente inferior al de un modelo denso de 31 000 millones, pero la huella de memoria sigue correspondiendo al total de parámetros.

## Comparativa con modelos similares

Los datos de la siguiente tabla corresponden a información pública general sobre la familia Qwen y no proceden de las fuentes indicadas en esta ficha, salvo en la primera fila. Los campos marcados como no disponibles no se han podido verificar.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Qwen3-VL-30B-A3B-Thinking (este repositorio) | 31,1 B totales / ≈3 B activos | 256K, ampliable a 1M | Apache 2.0 | No disponible |
| Qwen3-VL-235B-A22B-Thinking | 235 B totales / 22 B activos | 256K, ampliable a 1M | Apache 2.0 | No disponible |
| Qwen3-VL (variante densa de 32B, si existe en la familia) | ≈32 B densos | 256K, ampliable a 1M | Apache 2.0 | No disponible |
| Qwen2.5-VL-72B | ≈72 B densos | 128K nativos | Apache 2.0 | No disponible |

## Limitaciones y advertencias

- Este repositorio es una reproducción de terceros: el autor es «ANGELOSEGRETO», no el equipo Qwen, y el ejemplo de código de la model card apunta al repositorio oficial `Qwen/Qwen3-VL-30B-A3B-Thinking`. Registra 0 descargas y 0 «likes», por lo que conviene verificar la integridad de los pesos frente al repositorio oficial antes de usarlos en producción.
- La fecha de creación y actualización del repositorio (2026-09-13) es posterior a la fecha habitual de publicación de la familia y no se ha podido contrastar; puede indicar una carga automatizada o un error de metadatos.
- No se han publicado cifras de benchmarks verificables en la información disponible, lo que impide comparar el rendimiento con alternativas de forma cuantitativa.
- La lista de idiomas soportados no está disponible; solo se conoce la cobertura de 32 idiomas del OCR, que no implica necesariamente capacidad de generación en esos idiomas.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de fidelidad factual. En tareas de OCR y análisis de documentos, la inversión de dígitos o la omisión de líneas son riesgos típicos que deben mitigarse con validación posterior.
- El modo «Thinking» genera trazas de razonamiento largas, lo que incrementa el consumo de tokens de salida y la latencia percibida; hay que dimensionar los presupuestos de tokens y el coste por consulta en consecuencia.
- El procesamiento de vídeo de varias horas con contexto de hasta 1 000 000 de tokens exige una memoria considerable y estrategias de troceado o indexación; no es viable en GPU de consumo sin cuantización agresiva y gestión de caché externa.
- No se detalla el número de expertos ni la política de enrutamiento, lo que dificulta predecir el comportamiento bajo cargas variables y en despliegues con batching dinámico.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución con atribución, pero el usuario debe asumir la responsabilidad sobre la procedencia y la integridad de estos pesos concretos.
- Las variantes cuantizadas (GGUF, AWQ, GPTQ) no están confirmadas para este repositorio; su disponibilidad depende de conversiones de terceros.

## Enlaces

- Repositorio de HuggingFace analizado: https://huggingface.co/ANGELOSEGRETO/Qwen3-VL-30B-A3B-Thinking
- Repositorio oficial de referencia citado en la model card: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Thinking
- Qwen Chat: https://chat.qwenlm.ai/
- Informe técnico de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Informe técnico de Qwen2.5-VL (arXiv:2502.13923): https://arxiv.org/abs/2502.13923
- Artículo de Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Artículo de Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Diagrama de arquitectura publicado por el autor: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/qwen3vl_arc.jpg
- Tabla de rendimiento multimodal (imagen): https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/table_thinking_vl_30A3.jpg
- Tabla de rendimiento en texto puro (imagen): https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3-VL/table_thinking_text_30A3.jpg
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron únicamente páginas de ayuda de YouTube y contenidos de Zhihu sin relación con el modelo.
