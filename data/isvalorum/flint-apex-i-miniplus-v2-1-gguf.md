# IsValorum/Flint-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Flint APEX-I-MiniPlus V2.1 es una cuantización GGUF de alta fidelidad del modelo `RecursiveSI/flint`, publicada por el usuario IsValorum. No se trata de un modelo entrenado desde cero, sino de una reempaquetadura del modelo base orientada a inferencia local con `llama.cpp`, con un perfil de cuantización "quirúrgico" que asigna precisión distinta a cada tipo de tensor. El modelo base es un MoE de Recursive diseñado específicamente para agentes de código: exploración de repositorios, corrección de bugs, implementación de funcionalidades y generación de tests unitarios.

El modelo combina 39.785.287.456 parámetros totales con aproximadamente 2.500 millones de parámetros activos por token, gracias a 47 capas MoE con 256 Expertos enrutados (top-k = 6) y un experto compartido por capa, precedidas por dos capas densas SwiGLU. Incorpora attention sinks aprendidos en las 49 capas y una ventana de contexto declarada de 262.144 tokens con ventana deslizante de 513 tokens.

La relevancia de esta versión radica en que reduce el peso a unos 14,70 GiB en VRAM (15,79 GB en el Hub) sin recurrir a cuantización de 2 bits, preservando routers, normalizaciones y attention sinks en F32. Eso permite ejecutar un MoE de casi 40.000 millones de parámetros en GPU de consumo, a cambio de asumir una pérdida de calidad no cuantificada públicamente en los expertos enrutados, que se almacenan en IQ3_XXS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `FlintForCausalLM`: front denso + MoE + attention sinks (StreamingLLM) |
| Parámetros totales | 39.785.287.456 (39,79 B) |
| Parámetros activos | Aproximadamente 2,5 B por token |
| Longitud de contexto | 262.144 tokens (ventana deslizante de 513 con attention sinks) |
| Tipos de cuantización | Perfil mixto APEX-I MiniPlus V2.1: IQ3_XXS (141 tensores de expertos enrutados), Q4_K, Q5_K, Q6_K y F32 (routers, normalizaciones, attention sinks) |
| Idiomas soportados | Inglés (`en`) y código |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para `llama.cpp` (779 tensores); formato del modelo base no disponible |
| Capas | 49 (blk.0 y blk.1 densas SwiGLU; blk.2 a blk.48 MoE) |
| Expertos enrutados | 256 por capa, top-k = 6 |
| Expertos compartidos | 1 por capa MoE, tamaño intermedio 1024 |
| Tamaño en VRAM | Aproximadamente 14,70 GiB |
| Tamaño en el Hub | Aproximadamente 15,79 GB (el repositorio figura con 48,6 GB, posiblemente por ficheros adicionales) |
| Número de tensores GGUF | 779, verificado por el autor |
| Runtime mínimo | `llama.cpp` build b11803 o superior (recomendado b11821+) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido denso-MoE. Las dos primeras capas (`blk.0` y `blk.1`) son MLP SwiGLU densas; a partir de `blk.2` y hasta `blk.48` se despliegan 47 capas MoE con 256 micro-expertos enrutados y top-k = 6, más un experto compartido activado en todos los tokens con tamaño intermedio 1024. El enrutamiento se realiza mediante matrices `ffn_gate_inp` que la cuantización mantiene en F32 para evitar colapso del router. Las 49 capas incorporan attention sinks aprendidos, un mecanismo de estabilización para streaming sobre contextos largos, con ventana deslizante de 513 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el proceso de alineamiento (RLHF, DPO u otros) ni innovaciones de decodificación del modelo base. La model card de esta cuantización se centra exclusivamente en el proceso de compresión: matriz de importancia (imatrix) calculada por Bartowski sobre 531 componentes de capa, con estadísticas de cuatro momentos, incluida la media de activaciones (`.in_sum`) para centrar la varianza en los optimizadores de codebook de IQ3_XXS y Q4_K, estadísticas extendidas (`.stats`) para evitar recorte de outliers y calibración alineada con la plantilla de chat nativa `<|system|>...<|user|>...<|assistant|>`.

El reparto de precisión es explícito: `output.weight` en Q6_K, `token_embd.weight` en Q4_K, proyecciones de atención Q/K/V en Q4_K, proyección de salida de atención en Q5_K, expertos compartidos en Q4_K, capas densas en Q4_K/Q5_K, expertos enrutados en IQ3_XXS y un conjunto de 294 tensores en F32 que incluye 49 attention sinks, 196 normalizaciones y 47 routers. El autor declara que el perfil MiniPlus no contiene ningún tensor en 2 bits.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, orientado a tareas de ingeniería de software.
- Comprensión y navegación de bases de código: el modelo base está descrito como especializado en investigar codebases, localizar bugs e implementar funcionalidades complejas.
- Generación de código y de tests unitarios, según la descripción del modelo base.
- Comportamiento agéntico y razonamiento de horizonte largo, favorecido por la ventana de 262.144 tokens.
- Soporte de contexto largo con attention sinks y ventana deslizante, pensado para flujos de streaming estables.
- Multilingüismo limitado: la model card declara únicamente inglés y código; no se documentan otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Vision, audio u otras modalidades: no disponibles; el pipeline es `text-generation`.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- **Agente de corrección de bugs en un repositorio**: el modelo puede recibir fragmentos amplios de código, trazas de error y tests fallidos dentro de una ventana de hasta 262.144 tokens, y proponer parches que después se validan en CI. La ventana deslizante con sinks permite mantener el contexto de conversación durante sesiones largas de depuración.
- **Implementación de funcionalidades con contexto de repositorio**: gracias al contexto extendido, se le puede pasar el árbol de ficheros, interfaces relevantes y convenciones del proyecto para que genere cambios coherentes con la arquitectura existente, en lugar de parches aislados.
- **Generación de tests unitarios**: el modelo base está descrito explícitamente para escribir tests comprehensivos; se integraría en un pipeline que, a partir de un diff, genere casos de prueba y los ejecute contra el código real.
- **Revisión de código automatizada en pull requests**: con un MoE de solo ~2,5 B de parámetros activos, el coste por token es bajo para un modelo de 39,79 B, lo que permite evaluar diffs grandes en un servidor con una sola GPU de 24 GB usando el perfil MiniPlus.
- **Asistente local de desarrollo con privacidad de código**: al caber en aproximadamente 14,70 GiB de pesos, puede desplegarse en una estación de trabajo con RTX 4090 o A6000 sin enviar código propietario a APIs externas, siempre que se acepte la pérdida de precisión de la cuantización de 3 bits en los expertos.
- **Exploración y explicación de código heredado**: sesiones multi-turno en las que el modelo resume módulos, responde preguntas sobre dependencias y genera documentación técnica, aprovechando el contexto largo para no fragmentar el repositorio en exceso.
- **Prototipado de agentes de múltiples pasos en local**: útil para experimentar con bucles de planificación, edición y verificación sin coste de API, con la advertencia de que el soporte de tool calling no está documentado y habría que implementarlo mediante prompting y parseo externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta cuantización no incluye MMLU, HumanEval, GSM8K ni métricas de calidad frente al modelo base, y la búsqueda web solo muestra listados de modelos y un agregador (`llm-bench.io`) sin cifras asociadas a esta versión. Tampoco se documentan mediciones de throughput o latencia.

## Requisitos de hardware

- **VRAM estimada para los pesos**: aproximadamente 14,70 GiB con el perfil APEX-I MiniPlus V2.1. Esta cifra no incluye la caché KV ni el contexto; con 262.144 tokens de contexto el consumo adicional puede ser muy elevado, aunque la ventana deslizante de 513 con attention sinks está pensada para limitar ese coste.
- **GPU de consumo**: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y, con poco margen para contexto, en GPU de 16 GB como RTX 4080 o 4090 recortada; en 16 GB conviene reducir contexto o descargar capas a CPU.
- **GPU profesionales**: A100 40/80 GB, H100, L40S y A6000 permiten contextos mucho mayores y mayor concurrencia, aunque no se publican cifras de throughput.
- **CPU y mixto**: al ser GGUF para `llama.cpp`, es posible ejecutarlo con offload parcial a CPU; el rendimiento dependerá del ancho de banda de memoria y del número de capas descargadas.
- **Opciones de despliegue**: `llama.cpp` es el runtime documentado, con la exigencia de la build b11803 o superior (recomendado b11821+) por el soporte nativo de `FlintForCausalLM` y attention sinks. No se confirma soporte en vLLM, TGI u Ollama en la información disponible; el modelo aparece en listados de LM Studio, pero sin instrucciones oficiales del autor.
- **Latencia y throughput**: no disponibles. El reducido número de parámetros activos (~2,5 B) sugiere un coste por token inferior al de un modelo denso de 39,79 B, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| Flint APEX-I-MiniPlus V2.1 (esta ficha) | 39,79 B | ~2,5 B | 262.144 | Mixta IQ3_XXS/Q4_K/Q5_K/Q6_K/F32, ~14,70 GiB | Apache-2.0 | GGUF |
| `RecursiveSI/flint` (modelo base) | 39,79 B | ~2,5 B | 262.144 | Pesos originales, no disponibles en detalle | Apache-2.0 | No disponible |
| `lmstudio-community/flint-GGUF` | ~40 B | ~2,5 B | No disponible | Cuantización estándar, perfil no detallado | No disponible | GGUF |
| Cyber-Tiel-Coder-35B-A3B-APEX-I-MiniPlus V2.1 | 35 B (según nombre) | ~3 B (según nombre) | No disponible | Perfil APEX-I MiniPlus | No disponible | GGUF |

No se dispone de resultados de rendimiento comparables entre estas variantes. La comparación relevante es de proceso: esta versión preserva routers y attention sinks en F32 y evita 2 bits, mientras que `lmstudio-community/flint-GGUF` emplea cuantizaciones estándar sin el reparto quirúrgico documentado. El modelo base es la referencia de calidad, pero no se han publicado evaluaciones que cuantifiquen la degradación de esta cuantización.

## Limitaciones y advertencias

- **Cuantización de terceros, no oficial**: el modelo lo publica IsValorum, no Recursive. La calidad final depende del perfil de cuantización y no está avalada por el autor del modelo base.
- **Expertos enrutados en 3 bits**: los 141 tensores de expertos enrutados se almacenan en IQ3_XXS. Aunque los routers están en F32, la capacidad de representación de los expertos es limitada y no se han publicado métricas de degradación frente al modelo original.
- **Ausencia total de benchmarks**: no hay MMLU, HumanEval, GSM8K ni evaluaciones de agente que permitan comparar esta versión con el modelo base u otras cuantizaciones.
- **Idiomas**: solo se declaran inglés y código. El rendimiento en castellano no está documentado y no debería asumirse.
- **Tool calling no documentado**: no se confirma soporte nativo de function calling ni de protocolos de agentes; cualquier integración requerirá prompting y parseo externo.
- **Contexto efectivo**: aunque se anuncian 262.144 tokens, la atención utiliza una ventana deslizante de 513 tokens con attention sinks. El comportamiento en tareas que exijan recuperación precisa en posiciones intermedias de contextos muy largos no está evaluado.
- **Dependencia de una build muy reciente de `llama.cpp`**: se requiere b11803 o superior. Versiones anteriores no cargarán correctamente el modelo o ignorarán los attention sinks.
- **Requisitos de VRAM infravalorados si se usa contexto largo**: los 14,70 GiB corresponden solo a los pesos; la caché KV para contextos grandes puede superar la capacidad de una GPU de 24 GB.
- **Discrepancia de tamaño del repositorio**: el Hub reporta 48,6 GB frente a los 15,79 GB del fichero descrito, lo que sugiere ficheros adicionales o versiones múltiples; conviene revisar los archivos antes de descargar.
- **Riesgo de alucinación**: como cualquier modelo de código, puede generar APIs inexistentes, imports incorrectos o parches que compilan pero no resuelven el problema. La verificación mediante tests y ejecución real es imprescindible.
- **Licencia**: Apache-2.0 permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base `RecursiveSI/flint`, así como de la imatrix utilizada, antes de un despliegue en producción.
- **Sesgos**: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad para el modelo base ni para esta cuantización.

## Enlaces

- [IsValorum/Flint-APEX-I-MiniPlus-V2.1-GGUF en Hugging Face](https://huggingface.co/IsValorum/Flint-APEX-I-MiniPlus-V2.1-GGUF)
- [Modelo base RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint)
- [Soporte en Ko-fi del autor de la cuantización](https://ko-fi.com/isvalorum)
- [Listado de modelos con etiqueta `apex` en Hugging Face](https://huggingface.co/models?other=apex)
- [Listado de cuantizaciones de RecursiveSI/flint](https://huggingface.co/models?other=base_model%3Aquantized%3ARecursiveSI%2Fflint)
- [Agregador de benchmarks para modelos locales](https://llm-bench.io/browse-models)
- Papers, blogs o demos oficiales: no disponibles en la información proporcionada.
