# CharlieChen/loop-fwe-untied-grow-d16

## Resumen

loop-fwe-untied-grow-d16 es un modelo de lenguaje base preentrenado por CharlieChen (usuario de HuggingFace) y publicado como artefacto de investigación asociado al trabajo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con recurrencia en el núcleo (looped transformer) y una estrategia de crecimiento de profundidad denominada untied-grow, situado en la coordenada de profundidad d16. El checkpoint almacena 1.952.972.800 parámetros en FP32 (7,8 GB), con anchura 2048 y 16 cabezas de atención.

El modelo se entrena sobre FineWeb-Edu, un corpus filtrado de contenido educativo en inglés, y usa el tokenizador GPT-2 vía tiktoken con un vocabulario de 50.257 tokens (ampliado a 50.304 filas en el modelo). Su ventana de contexto es de 2.048 tokens y solo soporta inglés. No es un modelo instructivo ni ajustado con RLHF: es una base model orientada a experimentación sobre leyes de escala y sobre cómo la recursión y el crecimiento de profundidad afectan a los exponentes de escalado.

Su relevancia es fundamentalmente académica: permite reproducir los resultados del paper, comparar arquitecturas recurrentes frente a transformers estándar del mismo orden de parámetros y estudiar el equilibrio entre parámetros almacenados y cómputo efectivo. El repositorio no declara licencia, no incluye cuantizaciones y no es un artefacto `AutoModel` de Transformers, por lo que su uso en producción requiere integrar el código propio del paper.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con núcleo recurrente (looped transformer) y crecimiento de profundidad untied-grow; implementación propia `TransformerGPT` |
| Parametros totales | 1.952.972.800 en FP32 |
| Parametros activos | No aplica (no es MoE); el núcleo se repite 4 veces en la recurrencia final de evaluación |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; solo se publica el checkpoint en FP32 (no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`final.pt`, FP32); no es un artefacto `AutoModel` de Transformers; no hay safetensors |
| Coordenada de profundidad | d16 (coordenada de escalado; puede diferir del número de bloques Transformer ejecutados) |
| Anchura | 2.048 |
| Cabezas de atención | 16 |
| Repeticiones finales del núcleo | 4 |
| Tokenizador | GPT-2 vía tiktoken |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de preentrenamiento | HuggingFaceFW/fineweb-edu |
| Tamaño del repositorio | 7,8 GB |
| Ficheros incluidos | `final.pt`, `result.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un transformer con recurrencia en el núcleo: en lugar de apilar bloques independientes, el modelo reutiliza un núcleo que se ejecuta varias veces, cuatro de ellas en la recurrencia final de evaluación. La variante untied-grow introduce crecimiento de profundidad con parámetros no atados (untied), de modo que la coordenada de profundidad d16 actúa como coordenada de escalado del "ladder" y no tiene por qué coincidir con el número de bloques Transformer efectivamente ejecutados. Según la model card, el checkpoint exportado es idéntico bit a bit al del paper y contiene únicamente los tensores del modelo y la recurrencia final de evaluación; el estado del optimizador no se incluye, por lo que no es posible reanudar el preentrenamiento a partir de estos pesos.

El preentrenamiento usa FineWeb-Edu (corpus educativo en inglés) con el tokenizador GPT-2. La validación de preentrenamiento reporta una NLL de 2,42296078 nats/token. El paper evalúa con CORE sobre 91.037 ejemplos repartidos en 22 tareas, promediando las semillas 0, 1 y 2, y obtiene una precisión CORE de 0,28707332 y una NLL de respuesta CORE de 2,29417687 nats/token (métrica distinta de la NLL de validación). El protocolo del paper se ejecuta sobre GPUs H100 con FlashAttention-3 y autocast en bfloat16. El repositorio no detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; al ser un modelo base, no se declara ningún ajuste por preferencias.

## Capacidades

- Generación de texto autoregresiva en inglés, sin modo de instrucciones ni plantilla de chat.
- Modelado de lenguaje base: la model card solo documenta métricas de NLL y CORE, no capacidades de razonamiento, matemáticas o código.
- Investigación sobre escalado: permite medir el efecto de la recursión y del crecimiento de profundidad frente a transformers convencionales del mismo orden de parámetros.
- Reproducción de resultados: el código del paper (`eval.py`) permite replicar la evaluación CORE con las semillas 0, 1 y 2.
- Fine-tuning como base model: al ser un checkpoint de pesos completos en FP32, es adaptable a tareas concretas del dominio educativo o de texto en inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo declara únicamente inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Reproducción y auditoría del paper: descargar `final.pt` y `result.json`, instalar el codebase del paper y ejecutar `eval.py` con `--seeds 0 1 2` para verificar la precisión CORE de 0,28707332 y la NLL de respuesta de 2,29417687 nats/token.
- Estudio de leyes de escala con arquitecturas recurrentes: comparar la coordenada de profundidad d16 y las 4 repeticiones del núcleo frente a transformers apilados equivalentes para aislar el efecto de la recursión en los exponentes de escalado.
- Fine-tuning supervisado en dominios en inglés: al ser una base model de ~2.000 millones de parámetros con pesos FP32, se puede ajustar para clasificación de documentos, resumen extractivo o generación de contenido educativo sobre corpus en inglés.
- Investigación en cuantización post-entrenamiento: el checkpoint FP32 sirve como referencia para cuantizar a bfloat16, INT8 o formatos de 4 bits y medir la degradación de la NLL de validación (2,42296078 nats/token como línea base).
- Experimentos académicos con presupuesto de hardware reducido: con ~7,8 GB en FP32 y ~3,9 GB en bfloat16, el modelo cabe en GPUs de consumo, lo que facilita réplicas de evaluación en un único equipo.
- Destilación y comparación de arquitecturas: usar el checkpoint como profesor o como referencia para estudiar si la recursión aporta ventajas de cómputo por parámetro almacenado frente a modelos densos del mismo tamaño.
- Análisis de model growth y operadores de frontera: escenario de estudio directo del paper, evaluando cómo el crecimiento de profundidad afecta a la estabilidad del entrenamiento y a las métricas finales.
- Docencia e investigación en modelos base en inglés: con contexto de 2.048 tokens y licencia no declarada, se limita a entornos de investigación interna sin explotación comercial.

## Benchmarks y rendimiento

Solo se han publicado las métricas internas del paper. No hay resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion de preentrenamiento | 2,42296078 nats/token | Corpus FineWeb-Edu |
| Precision CORE | 0,28707332 | Media de las semillas 0, 1 y 2; 91.037 ejemplos en 22 tareas |
| NLL de respuesta CORE | 2,29417687 nats/token | Métrica distinta de la NLL de validación |
| MMLU, HumanEval, GSM8K, etc. | No disponible | No publicados |

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 7,8 GB solo para pesos, más activaciones y caché KV; en la práctica, 10-12 GB como mínimo.
- VRAM para inferencia en bfloat16: aproximadamente 3,9 GB de pesos, más activaciones y caché KV; viable en GPUs de 8-12 GB.
- Caché KV estimada: con anchura 2048, 16 cabezas y contexto de 2.048 tokens, el coste por capa y token es de unos 8 KB en FP32 y 4 KB en bfloat16; el total depende del número real de bloques ejecutados, que la model card advierte que puede diferir de la coordenada d16.
- GPUs recomendadas según el paper: H100 (el protocolo de evaluación usa FlashAttention-3 y autocast en bfloat16).
- GPUs de consumo compatibles: RTX 4090 o RTX 3090 (24 GB) sin problemas; RTX 4080 (16 GB) y RTX 3060 (12 GB) con conversión a bfloat16.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint no es un artefacto `AutoModel` de Transformers y usa la implementación propia `TransformerGPT`; el único camino documentado es el codebase del paper con `eval.py`.
- Latencia y throughput: no disponibles.
- Requisito adicional: `CUDA_VISIBLE_DEVICES=0` y dependencias del repositorio https://github.com/cue-engineering/loop.

## Comparativa con modelos similares

La comparación de rendimiento con alternativas no es posible porque este modelo solo publica métricas CORE y NLL internas, sin benchmarks comunes. La tabla recoge especificaciones públicas de modelos densos de tamaño comparable como referencia de contexto, licencia y disponibilidad; los datos de terceros no se han podido verificar en la búsqueda web realizada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| loop-fwe-untied-grow-d16 | 1,95 B (FP32, núcleo recurrente x4) | 2.048 tokens | No disponible | HuggingFace, código de paper |
| GPT-2 XL | 1,5 B | 1.024 tokens | Modified MIT | HuggingFace, Transformers |
| Pythia-1.4B | 1,4 B | 2.048 tokens | Apache-2.0 | HuggingFace, Transformers |
| SmolLM2-1.7B | 1,7 B | 8.192 tokens | Apache-2.0 | HuggingFace, Transformers, GGUF |
| Qwen2.5-1.5B | 1,5 B | 32.768 tokens | Apache-2.0 | HuggingFace, Transformers, GGUF |

Diferencias clave: este modelo duplica o cuadruplica la ventana de contexto de GPT-2 XL y Pythia-1.4B, pero queda muy por debajo de SmolLM2 y Qwen2.5; además no ofrece cuantizaciones oficiales ni integración con ecosistemas de inferencia estándar, y su licencia no está declarada, lo que lo descarta para uso comercial sin aclaración previa del autor.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni RLHF/DPO: no responde a prompts conversacionales de forma fiable y no soporta tool calling ni flujos de agentes.
- Licencia no disponible: no hay autorización explícita de uso comercial; en producción esto es un riesgo legal directo.
- Solo inglés: no hay capacidades multilingües declaradas, incluido el castellano.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Precisión CORE de 0,28707332 en 22 tareas: el rendimiento absoluto es bajo, coherente con un modelo base de ~2.000 millones de parámetros sin ajuste posterior.
- Riesgo de alucinación alto: sin alineación ni instrucciones, el modelo puede generar afirmaciones plausibles pero incorrectas, especialmente fuera del dominio de FineWeb-Edu.
- Sesgos heredados de FineWeb-Edu: corpus filtrado por criterios de calidad educativa en inglés, con la consiguiente sobrerrepresentación de ciertos registros y puntos de vista.
- El checkpoint no es un artefacto `AutoModel` de Transformers: requiere la implementación `TransformerGPT` del repositorio del paper, lo que complica su integración en pipelines estándar.
- No se incluye el estado del optimizador, por lo que el preentrenamiento no se puede reanudar desde estos pesos.
- No se distribuyen cuantizaciones (GGUF, AWQ, GPTQ): cualquier conversión corre por cuenta del usuario y sin garantías de fidelidad.
- Repositorio sin descargas ni likes y con licencia indefinida: no hay validación independiente de la comunidad sobre estos pesos.
- La coordenada de profundidad d16 no equivale necesariamente al número de bloques ejecutados, lo que puede confundir a la hora de estimar coste de cómputo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-untied-grow-d16
- Codebase del paper (evaluación e implementación `TransformerGPT`): https://github.com/cue-engineering/loop
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents": referenciado en la model card, sin enlace directo disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo ni al paper (los resultados devueltos corresponden a páginas corporativas de Microsoft, sin relación con el modelo)
