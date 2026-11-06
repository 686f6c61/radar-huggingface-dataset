# mentriaai/Ternary-Bonsai-2-4B-mentria

## Resumen

Ternary-Bonsai-2-4B-mentria es un modelo vision-lenguaje multimodal de 4.000 millones de parametros cuantizado en formato ternario (−1 / 0 / +1) y empaquetado en safetensors para mentria-engine, un runtime WebGPU propietario disenado para ejecutar inferencia completamente dentro del navegador. Lo publica mentriaai a partir del modelo base prism-ml/Ternary-Bonsai-2-4B-gguf, que a su vez deriva de Qwen3.5-4B. El peso del modelo de lenguaje ocupa 1,14 GB y la torre de vision unos 210 MB, lo que permite desplegarlo en cliente sin GPU dedicada.

El modelo resuelve el problema de servir inferencia multimodal de calidad razonable con un presupuesto de descarga y memoria muy ajustado: aproximadamente 2,13 bits por peso gracias a codigos ternarios con una escala FP16 por grupo de 128 pesos y una base rotada de Hadamard que el runtime deshace de forma exacta en cada matmul. Segun la model card, el 28 de octubre de 2026 fue seleccionado para sustituir a Qwen3.5-2B-mentria en el nivel intermedio de mentria.ai.

Su relevancia actual es doble: por un lado demuestra que un modelo de 4B con vision puede caber en ~1,35 GB y ejecutarse en WebGPU con velocidades de decodificacion de 88,3 tok/s en un Apple M4 Pro bajo Chrome; por otro, la model card documenta una validacion de correctitud contra el runtime de referencia llama.cpp (433/433 posiciones coincidentes en test teacher-forced) y una comparativa por benchmarks frente a una cuantizacion Q4 de Qwen3.5-2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid: 32 capas, 24 Gated-DeltaNet (16 cabezas key / 32 value) + 8 capas de atencion completa (cada 4.a capa; 16Q / 4KV, dim de cabeza 256), hidden 2560, FFN 9216 |
| Parametros totales | 4.000 millones (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como maximo oficial; los benchmarks se ejecutaron con contexto de 2.048 tokens |
| Tipos de cuantizacion | mentria-q2g128-v1: pesos ternarios (−1/0/+1), grupo de 128, escala FP16 por grupo, ~2,13 bits por peso, base rotada de Hadamard (bloque 512) |
| Idiomas soportados | en (ingles declarado); el pilot de chat evaluo tambien espanol, portugues BR, frances y japones |
| Licencia | Apache 2.0 (licencia upstream preservada) |
| Formato de pesos | safetensors (mentria-q2g128-v1); modelo base en GGUF |
| Torre de vision | ViT de 24 capas, hidden 1024, patch 16, merge espacial 2, proyecta a embeddings de texto de 2.560 |
| Tokenizer | BPE de Qwen3.5, vocabulario 248.320 |
| Libreria / runtime | mentria-engine (WebGPU) |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la hibrida de Qwen3.5: 32 capas en las que 24 son Gated-DeltaNet (un mecanismo de estado recurrente con 16 cabezas de key y 32 de value) y 8 son de atencion completa, intercaladas cada cuatro capas con 16 cabezas de query, 4 de key/value y dimension de cabeza 256. La dimension oculta es 2560 y la FFN 9216. La torre de vision es un ViT de 24 capas con hidden 1024, patch de 16 y merge espacial de 2, que proyecta a las embeddings de texto de 2.560 dimensiones.

El entrenamiento original corresponde a prism-ml (Ternary Bonsai 2 4B) y, aguas arriba, a Qwen3.5-4B; la model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable esta en la cuantizacion: los pesos se almacenan en base rotada de Hadamard y el runtime aplica la rotacion correspondiente a cada entrada de matmul en f32 (bloque 512), de modo que la rotacion es exacta. Los pesos se reempaquetan desde el GGUF upstream, no se recuantizan. La validacion de correctitud usa un test teacher-forced contra la referencia llama.cpp de PrismML con 433/433 posiciones coincidentes y cero desacuerdos decisivos (definidos como aquellos en los que los dos candidatos top de la referencia distan mas de 0,15 de probabilidad), ademas de salida greedy identica en cuatro prompts de ejecucion libre.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con rendimiento evaluado tambien en espanol, portugues de Brasil, frances y japones en un pilot de chat.
- Razonamiento matematico y resolucion de problemas verbales (GSM8K 89,8% en la evaluacion del autor).
- Seguimiento de instrucciones a nivel de prompt (IFEval 76,9% en modo estricto).
- Conocimiento general y respuesta a preguntas de tipo MMLU (MMLU-Redux 70,1%).
- Entrada de imagen: pipeline image-text-to-text con torre ViT de 24 capas y preprocesado propio (preprocessor_config.json).
- Generacion de codigo: no se documenta benchmark especifico de codigo en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: los benchmarks se ejecutaron con thinking desactivado; no se detalla el comportamiento con thinking activado.
- Ejecucion on-device en navegador via WebGPU, sin envio de datos a servidor.

## Casos de uso

- Asistente conversacional embebido en web: el modelo se sirve desde mentria-engine en Chrome y mantiene conversaciones multi-turno con contexto de hasta 2.048 tokens en las pruebas, sin que los datos del usuario salgan del navegador.
- Sustitucion de un modelo Q4 de 2B en el nivel intermedio de un producto: segun la model card, reemplaza a Qwen3.5-2B-mentria con un tamano de descarga practicamente identico (1.148 MB frente a 1.191 MB) y mejoras de +16,7 puntos en GSM8K, +12,2 en IFEval y +10,6 en MMLU-Redux.
- Tutoria y aprendizaje con tarjetas (card decks): la plataforma mentria.ai ofrece decks de aprendizaje; el modelo puede generar explicaciones y responder preguntas sobre el contenido con latencia de primera palabra de 1,62 s y 88,3 tok/s en un M4 Pro.
- Procesamiento de imagenes en cliente: con la torre ViT de 210 MB se pueden describir capturas, diagramas o documentos escaneados directamente en el navegador, util para herramientas de accesibilidad o extraccion de informacion sin subida de ficheros.
- Evaluacion de modelos ternarios en investigacion: el formato mentria-q2g128-v1 y la validacion teacher-forced contra llama.cpp permiten estudiar el impacto de la cuantizacion ternaria con rotacion de Hadamard en un transformer hibrido con capas Gated-DeltaNet.
- Extensiones y automatizaciones locales: la plataforma permite anadir extensiones propias; el modelo puede alimentar flujos de resumen, reescritura o clasificacion de texto que se ejecutan integramente en el dispositivo.
- Despliegue en hardware sin GPU dedicada: al ocupar ~1,35 GB en total y ejecutarse sobre WebGPU, es adecuado para portatiles y equipos de gama media donde no cabe una cuantizacion Q4 de un modelo mayor.

## Benchmarks y rendimiento

Protocolo declarado: decodificacion greedy, thinking desactivado, sin system prompt, sin penalizacion de repeticion, contexto de 2.048 tokens, dawn.node sobre Apple M4 Pro. Las diferencias son Bonsai menos Q4 en puntos, con intervalos bootstrap del 95% y test exacto de McNemar sobre respuestas emparejadas.

| Benchmark (n) | Q4 Qwen3.5-2B | Ternary-Bonsai-2-4B | Diferencia (IC 95%) | p |
|---|---:|---:|---|---:|
| GSM8K (1.319) | 73,1% | 89,8% | +16,7 (14,4; 19,0) | < 0,001 |
| IFEval, prompt-level strict (541) | 64,7% | 76,9% | +12,2 (7,9; 16,5) | < 0,001 |
| MMLU-Redux (1.140) | 59,5% | 70,1% | +10,6 (7,7; 13,6) | < 0,001 |

Pilot adicional contra los mismos pesos Q4 ejecutados en MLX (197 items): GSM8K +15, IFEval +18, MMLU-Redux 0 puntos.

Pilot de chat: 20 prompts dificiles en ingles, espanol, portugues BR, frances y japones, ambos ordenes, juez ciego Claude Opus; la respuesta de Bonsai 2 4B fue preferida el 83,8% de las veces (IC 95% 68-96). El test completo de 650 prompts no se ejecuto para este par.

Velocidad en mentria-engine (Mac, Apple M4 Pro, Chrome):

| Metrica | Q4 Qwen3.5-2B | Ternary-Bonsai-2-4B |
|---|---:|---:|
| Decodificacion con prompt de 512 tokens | 59,7 tok/s | 88,3 tok/s |
| Primera palabra con prompt de 512 tokens | 0,70 s | 1,62 s |

El modelo muestra la primera palabra mas tarde en prompts largos pero escribe 1,48x mas rapido, de modo que las respuestas realistas de chat terminan entre un 12% y un 28% antes. Cada aceleracion del motor es exacta: en cada dispositivo, los kernels rapidos producen salida bit a bit identica a la ruta de referencia, comprobado al cargar el modelo.

## Requisitos de hardware

- VRAM/almacenamiento: ~1,14 GB para el modelo de lenguaje y ~210 MB para la torre de vision, mas ~12 MB de tokenizer; el repo completo ocupa 1,4 GB.
- Al ser un runtime WebGPU, la memoria se asigna en el dispositivo del navegador; no requiere CUDA ni drivers propietarios.
- GPU recomendadas: no disponibles como lista oficial; la model card solo documenta mediciones en Apple M4 Pro con Chrome.
- Cabe en GPU de consumo: si, siempre que el navegador exponga WebGPU con suficiente memoria de dispositivo para ~1,35 GB de pesos; no se especifican modelos concretos de consumer GPU.
- Opciones de despliegue: mentria-engine (WebGPU) es el runtime soportado; el modelo base prism-ml/Ternary-Bonsai-2-4B-gguf puede ejecutarse en llama.cpp como referencia. No se documenta soporte para vLLM, TGI, Ollama ni MLX con este formato.
- Latencia y throughput documentados: 88,3 tok/s de decodificacion y 1,62 s hasta la primera palabra con prompt de 512 tokens en Apple M4 Pro bajo Chrome.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | IFEval | MMLU-Redux | Licencia | Formato |
|---|---|---:|---:|---:|---:|---|---|
| Ternary-Bonsai-2-4B-mentria | 4B (ternario, ~2,13 bits/peso) | no disponible (pruebas a 2.048) | 89,8% | 76,9% | 70,1% | Apache 2.0 | safetensors mentria-q2g128-v1 |
| Qwen3.5-2B (Q4, conversion de mentria) | 2B (4 bits) | no disponible (pruebas a 2.048) | 73,1% | 64,7% | 59,5% | Apache 2.0 (upstream) | safetensors Q4 |
| Qwen3.5-2B-mentria | 2B (Q4) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | safetensors |
| prism-ml/Ternary-Bonsai-2-4B-gguf | 4B (ternario) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 (upstream) | GGUF |

La comparativa directa solo esta documentada frente a Qwen3.5-2B en cuantizacion Q4 y en el pilot con MLX; no se han publicado resultados frente a otros modelos de 4B en la informacion disponible.

## Limitaciones y advertencias

- Idioma declarado: solo ingles en los metadatos del modelo; el rendimiento multilingue se limita a un pilot de 20 prompts y no a una evaluacion completa.
- Longitud de contexto maxima no documentada; todos los benchmarks y mediciones de velocidad usan 2.048 tokens, por lo que no hay garantias de comportamiento mas alla de esa ventana.
- Riesgo de alucinacion inherente a un modelo de 4B cuantizado en ternario; no se han publicado tasas de factualidad ni evaluaciones de calibracion.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3.5-4B hereda los sesgos de su dataset de entrenamiento, no descritos en la informacion disponible.
- Dependencia de un runtime propietario: el formato mentria-q2g128-v1 solo lo consume mentria-engine; fuera de ese motor no hay soporte documentado para safetensors, y el uso en llama.cpp requiere el GGUF upstream.
- La validacion de correctitud se limita a 433 posiciones teacher-forced y cuatro prompts greedy comparados con llama.cpp; no cubre todos los casos de uso.
- El pilot de chat usó un juez automatico (Claude Opus) sobre 20 prompts; el test completo de 650 prompts no se ejecuto.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la cadena de licencias upstream (Qwen3.5-4B y prism-ml) antes de produccion.
- El estado de despliegue en mentria.ai se describe como "rollout en curso" en la fecha de actualizacion (2026-10-28); el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/mentriaai/Ternary-Bonsai-2-4B-mentria
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Modelo upstream Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo al que sustituye: https://huggingface.co/mentriaai/Qwen3.5-2B-mentria
- Modelo con la misma torre de vision: https://huggingface.co/mentriaai/Qwen3.5-4B-mentria
- Plataforma: https://mentria.ai
