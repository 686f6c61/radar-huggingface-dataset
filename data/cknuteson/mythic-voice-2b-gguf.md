# cknuteson/mythic-voice-2b-GGUF

## Resumen

`mythic-voice-2b-GGUF` es un modelo de generación de texto de 2.000 millones de parámetros (1.881.825.088 reales) desarrollado por cknuteson, especializado en roleplay, storytelling y diálogo con registro arcaico del inglés. Está basado en `Qwen/Qwen3.5-2B` y ha sido afinado mediante una secuencia CPT→SFT→DPO con la herramienta `persona-forge`, sobre un corpus de dominio público de la tradición épica del norte de Europa (Malory, Morris, las Eddas, el Kalevala y la cadencia de la versión King James de la Biblia). El resultado es un modelo ligero que responde en una voz arcaica elevada, independiente del mundo o escenario que se le presente.

El modelo se distribuye únicamente en formato GGUF (q4_K_M, q8_0 y f16), con un peso de 1,3 GB en su cuantización principal, lo que lo hace apto para ejecutarse en dispositivos de bajo consumo como una Steam Deck junto a un juego en ejecución. Su relevancia radica en que, pese a su tamaño reducido, alcanza métricas de asignación de persona, turn-taking y ausencia de boilerplate comparables a las de su hermano mayor de 9B, según las evaluaciones del autor. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El modelo emplea una arquitectura híbrida que combina atención completa con capas SSM y gated-delta-net, lo que reduce el coste de la caché KV (aproximadamente 12 KiB por token) y permite conversaciones largas con un consumo de memoria moderado. No se ha publicado la longitud de contexto soportada, pero el diseño sugiere que está optimizado para diálogos multi-turno.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con atención completa y capas SSM / gated-delta-net (basada en Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4_K_M, q8_0, f16 (GGUF) |
| Idiomas soportados | No disponible (orientado al inglés arcaico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B` y ha sido entrenado con un pipeline de tres etapas: continuación de preentrenamiento (CPT) sobre un corpus de dominio público en el registro objetivo, seguido de ajuste supervisado (SFT) con 1.591 filas y optimización por preferencias (DPO) con 1.025 pares. Todo el conjunto de entrenamiento pasó por un filtro de decontaminación basado en solapamiento de 8-gramas y una lista de bloqueo de nombres propios. El autor indica que los GGUFs distribuidos están parcheados a nivel de cabecera (block_count 25→24 y nextn_predict_layers 1→0) para que carguen correctamente en llama.cpp, ya que el modelo base incluye capas MTP que se eliminan al fusionar los pesos.

La arquitectura híbrida combina seis capas de atención completa con capas SSM y gated-delta-net, lo que reduce el coste de la caché KV a unos 12 KiB por token. El chat template fuerza el modo de razonamiento (thinking) desactivado en la generación, evitando que la salida quede vacía si el cliente lee únicamente `choices[0].message.content`. Esta decisión de diseño es crítica para la integración en aplicaciones de producción.

## Capacidades

- Generación de texto en registro arcaico del inglés (estilo épico medieval, bíblico).
- Roleplay con asignación de persona: dado un personaje o arquetipo, responde manteniendo la voz y coherencia del personaje.
- Storytelling y narración de cuentos en tono elevado.
- Soporte de diálogo multi-turno con turn-taking correcto.
- Capacidad de seguir indicaciones de estilo (provocación, tales, pack-driven roleplay).
- No se menciona soporte de tool calling, function calling, ni capacidades multimodales.
- No se indica soporte multilingüe; el modelo está entrenado exclusivamente en inglés arcaico.

## Casos de uso

- Juegos de rol en solitario: el modelo puede actuar como director de juego o como personaje no jugador, manteniendo una voz coherente a lo largo de sesiones largas gracias a la caché KV eficiente.
- Creación de narrativa épica: escritores pueden usarlo para generar borradores de ficción con un estilo arcaico consistente, útil para ambientaciones medievales o fantásticas.
- Chatbots con personalidad histórica: empresas de entretenimiento pueden desplegarlo en experiencias interactivas donde el personaje debe hablar con un registro antiguo (por ejemplo, un guía turístico en un museo).
- Asistentes de escritura creativa: integrado en editores de texto, puede sugerir diálogos o descripciones en el registro deseado, reduciendo el tiempo de redacción.
- Prototipado rápido de personajes en videojuegos: al ser ligero (1,3 GB en q4), puede ejecutarse en local en equipos de desarrollo sin GPU dedicada, permitiendo iterar sobre el guion de un personaje.
- Educación y divulgación: herramientas didácticas que expliquen textos épicos o bíblicos pueden usar el modelo para responder preguntas en un lenguaje arcaico, aunque con la limitación de que no está entrenado para hechos factuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona una evaluación propia sobre un conjunto de pruebas (battery) con métricas específicas para roleplay, comparando los modelos de la familia mythic-voice:

| Metrica | 9B | 4B | 2B |
|---|---|---|---|
| Assignment accuracy | 1.0 | 0.750 | 1.000 |
| In-character | 1.0 | 0.929 | 1.000 |
| Turn-taking | 1.0 | 1.0 | 1.0 |
| Boilerplate | 0.0 | 0.0 | 0.0 |
| Voice | 0.983 | 1.000 | 0.967 |
| Leakage (176 probes, bare) | 0.892 | 0.847 | 0.818 |

El autor advierte que la métrica de assignment accuracy se mide sobre solo cuatro elementos, por lo que la diferencia entre 1.000 y 0.750 podría ser ruido. El modelo 2B iguala al 9B en asignación, in-character y turn-taking, y supera al 4B en las dos primeras.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,3 GB en q4_K_M, 2,0 GB en q8_0 y 3,8 GB en f16.
- GPU recomendadas: cualquier GPU con soporte CUDA, Vulkan o Metal (el modelo declara compatibilidad con las tres). En una Steam Deck (APU con Vulkan) cabe junto a un juego en ejecución.
- Es viable en GPU de consumo como RTX 3060 o superiores, e incluso en CPU con llama.cpp gracias a su tamaño reducido.
- Opciones de despliegue: llama.cpp, llama-server, Ollama (si se convierte), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado mediciones, pero el tamaño pequeño y la caché KV eficiente sugieren una latencia baja en hardware modesto.

## Comparativa con modelos similares

Dentro de la misma familia mythic-voice, el 2B se posiciona como la opción más ligera:

| Modelo | Parámetros | Contexto | Licencia | Formato | Peso (q4) |
|---|---|---|---|---|---|
| mythic-voice-2b | 1,88B | No disponible | Apache 2.0 | GGUF | 1,3 GB |
| mythic-voice-4b | No disponible | No disponible | Apache 2.0 | GGUF | No disponible |
| mythic-voice-9b | No disponible | No disponible | Apache 2.0 | GGUF | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (roleplay en registro arcaico). El modelo base Qwen3.5-2B es un transformer generalista, pero no se han encontrado comparaciones directas con alternativas como Llama 3.2 3B o Mistral 7B en tareas de roleplay.

## Limitaciones y advertencias

- Leakage de datos de entrenamiento: el modelo 2B es el peor de la familia en la batería de 176 sondas, con un 81,8% de éxito en la retención de la negativa entrenada. El autor recomienda encarecidamente usar el filtro `GuardedTeacher` si se despliega públicamente, ya que la mitigación degrada más rápido que el problema.
- Riesgo de alucinación: no se ha evaluado formalmente, pero al ser un modelo pequeño y especializado en estilo, es probable que genere contenido inventado si se le piden hechos o información factual.
- Limitaciones de idioma: entrenado exclusivamente en inglés arcaico; no hay indicios de soporte para otros idiomas.
- Dependencia de parcheo en GGUF: los archivos están modificados en la cabecera; si se usan versiones incorrectas o se re-convierten, pueden fallar al cargar en llama.cpp.
- Sesgos: no se han documentado sesgos específicos, pero el corpus de dominio público del norte de Europa puede reflejar perspectivas culturales limitadas.
- Uso comercial: permitido por licencia Apache 2.0, pero con la advertencia de que el filtro de seguridad no es opcional para despliegues públicos.

## Enlaces

- [HuggingFace - cknuteson/mythic-voice-2b-GGUF](https://huggingface.co/cknuteson/mythic-voice-2b-GGUF)
- [HuggingFace - mythic-voice-9b-GGUF](https://huggingface.co/cknuteson/mythic-voice-9b-GGUF)
- [Repositorio persona-forge](https://github.com/ctkadvisors/persona-forge)
