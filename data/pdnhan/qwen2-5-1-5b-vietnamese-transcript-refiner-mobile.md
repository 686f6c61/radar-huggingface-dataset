# pdnhan/Qwen2.5-1.5B-Vietnamese-Transcript-Refiner-mobile

## Resumen

Qwen2.5-1.5B-Vietnamese-Transcript-Refiner-mobile es un ajuste fino del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario pdnhan, orientado a la refinación de transcripciones de voz en vietnamita. El modelo toma la salida cruda de un sistema de reconocimiento automático del habla (ASR), como PhoWhisper, y la transforma en texto escrito limpio: añade puntuación y mayúsculas, corrige palabras mal reconocidas a partir del contexto, elimina muletillas y tartamudeos, escribe números en dígitos, fechas en formato día/mes/año y unidades como símbolos, y convierte listas dictadas en viñetas.

La relevancia del modelo reside en su orientación a despliegue en dispositivo (on-device): se distribuye como un grafo ONNX cuantizado a int4 de aproximadamente 982 MB de pesos, pensado para ejecutarse con ONNX Runtime en Android e iOS. Incluye código listo para usar en Kotlin y Swift con el tokenizador de Qwen y el bucle de generación con caché KV. Es el componente que la aplicación Thì Thầm ejecuta después de PhoWhisper.

El modelo parte de la arquitectura transformer densa de Qwen2.5-1.5B-Instruct, con 1.500 millones de parámetros, y ha sido ajustado mediante LoRA sobre un conjunto de 8.798 pares de entrenamiento en vietnamita. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajustado con LoRA y exportado a ONNX |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX); el modelo base admite otras cuantizaciones, pero esta distribucion solo incluye int4 |
| Idiomas soportados | vietnamita (vi), ingles (en), chino (zh), multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx.data en int4), tokenizador en vocab.txt, merges.txt y tokenizer.json |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen2.5-1.5B-Instruct, con 1.500 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA de rango 32 en todas las proyecciones de atención y MLP, con tasa de aprendizaje 1e-4 y programación coseno, 8 transcripciones por paso y precisión bf16. Se conservó el adaptador con menor pérdida de evaluación y se fusionó con los pesos base. Posteriormente, el modelo se convirtió a ONNX en cuantización int4 para su ejecución en dispositivos móviles mediante ONNX Runtime.

Los datos de entrenamiento provienen de los clips de entrenamiento y desarrollo de FLEURS en vietnamita (nunca el conjunto de test), transcritos por PhoWhisper tiny y small en int8 para reproducir errores reales del reconocedor. A ello se añadieron textos escritos (listas, textos densos en números, dictado cotidiano) pronunciados tal como los escribiría un reconocedor, con muletillas, repeticiones y errores homófonos introducidos. Cada objetivo de entrenamiento es el texto limpio tal como lo devuelve el paso de fusión del refinador, de modo que el modelo nunca aprende una edición que la aplicación desharía. El total es de 8.798 pares. Los scripts y textos están en `scripts/finetune`.

## Capacidades

- Refinación de transcripciones ASR en vietnamita: corrección contextual de palabras mal reconocidas (confusiones l/n, n/ng final, c/t, s/x, tr/ch, d/gi/r, hỏi/ngã), eliminación de muletillas y palabras repetidas.
- Restauración de puntuación: puntos, comas, signos de interrogación, dos puntos y mayúsculas, incluidos nombres propios.
- Normalización de métricas y datos: números, dinero, porcentajes, unidades, fechas, horas y números de teléfono al estilo vietnamita (`2.300.000 đồng`, `3,5 kg`, `20%`, `ngày 20/11/2026`).
- Conversión de listas dictadas en viñetas con formato `- `, tanto con marcadores explícitos (`thứ nhất là`, `một là`) como sin ellos.
- Generación de texto general heredada del modelo base Qwen2.5-1.5B-Instruct.
- Capacidades multilingües limitadas a vi, en y zh según la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- No se documentan capacidades de visión ni audio; el modelo procesa únicamente texto.

## Casos de uso

- Post-procesamiento de dictado por voz en aplicaciones móviles: integrado tras un ASR como PhoWhisper, el modelo limpia la transcripción antes de mostrarla al usuario, añadiendo puntuación y corrigiendo errores contextuales. Es adecuado por su tamaño reducido y su formato ONNX int4 para ejecución en Android e iOS.
- Notas de reuniones en vietnamita: convierte transcripciones largas de reuniones en texto estructurado con listas de temas y acciones, gracias a la capacidad de convertir enumeraciones dictadas en viñetas.
- Asistentes de voz para atención al cliente: normaliza la salida del ASR antes de enviarla a un sistema downstream, reduciendo errores de interpretación en nombres, cifras y fechas.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva: transforma el habla capturada en texto escrito legible y bien puntuado en tiempo real en el dispositivo.
- Grabación de listas de la compra o tareas: el modelo detecta enumeraciones dictadas y las presenta como listas con viñetas, con números y unidades normalizados.
- Documentación de campo en vietnamita: dictado de informes con cifras, fechas y unidades que el modelo convierte a formato escrito estándar, útil en entornos con conectividad limitada al ejecutarse on-device.
- Transcripción de entrevistas y periodismo: mejora la legibilidad de transcripciones automáticas antes de su revisión editorial, con corrección de nombres propios y puntuación.

## Benchmarks y rendimiento

Resultados del refinador completo (números, prompt, modelo int4, fusión) sobre 505 pares reservados. Cada celda muestra ajustado / stock:

| Conjunto reservado | Pares | Exact match | F1 puntuacion | Mayusculas | Lineas de lista |
|---|---|---|---|---|---|
| Dictado cotidiano | 47 | 0,62 / 0,26 | 0,92 / 0,74 | 0,93 / 0,86 | – |
| Listas dictadas | 29 | 0,59 / 0,10 | 0,93 / 0,73 | 0,93 / 0,72 | 0,79 / 0,41 |
| Numeros, dinero, unidades, fechas | 41 | 0,61 / 0,34 | 0,93 / 0,79 | 0,88 / 0,88 | – |
| Parrafos largos | 40 | 0,15 / 0,03 | 0,81 / 0,61 | 0,84 / 0,68 | – |
| Clips FLEURS, PhoWhisper tiny | 348 | 0,12 / 0,12 | 0,77 / 0,71 | 0,77 / 0,64 | – |

Sobre las transcripciones del test de FLEURS, la tasa de error de palabra tras el refinador es de 10,97 % frente a 11,01 % (PhoWhisper small, ajustado frente a stock) y de 26,66 % frente a 26,74 % (PhoWhisper tiny), con una F1 de puntuación de 0,73 frente a 0,72.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo se distribuye en int4 con aproximadamente 982 MB de pesos, por lo que requiere alrededor de 1 GB de memoria para los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y aceleradores móviles mediante ONNX Runtime. En escritorio puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 2-3 GB de VRAM puede alojarlo, aunque el objetivo principal es la ejecución en dispositivo.
- Opciones de despliegue: ONNX Runtime en Android e iOS (con código Kotlin y Swift incluido), ONNX Runtime en Python y otras plataformas compatibles. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Vietnamese-Transcript-Refiner-mobile | 1.500 M | no disponible | ONNX int4 | Apache 2.0 | Refinación de transcripciones vietnamitas on-device |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens (según documentación del modelo base) | safetensors, GGUF, entre otros | Apache 2.0 | Instrucción general multilingüe |
| PhoWhisper small | no disponible | no disponible | no disponible | no disponible | ASR en vietnamita |
| PhoWhisper tiny | no disponible | no disponible | no disponible | no disponible | ASR en vietnamita |

La comparación directa con otros refinadores de transcripciones en vietnamita no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en vietnamita; su rendimiento en inglés o chino para tareas de refinación no está documentado.
- El exact match en párrafos largos es bajo (0,15 en el conjunto reservado), lo que indica que en textos extensos la salida rara vez coincide exactamente con la referencia aunque la puntuación sea razonable.
- En las transcripciones de FLEURS con PhoWhisper tiny, la mejora en tasa de error de palabra es marginal (26,66 % frente a 26,74 %), lo que sugiere que el refinador no corrige errores de reconocimiento severos.
- Riesgo de alucinación: al ser un modelo generativo, puede introducir cambios no deseados en el contenido, especialmente en pasajes ambiguos o con nombres propios poco frecuentes.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- La cuantización int4 puede degradar ligeramente la calidad frente al modelo en precisión completa; no se proporcionan métricas comparativas entre cuantizaciones.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen2.5-1.5B-Instruct para confirmar compatibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdnhan/Qwen2.5-1.5B-Vietnamese-Transcript-Refiner-mobile
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- ONNX Runtime: https://onnxruntime.ai
- PhoWhisper small: https://huggingface.co/vinai/PhoWhisper-small
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
