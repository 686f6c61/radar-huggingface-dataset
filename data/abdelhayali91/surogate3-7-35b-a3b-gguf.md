# abdelhayali91/Surogate3.7-35B-A3B-GGUF

## Resumen
Surogate3.7-35B-A3B-GGUF es la conversión a formato GGUF del modelo `surogate/Surogate3.7-35B-A3B`, un transformer de tipo Mixture of Experts (MoE) construido sobre Qwen3.5-35B-A3B-Base y sometido a un post-entrenamiento orientado a uso agéntico. El repositorio lo publica el usuario `abdelhayali91` y su aportación es exclusivamente de conversión y cuantización: no entrena ni modifica los pesos, solo los adapta para su ejecución en llama.cpp. El modelo base lo desarrolla el equipo `surogate`.

El interés de esta ficha reside en que combina tres características poco habituales en un mismo artefacto GGUF: un MoE de 35.505.251.456 parámetros totales con aproximadamente 3.000 millones activos por token (de ahí el sufijo A3B), capacidades de visión mediante un proyector multimodal separado, y la conservación de la cabeza MTP (Multi-Token Prediction) como capas `nextn`, lo que permite decodificación especulativa sin modelo draft adicional.

La cuantización publicada es única: Q5_K_M para el modelo principal (25,3 GB) más un proyector de visión en F16 (0,9 GB), con un total de repositorio de 26,2 GB. La licencia es Apache-2.0, heredada del modelo original, lo que facilita su uso comercial. La información pública sobre idiomas soportados, datos de entrenamiento y benchmarks oficiales del modelo base es escasa o inexistente en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con cabeza MTP, basado en Qwen3.5-35B-A3B-Base |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (sufijo A3B) |
| Longitud de contexto | 131.072 tokens en la configuración de ejemplo; se han medido ejecuciones hasta 262.144 tokens |
| Tipos de cuantizacion | Q5_K_M (modelo principal), F16 (proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors BF16 en el modelo base |

## Arquitectura y entrenamiento
El modelo es un transformer MoE derivado de Qwen3.5-35B-A3B-Base, con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones activos por token. Incorpora una cabeza MTP (Multi-Token Prediction) que se conserva en la conversión GGUF como capas `nextn`, lo que habilita decodificación especulativa nativa en llama.cpp mediante `--spec-type draft-mtp` sin necesidad de un modelo draft separado. El pipeline multimodal se resuelve con un proyector de visión independiente (`mmproj`) en F16.

El post-entrenamiento del modelo base, según la model card, está orientado a uso agéntico (agentic post-training), con soporte declarado para tool-use, razonamiento y visión. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` (llama.cpp f336359) en modo BF16 conservando la cabeza MTP, seguida de `convert_hf_to_gguf.py --mmproj --outtype f16` para el proyector de visión y de `llama-quantize` a Q5_K_M sin imatrix.

## Capacidades
- Generación de texto y razonamiento, con modo de pensamiento (thinking) activable o desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Generación de código, evaluada en el suite propio del autor con puntuación de 100 en la categoría de coding.
- Capacidades de visión: pipeline `image-text-to-text` con proyector multimodal F16, lo que permite entrada de imágenes junto a texto.
- Soporte de tool calling y function calling, con puntuación de 100 en la categoría de agent/tool calls del suite del autor.
- Uso agéntico y razonamiento multi-paso, reforzado por el post-entrenamiento agéntico del modelo base.
- Contexto largo: configuración de referencia a 131.072 tokens y mediciones realizadas hasta 262.144 tokens.
- Decodificación especulativa nativa mediante la cabeza MTP conservada (aceptación de drafts medida entre el 59 % y el 75 %).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso
- Asistentes de código en producción: el modelo obtiene 100 en la categoría de coding del suite del autor y soporta tool calling, por lo que puede integrarse en pipelines de CI/CD para revisión de parches, generación de tests o explicación de errores de compilación, invocando herramientas externas (linters, ejecutores de tests) mediante function calling.
- Agentes autónomos multi-paso: la combinación de tool-use, razonamiento con thinking mode y contexto de hasta 131.072 tokens permite construir agentes que mantienen el estado de una tarea larga y encadenan llamadas a APIs sin perder el hilo de la conversación.
- Análisis de documentos e imágenes: al ser un modelo `image-text-to-text` con proyector de visión, puede procesar capturas de pantalla, diagramas o documentos escaneados junto a instrucciones textuales, útil para soporte técnico o extracción de información de interfaces.
- Atención al cliente con contexto largo: los 131.072 tokens de ventana permiten arrastrar historiales de conversación extensos o bases de conocimiento inyectadas en el prompt, manteniendo coherencia multi-turno.
- Procesamiento de repositorios completos: con contexto de 262.144 tokens medido en la configuración del autor, el modelo puede recibir fragmentos amplios de código o documentación para tareas de resumen, auditoría o refactorización asistida.
- Despliegue en hardware de gama alta de consumo o estaciones de trabajo con múltiples GPU: la cuantización Q5_K_M (25,3 GB) y el reparto entre GPUs permiten ejecutar el modelo en configuraciones como la medida por el autor (RTX A4500 de 20 GB más Tesla V100 de 16 GB en proporción 60/40) con velocidades de generación cercanas a 95-99 tok/s.
- Razonamiento con coste controlado: el modo thinking desactivable permite usar el modelo en tareas de baja latencia sin la sobrecarga de la cadena de razonamiento, y activarlo solo cuando la tarea lo requiera.

## Benchmarks y rendimiento
El autor publica un suite propio (coding, reasoning, instruction following, agent/tool calls, long context y vision) y mediciones de throughput en su hardware. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Resultado |
|---|---|
| Suite propio, thinking desactivado | 88,1 (coding 100, agent/tool calls 100, long context 100, instruction following 42) |
| Suite propio, thinking activado | 94,3 (instruction following sube a 92) |
| Generación, contexto 32k, KV f16 | 98,6 tok/s |
| Generación, contexto 128k, KV f16 | 94,9 tok/s |
| Generación, contexto 262k, KV q8_0 | 90,6 tok/s |
| Generación de código, contexto 32k | 115,8 tok/s |
| Generación de código, contexto 128k | 111,0 tok/s |
| Prefill con prompt de 7k | 961 tok/s (886 tok/s a 262k) |
| Aceptación de drafts MTP | 59-75 % |

Hardware de medición: RTX A4500 (20 GB) + Tesla V100 (16 GB), reparto 60/40, MTP con 3 drafts.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 25,3 GB para el modelo Q5_K_M más 0,9 GB del proyector de visión, es decir, en torno a 26 GB solo para pesos; hay que sumar la caché KV, que en f16 a 131.072 tokens requiere memoria adicional considerable (el autor usa KV f16 hasta 128k y q8_0 a 262k).
- GPU recomendadas: el autor valida la ejecución en una RTX A4500 de 20 GB combinada con una Tesla V100 de 16 GB. Para ejecución en una sola GPU se necesita al menos una unidad con 32 GB o más (por ejemplo, A100 40 GB, H100, RTX 5090 de 32 GB) para acomodar pesos y caché KV.
- No cabe en GPUs de consumo de 24 GB o menos en la cuantización publicada; sí podría caber en una RTX 4090 de 24 GB solo si se reduce drásticamente el contexto o se usa KV en q8_0, aunque el autor no documenta esa configuración.
- Opciones de despliegue: llama.cpp, en concreto `llama-server` con `-ngl all -fa on --jinja` y `--spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-min 0` para aprovechar la cabeza MTP. La model card no documenta otras opciones (vLLM, Ollama, TGI) para esta conversión concreta.
- Latencia y throughput: 98,6 tok/s de generación a 32k de contexto y 94,9 tok/s a 128k en el hardware del autor; prefill de 961 tok/s con prompt de 7k. La aceptación de drafts MTP entre el 59 % y el 75 % reduce el coste efectivo de la decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Surogate3.7-35B-A3B (esta ficha) | 35,5 B | ~3 B | 131k (medido hasta 262k) | Apache-2.0 | GGUF Q5_K_M + mmproj F16 | MoE con MTP, visión, tool-use |
| Qwen3.5-35B-A3B-Base | 35,5 B | ~3 B | no disponible | no disponible | safetensors | Modelo base sin post-entrenamiento agéntico |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente en las fuentes consultadas para establecer una comparativa numérica fiable con otros modelos de la misma categoría. La comparación más directa es con su modelo base Qwen3.5-35B-A3B-Base, del que se diferencia por el post-entrenamiento agéntico y por la conversión a GGUF con visión y MTP.

## Limitaciones y advertencias
- La puntuación de instruction following en el suite del autor es baja con thinking desactivado (42 sobre 100), lo que sugiere que el modelo puede desviarse de instrucciones precisas si se desactiva el modo de razonamiento.
- El suite de evaluación es propio del autor y no está estandarizado; los resultados (88,1 y 94,3) no son directamente comparables con benchmarks públicos como MMLU o HumanEval.
- No se documentan sesgos conocidos, datos de entrenamiento ni composición del dataset, lo que dificulta evaluar riesgos de sesgo o contaminación.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado fuera de los idiomas cubiertos por el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el autor de la conversión no ofrece garantías sobre el modelo; cualquier responsabilidad de uso recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (22 de noviembre de 2026), por lo que no hay validación comunitaria independiente de la conversión.
- La ejecución requiere hardware con al menos 26 GB de VRAM solo para pesos, más caché KV; no es desplegable en GPUs de consumo estándar de 24 GB sin recortes agresivos de contexto.
- La cabeza MTP solo es aprovechable en llama.cpp con los flags documentados; otras herramientas pueden ignorarla o no soportarla.

## Enlaces
- Repositorio Hugging Face de esta conversión: https://huggingface.co/abdelhayali91/Surogate3.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Organización del modelo base: https://huggingface.co/surogate
- Repositorio del autor con configuración, comparativas y setup: https://github.com/Abdelhayali/DualGPU-V100-A4500
- llama.cpp (herramienta de conversión y ejecución): no se proporciona enlace directo en la información disponible
