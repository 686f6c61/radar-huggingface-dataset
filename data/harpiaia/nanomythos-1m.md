# HarpiaIA/NanoMythos-1M

## Resumen

NanoMythos-1M es un modelo de generación de texto de escala minima publicado por HarpiaIA (organización Harpia) en Hugging Face. Con 1.443.968 parámetros totales según los pesos en safetensors, se sitúa dos órdenes de magnitud por debajo de los modelos pequeños habituales (por ejemplo, la familia SmolLM de 135 M). Está etiquetado con la arquitectura `llama` y la librería `transformers`, y se distribuye bajo licencia Apache 2.0.

El modelo se presenta explícitamente como un artefacto de investigación centrado en modelos de IA pequeños ("com foco em pesquisa em modelos de IA pequenos", en la model card original en portugués). No resuelve una tarea de producción: sirve como banco de pruebas para estudiar dinámicas de entrenamiento, tokenizadores, pipelines de evaluación y comportamiento de arquitecturas tipo transformer a escala trivial. El único idioma declarado es el inglés y el único conjunto de datos citado es HuggingFaceFW/fineweb-edu.

Es relevante ahora por su relación nominal con la línea de experimentos "NanoMythos" publicada por AgnesAI-Labs, que explora profundidad recurrente (recurrent-depth) inspirada en OpenMythos sobre familias estilo DeepSeek-V4 y evalúa el efecto de un paso recurrente (T=1) en la perplejidad sobre FineWeb-Edu. La model card de HarpiaIA no confirma esa vinculación técnica, por lo que debe tratarse como coincidencia de nomenclatura y etiquetas, no como hecho verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (etiqueta `llama` en el repositorio); detalles internos (capas, dimensión, cabezas) no disponibles |
| Parametros totales | 1.443.968 (dato real leído de los safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (no hay GGUF en el repositorio) |
| Idiomas soportados | inglés (`en`), único idioma declarado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |
| Pipeline | text-generation |
| Compatibilidad de despliegue | transformers, text-generation-inference, endpoints compatibles |

## Arquitectura y entrenamiento

La información pública se limita a la etiqueta de arquitectura `llama`, lo que sitúa al modelo en la familia de transformers decoder-only con normalización RMSNorm y atención causal habitual en esa estirpe, aunque no se publican ni el número de capas, ni la dimensión oculta, ni el número de cabezas de atención, ni la función de activación, ni la estrategia de tokenización. Con 1,44 M de parámetros, el modelo es varios órdenes de magnitud menor que cualquier Llama de Meta; la etiqueta debe interpretarse como "familia de arquitectura", no como derivado de un modelo concreto.

El único dato de entrenamiento confirmado es el uso del corpus FineWeb-Edu (subconjunto educativo filtrado de FineWeb, en inglés) como conjunto de datos. No se especifican el número de tokens vistos, la composición exacta, la mezcla de fases (preentrenamiento, ajuste supervisado, RLHF/DPO) ni hiperparámetros. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, profundidad recurrente) en la model card; la posible conexión con el experimento de profundidad recurrente de AgnesAI-Labs no está confirmada por el autor. El repositorio muestra un tamaño de 0,0 GB, coherente con un modelo de este tamaño, pero también compatible con una subida incompleta: conviene verificar los ficheros antes de integrarlo.

## Capacidades

- Generación de texto autoregresiva en inglés, a nivel de juguete o demostración; la capacidad lingüística real de un modelo de 1,44 M de parámetros es muy limitada.
- Modelado de lenguaje y cálculo de perplejidad sobre textos en inglés, útil como referencia en experimentos.
- Integración con la API de `transformers` (`AutoModelForCausalLM` / `AutoTokenizer`) y con `text-generation-inference`.
- Compatibilidad declarada con endpoints de inferencia alojados (endpoints_compatible).
- No hay evidencia publicada de soporte de tool calling, function calling, razonamiento multi-paso, agentes, matemáticas, código, visión o audio.
- No hay modo "thinking", ni ventana de razonamiento explícita, ni capacidades multimodales documentadas.
- Multilingüismo: no. Solo inglés declarado; el entrenamiento con FineWeb-Edu refuerza el sesgo hacia inglés.

## Casos de uso

- Docencia y formación en IA: usar el modelo como ejemplo mínimo ejecutable de un transformer causal completo, para explicar tokenización, embeddings, atención y decodificación sin necesidad de GPU.
- Validación de pipelines de despliegue: probar integraciones con `transformers`, TGI o un endpoint HTTP propio con un modelo que arranca en milisegundos y no requiere VRAM dedicada, antes de pasar a modelos de producción.
- Pruebas de regresión de infraestructura de entrenamiento e inferencia: verificar los contratos de datos (formatos safetensors, configuración, tokenizador) en CI con un artefacto de tamaño despreciable.
- Reproducción de experimentos de escalado: servir como punto de partida o baseline de perplejidad en estudios sobre leyes de escalado y técnicas de profundidad recurrente sobre FineWeb-Edu.
- Investigación sobre filtrado de datos: analizar cómo un corpus filtrado por criterio educativo (FineWeb-Edu) afecta a un modelo de capacidad mínima, como control experimental.
- Demostraciones educativas de generate/prompt en charlas o talleres: el modelo cabe en memoria de un portátil o una Raspberry Pi y permite mostrar el bucle de generación en vivo sin infraestructura.
- No se recomienda para atención al cliente, generación de código en producción, agentes, análisis documental ni ninguna tarea que requiera calidad lingüística o razonamiento: su escala no lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra métrica, y no se ha localizado ninguna evaluación independiente del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en cualquier precisión. Los pesos ocupan aproximadamente 2,9 MB en fp16 (1.443.968 × 2 bytes) y 5,8 MB en fp32; el pico real lo determinan las activaciones y la caché KV, no los pesos.
- GPU recomendadas: ninguna en particular. Cualquier GPU con más de 1 GB de memoria es sobrada; incluso iGPU integradas son suficientes.
- Cabe en GPU de consumo: sí, en cualquier modelo (RTX 3060, RTX 4090, GTX 1650, etc.). También funciona en CPU, incluidos dispositivos de baja potencia tipo Raspberry Pi.
- Opciones de despliegue: `transformers` (vía el script `inference.py` mencionado en la model card), text-generation-inference y endpoints compatibles. Para llama.cpp/Ollama sería necesario convertir los pesos a GGUF, algo que el repositorio no ofrece actualmente.
- Latencia y throughput: no disponibles de forma publicada. Por el tamaño, la latencia estará dominada por el overhead de framework y no por el cómputo del modelo.

## Comparativa con modelos similares

No existe una categoría consolidada de modelos de ~1,4 M de parámetros con evaluación pública; las alternativas más cercanas se comparan a continuación con los datos disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| NanoMythos-1M (HarpiaIA) | 1.443.968 | no disponible | Apache 2.0 | safetensors | no disponible |
| TinyStories-1M | ~1 M (aproximado, no verificado en esta ficha) | no disponible en esta ficha | MIT (según su repositorio original) | PyTorch/safetensors | orientado a narrativa simple en inglés |
| GPT-2 small | 124 M | 1.024 tokens | MIT | PyTorch/safetensors | benchmarks públicos en su model card original |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | benchmarks publicados por Hugging Face |

La comparación de rendimiento entre NanoMythos-1M y cualquiera de estas alternativas no está disponible: el autor no publica métricas y no se han localizado evaluaciones de terceros. La diferencia de escala con GPT-2 small (×86 en parámetros) y con SmolLM2-135M (×93) hace esperable una calidad muy inferior, pero esa afirmación es una inferencia por tamaño, no un resultado medido.

## Limitaciones y advertencias

- Capacidad lingüística muy limitada: con 1,44 M de parámetros es esperable una generación incoherente más allá de secuencias cortas; no es apto para tareas de producción.
- Riesgo alto de alucinación y de texto sin sentido: el modelo no tiene conocimiento factual fiable y no debe usarse como fuente de información.
- Sesgos: entrenado exclusivamente con FineWeb-Edu (inglés, filtrado por criterio educativo), hereda los sesgos de ese corpus; no se ha documentado ninguna mitigación (RLHF, DPO, filtros adicionales).
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y previsiblemente será muy deficiente.
- Ventana de contexto desconocida: no se puede planificar un caso de uso que dependa de contexto largo sin determinarla empíricamente.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución; no obstante, la licencia no implica calidad ni idoneidad técnica.
- Tamaño de repositorio de 0,0 GB y cero descargas en el momento de la consulta: verificar la integridad de los ficheros (pesos, tokenizador, `config.json`) antes de integrarlo; podría tratarse de una publicación incompleta o preliminar.
- Ausencia total de benchmarks y de documentación de arquitectura: no es posible justificar una elección técnica basada en este modelo más allá de su uso como artefacto de investigación o docencia.
- Idiomas y formatos de cuantización no disponibles en GGUF limitan su uso en herramientas de consumo como Ollama sin trabajo de conversión previo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarpiaIA/NanoMythos-1M
- Perfil de la organización Harpia en Hugging Face: https://huggingface.co/HarpiaIA
- Repositorio del experimento NanoMythos (AgnesAI-Labs), posible origen nominal no confirmado: https://github.com/AgnesAI-Labs/NanoMythos
- README del experimento NanoMythos: https://github.com/AgnesAI-Labs/NanoMythos/blob/main/README.md
- Ficha del agente NanoMythos en MeshKore: https://meshkore.com/agent/agnesai-labs-nanomythos
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
