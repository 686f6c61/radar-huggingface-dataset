# S2Visual-OPD/S2VOPD-Qwen3.5-4B

## Resumen

S2VOPD-Qwen3.5-4B es un modelo multimodal de vision e lenguaje (image-text-to-text) desarrollado por el grupo S2Visual-OPD, publicado como implementación oficial del método descrito en el paper *Self-Supervised Visual On-Policy Distillation*. Se construye mediante ajuste fino sobre Qwen/Qwen3.5-4B y su objetivo es mejorar la percepción visual de grano fino: reconocer detalle pequeño, texto en imagen, regiones de alta resolución y objetos poco prominentes, un punto donde los modelos de visión-lenguaje de tamaño medio suelen fallar.

La innovación principal es el procedimiento de entrenamiento: destilación on-policy autosupervisada, sin modelo de recompensa, sin anotación humana y sin profesor de mayor tamaño. El estudiante genera sobre una versión degradada de la imagen mientras un profesor EMA puntúa el mismo prefijo sobre la imagen original limpia; la discrepancia entre ambas distribuciones (JSD generalizada) es la única señal de entrenamiento. El entrenamiento es muy corto: 65 pasos sobre 6.241 muestras del dataset Vision-OPD-6K.

El modelo tiene 5.174.964.736 parámetros reales según los pesos en safetensors (unos 5,17 mil millones, por encima de los "4B" que sugiere el nombre), se distribuye bajo licencia Apache 2.0 y su repo ocupa 10,4 GB. Es relevante porque demuestra que es posible mejorar capacidades visuales finas con un coste de cómputo y datos muy reducido, sin depender de profesores grandes ni de RLHF con modelos de recompensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) heredada de Qwen/Qwen3.5-4B; tag de arquitectura `qwen3_5` |
| Parametros totales | 5.174.964.736 (aproximadamente 5,17 mil millones), segun los pesos en safetensors |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; la configuracion de entrenamiento uso prompts de hasta 8192 tokens y respuestas de hasta 1024 tokens |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (bfloat16). No se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; la evaluacion incluye MME-RealWorld-CN, lo que sugiere manejo del chino, pero el autor no publica una lista oficial de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,4 GB) |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-4B (finetune) |
| Fecha de publicacion | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-4B: un transformer multimodal con torre de visión y proyector hacia el espacio del modelo de lenguaje, cargable con `AutoModelForImageTextToText` y `AutoProcessor` de Transformers. El autor no detalla en la model card la composición interna del encoder visual ni la disposición exacta de capas, por lo que la información arquitectónica concreta más allá del modelo base no está disponible.

El entrenamiento se basa en destilación on-policy autosupervisada. En cada paso, el estudiante genera sobre una vista degradada de la imagen mientras un profesor EMA (tasa de actualización 0,05) puntúa el mismo prefijo sobre la imagen original limpia. La pérdida es una JSD generalizada con alpha=0,5, top-k=100 renormalizado dentro del top-k del profesor e is_clip=2,0. La señal de entrenamiento es grande precisamente en los tokens que dependen de detalle visual fino y casi nula en el resto. Hiperparámetros: 65 pasos de entrenamiento, 96 prompts con n=8 rollouts por lote, learning rate 2e-6 con 10 pasos de warmup.

La augmentación es un elemento clave del método: cada imagen de entrenamiento recibe exactamente una degradación, elegida entre tres familias al 30 % cada una y dejando un 10 % sin tocar. Las familias son resolución no uniforme (imagen sobre un lienzo reducido al 50-70 % con una única región nítida del 15-35 % del lienzo), zoom-out (escalado al 40-80 % con relleno negro) y downscale con jitter fotométrico (reducción al 30-60 % sin reescalado, más perturbaciones de brillo, contraste y saturación con probabilidad 0,5 cada una). El autor indica explícitamente que aplicar una sola degradación es deliberado: apilar varias destruye la imagen y la brecha profesor-estudiante deja de aportar información sobre detalle visual.

## Capacidades

- Comprensión visual de grano fino: detección de detalle pequeño, regiones de alta resolución (hasta 8K en evaluación) y objetos poco prominentes.
- Percepción en imágenes de alta resolución, evaluada en HR-Bench 4K y 8K, V* Bench, ZoomBench y MME-RealWorld.
- Razonamiento matemático sobre imágenes (MathVista, MathVerse, MathVision, WeMath), con generaciones largas de hasta 24.576 tokens en la configuración de evaluación.
- Generación de texto conversacional en pipeline image-text-to-text.
- Capacidad multilingüe: no hay lista oficial; la evaluación incluye la variante china de MME-RealWorld.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o modo de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Inspección de documentos densos en información: el modelo puede extraer y razonar sobre texto y elementos gráficos en capturas de alta resolución (hasta 4K/8K según su evaluación en HR-Bench), útil en digitalización de contratos, informes o planos.
- Control de calidad visual en fabricación: dado que rinde bien en detección de detalle pequeño (88,48 en V* Bench), puede usarse para verificar defectos, soldaduras o componentes en imágenes de línea de producción con una sola pasada de inferencia.
- Análisis de imágenes médicas o de microscopía asistido: su foco en percepción fina permite señalar regiones de interés en imágenes de alta resolución, siempre como apoyo a un especialista y no como sustituto del diagnóstico.
- Tutoría y resolución de problemas matemáticos con figuras: los resultados en MathVista (80,80) y WeMath (85,98) lo hacen adecuado para corregir ejercicios con diagramas, gráficas o formulación manuscrita, configurando un presupuesto de generación largo (24.576 tokens).
- Extracción de información de carteles, señales y fotografía urbana: la augmentación de zoom-out y downscale lo entrena para reconocer objetos lejanos o recortados, útil en aplicaciones de accesibilidad o inventario con cámaras móviles.
- Moderación y análisis de imágenes en plataformas: puede describir y clasificar contenido visual en pipelines automatizados, con la ventaja de que los pesos son Apache 2.0 y el modelo cabe en una sola GPU.
- Investigación en destilación on-policy: sirve como referencia reproducible (65 pasos, 6.241 muestras) para estudiar destilación autosupervisada sin modelo de recompensa en tareas multimodales.
- Prototipado de asistentes visuales en el borde: con cuantización a 4 bits podría desplegarse en GPUs de consumo, aunque no se publican pesos cuantizados oficiales.

## Benchmarks y rendimiento

Percepción de grano fino (decodificación greedy, 4096 tokens, semilla 42):

| Benchmark | Puntuacion |
|---|---|
| V* Bench | 88,48 |
| ZoomBench | 56,57 |
| HR-Bench 4K | 84,75 |
| HR-Bench 8K | 84,62 |
| MME-RealWorld | 75,06 |
| MME-RealWorld-CN | 72,18 |
| Media | 76,94 |

Razonamiento matemático (24.576 tokens, T=0,3, top-p 0,95, top-k 20, presence penalty 1,5, semilla 42; juez = Qwen2.5-72B-Instruct):

| Benchmark | Puntuacion |
|---|---|
| MathVista | 80,80 |
| MathVerse | 73,83 |
| MathVision | 64,67 |
| WeMath | 85,98 |
| Media | 76,32 |

El autor advierte que el presupuesto largo de generación es necesario para la suite matemática: con 16k tokens, entre el 8 % y el 11 % de las generaciones siguen alcanzando el límite, de modo que las cifras obtenidas con un protocolo greedy de 4096 tokens no son comparables. No se han publicado en la información disponible resultados de benchmarks comparativos frente a modelos de referencia de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del recuento real de 5,17 mil millones de parámetros; no publicadas por el autor): en bfloat16, en torno a 11-13 GB de pesos y estados, más activaciones y caché KV; en int8, aproximadamente 6-7 GB; en int4, aproximadamente 4 GB.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM para bfloat16 (RTX 4080/4090, L4, A10G, A100 40 GB, H100). El repositorio ocupa 10,4 GB, por lo que una RTX 4090 de 24 GB es suficiente para bfloat16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 8-12 GB si se aplica cuantización de 4 u 8 bits, aunque no hay pesos cuantizados publicados oficialmente.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText` y `attn_implementation="flash_attention_2"` (ruta documentada por el autor); llama.cpp, Ollama y TGI requerirían conversiones a GGUF u otros formatos no publicados; vLLM u otros servidores de alto rendimiento dependerían del soporte de la arquitectura `qwen3_5`, no confirmado en la información disponible.
- Latencia y throughput: no disponible. Como referencia indirecta de coste, la evaluación matemática usó presupuestos de generación de 24.576 tokens, lo que implica latencias altas en esa configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S2VOPD-Qwen3.5-4B | 5,17 mil millones (safetensors) | no disponible | Media 76,94 en percepción fina; media 76,32 en matemáticas | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la información | no disponible | no disponible | no disponible en la información | HuggingFace |
| Alternativas de la misma categoría (VLM de ~4-8 mil millones) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados en la información proporcionada para comparar con alternativas de terceros de tamaño similar; la única referencia verificable es el modelo base, sobre el que este modelo se ajusta con 65 pasos de destilación on-policy.

## Limitaciones y advertencias

- El ajuste es extremadamente corto (65 pasos, 96 prompts con 8 rollouts y 6.241 muestras), por lo que las mejoras están muy concentradas en percepción visual fina y no implican mejoras generales de razonamiento o conocimiento.
- Las cifras de rendimiento son autodeclaradas por el autor y no se acompañan de una comparativa con modelos de referencia en la información disponible.
- Riesgo de alucinación: es un modelo de lenguaje con torre visual; puede describir detalle inexistente, especialmente en imágenes degradadas, de baja resolución o con oclusión, justo el régimen sobre el que se entrenó.
- Sensibilidad a la resolución y a la degradación de la imagen: la augmentación de entrenamiento incluye downscale y zoom-out, pero no se documenta el comportamiento fuera de esas distribuciones.
- Las evaluaciones matemáticas solo son reproducibles con presupuestos de generación de 24.576 tokens y una configuración de muestreo concreta; con greedy y 4096 tokens los resultados no son comparables según el propio autor.
- Idiomas: no hay lista oficial de idiomas soportados, lo que dificulta garantizar calidad multilingüe en producción.
- Licencia Apache 2.0 en el repositorio, pero los términos del modelo base Qwen/Qwen3.5-4B deben verificarse por separado antes de un uso comercial.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM sin trabajo adicional de conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes, sin garantía de mantenimiento.
- La model card no documenta sesgos demográficos ni evaluación de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/S2Visual-OPD/S2VOPD-Qwen3.5-4B
- Paper (arXiv 2608.14144): https://arxiv.org/abs/2608.14144
- Pagina del proyecto: https://williamium3000.github.io/s2vopd/
- Codigo: https://github.com/williamium3000/s2vopd
- Dataset de entrenamiento (Vision-OPD-6K): https://huggingface.co/datasets/yuanqianhao/Vision-OPD-6K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
