# pakutoma/jasmine-yomi-0.8b

## Resumen

jasmine-yomi-0.8b es un modelo de conversión de grafemas a fonemas (G2P) especializado en japonés, desarrollado por el usuario pakutoma. Su única tarea es recibir texto japonés con mezcla de kanji, hiragana y katakana y devolver la lectura contextual en hiragana, resolviendo el problema clásico de la lectura ambigua de kanji (por ejemplo, distinguir on'yomi de kun'yomi según el contexto de la frase). Es un ajuste fino completo (full SFT) del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de 24 capas con hidden_size de 1024 y pesos en bfloat16.

El modelo resulta relevante porque aborda una tarea muy concreta con una precisión muy alta: un 99,01 % de exactitud estricta sobre el benchmark JKYB-Parakeet (13.536 frases), con un CER de kana objetivo del 1,03 % en crudo y del 0,89 % con alineamiento @1. Frente a aproximaciones basadas en diccionarios o en modelos G2P dedicados, aquí se aprovecha la capacidad de modelado de contexto de un LLM, lo que permite desambiguar lecturas que dependen de la frase completa y no solo de la palabra aislada.

Con 752.393.024 parámetros reales (0,75B), el modelo es lo bastante pequeño para ejecutarse en hardware de consumo y se distribuye también en formato GGUF (BF16, Q8_0 y Q4_K_M) para llama.cpp, además de los pesos safetensors originales. La licencia Apache-2.0 facilita su integración en productos comerciales. No usa plantilla de chat: la entrada se construye concatenando el texto con el token especial `<sep>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM, text-only, 24 capas, hidden_size=1024) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (los ejemplos de despliegue usan max_model_len=2048 en vLLM) |
| Tipos de cuantizacion | BF16, Q8_0 y Q4_K_M (variante GGUF); pesos originales en bfloat16 |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de tipo Qwen3_5ForCausalLM en variante solo texto, con 24 capas y dimensión oculta de 1024. Sobre esa base se aplica un ajuste fino supervisado completo (full SFT, actualización de todos los parámetros) con `max_pair_tokens=512` y sin truncado, según indica la model card. Los pesos resultantes se publican en bfloat16.

Los datos de entrenamiento son ReazonSpeech v2 y CC-100, dos corpus en japonés de naturaleza distinta: el primero proviene de transcripciones de audio y aporta lenguaje oral y coloquial; el segundo es texto web, con mayor variedad de registro y vocabulario. La tarea se formula como generación condicionada: el texto de entrada se concatena directamente con el token especial `<sep>` (ID 248077), sin token BOS ni plantilla de chat, y el modelo genera la lectura en hiragana hasta el token de parada `<|im_end|>` (ID 248046). No se documentan fases de RLHF ni DPO; el pipeline es exclusivamente SFT.

La innovación técnica no está en la arquitectura, sino en la especialización: se reutiliza un LLM pequeño como transductor G2P contextual, con una convención de salida explícita (hiragana, partículas は y へ preservadas tal cual, expansión de números y palabras en inglés a hiragana, y conservación de los signos 。、！？).

## Capacidades

- Conversión de kanji a lectura en hiragana con desambiguación contextual (on'yomi frente a kun'yomi según la frase).
- Generación de furigana a nivel de frase, útil para anotación de textos japoneses.
- Expansión de números, kanji numéricos y palabras en inglés a su lectura en hiragana.
- Conservación de las partículas は y へ tal como están escritas (no se convierten en わ ni え), y de los signos 。、！？.
- Manejo del alargamiento vocálico con el símbolo ー, que se mantiene en la salida.
- Inferencia determinista recomendada (greedy, `do_sample=False`), lo que da resultados reproducibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de tarea única.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.
- Multilingüismo limitado al japonés; no se documenta soporte de otras lenguas.

## Casos de uso

- Anotación de furigana en corpus y bibliotecas digitales: el modelo convierte frases completas de texto japonés en su lectura en hiragana, lo que permite generar automáticamente capas de ruby para libros electrónicos, periódicos digitales o archivos de patrimonio documental sin intervención manual por palabra.
- Preprocesado para síntesis de voz (TTS): los sistemas TTS en japonés necesitan la lectura fonética de los kanji; este modelo proporciona la secuencia en hiragana que alimenta el front-end del sintetizador, con una precisión del 99,01 % que reduce los errores de pronunciación.
- Reconocimiento automático del habla (ASR) y alineamiento: en pipelines que comparan transcripciones con audio, disponer de la lectura correcta de cada frase permite calcular distancias fonéticas fiables; el modelo está entrenado parcialmente con ReazonSpeech v2, corpus de habla real.
- Búsqueda y recuperación de información en japonés: para indexar documentos por lectura (por ejemplo, búsquedas por fonética o por kana) se necesita normalizar los kanji a hiragana; el modelo permite construir índices fonéticos sobre corpus grandes con un coste de cómputo bajo gracias a sus 0,75B de parámetros.
- Herramientas de accesibilidad y aprendizaje de japonés: generación de furigana sobre textos para estudiantes o lectores con dificultades, integrable en extensiones de navegador o aplicaciones de lectura, con despliegue local en formato GGUF Q4_K_M.
- Normalización de datos para entrenamiento de otros modelos: la conversión consistente de kanji a kana sirve para limpiar y homogeneizar corpus japoneses antes de usarlos en el entrenamiento de modelos mayores, evitando ambigüedades de lectura en los datos.
- Verificación y control de calidad editorial: detección de lecturas incorrectas o poco habituales en textos publicados, comparando la salida del modelo con la lectura esperada por el editor.

## Benchmarks y rendimiento

Evaluación sobre JKYB-Parakeet (Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet), 13.536 frases, `jkyb-eval 0.2.0`, comando `g2p`, decodificación greedy:

| Metrica | jasmine-yomi-0.8b |
|---|---:|
| Accuracy (exacta) | 99,01 % (13.402 / 13.536) |
| Relaxed accuracy | 99,06 % |
| Target kana-CER (raw / @1) | 1,03 % / 0,89 % |
| Sentence kana-CER | 3,18 % |
| on_yomi (7.056 casos) | 99,32 % |
| kun_yomi (6.108 casos) | 98,77 % |
| joyo_appendix_reading (372 casos) | 97,04 % |

El autor advierte que el Sentence kana-CER incluye la diferencia deliberada en las partículas は y へ: el benchmark las representa como ワ y エ, mientras que el modelo las mantiene tal como se escriben.

Comparativa dentro de la familia jasmine-yomi, según la model card:

| Modelo | Base | Parametros | Accuracy | Relaxed acc. | CER objetivo (raw / @1) |
|---|---|---:|---:|---:|---:|
| jasmine-yomi-0.8b | Qwen/Qwen3.5-0.8B | 0,75B | 99,01 % | 99,06 % | 1,03 % / 0,89 % |
| jasmine-yomi-2b | Qwen/Qwen3.5-2B | 1,88B | 99,05 % | 99,10 % | 0,89 % / 0,80 % |
| jasmine-yomi-4b | Qwen/Qwen3.5-4B | 4,21B | 99,29 % | 99,33 % | 0,70 % / 0,61 % |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 1,5 GB solo para los pesos (el repositorio ocupa 1,5 GB); con overhead de activaciones y caché KV, un entorno de 2 a 4 GB de VRAM es suficiente. En GGUF Q8_0, alrededor de 0,8-1 GB; en Q4_K_M, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues de alto rendimiento, A100 o H100 no son necesarias por el tamaño del modelo, pero permiten procesar lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más en bfloat16, y en configuraciones aún más modestas con las cuantizaciones GGUF Q4_K_M o Q8_0.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM`), vLLM (ejemplo oficial con `max_model_len=2048`), llama.cpp mediante la variante GGUF publicada en pakutoma/jasmine-yomi-0.8b-GGUF. No se documenta soporte específico de Ollama ni de TGI.
- Latencia y throughput: no disponible en la información proporcionada. La generación es greedy con `max_new_tokens=384` y parada en `<|im_end|>`, lo que acota el coste por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jasmine-yomi-0.8b | 0,75B | no disponible | G2P japonés (kanji a hiragana) | Apache-2.0 | safetensors y GGUF |
| jasmine-yomi-2b | 1,88B | no disponible | G2P japonés | Apache-2.0 (según familia) | safetensors y GGUF |
| jasmine-yomi-4b | 4,21B | no disponible | G2P japonés | Apache-2.0 (según familia) | safetensors y GGUF |
| Qwen/Qwen3.5-0.8B (base) | 0,75B | no disponible | LLM generalista | Apache-2.0 | safetensors |

No se dispone de datos de benchmarks de otros modelos G2P japoneses en la información proporcionada, por lo que la comparación se limita a la familia jasmine-yomi y al modelo base. El 0.8b es la variante más ligera de la familia y la de menor precisión (99,01 % frente a 99,05 % del 2b y 99,29 % del 4b), pero también la de menor coste de inferencia.

## Limitaciones y advertencias

- Modelo de tarea única: no es un asistente conversacional ni un LLM generalista; no soporta tool calling, agentes ni razonamiento multi-paso, y su uso fuera de la conversión G2P no está previsto.
- No usa plantilla de chat: introducir el texto con los tokens `<|im_start|>` o similares degrada la salida; es obligatorio concatenar `<sep>` al final y usar `<|im_end|>` como parada.
- Convención de salida específica: las partículas は y へ se mantienen tal cual, lo que difiere de benchmarks que las representan como ワ y エ; hay que tenerlo en cuenta al comparar métricas o al integrar la salida en sistemas que esperan la forma fonética.
- Idiomas: solo japonés. El entrenamiento con CC-100 y ReazonSpeech v2 no garantiza un comportamiento fiable con texto mixto de otras lenguas más allá de la expansión de palabras en inglés a hiragana.
- Riesgo de alucinación: como todo modelo generativo, puede producir lecturas incorrectas en kanji poco frecuentes, nombres propios o contextos ambiguos; el 97,04 % en la categoría joyo_appendix_reading indica que los casos de lectura de apéndice son el punto más débil.
- Longitud de contexto no documentada: los ejemplos usan 2048 tokens en vLLM y `max_new_tokens=384`; frases muy largas pueden requerir truncado o segmentación previa.
- Sesgos: no se documentan análisis de sesgos; al entrenar con corpus web y de habla, puede heredar sesgos de registro y de vocabulario de esas fuentes.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B es propiedad de Alibaba Cloud (Copyright 2026) y también Apache-2.0; conviene conservar los avisos de atribución correspondientes.
- Madurez: el repositorio tiene 2 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pakutoma/jasmine-yomi-0.8b
- Variante GGUF: https://huggingface.co/pakutoma/jasmine-yomi-0.8b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Benchmark JKYB-Parakeet: https://huggingface.co/datasets/Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet
- Familia jasmine-yomi-2b: https://huggingface.co/pakutoma/jasmine-yomi-2b
- Familia jasmine-yomi-2b GGUF: https://huggingface.co/pakutoma/jasmine-yomi-2b-GGUF
- Familia jasmine-yomi-4b: https://huggingface.co/pakutoma/jasmine-yomi-4b
- Familia jasmine-yomi-4b GGUF: https://huggingface.co/pakutoma/jasmine-yomi-4b-GGUF
- Perfil del autor: https://huggingface.co/pakutoma
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
