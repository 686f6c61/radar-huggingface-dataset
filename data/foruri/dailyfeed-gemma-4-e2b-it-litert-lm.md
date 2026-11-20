# Foruri/dailyfeed-gemma-4-E2B-it-litert-lm

## Resumen

Daily Feed Gemma 4 E2B (LiteRT-LM) es un ajuste fino de `google/gemma-4-E2B-it` publicado por el usuario Foruri para su uso dentro de la aplicacion Android Daily Feed, un diario personal en ingles que funciona sin conexion y se presenta con una interfaz tipo red social. El modelo cubre dos tareas concretas: la correccion gramatical para estudiantes japoneses de ingles, devolviendo una respuesta JSON estructurada con los campos `issues`, `score`, `natural` y `comment`, y la generacion de respuestas de "amigo" a las entradas del diario, comentarios y mensajes directos dentro de la aplicacion.

Tecnicamente es un adaptador LoRA de rango 16 entrenado sobre el modelo de texto de Gemma 4 E2B con QLoRA de 4 bits, fusionado a una intensidad de 0,7x sobre la variante cuantizada `gemma-4-E2B-it-qat-q4_0-unquantized` y exportado con `litert-torch export_hf` en formato LiteRT-LM. El paquete resultante usa pesos int4 con bloques de 32, codificador de vision int8 y una longitud de cache de 4096, lo que permite ejecucion en dispositivo (CPU/GPU) en Android.

Su relevancia es acotada pero clara: demuestra un flujo completo de personalizacion de un modelo pequeno para una tarea de producto muy especifica, con cuantizacion QAT preservada, vision mantenida para reacciones a fotos y una licencia Apache-2.0. No es un modelo de proposito general, sino un artefacto de aplicacion con metricas propias de validacion interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B) con adaptador LoRA fusionado; exportado a LiteRT-LM |
| Parametros totales | no disponible (modelo base E2B, tamano exacto no indicado) |
| Parametros activos | no disponible |
| Longitud de contexto | cache de 4096 (segun configuracion de exportacion) |
| Tipos de cuantizacion | int4 con bloques de 32 en pesos del modelo de texto; int8 en el codificador de vision |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`); repo de 2,8 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer de la familia Gemma 4 en su variante E2B (eficiente, orientada a ejecucion en dispositivo), e incorpora un codificador de vision que se conserva en el export final para permitir que las respuestas de "amigo" reaccionen a fotografias. Sobre el modelo de texto se entreno un LoRA de rango 16 con QLoRA de 4 bits. El adaptador se fusiono a 0,7x de intensidad sobre la variante `gemma-4-E2B-it-qat-q4_0-unquantized`; segun el autor, la intensidad completa hacia que el modelo pasara por alto demasiados errores, de ahi la reduccion.

La exportacion se realizo con `litert-torch export_hf`, generando pesos int4 con bloques de 32 para alinearse con el entrenamiento QAT del modelo base, codificador de vision en int8 y una longitud de cache de 4096. Los datos de entrenamiento son diarios semilla escritos a mano, respuestas gramaticales y respuestas de amigo, complementados con errores de aprendiz generados por reglas (articulos, plurales, tercera persona -s, tiempos verbales, preposiciones, eleccion lexica y ortografia). No se documenta el volumen de tokens ni el uso de RLHF o DPO.

## Capacidades

- Correccion gramatical en ingles para hablantes de japones, con salida JSON estructurada (`issues`, `score`, `natural`, `comment`).
- Generacion de respuestas conversacionales con personas definidas por la aplicacion (diario, comentarios y mensajes directos).
- Procesamiento de imagenes mediante el codificador de vision int8 conservado, para reaccionar a fotos.
- Ejecucion en dispositivo (on-device) en Android mediante LiteRT-LM en CPU y GPU.
- Soporte bilingue limitado a ingles y japones.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso como agente.

## Casos de uso

- Correccion gramatical integrada en una app de aprendizaje de ingles para japoneses: el modelo recibe una frase del estudiante y devuelve un JSON con los errores detectados, una puntuacion y un comentario, lo que permite renderizar la correccion directamente en la interfaz sin postprocesado complejo.
- Diario personal con respuestas simuladas: las entradas del diario se envian al modelo para generar comentarios de "amigo" con la persona seleccionada, manteniendo la sensacion de red social sin conexion.
- Reacciones a fotos en el diario: gracias al codificador de vision int8, el modelo puede comentar imagenes adjuntas a las entradas, lo que aporta contexto visual a las respuestas generadas.
- Mensajeria directa dentro de la aplicacion: el modelo gestiona conversaciones de mensajes directos con el tono de cada persona, adecuado para interacciones cortas y frecuentes en dispositivo.
- Aplicaciones de privacidad estricta: al ejecutarse completamente en el dispositivo, los textos del usuario no salen del telefono, lo que encaja con diarios personales y datos sensibles.
- Prototipado de asistentes de escritura offline: sirve como referencia para equipos que quieran adaptar un modelo Gemma 4 E2B a una tarea vertical concreta con QLoRA y exportar a LiteRT-LM para Android.
- Evaluacion de flujos QAT + LoRA: util como caso de estudio para medir como afecta la fusion del adaptador a distintas intensidades (0,7x frente a 1,0x) en la tasa de deteccion de errores.

## Benchmarks y rendimiento

| Metrica (40 comprobaciones gramaticales retenidas, int4, en dispositivo) | Daily Feed E2B v1 | Gemma 4 E2B oficial |
|---|---|---|
| JSON valido | 40/40 | no disponible |
| Totalmente correctas | 18/40 | 16/40 |
| Textos correctos sin modificar | 6/7 | 2/7 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en dispositivo Android mediante LiteRT-LM, con soporte de CPU y GPU; el paquete `.litertlm` ocupa 2,8 GB en el repositorio.
- Pesos int4 con bloques de 32 y codificador de vision int8, disenados para reducir el consumo de memoria en moviles; no se especifica la VRAM o RAM minima exacta.
- No se documentan GPU de escritorio recomendadas (A100, H100, RTX 4090) ni opciones de despliegue en servidor como vLLM, llama.cpp, Ollama o TGI.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Daily Feed Gemma 4 E2B (LiteRT-LM) | no disponible (base E2B) | cache 4096 | Apache-2.0 | LiteRT-LM, on-device Android | Ajuste fino para correccion gramatical y respuestas de app |
| google/gemma-4-E2B-it | no disponible (E2B) | no disponible | Gemma (terminos propios) | safetensors y variantes | Modelo base instructivo de proposito general |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | no disponible (E2B) | no disponible | Gemma (terminos propios) | safetensors cuantizado QAT | Base sobre la que se fusiono el LoRA |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera de la correccion gramatical para japoneses y las respuestas de la app no esta validado.
- Solo cubre ingles y japones; no se garantiza calidad en otros idiomas.
- La fusion del LoRA a 0,7x implica un compromiso deliberado: a intensidad completa el modelo omitia errores, por lo que la deteccion de fallos sigue siendo parcial (18/40 totalmente correctas).
- Riesgo de alucinacion en las respuestas de "amigo" y en los comentarios, inherente a un modelo generativo pequeno.
- El contexto efectivo esta limitado por la cache de 4096, adecuado para frases y entradas cortas, no para documentos largos.
- Aunque la licencia del artefacto es Apache-2.0, el modelo base Gemma 4 E2B tiene sus propios terminos de uso que deben revisarse para uso comercial.
- No se documentan sesgos especificos, pero al entrenarse con datos escritos a mano y errores generados por reglas, la distribucion de errores esta sesgada hacia las categorias cubiertas (articulos, plurales, tercera persona, tiempos, preposiciones, lexico y ortografia).
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Foruri/dailyfeed-gemma-4-E2B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante QAT utilizada para la fusion: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
