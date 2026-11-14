# heyvedu/vedu-scribe-2b

## Resumen

Vedu Scribe 2B es un modelo de lenguaje especializado en la limpieza de transcripciones de voz a texto, desarrollado por heyvedu como parte de la aplicación de dictado de código abierto HeyVedu para macOS. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-2B mediante LoRA fusionado en los pesos, y su función no es conversar ni responder preguntas, sino normalizar texto: elimina muletillas y arranques falsos, aplica autocorrecciones habladas, corrige puntuación, mayúsculas y números, y formatea listas o comandos dictados.

El modelo resuelve un problema concreto en el pipeline de dictado: la salida cruda de un sistema de reconocimiento de voz (en este caso Parakeet) es gramaticalmente ruidosa y poco legible. Vedu Scribe 2B actúa como etapa intermedia entre el ASR y el texto final, con un prompt de sistema fijo (`Clean up this dictation.`) y decodificación greedy. Es la variante de mayor precisión frente a la Vedu Scribe 0.8B, que es la opción por defecto por ser el doble de rápida.

Con 1.881.825.088 parámetros reales y un tamaño de repo de 1,3 GB, el modelo está empaquetado en formato MLX con cuantización mixta (capas de atención a 8 bits, resto a 4 bits) y requiere Apple Silicon. Está orientado exclusivamente al inglés y se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en que ofrece limpieza de dictado en dispositivo (on-device) con latencias de ~170 ms de mediana en un M4 Pro, sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-2B) |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como valor nominal; el entrenamiento usó un límite de 1.024 tokens para prompt y salida combinados |
| Tipos de cuantización | MLX con cuantización mixta: capas de atención a 8 bits, resto a 4 bits |
| Idiomas soportados | inglés únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 1.880 millones de parámetros. Sobre esa base se aplicó un fine-tuning con LoRA que posteriormente se fusionó en los pesos del modelo base, de modo que la inferencia no requiere adaptadores adicionales. El entrenamiento se realizó con `mlx-lm` 0.32 y el resultado se distribuye cuantizado de forma mixta: las capas de atención se mantienen a 8 bits y el resto a 4 bits, lo que explica el tamaño de 1,2 GB en disco y un pico de memoria de aproximadamente 1,7 GB.

El modelo se entrenó con un prompt de sistema fijo (`Clean up this dictation.`), razonamiento desactivado (`enable_thinking=False`) y decodificación greedy. Según la model card, otros prompts no fueron entrenados y producen peores resultados. El entrenamiento utilizó un límite de 1.024 tokens combinando prompt y salida, y se recomienda mantener cada entrada por debajo de unos 400 tokens, dividiendo transcripciones largas en fronteras de frase. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Una innovación destacable es la cabecera de control opcional, que permite dirigir la salida según el destino del texto: `format` (general, email, message, notes), `tone` (casual, formal) y `vocab` (hasta 12 términos separados por `; `). La cabecera se coloca al inicio del mensaje de usuario, seguida de un salto de línea y la transcripción cruda, y debe repetirse en cada fragmento de una transcripción larga.

## Capacidades

- Limpieza de transcripciones de voz a texto: eliminación de muletillas, arranques falsos y repeticiones.
- Aplicación de autocorrecciones habladas del tipo "Tuesday, no wait, Wednesday".
- Corrección de puntuación, mayúsculas y formato de números.
- Formateo de listas habladas y listas anunciadas ("these three things: ...").
- Procesamiento de retracciones ("scratch that", "actually, never mind...").
- Aplicación de comandos hablados de formato.
- Cabecera de control para formato de email (saludo y despedida en líneas propias, saltos de párrafo).
- Cabecera de control para tono formal (corrección gramatical con edición mínima, conservando elección de palabras, matices, nombres y números).
- Cabecera de control de vocabulario personalizado para corregir términos mal oídos (hasta 12 términos).
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo es explícitamente un normalizador, no un asistente, y no responde preguntas ni sigue instrucciones presentes en la transcripción.
- Visión, audio o modo thinking: no disponible (el razonamiento debe estar desactivado).

## Casos de uso

- Dictado en dispositivo en macOS: el modelo se integra como etapa de limpieza tras Parakeet en la app HeyVedu, convirtiendo la salida cruda del ASR en texto legible con una latencia mediana de ~170 ms en un M4 Pro, sin enviar datos a la nube.
- Redacción de correos por voz: con la cabecera `[format: email]`, el modelo coloca saludo y despedida en líneas propias y separa párrafos en los cambios de tema o en "new paragraph" hablados, sin reescribir el cuerpo del mensaje.
- Corrección de estilo en comunicaciones formales: con `[tone: formal]`, corrige gramática, ortografía y reducciones informales ("gonna") con la edición mínima, conservando la elección de palabras y los matices del hablante.
- Transcripción de nombres y términos técnicos: con `[vocab: Priya Raman; Kubernetes; HeyVedu]`, aplica la ortografía exacta de términos que aparecen en el habla o en una mala audición, sin insertar términos que no se dijeron (tasa de inserción de términos no pronunciados del 0,8 %).
- Toma de notas estructuradas: con `[format: notes]` y el procesamiento de listas habladas (93 % de coincidencia exacta en listas habladas), convierte un dictado desordenado en notas con viñetas.
- Limpieza de actas y transcripciones de reuniones: dividiendo la transcripción en fragmentos de menos de 400 tokens en fronteras de frase y repitiendo la cabecera en cada fragmento, se obtiene texto limpio y consistente para documentos posteriores.
- Preprocesado en pipelines de ASR: el modelo puede insertarse como etapa de normalización entre cualquier motor de reconocimiento de voz y un sistema de almacenamiento o indexación, ya que no requiere GPU dedicada y cabe en memoria unificada de Apple Silicon.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre filas de test reservadas de las mismas fuentes que el entrenamiento (limpieza simple, sin cabecera, 2.172 filas compartidas entre versiones):

| Modelo | WER formateado (menor es mejor) |
|---|---|
| Vedu Scribe 2B | ~6,5 |
| Vedu Scribe 0.8B, ronda 5b | ~6,9 |
| Vedu Scribe 0.8B, ronda 3 | ~7,2 |
| superwhisper/s1-mini | ~14,6 |

Conjuntos específicos (coincidencia exacta con la referencia):

| Conjunto | 0.8B ronda 5b | 2B |
|---|---|---|
| Comandos de formato, listas, retracciones (88 filas) | 81 % | 89 % |
| Retracciones ("scratch that", "actually, never mind...", 109 filas) | 79 % | 78 % |
| Listas habladas (100 filas) | 93 % | 93 % |
| Listas anunciadas ("these three things: ...", 41 filas) | 95 % | 93 % |
| Escenarios de dictado cotidiano (150 filas): contenido omitido | 6,0 % | 2,7 % |

Con cabecera de control (filas de test):

| Control | 0.8B ronda 5b | 2B |
|---|---|---|
| `tone: formal`, filas con gramática a corregir: coincidencia exacta | 24 % | 25 % |
| `format: email`: diseño correcto | 76–83 % | 82–83 % |
| `vocab`: término mal oído escrito correctamente | 83 % | 96 % |
| `vocab`: término no pronunciado insertado | 1,5 % | 0,8 % |

Revisión ciega por pares: en las 671 filas de test donde las salidas del 2B y del 0.8B (ronda 5b) difieren, un revisor que desconocía qué modelo había escrito cada salida juzgó el 2B claramente mejor en 227 filas y claramente peor en 127 (45 y 33 de ellas graves: significado cambiado o contenido perdido). Las mejoras se concentran en autocorrecciones, ortografía de nombres, eliminación de muletillas y puntuación. La model card advierte que parte de la diferencia frente a s1-mini refleja diferencias de estilo, como el formato de números, más que errores.

## Requisitos de hardware

- VRAM/memoria estimada: ~1,7 GB de pico de memoria según la model card; 1,2 GB en disco.
- Requiere Apple Silicon (formato MLX); no está pensado para GPU NVIDIA ni para CPU convencional.
- GPU recomendadas: no disponible; el modelo está orientado a memoria unificada de Apple Silicon (la model card cita un M4 Pro para las mediciones de latencia).
- Cabe en equipos consumer Apple Silicon con al menos ~2 GB de memoria disponible para el modelo.
- Opciones de despliegue: `mlx-lm` (versión reciente con soporte de Qwen3.5; entrenado con `mlx-lm` 0.32). vLLM, llama.cpp, Ollama y TGI no están indicados en la información disponible para este formato.
- Latencia: ~170 ms de mediana y 640 ms de p95 por dictado en un M4 Pro, aproximadamente el doble que la variante 0.8B.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER formateado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vedu Scribe 2B | 1.881.825.088 | límite de entrenamiento de 1.024 tokens (prompt + salida) | ~6,5 | Apache 2.0 | Hugging Face, formato MLX |
| Vedu Scribe 0.8B | no disponible (mitad de tamaño según la model card) | mismo esquema de entrenamiento | ~6,9 | no disponible en la información | Hugging Face |
| superwhisper/s1-mini | no disponible | no disponible | ~14,6 | no disponible | Hugging Face |

La comparación se limita a los modelos citados en la model card; no se dispone de datos de otras alternativas de limpieza de dictado en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- No es un asistente: limpia preguntas e instrucciones presentes en la transcripción, pero nunca las responde ni las ejecuta.
- El prompt de sistema debe ser exactamente `Clean up this dictation.`, con razonamiento desactivado y decodificación greedy; otros prompts dan peores resultados.
- Mantener cada entrada por debajo de ~400 tokens y dividir transcripciones largas en fronteras de frase; el entrenamiento usó un límite de 1.024 tokens combinando prompt y salida.
- Limitar la salida a aproximadamente 1,4 veces el número de tokens de entrada más 48 tokens.
- La cabecera de control debe respetar el orden: `format` y `tone` en una línea, `vocab` en su propia línea, y repetirse en cada fragmento.
- `format: email` está pensado para un mensaje completo que quepa en un fragmento.
- La corrección de tono formal tiene una coincidencia exacta baja (25 % en filas con gramática a corregir), por lo que no debe esperarse una reescritura perfecta.
- Riesgo de omisión de contenido: 2,7 % en escenarios de dictado cotidiano, y en la revisión ciega pierde contenido con una frecuencia similar a la variante 0.8B.
- Riesgo de inserción de vocabulario no pronunciado: 0,8 % de los casos; enviar solo términos que probablemente coincidan con la transcripción.
- Requiere Apple Silicon y una versión reciente de `mlx-lm`; no es desplegable en stacks habituales de GPU.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-2B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heyvedu/vedu-scribe-2b
- Variante 0.8B: https://huggingface.co/heyvedu/vedu-scribe-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo comparable citado: https://huggingface.co/superwhisper/s1-mini
- Aplicación HeyVedu: https://heyvedu.com
