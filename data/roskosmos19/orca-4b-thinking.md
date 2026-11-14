# roskosmos19/Orca-4B-Thinking

## Resumen

Orca-4B-Thinking es un modelo de lenguaje causal de 4.022.468.096 parametros (3.600 millones no-embedding), derivado mediante fine-tuning del modelo base Qwen/Qwen3.5-4B. Lo publica el usuario roskosmos19 en Hugging Face, con una model card que atribuye el desarrollo a "Whale AI" y que mezcla referencias a Whale-4B-Thinking y a Qwen3-4B-Thinking-2507. El modelo esta especializado en razonamiento de cadena de pensamiento (chain-of-thought) al estilo DeepSeek-R1: genera trazas de pensamiento largas, estructuradas y con auto-verificacion antes de emitir la respuesta final.

El problema que aborda es el razonamiento profundo en un presupuesto de parametros muy contenido (4B), lo que permite desplegarlo en hardware modesto manteniendo trazas de pensamiento extensas. Su arquitectura es un transformer decoder-only con 36 capas y atencion GQA (32 cabezas de query, 8 de KV), con una longitud de contexto declarada de 262.144 tokens nativos, pensada para acomodar razonamientos muy largos sin truncar.

Es relevante ahora porque combina tres tendencias: destilacion de trazas de razonamiento de modelos mayores (DeepSeek-R1) sobre modelos pequenos, modo "thinking" puro sin modo chat directo, y contexto extremadamente largo en un modelo que cabe en GPUs de consumo. No obstante, la ficha debe leerse con cautela: la model card contiene inconsistencias (nombres de modelo, enlaces y benchmarks estimados en lugar de medidos) que se detallan en las secciones correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, GQA (32 query heads, 8 KV heads), 36 capas |
| Parametros totales | 4.022.468.096 (4.0B; 3.6B no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos (segun model card) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, de, es, fr, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 8.1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal con 36 capas, atencion por grupos de consultas (GQA) con 32 cabezas de query y 8 de KV, y 4.000 millones de parametros totales (3.600 millones excluyendo embeddings). Se apoya en la arquitectura de Qwen3.5-4B (referida en la model card como Qwen3-4B-Thinking) y conserva su ventana de contexto nativa de 262.144 tokens. El chat template inyecta automaticamente el bloque de pensamiento, de modo que el modelo opera exclusivamente en modo thinking; la salida final aparece tras el token de cierre `</think>`.

El entrenamiento descrito consiste en SFT continuado mas optimizacion de preferencias sobre dos conjuntos de datos de trazas de razonamiento destiladas de DeepSeek-R1: open-thoughts/OpenThoughts-114k (114.000 trazas de matematicas, ciencia, codigo y puzzles) y open-r1/Mixture-of-Thoughts (350.000 trazas verificadas multidominio). La model card no especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset final, ni los detalles del algoritmo de optimizacion de preferencias (DPO, ORPO u otro). Tampoco documenta tecnicas de decodificacion especulativa ni mecanismos de atencion lineal; la atencion es la estandar de Qwen3 con GQA.

## Capacidades

- Generacion de texto con razonamiento explicito: produce cadenas de pensamiento largas con auto-verificacion, reflexion y exploracion profunda antes de la respuesta final.
- Razonamiento matematico y cientifico de competicion: orientado a problemas tipo AIME, GPQA y MATH, con instruccion recomendada de responder en `\boxed{}`.
- Generacion y razonamiento sobre codigo: entrenado con trazas de codigo de los datasets de destilacion; la model card menciona LiveCodeBench como benchmark objetivo.
- Seguimiento de instrucciones y tool use: la model card afirma mejoras en instruction-following, tool-use y alignment, aunque sin detallar el formato de tool calling ni esquemas soportados.
- Multilinguismo limitado a cinco idiomas declarados: ingles, aleman, espanol, frances y chino.
- Contexto largo: soporte nativo de hasta 262.144 tokens, adecuado para trazas de razonamiento de decenas de miles de tokens.
- Modo thinking unico: no dispone de modo chat directo; el template siempre activa el bloque de razonamiento.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Resolucion de problemas matematicos de competicion: el modelo genera trazas de hasta 80.000 tokens con auto-correccion, lo que permite abordar problemas de olimpiada y benchmarks tipo AIME con verificacion paso a paso antes de emitir la respuesta en formato `\boxed{}`.
- Analisis de codigo y depuracion razonada: con contexto de 262K tokens puede ingerir repositorios o ficheros completos y razonar sobre ellos antes de proponer parches, lo que encaja en pipelines de revision automatizada siempre que se valide la salida.
- Tutoria y explicaciones pedagogicas: al exponer la traza de pensamiento, resulta util para generar explicaciones detalladas de problemas cientificos y matematicos en entornos educativos, mostrando el proceso y no solo el resultado.
- Evaluacion de modelos y generacion de datos sinteticos de razonamiento: sus trazas CoT pueden usarse como material para destilacion posterior o para construir datasets de entrenamiento de modelos menores.
- Razonamiento sobre documentos largos: gracias a la ventana de 262K tokens, puede procesar informes tecnicos, papers o expedientes extensos y razonar sobre ellos de forma integrada, en tareas de analisis documental.
- Experimentacion en investigacion sobre CoT: al ser un modelo pequeno con thinking puro y licencia Apache 2.0, es un banco de pruebas accesible para estudiar dinamicas de cadenas de pensamiento, longitud de traza y auto-verificacion.
- Asistentes tecnicos multilingues en cinco idiomas: puede atender consultas en ingles, aleman, espanol, frances y chino, aunque la calidad por idioma no esta documentada con benchmarks.

## Benchmarks y rendimiento

La model card presenta una tabla de rendimiento, pero los valores de Orca-4B-Thinking estan marcados explicitamente como "geschatzt" (estimados), no medidos. Se reproducen tal cual, con esa advertencia:

| Benchmark | Qwen3-4B-Thinking | Orca-4B-Thinking (estimado) |
|---|---|---|
| AIME25 | 65,6 | 81-83 |
| GPQA | 55,9 | 65-67 |
| LiveCodeBench v6 | 48,4 | 55-57 |
| MATH-500 | no disponible | 90+ |
| IFEval | 81,9 | 87-89 |
| WritingBench | 73,5 | 83+ |

No se han publicado resultados de benchmarks medidos de forma independiente en la informacion disponible; los valores del modelo son estimaciones del autor y deben tratarse como no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8 GB solo para pesos (4.022 millones de parametros), mas cache KV; con contexto completo de 262K tokens la cache KV crece de forma significativa y puede superar ampliamente la VRAM de GPUs de consumo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4-5 GB para pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se distribuyen pesos cuantizados en el repo y habria que generarlos.
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto completo de 262K; RTX 4090 (24 GB) para contexto moderado en BF16; GPUs de 8-16 GB (RTX 4060 Ti, RTX 4070, RTX 4080) viables solo con cuantizacion y contextos reducidos.
- Cabe en GPU de consumo: si, con cuantizacion y ventanas de contexto moderadas; el contexto nativo completo exige hardware de datacenter.
- Opciones de despliegue: vLLM (`--enable-reasoning --reasoning-parser deepseek_r1`), SGLang (`--reasoning-parser deepseek-r1`), transformers; llama.cpp y Ollama no estan documentados para este repo al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles; la generacion de trazas de hasta 32.768-81.920 tokens implica latencias altas por respuesta, especialmente en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orca-4B-Thinking | 4,0B | 262.144 | Thinking puro, CoT estilo DeepSeek-R1 | Apache 2.0 | Hugging Face (38 descargas) |
| Qwen3.5-4B (base) | 4,0B | no disponible en la informacion | Modelo base generalista | no disponible en la informacion | Hugging Face |
| DeepSeek-R1-Distill-Qwen (familia) | 1,5B-7B segun variante | no disponible en la informacion | Destilado de R1 sobre Qwen | no disponible en la informacion | Hugging Face |

La comparacion con alternativas de la misma categoria es limitada porque la informacion proporcionada no incluye especificaciones detalladas de los modelos comparables. Los datos de Qwen3.5-4B y de los destilados de R1 sobre Qwen no estan documentados en el material disponible; la tabla refleja solo lo que consta en la model card y en los metadatos.

## Limitaciones y advertencias

- Inconsistencias de identidad en la model card: el titulo y el ejemplo de codigo usan "Whale-AI/Whale-4B-Thinking", el repositorio real es "roskosmos19/Orca-4B-Thinking", y la citacion menciona Qwen3-4B-Thinking-2507 mientras el metadatos indica Qwen/Qwen3.5-4B. Esto dificulta reproducir exactamente el entrenamiento y debe verificarse antes de usarlo en produccion.
- Benchmarks no medidos: los resultados de rendimiento son estimaciones del autor, no evaluaciones independientes; no deben citarse como cifras verificadas.
- Modo thinking unico: no hay modo chat directo; cada respuesta genera una traza de pensamiento larga, lo que incrementa latencia y coste de inferencia, y complica su uso en conversaciones de baja latencia.
- Riesgo de alucinacion: como todo modelo generativo pequeno, puede producir razonamientos plausibles pero incorrectos; la auto-verificacion no garantiza correccion. Requiere validacion externa en tareas criticas.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad; el modelo hereda sesgos de Qwen3.5-4B y de las trazas destiladas de DeepSeek-R1.
- Limitaciones de idioma: solo cinco idiomas declarados (en, de, es, fr, zh); no hay datos de calidad por idioma y el espanol no esta evaluado especificamente.
- Contexto largo: la ventana de 262K tokens es costosa en memoria y latencia; en hardware de consumo sera necesario truncar o cuantizar.
- Licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a una LICENSE de Whale-AI y la procedencia de los datos de destilacion (trazas de DeepSeek-R1) debe revisarse por posibles condiciones adicionales.
- Madurez: 38 descargas y 1 like en el momento de la consulta; modelo muy poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roskosmos19/Orca-4B-Thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento 1: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset de entrenamiento 2: https://huggingface.co/datasets/open-r1/Mixture-of-Thoughts
- Licencia referenciada en la model card: https://huggingface.co/Whale-AI/Whale-4B-Thinking/blob/main/LICENSE
- Repositorio referenciado en la model card: https://huggingface.co/Whale-AI/Whale-4B-Thinking
- Paper y blog de DeepSeek-R1: no disponible en la informacion proporcionada
- Repositorios de vLLM y SGLang: no disponibles como enlaces en la informacion proporcionada
