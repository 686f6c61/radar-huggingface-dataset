# MagicNoThief/handy-editor-lfm2.5-350m

## Resumen

Handy Editor 350M es un modelo de lenguaje de 354 millones de parámetros desarrollado por MagicNoThief que convierte transcripciones crudas de dictados en texto limpio y corregido. El modelo está especializado en tres tareas que en el habla ocurren simultáneamente: eliminar muletillas y disfluencias, restaurar puntuación y capitalización, y detectar cuándo el hablante cambia de idea a mitad de frase para borrar la parte abandonada y conservar solo la versión final. Está fine-tuneado a partir de LiquidAI/LFM2.5-350M y diseñado para ejecutarse localmente en dispositivos edge.

Con una ventana de contexto no publicada y 354 millones de parámetros, el modelo obtiene el mismo resultado (68/68 en una suite de autocorrección) que un modelo generalista de 4B, pero con un tamaño 7 veces menor y una latencia unas 3 veces menor: aproximadamente 100 ms en una RTX 3060 con la cuantización Q4_K_M, que ocupa solo 229 MB. Esa relación entre precisión, velocidad y tamaño lo hace especialmente relevante para aplicaciones de dictado en tiempo real donde no se puede esperar a un modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en LFM2.5-350M (arquitectura no especificada por el autor) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0, F16 (formato GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de LiquidAI/LFM2.5-350M, un modelo de 350 millones de parámetros de Liquid AI. Según una fuente externa sobre el modelo base, LFM2.5-350M fue entrenado en 28T tokens con aprendizaje por refuerzo y está orientado a tareas de agente en entornos edge. Para este fine-tune se utilizó el dataset MagicNoThief/handy-dictation-editing. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre la técnica de alineación empleada.

El autor destaca una particularidad en el diseño del prompt: la tarea está codificada en los pesos del modelo y no se debe añadir una instrucción explícita. En un experimento con un checkpoint anterior, añadir la instrucción empeoró el resultado (57/68 frente a 54/68). Además, al usar llama.cpp es obligatorio enviar un mensaje de sistema vacío en lugar de omitirlo; el renderizado de chatml genera el bloque de sistema aunque esté vacío, y esa diferencia supone 7 puntos en la suite de evaluación (66/68 frente a 59/68).

## Capacidades

- Edición de transcripciones de dictado: elimina muletillas y repeticiones (como "um", "uh" o "no wait").
- Corrección automática de puntuación y capitalización.
- Manejo de cambios de opinión: detecta cuándo el hablante abandona una frase y borra esa parte, manteniendo solo lo que finalmente dijo.
- Generación determinista (greedy) para obtener salidas reproducibles, evitando la variabilidad que rompería una transcripción correcta.
- Formato de chat: acepta una única interacción de usuario con la transcripción y devuelve el texto corregido.
- Integración con transformers (safetensors) y llama.cpp (GGUF).
- No se indica soporte de tool calling, function calling ni agentes multicapa en este fine-tune.
- Solo soporta inglés.

## Casos de uso

- Dictado asistido en aplicaciones móviles: el modelo puede ejecutarse en un smartphone o portátil sin GPU, convirtiendo la transcripción cruda del ASR en texto limpio en menos de 100 ms, sin un retardo perceptible.
- Transcripción de reuniones: después de un servicio de reconocimiento de voz, el modelo limpia los turnos de palabra para que las actas sean legibles, eliminando muletillas y gestionando interrupciones.
- Accesibilidad para personas con discapacidad: un usuario que dicta texto obtiene un resultado correcto sin tener que revisar ni corregir manualmente, gracias a la alta precisión y la baja latencia.
- Documentación médica o legal: donde la exactitud del texto final es crítica y los dictados suelen contener correcciones y frases abandonadas, este modelo reduce el tiempo de revisión.
- Notas rápidas en el lugar de trabajo: integración en herramientas de toma de notas (como Handier) para procesar dictados de voz y generar notas estructuradas al instante.
- Post-procesado en pipelines de ASR: como capa de mejora en flujos de transcripción, por ejemplo después de Whisper, sustituyendo la edición manual por una automatización determinista.

## Benchmarks y rendimiento

| Metrica | Q4_K_M | Q8_0 | F16 |
|---|---|---|---|
| Self-correction suite (68 casos) | 68/68 | 68/68 | 68/68 |
| — cut (46 casos que deben borrar) | 46/46 | 46/46 | 46/46 |
| — keep (22 casos que no deben borrar) | 22/22 | 22/22 | 22/22 |
| Held-out exact match (2.152 filas) | 97.4% | 97.7% | 97.7% |
| Held-out mean word-F1 | 0.999 | 0.999 | 0.999 |
| Latencia mediana (RTX 3060, Vulkan) | ~100 ms | ~100 ms | ~120 ms |
| Tamaño del modelo | 229 MB | 379 MB | 711 MB |

La suite de autocorrección está compuesta por 68 casos escritos a mano e independientes del conjunto de validación. El conjunto held-out se separó por fuente, no por división aleatoria: las transcripciones reales provienen de un split que el proceso de entrenamiento nunca lee, y las filas sintéticas usan una semilla diferente con cada entrada de entrenamiento excluida manualmente. El autor también compara el resultado con un modelo generalista de 4B que necesita 350 ms y 1.67 GB para alcanzar el mismo 68/68, mientras que este modelo lo consigue con 229 MB y ~100 ms.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M, el archivo pesa 229 MB; Q8_0, 379 MB; F16, 711 MB. Con el overhead de generación, una GPU con al menos 1 GB de VRAM es suficiente. En CPU, el modelo cabe en RAM sin problema.
- GPU recomendada: se ha medido en una RTX 3060 con Vulkan; no se requieren GPUs de gama alta. El autor indica que está diseñado para portátiles sin GPU.
- Opciones de despliegue: mediante transformers con safetensors, o con llama.cpp usando GGUF. La herramienta Handier lo integra como capa de mejora local. No se menciona vLLM ni TGI.
- Latencia y throughput: generación greedy con ~100 ms de mediana en RTX 3060 con Vulkan para Q4_K_M y Q8_0, y ~120 ms para F16. En CPU será mayor, pero el autor indica que es lo suficientemente rápido para que la pausa no sea perceptible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Suite (68 casos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| handy-editor-lfm2.5-350m | 354M | no disponible | 68/68 | lfm1.0 | HuggingFace |
| LFM2.5-350M (base) | 350M | no disponible | no evaluado en esta tarea | lfm1.0 | HuggingFace |
| Modelo 4B generalista (sin especificar) | ~4B | no disponible | 68/68 | no disponible | no disponible |

El modelo 4B citado por el autor alcanza la misma puntuación en la suite de autocorrección, pero con un coste de 1.67 GB y 350 ms por generación, frente a los 229 MB y ~100 ms de este modelo.

## Limitaciones y advertencias

- Solo soporta inglés (etiqueta "en").
- Es un modelo de tarea única: limpieza de dictado. No se documentan capacidades generales de conversación ni de seguimiento de instrucciones.
- No se han publicado benchmarks generales (MMLU, HumanEval, GSM8K, etc.) para este fine-tune; la evaluación se centra exclusivamente en edición de transcripciones.
- Al ser generativo, aunque sea greedy, existe riesgo de que modifique texto que ya era correcto. El puntaje "keep" (22/22) mitiga este riesgo, pero no lo elimina en casos fuera de la distribución.
- El rendimiento depende del formato del prompt. Con llama.cpp es obligatorio enviar un mensaje de sistema vacío; si se omite, el modelo puede empezar a responder etiquetas como "SAME" o "CHANGED" y fallar la tarea.
- La licencia lfm1.0 es una licencia "other" cuyas condiciones deben revisarse antes de cualquier uso comercial.
- El dataset de entrenamiento no tiene una descripción pública detallada; los posibles sesgos lingüísticos se limitan al inglés hablado de la fuente de datos.

## Enlaces

- HuggingFace: https://huggingface.co/MagicNoThief/handy-editor-lfm2.5-350m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Dataset de fine-tune: https://huggingface.co/datasets/MagicNoThief/handy-dictation-editing
- Repositorio Handier: https://github.com/MagicNoThief/Handier
- Scripts de evaluación: https://github.com/MagicNoThief/Handier/tree/main/scripts/enhance-eval
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
- Artículo sobre LFM2.5-350M: https://aihola.com/article/liquid-ai-lfm25-350m-agent
