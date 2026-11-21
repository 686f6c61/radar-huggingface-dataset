# Cyronius/memdraft

## Resumen

MemDraft es un conjunto de artefactos de decodificación especulativa (drafters) para llama.cpp, no un modelo de lenguaje en sentido estricto. Lo desarrolla Cyronius y su función es acelerar la inferencia de un modelo objetivo concreto, en este caso Qwen3.5-9B, sin necesidad de un modelo borrador separado. En lugar de proponer tokens con una red neuronal adicional, MemDraft los extrae de una tabla de búsqueda construida a partir de texto generado por el propio modelo objetivo, y un pequeño reranker MLP selecciona entre las propuestas.

El repositorio contiene dos ficheros por modelo objetivo: una tabla `.mdt` de 256 MiB y un reranker `.mdr` de 124 MiB, con un total de 0,4 GB. Se cargan mediante un plugin de llama.cpp que hay que compilar y aplicar sobre el árbol de llama.cpp, según se detalla en el repositorio de GitHub del proyecto. La tabla está especializada en dominio de código y se ha construido con 77,5 millones de tokens.

La relevancia de este lanzamiento es práctica: ofrece ganancias de velocidad de entre 1,85x y 3,57x en cargas de trabajo de código sobre Qwen3.5-9B cuantizado a Q4_K_M, con verificación sin pérdida (lossless) y una degradación de pass@1 en HumanEval de 83,5% frente a 84,8% del decodificado plano, atribuida a que el decodificado por lotes de llama.cpp no es bit-exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla de búsqueda de n-gramas (`.mdt`) más reranker MLP (`.mdr`) para decodificación especulativa |
| Parametros totales | No disponible (el reranker es un MLP pequeño; no se publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo Qwen3.5-9B) |
| Tipos de cuantizacion | No aplica al drafter; el modelo objetivo de referencia se usa en Q4_K_M |
| Idiomas soportados | No disponible (la tabla se construyó con texto en inglés mayoritariamente: OSS-Instruct, GSM8K, MATH, UltraChat) |
| Licencia | Apache 2.0 (ficheros derivados de los pesos de Qwen3.5-9B); el código de MemDraft es MIT |
| Formato de pesos | `.mdt` (tabla de búsqueda) y `.mdr` (reranker MLP) |
| Modelo objetivo | Qwen/Qwen3.5-9B |
| Dominio del drafter | Código |
| Tamano de la tabla | 256 MiB |
| Tamano del reranker | 124 MiB |
| Hash de vocabulario | `c52114e74bc3a20f` (248.070 tokens) |
| Tokens de construccion de la tabla | 77,5 M tokens; 14,8 M entradas (contextos vistos al menos 3 veces) |
| Integracion | Plugin de llama.cpp (`--spec-type ngram-simple,plugin`) |

## Arquitectura y entrenamiento

MemDraft no entrena un modelo borrador generativo. Construye una tabla de búsqueda de n-gramas a partir de texto generado por el modelo objetivo y, en tiempo de inferencia, propone tokens consultando esa tabla. Un reranker MLP de pequeño tamaño elige entre las propuestas de la tabla; este reranker se ha ajustado sobre posiciones del código generado por el 9B e incorpora proyecciones de 64 dimensiones de los embeddings de tokens del modelo objetivo. La verificación de las propuestas la realiza el modelo objetivo, de modo que el resultado es lossless respecto al decodificado del propio modelo.

La tabla se construyó con 77,5 millones de tokens de texto, conservando solo contextos observados al menos tres veces, lo que da 14,8 millones de entradas. La composición es: respuestas del 9B a unos 74.000 prompts de Magicoder-OSS-Instruct-75K con temperatura 0 y modo thinking desactivado; las soluciones gpt-3.5 del propio dataset; y texto de chat y matemáticas generado por el 9B a partir de prompts de GSM8K, MATH, OpenThoughts y UltraChat. El drafter se puede combinar con el cabezal MTP del 9B (1 token) y con `ngram-simple` de llama.cpp antes de aplicar MemDraft (3 tokens).

## Capacidades

- Aceleración de decodificación especulativa sobre Qwen3.5-9B en llama.cpp, con verificación lossless de las propuestas.
- Propuesta de hasta 3 tokens por paso mediante tabla de búsqueda, con reranker opcional para seleccionar entre candidatos.
- Combinación con otras técnicas de drafting de llama.cpp: `ngram-simple` y el cabezal MTP del modelo objetivo.
- Especialización en dominio de código: la tabla se construyó con código generado por el 9B y soluciones de OSS-Instruct.
- Compatibilidad de la tabla con cualquier modelo que use el tokenizador de la familia Qwen3.5/3.6/3.8 (248.070 tokens), validada por `vocab_hash`.
- El reranker se carga con otros modelos de la familia, aunque no se ha medido su rendimiento en ellos.
- No es un modelo generativo: no produce texto por sí mismo, no soporta tool calling ni agentes, y su "capacidad" es exclusivamente acelerar el modelo objetivo.

## Casos de uso

- Servido de Qwen3.5-9B para asistencia de código en producción: el drafter de código acelera la generación de respuestas de programación, con ganancias medidas de 1,85x a 3,57x según la carga, lo que reduce el coste por token en entornos de autocompletado o chat de código.
- Autocompletado en IDE o editor: al estar especializado en código y ser lossless, puede desplegarse tras un `llama-server` para completar fragmentos con baja latencia en GPUs de consumo.
- Evaluación de pipelines de generación de código: el drafter permite ejecutar baterías tipo HumanEval más rápido (3,29x a 3,57x) manteniendo la calidad del modelo objetivo, útil para iterar sobre prompts y configuraciones.
- Despliegue en hardware de gama media: con el modelo objetivo en Q4_K_M y el drafter como plugin, se puede servir en una GPU integrada (el autor reporta un AMD Radeon 8060S vía Vulkan) manteniendo velocidades superiores al decodificado plano.
- Reducción de coste en inferencia por lotes: en tareas de generación de código a gran escala (por ejemplo, síntesis de tests o documentación) el ahorro de pasos de decodificación se traduce en menor tiempo de GPU.
- Investigación en decodificación especulativa: sirve como referencia reproducible para comparar drafting basado en tabla frente a drafting con modelo borrador o MTP, ya que el autor publica metodología, hashes y métricas.
- Integración en servidores llama.cpp existentes: al ser un plugin, se puede añadir a un despliegue ya operativo de Qwen3.5-9B sin cambiar el modelo servido.

## Benchmarks y rendimiento

Datos publicados por el autor con Qwen3.5-9B Q4_K_M en AMD Radeon 8060S vía Vulkan, decodificado greedy, frente a decodificado plano (38 tok/s):

| Configuracion | Prompts de codigo (12 OSS-Instruct, 2 rondas) | HumanEval (12 problemas) |
|---|---:|---:|
| `ngram-simple` y luego MemDraft (3 tokens) | 1,85x | 3,29x |
| `ngram-simple`, luego cabezal MTP del 9B (1 token), luego MemDraft (3 tokens) | 2,14x | 3,57x |
| `draft-mtp` de llama.cpp en solitario (referencia) | 1,94x | 2,30x |

Calidad: sobre los 164 problemas de HumanEval, pass@1 fue 83,5% con MemDraft y 84,8% con decodificado plano. El autor atribuye la diferencia a que el decodificado por lotes de llama.cpp no es bit-exacto y algunos outputs divergen en empates cercanos.

Respuestas retenidas, estimación offline con los costes de paso medidos en GPU del 9B, drafting de 3 tokens: 2,01 tokens por paso y 1,65x previsto con reranker; 1,86 tokens por paso y 1,53x sin reranker.

## Requisitos de hardware

- El drafter añade 256 MiB (tabla) más 124 MiB (reranker) sobre el modelo objetivo; el total del repo es de 0,4 GB.
- Requiere el modelo objetivo Qwen3.5-9B, de referencia en Q4_K_M; la VRAM depende de esa cuantización y de la longitud de contexto configurada.
- GPU de referencia del autor: AMD Radeon 8060S (GPU integrada) vía Vulkan, con 38 tok/s en decodificado plano.
- Cabe en GPU de consumo; el autor no publica requisitos mínimos de VRAM ni mediciones en RTX 4090, A100 o H100.
- Despliegue mediante `llama-server` de llama.cpp con el plugin de MemDraft compilado y aplicado sobre el árbol de llama.cpp.
- Parámetros de carga: `--spec-type ngram-simple,plugin`, `--spec-plugin-n-max 3`, `--spec-plugin` apuntando a `libmemdraft.so` y `--spec-plugin-args` con `table`, `reranker`, `pad` y `vocab_hash`.
- Throughput: ganancias relativas de 1,85x a 3,57x sobre 38 tok/s según carga; no se publican latencias absolutas por token ni throughput en otras GPU.
- No se documenta soporte para vLLM, TGI ni Ollama; la integración es exclusiva de llama.cpp vía plugin.

## Comparativa con modelos similares

| Alternativa | Tipo | Modelo borrador separado | Ganancia medida (codigo / HumanEval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MemDraft (este repo) | Tabla de búsqueda + reranker MLP | No | 1,85x-3,57x | Apache 2.0 (ficheros), MIT (código) | Hugging Face y GitHub |
| `draft-mtp` de llama.cpp | Cabezal MTP del modelo objetivo | No | 1,94x / 2,30x | Según llama.cpp | Incluido en llama.cpp |
| `ngram-simple` de llama.cpp | Búsqueda de n-gramas simple | No | No disponible de forma aislada | Según llama.cpp | Incluido en llama.cpp |
| Drafting con modelo borrador dedicado | Modelo pequeño independiente | Sí | No disponible en esta informacion | Variable | Variable |

No se dispone de comparaciones publicadas con drafters de terceros para Qwen3.5-9B en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling, agentes ni multimodalidad. Solo acelera Qwen3.5-9B.
- La tabla está especializada en código; su rendimiento en otros dominios (chat general, matemáticas puras, texto largo) no se ha medido ni publicado.
- El reranker se entrenó contra el 9B; se carga con otros modelos de la familia Qwen3.5/3.6/3.8, pero su rendimiento en ellos no está medido.
- El plugin rechaza tokenizadores distintos al hash `c52114e74bc3a20f`; no es portable a otras familias de modelos sin reconstruir la tabla.
- Requiere compilar y aplicar un parche sobre llama.cpp, lo que añade complejidad operativa y dependencia de la versión del árbol.
- La calidad no es idéntica al decodificado plano: pass@1 cae de 84,8% a 83,5% en HumanEval por la falta de bit-exactitud del decodificado por lotes de llama.cpp.
- Las mediciones de velocidad proceden de una única configuración de hardware (Radeon 8060S, Vulkan, Q4_K_M); no hay datos en NVIDIA, CUDA ni otras cuantizaciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y solo un modelo objetivo soportado; es un proyecto incipiente.
- Licencia Apache 2.0 para los ficheros del drafter y MIT para el código; el uso comercial está permitido, pero conviene verificar la licencia del modelo objetivo y de los datasets empleados en la construcción de la tabla.
- Riesgo de sesgos heredados del texto usado para construir la tabla (OSS-Instruct, GSM8K, MATH, OpenThoughts, UltraChat) y del propio Qwen3.5-9B.
- No hay información sobre idiomas distintos del inglés en la construcción de la tabla.

## Enlaces

- Hugging Face: https://huggingface.co/Cyronius/memdraft
- Repositorio GitHub de MemDraft: https://github.com/Cyronius/memdraft
- Modelo objetivo Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
