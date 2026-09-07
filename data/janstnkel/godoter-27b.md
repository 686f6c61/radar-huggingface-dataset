# Janstnkel/Godoter-27B

## Resumen

Godoter-27B es un modelo de lenguaje de 27.781 millones de parámetros especializado en la generación de código GDScript para Godot 4. Se trata de un fine-tune QLoRA del modelo base unsloth/Qwen3.6-27B, con el adaptador fusionado de vuelta a los pesos originales, de modo que se carga como un modelo estándar. Lo ha desarrollado un aficionado independiente (autor en Hugging Face: Janstnkel) como proyecto personal de aprendizaje, sin afiliación con la Godot Foundation.

El problema que resuelve es la fiabilidad en un dominio concreto: los modelos generales conocen algo de Godot, pero bajo presión se desvían hacia otros motores o mezclan la API obsoleta de Godot 3 con la de Godot 4. Godoter-27B se mantiene anclado al ecosistema Godot 4, respondiendo siempre en GDScript y sin confundir versiones. Es relevante para desarrolladores de juegos que buscan un modelo de código que no se desvíe de la sintaxis y las convenciones de Godot 4.

La arquitectura es la del modelo base Qwen3.6-27B, un transformer causal con arquitectura qwen3_5 según las etiquetas de Hugging Face. La longitud de contexto no se especifica en la información disponible. El modelo está disponible en formato safetensors para Transformers y también en cuantizaciones GGUF (Q4, Q6, Q8) para su uso con llama.cpp, Ollama o LM Studio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (arquitectura qwen3_5 / Qwen3.6) |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4, Q6, Q8 (GGUF) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF (cuantizado) |

## Arquitectura y entrenamiento

Godoter-27B es un fine-tune QLoRA del modelo base unsloth/Qwen3.6-27B. El método de entrenamiento utiliza rank r=16, alpha=16, optimizador adamw_8bit y base en 4 bits; el adaptador se fusiona posteriormente en 16 bits. El modelo resultante se carga como un modelo normal, sin necesidad de cargar el adaptador por separado.

El conjunto de datos de entrenamiento contiene aproximadamente 18.000 ejemplos, todos anclados a la documentación oficial de Godot 4 (licencia CC-BY 4.0). Incluye extracción de referencias exactas de la API (métodos, propiedades y señales con firmas), preguntas y respuestas basadas en tutoriales de Godot 4, 666 sistemas completos multi-archivo de Godot 4 generados como tripletas construir/explicar/extender, y pares reales de completado de GDScript. No se menciona ningún proceso de RLHF o DPO; el ajuste es puramente supervisado mediante QLoRA.

## Capacidades

- Generación de código GDScript idiomático para Godot 4: nodos, señales, recursos, decoradores @export y @onready, sentencias await y tipado estático.
- Construcción de sistemas completos y multi-archivo: máquinas de estados finitos, guardado/carga, diálogo, multijugador, shaders, combate con hitbox/hurtbox, navegación, crafting y árboles de habilidad.
- Distinción rigurosa entre la API de Godot 3 y Godot 4: no utiliza funciones deprecadas como move_and_slide(), instantiate(), CharacterBody2D/3D, source_color, FileAccess, signal .connect()/.emit(), @rpc, etc.
- Capacidad de mantenerse en el ecosistema Godot sin derivar hacia Unity, Python, web u otros frameworks.
- Soporte de modo de razonamiento (thinking) heredado del modelo base, según se indica en el benchmark (thinking enabled).
- Soporte de tool calling / function calling: no especificado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no especificado en la información disponible.
- Idiomas: solo inglés según la model card.

## Casos de uso

- Migración de Godot 3 a Godot 4: el modelo puede reescribir scripts que usan la API antigua, sustituyendo métodos deprecados por sus equivalentes de Godot 4. Es adecuado porque está entrenado específicamente para no confundir versiones.
- Generación de sistemas de inventario: a partir de una descripción funcional, el modelo genera varios archivos GDScript que implementan ítems, slots y persistencia. Es adecuado porque el dataset incluye 666 sistemas multi-archivo completos.
- Desarrollo de IA de enemigos con máquinas de estados finitos: el modelo produce nodos y scripts para estados de patrulla, persecución y ataque, con señales y transiciones. Es adecuado porque está especializado en Godot 4 y no se desvía a otros motores.
- Implementación de guardado y carga de partidas: el modelo puede generar código que serializa el estado del juego usando FileAccess y recursos de Godot 4. Es adecuado porque el entrenamiento incluye referencias exactas de la API de Godot 4.
- Creación de sistemas de diálogo: el modelo es capaz de generar estructuras de diálogo ramificadas con señales y recursos personalizados. Es adecuado porque se mantiene en el dominio de Godot 4.
- Desarrollo de multijugador con RPC: el modelo puede generar scripts que usan @rpc y señales de sincronización. Es adecuado porque el fine-tune evita responder con gRPC/Go u otros frameworks, como se observa en el benchmark.
- Generación de shaders y efectos visuales: el modelo puede escribir shaders en el lenguaje de shading de Godot 4 junto con los scripts que los aplican. Es adecuado porque el dataset incluye shaders como parte de los sistemas completos.
- Sistema de combate con hitbox y hurtbox: el modelo puede implementar detección de colisiones y daño usando Area2D, CollisionShape2D y señales. Es adecuado porque está especializado en Godot 4 y no mezcla APIs de versiones anteriores.

## Benchmarks y rendimiento

La información disponible incluye un benchmark propio del autor que compara Godoter-27B con el modelo base Qwen3.6-27B. Ambos se evaluaron en la misma cuantización Q6_K, en la misma GPU, con los mismos prompts y con el modo de razonamiento activado. Una tarea se considera superada solo si la respuesta utiliza la API correcta de Godot 4 y evita la API deprecada de Godot 3.

| Test | Base Qwen3.6-27B | Godoter-27B |
|---|---|---|
| Tareas fáciles (trampas de migración a Godot 4) | 80% | 100% |
| Tareas difíciles (Godot 4 avanzado) | 68% | 96% |

El autor advierte que el 68% del modelo base en las tareas difíciles sobrestima su rendimiento real, ya que el criterio de evaluación otorga crédito a respuestas incompletas o en un lenguaje incorrecto. No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no especificado.
- Si cabe en GPU de consumo: no disponible.
- Opciones de despliegue: Transformers 5.x en Python para el modelo safetensors; llama.cpp, Ollama y LM Studio para las versiones GGUF. No se mencionan vLLM ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La única comparativa disponible es con el modelo base Qwen3.6-27B. No se han identificado otros modelos especializados en Godot 4 en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27.781.427.952 | No disponible | Apache 2.0 | General | Transformers |
| Godoter-27B | 27.781.427.952 | No disponible | Apache 2.0 | Godot 4 / GDScript | Transformers, GGUF |

## Limitaciones y advertencias

- El modelo es un derivado de Qwen3.6-27B; aproximadamente el 99% de su capacidad procede del modelo base, y el fine-tune añade fiabilidad en Godot 4, no nuevas capacidades de razonamiento general.
- El conocimiento está limitado por la fecha de corte del modelo base y por los datos de entrenamiento; los cambios recientes de Godot 4.x pueden no estar reflejados.
- El benchmark del autor mide la corrección de la API, no la calidad arquitectónica completa del código generado. Un script puede usar la API correcta pero tener un diseño deficiente.
- Como cualquier modelo de lenguaje, puede estar equivocado con total seguridad; es necesario revisar el código generado antes de usarlo en producción.
- La model card indica que es un proyecto personal no comercial, aunque la licencia declarada es Apache 2.0, que permite uso comercial. Esta contradicción debe tenerse en cuenta.
- No se han documentado sesgos específicos en la información disponible.
- Solo soporta inglés.
- Es un proyecto no oficial, sin afiliación con la Godot Foundation. Godot es una marca de la Godot Foundation.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Janstnkel/Godoter-27B
- README del modelo (en Ruler97/Godoter-27B): https://huggingface.co/Ruler97/Godoter-27B/blob/main/README.md
- Cuantizaciones GGUF de mradermacher: https://huggingface.co/mradermacher/Godoter-27B-GGUF
- Cuantizaciones GGUF de Ruler97: https://huggingface.co/Ruler97/Godoter-27B-GGUF

Nota: el identificador del autor en Hugging Face es Janstnkel, mientras que la model card y el código de ejemplo utilizan Ruler97. Ambas rutas parecen referirse al mismo modelo.
