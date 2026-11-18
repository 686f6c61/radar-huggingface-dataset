# AesSedai/Qwen3.8-Flash-Next-GGUF

## Resumen

AesSedai/Qwen3.8-Flash-Next-GGUF es un repositorio de cuantizaciones especializadas en formato GGUF del modelo base Qwen/Qwen3.8-Flash-Next, un modelo de arquitectura MoE (mixture of experts) con 179.551.050.368 parámetros totales según los pesos en safetensors del modelo original. El trabajo lo firma el usuario AesSedai, no el equipo de Qwen, por lo que se trata de una redistribución optimizada para inferencia local y no de un modelo entrenado desde cero.

La aportación principal del repositorio es una estrategia de cuantización selectiva: dado que los tensores FFN (UP, GATE y DOWN) concentran la mayor parte del peso del modelo, el autor mantiene el tipo de cuantización por defecto en alta calidad y reduce la precisión únicamente en esos tensores FFN, consiguiendo un tamaño total menor que una cuantización ingenua equivalente con una pérdida de perplejidad controlada. El repositorio publica métricas de PPL y KLD para cada variante, lo que permite elegir el compromiso tamaño/calidad con datos medidos.

El repositorio tiene 1.927 descargas y 25 likes en el momento de la consulta, con un tamaño total de 1.021,7 GB, lo que refleja que aloja múltiples variantes de cuantización del mismo modelo. La relevancia actual es práctica: permite ejecutar un modelo MoE de gran tamaño en hardware con VRAM limitada, incluyendo variantes con tensores de embedding en Q4_0 que reducen el peso por parámetro hasta 3,82 BPW.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) según la model card del repositorio; detalles de capas y atención no disponibles |
| Parametros totales | 179.551.050.368 (modelo base, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, IQ4_XS, IQ3_S, IQ2_S; cada una en variante con embeddings PLE en Q8_0 y variante con PLE en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-Flash-Next, descrito en la model card del repositorio como un modelo MoE. No se dispone de información sobre el número de capas, la dimensión oculta, el número de expertos, el mecanismo de atención ni la longitud de contexto en la información proporcionada. Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento.

La innovación técnica documentada en este repositorio es la cuantización selectiva por tipo de tensor. El autor describe que los tensores FFN son mucho mayores que el resto, por lo que aplica cuantización de menor precisión a FFN UP, FFN GATE y FFN DOWN, mientras mantiene el resto de tensores en el tipo por defecto de alta calidad. La mezcla concreta se detalla por variante: por ejemplo, Q4_K_M usa Q8_0 / Q4_K / Q4_K / Q5_K, e IQ2_S usa Q6_K / IQ2_XS / IQ2_XS / IQ3_XXS. Además, las variantes "Q4_0 PLE" cambian únicamente los tensores de embedding (engram embedding tensors) de Q8_0 a Q4_0. La actualización del 03/10/2026 indica que todas las cuantizaciones se rehicieron para incluir MTP (multi-token prediction), lo que sugiere soporte de decodificación especulativa en el modelo base.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational" y "endpoints_compatible".
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el formato GGUF puede servirse mediante infraestructura de endpoints compatible.
- Soporte de MTP: las cuantizaciones actualizadas incorporan los tensores de multi-token prediction, lo que habilita decodificación especulativa cuando el runtime lo soporta.
- Capacidades de razonamiento, código, matemáticas, visión, audio y tool calling: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue local de un MoE de gran tamaño en estaciones de trabajo con múltiples GPU: la variante IQ2_S con PLE en Q4_0 ocupa 79,79 GiB (3,82 BPW), lo que permite cargar el modelo completo en configuraciones de 4×24 GB o 2×48 GB usando llama.cpp con offload por capas.
- Servicio de chat conversacional autoalojado: la variante Q4_K_M con PLE en Q4_0 (108,14 GiB, 5,17 BPW) ofrece una pérdida de perplejidad de solo +0,8437 % frente al modelo base, adecuada para asistentes multi-turno donde la fidelidad de la distribución de salida importa.
- Evaluación comparativa de cuantizaciones: el repositorio publica tablas de PPL y KLD por variante, lo que permite a un equipo de investigación medir el impacto real de cada nivel de compresión antes de fijar una configuración de producción.
- Sustitución de una API externa en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en hardware propio en formato GGUF, el modelo no requiere enviar prompts a terceros.
- Prototipado de pipelines con decodificación especulativa: las versiones recompiladas con MTP permiten probar aceleración por predicción multi-token en runtimes compatibles.
- Investigación sobre cuantización selectiva: las mezclas documentadas (Q8_0 en atención frente a IQ2_XS en FFN) sirven como referencia reproducible para estudiar el compromiso entre BPW y KLD en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de calidad de cuantización frente al modelo base:

| Cuantizacion | Tamano | BPW | PPL | Delta PPL vs base | KLD |
|---|---|---|---|---|---|
| Q5_K_M | 153,07 GiB | 7,32 | 4,596526 ± 0,027937 | +0,1270 % | 0,020218 ± 0,000145 |
| Q4_K_M | 131,98 GiB | 6,31 | 4,613527 ± 0,028075 | +0,4973 % | 0,034206 ± 0,000237 |
| IQ4_XS | 114,99 GiB | 5,50 | 4,739310 ± 0,029099 | +3,2373 % | 0,076158 ± 0,000486 |
| IQ3_S | 105,98 GiB | 5,07 | 4,863539 ± 0,030050 | +5,9434 % | 0,160378 ± 0,000915 |
| IQ2_S | 103,63 GiB | 4,96 | 5,043883 ± 0,031497 | +9,8718 % | 0,205353 ± 0,001121 |
| Q5_K_M (Q4_0 PLE) | 129,23 GiB | 6,18 | 4,620130 ± 0,028097 | +0,6412 % | 0,030943 ± 0,000212 |
| Q4_K_M (Q4_0 PLE) | 108,14 GiB | 5,17 | 4,629426 ± 0,028160 | +0,8437 % | 0,043475 ± 0,000297 |
| IQ4_XS (Q4_0 PLE) | 91,14 GiB | 4,36 | 4,759109 ± 0,029230 | +3,6686 % | 0,084406 ± 0,000531 |
| IQ3_S (Q4_0 PLE) | 82,13 GiB | 3,93 | 4,889509 ± 0,030205 | +6,5091 % | 0,167198 ± 0,000940 |
| IQ2_S (Q4_0 PLE) | 79,79 GiB | 3,82 | 5,062449 ± 0,031623 | +10,2763 % | 0,211550 ± 0,001142 |

## Requisitos de hardware

- VRAM estimada: entre 79,79 GiB (IQ2_S con PLE en Q4_0) y 153,07 GiB (Q5_K_M con PLE en Q8_0) solo para los pesos, más overhead de contexto KV cache y buffers de cómputo.
- GPU recomendadas: configuraciones multi-GPU de centro de datos (A100 80 GB, H100 80 GB) en número de 2 a 4 unidades según la variante elegida.
- GPU de consumo: ninguna GPU consumer individual dispone de VRAM suficiente para el modelo completo. Es posible el offload parcial a RAM del sistema con llama.cpp, a costa de latencia muy superior.
- Opciones de despliegue: llama.cpp y derivados (Ollama, llama-server) por el formato GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con servidores de endpoints tipo TGI o vLLM en su ruta GGUF, aunque no se detalla en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos alternativos comparables en tamaño, contexto o rendimiento, ni mediciones de benchmarks de tareas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada en el repositorio: no se puede confirmar si el uso comercial está permitido. Es necesario consultar la licencia del modelo base Qwen/Qwen3.8-Flash-Next antes de cualquier despliegue en producción.
- El repositorio es una cuantización de terceros (AesSedai), no una publicación oficial de Qwen; la calidad final depende tanto del modelo base como del proceso de cuantización.
- Las variantes de menor BPW (IQ2_S, IQ3_S) presentan degradación medible: +9,87 % y +5,94 % de perplejidad respectivamente en la versión con PLE en Q8_0, y +10,28 % y +6,51 % en la versión con PLE en Q4_0. El KLD asociado (0,16-0,21) indica divergencia apreciable respecto a la distribución del modelo base.
- El autor advierte de que las cuantizaciones se rehicieron el 03/10/2026 para incluir MTP; descargas anteriores están desactualizadas y deben repetirse.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni limitaciones de contexto del modelo base en la documentación disponible.
- El tamaño del repositorio (1.021,7 GB) implica requisitos de almacenamiento considerables y descargas largas.
- El rendimiento en tareas concretas no está validado con benchmarks de tareas; las métricas publicadas son únicamente de perplejidad y divergencia KL.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AesSedai/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
