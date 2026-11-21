# janghaneul/Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF

## Resumen

Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF es una cuantización GGUF de Qwen3.8-Flash-Next, un modelo de lenguaje de arquitectura MoE desarrollado por el equipo Qwen (Alibaba). El trabajo de cuantización lo firma el usuario janghaneul, que publica dos variantes de compresión orientadas a inferencia local de modelos MoE en llama.cpp y motores derivados, con una receta propia denominada AD-5.00bpw-Q5_K_M. El modelo base cuenta con 176.943.899.520 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los modelos masivos con enrutamiento disperso.

La relevancia de esta ficha no está en el modelo original, sino en la estrategia de asignación de bits: el autor concentra la precisión en los expertos de puerta y subida (gate/up), que identifica como el grupo que determina la calidad, mientras degrada deliberadamente los expertos de bajada a IQ4_NL y mantiene atención, expertos compartidos, embeddings y la tabla PLE n-gram en Q8_0. Es un caso práctico de cuantización guiada por medición, con pruebas sobre 161 problemas de código ejecutable en MultiPL-E humaneval-cpp y 5 ejecuciones por variante.

El resultado son dos builds de tres shards cada uno, con 119,05 GiB y 109,78 GiB en disco, y una huella residente de 68,37 GiB y 59,11 GiB respectivamente cuando el motor hace streaming de la tabla n-gram. La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención, GDN (ssm_out), expertos compartidos y tabla PLE n-gram; detalles completos del modelo base no disponibles |
| Parametros totales | 176.943.899.520 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K, IQ3_S, IQ2_S, IQ4_NL, Q8_0, F32/F16, BF16 (tensores hc_*) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF dividido en 3 shards |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), según se deduce de los nombres de tensores presentes en la cuantización: `ffn_gate_exps`, `ffn_up_exps` y `ffn_down_exps` para los expertos enrutados, `attn_qkv` y `attn_gate` para la atención, `ssm_out` para una capa de tipo GDN (atención lineal con estado), expertos compartidos, y una tabla `per_layer_token_embd` que el autor describe como tabla PLE n-gram de acceso aleatorio. También aparecen tensores `hc_*` (hyper-connection), que en el build Q4_K se mantienen en BF16 tras la actualización del 12 de noviembre de 2026. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica relevante está en la cuantización, no en el entrenamiento. El autor parte de la receta AD-5.00bpw-Q5_K_M y sustituye únicamente los tensores gate/up de los expertos: en el build Q4_K, los 96 tensores gate/up pasan a Q4_K, lo que según sus pruebas internas eliminó todos los errores restantes a cambio de 15,3 GiB adicionales. Los expertos de bajada quedan en IQ4_NL porque `moe_intermediate_size=640` no es divisible por 256 y los tipos de bloque 256 caen en fallback. La tabla PLE n-gram se mantiene en Q8_0 porque carece de estadísticas de imatrix y cuantizarla por debajo de ~5 bpw degrada el comportamiento de recuperación. Los tensores no expertos (atención, GDN, embeddings) se mantienen en Q8_0, unos 5 GiB en total, como seguro de calidad.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag `conversational` está presente.
- Razonamiento y código: el autor valida la calidad con MultiPL-E humaneval-cpp, lo que indica competencia en generación de código ejecutable.
- Mezcla de expertos con enrutamiento disperso: 176,9 mil millones de parámetros totales distribuidos en 48 capas de expertos de bajada.
- Capacidad de recuperación mediante tabla PLE n-gram de acceso aleatorio, mantenida en Q8_0 para preservar el comportamiento de retrieval.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card incluye texto en inglés y coreano, pero no se declara cobertura de idiomas.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de gran tamaño en estaciones de trabajo con 64-96 GB de RAM: el build IQ2_S-IQ3_S-Q4_K deja 59,11 GiB residentes con la tabla PLE en streaming, lo que permite ejecutarlo en máquinas que no podrían cargar el modelo completo.
- Generación de código en pipelines internos: el autor valida el build con MultiPL-E humaneval-cpp sobre 161 problemas y 5 ejecuciones, de modo que es adecuado para tareas de completado y síntesis de código donde se prioriza la corrección ejecutable.
- Asistentes conversacionales de contexto largo: la arquitectura incluye atención y capas GDN, y la tabla PLE n-gram favorece la recuperación de patrones, útil en diálogos multi-turno con historial extenso.
- Despliegue con llama.cpp y motores compatibles (Strata): los GGUF de tres shards están pensados para estos runtimes, lo que facilita integrarlos en herramientas de línea de comandos y servidores locales.
- Experimentación en investigación sobre cuantización: los dos builds permiten comparar el efecto de asignar bits a gate/up frente a down, con métricas publicadas y diferencias de tamaño documentadas.
- Servicio de inferencia con requisitos de memoria ajustados: el build Q4_K, con 68,37 GiB residentes, es la opción de mayor calidad cuando se dispone de RAM suficiente, mientras que el build lean reduce 9,26 GiB a costa de degradar 12 capas de gate/up.
- Evaluación comparativa de recetas de cuantización: la model card documenta la sustitución de la receta AD-5.00 y el cambio de hc_* de Q8_0 a BF16, lo que sirve como referencia reproducible para otros equipos.

## Benchmarks y rendimiento

La model card no publica una tabla de benchmarks estándar (MMLU, GSM8K, HumanEval) con puntuaciones numéricas. El autor menciona una evaluación interna sobre 6 variantes de cuantización × 161 problemas × 5 ejecuciones con puntuación ejecutable en MultiPL-E humaneval-cpp, y afirma que la asignación de gate/up a Q4_K quedó en la parte alta del grupo y eliminó todos los errores restantes, pero no se incluyen las cifras concretas.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM para el build Q4_K: 119,05 GiB en disco, 68,37 GiB residentes con la tabla PLE en streaming.
- VRAM/RAM para el build IQ2_S-IQ3_S-Q4_K: 109,78 GiB en disco, 59,11 GiB residentes con la tabla PLE en streaming.
- Tamaño del repositorio completo: 320,5 GB, ya que incluye ambos builds y sus shards.
- GPU recomendadas: no disponibles en la información proporcionada. Por volumen de memoria, requiere GPU de centro de datos con 80 GB (A100, H100) o configuraciones multi-GPU; no cabe en GPU de consumo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en modelos similares; la huella residente mínima documentada es de 59,11 GiB.
- Opciones de despliegue: llama.cpp y motores derivados (Strata), según la model card; vLLM, TGI u Ollama no se mencionan.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-AD-gateup (este) | 176,9 B | no disponible | GGUF Q4_K / IQ2_S-IQ3_S-Q4_K | qwen-community-1.0 | Hugging Face, 785 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9 B | no disponible | safetensors originales | qwen-community-1.0 | Hugging Face |
| AtomicChat AD-5.00bpw-Q5_K_M | 176,9 B | no disponible | GGUF Q5_K_M | no disponible | referenciado en la model card |
| ISTA GSQ / agention Gyro | 176,9 B | no disponible | asignaciones propias | no disponible | referenciados como comparación de asignación |

La comparación con modelos de otros fabricantes no está disponible en la información proporcionada. Las alternativas identificables son otras cuantizaciones del mismo modelo base, no modelos distintos.

## Limitaciones y advertencias

- Licencia qwen-community-1.0: es una licencia comunitaria con condiciones específicas; conviene revisar el texto enlazado antes de cualquier uso comercial.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones de fidelidad publicadas.
- Idiomas soportados: no declarados; no se puede asumir cobertura multilingüe.
- Longitud de contexto: no disponible; condiciona el diseño de aplicaciones con historial largo.
- Cuantización agresiva: el build lean degrada 12 capas de gate/up y cuatro capas (32, 34, 36, 39) a IQ2_S, lo que puede afectar a la calidad en tareas distintas de las evaluadas.
- Validación limitada a código: las pruebas del autor se centran en MultiPL-E humaneval-cpp; no hay evidencia publicada sobre razonamiento, matemáticas o multilingüismo.
- Requisitos de memoria elevados: 59-68 GiB residentes mínimos, fuera del alcance de GPU de consumo.
- Streaming de la tabla PLE: requiere un motor que soporte acceso aleatorio a la tabla desde disco; sin esa función, la huella de memoria crece hasta el tamaño total del build.
- Repositorio de 320,5 GB: la descarga y el almacenamiento son costosos; el autor advierte de que las actualizaciones pueden requerir re-descargar shards concretos.
- Fecha de creación futura (2026-11-07): los datos de la ficha proceden de la model card y no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janghaneul/Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
