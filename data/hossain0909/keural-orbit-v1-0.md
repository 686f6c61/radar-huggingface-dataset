# hossain0909/Keural-Orbit-v1.0

## Resumen

Keural Orbit v1.0 es un ajuste fino supervisado (SFT) mediante LoRA del modelo multimodal `google/gemma-4-26B-A4B-it` de Google DeepMind, desarrollado por el autor independiente MKD (usuario `hossain0909` en HuggingFace). El modelo parte de una arquitectura Mixture-of-Experts (MoE) con 25.805.933.872 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, orientada a tareas de imagen-texto-a-texto, y ha sido especializado para conversación natural y concisa en coreano, con una identidad propia ("Keural Orbit") que sustituye a la identidad del modelo base.

El objetivo declarado del autor es doble: por un lado, mejorar la calidad y concisión de las respuestas en coreano frente al modelo base, que tiende a respuestas más largas y con múltiples opciones; por otro, implantar una identidad consistente que impida que el modelo se identifique como Gemma o como un producto de Google. El ajuste se ha fusionado de vuelta en pesos completos (merge a nivel de pesos en CPU con verificación byte a byte), de modo que el repositorio distribuido es un modelo completo y no un adaptador LoRA suelto.

Es relevante ahora porque demuestra un patrón habitual en el ecosistema open source: especialización lingüística e identitaria de un modelo base grande mediante LoRA de rango bajo sobre un subconjunto reducido de módulos, con transparencia sobre el coste en benchmarks de conocimiento. El contexto heredado del modelo base es de 256K tokens, aunque el ajuste no aplica extensión YaRN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal imagen-texto-a-texto, base `google/gemma-4-26B-A4B-it` (Gemma 4) |
| Parámetros totales | 25.805.933.872 (≈25,8B) |
| Parámetros activos | ≈4B por token (MoE, 128 expertos enrutados fusionados por capa) |
| Longitud de contexto | 256K tokens (heredada del base; sin extensión YaRN en este fine-tune) |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas; el repo contiene safetensors en bf16) |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Gemma Terms of Use (Google DeepMind) |
| Formato de pesos | safetensors (transformers) |
| Pipeline | image-text-to-text |
| Capas adaptadas | 30 capas: atención (`q/k/v/o_proj`), MLP denso (`gate/up/down_proj`) y 128 expertos enrutados (`gate_up_proj`/`down_proj`) |
| Módulos congelados | Router, torre de visión y embeddings de entrada/salida atados |
| Tamaño del repositorio | 51,6 GB |
| Descargas / likes | 26 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts multimodal de Gemma 4 con 26B parámetros totales y unos 4B activos por token, capaz de procesar entradas de imagen y texto y generar texto. La torre de visión, el router de expertos y los embeddings atados de entrada/salida se mantienen congelados durante el ajuste, de modo que el comportamiento multimodal y el enrutamiento de expertos son idénticos a los del base. El fine-tune se aplica sobre 30 capas e incluye las proyecciones de atención, el MLP denso y los 128 expertos enrutados fusionados.

El entrenamiento consistió en un LoRA SFT con rango 16, alpha 32, dropout 0, una época, learning rate 1e-5 con scheduler coseno, precisión bf16 y DeepSpeed ZeRO-2 sobre 2 GPUs H200. El conjunto de datos comprende aproximadamente 146.000 filas con conversación en coreano, código limpio, matemáticas, preguntas de opción múltiple, texto largo, replay en inglés y un conjunto sembrado manualmente para la identidad Keural Orbit con decontaminación de referencias a Gemma y Google. La fusión LoRA se realizó a nivel de pesos en CPU con verificación byte a byte, comprobando que los tensores no objetivo son idénticos al base y preservando los embeddings atados.

## Capacidades

- Generación de texto conversacional en coreano con respuestas concisas y completas, orientadas a cerrar la respuesta en lugar de enumerar opciones.
- Identidad propia consistente: el modelo se identifica como "Keural Orbit" de MKD y niega ser Gemma o un producto de Google cuando se le pregunta directamente.
- Razonamiento y conocimiento general, incluyendo preguntas de opción múltiple (con degradación respecto al base, ver benchmarks).
- Generación de código y resolución de problemas matemáticos, gracias a los datos de código y matemáticas incluidos en el SFT.
- Capacidad multimodal heredada del base (image-text-to-text), aunque la torre de visión está congelada y no fue entrenada ni evaluada en este fine-tune.
- Conversación multi-turno con contexto largo de hasta 256K tokens (heredado, sin YaRN).
- Soporte de inglés como idioma secundario, con comportamiento aproximadamente igual al base en tareas no coreanas.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional en coreano para atención al cliente: el modelo responde de forma concisa y directa, lo que reduce la longitud de las respuestas y facilita su integración en interfaces de chat con ventanas de contexto amplias (256K tokens) para historiales largos.
- Generación de textos profesionales en coreano: redacción de correos, mensajes de disculpa o comunicaciones formales, como el ejemplo de la model card sobre un mensaje de disculpa por llegada tarde al trabajo.
- Chatbot con identidad de marca propia: al estar entrenado para identificarse como Keural Orbit y no como Gemma, encaja en despliegues donde se requiere una persona o marca concreta y se quiere evitar que el modelo atribuya sus respuestas a Google.
- Asistente de soporte técnico bilingüe coreano-inglés: útil en equipos donde la conversación principal es en coreano pero se reciben consultas o documentación en inglés, con replay en inglés incluido en el entrenamiento.
- Prototipado de aplicaciones multimodales: al conservar la torre de visión del base, puede emplearse para experimentar con entradas de imagen y texto, aunque el comportamiento visual es el heredado y no ha sido validado por el autor.
- Evaluación comparativa de fine-tunes: sirve como caso de estudio de especialización lingüística e identitaria sobre un MoE grande, con benchmarks internos publicados y metodología transparente para reproducir la comparación con el base.
- Generación de código y ejercicios matemáticos en contextos educativos coreanos: el SFT incluye datos de código y matemáticas, por lo que puede emplearse para explicar fragmentos de código o resolver problemas paso a paso en coreano.

## Benchmarks y rendimiento

El autor publica resultados de un arnés de evaluación interno (lm-eval, 0-shot, log-likelihood, backend `hf`/sdpa), ejecutado de forma idéntica sobre el modelo base y sobre Keural Orbit. El propio autor advierte que estos valores no son comparables con las cifras oficiales few-shot de Gemma 4 y que el scoring por log-likelihood penaliza los fine-tunes conversacionales.

| Benchmark (0-shot acc) | Base Gemma 4 | Keural Orbit v1.0 | Δ |
|---|---:|---:|---:|
| HAE-RAE (coreano) | 48,2 | 34,1 | −14,1 |
| KMMLU (coreano) | 28,4 | 25,7 | −2,7 |
| KoBEST (coreano) | 54,4 | 53,3 | −1,1 |
| MMLU (general) | 47,8 | 41,2 | −6,6 |

No se han publicado resultados de benchmarks de generación (por ejemplo, calidad conversacional humana, HumanEval o GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 52 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para contexto moderado.
- GPU recomendadas: H100 80 GB, A100 80 GB o H200 para bf16 sin cuantizar; el entrenamiento se realizó sobre 2× H200.
- En consumer GPU: no cabe en bf16 en tarjetas de 24 GB (RTX 4090, RTX 3090). Requeriría cuantización agresiva (no publicada por el autor) para aproximarse a ese rango, y aun así el contexto útil quedaría muy limitado.
- Opciones de despliegue: transformers con `Gemma4ForConditionalGeneration` y `AutoProcessor`, `device_map="auto"` y `dtype="bfloat16"` según la model card. No se documentan integraciones verificadas con vLLM, llama.cpp, Ollama o TGI para este modelo concreto; al ser un MoE multimodal de Gemma 4, la compatibilidad dependerá del soporte de dichos frameworks para la arquitectura base.
- Latencia y throughput: no disponibles. Al activar solo ~4B parámetros por token, el coste de cómputo por token es menor que el de un modelo denso de 26B, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Keural Orbit v1.0 | 25,8B totales / ~4B activos (MoE) | 256K | Gemma Terms of Use | Sí (heredado, congelado) | Fine-tune coreano e identitario de Gemma 4 |
| google/gemma-4-26B-A4B-it (base) | 26B totales / ~4B activos (MoE) | 256K | Gemma Terms of Use | Sí | Mayor puntuación en MCQ 0-shot según la eval interna del autor; identidad Gemma |
| Alternativas coreanas especializadas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información sobre otros fine-tunes coreanos comparables en la documentación aportada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Enfocado al coreano: en tareas no coreanas el comportamiento esperado es aproximadamente el del modelo base, sin mejoras atribuibles al fine-tune.
- Degradación en benchmarks de conocimiento de opción múltiple: HAE-RAE cae 14,1 puntos, MMLU 6,6 puntos y KMMLU 2,7 puntos respecto al base en la eval interna del autor. Si el caso de uso depende de precisión en MCQ, hay que evaluar específicamente.
- La torre de visión está congelada y no fue entrenada ni evaluada por este fine-tune; el comportamiento multimodal es heredado y no validado.
- Riesgo de alucinación inherente al modelo base, no mitigado de forma específica por el SFT; el entrenamiento identitario puede además reforzar respuestas categóricas sobre su propia naturaleza que conviene contrastar en producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al ser un fine-tune sobre datos coreanos e ingleses, es esperable un sesgo cultural y lingüístico hacia esos contextos.
- Licencia Gemma Terms of Use: el uso comercial y la redistribución están sujetos a los términos de Google, que incluyen obligaciones de atribución y restricciones de uso aceptable; hay que revisarlos antes de desplegar en producción.
- El repositorio tiene muy poca tracción (26 descargas, 0 likes) y fue publicado el 2026-10-27; no hay evidencia de validación independiente de la calidad del fine-tune.
- El contexto de 256K es el del base y no se ha aplicado YaRN; el rendimiento real en contextos muy largos no está documentado para este fine-tune.
- No se documenta soporte de tool calling ni de flujos agénticos; no asumir su disponibilidad sin verificación empírica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/Keural-Orbit-v1.0
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Perfil del autor en HuggingFace: https://huggingface.co/mkd-hossain
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
