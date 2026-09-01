# scottlowry/sweep-next-edit-v2-7B-oQ6e

## Resumen

Sweep Next-Edit v2 es un modelo de lenguaje especializado en la predicción de la siguiente edición de código, desarrollado por Sweep AI. A diferencia de los autocompletados tradicionales que sugieren la siguiente línea, este modelo anticipa la próxima modificación que el desarrollador va a realizar en el archivo, lo que permite una asistencia más proactiva y contextual. La versión v2, con 7B parámetros, mejora la capacidad de manejar ediciones de mayor alcance y más complejas que su predecesor de 1.5B.

El repositorio `scottlowry/sweep-next-edit-v2-7B-oQ6e` es una cuantización mixta de 6 bits del modelo original, realizada con la herramienta oQ (oMLX) y publicada en formato MLX safetensors. Esta versión está optimizada para ejecutarse en hardware Apple Silicon mediante MLX, reduciendo el tamaño del modelo a 6.4 GB y permitiendo su uso en entornos con memoria unificada limitada. La cuantización mantiene la arquitectura Qwen2 subyacente y conserva la ventana de contexto de 32K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.713.772.032 (según safetensors; el modelo base se anuncia como 7B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 6 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | no disponible (el modelo base usa Apache-2.0) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base `sweepai/sweep-next-edit-v2-7B` se construye sobre la arquitectura Qwen2, un transformer decoder-only con atención causal. Según el blog de Sweep AI, el entrenamiento se centra en la tarea de "next-edit prediction": dado un archivo de código y el historial de ediciones recientes, el modelo predice la siguiente modificación. El proceso incluye una fase de fine-tuning supervisado seguida de optimización con DPO (Direct Preference Optimization) para alinear las predicciones con las preferencias humanas sobre ediciones útiles. El dataset de entrenamiento está compuesto por pares de ediciones reales extraídas de repositorios de código abierto, con un formato específico que codifica el contexto del archivo y la edición a realizar.

La versión cuantizada aquí presentada utiliza oQ (oMLX v0.6.4), que aplica una cuantización mixta de 6 bits con group size 64. Esto reduce el tamaño del modelo de los 15.2 GB originales a 6.4 GB, manteniendo la mayor parte del rendimiento gracias a la selección adaptativa de capas que requieren mayor precisión. El formato MLX safetensors es nativo para el framework MLX de Apple, optimizado para ejecución en GPU y CPU de Apple Silicon.

## Capacidades

- Predicción de la siguiente edición de código: el modelo recibe el contenido actual de un archivo y el historial de ediciones, y genera la próxima modificación probable (cambio de línea, inserción, borrado, refactorización).
- Autocompletado contextual: puede sugerir ediciones completas en lugar de solo tokens, lo que acelera tareas repetitivas como renombrar variables, ajustar firmas de funciones o aplicar patrones comunes.
- Soporte de múltiples lenguajes de programación: aunque no se especifican los idiomas exactos, el entrenamiento con repositorios abiertos cubre lenguajes populares como Python, JavaScript, TypeScript, Java, Go, etc.
- Ventana de contexto larga (32K tokens): permite procesar archivos extensos o múltiples archivos relacionados en una sola pasada, facilitando ediciones que dependen de código distante.
- Integración con IDE: diseñado para funcionar como motor de autocompletado en editores como VSCode, Neovim o Emacs, con latencia baja en hardware local.
- Ejecución local eficiente: gracias a la cuantización MLX, puede ejecutarse en Macs con Apple Silicon sin necesidad de GPU dedicada, preservando la privacidad del código.

## Casos de uso

- Autocompletado de código en IDE: el modelo se integra como extensión en VSCode o Neovim para sugerir ediciones completas mientras el desarrollador escribe. Su ventana de 32K tokens permite considerar todo el archivo y el historial reciente, ofreciendo cambios coherentes con el estilo del proyecto.
- Refactorización asistida: al detectar patrones repetitivos, el modelo propone renombrar variables, extraer funciones o ajustar firmas en múltiples lugares, reduciendo el trabajo manual y los errores.
- Migración de código entre versiones de APIs: con el contexto adecuado, puede predecir los cambios necesarios al actualizar una librería o framework, generando las ediciones correspondientes en los archivos afectados.
- Generación de tests unitarios: a partir de la implementación actual, el modelo puede sugerir la siguiente edición que añada casos de prueba, siguiendo las convenciones del proyecto.
- Corrección de errores comunes: si el historial muestra un patrón de corrección (por ejemplo, ajustar manejo de null), el modelo anticipa la edición correcta en nuevos puntos similares.
- Asistencia en code review: el modelo puede proponer ediciones que mejoren la legibilidad o el rendimiento, actuando como un revisor automático que sugiere cambios concretos en lugar de comentarios genéricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de Sweep AI menciona que la versión v1 (1.5B) superaba a modelos de más de 4 veces su tamaño en benchmarks de next-edit, pero no se proporcionan cifras concretas para v2 ni para esta cuantización. Se recomienda evaluar el modelo en el propio flujo de trabajo para medir su eficacia.

## Requisitos de hardware

- Tamaño del modelo cuantizado: 6.4 GB en disco, lo que requiere al menos 8 GB de RAM unificada en Apple Silicon para cargar los pesos en memoria.
- GPU recomendada: cualquier chip Apple Silicon (M1, M2, M3 o superior) con al menos 8 GB de memoria unificada. Para un rendimiento óptimo, se recomienda 16 GB o más.
- Compatibilidad con consumer GPU: no aplicable directamente, ya que el formato MLX está diseñado para Apple Silicon. Para GPUs NVIDIA se necesitaría una conversión a otro formato (por ejemplo, GGUF o GPTQ).
- Opciones de despliegue: el modelo se ejecuta con MLX (Python) o mediante herramientas que soporten este formato, como `mlx-lm` o `mlx_lm.server`. No es compatible directamente con vLLM, llama.cpp u Ollama sin conversión previa.
- Latencia estimada: no disponible. Depende del hardware y del tamaño de la entrada; en un MacBook Pro M2 con 16 GB, se espera una latencia de decodificación de decenas de milisegundos por token, adecuada para autocompletado interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Sweep Next-Edit v2 (base) | 7B | 32K | Next-edit prediction | Apache-2.0 | safetensors (BF16) |
| Sweep Next-Edit v2 (oQ6e, este) | 7B (cuantizado) | 32K | Next-edit prediction | no disponible | MLX safetensors (6-bit) |
| CodeLlama 7B | 7B | 16K | Generacion de codigo | Llama 2 license | safetensors, GGUF |
| DeepSeek Coder 6.7B | 6.7B | 16K | Generacion de codigo | MIT | safetensors, GGUF |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos directos. La principal diferencia de Sweep Next-Edit v2 es su enfoque en predecir ediciones completas, mientras que CodeLlama y DeepSeek Coder se centran en generación de código línea a línea.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado exclusivamente para next-edit prediction; no es adecuado para tareas de generación de texto general, chat o razonamiento fuera del ámbito de edición de código.
- Dependencia del historial de ediciones: su rendimiento depende de la disponibilidad de un historial de cambios reciente; en proyectos nuevos o sin historial, las predicciones pueden ser menos precisas.
- Posible degradación por cuantización: la cuantización de 6 bits puede introducir ligeras pérdidas de calidad en comparación con el modelo en BF16, especialmente en ediciones complejas o poco frecuentes.
- Sesgos del dataset: al entrenarse con repositorios de código abierto, puede reflejar estilos y prácticas dominantes en esos proyectos, lo que podría no alinearse con convenciones internas de equipos específicos.
- Riesgo de alucinación: como todo modelo generativo, puede sugerir ediciones que no compilan o que introducen errores; se recomienda revisión humana antes de aplicar cambios automáticamente.
- Licencia no especificada: aunque el modelo base es Apache-2.0, la cuantización no declara licencia; se debe contactar al autor para aclarar los términos de uso comercial.
- Soporte de idiomas no documentado: no se especifican los lenguajes de programación soportados; se asume cobertura de los más comunes, pero sin garantía.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/scottlowry/sweep-next-edit-v2-7B-oQ6e
- Modelo base en HuggingFace: https://huggingface.co/sweepai/sweep-next-edit-v2-7B
- Blog de Sweep AI sobre Next-Edit v2: https://yuhai.lu/blog/sweep-next-edit-v2/
- Blog de Sweep AI sobre Next-Edit v1: https://blog.sweep.dev/posts/oss-next-edit
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
