# ETME-TECH/EliasAIv4

## Resumen

EliasAI v4 es un ajuste fino (fine-tune) del modelo Qwen2.5-7B desarrollado por Elias Rickert bajo el sello ETME TECH. Se trata de un modelo de generación de texto orientado exclusivamente a la conversación en alemán, con una personalidad definida (una IA masculina con tono "terrenal") y un modo de razonamiento interno en etiquetas `<think>...</think>` antes de emitir la respuesta final. El modelo se distribuye tanto en pesos completos fusionados en bfloat16 (safetensors) como en una cuantización GGUF Q8_0 lista para llama.cpp, LM Studio y Ollama.

Arquitectónicamente hereda el transformer decoder-only de Qwen2.5-7B, con 7.615.616.512 parámetros totales según los safetensors del repositorio. El entrenamiento se realizó con QLoRA de 4 bits sobre aproximadamente 24.000 diálogos alemanes curados, e incorpora técnicas poco habituales como ruido NEFTune en los embeddings, ponderación diferencial de la pérdida por segmentos y una calibración convexa de la cabeza EOS para el token `<|im_end|>`.

Su relevancia es acotada y muy específica: no compite en benchmarks generales ni pretende ser un modelo de propósito general. El propio autor advierte que el modelo no sabe matemáticas y no está pensado para conocimiento factual, programación ni cálculos. Es un modelo de nicho para conversación empática y consistencia de personaje en alemán, con licencia Apache 2.0 que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune de Qwen2.5-7B |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en el ejemplo de despliegue; entrenado con MAX_SEQ_LENGTH=2048 |
| Tipos de cuantizacion | Q8_0 (GGUF incluido); bfloat16 (pesos fusionados) |
| Idiomas soportados | Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B, un transformer decoder-only con atención completa estándar, y se ajusta mediante QLoRA de 4 bits (NF4, cómputo en BFloat16, optimizador `paged_adamw_8bit`), fusionándose después en bfloat16. La configuración LoRA emplea `r=32`, `lora_alpha=64` y `lora_dropout=0.05` sobre las proyecciones `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`. El dataset consiste en aproximadamente 24.000 diálogos alemanes curados, tanto de un solo turno como multi-turno, cubriendo conversación cotidiana, small talk, subtexto emocional expresado con emoticonos, charla técnica e identidad del personaje.

Las innovaciones técnicas documentadas son tres. Primero, ruido NEFTune en los embeddings con `alpha=5.0`, que actúa como regularizador y suele mejorar la calidad del diálogo. Segundo, ponderación diferencial de la pérdida: el contenido dentro de `<think>` se pondera a 0.70x, la respuesta final a 1.40x y los tags junto con `<|im_end|>` a 2.20x, lo que empuja al modelo a priorizar la respuesta y a cerrar correctamente los turnos. Tercero, una calibración convexa de la cabeza EOS para el token `<|im_end|>` (ID 151645), ya integrada en los pesos fusionados y en la GGUF, que reduce el riesgo de respuestas truncadas o de continuación indebida del turno. El entrenamiento se ejecutó en una única NVIDIA RTX 4070 de 12 GB, con longitud de secuencia 2048, batch efectivo de 16, tasa de aprendizaje 1e-4 con decaimiento coseno y una sola época.

## Capacidades

- Generación de texto conversacional en alemán con un estilo de personaje definido y persistente.
- Razonamiento interno previo a la respuesta mediante bloques `<think>...</think>` en alemán, útil para interpretar tono, contexto y emoticonos.
- Interpretación de subtexto emocional y señales paralingüísticas textuales (por ejemplo `:(((`, `:/`).
- Conversación multi-turno con mantenimiento de contexto dentro de la ventana configurada.
- Formato de chat ChatML (`<|im_start|>role\ncontent<|im_end|>`).
- No soporta de forma fiable matemáticas, conocimiento factual, programación ni tool calling; el autor lo excluye explícitamente de esos usos.
- No se documentan capacidades de visión, audio ni agentes.

## Casos de uso

- Compañero conversacional en alemán: el modelo está entrenado para escuchar y responder en 3 a 6 frases con tono cálido, sin ofrecer consejos no solicitados ni listas de recomendaciones, lo que encaja en aplicaciones de acompañamiento o diario personal.
- Personaje consistente en productos de entretenimiento: la combinación de system prompt fijo, temperatura 0.55 y top-p 0.90 permite mantener una voz estable a lo largo de sesiones largas, adecuada para novelas visuales o chatbots de rol.
- Análisis de subtexto emocional en mensajes de usuario: el bloque `<think>` fuerza al modelo a razonar primero sobre el estado de ánimo implícito antes de contestar, lo que resulta útil en moderación asistida o en triaje de mensajes de soporte emocional.
- Prototipado rápido en local: la GGUF Q8_0 se ejecuta con `llama-server -ngl 99 -c 4096` en una GPU de consumo, lo que permite validar experiencias conversacionales sin infraestructura cloud.
- Investigación sobre control de estilo y personalidad: la ponderación diferencial de pérdida y la calibración EOS son técnicas reproducibles que sirven como referencia para experimentos de ajuste fino con QLoRA en alemán.
- Base para nuevos fine-tunes en alemán: al estar bajo Apache 2.0 y distribuirse en safetensors fusionados, se puede partir de él para especializaciones verticales manteniendo el tono conversacional aprendido.
- Evaluación de calidad de diálogo en alemán: útil como línea base de un modelo de nicho frente a modelos generalistas en métricas humanas de naturalidad y coherencia de personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 15-16 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPU de 24 GB o superior para contexto completo.
- VRAM estimada en GGUF Q8_0: aproximadamente 8-9 GB para pesos, lo que deja margen para caché KV en tarjetas de 12 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para bfloat16; RTX 4070 (12 GB) o RTX 3060 de 12 GB para Q8_0 con `-ngl 99`.
- Cabe en GPU de consumo: sí, con la cuantización Q8_0 en tarjetas de 12 GB; en bfloat16 queda ajustado en 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama y transformers con el formato ChatML; el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`.
- Parámetros de inferencia recomendados por el autor: temperatura 0.55, top-p 0.90, top-k 40, repeat penalty 1.06 y `--reasoning-format deepseek` para separar el bloque de razonamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| EliasAI v4 | 7,6 B | 4096 (despliegue) / 2048 (entrenamiento) | Alemán | Apache 2.0 | Conversación con personaje, alemán |
| Qwen2.5-7B (base) | 7,6 B | 32.768 (nativo) | Multilingüe | Apache 2.0 | Propósito general |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 (nativo) | Multilingüe | Apache 2.0 | Instrucciones y chat general |
| Modelos alemanes tipo Llama-3-8B fine-tune | ~8 B | 8192 | Alemán/multilingüe | variable | Conversación en alemán |

La comparación con el modelo base es la más informativa: EliasAI v4 sacrifica amplitud de conocimiento y capacidades matemáticas o de código a cambio de consistencia de personaje y naturalidad conversacional en alemán. Frente a Qwen2.5-7B-Instruct, la ventana de contexto efectiva es menor y el alcance lingüístico se limita al alemán. No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo con alternativas.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no sabe matemáticas y no está diseñado para conocimiento factual, programación ni cálculos; usarlo para esas tareas produce resultados poco fiables.
- Riesgo de alucinación elevado en cualquier consulta que requiera datos verificables, ya que el entrenamiento se centró en diálogo y no en hechos.
- Sesgos: al entrenarse sobre unos 24.000 diálogos curados por un único autor, puede heredar sesgos de estilo, perspectiva y selección de temáticas de ese corpus; no se documentan evaluaciones de sesgo.
- Limitación idiomática estricta al alemán; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Ventana de contexto efectiva reducida: entrenado con 2048 tokens y desplegado con 4096, insuficiente para documentos largos o conversaciones muy extensas.
- La calibración EOS está ligada al token `<|im_end|>` (ID 151645); alterar el formato de chat o el tokenizador puede degradar el cierre de turnos.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-7B conviene conservar los avisos de atribución correspondientes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación independiente.
- El prompt de sistema y los parámetros de muestreo forman parte del comportamiento esperado; desviarse de ellos (temperaturas altas, ausencia de system prompt) puede romper la consistencia del personaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ETME-TECH/EliasAIv4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- NEFTune (paper): https://arxiv.org/abs/2310.05914
