# inclusionAI/Ling-3.0-flash-VL

## Resumen

Ling-3.0-flash-VL es un modelo multimodal nativo de la familia Ling de inclusionAI, que extiende el modelo híbrido de razonamiento Ling-3.0-flash con capacidades de comprensión de imagen y vídeo. Con 124B parámetros totales y solo 5.5B activados por token, consigue un equilibrio entre capacidad multimodal y eficiencia de inferencia. Su arquitectura integra la información visual en el proceso completo de comprensión, razonamiento, actuación y verificación, en lugar de tratarla como una simple entrada adicional.

El modelo está diseñado para tareas de razonamiento multimodal, comprensión de vídeo y worko de agentes, con una ventana de contexto de hasta 1M tokens. Soporta entrada de imágenes y vídeos, y puede traducir información visual en secuencias de acciones sobre interfaces de usuario. Su licencia MIT y su formato de pesos safetensors facilitan su integración en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con backbone hibrido de 42 capas (KDA y Gated MLA en ratio 5:1), encoder visual ViT + proyector MLP de dos capas, VideoRoPE |
| Parametros totales | 124.848.460.496 (124B) |
| Parametros activos | 5.5B por token |
| Longitud de contexto | Hasta 1M tokens (configuracion recomendada de 256K con YaRN) |
| Tipos de cuantizacion | BF16 y FP8 (segun la matriz de lanzamiento de SGLang) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ling-3.0-flash-VL parte de la arquitectura de Ling-3.0-flash y le anade un encoder visual basado en un ViT que extrae caracteristicas de imagenes y videos, junto con un proyector MLP de dos capas que alinea esas caracteristicas con las representaciones de texto. El modelo incorpora VideoRoPE, que codifica tanto la posicion espacial como el orden temporal, permitiendo tareas como localizacion de eventos, respuesta a preguntas sobre videos largos y edicion de clips de video.

El backbone consta de 42 capas que alternan capas KDA y Gated MLA en una proporcion de 5:1, lo que permite un procesamiento eficiente de contextos largos en texto, imagenes, videos e historiales extensos de tareas de agentes. La arquitectura MoE dispersa mantiene la capacidad total de 124B parametros activando solo 5.5B por token. No se han proporcionado datos especificos sobre el conjunto de datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. El modo de pensamiento (thinking mode) esta habilitado por defecto en la plantilla de chat.

## Capacidades

- Comprension multimodal nativa de imagenes y videos, incluyendo contaje de objetos, interpretacion de layouts complejos, graficos y contenido documental.
- Razonamiento con evidencia visual: calculos y razonamiento multi-paso apoyados en informacion visual, asi como verificacion de informacion externa.
- Capacidades de agente: comprende interfaces web y de software, y traduce informacion visual en secuencias de acciones.
- Soporte de tool calling y function calling, con parser automatico de herramientas y razonamiento (`--tool-call-parser ling3`).
- Comprension temporal de video gracias a VideoRoPE: localizacion de eventos, respuesta a preguntas sobre videos largos y edicion de clips de video.
- Ventana de contexto de hasta 1M tokens, con soporte para historiales extendidos de tareas de agentes.
- Razonamiento hibrido en modo pensamiento habilitado por defecto, con parametros recomendados de `temperature=0.6`, `top_p=0.95`, `top_k=20` segun la model card.
- Soporte para deshabilitar el modo pensamiento por peticion mediante `enable_thinking: false` en los parametros de la plantilla de chat.

## Casos de uso

- Analisis automatizado de documentos y graficos: el modelo puede interpretar graficos, layouts complejos y contenido de documentos, lo que permite extraer informacion de informes financieros, presentaciones corporativas o fichas tecnicas de manera automatizada y con razonamiento sobre el contenido.

- Agentes de automatizacion de interfaz: al comprender interfaces web y de software, el modelo puede traducir capturas de pantalla en secuencias de acciones, facilitando la automatizacion de tareas repetitivas en aplicaciones de escritorio o web, como rellenar formularios, navegar por paneles de administracion o completar flujos de trabajo.

- Respuesta a preguntas sobre videos largos: gracias a VideoRoPE y la ventana de contexto ampliada, el modelo puede localizar eventos concretos dentro de videos extensos y responder preguntas sobre el contenido temporal, util en tareas de revision de grabaciones de seguridad, analisis de contenido de archivo o monitorizacion de procesos.

- Verificacion visual en procesos industriales: el modelo usa evidencia visual para realizar calculos y razonamiento multi-paso, lo que permite tareas de control de calidad donde se verifican medidas, posiciones o conformidades a partir de imagenes capturadas por camaras.

- Asistentes de desarrollo de software: con soporte de tool calling y comprension de interfaces graficas, puede asistir en el desarrollo de aplicaciones analizando capturas de pantalla de entornos de desarrollo, interpretando resultados visuales de ejecuciones y ayudando a depurar comportamientos de la interfaz.

- Edicion de clips de video por instrucciones: el modelo comprende los cambios visuales a lo largo del tiempo y puede editar fragmentos de video segun instrucciones en lenguaje natural, lo que agiliza tareas de postproduccion, generacion de resumenes visuales o curacion de contenido para plataformas de video.

- Inventario y contaje de objetos: puede procesar escenas complejas para contar objetos y comprender disposiciones espaciales, siendo util en tareas de inventario logistico, control de stock en almacenes o analisis de aforo en eventos.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Artificial Analysis Intelligence Index v4.1.1 | 42 (mejora de 4 puntos sobre Ling-3.0-flash, que obtuvo 38) |
| Terminal-Bench 2.1 | Evaluado bajo protocolo AA con el harness Terminus 2, timeout de 2 horas, parser JSON en modo preserve-thinking y 3 ejecuciones por tarea (media). Decodificacion con `temperature=1.0`, `max_new_tokens=32K` y ventana de 256K. |

No se han publicado resultados numericos detallados de benchmarks multimodales especificos (como MMLU, HumanEval, GSM8K o equivalentes de vision) en la informacion disponible. La model card incluye una figura con resultados de benchmarks multimodales, pero los valores concretos no se proporcionan en texto. El rendimiento real debe validarse con las evaluaciones propias del equipo.

## Requisitos de hardware

- Para inferencia con 256K de contexto (configuracion YaRN): 4 GPUs de clase 141GB (H20-3e o H200) o nodos Blackwell de 4 GPUs (B300 o GB300).
- Para GPUs de 80GB (H100 o H800): escalar a `--tp 8` (tensor parallel de 8).
- Repositorio de pesos de 249.7GB, lo que implica requisitos de almacenamiento y ancho de banda de red considerables para la descarga del modelo.
- Cuantizaciones disponibles: BF16 y FP8 segun la matriz de lanzamiento de SGLang, lo que permite ajustar el consumo de VRAM en funcion del hardware.
- No es viable en GPUs de consumo (consumer GPU) debido al tamano del modelo y la necesidad de tensor parallel.
- Despliegue recomendado con SGLang, usando la imagen de Docker `lmsysorg/sglang:dev-Ling-3.0-flash-VL` o la receta del SGLang cookbook.
- Parametros de lanzamiento recomendados: `--context-length 262144`, `--mem-fraction-static 0.85`, `--trust-remote-code`, con `rope_scaling` de tipo YaRN (`factor=2.0`, `rope_theta=6000000`, `partial_rotary_factor=0.5`, `original_max_position_embeddings=131072`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Modalidad | Licencia |
|---|---|---|---|---|---|
| Ling-3.0-flash-VL | 124B | 5.5B | Hasta 1M | Texto + Imagen + Video | MIT |
| Ling-3.0-flash | 124B | 5.1B | Hasta 1M (estimado) | Solo texto | MIT |
| Ring-2.6-1T | 1T (clase) | No disponible | No disponible | No disponible | No disponible |

Ling-3.0-flash-VL anade capacidades multimodales al modelo Ling-3.0-flash, con un incremento de 0.4B en los parametros activados por token (5.5B frente a 5.1B) y una mejora de 4 puntos en el Artificial Analysis Intelligence Index. No se dispone de datos de benchmarks ni de especificaciones detalladas para Ring-2.6-1T en la informacion proporcionada, por lo que la comparacion se limita a los datos disponibles del mismo proveedor.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos conocidos ni evaluaciones de sesgos en la informacion disponible.
- No se documentan los datos de entrenamiento, la composicion del dataset ni las tecnicas de alineacion utilizadas, lo que limita la trazabilidad del comportamiento del modelo.
- Riesgo de alucinacion inherente a los modelos de lenguaje multimodal, no cuantificado ni documentado especificamente.
- Los idiomas soportados no estan especificados, por lo que el rendimiento fuera del ingles o del chino (idiomas tipicos de inclusionAI) no puede garantizarse sin validacion previa.
- Los requisitos de hardware son elevados: el modelo necesita entre 4 y 8 GPUs de alta gama, lo que implica costes de infraestructura significativos y descarta el despliegue en equipos de consumo o entornos con recursos limitados.
- Aunque la licencia MIT permite uso comercial, deben verificarse las licencias de las dependencias y del codigo custom (el tag `custom_code` indica que se requiere codigo personalizado para cargar el modelo).
- El rendimiento en benchmarks reales debe validarse en el entorno de produccion de cada equipo, ya que los resultados publicados se limitan a indices agregados sin desglose numerico detallado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Modelo base Ling-3.0-flash: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Organizacion inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- Organizacion inclusionAI en ModelScope: https://modelscope.cn/organization/inclusionAI
- Recetas de despliegue en SGLang: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash-VL
