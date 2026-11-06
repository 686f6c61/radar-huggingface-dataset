# pdnhan/Arcee-VyLinh-mobile

## Resumen

Arcee-VyLinh-mobile es una conversión a ONNX de 4 bits del modelo arcee-ai/Arcee-VyLinh, una adaptación del Qwen2.5 orientada a la posprocesamiento de transcripciones de reconocimiento automático del habla en vietnamita. El autor de la conversión es pdnhan, que publica el modelo con código listo para usar en Android (Kotlin) e iOS (Swift), incluyendo tokenizador, bucle de generación con caché KV y una plantilla de chat idéntica a la del modelo original.

El problema que resuelve es concreto: convertir la salida cruda de un sistema ASR (por ejemplo PhoWhisper) en texto escrito limpio, añadiendo puntuación y mayúsculas, corrigiendo palabras mal oídas por contexto, eliminando muletillas y tartamudeos, escribiendo números en dígitos, fechas en formato día/mes/año y unidades como símbolos, además de convertir listas habladas en viñetas. Es la pieza que la aplicación Thì Thầm ejecuta después de PhoWhisper en dispositivos móviles.

La relevancia actual reside en que demuestra un flujo completo de posprocesamiento ASR en el dispositivo con un modelo de aproximadamente 2 GB en int4, sin depender de la nube. Los pesos son los del modelo original; solo cambian el formato y la precisión. La arquitectura subyacente es la de Qwen2.5 (transformer denso con GroupQueryAttention y 36 capas, a juzgar por la interfaz de caché KV), aunque el número exacto de parámetros totales no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen2.5, exportado a ONNX con GroupQueryAttention y caché KV |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (MatMulNBits simétrico, bloques de 32, accuracy_level 4; embedding atado cuantizado con GatherBlockQuantized) |
| Idiomas soportados | vi, en, zh, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx.data), tokenizador en vocab.txt, merges.txt y tokenizer.json |

## Arquitectura y entrenamiento

El modelo es una conversión del Arcee-VyLinh original, que a su vez deriva de Qwen2.5. La arquitectura es un transformer denso con 36 capas (según los tensores `past_key_values.{0..35}`), atención con GroupQueryAttention y caché KV de forma `[batch, 2, past, 128]`, lo que indica 2 cabezas KV de dimensión 128 por capa. El vocabulario tiene 151.936 entradas, coherente con el tokenizador de Qwen2.5. La exportación se realizó con el model builder de ONNX Runtime GenAI con opciones `-p int4 -e cpu`, generando un grafo de 287,8 kB y un fichero de pesos de 1.946,3 MB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. El autor indica explícitamente que los pesos son los del modelo original y que solo difieren el formato y la precisión. La innovación técnica destacable es la optimización para inferencia en dispositivo: cuantización int4 simétrica por bloques de 32, embedding atado compartido con la cabeza LM que solo calcula los logits de la última posición, y compatibilidad tanto con ONNX Runtime puro (1.22 o superior; probado con 1.31.1) como con ONNX Runtime GenAI.

## Capacidades

- Generación de texto y reescritura de transcripciones ASR en vietnamita, con puntuación, mayúsculas y corrección contextual de palabras mal reconocidas.
- Normalización de entidades: números en dígitos, fechas en formato `20/11/2026`, unidades como `5 kg`.
- Eliminación de muletillas y tartamudeos, y conversión de listas habladas en viñetas.
- Soporte multilingüe declarado para vietnamita, inglés y chino, aunque el caso de uso documentado y evaluado es el vietnamita.
- Inferencia en dispositivo en Android e iOS mediante ONNX Runtime, con código Kotlin y Swift proporcionado.
- Integración con el tokenizador original de Qwen2.5 y plantilla de chat idéntica a la del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio nativo ni modo de razonamiento explícito.

## Casos de uso

- Posprocesamiento de dictado en aplicaciones móviles: el modelo recibe la transcripción cruda de un ASR como PhoWhisper y devuelve texto con puntuación y mayúsculas, adecuado para notas de voz y mensajería en vietnamita.
- Subtitulado y transcripción de reuniones: convierte listas habladas en viñetas y normaliza fechas y cifras, lo que facilita la lectura de actas generadas automáticamente.
- Asistentes de voz sin conexión: al ejecutarse en el dispositivo con ONNX Runtime, permite posprocesar dictado sin enviar audio ni texto a servidores externos.
- Aplicaciones de accesibilidad para personas con dificultades de escritura: el usuario dicta y el modelo produce texto limpio y legible en vietnamita.
- Normalización de datos para pipelines de NLP: antes de indexar o analizar transcripciones, el modelo estandariza números, fechas y unidades, reduciendo la variabilidad del texto.
- Corrección contextual de errores ASR: el modelo usa el contexto de la frase para corregir palabras mal oídas, como nombres propios o términos técnicos, algo útil en dominios especializados.
- Prototipado rápido en iOS y Android: el repositorio incluye código Kotlin y Swift con el bucle de generación y la caché KV, lo que reduce el tiempo de integración en aplicaciones móviles.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 300 transcripciones PhoWhisper de clips de test de FLEURS en vietnamita (los primeros 150 clips, transcritos por los modelos int8 PhoWhisper tiny y small de pdnhan/PhoWhisper-small-mobile y sus variantes), comparadas con las transcripciones originales:

| Reconocedor | WER de la transcripción | Tras el refinador |
|---|---|---|
| PhoWhisper small (int8) | 12,3% | 10,8% |
| PhoWhisper tiny (int8) | 28,9% | 27,4% |

La puntuación (`. , ? ! :` sobre las palabras compartidas por ambos textos) alcanza precisión 0,75, recall 0,69 y F1 0,72. El WER se mide sin distinguir mayúsculas ni puntuación; dado que FLEURS escribe números tanto en dígitos como en palabras, un número que el refinador escribe en dígitos puede contarse como error. El tiempo por transcripción en CPU x86 de escritorio con 8 hilos es de 1,41 s; en teléfonos es varias veces más lento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,95 GB de pesos int4, más overhead de activaciones y caché KV; el repo completo ocupa 2,0 GB.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU móvil y de escritorio mediante ONNX Runtime.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4 GB de memoria, aunque el objetivo principal es la inferencia en CPU.
- Opciones de despliegue: ONNX Runtime 1.22 o superior (probado con 1.31.1) y ONNX Runtime GenAI; código de referencia en Kotlin (JVM) y Swift para Android e iOS.
- Latencia y throughput: 1,41 s por transcripción en CPU x86 de 8 hilos; en dispositivos móviles, varias veces más lento según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arcee-VyLinh-mobile | no disponible | no disponible | ONNX int4 para móvil, posprocesamiento ASR vietnamita | Apache 2.0 | Hugging Face, ONNX |
| arcee-ai/Arcee-VyLinh | no disponible | no disponible | Modelo original en formato Hugging Face | Apache 2.0 | Hugging Face |
| PhoWhisper-small (int8) | no disponible | no disponible | ASR vietnamita, no refinador de texto | no disponible en la información | Hugging Face |
| Qwen2.5 base | no disponible | no disponible | Modelo generalista del que deriva la familia | no disponible en la información | Hugging Face |

La comparación directa con alternativas de refinamiento ASR en vietnamita no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El caso de uso evaluado es exclusivamente vietnamita; el rendimiento en inglés, chino u otros idiomas declarados no está documentado.
- El WER se mide sin distinguir mayúsculas ni puntuación, y la normalización de números puede introducir errores contables en la evaluación.
- La puntuación del refinador tiene F1 de 0,72, por lo que persisten errores de puntuación y mayúsculas en producción.
- La latencia en móviles es varias veces superior a 1,41 s por transcripción, lo que puede ser limitante en aplicaciones interactivas.
- No se documentan sesgos conocidos ni riesgos específicos de alucinación más allá de los propios de un modelo generativo; al reescribir texto, puede introducir cambios no deseados en el contenido.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base arcee-ai/Arcee-VyLinh y de Qwen2.5.
- El modelo no incluye salvaguardas documentadas ni filtros de contenido; en producción conviene añadir validación posterior del texto refinado.

## Enlaces

- [pdnhan/Arcee-VyLinh-mobile en Hugging Face](https://huggingface.co/pdnhan/Arcee-VyLinh-mobile)
- [arcee-ai/Arcee-VyLinh (modelo base)](https://huggingface.co/arcee-ai/Arcee-VyLinh)
- [ONNX Runtime](https://onnxruntime.ai)
- [ONNX Runtime GenAI](https://github.com/microsoft/onnxruntime-genai)
- [vinai/PhoWhisper-small](https://huggingface.co/vinai/PhoWhisper-small)
- [pdnhan/PhoWhisper-small-mobile](https://huggingface.co/pdnhan/PhoWhisper-small-mobile)
- [Dataset FLEURS](https://huggingface.co/datasets/google/fleurs)
- [python/qwen_refine.py](https://huggingface.co/pdnhan/Arcee-VyLinh-mobile/blob/main/python/qwen_refine.py)
