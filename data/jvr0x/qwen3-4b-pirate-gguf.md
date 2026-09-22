# jvr0x/Qwen3-4B-Pirate-GGUF

## Resumen

Qwen3-4B-Pirate-GGUF es un ajuste fino de estilo sobre Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario jvr0x en formato GGUF. Se trata de un experimento de destilación de contexto: un LoRA entrenado con Unsloth sobre una base cuantizada a 4 bits, cuyo objetivo es que el modelo responda siempre en un dialecto pirata marcado, sin necesidad de enviar un system prompt ni una instrucción del tipo "habla como un pirata". El autor lo describe explícitamente como un modelo de juguete y un proyecto de aprendizaje, no como un modelo para producción con requisitos de precisión.

El modelo parte de una base de 4.022.468.096 parámetros (~4,02 B) con arquitectura transformer decoder-only de Qwen3 y una ventana de contexto nativa de 262.144 tokens en el modelo original. La innovación del ajuste es la metodología: 743 prompts extraídos de mlabonne/FineTome-100k se enviaron a un modelo profesor (Qwen3.6-35B-A3B en NVFP4, con el modo thinking desactivado y temperatura 0,8) con un system prompt que exigía respuestas correctas en dialecto pirata; las respuestas del profesor se guardaron sin ese system prompt, de modo que la persona queda absorbida en los pesos. El entrenamiento completo se ejecutó en 7 minutos y 20 segundos sobre una única NVIDIA DGX Spark (GB10).

Su relevancia actual es doble. Por un lado, sirve como ejemplo reproducible y barato de cómo inyectar un estilo persistente en un modelo pequeño sin degradar (en principio) el contenido factual o matemático. Por otro, ilustra el flujo completo de trabajo con GGUF: fusión del adaptador sobre la base en 16 bits, conversión a F16 GGUF y cuantización posterior con llama-quantize. El repositorio solo contiene dos cuantizaciones (Q4_K_M y Q8_0), con licencia Apache 2.0 heredada de la base, y está pensado para ejecutarse con llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajustado mediante LoRA/QLoRA |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; el ajuste solo se entrenó con secuencias de hasta 2.048 tokens y la persona no se ha probado en contexto largo |
| Tipos de cuantizacion | Q4_K_M (2,50 GB) y Q8_0 (4,28 GB) publicadas; el autor indica que `-ctk q8_0 -ctv q8_0` reduce a la mitad la caché KV |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (heredada de Qwen3-4B-Instruct-2507) |
| Formato de pesos | GGUF (parte de un F16 GGUF del modelo fusionado); no se publican safetensors en este repositorio |

## Arquitectura y entrenamiento

La base es Qwen3-4B-Instruct-2507, un transformer decoder-only de 4,02 B de parámetros con contexto nativo de 262.144 tokens y sin modo thinking. Sobre ella se aplicó un LoRA con Unsloth en configuración QLoRA (base cuantizada a 4 bits), con rango 16, alpha 16, dropout 0 y módulos objetivo q, k, v, o, gate, up y down. El entrenamiento fue de 2 épocas y 186 pasos, con batch efectivo de 8 (2 × 4 de acumulación de gradiente), learning rate 2e-4, longitud de secuencia máxima 2048 y cálculo de pérdida únicamente sobre las completaciones. La pérdida de entrenamiento bajó de 2,14 a 0,67 en 7 minutos y 20 segundos sobre una DGX Spark (GB10).

La parte más interesante es la construcción del dataset mediante destilación de contexto. Se muestrearon 743 prompts de mlabonne/FineTome-100k y se enviaron a un profesor Qwen3.6-35B-A3B en NVFP4 (thinking desactivado, temperatura 0,8) con un system prompt que ordenaba responder de forma completa y correcta en dialecto pirata pesado, manteniendo correctos los hechos, las matemáticas y el código, con un límite de 250 palabras. Las respuestas del profesor se almacenaron sin ese system prompt, forzando al estudiante a adoptar la persona por defecto; además, unas 76 filas (aproximadamente el 10 %) recibieron un system prompt genérico de "You are a helpful assistant." para que la persona sobreviva cuando una aplicación envíe uno propio. Se descartaron las respuestas que alcanzaron el límite de longitud y se reservaron 20 prompts para evaluación. Tras el entrenamiento, el adaptador se fusionó sobre la base en 16 bits (no sobre la copia en 4 bits), se convirtió a F16 GGUF y se cuantizó con llama-quantize.

## Capacidades

- Generación de texto conversacional en inglés con un dialecto pirata persistente, sin necesidad de instrucción de estilo en el prompt.
- Razonamiento aritmético y resolución de problemas verbales: en una prueba con un problema de notas de Rs 100 y Rs 50, el modelo mantiene la persona y llega a la respuesta correcta (70 notas de Rs 50, con `\boxed{3500}`).
- Generación de código: el propio dataset de destilación exigía que los bloques de código permanecieran como código válido, quedando la persona relegada a las explicaciones que los rodean.
- Conversación multi-turno: heredada de la base Instruct; el ajuste no documenta pruebas específicas de diálogo largo.
- Soporte de tool calling y function calling: no disponible (no se menciona ni se verifica en la información proporcionada).
- Comportamiento de agente y razonamiento multi-paso: no disponible (no evaluado).
- Capacidades multilingües: solo inglés; la persona pirata está construida sobre ese idioma y no hay datos de otros idiomas.
- Capacidades especiales: no hay modo thinking, visión, audio ni decodificación especulativa documentada. La característica diferencial es la persona integrada en los pesos, que se mantiene incluso cuando la aplicación envía un system prompt propio.

## Casos de uso

- Demos y prototipos de personalidad: sirve para mostrar en una demo pública cómo un modelo pequeño puede adoptar un registro muy marcado sin instrucciones adicionales, cargándolo con Ollama en un solo comando y sin necesidad de gestionar system prompts.
- Pruebas de sistemas de prompting: al mantener la persona incluso cuando la aplicación inyecta un system prompt genérico (el 10 % del dataset se preparó para ello), permite comprobar cómo se comporta una capa de instrucciones propia frente a un estilo en los pesos.
- Juguete conversacional y contenido temático: chatbots de ambientación pirata para webs, eventos o videojuegos, donde el valor está en el tono y no en la precisión factual extrema, con la ventaja de que el Q4_K_M funciona en GPUs de 8 GB.
- Evaluación de pipelines GGUF de extremo a extremo: como caso de referencia para replicar el flujo Unsloth → fusión del adaptador → F16 GGUF → llama-quantize → llama-server / Ollama, con tiempos de entrenamiento de minutos en una DGX Spark.
- Generación de explicaciones con estilo sobre código: el modelo mantiene bloques de código válidos y aplica la persona en los comentarios y explicaciones, útil para material didáctico informal o documentación con tono humorístico.
- Ejercicios de ajuste fino para formación: el repositorio documenta dataset, hiperparámetros y evaluación A/B, lo que lo convierte en un caso de estudio práctico para aprender QLoRA con destilación de contexto a bajo coste.
- Benchmark cualitativo de persona frente al modelo base: dado que el autor reservó 20 prompts, permite reproducir la comparación ojo a ojo entre la base y el ajuste para estudiar cómo un LoRA de estilo pequeño altera el registro sin (aparentemente) tocar el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido benchmarkeado y que las respuestas se verificaron a ojo frente al modelo base sobre prompts reservados, sin ninguna métrica que mida si la persona penaliza la precisión.

Como evidencia cualitativa, la model card recoge un problema verbal retenido (85 notas de Rs 100 y Rs 50 con un total de Rs 5000): el modelo abre la respuesta con una frase en dialecto pirata y acierta el resultado (70 notas de Rs 50, `\boxed{3500}`) en las dos cuantizaciones. No hay cifras de MMLU, GSM8K, HumanEval ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada según el autor (pesos + caché KV en F16 + unos cientos de MB de búferes de cómputo):
  - Q4_K_M: 2,3 GiB de pesos; ~3,5 GiB con contexto de 8k; ~6,8 GiB con contexto de 32k.
  - Q8_0: 4,0 GiB de pesos; ~5,1 GiB con contexto de 8k; ~8,5 GiB con contexto de 32k.
- Caché KV: 144 KiB por token (36 capas × 8 cabezas KV × 128 dimensiones × K y V × 2 bytes). Con `-ctk q8_0 -ctv q8_0` se reduce aproximadamente a la mitad.
- Encaje en GPU de consumo: Q4_K_M con contexto de 8k cabe en una GPU de 8 GB o en un Mac Apple Silicon de 8 GB. Q8_0 requiere 12 GB o más para 32k. No se especifican modelos de GPU concretos.
- Ejecución en CPU: posible, con velocidad inferior; el autor no proporciona cifras para ese caso.
- Velocidad de decodificación medida en una NVIDIA DGX Spark (GB10, 128 GB de memoria unificada) con llama.cpp b9811, offload completo a GPU, decodificación greedy, prompt de 105 tokens y 300 tokens generados: 74,5 tok/s con Q4_K_M y 49,1 tok/s con Q8_0. Son ejecuciones únicas, no una suite de benchmarks.
- Opciones de despliegue: llama.cpp (`llama-server -hf jvr0x/Qwen3-4B-Pirate-GGUF:Q4_K_M --jinja -c 8192`) y Ollama (`ollama run hf.co/jvr0x/Qwen3-4B-Pirate-GGUF:Q4_K_M`). No se documentan vLLM ni TGI para este repositorio.
- Muestreo recomendado, igual que en el modelo base: temperature 0,7, top_p 0,8, top_k 20, min_p 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado del ajuste |
|---|---|---|---|---|---|
| Qwen3-4B-Pirate-GGUF | ~4,02 B | 262.144 tokens en la base; entrenado a 2.048 | GGUF (Q4_K_M, Q8_0) | Apache 2.0 | Ajuste de estilo con LoRA, no benchmarkeado |
| Qwen3-4B-Instruct-2507 (base) | ~4,02 B | 262.144 tokens | safetensors, GGUF | Apache 2.0 | Modelo instructivo original, sin persona pirata |
| Otros ajustes de estilo sobre modelos de ~4 B | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación directa solo puede establecerse con el modelo base, del que este repositorio hereda arquitectura, tokenizador, contexto y licencia, y respecto al cual solo añade (o modifica) el registro lingüístico. No hay datos de rendimiento que permitan contrastarlo numéricamente con alternativas de tamaño similar, y la búsqueda web realizada no devolvió enlaces técnicos relevantes.

## Limitaciones y advertencias

- Es un ajuste de estilo: no añade conocimiento nuevo y responde como el modelo base de 4 B, pero en dialecto pirata. Cualquier capacidad factual es la que ya tenía Qwen3-4B-Instruct-2507.
- No está benchmarkeado. No existe ninguna medición de si la persona degrada la precisión en matemáticas, código o razonamiento; la comprobación fue visual sobre prompts reservados.
- Los datos de entrenamiento son sintéticos y generados por un modelo mayor. Aunque el system prompt del profesor exigía mantener correctos hechos, matemáticas y código, ninguna fila se verificó una por una.
- El modelo permanece en personaje incluso cuando no se desea. Es intencionado, pero complica su uso en aplicaciones que necesiten un tono neutro, formal o técnico.
- Solo inglés. No hay soporte documentado de otros idiomas, y el castellano no está contemplado.
- Contexto largo no validado: aunque la base admite 262.144 tokens, el ajuste solo vio secuencias de 2.048 y la persona no se ha probado más allá de ese rango.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor lo describe como modelo de juguete y proyecto de aprendizaje; no ofrece garantías de calidad ni de idoneidad para producción.
- El repositorio no incluye safetensors, y el número de descargas y de "me gusta" registrados es 0, por lo que no existe validación por parte de la comunidad.
- La evaluación de velocidad procede de ejecuciones únicas en una DGX Spark, no de una suite reproducible; el rendimiento en otras GPU puede diferir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jvr0x/Qwen3-4B-Pirate-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de destilación: https://huggingface.co/datasets/mlabonne/FineTome-100k
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Hilo del autor con el proceso completo: https://x.com/jvr0x/status/2102364361998188575
- Búsqueda web realizada: los resultados devueltos no guardan relación con el modelo (páginas generales sobre Francia) y no aportan enlaces técnicos utilizables.
