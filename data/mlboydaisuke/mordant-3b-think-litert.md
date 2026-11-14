# mlboydaisuke/Mordant-3B-Think-LiteRT

## Resumen

Mordant-3B-Think-LiteRT es la conversión on-device del modelo Kezmark/Mordant-3B-Think, un fine-tune completo de ibm-granite/granite-4.1-3b orientado a la composición de prompts para generación de imágenes mediante razonamiento en cadena de pensamiento (chain-of-thought). El paquete lo publica el usuario mlboydaisuke y no modifica los pesos del modelo original: únicamente los empaqueta en formato `.litertlm` para el runtime LiteRT-LM de Google AI Edge, con el objetivo de ejecutarlo en teléfonos y equipos de escritorio sin conexión a servicios en la nube.

La relevancia de esta ficha está en el formato: LiteRT-LM es una vía para desplegar modelos de 3B parámetros en Android y macOS con aceleración GPU, algo que los formatos GGUF o los servidores de inferencia tradicionales no cubren con la misma integración en apps móviles. El bundle incluye una cuantización int8 dinámica de 3,76 GB y requiere litert-lm ≥ 0.16.

El modelo base es un transformer denso de 3B parámetros con licencia Apache 2.0, especializado en generar prompts de imagen con un bloque `<think>` previo. La conversión preserva la plantilla de chat original y elimina el token de inicio espurio que, según el autor, provoca bucles de repetición en el checkpoint bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de ibm-granite/granite-4.1-3b) |
| Parametros totales | 3B (aproximado, según el nombre del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | int8 dinámica (linears + embedding); único archivo publicado |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamaño del repo 7,5 GB, bundle int8 de 3,76 GB |

## Arquitectura y entrenamiento

El modelo base Mordant-3B-Think es un fine-tune completo (no LoRA) de ibm-granite/granite-4.1-3b, un transformer denso de 3B parámetros. El ajuste se orienta a una tarea concreta: componer prompts para generación de imágenes con un razonamiento previo explícito, de modo que la plantilla de chat abre el turno del asistente con `<think>` y el modelo emite un bloque `<think>…</think>` antes del prompt final. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La conversión a LiteRT-LM se realizó con la herramienta hf-to-litertlm en un solo comando (2026-08-25). El proceso conserva la plantilla de chat del fine-tune de forma byte a byte (1474/1474 respecto a `chat_template.jinja`), elimina el token de inicio que el runtime anteponía —la familia declara `bos == eos == <|end_of_text|>`, por lo que un BOS añadido se interpreta como fin de documento y provocaba un bucle de bloques de código en la salida greedy bf16— y reduce la escalera de firmas de prefill a 7 firmas con embedder externalizado, ya que la escalera completa de 11 firmas provoca el cierre de la app en iOS durante la inicialización de Metal. El autor reporta una puerta de calidad de 8/8 en un conjunto de 8 preguntas de sanidad.

## Capacidades

- Generación de prompts para modelos de imagen: produce un bloque de razonamiento `<think>…</think>` seguido del prompt compuesto, que es su función principal.
- Razonamiento en cadena de pensamiento: el modo thinking está siempre activo y no puede desactivarse en este bundle.
- Generación de texto general, heredada del modelo base Granite 4.1 3B.
- Ejecución on-device: inferencia local en CPU y GPU mediante LiteRT-LM, sin dependencia de red.
- Procesamiento de image-prompt: la etiqueta `image-prompt` indica que la entrada típica es una descripción de imagen que el modelo expande.
- Idiomas: únicamente inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible; el flujo descrito es de un único turno con razonamiento interno.
- Visión o audio: no disponible; el pipeline es text-generation.

## Casos de uso

- Composición de prompts para generación de imágenes en apps móviles: el usuario escribe una descripción breve y el modelo devuelve un prompt detallado con razonamiento previo, todo ejecutado en el dispositivo con LiteRT-LM y sin enviar datos a un servidor.
- Asistentes creativos offline en Android: integrado en una app que embebe el motor LiteRT-LM (por ejemplo, hosts tipo Google AI Edge Gallery), permite generar prompts de imagen en modo avión o en entornos sin conectividad.
- Herramientas de escritorio para artistas y diseñadores: en macOS con backend GPU, el modelo alcanza 71,9 tok/s de decodificación y 0,24 s de TTFT en un M4 Max, suficiente para una experiencia interactiva de sugerencia de prompts.
- Prototipado de pipelines de imagen: dado que el modelo separa el razonamiento del prompt final, se puede parsear el bloque `<think>` para auditar por qué se eligieron ciertos términos y usar solo el texto posterior como entrada del generador de imágenes.
- Privacidad en flujos creativos sensibles: al ejecutarse localmente, las descripciones del usuario no salen del dispositivo, lo que encaja en entornos con requisitos de confidencialidad.
- Evaluación de runtimes on-device: sirve como banco de pruebas para medir prefill, decode y TTFT de un modelo de 3B en hardware móvil y comparar backends CPU frente a GPU.
- Educación y demos de razonamiento: el bloque `<think>` visible permite mostrar a estudiantes o usuarios cómo un modelo descompone una instrucción breve en un prompt estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de inferencia medidas en Apple M4 Max con litert-lm 0.16.0, `-p 256 -d 256 --runs 3 --cache no`:

| Backend | Prefill (tok/s) | Decode (tok/s) | TTFT |
|---|---:|---:|---:|
| CPU | 97,3 | 20,2 | 2,68 s |
| GPU | 1129 | 71,9 | 0,24 s |

Como puerta de calidad, el autor reporta 8/8 en un conjunto de 8 preguntas de sanidad con presupuesto de thinking, sin salidas degeneradas.

## Requisitos de hardware

- VRAM/RAM: el bundle int8 ocupa 3,76 GB en disco; se necesita al menos esa cantidad de memoria libre para cargarlo, más el espacio de trabajo del runtime y la caché KV.
- GPU recomendadas: el autor mide en Apple M4 Max con backend GPU (Metal). No se proporcionan datos para A100, H100 ni RTX 4090; el formato LiteRT-LM está orientado a dispositivos móviles y equipos de escritorio, no a servidores con GPU de datacenter.
- GPU de consumo: cabe en hardware Apple Silicon de gama alta (M4 Max medido); en Android se ejecuta mediante apps que embeben el motor LiteRT-LM. No hay datos publicados para GPUs NVIDIA de consumo.
- Despliegue: LiteRT-LM ≥ 0.16 (CLI `litert-lm run`), con integración en apps Android (Kotlin, C++) y web. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.litertlm` es específico del runtime.
- Latencia y throughput: en M4 Max, TTFT de 0,24 s y 71,9 tok/s en GPU; 2,68 s y 20,2 tok/s en CPU. En móviles no se aportan cifras.
- Nota operativa: en litert-lm 0.18.x y 0.19.0, una llamada bloqueante `send_message` que siga generando tras 10 minutos falla con `DEADLINE_EXCEEDED` y puede provocar el cierre del proceso; conviene usar `send_message_async` o reducir `max_output_tokens`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Mordant-3B-Think-LiteRT | 3B | no disponible | `.litertlm` (int8) | Apache 2.0 | Prompts de imagen on-device con thinking |
| Kezmark/Mordant-3B-Think | 3B | no disponible | safetensors (bf16) | Apache 2.0 | Modelo original, pensado para servidor/escritorio |
| ibm-granite/granite-4.1-3b | 3B | no disponible | safetensors, GGUF | Apache 2.0 | Modelo generalista base |

La comparación con alternativas de la misma categoría (modelos de 3B para prompts de imagen en formato móvil) no está disponible en la información proporcionada. La diferencia principal frente a su modelo base es el formato y la cuantización: el bundle LiteRT-LM permite ejecución local en móvil, mientras que el checkpoint original requiere un stack de inferencia convencional.

## Limitaciones y advertencias

- Idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Thinking no desactivable: `ThinkingConfig(enable_thinking=False)` no tiene efecto en este archivo; con un límite de 400 tokens el canal de pensamiento consume todo el presupuesto y no aparece texto de respuesta. Es necesario fijar `thinking_token_budget` y un límite superior a ese presupuesto.
- Defecto de caché KV en conversaciones multiturno: a partir del segundo turno, tras una respuesta sin bloque `<think>`, LiteRT-LM inserta el token de parada de la respuesta anterior en la caché KV con embedding cero, lo que puede hacer que respuestas posteriores difieran de las obtenidas en un único prompt. El autor lo midió en otros bundles, no en este archivo. Una pregunta por conversación evita el problema.
- Puntuación final perdida en versiones antiguas: en LiteRT-LM anterior a 0.17.0, si la respuesta termina en un signo de puntuación tokenizado por separado, ese signo no se emite, porque el runtime lo retiene a la espera de `<|end_of_text|>` y un salto de línea. Corregido en 0.17.0 y posteriores.
- Fallo con prefill de prefacio y herramientas: si se crea una conversación con herramientas y sin mensajes y se activa `prefillPrefaceOnInit`, la plantilla falla con `Failed to apply template: undefined value`.
- Timeout de 10 minutos en llamadas bloqueantes, con riesgo de cierre del proceso.
- Riesgo de alucinación: no cuantificado en la información disponible; es un modelo de 3B especializado, por lo que la fiabilidad fuera de su dominio (prompts de imagen) es limitada.
- Sesgos: no documentados por el autor.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor del bundle no ofrece garantías sobre el modelo base ni sobre el runtime LiteRT-LM.
- Madurez: 0 descargas y 1 like en el momento de la consulta; el ecosistema LiteRT-LM es reciente y acumula incidencias documentadas por el propio autor.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/Mordant-3B-Think-LiteRT
- Modelo base: https://huggingface.co/Kezmark/Mordant-3B-Think
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-4.1-3b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Herramienta de conversión: https://github.com/john-rocky/hf-to-litertlm
