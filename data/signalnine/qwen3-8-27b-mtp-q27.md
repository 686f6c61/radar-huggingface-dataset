# signalnine/Qwen3.8-27B-MTP-q27

## Resumen

`Qwen3.8-27B-MTP-q27` es una colección de artefactos cuantizados del modelo base `Qwen/Qwen3.8-27B` (un modelo de la familia Qwen3, de 27 mil millones de parámetros según su nomenclatura) en el formato propietario `.q27` del motor de inferencia [q27](https://github.com/signalnine/q27). El autor, signalnine, ha convertido los pesos oficiales desde safetensors a BF16 GGUF y posteriormente a `.q27`, conservando el head MTP (multi-token prediction) entrenado del modelo original, lo que permite que el motor q27 active su "escalera especulativa" para acelerar la decodificación.

La relevancia de este modelo radica en que ofrece cuatro tiers de cuantización (`q4s`, `default`, `q6`, `q6k`) con tamaños que van desde 15.70 GB hasta 22.52 GB, todos ellos con una perplejidad en wikitext inferior a la de las recetas anteriores de la serie Qwen3.6, según el autor. Las recetas v2 se derivaron mediante un barrido de sensibilidad por tensor específico para este checkpoint, ya que las recetas de Qwen3.6 no se transfieren correctamente. El modelo está pensado para entornos con restricciones de VRAM (24 GB o 32 GB) y para casos de uso agénticos con soporte de tool calling y razonamiento.

La licencia es Apache 2.0, lo que permite uso comercial, pero el formato de pesos `.q27` es propietario y requiere el motor q27 para su ejecución. El repositorio no registra descargas ni likes, y la fecha de creación es agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.8-27B, probablemente transformer con head MTP) |
| Parametros totales | no disponible (el nombre sugiere 27B, no confirmado) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (pruebas de needle-in-haystack alcanzan ~120K tokens en tiers q4s y default) |
| Tipos de cuantizacion | q27 (propietario), tiers: q4s, default, q6, q6k |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | .q27 (convertido desde safetensors via BF16 GGUF) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `Qwen/Qwen3.8-27B`. La información proporcionada no detalla la arquitectura interna del modelo base (si es un transformer denso o MoE, número de capas, etc.), pero sí se indica que conserva el head MTP entrenado (15 tensores en `blk.64`), lo que permite al motor q27 ejecutar decodificación especulativa. El proceso de cuantización se realizó convirtiendo los pesos oficiales a BF16 GGUF y luego al formato `.q27`, con recetas v2 derivadas mediante un barrido de sensibilidad por tensor (BUILDLOG 2026-08-14). El autor advierte que las recetas de Qwen3.6 no se transfieren a este checkpoint: por ejemplo, la promoción Q8 de `ssm_out` que funcionaba en Qwen3.6 resulta perjudicial en Qwen3.8, aumentando la perplejidad en un 14% en pasadas de 24K tokens frente a un 0.26% en procesamiento por fragmentos. No se proporcionan datos sobre el entrenamiento original del modelo base (tokens, dataset, RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento: como cuantización de Qwen3.8-27B, hereda las capacidades del modelo base, aunque no se detallan en la información proporcionada.
- Soporte de tool calling / function calling: la model card menciona que el motor q27 (commit >= eb4a6b0) auto-selecciona el "dialecto XML de tool" entrenado del modelo, lo que indica soporte nativo para herramientas.
- Modo de razonamiento ("thinking"): el modelo dispone de un modo de pensamiento que se puede activar o desactivar con `--think`. El autor recomienda desactivarlo para uso agéntico, ya que con thinking activado el modelo falla tests ocultos que sí pasa con thinking desactivado.
- Decodificación especulativa: gracias al head MTP conservado, el motor q27 puede usar su "escalera especulativa" para acelerar la generación.
- Capacidades multilingües: no disponibles en la información.

## Casos de uso

- Agentes autónomos con tool calling: el modelo soporta un dialecto XML de herramientas y el motor q27 lo selecciona automáticamente. Es adecuado para construir agentes que necesitan razonar y ejecutar acciones externas, con la recomendación de desactivar el modo thinking (`--think`) para evitar fallos en tests ocultos.
- Generación de código en entornos con VRAM limitada: los tiers q4s (15.70 GB) y default (17.00 GB) caben en GPUs de 24 GB, permitiendo ejecutar un modelo de 27B con calidad razonable (HumanEval+ 30/30 en ambos) para asistencia de programación o autocompletado.
- Razonamiento matemático y lógico: el modelo base Qwen3 es conocido por su rendimiento en matemáticas; la cuantización preserva las capacidades, y los tiers q6 (19.76 GB) y q6k (22.52 GB) ofrecen menor perplejidad para tareas que requieren precisión.
- Procesamiento de contexto largo: las pruebas de needle-in-haystack muestran éxito 6/6 a ~120K tokens en los tiers q4s y default (con KV en fp8), lo que permite analizar documentos extensos, resumir informes o mantener conversaciones de largo recorrido.
- Despliegue en servidores de inferencia con motor q27: el formato `.q27` está optimizado para el motor q27, que soporta decodificación especulativa y gestión de contexto largo. Es adecuado para entornos de producción que ya usan este motor.
- Evaluación y experimentación con cuantización: los tiers proporcionan una gama de trade-offs entre tamaño y calidad (PPL wikitext desde 7.1718 hasta 7.3765), útil para investigadores que quieran estudiar el impacto de la cuantización en tareas específicas.

## Benchmarks y rendimiento

La model card proporciona resultados de perplejidad en wikitext y HumanEval+ para cada tier, junto con los tamaños de archivo. También se mencionan pruebas de needle-in-haystack (éxito 6/6 a ~120K tokens en q4s y default, ~100K en q6, ~40K en q6k, con KV fp8). No hay comparación con otros modelos.

| Tier | Archivo | Tamano (GB) | Wikitext PPL | HumanEval+ |
|---|---|---|---|---|
| q4s (v2) | `qwen38-27b-mtp-q4s.q27` | 15.70 | 7.3765 | 30/30 |
| default (v2) | `qwen38-27b-mtp.q27` | 17.00 | 7.3121 | 30/30 |
| q6 (v2) | `qwen38-27b-mtp-q6.q27` | 19.76 | 7.2233 | 28/30 |
| q6k (v2) | `qwen38-27b-mtp-q6k.q27` | 22.52 | 7.1718 | 29/30 |

Nota: los resultados de HumanEval+ se expresan como "X/30" (número de casos superados sobre 30), según la model card.

## Requisitos de hardware

- VRAM estimada: los archivos `.q27` ocupan entre 15.70 GB y 22.52 GB. Para inferencia se necesita VRAM suficiente para el modelo más el contexto y los KV cache. Con fp8 KV, los tiers q4s y default caben en GPUs de 24 GB; q6 también cabe en 24 GB con contexto más ajustado; q6k requiere al menos 32 GB.
- GPUs recomendadas: las pruebas del autor se realizaron en una RTX 5090 (sm_120). Para los tiers más pequeños, GPUs como RTX 4090 (24 GB) o RTX 5090 son adecuadas; para q6k, se recomienda una GPU de 32 GB o más (por ejemplo, A100 40GB o similar).
- Opciones de despliegue: el formato `.q27` es específico del motor q27 (https://github.com/signalnine/q27). No es compatible directamente con vLLM, llama.cpp u Ollama sin conversión previa. El motor q27 debe compilarse con soporte para la arquitectura de la GPU.
- Latencia y throughput: no se proporcionan datos numéricos. El motor q27 implementa decodificación especulativa gracias al head MTP, lo que debería reducir la latencia respecto a la decodificación autorregresiva estándar, pero no se cuantifica en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo se posiciona como una cuantización específica de Qwen3.8-27B, y las únicas comparaciones internas son entre sus propios tiers. Para una comparativa con otras cuantizaciones de Qwen3.8-27B (por ejemplo, en GGUF o AWQ), sería necesario consultar benchmarks externos, no disponibles aquí.

## Limitaciones y advertencias

- Formato propietario: los pesos `.q27` solo pueden ejecutarse con el motor q27, lo que limita la portabilidad a otros frameworks de inferencia.
- Requiere configuración específica para uso agéntico: el autor recomienda desactivar el modo thinking (`--think`) en escenarios agénticos, ya que con thinking activado el modelo falla tests ocultos. Esto sugiere que el comportamiento del modelo es sensible a la configuración.
- Recetas de cuantización específicas del checkpoint: las recetas v2 se derivaron para este modelo concreto; las de Qwen3.6 no funcionan y pueden degradar el rendimiento (aumento de PPL). No se garantiza que las recetas v2 funcionen en otros checkpoints.
- Canonicals de cambio: los hashes md5 canónicos de cada tier "gatean el cambio, no la identidad", por lo que tiers cercanos pueden compartir trayectorias en algunos prompts. Esto puede complicar la verificación de integridad en entornos de producción.
- Sin datos de sesgos ni alucinaciones: la model card no proporciona información sobre sesgos, riesgos de alucinación o limitaciones idiomáticas. Como modelo derivado de Qwen3, puede heredar sesgos del entrenamiento original, pero no se documentan aquí.
- Repositorio sin descargas ni verificación comunitaria: el modelo tiene 0 descargas y 0 likes, y el tamaño del repo se indica como 0.0 GB (posiblemente los archivos aún no se han subido o el repo está vacío). Esto implica que no hay validación externa del funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/signalnine/Qwen3.8-27B-MTP-q27
- Motor q27: https://github.com/signalnine/q27
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
