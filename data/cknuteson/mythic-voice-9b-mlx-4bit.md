# cknuteson/mythic-voice-9b-MLX-4bit

## Resumen
`mythic-voice-9b-MLX-4bit` es una conversión a cuantización 4-bit en formato MLX del modelo `mythic-voice-9b`, desarrollado por cknuteson. El modelo base es `Qwen/Qwen3.5-9B`, ajustado mediante un pipeline de entrenamiento CPT→SFT→DPO con la herramienta `persona-forge`. Su propósito principal es generar texto en un registro arcaico elevado, inspirado en la tradición épica del norte de Europa (Malory, Morris, las Eddas, el Kalevala y la cadencia de la King James Version), manteniendo a la vez la capacidad de adoptar cualquier persona que se le indique y de resistir provocaciones.

La relevancia de este modelo radica en su especialización extrema para roleplay y storytelling, ofreciendo una voz consistente y estilizada que no se encuentra en los modelos generalistas. Al estar cuantizado en 4-bit para MLX, está optimizado para ejecutarse en hardware Apple Silicon, ocupando aproximadamente 5,3 GB de pesos y alcanzando unos 18-19 tokens por segundo en un MacBook Pro con chip M3. La licencia es Apache 2.0, lo que permite uso comercial, aunque el autor recomienda envolverlo con el filtro runtime `GuardedTeacher` para aplicaciones públicas.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) |
| Parametros totales | 1.399.927.296 (según safetensors; el modelo base Qwen3.5-9B tiene 9B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-9B, no especificada en la ficha) |
| Tipos de cuantizacion | 4-bit affine, group size 64 |
| Idiomas soportados | no disponible (el ajuste se centra en inglés arcaico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura transformer de Qwen3.5-9B. El proceso de entrenamiento descrito en la documentación sigue una secuencia de tres fases: CPT (entrenamiento continuo), SFT (ajuste supervisado) y DPO (optimización de preferencias directa), todo ello orquestado mediante el pipeline `persona-forge`. Este pipeline incluye un componente denominado `GuardedTeacher`, que actúa como filtro runtime para evitar fugas de información o comportamientos no deseados durante la generación.

La cuantización a 4-bit affine con group size 64 es específica para MLX, lo que permite una ejecución eficiente en Apple Silicon. El chat template está configurado para desactivar el modo "thinking" de forma forzada, ya que algunos stacks de inferencia inyectan un toggle de pensamiento independientemente de los kwargs. Además, el `eos_token_id` incluye `<|im_end|>`, lo que garantiza que el turno de conversación se detenga correctamente por defecto.

## Capacidades
- Generación de texto en registro arcaico elevado, imitando la cadencia de la épica nórdica, Malory, Morris y la King James Version.
- Roleplay y storytelling: puede adoptar cualquier persona que se le proporcione en el system prompt, manteniendo la voz estilizada.
- Resistencia a la provocación: entrenado para no dejarse incitar a respuestas inapropiadas o fuera de registro.
- Conversación multi-turno: el manejo de `eos_token_id` permite un corte de turno fiable.
- Sin soporte de tool calling, visión o audio: es exclusivamente un modelo de generación de texto.
- Capacidad de "world-agnostic": el usuario aporta el contexto y la persona, el modelo aporta la voz.

## Casos de uso
- Narración en juegos de rol de mesa: un dungeon master puede usar el modelo para generar descripciones de escenarios, diálogos de PNJ y eventos en un estilo épico coherente, manteniendo la inmersión.
- Escritura creativa asistida: autores que buscan emular prosa arcaica o épica pueden emplear el modelo como generador de borradores o para superar bloqueos creativos, con un estilo consistente.
- Chatbots de personajes históricos o ficticios: ideal para crear asistentes conversacionales que representen a figuras como un escaldo nórdico o un caballero artúrico, con una voz auténtica.
- Generación de diálogos para guiones o teatro: el modelo puede producir diálogos con la cadencia y el vocabulario adecuados para obras ambientadas en periodos históricos.
- Herramientas educativas de literatura: se puede integrar en aplicaciones que enseñen las características del inglés moderno temprano o la épica, generando ejemplos interactivos.
- Prototipado rápido en Apple Silicon: gracias a su formato MLX y bajo peso, es adecuado para desarrolladores que necesitan un generador de texto estilizado en local, sin depender de APIs externas, en un MacBook.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. El README menciona una "batería de 176 sondas de fuga" (leakage battery) donde los pesos sin filtrar pasan el 89% de las pruebas, aproximadamente 9 veces mejor que el modelo base sin ajustar. Con el filtro runtime `GuardedTeacher` activo, la tasa de éxito alcanza 176/176. Este dato es cualitativo y se refiere a la seguridad del modelo, no a su rendimiento en tareas generales.

## Requisitos de hardware
- VRAM estimada: aproximadamente 5,3 GB de pesos en cuantización 4-bit MLX.
- GPU recomendadas: Apple Silicon (probado en M3 MacBook Pro, con un rendimiento de 18-19 tok/s).
- Compatibilidad con GPU de consumo: no aplica directamente en formato MLX para NVIDIA; para Linux/Windows se debe usar la versión GGUF del mismo modelo.
- Opciones de despliegue: `mlx-lm` (Python), LM Studio (en Apple Silicon), y `llama.cpp`/LM Studio para la versión GGUF en otras plataformas.
- Latencia y throughput: 18-19 tokens por segundo en M3, según el autor.

## Comparativa con modelos similares
| Modelo | Base | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|---|
| mythic-voice-9b-MLX-4bit | Qwen3.5-9B | 1.4B (cuantizado) | no disponible | Apache 2.0 | MLX 4-bit | Registro arcaico épico |
| mythic-voice-9b-GGUF | Qwen3.5-9B | 9B (original) | no disponible | Apache 2.0 | GGUF | Registro arcaico épico |
| Qwen3.5-9B (base) | - | 9B | no disponible | Apache 2.0 | safetensors | Modelo generalista |
| Llama-3.1-8B-Instruct | - | 8B | 128k | Llama 3.1 | safetensors | Instrucciones generales, sin registro arcaico |

La comparativa muestra que la principal diferencia frente al modelo base es el ajuste de registro y la resistencia a la provocación. Frente a otros modelos de roleplay, carece de soporte de herramientas, pero ofrece una voz estilística única.

## Limitaciones y advertencias
- Sesgos conocidos: al entrenarse sobre corpus de dominio público de la tradición épica, puede reflejar sesgos históricos, sexistas o clasistas propios de esas fuentes.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje, especialmente al generar en un registro arcaico donde la verificación factual es compleja.
- Limitaciones de idioma: aunque el modelo base es multilingüe, el ajuste está orientado al inglés arcaico; su uso en otros idiomas puede degradar la calidad del registro.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte que para productos públicos es necesario envolver el modelo con el filtro `GuardedTeacher` para mitigar fugas de información (el modelo sin filtrar falla en un 11% de las sondas).
- Caveat de producción: el chat template fuerza el modo "thinking" desactivado, lo que puede limitar la capacidad de razonamiento complejo en tareas que lo requieran.

## Enlaces
- Modelo MLX 4-bit en HuggingFace: https://huggingface.co/cknuteson/mythic-voice-9b-MLX-4bit
- Repositorio principal GGUF (con detalles de entrenamiento y evaluación): https://huggingface.co/cknuteson/mythic-voice-9b-GGUF
- Pipeline de entrenamiento persona-forge: https://github.com/ctkadvisors/persona-forge
