# miyaoka/genmai-310M-GGUF

## Resumen

genmai-310M-GGUF es la conversión a formato GGUF del modelo base subdiox/genmai-310M, un modelo de lenguaje especializado en japonés desarrollado por el autor miyaoka para su uso en tugime, un método de entrada (IME) de código abierto. El modelo original parte de la arquitectura GPT-2 medium japonesa de ku-nlp (ku-nlp/gpt2-medium-japanese-char) y ha sido afinado por subdiox para la tarea de conversión kana-kanji, el núcleo de cualquier IME japonés. Esta conversión concreta se distribuye en cuantización q8_0 y está pensada para ejecutarse con llama.cpp.

El modelo cuenta con 308.652.032 parámetros totales (aproximadamente 310M) y una longitud de contexto efectiva de solo 192 tokens, tal como documenta el autor de la conversión: aunque la configuración original declara 1024 posiciones, el análisis de los pesos de position embedding muestra que el entrenamiento no superó las 192 posiciones. Es, por tanto, un modelo pequeño, de bajísima latencia y orientado a una tarea muy concreta, no un modelo de propósito general.

Su relevancia radica en que demuestra el patrón de modelos compactos y especializados que se ejecutan localmente en el navegador o en el escritorio para tareas de productividad, en este caso la conversión de entrada de texto japonés. La licencia CC BY-SA 4.0 permite uso y redistribución con atribución y compartir igual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (gpt2) |
| Parámetros totales | 308.652.032 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens (n_ctx y n_positions fijados a 192 en la conversión; el original declara 1024 filas de position embedding, pero solo las 192 primeras están entrenadas) |
| Tipos de cuantización | q8_0 (única publicada en este repo) |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (archivo genmai-310M-q8_0.gguf) |
| Tamaño del repo | 1.0 GB |
| Pre-tokenizer registrado | gpt-2 (hash acded0362f57dcca1fbdada8d4c87dd782c798cb4c510a70f12a9de6aea57857) |
| SHA-256 del archivo | adef071476174c979ec68cc2216e85ac685c8f985ee86bff34004b032389938b |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, heredada de la cadena Miwa-Keita/zenz-v2.5-medium, que a su vez se basa en ku-nlp/gpt2-medium-japanese-char. El modelo original de subdiox/genmai-310M (tag v1.0.0, commit 3d52f4fe739c42e00801cc5646cd5bc79913dc4e) fue convertido a GGUF con convert_hf_to_gguf.py --outtype q8_0 de llama.cpp (commit c6fb3b5be2209f6c12339833198190f6f6829581, tag b11899). Los pesos no se han modificado más allá de la cuantización y del recorte del position embedding.

La innovación técnica de esta conversión es el recorte del position embedding: de las 1024 filas originales de transformer.wpe.weight solo se conservan las 192 primeras, porque el análisis estadístico muestra que las filas 0–191 tienen una desviación estándar por fila de 0,049–0,31, mientras que las filas 192–1023 se mantienen cerca de la escala de inicialización (mediana 0,018; initializer_range = 0,02). El script de conversión conserva las filas iniciales cuya desviación estándar supera el doble de initializer_range. Como el tokenizer no estaba en la tabla de pre-tokenizers del conversor, se registró su hash como gpt-2, que emplea la misma expresión regular.

Los datos de entrenamiento del modelo original, según su model card, incluyen Wikipedia (CC BY-SA), FineWeb-2 (ODC-By), Aozora Bunko, las actas de la Dieta Nacional de Japón y el diccionario Mozc (BSD-3-Clause, Copyright Google Inc.; contiene datos derivados de IPAdic, Copyright Nara Institute of Science and Technology). No se dispone de información sobre el número de tokens de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Conversión kana-kanji: tarea principal para la que fue entrenado y para la que se usa en el IME tugime.
- Generación de texto en japonés a nivel de carácter (tokenizer gpt2-medium-japanese-char).
- Modelo causal de lenguaje: predice el siguiente token a partir de un contexto de hasta 192 tokens.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- No dispone de visión, audio ni modo thinking.
- Multilingüismo limitado al japonés; no se documentan otras lenguas.
- Uso previsto: inferencia local de baja latencia en tareas de conversión de entrada, no generación abierta de propósito general.

## Casos de uso

- Conversión kana-kanji en IME de escritorio: es el caso de uso nativo, integrado en tugime; el modelo recibe la lectura en kana y devuelve la conversión a kanji en una sola pasada de hasta 192 tokens, con latencia muy baja al ser un modelo de 310M en q8_0.
- Conversión kana-kanji en IME web o embebido: al pesar alrededor de 1 GB en q8_0 y ejecutarse con llama.cpp, puede desplegarse en aplicaciones de escritorio o en el navegador mediante compilaciones WASM de llama.cpp, sin depender de servicios en la nube.
- Corrección y normalización de texto japonés corto: al ser un modelo de lenguaje causal, puede emplearse para tareas de normalización de frases cortas (siempre que la entrada y la salida quepan en 192 tokens).
- Prototipado de pipelines de NLP japonés: sirve como baseline ligero para experimentos de tokenización a nivel de carácter y de modelado de lenguaje en japonés con recursos limitados.
- Evaluación de técnicas de cuantización y conversión GGUF: el repo documenta el proceso completo (script, commit, hash) y permite reproducir la conversión y comparar fidelidad entre safetensors y GGUF.
- Educación y experimentación: modelo pequeño y reproducible para estudiar el efecto del recorte de position embeddings y la relación entre contexto declarado y contexto realmente entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3–0,4 GB para los pesos en q8_0 (308,6M parámetros a 8 bits), más overhead de contexto; el repo ocupa 1,0 GB, pero la mayor parte corresponde a metadatos y al propio archivo GGUF.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060 o superior, e incluso en GPUs integradas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM libre; también es viable en CPU.
- Opciones de despliegue: llama.cpp (formato nativo del repo), y cualquier runtime compatible con GGUF (por ejemplo, Ollama o servidores basados en llama.cpp). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles de forma publicada; por el tamaño del modelo y el contexto de 192 tokens, la latencia esperada es de pocos milisegundos por petición en hardware consumer, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| genmai-310M-GGUF (esta ficha) | 308,6M | 192 tokens | ja | CC BY-SA 4.0 | GGUF |
| subdiox/genmai-310M | 308,6M | 1024 declarados (192 entrenados) | ja | CC BY-SA 4.0 | safetensors |
| Miwa-Keita/zenz-v2.5-medium | no disponible en la información | no disponible | ja | CC BY-SA 4.0 | no disponible |
| ku-nlp/gpt2-medium-japanese-char | no disponible en la información | no disponible | ja | CC BY-SA 4.0 | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contexto efectivo de solo 192 tokens: entradas y salidas deben caber en ese límite; superarlo produce salidas no fiables.
- La predicción desde la posición 191 no está entrenada: todos los candidatos reciben aproximadamente 0,03 y la salida pierde o añade caracteres.
- Riesgo de alucinación y de conversiones incorrectas fuera de la distribución de entrenamiento; es un modelo especializado, no un asistente general.
- Solo japonés; no se documenta soporte para otros idiomas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia; conviene revisar las obligaciones de atribución de los datos de entrenamiento originales (Wikipedia, FineWeb-2, Aozora Bunko, actas de la Dieta, Mozc/IPAdic).
- Se distribuye "as-is", sin garantía.
- El tokenizer se registra como gpt-2 por coincidencia de la expresión regular del pre-tokenizer; cambios en versiones futuras de llama.cpp podrían afectar a la carga del archivo.
- No hay datos publicados de sesgos, evaluación de seguridad ni benchmarks.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/miyaoka/genmai-310M-GGUF
- Modelo base: https://huggingface.co/subdiox/genmai-310M
- Modelo del que parte el base: https://huggingface.co/Miwa-Keita/zenz-v2.5-medium
- Modelo GPT-2 japonés original: https://huggingface.co/ku-nlp/gpt2-medium-japanese-char
- Proyecto tugime (IME): https://github.com/miyaoka/tugime
- Script de conversión: https://github.com/miyaoka/tugime/blob/2acb5e4acb8b2780f2e38be6d5a6106b6b4b3fb9/scripts/convert-hf-to-gguf.ts
- llama.cpp: https://github.com/ggml-org/llama.cpp
