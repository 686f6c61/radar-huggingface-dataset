# diablomike20/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una compilación no censurada del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario diablomike20 (con material de AtomicChat) en formato GGUF para llama.cpp. El modelo base es un Mixture of Experts (MoE) de 26.400 millones de parámetros totales y 3.400 millones activos, con núcleo "looped" (capas reutilizadas en varias pasadas), entrada multimodal de texto e imagen y licencia Apache-2.0. Esta versión elimina la dirección de rechazo del modelo original mediante un adaptador LoRA de rango 1 aplicado sobre las 49 proyecciones que escriben en el flujo residual.

La relevancia de esta ficha es doble: por un lado documenta un modelo multimodal MoE de tamano medio con arquitectura poco habitual (núcleo con bucles y pesos compartidos entre pasadas); por otro, ilustra una tecnica de "ablación de rechazo" (refusal direction removal) medida con KLD y top-1 frente al BF16 original, algo poco frecuente en adaptadores de este tipo. El repositorio incluye tres GGUF ya fusionados (Q4_K, IQ3_S, IQ2_M) y un adaptador LoRA que puede aplicarse sobre cualquier GGUF del repositorio base.

El modelo se distribuye exclusivamente en cuantizaciones GGUF para llama.cpp (a partir de la build b12600, que soporta la arquitectura "Inkling 2 loop" del PR #32694). No se han publicado idiomas soportados ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las unicas metricas publicadas son las de fidelidad de cuantizacion (KLD, top-1) y las de eliminación de rechazos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con nucleo "looped" (24 capas, 12 de ellas reutilizadas en tres pasadas); vision projector multimodal |
| Parametros totales | 26.070.385.152 (26,4 B) |
| Parametros activos | 3,4 B (MoE) |
| Longitud de contexto | 32.768 tokens en los ejemplos de llama-server (`-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K, IQ3_S, IQ2_M (GGUF fusionados); LoRA en GGUF de BF16 a 1-bit; proyector vision F16/BF16 |
| Idiomas soportados | no disponible (la model card menciona evaluaciones en ingles y ruso, pero no declara lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); LoRA en GGUF; safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts de 26,4 B de parámetros totales con 3,4 B activos por token. La innovación estructural es el "looped core": de las 24 capas, 12 comparten pesos y se ejecutan en tres pasadas, de modo que el modelo realiza 48 pasadas efectivas por el subconjunto compartido. Esto reduce el coste de memoria frente a un transformer denso equivalente manteniendo profundidad efectiva. El modelo acepta entrada de texto e imagen (pipeline `image-text-to-text`) mediante un proyector de visión separado que se distribuye como `mmproj`.

El entrenamiento del modelo base no está documentado en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí está documentado es la intervención de esta compilación: un LoRA de rango 1 sobre las 49 proyecciones que escriben en el flujo residual (salida de atención y expertos enrutados de las 24 capas, más el embedding de tokens). Como las 12 capas con bucle comparten pesos, una sola edición cubre las 48 pasadas. La dirección de rechazo se calcula como la diferencia entre medias de activaciones en prompts dañinos y benignos (inglés y ruso), proyectando fuera la media benigna y agrupando prompts con y sin razonamiento. El autor indica que el modelo razona incluso con `effort=none` y decide rechazar dentro de su razonamiento, por lo que la dirección se toma considerando ambos modos.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 32.768 tokens en la configuración de ejemplo.
- Razonamiento explícito con niveles de esfuerzo configurables (`none`, `low`, `high`) y presupuesto de tokens de razonamiento (evaluado con 3.072 tokens).
- Entrada de imagen (image-text-to-text) mediante el proyector de visión incluido.
- Capacidades multilingües parciales: la model card documenta evaluaciones en inglés y ruso, sin lista oficial de idiomas.
- Conversación sin rechazos en las categorías evaluadas (conductas dañinas de mlabonne/harmful_behaviors y su traducción al ruso), con 0 rechazos en XSTest tras el adaptador.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y con llama.cpp/llama-server.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el par original/adaptado permite estudiar empíricamente cómo una dirección de rechazo de rango 1 afecta al comportamiento, con métricas de KLD y top-1 frente al BF16 para aislar el efecto de la cuantización del efecto del adaptador.
- Despliegue local en estación de trabajo: el GGUF IQ2_M (8,67 GB) permite ejecutar un MoE de 26,4 B con 3,4 B activos en GPUs de consumo, manteniendo un 85,7% de top-1 frente al BF16 original.
- Evaluación de robustez multilingüe: los conjuntos de prompts dañinos en inglés y ruso permiten medir la transferencia de la eliminación de rechazos entre idiomas, útil para estudiar cómo se generalizan las direcciones de activación.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text con proyector F16 permite describir, resumir o extraer información de capturas y figuras en un flujo local sin conexión.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa con temáticas sensibles, donde el modelo original rechazaría; el adaptador reduce a 0 los rechazos en las pruebas del autor.
- Prototipado de asistentes conversacionales con razonamiento controlado: los niveles `effort` permiten ajustar latencia y profundidad de razonamiento según la tarea, con presupuesto de tokens acotado.
- Análisis de sesgos y refusal behavior en modelos MoE: comparar la tasa de rechazo (100% en inglés, 91% en ruso en el original) con la del adaptado (0%) ofrece un caso de estudio reproducible con datos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas publicadas son de fidelidad de cuantización y de comportamiento de rechazo:

| Metrica | Original | Con adaptador | Umbral |
|---|---:|---:|---|
| KLD a BF16, AD-Q4_K (16,53 GB) | 0,0080 | 0,0115 | — |
| Top-1 vs BF16, AD-Q4_K | 96,3% | 95,6% | — |
| KLD a BF16, AD-IQ3_S (13,34 GB) | 0,0205 | 0,0235 | — |
| Top-1 vs BF16, AD-IQ3_S | 94,2% | 93,8% | — |
| KLD a BF16, AD-IQ2_M (8,67 GB) | 0,130 | 0,132 | — |
| Top-1 vs BF16, AD-IQ2_M | 85,7% | 85,7% | — |
| Rechazos en test dañino inglés (81) | 81 (100%) | 0 | ≤3% |
| Rechazos en test dañino ruso (100) | 91 (91%) | 0 | ≤3% |
| Rechazos en validación dañina EN/RU (104/100) | 100% / 89% | 0 / 0 | ≤3% |
| Rechazos con razonamiento, effort low (30) | 28 | 0 | ≤1 |
| Rechazos con razonamiento, effort high (30) | 26 | 0 | ≤1 |
| Rechazos en XSTest benignos (250) | 10 (4,0%) | 0 | ≤ original + 1 pt |
| Respuestas vacías | 0 | 0 | ≤1% |

Las mediciones se realizaron con decodificación greedy sobre el BF16 con y sin adaptador; el corpus de KLD son 87 fragmentos de 4.096 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8,7 GB para IQ2_M, ~13,3 GB para IQ3_S, ~16,5 GB para Q4_K, más ~0,64 GB del proyector de visión y el overhead de contexto KV.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K con contexto largo; RTX 3090/4080 (16-24 GB) para IQ3_S; GPUs de 12 GB para IQ2_M. Para A100/H100 el modelo es pequeño y el cuello de botella será el ancho de banda, no la VRAM.
- Cabe en GPU de consumo: sí, desde 12 GB con IQ2_M; 16 GB con IQ3_S; 24 GB con Q4_K.
- Opciones de despliegue: llama.cpp (build b12600 o superior, con soporte de la arquitectura "Inkling 2 loop" del PR #32694) mediante `llama-server`; no se documenta soporte en vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. Al ser un MoE con 3,4 B activos, el coste por token es bajo en cómputo, pero no se publican cifras de tokens/s.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables (benchmarks estandar) para situar este modelo frente a alternativas. La comparación se limita a características estructurales:

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (este) | 26,4 B / 3,4 B (MoE, looped) | 32.768 en ejemplo | Apache-2.0 | GGUF |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 B / 3,4 B (MoE, looped) | no disponible | Apache-2.0 | safetensors (BF16) |
| AtomicChat/Inkling-2-Mini-GGUF | 26,4 B / 3,4 B (MoE, looped) | no disponible | Apache-2.0 | GGUF (sin edición) |

No se identifican en la información disponible otros modelos de la misma categoría (MoE multimodal con núcleo en bucle) para una comparación de rendimiento fiable.

## Limitaciones y advertencias

- El adaptador elimina deliberadamente el comportamiento de rechazo: no es adecuado para aplicaciones donde se requiera moderación de contenido o cumplimiento de políticas de seguridad.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de veracidad ni de MMLU en esta compilación.
- La evaluación de rechazos se limita a inglés y ruso y a los conjuntos citados; la generalización a otros idiomas o categorías de daño no está medida.
- El autor reporta que el modelo razona incluso con `effort=none` y decide rechazar dentro del razonamiento; con `effort=high` y presupuesto de 3.072 tokens, algunos prompts benignos no cierran el razonamiento a tiempo (dato truncado en la model card).
- Dependencia estricta de la versión de llama.cpp: los GGUF actuales requieren la build b12600 o superior (PR #32694); mezclar ficheros del layout antiguo (PR #32695) con la implementación nueva produce resultados incorrectos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.
- Contexto nativo del modelo base no declarado: los 32.768 tokens son la configuración de ejemplo, no necesariamente el máximo soportado.
- Sin datos de sesgos demográficos ni de rendimiento por idioma más allá del binomio inglés/ruso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diablomike20/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF base de AtomicChat: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- Guía de ejecución local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-uncensored-locally
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X (Twitter) de Atomic Chat: https://x.com/atomic_chat_hq
- PR de llama.cpp con la arquitectura Inkling 2 loop: https://github.com/ggml-org/llama.cpp/pull/32694
- PR antiguo de llama.cpp (layout no compatible): https://github.com/ggml-org/llama.cpp/pull/32695
- Dataset de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset XSTest: https://huggingface.co/datasets/walledai/XSTest
