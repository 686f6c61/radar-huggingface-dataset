# agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF

## Resumen

Qwen3.8-Flash-Next Gyro-Coder es una cuantización GGUF extrema del modelo Qwen3.8-Flash-Next, un mixture-of-experts de 125B parámetros desarrollado originalmente por Qwen (Alibaba). La versión Gyro-Coder, publicada por agentionai, reduce el modelo a 65B parámetros efectivos en GPU mediante una selección evolutiva de expertos: de los 512 expertos por capa, conserva únicamente los 256 que resultan relevantes para programación. El resultado es un modelo de código que cabe en una única GPU de 24 GB, algo inédito para un modelo de esta escala.

La innovación principal es doble. Por un lado, la poda selectiva de expertos orientada a código, elegida mediante una búsqueda evolutiva sobre un espacio de aproximadamente 10^7328 combinaciones posibles. Por otro, un codificador trellis propio que comprime los pesos a 2,125 bits por peso sin la degradación típica de las cuantizaciones agresivas. El modelo mantiene un 93-94,5% de acuerdo top-1 con el modelo completo en Python y C++, lo que lo hace viable para tareas de programación con instrucciones claras.

Es relevante ahora porque demuestra que es posible ejecutar modelos de 125B parámetros en hardware de consumo (RTX 3090, 4090, 7900 XTX) con calidad aceptable para tareas de código, abriendo la puerta a despliegues locales de modelos de gran escala sin infraestructura de centro de datos. Requiere, eso sí, una build específica de llama.cpp (agentionai/llama.cpp) y no funciona con LM Studio ni Ollama en su configuración estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), transformer; 512 expertos por capa, se conservan 256 |
| Parametros totales | 65.314.218.880 (65,3B) en la versión podada; modelo base: 125B |
| Parametros activos | no disponible |
| Longitud de contexto | 64k tokens (con KV cache q8_0); contexto nativo del base no disponible |
| Tipos de cuantizacion | TQ2_0 (2,125 bits/peso, 19,92 GiB), TQ3_0 (aprox. 3,2 bits/peso, 27,54 GiB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura mixture-of-experts de 125B parámetros y 512 expertos por capa. La versión Gyro-Coder aplica una poda estructurada de expertos: para cada capa, retiene 256 de los 512 expertos, seleccionados mediante una búsqueda evolutiva que evaluó aproximadamente 2.200 conjuntos candidatos en 14 ejecuciones. Cada candidato se construyó como modelo completo y se sometió a pruebas de código, bucles y conocimiento. El proceso partió de un mapeo de qué expertos cubren qué dominios, y la selección final prioriza las capacidades de programación.

La compresión de pesos utiliza un codificador trellis propietario que alcanza 2,125 bits por peso (TQ2_0) o aproximadamente 3,2 bits por peso (TQ3_0). Según el autor, este codificador supera a cuantizaciones como IQ3_XXS y UD-Q2_K_XL, que necesitan entre un 20% y un 25% más de memoria para calidad similar. La versión Gyro-Coder-L (TQ3_0) incorpora en su revisión v1.2 tres expertos adicionales relevantes para tool calls y símbolos, corrigiendo un problema de etiquetas `<parameter=` mal formadas bajo sampling (de 4 casos rotos en 100 a 0 en v1.2). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de código en múltiples lenguajes: Python, C++, TypeScript, JavaScript, SQL, entre otros.
- Razonamiento y conocimiento general, aunque el autor recomienda Gyro-S o Gyro-M para uso general y conocimiento abierto.
- Tool calling y function calling: la versión L v1.2 corrige los errores de formato en etiquetas `<parameter=` (0 errores en 292 tool calls y 100 sitios muestreados).
- Soporte de agentes y razonamiento multi-paso, con énfasis en sesiones de agente reales.
- Tareas de refactorización, corrección de bugs, implementación de funcionalidades y explicación de código.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking: no disponible.
- Visión y audio: no soportados (pipeline text-generation).

## Casos de uso

- **Asistente de código en local para desarrolladores individuales**: un programador con una RTX 4090 puede ejecutar el modelo con 64k de contexto y obtener autocompletado, refactorización y explicación de código sin enviar datos a la nube, gracias a los 19,92 GiB de pesos que caben en 24 GB de VRAM.
- **Generación de código en pipelines de CI/CD**: el modelo puede integrarse como paso de revisión automática o generación de tests en un runner con GPU, usando tool calling para invocar linters y ejecutar pruebas, con la ventaja de que la licencia qwen-community-1.0 permite uso comercial bajo sus términos.
- **Atención al cliente técnica automatizada**: con 64k tokens de contexto, el modelo puede gestionar conversaciones multi-turno con historiales largos de tickets o documentación técnica, aunque para conocimiento general el autor recomienda otras variantes.
- **Migración y modernización de código legacy**: el modelo destaca en C++ (94,5% de acuerdo top-1 con el modelo completo) y SQL (92,7%), lo que lo hace adecuado para traducir o refactorizar bases de código antiguas en entornos con GPU de 24 GB.
- **Análisis de repositorios y generación de parches**: la ventana de 64k tokens permite cargar archivos completos o fragmentos de repositorio y generar parches o explicaciones, con un 93,1% de acuerdo top-1 en Python.
- **Prototipado de agentes de código en investigación**: investigadores que necesiten experimentar con agentes multi-paso sobre un modelo de 125B podado pueden hacerlo en una sola GPU, usando la build de llama.cpp de agentionai y el formato GGUF con soporte de tool calling corregido en v1.2.
- **Despliegue en estaciones de trabajo con GPU de 32 GB**: con la variante Gyro-Coder-L (27,54 GiB), se obtiene mayor fidelidad al modelo completo (95,5% top-1 en C++) en tarjetas como RTX 5090 o R9700.

## Benchmarks y rendimiento

| Conjunto | Gyro-Coder KLD ↓ | top-1 ↑ | Gyro-Coder-L KLD ↓ | top-1 ↑ |
|---|---:|---:|---:|---:|
| C++ (archivos held-out) | 0,118 | 94,5% | 0,077 | 95,5% |
| Web (TypeScript / JS) | 0,142 | 92,5% | 0,108 | 93,7% |
| SQL | 0,145 | 92,7% | 0,114 | 93,6% |
| Python | 0,165 | 93,1% | no disponible | no disponible |

Datos adicionales aportados por el autor: 13 de 16 tareas de código superadas en autoevaluación (8 tareas x 2 semillas); los mismos expertos a 8 bits superan 15 de 16. En tool calls, la versión L v1.2 registra 0 etiquetas `<parameter=` rotas en 100 sitios muestreados (v1.0: 4) y 0 errores de formato en 292 tool calls. Gyro-M (todos los 512 expertos) obtiene KLD 0,082 en C++ con 34,98 GiB, ligeramente peor que Gyro-Coder-L (0,077) pese a conservar más expertos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM para inferencia**: 19,92 GiB de pesos para Gyro-Coder (TQ2_0); 21,1 GiB con contexto de 64k y KV cache q8_0. Gyro-Coder-L (TQ3_0): 27,54 GiB de pesos.
- **GPU recomendadas**: RTX 3090, RTX 4090, RX 7900 XTX (24 GB) para Gyro-Coder; RTX 5090, R9700 (32 GB) para Gyro-Coder-L.
- **Consumer GPU**: sí, cabe en tarjetas de 24 GB con la variante TQ2_0 y en 32 GB con TQ3_0.
- **Opciones de despliegue**: exclusivamente la build de llama.cpp de agentionai (Docker disponible) o strix-llama.cpp master; soporte de Strata en camino. LM Studio y Ollama no pueden cargar el archivo completo ni los `-noPLE`.
- **Archivos sin tabla n-gram (PLE)**: Gyro-Coder 21,4 GB (frente a 75,8 GB completo) y Gyro-Coder-L 29,6 GB (frente a 84,0 GB), requiriendo la tabla Q8_0 de Delgon/Qwen3.8-Flash-Next-PLE-GGUF y el flag `--ple`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (C++ top-1) | VRAM pesos | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Gyro-Coder (TQ2_0) | 65,3B (podado de 125B) | 64k | 94,5% | 19,92 GiB | qwen-community-1.0 | GGUF, llama.cpp agentionai |
| Gyro-Coder-L (TQ3_0) | 65,3B (podado de 125B) | 64k | 95,5% | 27,54 GiB | qwen-community-1.0 | GGUF, llama.cpp agentionai |
| Gyro-M (todos los expertos) | 125B | 64k | KLD 0,082 | 34,98 GiB | qwen-community-1.0 | GGUF, llama.cpp agentionai |
| Gyro-S | no disponible | no disponible | no disponible | 27,64 GiB | qwen-community-1.0 | GGUF, llama.cpp agentionai |

No se dispone de comparación con modelos de otros autores (por ejemplo, CodeLlama, DeepSeek-Coder o Qwen2.5-Coder) en la información proporcionada.

## Limitaciones y advertencias

- **Poda de expertos**: solo se conservan 256 de 512 expertos por capa, lo que degrada el rendimiento en conocimiento general y tareas abiertas; el autor recomienda Gyro-S o Gyro-M para esos casos.
- **Compatibilidad restringida**: el archivo no carga en llama.cpp estándar, LM Studio ni Ollama; requiere la build específica de agentionai o strix-llama.cpp.
- **Riesgo de alucinación**: no cuantificado en la información disponible, pero inherente a modelos de lenguaje; el KLD de 0,118-0,165 indica divergencia respecto al modelo completo.
- **Idiomas**: no se especifican los idiomas soportados, lo que impide evaluar su cobertura multilingüe.
- **Licencia**: qwen-community-1.0 (license: other); es necesario revisar los términos exactos para uso comercial, ya que no es una licencia OSI estándar.
- **Contexto**: 64k tokens con KV cache q8_0; contextos mayores no están documentados.
- **Tool calling**: solo la versión L v1.2 corrige los errores de formato; la v1.0 y la v1.1 preview presentaban etiquetas rotas bajo sampling.
- **Formato de pesos**: GGUF únicamente; no hay safetensors de la versión podada.

## Enlaces

- [Hugging Face: agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF](https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF)
- [Modelo base: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Variante Gyro (general): agentionai/Qwen3.8-Flash-Next-Gyro-GGUF](https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF)
- [Tabla PLE: Delgon/Qwen3.8-Flash-Next-PLE-GGUF](https://huggingface.co/Delgon/Qwen3.8-Flash-Next-PLE-GGUF)
- [Repositorio Strata](https://github.com/Niko1221/Strata)
- Build de llama.cpp: agentionai/llama.cpp (referenciada en la model card, sin URL directa disponible)
