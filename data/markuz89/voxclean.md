# markuz89/voxclean

## Resumen

VoxClean es una familia de modelos pequeños especializados en la limpieza de dictado por voz (salida de Whisper) para la aplicación VoxLocal. Desarrollado por el usuario markuz89, el modelo toma transcripciones en bruto y las convierte en texto bien formateado: corrige puntuación y mayúsculas, elimina muletillas, aplica autocorrecciones habladas ("a las 3, digo a las 4") y ejecuta comandos de formato dictados en voz alta para producir un mensaje de chat, una lista con viñetas o un correo electrónico.

Se distribuye en dos variantes cuantizadas en GGUF: una basada en Qwen3-0.6B afinada y otra basada en Qwen3-1.7B con ajuste LoRA fusionado. La versión de 0.6B tiene 596.049.920 parámetros reales según los pesos safetensors, y el repositorio ocupa 1,5 GB. Esta primera versión solo soporta italiano.

La relevancia del modelo reside en su enfoque de tarea única y formato de entrada minimalista (sin instrucciones en lenguaje natural, solo etiquetas de modo, idioma y vocabulario), lo que lo hace ligero y determinista para integrarse en aplicaciones de dictado en local. La licencia Apache 2.0, heredada de los modelos base Qwen3, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3) |
| Parametros totales | 596.049.920 (variante 0.6B); variante 1.7B no disponible en detalle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (voxclean-0.6b-q4_k_m.gguf, 397 MB; voxclean-1.7b-q4_k_m.gguf, 1,1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only. La variante de 0.6B es un ajuste fino directo de Qwen/Qwen3-0.6B, mientras que la de 1.7B se obtuvo mediante ajuste LoRA sobre Qwen/Qwen3-1.7B y posterior fusión de los adaptadores. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal no está en la arquitectura, sino en el formato de entrada: el turno de usuario contiene etiquetas estructuradas (`<mode>`, `<lang>`, `<vocab>`) seguidas del dictado, con la plantilla de chat de Qwen3 y un bloque de pensamiento vacío. Los modos disponibles son `clean`, `message`, `bullets` y `email`, y se recomienda temperatura 0 para inferencia determinista. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Limpieza de texto dictado: corrección de puntuación y mayúsculas, eliminación de muletillas y vacilaciones.
- Aplicación de autocorrecciones habladas ("a las 3, digo a las 4").
- Ejecución de comandos de formato dictados en voz alta.
- Transformación del dictado en mensaje de chat (`message`), lista con viñetas (`bullets`) o correo electrónico (`email`).
- Uso de vocabulario personalizado mediante la etiqueta `<vocab>` para preservar nombres propios y términos técnicos.
- Soporte exclusivo de italiano en esta versión.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito (el bloque de pensamiento va vacío).

## Casos de uso

- Dictado en aplicaciones de notas: el modelo recibe la salida de Whisper y devuelve texto limpio con puntuación y mayúsculas correctas en modo `clean`, adecuado por su baja latencia al ser un modelo de 0.6B cuantizado a Q4_K_M.
- Redacción de correos por voz: el modo `email` convierte un dictado informal en un correo estructurado, útil en clientes de correo con integración local.
- Mensajería instantánea: el modo `message` transforma el dictado en un mensaje de chat conciso, pensado para asistentes de voz en aplicaciones de mensajería.
- Creación de listas de tareas: el modo `bullets` genera listas con viñetas a partir de dictados enumerativos, apropiado para aplicaciones de productividad.
- Preservación de terminología técnica: la etiqueta `<vocab>` permite incluir nombres de productos, personas o herramientas (por ejemplo, "GitLab, Anna") para que no se corrompan durante la limpieza, útil en entornos de desarrollo.
- Procesamiento por lotes de transcripciones: al ser un modelo pequeño y determinista (temperatura 0), puede procesar grandes volúmenes de transcripciones de Whisper en local sin depender de servicios en la nube.
- Integración en aplicaciones de escritorio o móviles: el tamaño reducido de los GGUF (397 MB y 1,1 GB) permite despliegue en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante de 0.6B en Q4_K_M (397 MB) requiere aproximadamente 1 GB de VRAM o RAM; la de 1.7B en Q4_K_M (1,1 GB) requiere aproximadamente 2 GB.
- GPU recomendadas: cualquier GPU consumer reciente es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en tarjetas con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) e incluso en CPU.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla la infraestructura.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| VoxClean 0.6B | 596 M | no disponible | italiano | Apache 2.0 | GGUF Q4_K_M |
| VoxClean 1.7B | no disponible | no disponible | italiano | Apache 2.0 | GGUF Q4_K_M |
| Qwen3-0.6B (base) | 596 M | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |
| Qwen3-1.7B (base) | no disponible | no disponible | multilingue | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos de limpieza de dictado.

## Limitaciones y advertencias

- Solo soporta italiano; no se ha validado su comportamiento en otros idiomas.
- Al ser un ajuste fino de modelos pequeños, puede alucinar o introducir cambios no solicitados en el texto, especialmente con dictados ambiguos o ruidosos.
- El formato de entrada es rígido: requiere las etiquetas `<mode>`, `<lang>` y la plantilla de chat de Qwen3 con bloque de pensamiento vacío; un uso incorrecto del formato puede degradar la salida.
- Se recomienda temperatura 0; otros valores pueden producir salidas inconsistentes.
- No se documentan sesgos específicos, pero al derivar de Qwen3 puede heredar sesgos de los datos de entrenamiento del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad en producción.
- El modelo tiene 0 descargas y 1 like en Hugging Face, por lo que carece de validación comunitaria extensa.
- No se especifican la longitud de contexto ni el número de tokens de entrenamiento, lo que limita la evaluación de su robustez en dictados largos.

## Enlaces

- Hugging Face: https://huggingface.co/markuz89/voxclean
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
