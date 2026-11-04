# s2vopd/S2VOPD-Qwen3.5-4B

## Resumen

S²VOPD-Qwen3.5-4B es un modelo vision-language (image-text-to-text) desarrollado por el equipo de s2vopd, resultado de aplicar *self-supervised visual on-policy distillation* sobre el modelo base Qwen/Qwen3.5-4B. La propuesta central es entrenar percepción visual de grano fino sin reward model, sin anotación humana y sin un teacher de mayor tamaño: el propio modelo, en una versión EMA, actúa como profesor de sí mismo sobre la imagen limpia mientras el estudiante genera sobre una vista degradada de la misma imagen.

El modelo resuelve el problema del entendimiento visual detallado (regiones pequeñas de la imagen, alta resolución, texto fino) mediante una señal de destilación que solo es grande en los tokens que dependen de detalle visual. Con 5.174.964.736 parámetros en safetensors y licencia Apache 2.0, es relevante porque demuestra que la auto-destilación on-policy puede mejorar percepción fina y razonamiento matemático-visual sin coste de anotación ni de inferencia con un modelo mayor.

El checkpoint se publica como acompañamiento oficial del paper *Self-Supervised Visual On-Policy Distillation* (arXiv:2608.14144) y está pensado para investigación en percepción visual de grano fino, más que como modelo generalista de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) derivado de Qwen3.5-4B; detalles internos de la arquitectura no disponibles |
| Parametros totales | 5.174.964.736 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; en entrenamiento prompt <= 8192 y respuesta <= 1024 tokens |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 20.7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal con torre de visión y pipeline image-text-to-text. El autor no detalla en la model card la arquitectura interna (número de capas, dimensión, configuración del vision encoder), por lo que esos datos deben consultarse en el modelo base. El entrenamiento es un fine-tuning corto: 65 pasos, batch de 96 prompts con n=8 rollouts, learning rate 2e-6 con 10 pasos de warmup.

La innovación es el método de destilación. El estudiante genera sobre una versión degradada de la imagen y un teacher EMA (tasa de actualización 0.05) puntúa el mismo prefijo sobre la imagen original limpia. La discrepancia entre ambas distribuciones es la única señal de entrenamiento, con pérdida de JSD generalizada (alpha=0.5, top-k=100 renormalizado dentro del top-k del teacher, is_clip=2.0). No hay reward model, ni anotación humana, ni teacher de mayor tamaño. La degradación se aplica una sola vez por imagen: 30% resolución no uniforme (imagen al 50-70% con fondo a 20-35% de resolución y una región del 15-35% nítida), 30% zoom-out (escala 40-80% con padding negro), 30% downscale a 30-60% con jitter fotométrico (brillo, contraste y saturación con probabilidad 0.5 cada uno) y 10% sin degradar. El autor justifica aplicar una sola degradación: apilarlas destruye la imagen y anula la información del gap teacher-student.

Los datos de entrenamiento son Vision-OPD-6K, con 6.241 muestras.

## Capacidades

- Comprensión visual de grano fino: detección de detalles pequeños, regiones de alta resolución y elementos sutiles en la imagen (objetivo explícito del entrenamiento).
- Respuesta a preguntas sobre imágenes (VQA) en formato image-text-to-text conversacional.
- Razonamiento matemático sobre imágenes: resolución de problemas matemáticos con soporte visual (MathVista, MathVerse, MathVision, WeMath).
- Procesamiento de imágenes de alta resolución (evaluado en HR-Bench 4K y 8K).
- Comprensión de escenas del mundo real, incluyendo variante en chino (MME-RealWorld y MME-RealWorld-CN).
- Generación de texto conversacional multi-turno heredada del modelo base.
- Capacidades de tool calling, agentes, thinking mode o audio: no disponibles en la información proporcionada.

## Casos de uso

- Inspección visual de documentos y capturas de alta resolución: el modelo está entrenado para retener detalle en regiones pequeñas de imágenes 4K/8K, lo que lo hace adecuado para extraer información de capturas de pantalla, tablas densas o planos.
- Verificación de calidad visual en líneas de producción: comparar una imagen degradada (baja resolución, zoom-out) con la original y detectar discrepancias en detalles finos, aprovechando la señal de percepción fina para la que fue entrenado.
- Asistencia en problemas matemáticos con figuras: resolución de ejercicios de geometría o gráficas donde el modelo debe leer datos de la imagen y razonar paso a paso, con presupuesto de generación largo (hasta 24.576 tokens en la evaluación).
- Análisis de imágenes médicas o técnicas de alta resolución en investigación: el enfoque en detalle fino permite experimentar en dominios donde las regiones pequeñas son críticas, siempre con validación humana.
- Moderación y análisis de contenido visual a escala: clasificación y descripción de imágenes con contexto conversacional, desplegable con transformers y FlashAttention 2 en una sola GPU.
- Investigación en destilación y percepción visual: servir de checkpoint de referencia para reproducir o extender el método S²VOPD, comparando el estudiante con el teacher EMA y con el modelo base.
- Prototipado de asistentes multimodales en local: al ser un modelo de ~5,2B parámetros con licencia Apache 2.0, puede ejecutarse en hardware de una sola GPU para demos y pruebas de concepto.

## Benchmarks y rendimiento

Percepción de grano fino (decodificación greedy, 4096 tokens, seed 42):

| Benchmark | Score |
|---|---|
| V* Bench | 88.48 |
| ZoomBench | 56.57 |
| HR-Bench 4K | 84.75 |
| HR-Bench 8K | 84.62 |
| MME-RealWorld | 75.06 |
| MME-RealWorld-CN | 72.18 |
| Media | 76.94 |

Razonamiento matemático (24576 tokens, T=0.3, top-p 0.95, top-k 20, presence penalty 1.5, seed 42; juez Qwen2.5-72B-Instruct):

| Benchmark | Score |
|---|---|
| MathVista | 80.80 |
| MathVerse | 73.83 |
| MathVision | 64.67 |
| WeMath | 85.98 |
| Media | 76.32 |

El autor advierte que el presupuesto largo de generación es necesario para la suite matemática: con 16k tokens, entre el 8% y el 11% de las generaciones siguen alcanzando el límite, por lo que los resultados con protocolo greedy/4096 no son comparables. No se proporcionan resultados del modelo base Qwen3.5-4B en la información disponible para medir la ganancia exacta.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10,3 GB solo para pesos (5,17B parámetros x 2 bytes), más overhead de activaciones y del vision encoder; en la práctica se recomienda 16-24 GB para contextos moderados.
- El repo ocupa 20,7 GB, lo que sugiere pesos en bfloat16 (sin cuantizar) y posibles ficheros adicionales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 con FlashAttention 2. En GPUs de 12-16 GB sería necesario cuantizar, aunque no se publican cuantizaciones oficiales.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 4080/3090 (16-24 GB) con cuantización, no disponible en el repo.
- Despliegue: transformers con `AutoModelForImageTextToText` y `attn_implementation="flash_attention_2"` según la model card; vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| S²VOPD-Qwen3.5-4B | 5,17B | no disponible (entrenamiento 8192) | VLM con auto-destilación para percepción fina | Apache 2.0 |
| Qwen/Qwen3.5-4B (base) | ~4B nominales | no disponible | VLM generalista | Apache 2.0 (según modelo base) |
| Alternativas de ~4-8B VLM | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de otras alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa fiable. La comparación natural es contra Qwen/Qwen3.5-4B, del que este modelo es un fine-tuning.

## Limitaciones y advertencias

- Modelo de investigación: 30 descargas y 0 likes en HuggingFace en la fecha de actualización; no hay evidencia de uso en producción ni de validación externa.
- Entrenamiento muy corto (65 pasos sobre 6.241 muestras): el riesgo de sobreajuste al dataset Vision-OPD-6K y de degradación de capacidades generales del modelo base no está evaluado en la model card.
- No se publican evaluaciones de sesgo, toxicidad ni robustez; los sesgos heredados de Qwen3.5-4B y de los datos de entrenamiento no están documentados.
- Riesgo de alucinación inherente a los VLM, especialmente en descripciones de detalles finos no verificables; el método está diseñado para reducir errores de percepción, pero no los elimina.
- Idiomas soportados no declarados; solo hay evidencia de evaluación en inglés (y una variante en chino, MME-RealWorld-CN), sin garantías para otras lenguas.
- Los resultados matemáticos dependen de un protocolo de generación muy específico (24.576 tokens, temperatura 0.3, juez Qwen2.5-72B-Instruct); no son comparables con evaluaciones greedy estándar.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tuning conviene verificar las condiciones del modelo base Qwen3.5-4B y de los datos Vision-OPD-6K.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) publicadas, lo que limita el despliegue en hardware de consumo.
- El modelo requiere FlashAttention 2 según la model card; sin ella el rendimiento y el uso de memoria pueden degradarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s2vopd/S2VOPD-Qwen3.5-4B
- Paper: https://arxiv.org/abs/2608.14144
- Página del proyecto: https://williamium3000.github.io/s2vopd/
- Código: https://github.com/williamium3000/s2vopd
- Dataset de entrenamiento: https://huggingface.co/datasets/yuanqianhao/Vision-OPD-6K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
