# hecan3d/QwenDGAF-Coder-3B

## Resumen

QwenDGAF-Coder-3B (subtitulado "Lead Burnout Edition") es un ajuste fino del modelo Qwen/Qwen2.5-Coder-3B-Instruct desarrollado por el usuario hecan3d. Se trata de un modelo satírico de asistencia a la programación que adopta la personalidad de un "lead developer" cínico y agotado: responde con el mínimo código funcional posible, sin floritura conversacional, y rechaza explícitamente peticiones que considera fuera de alcance (por ejemplo, diseñar microservicios completos desde cero). El objetivo declarado es reducir drásticamente el número de tokens generados frente a un asistente convencional, manteniendo la corrección técnica.

La base es un transformer decoder-only de 3.085.938.688 parámetros (Qwen2.5-Coder-3B-Instruct), afinado mediante QLoRA de 4 bits con Unsloth sobre un dataset propio (`qwendgaf-coder-v2.jsonl`) que mezcla revisiones de código mordaces, refactorizaciones, explicaciones de bugs y diálogo conversacional con tono "DGAF". La longitud de contexto usada durante el entrenamiento fue de 1024 tokens, muy inferior a la ventana nativa del modelo base.

Su relevancia práctica es acotada pero concreta: demuestra un caso de ajuste de estilo y verbosidad sobre un modelo pequeño, con distribuciones GGUF listas para ejecutarse en hardware modesto (el autor entrenó con una GTX 1070 de 8 GB) y un consumo de VRAM bajo en cuantización Q4_K_M. Es un artefacto orientado a humor, sátira y experimentación, no a producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste QLoRA sobre Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (contexto de entrenamiento declarado); ventana nativa del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (~6,1 GB), Q8_0 (~3,3 GB), Q6_K (~2,6 GB), Q4_K_M (~1,95 GB) |
| Idiomas soportados | Ruso, ingles, chino (segun la model card); etiquetas de idioma de Hugging Face no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria `gguf`); pesos safetensors no publicados en el repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,09 mil millones de parametros. Sobre esa base se aplico un ajuste QLoRA en 4 bits con Unsloth Studio, con rango 16, alpha 32 y modulos `all-linear`, es decir, adaptadores de bajo rango inyectados en todas las capas lineales. El entrenamiento se realizo en una unica NVIDIA GeForce GTX 1070 de 8 GB, lo que explica en parte la restriccion de contexto a 1024 tokens.

El dataset de ajuste (`qwendgaf-coder-v2.jsonl`) combina revisiones de codigo con tono toxico y desganado, ejemplos de refactorizacion, explicaciones de bugs en texto plano y dialogo conversacional con la personalidad "DGAF". No se documentan volumen de tokens, composicion porcentual del dataset, ni fases de RLHF o DPO posteriores; tampoco se mencionan innovaciones arquitectonicas adicionales (no hay decodificacion especulativa, atencion lineal ni modulos híbridos). La personalidad y la concision estan, segun el autor, "cocidas" en los pesos, de modo que no requieren system prompt.

## Capacidades

- Generacion de codigo concisa en Python, Go, JavaScript/TypeScript, C++, SQL y Bash, segun la model card.
- Deteccion de antipatrones: complejidad cuadratica por bucles anidados (`O(N*M)`), argumentos por defecto mutables (`cart=[]`), excepciones no gestionadas.
- Refactorizacion algorítmica: sustitucion de bucles anidados por busquedas hash con `dict`/`set`.
- Explicacion de bugs clasicos de Python con el idioma correcto en pocas lineas.
- Generacion de estilo conversacional con personalidad cínica y humor de desarrollador (roleplay).
- Rechazo deliberado de peticiones de alcance amplio (por ejemplo, microservicios completos con gRPC, Redis y Prometheus), redirigiendo a documentacion o a contratar ingenieros.
- Multilingue en ruso, ingles y chino, con ejemplos de generacion en ruso en la model card.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo "thinking" explicito; al heredar de Qwen2.5-Coder-3B-Instruct podria conservar parte del formato de chat del base, pero la informacion disponible no lo confirma.

## Casos de uso

- Revision de codigo en pull requests: el modelo detecta antipatrones concretos (bucles anidados, defaults mutables) y devuelve el idioma corregido en pocas lineas, lo que encaja en comentarios automatizados de CI con presupuesto de tokens ajustado.
- Refactorizacion puntual de funciones: dado un fragmento con complejidad cuadratica, propone la version con busqueda hash sin anadir explicaciones largas, util para herramientas de "quick fix" en el IDE.
- Explicacion de bugs docentes: sirve para demostrar por que `def add_to_cart(item, cart=[])` comparte estado entre llamadas, con una respuesta directa y sin rodeos, adecuada en materiales de formacion interna.
- Asistente de terminal de bajo consumo: con Q4_K_M (~1,95 GB) puede desplegarse en Ollama o llama.cpp en portatiles y GPUs de gama baja para consultas rapidas de sintaxis o correccion de snippets.
- Generacion de codigo boilerplate minimo: para scripts de suma, parsing simple o utilidades de una sola funcion, produce salidas de dos o tres lineas que reducen coste de inferencia y latencia.
- Filtro de peticiones fuera de alcance: integrado en un bot interno, rechaza peticiones de "construirme una plataforma entera" y redirige al usuario a documentacion, reduciendo carga sobre modelos mayores.
- Experimentacion con ajuste de estilo y verbosidad: sirve como referencia para estudiar como un QLoRA de rango 16 sobre un modelo de 3B modifica tono y longitud de respuesta sin degradar demasiado la correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente compara cualitativamente la salida del modelo base frente al ajustado en cuatro ejemplos (suma de dos numeros, optimizacion de bucle anidado, bug de default mutable y peticion de microservicio), sin metricas numericas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,95 GB en Q4_K_M, ~2,6 GB en Q6_K, ~3,3 GB en Q8_0 y ~6,1 GB en bf16 (pesos; anades overhead de contexto KV, pequeno por la ventana de 1024 tokens).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; una GTX 1070 de 8 GB fue suficiente para el entrenamiento QLoRA y es holgada para inferencia cuantizada. Para bf16 se recomienda 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Cabe en GPU de consumo: si, en Q4_K_M y Q6_K en GPUs de 4-6 GB; en Q8_0 en 6-8 GB; en bf16 en 8 GB o superior.
- Opciones de despliegue: llama.cpp (`llama-cli -hf hecan3d/QwenDGAF-Coder-3B:Q4_K_M --jinja`), Ollama (`ollama run hf.co/hecan3d/QwenDGAF-Coder-3B:Q4_K_M`), y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la informacion disponible para este repo GGUF.
- Latencia y throughput: no disponibles. El autor afirma generacion "notablemente rapida" por la brevedad de las salidas (max tokens recomendado 256-512), pero sin cifras medidas.
- Ajustes de inferencia recomendados por el autor: system prompt vacio, temperatura 0,6-0,7, repetition penalty 1,1-1,15, max tokens 256-512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QwenDGAF-Coder-3B | 3,09 B | 1024 (entrenamiento) | Apache 2.0 | GGUF | Ajuste satirico de estilo; salidas muy breves |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | No disponible en la informacion proporcionada | Apache 2.0 | Safetensors y GGUF | Asistente estandar, respuestas mas verbosas y con disclaimers |
| QwenDGAF-Coder-2-3B | No disponible | No disponible | No disponible | No disponible | Version previa de la misma serie, referenciada como `new_version` en la model card |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Sesgos y tono: el modelo usa lenguaje sin filtro y humor cinico de desarrollador; puede resultar ofensivo o inapropiado en entornos corporativos o con usuarios finales.
- Alucinacion: al ser un ajuste de estilo sobre un modelo de 3B, mantiene el riesgo de errores factibles en codigo y explicaciones; la model card advierte explicitamente de revisar el codigo generado antes de desplegarlo en produccion.
- Contexto limitado: 1024 tokens de entrenamiento, insuficiente para ficheros grandes, revisiones multi-archivo o conversaciones largas; el modelo base soporta ventanas mayores, pero el ajuste no fue entrenado para ellas.
- Idiomas: solo ruso, ingles y chino declarados; el castellano no figura entre los idiomas soportados y el rendimiento en espanol no esta documentado.
- Rechazo de tareas: por diseno, rechaza peticiones de sistemas completos o arquitecturas de varios servicios, lo que lo inutiliza como asistente generalista de proyecto.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el contenido satirico y el tono pueden incumplir politicas internas de empresa o de plataformas; la responsabilidad recae en el integrador.
- Sin datos de evaluacion: no hay benchmarks publicados, por lo que no se puede cuantificar la degradacion de capacidad respecto al modelo base.
- Formato: solo se distribuyen pesos GGUF; no hay safetensors publicados en el repo, lo que limita el reajuste fino o el despliegue en stacks que requieran pesos completos.
- Fecha de creacion futura (2026-10-17) en los metadatos de Hugging Face, atipica y a verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hecan3d/QwenDGAF-Coder-3B
- Autor: https://huggingface.co/hecan3d
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Nueva version referenciada: https://huggingface.co/hecan3d/QwenDGAF-Coder-2-3B
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
