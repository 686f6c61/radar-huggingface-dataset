# s2vopd/S2VOPD-Qwen3.5-9B

## Resumen

S²VOPD-Qwen3.5-9B es un modelo de vision-lenguaje (VLM) de 9.409.813.744 parametros construido mediante fine-tuning del modelo base Qwen/Qwen3.5-9B. Lo desarrolla el grupo de investigacion s2vopd (autores Yijiang Li, Yijun Liang, Yunjie Tian, Bingyang Wang, Ke Zhang, Zhenfei Yin, Di Fu, Philip Torr y Nuno Vasconcelos) y se publica como release oficial del articulo *Self-Supervised Visual On-Policy Distillation* (arXiv:2608.14144). El objetivo es mejorar la percepcion visual de detalle fino en tareas de comprension de imagenes de alta resolucion, un punto debil tipico de los VLM de escala media.

La innovacion central es un esquema de auto-destilacion on-policy sin modelo recompensa, sin anotacion humana y sin profesor de mayor tamano. El estudiante genera sobre una vista degradada de la imagen mientras un profesor EMA puntua el mismo prefijo sobre la imagen original limpia; la discrepancia entre ambos es la unica senal de entrenamiento. El modelo se distribuye en safetensors con licencia Apache 2.0 y pipeline image-text-to-text.

Es relevante ahora porque demuestra que se puede mejorar la percepcion de detalle fino de un VLM con un coste de computo muy bajo (una sola epoca de 65 pasos sobre 6.241 muestras) y sin infraestructura de RLHF ni datos anotados, lo que lo hace reproducible por equipos pequenos. Los resultados publicados en benchmarks de percepcion fina y razonamiento matematico multimodal lo situan por encima de lo esperable para un modelo de 9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) derivado de Qwen3.5-9B; detalles internos de capas y atencion no disponibles |
| Parametros totales | 9.409.813.744 (9,41B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; en entrenamiento se usaron prompts de hasta 8.192 tokens y respuestas de hasta 1.024 tokens; en evaluacion se generaron hasta 24.576 tokens |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en bfloat16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (la model card no enumera idiomas; hereda los del base Qwen3.5-9B, sin confirmacion oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con torre de vision y proyeccion a espacio de lenguaje, y se ajusta con destilacion on-policy auto-supervisada. El procedimiento es el siguiente: el estudiante genera una respuesta condicionada a una version degradada de la imagen; un profesor EMA (tasa de actualizacion 0,05) puntua el mismo prefijo sobre la imagen original limpia; la divergencia entre ambas distribuciones constituye la perdida, formulada como JSD generalizada con alpha=0,5, top-k=100 (renormalizado dentro del top-k del profesor) e is_clip=2,0. La senal es grande exactamente en los tokens que dependen de detalle visual fino y casi nula en el resto.

El entrenamiento se ejecuta durante 65 pasos (una epoca), con lotes de 96 prompts y n=8 rollouts por prompt, learning rate 2e-6 y 10 pasos de calentamiento. Los datos provienen de Vision-OPD-6K (6.241 muestras, sin cajas: ambas vistas derivan de la imagen original y se elimina la pista de caja roja de cada pregunta). Cada imagen recibe exactamente una degradacion, elegida entre cuatro opciones: resolucion no uniforme (30%), zoom-out con padding negro (30%), downscale sin reescalado mas jitter fotometrico de brillo, contraste y saturacion (30%), o ninguna (10%). El diseno de una sola degradacion por imagen es deliberado: apilarlas destruye el contenido y anula la informacion que transporta la brecha profesor-estudiante.

## Capacidades

- Comprension de imagenes de alta resolucion y percepcion de detalle fino (texto pequeno, objetos diminutos, regiones recortadas).
- Respuesta a preguntas visuales en formato image-text-to-text conversacional.
- Razonamiento matematico multimodal sobre diagramas, graficos y figuras.
- Generacion de texto y razonamiento de proposito general heredados del base Qwen3.5-9B.
- Capacidad multilingue: presumiblemente heredada del base, pero no documentada en la model card.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking explicito: no documentado.
- Vision y audio: vision confirmada; audio no disponible.

## Casos de uso

- Analisis de documentos escaneados y capturas de alta resolucion: el modelo esta entrenado especificamente para recuperar detalle en regiones pequenas de imagenes grandes, por lo que es adecuado para extraer texto de facturas, formularios o capturas 4K/8K donde los VLM genericos pierden informacion.
- Inspeccion visual de calidad (QA) industrial: con soporte para imagenes de resolucion no uniforme, puede detectar defectos en zonas concretas de una fotografia de producto sin necesidad de recortes manuales.
- Lectura de graficos y tablas cientificas: sus resultados en MathVista (81,40) y MathVerse (75,53) lo hacen util para interpretar diagramas, ejes y leyendas en articulos y reportes financieros.
- Asistencia en teledeteccion y analisis de imagenes satelitales: la degradacion por zoom-out durante el entrenamiento lo prepara para reconocer objetos en escenas con contexto amplio y detalle localizado.
- Moderacion de contenido visual: puede describir y clasificar elementos en imagenes de alta resolucion, incluidos detalles pequenos que suelen escapar a modelos de menor presupuesto visual.
- Tutor educativo de matematicas con soporte visual: dado un problema manuscrito o impreso en una foto, el modelo resuelve y explica el procedimiento; requiere presupuesto de generacion largo (se recomiendan 24.576 tokens para no truncar cadenas de razonamiento).
- Preprocesado de datasets visuales: generar descripciones detalladas y etiquetas de regiones para anotacion semiautomatica de corpus de imagen-texto.

## Benchmarks y rendimiento

Percepcion de detalle fino (decodificacion greedy, 4.096 tokens, seed 42):

| Benchmark | Puntuacion |
|---|---|
| V* Bench | 90,05 |
| ZoomBench | 57,75 |
| HR-Bench 4K | 86,00 |
| HR-Bench 8K | 84,88 |
| MME-RealWorld | 77,47 |
| MME-RealWorld-CN | 73,43 |
| Media | 78,26 |

Razonamiento matematico (24.576 tokens, T=0,3, top-p 0,95, top-k 20, presence penalty 1,5, seed 42; juez Qwen2.5-72B-Instruct):

| Benchmark | Puntuacion |
|---|---|
| MathVista | 81,40 |
| MathVerse | 75,53 |
| MathVision | 69,57 |
| WeMath | 88,85 |
| Media | 78,84 |

Nota del autor: a 16k tokens entre el 8% y el 11% de las generaciones siguen alcanzando el limite, por lo que las cifras matematicas obtenidas con protocolo greedy/4.096 no son comparables con estas. No se publican comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19-20 GB solo para pesos (9,41B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda una GPU de 24 GB o mas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion; RTX 4090 (24 GB) para inferencia en bfloat16 con batches pequenos.
- Cabe en GPU consumer: si, en RTX 4090/3090 (24 GB) en bfloat16; en GPUs de 16 GB requeriria cuantizacion, que no se distribuye oficialmente y habria que generar.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `flash_attention_2` (ruta oficial documentada). vLLM, TGI, llama.cpp u Ollama: no confirmado para esta arquitectura ni publicado por el autor.
- Latencia y throughput: no disponibles. La evaluacion matematica exige 24.576 tokens de generacion, lo que implica latencias altas en ese regimen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Percepcion fina | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S²VOPD-Qwen3.5-9B | 9,41B | no disponible (entrenamiento 8k prompt / 1k respuesta) | V* Bench 90,05; HR-Bench 4K 86,00; media 78,26 | Apache 2.0 | Hugging Face, safetensors |
| Qwen/Qwen3.5-9B (base) | 9B (aprox.) | no disponible | no disponible (no se publican cifras del base en esta ficha) | no disponible | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de modelos comparables de terceros (por ejemplo otros VLM de 7-9B) para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de investigacion con 35 descargas y 0 likes en el momento de la consulta: ecosistema y validacion externa muy limitados.
- Riesgo de alucinacion inherente a los VLM; no se documentan evaluaciones de fidelidad factual ni de hallucination benchmarks.
- El protocolo de evaluacion matematica depende de un juez LLM (Qwen2.5-72B-Instruct) y de hiperparametros concretos; cifras no reproducibles con otros ajustes.
- El entrenamiento usa una sola epoca sobre 6.241 muestras, lo que limita la diversidad de dominios visuales cubiertos y puede inducir sobreajuste a los tipos de degradacion vistos.
- Idiomas soportados no documentados; no hay garantia de rendimiento multilingue mas alla de lo heredado del base.
- No se distribuyen cuantizaciones GGUF/AWQ/GPTQ, lo que complica el despliegue en hardware de menos de 24 GB.
- Compatibilidad con vLLM, TGI, llama.cpp u Ollama no verificada; la unica ruta oficial es transformers.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base Qwen3.5-9B y de los benchmarks citados.
- El modelo esta optimizado para percepcion de detalle fino; no hay evidencia publicada de su rendimiento en tareas de agente, tool calling o dialogo multi-turno largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2vopd/S2VOPD-Qwen3.5-9B
- Paper: https://arxiv.org/abs/2608.14144
- Pagina del proyecto: https://williamium3000.github.io/s2vopd/
- Codigo: https://github.com/williamium3000/s2vopd
- Dataset de entrenamiento: https://huggingface.co/datasets/yuanqianhao/Vision-OPD-6K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
