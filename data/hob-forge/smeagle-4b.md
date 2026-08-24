# Hob-forge/smeagle-4b

## Resumen

smeagle-4b es un modelo de lenguaje compacto de 4.000 millones de parámetros, especializado en tareas agénticas, terminal y software engineering. Fue desarrollado por Hob Forge, un laboratorio independiente que publica modelos pequeños y especializados para ejecución en hardware modesto, y está fine-tuneado sobre la base Qwen/Qwen3.5-4B-Base. Su propósito principal es ofrecer una alternativa viable a los modelos de gran escala para equipos con pocos recursos: laptops, PCs con RAM limitada y GPUs modestas, donde puede ejecutarse en CPU o con una fracción de VRAM.

El modelo se distribuye únicamente en formato GGUF, con una ventana de contexto de 262K tokens y cuantizaciones que van desde 2,6 GB hasta 4,3 GB. Está diseñado para integrarse en flujos de trabajo de agente, con soporte nativo de tool calling y function calling, y es compatible con llama.cpp, Ollama y endpoints de estilo OpenAI. Su licencia, hobforge-community-1.0, permite uso comercial para la mayoría de usuarios, con condiciones específicas para laboratorios frontera y servicios con más de 10 millones de usuarios mensuales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-4B-Base) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés |
| Licencia | hobforge-community-1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura base de Qwen3.5-4B-Base, un transformer denso de 4.000 millones de parámetros, y ha sido fine-tuneado por Hob Forge con datos orientados a razonamiento de largo horizonte y prevención de bucles de fallo (anti-doom-loop). El autor no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset, pero sí reporta una reducción de pérdida del 26,9 % en los tokens de asistente frente a la base sin fine-tuning (0,568 → 0,415), medida sobre una partición reservada de evaluación. El modelo no ha sido abliterado y mantiene la identidad de smeagle únicamente cuando se le invoca sin un system prompt explícito, sin interferir con las instrucciones del usuario ni con las llamadas a herramientas.

El fine-tuning se centra en la generación de secuencias de acciones agénticas: leer antes de escribir, verificar antes de afirmar y reportar con honestidad. No se dispone de información pública sobre el uso de técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Tool calling nativo: emite llamadas a herramientas con formato `tool_calls` válido, sin necesidad de manipular el prompt.
- Funciones agénticas: edición de archivos, lectura y modificación de código, escritura y verificación de código.
- Encadenamiento multi-herramienta: puede coordinar varias llamadas a herramientas en una misma tarea.
- Razonamiento multi-paso con verificación: ejecuta cálculos y comprobaciones intermedias antes de dar una respuesta final.
- Software engineering: tareas de terminal, inspección de proyectos, sintaxis y validación de código.
- Especialista, no generalista: no está diseñado como chatbot conversacional ni como oráculo de conocimiento general.
- Idioma: exclusivamente inglés.

## Casos de uso

- Asistente de terminal local: el modelo puede listar archivos, describir un proyecto y sugerir comandos directamente desde la línea de comandos, gracias a su capacidad de tool calling y a su fine-tuning específico para tareas de terminal.
- Automatización de tareas de desarrollo en repositorios: integrado en un pipeline de CI/CD, puede leer el estado del repositorio, modificar archivos y verificar que el código resultante es sintácticamente válido antes de generar un commit.
- Agente de soporte técnico en entornos con pocos recursos: desplegado en una máquina con CPU y sin GPU, responde consultas sobre código y configuración de sistemas, ejecutando comandos de verificación cuando es necesario.
- Herramienta de refactorización asistida: el modelo puede recibir un fragmento de código, aplicar cambios de estilo o estructura y devolver el resultado con una comprobación previa de sintaxis.
- Automatización de tareas repetitivas de software: por ejemplo, contar palabras en un archivo, parsear logs o generar informes de estado del proyecto, combinando llamadas a herramientas con razonamiento multi-paso.
- Agente local en entornos de desarrollo integrado: integrado vía Ollama o llama.cpp en un IDE, actúa como asistente de código que invoca herramientas del sistema sin necesidad de conexión a servicios cloud.
- Prototipado de agentes con tool calling: dado su soporte nativo de schemas de herramientas, sirve como base para experimentos de agentes autónomos en hardware de consumo, con una huella de memoria de entre 4 y 6 GB.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. El autor publica dos medidas propias:

| Métrica | Valor |
|---|---|
| Pérdida en tokens de asistencia (held-out, vs base) | 0,415 frente a 0,568 (reducción del 26,9 %) |
| Tareas agénticas completadas (benchmark propio) | 5/5, sin fallos de protocolo de herramientas |

El benchmark agéntico propio incluye: construcción de un plugin con escritura y verificación de Python, encadenamiento multi-herramienta, lectura/modificación/escritura de archivos, cálculo multi-paso con verificación y recuento de palabras basado en herramientas. No se publican comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada por cuantización:
  - Q4_K_M: 2,6 GB, cabe en ~4 GB de RAM/VRAM.
  - Q5_K_M: 3,0 GB, cabe en ~5 GB.
  - Q6_K: 3,4 GB, cabe en ~5-6 GB.
  - Q8_0: 4,3 GB, cabe en ~6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050, RTX 4060); también funciona en CPU sola.
- Compatibilidad con GPU de consumo: sí, incluyendo laptops y mini-PCs con RAM limitada.
- Opciones de despliegue: llama.cpp, Ollama (con comando `ollama run hf.co/Hob-forge/smeagle-4b:Q8_0`), endpoints compatibles con OpenAI `/v1`.
- Latencia y throughput: no se proporcionan datos concretos; se espera que sea viable en CPU para tareas interactivas, dado su tamaño reducido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| smeagle-4b | 4,3 B | 262K | hobforge-community-1.0 | GGUF | Agéntica, terminal, SWE |
| Qwen3.5-4B-Base | 4,3 B | 262K | Apache-2.0 | safetensors | Base generalista |
| Qwen3.5-4B-Instruct-GGUF | 4,3 B | 262K | Apache-2.0 | GGUF | Instrucción generalista |

No se dispone de datos de rendimiento comparativo entre smeagle-4b y estos modelos en benchmarks estándar. La ventaja de smeagle-4b reside en su fine-tuning específico para tareas agénticas y tool calling, mientras que la base y la variante instruct de Qwen3.5-4B ofrecen un comportamiento más generalista.

## Limitaciones y advertencias

- Tamaño reducido: en tareas largas o complejas, un modelo de frontera con 100 veces más parámetros superará a smeagle-4b.
- Especialización: no es un modelo de chat generalista ni una fuente fiable de conocimiento general; su rendimiento óptimo se limita a tareas agénticas, terminal y software engineering.
- Idioma: solo inglés, sin soporte multilingüe declarado.
- Versión v0.1: el autor menciona una v0.2 que intercambia algo de capacidad SWE por mejoras agénticas, aún no publicada.
- Licencia con cláusulas específicas: obliga a atribución visible al redistribuir, y si el modelo se sirve a 10M+ usuarios mensuales o se utiliza por un laboratorio de IA de frontera, se exige divulgación pública del uso.
- Riesgo de alucinación: no se menciona explícitamente, pero es inherente a modelos de este tamaño; se recomienda verificación de las salidas en contextos de producción.
- Sin datos de benchmarks estándar: la evaluación publicada es propia del autor y no se ha verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hob-forge/smeagle-4b
- Colección de modelos de Hob Forge: https://huggingface.co/collections/Hob-forge/editions
- Modelo relacionado (Qwen3.5-4B-Instruct-GGUF): https://huggingface.co/Hob-forge/Qwen3.5-4B-Instruct-GGUF/tree/main
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
