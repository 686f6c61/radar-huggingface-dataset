# localgradient/Temporal-0.8B-v3-4bit

## Resumen

Temporal-0.8B-v3-4bit es un modelo de lenguaje compacto (118 millones de parámetros) desarrollado por localgradient, especializado en extraer la intención de fecha de una pregunta en lenguaje natural. Forma parte de un par de modelos de planificación de consultas que la aplicación SyncNotes utiliza para convertir una pregunta del usuario en una búsqueda determinista, de modo que la recuperación de información se guía por el modelo en lugar de por una división por palabras vacías. El modelo está basado en Qwen3.5-0.8B, se ha sometido a un fine-tune completo sobre un corpus exclusivamente sintético y se ha cuantizado a 4 bits con MLX, lo que reduce su tamaño a 0.4 GB y lo hace viable para ejecución en dispositivos móviles o en el edge.

La salida del modelo es un objeto JSON pequeño que indica la intención temporal (por ejemplo, `{"intent":"none_latest"}`) mediante decodificación greedy con temperatura 0. No genera prosa ni compone respuestas; su función es únicamente planificar la búsqueda que ejecutará después un motor determinista. Este enfoque de especialización permite que el modelo sea rápido, ligero y determinista, aunque exige un manejo defensivo de su salida, ya que en prompts fuera de distribución puede emitir texto degenerado sin cierre de llave.

La relevancia de este modelo radica en su diseño para búsqueda personal en el dispositivo, un área donde los modelos grandes son impracticables por recursos y latencia. Al estar basado en Qwen3.5-0.8B y licenciado bajo Apache-2.0, ofrece una alternativa abierta y reproducible para tareas de planificación de consultas en sistemas de recuperación de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-0.8B (Transformer, fine-tune completo) |
| Parametros totales | 117.982.016 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (4.508 bits/peso) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura base Qwen3.5-0.8B, un transformer de 0.8 mil millones de parámetros. Se ha realizado un fine-tune completo (`fine_tune_type: full`, no LoRA) sobre un corpus sintético generado específicamente para la campaña de entrenamiento: 192 personas sintéticas, 6.384 notas sintéticas y 2.575 preguntas sintéticas. No se utilizaron en ningún momento notas reales, cuerpos de texto, OCR o texto de preguntas reales, lo que fue una restricción explícita del proceso.

Tras el fine-tune, el modelo se fusionó y se cuantizó localmente con `mlx_lm` 0.31.1 / `mlx` 0.31.1. La cuantización es affine de 4-bit con group size 64, y el conversor reportó 4.508 bits por peso. El objetivo de entrenamiento es que el modelo emita un JSON pequeño con la intención temporal de la pregunta, usando decodificación greedy y temperatura 0 para garantizar determinismo.

## Capacidades

- Extracción de intención de fecha de preguntas en lenguaje natural (p. ej., "¿Qué notas tengo de la semana pasada?" → `{"intent":"last_week"}`).
- Generación de un objeto JSON pequeño y estructurado como salida.
- Soporte de decodificación greedy con temperatura 0, lo que produce salidas deterministas.
- Especializado en planificación de consultas, no en generación de texto libre.
- Capacidad de integración con motores de búsqueda deterministas para recuperación de información.
- Multilingüe: solo inglés.

## Casos de uso

- **Búsqueda personal en el dispositivo**: el modelo se usa en aplicaciones como SyncNotes para convertir una pregunta del usuario en una búsqueda determinista, permitiendo que la recuperación de notas se base en la intención temporal detectada.
- **Planificación de consultas en sistemas de recuperación**: integrado en un pipeline donde el modelo decide qué tipo de búsqueda ejecutar (por fecha, por relevancia, etc.), reduciendo la dependencia de métodos basados en palabras clave.
- **Asistentes personales**: para extraer intenciones temporales de comandos como "muéstrame mis tareas de ayer" y activar la búsqueda correspondiente en un sistema de tareas.
- **Búsqueda semántica híbrida**: combina el modelo con un motor de búsqueda tradicional para mejorar la precisión en consultas temporales, sin necesidad de modelos grandes.
- **Sistemas de control de versiones o registros**: en aplicaciones que requieren filtrar registros por fecha a partir de preguntas en lenguaje natural, por ejemplo, "¿qué cambios hice el martes?".
- **Pruebas de concepto de agentes de búsqueda**: como componente de un agente que necesita decidir si una consulta requiere una búsqueda temporal o una búsqueda general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es de creación reciente (agosto de 2026) y su evaluación no ha sido divulgada.

## Requisitos de hardware

- **VRAM estimada**: menos de 1 GB en inferencia con cuantización 4-bit (el repositorio ocupa 0.4 GB).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, incluyendo GPU integradas (p. ej., Apple Silicon con MLX, NVIDIA GTX 1650 o superior).
- **CPU**: puede ejecutarse en CPU sin GPU, gracias a su tamaño reducido.
- **Opciones de despliegue**: MLX (Apple), conversión a GGUF para llama.cpp, o integración con vLLM (aunque es más habitual para modelos grandes). También es compatible con TGI si se convierte a los formatos adecuados.
- **Latencia**: muy baja, típicamente inferior a 10 ms por consulta en GPU, y en el orden de 50-100 ms en CPU moderna.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas. El modelo se puede comparar con otros modelos de tamaño similar (0.8B) como el propio Qwen3.5-0.8B base, o con otros modelos de extracción de intenciones, pero no hay datos de benchmarks públicos. No se proporcionan alternativas comparables en la información disponible.

## Limitaciones y advertencias

- **Solo inglés**: el modelo solo soporta consultas en inglés; no se ha entrenado con otros idiomas.
- **No genera prosa**: no es un modelo de chat o generación de texto; su salida es un JSON de planificación de búsqueda.
- **Degeneración en prompts fuera de distribución**: el autor advierte que bajo prompts fuera de distribución el modelo puede emitir texto repetido sin cierre de llave. El llamador debe tratar la salida no parseable como un fallo de planificación y degradar a una búsqueda determinista.
- **Entrenamiento sintético**: el modelo se entrenó exclusivamente con corpus sintético, lo que puede limitar su generalización a datos reales con variabilidad lingüística.
- **Dependencia del base**: el rendimiento está ligado al modelo base Qwen3.5-0.8B; cualquier limitación de este (p. ej., sesgos, alucinaciones) puede heredarse.
- **Licencia Apache-2.0**: permite uso comercial, pero se debe revisar las restricciones del modelo base Qwen3.5-0.8B (aunque es también Apache-2.0 según los datos de la ficha).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/localgradient/Temporal-0.8B-v3-4bit)
- [Modelo base Qwen3.5-0.8B en Hugging Face](https://huggingface.co/mlx-community/Qwen3.5-0.8B)
