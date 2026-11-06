# sbortetto/napoliAI-7B-Q4_K_M-GGUF

## Resumen

napoliAI-7B es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct orientado a la conversación en dialecto napolitano. Lo desarrolla el usuario independiente sbortetto mediante LoRA (r=16, alpha=32) con la librería Unsloth, partiendo de los pesos de unsloth/Qwen2.5-7B-Instruct. El objetivo declarado es reproducir el registro coloquial, la ironía y la expresividad del napolitano hablado, incluyendo tacos y expresiones malsonantes como parte deliberada del estilo.

La versión publicada bajo este identificador es una cuantización GGUF Q4_K_M (4 bits) de aproximadamente 5,5 GB, pensada para inferencia local en CPU o en GPU de gama media. El modelo conserva la arquitectura transformer densa de Qwen2.5-7B, con 7.615.616.512 parámetros totales y una ventana de contexto nativa de 32.768 tokens (heredada del modelo base, aunque la model card no la documenta explícitamente).

Su relevancia es acotada y de nicho: no compite en benchmarks generales, sino que cubre un caso de uso lingüístico y cultural concreto (napolitano e italiano) que los modelos generalistas rara vez tratan con autenticidad. Es útil como ejemplo de adaptación dialectal de sub-10B y como base para experimentos de preservación lingüística, no como modelo de producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parámetros totales | 7.615.616.512 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct; no documentada en la model card) |
| Tipos de cuantización | Q4_K_M (4 bits); el repo contiene además pesos LoRA sin fusionar según la model card |
| Idiomas soportados | napolitano (nap, primario), italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Método de ajuste | LoRA (r=16, alpha=32) vía Unsloth |
| Tamaño del archivo GGUF | ~5,5 GB |
| Tamaño del repo | 18,7 GB |
| Descargas / likes | 85 / 1 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 de Qwen2.5-7B-Instruct: transformer decoder-only denso con atención de causalidad completa, normalización RMSNorm, activación SwiGLU y sesgos QKV, además de RoPE para codificación posicional. No incorpora innovaciones arquitectónicas propias; toda la adaptación se realiza a nivel de pesos mediante LoRA con rango 16 y alpha 32, aplicado con Unsloth, que acelera y reduce el consumo de memoria del ajuste fino.

La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni detalles sobre la tokenización del napolitano (el tokenizer es el de Qwen2.5, sin vocabulario dialectal específico). Tampoco documenta hiperparámetros, épocas ni estrategia de validación. La única indicación cualitativa es que se entrenó para un registro informal, amistoso y deliberadamente soez, con el objetivo de preservar la autenticidad del dialecto. La cuantización Q4_K_M se aplica sobre los pesos fusionados (base + LoRA), aunque la model card menciona que los adaptadores originales también están disponibles.

## Capacidades

- Conversación multi-turno en napolitano con registro coloquial, irónico y ocasionalmente vulgar.
- Comprensión y generación en italiano estándar, heredada del modelo base.
- Generación de texto general, razonamiento y respuesta a preguntas, con la calidad reducida que impone la cuantización de 4 bits.
- Capacidad de código y matemáticas residual del modelo base Qwen2.5-7B-Instruct, no reforzada en el ajuste.
- Soporte de plantilla ChatML / Qwen (delimitadores `<|im_start|>` y `<|im_end|>`), documentado para LM Studio y Ollama.
- No se documenta soporte específico de tool calling, function calling ni razonamiento agéntico multi-paso en la model card; el modelo base sí lo soporta, pero el ajuste no lo garantiza.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Preservación y divulgación del napolitano: generación de diálogos, cuentos cortos o material didáctico en dialecto para escuelas, asociaciones culturales o proyectos de documentación lingüística, aprovechando el registro auténtico del ajuste.
- Chatbots de divulgación cultural: un asistente que explique historia, música o gastronomía napolitana (por ejemplo, la pizza o Maradona) respondiendo en napolitano coloquial, como ilustran los ejemplos de la model card.
- Prototipado de personajes conversacionales: personajes de videojuego, narrativa interactiva o teatro con voz dialectal napolitana, ejecutables en local con LM Studio u Ollama sin GPU dedicada.
- Traducción italiano-napolitano de apoyo: conversión de textos breves y coloquiales entre italiano estándar y napolitano para subtitulado, redes sociales o doblaje aficionado, con revisión humana obligatoria.
- Investigación en adaptación dialectal de LLM: caso de estudio reproducible de fine-tuning LoRA sobre Qwen2.5-7B con Unsloth para comparar estrategias de adaptación a lenguas de bajos recursos.
- Inferencia local en hardware modesto: despliegue en portátiles con CPU moderna o GPU de 6-8 GB gracias al GGUF de 4 bits, para demos y pruebas de concepto sin infraestructura cloud.
- Generación de contenido humorístico y de estilo: guiones, tuits o respuestas con tono napolitano mordaz, siempre que el contexto tolere lenguaje soez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,5-6,5 GB en Q4_K_M (tamaño del archivo más overhead de contexto y caché KV); con contextos largos (más de 8K tokens) la caché KV eleva el consumo de forma notable.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con 8 GB o más ejecuta el modelo con holgura.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM; con 6 GB funciona en configuraciones ajustadas o con offload parcial a CPU.
- CPU: viable en CPU modernas con llama.cpp u Ollama, con latencias de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama (con Modelfile y plantilla ChatML documentada), LM Studio (preset ChatML o Qwen), y servidores compatibles con endpoints OpenAI (`endpoints_compatible` en los tags).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| napoliAI-7B Q4_K_M | 7,6 B | 32.768 (heredado) | napolitano, italiano | Apache 2.0 | GGUF en Hugging Face, 85 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 | multilingüe (29+ idiomas) | Apache 2.0 | safetensors y GGUF, ampliamente desplegado |
| Qwen2.5-7B-Instruct GGUF (Q4_K_M) | 7,6 B | 32.768 | multilingüe | Apache 2.0 | múltiples repos comunitarios |
| Modelos dialectales italianos (p. ej. ajustes de Qwen/Llama para dialectos) | variable | variable | italiano y dialectos | variable | no disponible de forma consolidada |

La comparación directa con otros ajustes dialectales italianos no está disponible en la información proporcionada; napoliAI-7B se distingue por su especialización estrecha en napolitano frente a la cobertura multilingüe del modelo base.

## Limitaciones y advertencias

- Registro deliberadamente soez: el modelo emplea tacos y expresiones malsonantes por diseño, lo que lo hace inadecuado para entornos profesionales, educación infantil o atención al cliente sin filtrado previo.
- La propia model card desaconseja su uso para consejos médicos, legales o financieros.
- Riesgo de alucinación elevado en datos factuales (historia, personajes, cifras), agravado por el ajuste a un registro informal y por la cuantización de 4 bits.
- Cobertura lingüística limitada a napolitano e italiano; el rendimiento en otros idiomas no está documentado y probablemente se degrade.
- El tokenizer de Qwen2.5 no está adaptado al napolitano, lo que puede fragmentar palabras dialectales y afectar a la coherencia en textos largos.
- No hay información sobre sesgos demográficos, culturales o de género, ni sobre evaluación de seguridad.
- Sin benchmarks publicados: no es posible comparar su calidad objetiva frente al modelo base ni frente a alternativas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo base Qwen2.5-7B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Proyecto de autor individual con 85 descargas y 1 like: soporte, mantenimiento y actualizaciones no garantizados.
- El ajuste LoRA no refuerza tool calling ni capacidades agénticas; no asumir su funcionamiento fiable en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sbortetto/napoliAI-7B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
