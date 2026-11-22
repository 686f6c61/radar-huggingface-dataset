# IsValorum/Surogate3.7-35B-A3B-APEX-I-NanoPlus-V2.1-GGUF

## Resumen

Surogate3.7-35B-A3B-APEX-I-NanoPlus-V2.1-GGUF es una cuantización GGUF del modelo base `surogate/Surogate3.7-35B-A3B`, publicada por el usuario IsValorum dentro de su serie de cuantizaciones APEX. El modelo base es un MoE de 35.505.251.456 parámetros totales (etiquetado como 35B-A3B, es decir, aproximadamente 3 mil millones de parámetros activos por token) con arquitectura etiquetada como `qwen35moe` y pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen-texto. La cuantización se distribuye en formato GGUF para su uso con llama.cpp y motores compatibles.

El interés de esta ficha reside en dos frentes. Por un lado, documenta una cuantización "quirúrgica" con mapa de tensores auditado, en la que el autor aplica precisiones diferenciadas por tipo de tensor (Q4_K, Q6_K, Q8_0 y F32) para preservar las rutas recurrentes SSM y las proyecciones de atención críticas. Por otro, el modelo base incorpora componentes híbridos poco habituales en la familia Qwen MoE clásica: tensores `ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_dt` y `ssm_out`, junto con expertos compartidos (`ffn_*_shexp`), lo que sugiere una arquitectura híbrida transformer-Mamba/SSM con mezcla de expertos.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque la información disponible sobre el modelo base es muy limitada: no se publican idiomas soportados, benchmarks, número de tokens de entrenamiento ni detalles del proceso de alineación. Esta ficha refleja exclusivamente lo verificable en la información proporcionada y marca como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (MoE con componentes SSM/recurrentes y expertos compartidos; pipeline image-text-to-text) |
| Parametros totales | 35.505.251.456 (≈35,5B) |
| Parametros activos | ≈3B (según nomenclatura A3B del nombre del modelo; no se detalla el ratio exacto en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: Q4_K, Q6_K, Q8_0 y F32 (protecciones recurrentes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); origen de cuantización en BF16 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura MoE etiquetada como `qwen35moe`, con 40 bloques (`blk.0` a `blk.39`) y una combinación de capas de atención y capas con rutas de estado recurrente (SSM). El mapa de tensores auditado revela 30 capas con tensores `attn_qkv`, `attn_gate` y parámetros SSM (`ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_dt`, `ssm_out`), y 10 capas (índices 3, 7, 11, ..., 39) con proyecciones de atención separadas `attn_q`, `attn_k`, `attn_v` y `attn_output`. Además, cada bloque incluye proyecciones de expertos compartidos (`ffn_down_shexp`, `ffn_gate_shexp`), lo que confirma un diseño MoE con expertos compartidos además de los enrutados. La presencia de tensores SSM junto con atención sugiere una arquitectura híbrida, aunque la model card no describe el mecanismo exacto de combinación ni el número de expertos por capa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la propia naturaleza híbrida SSM. La cuantización APEX-I NanoPlus V2.1 aplica una política de precisión por tensor: las rutas recurrentes críticas (`ssm_a`, `ssm_alpha`, `ssm_conv1d`, `ssm_dt.bias`) se mantienen en F32 (258 tensores observados), las proyecciones de atención y expertos compartidos se cuantizan mayoritariamente a Q4_K, las salidas de atención y el tensor `output.weight` a Q6_K, y las puertas de atención (`attn_gate`) a Q8_0. El resultado es un repositorio de 13,0 GB y un footprint de 12,14 GiB para la variante NanoPlus.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, según la etiqueta `conversational` del repositorio.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), lo que implica capacidad multimodal de entrada visual.
- Mezcla de expertos con expertos compartidos, orientada a eficiencia computacional con ~3B parámetros activos.
- Rutas de estado recurrente (SSM) que, en arquitecturas híbridas, suelen asociarse a un mejor manejo de secuencias largas y a un coste de memoria más contenido en contexto extendido.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el ecosistema del autor (V-Agent) está orientado a flujos agénticos con llama.cpp.
- Capacidades multilingües: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Asistencia conversacional local con entrada de imágenes: el pipeline `image-text-to-text` permite adjuntar capturas, diagramas o documentos escaneados y mantener diálogo multi-turno sobre ellos, desplegando el GGUF en llama.cpp o en V-Agent sin depender de APIs externas.
- Agente de escritorio con herramientas locales: el ecosistema V-Agent del autor integra siete servidores MCP (ficheros, comandos, búsqueda web, navegador, herramientas de escritorio, descargas HTTP y Hugging Face), por lo que este GGUF puede actuar como motor de razonamiento para flujos agénticos con aprobación por acción.
- Procesamiento de documentos con OCR asistido: combinando la capacidad imagen-texto con contexto conversacional, se puede extraer y resumir información de facturas, formularios o capturas, manteniendo la inferencia en local por motivos de privacidad.
- Prototipado de asistentes técnicos en estaciones de trabajo: con ~12,14 GiB de footprint en NanoPlus, cabe en GPUs de consumo de 16 GB o en configuraciones con offload parcial a CPU, lo que facilita entornos de desarrollo sin clúster.
- Evaluación de arquitecturas híbridas MoE-SSM: investigadores pueden usar esta cuantización para medir el impacto de la precisión por tensor (F32 en rutas recurrentes frente a Q4_K en proyecciones) en calidad y latencia, comparando con la variante MiniPlus de 14,18 GiB.
- Integración en pipelines de CI/CD para revisión de artefactos visuales: un motor local compatible con llama.cpp puede inspeccionar capturas de errores o diagramas generados en pruebas y producir descripciones o resúmenes automáticos sin salir de la red interna.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite incorporar el modelo en productos comerciales, siempre que se respeten las obligaciones de atribución correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 13,0 GB y la variante NanoPlus declara un footprint de 12,14 GiB; se recomienda al menos 14-16 GB de VRAM para carga completa con contexto moderado, y más si se amplía la ventana de contexto.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, una RTX 4090 (24 GB) o RTX 4080 (16 GB) permiten carga completa; A100 y H100 ofrecen margen amplio para contexto largo y concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, 4060 Ti 16 GB), y con offload parcial en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (CUDA, Vulkan, CPU), V-Agent (motor local del autor), y cualquier runtime compatible con GGUF. vLLM, TGI y Ollama no están confirmados en la información disponible para este artefacto concreto.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~3B parámetros activos, se espera un throughput superior al de un modelo denso de 35B, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Surogate3.7-35B-A3B APEX-I NanoPlus V2.1 | 35,5B | ≈3B | no disponible | Apache 2.0 | GGUF (12,14 GiB) | Cuantización quirúrgica con rutas SSM en F32 |
| Surogate3.7-35B-A3B APEX-I MiniPlus V2.1 | 35,5B | ≈3B | no disponible | Apache 2.0 | GGUF (14,18 GiB) | Misma familia, mayor footprint y presumiblemente mayor fidelidad |
| Modelo base `surogate/Surogate3.7-35B-A3B` | 35,5B | ≈3B | no disponible | no disponible | BF16 | Referencia de precisión completa |
| Alternativas de la misma categoría (p. ej. MoE ~30-40B con ~3B activos) | — | — | — | — | — | No se dispone de datos comparativos verificables en la información proporcionada |

No se dispone de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con modelos de otras familias.

## Limitaciones y advertencias

- La información sobre el modelo base es mínima: no constan idiomas, contexto, datos de entrenamiento ni proceso de alineación, lo que dificulta evaluar sesgos y calidad real.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas ni evaluaciones de fidelidad.
- La cuantización a Q4_K en la mayoría de proyecciones puede degradar tareas sensibles a precisión numérica o de razonamiento fino, aunque las rutas SSM se protegen en F32.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni reportes independientes de calidad.
- El pipeline `image-text-to-text` está declarado, pero no se documentan detalles del codificador visual ni del preprocesado de imágenes; el soporte multimodal efectivo en llama.cpp puede variar según la versión del runtime.
- No se confirma soporte de tool calling ni de modo thinking; los flujos agénticos deben validarse empíricamente.
- Licencia Apache 2.0 declarada, pero la cadena de licencias del modelo base y de los datos de entrenamiento no se detalla; conviene verificar antes de uso comercial en producción.
- El uso de un iMatrix externo (`Surogate3.7-35B-A3B.imatrix.gguf`) sin procedencia inferida introduce incertidumbre sobre la calibración de la cuantización.
- La fecha de creación del repositorio (2026-11-22) y la ausencia de métricas hacen recomendable tratar esta versión como experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Surogate3.7-35B-A3B-APEX-I-NanoPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Variante MiniPlus: https://huggingface.co/IsValorum/Surogate3.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Mapa de tensores: https://huggingface.co/IsValorum/Surogate3.7-35B-A3B-APEX-I-NanoPlus-V2.1-GGUF/blob/main/tensor-map.tsv
- V-Agent (repositorio): https://github.com/IsValorum/V-Agent
- V-Agent (última release): https://github.com/IsValorum/V-Agent/releases/latest
- Arquitectura de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/docs/ARCHITECTURE.md
- Licencia de V-Agent: https://github.com/IsValorum/V-Agent/blob/main/LICENSE
- Apoyo al autor: https://ko-fi.com/isvalorum
