# pdnhan/Ministral-3-3B-Instruct-2512-mobile

## Resumen

Ministral-3-3B-Instruct-2512-mobile es una conversión a ONNX con cuantización int4 del modelo de lenguaje Ministral-3-3B-Instruct-2512 de Mistral AI, publicada por el usuario pdnhan. El objetivo es ejecutar el decodificador de texto en dispositivos Android e iOS mediante ONNX Runtime, sin depender de servidores ni de GPU dedicadas. Se exporta únicamente el decodificador de texto: el codificador de visión Pixtral y su proyector quedan fuera, por lo que el modelo es solo texto.

El modelo base es un transformer de 3.000 millones de parámetros con tokenizador Tekken (BPE a nivel de byte) y atención con escalado tipo Llama 4, que es exactamente 1 por debajo de 16.384 tokens. La conversión fija el contexto en 4.096 tokens en `genai_config.json`, de modo que el grafo coincide con el modelo original en ese rango. Los pesos son los del modelo original; solo cambian el formato (ONNX) y la precisión (int4).

Su caso de uso destacado es el refinado de transcripciones de voz en vietnamita: convierte la salida cruda de un reconocedor (por ejemplo PhoWhisper) en texto escrito limpio, con puntuación, mayúsculas, números en dígitos, fechas en formato día/mes/año, unidades como símbolos y listas habladas convertidas en viñetas. Es relevante ahora porque permite llevar un modelo de 3B a móviles con un peso de aproximadamente 2,28 GB y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral/Ministral), exportado a ONNX con GroupQueryAttention y KV cache |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (fijada en `genai_config.json`) |
| Tipos de cuantizacion | int4 (MatMulNBits simétrico, bloques de 32, `accuracy_level` 4) |
| Idiomas soportados | vietnamita (vi), inglés (en), francés (fr), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), tokenizador en `vocab.txt`, `merges.txt`, `tokenizer.json` |
| Tamano del repositorio | 2,3 GB |
| Cabezas de atencion | 8 cabezas KV, dimension de cabeza 128, 26 capas |
| Vocabulario | 131.072 tokens (Tekken byte-level BPE) |
| Entradas | `input_ids` int64 `[batch, tokens]`, `attention_mask` int64, `past_key_values.{0..25}.key/value` float32 `[batch, 8, past, 128]` |
| Salidas | `logits` float32 `[batch, 1, 131072]`, `present.{0..25}.key/value` float32 `[batch, 8, past+tokens, 128]` |
| Runtime | ONNX Runtime 1.22 o superior; compatible con ONNX Runtime GenAI |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 26 capas con 8 cabezas de atención KV de dimensión 128, atención de tipo GroupQueryAttention con caché KV y embeddings atados compartidos entre la entrada y la cabeza LM. La exportación usa RoPE con escalado YaRN; el escalado de atención tipo Llama 4 de Ministral es exactamente 1 por debajo de 16.384 tokens, y como el contexto configurado es de 4.096 tokens, el grafo coincide con el modelo original en ese rango. La cabeza LM solo calcula los logits de la última posición. El embedding atado se exporta como `GatherBlockQuantized` en 4 bits.

El modelo base fue entrenado por Mistral AI; esta ficha no dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La conversión a ONNX se realizó con el ONNX Runtime GenAI model builder (`-p int4 -e cpu`) a partir de los pesos BF16 de `mistralai/Ministral-3-3B-Instruct-2512-BF16`. No se modifica ningún peso: solo se cambia el formato y la precisión. El modelo incluye una plantilla de chat (`chat_template.jinja`) y un tokenizador Tekken con 1.000 tokens de control al principio del vocabulario.

## Capacidades

- Generación de texto en vietnamita, inglés, francés y otros idiomas multilingües.
- Refinado de transcripciones de voz: añade puntuación y mayúsculas, corrige palabras mal oídas por contexto, elimina muletillas y tartamudeos.
- Normalización de números a dígitos, fechas en formato día/mes/año (por ejemplo `20/11/2026`) y unidades como símbolos (por ejemplo `5 kg`).
- Conversión de listas habladas en viñetas.
- Formato de chat instructivo mediante plantilla Jinja.
- Inferencia en dispositivo (Android e iOS) con ONNX Runtime, sin servidor.
- Solo texto: no procesa imágenes ni audio (el codificador de visión Pixtral fue excluido).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Refinado de transcripciones de voz en vietnamita: se pasa la salida cruda de PhoWhisper u otro reconocedor y el modelo devuelve texto escrito limpio con puntuación, mayúsculas y números normalizados. Es el caso principal documentado y para el que se publican métricas.
- Aplicaciones móviles de dictado y notas de voz: el modelo cabe en un dispositivo Android o iOS con un peso de aproximadamente 2,28 GB y se ejecuta con ONNX Runtime, sin conexión a red.
- Post-procesado de actas de reuniones: convierte listas habladas de temas en viñetas y normaliza fechas y cantidades, útil para generar resúmenes estructurados a partir de audio transcrito.
- Normalización de datos de contacto: convierte secuencias de dígitos dictadas (por ejemplo números de teléfono) en cadenas numéricas compactas.
- Asistentes de voz para atención al cliente: el modelo puede limpiar y estructurar la transcripción antes de pasarla a un sistema posterior, con contexto de 4.096 tokens para conversaciones multi-turno moderadas.
- Generación de texto instructivo en inglés y francés en entornos sin conectividad, gracias a su naturaleza multilingüe y a la licencia Apache 2.0.
- Prototipado de pipelines de voz a texto en producción: el repositorio incluye una referencia en Python del refinador, lo que facilita la integración y la evaluación antes de desplegar en móvil.

## Benchmarks y rendimiento

Se han publicado métricas de precisión del refinador sobre 300 transcripciones de PhoWhisper de clips de test de FLEURS en vietnamita (los primeros 150 clips, transcritos por los modelos int8 PhoWhisper tiny y small), comparadas con las transcripciones originales y con el refinador Qwen2.5-1.5B sobre las mismas transcripciones:

| Reconocedor | WER de la transcripción | Tras este refinador | Tras el refinador Qwen2.5-1.5B |
|---|---|---|---|
| PhoWhisper small (int8) | 12,3 % | 11,0 % | 11,0 % |
| PhoWhisper tiny (int8) | 28,9 % | 27,5 % | 26,7 % |

La información proporcionada incluye además columnas de precisión, recall, F1 y segundos por transcripción, pero sus valores no están disponibles en el material consultado. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo int4 ocupa aproximadamente 2,28 GB de pesos; en CPU móvil se necesita al menos esa cantidad de memoria libre, más la caché KV (float32, 8 cabezas × 128 dimensiones × 26 capas × contexto).
- GPU recomendadas: no se especifican; el modelo está pensado para CPU en Android e iOS mediante ONNX Runtime.
- Cabe en GPU de consumo: sí, por tamaño (2,28 GB en int4), aunque la exportación está optimizada para CPU (`-e cpu`).
- Opciones de despliegue: ONNX Runtime 1.22 o superior y ONNX Runtime GenAI; el repositorio incluye una referencia en Python.
- Latencia y throughput: no disponibles; solo se mencionan segundos por transcripción en la tabla de precisión, sin valores publicados en la información consultada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Instruct-2512-mobile (este) | 3B | 4.096 | ONNX int4 | Apache 2.0 | Solo texto; optimizado para móvil; refinador de voz en vietnamita |
| Qwen2.5-1.5B-Instruct-mobile (pdnhan) | 1,5B | no disponible | ONNX móvil | no disponible | Mismo pipeline de refinado; WER comparable en PhoWhisper small (11,0 %) y mejor en tiny (26,7 % frente a 27,5 %) |
| mistralai/Ministral-3-3B-Instruct-2512-BF16 | 3B | no disponible | BF16 (safetensors) | Apache 2.0 | Modelo base original, con codificador de visión Pixtral; no optimizado para móvil |

## Limitaciones y advertencias

- Solo texto: el codificador de visión Pixtral y su proyector fueron excluidos, por lo que no procesa imágenes.
- Contexto limitado a 4.096 tokens, fijado en la configuración; no aprovecha el contexto mayor del modelo original.
- El modelo está cuantizado a int4, lo que puede introducir pérdida de precisión frente a los pesos BF16 originales.
- Los benchmarks publicados se limitan al refinado de transcripciones en vietnamita; no hay evaluación general de razonamiento, código o matemáticas.
- Riesgo de alucinación y de sesgos heredados del modelo base; no se documentan sesgos específicos.
- El rendimiento en idiomas distintos del vietnamita, inglés y francés no está evaluado.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribuir correctamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y poco validada por la comunidad.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pdnhan/Ministral-3-3B-Instruct-2512-mobile
- Modelo base BF16: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Modelo base original: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- ONNX Runtime: https://onnxruntime.ai
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
- Pipeline de referencia Qwen2.5-1.5B-Instruct-mobile: https://huggingface.co/pdnhan/Qwen2.5-1.5B-Instruct-mobile
- PhoWhisper small: https://huggingface.co/vinai/PhoWhisper-small
- PhoWhisper-small-mobile: https://huggingface.co/pdnhan/PhoWhisper-small-mobile
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
