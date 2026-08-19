# JamesQuartz/qt-VI.6.4-49k

## Resumen

QT VI.6.4 es un tokenizador BPE (byte-level) multilingüe de 49.152 tokens, desarrollado por JamesQuartz y publicado bajo licencia Apache-2.0. Su objetivo es servir como columna vertebral compartida para una familia de modelos de lenguaje de pequeño tamaño, con un pretraining centrado en inglés y código y un fine-tuning posterior hacia otras lenguas sin necesidad de recurrir a fallback de bytes. El tokenizador cubre 204 de las 204 lenguas del conjunto FLORES-200, con una atención especial a escrituras de bajos recursos como tibetano, tamil, birmano o malayalam, donde los tokenizadores generalistas suelen degradarse a nivel de byte.

La relevancia de QT VI.6.4 reside en su diseño de vocabulario compacto: 49.152 tokens, menos del 40% del tamaño de los vocabularios de Llama 3.2 (128.256) o DeepSeek V4 (129.280), manteniendo una densidad de compresión en inglés casi idéntica a la de Llama 3.2 (4,63 caracteres/token frente a 4,68). Esto reduce el tamaño de la matriz de embeddings, lo que en modelos pequeños libera presupuesto de parámetros para las capas no-embedding. Además, incluye un bloque fijo de 160 tokens de control con soporte para chat, tool-use y Fill-in-the-Middle (FIM), preparado para fine-tuning sin necesidad de retraining del tokenizador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE byte-level (subword) |
| Parametros totales | no aplicable (tokenizador, no modelo de lenguaje) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | 204 lenguas FLORES-200; etiquetas declaradas: en, zh, hi, ar, ru, ta, bo, my |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (tokenizador; archivos típicos: vocab.json, merges.txt, tokenizer.json) |

## Arquitectura y entrenamiento

QT VI.6.4 es un tokenizador BPE byte-level, lo que garantiza que cualquier secuencia de entrada (incluido código, emojis y escrituras mixtas) pueda codificarse sin pérdida: `decode(encode(x)) == x`. El vocabulario de 49.152 tokens es un múltiplo de 384 × 128, elegido para alinear la proyección de `lm_head` con los tamaños de tile de Tensor-Core.

El entrenamiento se realizó sobre el corpus FLORES-200, según los datos publicados. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset. El tokenizador incorpora un bloque de control de 160 tokens con IDs fijos (0-22) que incluyen marcadores de chat (`<|im_start|>`, `<|im_end|>`, roles), tool-use (`<|tool_call|>`, `<|tool_result|>`), razonamiento (`<|thinking|>`), código (`<|code|>`) y FIM (`<|fim_prefix|>`, `<|fim_suffix|>`, `<|fim_middle|>`, `<|fim_pad|>`). Estos tokens se incluyen a nivel de tokenizador porque la capacidad de infill debe estar presente durante el pretraining para que el modelo pueda aprender a usarlos.

## Capacidades

- Tokenización byte-level sin pérdida para cualquier entrada de texto, código o escritura mixta.
- Cobertura de 200 de 204 lenguas FLORES-200 con subword real (no solo bytes), frente a 179 de Llama 3.2 y 193 de DeepSeek V4.
- Compresión en inglés competitiva: 4,63 caracteres/token, casi idéntica a Llama 3.2 (4,68) con un vocabulario un tercio más pequeño.
- Rendimiento destacado en escrituras de bajos recursos: tibetano (6,70 bytes/token), tamil (6,18), birmano (6,07), malayalam (5,73), telugu (5,21) y hindi (5,70), superando a Llama 3.2 y DeepSeek V4 en estos casos.
- Bloque de tokens de control fijo con soporte para chat multi-turno, tool calling, razonamiento explícito y Fill-in-the-Middle para infill de código.
- Diseñado para fine-tuning multilingüe sin necesidad de retraining del tokenizador.

## Casos de uso

- Preentrenamiento de modelos de lenguaje pequeños con vocabulario compacto: al reducir la matriz de embeddings, QT VI.6.4 permite destinar más parámetros a las capas transformer, útil en modelos de menos de 1B de parámetros.
- Fine-tuning para lenguas de bajos recursos: su cobertura subword en tibetano, birmano, tamil o telugu evita la caída a nivel de byte, mejorando la eficiencia de entrenamiento y la calidad de generación en estas lenguas.
- Asistentes de chat multilingües: los tokens de control `<|im_start|>`, `<|im_end|>` y roles (`<|system|>`, `<|user|>`, `<|assistant|>`) permiten construir pipelines de conversación multi-turno sin modificar el tokenizador.
- Agentes con tool calling: los tokens dedicados `<|tool_call|>` y `<|tool_result|>` facilitan el entrenamiento de modelos que invocan funciones externas y procesan sus resultados.
- Razonamiento estructurado: los marcadores `<|thinking|>` y `<|/thinking|>` permiten entrenar modelos con modo de pensamiento explícito, útil en tareas de matemáticas o lógica.
- Infill de código: los tokens FIM habilitan el entrenamiento de modelos de autocompletado de código en entornos de desarrollo, con soporte para prefijo, sufijo y medio.
- Tokenización de corpus multilingües en pipelines de NLP: su pérdida cero y su cobertura amplia lo hacen adecuado para preprocesar datasets de FLORES-200 u otros corpus multilingües.

## Benchmarks y rendimiento

Los resultados publicados se midieron sobre FLORES-200 devtest, con la métrica principal de bytes por token (mayor es mejor). La media global es de 3,07 bytes/token en las 204 lenguas.

| Lengua | Escritura | QT VI.6.4 | Llama 3.2 | DeepSeek V4 |
|---|---|---|---|---|
| Tibetano | Tibetana | **6,70** | 1,44 | 2,65 |
| Tamil | Tamil | **6,18** | 2,02 | 5,08 |
| Birmano | Myanmar | **6,07** | 1,47 | 3,25 |
| Hindi | Devanagari | **5,70** | 4,85 | 4,46 |
| Malayalam | Malayalam | **5,73** | 1,69 | 3,45 |
| Telugu | Telugu | **5,21** | 1,56 | 3,50 |
| Tailandés | Tailandesa | **5,03** | - | - |

En lenguas de altos recursos, QT VI.6.4 es menos eficiente que sus competidores, como muestra la tabla de caracteres/token:

| Lengua | QT VI.6.4 | Llama 3.2 | DeepSeek V4 |
|---|---|---|---|
| Inglés | 4,63 | 4,68 | 4,88 |
| Alemán | 3,11 | 3,50 | 3,75 |
| Ruso | 2,26 | 3,16 | 3,32 |
| Chino | 1,12 | 1,21 | 1,70 |
| Árabe | 1,91 | 2,53 | 2,66 |

En comparación cara a cara sobre lenguas compartidas, QT VI.6.4 gana en 47 de 190 lenguas frente a Llama 3.2 (25%) y en 41 de 203 frente a DeepSeek V4 (20%). Las victorias se concentran en la cola de bajos recursos; las derrotas, en las lenguas principales.

## Requisitos de hardware

Al ser un tokenizador, QT VI.6.4 no requiere GPU ni memoria específica para su uso; puede ejecutarse en CPU con cualquier framework de tokenización (HuggingFace `tokenizers`, SentencePiece, etc.). Su impacto en hardware se manifiesta indirectamente: el vocabulario de 49.152 tokens reduce el tamaño de la matriz de embeddings del modelo final en comparación con vocabularios de 128K, lo que disminuye los requisitos de VRAM y memoria durante el entrenamiento e inferencia. Para un modelo de 1B de parámetros, la diferencia de embeddings puede suponer un ahorro de cientos de millones de parámetros. No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Inglés (chars/token) | Cobertura FLORES-200 (de 204) | Licencia |
|---|---|---|---|---|
| **QT VI.6.4** | 49.152 | 4,63 | 200 | Apache-2.0 |
| Llama 3.2 | 128.256 | 4,68 | 179 | Llama 3.2 Community License |
| DeepSeek V4 | 129.280 | 4,88 | 193 | DeepSeek License (uso comercial permitido con restricciones) |

QT VI.6.4 ofrece una cobertura más amplia y un vocabulario mucho menor, a costa de una menor densidad en lenguas de altos recursos. Su licencia Apache-2.0 es más permisiva que las de sus competidores, que imponen restricciones de uso comercial o de atribución.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo; es únicamente un tokenizador. No puede generar texto por sí mismo.
- Menor eficiencia en lenguas de altos recursos (alemán, ruso, chino, árabe) en comparación con Llama 3.2 y DeepSeek V4, lo que puede aumentar el número de tokens necesarios para procesar esos idiomas.
- El bloque de tokens de control (IDs 0-22) está congelado y no debe reordenarse; cualquier cambio rompería los fine-tunes dependientes de esas posiciones.
- El diseño está orientado a un pretraining centrado en inglés y código; las lenguas de bajos recursos, aunque bien cubiertas a nivel de tokenización, requerirán fine-tuning específico para lograr buen rendimiento.
- No se han publicado datos sobre sesgos, alucinaciones o calidad de generación, ya que el tokenizador no genera contenido.
- Los datos de DeepSeek V4 en las tablas comparativas provienen de mediciones propias del autor y pueden diferir de las cifras oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JamesQuartz/qt-VI.6.4-49k
- No se han encontrado otros enlaces (paper, repositorio de código o documentación adicional) en la información proporcionada.
