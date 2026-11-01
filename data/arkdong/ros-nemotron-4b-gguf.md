# arkdong/ros-nemotron-4b-GGUF

## Resumen

ros-nemotron-4b es un ajuste fino mediante LoRA del modelo NVIDIA Nemotron 3 Nano 4B, desarrollado por el usuario arkdong como motor local del asistente de investigación "Ros" dentro de la aplicación ros.ai. El modelo está especializado en el bucle de agente de ros.ai: leer el lienzo (canvas) y los bloques seleccionados antes de responder, proponer cambios en el lienzo, reportar y analizar mediante las herramientas propias de la aplicación, y ejecutar investigación web de forma metódica. Se distribuye únicamente en formato GGUF cuantizado a Q4_K_M para su uso con llama.cpp.

La segunda ronda (r2b, 30 de octubre de 2026) añade una tarea específica: decidir la estructura del mapa de investigación tras el turno de cualquier agente, agrupando y enlazando bloques con seis palabras de enlace predefinidas (supports, contradicts, answers, uses data from, builds on, part of). El modelo base tiene 3.973.556.832 parámetros y una arquitectura híbrida que combina atención con capas Mamba-2, según se deduce de la mención al módulo `in_proj` en el entrenamiento.

Es relevante porque demuestra que un modelo de 4B parámetros, ajustado con LoRA sobre datos sintéticos generados por un profesor de 120B y cuantizado a 4 bits, puede superar al modelo base en tareas de agente estructuradas (66/95 frente a 33/95 en tareas retenidas) y acercarse al profesor en algunas tareas concretas, con un coste de entrenamiento de menos de una hora en una H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Mamba-2 y atención (según referencias al módulo `in_proj` y a atención q/k/v/o en el ajuste LoRA); detalles completos de la arquitectura del modelo base no disponibles |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens por slot en la evaluación con llama-server; 32.768 tokens en el ejemplo de uso del README |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada, 2,84 GB por archivo) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (modelo fusionado y cuantizado) y adaptador LoRA PEFT en safetensors (`adapter/`, `adapter-r2b/`) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, un transformer de 4B parámetros con capas Mamba-2 y atención. El ajuste se realizó con LoRA de rango 32 y alpha 64 aplicado a las proyecciones de atención (q/k/v/o), al MLP (up/down) y a la proyección de entrada de Mamba-2 (`in_proj`). El entrenamiento de la ronda 1 usó 2 épocas, tasa de aprendizaje 1e-4 con schedule coseno, sobre una única H100 durante 31,7 minutos; la pérdida de validación pasó de 0,54 en el modelo base a 0,403. El adaptador se fusionó en los pesos BF16, se convirtió con llama.cpp y se cuantizó a Q4_K_M.

Los datos de entrenamiento de la ronda 1 se generaron con NVIDIA Nemotron 3 Super (120B, MoE con 12B activos) a través del bucle de agente real de ros.ai: 1.351 peticiones de investigación sobre 160 proyectos sintéticos, con la web simulada (el profesor escribía resultados de búsqueda y páginas una vez por consulta y la comprobación de citas de ros.ai decidía qué hallazgos se mantenían). Se conservaron 1.140 muestras únicas válidas: 1.058 para entrenamiento y 82 para validación. Cada trayectoria se validó contra las reglas de ros.ai (leer antes de responder, una razón antes de cada llamada a herramienta, IDs exactos, respuestas breves). La ronda 2 añadió 1.976 turnos generados a partir de 314 mapas de investigación escritos por Nemotron 3 Super, con la estructura del mapa eliminada de cinco formas distintas (grupo desmontado, bloques fuera de su grupo, ambas, bloque sin sus enlaces, bloque que no necesita nada) y la forma original como respuesta. En total, 1.976 turnos de ronda 2 más 1.058 de ronda 1. El entrenamiento de la ronda 2 fue de 2 épocas en una H100 durante 46 minutos.

## Capacidades

- Generación de texto conversacional con soporte de razonamiento previo a la acción (el README menciona `--reasoning-budget 0` para desactivar el presupuesto de razonamiento en llama.cpp).
- Uso de herramientas (tool calling) específicas de ros.ai: búsqueda web, lectura de páginas, propuesta de cambios en el lienzo, generación de informes y análisis de conjuntos de datos.
- Ejecución de agentes multi-paso dentro del bucle de ros.ai, con reglas de comportamiento inducidas por entrenamiento (leer antes de responder, justificar cada llamada a herramienta, usar IDs exactos).
- Investigación web metódica: búsqueda en varias direcciones, lectura de páginas antes de citarlas y descarte de resultados débiles o fuera de tema.
- Agrupación y enlace de bloques en mapas de investigación: decisión de si un bloque necesita estructura, asignación a un grupo existente o nuevo, y enlace con seis palabras (supports, contradicts, answers, uses data from, builds on, part of).
- Capacidades multilingües: no disponibles (no se documentan).
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido más allá del razonamiento previo a la acción.

## Casos de uso

- Asistente de investigación local en ros.ai: el modelo lee el lienzo y los bloques seleccionados antes de responder, propone cambios y reporta mediante las herramientas de la aplicación. Es el caso de uso principal y el único para el que está entrenado explícitamente.
- Organización automática de mapas de investigación: tras el turno de un agente, decide qué bloques agrupar (en un grupo existente o en uno nuevo con título corto) y qué enlaces crear con las seis palabras predefinidas. Adecuado por su F1 de grupo de 0,93 en turnos retenidos de dominios no vistos.
- Búsqueda web con verificación de citas: el modelo busca en varias direcciones y lee las páginas antes de citarlas, lo que encaja en flujos donde la trazabilidad de fuentes es obligatoria.
- Generación de informes y notas a partir de datos recogidos: pasa todas las tareas de añadir notas (17/17) y la mayoría de tareas de informe, edición y conjuntos de datos en la evaluación del autor.
- Despliegue en hardware de consumo: con 2,84 GB en Q4_K_M, puede ejecutarse en GPU consumer modestas o en CPU mediante llama.cpp, lo que permite un asistente de investigación local sin conexión a servicios en la nube.
- Análisis de proyectos de datos científicos: en la evaluación superó al modelo base en el proyecto de datos climáticos de KNMI (8/10 frente a 3/10), lo que sugiere utilidad en flujos de análisis de datos estructurados dentro del bucle de ros.ai.
- Integración en pipelines de agentes con llama-server: el README proporciona un comando de arranque con contexto de 32.768 tokens, adecuado para servir el modelo como backend de un agente local.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre turnos retenidos y tareas de agente de ros.ai (no son benchmarks estándar como MMLU o HumanEval):

| Modelo | Tareas de agente retenidas (95) | Tareas KNMI (10) | F1 de grupo | F1 de enlace | Deja el mapa intacto cuando no hace falta |
|---|---|---|---|---|---|
| Nemotron 3 Nano 4B (base, Q4_K_M) | 33/95 | 3/10 | – | – | – |
| ros-nemotron-4b ronda 1 | 66/95 | 8/10 | 0,06 | 0 | 94% |
| Nemotron 3 Super (profesor, sin guías de tarea) | 52/95 (contexto 128k) | 9/10 | 0,30 | 0,19 | 35% |
| ros-nemotron-4b ronda 2 (r2b) | 68/95 | no disponible | 0,93 | 0,20 | 90% |

El autor señala que los enlaces son el punto débil: cuando la ronda 2 enlaza dos bloques, la palabra es correcta aproximadamente la mitad de las veces y la dirección unas seis de cada diez. Los resultados de la ronda 2 se midieron sobre 189 turnos retenidos de 29 mapas en dominios nunca entrenados, y las 95 tareas de agente sobre 11 proyectos (10 en dominios no vistos más el proyecto KNMI). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para el archivo Q4_K_M (2,84 GB) más overhead de contexto; con 32.768 tokens de contexto el consumo adicional de KV cache puede ser significativo, aunque no se publican cifras exactas.
- GPU recomendadas: el autor entrenó con una H100, pero para inferencia el tamaño permite GPUs consumer. No se especifican modelos concretos en la información disponible.
- Cabe en GPU consumer: sí, por tamaño (menos de 3 GB de pesos en Q4_K_M); no se detallan modelos concretos probados.
- Opciones de despliegue: llama.cpp mediante `llama-server` (comando documentado: `llama-server -m ros-nemotron-4b-Q4_K_M.gguf --jinja --reasoning-budget 0 -c 32768`). El autor usó llama-server con 65.536 tokens de contexto por slot en la evaluación. Otras opciones (vLLM, Ollama, TGI) no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas de agente retenidas (95) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ros-nemotron-4b r2b | 3,97B | 65.536 en evaluación | 68/95 | NVIDIA Nemotron Open Model License | GGUF Q4_K_M y adaptador LoRA en HuggingFace |
| NVIDIA Nemotron 3 Nano 4B (base) | 3,97B | no disponible | 33/95 | NVIDIA Nemotron Open Model License | BF16 en HuggingFace (nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16) |
| NVIDIA Nemotron 3 Super (profesor) | 120B (12B activos, MoE) | 128k | 52/95 sin guías de tarea | no disponible en la información | Disponible en Nebius Token Factory según el README |

La comparación es limitada porque los tres modelos se evalúan con el arnés específico de ros.ai, no con benchmarks estándar. El modelo base y el profesor son los únicos comparables documentados; no se dispone de datos frente a otros modelos de 4B de la misma categoría.

## Limitaciones y advertencias

- Entrenado para las herramientas y el system prompt de ros.ai: fuera de esa aplicación se comporta como un asistente general de 4B con una fuerte preferencia por usar esas herramientas, lo que puede producir llamadas inválidas o comportamiento errático en otros entornos.
- Los turnos de investigación siguen siendo débiles: ningún modelo, incluido el profesor, superó las tareas de investigación retenidas, y los turnos largos pueden agotar el contexto.
- La web del entrenamiento fue simulada, por lo que los resultados de búsqueda y páginas reales pueden diferir de lo aprendido.
- Es un modelo de 4B cuantizado a 4 bits: el autor recomienda verificar sus afirmaciones contra las fuentes que cita. Riesgo de alucinación relevante en citas y datos.
- Los enlaces entre bloques son poco fiables: palabra correcta aproximadamente la mitad de las veces y dirección en torno al 60%.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia NVIDIA Nemotron Open Model License: es una licencia "other" con términos específicos de NVIDIA; deben revisarse antes de uso comercial. El repositorio incluye LICENSE y NOTICE con la atribución.
- El modelo no documenta idiomas soportados, por lo que el rendimiento fuera del inglés es incierto.
- Solo se publica cuantización Q4_K_M; no hay versiones BF16 fusionadas ni otras cuantizaciones en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkdong/ros-nemotron-4b-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Repositorio de ros.ai: https://github.com/arkdong/ros-ai
- Código y resultados de entrenamiento: `training/ros-nemotron` dentro de https://github.com/arkdong/ros-ai
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Modelo profesor (Nemotron 3 Super): `nvidia/nemotron-3-super-120b-a12b`, servido en Nebius Token Factory (sin enlace directo en la información disponible)
