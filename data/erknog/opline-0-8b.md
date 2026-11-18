# erknog/opline-0.8b

## Resumen

Opline 0.8B es un modelo de lenguaje especializado en edición estructurada de documentos Markdown, desarrollado por el usuario erknog. Se trata de un ajuste fino mediante LoRA del modelo base Qwen3.5-0.8B (0,87 mil millones de parámetros), cuyo propósito es convertir una instrucción de edición en lenguaje natural en exactamente una operación estructurada (ADD, APP, DEL, RM, REP, INSB, INSA o UNDO) que un ejecutor determinista aplica sobre un documento Markdown numerado. El texto que el usuario no menciona permanece byte a byte idéntico, lo que convierte al modelo en un componente de bajo nivel para editores de texto asistidos por voz o por lenguaje natural.

La relevancia del modelo reside en su enfoque restringido: en lugar de generar texto libre, produce una única línea de operación con anclas copiadas literalmente del documento, delegando la aplicación del cambio a un ejecutor externo. Esto reduce el riesgo de modificaciones no deseadas y facilita la integración en pipelines donde la fidelidad del contenido es crítica. Con 873.438.784 parámetros, una ventana de entrenamiento de 1024 tokens y cuantización Q4_K_M de 517 MB, está diseñado para ejecutarse en hardware muy modesto, incluyendo CPU y Apple Silicon.

La versión documentada es la v1 (denominada `v6c`, fechada el 27 de octubre de 2026), con pesos de 16 bits tras fusionar el adaptador LoRA, instrucciones en inglés y soporte exclusivo para encabezados, párrafos y listas planas en Markdown. Su licencia Apache-2.0, heredada de Qwen3.5-0.8B, permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), ajuste fino con LoRA fusionado |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens de ventana de entrenamiento; el ejemplo de despliegue usa 2048 tokens de contexto en llama.cpp |
| Tipos de cuantizacion | Q4_K_M (GGUF, 517 MB); MLX 4-bit; pesos completos en bfloat16 |
| Idiomas soportados | Inglés (instrucciones y documentos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16), GGUF (Q4_K_M), MLX (4-bit), adaptador PEFT LoRA (r=16, alpha=16) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-0.8B, un transformer decoder-only de 0,87 mil millones de parámetros. El ajuste se realizó con LoRA de rango 16 y alpha 16 en precisión de 16 bits mediante la librería unsloth, con un presupuesto de 1130 pasos (2 épocas), batch efectivo de 32, secuencia de 1024 tokens y tasa de aprendizaje 2e-4 con decaimiento coseno. El conjunto de datos consta de 18.086 turnos de entrenamiento y 2.045 turnos de validación, cada uno compuesto por una instrucción de edición y la operación esperada. La mejor pérdida de evaluación fue 0,0119 en el paso 1000, y el adaptador se restauró a ese punto antes de fusionarse con los pesos base. El entrenamiento completo se ejecutó en una única RTX 4090 en 72 minutos.

La innovación principal no es arquitectónica sino de diseño de tarea: el modelo aprende a emitir una sola línea de operación con anclas copiadas byte a byte del documento (máximo 12 palabras, únicas, sin cortar tokens), y los números de línea son solo pistas que el ejecutor resuelve mediante las anclas. El texto dictado se normaliza (por ejemplo, "twenty five dollars" pasa a "$25"), pero se preserva el uso de mayúsculas dictado. El formato de prompt exige un mensaje de sistema fijo y `enable_thinking` desactivado, ya que de lo contrario la operación se genera dentro del campo `reasoning_content` en lugar del contenido principal.

## Capacidades

- Generación de operaciones de edición estructurada en Markdown: ADD, APP, DEL, RM, REP, INSB, INSA y UNDO, una por turno.
- Interpretación de instrucciones de edición en lenguaje natural en inglés ("Remove the sub heading in line 11" produce `DEL [L11] Questions and Answers`).
- Copia de anclas byte a byte desde el documento para garantizar la identidad del texto no mencionado.
- Normalización de texto dictado (números, moneda) preservando el uso de mayúsculas original.
- Soporte de un único turno de operación por invocación; los cambios múltiples requieren múltiples turnos.
- Integración con endpoints compatibles con OpenAI mediante llama.cpp (`llama-server`) y MLX (`mlx_lm.server`).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento extendido (thinking mode debe desactivarse).

## Casos de uso

- Edición de documentos por voz: un dictado como "borra el subtítulo de la línea 11" se transforma en una operación DEL que un ejecutor aplica sobre el archivo, manteniendo intacto el resto del contenido; el modelo cabe en 517 MB y puede ejecutarse en local.
- Asistentes de escritura con fidelidad estricta: en flujos donde el usuario no debe perder ni un carácter de su texto original, el modelo emite la operación y el ejecutor determinista aplica el cambio, evitando reescrituras completas del documento.
- Automatización de correcciones puntuales en documentación técnica: eliminación de fragmentos, inserción de párrafos antes o después de un ancla, o sustitución de términos concretos en archivos Markdown versionados.
- Integración en pipelines de CI/CD para documentación: un paso automatizado puede recibir instrucciones de edición y generar la operación que un script aplica sobre los `.md` del repositorio, con validación posterior del diff.
- Prototipado de editores colaborativos: el modelo actúa como capa de interpretación de intenciones de edición, delegando la aplicación y el control de versiones al backend.
- Despliegue en dispositivos de recursos limitados: con Q4_K_M y aproximadamente 0,9 GB de RAM/VRAM a 2k de contexto, puede ejecutarse en portátiles sin GPU dedicada o en Apple Silicon mediante MLX 4-bit.
- Normalización de dictado en herramientas de accesibilidad: conversión de cantidades habladas a formato numérico dentro de la operación de edición, preservando mayúsculas dictadas.

## Benchmarks y rendimiento

| Metrica | Resultado v1 |
|---|---|
| Pass en conjunto reservado (exacto + mismo documento + cercano) | 1966/2029 = 96,9% |
| Operación exacta | 1835/2029 = 90,4% |
| Rechazos del ejecutor | 5 |
| Suite manual de escenarios completos | 255/272 = 93,8% |
| Categoría más débil (append tras párrafo al final del archivo) | 45/53 = 85% |

La mayoría de los fallos restantes corresponden a la identidad byte a byte de las anclas (una cita que pierde un paréntesis, añade un punto o captura un fragmento vecino), no a la elección de la operación: solo 6 de los 63 fallos de la barrida eligen una operación incorrecta.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,9 GB con Q4_K_M a 2k de contexto (ventana de entrenamiento de 1k).
- GPU recomendadas: no requiere GPU dedicada; el entrenamiento se realizó en una RTX 4090, pero la inferencia está pensada para hardware modesto.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM libre; también en CPU y en Apple Silicon mediante MLX 4-bit.
- Opciones de despliegue: llama.cpp (`llama-server` con soporte Qwen3.5 y `--jinja`), MLX (`mlx_lm.server`), transformers con `AutoModelForImageTextToText` en bfloat16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Opline 0.8B | 873 M | 1024 tokens (entrenamiento) | Edición estructurada de Markdown, una op por turno | Apache-2.0 | Hugging Face (GGUF, safetensors, MLX, LoRA) |
| Qwen3.5-0.8B (base) | 0,8 B | No disponible | Generación de texto general | Apache-2.0 | Hugging Face |
| Alternativas especializadas en edición de texto | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El llamador debe proporcionar el documento con números de línea `[Lnn]`; el modelo no lee archivos por sí mismo.
- Una sola operación por turno; varios cambios requieren varios turnos.
- Ventana de entrenamiento de 1024 tokens: documentos de más de aproximadamente 1000 tokens degradan el rendimiento.
- Solo inglés y Markdown: listas anidadas, bloques de código, tablas, enlaces, citas, negrita y cursiva no son objetivos de edición.
- Las anclas son byte a byte, por lo que volver a renderizar el documento debilita el emparejamiento.
- Riesgo de alucinación en la cita de anclas: la mayoría de los fallos observados son anclas que no coinciden exactamente con el texto original.
- `enable_thinking` debe estar desactivado; de lo contrario, la operación se genera en el campo de razonamiento y no en el contenido.
- Licencia Apache-2.0 heredada de Qwen3.5-0.8B, sin restricciones adicionales para uso comercial conocidas.
- No se han documentado sesgos específicos más allá de los heredados del modelo base Qwen3.5-0.8B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erknog/opline-0.8b
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia: https://huggingface.co/erknog/opline-0.8b/blob/main/LICENSE
