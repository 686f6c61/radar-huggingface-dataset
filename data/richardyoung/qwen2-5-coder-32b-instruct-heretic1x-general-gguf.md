# richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-general-GGUF

## Resumen

Qwen2.5-Coder-32B-Instruct-heretic1x-general-GGUF es una compilacion en formato GGUF de un modelo derivado de Qwen2.5-Coder-32B-Instruct, el modelo de codigo de 32.700 millones de parametros de Alibaba Qwen. La variante intermedia (heretic1x-general) aplica una ablacion direccional de rango 1 sobre las direcciones de rechazo generales del modelo original, un procedimiento conocido como abliteration que elimina o atenua la conducta de negativa ante peticiones que el modelo base rechazaria. El autor de esta compilacion y del modelo intermedio es Richard J. Young, y el trabajo se enmarca en un articulo sobre la comparacion de herramientas de abliteration (Heretic 1.x, Heretic 2.0, OBLITERATUS).

El modelo conserva la arquitectura transformer densa del Qwen2.5-Coder original, con 32.763.876.352 parametros totales y una ventana de contexto de 32.768 tokens (la del Qwen2.5-Coder-32B-Instruct de referencia). Esta publicacion concreta no aporta pesos nuevos: ofrece los mismos pesos del modelo intermedio convertidos a GGUF y cuantizados en dos tamanos (Q4_K_M de 19,9 GB y Q8_0 de 34,8 GB), mas una importance matrix de 30 MB para cuantizaciones con imatrix.

Su relevancia es fundamentalmente de investigacion: sirve para estudiar la eliminacion de rechazos, su medicion y las defensas frente a ella. El autor advierte explicitamente que no es un asistente de proposito general y que los ficheros cuantizados no fueron evaluados en el articulo, por lo que la cuantizacion puede alterar el comportamiento de rechazo respecto a los numeros publicados en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Coder), sin datos adicionales en la informacion disponible |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-32B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M (19,9 GB), Q8_0 (34,8 GB); anunciadas IQ3_M, IQ4_XS, Q5_K_M y Q6_K; importance matrix (imatrix) de 30 MB |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo intermedio se publica en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-32B-Instruct: un transformer denso de 32.700 millones de parametros entrenado por Alibaba Qwen sobre datos de codigo y texto. Sobre esa base, el modelo intermedio aplica Heretic 1.x (heretic-llm 1.4.0), que realiza una ablacion direccional de rango 1 con direcciones de rechazo generales. El procedimiento se selecciona mediante una regla de seleccion sobre 200 pruebas: minimizar el numero de rechazos en el conjunto de desarrollo sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,01. La prueba seleccionada presenta una KL de 0,0074 y 94 rechazos por palabra clave sobre los 100 prompts de ajuste.

Los ficheros GGUF se generaron a partir de los safetensors publicados del modelo intermedio (revision 3dd943ce5315, con verificacion SHA-256 de cada fichero de pesos) usando llama.cpp en el commit 468fde9: primero `convert_hf_to_gguf.py --outtype bf16` y despues `llama-quantize`, todo en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la importance matrix (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estaticas. No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base ni sobre si hubo RLHF o DPO en esta variante.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del Qwen2.5-Coder-32B-Instruct en generacion, completado y explicacion de codigo en multiples lenguajes de programacion.
- Razonamiento y matematicas: capacidad de razonamiento paso a paso propia del modelo base, sin datos de benchmark especificos en esta publicacion.
- Conversacion multi-turno: etiquetado como `conversational` y compatible con endpoints.
- Cumplimiento de peticiones: al estar ablacionado, responde a muchas solicitudes que el modelo original rechaza (64,3% de rechazo residual sobre 972 prompts daninos retenidos, frente al 75,3% del original).
- Tool calling y function calling: no confirmado de forma explicita en la informacion proporcionada; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero esta variante no lo documenta.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion disponible.
- Multilingue: la model card declara unicamente `en`; no se documentan otros idiomas para esta variante.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre abliteration: evaluar como la eliminacion de direcciones de rechazo afecta a la tasa de negativas y a la divergencia KL respecto al modelo original, usando los prompts de ajuste y los 972 prompts retenidos del articulo.
- Estudio de robustez de filtros de seguridad: medir la eficacia de clasificadores de contenido (por ejemplo, WildGuard) frente a un modelo con rechazos atenuados y comparar con las cifras publicadas en bf16.
- Analisis del efecto de la cuantizacion: contrastar el comportamiento de rechazo entre Q4_K_M y Q8_0, dado que el autor advierte que la cuantizacion puede modificarlo y que los ficheros GGUF no fueron evaluados en el articulo.
- Reproducibilidad de compilaciones GGUF: usar los SHA-256 de `SHA256SUMS` y el procedimiento documentado (llama.cpp commit 468fde9, conversion a bf16 y `llama-quantize`) para replicar los ficheros en CPU.
- Despliegue local de referencia para pruebas de codigo: ejecutar Q4_K_M (19,9 GB) con Ollama o llama.cpp en una estacion de trabajo para tareas de generacion de codigo sin conexion, asumiendo las advertencias de uso.
- Docencia y divulgacion tecnica: ilustrar en un entorno controlado como una ablacion direccional de rango 1 altera el comportamiento conversacional de un modelo de 32.700 millones de parametros con una KL de primer token de 0,0074.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo en precision completa (bf16) y no a los ficheros GGUF.

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos retenidos (juez WildGuard) | 75,3% | 64,3% (625/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (prueba seleccionada) | no disponible | 94 |
| Divergencia KL de primer token respecto al original (prueba seleccionada) | no disponible | 0,0074 |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los ficheros cuantizados no fueron evaluados en el articulo.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 20 GB de pesos mas overhead de contexto; se recomienda al menos 24 GB de VRAM para contexto moderado.
- VRAM estimada para Q8_0: en torno a 35 GB de pesos; requiere 40-48 GB de VRAM para contexto amplio.
- GPU recomendadas: A100 40 GB o 80 GB, H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) puede alojar Q4_K_M con contexto limitado.
- GPU de consumo: Q4_K_M es viable en RTX 4090 y, con contexto reducido, en GPUs de 24 GB; Q8_0 no cabe en GPUs de consumo de 24 GB.
- Despliegue: llama.cpp (`llama-cli -hf ...`) y Ollama (`ollama run hf.co/...:Q4_K_M`), segun la model card. No se documenta soporte de vLLM ni TGI para estos ficheros GGUF en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (heretic1x, bf16) | 32,76 B | no disponible | 64,3% | apache-2.0 | safetensors / GGUF |
| Qwen2.5-Coder-32B-Instruct (original) | 32,76 B | no disponible | 75,3% | apache-2.0 | safetensors |
| Heretic 2.0 sobre Qwen2.5 / Qwen2.5-Coder | no disponible | no disponible | no disponible | no disponible | no disponible |
| OBLITERATUS sobre Qwen2.5 / Qwen2.5-Coder | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo confirma que Heretic 2.0, OBLITERATUS y otras releases comunitarias se comparan en el articulo citado, sin cifras concretas para esas variantes.

## Limitaciones y advertencias

- No es un asistente de proposito general: el autor lo publica para investigacion sobre abliteration y su evaluacion.
- Conducta de rechazo alterada: responde a muchas peticiones que el original rechaza; el rechazo residual medido en bf16 es del 64,3%, y la cuantizacion puede modificarlo.
- Los ficheros GGUF no fueron evaluados en el articulo; las cifras de rechazo y KL corresponden solo al modelo en bf16.
- Idiomas: la model card declara unicamente ingles; no se documenta soporte multilingue para esta variante.
- Riesgo de alucinacion: inherente al modelo base; no se aportan datos especificos de esta variante.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia apache-2.0 con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso licito.
- Contexto: la longitud de contexto de esta variante no se especifica en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-general-GGUF
- Modelo intermedio (safetensors): https://huggingface.co/richardyoung/Qwen2.5-Coder-32B-Instruct-heretic1x-general
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Licencia del modelo fuente: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct/blob/main/LICENSE
- Articulo citado: Young, Richard J. *The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder* (enlace arXiv pendiente de publicacion)
- Herramienta Heretic (heretic-llm 1.4.0): no disponible en la informacion proporcionada
- llama.cpp: no disponible en la informacion proporcionada
