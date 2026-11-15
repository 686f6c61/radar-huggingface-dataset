# LucyTu111/qwen3.5-4b-math-tutor-lora

## Resumen

Qwen3.5-4B Math Tutor LoRA es un adaptador LoRA de tipo PEFT desarrollado por LucyTu111 sobre el modelo base Qwen/Qwen3.5-4B. Su propósito es generar un turno de tutoría en conversaciones en vivo de matemáticas, concretamente en problemas de conteo y probabilidad del nivel AMC 10, actuando como sustituto económico de Gemini en una aplicación de tutoría. El adaptador se entrenó con 513 pares prompt-respuesta mediante SFT y destilación desde la API de Gemini.

El dato más relevante para quien evalúe este modelo es que, según la propia model card, no superó el umbral de calidad fijado antes del experimento: la puerta preregistrada de matemáticas exigía como máximo 4 respuestas incorrectas de 90 y el adaptador produjo 8 (lectura estricta: 10). El autor lo publica explícitamente como registro de investigación, no como tutor utilizable en producción.

Arquitectura transformer con atención lineal en el modelo base, 4.570 millones de parámetros totales y 32,5 millones entrenables en el adaptador (LoRA r=16, alpha=16, dropout=0). El contexto de entrenamiento fue de 8192 tokens y cada prompt ocupa entre 5,7k y 6,6k tokens, dominado por un system prompt en chino que no se ha publicado. Licencia Apache 2.0 para el adaptador, aunque los datos de entrenamiento derivan de la API de Gemini y sus términos condicionan el uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-4B) con adaptador LoRA sobre proyecciones de atención, atención lineal y MLP |
| Parámetros totales | 4,57 B (modelo base); 32,5 M entrenables en el adaptador |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantización | no disponible (el adaptador se entrenó en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | en, zh (prompts de sistema en chino, respuestas en inglés) |
| Licencia | apache-2.0 (adaptador) |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json; tokenizer.json, tokenizer_config.json, chat_template.jinja |

## Arquitectura y entrenamiento

El adaptador es un LoRA en bf16 con rango 16, alpha 16 y dropout 0, aplicado sobre las proyecciones de atención, atención lineal y MLP del modelo base Qwen3.5-4B. El entrenamiento usó 2 épocas, 130 pasos, batch efectivo de 8, learning rate 2e-4 y longitud máxima de 8192 tokens, con la pérdida calculada únicamente sobre los tokens de respuesta. Se ejecutó en una NVIDIA A40 en RunPod durante 3230 segundos con un pico de 10,6 GiB de memoria asignada. El checkpoint final (paso 121) se seleccionó por NLL de respuesta en held-out, que bajó de 1,3229 a 0,7706. El stack fue torch 2.8.0+cu128, Unsloth 2026.11.2, TRL 1.15.0, transformers 5.17.0 y PEFT 0.21.2.

Los datos de entrenamiento son 513 pares prompt-respuesta: 329 respuestas de referencia escritas por la API de Gemini (`gemini-4-argon`) para diálogos sintéticos, revisadas por el autor o por Claude bajo su delegación, y 184 correcciones mínimas en las que Gemini reescribió respuestas fallidas del adaptador de la ronda 3 partiendo del primer error (de 196 corregidas, 184 pasaron los controles mecánicos y la revisión de Claude). No se usaron datos de estudiantes reales: los estudiantes son simulados y los problemas fueron escritos para el proyecto. Cada prompt pesa entre 5,7k y 6,6k tokens, mayoritariamente system prompt, escrito en chino y no publicado. El chat template es el del modelo base con un cambio: por defecto opera en modo no-thinking, igual que en entrenamiento y evaluación. No hubo RLHF; el autor probó DPO sobre muestras propias del modelo sin mejora.

## Capacidades

- Generación de texto conversacional orientada a tutoría de matemáticas en un turno por intervención.
- Resolución de problemas de conteo y probabilidad de nivel AMC 10 dentro de un diálogo de tutoría.
- Producción de una línea ASK machine-readable (respuesta esperada que la app verifica contra la réplica del estudiante), con el formato validado por la aplicación.
- Gestión de réplicas del estudiante, incluyendo correcciones, aunque los turnos de pushback (el estudiante discrepa) son el punto más débil: el turno 2 concentra 4 de las 8 respuestas incorrectas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el adaptador está diseñado para un único turno de tutor.
- Capacidades multilingües: prompts en chino y respuestas en inglés; no se ha probado con otros idiomas ni con otro prompt distinto del de entrenamiento.
- Modo thinking: desactivado por defecto en el chat template; no se documenta comportamiento en modo thinking.

## Casos de uso

- Registro de investigación sobre destilación de tutores: el adaptador sirve como caso documentado de SFT y corrección de errores con destilación desde Gemini, con métricas de puerta preregistrada y análisis de qué cambios funcionaron y cuáles no. Es su uso principal declarado por el autor.
- Estudio de formatos machine-readable en diálogos educativos: la línea ASK y su colocación tras el texto hablado redujeron los desajustes de 16 de 55 a 2 de 50, un resultado replicable en diseños de prompts para apps de tutoría.
- Evaluación de guardas de inferencia: el pipeline de tres pasos (greedy, luego 4 muestras a temperatura 0,7/top-p 0,8/top-k 20, luego fallback a Gemini) elevó la entrega de 74/90 a 88/90; útil como referencia para diseñar guardas en producción.
- Análisis de fallos en matemáticas elementales: los errores documentados (2 bolas en 2 cajas contadas como 2 en vez de 3; (1,7) listado entre los 36 resultados de dos dados; elogio de un 20/6 incorrecto) sirven para construir suites de test de tutores matemáticos.
- Comparación de checkpoints educativos: el autor probó OmniEdu 4B y 9B en lugar de Qwen base sin mejora, lo que aporta evidencia sobre la transferencia de ajustes educativos a tareas de tutoría en vivo.
- No recomendado para tutoría real en producción: el propio autor lo publica como registro, no como tutor utilizable; cualquier despliegue requeriría el system prompt no publicado y validación propia.

## Benchmarks y rendimiento

Todos los números provienen de los mismos 90 turnos de tutoría en held-out, de 6 familias de problemas que no aparecen en entrenamiento.

| Comprobación | Adaptador (ronda 4) | Ronda 3 |
|---|---|---|
| Respuesta greedy que pasa los controles de formato de la app | 74 / 90 | 68 / 90 |
| Respuestas entregadas tras la guarda de inferencia (el resto cae a Gemini) | 88 / 90 | 85 / 90 |
| Lectura matemática de las respuestas entregadas: correcta / parcial / incorrecta | 40 / 40 / 8 | 42 / 36 / 7 |
| Puerta preregistrada (máximo 4 incorrectas) | fallida | fallida |
| Preferencia ciega frente a Gemini (juez humano, 68 pares, umbral 45 %) | no ejecutada | 38,2 % de victorias (IC 95 % Wilson 27,6–50,1 %) |

En los 83 turnos entregados por ambas rondas, la ronda 4 fue mejor en 13, peor en 17 e igual en 53 (test de signos bilateral p = 0,58): los datos de corrección mejoraron el formato, no las matemáticas. Leída en modo estricto, la cuenta de incorrectas sube a 10. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el entrenamiento usó 10,6 GiB de memoria asignada en una A40 con el modelo base en bf16 y longitud 8192.
- GPU recomendadas: NVIDIA A40 (probada en entrenamiento); para inferencia con el modelo base de 4,57 B en bf16 se requiere una GPU con al menos ~10 GB de VRAM, aunque no se documenta una configuración de inferencia medida.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU de consumo; el adaptador en bf16 sobre el base de 4,57 B podría caber en GPUs de 16-24 GB con cuantización del base, pero no se ha probado.
- Opciones de despliegue: la ruta probada es cargar el adaptador con PEFT sobre el modelo base en bf16; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El coste total de todas las rondas del experimento fue inferior a 10 USD de GPU alquilada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B Math Tutor LoRA (este) | 4,57 B base + 32,5 M adaptador | 8192 (entrenamiento) | 40/40/8 correcta/parcial/incorrecta en 90 turnos; puerta fallida | apache-2.0 | Hugging Face, 0 descargas |
| Ronda 3 del mismo adaptador | 4,57 B base + adaptador | 8192 | 42/36/7; 38,2 % de victorias frente a Gemini | apache-2.0 | no publicada como checkpoint independiente en la información disponible |
| Gemini (`gemini-4-argon`, referencia) | no disponible | no disponible | Referencia de destilación; ganó el test ciego de la ronda 3 | propietaria | API de Google |
| OmniEdu 4B / 9B | 4 B / 9 B | no disponible | Probados como base sin mejora según el autor | no disponible | no disponible |

## Limitaciones y advertencias

- No superó la puerta preregistrada de matemáticas: 8 respuestas incorrectas de 90 frente al máximo de 4 (10 en lectura estricta). El autor lo declara no apto como tutor.
- Los turnos de pushback son el punto débil: 4 de las 8 respuestas incorrectas están en el turno 2.
- Errores documentados: cuenta 2 formas de repartir 2 bolas idénticas en 2 cajas (son 3), lista (1,7) entre los 36 resultados de dos dados y elogia un 20/6 incorrecto.
- El system prompt (en chino, 5,7k-6,6k tokens) no se publica y el modelo no se ha probado con ningún otro prompt: sin él no se reproduce el comportamiento.
- Los datos de entrenamiento no se publican y derivan de la API de Gemini, cuyos términos (efectivos 2026-03-23) prohíben usar los servicios para desarrollar modelos que compitan con ellos; hay que verificar los términos aplicables antes de usar el adaptador.
- Evaluación limitada: un solo lector para la matemática (Claude), un solo juez humano en el test ciego, una sola semilla por configuración y los 90 turnos de held-out informaron cinco decisiones previas, por lo que ya no son un conjunto de test limpio.
- Idiomas: solo en y zh; respuestas en inglés y prompts en chino, sin pruebas en otros idiomas.
- Modo thinking desactivado por defecto; no se documenta su comportamiento con thinking activo.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación matemática y de aceptar respuestas erróneas del estudiante, evidenciado en la lectura de las respuestas.

## Enlaces

- Hugging Face: https://huggingface.co/LucyTu111/qwen3.5-4b-math-tutor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
