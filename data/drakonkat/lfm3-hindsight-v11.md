# Drakonkat/lfm3-hindsight-v11

## Resumen

LFM3 Hindsight v11 es un adaptador LoRA experimental publicado por el usuario Drakonkat sobre el checkpoint base LiquidAI/LFM3-1.7B. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (2.342.912 parámetros, según el fichero safetensors) pensado para flujos de trabajo locales con Hindsight 1.1.0, una herramienta de gestión de memoria persistente para agentes. El adaptador se entrenó a partir de la revisión `1da06bec6a819da10b54c67e5c90972b46d81871` del modelo base con 7.749 ejemplos sintéticos.

El modelo base LFM3-1.7B es un transformer de LiquidAI de aproximadamente 1.700 millones de parámetros, y este adaptador añade capacidades específicas orientadas a tareas de memoria: operaciones de tipo Reflect (recuperar y razonar sobre información almacenada) y Retain (consolidar o actualizar recuerdos). El interés actual es acotado: se trata de un experimento de nicho, con cero descargas y cero likes en el momento de la consulta, que ilustra cómo se pueden adaptar modelos pequeños de código abierto a sub-tareas concretas de agentes mediante PEFT.

La relevancia práctica es limitada y debe evaluarse con cautela. El propio autor documenta fallos en las evaluaciones locales (Reflect devuelve respuestas irrelevantes en algunos casos y Retain puede perder correcciones), y recomienda validar los resultados críticos antes de confiar en el sistema para actualizaciones de memoria no supervisadas. La licencia lfm1.0 impone condiciones adicionales de redistribución y atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI LFM3-1.7B |
| Parámetros totales | 2.342.912 (adaptador); base LFM3-1.7B ≈ 1.700 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF para llama.cpp (adaptador); cuantizaciones del base no especificadas |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (PEFT) y GGUF (LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar de PEFT aplicado sobre el checkpoint LFM3-1.7B de LiquidAI. No se especifica en la información disponible el rango, los módulos objetivo ni la configuración exacta del adaptador. El entrenamiento se realizó sobre 7.749 ejemplos sintéticos generados para flujos de Hindsight 1.1.0, una herramienta de memoria para agentes que gestiona operaciones de retención (Retain) y reflexión (Reflect) sobre un banco de recuerdos.

No se documentan detalles sobre la composición del dataset, el número de tokens de entrenamiento, el uso de RLHF/DPO ni innovaciones técnicas adicionales. La propuesta es deliberadamente acotada: especializar un modelo pequeño en dos operaciones concretas de memoria mediante ajuste supervisado ligero, manteniendo el resto de capacidades del base intactas.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base LFM3-1.7B.
- Operación Reflect: recuperación y razonamiento sobre información almacenada en un banco de memoria, con respaldo en una fuente (según la evaluación del autor, 67 de 88 respuestas correctas con fuente).
- Operación Retain: consolidación y actualización de recuerdos, incluyendo secuencias de escritura de extremo a extremo (8 de 10 con configuración por defecto, 9 de 10 con instrucción de consolidación).
- Integración con llama.cpp mediante `--lora adapter.gguf --jinja` (build probado: b12282).
- Integración con PEFT usando los ficheros del repositorio y la revisión fijada del base.
- Soporte de tool calling, agentes multi-paso y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Memoria persistente para agentes locales: el adaptador permite que un agente pequeño retenga correcciones y hechos entre sesiones usando Hindsight 1.1.0, reduciendo la necesidad de un modelo mayor para tareas de memoria.
- Asistentes personales con historial: se puede usar para consolidar preferencias del usuario (Retain) y recuperarlas (Reflect) en conversaciones multi-turno, siempre con validación posterior.
- Prototipado de sistemas de memoria para investigación: sirve como banco de pruebas de bajo coste para estudiar cómo un LoRA pequeño afecta a operaciones de retención y recuperación.
- Pipelines de documentación interna: extracción y actualización de hechos a partir de fuentes locales, con el modelo base como motor de generación y el adaptador gestionando la memoria.
- Entornos con recursos limitados: al ser un adaptador de 2,3 millones de parámetros sobre un base de 1,7 mil millones, se puede desplegar en hardware modesto con llama.cpp.
- Evaluación comparativa de adaptadores de memoria: útil para investigadores que quieran contrastar estrategias de LoRA frente a otras aproximaciones (RAG, bases vectoriales) en tareas de retención.
- Integración en flujos de CI/CD para pruebas de regresión de memoria: el adaptador permite validar de forma automatizada si un sistema de memoria conserva o pierde correcciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye evaluaciones locales cualitativas:

| Evaluación local | Resultado |
|---|---|
| Reflect: respuestas correctas con fuente | 67 de 88 |
| Secuencias de escritura end-to-end (config. por defecto) | 8 de 10 |
| Secuencias de escritura end-to-end (con instrucción de consolidación) | 9 de 10 |
| Fallo conocido en Retain | Puede perder una corrección y dejar el valor anterior vigente |
| Fallo conocido en Reflect | Puede devolver una respuesta irrelevante aunque la petición se complete |

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable (2,3 millones de parámetros, unos pocos MB en FP16).
- VRAM para el modelo base LFM3-1.7B: aproximadamente 3,4 GB en FP16 y alrededor de 1-2 GB en cuantizaciones de 4 bits (estimación orientativa, no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para el base en cuantización; RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU consumer: sí, con el base cuantizado en GGUF.
- Opciones de despliegue: llama.cpp (build b12282 probado) con `--lora adapter.gguf --jinja`; PEFT con los ficheros del repositorio. vLLM, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3 Hindsight v11 (este) | 2,3 M (adaptador) + 1,7 B base | no disponible | LoRA para memoria (Hindsight) | lfm1.0 | Hugging Face, 0 descargas |
| LiquidAI LFM3-1.7B (base) | ≈1,7 B | no disponible | Modelo generalista pequeño | lfm1.0 | Hugging Face |
| Adaptadores LoRA genéricos para memoria | variable | variable | Memoria de agentes | variable | Hugging Face |

No se dispone de datos de rendimiento comparables con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción.
- Retain puede perder correcciones y dejar vigente el valor anterior, lo que puede provocar respuestas desactualizadas.
- Reflect puede devolver respuestas irrelevantes aunque la petición se complete correctamente.
- El autor recomienda validar los resultados críticos antes de confiar en el sistema para actualizaciones de memoria no supervisadas.
- Licencia lfm1.0 con condiciones de redistribución y atribución recogidas en LICENSE y NOTICE; es necesario revisarlas antes de uso comercial.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto no documentada; puede limitar conversaciones largas.
- Riesgo de alucinación inherente al modelo base y no cuantificado en la evaluación del adaptador.
- Dependencia de una revisión concreta del base (`1da06bec...`); usar otra revisión puede degradar el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Drakonkat/lfm3-hindsight-v11
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM1.0 (referenciada en el repositorio como LICENSE): https://huggingface.co/Drakonkat/lfm3-hindsight-v11/blob/main/LICENSE
- Aviso de atribución (NOTICE): https://huggingface.co/Drakonkat/lfm3-hindsight-v11/blob/main/NOTICE
- Repositorio de llama.cpp (build b12282 probado): https://github.com/ggml-org/llama.cpp
- PEFT: https://github.com/huggingface/peft
