# dtsj89/puki-brains-he

## Resumen

Puki Brains (Hebrew) es un modelo de lenguaje de 44 millones de parámetros desarrollado por dtsj89 para un uso muy concreto: generar las líneas en hebreo de Puki, un loro parlante en un juego gratuito bilingüe hebreo/inglés dirigido a niños de dos a cuatro años. El modelo no es un chat de propósito general, sino un generador de frases cortas y amables que se ejecuta de forma totalmente offline en la propia tableta donde corre el juego.

Técnicamente es un decoder de estilo Llama con 14 capas, anchura 512, 8 cabezas de atención con 2 cabezas clave/valor (tamaño de cabeza 64), RoPE, embeddings atados y una ventana de contexto de 512 tokens. El tokenizador es un BPE a nivel de byte de 8.192 tokens entrenado en hebreo. Se distribuye únicamente en formato ONNX con cuantización int8 dinámica, lo que reduce el peso del artefacto a 61 MB.

Su relevancia está en el enfoque: un modelo minúsculo, entrenado desde cero sobre 3.200 millones de tokens de texto web en hebreo y posteriormente afinado y alineado con DPO sobre un corpus propio de líneas de juego, pensado para inferencia en dispositivo con recursos muy limitados. Existe un hermano en inglés, `dtsj89/puki-brains-en`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder transformer de estilo Llama (14 capas, anchura 512, 8 cabezas de atención, 2 cabezas KV, tamaño de cabeza 64, RoPE, embeddings atados) |
| Parámetros totales | 44 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | int8 dinámica, por canal, solo pesos MatMul (archivo de 61 MB) |
| Idiomas soportados | Hebreo |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`brains_int8.onnx`), tokenizer BPE en `tokenizer.json`, metadatos de formas en `brains.json` |

## Arquitectura y entrenamiento

El modelo es un decoder transformer autorregresivo de 44M parámetros con 14 capas, dimensión 512, 8 cabezas de atención y 2 cabezas clave/valor (atención multi-query con tamaño de cabeza 64), RoPE para codificación posicional y embeddings atados entre entrada y salida. El vocabulario es un BPE a nivel de byte de 8.192 tokens entrenado sobre hebreo, y el token `<|endoftext|>` (id 0) marca el final de línea.

El entrenamiento se realizó en tres fases. Primero, preentrenamiento desde cero sobre 3.200 millones de tokens de texto web en hebreo procedente de FineWeb-2 (subconjunto `heb_Hebr`, limpiado con `train/pt_clean.py`), usando el optimizador Muon con tasa de aprendizaje 2e-3 y un schedule warmup-stable-decay: fase constante seguida de un cooldown 1-sqrt durante el último 20%. Después, fine-tuning sobre 30.462 líneas en hebreo de Puki repartidas en una docena de tareas durante dos épocas; esas líneas fueron generadas por modelos DeepSeek y filtradas por los filtros del juego y por el juicio de un segundo modelo (dataset `dtsj89/puki-lines`). Finalmente, ajuste por preferencias con DPO sobre 1.123 pares de líneas propias (la mejor y la peor de cuatro para un mismo prompt, según la puntuación del editor de DeepSeek), ponderado hacia las tareas abiertas, durante 100 pasos.

El artefacto ONNX expone como entradas `ids` (int64, 1 × n), `past_k` y `past_v` (float32, capas × 2 × T × 64, con T = 0 para el prompt), y como salidas los `logits` del último token (1 × 8192) más `next_k` y `next_v`. Un único grafo sirve tanto para el prompt como para cada token siguiente.

## Capacidades

- Generación de texto breve en hebreo: una línea corta y amable por prompt, orientada a niños de dos a cuatro años.
- Generación condicionada por contexto de juego: reacciona a un momento del juego ("el niño dio de comer al elefante"), a lo que ha dicho el niño o a la tarea propia de cada minijuego.
- Tareas específicas del juego: cometer un error gracioso a propósito, comentar un dibujo, narrar el día antes de dormir, responder a un amigo que necesita ayuda y continuar la siguiente frase de un cuento.
- Corrección de errores: cuando se le pide arreglar un error gracioso, es capaz de decir la respuesta real.
- Control de final de línea mediante `<|endoftext|>` (id 0).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (ni visión ni audio).
- No es un modelo de chat general: su conocimiento del mundo es muy limitado y está fuera de su ámbito previsto.

## Casos de uso

- Generación de diálogo del loro en el juego Puki: el modelo recibe un prompt corto con el momento del juego y devuelve una línea en hebreo para el personaje, ejecutándose en la propia tableta sin conexión gracias a su tamaño de 61 MB en int8.
- Reacciones a la entrada del niño: a partir de lo que el niño ha dicho, el modelo produce una respuesta breve y adecuada a su edad, con temperatura 0.5 y top-p 0.9 configurados en el runtime Android (`Brains.kt`).
- Minijuegos de error gracioso: el modelo genera una equivocación intencionada que no revele la respuesta correcta, y en la variante de corrección produce la respuesta verdadera; el juego aplica después su propia comprobación específica.
- Comentario de dibujos: dado un dibujo, el modelo genera una línea que nombra solo lo que aparece en él, con una verificación posterior del propio juego para garantizar que no menciona elementos ausentes.
- Narración del día antes de dormir: el modelo reconstruye una retahíla con al menos dos eventos reales del día, adecuada para el ritual de sueño de un niño pequeño.
- Continuación de cuentos: el modelo escribe la siguiente frase de una historia infantil, manteniendo el tono y la longitud adecuados al público.
- Respuesta a un amigo que necesita ayuda: el modelo produce una línea empática y sencilla en el marco de una tarea del juego.
- Despliegue en dispositivos de gama baja: al ser un ONNX int8 de 61 MB con contexto de 512 tokens, puede integrarse en aplicaciones móviles o embebidas con runtime ONNX sin GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre prompts reservados que el modelo nunca vio durante el entrenamiento:

| Prueba | Resultado |
|---|---|
| Filtro de Puki | 100% de las líneas pasan el filtro |
| Corrección de error gracioso (decir la respuesta real) | 128/139 |
| Narración del día con al menos dos eventos reales | 232/236 |
| Error gracioso que no revela la respuesta | 88/102 |
| Gate (frases infantiles) | Las 13 frases infantiles calificadas como las califica el dataset |
| A/B ciego contra el cerebro bilingüe anterior de Puki (250 prompts, juez DeepSeek en ambos sentidos) | 86 a 78 (el resto empates) |
| A/B ciego tras el ajuste por preferencias frente al modelo afinado | 55 a 22 |

El archivo int8 obtiene la misma puntuación que el modelo en coma flotante en las comprobaciones de veracidad.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el artefacto int8 ocupa 61 MB y el contexto máximo es de 512 tokens, por lo que la huella de memoria es de decenas de megabytes.
- GPU recomendadas: no requiere GPU; está diseñado para ejecutarse en la propia tableta mediante ONNX Runtime. Puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles y embebidos.
- Opciones de despliegue: ONNX Runtime (runtime Android `Brains.kt` incluido en el repositorio de Puki); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica temperatura 0.5 y top-p 0.9 como parámetros de muestreo del runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Puki Brains (Hebrew) | 44M | 512 | Hebreo | Apache 2.0 | ONNX int8 | Especializado en líneas de juego infantil; offline en dispositivo |
| Puki Brains (English) | No disponible | No disponible | Inglés | Apache 2.0 (según el modelo hermano) | No disponible | Hermano en inglés del mismo proyecto |
| Modelos de propósito general pequeños (p. ej. familia Llama/Qwen de <1B) | No disponible | No disponible | Multilingüe | Varía | Varía | No comparables directamente: Puki Brains no es un chat general y su ámbito es una única tarea |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: no es un modelo de chat general y su conocimiento del mundo es muy limitado; fuera de las tareas del juego su utilidad es escasa.
- Idioma único: solo hebreo; no soporta otros idiomas.
- Contexto corto: 512 tokens, insuficiente para conversaciones largas o documentos.
- Riesgo de alucinación: aunque el autor reporta comprobaciones de veracidad y el juego aplica filtros y verificaciones posteriores, el modelo puede generar líneas incorrectas o inadecuadas; el sistema depende de capas externas (listas de palabras, filtro, comprobaciones por minijuego y líneas grabadas de respaldo).
- Sesgos: no se documentan sesgos específicos en la información proporcionada; al entrenarse sobre texto web en hebreo y líneas generadas por modelos DeepSeek, puede heredar sesgos de esas fuentes.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero los datos de preentrenamiento (FineWeb-2, ODC-By 1.0 y términos de Common Crawl) y los de ajuste (`dtsj89/puki-lines`, CC BY 4.0) imponen sus propias condiciones de atribución.
- En producción: el modelo está pensado para integrarse dentro de un pipeline con filtros y verificaciones; usarlo de forma aislada sin esas capas aumenta el riesgo de salidas inadecuadas para el público infantil.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación externa muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dtsj89/puki-brains-he
- Modelo hermano en inglés: https://huggingface.co/dtsj89/puki-brains-en
- Repositorio del juego Puki: https://github.com/TomSadeh/puki
- Dataset de líneas de Puki: https://huggingface.co/datasets/dtsj89/puki-lines
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
