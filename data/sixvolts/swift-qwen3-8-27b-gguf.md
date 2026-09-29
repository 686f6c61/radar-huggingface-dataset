# SixVolts/Swift-Qwen3.8-27B-GGUF

## Resumen

SixVolts/Swift-Qwen3.8-27B-GGUF es una cuantización en formato GGUF de Swift-Qwen3.8-27B, el ajuste fino de UkisAI sobre Qwen3.8-27B (Alibaba Cloud). El repositorio no contiene solo el modelo: incluye tres ficheros, el modelo cuantizado a Q4_K_XL (16,57 GiB) y dos borradores de decodificación especulativa (DFlash2 de z-lab y un cabezal MTP), diseñados para caber y funcionar en una única GPU de 32 GB con 64k de contexto.

El problema que resuelve es de ingeniería de despliegue: hacer viable un modelo denso de 27.320.697.856 parámetros, con atención híbrida y ventana nativa de 262k tokens, en hardware de segunda mano (concretamente una AMD Radeon PRO V620, Navi 21/gfx1030, bajo ROCm), con velocidades decodificadas de 42-76 t/s gracias a los borradores, frente a los ~24 t/s sin ellos. La cuantización no es una receta genérica: sustituye los tensores que Unsloth guarda en formatos IQ por Q4_K porque los IQ desquantizan lento en gfx1030, y usa una importance matrix de Unsloth.

Es relevante ahora porque documenta de forma reproducible (scripts de construcción, sumas SHA256, servidor y benchmark) un caso real de inferencia local de un modelo de frontera de 27B en una sola tarjeta, y porque incluye la comparación de dos estrategias de decodificación especulativa con datos medidos por profundidad de contexto. La licencia Swift Open License v1.0 limita el uso comercial gratuito a organizaciones con facturación anual de hasta 1.000.000 USD.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida: atención lineal en 48 de 64 capas, más torre de visión y cabezal MTP integrado en el modelo base Qwen3.8-27B |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens en la configuración medida y publicada; 262.000 tokens nativos en Qwen3.8-27B, extensibles a 1M |
| Tipos de cuantizacion | Modelo: UD-Q4_K_XL por tensor (embeddings de tokens en Q4_K, salida en Q6_K, tensores que Unsloth publica en IQ convertidos a Q4_K). Borradores: Q4_0. Existen otras cuantizaciones del modelo base Swift (Q4_K_M, Q6_K_S, F16) en repos de terceros |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other"); los cuerpos de los borradores DFlash2 (z-lab) y MTP (Unsloth) son Apache License 2.0; Qwen3.8-27B es Apache License 2.0 |
| Formato de pesos | GGUF (llama.cpp); tres ficheros: Swift-Qwen3.8-27B-Q4_K_XL-noIQ.gguf (16,6 GiB), dflash-Qwen3.8-27B-Q4_0-d2t64k-swiftxl.gguf (1,3 GiB), mtp-Qwen3.8-27B-d2t64k-swiftxl.gguf (1,0 GiB). Tamaño total del repo: 20,3 GB |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3.8-27B, es un transformer denso de 27B parámetros con atención híbrida: 48 de sus 64 capas usan atención lineal y el resto atención completa, lo que reduce el coste de memoria de la caché KV en contextos largos. Incorpora además una torre de visión y un cabezal MTP (multi-token prediction) integrado, según la receta de vLLM para el modelo base. Swift-Qwen3.8-27B es el ajuste fino de UkisAI sobre esa base, orientado a razonamiento eficiente en tokens y uso conversacional según las etiquetas asociadas al modelo en repos derivados (efficient-thinking, reasoning, token-efficient, conversational); no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

Lo que aporta este repositorio no es entrenamiento, sino conversión y optimización: el fichero principal se cuantiza desde los pesos F16 de UkisAI con llama-quantize, aplicando la receta por tensor UD-Q4_K_XL de Unsloth con su importance matrix, con la modificación de guardar en Q4_K los tensores que Unsloth publica en formatos IQ (más rápidos de desquantizar en gfx1030). La divergencia KL frente al Q8_0 de Swift sobre texto reservado es de 0,0092, inferior a la del Q4_K_M propio de Swift (0,0134) pese a ocupar menos (16,57 GiB frente a 16,79 GiB). Los dos borradores comparten una innovación clave: el cabezal de salida completo de 248k tokens se sustituye por las 65.536 filas más probables de la proyección de salida de Swift, más un mapa d2t de filas a ids de token; ese subconjunto cubre el 98,9% de la salida del modelo en texto reservado y abarata varias veces el coste de drafting, que es la mayor parte del coste de un borrador. Ninguno de los tres ficheros implica reentrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, con el modelo base ajustado para uso de diálogo.
- Razonamiento con modo de pensamiento eficiente en tokens (etiquetas efficient-thinking, reasoning y token-efficient asociadas a Swift-Qwen3.8-27B).
- Contexto largo: 65.536 tokens en la configuración medida; el modelo base declara 262k nativos y extensibles a 1M.
- Decodificación especulativa con dos borradores alternativos: DFlash2 (bloques, hasta 7 tokens de borrador adaptativos) y MTP (3 tokens). Los borradores no alteran la distribución de salida, solo la velocidad.
- Procesamiento de imágenes: el modelo base Qwen3.8-27B incluye torre de visión según la receta de vLLM y el repositorio derivado de Swift se etiqueta como Image-Text-to-Text; no se confirma en la información disponible que este GGUF concreto conserve el proyector de visión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Despliegue compatible con endpoints (etiqueta endpoints_compatible) y con imatrix (importancia matricial) para cuantización.

## Casos de uso

- Asistente conversacional local en una sola GPU de 32 GB: el modelo cuantizado ocupa 16,6 GiB y con los borradores activos se sirve con llama-server a 64k de contexto, lo que permite mantener un asistente de uso personal o de equipo sin depender de APIs externas.
- Atención al cliente automatizada con conversaciones largas: los 65.536 tokens de ventana permiten arrastrar historial, documentación de producto y tickets previos en una misma sesión sin truncar; el modo borrador (MTP a 48 t/s a 40k de profundidad) mantiene la latencia baja a medida que crece el contexto.
- Resumen y análisis de documentos extensos: con 278 t/s de prefill a 64k y 172 t/s a 128k, es viable ingerir informes o expedientes largos y generar resúmenes; el autor publica precisamente una tarea de resumen de texto largo como benchmark de profundidad.
- Despliegue en hardware de segunda mano para laboratorios con presupuesto ajustado: el setup completo está validado sobre una Radeon PRO V620 (Navi 21, gfx1030) con ROCm y se documenta el BIOS, kernel, build de llama.cpp y servidor, lo que reduce el coste de entrada frente a GPUs de datacenter recientes.
- Investigación en decodificación especulativa: los dos borradores incluidos permiten comparar empíricamente DFlash2 (mejor en trabajo mixto corto, hasta 43,5 t/s en chat) frente a MTP (mejor más allá de ~30k tokens porque su coste no crece con la profundidad), con el mismo modelo y el mismo hardware.
- Evaluación de cuantizaciones y fine-tunes: la ficha publica KLD frente a Q8_0 (0,0092) y scripts que reconstruyen los ficheros de forma byte-idéntica, útil para medir el impacto de recetas de cuantización en otras variantes.
- Generación y revisión de código en local: sirve para tareas de asistencia de código dentro de un entorno controlado, aunque no se confirma en la información disponible el soporte de tool calling ni su integración en pipelines de CI/CD.
- Banco de pruebas de inferencia con contexto creciente: las tablas de throughput por profundidad (4k a 120k) permiten dimensionar servicios y estimar costes de latencia antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Sí hay datos de rendimiento medidos por el autor sobre una Radeon PRO V620, que se reproducen a continuación.

Divergencia KL frente al Q8_0 de Swift, sobre texto reservado:

| Fichero | Tamaño | KLD |
|---|---|---|
| Este repositorio (Q4_K_XL) | 16,57 GiB | 0,0092 |
| Q4_K_M de Swift | 16,79 GiB | 0,0134 |

Velocidad de decodificación en una V620 (llama-server, temperatura 1.0, top-p 0.95, top-k 20, `--spec-draft-temp 1.0`):

| Borrador | Chat de investigación | Matemáticas | Código | Listas | Ensayo |
|---|---|---|---|---|---|
| Ninguno | 24,3 t/s | ~24 t/s | ~24 t/s | ~24 t/s | ~24 t/s |
| MTP, 3 tokens | 44,2 t/s | 62 t/s | 54 t/s | 64 t/s | 43 t/s |
| DFlash2, hasta 7 | 42,3-43,5 t/s | 76 t/s | 54 t/s | 69 t/s | 40 t/s |

Velocidad de decodificación según la profundidad del contexto (tarea de resumen de texto largo):

| Profundidad | Sin borrador | MTP | DFlash2 |
|---|---|---|---|
| 4k | 24,1 t/s | 55,3 t/s | 50,0 t/s |
| 16k | 23,0 t/s | 53,0 t/s | 55,3 t/s |
| 40k | 21,4 t/s | 48,0 t/s | 41,6 t/s |
| 80k | 19,3 t/s | 47,2 t/s | 39,2 t/s |
| 120k | 17,4 t/s | 44,1 t/s | 32,0 t/s |

Prefill sin borrador: 492 t/s con contexto vacío, 416 t/s a 16k, 278 t/s a 64k y 172 t/s a 128k.

## Requisitos de hardware

- El autor valida el conjunto completo en una única GPU de 32 GB (AMD Radeon PRO V620, Navi 21, gfx1030) con 64k de contexto, bajo ROCm.
- El fichero del modelo pesa 16,6 GiB, a lo que hay que sumar la caché KV, el contexto y las activaciones; la configuración publicada usa `-ngl 99 -fa on -c 65536`. Además hay que cargar el borrador elegido (1,0 GiB MTP o 1,3 GiB DFlash2).
- GPU recomendadas por el autor: Radeon PRO V620 de 32 GB (hardware de segunda mano con ROCm). No se especifican otros modelos de GPU en la información disponible.
- GPUs de consumo: con 16,6 GiB solo en pesos, una tarjeta de 16 GB queda al límite; una de 24 GB (RTX 3090/4090) es viable reduciendo contexto o usando cuantizaciones menores. Una guía de terceros sobre Qwen3.8-27B sitúa su ejecución en el rango de 16-24 GB de VRAM, pero no evalúa específicamente esta cuantización.
- Opciones de despliegue: llama.cpp con llama-server (es el camino documentado; los borradores requieren el fork sixvolts/llama-navi21-furnace, rama `main`, porque el vocabulario reducido del borrador MTP y `--spec-draft-temp` no están en upstream). El modelo en sí es un GGUF estándar. Para el modelo base Qwen3.8-27B existe receta de vLLM, y guías de terceros citan Ollama y LM Studio para el modelo sin los borradores.
- Latencia y throughput medidos: 24,3 t/s sin borrador en chat; hasta 44,2 t/s con MTP y hasta 76 t/s con DFlash2 en matemáticas; prefill de 492 t/s en vacío y 172 t/s a 128k. A partir de ~30k tokens de contexto, MTP supera a DFlash2 porque su coste no crece con la profundidad.
- Comando de referencia (DFlash2): `llama-server -m Swift-Qwen3.8-27B-Q4_K_XL-noIQ.gguf -ngl 99 -fa on -c 65536 -md dflash-Qwen3.8-27B-Q4_0-d2t64k-swiftxl.gguf -ngld 99 --spec-type draft-dflash --spec-draft-n-max 7 --spec-draft-temp 1.0 --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Tamaño | Licencia |
|---|---|---|---|---|---|
| SixVolts/Swift-Qwen3.8-27B-GGUF (este) | 27,32B denso | 64k configurado; 262k nativo del base | GGUF Q4_K_XL + 2 borradores Q4_0 | 16,57 GiB (+2,3 GiB de borradores) | Swift Open License v1.0 |
| Q4_K_M de Swift-Qwen3.8-27B (upstream) | 27,32B denso | No disponible | GGUF Q4_K_M | 16,79 GiB | Swift Open License v1.0 |
| taurusduan/Swift-Qwen3.8-27B-GGUF (duplicado) | 27,32B denso | No disponible | GGUF (incluye Q6_K_S) | No disponible | Swift Open License v1.0 |
| unsloth/Qwen3.8-27B-GGUF | 27B denso | 262k nativo | GGUF, incluye borrador MTP Q4_0 y receta UD | No disponible | Apache License 2.0 |
| Qwen/Qwen3.8-27B | 27B denso | 262k nativo, extensible a 1M | safetensors | No disponible | Apache License 2.0 |
| z-lab/Qwen3.8-27B-DFlash2-GGUF (solo borrador) | No disponible | No disponible | GGUF BF16 | No disponible | Apache License 2.0 |

Frente al Q4_K_M de Swift, esta receta consigue menor divergencia KL (0,0092 frente a 0,0134) con menor tamaño. Frente al Qwen3.8-27B original, la diferencia es el ajuste fino de UkisAI y las restricciones de licencia (Apache 2.0 en el original, Swift Open License con tope de facturación en el derivado). Frente al GGUF de Unsloth, el valor diferencial es la receta adaptada a gfx1030 y los borradores con vocabulario reducido.

## Limitaciones y advertencias

- Licencia restrictiva para uso comercial: la Swift Open License v1.0 permite uso personal, de investigación, educativo, de evaluación y comercial solo a individuos y organizaciones con facturación bruta anual de hasta 1.000.000 USD; por encima se requiere una Swift Enterprise License de UkisAI. Los tres ficheros del repositorio contienen pesos de Swift, por lo que los tres quedan bajo esa licencia.
- No hay benchmarks estándar publicados (MMLU, HumanEval, GSM8K, etc.) en la información disponible; las únicas métricas son KLD y velocidades medidas por el autor.
- Las velocidades están medidas en un único hardware (Radeon PRO V620, gfx1030, ROCm) y no son extrapolables directamente a otras GPUs ni a otros backends.
- Los borradores no funcionan en llama.cpp upstream: requieren el fork sixvolts/llama-navi21-furnace (rama `main`) por el vocabulario reducido del MTP y el parámetro `--spec-draft-temp`.
- El vocabulario de los borradores se reduce de 248k a 65.536 tokens: los tokens fuera de ese conjunto no se pueden proponer como borrador. Afecta solo a la velocidad, no a la distribución de salida, y el conjunto retenido cubre el 98,9% de la salida del modelo en texto reservado.
- La cuantización Q4_K_XL introduce pérdida de precisión respecto al Q8_0 de referencia (KLD 0,0092), mayor en tareas sensibles a la fidelidad numérica o de formato.
- Resolución de contexto: la configuración validada es de 65.536 tokens; usar los 262k o 1M nativos del modelo base requiere más VRAM para la caché KV, no cuantificada en la información disponible.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de alucinación para este ajuste ni para su cuantización.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Soporte de visión: aunque el modelo base y los repos derivados lo etiquetan como Image-Text-to-Text, no se confirma que este GGUF incluya el proyector de visión, ni que los borradores funcionen con entradas multimodales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de terceros más allá de la reproducibilidad declarada (sumas SHA256 y scripts).
- Uso de formatos de cuantización no estándar (Q4_K en lugar de IQ para ciertos tensores): puede afectar a comparaciones directas con otras cuantizaciones del mismo modelo en otros backends.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SixVolts/Swift-Qwen3.8-27B-GGUF
- Modelo base del ajuste: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- GGUF de Unsloth con importance matrix y borrador MTP: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Borrador DFlash2 de z-lab: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Fork de llama.cpp necesario para los borradores: https://github.com/sixvolts/llama-navi21-furnace
- Scripts de despliegue y reproducción: https://github.com/sixvolts/llama-webui-tools/tree/main/deploy
- Script de reconstrucción de los tres ficheros: https://github.com/sixvolts/llama-webui-tools/blob/main/deploy/scripts/make-models.sh
- Duplicado del GGUF de Swift con cuantización Q6_K_S: https://huggingface.co/taurusduan/Swift-Qwen3.8-27B-GGUF
- Ficha de la cuantización en local-ai-zone: https://local-ai-zone.github.io/models/swift-qwen3-8-27b.html
- Guía de ejecución local de Qwen3.8-27B en 16-24 GB: https://codersera.com/blog/how-to-run-qwen-3-8-locally-2026/
