# Infatoshi/Inkling-2-Mini-heretic

## Resumen

Inkling-2-Mini-heretic es una versión modificada ("abliterated" o sin censura) de `thinkingmachines/Inkling-2-Mini`, el modelo base desarrollado por Thinking Machines Lab. El autor de la modificación es Infatoshi, que aplica una técnica de eliminación de la dirección de rechazo en el espacio residual para reducir drásticamente la tasa de negativas del modelo ante peticiones dañinas, manteniendo buena parte de sus capacidades de razonamiento y código.

El modelo base emplea una arquitectura de tipo transformer con bucles (looped architecture): 24 capas físicas que se recorren hasta 48 veces lógicas, con bloques `ShortConvolution` y una mezcla de expertos (MoE) enrutada con cuantización mixta NVFP4/MXFP8. El checkpoint publicado pesa 20,2 GB en formato safetensors y contiene 26.388.646.440 parámetros totales. La ventana de contexto declarada en la configuración de servicio recomendada es de 262.144 tokens.

Su relevancia actual reside en que demuestra que las técnicas de abliteración por proyección ortogonal, adaptadas a arquitecturas no convencionales (bucles, convoluciones cortas, MoE cuantizado), pueden elevar la tasa de cumplimiento ante ataques de jailbreak de un 4,33 % a un 73,33 % en HarmBench sin destruir el rendimiento en tareas de razonamiento (GSM8K cae solo 0,61 puntos). Es un caso de estudio técnico sobre alineación y su reversibilidad, además de un modelo utilizable para investigación en seguridad de IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (24 capas físicas / 48 visitas lógicas), bloques `ShortConvolution`, MoE enrutado con expertos cuantizados en NVFP4/MXFP8 |
| Parámetros totales | 26.388.646.440 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración de servicio recomendada) |
| Tipos de cuantización | NVFP4 (capas 0-19), MXFP8 (capas 20-23); pesos base en BF16; checkpoint exportado en 8 bits (modelopt) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8-bit, modelopt) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini combina una arquitectura transformer con un controlador de bucle (`gain_weight`, capas 6-17) que recorre un núcleo de 12 capas tres veces, más 6 capas de preludio y 6 de coda, totalizando 49 estados residuales distintos. Incorpora bloques `ShortConvolution` con dependencia de canal y una capa MoE con 128 expertos enrutados cuantizados en NVFP4 y MXFP8 según la profundidad. El tokenizador tiene un vocabulario de 201.024 tokens y soporta un parser nativo de tool calling (`inkling2`) y decodificación especulativa DSPARK.

La modificación "heretic" no reentrena el modelo: aplica una abliteración proyectada iterativa en dos etapas. Primero captura activaciones residuales exactas en los límites de la plantilla de chat (`<|message_model|><|content_thinking|>` y `<|message_model|><|content_text|>`) sobre conjuntos disjuntos de prompts dañinos (AdvBench, XSTest-unsafe) y benignos (XSTest-safe). Después construye una base ortonormal de rango 4 por capa física mediante Gram-Schmidt, proyectada ortogonal a las medias residuales benignas y precompensada por el peso de la convolución corta (`1 + sconv.weight[:, -1]`). La ablación cubre `attn.wo_ud.weight`, el controlador de bucle `gain_weight` y los `mlp.experts.w2_weight` de los 128 expertos, con desquantización y recuantización exacta compatible en bit. Los hiperparámetros se optimizan con Optuna TPE multiobjetivo, minimizando simultáneamente la tasa de no cumplimiento (clasificador HarmBench-Llama-2-13b-cls) y la divergencia KL del primer token de respuesta sobre el vocabulario completo (201.024 tokens). La segunda etapa recaptura activaciones dentro del modelo ya modificado para eliminar circuitos de redirección secundarios.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (`message_model`, `content_thinking`, `content_text`).
- Razonamiento explícito en modo "thinking" con control de esfuerzo (`reasoning_effort`).
- Generación de código: 90,24 % en HumanEval (148/164) con decodificación greedy.
- Razonamiento matemático: 96,36 % en GSM8K (1.271/1.319).
- Tool calling nativo mediante el parser `inkling2`, verificado como PASS en la evaluación del autor.
- Decodificación especulativa DSPARK con 8 tokens de borrador y cabeza LM en MXFP8.
- Soporte multimodal (flag `--enable-multimodal` en la configuración de servicio recomendada).
- Cumplimiento elevado ante peticiones dañinas: 73,33 % de ASR en HarmBench-13B (frente al 4,33 % del base).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad y alineación: el modelo sirve como banco de pruebas controlado para estudiar cómo se distribuye la dirección de rechazo en arquitecturas con bucles y qué circuitos secundarios emergen tras una abliteración, comparando directamente con el checkpoint base.
- Red teaming de clasificadores: al elevar el ASR de 4,33 % a 73,33 %, permite generar respuestas dañinas de forma reproducible para evaluar la robustez de filtros de salida y clasificadores tipo HarmBench-Llama-2-13b-cls.
- Evaluación de técnicas de edición de pesos: la receta (base ortonormal de rango 4, precompensación por `ShortConvolution`, recuantización exacta NVFP4/MXFP8) es replicable y sirve para validar metodologías de abliteración sobre modelos MoE cuantizados.
- Asistencia a la investigación en razonamiento: con 96,36 % en GSM8K y 90,24 % en HumanEval, es adecuado para experimentos que requieran un modelo de razonamiento con la censura atenuada, por ejemplo estudios sobre sesgos en cadenas de pensamiento.
- Generación de código en pipelines internos: el soporte de tool calling nativo y la ventana de 262.144 tokens permiten integrarlo en flujos de CI/CD para revisión de parches o generación de tests sobre repositorios grandes, siempre en entornos controlados.
- Despliegue en una sola GPU profesional: la configuración recomendada con SGLang sobre una RTX PRO 6000 Blackwell (96 GB) permite servir el modelo con decodificación especulativa y 16 peticiones concurrentes, útil para prototipos que necesiten contexto muy largo.
- Estudio de la degradación por cuantización: al mezclar NVFP4 y MXFP8 en los expertos, permite medir el impacto de la cuantización mixta en tareas de código y matemáticas frente al modelo base en BF16.

## Benchmarks y rendimiento

Resultados verificados por el autor, decodificación greedy (`temperature=0.0`, `reasoning_effort="low"`, `max_tokens=2048`), servido con SGLang y DSPARK sobre una RTX PRO 6000 Blackwell:

| Métrica | Inkling-2-Mini (base) | Inkling-2-Mini-heretic | Delta |
|---|---:|---:|---:|
| HarmBench-13B ASR (300) | 13/300 (4,33 %) | 220/300 (73,33 %) | +69,00 pp (16,9x) |
| HarmBench Standard (200) | 2/200 (1,00 %) | 130/200 (65,00 %) | +64,00 pp |
| HarmBench Contextual (100) | 11/100 (11,00 %) | 90/100 (90,00 %) | +79,00 pp |
| JailbreakBench-13B Aux ASR (100) | 0/100 (0,00 %) | 56/100 (56,00 %) | +56,00 pp |
| XSTest-Safe Non-Refusal (250) | 247/250 (98,80 %) | 249/250 (99,60 %) | +0,80 pp |
| GSM8K (1.319) | 1.279/1.319 (96,97 %) | 1.271/1.319 (96,36 %) | -0,61 pp |
| HumanEval (164) | 158/164 (96,34 %) | 148/164 (90,24 %) | -6,10 pp |
| Prefill Integrity Probe | PASS | PASS | — |
| Native Tool Calling (`inkling2`) | PASS | PASS | — |

Nota del autor: 5 de los fallos adicionales en HumanEval corresponden a truncamientos por `finish_reason=length` con `max_tokens=2048` en trazas de razonamiento largas, sin errores de API.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 20,2 GB en 8 bits; en BF16 completo requeriría aproximadamente 52,8 GB solo para pesos (26.388.646.440 × 2 bytes), más caché KV.
- GPU recomendada por el autor: una RTX PRO 6000 Blackwell (96 GB, SM120), con `--tp 1 --ep 1` y `--mem-fraction-static 0.88`.
- Cabe en GPU de consumo: no disponible; el tamaño de pesos en 8 bits (20,2 GB) excede la VRAM de las RTX 4090 (24 GB) con margen insuficiente para caché KV a contexto largo, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: SGLang con la imagen `lmsysorg/sglang:inkling-2-mini` (única configuración documentada). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Backend de atención: `fa4`; tamaño de página 128; caché KV en `auto`.
- Decodificación especulativa: DSPARK con 8 tokens de borrador y cabeza LM en MXFP8, activada por defecto en la configuración recomendada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| Infatoshi/Inkling-2-Mini-heretic | 26,4 B | 262.144 | Apache 2.0 | Variante abliterada; ASR HarmBench 73,33 %; GSM8K 96,36 %; HumanEval 90,24 % |
| thinkingmachines/Inkling-2-Mini | 26,4 B | no disponible | Apache 2.0 | Modelo base; ASR HarmBench 4,33 %; GSM8K 96,97 %; HumanEval 96,34 % |
| Alternativas de la misma categoría (abliterated MoE ~25 B) | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El propósito declarado de la modificación es eliminar el rechazo ante contenido dañino; su uso en producción para atención al cliente o aplicaciones públicas expone a riesgo legal y reputacional grave.
- La tasa de cumplimiento ante peticiones dañinas es del 73,33 % (HarmBench-13B), lo que implica que el modelo generará contenido prohibido de forma habitual; requiere filtros de salida externos si se despliega en cualquier interfaz abierta.
- Degradación medible en código: HumanEval baja 6,10 puntos (de 96,34 % a 90,24 %), con truncamientos por longitud de razonamiento; en producción con `max_tokens` limitado puede empeorar.
- No se han publicado datos sobre sesgos demográficos, tasas de alucinación ni evaluación multilingüe; los idiomas soportados figuran como no disponibles.
- La ventana de contexto de 262.144 tokens solo está verificada con la configuración SGLang indicada; otros servidores pueden no soportar la arquitectura de bucle ni el parser `inkling2`.
- El proceso de abliteración modifica pesos cuantizados con recuantización exacta declarada por el autor, pero no hay validación independiente de que la integridad numérica se preserve en todos los kernels.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el desplegador; el autor no ofrece garantías.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la ficha, sin revisión comunitaria independiente.
- Los benchmarks los ha ejecutado el propio autor del modelo; no hay replicación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infatoshi/Inkling-2-Mini-heretic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Clasificador HarmBench utilizado: `cais/HarmBench-Llama-2-13b-cls` (https://huggingface.co/cais/HarmBench-Llama-2-13b-cls)
- Imagen de servicio SGLang: `lmsysorg/sglang:inkling-2-mini`
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
