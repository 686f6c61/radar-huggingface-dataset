# SirSahOl/Qwen3-1.7B-Base-chat-mlx-8bit

## Resumen

Qwen3-1.7B-Base-chat-mlx-8bit es una conversión cuantizada a 8 bits del modelo Qwen/Qwen3-1.7B-Base, publicada por el usuario SirSahOl y empaquetada en el formato nativo MLX de Apple para inferencia en GPU de chips Apple Silicon (familias M1 a M4). No se trata de un modelo entrenado desde cero, sino de una redistribución de pesos del modelo base de Qwen con plantilla de chat aplicada, pensada para ejecución local en Mac con memoria unificada. El repositorio ocupa 1,8 GB y declara 1.720.574.976 parámetros (aproximadamente 1,7 mil millones).

La relevancia de esta ficha es práctica: permite ejecutar un modelo de la familia Qwen3 en un portátil o equipo de sobremesa Apple sin dependencia de la nube, con un consumo de memoria activa declarado de unos 2,3 GB y velocidades estimadas de entre 77 y 231 tokens por segundo según el chip. La ventana de contexto nativa es de 32.768 tokens, extensible hasta 131.072 mediante escalado YaRN, y la licencia Apache 2.0 no impone restricciones de uso comercial.

Conviene señalar dos matices importantes desde el principio. El primero es que el punto de partida es un modelo base preentrenado (sufijo *Base*), no una versión ajustada por instrucciones, por lo que el comportamiento conversacional puede ser menos fiable que el de Qwen3-1.7B instruct. El segundo es que los metadatos indican una fecha de creación de 22 de septiembre de 2026, con 15 descargas y 0 likes, lo que sitúa al repositorio en un estado de validación comunitaria prácticamente nulo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only denso) |
| Parámetros totales | 1.720.574.976 (≈1,7B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; extensible a 131.072 con YaRN |
| Tipos de cuantización | 8 bits (media de 8,25 bits por peso) en este repositorio; el autor publica también variantes de 4 bits y 16 bits |
| Idiomas soportados | No disponible en la ficha del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (cuantizado a 8 bits); no se distribuye GGUF |
| Modelo base | Qwen/Qwen3-1.7B-Base (relación: cuantizado) |
| Framework de ejecución | MLX (Apple), librería mlx-lm |
| Tamaño del repositorio | 1,8 GB (tamaño en disco declarado: ~2,2 GB) |
| Memoria activa declarada | ~2,3 GB de memoria unificada |
| Memoria unificada mínima recomendada | 8 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso estándar implementado como Qwen3ForCausalLM, con normalización de tipo QK-Norm y la estructura general descrita en el informe técnico de Qwen3 (arXiv:2505.09388). Al tratarse de una conversión de pesos y no de un entrenamiento, en este repositorio no hay datos sobre el corpus de preentrenamiento, el número de tokens vistos, la composición del dataset ni las fases de alineamiento. Esas cifras corresponden al modelo original Qwen3-1.7B-Base y no se detallan en la información disponible.

La innovación técnica de este repositorio es exclusivamente la cuantización y el empaquetado: pesos en 8 bits con una media de 8,25 bits por peso, almacenados como safetensors en el formato que consume MLX, lo que permite cargar el modelo directamente en la GPU unificada de los chips Apple. El autor incluye además el ajuste necesario para que el modelo funcione como conversacional: una plantilla de chat (prefijos y sufijos `<|im_start|>` y `<|im_end|>`), tokens de parada recomendados y un Modelfile de ejemplo para Ollama. No se documenta ninguna técnica adicional como decodificación especulativa, atención lineal o decodificación por draft model.

## Capacidades

- Generación de texto autoregresiva en modo completación y en modo conversacional mediante plantilla de chat (`apply_chat_template`).
- Conversación multi-turno, con la salvedad de que el modelo de partida es una versión *Base* y no una versión ajustada por instrucciones.
- Generación de código y de texto técnico, limitada por el tamaño de 1,7B parámetros.
- Razonamiento de varios pasos y matemáticas básicas, sin datos de benchmarks que cuantifiquen el rendimiento real.
- Ejecución local completamente offline en hardware Apple Silicon, sin envío de datos a servicios externos.
- Integración con `mlx-lm` mediante CLI (`mlx_lm.chat`, `mlx_lm.generate`) y API de Python.
- Compatibilidad declarada con LM Studio y con Ollama mediante Modelfile con tokens de parada personalizados.
- Capacidades multilingües: no verificables con la información disponible, ya que la ficha del repositorio no declara lista de idiomas.
- *Tool calling* / *function calling*: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este repositorio.
- Visión, audio o modo de pensamiento explícito: no disponibles (el modelo es exclusivamente de texto).

## Casos de uso

- Asistente conversacional local en portátiles Mac: con 8 GB de memoria unificada y unos 2,3 GB de peso activo, el modelo permite mantener un chat interactivo en un MacBook Air o Pro base a velocidades estimadas de ~77 tokens/s, sin conexión a internet y sin coste por token.
- Autocompletado y generación de fragmentos de código en el IDE: al ejecutarse en la misma máquina donde se desarrolla, se puede integrar con editores mediante la API de Python de `mlx-lm`; el resultado debe revisarse porque el modelo parte de una base preentrenada y no de una versión instruct.
- Extracción de información por lotes: en chips Ultra (64-192 GB), la baja huella de memoria permite lanzar varias instancias en paralelo para procesar documentos, extraer entidades o clasificar correos, con velocidades estimadas de ~231 tokens/s por instancia.
- Pretratamiento y enrutado dentro de un pipeline mayor: usar este modelo de 1,7B para reformular consultas, resumir entradas largas o decidir a qué modelo mayor derivar cada petición, reduciendo el coste de los modelos de mayor tamaño.
- Prototipado y evaluación de flujos MLX: sirve como banco de pruebas para validar plantillas de prompt, tokens de parada y lógica de conversación antes de migrar a variantes de 4, 8 o 16 bits de mayor tamaño dentro del ecosistema MLX.
- Generación de borradores de texto: redacción de descripciones de producto, resúmenes de documentación interna o respuestas base que después se revisan por una persona, con la ventaja de que los datos no salen del dispositivo.
- Ajuste fino ligero con LoRA: `mlx-lm` permite entrenar adaptadores de bajo rango sobre los pesos cuantizados en Apple Silicon, lo que hace viable especializar el modelo en un dominio concreto (soporte técnico, terminología interna) sin infraestructura GPU dedicada.
- Aplicaciones con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para entornos sanitarios, legales o industriales donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente incluye estimaciones de rendimiento en hardware Apple Silicon, que se reproducen a continuación tal y como las publica el autor:

| Nivel de Apple Silicon | Memoria unificada | Memoria activa | Velocidad estimada | TTFT estimado | Uso recomendado por el autor |
|---|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 8 GB | ~2,3 GB | ~77 tokens/s | ~38 ms | Asistente interactivo diario y completados locales |
| M1 / M2 / M3 / M4 Pro | 18-36 GB | ~2,3 GB | ~116 tokens/s | ~26 ms | Programación, invocación de herramientas y chat multi-turno |
| M1 / M2 / M3 / M4 Max | 36-128 GB | ~2,3 GB | ~166 tokens/s | ~16 ms | Generación de alto rendimiento y orquestación de agentes |
| M1 / M2 / M3 Ultra | 64-192 GB | ~2,3 GB | ~231 tokens/s | ~11 ms | Concurrencia alta y extracción por lotes |

El propio autor indica que son proyecciones basadas en la saturación de ancho de banda de memoria para pesos de 8 bits, y que la velocidad real varía según la longitud del prompt. No son mediciones independientes ni comparables con resultados de benchmarks de calidad.

Comparativa de cuantizaciones publicada por el autor:

| Variante | Tamaño en disco | Huella de memoria | Hardware objetivo | Ventaja declarada |
|---|---|---|---|---|
| 4-bit MLX | ~1,3 GB | ~1,3 GB | M1/M2/M3/M4 con 8 GB o más | Máxima velocidad y mínimo consumo de RAM |
| 8-bit MLX (este repositorio) | ~2,2 GB | ~2,2 GB | M1/M2/M3/M4 Pro/Max con 16 GB o más | Equilibrio entre precisión y velocidad |
| 16-bit MLX | ~4,2 GB | ~4,2 GB | M2/M3/M4 Max/Ultra con 32 GB o más | Precisión sin cuantizar |

## Requisitos de hardware

- Memoria activa estimada para inferencia: ~2,3 GB de memoria unificada con pesos de 8 bits; el autor recomienda un mínimo de 8 GB de memoria unificada en el sistema.
- Espacio en disco: 1,8 GB de repositorio, ~2,2 GB declarados para la variante de 8 bits.
- GPU compatibles: exclusivamente chips Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). El formato MLX no se ejecuta en GPUs NVIDIA (RTX 4090, A100, H100) ni en ROCm.
- Para usar GPUs CUDA sería necesario recurrir a los pesos originales Qwen/Qwen3-1.7B-Base en bf16 y a un runtime distinto; esta conversión concreta no es utilizable en esas plataformas.
- Cabe holgadamente en cualquier Mac con 8 GB o más de memoria unificada, incluidos los modelos base de gama de entrada.
- Opciones de despliegue documentadas: `mlx-lm` mediante `mlx_lm.chat` y `mlx_lm.generate`, API de Python con plantilla de chat, LM Studio y Ollama mediante un Modelfile con tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` y temperatura 0,7.
- vLLM y TGI no soportan pesos MLX de forma nativa; pese a las etiquetas `text-generation-inference` y `endpoints_compatible` del repositorio, para servir este modelo en esas plataformas habría que reconvertir los pesos.
- Latencia y throughput: los únicos datos disponibles son las estimaciones del autor recogidas en el apartado anterior (TTFT de 38 ms a 11 ms y entre 77 y 231 tokens/s según el chip). No hay mediciones de latencia reales ni pruebas con prompts largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma | Disponibilidad |
|---|---|---|---|---|---|
| SirSahOl/Qwen3-1.7B-Base-chat-mlx-8bit (este) | 1,72B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors MLX 8 bits | Apple Silicon; 15 descargas, 0 likes |
| SirSahOl/Qwen3-1.7B-Base-chat-mlx-4bit | No disponible en la información (mismo modelo base) | No disponible en la información | Apache 2.0 | MLX 4 bits | Apple Silicon; enlace publicado por el autor |
| SirSahOl/Qwen3-1.7B-Base-chat-mlx-16bit | No disponible en la información (mismo modelo base) | No disponible en la información | Apache 2.0 | MLX 16 bits | Apple Silicon; enlace publicado por el autor |
| Qwen/Qwen3-1.7B-Base | 1,72B | 32.768 | Apache 2.0 | safetensors (bf16), portable a GGUF, vLLM, TGI | Amplia distribución en HuggingFace |

Como alternativas de tamaño similar en el ecosistema abierto se suelen considerar modelos de la clase 1B-2B (por ejemplo, de las familias Llama, Gemma o SmolLM), pero no se dispone de datos verificados de sus fichas en la información proporcionada, por lo que no se incluyen cifras comparativas de parámetros, contexto ni rendimiento. Tampoco hay resultados de benchmarks que permitan comparar la calidad de este modelo con la de sus alternativas.

## Limitaciones y advertencias

- El modelo de partida es Qwen3-1.7B-Base, una versión preentrenada y no ajustada por instrucciones. Aunque el repositorio incluye plantilla de chat y tokens de parada, el seguimiento de instrucciones y la calidad conversacional pueden ser notablemente inferiores a los de las versiones instruct de la familia Qwen3.
- El autor advierte de la posibilidad de bucles de generación si no se configuran correctamente los tokens de parada (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`). Sin esa configuración, en producción se pueden producir respuestas que no terminan.
- Riesgo de alucinación elevado por el tamaño reducido (1,7B parámetros). No debe usarse como fuente de verdad en dominios factuales (medicina, derecho, finanzas) sin verificación humana.
- No se han publicado resultados de benchmarks ni evaluaciones independientes; la calidad real del modelo no está cuantificada. El repositorio acumula 15 descargas y 0 likes, sin señal de validación por parte de la comunidad.
- La lista de idiomas soportados no está declarada en la ficha. No se puede asumir un rendimiento multilingüe equivalente al del modelo original sin verificarlo.
- La ventana de 32.768 tokens es la nativa; la extensión a 131.072 tokens requiere configuración de escalado YaRN, que no se detalla en la información disponible y suele degradar la calidad si no se ajusta correctamente.
- Los pesos están en formato MLX, que solo se ejecuta en Apple Silicon. No hay soporte nativo en CUDA ni en runtimes como vLLM o TGI, lo que limita su uso en servidores con GPU NVIDIA. Las etiquetas `text-generation-inference` y `endpoints_compatible` del repositorio no implican compatibilidad real con esos servidores.
- Las cifras de velocidad y TTFT son estimaciones del propio autor basadas en ancho de banda de memoria, no mediciones reproducibles; la velocidad real depende de la longitud del prompt y de la carga del sistema.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones adicionales conocidas, siempre que se conserve el aviso de licencia y la atribución correspondiente. Al derivar de Qwen3-1.7B-Base, se heredan las condiciones de ese repositorio, también Apache 2.0.
- Las fechas de los metadatos (creación y actualización el 22 de septiembre de 2026) y el bajo número de descargas sugieren un artefacto reciente y poco probado; se recomienda validar el comportamiento antes de integrarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SirSahOl/Qwen3-1.7B-Base-chat-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Variante de 4 bits: https://huggingface.co/SirSahOl/Qwen3-1.7B-Base-chat-mlx-4bit
- Variante de 16 bits: https://huggingface.co/SirSahOl/Qwen3-1.7B-Base-chat-mlx-16bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Informe técnico de Qwen3 (referenciado en las etiquetas): https://arxiv.org/abs/2505.09388
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Nota: la búsqueda web realizada no devolvió resultados relevantes (únicamente páginas genéricas de Facebook), por lo que no se añaden enlaces adicionales a papers, blogs o demos.
