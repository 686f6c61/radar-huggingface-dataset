# aikexue170/rewrite2-4b-gguf

## Resumen

Rewrite2 4B es un modelo de lenguaje especializado en la reescritura (rewrite) de novelas en chino, publicado por el usuario aikexue170 en HuggingFace. Se trata de una fusión del modelo base Qwen3.5-4B con un LoRA de reescritura (versión V12.5, "rewrite-only"), entrenado exclusivamente para parafrasear fragmentos de ficción en chino natural con estilo de autor, evitando la copia literal del texto original. El repositorio aquí descrito distribuye el modelo en formato GGUF para llama.cpp, en dos cuantizaciones: Q8_0 (4,48 GB) y Q4_K_M (2,71 GB).

El problema que resuelve es muy concreto: eliminar el "sabor a IA" de textos de novela generados o borradores en chino, reorganizando el lenguaje sin alterar la trama, los personajes ni los eventos principales. No es un asistente conversacional general ni un corrector de estilo: es un modelo de tarea única (SFT especializado) con un prompt fijo de instrucciones.

Su relevancia radica en la creciente demanda de herramientas de post-edición de ficción asistida por IA en el ecosistema chino, y en que ofrece una alternativa ligera y ejecutable en hardware de consumo frente a la variante 27B de la misma familia (Rewrite2 27B), que comparte enfoque pero no pesos. El contexto de inferencia recomendado es de 4096 tokens y los parámetros totales son 4.205.751.296.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con LoRA merge V12.5 rewrite-only; torre de visión presente en pesos pero sin entrenamiento |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 4096 tokens (límite recomendado en la documentación) |
| Tipos de cuantizacion | Q8_0 (4,48 GB), Q4_K_M (2,71 GB); también disponibles BF16 (8,47 GiB), FP8 W8A8 (5,15 GiB) y NVFP4 W4A4 (3,70 GiB) en otros repositorios de la serie |
| Idiomas soportados | Chino (zh), exclusivamente para la tarea de reescritura |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en las variantes BF16, FP8 y NVFP4 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de 4B de parámetros, al que se le ha fusionado (merge) un adaptador LoRA denominado V12.5 "rewrite-only". El entrenamiento es un SFT de tarea única: según la model card, solo se entrenó la capacidad de reescritura, sin capacidad de expansión de texto (no扩写), sin system prompt y sin modo de razonamiento (thinking). La plantilla de chat incrustada en el GGUF fija el prefijo de generación a un bloque `<think>\n\n</think>\n\n` vacío, de modo que el modelo emite directamente el texto reescrito.

Los datos de entrenamiento y el número de tokens no están disponibles en la información proporcionada, aunque la model card indica que los objetivos de entrenamiento trabajaban con entradas de 800–950 caracteres chinos con salidas medias de unos 540 caracteres (factor de compresión de aproximadamente 0,63). La conversión a GGUF se realizó con `convert_hf_to_gguf.py --outtype f16 --no-mtp` seguida de `llama-quantize` para generar Q8_0 y Q4_K_M. El modelo no incorpora MTP (multi-token prediction) incrustado y la torre visual heredada del base no participa en la inferencia.

## Capacidades

- Reescritura de fragmentos de novela en chino: parafrasea el texto reorganizando el lenguaje con estilo natural de autor, manteniendo trama, personajes y eventos principales.
- Control de copia literal: el prompt de entrenamiento prohíbe copiar secuencias consecutivas de más de 15 caracteres del original.
- Reescritura compresiva por diseño: con entradas de 800–950 caracteres produce salidas de aproximadamente el 0,63 del original; con entradas de 1.000–1.300 caracteres el factor se sitúa entre 0,6 y 0,9.
- Sin capacidad de expansión de texto: solo reescritura; no debe usarse con prompts de扩写 (ampliación).
- Sin modo de razonamiento: la plantilla fija un `<think></think>` vacío y el modelo solo emite el texto final.
- Sin tool calling, function calling ni soporte de agentes: no hay evidencia de estas capacidades en la documentación.
- Sin capacidades multimodales operativas: la torre de visión está en los pesos pero no fue entrenada para imágenes.
- No apto para chat general, código, matemáticas, traducción ni coherencia a lo largo de capítulos largos, según el propio autor.

## Casos de uso

- Limpieza de "sabor a IA" en borradores de novela: un autor que ha generado capítulos con un LLM puede pasar cada segmento de 500–1.200 caracteres por el modelo con el prompt fijo para obtener una versión reorganizada con menos patrones típicos de IA.
- Reescritura de ficción serializada en chino: plataformas webnovel pueden integrarlo vía `llama-server` para reescribir capítulos en bloque, procesando el texto por escenas de 500–700 caracteres.
- Variación de estilo con preservación de trama: equipos editoriales que necesitan versiones alternativas de un mismo pasaje sin cambiar la historia pueden usarlo como primer borrador de reescritura antes de revisión humana.
- Pipeline de post-edición por lotes: gracias a su tamaño (4B) y a los ~159–199 tok/s medidos, puede procesar grandes volúmenes de texto en una GPU de consumo, encolando segmentos con `temperature 0.7` y `repetition_penalty 1.08`.
- Anonimización estilística de textos: reescribir fragmentos para reducir la similitud literal con el original (el modelo limita la copia consecutiva a menos de 15 caracteres), útil en flujos de reescritura editorial.
- Experimentación local de cuantizaciones: con archivos Q8_0 y Q4_K_M y checksums SHA256 incluidos, es adecuado para comparar calidad de reescritura frente a coste de VRAM en entornos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye mediciones propias de calidad de reescritura sobre una entrada heldout de 646 caracteres (temperature 0.7, seed 42, max_tokens 800, repetition_penalty 1.08):

| Versión | Salida (caracteres) | Tasa de reescritura | Copia consecutiva máx. | dup8 | Velocidad |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 587 | 35,0 % | 19 | 0 | ~159 tok/s |
| Q4_K_M | 545 | 43,0 % | 20 | 0 | ~199 tok/s |

Ambas versiones finalizaron de forma natural (finish_reason `stop`). Q4_K_M produce salidas más cortas y comprimidas; Q8_0 se acerca más a la longitud original.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 5,7 GB de proceso con Q8_0 y unos 4,0 GB con Q4_K_M (medidas por el autor con contexto 4096 y offload completo a GPU).
- GPU recomendadas: cualquier GPU con 6 GB de VRAM o más ejecuta Q8_0 con `-ngl 99`; por ejemplo, una RTX 3060 de 12 GB, RTX 4060 Ti de 8 GB o RTX 4090 lo manejan con holgura.
- Cabe en GPU de consumo: sí, ambas cuantizaciones están pensadas para hardware doméstico; Q4_K_M (4,0 GB) cabe incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, con `--jinja` obligatorio) es el método documentado; el modelo base también tiene variantes FP8 y NVFP4 para vLLM en los repositorios hermanos. No hay evidencia de soporte verificado en Ollama o TGI.
- Latencia y throughput: ~159 tok/s con Q8_0 y ~199 tok/s con Q4_K_M en las pruebas del autor (GPU no especificada).
- Recomendaciones de despliegue: fijar `max_tokens` duro (1.200 por defecto; 1.500–1.600 para entradas de 1.200–1.500 caracteres), `repetition_penalty 1.08` y timeout, por riesgo de bucles de repetición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rewrite2 4B GGUF | 4,21 B | 4096 | Reescritura de novela en chino | Apache-2.0 | GGUF (Q8_0, Q4_K_M), BF16, FP8, NVFP4 en HF y ModelScope |
| Rewrite2 27B | no disponible | no disponible | Reescritura de novela en chino (mayor calidad esperada) | no disponible | BF16 en HuggingFace |
| Qwen3.5-4B (base) | 4 B | no disponible | Modelo general multilingue | no disponible | HuggingFace |

Rewrite2 4B frente a Rewrite2 27B: la propia model card advierte que 4B no debe usarse con expectativas de calidad de 27B, especialmente en pasajes complejos y escenas con muchos personajes; son líneas de experimentación independientes con pesos no intercambiables. Frente al base Qwen3.5-4B: Rewrite2 sacrifica la generalidad (chat, código, matemáticas) a cambio de una tarea de reescritura muy afinada con prompt fijo.

## Limitaciones y advertencias

- Capacidad limitada por su tamaño: no alcanza la calidad del 27B; pasajes complejos y escenas multpersonaje requieren revisión humana.
- Reescritura compresiva por defecto: la salida suele ser un 0,6–0,9 del original; si se necesita cobertura completa, hay que trocear el texto en segmentos de 500–700 caracteres e indicar explícitamente que cubra todo el contenido.
- Riesgo de repetición y bucles: puede entrar en bucles de repetición; es imprescindible usar `repetition_penalty` (1,08 como punto de partida), `max_tokens` duro y timeout en producción.
- Copia literal residual: aunque el entrenamiento prohíbe copiar más de 15 caracteres consecutivos, se han medido copias máximas de 19–20 caracteres en pruebas; conviene validar la salida.
- Entradas largas degradan la calidad: por encima de 1.500 caracteres aumentan la compresión y la copia consecutiva; hay que trocear.
- Solo chino: no sirve para reescritura en español u otros idiomas.
- Sin expansión, sin chat general, sin código, sin matemáticas, sin traducción y sin coherencia entre capítulos largos.
- Torre de visión inerte: los pesos la incluyen pero no hay entrenamiento de imagen; el repositorio solo garantiza reescritura de texto.
- La cuantización baja amplifica la compresión y la repetición: Q4_K_M es más propenso que Q8_0; validar con texto propio antes de uso formal.
- Licencia Apache-2.0: permite uso comercial sin restricciones relevantes más allá de conservar el aviso de licencia.

## Enlaces

- Repositorio principal (GGUF): https://huggingface.co/aikexue170/rewrite2-4b-gguf
- Variante BF16: https://huggingface.co/aikexue170/rewrite2-4b-bf16
- Variante FP8: https://huggingface.co/aikexue170/rewrite2-4b-fp8
- Variante NVFP4: https://huggingface.co/aikexue170/rewrite2-4b-nvfp4
- Variante 27B BF16: https://huggingface.co/aikexue170/rewrite2-27b-bf16
- ModelScope (GGUF): https://modelscope.cn/models/alkaid55555/rewrite2-4b-gguf
- ModelScope (BF16): https://modelscope.cn/models/alkaid55555/rewrite2-4b-bf16
- ModelScope (FP8): https://modelscope.cn/models/alkaid55555/rewrite2-4b-fp8
- ModelScope (NVFP4): https://modelscope.cn/models/alkaid55555/rewrite2-4b-nvfp4
