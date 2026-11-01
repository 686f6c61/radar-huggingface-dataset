# auRose94/GLM-4.5-Air-iq4nl-GGUF

## Resumen

GLM-4.5-Air-iq4nl-GGUF es una cuantización en formato GGUF (tipo IQ4_NL) del modelo GLM-4.5-Air desarrollado por Z.ai (Zhipu AI). El modelo base es un transformer de mezcla de expertos (MoE) de gran escala, pensado para ofrecer un equilibrio entre capacidad de razonamiento, generación de código y eficiencia de inferencia, siendo la variante "Air" la opción más ligera de la familia GLM-4.5.

Esta cuantización, publicada por el usuario auRose94, reduce el tamaño del modelo hasta 63,5 GB en el repositorio, haciéndolo ejecutable en hardware de gama alta de consumo o estaciones de trabajo con memoria unificada. El autor indica que se trata de una cuantización "stock", compatible con builds actuales de llama.cpp, Ollama y LM Studio sin necesidad de runtimes personalizados, con los tensores de embedding y la cabeza de salida en Q8_0.

El modelo es relevante porque acerca un MoE de más de 100 mil millones de parámetros a entornos de inferencia local, manteniendo según el autor un rendimiento prácticamente idéntico a la cuantización Q8_0 en pruebas de código, con soporte de decodificación especulativa y, en configuraciones avanzadas, contextos muy largos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-4.5-Air, base de zai-org) |
| Parametros totales | 110.468.824.832 (~110,5 B) |
| Parametros activos | no disponible (el modelo base es MoE; el dato no figura en la información proporcionada) |
| Longitud de contexto | 128k en el modelo base; hasta ~700k tokens con KV cache digitalizado según el fork "ninths" del autor (no verificado de forma independiente) |
| Tipos de cuantizacion | IQ4_NL (pesos), Q8_0 (embeddings y cabeza de salida); KV cache opcional k9_4kv (~4,25 bits/elemento) en el fork del autor |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, GLM-4.5-Air de Z.ai, es un transformer de mezcla de expertos (MoE): contiene un número elevado de parámetros totales (unos 110 mil millones según los metadatos de safetensors) pero activa solo una fracción de ellos por token, lo que reduce el coste computacional por token manteniendo la capacidad del modelo completo. La geometría de KV cache indicada por el autor (47 capas × 8 cabezas KV × 128 dimensiones) es coherente con una arquitectura MoE con agrupación de consultas (GQA).

Sobre el entrenamiento del modelo base (número de tokens, composición del corpus, RLHF/DPO) no se han proporcionado datos en la información disponible. En cuanto a la cuantización, el autor describe un proceso determinista: los pesos provienen de un contenedor "channel-coded" de 73,45 GiB (build "ninths K9"), y se materializan a IQ4_NL mediante un empaquetador RTN por bloques de 32, verificado byte a byte contra el materializador del fork. Los tensores de embedding y salida se mantienen en Q8_0 para preservar la fidelidad en la capa de vocabulario.

## Capacidades

- Generación de texto general y razonamiento, heredadas del modelo base GLM-4.5-Air.
- Generación de código: el autor reporta 22/24 tareas correctas en una batería propia de 24 tareas de código Godot-4 con decodificación greedy.
- Decodificación especulativa auto-especulativa (`--spec-type draft-mtp` en llama.cpp), con ~28,9 tok/s sostenidos y 55% de aceptación de borrador según mediciones del autor.
- Contexto largo: hasta ~700k tokens de contexto vivo en el fork del autor con KV cache digitalizado (requiere el fork "ninths", no el llama.cpp estándar).
- Compatibilidad con runtimes estándar: llama.cpp, Ollama y LM Studio sin modificaciones.
- Soporte de tool calling, agentes y capacidades multilingües: dependen del modelo base; no se detallan en la información proporcionada.

## Casos de uso

- Generación de código en local: con 22/24 tareas resueltas en la batería de código del autor, es adecuado para asistentes de programación que ejecutan íntegramente en una estación de trabajo, sin enviar código propietario a APIs externas.
- Asistentes conversacionales autoalojados: la arquitectura MoE permite latencias razonables (~25,8 tok/s en hardware de memoria unificada) para chat multi-turno con respuestas largas.
- Procesamiento de documentos extensos: la opción de contexto largo (~700k tokens con el fork del autor) permite resumir o analizar bases de código completas, contratos o corpus documentales de gran tamaño.
- Prototipado y evaluación de modelos grandes en local: la compatibilidad con llama.cpp, Ollama y LM Studio facilita pruebas rápidas sin infraestructura de servidor.
- Generación por lotes con alto throughput: los 142 tok/s de evaluación de prompt medidos por el autor lo hacen viable para indexación semántica o preprocesamiento masivo de texto.
- Investigación en cuantización y caches KV: el repositorio documenta un enfoque de KV cache digitalizado a ~4,25 bits/elemento, útil como referencia para reducir el coste de memoria de contextos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos son mediciones propias del autor, no comparables directamente con benchmarks públicos:

| Métrica | Valor (según el autor) |
|---|---|
| Batería de código Godot-4 (24 tareas, greedy) | 22/24 (igual que materialización Q8_0 del contenedor padre) |
| Generación sostenida con decodificación especulativa | ~28,9 tok/s (55% aceptación de borrador) |
| Generación con residencia completa en GPU | ~25,8 tok/s |
| Evaluación de prompt | 142 tok/s |
| Carga del modelo | ~30 s |
| Hardware de medición | AMD Ryzen AI Max+ 395 (Radeon 8060S, 96 GB unificados) |

## Requisitos de hardware

- VRAM/memoria estimada: ~59 GiB para residencia completa en GPU según el autor; el archivo GGUF ocupa 63,5 GB en disco.
- GPU recomendadas: el autor lo ejecuta en un AMD Ryzen AI Max+ 395 con 96 GB de memoria unificada (Radeon 8060S). En NVIDIA, una configuración equivalente requeriría del orden de 64 GB de VRAM (por ejemplo, A100 80 GB, H100, o RTX 6000 Ada 48 GB con offload parcial a CPU).
- Consumer GPUs: no cabe íntegramente en una RTX 4090 (24 GB); sería necesario offload de capas a CPU/RAM, con penalización de velocidad. Sí es viable en sistemas con memoria unificada de 96 GB (Ryzen AI Max+ 395, Mac Studio con 96 GB o más vía llama.cpp).
- Opciones de despliegue: llama.cpp (build actual; con `--spec-type draft-mtp` para decodificación especulativa), Ollama, LM Studio. El contexto de ~700k tokens requiere el fork "ninths" del autor, no el llama.cpp estándar.
- Throughput estimado: ~25,8 tok/s de generación y 142 tok/s de prompt eval en el hardware de referencia del autor; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.5-Air (base, zai-org) | ~110,5 B | no disponible (MoE) | 128k | MIT | GGUF, safetensors |
| GLM-4.5-Air-iq4nl-GGUF (esta ficha) | ~110,5 B | no disponible | 128k (hasta ~700k con fork del autor) | MIT | GGUF IQ4_NL, 63,5 GB |
| Qwen3-30B-A3B | 30 B | 3 B | 32k+ | Apache 2.0 | GGUF, safetensors |
| Llama 4 Scout | 109 B | 17 B | 10M | Licencia Llama 4 (restricciones) | safetensors |

Nota: la comparativa se basa en datos públicos conocidos de los modelos alternativos; los valores exactos de rendimiento en benchmarks comunes no están disponibles en la información proporcionada para esta cuantización.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; hereda los sesgos del modelo base GLM-4.5-Air, no documentados en la información proporcionada.
- Riesgo de alucinación: inherente a todo LLM; no hay evaluaciones específicas de alucinación para esta cuantización.
- Cuantización a 4 bits: aunque el autor reporta paridad con Q8_0 en su batería de código, la cuantización IQ4_NL puede degradar tareas sensibles a precisiones finas (matemáticas complejas, idiomas minoritarios); conviene validar en cada caso de uso.
- Contexto extendido de ~700k tokens: requiere un fork específico ("ninths") no integrado en llama.cpp oficial; con runtimes estándar el contexto efectivo es el del modelo base.
- Requisitos de memoria muy elevados: 63,5 GB en disco y ~59 GiB en GPU excluyen la mayoría de equipos de consumo; el offload a CPU reduce drásticamente el throughput.
- Licencia MIT: permite uso comercial sin restricciones significativas, incluida la redistribución con atribución del aviso de licencia.
- Métricas de rendimiento: todas las cifras de velocidad y calidad provienen del autor del repositorio y no han sido verificadas de forma independiente.
- Descargas y adopción reducidas (532 descargas, 0 likes en el momento de la ficha): repositorio de un usuario individual, sin respaldo oficial de Z.ai.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/auRose94/GLM-4.5-Air-iq4nl-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.5-Air
- Contenedor padre mencionado por el autor: https://huggingface.co/auRose94/GLM-4.5-Air-ninths-k63-e99-GGUF (referenciado en la model card; no se ha verificado su disponibilidad)
- Paper, blog oficial o demos: no disponibles en la información proporcionada.
