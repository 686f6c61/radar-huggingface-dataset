# kabcnd/Kenzan-Venus-Omni-8B-Tool-PinGrid-GGUF

## Resumen

Kenzan-Venus-Omni-8B-Tool-PinGrid-GGUF es una cuantización GGUF especializada del modelo multimodal inclusionAI/Realtime-Venus, publicada por el usuario kabcnd. El trabajo se centra en mejorar la fiabilidad del tool calling (function calling) sobre el núcleo de lenguaje Qwen3-8B que incorpora Realtime-Venus, mediante la inyección de una compuerta de decisión ortogonal Ridge directamente en la matriz `output.weight` del modelo cuantizado. El resultado es un artefacto de 6,04 GiB y 6,34 BPW pensado para ejecutarse en un Mac mini M6 con 16 GB de memoria unificada.

El modelo conserva el núcleo Omni del original: 36 capas transformer de tipo Qwen3-8B con atención GQA (32 cabezas de consulta, 8 de clave/valor) y dimensión oculta 4096 con intermedio 12288, además de los tokens de audio (IDs 151643–151751) y los componentes de síntesis de voz `token2wav/` (1,15 GiB). La intervención principal es la llamada "PinGrid", una cuantización selectiva por tensores que preserva los pesos críticos para el tool calling y el audio, junto con una calibración de la frontera de decisión que reduce drásticamente las llamadas espurias a herramientas.

Su relevancia actual radica en que aborda uno de los problemas prácticos más habituales al desplegar modelos pequeños en local para agentes: la generación de `tool_calls` mal formados o la invocación innecesaria de funciones. Según el autor, la tasa de acierto en BFCL-Lite-60 sube del 75,0 % al 95,0 % y la conformidad estricta con el esquema OpenAI `tool_calls` pasa del 2 % al 100 %, manteniendo velocidades de generación de aproximadamente 25 t/s en Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (núcleo Qwen3-8B) con extensión Omni (audio); GQA 32/8; 36 capas; hidden 4096; intermediate 12288 |
| Parámetros totales | 8.189.228.032 (8,19 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 8192 tokens en la receta de referencia (`-c 8192`); el máximo nativo no está especificado en la información disponible |
| Tipos de cuantización | GGUF PinGrid a 6,34 BPW (archivo principal); `output.weight` en Q8_0; mapa de precisión por tensor en `recipes/tensor_types_venus_tool.txt` |
| Idiomas soportados | Inglés (en), chino (zh), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (más artefactos ONNX/PyTorch para TTS: `campplus.onnx`, `flow.pt`, `hift.pt`, `speech_tokenizer_v2_25hz.onnx`) |

## Arquitectura y entrenamiento

El modelo base Realtime-Venus, desarrollado por inclusionAI (Ant Group), combina un núcleo de lenguaje Qwen3-8B con capacidades Omni, incluyendo tokens de audio y un pipeline de síntesis de voz. La arquitectura es un transformer denso con 36 capas, atención con GQA (32 cabezas de consulta y 8 de clave/valor) y dimensiones 4096×12288. Sobre este núcleo, el autor de la cuantización aplica una transformación denominada PinGrid, que asigna precisiones por tensor y preserva íntegramente el vocabulario de audio (IDs 151643–151751) y los módulos `token2wav/` necesarios para la síntesis de voz full-duplex.

La innovación técnica principal es la incorporación de una compuerta de decisión ortogonal basada en regresión Ridge (vector `w_delta`) directamente en la matriz `output.weight` en Q8_0. Esta compuerta actúa como frontera de decisión calibrada para decidir si el modelo debe emitir una llamada a herramienta o abstenerse, y se activa cuando la petición termina con `<think>\n\n</think>\n\n` (con `enable_thinking: false`). Según el autor, esto reduce la tasa de falsos positivos en detección de irrelevancia del 100 % al 20 % y mejora la perplejidad de 9,8537 a 9,3006 ± 0,20647. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y ruso.
- Tool calling y function calling con esquema OpenAI, incluyendo llamadas simples, múltiples funciones, esquemas anidados y complejos, llamadas en paralelo y cadenas multi-turno.
- Detección de irrelevancia y abstención: el modelo puede decidir no invocar ninguna herramienta cuando la petición no lo requiere (8/10 en BFCL-Lite-60, FPR 20 %).
- Capacidades Omni de audio: el repositorio conserva los tokens de audio y los componentes `token2wav/` para síntesis de voz full-duplex.
- Modo de razonamiento desactivable: la receta recomienda `enable_thinking: false` para activar la frontera de decisión calibrada.
- Compatibilidad con endpoints tipo OpenAI en `llama-server`.
- Decodificación especulativa mediante `ngram-map-k` (parámetros `spec-ngram-map-k-size-n 3`, `size-m 4`, `draft-n-max 3`).
- No se menciona soporte de visión en la información disponible.

## Casos de uso

- Agentes locales en Apple Silicon: el modelo cabe en 16 GB de memoria unificada de un Mac mini M6 y permite ejecutar un agente con tool calling fiable sin conexión a la nube, usando `llama-server` con `-ngl 99` y plantilla Jinja propia.
- Asistente de voz en local: al conservar los tokens de audio y el pipeline `token2wav/`, puede emplearse para construir asistentes conversacionales con síntesis de voz full-duplex en dispositivos con memoria unificada.
- Automatización de atención al cliente con herramientas: la mejora en abstención (FPR del 20 % frente al 100 % del baseline) permite desplegar un agente que no invoque APIs innecesariamente cuando la consulta es puramente informativa.
- Integración en pipelines de CI/CD para pruebas de function calling: el modelo sirve como referencia local para validar plantillas de herramientas y esquemas JSON antes de desplegar en producción.
- Orquestación multi-herramienta en flujos de trabajo: las puntuaciones de 10/10 en llamadas paralelas y secuenciales lo hacen adecuado para agentes que deben encadenar varias APIs en una sola respuesta.
- Prototipado de asistentes multilingües: soporta inglés, chino y ruso, lo que permite cubrir casos de uso en esos tres idiomas sin cambiar de modelo.
- Evaluación y benchmarking local de tool calling: al incluir resultados BFCL-Lite-60 reproducibles y un mapa de precisión por tensor, es útil como baseline para comparar técnicas de cuantización.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (BFCL-Lite-60 con evaluación AST y 50 casos de conformidad estricta OpenAI):

| Benchmark | Baseline (GGUF bruto) | Kenzan-Venus-Tool | Delta |
|---|---|---|---|
| Simple Function | 8/10 (80 %) | 10/10 (100 %) | +20 % |
| Multiple Functions | 9/10 (90 %) | 10/10 (100 %) | +10 % |
| Nested & Complex Schema | 10/10 (100 %) | 10/10 (100 %) | 0 % |
| Irrelevance Detection (Abstention) | 0/10 (FPR 100 %) | 8/10 (FPR 20,0 %) | +80 % |
| Multi-Turn Tool Chain | 10/10 (100 %) | 9/10 (90 %) | −10 % |
| Parallel / Sequential Calls | 8/10 (80 %) | 10/10 (100 %) | +20 % |
| BFCL-Lite-60 global | 45/60 (75,0 %) | 57/60 (95,0 %) | +20,0 % |
| Strict Raw OpenAI `tool_calls` | 1/50 (2 %) | 50/50 (100 %) | +98 % |
| Perplejidad (`wt2_holdout_128k.txt`, 14 chunks, `-c 2048`) | 9,8537 | 9,3006 ± 0,20647 | −0,55 |
| Velocidad media pp / tg (Apple Silicon M6) | 422,50 / 23,39 t/s | 459,52 / 25,44 t/s | +8,8 % / +8,8 % |

Datos adicionales de rendimiento: `llama-bench` pp512 = 825,87 t/s; pico de generación de 33,4 t/s con `ngram-map-k 3x4`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 6,04 GiB para el archivo GGUF principal más 1,15 GiB adicionales si se carga el pipeline `token2wav/` para síntesis de voz.
- Hardware de referencia: Mac mini M6 con 16 GB de memoria unificada; el autor lo posiciona explícitamente para ese perfil.
- GPU recomendadas: el autor solo documenta Apple Silicon (Metal 4, kernels `simdgroup_matrix` de `llama-clover`). No hay datos publicados para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: por tamaño (6,04 GiB) cabría en GPUs con 8 GB o más de VRAM, pero no se han publicado pruebas en esas plataformas.
- Opciones de despliegue: `llama-server` (llama.cpp) con plantilla Jinja `venus_tool.jinja`, `-ngl 99`, `-fa on`, `-np 1`, `-c 8192`, `--jinja` y decodificación especulativa `ngram-map-k`. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: en M6, media de 459,52 t/s en prompt processing y 25,44 t/s en generación; pico de 33,4 t/s con decodificación especulativa; pp512 de 825,87 t/s en `llama-bench`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| Kenzan-Venus-Omni-8B-Tool-PinGrid | 8,19 B | 8192 (receta) | BFCL-Lite-60 95,0 %; OpenAI strict 100 % | Apache 2.0 | GGUF 6,34 BPW |
| inclusionAI/Realtime-Venus (base) | 8,19 B (núcleo Qwen3-8B) | No disponible | Baseline BFCL-Lite-60 75,0 %; strict 2 % | No disponible en la información | Pesos originales (no disponible) |
| Qwen3-8B (núcleo del modelo) | ~8 B | No disponible | No disponible en la información | No disponible en la información | No disponible |

La comparativa se limita al modelo base y al núcleo Qwen3-8B porque la información proporcionada no incluye datos de otros modelos comparables de la misma categoría (8B con tool calling en GGUF). No se dispone de cifras de MMLU, HumanEval ni GSM8K para ninguno de ellos en esta ficha.

## Limitaciones y advertencias

- Solo se han publicado evaluaciones en BFCL-Lite-60 (60 casos) y en 50 casos de conformidad estricta; son conjuntos pequeños y no sustituyen a benchmarks estándar de razonamiento o código.
- La compuerta de decisión calibrada depende de que la petición termine con `<think>\n\n</think>\n\n`; si no se pasa `"chat_template_kwargs": {"enable_thinking": false}`, el comportamiento de tool calling puede degradarse.
- La plantilla `venus_tool.jinja` es necesaria para forzar la adherencia exacta a los nombres de herramientas; sin ella, la fiabilidad puede caer al baseline.
- El modelo solo declara soporte de inglés, chino y ruso; no se garantiza calidad en castellano ni en otros idiomas.
- La cuantización a 6,34 BPW y la modificación de `output.weight` en Q8_0 son intervenciones del autor sobre el modelo base; no hay validación independiente de que no introduzcan regresiones en tareas distintas del tool calling.
- La perplejidad reportada (9,3006 ± 0,20647) se mide sobre un holdout propio del autor (`wt2_holdout_128k.txt`), no sobre un conjunto estándar.
- El modelo conserva capacidades de audio y TTS, pero no se documenta el rendimiento de esas capacidades tras la cuantización.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base inclusionAI/Realtime-Venus antes de un uso comercial, ya que la información disponible no detalla su licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Venus-Omni-8B-Tool-PinGrid-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Realtime-Venus
- Ko-fi del autor: https://ko-fi.com/kabcpc
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
