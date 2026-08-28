# sayyidfareed/Qwen3.8-Flash-Next-DGX-Spark-1M-Recipe

## Resumen

El repositorio `sayyidfareed/Qwen3.8-Flash-Next-DGX-Spark-1M-Recipe` no contiene pesos de modelo, sino código de servicio y artefactos de benchmark para ejecutar el checkpoint `RadixArk/Qwen3.8-Flash-Next-NVFP4` en un sistema DGX Spark (GB10) con 128 GB de memoria unificada, alcanzando una ventana de contexto de un millón de tokens. El modelo base es una variante cuantizada en NVFP4 de Qwen3.8-Flash-Next, un modelo de lenguaje multimodal de tipo Mixture-of-Experts ultra-sparse desarrollado por el equipo Qwen de Alibaba, con 125 mil millones de parámetros totales (incluyendo una tabla de embedding n-gram de 51 mil millones) y 6 mil millones de parámetros activos por token.

La contribución principal de este repositorio es un perfil de servicio optimizado que combina la extensión de contexto YaRN (factor 4) sobre la ventana nativa de 262 144 tokens, gestión de memoria unificada mediante `madvise` y `posix_fadvise` para liberar páginas limpias de la tabla PLE (n-gram) bajo presión de memoria, y decodificación especulativa MTP1. En las pruebas documentadas, el sistema procesó un prompt de 989 734 tokens, recuperó 5 de 5 valores ocultos en una prueba de aguja distribuida, y mantuvo una velocidad de decodificación mediana de 26,7 tokens por segundo. El código se distribuye bajo licencia Apache-2.0, aunque el checkpoint subyacente tiene términos de uso separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts ultra-sparse con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA); tabla n-gram PLE de 51B parámetros |
| Parametros totales | 125B (incluye tabla n-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | Nativa: 262 144 tokens; extendida a 1 000 000 tokens con YaRN (factor 4) |
| Tipos de cuantizacion | NVFP4 (checkpoint base); el repositorio no incluye pesos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (codigo del repositorio); checkpoint con terminos separados (revisar modelo base) |
| Formato de pesos | no disponible (el repositorio contiene codigo y artefactos, no pesos) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un modelo multimodal de tipo MoE ultra-sparse. Su arquitectura combina dos mecanismos principales: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de forma eficiente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de dependencias de largo alcance. Adicionalmente, incorpora una tabla de embedding n-gram de 51 mil millones de parámetros que permite búsquedas locales rápidas de tokens, lo que contribuye a la baja latencia en decodificación. El modelo activa solo 6 mil millones de parámetros por token, lo que reduce significativamente el coste computacional en comparación con un MoE denso de tamaño equivalente.

El repositorio no proporciona información sobre el entrenamiento del modelo base (composición del dataset, número de tokens, uso de RLHF o DPO). La contribución técnica de este repositorio se centra en el despliegue: el perfil de servicio para 1M de contexto utiliza YaRN con factor 4, prefill por chunks de 1024 tokens, y una política de gestión de memoria que aplica `MADV_RANDOM` para desactivar la lectura secuencial anticipada en la tabla PLE, y libera páginas limpias mediante `MADV_DONTNEED` y `POSIX_FADV_DONTNEED` cuando la memoria unificada cae por debajo de un umbral de 8 GiB. El recorte de filas PLE solo se ejecuta tras grandes operaciones de gather, no durante la decodificación token a token.

## Capacidades

- Generacion de texto y razonamiento: modelo de lenguaje multimodal con capacidad de texto, imagen y posiblemente otros modos (no detallado en el repositorio).
- Razonamiento y codigo: el modelo base obtiene 95,1% en HumanEval y 92,7% en HumanEval+ Mini, lo que indica solida capacidad de generacion de codigo.
- Decodificacion especulativa: soporta MTP (multi-token prediction) con factor 1, que casi duplica la velocidad de decodificacion frente al perfil sin MTP.
- Contexto largo: con el perfil YaRN, alcanza 1M de tokens, validado con recuperacion de aguja distribuida (5/5).
- Tool calling y agentes: no se menciona explicitamente en el repositorio, pero el modelo base Qwen3.8-Flash-Next es conocido por soportar function calling; no hay datos confirmados en esta informacion.
- Multilingue: no se especifican idiomas soportados en la informacion disponible.

## Casos de uso

- Servicio de contexto ultralargo en hardware de borde: el perfil permite procesar documentos de casi un millon de tokens (por ejemplo, libros completos, codebases extensos o historiales de conversacion) en un DGX Spark con 128 GB de memoria unificada, sin necesidad de un cluster de GPUs.
- Razonamiento sobre repositorios de codigo completos: con 1M de contexto, el modelo puede analizar un proyecto entero, responder preguntas sobre arquitectura, detectar bugs o generar documentacion, manteniendo una latencia de primer token de 0,257 s.
- Generacion de codigo asistida en entornos locales: la velocidad de decodificacion de 26,7 tok/s permite uso interactivo en tareas de programacion, con soporte de decodificacion especulativa para reducir la latencia.
- Evaluacion de modelos en contexto largo: el repositorio incluye scripts de benchmark (por ejemplo, `long_context_probe.py`) que permiten reproducir pruebas de recuperacion de aguja y medir rendimiento en prompts de hasta 989K tokens, util para investigacion.
- Despliegue de modelos MoE en sistemas con memoria unificada: la estrategia de gestion de memoria (mmap, liberacion de paginas limpias) puede servir como referencia para ejecutar otros modelos grandes en hardware similar.
- Integracion en pipelines de agentes de codigo: aunque no se detalla, el modelo base es multimodal y tiene capacidades de razonamiento, por lo que podria usarse en agentes que necesiten procesar capturas de pantalla o diagramas junto con texto, siempre que se verifique el soporte de vision en el checkpoint concreto.

## Benchmarks y rendimiento

Los datos de la tabla siguiente provienen del README del repositorio, medidos en un sistema NVIDIA GX10/GB10 con 121,63 GiB de memoria unificada usable.

| Test | Resultado |
|---|---|
| Contexto anunciado | 1 000 000 tokens |
| Capacidad KV asignada | 1 095 163 tokens |
| Solicitud validada | 989 734 prompt + 67 salida = 989 801 tokens |
| Recuperacion de aguja distribuida | 5/5 (al 5%, 25%, 50%, 75%, 95%) |
| Decodificacion mediana (5 lenguajes de codigo) | 26,712 tok/s |
| Decodificacion minima | 26,630 tok/s |
| TTFT mediana | 0,257 s |
| HumanEval | 156/164 (95,1%) |
| HumanEval+ Mini | 152/164 (92,7%) |
| Microbenchmark de codigo ejecutable | 34/34 |
| Memoria minima disponible durante prefill de 989K | 3,512 GiB |
| Cambio sin swap durante prefill de 989K | -0,010 GiB |

El README tambien compara el checkpoint RadixArk con otro export (`starkweatherdigital`) en el mismo hardware:

| Checkpoint / perfil | HumanEval | HumanEval+ Mini | Microbench | Decodificacion |
|---|---|---|---|---|
| `starkweatherdigital`, MTP1 estandar | 157/164 | 155/164 | 34/34 | 27,633 tok/s |
| RadixArk, 1M YaRN + MTP1 | 156/164 | 152/164 | 34/34 | 26,712 tok/s |

La diferencia se atribuye tanto al cambio de checkpoint como al perfil de servicio, por lo que no se puede aislar el efecto de YaRN.

## Requisitos de hardware

- Sistema DGX Spark, ASUS GX10 o compatible con GB10 y 128 GB de memoria unificada (121,63 GiB usables en la prueba).
- Almacenamiento local rapido: aproximadamente 130 GB, NVMe recomendado.
- NVIDIA container runtime y Docker.
- Tiempo de carga en frio: unos 10 minutos en el equipo probado.
- VRAM estimada: no aplica como VRAM dedicada; el modelo usa memoria unificada del sistema. El perfil reserva un 90,5% de la memoria GPU para el modelo y KV cache.
- Opciones de despliegue: el repositorio proporciona un Dockerfile y scripts (`serve-1m.sh`) que exponen una API compatible con OpenAI en el puerto 11002. No se mencionan alternativas como vLLM, llama.cpp u Ollama, aunque el repositorio usa vLLM como libreria (tag `vllm`).
- Latencia y throughput: decodificacion mediana de 26,7 tok/s, TTFT de 0,257 s para prompts cortos; para el prompt de 989K, el prefill tarda unos 17 minutos (no se especifica el TTFT en ese caso).

## Comparativa con modelos similares

La comparativa directa con otros modelos de contexto largo no esta disponible en la informacion proporcionada. El README incluye una comparacion interna entre dos checkpoints del mismo modelo base (RadixArk vs. starkweatherdigital) en el mismo hardware, que se muestra en la seccion de benchmarks. Para una comparativa con modelos externos, se necesitarian datos adicionales no presentes en el repositorio.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo; solo codigo de servicio y artefactos de benchmark. Para usar el modelo, es necesario descargar el checkpoint `RadixArk/Qwen3.8-Flash-Next-NVFP4` por separado.
- La licencia Apache-2.0 aplica al codigo del repositorio, pero el checkpoint Qwen/RadixArk tiene terminos de uso separados que deben revisarse antes de cualquier uso comercial.
- El perfil de 1M de contexto esta optimizado para una sola secuencia (SEQS=1). No es adecuado para servir multiples solicitudes concurrentes con contexto largo.
- El rendimiento medido se obtuvo en un sistema especifico (GX10/GB10) con el modelo como unica carga de trabajo. Otros entornos pueden variar.
- La extension de contexto a 1M mediante YaRN puede degradar ligeramente la calidad en tareas de corto contexto, como se observa en la comparacion con el checkpoint sin YaRN (156 vs. 157 en HumanEval).
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma del modelo base. Se recomienda evaluar estos aspectos antes de usar el modelo en produccion.
- El repositorio no documenta soporte de tool calling, vision u otras capacidades multimodales en este perfil especifico; aunque el modelo base es multimodal, no se ha verificado su funcionamiento en este despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sayyidfareed/Qwen3.8-Flash-Next-DGX-Spark-1M-Recipe
- Modelo base en HuggingFace: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Modelo original Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Proyecto upstream en GitHub: https://github.com/blazux/qwen3.8-Flash-DGX
- Repositorio de codigo de este proyecto (mencionado en el README): https://github.com/sayyidfareed/qwen3.8-flash-next-dgx-spark-1m
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Blog de NVIDIA sobre Qwen3.8-Flash-Next en GB300: https://developer.nvidia.com/blog/experiment-with-qwen3-8-flash-next-on-nvidia-gb300-nvl72-for-agentic-coding/
- Foro de NVIDIA sobre Qwen3.8-Flash-Next: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228
