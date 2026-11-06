# s2vopd/S2VOPD-Qwen3.5-4B-Contrastive

## Resumen

S²VOPD-Qwen3.5-4B-Contrastive es un modelo vision-language (image-text-to-text) de aproximadamente 5.175 millones de parametros construido sobre Qwen/Qwen3.5-4B y publicado por el autor `s2vopd`. Es la release oficial asociada al articulo *Self-Supervised Visual On-Policy Distillation* (arXiv:2608.14144) y esta especializado en percepcion visual de grano fino: interpretacion de imagenes de alta resolucion, regiones pequenas y detalles que los VLM genericos suelen pasar por alto.

La innovacion central es el metodo de entrenamiento: destilacion on-policy autosupervisada sin modelo de recompensa, sin anotacion humana y sin profesor de mayor tamano. El estudiante genera sobre una vista degradada de la imagen mientras un profesor EMA puntua el mismo prefijo sobre la imagen original limpia; la discrepancia entre ambos es la senal de entrenamiento. Sobre esa base se anade un termino de contraste (contrast sharpening) que aisla la contribucion real de la imagen frente a un lienzo negro de control.

El modelo es relevante porque demuestra que es posible mejorar de forma sustancial la percepcion visual fina de un VLM de 4B con un coste de entrenamiento minimo (65 pasos, una epoca) y sin datos anotados adicionales mas alla del dataset Vision-OPD-6K. Con 28 descargas y publicado en noviembre de 2026, es una release de investigacion orientada a reproducibilidad y evaluacion, no un modelo de produccion maduro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.5-4B, con adaptador visual y entrenamiento por destilacion on-policy |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec oficial; el entrenamiento usa prompt <= 8192 tokens y respuesta <= 1024 tokens; en evaluacion se generan hasta 24576 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bfloat16) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el benchmark MME-RealWorld-CN sugiere capacidad en chino ademas de ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con torre visual y proyector hacia el espacio de tokens del LLM. El pipeline declarado es `image-text-to-text` y la implementacion de referencia usa `AutoModelForImageTextToText` con `flash_attention_2` y `bfloat16`. No se detalla en la informacion disponible la configuracion interna de capas, dimensiones ocultas ni el numero de tokens de vision por imagen.

El entrenamiento es el nucleo del trabajo. Se trata de destilacion on-policy autosupervisada: el estudiante genera sobre una vista degradada de la imagen y un profesor EMA (tasa de actualizacion 0,05) puntua el mismo prefijo sobre la imagen limpia original. La perdida es una JSD generalizada con alpha=0,5, top-k=100 renormalizado dentro del top-k del profesor e `is_clip=2.0`. Sobre ello se aplica *contrast sharpening*: el profesor tambien se puntua sobre un lienzo negro del mismo tamano y el objetivo de destilacion pasa a ser `softmax(0.5 * lp_teacher + 0.5 * (lp_teacher - lp_black))`, restringido al soporte plausible del profesor (`p_teacher(w) >= 0.1 * max p_teacher`). Hiperparametros: 65 pasos (una epoca), 96 prompts con n=8 rollouts, learning rate 2e-6 con 10 pasos de warmup, longitudes de prompt <= 8192 y respuesta <= 1024.

La aumentacion aplica exactamente una degradacion por imagen, elegida entre tres familias al 30 % cada una y un 10 % sin tocar: resolucion no uniforme (imagen sobre lienzo al 40-60 %, fondo al 20-35 % de resolucion y una region del 15-35 % nitida), zoom-out (escala 40-80 % con relleno negro) y downscale con jitter fotometrico (30-60 % sin reescalar, mas perturbaciones de brillo, contraste y saturacion con probabilidad 0,5). El dataset es Vision-OPD-6K, con 6.241 muestras y sin cajas: ambas vistas proceden de la imagen original y se elimina la pista de caja roja de cada pregunta.

## Capacidades

- Comprension visual de grano fino: identificacion de objetos, texto y detalles en regiones pequenas de imagenes de alta resolucion (evaluado en HR-Bench 4K y 8K, V* Bench y ZoomBench).
- Razonamiento matematico sobre imagenes: resolucion de problemas matematicos con soporte visual (MathVista, MathVerse, MathVision, WeMath).
- Generacion de texto conversacional multimodal en formato image-text-to-text.
- Respuesta a preguntas sobre escenas complejas del mundo real, incluido el dominio chino (MME-RealWorld-CN).
- Generacion con presupuesto largo de tokens: la suite matematica requiere hasta 24.576 tokens de generacion para evitar truncamientos (al truncar a 16k, entre el 8 % y el 11 % de las generaciones siguen alcanzando el limite).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio o thinking mode explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inspeccion de documentos y capturas de alta resolucion: el modelo esta entrenado para mantener detalle en regiones pequenas de imagenes grandes, por lo que es adecuado para extraer texto y estructura de capturas 4K/8K o documentos densos donde un VLM generico pierde informacion al reescalar.
- Analisis de imagenes satelitales o de dron: la aumentacion de resolucion no uniforme y zoom-out simula exactamente el tipo de vista degradada con la que se entrena, lo que lo hace util para localizar elementos pequenos en fotogramas amplios.
- Verificacion de calidad visual en fabricacion: preguntas dirigidas sobre defectos o componentes en imagenes de alta resolucion, aprovechando la sensibilidad a detalle fino medida en V* Bench y ZoomBench.
- Tutorizacion de problemas matematicos con figura: resolucion de ejercicios de geometria o graficos con generacion larga (hasta 24k tokens) para desarrollar el razonamiento completo sin truncar.
- Investigacion en destilacion visual: reproduccion del metodo S²VOPD con el codigo publicado, usando el modelo como referencia de estudiante entrenado y como punto de partida para ablaciones (por ejemplo, desactivando `self_distillation.vcsd_contrast`).
- Evaluacion comparativa de VLM de 4B: servir como baseline especializado en percepcion fina frente a modelos generalistas del mismo tamano en suites como MME-RealWorld o HR-Bench.
- Asistencia a accesibilidad visual: descripcion detallada de escenas y lectura de texto en imagenes para usuarios con discapacidad visual, con enfasis en elementos pequenos que otros modelos omiten.

## Benchmarks y rendimiento

Percepcion de grano fino (decodificacion greedy, 4096 tokens, semilla 42):

| Benchmark | Puntuacion |
|---|---|
| V* Bench | 92,15 |
| ZoomBench | 61,07 |
| HR-Bench 4K | 86,25 |
| HR-Bench 8K | 84,12 |
| MME-RealWorld | 77,16 |
| MME-RealWorld-CN | 71,73 |
| Media | 78,75 |

Razonamiento matematico (24576 tokens, T=0,3, top-p 0,95, top-k 20, presence penalty 1,5, semilla 42; juez Qwen2.5-72B-Instruct):

| Benchmark | Puntuacion |
|---|---|
| MathVista | 81,90 |
| MathVerse | 76,17 |
| MathVision | 68,09 |
| WeMath | 89,37 |
| Media | 78,88 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en estas mismas suites, ni cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10-11 GB solo para pesos (5,17B parametros), mas overhead de activaciones y cache KV; en la practica, 16-24 GB son un punto de partida razonable para imagenes de resolucion moderada.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion con presupuestos largos (24k tokens de generacion) y lotes grandes; L40S o RTX 6000 Ada como alternativas de 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 para una sola peticion; en GPUs de 12-16 GB (RTX 4070 Ti, 4080) sera necesario cuantizar, aunque no se publican pesos GGUF/AWQ oficiales.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText`, `AutoProcessor`, `dtype=torch.bfloat16`, `attn_implementation="flash_attention_2"` y `device_map="cuda"` es la ruta documentada. vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible; la compatibilidad con vLLM depende del soporte de la arquitectura `qwen3_5` en la version correspondiente.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la evaluacion matematica exige generar hasta 24.576 tokens por muestra, lo que implica costes de decodificacion elevados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S²VOPD-Qwen3.5-4B-Contrastive | 5,17B | no disponible (entrenamiento con prompt <= 8192) | VLM especializado en percepcion fina via destilacion on-policy | Apache 2.0 | Hugging Face, 28 descargas |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible en la informacion | VLM generalista | segun modelo base | Hugging Face |
| S2VOPD-Qwen3.5-4B (variante sin contraste) | ~5,17B | no disponible | Misma receta sin *contrast sharpening* | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion con 28 descargas y 0 likes: no hay evidencia de uso en produccion ni de validacion independiente de los resultados reportados.
- Los benchmarks se han obtenido con protocolos muy especificos (greedy a 4096 tokens para percepcion; 24576 tokens y parametros de muestreo concretos para matematicas). El propio autor advierte que las cifras matematicas no son comparables con protocolos greedy a 4096 tokens.
- El juez de las evaluaciones matematicas es Qwen2.5-72B-Instruct, un modelo de la misma familia que el base, lo que introduce un posible sesgo de evaluacion.
- Riesgo de alucinacion no cuantificado: no se publican tasas de hallucination ni evaluaciones de fidelidad en descripcion de imagenes.
- Sesgos: no se documenta analisis de sesgos demograficos, culturales o geograficos; el entrenamiento se limita a 6.241 muestras de Vision-OPD-6K, lo que puede reducir la diversidad de dominios cubiertos.
- Idiomas: no se declara lista oficial; la capacidad multilingue fuera de ingles y chino no esta verificada.
- Contexto: no se publica la longitud de contexto nativa del modelo; el entrenamiento limita el prompt a 8192 tokens, por lo que no hay garantia de comportamiento correcto mas alla de esa longitud.
- Formato: solo se distribuyen pesos safetensors en bfloat16; no hay GGUF, AWQ ni GPTQ oficiales, lo que complica el despliegue en hardware de consumo limitado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base y de los datos de entrenamiento (Vision-OPD-6K) antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2vopd/S2VOPD-Qwen3.5-4B-Contrastive
- Variante sin contraste: https://huggingface.co/s2vopd/S2VOPD-Qwen3.5-4B
- Paper: https://arxiv.org/abs/2608.14144
- Pagina del proyecto: https://williamium3000.github.io/s2vopd/
- Codigo: https://github.com/williamium3000/s2vopd
- Dataset de entrenamiento: https://huggingface.co/datasets/yuanqianhao/Vision-OPD-6K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
