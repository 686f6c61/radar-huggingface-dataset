# sbortetto/NapoliAI-7B-GGUF

## Resumen

napoliAI-7B es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct especializado en el dialecto napolitano, desarrollado por el usuario sbortetto y distribuido en formato GGUF cuantizado. El modelo parte de los pesos de `unsloth/Qwen2.5-7B-Instruct` (7.615.616.512 parámetros) y aplica un entrenamiento LoRA con rango 16 y alpha 32 mediante la librería Unsloth, con el objetivo de capturar el registro coloquial, la ironía y la expresividad del napolitano hablado.

El modelo se publica principalmente como artefacto de inferencia local: el repositorio incluye una versión Q4_K_M de aproximadamente 5,5 GB y una versión F16 de unos 15 GB, lo que permite ejecutarlo en CPU moderna o en GPU de consumo. La licencia es Apache 2.0, heredada del modelo base, y los idiomas declarados son napolitano (principal) e italiano.

Su relevancia es acotada pero clara: cubre un nicho lingüístico poco representado en los LLM comerciales, el napolitano, y lo hace sobre una base instruct de calidad contrastada como Qwen2.5-7B. No obstante, el autor advierte explícitamente de que el modelo emplea un registro informal y ocasionalmente soez como decisión estilística, y desaconseja su uso para consejos médicos, legales o financieros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino LoRA sobre Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct, no confirmada por el autor) |
| Tipos de cuantizacion | Q4_K_M (4 bits) y F16 |
| Idiomas soportados | nap (napolitano, principal), it (italiano) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M ~5,5 GB; F16 ~15 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA (Low-Rank Adaptation) sobre `unsloth/Qwen2.5-7B-Instruct`, ejecutado con la herramienta Unsloth. Los hiperparámetros declarados son rango r=16 y alpha=32. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO posteriores al ajuste supervisado. La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parámetros.

La innovación principal no es arquitectónica sino de dominio: el ajuste persigue reproducir el registro coloquial napolitano, incluyendo expresiones malsonantes, como rasgo estilístico deliberado. Los pesos se distribuyen fusionados en GGUF, con la opción de cargar los adaptadores LoRA originales por separado en LM Studio si se prefiere no usar la versión fusionada. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional en napolitano e italiano, con registro informal, amigable y ocasionalmente soez por diseño.
- Comprensión y respuesta a preguntas sobre cultura napolitana, gastronomía, personajes históricos y deportivos (los ejemplos de la model card incluyen la pizza y Maradona).
- Conversación multi-turno con plantilla ChatML / Qwen, compatible con LM Studio y Ollama.
- Capacidades heredadas del modelo base Qwen2.5-7B-Instruct en razonamiento, código y matemáticas, aunque no se documenta su preservación tras el ajuste.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada para esta versión ajustada.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta versión.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- **Chatbot de temática napolitana para ocio o divulgación cultural**: el modelo puede mantener conversaciones multi-turno en napolitano con un tono auténtico, adecuado para webs de turismo, comunidades locales o aplicaciones de entretenimiento.
- **Prototipos de asistentes dialectales en local**: gracias a la cuantización Q4_K_M (~5,5 GB) se puede desplegar en un portátil con CPU moderna o GPU de consumo, sin depender de servicios en la nube.
- **Generación de contenido creativo en napolitano**: diálogos, guiones breves, textos humorísticos o publicaciones en redes que requieran registro coloquial napolitano, donde los modelos generalistas suelen derivar al italiano estándar.
- **Investigación en NLP de variedades lingüísticas de bajos recursos**: sirve como punto de partida o línea base para experimentos de evaluación de dialectos italianos, siempre con las cautelas de un ajuste fino ligero.
- **Demostraciones educativas de fine-tuning LoRA**: el repositorio documenta el método (Unsloth, r=16, alpha=32) y constituye un ejemplo reproducible de adaptación de un modelo instruct a un dominio concreto.
- **Integración en pipelines locales con Ollama o LM Studio**: el autor proporciona un `Modelfile` y una plantilla ChatML listos para usar, lo que facilita su incorporación a flujos de trabajo de desarrollo en escritorio.
- **Traducción informal italiano-napolitano en contextos lúdicos**: útil para subtitulado o adaptación de contenido de entretenimiento, no recomendado para traducción profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: Q4_K_M requiere aproximadamente 6-7 GB de VRAM para inferencia completa en GPU; la versión F16 necesita del orden de 16-18 GB.
- **GPU recomendadas**: RTX 4090, RTX 3090, RTX 4080 o superiores para la versión F16; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para Q4_K_M.
- **GPU de consumo**: sí, la versión Q4_K_M cabe en la mayoría de GPU con 8 GB o más de VRAM y funciona también en CPU moderna según el autor.
- **Opciones de despliegue**: llama.cpp, Ollama (con el `Modelfile` proporcionado), LM Studio (preset ChatML o Qwen). No se documenta soporte explícito para vLLM o TGI en la información disponible.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| napoliAI-7B (este modelo) | 7,6 B | no disponible | nap, it | Apache 2.0 | GGUF |
| Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible en esta ficha | multilingüe (incluye it) | Apache 2.0 | safetensors, GGUF |
| Modelos generalistas italianos de ~7B | variable | variable | it, en | variable | variable |

La comparación directa con otros ajustes dialectales italianos no está disponible en la información proporcionada. Frente a su base Qwen2.5-7B-Instruct, napoliAI-7B sacrifica cobertura multilingüe general a cambio de especialización en napolitano y un estilo marcadamente coloquial.

## Limitaciones y advertencias

- **Registro soez deliberado**: el modelo emplea tacos y expresiones vulgares como parte de su estilo; no es apto para entornos profesionales, atención al cliente corporativa ni público infantil sin filtrado previo.
- **Riesgo de alucinación**: al ser un ajuste fino sobre un modelo de 7B, puede inventar datos históricos, geográficos o culturales sobre Nápoles; conviene verificar cualquier afirmación factual.
- **Sesgos**: no se documenta ningún análisis de sesgos; el entrenamiento centrado en un registro coloquial concreto puede reforzar estereotipos regionales.
- **Cobertura lingüística limitada**: solo napolitano e italiano; el rendimiento en otros idiomas no está garantizado y probablemente degradado respecto al modelo base.
- **Contexto no confirmado**: la longitud de contexto no se especifica en la información disponible; no debe asumirse la ventana de Qwen2.5 sin verificación empírica.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso para consejos médicos, legales o financieros.
- **Madurez del proyecto**: 147 descargas y 1 like en el momento de la consulta; se trata de un proyecto personal sin validación externa ni benchmarks publicados.
- **Formato GGUF únicamente**: no se ofrecen pesos en safetensors fusionados en el repositorio, lo que limita su uso en stacks que requieran ese formato.

## Enlaces

- [HuggingFace: sbortetto/NapoliAI-7B-GGUF](https://huggingface.co/sbortetto/NapoliAI-7B-GGUF)
- [Modelo base: unsloth/Qwen2.5-7B-Instruct](https://huggingface.co/unsloth/Qwen2.5-7B-Instruct)
- [LM Studio](https://lmstudio.ai/)
- [Ollama](https://ollama.com/)
- [Unsloth](https://github.com/unslothai/unsloth)
