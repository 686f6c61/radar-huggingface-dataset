# 0xKitkat/Qwen3.8-Flash-Next-125B-UltraLite-37GiB-GGUF

## Resumen

Qwen3.8-Flash-Next-125B-UltraLite-37GiB-GGUF es un experimento de compresion extrema sobre el modelo Qwen3.8-Flash-Next, un MoE de 125B parametros totales con aproximadamente 6B activos por token, desarrollado por Qwen y basado en la nueva arquitectura Qwen4. El autor, 0xKitkat, ha conseguido reducir el peso del modelo desde los 72,55 GB del GGUF fuente calibrado hasta los 37 GiB, empleando una combinacion de cuantizacion mixta por rol de tensor, reparticionado de filas y poda estructural de componentes opcionales.

La relevancia de esta publicacion reside en que permite ejecutar un modelo de 125B parametros en hardware de consumo, con aproximadamente 37 GiB de almacenamiento, algo que hasta ahora requeria multiples GPU de alta gama o cuantizaciones mucho mas agresivas. El modelo mantiene la ventana de contexto de 262K tokens del original y soporta razonamiento avanzado, aunque la cuantizacion ultra-low-bit (1,80 BPW de media) introduce una degradacion de calidad esperable que el autor documenta con transparencia.

Es importante senalar que se trata de una publicacion experimental: requiere un parche especifico sobre una revision concreta de llama.cpp para funcionar, y no es un lanzamiento oficial de Qwen ni de Unsloth. La licencia es Apache 2.0, lo que permite uso comercial con las restricciones habituales de atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (GDN + QSA) sobre base Qwen4 |
| Parametros totales | 125B (aproximadamente) |
| Parametros activos | 6B (aproximadamente) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Q1_0, Q2_0, IQ1_S, IQ2_XXS, IQ4_NL (mezcla por tensor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (3 shards, 39.721.239.200 bytes totales) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next emplea una arquitectura hibrida que combina atencion GDN (Gated Delta Network) con QSA (Quadratic Selective Attention), segun la documentacion oficial del repositorio QwenLM/Qwen3.8-Flash-Next. Esta combinacion busca mejorar la eficiencia computacional y la capacidad del modelo frente a arquitecturas transformer puras. El modelo original es multimodal, pero esta publicacion concreta elimina el proyector de vision, por lo que es exclusivamente de texto.

El entrenamiento del modelo base no esta documentado en la informacion disponible (tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO). La publicacion de 0xKitkat se centra exclusivamente en el proceso de compresion: parte del GGUF UD-IQ1_S de Unsloth (revision 83cadfda58d30be06c110518208d1bb918b33f10) y aplica un proceso reproducible que incluye cuantizacion mixta por rol de tensor, proteccion de capas limite (las capas 0-2 y 44-47 usan Q2_0 para los bancos de expertos, mientras que las capas 3-43 usan Q1_0), y un esquema de padding de la tabla de embeddings por capa (PLE) que expande filas logicas de 160 valores a filas fisicas de 256 con ceros anadidos, cuantizadas a Q1_0.

## Capacidades

- Generacion de texto y razonamiento multi-step, heredadas del modelo base Qwen3.8-Flash-Next.
- Ventana de contexto de 262K tokens, que permite procesar documentos muy largos o conversaciones extensas.
- Soporte de tool calling y function calling, segun las capacidades del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin soporte de vision: el proyector visual fue eliminado en esta compresion.
- Sin modo thinking explicito documentado en esta publicacion.
- Sin soporte de audio.

## Casos de uso

- Despliegue local en hardware de consumo: con 37 GiB de peso, el modelo puede ejecutarse en una GPU consumer de 48 GB (como RTX A6000 o RTX 6000 Ada) o en sistemas con 75 GB de RAM unificada (Apple Silicon), segun la documentacion de Unsloth. Es adecuado para entornos sin acceso a GPU de datacenter.
- Procesamiento de documentos largos: la ventana de 262K tokens permite analizar libros completos, expedientes legales o codigo fuente de repositorios enteros en una sola pasada, sin necesidad de chunking.
- Prototipado rapido de agentes: al soportar tool calling y razonamiento multi-step, puede usarse para experimentar con pipelines de agentes en local antes de escalar a modelos mayores.
- Generacion de codigo asistida: el modelo base tiene capacidades de codigo; esta version comprimida permite integrarlo en entornos de desarrollo con recursos limitados.
- Investigacion academica sobre cuantizacion extrema: el repositorio incluye el script de build reproducible y el parche de llama.cpp, lo que lo convierte en un caso de estudio para tecnicas de compresion ultra-low-bit.
- Evaluacion de trade-offs entre tamano y calidad: permite medir hasta que punto una cuantizacion de 1,80 BPW degrada las capacidades de un MoE de 125B, comparando con versiones menos agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion comparativa. El unico dato de rendimiento verificado es que el runtime parcheado cargo los tres shards, evaluo un prompt, genero un primer token deterministico y salio con codigo 0, sin errores en stderr.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 37 GiB para los pesos, mas overhead de KV cache y activaciones. Con contexto corto, cabe en una GPU de 48 GB; con contexto largo, se recomienda 64 GB o mas.
- GPU recomendadas: RTX A6000 (48 GB), RTX 6000 Ada (48 GB), o multiples GPU consumer en paralelo. En Apple Silicon, se requiere 75 GB de RAM unificada o mas, segun la documentacion de Unsloth.
- No cabe en GPU consumer de 24 GB (RTX 4090) sin offloading parcial a CPU, lo que degradaria significativamente la latencia.
- Opciones de despliegue: llama.cpp con la revision parcheada (Qwen4Exp branch de Unsloth, commit 250b61446efc91e3a179c8677956f2667c8fbda0, mas el parche incluido). No es compatible con vLLM, Ollama ni TGI sin adaptaciones.
- Latencia y throughput: no disponibles. La cuantizacion Q1_0/Q2_0 reduce el trafico de memoria, pero la arquitectura MoE con 6B activos implica que la latencia dependera fuertemente del ancho de banda de memoria del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B MoE (6B activos) | 262K | BF16/FP8 | Apache 2.0 | HuggingFace oficial |
| Qwen3.8-Flash-Next GGUF (Unsloth) | 125B MoE (6B activos) | 262K | UD-IQ1_S | Apache 2.0 | HuggingFace (unsloth) |
| Qwen3.8-Flash-Next UltraLite (esta publicacion) | 125B MoE (6B activos) | 262K | Mixta Q1_0/Q2_0 | Apache 2.0 | HuggingFace (0xKitkat) |

La diferencia principal frente a las alternativas es el tamano final: 37 GiB frente a los 72,55 GB del GGUF fuente. La contrapartida es la necesidad de un parche especifico de llama.cpp y una degradacion de calidad mayor por la cuantizacion mas agresiva.

## Limitaciones y advertencias

- Requiere un parche no oficial de llama.cpp (patches/qwen4exp-under40.patch) sobre una revision concreta del branch Qwen4Exp de Unsloth. Sin el parche, el modelo no carga en llama.cpp estandar.
- La cuantizacion Q1_0/Q2_0 introduce errores de cuantizacion significativos, especialmente en la tabla de embeddings por capa (PLE), que se cuantiza a Q1_0 con padding. Esto puede degradar la coherencia en tareas que dependen de representaciones densas.
- Es una publicacion experimental de un autor independiente, no un lanzamiento oficial de Qwen ni de Unsloth. No hay garantias de mantenimiento ni soporte.
- El modelo es exclusivamente de texto: no incluye el proyector de vision del modelo base, por lo que no puede procesar imagenes.
- No se han publicado benchmarks, por lo que el impacto real de la compresion en la calidad de las respuestas es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud ni de idoneidad para produccion.
- El proceso de build requiere validar los checksums SHA-256 de los shards y seguir el script reproducible; cualquier desviacion puede producir resultados inconsistentes.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/0xKitkat/Qwen3.8-Flash-Next-125B-UltraLite-37GiB-GGUF
- Repositorio HuggingFace del GGUF fuente (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio oficial del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentacion de Unsloth sobre ejecucion local: https://unsloth.ai/docs/models/qwen3.8-next
- Guia de Atomic Chat sobre ejecucion local: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
