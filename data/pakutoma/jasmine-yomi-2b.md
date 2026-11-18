# pakutoma/jasmine-yomi-2b

## Resumen

jasmine-yomi-2b es un modelo especializado en la conversión de texto japonés con kanji a su lectura en hiragana (grapheme-to-phoneme o G2P contextual). Lo desarrolla el autor independiente pakutoma y parte de un fine-tuning completo de Qwen/Qwen3.5-2B, un transformer decoder-only de 24 capas y dimensión oculta 2048. El problema que resuelve es la lectura correcta de kanji en contexto: un mismo carácter puede tener lecturas on'yomi, kun'yomi o lecturas especiales de la lista oficial de kanji de uso común (jōyō), y la desambiguación exige entender la palabra y la frase completa.

El modelo se distribuye con licencia Apache-2.0, en safetensors bfloat16 y en versiones GGUF (BF16, Q8_0 y Q4_K_M) para llama.cpp. Su relevancia práctica está en tareas de procesamiento de lengua japonesa que necesitan furigana o lectura fonética fiable: subtitulado, síntesis de voz, generación de ruby para textos educativos, indexación fonética o normalización previa a TTS. Con 2.390.384.448 parámetros totales y un repo de 4,8 GB, es un modelo pequeño que puede ejecutarse en hardware modesto.

La interfaz es deliberadamente atípica: no usa plantilla de chat ni tokens de rol. Se concatena el texto japonés directamente con el token especial `<sep>` (ID 248077), sin BOS, y se decodifica de forma greedy hasta `<|im_end|>` (ID 248046). El modelo está entrenado exclusivamente para japonés y para la tarea de lectura; no es un modelo conversacional de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM, text-only, 24 capas, hidden_size=2048) |
| Parametros totales | 2.390.384.448 (2,39 B); la model card indica 1,88 B en su tabla de familia |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; los ejemplos de uso fijan `max_model_len=2048` y `max_pair_tokens=512` en entrenamiento |
| Tipos de cuantizacion | bfloat16 (safetensors); GGUF en BF16, Q8_0 y Q4_K_M |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-2B, en su variante solo texto (`Qwen3_5ForCausalLM`) con 24 capas y `hidden_size=2048`, con pesos en bfloat16. El fine-tuning es Full SFT, es decir, actualización de todos los parámetros, sin truncamiento y con `max_pair_tokens=512`. No se documenta el uso de RLHF, DPO ni de una fase de alineación posterior; el objetivo es una tarea determinista de transformación texto a lectura.

Los datos de entrenamiento son ReazonSpeech v2 y CC-100, dos corpus de texto japonés de gran escala. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset. La innovación técnica principal no está en la arquitectura, sino en la interfaz: el uso de un token separador `<sep>` en lugar de una plantilla de chat, la decodificación greedy y un conjunto explícito de convenciones de salida (hiragana, partículas は y へ sin convertir a su pronunciación, expansión de números y palabras en inglés a hiragana, conservación de `。、！？`).

## Capacidades

- Conversión de kanji a lectura en hiragana con desambiguación contextual (on'yomi, kun'yomi y lecturas de la tabla apéndice de los jōyō kanji).
- Generación de furigana y ruby a partir de texto japonés sin anotar.
- Expansión de números, kanji numéricos y palabras en inglés a su lectura en hiragana.
- Conservación de las partículas は y へ tal como se escriben, sin convertir a わ y え.
- Conservación de la puntuación básica japonesa (`。、！？`) y omisión de otros símbolos.
- Salida determinista con decodificación greedy, adecuada para pipelines reproducibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo de tarea única.
- Capacidad multilingüe limitada: solo japonés como idioma de entrada y salida.

## Casos de uso

- Generación de furigana para textos educativos: el modelo recibe una frase con kanji y devuelve la lectura en hiragana, que se puede alinear con el texto original para producir ruby en materiales escolares o lectores de japonés para aprendices.
- Preprocesado para síntesis de voz (TTS): antes de enviar texto a un motor TTS japonés, se normaliza la lectura de los kanji para evitar errores de pronunciación en nombres propios, topónimos y compuestos poco frecuentes.
- Subtitulado y transcripción fonética: en pipelines de ASR o de subtitulado se puede usar para generar una pista de lectura o para verificar la pronunciación de términos concretos en la transcripción.
- Indexación y búsqueda fonética: convertir documentos japoneses a su lectura permite construir índices por sonido (por ejemplo, para búsquedas por cómo suena un nombre) y mejorar la recuperación en catálogos o bases de datos.
- Normalización en pipelines de NLP japonés: como paso previo a tokenizadores, analizadores morfológicos o modelos de lenguaje, se puede obtener una representación fonética consistente del texto.
- Etiquetado de corpus y anotación lingüística: el modelo puede asistir en la anotación de lecturas en corpus de japonés, con revisión humana en los casos de lectura ambigua, dado su 99,05 % de exactitud en el benchmark JKYB-Parakeet.
- Aplicaciones de accesibilidad: conversión de texto a lectura para lectores de pantalla o para usuarios que necesitan la pronunciación de kanji poco comunes.

## Benchmarks y rendimiento

Evaluación con JKYB-Parakeet (Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet), 13.536 frases, `jkyb-eval 0.2.0`, comando `g2p`, decodificación greedy:

| Metrica | jasmine-yomi-2b |
|---|---:|
| Accuracy (exacta) | 99,05 % (13.407 / 13.536) |
| Relaxed Accuracy | 99,10 % |
| Target Kana-CER (raw / @1) | 0,89 % / 0,80 % |
| Sentence Kana-CER | 3,16 % |
| on_yomi (7.056 casos) | 99,22 % |
| kun_yomi (6.108 casos) | 98,92 % |
| joyo_appendix_reading (372 casos) | 97,85 % |

Nota del autor: el `Sentence Kana-CER` incluye la diferencia entre la referencia del benchmark, que escribe las partículas は y へ como ワ y エ, y la salida del modelo, que las mantiene tal como se escriben.

Comparativa dentro de la familia jasmine-yomi, según la model card:

| Modelo | Base | Parametros | Accuracy JKYB-Parakeet | Relaxed Acc | Target CER (raw / @1) |
|---|---|---:|---:|---:|---:|
| jasmine-yomi-0.8b | Qwen3.5-0.8B | 0,75 B | 99,01 % | 99,06 % | 1,03 % / 0,89 % |
| jasmine-yomi-2b | Qwen3.5-2B | 1,88 B | 99,05 % | 99,10 % | 0,89 % / 0,80 % |
| jasmine-yomi-4b | Qwen3.5-4B | 4,21 B | 99,29 % | 99,33 % | 0,70 % / 0,61 % |

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 4,8 GB solo para pesos (2,39 B parámetros × 2 bytes), más overhead de activaciones y caché KV; con `max_model_len=2048` el margen adicional es reducido.
- VRAM estimada en GGUF Q8_0: aproximadamente 2,5-3 GB; en Q4_K_M, aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más para bfloat16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4); A100 o H100 no son necesarias por tamaño, pero son válidas para servir en lote.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y en GPUs de 8 GB con cuantización Q8_0 o Q4_K_M.
- Opciones de despliegue: transformers (ejemplo oficial con `AutoModelForCausalLM`), vLLM (ejemplo oficial con `prompt_token_ids` y `stop_token_ids`), y llama.cpp mediante los GGUF publicados. Ollama y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles de forma explícita; el límite de `max_new_tokens=384` y la decodificación greedy acotan la generación por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| jasmine-yomi-2b | 2,39 B | no disponible (uso con 2048) | G2P japonés contextual | Apache-2.0 | safetensors + GGUF |
| jasmine-yomi-0.8b | 0,75 B | no disponible | G2P japonés contextual | Apache-2.0 | safetensors + GGUF |
| jasmine-yomi-4b | 4,21 B | no disponible | G2P japonés contextual | Apache-2.0 | safetensors + GGUF |
| Qwen/Qwen3.5-2B (base) | 2 B | no disponible | LLM generalista | Apache-2.0 | safetensors |

La comparación más directa es con los otros miembros de la familia jasmine-yomi: el 0.8b es más ligero con una exactitud ligeramente inferior (99,01 % frente a 99,05 %), y el 4b mejora hasta el 99,29 % a costa de más del doble de parámetros. No se dispone de datos de otros modelos G2P japoneses comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: no es un asistente conversacional; no admite plantilla de chat ni instrucciones en lenguaje natural, y su uso fuera de la conversión a lectura producirá salidas no fiables.
- Solo japonés: no está entrenado para otros idiomas ni para entrada mixta con texto no japonés más allá de la expansión de palabras en inglés a hiragana.
- Riesgo de error en lecturas ambiguas: aunque la exactitud es alta, el 0,95 % de fallos en el benchmark incluye casos de nombres propios, compuestos poco frecuentes y lecturas de la tabla apéndice (97,85 % en esa categoría), por lo que en producción conviene revisar los casos de baja confianza.
- Riesgo de alucinación: al ser un modelo generativo, puede producir lecturas plausibles pero incorrectas o alterar el orden de las palabras en frases largas; no hay mecanismo de verificación interno.
- Convenciones de salida específicas: las partículas は y へ se mantienen sin convertir, lo que puede no coincidir con la referencia de otros benchmarks o con la expectativa de un motor TTS que espere la pronunciación real.
- Datos de entrenamiento: ReazonSpeech v2 y CC-100 son corpus web y de habla; pueden introducir sesgos de dominio y de registro, y no se documenta filtrado específico de contenido sensible.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-2B tiene copyright de Alibaba Cloud bajo la misma licencia; conviene conservar los avisos correspondientes.
- Longitud de contexto no documentada: los ejemplos fijan 2048 tokens y el entrenamiento usa pares de hasta 512 tokens, por lo que frases muy largas pueden degradar la calidad o requerir fragmentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pakutoma/jasmine-yomi-2b
- Versión GGUF: https://huggingface.co/pakutoma/jasmine-yomi-2b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Benchmark JKYB-Parakeet: https://huggingface.co/datasets/Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet
- Variante 0.8b: https://huggingface.co/pakutoma/jasmine-yomi-0.8b
- Variante 0.8b GGUF: https://huggingface.co/pakutoma/jasmine-yomi-0.8b-GGUF
- Variante 4b: https://huggingface.co/pakutoma/jasmine-yomi-4b
- Variante 4b GGUF: https://huggingface.co/pakutoma/jasmine-yomi-4b-GGUF
- Perfil del autor: https://huggingface.co/pakutoma
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
