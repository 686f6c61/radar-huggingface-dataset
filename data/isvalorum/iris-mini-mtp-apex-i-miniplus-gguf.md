# IsValorum/Iris-mini-MTP-APEX-I-MiniPlus-GGUF

## Resumen

Iris-mini-MTP-APEX-I-MiniPlus-GGUF es una cuantización GGUF del modelo base AllSpark-Research/Iris-mini, publicada por el usuario IsValorum. El modelo original emplea una arquitectura identificada en la model card como `qwen35moe`, que combina mezcla de expertos (MoE) con una capa nativa de predicción multi-token (MTP). La versión cuantizada conserva esa capa MTP íntegra, lo que permite usarla como su propio modelo borrador para decodificación especulativa dentro de llama.cpp, sin necesidad de un draft model externo.

El dato de parámetros totales reportado en safetensors es de 35.505.251.456 (aproximadamente 35,5 mil millones). El archivo GGUF resultante ocupa 14,84 GB (13,82 GiB), gracias a una receta de cuantización mixta calibrada con importance matrix denominada APEX-I-MiniPlus, que asigna precisión variable según la sensibilidad de cada capa.

La relevancia de esta publicación es doble: por un lado, comprime un modelo MoE de ~35,5B en un único archivo que cabe en GPUs de consumo con 24 GB de VRAM; por otro, demuestra que la capa MTP nativa puede aprovecharse en llama.cpp con una tasa de aceptación medida del 58,8 % al 65,5 %, lo que se traduce en 1,59–1,66 tokens por paso. La licencia es Apache-2.0 y los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (mezcla de expertos, MoE, con capa nativa de predicción multi-token) |
| Parámetros totales | 35.505.251.456 (según safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 8192`, pero se trata de un ajuste de ejecución, no de una especificación confirmada) |
| Tipos de cuantización | Receta mixta APEX-I-MiniPlus: `Q6_K` (cabeza de salida), `Q3_K` (expertos de borde, capas 0–9 y 30–39), `IQ3_XXS` ~3,06 bpw (expertos enrutados centrales, capas 10–29), `Q3_K`/`Q4_K` (expertos compartidos y enrutamiento), `Q3_K`/`Q4_K`/`Q5_K` (capa MTP `blk.40`) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único `Iris-mini.APEX-I-MiniPlus.gguf`, 14,84 GB / 13,82 GiB) |

## Arquitectura y entrenamiento

El modelo base AllSpark-Research/Iris-mini se etiqueta con la arquitectura `qwen35moe`, es decir, un transformer con mezcla de expertos al que se añade una capa de predicción multi-token. La capa MTP ocupa el bloque `blk.40.nextn` y funciona como un bloque de predicción de un solo paso: el propio modelo genera el token borrador que después verifica en la pasada principal, lo que evita mantener en memoria un segundo modelo borrador. Según la model card, esto habilita decodificación especulativa de coste prácticamente nulo en cuanto a VRAM adicional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la configuración interna de la MoE (número de expertos, top-k de enrutamiento, dimensión oculta o número de capas más allá de la referencia a las capas 0–39 en la tabla de cuantización). La innovación técnica destacable de esta publicación concreta es la receta de cuantización APEX-I-MiniPlus: calibrada con importance matrix, aplica precisión variable por sensibilidad, comprimiendo los expertos internos a `IQ3_XXS` mientras mantiene en `Q6_K` la cabeza de salida y en `Q3_K`/`Q4_K`/`Q5_K` la capa MTP, con el objetivo de preservar tanto la fidelidad de las probabilidades de token como la calidad de los borradores especulativos.

## Capacidades

- Generación de texto conversacional multi-turno, según los ejemplos de uso con `-cnv` incluidos en la model card.
- Decodificación especulativa nativa mediante la capa MTP integrada (`--spec-type draft-mtp`), con tasa de aceptación medida del 58,8 % al 65,5 %.
- Razonamiento multi-turno: los benchmarks de MTP declarados se midieron "across multi-turn reasoning and conversational prompts".
- Capacidades multilingües limitadas a inglés y chino según los metadatos declarados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; la model card solo menciona razonamiento multi-turno conversacional.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` aparece en los metadatos de HuggingFace.

## Casos de uso

- Asistente conversacional local en inglés o chino: al ocupar 14,84 GB en GGUF y caber en una GPU de 24 GB, puede desplegarse en una estación de trabajo sin depender de APIs externas, con `llama-server` exponiendo un endpoint compatible con OpenAI.
- Atención al cliente bilingüe: el modelo cubre en/zh, lo que permite atender consultas de usuarios de ambos mercados con un único despliegue, usando la capacidad conversacional multi-turno descrita en la model card.
- Generación asistida en producción con latencia reducida: activando `--spec-type draft-mtp` con `--spec-draft-n-max 1` y `--spec-draft-p-min 0.8` se obtienen 1,59–1,66 tokens por paso, lo que reduce el tiempo de respuesta en generaciones largas sin añadir VRAM.
- Inferencia en servidor de gama media: al comprimir los expertos internos a `IQ3_XXS` (unos 3,06 bpw), el modelo puede servirse en GPUs de 24 GB junto con la caché KV necesaria para 8192 tokens de contexto.
- Prototipado e investigación sobre MoE y decodificación especulativa: sirve como banco de pruebas para medir tasas de aceptación de MTP en llama.cpp con distintas profundidades de borrador y umbrales de probabilidad.
- Despliegue offline o en entornos con restricciones de red: al ser un archivo GGUF único con licencia Apache-2.0, puede copiarse a máquinas aisladas y ejecutarse con llama.cpp sin componentes adicionales.
- Evaluación comparativa de recetas de cuantización: permite contrastar la receta APEX-I-MiniPlus (mixta con iMatrix) frente a cuantizaciones uniformes del mismo modelo base en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento medidos son los de la decodificación especulativa con la capa MTP:

| Métrica | Valor medido |
|---|---|
| Tasa de aceptación del borrador | 58,8 % – 65,5 % |
| Media de tokens por paso | 1,59 – 1,66 tokens/paso |
| Mejor caso en generación continua | Hasta 2,0 tokens/paso (100 % de aceptación del borrador) |
| Entorno de medición | llama.cpp, sobre prompts de razonamiento multi-turno y conversacionales |

Parámetros recomendados por el autor para la decodificación especulativa:

| Argumento | Valor | Descripción |
|---|---|---|
| `--spec-type` | `draft-mtp` | Activa la decodificación especulativa con MTP nativo |
| `--spec-draft-n-max` | `1` | Coincide con el único bloque MTP nativo |
| `--spec-draft-p-min` | `0,7` – `0,8` | Umbral mínimo de probabilidad para aceptar tokens borrador |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 14,84 GB (13,82 GiB); con caché KV para 8192 tokens de contexto hay que añadir varios GB, por lo que conviene reservar del orden de 17–20 GB en total. Cifra orientativa derivada del tamaño de archivo, no confirmada por el autor.
- GPU recomendadas: RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden cargar el modelo completo con `-ngl 99 -c 8192`. A100 (40/80 GB) y H100 ofrecen margen sobrado para lotes mayores y contextos más largos.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB. En tarjetas de 16 GB (por ejemplo, RTX 4080) será necesario descargar capas a CPU o reducir el contexto, a menos que se use una cuantización más agresiva que la publicada.
- Memoria unificada: en Apple Silicon, un sistema con 32 GB o más de memoria unificada debería poder ejecutarlo, aunque esto no está confirmado por el autor.
- Opciones de despliegue: llama.cpp (`llama-server` y `llama-cli`) es el único backend documentado por el autor, con los flags `--spec-type draft-mtp`, `--spec-draft-n-max 1` y `--spec-draft-p-min 0.8`. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no hay cifras absolutas de tokens por segundo publicadas. El único dato relativo es la ganancia de la decodificación especulativa, con 1,59–1,66 tokens por paso y un mejor caso de 2,0.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos en la información proporcionada, por lo que la comparación se limita al propio modelo base frente a su versión cuantizada:

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| IsValorum/Iris-mini-MTP-APEX-I-MiniPlus-GGUF | 35,5B (activos: no disponible) | no disponible | GGUF, 14,84 GB | Apache-2.0 | Cuantización mixta con iMatrix; conserva la capa MTP |
| AllSpark-Research/Iris-mini (modelo base) | 35,5B | no disponible | safetensors | Apache-2.0 | Modelo original sin cuantizar; arquitectura `qwen35moe` |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos comparables en la información disponible |

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros), por lo que no es posible estimar la degradación introducida por la cuantización mixta a `IQ3_XXS` en los expertos internos.
- El uso de `IQ3_XXS` (~3,06 bpw) en las capas 10–29 implica una pérdida de precisión relevante en los expertos centrales; la model card no aporta comparaciones con el modelo en bf16/fp16.
- Idiomas soportados limitados a inglés y chino. No hay evidencia de buen rendimiento en castellano ni en otras lenguas.
- No se documenta el número de parámetros activos ni la configuración de la MoE, lo que impide estimar el coste real de cómputo por token.
- La longitud de contexto real del modelo base no se especifica; los `-c 8192` de los ejemplos son ajustes de ejecución y no deben interpretarse como el máximo soportado.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible.
- Sesgos: no documentados. Al no haber información sobre el dataset de entrenamiento, no se puede evaluar la composición ni los sesgos potenciales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base AllSpark-Research/Iris-mini, así como las de los pesos originales sobre los que se ha generado esta cuantización.
- Estado del repositorio: en el momento de la consulta figura con 0 descargas y 0 "likes", por lo que no existe validación comunitaria de la calidad de la cuantización. La fecha de creación registrada (2026-09-14) resulta inconsistente con el contexto temporal habitual, lo que aconseja tratar los metadatos con cautela.
- Compatibilidad: el autor solo documenta llama.cpp; el uso en otros motores de inferencia no está verificado, especialmente en lo relativo al soporte de la capa MTP.
- La decodificación especulativa MTP requiere invocar el modelo con los flags adecuados; en caso contrario, el rendimiento cae al de una generación autoregresiva convencional y la capa MTP queda desaprovechada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IsValorum/Iris-mini-MTP-APEX-I-MiniPlus-GGUF
- Modelo base: https://huggingface.co/AllSpark-Research/Iris-mini
- Otros enlaces (papers, blogs, repositorios, demos): no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
