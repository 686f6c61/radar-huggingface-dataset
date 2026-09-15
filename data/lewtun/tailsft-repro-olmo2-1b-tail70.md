# lewtun/tailsft-repro-olmo2-1b-tail70

## Resumen

lewtun/tailsft-repro-olmo2-1b-tail70 es un ajuste fino supervisado (SFT) del modelo allenai/OLMo-2-0425-1B, publicado por Lewis Tunstall (usuario lewtun de Hugging Face). Es un modelo de generación de texto con formato conversacional, de 1 484 916 736 parámetros (≈1,48 mil millones), cuyos pesos en safetensors ocupan 3,0 GB en el repositorio, un tamaño coherente con almacenamiento en bf16/fp16.

El entrenamiento se ha realizado con la librería TRL (versión 1.13.0) sobre Transformers 5.17.0 y PyTorch 2.14.0, dentro de un experimento etiquetado como "tailsft-repro" cuyo seguimiento se publica en un espacio de Trackio. El sufijo "tail70" apunta a una configuración concreta dentro de ese experimento, pero la model card no documenta el conjunto de datos, el número de tokens de entrenamiento ni el criterio exacto de selección de datos.

Su interés es fundamentalmente el de un artefacto de investigación: permite reproducir y auditar una receta de SFT sobre la familia OLMo 2, uno de los pocos ecosistemas de modelos abiertos que publica datos, código y recetas de entrenamiento de extremo a extremo. La ausencia de licencia declarada, de idiomas soportados y de resultados de evaluación limita, en cambio, su uso directo en producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2, etiqueta `olmo2`); detalles concretos de capas y atención no disponibles en la información proporcionada |
| Parámetros totales | 1 484 916 736 (≈1,48 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; debe consultarse la model card del modelo base |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica únicamente `licence: license`, sin término concreto) |
| Formato de pesos | safetensors (tamaño del repositorio: 3,0 GB, compatible con pesos en bf16/fp16) |
| Modelo base | allenai/OLMo-2-0425-1B |
| Autor | lewtun |
| Modalidad | text-generation (conversacional) |
| Librería | transformers |
| Framework de entrenamiento | TRL 1.13.0 |
| Versiones de entorno | Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1, Tokenizers 0.23.2 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-15 |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint allenai/OLMo-2-0425-1B, un transformer decoder-only de la familia OLMo 2 desarrollada por el Allen Institute for AI (Ai2). La model card de este fine-tune no especifica configuración de capas, mecanismo de atención, tipo de normalización ni longitud de contexto; esos datos corresponden al modelo base y deben consultarse en su propia ficha. La etiqueta `olmo2` y el pipeline `text-generation` sí confirman que se trata de un modelo autoregresivo de texto y no de una arquitectura híbrida ni de un modelo multimodal.

El entrenamiento consiste en un ajuste fino supervisado (SFT) ejecutado con TRL, sin que la información disponible mencione fases posteriores de RLHF, DPO u optimización por preferencias. No se documentan el dataset empleado, su composición, el número de tokens vistos, la tasa de aprendizaje, el número de épocas ni la estrategia de enmascarado de la pérdida, más allá de que el formato es conversacional (etiquetas `conversational` y `sft`). La ejecución quedó registrada en Trackio bajo el proyecto `tailsft-repro`, con identificador de run `lewtun-1789464639`, lo que sugiere que se trata de un experimento controlado y reproducible más que de un modelo destinado a distribución general.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo de uso con `pipeline("text-generation")` y una lista de mensajes con `role` y `content`, lo que indica que el modelo espera una plantilla de chat para multi-turno.
- Respuesta a preguntas abiertas y generación de texto libre, heredadas del modelo base tras el SFT.
- Ajuste supervisado sobre instrucciones conversacionales: el modelo está optimizado para seguir el formato de diálogo usuario/asistente, no solo para continuar texto plano.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no documentadas en la información disponible.
- Formato de contexto largo o ventana extendida: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con 1,48 mil millones de parámetros y pesos en bf16 de unos 3 GB, el modelo se puede cargar en una GPU de consumo y sirve para validar plantillas de chat, prompts de sistema y flujos multi-turno antes de escalar a modelos mayores.
- Reproducción de experimentos de SFT: el modelo forma parte del proyecto `tailsft-repro` y está entrenado con TRL, por lo que es adecuado para replicar recetas de ajuste supervisado, comparar subconjuntos de datos y auditar la variante "tail70" frente a otras configuraciones del mismo experimento.
- Generación de datos sintéticos para ajuste posterior: se puede emplear para producir diálogos o pares instrucción-respuesta a bajo coste computacional, que después se filtren y se utilicen como datos de entrenamiento de modelos mayores.
- Clasificación y extracción de información mediante prompting: tareas de etiquetado de texto, extracción de entidades o resumen de documentos cortos en pipelines por lotes donde el coste por token es un factor crítico.
- Investigación sobre sesgos y alineación en modelos pequeños: al ser un artefacto reproducible con run de entrenamiento trazable, resulta útil para estudiar cómo el SFT modifica el comportamiento del base en cuanto a estilo, toxicidad y adherencia a instrucciones.
- Despliegue en entornos con recursos limitados: integrable en servicios de borde o en portátiles con GPU de 8 GB, e incluso en CPU mediante conversión a GGUF, para tareas de generación de texto que no requieran razonamiento complejo.
- Base para un ajuste específico de dominio: al ser un modelo de 1,48 mil millones de parámetros, el coste de un segundo fine-tune sobre datos propios es bajo en comparación con modelos de 7B o superiores.
- Evaluación comparativa de frameworks de inferencia: útil para medir latencia y throughput de transformers, vLLM o TGI en un modelo de tamaño pequeño con formato conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, IFEval ni de ninguna otra evaluación, y tampoco se aportan comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: los pesos ocupan aproximadamente 3,0 GB (coincide con el tamaño del repositorio); con caché KV y activaciones, la VRAM total estimada se sitúa en el rango de 4 a 6 GB para contextos moderados.
- VRAM para inferencia en fp32: aproximadamente 5,9 GB solo en pesos, más el coste de activaciones y caché.
- VRAM con cuantización de 8 bits: del orden de 1,5 GB en pesos.
- VRAM con cuantización de 4 bits (requiere conversión previa, ya que el repositorio no incluye pesos cuantizados): del orden de 0,8 a 1,0 GB en pesos.
- GPU recomendadas: cabe con holgura en NVIDIA A100, H100, RTX 4090, RTX 3090, RTX 3060 de 12 GB y T4 de 16 GB; en tarjetas de 8 GB funciona en bf16 con contextos cortos y en 4 bits sin problema.
- GPU de consumo: sí, es un modelo apto para GPU de consumo. También es viable en Apple Silicon con memoria unificada de 8 a 16 GB y en CPU mediante llama.cpp u Ollama tras convertir los pesos a GGUF.
- Opciones de despliegue: transformers (soporte nativo, es la librería declarada), vLLM, TGI, SGLang y llama.cpp/Ollama (estos dos últimos requieren generar un GGUF, que no está incluido en el repositorio). El tag `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lewtun/tailsft-repro-olmo2-1b-tail70 | 1 484 916 736 | No disponible | No disponible | Hugging Face | Fine-tune SFT conversacional sobre OLMo-2-0425-1B; sin benchmarks publicados |
| allenai/OLMo-2-0425-1B | 1 484 916 736 (mismo modelo base) | No disponible en esta ficha | No disponible en esta ficha; la familia OLMo 2 de Ai2 se publica habitualmente bajo Apache-2.0, conviene verificarlo en su model card | Hugging Face | Modelo base sin SFT conversacional; referencia directa de comparación |
| Otros modelos abiertos de la franja 1B-2B (por ejemplo Llama 3.2 1B, Qwen2.5 1.5B, Gemma 2 2B) | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face | Alternativas de la misma categoría de tamaño; los datos concretos deben consultarse en sus respectivas fichas |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Licencia sin especificar: la model card solo contiene `licence: license`, sin término legal concreto. No hay base para asumir uso comercial permitido; es imprescindible aclararlo con el autor o con la licencia del modelo base antes de cualquier despliegue productivo.
- Sin resultados de evaluación: no hay benchmarks publicados, por lo que no se puede afirmar nada sobre su calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinación elevado: con 1,48 mil millones de parámetros, la capacidad de razonamiento y de retención de hechos es limitada, y el modelo puede generar afirmaciones plausibles pero falsas, especialmente en dominios especializados.
- Idiomas no declarados: no se especifica qué lenguas soporta. El comportamiento en castellano es una incógnita y requiere una evaluación propia antes de usarlo.
- Dataset de entrenamiento no documentado: se desconoce la composición de los datos de SFT, lo que impide auditar sesgos, contaminación de benchmarks o cobertura temática.
- Sesgos heredados: al derivar del modelo base y de un corpus de instrucciones no descrito, es probable que arrastre sesgos sociales, culturales y de representación del modelo original y de los datos de ajuste.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que dificulta planificar casos de uso con documentos largos o conversaciones extensas.
- Modelo experimental con nula adopción: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso en producción ni de validación por parte de terceros.
- Caveats de producción: el repositorio solo contiene safetensors en precisión completa o media; no hay versiones cuantizadas ni GGUF listas para usar, por lo que cualquier despliegue optimizado exige un paso previo de conversión y validación.
- Fechas y versiones atípicas: la fecha de creación registrada (2026-09-15) y las versiones de framework declaradas (Transformers 5.17.0, PyTorch 2.14.0) deben verificarse en el entorno de destino para evitar incompatibilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lewtun/tailsft-repro-olmo2-1b-tail70
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Run de entrenamiento en Trackio: https://lewtun-tailsft-repro-trackio.hf.space?project=tailsft-repro&runs=lewtun-1789464639&sidebar=collapsed
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Trackio (origen del badge de seguimiento): https://github.com/gradio-app/trackio
- Cita de TRL (von Werra et al., 2020), incluida en la model card: referencia bibliográfica `vonwerra2020trl`, licencia Apache-2.0
- No se han encontrado en la información disponible artículos, papers técnicos ni demos adicionales específicos de este fine-tune.
