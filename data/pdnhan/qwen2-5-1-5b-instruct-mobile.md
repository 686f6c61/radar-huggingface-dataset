# pdnhan/Qwen2.5-1.5B-Instruct-mobile

## Resumen

Qwen2.5-1.5B-Instruct-mobile es una conversión a ONNX de 4 bits del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicada por el usuario pdnhan con el objetivo de ejecutarlo en dispositivos móviles Android e iOS mediante ONNX Runtime. El modelo conserva exactamente los pesos del original: solo cambian el formato (ONNX en lugar de safetensors) y la precisión (int4 en lugar de bf16/fp16), lo que reduce el tamaño a aproximadamente 982 MB de pesos más una gráfica de 224 kB.

El caso de uso principal documentado por el autor es el refinado de transcripciones de reconocimiento automático del habla en vietnamita: el modelo recibe la salida cruda de PhoWhisper y devuelve texto limpio con puntuación, mayúsculas, números en dígitos, fechas en formato día/mes/año, unidades como símbolos y listas habladas convertidas en viñetas. Es el componente que la aplicación Thì Thầm ejecuta tras PhoWhisper.

La relevancia actual del modelo reside en su perfil de despliegue: un LLM de 1.500 millones de parámetros cuantizado a 4 bits que cabe en un móvil y se ejecuta con codegen listo para Kotlin (JVM) y Swift, con tokenizador propio, bucle de generación con caché KV y plantilla de chat idéntica a la del modelo original. La licencia Apache 2.0 facilita su integración comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con GroupQueryAttention y caché KV; grafo ONNX Runtime GenAI |
| Parametros totales | 1.500 millones (heredados de Qwen2.5-1.5B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (depende de la configuración de generación; la caché KV está dimensionada para 28 capas con 2 cabezas de 128 dimensiones) |
| Tipos de cuantizacion | int4 (MatMulNBits simétrico, bloques de 32, accuracy_level 4); embeddings atados como GatherBlockQuantized de 4 bits compartido con la LM head |
| Idiomas soportados | vietnamita (vi), inglés (en), chino (zh), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx.data); tokenizador en vocab.txt, merges.txt y tokenizer.json |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-1.5B-Instruct original: un transformer decoder-only con atención de consultas agrupadas (GroupQueryAttention), 28 capas con 2 cabezas KV de 128 dimensiones cada una, vocabulario de 151.936 tokens y embeddings atados a la cabeza de lenguaje. La conversión no introduce ningún cambio arquitectónico; el grafo ONNX se generó con el ONNX Runtime GenAI model builder con los parámetros `-p int4 -e cpu`, produciendo MatMulNBits de 4 bits con bloques de 32 y nivel de precisión 4, y una LM head que solo calcula los logits de la última posición.

No se dispone de información sobre el proceso de entrenamiento original de Qwen2.5-1.5B-Instruct en la documentación proporcionada (número de tokens, composición del dataset, RLHF/DPO). Lo que sí está documentado es la validación de la conversión: el tokenizador produce los mismos ids que la librería Hugging Face `tokenizers` en los 720 textos de prueba, y el prompt coincide token a token con la plantilla de chat del modelo original. El código Kotlin (JVM, ONNX Runtime 1.31.1) y Swift genera el mismo texto que la referencia en Python sobre los casos de prueba.

## Capacidades

- Generación de texto autoregresiva con caché KV incremental (entrada `past_key_values`, salida `present.*`).
- Refinado de transcripciones ASR: puntuación (`. , ? ! :`), mayúsculas, corrección de palabras mal transcritas usando el contexto, eliminación de muletillas y titubeos.
- Normalización de números a dígitos, fechas a formato día/mes/año (por ejemplo, 20/11/2026) y unidades a símbolos (por ejemplo, 5 kg).
- Conversión de listas habladas en viñetas con saltos de línea.
- Capacidades multilingües heredadas del modelo base: vietnamita, inglés, chino y otros idiomas.
- Integración en apps Android (Kotlin) e iOS (Swift) con código listo para usar: tokenizador, bucle de generación y refinador.
- Compatibilidad con ONNX Runtime GenAI y con ONNX Runtime estándar (1.22 o superior; probado con 1.31.1).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión o audio.

## Casos de uso

- Refinado de transcripciones de voz en vietnamita: tras PhoWhisper, el modelo añade puntuación y mayúsculas, corrige palabras mal oídas a partir del contexto y convierte listas habladas en viñetas; es exactamente el flujo que ejecuta la app Thì Thầm.
- Normalización de dictado para notas y actas: convierte números hablados en dígitos, fechas en formato día/mes/año y unidades en símbolos, lo que resulta útil en aplicaciones de productividad móvil.
- Postprocesado de subtítulos automáticos: el modelo limpia la salida de un ASR antes de publicar subtítulos, reduciendo muletillas y titubeos y mejorando la legibilidad sin depender de un servidor.
- Asistentes de voz sin conexión: al caber en un móvil con pesos de aproximadamente 982 MB, permite refinar la transcripción localmente sin enviar audio a la nube, lo que ayuda con la privacidad y la latencia.
- Limpieza de transcripciones de reuniones: el modelo elimina titubeos y reordena listas habladas en formato de viñetas, adecuado para generar resúmenes estructurados a partir de audio de reuniones en vietnamita.
- Aplicaciones de accesibilidad para personas con dificultades de habla o escritura: el refinado contextual corrige palabras mal reconocidas y produce texto legible para comunicación asistida.
- Chatbot ligero multilingüe en el dispositivo: al heredar las capacidades del Qwen2.5-1.5B-Instruct, puede gestionar conversaciones sencillas en vietnamita, inglés o chino sin servidor, siempre que se ajuste la configuración de contexto y memoria.

## Benchmarks y rendimiento

Se han publicado resultados de precisión del refinador sobre 300 transcripciones de PhoWhisper de clips de test vietnamitas de FLEURS (los primeros 150 clips, transcritos por los modelos int8 PhoWhisper tiny y small de pdnhan/PhoWhisper-small-mobile y sus variantes), comparados con las transcripciones originales:

| Reconocedor | WER de la transcripción | WER tras el refinador |
|---|---|---|
| PhoWhisper small (int8) | 12,3 % | 11,0 % |
| PhoWhisper tiny (int8) | 28,9 % | 26,7 % |

El WER se mide sin distinguir mayúsculas ni puntuación; FLEURS escribe los números tanto en dígitos como en palabras, por lo que un número que el refinador escribe en dígitos puede contar como error. La puntuación (`. , ? ! :` sobre las palabras compartidas por ambos textos) obtiene precisión 0,77, recall 0,68 y F1 de 0,72. El tiempo por transcripción en una CPU x86 de escritorio con 8 hilos es de 0,78 s; en móviles es varias veces más lento.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: los pesos int4 ocupan aproximadamente 982 MB en disco (model.onnx.data) más 224 kB de grafo; en ejecución hay que sumar la caché KV en float32 con forma `[batch, 2, past + tokens, 128]` por capa (28 capas), lo que crece con la longitud de contexto.
- GPU recomendadas: no se documentan; la conversión está orientada a CPU (`-e cpu`) y a ejecución en dispositivos móviles.
- Cabe en GPU de consumo: sí, por tamaño de pesos; cualquier GPU con al menos 2-3 GB de memoria libre puede alojar el modelo, aunque no se proporcionan cifras de rendimiento en GPU.
- Despliegue: ONNX Runtime (1.22 o superior, probado con 1.31.1) y ONNX Runtime GenAI; código de referencia en Kotlin (JVM) para Android y Swift para iOS; también hay tokenizador y plantilla de chat en Python.
- Latencia y throughput: 0,78 s por transcripción en CPU x86 de escritorio con 8 hilos; en teléfonos varios segundos por transcripción. No se documenta throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pdnhan/Qwen2.5-1.5B-Instruct-mobile | 1,5 B | no disponible | ONNX int4 | Apache 2.0 | Hugging Face, código Android/iOS incluido |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | no disponible en la información | safetensors (bf16/fp16) | Apache 2.0 | Hugging Face |
| pdnhan/PhoWhisper-small-mobile | modelo ASR (no es un LLM) | no aplica | ONNX int8 | no disponible en la información | Hugging Face |

La comparación directa con otros LLM de 1,5 B convertidos a ONNX int4 para móvil no está disponible en la información proporcionada. La diferencia principal frente al Qwen2.5-1.5B-Instruct original es el formato y la precisión: mismos pesos, menor tamaño y ejecución en CPU móvil, con posible pérdida de calidad por la cuantización int4 no cuantificada en los benchmarks publicados.

## Limitaciones y advertencias

- La cuantización int4 puede degradar la calidad respecto al modelo original; no se documenta una evaluación sistemática de esa pérdida más allá de las métricas del refinador.
- El refinador puede introducir errores: FLEURS escribe números en dígitos y palabras, y la normalización a dígitos puede contar como error de WER; la puntuación tiene recall 0,68, por lo que parte de la puntuación esperada no se genera.
- Riesgo de alucinación: como todo LLM generativo, puede reescribir contenido que no estaba en la transcripción; conviene validar el uso en dominios sensibles.
- Sesgos conocidos del modelo base no documentados en la información disponible.
- Idiomas: el caso de uso validado es el vietnamita; las capacidades en inglés y chino se heredan del modelo base pero no se han evaluado en esta conversión.
- Longitud de contexto: no se especifica en la información disponible; la memoria de la caché KV crece linealmente con el contexto y puede limitar la ejecución en móviles.
- Latencia en móviles: varias veces superior a los 0,78 s medidos en CPU de escritorio; no apta para aplicaciones de tiempo real estricto.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar los avisos de licencia y atribución del modelo base Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopción comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pdnhan/Qwen2.5-1.5B-Instruct-mobile
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- ONNX Runtime: https://onnxruntime.ai
- ONNX Runtime GenAI (model builder): https://github.com/microsoft/onnxruntime-genai
- PhoWhisper small: https://huggingface.co/vinai/PhoWhisper-small
- pdnhan/PhoWhisper-small-mobile: https://huggingface.co/pdnhan/PhoWhisper-small-mobile
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
