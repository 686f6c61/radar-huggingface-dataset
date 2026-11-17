# ryuma007/hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20

## Resumen

Hishab es un modelo de extracción de información financiera obtenido por ajuste fino completo de Qwen/Qwen3.5-0.8B, desarrollado por el usuario ryuma007. Su única tarea es convertir mensajes en banglish (bengalí escrito con caracteres latinos), bengalí o inglés —a menudo mezclados— en una línea por transacción con el formato `description|amount|category`, donde el signo del importe distingue gasto (`-`) de ingreso (`+`) y `NONE` indica ausencia de transacción.

El modelo parte de una arquitectura transformer de Qwen3.5 y aplica dos transformaciones agresivas: una poda de vocabulario de 248.000 a 38.000 tokens (recortando la tabla de embeddings atada) y la eliminación de las capas 8, 9, 12 y 13, pasando de 24 a 20 capas. El resultado son 450.803.904 parámetros reales (frente a los ~0,75B del modelo base) y un repositorio de 0,9 GB en bfloat16, con licencia Apache 2.0.

Es relevante porque demuestra que un modelo sub-1B, podado y con vocabulario recortado, puede alcanzar un 95,0% de exactitud en conjuntos de prueba limpios para una tarea estructurada muy concreta, con una generación aproximadamente un 45% más rápida en un Pixel 8 y la mitad de tokens de salida que las variantes que emiten JSON. Está pensado para integrarse en aplicaciones de finanzas personales para usuarios bangladeshíes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5 text), 20 capas tras poda (original: 24) |
| Parámetros totales | 450.803.904 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); GGUF para llama.cpp en repositorio aparte |
| Idiomas soportados | bn (bengalí), en (inglés), banglish (bengalí en caracteres latinos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only con embeddings atados a la salida. Sobre él se aplicó un ajuste fino completo (todos los pesos, 3 épocas, learning rate 3e-05) para la tarea de extracción de transacciones. Posteriormente se recortó el vocabulario de 248.000 a 38.000 tokens —conservando inglés, bengalí, banglish, todos los tokens de un solo carácter (para que cualquier texto siga codificándose) y todos los tokens especiales— y se rebanó la tabla de embeddings/salida atada en consecuencia, sin reentrenamiento. Esto redujo el modelo de 0,75B a 0,54B parámetros y aceleró la generación aproximadamente un 45% en un Pixel 8.

Después se podaron las capas 8, 9, 12 y 13 (de 24 a 20 capas), y el modelo resultante se curó durante 2 épocas sobre `train_v13` con todos los pesos entrenables, usando una pérdida que combina KL divergence frente al modelo sin podar en los tokens de respuesta más 0,2 veces la entropía cruzada sobre el gold (learning rate 2e-05). La concordancia top-1 con el modelo sin podar es del 97,9%. El entrenamiento se realizó sobre el dataset sintético `ryuma007/hishab-synthetic-v7` y el modelo se sirve con el modo thinking desactivado (bloque `<think>` vacío en el turno del asistente).

## Capacidades

- Extracción de transacciones financieras desde texto libre en banglish, bengalí, inglés o mezcla de los tres, emitiendo una línea `description|amount|category` por transacción.
- Distinción de tipo de transacción mediante el signo del importe: `-` para gasto, `+` para ingreso.
- Expansión de abreviaturas numéricas como `1.5k` o `2 lakh` a números en BDT.
- Clasificación en 14 categorías fijas: food, grocery, rent, utilities, mobile_recharge, transport, tuition, salary, gift, loan, shopping, medical, entertainment, other.
- Detección de ausencia de transacción mediante la respuesta `NONE`.
- Salida en formato de tuberías, con aproximadamente la mitad de tokens de salida que las variantes que emiten JSON.
- Soporte de plantilla de chat con `enable_thinking=False`.
- No dispone de tool calling, agentes, visión, audio ni capacidades multimodales según la información disponible.

## Casos de uso

- Registro automático de gastos en apps de finanzas personales: el modelo recibe el mensaje del usuario y devuelve una línea por transacción con importe y categoría, lista para insertar en una base de datos sin postprocesado JSON.
- Procesamiento por lotes de historiales de chat: al aceptar contexto de conversación y devolver solo las líneas de transacción, permite extraer movimientos de conversaciones multi-turno de WhatsApp o Messenger.
- Clasificación de ingresos y gastos para presupuestos: el signo del importe permite separar directamente nóminas (`salary`, `+`) de gastos recurrentes (`rent`, `-`) sin reglas adicionales.
- Despliegue en dispositivos móviles o de bajos recursos: con 451M parámetros y pesos bf16 de 0,9 GB, es viable en teléfonos de gama media (el autor reporta un 45% más de velocidad en un Pixel 8) y en CPU mediante llama.cpp con los GGUF publicados.
- Normalización de mensajes mixtos banglish/inglés: usuarios que escriben frases como «Salary paisi 35k but basha vara dilam 12k» obtienen dos transacciones correctamente separadas y categorizadas.
- Extracción de importes escritos con abreviaturas: la expansión de `1.5k` y `2 lakh` a cifras BDT evita pasos de preprocesado numérico en el pipeline.
- Filtrado de mensajes sin contenido financiero: la respuesta `NONE` permite descartar mensajes irrelevantes antes de enviarlos a un sistema de contabilidad.

## Benchmarks y rendimiento

Resultados en bf16, decodificación greedy, sobre particiones de `ryuma007/hishab-synthetic-v7` no vistas en entrenamiento. *exact* indica que el conjunto de tuplas (importe, categoría, tipo) coincide con el gold; F1 es micro F1 sobre esas tuplas.

| split | filas | exact | tuple F1 | JSON válido | exact banglish / bangla / inglés / mixto |
|---|---|---|---|---|---|
| test_clean | 476 | 95,0 | 97,6 | 100,0 | 91,1 / 99,1 / 97,0 / 95,8 |
| numbers_clean (importes en palabras) | 317 | 90,2 | 93,3 | 100,0 | 90,7 / 88,8 / 90,5 / 90,9 |
| test (etiquetas originales) | 518 | 79,9 | 89,6 | 100,0 | 71,2 / 90,4 / 79,8 / 88,0 |
| numbers (etiquetas originales, importes en palabras) | 357 | 75,9 | 82,3 | 99,7 | 75,2 / 76,4 / 75,6 / 77,0 |

`test_clean` y `numbers_clean` corresponden a las filas donde dos etiquetadores independientes (Gemini 3.8 Flash y Claude Sonnet 5.5) coinciden siguiendo la guía de etiquetado, y son las cifras principales. Las etiquetas originales de `test` incumplen la guía en aproximadamente el 14% de las filas, por lo que la puntuación menor en esas particiones es esperada por diseño. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,9 GB de pesos más overhead de activaciones y KV cache; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema. El modelo está sobredimensionado para GPUs de datacenter.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU y CPU.
- Despliegue: llama.cpp con los GGUF del repositorio `ryuma007/hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20-GGUF`; transformers con `AutoModelForCausalLM` y `AutoTokenizer` (requiere sustituir el tokenizador por `tokenizer.json` para bengalí). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: el autor reporta una generación aproximadamente un 45% más rápida en un Pixel 8 respecto al modelo sin recorte de vocabulario; no se publican cifras absolutas de tokens por segundo ni latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20 | 450.803.904 | no disponible | Extracción de transacciones financieras (bn/en/banglish) | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-0.8B (base) | ~0,75B | no disponible | Propósito general | no disponible en la información | Hugging Face |
| Modelo sin podar `qwen3.5-0.8b__pipe_signed__full__v13__trim38k` | ~0,54B | no disponible | Extracción de transacciones financieras | no disponible en la información | Referenciado en la model card, sin URL |
| Variantes JSON del mismo autor (mencionadas) | no disponible | no disponible | Extracción de transacciones en JSON | no disponible en la información | No se proporciona enlace |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible comparar rendimiento numérico entre ellos.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con mensajes sintéticos; los usuarios reales escriben banglish más desordenado, lo que puede degradar la exactitud.
- Los importes escritos con palabras en banglish son el punto más débil: exact del 90,2 en `numbers_clean` y del 75,9 en `numbers` con etiquetas originales.
- Las convenciones de categorías siguen la guía de etiquetado del proyecto Hishab; otras aplicaciones pueden querer clasificar, por ejemplo, ingresos por tutorías como `tuition` en lugar de `salary`.
- Las etiquetas originales del split `test` incumplen la guía en aproximadamente el 14% de las filas, por lo que las métricas sobre esas particiones no reflejan fielmente la calidad real del modelo.
- El tokenizador requiere un paso manual: transformers 5.10 reconstruye un `Qwen2Tokenizer` que divide palabras bengalíes en sus marcas combinantes, mientras que el modelo se entrenó con la tokenización de `tokenizer.json`; inglés y banglish no se ven afectados.
- El texto en otros alfabetos distintos del latino y el bengalí sigue funcionando pero se fragmenta en más piezas, más raras, lo que puede reducir la calidad.
- Riesgo de alucinación en importes o categorías no presentes en el mensaje original no cuantificado en la información disponible.
- El modelo está diseñado para una única tarea; no debe esperarse razonamiento general, código ni matemáticas complejas.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan sesgos específicos más allá de los derivados de los datos sintéticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryuma007/hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20
- GGUF para llama.cpp: https://huggingface.co/ryuma007/hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ryuma007/hishab-synthetic-v7
- Repositorio de entrenamiento: https://github.com/RaihanulHaque/hishab
- Guía de etiquetado: https://github.com/RaihanulHaque/hishab/blob/main/docs/LABELLING_GUIDELINE.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
