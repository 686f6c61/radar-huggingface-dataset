# dotimothy/DeepSeek-R1-Distill-Qwen-1.5B-GPTQ-Safetensors

## Resumen

`dotimothy/DeepSeek-R1-Distill-Qwen-1.5B-GPTQ-Safetensors` es una cuantización de terceros en GPTQ de 4 bits del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario dotimothy. No se trata de un modelo nuevo: es un artefacto de compresión pensado para reducir el peso en disco y la VRAM necesaria para servir el destilado de 1,5B de DeepSeek, manteniendo el formato `safetensors` y el ecosistema `compressed-tensors` que consumen motores como vLLM o TGI.

El modelo base es un destilado de razonamiento de DeepSeek-R1 sobre la arquitectura Qwen2 (concretamente, la familia Qwen2.5), con aproximadamente 1.540 millones de parámetros y una ventana de contexto de 32.768 tokens. Su interés radica en que reproduce el modo de razonamiento encadenado (chain-of-thought largo antes de la respuesta final) en un tamaño que cabe en GPU de consumo e incluso en dispositivos móviles, algo que lo hace atractivo para prototipado, evaluación de pipelines de razonamiento y despliegue en el borde.

La relevancia de esta ficha concreta es doble: por un lado, documenta una de las pocas versiones GPTQ publicadas de este destilado; por otro, conviene advertir de que el repositorio tiene 0 descargas y 0 likes, no incluye tarjeta de modelo con detalles de calibración y presenta una fecha de creación atípica (2026-10-21), por lo que debe tratarse como un artefacto no validado por la comunidad. Para producción seria más prudente partir del modelo base y cuantizar internamente con un dataset de calibración propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (atención completa, GQA y RoPE) |
| Parametros totales | ~1.540 millones (1,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GPTQ int4 en safetensors vía `compressed-tensors`; el modelo base se distribuye en bf16 |
| Idiomas soportados | no disponibles en la ficha; el modelo base está orientado principalmente a inglés y chino |
| Licencia | MIT (según los tags del repositorio; el campo de licencia de la ficha aparece vacío) |
| Formato de pesos | safetensors (GPTQ int4, `compressed-tensors`) |
| Modelo base | `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` |
| Pipeline declarado | text-generation (conversacional) |
| Tamano de grupo de cuantizacion | no disponible |
| Dataset de calibracion | no disponible |
| Vocabulario | no disponible en la ficha (el base Qwen2.5 usa ~151.936 tokens) |
| Fecha de publicacion | 2026-10-21 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo base es un destilado por supervisión (SFT sobre traces generados por DeepSeek-R1) de la familia Qwen2.5, en concreto sobre la variante matemática Qwen2.5-Math-1.5B. Emplea una pila de 28 capas transformer con atención de consultas agrupadas (GQA), normalización RMSNorm y embeddings rotatorios, con un vocabulario multilingüe amplio. El entrenamiento del destilado no incluye RL a gran escala: DeepSeek aplicó destilación directa sobre datos de razonamiento generados por R1, lo que transfiere el estilo de cadena de pensamiento larga pero no las capacidades plenas del profesor de 671B.

Esta versión concreta solo añade la compresión GPTQ de 4 bits con empaquetado `compressed-tensors`. No se documenta en la ficha el número de muestras de calibración, el tamaño de grupo, si se usó `act_order` ni si se preservaron en precisión completa las capas sensibles (por ejemplo, `lm_head` o las proyecciones de atención). Tampoco hay informes de perplejidad antes/después ni evaluación de la degradación en tareas de razonamiento, un punto crítico en modelos de CoT largo donde los errores numéricos se amplifican a lo largo de la cadena.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con Qwen2.5.
- Razonamiento encadenado extenso: el modelo produce trazas de pensamiento largas antes de la respuesta final, con soporte de modo "thinking" implícito.
- Razonamiento matemático de competición: el base está destilado desde Qwen2.5-Math y rinde especialmente bien en problemas tipo AIME o MATH.
- Generación y explicación de código, incluyendo problemas algorítmicos tipo Codeforces.
- Comprensión lectora y QA sobre contexto largo, hasta 32.768 tokens en el modelo base.
- Capacidad multilingüe limitada: inglés y chino son los idiomas de referencia; el rendimiento en castellano es notablemente inferior y no está evaluado en esta cuantización.
- Soporte de tool calling / function calling: no documentado oficialmente en el modelo base (no se declara plantilla de herramientas).
- Capacidades de agente multi-paso: no soportadas de forma nativa; el CoT largo puede usarse como planificador, pero sin infraestructura de tools integrada.
- Sin visión ni audio.

## Casos de uso

- Evaluación de pipelines de razonamiento en local: sirve para probar orquestadores de CoT, parsers de `think`/respuesta y sistemas de voto mayoritario en una GPU de 8 GB, sin depender de APIs externas.
- Prototipado de tutores de matemáticas: dado su origen en Qwen2.5-Math, permite generar soluciones paso a paso y verificar la traza para detectar errores de cálculo antes de mostrar la respuesta al estudiante.
- Despliegue en el borde y dispositivos móviles: con ~1 GB de pesos int4 encaja en Android/iOS o en una Raspberry Pi con suficiente RAM, útil para asistentes offline sin conectividad.
- Generación de tests unitarios y explicación de código en CI: se puede invocar desde un runner con vLLM para revisar diffs y proponer casos de prueba, aceptando latencia de segundos por petición.
- Filtrado y anotación de datos sintéticos: al ser barato de ejecutar, sirve para generar razonamientos de referencia a escala y luego filtrar por consistencia de la respuesta final.
- Chatbot de soporte técnico especializado con contexto largo: 32k tokens permiten incorporar manuales o histórico de tickets completos en el prompt, aunque la calidad en castellano exige validación previa.
- Investigación sobre cuantización: es un caso de estudio útil para medir cuánto degrada GPTQ int4 las capacidades de CoT frente al base bf16, comparando trazas y exactitud final.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base `DeepSeek-R1-Distill-Qwen-1.5B` en bf16, según la tabla publicada en el informe técnico de DeepSeek-R1. No hay mediciones publicadas para esta cuantización GPTQ concreta, por lo que la degradación introducida por el int4 es desconocida.

| Benchmark | DeepSeek-R1-Distill-Qwen-1.5B (bf16, dato del informe R1) |
|---|---|
| AIME 2024 (pass@1) | 28,9 |
| MATH-500 (pass@1) | 83,9 |
| GPQA Diamond (pass@1) | 33,8 |
| LiveCodeBench (pass@1) | 16,9 |
| Codeforces (rating Elo) | 954 |

No se han publicado resultados de benchmarks en la información disponible para el artefacto cuantizado de dotimothy.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,0-1,2 GB solo para pesos int4; con caché KV para 32k tokens y overhead del runtime, entre 3 y 6 GB según lote y longitud de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, L4, A10). En A100/H100 el modelo está limitado por memoria y latencia, no por cómputo, por lo que conviene agrupar peticiones en lote.
- Cabe holgadamente en GPU de consumo: sí, en RTX 3050 8 GB, RTX 4060, RTX 3060 12 GB e incluso en iGPU con memoria unificada si se usa un runtime adecuado.
- Opciones de despliegue: vLLM y SGLang (soportan GPTQ y `compressed-tensors`), TGI (soporte GPTQ), y para CPU/edge es necesario convertir a GGUF y usar llama.cpp u Ollama, ya que estos no cargan GPTQ directamente.
- Latencia y throughput: no hay mediciones publicadas para este repositorio. De forma orientativa, un modelo denso de 1,5B en int4 sobre una RTX 4090 suele moverse en el orden de cientos de tokens por segundo con lote 1, pero el CoT largo multiplica el número de tokens generados por respuesta y domina la latencia percibida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (GPTQ int4, este repo) | 1,5B | 32k | Razonamiento destilado | MIT (según tags) | HuggingFace, 0 descargas, sin validar |
| DeepSeek-R1-Distill-Qwen-1.5B (base, bf16) | 1,5B | 32k | Razonamiento destilado | MIT | HuggingFace oficial, con tarjeta completa |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Instrucciones generales | Apache 2.0 | HuggingFace, ampliamente adoptado |
| DeepSeek-R1-Distill-Qwen-7B | 7B | 32k | Razonamiento destilado | MIT | HuggingFace oficial |
| Llama-3.2-1B-Instruct | 1,2B | 128k | Instrucciones generales | Llama 3.2 Community License | HuggingFace, gated |

Frente a Qwen2.5-1.5B-Instruct, este destilado gana en matemáticas y razonamiento de competición a costa de respuestas mucho más largas y peor comportamiento en conversación general. Frente al destilado de 7B, es entre 4 y 5 veces más pequeño y notablemente menos preciso, pero viable en hardware mucho más modesto.

## Limitaciones y advertencias

- Artefacto no validado: 0 descargas, 0 likes, sin tarjeta de modelo y con fecha de creación anómala (2026). No hay evidencia de que la cuantización haya sido evaluada.
- Degradación por cuantización desconocida: en modelos de CoT largo, el int4 puede romper cadenas de razonamiento que el bf16 resolvía; conviene medir AIME/MATH-500 antes de usarlo en producción.
- Riesgo de alucinación: al ser un destilado pequeño, inventa pasos intermedios y puede llegar a conclusiones incorrectas con una traza aparentemente coherente.
- Sesgo idiomático: el base está optimizado para inglés y chino; en castellano la calidad cae y no hay evaluación disponible.
- Sin soporte documentado de tool calling ni de agentes: no se debe asumir compatibilidad con plantillas de funciones sin verificación empírica.
- Contexto efectivo menor que el nominal: aunque herede 32k tokens, el rendimiento en recuperación decae con longitudes altas, especialmente tras cuantizar.
- Licencia: los tags indican MIT, lo que permitiría uso comercial, pero el campo de licencia de la ficha está vacío; verifique la licencia del modelo base antes de redistribuir.
- Formato restrictivo: GPTQ no se carga en llama.cpp/Ollama sin conversión previa a GGUF.
- Coste de inferencia oculto: el CoT largo genera cientos o miles de tokens por respuesta, lo que encarece el servicio aunque el modelo sea pequeño.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/dotimothy/DeepSeek-R1-Distill-Qwen-1.5B-GPTQ-Safetensors
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Destilado de 7B (referencia de la familia): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Réplica no oficial en GitHub: https://github.com/yaocw2020/DeepSeek-R1-Distill-Qwen-1.5B
- ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Variante LiteRT para Android/iOS/web: https://dev.co/ai/llms/litert-community-deepseek-r1-distill-qwen-1-5b
- Informe técnico de DeepSeek-R1 (arXiv 2501.12948): https://arxiv.org/abs/2501.12948
