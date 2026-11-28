# purush0th/personaos-qwen3-4b-instruct-GGUF

## Resumen

PersonaOS Qwen3 4B Instruct es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507 de Alibaba, desarrollado por el usuario purush0th para PersonaOS, un asistente personal autoalojado. El modelo está entrenado específicamente para manejar con soltura las herramientas de PersonaOS (recordatorios, planificador diario, notas, memorias, objetivos y un tablero de sprints), así como para decidir cuándo no debe invocar ninguna herramienta ante preguntas simples, operaciones aritméticas o peticiones creativas.

Se distribuye únicamente en formato GGUF, en una única cuantización Q4_K_M de 2,5 GB, pensada para ejecutarse en GPUs de consumo. Con 4.022 millones de parámetros y una ventana de contexto recomendada de 16k tokens o más, es una opción realista para desplegar un asistente local en hardware modesto (el autor cita una RTX 3060 de 12 GB generando a unos 92 tokens/s).

Su relevancia actual radica en que demuestra un patrón de ajuste muy concreto: en lugar de perseguir benchmarks generales, optimiza el uso de herramientas y el formato de respuesta de una aplicación concreta. La model card es transparente sobre el método (LoRA con Unsloth), los datos (1.246 ejemplos sintéticos) y las limitaciones (solo inglés, dependiente del system prompt de PersonaOS).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507; detalles internos no disponibles) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 16k recomendado por el autor; el modelo base soporta más, pero no se especifica el máximo en la información disponible |
| Tipos de cuantización | Q4_K_M (única publicada) |
| Idiomas soportados | inglés (único idioma de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base no incluidos en este repo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.022 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA de rango 16 usando Unsloth, durante 2 épocas, con una tasa de aprendizaje de 5e-5. Los adaptadores se fusionaron con los pesos base y el resultado se cuantizó a Q4_K_M con llama.cpp.

El conjunto de entrenamiento consta de 1.246 ejemplos procedentes de 582 conversaciones. Los prompts sintéticos se enviaron a través de la propia aplicación PersonaOS contra datos de prueba ficticios, y solo se conservaron los turnos que terminaron correctamente. Las etiquetas son las respuestas finales de la aplicación tras sus propias comprobaciones. Los prompts se mantuvieron separados de las suites de evaluación y no se usó ningún dato personal. La pérdida en validación fue de 0,077 tras la primera época y 0,067 tras la segunda.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3-4B-Instruct-2507.
- Uso de herramientas (tool calling / function calling) específicamente entrenado para las herramientas de PersonaOS: recordatorios, planificador diario, notas, memorias, objetivos y tablero de sprints.
- Decisión de no invocar herramientas: el modelo aprende a responder directamente ante preguntas simples, sumas y peticiones creativas.
- Razonamiento multi-turno dentro de conversaciones con contexto largo (instrucciones y herramientas de PersonaOS ocupan unos 9.000 tokens).
- Razonamiento básico y aritmética a nivel de modelo pequeño (no evaluado de forma independiente).
- Integración con Ollama mediante plantilla de chat específica incluida en el GGUF (`template` idéntica a la de `qwen3:4b-instruct`).
- Capacidades multilingües: limitadas al inglés en entrenamiento; el comportamiento en otros idiomas no está documentado.

## Casos de uso

- Asistente personal autoalojado en el hogar: desplegado con Ollama en una GPU de consumo, gestiona recordatorios, notas y planificación diaria mediante las herramientas de PersonaOS, con contexto de 16k suficiente para cargar el system prompt completo y varias interacciones.
- Automatización de tareas de productividad personal: el modelo puede crear y actualizar entradas en el planificador, el tablero de sprints y la lista de objetivos, reduciendo la fricción de gestionar estas herramientas manualmente.
- Chat conversacional con memoria: el ajuste incluye el uso de la herramienta de memorias, lo que permite al asistente recordar preferencias y datos del usuario entre sesiones dentro de PersonaOS.
- Prototipado de agentes con tool calling: sirve como referencia de cómo ajustar un modelo pequeño para que respete un esquema de herramientas concreto y decida cuándo no usarlas, patrón replicable en otros dominios.
- Despliegue en hardware modesto: con 4,0 GB de VRAM a 16k de contexto en una RTX 3060, es viable en equipos de escritorio con GPU de 8 GB o más (sin servicios de voz adicionales).
- Integración en pipelines de CI/CD para pruebas de asistentes: sus suites de evaluación (`scripts/model-check.ps1`) y su formato GGUF facilitan la validación automatizada de regresiones en el comportamiento del asistente.
- Educación y experimentación: como ejemplo documentado de fine-tune LoRA con Unsloth sobre un modelo Qwen3 pequeño, es útil para quienes aprenden a construir asistentes especializados.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con las suites de prueba propias de PersonaOS dentro de la aplicación (`scripts/model-check.ps1`), 3 ejecuciones por escenario:

| Suite | Qwen3-4B-Instruct-2507 original | PersonaOS Qwen3 4B |
|---|---|---|
| core + extended | 96,3% | 97,8% |
| holdout | 100% | 100% |
| holdout2 | 100% | 100% |
| holdout3 | 95,6% | 100% |
| planner | 100% | 100% |

Con las correcciones posteriores de la aplicación, el modelo superó 465 de 465 comprobaciones a 5 ejecuciones por escenario. El propio autor advierte que estos resultados dependen de las comprobaciones de PersonaOS alrededor del modelo y no constituyen un benchmark general. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 4,0 GB con contexto de 16k; 5,3 GB con contexto de 32k (medido en RTX 3060 12 GB, Ollama 0.40.15, flash attention, caché q8_0).
- GPU recomendadas: RTX 3060 12 GB o superior; el autor recomienda 8 GB o más de VRAM y 16 GB de memoria del sistema.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más. Con los servicios de voz de PersonaOS (Whisper y Kokoro, 2,2 GB adicionales en la misma tarjeta), una GPU de 6 GB no es suficiente.
- Opciones de despliegue: Ollama (soporte nativo mediante `ollama pull hf.co/purush0th/personaos-qwen3-4b-instruct-GGUF:Q4_K_M`), llama.cpp (formato GGUF). No se mencionan vLLM ni TGI.
- Rendimiento medido: aproximadamente 92 tokens/s en RTX 3060 12 GB con contexto de 16k.
- Contexto mínimo recomendado: 16k, ya que las instrucciones y herramientas de PersonaOS ocupan unos 9.000 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PersonaOS Qwen3 4B Instruct | 4,02B | 16k recomendado | Asistente personal con tool calling específico | Apache 2.0 | GGUF en Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no especificado en la información disponible | Instrucciones generales | Apache 2.0 | Pesos completos en Hugging Face |
| Otros fine-tunes de Qwen3-4B para asistentes | no disponible | no disponible | Variable | variable | variable |

La comparación directa más relevante es con el modelo base: en las suites propias de PersonaOS, el fine-tune mejora entre 1,5 y 4,4 puntos porcentuales en las suites donde el base no llegaba al 100%. No se dispone de datos de benchmarks generales para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado exclusivamente para las herramientas y el system prompt de PersonaOS; fuera de ese entorno se comporta de forma similar al modelo base y no ha sido probado para uso general.
- Modelo pequeño: puede equivocarse, malinterpretar fechas y horas o invocar la herramienta incorrecta; el autor recomienda verificar cualquier información importante.
- Solo inglés en entrenamiento; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en tareas de razonamiento o datos factuales.
- Sesgos: no se documentan sesgos específicos del fine-tune; hereda los del modelo base Qwen3, no detallados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías, y el usuario es responsable de su uso y de verificar las respuestas.
- No está hecho, respaldado ni soportado por Qwen ni Alibaba Cloud.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales; no se ofrecen otras cuantizaciones.
- El uso de la plantilla de chat correcta es crítico: sin ella, Ollama aplica una plantilla genérica de Qwen3 que antepone `
