# proofbird/gector-bert-en

## Resumen

gector-bert-en es un modelo de corrección gramatical del inglés basado en GECToR (Grammatical Error Correction: Tag, Not Rewrite), un esquema de etiquetado de secuencias que en lugar de reescribir texto predice una etiqueta de edición por token. Lo publica Patrick Hartnett bajo el nombre proofbird como el modelo de gramática on-device de Proofbird, un asistente de escritura para Windows, y el repositorio se publica para que cualquiera pueda inspeccionar qué se ejecuta en su máquina. Sobre el encoder google-bert/bert-base-cased se añaden una cabeza de etiquetado con 5 000 etiquetas de edición y una cabeza de detección de errores, y el conjunto se exporta a ONNX (fp32, opset 17) para inferencia en CPU.

El modelo no parafrasea: para cada token predice una de seis operaciones (mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas/minúsculas, cambiar la forma verbal) y aplica las ediciones, reetiquetando la frase hasta cinco veces. Corrige concordancia sujeto-verbo, tiempos y participios, `a`/`an`, plurales irregulares, confundibles (`their`/`there`/`they're`, `its`/`it's`, `then`/`than`), palabras duplicadas, mayúsculas iniciales y errores de registro cotidiano en preguntas, imperativos y primera y segunda persona.

Su relevancia está en el enfoque de precisión: se entrenó exclusivamente con datos sintéticos (Wikipedia y Tatoeba corrompidos con reglas escritas a mano, sin corpus de aprendices ni datos de usuario) y se midió con un conjunto de oro de 420 frases escritas a mano, donde corrigió 258 errores, dejó intactas las 154 frases correctas, falló 8 y no empeoró ninguna. Es un modelo pequeño, determinista y auditable, pensado para ejecutarse localmente en CPU sin conexión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) con cabeza de etiquetado de ediciones (GECToR) y cabeza de detección de errores |
| Parámetros totales | no disponible (el modelo base google-bert/bert-base-cased tiene 110 M; el total con las cabezas no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens; el autor no declara límite explícito) |
| Tipos de cuantización | fp32 (única versión publicada, `model.onnx`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); tokenizador WordPiece en `vocab.txt`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo sigue el esquema GECToR: un encoder BERT base (google-bert/bert-base-cased) con dos cabezas, una de etiquetado con 5 000 etiquetas de edición (`logits_labels`, salida [1, T, 5000]) y otra de detección de errores (`logits_d`, salida [1, T, 2]). Las entradas son `input_ids` y `attention_mask`. La decodificación es iterativa: se predicen las etiquetas, se aplican las ediciones y se reetiqueta la frase hasta cinco veces, de modo que el modelo solo propone ediciones locales y nunca reescribe ni parafrasea el texto.

El entrenamiento usó únicamente datos sintéticos: 3 000 000 de frases de Wikipedia en inglés (`wikimedia/wikipedia`, `20231101.en`) y 250 000 de Tatoeba, corrompidas con reglas de error escritas a mano, manteniendo aproximadamente un 10 % limpias para que el modelo aprenda a no tocar texto correcto. Se añadieron 150 000 frases de plantilla para patrones poco frecuentes en Wikipedia (preguntas, imperativos, primera y segunda persona, sustantivos colectivos y de masa, plurales irregulares, errores en una cláusula posterior). No se usaron corpus de aprendices, datos no comerciales ni texto de usuario. El entrenamiento fue de una época (100 344 pasos, batch 64, learning rate máximo 1,5e-5) en una NVIDIA L4, con identificador de ejecución `2026-11-06-0801`. No se documenta RLHF ni DPO.

Una innovación operativa destacable es el fichero `gector-guards.json`: reglas del lado de la aplicación que retienen ediciones que el modelo falla de forma conocida (por ejemplo, un cambio de número en un sustantivo justo después de un numeral). Estas guardas forman parte del resultado medido. El runtime también usa `language-rules.json` (puntuación final de frase) y `verb-form-vocab.txt` (tabla de formas verbales para las etiquetas `$TRANSFORM_VERB_*`).

## Capacidades

- Corrección de concordancia sujeto-verbo (`The results shows` → `show`).
- Corrección de tiempos y formas participiales (`have went` → `have gone`).
- Uso correcto de `a`/`an`.
- Corrección de plurales irregulares.
- Resolución de confundibles (`their`/`there`/`they're`, `its`/`it's`, `then`/`than`).
- Eliminación de palabras duplicadas.
- Corrección de mayúsculas al inicio de frase.
- Corrección de errores de registro cotidiano en preguntas, imperativos y primera y segunda persona (`Does the machines work` → `Do`, `Opens the window` → `Open`).
- Etiquetado de secuencias (pipeline `token-classification`) con detección de errores por token.
- Inferencia en CPU mediante ONNX Runtime, sin GPU ni conexión.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Asistente de escritura de escritorio: integrado en un editor de texto para Windows mediante ONNX Runtime y un tokenizador propio, corrige la gramática localmente sin enviar el texto a un servidor, lo que encaja con requisitos de privacidad.
- Revisión de documentación técnica en inglés: aplica correcciones conservadoras a manuales y README, dejando intactas las frases correctas (en la medición, 154 de 154 frases correctas sin cambios) para no introducir ruido en textos ya cuidados.
- Preprocesado de corpus para NLP: normaliza errores de concordancia, tiempos verbales y confundibles antes de alimentar pipelines de búsqueda, clasificación o traducción, con bajo riesgo de falsos positivos (0,05 % en 4 000 frases de Tatoeba).
- Filtrado de calidad en plataformas de contenido: detecta y corrige errores frecuentes en comentarios y publicaciones de usuario en inglés, con la ventaja de que el modelo solo propone ediciones locales y nunca reescribe el mensaje original.
- Corrección en herramientas educativas: señala errores gramaticales típicos de aprendices (concordancia, participios, confundibles) en ejercicios de inglés, con la advertencia de que no se entrenó con corpus de aprendices y puede no cubrir errores poco frecuentes.
- Integración en editores y correctores de código abierto: los ficheros son estándar (ONNX, tokenizador WordPiece, vocabulario de etiquetas en `config.json`), de modo que cualquier decodificador estilo GECToR puede consumirlos dentro de un plugin o un servicio ligero.
- Verificación de textos generados: como paso de control de calidad sobre salidas de otros modelos, corrige errores de concordancia y confundibles sin alterar el contenido semántico.

## Benchmarks y rendimiento

| Comprobación | Resultado |
|---|---|
| Conjunto de oro (420 frases escritas a mano: 266 con un error cada una, 154 correctas) | 258 corregidas, 154 intactas, 8 no detectadas, 0 empeoradas |
| Falsas alarmas en 4 000 frases cotidianas de Tatoeba (reservadas del entrenamiento) | 2 modificadas (0,05 %) |
| Falsas alarmas en 2 000 frases de Wikipedia no editadas por humanos | 3 modificadas (0,15 %) |
| Estabilidad: repetición del conjunto de oro anteponiendo un token a cada frase | 8 de 206 frases cambian de resultado (las 4 filas de mayúsculas cambian por construcción y no se cuentan) |

La puntuación del conjunto de oro se obtuvo con las guardas del lado de la aplicación de `gector-guards.json`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, CoNLL-2014, BEA-2019) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El repositorio ocupa 0,4 GB en fp32.
- GPU recomendadas: ninguna necesaria. El entrenamiento se realizó en una NVIDIA L4, pero la inferencia está pensada para CPU.
- Cabe en cualquier equipo de consumo: el tamaño del encoder BERT base (110 M de parámetros) y el formato ONNX fp32 permiten ejecutarlo en portátiles y equipos de escritorio sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (el runtime de referencia de Proofbird, con tokenizador y decodificador propios en C#); cualquier decodificador estilo GECToR que consuma los ficheros estándar del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| proofbird/gector-bert-en | no disponible (base BERT 110 M) | no disponible | GECToR sobre BERT base, ONNX fp32, on-device | Apache-2.0 | Hugging Face |
| GECToR original (Omelianchuk et al., 2020) | no disponible | no disponible | GECToR sobre BERT/RoBERTa, esquema de etiquetado de origen | Apache-2.0 | Repositorio del proyecto GECToR |
| google-bert/bert-base-cased | 110 M | 512 tokens | Encoder BERT base sin cabeza de corrección | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no cubre otros idiomas.
- Entrenado exclusivamente con datos sintéticos: no se usaron corpus de aprendices, por lo que puede no cubrir errores típicos de estudiantes ni errores poco frecuentes.
- El conocimiento léxico es su punto más débil: un sustantivo compuesto o de masa no visto (`dog food`, `consumer market`) puede provocar un cambio de número incorrecto; las guardas lo retienen cuando la forma es conocida.
- Está optimizado para precisión, no para exhaustividad: edita poco, y que deje un texto intacto no significa que sea correcto.
- Riesgo de falsos positivos bajo pero no nulo: 0,05 % en Tatoeba y 0,15 % en Wikipedia en las mediciones del autor.
- Sensibilidad a la posición: anteponer un token a la frase cambió el resultado en 8 de 206 frases del conjunto de oro.
- No parafrasea ni reescribe: solo aplica ediciones locales, por lo que no corrige problemas de estructura, estilo o coherencia global.
- Licencia Apache-2.0 para pesos y ficheros, pero los datos de entrenamiento tienen sus propios términos: Wikipedia es CC BY-SA 4.0 y Tatoeba es CC BY 2.0 FR; conviene revisar la atribución si se redistribuye el modelo.
- Publicado como trabajo personal de Patrick Hartnett; sin descargas ni likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.
- No se documentan límites de longitud de contexto explícitos; el modelo base BERT admite 512 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-en
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Proofbird: https://proofbird.app
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY 2.0 FR: https://creativecommons.org/licenses/by/2.0/fr/
- Artículo sobre BERT en Wikipedia: https://en.wikipedia.org/wiki/BERT_(language_model)
