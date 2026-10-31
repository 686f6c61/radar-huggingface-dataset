# category271/whispernow-lfm2.5-2.6b

## Resumen

WhisperNow LFM2.5 2.6B es un modelo de lenguaje especializado en la limpieza de transcripciones de reconocimiento de voz (ASR), desarrollado por el usuario category271 como parte del proyecto WhisperNow, una aplicación de escritorio para dictado. Se trata de un fine-tune completo (full fine-tune) de LiquidAI/LFM2.5-2.6B-Base, entrenado sobre el dataset category271/whispernow-cleanup para eliminar muletillas, falsos inicios y repeticiones, aplicar autocorrecciones del hablante y ajustar el formato del texto.

El modelo resuelve un problema concreto: las salidas de ASR contienen disfluencias ("um", "like", repeticiones, correcciones habladas en voz alta) que hacen el texto inutilizable sin postprocesado. En lugar de depender de modelos en la nube, WhisperNow LFM2.5 2.6B permite ejecutar esa limpieza localmente con calidad competitiva: comete un 23 % menos de errores factuales que la variante 1.2B del mismo proyecto y un rendimiento cercano a modelos cloud como glm-5.3-flash en razonamiento bajo.

Con 2.697 millones de parámetros y disponible en formato safetensors y GGUF (Q8_0), está pensado para ejecutarse en hardware de consumo mediante llama.cpp, con una latencia de unos 3,8 segundos por cada 1.000 palabras en GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2.5 (basado en LiquidAI/LFM2.5-2.6B-Base) |
| Parámetros totales | 2.697.198.592 (~2,7 B) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8.192 tokens (según configuración recomendada en llama.cpp) |
| Tipos de cuantización | Q8_0 (GGUF); pesos base en bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM1.0 (licencia "other", ver enlace LICENSE) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de LFM2.5-2.6B-Base de Liquid AI, la familia de modelos LFM (Liquid Foundation Models). La model card no detalla la arquitectura interna de LFM2.5 más allá de su pertenencia a esta familia, ni el número de tokens de entrenamiento del modelo base.

El ajuste fino se realizó sobre el dataset category271/whispernow-cleanup, que codifica las reglas de limpieza que WhisperNow enviaba previamente a modelos en la nube. El entrenamiento enseña al modelo un conjunto de reglas específicas: eliminación de muletillas y tics verbales, resolución de autocorrecciones del hablante ("no wait", "scratch that"), corrección gramatical preservando el tono y las matizaciones del hablante, formateo de listas (compras, tareas, recetas, notas de reunión), conversión de puntuación hablada a símbolos reales, y devolución del token `EMPTY` cuando la transcripción no contiene palabras dictadas. La evaluación se realizó con decodificación greedy (temperatura 0), penalización de repetición de 1,05 sobre prompt y respuesta, y un límite de respuesta de 2,5 tokens por palabra de la transcripción (mínimo 64).

## Capacidades

- Limpieza de transcripciones ASR: elimina muletillas ("um", "like", "you know"), tartamudeos, palabras repetidas y falsos inicios.
- Resolución de autocorrecciones: cuando el hablante se corrige explícitamente, conserva solo la versión corregida y descarta la marca de corrección.
- Corrección gramatical, ortográfica, de puntuación y capitalización, manteniendo las palabras, el tono, las hedges ("maybe", "I think") y las causas ("because...") del hablante.
- Formateo estructurado: convierte listas de compras, tareas, pasos, recetas y notas de reunión en listas con viñetas; mensajes, relatos y explicaciones se mantienen como frases. No usa negritas, cursivas, encabezados ni rayas (em dashes).
- Normalización de cifras: escribe cantidades, recuentos, fechas, horas y porcentajes en dígitos, y convierte puntuación hablada ("dash dash help") en los símbolos reales. Preserva código, rutas y URLs tal como se dictaron.
- Comportamiento seguro ante preguntas y comandos: los limpia y los devuelve como texto, sin responderlos ni ejecutarlos.
- Detección de transcripciones vacías: devuelve `EMPTY` si solo hay muletillas o ruido.
- Generación de texto general (pipeline text-generation), aunque el modelo está especializado en la tarea de limpieza.

## Casos de uso

- Postprocesado local de dictado por voz: como paso de limpieza de WhisperNow, transforma transcripciones crudas de ASR en texto pulido sin enviar datos a la nube, adecuado para usuarios con requisitos de privacidad.
- Limpieza de notas de reunión: con el benchmark bench-long (dictados de 151 a 946 palabras, incluidos 49 turnos reales del corpus AMI) el modelo está validado sobre transcripciones de reuniones reales de larga duración.
- Transcripción de listas y recordatorios: dictados de listas de la compra, tareas pendientes o recetas se convierten automáticamente en listas con viñetas bien formateadas.
- Aplicaciones de dictado integradas en escritorio: con 3,3 GB de memoria en uso en Q8_0, cabe en portátiles con GPU modesta o puede ejecutarse en CPU para dictados cortos.
- Pipelines de transcripción con privacidad: el modelo no responde a preguntas ni comandos contenidos en la transcripción, lo que reduce riesgos de ejecución no deseada en flujos automatizados.
- Filtrado de audio no dictado: la salida `EMPTY` permite descartar segmentos de audio sin contenido dictado (solo ruido o muletillas) en pipelines de procesamiento por lotes.
- Normalización de puntuación hablada: convierte dictados de símbolos ("dash dash", "percent") en los caracteres reales, útil en flujos de generación de documentos por voz.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con decodificación greedy, repeat penalty 1,05 y límite de 2,5 tokens por palabra:

| Modelo | Fichero Q8_0 | Memoria en uso | Errores factuales por 1.000 palabras | 100 palabras / 1.000 palabras, GPU | 100 / 1.000 palabras, CPU |
|---|---|---|---|---|---|
| LFM2.5 1.2B | 1,25 GB | 1,6 GB | 6,32 | 0,18 s / 2,0 s | 2,3 s / 27 s |
| LFM2.5 2.6B (este modelo) | 2,87 GB | 3,3 GB | 4,88 | 0,34 s / 3,8 s | 5,4 s / 65 s |
| Qwen3.5 4B | 4,48 GB | 5,3 GB | 3,01 | 0,62 s / 7,2 s | 8,9 s / 118 s |

Datos adicionales publicados: sobre el test split y ambos benchmarks comete 0,77 veces los errores factuales del modelo 1.2B (intervalo del 90 %: 0,73–0,81) y 1,32 veces los del modelo cloud glm-5.3-flash en razonamiento bajo (1,23–1,41). En dictados de hasta 25 palabras comete menos errores que cualquiera de los modelos cloud glm-5.3; en dictados de 26 a 200 palabras comete entre 1,0 y 1,4 veces los errores de glm-5.3-flash.

Conjuntos de evaluación: test (3.297 filas retenidas del dataset de entrenamiento, de 1 a ~1.000 palabras), bench-long (416 dictaciones de 151–946 palabras, 49 de ellas turnos reales del corpus AMI) y bench-noise (461 dictaciones de 20–64 palabras, cada una con un tipo de disfluencia). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), lo cual es esperable dado el carácter especializado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,3 GB de memoria en uso con el fichero Q8_0 (2,87 GB de pesos), según datos del autor.
- GPU recomendadas: no se especifican modelos concretos de GPU; dado el consumo de ~3,3 GB, cualquier GPU de consumo con 4 GB de VRAM o más debería ser suficiente.
- Consumer GPUs: sí, cabe con holgura en GPUs de gama media y baja (por ejemplo, del tipo RTX 3050/3060 o superior); también es viable su ejecución en CPU pura, con unos 65 segundos por 1.000 palabras según las mediciones del autor.
- Opciones de despliegue: llama.cpp (llama-server, método documentado oficialmente con `--jinja -c 8192`), Transformers (con bfloat16 y device_map="auto"), y cualquier runtime compatible con GGUF. No se menciona soporte explícito de vLLM, Ollama o TGI, aunque el formato GGUF hace probable la compatibilidad con Ollama.
- Latencia y throughput: 0,34 s para 100 palabras y 3,8 s para 1.000 palabras en GPU; 5,4 s para 100 palabras y 65 s para 1.000 palabras en CPU (datos del autor, Q8_0).

## Comparativa con modelos similares

| Modelo | Parámetros | Memoria en uso (Q8_0) | Errores factuales /1.000 palabras | Latencia GPU (1.000 palabras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WhisperNow LFM2.5 2.6B (este) | 2,7 B | 3,3 GB | 4,88 | 3,8 s | LFM1.0 | HuggingFace, safetensors + GGUF |
| WhisperNow LFM2.5 1.2B | 1,2 B | 1,6 GB | 6,32 | 2,0 s | no disponible | HuggingFace, misma familia |
| WhisperNow Qwen3.5 4B | 4 B | 5,3 GB | 3,01 | 7,2 s | no disponible | HuggingFace, misma familia |
| glm-5.3-flash (cloud, razonamiento bajo) | no disponible | no disponible | ~3,7 (inferido: 4,88/1,32) | no disponible | propietaria | API cloud |

En resumen: el modelo 2.6B ofrece el mejor equilibrio del proyecto entre calidad (un 23 % menos de errores que el 1.2B) y coste computacional (casi la mitad de memoria y el doble de velocidad que el 4B), acercándose al rendimiento de modelos cloud en dictados cortos.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y evaluado solo en inglés; su comportamiento con transcripciones en otros idiomas, incluido el castellano, no está documentado y probablemente sea deficiente.
- Especialización extrema: el modelo está afinado para una única tarea (limpieza de transcripciones). No es adecuado como asistente general, generador de código o modelo conversacional de propósito general.
- Riesgo de errores factuales: aunque reducido, comete 4,88 errores factuales por 1.000 palabras, es decir, puede alterar datos concretos (cantidades, nombres, fechas) durante la limpieza; en dictados con datos críticos conviene revisión humana.
- Rendimiento frente a cloud: en dictados de 26 a 200 palabras comete entre 1,0 y 1,4 veces los errores de glm-5.3-flash, por lo que no iguala del todo a los modelos cloud en dictados largos.
- Configuración de inferencia sensible: las métricas publicadas se obtienen con greedy decoding y repeat penalty 1,05 sobre el conjunto prompt+respuesta; otras configuraciones pueden degradar los resultados.
- Licencia: se distribuye bajo LFM1.0, una licencia "other" heredada de Liquid AI; conviene revisar el texto de la licencia antes de cualquier uso comercial, ya que las licencias de la familia LFM pueden incluir restricciones.
- Contexto: la recomendación de 8.192 tokens de contexto procede del comando de ejemplo de llama.cpp; el límite real del modelo base no se detalla en la model card.
- Proyecto de autor individual: con 317 descargas y 1 like en el momento de la ficha, es un modelo de nicho con una comunidad pequeña y mantenimiento potencialmente limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/category271/whispernow-lfm2.5-2.6b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/category271/whispernow-cleanup
- Reglas de limpieza del dataset: https://huggingface.co/datasets/category271/whispernow-cleanup#the-cleanup-rules
- Repositorio del proyecto WhisperNow: https://github.com/stephan271c/WhisperNow
- Variante 1.2B: https://huggingface.co/category271/whispernow-lfm2.5-1.2b
- Variante Qwen3.5 4B: https://huggingface.co/category271/whispernow-qwen3.5-4b
- Licencia: https://huggingface.co/category271/whispernow-lfm2.5-2.6b/blob/main/LICENSE
