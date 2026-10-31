# NeosQ/Qwen3.8-Flash-Next-Uncensored-UD-Q4_K_XL

## Resumen

Qwen3.8-Flash-Next-Uncensored-UD-Q4_K_XL es una cuantización GGUF en 4 bits del modelo Qwen3.8-Flash-Next-Uncensored, un "abliterado" (versión sin filtros de contenido) del modelo base Qwen/Qwen3.8-Flash-Next de Qwen. El autor del repositorio es NeosQ, quien ha realizado esta cuantización tipo UD-Q4_K_XL (estilo Unsloth Dynamic 2.0) específicamente para la plataforma AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada LPDDR5X. El modelo original solo estaba disponible en BF16 safetensors, por lo que este repo cubre el hueco de no existir una versión GGUF sin censura compatible con los motores de inferencia locales Halogen y Gufo.

El modelo emplea la arquitectura `qwen4exp` (Qwen4ExpForConditionalGeneration), con 48 capas, dimensión oculta de 2560 y un vocabulario de 248.320 tokens. Incluye un MTP (Multi-Token Prediction) draft head para decodificación especulativa y una torre visual (mmproj) en BF16, de modo que un solo paquete de archivos permite cargar el modelo completo en motores optimizados para Strix Halo. El contexto nativo es de 262.144 tokens y el paquete completo ocupa 108,39 GiB.

Su relevancia actual radica en que permite ejecutar un modelo de ~177 mil millones de parámetros completamente en memoria unificada de una APU de consumo, con throughput medido de 32-40 tok/s y decodificación especulativa activa, sin filtros de alineación. Es un modelo orientado a usuarios avanzados de inferencia local que necesitan control total sobre el comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (Qwen4ExpForConditionalGeneration) |
| Parametros totales | 176.943.899.520 (~177 B) |
| Parametros activos | no disponible (no se indica si es MoE; el tag `qwen4exp` sugiere posible arquitectura de expertos, pero el dato no está publicado) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | UD-Q4_K_XL (5,03 BPW en el backbone), MTP head en Q8_0 (8,51 BPW), torre visual en BF16 |
| Idiomas soportados | Chino e inglés (según tags del repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (3 shards de 41,80 / 41,37 / 20,51 GiB + MTP head Q8_0 de 3,85 GiB + mmproj-BF16 de 0,85 GiB; total 108,39 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next pertenece a la familia Qwen y utiliza la arquitectura `qwen4exp`, con 48 capas, dimensión oculta de 2560 y vocabulario de 248.320 tokens. El repo no publica detalles sobre el número de tokens de entrenamiento, composición del dataset ni procesos de RLHF/DPO del modelo original; estos datos no están disponibles. El tag `mtp` y la inclusión de un draft head indican soporte nativo de predicción multi-token, aprovechado para decodificación especulativa en inferencia.

En cuanto a esta versión concreta, NeosQ partió de los pesos BF16 sin censura de `orcarouter/Qwen3.8-Flash-Next-Uncensored` y aplicó una cuantización UD-Q4_K_XL "de estilo": reutilizó la tabla de 1224 tipos por tensor de la cuantización oficial de Unsloth (`--tensor-type-file`), la matriz de importancia (imatrix) pública de Unsloth de 554 MiB, y la herramienta `llama-quantize` (commit `848bbda90`). El MTP head se cuantizó por separado en Q8_0 y el repo se redividió en 3 shards con un máximo de 45 GB por archivo para respetar el límite de 50 GB por fichero de Hugging Face. El autor advierte que, al no ser reproducibles los detalles cerrados de Unsloth Dynamic 2.0, se trata de una réplica de estilo, no de una cuantización bit a bit idéntica a la oficial.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), con plantilla de chat incluida en el directorio `tokenizer/`.
- Comprensión visual: incluye torre visual (mmproj) en BF16 de 0,85 GiB, lo que habilita entrada multimodal con imágenes.
- Decodificación especulativa mediante MTP draft head (commit de 2,07 a 4,87 tokens por ronda medido en Halogen), con aceleración de throughput frente a decodificación estándar.
- Generación de código: las pruebas del autor incluyen implementaciones de Python (búsqueda binaria, scripts) que se ejecutan correctamente.
- Razonamiento básico verificado mediante sondas (complejidad de búsqueda binaria, preguntas de conocimiento general).
- Salida en chino e inglés verificada como funcional.
- Sin filtros de alineación: no activa rechazos de contenido en las sondas probadas por el autor.
- Pensamiento (thinking mode): el comando de ejemplo de Gufo incluye `--think off`, lo que sugiere soporte de modo de razonamiento desactivable; no hay más detalles publicados.

## Casos de uso

- Chatbot local sin restricciones en hardware de consumo: en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, el modelo reside íntegro y sirve conversaciones multi-turno a 32-40 tok/s, adecuado para asistentes personales privados sin envío de datos a la nube.
- Generación y depuración de código offline: con 262k de contexto nativo puede ingerir repositorios grandes y generar o refactorizar código; las pruebas del autor confirman que el código Python generado es ejecutable.
- Análisis de documentos largos: la ventana de 262.144 tokens permite procesar contratos, informes o bases de código completas en una sola pasada, con TTFT de 1,68 s para prompts de ~2.200 tokens (Gufo).
- Aplicaciones multimodales locales: la torre visual incluida permite describir imágenes, extraer texto de capturas o construir pipelines de OCR + razonamiento sin depender de servicios externos.
- Experimentación con decodificación especulativa: el MTP head incluido permite investigar el rendimiento de la decodificación especulativa en APU, con tasas de aceptación de 2-5 tokens por ronda.
- Investigación en alineación y seguridad: al ser una versión sin filtros partiendo de un modelo alineado, es útil para estudiar el impacto del abliterado en comportamiento, sesgos y generación de contenido sensible.
- Servidor de inferencia personal con API: mediante Gufo (`gufo serve llm`) o Halogen (contenedor Docker) se puede exponer una API HTTP local en el puerto elegido, con sesiones y contexto configurable (16.384 tokens en los ejemplos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son mediciones de inferencia del propio autor en su plataforma de prueba:

| Metrica | Gufo `aae1ac48` | Halogen `0.18.15` |
|---|---|---|
| Decode (tg) 256 tok | 31,5 / 34,3 tok/s | 32,7 / 34,5 tok/s |
| Decode (tg) 512 tok | 38,0 / 35,8 tok/s | 36,2 / 38,1 tok/s |
| TTFT (prompt 563 tok) | 0,60 s (933 tok/s) | 1,15 s (490 tok/s) |
| TTFT (prompt 2206 tok) | 1,68 s (1315 tok/s) | 2,42 s (912 tok/s) |
| Pico auto-reportado | no disponible | 49,98 t/s (solicitud de 400 tok) |
| Prefill auto-reportado | no disponible | 919 tok/s (prompt 2206 tok) |
| MTP commit/ronda | no disponible | 2,07 – 4,87 |

## Requisitos de hardware

- Memoria: el paquete completo ocupa 108,39 GiB (103,69 GiB de backbone + 3,85 GiB de MTP head + 0,85 GiB de torre visual). Se necesita al menos ~112-120 GB de memoria accesible por la GPU contando KV cache; la plataforma de referencia es un AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB LPDDR5X unificados CPU+iGPU.
- No cabe en GPUs de consumo convencionales: ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) pueden alojarlo. Se requieren plataformas con memoria unificada de 128 GB (Strix Halo) o GPUs de datacenter (A100/H100 de 80 GB no bastarían para el paquete completo en Q4; haría falta 2x A100/H100 80 GB o versiones con más memoria).
- Motores de despliegue verificados: Gufo (compilado desde `github.com/gufo-org/gufo`, commit `aae1ac48`) y Halogen (imagen Docker `halogen-flash-server:0.18.15`, con acceso a `/dev/kfd` y `/dev/dri` para ROCm/AMD). Al ser GGUF, es plausible el uso en llama.cpp, aunque no está verificado en el repo; Ollama y vLLM no se mencionan.
- Rendimiento esperado en Strix Halo: 32-40 tok/s en decodificación con MTP especulativo activo; prefill de ~919-1315 tok/s según el motor. Carga completa verificada en 26 segundos (Gufo).
- Advertencia operativa: si el MTP head no se carga, los motores no avisan y degradan silenciosamente a decodificación sin especulación, con pérdida de throughput superior al 30%.

## Comparativa con modelos similares

| | Qwen3.8-Flash-Next-Uncensored-UD-Q4_K_XL (este repo) | UD-Q4_K_XL oficial de Unsloth (censurado) | Pesos BF16 orcarouter/Qwen3.8-Flash-Next-Uncensored |
|---|---|---|---|
| Parametros | ~177 B | ~177 B | ~177 B |
| Formato | GGUF Q4_K_XL + MTP Q8_0 + mmproj BF16 | GGUF Q4_K_XL (torre visual en repo aparte) | BF16 safetensors |
| Tamano | 108,39 GiB | ~103,68 GiB (backbone) | ~354 GB (estimado en BF16, no disponible) |
| Contexto | 262.144 | 262.144 | 262.144 |
| Sin censura | Sí | No | Sí |
| Shards | 3 (máx. 41,80 GiB) | 4 (máx. 46,44 GiB) | no disponible |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |

No hay datos publicados para comparar con otros modelos de ~177 B de la misma categoría en benchmarks; no disponible.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: al ser una versión "uncensored", el modelo no rechaza contenidos dañinos. Puede generar código malicioso, desinformación o contenido peligroso si se le solicita. Su uso conlleva responsabilidad legal y ética plena para el operador; no es adecuado para entornos de producción orientados a usuarios finales sin capas de moderación externas.
- Riesgo de alucinación: no evaluado; al eliminar el ajuste de alineación, la fiabilidad factual puede degradarse respecto al modelo base. No hay datos de benchmarks que permitan cuantificarlo.
- Idiomas: solo se verifican chino e inglés; el rendimiento en castellano no está documentado y puede ser inferior.
- Cuantización "de estilo": al no ser reproducibles los detalles de Unsloth Dynamic 2.0, la calidad de esta cuantización puede diferir de la oficial; no hay evaluaciones de degradación por cuantización publicadas.
- Contexto: aunque el contexto nativo es de 262.144 tokens, los ejemplos de despliegue usan 16.384 tokens, probablemente por limitaciones de memoria para la KV cache en Strix Halo.
- Dependencia del MTP head: su ausencia degrada el throughput más de un 30% sin ningún aviso del motor.
- Licencia: Apache-2.0 permite uso comercial, pero esto aplica a los pesos; el comportamiento sin filtros puede infringir términos de servicio de plataformas de distribución o legislación local según el uso.
- Verificación limitada: las pruebas del autor se limitan a cuatro sondas simples y un solo hardware; no hay validación independiente de calidad ni de estabilidad a largo plazo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/NeosQ/Qwen3.8-Flash-Next-Uncensored-UD-Q4_K_XL
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pesos sin censura en BF16: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Motor Gufo: https://github.com/gufo-org/gufo
- Motor Halogen: https://github.com/peonist-ai/halogen-flash-server
