# credible-ai/olmo2-1B-288domains-dirichlet-linearscaled-hellaswag

## Resumen

`olmo2-1B-288domains-dirichlet-linearscaled-hellaswag` es un modelo de lenguaje de 1.414.678.528 parámetros (aproximadamente 1,41B) desarrollado por credible-ai, un grupo de investigación centrado en la mezcla de datos (data mixing) para el preentrenamiento. Se trata de un artefacto de investigación: un modelo base preentrenado desde cero sobre 32.000 millones de tokens del corpus WebOrganizer, con pesos de mezcla optimizados mediante LinMix para maximizar el rendimiento en HellaSwag. No es un modelo de propósito general ni ha pasado por ajuste por instrucciones.

El interés del modelo es metodológico, no de producto. LinMix propone ajustar un surrogate lineal sobre un enjambre de mezclas Dirichlet evaluadas con modelos proxy pequeños (en este caso `olmo2-60M-288domains-dirichlet`) y usar esos coeficientes para construir la mezcla de datos final del modelo grande. Esta ficha reproduce un punto concreto del espacio de ablaciones: surrogate lineal, coeficientes divididos por su error estándar (β/SE) y utilidad lineal con r = 0, evaluado sobre HellaSwag.

Arquitectónicamente es un transformer decoder-only de la familia OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y dimensión oculta 2048, tokenizador GPT-NeoX-20B de 50.432 entradas y pesos en bfloat16 bajo licencia MIT. Su relevancia ahora es servir como pieza reproducible para estudiar cómo las decisiones de mezcla de dominios afectan al rendimiento en una tarea concreta, con código, datos tokenizados y la mezcla exacta (`mix.json`) publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only OLMo 2 (`Olmo2ForCausalLM`), 18 capas, hidden size 2048 |
| Parámetros totales | 1.414.678.528 (≈1,41B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no la especifica) |
| Tipos de cuantización | Solo pesos bfloat16 publicados; no se distribuyen GGUF ni cuantizaciones oficiales (convertibles por el usuario) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, bfloat16 (repo de 2,8 GB); incluye `mix.json` con la mezcla de datos |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 en configuración pequeña: transformer decoder-only denso con 18 capas, dimensión oculta 2048 y 1,41B de parámetros, serializado como `Olmo2ForCausalLM` en Transformers. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens, lo que sitúa al modelo en la estela de la familia OLMo y facilita comparaciones directas con otros miembros del mismo enjambre experimental.

El preentrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens del corpus WebOrganizer, derivado del pool DCLM 1b-1x. La particularidad está en la composición: los datos se organizan en 288 dominios que combinan tema y formato, y la proporción de cada dominio se fija mediante LinMix. Para esta variante concreta, el surrogate es un ajuste lineal sobre el enjambre Dirichlet del proxy de 60M, con los coeficientes divididos por su error estándar (β/SE) y una utilidad lineal (π con r = 0), optimizando HellaSwag como métrica objetivo. La relación tokens/parámetro es de aproximadamente 22,6, en línea con el régimen Chinchilla. No se documentan fases de RLHF, DPO ni ajuste por instrucciones: es un modelo estrictamente base.

## Capacidades

- Generación de texto autoregresiva en inglés, sin ajuste por instrucciones ni formato conversacional.
- Modelo base: continúa texto, completa fragmentos y sirve como punto de partida para fine-tuning supervisado.
- Razonamiento y sentido común a pequeña escala, evaluable en tareas tipo HellaSwag, para la que fue explícitamente optimizado.
- Capacidad limitada de código y matemáticas, no medida ni reportada en la información disponible.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes, multi-step reasoning ni modos de pensamiento (thinking).
- Sin capacidades de visión ni audio.
- Multilingüismo prácticamente nulo: solo inglés declarado.
- Reutilizable como proxy o baseline en experimentos de mezcla de datos gracias a la publicación de `mix.json` y de los datos tokenizados.

## Casos de uso

- Reproducción de experimentos de LinMix: el modelo materializa una celda concreta de la ablación (surrogate lineal, β/SE, r = 0, objetivo HellaSwag) y permite verificar los resultados del paper con los mismos datos y la misma mezcla.
- Estudio de mezcla de dominios: al disponer de `mix.json` y del corpus tokenizado, se puede correlacionar la proporción asignada a cada uno de los 288 dominios con el rendimiento final y analizar la sensibilidad del optimizador.
- Baseline en evaluación de data mixing: sirve como referencia entrenada con 32B tokens frente a la que comparar otras estrategias de mezcla (por ejemplo, mezclas uniformes o ajustadas por proxy de mayor tamaño).
- Investigación sobre scaling de proxies: junto al proxy de 60M del mismo enjambre, permite medir cuánto se degrada la mezcla óptima al pasar de un modelo pequeño a uno de 1,41B.
- Punto de partida para fine-tuning: al ser un base de 1,41B con licencia MIT y pesos bf16, es viable ajustarlo con SFT/LoRA para tareas concretas en inglés y comparar si la mezcla optimizada para HellaSwag transfiere a la tarea objetivo.
- Experimentos de eficiencia en hardware modesto: sus 2,8 GB en bf16 permiten ejecutar estudios de inferencia y de dinámica de entrenamiento en una sola GPU consumer.
- Docencia y divulgación: ejemplo completo y abierto de pipeline de preentrenamiento (corpus, tokenización, mezcla, entrenamiento con OLMo-core) que se puede recorrer de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la mezcla se optimizó para HellaSwag, pero no incluye cifras de accuracy ni comparaciones numéricas con otros modelos. Tampoco se reportan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos; con caché KV y activaciones, un entorno realista se sitúa en torno a 3,5-4 GB para contextos cortos.
- VRAM en fp32: unos 5,7 GB; en int8, unos 1,4 GB; en int4, aproximadamente 0,7 GB (requiere cuantización propia, no hay artefactos publicados).
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090) para bf16; A100/H100 solo tienen sentido en escenarios de mucho paralelismo o entrenamiento.
- Cabe holgadamente en GPU consumer, incluidas soluciones de 8 GB; también es viable en CPU con llama.cpp tras convertir los pesos.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), vLLM o TGI para serving; llama.cpp y Ollama requieren conversión a GGUF, que no se distribuye en el repo.
- Latencia y throughput estimados: no disponibles; no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (olmo2-1B-288domains-dirichlet-linearscaled-hellaswag) | 1,41B | No disponible | No reportado (optimizado para HellaSwag) | MIT | Pesos safetensors en HF, 0 descargas |
| OLMo 2 1B (base oficial de AllenAI) | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | Pesos públicos en HF |
| credible-ai/olmo2-60M-288domains-dirichlet (proxy del enjambre) | ≈60M (según su nombre) | No disponible | No disponible | No disponible en la información proporcionada | Pesos públicos en HF |
| Modelos base de ~1B de otras familias (p. ej. Llama 3.2 1B, Qwen2.5 1.5B) | No verificado en esta búsqueda | No verificado | No verificado | No verificado | Pesos públicos |

La comparación cuantitativa no es posible con los datos disponibles: el modelo es un artefacto de ablación y no se han publicado métricas propias ni de las alternativas en la información proporcionada. Cualquier comparación de rendimiento requeriría ejecutar la misma batería de evaluación sobre cada checkpoint.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general; la propia model card lo declara explícitamente.
- No ha recibido ajuste por instrucciones ni alineamiento (sin RLHF/DPO): no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional.
- Entrenado solo con 32B tokens y 1,41B de parámetros: alta propensión a alucinaciones y conocimiento factual limitado incluso frente a modelos base de mayor escala.
- Solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será pobre.
- La mezcla de datos está optimizada para HellaSwag, lo que puede implicar un sesgo de composición hacia los dominios que favorecen esa tarea y un rendimiento peor en otras.
- Riesgo de sesgos heredados de Common Crawl y del pool DCLM: toxicidad, estereotipos y sobrerrepresentación de contenido en inglés y de determinadas fuentes web.
- Licencia MIT para los pesos, pero los datos de entrenamiento provienen de DCLM 1b-1x (CC-BY-4.0) y están sujetos a los términos de uso de Common Crawl; conviene revisar las obligaciones de atribución antes de un uso comercial.
- Longitud de contexto no documentada: no se debe asumir una ventana concreta sin verificarla empíricamente.
- Sin cuantizaciones oficiales ni artefactos GGUF; el despliegue en llama.cpp/Ollama exige conversión y validación propias.
- Sin benchmarks publicados: no hay evidencia numérica de calidad más allá de la métrica usada para optimizar la mezcla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-linearscaled-hellaswag
- Modelo proxy del enjambre (60M): https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Código de LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo ni sobre LinMix; los resultados obtenidos correspondían a entidades sin relación. No se han incluido.
