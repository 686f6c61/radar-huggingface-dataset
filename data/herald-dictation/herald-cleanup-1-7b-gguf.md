# herald-dictation/herald-cleanup-1.7B-GGUF

## Resumen

Herald cleanup 1.7B es un modelo de lenguaje especializado en la limpieza de texto dictado, desarrollado por herald-dictation como componente del proyecto Herald, una herramienta de dictado privada y offline. El modelo toma una transcripción cruda de voz (con puntuación ausente, mayúsculas incorrectas, muletillas y autocorrecciones habladas) y devuelve únicamente el texto limpio y legible. Está afinado a partir de Qwen3-1.7B mediante LoRA fusionado en los pesos y distribuido en formato GGUF cuantizado a Q8_0, lo que lo hace ejecutable en equipos con 8 a 16 GB de memoria.

La relevancia del modelo radica en su enfoque de despliegue local: al ser un modelo pequeño (1.720.574.976 parámetros) y cuantizado, puede correr en ordenadores de consumo sin depender de servicios en la nube, algo crítico para una herramienta de dictado que procesa contenido potencialmente sensible. El modelo está entrenado exclusivamente con grabaciones públicas (AMI, VoxPopuli, LibriSpeech) y dictados sintéticos, sin datos privados de usuarios.

Se distribuye bajo licencia Apache 2.0 y solo soporta inglés. El repositorio tiene un tamaño de 1,8 GB y contiene el archivo `herald-cleanup-1.7B-Q8_0.gguf`. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros. Sobre esa base se aplicó un ajuste fino mediante LoRA, cuyos adaptadores se fusionaron posteriormente en los pesos del modelo base. El resultado se convirtió a formato GGUF y se cuantizó a Q8_0, generando un archivo de 1.834.426.016 bytes con SHA-256 `e14fa068697d6c1ac1a8470318b408dd21075c62ce456630dd1007e99d0fd445`.

Los datos de entrenamiento provienen exclusivamente de fuentes públicas y sintéticas: transcripciones de reuniones AMI (CC BY 4.0), VoxPopuli (CC0) y LibriSpeech (CC BY 4.0), junto con dictados de práctica generados para cubrir diversos dominios y tipos de mensaje, incluyendo muletillas, correcciones habladas y listas dictadas. Las respuestas de ejemplo empleadas en el entrenamiento fueron escritas por Gemma 4 26B-A4B (Google, Apache 2.0). No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo está diseñado para operar con el modo de razonamiento desactivado (`enable_thinking: false`), de modo que devuelve directamente el texto limpio sin pasos intermedios.

## Capacidades

- Limpieza de texto dictado: inserta puntuación, corrige mayúsculas, elimina muletillas y resuelve autocorrecciones habladas (por ejemplo, "quiero decir" o repeticiones).
- Normalización de listas dictadas: convierte enumeraciones habladas en texto estructurado.
- Generación de texto conversacional en inglés, heredada de la base Qwen3-1.7B.
- Procesamiento de transcripciones provenientes de modelos de reconocimiento de voz (ASR), ya que se entrenó con salidas reales de ASR sobre grabaciones públicas.
- Operación con razonamiento desactivado: no genera cadenas de pensamiento, solo la salida limpia.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Dictado offline en escritorio: el modelo se integra en la herramienta Herald para limpiar en local el texto transcrito por ASR, sin enviar datos a la nube. Su tamaño y cuantización Q8_0 permiten ejecutarlo en equipos de 8 a 16 GB de memoria.
- Procesamiento de actas de reuniones: a partir de transcripciones de reuniones (similares a las del corpus AMI), el modelo puede convertir el texto crudo en actas legibles con puntuación y estructura, eliminando repeticiones y muletillas.
- Accesibilidad para usuarios con movilidad reducida: personas que dependen del dictado por voz pueden obtener texto escrito limpio y publicable sin revisión manual extensa.
- Generación de notas clínicas o de campo: profesionales que dictan observaciones pueden usar el modelo para obtener registros legibles antes de incorporarlos a un sistema de historia clínica o de gestión.
- Preprocesado en pipelines de subtitulado: el modelo puede limpiar transcripciones automáticas de audio antes de generar subtítulos, mejorando la legibilidad sin intervención humana.
- Transcripción de entrevistas y periodismo: limpieza de transcripciones de entrevistas grabadas para su publicación o archivo, con corrección de autocorrecciones y enumeraciones habladas.
- Integración en aplicaciones de mensajería por voz: limpieza de mensajes dictados antes de enviarlos, manteniendo la privacidad al ejecutarse localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa aproximadamente 1,8 GB; se recomienda al menos 2-3 GB de memoria libre para el modelo y el contexto, aunque el autor indica que Herald lo ejecuta en equipos con 8 a 16 GB de memoria total.
- GPU recomendadas: no disponible. Al ser un modelo de 1,7B en Q8_0, cabe en GPUs de consumo con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, GTX 1660), aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño y cuantización, en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-server`), con los parámetros `--jinja --reasoning-budget 0 --chat-template-kwargs '{"enable_thinking":false}'`. También es compatible con endpoints (`endpoints_compatible` según los tags). No se documenta soporte explícito de vLLM, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| herald-cleanup-1.7B-GGUF | 1,72B | no disponible | Ingles | Apache 2.0 | GGUF Q8_0 | Limpieza de dictado |
| Qwen3-1.7B (base) | 1,72B | no disponible | Multilingue | Apache 2.0 | safetensors, GGUF | Generacion general |
| Modelos de limpieza de texto genericos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas específicas de limpieza de dictado no está disponible en la información proporcionada. El modelo base Qwen3-1.7B es la referencia directa más cercana, del que hereda arquitectura y tamaño, pero no está especializado en limpieza de dictado.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni evaluado en otros idiomas.
- Entrenado exclusivamente con grabaciones públicas y dictados sintéticos, lo que puede introducir sesgos de dominio (reuniones, lectura de libros, discursos parlamentarios) y un rendimiento inferior en jergas muy específicas o acentos no representados.
- Riesgo de alucinación: al ser un modelo generativo, puede alterar el contenido dictado, añadir texto no pronunciado o eliminar información relevante al "limpiar". No se documentan evaluaciones de fidelidad.
- No se especifica la longitud de contexto, lo que limita la planificación para dictados largos.
- El modo de razonamiento debe desactivarse explícitamente; si se deja activado, el modelo podría devolver cadenas de pensamiento en lugar del texto limpio.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo se distribuye sin garantías y sin evaluación de sesgos publicada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso en producción ni informes de la comunidad.
- No se documentan mecanismos de tool calling ni integración con agentes, lo que limita su uso en pipelines complejos.

## Enlaces

- Hugging Face: https://huggingface.co/herald-dictation/herald-cleanup-1.7B-GGUF
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- llama.cpp: https://github.com/ggml-org/llama.cpp
