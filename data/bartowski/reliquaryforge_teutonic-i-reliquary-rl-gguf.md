# bartowski/ReliquaryForge_Teutonic-I-Reliquary-RL-GGUF

## Resumen

Teutonic-I-Reliquary-RL es un modelo de generación de texto de unos 9B parámetros (8.953.803.264 exactos según el checkpoint en safetensors) desarrollado por ReliquaryForge, un equipo vinculado al ecosistema de Bittensor. El modelo ha sido entrenado con aprendizaje por refuerzo (RL), como indica su propio nombre, y utiliza el formato de prompt ChatML con soporte de razonamiento mediante etiquetas `<think>`, lo que sugiere un enfoque de razonamiento explícito estilo "thinking mode".

La ficha que se presenta aquí corresponde a la cuantización GGUF publicada por bartowski, un cuantizador muy conocido en la comunidad de llama.cpp, que ofrece versiones desde BF16 completo hasta cuantizaciones agresivas con matriz de importancia (imatrix). Esto hace que el modelo sea especialmente relevante para usuarios que quieren ejecutar modelos de razonamiento en hardware de consumo, ya que la versión Q4_K_M ocupa solo 5,84 GB.

El modelo se posiciona en la categoría de LLM conversacionales compactos con capacidades de razonamiento y tool calling, un segmento muy competitivo donde modelos como Qwen3 de 8B o similares dominan actualmente. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para integración en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (datos adicionales no disponibles) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S (y otras cuantizaciones inferiores en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado por bartowski); checkpoint original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de aproximadamente 9B parámetros. Según la model card de bartowski, no soporta decodificación especulativa y acepta entrada exclusivamente de texto (sin capacidades multimodales). El sufijo "RL" y el tag de "reinforcement-learning" indican que el modelo ha pasado por una fase de entrenamiento con aprendizaje por refuerzo sobre un checkpoint base, probablemente para mejorar razonamiento y seguimiento de instrucciones, aunque los detalles del método (GRPO, PPO, DPO u otro) no están disponibles en la información proporcionada.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el tamaño de la ventana de contexto. El uso del formato ChatML con apertura de bloque `<think>` sugiere que el entrenamiento en RL incluyó trazas de razonamiento, una técnica habitual en modelos de la generación reciente para mejorar el rendimiento en matemáticas y lógica.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag "conversational")
- Razonamiento explícito mediante bloques `<think>` en el formato de prompt
- Tool calling / function calling con formato XML anidado (`<tool_call>` y `<function=...>`), con soporte para definiciones de herramientas en el system prompt
- Razonamiento multi-paso previo a llamadas a funciones (puede incluir razonamiento en lenguaje natural antes de la llamada, pero no después)
- Entrada exclusivamente textual; sin soporte de visión o audio según la model card
- Capacidades multilingües: no documentadas

## Casos de uso

- Chatbots y asistentes conversacionales locales: con el formato ChatML y la versión Q4_K_M (5,84 GB) puede ejecutarse en portátiles y sobremesas sin GPU dedicada, ideal para asistentes privados sin envío de datos a la nube.
- Agentes con herramientas: el soporte de tool calling con formato estructurado permite integrarlo en frameworks de agentes (LangChain, llama.cpp con grammar, etc.) para consultar APIs, bases de datos o servicios externos.
- Razonamiento y resolución de problemas: el bloque `<think>` permite obtener trazas de razonamiento antes de la respuesta final, útil en tareas de lógica, planificación y matemáticas donde se quiere auditar el proceso.
- Prototipado de aplicaciones LLM: al ser GGUF, se despliega fácilmente con Ollama o LM Studio para validar ideas antes de escalar a modelos mayores.
- Procesamiento de texto en pipelines offline: su tamaño contenido y licencia Apache 2.0 permiten integrarlo en flujos de resumen, clasificación o transformación de texto en entornos sin conexión.
- Experimentación en el ecosistema Bittensor/subredes: al provenir de un equipo vinculado a Bittensor, puede ser relevante para participantes que evalúen modelos de esa red.
- Generación de código asistida: aunque no hay benchmarks publicados, los modelos de esta clase con RL sobre instrucciones suelen manejar razonablemente tareas de programación de complejidad media; conviene validar en cada caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (tamaño de archivo, más contexto):
  - bf16: ~18 GB
  - Q8_0: ~9,6 GB
  - Q6_K: ~7,8 GB
  - Q5_K_M: ~6,9 GB
  - Q4_K_M: ~5,8 GB (recomendada por el cuantizador como equilibrio)
  - Cuantizaciones inferiores (Q4_K_S, IQ4_NL, Q3/Q2): progresivamente menos
- GPU recomendadas: una RTX 4090 (24 GB) ejecuta cómodamente hasta Q8_0 con contexto amplio; una RTX 3060 de 12 GB cubre Q6_K; una RTX 4060 de 8 GB cubre Q4_K_M.
- Consumer GPUs: sí, cualquier GPU con 6-8 GB de VRAM (o 16 GB de RAM en modo CPU/offload) ejecuta la versión Q4_K_M.
- Opciones de despliegue: llama.cpp (versión b11845 o superior, usada para la cuantización), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. Para servidores con API, llama-server de llama.cpp es la vía directa.
- Latencia y throughput: no disponible; al no soportar decodificación especulativa, el rendimiento depende exclusivamente del runtime y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Teutonic-I-Reliquary-RL | ~9B | No disponible | Apache 2.0 | RL, thinking mode, tool calling, GGUF disponible |
| Qwen3-8B | 8B | 128K (nativo, ampliable) | Apache 2.0 | Thinking mode hibrido, tool calling, multilingüe (119 idiomas), benchmarks publicados |
| Llama 3.1 8B Instruct | 8B | 128K | Llama Community License | Sin thinking mode nativo, amplio ecosistema, restricciones menores de licencia |

Teutonic-I-Reliquary-RL compite en la franja de 8-9B con licencia Apache 2.0, igual que Qwen3-8B, pero carece de documentación pública de benchmarks y contexto, lo que dificulta la evaluación objetiva frente a alternativas consolidadas. Su ventaja diferencial sería el entrenamiento RL específico del equipo de ReliquaryForge, cuyo rendimiento real debe validarse empíricamente.

## Limitaciones y advertencias

- No hay benchmarks públicos ni model card detallada del modelo original, por lo que su calidad real respecto a alternativas equivalentes es difícil de verificar; se recomienda evaluación propia antes de uso en producción.
- Sesgos conocidos: no documentados; como todo LLM entrenado con datos web, puede reproducir sesgos presentes en su corpus.
- Riesgo de alucinación: inherente a modelos de este tamaño; el bloque `<think>` puede ayudar a detectar razonamientos defectuosos pero no elimina el riesgo.
- Longitud de contexto e idiomas soportados no documentados: verificar empíricamente antes de depender de contextos largos o idiomas distintos del inglés.
- Sin soporte multimodal: solo texto.
- Sin decodificación especulativa según la model card del cuantizador.
- Licencia Apache 2.0 sin restricciones para uso comercial, pero conviene revisar cualquier término del modelo base original en su repositorio.
- Al ser un cuantizado de terceros (bartowski), cualquier problema de calidad derivado de la cuantización debe atribuirse a ese proceso y no al checkpoint original.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/bartowski/ReliquaryForge_Teutonic-I-Reliquary-RL-GGUF
- Modelo original: https://huggingface.co/ReliquaryForge/Teutonic-I-Reliquary-RL
- llama.cpp (herramienta de cuantización y runtime): https://github.com/ggml-org/llama.cpp
- Release de llama.cpp usada (b11845): https://github.com/ggml-org/llama.cpp/releases/tag/b11845
- Paper, blog y demos: no disponibles
