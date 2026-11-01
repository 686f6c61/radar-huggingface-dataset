# category271/whispernow-qwen3.5-4b

## Resumen

WhisperNow Qwen3.5 4B es un ajuste fino completo (full fine-tune) de Qwen/Qwen3.5-4B-Base, desarrollado por el usuario category271 y diseñado específicamente para limpiar transcripciones de ASR (reconocimiento automático del habla). El modelo elimina muletillas, falsos arranques y repeticiones, aplica las autocorrecciones del hablante y ajusta el formato (puntuación, mayúsculas, listas) sin alterar el contenido ni el tono del dictado. Es el paso de limpieza local de WhisperNow, una aplicación de escritorio de dictado.

Su relevancia radica en que resuelve un problema real del flujo dictado-transcripción: los ASR devuelven texto crudo lleno de disfluencias que las herramientas convencionales no corrigen sin alterar el significado. El autor lo posiciona como el más preciso de una familia de tres modelos de limpieza, superando en errores factuales por cada 1.000 palabras tanto a un modelo cloud (glm-5.3-flash) como a su hermano pequeño LFM2.5 2.6B, con la ventaja de ejecutarse completamente en local.

Técnicamente, es un modelo de generación de texto de unos 4.206 millones de parámetros, entrenado sobre el dataset propio whispernow-cleanup, disponible en safetensors y GGUF, con licencia Apache 2.0 y orientado al idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de generación de texto (base Qwen3.5-4B-Base), detalles no disponibles |
| Parametros totales | 4.205.751.296 (4,21 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE; se asume densa) |
| Longitud de contexto | 8.192 tokens (valor usado en la configuración de llama.cpp recomendada) |
| Tipos de cuantizacion | Q8_0 (GGUF); pesos originales en bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (endpoints compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de Qwen/Qwen3.5-4B-Base, un transformer de generación de texto de la familia Qwen3.5. No se han publicado detalles sobre la arquitectura interna del modelo base (número de capas, cabezas de atención, tipo de atención) ni sobre el uso de técnicas como GQA o decodificación especulativa. El entrenamiento se realizó sobre el dataset category271/whispernow-cleanup, que codifica las reglas de limpieza que WhisperNow enviaba previamente a modelos cloud: eliminación de muletillas y tartamudeos, aplicación de autocorrecciones del hablante, corrección gramatical conservadora, formateo de listas, conversión de puntuación hablada a símbolos y salida del token `EMPTY` cuando no hay contenido dictado.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá del propio whispernow-cleanup, ni el uso de RLHF o DPO. Dado que se trata de un fine-tune supervisado para una tarea de transformación de texto acotada, lo más probable es un entrenamiento SFT estándar, aunque el autor no lo especifica. La inferencia recomendada usa decodificación greedy (temperature 0) con repeat penalty de 1.05 sobre prompt y respuesta.

## Capacidades

- Limpieza de transcripciones ASR: elimina muletillas ("um", "like", "you know"), tics verbales, tartamudeos, palabras repetidas y falsos arranques.
- Aplicación de autocorrecciones: cuando el hablante se corrige ("no wait", "scratch that"), conserva solo la versión corregida y descarta la marca de corrección.
- Corrección gramatical conservadora: arregla gramática, ortografía, puntuación y mayúsculas manteniendo las palabras, el tono, los matices ("maybe", "I think") y las causas ("because...") del hablante.
- Formateo inteligente: convierte listas de la compra, tareas, pasos, recetas y notas de reunión en listas con viñetas; mensajes, relatos y explicaciones permanecen como frases. No usa negritas, cursivas, encabezados ni rayas (em dashes).
- Normalización de cifras: escribe cantidades, conteos, fechas, horas y porcentajes en dígitos, y convierte puntuación hablada ("dash dash help") en los símbolos reales.
- Preservación literal de código, rutas y URLs tal como se dictaron.
- Comportamiento seguro ante preguntas y comandos: los limpia como texto, nunca los responde ni los ejecuta.
- Detección de vacío: devuelve `EMPTY` cuando la transcripción no contiene palabras dictadas (solo ruido o muletillas).
- No es un modelo conversacional general: está especializado en la tarea de limpieza de transcripciones.

## Casos de uso

- Limpieza local de dictados en la app WhisperNow: el caso de uso principal; el modelo procesa la transcripción del ASR en el escritorio sin enviar datos a la nube, ideal para contenido sensible (notas médicas, legales o empresariales).
- Postprocesado de notas de voz en flujos de productividad: convierte notas habladas con autocorrecciones ("envíalo el viernes, no, el jueves") en texto limpio y accionable, manteniendo la intención final del hablante.
- Transcripción de reuniones con formateo automático: sobre entradas tipo bench-long (dictados de 151 a 946 palabras, incluidos turnos reales del corpus AMI), genera actas y notas de reunión con listas estructuradas.
- Preparación de texto para agentes o pipelines NLP downstream: al normalizar cifras, fechas y puntuación hablada, produce texto más fácil de parsear por sistemas de extracción de entidades o automatizaciones.
- Accesibilidad y dictado asistido: personas que dictan por motivos de accesibilidad obtienen texto legible sin edición manual, con listas y formato generados automáticamente.
- Integración en aplicaciones de escritorio vía llama.cpp: el comando `llama-server -hf category271/whispernow-qwen3.5-4b:Q8_0 --jinja -c 8192` levanta un servidor compatible con la API de OpenAI en segundos, fácil de embeber en cualquier app local.
- Filtrado de ruido en transcripciones: devuelve `EMPTY` cuando no hay contenido real, lo que permite descartar automáticamente segmentos inútiles en flujos batch.

## Benchmarks y rendimiento

El autor publica métricas propias de la tarea (errores factuales por cada 1.000 palabras sobre el test split y los benchmarks propios) y latencias medidas con Q8_0:

| Modelo | Fichero Q8_0 | Memoria en uso | Errores factuales / 1.000 palabras | 100 / 1.000 palabras, GPU | 100 / 1.000 palabras, CPU |
|---|---|---|---|---|---|
| LFM2.5 1.2B | 1,25 GB | 1,6 GB | 6,32 | 0,18 / 2,0 s | 2,3 / 27 s |
| LFM2.5 2.6B | 2,87 GB | 3,3 GB | 4,88 | 0,34 / 3,8 s | 5,4 / 65 s |
| Qwen3.5 4B (este modelo) | 4,48 GB | 5,3 GB | 3,01 | 0,62 / 7,2 s | 8,9 / 118 s |

Comparativas adicionales publicadas por el autor: comete 0,81 veces los errores factuales del modelo cloud glm-5.3-flash a razonamiento bajo (intervalo del 90 %: 0,76–0,87) y 0,62 veces los de LFM2.5 2.6B (0,58–0,66). No supera a glm-5.3 a máximo razonamiento en dictados de más de 100 palabras (es inferior hasta 25 palabras, igualado entre 26 y 100, y superior en errores por encima de 100).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: 5,3 GB de memoria en uso con el fichero Q8_0 (4,48 GB de pesos), según mediciones del autor.
- Cabe en GPUs de consumo: sí; con 5,3 GB funciona en GPUs como una RTX 3060 de 8 GB, RTX 4060 o superiores. No se requieren A100 ni H100 para esta tarea.
- CPU: viable pero lenta; el autor mide 8,9 segundos para 100 palabras y 118 segundos para 1.000 palabras en CPU.
- GPU (rendimiento publicado): 0,62 s para 100 palabras y 7,2 s para 1.000 palabras.
- Despliegue:
  - llama.cpp / llama-server (recomendado por el autor, con plantilla de chat incluida en el GGUF): `llama-server -hf category271/whispernow-qwen3.5-4b:Q8_0 --jinja -c 8192`
  - Transformers (safetensors, bfloat16, `device_map="auto"`)
  - Compatible con endpoints de inferencia de Hugging Face (endpoints_compatible)
  - No se menciona soporte explícito de vLLM, TGI u Ollama
- Ajustes de inferencia recomendados: decodificación greedy (temperature 0), repeat penalty 1.05 con `repeat_last_n` 4096, límite de respuesta de 2,5 tokens por palabra del transcript (mínimo 64).

## Comparativa con modelos similares

Comparativa con los otros dos modelos de la familia WhisperNow publicados por el mismo autor, especializados en la misma tarea:

| Modelo | Parametros | Fichero Q8_0 | Memoria en uso | Errores factuales / 1.000 palabras | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WhisperNow LFM2.5 1.2B | no disponible | 1,25 GB | 1,6 GB | 6,32 | no disponible | https://huggingface.co/category271/whispernow-lfm2.5-1.2b |
| WhisperNow LFM2.5 2.6B | no disponible | 2,87 GB | 3,3 GB | 4,88 | no disponible | https://huggingface.co/category271/whispernow-lfm2.5-2.6b |
| WhisperNow Qwen3.5 4B (este) | 4,21 B | 4,48 GB | 5,3 GB | 3,01 | Apache 2.0 | https://huggingface.co/category271/whispernow-qwen3.5-4b |

El Qwen3.5 4B es el más preciso de los tres, a cambio de mayor huella de memoria y menor velocidad (7,2 s frente a 3,8 s y 2,0 s por 1.000 palabras en GPU). Frente a alternativas cloud como glm-5.3-flash, ofrece menor tasa de errores factuales y ejecución local; frente a glm-5.3 a máximo razonamiento, pierde en dictados largos (más de 100 palabras).

## Limitaciones y advertencias

- Monolingüe en inglés: el modelo está etiquetado solo para inglés; su comportamiento sobre transcripciones en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Especialización extrema: es un modelo de tarea única. No debe usarse como asistente conversacional general, y las instrucciones o preguntas del transcript se devuelven como texto limpio, nunca respondidas.
- Riesgo de errores factuales en dictados largos: el propio autor documenta que por encima de 100 palabras comete más errores que glm-5.3 a máximo razonamiento; en transcripciones muy largas conviene revisar el resultado.
- No se publica información sobre sesgos del modelo base heredados ni evaluaciones de alucinación más allá de la métrica de errores factuales propia del autor; los benchmarks son internos (test split propio, bench-long y bench-noise) y no comparables directamente con benchmarks estándar de la comunidad.
- La configuración de inferencia importa: las métricas se midieron con greedy decoding y repeat penalty 1.05; usar otros ajustes puede degradar la calidad.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque los términos del modelo base Qwen3.5-4B-Base deberían revisarse para despliegues comerciales a gran escala.
- Descargas aún bajas (261) y sin comunidad activa: el modelo tiene poco historial de uso en producción documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/category271/whispernow-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Repositorio de la app WhisperNow: https://github.com/stephan271c/WhisperNow
- Modelos hermanos de la familia:
  - https://huggingface.co/category271/whispernow-lfm2.5-1.2b
  - https://huggingface.co/category271/whispernow-lfm2.5-2.6b
- Paper, demo y blog: no disponibles
