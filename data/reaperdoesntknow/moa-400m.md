# reaperdoesntknow/MoA-400M

## Resumen

MoA-400M (publicado también como MoA-Metric-LM-400M Convergent) es un modelo de lenguaje causal de aproximadamente 400 millones de parámetros desarrollado por el usuario reaperdoesntknow. Su particularidad es que sustituye la atención por producto escalar estándar por una atención "métrica" basada en distancias (L2, coseno y Mahalanobis diagonal), combinada con un bloque Mixture-of-Architectures (MoA) que enruta cada token entre cuatro cabezas especializadas. Incorpora además BlackHoleRoPE, una variante aprendible de RoPE pensada para mejorar la estabilidad numérica y la extrapolación de longitud.

El modelo está diseñado explícitamente para entrenar y ejecutar en hardware modesto, con orientación CPU-first (FP32 sobre AVX2/AVX-512), y es compatible con la librería Transformers. Se posiciona como una pieza de investigación sobre sesgos inductivos geométricos y atención basada en distancias, más que como un modelo de producción generalista. El contexto de entrenamiento se sitúa en 512-1024 tokens, con configuración que permite hasta 2048.

Es relevante ahora por su enfoque poco habitual (atención métrica con regularizador de desigualdad triangular) y por su bajo coste de ejecución, aunque su presupuesto de entrenamiento es muy reducido (cientos de miles de tokens) y no se han publicado resultados de benchmarks. La licencia indicada en la model card es Apache-2.0, aunque el campo de licencia de la ficha de Hugging Face figura como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención métrica (L2 / coseno / Mahalanobis diagonal), bloque MoA con router por token y BlackHoleRoPE |
| Parametros totales | ~400 M (el recuento exacto depende del vocabulario; ver config.json) |
| Parametros activos | No es MoE denso clásico; el router mezcla cuatro cabezas por token (LocalConv, MetricMHAttention, ChannelMix, MetricMQA) |
| Longitud de contexto | Entrenado principalmente a 512-1024 tokens; la configuración permite hasta 2048 |
| Tipos de cuantizacion | No se documentan cuantizaciones específicas; inferencia soportada en FP32, BF16 y FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 según la model card; el campo de licencia del repo figura como no disponible |
| Formato de pesos | Pesos compatibles con Transformers (safetensors/PyTorch); tamaño del repo 3,4 GB |

## Arquitectura y entrenamiento

El modelo es un LM causal con 12-24 capas (según variante), hidden size de al menos 1024 y atención nativa métrica. Cada cabeza puntúa mediante L2 (-||q-k||²/sqrt(d)), coseno normalizado o Mahalanobis diagonal por cabeza, con logits escalados por un α aprendible y una máscara opcional de poda por radio. La ruta de valores usa proyectores Up/Down con gating. Se añade MetricMQA (multi-query con K/V compartidos) para throughput y memoria, y un bloque MoA donde un TokenRouter asigna pesos por token a cuatro cabezas: LocalConv (convolución depthwise local), MetricMHAttention, ChannelMix (MLP) y MetricMQA. HyperFFN combina SwiGLU, SepConv1d y una ruta de bajo rango, también mezclada por router.

BlackHoleRoPE aplica rotación unitaria solo a Q/K (preserva normas) y una amplificación de energía acotada en V (energy_min..energy_max) con modulación opcional por discrepancia; sus parámetros se sintetizan desde una base de Fourier pequeña, lo que reduce el tamaño de caché y busca generalización de longitud. Un regularizador de desigualdad triangular penaliza violaciones métricas sobre tripletas aleatorias. El entrenamiento se realizó en CPU en FP32 con AdamW/Adam, batch 2-4 y secuencias de 512-1024, sobre los datasets Agentic-Long-Context-Understanding-QA y MATH-500 (aproximadamente 256.000 tokens cada uno según la model card). El presupuesto total es de cientos de miles de tokens; no se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal conversacional y de formato pregunta-respuesta.
- Razonamiento matemático de estilo paso a paso (entrenado con MATH-500).
- Lectura y QA sobre contexto largo dentro de los límites de entrenamiento (512-1024 tokens).
- Seguimiento de contexto y recuperación de información en ventanas moderadas.
- Inferencia en CPU en FP32 sobre AVX2/AVX-512, además de FP16/BF16 en GPU.
- Compatibilidad con `AutoModelForCausalLM`, `pipeline` y `generate` de Transformers.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistentes compactos en local: el modelo cabe en CPU y en GPUs de consumo, por lo que puede desplegarse como asistente de texto en entornos sin acelerador dedicado, aceptando contextos de hasta 1024 tokens.
- Investigación sobre atención métrica: sirve como banco de pruebas para comparar atención por distancias (L2, coseno, Mahalanobis) frente a producto escalar en tareas controladas y con presupuestos pequeños.
- Experimentos de enrutado MoA: permite estudiar el comportamiento del TokenRouter y de las puertas por cabeza en modelos pequeños antes de escalar el diseño.
- Pruebas de extrapolación posicional: BlackHoleRoPE puede evaluarse en tareas de longitud superior a la de entrenamiento (hasta 2048 según configuración) para medir degradación de calidad.
- Razonamiento matemático elemental: con prompts de estilo "Reasoning:" puede generar cadenas de pasos para problemas aritméticos y algebraicos sencillos, útil en demos educativas.
- QA sobre documentos cortos: para lectura de fragmentos de hasta ~1000 tokens en pipelines de extracción de respuestas, siempre con validación humana.
- Prototipado de pipelines Transformers: al ser compatible con `pipeline("text-generation")`, sirve para validar integraciones y flujos de inferencia antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~400 M de parámetros, en FP32 ocupa aproximadamente 1,6 GB de pesos; en FP16/BF16, unos 0,8 GB. Añadiendo caché KV y overhead, el consumo real es de unos 2-3 GB en FP32 para contextos de 1024-2048 tokens.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior funciona con holgura.
- Consumer GPU: sí, cabe en GPUs de consumo e incluso en CPU. El autor indica que está implementado para funcionar bien en FP32 sobre AVX2/AVX-512.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`, `pipeline`), con `accelerate` para `device_map`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al no haber pesos GGUF publicados, llama.cpp/Ollama no están disponibles de forma directa.
- Latencia y throughput: no disponibles. El autor solo reporta descenso saludable de la pérdida en ejecuciones CPU a 512 y 1024 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoA-400M | ~400 M | 512-1024 entrenamiento; hasta 2048 en config | Atención métrica + MoA + BlackHoleRoPE | Apache-2.0 (model card) | Hugging Face, Transformers |
| Qwen2.5-0.5B | ~500 M | 32.768 tokens | Transformer denso estándar con RoPE | Apache-2.0 | Hugging Face, amplio ecosistema |
| SmolLM2-360M | ~360 M | 8.192 tokens | Transformer denso estándar | Apache-2.0 | Hugging Face, GGUF y Ollama |
| TinyLlama-1.1B | ~1.100 M | 2.048 tokens | Transformer denso estándar | Apache-2.0 | Hugging Face, GGUF y Ollama |

La comparación con Qwen2.5-0.5B, SmolLM2-360M y TinyLlama-1.1B es orientativa por tamaño, no por rendimiento: no hay benchmarks publicados de MoA-400M que permitan una comparación cuantitativa. Los tres alternativos cuentan con contextos mayores, cuantizaciones GGUF y amplia adopción en producción, mientras que MoA-400M es un modelo de investigación con presupuesto de entrenamiento muy limitado.

## Limitaciones y advertencias

- Presupuesto de entrenamiento muy reducido (cientos de miles de tokens), lo que limita conocimiento factual y calidad general frente a modelos de tamaño similar entrenados con billones de tokens.
- Riesgo elevado de alucinación en QA factual: el propio autor desaconseja su uso para QA factual a escala web.
- Contexto efectivo limitado a 512-1024 tokens; aunque la configuración permite 2048, la calidad más allá de la longitud de entrenamiento no está garantizada.
- Idiomas soportados no documentados; no hay evidencia de capacidades multilingües.
- No apto para usos críticos de seguridad ni dominios que requieran precisión garantizada, según la model card.
- La licencia aparece como Apache-2.0 en la model card pero como no disponible en los metadatos del repo; conviene verificar antes de uso comercial.
- Sin soporte documentado de tool calling, agentes ni cuantizaciones GGUF, lo que limita su integración en stacks de producción habituales.
- El autor advierte de posibles NaN/Inf en muestreo si las máscaras no son aditivas (0/-inf) o si no se fija `pad_token_id` en `generate()`.
- Sesgos conocidos: no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/MoA-400M
- Dataset HuggingFaceH4/MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset akoksal/LongForm: https://huggingface.co/datasets/akoksal/LongForm
- Dataset yzhuang/Agentic-Long-Context-Understanding-QA (citado en la model card): https://huggingface.co/datasets/yzhuang/Agentic-Long-Context-Understanding-QA
