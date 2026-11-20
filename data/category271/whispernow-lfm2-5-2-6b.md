# category271/whispernow-lfm2.5-2.6b

## Resumen

WhisperNow LFM2.5 2.6B es un ajuste fino completo del modelo base LiquidAI/LFM2.5-2.6B-Base, desarrollado por el usuario category271 para la limpieza local de transcripciones ASR en WhisperNow, una aplicación de escritorio de dictado. El modelo no es un asistente conversacional general: su única tarea es tomar una transcripción en bruto y devolver el texto limpio, eliminando muletillas, falsos comienzos y repeticiones, aplicando las autocorrecciones del hablante y ajustando el formato (listas, dígitos, puntuación).

Con 2.697.198.592 parámetros (aproximadamente 2,7 mil millones) y una licencia LFM1.0 heredada del modelo base, el modelo está pensado para ejecutarse en local. Según la model card, en cuantización Q8_0 ocupa 2,87 GB en disco y 3,3 GB de memoria en uso, lo que lo hace viable en hardware de consumo.

El modelo ha sido sustituido en la lista principal de WhisperNow por WhisperNow LFM3 1.7B, que comete un número similar de errores fácticos (1,03 veces los de este modelo, intervalo del 90 %: 0,98–1,08) con dos tercios del tamaño de archivo y aproximadamente 0,7 veces el tiempo de ejecución. Este modelo permanece disponible en la aplicación bajo la sección "More models".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de LiquidAI/LFM2.5-2.6B-Base) |
| Parámetros totales | 2.697.198.592 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantización | GGUF Q8_0 (2,87 GB); pesos safetensors en bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) del modelo base LiquidAI/LFM2.5-2.6B-Base. No se especifica en la información disponible la arquitectura interna del modelo base (transformer, MoE, híbrida u otra), ni el número de tokens de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. La model card únicamente indica que se trata de un fine-tune completo sobre el modelo base de LiquidAI.

El entrenamiento se realizó sobre el dataset category271/whispernow-cleanup, con el objetivo de que el modelo aprenda las reglas de limpieza que WhisperNow envía a los modelos en la nube. Estas reglas incluyen la eliminación de muletillas y tics verbales, la resolución de autocorrecciones, la corrección de gramática y puntuación sin alterar el tono ni las palabras del hablante, el formateo de listas y la conversión de cantidades y símbolos hablados a su forma escrita. El modelo se evaluó con decodificación greedy (temperatura 0), penalización de repetición de 1,05 sobre todo el prompt y la respuesta, y un límite de respuesta de 2,5 tokens por palabra de la transcripción (mínimo 64).

## Capacidades

- Limpieza de transcripciones ASR: elimina muletillas ("um", "like", "you know", "so" al inicio de frase), tartamudeos, palabras repetidas y falsos comienzos.
- Aplicación de autocorrecciones: cuando el hablante se corrige ("no wait", "scratch that"), conserva solo la versión corregida y elimina la señal de corrección.
- Corrección de gramática, ortografía, puntuación y mayúsculas, manteniendo las palabras, el tono, las matizaciones ("maybe", "I think") y las razones ("because ...") del hablante.
- Formateo condicional: convierte listas de la compra, tareas pendientes, pasos, recetas y notas de reunión en listas; los mensajes, historias y explicaciones permanecen como frases. No usa negritas, cursivas, encabezados ni guiones largos.
- Normalización numérica: escribe cantidades, recuentos, fechas, horas y porcentajes en dígitos, y convierte la puntuación y los símbolos hablados ("dash dash help") en su forma real.
- Preservación literal de código, rutas y URL tal como se dictaron.
- No responde preguntas ni ejecuta comandos: una pregunta o una orden en la transcripción se limpia y se devuelve como texto.
- Devuelve `EMPTY` cuando la transcripción no contiene palabras dictadas (solo muletillas o ruido).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido según la información disponible.

## Casos de uso

- Dictado de escritorio en local: el modelo se integra en WhisperNow como paso de limpieza tras el reconocimiento de voz, procesando la transcripción en el propio equipo sin enviar datos a la nube. Con 3,3 GB de memoria en uso en Q8_0 es adecuado para equipos de consumo.
- Notas de reunión: convierte una transcripción desordenada con autocorrecciones y enumeraciones habladas en notas estructuradas con listas, manteniendo las razones y matizaciones del hablante.
- Listas de la compra y tareas pendientes: transforma un dictado como "we're picking up fence posts feed for the chickens and that new hose nozzle" en una lista con viñetas, conservando además la petición final como frase.
- Mensajes y correos dictados: limpia el texto manteniendo el tono conversacional, las matizaciones y las razones, sin responder ni ejecutar la petición contenida en el mensaje.
- Recetas y procedimientos: formatea pasos y cantidades en dígitos (por ejemplo, "three days" a "3 days"), lo que facilita su lectura y su copia a otros documentos.
- Preservación de código y rutas en dictados técnicos: mantiene literalmente código, rutas de archivo y URL dictadas, útil para desarrolladores que dictan comandos o rutas sin que el modelo las reformatee.
- Filtrado de transcripciones vacías: devuelve `EMPTY` cuando la entrada solo contiene ruido o muletillas, lo que permite descartar automáticamente segmentos sin contenido útil en un pipeline de dictado.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a errores fácticos por cada 1.000 palabras y a tiempos de procesado de 100 y 1.000 palabras, medidos sobre el split de test y ambos benchmarks:

| Modelo | Archivo Q8_0 | Memoria en uso | Errores fácticos / 1.000 palabras | 100 / 1.000 palabras, GPU | 100 / 1.000 palabras, CPU |
|---|---|---|---|---|---|
| WhisperNow LFM2.5 1.2B | 1,25 GB | 1,6 GB | 6,32 | 0,18 / 2,0 s | 2,3 / 27 s |
| WhisperNow LFM2.5 2.6B (este modelo) | 2,87 GB | 3,3 GB | 4,88 | 0,34 / 3,8 s | 5,4 / 65 s |
| WhisperNow Qwen3.5 4B | 4,48 GB | 5,3 GB | 3,01 | 0,62 / 7,2 s | 8,9 / 118 s |

Comparaciones adicionales publicadas en la model card:

- Frente al modelo de 1,2B: 0,77 veces sus errores fácticos (intervalo del 90 %: 0,73–0,81).
- Frente a glm-5.3-flash en la nube con razonamiento bajo: 1,32 veces sus errores (intervalo del 90 %: 1,23–1,41).
- En dictados de hasta 25 palabras comete menos errores que cualquiera de los dos modelos glm-5.3 en la nube; en dictados de 26 a 200 palabras comete entre 1,0 y 1,4 veces los errores de glm-5.3-flash.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 3,3 GB de memoria en uso con cuantización Q8_0 (2,87 GB de archivo); en bfloat16 los pesos suman aproximadamente 5,4 GB, más el overhead de inferencia.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, cabe en GPUs de consumo con al menos 6–8 GB de VRAM.
- Cabe en GPU de consumo: sí, con la cuantización Q8_0 y 3,3 GB de memoria en uso.
- Despliegue: llama.cpp (`llama-server` con `--jinja -c 8192`) y Transformers con `AutoModelForCausalLM` en bfloat16. El repositorio incluye GGUF y una plantilla de chat (`chat_template.jinja`, también dentro del GGUF). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 0,34 s para 100 palabras y 3,8 s para 1.000 palabras en GPU; 5,4 s para 100 palabras y 65 s para 1.000 palabras en CPU, con decodificación greedy y los ajustes indicados en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Errores fácticos / 1.000 palabras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhisperNow LFM2.5 2.6B | 2,70 B | no disponible | 4,88 | lfm1.0 | Hugging Face, GGUF y safetensors |
| WhisperNow LFM2.5 1.2B | no disponible | no disponible | 6,32 | no disponible | Hugging Face |
| WhisperNow Qwen3.5 4B | no disponible | no disponible | 3,01 | no disponible | Hugging Face |
| WhisperNow LFM3 1.7B | no disponible | no disponible | ~1,03 veces los de este modelo | no disponible | Hugging Face (sustituye a este modelo en la lista principal) |

Los tres primeros modelos son alternativas del mismo autor para la misma tarea de limpieza de transcripciones. El modelo de 4B obtiene menos errores fácticos a costa de mayor tamaño (4,48 GB), más memoria (5,3 GB) y mayor latencia (0,62 s / 7,2 s en GPU). El de 1,2B es más rápido y ligero pero con más errores. LFM3 1.7B es el sucesor recomendado por el autor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un fine-tune del modelo base, puede heredar los sesgos de este.
- Riesgo de alucinación: la model card cuantifica errores fácticos (4,88 por cada 1.000 palabras), por lo que el modelo puede introducir o alterar información al limpiar la transcripción.
- Limitaciones de idioma: solo soporta inglés (`language: en`); no se ha validado para otros idiomas.
- Limitaciones de contexto: la longitud de contexto no está documentada; el ejemplo de llama.cpp usa 8.192 tokens. El límite de respuesta recomendado es de 2,5 tokens por palabra de la transcripción (mínimo 64), lo que conviene respetar para evitar divagaciones.
- Restricciones de licencia: licencia lfm1.0 (etiquetada como "other" en Hugging Face). No se detallan en la información disponible las condiciones para uso comercial; es necesario consultar el archivo LICENSE del repositorio antes de un uso en producción.
- Uso previsto restringido: el modelo está entrenado exclusivamente para limpieza de transcripciones; no es un asistente general y no debe usarse para responder preguntas ni ejecutar comandos, ya que está diseñado para devolver la pregunta o la orden como texto limpio.
- El modelo ha sido sustituido en la lista principal de WhisperNow por LFM3 1.7B; el autor lo mantiene solo en la sección "More models" de la aplicación.
- Configuración de inferencia sensible: los resultados publicados se obtuvieron con decodificación greedy, `repeat_penalty` 1,05 y `repeat_last_n` 4096; desviarse de estos ajustes puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/category271/whispernow-lfm2.5-2.6b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base
- Dataset de limpieza: https://huggingface.co/datasets/category271/whispernow-cleanup
- Reglas de limpieza: https://huggingface.co/datasets/category271/whispernow-cleanup#the-cleanup-rules
- Repositorio de WhisperNow: https://github.com/stephan271c/WhisperNow
- Modelo sucesor LFM3 1.7B: https://huggingface.co/category271/whispernow-lfm3-1.7b
- Modelo alternativo LFM2.5 1.2B: https://huggingface.co/category271/whispernow-lfm2.5-1.2b
- Modelo alternativo Qwen3.5 4B: https://huggingface.co/category271/whispernow-qwen3.5-4b
