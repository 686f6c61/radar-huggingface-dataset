# qda-lab/QDA-Qwen3.6-35B-A3B-W4A4

## Resumen

QDA-Qwen3.6-35B-A3B-W4A4 es una cuantizacion NVFP4 (4 bits en pesos y activaciones, con algunas capas en FP8) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el laboratorio independiente qda-lab. Su objetivo es reducir el coste de despliegue del modelo base en GPUs NVIDIA Blackwell manteniendo practicamente intacta la precision: el checkpoint ocupa 24,1 GB frente a los 71,9 GB del BF16 original, una reduccion de 3,0x, y conserva el 99,0 % de la exactitud segun la evaluacion del autor.

El modelo base es un transformer MoE con atencion hibrida (lineal y completa) y torre de vision, orientado a tareas de razonamiento, matematicas y codigo en modo thinking. Esta cuantizacion esta pensada especificamente para servir el modelo con vLLM sobre hardware Blackwell (B200, B300, GB200, GB300), donde NVFP4 cuenta con soporte nativo en tensor cores.

La relevancia de esta ficha es doble: por un lado, demuestra que la cuantizacion agresiva W4A4 puede igualar al BF16 en benchmarks de razonamiento de alta dificultad (AIME 2025, HMMT, GPQA-Diamond); por otro, ofrece una comparativa directa y reproducible frente a las cuantizaciones NVFP4 publicadas por NVIDIA, RedHatAI y unsloth, con metodologia detallada (mismo motor, mismas semillas, mismos limites de tokens).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (lineal Gated DeltaNet + atencion completa) y torre de vision; tag `qwen3_5_moe` |
| Parametros totales | 19.845.695.344 (~19,8 mil millones, segun safetensors) |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~3B activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | 262.144 tokens (ventana usada en la evaluacion); `qda eval` sirve con 114.688 |
| Tipos de cuantizacion | NVFP4 (W4A4) en expertos enrutados y lineales del decoder; FP8 W8A8 en `in_proj_qkv`, `in_proj_z`, `out_proj` y `lm_head`; BF16 en proyecciones de self-attention, expertos compartidos, compuertas Gated DeltaNet, routers, embeddings y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `compressed-tensors` y vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura Mixture-of-Experts con atencion hibrida: capas de atencion lineal basadas en Gated DeltaNet combinadas con capas de atencion completa, ademas de una torre de vision que lo habilita para tareas image-text-to-text. El checkpoint cuantizado conserva esa topologia y solo modifica la precision numerica de determinados modulos.

La cuantizacion se realizo con GPTQ. Los expertos enrutados y el resto de lineales del decoder usan NVFP4: pesos E2M1 con una escala E4M3 por cada 16 entradas y una escala tensorial FP32, con activaciones cuantizadas del mismo modo en tiempo de ejecucion. Las proyecciones de atencion lineal (`in_proj_qkv`, `in_proj_z`, `out_proj`) y `lm_head` se mantienen en FP8 W8A8 (pesos por canal, activaciones dinamicas por token). Permanecen en BF16 las proyecciones de self-attention, los expertos compartidos, las compuertas Gated DeltaNet, los routers, los embeddings y la torre de vision. La receta concreta se selecciono mediante busqueda automatizada de QDA bajo un presupuesto fijo de tamano.

Los datos de calibracion son una mezcla publica de respuestas del propio modelo: 2.310 filas de token ids, de las que se eliminaron 36 que alcanzaban el limite de 20 palabras de MMLU-Pro; la construccion lee las primeras 384 filas de 2.048 tokens cada una. El autor documenta una revision contra el conjunto de test de MMLU-Pro (12.032 preguntas): ninguna ventana de 20 palabras coincide, pero 12 filas contienen el texto completo de una pregunta corta de MMLU-Pro (de las partes TheoremQA y SciBench) seguida de una solucion escrita por el modelo, y una de ellas (fila 75) esta entre las 384 usadas.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con marcador de fin de pensamiento `</think>`.
- Razonamiento matematico de alta dificultad: AIME 2025 y HMMT Feb 2026 evaluados con 32 draws por problema y hasta 81.920 tokens de salida.
- Razonamiento cientifico de nivel doctorado: GPQA-Diamond.
- Generacion y comprension de codigo: LiveCodeBench con 454 problemas y 4 draws.
- Seguimiento de instrucciones complejas: IFBench con 300 problemas y 16 draws.
- Conocimiento general y profesional: MMLU-Pro con 12.032 preguntas.
- Procesamiento image-text-to-text (pipeline declarado y torre de vision en BF16).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking y la ventana de 262.144 tokens lo habilitan tecnicamente.

## Casos de uso

- Razonamiento matematico asistido: el modelo mantiene 89,8 % en AIME 2025 y 80,2 % en HMMT Feb 2026 en W4A4, por lo que puede usarse en tutoria de matematicas avanzada, verificacion de demostraciones o generacion de problemas con solucion, con cadenas de pensamiento largas (hasta 81.920 tokens de salida).
- Analisis cientifico y QA de dominio: con 84,9 % en GPQA-Diamond, es adecuado para responder preguntas de fisica, quimica y biologia de nivel experto en herramientas internas de investigacion, siempre con revision humana.
- Generacion de codigo en produccion: 80,8 % en LiveCodeBench permite integrarlo en pipelines de revision de codigo, generacion de tests o resolucion de problemas algoritmicos; su formato safetensors y soporte en vLLM facilitan el despliegue como servicio interno.
- Evaluacion de instrucciones y agentes: 66,0 % en IFBench lo hace util para tareas de seguimiento estricto de instrucciones, extraccion estructurada y validacion de formatos en flujos automatizados.
- Despliegue economico en infraestructura Blackwell: al ocupar 24,1 GB, un solo GB300 puede servir multiples replicas o un modelo con contexto de 262.144 tokens, reduciendo coste por token frente al BF16 de 71,9 GB.
- Procesamiento de documentos con imagen y texto: la torre de vision en BF16 y el pipeline image-text-to-text permiten OCR semantico, descripcion de figuras tecnicas o extraccion de datos de graficos en informes.
- Benchmarking interno de cuantizaciones: la metodologia publicada (vLLM 0.33.0, mismas semillas, mismos caps) sirve como referencia reproducible para comparar otras recetas NVFP4 en el mismo hardware.

## Benchmarks y rendimiento

Resultados publicados por el autor. Thinking mode, pass@1 promediado sobre los draws indicados; cada celda es puntuacion ± 1 error estandar, en porcentaje. Todos los checkpoints servidos con vLLM 0.33.0 en un GB300.

| Benchmark | Problemas × draws | Cap de salida | BF16 (71,9 GB) | QDA W4A4 (24,1 GB) | NVIDIA NVFP4 (23,4 GB) | RedHatAI NVFP4 (25,0 GB) | unsloth NVFP4 (23,6 GB) |
|---|---:|---:|---:|---:|---:|---:|---:|
| AIME 2025 | 30 × 32 | 81.920 | 89,3 ± 5,3 | **89,8 ± 5,2** | 89,4 ± 5,3 | 88,5 ± 5,4 | 89,0 ± 5,5 |
| HMMT Feb 2026 | 33 × 32 | 81.920 | 81,8 ± 5,4 | **80,2 ± 5,7** | 79,1 ± 5,8 | 74,8 ± 6,4 | 77,9 ± 5,9 |
| GPQA-Diamond | 198 × 16 | 81.920 | 86,0 ± 2,0 | 84,9 ± 2,0 | **85,0 ± 2,1** | 83,7 ± 2,2 | 84,5 ± 2,1 |
| IFBench | 300 × 16 | 81.920 | 67,6 ± 2,1 | 66,0 ± 2,1 | 66,6 ± 2,1 | 66,2 ± 2,1 | **67,9 ± 2,0** |
| MMLU-Pro | 12.032 × 1 | 32.768 | 85,2 ± 0,3 | **85,0 ± 0,3** | 84,9 ± 0,3 | 84,1 ± 0,3 | 84,9 ± 0,3 |
| LiveCodeBench | 454 × 4 | 81.920 | 81,8 ± 1,6 | 80,8 ± 1,6 | **81,4 ± 1,6** | 80,1 ± 1,7 | 81,0 ± 1,6 |
| **Media** | | | 81,9 ± 1,4 | **81,1 ± 1,4** | **81,1 ± 1,4** | 79,6 ± 1,5 | 80,9 ± 1,5 |

Porcentaje de generaciones truncadas por alcanzar el cap de salida:

| Benchmark | BF16 | QDA W4A4 | NVIDIA | RedHatAI | unsloth |
|---|---:|---:|---:|---:|---:|
| AIME 2025 | 5,0 % | 3,9 % | 5,4 % | 6,1 % | 5,8 % |
| HMMT Feb 2026 | 7,7 % | 6,7 % | 11,4 % | 9,4 % | 9,5 % |
| GPQA-Diamond | 1,8 % | 2,0 % | 2,4 % | 2,7 % | 2,1 % |
| IFBench | 4,9 % | 5,1 % | 4,9 % | 5,7 % | 5,1 % |
| MMLU-Pro | 0,1 % | 0,2 % | 0,2 % | 0,2 % | 0,2 % |
| LiveCodeBench | 6,0 % | 6,2 % | 7,4 % | 8,1 % | 6,4 % |
| Media | 4,3 % | 4,0 % | 5,3 % | 5,4 % | 4,8 % |

Ajustes de evaluacion: temperatura 1,0, top-p 0,95, top-k 20 en todos los benchmarks salvo MMLU-Pro, ejecutado de forma greedy; thinking activado con `</think>`; ventana del motor de 262.144 tokens. El autor senala que `qda eval` con la suite `full` anade una penalizacion de presencia de 1,5, muestrea MMLU-Pro y sirve con 114.688 tokens de contexto, por lo que sus cifras no son identicas a las de la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: 24,1 GB de pesos en NVFP4; con cache KV y overhead de servicio, se recomienda reservar al menos 40-48 GB para contextos moderados y bastante mas para contextos cercanos a 262.144 tokens.
- GPUs soportadas: exclusivamente NVIDIA Blackwell de centro de datos (B200, B300, GB200, GB300). La evaluacion se realizo en un unico GB300 con vLLM 0.33.0.
- GPUs consumer: no soportado de forma nativa; las RTX 40/50 no ejecutan NVFP4 con el rendimiento previsto y el checkpoint esta pensado para tensor cores Blackwell. Para consumer conviene recurrir a otras cuantizaciones del modelo base (por ejemplo GGUF) no incluidas en esta ficha.
- Opciones de despliegue: `vllm serve qda-lab/QDA-Qwen3.6-35B-A3B-W4A4` con vLLM 0.33.0 o superior y soporte de `compressed-tensors`; compatible con `transformers` a nivel de carga, pero el rendimiento NVFP4 requiere vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en 6 benchmarks | Licencia | Tamano | Disponibilidad |
|---|---|---:|---:|---|---:|---|
| QDA-Qwen3.6-35B-A3B-W4A4 | ~19,8 B (MoE) | 262.144 | 81,1 ± 1,4 | Apache 2.0 | 24,1 GB | Hugging Face |
| NVIDIA NVFP4 (Qwen3.6-35B-A3B) | ~19,8 B (MoE) | no disponible | 81,1 ± 1,4 | no disponible | 23,4 GB | Hugging Face |
| RedHatAI NVFP4 (Qwen3.6-35B-A3B) | ~19,8 B (MoE) | no disponible | 79,6 ± 1,5 | no disponible | 25,0 GB | Hugging Face |
| unsloth NVFP4 (Qwen3.6-35B-A3B) | ~19,8 B (MoE) | no disponible | 80,9 ± 1,5 | no disponible | 23,6 GB | Hugging Face |
| Qwen3.6-35B-A3B BF16 (base) | ~19,8 B (MoE) | 262.144 | 81,9 ± 1,4 | Apache 2.0 | 71,9 GB | Hugging Face |

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona de forma eficiente en GPUs NVIDIA Blackwell; en arquitecturas anteriores el checkpoint no aporta ventaja y puede no cargar correctamente.
- Precision: aunque conserva el 99,0 % de la exactitud media, pierde entre 0,2 y 2,3 puntos en benchmarks individuales (HMMT Feb 2026: 80,2 frente a 81,8 en BF16; IFBench: 66,0 frente a 67,6). En tareas de razonamiento muy sensible conviene validar contra el BF16.
- Riesgo de contaminacion en calibracion: el autor reconoce que 12 filas del fichero de calibracion contienen preguntas cortas de MMLU-Pro con soluciones generadas por el modelo, y una de ellas (fila 75) esta entre las 384 usadas. Aunque no coincide ninguna ventana de 20 palabras, existe un riesgo residual de fuga en MMLU-Pro.
- Sesgos: no documentados en la informacion proporcionada; al derivar del modelo base, hereda los sesgos de Qwen3.6-35B-A3B.
- Alucinacion: no se han publicado tasas especificas para esta cuantizacion; el modo thinking con cadenas largas puede aumentar el coste y no elimina el riesgo.
- Idiomas: no se especifica la cobertura linguistica del checkpoint.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base mantiene la misma licencia y condiciones.
- Produccion: la evaluacion se limita a seis benchmarks con vLLM 0.33.0 en un GB300; no hay datos publicos de latencia, throughput ni estabilidad bajo carga sostenida.
- Contexto: la ventana de 262.144 tokens exige memoria KV considerable; servirla completa en un solo GB300 puede limitar el numero de peticiones concurrentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W4A4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizacion NVFP4 de NVIDIA: no disponible (sin URL en la informacion proporcionada)
- Cuantizacion NVFP4 de RedHatAI: no disponible (sin URL en la informacion proporcionada)
- Cuantizacion NVFP4 de unsloth: no disponible (sin URL en la informacion proporcionada)
- Repositorio de vLLM: no disponible (sin URL en la informacion proporcionada)
- Paper o blog tecnico del autor: no disponible
