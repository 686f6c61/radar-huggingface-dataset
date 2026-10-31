# ProCreations/Nanbeige4.3-33B-NVFP4-A16

## Resumen

Nanbeige4.3-33B-NVFP4-A16 es una cuantización weight-only en formato NVFP4 (W4A16) del modelo Nanbeige4.3-33B, publicado por el usuario ProCreations en Hugging Face. El modelo base, Nanbeige4.3-33B, es un modelo conversacional de texto desarrollado por Nanbeige, y esta versión cuantizada busca reducir a la mitad aproximadamente el footprint de memoria manteniendo la calidad del original mediante pesos en FP4 y activaciones en BF16.

El valor principal de este checkpoint es su documentación de evaluación: el autor ha medido la divergencia KL frente al modelo BF16 en más de 634.000 posiciones de asistente y ha ejecutado 298 pruebas de comportamiento emparejadas, algo poco habitual en cuantizaciones comunitarias. Los resultados indican que la degradación es mínima en la mayoría de dominios, aunque existe un caso fronterizo en tareas agénticas de código.

Es relevante ahora porque el formato NVFP4 cuenta con soporte nativo en SGLang sobre hardware Blackwell (SM120, como la RTX PRO 6000), alcanzando unos 70 tokens/s en generación de flujo único, lo que lo convierte en una opción práctica para servir modelos de 33B en una sola GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder), cuantización NVFP4 weight-only |
| Parametros totales | 17.756.290.048 (según safetensors del repo cuantizado); el modelo base es de 33B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se documentan pruebas con contextos de más de 8.000 tokens) |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos FP4, activaciones BF16); embeddings y output head sin atar en BF16; KV-cache BF16 por defecto u FP8 e4m3 opcional |
| Idiomas soportados | no disponible (el modelo base tiene soporte documentado de chino e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y SGLang; tamaño del repo: 22,1 GB) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización post-entrenamiento del modelo base Nanbeige/Nanbeige4.3-33B, que a su vez es un transformer decoder de la familia de arquitecturas LLaMA. La cuantización es de tipo weight-only NVFP4 (W4A16): los pesos se almacenan en punto flotante de 4 bits (formato NVFP4 de NVIDIA), mientras que las activaciones, los embeddings y la cabeza de salida (untied) se mantienen en BF16. El checkpoint no incluye escalas de KV-cache embebidas: con la configuración por defecto (`auto`) la cache KV se sirve en BF16, y con `fp8_e4m3` se usa una cache más compacta con escalas unitarias.

Sobre el entrenamiento del modelo base, la información disponible en esta ficha es limitada: no se detallan el número de tokens, la composición del dataset ni el uso de RLHF/DPO. Sí se sabe que el modelo soporta un modo de razonamiento (thinking) con plantilla de chat que incluye los parámetros `enable_thinking` y `preserve_thinking`, y que existe un parser de razonamiento y de tool calls específico (`nanbeige`) en SGLang. No se han documentado innovaciones técnicas propias del proceso de cuantización más allá del uso del backend Marlin para GEMM en FP4 sobre hardware SM120.

## Capacidades

- Generacion de texto conversacional, con modo de razonamiento (thinking) activable mediante la plantilla de chat original (`enable_thinking`).
- Llamadas a herramientas (tool calling) con parser dedicado en SGLang (`--tool-call-parser nanbeige`), verificado con llamadas de ejemplo (tres llamadas a una herramienta meteorológica en las pruebas de humo).
- Tareas agénticas multi-turno: la cuantización genera entre un 12 y un 17 % más de tokens que BF16 en tareas agénticas multi-turno, llegando algunas ejecuciones al límite de 8K tokens / 12 turnos.
- Razonamiento matemático: suite de pruebas con 55/56 aciertos frente a 54/56 de BF16.
- Código: suite agéntica de código con thinking activado (43/46) y desactivado (22/30).
- Manejo de contexto largo: 6/6 en la suite de contexto largo, con una prueba de humo de recuperación de 8.259 tokens.
- Multilingüe: se documentan evaluaciones específicas en chino (44/46) y una porción multilingüe en la evaluación KL.
- Salida estructurada: suite estructurada con 28/30 aciertos (JSON, formatos estructurados).
- Compatibilidad con endpoint tipo OpenAI a través de SGLang (contrato auditado sobre el checkpoint FP8 del mismo proyecto).

## Casos de uso

- Servir un modelo de 33B en una sola GPU Blackwell: con 22,1 GB de pesos en NVFP4, el modelo cabe en una RTX PRO 6000 y alcanza unos 70 tokens/s en flujo único, adecuado para despliegues de inferencia en estaciones de trabajo.
- Agentes de código con tool calling: el parser `nanbeige` de SGLang permite integrar el modelo en pipelines de agentes que ejecutan herramientas; es adecuado por su buen rendimiento en las suites agénticas, aunque conviene validar los argumentos que contengan código arbitrario (ver limitaciones).
- Asistentes conversacionales con razonamiento: el modo thinking con `enable_thinking` y la guía de muestreo (temperatura 0,6 / top_p 0,95 para chat) lo hacen apto para chatbots que razonan antes de responder.
- Procesamiento de documentos largos: las pruebas de contexto largo (6/6) y la recuperación de 8.259 tokens lo hacen utilizable para RAG y resumen de documentos extensos, usando KV-cache en BF16 o FP8 según la memoria disponible.
- Tareas matemáticas y STEM: con 55/56 en la suite de matemáticas y KL bajo en ese dominio (0,024), es adecuado para asistentes de resolución de problemas cuantitativos.
- Aplicaciones multilingües con foco en chino: el modelo base mantiene calidad en chino tras la cuantización (KL de 0,0496 en asistente, 44/46 en la suite), útil para productos bilingües chino-inglés.
- Generación de salidas estructuradas (JSON): la suite estructurada (28/30) respalda su uso en extracción de datos y generación de JSON controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica en su lugar evaluaciones propias de fidelidad frente a BF16:

Divergencia KL por dominio (KL(BF16 ∥ quant), logaritmo natural, evaluación congelada eval-v1, 634.268 posiciones de asistente):

| Dominio | Posiciones de asistente | KL asistente | KL decision |
|---|---:|---:|---:|
| all | 634.268 | 0,0329 | 0,0174 |
| agentic | 70.490 | 0,0077 | 0,0059 |
| chat | 112.182 | 0,0561 | 0,0400 |
| chinese | 77.925 | 0,0496 | 0,0638 |
| code | 137.335 | 0,0199 | 0,0067 |
| longctx | 5.913 | 0,0148 | 0,0046 |
| math | 115.237 | 0,0240 | 0,0161 |
| multilingual | 47.621 | 0,0455 | 0,0179 |
| stem | 29.823 | 0,0593 | 0,0056 |
| structured | 37.742 | 0,0168 | 0,0037 |

Suites de comportamiento emparejadas frente a BF16 (298 pruebas):

| Suite | A16 | BF16 | Diferencia (pp) | IC 95 % (pp) |
|---|---:|---:|---:|---|
| agentic_coding_on | 43/46 | 46/46 | -7,8 | [-17,8, 0,0] |
| agentic_coding_off | 22/30 | 22/30 | 0,0 | [-20,0, +20,0] |
| tool_off | 51/60 | 47/60 | +6,7 | [-1,7, +15,0] |
| structured | 28/30 | 27/30 | +3,3 | [-10,0, +20,0] |
| math | 55/56 | 54/56 | +0,8 | [-6,7, +8,3] |
| chinese | 44/46 | 43/46 | -3,3 | [-14,4, +6,7] |
| chat | 24/24 | 24/24 | 0,0 | [0,0, 0,0] |
| long_context | 6/6 | 6/6 | 0,0 | [0,0, 0,0] |

Rendimiento medido: 70,03 tokens/s en flujo único sobre RTX PRO 6000 Blackwell (580 W) con KV-cache BF16 por defecto.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 22,1 GB solo de pesos (tamaño del repo), más la KV-cache en BF16 o FP8; con contexto moderado, una GPU de 32 GB es un mínimo realista, y 48 GB da margen para contextos largos y batching.
- GPU recomendadas: RTX PRO 6000 Blackwell (SM120), hardware donde el autor ha verificado el serving mediante el backend Marlin de SGLang. Otras GPUs Blackwell con SM120 deberían funcionar; no hay evidencia documentada para arquitecturas anteriores (Ampere, Hopper) con este formato NVFP4.
- Consumer GPUs: no cabe cómodamente en GPUs de consumo de 24 GB (RTX 3090/4090) una vez descontada la KV-cache y las activaciones en BF16; se recomienda hardware de 32 GB o superior.
- Despliegue: SGLang 0.5.21 es el runtime documentado (con `--fp4-gemm-backend marlin`, `--reasoning-parser nanbeige` y `--tool-call-parser nanbeige`). No se documenta soporte verificado en llama.cpp, Ollama, vLLM o TGI; para otras GPUs o runtimes, el autor sugiere las variantes EXL3 (4,05-4,55 bits) o FP8 del mismo modelo.
- Latencia y throughput: 70,03 tokens/s en generación de flujo único medida en RTX PRO 6000 con KV BF16; no hay datos de throughput batch o latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ProCreations/Nanbeige4.3-33B-NVFP4-A16 | 33B (base) | NVFP4 W4A16 | safetensors | Apache 2.0 | 22,1 GB; 70 tok/s en RTX PRO 6000; evaluación KL y de comportamiento muy detallada |
| ProCreations/Nanbeige4.3-33B-EXL3 | 33B (base) | EXL3 4,05-4,55 bits | safetensors | Apache 2.0 | Alternativa recomendada por el autor para tareas agénticas; rangos de bits ajustables |
| ProCreations/Nanbeige4.3-33B-FP8 | 33B (base) | FP8 | safetensors | Apache 2.0 | Mayor precisión que FP4; sobre él se auditó el contrato del endpoint OpenAI |
| Nanbeige/Nanbeige4.3-33B | 33B | BF16 (sin cuantizar) | safetensors | Apache 2.0 | Referencia de calidad; requiere aproximadamente el doble de VRAM |

No se han incluido modelos de otros autores porque no hay datos de benchmarks estandarizados que permitan una comparación justa de rendimiento.

## Limitaciones y advertencias

- Regresión fronteriza en código agéntico: la suite agentic_coding_on muestra -7,8 pp frente a BF16 con IC cuyo límite superior es 0,0; esto no establece equivalencia y debe considerarse al usar el modelo en agentes de código.
- Delimitador en tool calls: un literal `</parameter>` dentro de un string de herramienta puede truncar silenciosamente los argumentos estructurados aunque el texto crudo esté completo. La auditoría del parser compartido registró 44/52 comprobaciones superadas, con los ocho fallos atribuibles a esta limitación. Valida siempre los argumentos que contengan código arbitrario.
- Longitud de generación: en tareas agénticas multi-turno la cuantización genera un 12-17 % más de tokens que BF16, y más ejecuciones alcanzan el límite de 8K tokens / 12 turnos; ajusta los límites de contexto y turnos en consecuencia.
- La masa de parada del thinking en dominio agéntico es aproximadamente un 1,3 % menor que en BF16 (IC por debajo de 1,0), lo que puede alargar ligeramente los razonamientos.
- Sesgos: no se documentan sesgos específicos; hereda los del modelo base Nanbeige4.3-33B, sobre los que no hay información en la ficha disponible.
- Alucinaciones: no se han medido tasas de alucinación; las pruebas de humo de generación no equivalen a evaluaciones de precisión de tareas, según advierte el propio autor.
- Contexto e idiomas: la longitud máxima de contexto no está documentada en esta ficha; el soporte de idiomas distintos del chino e inglés no está verificado.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- La auditoría del endpoint OpenAI se realizó sobre el checkpoint FP8 del proyecto, no específicamente sobre este A16; el comportamiento del parser podría diferir.

## Enlaces

- Modelo cuantizado: https://huggingface.co/ProCreations/Nanbeige4.3-33B-NVFP4-A16
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante EXL3: https://huggingface.co/ProCreations/Nanbeige4.3-33B-EXL3
- Variante FP8: https://huggingface.co/ProCreations/Nanbeige4.3-33B-FP8
- Documentación de parsers de serving: SERVING_PARSERS.md (en el repositorio del modelo)
