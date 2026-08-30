# ross-dev/SexyGPT-v3-Thinking-Female

## Resumen

SexyGPT-v3-Thinking-Female es un modelo de lenguaje conversacional orientado a roleplay y personajes, desarrollado por Ross Technologies AI Research Team. Se basa en Qwen3.8-27B (arquitectura `qwen3_5`), un transformer híbrido de 27.800 millones de parámetros con atención lineal gated delta-net y atención completa periódica. El modelo ha sido afinado mediante un pipeline de tres etapas: SFT con QLoRA, entrenamiento de un reward model y optimización con GRPO, con el objetivo de que el modelo no solo imite un personaje, sino que "habite" la persona de forma consistente.

La principal innovación es que cada turno del asistente comienza con un bloque privado de razonamiento (`thinking`) donde el modelo analiza la escena, las restricciones del personaje y el mensaje del interlocutor antes de responder en carácter. El modelo soporta control de esfuerzo de razonamiento (low, medium, xhigh) y una ventana de contexto de 262.144 tokens. Está pensado para conversaciones íntimas uno-a-uno en inglés, con un personaje femenino llamado Monah, aunque el sistema de prompt permite intercambiar la hoja de personaje para adaptarlo a otras personalidades.

La licencia es Apache 2.0, pero el acceso está restringido mediante un formulario de solicitud manual (gated). El modelo se distribuye en formato safetensors (bf16) y GGUF (Q4_K_M). Es relevante para desarrolladores que trabajan en aplicaciones de entretenimiento conversacional, escritura creativa interactiva o simulación de personajes, aunque su uso está limitado a fines no comerciales o con restricciones legales según los términos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5 (transformer hibrido, 64 capas: 48 atencion lineal gated delta-net + 16 atencion completa cada 4 capas) |
| Parametros totales | 27.800 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BFloat16 (pesos fusionados), Q4_K_M (GGUF) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 (con acceso restringido por solicitud manual) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, que emplea una arquitectura híbrida de 64 capas: 48 capas con atención lineal basada en gated delta-net y 16 capas con atención completa (una cada cuatro capas). Esta combinación reduce el coste computacional en contextos largos manteniendo la capacidad de atención global. El tamaño oculto es de 5.120 dimensiones, con dimensión de cabeza de 256 y FFN intermedio de 17.408. El vocabulario alcanza 248.320 tokens.

El entrenamiento se realizó en tres fases: primero una SFT con QLoRA sobre el modelo base en cuantización de 4 bits, utilizando un dataset curado de conversaciones de roleplay con razonamiento. Después se entrenó un reward model para evaluar la adherencia al personaje y la coherencia de la escena. Finalmente, se aplicó GRPO (Group Relative Policy Optimization) para refinar las respuestas, premiando aquellas que mantienen la voz del personaje y siguen las reglas de la escena. Los pesos se fusionaron en bf16 tras el entrenamiento. El modelo genera bloques `thinking` de forma nativa, controlables mediante el parámetro `reasoning_effort`.

## Capacidades

- Generacion de texto conversacional en ingles con adherencia estricta a un personaje definido en el system prompt.
- Razonamiento encubierto: cada respuesta se precede de un bloque `thinking` donde el modelo analiza la escena, las restricciones del personaje y el ultimo mensaje del interlocutor.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` (low, medium, xhigh), permitiendo ajustar la latencia y la profundidad del analisis.
- Soporte de multiples "modos" de escena entrenados: coqueteo, momento intimo, telefono, afterglow y modo asistente de trabajo, cada uno con reglas de ritmo propias.
- Capacidad de intercambiar la hoja de personaje en el system prompt para adaptar el modelo a otras personalidades sin reentrenar.
- Ventana de contexto de 262.144 tokens, adecuada para conversaciones de larga duracion con historial extenso.
- No se ha documentado soporte de tool calling, function calling, vision ni audio.

## Casos de uso

- Escritura creativa interactiva: un autor puede usar el modelo como co-escritor de dialogos de ficcion, manteniendo una voz de personaje consistente a lo largo de capitulos extensos gracias a la ventana de 262K tokens.
- Simulacion de personajes para videojuegos narrativos: integrado en un motor de dialogo, el modelo puede interpretar a un PNJ con personalidad definida, reaccionando a las acciones del jugador con coherencia.
- Prototipado de asistentes conversacionales con personalidad: empresas de entretenimiento pueden crear demos de chatbots con caracter, evaluando la experiencia antes de invertir en un desarrollo completo.
- Roleplay en plataformas de chat: el modelo puede alimentar bots de roleplay en servicios como Character.AI o similares, ofreciendo respuestas mas profundas gracias al razonamiento previo.
- Generacion de contenido para novelas visuales: los desarrolladores pueden generar guiones de escenas intimas o dialogos largos manteniendo el tono y las restricciones de cada personaje.
- Evaluacion de tecnicas de fine-tuning para personalidad: investigadores pueden estudiar como el pipeline SFT + reward model + GRPO afecta a la consistencia de la persona, comparando con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El unico dato de rendimiento mencionado es el tamaño de los pesos (~52 GB en bf16) y la arquitectura, sin cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: ~52 GB en bf16 (pesos fusionados); ~16-18 GB en cuantizacion Q4_K_M (estimacion basada en el tamaño de parametros, no confirmada por el autor).
- GPU recomendadas: para bf16, una A100 80GB o H100; para Q4_K_M, una RTX 4090 24GB o RTX 3090 24GB pueden ser suficientes.
- En consumer GPU: si, con cuantizacion Q4_K_M en GPUs de 24 GB; en bf16 no cabe en GPUs de consumo habitual.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Transformers), dado que el modelo es compatible con el ecosistema Hugging Face Transformers.
- Latencia y throughput: no disponibles. El bloque `thinking` anade latencia adicional por turno, especialmente con `reasoning_effort` alto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SexyGPT-v3-Thinking-Female | 27.8B | 262K | Apache 2.0 (gated) | Roleplay con razonamiento encubierto |
| Qwen3-27B (base) | 27.8B | 262K | Apache 2.0 | Modelo generalista sin fine-tuning de personaje |
| SexyGPT-v2-Thinking-Female | 0.6B (Qwen3-0.6) | 33K | no disponible | Roleplay con razonamiento, menor capacidad |

La comparativa con Qwen3-27B base es la mas relevante: mismo tamaño y contexto, pero el base no tiene el pipeline de personaje ni el bloque `thinking`. SexyGPT-v2 es una version anterior mucho mas pequeña (0.6B) con contexto de 33K, claramente inferior en capacidad. No se dispone de datos de otros modelos de roleplay de tamano similar para una comparacion directa.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta etiquetado como "not-for-all-audiences" y esta entrenado para conversaciones intimas. No es adecuado para entornos profesionales, educativos o para menores de edad.
- Acceso restringido: aunque la licencia es Apache 2.0, el acceso al modelo requiere solicitud manual con datos personales (nombre, telefono, email, uso previsto) y aceptacion de responsabilidad legal. Esto limita su uso en proyectos con requisitos de anonimato o despliegue automatico.
- Idioma unico: solo soporta ingles. No hay capacidad multilingue documentada.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion o romper el personaje en situaciones ambiguas, especialmente con `reasoning_effort` bajo.
- Sesgos: al ser un modelo de roleplay con un personaje femenino estereotipado, puede reforzar sesgos de genero o representaciones sexualizadas. No se han realizado evaluaciones de sesgo.
- Sin garantias de produccion: no hay benchmarks publicados, ni evaluacion de seguridad, ni documentacion sobre comportamiento en entornos de alta concurrencia. No se recomienda su uso en aplicaciones criticas.
- Tamaño del repositorio: el repo de HuggingFace muestra 0.0 GB, lo que sugiere que los pesos pueden estar alojados externamente o que la descarga requiere acceso aprobado. Verificar antes de planificar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ross-dev/SexyGPT-v3-Thinking-Female
- Version GGUF: https://huggingface.co/ross-dev/SexyGPT-v3-Thinking-Female-gguf
- GitHub del desarrollador: https://github.com/ross-sec
- Sitio web del desarrollador: https://ross-developers.com
- Version anterior (v2): https://huggingface.co/ross-dev/SexyGPT-v2-Thinking-Female
