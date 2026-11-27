# DICPlay/RusMind-Sokol-4.7

## Resumen

RusMind-Sokol-4.7 es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 8,9 mil millones) desarrollado por DICPlay bajo la marca RusMind, especializado en ruso e inglés y con modo de razonamiento explícito. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B, sobre el que el equipo ha aplicado entrenamiento adicional con datos propios centrados en lengua y cultura rusas, historia de Rusia, legislación de la Federación Rusa y razonamiento multi-paso.

El modelo se presenta como una alternativa de tamaño medio (por debajo de 10 mil millones de parámetros) capaz de competir con modelos mucho mayores en el benchmark ruso MERA v2, donde declara una puntuación de 0,279. Según la model card, supera a GigaChat 3.5 Ultra (432 mil millones de parámetros), T-pro (33 mil millones) y Llama 4 Maverick (400 mil millones), y se sitúa a la par de Gemma 4 26B. Es relevante ahora porque demuestra que un fine-tuning bien dirigido sobre un modelo base de 9B puede alcanzar resultados competitivos en tareas específicas de un idioma y dominio concretos.

El modelo está pensado para ejecución local y sin conexión (offline), con pesos disponibles en safetensors y GGUF, lo que facilita su despliegue mediante llama.cpp y otras herramientas de inferencia local. La licencia es propietaria (rusmind-license), con requisito de contacto para uso organizacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-9B; tag `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repo); otras cuantizaciones no especificadas |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propietaria, `license: other`) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Qwen/Qwen3.5-9B, según indica la relación `base_model: finetune`. No se especifican en la información disponible detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona que el fine-tuning se realizó con datos propios (sintéticos y de fuentes abiertas) centrados en lengua y cultura rusas, historia de Rusia, regiones y legislación de la Federación Rusa, así como en razonamiento, comprensión de contexto, trabajo con documentos y uso de herramientas.

La innovación destacable es el modo de razonamiento ("thinking"): el modelo elabora la tarea paso a paso antes de responder, lo que según el autor le permite abordar tareas que normalmente requieren modelos de mayor tamaño. No se detallan en la información proporcionada técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en ruso e inglés.
- Modo de razonamiento explícito (thinking mode) con descomposición multi-paso de la tarea.
- Razonamiento lógico, tareas de sentido común y problemas multi-paso.
- Comprensión de personajes, contexto narrativo, adivinanzas y antónimos.
- Corrección ortográfica y puntuación en ruso.
- Conocimiento profundo de historia, cultura, regiones, pueblos y legislación de Rusia.
- Ejecución precisa de instrucciones complejas con múltiples requisitos simultáneos.
- Llamada a herramientas y funciones (tool calling / function calling).
- Tareas agénticas y razonamiento multi-paso.
- Trabajo con documentos.
- Ejecución local y offline.
- Compatibilidad con endpoints (`endpoints_compatible`).

## Casos de uso

- Atención al cliente en ruso: el modelo puede gestionar conversaciones multi-turno y responder con conocimiento de normativa y cultura local, gracias a su entrenamiento específico en legislación y regiones rusas.
- Generación y revisión de documentación legal en ruso: adecuado para tareas de redacción asistida y corrección ortográfica y de puntuación, dado su entrenamiento en legislación de la Federación Rusa.
- Asistentes de razonamiento paso a paso: el modo thinking permite usarlo en tareas de análisis y resolución de problemas que requieren descomposición lógica, como diagnóstico de incidencias o planificación.
- Automatización agéntica con tool calling: puede integrarse en pipelines que requieran invocar funciones o APIs, ya que la model card destaca su precisión en instrucciones complejas y llamada a herramientas.
- Procesamiento de documentos en ruso: extracción, resumen y análisis de textos legales o históricos, aprovechando su conocimiento del dominio.
- Educación y divulgación histórica y cultural: generación de material didáctico sobre historia y cultura rusas.
- Despliegue local y offline: al disponer de GGUF, puede ejecutarse en entornos sin conexión mediante llama.cpp, útil en escenarios con requisitos de privacidad o aislamiento de red.

## Benchmarks y rendimiento

Los datos de la model card proceden del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), según el autor con fecha de 30.10.2026.

| Modelo | Parámetros | MERA v2 (global) | Razonamiento |
|---|---|---|---|
| RusMind-Sokol-4.7 | 8,9B | 0,279 | 0,459 |
| GigaChat 3.5 Ultra | 432B | 0,249 | 0,429 |
| T-pro (T-Bank) | 33B | 0,196 | no disponible |
| Qwen3.5-9B | 9B | 0,186 | no disponible |
| Gemma 4 E4B | 4B | 0,170 | no disponible |
| Gemma 4 26B | 26B | 0,279 | no disponible |

Otros datos declarados por el autor: comprensión de personas 0,300 frente a 0,249 de T-pro; cultura de Rusia 0,277 frente a 0,233 de T-pro; instrucciones complejas "8 veces más preciso" que T-pro; trabajo con herramientas "2,6 veces mejor" que Gemma 4 26B. Estas cifras provienen exclusivamente de la model card del autor y no se han verificado de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para 8,9B parámetros, una estimación orientativa sería de aproximadamente 18 GB en FP16, 9-10 GB en cuantización de 8 bits y 5-6 GB en cuantización de 4 bits, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar ejecución en GPUs de consumo con suficiente VRAM en cuantización baja (por ejemplo, RTX 4090 de 24 GB en FP16 o cuantizaciones mayores en GPUs de 8-12 GB).
- Compatibilidad con GPU de consumo: probable en cuantizaciones GGUF de 4-8 bits, aunque no confirmado en la información disponible.
- Opciones de despliegue: transformers (librería declarada), llama.cpp y GGUF (tags del repo), endpoints compatibles. No se confirma soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind-Sokol-4.7 | 8,9B | no disponible | 0,279 | rusmind-license (propietaria) | Hugging Face (safetensors, GGUF) |
| Qwen3.5-9B (base) | 9B | no disponible | 0,186 | según Qwen (no especificada aquí) | Hugging Face |
| T-lite (T-Bank) | ~8B | no disponible | no disponible (inferior según autor) | no disponible | no disponible |
| Gemma 4 26B | 26B | no disponible | 0,279 | según Google (no especificada aquí) | no disponible |

## Limitaciones y advertencias

- Sesgos: el entrenamiento está orientado explícitamente a "valores tradicionales" y perspectivas culturales rusas, lo que puede introducir sesgos en temas políticos, históricos y sociales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta, especialmente en dominios fuera de su entrenamiento específico.
- Cobertura lingüística limitada a ruso e inglés; el rendimiento en otros idiomas no está garantizado.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- Licencia propietaria (rusmind-license): es necesario revisar los términos del archivo LICENSE antes de cualquier uso comercial; el autor indica que las organizaciones deben contactar para obtener licencia.
- Las cifras de benchmarks proceden del propio autor y no se han verificado de forma independiente en la información disponible.
- El tamaño del repositorio (109,4 GB) implica requisitos de almacenamiento considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Sitio del producto: https://rusmind.ru
- Ranking MERA: https://mera.a-ai.ru/ru/text/leaderboard
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
