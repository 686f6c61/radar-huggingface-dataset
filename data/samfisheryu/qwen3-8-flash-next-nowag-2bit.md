# Samfisheryu/Qwen3.8-flash-next-nowag-2bit

## Resumen

`Samfisheryu/Qwen3.8-flash-next-nowag-2bit` es un artefacto de cuantización extrema (aproximadamente 2 bits por peso) de los expertos enrutados del modelo Qwen3.8-Flash-Next, publicado por el usuario Samfisheryu. No es un modelo autónomo ni un repositorio Transformers al uso: contiene únicamente los pesos de los expertos MoE recompuestos con la técnica NoWAG (codebook compartido en BF16 y asignaciones empaquetadas de 12 bits), y necesita el checkpoint base para aportar arquitectura, tokenizador y tensores no-experto.

El modelo base, desarrollado por el equipo Qwen de Alibaba, es un MoE multimodal experimental de arquitectura híbrida con 125B parámetros en el modelo principal más 51B adicionales en embeddings N-gram, de los cuales solo unos 6B se activan por token. Su ventana de contexto declarada es de 262.000 tokens y se publicó como open weight el 26 de agosto de 2026.

La relevancia de este repositorio es acotada pero específica: demuestra una ruta de compresión agresiva del estado de los expertos (de ~29 GiB en el export) para servir un MoE de gran tamaño en infraestructura con memoria limitada. No obstante, es un artefacto comunitario sin descargas ni validación pública, sin benchmarks propios y atado a un runtime concreto (Big-Rabbit), por lo que debe tratarse como material de experimentación, no como sustituto del checkpoint original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer (modelo base Qwen3.8-Flash-Next, multimodal); este repo contiene solo los 48 capas de expertos enrutados, 512 expertos por capa |
| Parámetros totales | 125B en el modelo principal + 51B en embeddings N-gram (modelo base); el export NoWAG no declara recuento propio de parámetros |
| Parámetros activos | 6B por token (modelo base) |
| Longitud de contexto | 262.000 tokens (modelo base) |
| Tipos de cuantización | NoWAG de ~2 bits por peso de experto (D=6, asignaciones de 12 bits, codebook BF16 compartido de forma `[4096, 6]`, normalizadores BF16 entrenados); en serving se admite `--dense-quant fp8` y `--kv-dtype int8` para las partes densas y la caché KV |
| Idiomas soportados | en, zh |
| Licencia | no disponible (la model card indica que se aplican los términos del modelo base) |
| Formato de pesos | no disponible: 98 archivos de export NoWAG propietario (packed assignments + codebook + normalizadores); no es un repo `safetensors`/GGUF cargable con `AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

El modelo subyacente es un Mixture-of-Experts multimodal con 48 capas MoE y 512 expertos por capa, dentro de un diseño que activa aproximadamente 6B parámetros por token sobre un total de 125B, complementado con 51B parámetros en embeddings N-gram. Según la documentación del proyecto, este diseño reduce el coste de entrenamiento e inferencia frente a Qwen3.7-Plus (alrededor de una novena parte del coste de entrenamiento) manteniendo capacidades superiores en código. No se dispone de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

La innovación de este repositorio no está en el entrenamiento, sino en la compresión: los expertos enrutados se exportan con NoWAG, una variante de cuantización por codebook en la que cada peso se aproxima mediante una combinación de D=6 vectores de un codebook BF16 compartido de 4.096 entradas, con asignaciones empaquetadas a 12 bits (equivalente a ~2 bits por peso, excluyendo normalizadores y metadatos). El checkpoint corresponde a la etapa Paper2 del pipeline (restored → cross-layer → Paper2), con asignaciones y codebook fijados; no es un checkpoint solo-restored. Los tensores no-experto, el tokenizador y la arquitectura se toman del checkpoint base, que se descarga por separado.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.8-Flash-Next.
- Capacidades multimodales: el modelo base se describe como multimodal en las fuentes disponibles; este export conserva los expertos, mientras que las torres y tensores no-experto provienen del checkpoint base.
- Generación y asistencia en código, con resultados reportados por el autor del modelo base en SWE-Bench Pro, SWE-Bench Multilingual y DeepSWE 1.1 (sin cifras en la información disponible).
- Razonamiento agéntico multi-paso y ejecución de tareas de larga duración (el modelo base reporta resultados en Agent's Last Exam e IFBench).
- Ventana de contexto larga: 262.000 tokens, adecuada para repositorios completos o documentos extensos.
- Multilingüismo limitado a inglés y chino según los metadatos del repo.
- No se declara soporte explícito de tool calling/function calling en la información disponible; debe verificarse contra la documentación del modelo base.
- No se declara modo thinking explícito ni capacidades de audio en la información disponible.

## Casos de uso

- Investigación en cuantización extrema: banco de pruebas para medir la degradación real de un MoE de 125B al comprimir los expertos a ~2 bits, comparando salidas contra el checkpoint base en BF16 o NVFP4.
- Serving con memoria restringida: el export de expertos ocupa ~29 GiB, de modo que un despliegue con Big-Rabbit permite estudiar el equilibrio entre memoria de GPU/host, caché y calidad, en escenarios donde el checkpoint completo no cabe.
- Análisis de código en monolitos grandes: con 262.000 tokens de contexto puede procesar repositorios medianos completos para tareas de revisión, resumen o localización de bugs, siempre que la pérdida por cuantización sea aceptable.
- Asistentes técnicos en inglés y chino: generación de documentación, explicación de APIs y traducción técnica bidireccional entre ambos idiomas.
- Procesamiento por lotes de documentación extensa: clasificación, extracción y resumen de contratos o informes largos en pipelines offline donde el throughput prima sobre la latencia interactiva.
- Evaluación de runtimes de serving: comparar Big-Rabbit frente a otras pilas de inferencia en métricas de latencia y fidelidad de salida con un modelo MoE grande y cuantizado.
- Prototipado de agentes de larga duración: tareas de varios pasos con contexto acumulado, sujetas a validación empírica de la estabilidad del modelo cuantizado.
- Docencia y divulgación: ejemplo práctico de cómo se estructura un export NoWAG (codebook, asignaciones, normalizadores) y de por qué un artefacto de cuantización no es un modelo autónomo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del export indica explícitamente que no reclama nuevos resultados de evaluación, ni salidas idénticas bit a bit entre runtimes, ni una garantía universal de precisión.

| Benchmark | Este modelo (NoWAG 2-bit) | Qwen3.8-Flash-Next (base) |
|---|---|---|
| IFBench | no disponible | reportado por el autor, sin cifras en la información disponible |
| Agent's Last Exam | no disponible | reportado por el autor, sin cifras en la información disponible |
| SWE-Bench Pro | no disponible | reportado por el autor, sin cifras en la información disponible |
| SWE-Bench Multilingual | no disponible | reportado por el autor, sin cifras en la información disponible |
| DeepSWE 1.1 | no disponible | reportado por el autor, sin cifras en la información disponible |

## Requisitos de hardware

- El export de expertos pesa ~29 GiB (98 archivos, repositorio de 31,1 GB). Es solo la parte comprimida: la memoria total de serving debe sumar los tensores del checkpoint base, la caché de GPU/host y la caché KV.
- No hay cifras oficiales de VRAM. Como referencia aritmética, un modelo de 125B parámetros en 4 bits ronda los 60-70 GB solo en pesos, a lo que se añaden los 51B de embeddings N-gram; cualquier despliegue realista requiere múltiples GPU de 80 GB (A100/H100/H200) o bien offload a host.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en su configuración completa; solo tendría sentido con esquemas de offload masivo, cuyo rendimiento no está documentado.
- Despliegue: exclusivamente mediante Big-Rabbit (`ft serve --model ./flash-next-base --nowag-expert-path ./flash-next-nowag-paper2 --dense-quant fp8 --kv-dtype int8`), con la línea base de preparación en el commit `bb4582d7a6c1742fca19e9844157d1a0b1437309`. No es compatible con `AutoModel.from_pretrained`, vLLM, llama.cpp, Ollama ni TGI en su forma actual.
- Checkpoint base de referencia para el ejemplo de descarga: `RadixArk/Qwen3.8-Flash-Next-NVFP4`, revisión `7b719225242aacd3dbd3f9407468c2ee9a9d2594`.
- Latencia y throughput: no disponibles. Dependen del número y tipo de GPU, del reparto de expertos entre dispositivos y del backend de kernels de Big-Rabbit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Samfisheryu/Qwen3.8-flash-next-nowag-2bit | base: 125B + 51B N-gram (6B activos) | 262k (heredado del base) | NoWAG ~2 bits en expertos | no disponible | repo comunitario, 0 descargas, requiere Big-Rabbit |
| Qwen/Qwen3.8-Flash-Next (base) | 125B + 51B N-gram (6B activos) | 262k | BF16 (referencia) | no disponible en la información proporcionada | open weight, publicación oficial del 26-08-2026 |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | mismos que el base | 262k | NVFP4 en tensores densos (usado como base en este repo) | no disponible | checkpoint comunitario, referenciado por el autor |
| Qwen3.8-27B | 27B (no confirmado en detalle) | no disponible | no disponible | no disponible | modelo orientado a consumo de la misma generación |

## Limitaciones y advertencias

- No es un modelo autónomo: pasar el directorio a `AutoModel.from_pretrained` falla. Requiere el checkpoint base y el runtime Big-Rabbit.
- Licencia no declarada en los metadatos. La model card remite a los términos del modelo base; antes de cualquier uso comercial hay que verificar la licencia de Qwen/Qwen3.8-Flash-Next y de RadixArk/Qwen3.8-Flash-Next-NVFP4.
- Artefacto sin validación pública: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni comparación de fidelidad frente al modelo original.
- La cuantización a ~2 bits por peso de experto implica una degradación de calidad no cuantificada. El autor renuncia explícitamente a garantizar precisión o equivalencia bit a bit entre runtimes.
- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Dependencia de un backend concreto: los resultados pueden variar entre versiones de Big-Rabbit y entre builds de kernels; el commit de referencia está fijado en la model card.
- La model card advierte de que los campos de procedencia contienen rutas absolutas históricas que no son necesarias para servir el modelo; conviene revisar el manifiesto antes de automatizar despliegues.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones específicas para este export; se heredan los del modelo base, agravados potencialmente por la compresión.
- El tamaño del repositorio (31,1 GB) y la necesidad de descargar además un checkpoint base completo complican la reproducibilidad en entornos con ancho de banda limitado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Samfisheryu/Qwen3.8-flash-next-nowag-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Checkpoint base NVFP4 usado en el ejemplo: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Runtime Big-Rabbit: https://github.com/ServeBig-project/Big-Rabbit
- Ficha en AI Wiki: https://aiwiki.ai/wiki/qwen3_8_flash_next
- Ficha en Learn AI: https://ai.miraheze.org/wiki/Qwen-3.8-Flash-Next
- Seguimiento de benchmarks y fecha de publicación: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
