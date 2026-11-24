# mradermacher/Whale-4B-Thinking-i1-GGUF

## Resumen

Whale-4B-Thinking-i1-GGUF es una colección de cuantizaciones GGUF (con variantes estáticas y ponderadas con imatrix) del modelo Orca-4B-Thinking, publicada por mradermacher. No se trata de un modelo entrenado desde cero, sino de una distribución de pesos comprimidos para inferencia local eficiente. El modelo base, roskosmos19/Orca-4B-Thinking, es un transformer denso de aproximadamente 4.022 millones de parámetros (4B), con licencia Apache 2.0 y orientado a razonamiento con cadena de pensamiento (chain-of-thought).

La relevancia de esta ficha radica en que permite ejecutar un modelo de razonamiento de 4B parámetros en hardware de consumo, desde tarjetas con 4-6 GB de VRAM hasta CPU, gracias a cuantizaciones que van de 1,2 GB (IQ1_S) a 3,4 GB (Q6_K). El repositorio incluye 27 variantes GGUF más el archivo imatrix, con un tamaño total de 48 GB.

El modelo declara soporte para inglés, alemán, español, francés y chino, y está etiquetado con conceptos como deepseek-r1, qwen3, orca y thinking, lo que sugiere que el modelo base fue destilado o inspirado en técnicas de razonamiento de modelos mayores. La información disponible no detalla la arquitectura interna exacta del modelo base ni los datos de entrenamiento más allá de los datasets citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (estáticas y ponderadas con imatrix) |
| Idiomas soportados | en, de, es, fr, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base más allá de que es un transformer denso de ~4B parámetros. El modelo está etiquetado con deepseek-r1, qwen3 y orca, lo que indica que su entrenamiento de razonamiento se inspira en las técnicas de cadena de pensamiento de DeepSeek-R1 y posiblemente en la familia Qwen3, combinadas con el enfoque Orca de destilación de razonamiento.

Los datasets citados en la model card son open-thoughts/OpenThoughts-114k y open-r1/Mixture-of-Thoughts, ambos corpus públicos de trazas de razonamiento (chain-of-thought) generadas por modelos mayores. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO o GRPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

Esta publicación es exclusivamente una distribución de cuantizaciones: mradermacher aplica cuantización ponderada con imatrix (i1) sobre los pesos del modelo base, generando variantes optimizadas para llama.cpp. No hay entrenamiento adicional en este repositorio.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con cadena de pensamiento explícita (thinking mode), herencia de las técnicas de DeepSeek-R1 y Qwen3.
- Resolución de problemas matemáticos y lógicos de complejidad media, típicos de modelos de 4B parámetros entrenados con datos de razonamiento.
- Generación de código y explicación de fragmentos de código.
- Capacidades multilingües declaradas para inglés, alemán, español, francés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo thinking facilita cadenas de razonamiento extendidas.
- Capacidades de visión o audio: no disponibles (modelo solo texto).
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso

- Inferencia local en portátiles y equipos de sobremesa: las cuantizaciones Q4_K_M (2,6 GB) e IQ4_XS (2,4 GB) permiten ejecutar el modelo en CPU o en GPUs con 4-6 GB de VRAM mediante llama.cpp u Ollama, ideal para desarrolladores que quieren probar razonamiento sin infraestructura cloud.
- Asistente de programación offline: con Q5_K_M (3,0 GB) se obtiene un modelo capaz de explicar código, generar fragmentos y razonar sobre errores en entornos sin conexión, útil para trabajo en aeronaves, entornos air-gapped o zonas de conectividad limitada.
- Prototipado de pipelines de razonamiento: el modo thinking permite experimentar con cadenas de pensamiento en un modelo pequeño antes de escalar a modelos mayores, reduciendo costes de iteración.
- Educación y tutoría automatizada: el modelo puede descomponer problemas matemáticos paso a paso en español, francés, alemán, inglés o chino, adecuado para herramientas de aprendizaje con presupuesto de hardware limitado.
- Procesamiento por lotes en servidores modestos: con cuantizaciones Q2_K o IQ3_M (1,8-2,1 GB) se pueden desplegar múltiples instancias en una sola GPU de 16 GB, aumentando el throughput para tareas de clasificación o resumen.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 27 variantes del mismo modelo, lo que permite a investigadores medir el impacto de la cuantización en la calidad del razonamiento (perplexity, precisión en tareas de CoT) de forma controlada.
- Integración en herramientas de escritorio: al ser GGUF, encaja en aplicaciones como LM Studio, Jan o GPT4All, permitiendo distribuir un asistente de razonamiento local a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead de contexto. IQ1_S: ~1,2 GB; Q2_K: ~1,8 GB; IQ3_M: ~2,1 GB; IQ4_XS: ~2,4 GB; Q4_K_M: ~2,6 GB; Q5_K_M: ~3,0 GB; Q6_K: ~3,4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4 y superiores (RTX 3050, RTX 4060, RTX 3060 12GB). Para Q6_K se recomienda 6 GB o más (RTX 2060, RTX 4050). GPUs de datacenter como A100 o H100 no son necesarias para un modelo de 4B y resultarían sobredimensionadas.
- Cabe en GPU de consumo: sí, prácticamente todas las cuantizaciones caben en GPUs consumer modernas; las variantes IQ2 e inferiores caben incluso en iGPUs y CPUs con RAM abundante.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, GPT4All, text-generation-webui (con backend llama.cpp). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; para servidores de alto throughput convendría usar el modelo base en safetensors con vLLM.
- Latencia y throughput estimados: no disponibles. Como referencia general para modelos de 4B en GGUF, se esperan decenas de tokens por segundo en GPUs consumer y velocidades menores en CPU, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Whale-4B-Thinking-i1-GGUF (este) | ~4B | No disponible | Apache 2.0 | GGUF (27 cuantizaciones) | Cuantizaciones imatrix de Orca-4B-Thinking |
| Orca-4B-Thinking (base) | ~4B | No disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3-4B (referencia de la familia citada) | ~4B | No disponible en esta ficha | Apache 2.0 (según familia Qwen3) | safetensors, GGUF | Modelo con modo thinking, citado como inspiración |
| DeepSeek-R1-Distill de tamaño similar | ~1.5B-7B según variante | No disponible en esta ficha | MIT/Apache según variante | safetensors, GGUF | Referencia de técnicas de razonamiento citada en tags |

La comparación directa de rendimiento no es posible porque no se han publicado benchmarks para este modelo en la información disponible. Las alternativas citadas se incluyen por proximidad temática (razonamiento en modelos pequeños) y no por datos medidos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo destilado de datasets públicos de razonamiento, puede heredar sesgos de los modelos generadores y de los corpus de OpenThoughts y Mixture-of-Thoughts.
- Riesgo de alucinación: inherente a modelos de 4B parámetros; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en matemáticas avanzadas o dominios especializados.
- Limitaciones de contexto: la longitud de contexto no está especificada; no se debe asumir una ventana grande sin verificarla en el modelo base.
- Limitaciones de idioma: aunque declara cinco idiomas, la calidad real en español, francés, alemán y chino no está verificada mediante benchmarks; el inglés es presumiblemente el idioma dominante del entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base (enlazada en la model card) y las licencias de los datasets de entrenamiento.
- Caveats para producción: las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad (el propio autor las etiqueta como "for the desperate" o "very low quality"); para producción se recomienda Q4_K_M o superior. Además, el throughput y la latencia no están medidos, por lo que se requiere validación propia antes de desplegar.
- El repositorio tiene 0 likes y 467 descargas en el momento de la consulta, lo que indica baja validación comunitaria; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Whale-4B-Thinking-i1-GGUF
- Modelo base: https://huggingface.co/roskosmos19/Orca-4B-Thinking
- Licencia del modelo base: https://huggingface.co/roskosmos19/Orca-4B-Thinking/blob/main/LICENSE
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Whale-4B-Thinking-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Whale-4B-Thinking-i1-GGUF
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset Mixture-of-Thoughts: https://huggingface.co/datasets/open-r1/Mixture-of-Thoughts
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
