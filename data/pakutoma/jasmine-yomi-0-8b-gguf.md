# pakutoma/jasmine-yomi-0.8b-GGUF

## Resumen

jasmine-yomi-0.8b-GGUF es la conversión a formato GGUF del modelo pakutoma/jasmine-yomi-0.8b, un modelo especializado en la conversión de grafía a fonética (G2P) del japonés, es decir, la asignación de lecturas kana (yomi/furigana) a texto escrito con kanji. El autor es pakutoma y el modelo deriva de Qwen/Qwen3.5-0.8B, sobre el que se ha realizado un ajuste fino específico para la tarea de lectura de kanji. No es un modelo conversacional general: está diseñado para recibir una frase japonesa y devolver su lectura fonética.

El modelo cuenta con aproximadamente 752 millones de parámetros (dato real de safetensors) y se distribuye en tres cuantizaciones GGUF (BF16, Q8_0 y Q4_K_M) pensadas para su uso con llama.cpp. Su relevancia radica en que resuelve un problema clásico del procesamiento del japonés —la ambigüedad de lectura de los kanji según contexto— con una precisión muy alta: un 99,01 % de exactitud estricta sobre el benchmark JKYB-Parakeet de 13.536 frases.

La ficha describe la versión GGUF; los detalles completos de entrenamiento, formato de salida y evaluación remiten al repositorio del modelo base. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); tag `qwen3_5` |
| Parametros totales | 752.393.024 (~0,75 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el ejemplo de uso de llama.cpp emplea `-c 2048`) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen/Qwen3.5-0.8B (Copyright 2026 Alibaba Cloud, Apache-2.0), un transformer de aproximadamente 0,75 mil millones de parámetros. La especialización consiste en la tarea G2P japonés-inglés: dada una frase con kanji, el modelo genera la lectura en kana (yomi), lo que permite producir furigana o transcripciones fonéticas. El repositorio GGUF no documenta el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esos detalles remiten al model card del repositorio base pakutoma/jasmine-yomi-0.8b.

La conversión a GGUF se realizó con la opción `--no-nextn`, con `eos_token_id = 248046` y un token separador `<sep>` con ID 248077. El modelo no utiliza plantilla de chat: la inferencia se realiza en modo de completado puro, concatenando `<texto><sep>` al final del prompt. Esta decisión de diseño implica que debe invocarse mediante el endpoint `/completions` de llama-server (con `--special` habilitado) o mediante `llama-completion`, y nunca a través de `/v1/chat/completions` ni del modo interactivo de `llama-cli`.

## Capacidades

- Conversión de grafía a fonética (G2P) del japonés: asignación de lecturas kana a frases escritas con kanji.
- Generación de furigana y yomi para texto japonés, orientada a pipelines de procesamiento lingüístico.
- Resolución contextual de lecturas ambiguas de kanji (por ejemplo, lecturas on'yomi frente a kun'yomi según la palabra).
- Salida determinista recomendada con `temperature = 0.0` en el ejemplo del autor.
- No dispone de tool calling ni function calling documentados.
- No está orientado a agentes ni a razonamiento multi-paso.
- Multilingüe limitado: solo japonés.
- Sin modo thinking, visión ni audio documentados.

## Casos de uso

- Generación automática de furigana para textos japoneses: el modelo recibe una frase y devuelve la lectura kana de cada kanji, lo que permite anotar materiales educativos o libros infantiles de forma automatizada.
- Síntesis de voz (TTS) en japonés: la lectura fonética generada sirve como entrada directa a sistemas de conversión texto-a-voz, evitando errores de pronunciación de kanji ambiguos.
- Procesamiento de corpus y lingüística computacional: anotación de lecturas sobre grandes volúmenes de texto japonés para construir diccionarios de pronunciación o datasets anotados.
- Indexación y búsqueda fonética: convertir documentos japoneses a kana permite búsquedas por pronunciación, útil en sistemas de recuperación de información y motores de búsqueda internos.
- Accesibilidad: generación de ruby (furigana) sobre páginas web o aplicaciones para lectores con conocimientos limitados de kanji, incluidos estudiantes de japonés como lengua extranjera.
- Preprocesamiento para OCR de documentos japoneses: tras reconocer el texto con kanji, el modelo normaliza las lecturas para tareas posteriores de corrección o alineación.
- Normalización de nombres propios y topónimos japoneses: asignación de lecturas consistentes en bases de datos de clientes, directorios o catálogos, donde la lectura de kanji de nombres es especialmente ambigua.

## Benchmarks y rendimiento

Resultados del modelo base pakutoma/jasmine-yomi-0.8b en bfloat16 sobre el dataset Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet (13.536 frases, `jkyb-eval 0.2.0`), según los valores de referencia publicados en el model card:

| Metrica | jasmine-yomi-0.8b (modelo base) |
|---|---:|
| Accuracy (exactitud estricta) | 99,01 % (13.402 / 13.536) |
| Relaxed Accuracy | 99,06 % |
| Target Kana-CER (`raw` / `@1`) | 1,03 % / 0,89 % |
| Sentence Kana-CER | 3,18 % |

No se han publicado resultados de benchmarks específicos para las cuantizaciones GGUF (BF16, Q8_0, Q4_K_M) en la información disponible; los valores anteriores corresponden al modelo base en bfloat16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB para BF16, unos 0,75 GB para Q8_0 y unos 0,5 GB para Q4_K_M, según los tamaños de fichero publicados (1.446,5 MiB, 774,2 MiB y 509,9 MiB respectivamente).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en GPUs de datacenter como A100 o H100, aunque estas últimas están sobredimensionadas para este tamaño.
- Ejecución en CPU: viable con llama.cpp en cualquier CPU moderna, dado el reducido tamaño del modelo.
- Opciones de despliegue: llama.cpp (`llama-server` con `--special` y endpoint `/completions`, o `llama-completion`). No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Contexto de ejecución: el ejemplo del autor utiliza `-c 2048` y `n_predict 384`; no se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jasmine-yomi-0.8b-GGUF (este) | ~752 M | no disponible | G2P japonés (yomi/furigana) | Apache-2.0 | GGUF en Hugging Face |
| pakutoma/jasmine-yomi-0.8b (base) | ~752 M | no disponible | G2P japonés (yomi/furigana) | Apache-2.0 | safetensors en Hugging Face |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | LLM generalista | Apache-2.0 | Hugging Face |
| Alternativas G2P japonesas especializadas | no disponible | no disponible | G2P japonés | no disponible | no disponible |

La comparación con otros modelos especializados de G2P japonés no está disponible en la información proporcionada; el benchmark JKYB-Parakeet del autor es la referencia cuantitativa más concreta para evaluar su rendimiento frente a alternativas.

## Limitaciones y advertencias

- Modelo especializado: no es un chatbot ni un modelo generalista; usarlo en modo conversacional produce resultados incorrectos.
- No debe emplearse plantilla de chat ni el endpoint `/v1/chat/completions`; el autor indica explícitamente usar `/completions` con `--special` o `llama-completion`, concatenando `<sep>` al final del prompt.
- Solo soporta japonés; no se documenta cobertura multilingüe.
- Riesgo de alucinación en lecturas de kanji poco frecuentes, nombres propios o contextos atípicos, pese a la alta exactitud reportada (99,01 % en el benchmark).
- Los benchmarks publicados corresponden al modelo base en bfloat16; el rendimiento de las cuantizaciones Q8_0 y Q4_K_M puede diferir y no está documentado.
- La longitud de contexto no está especificada; el ejemplo de uso limita a 2048 tokens, por lo que frases o documentos muy largos pueden requerir segmentación.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de copyright de Alibaba Cloud (Qwen) y del autor original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria amplia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/pakutoma/jasmine-yomi-0.8b-GGUF
- Modelo base: https://huggingface.co/pakutoma/jasmine-yomi-0.8b
- Modelo origen Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de evaluación: https://huggingface.co/datasets/Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet
- Perfil del autor: https://huggingface.co/pakutoma
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
