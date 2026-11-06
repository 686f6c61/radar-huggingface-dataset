# primitive-ai/Ripple-65B-Preview-NVFP4A16

## Resumen

Ripple-65B-Preview-NVFP4A16 es una cuantización de 4 bits del modelo Ripple-65B-Preview de ricursiveAI, publicada por primitive-ai. Se trata de un transformer decoder-only de 64.782.689.360 parámetros (aproximadamente 64,8 mil millones) orientado a razonamiento, uso agéntico y generación de código, con una ventana de contexto declarada de 2.097.152 posiciones. El build reduce el peso de 129,57 GB en BF16 a 37,92 GB mediante cuantización NVFP4 en pesos (E2M1 con escala E4M3 por cada 16 valores y escala global FP32) manteniendo las activaciones en BF16, incluidas las capas de atención.

La relevancia de esta ficha es doble. Por un lado, demuestra que un modelo de 65B puede servirse en una única GPU de 96 GB con un pool de KV de 251.501 tokens a una ventana de 32.768 posiciones. Por otro, expone una dependencia crítica: ninguna versión publicada de vLLM soporta todavía esta arquitectura, por lo que requiere aplicar el pull request vllm-project/vllm#65745 sobre un nightly concreto.

El autor reporta una degradación de +14,63×10⁻³ nats por token frente a BF16, con un 96,5% de coincidencia top-1, y unas puntuaciones de conocimiento de 90,3, tool calling de 84,6 y abstención de 56,7 sobre sus propias suites internas. Estos datos proceden exclusivamente de la model card y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles internos no disponibles); pesos cuantizados con compressed-tensors |
| Parametros totales | 64.782.689.360 (64,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2.097.152 posiciones declaradas; 131.072 configuradas en el ejemplo de despliegue; métricas medidas a 32.768 |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos E2M1 con escala E4M3 por bloque de 16 y escala global FP32; activaciones BF16). Embeddings, LM head, norms, Q/K norms por cabeza y escalares de value-residual en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), 37,9 GB de repo |
| Libreria de inferencia | vLLM (requiere PR #65745 sobre nightly-a2bcb5657a88) |
| Modelo base | ricursiveAI/Ripple-65B-Preview |
| Fecha de publicacion | 2026-11-05 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer decoder-only con capas de atención cuantizables de forma independiente y normas Q/K por cabeza, además de escalares de value-residual. La presencia de estos elementos sugiere una atención con normalización por cabeza y algún mecanismo de residual sobre los valores, pero no se especifica si emplea atención lineal, decodificación especulativa ni técnicas híbridas SSM. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento en el modelo base.

La innovación técnica de este build es la estrategia de cuantización: NVFP4 en todos los Linear del decoder, incluidas las capas de atención (que en el NVFP4 de Ricursive permanecen en BF16), con activaciones BF16. El autor reporta que esta configuración ocupa 37,92 GB frente a 57,22 GB del NVFP4 de Ricursive y 65,85 GB del FP8, a costa de una mayor deriva (+14,63×10⁻³ nats/token frente a +5,49 y +1,72 respectivamente). El modelo abre automáticamente un bloque `<think>` y la plantilla de chat no expone un interruptor para desactivarlo.

## Capacidades

- Generación de texto conversacional con modo de razonamiento explícito (`<think>`), separado por el parser `ripple` de vLLM.
- Razonamiento multi-paso y resolución de problemas aritméticos (el ejemplo de la model card devuelve `391` para `17*23`).
- Tool calling / function calling con parser dedicado (`--tool-call-parser ripple`) y elección automática de herramienta (`--enable-auto-tool-choice`); el ejemplo devuelve `get_weather {"city": "Lisbon"}`.
- Uso agéntico: la model card etiqueta el modelo con `agentic` y reporta una suite de 200 ítems de tool calling.
- Generación de código: etiqueta `coding` presente en los tags del repo.
- Capacidad de abstención: suite específica de 56,7 puntos, lo que indica cierto entrenamiento para no responder cuando no procede.
- Multilingüe: limitado a inglés según el campo `language`.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente de razonamiento en producción con presupuesto de VRAM ajustado: el build cabe en una sola GPU de 96 GB (RTX PRO 6000 Blackwell) con 36,09 GiB de pesos cargados y un pool de KV de 497.045 tokens a 131.072 posiciones, lo que permite servir conversaciones largas sin tensor parallelism.
- Automatización de tool calling en backends de agentes: con `--enable-auto-tool-choice` y el parser `ripple`, el modelo emite llamadas estructuradas como `get_weather {"city": "Lisbon"}`, adecuadas para orquestadores que encadenan APIs externas.
- Generación de código asistida en pipelines de CI/CD: la etiqueta `coding` y el modo de razonamiento permiten integrarlo en revisiones automáticas o generación de parches, siempre que el pipeline tolere la deriva de cuantización (+14,63×10⁻³ nats/token) y valide la salida.
- Despliegue en una sola tarjeta para prototipado e investigación: al evitar tensor parallelism, reduce la complejidad operativa frente al BF16, que requiere dos GPUs y no tiene fila de una sola tarjeta en la comparativa del autor.
- Servicio de chat multi-turno con contexto largo: la ventana declarada de 2.097.152 posiciones y el pool de KV de 251.501 tokens a 32.768 posiciones permiten mantener historiales extensos, aunque las métricas solo se validaron hasta 32K.
- Evaluación comparativa de técnicas de cuantización: el repo incluye métricas de deriva, acuerdo top-1 y throughput frente a BF16, NVFP4 de Ricursive y FP8, útil como referencia para estudios de compresión.
- Razonamiento con abstención controlada: la puntuación de 56,7 en la suite de abstención lo hace candidato para flujos donde responder incorrectamente es costoso, como soporte técnico de primer nivel con escalado a humano.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, medidos en una RTX PRO 6000 Blackwell de 96 GB sin tensor parallelism, KV cache en BF16, `temperature 0.6` / `top_p 0.95` / `top_k 20`, presupuesto de 16.384 tokens y concurrencia 32. La suite de conocimiento tiene 1.170 ítems y la de tool calling 200 ítems; el throughput es 8K de entrada / 512 de salida sin prefix cache.

| Build | Formato | Tamano | Drift (×10⁻³ nats/token) | Top-1 | Knowledge | Tool call | Abstain | Finished | tok/s @1 | tok/s @32 | KV pool |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ripple-65B-Preview BF16 | BF16 | 129,57 GB | 0 (referencia) | 100% | 90,5 | 86,2 | 56,7 | 99,4% | n/a | n/a | n/a |
| Ricursive NVFP4 | NVFP4 W4A4 MLP, atención BF16 | 57,22 GB | +5,49 | 97,3% | 90,4 | 85,4 | 58,3 | 99,4% | 21,0 | 180 | 157.351 |
| FP8 | FP8 W8A8, todos los Linear | 65,85 GB | +1,72 | 98,6% | 91,0 | 85,4 | 61,7 | 99,3% | 18,0 | 138 | 118.546 |
| Este repo | NVFP4 W4A16, todos los Linear | 37,92 GB | +14,63 | 96,5% | 90,3 | 84,6 | 56,7 | 99,4% | 26,3 | 110 | 251.501 |

El error estándar de la deriva sobre 400 trazas (185.735 tokens de completion) es de 0,66 para este build. Tool calling se midió con 3 ejecuciones por build y conocimiento con 1. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 37,92 GB de pesos en disco; en ejecución el autor reporta 36,09 GiB de pesos cargados con `--gpu-memory-utilization 0.92`.
- GPU probada: una RTX PRO 6000 Blackwell de 96 GB (sm_120). No se han probado otras GPU.
- Cabe en GPU consumer: no hay datos que lo confirmen; 37,92 GB de pesos exceden la VRAM de una RTX 4090 (24 GB) y quedan al límite de una RTX 5090 (32 GB) sin margen para KV cache.
- Despliegue: exclusivamente vLLM con la imagen `vllm-ripple:pr65745`, construida aplicando el PR vllm-project/vllm#65745 sobre el nightly `nightly-a2bcb5657a88`. No hay soporte en llama.cpp, Ollama ni TGI según la información disponible.
- Arranque: 191 s en una tarjeta inactiva con los flags del ejemplo.
- Throughput: 26,3 tok/s en single-stream y 110 tok/s a concurrencia 32; el NVFP4 de Ricursive alcanza 180 tok/s a concurrencia 32, por lo que este build prioriza tamaño y pool de KV sobre throughput máximo.
- Pool de KV: 497.045 tokens a 131.072 posiciones de ventana y 251.501 tokens a 32.768 posiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| primitive-ai/Ripple-65B-Preview-NVFP4A16 | 64,8B | 2.097.152 | NVFP4 W4A16, 37,92 GB | apache-2.0 | Hugging Face, requiere PR de vLLM |
| ricursiveAI/Ripple-65B-Preview | 64,8B | 2.097.152 | BF16, 129,57 GB | apache-2.0 (segun modelo base) | Hugging Face |
| ricursiveAI/Ripple-65B-Preview-NVFP4 | 64,8B | 2.097.152 | NVFP4 W4A4 MLP, atención BF16, 57,22 GB | apache-2.0 | Hugging Face |
| primitive-ai/Ripple-65B-Preview-FP8 | 64,8B | 2.097.152 | FP8 W8A8, 65,85 GB | apache-2.0 | Hugging Face |

No se dispone de información sobre modelos comparables de otros autores con el mismo tamaño y tarea en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia de software no publicada: ninguna versión de vLLM soporta la arquitectura; es obligatorio aplicar el PR #65745 sobre un nightly concreto y construir la imagen manualmente.
- Mayor deriva que las alternativas: +14,63×10⁻³ nats/token frente a +5,49 del NVFP4 de Ricursive y +1,72 del FP8, con un acuerdo top-1 del 96,5%.
- Menor throughput a concurrencia alta que el NVFP4 de Ricursive (110 frente a 180 tok/s a concurrencia 32).
- Cobertura de evaluación limitada: solo se probó una GPU (RTX PRO 6000 Blackwell) y solo hasta 32.768 posiciones, pese a la ventana declarada de 2.097.152.
- Idiomas: únicamente inglés; no se documenta soporte de castellano.
- Modo de razonamiento no desactivable: el modelo abre su propio bloque `<think>` y la plantilla de chat no ofrece interruptor, lo que incrementa el consumo de tokens en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad independientes; la puntuación de abstención de 56,7 indica que aproximadamente la mitad de los casos ambiguos no se resuelven con una negativa.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Licencia apache-2.0 permite uso comercial, pero la obligación de aplicar un PR no fusionado traslada el riesgo de mantenimiento al operador.
- La model card está truncada en el apartado de comparativas, por lo que parte de las métricas internas del autor no son verificables en el texto disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/primitive-ai/Ripple-65B-Preview-NVFP4A16
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Cuantización NVFP4 de Ricursive: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Cuantización FP8 de primitive-ai: https://huggingface.co/primitive-ai/Ripple-65B-Preview-FP8
- Pull request de soporte en vLLM: https://github.com/vllm-project/vllm/pull/65745
- Sitio del autor: https://primitive.com
