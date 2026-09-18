# S2Visual-OPD/S2VOPD-Qwen3.5-9B

## Resumen

S²VOPD-Qwen3.5-9B es un modelo visión-lenguaje publicado por el grupo S2Visual-OPD, construido mediante ajuste fino sobre Qwen/Qwen3.5-9B. Su objetivo es mejorar la percepción visual de detalle fino: la capacidad de responder preguntas que dependen de regiones pequeñas, texto de baja altura o elementos que se pierden cuando la imagen se procesa a resolución reducida. La etiqueta pipeline del repositorio es image-text-to-text y el modelo se distribuye con licencia Apache 2.0.

El interés técnico del modelo está en su método de entrenamiento, la destilación on-policy auto-supervisada (Self-Supervised Visual On-Policy Distillation). Según la model card, no se emplea modelo de recompensa, ni anotación humana, ni un profesor de mayor tamaño: el estudiante genera sobre una vista degradada de la imagen mientras un profesor EMA puntúa el mismo prefijo sobre la imagen original limpia, y la divergencia entre ambas distribuciones constituye la señal de entrenamiento completa. El ajuste es muy corto (65 pasos) sobre un conjunto de 6.241 muestras.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) según los pesos en safetensors, con un repositorio de 18,8 GB. Se publica como pesos completos en safetensors para uso con transformers, sin versiones cuantizadas oficiales. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; modelo multimodal visión-lenguaje derivado del transformer de Qwen/Qwen3.5-9B (tag qwen3_5) |
| Parámetros totales | 9.409.813.744 (9,41 mil millones) |
| Parámetros activos | No aplica / no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | No disponible. En entrenamiento se usaron prompts de hasta 8.192 tokens y respuestas de hasta 1.024 tokens; en evaluación de razonamiento matemático se generaron hasta 24.576 tokens |
| Tipos de cuantización | No disponible: el autor no publica versiones cuantizadas (ni GGUF, ni AWQ, ni GPTQ, ni FP8) |
| Idiomas soportados | No disponible como lista. Se reporta puntuación en MME-RealWorld-CN (73,55), benchmark en chino, lo que evidencia capacidad de procesamiento en chino además del inglés |
| Licencia | Apache 2.0 (según los metadatos del repositorio) |
| Formato de pesos | safetensors (repositorio de 18,8 GB, pesos en bf16); no se publican GGUF ni otros formatos |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que el modelo parte de Qwen/Qwen3.5-9B y que es un modelo multimodal de tipo visión-lenguaje. Por tanto, los detalles de encoder visual, resolución de entrada, mecanismo de atención o tipo de fusión multimodal no están disponibles en la información proporcionada. Los tags del repositorio (qwen3_5, multimodal, vision-language-model) confirman la familia arquitectónica, pero no permiten afirmar detalles concretos.

El método de entrenamiento sí está documentado. Se trata de destilación on-policy auto-supervisada: el estudiante genera sobre una vista degradada de la imagen y un profesor EMA (tasa de actualización 0,05) puntúa el mismo prefijo sobre la imagen original limpia. La discrepancia entre ambas distribuciones es la señal de pérdida, formulada como JSD generalizada con alpha=0,5, top-k=100 renormalizado dentro del top-k del profesor e is_clip=2,0. El entrenamiento consta de solo 65 pasos, con 96 prompts y n=8 rollouts por prompt, learning rate de 2e-6 y 10 pasos de warmup. La augmentación aplica exactamente una degradación por imagen, elegida entre resolución no uniforme (30 %), zoom-out (30 %), downscale con jitter fotométrico (30 %) y sin degradación (10 %). Los datos de entrenamiento provienen del conjunto Vision-OPD-6K, con 6.241 muestras. No se menciona RLHF ni DPO.

## Capacidades

- Comprensión visual de detalle fino: percepción de regiones pequeñas, texto menudo y objetos que se pierden en resoluciones reducidas, con resultados reportados en V* Bench (90,58), ZoomBench (57,28) y HR-Bench 4K/8K (85,00 / 83,88).
- Procesamiento de imágenes de alta resolución, incluyendo los regímenes de 4K y 8K evaluados en HR-Bench.
- Razonamiento matemático sobre imágenes: MathVista 82,10, MathVerse 75,23, MathVision 68,65 y WeMath 88,62, con presupuesto de generación largo (24.576 tokens).
- Conversación multimodal multi-turno: el repositorio está etiquetado como conversational y la pipeline es image-text-to-text.
- Comprensión de escenas reales en inglés y chino, medida con MME-RealWorld (76,56) y MME-RealWorld-CN (73,55).
- Robustez a vistas degradadas de la imagen, consecuencia directa del esquema de entrenamiento con augmentación de una sola degradación por muestra.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio o vídeo: no disponibles; el modelo se declara exclusivamente de imagen y texto.
- Modo thinking explícito: no disponible en la información proporcionada. El protocolo de evaluación usa temperatura, top-p y top-k, pero no se describe un modo de razonamiento separado.

## Casos de uso

- Inspección visual industrial: revisión de soldaduras, PCB o piezas mecanizadas donde los defectos ocupan pocos píxeles. El rendimiento en ZoomBench y V* Bench indica que el modelo mantiene la atención sobre regiones pequeñas en lugar de resumir la imagen completa.
- Análisis de imágenes aéreas y de satélite: detección y descripción de elementos pequeños sobre imágenes de gran tamaño, aprovechando los resultados en HR-Bench 4K y 8K.
- Digitalización de documentos densos: extracción de texto y estructura de escaneos con tipografía pequeña o tablas complejas, donde el cuello de botella habitual es la pérdida de detalle al reescalar.
- Tutoría educativa con problemas matemáticos ilustrados: resolución de ejercicios de geometría, gráficas y diagramas, con la salvedad de que el autor indica que se necesita un presupuesto de generación de hasta 24.576 tokens para reproducir las cifras publicadas.
- Descripción de imágenes para accesibilidad: generación de descripciones detalladas de escenas y objetos para lectores de pantalla, en un modo conversacional multi-turno.
- Asistente visual interactivo en atención al cliente: el usuario envía una foto de un producto o de un error en pantalla y el modelo responde en varios turnos; requiere desplegar el modelo con gestión de contexto e imágenes.
- Anotación asistida de datos de visión: generación de descripciones ricas en detalle para preetiquetar datasets de imagen, usando la capacidad de percepción fina como generador de texto y no solo como clasificador.
- Verificación de calidad en pipelines de visión por computador: comparación entre la descripción generada por el modelo y los metadatos esperados para detectar imágenes mal etiquetadas o recortes erróneos.

## Benchmarks y rendimiento

Percepción de detalle fino. Decodificación greedy, 4.096 tokens, seed 42.

| Benchmark | Puntuación |
|---|---|
| V* Bench | 90,58 |
| ZoomBench | 57,28 |
| HR-Bench 4K | 85,00 |
| HR-Bench 8K | 83,88 |
| MME-RealWorld | 76,56 |
| MME-RealWorld-CN | 73,55 |
| Media | 77,81 |

Razonamiento matemático. 24.576 tokens, T=0,3, top-p 0,95, top-k 20, presence penalty 1,5, seed 42; juez Qwen2.5-72B-Instruct.

| Benchmark | Puntuación |
|---|---|
| MathVista | 82,10 |
| MathVerse | 75,23 |
| MathVision | 68,65 |
| WeMath | 88,62 |
| Media | 78,65 |

El autor advierte explícitamente de que el presupuesto largo de generación es necesario para la suite matemática: con 16.000 tokens, entre el 8 % y el 11 % de las generaciones siguen alcanzando el límite, de modo que las cifras obtenidas con protocolos greedy de 4.096 tokens no son comparables con estas. No se publican comparaciones directas contra otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 19 GB solo para los pesos (9,41 mil millones de parámetros), más caché KV y activaciones del encoder visual. Con imágenes de alta resolución y contextos de varios miles de tokens, el consumo realista se sitúa por encima de 20 GB. Estimación propia, no publicada por el autor.
- VRAM estimada con cuantización de 8 bits: aproximadamente 10-11 GB de pesos, con un total estimado de 12-15 GB según contexto. No hay versiones cuantizadas oficiales, por lo que habría que generarlas.
- VRAM estimada con cuantización de 4 bits: aproximadamente 5,5-6 GB de pesos, en torno a 8-10 GB en ejecución. Tampoco existen versiones oficiales.
- GPU recomendadas: A100 40 GB o H100 para bf16 con margen; RTX 4090 o RTX 3090 (24 GB) pueden ejecutar bf16 con contextos moderados, pero quedan ajustadas si se combinan imágenes grandes y generaciones largas.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB en bf16 con configuración conservadora, y en tarjetas de 16 GB o 12 GB únicamente recurriendo a cuantización de 8 o 4 bits generada por el usuario.
- Opciones de despliegue: la model card solo documenta transformers mediante AutoModelForImageTextToText y AutoProcessor, con dtype bfloat16 y attn_implementation="flash_attention_2". El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible, y la ausencia de pesos GGUF impide el despliegue directo en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. El único dato relacionado es el coste de generación de la suite matemática, que requiere hasta 24.576 tokens por respuesta, lo que implica tiempos de generación altos en cualquier hardware.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos alternativos en la información proporcionada, y las cifras del propio modelo se obtuvieron con protocolos de decodificación específicos (greedy con 4.096 tokens para percepción, hasta 24.576 tokens para matemáticas), por lo que no son directamente comparables con cifras publicadas bajo otros protocolos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de benchmark |
|---|---|---|---|---|---|
| S²VOPD-Qwen3.5-9B | 9,41 mil millones | No disponible | Apache 2.0 | Pesos safetensors en HuggingFace; 0 descargas y 0 likes en el momento de la consulta | Tablas de percepción fina y matemáticas incluidas arriba |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | HuggingFace | No disponible |
| Otras alternativas de la misma categoría (por ejemplo, modelos visión-lenguaje de 8-9 mil millones de parámetros) | No disponible | No disponible | No disponible | No disponible | No disponible: no se han facilitado datos comparables |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no incluye análisis de sesgos ni de sesgos demográficos o culturales.
- Riesgo de alucinación: no cuantificado por el autor. En tareas de percepción fina el riesgo específico es describir detalle inexistente cuando la imagen es ambigua o de baja calidad, precisamente el escenario sobre el que se entrenó el modelo.
- Entrenamiento muy corto: 65 pasos sobre 6.241 muestras. Es un ajuste ligero sobre el modelo base, no un preentrenamiento, por lo que hereda tanto las capacidades como los defectos de Qwen3.5-9B.
- Protocolo de evaluación no estándar: las cifras de percepción usan decodificación greedy con 4.096 tokens y las de matemáticas hasta 24.576 tokens con parámetros de muestreo concretos. El propio autor advierte de que las cifras obtenidas con protocolos greedy de 4.096 tokens no son comparables. Cualquier comparación con tablas de terceros debe hacerse con cautela.
- Limitaciones de idioma: no se publica lista de idiomas soportados. Solo hay evidencia indirecta de inglés y chino a través de MME-RealWorld y MME-RealWorld-CN.
- Coste de generación: reproducir los resultados matemáticos exige presupuestos de decodificación de decenas de miles de tokens, con el consiguiente impacto en latencia y coste.
- Licencia: el repositorio declara Apache 2.0, lo que en principio permite uso comercial. No obstante, conviene verificar los términos del modelo base Qwen/Qwen3.5-9B, ya que la información proporcionada no incluye su licencia.
- Sin herramientas de despliegue ligero: al no existir pesos GGUF ni cuantizaciones oficiales, el despliegue en entornos con poca VRAM exige cuantizar por cuenta propia y validar que el rendimiento se mantiene.
- Validación comunitaria inexistente: 0 descargas y 0 likes en el momento de la consulta. No hay informes de terceros sobre estabilidad, comportamiento en producción ni regresiones respecto al modelo base.
- Fecha y numeración del paper: el identificador arXiv indicado (2608.14144) y las fechas de creación del repositorio (septiembre de 2026) corresponden a la información tal como se proporcionó; no se ha podido contrastar con fuentes externas.
- Búsqueda web sin resultados relevantes: las consultas realizadas devolvieron únicamente calculadoras de par de apriete (torque), sin relación con el modelo. No se ha podido obtener información adicional independiente de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/S2Visual-OPD/S2VOPD-Qwen3.5-9B
- Paper: https://arxiv.org/abs/2608.14144
- Página del proyecto: https://williamium3000.github.io/s2vopd/
- Código: https://github.com/williamium3000/s2vopd
- Dataset de entrenamiento Vision-OPD-6K: https://huggingface.co/datasets/yuanqianhao/Vision-OPD-6K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
